Database Setup

Here's the SQL to create the database schema on Supabase:

## Newsletter & Lead Generation Tables

```sql
-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  lead_magnet VARCHAR(100), -- Track which lead magnet they subscribed for
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  source VARCHAR(50) DEFAULT 'website', -- website, popup, form, etc.
  client_ip INET,
  user_agent TEXT,
  referrer TEXT,
  tags TEXT[], -- Array of tags for segmentation
  custom_fields JSONB, -- Additional custom data
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  resubscribed_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  email_open_count INTEGER DEFAULT 0,
  email_click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Campaigns Table
CREATE TABLE newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  content TEXT,
  html_content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients Tracking Table
CREATE TABLE newsletter_campaign_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, subscriber_id)
);

-- Create indexes for newsletter tables
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);
CREATE INDEX idx_newsletter_subscribers_lead_magnet ON newsletter_subscribers(lead_magnet);
CREATE INDEX idx_newsletter_subscribers_source ON newsletter_subscribers(source);

CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);
CREATE INDEX idx_newsletter_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at);

CREATE INDEX idx_campaign_recipients_campaign_id ON newsletter_campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_subscriber_id ON newsletter_campaign_recipients(subscriber_id);
CREATE INDEX idx_campaign_recipients_status ON newsletter_campaign_recipients(status);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for newsletter tables
CREATE TRIGGER update_newsletter_subscribers_updated_at 
  BEFORE UPDATE ON newsletter_subscribers 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at 
  BEFORE UPDATE ON newsletter_campaigns 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_campaign_recipients_updated_at 
  BEFORE UPDATE ON newsletter_campaign_recipients 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Row Level Security) policies for newsletter tables
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers policies
CREATE POLICY "Allow public to insert newsletter subscribers" ON newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to read newsletter subscribers" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to update newsletter subscribers" ON newsletter_subscribers
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to delete newsletter subscribers" ON newsletter_subscribers
  FOR DELETE TO authenticated
  USING (true);

-- Newsletter campaigns policies
CREATE POLICY "Allow authenticated to manage campaigns" ON newsletter_campaigns
  FOR ALL TO authenticated
  USING (true);

-- Campaign recipients policies
CREATE POLICY "Allow authenticated to manage campaign recipients" ON newsletter_campaign_recipients
  FOR ALL TO authenticated
  USING (true);

-- Newsletter analytics functions
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE (
  total_subscribers INTEGER,
  active_subscribers INTEGER,
  unsubscribed_subscribers INTEGER,
  bounced_subscribers INTEGER,
  new_subscribers_this_month INTEGER,
  growth_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_subscribers,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_subscribers,
    COUNT(*) FILTER (WHERE status = 'unsubscribed')::INTEGER as unsubscribed_subscribers,
    COUNT(*) FILTER (WHERE status = 'bounced')::INTEGER as bounced_subscribers,
    COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', NOW()))::INTEGER as new_subscribers_this_month,
    CASE 
      WHEN COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND subscribed_at < DATE_TRUNC('month', NOW())) > 0
      THEN ((COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', NOW()))::DECIMAL / 
             COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND subscribed_at < DATE_TRUNC('month', NOW()))::DECIMAL - 1) * 100)
      ELSE 0
    END as growth_rate
  FROM newsletter_subscribers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_lead_magnet_stats()
RETURNS TABLE (
  lead_magnet VARCHAR(100),
  subscriber_count INTEGER,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ns.lead_magnet, 'Unknown') as lead_magnet,
    COUNT(*)::INTEGER as subscriber_count,
    (COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM newsletter_subscribers)::DECIMAL * 100) as conversion_rate
  FROM newsletter_subscribers ns
  WHERE ns.status = 'active'
  GROUP BY ns.lead_magnet
  ORDER BY subscriber_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unsubscribe_newsletter(subscriber_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE newsletter_subscribers 
  SET 
    status = 'unsubscribed',
    unsubscribed_at = NOW()
  WHERE email = subscriber_email AND status = 'active';
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for newsletter functions
GRANT EXECUTE ON FUNCTION get_newsletter_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_lead_magnet_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_newsletter(VARCHAR) TO anon, authenticated;
```

## Core Application Tables

```sql
-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content JSONB,
  image_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  featured_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 100),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES profiles(id),
  category_id INTEGER REFERENCES categories(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE post_tags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

CREATE TABLE theme_settings (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE social_links (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'resolved')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  recaptcha_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post views tracking
CREATE TABLE post_views (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  view_date DATE DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, view_date)
);

-- Project views tracking  
CREATE TABLE project_views (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  view_date DATE DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, view_date)
);

-- Enhanced online users tracking
CREATE TABLE online_users (
  id SERIAL PRIMARY KEY,
  
  -- User identification
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for anonymous users
  session_id TEXT NOT NULL, -- Browser-generated session ID
  ip_address INET, -- User's IP address for anonymous tracking
  browser_fingerprint TEXT, -- Browser fingerprint for better anonymous identification
  
  -- Activity tracking
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT,
  user_agent TEXT,
  
  -- User information (for display)
  display_name TEXT, -- Cached user name for performance
  is_authenticated BOOLEAN DEFAULT false,
  
  -- Session metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints with proper syntax
CREATE UNIQUE INDEX unique_authenticated_user ON online_users(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX unique_anonymous_session ON online_users(session_id, ip_address) WHERE user_id IS NULL;

-- Insert initial roles
INSERT INTO roles (name) VALUES ('admin');
INSERT INTO roles (name) VALUES ('editor');
INSERT INTO roles (name) VALUES ('viewer');

-- Insert default theme
INSERT INTO theme_settings (
  name,
  primary_color,
  secondary_color,
  accent_color,
  text_color,
  background_color,
  is_default
) VALUES (
  'Default',
  '#0f172a',
  '#64748b',
  '#3b82f6',
  '#0f172a',
  '#ffffff',
  true
);
```

### Set up Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Public read, admin write
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT USING (true);

CREATE POLICY "Admin can manage projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Skills: Public read, admin write
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT USING (true);

CREATE POLICY "Admin can manage skills"
  ON skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Posts: Published are public, admin/editor can manage
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT USING (published = true);

CREATE POLICY "Editors and admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'editor')
    )
  );

CREATE POLICY "Editors and admins can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'editor')
    )
  );

CREATE POLICY "Editors and admins can update posts"
  ON posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'editor')
    )
  );

CREATE POLICY "Editors and admins can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'editor')
    )
  );

-- Categories, Tags: Public read, admin write
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT USING (true);

CREATE POLICY "Admin can manage tags"
  ON tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Theme settings: Public read, admin write
CREATE POLICY "Theme settings are viewable by everyone"
  ON theme_settings FOR SELECT USING (true);

CREATE POLICY "Admin can manage theme settings"
  ON theme_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Social links: Public read, admin write
CREATE POLICY "Social links are viewable by everyone"
  ON social_links FOR SELECT USING (true);

CREATE POLICY "Admin can manage social links"
  ON social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

### Create a Function to Handle New User Registration

```sql
-- This function automatically creates a profile and assigns the default viewer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id INTEGER;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', null);

  -- Get the default viewer role ID
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'viewer';

  -- Assign the default viewer role
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, default_role_id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call this function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


```

-- Function to get user role by user ID
CREATE OR REPLACE FUNCTION get_user_with_role(p_user_id UUID)
RETURNS TABLE (
id UUID,
full_name TEXT,
avatar_url TEXT,
bio TEXT,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ,
role_id INTEGER,
role_name TEXT
) AS $$
BEGIN
RETURN QUERY
SELECT
p.id,
p.full_name,
p.avatar_url,
p.bio,
p.created_at,
p.updated_at,
ur.role_id,
r.name AS role_name
FROM
profiles p
INNER JOIN user_roles ur ON p.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id
WHERE
p.id = p_user_id ;
END;

$$
LANGUAGE plpgsql;

-- Test the function
-- SELECT * FROM get_user_with_role('2b1a7dd6-f4b5-4b70-a5b3-545371800242');

--DROP FUNCTION get_user_with_role(uuid)
$$

```
-- create post tags manage permission policy create
create policy "Admin can manage post tags" on "public"."post_tags" to public

using (

  (EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text))))

);

```

-- Enable read access for all users

```
create policy "Enable read access for all users"

on "public"."roles" to public

using (
  true
);

```

-- SQL to create new tables for view tracking in Supabase

-- Create a table to track post views with timestamped entries
CREATE TABLE IF NOT EXISTS post_views (
id SERIAL PRIMARY KEY,
post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
view_date DATE NOT NULL DEFAULT CURRENT_DATE,
view_count INTEGER NOT NULL DEFAULT 1,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (post_id, view_date)
);

-- Create a function to get post views per day for the last N days
CREATE OR REPLACE FUNCTION get_post_views_by_day(post_id_param INTEGER, days_count INTEGER)
RETURNS TABLE (
view_date DATE,
count INTEGER
) AS

$$

BEGIN
RETURN QUERY
WITH days AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1)::interval,
CURRENT_DATE,
'1 day'::interval
)::date AS day
)
SELECT
days.day AS view_date,
COALESCE(pv.view_count, 0) AS count
FROM days
LEFT JOIN post_views pv ON pv.view_date = days.day AND pv.post_id = post_id_param
ORDER BY days.day;
END;


$$

LANGUAGE plpgsql;

-- Create a function to get total views per day across all posts
CREATE OR REPLACE FUNCTION get_total_views_by_day(days_count INTEGER)
RETURNS TABLE (
view_date DATE,
count INTEGER
) AS

$$

BEGIN
RETURN QUERY
WITH days AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1)::interval,
CURRENT_DATE,
'1 day'::interval
)::date AS day
)
SELECT
days.day AS view_date,
COALESCE(SUM(pv.view_count), 0) AS count
FROM days
LEFT JOIN post_views pv ON pv.view_date = days.day
GROUP BY days.day
ORDER BY days.day;
END;


$$

LANGUAGE plpgsql;

$$

-- Create a function to safely update user roles
-- This function handles the delete/insert atomically to prevent conflicts

CREATE OR REPLACE FUNCTION update_user_role(p_user_id UUID, p_new_role_id INTEGER)
RETURNS BOOLEAN AS
$$

DECLARE
existing_role_id INTEGER;
BEGIN
-- Get the current role ID for the user
SELECT role_id INTO existing_role_id
FROM user_roles
WHERE user_id = p_user_id;

    -- If user already has the requested role, do nothing
    IF existing_role_id = p_new_role_id THEN
        RETURN TRUE;
    END IF;

    -- Delete existing role assignment
    DELETE FROM user_roles WHERE user_id = p_user_id;

    -- Insert new role assignment
    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, p_new_role_id);

    RETURN TRUE;

