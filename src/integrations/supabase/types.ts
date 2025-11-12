export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string | null
          id: string
          last_question_at: string | null
          messages_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_question_at?: string | null
          messages_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_question_at?: string | null
          messages_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_context: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_context?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_context?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lesson_context_fkey"
            columns: ["lesson_context"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          goal_date: string
          id: string
          target_lesson_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_date: string
          id?: string
          target_lesson_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_date?: string
          id?: string
          target_lesson_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_target_lesson_id_fkey"
            columns: ["target_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
          subscribed_at: string | null
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          category: string
          content: Json
          created_at: string | null
          difficulty: string
          duration: number
          emoji: string
          id: string
          lesson_type: string | null
          next_lesson_id: string | null
          order_index: number
          parent_lesson_id: string | null
          priority_boost: number | null
          quiz_required: boolean | null
          seasonal_tags: string[] | null
          title: string
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          category: string
          content: Json
          created_at?: string | null
          difficulty: string
          duration: number
          emoji: string
          id?: string
          lesson_type?: string | null
          next_lesson_id?: string | null
          order_index: number
          parent_lesson_id?: string | null
          priority_boost?: number | null
          quiz_required?: boolean | null
          seasonal_tags?: string[] | null
          title: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string | null
          difficulty?: string
          duration?: number
          emoji?: string
          id?: string
          lesson_type?: string | null
          next_lesson_id?: string | null
          order_index?: number
          parent_lesson_id?: string | null
          priority_boost?: number | null
          quiz_required?: boolean | null
          seasonal_tags?: string[] | null
          title?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_next_lesson_id_fkey"
            columns: ["next_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_parent_lesson_id_fkey"
            columns: ["parent_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_notifications: {
        Row: {
          action_url: string | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          acknowledged: boolean | null
          expires_at: string | null
          id: string
          metadata: Json | null
          milestone_type: string
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type: string
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type?: string
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          accounting_year_end: string | null
          annual_turnover: string | null
          business_goals: string[] | null
          business_start_date: string | null
          business_structure: string | null
          created_at: string | null
          employees_count: string | null
          experience_level: string | null
          has_purchased: boolean | null
          id: string
          industry: string | null
          learning_goal: string | null
          mtd_status: string | null
          newsletter_subscribed: boolean | null
          next_vat_return_due: string | null
          onboarding_completed: boolean | null
          pain_point: string | null
          payment_method: string | null
          preferred_study_time: string | null
          purchased_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          study_days: string[] | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_type: string | null
          time_commitment: string | null
          turnover_last_updated: string | null
          updated_at: string | null
          user_id: string
          vat_registered: boolean | null
          vat_threshold_approaching: boolean | null
          waitlist_joined: boolean | null
          waitlist_joined_at: string | null
        }
        Insert: {
          accounting_year_end?: string | null
          annual_turnover?: string | null
          business_goals?: string[] | null
          business_start_date?: string | null
          business_structure?: string | null
          created_at?: string | null
          employees_count?: string | null
          experience_level?: string | null
          has_purchased?: boolean | null
          id?: string
          industry?: string | null
          learning_goal?: string | null
          mtd_status?: string | null
          newsletter_subscribed?: boolean | null
          next_vat_return_due?: string | null
          onboarding_completed?: boolean | null
          pain_point?: string | null
          payment_method?: string | null
          preferred_study_time?: string | null
          purchased_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          study_days?: string[] | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          time_commitment?: string | null
          turnover_last_updated?: string | null
          updated_at?: string | null
          user_id: string
          vat_registered?: boolean | null
          vat_threshold_approaching?: boolean | null
          waitlist_joined?: boolean | null
          waitlist_joined_at?: string | null
        }
        Update: {
          accounting_year_end?: string | null
          annual_turnover?: string | null
          business_goals?: string[] | null
          business_start_date?: string | null
          business_structure?: string | null
          created_at?: string | null
          employees_count?: string | null
          experience_level?: string | null
          has_purchased?: boolean | null
          id?: string
          industry?: string | null
          learning_goal?: string | null
          mtd_status?: string | null
          newsletter_subscribed?: boolean | null
          next_vat_return_due?: string | null
          onboarding_completed?: boolean | null
          pain_point?: string | null
          payment_method?: string | null
          preferred_study_time?: string | null
          purchased_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          study_days?: string[] | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          time_commitment?: string | null
          turnover_last_updated?: string | null
          updated_at?: string | null
          user_id?: string
          vat_registered?: boolean | null
          vat_threshold_approaching?: boolean | null
          waitlist_joined?: boolean | null
          waitlist_joined_at?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          completion_rate: number | null
          id: string
          lesson_id: string
          notes: string | null
          quiz_attempts: number | null
          quiz_completed_at: string | null
          quiz_score: number | null
          started_at: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_rate?: number | null
          id?: string
          lesson_id: string
          notes?: string | null
          quiz_attempts?: number | null
          quiz_completed_at?: string | null
          quiz_score?: number | null
          started_at?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_rate?: number | null
          id?: string
          lesson_id?: string
          notes?: string | null
          quiz_attempts?: number | null
          quiz_completed_at?: string | null
          quiz_score?: number | null
          started_at?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
