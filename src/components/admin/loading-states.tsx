// src/components/admin/loading-states.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text = "Loading...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        {text && (
          <p className="text-muted-foreground text-sm font-medium">{text}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  height?: string;
}

export function LoadingCard({ className, height = "h-32" }: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className={cn("flex items-center justify-center", height)}>
        <LoadingSpinner />
      </CardContent>
    </Card>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-muted rounded h-4 mb-2 last:mb-0",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="w-1/3 h-6" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between space-x-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 80 + 20}%`,
                width: "100%",
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// src/components/admin/error-states.tsx
("use client");

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "network" | "permission" | "notFound";
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
  variant = "default",
}: ErrorStateProps) {
  const variants = {
    default: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      title: title || "Something went wrong",
      message: message || "An unexpected error occurred. Please try again.",
    },
    network: {
      icon: <WifiOff className="w-12 h-12 text-orange-500" />,
      title: title || "Connection Error",
      message:
        message ||
        "Unable to connect to the server. Check your internet connection.",
    },
    permission: {
      icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
      title: title || "Access Denied",
      message: message || "You don't have permission to access this resource.",
    },
    notFound: {
      icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
      title: title || "Not Found",
      message: message || "The requested resource could not be found.",
    },
  };

  const config = variants[variant];

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {config.icon}
        <h3 className="mt-4 text-lg font-semibold">{config.title}</h3>
        <p className="mt-2 text-muted-foreground max-w-md">{config.message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 opacity-50">{icon}</div>}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-muted-foreground max-w-md">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

// src/components/admin/status-indicators.tsx
("use client");

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "pending" | "warning" | "error";
  text?: string;
  className?: string;
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const variants = {
    success: {
      icon: <CheckCircle className="w-3 h-3" />,
      text: text || "Success",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    pending: {
      icon: <Clock className="w-3 h-3" />,
      text: text || "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    warning: {
      icon: <AlertCircle className="w-3 h-3" />,
      text: text || "Warning",
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    error: {
      icon: <XCircle className="w-3 h-3" />,
      text: text || "Error",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const variant = variants[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", variant.className, className)}
    >
      {variant.icon}
      {variant.text}
    </Badge>
  );
}

export function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="text-muted-foreground">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

// src/hooks/use-online-status.ts
("use client");

import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// src/components/admin/data-table.tsx
("use client");

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  paginated?: boolean;
  pageSize?: number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  paginated = false,
  pageSize = 10,
  className,
  emptyState,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter data based on search
  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  // Paginate data
  const paginatedData = paginated
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
