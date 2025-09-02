interface RecaptchaV2Response {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

interface RecaptchaVerificationResult {
  success: boolean;
  errors?: string[];
}

export async function verifyRecaptchaV2(token: string): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_V2_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('reCAPTCHA v2 secret key not configured');
    return { success: false, errors: ['Secret key not configured'] };
  }

  if (!token) {
    return { success: false, errors: ['No token provided'] };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data: RecaptchaV2Response = await response.json();
    
    if (!data.success) {
      console.error('reCAPTCHA v2 verification failed:', data['error-codes']);
      return { 
        success: false, 
        errors: data['error-codes'] 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('reCAPTCHA v2 verification error:', error);
    return { 
      success: false, 
      errors: ['Verification request failed']
    };
  }
}