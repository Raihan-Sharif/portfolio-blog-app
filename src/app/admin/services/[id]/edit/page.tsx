import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Service, ServiceCategory } from '@/types/services';
import AdminLayout from '@/components/admin/admin-layout';
import ServiceForm from '@/components/admin/services/service-form';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Service | Admin Dashboard',
  description: 'Edit service details',
};

interface EditServicePageProps {
  params: {
    id: string;
  };
}

async function getServiceData(id: string) {
  const supabase = createServerSupabaseClient();

  const [serviceResult, categoriesResult] = await Promise.all([
    supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*),
        packages:service_packages(*),
        testimonials:service_testimonials(*),
        faqs:service_faqs(*)
      `)
      .eq('id', id)
      .single(),
    
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  ]);

  if (serviceResult.error || !serviceResult.data) {
    notFound();
  }

  return {
    service: serviceResult.data as Service,
    categories: categoriesResult.data as ServiceCategory[] || []
  };
}

export default async function EditServicePage({ params }: EditServicePageProps): Promise<JSX.Element> {
  const { service, categories } = await getServiceData(params.id);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
          <p className="text-muted-foreground mt-2">
            Update details for "{service.title}"
          </p>
        </div>

        <ServiceForm service={service} categories={categories} />
      </div>
    </AdminLayout>
  );
}