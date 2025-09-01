// src/app/admin/newsletter/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewsletterAnalytics } from '@/components/admin/newsletter/newsletter-analytics';
import { NewsletterSettings } from '@/components/admin/newsletter/newsletter-settings';
import { NewsletterCampaigns } from '@/components/admin/newsletter/newsletter-campaigns';
import { NewsletterSubscribers } from '@/components/admin/newsletter/newsletter-subscribers';
import { LeadMagnets } from '@/components/admin/newsletter/lead-magnets';
import { createClient } from '@/utils/supabase/client';
import { NewsletterStats } from '@/types/newsletter';
import { 
  Settings as SettingsIcon, 
  BarChart3, 
  Users, 
  Send,
  Plus,
  UserCheck,
  UserX,
  Gift
} from 'lucide-react';

interface NewsletterStatus {
  enabled: boolean;
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  totalCampaigns: number;
  lastCampaignSent?: string;
}

function NewsletterPageContent(): JSX.Element {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [status, setStatus] = useState<NewsletterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const supabase = createClient();

  const fetchNewsletterData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch newsletter statistics using new function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_newsletter_analytics');

      if (statsError) throw statsError;

      // Fetch newsletter campaigns count
      const { count: campaignsCount, error: campaignsError } = await supabase
        .from('newsletter_campaigns')
        .select('*', { count: 'exact', head: true });

      if (campaignsError) throw campaignsError;

      // Fetch last campaign sent
      const { data: lastCampaign, error: lastCampaignError } = await supabase
        .from('newsletter_campaigns')
        .select('sent_at, name')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1);

      if (lastCampaignError) throw lastCampaignError;

      // For now, we'll assume newsletter is enabled by default
      // In a real app, you might want to store this in a settings table
      const newsletterStatus: NewsletterStatus = {
        enabled: true,
        totalSubscribers: statsData?.total_subscribers || 0,
        activeSubscribers: statsData?.active_subscribers || 0,
        unsubscribedCount: statsData?.unsubscribed_subscribers || 0,
        totalCampaigns: campaignsCount || 0,
        lastCampaignSent: lastCampaign?.[0]?.sent_at
      };

      setStats(statsData);
      setStatus(newsletterStatus);
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNewsletterData();
  }, [fetchNewsletterData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Newsletter Management</h1>
            <p className="text-muted-foreground">Manage your newsletter campaigns, subscribers, and analytics</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-muted animate-pulse rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
            Newsletter Management
          </h1>
          <p className="text-muted-foreground">
            Manage your newsletter campaigns, subscribers, and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status?.enabled ? 'success' : 'secondary'}>
            {status?.enabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            onClick={() => setActiveTab('campaigns')}
            className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {status?.totalSubscribers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              +{stats?.new_subscribers_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Subscribers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {status?.activeSubscribers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {status?.totalSubscribers ? 
                ((status.activeSubscribers / status.totalSubscribers) * 100).toFixed(1)
                : 0}% active rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Unsubscribed
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {status?.unsubscribedCount.toLocaleString() || 0}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {status?.totalSubscribers ? 
                ((status.unsubscribedCount / status.totalSubscribers) * 100).toFixed(1)
                : 0}% unsubscribe rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Campaigns
            </CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {status?.totalCampaigns.toLocaleString() || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {status?.lastCampaignSent 
                ? `Last sent ${new Date(status.lastCampaignSent).toLocaleDateString()}`
                : 'No campaigns sent'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="lead-magnets" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Lead Magnets
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <NewsletterAnalytics stats={stats} />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <NewsletterCampaigns onRefresh={fetchNewsletterData} />
        </TabsContent>

        <TabsContent value="lead-magnets" className="space-y-6">
          <LeadMagnets onRefresh={fetchNewsletterData} />
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <NewsletterSubscribers onRefresh={fetchNewsletterData} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NewsletterSettings onRefresh={fetchNewsletterData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewsletterPage(): JSX.Element {
  return (
    <AdminLayout>
      <NewsletterPageContent />
    </AdminLayout>
  );
}