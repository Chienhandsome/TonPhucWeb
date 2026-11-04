import {NextRequest,NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';
export async function middleware(request:NextRequest){
 const headers=new Headers(request.headers);headers.set('x-cms-path',request.nextUrl.pathname);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(url&&key&&request.nextUrl.pathname.startsWith('/admin')){
  let response=NextResponse.next({request:{headers}});
  const sb=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(({name,value})=>request.cookies.set(name,value));headers.set('cookie',request.cookies.toString());response=NextResponse.next({request:{headers}});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
  await sb.auth.getUser();
  return response;
 }
 if(url&&key&&!request.nextUrl.pathname.startsWith('/admin')){
  const query=new URLSearchParams({select:'data',kind:'eq.redirect',status:'eq.published',deleted_at:'is.null','data->>from':`eq.${request.nextUrl.pathname}`,limit:'1'});
  try{const response=await fetch(`${url}/rest/v1/cms_records?${query}`,{headers:{apikey:key},cache:'no-store'});
   if(!response.ok)return new NextResponse('Không tải được cấu hình chuyển hướng. Vui lòng thử lại.',{status:503});
   const [row]=await response.json();const to=row?.data?.to;
   if(typeof to==='string'&&/^\/[a-zA-Z0-9/_-]*$/.test(to)&&to!==request.nextUrl.pathname&&!to.startsWith('/admin'))return NextResponse.redirect(new URL(to,request.url),301);
  }catch{return new NextResponse('Không kết nối được cấu hình chuyển hướng. Vui lòng thử lại.',{status:503});}
 }
 return NextResponse.next({request:{headers}});
}
export const config={matcher:['/((?!api|_next|source|banners|favicon|robots.txt|sitemap.xml|share-image).*)']};
