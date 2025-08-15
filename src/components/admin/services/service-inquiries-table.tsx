'use client';

import { useState } from 'react';
import { ServiceInquiry } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Mail, Phone, Clock, MoreHorizontal, CheckCircle, MessageCircle, X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ServiceInquiriesTableProps {
  inquiries: ServiceInquiry[];
  onInquiryUpdate?: () => void;
}

export default function ServiceInquiriesTable({ inquiries, onInquiryUpdate }: ServiceInquiriesTableProps): JSX.Element {
  const [updatingInquiry, setUpdatingInquiry] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);
  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    setUpdatingInquiry(inquiryId);
    
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Inquiry status has been updated to ${newStatus}.`,
      });

      onInquiryUpdate?.();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingInquiry(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'new': { variant: 'default', label: 'New', icon: AlertCircle },
      'contacted': { variant: 'secondary', label: 'Contacted', icon: MessageCircle },
      'in_discussion': { variant: 'outline', label: 'In Discussion', icon: MessageCircle },
      'quoted': { variant: 'outline', label: 'Quoted', icon: DollarSign },
      'won': { variant: 'default', label: 'Won', icon: CheckCircle2 },
      'lost': { variant: 'destructive', label: 'Lost', icon: X }
    } as const;

    const config = statusMap[status as keyof typeof statusMap] || { variant: 'outline', label: status, icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap = {
      'low': { variant: 'outline', label: 'Low' },
      'normal': { variant: 'secondary', label: 'Normal' },
      'high': { variant: 'default', label: 'High' },
      'urgent': { variant: 'destructive', label: 'Urgent' }
    } as const;

    const config = urgencyMap[urgency as keyof typeof urgencyMap] || { variant: 'outline', label: urgency };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{inquiry.name}</div>
                      {inquiry.company && (
                        <div className="text-sm text-muted-foreground">
                          {inquiry.company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {inquiry.service?.title || 'General Inquiry'}
                      </div>
                      {inquiry.project_title && (
                        <div className="text-sm text-muted-foreground">
                          {inquiry.project_title}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="text-sm flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {inquiry.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {inquiry.budget_range || 'Not specified'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(inquiry.status)}
                  </TableCell>
                  <TableCell>
                    {getUrgencyBadge(inquiry.urgency)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                            <DialogDescription>
                              Complete details for this service inquiry
                            </DialogDescription>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Client Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {selectedInquiry.name}</p>
                                    <p><strong>Email:</strong> {selectedInquiry.email}</p>
                                    {selectedInquiry.phone && (
                                      <p><strong>Phone:</strong> {selectedInquiry.phone}</p>
                                    )}
                                    {selectedInquiry.company && (
                                      <p><strong>Company:</strong> {selectedInquiry.company}</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Project Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Service:</strong> {selectedInquiry.service?.title || 'General Inquiry'}</p>
                                    {selectedInquiry.project_title && (
                                      <p><strong>Project:</strong> {selectedInquiry.project_title}</p>
                                    )}
                                    <p><strong>Budget:</strong> {selectedInquiry.budget_range || 'Not specified'}</p>
                                    <p><strong>Urgency:</strong> {selectedInquiry.urgency}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedInquiry.status)}</p>
                                  </div>
                                </div>
                              </div>
                              {selectedInquiry.project_description && (
                                <div>
                                  <h4 className="font-medium mb-2">Project Description</h4>
                                  <div className="p-3 bg-muted rounded-lg text-sm">
                                    {selectedInquiry.project_description}
                                  </div>
                                </div>
                              )}
                              {selectedInquiry.additional_requirements && (
                                <div>
                                  <h4 className="font-medium mb-2">Additional Requirements</h4>
                                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                                    {selectedInquiry.additional_requirements}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                <p>Received: {new Date(selectedInquiry.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            disabled={updatingInquiry === inquiry.id}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'new')}
                            disabled={inquiry.status === 'new'}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            New
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'contacted')}
                            disabled={inquiry.status === 'contacted'}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'in_discussion')}
                            disabled={inquiry.status === 'in_discussion'}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            In Discussion
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'quoted')}
                            disabled={inquiry.status === 'quoted'}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Quoted
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'won')}
                            disabled={inquiry.status === 'won'}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Won
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateInquiryStatus(inquiry.id, 'lost')}
                            disabled={inquiry.status === 'lost'}
                            className="text-red-600"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Lost
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {inquiries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No inquiries found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}