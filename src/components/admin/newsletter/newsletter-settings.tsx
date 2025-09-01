// src/components/admin/newsletter/newsletter-settings.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Save, Settings as SettingsIcon } from 'lucide-react';
import { NewsletterSettings as INewsletterSettings } from '@/types/newsletter';
import { useToast } from '@/components/ui/use-toast';

interface NewsletterSettingsProps {
  onRefresh?: () => void;
}

export function NewsletterSettings({ onRefresh }: NewsletterSettingsProps): JSX.Element {
  const [settings, setSettings] = useState<INewsletterSettings>({
    enabled: true,
    from_name: '',
    from_email: '',
    reply_to_email: '',
    company_address: '',
    double_opt_in: false,
    welcome_email_enabled: true,
    welcome_email_subject: 'Welcome to our Newsletter!',
    welcome_email_content: 'Thank you for subscribing to our newsletter. We\'re excited to have you on board!',
    unsubscribe_page_content: 'We\'re sorry to see you go. You have been successfully unsubscribed from our newsletter.',
    footer_content: 'You received this email because you subscribed to our newsletter.',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();

  const fetchSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Since we don't have newsletter_settings table yet, we'll use default values
      // In a real implementation, you would create this table and fetch from it
      const defaultSettings: INewsletterSettings = {
        enabled: true,
        from_name: 'Raihan Sharif',
        from_email: 'hello@raihansharif.dev',
        reply_to_email: 'hello@raihansharif.dev',
        company_address: 'Your Company Address',
        double_opt_in: false,
        welcome_email_enabled: true,
        welcome_email_subject: 'Welcome to our Newsletter!',
        welcome_email_content: 'Thank you for subscribing to our newsletter. We\'re excited to have you on board!',
        unsubscribe_page_content: 'We\'re sorry to see you go. You have been successfully unsubscribed from our newsletter.',
        footer_content: 'You received this email because you subscribed to our newsletter.',
      };
      
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error fetching newsletter settings:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletter settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);
      
      // In a real implementation, you would save to database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Newsletter settings have been updated successfully.",
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving newsletter settings:', error);
      toast({
        title: "Error",
        description: "Failed to save newsletter settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof INewsletterSettings, value: string | boolean): void => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-24"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-40"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-64"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                <div className="h-10 bg-muted animate-pulse rounded w-full"></div>
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
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Newsletter Settings</h2>
            <p className="text-muted-foreground">Configure your newsletter preferences and behavior</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={settings.enabled ? 'success' : 'secondary'}>
            {settings.enabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic newsletter settings and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <Label className="text-base font-medium text-blue-900 dark:text-blue-100">
                  Enable Newsletter System
                </Label>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Turn newsletter functionality on or off for your site
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  placeholder="Your Name or Company"
                  value={settings.from_name}
                  onChange={(e) => handleInputChange('from_name', e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={settings.from_email}
                  onChange={(e) => handleInputChange('from_email', e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply_to_email">Reply-To Email</Label>
                <Input
                  id="reply_to_email"
                  type="email"
                  placeholder="hello@yourdomain.com"
                  value={settings.reply_to_email || ''}
                  onChange={(e) => handleInputChange('reply_to_email', e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Input
                  id="company_address"
                  placeholder="Your company address for legal compliance"
                  value={settings.company_address || ''}
                  onChange={(e) => handleInputChange('company_address', e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Subscription Settings
            </CardTitle>
            <CardDescription>
              Control how users subscribe and receive welcome emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div>
                <Label className="text-base font-medium text-orange-900 dark:text-orange-100">
                  Double Opt-In
                </Label>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Require email confirmation before subscription is active
                </p>
              </div>
              <Switch
                checked={settings.double_opt_in}
                onCheckedChange={(checked) => handleInputChange('double_opt_in', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <Label className="text-base font-medium text-green-900 dark:text-green-100">
                  Welcome Email
                </Label>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Send a welcome email to new subscribers
                </p>
              </div>
              <Switch
                checked={settings.welcome_email_enabled}
                onCheckedChange={(checked) => handleInputChange('welcome_email_enabled', checked)}
              />
            </div>

            {settings.welcome_email_enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-green-200 dark:border-green-800">
                <div className="space-y-2">
                  <Label htmlFor="welcome_email_subject">Welcome Email Subject</Label>
                  <Input
                    id="welcome_email_subject"
                    placeholder="Welcome to our Newsletter!"
                    value={settings.welcome_email_subject || ''}
                    onChange={(e) => handleInputChange('welcome_email_subject', e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_email_content">Welcome Email Content</Label>
                  <Textarea
                    id="welcome_email_content"
                    placeholder="Thank you for subscribing..."
                    value={settings.welcome_email_content || ''}
                    onChange={(e) => handleInputChange('welcome_email_content', e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50 min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-purple-500" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Customize unsubscribe pages and email footers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="unsubscribe_page_content">Unsubscribe Page Content</Label>
              <Textarea
                id="unsubscribe_page_content"
                placeholder="Message shown when users unsubscribe..."
                value={settings.unsubscribe_page_content || ''}
                onChange={(e) => handleInputChange('unsubscribe_page_content', e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_content">Email Footer Content</Label>
              <Textarea
                id="footer_content"
                placeholder="Footer text included in all emails..."
                value={settings.footer_content || ''}
                onChange={(e) => handleInputChange('footer_content', e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}