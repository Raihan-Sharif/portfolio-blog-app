import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyRecaptchaV3 } from '@/lib/recaptcha';
import { verifyRecaptchaV2 } from '@/lib/recaptcha-v2';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  leadMagnet?: string;
  source?: string;
  preferences?: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  form_data?: Record<string, any>;
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
      // Skip verification if it's a development placeholder
      if (process.env.NODE_ENV === 'development' && body.recaptcha_token === 'development') {
        console.log('Development mode: skipping reCAPTCHA verification');
      } else {
        const isV2 = body.recaptcha_version === 'v2';
        
        let recaptchaResult;
        try {
          if (isV2) {
            // Use v2 verification
            recaptchaResult = await verifyRecaptchaV2(body.recaptcha_token);
          } else {
            // Use v3 verification with appropriate action
            const action = body.leadMagnet ? 'newsletter_signup' : 'newsletter_subscription';
            recaptchaResult = await verifyRecaptchaV3(
              body.recaptcha_token, 
              action, 
              0.3 // Lower threshold to reduce false positives
            );
          }
        } catch (verifyError) {
          console.error('reCAPTCHA verification error:', verifyError);
          return NextResponse.json({ 
            error: 'reCAPTCHA verification failed',
            details: 'verification-error',
            version: body.recaptcha_version || 'v3'
          }, { status: 400 });
        }
        
        if (!recaptchaResult.success) {
          const errorCode = recaptchaResult.errors?.[0];
          let errorMessage = 'reCAPTCHA verification failed';
          let errorDetails = 'Please complete the security verification';
          
          // Handle specific error codes
          if (errorCode) {
            switch (errorCode) {
              case 'timeout-or-duplicate':
                errorMessage = 'Security verification expired';
                errorDetails = 'The security token has expired or been used. Please try again.';
                break;
              case 'invalid-input-response':
                errorMessage = 'Security verification failed';
                errorDetails = 'Invalid verification token. Please try again.';
                break;
              case 'missing-input-response':
                errorMessage = 'Security verification required';
                errorDetails = 'Please complete the security verification.';
                break;
              case 'bad-request':
                errorMessage = 'Security verification failed';
                errorDetails = 'Verification request malformed. Please refresh and try again.';
                break;
              default:
                errorDetails = 'Verification failed. Please try again.';
            }
          }
          
          // Log for debugging but don't expose internal details
          console.error('reCAPTCHA verification failed:', {
            errorCode,
            score: 'score' in recaptchaResult ? recaptchaResult.score : undefined,
            action: 'action' in recaptchaResult ? recaptchaResult.action : undefined
          });
          
          return NextResponse.json({ 
            error: errorMessage,
            details: errorDetails,
            score: 'score' in recaptchaResult ? recaptchaResult.score : undefined,
            version: body.recaptcha_version || 'v3',
            shouldRetry: errorCode === 'timeout-or-duplicate' || errorCode === 'invalid-input-response'
          }, { status: 400 });
        }
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
    const referrer = request.headers.get('referer') || null;

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, engagement_score')
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

        // Reactivate subscription with comprehensive data
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            resubscribed_at: new Date().toISOString(),
            lead_magnet_id: leadMagnetId, // Use UUID reference to lead_magnets table
            first_name: body.firstName?.trim() || null,
            last_name: body.lastName?.trim() || null,
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            engagement_score: Math.min(100, (existingSubscriber.engagement_score || 50) + 10) // Boost engagement on resubscribe
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

    // Create new subscription with comprehensive data
    const subscriptionData = {
      email: body.email.toLowerCase().trim(),
      first_name: body.firstName?.trim() || null,
      last_name: body.lastName?.trim() || null,
      lead_magnet_id: leadMagnetId, // Use UUID reference to lead_magnets table
      status: 'active',
      source: body.source || 'website',
      client_ip: clientIp,
      user_agent: userAgent,
      referrer: referrer,
      preferences: body.preferences || {},
      subscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      engagement_score: 50 // Default engagement score
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

    // Track lead magnet download if applicable using the comprehensive tracking system
    if (leadMagnetId && subscription) {
      try {
        // Use the advanced tracking function that handles all analytics
        const { error: trackError } = await supabase.rpc('track_lead_magnet_download', {
          p_subscriber_id: subscription.id,
          p_lead_magnet_id: leadMagnetId,
          p_download_ip: clientIp,
          p_user_agent: userAgent,
          p_referrer: referrer,
          p_utm_source: body.utm_source || null,
          p_utm_medium: body.utm_medium || null,
          p_utm_campaign: body.utm_campaign || null,
          p_form_data: body.form_data || {}
        });
        
        if (trackError) {
          console.warn('Failed to track lead magnet download:', trackError);
          // This is non-critical, continue with the subscription
        }
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