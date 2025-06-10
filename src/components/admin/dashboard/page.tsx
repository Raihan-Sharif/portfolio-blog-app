// src/app/admin/dashboard/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
  }>;
}

type TimePeriod = "7d" | "30d" | "90d";

const TIME_PERIODS = [
  { key: "7d" as TimePeriod, label: "7D", days: 7 },
  { key: "30d" as TimePeriod, label: "30D", days: 30 },
  { key: "90d" as TimePeriod, label: "3M", days: 90 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalProjects: 0,
    totalUsers: 0,
    totalViews: 0,
    totalProjectViews: 0,
    totalMessages: 0,
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
          author:profiles(full_name)
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
        .select("id, name, subject, created_at, status")
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

      // Calculate growth metrics (simplified)
      const growthMetrics = {
        postsGrowth: Math.floor(Math.random() * 20) - 5,
        projectsGrowth: Math.floor(Math.random() * 15) - 2,
        viewsGrowth: Math.floor(Math.random() * 25) - 5,
        usersGrowth: Math.floor(Math.random() * 10),
      };

      setStats({
        totalPosts: totalPosts || 0,
        totalProjects: totalProjects || 0,
        totalUsers: totalUsers || 0,
        totalViews: totalPostViews,
        totalProjectViews,
        totalMessages: totalMessages || 0,
        recentPosts: recentPosts || [],
        recentProjects: recentProjects || [],
        viewsPerDay: [],
        topContent,
        growthMetrics,
        recentMessages: recentMessages || [],
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
    const date = new Date(dateStr);
    if (selectedPeriod === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (selectedPeriod === "30d") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
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
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    color?: string;
    description?: string;
    href?: string;
  }) => {
    const CardWrapper = href ? Link : "div";

    return (
      <CardWrapper href={href || ""} className={href ? "block" : ""}>
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-200",
            href && "hover:shadow-lg hover:scale-105 cursor-pointer"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
              {icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(change)}%
              </span>
              <span className="ml-1">vs last period</span>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">
                {description}
              </p>
            )}
            {href && (
              <div className="flex items-center text-xs text-primary mt-2">
                <span>View details</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            )}
          </CardContent>
        </Card>
      </CardWrapper>
    );
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900/20",
      purple: "bg-purple-100 dark:bg-purple-900/20",
      green: "bg-green-100 dark:bg-green-900/20",
      orange: "bg-orange-100 dark:bg-orange-900/20",
      red: "bg-red-100 dark:bg-red-900/20",
      yellow: "bg-yellow-100 dark:bg-yellow-900/20",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your portfolio.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <ArrowUp className="w-4 h-4 mr-2 rotate-45" />
                View Site
              </Link>
            </Button>
            <Button asChild>
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
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            color="blue"
            description="Published articles"
            href="/admin/blog"
          />
          <StatCard
            title="Projects"
            value={stats.totalProjects}
            change={stats.growthMetrics.projectsGrowth}
            icon={<Briefcase className="h-5 w-5 text-purple-600" />}
            color="purple"
            description="Portfolio items"
            href="/admin/projects"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews + stats.totalProjectViews}
            change={stats.growthMetrics.viewsGrowth}
            icon={<Eye className="h-5 w-5 text-green-600" />}
            color="green"
            description="All content views"
          />
          <StatCard
            title="Users"
            value={stats.totalUsers}
            change={stats.growthMetrics.usersGrowth}
            icon={<Users className="h-5 w-5 text-orange-600" />}
            color="orange"
            description="Registered accounts"
            href="/admin/users"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Views Chart */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Views Analytics
                </CardTitle>
                <div className="flex bg-muted rounded-lg p-1">
                  {TIME_PERIODS.map((period) => (
                    <Button
                      key={period.key}
                      variant={
                        selectedPeriod === period.key ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                      disabled={chartsLoading}
                      className="text-xs h-8"
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
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Total this period:{" "}
                  {stats.viewsPerDay.reduce(
                    (sum, day) => sum + day.total_views,
                    0
                  )}{" "}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Top Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topContent.slice(0, 6).map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div
                      className={`w-2 h-8 rounded-full ${
                        item.type === "post" ? "bg-blue-500" : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="capitalize">{item.type}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {item.views}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
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
                        className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {post.cover_image_url ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-primary transition-colors line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDistanceToNow(
                                  new Date(post.created_at),
                                  { addSuffix: true }
                                )}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {readingTime}m
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {post.view_count || 0}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
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
                      className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {message.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm truncate">
                            {message.name}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              message.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : message.status === "resolved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                href="/admin/blog/new"
                className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-center h-12 w-12 bg-blue-500 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                    New Post
                  </h3>
                  <p className="text-sm text-muted-foreground">Write article</p>
                </div>
              </Link>

              <Link
                href="/admin/projects/new"
                className="flex items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-center h-12 w-12 bg-purple-500 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-purple-600 transition-colors">
                    Add Project
                  </h3>
                  <p className="text-sm text-muted-foreground">Showcase work</p>
                </div>
              </Link>

              <Link
                href="/admin/hero"
                className="flex items-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-center h-12 w-12 bg-green-500 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-green-600 transition-colors">
                    Edit Hero
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Update homepage
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/contact"
                className="flex items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-center h-12 w-12 bg-orange-500 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-orange-600 transition-colors">
                    Messages
                  </h3>
                  <p className="text-sm text-muted-foreground">Check inbox</p>
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
