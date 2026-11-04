import "server-only";
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import type { CmsRecord } from "./config";
export const publicRecords = cache(async (): Promise<CmsRecord[]> => {
  const sb = getSupabase();
  if (!sb) return [];
  const all: CmsRecord[] = [];
  for (let n = 0; ; n += 500) {
    const { data, error } = await sb
      .from("cms_records")
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .range(n, n + 499);
    if (error) throw new Error(`Không tải được CMS: ${error.message}`);
    all.push(...data);
    if (data.length < 500) return all;
  }
});
export const claimedPaths = cache(async () => {
  const sb = getSupabase();
  const paths = new Set<string>();
  if (!sb) return paths;
  for (let n = 0; ; n += 500) {
    const { data, error } = await sb
      .from("cms_routes")
      .select("path")
      .not("record_id", "is", null)
      .order("path")
      .range(n, n + 499);
    if (error) throw new Error(error.message);
    data.forEach((r) => paths.add(r.path));
    if (data.length < 500) return paths;
  }
});
export async function publicRecord(kind: string, slug?: string) {
  return (await publicRecords()).find(
    (r) => r.kind === kind && (!slug || r.slug === slug),
  );
}
