import Link from 'next/link';
import {ArrowUpRight, ChevronRight, Snowflake, Wind, Wrench, Layers3, Component, Droplets, Box} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {aboutBlocks, categories, getArticles, products} from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import ContactBand from '@/components/ContactBand';
import HomeBanner from '@/components/HomeBanner';
import banners from '@/data/home-banners.json';

export const dynamic = 'force-dynamic';
const bannerSlides = banners.map(({sourceUrl, sourcePage, ...slide}) => slide);

export default async function HomePage() {
  const [t,articles] = await Promise.all([getTranslations('Home'),getArticles()]);
  const icons=[Snowflake,Component,Layers3,Wrench,Wind,Box,Droplets,Box];
  const featured=products.filter(product=>product.category==='gas-lanh').slice(0,6);
  return <>
    <HomeBanner slides={bannerSlides} heading={`${t('title')} ${t('titleAccent')}`}/>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">{t('catalogEyebrow')}</p><h2>{t('catalogTitle')}</h2></div><Link href="/san-pham" className="text-link">{t('allProducts')}<ArrowUpRight size={17}/></Link></div>
      <div className="category-grid">{categories.map((category,index)=>{const Icon=icons[index%icons.length];return <Link href={`/${category.slug}`} key={category.slug} className="category-tile"><span className="category-icon"><Icon size={29} strokeWidth={1.4}/></span><span>{category.title}</span><ChevronRight size={16}/></Link>;})}</div>
    </section>
    <section className="section section-soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">{t('featuredEyebrow')}</p><h2>{t('featuredTitle')}</h2></div><Link href="/gas-lanh" className="text-link">{t('viewAll')}<ArrowUpRight size={17}/></Link></div><div className="product-grid">{featured.map(product=><ProductCard key={product.slug} product={product}/>)}</div></div></section>
    <ContactBand/>
    <section className="container home-secondary">
      <div><h2>{t('aboutTitle')}</h2><p>{aboutBlocks.find(block=>block.type==='paragraph')?.text}</p><Link href="/gioi-thieu" className="text-link">{t('aboutLink')}<ArrowUpRight size={18}/></Link></div>
      <div><h2>{t('newsTitle')}</h2><ul className="home-news-list">{articles.slice(0,3).map(article=><li key={article.slug}><Link href={article.href||`/${article.slug}`}><span>{article.title}</span><ArrowUpRight size={18}/></Link></li>)}</ul><Link href="/tin-tuc" className="text-link">{t('newsLink')}<ArrowUpRight size={18}/></Link></div>
    </section>
  </>;
}
