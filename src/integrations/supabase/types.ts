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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          category_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          published_at: string | null
          reading_time_minutes: number
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_views: {
        Row: {
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      column_mappings: {
        Row: {
          created_at: string
          id: string
          mapping_config: Json
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapping_config?: Json
          name: string
          school_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mapping_config?: Json
          name?: string
          school_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          school_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          school_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          school_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_subjects: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          pass_marks: number
          subject_name: string
          total_marks: number
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          pass_marks?: number
          subject_name: string
          total_marks?: number
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          pass_marks?: number
          subject_name?: string
          total_marks?: number
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          display_at: string | null
          exam_settings: Json | null
          id: string
          is_published: boolean
          is_stopped: boolean
          name: string
          password: string | null
          school_id: string
          search_mode: string
        }
        Insert: {
          created_at?: string
          display_at?: string | null
          exam_settings?: Json | null
          id?: string
          is_published?: boolean
          is_stopped?: boolean
          name: string
          password?: string | null
          school_id: string
          search_mode?: string
        }
        Update: {
          created_at?: string
          display_at?: string | null
          exam_settings?: Json | null
          id?: string
          is_published?: boolean
          is_stopped?: boolean
          name?: string
          password?: string | null
          school_id?: string
          search_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          owner_name: string
          referral_code: string | null
          referred_by: string | null
          school_name: string
          updated_at: string
          user_id: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_name?: string
          referral_code?: string | null
          referred_by?: string | null
          school_name?: string
          updated_at?: string
          user_id: string
          whatsapp_number?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_name?: string
          referral_code?: string | null
          referred_by?: string | null
          school_name?: string
          updated_at?: string
          user_id?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          commission_credits: number
          commission_rupees: number | null
          created_at: string | null
          credits_purchased: number
          id: string
          referral_id: string | null
          referrer_id: string
        }
        Insert: {
          commission_credits: number
          commission_rupees?: number | null
          created_at?: string | null
          credits_purchased: number
          id?: string
          referral_id?: string | null
          referrer_id: string
        }
        Update: {
          commission_credits?: number
          commission_rupees?: number | null
          created_at?: string | null
          credits_purchased?: number
          id?: string
          referral_id?: string | null
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          class_name: string
          created_at: string
          exam_id: string
          father_name: string
          grade: string
          id: string
          roll_number: string
          student_name: string
          subjects: Json
          total_marks: number
        }
        Insert: {
          class_name?: string
          created_at?: string
          exam_id: string
          father_name?: string
          grade?: string
          id?: string
          roll_number: string
          student_name: string
          subjects?: Json
          total_marks?: number
        }
        Update: {
          class_name?: string
          created_at?: string
          exam_id?: string
          father_name?: string
          grade?: string
          id?: string
          roll_number?: string
          student_name?: string
          subjects?: Json
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      school_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          school_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          school_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_credits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          accent_color: string
          created_at: string
          dmc_settings: Json
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan: string
          result_check_count: number
          result_template: string
          search_fields: string[]
          slug: string
          template_changes_count: number
          updated_at: string
          upload_count: number
        }
        Insert: {
          accent_color?: string
          created_at?: string
          dmc_settings?: Json
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: string
          result_check_count?: number
          result_template?: string
          search_fields?: string[]
          slug: string
          template_changes_count?: number
          updated_at?: string
          upload_count?: number
        }
        Update: {
          accent_color?: string
          created_at?: string
          dmc_settings?: Json
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: string
          result_check_count?: number
          result_template?: string
          search_fields?: string[]
          slug?: string
          template_changes_count?: number
          updated_at?: string
          upload_count?: number
        }
        Relationships: []
      }
      signup_ips: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits_admin:
        | {
            Args: {
              p_amount: number
              p_description?: string
              p_school_id: string
            }
            Returns: number
          }
        | {
            Args: {
              p_amount: number
              p_description?: string
              p_paid_credits?: number
              p_school_id: string
            }
            Returns: number
          }
      admin_delete_school: { Args: { p_school_id: string }; Returns: undefined }
      apply_referral_code: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: boolean
      }
      check_ip_signup_limit: { Args: { p_ip: string }; Returns: boolean }
      deduct_credit: { Args: { p_school_id: string }; Returns: boolean }
      deduct_credits_bulk: {
        Args: { p_count: number; p_school_id: string }
        Returns: number
      }
      deduct_template_change_credits: {
        Args: { p_school_id: string }
        Returns: boolean
      }
      deduct_upload_credits: { Args: { p_school_id: string }; Returns: boolean }
      fuzzy_search_results:
        | {
            Args: { p_class_name: string; p_exam_id: string; p_query: string }
            Returns: {
              class_name: string
              created_at: string
              exam_id: string
              father_name: string
              grade: string
              id: string
              roll_number: string
              student_name: string
              subjects: Json
              total_marks: number
            }[]
            SetofOptions: {
              from: "*"
              to: "results"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              p_class_name: string
              p_exam_id: string
              p_father_name?: string
              p_query: string
              p_roll_number?: string
            }
            Returns: {
              class_name: string
              created_at: string
              exam_id: string
              father_name: string
              grade: string
              id: string
              roll_number: string
              student_name: string
              subjects: Json
              total_marks: number
            }[]
            SetofOptions: {
              from: "*"
              to: "results"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_active_exam_by_slug: {
        Args: { p_slug: string }
        Returns: {
          display_at: string
          exam_settings: Json
          id: string
          is_stopped: boolean
          name: string
          search_mode: string
        }[]
      }
      get_exam_classes: {
        Args: { p_exam_id: string }
        Returns: {
          class_name: string
        }[]
      }
      get_my_referrals: {
        Args: never
        Returns: {
          created_at: string
          id: string
          referred_user_id: string
          school_name: string
        }[]
      }
      get_published_exams_by_slug: {
        Args: { p_slug: string }
        Returns: {
          created_at: string
          display_at: string
          exam_settings: Json
          id: string
          is_stopped: boolean
          name: string
          search_mode: string
        }[]
      }
      get_school_portal_data: {
        Args: { p_slug: string }
        Returns: {
          accent_color: string
          dmc_settings: Json
          id: string
          logo_url: string
          name: string
          plan: string
          result_template: string
          search_fields: string[]
          slug: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_referral_commission: {
        Args: { p_credits_added: number; p_school_id: string }
        Returns: undefined
      }
      recalc_exam_positions: { Args: { p_exam_id: string }; Returns: undefined }
      record_signup_ip: {
        Args: { p_ip: string; p_user_id: string }
        Returns: undefined
      }
      set_school_plan: {
        Args: { p_plan: string; p_school_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
