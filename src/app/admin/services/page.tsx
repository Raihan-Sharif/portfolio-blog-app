import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Service, ServiceCategory, ServiceInquiry } from '@/types/services';
import AdminServicesContent from '@/components/admin/services/admin-services-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services Management | Admin Dashboard',
  description: 'Manage services, categories, packages, and inquiries',
};

async function getServicesData() {
  const supabase = createServerSupabaseClient();

  const [servicesResult, categoriesResult, inquiriesResult] = await Promise.all([
    supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*),
        packages:service_packages(*),
        testimonials:service_testimonials(*)
      `)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('service_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    
    supabase
      .from('service_inquiries')
      .select(`
        *,
        service:services(title, slug),
        package:service_packages(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  return {
    services: servicesResult.data as Service[] || [],
    categories: categoriesResult.data as ServiceCategory[] || [],
    recentInquiries: inquiriesResult.data as ServiceInquiry[] || []
  };
}

export default async function AdminServicesPage(): Promise<JSX.Element> {
  const { services, categories, recentInquiries } = await getServicesData();

  // Calculate stats
  const stats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.is_active && s.status === 'active').length,
    draftServices: services.filter(s => s.status === 'draft').length,
    featuredServices: services.filter(s => s.is_featured).length,
    totalViews: services.reduce((sum, s) => sum + s.view_count, 0),
    totalInquiries: services.reduce((sum, s) => sum + s.inquiry_count, 0),
    pendingInquiries: recentInquiries.filter(i => i.status === 'new').length,
    conversionRate: services.reduce((sum, s) => sum + s.inquiry_count, 0) > 0 
      ? Math.round((services.reduce((sum, s) => sum + s.view_count, 0) / services.reduce((sum, s) => sum + s.inquiry_count, 0)) * 100) / 100
      : 0
  };

  return (
    <AdminServicesContent 
      services={services}
      categories={categories}
      recentInquiries={recentInquiries}
      stats={stats}
    />
  );
}