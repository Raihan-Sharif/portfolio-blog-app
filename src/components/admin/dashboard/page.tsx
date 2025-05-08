"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Eye,
  FileText,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// Remove the unused AdminLayoutProps interface
// interface AdminLayoutProps {
//   children: React.ReactNode;
// }

interface DashboardStats {
  totalPosts: number;
  totalProjects: number;
  totalUsers: number;
  totalViews: number;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    view_count: number;
    created_at: string;
  }>;
  viewsPerDay: Array<{
    date: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalProjects: 0,
    totalUsers: 0,
    totalViews: 0,
    recentPosts: [],
    viewsPerDay: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Total posts count
      const { count: totalPosts } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      // Total projects count
      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Total views count
      const { data: viewsData } = await supabase
        .from("posts")
        .select("view_count");

      const totalViews =
        viewsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

      // Recent posts
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("id, title, slug, view_count, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Mock data for views per day (in a real app, you'd have a proper analytics system)
      // This is just for demonstration purposes
      const today = new Date();
      const viewsPerDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 100) + 10, // Random view count
        };
      }).reverse();

      setStats({
        totalPosts: totalPosts || 0,
        totalProjects: totalProjects || 0,
        totalUsers: totalUsers || 0,
        totalViews,
        recentPosts: recentPosts || [],
        viewsPerDay,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage change for views (mock data for demonstration)
  const calculateChange = () => {
    const change = Math.floor(Math.random() * 30) - 10; // Random change between -10% and +20%
    return {
      value: change,
      isPositive: change >= 0,
    };
  };

  const viewsChange = calculateChange();

  return (
    <div className="container px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Published and draft posts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Showcase projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <div className="flex items-center text-xs mt-1">
                  <span
                    className={
                      viewsChange.isPositive
                        ? "text-green-600 flex items-center"
                        : "text-red-600 flex items-center"
                    }
                  >
                    {viewsChange.isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(viewsChange.value)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last week
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between">
                  {stats.viewsPerDay.map((day, i) => (
                    <div
                      key={i}
                      className="h-full flex flex-col justify-end items-center"
                    >
                      <div
                        className="w-8 bg-primary/80 rounded-t-sm"
                        style={{ height: `${(day.count / 100) * 100}%` }}
                      ></div>
                      <span className="text-xs mt-2">
                        {day.date.split("-")[2]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentPosts.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No posts yet
                    </div>
                  ) : (
                    stats.recentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {post.title}
                          </a>
                          <div className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.view_count || 0}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/blog/new"
              className="flex items-center p-4 bg-card border rounded-lg shadow-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-center h-12 w-12 bg-primary/10 rounded-full mr-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Create Blog Post</h3>
                <p className="text-sm text-muted-foreground">
                  Write a new article
                </p>
              </div>
            </a>

            <a
              href="/admin/projects/new"
              className="flex items-center p-4 bg-card border rounded-lg shadow-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-center h-12 w-12 bg-primary/10 rounded-full mr-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Add Project</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your work
                </p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="flex items-center p-4 bg-card border rounded-lg shadow-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-center h-12 w-12 bg-primary/10 rounded-full mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-sm text-muted-foreground">
                  User administration
                </p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
