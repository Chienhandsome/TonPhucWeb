# Kiến trúc hiện tại và khoảng trống

Cập nhật theo code ngày 01/11/2026. Tính năng dự kiến không được hiểu là đã triển khai.

## Stack và cấu trúc

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, `@supabase/supabase-js`.
Phiên bản cài xem `package-lock.json`; `package.json` khai báo khoảng phiên bản.
Alias `@/*` trỏ về gốc repo; TypeScript hiện `strict=false`.

| Vị trí | Trách nhiệm hiện tại |
| --- | --- |
| `app/layout.tsx` | Layout, metadata chung, header/footer |
| `app/page.tsx` | Trang chủ giới thiệu và danh sách bài |
| `app/bai-viet/[slug]/page.tsx` | Chi tiết bài; 404 khi không tìm thấy |
| `app/chuyen-muc/[slug]/page.tsx` | Lọc bài theo chuyên mục |
| `app/lien-he/page.tsx` | Liên hệ còn placeholder |
| `app/admin/page.tsx` | Client Component: đăng nhập, CRUD bài, tạo chuyên mục, upload |
| `components/SiteHeader.tsx` | Header/footer |
| `components/PostCard.tsx` | Card bài |
| `lib/posts.ts` | Kiểu dữ liệu, truy vấn public, chuyển seed |
| `lib/supabase.ts` | Client publishable key và helper bucket |
| `lib/seed.ts` | 11 tiêu đề mẫu và `slugify` tiếng Việt |
| `supabase/schema.sql` | SQL khởi tạo bảng, trigger, bucket, RLS |
| `scripts/check-supabase.mjs` | Probe REST và quyền khách |
| `scripts/inventory-source.ps1` | Tải 7 HTML mẫu và lập danh sách link |
| `docs/source-audit/` | Snapshot, manifest và CSV liên kết |

## Luồng công khai

Server Component → `lib/posts.ts` → `lib/supabase.ts` → Supabase Data API → RLS → render.

- Chưa có URL/key: dùng seed cục bộ xem khung.
- Có cấu hình: lấy dữ liệu thật; database trống trả danh sách trống, lỗi truy vấn được ném ra.
- Bài join `categories!posts_category_id_fkey`, lọc `published=true`.
- `getPostBySlug` hiện lấy toàn bộ bài xuất bản rồi tìm slug trong bộ nhớ; cần tối ưu khi dữ liệu tăng.
- Nội dung render như plain text có xuống dòng; chưa có rich text/sanitizer/quy trình nhập HTML gốc.

## Quản trị và quyền

Form `/admin` → Auth email/password → JWT có `app_metadata.role=admin`
→ browser gọi trực tiếp Data API/Storage → RLS thực thi quyền.
Chưa có Next.js API routes, SSR cookie auth hay backend service-role riêng.
Kiểm tra vai trò ở UI hỗ trợ trải nghiệm; quyền thực nằm trong database.

| Người dùng | categories | posts | bucket images |
| --- | --- | --- | --- |
| Khách / user thường | Đọc | Chỉ đọc bài xuất bản | Đọc công khai |
| Admin | Đọc/CRUD theo RLS | Đọc cả nháp và CRUD | Đọc/upload/thay/xóa theo RLS |

UI hiện chỉ thêm chuyên mục, chưa sửa/xóa dù RLS hỗ trợ.
Ảnh bucket public có thể xem khi biết URL, kể cả ảnh bài nháp; không dùng cho tài liệu riêng tư.

## Mô hình hiện tại

| Bảng | Trường chính | Ghi chú |
| --- | --- | --- |
| `categories` | `id`, `name`, `slug`, `created_at` | UUID, slug unique; chưa có parent |
| `posts` | `id`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `category_id`, `published`, timestamps | FK category `on delete set null`, slug unique |

Trigger cập nhật `updated_at`. Index: FK category và `(published, created_at desc)`.
Form admin mặc định nháp; database default `published=true` — importer phải truyền trạng thái rõ ràng.
Kiểm tra schema thực tế trước migration remote. Chi tiết project tại [Supabase setup](supabase-setup.md).

## Khoảng trống đã biết

- Chưa có bảng/trang sản phẩm riêng, thông số, gallery và danh mục cha/con.
- Chưa có tìm kiếm/phân trang hoàn chỉnh, banner có thể quản trị, trang giới thiệu riêng.
- URL mới khác nhiều URL gốc; chưa có mapping, redirect, sitemap/robots và metadata riêng từng bài đầy đủ.
- Chuyên mục không tồn tại vẫn render trang trống thay vì 404.
- UI công khai còn nhắc skeleton/README; cần thay khi làm UI mới.
- Chưa hoàn thiện xử lý lỗi/session lifecycle trong admin.
- Chưa có unit/e2e test hoặc lint hoàn chỉnh; có script `npm run lint` không có nghĩa lint đã sẵn sàng.

## Kiến trúc dự kiến

Tách sản phẩm/bài viết/trang thông tin và danh mục nhiều cấp là hướng trong kế hoạch.
Chưa chốt SQL hoặc URL mới cụ thể. Chốt theo kiểm kê và yêu cầu admin;
không triển khai mô hình mới chỉ dựa trên tên bảng của skeleton.
