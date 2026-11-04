# Bàn giao triển khai admin — 03/11/2026

Trạng thái: đã dựng bản chức năng và tích hợp local, **chưa nghiệm thu trọn vẹn bằng trình duyệt/tài khoản thật**.
Đối chiếu [đặc tả bản (2)](admin-spec.md), [kế hoạch](admin-plan.md).

## Đã thay đổi

| Nhóm file | Nội dung |
| --- | --- |
| `supabase/migrations/` | Bảy migration cộng thêm, đã áp dụng đúng project TonPhucWeb; giữ nguyên bảng cũ. |
| `lib/cms/config.ts` | Khai báo module, trường nhập, nháp/xuất bản, cảnh báo, slug và vị trí ảnh. |
| `lib/cms/browser.ts`, `server.ts` | Supabase cookie client; server xác thực user/role admin cho preview. |
| `components/admin/AdminApp.tsx` | Shell/sidebar/menu mobile, login, tài khoản, dashboard, danh sách/lọc/phân trang, rác và nhật ký. |
| `RecordEditor.tsx`, `BlockEditor.tsx` | Form theo module, ảnh/gallery/alt, khối nội dung, bảng thông số, SEO, lịch sử, preview và chuyển trạng thái. |
| `MediaLibrary.tsx` | Upload/chọn lại ảnh, đồng bộ ảnh đã có trong bucket, nơi dùng, chặn xóa ảnh còn tham chiếu. |
| `DataTools.tsx`, `lib/cms/transfer.ts` | CSV/JSON, báo lỗi nhập, import atomic hoặc bỏ lỗi, ZIP/manifest/checksum và khôi phục. |
| `app/admin/` | Route root/module, callback recovery, kết thúc recovery, xem trước và CSS riêng. |
| `lib/cms/public.ts`, `site.ts`, `metadata.ts`, `validation.ts` | Đọc công khai, nguồn công ty chung, SEO/URL/schema; lỗi DB không bị che bằng snapshot. |
| `lib/catalog.ts`, các trang public, `sitemap.ts` | Ghép bản ghi CMS đã xuất bản vào catalog/bài, trang trực tiếp và sitemap. |
| `SiteInfoProvider.tsx`, `PublicChrome.tsx`, header/footer/ContactBand/float/banner | Thông tin công ty chung, cấu hình banner, ẩn public chrome ở admin. |
| `middleware.ts` | Redirect nội bộ từ DB, kiểm tra URL; header đường dẫn cho xử lý schema theo trang. Giữ Next 14 middleware.ts. |
| `package.json`, lockfile | Pin `@supabase/ssr` 0.12.7, JSZip 3.10.2, PapaParse 5.7.0 và bản Supabase JS 2.118.0 vốn đã có trong lockfile; công cụ dữ liệu tải riêng khi mở module. |
| `tests/cms.test.mjs`, `scripts/check-admin.mjs`, `supabase/tests/` | Kiểm tra quy tắc, CSV, quyền, giao dịch và hồi quy route. |

### Mô hình thực tế

Dùng `cms_records` với `kind`, cột trạng thái/slug/version/timestamps chung và `data` JSONB có kiểm tra theo loại.
Các bảng `cms_routes`, `cms_revisions`, `cms_audit`, `cms_media` dùng chung cho toàn CMS.
Đây là lựa chọn triển khai thay cho một bảng riêng cho từng module được nêu dự kiến trong kế hoạch;
quan hệ danh mục/tag được kiểm tra ở RPC trong transaction, không dựa vào form. Không cho ghi trực tiếp qua Data API.
Index có trên kind/thời gian, quan hệ danh mục/cha/con/tag, redirect và actor.

RPC ghi kiểm tra `auth.uid()` và `app_metadata.role=admin`, khóa giao dịch cho tài nguyên dùng chung,
kiểm tra phiên bản chống ghi đè; tạo revision/audit cùng lần lưu. Khách/user thường không đọc được nháp, rác,
revision hoặc audit, không ghi được dữ liệu/ảnh. Preview dùng session đã xác minh ở server.
Các RPC SECURITY DEFINER cho authenticated là có chủ đích và vẫn kiểm tra admin trong hàm.
`cms_module_configured` công khai chỉ trả boolean cho một số module cấu hình, không trả nội dung ẩn.

### Nguồn dữ liệu và hành vi hiện tại

- Chưa nhập 257 sản phẩm/38 bài từ web cũ; không sửa hoặc dọn dữ liệu nguồn.
- Snapshot 40 sản phẩm/8 bài vẫn phục vụ preview. CMS đang trống sau kiểm tra; dashboard ghi rõ chỉ đếm CMS mới.
- Bản ghi CMS mới đã xuất bản được ghép vào public; chưa có chức năng sửa trực tiếp bản ghi chỉ tồn tại trong JSON.
- URL snapshot được giữ chỗ trong registry. Muốn chuyển một bản ghi snapshot sang CMS cần nhập mapping `legacy_path`
  khớp đường dẫn cũ; không cho vô tình tạo mới đè URL hiện hữu. Registry tiếp tục giữ URL khi nội dung bị ẩn/rác,
  tránh làm nội dung nguồn cũ xuất hiện lại thay cho bản CMS đã ẩn.
