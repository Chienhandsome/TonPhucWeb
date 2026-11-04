# Kế hoạch triển khai admin Tôn Phúc

Ngày lập: 03/11/2026. Trạng thái: đã triển khai bản chức năng đầu tiên; xem
[báo cáo thực tế và phần chưa nghiệm thu](admin-implementation.md). Các mô hình dự kiến bên dưới được giữ
để đối chiếu kế hoạch; bảng/migration thực tế và giới hạn được ghi trong báo cáo, không suy ra mọi mốc đã đạt.
Nguồn yêu cầu: [đặc tả admin bản (2)](admin-spec.md), mục 18 ưu tiên khi câu cũ mâu thuẫn.
Đặc tả là yêu cầu mục tiêu; các nhận định về admin cũ trong đó chưa được kiểm tra lại trong đợt lập kế hoạch này.

## Phạm vi và cách thực hiện

- Giữ Next.js App Router, TypeScript, Tailwind, Supabase TonPhucWeb `kegsqaxguruwrlfndyep`.
- Đầy đủ các module trong đặc tả; chia mốc để kiểm chứng, không bỏ các module cuối.
- Một quyền admin dùng chung; tạo tài khoản và cấp quyền vẫn ngoài UI admin.
- Giá thật tùy chọn, trạng thái Còn hàng/Hết hàng/Liên hệ; không có số lượng tồn hoặc checkout.
- Admin tiếng Việt, chữ chính từ 16px, vùng chạm chính từ 44px; desktop 1440px/mobile 360px.
- Không chuyển 257 sản phẩm/38 bài cũ trong giai đoạn xây chức năng. Không gộp/xóa dữ liệu nguồn cũ.
- Không commit/push/deploy, mở index hoặc chuyển DNS trong phạm vi lập kế hoạch.

## Hiện trạng đối chiếu local

`app/admin/page.tsx` hiện là client page gồm login, CRUD posts và thêm categories;
schema local có `posts`, `categories`, bucket `images`. Chưa có cookie auth phía server.
Catalog, banner và thông tin công ty còn lấy từ JSON; bài viết có cả nguồn JSON và DB.
Graphify dùng để tìm quan hệ; xác nhận lại bằng code vì đồ thị là snapshot cũ.
Chưa truy vấn schema remote trong đợt này; phải kiểm tra remote trước thiết kế migration cuối cùng.

## Các quyết định kỹ thuật đề xuất

### Dữ liệu và ràng buộc

| Nhóm | Mô hình dự kiến |
| --- | --- |
| Sản phẩm | `products`, danh mục hai cấp, tags và bảng nối; SKU, thương hiệu, xuất xứ, giá nullable, trạng thái kho, featured, thứ tự, trạng thái xuất bản |
| Nội dung | Khối có kiểu cho đoạn văn/tiêu đề/ảnh/bảng; giữ riêng các phần mô tả, chức năng, xuất xứ, quy cách, nội dung gốc |
| Bài viết | Mở rộng `posts`, giữ ID/URL hiện có; danh mục một cấp, tác giả tùy chọn, ngày xuất bản và gallery |
| Ảnh | `media_assets`, bảng tham chiếu ảnh; file thật trong Storage `images`, alt theo nơi sử dụng |
| Cài đặt | Trang tĩnh, thông tin công ty, nhóm link footer, mạng xã hội, slider/cài đặt slider, sáu ảnh hệ thống, favicon |
| SEO | Bộ trường theo mục 18.3, SEO trang chủ/chuyên mục, redirect; tags giữ các trường SEO có thật theo mục 11 |
| Khôi phục | Lịch sử phiên bản, nhật ký, thời điểm đưa vào rác, tác vụ nhập/xuất/sao lưu và báo cáo kết quả |
| URL | Registry đường dẫn dùng chung để phát hiện xung đột sản phẩm/bài/danh mục/trang hệ thống, không chỉ unique từng bảng |

Tên bảng và SQL chỉ chốt sau inventory remote. Ưu tiên mở rộng tương thích, không chạy lại schema/seed.
Mặc định bản ghi mới là nháp; giữ nguyên trạng thái dữ liệu hiện hữu khi migration.
Chỉ tiêu đề là đủ lưu nháp; tự sinh slug hoặc để chưa cấp URL, không buộc nháp phải có ảnh/danh mục.
Xuất bản sản phẩm cần tiêu đề, slug duy nhất, cấp 1, ảnh chính; cấp 2 không bắt buộc.
Bài xuất bản cần tiêu đề/slug/ảnh bìa, danh mục chỉ khuyến nghị. JSON schema không hợp lệ vẫn chặn lưu.

