"use client";
import { createContext, useContext } from "react";
import siteInfo from "@/data/site-info.json";
const SiteContext = createContext<any>(siteInfo);
export default function SiteInfoProvider({
  value,
  children,
}: {
  value: any;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
export function useSiteInfo() {
  return useContext(SiteContext) as typeof siteInfo & {
    brand: any;
    contact: any;
    footer: any;
    social: any[];
  };
}
