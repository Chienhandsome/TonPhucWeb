import { NextRequest, NextResponse } from "next/server";
import { cmsServer } from "@/lib/cms/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const sb = cmsServer();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (!error && data.user?.app_metadata?.role === "admin") {
      const response = NextResponse.redirect(
        new URL("/admin/tai-khoan?reset=1", request.url),
      );
      response.cookies.set("cms-recovery", data.user.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        maxAge: 600,
        path: "/admin",
      });
      return response;
    }
  }
  return NextResponse.redirect(new URL("/admin?authError=1", request.url));
}
