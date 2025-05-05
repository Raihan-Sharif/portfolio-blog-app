import Contact from "@/components/home/contact";
import FeaturedProjects from "@/components/home/featured-projects";
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

  // Fetch featured projects
  const { data: featuredProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(3);

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

  return (
    <>
      <Hero />
      <FeaturedProjects projects={featuredProjects || []} />
      <Skills skills={skills || []} />
      <LatestBlogPosts posts={latestPosts || []} />
      <Contact />
    </>
  );
}
