import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaV3 } from '@/lib/recaptcha';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token, action } = await request.json();
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Token required' 
      }, { status: 400 });
    }

    console.log('Testing reCAPTCHA token:', token.substring(0, 50) + '...');
    console.log('Action:', action);

    const result = await verifyRecaptchaV3(token, action, 0.5);
    
    console.log('Verification result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Test reCAPTCHA error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}