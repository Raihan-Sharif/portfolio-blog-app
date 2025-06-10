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
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
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
        // Calculate previous period (first half of the doubled period)
        previousPeriodViews = previousData
          .slice(0, selectedPeriod.days)
          .reduce((sum: number, day: any) => sum + (day.total_views || 0), 0);
      }

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
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Activity className="h-5 w-5 text-green-600" />
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
