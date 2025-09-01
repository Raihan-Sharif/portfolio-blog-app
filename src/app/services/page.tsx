import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ServiceCategory, Service } from '@/types/services';
import ServicesGrid from '@/components/services/services-grid';
import ServicesHero from '@/components/services/services-hero';
import ServicesCTA from '@/components/services/services-cta';
import { Metadata } from 'next';
import { Star, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Development Services | Portfolio',
  description: 'Discover our comprehensive range of web development, mobile app development, UI/UX design, and consulting services. Let\'s build something amazing together.',
  keywords: 'web development, mobile apps, UI UX design, consulting, portfolio services',
  openGraph: {
    title: 'Professional Development Services',
    description: 'Transform your ideas into digital reality with our expert development services',
    type: 'website'
  }
};

interface ServicesPageProps {
  searchParams: {
    category?: string;
    featured?: string;
    search?: string;
  };
}

async function getServicesData() {
  const supabase = createServerSupabaseClient();

  const [categoriesResult, servicesResult] = await Promise.all([
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    
    supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
  ]);

  return {
    categories: categoriesResult.data as ServiceCategory[] || [],
    services: servicesResult.data as Service[] || []
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps): Promise<JSX.Element> {
  const { categories, services } = await getServicesData();

  const featuredServices = services.filter(service => service.is_featured);
  const popularServices = services.filter(service => service.is_popular);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-blue-50/30 dark:from-slate-900/50 dark:via-slate-800 dark:to-blue-950/30">
      <ServicesHero />
      
      <div className="container mx-auto px-4 py-20 space-y-24">
        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <section className="space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4 text-primary" />
                Featured
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Featured Services
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Our most popular and comprehensive service offerings designed to transform your business
              </p>
            </div>
            <ServicesGrid 
              services={featuredServices} 
              categories={categories}
              variant="featured"
            />
          </section>
        )}

        {/* All Services */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              All Services
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore our complete range of professional development services tailored to your needs
            </p>
          </div>
          <ServicesGrid 
            services={services} 
            categories={categories}
            searchParams={searchParams}
            showFilters={true}
          />
        </section>

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <section className="space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4 text-green-600" />
                Popular Choice
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Popular Services
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Most requested services by our clients - proven solutions that deliver results
              </p>
            </div>
            <ServicesGrid 
              services={popularServices} 
              categories={categories}
              variant="compact"
            />
          </section>
        )}
      </div>

      <ServicesCTA />
    </div>
  );
}