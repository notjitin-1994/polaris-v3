// Central Supabase types. Replace with generated types via Supabase CLI when available.
// Minimal hand-written types aligned to our migrations for type safety in code.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BlueprintStatus = 'draft' | 'generating' | 'completed' | 'error';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      blueprint_generator: {
        Row: {
          id: string;
          user_id: string;
          version: number;
          static_answers: Json;
          dynamic_questions: Json;
          dynamic_questions_raw: Json;
          dynamic_answers: Json;
          blueprint_json: Json;
          blueprint_markdown: string | null;
          status: BlueprintStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          version?: number;
          static_answers?: Json;
          dynamic_questions?: Json;
          dynamic_questions_raw?: Json;
          dynamic_answers?: Json;
          blueprint_json?: Json;
          blueprint_markdown?: string | null;
          status?: BlueprintStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          static_answers?: Json;
          dynamic_questions?: Json;
          dynamic_questions_raw?: Json;
          dynamic_answers?: Json;
          blueprint_json?: Json;
          blueprint_markdown?: string | null;
          status?: BlueprintStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blueprint_generator_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {};
    Functions: {
      set_updated_at: unknown;
      increment_blueprint_version: unknown;
    };
    Enums: {};
  };
}
