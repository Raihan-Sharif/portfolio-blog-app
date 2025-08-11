"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { Crown, ExternalLink, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface ProjectAward {
  id: number;
  title: string;
  description?: string;
  award_image_url?: string;
  awarded_by?: string;
  award_date?: string;
  award_url?: string;
  display_order: number;
}

interface ConfettiAwardsSectionProps {
  awards: ProjectAward[];
  confettiMode?: "once" | "loop" | "count";
  confettiCount?: number;
  confettiDuration?: number; // seconds for loop
  confettiScope?: "full" | "component"; // where to render
}

export function ConfettiAwardsSection({
  awards,
  confettiMode = "once",
  confettiCount = 3,
  confettiDuration = 5,
  confettiScope = "full",
}: ConfettiAwardsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isInView || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let animationFrame: number;
    let emitter: NodeJS.Timer | null = null;
    let running = true;
    let timesFired = 0;
    let wind = 0;

    // Particle pool
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      shape: "rect" | "circle";
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      fade: number;
    }[] = [];

    const resizeCanvas = () => {
      if (confettiScope === "full") {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = [
      "#FFD700",
      "#FF6B35",
      "#F7931E",
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#E91E63",
      "#FF5722",
    ];

    const createParticle = () => {
      const size = Math.random() * 8 + 4;
      return {
        x: Math.random() * canvas.width,
        y: -size,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? "rect" : "circle",
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 2 + 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        opacity: 1,
        fade: Math.random() * 0.005 + 0.002,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // occasional wind gust
      if (Math.random() < 0.005) wind = (Math.random() - 0.5) * 0.6;

      particles.forEach((p, index) => {
        p.x += p.vx + wind;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.fade;

        if (p.y > canvas.height + 50 || p.opacity <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (running || particles.length > 0) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    const startEmitter = () => {
      emitter = setInterval(() => {
        const burst = Math.random() < 0.05 ? 20 : 8; // burst occasionally
        for (let i = 0; i < burst; i++) {
          particles.push(createParticle());
        }
      }, 50);
    };

    if (confettiMode === "once") {
      startEmitter();
      setTimeout(() => {
        running = false;
        if (emitter) clearInterval(emitter);
      }, 2000);
    } else if (confettiMode === "loop") {
      startEmitter();
      setTimeout(() => {
        running = false;
        if (emitter) clearInterval(emitter);
      }, confettiDuration * 1000);
    } else if (confettiMode === "count") {
      const fire = () => {
        timesFired++;
        startEmitter();
        setTimeout(() => {
          if (emitter) clearInterval(emitter);
          if (timesFired < confettiCount) fire();
          else running = false;
        }, 2000);
      };
      fire();
    }

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      running = false;
      if (emitter) clearInterval(emitter);
      cancelAnimationFrame(animationFrame);
    };
  }, [isInView, confettiMode, confettiCount, confettiDuration, confettiScope]);

  if (!awards?.length) return null;

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute ${
          confettiScope === "full" ? "fixed inset-0 z-50" : "top-0 left-0 z-20"
        }`}
      />

      {/* === YOUR ORIGINAL AWARDS DESIGN PRESERVED === */}
      <Card className="relative overflow-hidden backdrop-blur-sm bg-card/50 border border-white/10 shadow-2xl">
        <CardHeader className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CardTitle className="flex items-center gap-4 text-3xl justify-center">
              <motion.div
                animate={isInView ? { scale: 1.3, rotate: 15 } : {}}
                transition={{
                  duration: 1,
                  delay: 0.8,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold text-center">
                Awards & Recognition
              </span>
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                transition={{
                  delay: 1.5,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 150,
                }}
                className="ml-auto"
              >
                <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-white/20">
                  🎉 {awards.length} Award{awards.length > 1 ? "s" : ""} Won! 🏆
                </div>
              </motion.div>
            </CardTitle>
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 border-2 border-yellow-200/50 dark:border-yellow-800/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500"
              >
                {award.award_image_url && (
                  <div className="relative w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-yellow-200/50 dark:ring-yellow-800/50">
                    <Image
                      src={award.award_image_url}
                      alt={award.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="relative text-center space-y-3">
                  <h4 className="font-bold text-xl mb-3 text-yellow-800 dark:text-yellow-200">
                    {award.title}
                  </h4>
                  {award.awarded_by && (
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      🏆 by {award.awarded_by}
                    </p>
                  )}
                  {award.award_date && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-4">
                      📅{" "}
                      {new Date(award.award_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  )}
                  {award.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {award.description}
                    </p>
                  )}
                  {award.award_url && (
                    <a
                      href={award.award_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Certificate
                    </a>
                  )}
                </div>
                <Crown className="absolute top-2 left-2 w-5 h-5 text-yellow-500" />
                <Medal className="absolute bottom-2 right-2 w-5 h-5 text-orange-500" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
