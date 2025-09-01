import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
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

    const { testEmail, testMagnetId } = await request.json();

    console.log('🧪 Testing newsletter subscription with:', { testEmail, testMagnetId });

    // Test 1: Check if lead magnets table exists and has data
    const { data: leadMagnets, error: magnetError } = await supabase
      .from('lead_magnets')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    console.log('📊 Lead magnets found:', leadMagnets?.length || 0);

    // Test 2: Try to subscribe a test email
    const testSubscriptionData = {
      email: testEmail || 'test@example.com',
      first_name: 'Test User',
      lead_magnet_id: testMagnetId || leadMagnets?.[0]?.id || null,
      status: 'active',
      source: 'api_test',
      client_ip: '127.0.0.1',
      user_agent: 'Test Agent',
      subscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: subscription, error: subscribeError } = await supabase
      .from('newsletter_subscribers')
      .upsert(testSubscriptionData, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select('*')
      .single();

    if (subscribeError) {
      console.error('❌ Subscribe error:', subscribeError);
      return NextResponse.json({
        success: false,
        error: subscribeError.message,
        leadMagnets: leadMagnets?.length || 0
      });
    }

    console.log('✅ Subscription created:', subscription?.email);

    // Test 3: Try lead magnet tracking if applicable
    let trackingResult = null;
    if (testSubscriptionData.lead_magnet_id && subscription) {
      try {
        const { data: tracking, error: trackingError } = await supabase
          .from('subscriber_lead_magnets')
          .upsert({
            subscriber_id: subscription.id,
            lead_magnet_id: testSubscriptionData.lead_magnet_id,
            download_ip: '127.0.0.1',
            downloaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'subscriber_id,lead_magnet_id',
            ignoreDuplicates: false
          })
          .select('*')
          .single();

        if (!trackingError) {
          console.log('✅ Lead magnet tracking created');
          
          // Test increment function
          const { error: incrementError } = await supabase.rpc('increment_download_count', {
            lead_magnet_id: testSubscriptionData.lead_magnet_id
          });

          if (!incrementError) {
            console.log('✅ Download count incremented');
          } else {
            console.warn('⚠️ Download count increment failed:', incrementError);
          }

          trackingResult = { success: true, tracking };
        } else {
          console.error('❌ Tracking error:', trackingError);
          trackingResult = { success: false, error: trackingError.message };
        }
      } catch (trackError) {
        console.error('❌ Tracking exception:', trackError);
        trackingResult = { success: false, error: trackError };
      }
    }

    // Test 4: Test analytics functions
    let analyticsResult = null;
    try {
      const { data: analytics, error: analyticsError } = await supabase
        .rpc('get_newsletter_analytics');

      if (!analyticsError) {
        console.log('✅ Analytics function working');
        analyticsResult = { success: true, analytics };
      } else {
        console.warn('⚠️ Analytics function failed:', analyticsError);
        analyticsResult = { success: false, error: analyticsError.message };
      }
    } catch (analyticsException) {
      console.error('❌ Analytics exception:', analyticsException);
      analyticsResult = { success: false, error: analyticsException };
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Newsletter system test completed successfully!',
      results: {
        leadMagnets: {
          found: leadMagnets?.length || 0,
          data: leadMagnets?.map(lm => ({ id: lm.id, title: lm.title, active: lm.is_active })) || []
        },
        subscription: {
          success: true,
          email: subscription.email,
          id: subscription.id,
          leadMagnetId: subscription.lead_magnet_id
        },
        tracking: trackingResult,
        analytics: analyticsResult
      }
    });

  } catch (error) {
    console.error('🔥 Newsletter test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Newsletter system test failed'
    }, { status: 500 });
  }
}