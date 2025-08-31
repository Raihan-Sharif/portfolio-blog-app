'use client';

import { Service, ServiceInquiry } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceAnalyticsData } from '@/hooks/use-service-analytics';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  Users,
  Star,
  Target,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ServiceAnalyticsProps {
  services: Service[];
  inquiries: ServiceInquiry[];
  analytics?: ServiceAnalyticsData | null;
  loading?: boolean;
  error?: string | null;
}

export default function ServiceAnalytics({ 
  services, 
  inquiries, 
  analytics, 
  loading, 
  error 
}: ServiceAnalyticsProps): JSX.Element {
  
  // Use analytics data if available, otherwise calculate fallback
  const totalViews = analytics?.totalViews || services.reduce((sum, service) => sum + service.view_count, 0);
  const totalInquiries = analytics?.totalInquiries || services.reduce((sum, service) => sum + service.inquiry_count, 0);
  const conversionRate = analytics?.conversionRate || (totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) : '0');
  
  const topPerformingServices = analytics?.topPerformingServices || services
    .sort((a, b) => (b.view_count + b.inquiry_count * 10) - (a.view_count + a.inquiry_count * 10))
    .slice(0, 5);

  const categoryStats = services.reduce((acc, service) => {
    const categoryName = service.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = { views: 0, inquiries: 0, count: 0 };
    }
    acc[categoryName].views += service.view_count;
    acc[categoryName].inquiries += service.inquiry_count;
    acc[categoryName].count += 1;
    return acc;
  }, {} as Record<string, { views: number; inquiries: number; count: number }>);

  const recentInquiriesStats = {
    thisWeek: inquiries.filter(i => {
      const inquiryDate = new Date(i.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return inquiryDate >= weekAgo;
    }).length,
    newStatus: analytics?.inquiriesByStatus.new || inquiries.filter(i => i.status === 'new').length,
    wonStatus: analytics?.inquiriesByStatus.won || inquiries.filter(i => i.status === 'won').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your service performance and user engagement
          </p>
        </div>
        {loading && <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">
                Error loading analytics: {error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Analytics */}
      {analytics?.viewsByDevice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Views by Device Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Desktop</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.viewsByDevice.desktop.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium">Mobile</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.viewsByDevice.mobile.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Tablet className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Tablet</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.viewsByDevice.tablet.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      {analytics?.monthlyTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium">{trend.month}</div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{trend.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{trend.inquiries} inquiries</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{totalInquiries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
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
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{recentInquiriesStats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">New inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top Performing Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingServices.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium truncate">{service.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                  <div className="flex gap-1">
                    {service.is_featured && (
                      <Badge variant="default" className="text-xs">Featured</Badge>
                    )}
                    {service.is_popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryStats).map(([categoryName, stats]) => (
                <div key={categoryName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{categoryName}</span>
                    <Badge variant="outline">{stats.count} services</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>{stats.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span>{stats.inquiries} inquiries</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${totalViews > 0 ? (stats.views / totalViews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiry Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Inquiry Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recentInquiriesStats.newStatus}</div>
              <div className="text-sm text-muted-foreground">New Inquiries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {inquiries.filter(i => i.status === 'contacted').length}
              </div>
              <div className="text-sm text-muted-foreground">Contacted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {inquiries.filter(i => i.status === 'in_discussion').length}
              </div>
              <div className="text-sm text-muted-foreground">In Discussion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recentInquiriesStats.wonStatus}</div>
              <div className="text-sm text-muted-foreground">Won Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}