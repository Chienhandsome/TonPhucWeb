# TonPhucWeb — Gas Lạnh Tôn Phúc

Làm lại UI của [tonphuc.com](https://tonphuc.com) đẹp hơn, giữ nguyên nội dung thật.
Website giới thiệu sản phẩm và nhận liên hệ; phạm vi hiện tại không có giỏ hàng/thanh toán.

**Hiện trạng:** đã triển khai bản UI mới bằng Next.js, kết nối Supabase và chuẩn bị next-intl tiếng Việt.
Catalog tham chiếu có 40 sản phẩm, 8 bài nguồn và ảnh thật; chưa chuyển đủ website hoặc quản trị catalog qua database.
Đã có [bản Vercel](https://tonphucweb-congchien.vercel.app) với slider 5 banner nguồn, giữ noindex; chưa chuyển DNS.
Xem [trạng thái và việc tiếp theo](docs/status.md), [triển khai Vercel](docs/vercel-deploy.md).

## Dành cho AI coding

Bắt đầu từ [AGENTS.md](AGENTS.md), rồi đọc:

| Tài liệu | Nội dung |
| --- | --- |
| [Sản phẩm và quyết định](docs/product.md) | Mục tiêu, phạm vi đã chốt, câu hỏi còn mở, điều kiện hoàn thành |
| [Kiến trúc](docs/architecture.md) | Code, routes, dữ liệu, auth/RLS và khoảng trống |
| [Quy chuẩn UI](docs/design-system.md) | Hướng thị giác, token, mẫu trang, component, responsive và quy trình duyệt |
| [SEO và AIO](docs/seo-aio.md) | Metadata, schema, sitemap/robots, noindex preview và cách mở index khi phát hành |
| [Nội dung của bản UI](docs/public-content.md) | Nguồn JSON/ảnh công khai, phạm vi đã lấy, giới hạn và cách kiểm tra |
| [Trạng thái](docs/status.md) | Đã làm, đã kiểm tra, chưa làm, việc tiếp theo |
| [Kế hoạch UI và chuyển đổi](docs/redesign-plan.md) | Mẫu trang, hướng thiết kế đề xuất, thứ tự chuyển đổi |
| [Supabase setup](docs/supabase-setup.md) | Project đã chọn, cấu hình local, cấp admin và kiểm tra |
| [Kiểm kê nội dung ban đầu](docs/content-inventory.md) | Ghi nhận lịch sử; chưa phải tổng dữ liệu cần chuyển |
| [Manifest mẫu](docs/source-audit/pages.json) / [URL phát hiện](docs/source-audit/links.csv) | Bằng chứng kiểm kê công khai ban đầu |

## Chạy ở local

Môi trường đang dùng: Windows PowerShell, Node.js 22; xem package.json và lockfile cho dependency.

```powershell
cd D:\Working\TonPhucWeb
npm ci
```

Máy này đã có `.env.local`. Ở checkout mới, chỉ sao chép khi file chưa tồn tại:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Điền URL và publishable key của đúng project vào `.env.local`, rồi chạy:

```powershell
npm run dev
```

Mở địa chỉ Local terminal in ra, thường là `http://localhost:3000`. Trang quản trị: `/admin`.
Nhấn `Ctrl+C` để dừng. Nếu PowerShell không truyền đúng tùy chọn CLI qua npm, chạy trực tiếp:

```powershell
node node_modules/next/dist/bin/next dev --hostname=127.0.0.1
```

## Cấu hình và dữ liệu

- `NEXT_PUBLIC_SUPABASE_URL`: URL project.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key; hỗ trợ `NEXT_PUBLIC_SUPABASE_ANON_KEY` cũ.
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: mặc định `images`.
- Chưa có env: public dùng 11 tiêu đề mẫu và placeholder; admin báo thiếu cấu hình.
- Có env: lấy dữ liệu thật; database trống là bình thường. Lỗi truy vấn không được che bằng seed.
- Admin cần `app_metadata.role = admin`; chỉ tạo user trong Auth chưa đủ.
- `.env.local` được Git bỏ qua. Không ghi mật khẩu, service-role/secret key vào repo.

**Không cần tạo project mới hoặc chạy lại schema cho máy đã kết nối.**
`supabase/schema.sql` là schema khởi tạo; `supabase/seed.sql` chứa placeholder bật xuất bản,
không chạy trên project thật chỉ để lấp dữ liệu. Xem [Supabase setup](docs/supabase-setup.md).

## Kiểm tra

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --env-file=.env.local scripts/check-supabase.mjs
node scripts/check-ui.mjs
npm run build
```

Chọn kiểm tra theo phần thay đổi. Script Supabase cần mạng, thử ghi/upload bằng khách và mong đợi bị từ chối;
đọc giới hạn trong tài liệu setup trước khi chạy. Chưa có unit/e2e test hoặc lint hoàn chỉnh.
`check-ui.mjs` cần server local đang chạy. Dev dùng `.next-dev`, build/start production dùng `.next` để tách cache.
Mỗi cổng chỉ chạy một server; khi kiểm tra production song song với dev, dùng cổng khác như 3100 và đặt `UI_CHECK_URL` tương ứng.

## Quy trình lên sóng

Kiểm kê đủ → duyệt luồng UI mẫu → chuyển nội dung/ảnh → kiểm thử → duyệt preview → chuyển DNS → kiểm tra tên miền thật.
Giữ web cũ hoạt động đến khi chuyển xong. Đã deploy bản duyệt lên `congchien/tonphucweb` trên Vercel,
giữ noindex; bản slider hiện truy cập được không đăng nhập, chưa nối domain thật. Đã liên kết GitHub: push `main` → Production,
nhánh khác → Preview; commit ở local chưa kích hoạt deploy. Xem [triển khai](docs/vercel-deploy.md).
