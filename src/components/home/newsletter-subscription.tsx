'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NewsletterSignup from '@/components/lead-generation/newsletter-signup';
import { useLeadMagnets } from '@/hooks/use-lead-magnets';
import { ANIMATIONS } from '@/lib/design-constants';

export default function NewsletterSubscription(): JSX.Element {
  const { leadMagnets, loading } = useLeadMagnets();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="text-center">
                <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
                <div className="h-4 bg-muted rounded w-96 mx-auto" />
              </div>
              <div className="bg-card rounded-2xl p-8">
                <div className="h-64 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't show if no lead magnets are available
  if (!leadMagnets || leadMagnets.length === 0) {
    return <></>;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-purple-300/20 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300/20 to-primary/20 -ml-40 -mb-40" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          {...ANIMATIONS.fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
            Get Free Developer Resources
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join 1000+ developers getting exclusive tutorials, templates, and insights delivered to their inbox
          </p>
        </motion.div>

        <motion.div
          {...ANIMATIONS.fadeInUp}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <NewsletterSignup 
            variant="featured" 
            showBenefits={true}
            leadMagnetId={leadMagnets[0]?.id}
          />
        </motion.div>
      </div>
    </section>
  );
}