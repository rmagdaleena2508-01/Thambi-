-- Thambi core schema: tables, constraints and indexes.
-- Security rules live in the next migration; functions and triggers after that.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default 'Neighbour' check (char_length(display_name) between 1 and 60),
  locality      text check (char_length(locality) <= 80),
  role          text not null default 'citizen'
                check (role in ('citizen', 'moderator', 'official', 'admin')),
  trust_score   numeric(4, 2) not null default 1.00 check (trust_score between 0 and 5),
  created_at    timestamptz not null default now()
);
comment on table public.profiles is 'One row per signed-in person. Role and trust score are server-only.';

-- ---------------------------------------------------------------------------
-- Reference data (read-only to the public)
-- ---------------------------------------------------------------------------
create table public.authorities (
  id                 text primary key,
  office             text not null,
  kind               text not null,
  handles            text[] not null default '{}',
  area               text,
  phone_published    text,
  phone_dial         text,
  email              text,
  website            text,
  source_url         text not null,
  page_last_updated  text,
  fetched_on         date,
  status             text not null default 'extracted'
                     check (status in ('extracted', 'verified', 'uncertain')),
  verified_on        date,
  notes              text
);
comment on table public.authorities is 'Official office channels only, loaded from data/authorities.csv. Only status = verified is used for routing.';

create table public.routing_rules (
  id            bigint generated always as identity primary key,
  category      text not null,
  keywords      text[] not null default '{}',
  authority_id  text not null references public.authorities (id),
  area          text,
  rank          int not null default 100,
  source_url    text not null,
  notes         text
);

create table public.wards (
  id        int primary key,
  name      text,
  zone      text,
  boundary  extensions.geography(multipolygon, 4326) not null
);
create index wards_boundary_idx on public.wards using gist (boundary);

create table public.sensitive_places (
  id        bigint generated always as identity primary key,
  kind      text not null check (kind in ('school', 'hospital')),
  name      text,
  location  extensions.geography(point, 4326) not null,
  source    text not null
);
create index sensitive_places_location_idx on public.sensitive_places using gist (location);

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid default auth.uid() references public.profiles (id) on delete set null,
  category          text not null check (category in (
                      'road_damage', 'water_leak', 'sewage', 'garbage', 'streetlight',
                      'stormwater_drain', 'pollution', 'electricity', 'other')),
  title             text check (char_length(title) <= 140),
  description       text not null check (char_length(description) between 10 and 2000),
  title_ta          text,
  summary_en        text,
  summary_ta        text,
  location          extensions.geography(point, 4326) not null,
  road_name         text check (char_length(road_name) <= 120),
  locality          text check (char_length(locality) <= 120),
  landmark          text check (char_length(landmark) <= 120),
  ward_id           int references public.wards (id),
  citizen_severity  smallint not null check (citizen_severity between 1 and 5),
  text_severity     smallint check (text_severity between 1 and 5),
  severity_reason   text,
  danger_flags      text[] not null default '{}',
  affected_groups   text[] not null default '{}',
  open_since        text not null default 'days' check (open_since in ('days', 'weeks', 'months', 'year+')),
  status            text not null default 'reported' check (status in (
                      'reported', 'verified', 'sent', 'acknowledged', 'in_progress',
                      'fixed', 'confirmed', 'reopened', 'rejected')),
  priority          numeric(5, 2) not null default 0,
  priority_reason   text,
  support_count     int not null default 0,
  authority_id      text references public.authorities (id),
  routing_reason    text,
  embedding         extensions.vector(768),
  review_state      text not null default 'pending' check (review_state in ('pending', 'ok', 'needs_review', 'hidden')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_seen_at      timestamptz not null default now()
);
comment on column public.reports.text_severity is 'Severity read from the citizen''s description (AI + keyword layer). Version 1 does not analyse photos or videos.';
comment on column public.reports.review_state is 'pending until the server has read the report; only ok is public.';

create index reports_location_idx  on public.reports using gist (location);
create index reports_feed_idx      on public.reports (review_state, status, priority desc);
create index reports_reporter_idx  on public.reports (reporter_id, created_at desc);
create index reports_embedding_idx on public.reports using hnsw (embedding extensions.vector_cosine_ops);

create table public.report_media (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports (id) on delete cascade,
  uploader_id   uuid references public.profiles (id) on delete set null,
  kind          text not null check (kind in ('photo', 'video', 'after')),
  path_public   text,
  path_private  text not null,
  phash         text,
  exif_lat      double precision,
  exif_lng      double precision,
  exif_time     timestamptz,
  created_at    timestamptz not null default now()
);
comment on table public.report_media is 'Rows written by the server only. path_private, phash and exif_* are never readable by the public.';
create index report_media_report_idx on public.report_media (report_id);
create index report_media_phash_idx  on public.report_media (phash);

-- ---------------------------------------------------------------------------
-- Community
-- ---------------------------------------------------------------------------
create table public.supports (
  report_id   uuid not null references public.reports (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  frequency   text not null default 'rarely' check (frequency in ('daily', 'weekly', 'rarely')),
  created_at  timestamptz not null default now(),
  primary key (report_id, user_id)
);
create index supports_user_idx on public.supports (user_id, created_at desc);

create table public.comments (
  id                 uuid primary key default gen_random_uuid(),
  report_id          uuid not null references public.reports (id) on delete cascade,
  author_id          uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body               text not null check (char_length(body) between 1 and 1000),
  moderation         text not null default 'pending' check (moderation in ('pending', 'ok', 'blocked')),
  moderation_reason  text,
  created_at         timestamptz not null default now()
);
create index comments_report_idx on public.comments (report_id, created_at);
create index comments_author_idx on public.comments (author_id, created_at desc);

create table public.fixed_confirmations (
  report_id   uuid not null references public.reports (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  is_fixed    boolean not null,
  created_at  timestamptz not null default now(),
  primary key (report_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Accountability
-- ---------------------------------------------------------------------------
create table public.status_events (
  id              bigint generated always as identity primary key,
  report_id       uuid not null references public.reports (id) on delete cascade,
  from_status     text,
  to_status       text not null,
  actor_id        uuid references public.profiles (id) on delete set null,
  note            text,
  proof_media_id  uuid references public.report_media (id),
  prev_hash       text,
  hash            text not null,
  created_at      timestamptz not null default now()
);
comment on table public.status_events is 'Append-only, hash-chained history of every status change.';
create index status_events_report_idx on public.status_events (report_id, id);

create table public.flags (
  id           bigint generated always as identity primary key,
  target_type  text not null check (target_type in ('report', 'comment', 'user', 'support')),
  target_id    text not null,
  reason       text not null check (char_length(reason) between 1 and 500),
  source       text not null default 'user' check (source in ('ai', 'user', 'rule')),
  created_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  resolved_by  uuid references public.profiles (id) on delete set null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index flags_open_idx on public.flags (resolved_at) where resolved_at is null;
