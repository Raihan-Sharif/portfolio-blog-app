// src/app/unsubscribe/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/utils/supabase/client';
import { 
  CheckCircle,
  Heart,
  Mail,
  Pause,
  Settings,
  Trash2,
  User,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface UnsubscribeReason {
  id: string;
  label: string;
  description?: string;
}

const unsubscribeReasons: UnsubscribeReason[] = [
  {
    id: 'too_frequent',
    label: 'Too many emails',
    description: 'I receive emails too often'
  },
  {
    id: 'not_relevant',
    label: 'Content not relevant',
    description: 'The content doesn\'t match my interests'
  },
  {
    id: 'no_longer_interested',
    label: 'No longer interested',
    description: 'I\'m no longer interested in this topic'
  },
  {
    id: 'never_subscribed',
    label: 'Never subscribed',
    description: 'I don\'t remember subscribing to this newsletter'
  },
  {
    id: 'temporary_pause',
    label: 'Temporary break',
    description: 'I want to take a break but might return later'
  },
  {
    id: 'other',
    label: 'Other reason',
    description: 'Please specify below'
  },
];

function UnsubscribePageContent(): JSX.Element {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriberData, setSubscriberData] = useState<any>(null);
  
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [wantsPause, setWantsPause] = useState<boolean>(false);
  const [step, setStep] = useState<'verify' | 'feedback' | 'confirm' | 'complete'>('verify');

  const supabase = createClient();

  const verifyUnsubscribeToken = async (): Promise<void> => {
    if (!email || !token) {
      setError('Invalid unsubscribe link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // In a real implementation, you would verify the token
      // For now, we'll just check if the subscriber exists
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error('Subscriber not found or already unsubscribed');
      }

      setSubscriberData(data);
      setStep('feedback');
    } catch (error: any) {
      console.error('Error verifying unsubscribe token:', error);
      setError(error.message || 'Failed to verify unsubscribe link');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (): Promise<void> => {
    if (!subscriberData) return;

    try {
      setProcessing(true);
      setError(null);

      // Update subscriber status
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: wantsPause ? 'paused' : 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriberData.id);

      if (updateError) throw updateError;

      // Save feedback if provided
      if (selectedReason || feedback) {
        try {
          await supabase
            .from('unsubscribe_feedback')
            .insert([{
              subscriber_id: subscriberData.id,
              email: subscriberData.email,
              reason: selectedReason,
              feedback: feedback,
              wants_pause: wantsPause,
              created_at: new Date().toISOString(),
            }]);
        } catch (feedbackError) {
          console.warn('Failed to save feedback:', feedbackError);
          // Don't fail the unsubscribe process if feedback fails
        }
      }

      setStep('complete');
      setSuccess(true);
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      setError(error.message || 'Failed to unsubscribe. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleResubscribe = async (): Promise<void> => {
    if (!subscriberData) return;

    try {
      setProcessing(true);
      setError(null);

      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          resubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriberData.id);

      if (error) throw error;

      setStep('complete');
      setSuccess(true);
    } catch (error: any) {
      console.error('Error resubscribing:', error);
      setError(error.message || 'Failed to resubscribe. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    verifyUnsubscribeToken();
  }, [email, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="p-8">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Verifying unsubscribe link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
              Something went wrong
            </h2>
            
            <p className="text-red-700 dark:text-red-300 mb-6">
              {error}
            </p>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete' && success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
              {wantsPause ? '⏸️ Subscription Paused' : '✅ Successfully Unsubscribed'}
            </h2>
            
            <p className="text-green-700 dark:text-green-300 mb-6">
              {wantsPause 
                ? `We've paused your subscription for ${email}. You can resubscribe anytime by clicking the link in any of our previous emails.`
                : `We're sorry to see you go! You have been successfully unsubscribed from our newsletter. We hope to see you back someday.`
              }
            </p>

            {feedback && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm font-medium mb-2">Thank you for your feedback:</p>
                <p className="text-sm text-muted-foreground">"{feedback}"</p>
              </div>
            )}
            
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Back to Homepage
              </Button>
              
              {!wantsPause && (
                <p className="text-xs text-muted-foreground">
                  Changed your mind? You can always subscribe again on our homepage.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'feedback' ? (
                <Heart className="h-8 w-8 text-white" />
              ) : (
                <Mail className="h-8 w-8 text-white" />
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {step === 'feedback' ? 'Before You Go...' : 'Confirm Unsubscribe'}
            </CardTitle>
            
            <p className="text-muted-foreground">
              {step === 'feedback' 
                ? `We'd love to understand why you're leaving and see if we can improve.`
                : `You're about to unsubscribe ${email} from our newsletter.`
              }
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {step === 'feedback' && (
              <div className="space-y-6">
                {/* Alternative Options */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    💡 Alternative Options
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900">
                      <Checkbox
                        id="pause"
                        checked={wantsPause}
                        onCheckedChange={(checked) => setWantsPause(checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="pause" className="font-medium cursor-pointer">
                          Pause instead of unsubscribe
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Take a break and easily resubscribe later
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    What's the main reason for leaving? (Optional)
                  </Label>
                  
                  <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                    <div className="space-y-3">
                      {unsubscribeReasons.map((reason) => (
                        <div key={reason.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem 
                            value={reason.id} 
                            id={reason.id}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={reason.id} className="font-medium cursor-pointer">
                              {reason.label}
                            </Label>
                            {reason.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {reason.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Additional Feedback */}
                {(selectedReason === 'other' || selectedReason) && (
                  <div className="space-y-2">
                    <Label htmlFor="feedback">
                      {selectedReason === 'other' ? 'Please tell us more:' : 'Any additional feedback? (Optional)'}
                    </Label>
                    <Textarea
                      id="feedback"
                      placeholder="Your feedback helps us improve..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleResubscribe()}
                    disabled={processing}
                    className="flex-1"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Keep Me Subscribed
                  </Button>
                  
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={processing}
                    variant={wantsPause ? "default" : "destructive"}
                    className="flex-1"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : wantsPause ? (
                      <Pause className="mr-2 h-4 w-4" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {processing 
                      ? 'Processing...' 
                      : wantsPause 
                        ? 'Pause Subscription'
                        : 'Unsubscribe'
                    }
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    We respect your choice and will process your request immediately.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UnsubscribePage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <UnsubscribePageContent />
    </Suspense>
  );
}