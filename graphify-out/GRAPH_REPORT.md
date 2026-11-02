# Graph Report - TonPhucWeb  (2026-11-02)

## Corpus Check
- 173 files · ~245,568 words
- Verdict: corpus is large enough that graph structure adds value.
- Bộ phát hiện không phân loại 4 tệp: `.env.example`, `.gitignore`, `app/globals.css`, `docs/source-audit/links.csv`. Đã bổ sung nút CSS dựa trên import thực tế.

## Summary
- 1076 nodes · 1563 edges · 62 communities (56 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: không có số đo usage; không xác định được token thực tế.

## Community Hubs (Navigation)
- Routes catalog và SEO
- Trang chủ nguồn cũ
- Dàn lạnh công nghiệp
- Danh mục gas lạnh
- Ống gió mềm
- Copeland 10–15HP
- Copeland 15HP
- Copeland 5HP
- Danfoss 10HP
- Danfoss Maneurop
- Block kho lạnh
- Ống đồng cuộn
- Vật tư điện lạnh
- Vật tư lạnh
- Vật tư ngành lạnh
- Vật tư ống gen
- Thiết bị ngành lạnh
- Trích nội dung công khai
- Tin tức nguồn cũ
- Phân phối gas Floron
- Đồng cây
- Dependency phát triển
- Cấu hình TypeScript
- Kế hoạch chuyển website
- Nguồn gas nhập khẩu
- Bản lề kho lạnh
- Van tiết lưu TEX2
- Van tiết lưu TES2
- Đèn LED kho lạnh
- So sánh R410A R22
- Điều khiển Elitech
- Van thông áp Coolmax
- Quản trị bài viết
- Giới thiệu doanh nghiệp
- Gas R134A Taisei
- Gas R134A Freon
- Gas R410A Taisei
- Phân phối gas Freon
- Quyết định sản phẩm
- Quy tắc AI coding
- Kiến trúc dữ liệu
- Quy chuẩn giao diện
- Hướng dẫn SEO AIO
- Thiết lập Supabase
- Tạo ảnh chia sẻ
- Client và quyền Supabase
- Giới hạn snapshot
- Gas R32 Floron
- Kiểm tra UI
- Kiểm tra SEO
- Trạng thái bàn giao
- Unit test metadata
- Lệnh vận hành
- Schema bài viết
- Dependency giao diện
- Liên hệ và bản đồ
- Logo Tôn Phúc

## God Nodes (most connected - your core abstractions)

1. `Trang chủ Tôn Phúc` — 112 quan hệ.
2. `GAS LẠNH` — 38 quan hệ.
3. `BLOCK COPELAND 15HP` — 34 quan hệ.

## Surprising Connections (you probably didn't know these)

- Tài liệu kiến trúc → `getArticles`: ghép bài Supabase và nguồn local.
- Quy tắc noindex tìm kiếm/danh mục rỗng → `catalogMetadata()`.
- Điều kiện index production → `isIndexingAllowed()`.

## Import Cycles
- None detected.

## Communities (62 total, 6 thin omitted)

### Community 0 - "Routes catalog và SEO"
Cohesion: 0.05
Nodes (83): metadata, generateMetadata(), PostPage(), CategoryPage(), generateMetadata(), AboutPage(), metadata, metadata (+75 more)

### Community 1 - "Trang chủ nguồn cũ"
Cohesion: 0.04
Nodes (52): Báo Giá Gas Lạnh R22, R32, R410A Chính Hãng, Block, BLOCK - CỤM MÁY NÉN DÀN NGƯNG, Cụm máy dàn ngưng, Cung Cấp Gas Lạnh R407C (R407C) Chính Hãng | Tôn Phúc, Cung Cấp Gas Lạnh R507 & R407C Cho Kho Lạnh, Máy Chiller Tại TP.HCM, Cung Cấp Vật Tư Điện Lạnh Giá Sỉ Tại TP.HCM, DÀN LẠNH - DÀN NÓNG CÔNG NGHIỆP (+44 more)

### Community 2 - "Dàn lạnh công nghiệp"
Cohesion: 0.06
Nodes (43): DÀN NÓNG CÔNG NGHIỆP, DÀN NÓNG CÔNG NGHIỆP, DÀN NÓNG CÔNG NGHIỆP, DÀN NÓNG CÔNG NGHIỆP, DÀN NÓNG CÔNG NGHIỆP, Thông tin nguồn: Mô tả sản phẩm: CÔNG SUẤT ĐA DẠNG, DÀN LẠNH CÔNG NGHIỆP, Thông tin nguồn: Xuất xứ sản phẩm: TRUNG QUỐC (+35 more)

### Community 3 - "Danh mục gas lạnh"
Cohesion: 0.05
Nodes (43): Gas Freon - Chemours R404a EU, Gas Lạnh Icool R410A Nhập Khẩu Chính Hãng, Gas Lạnh R134A Entalpia Bình 13.6Kg, Gas Lạnh R134A Mỹ FREON Bình 13.6Kg Chính Hãng, Gas Lạnh R134A Jincool Bình 13.6Kg, Gas Lạnh R32 Mỹ/USA Freon - Chemours Bình 9,5kg, Gas Lạnh R32 Trung Quốc Entalpia Bình 9.5 Kg, Gas Lạnh R32 Trung Quốc Naron Bình 9.5 Kg (+35 more)

### Community 4 - "Ống gió mềm"
Cohesion: 0.06
Nodes (42): BẢO ÔN (ỐNG CÁCH NHIỆT) SUPERLON, BẢO ÔN SUPER LONG DẠNG ỐNG, BẢO ÔN SUPER LONG DẠNG TẤM, Thông tin nguồn: Mô tả sản phẩm: CÓ CÁCH NHIỆT BÔNG THUỶ TINH QUY CÁCH 10M/CUỘN, ỐNG GIÓ MỀM, Thông tin nguồn: Xuất xứ sản phẩm: VIỆT NAM, BẢO ÔN (ỐNG CÁCH NHIỆT) SUPERLON, BẢO ÔN SUPER LONG DẠNG ỐNG (+34 more)

### Community 5 - "Copeland 10–15HP"
Cohesion: 0.07
Nodes (29): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+21 more)

