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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      candidates: {
        Row: {
          Address: string | null
          candidate_name: string | null
          certifications: Json | null
          created_at: string
          education: Json | null
          experience: Json | null
          id: number
          phone_number: number | null
          professional_summary: string | null
          projects: Json | null
          skills: Json | null
          social_links: Json | null
        }
        Insert: {
          Address?: string | null
          candidate_name?: string | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: number
          phone_number?: number | null
          professional_summary?: string | null
          projects?: Json | null
          skills?: Json | null
          social_links?: Json | null
        }
        Update: {
          Address?: string | null
          candidate_name?: string | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: number
          phone_number?: number | null
          professional_summary?: string | null
          projects?: Json | null
          skills?: Json | null
          social_links?: Json | null
        }
        Relationships: []
      }
      userprofiles: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_candidates: {
        Args: Record<PropertyKey, never>
        Returns: {
          Address: string | null
          candidate_name: string | null
          certifications: Json | null
          created_at: string
          education: Json | null
          experience: Json | null
          id: number
          phone_number: number | null
          professional_summary: string | null
          projects: Json | null
          skills: Json | null
          social_links: Json | null
        }[]
      }
      get_candidate:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              Address: string | null
              candidate_name: string | null
              certifications: Json | null
              created_at: string
              education: Json | null
              experience: Json | null
              id: number
              phone_number: number | null
              professional_summary: string | null
              projects: Json | null
              skills: Json | null
              social_links: Json | null
            }[]
          }
        | {
            Args: {
              id: number
            }
            Returns: Record<string, unknown>
          }
      get_candidate2: {
        Args: Record<PropertyKey, never>
        Returns: {
          Address: string | null
          candidate_name: string | null
          certifications: Json | null
          created_at: string
          education: Json | null
          experience: Json | null
          id: number
          phone_number: number | null
          professional_summary: string | null
          projects: Json | null
          skills: Json | null
          social_links: Json | null
        }[]
      }
      get_content: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_contents: {
        Args: Record<PropertyKey, never>
        Returns: {
          content: string | null
          embedding: string | null
          id: number
        }[]
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
