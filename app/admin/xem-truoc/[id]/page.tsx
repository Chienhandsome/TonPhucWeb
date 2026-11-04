import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import CmsContent from "@/components/CmsContent";
export const dynamic = "force-dynamic";
export default async function Preview({ params }: { params: { id: string } }) {
  let sb;
  try {
    ({ sb } = await requireAdmin());
  } catch {
    return (
      <section className="cms-login">
        <h1>Cần đăng nhập quản trị</h1>
        <p>
          Chỉ quản trị viên được xem bản nháp. Đăng nhập ở cùng trình duyệt rồi
          mở lại trang này.
        </p>
        <a href="/admin">Đăng nhập</a>
      </section>
    );
  }
  const { data, error } = await sb
    .from("cms_records")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data) notFound();
  return (
    <div className="cms-root">
      <div className="cms-workspace">
        <p className="cms-note">
          Xem trước bản đã lưu ·{" "}
          {data.status === "published"
            ? "Đã xuất bản"
            : data.status === "draft"
              ? "Bản nháp"
              : "Đang ẩn"}{" "}
          · Khách không có quyền truy cập URL xem trước này.
        </p>
        <CmsContent record={data} />
      </div>
    </div>
  );
}
