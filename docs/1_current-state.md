# 1 — Frames of Mind: Current State

> Snapshot of the application as built, plus where to improve. Living doc — update as the app evolves.

_Last updated: 2026-06-19_

---

## 1. Overview

**Frames of Mind** is a personal, anime-themed blog built from the **Pranavi-Gift** Figma file.
Single-owner model: the owner (Arnab) logs in to write section-based blog posts; everyone else gets a
read-only experience. Backed by a real database, so content and contact messages persist.

- **Repo:** github.com/arnabara4/Blogsite-Project
- **Dev:** `npm run dev` → http://localhost:3000
- **Owner login:** `pranavi@frame.com` / `pranavi123`

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (theme tokens in `src/app/globals.css`) |
| Backend | Supabase — Postgres + Auth |
| Auth client | `@supabase/ssr` (browser + server + proxy) |
| Fonts | Playfair Display, Inter, Inria Serif, Inknut Antiqua (`next/font`) |

**Design tokens:** coral `#e35336`, peach `#ffccc1`, salmon `#f4a896`, graybox `#d9d9d9`.

---

## 3. Architecture

```
src/
  app/
    layout.tsx          # fonts + AuthProvider + Navbar/Footer shell
    page.tsx            # Home (server fetch of latest 3 blogs)
    blogs/page.tsx      # Blogs grid (server fetch) → BlogsExplorer
    blogs/[id]/page.tsx # Blog detail (server fetch blog + sections)
    blogs/new/page.tsx  # Section editor (client, owner only)
    about/page.tsx      # Static bio
    contact/page.tsx    # Client form → messages
    login/page.tsx      # Client email/password login
  components/
    Navbar / Footer / AuthProvider
    HomeGreeting        # LOG-IN ↔ WELCOME ARNAB
    BlogsExplorer       # search + ADD BLOG (client)
    BlogCard            # BlogCard (grid) + BlogRow (home list)
    SectionRenderer     # render title/quote/paragraph/image
    SectionEditor       # one editable block + "D" delete
    Thumb               # image with gradient placeholder fallback
  lib/
    types.ts            # Blog / BlogSection / SectionKind + formatDate
    supabase/client.ts  # browser client
    supabase/server.ts  # server-component client (cookies)
  proxy.ts              # session refresh + guard /blogs/new
supabase/migration.sql  # schema + RLS
```

**Data flow:** read pages are server components (SSR via `supabase/server`); interactive pieces
(editor, contact, login, search, auth state) are client components using `supabase/client`.

---

## 4. Data model (`supabase/migration.sql`)

- **blogs** — `id, title, cover_image, excerpt, read_time, author_id, created_at`
- **blog_sections** — `id, blog_id (fk cascade), kind ∈ {image,paragraph,title,quote}, content, image_url, position`
- **messages** — `id, first_name, last_name, email, body, created_at`

**RLS**
- blogs / blog_sections → `select` public; insert/update/delete for `authenticated` (owner).
- messages → insert for anyone; select for `authenticated` only.

---

## 5. What works (verified)

- All routes return 200; `/blogs/new` 307-redirects guests to `/login`.
- Owner email/password login (Supabase auth) returns a session.
- Blog detail renders ordered sections (title / quote / paragraph / image).
- New-blog editor inserts a blog + its sections, then redirects to the detail page.
- Contact form inserts into `messages` (201) under anon RLS.
- `npm run build` passes lint + types with no warnings.

---

## 6. Known gaps / limitations

1. **Images are placeholders.** `Thumb` renders gradient blocks; no real upload pipeline. Figma artwork
   (anime) was intentionally not shipped.
2. **No edit / delete for blogs.** Only create + read. No `/blogs/[id]/edit`, no delete button.
3. **Single-owner is loose.** Any authenticated user is treated as owner; `author_id` isn't enforced in
   RLS (`using(true)`), so write policies don't actually scope to one user.
4. **Owner seeded via raw SQL.** Account created by inserting into `auth.users` — fragile vs Supabase
   admin API; signups not configured.
5. **Editor UX is basic.** No reordering of sections (drag), no inline image upload, no draft/autosave,
   no validation beyond "title required".
6. **No messages admin view.** Contact submissions land in DB but there's no page to read them.
7. **No image optimization.** Uses raw `<img>` (via `Thumb`), not `next/image`.
8. **Secrets hygiene.** DB password + a GitHub token were exposed in chat during setup — must be rotated.
9. **No tests, no CI, no error boundaries / loading states** beyond ad-hoc "Loading…".
10. **SEO/meta minimal.** Only home + about set titles; no per-blog metadata, OG tags, or sitemap.

---

## 7. Improvement roadmap (suggested order)

### Near-term (correctness + completeness)
- [ ] **Edit + delete blogs.** Add `/blogs/[id]/edit` reusing `SectionEditor`; add delete with confirm.
- [ ] **Tighten RLS.** Scope writes to `auth.uid() = author_id`; decide owner allow-list (env var or
      `profiles.is_owner`).
- [ ] **Real images.** Supabase Storage bucket + upload in the editor; switch `Thumb` to `next/image`.
- [ ] **Messages inbox.** Owner-only `/admin/messages` page reading `messages`.

### Mid-term (UX + polish)
- [ ] Section reordering (drag-and-drop), paragraph rich-text, cover-image picker.
- [ ] Draft state (`blogs.published boolean`) + autosave.
- [ ] Loading skeletons + error boundaries; toast notifications.
- [ ] Responsive QA against each Figma frame; pixel pass on spacing/typography.

### Longer-term (production readiness)
- [ ] Rotate all leaked secrets; move owner provisioning to Supabase admin API / invite flow.
- [ ] Per-blog metadata, OG images, sitemap, RSS.
- [ ] Tests (Playwright e2e for auth + CRUD; unit for section serialization) + GitHub Actions CI.
- [ ] Deploy (Vercel) with env wiring; preview deployments.
- [ ] Analytics + rate-limit the contact form (spam protection / captcha).

---

## 8. Open decisions

- Owner model: keep "any auth user = owner", or a strict single allow-listed email?
- Image strategy: Supabase Storage vs external URLs vs `public/` assets?
- Should guests be able to comment, or stay strictly read-only?
