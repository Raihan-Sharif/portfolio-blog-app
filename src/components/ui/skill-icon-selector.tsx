"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  getAllSkillOptions,
  getSkillCategories,
  getSkillOptionsByCategory,
  getSuggestedSkillOptions,
  getComprehensiveSkillIcon
} from '@/lib/comprehensive-skill-icons';
import { X, Search, Palette, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillIconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  skillName?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function SkillIconSelector({
  value,
  onChange,
  skillName,
  placeholder = "Select an icon...",
  className,
  compact = false
}: SkillIconSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customIcon, setCustomIcon] = useState('');
  const [showSuggested, setShowSuggested] = useState(true);

  const allOptions = useMemo(() => getAllSkillOptions(), []);
  const categories = useMemo(() => getSkillCategories(), []);
  
  const suggestedOptions = useMemo(() => {
    if (!skillName) return [];
    return getSuggestedSkillOptions(skillName);
  }, [skillName]);

  const filteredOptions = useMemo(() => {
    let options = selectedCategory === 'all' 
      ? allOptions 
      : getSkillOptionsByCategory(selectedCategory);
    
    if (search.trim()) {
      options = options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return options;
  }, [allOptions, selectedCategory, search]);

  const selectedOption = allOptions.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
  };

  const handleCustomIconSave = () => {
    if (customIcon.trim()) {
      onChange(customIcon.trim());
      setCustomIcon('');
    }
  };

  const clearSelection = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Skill Icon</Label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-slate-200 dark:border-slate-700"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suggested Icons */}
      {!compact && suggestedOptions.length > 0 && search === '' && selectedCategory === 'all' && showSuggested && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-green-600 dark:text-green-400">
              💡 Suggested for "{skillName}"
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggested(false)}
              className="text-xs h-6"
            >
              Hide
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {suggestedOptions.slice(0, 8).map((option) => (
              <Button
                key={`suggested-${option.value}`}
                type="button"
                variant={value === option.value ? "default" : "outline"}
                onClick={() => handleSelect(option.value)}
                className="h-12 flex flex-col gap-1 p-2 hover:bg-green-50 dark:hover:bg-green-950"
                title={option.label}
              >
                <div className="w-4 h-4 flex items-center justify-center" style={{ color: option.color }}>
                  {option.icon}
                </div>
                <span className="text-xs truncate">{option.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Icon Grid */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {selectedCategory === 'all' ? 'All' : selectedCategory} Icons ({filteredOptions.length})
        </Label>
        
        {filteredOptions.length > 0 ? (
          <div className={`grid ${compact ? 'grid-cols-8 gap-1 max-h-32' : 'grid-cols-6 gap-2 max-h-64'} overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3`}>
            {filteredOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={value === option.value ? "default" : "outline"}
                onClick={() => handleSelect(option.value)}
                className={`${compact ? 'h-8 p-0.5' : 'h-10 p-1'} flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800`}
                title={option.label}
              >
                <div className="w-4 h-4 flex items-center justify-center" style={{ color: option.color }}>
                  {option.icon}
                </div>
                {!compact && <span className="text-xs truncate max-w-full">{option.label.split(' ')[0]}</span>}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-slate-200 dark:border-slate-700 rounded-lg">
            <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">No icons found</p>
            <p className="text-xs text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Custom Icon */}
      <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Custom Icon</Label>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="🚀 or any emoji/text"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            className="flex-1 text-sm border-slate-200 dark:border-slate-700"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCustomIconSave}
            disabled={!customIcon.trim()}
            className="px-3"
          >
            Use
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use any emoji, symbol, or short text as your icon
        </p>
      </div>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="w-6 h-6 flex items-center justify-center">
            {getComprehensiveSkillIcon(value)}
          </div>
          <span className="text-sm font-medium">Preview:</span>
          <span className="text-sm text-muted-foreground">
            {selectedOption?.label || value}
          </span>
          {selectedOption && (
            <Badge variant="outline" className="text-xs">
              {selectedOption.category}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}