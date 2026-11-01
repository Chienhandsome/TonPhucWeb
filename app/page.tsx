import Link from 'next/link';
import {ArrowRight, ArrowUpRight, ChevronRight, Snowflake, Wind, Wrench, Layers3, Component, Droplets, Box, Phone} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {aboutBlocks, brand, categories, contact, getArticles, products} from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import ContactBand from '@/components/ContactBand';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [t,articles] = await Promise.all([getTranslations('Home'),getArticles()]);
  const icons=[Snowflake,Component,Layers3,Wrench,Wind,Box,Droplets,Box];
  const featured=products.filter(product=>product.category==='gas-lanh').slice(0,6);
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy">
      <p className="eyebrow"><span/>{t('eyebrow')}</p><h1>{t('title')}<br/><span>{t('titleAccent')}</span></h1>
      <p className="hero-description">{t('catalogNote')}</p>
      <div className="hero-actions"><Link href="/san-pham" className="button button-dark">{t('explore')}<ArrowUpRight size={19}/></Link><a href={`tel:${contact.phone}`} className="hero-phone-link"><Phone size={18}/>{t('consult')}</a></div>
      <div className="hero-footnote"><span className="hero-rule"/><p>0903.863.797 <span> / </span> 0914.157.636</p></div>
    </div><div className="hero-visual"><div className="hero-photo">{brand.photo && <img src={brand.photo} alt="Cửa hàng Vật tư lạnh Tôn Phúc tại 25A Tân Kỳ Tân Quý" fetchPriority="high" width={1360} height={1020}/>}<div className="hero-photo-caption"><span>TÔN PHÚC</span><ArrowUpRight size={22}/></div></div><div className="hero-product-float"><span className="float-label">GAS LẠNH</span>{featured[0]?.image && <img src={featured[0].image} alt={featured[0].title} width={180} height={160}/>}<span className="float-title">R134a · Floron</span><Link href={`/${featured[0]?.slug||'gas-lanh'}`} aria-label={featured[0]?.title}><ArrowUpRight size={18}/></Link></div><span className="hero-coordinate">10.7972° N · 106.6772° E</span></div></div></section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">{t('catalogEyebrow')}</p><h2>{t('catalogTitle')}</h2></div><Link href="/san-pham" className="text-link">{t('allProducts')}<ArrowUpRight size={17}/></Link></div>
      <div className="category-grid">{categories.map((category,index)=>{const Icon=icons[index%icons.length];return <Link href={`/${category.slug}`} key={category.slug} className="category-tile"><span className="category-icon"><Icon size={29} strokeWidth={1.4}/></span><span>{category.title}</span><ChevronRight size={16}/></Link>;})}</div>
    </section>
    <section className="section section-soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">{t('featuredEyebrow')}</p><h2>{t('featuredTitle')}</h2></div><Link href="/gas-lanh" className="text-link">{t('viewAll')}<ArrowUpRight size={17}/></Link></div><div className="product-grid">{featured.map(product=><ProductCard key={product.slug} product={product}/>)}</div></div></section>
    <section className="section container about-split"><div className="about-photo">{brand.photo && <img src={brand.photo} alt={t('store')} loading="lazy" width={1360} height={1020}/>}<div className="about-photo-note"><span>TP. HỒ CHÍ MINH</span><strong>VẬT TƯ LẠNH<br/>TÔN PHÚC</strong></div></div><div className="about-copy"><p className="eyebrow">{t('aboutEyebrow')}</p><h2>{t('aboutTitle')}</h2><p>{aboutBlocks.find(block=>block.type==='paragraph')?.text}</p><Link href="/gioi-thieu" className="text-link">{t('aboutLink')}<ArrowUpRight size={18}/></Link><div className="about-address"><span>{t('addressLabel')}</span><p>{contact.address}</p></div></div></section>
    <section className="section section-news"><div className="container"><div className="section-heading"><div><p className="eyebrow">{t('newsEyebrow')}</p><h2>{t('newsTitle')}</h2></div><Link href="/tin-tuc" className="text-link">{t('newsLink')}<ArrowRight size={18}/></Link></div><div className="news-grid">{articles.slice(0,3).map(article=><PostCard key={article.slug} article={article}/>)}</div></div></section>
    <ContactBand/>
  </>;
}
