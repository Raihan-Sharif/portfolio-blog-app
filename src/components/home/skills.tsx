"use client";

import { motion } from "framer-motion";

// Define the Skill interface directly
interface Skill {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  created_at: string;
}

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  // Alternative approach to get unique categories without using Set
  const categoryMap: Record<string, boolean> = {};
  skills.forEach((skill) => {
    const category = skill.category || "Other";
    categoryMap[category] = true;
  });

  // Get array of unique categories
  const categories = Object.keys(categoryMap);

  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">My Skills</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I&apos;ve worked with over my 6+ years in
            software development.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-6">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skills
                  .filter((skill) => (skill.category || "Other") === category)
                  .map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-card shadow rounded-lg p-6"
                    >
                      <div className="mb-4">
                        {skill.icon ? (
                          <div className="text-primary">
                            {/* Would typically use an icon component */}
                            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg">
                              <span className="text-lg">{skill.icon}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <h4 className="text-lg font-medium mb-2">{skill.name}</h4>
                      {skill.proficiency && (
                        <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
