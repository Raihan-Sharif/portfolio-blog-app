import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyRecaptchaV3 } from '@/lib/recaptcha';

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  recaptcha_token?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('=== Contact API POST Request ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({ error: 'Server configuration error', details: 'Missing database URL' }, { status: 500 });
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Server configuration error', details: 'Missing service role key' }, { status: 500 });
    }

    // Use service role client for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    let body: ContactRequest;
    try {
      body = await request.json();
      console.log('Request body:', { ...body, recaptcha_token: body.recaptcha_token ? '[REDACTED]' : undefined });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body', details: 'Request must contain valid JSON' }, { status: 400 });
    }

    // Validate required fields
    const missingFields = [];
    if (!body.name) missingFields.push('name');
    if (!body.email) missingFields.push('email');
    if (!body.subject) missingFields.push('subject');
    if (!body.message) missingFields.push('message');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: `The following fields are required: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Verify reCAPTCHA v3
    console.log('reCAPTCHA token present:', !!body.recaptcha_token);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('RECAPTCHA_SECRET_KEY present:', !!process.env.RECAPTCHA_SECRET_KEY);
    
    if (body.recaptcha_token) {
      try {
        console.log('Verifying reCAPTCHA...');
        const recaptchaResult = await verifyRecaptchaV3(
          body.recaptcha_token, 
          'contact_form', 
          0.5
        );
        console.log('reCAPTCHA result:', recaptchaResult);
        
        if (!recaptchaResult.success) {
          console.error('reCAPTCHA verification failed:', recaptchaResult.errors);
          return NextResponse.json({ 
            error: 'reCAPTCHA verification failed',
            details: recaptchaResult.errors?.[0] || 'Security verification failed',
            score: recaptchaResult.score
          }, { status: 400 });
        }
        console.log('reCAPTCHA verification successful!');
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return NextResponse.json({ 
          error: 'reCAPTCHA verification failed',
          details: 'Security verification service unavailable'
        }, { status: 500 });
      }
    } else {
      // Allow submission without reCAPTCHA in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('reCAPTCHA skipped in development mode - allowing form submission');
      } else {
        console.error('reCAPTCHA token missing in production');
        return NextResponse.json({ 
          error: 'reCAPTCHA verification required',
          details: 'Please complete the security verification'
        }, { status: 400 });
      }
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Rate limiting check (simple implementation)
    console.log('Checking rate limit for email:', body.email.toLowerCase().trim());
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentMessages, error: countError } = await supabase
      .from('contact_messages')
      .select('id')
      .eq('email', body.email.toLowerCase().trim())
      .gte('created_at', oneHourAgo.toISOString());

    if (countError) {
      console.error('Error checking rate limit:', countError);
      console.log('Rate limit check failed, continuing anyway');
    } else if (recentMessages && recentMessages.length >= 3) {
      console.warn('Rate limit exceeded:', recentMessages.length, 'messages in last hour');
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        details: 'Please wait before sending another message'
      }, { status: 429 });
    } else {
      console.log('Rate limit check passed:', recentMessages?.length || 0, 'messages in last hour');
    }

    // Create contact message
    const messageData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || null,
      subject: body.subject.trim(),
      message: body.message.trim(),
      status: 'pending',
      client_ip: clientIp,
      user_agent: userAgent,
      recaptcha_token: body.recaptcha_token
    };
    
    console.log('Creating contact message with data:', { 
      ...messageData, 
      recaptcha_token: messageData.recaptcha_token ? '[REDACTED]' : undefined 
    });

    const { data: contactMessage, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact message:', error);
      return NextResponse.json({ 
        error: 'Failed to send message',
        details: error.message || 'Please try again later',
        dbError: error.code
      }, { status: 500 });
    }
    
    console.log('Contact message created successfully:', contactMessage.id);

    // TODO: Send notification email to admin
    // TODO: Send auto-reply to user

    return NextResponse.json({ 
      message: 'Message sent successfully!',
      details: 'Thank you for your message. We\'ll get back to you soon.',
      messageId: contactMessage.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error in contact form:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'Please try again later'
    }, { status: 500 });
  }
}