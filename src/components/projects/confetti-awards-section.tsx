// components/projects/awesome-confetti-awards-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { Crown, ExternalLink, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
  gravity: number;
  drift: number;
  glowIntensity: number;
}

// Enhanced Canvas-based Confetti System with Proper Looping
const useAdvancedConfetti = (trigger: boolean, shouldLoop: boolean = false) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isAnimatingRef = useRef(false);
  const loopTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const colors = [
    '#FFD700', '#FF6B35', '#F7931E', '#FFB300', '#FF5722',
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
    '#FF9800', '#795548', '#607D8B', '#F44336', '#9E9E9E'
  ];

  const createParticle = useCallback((x: number, y: number, burstIntensity: number = 1): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 12 + 6) * burstIntensity;
    const life = Math.random() * 240 + 180; // 3-7 seconds at 60fps
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
      vy: Math.sin(angle) * speed - Math.random() * 8 - 6, // Strong upward velocity
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'][Math.floor(Math.random() * 6)] as Particle['shape'],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      life,
      maxLife: life,
      gravity: 0.2 + Math.random() * 0.15,
      drift: (Math.random() - 0.5) * 0.03,
      glowIntensity: Math.random() * 0.8 + 0.2
    };
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.opacity;
    
    const halfSize = particle.size / 2;
    
    // Enhanced glow effects
    if (particle.shape === 'star' || particle.shape === 'heart') {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 12 * particle.glowIntensity;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Gradient fill for more realistic appearance
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.7, particle.color);
    gradient.addColorStop(1, particle.color + '80');
    ctx.fillStyle = gradient;
    
    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(-halfSize, halfSize);
        ctx.lineTo(halfSize, halfSize);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'star':
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = halfSize;
        const innerRadius = halfSize * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'heart':
        const heartSize = halfSize * 0.9;
        ctx.beginPath();
        ctx.moveTo(0, heartSize * 0.3);
        ctx.bezierCurveTo(-heartSize, -heartSize * 0.5, -heartSize, heartSize * 0.3, 0, heartSize);
        ctx.bezierCurveTo(heartSize, heartSize * 0.3, heartSize, -heartSize * 0.5, 0, heartSize * 0.3);
        ctx.fill();
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(halfSize, 0);
        ctx.lineTo(0, halfSize);
        ctx.lineTo(-halfSize, 0);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }, []);

  const updateParticle = useCallback((particle: Particle): boolean => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity; // Apply gravity
    particle.vx += particle.drift; // Wind effect
    particle.rotation += particle.rotationSpeed;
    particle.life--;
    
    // Smooth fade out over time
    particle.opacity = Math.max(0, (particle.life / particle.maxLife) * 0.95);
    
    // Gradual slowdown
    particle.vx *= 0.9985;
    particle.vy *= 0.998;
    
    // Particle stays alive if within bounds and has life
    return particle.life > 0 && particle.y < window.innerHeight + 100 && particle.opacity > 0.01;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particlesRef.current = particlesRef.current.filter(particle => {
      const alive = updateParticle(particle);
      if (alive) {
        drawParticle(ctx, particle);
      }
      return alive;
    });
    
    // Continue animation if particles exist or we're still animating
    if (particlesRef.current.length > 0 || isAnimatingRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [updateParticle, drawParticle]);

  const createBurst = useCallback((intensity: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Multiple burst points for spectacular effect
    const burstPoints = [
      { x: canvas.width * 0.2, y: canvas.height * 0.4 },
      { x: canvas.width * 0.4, y: canvas.height * 0.3 },
      { x: canvas.width * 0.5, y: canvas.height * 0.25 },
      { x: canvas.width * 0.6, y: canvas.height * 0.3 },
      { x: canvas.width * 0.8, y: canvas.height * 0.4 },
    ];
    
    burstPoints.forEach((point, index) => {
      setTimeout(() => {
        const particleCount = Math.floor((25 + Math.random() * 20) * intensity);
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push(createParticle(point.x, point.y, intensity));
        }
      }, index * 80);
    });
    
    // Center mega burst
    setTimeout(() => {
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.3;
      const megaParticleCount = Math.floor(60 * intensity);
      
      for (let i = 0; i < megaParticleCount; i++) {
        particlesRef.current.push(createParticle(centerX, centerY, intensity * 1.2));
      }
    }, 150);
  }, [createParticle]);

  const startConfetti = useCallback(() => {
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    startTimeRef.current = Date.now();
    
    // Initial spectacular burst
    createBurst(1.2);
    
    // Additional bursts for extended effect
    const additionalBursts = [500, 1200, 2000, 3200];
    additionalBursts.forEach((delay, index) => {
      setTimeout(() => {
        if (isAnimatingRef.current) {
          createBurst(0.8 - index * 0.1);
        }
      }, delay);
    });
    
    // Main animation duration
    setTimeout(() => {
      isAnimatingRef.current = false;
      
      // Setup looping if enabled
      if (shouldLoop) {
        loopTimeoutRef.current = setTimeout(() => {
          if (trigger) {
            startConfetti();
          }
        }, 2000); // 2 second pause between loops
      }
    }, 5000);
    
    animate();
  }, [animate, createBurst, shouldLoop, trigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (trigger) {
      startConfetti();
    } else {
      isAnimatingRef.current = false;
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    }
  }, [trigger, startConfetti]);

  return canvasRef;
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
      {/* Restored beautiful background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 rounded-2xl"
        style={{
          willChange: "opacity",
        }}
        animate={
          hasTriggered
            ? {
                opacity: 0.25,
              }
            : { opacity: 0.1 }
        }
        transition={{
          duration: 2,
          delay: hasTriggered ? index * 0.25 + 2.5 : 0,
          repeat: hasTriggered ? 3 : 0,
          repeatType: "reverse",
          ease: "easeInOut"
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
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.25 + 3 + i * 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1,
                ease: "easeInOut"
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
                    opacity: 0.5,
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 1.5,
              delay: index * 0.25 + 2.5,
              repeat: hasTriggered ? 2 : 0,
              repeatType: "reverse",
              repeatDelay: 1,
              ease: "easeInOut"
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
    amount: 0.2,
    margin: "-50px",
  });

  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [shouldLoop, setShouldLoop] = useState(false);
  const confettiCanvasRef = useAdvancedConfetti(hasTriggeredConfetti, shouldLoop);

  useEffect(() => {
    if (isInView && !hasTriggeredConfetti) {
      const timer = setTimeout(() => {
        setHasTriggeredConfetti(true);
        // Enable looping for continuous celebration
        setShouldLoop(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isInView, hasTriggeredConfetti]);

  if (!awards || awards.length === 0) return null;

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* Enhanced Canvas Confetti */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-40"
        style={{ width: '100%', height: '100%' }}
      />
      
      <Card className="relative backdrop-blur-sm bg-card/60 border border-yellow-200/30 dark:border-yellow-800/30 shadow-2xl overflow-hidden">

        {/* Enhanced Celebration background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-500/8 via-orange-500/12 to-red-500/8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: hasTriggeredConfetti ? 0.5 : 0,
            scale: hasTriggeredConfetti ? 1 : 0.9,
          }}
          transition={{ 
            duration: 1.5, 
            delay: 0.5,
            ease: "easeInOut"
          }}
        />

        <CardHeader className="relative z-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CardTitle className="flex items-center gap-4 text-2xl md:text-3xl justify-center flex-wrap">
              <motion.div
                animate={
                  hasTriggeredConfetti
                    ? {
                        scale: 1.3,
                        rotate: 15,
                      }
                    : {}
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

              {/* Enhanced award count celebration badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={
                  hasTriggeredConfetti
                    ? {
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                      }
                    : {}
                }
                transition={{
                  delay: 1.2,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 150,
                }}
              >
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg border border-white/20"
                  animate={
                    hasTriggeredConfetti ? {
                      boxShadow: [
                        "0 4px 15px rgba(255, 165, 0, 0.3)",
                        "0 6px 25px rgba(255, 165, 0, 0.5)",
                        "0 4px 15px rgba(255, 165, 0, 0.3)"
                      ]
                    } : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: hasTriggeredConfetti ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  🎉 {awards.length} Award{awards.length > 1 ? "s" : ""}! 🏆
                </motion.div>
              </motion.div>
            </CardTitle>
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
