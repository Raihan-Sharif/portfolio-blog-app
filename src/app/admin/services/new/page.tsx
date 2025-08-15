import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types/services';
import AdminLayout from '@/components/admin/admin-layout';
import ServiceForm from '@/components/admin/services/service-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Service | Admin Dashboard',
  description: 'Create a new service offering',
};

async function getFormData() {
  const supabase = createServerSupabaseClient();

  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return {
    categories: categories as ServiceCategory[] || []
  };
}

export default async function NewServicePage(): Promise<JSX.Element> {
  const { categories } = await getFormData();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Service</h1>
          <p className="text-muted-foreground mt-2">
            Add a new service to your portfolio
          </p>
        </div>

        <ServiceForm categories={categories} />
      </div>
    </AdminLayout>
  );
}