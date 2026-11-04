export type CmsRecord = {
  id: string;
  kind: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "hidden";
  data: Record<string, any>;
  version: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "image"
    | "gallery"
    | "blocks"
    | "specs"
    | "select"
    | "tags"
    | "date"
    | "groups";
  options?: [string, string][];
  relation?: string;
};
export type Module = {
  kind: string;
  label: string;
  route: string;
  fields: Field[];
  seo?: boolean;
  singleton?: boolean;
  fixedSlug?: string;
  noDraft?: boolean;
};
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  extra: Partial<Field> = {},
): Field => ({ key, label, type, ...extra });
const blocks = [
  f("excerpt", "Mô tả ngắn", "textarea"),
  f("blocks", "Nội dung", "blocks"),
];
const image = [
  f("image", "Ảnh chính / ảnh bìa", "image"),
  f("image_alt", "Mô tả ảnh (alt)"),
  f("gallery", "Ảnh phụ", "gallery"),
];
const order = [
  f("sort_order", "Thứ tự (nhỏ lên trước)", "number"),
  f("featured", "Nổi bật", "checkbox"),
];
export const modules: Module[] = [
  {
    kind: "product",
    route: "san-pham",
    label: "Sản phẩm",
    seo: true,
    fields: [
      f("category_id", "Danh mục cấp 1", "select", {
        relation: "product_category",
      }),
      f("secondary_category_id", "Danh mục cấp 2", "select", {
        relation: "product_category",
      }),
      f("sku", "Mã sản phẩm (SKU)"),
      f("brand", "Thương hiệu"),
      f("origin", "Xuất xứ"),
      f("stock_status", "Trạng thái kho", "select", {
        options: [
          ["contact", "Liên hệ"],
          ["available", "Còn hàng"],
          ["unavailable", "Hết hàng"],
        ],
      }),
      f("price", "Giá bán thật (đồng), để trống nếu liên hệ", "number"),
      ...blocks,
      f("functions", "Chức năng", "blocks"),
      f("origin_content", "Xuất xứ — nội dung gốc", "blocks"),
      f("packaging", "Quy cách", "blocks"),
      f("specs", "Thông số kỹ thuật", "specs"),
      ...image,
      f("tag_ids", "Tags", "tags", { relation: "tag" }),
      ...order,
    ],
  },
  {
    kind: "product_category",
    route: "danh-muc",
    label: "Danh mục sản phẩm",
    seo: true,
    noDraft: true,
    fields: [
      f("parent_id", "Danh mục cha (trống = cấp 1)", "select", {
        relation: "product_category",
      }),
      ...blocks,
      f("image", "Ảnh danh mục", "image"),
      ...order,
    ],
  },
  {
    kind: "article",
    route: "bai-viet",
    label: "Bài viết",
    seo: true,
    fields: [
      f("category_id", "Chuyên mục", "select", {
        relation: "article_category",
      }),
      f("author", "Tác giả"),
      f("published_at", "Ngày đăng", "date"),
      ...blocks,
      ...image,
      ...order,
    ],
  },
  {
    kind: "article_category",
    route: "chuyen-muc",
    label: "Chuyên mục bài viết",
    seo: true,
    noDraft: true,
    fields: [...blocks, ...order],
  },
  {
    kind: "tag",
    route: "tags",
    label: "Tags",
    seo: true,
    noDraft: true,
    fields: [f("url", "Link"), ...order],
  },
  {
    kind: "page",
    route: "trang",
    label: "Trang tĩnh",
    seo: true,
    noDraft: true,
    fields: [
      ...blocks,
      f("image", "Ảnh cửa hàng", "image"),
      f("maps_url", "Link chỉ đường Google Maps"),
      f("link_groups", "Nhóm liên kết footer", "groups"),
      f("copyright", "Bản quyền"),
    ],
  },
  {
    kind: "company",
    route: "cong-ty",
    label: "Thông tin công ty",
    singleton: true,
    fixedSlug: "company",
    noDraft: true,
    fields: [
      f("name", "Tên công ty đầy đủ"),
      f("tax_code", "Mã số thuế"),
      f("address", "Địa chỉ", "textarea"),
      f("phone", "Hotline gọi điện (chỉ số)"),
      f("phoneDisplay", "Hotline hiển thị"),
      f("zalo_number", "Số Zalo"),
      f("landline", "Điện thoại bàn"),
      f("email", "Email"),
      f("website", "Website"),
      f("opening_hours", "Giờ mở cửa"),
      f("favicon", "Favicon (.ico)", "image"),
    ],
  },
  {
    kind: "social",
    route: "lien-ket",
    label: "Liên kết mạng xã hội",
    noDraft: true,
    fields: [
      f("url", "Địa chỉ liên kết"),
      f("icon", "Icon (tên hoặc ảnh)"),
      ...order,
    ],
  },
  {
    kind: "slider",
    route: "banner",
    label: "Slider trang chủ",
    noDraft: true,
    fields: [
      f("image", "Ảnh slider — gợi ý 1366×576", "image"),
      f("image_alt", "Mô tả ảnh"),
      f("description", "Chú thích", "textarea"),
      f("href", "Link đích"),
      f("button_label", "Chữ trên nút (trống = Xem ngay)"),
      ...order,
    ],
  },
  {
    kind: "slider_settings",
    route: "cai-dat-slider",
    label: "Cài đặt slider",
    singleton: true,
    fixedSlug: "slider",
    noDraft: true,
    fields: [
      f("delay", "Tự chuyển sau (giây)", "number"),
      f("autoplay", "Tự chuyển", "checkbox"),
    ],
  },
  {
    kind: "system_image",
    route: "anh-he-thong",
    label: "Ảnh hệ thống",
    noDraft: true,
    fields: [
      f("image", "File ảnh", "image"),
      f("image_alt", "Mô tả ảnh"),
      f("background_color", "Màu nền footer"),
    ],
  },
  {
    kind: "seo",
    route: "seo",
    label: "Cài đặt SEO",
    seo: true,
    noDraft: true,
    fields: [
      f("excerpt", "Mô tả ngắn", "textarea"),
      f("image", "Ảnh chia sẻ", "image"),
      f("google_verification", "Mã xác minh Google (chỉ trang chủ)"),
      f("bing_verification", "Mã xác minh Bing (chỉ trang chủ)"),
      ...order,
    ],
  },
  {
    kind: "redirect",
    route: "chuyen-huong",
    label: "Chuyển hướng URL",
    noDraft: true,
    fields: [
      f("from", "URL cũ (/duong-dan-cu)"),
      f("to", "URL mới (/duong-dan-moi)"),
    ],
  },
];
export const seoFields: Field[] = [
  f("seo_title", "Tiêu đề SEO"),
  f("seo_keywords", "Keywords (giữ nguyên chuỗi)"),
  f("seo_description", "Mô tả SEO", "textarea"),
  f("schema_json", "Schema JSON (tùy chọn)", "textarea"),
];
export const systemSlots = [
  ["seal", "Con dấu — PNG 600×461"],
  ["logo", "Logo — 180×130"],
  ["footer-logo", "Logo footer"],
  ["mobile-banner", "Banner mobile — 750×138"],
  ["banner-background", "Nền banner — 900×500"],
  ["footer-background", "Nền footer — 483×406"],
] as const;
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function normalize(value: string) {
  return slugify(value).replace(/-/g, " ");
}
export function publicPath(r: Pick<CmsRecord, "kind" | "slug">) {
  return r.kind === "article"
    ? `/bai-viet/${r.slug}`
    : r.kind === "article_category"
      ? `/chuyen-muc/${r.slug}`
      : r.kind === "tag"
        ? `/tag/${r.slug}`
        : `/${r.slug}`;
}
export function publicationErrors(
  r: Pick<CmsRecord, "title" | "slug" | "kind" | "data">,
) {
  const errors: string[] = [];
  if (!r.title.trim()) errors.push("Thiếu tiêu đề");
  if (!r.slug) errors.push("Thiếu slug");
  if (["product", "article", "slider"].includes(r.kind) && !r.data.image)
    errors.push("Thiếu ảnh chính");
  if (r.kind === "product" && !r.data.category_id)
    errors.push("Thiếu danh mục cấp 1");
  return errors;
}
export function recordWarnings(r: Pick<CmsRecord, "kind" | "data">) {
  const out = [];
  if (["product", "article"].includes(r.kind)) {
    if (!r.data.image) out.push("Thiếu ảnh");
    if (!r.data.category_id) out.push("Thiếu danh mục");
    if (!r.data.excerpt) out.push("Thiếu mô tả");
  }
  const len = (r.data.seo_description || "").length;
  if (len && len < 68) out.push("Mô tả SEO ngắn hơn 68 ký tự");
  if (len > 170) out.push("Mô tả SEO dài hơn 170 ký tự");
  return out;
}
