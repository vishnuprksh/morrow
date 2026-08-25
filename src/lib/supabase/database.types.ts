export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; display_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      folders: {
        Row: { id: string; user_id: string; parent_id: string | null; name: string; position: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; parent_id?: string | null; name: string; position?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; parent_id?: string | null; name?: string; position?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      notes: {
        Row: { id: string; user_id: string; folder_id: string | null; title: string; content_markdown: string; version: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; folder_id?: string | null; title?: string; content_markdown?: string; version?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; folder_id?: string | null; title?: string; content_markdown?: string; version?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      ai_credentials: {
        Row: { id: string; user_id: string; provider: string; encrypted_api_key: string; model: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; provider: string; encrypted_api_key: string; model: string; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; provider?: string; encrypted_api_key?: string; model?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
