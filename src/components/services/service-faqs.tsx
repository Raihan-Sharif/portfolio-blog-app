'use client';

import { useState } from 'react';
import { ServiceFAQ } from '@/types/services';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ServiceFAQsProps {
  faqs: ServiceFAQ[];
}

export default function ServiceFAQs({ faqs }: ServiceFAQsProps): JSX.Element {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const activeFAQs = faqs
    .filter(faq => faq.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (activeFAQs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            No FAQs available for this service yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeFAQs.map((faq) => {
        const isOpen = openItems.has(faq.id);
        
        return (
          <Card key={faq.id} className="overflow-hidden">
            <Collapsible open={isOpen} onOpenChange={() => toggleItem(faq.id)}>
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 text-left flex-1">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <h3 className="font-semibold text-foreground leading-relaxed">
                        {faq.question}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="pl-8 border-l-2 border-primary/20 ml-1">
                    <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}