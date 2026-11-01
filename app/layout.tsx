import type { Metadata } from "next";
import "./globals.css";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Gas Lạnh Tôn Phúc — Đại lý gas lạnh tại TP.HCM",
  description: "Gas Lạnh Tôn Phúc: đại lý gas lạnh tại TP.HCM, các dòng R22, R32, R410A, R507, R407C từ Honeywell, Chemours, Floron, Refron.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <SiteHeader />
        <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
