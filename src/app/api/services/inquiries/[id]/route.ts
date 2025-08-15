import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: inquiry, error } = await supabase
      .from('service_inquiries')
      .select(`
        *,
        service:services(title, slug),
        package:service_packages(name, price)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
      console.error('Error fetching service inquiry:', error);
      return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('Error in service inquiry detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = {
      ...body,
      responded_by: body.status !== 'new' ? user.id : null,
      response_sent_at: body.status !== 'new' ? new Date().toISOString() : null
    };

    const { data: inquiry, error } = await supabase
      .from('service_inquiries')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        service:services(title, slug),
        package:service_packages(name, price)
      `)
      .single();

    if (error) {
      console.error('Error updating service inquiry:', error);
      return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('Error in update service inquiry API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('service_inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service inquiry:', error);
      return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error in delete service inquiry API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}