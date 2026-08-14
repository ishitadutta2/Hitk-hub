-- HITK Hub — database schema
-- Run this whole file once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.

-- ============================================================
-- 1. REFERENCE TABLES (departments, semesters, subjects)
-- ============================================================

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique
);

create table if not exists semesters (
  id uuid primary key default gen_random_uuid(),
  year int not null check (year between 1 and 4),
  semester_number int not null check (semester_number between 1 and 8),
  name text not null
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id) on delete cascade,
  semester_id uuid references semesters(id) on delete set null,
  name text not null,
  code text
);

-- ============================================================
-- 2. PROFILES (one row per auth.users row)
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  department_id uuid references departments(id) on delete set null,
  year int check (year between 1 and 4),
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'moderator', 'admin')),
  xp int not null default 0,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 3. PYQS + QUESTIONS
-- ============================================================

create table if not exists pyqs (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  exam_year int not null,
  exam_type text not null check (exam_type in ('Mid Sem', 'End Sem')),
  file_path text,
  uploaded_by uuid references profiles(id) on delete set null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  unit text not null,
  question text not null,
  solution text not null,
  importance text not null default 'Important' check (importance in ('Important', 'Frequent', 'Must Study')),
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. NOTES MARKETPLACE
-- ============================================================

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text not null default '',
  price int not null check (price between 9 and 499),
  pages int not null default 1,
  preview_pages int not null default 0,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  sales_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  note_id uuid not null references notes(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  amount int not null,
  payment_method text not null default 'upi_manual' check (payment_method in ('upi_manual', 'razorpay')),
  payment_status text not null default 'pending_verification'
    check (payment_status in ('pending_verification', 'verified', 'rejected')),
  payment_reference text,
  created_at timestamptz not null default now(),
  unique (buyer_id, note_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  unique (note_id, buyer_id)
);

-- ============================================================
-- 5. DOUBTS FORUM
-- ============================================================

create table if not exists doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  body text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  doubt_id uuid not null references doubts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. REPORTS (moderation)
-- ============================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete set null,
  content_type text not null check (content_type in ('note', 'doubt', 'answer', 'pyq', 'question')),
  content_id uuid not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table departments enable row level security;
alter table semesters enable row level security;
alter table subjects enable row level security;
alter table profiles enable row level security;
alter table pyqs enable row level security;
alter table questions enable row level security;
alter table notes enable row level security;
alter table purchases enable row level security;
alter table reviews enable row level security;
alter table doubts enable row level security;
alter table answers enable row level security;
alter table reports enable row level security;

-- Helper: is the current user an admin/moderator?
create or replace function public.is_staff()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

-- Reference tables: readable by anyone signed in, writable only via SQL editor / staff.
create policy "read departments" on departments for select using (true);
create policy "read semesters" on semesters for select using (true);
create policy "read subjects" on subjects for select using (true);
create policy "staff write departments" on departments for all using (is_staff());
create policy "staff write semesters" on semesters for all using (is_staff());
create policy "staff write subjects" on subjects for all using (is_staff());

-- Profiles
create policy "read all profiles" on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- PYQs
create policy "read approved pyqs" on pyqs for select using (status = 'approved' or is_staff());
create policy "upload pyqs" on pyqs for insert with check (auth.uid() = uploaded_by);
create policy "staff moderate pyqs" on pyqs for update using (is_staff());

-- Questions
create policy "read questions" on questions for select using (true);
create policy "add questions" on questions for insert with check (auth.uid() = created_by);
create policy "staff edit questions" on questions for update using (is_staff());

-- Notes
create policy "read approved or own notes" on notes
  for select using (status = 'approved' or seller_id = auth.uid() or is_staff());
create policy "sellers create notes" on notes
  for insert with check (auth.uid() = seller_id);
-- BUGFIX: the old single policy had no WITH CHECK, so Postgres reused USING
-- (seller_id = auth.uid()) as the check too — meaning a seller could set
-- status = 'approved' on their own note directly, skipping admin review.
-- Split it: staff can change anything; sellers can only edit their own note
-- WHILE it's still pending, and the WITH CHECK forces status to stay
-- 'pending' on their edits — only staff can move it to approved/rejected.
drop policy if exists "sellers update own pending notes" on notes;
drop policy if exists "staff moderate notes" on notes;
drop policy if exists "sellers edit own pending notes" on notes;
create policy "staff moderate notes" on notes
  for update using (is_staff());
create policy "sellers edit own pending notes" on notes
  for update using (seller_id = auth.uid() and status = 'pending')
  with check (seller_id = auth.uid() and status = 'pending');

-- Purchases: buyer or seller of the note (or staff) can see it.
create policy "read own purchases" on purchases
  for select using (buyer_id = auth.uid() or seller_id = auth.uid() or is_staff());
create policy "buyers create purchase" on purchases
  for insert with check (buyer_id = auth.uid());
create policy "staff verify purchase" on purchases
  for update using (is_staff());
-- Needed for the upsert-based retry in buyNote(): lets a buyer resubmit
-- their own rejected/pending payment, but the WITH CHECK forces the new
-- status back to pending_verification — they can never set it to
-- 'verified' themselves.
create policy "buyers resubmit payment" on purchases
  for update using (buyer_id = auth.uid() and payment_status in ('pending_verification', 'rejected'))
  with check (buyer_id = auth.uid() and payment_status = 'pending_verification');

-- Reviews
create policy "read reviews" on reviews for select using (true);
create policy "buyers review purchased notes" on reviews
  for insert with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from purchases
      where purchases.note_id = reviews.note_id
        and purchases.buyer_id = auth.uid()
        and purchases.payment_status = 'verified'
    )
  );

