# Kiến trúc hiện tại và khoảng trống

Cập nhật: 01/11/2026, sau đợt UI mới. Phân biệt dữ liệu public local với dữ liệu Supabase.

## Stack

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS; next-intl 4.14.9 cho giao diện tiếng Việt,
lucide-react 1.66.0 cho icon. Cheerio là dev dependency của công cụ nhập/kiểm tra nội dung.
Slider trang chủ dùng `embla-carousel-react`, `embla-carousel-autoplay`, `embla-carousel-fade` 8.6.0.
Phiên bản cụ thể xem lockfile. Alias `@/*` trỏ về gốc repo; TypeScript hiện `strict=false`.

## Cấu trúc và routes

| Vị trí | Trách nhiệm |
| --- | --- |
| `app/layout.tsx` | NextIntlClientProvider, header/footer, metadata chung |
| `app/page.tsx` | Homepage: hero, nhóm hàng, sản phẩm, giới thiệu, tin tức, liên hệ |
| `components/HomeBanner.tsx`, `data/home-banners.json` | Client slider thay hero, metadata/ảnh gốc lấy từ snapshot công khai; chữ điều khiển tách `messages/vi.json` |
| `public/banners/`, `scripts/prepare-banners.mjs` | 5 banner PNG gốc; script trích caption/href và tải ảnh từ nguồn, không ghi database |
| `app/san-pham/page.tsx` | Catalog, tìm theo tên không dấu, phân trang |
| `app/[slug]/page.tsx` | Resolve danh mục/nhóm con, sản phẩm và bài nguồn theo slug cũ; 404 cho slug không có |
| `app/tin-tuc/page.tsx` | Tin nguồn local và bài đã xuất bản từ database |
| `app/gioi-thieu/page.tsx`, `app/lien-he/page.tsx` | Nội dung giới thiệu/liên hệ trích từ nguồn công khai |
| `app/bai-viet/[slug]/page.tsx` | Chi tiết bài từ admin, giữ URL đã có |
| `app/chuyen-muc/[slug]/page.tsx` | Chuyên mục bài trong database; 404 cho chuyên mục không tồn tại |
| `app/admin/page.tsx` | Đăng nhập, CRUD bài, thêm chuyên mục và upload ảnh; đã chỉnh khung hiển thị |
| `app/error.tsx`, `app/not-found.tsx` | Trạng thái lỗi và 404 |
| `app/sitemap.ts` | Sitemap XML tại /sitemap.xml: trang công khai, catalog, bài xuất bản và chuyên mục; liên kết ở footer |
| `lib/seo.ts`, `lib/structured-data.ts` | Metadata, cờ index, canonical, schema doanh nghiệp/sản phẩm/bài/breadcrumb |
| `app/robots.ts`, `app/admin/layout.tsx` | Crawl rules và noindex/nofollow riêng cho admin |
| `app/share-image/route.ts`, `lib/share-image.tsx` | Ảnh chia sẻ thương hiệu 1200×630, không cần gọi domain cũ |
| `components/JsonLd.tsx`, `lib/json-ld.mjs` | Serialize/escape JSON-LD và render script dữ liệu |
| `components/` | Header/footer client, card, catalog server, nội dung block, liên hệ và các phần dùng chung |
| `messages/vi.json`, `i18n/request.ts` | Giao diện công khai tiếng Việt; locale cố định vi, chưa có route tiếng Anh |
| `lib/catalog.ts` | Catalog nguồn, resolver danh mục, ghép bài database và bài nguồn |
| `lib/posts.ts`, `lib/supabase.ts` | Kiểu/truy vấn bài database và client Supabase |
| `data/public-content.json` | Dữ liệu nguồn có cấu trúc; chưa quản trị catalog qua database |
| `data/site-info.json` | Logo, ảnh và liên hệ gọn cho header/footer client |
| `public/source/` | Ảnh đã tải để không phụ thuộc hosting cũ trong bản UI |
| `scripts/prepare-public-content.mjs` | Trích nội dung/ảnh từ nguồn public; không ghi Supabase |
| `scripts/check-ui.mjs` | Kiểm tra route, tiêu đề nguồn, search/empty/pagination/404 và ảnh |
| `scripts/check-supabase.mjs` | Probe REST và quyền khách |
| `supabase/schema.sql` | Schema khởi tạo database, trigger, bucket và RLS |

