'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Gift, 
  Download, 
  Mail, 
  CheckCircle, 
  Star,
  Sparkles,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';
import { useLeadMagnets } from '@/hooks/use-lead-magnets';
import ReCAPTCHAComponent, { ReCAPTCHAV3Ref } from '@/components/ui/recaptcha';

interface ScrollTriggeredPopupProps {
  scrollPercentage?: number; // Percentage of page scroll to trigger popup
  enabled?: boolean;
}

export default function ScrollTriggeredPopup({ 
  scrollPercentage = 70, 
  enabled = true 
}: ScrollTriggeredPopupProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHAV3Ref>(null);
  
  const { leadMagnets, loading } = useLeadMagnets();
  const pathname = usePathname();

  // Get the first active lead magnet
  const activeMagnet = leadMagnets[0];

  // Don't show popup on newsletter/subscribe related pages
  const isNewsletterPage = pathname.startsWith('/subscribe') || 
                          pathname.startsWith('/unsubscribe') || 
                          pathname.includes('newsletter');

  // Check if popup was already dismissed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('leadMagnetPopupDismissed');
      const dismissedDate = dismissed ? new Date(dismissed) : null;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Show popup again after 24 hours
      if (!dismissed || (dismissedDate && dismissedDate < oneDayAgo)) {
        setHasBeenShown(false);
      } else {
        setHasBeenShown(true);
      }
    }
  }, []);

  // Handle scroll trigger
  useEffect(() => {
    if (!enabled || hasBeenShown || loading || !activeMagnet || isNewsletterPage) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      
      if (scrolled >= scrollPercentage && !isVisible) {
        setIsVisible(true);
        setHasBeenShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, hasBeenShown, loading, activeMagnet, scrollPercentage, isVisible, isNewsletterPage]);

  const handleClose = () => {
    setIsVisible(false);
    // Remember dismissal for 24 hours
    if (typeof window !== 'undefined') {
      localStorage.setItem('leadMagnetPopupDismissed', new Date().toISOString());
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Skip reCAPTCHA requirement in development for testing
    if (!recaptchaToken && process.env.NODE_ENV === 'production') {
      setErrorMessage('Please complete the security verification');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Use the API endpoint to ensure proper handling
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          firstName: firstName.trim() || null,
          leadMagnet: activeMagnet.id,
          source: 'scroll_popup',
          recaptcha_token: recaptchaToken || 'development'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      setEmail('');
      setFirstName('');
      
      // Auto-close success popup after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
      setRecaptchaToken(null);
    }
  };

  // Don't render if disabled, loading, no magnet, already shown, or on newsletter pages
  if (!enabled || loading || !activeMagnet || hasBeenShown || isNewsletterPage) {
    return <></>;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {isSuccess ? (
                /* Success State */
                <div className="p-8 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                      🎉 You're All Set!
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Check your email for your free resource:
                    </p>
                    
                    <div className="bg-white/50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Gift className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          {activeMagnet.title}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 text-left">
                        {activeMagnet.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Signup Form */
                <>
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/15 -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/15 -ml-12 -mb-12" />
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white/10 -ml-8 -mt-8" />
                    </div>

                    <div className="relative z-10">
                      {/* Badge and Title */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-white/25 text-white border-white/40 hover:bg-white/35 backdrop-blur-sm">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Free Resource
                        </Badge>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold shadow-lg">
                          FREE
                        </Badge>
                      </div>

                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">🎁</div>
                        <div>
                          <h3 className="text-xl font-bold leading-tight">
                            {activeMagnet.title}
                          </h3>
                          <p className="text-white/90 text-sm">
                            Grab it before it's gone!
                          </p>
                        </div>
                      </div>

                      <p className="text-white/95 text-sm leading-relaxed font-medium">
                        {activeMagnet.description}
                      </p>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name (Optional)
                        </Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          disabled={isSubmitting}
                          className="bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting}
                          className="bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      {/* reCAPTCHA */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Security Verification</Label>
                        <ReCAPTCHAComponent
                          ref={recaptchaRef}
                          onVerify={setRecaptchaToken}
                          onError={() => setRecaptchaToken(null)}
                          action="newsletter_popup"
                          autoExecute={true}
                        />
                      </div>

                      {/* Error Message */}
                      {errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 flex items-center gap-2"
                        >
                          <X className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {errorMessage}
                          </span>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-6 transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Get My Free {activeMagnet.file_type || 'Resource'}
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{activeMagnet.download_count || 0}+ downloads</span>
                        </div>
                        <span>•</span>
                        <span>No spam, unsubscribe anytime</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}