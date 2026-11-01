-- Schema Supabase cho website Gas Lạnh Tôn Phúc.
-- Chạy file này trong Supabase Dashboard → SQL Editor, trên project mới.
-- Không chứa secret. Tài khoản admin tạo riêng trong Authentication, không tạo trong SQL này.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tự cập nhật updated_at khi sửa bài.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Bucket ảnh bìa. Nếu bucket đã tồn tại thì bỏ qua bước insert này.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Chỉ user có app_metadata.role = admin được quản trị.
-- Khách chỉ đọc được bài đã xuất bản và danh mục.
-- app_metadata chỉ thay đổi qua Dashboard/Admin API/SQL tin cậy, không dùng user_metadata.
alter table public.categories enable row level security;
alter table public.posts enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts
  for select to anon, authenticated using (published = true);

drop policy if exists "authenticated write categories" on public.categories;
create policy "authenticated write categories" on public.categories
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "authenticated write posts" on public.posts;
create policy "authenticated write posts" on public.posts
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Storage: ảnh bìa đọc công khai; chỉ tài khoản đăng nhập mới upload/xóa.
drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'images');

drop policy if exists "authenticated write images" on storage.objects;
create policy "authenticated write images" on storage.objects
  for all to authenticated
  using (bucket_id = 'images' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'images' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

grant usage on schema public to anon, authenticated;
revoke all on public.categories, public.posts from anon, authenticated;
grant select on public.categories, public.posts to anon;
grant select, insert, update, delete on public.categories, public.posts to authenticated;
create index if not exists posts_category_id_idx on public.posts(category_id);
create index if not exists posts_published_created_at_idx on public.posts(published, created_at desc);
