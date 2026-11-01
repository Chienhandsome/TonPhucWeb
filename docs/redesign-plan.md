# Kế hoạch làm lại website Tôn Phúc

Ngày chốt phạm vi: 01/11/2026.

## Phạm vi đã được người dùng đồng ý

- Làm lại UI đẹp hơn, giữ nguyên nội dung website cũ.
- Kiểm kê, sao lưu, khảo sát các mẫu trang trước khi triển khai.
- Giữ sản phẩm, danh mục nhiều cấp, tin tức, giới thiệu và liên hệ.
- Website giới thiệu và nhận liên hệ; không có giỏ hàng hoặc thanh toán theo phạm vi hiện tại của dự án.
- Duyệt bản xem trước và chuyển nội dung trước khi chuyển tên miền.
- Chuẩn bị nền tảng Việt–Anh với next-intl ngay khi làm UI mới, ra mắt tiếng Việt trước và bật tiếng Anh khi bản dịch được duyệt; xem `product.md`.

## Kết quả kiểm kê bước đầu

Đã tải trực tiếp thành công 7 trang công khai, mã HTTP 200, vào `source-audit/`.
Thông tin thời gian tải, tiêu đề và tên file nằm trong `source-audit/pages.json`.
Đã phát hiện 154 URL khác nhau từ liên kết của 7 trang, lưu trong `source-audit/links.csv`.
Đây là URL tìm thấy, có thể bao gồm ảnh, tag, phân trang, http/https trùng nhau hoặc link lỗi; **không phải 154 bài hoặc 154 trang đã kiểm tra**.

| Mẫu trang | URL cũ dùng đối chiếu | Khoảng trống trong skeleton |
| --- | --- | --- |
| Trang chủ | `/` | Chưa có các khối sản phẩm và hệ thống điều hướng tương ứng |
| Giới thiệu | `/gioi-thieu` | Chưa có trang độc lập |
| Danh mục sản phẩm | `/gas-lanh` | Chưa có danh mục sản phẩm nhiều cấp |
| Chi tiết sản phẩm | `/gas-lanh-r134a-floron-xuat-xu-an-do-chinh-hang` | Chưa có mô hình và trang sản phẩm riêng |
| Danh sách tin tức | `/tin-tuc` | Hiện dùng chuyên mục bài viết, cần đối chiếu URL và phân trang |
| Chi tiết tin tức | `/dai-ly-phan-phoi-gas-lanh-hang-dau-viet-nam` | Có trang bài viết nhưng đường dẫn mới khác URL gốc |
| Liên hệ | `/lien-he` | Còn thông tin tạm; HTML gốc tải về không có tiêu đề trang hữu ích |

Các bản HTML là tài liệu tham chiếu; chưa sao lưu cơ sở dữ liệu, ảnh gốc, file đính kèm hoặc cấu hình hosting. Không đưa HTML cũ vào trang mới để thực thi. Chưa chụp ảnh giao diện desktop/mobile.

## Hướng UI đề xuất

- Phong cách doanh nghiệp ngành lạnh, bố cục thoáng, ảnh sản phẩm rõ và chữ dễ đọc.
- Lấy màu nhận diện từ logo thật trước khi chốt bảng màu; xanh đậm và nền sáng là hướng thử ban đầu.
- Header có danh mục, tìm kiếm, hotline; menu điện thoại dễ mở và thao tác.
- Trang chủ ưu tiên nhóm sản phẩm, sản phẩm tiêu biểu, giới thiệu và tin tức; dùng nội dung gốc cho các khối này.
- Card sản phẩm có ảnh, tên và liên kết xem chi tiết; thông tin chưa có trong nguồn thì để thiếu trong dữ liệu, không tự thêm thông số hay giá.
- Trang chi tiết có breadcrumb, ảnh, nội dung và liên hệ tư vấn; giữ toàn bộ nội dung đã đối chiếu.
- Nút gọi điện và Zalo dễ thấy trên điện thoại.

## Thứ tự triển khai và điều kiện hoàn thành

1. **Kiểm kê đầy đủ:** duyệt tiếp danh mục và phân trang, loại URL trùng/lỗi, phân loại sản phẩm/bài/trang; đối chiếu bản xuất admin. Mỗi nội dung có URL gốc và trạng thái ảnh/nội dung.
2. **Chốt dữ liệu và URL:** tách sản phẩm, bài viết và trang thông tin; hỗ trợ danh mục cha/con. Ưu tiên phục vụ nguyên đường dẫn cũ; chỉ dùng 301 cho đường dẫn thực sự đổi. URL lạ phải trả 404.
3. **Dựng luồng mẫu:** trang chủ → danh mục → một sản phẩm thật, có desktop/mobile; đồng thời kiểm tra một bài viết thật. Duyệt bản xem trước trước khi nhân rộng.
4. **Chuyển toàn bộ nội dung:** giữ tiêu đề, nội dung, ảnh, danh mục và thông tin SEO gốc khi có; lưu nguồn và đối chiếu số lượng. Tải ảnh về nơi lưu trữ mới để không phụ thuộc hosting cũ.
5. **Kiểm thử:** duyệt menu, tìm kiếm, phân trang, URL trực tiếp, gọi điện/Zalo, ảnh và bài dài; kiểm tra đăng nhập, tạo/sửa/nháp/xuất bản và upload ảnh trong admin. Kiểm tra sitemap, canonical, metadata, 301 và 404.
6. **Lên sóng:** chỉ chuyển DNS sau khi nội dung và bản xem trước được duyệt, có bản sao lưu cùng phương án quay lại. Kiểm tra tên miền thật trước khi hủy hosting cũ.

## Những đầu vào còn cần đối chiếu

- Bản xuất admin/database và kho ảnh để xác nhận đủ nội dung; dữ liệu công khai chỉ là một nguồn kiểm kê.
- Logo gốc chất lượng cao, thông tin liên hệ và địa chỉ còn sử dụng.
- Nội dung ngôn ngữ khác: web cũ có nút ngôn ngữ, chưa kiểm tra đầy đủ nội dung đích.
- Các mục thử nghiệm như `test cấp 1`: ghi nhận trong kiểm kê, chưa tự ý xóa hoặc đưa lên điều hướng mới.
- Tài khoản triển khai và quyền quản lý DNS ở giai đoạn lên sóng; không lưu mật khẩu trong repo.

## Chạy lại kiểm kê mẫu

Từ thư mục dự án, chạy `./scripts/inventory-source.ps1` bằng PowerShell có quyền truy cập mạng.
Script ghi đè bản tham chiếu của 7 trang mẫu, xuất manifest và liên kết; không crawl toàn website và không tải ảnh.
