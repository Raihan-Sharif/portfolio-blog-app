// src/app/admin/dashboard/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import EnhancedDashboardAnalytics from "@/components/admin/enhanced-dashboard-analytics";
import HeroPreview from "@/components/admin/hero-preview";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/admin/loading-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase/client";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUp,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  Monitor,
  Plus,
  Server,
  Smartphone,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalPosts: number;
  totalProjects: number;
  totalUsers: number;
  totalViews: number;
  totalProjectViews: number;
  totalMessages: number;
  recentPosts: any[];
  recentProjects: any[];
  recentMessages: any[];
  topContent: any[];
  analytics: {
    viewsToday: number;
    viewsGrowth: number;
    engagement: number;
    conversion: number;
  };
  userActivity: {
    online: number;
    registered: number;
    anonymous: number;
    byCountry: any[];
    byDevice: any[];
  };
  performance: {
    responseTime: number;
    uptime: number;
    errors: number;
    satisfaction: number;
  };
}

type TimePeriod = "7d" | "30d" | "90d";

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  orange: "#f97316",
  green: "#22c55e",
};

const chartColors = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        { count: totalPosts },
        { count: totalProjects },
        { count: totalUsers },
        { count: totalMessages },
        { data: recentPosts },
        { data: recentProjects },
        { data: recentMessages },
        { data: heroData },
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
        supabase
          .from("posts")
          .select(
            `
          id, title, slug, view_count, created_at, content, cover_image_url, excerpt,
          profiles!inner(full_name)
        `
          )
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("hero_settings")
          .select("*")
          .eq("is_active", true)
          .single(),
      ]);

      // Calculate total views
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

      // Mock real-time data (replace with actual WebSocket data in production)
      const mockAnalytics = {
        viewsToday: Math.floor(Math.random() * 200) + 50,
        viewsGrowth: Math.floor(Math.random() * 40) - 10,
        engagement: Math.floor(Math.random() * 30) + 70,
        conversion: Math.floor(Math.random() * 10) + 5,
      };

      const mockUserActivity = {
        online: Math.floor(Math.random() * 50) + 10,
        registered: totalUsers || 0,
        anonymous: Math.floor(Math.random() * 20) + 5,
        byCountry: [
          { name: "Bangladesh", value: 45, flag: "🇧🇩" },
          { name: "USA", value: 25, flag: "🇺🇸" },
          { name: "India", value: 15, flag: "🇮🇳" },
          { name: "UK", value: 10, flag: "🇬🇧" },
          { name: "Others", value: 5, flag: "🌍" },
        ],
        byDevice: [
          { name: "Desktop", value: 60, icon: Monitor },
          { name: "Mobile", value: 35, icon: Smartphone },
          { name: "Tablet", value: 5, icon: Smartphone },
        ],
      };

      const mockPerformance = {
        responseTime: Math.floor(Math.random() * 100) + 50,
        uptime: 99.9,
        errors: Math.floor(Math.random() * 5),
        satisfaction: Math.floor(Math.random() * 20) + 80,
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
        recentMessages: recentMessages || [],
        topContent: [],
        analytics: mockAnalytics,
        userActivity: mockUserActivity,
        performance: mockPerformance,
      });

      setHeroSettings(heroData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color = "blue",
    description,
    href,
    trend = "up",
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ReactNode;
    color?: string;
    description?: string;
    href?: string;
    trend?: "up" | "down" | "neutral";
  }) => {
    const CardWrapper = href ? Link : "div";

    return (
      <CardWrapper href={href || ""} className={href ? "block" : ""}>
        <motion.div
          whileHover={{ scale: href ? 1.02 : 1, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={cn(
              "relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50",
              href ? "hover:shadow-xl cursor-pointer" : ""
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className={`p-2 rounded-lg ${getColorClasses(color)}`}
              >
                {icon}
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              {change !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : trend === "down" ? (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  ) : (
                    <Activity className="w-3 h-3 text-gray-500 mr-1" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend === "up"
                        ? "text-green-600"
                        : trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    )}
                  >
                    {Math.abs(change)}%
                  </span>
                  <span className="ml-1">vs last period</span>
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-2">
                  {description}
                </p>
              )}
              {href && (
                <div className="flex items-center text-xs text-primary mt-2 font-medium">
                  <span>View details</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              )}
            </CardContent>
            {/* Animated background gradient */}
            <div
              className={`absolute inset-0 opacity-5 bg-gradient-to-br ${getGradient(
                color
              )}`}
            />
          </Card>
        </motion.div>
      </CardWrapper>
    );
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      purple:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      green:
        "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      orange:
        "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      red: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getGradient = (color: string) => {
    const gradientMap = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      green: "from-green-500 to-emerald-500",
      orange: "from-orange-500 to-red-500",
      red: "from-red-500 to-pink-500",
      yellow: "from-yellow-500 to-orange-500",
    };
    return gradientMap[color as keyof typeof gradientMap] || gradientMap.blue;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartSkeleton className="xl:col-span-2" />
            <ChartSkeleton />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorState
            title="Dashboard Unavailable"
            message="Unable to load dashboard data. Please try again."
            onRetry={fetchDashboardData}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Welcome back! Here's what's happening with your portfolio.
                <Badge variant="secondary" className="ml-2">
                  {stats.userActivity.online} online now
                </Badge>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <Activity
                  className={cn("w-4 h-4", refreshing ? "animate-spin" : "")}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/" target="_blank" rel="noopener noreferrer">
                  <ArrowUp className="w-4 h-4 rotate-45" />
                  View Site
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/admin/blog/new">
                  <Plus className="w-4 h-4" />
                  New Post
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Key Performance Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard
              title="Total Views"
              value={stats.totalViews + stats.totalProjectViews}
              change={stats.analytics.viewsGrowth}
              icon={<Eye className="h-5 w-5" />}
              color="blue"
              description="All content views"
              trend={stats.analytics.viewsGrowth >= 0 ? "up" : "down"}
            />
            <StatCard
              title="Blog Posts"
              value={stats.totalPosts}
              change={15}
              icon={<FileText className="h-5 w-5" />}
              color="purple"
              description="Published articles"
              href="/admin/blog"
            />
            <StatCard
              title="Projects"
              value={stats.totalProjects}
              change={8}
              icon={<Briefcase className="h-5 w-5" />}
              color="green"
              description="Portfolio showcase"
              href="/admin/projects"
            />
            <StatCard
              title="Active Users"
              value={stats.userActivity.online}
              change={stats.analytics.engagement}
              icon={<Users className="h-5 w-5" />}
              color="orange"
              description="Currently browsing"
              href="/admin/users"
            />
          </motion.div>

          {/* Analytics and Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Real-time Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Today's Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Views Today
                      </span>
                      <span className="font-bold text-green-600">
                        {stats.analytics.viewsToday}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Engagement
                      </span>
                      <span className="font-bold text-blue-600">
                        {stats.analytics.engagement}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Conversion
                      </span>
                      <span className="font-bold text-purple-600">
                        {stats.analytics.conversion}%
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Performance Score
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={stats.performance.satisfaction}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {stats.performance.satisfaction}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Activity by Country */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Global Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.userActivity.byCountry.map((country, index) => (
                      <motion.div
                        key={country.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium">
                            {country.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${country.value}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">
                            {country.value}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Device Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    Device Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.userActivity.byDevice.map((device, index) => {
                      const Icon = device.icon;
                      return (
                        <motion.div
                          key={device.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                              <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium">
                              {device.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {device.value}%
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="w-5 h-5 text-orange-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Uptime
                      </span>
                      <span className="font-bold text-green-600">
                        {stats.performance.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Response Time
                      </span>
                      <span className="font-bold text-blue-600">
                        {stats.performance.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Errors
                      </span>
                      <span className="font-bold text-red-600">
                        {stats.performance.errors}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                      All Systems Operational
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Analytics and Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Enhanced Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-2"
            >
              <EnhancedDashboardAnalytics
                period={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                className="h-full"
              />
            </motion.div>

            {/* Hero Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Hero Section
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {heroSettings ? (
                    <HeroPreview
                      heroSettings={heroSettings}
                      scale={0.3}
                      showControls={false}
                      className="border rounded-lg overflow-hidden"
                    />
                  ) : (
                    <EmptyState
                      title="No Hero Data"
                      description="Configure your hero section"
                      action={
                        <Button asChild size="sm">
                          <Link href="/admin/hero">Setup Hero</Link>
                        </Button>
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity and Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Posts with Enhanced Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Recent Posts
                    <Badge variant="secondary">{stats.totalPosts}</Badge>
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
                    <AnimatePresence>
                      {stats.recentPosts.length === 0 ? (
                        <EmptyState
                          icon={<FileText className="w-12 h-12 opacity-50" />}
                          title="No posts yet"
                          description="Create your first blog post"
                          action={
                            <Button asChild size="sm">
                              <Link href="/admin/blog/new">
                                Create First Post
                              </Link>
                            </Button>
                          }
                        />
                      ) : (
                        stats.recentPosts.map((post, index) => {
                          const textContent = post.content
                            ? typeof post.content === "string"
                              ? post.content
                              : JSON.stringify(post.content)
                            : "";
                          const readingTime = getReadTime(textContent);

                          return (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group"
                            >
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div className="flex items-start space-x-4 p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200 hover:shadow-md">
                                  <div className="flex-shrink-0">
                                    {post.cover_image_url ? (
                                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                                        <Image
                                          src={post.cover_image_url}
                                          alt={post.title}
                                          width={64}
                                          height={64}
                                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2 text-sm leading-tight mb-2">
                                      {post.title}
                                    </h4>
                                    {post.excerpt && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {post.excerpt}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDistanceToNow(
                                            new Date(post.created_at),
                                            { addSuffix: true }
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
                              </Link>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Messages with Enhanced Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    Recent Messages
                    <Badge variant="secondary">{stats.totalMessages}</Badge>
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
                    <AnimatePresence>
                      {stats.recentMessages.length === 0 ? (
                        <EmptyState
                          icon={
                            <MessageSquare className="w-12 h-12 opacity-50" />
                          }
                          title="No messages yet"
                          description="Contact messages will appear here"
                        />
                      ) : (
                        stats.recentMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <Link href="/admin/contact">
                              <div className="flex items-start space-x-4 p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200 hover:shadow-md">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                      {message.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm truncate">
                                      {message.name}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        message.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : "",
                                        message.status === "resolved"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : ""
                                      )}
                                    >
                                      {message.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate mb-1">
                                    {message.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                      new Date(message.created_at),
                                      { addSuffix: true }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "New Post",
                      description: "Write article",
                      href: "/admin/blog/new",
                      icon: FileText,
                      gradient: "from-blue-500 to-blue-600",
                      bgGradient:
                        "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                    },
                    {
                      title: "Add Project",
                      description: "Showcase work",
                      href: "/admin/projects/new",
                      icon: Briefcase,
                      gradient: "from-purple-500 to-purple-600",
                      bgGradient:
                        "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                    },
                    {
                      title: "Edit Hero",
                      description: "Update homepage",
                      href: "/admin/hero",
                      icon: Star,
                      gradient: "from-green-500 to-green-600",
                      bgGradient:
                        "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
                    },
                    {
                      title: "Messages",
                      description: "Check inbox",
                      href: "/admin/contact",
                      icon: MessageSquare,
                      gradient: "from-orange-500 to-orange-600",
                      bgGradient:
                        "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
                    },
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link href={action.href}>
                          <div
                            className={`p-6 bg-gradient-to-br ${action.bgGradient} border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className={`p-3 bg-gradient-to-r ${action.gradient} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200`}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper function to combine class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
