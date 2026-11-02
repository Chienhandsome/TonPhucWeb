# Trạng thái và bàn giao

Cập nhật: 01/11/2026. Trạng thái tại thời điểm bàn giao, không phải monitor live.

## Đã hoàn thành

- Bản UI mới: header/footer responsive, trang chủ, catalog và danh mục con,
  chi tiết sản phẩm, tin tức/bài, giới thiệu, liên hệ, trang 404/lỗi tải.
- Tìm tên sản phẩm có/không dấu, phân trang catalog, trạng thái không có kết quả.
- Chuẩn bị next-intl tiếng Việt cho giao diện công khai, chưa bật tiếng Anh.
- Lấy logo và ảnh thật từ nguồn; snapshot UI có 8 nhóm chính, 40 sản phẩm, 8 bài và 54 ảnh.
- Hiện lấy nội dung từ nguồn công khai. Người dùng dự kiến có tài khoản admin web cũ vào sáng 02/11/2026; chưa nhận hoặc kiểm tra tài khoản. Chưa chuyển toàn bộ website.
- Kết nối Supabase TonPhucWeb; admin đã cấp quyền; không thay schema hoặc nhập catalog vào DB trong đợt UI.
- Đồng bộ khung trang bài/chuyên mục cũ và form admin; giữ CRUD bài hiện có.

## Bằng chứng kiểm tra UI

- Build production sạch thành công, không còn cảnh báo import JSON.
- TypeScript noEmit thành công.
- `scripts/check-ui.mjs`: vượt 64 kiểm tra route/tiêu đề, thêm search R32, empty search, trang 2 và ảnh bìa local.
- Browser: đã đi từ homepage sang catalog, tìm R32 và mở chi tiết; menu mobile mở được và Escape đóng/focus lại.
- Đã xem screenshot desktop 1440, tablet 768, mobile 360; các viewport đo không tràn ngang toàn trang.
- Kiểm tra console browser ở cuối luồng không có error/warn.
- Lỗi cache khi có tiến trình dev cũ ghi chung .next đã được xử lý bằng dừng đúng tiến trình/build sạch;
  kiểm tra route sau đó chạy trên bản production local.
- Chưa đăng nhập bằng mật khẩu thật hoặc upload ảnh bằng phiên admin trong đợt UI này.

## Bằng chứng Supabase đã có từ bước setup

- REST đọc chuyên mục/join bài thành công; khách bị chặn tạo bài/upload.
- Transaction SQL với claim mô phỏng: user thường không đọc nháp/ghi bài;
  admin đọc nháp và CRUD được; dữ liệu kiểm tra rollback.
- Lần setup có 4 chuyên mục và 0 bài; đây là số lượng lịch sử, cần truy vấn lại khi cần trạng thái mới.

## Bản xem trước

Bản xem trước local tại http://127.0.0.1:3000 để người dùng duyệt; sau điều chỉnh nav/intro đang chạy dev server.
Chưa deploy hosting, chuyển DNS hoặc hủy web cũ. UI hiện là bản chờ phản hồi,
không ghi nhận màu/font/bố cục đã được người dùng duyệt chỉ vì build/test thành công.

Điều chỉnh theo yêu cầu mới: bỏ intro nền nhạt ở Giới thiệu/Sản phẩm/Tin tức/Liên hệ,
bỏ nút danh mục và nhãn địa điểm bên phải nav; giữ h1 ẩn cho khả năng truy cập.
Footer đã có liên kết sitemap XML và bản đồ Google Maps từ mã nhúng nguồn cũ, kèm nút chỉ đường.
Đã kiểm tra map tải trên desktop, layout một cột ở mobile 360px không tràn ngang; TypeScript thành công.
Đã thêm hai nút nổi Gọi điện/Zalo trên trang công khai, ẩn ở admin; kiểm tra link/kích thước và mobile 360px.
Animation hero/scroll reveal mới ở mức đề xuất trong design-system.md, chưa áp dụng cho trang chủ.

## SEO/AIO kỹ thuật đã hoàn thành

- Metadata riêng, canonical phân trang, Open Graph/Twitter card và ảnh thương hiệu 1200×630.
- Robots/noindex: local/preview mặc định noindex; admin noindex/nofollow; search và danh mục rỗng noindex.
- Sitemap bỏ URL rỗng, query và admin; dùng cùng origin với canonical.
- JSON-LD LocalBusiness/WebSite/Product/Article/BreadcrumbList theo dữ liệu hiện có, không bịa giá/review/ngày đăng.
- Cấu hình tùy chọn mã xác minh Google/Bing; chưa xác minh hoặc gửi sitemap ra ngoài.
- 5 unit checks thành công; production build thành công; integration vượt 10 trang SEO, robots/sitemap/ảnh,
  và 64 route UI trên cổng kiểm tra 3100. Đã xem ảnh chia sẻ thực tế.
- Tách output dev `.next-dev` và production `.next` để sửa lỗi hai server ghi đè cache.
- Bản xem trước vẫn ở cổng 3000, chưa mở index hoặc deploy. Chi tiết [SEO/AIO](seo-aio.md).
- Chưa có xác thực Rich Results từ ngoài hoặc số đo Core Web Vitals trên domain thật; nội dung gốc/migration vẫn còn thiếu.

Catalog local chưa sửa được từ /admin. Đọc [nguồn dữ liệu UI](public-content.md) trước khi tiếp tục.

## Việc tiếp theo

Đã tạo bản đồ Graphify ngày 02/11/2026 trong `graphify-out/`: quét 173 tệp,
1.076 nút, 1.563 quan hệ và 62 nhóm. Mở `graph.html` để xem, đọc `GRAPH_REPORT.md`
và `GRAPH_HEALTH.txt` để biết giới hạn. Không đọc `.env.local` hoặc truy vấn Supabase.
Không còn endpoint thiếu; đồ thị vô hướng gộp 89 quan hệ cùng cặp nút và có 2 self-loop;
`extraction.json` giữ dữ liệu trích xuất gốc. Token usage không được công cụ agent cung cấp.
Đây là snapshot phục vụ tra cứu; dùng `$graphify . --update` sau thay đổi, không coi graph là yêu cầu sản phẩm.

1. Nhận phản hồi bản UI và chốt phạm vi quản trị còn chờ trong product.md.
2. Khi có admin web cũ, kiểm tra khả năng liệt kê/xuất nội dung và ảnh; đối chiếu snapshot public với toàn bộ sản phẩm/bài/danh mục, ngày đăng/metadata. Chưa giả định tài khoản admin cho phép xuất database. Xác minh thông tin liên hệ.
3. Chốt schema sản phẩm/danh mục nhiều cấp/bản dịch và cách quản trị, rồi mới chuyển dữ liệu hàng loạt.
4. Hoàn thiện quản trị, kiểm thử CRUD/upload bằng tài khoản thực.
5. Chốt URL mapping/redirect và metadata/ngày đăng gốc; xác thực schema, hiệu năng và Search Console/Bing trên bản phát hành.
6. Preview được duyệt mới chuẩn bị chuyển DNS theo kế hoạch.

## Quy tắc cập nhật

Quyết định nghiệp vụ → product.md; code/schema/luồng dữ liệu → architecture.md;
mốc công việc và bằng chứng → file này; cách chạy/env → README và tài liệu setup.
Không chép secret, mật khẩu hoặc toàn bộ hội thoại vào tài liệu.
