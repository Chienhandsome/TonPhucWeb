# Đặc tả toàn bộ chức năng Admin — Web Gas Lạnh Tôn Phúc (web mới)

> Dùng cho Codex / người triển khai. Làm trong repo `Chienhandsome/TonPhucWeb`, nhánh `main`, HEAD kiểm tra lúc viết đặc tả: `56e1f44` "fix: remove arrow button" (sau `231ea43` fix UI). Đừng làm việc trên bản skeleton cũ ở `~/workspace/tonphuc/`.
> Chuyện chuyển dữ liệu (257 sản phẩm, 38 bài từ admin cũ) tính sau — đặc tả này chỉ chốt **chức năng admin phải có**, không phụ thuộc vào việc dữ liệu đã nhập hay chưa. Khi nhập dữ liệu sau này, các trường trong đặc tả này phải chứa được toàn bộ trường của admin cũ.

## 1. Kết quả rà kỹ trang admin hiện tại (căn cứ để viết đặc tả)

Đã đọc kỹ `app/admin/page.tsx` (244 dòng, một trang duy nhất), `app/admin/layout.tsx`, `supabase/schema.sql`, `docs/product.md`, `docs/status.md` và các nguồn dữ liệu hiện tại (`data/public-content.json`, `data/home-banners.json`, `data/site-info.json`).

### 1.1. Hiện tại admin làm được gì (ít, nhưng có thật)
- **Đăng nhập:** email + mật khẩu qua Supabase Auth. Chỉ tài khoản có `app_metadata.role = admin` mới vào được; tài khoản thường bị đăng xuất và báo "chưa được cấp quyền quản trị". Trang `/admin` có `noindex/nofollow`, nút gọi/Zalo nổi bị ẩn trong admin.
- **Bài viết (posts):** tạo, sửa, xóa. Trường có sẵn: tiêu đề, slug (tự sinh từ tiêu đề nếu để trống), chuyên mục (chọn 1), mô tả ngắn, nội dung (ô textarea thuần, 8 dòng), ảnh bìa (upload 1 ảnh lên bucket `images`, thư mục `covers/`), tick "Đã xuất bản" (bỏ tick = nháp, khách chưa thấy).
- **Danh sách bài viết:** xếp theo ngày tạo giảm dần, mỗi dòng hiện tiêu đề + trạng thái Đã xuất bản/Nháp + đường dẫn `/bai-viet/{slug}`, nút Sửa (nạp lại form ở đầu trang và cuộn lên đầu) và Xóa (hộp xác nhận của trình duyệt, xóa là mất hẳn, không hoàn tác).
- **Chuyên mục:** chỉ có **thêm mới bằng tên** (slug tự sinh). Không sửa, không xóa, không xếp thứ tự, không danh mục cha/con, không hiện số bài trong danh mục.
- **Bảo mật dữ liệu:** RLS đã bật cho bảng `categories` và `posts`: khách chỉ đọc bài đã xuất bản và danh mục; chỉ tài khoản admin mới ghi. Bucket ảnh đọc công khai, chỉ tài khoản đăng nhập có quyền admin mới upload/xóa.

### 1.2. Hiện tại admin CHƯA làm được gì (đây là phần đặc tả phải bổ sung)
- **Không quản lý sản phẩm:** catalog hiện đọc từ file tĩnh `data/public-content.json` (40 sản phẩm, 8 nhóm trong snapshot). Admin không thêm/sửa/xóa sản phẩm, không sửa danh mục sản phẩm, không sửa ảnh hay mô tả sản phẩm.
- **Không quản lý banner:** slider 5 banner trang chủ đọc từ `data/home-banners.json` (ảnh local `/banners/banner-*.png`, tiêu đề, nút, link). Admin không thêm/sửa/xóa/đổi thứ tự banner.
- **Không quản lý liên hệ và thông tin công ty:** số hotline, Zalo, email, địa chỉ, mã số thuế đọc từ `data/public-content.json` / `data/site-info.json`. Admin không sửa được.
- **Không quản lý trang tĩnh:** Giới thiệu, Liên hệ, Footer đọc từ file JSON. Admin không sửa được.
- **Không có thư viện ảnh:** mỗi bài chỉ upload 1 ảnh bìa, không xem lại, không dùng lại, không xóa ảnh cũ, không ghi chú thích ảnh (alt).
- **Không có tìm kiếm, lọc, phân trang trong admin:** danh sách bài tải toàn bộ, không tìm theo tên, không lọc theo chuyên mục hay trạng thái nháp/xuất bản.
- **Không có SEO riêng cho bài:** không có trường tiêu đề SEO, mô tả SEO, không sửa ngày đăng, không có tác giả.
- **Không có thùng rác, lịch sử, xuất dữ liệu:** xóa là mất hẳn; không xem ai sửa gì, không khôi phục; không xuất sản phẩm/bài ra file — đúng điểm yếu đã làm admin cũ khó chuyển dữ liệu.
- **Không quản lý tài khoản trong admin:** tài khoản chỉ tạo trong Supabase Dashboard, admin không đổi mật khẩu, không quên mật khẩu, không xem phiên đăng nhập.
- **Giao diện admin chưa theo chuẩn dễ đọc:** ô nhập 14px, chú thích trang đăng nhập 13px, form bài viết ở đầu trang rồi mới tới danh sách, trang dài, không có menu điều hướng giữa các mục. Người lớn tuổi dùng sẽ mỏi mắt giống như web công khai trước đợt sửa dễ đọc.

### 1.3. Đối chiếu với admin cũ (để đặc tả không thiếu chức năng)
Admin cũ (đã xác nhận 02/11/2026, chỉ đọc; khám kỹ lại 03/11/2026) có: Sản phẩm 257, Danh mục cấp 1: 9 dòng liệt kê (8 tên phân biệt, R22 lặp 2 lần), Danh mục cấp 2: 19, Tin tức 38, Kho lạnh 0 bài, Cụm máy dàn ngưng 0, Dàn lạnh công nghiệp 0, Liên kết website 9 (không phải 2 như lần đếm đầu), Tags sản phẩm: hơn 20 dòng (3 trang, trang 1 đã 20 dòng, chưa đếm tổng — không dùng con số 9 cũ), Quảng cáo 0, và các biểu mẫu đơn Giới thiệu/Liên hệ/Footer/Banner/Logo/Favicon/Slider/Đối tác/Hỗ trợ/Thông tin công ty/SEO.
Đặc tả mới phải bao phủ toàn bộ chức năng đó, nhưng **gọn lại, không giữ nguyên các mục rỗng**: Kho lạnh, Cụm máy, Dàn lạnh đang 0 bài sẽ không thành 3 module riêng, mà thành danh mục trong một module Bài viết chung (xem mục 4). Nếu sau này shop muốn tách lại thì chỉ cần thêm danh mục, không cần thêm module.

