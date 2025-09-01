import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const popular = searchParams.get('popular');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const search = searchParams.get('search');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (popular === 'true') {
      query = query.eq('is_popular', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%, short_description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const serviceData = {
      ...body,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: service, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select(`
        *,
        category:service_categories(*)
      `)
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Error in create service API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}