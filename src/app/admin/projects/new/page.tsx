// app/admin/projects/new/page.tsx
import AdminLayout from "@/components/admin/admin-layout";
import EnhancedProjectEditor from "@/components/admin/projects/enhanced-project-editor";

export default function NewProjectPage() {
  return (
    <AdminLayout>
      <EnhancedProjectEditor params={{ projectId: "new" }} />
    </AdminLayout>
  );
}
