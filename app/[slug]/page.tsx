import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {ArrowUpRight, ChevronRight, Phone, MessageCircle} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {contact, getCatalog, getArticles} from '@/lib/catalog';
import {publicRecord} from '@/lib/cms/public';
import CmsContent from '@/components/CmsContent';
import {preferredSchema} from '@/lib/cms/validation';
import {cmsMetadata} from '@/lib/cms/metadata';
import CatalogView from '@/components/CatalogView';
import ContentBlocks from '@/components/ContentBlocks';
import ProductCard from '@/components/ProductCard';
import ArticleView from '@/components/ArticleView';
import JsonLd from '@/components/JsonLd';
import {catalogMetadata, pageMetadata} from '@/lib/seo';
import {blockText, breadcrumbData, productData} from '@/lib/structured-data';

type Props = {params:{slug:string};searchParams:{q?:string;page?:string}};
export async function generateMetadata({params,searchParams}: Props): Promise<Metadata> {
  const {products,findCategory,productsInCategory}=await getCatalog();
  const cms=await publicRecord('product',params.slug);
  if(cms)return cmsMetadata('product',cms.slug,`/${cms.slug}`);
  const product=products.find(item=>item.slug===params.slug);
  const category=findCategory(params.slug);
  const article=!product&&!category ? (await getArticles()).find(item=>item.slug===params.slug) : null;
  if(category){const row=await publicRecord('product_category',params.slug);return {...catalogMetadata({title:row?.data.seo_title||category.title,path:`/${category.slug}`,count:productsInCategory(category.slug).length,query:searchParams.q,page:searchParams.page}),...(row?{description:row.data.seo_description||row.data.excerpt||category.title,keywords:row.data.seo_keywords||''}:{})};}
  if(product)return pageMetadata({title:product.title,description:blockText(product.blocks)||`${product.title} tại Tôn Phúc. Xem hình ảnh sản phẩm và liên hệ tư vấn qua hotline ${contact.phoneDisplay}.`,path:`/${product.slug}`,image:product.image});
  if(article)return pageMetadata({title:article.title,description:article.excerpt||blockText(article.blocks)||article.title,path:article.href||`/${article.slug}`,image:article.image,type:'article'});
  return pageMetadata({title:'Không tìm thấy trang',description:'Trang bạn tìm kiếm không tồn tại.',path:`/${params.slug}`,noindex:true});
}
export default async function SourcePage({params,searchParams}:Props) {
  const {categories,products,findCategory}=await getCatalog();
  const category=findCategory(params.slug);
  if(category) return <CatalogView categorySlug={category.slug} searchParams={searchParams}/>;
  const cms=await publicRecord('product',params.slug);
  if(cms)return <><JsonLd data={preferredSchema(cms.data.schema_json,[{'@context':'https://schema.org','@type':'Product',name:cms.title,image:cms.data.image,description:cms.data.excerpt||cms.title}])}/><CmsContent record={cms} phone={contact.phone}/></>;
  const product=products.find(item=>item.slug===params.slug);
  if(!product) {const article=(await getArticles()).find(item=>item.slug===params.slug);if(article)return <ArticleView article={article}/>;notFound();}
  const [t,n]=await Promise.all([getTranslations('Catalog'),getTranslations('Nav')]);
  const parent=categories.find(item=>item.slug===product.category);
  const related=products.filter(item=>item.category===product.category&&item.slug!==product.slug).slice(0,3);
  return <><JsonLd data={productData(product,parent?.title)}/><JsonLd data={breadcrumbData([{name:n('home'),path:'/'},{name:n('products'),path:'/san-pham'},...(parent?[{name:parent.title,path:`/${parent.slug}`}]:[]),{name:product.title,path:`/${product.slug}`}])}/><div className="container"><div className="breadcrumb detail-breadcrumb"><Link href="/">{n('home')}</Link><ChevronRight size={13}/><Link href="/san-pham">{n('products')}</Link><ChevronRight size={13}/><Link href={`/${parent?.slug||'san-pham'}`}>{parent?.title}</Link></div>
    <section className="product-detail"><div className="detail-image">{product.image ? <img src={product.image} alt={product.title} width={600} height={461}/> : <span>{t('imageMissing')}</span>}</div><div className="detail-copy"><Link href={`/${parent?.slug||'san-pham'}`} className="eyebrow">{parent?.title}</Link><h1>{product.title}</h1><span className="detail-divider"/><p className="detail-label">{t('consult')}</p><a className="detail-phone" href={`tel:${contact.phone}`}>{contact.phoneDisplay}<ArrowUpRight size={25}/></a><div className="detail-actions"><a className="button button-dark" href={`tel:${contact.phone}`}><Phone size={18}/>{n('hotline')}</a><a className="button button-outline" href={contact.zalo} target="_blank" rel="noreferrer"><MessageCircle size={18}/>Zalo</a></div><p className="detail-address">{contact.address}</p></div></section>
    <section className="detail-information"><h2>{t('information')}</h2>{product.blocks.length ? <ContentBlocks blocks={product.blocks}/> : <p>{t('noDescription')}</p>}</section>
    <section className="section"><div className="section-heading"><h2>{t('related')}</h2><Link href={`/${product.category}`} className="text-link">{t('all')}<ArrowUpRight size={17}/></Link></div><div className="product-grid related-grid">{related.map(item=><ProductCard key={item.slug} product={item}/>)}</div></section>
  </div></>;
}
