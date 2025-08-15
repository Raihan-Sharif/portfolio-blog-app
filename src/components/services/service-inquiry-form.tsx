'use client';

import { useState, useEffect } from 'react';
import { Service, ServiceInquiryFormData } from '@/types/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceInquiryFormProps {
  service: Service;
  selectedPackageId?: string | null;
}

export default function ServiceInquiryForm({ service, selectedPackageId }: ServiceInquiryFormProps): JSX.Element {
  const [formData, setFormData] = useState<ServiceInquiryFormData>({
    service_id: service.id,
    package_id: selectedPackageId || undefined,
    name: '',
    email: '',
    phone: '',
    company: '',
    project_title: '',
    project_description: '',
    budget_range: '',
    timeline: '',
    additional_requirements: '',
    preferred_contact: 'email',
    urgency: 'normal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Update form data when selectedPackageId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      package_id: selectedPackageId || undefined
    }));
  }, [selectedPackageId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.project_description.trim()) newErrors.project_description = 'Project description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/services/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitError('');
        setFormData({
          service_id: service.id,
          name: '',
          email: '',
          phone: '',
          company: '',
          project_title: '',
          project_description: '',
          budget_range: '',
          timeline: '',
          additional_requirements: '',
          preferred_contact: 'email',
          urgency: 'normal'
        });
      } else {
        console.error('Server error:', responseData);
        setSubmitStatus('error');
        setSubmitError(responseData.details || responseData.error || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ServiceInquiryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
            Inquiry Sent Successfully!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Thank you for your interest in our {service.title} service. 
            We'll get back to you within 24 hours.
          </p>
          <Button 
            onClick={() => setSubmitStatus('idle')}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
          >
            Send Another Inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Get a Quote
        </CardTitle>
        {selectedPackageId && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              Package selected - inquiry will include your package choice
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {submitStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError || 'Failed to send your inquiry. Please try again or contact us directly.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Your phone number"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
            />
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="project_title">Project Title</Label>
            <Input
              id="project_title"
              value={formData.project_title || ''}
              onChange={(e) => handleInputChange('project_title', e.target.value)}
              placeholder="Brief project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="project_description">Project Description *</Label>
            <Textarea
              id="project_description"
              value={formData.project_description}
              onChange={(e) => handleInputChange('project_description', e.target.value)}
              placeholder="Describe your project requirements in detail..."
              rows={4}
              className={errors.project_description ? 'border-red-500' : ''}
            />
            {errors.project_description && (
              <p className="text-sm text-red-500">{errors.project_description}</p>
            )}
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budget_range">Budget Range</Label>
            <Select onValueChange={(value) => handleInputChange('budget_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-5k">Under $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k-plus">$50,000+</SelectItem>
                <SelectItem value="discuss">Prefer to discuss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Select onValueChange={(value) => handleInputChange('timeline', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP</SelectItem>
                <SelectItem value="1-month">Within 1 month</SelectItem>
                <SelectItem value="2-3-months">2-3 months</SelectItem>
                <SelectItem value="3-6-months">3-6 months</SelectItem>
                <SelectItem value="6-months-plus">6+ months</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Contact */}
          <div className="space-y-2">
            <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
            <Select 
              value={formData.preferred_contact}
              onValueChange={(value: 'email' | 'phone' | 'both') => 
                handleInputChange('preferred_contact', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="both">Both Email & Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select 
              value={formData.urgency}
              onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                handleInputChange('urgency', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="additional_requirements">Additional Requirements</Label>
            <Textarea
              id="additional_requirements"
              value={formData.additional_requirements || ''}
              onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
              placeholder="Any additional requirements or questions..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg font-medium text-lg py-6 relative overflow-hidden group"
            size="lg"
          >
            <>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Your Inquiry...
                  </>
                ) : (
                  <>
                    Send Inquiry
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </>
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            We typically respond within 24 hours. 
            <br />
            For urgent inquiries, call us directly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}