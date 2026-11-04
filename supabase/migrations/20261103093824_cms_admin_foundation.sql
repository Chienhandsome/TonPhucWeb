-- Additive CMS migration. Existing posts/categories and source JSON are preserved.
create or replace function public.cms_is_admin() returns boolean
language sql stable set search_path='' as $$
 select coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin'
$$;

create table public.cms_records (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('product','product_category','tag','article','article_category','page','company','social','slider','slider_settings','system_image','seo','redirect')),
 title text not null check(length(trim(title))>0),
 slug text not null,
 status text not null default 'draft' check(status in ('draft','published','hidden')),
 data jsonb not null default '{}' check(jsonb_typeof(data)='object'),
 version integer not null default 1,
 deleted_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),
 unique(kind,slug)
);
create index cms_kind_updated_idx on public.cms_records(kind,updated_at desc);
create index cms_public_idx on public.cms_records(kind,status) where deleted_at is null;
create table public.cms_routes (
 path text primary key,
 record_id uuid unique references public.cms_records(id) on delete cascade
);
create table public.cms_revisions (
 id uuid primary key default gen_random_uuid(), record_id uuid not null references public.cms_records(id) on delete cascade,
 snapshot jsonb not null, created_at timestamptz not null default now(), actor uuid references auth.users(id)
);
create index cms_revisions_record_idx on public.cms_revisions(record_id,created_at desc);
create table public.cms_audit (
 id bigint generated always as identity primary key, record_id uuid, kind text, title text,
 action text not null, actor uuid, created_at timestamptz not null default now(), detail jsonb not null default '{}'
);
create table public.cms_media (
 id uuid primary key default gen_random_uuid(), path text not null unique, url text not null unique,
 filename text not null, mime_type text not null, bytes bigint not null check(bytes>=0),
 pending_deletion boolean not null default false, created_at timestamptz not null default now()
);

alter table public.cms_records enable row level security;
alter table public.cms_routes enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_audit enable row level security;
alter table public.cms_media enable row level security;
create policy cms_records_read on public.cms_records for select to anon,authenticated
 using(public.cms_is_admin() or (status='published' and deleted_at is null));
create policy cms_routes_read on public.cms_routes for select to anon,authenticated using(true);
create policy cms_revisions_read on public.cms_revisions for select to authenticated using(public.cms_is_admin());
create policy cms_audit_read on public.cms_audit for select to authenticated using(public.cms_is_admin());
create policy cms_media_read on public.cms_media for select to authenticated using(public.cms_is_admin());
revoke all on public.cms_records,public.cms_routes,public.cms_revisions,public.cms_audit,public.cms_media from anon,authenticated;
grant select on public.cms_records,public.cms_routes to anon,authenticated;
grant select on public.cms_revisions,public.cms_audit,public.cms_media to authenticated;

create or replace function public.cms_media_uses(asset_url text) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]'::jsonb) from (
 select r.id,r.title,r.kind,'current'::text as source from public.cms_records r where strpos(r.data::text,asset_url)>0
 union all
 select r.id,r.title,r.kind,'revision'::text from public.cms_revisions v join public.cms_records r on r.id=v.record_id where strpos(v.snapshot::text,asset_url)>0
 union all
 select p.id,p.title,'legacy_article','current' from public.posts p where p.cover_image=asset_url or strpos(coalesce(p.content,''),asset_url)>0
 ) x where public.cms_is_admin()
$$;

