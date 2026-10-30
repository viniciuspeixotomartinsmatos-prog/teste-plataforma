import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
test('every observed item resolves to one published item with an explicit recovery mode and prompt',()=>{
 const capture=read('../research/profitize/catalog.json'),report=read('public/data/recovered-coverage.json'),catalog=read('public/data/catalog-live.json');
 assert.equal(report.observed,capture.length);assert.equal(report.published,capture.length);assert.equal(report.newEntries+report.consolidated.length,capture.length);assert.equal(report.executable+report.recorded,capture.length);
 for(const original of capture){const item=catalog.find(x=>(x.sourceId==='recovered'||x.recoverySourceId==='recovered')&&x.slug===original.slug);assert.ok(item,original.slug);assert.ok(fs.existsSync('public'+item.previewPath),item.id);const payload=read('public'+item.codePath);assert.equal(payload.promptOrigin,'reconstructed');assert.ok(payload.reconstructionPrompt.includes('Não é o prompt original'));assert.ok(payload.files.some(x=>x.path==='RECONSTRUCTION.md'));if(item.recoveryMode==='recorded-video')assert.ok(fs.readFileSync('public'+item.previewPath,'utf8').includes('<video'));}
 for(const entry of report.consolidated){assert.ok(catalog.some(x=>x.id===entry.id));assert.ok(!catalog.some(x=>x.id===entry.recoveredId));}
});