### Community 6 - "Copeland 15HP"
Cohesion: 0.07
Nodes (29): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+21 more)

### Community 7 - "Copeland 5HP"
Cohesion: 0.07
Nodes (29): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+21 more)

### Community 8 - "Danfoss 10HP"
Cohesion: 0.07
Nodes (29): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+21 more)

### Community 9 - "Danfoss Maneurop"
Cohesion: 0.07
Nodes (28): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+20 more)

### Community 10 - "Block kho lạnh"
Cohesion: 0.07
Nodes (28): Block biston dân dụng (sd cho tu mat tu dong tu tru lanh), BLOCK BISTON DÂN DỤNG, Block biston dân dụng kunkul thorn, BLOCK CỤM MÁY NÉN DÀN NGƯNG KHO LẠNH, BLOCK KHO LẠNH 10HP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP, BLOCK LẠNH CÔNG NGHIỆP (+20 more)

### Community 11 - "Ống đồng cuộn"
Cohesion: 0.09
Nodes (22): Thông tin nguồn: Mô tả sản phẩm: CẮT THEO YÊU CẦU, TÍNH THEO M XUẤT XỨ THÁI LAN, ỐNG ĐỒNG THÁI LAN - THÙNG, ỐNG ĐỒNG THÙNG - THÁI LAN, ỐNG ĐỒNG BÀNH, CẮT THEO YÊU CẦU, LHCT (MADE IN THAILAND), ỐNG ĐỒNG CUỘN, ỐNG ĐỒNG CUỘN 15M, ỐNG ĐỒNG CUỘN 15M/CUỘN (MADE IN MALAYSIA), ỐNG ĐỒNG CUỘN 15M/CUỘN (MADE IN THAILAND) (+14 more)

### Community 12 - "Vật tư điện lạnh"
Cohesion: 0.09
Nodes (22): Ống đồng 1, VẬT TƯ ĐIỆN LẠNH, Phụ tùng ngành lạnh 1, Phụ tùng ngành lạnh 10, Phụ tùng ngành lạnh 11, Phụ tùng ngành lạnh 12, Phụ tùng ngành lạnh 13, Phụ tùng ngành lạnh 14 (+14 more)