## 2. Nguyên tắc chung cho toàn bộ admin

1. **Một tài khoản quản trị dùng chung, không phân quyền.** Đã chốt từ đầu: admin dùng chung, không có vai trò riêng. Mọi người vào admin đều làm được mọi việc trong đặc tả này. Không tạo vai trò biên tập, duyệt bài hay chỉ xem.
2. **Tiếng Việt, chữ to, một việc một màn hình.** Admin dùng tiếng Việt. Chữ nội dung tối thiểu 16px, chữ quan trọng không dưới 14–15px, chữ phụ đậm, tương phản tối thiểu 4.5:1 — cùng chuẩn dễ đọc đã áp cho web công khai, vì người dùng admin cũng là chủ shop lớn tuổi. Mỗi màn hình chỉ làm một việc chính, nút chính luôn rõ và to, nút nguy hiểm (Xóa) luôn phải xác nhận.
3. **Không bịa dữ liệu.** Không tự sinh giá, thông số, xuất xứ hay cam kết kinh doanh. Chỗ nào chưa có dữ liệu thì để trống và hiện cảnh báo, không điền chữ mẫu rồi đăng lên web công khai.
4. **Không có giỏ hàng, thanh toán, quản lý số lượng tồn kho.** Web chỉ giới thiệu và nhận liên hệ. Admin không quản lý đơn hàng hay số lượng tồn kho (không có trường số lượng tồn). **Ngoại lệ đã chốt theo quyết định mới ở mục 5.2 và 16, được ưu tiên hơn các câu cũ trong đặc tả này:** admin CÓ trường Giá bán tùy chọn và trường Trạng thái kho (Còn hàng / Hết hàng / Liên hệ). Giá chỉ hiện trên web công khai khi có giá thật; để trống thì web ghi "Liên hệ tư vấn", không tự suy giá từ tên. Trạng thái kho không phải là số lượng tồn, không trừ cộng số lượng khi bán.
5. **Watermark giữ nguyên.** Ảnh sản phẩm có watermark hồng "tonphuc.com" là chủ shop muốn giữ. Admin không được bỏ, thu nhỏ hay dời watermark; khi upload ảnh mới, ảnh gốc vẫn giữ watermark nếu shop đã gắn sẵn.
6. **Mọi thay đổi đều có thể quay lại.** Xóa vào thùng rác 30 ngày mới xóa hẳn; sửa bài/sản phẩm giữ lại bản trước; xuất dữ liệu ra file bất cứ lúc nào để không bao giờ bị kẹt như admin cũ.
7. **Admin không được index.** `/admin` và mọi trang con luôn `noindex/nofollow`, không vào sitemap, không hiện nút gọi/Zalo nổi che form.

## 3. Tài khoản và đăng nhập

- **Đăng nhập:** email + mật khẩu. Sai thì báo chung chung "Email hoặc mật khẩu chưa đúng", không báo riêng email có tồn tại hay không.
- **Quên mật khẩu:** gửi link đặt lại qua email đã đăng ký (dùng Supabase Auth). Đặt lại xong phải đăng nhập lại.
- **Đổi mật khẩu:** trong mục Tài khoản của chính mình, nhập mật khẩu hiện tại + mật khẩu mới 2 lần, mật khẩu mới tối thiểu 8 ký tự.
- **Phiên đăng nhập:** đăng nhập rồi thì lần sau vào lại không cần đăng nhập lại trong cùng trình duyệt; nút Đăng xuất luôn thấy ở đầu trang admin.
- **Tạo tài khoản mới:** KHÔNG làm trong giao diện admin (giữ như hiện tại: chỉ tạo trong Supabase Dashboard và gán `app_metadata.role = admin`). Lý do: tránh việc tài khoản admin tự tạo thêm tài khoản admin khác mà không qua người quản lý website. Đặc tả này ghi rõ để Codex không tự thêm chức năng tạo tài khoản vào admin.
- **Bảo mật:** mọi thao tác ghi đều qua RLS như schema hiện tại: chỉ tài khoản có role admin mới ghi được; khách và tài khoản thường bị chặn ở database, không chỉ chặn ở giao diện. Không ghi mật khẩu, token hay secret vào code, log hay tài liệu.

## 4. Tổng quan (Dashboard) — trang đầu tiên sau khi đăng nhập

- Hiện số lượng thật, bấm vào là sang đúng danh sách đó: tổng sản phẩm, tổng bài viết, số bài nháp, số sản phẩm/bài thiếu ảnh, số danh mục.
- Hiện 10 mục mới sửa gần nhất (sản phẩm + bài viết), mỗi dòng có tên, loại, thời gian sửa, nút Sửa.
- Hiện cảnh báo cần xử lý: bài/sản phẩm thiếu ảnh bìa, thiếu mô tả, slug trùng, danh mục trống (không có sản phẩm/bài nào).
- Nút nhanh: Thêm sản phẩm, Thêm bài viết, Thêm banner, Xem web công khai (mở tab mới).

## 5. Quản lý sản phẩm (module lớn nhất, hiện chưa có)

### 5.1. Danh sách sản phẩm
- Bảng gồm: ảnh nhỏ, tên sản phẩm, danh mục cấp 1 + cấp 2, trạng thái (Hiển thị / Ẩn), Nổi bật (có/không), ngày cập nhật.
- Tìm theo tên (không dấu như web công khai), lọc theo danh mục cấp 1, cấp 2, trạng thái, nổi bật. Phân trang 20 mục/trang, ghi rõ "Trang X / Y, tổng Z sản phẩm".
- Sắp xếp: mới cập nhật nhất lên đầu mặc định; cho phép sắp theo tên A–Z.
- Thao tác từng dòng: Sửa, Ẩn/Hiện nhanh, Đưa vào thùng rác. Không xóa hẳn ngay từ danh sách.
- Nút: Thêm sản phẩm, Xuất toàn bộ sản phẩm ra file (CSV + JSON, xem mục 12).

