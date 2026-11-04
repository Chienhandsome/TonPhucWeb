import {getTranslations} from 'next-intl/server';
import {aboutBlocks,brand} from '@/lib/catalog';
import ContentBlocks from '@/components/ContentBlocks';
import ContactBand from '@/components/ContactBand';
import {pageMetadata} from '@/lib/seo';
import {publicRecord} from '@/lib/cms/public';
import CmsContent from '@/components/CmsContent';
import {cmsMetadata} from '@/lib/cms/metadata';
export async function generateMetadata(){return await cmsMetadata('page','gioi-thieu','/gioi-thieu')||pageMetadata({title:'Giới thiệu',description:aboutBlocks.find(block=>block.type==='paragraph')?.text||'Giới thiệu Công ty TNHH Điện Lạnh Tôn Phúc.',path:'/gioi-thieu',image:brand.photo});}
export default async function AboutPage(){
  const cms=await publicRecord('page','gioi-thieu');if(cms)return <><CmsContent record={cms}/><ContactBand/></>;
  const t=await getTranslations('Common');
  return <><h1 className="sr-only">{t('aboutTitle')}</h1><div className="container section about-page"><div className="about-page-image">{brand.photo&&<img src={brand.photo} alt="Cửa hàng Tôn Phúc" width={1360} height={1020}/>}</div><ContentBlocks blocks={aboutBlocks}/></div><ContactBand/></>;
}
