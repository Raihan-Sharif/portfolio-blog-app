"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnlineUserStats } from "@/hooks/use-enhanced-online-tracking";
import { formatDistanceToNow } from "date-fns";
import { Activity, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnlineUser {
  id: number;
  user_id: string | null;
  session_id: string;
  display_name: string;
  last_activity: string;
  is_authenticated: boolean;
  page_url: string;
  ip_address?: string;
}

interface OnlineUsersNavbarProps {
  recentUsers?: OnlineUser[];
  className?: string;
}

export function OnlineUsersNavbar({ recentUsers = [], className }: OnlineUsersNavbarProps) {
  const { stats } = useOnlineUserStats();

  const getStatusDot = (isAuthenticated: boolean) => {
    return (
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isAuthenticated ? "bg-green-500" : "bg-blue-400"
        )}
      />
    );
  };

  const getTruncatedUrl = (url: string) => {
    try {
      const pathname = new URL(url, 'https://example.com').pathname;
      return pathname.length > 20 ? `${pathname.substring(0, 20)}...` : pathname;
    } catch {
      return url.length > 20 ? `${url.substring(0, 20)}...` : url;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
          title={`${stats.total_online} users online`}
        >
          <Users size={20} />
          {stats.total_online > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-green-500 text-white flex items-center justify-center">
              {stats.total_online > 99 ? "99+" : stats.total_online}
            </Badge>
          )}
          {/* Pulse animation for active users */}
          {stats.total_online > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full animate-ping opacity-75" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Online Users
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-time activity
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.total_online}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Total
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.authenticated_users}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Logged In
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                {stats.anonymous_users}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Anonymous
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users List */}
        <div className="max-h-64 overflow-y-auto">
          {recentUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="p-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 px-2">
                Recent Activity
              </div>
              <div className="space-y-1">
                {recentUsers.map((user) => (
                  <div
                    key={`${user.session_id}-${user.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getStatusDot(user.is_authenticated)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {user.display_name}
                          </span>
                          {user.is_authenticated && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              User
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {getTruncatedUrl(user.page_url)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(user.last_activity), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Active in last 5 minutes</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}