import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ServiceInquiryFormData } from '@/types/services';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const service_id = searchParams.get('service_id');
    const limit = searchParams.get('limit');

    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('service_inquiries')
      .select(`
        *,
        service:services(title, slug),
        package:service_packages(name, price)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (service_id) {
      query = query.eq('service_id', service_id);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: inquiries, error } = await query;

    if (error) {
      console.error('Error fetching service inquiries:', error);
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Error in service inquiries API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const body: ServiceInquiryFormData & { recaptcha_token?: string } = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.project_description) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name, email, and project description are required'
      }, { status: 400 });
    }

    // Verify reCAPTCHA
    if (body.recaptcha_token) {
      const isValidRecaptcha = await verifyRecaptcha(body.recaptcha_token);
      if (!isValidRecaptcha) {
        return NextResponse.json({ 
          error: 'reCAPTCHA verification failed',
          details: 'Please complete the security verification'
        }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'reCAPTCHA verification required',
        details: 'Please complete the security verification'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ 
        error: 'Invalid email format'
      }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // Prepare inquiry data with proper type conversion
    const inquiryData = {
      service_id: body.service_id || null,
      package_id: body.package_id || null,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      project_title: body.project_title?.trim() || null,
      project_description: body.project_description.trim(),
      budget_range: body.budget_range || null,
      timeline: body.timeline || null,
      additional_requirements: body.additional_requirements?.trim() || null,
      preferred_contact: body.preferred_contact || 'email',
      urgency: body.urgency || 'normal',
      client_ip: clientIp,
      user_agent: userAgent,
      referrer: referrer,
      status: 'new' as const
    };

    const { data: inquiry, error } = await supabase
      .from('service_inquiries')
      .insert([inquiryData])
      .select(`
        *,
        service:services(title, slug),
        package:service_packages(name, price)
      `)
      .single();

    if (error) {
      console.error('Error creating service inquiry:', error);
      console.error('Inquiry data:', inquiryData);
      return NextResponse.json({ 
        error: 'Failed to create inquiry',
        details: error.message
      }, { status: 500 });
    }

    // Increment service inquiry count
    if (inquiry.service_id) {
      try {
        const { data: service } = await supabase
          .from('services')
          .select('slug')
          .eq('id', inquiry.service_id)
          .single();
        
        if (service) {
          await supabase.rpc('increment_service_inquiries', { 
            service_slug: service.slug 
          });
        }
      } catch (incrementError) {
        console.warn('Failed to increment inquiry count:', incrementError);
      }
    }

    return NextResponse.json({ 
      inquiry,
      message: 'Inquiry submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create service inquiry API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}