'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Sparkles, 
  Code, 
  Zap, 
  Users, 
  Star,
  MessageCircle,
  Download,
  TrendingUp
} from 'lucide-react';
import { ANIMATIONS, GRADIENTS } from '@/lib/design-constants';
import Link from 'next/link';

interface CTABannerProps {
  variant?: 'newsletter' | 'contact' | 'services' | 'projects';
  className?: string;
  showStats?: boolean;
}

const variants = {
  newsletter: {
    title: "Ready to Level Up Your Development Skills?",
    subtitle: "Join 1000+ developers getting weekly insights, tutorials, and exclusive resources",
    primaryAction: "Get Free Resources",
    primaryHref: "#newsletter",
    secondaryAction: "View Projects",
    secondaryHref: "/projects",
    icon: Download,
    gradient: "from-blue-600 via-purple-600 to-indigo-600",
    bgPattern: "from-blue-500/10 via-purple-500/10 to-indigo-500/10"
  },
  contact: {
    title: "Let's Build Something Amazing Together",
    subtitle: "Transform your ideas into production-ready applications with modern web technologies",
    primaryAction: "Start Your Project",
    primaryHref: "/contact",
    secondaryAction: "View Services",
    secondaryHref: "/services",
    icon: MessageCircle,
    gradient: "from-green-600 via-emerald-600 to-teal-600",
    bgPattern: "from-green-500/10 via-emerald-500/10 to-teal-500/10"
  },
  services: {
    title: "Professional Web Development Services",
    subtitle: "Full-stack solutions tailored to your business needs with cutting-edge technologies",
    primaryAction: "Explore Services",
    primaryHref: "/services",
    secondaryAction: "Get Quote",
    secondaryHref: "/contact",
    icon: Code,
    gradient: "from-orange-600 via-red-600 to-pink-600",
    bgPattern: "from-orange-500/10 via-red-500/10 to-pink-500/10"
  },
  projects: {
    title: "See What's Possible",
    subtitle: "Explore real-world projects and case studies showcasing modern web development",
    primaryAction: "View Portfolio",
    primaryHref: "/projects",
    secondaryAction: "Contact Me",
    secondaryHref: "/contact",
    icon: Sparkles,
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    bgPattern: "from-purple-500/10 via-violet-500/10 to-indigo-500/10"
  }
};

const stats = [
  { label: "Projects Delivered", value: "100+", icon: Code },
  { label: "Happy Clients", value: "50+", icon: Users },
  { label: "Years Experience", value: "6+", icon: Star },
  { label: "Technologies", value: "20+", icon: Zap }
];

export default function CTABanner({ 
  variant = 'contact', 
  className = '',
  showStats = false 
}: CTABannerProps): JSX.Element {
  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <section className={`relative overflow-hidden py-20 ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgPattern} opacity-50`} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(90deg, currentColor 1px, transparent 1px),
                linear-gradient(currentColor 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Main Content */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-2xl`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-2"
              >
                {variant === 'newsletter' ? 'Free Resources' : 
                 variant === 'contact' ? 'Available Now' :
                 variant === 'services' ? 'Professional Services' : 'Live Projects'}
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${GRADIENTS.primaryText} leading-tight`}
            >
              {config.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed"
            >
              {config.subtitle}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                asChild
                size="lg"
                className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-medium text-lg px-8 py-6 relative overflow-hidden group`}
              >
                <Link href={config.primaryHref}>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    {config.primaryAction}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-lg px-8 py-6"
              >
                <Link href={config.secondaryHref}>
                  {config.secondaryAction}
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>Trusted by developers worldwide</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                ))}
                <span className="ml-2">4.9/5 rating</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>100% satisfaction rate</span>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}