-- CHƯA ÁP DỤNG. Cần người dùng xác nhận riêng trước khi chạy trên database thật.
-- Tác dụng: xóa vĩnh viễn nội dung trong thùng rác quá 30 ngày và revision của nó.
-- Giữ nhật ký. Không xóa file ảnh khỏi Storage. Không thay bảng posts/categories cũ.
-- File nằm ngoài supabase/migrations để không bị áp dụng ngoài ý muốn.
create or replace function public.cms_purge_expired() returns integer
language plpgsql security definer set search_path='' as $$
declare r public.cms_records; n integer:=0;
begin
 perform pg_advisory_xact_lock(817341);
 for r in select * from public.cms_records where deleted_at<now()-interval '30 days'
 and kind not in ('product_category','article_category','page','company','slider_settings','system_image','seo') loop
  insert into public.cms_audit(record_id,kind,title,action) values(r.id,r.kind,r.title,'expired_purge');
  delete from public.cms_records where id=r.id; n:=n+1;
 end loop;
 for r in select * from public.cms_records c where deleted_at<now()-interval '30 days'
 and kind in ('product_category','article_category') and not exists(select 1 from public.cms_records p
 where p.data->>'category_id'=c.id::text or p.data->>'secondary_category_id'=c.id::text or p.data->>'parent_id'=c.id::text) loop
  insert into public.cms_audit(record_id,kind,title,action) values(r.id,r.kind,r.title,'expired_purge');
  delete from public.cms_records where id=r.id; n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.cms_purge_expired() from public,anon,authenticated;
create extension if not exists pg_cron with schema pg_catalog;
-- 19:15 UTC = 02:15 giờ Việt Nam, hằng ngày.
select cron.schedule('tonphuc-cms-trash-retention','15 19 * * *','select public.cms_purge_expired()');
