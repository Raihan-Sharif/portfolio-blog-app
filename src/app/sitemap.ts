import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourportfolio.com';

  // Static pages with high priority
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    // Dynamic routes - Blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const blogRoutes: MetadataRoute.Sitemap = blogPosts?.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || [];

    // Dynamic routes - Projects
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    const projectRoutes: MetadataRoute.Sitemap = projects?.map((project: any) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })) || [];

    // Dynamic routes - Services
    const { data: services } = await supabase
      .from('services')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    const serviceRoutes: MetadataRoute.Sitemap = services?.map((service: any) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: new Date(service.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

    return [...staticRoutes, ...blogRoutes, ...projectRoutes, ...serviceRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if dynamic content fails
    return staticRoutes;
  }
}