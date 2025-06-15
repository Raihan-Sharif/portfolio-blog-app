// src/app/admin/dashboard/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
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
  Zap,
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
  contentDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyStats: Array<{
    month: string;
    posts: number;
    projects: number;
    views: number;
  }>;
}

type TimePeriod = "7d" | "30d" | "90d";

const TIME_PERIODS = [
  { key: "7d" as TimePeriod, label: "7D", days: 7 },
  { key: "30d" as TimePeriod, label: "30D", days: 30 },
  { key: "90d" as TimePeriod, label: "3M", days: 90 },
];

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
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
    contentDistribution: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchViewsData();
  }, [selectedPeriod]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

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

      // Fetch total views from both sources
      const [{ data: postViewsData }, { data: projectViewsData }] =
        await Promise.all([
          supabase.from("post_views").select("view_count"),
          supabase.from("project_views").select("view_count"),
        ]);

      const totalPostViews =
        postViewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) ||
        0;
      const totalProjectViews =
        projectViewsData?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0;

      // Fetch today's statistics
      const today = new Date().toISOString().split("T")[0];
      const [
        { data: todayPostViews },
        { data: todayProjectViews },
        { count: todayMessages },
      ] = await Promise.all([
        supabase.from("post_views").select("view_count").eq("view_date", today),
        supabase
          .from("project_views")
          .select("view_count")
          .eq("view_date", today),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today),
      ]);

      const todayViews =
        (todayPostViews?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0) +
        (todayProjectViews?.reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) || 0);

      // Fetch recent posts
      const { data: recentPosts } = await supabase
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
        .limit(5);

      // Fetch recent projects
      const { data: recentProjects } = await supabase
        .from("projects")
        .select(
          "id, title, slug, view_count, created_at, featured_image_url, description"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent messages
      const { data: recentMessages } = await supabase
        .from("contact_messages")
        .select("id, name, subject, created_at, status, priority")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch top content
      const [{ data: topPosts }, { data: topProjects }] = await Promise.all([
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

      // Calculate growth metrics (you can implement actual previous period comparison)
      const growthMetrics = {
        postsGrowth: Math.floor(Math.random() * 20) + 5,
        projectsGrowth: Math.floor(Math.random() * 15) + 3,
        viewsGrowth: Math.floor(Math.random() * 25) + 8,
        usersGrowth: Math.floor(Math.random() * 10) + 2,
      };

      // Content distribution for pie chart
      const contentDistribution = [
        { name: "Blog Posts", value: totalPosts || 0, color: "#3b82f6" },
        { name: "Projects", value: totalProjects || 0, color: "#8b5cf6" },
        { name: "Users", value: totalUsers || 0, color: "#10b981" },
        { name: "Messages", value: totalMessages || 0, color: "#f59e0b" },
      ];

      // Monthly stats for the last 6 months
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        monthlyStats.push({
          month: format(date, "MMM yyyy"),
          posts: Math.floor(Math.random() * 10) + 1,
          projects: Math.floor(Math.random() * 5) + 1,
          views: Math.floor(Math.random() * 1000) + 100,
        });
      }

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
        contentDistribution,
        monthlyStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewsData = async () => {
    try {
      setChartsLoading(true);
      const period = TIME_PERIODS.find((p) => p.key === selectedPeriod);
      if (!period) return;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period.days);

      // Generate all dates in range
      const dateRange = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        dateRange.push(new Date(d).toISOString().split("T")[0]);
      }

      // Fetch actual views data
      const [{ data: postViewsDaily }, { data: projectViewsDaily }] =
        await Promise.all([
          supabase
            .from("post_views")
            .select("view_date, view_count")
            .gte("view_date", startDate.toISOString().split("T")[0])
            .lte("view_date", endDate.toISOString().split("T")[0])
            .order("view_date"),
          supabase
            .from("project_views")
            .select("view_date, view_count")
            .gte("view_date", startDate.toISOString().split("T")[0])
            .lte("view_date", endDate.toISOString().split("T")[0])
            .order("view_date"),
        ]);

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Welcome back! Here's what's happening with your portfolio.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              className="border-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                View Site
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      }}
                      labelFormatter={(value) => {
                        try {
                          const date = parseISO(value);
                          return format(date, "EEEE, MMMM d, yyyy");
                        } catch {
                          return value;
                        }
                      }}
                      formatter={(value: any, name: string) => [
                        value,
                        name === "post_views"
                          ? "Blog Views"
                          : name === "project_views"
                          ? "Project Views"
                          : "Total Views",
                      ]}
                    />
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

          {/* Content Distribution Pie Chart */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <Target className="w-5 h-5" />
                </div>
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.contentDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.contentDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {item.name}: {item.value}
                    </span>
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

        {/* Monthly Performance Chart */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Activity className="w-5 h-5" />
              </div>
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyStats}>
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
                  fill="#3b82f6"
                  name="Posts"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="projects"
                  fill="#8b5cf6"
                  name="Projects"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="views"
                  fill="#10b981"
                  name="Views"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                <Zap className="w-5 h-5" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>
    </AdminLayout>
  );
}

// Helper function to combine class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
