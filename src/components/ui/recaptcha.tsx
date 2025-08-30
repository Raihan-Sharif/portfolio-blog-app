'use client';

import { forwardRef, useImperativeHandle, useEffect, useState, useCallback, useRef } from 'react';
import { Shield } from 'lucide-react';

interface ReCAPTCHAV3ComponentProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
  action?: string;
  autoExecute?: boolean;
}

export interface ReCAPTCHAV3Ref {
  execute: () => Promise<string | null>;
}

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaScriptLoading?: boolean;
    recaptchaScriptReady?: boolean;
  }
}

const ReCAPTCHAV3Component = forwardRef<ReCAPTCHAV3Ref, ReCAPTCHAV3ComponentProps>(
  ({ onVerify, onError, action = 'submit', autoExecute = false }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const hasAutoExecutedRef = useRef(false);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    

    const executeRecaptcha = useCallback(async (): Promise<string | null> => {
      if (!window.grecaptcha || !window.grecaptcha.ready || !siteKey) {
        console.warn('❌ reCAPTCHA not ready or site key missing');
        onError?.();
        return null;
      }

      try {
        const token = await new Promise<string | null>((resolve) => {
          try {
            window.grecaptcha.ready(() => {
              window.grecaptcha.execute(siteKey, { action })
                .then((token: string) => {
                  if (token && typeof token === 'string') {
                    console.log(`✅ reCAPTCHA token received for action: ${action}`);
                    resolve(token);
                  } else {
                    console.error('❌ reCAPTCHA returned invalid token for action:', action, 'Token:', token);
                    onError?.();
                    resolve(null);
                  }
                })
                .catch((error: any) => {
                  console.error('💥 reCAPTCHA execution failed for action:', action, 'Error:', error);
                  onError?.();
                  resolve(null);
                });
            });
          } catch (readyError) {
            console.error('🚫 reCAPTCHA ready callback failed:', readyError);
            onError?.();
            resolve(null);
          }
        });
        
        return token;
      } catch (error) {
        console.error('💣 reCAPTCHA execution outer catch error:', error);
        onError?.();
        return null;
      }
    }, [siteKey, action, onError]);

    useImperativeHandle(ref, () => ({
      execute: executeRecaptcha
    }));

    useEffect(() => {
      if (!siteKey) return;

      // Check if reCAPTCHA is already ready
      if (window.grecaptcha && window.recaptchaScriptReady) {
        setIsLoaded(true);
        setIsReady(true);
        return;
      }

      // Check if script already exists or is loading
      const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
      
      if (existingScript || window.recaptchaScriptLoading) {
        setIsLoaded(true);
        // Wait for script to be ready
        const checkReady = () => {
          if (window.grecaptcha && window.recaptchaScriptReady) {
            setIsReady(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }

      // Mark as loading to prevent multiple script loads
      window.recaptchaScriptLoading = true;

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.recaptchaScriptReady = true;
            window.recaptchaScriptLoading = false;
            setIsReady(true);
          });
        } else {
          console.error('reCAPTCHA not available after script load');
          window.recaptchaScriptLoading = false;
          onError?.();
        }
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load reCAPTCHA script:', error);
        window.recaptchaScriptLoading = false;
        onError?.();
      };

      document.head.appendChild(script);

      return () => {
        // Don't remove script on unmount as it might be used by other components
      };
    }, [siteKey, onError]);


    // Auto-execute when component mounts and becomes ready (if enabled)
    useEffect(() => {
      if (autoExecute && isReady && isLoaded && !hasAutoExecutedRef.current) {
        console.log(`🔄 Auto-executing reCAPTCHA for action: ${action}`);
        hasAutoExecutedRef.current = true;
        
        const autoExecuteRecaptcha = async () => {
          try {
            const token = await executeRecaptcha();
            onVerify(token);
          } catch (error) {
            console.error('💥 Auto-execute reCAPTCHA failed:', error);
            onVerify(null);
          }
        };
        
        // Execute with error handling
        autoExecuteRecaptcha().catch((error) => {
          console.error('🚨 Auto-execute promise rejected:', error);
          onVerify(null);
        });
      }
    }, [autoExecute, isReady, isLoaded]);

    if (!siteKey) {
      return (
        <div className="flex items-center justify-center p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Shield className="w-5 h-5" />
            <span className="text-sm">reCAPTCHA v3 configuration required</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Protected by reCAPTCHA v3</span>
        </div>
      </div>
    );
  }
);

ReCAPTCHAV3Component.displayName = 'ReCAPTCHAV3Component';

export default ReCAPTCHAV3Component;