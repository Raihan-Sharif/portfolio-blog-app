// @ts-nocheck
import EnhancedSkillsContent from "@/components/skills/enhanced-skills-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills & Expertise | Raihan Sharif",
  description:
    "Explore my comprehensive skill set in web development, including frontend, backend, database, and DevOps technologies with detailed proficiency levels.",
  keywords:
    "skills, web development, React, Next.js, .NET, TypeScript, JavaScript, full stack developer",
  openGraph: {
    title: "Skills & Expertise | Raihan Sharif",
    description: "Comprehensive overview of my technical skills and expertise",
    type: "website",
  },
};

export const revalidate = 3600; // Revalidate at most once per hour

export default async function SkillsPage() {
  const supabase = createServerSupabaseClient() as any;

  // Fetch all skills with better organization
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("proficiency", { ascending: false });

  // Fetch skill categories for better organization
  const skillsByCategory: Record<string, any[]> = {};
  if (skills) {
    skills.forEach((skill) => {
      const category = skill.category || "Other";
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skill);
    });
  }

  return <EnhancedSkillsContent skillsByCategory={skillsByCategory} />;
}
