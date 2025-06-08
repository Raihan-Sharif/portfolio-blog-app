// app/projects/page.tsx
import EnhancedProjectsPage from "@/components/home/enhanced-featured-projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Revalidate at most once per hour

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient();

  // Fetch all projects and categories
  const [projectsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `
      *,
      category:project_categories(*),
      project_technologies(
        technology:technologies(*)
      )
    `
      )
      .eq("is_public", true)
      .eq("is_active", true),

    supabase.from("project_categories").select("*").eq("is_active", true),
  ]);

  // Process projects data to match the enhanced component interface
  const processedProjects =
    projectsResponse.data?.map((project) => ({
      ...project,
      technologies:
        project.project_technologies?.map((pt: any) => ({
          ...pt.technology,
          is_primary: pt.is_primary || false,
          proficiency_level: pt.proficiency_level,
        })) || [],
    })) || [];

  return (
    <EnhancedProjectsPage
      projects={processedProjects}
      categories={categoriesResponse.data || []}
    />
  );
}
