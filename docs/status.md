# Trạng thái và bàn giao

Cập nhật: 01/11/2026. Đây là bản ghi tại thời điểm cập nhật, không phải trạng thái live của server/database.

## Đã hoàn thành

- Khung Next.js: trang chủ, bài, chuyên mục, liên hệ và admin.
- Chốt mục tiêu UI đẹp hơn, giữ nội dung và quy trình chuyển đổi.
- Chốt hướng đa ngôn ngữ: chuẩn bị Việt–Anh với next-intl khi làm UI mới, ra mắt tiếng Việt trước. Chưa tích hợp thư viện hoặc bản dịch.
- Lưu 7 HTML mẫu; phát hiện 154 URL. Chưa crawl/backup đầy đủ.
- Kết nối local với Supabase **TonPhucWeb**, ref `kegsqaxguruwrlfndyep`.
- Tạo `posts`, `categories`, bucket `images`, RLS dựa trên app metadata.
- Tạo 4 chuyên mục khởi đầu; lần kiểm tra setup có 0 bài. Không nhập placeholder vào DB.
- Cấp quyền admin cho email người dùng chọn; chi tiết trong `supabase-setup.md`.
- Bổ sung bộ tài liệu cho AI và `design-system.md`: hướng UI, token tạm, component, responsive và quy trình duyệt; chưa triển khai UI mới.

## Bằng chứng kiểm tra đã có

- TypeScript `tsc --noEmit` thành công trong bước setup.
- REST thật: đọc chuyên mục và join bài/chuyên mục thành công.
- Khách bị chặn tạo bài và upload ảnh.
- Transaction SQL dùng claim mô phỏng: user thường không đọc nháp/không ghi bài;
  admin đọc nháp và thêm/sửa/xóa được. Dữ liệu kiểm tra đã rollback.
- Trang chủ và `/admin` local trả HTTP 200 sau khi kết nối env thật.

Chưa có bằng chứng đăng nhập bằng mật khẩu thật, upload bằng phiên admin trong browser,
kiểm thử UI desktop/mobile hoặc build production. Server local có thể đã dừng; cần kiểm tra lại.

## Việc tiếp theo

1. Nhận 2 câu trả lời còn lại trong `product.md`: phạm vi admin và nguồn dữ liệu.
2. Kiểm kê đủ sản phẩm, danh mục, bài, trang và tài nguyên; đối chiếu admin nếu có.
3. Lấy logo thật, xác minh liên hệ; khảo sát/chụp mẫu desktop/mobile.
4. Chốt mô hình sản phẩm/danh mục có hỗ trợ bản dịch và bảo toàn URL theo kiểm kê.
5. Dựng UI mẫu với dữ liệu thật, tích hợp next-intl và tách chữ giao diện tiếng Việt; duyệt trước khi triển khai diện rộng.
6. Chuyển nội dung, kiểm thử chức năng/SEO/quyền, chuẩn bị triển khai.

## Chưa hoàn thành

- UI mới, mô hình sản phẩm riêng, toàn bộ nội dung/ảnh thật.
- Chuyển và xác minh đủ URL, metadata, redirect.
- Deploy preview/production, chuyển DNS, hủy hosting cũ.

Không coi các việc này đã xong chỉ vì skeleton chạy hoặc kết nối Supabase thành công.

## Cách cập nhật tài liệu

- Quyết định nghiệp vụ: cập nhật `product.md`, đánh dấu đã/chưa chốt.
- Đổi code/schema/luồng dữ liệu: cập nhật `architecture.md` và tài liệu chuyên đề.
- Kết thúc mốc: cập nhật ngày, trạng thái và bằng chứng trong file này.
- Đổi cách chạy/env: cập nhật README, `.env.example`, tài liệu setup cùng lúc.
- Chỉ lưu kết quả và giới hạn hữu ích; không chép toàn bộ hội thoại/log chứa thông tin nhạy cảm.
