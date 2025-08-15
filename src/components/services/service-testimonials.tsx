'use client';

import { ServiceTestimonial } from '@/types/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

interface ServiceTestimonialsProps {
  testimonials: ServiceTestimonial[];
}

export default function ServiceTestimonials({ testimonials }: ServiceTestimonialsProps): JSX.Element {
  const approvedTestimonials = testimonials
    .filter(testimonial => testimonial.is_approved)
    .sort((a, b) => a.display_order - b.display_order);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {approvedTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="relative overflow-hidden">
          {/* Quote decoration */}
          <div className="absolute top-4 right-4 opacity-10">
            <Quote className="w-12 h-12 text-primary" />
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {renderStars(testimonial.rating)}
            </div>

            {/* Testimonial text */}
            <blockquote className="text-lg leading-relaxed italic">
              "{testimonial.testimonial}"
            </blockquote>

            {/* Client info */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              {/* Client image */}
              {testimonial.client_image_url ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.client_image_url}
                    alt={testimonial.client_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.client_name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Client details */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  {testimonial.client_name}
                </div>
                {testimonial.client_title && (
                  <div className="text-sm text-muted-foreground">
                    {testimonial.client_title}
                    {testimonial.client_company && (
                      <span> at {testimonial.client_company}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Featured badge */}
              {testimonial.is_featured && (
                <Badge variant="secondary" className="ml-auto">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Project info */}
            {(testimonial.project_title || testimonial.project_url) && (
              <div className="pt-2">
                {testimonial.project_title && (
                  <div className="text-sm font-medium text-muted-foreground">
                    Project: {testimonial.project_title}
                  </div>
                )}
                {testimonial.project_url && (
                  <a
                    href={testimonial.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View Project →
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}