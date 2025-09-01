import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'view';
    const serviceSlug = searchParams.get('slug') || 'web-development';
    
    let result;
    
    if (action === 'view') {
      // Test view tracking
      console.log('Testing view tracking for service:', serviceSlug);
      
      result = await supabase.rpc('track_service_view_detailed', {
        service_slug: serviceSlug,
        p_client_ip: '192.168.1.1',
        p_user_agent: 'Test User Agent',
        p_referrer: 'https://test.com',
        p_device_type: 'desktop'
      });
      
      console.log('View tracking result:', result);
      
    } else if (action === 'inquiry') {
      // Test inquiry increment
      console.log('Testing inquiry tracking for service:', serviceSlug);
      
      result = await supabase.rpc('increment_service_inquiries', {
        service_slug: serviceSlug
      });
      
      console.log('Inquiry tracking result:', result);
      
    } else if (action === 'analytics') {
      // Test analytics
      console.log('Testing analytics summary');
      
      result = await supabase.rpc('get_service_analytics_summary');
      
      console.log('Analytics result:', result);
      
    } else if (action === 'services') {
      // Get current service counts
      const { data: services, error } = await supabase
        .from('services')
        .select('title, slug, view_count, inquiry_count')
        .order('view_count', { ascending: false });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        services: services
      });
    }

    if (result?.error) {
      console.error('Function error:', result.error);
      return NextResponse.json({ 
        success: false,
        error: result.error.message,
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      action,
      serviceSlug,
      result: result?.data || 'Function executed successfully'
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, serviceSlug } = body;
    
    // Similar logic as GET but for POST requests
    return GET(new NextRequest(`${request.url}?action=${action}&slug=${serviceSlug}`, {
      method: 'GET',
      headers: request.headers
    }));
    
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid request body'
    }, { status: 400 });
  }
}