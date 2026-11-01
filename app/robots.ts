import type {MetadataRoute} from 'next';
import {absoluteUrl, isIndexingAllowed} from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // Preview: permit crawling so crawlers can read the page's noindex directive.
  // robots.txt is not an access-control mechanism; /admin has its own noindex metadata.
  return {rules:{userAgent:'*',allow:'/'},...(isIndexingAllowed()?{sitemap:absoluteUrl('/sitemap.xml')}:{})};
}
