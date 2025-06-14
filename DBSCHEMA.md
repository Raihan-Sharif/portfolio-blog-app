Database Setup

Here's the SQL to create the database schema on Supabase:

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

-- Create a function to increment view count properly
CREATE OR REPLACE FUNCTION increment_post_view(post_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
-- First update the main posts table total view count
UPDATE posts
SET view_count = view_count + 1
WHERE id = post_id_param;

-- Then, update or insert the daily view count
INSERT INTO post_views (post_id, view_date, view_count)
VALUES (post_id_param, CURRENT_DATE, 1)
ON CONFLICT (post_id, view_date)
DO UPDATE SET view_count = post_views.view_count + 1;
END;

$$
LANGUAGE plpgsql;

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
RETURNS BOOLEAN AS $$
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

-- Update contact_messages table to include phone field if not exists
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;

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

-- Enable RLS on all new tables
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

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
-- Update main projects table
UPDATE projects
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = project_id_param;

-- Update/insert daily view count
INSERT INTO project_views (project_id, view_date, view_count)
VALUES (project_id_param, CURRENT_DATE, 1)
ON CONFLICT (project_id, view_date)
DO UPDATE SET view_count = project_views.view_count + 1;
END;

$$
LANGUAGE plpgsql;
----------
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
) AS $$
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

-- 4. Function to safely increment view counts (prevents SQL injection and errors)
CREATE OR REPLACE FUNCTION safe_increment_post_view(post_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
-- Validate input
IF post_id_param IS NULL OR post_id_param <= 0 THEN
RETURN FALSE;
END IF;

-- Check if post exists
IF NOT EXISTS (SELECT 1 FROM posts WHERE id = post_id_param) THEN
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

-- 5. Function to safely increment project view counts
CREATE OR REPLACE FUNCTION safe_increment_project_view(project_id_param INTEGER)
RETURNS BOOLEAN AS
$$

BEGIN
-- Validate input
IF project_id_param IS NULL OR project_id_param <= 0 THEN
RETURN FALSE;
END IF;

-- Check if project exists and is public
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

-- 6. Create a materialized view for faster analytics (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT
  COUNT(CASE WHEN p.published = true THEN 1 END) as total_posts,
  COUNT(CASE WHEN pr.is_active = true AND pr.is_public = true THEN 1 END) as total_projects,
  (SELECT COUNT(*) FROM profiles) as total_users,
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

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_optimized_analytics_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_optimized_daily_views(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_increment_post_view(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_increment_project_view(INTEGER) TO authenticated;
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

-- SELECT cleanup_old_view_data(365); -- Keeps 1 year of data
-- Schedule to run on the 1st of every month at 3 AM
/*
SELECT cron.schedule(
  'cleanup_old_views',
  '0 3 1 * *',
  'SELECT cleanup_old_view_data(180);'
);

*/
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

---------
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
RETURNS TRIGGER AS $$
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

-- Function to track online users
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
INSERT INTO online*users (
user_id,
session_id,
ip_address,
user_agent,
page_url,
is_authenticated,
last_activity
) VALUES (
p_user_id,
COALESCE(p_session_id, 'anonymous*' || extract(epoch from now())),
p_ip_address,
p_user_agent,
p_page_url,
p_is_authenticated,
NOW()
)
ON CONFLICT (user_id, session_id)
DO UPDATE SET
last_activity = NOW(),
page_url = EXCLUDED.page_url,
ip_address = EXCLUDED.ip_address,
user_agent = EXCLUDED.user_agent;
END;

$$
LANGUAGE plpgsql;

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS TABLE (
  total_online INTEGER,
  authenticated_users INTEGER,
  anonymous_users INTEGER
) AS
$$

BEGIN
RETURN QUERY
SELECT
COUNT(\*)::INTEGER as total_online,
COUNT(CASE WHEN is_authenticated THEN 1 END)::INTEGER as authenticated_users,
COUNT(CASE WHEN NOT is_authenticated THEN 1 END)::INTEGER as anonymous_users
FROM online_users
WHERE last_activity > NOW() - INTERVAL '5 minutes';
END;

$$
LANGUAGE plpgsql;

-- Function to clean old online users
CREATE OR REPLACE FUNCTION cleanup_online_users()
RETURNS VOID AS
$$

BEGIN
DELETE FROM online_users
WHERE last_activity < NOW() - INTERVAL '15 minutes';
END;

$$
LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id INTEGER,
  p_user_id UUID
)
RETURNS BOOLEAN AS
$$

BEGIN
-- For global notifications, use notification_recipients table
IF EXISTS (SELECT 1 FROM notifications WHERE id = p_notification_id AND is_global = true) THEN
INSERT INTO notification_recipients (notification_id, user_id, is_read, read_at)
VALUES (p_notification_id, p_user_id, true, NOW())
ON CONFLICT (notification_id, user_id)
DO UPDATE SET is_read = true, read_at = NOW();
ELSE
-- For user-specific notifications, update directly
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE id = p_notification_id AND (user_id = p_user_id OR user_id IS NULL);
END IF;

RETURN FOUND;
END;

$$
LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_online_user(UUID, TEXT, INET, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(INTEGER, UUID) TO authenticated;

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_online_users_last_activity ON online_users(last_activity);
CREATE INDEX idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX idx_system_analytics_metric_date ON system_analytics(metric_name, date_key);

----------
$$