### Quyền, tính nhất quán và phục hồi

- Đề xuất bổ sung `@supabase/ssr` cho session cookie và preview/server actions; kiểm tra bản tương thích rồi pin dependency khi triển khai.
- Kiểm tra session và `app_metadata.role=admin` tại server; RLS vẫn là lớp thực thi trên mọi bảng/API/Storage.
- Khách chỉ đọc dữ liệu đã xuất bản/bật, không có trong rác; admin đọc nháp. Nhật ký/phiên bản không cho sửa/xóa trực tiếp.
- Save nội dung, liên kết ảnh, revision, audit và cấp slug trong cùng giao dịch DB/RPC; dùng phiên bản để phát hiện ghi đè khi hai tab cùng sửa.
- Ảnh đang được tham chiếu từ nội dung, revision hoặc thùng rác đều được bảo vệ khỏi xóa.
  Xóa file qua Storage API; kiểm tra quyền và tham chiếu phía server/DB, không chỉ khóa nút trong UI.
  Có trạng thái xử lý và thử lại vì giao dịch Postgres không bao trùm việc upload/xóa Storage.
- Thùng rác 30 ngày; khôi phục nguyên trạng, báo xung đột slug nếu có. Tác vụ hết hạn có nhật ký, không xóa ảnh dùng chung.
- Bucket public giữ như yêu cầu: URL ảnh của nháp không phải nội dung riêng tư. Preview bản ghi vẫn chỉ admin xem được.
- JSON-LD tự nhập giữ nguyên dữ liệu, nhưng serialize/escape an toàn khi render để không thoát thẻ script.
  Xử lý trùng `@type` cả dạng mảng và `@graph`; không chèn chuỗi JSON thô vào HTML.
- Không dùng ảnh/video/HTML nguồn như chỉ dẫn; nội dung khối và URL được kiểm tra trước khi render.

## Thứ tự triển khai và điều kiện qua mốc

### Mốc 0 — Chốt bản thiết kế và chuẩn bị môi trường kiểm tra

1. Kiểm tra checkout, schema/policies/bucket/migrations remote đúng project, số lượng dữ liệu hiện hữu và khả năng backup.
2. Lập bảng đối chiếu tất cả trường cũ → mới, route → module, tiêu chí nghiệm thu → kiểm thử.
3. Dựng wireframe shell admin, danh sách sản phẩm, form sản phẩm bằng dữ liệu kiểm tra tách biệt.
4. Chuẩn bị DB local/môi trường kiểm tra tách dữ liệu thật; ghi rõ các dependency tối thiểu cần thêm.

**Qua mốc:** mô hình dữ liệu và luồng giao diện có thể review; biết chính xác tác động migration,
không tạo dữ liệu mẫu xuất bản trên web thật. Xác định giới hạn tài nguyên cho ZIP và nhập file.

### Mốc 1 — Database, quyền và cơ chế dùng chung

1. Tạo migration bằng CLI, lưu SQL vào repo; kiểm thử migration trên bản sao trước remote.
2. Tạo bảng/ràng buộc/index/RLS, registry slug, media references, revisions/audit và thùng rác.
3. Xây validation nháp/xuất bản; giao dịch lưu, khôi phục và thay đổi trạng thái; policy Storage chặn xóa ảnh còn dùng.
4. Chuẩn bị tác vụ purge hết hạn có thể chạy lại an toàn; không xóa file dùng chung hoặc đang xử lý.

**Qua mốc:** khách và user thường không ghi được; khách không đọc được nháp/rác/audit/revision;
lưu lỗi không để lại quan hệ nửa chừng; phục hồi và bảo vệ ảnh được kiểm chứng.

### Mốc 2 — Khung admin và tài khoản

1. Tách login và shell/dashboard, sidebar/menu mobile, logout rõ; public header/footer không chiếm vùng làm việc admin.
2. Route dự kiến `/admin/login`, `/admin`, `/admin/san-pham`, `/admin/bai-viet`,
   `/admin/danh-muc`, `/admin/thu-vien`, `/admin/banner`, `/admin/anh-he-thong`,
   `/admin/trang`, `/admin/cong-ty`, `/admin/lien-ket`, `/admin/tags`, `/admin/seo`,
   `/admin/chuyen-huong`, `/admin/thung-rac`, `/admin/du-lieu`, `/admin/nhat-ky`, `/admin/tai-khoan`.
