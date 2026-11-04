-- Restore into an empty CMS, assert IDs/status/history survive, then roll back all fixtures.
begin;
select set_config('request.jwt.claims',json_build_object('sub',(select id from auth.users where raw_app_meta_data->>'role'='admin' limit 1),'role','authenticated','app_metadata',json_build_object('role','admin'))::text,true);
do $$
declare category_id uuid:=gen_random_uuid(); product_id uuid:=gen_random_uuid(); archive jsonb; n integer;
begin
 if exists(select 1 from public.cms_records) then raise exception 'Restore test requires empty CMS; do not clear real data'; end if;
 archive:=jsonb_build_object('version',1,'records',jsonb_build_array(
  jsonb_build_object('id',category_id,'kind','product_category','title','Restore QA category','slug','restore-qa-category','status','published','data','{}'::jsonb,'version',3,'created_at','2026-11-01T00:00:00Z','updated_at','2026-11-02T00:00:00Z'),
  jsonb_build_object('id',product_id,'kind','product','title','Restore QA trash','slug','restore-qa-product','status','draft','version',7,'deleted_at','2026-11-02T00:00:00Z','created_at','2026-11-01T00:00:00Z','updated_at','2026-11-02T00:00:00Z','data',jsonb_build_object('category_id',category_id))
 ),'revisions',jsonb_build_array(jsonb_build_object('record_id',product_id,'snapshot',jsonb_build_object('title','Previous QA version'),'created_at','2026-11-01T01:00:00Z')),'audit',jsonb_build_array(jsonb_build_object('record_id',product_id,'kind','product','title','Restore QA','action','update','created_at','2026-11-01T01:00:00Z')));
 n:=public.cms_restore(archive);
 if n<>2 then raise exception 'Incorrect restore count'; end if;
 if not exists(select 1 from public.cms_records where id=product_id and version=7 and status='draft' and deleted_at is not null and data->>'category_id'=category_id::text) then raise exception 'Restore lost ID/version/trash/relation'; end if;
 if not exists(select 1 from public.cms_revisions where record_id=product_id and snapshot->>'title'='Previous QA version') then raise exception 'Missing restored revision'; end if;
 if not exists(select 1 from public.cms_audit where record_id=product_id and action='restored:update') then raise exception 'Missing restored audit'; end if;
end $$;
rollback;
