-- Protect existing public URLs without importing content.
insert into public.cms_routes(path) values ('/san-pham'),('/gioi-thieu'),('/lien-he'),('/tin-tuc'),('/admin'),('/gas-lanh-r134a-floron-xuat-xu-an-do-chinh-hang'),('/gas-lanh-134a-an-do-taisei-binh-136kg-chinh-hang'),('/gas-lanh-r410a-an-do-taisei-binh-113-ky-gia-re'),('/gas-lanh-r134a-my-freon-binh-136kg'),('/gas-lanh-r32-thuong-hieu-floron-xuat-xu-an-do-binh-9-kg'),('/gas-lanh-r404a-an-do-floron-binh-109-kg-chinh-hang'),('/dong-cay-2'),('/dong-cay-1'),('/dong-cay-3'),('/ong-dong-cuon-lon-2'),('/ong-dong-cuon-lon'),('/block-danfoss-10hp'),('/block-copeland-15hp'),('/block-copeland-10-15hp'),('/block-copeland-5hp'),('/block-kho-lanh-1'),('/block-danfoss-maneurop'),('/van-thong-ap-coolmax'),('/den-led-kho-lanh'),('/ban-le-khoa-cua-kho-lanh'),('/khien-kho-lanh-elitech-3030'),('/van-tiet-luu-gas-tex2tes2-1'),('/van-tiet-luu-gas-tex2tes2'),('/ong-gio-mem'),('/ong-gio-mem-2'),('/ong-gio-mem-3'),('/ong-gio-mem-4'),('/ong-gio-mem-6'),('/ong-gio-mem-7'),('/dan-lanh-cong-nghiep'),('/dan-lanh-cong-nghiep-2'),('/dan-lanh-cong-nghiep-4'),('/dan-lanh-cong-nghiep-5'),('/dan-lanh-cong-nghiep-6'),('/dan-lanh-cong-nghiep-7'),('/vat-tu-nganh-lanh'),('/vat-tu-thiet-bi-nganh-lanh'),('/vat-tu-lanh'),('/vat-tu-dien-lanh'),('/vat-tu-ong-gen'),('/dai-ly-phan-phoi-gas-lanh-hang-dau-viet-nam'),('/gas-lanh-an-do-phan-phoi-chinh-hang-gia-si-tot-nhat'),('/gas-lanh-trung-quoc-nha-phan-phoi-chinh-hang-tot-nhat-ton-phuc'),('/gas-lanh-r410a-hay-gas-r22-loai-nao-tot-cho-may-lanh'),('/nha-phan-phoi-gas-lanh-floron-uy-tin-tai-tphcm-ton-phuc'),('/so-sanh-gas-lanh-r134a-va-gas-r22'),('/nha-phan-phoi-gas-lanh-freon-uy-tin-tai-tphcm-ton-phuc'),('/dai-ly-phan-phoi-gas-lanh-r22-refrigerant-an-do-gia-si'),('/gas-lanh'),('/gas-lanh-r410a'),('/gas-lanh-r404a'),('/gas-lanh-r134a'),('/gas-32'),('/gas-chemour-freon'),('/gas-lanh-r507'),('/gas-lanh-r407c'),('/gas-lanh-r417a'),('/ong-dong-phu-kien-dong'),('/dong-cuon'),('/dong-cay-phu-kien-ong-dong-co-90-do'),('/phu-kien-ong-dong'),('/block-cum-may-nen-dan-ngung'),('/block'),('/may-nen-dan-ngung'),('/vat-tu-thiet-bi-kho-lanh-may-da-chiller'),('/tam-ong-cach-nhiet-ong-gio-mem'),('/dan-lanh-dan-nong-cong-nghiep'),('/thiet-bi-phu-tung-lanh-dan-dung'),('/nhot-lanh') on conflict do nothing;
insert into public.cms_routes(path) select '/chuyen-muc/'||slug from public.categories on conflict do nothing;
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
  if exists(select 1 from public.cms_routes where path=route and record_id is distinct from item_id and not (record_id is null and d->>'legacy_path'=route)) then raise exception 'URL đã được dùng bởi nội dung khác'; end if;
 end if;
 if old_row.id is not null then
  insert into public.cms_revisions(record_id,snapshot,actor) values(item_id,to_jsonb(old_row),auth.uid());
  update public.cms_records set title=payload->>'title',slug=s,status=st,data=d,version=version+1,updated_at=now(),updated_by=auth.uid() where id=item_id returning * into result;
 else
  insert into public.cms_records(id,kind,title,slug,status,data,updated_by) values(item_id,k,payload->>'title',s,st,d,auth.uid()) returning * into result;
 end if;
 if k in ('product','product_category','article','article_category','tag') then
  delete from public.cms_routes where record_id=item_id;
  insert into public.cms_routes(path,record_id) values(route,item_id) on conflict(path) do update set record_id=excluded.record_id where cms_routes.record_id is null;
 end if;
 insert into public.cms_audit(record_id,kind,title,action,actor) values(item_id,k,result.title,case when old_row.id is null then 'create' when old_row.status<>st then st else 'update' end,auth.uid());
 return result;
end $$;


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

   created_at=coalesce(nullif(item->>'created_at','')::timestamptz,now()),
   updated_at=coalesce(nullif(item->>'updated_at','')::timestamptz,now()) where id=saved.id;
  n:=n+1;
 end loop;
 for item in select * from jsonb_array_elements(archive->'records') loop
  update public.cms_records set deleted_at=nullif(item->>'deleted_at','')::timestamptz where id=(item->>'id')::uuid;
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

