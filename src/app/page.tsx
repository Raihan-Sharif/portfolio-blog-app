// src/app/page.tsx
import Contact from "@/components/home/contact";
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
  const supabase = createServerSupabaseClient() as any;

  try {
    // Fetch all data in parallel for better performance
    const [
      { data: featuredProjects },
      { data: projectCategories },
      { data: latestPosts },
      { data: skills },
      { data: heroSettings },
      { data: socialLinks },
      { data: contactInfo },
      { data: businessHours },
      { data: availability },
    ] = await Promise.all([
      // Existing project queries
      supabase
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
        .limit(6),

      supabase
        .from("project_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),

      supabase
        .from("posts")
        .select("*, author:profiles(*), category:categories(*)")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3),

      supabase
        .from("skills")
        .select("*")
        .order("proficiency", { ascending: false })
        .limit(10),

      // Hero data
      supabase
        .from("hero_settings")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(), // Use maybeSingle to avoid errors if no data

      supabase.from("social_links").select("*").order("id"),

      // Contact data
      supabase
        .from("contact_info")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .limit(3),

      supabase
        .from("business_hours")
        .select("*")
        .eq("is_active", true)
        .order("day_of_week"),

      supabase
        .from("availability_status")
        .select("*")
        .eq("is_current", true)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    // Process projects to include technologies and awards properly
    const processedProjects =
      featuredProjects?.map((project: any) => ({
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
        <Hero heroSettings={heroSettings} socialLinks={socialLinks || []} />
        <EnhancedFeaturedProjects
          projects={processedProjects}
          categories={projectCategories || []}
          showFilters={false}
          maxProjects={6}
        />
        <Skills skills={skills || []} />
        <LatestBlogPosts posts={latestPosts || []} />
        <Contact
          contactInfo={contactInfo || []}
          businessHours={businessHours || []}
          availability={availability}
        />
      </>
    );
  } catch (error) {
    console.error("Error loading homepage data:", error);

    // Return fallback content on error
    return (
      <>
        <Hero heroSettings={null} socialLinks={[]} />
        <EnhancedFeaturedProjects
          projects={[]}
          categories={[]}
          showFilters={false}
          maxProjects={6}
        />
        <Skills skills={[]} />
        <LatestBlogPosts posts={[]} />
        <Contact contactInfo={[]} businessHours={[]} availability={null} />
      </>
    );
  }
}
