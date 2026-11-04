"use client";
import { useState } from "react";
import JSZip from "jszip";
import { csvRecords, parseCsvRecords } from "@/lib/cms/transfer";
import { cmsBrowser } from "@/lib/cms/browser";
import { CmsRecord, modules, publicationErrors } from "@/lib/cms/config";
import { uploadImage, syncStorageLibrary } from "./MediaLibrary";
const download = (name: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const json = (data: any) =>
  new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
async function snapshot() {
  const { data, error } = await cmsBrowser().rpc("cms_snapshot");
  if (error) throw error;
  return data;
}

export default function DataTools({
  records,
  onDone,
}: {
  records: CmsRecord[];
  onDone: () => void;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [items, setItems] = useState<any[]>([]),
    [errors, setErrors] = useState<string[]>([]),
    [skip, setSkip] = useState(false),
    [backup, setBackup] = useState<{ zip: JSZip; manifest: any } | null>(null);
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await task();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function exportFile(type: "json" | "csv") {
    await run(async () => {
      const current = await snapshot();
      const rows = current.records as CmsRecord[];
      const { error } = await cmsBrowser().rpc("cms_event", {
        event_action: "export",
        event_detail: { format: type, count: rows.length },
      });
      if (error) throw error;
      download(
        `tonphuc-data-${new Date().toISOString().slice(0, 10)}.${type}`,
        type === "json"
          ? json({ format: "tonphuc-cms", version: 1, records: rows })
          : new Blob(["\uFEFF" + csvRecords(rows)], {
              type: "text/csv;charset=utf-8",
            }),
      );
      setMessage(`Đã xuất ${rows.length} bản ghi, gồm cả nháp/thùng rác.`);
    });
  }
  async function fullBackup() {
    await run(async () => {
      await syncStorageLibrary();
      const sb = cmsBrowser();
      const archive = await snapshot();
      const assets = archive.media;
      const currentRecords = archive.records as CmsRecord[];
      const revisions = archive.revisions;
      const audit = archive.audit;
      const legacyPosts = archive.legacy.posts;
      const legacyCategories = archive.legacy.categories;
      const zip = new JSZip();
      const manifest = {
        version: 1,
        created_at: new Date().toISOString(),
        files: [] as any[],
      };
      let total = 0;
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const usage = [
          ...currentRecords
            .filter((r) => JSON.stringify(r.data).includes(asset.url))
            .map((r) => ({
              id: r.id,
              title: r.title,
              kind: r.kind,
              source: "current",
            })),
          ...revisions
            .filter((r) => JSON.stringify(r.snapshot).includes(asset.url))
            .map((r) => ({ id: r.record_id, source: "revision" })),
          ...legacyPosts
            .filter((r) => JSON.stringify(r).includes(asset.url))
            .map((r) => ({
              id: r.id,
              title: r.title,
              kind: "legacy_article",
              source: "current",
            })),
        ];
        if (!usage.length) continue;
        total += Number(asset.bytes);
        if (total > 200 * 1024 * 1024)
          throw new Error(
            "Ảnh tham chiếu vượt 200 MB. Cần tác vụ sao lưu streaming riêng; không tạo ZIP thiếu ảnh.",
          );
        setMessage(`Đang sao lưu ảnh ${i + 1}/${assets.length}…`);
        const { data: blob, error: de } = await sb.storage
          .from("images")
          .download(asset.path);
        if (de) throw de;
        const bytes = await blob.arrayBuffer();
        const sha = Array.from(
          new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const file = `images/${asset.id}.${asset.filename.split(".").pop() || "img"}`;
        zip.file(file, bytes);
        manifest.files.push({ ...asset, file, sha256: sha, usage });
      }
      zip.file(
        "data.json",
        JSON.stringify({
          format: "tonphuc-cms",
          version: 1,
          records: currentRecords,
          revisions,
          audit,
          legacy: { posts: legacyPosts, categories: legacyCategories },
        }),
      );
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      const result = await sb.rpc("cms_event", {
        event_action: "backup",
        event_detail: {
          records: currentRecords.length,
          images: manifest.files.length,
        },
      });
      if (result.error) throw result.error;
      download(
        `tonphuc-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`,
        await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
      );
      setMessage(
        "Đã tạo ZIP dữ liệu và ảnh tham chiếu; giữ file ở nơi an toàn.",
      );
    });
  }
  function validate(rows: any[]) {
    const issue: string[] = [];
    const seen = new Set<string>();
    rows.forEach((r, i) => {
      const prefix = `Dòng ${i + 1}`;
      if (!r || typeof r !== "object" || Array.isArray(r)) {
        issue.push(`${prefix}: bản ghi không hợp lệ`);
        return;
      }
      if (!modules.some((m) => m.kind === r.kind))
        issue.push(`${prefix}: loại nội dung không hợp lệ`);
      if (typeof r.title !== "string" || !r.title.trim())
        issue.push(`${prefix}: thiếu tiêu đề`);
      if (!r.slug) issue.push(`${prefix}: thiếu slug`);
      const key = r.kind + ":" + r.slug;
      if (seen.has(key)) issue.push(`${prefix}: trùng slug trong file`);
      seen.add(key);
      try {
        if (r.data?.schema_json) JSON.parse(r.data.schema_json);
      } catch {
        issue.push(`${prefix}: Schema JSON sai`);
      }
      if (r.status === "published" && typeof r.title === "string")
        publicationErrors({ ...r, data: r.data || {} }).forEach((e) =>
          issue.push(`${prefix}: ${e}`),
        );
    });
    return issue;
  }
  async function read(file?: File) {
    if (!file) return;
    await run(async () => {
      setBackup(null);
      setItems([]);
      setErrors([]);
      let rows: any[];
      if (file.name.endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        const manifest = JSON.parse(
          await zip.file("manifest.json")!.async("string"),
        );
        const data = JSON.parse(await zip.file("data.json")!.async("string"));
        if (manifest.version !== 1 || data.version !== 1)
          throw new Error("Phiên bản ZIP không hỗ trợ");
        setBackup({ zip, manifest });
        rows = data.records;
      } else if (file.name.endsWith(".csv")) {
        rows = parseCsvRecords(await file.text());
      } else {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data) && data.version !== 1)
          throw new Error("Phiên bản JSON không hỗ trợ");
        rows = Array.isArray(data) ? data : data.records;
      }
      if (!Array.isArray(rows) || rows.length > 500)
        throw new Error(
          "Mỗi lượt tối đa 500 bản ghi, không cắt ngầm file lớn.",
        );
      setItems(rows);
      setErrors(validate(rows));
      setMessage(`Đã đọc ${rows.length} bản ghi. Chưa ghi vào database.`);
    });
  }
  async function importData() {
    await run(async () => {
      if (!confirm("Nhập dữ liệu đã kiểm tra? Không tự xóa dữ liệu hiện có."))
        return;
      let rows = items.map((r, index) => ({
        ...r,
        data: { ...r.data },
        _line: index + 1,
      }));
      let archive: any = null;
      if (backup) {
        if (records.length)
          throw new Error(
            "Khôi phục ZIP chỉ cho database CMS trống để tránh ghi đè. Dùng nhập JSON/CSV để nhập có chọn lọc.",
          );
        archive = JSON.parse(
          await backup.zip.file("data.json")!.async("string"),
        );
        const mapping: Record<string, string> = {};
        for (const f of backup.manifest.files) {
          const bytes = await backup.zip.file(f.file)?.async("arraybuffer");
          if (!bytes) throw new Error(`Thiếu ảnh: ${f.file}`);
          const sha = Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          )
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          if (sha !== f.sha256) throw new Error(`Checksum ảnh sai: ${f.file}`);
          mapping[f.url] = await uploadImage(
            new File([bytes], f.filename, { type: f.mime_type }),
          );
        }
        let serialized = JSON.stringify(archive);
        for (const [from, to] of Object.entries(mapping))
          serialized = serialized.split(from).join(to);
        archive = JSON.parse(serialized);
        rows = archive.records;
      }
      const sb = cmsBrowser();
      let done = 0;
      const report: string[] = [];
      rows.sort((a, b) => {
        const rank = (r: any) =>
          ["product_category", "article_category", "tag"].includes(r.kind)
            ? r.data?.parent_id
              ? 1
              : 0
            : 2;
        return rank(a) - rank(b);
      });
      if (skip && !backup) {
        for (let i = 0; i < rows.length; i++) {
          const item = rows[i];
          const { error } = await sb.rpc("cms_import", { items: [item] });
          if (error)
            report.push(
              `Dòng ${item._line || i + 1} (${item.title}): ${error.message}`,
            );
          else done++;
        }
      } else {
        if (errors.length)
          throw new Error("Sửa các lỗi trước khi nhập toàn bộ.");
        const { data, error } = backup
          ? await sb.rpc("cms_restore", { archive })
          : await sb.rpc("cms_import", { items: rows });
        if (error) throw error;
        done = data;
      }
      const { error } = await sb.rpc("cms_event", {
        event_action: backup ? "restore" : "import",
        event_detail: { success: done, failed: report.length },
      });
      if (error) throw error;
      setErrors(report);
      setMessage(
        `Đã nhập ${done}; lỗi/bỏ qua ${report.length}. ${backup ? "Ảnh đã được nối lại theo manifest." : ""}`,
      );
      onDone();
    });
  }
  return (
    <section>
      <h2>Xuất, nhập và sao lưu</h2>
      <p>
        Xuất CSV/JSON chứa URL ảnh. ZIP chứa cả ảnh được sử dụng. Chưa chuyển dữ
        liệu từ web cũ.
      </p>
      <div className="cms-actions">
        <button disabled={busy} onClick={() => exportFile("json")}>
          Xuất toàn bộ JSON
        </button>
        <button disabled={busy} onClick={() => exportFile("csv")}>
          Xuất toàn bộ CSV
        </button>
        <button disabled={busy} onClick={fullBackup}>
          Tải sao lưu đầy đủ ZIP
        </button>
        <button
          onClick={() =>
            download(
              "tonphuc-template.json",
              json({
                format: "tonphuc-cms",
                version: 1,
                records: [
                  {
                    kind: "product",
                    title: "",
                    slug: "",
                    status: "draft",
                    data: {},
                  },
                ],
              }),
            )
          }
        >
          Tải mẫu JSON
        </button>
        <button
          onClick={() =>
            download(
              "tonphuc-template.csv",
              new Blob(
                [
                  "\uFEFF" +
                    csvRecords([
                      {
                        kind: "product",
                        title: "",
                        slug: "",
                        status: "draft",
                        data: {},
                      },
                    ]),
                ],
                { type: "text/csv;charset=utf-8" },
              ),
            )
          }
        >
          Tải mẫu CSV
        </button>
      </div>
      <div className="cms-note">
        Khôi phục ZIP v1 gồm bản ghi, lịch sử, nhật ký và ảnh. Chỉ thực hiện vào
        CMS trống; không ghi đè bảng cũ đã có. Kiểm tra ZIP ở môi trường riêng
        trước mỗi đợt thay đổi lớn.
      </div>
      <label>
        Chọn file CSV / JSON / ZIP
        <input
          type="file"
          accept=".csv,.json,.zip"
          disabled={busy}
          onChange={(e) => read(e.target.files?.[0])}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={skip}
          disabled={!!backup}
          onChange={(e) => setSkip(e.target.checked)}
        />{" "}
        Bỏ qua dòng lỗi (không áp dụng ZIP)
      </label>
      <button
        disabled={busy || !items.length || (!skip && errors.length > 0)}
        onClick={importData}
      >
        {busy ? "Đang xử lý…" : `Nhập ${items.length} bản ghi`}
      </button>
      <pre role="status" className="cms-report">
        {message}
      </pre>
      {errors.length > 0 && (
        <ul className="cms-error">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
