// src/lib/supabase/database.types.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: number;
          user_id: string;
          role_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          role_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          role_id?: number;
          created_at?: string;
        };
      };
      online_users: {
        Row: {
          id: number;
          user_id: string | null;
          session_id: string;
          ip_address: string | null;
          user_agent: string | null;
          page_url: string | null;
          is_authenticated: boolean;
          last_activity: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          session_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          page_url?: string | null;
          is_authenticated?: boolean;
          last_activity?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          session_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          page_url?: string | null;
          is_authenticated?: boolean;
          last_activity?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_with_role: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          user_id: string;
          role_name: string;
        }[];
      };
      upsert_user_role: {
        Args: {
          p_user_id: string;
          p_role_id: number;
        };
        Returns: boolean;
      };
      delete_user_safely: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      cleanup_online_users: {
        Args: {};
        Returns: void;
      };
      get_online_users_count: {
        Args: {};
        Returns: {
          authenticated_count: number;
          total_count: number;
        }[];
      };
      mark_notification_read: {
        Args: {
          p_notification_id: number;
          p_user_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
