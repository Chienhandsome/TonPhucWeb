# Triển khai bản xem thử Vercel

Cập nhật 02/11/2026. Deployment thành công sau khi người dùng xác nhận Production đầu tiên.

- URL mới nhất (slider 5 banner thay hero): https://tonphucweb-olyta39ew-congchien.vercel.app
- Alias Vercel: https://tonphucweb-congchien.vercel.app
- Dashboard: https://vercel.com/congchien/tonphucweb/7GA7XYvMBSxB1BsZ4YXmZpsV6QeG
- ID mới nhất: `dpl_7GA7XYvMBSxB1BsZ4YXmZpsV6QeG`, target Production, trạng thái READY.
- Bản đầu thành công: `dpl_FCzdWns596DQo1Zm9sn2Tmv9VfV8`, build 48 giây.
- Nguồn CLI upload từ checkout: commit nền `4354654` cộng thay đổi local UI/slider/dependency/ignore, chưa commit/push.
- Các deployment đầu có Vercel Authentication. Deployment slider mới báo `deploymentProtection: []` và HTTP200
  khi truy cập không xác thực; đợt sửa slider không thay cấu hình protection hoặc tạo share link. Noindex vẫn đúng.

## Đích triển khai

- Team: `congchien` (`team_TeaEqEJ027UyLN5s6IVPE7bT`).
- Project: `tonphucweb` (`prj_SIqdST0j4HneTMry3tv7Ke10YGpm`), tạo thành công qua CLI sau khi connector báo 403.
- Next.js, Node.js 22.x, cài `npm ci`, build `npm run build`, output tự nhận diện.
- Dùng URL Vercel để duyệt; chưa gắn `tonphuc.com` hoặc thay DNS.
- Giữ `SEO_ALLOW_INDEXING=false` cả Preview và Production tới khi phát hành được duyệt.
- Vercel CLI từ chối Preview cho deployment đầu tiên: yêu cầu Production.
  Người dùng đã xác nhận riêng; lệnh deploy dùng `--prod --skip-domain`.
  Vercel vẫn tạo alias `tonphucweb-congchien.vercel.app` cho deployment, không gắn domain tùy chỉnh.

## Biến môi trường

Đã sao chép đúng các giá trị public đang có trong `.env.local` vào Preview/Production của project Vercel,
không upload file env hoặc đưa secret/service-role lên browser:

| Biến | Giá trị / nguồn |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project `kegsqaxguruwrlfndyep` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key hiện có |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `images` |
| `SITE_URL` | `https://tonphuc.com` |
| `SEO_ALLOW_INDEXING` | `false` |

Canonical vẫn dùng tên miền thật theo [SEO/AIO](seo-aio.md); noindex trên bản duyệt.
Đăng nhập admin hiện dùng email/password, chưa có OAuth redirect cần đổi trong đợt deploy này.

## Phạm vi upload và kiểm tra

`.vercelignore` loại env, output build/dev, dependency, Graphify, tài liệu HTML nguồn,
SQL và công cụ kiểm tra khỏi gói upload bằng CLI. Public assets và JSON catalog vẫn được gửi.
`.vercel/` được Git bỏ qua. Không chạy env pull; lệnh link của CLI tự thêm token OIDC development
vào `.env.local` (vẫn được Git/upload bỏ qua); các biến public Supabase cũ đã được xác nhận còn đúng project.

Trước deploy: TypeScript, 5 unit checks SEO và production build đã thành công.
Build trong sandbox Windows gặp lỗi quyền native cache SWC; build ngoài sandbox thành công.
Dry-run: framework Next.js, 109 mục upload, khoảng 12,3 MB; env và nội dung Graphify được loại.

Sau deploy cần xác nhận trạng thái READY, kiểm tra trang chính/catalog/search/chi tiết/admin,
ảnh và kết nối Supabase, robots/sitemap/noindex.

## Kết quả và giới hạn

- Deployment đầu thất bại ở npm ci vì thiếu optional peer `@swc/helpers@0.5.23` trong lockfile.
  Đồng bộ bằng npm 10, giữ metadata/phiên bản cũ; lockfile chỉ thêm 11 dòng cho helper đó. Lần deploy sau npm ci và build đạt.
- 10 kiểm tra SEO chạy trên URL remote qua `vercel curl` đã xác thực: metadata/schema/admin noindex,
  robots/sitemap và PNG 1200×630 đều đạt.
- 64 route remote, tìm kiếm R32/không kết quả, phân trang đã đạt; ảnh bìa được kiểm tra tồn tại ở local.
- Kiểm tra runtime logs của đúng deployment sau truy cập không có bản ghi level:error trong cửa sổ 5 phút đã kiểm tra.
- Browser remote dừng ở trang đăng nhập Vercel; chưa kiểm tra giao diện desktop/mobile bằng browser trên bản remote.
  Đây là giới hạn của bản đầu. Bản slider mới đã truy cập được bằng browser không đăng nhập:
  nút Next đổi slide, chọn chấm và bố cục mobile 360px hoạt động; không thấy console error/warn.
  Remote HTTP xác nhận 5 slide, bỏ hero cũ, đủ liên kết và ảnh banner WebP; 10 kiểm tra SEO remote đạt.
- Không đăng nhập admin bằng mật khẩu thực hoặc thử ghi/upload trong đợt deploy.
- npm audit production dependencies báo Next.js critical, PostCSS gián tiếp high; chưa đánh giá mức khai thác cụ thể
  và chưa nâng major. Cần xử lý dependency trước mở công khai; giữ protection/noindex hiện tại.
- Các bản đầu triển khai qua CLI. Sau khi người dùng cài GitHub App Vercel và cấp quyền,
  đã liên kết thành công `Chienhandsome/TonPhucWeb` với project này ngày 02/11/2026;
  API xác nhận `link.type=github`, đúng org/repo và `productionBranch=main`.
- Commit local chưa kích hoạt deploy; push lên `main` sẽ tạo Production, nhánh khác tạo Preview theo Git integration mặc định.
  Chưa thực hiện một push thử nên chưa kiểm chứng webhook → build end-to-end.
- `gitProviderOptions.createDeployments=disabled` chỉ tắt việc Vercel bot tạo bản ghi GitHub Deployments
  (theo OpenAPI chính thức), không phải công tắc tắt build Vercel. Không có `git.deploymentEnabled=false`
  trong repo hoặc ignore build command trên project ở thời điểm kiểm tra.
- Trước push để auto-deploy cần đưa bản sửa lockfile vào commit cùng thay đổi UI hiện có;
  chưa commit/push thay người dùng. Chưa kiểm tra được auto-deploy bằng một push thực tế.
