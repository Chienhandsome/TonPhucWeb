-- All fixtures and audit entries are rolled back. No auth users are created or changed.
begin;
select set_config('request.jwt.claims',json_build_object('sub',(select id from auth.users where raw_app_meta_data->>'role'='admin' limit 1),'role','authenticated','app_metadata',json_build_object('role','admin'))::text,true);
do $$
declare cat public.cms_records; child public.cms_records; p public.cms_records; imported integer; failed boolean;
begin
 cat:=public.cms_save('{"kind":"product_category","title":"CMS QA category","slug":"cms-qa-category","status":"published","data":{}}');
 child:=public.cms_save(jsonb_build_object('kind','product_category','title','CMS QA child','slug','cms-qa-child','status','published','data',jsonb_build_object('parent_id',cat.id)));
 p:=public.cms_save('{"kind":"product","title":"CMS QA draft","slug":"cms-qa-draft","status":"draft","data":{}}');
 if p.status<>'draft' then raise exception 'Draft failed'; end if;
 failed:=false;
 begin perform public.cms_save(to_jsonb(p)||'{"status":"published"}'); exception when others then failed:=true; end;
 if not failed then raise exception 'Published without image/category'; end if;
 p:=public.cms_save(to_jsonb(p)||jsonb_build_object('status','published','data',jsonb_build_object('category_id',cat.id,'secondary_category_id',child.id,'image','/source/cms-qa-image.jpg')));
 failed:=false;
 begin perform public.cms_save(to_jsonb(p)||jsonb_build_object('version',p.version-1)); exception when others then failed:=true; end;
 if not failed then raise exception 'Concurrent edit not blocked'; end if;
 failed:=false;
 begin perform public.cms_trash(cat.id,cat.version,'trash'); exception when others then failed:=true; end;
 if not failed then raise exception 'Nonempty category deleted'; end if;
 perform public.cms_trash(p.id,p.version,'trash');
 select * into p from public.cms_records where id=p.id;
 if p.deleted_at is null then raise exception 'Trash failed'; end if;
 perform public.cms_trash(p.id,p.version,'restore');
 failed:=false;
 begin perform public.cms_import('[{"kind":"product","title":"Atomic first","slug":"cms-qa-atomic","status":"draft","data":{}},{"kind":"product","title":"","slug":"cms-qa-invalid","status":"draft","data":{}}]'); exception when others then failed:=true; end;
 if not failed or exists(select 1 from public.cms_records where slug='cms-qa-atomic') then raise exception 'Import not atomic'; end if;
 failed:=false;
 begin perform public.cms_save('{"kind":"product","title":"Bad schema","slug":"cms-qa-schema","status":"draft","data":{"schema_json":"invalid"}}'); exception when others then failed:=true; end;
 if not failed then raise exception 'Invalid schema accepted'; end if;
 failed:=false;
 begin perform public.cms_save('{"kind":"product","title":"Reserved URL QA","slug":"san-pham","status":"draft","data":{}}'); exception when others then failed:=true; end;
 if not failed then raise exception 'Reserved URL overwritten'; end if;
 insert into public.cms_media(path,url,filename,mime_type,bytes) values('qa/fixture.png','/source/cms-qa-image.jpg','fixture.png','image/png',1);
 failed:=false;
 begin perform public.cms_media_delete_prepare((select id from public.cms_media where path='qa/fixture.png')); exception when others then failed:=true; end;
 if not failed then raise exception 'Referenced media deletion not blocked'; end if;
 if not exists(select 1 from public.cms_revisions where record_id=p.id) then raise exception 'Revision missing'; end if;
 perform public.cms_save('{"kind":"product","title":"Private QA draft","slug":"cms-qa-private-draft","status":"draft","data":{}}');
 raise notice 'PASS: draft/publish, two-level categories, nonempty guard, optimistic locking, trash/restore, atomic import, JSON, revisions';
end $$;
set local role authenticated;
do $$ begin
 perform public.cms_save('{"kind":"product","title":"Authenticated admin draft","slug":"cms-qa-admin-draft","status":"draft","data":{}}');
 if not exists(select 1 from public.cms_records where slug='cms-qa-private-draft') then raise exception 'Admin cannot read draft'; end if;
 if (public.cms_snapshot()->>'version')::integer<>1 then raise exception 'Snapshot failed'; end if;
 begin insert into public.cms_records(kind,title,slug) values('product','Direct bypass','cms-qa-direct');raise exception 'Direct write bypass allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
 if exists(select 1 from public.cms_records where slug='cms-qa-private-draft') then raise exception 'Anonymous draft leak'; end if;
 begin perform public.cms_save('{"kind":"product","title":"Anonymous write","slug":"cms-qa-anon","data":{}}'); raise exception 'Anonymous write allowed'; exception when insufficient_privilege then null; end;
 raise notice 'PASS: anonymous write blocked';
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{}}',true);
do $$ begin
 if exists(select 1 from public.cms_records where slug='cms-qa-private-draft') then raise exception 'Normal user draft leak'; end if;
 begin perform public.cms_save('{"kind":"product","title":"Ordinary write","slug":"cms-qa-ordinary","data":{}}'); raise exception 'Ordinary user write allowed'; exception when insufficient_privilege then null; end;
 begin delete from public.cms_audit; raise exception 'Audit deletion allowed'; exception when insufficient_privilege then null; end;
 begin perform public.cms_snapshot(); raise exception 'Normal user backup leak'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
