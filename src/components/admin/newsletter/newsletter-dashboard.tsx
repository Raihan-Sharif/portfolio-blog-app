'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  BarChart3,
  Calendar
} from 'lucide-react';
import { NewsletterSubscriber, NewsletterStats, LeadMagnetStats } from '@/types/newsletter';
import { formatDistanceToNow } from 'date-fns';

interface NewsletterDashboardProps {
  initialStats?: NewsletterStats;
  initialSubscribers?: NewsletterSubscriber[];
  initialLeadMagnetStats?: LeadMagnetStats[];
}

export default function NewsletterDashboard({
  initialStats,
  initialSubscribers = [],
  initialLeadMagnetStats = []
}: NewsletterDashboardProps): JSX.Element {
  const [stats] = useState<NewsletterStats | null>(initialStats || null);
  const [subscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [leadMagnetStats] = useState<LeadMagnetStats[]>(initialLeadMagnetStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400';
      case 'unsubscribed': return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
      case 'bounced': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
      case 'complained': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-4 h-4" />;
      case 'unsubscribed': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Dashboard</h1>
          <p className="text-muted-foreground">Manage your email subscribers and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_subscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_subscribers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.new_subscribers_this_month}</div>
              <p className="text-xs text-muted-foreground">
                New subscribers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              {stats.growth_rate >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.growth_rate > 0 ? '+' : ''}{stats.growth_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.unsubscribed_subscribers / stats.total_subscribers) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.unsubscribed_subscribers} unsubscribed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Magnet Performance */}
      {leadMagnetStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Lead Magnet Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadMagnetStats.map((magnet, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium">{magnet.lead_magnet || 'Direct Signup'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {magnet.subscriber_count} subscribers
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{magnet.conversion_rate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">conversion rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Subscribers ({filteredSubscribers.length})
            </CardTitle>
            
            <div className="flex gap-2">
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
                <option value="complained">Complained</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Subscriber</th>
                  <th className="text-left p-2">Lead Magnet</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Subscribed</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{subscriber.email}</div>
                        {(subscriber.first_name || subscriber.last_name) && (
                          <div className="text-xs text-muted-foreground">
                            {[subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {subscriber.lead_magnet ? (
                        <Badge variant="outline" className="text-xs">
                          {subscriber.lead_magnet}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Direct</span>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge className={`${getStatusColor(subscriber.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(subscriber.status)}
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(subscriber.subscribed_at), { addSuffix: true })}
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className="text-xs">
                        {subscriber.source || 'website'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredSubscribers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No subscribers match your filters' : 'No subscribers yet'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}