### Community 13 - "Vật tư lạnh"
Cohesion: 0.09
Nodes (22): Ống đồng 1, vật tư lạnh, Phụ tùng ngành lạnh 1, Phụ tùng ngành lạnh 10, Phụ tùng ngành lạnh 11, Phụ tùng ngành lạnh 12, Phụ tùng ngành lạnh 13, Phụ tùng ngành lạnh 14 (+14 more)

### Community 14 - "Vật tư ngành lạnh"
Cohesion: 0.09
Nodes (22): Ống đồng 1, vật tư ngành lạnh, Phụ tùng ngành lạnh 1, Phụ tùng ngành lạnh 10, Phụ tùng ngành lạnh 11, Phụ tùng ngành lạnh 12, Phụ tùng ngành lạnh 13, Phụ tùng ngành lạnh 14 (+14 more)

### Community 15 - "Vật tư ống gen"
Cohesion: 0.09
Nodes (22): Ống đồng 1, vật tư ống gen, Phụ tùng ngành lạnh 1, Phụ tùng ngành lạnh 10, Phụ tùng ngành lạnh 11, Phụ tùng ngành lạnh 12, Phụ tùng ngành lạnh 13, Phụ tùng ngành lạnh 14 (+14 more)

### Community 16 - "Thiết bị ngành lạnh"
Cohesion: 0.09
Nodes (22): Ống đồng 1, vật tư thiết bị ngành lạnh, Phụ tùng ngành lạnh 1, Phụ tùng ngành lạnh 10, Phụ tùng ngành lạnh 11, Phụ tùng ngành lạnh 12, Phụ tùng ngành lạnh 13, Phụ tùng ngành lạnh 14 (+14 more)

### Community 17 - "Trích nội dung công khai"
Cohesion: 0.10
Nodes (20): $, about, aboutContainer, asset(), assetCache, assets, audit, blocks() (+12 more)

### Community 18 - "Tin tức nguồn cũ"
Cohesion: 0.10
Nodes (21): Báo Giá Gas Lạnh R22, R32, R410A Chính Hãng, Các đặc điểm của gas R410A ? Một số lưu ý an toàn khi nạp gas R410A, Cung Cấp Gas Lạnh R407C (R407C) Chính Hãng | Tôn Phúc, Cung Cấp Gas Lạnh R507 & R407C Cho Kho Lạnh, Máy Chiller Tại TP.HCM, Cung Cấp Vật Tư Điện Lạnh Giá Sỉ Tại TP.HCM, Địa Chỉ Uy Tín Cung Cấp Gas Lạnh R22 Chất Lượng Cao, Địa Chỉ Uy Tín Cung Cấp Gas Lạnh R404a Chất Lượng Cao - Gas Lạnh Tôn Phúc, Gas lạnh Icool Nhà Phân phối chính hãng giá tốt nhất - Tôn Phúc (+13 more)

### Community 19 - "Phân phối gas Floron"
Cohesion: 0.12
Nodes (18): Đại Lý Phân Phối Gas Lạnh R22 Refrigerant Ấn Độ Giá Sỉ, Gas Lạnh R134A Entalpia Bình 13.6Kg, Gas Lạnh R134A Jincool Bình 13.6Kg, Thông tin nguồn: Mô tả sản phẩm: Giá: Liên Hệ 0903.863.797 Trọng Lượng: 13.6Kg(net)/bình. Loại: R134a Xuất Xứ: India ( Ấn Độ ) Ứng Dụng: Sử dụng trong công nghiệp lạnh, các hệ thống điều hòa dân dụng và thương mạị, hệ thống bơm nhiệt, cũng như các hệ thống làm mát công nghiệp. Đặc tính: Dạng lỏng, không màu, không độc, không gây cháy nổ. Cảnh báo: Tránh tiếp xúc với da và mắt, Gas Lạnh R134a Floron Xuất Xứ Ấn Độ Chính Hãng, Gas Lạnh R134A, Floron, R134A (+10 more)

