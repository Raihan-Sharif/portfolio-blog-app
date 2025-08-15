'use client';

import { ServicePackage } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, ShoppingCart } from 'lucide-react';

interface ServicePackagesProps {
  packages: ServicePackage[];
  selectedPackageId?: string | null;
  onPackageSelect?: (packageId: string) => void;
}

export default function ServicePackages({ 
  packages, 
  selectedPackageId,
  onPackageSelect 
}: ServicePackagesProps): JSX.Element {
  const sortedPackages = packages
    .filter(pkg => pkg.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const formatPrice = (price: number, priceType: string) => {
    const priceStr = `$${price.toLocaleString()}`;
    switch (priceType) {
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

  const getPackageIcon = (index: number, isPopular: boolean) => {
    if (isPopular) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 0) return <Star className="w-5 h-5 text-blue-500" />;
    if (index === sortedPackages.length - 1) return <Zap className="w-5 h-5 text-purple-500" />;
    return <Check className="w-5 h-5 text-green-500" />;
  };

  const handlePackageSelect = (packageId: string) => {
    if (onPackageSelect) {
      onPackageSelect(packageId);
    }
  };

  const isSelected = (packageId: string) => selectedPackageId === packageId;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedPackages.map((pkg, index) => (
        <Card 
          key={pkg.id} 
          className={`relative cursor-pointer transition-all duration-300 ${
            isSelected(pkg.id)
              ? 'border-2 border-primary shadow-xl scale-105 bg-primary/5'
              : pkg.is_popular 
              ? 'border-2 border-primary/60 shadow-xl scale-105' 
              : 'border hover:border-primary/50 hover:shadow-lg'
          }`}
          onClick={() => handlePackageSelect(pkg.id)}
        >
          {pkg.is_popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg border-2 border-white dark:border-slate-700 px-4 py-1">
                <Crown className="w-3 h-3 mr-1 fill-current" />
                Most Popular
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getPackageIcon(index, pkg.is_popular)}
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(pkg.price, pkg.price_type)}
              </div>
              {pkg.delivery_time && (
                <p className="text-sm text-muted-foreground">
                  Delivered in {pkg.delivery_time}
                </p>
              )}
            </div>
            {pkg.description && (
              <p className="text-muted-foreground text-sm mt-2">
                {pkg.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">What's Included:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Revisions */}
            {pkg.revisions > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Revisions:</span>
                <Badge variant="outline">
                  {pkg.revisions === 999 ? 'Unlimited' : `${pkg.revisions} included`}
                </Badge>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              className={`w-full transition-all duration-300 ${
                isSelected(pkg.id)
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg'
                  : pkg.is_popular 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-primary/10 hover:to-blue-500/10 border-primary/20'
              }`}
              variant={isSelected(pkg.id) || pkg.is_popular ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                handlePackageSelect(pkg.id);
              }}
            >
              {isSelected(pkg.id) ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                `Choose ${pkg.name}`
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}