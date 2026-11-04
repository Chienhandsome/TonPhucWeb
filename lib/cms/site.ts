import "server-only";
import { cache } from "react";
import siteInfo from "@/data/site-info.json";
import { publicRecords } from "./public";
export const getSiteInfo = cache(async () => {
  const records = await publicRecords();
  const company = records.find((r) => r.kind === "company");
  const image = (slot: string) =>
    records.find((r) => r.kind === "system_image" && r.slug === slot)?.data
      .image;
  const d = company?.data || {};
  const contact = {
    ...siteInfo.contact,
    ...d,
    taxId: d.tax_code ?? siteInfo.contact.taxId,
    zalo: d.zalo_number
      ? `https://zalo.me/${d.zalo_number.replace(/\D/g, "")}`
      : siteInfo.contact.zalo,
    zaloDisplay: d.zalo_number ?? siteInfo.contact.zaloDisplay,
  };
  return {
    brand: {
      ...siteInfo.brand,
      logo: image("logo") || siteInfo.brand.logo,
      footerLogo: image("footer-logo") || "",
      favicon: d.favicon || image("favicon") || "",
      footerBackground: image("footer-background") || "",
      footerColor:
        records.find(
          (r) => r.kind === "system_image" && r.slug === "footer-background",
        )?.data.background_color || "",
    },
    contact,
    footer:
      records.find((r) => r.kind === "page" && r.slug === "footer")?.data ||
      null,
    social: records
      .filter((r) => r.kind === "social")
      .map((r) => ({ title: r.title, ...r.data })),
  };
});
