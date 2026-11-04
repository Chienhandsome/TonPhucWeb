import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import './globals.css';
import './readability.css';
import PublicChrome from '@/components/PublicChrome';
import SiteInfoProvider from '@/components/SiteInfoProvider';
import {getSiteInfo} from '@/lib/cms/site';
import JsonLd from '@/components/JsonLd';
import {businessData} from '@/lib/structured-data';
import {DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata, SITE_URL} from '@/lib/seo';
import siteInfo from '@/data/site-info.json';
import {publicRecords} from '@/lib/cms/public';
import {headers} from 'next/headers';
import {schemaTypes} from '@/lib/cms/validation';
export const dynamic='force-dynamic';

export async function generateMetadata():Promise<Metadata> {
 const info=await getSiteInfo();const home=(await publicRecords()).find(r=>r.kind==='seo'&&r.slug==='trang-chu');
 return {
  ...pageMetadata({title:DEFAULT_TITLE,description:DEFAULT_DESCRIPTION,path:'/'}),
  metadataBase: new URL(SITE_URL),
  title: {default:DEFAULT_TITLE,template:'%s | Tôn Phúc'},
  icons: {icon:info.brand.favicon||info.brand.logo},
  verification: {
    ...((home?.data.google_verification||process.env.GOOGLE_SITE_VERIFICATION) ? {google:home?.data.google_verification||process.env.GOOGLE_SITE_VERIFICATION} : {}),
    ...((home?.data.bing_verification||process.env.BING_SITE_VERIFICATION) ? {other:{'msvalidate.01':home?.data.bing_verification||process.env.BING_SITE_VERIFICATION}} : {}),
  },
};
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const messages = await getMessages();
  const site=await getSiteInfo();
  const path=headers().get('x-cms-path')||'/';const rows=await publicRecords();
  const item=rows.find(r=>r.kind==='page'&&`/${r.slug}`===path||r.kind==='product'&&`/${r.slug}`===path||r.kind==='article'&&`/bai-viet/${r.slug}`===path||r.kind==='product_category'&&`/${r.slug}`===path||r.kind==='seo'&&r.slug===(path==='/'?'trang-chu':path.slice(1)));
  const custom=item?.data.schema_json?JSON.parse(item.data.schema_json):null;const customTypes=schemaTypes(custom);
  const graph=(businessData(site)['@graph'] as any[]).filter(node=>!Array.from(schemaTypes(node)).some(type=>customTypes.has(type)));
  return <html lang="vi"><body>{!path.startsWith('/admin')&&<JsonLd data={{'@context':'https://schema.org','@graph':graph}}/>}{custom&&['page','seo','product_category'].includes(item?.kind)&&<JsonLd data={custom}/>}<NextIntlClientProvider messages={messages}><SiteInfoProvider value={site}><PublicChrome position="header"/><main id="main-content">{children}</main><PublicChrome position="footer"/></SiteInfoProvider></NextIntlClientProvider></body></html>;
}
