// src/components/providers/recaptcha-provider.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const RecaptchaContext = createContext<any>(null);

export function useRecaptcha() {
  return useContext(RecaptchaContext);
}

interface ReCaptchaV3ProviderProps {
  children: ReactNode;
}

export function ReCaptchaV3Provider({ children }: ReCaptchaV3ProviderProps): JSX.Element {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!siteKey) {
    console.warn('reCAPTCHA site key not found');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}