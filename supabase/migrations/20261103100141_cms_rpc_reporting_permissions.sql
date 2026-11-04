-- Trigger entry points are not application RPCs.
alter function public.cms_validate_record() security invoker;
revoke all on function public.cms_validate_record() from public,anon,authenticated;
create or replace function public.cms_import(items jsonb) returns integer language plpgsql security definer set search_path='' as $$
declare item jsonb; n integer:=0; saved public.cms_records;
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>500 then raise exception 'Mỗi lượt tối đa 500 bản ghi'; end if;
 for item in select * from jsonb_array_elements(items) loop
  begin
   saved:=public.cms_save(item);
   if nullif(item->>'deleted_at','') is not null then perform public.cms_trash(saved.id,saved.version,'trash');end if;
  exception when others then raise exception 'Dòng % (%): %',coalesce((item->>'_line')::integer,n+1),coalesce(item->>'title',''),SQLERRM;
  end;
  n:=n+1;
 end loop;
 return n;
end $$;
