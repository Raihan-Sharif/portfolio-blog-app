import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ServiceWithRelations } from '@/types/services';
import ServiceDetailPage from '@/components/services/service-detail-page';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ServiceDetailProps {
  params: {
    slug: string;
  };
}

async function getServiceData(slug: string): Promise<ServiceWithRelations | null> {
  const supabase = createServerSupabaseClient();

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*),
      packages:service_packages(*),
      testimonials:service_testimonials!service_testimonials_service_id_fkey(
        *
      ),
      faqs:service_faqs!service_faqs_service_id_fkey(
        *
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'active')
    .eq('packages.is_active', true)
    .eq('testimonials.is_approved', true)
    .eq('faqs.is_active', true)
    .order('sort_order', { referencedTable: 'service_packages', ascending: true })
    .order('display_order', { referencedTable: 'service_testimonials', ascending: true })
    .order('sort_order', { referencedTable: 'service_faqs', ascending: true })
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    return null;
  }

  return service as ServiceWithRelations;
}

export async function generateMetadata({ params }: ServiceDetailProps): Promise<Metadata> {
  const service = await getServiceData(params.slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const title = service.seo_title || `${service.title} - Professional Services`;
  const description = service.seo_description || service.short_description || service.description;

  return {
    title,
    description,
    keywords: service.meta_keywords || service.tags.join(', '),
    openGraph: {
      title,
      description,
      type: 'article',
      images: service.image_url ? [{ url: service.image_url }] : undefined,
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetail({ params }: ServiceDetailProps): Promise<JSX.Element> {
  const service = await getServiceData(params.slug);

  if (!service) {
    notFound();
  }

  // Get related services
  const supabase = createServerSupabaseClient();
  const { data: relatedServices } = await supabase
    .from('services')
    .select(`
      id,
      title,
      short_description,
      slug,
      image_url,
      price_from,
      price_to,
      price_type,
      is_popular
    `)
    .eq('is_active', true)
    .eq('status', 'active')
    .eq('category_id', service.category_id)
    .neq('id', service.id)
    .limit(3);

  return (
    <ServiceDetailPage 
      service={service} 
      relatedServices={relatedServices || []} 
    />
  );
}