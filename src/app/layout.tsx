// src/app/layout.tsx
import { NotificationManager } from "@/components/admin/notification-manager";
import ConditionalLayout from "@/components/layout/conditional-layout";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raihan Sharif | Full Stack Developer",
  description:
    "Portfolio and blog of Raihan Sharif, a full stack developer with expertise in .NET, React, Next.js, and more.",
  keywords: [
    "Raihan Sharif",
    "Full Stack Developer",
    ".NET Developer",
    "React Developer",
    "Next.js",
    "TypeScript",
    "Web Development",
    "Portfolio",
    "Blog",
  ],
  authors: [{ name: "Raihan Sharif" }],
  creator: "Raihan Sharif",
  publisher: "Raihan Sharif",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Raihan Sharif | Full Stack Developer",
    description:
      "Portfolio and blog of Raihan Sharif, a full stack developer with expertise in .NET, React, Next.js, and more.",
    url: "/",
    siteName: "Raihan Sharif Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raihan Sharif | Full Stack Developer",
    description:
      "Portfolio and blog of Raihan Sharif, a full stack developer with expertise in .NET, React, Next.js, and more.",
    creator: "@raihan_sharif",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {/* Background pattern */}
              <div className="fixed inset-0 bg-dot-pattern bg-dot-sm opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />

              {/* FIXED: Use ConditionalLayout to exclude navbar/footer for admin routes */}
              <ConditionalLayout
                navbar={
                  <ErrorBoundary
                    fallback={
                      <div className="h-16 bg-background border-b border-border flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          Navigation temporarily unavailable
                        </span>
                      </div>
                    }
                  >
                    <Navbar />
                  </ErrorBoundary>
                }
                footer={
                  <ErrorBoundary
                    fallback={
                      <div className="py-8 bg-card border-t border-border text-center">
                        <span className="text-sm text-muted-foreground">
                          Footer temporarily unavailable
                        </span>
                      </div>
                    }
                  >
                    <Footer />
                  </ErrorBoundary>
                }
              >
                <ErrorBoundary>{children}</ErrorBoundary>
              </ConditionalLayout>

              {/* Global notification manager */}
              <ErrorBoundary>
                <NotificationManager />
              </ErrorBoundary>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
