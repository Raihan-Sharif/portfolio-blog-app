'use client';

import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Shield } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ReCAPTCHAComponentProps {
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  size?: 'compact' | 'normal' | 'invisible';
  theme?: 'light' | 'dark' | 'auto';
}

export interface ReCAPTCHARef {
  reset: () => void;
  execute: () => void;
}

const ReCAPTCHAComponent = forwardRef<ReCAPTCHARef, ReCAPTCHAComponentProps>(
  ({ onVerify, onExpired, onError, size = 'normal', theme = 'auto' }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const { theme: systemTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      }
    }));

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // Determine the actual theme to use
    const getTheme = (): 'light' | 'dark' => {
      if (theme === 'auto') {
        return resolvedTheme === 'dark' ? 'dark' : 'light';
      }
      return theme;
    };

    if (!siteKey) {
      return (
        <div className="flex items-center justify-center p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Shield className="w-5 h-5" />
            <span className="text-sm">reCAPTCHA configuration required</span>
          </div>
        </div>
      );
    }

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
      return (
        <div className="flex justify-center">
          <div className="w-[304px] h-[78px] bg-muted/50 animate-pulse rounded border flex items-center justify-center">
            <Shield className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <div className="p-2 rounded-lg bg-background border border-border shadow-sm">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={onVerify}
            onExpired={onExpired}
            onError={onError}
            size={size}
            theme={getTheme()}
          />
        </div>
      </div>
    );
  }
);

ReCAPTCHAComponent.displayName = 'ReCAPTCHAComponent';

export default ReCAPTCHAComponent;