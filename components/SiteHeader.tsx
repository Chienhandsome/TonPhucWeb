import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo Gas Lạnh Tôn Phúc (placeholder)" width={120} height={38} className="h-9 w-auto rounded" />
          <span className="leading-tight">
            <span className="block text-base font-bold text-brand-800">Gas Lạnh Tôn Phúc</span>
            <span className="block text-xs text-slate-500">Đại lý gas lạnh tại TP.HCM</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <Link href="/" className="text-slate-700 hover:text-brand-700">Trang chủ</Link>
          <Link href="/chuyen-muc/san-pham" className="text-slate-700 hover:text-brand-700">Sản phẩm</Link>
          <Link href="/chuyen-muc/kien-thuc" className="text-slate-700 hover:text-brand-700">Kiến thức</Link>
          <Link href="/lien-he" className="text-slate-700 hover:text-brand-700">Liên hệ</Link>
          <Link href="/admin" className="rounded bg-brand-700 px-3 py-1.5 text-white hover:bg-brand-800">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Gas Lạnh Tôn Phúc — Đại lý gas lạnh tại TP.HCM</p>
        <p className="mt-1">Các dòng gas: R22, R32, R410A, R507, R407C. Các hãng: Honeywell, Chemours, Floron, Refron.</p>
        <p className="mt-1">Website mới đang trong giai đoạn skeleton — nội dung đầy đủ sẽ được chuyển từ tài khoản admin của web cũ. Xem chi tiết trong README và docs/content-inventory.md.</p>
        <p className="mt-3"><Link href="/lien-he" className="text-brand-700 underline">Liên hệ</Link> · <Link href="/admin" className="text-brand-700 underline">Trang quản trị</Link></p>
      </div>
    </footer>
  );
}
