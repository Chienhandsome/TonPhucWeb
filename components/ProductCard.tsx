import Link from 'next/link';
import {ArrowUpRight, Package} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import type {Product} from '@/lib/catalog';

export default async function ProductCard({product}: {product: Product}) {
  const t = await getTranslations('Catalog');
  return <article className="product-card">
    <Link href={`/${product.slug}`} className="product-image" tabIndex={-1} aria-hidden="true">
      {product.image ? <img src={product.image} alt="" loading="lazy" width={600} height={461} /> : <Package size={56} strokeWidth={1} />}
      <span className="product-image-arrow"><ArrowUpRight size={20} /></span>
    </Link>
    <div className="product-card-content"><span className="product-type">TÔN PHÚC</span><h3><Link href={`/${product.slug}`}>{product.title}</Link></h3><Link className="product-card-bottom" href={`/${product.slug}`}><span>{t('consult')}</span><ArrowUpRight size={17} /></Link></div>
  </article>;
}
