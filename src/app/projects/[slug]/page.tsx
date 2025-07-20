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

  try {
    // Simple query for metadata - no complex joins
    const { data: project, error } = await supabase
      .from("projects")
      .select("title, description, featured_image_url")
      .eq("slug", params.slug)
      .eq("is_public", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !project) {
      return {
        title: "Project Not Found | Raihan Sharif",
        description: "The requested project could not be found.",
      };
    }

    return {
      title: `${project.title} | Raihan Sharif`,
      description:
        project.description || `${project.title} - A project by Raihan Sharif`,
      openGraph: {
        title: project.title,
        description: project.description || "",
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
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Project Not Found | Raihan Sharif",
      description: "The requested project could not be found.",
    };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createServerSupabaseClient();

  try {
    // First, get the basic project data to get the ID
    const { data: basicProject, error: basicError } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", params.slug)
      .eq("is_public", true)
      .eq("is_active", true)
      .maybeSingle();

    if (basicError || !basicProject) {
      console.error("Project not found:", basicError);
      notFound();
    }

    // Now fetch all data with the project ID
    const [
      { data: project, error: projectError },
      { data: projectTechnologies, error: techError },
      { data: projectAwards, error: awardsError },
    ] = await Promise.all([
      // Main project data with category
      supabase
        .from("projects")
        .select(
          `
          *,
          category:project_categories(*)
        `
        )
        .eq("id", basicProject.id)
        .maybeSingle(),

      // Technologies separately
      supabase
        .from("project_technologies")
        .select(
          `
          technology:technologies(*),
          proficiency_level,
          is_primary,
          display_order
        `
        )
        .eq("project_id", basicProject.id)
        .order("display_order"),

      // Awards separately
      supabase
        .from("project_awards")
        .select("*")
        .eq("project_id", basicProject.id)
        .order("display_order"),
    ]);

    if (projectError || !project) {
      console.error("Project details not found:", projectError);
      notFound();
    }

    // Process technologies data
    const technologies =
      projectTechnologies?.map((pt: any) => ({
        ...pt.technology,
        is_primary: pt.is_primary || false,
        proficiency_level: pt.proficiency_level,
      })) || [];

    // Process awards data
    const awards = projectAwards || [];

    // Build the complete project object
    const processedProject = {
      ...project,
      technologies,
      awards,
    };

    // Fetch related projects (optimized - fewer fields)
    let relatedProjects: any[] = [];
    if (project.category_id) {
      const { data: related } = await supabase
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

      relatedProjects = related || [];
    }

    // If no related projects, get recent ones
    if (relatedProjects.length === 0) {
      const { data: recent } = await supabase
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
        .neq("id", project.id)
        .eq("is_public", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);

      relatedProjects = recent || [];
    }

    return (
      <ProjectDetailPage
        project={processedProject}
        relatedProjects={relatedProjects}
      />
    );
  } catch (error) {
    console.error("Error loading project:", error);
    notFound();
  }
}
