export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  slug: string;
  category_id: string | null;
  icon_name: string | null;
  image_url: string | null;
  price_from: number | null;
  price_to: number | null;
  price_type: 'fixed' | 'hourly' | 'project' | 'negotiable';
  show_price: boolean;
  duration: string | null;
  delivery_time: string | null;
  features: string[];
  tech_stack: string[];
  process_steps: string[];
  includes: string[];
  requirements: string[];
  portfolio_items: string[];
  is_featured: boolean;
  is_active: boolean;
  is_popular: boolean;
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string | null;
  view_count: number;
  inquiry_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  category?: ServiceCategory;
  packages?: ServicePackage[];
  testimonials?: ServiceTestimonial[];
  faqs?: ServiceFAQ[];
}

export interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  price_type: 'fixed' | 'hourly' | 'project' | 'negotiable';
  features: string[];
  delivery_time: string | null;
  revisions: number;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInquiry {
  id: string;
  service_id: string | null;
  package_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_title: string | null;
  project_description: string;
  budget_range: string | null;
  timeline: string | null;
  additional_requirements: string | null;
  preferred_contact: 'email' | 'phone' | 'both';
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'contacted' | 'in_discussion' | 'quoted' | 'won' | 'lost';
  admin_notes: string | null;
  response_sent_at: string | null;
  follow_up_date: string | null;
  estimated_value: number | null;
  actual_value: number | null;
  client_ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
  responded_by: string | null;
  service?: Service;
  package?: ServicePackage;
}

export interface ServiceTestimonial {
  id: string;
  service_id: string;
  client_name: string;
  client_title: string | null;
  client_company: string | null;
  client_image_url: string | null;
  rating: number;
  testimonial: string;
  project_title: string | null;
  project_url: string | null;
  is_featured: boolean;
  is_approved: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
}

export interface ServiceFAQ {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceView {
  id: string;
  service_id: string;
  client_ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | null;
  viewed_at: string;
}

export interface ServiceInquiryFormData {
  service_id?: string;
  package_id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  project_title?: string;
  project_description: string;
  budget_range?: string;
  timeline?: string;
  additional_requirements?: string;
  preferred_contact?: 'email' | 'phone' | 'both';
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ServiceAnalytics {
  total_services: number;
  active_services: number;
  total_inquiries: number;
  pending_inquiries: number;
  conversion_rate: number;
  popular_services: Service[];
  recent_inquiries: ServiceInquiry[];
  category_stats: {
    category_name: string;
    service_count: number;
    inquiry_count: number;
  }[];
  monthly_stats: {
    month: string;
    inquiries: number;
    conversions: number;
  }[];
}

export interface ServiceFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  difficulty?: string;
  tags?: string[];
  featured?: boolean;
  popular?: boolean;
}

export interface ServiceSortOptions {
  field: 'created_at' | 'title' | 'price_from' | 'view_count' | 'inquiry_count';
  direction: 'asc' | 'desc';
}

export interface ServiceWithRelations extends Service {
  category?: ServiceCategory;
  packages: ServicePackage[];
  testimonials: ServiceTestimonial[];
  faqs: ServiceFAQ[];
}