### 5.2. Thêm / sửa sản phẩm
- Trường bắt buộc: tên sản phẩm, slug (tự sinh từ tên, sửa được tay, báo trùng slug ngay khi gõ), danh mục cấp 1, danh mục cấp 2 (chọn theo cấp 1 đã chọn).
- Trường mô tả: mô tả ngắn (hiện ở thẻ sản phẩm), nội dung chi tiết dạng khối: đoạn văn, ảnh, bảng thông số (giữ đúng cấu trúc khối hiện có của catalog: đoạn văn / ảnh / bảng — không ép tất cả thành một ô textarea dài).
- Ảnh: ảnh chính + nhiều ảnh phụ, upload từng ảnh hoặc kéo thả nhiều ảnh, xem trước ảnh, đặt ảnh nào là ảnh chính, xóa ảnh khỏi sản phẩm (ảnh gốc trong kho ảnh vẫn giữ cho tới khi xóa ở thư viện, xem mục 10). Mỗi ảnh có ô chú thích (alt) để đọc được khi ảnh lỗi.
- Mã, thương hiệu, xuất xứ, trạng thái kho, giá (quyết định mới, mục 4 trong danh sách chọn 03/11): Mã sản phẩm (tùy chọn, chỉ ghi mã thật, không ghi "CÒN HÀNG" như admin cũ), Thương hiệu (ô riêng), Xuất xứ (ô riêng, không gộp vào Nhà sản xuất), Trạng thái kho (chọn 1 trong Còn hàng / Hết hàng / Liên hệ — thay cho việc dùng ô Mã để ghi trạng thái), Giá bán (tùy chọn, chỉ nhập khi có giá thật; để trống thì web công khai vẫn ghi "Liên hệ tư vấn", không tự suy giá từ tên). Các trường thông số khác (loại gas, trọng lượng...) nhập tự do theo từng sản phẩm, không bắt buộc, không tự điền từ tên.
- Bảng thông số có cấu trúc (quyết định mới, mục 5): giữ các khối văn bản tự do của admin cũ (Mô tả ngắn, Chức năng, Xuất xứ, Quy cách, Nội dung), cộng thêm bảng thông số dạng từng dòng Tên thông số + Giá trị để sau này lọc và so sánh được. Bảng này tùy chọn, không bắt buộc nhập đủ cho mọi sản phẩm.
- Tags: chọn nhiều tag trong thư viện tag hiện có (tổng số tag thật cần đếm lại khi nhập dữ liệu, không dùng con số 9 cũ làm chuẩn), hoặc thêm tag mới ngay trong form.
- Trạng thái: Hiển thị / Ẩn (ẩn thì khách không thấy nhưng admin vẫn thấy), Nổi bật (hiện ở trang chủ/mục nổi bật), thứ tự hiển thị trong danh mục (số càng nhỏ càng lên trước).
- SEO: tiêu đề SEO và mô tả SEO (để trống thì tự lấy từ tên + mô tả ngắn, không bịa thêm).
- Nút: Lưu nháp, Xuất bản (hiện lên web công khai), Xem trước (mở trang chi tiết ở tab mới ở chế độ xem trước, khách chưa thấy nếu đang nháp), Hủy (không lưu thay đổi).
- Kiểm tra trước khi lưu: tên trống, slug trống/trùng, chưa chọn danh mục, chưa có ảnh chính thì báo rõ từng lỗi, không lưu nửa chừng.

### 5.3. Thùng rác sản phẩm
- Sản phẩm bị xóa vào thùng rác, giữ 30 ngày, trong thời gian đó khôi phục được nguyên trạng.
- Sau 30 ngày hoặc bấm "Xóa vĩnh viễn" trong thùng rác (có xác nhận 2 lần) thì mới xóa hẳn khỏi database và hỏi có xóa ảnh kèm theo không.

## 6. Quản lý danh mục (2 cấp, dùng chung cho sản phẩm)

- Danh sách dạng cây: danh mục cấp 1, bên dưới là các danh mục cấp 2 của nó, mỗi dòng hiện tên, slug, số sản phẩm trong danh mục.
- Thêm/sửa: tên, slug (tự sinh, sửa được, báo trùng), mô tả ngắn, ảnh danh mục (upload riêng — khắc phục điểm dở của admin cũ: danh sách có cột ảnh nhưng form không có chỗ tải ảnh), thứ tự hiển thị, trạng thái Hiển thị/Ẩn.
- Xóa: chỉ xóa được danh mục trống. Danh mục còn sản phẩm thì báo rõ "Còn X sản phẩm, chuyển các sản phẩm này sang danh mục khác trước rồi mới xóa" và cho chọn danh mục đích để chuyển hàng loạt.
- Không tạo danh mục cấp 3. Giữ đúng 2 cấp như admin cũ để không làm rối điều hướng web công khai. Khi chuyển dữ liệu, dọn trùng tên R22 ở cấp 1 (quyết định mới, mục 7): hai danh mục trùng tên được gộp thành một sau khi đối chiếu sản phẩm bên trong, không mang trùng sang web mới. Vì vậy tổng số danh mục cấp 1 sau khi dọn có thể khác con số đếm ban đầu, phải đếm lại sau khi dọn.
- Danh mục của bài viết (tin tức) quản lý riêng ở mục 7, không trộn với danh mục sản phẩm.

## 7. Quản lý bài viết và tin tức (module đã có, cần mở rộng)

