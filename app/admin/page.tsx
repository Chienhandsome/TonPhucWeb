"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/seed";

type PostRow = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  published: boolean;
};

type CategoryRow = { id: string; name: string; slug: string };

const EMPTY_POST: PostRow = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: null,
  category_id: null,
  published: false,
};

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key);
}

export default function AdminPage() {
  const [sb] = useState<SupabaseClient | null>(() => getClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<PostRow>(EMPTY_POST);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [catName, setCatName] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!sb) return;
    const [{ data: p }, { data: c }] = await Promise.all([
      sb.from("posts").select("*").order("created_at", { ascending: false }),
      sb.from("categories").select("*").order("name"),
    ]);
    setPosts(p ?? []);
    setCategories((c as CategoryRow[]) ?? []);
  }, [sb]);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user?.app_metadata?.role === "admin") setUserEmail(user.email ?? null);
      else if (user) setMessage("Tài khoản chưa được cấp quyền quản trị. Liên hệ người quản lý website.");
    });
    load();
  }, [sb, load]);

  if (!sb) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Trang quản trị</h1>
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa cấu hình Supabase. Sao chép .env.example thành .env.local, điền NEXT_PUBLIC_SUPABASE_URL và
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY thật, chạy SQL trong supabase/schema.sql rồi tải lại trang này.
          Tài khoản admin tạo trong Supabase Auth (Authentication → Users → Add user), không tạo tài khoản trong code.
        </p>
      </div>
    );
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { data, error } = await sb!.auth.signInWithPassword({ email, password });
    if (error) setMessage(`Đăng nhập thất bại: ${error.message}`);
    else if (data.user?.app_metadata?.role !== "admin") {
      await sb!.auth.signOut();
      setUserEmail(null);
      setMessage("Tài khoản chưa được cấp quyền quản trị. Liên hệ người quản lý website.");
    } else {
      setUserEmail(data.user?.email ?? null);
      await load();
    }
  }

  async function logout() {
    await sb!.auth.signOut();
    setUserEmail(null);
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    if (!payload.title || !payload.slug) {
      setMessage("Cần nhập tiêu đề và slug.");
      return;
    }
    const { error } = editingId
      ? await sb!.from("posts").update(payload).eq("id", editingId)
      : await sb!.from("posts").insert(payload);
    if (error) setMessage(`Lưu thất bại: ${error.message}`);
    else {
      setMessage("Đã lưu bài viết.");
      setForm(EMPTY_POST);
      setEditingId(null);
      await load();
    }
  }

  async function removePost(id: string) {
    if (!confirm("Xóa bài viết này? Hành động này không hoàn tác được.")) return;
    const { error } = await sb!.from("posts").delete().eq("id", id);
    if (error) setMessage(`Xóa thất bại: ${error.message}`);
    else await load();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    const { error } = await sb!.from("categories").insert({ name: catName.trim(), slug: slugify(catName) });
    if (error) setMessage(`Thêm chuyên mục thất bại: ${error.message}`);
    else {
      setCatName("");
      await load();
    }
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setMessage("");
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "images";
    const path = `covers/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await sb!.storage.from(bucket).upload(path, file);
    if (error) {
      setMessage(`Upload ảnh thất bại: ${error.message}`);
    } else {
      const { data } = sb!.storage.from(bucket).getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image: data.publicUrl }));
      setMessage("Đã upload ảnh bìa. Nhớ bấm Lưu bài viết.");
    }
    setUploading(false);
  }

  if (!userEmail) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-slate-600">
          Đăng nhập bằng tài khoản đã được cấp quyền quản trị website.
        </p>
        <form onSubmit={login} className="mt-4 space-y-3 rounded-xl border bg-white p-5">
          <label className="block text-sm font-medium">Email
            <input className="mt-1 w-full rounded border px-3 py-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Mật khẩu
            <input className="mt-1 w-full rounded border px-3 py-2" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="w-full rounded bg-brand-700 px-4 py-2 font-semibold text-white" type="submit">Đăng nhập</button>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quản trị bài viết</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{userEmail}</span>
          <button onClick={logout} className="rounded border px-3 py-1.5">Đăng xuất</button>
        </div>
      </div>
      {message && <p className="mt-3 rounded bg-brand-50 px-4 py-2 text-sm text-brand-800">{message}</p>}

      <form onSubmit={savePost} className="mt-5 space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">{editingId ? "Sửa bài viết" : "Bài viết mới"}</h2>
        <label className="block text-sm font-medium">Tiêu đề
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} required />
        </label>
        <label className="block text-sm font-medium">Slug (đường link, ví dụ: gas-r32-co-doc-khong)
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium">Chuyên mục
          <select className="mt-1 w-full rounded border px-3 py-2" value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}>
            <option value="">— Chưa chọn —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Mô tả ngắn
          <textarea className="mt-1 w-full rounded border px-3 py-2" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">Nội dung bài viết
          <textarea className="mt-1 w-full rounded border px-3 py-2" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">Ảnh bìa
          <input className="mt-1 w-full" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
        </label>
        {form.cover_image && <p className="break-all text-sm text-slate-600">Ảnh hiện tại: {form.cover_image}</p>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Đã xuất bản (bỏ tick để lưu nháp, khách chưa thấy)
        </label>
        <div className="flex gap-2">
          <button className="rounded bg-brand-700 px-4 py-2 font-semibold text-white" type="submit" disabled={uploading}>{uploading ? "Đang upload..." : "Lưu bài viết"}</button>
          {editingId && <button type="button" className="rounded border px-4 py-2" onClick={() => { setForm(EMPTY_POST); setEditingId(null); }}>Hủy sửa</button>}
        </div>
      </form>

      <form onSubmit={addCategory} className="mt-5 flex flex-wrap items-end gap-2 rounded-xl border bg-white p-5">
        <label className="flex-1 text-sm font-medium">Thêm chuyên mục mới
          <input className="mt-1 w-full rounded border px-3 py-2" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ví dụ: Khuyến mãi" />
        </label>
        <button className="rounded bg-slate-800 px-4 py-2 text-white" type="submit">Thêm</button>
      </form>

      <h2 className="mt-8 font-semibold">Danh sách bài viết ({posts.length})</h2>
      <ul className="mt-3 space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded border bg-white px-4 py-3">
            <span className="text-sm"><span className="font-medium">{p.title}</span> <span className="text-slate-500">({p.published ? "Đã xuất bản" : "Nháp"} · /bai-viet/{p.slug})</span></span>
            <span className="flex gap-2">
              <button className="rounded border px-3 py-1 text-sm" onClick={() => { setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "", cover_image: p.cover_image, category_id: p.category_id, published: p.published }); setEditingId(p.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Sửa</button>
              <button className="rounded border border-red-200 px-3 py-1 text-sm text-red-600" onClick={() => removePost(p.id)}>Xóa</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
