import CatalogView from '@/components/CatalogView';
export const metadata = {title:'Sản phẩm',alternates:{canonical:'/san-pham'}};
export default function ProductsPage({searchParams}: {searchParams: {q?:string;page?:string}}) {
  return <CatalogView searchParams={searchParams}/>;
}
