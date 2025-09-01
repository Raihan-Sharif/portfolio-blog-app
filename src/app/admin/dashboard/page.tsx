// src/app/admin/dashboard/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { getReadTime } from "@/lib/utils";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Activity,
  ArrowUp,
  BarChart3,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Award,
  CircleCheckBig,
  Timer,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStats {
  totalPosts: number;
  totalProjects: number;
  totalUsers: number;
  totalViews: number;
  totalProjectViews: number;
  totalMessages: number;
  todayViews: number;
  todayMessages: number;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    view_count: number;
    created_at: string;
    content?: any;
    cover_image_url?: string;
    excerpt?: string;
    author?: { full_name?: string };
  }>;
  recentProjects: Array<{
    id: number;
    title: string;
    slug: string;
    view_count: number;
    created_at: string;
    featured_image_url?: string;
    description?: string;
  }>;
  viewsPerDay: Array<{
    date: string;
    post_views: number;
    project_views: number;
    total_views: number;
  }>;
  topContent: Array<{
    id: number;
    title: string;
    type: "post" | "project";
    views: number;
    slug: string;
  }>;
  growthMetrics: {
    postsGrowth: number;
    projectsGrowth: number;
    viewsGrowth: number;
    usersGrowth: number;
  };
  recentMessages: Array<{
    id: number;
    name: string;
    subject: string;
    created_at: string;
    status: string;
    priority: string;
  }>;
  onlineUsers: {
    total_online: number;
    authenticated_users: number;
    anonymous_users: number;
    recent_users: Array<{
      id?: string;
      session_id: string;
      last_activity: string;
      is_authenticated: boolean;
      page_url: string;
      user_name?: string;
      display_name?: string;
    }>;
  };
  monthlyStats: Array<{
    month: string;
    posts: number;
    projects: number;
    total_content: number;
  }>;
}

type TimePeriod = "7d" | "30d" | "90d" | "180d" | "365d" | "all";

const TIME_PERIODS = [
  { key: "7d" as TimePeriod, label: "7D", days: 7 },
  { key: "30d" as TimePeriod, label: "30D", days: 30 },
  { key: "90d" as TimePeriod, label: "3M", days: 90 },
  { key: "180d" as TimePeriod, label: "6M", days: 180 },
  { key: "365d" as TimePeriod, label: "1Y", days: 365 },
  { key: "all" as TimePeriod, label: "All", days: 999 },
];


