// app/admin/projects/page.tsx
import AdminLayout from "@/components/admin/admin-layout";
import AdminProjectsList from "@/components/admin/projects/admin-projects-list";

export default function AdminProjectsPage() {
  return (
    <AdminLayout>
      <AdminProjectsList />
    </AdminLayout>
  );
}