### Community 20 - "Đồng cây"
Cohesion: 0.12
Nodes (18): Co 90 độ - Lơi 45 độ - T - U - Măng xông nối - Nối giảm, Co 90 độ - Lơi 45 độ - T - U - Măng xông nối - Nối giảm, ĐỒNG CÂY, ĐỒNG CÂY, Thông tin nguồn: Mô tả sản phẩm: ĐƯỜNG KÍNH TỪ 19MM - 76MM ĐỘ DÀY TỪ 0.8MM - 2MM CHIỀU DÀI 2.9M/5.8M/CÂY, XUẤT XỨ HAILIANG, Co 90 độ - Lơi 45 độ - T - U - Măng xông nối - Nối giảm, Co 90 độ - Lơi 45 độ - T - U - Măng xông nối - Nối giảm, ĐỒNG CÂY (+10 more)

### Community 21 - "Dependency phát triển"
Cohesion: 0.15
Nodes (17): description, devDependencies, autoprefixer@^10.4.0, postcss@^8.4.0, tailwindcss@^3.4.0, @types/node@^20.0.0, @types/react@^18.3.0, @types/react-dom@^18.3.0 (+9 more)

### Community 22 - "Cấu hình TypeScript"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 23 - "Kế hoạch chuyển website"
Cohesion: 0.13
Nodes (16): Danh mục nội dung cần chuyển — Gas Lạnh Tôn Phúc (tonphuc.com), Chuyển bài ở trạng thái nháp để duyệt, Kiểm kê 11 bài lịch sử chưa đầy đủ, Đối chiếu slug và lập bảng redirect, Backup và phương án quay lại trước DNS, Kế hoạch làm lại website Tôn Phúc, Giữ URL cũ và chỉ redirect khi thực sự đổi, Kiểm kê → mô hình dữ liệu → mẫu UI → chuyển → kiểm thử → DNS (+8 more)

### Community 24 - "Nguồn gas nhập khẩu"
Cohesion: 0.13
Nodes (16): Các loại Gas Lạnh Ấn Độ phổ biến do Tôn Phúc phân phối, Công ty Tôn Phúc - Đối tác tin cậy của bạn, Công ty Tôn Phúc: Nhà phân phối Gas Lạnh Ấn Độ uy tín hàng đầu tại TP.HCM, Liên hệ ngay với Công ty Tôn Phúc để nhận báo giá tốt nhất, Gas lạnh Ấn Độ - Phân phối chính hãng giá sỉ tốt nhất, Tại sao nên chọn Gas Lạnh Ấn Độ?, Các loại Gas Lạnh Trung Quốc phổ biến do Tôn Phúc phân phối, Công ty Tôn Phúc - Nhà phân phối Gas Lạnh Trung Quốc uy tín (+8 more)

### Community 25 - "Bản lề kho lạnh"
Cohesion: 0.13
Nodes (15): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, Thông tin nguồn: Mô tả sản phẩm: CHẤT LIỆU INOX/ATIMON, BẢN LỀ - KHOÁ CỬA KHO LẠNH, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28 (+7 more)

### Community 26 - "Van tiết lưu TEX2"
Cohesion: 0.13
Nodes (15): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, VAN TIẾT LƯU GAS TEX2/TES2, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28, QUẠT DÀN NÓNG - DÀN LẠNH (+7 more)

### Community 27 - "Van tiết lưu TES2"
Cohesion: 0.13
Nodes (15): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, VAN TIẾT LƯU GAS TEX2/TES2, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28, QUẠT DÀN NÓNG - DÀN LẠNH (+7 more)

### Community 28 - "Đèn LED kho lạnh"
Cohesion: 0.14
Nodes (14): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, ĐÈN LED KHO LẠNH, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28, QUẠT DÀN NÓNG - DÀN LẠNH (+6 more)

### Community 29 - "So sánh R410A R22"
Cohesion: 0.14
Nodes (14): 1.1. Ưu điểm, 1.2. Nhược điểm, 1. Gas R410A là gì? Ưu, nhược điểm của gas R410A, 2.1. Ưu điểm, 2. Gas R22 là gì? Ưu, nhược điểm của gas R22, 3. So sánh gas R410A và R32, 4. Nên sử dụng gas R410A hay R22?, >>> Xem thêm : Các đặc điểm của gas R410A (+6 more)

### Community 30 - "Điều khiển Elitech"
Cohesion: 0.14
Nodes (14): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, KHIỂN KHO LẠNH ELITECH 3030, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28, QUẠT DÀN NÓNG - DÀN LẠNH (+6 more)

