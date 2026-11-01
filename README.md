# Gas Lạnh Tôn Phúc — Website mới (skeleton)

Phạm vi đã chốt ngày 01/11/2026: **làm lại UI đẹp hơn, giữ nguyên nội dung website cũ**. Xem [kế hoạch triển khai và kiểm kê mới](docs/redesign-plan.md). Danh sách 11 bài mẫu bên dưới chưa đại diện toàn bộ sản phẩm, danh mục và tin tức trên website gốc.

Website giới thiệu cho Gas Lạnh Tôn Phúc (tonphuc.com), đại lý gas lạnh tại TP.HCM.
Mục đích: giới thiệu với khách hàng và để admin đăng bài. **Không có giỏ hàng, không có thanh toán.**

> **Trạng thái hiện tại: SKELETON — chưa deploy, chưa trỏ DNS, chưa hủy web cũ.**
> Nội dung trong skeleton mới chỉ là 11 tiêu đề lấy từ trang chủ cũ kèm mô tả tạm placeholder.
> Nội dung đầy đủ phải chuyển từ tài khoản admin của web cũ (xem `docs/content-inventory.md`).

## Stack đã chốt

- Next.js 14, App Router, TypeScript, Tailwind CSS.
- Supabase: bảng `posts` và `categories`, Supabase Auth cho trang admin, Supabase Storage cho ảnh bìa.
- Deploy sau này lên Vercel (free tier).
- Trang admin dùng chung, không phân quyền riêng: ai có tài khoản admin đều đăng, sửa, xóa được bài.
  Chỉ cấp tài khoản cho người nhà tin cậy.

## Cấu trúc

```
tonphuc/
├── app/
│   ├── page.tsx                 Trang chủ giới thiệu + danh sách bài
│   ├── bai-viet/[slug]/page.tsx Trang chi tiết bài viết theo slug
│   ├── chuyen-muc/[slug]/page.tsx Trang danh sách bài theo chuyên mục
│   ├── lien-he/page.tsx         Trang liên hệ (đang để placeholder, chưa bịa số)
│   └── admin/page.tsx           Trang admin: đăng nhập, CRUD bài, chuyên mục, upload ảnh
├── components/                  Header, Footer, PostCard
├── lib/
│   ├── supabase.ts              Client Supabase (trả null khi chưa cấu hình env)
│   ├── seed.ts                  11 tiêu đề mẫu + hàm slugify tiếng Việt
│   └── posts.ts                 Lấy bài: có Supabase thì lấy từ DB, chưa có thì dùng seed
├── supabase/
│   ├── schema.sql               Tạo bảng categories, posts, bucket images, RLS
│   └── seed.sql                 Seed 11 tiêu đề mẫu (mô tả tạm, không bịa nội dung/giá)
├── docs/content-inventory.md    Danh mục nội dung cần chuyển từ web cũ
├── public/logo.png              Ảnh LOGO PLACEHOLDER — thay bằng logo thật trước khi lên sóng
├── .env.example                 Chỉ chứa placeholder, không chứa secret thật
└── package.json
```

## Các trang

| Đường dẫn | Chức năng |
|---|---|
| `/` | Trang chủ: giới thiệu, các dòng R22 / R32 / R410A / R507 / R407C, các hãng Honeywell, Chemours, Floron, Refron, danh sách bài |
| `/chuyen-muc/[slug]` | Bài viết theo chuyên mục (gioi-thieu, san-pham, bao-gia, kien-thuc) |
| `/bai-viet/[slug]` | Chi tiết bài viết |
| `/lien-he` | Liên hệ (cần điền hotline, Zalo, địa chỉ, giờ làm việc thật) |
| `/admin` | Đăng nhập admin, thêm / sửa / xóa bài, thêm chuyên mục, upload ảnh bìa, cờ published |

## Setup từng bước

### 1. Tạo project Supabase

1. Tạo project mới trên Supabase.
2. Vào **SQL Editor**, chạy lần lượt `supabase/schema.sql` rồi `supabase/seed.sql` (seed chỉ để xem thử, có thể bỏ qua nếu muốn nhập bài thật ngay).
3. Vào **Authentication → Users → Add user** để tạo tài khoản admin (email + mật khẩu).
   Tài khoản này chỉ dùng để đăng nhập trang `/admin`, không ghi vào code.

### 2. Chạy ở máy local

```bash
cd tonphuc
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY thật vào .env.local
npm install
npm run dev
# Mở http://localhost:3000 — trang chủ; http://localhost:3000/admin — trang quản trị
```

Lưu ý: nếu chưa điền env, trang công khai vẫn chạy bằng dữ liệu seed mẫu; trang `/admin`
sẽ hiện thông báo chưa cấu hình Supabase thay vì crash.

### 3. Deploy lên Vercel (bản xem trước, chưa trỏ tên miền)

1. Đẩy code lên GitHub (repo riêng).
2. Tạo project mới trên Vercel, import repo, chọn framework Next.js.
3. Trong Vercel → Settings → Environment Variables, thêm đúng 2 biến từ `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (và `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=images` nếu muốn ghi rõ).
4. Deploy, lấy link preview `.vercel.app` cho dì duyệt trước. **Chưa trỏ tonphuc.com ở bước này.**

### 4. Chuyển nội dung và lên sóng — chỉ làm khi dì duyệt xong

1. Đăng nhập admin web cũ, chuyển toàn bộ bài theo `docs/content-inventory.md` sang trang `/admin` của web mới
   (tiêu đề, slug, chuyên mục, nội dung đầy đủ, ảnh bìa upload lên Supabase Storage).
2. Điền thông tin liên hệ thật vào trang `/lien-he`, thay `public/logo.png` bằng logo thật của dì.
3. Đối chiếu slug cũ — slug mới, giữ nguyên slug khi có thể, các link đổi thì làm redirect.
4. Nhờ **chú (người đứng tên miền tonphuc.com)** trỏ DNS về Vercel theo hướng dẫn của Vercel
   (thêm domain tonphuc.com vào project Vercel, rồi cập nhật bản ghi DNS ở nhà cung cấp tên miền).
5. Kiểm tra kỹ trên tên miền thật: trang chủ, từng chuyên mục, từng bài, trang liên hệ, đăng nhập admin.
6. **Chỉ sau khi kiểm tra xong mới hủy web bên thứ ba** (hủy trước sẽ mất web cũ khi web mới còn lỗi).

## Những gì còn thiếu (chưa có trong skeleton)

- [ ] Logo thật của Gas Lạnh Tôn Phúc (hiện là placeholder tại `public/logo.png`).
- [ ] Nội dung đầy đủ của toàn bộ bài viết, lấy từ tài khoản admin web cũ (skeleton chỉ có tiêu đề + mô tả tạm).
- [ ] Tổng số bài thật trong admin (trang chủ cũ chỉ hiện 11 bài, có thể còn nhiều hơn).
- [ ] Thông tin liên hệ thật cho trang `/lien-he` (hotline, Zalo, địa chỉ, giờ làm việc).
- [ ] Project Supabase thật + tài khoản admin (tạo theo bước 1 ở trên).
- [ ] Repo GitHub + project Vercel (tạo khi deploy bản xem trước).
- [ ] Quyết định cuối về DNS: chỉ chú mới trỏ được vì tên miền đứng tên chú.

## Bảo mật — đọc kỹ

- Không commit `.env.local`, không ghi secret, mật khẩu hay key thật vào code, README hay file SQL.
- File `.env.example` chỉ có placeholder.
- Trang admin dùng chung: đừng chia sẻ tài khoản admin ra ngoài gia đình.
