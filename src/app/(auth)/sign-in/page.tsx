// src/app/(auth)/sign-in/page.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, signInWithPassword } from "@/lib/auth-utils";
import { AlertCircle, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Component to safely use hooks that require client-side features
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const redirectPath = searchParams?.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // User is already logged in, redirect appropriately
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectPath);
      }
    }
  }, [user, authLoading, router, redirectPath]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      if (!email.trim() || !password.trim()) {
        setError("Please fill in all fields");
        return;
      }

      const result = await signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error || "Sign in failed");
        return;
      }

      // Sign in was successful - the auth provider will handle the redirect
      // based on the user's role and the redirect parameter
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    try {
      setIsResettingPassword(true);
      setError(null);

      const result = await resetPassword(email.trim());

      if (result.success) {
        setResetEmailSent(true);
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render the form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {resetEmailSent ? (
            <div className="mt-8 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Check your email
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We've sent a password reset link to {email}
              </p>
              <Button
                onClick={() => setResetEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    disabled={loading || isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <span className="flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Sending...
                      </span>
                    ) : (
                      "Forgot password?"
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
