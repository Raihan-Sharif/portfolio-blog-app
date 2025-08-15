export interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  lead_magnet?: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  source?: string;
  client_ip?: string;
  user_agent?: string;
  referrer?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  subscribed_at: string;
  unsubscribed_at?: string;
  resubscribed_at?: string;
  last_email_sent_at?: string;
  email_open_count: number;
  email_click_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  html_content?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_complained: number;
  total_unsubscribed: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  subscriber_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  unsubscribed_subscribers: number;
  bounced_subscribers: number;
  new_subscribers_this_month: number;
  growth_rate: number;
}

export interface LeadMagnetStats {
  lead_magnet: string;
  subscriber_count: number;
  conversion_rate: number;
}

export interface NewsletterSubscriptionRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  leadMagnet?: string;
  source?: string;
  recaptcha_token?: string;
}