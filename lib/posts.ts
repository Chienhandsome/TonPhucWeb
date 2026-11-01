import { getSupabase } from "./supabase";
import { SEED_CATEGORIES, SEED_POSTS, type SeedPost } from "./seed";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  category_slug?: string | null;
  category_name?: string | null;
  published: boolean;
  created_at?: string | null;
};

export type Category = { id: string; slug: string; name: string };

function seedToPost(p: SeedPost, index: number): Post {
  const cat = SEED_CATEGORIES.find((c) => c.slug === p.categorySlug);
  return {
    id: `seed-${index + 1}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.excerpt,
    cover_image: p.coverImage,
    category_id: cat ? cat.slug : null,
    category_slug: p.categorySlug,
    category_name: p.category,
    published: true,
  };
}

/** Lấy bài đã xuất bản. Chưa cấu hình Supabase thì trả về seed mẫu. */
export async function getPublishedPosts(): Promise<Post[]> {
  const sb = getSupabase();
  if (!sb) return SEED_POSTS.map(seedToPost);
  const { data, error } = await sb
    .from("posts")
    .select("*, categories!posts_category_id_fkey(slug, name)")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return SEED_POSTS.map(seedToPost);
  return (data as any[]).map((row) => ({
    ...row,
    category_slug: row.categories?.slug ?? null,
    category_name: row.categories?.name ?? null,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const sb = getSupabase();
  if (!sb) return SEED_CATEGORIES.map((c) => ({ id: c.slug, ...c }));
  const { data, error } = await sb.from("categories").select("*").order("name");
  if (error || !data) return SEED_CATEGORIES.map((c) => ({ id: c.slug, ...c }));
  return data as Category[];
}
