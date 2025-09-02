import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'dashboard';
    const days = parseInt(searchParams.get('days') || '30');

    switch (type) {
      case 'dashboard':
        return getDashboardStats(supabase);
      
      case 'growth':
        return getGrowthStats(supabase, days);
      
      case 'lead_magnets':
        return getLeadMagnetStats(supabase);
      
      case 'campaigns':
        return getCampaignStats(supabase);
      
      default:
        return NextResponse.json({ 
          error: 'Invalid analytics type' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Newsletter analytics API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function getDashboardStats(supabase: any) {
  try {
    const { data, error } = await supabase
      .rpc('get_newsletter_dashboard_stats');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || {
        total_subscribers: 0,
        active_subscribers: 0,
        new_subscribers_today: 0,
        new_subscribers_week: 0,
        new_subscribers_month: 0,
        unsubscribed_this_month: 0,
        total_campaigns: 0,
        campaigns_this_month: 0,
        avg_open_rate: 0,
        avg_click_rate: 0,
        avg_engagement_score: 50,
        top_performing_campaign_id: null,
        bounce_rate: 0
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard statistics' 
    }, { status: 500 });
  }
}

async function getGrowthStats(supabase: any, days: number) {
  try {
    const { data, error } = await supabase
      .rpc('get_subscriber_growth_detailed', { days_back: days });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Growth stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch growth statistics' 
    }, { status: 500 });
  }
}

async function getLeadMagnetStats(supabase: any) {
  try {
    const { data, error } = await supabase
      .rpc('get_lead_magnet_stats');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Lead magnet stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch lead magnet statistics' 
    }, { status: 500 });
  }
}

async function getCampaignStats(supabase: any) {
  try {
    const { data, error } = await supabase
      .rpc('get_campaign_performance_advanced');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Campaign stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch campaign statistics' 
    }, { status: 500 });
  }
}