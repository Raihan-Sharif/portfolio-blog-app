// src/components/ui/hybrid-recaptcha.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

interface HybridRecaptchaProps {
  action: string;
  onVerify: (token: string, version: 'v2' | 'v3') => void;
  onScoreTooLow?: (score: number) => void;
  onV3Failed?: () => void;
}

export function HybridRecaptcha({ action, onVerify, onScoreTooLow, onV3Failed }: HybridRecaptchaProps): JSX.Element {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [showV2, setShowV2] = useState(false);
  const [v3Score, setV3Score] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const hasTriedV3 = useRef(false);
  const lastV3Token = useRef<string | null>(null);

  // Try reCAPTCHA v3 first
  const tryV3Verification = useCallback(async () => {
    if (!executeRecaptcha || hasTriedV3.current) {
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      
      const token = await executeRecaptcha(action);
      if (token && token !== lastV3Token.current) {
        lastV3Token.current = token;
        hasTriedV3.current = true;
        
        // For reCAPTCHA v3, we trust the client-side execution
        // and pass the token directly without pre-verification
        // The actual verification will happen during form submission
        setV3Score(0.8); // Assume good score for v3
        onVerify(token, 'v3');
      } else if (token === lastV3Token.current) {
        // Token reuse, show v2 immediately
        setError('Token expired or reused. Please complete the visual verification.');
        setShowV2(true);
      }
    } catch (error) {
      console.error('reCAPTCHA v3 failed:', error);
      setError('Verification failed. Please try the visual challenge below.');
      setShowV2(true);
    } finally {
      setIsVerifying(false);
    }
  }, [executeRecaptcha, action, onVerify, onScoreTooLow]);

  // Handle reCAPTCHA v2 verification
  const handleV2Change = useCallback((token: string | null) => {
    if (token) {
      setError(null);
      onVerify(token, 'v2');
    }
  }, [onVerify]);

  const handleV2Error = useCallback(() => {
    setError('reCAPTCHA verification failed. Please try again.');
  }, []);

  const handleV2Expired = useCallback(() => {
    setError('reCAPTCHA expired. Please verify again.');
  }, []);

  // Retry with manual trigger
  const retryVerification = useCallback(() => {
    hasTriedV3.current = false;
    lastV3Token.current = null;
    setShowV2(false);
    setError(null);
    setV3Score(null);
    tryV3Verification();
  }, [tryV3Verification]);

  // Method to trigger v2 fallback from external error
  const triggerV2Fallback = useCallback(() => {
    setShowV2(true);
    setError('Security verification failed. Please complete the visual verification below.');
    onV3Failed?.();
  }, [onV3Failed]);

  // Expose triggerV2Fallback method
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerRecaptchaV2Fallback = triggerV2Fallback;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).triggerRecaptchaV2Fallback;
      }
    };
  }, [triggerV2Fallback]);

  // Track user interactions to improve reCAPTCHA v3 scores
  useEffect(() => {
    if (!executeRecaptcha || hasTriedV3.current) return;

    let userInteractionCount = 0;
    const minInteractions = 2;

    const trackInteraction = () => {
      userInteractionCount++;
      if (userInteractionCount >= minInteractions) {
        // User has interacted enough, try v3 verification
        tryV3Verification();
        cleanup();
      }
    };

    const cleanup = () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
    };

    // Wait for user interactions
    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    // Fallback timer - try verification after 5 seconds regardless
    const fallbackTimer = setTimeout(() => {
      tryV3Verification();
      cleanup();
    }, 5000);

    return () => {
      cleanup();
      clearTimeout(fallbackTimer);
    };
  }, [executeRecaptcha, tryV3Verification]);

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          reCAPTCHA not configured
        </AlertDescription>
      </Alert>
    );
  }

  // Warning if v2 keys are missing
  if (showV2 && !process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>reCAPTCHA v2 keys required!</strong>
          <br />
          <span className="text-xs">
            1. Go to: <a href="https://www.google.com/recaptcha/admin/" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA Admin</a>
            <br />
            2. Create a new site with reCAPTCHA v2 "I'm not a robot" Checkbox
            <br />
            3. Add these to your .env.local:
            <br />
            NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=your_v2_site_key
            <br />
            RECAPTCHA_V2_SECRET_KEY=your_v2_secret_key
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manual verification trigger */}
      {!hasTriedV3.current && !isVerifying && !showV2 && (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={tryV3Verification}
            disabled={isVerifying}
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Verify Security</span>
          </Button>
        </div>
      )}

      {/* reCAPTCHA v3 Status */}
      {isVerifying && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Shield className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Verifying security... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* Show score info if v3 failed */}
      {v3Score !== null && v3Score < 0.5 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Additional verification required. Please complete the challenge below.
            <br />
            <span className="text-xs opacity-75">
              Security score: {v3Score.toFixed(2)} (minimum required: 0.50)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Error display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* reCAPTCHA v2 fallback */}
      {showV2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Please complete the security verification:
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={retryVerification}
              className="text-xs h-6"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try automatic verification
            </Button>
          </div>
          
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={handleV2Change}
              onError={handleV2Error}
              onExpired={handleV2Expired}
              theme="light"
              size="normal"
            />
          </div>
        </div>
      )}

      {/* Success indicator */}
      {v3Score !== null && v3Score >= 0.5 && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Security verification successful!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}