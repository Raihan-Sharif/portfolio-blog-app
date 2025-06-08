// app/admin/projects/new/page.tsx
import AdminProjectEditor from "@/components/admin/projects/enhanced-project-editor";

export default function NewProjectPage() {
  return <AdminProjectEditor params={{ projectId: "new" }} />;
}
