// src/app/(auth)/sign-up/page.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { signUpWithPassword, validatePassword } from "@/lib/auth-utils";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  // Password validation
  const passwordValidation = useMemo(() => {
    if (!password) return { isValid: false, errors: [], score: 0 };
    return { ...validatePassword(password), score: getPasswordScore(password) };
  }, [password]);

  const getPasswordScore = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/(?=.*[a-z])/.test(pwd)) score += 20;
    if (/(?=.*[A-Z])/.test(pwd)) score += 20;
    if (/(?=.*\d)/.test(pwd)) score += 20;
    if (/(?=.*[@$!%*?&])/.test(pwd)) score += 20;
    return Math.min(score, 100);
  };

  const getPasswordStrengthLabel = (score: number): string => {
    if (score < 40) return "Weak";
    if (score < 70) return "Fair";
    if (score < 90) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-yellow-500";
    if (score < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }

      if (fullName.trim().length < 2) {
        setError("Full name must be at least 2 characters long");
        return;
      }

      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Attempt sign up
      const result = await signUpWithPassword({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      if (!result.success) {
        setError(result.error || "Sign up failed");
        return;
      }

      if (result.requiresVerification) {
        setRequiresVerification(true);
      } else {
        setSuccess(true);
        // Redirect after a brief delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
            <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join us to get started with your portfolio
            </p>
          </div>

          {success && !requiresVerification ? (
            <div className="mt-8 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Account created successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Welcome aboard! Redirecting you now...
              </p>
            </div>
          ) : requiresVerification ? (
            <div className="mt-8 text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Verify your email
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We've sent a verification link to {email}. Please check your
                email and click the link to complete your registration.
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
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

                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Password strength:
                        </span>
                        <span
                          className={`font-medium ${
                            passwordValidation.score >= 90
                              ? "text-green-600"
                              : passwordValidation.score >= 70
                              ? "text-blue-600"
                              : passwordValidation.score >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {getPasswordStrengthLabel(passwordValidation.score)}
                        </span>
                      </div>
                      <Progress
                        value={passwordValidation.score}
                        className="h-2"
                      />
                      {passwordValidation.errors.length > 0 && (
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {passwordValidation.errors.map((error, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  !passwordValidation.isValid ||
                  password !== confirmPassword
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in
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
