-- Complete Newsletter & Lead Magnet System Migration
-- Run these commands in your Supabase SQL editor
-- Version 2.0 - Production Ready

-- ==================================================
-- STEP 1: CORE NEWSLETTER TABLES
-- ==================================================

-- 1.0 Update newsletter_settings table with new columns (for existing installations)
ALTER TABLE newsletter_settings 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS company_website VARCHAR(255),
ADD COLUMN IF NOT EXISTS double_opt_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS send_welcome_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS welcome_email_delay INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS welcome_template_id UUID,
ADD COLUMN IF NOT EXISTS unsubscribe_page_title VARCHAR(300) DEFAULT 'Unsubscribe',
ADD COLUMN IF NOT EXISTS unsubscribe_page_content TEXT DEFAULT 'We''re sorry to see you go. You have been successfully unsubscribed from our newsletter.',
ADD COLUMN IF NOT EXISTS footer_content TEXT DEFAULT 'You received this email because you subscribed to our newsletter.',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tracking_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS smtp_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{}';

-- 1.1 Update newsletter_subscribers table with new columns (without foreign key constraint for now)
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS lead_magnet_id UUID,
ADD COLUMN IF NOT EXISTS preferred_frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS lifetime_value DECIMAL(10,2) DEFAULT 0;

-- Add constraints to newsletter_subscribers table (separate from column additions)
DO $$ 
BEGIN
    -- Add CHECK constraint for preferred_frequency if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'newsletter_subscribers_preferred_frequency_check'
    ) THEN
        ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_preferred_frequency_check 
        CHECK (preferred_frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly'));
    END IF;
END $$;

-- 1.2 Add missing columns to newsletter_campaigns table
ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS lead_magnet_file TEXT,
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) DEFAULT 'newsletter',
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(100) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS automation_trigger VARCHAR(50),
ADD COLUMN IF NOT EXISTS send_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS parent_campaign_id UUID,
ADD COLUMN IF NOT EXISTS ab_test_variant VARCHAR(10),
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_send_time INTERVAL,
ADD COLUMN IF NOT EXISTS deliverability_score DECIMAL(5,2);

-- Add constraints to newsletter_campaigns table (separate from column additions)
DO $$ 
BEGIN
    -- Add CHECK constraint for campaign_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'newsletter_campaigns_campaign_type_check'
    ) THEN
        ALTER TABLE newsletter_campaigns ADD CONSTRAINT newsletter_campaigns_campaign_type_check 
        CHECK (campaign_type IN ('newsletter', 'promotional', 'announcement', 'lead_magnet', 'automation', 'broadcast'));
    END IF;
    
    -- Add CHECK constraint for ab_test_variant if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'newsletter_campaigns_ab_test_variant_check'
    ) THEN
        ALTER TABLE newsletter_campaigns ADD CONSTRAINT newsletter_campaigns_ab_test_variant_check 
        CHECK (ab_test_variant IN ('A', 'B'));
    END IF;
    
    -- Add foreign key constraint for parent_campaign_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'newsletter_campaigns_parent_campaign_id_fkey'
    ) THEN
        ALTER TABLE newsletter_campaigns ADD CONSTRAINT newsletter_campaigns_parent_campaign_id_fkey 
        FOREIGN KEY (parent_campaign_id) REFERENCES newsletter_campaigns(id);
    END IF;
END $$;

-- ==================================================
-- STEP 2: LEAD MAGNET SYSTEM
-- ==================================================

-- 2.1 Update existing lead_magnets table with new columns (for existing installations)
ALTER TABLE lead_magnets 
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS gate_type VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(300),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS social_image TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraints to existing table (separate from column additions)
DO $$ 
BEGIN
    -- Add CHECK constraint for file_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'lead_magnets_file_type_check'
    ) THEN
        ALTER TABLE lead_magnets ADD CONSTRAINT lead_magnets_file_type_check 
        CHECK (file_type IN ('pdf', 'zip', 'docx', 'template', 'video', 'audio', 'image', 'other'));
    END IF;
    
    -- Add CHECK constraint for gate_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'lead_magnets_gate_type_check'
    ) THEN
        ALTER TABLE lead_magnets ADD CONSTRAINT lead_magnets_gate_type_check 
        CHECK (gate_type IN ('email', 'phone', 'both', 'none'));
    END IF;
    
    -- Add CHECK constraint for access_level if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'lead_magnets_access_level_check'
    ) THEN
        ALTER TABLE lead_magnets ADD CONSTRAINT lead_magnets_access_level_check 
        CHECK (access_level IN ('public', 'subscribers', 'premium'));
    END IF;
