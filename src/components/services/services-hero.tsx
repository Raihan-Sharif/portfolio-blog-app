'use client';

import { ArrowRight, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ServicesHero(): JSX.Element {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/50 py-20 lg:py-32 overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.300)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.700)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-t from-cyan-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-full text-sm font-semibold backdrop-blur-sm shadow-lg">
            <Star className="w-4 h-4 fill-current text-primary" />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Professional Development Services
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="inline-block animate-fade-in-up">Transform Your</span>
              <span className="inline-block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] animate-bounce-gentle">
                {' '}Ideas{' '}
              </span>
              <span className="inline-block animate-fade-in-up animation-delay-300">Into</span>
              <br className="hidden sm:block" />
              <span className="inline-block animate-fade-in-up animation-delay-500">Digital</span>
              <span className="inline-block bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] animate-pulse-gentle animation-delay-700">
                {' '}Reality
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From concept to launch, we deliver exceptional web development, mobile apps, 
              and digital solutions that drive results and exceed expectations.
            </p>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-slate-800 dark:text-white mb-2">
                <Users className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                100+
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Happy Clients</p>
            </div>
            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-slate-800 dark:text-white mb-2">
                <Zap className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                200+
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Projects Completed</p>
            </div>
            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-slate-800 dark:text-white mb-2">
                <Star className="w-8 h-8 text-yellow-500 fill-current group-hover:scale-110 transition-transform" />
                99%
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Satisfaction Rate</p>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 text-white px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group transform hover:scale-105"
            >
              <Link href="#services" className="flex items-center gap-3 text-lg font-semibold">
                Explore Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-10 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Link href="/contact" className="text-lg font-semibold">
                Get Free Consultation
              </Link>
            </Button>
          </div>

          {/* Enhanced Trust indicators */}
          <div className="pt-12">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Trusted by companies worldwide
            </p>
            <div className="flex items-center justify-center gap-8 opacity-70">
              {/* Enhanced placeholder logos */}
              <div className="w-28 h-14 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                Tech Corp
              </div>
              <div className="w-28 h-14 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                StartupCo
              </div>
              <div className="w-28 h-14 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                Enterprise
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}