- Giữ toàn bộ chức năng hiện có (tạo/sửa/xóa, slug, chuyên mục, mô tả ngắn, nội dung, ảnh bìa, nháp/xuất bản) và bổ sung:
- **Danh sách:** tìm theo tiêu đề (không dấu), lọc theo chuyên mục và trạng thái (Nháp / Đã xuất bản), phân trang 20 bài/trang, sắp xếp mới nhất lên đầu.
- **Chuyên mục bài viết:** thêm/sửa/xóa giống mục 6 nhưng chỉ 1 cấp (Tin tức, và các chuyên mục khác nếu shop cần). Các mục cũ đang 0 bài (Kho lạnh, Cụm máy, Dàn lạnh) không tạo module riêng và không hiện menu rỗng trên admin mới; nếu shop muốn hiện lại thì chỉ cần tạo chuyên mục bài viết tương ứng. Danh mục "test" của Kho lạnh bị bỏ, không chuyển sang web mới.
- **Tác giả và ngày đăng (quyết định mới, mục 6):** thêm Tác giả (tùy chọn) và Ngày đăng sửa được (mặc định là ngày xuất bản, sửa được để giữ ngày gốc khi chuyển dữ liệu, không tự ghi ngày "01 Jan" giả).
- **Nội dung:** ngoài ô văn bản thuần hiện tại, cho phép thêm khối ảnh và khối tiêu đề nhỏ trong bài, để bài dài không thành một khối chữ đặc. Không bắt buộc dùng trình soạn thảo phức tạp — khối đoạn văn + ảnh + tiêu đề là đủ.
- **Ảnh bìa:** chọn từ thư viện ảnh (mục 10) hoặc upload mới, ghi chú thích ảnh, xem trước ảnh.
- **SEO và ngày đăng:** tiêu đề SEO, mô tả SEO, ngày đăng (mặc định là ngày xuất bản, sửa được để giữ ngày gốc khi chuyển dữ liệu, không tự ghi ngày "01 Jan" giả).
- **Xem trước và thùng rác:** giống sản phẩm (xem trước ở tab mới, xóa vào thùng rác 30 ngày, khôi phục được).
- **Không có bình luận, không có duyệt bài nhiều cấp.** Đăng là hiện ngay khi bấm Xuất bản.

## 8. Quản lý trang tĩnh: Giới thiệu, Liên hệ, Footer

Mỗi trang là một biểu mẫu đơn (đúng dạng của admin cũ), gồm:
- **Giới thiệu:** tiêu đề, nội dung dạng khối (đoạn văn + ảnh, chia đoạn bằng tiêu đề nhỏ để người đọc lướt được, không để một khối văn dài), ảnh cửa hàng.
- **Liên hệ (quyết định mới, mục 9):** trang này chỉ chứa phần văn bản giới thiệu và link Google Maps / nút "Xem chỉ đường". Tên công ty, địa chỉ, hotline, số Zalo, số điện thoại bàn, email, giờ mở cửa lấy tự động từ Thông tin công ty (mục 11) làm nguồn duy nhất, không nhập lại ở đây, tránh ba nơi ghi khác nhau như admin cũ. Các số phải ghi rõ số nào để gọi, số nào để nhắn Zalo, tránh khách bấm nhầm.
- **Footer:** đoạn giới thiệu ngắn (không cắt cụt câu), các nhóm link (Khám phá, Sản phẩm, Thông tin liên hệ), bản quyền.
- Mỗi trang có nút Lưu, Xem trước, và ghi rõ thời gian sửa lần cuối. Sửa trang tĩnh không cần qua duyệt, lưu là hiện lên web công khai ngay.

## 9. Quản lý banner trang chủ (Slider) và các ảnh đơn của hệ thống

- Danh sách slider hiện tại (trang 1 có 10 dòng, tổng 2 trang): mỗi slider có tên, link, mô tả, thứ tự, trạng thái Hiển thị, ảnh 1366x576. Không có trường SEO, ngày bắt đầu/kết thúc.
- Ngoài slider, admin cũ có 6 mục "cập nhật 1 ảnh" riêng, không có tên/link/thứ tự: Con dấu (600x461, chỉ .png), logo (180x130), logo footer (không ghi kích thước cố định), Banner mobile (750x138), background banner (900x500, đang tắt hiển thị), background thông tin footer (483x406 + ô Màu nền footer). Admin mới phải giữ đủ 6 mục ảnh đơn này, không gộp chúng vào slider.
- Không có mục riêng Banner top, Banner left, Đối tác hay Hỗ trợ trực tuyến trong admin cũ — đừng tạo các mục đó theo tên gọi cũ. Favicon nằm trong Thông tin công ty (mục 11), không nằm trong nhóm Banner.
- Thêm/sửa slider (đoạn này là đoạn duy nhất quy định form slider, thay cho hai đoạn lặp trước đó): upload ảnh hoặc chọn từ thư viện, nhập các trường theo thứ tự — Tiêu đề, Mô tả (chú thích), Link đích, **Chữ trên nút (tùy chọn, sửa riêng được; để trống thì mặc định là "Xem ngay")**, Thứ tự hiển thị, Trạng thái Bật/Tắt. Tắt slider thì slider trang chủ tự bỏ qua, không hiện khung trống. Kéo thả đổi thứ tự hoặc nhập số thứ tự đều được, kết quả cuối cùng là số thứ tự.
- Lưu ý về chữ trên nút: slider cũ không có trường chữ trên nút riêng, web mới hiện đang hiển thị cố định chữ "Xem ngay" cho mọi slide. Làm trường này thành tùy chọn với giá trị mặc định "Xem ngay" nên 5 banner hiện có hiển thị không đổi, đồng thời shop có thể đổi riêng cho từng slide sau này (ví dụ "Gọi ngay") mà không cần sửa code.
- Cài đặt chung của slider (giữ đơn giản, không cần admin sửa thường xuyên): thời gian tự chuyển (mặc định 6 giây), bật/tắt tự chuyển. Nếu Codex làm thì để trong cùng trang banner, không tách trang cài đặt riêng.
- Ảnh banner phải đủ rộng cho desktop và không bị cắt chữ quan trọng trên mobile — khi lưu, hiện cảnh báo nếu ảnh quá nhỏ.

## 10. Thư viện ảnh (mới, thay cho việc upload rời rạc)