create or replace function public.cms_save(payload jsonb) returns public.cms_records
language plpgsql security definer set search_path='' as $$
declare old_row public.cms_records; result public.cms_records; item_id uuid; k text; s text; st text;
 d jsonb; parent public.cms_records; cat public.cms_records; route text; a record; expected integer; target text;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(817341);
 item_id:=coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
 select * into old_row from public.cms_records where id=item_id for update;
 expected:=coalesce((payload->>'version')::integer,0);
 if old_row.id is not null and old_row.version<>expected then raise exception 'Nội dung đã được sửa ở tab khác. Tải lại trước khi lưu.'; end if;
 k:=payload->>'kind'; s:=payload->>'slug'; st:=coalesce(payload->>'status','draft'); d:=coalesce(payload->'data','{}');
 if old_row.id is not null and old_row.kind<>k then raise exception 'Không đổi loại nội dung'; end if;
 if length(trim(coalesce(payload->>'title','')))=0 then raise exception 'Nhập tiêu đề'; end if;
 if s is null or s !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối'; end if;
 if nullif(d->>'schema_json','') is not null then perform (d->>'schema_json')::jsonb; end if;
 if d ? 'price' and nullif(d->>'price','') is not null and ((d->>'price')::numeric<0) then raise exception 'Giá không được âm'; end if;
 if nullif(d->>'stock_status','') is not null and d->>'stock_status' not in ('contact','available','unavailable') then raise exception 'Trạng thái kho không hợp lệ'; end if;
 if k in ('company','slider_settings') and exists(select 1 from public.cms_records where kind=k and id<>item_id) then raise exception 'Chỉ có một cấu hình loại này'; end if;
 if k='system_image' and s not in ('seal','logo','footer-logo','mobile-banner','banner-background','footer-background','favicon') then raise exception 'Vị trí ảnh hệ thống không hợp lệ'; end if;
 if k='page' and s not in ('gioi-thieu','lien-he','footer') then raise exception 'Trang tĩnh không hợp lệ'; end if;
 if k='product_category' and nullif(d->>'parent_id','') is not null then
  select * into parent from public.cms_records where id=(d->>'parent_id')::uuid and kind='product_category' and deleted_at is null;
  if parent.id is null or parent.id=item_id or nullif(parent.data->>'parent_id','') is not null then raise exception 'Danh mục tối đa hai cấp, không được tạo vòng lặp'; end if;
  if exists(select 1 from public.cms_records where data->>'parent_id'=item_id::text) then raise exception 'Danh mục có cấp con không thể chuyển thành cấp 2'; end if;
 end if;
 if k in ('product','article') and nullif(d->>'category_id','') is not null then
  select * into cat from public.cms_records where id=(d->>'category_id')::uuid and deleted_at is null and kind=case when k='product' then 'product_category' else 'article_category' end;
  if cat.id is null or (k='product' and nullif(cat.data->>'parent_id','') is not null) then raise exception 'Danh mục không hợp lệ'; end if;
 end if;
 if k='product' and nullif(d->>'secondary_category_id','') is not null and not exists(
  select 1 from public.cms_records where id=(d->>'secondary_category_id')::uuid and kind='product_category' and deleted_at is null and data->>'parent_id'=d->>'category_id'
 ) then raise exception 'Danh mục cấp 2 phải thuộc cấp 1 đã chọn'; end if;
 if k='product' and exists(select 1 from jsonb_array_elements_text(coalesce(d->'tag_ids','[]')) t(id) where not exists(select 1 from public.cms_records r where r.id::text=t.id and r.kind='tag' and r.deleted_at is null)) then raise exception 'Tag không hợp lệ'; end if;
 if st='published' and k in ('product','article','slider') then
  if nullif(d->>'image','') is null then raise exception 'Cần có ảnh chính trước khi xuất bản'; end if;
  if k='product' and (cat.id is null or cat.status<>'published') then raise exception 'Cần danh mục cấp 1 đang hiển thị'; end if;
 end if;
 if k='redirect' then
  route:=d->>'from'; target:=d->>'to';
  if route !~ '^/[a-zA-Z0-9/_-]*$' or target !~ '^/[a-zA-Z0-9/_-]*$' or route=target or route like '/admin%' or target like '/admin%' then raise exception 'Chuyển hướng phải là đường dẫn nội bộ hợp lệ, không trỏ vào admin'; end if;
  if exists(select 1 from public.cms_records where kind='redirect' and id<>item_id and (data->>'from'=route or data->>'to'=route or data->>'from'=target) and deleted_at is null) then raise exception 'URL trùng hoặc tạo chuỗi/vòng chuyển hướng'; end if;
 end if;
 for a in select * from public.cms_media where strpos(d::text,url)>0 loop
  if a.pending_deletion or not exists(select 1 from storage.objects where bucket_id='images' and name=a.path) then raise exception 'Ảnh đang xóa hoặc không còn trong kho'; end if;
 end loop;
 if k in ('product','product_category','article','article_category','tag') then
  route:=case when k='article' then '/bai-viet/' when k='article_category' then '/chuyen-muc/' when k='tag' then '/tag/' else '/' end||s;
  if route in ('/san-pham','/gioi-thieu','/lien-he','/tin-tuc','/admin','/robots','/sitemap') then raise exception 'URL dành riêng cho hệ thống'; end if;
  if exists(select 1 from public.cms_routes where path=route and record_id is distinct from item_id) then raise exception 'URL đã được dùng bởi nội dung khác'; end if;
 end if;
 if old_row.id is not null then
  insert into public.cms_revisions(record_id,snapshot,actor) values(item_id,to_jsonb(old_row),auth.uid());
  update public.cms_records set title=payload->>'title',slug=s,status=st,data=d,version=version+1,updated_at=now(),updated_by=auth.uid() where id=item_id returning * into result;
 else
  insert into public.cms_records(id,kind,title,slug,status,data,updated_by) values(item_id,k,payload->>'title',s,st,d,auth.uid()) returning * into result;
 end if;
 if k in ('product','product_category','article','article_category','tag') then
  delete from public.cms_routes where record_id=item_id;
  insert into public.cms_routes(path,record_id) values(route,item_id);
 end if;
 insert into public.cms_audit(record_id,kind,title,action,actor) values(item_id,k,result.title,case when old_row.id is null then 'create' when old_row.status<>st then st else 'update' end,auth.uid());
 return result;
