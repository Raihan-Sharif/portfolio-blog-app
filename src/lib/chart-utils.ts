// src/lib/chart-utils.ts
import { format, parseISO, startOfDay, subDays } from "date-fns";

export interface ChartDataPoint {
  date: string;
  [key: string]: any;
}

export interface ViewData {
  view_date: string;
  view_count: number;
}

/**
 * Generates a complete date range with zero values for missing dates
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  step: "day" | "week" | "month" = "day"
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);

    if (step === "day") {
      current.setDate(current.getDate() + 1);
    } else if (step === "week") {
      current.setDate(current.getDate() + 7);
    } else if (step === "month") {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
}

/**
 * Fills missing dates in view data with zero values
 */
export function fillMissingDates(
  data: ViewData[],
  days: number,
  endDate: Date = new Date()
): ChartDataPoint[] {
  const startDate = subDays(startOfDay(endDate), days - 1);
  const dateRange = generateDateRange(startDate, endDate);

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach((item) => {
    dataMap.set(item.view_date, item.view_count);
  });

  // Fill in the data
  return dateRange.map((date) => ({
    date,
    views: dataMap.get(date) || 0,
  }));
}

/**
 * Processes multiple data sources into combined chart data
 */
export function combineViewData(
  postViews: ViewData[],
  projectViews: ViewData[],
  days: number,
  endDate: Date = new Date()
): ChartDataPoint[] {
  const startDate = subDays(startOfDay(endDate), days - 1);
  const dateRange = generateDateRange(startDate, endDate);

  // Create maps for quick lookup
  const postViewsMap = new Map<string, number>();
  const projectViewsMap = new Map<string, number>();

  postViews.forEach((item) => {
    postViewsMap.set(item.view_date, item.view_count);
  });

  projectViews.forEach((item) => {
    projectViewsMap.set(item.view_date, item.view_count);
  });

  // Combine the data
  return dateRange.map((date) => {
    const postCount = postViewsMap.get(date) || 0;
    const projectCount = projectViewsMap.get(date) || 0;

    return {
      date,
      post_views: postCount,
      project_views: projectCount,
      total_views: postCount + projectCount,
    };
  });
}

/**
 * Formats date labels for charts based on the time period
 */
export function formatChartDateLabel(
  dateStr: string,
  period: "7d" | "30d" | "90d" | "365d"
): string {
  const date = parseISO(dateStr);

  switch (period) {
    case "7d":
      return format(date, "EEE"); // Mon, Tue, Wed
    case "30d":
      return format(date, "MMM d"); // Jan 1, Jan 2
    case "90d":
    case "365d":
      return format(date, "MMM d"); // Jan 1, Feb 1
    default:
      return format(date, "MMM d");
  }
}

/**
 * Formats numbers for display in charts
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calculates percentage change between two periods
 */
export function calculateGrowthPercentage(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Aggregates data by time period (daily, weekly, monthly)
 */
export function aggregateDataByPeriod(
  data: ChartDataPoint[],
  period: "day" | "week" | "month"
): ChartDataPoint[] {
  if (period === "day") {
    return data; // Already daily
  }

  const aggregated = new Map<string, ChartDataPoint>();

  data.forEach((item) => {
    const date = parseISO(item.date);
    let key: string;

    if (period === "week") {
      // Get start of week (Monday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      key = startOfWeek.toISOString().split("T")[0];
    } else if (period === "month") {
      // Get start of month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-01`;
    } else {
      key = item.date;
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        date: key,
        post_views: 0,
        project_views: 0,
        total_views: 0,
      });
    }

    const existing = aggregated.get(key)!;
    existing.post_views += item.post_views || 0;
    existing.project_views += item.project_views || 0;
    existing.total_views += item.total_views || 0;
  });

  return Array.from(aggregated.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Custom tooltip formatter for Recharts
 */
export function customTooltipFormatter(
  value: any,
  name: string
  //   props: any
): [string, string] {
  const formattedValue =
    typeof value === "number" ? formatChartNumber(value) : String(value);

  const formattedName = name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return [formattedValue, formattedName];
}

/**
 * Custom label formatter for chart tooltips
 */
export function customLabelFormatter(
  label: string,
  period: "7d" | "30d" | "90d" | "365d"
): string {
  try {
    const date = parseISO(label);

    switch (period) {
      case "7d":
        return format(date, "EEEE, MMM d"); // Monday, Jan 1
      case "30d":
        return format(date, "MMM d, yyyy"); // Jan 1, 2024
      case "90d":
      case "365d":
        return format(date, "MMM d, yyyy"); // Jan 1, 2024
      default:
        return format(date, "MMM d, yyyy");
    }
  } catch {
    return label;
  }
}

/**
 * Gets trend data for comparison
 */
export function getTrendData(
  current: ChartDataPoint[],
  previous: ChartDataPoint[]
): {
  currentTotal: number;
  previousTotal: number;
  change: number;
  trend: "up" | "down" | "neutral";
} {
  const currentTotal = current.reduce(
    (sum, item) => sum + (item.total_views || 0),
    0
  );
  const previousTotal = previous.reduce(
    (sum, item) => sum + (item.total_views || 0),
    0
  );

  const change = calculateGrowthPercentage(currentTotal, previousTotal);

  let trend: "up" | "down" | "neutral" = "neutral";
  if (change > 0) trend = "up";
  else if (change < 0) trend = "down";

  return {
    currentTotal,
    previousTotal,
    change: Math.abs(change),
    trend,
  };
}

/**
 * Chart color configurations
 */
export const chartColors = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gradients: {
    blue: ["#3b82f6", "#1d4ed8"],
    purple: ["#8b5cf6", "#7c3aed"],
    green: ["#10b981", "#059669"],
    orange: ["#f59e0b", "#d97706"],
    red: ["#ef4444", "#dc2626"],
    cyan: ["#06b6d4", "#0891b2"],
  },
};

/**
 * Responsive chart configurations
 */
export const chartConfig = {
  responsive: {
    small: { width: "100%", height: 200 },
    medium: { width: "100%", height: 300 },
    large: { width: "100%", height: 400 },
  },
  margins: {
    default: { top: 20, right: 30, left: 20, bottom: 5 },
    withLegend: { top: 20, right: 30, left: 20, bottom: 60 },
  },
};
