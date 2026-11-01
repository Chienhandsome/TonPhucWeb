import {load} from 'cheerio';
import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Local reference content only. Does not execute source HTML or write to Supabase.
const origin = 'https://tonphuc.com/';
const root = process.cwd();
const audit = path.join(root, 'docs/source-audit');
const assets = path.join(root, 'public/source');
await mkdir(assets, {recursive: true});
await mkdir(path.join(root, 'data'), {recursive: true});
const clean = value => value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
const slug = href => new URL(href || '/', origin).pathname.replace(/^\/+|\/+$/g, '');
const failures = [];
async function htmlFor(href) {
  const name = slug(href) || 'home';
  if (!/^[\w-]+$/.test(name)) throw new Error(`Invalid source slug: ${name}`);
  const file = path.join(audit, name + '.html');
  try { return await readFile(file, 'utf8'); } catch {}
  const response = await fetch(new URL(href, origin), {signal: AbortSignal.timeout(25000)});
  if (!response.ok) throw new Error(`${href}: HTTP ${response.status}`);
  const html = await response.text();
  await writeFile(file, html);
  return html;
}
const assetCache = new Map();
async function asset(href) {
  if (!href) return null;
  const url = new URL(href, origin);
  if (url.hostname !== 'tonphuc.com' || !/\.(png|jpe?g|webp|gif)$/i.test(url.pathname)) return null;
  if (assetCache.has(url.href)) return assetCache.get(url.href);
  const task = (async () => {
    const file = createHash('sha256').update(url.href).digest('hex').slice(0, 14) + path.extname(url.pathname).toLowerCase();
    try { await access(path.join(assets, file)); } catch {
      const response = await fetch(url, {signal: AbortSignal.timeout(25000)});
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Asset unavailable: ${url.href}`);
      await writeFile(path.join(assets, file), Buffer.from(await response.arrayBuffer()));
    }
    return '/source/' + file;
  })().catch(error => {failures.push(error.message); return null;});
  assetCache.set(url.href, task);
  return task;
}
async function pool(items, callback) {
  const result = [];
  let index = 0;
  await Promise.all(Array.from({length: Math.min(3, items.length)}, async () => {
    while (index < items.length) { const current = index++; result[current] = await callback(items[current]); }
  }));
  return result;
}
// Convert only approved structural tags to data blocks. No HTML is rendered by the app.
async function blocks($, container) {
  const result = [];
  for (const node of container.find('h1,h2,h3,p,li,figure,table').toArray()) {
    const el = $(node);
    if (el.parents('figure,table').length || (node.tagName === 'p' && el.parents('li').length)) continue;
    if (node.tagName === 'figure') {
      const img = el.find('img').first();
      const src = await asset(img.attr('src') || img.attr('data-src'));
      if(src) result.push({type:'image',src,text:clean(el.find('figcaption').text() || img.attr('alt') || '')});
    } else if(node.tagName === 'table') {
      result.push({type:'table',rows:el.find('tr').toArray().map(row=>$(row).find('th,td').toArray().map(cell=>clean($(cell).text())))});
    } else {
      const text = clean(el.text());
      if(text) result.push({type:/^h/.test(node.tagName)?'heading':node.tagName==='li'?'list':'paragraph',text});
      for(const img of el.find('img').toArray()) {
        const src=await asset($(img).attr('src'));
        if(src)result.push({type:'image',src,text:clean($(img).attr('alt')||'')});
      }
    }
  }
  return result;
}
const $ = load(await htmlFor('/'));
const categoryMap = new Map();
$('.danhmucsp').each((_, node) => {
  const heading=$(node).find('.tieude_giua1').first();
  const href=heading.find('a').attr('href');
  if(href)categoryMap.set(slug(href), {slug:slug(href),title:clean(heading.find('h2').text())});
});
// Also preserve all primary product families, including families without home cards.
const menu = $('nav a[href="san-pham"]').first().parent();
menu.children('ul').children('li').each((_,node)=>{
  const link=$(node).children('a').first();const key=slug(link.attr('href'));
  if(key && key!=='san-pham')categoryMap.set(key,{slug:key,title:clean(link.text()),children:$(node).find('ul a').toArray().map(a=>({slug:slug($(a).attr('href')),title:clean($(a).text())}))});
});
const productMap=new Map();
const oil=$('a[href="nhot-lanh"]').first();
if(oil.length&&!categoryMap.has('nhot-lanh'))categoryMap.set('nhot-lanh',{slug:'nhot-lanh',title:clean(oil.text())});
for(const category of categoryMap.values()) {
  const link=$(`a[href="${category.slug}"]`).filter((_,el)=>$(el).parent().children('ul').length>0).first();
  category.children=link.parent().children('ul').find('a').toArray().map(el=>({slug:slug($(el).attr('href')),title:clean($(el).text())}));
}
$('.danhmucsp').each((_,node)=>{
  const category=slug($(node).find('.tieude_giua1 a').attr('href'));
  $(node).find('.item_sp').each((_,card)=>{
    const link=$(card).find('a.ten').first();const key=slug(link.attr('href'));const img=$(card).find('img').first();
    if(key && !productMap.has(key))productMap.set(key,{slug:key,title:clean(link.text()),category,source:origin+key,originalImage:img.attr('data-src')||img.attr('src')});
  });
});
const products=await pool([...productMap.values()],async item=>{
  try {
    const detail=load(await htmlFor(item.slug));
    const description=await blocks(detail,detail('.product_info .baonoidung'));
    const content=await blocks(detail,detail('#toc-content'));
    const image=await asset(item.originalImage);
    const title=clean(detail('.product_info h1').text())||item.title;
    return {...item,title,image,blocks:[...description,...content],originalImage:undefined};
  } catch(error) {failures.push(error.message);return {...item,image:await asset(item.originalImage),blocks:[],originalImage:undefined};}
});
const news=load(await htmlFor('/tin-tuc'));
const newsMap=new Map();
$('.item_tt a.ten').each((_,node)=>{
  const el=$(node);const href=el.attr('href');const title=clean(el.attr('title')||el.text());
  if(!href || title.length<24 || title==='Xem thêm')return;
  const key=slug(href);
  if(!key || categoryMap.has(key) || productMap.has(key) || ['tin-tuc','gioi-thieu','lien-he','san-pham'].includes(key) || key.includes('/') || href.includes('&'))return;
  if(!newsMap.has(key))newsMap.set(key,{slug:key,title,source:origin+key});
});
const articles=await pool([...newsMap.values()].slice(0,8),async item=>{
  try {
    const page=load(await htmlFor(item.slug));
    const title=clean(page('.ten_baiviet h1').text());
    if(!title)return null;
    const content=await blocks(page,page('#toc-content'));
    return {...item,title,blocks:content,image:content.find(b=>b.type==='image')?.src||null,excerpt:clean(page('.mota_baiviet .mota').text())};
  } catch(error) {failures.push(error.message);return null;}
});
const about=load(await htmlFor('/gioi-thieu'));
let aboutContainer=about('#toc-content');
if(!aboutContainer.length)aboutContainer=about('.content.baonoidung').first();
const data={
  capturedAt:new Date().toISOString(),source:origin,
  logo:await asset($('img[data-src*="logo-7265"]').attr('data-src')),
  hero:await asset('upload/images/2019-09-19.jpg'),
  categories:[...categoryMap.values()],products,articles:articles.filter(Boolean),
  about:await blocks(about,aboutContainer),
  contact:{name:'CÔNG TY TNHH ĐIỆN LẠNH TÔN PHÚC',phone:'0903863797',phoneDisplay:'0903.863.797',zalo:'https://zalo.me/0914157636',zaloDisplay:'0914.157.636',email:'vattulanh.tonphuc@gmail.com',address:'25A Tân Kỳ Tân Quý, Phường 13, Quận Tân Bình, TP HCM',taxId:'0314714252',source:origin+'gioi-thieu'},
  failures
};
await writeFile(path.join(root,'data/public-content.json'),JSON.stringify(data,null,2)+'\n');
await writeFile(path.join(root,'data/site-info.json'),JSON.stringify({brand:{logo:data.logo,photo:data.hero},contact:data.contact},null,2)+'\n');
console.log(JSON.stringify({categories:data.categories.length,products:products.length,articles:data.articles.length,aboutBlocks:data.about.length,logo:data.logo,hero:data.hero,failures}));
