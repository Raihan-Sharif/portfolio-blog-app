'use client';

import { useState, useCallback, useEffect } from 'react';
import { Service, ServiceCategory, ServiceInquiry } from '@/types/services';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  BarChart3,
  FileText,
  Settings,
  Users,
  RefreshCw,
  Activity,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/admin-layout';
import ServicesTable from './services-table';
import ServiceCategoriesManager from './service-categories-manager';
import ServiceInquiriesTable from './service-inquiries-table';
import ServiceAnalytics from './service-analytics';
import { useServiceAnalytics } from '@/hooks/use-service-analytics';
import TestServiceTracking from '../test-service-tracking';

interface AdminServicesContentProps {
  services: Service[];
  categories: ServiceCategory[];
  recentInquiries: ServiceInquiry[];
  stats: {
    totalServices: number;
    activeServices: number;
    draftServices: number;
    featuredServices: number;
    totalViews: number;
    totalInquiries: number;
    pendingInquiries: number;
    conversionRate: number;
  };
}

export default function AdminServicesContent({ 
  services, 
  categories: initialCategories, 
  recentInquiries: initialInquiries, 
  stats 
}: AdminServicesContentProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentInquiries, setRecentInquiries] = useState<ServiceInquiry[]>(initialInquiries);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [servicesData, setServicesData] = useState<Service[]>(services);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Use real-time analytics hook
  const { analytics, loading: analyticsLoading, error: analyticsError, refreshAnalytics } = useServiceAnalytics();
  
  // Manual refresh function
  const refreshAllData = useCallback(async () => {
    setLastRefresh(new Date());
    await Promise.all([
      refreshInquiries(),
      refreshCategories(),
      refreshAnalytics(),
      refreshServices()
    ]);
  }, []);

  const refreshServices = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*),
          packages:service_packages(*),
          testimonials:service_testimonials(*)
        `)
        .order('created_at', { ascending: false });
      
      if (data) {
        setServicesData(data as Service[]);
      }
    } catch (error) {
      console.error('Error refreshing services:', error);
    }
  }, []);

  const refreshInquiries = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('service_inquiries')
        .select(`
          *,
          service:services(title, slug),
          package:service_packages(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setRecentInquiries(data as ServiceInquiry[]);
      }
    } catch (error) {
      console.error('Error refreshing inquiries:', error);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (data) {
        setCategories(data as ServiceCategory[]);
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your services, categories, packages, and client inquiries
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()} {analyticsLoading && '• Updating...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={analyticsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Link href="/admin/services/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{analytics?.totalServices || stats.totalServices}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-green-600 font-medium">
                    {analytics?.activeServices || stats.activeServices} active
                  </p>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.draftServices || stats.draftServices} draft
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-3xl"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl shadow-sm">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{(analytics?.totalViews || stats.totalViews).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  {analytics?.viewsByDevice && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Monitor className="w-3 h-3" />
                        {analytics.viewsByDevice.desktop}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Smartphone className="w-3 h-3" />
                        {analytics.viewsByDevice.mobile}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-3xl"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-sm">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{analytics?.totalInquiries || stats.totalInquiries}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-orange-600 font-medium">
                    {analytics?.pendingInquiries || stats.pendingInquiries} pending
                  </p>
                  {analytics?.inquiriesByStatus?.won && analytics.inquiriesByStatus.won > 0 && (
                    <>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <p className="text-xs text-green-600">
                        {analytics.inquiriesByStatus.won} won
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-bl-3xl"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-xl shadow-sm">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics?.conversionRate || stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Views to inquiries
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-bl-3xl"></div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/services/new">
                    <Plus className="w-6 h-6" />
                    New Service
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/services?tab=inquiries&status=new">
                    <MessageCircle className="w-6 h-6" />
                    View Inquiries
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/services?tab=categories">
                    <Settings className="w-6 h-6" />
                    Manage Categories
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/services?tab=analytics">
                    <BarChart3 className="w-6 h-6" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Performing Services
                  {analyticsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.topPerformingServices || 
                    servicesData
                      .sort((a, b) => (b.view_count + b.inquiry_count * 10) - (a.view_count + a.inquiry_count * 10))
                      .slice(0, 5)
                  ).map((service, index) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-muted/20 hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{service.title}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {service.view_count?.toLocaleString() || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {service.inquiry_count || 0}
                              </span>
                              {(service as any).performance_score && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                  Score: {(service as any).performance_score}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={'is_featured' in service && service.is_featured ? 'default' : 'outline'}>
                            {'is_featured' in service && service.is_featured ? 'Featured' : 'Standard'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                  {analyticsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics?.recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-transparent rounded-lg border-l-4 border-primary/20">
                      <div className={`p-2 rounded-full ${activity.type === 'view' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {activity.type === 'view' ? 
                          <Eye className="w-3 h-3 text-green-600 dark:text-green-300" /> : 
                          <MessageCircle className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.type === 'view' ? 'Service viewed' : 'New inquiry'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.service_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={activity.type === 'view' ? 'outline' : 'default'}>
                        {activity.type === 'view' ? (activity.details?.device_type || 'view') : (activity.details?.status || 'inquiry')}
                      </Badge>
                    </div>
                  )) || (
                    // Fallback to recent inquiries if analytics not available
                    recentInquiries.slice(0, 5).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{inquiry.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {inquiry.service?.title || 'General Inquiry'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          inquiry.status === 'new' ? 'default' : 
                          inquiry.status === 'contacted' ? 'secondary' :
                          inquiry.status === 'won' ? 'default' : 'outline'
                        }>
                          {inquiry.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/services?tab=inquiries">
                    View All Activity
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServicesTable services={servicesData} categories={categories} />
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-6">
          <ServiceInquiriesTable 
            inquiries={recentInquiries} 
            onInquiryUpdate={refreshInquiries}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <ServiceCategoriesManager categories={categories} onRefresh={refreshCategories} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ServiceAnalytics 
            services={servicesData} 
            inquiries={recentInquiries} 
            analytics={analytics}
            loading={analyticsLoading}
            error={analyticsError}
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="flex justify-center">
            <TestServiceTracking />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}