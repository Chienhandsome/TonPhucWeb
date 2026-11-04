import assert from 'node:assert/strict';
import {load} from 'cheerio';
const origin=process.env.UI_CHECK_URL||'http://127.0.0.1:3000';
const paths=['','san-pham','danh-muc','bai-viet','chuyen-muc','tags','trang','cong-ty','lien-ket','banner','cai-dat-slider','anh-he-thong','seo','chuyen-huong','thu-vien','thung-rac','du-lieu','nhat-ky','tai-khoan'];
for(const path of paths){const response=await fetch(`${origin}/admin${path?'/'+path:''}`,{signal:AbortSignal.timeout(45000)});assert.equal(response.status,200,path);const $=load(await response.text());assert.match($('meta[name="robots"]').attr('content'),/noindex/);assert.equal($('.site-header').length,0,'Public header visible in admin');assert.equal($('.floating-contact').length,0,'Floating contacts visible in admin');}
const preview=await fetch(`${origin}/admin/xem-truoc/00000000-0000-0000-0000-000000000001`);const $=load(await preview.text());assert.match($('h1').text(),/Cần đăng nhập/);assert.equal($('.detail-information').length,0);
console.log(`Passed ${paths.length} admin route/noindex/chrome checks and unauthenticated preview guard. Browser CRUD is a separate check.`);
