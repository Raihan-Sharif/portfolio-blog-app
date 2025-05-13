"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, redirect
        router.push(redirectPath);
      }
    };

    checkUser();
  }, [router, redirectPath]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        // After sign-in, check user role
        const userId = data.session.user.id;

        // Get user roles directly
        const { data: userRolesData, error: roleError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", userId);

        console.log("User roles data:", userRolesData);

        if (roleError) {
          console.error("Error fetching user roles:", roleError);
          // Default to home page if error
          router.push(redirectPath);
          return;
        }

        // Default to viewer role
        let isAdmin = false;

        if (userRolesData && userRolesData.length > 0) {
          const roleId = userRolesData[0].role_id;

          // Get the role name
          const { data: roleData } = await supabase
            .from("roles")
            .select("name")
            .eq("id", roleId)
            .single();

          console.log("Role data:", roleData);

          if (roleData && roleData.name === "admin") {
            isAdmin = true;
          }
        }

        // If user came from admin and is admin, go back to the admin page
        // If not, go to the provided redirect or home
        if (redirectPath.startsWith("/admin") && isAdmin) {
          router.push(redirectPath);
        } else if (isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push(redirectPath);
        }
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/20 px-4">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