end $$;

create or replace function public.cms_trash(item_id uuid, expected_version integer, operation text) returns void
language plpgsql security definer set search_path='' as $$
declare r public.cms_records; p public.cms_records;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(817341);
 select * into r from public.cms_records where id=item_id for update;
 if r.id is null or r.version<>expected_version then raise exception 'Nội dung đã thay đổi, tải lại danh sách'; end if;
 if r.kind in ('company','slider_settings','system_image','page','seo') and operation<>'restore' then raise exception 'Cấu hình hệ thống chỉ có thể sửa hoặc tắt'; end if;
 if operation in ('trash','purge') and r.kind in ('product_category','article_category') and exists(
 select 1 from public.cms_records where data->>'category_id'=item_id::text or data->>'secondary_category_id'=item_id::text or data->>'parent_id'=item_id::text
 ) then raise exception 'Danh mục còn nội dung hoặc cấp con. Chuyển nội dung trước khi xóa.'; end if;
 if operation='trash' and r.kind='tag' then
  for p in select * from public.cms_records where kind='product' and data->'tag_ids' @> jsonb_build_array(item_id::text) loop
   perform public.cms_save(to_jsonb(p)||jsonb_build_object('data',p.data||jsonb_build_object('tag_ids',(select coalesce(jsonb_agg(v),'[]'::jsonb) from jsonb_array_elements(p.data->'tag_ids') v where v<>to_jsonb(item_id::text)))));
  end loop;
 end if;
 if operation='purge' then
  if r.deleted_at is null then raise exception 'Phải đưa vào thùng rác trước'; end if;
  delete from public.cms_records where id=item_id;
 elsif operation in ('trash','restore') then
  insert into public.cms_revisions(record_id,snapshot,actor) values(r.id,to_jsonb(r),auth.uid());
  update public.cms_records set deleted_at=case when operation='trash' then now() else null end,version=version+1,updated_at=now(),updated_by=auth.uid() where id=item_id;
 else raise exception 'Thao tác không hợp lệ'; end if;
 insert into public.cms_audit(record_id,kind,title,action,actor) values(r.id,r.kind,r.title,operation,auth.uid());
end $$;