-- Doubts & answers
create policy "read doubts" on doubts for select using (true);
create policy "post doubts" on doubts for insert with check (auth.uid() = user_id);
create policy "read answers" on answers for select using (true);
create policy "post answers" on answers for insert with check (auth.uid() = user_id);
-- BUGFIX: the old policy had no WITH CHECK, so the doubt owner could rewrite
-- ANY column of someone else's answer (body, author, etc.), not just accept
-- it. RLS policies alone can't compare against the OLD row, so the actual
-- column lock lives in the trigger below; this policy just controls who may
-- attempt an update at all.
drop policy if exists "accept own doubt's answer" on answers;
create policy "accept own doubt's answer" on answers
  for update using (
    exists (select 1 from doubts where doubts.id = answers.doubt_id and doubts.user_id = auth.uid())
    or is_staff()
  );

create or replace function public.protect_answer_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not is_staff() then
    if new.body <> old.body or new.user_id <> old.user_id or new.doubt_id <> old.doubt_id then
      raise exception 'Only is_accepted/upvotes may be changed by a non-staff user.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_answers_before_update on answers;
create trigger protect_answers_before_update
  before update on answers
  for each row execute procedure public.protect_answer_fields();

-- Reports
create policy "anyone reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "staff read reports" on reports for select using (is_staff());
create policy "staff resolve reports" on reports for update using (is_staff());

-- ============================================================
-- 8. STORAGE — private "notes" bucket
-- ============================================================
-- Run this after also creating the bucket in the Storage tab (see README):
--   Name: notes   |   Public: OFF

insert into storage.buckets (id, name, public)
values ('notes', 'notes', false)
on conflict (id) do nothing;

create policy "sellers upload to own folder" on storage.objects
  for insert with check (
    bucket_id = 'notes' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "sellers read own files" on storage.objects
  for select using (
    bucket_id = 'notes' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Buyers do NOT get a storage RLS policy here on purpose — downloads for
-- buyers are served through /api/notes/[id]/download using the service-role
-- key after the server verifies a 'verified' purchase row. This is the
-- "temporary signed URL after verified payment" flow from the project plan.
