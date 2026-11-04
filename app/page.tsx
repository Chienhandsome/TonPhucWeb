import Link from 'next/link';
import {ArrowUpRight, ChevronRight, Snowflake, Wind, Wrench, Layers3, Component, Droplets, Box} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {aboutBlocks, getCatalog, getArticles} from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import ContactBand from '@/components/ContactBand';
import HomeBanner from '@/components/HomeBanner';
import banners from '@/data/home-banners.json';
import {publicRecords} from '@/lib/cms/public';
import {getSupabase} from '@/lib/supabase';
import {cmsMetadata} from '@/lib/cms/metadata';
export async function generateMetadata(){return await cmsMetadata('seo','trang-chu','/')||{};}

export const dynamic = 'force-dynamic';
const bannerSlides = banners.map(({sourceUrl, sourcePage, ...slide}) => slide);

export default async function HomePage() {
  const [t,articles] = await Promise.all([getTranslations('Home'),getArticles()]);
  const {products,categories}=await getCatalog();
  const cms=await publicRecords();
  const config=cms.find(r=>r.kind==='slider_settings')?.data;
  const dbSlides=cms.filter(r=>r.kind==='slider').sort((a,b)=>(a.data.sort_order||0)-(b.data.sort_order||0)).map(r=>({id:r.id,image:r.data.image,width:1366,height:576,title:r.title,description:r.data.description||'',href:r.data.href||'/san-pham',buttonLabel:r.data.button_label||''}));
  const sb=getSupabase();const configured=sb?await sb.rpc('cms_module_configured',{module_kind:'slider'}):{data:false,error:null};if(configured.error)throw new Error(configured.error.message);
  const icons=[Snowflake,Component,Layers3,Wrench,Wind,Box,Droplets,Box];
  const featured=products.filter(product=>product.featured||product.source!=='cms'&&product.category==='gas-lanh').slice(0,6);
  return <>
    <HomeBanner slides={configured.data?dbSlides:bannerSlides} delay={Math.max(2,Number(config?.delay)||6)*1000} autoplayEnabled={config?.autoplay!==false} heading={`${t('title')} ${t('titleAccent')}`}/>
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
