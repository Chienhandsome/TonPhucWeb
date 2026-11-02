# Nội dung công khai dùng cho bản UI

Ngày chuẩn bị: 01/11/2026. Hiện dữ liệu được lấy từ website công khai.
Người dùng dự kiến xin được tài khoản admin web cũ vào sáng 02/11/2026; khi có cần đối chiếu
toàn bộ nội dung và khả năng xuất dữ liệu/ảnh, chưa coi snapshot public là bản chuyển đầy đủ.

## Phạm vi hiện tại

- `data/public-content.json`: 8 nhóm sản phẩm chính và các danh mục con lấy từ menu,
  40 sản phẩm xuất hiện trên trang chủ, 8 bài đầu chọn từ khối tin trang chủ, nội dung giới thiệu và liên hệ.
- `data/site-info.json`: bản nhỏ chỉ chứa logo/ảnh cửa hàng và thông tin liên hệ, dùng cho header/footer client.
- `public/source/`: 54 file ảnh tải từ website gốc trong lượt chuẩn bị UI.
- `data/home-banners.json`, `public/banners/`: thêm 5 banner gốc trang chủ ngày 02/11/2026,
  đủ ảnh 1366×453, tiêu đề/description/href và URL nguồn. Không nằm trong 54 ảnh nói trên.
- `docs/source-audit/*.html`: snapshot nguồn để đối chiếu. Dữ liệu UI được tách thành text/block/ảnh,
  không chèn HTML hoặc thực thi script của web cũ.

Đây là nội dung thật phục vụ bản UI, **chưa phải bản chuyển toàn bộ website**.
25/40 sản phẩm trong dữ liệu hiện không có block mô tả được trích xuất; UI dùng tên/ảnh gốc và liên hệ tư vấn,
không tự viết thông số bổ sung. Cần đối chiếu nguồn để phân biệt nội dung gốc trống với cấu trúc chưa được trích xuất.
Một ảnh R22 được liên kết trong bài viết không tải được; đã bỏ block ảnh lỗi và giữ văn bản.
Xem danh sách `failures` trong JSON. Thông tin địa chỉ/hotline lấy từ nguồn, chưa được chủ doanh nghiệp xác nhận lại.

## Luồng dữ liệu

- Danh mục và sản phẩm của bản UI đọc snapshot local; không đọc bảng `posts` như bảng sản phẩm.
- Tin tức ghép bài đã xuất bản từ Supabase và bài nguồn local; trùng slug ưu tiên bài trong database.
- Lỗi Supabase vẫn hiển thị lỗi tải; snapshot không phải cơ chế che lỗi database.
- `/admin` hiện quản trị bài/chuyên mục/ảnh trên Supabase; **chưa chỉnh sửa được catalog sản phẩm local**.
- Chưa thêm bảng sản phẩm hoặc migration database trong đợt UI này.
- URL sản phẩm/bài nguồn giữ slug gốc ở `/<slug>`; `/bai-viet/<slug>` tiếp tục phục vụ bài từ admin.

## Chuẩn bị lại dữ liệu

Banner riêng: `node scripts/prepare-banners.mjs`, đọc `#slider .itemsl` trong snapshot `home.html`,
tải ảnh PNG gốc từ đúng tonphuc.com, kiểm tra chữ ký PNG/kích thước và lưu 5 slide.
Lệnh ghi đè file banner/JSON sinh ra; không chạy nếu chưa muốn đồng bộ lại từ snapshot.
Banner hiện chưa chỉnh trong admin; không thêm bảng Supabase. Next Image phục vụ ảnh tối ưu,
ảnh đầu có priority, ảnh hiện tại/kế tiếp tải sớm sau hydration, các ảnh còn lại lazy.
Title/link giữ nguyên nguồn; caption trùng hệt title không lặp lại. Nội dung chữ in trong ảnh được giữ nguyên.

```powershell
node scripts/prepare-public-content.mjs
```

Chạy tại gốc repo, cần mạng và dependency dev `cheerio`. Script chỉ tải từ `tonphuc.com`, dùng lại
HTML và ảnh đã lưu; không crawl toàn bộ phân trang, không xuất bản hoặc ghi dữ liệu vào Supabase.
Script ghi đè hai JSON sinh ra; nếu cần thay dữ liệu, sửa nguồn/quy trình và lưu bản đối chiếu phù hợp.
Không sửa tay snapshot rồi coi đó là thay đổi từ trang quản trị.

## Kiểm tra UI

Sau khi khởi động server local:

```powershell
node scripts/check-ui.mjs
```

Script đọc các trang local, so sánh tiêu đề nguồn, kiểm tra search/empty/pagination/404 và sự tồn tại của ảnh bìa.
Không kiểm tra đăng nhập hoặc ghi dữ liệu. Có thể đổi URL bằng biến `UI_CHECK_URL`.
Dev và production hiện tách cache `.next-dev`/`.next`; mỗi cổng chỉ chạy một server.

## Cần làm tiếp khi chuyển đầy đủ

Kiểm kê các trang danh mục/phân trang còn lại, ảnh trong bài, nội dung HTML/table chưa trích xuất,
ngày đăng và metadata gốc. Chốt mô hình sản phẩm và bản dịch trước khi nhập database hàng loạt.
Không coi số lượng trong snapshot UI là tổng số nội dung của website cũ.
