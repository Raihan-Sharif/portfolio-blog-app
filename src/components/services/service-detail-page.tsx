'use client';

import { useState } from 'react';
import { ServiceWithRelations, Service } from '@/types/services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceInquiryForm from './service-inquiry-form';
import ServicePackages from './service-packages';
import ServiceTestimonials from './service-testimonials';
import ServiceFAQs from './service-faqs';
import RelatedServices from './related-services';
import ServiceViewTracker from './service-view-tracker';
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Eye, 
  MessageCircle, 
  Star, 
  Zap,
  CheckCircle,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceDetailPageProps {
  service: ServiceWithRelations;
  relatedServices: Partial<Service>[];
}

export default function ServiceDetailPage({ 
  service, 
  relatedServices 
}: ServiceDetailPageProps): JSX.Element {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    // Scroll to inquiry form
    const inquirySection = document.getElementById('inquiry');
    if (inquirySection) {
      inquirySection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const formatPrice = (priceFrom: number | null, priceTo: number | null, priceType: string, showPrice: boolean = true) => {
    if (!showPrice) return 'Contact for pricing';
    if (!priceFrom) return 'Contact for pricing';
    
    if (priceTo && priceTo > priceFrom) {
      return `৳${priceFrom.toLocaleString()} - ৳${priceTo.toLocaleString()}`;
    }
    
    const priceStr = `৳${priceFrom.toLocaleString()}`;
    switch (priceType) {
      case 'fixed':
        return priceStr;
      case 'hourly':
        return `${priceStr}/hr`;
      case 'project':
        return `Starting at ${priceStr}`;
      case 'negotiable':
        return `From ${priceStr}`;
      default:
        return priceStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* Service View Tracker - tracks views automatically */}
      <ServiceViewTracker 
        serviceId={service.id} 
        serviceSlug={service.slug} 
      />
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/services" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Service Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {service.category && (
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: service.category.color || '#6B7280',
                      color: service.category.color || '#6B7280'
                    }}
                  >
                    {service.category.name}
                  </Badge>
                )}
                {service.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {service.is_popular && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {service.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {service.short_description || service.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {formatPrice(service.price_from, service.price_to, service.price_type, service.show_price)}
                  </span>
                </div>
                {service.delivery_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{service.delivery_time}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{service.view_count} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>{service.inquiry_count} inquiries</span>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 py-6 rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group font-semibold text-lg">
                  <Link href="#inquiry" className="flex items-center gap-2 relative z-10">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    Get Started Today
                    <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Service Image */}
            {service.image_url && (
              <div className="relative">
                <div className="relative h-80 lg:h-96 overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="process">Process</TabsTrigger>
                <TabsTrigger value="tech">Technology</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Description */}
                <Card>
                  <CardContent className="p-8">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg leading-relaxed">{service.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requirements */}
                {service.requirements && service.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {service.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2.5" />
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="process" className="space-y-8">
                {service.process_steps && service.process_steps.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Our Process
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {service.process_steps.map((step, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Process details will be discussed during consultation
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tech" className="space-y-8">
                {service.tech_stack && service.tech_stack.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-primary" />
                        Technology Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {service.tech_stack.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-base py-2 px-4">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Technology stack will be tailored to your project needs
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="faq">
                {service.faqs && service.faqs.length > 0 ? (
                  <ServiceFAQs faqs={service.faqs} />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground mb-4">
                        No FAQs available yet
                      </p>
                      <Button asChild>
                        <Link href="#inquiry">Ask a Question</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Packages */}
            {service.packages && service.packages.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Service Packages</h2>
                <p className="text-lg text-muted-foreground">
                  Choose the package that best fits your needs. Selection will automatically update the inquiry form.
                </p>
                <ServicePackages 
                  packages={service.packages} 
                  selectedPackageId={selectedPackageId}
                  onPackageSelect={handlePackageSelect}
                />
              </div>
            )}

            {/* Testimonials */}
            {service.testimonials && service.testimonials.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Client Testimonials</h2>
                <ServiceTestimonials testimonials={service.testimonials} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Inquiry Form */}
            <div id="inquiry">
              <ServiceInquiryForm 
                service={service} 
                selectedPackageId={selectedPackageId}
              />
            </div>

            {/* Service Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Service Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Views</span>
                  <span className="font-semibold">{service.view_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inquiries</span>
                  <span className="font-semibold">{service.inquiry_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty</span>
                  <Badge variant="outline">{service.difficulty_level}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-20 space-y-8">
            <h2 className="text-3xl font-bold text-center">Related Services</h2>
            <RelatedServices services={relatedServices} />
          </div>
        )}
      </section>
    </div>
  );
}