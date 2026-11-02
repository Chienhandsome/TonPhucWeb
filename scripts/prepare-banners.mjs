import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {load} from 'cheerio';

// Source HTML is reference data only. Never execute its scripts or render raw HTML.
const $ = load(await readFile('docs/source-audit/home.html', 'utf8'));
const slides = [];
await mkdir('public/banners', {recursive: true});
for (const [index, element] of $('#slider .itemsl').toArray().entries()) {
  const item = $(element);
  const image = item.find('img').first();
  const thumbnail = new URL(image.attr('src'), 'https://tonphuc.com/');
  const original = new URL(thumbnail.pathname.replace(/^\/thumb\/\d+x\d+\/\d+\//, '/'), thumbnail.origin);
  if (original.origin !== 'https://tonphuc.com') throw new Error('Unexpected banner source');
  const response = await fetch(original, {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Banner ${index + 1}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Expected PNG banner');
  const sourceHref = new URL(item.find('a').first().attr('href'), 'https://tonphuc.com/');
  if (sourceHref.origin !== 'https://tonphuc.com') throw new Error('Unexpected banner destination');
  const local = `/banners/banner-${index + 1}.png`;
  await writeFile('public' + local, bytes);
  slides.push({
    id: `banner-${index + 1}`,
    image: local,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    title: item.find('.desc .tit').text().trim() || image.attr('alt'),
    description: item.find('.desc .p1').text().trim(),
    href: sourceHref.pathname,
    sourceUrl: original.href,
    sourcePage: 'https://tonphuc.com/',
  });
  console.log(`Banner ${index + 1}: ${bytes.length} bytes, ${slides.at(-1).width}×${slides.at(-1).height}`);
}
if (slides.length !== 5) throw new Error('Expected all five source banners');
await writeFile('data/home-banners.json', JSON.stringify(slides, null, 2) + '\n');
