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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      exam_events: {
        Row: {
          audience: string
          created_at: string
          ends_at: string | null
          id: string
          institution_id: string | null
          kind: string
          notes: string | null
          organ_systems: string[]
          owner_id: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          audience: string
          created_at?: string
          ends_at?: string | null
          id?: string
          institution_id?: string | null
          kind: string
          notes?: string | null
          organ_systems?: string[]
          owner_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          institution_id?: string | null
          kind?: string
          notes?: string | null
          organ_systems?: string[]
          owner_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_events_owner_id_fkey"
            columns: ["owner_id"]
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
          address: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          consent_analytics: boolean
          consent_analytics_updated_at: string | null
          consent_privacy_accepted_at: string | null
          consent_terms_accepted_at: string | null
          created_at: string
          date_of_birth: string | null
          deletion_requested_at: string | null
          full_name: string | null
          guardian_email: string | null
          id: string
          institution_id: string | null
          is_admin: boolean
          is_faculty: boolean
          is_minor: boolean | null
          phone: string | null
          roll_number: string | null
          study_systems: string[]
          updated_at: string
          year_of_study: number | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          consent_analytics?: boolean
          consent_analytics_updated_at?: string | null
          consent_privacy_accepted_at?: string | null
          consent_terms_accepted_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          deletion_requested_at?: string | null
          full_name?: string | null
          guardian_email?: string | null
          id: string
          institution_id?: string | null
          is_admin?: boolean
          is_faculty?: boolean
          is_minor?: boolean | null
          phone?: string | null
          roll_number?: string | null
          study_systems?: string[]
          updated_at?: string
          year_of_study?: number | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          consent_analytics?: boolean
          consent_analytics_updated_at?: string | null
          consent_privacy_accepted_at?: string | null
          consent_terms_accepted_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          deletion_requested_at?: string | null
          full_name?: string | null
          guardian_email?: string | null
          id?: string
          institution_id?: string | null
          is_admin?: boolean
          is_faculty?: boolean
          is_minor?: boolean | null
          phone?: string | null
          roll_number?: string | null
          study_systems?: string[]
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
      content_mechanisms: {
        Row: {
          created_at: string
          id: string
          markdown: string
          status: Database["public"]["Enums"]["content_mechanism_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id: string
          markdown: string
          status?: Database["public"]["Enums"]["content_mechanism_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          markdown?: string
          status?: Database["public"]["Enums"]["content_mechanism_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_mechanisms_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      rate_limits: {
        Row: {
          count: number
          key: string
          profile_id: string
          updated_at: string
          window_date: string
        }
        Insert: {
          count?: number
          key: string
          profile_id: string
          updated_at?: string
          window_date?: string
        }
        Update: {
          count?: number
          key?: string
          profile_id?: string
          updated_at?: string
          window_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_profile_id_fkey"
            columns: ["profile_id"]
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
      enforce_rate_limit: {
        Args: {
          p_profile_id: string
          p_key: string
          p_max_per_day: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          total_today: number
        }[]
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_approved: { Args: never; Returns: boolean }
      is_current_user_faculty: { Args: never; Returns: boolean }
      current_user_institution_id: { Args: never; Returns: string | null }
      can_view_cohort: { Args: { p_institution_id: string }; Returns: boolean }
      cohort_class_roster: {
        Args: { p_institution_id: string }
        Returns: {
          profile_id: string
          full_name: string | null
          year_of_study: number | null
          reviews_total: number
          reviews_last_7d: number
          retention_pct_30d: number | null
          last_review_at: string | null
        }[]
      }
      cohort_card_aggregates: {
        Args: { p_institution_id: string }
        Returns: {
          card_id: string
          reviews_total: number
          reviews_last_30d: number
          retention_pct_30d: number | null
          unique_learners: number
        }[]
      }
    }
    Enums: {
      content_flag_status: "open" | "resolved" | "rejected"
      content_mechanism_status: "draft" | "review" | "published" | "retired"
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
      content_mechanism_status: ["draft", "review", "published", "retired"],
      srs_card_status: ["learning", "review", "leech", "suspended"],
      srs_rating: ["again", "hard", "good", "easy"],
      study_session_status: ["active", "completed", "abandoned"],
      subscription_status: ["active", "past_due", "cancelled", "expired"],
      subscription_tier: ["free", "pilot", "student", "institution"],
    },
  },
} as const

