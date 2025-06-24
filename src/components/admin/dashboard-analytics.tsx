// src/components/admin/dashboard-analytics.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Eye,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function DashboardAnalytics({
  period,
  onPeriodChange,
  className,
}: DashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData>({
    viewsPerDay: [],
    summary: {
      total_posts: 0,
      total_projects: 0,
      total_post_views: 0,
      total_project_views: 0,
      avg_daily_views: 0,
    },
    previousPeriodViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMountedRef = useRef(true);
  const maxRetries = 3;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      fetchAnalyticsData();
    }
  }, [period]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const selectedPeriod = TIME_PERIODS.find((p) => p.key === period);
      if (!selectedPeriod) return;

      // Generate date range for the period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod.days + 1);

      // Create date array for the period
      const dateRange = [];
      for (let i = 0; i < selectedPeriod.days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dateRange.push(date.toISOString().split("T")[0]);
      }

      // Fetch views data with proper error handling
      let viewsData = [];
      let summaryData = null;

      try {
        // Try to use RPC function first
        const { data: rpcViewsData, error: rpcError } = await supabase.rpc(
          "get_combined_views_by_day",
          { days_count: selectedPeriod.days }
        );

        if (!rpcError && rpcViewsData) {
          viewsData = rpcViewsData;
        } else {
          console.warn("RPC function failed, using fallback:", rpcError);
          viewsData = await fetchViewsDataFallback(
            selectedPeriod.days,
            dateRange
          );
        }
      } catch (err) {
        console.warn("RPC failed, using fallback:", err);
        viewsData = await fetchViewsDataFallback(
          selectedPeriod.days,
          dateRange
        );
      }

      // Fetch summary data
      try {
        const { data: rpcSummaryData, error: summaryError } =
          await supabase.rpc("get_analytics_summary", {
            days_count: selectedPeriod.days,
          });

        if (!summaryError && rpcSummaryData && rpcSummaryData.length > 0) {
          summaryData = rpcSummaryData[0];
        } else {
          console.warn("Summary RPC failed, using fallback:", summaryError);
          summaryData = await fetchSummaryDataFallback(selectedPeriod.days);
        }
      } catch (err) {
        console.warn("Summary RPC failed, using fallback:", err);
        summaryData = await fetchSummaryDataFallback(selectedPeriod.days);
      }

      // Calculate previous period for comparison
      let previousPeriodViews = 0;
      try {
        const previousData = await fetchViewsDataFallback(
          selectedPeriod.days * 2,
          dateRange
        );
        previousPeriodViews = previousData
          .slice(0, selectedPeriod.days)
          .reduce((sum: number, day: any) => sum + (day.total_views || 0), 0);
      } catch (err) {
        console.warn("Previous period calculation failed:", err);
      }

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
        });
        setRetryCount(0);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      if (isMountedRef.current) {
        setError("Failed to load analytics data");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [period]);

  const fetchViewsDataFallback = async (days: number, dateRange: string[]) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    const [{ data: postViewsData }, { data: projectViewsData }] =
      await Promise.all([
        supabase
          .from("post_views")
          .select("view_date, view_count")
          .gte("view_date", startDate.toISOString().split("T")[0])
          .lte("view_date", endDate.toISOString().split("T")[0]),
        supabase
          .from("project_views")
          .select("view_date, view_count")
          .gte("view_date", startDate.toISOString().split("T")[0])
          .lte("view_date", endDate.toISOString().split("T")[0]),
      ]);

    // Aggregate data by date
    const viewsByDate: Record<
      string,
      { post_views: number; project_views: number }
    > = {};

    // Initialize all dates with zero values
    dateRange.forEach((date) => {
      viewsByDate[date] = { post_views: 0, project_views: 0 };
    });

    // Aggregate post views
    (postViewsData || []).forEach((view) => {
      if (viewsByDate[view.view_date]) {
        viewsByDate[view.view_date].post_views += view.view_count || 0;
      }
    });

    // Aggregate project views
    (projectViewsData || []).forEach((view) => {
      if (viewsByDate[view.view_date]) {
        viewsByDate[view.view_date].project_views += view.view_count || 0;
      }
    });

    // Convert to array format
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
    startDate.setDate(endDate.getDate() - days + 1);

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
    try {
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
    } catch {
      return dateStr;
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

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      fetchAnalyticsData();
    }
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

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry ({retryCount}/{maxRetries})
                </Button>
                {retryCount >= maxRetries && (
                  <p className="text-sm text-muted-foreground">
                    Maximum retries reached. Please refresh the page.
                  </p>
                )}
              </div>
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
        <Card>
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

        <Card>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  Blog Views
                </span>
                <span className="font-medium">
                  {data.summary.total_post_views?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                  Project Views
                </span>
                <span className="font-medium">
                  {data.summary.total_project_views?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Views Analytics
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
          <ResponsiveContainer width="100%" height={300}>
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
                  try {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
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
