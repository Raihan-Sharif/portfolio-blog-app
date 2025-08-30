'use client';

import { useState, useRef } from 'react';
import ReCAPTCHAComponent, { ReCAPTCHAV3Ref } from '@/components/ui/recaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRecaptchaPage() {
  const [token, setToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHAV3Ref>(null);

  const handleTestToken = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          action: 'test_action' 
        })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualExecute = async () => {
    if (recaptchaRef.current) {
      const newToken = await recaptchaRef.current.execute();
      setToken(newToken);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">reCAPTCHA v3 Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Auto-Execute Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ReCAPTCHAComponent
              ref={recaptchaRef}
              onVerify={setToken}
              onError={() => setToken(null)}
              action="test_action"
              autoExecute={true}
            />
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Token Status:</p>
              <div className="p-2 bg-muted rounded text-xs break-all">
                {token ? `Token received: ${token.substring(0, 50)}...` : 'No token yet'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Execute Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleManualExecute}
              disabled={isLoading}
              className="mb-4"
            >
              Execute reCAPTCHA Manually
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestToken}
              disabled={!token || isLoading}
              className="mb-4"
            >
              {isLoading ? 'Testing...' : 'Test Token Verification'}
            </Button>
            
            {testResult && (
              <div className="p-4 bg-muted rounded">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}