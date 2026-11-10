import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {advanceParticle} from '../src/cosmic-motion.js';
import {inspectHTML} from '../server/site-audit-inspect.mjs';
import {semanticIndex} from '../src/semantic-search.js';
import {catalogVariants} from '../src/catalog.js';
import {renderLibrary,librarySitemap} from '../server/public-library.mjs';
import {protectedPath} from '../src/auth-policy.js';

test('particle moves away locally and reconstructs after the impulse ends',()=>{
 const p={x:20,y:20,homeX:20,homeY:20,vx:0,vy:0,mass:1,release:0};
 const pointer={x:15,y:20,speed:30,until:120};
 for(let time=0;time<120;time+=16)advanceParticle(p,time,1,pointer,null);
 assert.ok(p.x>35);
 for(let time=128;time<4200;time+=16)advanceParticle(p,time,1,pointer,null);
 assert.ok(Math.abs(p.x-20)<0.01);
});
test('audit derives inline evidence and recommends existing live component ids',()=>{
 const {design}=inspectHTML('<style>h1{color:#abcdef;font-family:Inter,sans-serif}</style><nav/><footer/>','https://example.test');
 assert.equal(design.colors[0].value,'#ABCDEF');assert.equal(design.fonts[0].value,'Inter');
 const catalog=JSON.parse(fs.readFileSync('public/data/catalog-live.json'));
 assert.ok(design.recommendations.length>0);
 for(const item of design.recommendations)assert.ok(catalog.some(r=>r.id===item.id&&r.previewPath));
 assert.deepEqual(catalogVariants(catalog.find(r=>r.id==='animate-backgrounds-bubble'),catalog).map(r=>r.id).sort(),['animate-backgrounds-bubble','animate-vue-backgrounds-bubble']);
});
test('catalog-trained retrieval returns ranked results and ignores unknown tokens',()=>{
 const search=semanticIndex(JSON.parse(fs.readFileSync('public/data/semantic-index.json')));
 assert.ok(search(['pricing']).size>0);assert.equal(search(['zxqwv123']).size,0);
});
test('public library exposes metadata with canonical language links and gates downloads',()=>{
 const html=renderLibrary('/pt/biblioteca/magic--dock/');
 assert.match(html,/rel="canonical"/);assert.match(html,/\/en\/library\/magic--dock\//);
 assert.match(html,/application\/ld\+json/);assert.doesNotMatch(html,/\/previews\/|\/code\//);
 assert.equal(protectedPath('/pt/biblioteca/magic--dock/'),false);
 assert.equal(protectedPath('/code/runtime/magic--dock.json'),true);
 assert.match(librarySitemap(),/\/pt\/biblioteca\/magic--dock\//);
 assert.equal(renderLibrary('/pt/biblioteca/unknown-url/'),null);
});
