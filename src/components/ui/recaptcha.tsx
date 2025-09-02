'use client';

import { forwardRef, useImperativeHandle, useEffect, useState, useCallback, useRef } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ReCAPTCHAV3ComponentProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
  action?: string;
  autoExecute?: boolean;
}

export interface ReCAPTCHAV3Ref {
  execute: () => Promise<string | null>;
  reset: () => void;
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
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const hasAutoExecutedRef = useRef(false);
    const executionTimeoutRef = useRef<NodeJS.Timeout>();
    const lastTokenRef = useRef<string | null>(null);
    const lastExecutionRef = useRef<number>(0);
    
    // Get site key from config
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const maxRetries = 3;
    

    // Reset function
    const resetRecaptcha = useCallback(() => {
      hasAutoExecutedRef.current = false;
      lastTokenRef.current = null;
      lastExecutionRef.current = 0;
      setRetryCount(0);
      setShowError(false);
      setErrorMessage('');
    }, []);

    const executeRecaptcha = useCallback(async (): Promise<string | null> => {
      if (!window.grecaptcha?.ready || !siteKey) {
        console.warn('reCAPTCHA not ready or site key missing');
        setShowError(true);
        setErrorMessage('Security verification not available. Please refresh the page.');
        onError?.();
        return null;
      }

      if (isLoading) {
        console.warn('reCAPTCHA execution already in progress');
        return null;
      }

      // Check if we've tried too many times recently
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutionRef.current;
      if (timeSinceLastExecution < 5000 && retryCount >= maxRetries) {
        console.error('Too many reCAPTCHA attempts');
        setShowError(true);
        setErrorMessage('Too many verification attempts. Please wait a moment and try again.');
        return null;
      }

      setIsLoading(true);
      setShowError(false);
      lastExecutionRef.current = now;

      try {
        return await new Promise<string | null>((resolve, reject) => {
          // Set timeout to prevent hanging
          executionTimeoutRef.current = setTimeout(() => {
            reject(new Error('reCAPTCHA execution timeout'));
          }, 20000); // 20 second timeout

          window.grecaptcha.ready(async () => {
            try {
              // Add delay based on retry count to improve success rate
              const delay = Math.min(1000 * (retryCount + 1), 3000);
              await new Promise(resolve => setTimeout(resolve, delay));
              
              const token = await window.grecaptcha.execute(siteKey, { action });
              
              if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
              }
              
              if (token && typeof token === 'string' && token.length > 0) {
                // Check if this is the same token as last time
                if (token === lastTokenRef.current) {
                  console.warn('Received duplicate reCAPTCHA token');
                  setRetryCount(prev => prev + 1);
                  if (retryCount < maxRetries) {
                    // Try again with a fresh token
                    resolve(null);
                  } else {
                    setShowError(true);
                    setErrorMessage('Verification failed. Please refresh the page and try again.');
                    onError?.();
                    resolve(null);
                  }
                  return;
                }
                
                lastTokenRef.current = token;
                setRetryCount(0);
                resolve(token);
              } else {
                console.error('Invalid reCAPTCHA token received');
                setRetryCount(prev => prev + 1);
                if (retryCount < maxRetries) {
                  resolve(null);
                } else {
                  setShowError(true);
                  setErrorMessage('Security verification failed. Please refresh the page.');
                  onError?.();
                  resolve(null);
                }
              }
            } catch (executeError) {
              if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
              }
              console.error('reCAPTCHA execution failed:', executeError);
              setRetryCount(prev => prev + 1);
              if (retryCount < maxRetries) {
                resolve(null);
              } else {
                setShowError(true);
                setErrorMessage('Security verification unavailable. Please refresh the page.');
                onError?.();
                resolve(null);
              }
            }
          });
        });
      } catch (error) {
        console.error('reCAPTCHA execution error:', error);
        setRetryCount(prev => prev + 1);
        if (retryCount < maxRetries) {
          return null;
        } else {
          setShowError(true);
          setErrorMessage('Security verification failed. Please refresh the page.');
          onError?.();
          return null;
        }
      } finally {
        setIsLoading(false);
        if (executionTimeoutRef.current) {
          clearTimeout(executionTimeoutRef.current);
        }
      }
    }, [siteKey, action, onError, isLoading, retryCount, maxRetries]);

    useImperativeHandle(ref, () => ({
      execute: executeRecaptcha,
      reset: resetRecaptcha
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
          let attempts = 0;
          const maxAttempts = 3;
          
          const tryExecute = async (): Promise<void> => {
            try {
              const token = await executeRecaptcha();
              if (token) {
                onVerify(token);
              } else if (attempts < maxAttempts) {
                attempts++;
                console.warn(`reCAPTCHA auto-execute failed, retrying... (${attempts}/${maxAttempts})`);
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                await tryExecute();
              } else {
                console.error('reCAPTCHA auto-execute failed after all retries');
                setShowError(true);
                setErrorMessage('Security verification failed to load automatically. Please try manual verification.');
                onVerify(null);
              }
            } catch (error) {
              console.error('Auto-execute reCAPTCHA failed:', error);
              if (attempts < maxAttempts) {
                attempts++;
                console.warn(`Retrying reCAPTCHA execution... (${attempts}/${maxAttempts})`);
                const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                await tryExecute();
              } else {
                setShowError(true);
                setErrorMessage('Security verification unavailable. Please refresh the page.');
                onVerify(null);
              }
            }
          };
          
          await tryExecute();
        };
        
        // Delay to ensure proper initialization
        const timeoutId = setTimeout(autoExecuteRecaptcha, 1000);
        
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
      <div className="space-y-3">
        {/* Error Display */}
        {showError && errorMessage && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">{errorMessage}</p>
                <Button 
                  onClick={() => {
                    resetRecaptcha();
                    executeRecaptcha().then(token => {
                      if (token) onVerify(token);
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                  disabled={isLoading}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading/Success State */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Protected by reCAPTCHA v3</span>
            {isLoading && (
              <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin ml-2" />
            )}
            {retryCount > 0 && !isLoading && !showError && (
              <span className="text-orange-600">({retryCount} retries)</span>
            )}
          </div>
        </div>

        {/* Manual Trigger for Failed Auto-Execute */}
        {!autoExecute && !isLoading && (
          <div className="flex justify-center">
            <Button
              onClick={() => {
                executeRecaptcha().then(token => {
                  if (token) onVerify(token);
                });
              }}
              size="sm"
              variant="outline"
              disabled={isLoading}
              className="text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Verify Security
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ReCAPTCHAV3Component.displayName = 'ReCAPTCHAV3Component';

export default ReCAPTCHAV3Component;