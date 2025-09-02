import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyRecaptchaV3 } from '@/lib/recaptcha';
import { verifyRecaptchaV2 } from '@/lib/recaptcha-v2';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  leadMagnet?: string;
  recaptcha_token?: string;
  recaptcha_version?: 'v2' | 'v3';
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

    // Verify reCAPTCHA (v2 or v3)
    if (body.recaptcha_token) {
      const isV2 = body.recaptcha_version === 'v2';
      
      let recaptchaResult;
      if (isV2) {
        // Use v2 verification
        recaptchaResult = await verifyRecaptchaV2(body.recaptcha_token);
      } else {
        // Use v3 verification
        recaptchaResult = await verifyRecaptchaV3(
          body.recaptcha_token, 
          'newsletter_signup', 
          0.5
        );
      }
      
      if (!recaptchaResult.success) {
        return NextResponse.json({ 
          error: 'reCAPTCHA verification failed',
          details: recaptchaResult.errors?.[0] || 'Please complete the security verification',
          score: 'score' in recaptchaResult ? recaptchaResult.score : undefined,
          version: body.recaptcha_version || 'v3'
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
        // Check if lead magnet exists if provided
        let leadMagnetId = null;
        if (body.leadMagnet) {
          const { data: magnet } = await supabase
            .from('lead_magnets')
            .select('id')
            .eq('id', body.leadMagnet)
            .eq('is_active', true)
            .maybeSingle();

          if (magnet) {
            leadMagnetId = magnet.id;
          }
        }

        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            resubscribed_at: new Date().toISOString(),
            lead_magnet_id: leadMagnetId,
            first_name: body.firstName?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json({ 
            error: 'Failed to reactivate subscription',
            details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
          }, { status: 500 });
        }

        return NextResponse.json({ 
          message: 'Successfully resubscribed!',
          leadMagnet: body.leadMagnet
        });
      }
    }

    // Check if lead magnet exists if provided
    let leadMagnetId = null;
    if (body.leadMagnet) {
      const { data: magnet } = await supabase
        .from('lead_magnets')
        .select('id')
        .eq('id', body.leadMagnet)
        .eq('is_active', true)
        .maybeSingle();

      if (magnet) {
        leadMagnetId = magnet.id;
      }
    }

    // Create new subscription
    const subscriptionData = {
      email: body.email.toLowerCase().trim(),
      first_name: body.firstName?.trim() || null,
      lead_magnet_id: leadMagnetId,
      status: 'active',
      source: 'website',
      client_ip: clientIp,
      user_agent: userAgent,
      subscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: subscription, error } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      console.error('Subscription data attempted:', subscriptionData);
      return NextResponse.json({ 
        error: 'Failed to subscribe to newsletter',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    // Track lead magnet download if applicable
    if (leadMagnetId && subscription) {
      try {
        // Insert download tracking record
        await supabase
          .from('subscriber_lead_magnets')
          .insert({
            subscriber_id: subscription.id,
            lead_magnet_id: leadMagnetId,
            download_ip: clientIp,
            downloaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

        // Increment download count using RPC function
        await supabase.rpc('increment_download_count', {
          lead_magnet_id: leadMagnetId
        });
      } catch (trackError) {
        console.warn('Failed to track lead magnet download:', trackError);
        // Don't fail the whole operation if tracking fails
      }
    }

    // TODO: Send welcome email with lead magnet
    // TODO: Add to email marketing service (e.g., ConvertKit, Mailchimp)

    return NextResponse.json({ 
      message: 'Successfully subscribed!',
      leadMagnet: body.leadMagnet,
      subscriberId: subscription.id
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}