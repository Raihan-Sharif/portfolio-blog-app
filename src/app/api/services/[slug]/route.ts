import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  slug: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { slug } = params;
    const supabase = createServerSupabaseClient();

    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*),
        packages:service_packages(*),
        testimonials:service_testimonials(*),
        faqs:service_faqs(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
      console.error('Error fetching service:', error);
      return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }

    // Track service view with enhanced analytics
    try {
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';
      const referrer = request.headers.get('referer') || '';
      
      // Determine device type
      const ua = userAgent.toLowerCase();
      let deviceType = 'desktop';
      if (ua.includes('mobile') || ua.includes('android')) {
        deviceType = 'mobile';
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet';
      }

      // Use enhanced tracking function
      await supabase.rpc('track_service_view_detailed', {
        service_slug: slug,
        p_client_ip: clientIp,
        p_user_agent: userAgent,
        p_referrer: referrer,
        p_device_type: deviceType
      });
    } catch (viewError) {
      console.warn('Failed to track service view:', viewError);
      // Fallback to basic tracking
      try {
        await supabase.rpc('increment_service_views', { service_slug: slug });
      } catch (fallbackError) {
        console.error('Failed to track service view with fallback:', fallbackError);
      }
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error in service detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { slug } = params;
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updated_by: user.id
    };

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('slug', slug)
      .select(`
        *,
        category:service_categories(*),
        packages:service_packages(*),
        testimonials:service_testimonials(*),
        faqs:service_faqs(*)
      `)
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error in update service API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { slug } = params;
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in delete service API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}