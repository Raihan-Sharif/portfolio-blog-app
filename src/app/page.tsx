import Contact from "@/components/home/contact";
// import FeaturedProjects from "@/components/home/featured-projects";
import EnhancedFeaturedProjects from "@/components/home/enhanced-featured-projects";

import Hero from "@/components/home/hero";
import LatestBlogPosts from "@/components/home/latest-blog-posts";
import Skills from "@/components/home/skills";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raihan Sharif | Full Stack Developer",
  description:
    "Portfolio and blog of Raihan Sharif, a full stack developer with expertise in .NET, React, Next.js, and more.",
};

export const revalidate = 3600; // Revalidate at most once per hour

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  // Fetch featured projects with categories, technologies, and awards
  const { data: featuredProjects } = await supabase
    .from("projects")
    .select(
      `
      *,
      category:project_categories(*),
      project_technologies(
        technology:technologies(*),
        proficiency_level,
        is_primary,
        display_order
      ),
      awards:project_awards(*)
    `
    )
    .eq("featured", true)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .limit(6);

  // Fetch all project categories for filtering
  const { data: projectCategories } = await supabase
    .from("project_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Fetch latest blog posts
  const { data: latestPosts } = await supabase
    .from("posts")
    .select("*, author:profiles(*), category:categories(*)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch skills
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("proficiency", { ascending: false })
    .limit(10);

  // Process projects to include technologies and awards properly
  const processedProjects =
    featuredProjects?.map((project) => ({
      ...project,
      technologies:
        project.project_technologies?.map((pt: any) => ({
          ...pt.technology,
          is_primary: pt.is_primary || false,
          proficiency_level: pt.proficiency_level,
        })) || [],
      awards: project.awards || [],
    })) || [];

  return (
    <>
      <Hero />
      <EnhancedFeaturedProjects
        projects={processedProjects}
        categories={projectCategories || []}
        showFilters={false}
        maxProjects={6}
      />
      <Skills skills={skills || []} />
      <LatestBlogPosts posts={latestPosts || []} />
      <Contact />
    </>
  );
}
