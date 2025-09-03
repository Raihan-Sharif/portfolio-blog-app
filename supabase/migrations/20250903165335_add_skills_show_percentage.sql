-- Add show_percentage column to skills table
ALTER TABLE skills ADD COLUMN show_percentage BOOLEAN DEFAULT true;

-- Update existing skills to show percentage by default
UPDATE skills SET show_percentage = true WHERE show_percentage IS NULL;