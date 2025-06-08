// app/projects/[slug]/page.tsx
import ProjectDetailPage from "@/components/projects/project-detail-page";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: project } = await supabase
    .rpc("get_project_with_details", { project_slug: params.slug })
    .single();

  if (!project) {
    notFound();
  }

  // Fetch related projects
  const { data: relatedProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("category_id", project.category_id)
    .neq("id", project.id)
    .eq("is_public", true)
    .limit(3);

  // Increment view count
  await supabase.rpc("increment_project_view", {
    project_id_param: project.id,
  });

  return (
    <ProjectDetailPage
      project={project}
      relatedProjects={relatedProjects || []}
    />
  );
}