- Một trang duy nhất liệt kê toàn bộ ảnh đã upload lên Supabase Storage (bucket `images`, quyết định chốt 03/11/2026): ảnh nhỏ, tên file, ngày upload, dùng ở sản phẩm/bài/banner nào (bấm vào là sang đúng mục đó). Không lưu ảnh mới vào thư mục public của repo.
- Upload nhiều ảnh cùng lúc, tìm theo tên file, lọc ảnh chưa dùng ở đâu.
- Xóa ảnh: chỉ xóa được ảnh chưa dùng ở đâu; ảnh đang dùng thì báo rõ đang dùng ở mục nào và chặn xóa, tránh làm web công khai hiện khung trống.
- Không có chức năng sửa ảnh (cắt, xoay, gắn watermark) trong admin — ảnh xử lý trước khi upload. Watermark của shop giữ nguyên trong ảnh gốc.

## 11. Thông tin công ty, liên kết và Tags

- **Thông tin công ty:** tên công ty đầy đủ, mã số thuế, địa chỉ, hotline, Zalo, điện thoại bàn, email, giờ mở cửa. Đây là nguồn duy nhất cho header, footer, trang liên hệ và dữ liệu LocalBusiness — sửa ở đây là đổi khắp web, không phải sửa từng trang.
- **Liên kết website (thực chất là mạng xã hội):** danh sách đã thấy có Facebook, Tik Tok, Zalo, Youtube, Messenger, Twitter, Instagram, Google, Pinterest — mỗi link có tên, địa chỉ, thứ tự, trạng thái Hiển thị, icon. Thêm/sửa/xóa, không có trường "mở tab mới" hay vị trí hiển thị riêng trong admin cũ. Lưu ý: lần kiểm tra đầu (02/11) ghi 2 liên kết, lần khám kỹ (03/11) thấy 9 dòng — lấy 9 dòng làm chuẩn tạm thời và đối chiếu lại khi nhập dữ liệu.
- **Tags sản phẩm:** lần kiểm tra đầu ghi 9 tag, lần khám kỹ thấy danh sách tags phân trang 3 trang, trang 1 đã có 20 dòng — tổng số tag thật nhiều hơn 9, cần đếm lại khi nhập dữ liệu, không dùng con số 9 làm chuẩn. Form tag cũ chỉ có tên, link, Title/Keywords/Description, thứ tự, Hiển thị; không có mô tả dài hay ảnh. Thêm/sửa/xóa tag, mỗi tag hiện số sản phẩm đang dùng. Xóa tag thì tag chỉ bị gỡ khỏi các sản phẩm đó, không xóa sản phẩm.

## 12. Xuất, nhập, sao lưu và nhật ký (bắt buộc, rút kinh nghiệm từ admin cũ)

- **Xuất dữ liệu:** xuất toàn bộ sản phẩm, bài viết, danh mục ra file CSV và JSON bất cứ lúc nào, không cần nhờ bên thứ ba. File xuất phải gồm đủ trường (tên, slug, danh mục, ảnh, mô tả, trạng thái, ngày) để nhập lại được.
- **Nhập dữ liệu:** nhập từ file CSV/JSON theo mẫu do admin cung cấp (tải mẫu về trước). Khi nhập, báo rõ từng dòng lỗi (trùng slug, thiếu tên, thiếu danh mục) và không nhập nửa chừng: dòng nào lỗi thì dừng cả file hoặc bỏ qua dòng lỗi theo lựa chọn của người nhập, ghi rõ trong báo cáo sau nhập.
- **Nhật ký thay đổi:** ghi lại ai (tài khoản nào), làm gì (thêm/sửa/xóa/xuất bản/ẩn), với mục nào, lúc nào. Chỉ xem, không sửa, không xóa nhật ký.
- **Sao lưu:** nút tải bản sao lưu dữ liệu (dạng file xuất đầy đủ) trước mỗi đợt thay đổi lớn. Không tự động xóa dữ liệu cũ khi nhập dữ liệu mới.

## 13. SEO và chuyển hướng (Redirect)

- **SEO chung:** tiêu đề SEO trang chủ, mô tả SEO trang chủ, mã xác minh Google/Bing (nhập mã, không tự xác minh).
- **Bảng chuyển hướng:** danh sách URL cũ → URL mới, thêm/sửa/xóa từng dòng, kiểm tra URL cũ đã có trong bảng chưa. Đây là bảng sẽ dùng khi trỏ DNS từ tonphuc.com sang web mới — phải làm xong trước ngày lên sóng.
- **Kiểm tra link:** báo các slug trùng, các trang công khai bị thiếu ảnh hoặc thiếu mô tả SEO. Không tự sửa link, chỉ báo để admin sửa.

## 14. Những việc KHÔNG làm trong admin mới

- Không có giỏ hàng, đơn hàng, thanh toán, quản lý số lượng tồn kho, khuyến mãi/mã giảm giá, vận chuyển. **Trường Giá bán tùy chọn và Trạng thái kho thì CÓ, theo quyết định mới ở mục 5.2 và 16** — câu cũ "không có giá bán" trong mục này đã bị thay thế bởi quyết định mới và không còn hiệu lực.
- Không có phân quyền nhiều vai trò, không có duyệt bài, không có bình luận.
- Không có thống kê truy cập phức tạp, không có gửi email marketing.
- Không có quản lý ngôn ngữ tiếng Anh trong đợt này: admin và nội dung đều tiếng Việt trước; khi nào bản dịch tiếng Anh được duyệt thì mới thêm quản lý bản dịch (theo quyết định đã chốt trong `docs/product.md`).
- Không tự động đăng bài lên Facebook/Zalo.

## 15. Tiêu chí nghiệm thu (Codex phải tự kiểm trước khi bàn giao)

