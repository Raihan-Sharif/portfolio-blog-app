'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ServicesCTA(): JSX.Element {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready to Start Your
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {' '}Next Project?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Let's discuss your ideas and turn them into reality. 
              Get a free consultation and project quote today.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-105"
            >
              <Link href="/contact" className="flex items-center gap-2">
                Get Free Consultation
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-primary/20 hover:bg-primary/10 px-8 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 group"
            >
              <Link href="tel:+1234567890" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Free Consultation</h3>
              <p className="text-muted-foreground">
                No-obligation discussion about your project requirements and goals.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Quick Response</h3>
              <p className="text-muted-foreground">
                Get a detailed project proposal within 24-48 hours.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Direct Communication</h3>
              <p className="text-muted-foreground">
                Work directly with experienced developers, no middlemen.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 border-t border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24hr</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}