### Community 31 - "Van thông áp Coolmax"
Cohesion: 0.14
Nodes (14): BỘ CHIA GAS, BỘ KHIỂN KHO LẠNH CẢM ỨNG DIAMOND COOL, KEO DÁN KHO LẠNH LOẠI ƯỚT, KÍNH XEM GAS DANFOSS, VAN THÔNG ÁP COOLMAX, PHIN LỌC DANFOSS, PHIN LỌC DANFOSS PHI 28, QUẠT DÀN NÓNG - DÀN LẠNH (+6 more)

### Community 32 - "Quản trị bài viết"
Cohesion: 0.21
Nodes (8): AdminPage(), addCategory(), savePost(), CategoryRow, EMPTY_POST, getClient(), PostRow, slugify()

### Community 33 - "Giới thiệu doanh nghiệp"
Cohesion: 0.17
Nodes (12): · Công ty có kinh nghiệm lâu năm trong lĩnh vực cung cấp gas lạnh, · Giá cả hợp lý, · Không tự ý thay gas lạnh, · Sử dụng gas lạnh chính hãng, · Thay gas lạnh định kỳ, Lời khuyên khi sử dụng gas lạnh, Nhà phân phối gas lạnh Tôn Phúc, Đại Lý Phân Phối Gas Lạnh Hàng Đầu TP.HCM (+4 more)

### Community 34 - "Gas R134A Taisei"
Cohesion: 0.17
Nodes (12): Gas lạnh R134A, Gas Lạnh R134A Entalpia Bình 13.6Kg, Gas Lạnh R134A Jincool Bình 13.6Kg, Lưu ý khi sử dụng Gas lạnh R134A Ấn Độ:, Lợi ích khi sử dụng Gas lạnh R134A Ấn Độ:, Thông tin nguồn: Mô tả sản phẩm: Giá: Liên Hệ 0903.863.797 Trọng Lượng: 13.6Kg(net)/bình. Loại: R134a Xuất Xứ: Ấn Độ Ứng Dụng: Sử dụng trong công nghiệp lạnh, các hệ thống điều hòa dân dụng và thương mạị, hệ thống bơm nhiệt, cũng như các hệ thống làm mát công nghiệp. Đặc tính: Dạng lỏng, không màu, không độc, không gây cháy nổ. Cảnh báo: Tránh tiếp xúc với da và mắt, Gas Lạnh 134A Ấn Độ Taisei Bình 13.6kg Chính Hãng, GAS LẠNH (+4 more)

### Community 35 - "Gas R134A Freon"
Cohesion: 0.18
Nodes (11): Gas Lạnh R134A Entalpia Bình 13.6Kg, Gas Lạnh R134A Jincool Bình 13.6Kg, Gas Lạnh R134A Mỹ FREON Bình 13.6Kg, Lưu ý khi sử dụng Gas lạnh R134A Mỹ:, Thông tin nguồn: Mô tả sản phẩm: Giá: Liên Hệ 0903.863.797 Trọng Lượng: 13.6Kg(net)/bình. Loại: R134a Xuất Xứ: MỸ ( tên củ là DUPONT), Sản phẩm của tập đoàn hoá chất CHEMOURS USA ( thương hiệu mới là FREON ) Ứng Dụng: Sử dụng trong công nghiệp lạnh, các hệ thống điều hòa dân dụng và thương mạị, hệ thống bơm nhiệt, cũng như các hệ thống làm mát công nghiệp. Đặc tính: Dạng lỏng, không màu, không độc, không gây cháy nổ. Thành phần: Gas lạnh Freon R134a Chemours Mỹ là loại gas lạnh thuộc nhóm HFC mới, theo tiêu chuẩn toàn cầu dùng làm môi chất lạnh thay thế cho gas R-12 (CFC) Cảnh báo: Tránh tiếp xúc với da và mắt, Gas Lạnh R134A Mỹ Freon - Chemours Bình 13.6Kg, Gas Lạnh R134A, Đặc điểm chính của Gas lạnh R134A Mỹ: (+3 more)