- Khi có slider CMS đầu tiên, danh sách slider CMS thay danh sách JSON; cần nhập đủ các slide muốn giữ trước khi dùng thật.
  Khi toàn bộ slider CMS tắt, không fallback về banner JSON hoặc hiện khung trống.
- Công ty/header/footer/liên hệ/LocalBusiness dùng cùng thông tin CMS khi đã được cấu hình; trước đó giữ thông tin nguồn.
- Sáu slot ảnh hệ thống và favicon được lưu riêng; logo/footer logo/favicon đã nối UI. Các vị trí trang trí chưa có
  trong UI mới (con dấu/banner mobile/nền banner) cần bản mẫu vị trí trước khi hiển thị, không tự chèn vào nội dung bán hàng.
- `SEO_ALLOW_INDEXING` không thay đổi. Admin, preview và môi trường xem thử vẫn noindex. Chưa commit/push/deploy/DNS.

## Bằng chứng kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript | Đạt. |
| Production build | Đạt sau lần chỉnh code cuối, gồm route kết thúc recovery và middleware refresh session; đã khởi động lại server 3100 và chạy các kiểm tra HTTP trên build này. |
| Node tests | 13/13 đạt: CMS và SEO, gồm CSV round-trip có dấu/xuống dòng/chuỗi giống công thức, schema không thoát script. |
| `check-ui.mjs` | 64 route, tìm kiếm/kết quả rỗng/phân trang và ảnh local đạt. |
| `check-admin.mjs` | 19 route admin có noindex, không public header/float; preview không có session không trả nội dung. |
| `check-seo.mjs` | 10 trang, JSON-LD, robots/sitemap/ảnh chia sẻ đạt. |
| `check-supabase.mjs` | Truy vấn 4 chuyên mục/0 bài, quan hệ bảng cũ đạt; anon ghi bài/upload ảnh bị chặn. |
| `supabase/tests/cms-foundation.sql` | Đạt trên remote trong transaction rollback: nháp, xuất bản, hai cấp, chặn xóa danh mục có hàng, version conflict, trash/restore, import atomic, JSON sai, URL giữ chỗ, ảnh đang dùng, revisions; admin RPC/anon/user thường/quyền nhật ký/snapshot. |
| `supabase/tests/cms-restore.sql` | Đạt với CMS trống, rollback toàn bộ: phục hồi ID, version, quan hệ, trạng thái rác, revision và audit. |
| Dữ liệu sau kiểm tra | CMS records/revisions/audit/media vẫn 0; categories cũ 4, posts cũ 0, Storage 0 file. Không để lại fixture. |
| Trình duyệt thật | Chưa kiểm: công cụ điều khiển trình duyệt không khởi động được; không có ảnh QA mới để chứng minh desktop/mobile. HTTP và build không thay thế bước này. |
| Đăng nhập thực | Chưa kiểm: không có mật khẩu, không dùng quyền SQL để tạo phiên đăng nhập hoặc đổi mật khẩu thay người dùng. Có logic tiếp nhận phiên legacy nếu trình duyệt đang giữ phiên hợp lệ. |

Kiểm tra Supabase advisor có các cảnh báo RPC definer dự kiến nêu trên và leaked-password protection chưa bật của Auth.
Không tự thay cấu hình Auth hay nâng Next/PostCSS ngoài phạm vi; audit dependency vẫn có cảnh báo critical/high đã tồn tại.

## Đối chiếu chín mục nghiệm thu

| Mục | Đã có / phần còn cần xác nhận |
| --- | --- |
| 1. Login/đổi/quên mật khẩu/logout | Có code; còn đăng nhập thật, email recovery, redirect allowlist và tự nhập mật khẩu để nghiệm thu. |
| 2. Product/article CRUD–public | Có form/RPC/route public/preview; DB tests đạt, còn thao tác UI và kiểm tra public sau mỗi bước. |
| 3. Danh mục hai cấp/chuyển hàng | Có cây/dropdown/RPC, DB kiểm tra ràng buộc đạt; còn thao tác UI. |
| 4. Banner | Có CRUD, thứ tự/tắt/nút/delay/autoplay và public adapter; còn upload/tắt slide thật trên browser. |
| 5. Công ty đồng bộ | Có provider/repository chung; chưa thay thông tin kinh doanh thật để kiểm tra UI. |
| 6. Ảnh | Có upload/reuse/usage/guard; DB guard đạt, chưa upload/xóa bằng session admin thật. |
| 7. CSV/JSON/ZIP | CSV unit round-trip và SQL restore đạt; còn thử tải ZIP/upload lại ảnh vào bucket kiểm tra trống qua browser. Giới hạn hiện tại 500 bản ghi/lượt nhập và 200 MB ảnh/ZIP; file lớn hơn bị chặn rõ, không cắt ngầm. |
| 8. Build/TS/1440–360 | TS/build đạt; desktop/mobile thật chưa kiểm được vì lỗi công cụ. |
| 9. Bàn giao | Báo cáo này, hướng dẫn sử dụng, migration và tests đã lưu. Chưa tuyên bố nghiệm thu toàn bộ. |

