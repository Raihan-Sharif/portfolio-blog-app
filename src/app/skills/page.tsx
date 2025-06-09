import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Award, Sparkles, Star, TrendingUp, Zap } from "lucide-react";

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

  // Sort categories and skills
  const sortedCategories = Object.keys(skillsByCategory).sort();
  sortedCategories.forEach((category) => {
    skillsByCategory[category].sort(
      (a, b) => (b.proficiency || 0) - (a.proficiency || 0)
    );
  });

  // Helper for proficiency level
  const getProficiencyLevel = (proficiency?: number) => {
    if (!proficiency)
      return {
        level: "Beginner",
        color: "from-gray-400 to-gray-500",
        textColor: "text-gray-600",
        icon: <Star size={16} className="text-gray-400 inline-block mr-1" />,
      };

    if (proficiency >= 90)
      return {
        level: "Expert",
        color: "from-purple-500 to-pink-500",
        textColor: "text-purple-600",
        icon: <Award size={16} className="text-purple-500 inline-block mr-1" />,
      };
    if (proficiency >= 75)
      return {
        level: "Advanced",
        color: "from-green-500 to-emerald-500",
        textColor: "text-green-600",
        icon: (
          <TrendingUp size={16} className="text-green-500 inline-block mr-1" />
        ),
      };
    if (proficiency >= 50)
      return {
        level: "Intermediate",
        color: "from-blue-500 to-cyan-500",
        textColor: "text-blue-600",
        icon: (
          <Sparkles size={16} className="text-blue-500 inline-block mr-1" />
        ),
      };
    return {
      level: "Beginner",
      color: "from-yellow-500 to-orange-500",
      textColor: "text-yellow-600",
      icon: <Star size={16} className="text-yellow-500 inline-block mr-1" />,
    };
  };

  // Helper for category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Frontend:
        "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800",
      Backend:
        "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800",
      Database:
        "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800",
      Infrastructure:
        "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800",
      DevOps:
        "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800",
      Mobile:
        "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800",
      Tools:
        "bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-200 dark:border-gray-800",
      Other:
        "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800",
    };

    return colors[category] || colors["Other"];
  };

  // Helper for skill icon (simple emoji fallback for SSR)
  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase();
    if (name.includes("react")) return "⚛️";
    if (name.includes("next")) return "⏭️";
    if (name.includes("javascript")) return "🟨";
    if (name.includes("typescript")) return "🟦";
    if (name.includes("html")) return "🌐";
    if (name.includes("css")) return "🎨";
    if (name.includes("node")) return "🟩";
    if (name.includes("python")) return "🐍";
    if (name.includes("java")) return "☕";
    if (name.includes("php")) return "🐘";
    if (name.includes("sql")) return "🗄️";
    if (name.includes("docker")) return "🐳";
    if (name.includes("aws")) return "☁️";
    if (name.includes("git")) return "🔀";
    if (name.includes("linux")) return "🐧";
    if (name.includes("mobile")) return "📱";
    if (name.includes("design")) return "🎨";
    return "💻";
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Skills
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Here’s an overview of my technical skills and expertise in various
            technologies, tools, and methodologies. <br />
            <span className="inline-flex items-center gap-1 text-primary font-semibold">
              <Zap size={18} className="inline-block" /> Always learning and
              expanding my skillset!
            </span>
          </p>
        </div>

        {/* Skills by Category */}
        <div className="space-y-20">
          {sortedCategories.map((category) => (
            <div key={category}>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {category}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {skillsByCategory[category].map((skill) => {
                  const proficiencyInfo = getProficiencyLevel(
                    skill.proficiency
                  );
                  const categoryColor = getCategoryColor(category);

                  return (
                    <div
                      key={skill.id}
                      className={`
                        relative p-6 rounded-2xl border-2 backdrop-blur-sm
                        hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300
                        group cursor-pointer ${categoryColor}
                      `}
                    >
                      {/* Skill Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-300 text-2xl">
                          {getSkillIcon(skill.name)}
                        </div>
                        {/* Proficiency Badge */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${proficiencyInfo.textColor} bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-1`}
                        >
                          {proficiencyInfo.icon}
                          {proficiencyInfo.level}
                        </div>
                      </div>

                      {/* Skill Name */}
                      <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300 text-center">
                        {skill.name}
                      </h3>

                      {/* Proficiency Bar */}
                      {skill.proficiency !== null &&
                        skill.proficiency !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Proficiency
                              </span>
                              <span className="font-semibold">
                                {skill.proficiency}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${proficiencyInfo.color} rounded-full relative`}
                                style={{
                                  width: `${skill.proficiency}%`,
                                  transition:
                                    "width 1.2s cubic-bezier(.4,0,.2,1)",
                                }}
                              >
                                {/* Shine effect */}
                                <div className="absolute top-0 left-0 h-full w-1/3 bg-white/30 transform skew-x-12 animate-pulse pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-full shadow-lg">
            <Zap className="text-primary" size={20} />
            <span className="text-sm font-medium">
              Always learning and expanding my skillset
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
