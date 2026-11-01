import {ArrowUpRight, Phone} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {contact} from '@/lib/catalog';

export default async function ContactBand() {
  const t = await getTranslations('Home');
  return <section className="contact-band container"><div className="contact-band-icon"><Phone size={30} strokeWidth={1.4}/></div><div><h2>{t('contactTitle')}</h2><p>{t('contactText')}</p></div><a className="button button-white" href={`tel:${contact.phone}`}>{contact.phoneDisplay}<ArrowUpRight size={19}/></a></section>;
}
