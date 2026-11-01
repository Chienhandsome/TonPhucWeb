import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPostBySlug} from '@/lib/posts';
import ArticleView from '@/components/ArticleView';
export async function generateMetadata({params}: {params:{slug:string}}):Promise<Metadata>{
  const post=await getPostBySlug(params.slug);
  return {title:post?.title||'Không tìm thấy bài viết',alternates:{canonical:`/bai-viet/${params.slug}`}};
}
export default async function PostPage({params}: {params:{slug:string}}){
  const post=await getPostBySlug(params.slug);if(!post)notFound();
  return <ArticleView article={{slug:post.slug,title:post.title,image:post.cover_image,excerpt:post.excerpt||'',blocks:[...(post.cover_image?[{type:'image',src:post.cover_image,text:post.title}]:[]),{type:'paragraph',text:post.content||post.excerpt||''}]}}/>;
}