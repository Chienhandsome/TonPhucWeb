import Link from "next/link";
import ContentBlocks from "./ContentBlocks";
import { CmsRecord } from "@/lib/cms/config";
import { safeUrl } from "@/lib/cms/validation";
export default function CmsContent({
  record: r,
  phone = "",
}: {
  record: CmsRecord;
  phone?: string;
}) {
  const d = r.data;
  return (
    <article className="container section">
      <h1
        style={{
          fontSize: 32,
          lineHeight: 1.4,
          fontWeight: 750,
          marginBottom: 24,
        }}
      >
        {r.title}
      </h1>
      {d.author && <p>Tác giả: {d.author}</p>}
      {d.published_at && (
        <p>Ngày đăng: {new Date(d.published_at).toLocaleDateString("vi-VN")}</p>
      )}
      {d.image && (
        <img
          src={safeUrl(d.image)}
          alt={d.image_alt || r.title}
          style={{ maxHeight: 420, objectFit: "contain", marginBottom: 24 }}
        />
      )}
      {d.excerpt && <p className="article-excerpt">{d.excerpt}</p>}
      {r.kind === "product" && (
        <>
          <p className="detail-phone">
            {d.price !== null && d.price !== undefined && d.price !== ""
              ? `${Number(d.price).toLocaleString("vi-VN")} ₫`
              : "Liên hệ tư vấn"}
          </p>
          <p>
            {(
              {
                available: "Còn hàng",
                unavailable: "Hết hàng",
                contact: "Liên hệ",
              } as Record<string, string>
            )[d.stock_status] || "Liên hệ"}
          </p>
          {["sku", "brand", "origin"].map(
            (key) =>
              d[key] && (
                <p key={key}>
                  {
                    {
                      sku: "Mã sản phẩm",
                      brand: "Thương hiệu",
                      origin: "Xuất xứ",
                    }[key]
                  }
                  : {d[key]}
                </p>
              ),
          )}
        </>
      )}
      <ContentBlocks blocks={d.blocks || []} />
      {[
        ["functions", "Chức năng"],
        ["origin_content", "Xuất xứ"],
        ["packaging", "Quy cách"],
      ].map(
        ([key, title]) =>
          d[key]?.length > 0 && (
            <section key={key}>
              <h2>{title}</h2>
              <ContentBlocks blocks={d[key]} />
            </section>
          ),
      )}
      {d.specs?.length > 0 && (
        <div className="prose-content">
          <table>
            <tbody>
              {d.specs.map((row: any, i: number) => (
                <tr key={i}>
                  <th>{row.name}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {d.gallery?.map((image: string, i: number) => (
        <img
          key={i}
          src={safeUrl(image)}
          alt={d.gallery_alts?.[i] || r.title}
          style={{ maxHeight: 400, objectFit: "contain", marginBlock: 20 }}
        />
      ))}
      {phone && (
        <a className="button button-dark" href={`tel:${phone}`}>
          Gọi tư vấn {phone}
        </a>
      )}
      {d.href && (
        <Link className="button button-dark" href={safeUrl(d.href) || "/"}>
          {d.button_label || "Xem ngay"}
        </Link>
      )}
      {d.maps_url && (
        <a href={safeUrl(d.maps_url)} target="_blank" rel="noreferrer">
          Xem chỉ đường
        </a>
      )}
    </article>
  );
}
