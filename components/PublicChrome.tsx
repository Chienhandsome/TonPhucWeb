"use client";
import { usePathname } from "next/navigation";
import SiteHeader, { SiteFooter } from "./SiteHeader";
import FloatingContact from "./FloatingContact";
export default function PublicChrome({
  position,
}: {
  position: "header" | "footer";
}) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/")) return null;
  return position === "header" ? (
    <SiteHeader />
  ) : (
    <>
      <SiteFooter />
      <FloatingContact />
    </>
  );
}
