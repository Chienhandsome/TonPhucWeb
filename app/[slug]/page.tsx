import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {ArrowUpRight, ChevronRight, Phone, MessageCircle} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {categories, contact, findCategory, getArticles, products} from '@/lib/catalog';
import CatalogView from '@/components/CatalogView';
import ContentBlocks from '@/components/ContentBlocks';
import ProductCard from '@/components/ProductCard';
import ArticleView from '@/components/ArticleView';

type Props = {params:{slug:string};searchParams:{q?:string;page?:string}};
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const product=products.find(item=>item.slug===params.slug);
  const category=findCategory(params.slug);
  const article=!product&&!category ? (await getArticles()).find(item=>item.slug===params.slug) : null;
  const item=product||category||article;
  return {title:item?.title||'Không tìm thấy trang',alternates:{canonical:`/${params.slug}`}};
}
export default async function SourcePage({params,searchParams}:Props) {
  const category=findCategory(params.slug);
  if(category) return <CatalogView categorySlug={category.slug} searchParams={searchParams}/>;
  const product=products.find(item=>item.slug===params.slug);
  if(!product) {const article=(await getArticles()).find(item=>item.slug===params.slug);if(article)return <ArticleView article={article}/>;notFound();}
  const [t,n]=await Promise.all([getTranslations('Catalog'),getTranslations('Nav')]);
  const parent=categories.find(item=>item.slug===product.category);
  const related=products.filter(item=>item.category===product.category&&item.slug!==product.slug).slice(0,3);
  return <><div className="container"><div className="breadcrumb detail-breadcrumb"><Link href="/">{n('home')}</Link><ChevronRight size={13}/><Link href="/san-pham">{n('products')}</Link><ChevronRight size={13}/><Link href={`/${parent?.slug||'san-pham'}`}>{parent?.title}</Link></div>
    <section className="product-detail"><div className="detail-image">{product.image ? <img src={product.image} alt={product.title} width={600} height={461}/> : <span>{t('imageMissing')}</span>}</div><div className="detail-copy"><Link href={`/${parent?.slug||'san-pham'}`} className="eyebrow">{parent?.title}</Link><h1>{product.title}</h1><span className="detail-divider"/><p className="detail-label">{t('consult')}</p><a className="detail-phone" href={`tel:${contact.phone}`}>{contact.phoneDisplay}<ArrowUpRight size={25}/></a><div className="detail-actions"><a className="button button-dark" href={`tel:${contact.phone}`}><Phone size={18}/>{n('hotline')}</a><a className="button button-outline" href={contact.zalo} target="_blank" rel="noreferrer"><MessageCircle size={18}/>Zalo</a></div><p className="detail-address">{contact.address}</p></div></section>
    <section className="detail-information"><h2>{t('information')}</h2>{product.blocks.length ? <ContentBlocks blocks={product.blocks}/> : <p>{t('noDescription')}</p>}</section>
    <section className="section"><div className="section-heading"><h2>{t('related')}</h2><Link href={`/${product.category}`} className="text-link">{t('all')}<ArrowUpRight size={17}/></Link></div><div className="product-grid related-grid">{related.map(item=><ProductCard key={item.slug} product={item}/>)}</div></section>
  </div></>;
}
