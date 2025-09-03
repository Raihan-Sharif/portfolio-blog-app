-- Fix RLS policies for workshops and achievements tables
-- This addresses the error: "new row violates row-level security policy for table 'workshops'"

-- For workshops table: Allow public read access to active workshops, admin can manage all
DROP POLICY IF EXISTS "Active workshops are viewable by everyone" ON workshops;
DROP POLICY IF EXISTS "Admin can manage workshops" ON workshops;
DROP POLICY IF EXISTS "Enable read access for active workshops" ON workshops;
DROP POLICY IF EXISTS "Enable admin management for workshops" ON workshops;

-- Create new policy for public read access to active workshops
CREATE POLICY "Public can view active workshops" ON workshops
  FOR SELECT USING (is_active = true);

-- Create new policy for admin management
CREATE POLICY "Admins can manage workshops" ON workshops
  FOR ALL USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'admin'
    )
  );

-- For achievements table: Allow public read access to active achievements, admin can manage all
DROP POLICY IF EXISTS "Active achievements are viewable by everyone" ON achievements;
DROP POLICY IF EXISTS "Admin can manage achievements" ON achievements;
DROP POLICY IF EXISTS "Enable read access for active achievements" ON achievements;
DROP POLICY IF EXISTS "Enable admin management for achievements" ON achievements;

-- Create new policy for public read access to active achievements
CREATE POLICY "Public can view active achievements" ON achievements
  FOR SELECT USING (is_active = true);

-- Create new policy for admin management
CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'admin'
    )
  );