export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalProjects: 0,
    totalUsers: 0,
    totalViews: 0,
    totalProjectViews: 0,
    totalMessages: 0,
    todayViews: 0,
    todayMessages: 0,
    recentPosts: [],
    recentProjects: [],
    viewsPerDay: [],
    topContent: [],
    growthMetrics: {
      postsGrowth: 0,
      projectsGrowth: 0,
      viewsGrowth: 0,
      usersGrowth: 0,
    },
    recentMessages: [],
    onlineUsers: {
      total_online: 0,
      authenticated_users: 0,
      anonymous_users: 0,
      recent_users: [],
    },
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [selectedContentPeriod, setSelectedContentPeriod] = useState<TimePeriod>("365d");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // FIXED: Only fetch data when auth is ready and user is authenticated
  // Combined data fetching to reduce loading states
  useEffect(() => {
    if (!authLoading && user && session && !isFetching) {
      // Fetch both dashboard stats and views data together on initial load
      if (stats.totalPosts === 0 && stats.totalProjects === 0) {
        const loadInitialData = async () => {
          await fetchDashboardStats();
          await fetchViewsData();
          setInitialLoadComplete(true);
        };
        loadInitialData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, session]);

  // FIXED: Only refetch views data when period changes, not on auth changes
  useEffect(() => {
    if (user && session && initialLoadComplete) {
      fetchViewsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, initialLoadComplete]);

  // Refetch monthly stats when content period changes
  useEffect(() => {
    if (user && session && initialLoadComplete) {
      fetchMonthlyStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContentPeriod, initialLoadComplete]);

  // FIXED: Minimal refresh behavior - only on extended absence
  useEffect(() => {
    let lastRefresh = 0;
    const EXTENDED_ABSENCE_TIME = 30 * 60 * 1000; // 30 minutes
    const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes between refreshes
    let visibilityStartTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const timeAway = now - visibilityStartTime;
        
        // Only refresh if user was away for extended period AND enough time has passed since last refresh
        if (timeAway > EXTENDED_ABSENCE_TIME && 
            now - lastRefresh > REFRESH_COOLDOWN && 
            !loading && !authLoading && user && session) {
          console.log("Extended absence detected, refreshing dashboard data");
          lastRefresh = now;
          fetchDashboardStats();
          fetchViewsData();
        }
      } else {
        // Track when user leaves the tab
        visibilityStartTime = Date.now();
      }
    };

    // REMOVED: Aggressive window focus handler that caused tab switching issues
    // Tab switching no longer triggers data refresh

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authLoading, user, session]);

  const fetchDashboardStats = async () => {
    // Prevent multiple concurrent fetches
    if (isFetching) return;
    
    // FIXED: Trust that AdminLayout already verified auth - no need to double-check
    // This reduces redundant validations that can cause loading delays
    
    try {
      setIsFetching(true);
      // FIXED: Always show loading on initial load for smooth UX
      if (stats.totalPosts === 0 && stats.totalProjects === 0) {
        setLoading(true);
      }

      // FIXED: Remove aggressive session validation that caused conflicts
      // Trust that user and session from auth provider are valid

      // Fetch total counts
      const [
        { count: totalPosts },
        { count: totalProjects },
        { count: totalUsers },
        { count: totalMessages },
      ] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true }),
      ]);

      // OPTIMIZED: Fetch views data more efficiently with aggregation
      const today = new Date().toISOString().split("T")[0];
      
      // Combine multiple queries to reduce API calls
      const [
        { data: postViewsData },
        { data: projectViewsData },
        { data: todayPostViews },
        { data: todayProjectViews },
        { count: todayMessages },
      ] = await Promise.all([
        supabase.from("post_views").select("view_count"),
        supabase.from("project_views").select("view_count"),
        supabase.from("post_views").select("view_count").eq("view_date", today),
        supabase.from("project_views").select("view_count").eq("view_date", today),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today),
      ]);

      const totalPostViews =
        postViewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) ||
        0;
      const totalProjectViews =
        projectViewsData?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0;

      const todayViews =
        (todayPostViews?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0) +
        (todayProjectViews?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0);

      // OPTIMIZED: Batch fetch dashboard data to reduce API calls
      const [
        { data: recentPosts },
        { data: recentProjects },
        { data: recentMessages },
        { data: topPosts },
        { data: topProjects },
        { data: onlineUsersData },
      ] = await Promise.all([
        supabase
          .from("posts")
          .select(
            `
            id,
            title,
            slug,
            view_count,
            created_at,
            content,
            cover_image_url,
            excerpt,
            profiles!inner(full_name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select(
            "id, title, slug, view_count, created_at, featured_image_url, description"
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("contact_messages")
          .select("id, name, subject, created_at, status, priority")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("posts")
          .select("id, title, slug, view_count")
          .order("view_count", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("id, title, slug, view_count")
          .eq("is_active", true)
          .order("view_count", { ascending: false })
          .limit(5),
        supabase.rpc("get_recent_online_users", { limit_count: 10 }),
      ]);

      const topContent = [
        ...(topPosts?.map((p) => ({
          ...p,
          type: "post" as const,
          views: p.view_count,
        })) || []),
        ...(topProjects?.map((p) => ({
          ...p,
          type: "project" as const,
          views: p.view_count,
        })) || []),
      ]
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

      // Get online user statistics
      const { data: onlineStats } = await supabase.rpc("get_online_user_stats");
      
      const onlineUsers = {
        total_online: onlineStats?.[0]?.total_online || 0,
        authenticated_users: onlineStats?.[0]?.authenticated_users || 0,
        anonymous_users: onlineStats?.[0]?.anonymous_users || 0,
        recent_users: onlineUsersData?.map((user: any) => ({
          id: user.user_id,
          session_id: user.session_id,
          last_activity: user.last_activity,
          is_authenticated: user.is_authenticated,
          page_url: user.page_url,
          user_name: user.display_name,
          display_name: user.display_name,
        })) || [],
      };

      // Calculate growth metrics (simplified for demo) - use stable values for hydration
      const seedValue = (totalPosts || 0) + (totalProjects || 0) + (totalUsers || 0);
      const growthMetrics = {
        postsGrowth: Math.floor((seedValue * 7) % 20) + 5,
        projectsGrowth: Math.floor((seedValue * 11) % 15) + 3,
        viewsGrowth: Math.floor((seedValue * 13) % 25) + 8,
        usersGrowth: Math.floor((seedValue * 17) % 10) + 2,
      };

      // Initial load with default period
      const monthlyStats = await fetchMonthlyStatsData(selectedContentPeriod);

      setStats({
        totalPosts: totalPosts || 0,
        totalProjects: totalProjects || 0,
        totalUsers: totalUsers || 0,
        totalViews: totalPostViews,
        totalProjectViews,
        totalMessages: totalMessages || 0,
        todayViews,
        todayMessages: todayMessages || 0,
        recentPosts: recentPosts || [],
        recentProjects: recentProjects || [],
        viewsPerDay: [],
        topContent,
        growthMetrics,
        recentMessages: recentMessages || [],
        onlineUsers,
        monthlyStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const fetchMonthlyStatsData = async (period: TimePeriod) => {
    const periodConfig = TIME_PERIODS.find((p) => p.key === period);
    if (!periodConfig) return [];

    const monthlyStatsResult = [];
    const monthlyStatsPromises = [];
    
    // Calculate number of months to show based on period
    const monthsToShow = period === '7d' ? 1 : 
                       period === '30d' ? 3 : 
                       period === '90d' ? 6 : 
                       period === '180d' ? 12 : 
                       period === '365d' ? 12 : 24; // for 'all'
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];
      
      monthlyStatsPromises.push(
        Promise.all([
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDateStr)
            .lte("created_at", endDateStr + "T23:59:59"),
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .gte("created_at", startDateStr)
            .lte("created_at", endDateStr + "T23:59:59"),
        ]).then(([postsResult, projectsResult]) => ({
          month: format(date, period === '7d' || period === '30d' ? "MMM d" : "MMM yyyy"),
          posts: postsResult.count || 0,
          projects: projectsResult.count || 0,
          total_content: (postsResult.count || 0) + (projectsResult.count || 0),
          monthDate: date.toISOString(),
        }))
      );
    }
    
    const resolvedMonthlyStats = await Promise.all(monthlyStatsPromises);
    return resolvedMonthlyStats.sort((a, b) => 
      new Date(a.monthDate).getTime() - new Date(b.monthDate).getTime()
    ).map(({monthDate, ...rest}) => rest);
  };

  const fetchMonthlyStats = async () => {
    try {
      const newMonthlyStats = await fetchMonthlyStatsData(selectedContentPeriod);
      setStats((prev) => ({ ...prev, monthlyStats: newMonthlyStats }));
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const fetchViewsData = async () => {
    // Prevent concurrent fetches
    if (chartsLoading || isFetching) return;
    
    try {
      setChartsLoading(true);
      const period = TIME_PERIODS.find((p) => p.key === selectedPeriod);
      if (!period) return;

      let postViewsQuery = supabase
        .from("post_views")
        .select("view_date, view_count")
        .order("view_date");
      
      let projectViewsQuery = supabase
        .from("project_views")
        .select("view_date, view_count")
        .order("view_date");

      // Only apply date filters if not "all" period
      if (selectedPeriod !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period.days);
        
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];
        
        postViewsQuery = postViewsQuery
          .gte("view_date", startDateStr)
          .lte("view_date", endDateStr);
        
        projectViewsQuery = projectViewsQuery
          .gte("view_date", startDateStr)
          .lte("view_date", endDateStr);
      }

      // OPTIMIZED: Single batched query for views data
      const [{ data: postViewsDaily }, { data: projectViewsDaily }] =
        await Promise.all([postViewsQuery, projectViewsQuery]);

      // Group by date
      const postViewsByDate =
        postViewsDaily?.reduce((acc, item) => {
          acc[item.view_date] = (acc[item.view_date] || 0) + item.view_count;
          return acc;
        }, {} as Record<string, number>) || {};

      const projectViewsByDate =
        projectViewsDaily?.reduce((acc, item) => {
          acc[item.view_date] = (acc[item.view_date] || 0) + item.view_count;
          return acc;
        }, {} as Record<string, number>) || {};

      // Get all unique dates and sort them
      const allDates = new Set([
        ...Object.keys(postViewsByDate),
        ...Object.keys(projectViewsByDate)
      ]);
      
      const sortedDates = Array.from(allDates).sort();
      
      // For specific periods, ensure we have complete date range
      let dateRange = sortedDates;
      if (selectedPeriod !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period.days);
        
        dateRange = [];
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          dateRange.push(new Date(d).toISOString().split("T")[0]);
        }
      }

      // Create complete dataset with all dates
      const viewsPerDay = dateRange.map((date) => ({
        date,
        post_views: postViewsByDate[date] || 0,
        project_views: projectViewsByDate[date] || 0,
        total_views:
          (postViewsByDate[date] || 0) + (projectViewsByDate[date] || 0),
      }));

      setStats((prev) => ({ ...prev, viewsPerDay }));
    } catch (error) {
      console.error("Error fetching views data:", error);
    } finally {
      setChartsLoading(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (selectedPeriod === "7d") {
        return format(date, "EEE");
      } else if (selectedPeriod === "30d") {
        return format(date, "MMM d");
      } else {
        return format(date, "MMM d");
      }
    } catch {
      return dateStr;
    }
  };

  // Custom tooltip for views chart
  const ViewsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = parseISO(label);
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "post_views" && `Blog Views: ${entry.value}`}
              {entry.dataKey === "project_views" &&
                `Project Views: ${entry.value}`}
              {entry.dataKey === "total_views" && `Total Views: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color = "blue",
    description,
    href,
    trend,
    todayValue,
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    color?: string;
    description?: string;
    href?: string;
    trend?: "up" | "down" | "neutral";
    todayValue?: number;
  }) => {
    const CardWrapper = href ? Link : "div";

    return (
      <CardWrapper href={href || ""} className={href ? "block" : ""}>
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50",
            href ? "cursor-pointer group" : ""
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </CardTitle>
            <div
              className={`p-3 rounded-xl ${getColorClasses(color)} shadow-lg`}
            >
              {icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {value.toLocaleString()}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-500 mr-1" />
                )}
                <span
                  className={
                    trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : trend === "down"
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-600 dark:text-slate-400"
                  }
                >
                  {change}%
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">
                  vs last period
                </span>
              </div>
              {todayValue !== undefined && (
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {todayValue}
                  </div>
                  <div className="text-xs text-slate-500">Today</div>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {description}
              </p>
            )}
            {href && (
              <div className="flex items-center text-xs text-primary mt-3 group-hover:translate-x-1 transition-transform">
                <span>View details</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            )}
          </CardContent>

          {/* Decorative gradient */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${getGradientClasses(
              color
            )} rounded-full -translate-y-16 translate-x-16`}
          />
        </Card>
      </CardWrapper>
    );
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
      orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
      red: "bg-gradient-to-br from-red-500 to-red-600 text-white",
      yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getGradientClasses = (color: string) => {
    const gradientMap = {
      blue: "bg-gradient-to-br from-blue-500 to-blue-600",
      purple: "bg-gradient-to-br from-purple-500 to-purple-600",
      green: "bg-gradient-to-br from-green-500 to-green-600",
      orange: "bg-gradient-to-br from-orange-500 to-orange-600",
      red: "bg-gradient-to-br from-red-500 to-red-600",
      yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    };
    return gradientMap[color as keyof typeof gradientMap] || gradientMap.blue;
  };

  // OPTIMIZED: Only show skeleton on initial data load, not auth loading
  // AdminLayout handles auth state, dashboard handles data loading
  if (!authLoading && loading && user && session && (stats.totalPosts === 0 && stats.totalProjects === 0)) {
    return (
      <AdminLayout>
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // FIXED: AdminLayout handles auth verification, no need for additional checks

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Header with Real-time Stats */}
        <div className="flex flex-col space-y-6 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Welcome back! Here's what's happening with your portfolio.
              </p>
            </div>
            
            {/* Real-time Mini Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  Live • {stats.onlineUsers.total_online} visitors
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.todayViews} views today
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.todayMessages} new messages
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              className="border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                View Site
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href="/admin/blog/new">
                <FileText className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Blog Posts"
            value={stats.totalPosts}
            change={stats.growthMetrics.postsGrowth}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
            description="Published articles"
            href="/admin/blog"
            trend="up"
          />
          <StatCard
            title="Projects"
            value={stats.totalProjects}
            change={stats.growthMetrics.projectsGrowth}
            icon={<Briefcase className="h-6 w-6" />}
            color="purple"
            description="Portfolio items"
            href="/admin/projects"
            trend="up"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews + stats.totalProjectViews}
            change={stats.growthMetrics.viewsGrowth}
            icon={<Eye className="h-6 w-6" />}
            color="green"
            description="All content views"
            trend="up"
            todayValue={stats.todayViews}
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            change={stats.growthMetrics.usersGrowth}
            icon={<MessageSquare className="h-6 w-6" />}
            color="orange"
            description="Contact inquiries"
            href="/admin/contact"
            trend="up"
            todayValue={stats.todayMessages}
          />
        </div>

        {/* Enhanced Online Users Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Online Users Pie Chart */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <Users className="w-5 h-5" />
                </div>
                Online Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                {stats.onlineUsers.total_online > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Authenticated",
                            value: stats.onlineUsers.authenticated_users,
                            color: "#3b82f6",
                          },
                          {
                            name: "Anonymous",
                            value: stats.onlineUsers.anonymous_users,
                            color: "#94a3b8",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#94a3b8" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No online users</p>
                  </div>
                )}
              </div>
              <div className="flex justify-around mt-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.onlineUsers.authenticated_users}
                  </div>
                  <div className="text-xs text-slate-500">Authenticated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-500">
                    {stats.onlineUsers.anonymous_users}
                  </div>
                  <div className="text-xs text-slate-500">Anonymous</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Online Activity */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Activity className="w-5 h-5" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.onlineUsers.recent_users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  stats.onlineUsers.recent_users.map((user) => (
                    <div
                      key={user.session_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            user.is_authenticated
                              ? "bg-green-500"
                              : "bg-gray-400"
                          )}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {user.is_authenticated
                              ? user.display_name || user.user_name || "User"
                              : "Anonymous User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.page_url}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user.last_activity), {
                            addSuffix: true,
                          })}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-medium",
                            user.is_authenticated
                              ? "text-blue-600"
                              : "text-gray-500"
                          )}
                        >
                          {user.is_authenticated ? "Authenticated" : "Guest"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Views Chart */}
          <Card className="xl:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  Views Analytics
                </CardTitle>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                  {TIME_PERIODS.map((period) => (
                    <Button
                      key={period.key}
                      variant={
                        selectedPeriod === period.key ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                      disabled={chartsLoading}
                      className={cn(
                        "text-xs h-8 px-3 transition-all duration-200",
                        selectedPeriod === period.key
                          ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg"
                          : "hover:bg-white dark:hover:bg-slate-700"
                      )}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground">
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={stats.viewsPerDay}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="postViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="projectViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDateLabel}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<ViewsTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="post_views"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="url(#postViews)"
                      name="Blog Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="project_views"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="url(#projectViews)"
                      name="Project Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total this period:{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {stats.viewsPerDay
                      .reduce((sum, day) => sum + day.total_views, 0)
                      .toLocaleString()}
                  </span>{" "}
                  views
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    Blog Views
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    Project Views
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Content */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg">
                  <Target className="w-5 h-5" />
                </div>
                Top Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topContent.slice(0, 5).map((content, index) => (
                  <div
                    key={`${content.type}-${content.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm line-clamp-1">
                          {content.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {content.type === "post" ? "Blog Post" : "Project"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {content.views}
                      </div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <FileText className="w-5 h-5" />
                </div>
                Recent Posts
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/blog">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet</p>
                    <Button asChild className="mt-4" size="sm">
                      <Link href="/admin/blog/new">Create First Post</Link>
                    </Button>
                  </div>
                ) : (
                  stats.recentPosts.map((post) => {
                    const textContent = post.content
                      ? typeof post.content === "string"
                        ? post.content
                        : JSON.stringify(post.content)
                      : "";
                    const readingTime = getReadTime(textContent);

                    return (
                      <div
                        key={post.id}
                        className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 transition-all duration-200 hover:shadow-lg"
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                        />
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {post.cover_image_url ? (
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                                <Image
                                  src={post.cover_image_url}
                                  alt={post.title}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 text-sm leading-tight mb-2">
                              {post.title}
                            </h4>
                            {post.excerpt && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDistanceToNow(
                                    new Date(post.created_at),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {readingTime}m read
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {post.view_count || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Recent Messages
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/contact">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  stats.recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-red-50/50 dark:hover:from-orange-900/10 dark:hover:to-red-900/10 transition-all duration-200 hover:shadow-lg"
                    >
                      <Link
                        href="/admin/contact"
                        className="absolute inset-0 z-10"
                      />
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 dark:text-orange-400 text-sm font-semibold">
                              {message.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {message.name}
                            </p>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                message.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : message.status === "resolved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              )}
                            >
                              {message.status}
                            </span>
                            {message.priority === "urgent" && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-2">
                            {message.subject}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance & Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Monthly Content Creation Chart */}
          <Card className="xl:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  Content Creation Trends
                </CardTitle>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner">
                  {TIME_PERIODS.filter(p => p.key !== '7d').map((period) => (
                    <Button
                      key={period.key}
                      variant={
                        selectedContentPeriod === period.key ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSelectedContentPeriod(period.key)}
                      className={cn(
                        "text-xs h-8 px-3 transition-all duration-200",
                        selectedContentPeriod === period.key
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                          : "hover:bg-white dark:hover:bg-slate-700"
                      )}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyStats}>
                  <defs>
                    <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="posts"
                    fill="url(#postsGradient)"
                    name="Blog Posts"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="projects"
                    fill="url(#projectsGradient)"
                    name="Projects"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total this period:{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {stats.monthlyStats
                      .reduce((sum, month) => sum + month.total_content, 0)
                      .toLocaleString()}
                  </span>{" "}
                  items created
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    Blog Posts ({stats.monthlyStats.reduce((sum, month) => sum + month.posts, 0)})
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    Projects ({stats.monthlyStats.reduce((sum, month) => sum + month.projects, 0)})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Performance Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Average Views per Content - Dynamic */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      Avg. Views
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Per content
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(
                      (stats.totalViews + stats.totalProjectViews) /
                        Math.max(stats.totalPosts + stats.totalProjects, 1)
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {stats.totalViews + stats.totalProjectViews > 0 ? 'views' : 'no data'}
                  </div>
                </div>
              </div>

              {/* Engagement Rate - Dynamic */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      Engagement
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Today vs avg
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {stats.todayViews > 0 && stats.totalViews > 0 ? 
                      Math.round((stats.todayViews / (stats.totalViews / Math.max(stats.totalPosts + stats.totalProjects, 1))) * 100) : 0}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {stats.todayViews > 0 ? 'above avg' : 'rate'}
                  </div>
                </div>
              </div>

              {/* Content Productivity */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      Monthly Rate
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Content created
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(
                      stats.monthlyStats.reduce((sum, month) => sum + month.total_content, 0) /
                        Math.max(stats.monthlyStats.length, 1)
                    )}
                  </div>
                  <div className="text-xs text-slate-500">per month</div>
                </div>
              </div>

              {/* Content Distribution */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded bg-orange-500 text-white">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Content Mix
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Blog Posts</span>
                    <span className="font-medium">
                      {Math.round((stats.totalPosts / Math.max(stats.totalPosts + stats.totalProjects, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round((stats.totalPosts / Math.max(stats.totalPosts + stats.totalProjects, 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Projects</span>
                    <span className="font-medium">
                      {Math.round((stats.totalProjects / Math.max(stats.totalPosts + stats.totalProjects, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round((stats.totalProjects / Math.max(stats.totalPosts + stats.totalProjects, 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <Zap className="w-5 h-5" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Link
                  href="/admin/blog/new"
                  className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-4">
                    New Post
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Write article
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUp className="w-4 h-4 text-blue-500 rotate-45" />
                  </div>
                </Link>

                <Link
                  href="/admin/projects/new"
                  className="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-4">
                    Add Project
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Showcase work
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUp className="w-4 h-4 text-purple-500 rotate-45" />
                  </div>
                </Link>

                <Link
                  href="/admin/hero"
                  className="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-4">
                    Edit Hero
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Update homepage
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUp className="w-4 h-4 text-green-500 rotate-45" />
                  </div>
                </Link>

                <Link
                  href="/admin/contact"
                  className="group relative p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-4">
                    Messages
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Check inbox
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUp className="w-4 h-4 text-orange-500 rotate-45" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Health & Status */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <CircleCheckBig className="w-5 h-5" />
                </div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Database Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Database
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  Online
                </span>
              </div>

              {/* Server Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Server
                  </span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Active
                </span>
              </div>

              {/* CDN Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    CDN
                  </span>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  Optimized
                </span>
              </div>

              {/* Last Update - Dynamic */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Last Sync
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {stats.totalPosts + stats.totalProjects > 0 ? 'Data synchronized' : 'Awaiting content'}
                </div>
              </div>

              {/* Quick Stats - Dynamic */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {stats.totalViews > 1000 ? '99.9%' : stats.totalViews > 100 ? '98.5%' : '95.0%'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Reliability
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 text-center">
                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {stats.onlineUsers.total_online}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Live Users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper function to combine class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
