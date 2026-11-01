# Quy chuẩn UI — TonPhucWeb

Cập nhật: 01/11/2026. **Bản định hướng để triển khai mẫu, chưa phải thiết kế đã duyệt.**
Tài liệu này dùng chung cho các AI coding. Quyết định sản phẩm xem [product.md](product.md);
kiến trúc thực tế xem [architecture.md](architecture.md).

## Yêu cầu đã chốt

- Làm lại UI đẹp hơn, giữ nội dung thật và nhận diện Tôn Phúc.
- Website giới thiệu sản phẩm ngành lạnh và nhận liên hệ tư vấn; không có giỏ hàng/thanh toán.
- Chuẩn bị Việt–Anh bằng next-intl khi làm UI mới, ra mắt tiếng Việt trước.
- Tạo mẫu có dữ liệu thật để duyệt trước khi áp dụng diện rộng.

## Hướng thị giác đề xuất

Phong cách doanh nghiệp ngành lạnh: gọn, rõ ràng, đáng tin cậy qua thông tin thật và ảnh sản phẩm.
Ưu tiên khả năng tìm sản phẩm, đọc thông số và liên hệ; dùng khoảng trắng và phân cấp chữ để dẫn mắt.
Hạn chế hiệu ứng trang trí không phục vụ nội dung, nền chuyển màu dày đặc và quá nhiều khối bo tròn.
Không tự thêm số liệu thành tích, chứng nhận, logo đối tác, đánh giá khách hàng hoặc cam kết.

Logo tại `public/logo.png` là placeholder. Chưa có logo gốc/bảng màu cuối cùng được xác nhận.
Không vẽ lại logo hoặc coi màu skeleton là nhận diện thương hiệu đã duyệt.

## Nền tảng thị giác

Các giá trị dưới đây là **mốc hiện có hoặc đề xuất cho bản mẫu**. Khi duyệt mẫu, cập nhật cả tài liệu
và token dùng chung; không tạo thêm bảng màu riêng cho từng trang.

| Nhóm | Mốc dùng cho bản mẫu | Trạng thái |
| --- | --- | --- |
| Màu chính | `brand.700` = `#0369a1`, đậm hơn `brand.800` = `#075985` | Đang có trong Tailwind, tạm dùng |
| Màu nhấn/nhạt | `brand.600` = `#0284c7`, `brand.50` = `#f0f9ff`, `brand.100` = `#e0f2fe` | Đang có, chưa chốt thương hiệu |
| Nền và chữ | Nền `#f8fafc`, surface trắng, chữ chính `#0f172a` | Đang có trong CSS |
| Font | System sans với hỗ trợ dấu tiếng Việt; giữ stack hiện tại trước | Đang có, chưa chọn font thương hiệu |
| Chữ nội dung | 16px, giãn dòng khoảng 1.6; nhãn phụ 14px khi phù hợp | Đề xuất |
| Tiêu đề trang | Khoảng 28–36px trên mobile, 36–48px desktop tùy độ dài | Đề xuất, kiểm tra bằng tiêu đề thật |
| Khoảng cách | Theo nhịp 4/8px; section khoảng 32–64px tùy màn hình | Đề xuất |
| Bo góc | Khoảng 8–12px cho input/card; dùng nhất quán | Đề xuất |
| Khung nội dung | Khoảng 1200px, lề 16px mobile, 24–32px desktop | Đề xuất; skeleton hiện `max-w-5xl` |

Mã token hiện tại ở `tailwind.config.js`, CSS toàn cục ở `app/globals.css`.
Khi triển khai, ưu tiên token có tên theo vai trò và component tái sử dụng; hạn chế rải mã màu trực tiếp trong JSX.
Kiểm tra tương phản chữ/nền của trạng thái thực tế; việc có token không đảm bảo mọi tổ hợp đều dễ đọc.

## Bố cục các mẫu trang

| Trang / khối | Yêu cầu cho bản mẫu |
| --- | --- |
| Header | Logo thật khi có, menu rõ, danh mục sản phẩm, tìm kiếm khi đã triển khai, hotline |
| Trang chủ | Giới thiệu/banner từ nguồn thật, nhóm sản phẩm, sản phẩm tiêu biểu, giới thiệu công ty, tin tức, liên hệ |
| Danh mục | Breadcrumb, tên danh mục, phân cấp cha/con, danh sách sản phẩm; phân trang khi có dữ liệu đủ |
| Chi tiết sản phẩm | Tên, ảnh/gallery nếu nguồn có, thông số và nội dung đầy đủ, liên hệ tư vấn, sản phẩm liên quan theo dữ liệu |
| Tin tức | Danh sách có ảnh/tiêu đề; trang chi tiết ưu tiên đọc bài dài và ảnh trong bài |
| Giới thiệu/liên hệ | Giữ thông tin đã đối chiếu; gọi điện, Zalo, chỉ đường dùng đích đã xác nhận |
| Footer | Thông tin doanh nghiệp và điều hướng thật; không đưa ghi chú kỹ thuật/README ra cho khách |
| Admin | Form rõ nhãn, trạng thái nháp/xuất bản dễ hiểu, thông báo lưu/upload và lỗi dễ xử lý |

