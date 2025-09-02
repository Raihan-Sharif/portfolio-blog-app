// src/app/subscribe/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLeadMagnets } from '@/hooks/use-lead-magnets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReCaptchaV3Provider } from '@/components/providers/recaptcha-provider';
import { HybridRecaptcha } from '@/components/ui/hybrid-recaptcha';
import { LeadMagnet } from '@/types/newsletter';
import { 
  Gift,
  Download,
  Users,
  CheckCircle,
  ArrowRight,
  Mail,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';

interface SubscriptionFormData {
  email: string;
  firstName: string;
  lastName: string;
  recaptcha_token: string;
  recaptcha_version?: 'v2' | 'v3';
}

function SubscribePageContent(): JSX.Element {
  const searchParams = useSearchParams();
  const leadMagnetId = searchParams.get('magnet');
  
  const { leadMagnets, loading: magnetsLoading } = useLeadMagnets();
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SubscriptionFormData>({
    email: '',
    firstName: '',
    lastName: '',
    recaptcha_token: '',
    recaptcha_version: undefined,
  });

  // Set selected magnet based on URL parameter or default to first available
  useEffect(() => {
    if (leadMagnets.length > 0) {
      if (leadMagnetId) {
        const magnet = leadMagnets.find(lm => lm.id === leadMagnetId);
        setSelectedMagnet(magnet || leadMagnets[0]);
      } else {
        setSelectedMagnet(leadMagnets[0]);
      }
    }
  }, [leadMagnets, leadMagnetId]);

  const handleSubscribe = async (): Promise<void> => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setSubscribing(true);
      setError(null);

      const subscriptionData = {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        leadMagnet: selectedMagnet?.id || undefined,
        source: 'subscription_page',
        recaptcha_token: formData.recaptcha_token || 'development',
      };

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.details ? `${result.error}: ${result.details}` : result.error;
        throw new Error(errorMessage || 'Failed to subscribe');
      }

      setSuccess(true);

    } catch (error: any) {
      console.error('Subscription error:', error);
      console.error('Response details:', error.message);
      setError(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleRecaptchaVerify = useCallback((token: string, version: 'v2' | 'v3'): void => {
    setFormData(prev => ({ ...prev, recaptcha_token: token, recaptcha_version: version }));
  }, []);

  const handleScoreTooLow = useCallback((score: number): void => {
    setError(`Security score too low (${score.toFixed(2)}). Please complete the visual verification below.`);
  }, []);

  if (magnetsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
              <div className="h-12 bg-muted animate-pulse rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4 shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
              🎉 Welcome to the Community!
            </h2>
            
            <p className="text-green-700 dark:text-green-300 mb-6">
              {selectedMagnet 
                ? selectedMagnet.thank_you_message || "Thank you for subscribing! Check your email for the download link."
                : "Thank you for subscribing to our newsletter! You'll receive updates about the latest in web development and tech."
              }
            </p>

            {selectedMagnet && selectedMagnet.file_url && (
              <div className="mb-6">
                <Button
                  onClick={() => window.open(selectedMagnet.file_url, '_blank')}
                  className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {selectedMagnet.title}
                </Button>
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>No spam, unsubscribe anytime</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>Check your email for confirmation</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="text-sm"
              >
                Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            {selectedMagnet ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-r from-primary via-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4">
                  Get Your Free {selectedMagnet.title}
                </CardTitle>
                
                {selectedMagnet.description && (
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-6">
                    {selectedMagnet.description}
                  </p>
                )}

                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-green-500" />
                    <span>{selectedMagnet.download_count.toLocaleString()}+ Downloads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedMagnet.file_type?.toUpperCase() || 'PDF'}
                    </Badge>
                  </div>
                </div>

                {/* Show all available magnets as options if there are multiple */}
                {leadMagnets.length > 1 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">Or choose another resource:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {leadMagnets.filter(lm => lm.id !== selectedMagnet.id).slice(0, 3).map((magnet) => (
                        <button
                          key={magnet.id}
                          onClick={() => setSelectedMagnet(magnet)}
                          className="px-3 py-1 text-xs bg-muted hover:bg-accent rounded-full transition-colors"
                        >
                          {magnet.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gradient-to-r from-primary via-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4">
                  Join Our Newsletter
                </CardTitle>
                
                <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-6">
                  Get the latest updates on web development, tech trends, and exclusive resources delivered to your inbox.
                </p>

                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>1000+ subscribers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>Weekly updates</span>
                  </div>
                </div>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 text-base"
                  disabled={subscribing}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="h-12 text-base"
                    disabled={subscribing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-12 text-base"
                    disabled={subscribing}
                  />
                </div>
              </div>

              <HybridRecaptcha 
                action="newsletter_signup"
                onVerify={handleRecaptchaVerify}
                onScoreTooLow={handleScoreTooLow}
              />

              <Button
                onClick={handleSubscribe}
                disabled={subscribing || !formData.email || (process.env.NODE_ENV === 'production' && !formData.recaptcha_token)}
                className="w-full h-12 text-base bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {subscribing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                ) : selectedMagnet ? (
                  <Download className="mr-3 h-5 w-5" />
                ) : (
                  <Mail className="mr-3 h-5 w-5" />
                )}
                {subscribing 
                  ? 'Subscribing...' 
                  : selectedMagnet 
                    ? `Get Free ${selectedMagnet.file_type?.toUpperCase() || 'Resource'}` 
                    : 'Subscribe to Newsletter'
                }
                {!subscribing && <ArrowRight className="ml-3 h-5 w-5" />}
              </Button>

              <div className="text-center space-y-3">
                <Separator />
                
                <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>No spam ever</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>Unsubscribe anytime</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  By subscribing, you agree to receive email updates from us. 
                  You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscribePage(): JSX.Element {
  return (
    <ReCaptchaV3Provider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SubscribePageContent />
      </Suspense>
    </ReCaptchaV3Provider>
  );
}