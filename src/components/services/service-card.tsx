'use client';

import { useState } from 'react';
import { Service } from '@/types/services';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, DollarSign, Eye, Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ServiceCard({ service, variant = 'default' }: ServiceCardProps): JSX.Element {
  const [expandedSection, setExpandedSection] = useState<'features' | 'tags' | null>(null);

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

  const cardClassName = variant === 'featured' 
    ? 'group bg-gradient-to-br from-card via-card to-primary/5 border-2 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden'
    : variant === 'compact'
    ? 'group bg-card hover:bg-card/80 border hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden'
    : 'group bg-card hover:bg-card/80 border-2 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-400 overflow-hidden';

  return (
    <Card className={cardClassName}>
      {/* Service Image */}
      {service.image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
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

          {/* Price on image */}
          <div className="absolute bottom-4 right-4">
            <Badge variant="outline" className="bg-background/90 text-foreground border-border">
              <DollarSign className="w-3 h-3 mr-1" />
              {formatPrice(service.price_from, service.price_to, service.price_type, service.show_price)}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        {/* Service Category */}
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

        {/* Service Title */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {service.title}
          </h3>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {service.short_description || service.description}
          </p>
        </div>

        {/* Service Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Key Features:</h4>
            <ul className="text-sm space-y-1">
              {(expandedSection === 'features' ? service.features : service.features.slice(0, 3)).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {service.features.length > 3 && (
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedSection(expandedSection === 'features' ? null : 'features');
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {expandedSection === 'features' ? (
                      <>
                        <ChevronUp className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        +{service.features.length - 3} more features
                      </>
                    )}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Service Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          {service.delivery_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.delivery_time}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{service.view_count} views</span>
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(expandedSection === 'tags' ? service.tags : service.tags.slice(0, 3)).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpandedSection(expandedSection === 'tags' ? null : 'tags');
                }}
                className="hover:scale-105 transition-transform duration-200"
              >
                <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                  {expandedSection === 'tags' ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      +{service.tags.length - 3} more
                    </>
                  )}
                </Badge>
              </button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          asChild 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
        >
          <Link href={`/services/${service.slug}`} className="flex items-center justify-center gap-2">
            Learn More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}