/**
 * Hand-maintained Supabase schema types for the Pixora tables.
 * Regenerate with `supabase gen types typescript` once the project is linked.
 */

export type MediaKind = "image" | "video";

export type SavedMediaRow = {
  id: string;
  owner_id: string;
  external_id: string;
  provider: string;
  media_type: MediaKind;
  title: string;
  media_url: string;
  thumbnail_url: string;
  page_url: string;
  board_id: string | null;
  created_at: string;
};

export type BoardRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  accent: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      pixora_saved_media: {
        Row: SavedMediaRow;
        Insert: Partial<SavedMediaRow> & Pick<SavedMediaRow, "owner_id" | "external_id" | "media_type">;
        Update: Partial<SavedMediaRow>;
        Relationships: [];
      };
      pixora_boards: {
        Row: BoardRow;
        Insert: Partial<BoardRow> & Pick<BoardRow, "owner_id" | "name">;
        Update: Partial<BoardRow>;
        Relationships: [];
      };
      pixora_profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
