# Frames of Mind

A personal, anime-themed blog built from the **Pranavi-Gift** Figma design. Owner (Arnab) can log in to
write section-based blog posts; guests get a read-only experience.

## Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css`)
- **Supabase** — Postgres + Auth (`@supabase/ssr`)

## Pages
| Route | Description |
|---|---|
| `/` | Home — hero, "MY THOUGHTS", gallery, Recent Blogs, LOG-IN / WELCOME ARNAB |
| `/blogs` | Blog grid with search; ADD BLOG button when logged in |
| `/blogs/[id]` | Blog detail — renders title/quote/paragraph/image sections |
| `/blogs/new` | Section editor (owner only; guests redirected to login) |
| `/about` | About Me |
| `/contact` | Contact form → `messages` table |
| `/login` | Owner email/password login |

## Data model (`supabase/migration.sql`)
- `blogs` — title, cover_image, excerpt, read_time, author_id
- `blog_sections` — kind (`image|paragraph|title|quote`), content, image_url, position
- `messages` — contact submissions

RLS: blogs/sections are public-read, authenticated-write; messages are public-insert, owner-read.

## Local setup
1. `npm install`
2. Create `.env.local` (gitignored):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. Apply the schema once: run `supabase/migration.sql` in the Supabase SQL editor (or via `psql`).
4. `npm run dev` → http://localhost:3000

## Owner login
```
email:    pranavi@frame.com
password: pranavi123
```
Any authenticated user is treated as the owner (single-owner model).

## Notes
- Image placeholders: the Figma artwork is replaced by coral/peach gradient blocks (`src/components/Thumb.tsx`).
  Drop real images in `public/` and pass URLs as `cover_image` / section `image_url` to use them.
- `npm run build` runs lint + types and must pass.
