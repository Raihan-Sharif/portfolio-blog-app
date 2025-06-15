// src/components/admin/enhanced-dashboard-analytics.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Eye,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

interface EnhancedAnalyticsData {
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
  userActivity: {
    online: number;
    registered: number;
    anonymous: number;
    byCountry: Array<{ name: string; value: number; flag: string }>;
    byDevice: Array<{ name: string; value: number; icon: any }>;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errors: number;
    satisfaction: number;
  };
}

interface EnhancedDashboardAnalyticsProps {
  period: "7d" | "30d" | "90d";
  onPeriodChange?: (period: "7d" | "30d" | "90d") => void;
  className?: string;
}

const TIME_PERIODS = [
  { key: "7d" as const, label: "7D", days: 7 },
  { key: "30d" as const, label: "30D", days: 30 },
  { key: "90d" as const, label: "3M", days: 90 },
];

export default function EnhancedDashboardAnalytics({
  period,
  onPeriodChange,
  className,
}: EnhancedDashboardAnalyticsProps) {
  const [data, setData] = useState<EnhancedAnalyticsData>({
    viewsPerDay: [],
    summary: {
      total_posts: 0,
      total_projects: 0,
      total_post_views: 0,
      total_project_views: 0,
      avg_daily_views: 0,
    },
    previousPeriodViews: 0,
    userActivity: {
      online: 0,
      registered: 0,
      anonymous: 0,
      byCountry: [],
      byDevice: [],
    },
    performance: {
      responseTime: 0,
      uptime: 0,
      errors: 0,
      satisfaction: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      if (isMountedRef.current) {
        await fetchEnhancedAnalyticsData();
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [period]);

  const fetchEnhancedAnalyticsData = async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const selectedPeriod = TIME_PERIODS.find((p) => p.key === period);
      if (!selectedPeriod) return;

      // Fetch views data with fallback
      let viewsData = [];
      let summaryData = null;
      let previousPeriodViews = 0;

      try {
        const { data: rpcViewsData, error: rpcError } = await supabase.rpc(
          "get_combined_views_by_day",
          { days_count: selectedPeriod.days }
        );

        if (!rpcError && rpcViewsData) {
          viewsData = rpcViewsData;
        } else {
          console.warn("RPC function failed, using fallback:", rpcError);
          viewsData = await fetchViewsDataFallback(selectedPeriod.days);
        }
      } catch (err) {
        console.warn("RPC failed, using fallback:", err);
        viewsData = await fetchViewsDataFallback(selectedPeriod.days);
      }

      // Fetch summary data
      try {
        const { data: rpcSummaryData, error: summaryError } =
          await supabase.rpc("get_analytics_summary", {
            days_count: selectedPeriod.days,
          });

        if (!summaryError && rpcSummaryData) {
          summaryData = rpcSummaryData[0];
        } else {
          console.warn("Summary RPC failed, using fallback:", summaryError);
          summaryData = await fetchSummaryDataFallback(selectedPeriod.days);
        }
      } catch (err) {
        console.warn("Summary RPC failed, using fallback:", err);
        summaryData = await fetchSummaryDataFallback(selectedPeriod.days);
      }

      // Get user count for activity simulation
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Mock enhanced data (replace with real data when available)
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
          { name: "Desktop", value: 60, icon: "Monitor" },
          { name: "Mobile", value: 35, icon: "Smartphone" },
          { name: "Tablet", value: 5, icon: "Tablet" },
        ],
      };

      const mockPerformance = {
        responseTime: Math.floor(Math.random() * 100) + 50,
        uptime: 99.9,
        errors: Math.floor(Math.random() * 5),
        satisfaction: Math.floor(Math.random() * 20) + 80,
      };

      if (isMountedRef.current) {
        setData({
          viewsPerDay: viewsData || [],
          summary: summaryData || {
            total_posts: 0,
            total_projects: 0,
            total_post_views: 0,
            total_project_views: 0,
            avg_daily_views: 0,
          },
          previousPeriodViews,
          userActivity: mockUserActivity,
          performance: mockPerformance,
        });
      }
    } catch (err) {
      console.error("Error fetching enhanced analytics data:", err);
      if (isMountedRef.current) {
        setError("Failed to load analytics data");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchViewsDataFallback = async (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dateRange.push(date.toISOString().split("T")[0]);
    }

    const { data: postViewsData } = await supabase
      .from("post_views")
      .select("view_date, view_count")
      .gte("view_date", startDate.toISOString().split("T")[0])
      .lte("view_date", endDate.toISOString().split("T")[0]);

    const { data: projectViewsData } = await supabase
      .from("project_views")
      .select("view_date, view_count")
      .gte("view_date", startDate.toISOString().split("T")[0])
      .lte("view_date", endDate.toISOString().split("T")[0]);

    const viewsByDate: Record<
      string,
      { post_views: number; project_views: number }
    > = {};

    dateRange.forEach((date) => {
      viewsByDate[date] = { post_views: 0, project_views: 0 };
    });

    (postViewsData || []).forEach((view) => {
      if (viewsByDate[view.view_date]) {
        viewsByDate[view.view_date].post_views += view.view_count || 0;
      }
    });

    (projectViewsData || []).forEach((view) => {
      if (viewsByDate[view.view_date]) {
        viewsByDate[view.view_date].project_views += view.view_count || 0;
      }
    });

    return dateRange.map((date) => ({
      date,
      post_views: viewsByDate[date].post_views,
      project_views: viewsByDate[date].project_views,
      total_views:
        viewsByDate[date].post_views + viewsByDate[date].project_views,
    }));
  };

  const fetchSummaryDataFallback = async (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    try {
      const [
        { count: totalPosts },
        { count: totalProjects },
        { data: postViewsData },
        { data: projectViewsData },
      ] = await Promise.all([
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("published", true),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("is_public", true),
        supabase
          .from("post_views")
          .select("view_count")
          .gte("view_date", startDate.toISOString().split("T")[0]),
        supabase
          .from("project_views")
          .select("view_count")
          .gte("view_date", startDate.toISOString().split("T")[0]),
      ]);

      const totalPostViews = (postViewsData || []).reduce(
        (sum, view) => sum + (view.view_count || 0),
        0
      );
      const totalProjectViews = (projectViewsData || []).reduce(
        (sum, view) => sum + (view.view_count || 0),
        0
      );
      const avgDailyViews = Math.round(
        (totalPostViews + totalProjectViews) / days
      );

      return {
        total_posts: totalPosts || 0,
        total_projects: totalProjects || 0,
        total_post_views: totalPostViews,
        total_project_views: totalProjectViews,
        avg_daily_views: avgDailyViews,
      };
    } catch (err) {
      console.error("Fallback summary failed:", err);
      return {
        total_posts: 0,
        total_projects: 0,
        total_post_views: 0,
        total_project_views: 0,
        avg_daily_views: 0,
      };
    }
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
  const currentPeriodViews = data.viewsPerDay.reduce(
    (sum, day) => sum + (day.total_views || 0),
    0
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[500px] flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">
                Loading enhanced analytics...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={fetchEnhancedAnalyticsData}
                variant="outline"
                size="sm"
              >
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
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              Total Views ({period.toUpperCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {currentPeriodViews.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {growthMetrics.isPositive ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
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
                  <span className="ml-1">vs previous</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Avg Daily Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(data.summary.avg_daily_views || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Per day average
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {data.userActivity.online}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Currently online
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {data.performance.satisfaction}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Satisfaction score
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Enhanced Views Analytics
            </CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={data.viewsPerDay}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="postViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="projectViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