END $$;

-- 2.1.1 Create lead magnets table (for new installations)
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  file_url TEXT,
  file_type VARCHAR(50) CHECK (file_type IN ('pdf', 'zip', 'docx', 'template', 'video', 'audio', 'image', 'other')),
  file_size INTEGER, -- in bytes
  thumbnail_image TEXT,
  cover_image TEXT,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  category VARCHAR(100),
  tags TEXT[],
  form_fields JSONB DEFAULT '[]',
  thank_you_message TEXT,
  redirect_url TEXT,
  gate_type VARCHAR(20) DEFAULT 'email' CHECK (gate_type IN ('email', 'form', 'survey', 'quiz')),
  expiry_date TIMESTAMPTZ,
  access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'subscriber', 'premium')),
  seo_title VARCHAR(300),
  seo_description TEXT,
  social_image TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1.1 Add foreign key constraint for newsletter_subscribers.lead_magnet_id
ALTER TABLE newsletter_subscribers 
ADD CONSTRAINT fk_newsletter_subscribers_lead_magnet_id 
FOREIGN KEY (lead_magnet_id) REFERENCES lead_magnets(id);

-- 2.2 Create lead magnet categories
CREATE TABLE IF NOT EXISTS lead_magnet_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Update existing subscriber_lead_magnets table with new columns
ALTER TABLE subscriber_lead_magnets 
ADD COLUMN IF NOT EXISTS download_user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}';

-- 2.3.1 Create subscriber lead magnet tracking table (for new installations)
CREATE TABLE IF NOT EXISTS subscriber_lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  download_ip INET,
  download_user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, lead_magnet_id)
);

-- ==================================================
-- STEP 3: EMAIL TEMPLATES & AUTOMATION
-- ==================================================

-- 3.1 Create email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) DEFAULT 'campaign' CHECK (template_type IN ('campaign', 'welcome', 'confirmation', 'automation', 'transactional')),
  subject VARCHAR(300),
  preheader TEXT,
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '[]', -- Available template variables
  thumbnail TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Create automation workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('subscription', 'lead_magnet', 'engagement', 'date', 'behavior', 'tag_added', 'tag_removed')),
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  entry_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Create automation steps
CREATE TABLE IF NOT EXISTS automation_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('email', 'wait', 'condition', 'tag', 'webhook', 'update_field')),
  name VARCHAR(200),
  config JSONB DEFAULT '{}',
  template_id UUID REFERENCES email_templates(id),
  delay_amount INTEGER DEFAULT 0,
  delay_unit VARCHAR(10) DEFAULT 'days' CHECK (delay_unit IN ('minutes', 'hours', 'days', 'weeks')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, step_order)
);

-- 3.4 Create automation subscribers (tracking who's in which automation)
CREATE TABLE IF NOT EXISTS automation_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  current_step_id UUID REFERENCES automation_steps(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'exited')),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  next_action_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, subscriber_id)
);

-- ==================================================
-- STEP 4: ADVANCED CAMPAIGN FEATURES  
-- ==================================================

-- 4.1 Create campaign segments for targeted sending
CREATE TABLE IF NOT EXISTS campaign_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '[]',
  subscriber_count INTEGER DEFAULT 0,
  is_dynamic BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Create A/B test campaigns
