import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <article>
      <Link href="/" className="text-sm text-brand-700">← Trang chủ</Link>
      {post.category_name && (
        <p className="mt-3 text-sm font-medium text-brand-700">
          <Link href={`/chuyen-muc/${post.category_slug}`}>{post.category_name}</Link>
        </p>
      )}
      <h1 className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">{post.title}</h1>
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} className="mt-4 w-full rounded-xl object-cover" />
      )}
      <div className="mt-4 whitespace-pre-wrap rounded-xl border bg-white p-5 text-base leading-relaxed text-slate-800">
        {post.content ?? post.excerpt ?? "Nội dung đang được cập nhật."}
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Cần tư vấn về dòng gas phù hợp? Xem trang <Link href="/lien-he" className="text-brand-700 underline">Liên hệ</Link>.
      </p>
    </article>
  );
}
