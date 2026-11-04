import {ArrowUpRight, Mail, MessageCircle, Phone} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {brand,contact} from '@/lib/catalog';
import {pageMetadata} from '@/lib/seo';
import {getSiteInfo} from '@/lib/cms/site';
import {publicRecord} from '@/lib/cms/public';
import {cmsMetadata} from '@/lib/cms/metadata';
import ContentBlocks from '@/components/ContentBlocks';
export async function generateMetadata(){const {contact}=await getSiteInfo();return await cmsMetadata('page','lien-he','/lien-he')||pageMetadata({title:'Liên hệ',description:`Liên hệ Tôn Phúc: ${contact.address}. Hotline ${contact.phoneDisplay}, Zalo ${contact.zaloDisplay}, email ${contact.email}.`,path:'/lien-he',image:brand.photo});}
export default async function ContactPage(){
  const {contact}=await getSiteInfo();
  const page=await publicRecord('page','lien-he');
  const t=await getTranslations('Contact');
  return <><h1 className="sr-only">{t('title')}</h1><section className="section container contact-layout"><div>{page?.data.blocks?.length?<ContentBlocks blocks={page.data.blocks}/>:<p className="contact-intro">{t('intro')}</p>}<div className="contact-links"><a href={`tel:${contact.phone}`} className="contact-card"><Phone size={24}/><div><small>{t('phone')}</small><strong>{contact.phoneDisplay}</strong></div><ArrowUpRight size={19}/></a><a href={contact.zalo} target="_blank" rel="noreferrer" className="contact-card"><MessageCircle size={24}/><div><small>{t('zalo')}</small><strong>{contact.zaloDisplay}</strong></div><ArrowUpRight size={19}/></a><a href={`mailto:${contact.email}`} className="contact-card"><Mail size={24}/><div><small>{t('email')}</small><strong>{contact.email}</strong></div><ArrowUpRight size={19}/></a></div></div><div><div className="contact-store-photo">{brand.photo&&<img src={brand.photo} alt={contact.name} width={1360} height={1020}/>}</div><div className="contact-company"><p className="eyebrow">{t('company')}</p><h2>{contact.name}</h2><p>{contact.address}</p><p>{t('tax')}: {contact.taxId}</p><a href={page?.data.maps_url||"https://www.google.com/maps/search/?api=1&query=25A+Tan+Ky+Tan+Quy+Tan+Binh+Ho+Chi+Minh"} target="_blank" rel="noreferrer" className="text-link">{t('directions')}<ArrowUpRight size={17}/></a></div></div></section></>;
}
