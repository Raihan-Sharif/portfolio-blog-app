// src/components/admin/newsletter/newsletter-analytics.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  Eye,
  Target
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { NewsletterStats, LeadMagnetStats } from '@/types/newsletter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface NewsletterAnalyticsProps {
  stats: NewsletterStats | null;
}

interface ChartDataPoint {
  date: string;
  subscribers: number;
  new_subscribers: number;
  unsubscribed: number;
}

interface CampaignPerformance {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_rate: number;
}

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function NewsletterAnalytics({ stats }: NewsletterAnalyticsProps): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [leadMagnetStats, setLeadMagnetStats] = useState<LeadMagnetStats[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  
  const supabase = createClient();

  const fetchAnalyticsData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch dynamic growth data from database
      const { data: growthData, error: growthError } = await supabase
        .rpc('get_subscriber_growth_data');

      if (!growthError && growthData) {
        const chartData = growthData.map((row: any) => ({
          date: row.date_bucket,
          subscribers: row.total_active,
          new_subscribers: row.new_subscribers,
          unsubscribed: row.unsubscribed
        }));
        setChartData(chartData);
      } else {
        // Fallback to empty data
        setChartData([]);
      }

      // Fetch campaign performance using function
      const { data: campaignData, error: campaignError } = await supabase
        .rpc('get_campaign_performance');

      if (!campaignError && campaignData) {
        const performance: CampaignPerformance[] = campaignData.map((campaign: any) => ({
          name: campaign.campaign_name.length > 20 ? campaign.campaign_name.substring(0, 20) + '...' : campaign.campaign_name,
          sent: campaign.total_recipients,
          opened: campaign.total_opened,
          clicked: campaign.total_clicked,
          open_rate: campaign.open_rate,
          click_rate: campaign.click_rate,
        }));
        setCampaignPerformance(performance);
      }

      // Fetch lead magnet stats using function
      try {
        const { data: leadMagnetData, error: leadMagnetError } = await supabase
          .rpc('get_lead_magnet_stats');

        if (!leadMagnetError && leadMagnetData) {
          const statsData = leadMagnetData.map((stat: any) => ({
            lead_magnet: stat.name,
            subscriber_count: stat.subscriber_count,
            conversion_rate: stat.conversion_rate
          }));
          setLeadMagnetStats(statsData);
        }
      } catch {
        console.log('Lead magnet stats not available');
      }

      // Fetch subscription sources using function
      try {
        const { data: sourceData, error: sourceError } = await supabase
          .rpc('get_subscription_sources');

        if (!sourceError && sourceData) {
          const sources: SourceData[] = sourceData.map((source: any) => ({
            source: source.source,
            count: source.subscriber_count,
            percentage: source.percentage
          }));
          setSourceData(sources);
        }
      } catch {
        console.log('Subscription sources not available');
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [stats]);

  const growthRate = stats?.growth_rate || 0;

  if (loading) {
    return (
      <div className="space-y-6">
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
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-40"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded"></div>
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 rounded-lg border border-primary/20">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Newsletter Analytics</h2>
            <p className="text-muted-foreground">Detailed insights into your newsletter performance</p>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Growth Rate
            </CardTitle>
            {growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
            <p className={`text-xs ${growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              vs. last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Avg. Open Rate
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {campaignPerformance.length > 0 
                ? (campaignPerformance.reduce((sum, c) => sum + c.open_rate, 0) / campaignPerformance.length).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Industry avg: 21.3%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Avg. Click Rate
            </CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {campaignPerformance.length > 0 
                ? (campaignPerformance.reduce((sum, c) => sum + c.click_rate, 0) / campaignPerformance.length).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Industry avg: 2.6%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.total_subscribers && stats?.total_subscribers > 0 
                ? ((stats?.active_subscribers / stats.total_subscribers) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Active/Total ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="lead-magnets">Lead Magnets</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Subscriber Growth (Last 30 Days)
              </CardTitle>
              <CardDescription>
                Track your newsletter growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'subscribers' ? 'Total Subscribers' : 
                      name === 'new_subscribers' ? 'New Subscribers' : 'Unsubscribed'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="subscribers" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Total Subscribers"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="new_subscribers" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.8}
                    name="New Subscribers"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="unsubscribed" 
                    stackId="3" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                    name="Unsubscribed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Recent Campaign Performance
              </CardTitle>
              <CardDescription>
                Open and click rates for your recent campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No campaign data available yet.</p>
                  <p className="text-sm text-muted-foreground">Send your first campaign to see performance metrics.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name.includes('rate') ? `${value.toFixed(1)}%` : value,
                        name === 'open_rate' ? 'Open Rate' : 
                        name === 'click_rate' ? 'Click Rate' : 
                        name === 'sent' ? 'Sent' : 
                        name === 'opened' ? 'Opened' : 'Clicked'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="open_rate" fill="#3B82F6" name="Open Rate (%)" />
                    <Bar dataKey="click_rate" fill="#10B981" name="Click Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Subscription Sources
              </CardTitle>
              <CardDescription>
                Where your subscribers are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sourceData.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No source data available yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Subscribers']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {sourceData.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{source.source}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{source.count}</div>
                          <div className="text-sm text-muted-foreground">{source.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-magnets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Lead Magnet Performance
              </CardTitle>
              <CardDescription>
                Conversion rates for your lead magnets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadMagnetStats.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No lead magnet data available yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={leadMagnetStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="lead_magnet" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="subscriber_count" fill="#3B82F6" name="Subscribers" />
                    <Bar dataKey="conversion_rate" fill="#10B981" name="Conversion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}