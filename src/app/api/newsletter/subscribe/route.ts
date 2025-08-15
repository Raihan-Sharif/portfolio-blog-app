import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  leadMagnet?: string;
  recaptcha_token?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const body: SubscribeRequest = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Verify reCAPTCHA
    if (body.recaptcha_token) {
      const isValidRecaptcha = await verifyRecaptcha(body.recaptcha_token);
      if (!isValidRecaptcha) {
        return NextResponse.json({ 
          error: 'reCAPTCHA verification failed' 
        }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'reCAPTCHA verification required' 
      }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', body.email.toLowerCase().trim())
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json({ 
          error: 'Email already subscribed',
          message: 'This email is already subscribed to our newsletter.'
        }, { status: 409 });
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            resubscribed_at: new Date().toISOString(),
            lead_magnet: body.leadMagnet,
            first_name: body.firstName?.trim() || null
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json({ 
            error: 'Failed to reactivate subscription' 
          }, { status: 500 });
        }

        return NextResponse.json({ 
          message: 'Successfully resubscribed!',
          leadMagnet: body.leadMagnet
        });
      }
    }

    // Create new subscription
    const subscriptionData = {
      email: body.email.toLowerCase().trim(),
      first_name: body.firstName?.trim() || null,
      lead_magnet: body.leadMagnet || null,
      status: 'active',
      source: 'website',
      client_ip: clientIp,
      user_agent: userAgent,
      subscribed_at: new Date().toISOString()
    };

    const { data: subscription, error } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return NextResponse.json({ 
        error: 'Failed to subscribe to newsletter' 
      }, { status: 500 });
    }

    // TODO: Send welcome email with lead magnet
    // TODO: Add to email marketing service (e.g., ConvertKit, Mailchimp)

    return NextResponse.json({ 
      message: 'Successfully subscribed!',
      leadMagnet: body.leadMagnet,
      subscriberId: subscription.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}