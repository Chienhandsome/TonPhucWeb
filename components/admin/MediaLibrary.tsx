"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cmsBrowser } from "@/lib/cms/browser";
import { modules } from "@/lib/cms/config";
type Asset = {
  id: string;
  url: string;
  path: string;
  filename: string;
  created_at: string;
  bytes: number;
  pending_deletion: boolean;
};
export async function syncStorageLibrary() {
  const sb = cmsBrowser();
  const known = new Set<string>();
  for (let n = 0; ; n += 500) {
    const { data, error } = await sb
      .from("cms_media")
      .select("path")
      .range(n, n + 499);
    if (error) throw error;
    data.forEach((row) => known.add(row.path));
    if (data.length < 500) break;
  }
  const folders = [""];
  while (folders.length) {
    const prefix = folders.shift()!;
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await sb.storage
        .from("images")
        .list(prefix, {
          limit: 100,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
      if (error) throw error;
      for (const object of data) {
        const path = prefix ? `${prefix}/${object.name}` : object.name;
        if (!object.id) {
          folders.push(path);
          continue;
        }
        if (known.has(path)) continue;
        const { error: registered } = await sb.rpc("cms_media_register", {
          payload: {
            path,
            url: sb.storage.from("images").getPublicUrl(path).data.publicUrl,
            filename: object.name,
            mime_type: object.metadata?.mimetype || "application/octet-stream",
            bytes: object.metadata?.size || 0,
          },
        });
        if (registered && registered.code !== "23505") throw registered;
        known.add(path);
      }
      if (data.length < 100) break;
    }
  }
}
export async function uploadImage(file: File) {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ];
  if (!allowed.includes(file.type) || file.size > 20 * 1024 * 1024)
    throw new Error("Chỉ PNG/JPG/WebP/GIF/ICO, tối đa 20 MB.");
  const sb = cmsBrowser();
  const path = `cms/${crypto.randomUUID()}.${
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "img"
  }`;
  const { error } = await sb.storage
    .from("images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const url = sb.storage.from("images").getPublicUrl(path).data.publicUrl;
  const { error: registerError } = await sb.rpc("cms_media_register", {
    payload: {
      path,
      url,
      filename: file.name,
      mime_type: file.type,
      bytes: file.size,
    },
  });
  if (registerError)
    throw new Error(
      `Đã upload nhưng chưa đăng ký ảnh: ${registerError.message}. File: ${path}`,
    );
  return url;
}
export default function MediaLibrary({
  onSelect,
  onClose,
}: {
  onSelect?: (url: string) => void;
  onClose?: () => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]),
    [uses, setUses] = useState<Record<string, any[]>>({}),
    [query, setQuery] = useState(""),
    [unused, setUnused] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    try {
      const sb = cmsBrowser();
      await syncStorageLibrary();
      const all: Asset[] = [];
      for (let from = 0; ; from += 500) {
        const { data, error } = await sb
          .from("cms_media")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + 499);
        if (error) throw error;
        all.push(...data);
        if (data.length < 500) break;
      }
      setAssets(all);
      const usage: Record<string, any[]> = {};
      await Promise.all(
        all.map(async (a) => {
          const { data, error } = await sb.rpc("cms_media_uses", {
            asset_url: a.url,
          });
          if (error) throw error;
          usage[a.id] = data;
        }),
      );
      setUses(usage);
    } catch (e) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    let done = 0;
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file);
        done++;
      }
      setMessage(`Đã upload ${done} ảnh.`);
    } catch (e) {
      setMessage(`Đã upload ${done} ảnh. ${e.message}`);
    } finally {
      setBusy(false);
      await load();
    }
  }
  async function remove(a: Asset) {
    if (
      !confirm(
        `Xóa ảnh “${a.filename}”? Ảnh bị xóa không thể khôi phục từ thư viện.`,
      )
    )
      return;
    setBusy(true);
    try {
      const sb = cmsBrowser();
      const { error } = await sb.rpc("cms_media_delete_prepare", {
        asset_id: a.id,
      });
      if (error) throw error;
      const result = await sb.storage.from("images").remove([a.path]);
      if (result.error) {
        await sb.rpc("cms_media_delete_prepare", {
          asset_id: a.id,
          cancel: true,
        });
        throw result.error;
      }
      const finish = await sb.rpc("cms_media_delete_finish", {
        asset_id: a.id,
      });
      if (finish.error) throw finish.error;
      await load();
      setMessage("Đã xóa ảnh chưa sử dụng.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className={onSelect ? "cms-media-dialog" : "cms-media"}
      role={onSelect ? "dialog" : undefined}
      aria-modal={onSelect ? true : undefined}
      aria-label="Thư viện ảnh"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose?.();
      }}
    >
      <div className="cms-toolbar">
        <h2>Thư viện ảnh</h2>
        {onClose && <button onClick={onClose}>Đóng thư viện</button>}
      </div>
      <div className="cms-toolbar">
        <label className="cms-upload" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(!busy)upload(event.dataTransfer.files);}}>
          {busy ? "Đang xử lý…" : "Upload ảnh (chọn nhiều)"}
          <input
            aria-label="Upload ảnh"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon"
            multiple
            disabled={busy}
            onChange={(e) => upload(e.target.files)}
          />
        </label>
        <label>
          Tìm tên file
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={unused}
            onChange={(e) => setUnused(e.target.checked)}
          />{" "}
          Chỉ ảnh chưa dùng
        </label>
      </div>
      <p>
        Ảnh gốc và watermark được giữ nguyên. Ảnh trong lịch sử/thùng rác cũng
        được coi là đang dùng.
      </p>
      <p role="status">{message}</p>
      <div className="cms-media-grid">
        {assets
          .filter(
            (a) =>
              a.filename.toLowerCase().includes(query.toLowerCase()) &&
              (!unused || uses[a.id]?.length === 0),
          )
          .map((a) => (
            <article key={a.id}>
              <img src={a.url} alt={a.filename} width={200} height={150} />
              <strong>{a.filename}</strong>
              <small>
                {new Date(a.created_at).toLocaleString("vi-VN")} ·{" "}
                {Math.ceil(a.bytes / 1024)} KB
              </small>
              {(uses[a.id] || []).map((r, i) => (
                <Link
                  key={i}
                  href={`/admin/${modules.find((m) => m.kind === r.kind)?.route || "bai-viet"}?edit=${r.id}`}
                >
                  {r.title}
                  {r.source === "revision" ? " (lịch sử)" : ""}
                </Link>
              ))}
              <div className="cms-actions">
                {onSelect && (
                  <button
                    disabled={busy || a.pending_deletion}
                    onClick={() => onSelect(a.url)}
                  >
                    Chọn ảnh
                  </button>
                )}
                <button
                  className="cms-danger"
                  disabled={busy || uses[a.id]?.length > 0}
                  onClick={() => remove(a)}
                >
                  Xóa ảnh
                </button>
                {a.pending_deletion && (
                  <button
                    disabled={busy}
                    onClick={async () => {
                      await cmsBrowser().rpc("cms_media_delete_prepare", {
                        asset_id: a.id,
                        cancel: true,
                      });
                      load();
                    }}
                  >
                    Hủy trạng thái đang xóa
                  </button>
                )}
              </div>
            </article>
          ))}
      </div>
      {!assets.length && (
        <p>
          Chưa có ảnh upload. Ảnh local của web hiện tại chưa được chuyển vào
          thư viện.
        </p>
      )}
    </section>
  );
}
