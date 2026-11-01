import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import './globals.css';
import SiteHeader, {SiteFooter} from '@/components/SiteHeader';

export const metadata: Metadata = {
  metadataBase: new URL('https://tonphuc.com'),
  title: {default:'Gas Lạnh Tôn Phúc — Vật tư điện lạnh TP.HCM',template:'%s | Tôn Phúc'},
  description:'Gas lạnh, ống đồng, block máy nén và vật tư điện lạnh Tôn Phúc. 25A Tân Kỳ Tân Quý, TP.HCM. Hotline 0903.863.797.'
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const messages = await getMessages();
  return <html lang="vi"><body><NextIntlClientProvider messages={messages}><SiteHeader/><main id="main-content">{children}</main><SiteFooter/></NextIntlClientProvider></body></html>;
}
