'use client';

import {Phone} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import siteInfo from '@/data/site-info.json';

export default function FloatingContact() {
  const t = useTranslations('FloatingContact');
  const pathname = usePathname();
  const {contact} = siteInfo;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;

  return <aside className="floating-contact" aria-label={t('label')}>
    <a className="floating-contact-button floating-phone" href={`tel:${contact.phone}`} aria-label={t('phone', {number: contact.phoneDisplay})}>
      <span className="floating-contact-tooltip" aria-hidden="true">{t('phone', {number: contact.phoneDisplay})}</span>
      <Phone size={24} fill="currentColor" strokeWidth={1.4} aria-hidden="true"/>
    </a>
    <a className="floating-contact-button floating-zalo" href={contact.zalo} target="_blank" rel="noreferrer" aria-label={t('zalo')}>
      <span className="floating-contact-tooltip" aria-hidden="true">{t('zalo')}</span>
      <span className="floating-zalo-wordmark" aria-hidden="true">Zalo</span>
    </a>
  </aside>;
}
