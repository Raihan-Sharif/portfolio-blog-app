'use client';

import { ServiceCategory } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ServiceFiltersProps {
  categories: ServiceCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function ServiceFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  allTags,
  selectedTags,
  onTagsChange,
}: ServiceFiltersProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange('');
    onPriceRangeChange([0, 10000]);
    onTagsChange([]);
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000 || selectedTags.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-center gap-4 mb-6">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  selectedCategory ? 1 : 0,
                  priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0,
                  selectedTags.length
                ].reduce((a, b) => a + b)}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <Card className="border-dashed">
          <CardContent className="p-6 space-y-8">
            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange('')}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(
                      selectedCategory === category.id ? '' : category.id
                    )}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color || undefined : undefined,
                      borderColor: category.color || undefined,
                      color: selectedCategory === category.id ? 'white' : category.color || undefined
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Price Range</h4>
              <div className="px-4 py-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}+</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Technologies & Skills</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}