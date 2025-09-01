-- Newsletter System Migrations
-- Run these commands in your Supabase SQL editor

-- 1. Add missing columns to newsletter_campaigns table
ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS lead_magnet_file TEXT,
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) DEFAULT 'promotional' CHECK (campaign_type IN ('promotional', 'newsletter', 'announcement', 'lead_magnet')),
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(100) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS automation_trigger VARCHAR(50);

-- 2. Create lead magnets table for managing free resources
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50), -- pdf, zip, template, etc
  thumbnail_image TEXT,
  download_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  form_fields JSONB DEFAULT '[]', -- Additional fields to collect
  thank_you_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create newsletter settings table
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  from_name VARCHAR(200) NOT NULL DEFAULT 'Raihan Sharif',
  from_email VARCHAR(255) NOT NULL DEFAULT 'hello@raihansharif.dev',
  reply_to_email VARCHAR(255),
  company_address TEXT,
  double_opt_in BOOLEAN DEFAULT false,
  welcome_email_enabled BOOLEAN DEFAULT true,
  welcome_email_subject VARCHAR(300) DEFAULT 'Welcome to our Newsletter!',
  welcome_email_content TEXT DEFAULT 'Thank you for subscribing to our newsletter. We''re excited to have you on board!',
  unsubscribe_page_content TEXT DEFAULT 'We''re sorry to see you go. You have been successfully unsubscribed from our newsletter.',
  footer_content TEXT DEFAULT 'You received this email because you subscribed to our newsletter.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert default settings
INSERT INTO newsletter_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- 5. Create subscriber lead magnet tracking table
CREATE TABLE IF NOT EXISTS subscriber_lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  download_ip INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, lead_magnet_id)
);

