import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { getSupabase } from "@/lib/supabase";

const GAS_LINES = ["R22", "R32", "R410A", "R507", "R407C"];
const BRANDS = ["Honeywell", "Chemours", "Floron", "Refron"];

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);
  const usingSeed = !getSupabase();
  return (
    <div>
      <section className="rounded-2xl bg-brand-700 px-6 py-8 text-white">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">Gas Lạnh Tôn Phúc — Đại lý gas lạnh tại TP.HCM</h1>
        <p className="mt-3 max-w-2xl text-brand-50">
          Giới thiệu các dòng gas lạnh và vật tư điện lạnh cho khách dân dụng và công nghiệp.
          Khách xem bài viết rồi liên hệ trực tiếp — website này không có giỏ hàng hay thanh toán.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {GAS_LINES.map((g) => (
            <span key={g} className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">{g}</span>
          ))}
        </div>
        <p className="mt-3 text-sm text-brand-100">Các hãng: {BRANDS.join(", ")}.</p>
        <Link href="/lien-he" className="mt-5 inline-block rounded bg-white px-4 py-2 text-sm font-semibold text-brand-800">Liên hệ ngay →</Link>
      </section>

      {usingSeed && (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Đang hiển thị dữ liệu mẫu (11 tiêu đề từ trang chủ cũ). Khi đã cấu hình Supabase và chuyển nội dung thật từ admin, trang này sẽ tự hiển thị bài thật.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold">Chuyên mục</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c.slug} href={`/chuyen-muc/${c.slug}`} className="rounded-full border bg-white px-3 py-1.5 text-sm hover:border-brand-600 hover:text-brand-700">{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Bài viết mới</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
      </section>
    </div>
  );
}
