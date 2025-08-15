'use client';

import { Service, ServiceInquiry } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  DollarSign,
  Users,
  Star,
  Target
} from 'lucide-react';

interface ServiceAnalyticsProps {
  services: Service[];
  inquiries: ServiceInquiry[];
}

export default function ServiceAnalytics({ services, inquiries }: ServiceAnalyticsProps): JSX.Element {
  // Calculate analytics data
  const totalViews = services.reduce((sum, service) => sum + service.view_count, 0);
  const totalInquiries = services.reduce((sum, service) => sum + service.inquiry_count, 0);
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) : '0';
  
  const topPerformingServices = services
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
    newStatus: inquiries.filter(i => i.status === 'new').length,
    wonStatus: inquiries.filter(i => i.status === 'won').length
  };

  return (
    <div className="space-y-6">
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