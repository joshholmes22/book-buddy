import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Book = {
  id: string;
  isbn: string | null;
  title: string | null;
  author: string | null;
  cover_url: string | null;
  genre: string[] | null;
  status: "unread" | "reading" | "read" | "borrowed";
  rating: number | null;
  review: string | null;
  borrowed_to: string | null;
  borrowed_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Genre = {
  id: string;
  name: string;
};