### Community 36 - "Gas R410A Taisei"
Cohesion: 0.18
Nodes (11): Gas Lạnh Icool R410A Nhập Khẩu Chính Hãng, Gas Lạnh R410a Ấn Độ ReFron Bình 11.3kg, Gas Lạnh R410A Floron Ấn Độ Bình 11.3 Kg Chính Hãng, Gas Lạnh R410a Mỹ/USA FREON CHEMOUR’S Bình 11.3kg Chính Hãng, Gas Lạnh Ruby R410A Nhập Khẩu Chính Hãng, Loại: Gas Lạnh R410A Ấn Độ, Thông tin nguồn: Mô tả sản phẩm: Giá: Liên Hệ 0903.863.797 Trọng Lượng: 11.3Kg(net)/bình. Loại: Gas Lạnh R410A Ấn Độ Xuất Xứ: Ấn Độ Ứng Dụng: Sử dụng trong công nghiệp lạnh, các hệ thống điều hòa dân dụng và thương mạị, hệ thống bơm nhiệt, cũng như các hệ thống làm mát công nghiệp. Đặc tính: Dạng lỏng, không màu, không độc, không gây cháy nổ. Thành phần: DIFLUOROMETHANE(HFC-32); PENTAFLUOROETHANE(HFC-125) Cảnh báo: Tránh tiếp xúc với da và mắt, Gas Lạnh R410A Ấn Độ Taisei Bình 11.3 Ký (+3 more)

### Community 37 - "Phân phối gas Freon"
Cohesion: 0.18
Nodes (11): Thông tin nguồn: CÔNG TY TNHH ĐIỆN LẠNH TÔN PHÚC có tiền thân từ Cửa hàng Kỹ thuật lạnh Tôn Phúc, đã trải qua quá trình trên 20 năm hoạt động chuyên ngành lạnh và điều hòa không khí, chúng tôi đã nhận được rất nhiều sự tin tưởng và ủng hộ của khách hàng. Với sản phẩm đa dạng về chủng loại, phong phú về kiểu dáng, đảm bảo về chất lượng, xuất xứ, dịch vụ uy tín, giá cả hợp lý, cùng đội ngũ nhân viên bán hàng chu đáo, chắc chắn quý khách hàng sẽ hoàn toàn yên tâm và hài lòng khi đến với chúng tôi. Bên cạnh việc cung cấp sản phẩm và dịch vụ liên quan đến ngành lạnh và điều hòa không khí, chúng tôi luôn sẵn sàng tư vấn MIỄN PHÍ về các thông số kỹ thuật cũng như thiết kế, lắp đặt kho lạnh, máy lạnh cho khách hàng. Với những tiêu chí này Tôn Phúc đã duy trì và phát triển nguồn khách hàng truyền thống, mở rộng thêm khách hàng mới trong Thành Phố và các tỉnh từ miền Trung đến mũi Cà Mau, phục vụ kịp thời nhu cầu hàng hóa của khách hàng. Lĩnh vực hoạt động chính của Tôn Phúc: Mua bán tất cả các Vật tư hàng hóa phục vụ cho ngành lạnh như: Block lạnh, Gas lạnh, Ống đồng, Nhớt, Phụ kiện đồng,... Chúng tôi luôn cố gắng nổ lục hơn nữa để PHỤC VỤ TỐT NHẤT cho những Quý khách hàng thân thương của mình! CÔNG TY TNHH ĐIỆN LẠNH TÔN PHÚC VPGD: 25A Tân Kỳ Tân Quý, Phường 13, Q. Tân Bình, Tp.HCM Điện thoại: 02838.106.567 Hotline: 0903.863.797 Email: vattulanh.tonphuc@gmail.com Website: www.tonphuc.com Zalo, Giới thiệu, Freon, Tôn Phúc, Các loại Gas Lạnh FREON phổ biến do Tôn Phúc phân phối, Công ty Tôn Phúc - Nhà phân phối chính thức Gas Lạnh FREON, Công ty Tôn Phúc: Phân phối Gas Lạnh FREON chính hãng, giá tốt nhất, Liên hệ ngay để nhận báo giá Gas Lạnh FREON tốt nhất (+3 more)

