import { describe, expect, it } from "vitest";

import { type Photo, fetchMembers, fetchPhotos, groupIntoAlbums } from "@/lib/content";

const photo = (id: string, album: string): Photo => ({
  id,
  album,
  caption: null,
  image_url: `https://example.test/${id}.jpg`,
  storage_path: `events/${album}/${id}.jpg`,
  taken_on: null,
  created_at: "2026-01-01T00:00:00Z",
});

describe("groupIntoAlbums", () => {
  it("groups photos by event name and keeps their order", () => {
    const albums = groupIntoAlbums([
      photo("a", "Hackathon"),
      photo("b", "Robotics Expo"),
      photo("c", "Hackathon"),
    ]);

    expect(albums.map((a) => a.name)).toEqual(["Hackathon", "Robotics Expo"]);
    expect(albums[0].photos.map((p) => p.id)).toEqual(["a", "c"]);
    expect(albums[1].photos).toHaveLength(1);
  });

  it("uses the first photo of each album as its cover", () => {
    const [album] = groupIntoAlbums([photo("first", "Expo"), photo("second", "Expo")]);
    expect(album.cover.id).toBe("first");
  });

  it("returns nothing for an empty list", () => {
    expect(groupIntoAlbums([])).toEqual([]);
  });
});

describe("without Supabase configured", () => {
  it("serves the bundled roster so the Team page is never blank", async () => {
    const members = await fetchMembers();
    expect(members.length).toBeGreaterThan(0);
    expect(members[0]).toMatchObject({ name: expect.any(String), role: expect.any(String) });
    // Order must be stable — the first two render as the featured board cards.
    expect(members.map((m) => m.sort_order)).toEqual(members.map((_, i) => i));
  });

  it("reports no photos rather than throwing", async () => {
    await expect(fetchPhotos()).resolves.toEqual([]);
  });
});