EXCEPTION
WHEN OTHERS THEN
-- If something goes wrong, try to restore the previous role
IF existing_role_id IS NOT NULL THEN
INSERT INTO user_roles (user_id, role_id)
VALUES (p_user_id, existing_role_id)
ON CONFLICT (user_id, role_id) DO NOTHING;
END IF;

        -- Re-raise the exception
        RAISE;

END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_role(UUID, INTEGER) TO authenticated;

-- Create an alternative function that uses UPSERT for simpler role management
CREATE OR REPLACE FUNCTION upsert_user_role(p_user_id UUID, p_role_id INTEGER)
RETURNS BOOLEAN AS
$$

BEGIN
-- Delete any existing roles for this user
DELETE FROM user_roles WHERE user_id = p_user_id;

    -- Insert the new role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id);

    RETURN TRUE;

EXCEPTION
WHEN OTHERS THEN
RETURN FALSE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_user_role(UUID, INTEGER) TO authenticated;
$$

-- Add this to your DBSCHEMA.md file

-- Contact Messages Table
CREATE TABLE contact_messages (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT NOT NULL,
phone TEXT, -- Optional phone number with country code
subject TEXT NOT NULL,
message TEXT NOT NULL,
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'in_progress', 'resolved')),
priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
resolved_at TIMESTAMP WITH TIME ZONE,
resolved_by UUID REFERENCES profiles(id),
notes TEXT
);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Admin can view and manage all contact messages
CREATE POLICY "Admin can manage contact messages"
ON contact_messages FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Function to update contact message status
CREATE OR REPLACE FUNCTION update_contact_message_status(
p_message_id INTEGER,
p_status TEXT,
p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
current_user_id UUID;
BEGIN
-- Get current user
current_user_id := auth.uid();

-- Update the message
UPDATE contact_messages
SET
status = p_status,
updated_at = NOW(),
resolved_at = CASE WHEN p_status = 'resolved' THEN NOW() ELSE resolved_at END,
resolved_by = CASE WHEN p_status = 'resolved' THEN current_user_id ELSE resolved_by END,
notes = COALESCE(p_notes, notes)
WHERE id = p_message_id;

RETURN FOUND;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_contact_message_status(INTEGER, TEXT, TEXT) TO authenticated;

-- Function to safely delete a user and handle cascades
CREATE OR REPLACE FUNCTION delete_user_safely(p_user_id UUID)
RETURNS BOOLEAN AS
$$

BEGIN
-- First, check if the current user is an admin
IF NOT EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
) THEN
RAISE EXCEPTION 'Only admins can delete users';
END IF;

-- Prevent admin from deleting themselves
IF p_user_id = auth.uid() THEN
RAISE EXCEPTION 'Cannot delete your own account';
END IF;

-- Update posts to set author to null or reassign to current admin
UPDATE posts
SET author_id = auth.uid()
WHERE author_id = p_user_id;

-- Update contact messages resolved_by if they resolved any
UPDATE contact_messages
SET resolved_by = NULL
WHERE resolved_by = p_user_id;

-- Delete user roles (will cascade)
DELETE FROM user_roles WHERE user_id = p_user_id;

-- Delete profile
DELETE FROM profiles WHERE id = p_user_id;

-- Note: The auth.users deletion should be handled via Supabase admin API
-- This function only handles the application data

RETURN TRUE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_safely(UUID) TO authenticated;
$$

---

-- Add this to your DBSCHEMA.md file

