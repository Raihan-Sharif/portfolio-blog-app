// src/app/admin/about/loading.tsx
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAboutLoading() {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto animate-pulse">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Error Message Area */}
        <div className="h-6"></div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-md" />
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Settings Tab Content */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>

          {/* Data Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2 mt-3">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-6 w-16 rounded-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses and Workshops */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-6 w-6 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-52" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-6 w-6 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
