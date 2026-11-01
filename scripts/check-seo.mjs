import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';

const origin=process.env.UI_CHECK_URL||'http://127.0.0.1:3000';
const canonicalOrigin=new URL(process.env.SITE_URL||'https://tonphuc.com').origin;
const indexExpected=process.env.SEO_EXPECT_INDEX==='true';
const content=JSON.parse(await readFile('data/public-content.json','utf8'));
const product=content.products[0],article=content.articles[0];
const cases=[
  {path:'/',canonical:'/'},{path:'/gioi-thieu',canonical:'/gioi-thieu'},
  {path:'/san-pham',canonical:'/san-pham'},{path:'/tin-tuc',canonical:'/tin-tuc'},
  {path:'/lien-he',canonical:'/lien-he'},
  {path:'/'+product.slug,canonical:'/'+product.slug,type:'Product'},
  {path:'/'+article.slug,canonical:'/'+article.slug,type:'Article'},
  {path:'/san-pham?page=2',canonical:'/san-pham?page=2'},
  {path:'/san-pham?q=R32',canonical:'/san-pham',noindex:true},
  {path:'/nhot-lanh',canonical:'/nhot-lanh',noindex:true},
];
for(const item of cases) {
  const response=await fetch(origin+item.path,{signal:AbortSignal.timeout(45000)});
  assert.equal(response.status,200,item.path);
  const $=load(await response.text());
  assert.ok($('title').text().includes('Tôn Phúc'),item.path+' title');
  assert.ok($('meta[name="description"]').attr('content')?.length>20,item.path+' description');
  const expected=new URL(item.canonical,canonicalOrigin).href;
  assert.equal(new URL($('link[rel="canonical"]').attr('href')).href,expected,item.path+' canonical');
  assert.equal(new URL($('meta[property="og:url"]').attr('content')).href,expected,item.path+' og:url');
  assert.ok($('meta[property="og:image"]').attr('content')?.startsWith('https://'),item.path+' og:image');
  assert.equal($('meta[name="twitter:card"]').attr('content'),'summary_large_image');
  const robots=$('meta[name="robots"]').attr('content')||'';
  assert.equal(robots.includes('noindex'),Boolean(item.noindex)||!indexExpected,item.path+' robots');
  const schemas=$('script[type="application/ld+json"]').toArray().flatMap(el=>{
    const value=JSON.parse($(el).html());return value['@graph']||[value];
  });
  assert.ok(schemas.some(value=>value['@type']==='LocalBusiness'),item.path+' business data');
  if(item.type) {
    const data=schemas.find(value=>value['@type']===item.type);
    assert.ok(data,item.path+' schema type');
    assert.ok(schemas.some(value=>value['@type']==='BreadcrumbList'),item.path+' breadcrumbs');
    if(item.type==='Product') {
      assert.equal(data.name,product.title);
      assert.equal(data.url,expected);
      if(product.image)assert.equal($('meta[property="og:image"]').attr('content'),new URL(product.image,canonicalOrigin).href);
      assert.equal(data.offers,undefined,'Do not invent a product price');
      assert.equal(data.aggregateRating,undefined,'Do not invent reviews');
    }
    if(item.type==='Article') {
      assert.equal(data.datePublished,undefined,'Do not invent source publication dates');
      assert.equal(data.mainEntityOfPage['@id'],expected);
    }
  }
}
const admin=load(await(await fetch(origin+'/admin')).text());
assert.match(admin('meta[name="robots"]').attr('content')||'',/noindex/);
assert.match(admin('meta[name="robots"]').attr('content')||'',/nofollow/);
const robots=await(await fetch(origin+'/robots.txt')).text();
assert.match(robots,/Allow: \//);
assert.equal(robots.includes('Sitemap:'),indexExpected,'Preview must not announce a production sitemap');
const sitemapResponse=await fetch(origin+'/sitemap.xml');
assert.equal(sitemapResponse.status,200);
const xml=load(await sitemapResponse.text(),{xmlMode:true});
const urls=xml('loc').toArray().map(el=>xml(el).text());
assert.equal(urls.length,new Set(urls).size);
assert.ok(urls.every(url=>url.startsWith(canonicalOrigin+'/')&&!url.includes('/admin')&&!url.includes('?')));
assert.ok(!urls.includes(canonicalOrigin+'/nhot-lanh'),'Empty category must not be listed');
const image=await fetch(origin+'/share-image');
assert.equal(image.status,200,'Social card endpoint');
assert.match(image.headers.get('content-type')||'',/image\/png/);
const png=Buffer.from(await image.arrayBuffer());
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),1200);
assert.equal(png.readUInt32BE(20),630);
console.log(`Passed ${cases.length} SEO page checks, JSON-LD, admin noindex, robots, sitemap and 1200x630 social card.`);
