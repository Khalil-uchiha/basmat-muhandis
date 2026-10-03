import { MEDIA_BUCKET } from "@/lib/supabase";

/**
 * Supabase throws a few differently-shaped errors (StorageError, PostgrestError,
 * plain Error). Reduce any of them to one readable line, and translate the two
 * failures that have a specific cause the committee can act on.
 */
export const describeError = (error: unknown): string => {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error ?? "");

  if (/bucket not found/i.test(raw)) {
    return `Storage bucket "${MEDIA_BUCKET}" does not exist — run supabase/schema.sql.`;
  }
  if (/row-level security|violates row-level/i.test(raw)) {
    return "Blocked by row-level security — the storage policies from supabase/schema.sql are missing.";
  }
  return raw || "Unknown error";
};
