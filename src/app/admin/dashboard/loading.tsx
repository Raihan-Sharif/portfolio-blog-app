// src/app/admin/dashboard/loading.tsx
import AdminLayout from "@/components/admin/admin-layout";
import { AdminDashboardSkeleton } from "@/components/ui/loading-states";

export default function AdminDashboardLoading() {
  return (
    <AdminLayout>
      <div className="animate-pulse">
        <AdminDashboardSkeleton />
      </div>
    </AdminLayout>
  );
}