CREATE TABLE IF NOT EXISTS campaign_ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_a_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  campaign_b_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  test_name VARCHAR(200),
  test_type VARCHAR(50) CHECK (test_type IN ('subject', 'content', 'send_time', 'from_name')),
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split BETWEEN 1 AND 99),
  winner_metric VARCHAR(50) DEFAULT 'open_rate' CHECK (winner_metric IN ('open_rate', 'click_rate', 'conversion_rate')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  winner_id UUID,
  confidence_level DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- STEP 5: NEWSLETTER SETTINGS & CONFIGURATION
-- ==================================================

-- 5.1 Create comprehensive newsletter settings
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  from_name VARCHAR(200) NOT NULL DEFAULT 'Raihan Sharif',
  from_email VARCHAR(255) NOT NULL DEFAULT 'hello@raihansharif.dev',
  reply_to_email VARCHAR(255),
  company_name VARCHAR(200),
  company_address TEXT,
  company_phone VARCHAR(50),
  company_website VARCHAR(255),
  
  -- Email preferences
  double_opt_in BOOLEAN DEFAULT false,
  send_welcome_email BOOLEAN DEFAULT true,
  welcome_email_delay INTEGER DEFAULT 0, -- minutes
  welcome_template_id UUID,
  
  -- Content defaults
  unsubscribe_page_title VARCHAR(300) DEFAULT 'Unsubscribe',
  unsubscribe_page_content TEXT DEFAULT 'We''re sorry to see you go. You have been successfully unsubscribed from our newsletter.',
  footer_content TEXT DEFAULT 'You received this email because you subscribed to our newsletter.',
  
  -- Sending settings
  daily_send_limit INTEGER DEFAULT 1000,
  hourly_send_limit INTEGER DEFAULT 100,
  preferred_send_timezone VARCHAR(50) DEFAULT 'UTC',
  bounce_threshold DECIMAL(5,2) DEFAULT 5.0,
  complaint_threshold DECIMAL(5,2) DEFAULT 0.5,
  
  -- Social & branding
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  
  -- GDPR & compliance
  privacy_policy_url VARCHAR(500),
  terms_url VARCHAR(500),
  gdpr_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Insert default settings
INSERT INTO newsletter_settings (
  id, 
  from_name, 
  from_email
) VALUES (
  gen_random_uuid(),
  'Raihan Sharif',
  'hello@raihansharif.dev'
) ON CONFLICT DO NOTHING;

-- ==================================================
-- STEP 6: ANALYTICS & TRACKING
-- ==================================================

-- 6.1 Create detailed email events tracking
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  click_url TEXT,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 Create unsubscribe feedback
CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reason VARCHAR(100),
  feedback TEXT,
  wants_pause BOOLEAN DEFAULT false,
  alternative_frequency VARCHAR(20),
  campaign_id UUID REFERENCES newsletter_campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3 Create lead magnet analytics
CREATE TABLE IF NOT EXISTS lead_magnet_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_magnet_id, date)
);

-- ==================================================
-- STEP 7: INDEXES FOR PERFORMANCE
-- ==================================================

