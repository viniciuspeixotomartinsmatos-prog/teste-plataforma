import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));

test('recovered fonts use ordinary static paths and remain valid local WOFF2 resources',()=>{
 assert.equal(fs.existsSync('public/previews/recovered/build/_next/static/immutable'),false,'Copied Next.js immutable paths fail Vercel deployment integrity checks.');
 const css=fs.readFileSync('public/previews/recovered/styles.css','utf8');
 const fonts=[...new Set([...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map(match=>match[1].replace(/["']/g,'')))];
 assert.equal(fonts.filter(url=>url.startsWith('/previews/recovered/assets/next/media/')).length,6);
 for(const url of fonts){assert.ok(!url.includes('/static/immutable/'),url);assert.equal(fs.readFileSync('public'+url).subarray(0,4).toString(),'wOF2',url);}
});
test('every observed item resolves to one published item with an explicit recovery mode and prompt',()=>{
 const capture=read('../research/profitize/catalog.json'),report=read('public/data/recovered-coverage.json'),catalog=read('public/data/catalog-live.json');
 assert.equal(report.observed,capture.length);assert.equal(report.published,capture.length);assert.equal(report.newEntries+report.consolidated.length,capture.length);assert.equal(report.executable+report.recorded,capture.length);
 for(const original of capture){const item=catalog.find(x=>(x.sourceId==='recovered'||x.recoverySourceId==='recovered')&&x.slug===original.slug);assert.ok(item,original.slug);assert.ok(fs.existsSync('public'+item.previewPath),item.id);const payload=read('public'+item.codePath);assert.equal(payload.promptOrigin,'reconstructed');assert.ok(payload.reconstructionPrompt.includes('Não é o prompt original'));assert.ok(payload.files.some(x=>x.path==='RECONSTRUCTION.md'));if(item.recoveryMode==='recorded-video')assert.ok(fs.readFileSync('public'+item.previewPath,'utf8').includes('<video'));}
 for(const entry of report.consolidated){assert.ok(catalog.some(x=>x.id===entry.id));assert.ok(!catalog.some(x=>x.id===entry.recoveredId));}
});
