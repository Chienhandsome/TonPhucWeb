import CatalogView from '@/components/CatalogView';
import {catalogMetadata} from '@/lib/seo';
import {products} from '@/lib/catalog';
export function generateMetadata({searchParams}: {searchParams:{q?:string;page?:string}}) {
  return catalogMetadata({title:'Sản phẩm',path:'/san-pham',count:products.length,query:searchParams.q,page:searchParams.page});
}
export default function ProductsPage({searchParams}: {searchParams: {q?:string;page?:string}}) {
  return <CatalogView searchParams={searchParams} showIntro={false}/>;
}
