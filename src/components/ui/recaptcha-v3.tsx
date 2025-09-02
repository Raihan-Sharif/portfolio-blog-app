// src/components/ui/recaptcha-v3.tsx
"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface RecaptchaV3Props {
  action: string;
  onVerify: (token: string) => void;
}

export function RecaptchaV3({ action, onVerify }: RecaptchaV3Props): JSX.Element | null {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const hasExecuted = useRef(false);
  const currentAction = useRef(action);

  const verifyRecaptcha = useCallback(async () => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not loaded yet');
      return;
    }

    if (hasExecuted.current && currentAction.current === action) {
      return; // Prevent multiple executions for the same action
    }

    try {
      const token = await executeRecaptcha(action);
      if (token) {
        hasExecuted.current = true;
        currentAction.current = action;
        onVerify(token);
      }
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
    }
  }, [executeRecaptcha, action, onVerify]);

  useEffect(() => {
    if (executeRecaptcha && (!hasExecuted.current || currentAction.current !== action)) {
      hasExecuted.current = false; // Reset if action changed
      verifyRecaptcha();
    }
  }, [executeRecaptcha, action, verifyRecaptcha]);

  // This component doesn't render anything visible
  return null;
}