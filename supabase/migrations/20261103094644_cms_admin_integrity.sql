-- Additional invariants and recovery. No source content is imported here.
create or replace function public.cms_module_configured(module_kind text) returns boolean
language sql stable security definer set search_path='' as $$
 select module_kind in ('slider','page','company','seo','system_image') and exists(select 1 from public.cms_records where kind=module_kind)
$$;
grant execute on function public.cms_module_configured(text) to anon,authenticated;

create or replace function public.cms_restore(archive jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare item jsonb; saved public.cms_records; rev jsonb; a jsonb; n integer:=0;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(817341);
 if exists(select 1 from public.cms_records) then raise exception 'Chỉ khôi phục toàn bộ khi CMS đích trống'; end if;
 if archive->>'version'<>'1' then raise exception 'Phiên bản archive không hỗ trợ'; end if;
 for item in select x from jsonb_array_elements(archive->'records') x order by
 case when x->>'kind' in ('product_category','article_category','tag') then case when nullif(x->'data'->>'parent_id','') is null then 0 else 1 end else 2 end loop
  saved:=public.cms_save(item-'version');
  update public.cms_records set version=greatest(1,coalesce((item->>'version')::integer,1)),
   deleted_at=nullif(item->>'deleted_at','')::timestamptz,
   created_at=coalesce(nullif(item->>'created_at','')::timestamptz,now()),
   updated_at=coalesce(nullif(item->>'updated_at','')::timestamptz,now()) where id=saved.id;
  n:=n+1;
 end loop;
 for rev in select * from jsonb_array_elements(coalesce(archive->'revisions','[]')) loop
  if exists(select 1 from public.cms_records where id=(rev->>'record_id')::uuid) then
   insert into public.cms_revisions(record_id,snapshot,created_at) values((rev->>'record_id')::uuid,(rev->'snapshot')||jsonb_build_object('_restored_actor',rev->>'actor'),(rev->>'created_at')::timestamptz);
  end if;
 end loop;
 for a in select * from jsonb_array_elements(coalesce(archive->'audit','[]')) loop
  insert into public.cms_audit(record_id,kind,title,action,actor,created_at,detail) values(nullif(a->>'record_id','')::uuid,a->>'kind',a->>'title','restored:'||(a->>'action'),nullif(a->>'actor','')::uuid,(a->>'created_at')::timestamptz,coalesce(a->'detail','{}'));
 end loop;
 -- Legacy tables are preserved, never overwritten by restore. Missing IDs can be restored.
 for item in select * from jsonb_array_elements(coalesce(archive->'legacy'->'categories','[]')) loop
  insert into public.categories(id,name,slug,created_at) values((item->>'id')::uuid,item->>'name',item->>'slug',(item->>'created_at')::timestamptz) on conflict do nothing;
 end loop;
 for item in select * from jsonb_array_elements(coalesce(archive->'legacy'->'posts','[]')) loop
  insert into public.posts(id,title,slug,excerpt,content,cover_image,category_id,published,created_at,updated_at)
  values((item->>'id')::uuid,item->>'title',item->>'slug',item->>'excerpt',item->>'content',item->>'cover_image',nullif(item->>'category_id','')::uuid,(item->>'published')::boolean,(item->>'created_at')::timestamptz,(item->>'updated_at')::timestamptz) on conflict do nothing;
 end loop;
 insert into public.cms_audit(action,actor,detail) values('restore',auth.uid(),jsonb_build_object('records',n));
 return n;
end $$;
revoke all on function public.cms_restore(jsonb) from public,anon;
grant execute on function public.cms_restore(jsonb) to authenticated;

create or replace function public.cms_validate_record() returns trigger
language plpgsql security definer set search_path='' as $$
declare entry jsonb; key text; t text;
begin
 if new.data ? 'schema_json' and nullif(new.data->>'schema_json','') is not null then
  if jsonb_typeof((new.data->>'schema_json')::jsonb) not in ('object','array') then raise exception 'Schema cần là JSON object hoặc mảng'; end if;
 end if;
 foreach key in array array['blocks','functions','origin_content','packaging','footer_links'] loop
  if new.data ? key then
   if jsonb_typeof(new.data->key)<>'array' then raise exception 'Nội dung khối cần là mảng'; end if;
   for entry in select * from jsonb_array_elements(new.data->key) loop
    if entry->>'type' not in ('paragraph','heading','image','table') or entry->>'type' is null then raise exception 'Loại khối không hợp lệ'; end if;
    if entry->>'type'='image' and nullif(entry->>'src','') is not null and entry->>'src' !~ '^(https?://|/[^/])' then raise exception 'URL ảnh không hợp lệ'; end if;
   end loop;
  end if;
 end loop;
 foreach key in array array['url','href','maps_url','website','image','favicon'] loop
  t:=new.data->>key;
  if nullif(t,'') is not null and t !~ '^(https?://|/[^/]|tel:|mailto:)' then raise exception 'Link không hợp lệ: %',key; end if;
 end loop;
 if new.kind='slider_settings' and nullif(new.data->>'delay','') is not null and ((new.data->>'delay')::numeric<2 or (new.data->>'delay')::numeric>300) then raise exception 'Thời gian tự chuyển từ 2 đến 300 giây'; end if;
 if nullif(new.data->>'background_color','') is not null and new.data->>'background_color' !~ '^#[a-fA-F0-9]{6}$' then raise exception 'Màu nền cần dạng #rrggbb'; end if;
 return new;
end $$;
create trigger cms_records_validate before insert or update on public.cms_records for each row execute function public.cms_validate_record();

-- Automatic permanent deletion is not enabled. Expired trash stays recoverable until manually confirmed.
