export const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  
  // Configuration constants
  DEFAULT_THRESHOLD: 0.5,
  TOKEN_EXPIRY_TIME: 120000, // 2 minutes in milliseconds
  EXECUTION_TIMEOUT: 10000,  // 10 seconds
  
  // Actions
  ACTIONS: {
    CONTACT: 'contact_form',
    NEWSLETTER: 'newsletter_signup',
    SERVICE_INQUIRY: 'service_inquiry',
    SUBMIT: 'submit'
  }
} as const;

export type RecaptchaAction = typeof RECAPTCHA_CONFIG.ACTIONS[keyof typeof RECAPTCHA_CONFIG.ACTIONS];