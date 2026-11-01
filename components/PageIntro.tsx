import Link from 'next/link';
import {ChevronRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';

export default async function PageIntro({eyebrow, title, description}: {eyebrow: string; title: string; description?: string}) {
  const t = await getTranslations('Common');
  return <section className="page-intro"><div className="container"><div className="breadcrumb"><Link href="/">{t('home')}</Link><ChevronRight size={13}/><span>{title}</span></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div></section>;
}
