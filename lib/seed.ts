export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  coverImage: string | null;
};

const PLACEHOLDER =
  "Nội dung đang được chuyển từ web cũ — sẽ thay bằng bài đầy đủ lấy từ tài khoản admin. Đây chỉ là đoạn mô tả tạm trong skeleton, không phải nội dung thật của bài viết.";

/**
 * 11 tiêu đề lấy từ trang chủ tonphuc.com ngày 01/11/2026.
 * CHỈ có tiêu đề + mô tả tạm placeholder. Không bịa nội dung chi tiết, không bịa giá.
 * Khi chuyển nội dung thật từ admin, thay excerpt/content bằng bài đầy đủ.
 */
export const SEED_POSTS: SeedPost[] = [
  { slug: "dai-ly-phan-phoi-gas-lanh-hang-dau-tphcm", title: "Đại Lý Phân Phối Gas Lạnh Hàng Đầu TP.HCM", excerpt: PLACEHOLDER, category: "Giới thiệu", categorySlug: "gioi-thieu", coverImage: null },
  { slug: "bao-gia-gas-lanh-r22-r32-r410a-chinh-hang", title: "Báo Giá Gas Lạnh R22, R32, R410A Chính Hãng", excerpt: PLACEHOLDER, category: "Báo giá", categorySlug: "bao-gia", coverImage: null },
  { slug: "gas-r22-co-doc-khong", title: "Gas R22 có độc không", excerpt: PLACEHOLDER, category: "Kiến thức", categorySlug: "kien-thuc", coverImage: null },
  { slug: "gas-r32-co-doc-khong", title: "Gas R32 có độc không", excerpt: PLACEHOLDER, category: "Kiến thức", categorySlug: "kien-thuc", coverImage: null },
  { slug: "cung-cap-gas-lanh-r507-r407c-cho-kho-lanh-may-chiller-tphcm", title: "Cung Cấp Gas Lạnh R507 & R407C Cho Kho Lạnh, Máy Chiller Tại TP.HCM", excerpt: PLACEHOLDER, category: "Sản phẩm", categorySlug: "san-pham", coverImage: null },
  { slug: "gas-r410a-co-chay-khong", title: "Gas R410A có cháy không", excerpt: PLACEHOLDER, category: "Kiến thức", categorySlug: "kien-thuc", coverImage: null },
  { slug: "cung-cap-vat-tu-dien-lanh-gia-si-tphcm", title: "Cung Cấp Vật Tư Điện Lạnh Giá Sỉ Tại TP.HCM", excerpt: PLACEHOLDER, category: "Sản phẩm", categorySlug: "san-pham", coverImage: null },
  { slug: "thay-gas-r410a-bang-r32-duoc-khong", title: "Thay gas R410A bằng R32 được không", excerpt: PLACEHOLDER, category: "Kiến thức", categorySlug: "kien-thuc", coverImage: null },
  { slug: "gas-r410a-co-nap-bo-sung-duoc-khong", title: "Gas R410A có nạp bổ sung được không", excerpt: PLACEHOLDER, category: "Kiến thức", categorySlug: "kien-thuc", coverImage: null },
  { slug: "gas-lanh-r22-an-do", title: "Gas Lạnh R22 Ấn Độ", excerpt: PLACEHOLDER, category: "Sản phẩm", categorySlug: "san-pham", coverImage: null },
  { slug: "nha-cung-cap-gas-lanh-chemours", title: "Nhà Cung Cấp Gas Lạnh Chemours", excerpt: PLACEHOLDER, category: "Sản phẩm", categorySlug: "san-pham", coverImage: null },
];

export const SEED_CATEGORIES = [
  { slug: "gioi-thieu", name: "Giới thiệu" },
  { slug: "san-pham", name: "Sản phẩm" },
  { slug: "bao-gia", name: "Báo giá" },
  { slug: "kien-thuc", name: "Kiến thức" },
];

/** Tạo slug từ tiêu đề tiếng Việt (bỏ dấu, thay khoảng trắng bằng dấu gạch ngang). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
