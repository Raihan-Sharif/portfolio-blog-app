'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ServiceAnalyticsData {
  totalServices: number;
  activeServices: number;
  draftServices: number;
  featuredServices: number;
  totalViews: number;
  totalInquiries: number;
  pendingInquiries: number;
  conversionRate: number;
  topPerformingServices: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    inquiry_count: number;
    performance_score: number;
    is_featured: boolean;
    is_popular: boolean;
  }>;
  recentActivity: Array<{
    type: 'view' | 'inquiry';
    service_id: string;
    service_title: string;
    timestamp: string;
    details?: any;
  }>;
  viewsByDevice: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  inquiriesByStatus: {
    new: number;
    contacted: number;
    in_discussion: number;
    quoted: number;
    won: number;
    lost: number;
  };
  monthlyTrends: Array<{
    month: string;
    views: number;
    inquiries: number;
  }>;
}

export function useServiceAnalytics() {
  const [analytics, setAnalytics] = useState<ServiceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch services data
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, title, slug, view_count, inquiry_count, is_active, status, is_featured');

      if (servicesError) throw servicesError;

      // Fetch inquiries data
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('service_inquiries')
        .select(`
          id, 
          status, 
          created_at,
          service_id,
          service:services(title)
        `)
        .order('created_at', { ascending: false });

      if (inquiriesError) throw inquiriesError;

      // Fetch service views for device analytics
      const { data: serviceViews, error: viewsError } = await supabase
        .from('service_views')
        .select('device_type, viewed_at, service_id, service:services(title)')
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Calculate analytics
      const totalServices = services?.length || 0;
      const activeServices = services?.filter(s => s.is_active && s.status === 'active').length || 0;
      const draftServices = services?.filter(s => s.status === 'draft').length || 0;
      const featuredServices = services?.filter(s => s.is_featured).length || 0;
      const totalViews = services?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
      const totalInquiries = services?.reduce((sum, s) => sum + (s.inquiry_count || 0), 0) || 0;
      const pendingInquiries = inquiries?.filter(i => i.status === 'new').length || 0;
      const conversionRate = totalViews > 0 ? Math.round((totalInquiries / totalViews) * 10000) / 100 : 0;

      // Top performing services
      const topPerformingServices = services
        ?.map(service => ({
          ...service,
          performance_score: (service.view_count || 0) + (service.inquiry_count || 0) * 10,
          is_popular: (service.view_count || 0) > 100 || (service.inquiry_count || 0) > 5
        }))
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, 5) || [];

      // Recent activity (combine views and inquiries)
      const recentViews = serviceViews?.slice(0, 10).map(view => ({
        type: 'view' as const,
        service_id: view.service_id,
        service_title: (view.service as any)?.title || 'Unknown Service',
        timestamp: view.viewed_at,
        details: { device_type: view.device_type }
      })) || [];

      const recentInquiries = inquiries?.slice(0, 10).map(inquiry => ({
        type: 'inquiry' as const,
        service_id: inquiry.service_id || '',
        service_title: (inquiry.service as any)?.title || 'General Inquiry',
        timestamp: inquiry.created_at,
        details: { status: inquiry.status }
      })) || [];

      const recentActivity = [...recentViews, ...recentInquiries]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      // Views by device
      const viewsByDevice = serviceViews?.reduce(
        (acc, view) => {
          const deviceType = view.device_type || 'desktop';
          acc[deviceType as keyof typeof acc] = (acc[deviceType as keyof typeof acc] || 0) + 1;
          return acc;
        },
        { desktop: 0, mobile: 0, tablet: 0 }
      ) || { desktop: 0, mobile: 0, tablet: 0 };

      // Inquiries by status
      const inquiriesByStatus = inquiries?.reduce(
        (acc, inquiry) => {
          const status = inquiry.status || 'new';
          acc[status as keyof typeof acc] = (acc[status as keyof typeof acc] || 0) + 1;
          return acc;
        },
        { new: 0, contacted: 0, in_discussion: 0, quoted: 0, won: 0, lost: 0 }
      ) || { new: 0, contacted: 0, in_discussion: 0, quoted: 0, won: 0, lost: 0 };

      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

        const monthViews = serviceViews?.filter(v => 
          v.viewed_at.startsWith(monthStr)
        ).length || 0;

        const monthInquiries = inquiries?.filter(i => 
          i.created_at.startsWith(monthStr)
        ).length || 0;

        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          views: monthViews,
          inquiries: monthInquiries
        });
      }

      const analyticsData: ServiceAnalyticsData = {
        totalServices,
        activeServices,
        draftServices,
        featuredServices,
        totalViews,
        totalInquiries,
        pendingInquiries,
        conversionRate,
        topPerformingServices,
        recentActivity,
        viewsByDevice,
        inquiriesByStatus,
        monthlyTrends
      };

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching service analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscriptions
    const serviceViewsSubscription = supabase
      .channel('service_views')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'service_views' },
        () => {
          console.log('New service view detected, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    const serviceInquiriesSubscription = supabase
      .channel('service_inquiries')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'service_inquiries' },
        () => {
          console.log('New service inquiry detected, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    const servicesSubscription = supabase
      .channel('services')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'services' },
        () => {
          console.log('Service updated, refreshing analytics...');
          fetchAnalytics();
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