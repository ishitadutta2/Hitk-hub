# HITK Hub — Student Academic & Knowledge Marketplace

> An independent student-built platform concept. Not officially affiliated with
> Heritage Institute of Technology (or any institution) — get authorization
> before representing this as an official college platform.

This version runs on **real Supabase** (Auth + Postgres + Storage) instead of
the earlier localStorage/mock-data demo. Every signup, doubt, note upload and
purchase is a real row in a real database.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Save the database password somewhere safe.
3. Wait for provisioning (~2 min).
4. **Project Settings → API** → copy the **Project URL**, the **`anon` `public`**
   key, and the **`service_role`** key (click "Reveal").
5. **Authentication → Providers → Email** — for local testing, turn off
   "Confirm email" (turn it back on before a real launch).

## 2. Set up the database

Open **SQL Editor** in Supabase and run, in order:

1. `supabase/schema.sql` — creates every table, Row Level Security policy, the
   auto-profile-on-signup trigger, and the private `notes` storage bucket.
2. `supabase/seed.sql` — seeds departments, semesters, and a starter set of
   CSE subjects. Edit this file first if your college's departments differ.

Then go to **Storage** and confirm a bucket named `notes` exists with
**Public: off** (the schema script creates it, but double-check).

## 3. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in the three values from step 1.

## 4. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign up with a real email format (any domain
works unless you add domain validation — see below), pick a department/year,
and use the app. Every action writes to Supabase now.

**To become an admin**, sign up once through the app, then in the SQL editor:
```sql
update profiles set role = 'admin' where email = 'you@hitk.edu.in';
```
Log out and back in — the Admin link appears in the sidebar.

## What's real now vs. what's still a next step

**Real:**
- Supabase Auth signup/login (with optional email confirmation)
- Profiles, departments, semesters, subjects — all live Postgres tables
- Row Level Security on every table (students can only write their own rows;
  `is_staff()` gates admin/moderator actions)
- Notes upload → real file goes to a **private** Storage bucket; buyers only
  get a 5-minute signed URL, and only after a route handler
  (`app/api/notes/[id]/download/route.ts`) verifies a `verified` purchase
  server-side with the service-role key
- Doubts, answers, leaderboard (ranked by real `profiles.xp`)
- Admin: approve/reject notes, verify UPI payments, resolve/dismiss reports —
  all writing to the database

**Still stubbed / your next steps, in the order I'd tackle them:**

1. **Payments are manual UPI, not automated.** Buyers submit a UPI
   transaction reference; an admin marks it `verified` in `/admin`. To
   automate this: add a Razorpay checkout on `app/notes/[id]/page.tsx`, verify
   the payment signature in a webhook route, then insert the `purchases` row
   server-side instead of client-side.
2. **PYQ and question upload UI doesn't exist yet.** The `pyqs` and
   `questions` tables and RLS policies are ready (students can insert their
   own via `uploaded_by`/`created_by`), but there's no upload form — model one
   on `app/notes/upload/page.tsx`. For now, insert rows directly via the SQL
   editor to test the PYQ/question pages.
3. **No end-user "Report" button yet.** The `reports` table and admin
   Resolve/Dismiss actions are wired up; add a report button to note/doubt
   pages that inserts a row (`reporter_id`, `content_type`, `content_id`,
   `reason`).
4. **College email domain isn't enforced.** Add a check in
   `app/signup/page.tsx` (e.g. reject anything not ending in
   `@hitk.edu.in`) once you've confirmed the exact domain HITK uses.
5. **XP updates client-side.** `bumpXP` in `lib/store.tsx` updates
   `profiles.xp` directly from the browser — fine for a college project, but
   move it into a Postgres function (`security definer` RPC) before treating
   XP as tamper-proof.
6. **Semester-level drill-down** (Department → Year → Semester → Subject)
   isn't built as a wizard yet — subjects are filtered by department only.
   The `semesters` table and `subjects.semester_id` column are ready for it.
7. **AI Study Assistant** — intentionally left out for now, per the "get the
   core system real first" advice. Add it last.

## Project structure

- `supabase/schema.sql`, `supabase/seed.sql` — run these in the SQL editor
- `lib/supabase/client.ts` — browser Supabase client (Client Components)
- `lib/supabase/server.ts` — server Supabase client (Server Components, Route
  Handlers) — respects the logged-in user's session and RLS
- `lib/supabase/admin.ts` — **server-only** service-role client; bypasses RLS,
  used only for signed download URLs
- `lib/store.tsx` — the app's data layer: auth state + all Supabase queries,
  exposed via `useStore()`
- `middleware.ts` — refreshes the Supabase session cookie on every request
- `app/api/notes/[id]/download/route.ts` — verifies a purchase, then signs a
  short-lived Storage URL

## Bugs found and fixed (latest pass)

1. **Sellers could self-approve their own notes.** The old `notes` UPDATE
   policy had no `WITH CHECK`, so a seller could set `status = 'approved'`
   on their own listing directly. Fixed: sellers can now only edit their own
   note while it stays `pending`; only staff can change `status`.
2. **A doubt's author could rewrite an answer's text**, not just accept it —
   same missing-`WITH CHECK` issue. Fixed with a trigger
   (`protect_answer_fields`) that blocks any non-staff change to
   `body`/`user_id`/`doubt_id`.
3. **"My Purchases" showed other people's transactions.** `fetchPurchases()`
   had no `buyer_id` filter, so a student who *sells* notes got other
   buyers' purchase rows mixed into their own list (RLS legitimately lets
   sellers see those rows too, for admin/seller use). Fixed: the personal
   `purchases` state is now scoped to `buyer_id = me`; admins get a separate
   `pendingPayments` query that sees everyone's pending payments.
4. **Retrying a rejected payment threw a raw database error** because
   `purchases` has `UNIQUE(buyer_id, note_id)` but the buy flow used a plain
   `INSERT`. Fixed with an `upsert` on that constraint, plus a new
   `"buyers resubmit payment"` policy that lets a buyer redo their own
   pending/rejected row without ever being able to set it to `verified`
   themselves.

**Known, not-yet-fixed gaps** (flagging honestly rather than hiding them):
- PYQ/Question/Doubt filtering matches by subject **name**, not subject id.
  Harmless with only CSE seeded, but once two departments share a subject
  name (e.g. both CSE and IT teaching "Data Structures"), list pages could
  show cross-department content. Fix: filter by `subject_id` instead of the
  display name.
- No route protection — `/admin`, `/dashboard`, etc. don't redirect a logged-
  out visitor to `/login`. RLS still protects the data either way, but the
  UI looks broken instead of bouncing them to login.
- There's no "Accept answer" button in the UI yet even though the DB/RLS
  support it (see item 2 above).
- No end-user "Report" button (see item 3 in the original migration notes
  below).


## Content & legal notes

- Only upload/distribute PYQs, notes, and solutions you have permission to
  share.
- `MIN_NOTE_PRICE`/`MAX_NOTE_PRICE` (in `lib/types.ts`, enforced in both the
  UI and the `notes` table's check constraint) keep pricing sane.
- `PLATFORM_FEE_PERCENT` is a placeholder — decide your real commission and
  payout process before handling real money.

## Design notes

The visual language is a "library index card" system: warm paper background,
navy ink and indigo accents, gold for ratings/price, and a rotated "stamp"
badge for tags like *Must Study*, *Top Rated*, and *Bestseller*. Cards use a
punched "ticket edge" and dashed dividers to read like a torn exam slip or
purchase receipt.