1. Đăng nhập bằng tài khoản admin thật, đổi mật khẩu, quên mật khẩu, đăng xuất — đều chạy được.
2. Thêm/sửa/ẩn/xóa (vào thùng rác)/khôi phục 1 sản phẩm và 1 bài viết mẫu, kiểm tra web công khai hiện đúng trạng thái tương ứng.
3. Thêm/sửa/xóa 1 danh mục cấp 1 và 1 danh mục cấp 2, thử xóa danh mục còn sản phẩm và kiểm tra thông báo chặn + chuyển hàng loạt.
4. Thêm/sửa/tắt 1 banner, kiểm tra slider trang chủ không hiện khung trống.
5. Sửa thông tin công ty 1 lần, kiểm tra header, footer và trang liên hệ đổi theo.
6. Upload ảnh, dùng lại ảnh từ thư viện, thử xóa ảnh đang dùng và kiểm tra bị chặn.
7. Xuất sản phẩm/bài ra CSV và JSON, nhập lại file mẫu và kiểm tra báo cáo lỗi từng dòng.
8. Chạy `tsc --noEmit` và `npm run build` đạt; kiểm tra admin ở desktop 1440px và mobile 360px, chữ không nhỏ hơn chuẩn ở mục 2, nút bấm tối thiểu 44px, không tràn ngang.
9. Báo cáo bàn giao gồm: danh sách file sửa, kết quả từng mục nghiệm thu, những mục chưa làm (nếu có) và lý do.

## 16. Quyết định đã chốt 03/11/2026 (Chiến chọn "mới" cho cả 10 mục)

Chiến đã chọn đề xuất mới cho toàn bộ 10 mục dở đã rà từ admin cũ. Các mục dưới đây đã được đưa vào các mục tương ứng trong đặc tả, không còn là câu hỏi mở:
1. Xóa vào thùng rác 30 ngày + nhật ký (mục 5.3, 12).
2. Xuất CSV/JSON bất cứ lúc nào (mục 12).
3. Thư viện ảnh chung + ảnh danh mục + cảnh báo ảnh thiếu (mục 6, 10).
4. Tách Mã SKU / Thương hiệu / Xuất xứ / Trạng thái kho / Giá chỉ khi có giá thật (mục 5.2).
5. Bảng thông số có cấu trúc cộng thêm vào khối văn bản tự do (mục 5.2).
6. Tin tức có danh mục, tác giả tùy chọn, ngày đăng sửa được (mục 7).
7. Dọn trùng R22, chặn xóa danh mục còn sản phẩm + chuyển hàng loạt (mục 6).
8. Slider riêng + trang ảnh hệ thống cho 6 ảnh đơn, có ghi kích thước (mục 9).
9. Thông tin công ty là nguồn duy nhất, trang Liên hệ không nhập lại số (mục 8, 11).
10. Quên mật khẩu, đổi mật khẩu có kiểm tra mật khẩu hiện tại, nhật ký thay đổi, ẩn/bỏ module rỗng và danh mục test, dashboard hiện số thật + mục thiếu ảnh + mục mới sửa (mục 3, 4).

Quyết định đã chốt thêm 03/11/2026: **ảnh lưu ở Supabase Storage** (không lưu ở thư mục public của repo). Toàn bộ ảnh mới — ảnh sản phẩm, ảnh bìa bài viết, ảnh banner, ảnh hệ thống, logo, favicon — đều upload lên Supabase Storage, dùng chung bucket `images` đã có cho ảnh bìa bài viết (đọc công khai, chỉ tài khoản admin mới upload/xóa, theo đúng RLS hiện tại). Ảnh sản phẩm/banner hiện đang nằm local trong repo sẽ được chuyển lên Supabase Storage khi nhập dữ liệu, giữ nguyên watermark. Thư viện ảnh (mục 10) quản lý chính các file trong bucket này, không quản lý file local trong repo.

Quyết định còn mở, không thuộc 10 mục trên:
- Tổng số danh mục cấp 1 và tổng số tag sau khi dọn trùng cần đếm lại khi nhập dữ liệu, không dùng con số 8 và 9 cũ làm chuẩn.
- Các quy tắc chốt thêm theo câu hỏi của Codex (giá/trạng thái kho, chữ trên nút slider, lưu nháp, sao lưu, bảo toàn SEO): xem mục 18, mục này có độ ưu tiên cao hơn các câu cũ trái ngược trong đặc tả.

## 17. Phụ lục — Bảng đối chiếu trường thật của admin cũ (khám kỹ chỉ đọc, 03/11/2026, 15:31–15:37 +07)

Khám bằng tài khoản đã lưu, chỉ mở form để đọc nhãn, không bấm Hoàn tất, không lưu, không tạo/sửa/xóa gì trên web cũ. Mẫu form chung: tiêu đề "Nhập dữ liệu", 2 tab "Tiếng Việt" và "Thông tin chung", nút "HOÀN TẤT" và link "THOÁT". Các ô soạn thảo dài dùng CKEditor. Nhãn "Tên bài viết" dùng chung cho cả danh mục, bài viết, tag — admin mới phải chuẩn hóa nhãn theo từng loại, không sao chép nguyên nhãn chung này. Trên giao diện cũ không thấy dấu bắt buộc nào, nên đặc tả mới tự quy định trường bắt buộc, không suy ra từ site cũ.

### 17.1. Form sản phẩm (mẫu: GAS LẠNH R32)
- Tab Tiếng Việt, theo thứ tự: Tên sản phẩm → Link Url → Mô tả ngắn (CKEditor) → Chức năng (CKEditor) → Xuất xứ (CKEditor) → Quy cách (CKEditor) → Nội dung (CKEditor) → Title → Keywords → Description (ghi chú tốt nhất 68–170 ký tự) → Schema Json (kèm nút tạo mã tự động, cảnh báo không nhập nếu không biết Data Structure).
- Tab Thông tin chung: Danh mục 1 → Danh mục 2 → Mã sản phẩm → Nhà sản xuất → Giá bán → Số thứ tự → Hiển thị (checkbox) → Nổi bật (checkbox) → Tải hình ảnh → Hình ảnh khác (có nút Thêm) → Tags (chọn nhiều).
- Danh sách sản phẩm: tìm theo từ khóa, lọc Danh mục 1 và Danh mục 2, 20 dòng/trang, tới trang 13. Cột: STT, chọn, Tên, Danh mục 1, Danh mục 2, Hình ảnh, Giá bán, Lượt xem, Hiển thị, Nổi bật, Sửa, Xóa. Chỉ có thao tác hàng loạt là chọn nhiều + Xóa tất cả, không có ẩn/hiện hay xuất hàng loạt.
- **Dữ liệu bẩn đã thấy, phải làm sạch khi chuyển:** trường Mã sản phẩm của mẫu đang ghi "CÒN HÀNG" (dùng như trạng thái, không phải mã SKU); trường Nhà sản xuất đang ghi "Ấn Độ" (dùng như xuất xứ, không tách riêng); ô Giá bán của mẫu chứa giá trị trông như số điện thoại, không kết luận đó là giá thật.
- **Không có trong admin cũ:** số lượng tồn kho dạng số, thương hiệu riêng, xuất xứ riêng tách khỏi Nhà sản xuất, bảng thông số kỹ thuật có cấu trúc, giá cũ/giá khuyến mãi, trọng lượng/kích thước/bảo hành dạng ô riêng. Nếu admin mới cần các trường này thì phải xây mới, không có mẫu từ site cũ.