create or replace function public.cms_move_category(source_id uuid,destination_id uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare r public.cms_records; src public.cms_records; dest public.cms_records; n integer:=0;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(817341);
 select * into src from public.cms_records where id=source_id;
 select * into dest from public.cms_records where id=destination_id and deleted_at is null;
 if src.id=dest.id or dest.id is null or src.kind<>dest.kind or src.kind not in ('product_category','article_category') then raise exception 'Chọn danh mục đích phù hợp'; end if;
 for r in select * from public.cms_records where data->>'category_id'=source_id::text or data->>'secondary_category_id'=source_id::text loop
  perform public.cms_save(to_jsonb(r)||jsonb_build_object('data',r.data||case when src.kind='article_category' then jsonb_build_object('category_id',destination_id)
  when nullif(dest.data->>'parent_id','') is null then jsonb_build_object('category_id',destination_id,'secondary_category_id',null)
  else jsonb_build_object('category_id',dest.data->>'parent_id','secondary_category_id',destination_id) end)); n:=n+1;
 end loop;
 return n;
end $$;

create or replace function public.cms_import(items jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare item jsonb; n integer:=0;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>500 then raise exception 'Mỗi lượt tối đa 500 bản ghi'; end if;
 for item in select * from jsonb_array_elements(items) loop perform public.cms_save(item); n:=n+1; end loop;
 return n;
end $$;

create or replace function public.cms_media_register(payload jsonb) returns public.cms_media
language plpgsql security definer set search_path='' as $$
declare r public.cms_media;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 if not exists(select 1 from storage.objects where bucket_id='images' and name=payload->>'path') then raise exception 'Chưa upload file'; end if;
 insert into public.cms_media(path,url,filename,mime_type,bytes) values(payload->>'path',payload->>'url',payload->>'filename',payload->>'mime_type',(payload->>'bytes')::bigint) returning * into r;
 return r;
end $$;
create or replace function public.cms_media_delete_prepare(asset_id uuid,cancel boolean default false) returns text
language plpgsql security definer set search_path='' as $$
declare r public.cms_media;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(817341);
 select * into r from public.cms_media where id=asset_id for update;
 if r.id is null then raise exception 'Không tìm thấy ảnh'; end if;
 if not cancel and jsonb_array_length(public.cms_media_uses(r.url))>0 then raise exception 'Ảnh đang dùng ở nội dung hoặc lịch sử, không thể xóa'; end if;
 update public.cms_media set pending_deletion=not cancel where id=asset_id;
 return r.path;
end $$;
create or replace function public.cms_media_delete_finish(asset_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 if exists(select 1 from public.cms_media m join storage.objects s on s.bucket_id='images' and s.name=m.path where m.id=asset_id) then raise exception 'File chưa xóa khỏi Storage'; end if;
 delete from public.cms_media where id=asset_id and pending_deletion;
end $$;

-- Replacing the broad ALL policy also prevents overwriting referenced files.
drop policy "authenticated write images" on storage.objects;
create policy cms_image_insert on storage.objects for insert to authenticated with check(bucket_id='images' and public.cms_is_admin());
create policy cms_image_delete on storage.objects for delete to authenticated using(bucket_id='images' and public.cms_is_admin() and exists(select 1 from public.cms_media m where m.path=name and m.pending_deletion));

create or replace function public.cms_event(event_action text,event_detail jsonb default '{}') returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.cms_is_admin() or event_action not in ('export','backup','restore','import') then raise exception 'Không có quyền' using errcode='42501'; end if;
 insert into public.cms_audit(action,actor,detail) values(event_action,auth.uid(),event_detail);
end $$;

-- Public cannot call privileged RPCs. Authorization is checked again inside each function.
revoke all on function public.cms_save(jsonb),public.cms_trash(uuid,integer,text),public.cms_move_category(uuid,uuid),public.cms_import(jsonb),public.cms_media_register(jsonb),public.cms_media_delete_prepare(uuid,boolean),public.cms_media_delete_finish(uuid),public.cms_event(text,jsonb),public.cms_media_uses(text) from public,anon;
grant execute on function public.cms_save(jsonb),public.cms_trash(uuid,integer,text),public.cms_move_category(uuid,uuid),public.cms_import(jsonb),public.cms_media_register(jsonb),public.cms_media_delete_prepare(uuid,boolean),public.cms_media_delete_finish(uuid),public.cms_event(text,jsonb),public.cms_media_uses(text) to authenticated;
