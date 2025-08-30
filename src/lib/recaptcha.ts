interface RecaptchaV3Response {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  errors?: string[];
}

export async function verifyRecaptchaV3(
  token: string, 
  expectedAction?: string,
  minimumScore: number = 0.5
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('reCAPTCHA secret key not configured');
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

    const data: RecaptchaV3Response = await response.json();
    
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return { 
        success: false, 
        errors: data['error-codes'] 
      };
    }

    // Check if the action matches (if specified)
    if (expectedAction && data.action !== expectedAction) {
      console.error(`reCAPTCHA action mismatch. Expected: ${expectedAction}, Got: ${data.action}`);
      return { 
        success: false, 
        score: data.score,
        action: data.action,
        errors: [`Action mismatch: expected ${expectedAction}, got ${data.action}`]
      };
    }

    // Check if the score meets the minimum threshold
    if (data.score < minimumScore) {
      console.warn(`reCAPTCHA score too low. Score: ${data.score}, Minimum: ${minimumScore}`);
      return { 
        success: false, 
        score: data.score,
        action: data.action,
        errors: [`Score too low: ${data.score} < ${minimumScore}`]
      };
    }

    return { 
      success: true, 
      score: data.score,
      action: data.action
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { 
      success: false, 
      errors: ['Verification request failed']
    };
  }
}

// Backward compatibility function
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const result = await verifyRecaptchaV3(token);
  return result.success;
}