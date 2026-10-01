import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True once the project's Supabase credentials are present in .env.
 * Everything degrades gracefully to the bundled static content when false,
 * so the public site never breaks because the backend is missing.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/** Storage bucket holding event photos and member portraits. */
export const MEDIA_BUCKET = "media";