## Luồng dữ liệu

Catalog sản phẩm/danh mục → snapshot local → Server Component → UI.
Bài viết → `getArticles` (React cache theo request) → bài xuất bản Supabase + bài nguồn local → UI.
Trùng slug ưu tiên bài database; lỗi Supabase vẫn được báo, không bị che bằng snapshot.
Homepage và tin tức dùng dynamic rendering để cập nhật bài admin sau khi tải lại.

Dữ liệu public được trích thành block text/heading/ảnh/table. `ContentBlocks` render bằng React,
không chèn HTML nguồn hoặc thực thi script. Bài database hiện vẫn plain text;
chưa có editor rich text hoặc nhập HTML đầy đủ.

Chưa có env thì `lib/posts.ts` dùng 11 bài seed để xem khung như trước.
Có env thì dùng database thật, rỗng là danh sách rỗng, lỗi truy vấn ném ra.
`getPostBySlug` vẫn lấy toàn bộ bài xuất bản rồi tìm trong bộ nhớ; cần tối ưu khi dữ liệu tăng.

Chi tiết nguồn, phạm vi 40 sản phẩm/8 bài và giới hạn trích xuất: [public-content.md](public-content.md).

## Supabase và quyền

Schema remote chưa thay đổi trong đợt UI.

| Bảng | Trường chính | Ghi chú |
| --- | --- | --- |
| `categories` | id, name, slug, created_at | UUID, slug unique; chưa có parent |
| `posts` | id, title, slug, excerpt, content, cover_image, category_id, published, timestamps | FK category on delete set null |

Trigger cập nhật updated_at. Index FK category và (published, created_at desc).
Form admin mặc định nháp; database default published=true — importer phải truyền trạng thái rõ ràng.

Form admin → Auth email/password → JWT app_metadata.role=admin → Data API/Storage → RLS.
Không có Next.js API routes, SSR cookie auth hay service-role backend riêng.

| Người dùng | categories | posts | images |
| --- | --- | --- | --- |
| Khách / user thường | Đọc | Chỉ đọc bài xuất bản | Đọc public |
| Admin | Đọc/CRUD theo RLS | Đọc cả nháp và CRUD | Đọc/upload/thay/xóa theo RLS |

UI admin chỉ thêm chuyên mục, chưa sửa/xóa dù RLS hỗ trợ.
Ảnh bucket public có thể xem khi biết URL, kể cả ảnh bài nháp. Chi tiết [Supabase setup](supabase-setup.md).

## Còn thiếu

- Chuyển đủ website: nhiều trang danh mục/phân trang, mô tả và ảnh chưa đối chiếu đầy đủ.
- Bảng sản phẩm, bản dịch, danh mục cha/con trong database và quản trị catalog/banner/liên hệ.
- Ảnh gallery đầy đủ, editor rich text, xử lý lỗi/session admin hoàn chỉnh.
- Redirect đầy đủ và metadata gốc/ngày đăng của toàn bộ nội dung; metadata kỹ thuật, robots và sitemap lọc trang rỗng đã có.
- Bản dịch tiếng Anh và route /en; hiện chỉ chuẩn bị giao diện tiếng Việt bằng next-intl.
- Kiểm thử bằng mật khẩu admin thực, bộ e2e tự động và cấu hình lint hoàn chỉnh.

## Vận hành local

SEO mặc định noindex cả bản build xem trước. Chỉ mở khi có cờ production rõ ràng trên domain thật;
xem [SEO/AIO](seo-aio.md) trước khi đổi cấu hình phát hành. Robots cho phép crawl để crawler đọc noindex.

Dev dùng `.next-dev`, build/start production dùng `.next` theo phase trong next.config.js;
hai output được tách để tránh lỗi ghi đè module. Vẫn chỉ chạy một server trên mỗi cổng.
Bản xem trước chạy dev trên cổng 3000. Có thể kiểm tra production song song ở cổng khác như 3100.
