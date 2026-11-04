create or replace function public.cms_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.cms_is_admin() then raise exception 'Không có quyền quản trị' using errcode='42501'; end if;
 return jsonb_build_object('format','tonphuc-cms','version',1,'created_at',now(),
 'records',coalesce((select jsonb_agg(r order by r.id) from public.cms_records r),'[]'),
 'revisions',coalesce((select jsonb_agg(r order by r.created_at) from public.cms_revisions r),'[]'),
 'audit',coalesce((select jsonb_agg(r order by r.id) from public.cms_audit r),'[]'),
 'media',coalesce((select jsonb_agg(r order by r.id) from public.cms_media r),'[]'),
 'legacy',jsonb_build_object('posts',coalesce((select jsonb_agg(r) from public.posts r),'[]'),'categories',coalesce((select jsonb_agg(r) from public.categories r),'[]')));
end $$;
revoke all on function public.cms_snapshot() from public,anon;
grant execute on function public.cms_snapshot() to authenticated;
