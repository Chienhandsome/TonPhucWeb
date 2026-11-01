-- Seed mẫu: CHỈ tiêu đề + mô tả tạm placeholder, lấy từ trang chủ tonphuc.com ngày 01/11/2026.
-- Không bịa nội dung chi tiết, không bịa giá. Chạy sau schema.sql.
-- Khi chuyển nội dung thật từ tài khoản admin, cập nhật lại excerpt/content của từng bài.

insert into public.categories (name, slug) values
  ('Giới thiệu', 'gioi-thieu'),
  ('Sản phẩm', 'san-pham'),
  ('Báo giá', 'bao-gia'),
  ('Kiến thức', 'kien-thuc')
on conflict (slug) do nothing;

insert into public.posts (title, slug, excerpt, content, category_id, published)
select
  v.title, v.slug,
  'Nội dung đang được chuyển từ web cũ — sẽ thay bằng bài đầy đủ lấy từ tài khoản admin.',
  'Nội dung đang được chuyển từ web cũ — sẽ thay bằng bài đầy đủ lấy từ tài khoản admin.',
  c.id, true
from (values
  ('Đại Lý Phân Phối Gas Lạnh Hàng Đầu TP.HCM', 'dai-ly-phan-phoi-gas-lanh-hang-dau-tphcm', 'gioi-thieu'),
  ('Báo Giá Gas Lạnh R22, R32, R410A Chính Hãng', 'bao-gia-gas-lanh-r22-r32-r410a-chinh-hang', 'bao-gia'),
  ('Gas R22 có độc không', 'gas-r22-co-doc-khong', 'kien-thuc'),
  ('Gas R32 có độc không', 'gas-r32-co-doc-khong', 'kien-thuc'),
  ('Cung Cấp Gas Lạnh R507 & R407C Cho Kho Lạnh, Máy Chiller Tại TP.HCM', 'cung-cap-gas-lanh-r507-r407c-cho-kho-lanh-may-chiller-tphcm', 'san-pham'),
  ('Gas R410A có cháy không', 'gas-r410a-co-chay-khong', 'kien-thuc'),
  ('Cung Cấp Vật Tư Điện Lạnh Giá Sỉ Tại TP.HCM', 'cung-cap-vat-tu-dien-lanh-gia-si-tphcm', 'san-pham'),
  ('Thay gas R410A bằng R32 được không', 'thay-gas-r410a-bang-r32-duoc-khong', 'kien-thuc'),
  ('Gas R410A có nạp bổ sung được không', 'gas-r410a-co-nap-bo-sung-duoc-khong', 'kien-thuc'),
  ('Gas Lạnh R22 Ấn Độ', 'gas-lanh-r22-an-do', 'san-pham'),
  ('Nhà Cung Cấp Gas Lạnh Chemours', 'nha-cung-cap-gas-lanh-chemours', 'san-pham')
) as v(title, slug, cat_slug)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;
