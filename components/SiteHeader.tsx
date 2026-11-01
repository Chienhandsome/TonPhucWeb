"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ArrowUpRight, ChevronDown, MapPin, Menu, Phone, Search, X} from 'lucide-react';
import siteInfo from '@/data/site-info.json';
const {brand, contact} = siteInfo;

export default function SiteHeader() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const links = [{href:'/',label:t('home')},{href:'/gioi-thieu',label:t('about')},{href:'/san-pham',label:t('products')},{href:'/tin-tuc',label:t('news')},{href:'/lien-he',label:t('contact')}];
  return <><a href="#main-content" className="skip-link">{t('skip')}</a>
    <div className="utility-bar"><div className="container"><span><MapPin size={13}/>{t('business')}</span><a href={contact.zalo} target="_blank" rel="noreferrer">Zalo: {contact.zaloDisplay}<ArrowUpRight size={12}/></a></div></div>
    <header className="site-header" onKeyDown={event=>{if(event.key==='Escape'&&open){setOpen(false);menuButton.current?.focus();}}}><div className="container header-main">
      <Link href="/" className="brand" onClick={()=>setOpen(false)}>{brand.logo && <img src={brand.logo} alt="" width={72} height={48}/>}<span><strong>TÔN PHÚC</strong><small>VẬT TƯ ĐIỆN LẠNH</small></span></Link>
      <form action="/san-pham" className="header-search" role="search"><Search size={19}/><input type="search" name="q" placeholder={t('search')} aria-label={t('searchLabel')}/><button type="submit" aria-label={t('searchLabel')}><ArrowUpRight size={20}/></button></form>
      <a className="header-phone" href={`tel:${contact.phone}`}><span className="phone-disc"><Phone size={20}/></span><span><small>{t('hotline')}</small><strong>{contact.phoneDisplay}</strong></span></a>
      <button ref={menuButton} className="mobile-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="main-navigation" aria-label={open?t('close'):t('menu')}>{open?<X/>:<Menu/>}</button>
    </div><div className="nav-border"><div className="container navigation-row">
      <Link href="/san-pham" className="catalog-toggle"><Menu size={19}/>{t('categories')}<ChevronDown size={15}/></Link>
      <nav id="main-navigation" className={`main-navigation ${open?'is-open':''}`} aria-label={t('menu')}>
        {links.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} className={(link.href==='/'?pathname==='/':pathname.startsWith(link.href))?'active':''}>{link.label}</Link>)}
        <form action="/san-pham" className="mobile-search" role="search"><input type="search" name="q" placeholder={t('search')} aria-label={t('searchLabel')}/><button aria-label={t('searchLabel')}><Search size={20}/></button></form>
      </nav><span className="nav-location">TP. HỒ CHÍ MINH <span className="status-dot"/></span>
    </div></div></header></>;
}

export function SiteFooter() {
  const t = useTranslations('Footer');
  const n = useTranslations('Nav');
  return <footer className="site-footer"><div className="container footer-grid">
    <div className="footer-brand"><Link href="/" className="footer-wordmark">TÔN PHÚC<span>®</span></Link><p>{t('description')}</p><a href={contact.zalo} target="_blank" rel="noreferrer" className="footer-zalo">Zalo<ArrowUpRight size={15}/></a></div>
    <div><h3>{t('explore')}</h3><Link href="/gioi-thieu">{n('about')}</Link><Link href="/san-pham">{n('products')}</Link><Link href="/tin-tuc">{n('news')}</Link><Link href="/lien-he">{n('contact')}</Link></div>
    <div><h3>{t('products')}</h3><Link href="/gas-lanh">Gas lạnh</Link><Link href="/ong-dong-phu-kien-dong">Ống đồng & phụ kiện</Link><Link href="/block-cum-may-nen-dan-ngung">Block & máy nén</Link><Link href="/vat-tu-thiet-bi-kho-lanh-may-da-chiller">Vật tư kho lạnh</Link></div>
    <div className="footer-contact"><h3>{t('contact')}</h3><p>{contact.address}</p><a href={`tel:${contact.phone}`} className="footer-phone">{contact.phoneDisplay}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {t('copyright')}</span><Link href="/admin">{n('admin')}<ArrowUpRight size={13}/></Link></div></footer>;
}
