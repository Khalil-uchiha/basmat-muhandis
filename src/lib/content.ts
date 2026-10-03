import { MEDIA_BUCKET, isSupabaseConfigured, supabase } from "./supabase";
import { team as fallbackTeam } from "@/data/site";

export type Member = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  sort_order: number;
};

export type Photo = {
  id: string;
  album: string;
  caption: string | null;
  image_url: string;
  storage_path: string | null;
  taken_on: string | null;
  /** Shown in the landing-page hero stack rather than only the gallery. */
  is_hero: boolean;
  created_at: string;
};

export type Album = {
  name: string;
  photos: Photo[];
  cover: Photo;
};

const assertClient = () => {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
};

/* ------------------------------------------------------------------ members */

/** Members for the public Team page. Falls back to the bundled roster. */
export const fetchMembers = async (): Promise<Member[]> => {
  if (!isSupabaseConfigured) {
    return fallbackTeam.map((m, i) => ({
      id: `static-${i}`,
      name: m.name,
      role: m.role,
      bio: m.bio ?? null,
      photo_url: m.photo ?? null,
      facebook: m.facebook ?? null,
      instagram: m.instagram ?? null,
      linkedin: m.linkedin ?? null,
      sort_order: i,
    }));
  }

  const { data, error } = await assertClient()
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Member[];
};

export type MemberInput = Omit<Member, "id">;

export const createMember = async (input: MemberInput) => {
  const { data, error } = await assertClient().from("members").insert(input).select().single();
  if (error) throw error;
  return data as Member;
};

export const updateMember = async (id: string, input: Partial<MemberInput>) => {
  const { data, error } = await assertClient()
    .from("members")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Member;
};

export const deleteMember = async (member: Member) => {
  const client = assertClient();
  const { error } = await client.from("members").delete().eq("id", member.id);
  if (error) throw error;

  // Clean up the portrait we uploaded for them, if any.
  const path = storagePathFromUrl(member.photo_url);
  if (path) await client.storage.from(MEDIA_BUCKET).remove([path]);
};

/** Persist a new ordering in one round trip. */
export const reorderMembers = async (members: Member[]) => {
  const client = assertClient();
  const updates = members.map((m, i) => ({ ...m, sort_order: i }));
  const { error } = await client.from("members").upsert(updates);
  if (error) throw error;
  return updates;
};

/* ------------------------------------------------------------------- photos */

export const fetchPhotos = async (): Promise<Photo[]> => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await assertClient()
    .from("photos")
    .select("*")
    .eq("is_hero", false)
    .order("taken_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Photo[];
};

/** Group photos into albums, newest album first. */
export const groupIntoAlbums = (photos: Photo[]): Album[] => {
  const byAlbum = new Map<string, Photo[]>();
  for (const p of photos) {
    const list = byAlbum.get(p.album);
    if (list) list.push(p);
    else byAlbum.set(p.album, [p]);
  }
  return [...byAlbum.entries()].map(([name, list]) => ({
    name,
    photos: list,
    cover: list[0],
  }));
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "album";

const extensionOf = (file: File) => {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1] || "jpg";
};

/** Upload one file to storage and return its public URL + path. */
export const uploadToStorage = async (file: File, folder: string) => {
  const client = assertClient();
  const path = `${folder}/${crypto.randomUUID()}.${extensionOf(file)}`;

  const { error } = await client.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
};

export type PhotoInput = {
  album: string;
  caption: string | null;
  taken_on: string | null;
};

export const createPhoto = async (file: File, input: PhotoInput) => {
  const { url, path } = await uploadToStorage(file, `events/${slugify(input.album)}`);
  const { data, error } = await assertClient()
    .from("photos")
    .insert({ ...input, image_url: url, storage_path: path, is_hero: false })
    .select()
    .single();

  if (error) {
    // Don't leave an orphan file behind if the row fails to insert.
    await assertClient().storage.from(MEDIA_BUCKET).remove([path]);
    throw error;
  }
  return data as Photo;
};

export const deletePhoto = async (photo: Photo) => {
  const client = assertClient();
  const { error } = await client.from("photos").delete().eq("id", photo.id);
  if (error) throw error;

  const path = photo.storage_path ?? storagePathFromUrl(photo.image_url);
  if (path) await client.storage.from(MEDIA_BUCKET).remove([path]);
};

/* --------------------------------------------------------------- hero stack */

/** The hero shows a small, deliberately curated set. */
export const HERO_LIMIT = 5;

export const fetchHeroPhotos = async (): Promise<Photo[]> => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await assertClient()
    .from("photos")
    .select("*")
    .eq("is_hero", true)
    .order("created_at", { ascending: true })
    .limit(HERO_LIMIT);

  if (error) throw error;
  return (data ?? []) as Photo[];
};

export const createHeroPhoto = async (file: File, caption: string | null) => {
  const { url, path } = await uploadToStorage(file, "hero");
  const { data, error } = await assertClient()
    .from("photos")
    .insert({ album: "Hero", caption, image_url: url, storage_path: path, is_hero: true })
    .select()
    .single();

  if (error) {
    await assertClient().storage.from(MEDIA_BUCKET).remove([path]);
    throw error;
  }
  return data as Photo;
};

/** Recover an object path from a public URL (older rows have no storage_path). */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}
