import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export function cmsServer() {
  const jar = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components cannot write cookies; route handlers refresh sessions. */
          }
        },
      },
    },
  );
}
export async function requireAdmin() {
  const sb = cmsServer();
  const { data, error } = await sb.auth.getUser();
  if (error || data.user?.app_metadata?.role !== "admin")
    throw new Error("Không có quyền quản trị");
  return { sb, user: data.user };
}
