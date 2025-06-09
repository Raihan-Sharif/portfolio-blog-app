// app/projects/[slug]/page.tsx
import ProjectDetailPage from "@/components/projects/project-detail-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();

  const { data: project } = await supabase
    .rpc("get_project_with_details", { project_slug: params.slug })
    .single();

  if (!project?.title) {
    return {
      title: "Project Not Found | Raihan Sharif",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: `${project.title} | Raihan Sharif`,
    description:
      project.description ||
      project.subtitle ||
      `${project.title} - A project by Raihan Sharif`,
    openGraph: {
      title: project.title,
      description: project.description || project.subtitle || "",
      images: project.featured_image_url
        ? [
            {
              url: project.featured_image_url,
              width: 1200,
              height: 630,
              alt: project.title,
            },
          ]
        : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createServerSupabaseClient();

  // Get project details using the database function
  const { data: project, error: projectError } = await supabase
    .rpc("get_project_with_details", { project_slug: params.slug })
    .single();

  if (projectError || !project) {
    console.error("Project not found:", projectError);
    notFound();
  }

  // Fetch related projects from the same category
  const { data: relatedProjects } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      slug,
      subtitle,
      description,
      featured_image_url,
      category:project_categories(name, color),
      platform,
      view_count,
      like_count,
      featured
    `
    )
    .eq("category_id", project.category_id)
    .neq("id", project.id)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("view_count", { ascending: false })
    .limit(4);

  // Process the project data to ensure technologies and awards are properly formatted
  const processedProject = {
    ...project,
    technologies: project.technologies || [],
    awards: project.awards || [],
  };

  return (
    <ProjectDetailPage
      project={processedProject}
      relatedProjects={relatedProjects || []}
    />
  );
}
