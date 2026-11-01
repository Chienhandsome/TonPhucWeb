import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-brand-50 px-4 text-center text-sm text-brand-800">
          {post.category_name ?? "Bài viết"}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/bai-viet/${post.slug}`} className="hover:text-brand-700">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>}
        <Link href={`/bai-viet/${post.slug}`} className="mt-3 inline-block text-sm font-medium text-brand-700">Xem thêm →</Link>
      </div>
    </article>
  );
}
