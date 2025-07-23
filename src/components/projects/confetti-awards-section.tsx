// components/projects/awesome-confetti-awards-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { Crown, ExternalLink, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
}

// Enhanced confetti particle with realistic physics
const RealisticConfettiParticle = ({
  delay = 0,
  index = 0,
}: {
  delay?: number;
  index?: number;
}) => {
  const colors = [
    "#FFD700",
    "#FF6B35",
    "#F7931E",
    "#FFB300",
    "#FF5722",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#00BCD4",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFC107",
    "#FF9800",
    "#795548",
    "#607D8B",
    "#F44336",
    "#E91E63",
  ];

  const shapes = ["circle", "square", "triangle", "star", "diamond"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

  // Enhanced physics parameters for longer animation
  const initialVelocityX = (Math.random() - 0.5) * 700; // Wider horizontal spread
  const initialVelocityY = -Math.random() * 400 - 300; // Higher upward velocity
  const gravity = 650; // Slightly reduced gravity for longer flight
  const size = Math.random() * 12 + 4; // 4-16px particles
  const rotationSpeed = (Math.random() - 0.5) * 540; // More rotation
  const duration = 6.5 + Math.random() * 1; // 6.5-7.5 second duration

  // Calculate realistic trajectory
  const calculatePosition = (time: number) => {
    const x = initialVelocityX * time;
    const y = initialVelocityY * time + 0.5 * gravity * time * time;
    return { x, y };
  };

  // Generate smooth trajectory points for longer duration
  const trajectory = [];
  const steps = 70; // More steps for 7-second smooth animation
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration;
    const pos = calculatePosition(t);
    trajectory.push(pos);
  }

  const getShapeStyle = () => {
    const baseStyle = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: randomColor,
      border: `1px solid ${randomColor}`,
    };

    switch (randomShape) {
      case "circle":
        return { ...baseStyle, borderRadius: "50%" };
      case "square":
        return { ...baseStyle, borderRadius: "2px" };
      case "triangle":
        return {
          width: 0,
          height: 0,
          backgroundColor: "transparent",
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${randomColor}`,
        };
      case "star":
        return {
          ...baseStyle,
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        };
      case "diamond":
        return {
          ...baseStyle,
          borderRadius: "4px",
          transform: "rotate(45deg)",
        };
      default:
        return { ...baseStyle, borderRadius: "50%" };
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        scale: 0.3,
      }}
      animate={{
        x: trajectory.map((p) => p.x),
        y: trajectory.map((p) => p.y),
        rotate: rotationSpeed,
        opacity: [1, 1, 1, 1, 0.8, 0.5, 0.2, 0], // Extended fade over 7 seconds
        scale: [0.3, 1, 0.95, 0.9, 0.7, 0.5, 0.3, 0.1], // Gradual scale down
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "linear",
        times: trajectory.map((_, i) => i / (trajectory.length - 1)),
      }}
      style={getShapeStyle()}
    />
  );
};

// Confetti cannon with burst pattern
const ConfettiCannon = ({
  position,
  trigger,
  particleCount = 30,
  delay = 0,
}: {
  position: { x: number; y: number };
  trigger: boolean;
  particleCount?: number;
  delay?: number;
}) => {
  if (!trigger) return null;

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      {Array.from({ length: particleCount }).map((_, i) => (
        <RealisticConfettiParticle
          key={i}
          delay={delay + i * 0.008} // Faster stagger
          index={i}
        />
      ))}
    </div>
  );
};

// Epic confetti system with multiple cannons
const EpicConfettiBurst = ({ trigger }: { trigger: boolean }) => {
  if (!trigger) return null;

  // Strategic cannon positions for realistic burst
  const cannonPositions = [
    { x: 20, y: 60 }, // Left
    { x: 40, y: 55 }, // Left-center
    { x: 50, y: 50 }, // Center
    { x: 60, y: 55 }, // Right-center
    { x: 80, y: 60 }, // Right
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {cannonPositions.map((position, index) => (
        <ConfettiCannon
          key={index}
          position={position}
          trigger={trigger}
          particleCount={35 + Math.random() * 15} // 35-50 particles
          delay={index * 0.05} // Quick succession
        />
      ))}

      {/* Center mega burst */}
      <ConfettiCannon
        position={{ x: 50, y: 50 }}
        trigger={trigger}
        particleCount={60}
        delay={0.1}
      />
    </div>
  );
};

// Enhanced Award Card with fixed animations
const CelebrationAwardCard = ({
  award,
  index,
  hasTriggered,
}: {
  award: ProjectAward;
  index: number;
  hasTriggered: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8, rotateY: -15 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
      }}
      transition={{
        duration: 0.8,
        delay: hasTriggered ? index * 0.25 + 2 : index * 0.25, // Slightly longer delay for extended confetti
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 border-2 border-yellow-200/50 dark:border-yellow-800/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 rounded-2xl"
        animate={
          hasTriggered
            ? {
                opacity: [0.1, 0.3, 0.1],
              }
            : {}
        }
        transition={{
          duration: 4, // Extended background animation
          delay: hasTriggered ? index * 0.25 + 2.5 : 0, // Adjusted timing
          repeat: hasTriggered ? Infinity : 0,
          repeatType: "reverse",
        }}
      />

      {/* Sparkle effects around the card */}
      {hasTriggered && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: index * 0.25 + 3 + i * 0.3, // Adjusted for longer confetti duration
                repeat: Infinity,
                repeatDelay: 4,
              }}
            />
          ))}
        </>
      )}

      {/* Award Image with enhanced animation */}
      {award.award_image_url && (
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-yellow-200/50 dark:ring-yellow-800/50"
          animate={
            hasTriggered
              ? {
                  scale: 1.1,
                  rotate: 10,
                }
              : { scale: 1, rotate: 0 }
          }
          transition={{
            duration: 0.8,
            delay: index * 0.25 + 3, // Extended timing for award image
            type: "spring",
            stiffness: 200,
          }}
          whileHover={{
            scale: 1.15,
            rotate: 15,
            transition: { duration: 0.3 },
          }}
        >
          <Image
            src={award.award_image_url}
            alt={award.title}
            fill
            className="object-cover"
          />

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full"
            animate={
              hasTriggered
                ? {
                    opacity: [0, 0.5, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              delay: index * 0.25 + 2.5, // Adjusted for extended confetti
              repeat: hasTriggered ? Infinity : 0,
              repeatDelay: 4, // Longer delay between repeats for extended effect
            }}
          />
        </motion.div>
      )}

      {/* Enhanced content with staggered animations */}
      <div className="relative text-center space-y-3">
        <motion.h4
          className="font-bold text-xl mb-3 text-yellow-800 dark:text-yellow-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: hasTriggered ? index * 0.25 + 3.5 : index * 0.25 + 0.5,
            duration: 0.6,
          }}
        >
          {award.title}
        </motion.h4>

        {award.awarded_by && (
          <motion.p
            className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: hasTriggered ? index * 0.25 + 3.7 : index * 0.25 + 0.7,
              duration: 0.6,
            }}
          >
            🏆 by {award.awarded_by}
          </motion.p>
        )}

        {award.award_date && (
          <motion.p
            className="text-xs text-yellow-600 dark:text-yellow-400 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: hasTriggered ? index * 0.25 + 3.9 : index * 0.25 + 0.9,
              duration: 0.6,
            }}
          >
            📅{" "}
            {new Date(award.award_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </motion.p>
        )}

        {award.description && (
          <motion.p
            className="text-sm text-muted-foreground mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: hasTriggered ? index * 0.25 + 4.1 : index * 0.25 + 1.1,
              duration: 0.6,
            }}
          >
            {award.description}
          </motion.p>
        )}

        {award.award_url && (
          <motion.a
            href={award.award_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: hasTriggered ? index * 0.25 + 4.3 : index * 0.25 + 1.3,
              duration: 0.6,
            }}
          >
            <ExternalLink className="w-4 h-4" />
            View Certificate
          </motion.a>
        )}
      </div>

      {/* Enhanced decorative elements (Fixed animations) */}
      <motion.div
        className="absolute top-4 right-4 opacity-30"
        animate={
          hasTriggered
            ? {
                rotate: 360,
                scale: 1.2,
              }
            : { rotate: 0, scale: 1 }
        }
        transition={{
          duration: 2,
          delay: hasTriggered ? index * 0.25 + 2 : 0, // Adjusted timing
          repeat: hasTriggered ? Infinity : 0,
          repeatType: "loop",
        }}
      >
        <Trophy className="w-8 h-8 text-yellow-600" />
      </motion.div>

      {/* Corner decorations with fixed animations */}
      <motion.div
        className="absolute top-2 left-2"
        animate={
          hasTriggered
            ? {
                scale: 1,
                rotate: 180,
              }
            : { scale: 0, rotate: 0 }
        }
        transition={{
          duration: 1,
          delay: index * 0.25 + 2.5, // Extended timing for longer confetti
          type: "spring",
          stiffness: 200,
        }}
      >
        <Crown className="w-5 h-5 text-yellow-500" />
      </motion.div>

      <motion.div
        className="absolute bottom-2 right-2"
        animate={
          hasTriggered
            ? {
                scale: 1,
                rotate: -180,
              }
            : { scale: 0, rotate: 0 }
        }
        transition={{
          duration: 1,
          delay: index * 0.25 + 3, // Extended timing for longer confetti
          type: "spring",
          stiffness: 200,
        }}
      >
        <Medal className="w-5 h-5 text-orange-500" />
      </motion.div>
    </motion.div>
  );
};

export function ConfettiAwardsSection({ awards }: ConfettiAwardsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    threshold: 0.3,
    margin: "-50px",
  });

  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isInView && !hasTriggeredConfetti) {
      const timer = setTimeout(() => {
        setHasTriggeredConfetti(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isInView, hasTriggeredConfetti]);

  if (!awards || awards.length === 0) return null;

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <Card className="relative overflow-hidden backdrop-blur-sm bg-card/50 border border-white/10 shadow-2xl">
        {/* Epic confetti burst effect */}
        <EpicConfettiBurst trigger={hasTriggeredConfetti} />

        {/* Celebration background wave */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/10 to-red-500/5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: hasTriggeredConfetti ? 1 : 0,
            scale: hasTriggeredConfetti ? 1 : 0.8,
          }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <CardHeader className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CardTitle className="flex items-center gap-4 text-3xl justify-center">
              <motion.div
                animate={
                  hasTriggeredConfetti
                    ? {
                        scale: 1.3,
                        rotate: 15,
                      }
                    : { scale: 1, rotate: 0 }
                }
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

              {/* Award count celebration badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={
                  hasTriggeredConfetti
                    ? {
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                      }
                    : { scale: 0, opacity: 0, rotate: -180 }
                }
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
              <CelebrationAwardCard
                key={award.id}
                award={award}
                index={index}
                hasTriggered={hasTriggeredConfetti}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
