'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface OptimizedServiceAnalyticsData {
  // Summary stats
  totalServices: number;
  activeServices: number;
  totalViews: number;
  totalInquiries: number;
  viewsToday: number;
  inquiriesToday: number;
  conversionRate: number;
  
  // Top performing services
  topPerformingServices: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    inquiry_count: number;
    performance_score: number;
    is_featured: boolean;
    category_name: string;
  }>;
  
  // Device analytics
  deviceAnalytics: Array<{
    device_type: string;
    view_count: number;
    percentage: number;
  }>;
  
  // Monthly trends
  monthlyTrends: Array<{
    month_year: string;
    views: number;
    inquiries: number;
    conversion_rate: number;
  }>;
  
  // Inquiry status distribution
  inquiryStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    activity_type: 'view' | 'inquiry';
    service_id: string;
    service_title: string;
    activity_timestamp: string;
    details: any;
  }>;
}

export function useOptimizedServiceAnalytics() {
  const [analytics, setAnalytics] = useState<OptimizedServiceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch of all analytics data using optimized database functions
      const [
        summaryResult,
        topServicesResult,
        deviceResult,
        trendsResult,
        statusResult,
        activityResult
      ] = await Promise.all([
        supabase.rpc('get_service_analytics_summary'),
        supabase.rpc('get_top_performing_services', { p_limit: 5 }),
        supabase.rpc('get_device_analytics', { p_days: 30 }),
        supabase.rpc('get_monthly_service_trends', { p_months: 6 }),
        supabase.rpc('get_inquiry_status_distribution'),
        supabase.rpc('get_recent_service_activity', { p_limit: 20 })
      ]);

      // Check for errors
      const results = [summaryResult, topServicesResult, deviceResult, trendsResult, statusResult, activityResult];
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.error('Analytics fetch errors:', errors);
        throw new Error(`Failed to fetch analytics: ${errors[0].error.message}`);
      }

      // Extract summary data
      const summary = summaryResult.data?.[0] || {};
      
      const analyticsData: OptimizedServiceAnalyticsData = {
        totalServices: summary.total_services || 0,
        activeServices: summary.active_services || 0,
        totalViews: Number(summary.total_views) || 0,
        totalInquiries: Number(summary.total_inquiries) || 0,
        viewsToday: Number(summary.views_today) || 0,
        inquiriesToday: Number(summary.inquiries_today) || 0,
        conversionRate: Number(summary.conversion_rate) || 0,
        
        topPerformingServices: topServicesResult.data || [],
        
        deviceAnalytics: deviceResult.data || [],
        
        monthlyTrends: trendsResult.data || [],
        
        inquiryStatusDistribution: statusResult.data || [],
        
        recentActivity: activityResult.data || []
      };

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching optimized service analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscriptions for live updates
    const serviceViewsSubscription = supabase
      .channel('service_views_optimized')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'service_views' },
        (payload) => {
          console.log('New service view detected, refreshing optimized analytics...');
          // Debounce refresh to avoid too many calls
          setTimeout(fetchAnalytics, 1000);
        }
      )
      .subscribe();

    const serviceInquiriesSubscription = supabase
      .channel('service_inquiries_optimized')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'service_inquiries' },
        (payload) => {
          console.log('New service inquiry detected, refreshing optimized analytics...');
          // Debounce refresh to avoid too many calls
          setTimeout(fetchAnalytics, 1000);
        }
      )
      .subscribe();

    const servicesSubscription = supabase
      .channel('services_optimized')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'services' },
        (payload) => {
          console.log('Service updated, refreshing optimized analytics...');
          setTimeout(fetchAnalytics, 2000);
        }
      )
      .subscribe();

    return () => {
      serviceViewsSubscription.unsubscribe();
      serviceInquiriesSubscription.unsubscribe();
      servicesSubscription.unsubscribe();
    };
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
}