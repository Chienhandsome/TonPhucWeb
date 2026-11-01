import {absoluteUrl, imageUrl, SITE_NAME, SITE_URL, summarize} from '@/lib/seo';
import siteInfo from '@/data/site-info.json';
import location from '@/data/location.json';
import type {Article, ContentBlock, Product} from '@/lib/catalog';

export function blockText(blocks: ContentBlock[]): string {
  return blocks.filter(block => ['paragraph', 'heading', 'list'].includes(block.type)).map(block => block.text || '').join(' ');
}

export function businessData(): Record<string, unknown> {
  const {contact, brand} = siteInfo;
  return {'@context': 'https://schema.org', '@graph': [
    {'@type': 'LocalBusiness', '@id': absoluteUrl('/#business'), name: contact.name, url: SITE_URL,
      logo: imageUrl(brand.logo), image: imageUrl(brand.photo), telephone: '+84' + contact.phone.slice(1), email: contact.email,
      taxID: contact.taxId, address: {'@type':'PostalAddress', streetAddress:contact.address, addressCountry:'VN'},
      hasMap: location.directionsUrl, sameAs:[contact.zalo]},
    {'@type': 'WebSite', '@id': absoluteUrl('/#website'), url: SITE_URL, name: SITE_NAME, inLanguage:'vi-VN', publisher:{'@id':absoluteUrl('/#business')}},
  ]};
}

export function breadcrumbData(items: {name:string;path:string}[]): Record<string,unknown> {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:absoluteUrl(item.path)}))};
}

export function productData(product: Product, category?: string): Record<string,unknown> {
  return {'@context':'https://schema.org','@type':'Product','@id':absoluteUrl(`/${product.slug}#product`),
    name:product.title,url:absoluteUrl(`/${product.slug}`),image:imageUrl(product.image),category,
    description:summarize(blockText(product.blocks)||product.title,500)};
}

export function articleData(article: Article): Record<string,unknown> {
  const url=absoluteUrl(article.href || `/${article.slug}`);
  return {'@context':'https://schema.org','@type':'Article','@id':url+'#article',url,
    headline:article.title,description:summarize(article.excerpt||blockText(article.blocks)),image:imageUrl(article.image),
    inLanguage:'vi-VN',mainEntityOfPage:{'@type':'WebPage','@id':url},publisher:{'@id':absoluteUrl('/#business')}};
}
