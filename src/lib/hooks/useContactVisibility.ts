import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ContactVisibilitySettings {
  id: string;
  setting_key: string;
  setting_name: string;
  setting_description?: string;
  is_visible: boolean;
  page_context: 'homepage' | 'contact_page' | 'about_page';
  contact_type: 'phone' | 'whatsapp' | 'email';
  display_order: number;
  is_active: boolean;
}

export interface ContactVisibilityContext {
  homepage: {
    phone: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  contact_page: {
    phone: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  about_page: {
    phone: boolean;
    email: boolean;
  };
}

interface UseContactVisibilityReturn {
  settings: ContactVisibilitySettings[];
  visibility: ContactVisibilityContext;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateVisibility: (settingKey: string, isVisible: boolean) => Promise<void>;
  isPhoneVisible: (page: keyof ContactVisibilityContext) => boolean;
  isWhatsAppVisible: (page: keyof ContactVisibilityContext) => boolean;
  isEmailVisible: (page: keyof ContactVisibilityContext) => boolean;
}

const DEFAULT_VISIBILITY: ContactVisibilityContext = {
  homepage: { phone: true, whatsapp: true, email: true },
  contact_page: { phone: true, whatsapp: true, email: true },
  about_page: { phone: true, email: true },
};

export function useContactVisibility(): UseContactVisibilityReturn {
  const [settings, setSettings] = useState<ContactVisibilitySettings[]>([]);
  const [visibility, setVisibility] = useState<ContactVisibilityContext>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contact_visibility_settings')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (fetchError) throw fetchError;

      setSettings(data || []);
      
      // Convert settings array to visibility context object
      const visibilityContext: ContactVisibilityContext = { ...DEFAULT_VISIBILITY };
      
      (data || []).forEach((setting: ContactVisibilitySettings) => {
        if (setting.page_context === 'homepage') {
          if (setting.contact_type === 'phone') {
            visibilityContext.homepage.phone = setting.is_visible;
          } else if (setting.contact_type === 'whatsapp') {
            visibilityContext.homepage.whatsapp = setting.is_visible;
          } else if (setting.contact_type === 'email') {
            visibilityContext.homepage.email = setting.is_visible;
          }
        } else if (setting.page_context === 'contact_page') {
          if (setting.contact_type === 'phone') {
            visibilityContext.contact_page.phone = setting.is_visible;
          } else if (setting.contact_type === 'whatsapp') {
            visibilityContext.contact_page.whatsapp = setting.is_visible;
          } else if (setting.contact_type === 'email') {
            visibilityContext.contact_page.email = setting.is_visible;
          }
        } else if (setting.page_context === 'about_page') {
          if (setting.contact_type === 'phone') {
            visibilityContext.about_page.phone = setting.is_visible;
          } else if (setting.contact_type === 'email') {
            visibilityContext.about_page.email = setting.is_visible;
          }
        }
      });

      setVisibility(visibilityContext);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact visibility settings');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateVisibility = async (settingKey: string, isVisible: boolean) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('contact_visibility_settings')
        .update({ 
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (updateError) throw updateError;

      // Refetch to update local state
      await fetchSettings();
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility setting');
      throw err;
    }
  };

  // Helper functions for easy checking
  const isPhoneVisible = (page: keyof ContactVisibilityContext): boolean => {
    return visibility[page]?.phone ?? true;
  };

  const isWhatsAppVisible = (page: keyof ContactVisibilityContext): boolean => {
    const pageVisibility = visibility[page];
    return 'whatsapp' in pageVisibility ? pageVisibility.whatsapp : true;
  };

  const isEmailVisible = (page: keyof ContactVisibilityContext): boolean => {
    return visibility[page]?.email ?? true;
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    visibility,
    loading,
    error,
    refetch: fetchSettings,
    updateVisibility,
    isPhoneVisible,
    isWhatsAppVisible,
    isEmailVisible,
  };
}

// Helper function to filter contact info based on visibility settings
export function filterContactsByVisibility(
  contacts: any[], 
  page: keyof ContactVisibilityContext,
  visibility: ContactVisibilityContext
): any[] {
  return contacts.filter((contact) => {
    if (contact.type === 'phone') {
      const pageVisibility = visibility[page];
      // Check if this is a WhatsApp number
      if (contact.is_whatsapp) {
        return 'whatsapp' in pageVisibility ? pageVisibility.whatsapp : true;
      } else {
        return pageVisibility?.phone ?? true;
      }
    } else if (contact.type === 'email') {
      return visibility[page]?.email ?? true;
    }
    // For other contact types (address, social, website), always show
    return true;
  });
}

// Helper function for about page email/phone filtering
export function shouldShowContactInAbout(
  contactType: 'email' | 'phone',
  visibility: ContactVisibilityContext
): boolean {
  if (contactType === 'email') {
    return visibility.about_page?.email ?? true;
  } else if (contactType === 'phone') {
    return visibility.about_page?.phone ?? true;
  }
  return true;
}