# Connecting the dashboard to Supabase

The site runs fine without this — the Team page falls back to the roster bundled in
`src/data/site.ts` and the Gallery shows an empty state. Follow these steps once to turn on
the dashboard, the live team list and photo uploads.

Takes about five minutes.

---

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. **New project** → give it a name (`basmat-muhandis`), pick a region close to Algeria
   (`eu-west-3 / Paris` is the nearest), and set a database password.
3. Wait for provisioning to finish (~2 minutes).

## 2. Create the tables and storage bucket

1. In the left sidebar open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy the whole file, paste it in.
3. Press **Run**.

That creates the `members` and `photos` tables, the public `media` storage bucket, and the
security rules: **anyone can read, only signed-in committee accounts can write.**

**Check the output before moving on.** The last statement prints one row reading `media | t`.
If no row comes back, the storage half failed — some projects don't grant the SQL Editor
ownership of the storage tables, and it errors with *"must be owner of table objects"* while
everything above it succeeds. Uploads then fail with *Storage bucket "media" does not exist*
even though login and the team list work. Create it by hand instead:

- **Storage → New bucket** → name `media`, tick **Public bucket**
- **Storage → media → Policies → New policy** → template *Allow access to authenticated
  users only*, applied to `INSERT`, `UPDATE` and `DELETE`

## 3. Create the committee login

1. Sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter the email and password the committee will use, and tick
   **Auto Confirm User** so no confirmation email is needed.
3. Repeat for each person who should be able to edit the site.

> There is no public sign-up. Accounts can only be created here, so nobody can give
> themselves access.

## 4. Point the site at the project

1. Sidebar → **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the project folder, copy `.env.example` to `.env` and fill both values:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. Restart the dev server (`npm run dev`).

The `anon` key is designed to be public — it is safe in a browser app. The row-level
security rules from step 2 are what actually protect your data. Never put the
**service_role** key in this file.

## 5. Use it

Open `/dashboard`, sign in with the account from step 3, and you get two tabs:

- **Members** — add, edit, reorder and delete people. The first two in the list render as
  the featured board cards on `/team`; everyone else fills the grid. Portraits are
  optional; a monogram is used when there is no photo.
- **Photos** — pick an event name, optionally a date and caption, select one or many
  images, and upload. Photos sharing an event name are grouped into one album on
  `/gallery`.

Changes are live for every visitor immediately — no redeploy.

---

## Notes

- **Image size.** The dashboard rejects files over 10 MB. For a long event, resizing to
  ~2000px wide before uploading keeps the gallery fast.
- **Free tier limits.** 500 MB database and 1 GB file storage — roughly 1,000–2,000
  event photos at a sensible size. Supabase pauses projects after a week of total
  inactivity; opening the site wakes it.
- **Deleting.** Removing a photo or a member also deletes their file from storage, so
  the quota is reclaimed.
- **Deploying.** Set the same two `VITE_` variables in your host's environment settings
  (Vercel, Netlify, Cloudflare Pages) — they are read at build time.
