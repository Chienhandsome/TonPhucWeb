import {notFound} from 'next/navigation';
import {publicRecord,publicRecords} from '@/lib/cms/public';
import {cmsMetadata} from '@/lib/cms/metadata';
import Link from 'next/link';
export async function generateMetadata({params}:{params:{slug:string}}){return await cmsMetadata('tag',params.slug,`/tag/${params.slug}`)||{robots:{index:false}};}
export default async function Tag({params}:{params:{slug:string}}){const tag=await publicRecord('tag',params.slug);if(!tag)notFound();const records=(await publicRecords()).filter(r=>r.kind==='product'&&(r.data.tag_ids||[]).includes(tag.id));return <section className="container section"><h1>{tag.title}</h1>{records.map(r=><p key={r.id}><Link href={`/${r.slug}`}>{r.title}</Link></p>)}{!records.length&&<p>Chưa có sản phẩm.</p>}</section>;}
