import {getTranslations} from 'next-intl/server';
import {aboutBlocks,brand} from '@/lib/catalog';
import PageIntro from '@/components/PageIntro';
import ContentBlocks from '@/components/ContentBlocks';
import ContactBand from '@/components/ContactBand';
export const metadata={title:'Giới thiệu',alternates:{canonical:'/gioi-thieu'}};
export default async function AboutPage(){
  const t=await getTranslations('Common');
  return <><PageIntro title={t('aboutTitle')} eyebrow={t('aboutEyebrow')}/><div className="container section about-page"><div className="about-page-image">{brand.photo&&<img src={brand.photo} alt="Cửa hàng Tôn Phúc" width={1360} height={1020}/>}</div><ContentBlocks blocks={aboutBlocks}/></div><ContactBand/></>;
}
