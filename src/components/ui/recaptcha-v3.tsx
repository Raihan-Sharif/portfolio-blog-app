// src/components/ui/recaptcha-v3.tsx
"use client";

import { useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface RecaptchaV3Props {
  action: string;
  onVerify: (token: string) => void;
}

export function RecaptchaV3({ action, onVerify }: RecaptchaV3Props): JSX.Element | null {
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const verifyRecaptcha = async () => {
      if (!executeRecaptcha) {
        console.warn('reCAPTCHA not loaded yet');
        return;
      }

      try {
        const token = await executeRecaptcha(action);
        if (token) {
          onVerify(token);
        }
      } catch (error) {
        console.error('reCAPTCHA verification failed:', error);
      }
    };

    verifyRecaptcha();
  }, [executeRecaptcha, action, onVerify]);

  // This component doesn't render anything visible
  return null;
}