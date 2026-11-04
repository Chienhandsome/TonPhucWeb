import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPostBySlug} from '@/lib/posts';
import ArticleView from '@/components/ArticleView';
import {pageMetadata} from '@/lib/seo';
import {publicRecord,claimedPaths} from '@/lib/cms/public';
import CmsContent from '@/components/CmsContent';
import JsonLd from '@/components/JsonLd';
import {preferredSchema} from '@/lib/cms/validation';
import {cmsMetadata} from '@/lib/cms/metadata';
export async function generateMetadata({params}: {params:{slug:string}}):Promise<Metadata>{
  const cms=await publicRecord('article',params.slug);if(cms)return cmsMetadata('article',cms.slug,`/bai-viet/${cms.slug}`);
  const post=await getPostBySlug(params.slug);
  return pageMetadata({title:post?.title||'Không tìm thấy bài viết',description:post?.excerpt||post?.content||'Bài viết không tồn tại hoặc chưa được xuất bản.',path:`/bai-viet/${params.slug}`,image:post?.cover_image,type:'article',noindex:!post});
}
export default async function PostPage({params}: {params:{slug:string}}){
  const cms=await publicRecord('article',params.slug);if(cms)return <><JsonLd data={preferredSchema(cms.data.schema_json,[{'@context':'https://schema.org','@type':'Article',headline:cms.title,description:cms.data.excerpt||'',image:cms.data.image,...(cms.data.author?{author:{'@type':'Person',name:cms.data.author}}:{}),...(cms.data.published_at?{datePublished:cms.data.published_at}:{})}])}/><CmsContent record={cms}/></>;
  const post=await getPostBySlug(params.slug);if(!post)notFound();
  if((await claimedPaths()).has(`/bai-viet/${params.slug}`))notFound();
  return <ArticleView article={{slug:post.slug,title:post.title,href:`/bai-viet/${post.slug}`,image:post.cover_image,excerpt:post.excerpt||'',blocks:[...(post.cover_image?[{type:'image',src:post.cover_image,text:post.title}]:[]),{type:'paragraph',text:post.content||post.excerpt||''}]}}/>;
}
