# Danh mục nội dung cần chuyển — Gas Lạnh Tôn Phúc (tonphuc.com)

> **Cập nhật 01/11/2026:** Danh sách 11 bài bên dưới là ghi nhận sơ bộ của skeleton, không phải tổng nội dung website gốc. Kiểm tra trực tiếp mới đã lưu 7 mẫu trang và phát hiện 154 URL (gồm cả ảnh/tag/phân trang/link chưa xác minh). Xem [kế hoạch làm lại](redesign-plan.md), [manifest trang mẫu](source-audit/pages.json) và [liên kết tìm thấy](source-audit/links.csv). Những nhận định cũ bên dưới về trang chủ, logo và số lượng bài cần được đối chiếu lại; không dùng làm dữ liệu chuẩn để nhập hàng loạt.

> **Trạng thái: DANH MỤC ĐỂ CHUYỂN, chưa phải nội dung đã chuyển xong.**
> Các tiêu đề dưới đây lấy từ trang chủ tonphuc.com khi đọc ngày 01/11/2026.
> Nội dung đầy đủ, ảnh và các bài ngoài trang chủ phải lấy từ tài khoản admin của web cũ
> (user đã xác nhận có admin), rồi nhập vào trang Admin của web mới.
> Không tự bịa nội dung chi tiết hay giá trong lúc chuyển.

## 1. Thông tin chung đã thấy trên trang chủ

- Tên hiển thị: Gas Lạnh Tôn Phúc — Đại lý gas lạnh tại TP.HCM.
- Các dòng gas nhắc tới: R22, R32, R410A, R507, R407C.
- Các hãng nhắc tới: Honeywell, Chemours, Floron, Refron.
- Trang chủ hiển thị dạng danh sách bài viết, mỗi bài có ảnh, tiêu đề và nút “Xem thêm”.
- Ảnh bài trên trang chủ nằm ở dạng `/upload/sanpham/...` (đường dẫn ảnh cũ, chỉ dùng để đối chiếu khi tải ảnh từ admin, không hardcode vào web mới).

## 2. 11 bài thấy trên trang chủ (chuyển toàn bộ, theo yêu cầu user)

| # | Tiêu đề (giữ nguyên) | Gợi ý chuyên mục trong web mới | Slug đề xuất |
|---|----------------------|-------------------------------|--------------|
| 1 | Đại Lý Phân Phối Gas Lạnh Hàng Đầu TP.HCM | Giới thiệu | dai-ly-phan-phoi-gas-lanh-hang-dau-tphcm |
| 2 | Báo Giá Gas Lạnh R22, R32, R410A Chính Hãng | Báo giá | bao-gia-gas-lanh-r22-r32-r410a-chinh-hang |
| 3 | Gas R22 có độc không | Kiến thức | gas-r22-co-doc-khong |
| 4 | Gas R32 có độc không | Kiến thức | gas-r32-co-doc-khong |
| 5 | Cung Cấp Gas Lạnh R507 & R407C Cho Kho Lạnh, Máy Chiller Tại TP.HCM | Sản phẩm | cung-cap-gas-lanh-r507-r407c-cho-kho-lanh-may-chiller-tphcm |
| 6 | Gas R410A có cháy không | Kiến thức | gas-r410a-co-chay-khong |
| 7 | Cung Cấp Vật Tư Điện Lạnh Giá Sỉ Tại TP.HCM | Sản phẩm | cung-cap-vat-tu-dien-lanh-gia-si-tphcm |
| 8 | Thay gas R410A bằng R32 được không | Kiến thức | thay-gas-r410a-bang-r32-duoc-khong |
| 9 | Gas R410A có nạp bổ sung được không | Kiến thức | gas-r410a-co-nap-bo-sung-duoc-khong |
| 10 | Gas Lạnh R22 Ấn Độ | Sản phẩm | gas-lanh-r22-an-do |
| 11 | Nhà Cung Cấp Gas Lạnh Chemours | Sản phẩm | nha-cung-cap-gas-lanh-chemours |

Chuyên mục trong web mới là phân loại gợi ý để skeleton chạy được; khi chuyển thật, đối chiếu
lại chuyên mục gốc trong admin và sửa nếu khác.

## 3. Những gì chưa xác minh được từ trang chủ — cần lấy từ admin

- [ ] Tổng số bài viết thật trong admin (trang chủ chỉ hiện 11 bài đầu, có thể còn bài cũ hơn).
- [ ] Danh sách chuyên mục gốc và bài thuộc chuyên mục nào.
- [ ] Nội dung đầy đủ từng bài, ảnh bìa và ảnh trong bài (tải từ admin, upload lại lên Supabase Storage).
- [ ] Đường link (slug) gốc của từng bài, để giữ nguyên hoặc làm bảng redirect khi lên sóng, tránh mất thứ hạng tìm kiếm.
- [ ] Thông tin liên hệ thật: hotline, Zalo, địa chỉ, giờ làm việc (điền vào trang Liên hệ, skeleton đang để placeholder).
- [ ] Logo thật của Gas Lạnh Tôn Phúc (xem mục 4).
- [ ] Các trang ngoài danh sách bài: trang giới thiệu công ty, trang liên hệ, chính sách (nếu có).

## 4. Logo

- File skeleton: `public/logo.png` hiện chỉ là ảnh placeholder (nền xanh, chữ TON PHUC / LOGO PLACEHOLDER).
- Khi đọc trang chủ bằng công cụ đọc text ngày 01/11/2026, không thấy URL logo công khai tách riêng rõ ràng
  (danh sách ảnh trả về chỉ là ảnh bài viết), nên **không tải logo từ web cũ về**.
- Trước khi lên sóng: thay `public/logo.png` bằng logo thật do dì cung cấp.
- Sitemap: đã thử đọc `https://tonphuc.com/sitemap.xml` ngày 01/11/2026 bằng công cụ đọc text
  nhưng không lấy được (báo không tìm thấy). Vì vậy danh mục này chỉ dựa trên trang chủ;
  khi có admin thì đối chiếu lại toàn bộ, đừng coi 11 bài là tổng số bài của web cũ.

## 5. Quy trình chuyển nội dung (sau skeleton)

1. Đăng nhập admin web cũ, xuất / sao chép từng bài: tiêu đề, slug gốc, chuyên mục, nội dung, ảnh.
2. Đăng nhập trang Admin web mới (`/admin`), tạo chuyên mục nếu thiếu, tạo bài, upload ảnh bìa lên Supabase Storage.
3. Để bài ở trạng thái nháp cho tới khi dì duyệt, rồi mới bật “Đã xuất bản”.
4. Đối chiếu slug cũ — slug mới, lập bảng redirect cho những link đổi.
5. Dì duyệt trên bản xem trước (Vercel preview), rồi mới nhờ chú trỏ DNS và hủy web cũ.
