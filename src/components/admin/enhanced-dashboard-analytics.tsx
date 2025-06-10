// src/components/admin/enhanced-dashboard-analytics.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsData {
  viewsPerDay: Array<{
    date: string;
    post_views: number;
    project_views: number;
    total_views: number;
  }>;
  summary: {
    total_posts: number;
    total_projects: number;
    total_post_views: number;
    total_project_views: number;
    avg_daily_views: number;
  };
  previousPeriodViews: number;
  topContent: Array<{
    title: string;
    views: number;
    type: "post" | "project";
  }>;
  deviceBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
}

interface DashboardAnalyticsProps {
  period: "7d" | "30d" | "90d";
  onPeriodChange?: (period: "7d" | "30d" | "90d") => void;
  className?: string;
}

const TIME_PERIODS = [
  { key: "7d" as const, label: "7D", days: 7 },
  { key: "30d" as const, label: "30D", days: 30 },
  { key: "90d" as const, label: "3M", days: 90 },
];

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

export default function EnhancedDashboardAnalytics({
  period,
  onPeriodChange,
  className,
}: DashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<
    "views" | "engagement" | "performance"
  >("views");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const selectedPeriod = TIME_PERIODS.find((p) => p.key === period);
      if (!selectedPeriod) return;

      // Fetch combined views data
      const { data: viewsData, error: viewsError } = await supabase.rpc(
        "get_combined_views_by_day",
        { days_count: selectedPeriod.days }
      );

      if (viewsError) throw viewsError;

      // Fetch analytics summary
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_analytics_summary",
        { days_count: selectedPeriod.days }
      );

      if (summaryError) throw summaryError;

      // Fetch previous period for comparison
      const { data: previousData, error: previousError } = await supabase.rpc(
        "get_combined_views_by_day",
        { days_count: selectedPeriod.days * 2 }
      );

      let previousPeriodViews = 0;
      if (!previousError && previousData) {
        previousPeriodViews = previousData
          .slice(0, selectedPeriod.days)
          .reduce((sum: number, day: any) => sum + (day.total_views || 0), 0);
      }

      // Fetch top content
      const [{ data: topPosts }, { data: topProjects }] = await Promise.all([
        supabase
          .from("posts")
          .select("title, view_count")
          .order("view_count", { ascending: false })
          .limit(5),
        supabase
          .from("projects")
          .select("title, view_count")
          .eq("is_active", true)
          .order("view_count", { ascending: false })
          .limit(5),
      ]);

      const topContent = [
        ...(topPosts?.map((p) => ({
          title: p.title,
          views: p.view_count || 0,
          type: "post" as const,
        })) || []),
        ...(topProjects?.map((p) => ({
          title: p.title,
          views: p.view_count || 0,
          type: "project" as const,
        })) || []),
      ]
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

      // Mock additional data (replace with real data in production)
      const deviceBreakdown = [
        { name: "Desktop", value: 65, color: "#3b82f6" },
        { name: "Mobile", value: 30, color: "#8b5cf6" },
        { name: "Tablet", value: 5, color: "#10b981" },
      ];

      const trafficSources = [
        { source: "Direct", visits: 850, percentage: 45 },
        { source: "Google", visits: 650, percentage: 35 },
        { source: "Social Media", visits: 280, percentage: 15 },
        { source: "Referrals", visits: 95, percentage: 5 },
      ];

      setData({
        viewsPerDay: viewsData || [],
        summary: summaryData?.[0] || {
          total_posts: 0,
          total_projects: 0,
          total_post_views: 0,
          total_project_views: 0,
          avg_daily_views: 0,
        },
        previousPeriodViews,
        topContent,
        deviceBreakdown,
        trafficSources,
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (period === "30d") {
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

  const calculateGrowthPercentage = () => {
    if (!data) return { value: 0, isPositive: true };

    const currentPeriodViews = data.viewsPerDay.reduce(
      (sum, day) => sum + (day.total_views || 0),
      0
    );

    if (data.previousPeriodViews === 0) {
      return { value: 0, isPositive: true };
    }

    const change = Math.round(
      ((currentPeriodViews - data.previousPeriodViews) /
        data.previousPeriodViews) *
        100
    );

    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const growthMetrics = calculateGrowthPercentage();
  const currentPeriodViews =
    data?.viewsPerDay.reduce((sum, day) => sum + (day.total_views || 0), 0) ||
    0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <p className="font-medium text-slate-900 dark:text-white mb-2">
            {new Date(label).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {entry.name === "post_views"
                  ? "Blog Views"
                  : entry.name === "project_views"
                  ? "Project Views"
                  : "Total Views"}
                :
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">
                Loading analytics...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Total Views ({period.toUpperCase()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {currentPeriodViews.toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    {growthMetrics.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={
                        growthMetrics.isPositive
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {growthMetrics.value}%
                    </span>
                    <span className="text-muted-foreground ml-1">
                      vs previous
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Avg Daily Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(data.summary.avg_daily_views || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Per day average
                  </div>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Content Split
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    Blog Views
                  </span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {data.summary.total_post_views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    Project Views
                  </span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {data.summary.total_project_views?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart Tabs */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Analytics Overview</CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Type Selector */}
              <div className="flex bg-muted rounded-lg p-1">
                {[
                  { key: "views", label: "Views", icon: Eye },
                  { key: "engagement", label: "Engagement", icon: Activity },
                  {
                    key: "performance",
                    label: "Performance",
                    icon: TrendingUp,
                  },
                ].map((chart) => {
                  const Icon = chart.icon;
                  return (
                    <Button
                      key={chart.key}
                      variant={activeChart === chart.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveChart(chart.key as any)}
                      className="text-xs h-8 gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      {chart.label}
                    </Button>
                  );
                })}
              </div>

              {/* Period Selector */}
              {onPeriodChange && (
                <div className="flex bg-muted rounded-lg p-1">
                  {TIME_PERIODS.map((timePeriod) => (
                    <Button
                      key={timePeriod.key}
                      variant={period === timePeriod.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPeriodChange(timePeriod.key)}
                      className="text-xs h-8"
                    >
                      {timePeriod.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw
                    className={cn("w-3 h-3", refreshing && "animate-spin")}
                  />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Download className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Filter className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeChart === "views" && (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={data.viewsPerDay}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="post_views"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="url(#postViews)"
                      name="Blog Views"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="project_views"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="url(#projectViews)"
                      name="Project Views"
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      y={data.summary.avg_daily_views}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{ value: "Average", position: "insideTopRight" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeChart === "engagement" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Device Breakdown</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={data.deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.deviceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Top Content</h4>
                    <div className="space-y-3 h-[250px] overflow-y-auto">
                      {data.topContent.map((content, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-2 h-8 rounded-full",
                                content.type === "post"
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                              )}
                            />
                            <div>
                              <p className="font-medium text-sm truncate max-w-[200px]">
                                {content.title}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {content.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">
                              {content.views}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              views
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeChart === "performance" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Traffic Sources</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.trafficSources}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar
                          dataKey="visits"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                      {[
                        {
                          label: "Page Load Time",
                          value: "1.2s",
                          trend: "good",
                        },
                        { label: "Bounce Rate", value: "32%", trend: "good" },
                        {
                          label: "Time on Page",
                          value: "3m 45s",
                          trend: "excellent",
                        },
                        {
                          label: "Conversion Rate",
                          value: "4.2%",
                          trend: "good",
                        },
                      ].map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <span className="text-sm font-medium">
                            {metric.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{metric.value}</span>
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                metric.trend === "excellent" && "bg-green-500",
                                metric.trend === "good" && "bg-yellow-500",
                                metric.trend === "poor" && "bg-red-500"
                              )}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-muted-foreground">
              Total this period: {currentPeriodViews.toLocaleString()} views
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                Blog: {data.summary.total_post_views?.toLocaleString() || 0}
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                Projects:{" "}
                {data.summary.total_project_views?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
