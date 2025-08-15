'use client';

import { useState, useCallback } from 'react';
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
  DollarSign,
  BarChart3,
  FileText,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/admin-layout';
import ServicesTable from './services-table';
import ServiceCategoriesManager from './service-categories-manager';
import ServiceInquiriesTable from './service-inquiries-table';
import ServiceAnalytics from './service-analytics';

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
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <Link href="/admin/services/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Service
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{stats.totalServices}</p>
                <p className="text-xs text-green-600">
                  {stats.activeServices} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Across all services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
                <p className="text-xs text-orange-600">
                  {stats.pendingInquiries} pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Views to inquiries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
            {/* Popular Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Performing Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services
                    .sort((a, b) => (b.view_count + b.inquiry_count * 10) - (a.view_count + a.inquiry_count * 10))
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{service.title}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {service.view_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {service.inquiry_count}
                            </span>
                          </div>
                        </div>
                        <Badge variant={service.is_featured ? 'default' : 'outline'}>
                          {service.is_featured ? 'Featured' : 'Standard'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Inquiries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInquiries.slice(0, 5).map((inquiry) => (
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
                  ))}
                </div>
                {recentInquiries.length > 5 && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/admin/services/inquiries">
                      View All Inquiries
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServicesTable services={services} categories={categories} />
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
          <ServiceAnalytics services={services} inquiries={recentInquiries} />
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}