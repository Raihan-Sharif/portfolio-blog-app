import EnhancedContactContent from "@/components/contact/enhanced-contact-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Me | Raihan Sharif",
  description:
    "Get in touch with Raihan Sharif for web development projects, collaborations, or any inquiries. Available for full-stack development using .NET, React, Next.js and more.",
  keywords:
    "contact, web developer, full stack developer, React developer, .NET developer, hire developer",
  openGraph: {
    title: "Contact Me | Raihan Sharif",
    description: "Get in touch for web development projects and collaborations",
    type: "website",
  },
};

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function ContactPage() {
  const supabase = createServerSupabaseClient() as any;

  // Fetch all contact-related data
  const [
    { data: contactInfo },
    { data: businessHours },
    { data: availability },
    { data: aboutSettings },
  ] = await Promise.all([
    supabase
      .from("contact_info")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
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
      .single(),
    supabase
      .from("about_settings")
      .select("years_experience, location")
      .eq("is_active", true)
      .single(),
  ]);

  return (
    <EnhancedContactContent
      contactInfo={contactInfo || []}
      businessHours={businessHours || []}
      availability={availability}
      aboutSettings={aboutSettings}
    />
  );
}
