// app/admin/projects/[projectId]/page.tsx
import AdminLayout from "@/components/admin/admin-layout";
import EnhancedProjectEditor from "@/components/admin/projects/enhanced-project-editor";

export default function AdminProjectEditorPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <AdminLayout>
      <EnhancedProjectEditor params={params} />
    </AdminLayout>
  );
}