-- Newsletter subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_lead_magnet_id ON newsletter_subscribers(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON newsletter_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_engagement ON newsletter_subscribers(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_activity ON newsletter_subscribers(last_activity_at DESC);

-- Lead magnets indexes
CREATE INDEX IF NOT EXISTS idx_lead_magnets_active ON lead_magnets(is_active);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_featured ON lead_magnets(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_category ON lead_magnets(category);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_created_at ON lead_magnets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_download_count ON lead_magnets(download_count DESC);

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_type ON newsletter_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);

-- Tracking indexes
CREATE INDEX IF NOT EXISTS idx_subscriber_lead_magnets_subscriber ON subscriber_lead_magnets(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lead_magnets_magnet ON subscriber_lead_magnets(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lead_magnets_downloaded_at ON subscriber_lead_magnets(downloaded_at DESC);

-- Email events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_subscriber ON email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at DESC);

-- Automation indexes
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON automation_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_subscribers_workflow ON automation_subscribers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_subscribers_status ON automation_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_automation_subscribers_next_action ON automation_subscribers(next_action_at) WHERE status = 'active';

-- ==================================================
-- STEP 7.5: ADD REMAINING FOREIGN KEY CONSTRAINTS
-- ==================================================

-- Add foreign key constraint for newsletter_settings.welcome_template_id (after email_templates is created)
ALTER TABLE newsletter_settings 
ADD CONSTRAINT fk_newsletter_settings_welcome_template_id 
FOREIGN KEY (welcome_template_id) REFERENCES email_templates(id);

-- ==================================================
-- STEP 8: TRIGGERS & FUNCTIONS
-- ==================================================

-- 8.1 Update updated_at columns trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all relevant tables
DROP TRIGGER IF EXISTS update_lead_magnets_updated_at ON lead_magnets;
CREATE TRIGGER update_lead_magnets_updated_at 
  BEFORE UPDATE ON lead_magnets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_settings_updated_at ON newsletter_settings;
CREATE TRIGGER update_newsletter_settings_updated_at 
  BEFORE UPDATE ON newsletter_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automation_workflows_updated_at ON automation_workflows;
CREATE TRIGGER update_automation_workflows_updated_at 
  BEFORE UPDATE ON automation_workflows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_segments_updated_at ON campaign_segments;
CREATE TRIGGER update_campaign_segments_updated_at 
  BEFORE UPDATE ON campaign_segments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_magnet_categories_updated_at ON lead_magnet_categories;
CREATE TRIGGER update_lead_magnet_categories_updated_at 
  BEFORE UPDATE ON lead_magnet_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8.2 Function to update subscriber engagement score
CREATE OR REPLACE FUNCTION update_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update engagement score based on email activity
    UPDATE newsletter_subscribers 
    SET 
        engagement_score = LEAST(100, GREATEST(0, 
            -- Base score (50) + activity bonuses - penalties
            50 + 
            (email_open_count * 2) + 
            (email_click_count * 5) - 
            (EXTRACT(DAYS FROM (NOW() - COALESCE(last_activity_at, subscribed_at))) / 7)
        )),
        last_activity_at = CASE 
            WHEN NEW.event_type IN ('opened', 'clicked') THEN NOW()
            ELSE last_activity_at
        END
    WHERE id = NEW.subscriber_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply engagement trigger
DROP TRIGGER IF EXISTS update_subscriber_engagement ON email_events;
CREATE TRIGGER update_subscriber_engagement
    AFTER INSERT ON email_events
    FOR EACH ROW
    EXECUTE FUNCTION update_engagement_score();

-- ==================================================
-- STEP 9: ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribe_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_analytics ENABLE ROW LEVEL SECURITY;

-- Lead magnets policies
DROP POLICY IF EXISTS "Allow public read for active lead magnets" ON lead_magnets;
CREATE POLICY "Allow public read for active lead magnets" ON lead_magnets
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage lead magnets" ON lead_magnets;
CREATE POLICY "Allow authenticated users to manage lead magnets" ON lead_magnets
  FOR ALL USING (auth.role() = 'authenticated');

-- Categories policies
DROP POLICY IF EXISTS "Allow public read for active categories" ON lead_magnet_categories;
CREATE POLICY "Allow public read for active categories" ON lead_magnet_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON lead_magnet_categories;
CREATE POLICY "Allow authenticated users to manage categories" ON lead_magnet_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter settings policies
DROP POLICY IF EXISTS "Allow public read for newsletter settings" ON newsletter_settings;
CREATE POLICY "Allow public read for newsletter settings" ON newsletter_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage newsletter settings" ON newsletter_settings;
CREATE POLICY "Allow authenticated users to manage newsletter settings" ON newsletter_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Subscriber tracking policies
DROP POLICY IF EXISTS "Allow service role to manage subscriber tracking" ON subscriber_lead_magnets;
CREATE POLICY "Allow service role to manage subscriber tracking" ON subscriber_lead_magnets
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Email templates policies
DROP POLICY IF EXISTS "Allow authenticated users to manage email templates" ON email_templates;
CREATE POLICY "Allow authenticated users to manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Automation policies
DROP POLICY IF EXISTS "Allow authenticated users to manage automations" ON automation_workflows;
CREATE POLICY "Allow authenticated users to manage automations" ON automation_workflows
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage automation steps" ON automation_steps;
CREATE POLICY "Allow authenticated users to manage automation steps" ON automation_steps
  FOR ALL USING (auth.role() = 'authenticated');

-- Events policies (for analytics)
DROP POLICY IF EXISTS "Allow service role to manage email events" ON email_events;
CREATE POLICY "Allow service role to manage email events" ON email_events
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Continue in next part...

-- ==================================================
-- STEP 10: UTILITY FUNCTIONS
-- ==================================================

-- Function to get comprehensive lead magnet stats
DROP FUNCTION IF EXISTS get_lead_magnet_stats();
CREATE OR REPLACE FUNCTION get_lead_magnet_stats()
RETURNS TABLE (
  lead_magnet_id UUID,
  name VARCHAR(200),
  title VARCHAR(300),
  category VARCHAR(100),
  total_views BIGINT,
  total_downloads BIGINT,
  total_conversions BIGINT,
  conversion_rate DECIMAL,
  avg_time_to_convert INTERVAL,
  bounce_rate DECIMAL,
  top_referrer TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
AS $$
  SELECT 
    lm.id,
    lm.name,
    lm.title,
    lm.category,
    lm.view_count::BIGINT,
    lm.download_count::BIGINT,
    COUNT(slm.id)::BIGINT as total_conversions,
    CASE 
      WHEN lm.view_count > 0 THEN 
        ROUND((lm.download_count::DECIMAL / lm.view_count::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as conversion_rate,
    AVG(slm.downloaded_at - ns.subscribed_at) as avg_time_to_convert,
    CASE 
      WHEN lm.view_count > 0 THEN 
        ROUND((1 - (lm.download_count::DECIMAL / lm.view_count::DECIMAL)) * 100, 2)
      ELSE 0::DECIMAL
    END as bounce_rate,
    (
      SELECT slm2.referrer 
      FROM subscriber_lead_magnets slm2 
      WHERE slm2.lead_magnet_id = lm.id 
        AND slm2.referrer IS NOT NULL
      GROUP BY slm2.referrer 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as top_referrer,
    lm.created_at
  FROM lead_magnets lm
  LEFT JOIN subscriber_lead_magnets slm ON lm.id = slm.lead_magnet_id
  LEFT JOIN newsletter_subscribers ns ON slm.subscriber_id = ns.id
  WHERE lm.is_active = true
  GROUP BY lm.id, lm.name, lm.title, lm.category, lm.view_count, lm.download_count, lm.created_at
  ORDER BY total_conversions DESC;
$$;

-- Function to get newsletter dashboard analytics
CREATE OR REPLACE FUNCTION get_newsletter_dashboard_stats()
RETURNS TABLE (
  total_subscribers BIGINT,
  active_subscribers BIGINT,
  new_subscribers_today BIGINT,
  new_subscribers_week BIGINT,
  new_subscribers_month BIGINT,
  unsubscribed_this_month BIGINT,
  total_campaigns BIGINT,
  campaigns_this_month BIGINT,
  avg_open_rate DECIMAL,
  avg_click_rate DECIMAL,
  avg_engagement_score DECIMAL,
  top_performing_campaign_id UUID,
  bounce_rate DECIMAL
) 
LANGUAGE SQL
AS $$
  WITH subscriber_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE DATE(subscribed_at) = CURRENT_DATE) as today,
      COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '7 days') as week,
      COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days') as month,
      COUNT(*) FILTER (WHERE status = 'unsubscribed' AND unsubscribed_at >= CURRENT_DATE - INTERVAL '30 days') as unsub_month,
      AVG(engagement_score) as avg_engagement
    FROM newsletter_subscribers
  ),
  campaign_stats AS (
    SELECT 
      COUNT(*) as total_campaigns,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as campaigns_month,
      AVG(CASE WHEN total_recipients > 0 THEN (total_opened::DECIMAL / total_recipients::DECIMAL * 100) ELSE 0 END) as avg_open_rate,
      AVG(CASE WHEN total_recipients > 0 THEN (total_clicked::DECIMAL / total_recipients::DECIMAL * 100) ELSE 0 END) as avg_click_rate,
      (
        SELECT id FROM newsletter_campaigns 
        WHERE status = 'sent' AND total_recipients > 0
        ORDER BY (total_opened::DECIMAL / total_recipients::DECIMAL) DESC 
        LIMIT 1
      ) as top_campaign_id,
      AVG(CASE WHEN total_recipients > 0 THEN (total_bounced::DECIMAL / total_recipients::DECIMAL * 100) ELSE 0 END) as bounce_rate
    FROM newsletter_campaigns 
    WHERE status = 'sent'
  )
  SELECT 
    ss.total::BIGINT,
    ss.active::BIGINT,
    ss.today::BIGINT,
    ss.week::BIGINT,
    ss.month::BIGINT,
    ss.unsub_month::BIGINT,
    cs.total_campaigns::BIGINT,
    cs.campaigns_month::BIGINT,
    ROUND(cs.avg_open_rate, 2),
    ROUND(cs.avg_click_rate, 2),
    ROUND(ss.avg_engagement, 2),
    cs.top_campaign_id,
    ROUND(cs.bounce_rate, 2)
  FROM subscriber_stats ss
  CROSS JOIN campaign_stats cs;
$$;

-- Function to get subscriber growth data with detailed metrics
CREATE OR REPLACE FUNCTION get_subscriber_growth_detailed(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date_bucket DATE,
  new_subscribers BIGINT,
  unsubscribed BIGINT,
  resubscribed BIGINT,
  net_growth BIGINT,
  cumulative_total BIGINT,
  growth_rate DECIMAL,
  churn_rate DECIMAL
) 
LANGUAGE SQL
AS $$
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date_bucket
  ),
  daily_new AS (
    SELECT 
      DATE(subscribed_at) as date_bucket,
      COUNT(*) as new_subscribers
    FROM newsletter_subscribers 
    WHERE subscribed_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    GROUP BY DATE(subscribed_at)
  ),
  daily_unsubscribed AS (
    SELECT 
      DATE(unsubscribed_at) as date_bucket,
      COUNT(*) as unsubscribed
    FROM newsletter_subscribers 
    WHERE unsubscribed_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    GROUP BY DATE(unsubscribed_at)
  ),
  daily_resubscribed AS (
    SELECT 
      DATE(resubscribed_at) as date_bucket,
      COUNT(*) as resubscribed
    FROM newsletter_subscribers 
    WHERE resubscribed_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    GROUP BY DATE(resubscribed_at)
  )
  SELECT 
    ds.date_bucket,
    COALESCE(dn.new_subscribers, 0)::BIGINT,
    COALESCE(du.unsubscribed, 0)::BIGINT,
    COALESCE(dr.resubscribed, 0)::BIGINT,
    (COALESCE(dn.new_subscribers, 0) + COALESCE(dr.resubscribed, 0) - COALESCE(du.unsubscribed, 0))::BIGINT as net_growth,
    (
      SELECT COUNT(*)::BIGINT 
      FROM newsletter_subscribers 
      WHERE DATE(subscribed_at) <= ds.date_bucket 
        AND (unsubscribed_at IS NULL OR DATE(unsubscribed_at) > ds.date_bucket)
    ) as cumulative_total,
    CASE 
      WHEN LAG(COALESCE(dn.new_subscribers, 0)) OVER (ORDER BY ds.date_bucket) > 0 THEN
        ROUND(
          ((COALESCE(dn.new_subscribers, 0)::DECIMAL - LAG(COALESCE(dn.new_subscribers, 0)) OVER (ORDER BY ds.date_bucket)) / 
           LAG(COALESCE(dn.new_subscribers, 0)) OVER (ORDER BY ds.date_bucket) * 100), 2
        )
      ELSE 0::DECIMAL
    END as growth_rate,
    CASE 
      WHEN COALESCE(dn.new_subscribers, 0) > 0 THEN
        ROUND((COALESCE(du.unsubscribed, 0)::DECIMAL / COALESCE(dn.new_subscribers, 0)::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as churn_rate
  FROM date_series ds
  LEFT JOIN daily_new dn ON ds.date_bucket = dn.date_bucket
  LEFT JOIN daily_unsubscribed du ON ds.date_bucket = du.date_bucket
  LEFT JOIN daily_resubscribed dr ON ds.date_bucket = dr.date_bucket
  ORDER BY ds.date_bucket;
$$;

-- Function to track lead magnet download with full analytics
CREATE OR REPLACE FUNCTION track_lead_magnet_download(
  p_subscriber_id UUID,
  p_lead_magnet_id UUID,
  p_download_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_form_data JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert/update download tracking record
  INSERT INTO subscriber_lead_magnets (
    subscriber_id, 
    lead_magnet_id, 
    download_ip, 
    download_user_agent,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    form_data
  )
  VALUES (
    p_subscriber_id, 
    p_lead_magnet_id, 
    p_download_ip, 
    p_user_agent,
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_form_data
  )
  ON CONFLICT (subscriber_id, lead_magnet_id) 
  DO UPDATE SET 
    downloaded_at = NOW(),
    download_ip = COALESCE(EXCLUDED.download_ip, subscriber_lead_magnets.download_ip),
    download_user_agent = COALESCE(EXCLUDED.download_user_agent, subscriber_lead_magnets.download_user_agent),
    referrer = COALESCE(EXCLUDED.referrer, subscriber_lead_magnets.referrer),
    utm_source = COALESCE(EXCLUDED.utm_source, subscriber_lead_magnets.utm_source),
    utm_medium = COALESCE(EXCLUDED.utm_medium, subscriber_lead_magnets.utm_medium),
    utm_campaign = COALESCE(EXCLUDED.utm_campaign, subscriber_lead_magnets.utm_campaign),
    form_data = EXCLUDED.form_data;
  
  -- Increment download count in lead_magnets table
  UPDATE lead_magnets 
  SET 
    download_count = download_count + 1,
    updated_at = NOW()
  WHERE id = p_lead_magnet_id;
  
  -- Update daily analytics
  INSERT INTO lead_magnet_analytics (lead_magnet_id, date, downloads, conversions)
  VALUES (p_lead_magnet_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (lead_magnet_id, date)
  DO UPDATE SET 
    downloads = lead_magnet_analytics.downloads + 1,
    conversions = lead_magnet_analytics.conversions + 1;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_lead_magnet_views(p_lead_magnet_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE lead_magnets 
  SET 
    view_count = view_count + 1,
    updated_at = NOW()
  WHERE id = p_lead_magnet_id;
  
  -- Update daily analytics
  INSERT INTO lead_magnet_analytics (lead_magnet_id, date, views)
  VALUES (p_lead_magnet_id, CURRENT_DATE, 1)
  ON CONFLICT (lead_magnet_id, date)
  DO UPDATE SET views = lead_magnet_analytics.views + 1;
END;
$$;

-- Function to get campaign performance with advanced metrics
CREATE OR REPLACE FUNCTION get_campaign_performance_advanced()
RETURNS TABLE (
  campaign_id UUID,
  campaign_name VARCHAR(200),
  campaign_type VARCHAR(50),
  status VARCHAR(20),
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  total_bounced INTEGER,
  total_unsubscribed INTEGER,
  open_rate DECIMAL,
  click_rate DECIMAL,
  bounce_rate DECIMAL,
  unsubscribe_rate DECIMAL,
  revenue_per_email DECIMAL,
  roi DECIMAL
) 
LANGUAGE SQL
AS $$
  SELECT 
    nc.id,
    nc.name,
    nc.campaign_type,
    nc.status,
    nc.sent_at,
    nc.total_recipients,
    nc.total_opened,
    nc.total_clicked,
    nc.total_bounced,
    nc.total_unsubscribed,
    CASE 
      WHEN nc.total_recipients > 0 THEN 
        ROUND((nc.total_opened::DECIMAL / nc.total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as open_rate,
    CASE 
      WHEN nc.total_recipients > 0 THEN 
        ROUND((nc.total_clicked::DECIMAL / nc.total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as click_rate,
    CASE 
      WHEN nc.total_recipients > 0 THEN 
        ROUND((nc.total_bounced::DECIMAL / nc.total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as bounce_rate,
    CASE 
      WHEN nc.total_recipients > 0 THEN 
        ROUND((nc.total_unsubscribed::DECIMAL / nc.total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as unsubscribe_rate,
    0::DECIMAL as revenue_per_email, -- Placeholder for future revenue tracking
    0::DECIMAL as roi -- Placeholder for ROI calculation
  FROM newsletter_campaigns nc
  WHERE nc.status = 'sent' 
  ORDER BY nc.sent_at DESC 
  LIMIT 50;
$$;

-- ==================================================
-- STEP 11: GRANT PERMISSIONS
-- ==================================================

-- Grant permissions for all functions
GRANT EXECUTE ON FUNCTION get_lead_magnet_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_newsletter_dashboard_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_subscriber_growth_detailed(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION track_lead_magnet_download(UUID, UUID, INET, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION increment_lead_magnet_views(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_campaign_performance_advanced() TO authenticated, anon;

-- Grant table permissions
GRANT SELECT ON lead_magnets TO anon;
GRANT ALL ON lead_magnets TO authenticated;
GRANT SELECT ON lead_magnet_categories TO anon;
GRANT ALL ON lead_magnet_categories TO authenticated;
GRANT SELECT ON newsletter_settings TO anon;
GRANT ALL ON newsletter_settings TO authenticated;
GRANT ALL ON subscriber_lead_magnets TO authenticated, service_role;
GRANT ALL ON email_events TO authenticated, service_role;
GRANT ALL ON unsubscribe_feedback TO authenticated, service_role;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON automation_workflows TO authenticated;
GRANT ALL ON automation_steps TO authenticated;
GRANT ALL ON automation_subscribers TO authenticated, service_role;
GRANT ALL ON campaign_segments TO authenticated;
GRANT ALL ON campaign_ab_tests TO authenticated;
GRANT SELECT ON lead_magnet_analytics TO authenticated, anon;
GRANT ALL ON lead_magnet_analytics TO service_role;

-- ==================================================
-- STEP 12: INSERT SAMPLE DATA (OPTIONAL)
-- ==================================================

-- Insert sample lead magnet categories
INSERT INTO lead_magnet_categories (name, slug, description, icon, color, sort_order) VALUES
('E-books', 'ebooks', 'Comprehensive guides and books', '📚', '#3B82F6', 1),
('Templates', 'templates', 'Ready-to-use templates and designs', '📄', '#10B981', 2),
('Checklists', 'checklists', 'Step-by-step checklists', '✅', '#F59E0B', 3),
('Courses', 'courses', 'Mini courses and tutorials', '🎓', '#8B5CF6', 4),
('Tools', 'tools', 'Useful tools and resources', '🛠️', '#EF4444', 5),
('Videos', 'videos', 'Video content and tutorials', '🎥', '#EC4899', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample email templates
INSERT INTO email_templates (name, description, template_type, subject, html_content) VALUES
(
  'Welcome Email',
  'Default welcome email for new subscribers',
  'welcome',
  'Welcome to {{company_name}}! 🚀',
  '<h1>Welcome {{first_name}}!</h1><p>Thank you for subscribing to our newsletter. We''re excited to have you on board!</p>'
),
(
  'Lead Magnet Delivery',
  'Email template for delivering lead magnets',
  'automation',
  'Your free {{lead_magnet_name}} is ready! 📚',
  '<h1>Here''s your {{lead_magnet_name}}</h1><p>Thank you for your interest! <a href="{{download_url}}">Download your free resource here</a>.</p>'
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Newsletter & Lead Magnet System Migration Complete!';
  RAISE NOTICE '📊 Created % tables with full analytics support', 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%newsletter%' OR table_name LIKE '%lead%' OR table_name LIKE '%automation%' OR table_name LIKE '%campaign%' OR table_name LIKE '%email%');
  RAISE NOTICE '🔧 Added % custom functions for advanced features', 
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE 'get_%' OR routine_name LIKE 'track_%' OR routine_name LIKE 'increment_%');
  RAISE NOTICE '🚀 Your newsletter system is now production-ready!';
END $$;