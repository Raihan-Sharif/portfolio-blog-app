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