-- 5b. Create unsubscribe feedback table
CREATE TABLE IF NOT EXISTS unsubscribe_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reason VARCHAR(100),
  feedback TEXT,
  wants_pause BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_magnets_active ON lead_magnets(is_active);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_created_at ON lead_magnets(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriber_lead_magnets_subscriber ON subscriber_lead_magnets(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lead_magnets_magnet ON subscriber_lead_magnets(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_type ON newsletter_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_featured_image ON newsletter_campaigns(featured_image) WHERE featured_image IS NOT NULL;

-- 7. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_lead_magnets_updated_at ON lead_magnets;
CREATE TRIGGER update_lead_magnets_updated_at 
  BEFORE UPDATE ON lead_magnets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_settings_updated_at ON newsletter_settings;
CREATE TRIGGER update_newsletter_settings_updated_at 
  BEFORE UPDATE ON newsletter_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable RLS on new tables
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribe_feedback ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies (drop if exist first to avoid conflicts)
-- Lead magnets policies
DROP POLICY IF EXISTS "Allow public read for active lead magnets" ON lead_magnets;
CREATE POLICY "Allow public read for active lead magnets" ON lead_magnets
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage lead magnets" ON lead_magnets;
CREATE POLICY "Allow authenticated users to manage lead magnets" ON lead_magnets
  FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter settings policies
DROP POLICY IF EXISTS "Allow public read for newsletter settings" ON newsletter_settings;
CREATE POLICY "Allow public read for newsletter settings" ON newsletter_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage newsletter settings" ON newsletter_settings;
CREATE POLICY "Allow authenticated users to manage newsletter settings" ON newsletter_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Subscriber lead magnets policies
DROP POLICY IF EXISTS "Allow users to manage their lead magnet downloads" ON subscriber_lead_magnets;
CREATE POLICY "Allow users to manage their lead magnet downloads" ON subscriber_lead_magnets
  FOR ALL USING (auth.role() = 'authenticated');

-- Unsubscribe feedback policies
DROP POLICY IF EXISTS "Allow authenticated users to manage unsubscribe feedback" ON unsubscribe_feedback;
CREATE POLICY "Allow authenticated users to manage unsubscribe feedback" ON unsubscribe_feedback
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Create helpful functions
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS get_lead_magnet_stats();

-- Then create the new function with correct signature
CREATE OR REPLACE FUNCTION get_lead_magnet_stats()
RETURNS TABLE (
  lead_magnet_id UUID,
  name VARCHAR(200),
  title VARCHAR(300),
  download_count BIGINT,
  subscriber_count BIGINT,
  conversion_rate DECIMAL
) 
LANGUAGE SQL
AS $$
  SELECT 
    lm.id,
    lm.name,
    lm.title,
    lm.download_count::BIGINT,
    COUNT(slm.id)::BIGINT as subscriber_count,
    CASE 
      WHEN COUNT(ns.id) > 0 THEN 
        ROUND((COUNT(slm.id)::DECIMAL / COUNT(ns.id)::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as conversion_rate
  FROM lead_magnets lm
  LEFT JOIN subscriber_lead_magnets slm ON lm.id = slm.lead_magnet_id
  LEFT JOIN newsletter_subscribers ns ON slm.subscriber_id = ns.id
  WHERE lm.is_active = true
  GROUP BY lm.id, lm.name, lm.title, lm.download_count
  ORDER BY subscriber_count DESC;
$$;

-- 11. Create additional needed functions

-- Function to get newsletter analytics data
CREATE OR REPLACE FUNCTION get_newsletter_analytics()
RETURNS TABLE (
  total_subscribers BIGINT,
  active_subscribers BIGINT,
  unsubscribed_subscribers BIGINT,
  bounced_subscribers BIGINT,
  new_subscribers_this_month BIGINT,
  growth_rate DECIMAL,
  average_open_rate DECIMAL,
  average_click_rate DECIMAL
) 
LANGUAGE SQL
AS $$
  WITH monthly_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active_count,
      COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
      COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
      COUNT(*) FILTER (WHERE subscribed_at >= date_trunc('month', CURRENT_DATE)) as new_this_month,
      COUNT(*) FILTER (WHERE subscribed_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                       AND subscribed_at < date_trunc('month', CURRENT_DATE)) as new_last_month
    FROM newsletter_subscribers
  ),
  campaign_stats AS (
    SELECT 
      AVG(CASE WHEN total_recipients > 0 THEN (total_opened::DECIMAL / total_recipients::DECIMAL * 100) ELSE 0 END) as avg_open_rate,
      AVG(CASE WHEN total_recipients > 0 THEN (total_clicked::DECIMAL / total_recipients::DECIMAL * 100) ELSE 0 END) as avg_click_rate
    FROM newsletter_campaigns 
    WHERE status = 'sent' AND total_recipients > 0
  )
  SELECT 
    (ms.active_count + ms.unsubscribed_count + ms.bounced_count)::BIGINT as total_subscribers,
    ms.active_count::BIGINT as active_subscribers,
    ms.unsubscribed_count::BIGINT as unsubscribed_subscribers,
    ms.bounced_count::BIGINT as bounced_subscribers,
    ms.new_this_month::BIGINT as new_subscribers_this_month,
    CASE 
      WHEN ms.new_last_month > 0 THEN 
        ROUND(((ms.new_this_month::DECIMAL - ms.new_last_month::DECIMAL) / ms.new_last_month::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as growth_rate,
    COALESCE(ROUND(cs.avg_open_rate, 2), 0::DECIMAL) as average_open_rate,
    COALESCE(ROUND(cs.avg_click_rate, 2), 0::DECIMAL) as average_click_rate
  FROM monthly_stats ms
  CROSS JOIN campaign_stats cs;
$$;

-- Function to get campaign performance data
CREATE OR REPLACE FUNCTION get_campaign_performance()
RETURNS TABLE (
  campaign_id UUID,
  campaign_name VARCHAR(200),
  campaign_type VARCHAR(50),
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  open_rate DECIMAL,
  click_rate DECIMAL
) 
LANGUAGE SQL
AS $$
  SELECT 
    id,
    name,
    campaign_type,
    sent_at,
    total_recipients,
    total_opened,
    total_clicked,
    CASE 
      WHEN total_recipients > 0 THEN 
        ROUND((total_opened::DECIMAL / total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as open_rate,
    CASE 
      WHEN total_recipients > 0 THEN 
        ROUND((total_clicked::DECIMAL / total_recipients::DECIMAL * 100), 2)
      ELSE 0::DECIMAL
    END as click_rate
  FROM newsletter_campaigns 
  WHERE status = 'sent' 
  ORDER BY sent_at DESC 
  LIMIT 10;
$$;

-- Function to get subscriber growth data (last 30 days)
CREATE OR REPLACE FUNCTION get_subscriber_growth_data()
RETURNS TABLE (
  date_bucket DATE,
  new_subscribers BIGINT,
  unsubscribed BIGINT,
  net_growth BIGINT,
  total_active BIGINT
) 
LANGUAGE SQL
AS $$
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date_bucket
  ),
  daily_new AS (
    SELECT 
      DATE(subscribed_at) as date_bucket,
      COUNT(*) as new_subscribers
    FROM newsletter_subscribers 
    WHERE subscribed_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(subscribed_at)
  ),
  daily_unsubscribed AS (
    SELECT 
      DATE(unsubscribed_at) as date_bucket,
      COUNT(*) as unsubscribed
    FROM newsletter_subscribers 
    WHERE unsubscribed_at >= CURRENT_DATE - INTERVAL '29 days'
      AND status = 'unsubscribed'
    GROUP BY DATE(unsubscribed_at)
  )
  SELECT 
    ds.date_bucket,
    COALESCE(dn.new_subscribers, 0)::BIGINT as new_subscribers,
    COALESCE(du.unsubscribed, 0)::BIGINT as unsubscribed,
    (COALESCE(dn.new_subscribers, 0) - COALESCE(du.unsubscribed, 0))::BIGINT as net_growth,
    (SELECT COUNT(*)::BIGINT FROM newsletter_subscribers WHERE status = 'active') as total_active
  FROM date_series ds
  LEFT JOIN daily_new dn ON ds.date_bucket = dn.date_bucket
  LEFT JOIN daily_unsubscribed du ON ds.date_bucket = du.date_bucket
  ORDER BY ds.date_bucket;
$$;

-- Function to get subscription sources data
CREATE OR REPLACE FUNCTION get_subscription_sources()
RETURNS TABLE (
  source VARCHAR(50),
  subscriber_count BIGINT,
  percentage DECIMAL
) 
LANGUAGE SQL
AS $$
  WITH source_counts AS (
    SELECT 
      COALESCE(source, 'Direct') as source,
      COUNT(*) as count
    FROM newsletter_subscribers 
    WHERE status = 'active'
    GROUP BY COALESCE(source, 'Direct')
  ),
  total_count AS (
    SELECT SUM(count) as total FROM source_counts
  )
  SELECT 
    sc.source,
    sc.count::BIGINT as subscriber_count,
    ROUND((sc.count::DECIMAL / tc.total::DECIMAL * 100), 2) as percentage
  FROM source_counts sc
  CROSS JOIN total_count tc
  ORDER BY sc.count DESC;
$$;

-- Function to track lead magnet download
CREATE OR REPLACE FUNCTION track_lead_magnet_download(
  p_subscriber_id UUID,
  p_lead_magnet_id UUID,
  p_download_ip INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert download tracking record
  INSERT INTO subscriber_lead_magnets (subscriber_id, lead_magnet_id, download_ip)
  VALUES (p_subscriber_id, p_lead_magnet_id, p_download_ip)
  ON CONFLICT (subscriber_id, lead_magnet_id) 
  DO UPDATE SET downloaded_at = NOW();
  
  -- Increment download count in lead_magnets table
  UPDATE lead_magnets 
  SET download_count = download_count + 1
  WHERE id = p_lead_magnet_id;
END;
$$;

-- Function to get monthly newsletter campaign template data
CREATE OR REPLACE FUNCTION get_monthly_campaign_data()
RETURNS TABLE (
  suggested_subject VARCHAR(300),
  suggested_content TEXT,
  subscriber_count BIGINT,
  last_campaign_date TIMESTAMPTZ
) 
LANGUAGE SQL
AS $$
  SELECT 
    ('Monthly Update - ' || to_char(CURRENT_DATE, 'Month YYYY'))::VARCHAR(300) as suggested_subject,
    'Here are the latest updates and insights from this month...'::TEXT as suggested_content,
    COUNT(*)::BIGINT as subscriber_count,
    MAX(sent_at) as last_campaign_date
  FROM newsletter_subscribers ns
  CROSS JOIN (
    SELECT sent_at 
    FROM newsletter_campaigns 
    WHERE campaign_type = 'newsletter' 
      AND status = 'sent' 
    ORDER BY sent_at DESC 
    LIMIT 1
  ) lc
  WHERE ns.status = 'active';
$$;

-- Function to increment download count safely
CREATE OR REPLACE FUNCTION increment_download_count(lead_magnet_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE lead_magnets 
  SET 
    download_count = download_count + 1,
    updated_at = NOW()
  WHERE id = lead_magnet_id;
END;
$$;

-- 12. Grant permissions for all functions
GRANT EXECUTE ON FUNCTION get_lead_magnet_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_newsletter_analytics() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_campaign_performance() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_subscriber_growth_data() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_subscription_sources() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION track_lead_magnet_download(UUID, UUID, INET) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_monthly_campaign_data() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated, anon;