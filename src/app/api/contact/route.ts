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
    
    const body: ContactRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name, email, subject, and message are required'
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
    if (body.recaptcha_token) {
      const recaptchaResult = await verifyRecaptchaV3(
        body.recaptcha_token, 
        'contact_form', 
        0.5
      );
      if (!recaptchaResult.success) {
        console.error('reCAPTCHA verification failed:', recaptchaResult.errors);
        return NextResponse.json({ 
          error: 'reCAPTCHA verification failed',
          details: recaptchaResult.errors?.[0] || 'Security verification failed',
          score: recaptchaResult.score
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'reCAPTCHA verification required',
        details: 'Please complete the security verification'
      }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Rate limiting check (simple implementation)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentMessages, error: countError } = await supabase
      .from('contact_messages')
      .select('id')
      .eq('email', body.email.toLowerCase().trim())
      .gte('created_at', oneHourAgo.toISOString());

    if (countError) {
      console.error('Error checking rate limit:', countError);
    } else if (recentMessages && recentMessages.length >= 3) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        details: 'Please wait before sending another message'
      }, { status: 429 });
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

    const { data: contactMessage, error } = await supabase
      .from('contact_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact message:', error);
      return NextResponse.json({ 
        error: 'Failed to send message',
        details: 'Please try again later'
      }, { status: 500 });
    }

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