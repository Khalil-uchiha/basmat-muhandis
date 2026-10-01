import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/**
 * Reduce whatever was pasted into the env var to a bare origin.
 *
 * The client appends paths like `/auth/v1/token`, so a trailing slash or a
 * copied-in path (`.../rest/v1`) yields a malformed URL and Supabase answers
 * "Invalid path specified in request URL". Normalising here means a slightly
 * untidy value in the hosting dashboard can't break sign-in.
 */
const normalizeUrl = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    if (import.meta.env.DEV) {
      console.error(`[supabase] VITE_SUPABASE_URL is not a valid URL: ${trimmed}`);
    }
    return undefined;
  }
};

const url = normalizeUrl(rawUrl);

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
