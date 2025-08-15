'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound(): JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated 404 SVG */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-64 md:h-80"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circles */}
            <motion.circle
              cx="150" cy="200" r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-300 dark:text-blue-600"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.circle
              cx="650" cy="200" r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-purple-300 dark:text-purple-600"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            />

            {/* 404 Text */}
            <motion.text
              x="400" y="220"
              textAnchor="middle"
              className="text-8xl md:text-9xl font-bold fill-current text-slate-800 dark:text-slate-200"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              404
            </motion.text>

            {/* Floating elements */}
            <motion.circle
              cx="100" cy="100" r="4"
              className="fill-current text-blue-400 dark:text-blue-500"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.circle
              cx="700" cy="80" r="6"
              className="fill-current text-purple-400 dark:text-purple-500"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />
            <motion.circle
              cx="750" cy="320" r="3"
              className="fill-current text-indigo-400 dark:text-indigo-500"
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 1.8,
                repeat: Infinity,
                delay: 0.8
              }}
            />

            {/* Astronaut/Robot SVG */}
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              {/* Robot body */}
              <rect x="350" y="280" width="100" height="80" rx="10" 
                    className="fill-current text-slate-600 dark:text-slate-400" />
              {/* Robot head */}
              <circle cx="400" cy="260" r="25" 
                      className="fill-current text-slate-700 dark:text-slate-300" />
              {/* Eyes */}
              <circle cx="390" cy="255" r="3" 
                      className="fill-current text-blue-500" />
              <circle cx="410" cy="255" r="3" 
                      className="fill-current text-blue-500" />
              {/* Antenna */}
              <line x1="400" y1="235" x2="400" y2="220" 
                    stroke="currentColor" strokeWidth="2" 
                    className="text-slate-600 dark:text-slate-400" />
              <circle cx="400" cy="218" r="4" 
                      className="fill-current text-red-500" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-200">
              Oops! Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The page you're looking for seems to have wandered off into the digital void. 
              Don't worry, even the best developers get lost sometimes!
            </p>
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/projects" className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Browse Projects
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/contact" className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Me
              </Link>
            </Button>
          </motion.div>

          {/* Helpful links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="pt-8 border-t border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Maybe you were looking for:
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
                About Me
              </Link>
              <span className="text-slate-400">•</span>
              <Link href="/services" className="text-blue-600 dark:text-blue-400 hover:underline">
                My Services
              </Link>
              <span className="text-slate-400">•</span>
              <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
                Blog Posts
              </Link>
              <span className="text-slate-400">•</span>
              <Link href="/skills" className="text-blue-600 dark:text-blue-400 hover:underline">
                Skills & Experience
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}