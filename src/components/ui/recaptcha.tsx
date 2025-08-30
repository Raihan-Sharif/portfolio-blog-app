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
  }
}

const ReCAPTCHAV3Component = forwardRef<ReCAPTCHAV3Ref, ReCAPTCHAV3ComponentProps>(
  ({ onVerify, onError, action = 'submit', autoExecute = false }, ref) => {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const hasAutoExecutedRef = useRef(false);
    const executionTimeoutRef = useRef<NodeJS.Timeout>();
    
    // Get site key from config - ensure client-side only access
    const [siteKey, setSiteKey] = useState<string | undefined>(undefined);
    
    useEffect(() => {
      setSiteKey(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
    }, []);
    

    const executeRecaptcha = useCallback(async (): Promise<string | null> => {
      if (!window.grecaptcha?.ready || !siteKey) {
        console.warn('reCAPTCHA not ready or site key missing');
        onError?.();
        return null;
      }

      if (isLoading) {
        console.warn('reCAPTCHA execution already in progress');
        return null;
      }

      setIsLoading(true);

      try {
        return await new Promise<string | null>((resolve, reject) => {
          // Set timeout to prevent hanging
          executionTimeoutRef.current = setTimeout(() => {
            reject(new Error('reCAPTCHA execution timeout'));
          }, 10000); // 10 second timeout

          window.grecaptcha.ready(async () => {
            try {
              const token = await window.grecaptcha.execute(siteKey, { action });
              
              if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
              }
              
              if (token && typeof token === 'string' && token.length > 0) {
                resolve(token);
              } else {
                console.error('Invalid reCAPTCHA token received');
                onError?.();
                resolve(null);
              }
            } catch (executeError) {
              if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
              }
              console.error('reCAPTCHA execution failed:', executeError);
              onError?.();
              resolve(null);
            }
          });
        });
      } catch (error) {
        console.error('reCAPTCHA execution error:', error);
        onError?.();
        return null;
      } finally {
        setIsLoading(false);
        if (executionTimeoutRef.current) {
          clearTimeout(executionTimeoutRef.current);
        }
      }
    }, [siteKey, action, onError, isLoading]);

    useImperativeHandle(ref, () => ({
      execute: executeRecaptcha
    }));

    useEffect(() => {
      if (!siteKey) return;

      // Check if reCAPTCHA script is already loaded and ready
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
      
      if (existingScript) {
        // Script exists, wait for it to load
        const checkReady = () => {
          if (window.grecaptcha?.ready) {
            window.grecaptcha.ready(() => {
              setIsReady(true);
            });
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }

      // Load the reCAPTCHA script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;

      script.onload = () => {
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(() => {
            setIsReady(true);
          });
        } else {
          console.error('reCAPTCHA not available after script load');
          onError?.();
        }
      };

      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
        onError?.();
      };

      document.head.appendChild(script);

      // Cleanup function
      return () => {
        // Clear timeout if component unmounts
        if (executionTimeoutRef.current) {
          clearTimeout(executionTimeoutRef.current);
        }
      };
    }, [siteKey, onError]);


    // Auto-execute when component mounts and becomes ready (if enabled)
    useEffect(() => {
      if (autoExecute && isReady && !hasAutoExecutedRef.current && !isLoading) {
        hasAutoExecutedRef.current = true;
        
        const autoExecuteRecaptcha = async () => {
          try {
            const token = await executeRecaptcha();
            onVerify(token);
          } catch (error) {
            console.error('Auto-execute reCAPTCHA failed:', error);
            onVerify(null);
          }
        };
        
        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(autoExecuteRecaptcha, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [autoExecute, isReady, isLoading, executeRecaptcha, onVerify]);

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
          {isLoading && (
            <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin ml-2" />
          )}
        </div>
      </div>
    );
  }
);

ReCAPTCHAV3Component.displayName = 'ReCAPTCHAV3Component';

export default ReCAPTCHAV3Component;