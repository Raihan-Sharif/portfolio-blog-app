// app/admin/projects/[id]/page.tsx
import AdminProjectEditor from "@/components/admin/projects/enhanced-project-editor";

export default function AdminProjectEditorPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminProjectEditor params={params} />;
}
