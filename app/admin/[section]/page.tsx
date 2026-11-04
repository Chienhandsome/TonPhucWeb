import { Suspense } from "react";
import AdminApp from "@/components/admin/AdminApp";
import { cookies } from "next/headers";
import { cmsServer } from "@/lib/cms/server";
export default async function AdminSection({
  params,
}: {
  params: { section: string };
}) {
  let recovery = false;
  if (params.section === "tai-khoan" && process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    const { data } = await cmsServer().auth.getUser();
    recovery =
      !!data.user && cookies().get("cms-recovery")?.value === data.user.id;
  }
  return (
    <Suspense fallback={<p>Đang tải quản trị…</p>}>
      <AdminApp section={params.section} allowRecovery={recovery} />
    </Suspense>
  );
}
