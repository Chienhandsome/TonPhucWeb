import { pageMetadata } from "@/lib/seo";
import { publicRecord } from "./public";
export async function cmsMetadata(kind: string, slug: string, path: string) {
  const r = await publicRecord(kind, slug);
  if (!r) return null;
  const base = pageMetadata({
    title: r.data.seo_title || r.title,
    description: r.data.seo_description || r.data.excerpt || r.title,
    path,
    image: r.data.image,
    type:kind==='article'?'article':'website',
  });
  const description = r.data.seo_description;
  return {
    ...base,
    keywords: r.data.seo_keywords || "",
    ...(description
      ? {
          description,
          openGraph: { ...base.openGraph, description },
          twitter: { ...base.twitter, description },
        }
      : {}),
  };
}
