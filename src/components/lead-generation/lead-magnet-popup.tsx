'use client';

import { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { ANIMATIONS } from '@/lib/design-constants';
import { useLeadMagnets } from '@/hooks/use-lead-magnets';
import { LeadMagnet } from '@/types/newsletter';

interface LeadMagnetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'scroll' | 'time' | 'exit-intent' | 'manual';
  leadMagnetId?: string;
}

const defaultLeadMagnet = {
  title: "Ultimate Web Development Checklist",
  description: "A comprehensive 50-point checklist for launching production-ready web applications",
  benefits: [
    "SEO optimization steps",
    "Performance benchmarks", 
    "Security best practices",
    "Accessibility guidelines",
    "Testing strategies"
  ],
  type: 'checklist' as const
};

export default function LeadMagnetPopup({ 
  isOpen, 
  onClose, 
  trigger = 'manual',
  leadMagnetId 
}: LeadMagnetPopupProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  
  const { leadMagnets, loading } = useLeadMagnets();
  const selectedMagnet = leadMagnets.find(lm => lm.id === leadMagnetId) || leadMagnets[0];
  
  // Use default fallback if no dynamic lead magnets are available
  const leadMagnet = selectedMagnet ? {
    title: selectedMagnet.title,
    description: selectedMagnet.description || '',
    benefits: selectedMagnet.form_fields ? 
      (typeof selectedMagnet.form_fields === 'string' ? 
        JSON.parse(selectedMagnet.form_fields) : selectedMagnet.form_fields) || [] : [],
    type: selectedMagnet.file_type?.toLowerCase() as 'ebook' | 'checklist' | 'template' | 'course' || 'checklist'
  } : defaultLeadMagnet;

  // Countdown timer for limited time offers
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          leadMagnet: selectedMagnet?.id || 'popup-checklist',
          source: `popup-${trigger}`
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setEmail('');
        }, 3000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = () => {
    switch (leadMagnet.type) {
      case 'ebook': return '📚';
      case 'checklist': return '✅';
      case 'template': return '🎨';
      case 'course': return '🎓';
      default: return '🎁';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header with Gradient */}
              <div className="bg-gradient-to-br from-primary via-purple-600 to-blue-600 p-6 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />
                </div>

                <div className="relative z-10">
                  {/* Limited Time Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Limited Time: {formatTime(timeLeft)}
                    </Badge>
                    <Badge className="bg-yellow-500 text-black font-bold">
                      FREE
                    </Badge>
                  </div>

                  {/* Icon and Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{getTypeIcon()}</div>
                    <div>
                      <h3 className="text-xl font-bold leading-tight">
                        {leadMagnet.title}
                      </h3>
                      <p className="text-white/90 text-sm">
                        Usually $29 - Now FREE!
                      </p>
                    </div>
                  </div>

                  <p className="text-white/90 text-sm leading-relaxed">
                    {leadMagnet.description}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-green-800 dark:text-green-200">
                      🎉 Check Your Email!
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      Your free {leadMagnet.type} is on its way. Don't forget to check your spam folder!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Benefits List */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        What You'll Get:
                      </h4>
                      <ul className="space-y-2">
                        {leadMagnet.benefits.map((benefit: string, index: number) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="popup-email" className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Enter your email to get instant access
                        </Label>
                        <Input
                          id="popup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting}
                          className="bg-muted/30 border-border focus:border-primary"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="w-full bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium py-6"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Get My Free {leadMagnet.type.charAt(0).toUpperCase() + leadMagnet.type.slice(1)}
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
                          <span>1000+ downloads</span>
                        </div>
                        <span>•</span>
                        <span>No spam, unsubscribe anytime</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}