'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestServiceTracking() {
  const [serviceSlug, setServiceSlug] = useState('web-development');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/test-service-tracking?action=${action}&slug=${serviceSlug}`);
      const data = await response.json();
      setResults({ ...data, timestamp: new Date().toISOString() });
    } catch (error) {
      setResults({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred', 
        timestamp: new Date().toISOString() 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Service Tracking Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="serviceSlug">Service Slug</Label>
          <Input
            id="serviceSlug"
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            placeholder="web-development"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => testAction('view')} 
            disabled={loading}
          >
            Test View Tracking
          </Button>
          <Button 
            onClick={() => testAction('inquiry')} 
            disabled={loading}
            variant="secondary"
          >
            Test Inquiry Tracking
          </Button>
          <Button 
            onClick={() => testAction('analytics')} 
            disabled={loading}
            variant="outline"
          >
            Test Analytics
          </Button>
          <Button 
            onClick={() => testAction('services')} 
            disabled={loading}
            variant="ghost"
          >
            View Service Counts
          </Button>
        </div>

        {loading && <p>Testing...</p>}

        {results && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}