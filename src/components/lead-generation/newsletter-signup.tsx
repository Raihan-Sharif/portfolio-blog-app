'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReCAPTCHAComponent, { ReCAPTCHARef } from '@/components/ui/recaptcha';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Gift, 
  TrendingUp,
  Users,
  Bell,
  Star,
  Download,
  BookOpen,
  Code,
  Zap
} from 'lucide-react';
import { ANIMATIONS, GRADIENTS } from '@/lib/design-constants';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'featured';
  showBenefits?: boolean;
  leadMagnet?: {
    id: string;
    title: string;
    description: string;
    type: 'ebook' | 'checklist' | 'template' | 'course';
  };
}

const leadMagnets = [
  {
    id: 'web-dev-checklist',
    title: 'Ultimate Web Development Checklist',
    description: 'A comprehensive 50-point checklist for launching production-ready web applications',
    type: 'checklist' as const,
    icon: CheckCircle,
    fileSize: '2.5 MB PDF',
    benefits: ['SEO optimization steps', 'Performance benchmarks', 'Security best practices']
  },
  {
    id: 'react-template',
    title: 'Modern React.js Starter Template',
    description: 'Production-ready React template with TypeScript, Tailwind CSS, and best practices',
    type: 'template' as const,
    icon: Code,
    fileSize: 'GitHub Repository',
    benefits: ['Pre-configured build tools', 'Component library', 'Testing setup']
  },
  {
    id: 'performance-guide',
    title: 'Web Performance Optimization Guide',
    description: 'Learn how to achieve 90+ Lighthouse scores and lightning-fast load times',
    type: 'ebook' as const,
    icon: Zap,
    fileSize: '4.2 MB PDF',
    benefits: ['Core Web Vitals optimization', 'Image optimization techniques', 'Caching strategies']
  }
];

export default function NewsletterSignup({ 
  variant = 'default', 
  showBenefits = true,
  leadMagnet 
}: NewsletterSignupProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedMagnet, setSelectedMagnet] = useState(leadMagnet || leadMagnets[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHARef>(null);

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

    if (!recaptchaToken) {
      setErrorMessage('Please complete the security verification');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          firstName: firstName.trim(),
          leadMagnet: selectedMagnet.id,
          recaptcha_token: recaptchaToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        setFirstName('');
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-md';
      case 'featured':
        return 'max-w-4xl';
      default:
        return 'max-w-2xl';
    }
  };

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${getVariantStyles()} mx-auto`}
      >
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
          <CardContent className="p-8 text-center space-y-6">
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
                Welcome to the community! Check your email for:
              </p>
              
              <div className="bg-white/50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <selectedMagnet.icon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {selectedMagnet.title}
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 text-left">
                  {selectedMagnet.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setSubmitStatus('idle')}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
              >
                Subscribe Another Email
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <a href="/contact">
                  <Mail className="w-4 h-4 mr-2" />
                  Get In Touch
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...ANIMATIONS.fadeIn}
      className={`${getVariantStyles()} mx-auto`}
    >
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Free Resources
              </Badge>
            </div>
            
            <CardTitle className={`text-3xl font-bold mb-4 ${GRADIENTS.primaryText}`}>
              {variant === 'featured' ? 'Join 1000+ Developers' : 'Stay Updated'}
            </CardTitle>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Get exclusive web development insights, tutorials, and free resources delivered to your inbox
            </p>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Lead Magnet Selection */}
          {variant === 'featured' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Choose Your Free Resource:
              </h4>
              
              <div className="grid gap-3">
                {leadMagnets.map((magnet) => (
                  <motion.div
                    key={magnet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedMagnet.id === magnet.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedMagnet(magnet)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMagnet.id === magnet.id 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <magnet.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{magnet.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {magnet.fileSize}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {magnet.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {magnet.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedMagnet.id === magnet.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Newsletter Benefits */}
          {showBenefits && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Weekly tutorials & tips</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Exclusive community access</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Download className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Free resources & templates</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Early access to new content</span>
              </div>
            </motion.div>
          )}

          {/* Signup Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
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
                  placeholder="john@example.com"
                  required
                  disabled={isSubmitting}
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Security Verification</Label>
              <ReCAPTCHAComponent
                ref={recaptchaRef}
                onVerify={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => setRecaptchaToken(null)}
                theme="auto"
                size="normal"
              />
            </div>

            {/* Error Message */}
            {(submitStatus === 'error' || errorMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !email || !recaptchaToken}
              className="w-full bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] font-medium text-lg py-6 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    Get My Free {selectedMagnet.type === 'ebook' ? 'eBook' : 
                                selectedMagnet.type === 'checklist' ? 'Checklist' :
                                selectedMagnet.type === 'template' ? 'Template' : 'Course'}
                  </>
                )}
              </span>
            </Button>

            {/* Trust Indicators */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                Join 1000+ developers who trust our content
              </p>
              <p>No spam, unsubscribe anytime. We respect your privacy.</p>
            </div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
}