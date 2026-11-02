# Bàn giao sửa độ dễ đọc — 02/11/2026

Thực hiện theo brief phản hồi của chủ shop, trên checkout TonPhucWeb HEAD `ec3dd73`.
Brief nhắc hero cũ; code hiện đã có slider và đã bỏ ảnh nổi/tọa độ nên giữ slider.
Đây là bản local chờ duyệt, không commit/push/deploy hay thay DNS.

## File thay đổi

| File | Thay đổi |
| --- | --- |
| `app/readability.css` | Cỡ chữ, màu tương phản, khoảng cách, nút chạm, catalog mobile, footer và thanh liên hệ. |
| `app/layout.tsx` | Nạp stylesheet readability sau CSS hiện có. |
| `app/page.tsx` | Liên hệ ngay sau sản phẩm; giới thiệu và ba liên kết tin tức thu gọn. |
| `components/ProductCard.tsx` | “Liên hệ tư vấn” mở chi tiết sản phẩm, giữ luồng xem hàng → gọi. |
| `components/FloatingContact.tsx` | Nhãn mobile; nhường vùng hiển thị cho liên kết/nút trong nội dung. |
| `components/SiteHeader.tsx` | Footer bỏ đoạn mô tả dang dở, bảo đảm khoảng trắng bản quyền. |
| `messages/vi.json` | Thêm nhãn “Nhắn Zalo”. |
| `docs/design-system.md`, `docs/status.md` | Ghi nhận mẫu chờ duyệt và kết quả kiểm tra. |
| `artifacts/readability/` | Bằng chứng ảnh và phép đo trước/sau. |

## Kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Đạt; build sau đó cũng kiểm tra lại TypeScript. |
| `npm run build` | Đạt. |
| `UI_CHECK_URL=http://127.0.0.1:3100 node scripts/check-ui.mjs` | Đạt 64 route, tìm kiếm R32, kết quả rỗng, phân trang và ảnh local. |
| Trình duyệt 1440×1000 và 360×900 | Đã xem `/`, `/san-pham`, `/san-pham?q=R32`, chi tiết R134a Floron, `/tin-tuc`, `/gioi-thieu`, `/lien-he`; không phát hiện tràn ngang hoặc chữ chồng trong mẫu. |
| Menu mobile | Mở bằng nút, đóng bằng Escape đạt. |
| Luồng catalog → chi tiết | Đã bấm sản phẩm R134a Floron, đúng trang và hotline `tel:`. Không thực hiện cuộc gọi hay gửi Zalo. |
| Thanh liên hệ mobile | Ẩn tại vị trí có nút/khối liên kết dưới đáy ở catalog và chi tiết; hiện ở vùng không xung đột trên Giới thiệu/Tin tức/Liên hệ. Hotline trong header và trang chi tiết vẫn có. |
| Cỡ chữ và màu DOM | `after-metrics.json`: 14 mẫu không phát hiện leaf text dưới 13px hoặc cặp màu đo được dưới ngưỡng 4.5:1 thường/3:1 lớn. Tên sản phẩm từ 12/11px trước sửa thành 18/16px desktop/mobile. |
| SEO hồi quy | Đợt kiểm tra trước bản tinh chỉnh thanh liên hệ vượt 10 trang, robots/sitemap/ảnh chia sẻ; không sửa file SEO. |

Đo tương phản chỉ xét chữ DOM và màu nền có thể tính, không đánh giá chữ in trong ảnh,
gradient phức tạp hoặc Google Maps iframe; không thay thế kiểm định WCAG toàn diện.
Ảnh chụp là viewport, không phải toàn bộ chiều dài trang. Ảnh trang chủ desktop trước sửa
đang cuộn xuống banner/nhóm hàng, ảnh sau ở đầu trang; so sánh cỡ chữ bằng catalog dễ hơn.
`after-metrics.json` được lưu trước lần bổ sung tự ẩn thanh liên hệ; bố cục/cỡ chữ không đổi sau đó.
`final-mobile-checks.json` và ảnh mobile đã cập nhật sau bản bổ sung này.

## Ảnh trước/sau

| Trang/kích thước | Trước | Sau |
| --- | --- | --- |
| Trang chủ desktop | [Trước](before-home-desktop.jpg) | [Sau](after-home-desktop.jpg) |
| Sản phẩm desktop | [Trước](before-products-desktop.jpg) | [Sau](after-products-desktop.jpg) |
| Trang chủ mobile | [Trước](before-home-mobile.jpg) | [Sau](after-home-mobile.jpg) |
| Sản phẩm mobile | [Trước](before-products-mobile.jpg) | [Sau](after-products-mobile.jpg) |

Các ảnh `qa-*` lưu tìm kiếm, chi tiết, tin tức, giới thiệu và liên hệ ở cả hai kích thước.

## Giữ ngoài phạm vi

Không sửa dữ liệu/bài viết/lỗi chính tả, watermark ảnh, URL/slug, sitemap/robots/schema,
cấu hình SEO/noindex, Supabase/admin, dependency, giỏ hàng/thanh toán hoặc form mới.
Chưa kiểm tra trên điện thoại vật lý hay triển khai remote bản sửa này.
