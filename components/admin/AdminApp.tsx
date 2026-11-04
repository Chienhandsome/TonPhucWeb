"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cmsBrowser } from "@/lib/cms/browser";
import { getSupabase } from "@/lib/supabase";
import {
  CmsRecord,
  modules,
  normalize,
  recordWarnings,
} from "@/lib/cms/config";
import RecordEditor from "./RecordEditor";
import MediaLibrary from "./MediaLibrary";
import dynamic from "next/dynamic";
const DataTools = dynamic(() => import("./DataTools"), {
  ssr: false,
  loading: () => <p>Đang tải công cụ dữ liệu…</p>,
});
const extras = [
  ["thu-vien", "Thư viện ảnh"],
  ["thung-rac", "Thùng rác"],
  ["du-lieu", "Nhập / xuất / sao lưu"],
  ["nhat-ky", "Nhật ký"],
  ["tai-khoan", "Tài khoản"],
];
export default function AdminApp(props:{section?:string;allowRecovery?:boolean}) {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))return <section className="cms-login"><h1>Chưa cấu hình Supabase</h1><p>Thiết lập biến môi trường theo .env.example trước khi đăng nhập quản trị.</p></section>;
  return <AdminWorkspace {...props}/>;
}
function AdminWorkspace({
  section = "tong-quan",
  allowRecovery = false,
}: {
  section?: string;
  allowRecovery?: boolean;
}) {
  const router = useRouter(),
    params = useSearchParams();
  const [user, setUser] = useState<any>(null),
    [checking, setChecking] = useState(true),
    [records, setRecords] = useState<CmsRecord[]>([]),
    [editing, setEditing] = useState<Partial<CmsRecord> | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [category, setCategory] = useState(""),
    [secondary, setSecondary] = useState(""),
    [featured, setFeatured] = useState(false),
    [alpha, setAlpha] = useState(false),
    [page, setPage] = useState(1),
    [audit, setAudit] = useState<any[]>([]),
    [menu, setMenu] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [resetMode, setResetMode] = useState(false);
  const module = modules.find((m) => m.route === section);
  const [moveFrom, setMoveFrom] = useState<CmsRecord | null>(null),
    [moveTo, setMoveTo] = useState("");
  const load = useCallback(async () => {
    const sb = cmsBrowser();
    const all: CmsRecord[] = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await sb
        .from("cms_records")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, from + 499);
      if (error) throw error;
      all.push(...data);
      if (data.length < 500) break;
    }
    setRecords(all);
  }, []);
  useEffect(() => {
    const sb = cmsBrowser();
    const initialize = async () => {
      let result = await sb.auth.getUser();
      if (!result.data.user) {
        const legacy = await getSupabase()?.auth.getSession();
        if (legacy?.data.session) {
          await sb.auth.setSession({
            access_token: legacy.data.session.access_token,
            refresh_token: legacy.data.session.refresh_token,
          });
          result = await sb.auth.getUser();
          if (result.data.user) {
            const ref = new URL(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
            ).hostname.split(".")[0];
            window.localStorage.removeItem(`sb-${ref}-auth-token`);
          }
        }
      }
      const { data, error } = result;
      if (data.user?.app_metadata?.role === "admin") {
        setUser(data.user);
        try {
          await load();
        } catch (e) {
          setMessage(e.message);
        }
      } else if (data.user) {
        await sb.auth.signOut();
        setMessage("Tài khoản chưa được cấp quyền quản trị.");
      } else if (error && params.get("authError"))
        setMessage("Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
      setChecking(false);
    };
    initialize().catch((e) => {
      setMessage(e.message);
      setChecking(false);
    });
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [load]);
  useEffect(() => {
    setEditing(null);
    setPage(1);
    setQuery("");
    setStatus("");
    setCategory("");
    setSecondary("");
    setMenu(false);
  }, [section]);
  useEffect(() => {
    if (params.get("edit") && records.length) {
      const r = records.find((r) => r.id === params.get("edit"));
      if (r) setEditing(r);
    } else if (params.get("new")) setEditing({});
  }, [params, records]);
  async function action(work: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    await action(async () => {
      const sb = cmsBrowser();
      if (resetMode) {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/auth/callback`,
        });
        if (error) throw error;
        setMessage(
          "Nếu email hợp lệ, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
        );
        return;
      }
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password,
      });
      setPassword("");
      if (error) throw new Error("Email hoặc mật khẩu chưa đúng");
      if (data.user?.app_metadata?.role !== "admin") {
        await sb.auth.signOut();
        throw new Error("Tài khoản chưa được cấp quyền quản trị.");
      }
      setUser(data.user);
      await load();
      router.replace("/admin");
    });
  }
  async function trash(r: CmsRecord, operation: string) {
    if (
      !confirm(
        `${operation === "restore" ? "Khôi phục" : operation === "purge" ? "Xóa vĩnh viễn" : "Đưa vào thùng rác"} “${r.title}”?`,
      )
    )
      return;
    if (
      operation === "purge" &&
      !confirm(
        "Xác nhận lần hai: không thể hoàn tác nếu không có bản sao lưu. Ảnh vẫn giữ trong thư viện.",
      )
    )
      return;
    await action(async () => {
      const { error } = await cmsBrowser().rpc("cms_trash", {
        item_id: r.id,
        expected_version: r.version,
        operation,
      });
      if (error) throw error;
      await load();
      setMessage("Đã hoàn thành.");
    });
  }
  const active = records.filter((r) => !r.deleted_at);
  if (checking)
    return (
      <div className="cms-login">
        <h1>Quản trị Tôn Phúc</h1>
        <p>Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  if (!user)
    return (
      <div className="cms-login">
        <h1>{resetMode ? "Quên mật khẩu" : "Đăng nhập quản trị"}</h1>
        <p>Dành cho tài khoản đã được cấp quyền admin.</p>
        <form onSubmit={login}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {!resetMode && (
            <label>
              Mật khẩu
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}
          <button className="cms-primary" disabled={busy}>
            {busy
              ? "Đang xử lý…"
              : resetMode
                ? "Gửi liên kết đặt lại"
                : "Đăng nhập"}
          </button>
        </form>
        <button
          onClick={() => {
            setResetMode(!resetMode);
            setMessage("");
          }}
        >
          {resetMode ? "Trở lại đăng nhập" : "Quên mật khẩu?"}
        </button>
        <p role="alert" className="cms-error">
          {message}
        </p>
        <Link href="/">Về website</Link>
      </div>
    );
  let list = (
    section === "thung-rac"
      ? records.filter((r) => r.deleted_at)
      : active.filter((r) => r.kind === module?.kind)
  ).filter(
    (r) =>
      normalize(r.title).includes(normalize(query)) &&
      (!status || r.status === status) &&
      (!category ||
        r.data.category_id === category ||
        r.data.parent_id === category) &&
      (!secondary || r.data.secondary_category_id === secondary) &&
      (!featured || r.data.featured),
  );
  if (module?.kind === "product_category" && !query && !status && !category) {
    const rows = list;
    list = rows
      .filter((r) => !r.data.parent_id)
      .sort((a, b) => (a.data.sort_order || 0) - (b.data.sort_order || 0))
      .flatMap((r) => [r, ...rows.filter((c) => c.data.parent_id === r.id)]);
  }
  if (alpha)
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, "vi"));
  const pages = Math.max(1, Math.ceil(list.length / 20));
  const current = Math.min(page, pages);
  return (
    <div className="cms-root">
      <header className="cms-header">
        <Link href="/admin">TÔN PHÚC · Quản trị</Link>
        <button
          className="cms-menu"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          Menu quản trị
        </button>
        <span>{user.email}</span>
        <button
          onClick={() =>
            action(async () => {
              await cmsBrowser().auth.signOut();
              setUser(null);
              router.replace("/admin");
            })
          }
        >
          Đăng xuất
        </button>
      </header>
      <div className="cms-layout">
        <nav
          className={`cms-sidebar ${menu ? "is-open" : ""}`}
          aria-label="Quản trị"
        >
          <Link
            className={section === "tong-quan" ? "active" : ""}
            href="/admin"
          >
            Tổng quan
          </Link>
          {modules
            .filter((m) => m.kind !== "slider_settings")
            .map((m) => (
              <Link
                key={m.kind}
                className={section === m.route ? "active" : ""}
                href={`/admin/${m.route}`}
              >
                {m.label}
              </Link>
            ))}
          {extras.map(([path, label]) => (
            <Link
              key={path}
              className={section === path ? "active" : ""}
              href={`/admin/${path}`}
            >
              {label}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noreferrer">
            Xem web công khai ↗
          </a>
        </nav>
        <div className="cms-workspace">
          <p role="status" className="cms-error">
            {message}
          </p>
          {section === "tong-quan" ? (
            <>
              <h1>Tổng quan</h1>
              <div className="cms-stats">
                {[
                  ["product", "Sản phẩm"],
                  ["article", "Bài viết"],
                  ["product_category", "Danh mục sản phẩm"],
                ].map(([kind, label]) => (
                  <Link
                    key={kind}
                    href={`/admin/${modules.find((m) => m.kind === kind)?.route}`}
                  >
                    <strong>
                      {active.filter((r) => r.kind === kind).length}
                    </strong>
                    {label}
                  </Link>
                ))}
                <Link href="/admin/bai-viet">
                  <strong>
                    {active.filter((r) => r.status === "draft").length}
                  </strong>
                  Bản nháp
                </Link>
                <Link href="/admin/san-pham">
                  <strong>
                    {
                      active.filter(
                        (r) =>
                          ["product", "article"].includes(r.kind) &&
                          !r.data.image,
                      ).length
                    }
                  </strong>
                  Thiếu ảnh
                </Link>
              </div>
              <p className="cms-note">
                Số liệu database CMS mới, chưa gồm snapshot JSON/web cũ. Chưa
                chuyển dữ liệu hàng loạt.
              </p>
              <div className="cms-actions">
                <Link className="cms-button" href="/admin/san-pham?new=1">
                  Thêm sản phẩm
                </Link>
                <Link className="cms-button" href="/admin/bai-viet?new=1">
                  Thêm bài viết
                </Link>
                <Link className="cms-button" href="/admin/banner?new=1">
                  Thêm banner
                </Link>
              </div>
              <h2>Mới sửa gần nhất</h2>
              {active
                .filter((r) => ["product", "article"].includes(r.kind))
                .slice(0, 10)
                .map((r) => (
                  <p key={r.id}>
                    <Link
                      href={`/admin/${modules.find((m) => m.kind === r.kind)?.route}?edit=${r.id}`}
                    >
                      {r.title}
                    </Link>{" "}
                    · {r.kind === "product" ? "Sản phẩm" : "Bài viết"} ·{" "}
                    {new Date(r.updated_at).toLocaleString("vi-VN")}
                  </p>
                ))}
              <h2>Cần xử lý</h2>
              {active
                .filter((r) => recordWarnings(r).length)
                .map((r) => (
                  <p key={r.id}>
                    <Link
                      href={`/admin/${modules.find((m) => m.kind === r.kind)?.route}?edit=${r.id}`}
                    >
                      {r.title}: {recordWarnings(r).join(", ")}
                    </Link>
                  </p>
                ))}
              {active
                .filter(
                  (r) =>
                    ["product_category", "article_category"].includes(r.kind) &&
                    !active.some(
                      (p) =>
                        p.data.category_id === r.id ||
                        p.data.secondary_category_id === r.id,
                    ),
                )
                .map((r) => (
                  <p key={r.id}>
                    <Link
                      href={`/admin/${modules.find((m) => m.kind === r.kind)?.route}?edit=${r.id}`}
                    >
                      Danh mục trống: {r.title}
                    </Link>
                  </p>
                ))}
            </>
          ) : section === "thu-vien" ? (
            <MediaLibrary />
          ) : section === "du-lieu" ? (
            <DataTools records={records} onDone={load} />
          ) : section === "tai-khoan" ? (
            <Account
              reset={allowRecovery && params.get("reset") === "1"}
              onLogout={() => setUser(null)}
            />
          ) : section === "nhat-ky" ? (
            <>
              <h1>Nhật ký thay đổi</h1>
              <button
                onClick={() =>
                  action(async () => {
                    const { data, error } = await cmsBrowser()
                      .from("cms_audit")
                      .select("*")
                      .order("created_at", { ascending: false })
                      .limit(200);
                    if (error) throw error;
                    setAudit(data || []);
                  })
                }
              >
                Tải 200 sự kiện gần nhất
              </button>
              <div className="cms-list">
                {audit.map((a) => (
                  <article key={a.id}>
                    <strong>{a.title || "Dữ liệu hệ thống"}</strong>
                    <p>
                      {a.action} ·{" "}
                      {new Date(a.created_at).toLocaleString("vi-VN")}
                    </p>
                    <small>Tài khoản: {a.actor || "Tác vụ hệ thống"}</small>
                  </article>
                ))}
              </div>
            </>
          ) : editing && module ? (
            <RecordEditor
              key={editing.id || "new"}
              module={module}
              record={editing}
              records={records}
              onDone={() => {
                setEditing(null);
                router.replace(`/admin/${section}`);
                load().catch((e) => setMessage(e.message));
              }}
            />
          ) : module || section === "thung-rac" ? (
            <>
              <div className="cms-toolbar">
                <h1>{module?.label || "Thùng rác (30 ngày)"}</h1>
                {module && (
                  <button
                    className="cms-primary"
                    onClick={() =>
                      setEditing(
                        module.singleton
                          ? active.find((r) => r.kind === module.kind) || {}
                          : {},
                      )
                    }
                  >
                    {module.singleton ? "Sửa cấu hình" : "Thêm mới"}
                  </button>
                )}
                {module?.kind === "slider" && (
                  <Link href="/admin/cai-dat-slider">Cài đặt tự chuyển</Link>
                )}
                {module?.kind === "product" && (
                  <Link href="/admin/du-lieu">Xuất CSV / JSON</Link>
                )}
              </div>
              {moveFrom && (
                <section className="cms-note">
                  <h2>Chuyển nội dung từ {moveFrom.title}</h2>
                  <label>
                    Danh mục đích
                    <select
                      value={moveTo}
                      onChange={(e) => setMoveTo(e.target.value)}
                    >
                      <option value="">Chọn danh mục</option>
                      {active
                        .filter(
                          (c) =>
                            c.kind === moveFrom.kind && c.id !== moveFrom.id,
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="cms-actions">
                    <button
                      disabled={busy || !moveTo}
                      onClick={() =>
                        action(async () => {
                          const { data, error } = await cmsBrowser().rpc(
                            "cms_move_category",
                            { source_id: moveFrom.id, destination_id: moveTo },
                          );
                          if (error) throw error;
                          setMoveFrom(null);
                          await load();
                          setMessage(`Đã chuyển ${data} nội dung.`);
                        })
                      }
                    >
                      Xác nhận chuyển toàn bộ
                    </button>
                    <button onClick={() => setMoveFrom(null)}>Hủy</button>
                  </div>
                </section>
              )}
              <div className="cms-filters">
                <label>
                  Tìm không dấu
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <label>
                  Trạng thái
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="draft">Nháp</option>
                    <option value="published">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </label>
                {["product", "article"].includes(module?.kind) && (
                  <label>
                    Danh mục
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSecondary("");
                        setPage(1);
                      }}
                    >
                      <option value="">Tất cả</option>
                      {active
                        .filter(
                          (r) =>
                            r.kind ===
                              (module.kind === "product"
                                ? "product_category"
                                : "article_category") && !r.data.parent_id,
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                {module?.kind === "product" && (
                  <label>
                    Danh mục cấp 2
                    <select
                      value={secondary}
                      onChange={(e) => {
                        setSecondary(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">Tất cả</option>
                      {active
                        .filter(
                          (r) =>
                            r.kind === "product_category" &&
                            r.data.parent_id &&
                            (!category || r.data.parent_id === category),
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      setPage(1);
                    }}
                  />{" "}
                  Nổi bật
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={alpha}
                    onChange={(e) => setAlpha(e.target.checked)}
                  />{" "}
                  Tên A–Z
                </label>
              </div>
              <div className="cms-list">
                {list.slice((current - 1) * 20, current * 20).map((r) => (
                  <article
                    key={r.id}
                    className={r.data.parent_id ? "cms-child" : ""}
                  >
                    {r.data.image && (
                      <img src={r.data.image} alt="" width={80} height={70} />
                    )}
                    <div>
                      <strong>{r.title}</strong>
                      <p>
                        {r.status === "published"
                          ? "Hiển thị"
                          : r.status === "draft"
                            ? "Nháp"
                            : "Ẩn"}{" "}
                        {r.data.featured ? "· Nổi bật" : ""} ·{" "}
                        {new Date(r.updated_at).toLocaleString("vi-VN")}
                      </p>
                      <small>{r.slug}</small>
                      <p>
                        {[
                          r.data.category_id,
                          r.data.secondary_category_id,
                          r.data.parent_id,
                        ]
                          .filter(Boolean)
                          .map((id) => active.find((c) => c.id === id)?.title)
                          .join(" / ")}
                      </p>
                      {["product_category", "article_category", "tag"].includes(
                        r.kind,
                      ) && (
                        <p>
                          {
                            active.filter(
                              (p) =>
                                p.data.category_id === r.id ||
                                p.data.secondary_category_id === r.id ||
                                (p.data.tag_ids || []).includes(r.id),
                            ).length
                          }{" "}
                          nội dung đang dùng
                        </p>
                      )}
                      {recordWarnings(r).map((w) => (
                        <span className="cms-badge" key={w}>
                          {w}
                        </span>
                      ))}
                    </div>
                    <div className="cms-actions">
                      {r.deleted_at ? (
                        <>
                          <span>
                            Đã xóa:{" "}
                            {new Date(r.deleted_at).toLocaleDateString("vi-VN")}
                            {Date.now() - new Date(r.deleted_at).getTime() >
                            30 * 86400000
                              ? " · Quá 30 ngày, đang chờ xóa thủ công"
                              : ""}
                          </span>
                          <button
                            disabled={busy}
                            onClick={() => trash(r, "restore")}
                          >
                            Khôi phục
                          </button>
                          <button
                            className="cms-danger"
                            disabled={busy}
                            onClick={() => trash(r, "purge")}
                          >
                            Xóa vĩnh viễn
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditing(r);
                              router.replace(`/admin/${section}`);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              action(async () => {
                                const { error } = await cmsBrowser().rpc(
                                  "cms_save",
                                  {
                                    payload: {
                                      ...r,
                                      status:
                                        r.status === "published"
                                          ? "hidden"
                                          : "published",
                                    },
                                  },
                                );
                                if (error) throw error;
                                await load();
                              })
                            }
                          >
                            {r.status === "published" ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            className="cms-danger"
                            disabled={busy}
                            onClick={() => trash(r, "trash")}
                          >
                            Thùng rác
                          </button>
                          {["product_category", "article_category"].includes(
                            r.kind,
                          ) && (
                            <button
                              onClick={() => {
                                setMoveFrom(r);
                                setMoveTo("");
                              }}
                            >
                              Chuyển nội dung
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {!list.length && (
                <p>
                  Chưa có dữ liệu phù hợp. Các mục tĩnh/ảnh hệ thống có thể thêm
                  bằng đúng vị trí trong form.
                </p>
              )}
              <div className="cms-pagination">
                <button
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  Trang trước
                </button>
                <span>
                  Trang {current} / {pages}, tổng {list.length} mục
                </span>
                <button
                  disabled={current === pages}
                  onClick={() => setPage(current + 1)}
                >
                  Trang sau
                </button>
              </div>
            </>
          ) : (
            <h1>Không tìm thấy mục quản trị</h1>
          )}
        </div>
      </div>
    </div>
  );
}
function Account({
  reset,
  onLogout,
}: {
  reset: boolean;
  onLogout: () => void;
}) {
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [again, setAgain] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section>
      <h1>{reset ? "Đặt lại mật khẩu" : "Tài khoản"}</h1>
      <p>Bạn tự nhập mật khẩu ở đây. Đổi xong phải đăng nhập lại.</p>
      <form
        className="cms-account"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            if (next.length < 8 || next !== again)
              throw new Error(
                "Mật khẩu mới cần ít nhất 8 ký tự và hai lần nhập phải khớp.",
              );
            const sb = cmsBrowser();
            const { data } = await sb.auth.getUser();
            if (!reset) {
              const { error } = await sb.auth.signInWithPassword({
                email: data.user.email,
                password: current,
              });
              if (error) throw new Error("Mật khẩu hiện tại chưa đúng");
            }
            const { error } = await sb.auth.updateUser({ password: next });
            if (error) throw error;
            await fetch('/admin/auth/recovery-complete',{method:'POST'});
            await sb.auth.signOut();
            onLogout();
          } catch (e) {
            setMessage(e.message);
          } finally {
            setCurrent("");
            setNext("");
            setAgain("");
            setBusy(false);
          }
        }}
      >
        {!reset && (
          <label>
            Mật khẩu hiện tại
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Mật khẩu mới
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </label>
        <label>
          Nhập lại mật khẩu mới
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            required
          />
        </label>
        <button disabled={busy} className="cms-primary">
          Lưu mật khẩu và đăng xuất
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
