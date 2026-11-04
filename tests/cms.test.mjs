import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import {serializeJsonLd} from '../lib/json-ld.mjs';
import {createRequire} from 'node:module';
function load(name){const exports={};const source=ts.transpileModule(readFileSync(new URL(`../lib/cms/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;vm.runInNewContext(source,{exports,Set,Array,JSON,require:createRequire(import.meta.url)},{timeout:1000});return exports;}
const config=load('config'),validation=load('validation');
test('CSV round-trip preserves Vietnamese, quotes, newlines, data and formula-like titles safely',()=>{const transfer=load('transfer');const source=[{title:'=Điện lạnh "QA"\nxuất dữ liệu',slug:'qa',kind:'product',status:'draft',version:4,data:{excerpt:'Dòng 1\nDòng 2',price:null,blocks:[{type:'paragraph',text:'Đủ dấu: Ấn Độ'}]}}];const csv=transfer.csvRecords(source);assert.ok(csv.includes("'=Điện"));assert.equal(JSON.stringify(transfer.parseCsvRecords(csv)),JSON.stringify(source));});
test('product publishing needs primary category/image but not second level, stock or price',()=>{
 assert.equal(config.publicationErrors({title:'QA product',slug:'qa-product',kind:'product',data:{category_id:'qa-category',image:'/qa.jpg'}}).length,0);
 const errors=config.publicationErrors({title:'QA',slug:'qa',kind:'product',data:{}});assert.equal(errors.length,2);
});
test('article publishing does not require category',()=>{assert.equal(config.publicationErrors({title:'QA',slug:'qa',kind:'article',data:{image:'/qa.jpg'}}).length,0);});
test('Vietnamese search and slugs normalize accents and đ',()=>{assert.equal(config.slugify('Điện Lạnh Tôn Phúc'),'dien-lanh-ton-phuc');assert.equal(config.normalize('ỐNG ĐỒNG'),'ong dong');});
test('custom schemas override matching generated graph types only',()=>{
 const value=validation.preferredSchema(JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':['Product','Thing'],name:'QA'}]}),[{'@type':'Product'},{'@type':'BreadcrumbList'}]);
 assert.equal(value.length,2);assert.equal(value[0]['@type'],'BreadcrumbList');
});
test('stored schema cannot terminate the script element',()=>{const text=serializeJsonLd(validation.preferredSchema('{"@type":"Product","name":"</script><script>alert(1)</script>"}',[]));assert.equal(text.includes('</script>'),false);assert.ok(text.includes('\\u003c'));});
test('public links reject script URLs, protocol-relative URLs and nonstrings',()=>{for(const url of ['javascript:alert(1)','data:text/html,<script>', '//evil.test',{},null])assert.equal(validation.safeUrl(url),'');for(const url of ['/san-pham','https://example.com','tel:0903863797'])assert.equal(validation.safeUrl(url),url);});
test('admin definitions cover all required modules and preserve Vietnamese-first SEO fields',()=>{for(const kind of ['product','product_category','article','article_category','tag','company','page','slider','slider_settings','system_image','social','seo','redirect'])assert.ok(config.modules.some(m=>m.kind===kind));for(const field of ['seo_title','seo_keywords','seo_description','schema_json'])assert.ok(config.seoFields.some(f=>f.key===field));});
