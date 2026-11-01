import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {load} from 'cheerio';

const origin = process.env.UI_CHECK_URL || 'http://127.0.0.1:3000';
const data = JSON.parse(await readFile('data/public-content.json', 'utf8'));
const routes = [
  {path:'/'}, {path:'/san-pham'}, {path:'/tin-tuc'}, {path:'/gioi-thieu'}, {path:'/lien-he'}, {path:'/admin'},
  ...data.categories.map(item=>({path:'/'+item.slug,title:item.title})),
  ...data.products.map(item=>({path:'/'+item.slug,title:item.title})),
  ...data.articles.map(item=>({path:'/'+item.slug,title:item.title})),
  {path:'/__missing_page_for_ui_check__',status:404},
  {path:'/chuyen-muc/__missing_category_for_ui_check__',status:404},
];
let next=0;
await Promise.all(Array.from({length:3},async()=>{
  while(next<routes.length) {
    const item=routes[next++];
    const response=await fetch(origin+item.path,{signal:AbortSignal.timeout(45000)});
    assert.equal(response.status,item.status||200,item.path);
    const $=load(await response.text());
    if(item.title)assert.equal($('main h1').text().replace(/\s+/g,' ').trim(),item.title,item.path);
  }
}));
const search=load(await (await fetch(origin+'/san-pham?q=R32')).text());
assert.ok(search('.product-card').length>0,'Search must find R32');
search('.product-card h3').each((_,el)=>assert.match(search(el).text(),/R32/i));
const empty=load(await (await fetch(origin+'/san-pham?q=__no_product__')).text());
assert.equal(empty('.product-card').length,0,'Empty search must not show unrelated products');
assert.ok(empty('.empty-state').text().includes('Không tìm thấy'),'Empty state missing');
const second=load(await (await fetch(origin+'/san-pham?page=2')).text());
assert.ok(second('.pagination').text().includes('Trang 2 /'),'Pagination must change page');
for(const image of new Set([data.logo,data.hero,...data.products.map(item=>item.image),...data.articles.map(item=>item.image)].filter(Boolean))) {
  assert.ok(image.startsWith('/source/'));
  await access('public'+image);
}
console.log(`Passed ${routes.length} route checks, search/empty/pagination and local cover assets.`);
