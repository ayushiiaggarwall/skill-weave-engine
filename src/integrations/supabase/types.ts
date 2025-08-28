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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          cohort_id: string | null
          course_id: string | null
          created_at: string
          id: string
          title: string
        }
        Insert: {
          body: string
          cohort_id?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          body?: string
          cohort_id?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          instructions: string | null
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          created_at: string
          credential_id_prefix: string
          description: string | null
          id: string
          is_locked: boolean
          title: string
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          created_at?: string
          credential_id_prefix?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          created_at?: string
          credential_id_prefix?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          type: Database["public"]["Enums"]["coupon_type"]
          value: number
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          type: Database["public"]["Enums"]["coupon_type"]
          value: number
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          type?: Database["public"]["Enums"]["coupon_type"]
          value?: number
        }
        Relationships: []
      }
      course_content: {
        Row: {
          content_type: string
          content_url: string | null
          course_id: string
          created_at: string
          created_by: string
          description: string | null
          file_name: string | null
          file_size: number | null
          id: string
          is_visible: boolean
          title: string
          updated_at: string
          week_number: number
        }
        Insert: {
          content_type: string
          content_url?: string | null
          course_id: string
          created_at?: string
          created_by: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_visible?: boolean
          title: string
          updated_at?: string
          week_number: number
        }
        Update: {
          content_type?: string
          content_url?: string | null
          course_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_visible?: boolean
          title?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: []
      }
      course_pricing: {
        Row: {
          course_id: string
          created_at: string
          early_bird_end_date: string | null
          id: string
          inr_early_bird: number
          inr_mrp: number
          inr_regular: number
          is_early_bird_active: boolean | null
          updated_at: string
          usd_early_bird: number
          usd_mrp: number
          usd_regular: number
        }
        Insert: {
          course_id: string
          created_at?: string
          early_bird_end_date?: string | null
          id?: string
          inr_early_bird: number
          inr_mrp: number
          inr_regular: number
          is_early_bird_active?: boolean | null
          updated_at?: string
          usd_early_bird: number
          usd_mrp: number
          usd_regular: number
        }
        Update: {
          course_id?: string
          created_at?: string
          early_bird_end_date?: string | null
          id?: string
          inr_early_bird?: number
          inr_mrp?: number
          inr_regular?: number
          is_early_bird_active?: boolean | null
          updated_at?: string
          usd_early_bird?: number
          usd_mrp?: number
          usd_regular?: number
        }
        Relationships: []
      }
      course_weeks: {
        Row: {
          content: string
          course_id: string
          created_at: string
          deliverables: string[] | null
          id: string
          mini_project: string | null
          objective: string
          title: string
          updated_at: string
          visible: boolean
          week_number: number
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          deliverables?: string[] | null
          id?: string
          mini_project?: string | null
          objective: string
          title: string
          updated_at?: string
          visible?: boolean
          week_number: number
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          deliverables?: string[] | null
          id?: string
          mini_project?: string | null
          objective?: string
          title?: string
          updated_at?: string
          visible?: boolean
          week_number?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          deliverables: string[] | null
          end_date: string | null
          id: string
          is_active: boolean
          mini_project: string | null
          objective: string
          plans: string[]
          start_date: string | null
          title: string
          total_weeks: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliverables?: string[] | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          mini_project?: string | null
          objective: string
          plans?: string[]
          start_date?: string | null
          title: string
          total_weeks?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliverables?: string[] | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          mini_project?: string | null
          objective?: string
          plans?: string[]
          start_date?: string | null
          title?: string
          total_weeks?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          cohort_id: string
          course_id: string | null
          created_at: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          cohort_id: string
          course_id?: string | null
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          cohort_id?: string
          course_id?: string | null
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      international_interest: {
        Row: {
          course_id: string | null
          course_type: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          note: string | null
          referral_source: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          note?: string | null
          referral_source?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          note?: string | null
          referral_source?: string | null
          source?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          resources: Json | null
          slug: string
          summary: string | null
          title: string
          visible: boolean
          week: number
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          resources?: Json | null
          slug: string
          summary?: string | null
          title: string
          visible?: boolean
          week: number
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          resources?: Json | null
          slug?: string
          summary?: string | null
          title?: string
          visible?: boolean
          week?: number
        }
        Relationships: []
      }
      order_enrollments: {
        Row: {
          amount: number
          coupon_code: string | null
          course_id: string | null
          course_type: string | null
          created_at: string
          currency: string
          gateway: string
          id: string
          order_id: string
          paid_at: string | null
          payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          coupon_code?: string | null
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          currency: string
          gateway: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          coupon_code?: string | null
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          currency?: string
          gateway?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          event_id: string
          received_at: string
        }
        Insert: {
          event_id: string
          received_at?: string
        }
        Update: {
          event_id?: string
          received_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          id: string
          name: string
          profile_picture_url: string | null
          referral_source: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          id: string
          name: string
          profile_picture_url?: string | null
          referral_source?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          about?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          id?: string
          name?: string
          profile_picture_url?: string | null
          referral_source?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certificates: {
        Row: {
          certificate_id: string
          created_at: string
          credential_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          certificate_id: string
          created_at?: string
          credential_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          certificate_id?: string
          created_at?: string
          credential_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certificates_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_profile_secure: {
        Args: {
          p_about?: string
          p_date_of_birth?: string
          p_email?: string
          p_name?: string
          p_profile_picture_url?: string
        }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "admin"
      coupon_type: "percent" | "flat"
      payment_status: "pending" | "paid" | "failed"
      referral_source_type:
        | "linkedin_post"
        | "linkedin_profile"
        | "instagram"
        | "facebook"
        | "snapchat"
        | "whatsapp"
        | "direct"
        | "other"
      submission_status: "submitted" | "reviewed" | "needs_changes"
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
    Enums: {
      app_role: ["student", "admin"],
      coupon_type: ["percent", "flat"],
      payment_status: ["pending", "paid", "failed"],
      referral_source_type: [
        "linkedin_post",
        "linkedin_profile",
        "instagram",
        "facebook",
        "snapchat",
        "whatsapp",
        "direct",
        "other",
      ],
      submission_status: ["submitted", "reviewed", "needs_changes"],
    },
  },
} as const
