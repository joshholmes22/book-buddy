import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get credentials from environment variables or fall back to app.json extra config
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials!");
}

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
