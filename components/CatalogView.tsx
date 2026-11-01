import Link from 'next/link';
import {ArrowLeft, ArrowRight, Search, SlidersHorizontal} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {categories, findCategory, productsInCategory} from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import PageIntro from '@/components/PageIntro';

export default async function CatalogView({categorySlug, searchParams = {}, showIntro = true}: {categorySlug?: string; searchParams?: {q?: string; page?: string}; showIntro?: boolean}) {
  const t = await getTranslations('Catalog');
  const category = categorySlug ? findCategory(categorySlug) : null;
  const query = (typeof searchParams.q === 'string' ? searchParams.q : '').trim();
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  const found = productsInCategory(categorySlug).filter(product => normalize(product.title).includes(normalize(query)));
  const total = Math.max(1, Math.ceil(found.length / 12));
  const page = Math.min(total, Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1));
  const href = (number: number) => `${categorySlug ? '/' + categorySlug : '/san-pham'}?${new URLSearchParams({...query ? {q:query} : {}, page:String(number)})}`;
  return <>{showIntro ? <PageIntro eyebrow={t('eyebrow')} title={category?.title || t('title')} description={t('description')}/> : <h1 className="sr-only">{t('title')}</h1>}
    <section className="container catalog-layout section"><aside className="catalog-sidebar"><h2><SlidersHorizontal size={17}/>{t('title')}</h2><Link href="/san-pham" className={!categorySlug ? 'selected' : ''}>{t('all')}</Link>{categories.map(item => <div key={item.slug}><Link className={categorySlug === item.slug || category?.parent?.slug === item.slug ? 'selected' : ''} href={`/${item.slug}`}>{item.title}</Link>{(categorySlug === item.slug || category?.parent?.slug === item.slug) && item.children?.length > 0 && <div className="subcategories">{item.children.map(child => <Link className={child.slug === categorySlug ? 'selected' : ''} href={`/${child.slug}`} key={child.slug}>{child.title}</Link>)}</div>}</div>)}</aside>
      <div className="catalog-results">{category?.children?.length > 0 && <div className="category-children">{category.children.map(child=><Link key={child.slug} href={`/${child.slug}`}>{child.title}</Link>)}</div>}<div className="catalog-toolbar"><span>{t('count',{count:found.length})}</span><form role="search"><Search size={17}/><input type="search" name="q" defaultValue={query} placeholder={t('title')} aria-label={t('title')}/><button type="submit" aria-label={t('search')}><ArrowRight size={18}/></button></form></div>{query && <p className="search-summary">{t('searchResults',{query})}</p>}
        {found.length > 0 ? <div className="product-grid catalog-product-grid">{found.slice((page-1)*12, page*12).map(product => <ProductCard key={product.slug} product={product}/>)}</div> : <div className="empty-state"><Search size={38} strokeWidth={1}/><h2>{t('empty')}</h2><Link href="/san-pham" className="button button-dark">{t('clear')}<ArrowRight size={18}/></Link></div>}
        {total > 1 && <nav className="pagination" aria-label={t('page',{page,total})}>{page > 1 && <Link href={href(page-1)}><ArrowLeft size={16}/>{t('previous')}</Link>}<span>{t('page',{page,total})}</span>{page < total && <Link href={href(page+1)}>{t('next')}<ArrowRight size={16}/></Link>}</nav>}
      </div>
    </section></>;
}
