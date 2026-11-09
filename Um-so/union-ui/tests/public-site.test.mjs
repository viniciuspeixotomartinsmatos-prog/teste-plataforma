import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPublicPage, publicRoutes, publicSitemap} from '../server/public-site.mjs';
import {protectedPath} from '../src/auth-policy.js';

const origin='https://teste-plataforma-delta.vercel.app';
test('bilingual marketing is rendered without session or JavaScript and private catalog stays gated',()=>{
 for(const locale of ['pt','en']){
  const html=renderPublicPage('/'+locale+'/',{origin});
  assert.match(html,/<!doctype html>/i);assert.match(html,new RegExp('lang="'+(locale==='pt'?'pt-BR':'en')+'"'));
  assert.match(html,/hreflang="pt-BR"/);assert.match(html,/hreflang="en"/);
  assert.match(html,/name="robots" content="noindex,follow"/);
  assert.match(html,/85,00|85\.00/);assert.match(html,/550,00|550\.00/);
  assert.doesNotMatch(html,/\$\s?19|testimonials|trusted by|milhares de clientes/i);
  assert.equal(protectedPath('/'+locale+'/'),false);
 }
 for(const path of ['/','/data/catalog-live.json','/code/a.json','/previews/a.html','/pt/code/a.json'])assert.equal(protectedPath(path),true,path);
 assert.equal(renderPublicPage('/not-a-page',{origin}),null);
});
test('policy pages have correct language, cross-language URLs and real support contact',()=>{
 for(const route of publicRoutes){
  const html=renderPublicPage(route,{origin});assert.ok(html,route);
  assert.match(html,/acesso@nitidohig\.com\.br/);assert.match(html,/<main/);
  assert.match(html,/rel="canonical"/);assert.doesNotMatch(html,/\bTODO\b|lorem ipsum|Source terms/);
 }
 const html=renderPublicPage('/en/privacy/',{origin});assert.match(html,/Privacy/);assert.match(html,/Supabase/);
});
test('noindex staging has no sitemap URLs; launch sitemap contains only intentional public pages',()=>{
 assert.equal(publicSitemap({origin}).match(/<loc>/g),null);
 const sitemap=publicSitemap({origin,indexable:true});assert.equal((sitemap.match(/<loc>/g)||[]).length,publicRoutes.length);
 assert.doesNotMatch(sitemap,/<loc>[^<]*(account|\/code\/|\/plans)/);
});
test('public rendering escapes configuration and rejects hostile canonical origins',()=>{
 assert.throws(()=>renderPublicPage('/pt/',{origin:'javascript:alert(1)'}));
 const html=renderPublicPage('/pt/',{origin,supportEmail:'"><script>alert(1)</script>'});
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
});
