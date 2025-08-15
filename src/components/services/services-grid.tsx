'use client';

import { useState, useMemo } from 'react';
import { Service, ServiceCategory } from '@/types/services';
import ServiceCard from './service-card';
import ServiceFilters from './service-filters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ServicesGridProps {
  services: Service[];
  categories: ServiceCategory[];
  searchParams?: {
    category?: string;
    featured?: string;
    search?: string;
  };
  showFilters?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ServicesGrid({ 
  services, 
  categories, 
  searchParams, 
  showFilters = false,
  variant = 'default'
}: ServicesGridProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.category || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredServices = useMemo(() => {
    let filtered = services;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.short_description?.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category_id === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(service => {
      if (!service.price_from) return true;
      return service.price_from >= priceRange[0] && service.price_from <= priceRange[1];
    });

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(service => 
        selectedTags.every(tag => service.tags.includes(tag))
      );
    }

    return filtered;
  }, [services, searchQuery, selectedCategory, priceRange, selectedTags]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    services.forEach(service => {
      service.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [services]);

  const gridClassName = variant === 'compact' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : variant === 'featured'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

  return (
    <div className="space-y-8" id="services">
      {showFilters && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg rounded-xl border-2 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filters */}
          <ServiceFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>
      )}

      {/* Results count */}
      {showFilters && (
        <div className="text-center">
          <p className="text-muted-foreground">
            {filteredServices.length === services.length 
              ? `Showing all ${services.length} services`
              : `Showing ${filteredServices.length} of ${services.length} services`
            }
          </p>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className={gridClassName}>
          {filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold">No services found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search criteria or browse all services to find what you're looking for.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}