# SEO và khả năng được công cụ AI tìm thấy

Cập nhật: 01/11/2026. Đợt này chỉ làm nền tảng kỹ thuật, chưa chuyển nội dung đầy đủ hoặc gửi website lên dịch vụ tìm kiếm.

## Đã triển khai

- Metadata dùng chung trong `lib/seo.ts`: title, description, canonical, Open Graph, Twitter card và robots.
- Mô tả riêng cho trang chính, sản phẩm, bài viết, danh mục. Ưu tiên trích văn bản nguồn, không viết thêm thông số.
- Canonical trang 2 giữ `?page=2`; kết quả tìm kiếm không được index và canonical về danh mục gốc.
- Danh mục rỗng có noindex; sitemap bỏ danh mục không có nội dung xuất bản/sản phẩm.
- `/admin` có noindex/nofollow riêng; đây không phải cơ chế bảo vệ tài khoản. Quyền thực vẫn do Auth/RLS.
- `/robots.txt` cho phép crawl để đọc được noindex; chỉ công bố sitemap khi bật indexing production.
- `/sitemap.xml` dùng cùng origin canonical; không thêm admin, query tìm kiếm hoặc URL phân trang trùng vào sitemap.
- `/share-image`: ảnh PNG thương hiệu 1200×630 sinh bằng code, logo thật và hotline. Sản phẩm/bài có ảnh dùng ảnh riêng khi có.
- JSON-LD: LocalBusiness + WebSite toàn trang, Product ở chi tiết sản phẩm, Article ở bài viết, BreadcrumbList ở luồng liên quan.
- JSON-LD escape ký tự `<` và ký tự phân tách Unicode để dữ liệu nội dung không thoát khỏi thẻ script.
- Cache truy vấn bài/chuyên mục trong cùng request để metadata và UI hạn chế gọi database lặp lại.
- Có chỗ cấu hình mã xác minh Google/Bing; chưa điền mã hoặc xác minh tài khoản thực.

## Chế độ index: mặc định tắt

Các biến server trong `.env.example`:

```dotenv
SITE_URL=https://tonphuc.com
SEO_ALLOW_INDEXING=false
```

Không cần ghi các biến này vào `.env.local` hiện tại: code đã có mặc định trên.
Giữ SITE_URL là domain canonical thật; không dùng localhost hoặc tên miền preview.

Chỉ được mở index khi đồng thời:

1. `SEO_ALLOW_INDEXING=true` được đặt rõ ràng.
2. Ứng dụng chạy bản production, `NODE_ENV=production` (Next tự quản lý).
3. Nếu chạy Vercel, `VERCEL_ENV=production` (Vercel tự quản lý); preview luôn noindex.
4. SITE_URL dùng HTTPS trên tonphuc.com hoặc www.tonphuc.com.

Trên Vercel, chỉ đặt cờ true trong môi trường Production sau khi nội dung/tên miền được duyệt;
giữ false hoặc bỏ trống ở Preview/Development. Production build cũng được dùng để xem thử nên không bật chỉ dựa vào NODE_ENV.
Khi đổi cờ hoặc origin, **build/deploy lại** vì một số metadata/robots được tạo tĩnh khi build.
Với hosting khác, người vận hành phải tách env preview/production tương tự; không sao chép cờ true sang bản xem thử.

Canonical và ảnh OG hiện trỏ tới tên miền thật dù chạy local. Trước chuyển DNS, ảnh/URL mới chưa được phục vụ bởi web cũ;
kiểm tra bằng crawler bên ngoài phải làm trên bản triển khai thích hợp hoặc sau khi chuyển tên miền.
Noindex không có tác dụng như đăng nhập hoặc bảo vệ dữ liệu nhạy cảm.

## Dữ liệu có cấu trúc không được bịa

Business lấy tên, địa chỉ, logo, hotline, email, mã số thuế và link Maps/Zalo từ dữ liệu public đã có.
Chưa có xác nhận giờ mở cửa, tọa độ chuẩn, đánh giá, giá bán, SKU/GTIN hoặc tác giả/ngày đăng gốc thì không gán tự động.
Không dùng ngày tải snapshot làm ngày xuất bản bài viết.

Product hiện có name/url/image/description/category. Vì chưa có giá/offer hoặc review hợp lệ,
**không coi schema này là đã đủ điều kiện Google Product rich result**. Không thêm giá 0 hay sao đánh giá để lấp trường.
Article chưa có author/datePublished/dateModified nếu nguồn chưa được đối chiếu. Cần hoàn thiện dữ liệu khi có admin cũ.

## Kiểm tra

```powershell
npm run check:seo
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
```

Dev dùng `.next-dev`, production dùng `.next` để tránh ghi đè cache. Không chạy hai server trên cùng cổng.
Sau khi khởi động server local (hoặc đặt UI_CHECK_URL tới cổng production kiểm tra):

```powershell
npm run check:seo:local
```

- Unit checks: cờ index production/preview, canonical phân trang/search/rỗng, escape JSON-LD, URL ảnh và tóm tắt mô tả.
- Integration: 9 trang đại diện, metadata HTML, JSON-LD, admin noindex, robots, sitemap và PNG đúng kích thước.
- Script integration mặc định mong đợi noindex. Chỉ đặt `SEO_EXPECT_INDEX=true` khi kiểm tra bản production đã bật cờ hợp lệ.
- Có thể đổi URL kiểm tra bằng `UI_CHECK_URL` và origin canonical bằng `SITE_URL`.

## Sau khi có nội dung và trước/sau lên sóng

Kết quả local hiện tại: 5 unit checks, 10 trang SEO đại diện và 64 route UI thành công trên bản production kiểm tra;
ảnh chia sẻ 1200×630 đã được xem trực tiếp. Chưa gửi URL hoặc nội dung tới công cụ kiểm định bên ngoài.

- Đối chiếu đủ URL cũ, title/description và ngày đăng; tạo mapping/301 cho URL đổi.
- Hoàn thiện mô tả sản phẩm, bảng thông số, ảnh và nguồn tài liệu hãng bằng dữ liệu được duyệt.
- Nếu bổ sung câu trả lời/FAQ, dựa trên câu hỏi thật và thông tin đã xác minh; không tự viết hàng loạt để nhồi từ khóa.
- Xác minh thông tin liên hệ/địa chỉ và Google Business Profile.
- Kiểm tra Rich Results Test/Schema validator trên URL có thể truy cập từ ngoài; chưa thực hiện xác thực bên ngoài trong local.
- Đo Core Web Vitals/Lighthouse trên bản phát hành; chưa đo hoặc tuyên bố điểm hiệu năng trong đợt này.
- Người có quyền lấy mã Search Console/Bing Webmaster Tools, điền `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`, deploy rồi xác minh/gửi sitemap.
- Khi bật tiếng Anh mới thêm hreflang và sitemap bản dịch; hiện chỉ có tiếng Việt.
- Không cần file/schema riêng để bảo đảm AI trích dẫn. SEO, nội dung đáng tin và khả năng truy cập là nền tảng;
  không có cam kết xếp hạng hoặc xuất hiện trong câu trả lời AI.

## Tài liệu chính thức đã đối chiếu

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google: Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Next.js 14: Metadata](https://nextjs.org/docs/14/app/api-reference/functions/generate-metadata)
- [Next.js 14: robots.txt](https://nextjs.org/docs/14/app/api-reference/file-conventions/metadata/robots)
