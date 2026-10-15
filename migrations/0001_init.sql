-- 0001_init.sql
-- Initial schema for Daily Sorte & AstroEngine.
-- Tables used by the application via Supabase (PostgREST).

create extension if not exists pgcrypto;

-- Daily horoscope cache (see src/infrastructure/caching/horoscope-cache.ts)
create table if not exists public.horoscopes (
  id              uuid        primary key default gen_random_uuid(),
  user_id         text        references profiles(user_id),
  sign            text        not null,
  language        text        not null default 'pt',
  "date"          date        not null,
  payload         jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  constraint horoscopes_sign_language_date_key unique (sign, language, "date")
);

create index if not exists horoscopes_user_id_idx
  on public.horoscopes (user_id);

create index if not exists horoscopes_sign_language_date_idx
  on public.horoscopes (sign, language, "date");

-- User profiles (see src/infrastructure/database/models/profile.model.ts)
create table if not exists public.profiles (
  user_id             text        primary key,
  phone               text,
  preferred_language  text        not null default 'pt',
  notification_opt_in boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Generated natal charts (see src/infrastructure/adapters/repositories/supabase-astro.repository.ts)
create table if not exists public."natal-charts" (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null,
  sign          text,
  data          jsonb       not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists natal_charts_calculated_at_idx
  on public."natal-charts" (calculated_at desc);

-- Grants so the API roles (anon / authenticated) can access the tables.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Tell PostgREST to refresh its schema cache so the new tables are exposed.
notify pgrst, 'reload schema';
