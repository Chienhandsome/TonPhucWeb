'use client';

import {Phone} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import siteInfo from '@/data/site-info.json';
import {useSiteInfo} from './SiteInfoProvider';

export default function FloatingContact() {
  const t = useTranslations('FloatingContact');
  const pathname = usePathname();
  const {contact} = useSiteInfo();
  const dockRef = useRef<HTMLElement>(null);
  const [overlapping, setOverlapping] = useState(false);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const mobile = window.matchMedia('(max-width: 600px)');
    let observer: IntersectionObserver | undefined;
    const refresh = () => {
      observer?.disconnect();
      if (!mobile.matches) { setOverlapping(false); return; }
      const height = dock.getBoundingClientRect().height;
      const boundary = window.innerHeight - height - 8;
      const targets = Array.from(document.querySelectorAll<HTMLElement>('main a, main button, footer a'))
        .filter(element => !element.closest('[aria-hidden="true"]') && element.tabIndex !== -1);
      const conflicts = new Set<Element>();
      const update = () => setOverlapping(conflicts.size > 0 && !dock.contains(document.activeElement));
      // Observe only the bottom strip occupied by the dock, not the entire page.
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (rect.width && rect.height && rect.bottom > boundary && rect.top < window.innerHeight) conflicts.add(target);
      }
      update();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) conflicts.add(entry.target);
          else conflicts.delete(entry.target);
        }
        update();
      }, {rootMargin: `${-Math.max(0, boundary)}px 0px 0px 0px`});
      targets.forEach(target => observer.observe(target));
    };
    refresh();
    mobile.addEventListener('change', refresh);
    window.addEventListener('resize', refresh);
    return () => {
      observer?.disconnect();
      mobile.removeEventListener('change', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, [pathname]);

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;

  return <aside ref={dockRef} className={`floating-contact${overlapping ? ' is-overlapping' : ''}`} aria-label={t('label')} aria-hidden={overlapping || undefined}>
    <a className="floating-contact-button floating-phone" tabIndex={overlapping ? -1 : undefined} href={`tel:${contact.phone}`} aria-label={t('phone', {number: contact.phoneDisplay})}>
      <span className="floating-contact-tooltip" aria-hidden="true">{t('phone', {number: contact.phoneDisplay})}</span>
      <Phone size={24} fill="currentColor" strokeWidth={1.4} aria-hidden="true"/>
      <span className="floating-contact-label" aria-hidden="true">{contact.phoneDisplay}</span>
    </a>
    <a className="floating-contact-button floating-zalo" tabIndex={overlapping ? -1 : undefined} href={contact.zalo} target="_blank" rel="noreferrer" aria-label={t('zalo')}>
      <span className="floating-contact-tooltip" aria-hidden="true">{t('zalo')}</span>
      <span className="floating-zalo-wordmark" aria-hidden="true">Zalo</span>
      <span className="floating-contact-label" aria-hidden="true">{t('zaloShort')}</span>
    </a>
  </aside>;
}
