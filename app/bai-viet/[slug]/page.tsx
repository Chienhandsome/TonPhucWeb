import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPostBySlug} from '@/lib/posts';
import ArticleView from '@/components/ArticleView';
import {pageMetadata} from '@/lib/seo';
export async function generateMetadata({params}: {params:{slug:string}}):Promise<Metadata>{
  const post=await getPostBySlug(params.slug);
  return pageMetadata({title:post?.title||'Không tìm thấy bài viết',description:post?.excerpt||post?.content||'Bài viết không tồn tại hoặc chưa được xuất bản.',path:`/bai-viet/${params.slug}`,image:post?.cover_image,type:'article',noindex:!post});
}
export default async function PostPage({params}: {params:{slug:string}}){
  const post=await getPostBySlug(params.slug);if(!post)notFound();
  return <ArticleView article={{slug:post.slug,title:post.title,href:`/bai-viet/${post.slug}`,image:post.cover_image,excerpt:post.excerpt||'',blocks:[...(post.cover_image?[{type:'image',src:post.cover_image,text:post.title}]:[]),{type:'paragraph',text:post.content||post.excerpt||''}]}}/>;
}
