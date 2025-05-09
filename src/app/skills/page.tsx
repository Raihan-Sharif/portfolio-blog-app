import { createServerSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Revalidate at most once per hour

export default async function SkillsPage() {
  const supabase = createServerSupabaseClient();

  // Fetch all skills
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("proficiency", { ascending: false });

  // Group skills by category
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">My Skills</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Here's an overview of my technical skills and expertise in various
            technologies, tools, and methodologies.
          </p>
        </div>

        <div className="space-y-16">
          {Object.entries(skillsByCategory).map(
            ([category, categorySkills]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-8">{category}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-card border rounded-lg p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold mb-3">
                        {skill.name}
                      </h3>

                      {skill.proficiency !== null &&
                        skill.proficiency !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Proficiency</span>
                              <span>{skill.proficiency}%</span>
                            </div>
                            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${skill.proficiency}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