### 17.2. Danh mục sản phẩm
- Cấp 1: tìm theo từ khóa, cột STT, chọn, Tên, Hình ảnh, Lượt xem, Hiển thị, Nổi bật, Sửa, Xóa. Form: Tên, Link Url, Mô tả ngắn, Nội dung, Title, Keywords, Description, Schema Json; tab chung: Số thứ tự, Hiển thị, Nổi bật. **Không thấy ô tải ảnh riêng trong form dù danh sách có cột Hình ảnh** — admin mới phải quy định rõ trường ảnh danh mục.
- Cấp 2: thêm lọc theo Danh mục 1, cột thêm Danh mục cha. Form giống cấp 1, thêm dropdown chọn Danh mục cha.
- **Lệch số lượng cần đối chiếu lại:** lần kiểm tra đầu ghi 8 danh mục cấp 1, lần khám kỹ liệt kê 9 tên trong đó R22 lặp 2 lần (GAS LẠNH, R22, R32, R404A, R410A, R134A, R22, R507, R600A). Danh mục cấp 2 vẫn khớp 19 dòng trên 1 trang.

### 17.3. Tin tức và các nhóm bài viết khác
- Tin tức: tìm theo từ khóa, 20 dòng/trang, 2 trang. Cột: STT, chọn, Tên, Hình ảnh, Ngày tạo (dd/mm/yyyy), Lượt xem, Hiển thị, Nổi bật, Sửa, Xóa. Form: Tên, Link Url, Mô tả ngắn, Nội dung, Title, Keywords, Description, Schema Json; tab chung: Số thứ tự, Hiển thị, Nổi bật, Tải hình ảnh, Hình ảnh khác. **Không có tác giả, ngày đăng sửa tay, danh mục tin, bình luận**; ngày tạo là ngày hệ thống.
- Kho lạnh, Cụm máy dàn ngưng, Dàn lạnh công nghiệp: danh sách bài đều trống (0 dòng) nên không mở được form sửa, không suy đoán form của chúng giống form Tin tức. Kho lạnh có 1 danh mục tên "test" (không mở form của dòng test vì không phải nội dung thật).

### 17.4. Trang tĩnh, công ty, SEO, tài khoản
- Giới thiệu: Tiêu đề, Nội dung, Title, Keywords, Description, Schema Json; tab chung: Tải hình ảnh, Hiển thị.
- Liên hệ: giống Giới thiệu, ảnh hiện tại đang trống. **Không có ô địa chỉ/điện thoại/email riêng** — thông tin liên hệ nằm trong khối Nội dung và trong Thông tin công ty.
- Footer: chỉ có tab Tiếng Việt (Tiêu đề, Nội dung, Title, Keywords, Description, Schema Json), không có tab chung, không có ô ảnh hay checkbox Hiển thị.
- Thông tin công ty (1 trang, không chia tab): Tên công ty → Địa chỉ → Điện thoại → Hotline → Email → Website → Mã số thuế → Favicon (file .ico). Đây là nơi duy nhất có Favicon; logo không nằm ở đây.
- SEO trang chủ: Title, Keywords, Description; tab chung: Tải hình ảnh (ảnh chia sẻ), Hiển thị. Không có ô tên miền, robots, sitemap hay mã nhúng.
- SEO website: là danh sách 5 dòng (Sản phẩm, Kho lạnh, Cụm máy dàn ngưng, Dàn lạnh công nghiệp, Tin tức), form mẫu của dòng Sản phẩm: Tên, Mô tả ngắn, Title, Keywords, Description, Schema Json; tab chung: Số thứ tự, Hiển thị, Nổi bật, Tải hình ảnh. 4 dòng còn lại chưa mở form riêng.
- Tài khoản: không phải danh sách mà là form sửa duy nhất tài khoản đang đăng nhập: Username, Password, Nhập lại Password, Họ tên, Email, Điện thoại, Địa chỉ. Không có quản lý nhiều tài khoản, phân quyền hay nhật ký đăng nhập.

### 17.5. Những gì đã kiểm tra lại và vẫn không có
- Không có nút xuất/download ở bất kỳ danh sách nào, đã kiểm tra lại riêng danh sách Sản phẩm và Tin tức.
- Không có giỏ hàng/đơn hàng, khách hàng, bình luận/đánh giá, nhiều tài khoản/phân quyền, tồn kho số lượng, khuyến mãi/mã giảm giá, vận chuyển/thanh toán.
- Không mở được form sửa của: Quảng cáo (danh sách trống), Kho lạnh, Cụm máy, Dàn lạnh (danh sách trống) — vì không bấm "Thêm" trong phạm vi chỉ đọc. Chưa mở form riêng của: dòng "test" của Kho lạnh, 4/5 dòng SEO website còn lại, các slider ngoài mẫu đã mở, các liên kết ngoài mẫu Facebook.
- Nhiều mục ảnh đơn trong nhóm Banner ghi NO PHOTO trong form nhưng checkbox Hiển thị vẫn đang tick (trừ background banner đang không tick) — khi chuyển dữ liệu, cần đối chiếu ảnh thật trên web công khai, không kết luận chỉ từ trạng thái form.

## 18. Quy tắc chốt thêm theo câu hỏi của Codex (03/11/2026) — ưu tiên hơn các câu cũ trái ngược