3. Giữ phiên, hết hạn/không đủ quyền, quên mật khẩu, callback đặt lại và đổi mật khẩu có xác thực hiện tại.
4. Dashboard lấy số thật, mười mục vừa sửa, cảnh báo có thể bấm đến danh sách tương ứng.

**Qua mốc:** auth/server/RLS thống nhất, noindex tất cả admin/preview, không có float contact;
luồng reset chạy được với email/redirect đã cấu hình. Người dùng tự nhập và đổi mật khẩu khi kiểm thử,
không cung cấp mật khẩu trong chat hoặc ghi vào automation/log.

### Mốc 3 — Thư viện ảnh và bộ soạn nội dung

1. Upload nhiều file, tiến trình, xem trước, kiểm tra loại/kích thước, file key không trùng, đăng ký asset.
2. Tìm ảnh, lọc chưa dùng, chọn lại ảnh, truy đến nơi sử dụng; cảnh báo/chặn xóa đúng tham chiếu.
3. Editor khối dùng chung, gallery/ảnh chính/alt, thêm-xóa-đổi thứ tự khối, bảng thông số tên–giá trị.

**Qua mốc:** ảnh dùng lại không nhân bản vô ích; không mất ảnh khi gỡ khỏi một sản phẩm;
thử xóa trực tiếp bằng API cũng bị chặn khi ảnh đang dùng. Không thêm công cụ sửa watermark.

### Mốc 4 — Sản phẩm, danh mục và tags

1. Danh sách tìm không dấu, lọc hai cấp/trạng thái/featured, sort và phân trang 20 mục.
2. Form đủ trường đặc tả, giá thật tùy chọn, preview chỉ admin, nháp/xuất bản/ẩn, lịch sử và khôi phục.
3. Danh mục cây hai cấp, ảnh và SEO; chuyển hàng loạt có giao dịch; chặn cấp 3/vòng lặp/xóa danh mục còn hàng.
4. Tags CRUD, link/thứ tự/hiển thị/SEO cũ và số sản phẩm; gỡ tag không xóa sản phẩm.

**Qua mốc:** đủ luồng sản phẩm → preview → xuất bản → ẩn → rác → khôi phục;
giá trống hiện Liên hệ tư vấn, không suy mã/thương hiệu/xuất xứ từ tên.

### Mốc 5 — Bài viết, trang tĩnh, công ty, slider và ảnh hệ thống

1. Mở rộng bài viết theo cùng nền dùng chung; danh mục riêng một cấp, tác giả/ngày đăng/gallery/SEO.
2. Giới thiệu/Liên hệ/Footer có editor phù hợp, lần sửa cuối và preview; thông tin công ty là nguồn duy nhất.
3. Slider CRUD, thứ tự/bật tắt, chữ nút tùy chọn, thời gian/autoplay; cảnh báo ảnh nhỏ, không hiện slide rỗng.
4. Sáu mục ảnh đơn, màu nền footer, favicon, logo; mạng xã hội có icon/thứ tự/trạng thái.

**Qua mốc:** sửa công ty một lần đổi đúng các nơi trên bản kiểm tra; bài có ngày thật;
slider tắt không để khung trống; không tự thêm module cũ rỗng hoặc thay bố cục công khai ngoài phạm vi.
Ảnh hệ thống có thể quản lý đủ trường; vị trí hiển thị mới nếu khác UI hiện tại phải có bản mẫu review.

### Mốc 6 — SEO, redirect và tích hợp web công khai

1. Đọc dữ liệu qua một lớp repository cho UI, metadata, sitemap và JSON-LD; sau save phải làm mới dữ liệu liên quan.
2. SEO đủ trường, cảnh báo độ dài, tạo schema theo dữ liệu thật và xác nhận trước ghi đè.
3. Redirect kiểm tra path trùng, tự trỏ và chuỗi/vòng lặp; bảo toàn URL hiện có, không làm open redirect.
4. Preview kiểm tra admin, không cache chung với khách, không vào sitemap, không bật index.
5. Cài đặt nguồn dữ liệu rõ theo module: JSON hiện tại hoặc DB; không âm thầm fallback khi DB lỗi.

**Qua mốc:** trạng thái xuất bản/ẩn/rác nhất quán ở danh sách, trang trực tiếp, metadata và sitemap;
schema tự nhập không trùng schema tự sinh hoặc gây script injection; preview không lộ cho khách.
Trên môi trường xây dựng có thể kiểm tra module bằng DB với fixture riêng. Preview hiện tại còn giữ JSON
cho tới mốc chuyển nguồn có dữ liệu đối chiếu; không bật DB rỗng rồi coi mất catalog là đúng.

