'use client';

import { useEffect } from 'react';

interface ServiceViewTrackerProps {
  serviceId: string;
  serviceSlug: string;
}

export default function ServiceViewTracker({ 
  serviceId, 
  serviceSlug 
}: ServiceViewTrackerProps): JSX.Element | null {
  
  useEffect(() => {
    const trackView = async () => {
      try {
        // Track the service view
        const response = await fetch('/api/services/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId,
            serviceSlug
          })
        });

        if (!response.ok) {
          console.warn('Failed to track service view:', response.status);
        } else {
          const result = await response.json();
          console.log('Service view tracked:', result);
        }
      } catch (error) {
        console.warn('Error tracking service view:', error);
      }
    };

    // Track view after a short delay to ensure page is loaded
    const timeout = setTimeout(trackView, 1000);

    return () => clearTimeout(timeout);
  }, [serviceId, serviceSlug]);

  // This component renders nothing
  return null;
}