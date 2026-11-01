import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
export default async function NotFound(){const t=await getTranslations('Common');return <div className="container empty-state not-found"><span className="eyebrow">404</span><h1>{t('notFound')}</h1><p>{t('notFoundText')}</p><Link href="/" className="button button-dark">{t('backHome')}</Link></div>;}
