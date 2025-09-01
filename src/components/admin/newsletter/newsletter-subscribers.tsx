// src/components/admin/newsletter/newsletter-subscribers.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Eye,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { NewsletterSubscriber } from '@/types/newsletter';
import { useToast } from '@/components/ui/use-toast';

interface NewsletterSubscribersProps {
  onRefresh?: () => void;
}

export function NewsletterSubscribers({ onRefresh }: NewsletterSubscribersProps): JSX.Element {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { toast } = useToast();
  const supabase = createClient();

  const fetchSubscribers = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);
      setFilteredSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriberStatus = async (
    subscriberId: string, 
    newStatus: NewsletterSubscriber['status']
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          status: newStatus,
          ...(newStatus === 'unsubscribed' ? { unsubscribed_at: new Date().toISOString() } : {}),
          ...(newStatus === 'active' && { unsubscribed_at: null, resubscribed_at: new Date().toISOString() })
        })
        .eq('id', subscriberId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Subscriber status changed to ${newStatus}`,
      });

      await fetchSubscribers();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating subscriber status:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber status",
        variant: "destructive",
      });
    }
  };

  const deleteSubscriber = async (subscriberId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: "Subscriber has been permanently removed",
      });

      await fetchSubscribers();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const exportSubscribers = (): void => {
    const csvContent = [
      ['Email', 'First Name', 'Last Name', 'Status', 'Source', 'Subscribed Date', 'Lead Magnet'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.first_name || '',
        sub.last_name || '',
        sub.status,
        sub.source || '',
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.lead_magnet || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Subscriber data has been downloaded as CSV",
    });
  };

  // Filter subscribers based on search term, status, and source
  useEffect(() => {
    let filtered = subscribers;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.first_name && sub.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.last_name && sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(sub => sub.source === sourceFilter);
    }

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  }, [subscribers, searchTerm, statusFilter, sourceFilter]);

  const getStatusColor = (status: NewsletterSubscriber['status']): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'unsubscribed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'bounced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'complained':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: NewsletterSubscriber['status']) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-3 w-3" />;
      case 'unsubscribed':
        return <UserX className="h-3 w-3" />;
      case 'bounced':
        return <Mail className="h-3 w-3" />;
      case 'complained':
        return <UserX className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  // Get unique sources for filter
  const uniqueSources = Array.from(new Set(subscribers.map(sub => sub.source).filter(Boolean)));

  useEffect(() => {
    fetchSubscribers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-40"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 rounded-lg border border-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
            <p className="text-muted-foreground">Manage and analyze your subscriber base</p>
          </div>
        </div>
        
        <Button 
          onClick={exportSubscribers}
          variant="outline"
          className="border-primary/20 hover:bg-primary/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {subscribers.length.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {subscribers.filter(s => s.status === 'active').length.toLocaleString()}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Unsubscribed</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {subscribers.filter(s => s.status === 'unsubscribed').length.toLocaleString()}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">This Month</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {subscribers.filter(s => {
                    const subDate = new Date(s.subscribed_at);
                    const now = new Date();
                    return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
                  }).length.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle>Subscriber Management</CardTitle>
          <CardDescription>Search, filter, and manage your subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="complained">Complained</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source!}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </div>

          {/* Subscribers Table */}
          <div className="mt-6">
            {currentSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {subscribers.length === 0 ? 'No subscribers yet' : 'No subscribers match your filters'}
                </h3>
                <p className="text-muted-foreground">
                  {subscribers.length === 0 
                    ? 'Start building your newsletter audience!'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Lead Magnet</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscriber.email}</div>
                            {(subscriber.first_name || subscriber.last_name) && (
                              <div className="text-sm text-muted-foreground">
                                {subscriber.first_name} {subscriber.last_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(subscriber.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(subscriber.status)}
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{subscriber.source || 'Direct'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{subscriber.lead_magnet || '-'}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3 text-blue-500" />
                              <span>{subscriber.email_open_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-green-500" />
                              <span>{subscriber.email_click_count}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setIsDetailsOpen(true);
                              }}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {subscriber.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateSubscriberStatus(subscriber.id, 'active')}
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete {subscriber.email}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteSubscriber(subscriber.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Subscriber
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Subscriber Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this subscriber
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscriber && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedSubscriber.email}</div>
                    <div><strong>Name:</strong> {selectedSubscriber.first_name || selectedSubscriber.last_name 
                      ? `${selectedSubscriber.first_name || ''} ${selectedSubscriber.last_name || ''}`.trim()
                      : 'Not provided'
                    }</div>
                    <div><strong>Status:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedSubscriber.status)}`}>
                        {selectedSubscriber.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Subscription Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Source:</strong> {selectedSubscriber.source || 'Direct'}</div>
                    <div><strong>Lead Magnet:</strong> {selectedSubscriber.lead_magnet || 'None'}</div>
                    <div><strong>Subscribed:</strong> {new Date(selectedSubscriber.subscribed_at).toLocaleString()}</div>
                    {selectedSubscriber.unsubscribed_at && (
                      <div><strong>Unsubscribed:</strong> {new Date(selectedSubscriber.unsubscribed_at).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Engagement</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Emails Opened:</strong> {selectedSubscriber.email_open_count}</div>
                    <div><strong>Links Clicked:</strong> {selectedSubscriber.email_click_count}</div>
                    {selectedSubscriber.last_email_sent_at && (
                      <div><strong>Last Email Sent:</strong> {new Date(selectedSubscriber.last_email_sent_at).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Technical Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>IP Address:</strong> {selectedSubscriber.client_ip || 'Not recorded'}</div>
                    <div><strong>User Agent:</strong> 
                      <div className="break-all text-xs text-muted-foreground mt-1">
                        {selectedSubscriber.user_agent || 'Not recorded'}
                      </div>
                    </div>
                    <div><strong>Referrer:</strong> {selectedSubscriber.referrer || 'Direct'}</div>
                  </div>
                </div>
              </div>

              {selectedSubscriber.tags && selectedSubscriber.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubscriber.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                {selectedSubscriber.status === 'active' ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateSubscriberStatus(selectedSubscriber.id, 'unsubscribed');
                      setIsDetailsOpen(false);
                    }}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Unsubscribe
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      updateSubscriberStatus(selectedSubscriber.id, 'active');
                      setIsDetailsOpen(false);
                    }}
                    className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Resubscribe
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}