### 18.1. Ngoại lệ lưu nháp thiếu ảnh/danh mục
- **Lưu nháp:** chỉ cần có Tiêu đề là lưu được nháp. Nháp được phép thiếu ảnh chính và thiếu danh mục, nhưng form phải hiện cảnh báo rõ từng mục thiếu, và danh sách phải gắn nhãn "Thiếu ảnh" / "Thiếu danh mục" cho mục đó.
- **Xuất bản:** bị chặn cho tới khi đủ điều kiện, nút Xuất bản hiện lý do chặn cụ thể, không cho bấm qua:
  - Sản phẩm xuất bản cần: Tiêu đề, Slug không trùng, Danh mục cấp 1, Ảnh chính.
  - Bài viết xuất bản cần: Tiêu đề, Slug không trùng, Ảnh bìa. Danh mục bài viết là khuyến nghị, không chặn xuất bản nếu thiếu (vì tin tức cũ vốn không có danh mục).
- **Trang tĩnh và ảnh hệ thống:** không có chế độ nháp riêng — Lưu là hiện lên web công khai ngay (theo mục 8). Ảnh của trang tĩnh và ảnh hệ thống là tùy chọn, thiếu ảnh thì hiện cảnh báo nhưng không chặn lưu; riêng slider tắt hiển thị thì không hiện khung trống.

### 18.2. Bản sao lưu bao gồm file ảnh hay chỉ đường dẫn?
Phân biệt rõ hai chức năng, không dùng chung một tên:
- **Xuất dữ liệu (nhẹ):** file CSV và JSON, chỉ chứa đường dẫn/URL ảnh, không chứa file ảnh. Dùng để chuyển dữ liệu nhanh, đối chiếu, hoặc nhập lại khi ảnh vẫn còn trong Supabase Storage.
- **Sao lưu đầy đủ:** 1 file ZIP gồm: dữ liệu đầy đủ dạng JSON (toàn bộ sản phẩm, bài viết, danh mục, trang tĩnh, banner, thông tin công ty, SEO, bảng redirect), toàn bộ file ảnh trong Supabase Storage đang được các bản ghi tham chiếu, và 1 file manifest ghi rõ ảnh nào thuộc bản ghi nào (đường dẫn cũ → tên file trong ZIP). Khi khôi phục, dữ liệu được nhập lại trước, ảnh được upload lại lên Storage, đường dẫn được nối lại theo manifest.
- Nếu chỉ có bản sao lưu dạng đường dẫn mà bucket ảnh đã bị xóa thì không khôi phục được ảnh — vì vậy trước mỗi đợt thay đổi lớn, phải tải bản Sao lưu đầy đủ, không chỉ Xuất dữ liệu.

### 18.3. Bảo toàn trường SEO của admin cũ trong mô hình mới
Yêu cầu "giữ đủ trường admin cũ" được cụ thể hóa thành bảng đối chiếu sau. Không được bỏ trường nào trong bảng này khi làm database mới, kể cả khi công cụ tìm kiếm hiện đại ít dùng tới nó — đây là dữ liệu của shop, giữ nguyên văn.
- **Áp dụng cho mọi loại có khối SEO trong admin cũ (sản phẩm, bài viết, danh mục cấp 1, danh mục cấp 2, trang tĩnh Giới thiệu/Liên hệ/Footer, dòng SEO website):** mỗi bản ghi có đủ 4 trường: `seo_title` (Title), `seo_keywords` (Keywords, giữ nguyên văn dạng chuỗi phân tách bằng dấu phẩy, render thành thẻ meta keywords, để trống thì thẻ đó trống, không tự sinh từ khóa), `seo_description` (Description), `schema_json` (Schema Json).
- **Description 68–170 ký tự:** đây là gợi ý của admin cũ, không phải luật chặn cứng. Khi lưu, hệ thống chỉ cảnh báo "Ngắn hơn 68 ký tự" hoặc "Dài hơn 170 ký tự", vẫn cho lưu cả nháp và xuất bản. Không tự cắt ngắn mô tả để ép vào giới hạn.
- **Schema Json:** lưu dạng text, khi lưu phải kiểm tra là JSON hợp lệ; JSON không hợp lệ thì chặn lưu và báo lỗi rõ (không lưu bản ghi lỗi). Khi hiển thị công khai, nếu `schema_json` hợp lệ thì render nguyên văn trong thẻ `<script type="application/ld+json">`. Nếu schema tự nhập có cùng `@type` với schema tự sinh của hệ thống (ví dụ Product, Article, LocalBusiness) thì schema tự nhập được ưu tiên cho `@type` đó và schema tự sinh cho `@type` đó bị ẩn đi, tránh trùng lặp cùng một loại. Nút "Tạo mã tự động" (như admin cũ) sinh schema từ tiêu đề, mô tả, ảnh, thương hiệu và xuất xứ rồi điền vào ô để người dùng sửa trước khi lưu; nút này không bao giờ tự ghi đè lên schema đã có mà không hỏi.
- **Danh mục:** danh mục cấp 1 và cấp 2 đều có đủ bộ SEO trên, cộng thêm trường Ảnh danh mục mới (admin cũ không có ô tải ảnh danh mục, nên ảnh này ban đầu để trống).
- **Trang tĩnh:** Giới thiệu, Liên hệ, Footer mỗi trang có đủ bộ SEO trên.
- **SEO website (5 dòng cũ):** chuyển thành Cài đặt SEO theo chuyên mục trong admin mới: mỗi chuyên mục chính (Sản phẩm, Tin tức, và các chuyên mục còn lại nếu còn tồn tại) có 1 dòng gồm Tên, Mô tả ngắn, `seo_title`, `seo_keywords`, `seo_description`, `schema_json`, Ảnh chia sẻ, Thứ tự, Hiển thị. Dòng của chuyên mục đã ẩn/bỏ vẫn giữ lại nhưng gắn nhãn Ẩn, không xóa.
- **SEO trang chủ:** giữ riêng 1 dòng gồm `seo_title`, `seo_keywords`, `seo_description`, Ảnh chia sẻ (mục 13).
- **Không có bộ SEO trong admin cũ thì không thêm:** slider, liên kết mạng xã hội, ảnh hệ thống đơn và thông tin công ty không có bộ SEO đầy đủ trong admin cũ, nên mô hình mới không thêm Title/Keywords/Description/Schema cho các loại này — chỉ có chú thích ảnh (alt) cho ảnh, và tên/link cho slider và liên kết.
