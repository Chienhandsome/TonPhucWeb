# Sản phẩm và quyết định

Cập nhật: 01/11/2026. Phân biệt yêu cầu đã chốt với đề xuất/chưa quyết định.

## Mục tiêu đã chốt

Thay website Gas Lạnh Tôn Phúc bằng UI đẹp hơn, giữ nguyên nội dung thật.
Khách tìm sản phẩm, đọc thông tin và liên hệ tư vấn; người quản trị tự cập nhật nội dung.
Người dùng đã đồng ý quy trình kiểm kê → thiết kế mẫu → chuyển nội dung → kiểm thử → chuyển tên miền.

| Hạng mục | Quyết định / trạng thái |
| --- | --- |
| UI | Thiết kế lại; không cần sao chép từng pixel giao diện cũ |
| Nội dung | Giữ nội dung thật; không thay bằng bài do AI tự viết |
| Chuyển đổi | Sản phẩm, danh mục nhiều cấp, tin tức, giới thiệu, liên hệ; tổng số cần kiểm kê |
| Giao dịch | Website giới thiệu và nhận liên hệ; không có giỏ hàng/thanh toán theo phạm vi hiện tại |
| Admin | Đã có quản trị bài/chuyên mục/ảnh; phạm vi sản phẩm/banner/liên hệ đang hỏi người dùng |
| Ngôn ngữ | Chưa chốt; web cũ có nút ngôn ngữ, chưa kiểm kê bản dịch |
| URL/SEO | Ưu tiên giữ URL cũ; mapping và 301 cho URL đổi chưa triển khai đầy đủ |
| Supabase | Đã chọn và kết nối project TonPhucWeb |
| Hosting mới | README trước đây định hướng Vercel; chưa có xác nhận triển khai/plan thực tế |
| Lên sóng | Duyệt nội dung và preview trước khi chuyển DNS; chưa hủy hosting cũ |

## Bảo toàn nội dung

- Mỗi bản ghi chuyển có URL nguồn, loại nội dung, nội dung đầy đủ, ảnh và trạng thái đối chiếu.
- Giữ tiêu đề, nội dung, thông số và ảnh; đổi bố cục hiển thị. Cần biên tập thì ghi rõ và hỏi theo tình huống.
- Không suy luận thông số từ tên sản phẩm, tự thêm giá hoặc cam kết kinh doanh.
- Dữ liệu chưa xác minh không được trình bày như thông tin đã duyệt.
- 11 tiêu đề seed là dữ liệu mẫu lịch sử. 154 URL phát hiện không tương đương 154 bài/sản phẩm.
- Thu thập ảnh/file gốc về nơi lưu trữ mới; HTML mẫu không thay thế backup đầy đủ.

## Hướng UI đề xuất, chưa duyệt

Phong cách doanh nghiệp ngành lạnh: nền sáng, chữ dễ đọc, ảnh sản phẩm rõ, điều hướng danh mục thuận tiện,
hotline/Zalo dễ thao tác trên điện thoại. Màu cuối cùng theo logo thật và bản mẫu được duyệt.
Luồng mẫu ưu tiên: trang chủ → danh mục → chi tiết sản phẩm, kèm một bài thật.
Chi tiết trong [kế hoạch UI và chuyển đổi](redesign-plan.md).

## Câu hỏi đang chờ

1. Chỉ tiếng Việt giai đoạn đầu hay cần cả tiếng Anh ngay?
2. Admin quản lý sản phẩm/danh mục/bài viết trước, hay cả banner và thông tin liên hệ?
3. Người dùng có admin cũ, bản xuất database/kho ảnh, hay chỉ các trang công khai?

Cập nhật bảng quyết định sau khi có câu trả lời; không coi lựa chọn gợi ý của AI là câu trả lời của người dùng.

## Điều kiện hoàn thành

- Đủ nội dung đã đối chiếu, ảnh và thông tin thật; thay các placeholder trước khi lên sóng.
- Luồng xem sản phẩm, đọc tin, điều hướng và liên hệ chạy trên desktop/mobile.
- Admin đăng nhập, tạo/sửa/nháp/xuất bản và upload ảnh được bằng tài khoản thật.
- Kiểm tra quyền, URL trực tiếp, URL cũ/301/404, metadata, sitemap và canonical.
- Preview được duyệt, có backup/phương án quay lại và kiểm tra sau chuyển tên miền.
