'use client';
import {useTranslations} from 'next-intl';
export default function ErrorPage({reset}: {error: Error; reset:()=>void}){const t=useTranslations('Common');return <div className="container empty-state"><h1>{t('errorTitle')}</h1><p>{t('errorText')}</p><button onClick={reset} className="button button-dark">{t('retry')}</button></div>;}
