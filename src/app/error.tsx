'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  if (!mounted) return <div />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 dark:from-slate-900 dark:via-red-900/20 dark:to-rose-900/20 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated Error SVG */}
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
            {/* Background warning triangles */}
            <motion.polygon
              points="100,150 130,100 70,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-orange-300 dark:text-orange-600"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.polygon
              points="700,300 730,250 670,250"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-300 dark:text-red-600"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: -360 }}
              transition={{ duration: 2.5, delay: 0.8 }}
            />

            {/* Main error illustration */}
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Computer monitor */}
              <rect x="300" y="180" width="200" height="120" rx="8" 
                    className="fill-current text-slate-700 dark:text-slate-300" stroke="currentColor" strokeWidth="2" />
              <rect x="310" y="190" width="180" height="90" rx="4" 
                    className="fill-current text-blue-100 dark:text-slate-800" />
              
              {/* Monitor stand */}
              <rect x="380" y="300" width="40" height="20" rx="4" 
                    className="fill-current text-slate-600 dark:text-slate-400" />
              <rect x="360" y="320" width="80" height="10" rx="5" 
                    className="fill-current text-slate-600 dark:text-slate-400" />

              {/* Error symbol on screen */}
              <motion.g
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <circle cx="400" cy="235" r="25" className="fill-current text-red-500" />
                <text x="400" y="245" textAnchor="middle" 
                      className="text-2xl font-bold fill-current text-white">!</text>
              </motion.g>
            </motion.g>

            {/* Floating error indicators */}
            <motion.g
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: 1
              }}
            >
              <circle cx="250" cy="120" r="8" className="fill-current text-red-400" />
              <text x="250" y="128" textAnchor="middle" 
                    className="text-sm font-bold fill-current text-white">X</text>
            </motion.g>

            <motion.g
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                delay: 1.5
              }}
            >
              <polygon points="550,140 570,120 570,160" 
                       className="fill-current text-orange-400" />
              <text x="570" y="145" textAnchor="middle" 
                    className="text-xs font-bold fill-current text-white">!</text>
            </motion.g>

            {/* Code lines with errors */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xs fill-current text-slate-600 dark:text-slate-400"
            >
              <text x="320" y="210">const app = () =&gt; {'{}'}</text>
              <text x="320" y="225" className="fill-current text-red-500">  throw new Error();</text>
              <text x="320" y="240">{'}'}</text>
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
              Something Went Wrong!
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Don't worry, it's not your fault! My code seems to be having a coffee break. 
              Let's try to get things back on track.
            </p>
            
            {error.digest && (
              <p className="text-sm text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg inline-block">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button 
              onClick={reset} 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/contact" className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Report Issue
              </Link>
            </Button>
          </motion.div>

          {/* Technical details (collapsible) */}
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="pt-8 border-t border-slate-200 dark:border-slate-700 max-w-2xl mx-auto text-left"
          >
            <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 justify-center">
              <Bug className="w-4 h-4" />
              Technical Details (for developers)
            </summary>
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                <strong>Error:</strong> {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-slate-600 dark:text-slate-400 mt-2 overflow-x-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          </motion.details>

          {/* Helpful message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-sm text-slate-500 dark:text-slate-500"
          >
            <p>
              This error has been automatically reported. If the problem persists, 
              please <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact me</Link> with the error ID above.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}