import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getCategories, getPublishedPosts } from "@/lib/posts";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);
  const category = categories.find((c) => c.slug === params.slug);
  const filtered = posts.filter((p) => p.category_slug === params.slug);
  return (
    <div>
      <Link href="/" className="text-sm text-brand-700">← Trang chủ</Link>
      <h1 className="mt-2 text-2xl font-bold">{category?.name ?? "Chuyên mục"}</h1>
      <p className="mt-1 text-sm text-slate-600">{filtered.length} bài viết.</p>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded border bg-white p-4 text-sm text-slate-600">Chưa có bài viết nào trong chuyên mục này. Thêm bài trong trang Admin, nhớ chọn đúng chuyên mục và bật “Đã xuất bản”.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
      )}
    </div>
  );
}