### Community 38 - "Quyết định sản phẩm"
Cohesion: 0.20
Nodes (10): Chữ giao diện tách vào next-intl, Phạm vi admin mở rộng chưa chốt, Website giới thiệu sản phẩm và nhận liên hệ, Mỗi bản ghi chuyển cần URL nguồn, Sản phẩm và quyết định, Không có giỏ hàng hoặc thanh toán, Chưa nhận hoặc kiểm tra admin web cũ, Chỉ bật tiếng Anh khi bản dịch duyệt (+2 more)

### Community 39 - "Quy tắc AI coding"
Cohesion: 0.22
Nodes (8): Hướng dẫn cho AI coding — TonPhucWeb, Migration không reset dữ liệu, Preview mặc định noindex, Duyệt preview trước chuyển DNS, Catalog dùng snapshot local, HTML nguồn là đầu vào không tin cậy, Admin chưa sửa được catalog local, Chỉ index production HTTPS đúng domain có cờ rõ

### Community 40 - "Kiến trúc dữ liệu"
Cohesion: 0.22
Nodes (9): Catalog local → Server Component → UI, Lỗi database không bị che bằng snapshot, Kiến trúc hiện tại và khoảng trống, Locale cố định vi, Bài viết ghép Supabase và nguồn local, Next.js App Router và React, Bảng posts và categories, Bucket ảnh public kể cả ảnh bài nháp (+1 more)

### Community 41 - "Quy chuẩn giao diện"
Cohesion: 0.22
Nodes (9): Logo skeleton là placeholder, Quy chuẩn UI — TonPhucWeb, Hai nút nổi gọi điện và Zalo, Footer nhúng Google Maps từ nguồn, Bốn trang chính bỏ intro và giữ h1 ẩn, Animation trang chủ mới đề xuất, Token UI là bản mẫu chưa duyệt, Responsive và hỗ trợ bàn phím (+1 more)

### Community 42 - "Hướng dẫn SEO AIO"
Cohesion: 0.22
Nodes (9): AIO dựa SEO nội dung đáng tin và khả năng truy cập, SEO và khả năng được công cụ AI tìm thấy, Escape JSON-LD để bảo vệ thẻ script, Metadata title description canonical và OG, Search và danh mục rỗng noindex, Chưa xác minh Google và Bing, 5 unit và 10 trang SEO đã kiểm tra local, Ảnh thương hiệu 1200×630 sinh bằng code (+1 more)

### Community 43 - "Thiết lập Supabase"
Cohesion: 0.25
Nodes (8): Quyền admin trong app_metadata, Đăng nhập lại để JWT nhận quyền admin, Supabase local — TonPhucWeb, Migration initialize_website_content_and_admin_policies, Probe ghi bài và upload của khách phải bị chặn, RLS cho khách đọc và admin ghi, Kiểm tra quyền trong transaction rollback, Supabase project TonPhucWeb

### Community 44 - "Tạo ảnh chia sẻ"
Cohesion: 0.32
Nodes (4): GET(), runtime, createShareImage(), size

### Community 45 - "Client và quyền Supabase"
Cohesion: 0.25
Nodes (4): Auth JWT admin → Data API Storage → RLS, @supabase/supabase-js@^2.45.0, @supabase/supabase-js, client

### Community 46 - "Giới hạn snapshot"
Cohesion: 0.25
Nodes (8): Trùng slug ưu tiên bài database, Nội dung công khai dùng cho bản UI, Một ảnh R22 nguồn không tải được, 25/40 sản phẩm chưa có block mô tả, Script trích xuất không ghi Supabase, Snapshot UI: 40 sản phẩm và 8 bài nguồn, Snapshot chưa phải chuyển toàn bộ website, Product schema chưa đủ điều kiện rich result

### Community 47 - "Gas R32 Floron"
Cohesion: 0.25
Nodes (8): Gas Lạnh R32 Mỹ/USA Freon - Chemours Bình 9,5kg, Gas Lạnh R32 Trung Quốc Entalpia Bình 9.5 Kg, Gas Lạnh R32 Trung Quốc Naron Bình 9.5 Kg, Thông tin nguồn: Mô tả sản phẩm: Giá: Liên Hệ 0903.863.797 Trọng Lượng: 9Kg(net)/bình. Loại: R32 Xuất Xứ: Ấn Độ Thương Hiệu: Floron Ứng Dụng: Chuyên dùng trong ngành ĐIỀU HOÀ KHÔNG KHÍ Đặc tính: Dạng lỏng, không màu, không độc (Có khả năng gây cháy nổ ở môi trường có nhiệt độ >70 °C ), Gas Lạnh R32 Thương Hiệu Floron Xuất Xứ Ấn Độ Bình 9 Kg, Gas Lạnh R32, R32, Bình gas Floron R32 màu xanh ngọc trước thùng hàng