## Giới hạn còn lại và bước tiếp theo

1. Tự đăng nhập [admin local](http://127.0.0.1:3000/admin), kiểm tra các màn hình trên 1440px/360px,
   đặc biệt form dài, thư viện modal, menu, lịch sử, upload và thao tác destructive có xác nhận.
2. Cấu hình/đối chiếu Auth URL allowlist: `http://127.0.0.1:3000/admin/auth/callback`, localhost nếu dùng,
   và domain phát hành tương ứng. Không bật wildcard rộng hoặc thay domain thật. Tài khoản tự xử lý email/mật khẩu.
3. ZIP lớn hơn giới hạn cần tác vụ streaming/background và cơ chế tiến trình; chưa triển khai job lớn.
   Không coi việc giữ bản ZIP chưa thử khôi phục là backup đã nghiệm thu.
4. Import hiện báo dòng lỗi sau server validation; preview client chỉ phát hiện các lỗi cơ bản. Không có dry-run đầy đủ
   mọi quan hệ trước khi gửi DB. Save toàn bộ vẫn atomic; chế độ bỏ lỗi ghi từng dòng thành công có báo cáo.
5. Bộ JSON/khối và UI còn dùng một số kiểu `any` cho dữ liệu linh hoạt; cần siết union types/validation schema
   trong vòng review tiếp theo. Chưa có e2e tự động có session thật.
6. Form ảnh/cấu hình chưa tự nhập các cấu hình nguồn hiện tại vào CMS; cần nhập có đối chiếu trong đợt chuẩn bị nội dung,
   không nhầm mục trống trong admin với mất dữ liệu JSON.

### Xóa tự động sau 30 ngày — chưa bật

Automatic approval review đã từ chối migration có lịch pg_cron tự xóa vĩnh viễn trên database thật:
"chưa có ủy quyền rõ cho việc tự động purge dữ liệu production" và có lựa chọn an toàn hơn là chờ xác nhận thủ công.
Đã bỏ phần xóa tự động khỏi migration được áp dụng, không thực hiện bằng cách khác.
Hiện mục quá hạn vẫn có thể khôi phục hoặc xóa thủ công với hai xác nhận trong UI.

Đề xuất cụ thể nằm ở [SQL chờ xác nhận](operations/cms-retention-pending.sql), ngoài thư mục migrations:
chạy hằng ngày 02:15 giờ Việt Nam, xóa vĩnh viễn bản ghi CMS nằm trong rác quá 30 ngày và revision tương ứng,
giữ audit/file ảnh/bảng cũ. Cần xác nhận riêng trước khi áp dụng; file này **chưa chạy**.

## Hướng dẫn dùng nhanh

1. Vào `/admin`, tự đăng nhập tài khoản đã cấp quyền. Không gửi mật khẩu qua chat.
2. Thêm danh mục cấp 1, rồi cấp 2 nếu cần. Thêm sản phẩm: nhập tên để lưu nháp; đủ slug/cấp 1/ảnh mới xuất bản.
3. Chọn ảnh từ thư viện hoặc upload; gỡ ảnh khỏi sản phẩm không xóa file. Ảnh trong lịch sử cũng được giữ.
4. Lưu trước rồi bấm Xem trước bản đã lưu. Muốn dùng bản cũ: mở Lịch sử, nạp vào form rồi lưu.
5. Xóa vào thùng rác; Khôi phục đưa về trạng thái trước khi xóa. Xóa vĩnh viễn không xóa file ảnh dùng chung.
6. Trước thay đổi lớn dùng Nhập/xuất → Sao lưu đầy đủ ZIP. CSV/JSON nhẹ không chứa file ảnh.
7. Đổi thông tin công ty tại một nơi; trang Liên hệ chỉ sửa nội dung bổ sung và bản đồ.

## Chạy kiểm tra lại

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test tests/cms.test.mjs tests/seo.test.mjs
npm run build
# Server production ở 3100:
$env:UI_CHECK_URL='http://127.0.0.1:3100'
node scripts/check-ui.mjs
node scripts/check-admin.mjs
$env:SEO_CHECK_URL='http://127.0.0.1:3100'
node scripts/check-seo.mjs
node --env-file=.env.local scripts/check-supabase.mjs
```

SQL tests chạy bằng công cụ tin cậy trên đúng project, không chạy từ browser/anon client.
Không chạy lại schema/seed hoặc bật file retention pending khi chưa có xác nhận.
