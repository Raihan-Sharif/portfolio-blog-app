// app/projects/[slug]/page.tsx
import ProjectDetailPage from "@/components/projects/project-detail-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: { slug: string };
}

// Define the expected return type from the database function
interface ProjectWithDetails {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  content?: any;
  featured_image_url?: string;
  hero_image_url?: string;
  gallery_images?: any;
  video_url?: string;
  demo_video_url?: string;
  github_url?: string;
  demo_url?: string;
  case_study_url?: string;
  documentation_url?: string;
  api_docs_url?: string;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  project_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  client_name?: string;
  client_url?: string;
  team_size?: number;
  my_role?: string;
  platform?: string;
  target_audience?: string;
  key_features?: any;
  challenges_faced?: any;
  solutions_implemented?: any;
  results_achieved?: any;
  user_feedback?: any;
  development_methodology?: string;
  version_control?: string;
  deployment_platform?: string;
  hosting_provider?: string;
  featured: boolean;
  priority: number;
  view_count: number;
  like_count: number;
  share_count: number;
  technologies?: any;
  awards?: any;
  created_at: string;
  updated_at?: string;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();

  try {
    const { data: project, error } = await supabase
      .rpc("get_project_with_details", { project_slug: params.slug })
      .single();

    if (error || !project) {
      return {
        title: "Project Not Found | Raihan Sharif",
        description: "The requested project could not be found.",
      };
    }

    const projectData = project as ProjectWithDetails;

    if (!projectData.title) {
      return {
        title: "Project Not Found | Raihan Sharif",
        description: "The requested project could not be found.",
      };
    }

    return {
      title: `${projectData.title} | Raihan Sharif`,
      description:
        projectData.description ||
        projectData.subtitle ||
        `${projectData.title} - A project by Raihan Sharif`,
      openGraph: {
        title: projectData.title,
        description: projectData.description || projectData.subtitle || "",
        images: projectData.featured_image_url
          ? [
              {
                url: projectData.featured_image_url,
                width: 1200,
                height: 630,
                alt: projectData.title,
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
    // Get project details using the database function
    const { data: project, error: projectError } = await supabase
      .rpc("get_project_with_details", { project_slug: params.slug })
      .single();

    if (projectError || !project) {
      console.error("Project not found:", projectError);
      notFound();
    }

    const projectData = project as ProjectWithDetails;

    if (!projectData.title) {
      console.error("Project data incomplete:", projectData);
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
      .eq("category_id", projectData.category_id)
      .neq("id", projectData.id)
      .eq("is_public", true)
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(4);

    // Process the project data to ensure technologies and awards are properly formatted
    const processedProject = {
      ...projectData,
      category: projectData.category_name
        ? {
            id: 0, // We don't have the ID from the function
            name: projectData.category_name,
            slug: projectData.category_slug || "",
            color: projectData.category_color,
          }
        : undefined,
      technologies: projectData.technologies || [],
      awards: projectData.awards || [],
    };

    return (
      <ProjectDetailPage
        project={processedProject}
        relatedProjects={relatedProjects || []}
      />
    );
  } catch (error) {
    console.error("Error loading project:", error);
    notFound();
  }
}
