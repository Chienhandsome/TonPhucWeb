import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Trả về client Supabase nếu đã cấu hình env, ngược lại trả về null.
 * Các trang công khai khi chưa có env sẽ dùng dữ liệu seed mẫu trong lib/seed.ts
 * để skeleton vẫn chạy được ở chế độ xem trước, không bị crash.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  if (!cached) cached = createClient(url, key);
  return cached;
}

export function storageBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "images";
}
