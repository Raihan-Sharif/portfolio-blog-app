'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LeadMagnet } from '@/types/newsletter';

export function useLeadMagnets() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchLeadMagnets = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setLeadMagnets(data || []);
    } catch (err) {
      console.error('Error fetching lead magnets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lead magnets');
      setLeadMagnets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadMagnets();
  }, []);

  return {
    leadMagnets,
    loading,
    error,
    refetch: fetchLeadMagnets
  };
}