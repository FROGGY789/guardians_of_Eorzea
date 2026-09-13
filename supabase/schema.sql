-- ============================================================================
--  << LUX >> Free Company Archive — Supabase schema
--  Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 "Run" 하세요.
--  (한 번만 실행하면 됩니다. 재실행해도 안전하도록 대부분 IF NOT EXISTS 를 씁니다.)
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------------

-- 부대원 프로필 (auth.users 와 1:1)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  character_name text not null,
  job           text,
  rank          text,
  role          text not null default 'pending' check (role in ('admin','member','pending')),
  can_write     boolean not null default false,
  bio           text,
  avatar_url    text,
  photos_count  int not null default 0,
  joined_at     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- 갤러리 게시글 (대표 사진 = cover_url, 여러 장의 사진을 담는 "포스트")
create table if not exists public.gallery_posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  caption    text,
  location   text,
  category   text not null default '일상',
  cover_url  text,
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 게시글에 속한 개별 사진들
create table if not exists public.gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.gallery_posts(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 공지
create table if not exists public.notices (
  id         uuid primary key default gen_random_uuid(),
  tag        text not null default '공지',
  title      text not null,
  body       text,
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 일정
create table if not exists public.schedule_events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  event_at   timestamptz not null,
  note       text,
  kind       text not null default 'raid',
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 레이드 기록
create table if not exists public.raids (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  memo       text,
  state      text not null default 'PROGRESS' check (state in ('CLEARED','PROGRESS','PLANNED')),
  progress   int not null default 0,
  pulls      int not null default 0,
  party      text,
  cover_url  text,
  cleared_on text,
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 하우징
create table if not exists public.housing_rooms (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  decorated_by text,
  image_url    text,
  featured     boolean not null default false,
  author_id    uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- 일지
create table if not exists public.diary_entries (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  image_url  text,
  caption    text,
  author_id  uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 링크 모음
create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  group_name  text not null default '기타',
  name        text not null,
  description text,
  url         text not null,
  author_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 방명록
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  body        text not null,
  author_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gallery_posts_created on public.gallery_posts (created_at desc);
create index if not exists idx_gallery_photos_post on public.gallery_photos (post_id);
create index if not exists idx_gallery_posts_author on public.gallery_posts (author_id);

-- ---------------------------------------------------------------------------
--  Helper functions (SECURITY DEFINER → RLS 재귀 없이 권한 판단)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

create or replace function public.is_approved(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and role in ('admin','member'));
$$;

create or replace function public.can_write(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid and (role = 'admin' or (role = 'member' and can_write))
  );
$$;

-- ---------------------------------------------------------------------------
--  Triggers
-- ---------------------------------------------------------------------------

-- 가입 시 프로필 자동 생성. 첫 번째로 가입하는 사람은 자동으로 부대장(admin)이 됩니다.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from public.profiles;
  insert into public.profiles (id, character_name, job, role, can_write, joined_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'character_name',''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'job',''),
    case when existing_count = 0 then 'admin'  else 'pending' end,
    case when existing_count = 0 then true     else false     end,
    now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 권한 상승 방지: 관리자가 아닌 사용자는 자신의 role / can_write 를 바꿀 수 없습니다.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.can_write := old.can_write;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- 부대원별 사진 장수 집계 (갤러리 사진 추가/삭제 시 자동 반영)
create or replace function public.sync_photo_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  if tg_op = 'INSERT' then
    select author_id into aid from public.gallery_posts where id = new.post_id;
    if aid is not null then
      update public.profiles set photos_count = photos_count + 1 where id = aid;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select author_id into aid from public.gallery_posts where id = old.post_id;
    if aid is not null then
      update public.profiles set photos_count = greatest(photos_count - 1, 0) where id = aid;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_photo_count on public.gallery_photos;
create trigger trg_photo_count
  after insert or delete on public.gallery_photos
  for each row execute function public.sync_photo_count();

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.gallery_posts   enable row level security;
alter table public.gallery_photos  enable row level security;
alter table public.notices         enable row level security;
alter table public.schedule_events enable row level security;
alter table public.raids           enable row level security;
alter table public.housing_rooms   enable row level security;
alter table public.diary_entries   enable row level security;
alter table public.links           enable row level security;
alter table public.guestbook       enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated using (public.is_admin(auth.uid()));

-- 일반 콘텐츠 테이블용 정책 생성 매크로 (읽기: 승인된 부대원 / 쓰기: 권한 보유자 or 관리자)
do $$
declare t text;
begin
  foreach t in array array[
    'gallery_posts','notices','schedule_events','raids','housing_rooms','diary_entries','links'
  ]
  loop
    execute format('drop policy if exists %I_select on public.%I;', t, t);
    execute format('create policy %I_select on public.%I for select to authenticated using (public.is_approved(auth.uid()));', t, t);

    execute format('drop policy if exists %I_insert on public.%I;', t, t);
    execute format('create policy %I_insert on public.%I for insert to authenticated with check (public.can_write(auth.uid()) and author_id = auth.uid());', t, t);

    execute format('drop policy if exists %I_update on public.%I;', t, t);
    execute format('create policy %I_update on public.%I for update to authenticated using (author_id = auth.uid() or public.is_admin(auth.uid())) with check (author_id = auth.uid() or public.is_admin(auth.uid()));', t, t);

    execute format('drop policy if exists %I_delete on public.%I;', t, t);
    execute format('create policy %I_delete on public.%I for delete to authenticated using (author_id = auth.uid() or public.is_admin(auth.uid()));', t, t);
  end loop;
end $$;

-- gallery_photos (부모 게시글 작성자 또는 관리자만 편집) --------------------
drop policy if exists gallery_photos_select on public.gallery_photos;
create policy gallery_photos_select on public.gallery_photos
  for select to authenticated using (public.is_approved(auth.uid()));

drop policy if exists gallery_photos_insert on public.gallery_photos;
create policy gallery_photos_insert on public.gallery_photos
  for insert to authenticated with check (
    public.can_write(auth.uid())
    and exists (
      select 1 from public.gallery_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists gallery_photos_delete on public.gallery_photos;
create policy gallery_photos_delete on public.gallery_photos
  for delete to authenticated using (
    exists (
      select 1 from public.gallery_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- guestbook (승인된 부대원 누구나 작성) -------------------------------------
drop policy if exists guestbook_select on public.guestbook;
create policy guestbook_select on public.guestbook
  for select to authenticated using (public.is_approved(auth.uid()));

drop policy if exists guestbook_insert on public.guestbook;
create policy guestbook_insert on public.guestbook
  for insert to authenticated with check (
    public.is_approved(auth.uid()) and (author_id = auth.uid() or author_id is null)
  );

drop policy if exists guestbook_delete on public.guestbook;
create policy guestbook_delete on public.guestbook
  for delete to authenticated using (author_id = auth.uid() or public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
--  Storage (이미지 업로드 버킷)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "gallery public read" on storage.objects;
create policy "gallery public read" on storage.objects
  for select using (bucket_id = 'gallery');

drop policy if exists "gallery write upload" on storage.objects;
create policy "gallery write upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.can_write(auth.uid()));

drop policy if exists "gallery owner delete" on storage.objects;
create policy "gallery owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and (owner = auth.uid() or public.is_admin(auth.uid())));

-- ============================================================================
--  끝. 이제 사이트에서 "가입 신청" 을 하면 첫 사용자는 자동으로 부대장이 됩니다.
--  이미 가입한 뒤에 특정 계정을 부대장으로 바꾸려면 아래처럼 실행하세요:
--
--    update public.profiles set role = 'admin', can_write = true
--    where id = (select id from auth.users where email = 'you@example.com');
-- ============================================================================
