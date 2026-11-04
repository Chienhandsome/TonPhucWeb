"use client";
import { useEffect, useState } from "react";
import { cmsBrowser } from "@/lib/cms/browser";
import {
  CmsRecord,
  Field,
  Module,
  modules,
  publicationErrors,
  recordWarnings,
  seoFields,
  slugify,
  systemSlots,
} from "@/lib/cms/config";
import BlockEditor from "./BlockEditor";
import MediaLibrary from "./MediaLibrary";
export default function RecordEditor({
  module,
  record,
  records,
  onDone,
}: {
  module: Module;
  record: Partial<CmsRecord>;
  records: CmsRecord[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<any>({
      ...record,
      kind: module.kind,
      title: record.title || (module.singleton ? module.label : ""),
      slug: record.slug || module.fixedSlug || "",
      data: {
        ...(module.kind === "slider_settings"
          ? { delay: 6, autoplay: true }
          : {}),
        ...(record.data || {}),
      },
      status: record.status || "draft",
    }),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [picker, setPicker] = useState<Field | null>(null),
    [history, setHistory] = useState<any[]>([]),
    [slugTouched, setSlugTouched] = useState(!!record.id);
  const [extraTags, setExtraTags] = useState<CmsRecord[]>([]);
  const change = (key: string, value: any) =>
    setForm((old: any) => ({ ...old, data: { ...old.data, [key]: value } }));
  const errors = publicationErrors(form),
    warnings = recordWarnings(form);
  const duplicate = records.some(
    (r) => r.id !== form.id && r.kind === form.kind && r.slug === form.slug,
  );
  useEffect(() => {
    if (record.id)
      cmsBrowser()
        .from("cms_revisions")
        .select("*")
        .eq("record_id", record.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) setMessage(error.message);
          else setHistory(data || []);
        });
  }, [record.id]);
  async function save(status: string) {
    setBusy(true);
    setMessage("");
    try {
      if (duplicate) throw new Error("Slug đã tồn tại");
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        status,
        data: { ...form.data },
      };
      if (
        module.kind === "article" &&
        status === "published" &&
        !payload.data.published_at
      )
        payload.data.published_at = new Date().toISOString();
      if (payload.data.schema_json) JSON.parse(payload.data.schema_json);
      const { error } = await cmsBrowser().rpc("cms_save", { payload });
      if (error) throw error;
      onDone();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  function renderField(field: Field) {
    let options = field.options || [];
    if (field.relation)
      options = [...records, ...extraTags]
        .filter(
          (r) => r.kind === field.relation && !r.deleted_at && r.id !== form.id,
        )
        .filter((r) =>
          field.key === "secondary_category_id"
            ? r.data.parent_id === form.data.category_id
            : field.key === "parent_id" ||
                (field.key === "category_id" &&
                  field.relation === "product_category")
              ? !r.data.parent_id
              : true,
        )
        .map((r) => [r.id, r.title]);
    const v = form.data[field.key];
    return (
      <div className="cms-field" key={field.key}>
        <label htmlFor={`field-${field.key}`}>{field.label}</label>
        {field.type === "groups" && (
          <div>
            {(v || []).map((group: any, i: number) => (
              <fieldset key={i}>
                <label>
                  Tên nhóm
                  <input
                    value={group.title || ""}
                    onChange={(e) =>
                      change(
                        field.key,
                        v.map((g: any, j: number) =>
                          i === j ? { ...g, title: e.target.value } : g,
                        ),
                      )
                    }
                  />
                </label>
                {(group.links || []).map((link: any, n: number) => (
                  <div className="cms-two" key={n}>
                    <label>
                      Tên liên kết
                      <input
                        value={link.label || ""}
                        onChange={(e) =>
                          change(
                            field.key,
                            v.map((g: any, j: number) =>
                              i === j
                                ? {
                                    ...g,
                                    links: g.links.map((l: any, k: number) =>
                                      k === n
                                        ? { ...l, label: e.target.value }
                                        : l,
                                    ),
                                  }
                                : g,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Địa chỉ
                      <input
                        value={link.href || ""}
                        onChange={(e) =>
                          change(
                            field.key,
                            v.map((g: any, j: number) =>
                              i === j
                                ? {
                                    ...g,
                                    links: g.links.map((l: any, k: number) =>
                                      k === n
                                        ? { ...l, href: e.target.value }
                                        : l,
                                    ),
                                  }
                                : g,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
                <div className="cms-actions">
                  <button
                    type="button"
                    onClick={() =>
                      change(
                        field.key,
                        v.map((g: any, j: number) =>
                          i === j
                            ? {
                                ...g,
                                links: [
                                  ...(g.links || []),
                                  { label: "", href: "" },
                                ],
                              }
                            : g,
                        ),
                      )
                    }
                  >
                    Thêm link
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      change(
                        field.key,
                        v.filter((_: any, j: number) => i !== j),
                      )
                    }
                  >
                    Bỏ nhóm
                  </button>
                </div>
              </fieldset>
            ))}
            <button
              type="button"
              onClick={() =>
                change(field.key, [...(v || []), { title: "", links: [] }])
              }
            >
              Thêm nhóm liên kết
            </button>
          </div>
        )}
        {field.type === "groups" ? null : field.type === "blocks" ||
          field.type === "specs" ? (
          <BlockEditor
            specs={field.type === "specs"}
            value={v || []}
            onChange={(value) => change(field.key, value)}
          />
        ) : field.type === "image" || field.type === "gallery" ? (
          <>
            <button type="button" onClick={() => setPicker(field)}>
              {field.type === "image" ? "Chọn / thay ảnh" : "Thêm ảnh phụ"}
            </button>
            {(field.type === "image" ? (v ? [v] : []) : v || []).map(
              (url: string, i: number) => (
                <div key={i}>
                  <img
                    className="cms-image-preview"
                    src={url}
                    alt="Ảnh đã chọn"
                  />
                  {field.type === "gallery" && (
                    <label>
                      Mô tả ảnh phụ {i + 1}
                      <input
                        value={form.data.gallery_alts?.[i] || ""}
                        onChange={(e) => {
                          const alts = [...(form.data.gallery_alts || [])];
                          alts[i] = e.target.value;
                          change("gallery_alts", alts);
                        }}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      change(
                        field.key,
                        field.type === "image"
                          ? ""
                          : v.filter((_: any, j: number) => i !== j),
                      )
                    }
                  >
                    Gỡ khỏi nội dung
                  </button>
                </div>
              ),
            )}
          </>
        ) : field.type === "select" ? (
          <select
            id={`field-${field.key}`}
            value={v || ""}
            onChange={(e) => {
              change(field.key, e.target.value);
              if (field.key === "category_id")
                change("secondary_category_id", "");
            }}
          >
            <option value="">— Chưa chọn —</option>
            {options.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        ) : field.type === "tags" ? (
          <>
            <div className="cms-tag-list">
              {options.map(([id, title]) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    checked={(v || []).includes(id)}
                    onChange={(e) =>
                      change(
                        field.key,
                        e.target.checked
                          ? [...(v || []), id]
                          : (v || []).filter((x: string) => x !== id),
                      )
                    }
                  />
                  {title}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={async () => {
                const title = prompt("Tên tag mới:");
                if (!title?.trim()) return;
                const { data, error } = await cmsBrowser().rpc("cms_save", {
                  payload: {
                    kind: "tag",
                    title,
                    slug: slugify(title),
                    status: "published",
                    data: {},
                  },
                });
                if (error) setMessage(error.message);
                else {
                  setExtraTags((old) => [...old, data]);
                  change(field.key, [...(v || []), data.id]);
                }
              }}
            >
              Thêm tag mới
            </button>
          </>
        ) : field.type === "textarea" ? (
          <textarea
            id={`field-${field.key}`}
            rows={field.key === "schema_json" ? 8 : 4}
            value={v || ""}
            onChange={(e) => change(field.key, e.target.value)}
          />
        ) : field.type === "checkbox" ? (
          <input
            id={`field-${field.key}`}
            type="checkbox"
            checked={!!v}
            onChange={(e) => change(field.key, e.target.checked)}
          />
        ) : (
          <input
            id={`field-${field.key}`}
            type={
              field.type === "number"
                ? "number"
                : field.type === "date"
                  ? "datetime-local"
                  : "text"
            }
            min={field.type === "number" ? 0 : undefined}
            value={field.type === "date" ? (v || "").slice(0, 16) : (v ?? "")}
            onChange={(e) =>
              change(
                field.key,
                field.type === "number"
                  ? e.target.value === ""
                    ? null
                    : Number(e.target.value)
                  : e.target.value,
              )
            }
          />
        )}
      </div>
    );
  }
  return (
    <form
      className="cms-editor"
      onSubmit={(e) => {
        e.preventDefault();
        save(module.noDraft ? "published" : "draft");
      }}
    >
      <div className="cms-toolbar">
        <h2>
          {record.id ? "Sửa" : "Thêm"} {module.label.toLowerCase()}
        </h2>
        <button
          type="button"
          onClick={() => {
            if (confirm("Rời form? Thay đổi chưa lưu sẽ mất.")) onDone();
          }}
        >
          Hủy / trở lại
        </button>
      </div>
      <label>
        Tiêu đề / tên <span>(bắt buộc)</span>
        <input
          autoFocus
          value={form.title}
          onChange={(e) => {
            setForm({
              ...form,
              title: e.target.value,
              ...(!slugTouched && !module.fixedSlug
                ? { slug: slugify(e.target.value) }
                : {}),
            });
          }}
          required
        />
      </label>
      <label>
        Slug{" "}
        {module.kind === "system_image" ? (
          <select
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          >
            <option value="">Chọn vị trí</option>
            {systemSlots.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ) : module.kind === "seo" ? (
          <select
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          >
            <option value="">Chọn trang / chuyên mục</option>
            {[
              ["trang-chu", "Trang chủ"],
              ["san-pham", "Sản phẩm"],
              ["tin-tuc", "Tin tức"],
              ["kho-lanh", "Kho lạnh (có thể ẩn)"],
              ["cum-may-dan-ngung", "Cụm máy dàn ngưng (có thể ẩn)"],
              ["dan-lanh-cong-nghiep", "Dàn lạnh công nghiệp (có thể ẩn)"],
            ].map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ) : module.kind === "page" ? (
          <select
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          >
            <option value="">Chọn trang</option>
            {["gioi-thieu", "lien-he", "footer"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        ) : (
          <input
            readOnly={!!module.fixedSlug}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: e.target.value });
            }}
          />
        )}
      </label>
      {duplicate && (
        <p role="alert" className="cms-error">
          Slug đã tồn tại.
        </p>
      )}
      <p className="cms-note">
        Nháp chỉ cần tiêu đề. Các trường thiếu được cảnh báo; không tự điền
        thông số hoặc giá.
      </p>
      {module.fields.map(renderField)}
      {module.seo && (
        <fieldset>
          <legend>SEO</legend>
          {seoFields
            .filter(
              (field) => module.kind !== "tag" || field.key !== "schema_json",
            )
            .map(renderField)}
          <button
            type="button"
            onClick={() => {
              if (
                form.data.schema_json &&
                !confirm("Thay schema hiện có bằng mã tự tạo?")
              )
                return;
              const type =
                form.kind === "product"
                  ? "Product"
                  : form.kind === "article"
                    ? "Article"
                    : "WebPage";
              change(
                "schema_json",
                JSON.stringify(
                  {
                    "@context": "https://schema.org",
                    "@type": type,
                    name: form.title,
                    description: form.data.excerpt || "",
                    ...(form.data.image ? { image: form.data.image } : {}),
                    ...(form.data.brand
                      ? { brand: { "@type": "Brand", name: form.data.brand } }
                      : {}),
                    ...(form.data.origin
                      ? { countryOfOrigin: form.data.origin }
                      : {}),
                  },
                  null,
                  2,
                ),
              );
            }}
          >
            Tạo schema từ dữ liệu hiện có
          </button>
        </fieldset>
      )}
      {warnings.length > 0 && (
        <div className="cms-note">
          <strong>Cần chú ý</strong>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <p role="alert" className="cms-error">
        {message}
      </p>
      <div className="cms-save">
        <div className="cms-actions">
          {!module.noDraft && (
            <button
              type="button"
              disabled={busy || !form.title.trim()}
              onClick={() => save("draft")}
            >
              Lưu nháp
            </button>
          )}
          <button
            className="cms-primary"
            type="button"
            disabled={busy || !!errors.length || duplicate}
            onClick={() => save("published")}
          >
            {busy
              ? "Đang lưu…"
              : module.noDraft
                ? "Lưu và hiển thị"
                : "Xuất bản"}
          </button>
          {record.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                window.open(
                  `/admin/xem-truoc/${record.id}`,
                  "_blank",
                  "noopener",
                )
              }
            >
              Xem trước bản đã lưu
            </button>
          )}
          {record.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save("hidden")}
            >
              Lưu và ẩn
            </button>
          )}
        </div>
        {errors.length > 0 && <p>Chưa xuất bản được: {errors.join("; ")}.</p>}
        <p>
          Nhớ lưu trước khi xem trước.{" "}
          {record.updated_at &&
            `Lần sửa cuối: ${new Date(record.updated_at).toLocaleString("vi-VN")}`}
        </p>
      </div>
      {history.length > 0 && (
        <details>
          <summary>Lịch sử phiên bản ({history.length})</summary>
          {history.map((h) => (
            <div className="cms-history" key={h.id}>
              <span>
                {new Date(h.created_at).toLocaleString("vi-VN")} · phiên bản{" "}
                {h.snapshot.version}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      "Nạp phiên bản này vào form? Cần bấm lưu để áp dụng.",
                    )
                  )
                    setForm({
                      ...h.snapshot,
                      id: form.id,
                      version: form.version,
                      deleted_at: form.deleted_at,
                    });
                }}
              >
                Nạp lại vào form
              </button>
            </div>
          ))}
        </details>
      )}
      {picker && (
        <MediaLibrary
          onClose={() => setPicker(null)}
          onSelect={(url) => {
            change(
              picker.key,
              picker.type === "gallery"
                ? [...(form.data[picker.key] || []), url]
                : url,
            );
            if (module.kind === "slider") {
              const image = new window.Image();
              image.onload = () => {
                if (image.width < 1200)
                  setMessage(
                    `Ảnh chỉ rộng ${image.width}px, nên dùng ảnh ít nhất 1200px.`,
                  );
              };
              image.src = url;
            }
            setPicker(null);
          }}
        />
      )}
    </form>
  );
}
