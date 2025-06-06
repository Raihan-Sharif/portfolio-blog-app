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
