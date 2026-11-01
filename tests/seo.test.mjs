import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {serializeJsonLd} from '../lib/json-ld.mjs';

const source = ts.transpileModule(readFileSync(new URL('../lib/seo.ts',import.meta.url),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
}).outputText;
function seo(env={}) {
  const exports={};
  vm.runInNewContext(source,{exports,URL,process:{env}},{timeout:1000});
  return exports;
}
const production={NODE_ENV:'production',SEO_ALLOW_INDEXING:'true',SITE_URL:'https://tonphuc.com'};

test('indexing requires explicit production approval and production domain',()=>{
  for(const env of [{},{NODE_ENV:'production'},{...production,NODE_ENV:'development'},{...production,SEO_ALLOW_INDEXING:'false'},{...production,VERCEL_ENV:'preview'},{...production,SITE_URL:'http://localhost:3000'},{...production,SITE_URL:'https://example.vercel.app'}]) {
    assert.equal(seo(env).isIndexingAllowed(),false,JSON.stringify(env));
  }
  assert.equal(seo(production).isIndexingAllowed(),true);
  assert.equal(seo({...production,VERCEL_ENV:'production'}).isIndexingAllowed(),true);
});

test('preview metadata stays noindex while canonical/social URLs use production origin',()=>{
  const value=seo().pageMetadata({title:'Gas R32',description:'Thông tin sản phẩm.',path:'/gas-r32'});
  assert.equal(value.robots.index,false);
  assert.equal(value.alternates.canonical,'https://tonphuc.com/gas-r32');
  assert.equal(value.openGraph.url,value.alternates.canonical);
  assert.equal(value.twitter.card,'summary_large_image');
});

test('pagination has its own canonical, search is noindex even in production',()=>{
  const module=seo(production);
  const page=module.catalogMetadata({title:'Sản phẩm',path:'/san-pham',count:40,page:'2'});
  assert.equal(page.alternates.canonical,'https://tonphuc.com/san-pham?page=2');
  assert.equal(page.robots.index,true);
  const invalid=module.catalogMetadata({title:'Sản phẩm',path:'/san-pham',count:40,page:'999'});
  assert.equal(invalid.alternates.canonical,'https://tonphuc.com/san-pham?page=4');
  const search=module.catalogMetadata({title:'Sản phẩm',path:'/san-pham',count:40,query:'R32',page:'2'});
  assert.equal(search.robots.index,false);
  assert.equal(search.alternates.canonical,'https://tonphuc.com/san-pham');
  const empty=module.catalogMetadata({title:'Nhớt lạnh',path:'/nhot-lanh',count:0});
  assert.equal(empty.robots.index,false);
});

test('JSON-LD cannot terminate its script element and preserves source text',()=>{
  const value={name:'</script><script>alert(1)</script> & R32\u2028test\u2029end'};
  const encoded=serializeJsonLd(value);
  assert.ok(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded),value);
});

test('image metadata rejects non-HTTP schemes and descriptions keep complete words',()=>{
  const module=seo();
  assert.equal(module.imageUrl('javascript:alert(1)'),undefined);
  assert.equal(module.imageUrl('data:text/html,test'),undefined);
  assert.equal(module.imageUrl('/source/example.png'),'https://tonphuc.com/source/example.png');
  assert.equal(module.summarize('<b>Gas</b>   R32'),'Gas R32');
  assert.ok(module.summarize('Gas lạnh Tôn Phúc. '.repeat(20)).length<=165);
});
