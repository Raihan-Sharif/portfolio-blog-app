// src/app/about/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "About | Raihan Sharif",
  description:
    "Learn more about Raihan Sharif - Full Stack Developer with expertise in modern web technologies.",
};

export const revalidate = 3600; // Revalidate at most once per hour

export default async function AboutPage() {
  const supabase = createServerSupabaseClient();

  // Fetch all about data
  const [
    { data: aboutSettings },
    { data: experiences },
    { data: education },
    { data: courses },
    { data: workshops },
    { data: achievements },
  ] = await Promise.all([
    supabase.from("about_settings").select("*").eq("is_active", true).single(),
    supabase
      .from("experience")
      .select("*")
      .eq("is_active", true)
      .order("display_order, start_date", { ascending: false }),
    supabase
      .from("education")
      .select("*")
      .eq("is_active", true)
      .order("display_order, start_date", { ascending: false }),
    supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("display_order, completion_date", { ascending: false }),
    supabase
      .from("workshops")
      .select("*")
      .eq("is_active", true)
      .order("display_order, event_date", { ascending: false }),
    supabase
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("display_order, achievement_date", { ascending: false }),
  ]);

  return (
    <AboutContent
      aboutSettings={aboutSettings}
      experiences={experiences || []}
      education={education || []}
      courses={courses || []}
      workshops={workshops || []}
      achievements={achievements || []}
    />
  );
}