Chỉ render điều khiển hoạt động được; không dựng ô tìm kiếm, bộ lọc hay nút chuyển ngôn ngữ chỉ để trang trông đầy đủ.
Trình tự section và lựa chọn sản phẩm tiêu biểu được điều chỉnh khi có đủ dữ liệu và duyệt mẫu.

## Component và trạng thái

- Dùng chung button, link, input/select/textarea, card sản phẩm/bài, breadcrumb và thông báo khi có nhu cầu lặp lại.
- Link dùng để điều hướng, button dùng cho hành động; icon cần tên dễ hiểu hoặc nhãn hỗ trợ đọc màn hình.
- Phân biệt default, hover, focus, disabled, loading, success và error theo component.
- Khi đang lưu/upload, hiển thị tiến trình và ngăn gửi lặp; giữ dữ liệu đã nhập nếu thao tác thất bại.
- Lỗi form gắn với trường liên quan, không chỉ đổi màu. Thao tác xóa phải có xác nhận phù hợp.
- Phân biệt không có dữ liệu, không tìm thấy kết quả và lỗi tải. Không dùng nội dung giả để che lỗi.
- Ảnh sản phẩm ưu tiên `object-contain` để không cắt nhãn/thông số; ảnh bài chọn crop theo nội dung thật.
- Dành kích thước/tỷ lệ cho ảnh để tránh nhảy bố cục; ảnh thiếu cần trạng thái trung thực.
- Không dùng màu hoặc vị trí làm dấu hiệu duy nhất để nhận biết trạng thái.

## Mobile và khả năng sử dụng

- Thiết kế từ màn hình hẹp, kiểm tra ít nhất tại 360, 768 và 1440px; đây là kích thước QA mẫu, không ép số cột cố định.
- Không để toàn trang cuộn ngang; bảng thông số rộng có vùng cuộn riêng và dấu hiệu dễ nhận biết.
- Menu mobile mở/đóng được bằng bàn phím, có trạng thái rõ và không giữ focus trong vùng đã ẩn.
- Vùng chạm cho hành động chính hướng tới 44×44px; hotline/Zalo không che nội dung hoặc nút khác.
- Có focus nhìn thấy, nhãn form, alt ảnh phù hợp, thứ tự heading và thứ tự tab hợp lý.
- Kiểm tra dấu tiếng Việt, tiêu đề dài, ảnh lỗi và nội dung dài; không chỉ kiểm tra dữ liệu ngắn đẹp.
- Nếu có animation, dùng nhẹ và hỗ trợ giảm chuyển động; không cần thêm thư viện animation chỉ để trang sinh động.

## Đa ngôn ngữ

- Khi làm UI mới, đưa chữ giao diện vào message của next-intl, không hardcode rải rác trong component.
- Bản dịch nội dung sản phẩm/bài viết thuộc mô hình dữ liệu, không đưa toàn bộ vào file message UI.
- Dùng layout linh hoạt khi bản dịch dài hơn; không ghép câu từ các mảnh dịch rời.
- Giữ URL tiếng Việt; tiếng Anh dự kiến `/en/...`. Không bật chuyển tiếng Anh trước khi nội dung sẵn sàng.
- Admin dùng tiếng Việt trước. Nhãn thương hiệu, mã gas và đơn vị kỹ thuật phải giữ chính xác.

## Cách triển khai và duyệt

1. Đối chiếu logo, nội dung và ảnh; đọc inventory, không coi ảnh/tiêu đề placeholder là tài nguyên chuẩn.
2. Dùng hướng dẫn UI phù hợp có sẵn trong môi trường; nếu dùng Sites thì giữ checkout/stack hiện tại theo phạm vi dự án. Việc chọn skill UI không tự thay đổi hosting đã định hướng.
3. Dựng luồng trang chủ → danh mục → chi tiết một sản phẩm thật, thêm một bài viết thật; bắt đầu từ header/footer và token chung.
4. Kiểm tra desktop/mobile, bàn phím, trạng thái lỗi/trống/loading và đường dẫn bằng trình duyệt khi có thể.
5. Trình bày mẫu để duyệt; ghi lại lựa chọn đã duyệt trong file này, rồi áp dụng cho các trang còn lại.

Hiện chưa có thư viện component hoặc icon nào được chốt. Chọn theo nhu cầu thực tế của mẫu,
không cài chồng nhiều thư viện UI để giải quyết cùng một loại component.

## Đầu vào còn thiếu

- Logo gốc chất lượng cao và xác nhận màu thương hiệu.
- Website tham khảo hoặc phong cách cụ thể nếu người dùng có; không bắt buộc để bắt đầu bản mẫu.
- Ảnh và nội dung sản phẩm thật, thông tin liên hệ đã xác minh.
- Duyệt mẫu để chốt font, màu, khoảng cách và thành phần cuối cùng.
