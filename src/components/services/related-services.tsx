'use client';

import { Service } from '@/types/services';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, DollarSign, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RelatedServicesProps {
  services: Partial<Service>[];
}

export default function RelatedServices({ services }: RelatedServicesProps): JSX.Element {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Service Image */}
          {service.image_url && (
            <div className="relative h-40 overflow-hidden">
              <Image
                src={service.image_url}
                alt={service.title || ''}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {service.is_popular && (
                  <Badge variant="secondary" className="bg-accent/90 text-accent-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="absolute bottom-3 right-3">
                <Badge variant="outline" className="bg-background/90 text-foreground">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {formatPrice(service.price_from || null, service.price_to || null, service.price_type || 'fixed', service.show_price ?? true)}
                </Badge>
              </div>
            </div>
          )}

          <CardContent className="p-4 space-y-3">
            {/* Category */}
            {service.category && (
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: service.category.color || '#6B7280',
                  color: service.category.color || '#6B7280'
                }}
                className="text-xs"
              >
                {service.category.name}
              </Badge>
            )}

            {/* Title */}
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {service.short_description}
            </p>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
            >
              <Link href={`/services/${service.slug}`} className="flex items-center justify-center gap-2">
                Learn More
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}