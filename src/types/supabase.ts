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
      agency_settings: {
        Row: {
          branding: Json
          copyright: string | null
          created_at: string | null
          email: string | null
          footer_links: Json | null
          id: string
          menu_items: Json | null
          name: string
          phone: string | null
          status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          branding?: Json
          copyright?: string | null
          created_at?: string | null
          email?: string | null
          footer_links?: Json | null
          id?: string
          menu_items?: Json | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          branding?: Json
          copyright?: string | null
          created_at?: string | null
          email?: string | null
          footer_links?: Json | null
          id?: string
          menu_items?: Json | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string
          phone: string
          position: string
          social_media: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name: string
          phone: string
          position: string
          social_media?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          phone?: string
          position?: string
          social_media?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          id: string
          property_id: string
          created_at: string
          updated_at: string
          category: AssetCategory
          type: AssetType
          filename: string
          storage_path: string
          title: string | null
          description: string | null
          alt_text: string | null
          display_order: number | null
          video_thumbnail_path: string | null
          video_duration: number | null
          width: number | null
          height: number | null
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          property_id: string
          created_at?: string
          updated_at?: string
          category: AssetCategory
          type: AssetType
          filename: string
          storage_path: string
          title?: string | null
          description?: string | null
          alt_text?: string | null
          display_order?: number | null
          video_thumbnail_path?: string | null
          video_duration?: number | null
          width?: number | null
          height?: number | null
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          property_id?: string
          created_at?: string
          updated_at?: string
          category?: AssetCategory
          type?: AssetType
          filename?: string
          storage_path?: string
          title?: string | null
          description?: string | null
          alt_text?: string | null
          display_order?: number | null
          video_thumbnail_path?: string | null
          video_duration?: number | null
          width?: number | null
          height?: number | null
          status?: 'active' | 'inactive'
        }
        Relationships: [
          {
            foreignKeyName: "assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_agents: {
        Row: {
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          property_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          property_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          property_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_agents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          agency_id: string | null
          agency_name: string | null
          agency_settings_id: string | null
          agent_id: string | null
          content: Json
          created_at: string | null
          customDomain: string | null
          id: string
          metadata: Json | null
          name: string
          price: string
          state: string
          status: string
          street_address: string
          suburb: string
          template_version: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          agency_name?: string | null
          agency_settings_id?: string | null
          agent_id?: string | null
          content?: Json
          created_at?: string | null
          customDomain?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price: string
          state: string
          status?: string
          street_address: string
          suburb: string
          template_version?: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          agency_name?: string | null
          agency_settings_id?: string | null
          agent_id?: string | null
          content?: Json
          created_at?: string | null
          customDomain?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: string
          state?: string
          status?: string
          street_address?: string
          suburb?: string
          template_version?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_settings_id_fkey"
            columns: ["agency_settings_id"]
            isOneToOne: false
            referencedRelation: "agency_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          changes: string[]
          components: Json
          created_at: string
          id: string
          is_stable: boolean
          major: number
          migrations: Json
          minor: number
          patch: number
          schema: Json
          updated_at: string
          version: string
        }
        Insert: {
          changes?: string[]
          components?: Json
          created_at?: string
          id?: string
          is_stable?: boolean
          major: number
          migrations?: Json
          minor: number
          patch: number
          schema?: Json
          updated_at?: string
          version: string
        }
        Update: {
          changes?: string[]
          components?: Json
          created_at?: string
          id?: string
          is_stable?: boolean
          major?: number
          migrations?: Json
          minor?: number
          patch?: number
          schema?: Json
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          status: string
          type: string
          updated_at: string
          viewing_datetime: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          status: string
          type: string
          updated_at?: string
          viewing_datetime: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          viewing_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      asset_category: 'hero_video' | 'gallery' | 'your_home' | 'neighbourhood' | 'footer' | 'floorplan' | 
        'features_banner' | 'lifestyle_banner' | 'neighbourhood_banner' | 'property_logo' | '3d_tour'
      asset_type: 'image' | 'video' | 'pdf' | 'glb'
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

export type AssetCategory = Database['public']['Enums']['asset_category']
export type AssetType = Database['public']['Enums']['asset_type']
