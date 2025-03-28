export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_steps: Json | null
          created_at: string
          current_step: string
          id: string
          is_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: Json | null
          created_at?: string
          current_step?: string
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: Json | null
          created_at?: string
          current_step?: string
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_analysis: {
        Row: {
          ai_feedback: Json | null
          created_at: string
          id: string
          overall_score: number | null
          performance_id: string
          voice_feedback: Json | null
        }
        Insert: {
          ai_feedback?: Json | null
          created_at?: string
          id?: string
          overall_score?: number | null
          performance_id: string
          voice_feedback?: Json | null
        }
        Update: {
          ai_feedback?: Json | null
          created_at?: string
          id?: string
          overall_score?: number | null
          performance_id?: string
          voice_feedback?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_analysis_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_results: {
        Row: {
          analysis: Json | null
          created_at: string
          id: string
          user_id: string
          voice_analysis: Json | null
        }
        Insert: {
          analysis?: Json | null
          created_at?: string
          id?: string
          user_id: string
          voice_analysis?: Json | null
        }
        Update: {
          analysis?: Json | null
          created_at?: string
          id?: string
          user_id?: string
          voice_analysis?: Json | null
        }
        Relationships: []
      }
      performances: {
        Row: {
          created_at: string
          id: string
          is_trial: boolean | null
          performance_analysis: Json | null
          status: Database["public"]["Enums"]["performance_status"]
          title: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_trial?: boolean | null
          performance_analysis?: Json | null
          status?: Database["public"]["Enums"]["performance_status"]
          title: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_trial?: boolean | null
          performance_analysis?: Json | null
          status?: Database["public"]["Enums"]["performance_status"]
          title?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          stripe_price_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          stripe_price_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          stripe_price_id?: string
        }
        Relationships: []
      }
      user_assessment: {
        Row: {
          acting_style: string | null
          audition_readiness: number | null
          challenges: Json | null
          created_at: string
          emotional_range: number | null
          id: string
          technical_skills: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acting_style?: string | null
          audition_readiness?: number | null
          challenges?: Json | null
          created_at?: string
          emotional_range?: number | null
          id?: string
          technical_skills?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acting_style?: string | null
          audition_readiness?: number | null
          challenges?: Json | null
          created_at?: string
          emotional_range?: number | null
          id?: string
          technical_skills?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_coach_preferences: {
        Row: {
          clearness_of_diction: boolean | null
          created_at: string
          emotion_in_voice: boolean | null
          face_expressions: boolean | null
          id: string
          physical_presence: boolean | null
          selected_coach: Database["public"]["Enums"]["coach_type"]
          updated_at: string
          user_id: string
          voice_expressiveness: boolean | null
        }
        Insert: {
          clearness_of_diction?: boolean | null
          created_at?: string
          emotion_in_voice?: boolean | null
          face_expressions?: boolean | null
          id?: string
          physical_presence?: boolean | null
          selected_coach: Database["public"]["Enums"]["coach_type"]
          updated_at?: string
          user_id: string
          voice_expressiveness?: boolean | null
        }
        Update: {
          clearness_of_diction?: boolean | null
          created_at?: string
          emotion_in_voice?: boolean | null
          face_expressions?: boolean | null
          id?: string
          physical_presence?: boolean | null
          selected_coach?: Database["public"]["Enums"]["coach_type"]
          updated_at?: string
          user_id?: string
          voice_expressiveness?: boolean | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          created_at: string
          goal: string
          id: string
          priority: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          goal: string
          id?: string
          priority?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          goal?: string
          id?: string
          priority?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string
          id: string
          is_subscribed: boolean | null
          performance_count: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_expiry: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_subscribed?: boolean | null
          performance_count?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expiry?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_subscribed?: boolean | null
          performance_count?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expiry?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_subscription_updated: {
        Args: {
          user_id: string
          customer: string
          subscription_id: string
          price_id: string
        }
        Returns: undefined
      }
      increment_performance_count: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      store_performance_analysis: {
        Args: {
          p_user_id: string
          p_analysis: Json
          p_voice_analysis: Json
          p_title: string
          p_video_url: string
        }
        Returns: string
      }
    }
    Enums: {
      coach_type:
        | "strasberg"
        | "stanislavski"
        | "meisner"
        | "chekhov"
        | "brecht"
      performance_status: "processing" | "completed" | "error"
      subscription_tier: "free" | "trial" | "pro" | "actor" | "lifetime"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
