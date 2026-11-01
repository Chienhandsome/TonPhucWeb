# Supabase local — TonPhucWeb

Project: `kegsqaxguruwrlfndyep` (TonPhucWeb).

Đã cấu hình `.env.local` bằng URL và publishable key; file này được Git bỏ qua.
Không cần service-role key hoặc database password trong ứng dụng.
Ứng dụng vẫn hỗ trợ tên biến `NEXT_PUBLIC_SUPABASE_ANON_KEY` cũ để tương thích.

## Database

Schema hiện tại nằm trong `supabase/schema.sql`; đã áp dụng bằng migration
`initialize_website_content_and_admin_policies` trên project này.

- `categories`: đã tạo 4 chuyên mục khởi đầu cho skeleton, có thể đổi khi chuyển dữ liệu thật.
- `posts`: chưa nhập bài placeholder; bài mới trong admin mặc định là bản nháp.
- Storage bucket `images`: đọc công khai, chỉ admin được ghi.
- Khách chỉ đọc chuyên mục và bài đã xuất bản.
- Quyền quản trị phụ thuộc `app_metadata.role = admin`, không phụ thuộc user metadata.

## Tài khoản admin

Email người dùng chọn: `cerkvena291@gmail.com`.
Tài khoản đã được tạo, xác nhận email và cấp `app_metadata.role = admin` ngày 01/11/2026.
Tạo user trong Supabase Dashboard → Authentication → Users → Add user → Create new user,
tự đặt mật khẩu và bật Auto Confirm User. Không chia sẻ mật khẩu trong chat.

Sau khi tài khoản tồn tại, người quản lý chạy SQL sau trong SQL Editor để cấp quyền:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'cerkvena291@gmail.com'
  and email_confirmed_at is not null;
```

Đăng xuất và đăng nhập lại `/admin` để nhận JWT chứa quyền mới.
Việc tạo tài khoản thường không tự cấp quyền admin.

## Kiểm tra kết nối

```powershell
node --env-file=.env.local scripts/check-supabase.mjs
npm run dev
```

Script kiểm tra truy vấn REST, quan hệ bài/chuyên mục, và xác nhận khách không được
ghi bài/upload ảnh. Khi phát hiện quyền ghi công khai sai, script dừng và báo đường dẫn
dữ liệu kiểm tra cần xử lý. Chưa có bài thật thì trang chủ không có bài là bình thường.

Trang quản trị: http://127.0.0.1:3000/admin.
Chỉ đánh dấu hoàn tất đăng nhập/CRUD/upload admin sau khi có tài khoản và kiểm tra thực tế.

## Kết quả kiểm tra setup

- API thật: đọc 4 chuyên mục và truy vấn bài kèm quan hệ chuyên mục thành công.
- Khách: ghi bài và upload ảnh bị từ chối.
- Kiểm tra database trong transaction rollback: user thường không đọc được bản nháp
  và không ghi được bài; claim admin đọc được nháp và thêm/sửa/xóa được bài.
  Không lưu lại dữ liệu kiểm tra.
- Trang chủ và `/admin` local trả HTTP 200, không còn thông báo thiếu cấu hình/dữ liệu seed.
- TypeScript `tsc --noEmit` chạy thành công.
- Chưa kiểm tra đăng nhập bằng mật khẩu của người dùng hoặc upload ảnh bằng phiên admin trên trình duyệt.
