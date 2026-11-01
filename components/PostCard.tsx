import Link from 'next/link';
import {ArrowUpRight, FileText} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import type {Article} from '@/lib/catalog';
import type {Post} from '@/lib/posts';

export default async function PostCard({article,post}: {article?: Article; post?: Post}) {
  const t = await getTranslations('News');
  const item=article||{title:post.title,slug:post.slug,image:post.cover_image,excerpt:post.excerpt,href:`/bai-viet/${post.slug}`};
  const href=item.href||`/${item.slug}`;
  return <article className="news-card"><Link href={href} tabIndex={-1} aria-hidden="true" className="news-image">{item.image?<img src={item.image} alt="" loading="lazy" width={600} height={400}/>:<FileText size={40} strokeWidth={1}/>}</Link><div className="news-content"><span className="eyebrow">{t('category')}</span><h3><Link href={href}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={href} className="text-link">{t('read')}<ArrowUpRight size={17}/></Link></div></article>;
}