### Community 48 - "Kiểm tra UI"
Cohesion: 0.25
Nodes (7): cheerio@1.2.0, cheerio, data, empty, routes, search, second

### Community 49 - "Kiểm tra SEO"
Cohesion: 0.29
Nodes (7): admin, cases, content, png, robots, urls, xml

### Community 50 - "Trạng thái bàn giao"
Cohesion: 0.29
Nodes (7): Chưa có bảng sản phẩm và bản dịch, Chưa thử mật khẩu và upload bằng phiên admin, Trạng thái và bàn giao, Cần chốt schema catalog và bản dịch, Local preview còn chờ duyệt, Nền tảng SEO kỹ thuật đã hoàn thành, UI mới và 64 kiểm tra route đã hoàn thành

### Community 51 - "Unit test metadata"
Cohesion: 0.29
Nodes (3): typescript@^5.5.0, typescript, production

### Community 52 - "Lệnh vận hành"
Cohesion: 0.29
Nodes (7): scripts, build, check:seo, check:seo:local, dev, lint, start

### Community 53 - "Schema bài viết"
Cohesion: 0.52
Nodes (6): posts_category_id_idx, posts_published_created_at_idx, posts_set_updated_at, public.categories, public.posts, public.set_updated_at()

### Community 54 - "Dependency giao diện"
Cohesion: 0.33
Nodes (6): dependencies, lucide-react@1.66.0, next@^14.2.0, next-intl@4.14.9, react-dom@^18.3.0, react-dom

### Community 55 - "Liên hệ và bản đồ"
Cohesion: 0.40
Nodes (5): 25A Tân Kỳ Tân Quý, Phường 13, Quận Tân Bình, TP HCM, Google Maps cửa hàng Tôn Phúc, 0914.157.636, Liên hệ, 0903.863.797

## Knowledge Gaps
- **719 isolated node(s):** `HTML nguồn là đầu vào không tin cậy`, `Migration không reset dữ liệu`, `Duyệt preview trước chuyển DNS`, `TonPhucWeb`, `Chạy local bằng npm run dev` (+714 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 818 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

- Vì sao trang chủ nguồn cũ nối nhiều danh mục, ảnh và bài viết?
- Bài Supabase và snapshot local gặp nhau ở đâu trong luồng hiển thị?
- Quy tắc noindex trong tài liệu được thực thi bởi những hàm nào?

## Giới hạn và cách dùng

- Quét 173 tệp đã phát hiện; bổ sung 5 nút tài nguyên CSS/JSON được import trực tiếp để nối đủ quan hệ.
- Không đọc `.env.local`, node_modules hoặc thư mục build; không truy vấn hay thay đổi Supabase.
- Không có số đo token usage từ công cụ agent. Giá trị 0 trong bảng/tracker là placeholder, không phải chi phí thực tế bằng 0.
- Kiểm tra đồ thị: không còn endpoint thiếu; 2 self-loop và 89 quan hệ cùng cặp endpoint bị gộp khi tạo đồ thị vô hướng. Dữ liệu trích xuất ban đầu được giữ ở `extraction.json`; chi tiết `GRAPH_HEALTH.txt`.
- Quan hệ từ HTML công khai là bằng chứng nguồn, chưa xác minh độc lập tuyên bố kinh doanh/thông số. Nhiều liên kết điều hướng lặp lại có thể làm tăng độ nổi bật của trang nguồn. Độ trung tâm không đồng nghĩa độ quan trọng nghiệp vụ.
- `graphify-out/` được tạo trong working tree và chưa được Git bỏ qua. Có thể bỏ qua thư mục hoặc chỉ chia sẻ đầu ra cần thiết.
- Sau khi sửa code/tài liệu, dùng `$graphify . --update` để cập nhật; graph là snapshot, không phải yêu cầu sản phẩm hay trạng thái dịch vụ live.
