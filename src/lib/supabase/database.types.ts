export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      card_states: {
        Row: {
          card_id: string
          consecutive_again_count: number
          created_at: string
          due_at: string
          ease: number
          interval_days: number
          last_reviewed_at: string | null
          profile_id: string
          status: Database["public"]["Enums"]["srs_card_status"]
          updated_at: string
        }
        Insert: {
          card_id: string
          consecutive_again_count?: number
          created_at?: string
          due_at: string
          ease?: number
          interval_days?: number
          last_reviewed_at?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["srs_card_status"]
          updated_at?: string
        }
        Update: {
          card_id?: string
          consecutive_again_count?: number
          created_at?: string
          due_at?: string
          ease?: number
          interval_days?: number
          last_reviewed_at?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["srs_card_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_states_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          country: string
          created_at: string
          id: string
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consent_analytics: boolean
          consent_analytics_updated_at: string | null
          consent_privacy_accepted_at: string | null
          consent_terms_accepted_at: string | null
          created_at: string
          deletion_requested_at: string | null
          full_name: string | null
          guardian_email: string | null
          id: string
          institution_id: string | null
          is_admin: boolean
          is_minor: boolean | null
          updated_at: string
          year_of_study: number | null
        }
        Insert: {
          consent_analytics?: boolean
          consent_analytics_updated_at?: string | null
          consent_privacy_accepted_at?: string | null
          consent_terms_accepted_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          full_name?: string | null
          guardian_email?: string | null
          id: string
          institution_id?: string | null
          is_admin?: boolean
          is_minor?: boolean | null
          updated_at?: string
          year_of_study?: number | null
        }
        Update: {
          consent_analytics?: boolean
          consent_analytics_updated_at?: string | null
          consent_privacy_accepted_at?: string | null
          consent_terms_accepted_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          full_name?: string | null
          guardian_email?: string | null
          id?: string
          institution_id?: string | null
          is_admin?: boolean
          is_minor?: boolean | null
          updated_at?: string
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          card_id: string
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["content_flag_status"]
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["content_flag_status"]
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["content_flag_status"]
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          card_id: string
          created_at: string
          hints_used: number
          id: string
          profile_id: string
          rating: Database["public"]["Enums"]["srs_rating"]
          self_explanation: string | null
          session_id: string | null
          time_spent_seconds: number
        }
        Insert: {
          card_id: string
          created_at?: string
          hints_used?: number
          id?: string
          profile_id: string
          rating: Database["public"]["Enums"]["srs_rating"]
          self_explanation?: string | null
          session_id?: string | null
          time_spent_seconds?: number
        }
        Update: {
          card_id?: string
          created_at?: string
          hints_used?: number
          id?: string
          profile_id?: string
          rating?: Database["public"]["Enums"]["srs_rating"]
          self_explanation?: string | null
          session_id?: string | null
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          cards_correct: number
          cards_seen: number
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          profile_id: string
          started_at: string
          status: Database["public"]["Enums"]["study_session_status"]
          system_slug: string | null
          updated_at: string
        }
        Insert: {
          cards_correct?: number
          cards_seen?: number
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          profile_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["study_session_status"]
          system_slug?: string | null
          updated_at?: string
        }
        Update: {
          cards_correct?: number
          cards_seen?: number
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          profile_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["study_session_status"]
          system_slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          profile_id: string
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_flag_status: "open" | "resolved" | "rejected"
      srs_card_status: "learning" | "review" | "leech" | "suspended"
      srs_rating: "again" | "hard" | "good" | "easy"
      study_session_status: "active" | "completed" | "abandoned"
      subscription_status: "active" | "past_due" | "cancelled" | "expired"
      subscription_tier: "free" | "pilot" | "student" | "institution"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_flag_status: ["open", "resolved", "rejected"],
      srs_card_status: ["learning", "review", "leech", "suspended"],
      srs_rating: ["again", "hard", "good", "easy"],
      study_session_status: ["active", "completed", "abandoned"],
      subscription_status: ["active", "past_due", "cancelled", "expired"],
      subscription_tier: ["free", "pilot", "student", "institution"],
    },
  },
} as const