-- Hero Settings Table
CREATE TABLE hero_settings (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
subtitle TEXT,
description TEXT,
hero_image_url TEXT,
background_svg_url TEXT,
cta_primary_text TEXT DEFAULT 'View My Work',
cta_primary_url TEXT DEFAULT '/projects',
cta_secondary_text TEXT DEFAULT 'Contact Me',
cta_secondary_url TEXT DEFAULT '/contact',
highlight_words JSONB, -- For highlighting specific words in title/subtitle
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero content
INSERT INTO hero_settings (
title,
subtitle,
description,
cta_primary_text,
cta_primary_url,
cta_secondary_text,
cta_secondary_url,
highlight_words,
is_active
) VALUES (
'Hi, I''m Raihan Sharif',
'Full Stack Developer',
'With over 6 years of experience, I specialize in building modern web applications using .NET, ASP.NET, React, Next.js, JavaScript, SQL Server, and DevOps. I focus on creating robust, scalable solutions with exceptional user experiences.',
'View My Work',
'/projects',
'Contact Me',
'/contact',
'["Raihan Sharif"]'::jsonb,
true
);

-- Enable RLS
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

-- Public can read active hero settings
CREATE POLICY "Hero settings are viewable by everyone"
ON hero_settings FOR SELECT
USING (is_active = true);

-- Admin can manage hero settings
CREATE POLICY "Admin can manage hero settings"
ON hero_settings FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Function to get active hero settings
CREATE OR REPLACE FUNCTION get_active_hero_settings()
RETURNS TABLE (
id INTEGER,
title TEXT,
subtitle TEXT,
description TEXT,
hero_image_url TEXT,
background_svg_url TEXT,
cta_primary_text TEXT,
cta_primary_url TEXT,
cta_secondary_text TEXT,
cta_secondary_url TEXT,
highlight_words JSONB
) AS $$
BEGIN
RETURN QUERY
SELECT
h.id,
h.title,
h.subtitle,
h.description,
h.hero_image_url,
h.background_svg_url,
h.cta_primary_text,
h.cta_primary_url,
h.cta_secondary_text,
h.cta_secondary_url,
h.highlight_words
FROM hero_settings h
WHERE h.is_active = true
ORDER BY h.updated_at DESC
LIMIT 1;
END;

$$
LANGUAGE plpgsql;

------
$$

-- Contact Information Table
CREATE TABLE contact_info (
id SERIAL PRIMARY KEY,
type TEXT NOT NULL, -- 'email', 'phone', 'address', 'social', 'website'
label TEXT NOT NULL, -- 'Email', 'Phone', 'WhatsApp', 'Office Address', etc.
value TEXT NOT NULL, -- actual value
icon TEXT, -- lucide icon name
is_primary BOOLEAN DEFAULT FALSE,
is_whatsapp BOOLEAN DEFAULT FALSE, -- for phone numbers
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Hours Table
CREATE TABLE business_hours (
id SERIAL PRIMARY KEY,
day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
day_name TEXT NOT NULL,
is_open BOOLEAN DEFAULT TRUE,
open_time TIME,
close_time TIME,
timezone TEXT DEFAULT 'GMT+6',
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability Status Table
CREATE TABLE availability_status (
id SERIAL PRIMARY KEY,
status TEXT NOT NULL, -- 'available', 'busy', 'unavailable'
title TEXT NOT NULL,
description TEXT,
response_time TEXT, -- '24 hours', 'Same day', etc.
is_current BOOLEAN DEFAULT FALSE,
color_class TEXT DEFAULT 'bg-green-500', -- for status indicator
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;

-- Public can read contact info
CREATE POLICY "Contact info is viewable by everyone"
ON contact_info FOR SELECT USING (is_active = true);

CREATE POLICY "Business hours are viewable by everyone"
ON business_hours FOR SELECT USING (is_active = true);

CREATE POLICY "Availability status is viewable by everyone"
ON availability_status FOR SELECT USING (is_active = true);

-- Admin can manage all
CREATE POLICY "Admin can manage contact info"
ON contact_info FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage business hours"
ON business_hours FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage availability status"
ON availability_status FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Insert initial data
INSERT INTO contact_info (type, label, value, icon, is_primary, is_whatsapp, display_order) VALUES
('email', 'Email', 'raihan.raju@gmail.com', 'Mail', true, false, 1),
('phone', 'Phone', '+8801722102046', 'Phone', true, false, 2),
('phone', 'WhatsApp', '+8801722102046', 'MessageCircle', false, true, 3),
('address', 'Location', 'Dhaka, Bangladesh', 'MapPin', false, false, 4);

INSERT INTO business_hours (day_of_week, day_name, is_open, open_time, close_time) VALUES
(1, 'Monday', true, '09:00', '18:00'),
(2, 'Tuesday', true, '09:00', '18:00'),
(3, 'Wednesday', true, '09:00', '18:00'),
(4, 'Thursday', true, '09:00', '18:00'),
(5, 'Friday', true, '09:00', '18:00'),
(6, 'Saturday', true, '10:00', '16:00'),
(0, 'Sunday', false, null, null);

INSERT INTO availability_status (status, title, description, response_time, is_current, color_class) VALUES
('available', 'Available for Projects', 'Currently accepting new freelance projects and collaborations.', 'Within 24 hours', true, 'bg-green-500'),
('busy', 'Partially Available', 'Currently working on projects but open to discuss new opportunities.', 'Within 48 hours', false, 'bg-yellow-500'),
('unavailable', 'Fully Booked', 'Not accepting new projects at the moment.', 'Will respond when available', false, 'bg-red-500');

-- Note: phone and recaptcha_token columns are now included in the contact_messages table definition above

---

-- Add these tables to your existing DBSCHEMA.md file

-- About Settings Table
CREATE TABLE about_settings (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL DEFAULT 'About Me',
subtitle TEXT,
description TEXT,
profile_image_url TEXT,
resume_url TEXT,
years_experience INTEGER,
location TEXT,
email TEXT,
phone TEXT,
website TEXT,
linkedin_url TEXT,
github_url TEXT,
skills_summary TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience Table  
CREATE TABLE experience (
id SERIAL PRIMARY KEY,
company TEXT NOT NULL,
position TEXT NOT NULL,
location TEXT,
start_date DATE NOT NULL,
end_date DATE,
is_current BOOLEAN DEFAULT false,
description TEXT,
technologies JSONB,
company_logo_url TEXT,
company_url TEXT,
employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Table
CREATE TABLE education (
id SERIAL PRIMARY KEY,
institution TEXT NOT NULL,
degree TEXT NOT NULL,
field_of_study TEXT,
start_date DATE NOT NULL,
end_date DATE,
is_current BOOLEAN DEFAULT false,
description TEXT,
grade_gpa TEXT,
institution_logo_url TEXT,
institution_url TEXT,
degree_type TEXT CHECK (degree_type IN ('bachelor', 'master', 'phd', 'diploma', 'certificate', 'other')),
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE courses (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
provider TEXT NOT NULL,
description TEXT,
completion_date DATE,
certificate_url TEXT,
course_url TEXT,
duration TEXT,
skills_learned JSONB,
instructor TEXT,
platform TEXT,
rating INTEGER CHECK (rating BETWEEN 1 AND 5),
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshops Table
CREATE TABLE workshops (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
organizer TEXT NOT NULL,
description TEXT,
event_date DATE,
location TEXT,
event_type TEXT CHECK (event_type IN ('attended', 'conducted', 'participated', 'organized')),
certificate_url TEXT,
event_url TEXT,
skills_gained JSONB,
duration TEXT,
attendees_count INTEGER,
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE achievements (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
description TEXT,
achievement_date DATE,
organization TEXT,
certificate_url TEXT,
achievement_url TEXT,
achievement_type TEXT CHECK (achievement_type IN ('award', 'certification', 'recognition', 'publication', 'other')),
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications Table
CREATE TABLE certifications (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
issuing_organization TEXT NOT NULL,
description TEXT,
issue_date DATE,
expiry_date DATE,
is_permanent BOOLEAN DEFAULT false, -- true if certification doesn't expire
credential_id TEXT,
credential_url TEXT,
certificate_url TEXT,
skills_covered JSONB, -- Array of skills/technologies covered
verification_url TEXT, -- Direct link to verify the certification
badge_image_url TEXT, -- Badge or logo of the certification
category TEXT CHECK (category IN ('technical', 'professional', 'industry', 'language', 'safety', 'other')) DEFAULT 'technical',
level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert', 'professional')),
score TEXT, -- Score or grade achieved
total_score TEXT, -- Total possible score or grade scale
hours_completed INTEGER, -- Hours of training completed
display_order INTEGER DEFAULT 0,
is_featured BOOLEAN DEFAULT false,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- About settings: Public read, admin write
CREATE POLICY "About settings are viewable by everyone"
ON about_settings FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage about settings"
ON about_settings FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Experience: Public read active entries, admin write
CREATE POLICY "Active experience are viewable by everyone"
ON experience FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage experience"
ON experience FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Education: Public read active entries, admin write
CREATE POLICY "Active education are viewable by everyone"
ON education FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage education"
ON education FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Courses: Public read active entries, admin write
CREATE POLICY "Active courses are viewable by everyone"
ON courses FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage courses"
ON courses FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Workshops: Public read active entries, admin write
CREATE POLICY "Active workshops are viewable by everyone"
ON workshops FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage workshops"
ON workshops FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Achievements: Public read active entries, admin write
CREATE POLICY "Active achievements are viewable by everyone"
ON achievements FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage achievements"
ON achievements FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Certifications: Public read active entries, admin write
CREATE POLICY "Active certifications are viewable by everyone"
ON certifications FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage certifications"
ON certifications FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

Create policy "Enable insert for authenticated users only"
on "public"."courses"
to authenticated
with check (
true
);
-- Insert default about settings
INSERT INTO about_settings (
title,
subtitle,
description,
years_experience,
location,
is_active
) VALUES (
'About Me',
'Full Stack Developer',
'Passionate developer with expertise in modern web technologies.',
6,
'Chittagong, Bangladesh',
true
);

---

-- Enhanced Projects Database Schema
-- Add this to your DBSCHEMA.md file

-- Project Categories Table
CREATE TABLE project_categories (
id SERIAL PRIMARY KEY,
name TEXT UNIQUE NOT NULL,
slug TEXT UNIQUE NOT NULL,
description TEXT,
icon TEXT,
color TEXT DEFAULT '#3b82f6',
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies Table
CREATE TABLE technologies (
id SERIAL PRIMARY KEY,
name TEXT UNIQUE NOT NULL,
slug TEXT UNIQUE NOT NULL,
description TEXT,
icon TEXT,
color TEXT DEFAULT '#3b82f6',
category TEXT, -- 'frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'other'
official_url TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Projects Table
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE projects (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
subtitle TEXT,
description TEXT,
content JSONB,

-- Media
featured_image_url TEXT,
hero_image_url TEXT,
gallery_images JSONB, -- Array of image objects with URLs, captions, alt text
video_url TEXT,
demo_video_url TEXT,

-- Links
github_url TEXT,
demo_url TEXT,
case_study_url TEXT,
documentation_url TEXT,
api_docs_url TEXT,

-- Project Details
category_id INTEGER REFERENCES project_categories(id),
project_type TEXT CHECK (project_type IN ('web-app', 'mobile-app', 'desktop-app', 'api', 'website', 'e-commerce', 'saas', 'game', 'other')),
status TEXT CHECK (status IN ('planning', 'in-progress', 'completed', 'maintenance', 'archived')) DEFAULT 'completed',

-- Timeline
start_date DATE,
end_date DATE,
duration_months INTEGER,

-- Team & Client
client_name TEXT,
client_url TEXT,
team_size INTEGER,
my_role TEXT,

-- Technical Details
platform TEXT, -- 'web', 'mobile', 'desktop', 'cross-platform'
target_audience TEXT,
key_features JSONB, -- Array of feature objects
challenges_faced JSONB, -- Array of challenge objects
solutions_implemented JSONB, -- Array of solution objects

-- Results & Metrics
results_achieved JSONB, -- Performance metrics, user growth, etc.
user_feedback JSONB, -- Testimonials, ratings, reviews

-- Development Info
development_methodology TEXT, -- 'agile', 'waterfall', 'scrum', 'kanban'
version_control TEXT DEFAULT 'git',
deployment_platform TEXT,
hosting_provider TEXT,

-- SEO & Visibility
featured BOOLEAN DEFAULT false,
priority INTEGER DEFAULT 0,
display_order INTEGER DEFAULT 0,
is_public BOOLEAN DEFAULT true,
is_active BOOLEAN DEFAULT true,

-- Metadata
view_count INTEGER DEFAULT 0,
like_count INTEGER DEFAULT 0,
share_count INTEGER DEFAULT 0,

created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Technologies Junction Table
CREATE TABLE project_technologies (
id SERIAL PRIMARY KEY,
project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
category TEXT, -- 'frontend', 'backend', 'database', 'devops', 'design', 'other'
proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
is_primary BOOLEAN DEFAULT false,
display_order INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(project_id, technology_id)
);

-- Project Views Tracking
CREATE TABLE project_views (
id SERIAL PRIMARY KEY,
project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
view_date DATE NOT NULL DEFAULT CURRENT_DATE,
view_count INTEGER NOT NULL DEFAULT 1,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE (project_id, view_date)
);

-- Enable RLS
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access for active items
CREATE POLICY "Active project categories are viewable by everyone"
ON project_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Active technologies are viewable by everyone"
ON technologies FOR SELECT USING (is_active = true);

CREATE POLICY "Public projects are viewable by everyone"
ON projects FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Project technologies are viewable by everyone"
ON project_technologies FOR SELECT USING (
EXISTS (
SELECT 1 FROM projects p
WHERE p.id = project_id AND p.is_public = true AND p.is_active = true
)
);

-- Admin write access
CREATE POLICY "Admin can manage project categories"
ON project_categories FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage technologies"
ON technologies FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage projects"
ON projects FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage project technologies"
ON project_technologies FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Insert Sample Data
INSERT INTO project_categories (name, slug, description, icon, color, display_order) VALUES
('Web Applications', 'web-applications', 'Full-stack web applications and platforms', 'Globe', '#3b82f6', 1),
('Mobile Apps', 'mobile-apps', 'iOS and Android mobile applications', 'Smartphone', '#10b981', 2),
('E-commerce', 'e-commerce', 'Online stores and marketplace solutions', 'ShoppingCart', '#f59e0b', 3),
('SaaS Platforms', 'saas-platforms', 'Software as a Service solutions', 'Cloud', '#8b5cf6', 4),
('APIs & Backend', 'apis-backend', 'RESTful APIs and backend services', 'Server', '#ef4444', 5),
('Dashboard & Analytics', 'dashboard-analytics', 'Admin dashboards and data visualization', 'BarChart3', '#06b6d4', 6);

INSERT INTO technologies (name, slug, description, icon, category, official_url, color) VALUES
-- Frontend
('React', 'react', 'A JavaScript library for building user interfaces', 'Code2', 'frontend', 'https://reactjs.org', '#61dafb'),
('Next.js', 'nextjs', 'The React framework for production', 'Globe', 'frontend', 'https://nextjs.org', '#000000'),
('TypeScript', 'typescript', 'Typed JavaScript at scale', 'FileCode', 'frontend', 'https://typescriptlang.org', '#3178c6'),
('Tailwind CSS', 'tailwind-css', 'A utility-first CSS framework', 'Palette', 'frontend', 'https://tailwindcss.com', '#06b6d4'),
('JavaScript', 'javascript', 'The programming language of the web', 'FileCode', 'frontend', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', '#f7df1e'),

-- Backend
('.NET Core', 'dotnet-core', 'Cross-platform .NET framework', 'Server', 'backend', 'https://dotnet.microsoft.com', '#512bd4'),
('ASP.NET', 'aspnet', 'Web framework for .NET', 'Server', 'backend', 'https://dotnet.microsoft.com/en-us/apps/aspnet', '#512bd4'),
('Node.js', 'nodejs', 'JavaScript runtime for server-side development', 'Server', 'backend', 'https://nodejs.org', '#339933'),
('Express.js', 'expressjs', 'Web framework for Node.js', 'Server', 'backend', 'https://expressjs.com', '#000000'),

-- Database
('SQL Server', 'sql-server', 'Microsoft SQL Server database', 'Database', 'database', 'https://www.microsoft.com/en-us/sql-server', '#cc2927'),
('PostgreSQL', 'postgresql', 'Advanced open source database', 'Database', 'database', 'https://postgresql.org', '#336791'),
('Supabase', 'supabase', 'Open source Firebase alternative', 'Database', 'database', 'https://supabase.com', '#3ecf8e'),
('MongoDB', 'mongodb', 'NoSQL document database', 'Database', 'database', 'https://mongodb.com', '#47a248'),

-- DevOps
('Docker', 'docker', 'Containerization platform', 'Boxes', 'devops', 'https://docker.com', '#2496ed'),
('Azure DevOps', 'azure-devops', 'Microsoft DevOps platform', 'Settings', 'devops', 'https://dev.azure.com', '#0078d4'),
('GitHub Actions', 'github-actions', 'CI/CD platform by GitHub', 'GitBranch', 'devops', 'https://github.com/features/actions', '#2088ff'),
('Vercel', 'vercel', 'Deployment platform for frontend frameworks', 'Cloud', 'devops', 'https://vercel.com', '#000000'),

-- Tools
('Git', 'git', 'Distributed version control system', 'GitBranch', 'devops', 'https://git-scm.com', '#f05032'),
('GitHub', 'github', 'Git repository hosting service', 'Github', 'devops', 'https://github.com', '#181717'),
('Figma', 'figma', 'Collaborative design tool', 'Palette', 'design', 'https://figma.com', '#f24e1e'),
('Postman', 'postman', 'API development platform', 'Network', 'devops', 'https://postman.com', '#ff6c37');

-- Functions
CREATE OR REPLACE FUNCTION increment_project_view(project_id_param INTEGER)
RETURNS VOID AS $$
BEGIN

$$

-- Project Awards Table
CREATE TABLE project_awards (
id SERIAL PRIMARY KEY,
project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
title TEXT NOT NULL,
description TEXT,
award_image_url TEXT,
awarded_by TEXT,
award_date DATE,
award_url TEXT,
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_awards
ALTER TABLE project_awards ENABLE ROW LEVEL SECURITY;

-- Public can read active awards for public projects
CREATE POLICY "Active project awards are viewable by everyone"
ON project_awards FOR SELECT
USING (
is_active = true AND EXISTS (
SELECT 1 FROM projects p
WHERE p.id = project_id AND p.is_public = true AND p.is_active = true
)
);

-- Admin can manage project awards
CREATE POLICY "Admin can manage project awards"
ON project_awards FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Update the get_project_with_details function to include awards
CREATE OR REPLACE FUNCTION get_project_with_details(project_slug TEXT)
RETURNS TABLE (
id INTEGER,
title TEXT,
slug TEXT,
subtitle TEXT,
description TEXT,
content JSONB,
featured_image_url TEXT,
hero_image_url TEXT,
gallery_images JSONB,
video_url TEXT,
demo_video_url TEXT,
github_url TEXT,
demo_url TEXT,
case_study_url TEXT,
documentation_url TEXT,
api_docs_url TEXT,
category_name TEXT,
category_slug TEXT,
category_color TEXT,
project_type TEXT,
status TEXT,
start_date DATE,
end_date DATE,
duration_months INTEGER,
client_name TEXT,
client_url TEXT,
team_size INTEGER,
my_role TEXT,
platform TEXT,
target_audience TEXT,
key_features JSONB,
challenges_faced JSONB,
solutions_implemented JSONB,
results_achieved JSONB,
user_feedback JSONB,
development_methodology TEXT,
version_control TEXT,
deployment_platform TEXT,
hosting_provider TEXT,
featured BOOLEAN,
priority INTEGER,
view_count INTEGER,
like_count INTEGER,
share_count INTEGER,
technologies JSONB,
awards JSONB,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ
) AS
$$

BEGIN
RETURN QUERY
SELECT
p.id,
p.title,
p.slug,
p.subtitle,
p.description,
p.content,
p.featured_image_url,
p.hero_image_url,
p.gallery_images,
p.video_url,
p.demo_video_url,
p.github_url,
p.demo_url,
p.case_study_url,
p.documentation_url,
p.api_docs_url,
pc.name as category_name,
pc.slug as category_slug,
pc.color as category_color,
p.project_type,
p.status,
p.start_date,
p.end_date,
p.duration_months,
p.client_name,
p.client_url,
p.team_size,
p.my_role,
p.platform,
p.target_audience,
p.key_features,
p.challenges_faced,
p.solutions_implemented,
p.results_achieved,
p.user_feedback,
p.development_methodology,
p.version_control,
p.deployment_platform,
p.hosting_provider,
p.featured,
p.priority,
p.view_count,
p.like_count,
p.share_count,
COALESCE(
(
SELECT jsonb_agg(
jsonb_build_object(
'id', t.id,
'name', t.name,
'slug', t.slug,
'icon', t.icon,
'color', t.color,
'category', t.category,
'official_url', t.official_url,
'proficiency_level', pt.proficiency_level,
'is_primary', pt.is_primary
) ORDER BY pt.is_primary DESC, pt.display_order, t.name
)
FROM project_technologies pt
JOIN technologies t ON pt.technology_id = t.id
WHERE pt.project_id = p.id AND t.is_active = true
),
'[]'::jsonb
) as technologies,
COALESCE(
(
SELECT jsonb_agg(
jsonb_build_object(
'id', pa.id,
'title', pa.title,
'description', pa.description,
'award_image_url', pa.award_image_url,
'awarded_by', pa.awarded_by,
'award_date', pa.award_date,
'award_url', pa.award_url,
'display_order', pa.display_order
) ORDER BY pa.display_order, pa.award_date DESC
)
FROM project_awards pa
WHERE pa.project_id = p.id AND pa.is_active = true
),
'[]'::jsonb
) as awards,
p.created_at,
p.updated_at
FROM projects p
LEFT JOIN project_categories pc ON p.category_id = pc.id
WHERE p.slug = project_slug
AND p.is_public = true
AND p.is_active = true;
END;

$$
LANGUAGE plpgsql;
$$

---

-- Add to your DBSCHEMA.md file
-- SQL functions for project view tracking

-- Function to increment project view count
CREATE OR REPLACE FUNCTION increment_project_view(project_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
-- First update the main projects table total view count
UPDATE projects
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = project_id_param;

-- Then, update or insert the daily view count
INSERT INTO project_views (project_id, view_date, view_count)
VALUES (project_id_param, CURRENT_DATE, 1)
ON CONFLICT (project_id, view_date)
DO UPDATE SET view_count = project_views.view_count + 1;
END;

$$
LANGUAGE plpgsql;

-- Function to get project views per day for the last N days
CREATE OR REPLACE FUNCTION get_project_views_by_day(project_id_param INTEGER, days_count INTEGER)
RETURNS TABLE (
  view_date DATE,
  count INTEGER
) AS
$$

BEGIN
RETURN QUERY
WITH days AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1)::interval,
CURRENT_DATE,
'1 day'::interval
)::date AS day
)
SELECT
days.day AS view_date,
COALESCE(pv.view_count, 0) AS count
FROM days
LEFT JOIN project_views pv ON pv.view_date = days.day AND pv.project_id = project_id_param
ORDER BY days.day;
END;

$$
LANGUAGE plpgsql;

-- Function to get total project views per day across all projects
CREATE OR REPLACE FUNCTION get_total_project_views_by_day(days_count INTEGER)
RETURNS TABLE (
  view_date DATE,
  count INTEGER
) AS
$$

BEGIN
RETURN QUERY
WITH days AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1)::interval,
CURRENT_DATE,
'1 day'::interval
)::date AS day
)
SELECT
days.day AS view_date,
COALESCE(SUM(pv.view_count), 0) AS count
FROM days
LEFT JOIN project_views pv ON pv.view_date = days.day
GROUP BY days.day
ORDER BY days.day;
END;

$$
LANGUAGE plpgsql;

-- Function to get combined views (posts + projects) per day
CREATE OR REPLACE FUNCTION get_combined_views_by_day(days_count INTEGER)
RETURNS TABLE (
  view_date DATE,
  post_views INTEGER,
  project_views INTEGER,
  total_views INTEGER
) AS
$$

BEGIN
RETURN QUERY
WITH days AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1)::interval,
CURRENT_DATE,
'1 day'::interval
)::date AS day
)
SELECT
days.day AS view_date,
COALESCE(SUM(pov.view_count), 0) AS post_views,
COALESCE(SUM(prv.view_count), 0) AS project_views,
COALESCE(SUM(pov.view_count), 0) + COALESCE(SUM(prv.view_count), 0) AS total_views
FROM days
LEFT JOIN post_views pov ON pov.view_date = days.day
LEFT JOIN project_views prv ON prv.view_date = days.day
GROUP BY days.day
ORDER BY days.day;
END;

$$
LANGUAGE plpgsql;


$$

LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_project_view(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_views_by_day(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_project_views_by_day(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_combined_views_by_day(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_summary(INTEGER) TO authenticated;

---

$$

-- Function to get user activity (basic implementation)
CREATE OR REPLACE FUNCTION get*user_activity()
RETURNS TABLE (
online_count integer,
total_users integer,
recent_activity json
) AS
$$

BEGIN
RETURN QUERY
SELECT
(SELECT COUNT(*)::integer FROM profiles WHERE created*at > NOW() - INTERVAL '1 hour') as online_count,
(SELECT COUNT(\*)::integer FROM profiles) as total_users,
(SELECT json_agg(
json_build_object(
'id', id,
'full_name', full_name,
'created_at', created_at
)
) FROM profiles ORDER BY created_at DESC LIMIT 5) as recent_activity;
END;

$$
LANGUAGE plpgsql;

-- Function to get enhanced analytics
CREATE OR REPLACE FUNCTION get_dashboard_analytics(days_count integer)
RETURNS TABLE (
  total_views integer,
  avg_daily_views numeric,
  growth_percentage numeric,
  top_content json
) AS
$$

BEGIN
RETURN QUERY
SELECT
(SELECT COALESCE(SUM(view_count), 0)::integer FROM post_views
WHERE view_date >= CURRENT_DATE - days_count) as total_views,
(SELECT ROUND(AVG(view_count), 2) FROM post_views
WHERE view_date >= CURRENT_DATE - days_count) as avg_daily_views,
15.5::numeric as growth_percentage, -- Replace with actual calculation
(SELECT json_agg(
json_build_object(
'title', title,
'views', view_count,
'type', 'post'
)
) FROM posts ORDER BY view_count DESC LIMIT 5) as top_content;
END;

$$
LANGUAGE plpgsql;
-------------
$$

-- 1. Fix the get_total_views_by_day function
CREATE OR REPLACE FUNCTION get_total_views_by_day(days_count INTEGER)
RETURNS TABLE (
view_date DATE,
count INTEGER
) AS

$$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      CURRENT_DATE - (days_count - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  )
  SELECT
    days.day AS view_date,
    COALESCE(SUM(pv.view_count), 0)::INTEGER AS count
  FROM days
  LEFT JOIN post_views pv ON pv.view_date = days.day
  GROUP BY days.day
  ORDER BY days.day;
END;
$$

LANGUAGE plpgsql;

-- 2. Fix the get_combined_views_by_day function
CREATE OR REPLACE FUNCTION get_combined_views_by_day(days_count INTEGER)
RETURNS TABLE (
view_date DATE,
post_views INTEGER,
project_views INTEGER,
total_views INTEGER
) AS

$$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      CURRENT_DATE - (days_count - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  )
  SELECT
    days.day AS view_date,
    COALESCE(SUM(pov.view_count), 0)::INTEGER AS post_views,
    COALESCE(SUM(prv.view_count), 0)::INTEGER AS project_views,
    (COALESCE(SUM(pov.view_count), 0) + COALESCE(SUM(prv.view_count), 0))::INTEGER AS total_views
  FROM days
  LEFT JOIN post_views pov ON pov.view_date = days.day
  LEFT JOIN project_views prv ON prv.view_date = days.day
  GROUP BY days.day
  ORDER BY days.day;
END;
$$

LANGUAGE plpgsql;

-- 3. Fix the get_analytics_summary function
CREATE OR REPLACE FUNCTION get_analytics_summary(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
total_posts INTEGER,
total_projects INTEGER,
total_post_views BIGINT,
total_project_views BIGINT,
avg_daily_views NUMERIC,
most_viewed_post_id INTEGER,
most_viewed_project_id INTEGER
) AS

$$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT CURRENT_DATE - (days_count - 1) * INTERVAL '1 day' AS start_date
  )
  SELECT
    (SELECT COUNT(*)::INTEGER FROM posts WHERE published = true) AS total_posts,
    (SELECT COUNT(*)::INTEGER FROM projects WHERE is_active = true AND is_public = true) AS total_projects,
    (SELECT COALESCE(SUM(view_count), 0) FROM post_views
     WHERE view_date >= (SELECT start_date FROM date_range)) AS total_post_views,
    (SELECT COALESCE(SUM(view_count), 0) FROM project_views
     WHERE view_date >= (SELECT start_date FROM date_range)) AS total_project_views,
    ROUND((
      (SELECT COALESCE(SUM(view_count), 0) FROM post_views
       WHERE view_date >= (SELECT start_date FROM date_range)) +
      (SELECT COALESCE(SUM(view_count), 0) FROM project_views
       WHERE view_date >= (SELECT start_date FROM date_range))
    )::NUMERIC / days_count, 2) AS avg_daily_views,
    (SELECT id FROM posts WHERE published = true ORDER BY view_count DESC LIMIT 1) AS most_viewed_post_id,
    (SELECT id FROM projects WHERE is_active = true AND is_public = true ORDER BY view_count DESC LIMIT 1) AS most_viewed_project_id;
END;
$$

LANGUAGE plpgsql;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_total_views_by_day(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_combined_views_by_day(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_summary(INTEGER) TO authenticated;

-- 5. Fix RLS policies for analytics functions
-- First drop existing policies if they exist
DO $$
BEGIN
IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow reading post views') THEN
DROP POLICY "Allow reading post views" ON post_views;
END IF;

IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow reading project views') THEN
DROP POLICY "Allow reading project views" ON project_views;
END IF;
END $$;

-- Create new policies without IF NOT EXISTS (for older PostgreSQL versions)
CREATE POLICY "Allow reading post views" ON post_views
FOR SELECT USING (true);

CREATE POLICY "Allow reading project views" ON project_views
FOR SELECT USING (true);

-- 6. Test the functions (run these to verify they work)

---

-- Complete Database Optimizations and Fixes
-- Run these in your Supabase SQL editor

-- 1. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_views_date ON post_views(view_date);
CREATE INDEX IF NOT EXISTS idx_project_views_date ON project_views(view_date);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active, is_public) WHERE is_active = true AND is_public = true;

-- 2. Optimized analytics summary function
CREATE OR REPLACE FUNCTION get_optimized_analytics_summary(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
total_posts INTEGER,
total_projects INTEGER,
total_post_views BIGINT,
total_project_views BIGINT,
avg_daily_views NUMERIC,
growth_rate NUMERIC
) AS

$$
DECLARE
  start_date DATE := CURRENT_DATE - (days_count - 1);
  previous_start_date DATE := CURRENT_DATE - (days_count * 2 - 1);
  previous_end_date DATE := CURRENT_DATE - days_count;
  current_views BIGINT;
  previous_views BIGINT;
BEGIN
  -- Get current period views
  SELECT COALESCE(SUM(pv.view_count), 0) + COALESCE(SUM(prv.view_count), 0)
  INTO current_views
  FROM (
    SELECT COALESCE(SUM(view_count), 0) as view_count
    FROM post_views
    WHERE view_date >= start_date
  ) pv,
  (
    SELECT COALESCE(SUM(view_count), 0) as view_count
    FROM project_views
    WHERE view_date >= start_date
  ) prv;

  -- Get previous period views for growth calculation
  SELECT COALESCE(SUM(pv.view_count), 0) + COALESCE(SUM(prv.view_count), 0)
  INTO previous_views
  FROM (
    SELECT COALESCE(SUM(view_count), 0) as view_count
    FROM post_views
    WHERE view_date >= previous_start_date AND view_date <= previous_end_date
  ) pv,
  (
    SELECT COALESCE(SUM(view_count), 0) as view_count
    FROM project_views
    WHERE view_date >= previous_start_date AND view_date <= previous_end_date
  ) prv;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM posts WHERE published = true) AS total_posts,
    (SELECT COUNT(*)::INTEGER FROM projects WHERE is_active = true AND is_public = true) AS total_projects,
    (SELECT COALESCE(SUM(view_count), 0) FROM post_views WHERE view_date >= start_date) AS total_post_views,
    (SELECT COALESCE(SUM(view_count), 0) FROM project_views WHERE view_date >= start_date) AS total_project_views,
    ROUND(current_views::NUMERIC / days_count, 2) AS avg_daily_views,
    CASE
      WHEN previous_views > 0 THEN ROUND(((current_views - previous_views)::NUMERIC / previous_views) * 100, 2)
      ELSE 0
    END AS growth_rate;
END;
$$

LANGUAGE plpgsql;

-- 3. Optimized daily views function with better date handling
CREATE OR REPLACE FUNCTION get_optimized_daily_views(days_count INTEGER)
RETURNS TABLE (
view_date DATE,
post_views INTEGER,
project_views INTEGER,
total_views INTEGER
) AS

$$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_count - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date AS date_val
  )
  SELECT
    ds.date_val AS view_date,
    COALESCE(pv.total_views, 0)::INTEGER AS post_views,
    COALESCE(prv.total_views, 0)::INTEGER AS project_views,
    (COALESCE(pv.total_views, 0) + COALESCE(prv.total_views, 0))::INTEGER AS total_views
  FROM date_series ds
  LEFT JOIN (
    SELECT
      view_date,
      SUM(view_count) AS total_views
    FROM post_views
    WHERE view_date >= CURRENT_DATE - (days_count - 1)
    GROUP BY view_date
  ) pv ON pv.view_date = ds.date_val
  LEFT JOIN (
    SELECT
      view_date,
      SUM(view_count) AS total_views
    FROM project_views
    WHERE view_date >= CURRENT_DATE - (days_count - 1)
    GROUP BY view_date
  ) prv ON prv.view_date = ds.date_val
  ORDER BY ds.date_val;
END;
$$

LANGUAGE plpgsql;

-- 6. Create a materialized view for faster analytics (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT
COUNT(CASE WHEN p.published = true THEN 1 END) as total_posts,
COUNT(CASE WHEN pr.is_active = true AND pr.is_public = true THEN 1 END) as total_projects,
(SELECT COUNT(\*) FROM profiles) as total_users,
COALESCE(SUM(pv.view_count), 0) as total_post_views,
COALESCE(SUM(prv.view_count), 0) as total_project_views,
CURRENT_DATE as last_updated
FROM posts p
FULL OUTER JOIN projects pr ON false -- Force cross join
LEFT JOIN post_views pv ON true
LEFT JOIN project_views prv ON true;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(last_updated);

-- 7. Function to refresh analytics (call this periodically)
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS VOID AS

$$

BEGIN
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Updated and improved view tracking functions
-- Run these in your Supabase SQL editor

-- 1. Enhanced increment_post_view function with better error handling
CREATE OR REPLACE FUNCTION increment_post_view(post_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
-- Validate input
IF post_id_param IS NULL OR post_id_param <= 0 THEN
RAISE EXCEPTION 'Invalid post_id: %', post_id_param;
END IF;

-- Check if post exists and is published
IF NOT EXISTS (
SELECT 1 FROM posts
WHERE id = post_id_param AND published = true
) THEN
RAISE EXCEPTION 'Post not found or not published: %', post_id_param;
END IF;

-- Update main posts table
UPDATE posts
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = post_id_param;

-- Update/insert daily view count
INSERT INTO post_views (post_id, view_date, view_count)
VALUES (post_id_param, CURRENT_DATE, 1)
ON CONFLICT (post_id, view_date)
DO UPDATE SET view_count = post_views.view_count + 1;

EXCEPTION
WHEN OTHERS THEN
-- Log error but don't fail silently
RAISE NOTICE 'Error incrementing post view for ID %: %', post_id_param, SQLERRM;
RAISE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enhanced increment_project_view function with better error handling
CREATE OR REPLACE FUNCTION increment_project_view(project_id_param INTEGER)
RETURNS VOID AS
$$

BEGIN
-- Validate input
IF project_id_param IS NULL OR project_id_param <= 0 THEN
RAISE EXCEPTION 'Invalid project_id: %', project_id_param;
END IF;

-- Check if project exists and is active/public
IF NOT EXISTS (
SELECT 1 FROM projects
WHERE id = project_id_param
AND is_active = true
AND is_public = true
) THEN
RAISE EXCEPTION 'Project not found or not public: %', project_id_param;
END IF;

-- Update main projects table
UPDATE projects
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = project_id_param;

-- Update/insert daily view count
INSERT INTO project_views (project_id, view_date, view_count)
VALUES (project_id_param, CURRENT_DATE, 1)
ON CONFLICT (project_id, view_date)
DO UPDATE SET view_count = project_views.view_count + 1;

EXCEPTION
WHEN OTHERS THEN
-- Log error but don't fail silently
RAISE NOTICE 'Error incrementing project view for ID %: %', project_id_param, SQLERRM;
RAISE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Safe versions that return boolean (optional - for better error handling)
CREATE OR REPLACE FUNCTION safe_increment_post_view(post_id_param INTEGER)
RETURNS BOOLEAN AS
$$

BEGIN
-- Validate input
IF post_id_param IS NULL OR post_id_param <= 0 THEN
RETURN FALSE;
END IF;

-- Check if post exists and is published
IF NOT EXISTS (
SELECT 1 FROM posts
WHERE id = post_id_param AND published = true
) THEN
RETURN FALSE;
END IF;

-- Update main posts table
UPDATE posts
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = post_id_param;

-- Update/insert daily view count
INSERT INTO post_views (post_id, view_date, view_count)
VALUES (post_id_param, CURRENT_DATE, 1)
ON CONFLICT (post_id, view_date)
DO UPDATE SET view_count = post_views.view_count + 1;

RETURN TRUE;

EXCEPTION
WHEN OTHERS THEN
RETURN FALSE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Safe project view increment function
CREATE OR REPLACE FUNCTION safe_increment_project_view(project_id_param INTEGER)
RETURNS BOOLEAN AS
$$

BEGIN
-- Validate input
IF project_id_param IS NULL OR project_id_param <= 0 THEN
RETURN FALSE;
END IF;

-- Check if project exists and is active/public
IF NOT EXISTS (
SELECT 1 FROM projects
WHERE id = project_id_param
AND is_active = true
AND is_public = true
) THEN
RETURN FALSE;
END IF;

-- Update main projects table
UPDATE projects
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = project_id_param;

-- Update/insert daily view count
INSERT INTO project_views (project_id, view_date, view_count)
VALUES (project_id_param, CURRENT_DATE, 1)
ON CONFLICT (project_id, view_date)
DO UPDATE SET view_count = project_views.view_count + 1;

RETURN TRUE;

EXCEPTION
WHEN OTHERS THEN
RETURN FALSE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant proper permissions
GRANT EXECUTE ON FUNCTION increment_post_view(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_view(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_increment_post_view(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_increment_project_view(INTEGER) TO authenticated;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id_date ON post_views(post_id, view_date);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id_date ON project_views(project_id, view_date);

-- 7. Add function to check if view was already tracked today (for debugging)
CREATE OR REPLACE FUNCTION check_view_tracked_today(content_type TEXT, content_id INTEGER)
RETURNS BOOLEAN AS
$$

BEGIN
IF content_type = 'post' THEN
RETURN EXISTS (
SELECT 1 FROM post_views
WHERE post_id = content_id AND view_date = CURRENT_DATE
);
ELSIF content_type = 'project' THEN
RETURN EXISTS (
SELECT 1 FROM project_views
WHERE project_id = content_id AND view_date = CURRENT_DATE
);
END IF;

RETURN FALSE;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_view_tracked_today(TEXT, INTEGER) TO authenticated;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_optimized_analytics_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_optimized_daily_views(INTEGER) TO authenticated;
GRANT SELECT ON analytics_summary TO authenticated;

-- 9. Create a function to clean up old view data (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_view_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS


$$

DECLARE
deleted_count INTEGER := 0;
post_views_deleted INTEGER := 0;
project_views_deleted INTEGER := 0;
BEGIN
-- Delete old post views
DELETE FROM post_views
WHERE view_date < CURRENT_DATE - (days_to_keep \* INTERVAL '1 day');

GET DIAGNOSTICS post_views_deleted = ROW_COUNT;

-- Delete old project views
DELETE FROM project_views
WHERE view_date < CURRENT_DATE - (days_to_keep \* INTERVAL '1 day');

GET DIAGNOSTICS project_views_deleted = ROW_COUNT;

-- Calculate total deleted rows
deleted_count := post_views_deleted + project_views_deleted;

RETURN deleted_count;
END;

$$

LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT cleanup*old_view_data(365); -- Keeps 1 year of data
-- Schedule to run on the 1st of every month at 3 AM
/*
SELECT cron.schedule(
'cleanup*old_views',
'0 3 1 * \*',
'SELECT cleanup_old_view_data(180);'
);

\*/
-- 10. Create extension for better performance if not exists
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 11. Create a monitoring function for performance
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE (
total_queries BIGINT,
avg_exec_time NUMERIC,
slow_queries_count BIGINT
) AS


$$

BEGIN
RETURN QUERY
SELECT
SUM(calls) as total_queries,
ROUND(AVG(mean_exec_time), 2) as avg_exec_time,
COUNT(CASE WHEN mean_exec_time > 1000 THEN 1 END) as slow_queries_count
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%';
END;

$$

LANGUAGE plpgsql SECURITY DEFINER;

---


$$

-- Add to your DBSCHEMA.md file
-- Enhanced Admin Dashboard Schema

-- Notifications Table
CREATE TABLE notifications (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
message TEXT NOT NULL,
type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'contact', 'comment', 'system')),
priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
icon TEXT,
action_url TEXT,
action_label TEXT,
user_id UUID REFERENCES profiles(id), -- NULL for system-wide notifications
is_read BOOLEAN DEFAULT FALSE,
is_global BOOLEAN DEFAULT FALSE, -- Global notifications for all admins
metadata JSONB, -- Additional data like contact_message_id, post_id, etc.
expires_at TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Recipients (for tracking read status per user for global notifications)
CREATE TABLE notification_recipients (
id SERIAL PRIMARY KEY,
notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
is_read BOOLEAN DEFAULT FALSE,
read_at TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(notification_id, user_id)
);

-- Online Users Tracking
CREATE TABLE online_users (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
session_id TEXT NOT NULL,
ip_address INET,
user_agent TEXT,
page_url TEXT,
is_authenticated BOOLEAN DEFAULT FALSE,
last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(user_id, session_id)
);

-- Dashboard Settings
CREATE TABLE dashboard_settings (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
settings JSONB NOT NULL DEFAULT '{}',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(user_id)
);

-- System Analytics
CREATE TABLE system_analytics (
id bigint primary key generated always as identity,
metric_name TEXT NOT NULL,
metric_value NUMERIC NOT NULL,
metadata JSONB,
recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
date_key DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_metric_name_date_key ON system_analytics(metric_name, date_key);

## Services Management Tables

### Service Categories
```sql
CREATE TABLE service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50),
  color VARCHAR(7), -- For theme colors
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Services
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  slug VARCHAR(200) NOT NULL UNIQUE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  icon_name VARCHAR(50),
  image_url TEXT,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  price_type VARCHAR(20) DEFAULT 'fixed', -- fixed, hourly, project, negotiable
  duration VARCHAR(100), -- e.g., "2-4 weeks", "1 month"
  delivery_time VARCHAR(100), -- e.g., "7 days", "2 weeks"
  features JSONB DEFAULT '[]'::JSONB, -- Array of feature strings
  tech_stack JSONB DEFAULT '[]'::JSONB, -- Array of technologies used
  process_steps JSONB DEFAULT '[]'::JSONB, -- Array of process steps
  includes JSONB DEFAULT '[]'::JSONB, -- What's included in the service
  requirements JSONB DEFAULT '[]'::JSONB, -- Client requirements
  portfolio_items JSONB DEFAULT '[]'::JSONB, -- Related project IDs or URLs
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard, expert
  status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
  tags JSONB DEFAULT '[]'::JSONB, -- Array of tag strings
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  meta_keywords TEXT,
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Service Packages
```sql
CREATE TABLE service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Basic, Standard, Premium
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'fixed',
  features JSONB DEFAULT '[]'::JSONB,
  delivery_time VARCHAR(100),
  revisions INTEGER DEFAULT 0, -- Number of revisions included
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Inquiries
```sql
CREATE TABLE service_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(100),
  project_title VARCHAR(200),
  project_description TEXT NOT NULL,
  budget_range VARCHAR(50),
  timeline VARCHAR(100),
  additional_requirements TEXT,
  preferred_contact VARCHAR(20) DEFAULT 'email', -- email, phone, both
  urgency VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, in_discussion, quoted, won, lost
  admin_notes TEXT,
  response_sent_at TIMESTAMPTZ,
  follow_up_date TIMESTAMPTZ,
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  client_ip INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_by UUID REFERENCES auth.users(id)
);
```

### Service Testimonials
```sql
CREATE TABLE service_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_name VARCHAR(100) NOT NULL,
  client_title VARCHAR(100),
  client_company VARCHAR(100),
  client_image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial TEXT NOT NULL,
  project_title VARCHAR(200),
  project_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id)
);
```

### Service FAQs
```sql
CREATE TABLE service_faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Views Tracking
```sql
CREATE TABLE service_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_ip INET,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  device_type VARCHAR(20), -- desktop, mobile, tablet
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Services Database Functions
```sql
-- Function to increment service view count
CREATE OR REPLACE FUNCTION increment_service_views(service_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE services 
    SET view_count = view_count + 1 
    WHERE slug = service_slug AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to increment service inquiry count
CREATE OR REPLACE FUNCTION increment_service_inquiries(service_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE services 
    SET inquiry_count = inquiry_count + 1 
    WHERE slug = service_slug AND is_active = true;
END;
$$ LANGUAGE plpgsql;
```

### Default Service Categories
```sql
INSERT INTO service_categories (name, description, slug, icon_name, color) VALUES
  ('Web Development', 'Full-stack web application development services', 'web-development', 'Code', '#3B82F6'),
  ('Mobile Development', 'iOS and Android mobile application development', 'mobile-development', 'Smartphone', '#10B981'),
  ('UI/UX Design', 'User interface and user experience design services', 'ui-ux-design', 'Palette', '#8B5CF6'),
  ('Consulting', 'Technical consulting and architecture planning', 'consulting', 'Users', '#F59E0B'),
  ('Maintenance', 'Ongoing support and maintenance services', 'maintenance', 'Settings', '#EF4444');
```

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Notifications
CREATE POLICY "Admin can view all notifications"
ON notifications FOR SELECT
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

CREATE POLICY "Admin can manage notifications"
ON notifications FOR ALL
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- RLS Policies for Online Users
CREATE POLICY "Admin can view online users"
ON online_users FOR SELECT
USING (
EXISTS (
SELECT 1 FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid() AND r.name = 'admin'
)
);

-- Functions for Notifications
CREATE OR REPLACE FUNCTION create_contact_notification()
RETURNS TRIGGER AS

$$

BEGIN
INSERT INTO notifications (
title,
message,
type,
priority,
icon,
action_url,
action_label,
is_global,
metadata
) VALUES (
'New Contact Message',
'New message from ' || NEW.name || ': ' || LEFT(NEW.subject, 50) || '...',
'contact',
CASE WHEN NEW.priority = 'urgent' THEN 'urgent' ELSE 'normal' END,
'Mail',
'/admin/contact',
'View Message',
true,
jsonb_build_object('contact_message_id', NEW.id, 'sender_name', NEW.name)
);

RETURN NEW;
END;


$$

LANGUAGE plpgsql;

-- Trigger for contact messages
CREATE TRIGGER on_contact_message_created
AFTER INSERT ON contact_messages
FOR EACH ROW EXECUTE FUNCTION create_contact_notification();

-- Enhanced function to update online user with better authentication tracking
CREATE OR REPLACE FUNCTION update_online_user(
p_user_id UUID DEFAULT NULL,
p_session_id TEXT DEFAULT NULL,
p_ip_address INET DEFAULT NULL,
p_user_agent TEXT DEFAULT NULL,
p_page_url TEXT DEFAULT NULL,
p_is_authenticated BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS

$$

BEGIN
-- Ensure we have a session ID
IF p_session_id IS NULL THEN
RETURN;
END IF;

-- Insert or update the online user record
INSERT INTO online_users (
user_id,
session_id,
ip_address,
user_agent,
page_url,
is_authenticated,
last_activity
) VALUES (
p_user_id,
p_session_id,
p_ip_address,
p_user_agent,
p_page_url,
p_is_authenticated,
NOW()
)
ON CONFLICT (user_id, session_id)
DO UPDATE SET
ip_address = EXCLUDED.ip_address,
user_agent = EXCLUDED.user_agent,
page_url = EXCLUDED.page_url,
is_authenticated = EXCLUDED.is_authenticated,
last_activity = NOW();

-- Clean up old sessions for this user if they have multiple sessions
IF p_user_id IS NOT NULL THEN
DELETE FROM online_users
WHERE user_id = p_user_id
AND session_id != p_session_id
AND last_activity < NOW() - INTERVAL '1 hour';
END IF;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to get online users count with proper authentication filtering
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS TABLE (
total_online INTEGER,
authenticated_users INTEGER,
anonymous_users INTEGER
) AS

$$

BEGIN
-- Clean up expired sessions first
DELETE FROM online_users
WHERE last_activity < NOW() - INTERVAL '15 minutes';

RETURN QUERY
WITH online_stats AS (
SELECT
COUNT(\*) as total,
COUNT(CASE WHEN user_id IS NOT NULL AND is_authenticated = true THEN 1 END) as authenticated,
COUNT(CASE WHEN user_id IS NULL OR is_authenticated = false THEN 1 END) as anonymous
FROM online_users
WHERE last_activity >= NOW() - INTERVAL '5 minutes'
)
SELECT
total::INTEGER,
authenticated::INTEGER,
anonymous::INTEGER
FROM online_stats;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent online users with profile information
CREATE OR REPLACE FUNCTION get_recent_online_users(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
user_id UUID,
session_id TEXT,
last_activity TIMESTAMPTZ,
is_authenticated BOOLEAN,
page_url TEXT,
user_name TEXT
) AS

$$

BEGIN
-- Clean up expired sessions first
DELETE FROM online_users
WHERE last_activity < NOW() - INTERVAL '15 minutes';

RETURN QUERY
SELECT
ou.user_id,
ou.session_id,
ou.last_activity,
ou.is_authenticated,
ou.page_url,
COALESCE(p.full_name, 'Anonymous') as user_name
FROM online_users ou
LEFT JOIN profiles p ON ou.user_id = p.id
WHERE ou.last_activity >= NOW() - INTERVAL '5 minutes'
ORDER BY ou.last_activity DESC
LIMIT p_limit;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced cleanup function for online users
CREATE OR REPLACE FUNCTION cleanup_online_users()
RETURNS INTEGER AS

$$

DECLARE
deleted_count INTEGER;
BEGIN
-- Delete sessions inactive for more than 15 minutes
DELETE FROM online_users
WHERE last_activity < NOW() - INTERVAL '15 minutes';

GET DIAGNOSTICS deleted_count = ROW_COUNT;

RETURN deleted_count;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove specific user session
CREATE OR REPLACE FUNCTION remove_user_session(
p_session_id TEXT,
p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS

$$

BEGIN
DELETE FROM online_users
WHERE session_id = p_session_id
AND (p_user_id IS NULL OR user_id = p_user_id);

RETURN FOUND;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to mark notification as read with proper handling
CREATE OR REPLACE FUNCTION mark_notification_read(
p_notification_id INTEGER,
p_user_id UUID
)
RETURNS BOOLEAN AS

$$

DECLARE
notification_record RECORD;
BEGIN
-- Get the notification details
SELECT id, is_global, user_id INTO notification_record
FROM notifications
WHERE id = p_notification_id;

IF NOT FOUND THEN
RETURN FALSE;
END IF;

-- Handle global notifications
IF notification_record.is_global = true THEN
-- Insert or update recipient record
INSERT INTO notification_recipients (notification_id, user_id, is_read, read_at)
VALUES (p_notification_id, p_user_id, true, NOW())
ON CONFLICT (notification_id, user_id)
DO UPDATE SET
is_read = true,
read_at = NOW();
ELSE
-- Handle user-specific notifications
IF notification_record.user_id = p_user_id OR notification_record.user_id IS NULL THEN
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE id = p_notification_id;
ELSE
RETURN FALSE; -- User doesn't have permission to mark this notification as read
END IF;
END IF;

RETURN TRUE;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_online_user(UUID, TEXT, INET, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users_count() TO authenticated;

GRANT EXECUTE ON FUNCTION mark_notification_read(INTEGER, UUID) TO authenticated;

-- Function to get notifications with proper read status for a user
CREATE OR REPLACE FUNCTION get_user_notifications(
p_user_id UUID,
p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
id INTEGER,
title TEXT,
message TEXT,
type TEXT,
priority TEXT,
icon TEXT,
action_url TEXT,
action_label TEXT,
is_global BOOLEAN,
metadata JSONB,
created_at TIMESTAMPTZ,
is_read BOOLEAN
) AS

$$

BEGIN
RETURN QUERY
WITH user_notifications AS (
-- Get all notifications for the user
SELECT
n.id,
n.title,
n.message,
n.type,
n.priority,
n.icon,
n.action_url,
n.action_label,
n.is_global,
n.metadata,
n.created_at,
CASE
WHEN n.is_global THEN
COALESCE(nr.is_read, false)
ELSE
COALESCE(n.is_read, false)
END as is_read
FROM notifications n
LEFT JOIN notification_recipients nr ON (
n.id = nr.notification_id
AND nr.user_id = p_user_id
AND n.is_global = true
)
WHERE
n.is_global = true
OR n.user_id = p_user_id
OR n.user_id IS NULL
)
SELECT \* FROM user_notifications
ORDER BY created_at DESC
LIMIT p_limit;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INTEGER) TO authenticated;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS

$$

DECLARE
unread_count INTEGER;
BEGIN
SELECT COUNT(\*) INTO unread_count
FROM (
SELECT
n.id,
CASE
WHEN n.is_global THEN
COALESCE(nr.is_read, false)
ELSE
COALESCE(n.is_read, false)
END as is_read
FROM notifications n
LEFT JOIN notification_recipients nr ON (
n.id = nr.notification_id
AND nr.user_id = p_user_id
AND n.is_global = true
)
WHERE
(n.is_global = true OR n.user_id = p_user_id OR n.user_id IS NULL)
AND n.created_at > NOW() - INTERVAL '30 days' -- Only check recent notifications
) filtered_notifications
WHERE is_read = false;

RETURN COALESCE(unread_count, 0);
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

---

-- Certifications Management Functions

-- Function to get active certifications with expiry status
CREATE OR REPLACE FUNCTION get_certifications_with_status()
RETURNS TABLE (
id INTEGER,
title TEXT,
issuing_organization TEXT,
description TEXT,
issue_date DATE,
expiry_date DATE,
is_permanent BOOLEAN,
credential_id TEXT,
credential_url TEXT,
certificate_url TEXT,
skills_covered JSONB,
verification_url TEXT,
badge_image_url TEXT,
category TEXT,
level TEXT,
score TEXT,
total_score TEXT,
hours_completed INTEGER,
display_order INTEGER,
is_featured BOOLEAN,
is_expired BOOLEAN,
days_until_expiry INTEGER,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ
) AS $$
BEGIN
RETURN QUERY
SELECT
c.id,
c.title,
c.issuing_organization,
c.description,
c.issue_date,
c.expiry_date,
c.is_permanent,
c.credential_id,
c.credential_url,
c.certificate_url,
c.skills_covered,
c.verification_url,
c.badge_image_url,
c.category,
c.level,
c.score,
c.total_score,
c.hours_completed,
c.display_order,
c.is_featured,
CASE
WHEN c.is_permanent = true THEN false
WHEN c.expiry_date IS NULL THEN false
ELSE c.expiry_date < CURRENT_DATE
END as is_expired,
CASE
WHEN c.is_permanent = true THEN NULL
WHEN c.expiry_date IS NULL THEN NULL
ELSE (c.expiry_date - CURRENT_DATE)::INTEGER
END as days_until_expiry,
c.created_at,
c.updated_at
FROM certifications c
WHERE c.is_active = true
ORDER BY c.display_order ASC, c.issue_date DESC;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get certifications by category
CREATE OR REPLACE FUNCTION get_certifications_by_category(p_category TEXT DEFAULT NULL)
RETURNS TABLE (
id INTEGER,
title TEXT,
issuing_organization TEXT,
description TEXT,
issue_date DATE,
expiry_date DATE,
is_permanent BOOLEAN,
credential_url TEXT,
certificate_url TEXT,
skills_covered JSONB,
verification_url TEXT,
badge_image_url TEXT,
category TEXT,
level TEXT,
score TEXT,
is_featured BOOLEAN,
is_expired BOOLEAN
) AS
$$

BEGIN
RETURN QUERY
SELECT
c.id,
c.title,
c.issuing_organization,
c.description,
c.issue_date,
c.expiry_date,
c.is_permanent,
c.credential_url,
c.certificate_url,
c.skills_covered,
c.verification_url,
c.badge_image_url,
c.category,
c.level,
c.score,
c.is_featured,
CASE
WHEN c.is_permanent = true THEN false
WHEN c.expiry_date IS NULL THEN false
ELSE c.expiry_date < CURRENT_DATE
END as is_expired
FROM certifications c
WHERE c.is_active = true
AND (p_category IS NULL OR c.category = p_category)
ORDER BY c.is_featured DESC, c.display_order ASC, c.issue_date DESC;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get certification statistics
CREATE OR REPLACE FUNCTION get_certification_stats()
RETURNS TABLE (
total_certifications INTEGER,
active_certifications INTEGER,
expired_certifications INTEGER,
expiring_soon INTEGER, -- expires within 30 days
featured_certifications INTEGER,
categories_count INTEGER
) AS
$$

BEGIN
RETURN QUERY
WITH stats AS (
SELECT
COUNT(\*) as total,
COUNT(CASE WHEN is_active = true THEN 1 END) as active,
COUNT(CASE WHEN is_active = true AND is_permanent = false AND expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 1 END) as expired,
COUNT(CASE WHEN is_active = true AND is_permanent = false AND expiry_date IS NOT NULL AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon,
COUNT(CASE WHEN is_active = true AND is_featured = true THEN 1 END) as featured,
COUNT(DISTINCT category) as categories
FROM certifications
)
SELECT
total::INTEGER,
active::INTEGER,
expired::INTEGER,
expiring_soon::INTEGER,
featured::INTEGER,
categories::INTEGER
FROM stats;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for certification functions
GRANT EXECUTE ON FUNCTION get_certifications_with_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_certifications_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_certification_stats() TO authenticated;

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_online_users_last_activity ON online_users(last_activity);
CREATE INDEX idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX idx_system_analytics_metric_date ON system_analytics(metric_name, date_key);

---


$$

-- Enhanced analytics functions with better performance
CREATE OR REPLACE FUNCTION get_enhanced_analytics_summary(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
total_posts INTEGER,
total_projects INTEGER,
total_users INTEGER,
total_post_views BIGINT,
total_project_views BIGINT,
total_messages INTEGER,
avg_daily_views NUMERIC,
growth_rate NUMERIC,
online_users_count INTEGER
) AS

$$

DECLARE
start_date DATE := CURRENT_DATE - (days_count - 1);
current_views BIGINT;
previous_views BIGINT;
previous_start_date DATE := CURRENT_DATE - (days_count \* 2 - 1);
previous_end_date DATE := CURRENT_DATE - days_count;
BEGIN
-- Get current period views
SELECT
COALESCE(SUM(pv.view_count), 0) + COALESCE(SUM(prv.view_count), 0)
INTO current_views
FROM (
SELECT COALESCE(SUM(view_count), 0) as view_count
FROM post_views
WHERE view_date >= start_date
) pv,
(
SELECT COALESCE(SUM(view_count), 0) as view_count
FROM project_views
WHERE view_date >= start_date
) prv;

-- Get previous period views for growth calculation
SELECT
COALESCE(SUM(pv.view_count), 0) + COALESCE(SUM(prv.view_count), 0)
INTO previous_views
FROM (
SELECT COALESCE(SUM(view_count), 0) as view_count
FROM post_views
WHERE view_date >= previous_start_date AND view_date <= previous_end_date
) pv,
(
SELECT COALESCE(SUM(view_count), 0) as view_count
FROM project_views
WHERE view_date >= previous_start_date AND view_date <= previous_end_date
) prv;

RETURN QUERY
SELECT
(SELECT COUNT(_)::INTEGER FROM posts WHERE published = true) AS total_posts,
(SELECT COUNT(_)::INTEGER FROM projects WHERE is*active = true AND is_public = true) AS total_projects,
(SELECT COUNT(*)::INTEGER FROM profiles) AS total*users,
(SELECT COALESCE(SUM(view_count), 0) FROM post_views WHERE view_date >= start_date) AS total_post_views,
(SELECT COALESCE(SUM(view_count), 0) FROM project_views WHERE view_date >= start_date) AS total_project_views,
(SELECT COUNT(*)::INTEGER FROM contact*messages WHERE created_at >= start_date::timestamp) AS total_messages,
ROUND(current_views::NUMERIC / days_count, 2) AS avg_daily_views,
CASE
WHEN previous_views > 0 THEN ROUND(((current_views - previous_views)::NUMERIC / previous_views) * 100, 2)
ELSE 0
END AS growth*rate,
(SELECT COUNT(*)::INTEGER FROM online_users WHERE last_activity >= NOW() - INTERVAL '5 minutes') AS online_users_count;
END;


$$

LANGUAGE plpgsql SECURITY DEFINER;

$$

-- Function to get combined views data with proper date handling
CREATE OR REPLACE FUNCTION get_views_analytics(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
view_date DATE,
post_views INTEGER,
project_views INTEGER,
total_views INTEGER
) AS
$$

BEGIN
RETURN QUERY
WITH date_series AS (
SELECT generate_series(
CURRENT_DATE - (days_count - 1),
CURRENT_DATE,
'1 day'::interval
)::date AS date_val
),
post_views_agg AS (
SELECT
view_date,
SUM(view_count) AS total_views
FROM post_views
WHERE view_date >= CURRENT_DATE - (days_count - 1)
GROUP BY view_date
),
project_views_agg AS (
SELECT
view_date,
SUM(view_count) AS total_views
FROM project_views
WHERE view_date >= CURRENT_DATE - (days_count - 1)
GROUP BY view_date
)
SELECT
ds.date_val AS view_date,
COALESCE(pv.total_views, 0)::INTEGER AS post_views,
COALESCE(prv.total_views, 0)::INTEGER AS project_views,
(COALESCE(pv.total_views, 0) + COALESCE(prv.total_views, 0))::INTEGER AS total_views
FROM date_series ds
LEFT JOIN post_views_agg pv ON pv.view_date = ds.date_val
LEFT JOIN project_views_agg prv ON prv.view_date = ds.date_val
ORDER BY ds.date_val;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for new analytics tables

-- Contact messages policies
CREATE POLICY "Contact messages are viewable by admins"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Service inquiries policies
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public service inquiry creation"
ON service_inquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin and editors can view service inquiries"
ON service_inquiries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'editor')
  )
);

CREATE POLICY "Admin and editors can update service inquiries"
ON service_inquiries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'editor')
  )
);

CREATE POLICY "Admin can delete service inquiries"
ON service_inquiries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'admin'
  )
);

-- Service packages policies
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read active service packages"
ON service_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin and editors can manage service packages"
ON service_packages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'editor')
  )
);

-- View tracking policies
CREATE POLICY "Views are publicly readable"
  ON post_views FOR SELECT USING (true);

CREATE POLICY "Views are publicly readable"
  ON project_views FOR SELECT USING (true);

CREATE POLICY "Anyone can track views"
  ON post_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can track views"
  ON project_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Views can be updated"
  ON post_views FOR UPDATE USING (true);

CREATE POLICY "Views can be updated"  
  ON project_views FOR UPDATE USING (true);

-- Online users policies
CREATE POLICY "Online users viewable by admins"
  ON online_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Anyone can track online status"
  ON online_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own online status"
  ON online_users FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own online status"
  ON online_users FOR DELETE USING (true);

-- Enhanced online user tracking functions
CREATE OR REPLACE FUNCTION upsert_online_user(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_browser_fingerprint TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  activity_threshold INTERVAL := '5 minutes';
  cleanup_threshold INTERVAL := '10 minutes';
BEGIN
  -- Clean up old sessions first (only run occasionally)
  IF random() < 0.1 THEN -- 10% chance to run cleanup
    DELETE FROM online_users 
    WHERE last_activity < NOW() - cleanup_threshold;
  END IF;

  -- For authenticated users
  IF p_user_id IS NOT NULL THEN
    INSERT INTO online_users (
      user_id, session_id, ip_address, browser_fingerprint,
      page_url, user_agent, display_name, is_authenticated,
      last_activity, updated_at
    ) VALUES (
      p_user_id, p_session_id, p_ip_address, p_browser_fingerprint,
      p_page_url, p_user_agent, p_display_name, true,
      NOW(), NOW()
    )
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL
    DO UPDATE SET
      session_id = EXCLUDED.session_id,
      ip_address = EXCLUDED.ip_address,
      browser_fingerprint = EXCLUDED.browser_fingerprint,
      page_url = EXCLUDED.page_url,
      user_agent = EXCLUDED.user_agent,
      display_name = EXCLUDED.display_name,
      last_activity = NOW(),
      updated_at = NOW();
  
  -- For anonymous users
  ELSE
    INSERT INTO online_users (
      user_id, session_id, ip_address, browser_fingerprint,
      page_url, user_agent, display_name, is_authenticated,
      last_activity, updated_at
    ) VALUES (
      NULL, p_session_id, p_ip_address, p_browser_fingerprint,
      p_page_url, p_user_agent, 'Anonymous', false,
      NOW(), NOW()
    )
    ON CONFLICT (session_id, ip_address) WHERE user_id IS NULL
    DO UPDATE SET
      page_url = EXCLUDED.page_url,
      user_agent = EXCLUDED.user_agent,
      browser_fingerprint = EXCLUDED.browser_fingerprint,
      last_activity = NOW(),
      updated_at = NOW()
    WHERE online_users.last_activity < NOW() - INTERVAL '30 seconds'; -- Throttle anonymous updates
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current online user statistics
CREATE OR REPLACE FUNCTION get_online_user_stats()
RETURNS TABLE (
  total_online INTEGER,
  authenticated_users INTEGER,
  anonymous_users INTEGER
) AS $$
DECLARE
  activity_threshold INTERVAL := '5 minutes';
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_online,
    COUNT(*) FILTER (WHERE is_authenticated = true)::INTEGER AS authenticated_users,
    COUNT(*) FILTER (WHERE is_authenticated = false)::INTEGER AS anonymous_users
  FROM online_users 
  WHERE last_activity > NOW() - activity_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent online users (for admin dashboard)
CREATE OR REPLACE FUNCTION get_recent_online_users(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  user_id UUID,
  session_id TEXT,
  display_name TEXT,
  last_activity TIMESTAMP WITH TIME ZONE,
  is_authenticated BOOLEAN,
  page_url TEXT,
  ip_address INET
) AS $$
DECLARE
  activity_threshold INTERVAL := '5 minutes';
BEGIN
  RETURN QUERY
  SELECT 
    ou.id,
    ou.user_id,
    ou.session_id,
    ou.display_name,
    ou.last_activity,
    ou.is_authenticated,
    ou.page_url,
    ou.ip_address
  FROM online_users ou
  WHERE ou.last_activity > NOW() - activity_threshold
  ORDER BY ou.last_activity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cleanup_threshold INTERVAL := '10 minutes';
BEGIN
  DELETE FROM online_users 
  WHERE last_activity < NOW() - cleanup_threshold;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove specific user session (for logout)
CREATE OR REPLACE FUNCTION remove_user_session(p_user_id UUID DEFAULT NULL, p_session_id TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    DELETE FROM online_users WHERE user_id = p_user_id;
  ELSIF p_session_id IS NOT NULL THEN
    DELETE FROM online_users WHERE session_id = p_session_id;
  ELSE
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for all functions
GRANT EXECUTE ON FUNCTION upsert_online_user(UUID, TEXT, INET, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_online_user_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_recent_online_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_session(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_online_user(UUID, TEXT, INET, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_online_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_online_users() TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_session(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enhanced_analytics_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_views_analytics(INTEGER) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_online_users_last_activity ON online_users(last_activity);
CREATE INDEX IF NOT EXISTS idx_online_users_session_id ON online_users(session_id);
CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_is_authenticated ON online_users(is_authenticated);

-- Note: Automatic cleanup happens within upsert_online_user function
-- No cron jobs needed - cleanup runs automatically with 10% probability on each upsert
$$