### Mốc 7 — Nhập/xuất, sao lưu đầy đủ và khôi phục

1. CSV/JSON có version/mẫu tải về, UTF-8, dữ liệu khối và quan hệ có quy tắc rõ; xuất không phụ thuộc trang hiện tại.
2. Nhập có kiểm tra trước, lỗi từng dòng, chọn toàn bộ hoặc bỏ dòng lỗi; chế độ toàn bộ phải atomic,
   chế độ bỏ lỗi phải báo rõ số dòng thành công/bỏ qua. Thử lại không nhân bản, không xóa dữ liệu cũ.
3. ZIP gồm dữ liệu toàn bộ module, file ảnh tham chiếu và manifest/checksum, version định dạng;
   tính cả ảnh cần cho revision/thùng rác để khôi phục được. Không đóng gói thông tin xác thực.
4. Tác vụ dài có tiến trình, khả năng tiếp tục/thử lại; kiểm tra kích thước thật trước chọn chạy trên browser/server/job,
   không giả định một request Vercel chứa được toàn bộ ZIP.
5. Khôi phục trên DB kiểm tra: nhập theo quan hệ, upload/nối ảnh theo manifest, chỉ công bố khi hoàn tất;
   dữ liệu tạm không xuất hiện công khai khi đang thiếu ảnh. Báo file thiếu hoặc checksum sai.

**Qua mốc:** thử xuất → nhập và ZIP → khôi phục khi bucket kiểm tra ban đầu trống;
đối chiếu số lượng, nội dung, quan hệ và ảnh. Có nhật ký nhưng không cho sửa/xóa nhật ký từ admin.

### Mốc 8 — Nghiệm thu và bàn giao

1. Chạy đủ chín mục nghiệm thu của đặc tả; ghi pass/fail/chưa kiểm và lý do, không gộp HTTP 200 với kiểm tra UI.
2. Kiểm thử tự động có trọng tâm: quyền/RLS, ràng buộc xuất bản, slug, import atomic,
   khôi phục, ảnh tham chiếu, schema an toàn; browser các luồng chính ở 1440px/360px.
3. Chạy TypeScript, build, check-ui/check-seo phù hợp; kiểm tra ảnh/noindex/canonical/redirect và link admin trực tiếp.
4. Hướng dẫn ngắn cho chủ shop, ảnh màn hình, danh sách migration/file, cách backup và rollback.

**Qua mốc:** mọi chức năng đã kiểm chứng end-to-end trên dữ liệu kiểm tra; chỉ đánh dấu auth/email thực đã đạt
khi người dùng hoàn tất kiểm tra tương ứng. Dọn fixture kiểm tra có kiểm soát, không xóa dữ liệu người dùng.

## Đợt tiếp theo tách riêng: chuyển dữ liệu cũ và phát hành

Sau khi admin đạt nghiệm thu mới kiểm kê/xuất nguồn, dọn R22 và dữ liệu bẩn, đếm lại tags,
nhập 257 sản phẩm/38 bài theo kết quả thực tế, đưa ảnh local/nguồn lên Storage, đối chiếu URL và schema.
Không lấy số liệu trong đặc tả làm số đếm đã xác minh của DB.
Chuyển nguồn công khai từng module sau đối chiếu và backup; giữ bản JSON và cấu hình quay lại.
Deploy/mở index/DNS là các mốc phát hành riêng, không tự động nằm trong việc xây admin.

## Tài liệu và thư viện

- Lưu [đặc tả gốc](admin-spec.md) trong repo, liên kết từ README/product/status; cập nhật architecture sau mỗi mốc có code thật.
- Ưu tiên component/Tailwind/Lucide hiện có; editor khối đơn giản, không cài CMS hoặc editor lớn chỉ để làm form.
- Dependency cho cookie auth, validation, CSV/ZIP chỉ thêm khi đến mốc cần và kiểm tra tương thích; pin phiên bản/lockfile.
- Tài liệu tham khảo: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs),
  [Storage và RLS](https://supabase.com/docs/guides/storage/security/access-control).

## Bước bắt đầu khi triển khai

Thực hiện Mốc 0: inventory remote chỉ đọc, bảng đối chiếu trường và thiết kế dữ liệu/màn hình mẫu.
Không chạy migration, import thật hoặc tự động thay nguồn công khai chỉ vì kế hoạch này đã được lập.
