'use client';

import { useLeadGeneration } from '@/hooks/use-lead-generation';
import LeadMagnetPopup from './lead-magnet-popup';

interface LeadGenerationProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  scrollTrigger?: number;
  timeTrigger?: number;
  exitIntentEnabled?: boolean;
}

export default function LeadGenerationProvider({
  children,
  enabled = true,
  scrollTrigger = 70,
  timeTrigger = 45,
  exitIntentEnabled = true
}: LeadGenerationProviderProps): JSX.Element {
  const { isPopupOpen, trigger, closePopup } = useLeadGeneration({
    scrollTrigger,
    timeTrigger,
    exitIntentEnabled,
    cookieExpiration: 7
  });

  return (
    <>
      {children}
      {enabled && (
        <LeadMagnetPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          trigger={trigger}
        />
      )}
    </>
  );
}