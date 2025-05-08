export type Profile = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
};

export type Role = {
  id: number;
  name: string;
  created_at: string;
};

export type UserRole = {
  id: number;
  user_id: string;
  role_id: number;
  role?: Role;
  created_at: string;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: any;
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  featured: boolean;
  created_at: string;
  updated_at?: string;
};

export type Skill = {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  created_at: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  cover_image_url?: string;
  published: boolean;
  author_id: string;
  author?: Profile;
  category_id?: number;
  category?: Category;
  view_count: number;
  created_at: string;
  updated_at?: string;
  tags?: Tag[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
};

export type ThemeSetting = {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
};

// Supabase response types
export interface RoleData {
  name: string;
}

export interface UserRolesResponse {
  roles: RoleData;
}
