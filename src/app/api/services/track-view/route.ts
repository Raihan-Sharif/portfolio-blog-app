import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    
    const { serviceId, serviceSlug } = body;
    
    if (!serviceId && !serviceSlug) {
      return NextResponse.json({ 
        error: 'Service ID or slug is required' 
      }, { status: 400 });
    }

    // Get client information
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Determine device type from user agent
    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    let finalServiceSlug = serviceSlug;
    let finalServiceId = serviceId;
    
    // If we have an ID but no slug, get the service slug
    if (!serviceSlug && serviceId) {
      const { data: service, error } = await supabase
        .from('services')
        .select('slug')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();
      
      if (error || !service) {
        return NextResponse.json({ 
          error: 'Service not found' 
        }, { status: 404 });
      }
      
      finalServiceSlug = service.slug;
    }

    // If we have a slug but no ID, get the service ID
    if (!serviceId && serviceSlug) {
      const { data: service, error } = await supabase
        .from('services')
        .select('id')
        .eq('slug', serviceSlug)
        .eq('is_active', true)
        .single();
      
      if (error || !service) {
        return NextResponse.json({ 
          error: 'Service not found' 
        }, { status: 404 });
      }
      
      finalServiceId = service.id;
    }

    if (!finalServiceSlug) {
      return NextResponse.json({ 
        error: 'Could not determine service slug' 
      }, { status: 400 });
    }

    // Use the optimized tracking function with slug
    const { error: trackError } = await supabase.rpc('track_service_view_detailed', {
      service_slug: finalServiceSlug,
      p_client_ip: clientIp,
      p_user_agent: userAgent,
      p_referrer: referrer,
      p_device_type: deviceType
    });

    if (trackError) {
      console.error('Error tracking service view:', trackError);
      return NextResponse.json({ 
        error: 'Failed to track view',
        details: trackError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'View tracked successfully',
      data: {
        serviceId: finalServiceId,
        serviceSlug: finalServiceSlug,
        deviceType,
        clientIp: clientIp.split(',')[0] // Only return first IP for privacy
      }
    });

  } catch (error) {
    console.error('Error in track service view API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support GET requests for simple tracking
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const serviceSlug = searchParams.get('slug');
    
    if (!serviceId && !serviceSlug) {
      return NextResponse.json({ 
        error: 'Service ID or slug is required' 
      }, { status: 400 });
    }

    // Convert GET to POST internally
    return await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ serviceId, serviceSlug })
    }));

  } catch (error) {
    console.error('Error in GET track service view:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}