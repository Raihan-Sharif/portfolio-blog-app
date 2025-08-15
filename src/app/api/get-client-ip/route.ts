import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client IP from various possible headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    const remoteAddress = request.headers.get('x-forwarded-for')?.split(',')[0];
    
    // Priority order for IP detection
    const clientIP = 
      cfConnectingIP || // Cloudflare
      realIP || // Nginx
      forwarded?.split(',')[0] || // Load balancer
      remoteAddress || // Generic
      request.ip || // Next.js
      '127.0.0.1'; // Fallback

    // Clean up the IP (remove port if present)
    const cleanIP = clientIP.trim().replace(/^::ffff:/, '');

    return NextResponse.json(
      { 
        ip: cleanIP,
        source: cfConnectingIP ? 'cloudflare' : 
                realIP ? 'nginx' : 
                forwarded ? 'forwarded' : 
                'fallback'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  } catch (error) {
    console.error('Error getting client IP:', error);
    
    return NextResponse.json(
      { 
        ip: '127.0.0.1',
        source: 'error-fallback',
        error: 'Could not determine IP'
      },
      { status: 200 } // Still return 200 with fallback IP
    );
  }
}