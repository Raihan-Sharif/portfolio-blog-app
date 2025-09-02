import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('lead_magnets')
      .select(`
        id,
        name,
        title,
        description,
        short_description,
        file_type,
        file_size,
        thumbnail_image,
        cover_image,
        download_count,
        view_count,
        conversion_count,
        category,
        tags,
        form_fields,
        thank_you_message,
        gate_type,
        seo_title,
        seo_description,
        social_image,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching lead magnets:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch lead magnets' 
      }, { status: 500 });
    }

    // Increment view count for each lead magnet (non-blocking)
    if (data && data.length > 0) {
      const viewPromises = data.map(async (magnet) => {
        try {
          await supabase.rpc('increment_lead_magnet_views', {
            p_lead_magnet_id: magnet.id
          });
        } catch (err) {
          console.warn('Failed to increment view:', err);
        }
      });
      
      // Don't wait for view tracking to complete
      Promise.all(viewPromises);
    }

    return NextResponse.json({
      data,
      count,
      hasMore: data && data.length === limit
    });

  } catch (error) {
    console.error('Lead magnets API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.title) {
      return NextResponse.json({
        error: 'Name and title are required'
      }, { status: 400 });
    }

    const leadMagnetData = {
      name: body.name.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || null,
      short_description: body.short_description?.trim() || null,
      file_url: body.file_url || null,
      file_type: body.file_type || 'pdf',
      file_size: body.file_size || null,
      thumbnail_image: body.thumbnail_image || null,
      cover_image: body.cover_image || null,
      category: body.category || null,
      tags: body.tags || [],
      form_fields: body.form_fields || [],
      thank_you_message: body.thank_you_message || null,
      redirect_url: body.redirect_url || null,
      gate_type: body.gate_type || 'email',
      access_level: body.access_level || 'public',
      seo_title: body.seo_title?.trim() || null,
      seo_description: body.seo_description?.trim() || null,
      social_image: body.social_image || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_featured: body.is_featured || false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('lead_magnets')
      .insert([leadMagnetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead magnet:', error);
      return NextResponse.json({ 
        error: 'Failed to create lead magnet',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Lead magnet created successfully',
      data 
    }, { status: 201 });

  } catch (error) {
    console.error('Create lead magnet API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}