import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import './globals.css';
import SiteHeader, {SiteFooter} from '@/components/SiteHeader';
import FloatingContact from '@/components/FloatingContact';
import JsonLd from '@/components/JsonLd';
import {businessData} from '@/lib/structured-data';
import {DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata, SITE_URL} from '@/lib/seo';
import siteInfo from '@/data/site-info.json';

export const metadata: Metadata = {
  ...pageMetadata({title:DEFAULT_TITLE,description:DEFAULT_DESCRIPTION,path:'/'}),
  metadataBase: new URL(SITE_URL),
  title: {default:DEFAULT_TITLE,template:'%s | Tôn Phúc'},
  icons: {icon:siteInfo.brand.logo},
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? {google:process.env.GOOGLE_SITE_VERIFICATION} : {}),
    ...(process.env.BING_SITE_VERIFICATION ? {other:{'msvalidate.01':process.env.BING_SITE_VERIFICATION}} : {}),
  },
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const messages = await getMessages();
  return <html lang="vi"><body><JsonLd data={businessData()}/><NextIntlClientProvider messages={messages}><SiteHeader/><main id="main-content">{children}</main><SiteFooter/><FloatingContact/></NextIntlClientProvider></body></html>;
}
