create or replace function public.cms_is_admin() returns boolean language sql stable set search_path='' as $$
 select (select auth.uid()) is not null and coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin'
$$;
create index cms_category_ref_idx on public.cms_records((data->>'category_id'));
create index cms_secondary_category_ref_idx on public.cms_records((data->>'secondary_category_id'));
create index cms_parent_ref_idx on public.cms_records((data->>'parent_id'));
create index cms_redirect_from_idx on public.cms_records((data->>'from')) where kind='redirect' and deleted_at is null;
create index cms_product_tags_idx on public.cms_records using gin((data->'tag_ids')) where kind='product';
create index cms_updated_by_idx on public.cms_records(updated_by);
create index cms_revision_actor_idx on public.cms_revisions(actor);
create index cms_audit_actor_idx on public.cms_audit(actor,created_at desc);
alter policy cms_records_read on public.cms_records using((select public.cms_is_admin()) or (status='published' and deleted_at is null));
alter policy cms_revisions_read on public.cms_revisions using((select public.cms_is_admin()));
alter policy cms_audit_read on public.cms_audit using((select public.cms_is_admin()));
alter policy cms_media_read on public.cms_media using((select public.cms_is_admin()));
