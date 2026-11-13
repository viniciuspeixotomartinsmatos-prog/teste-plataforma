import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import{createHash}from'node:crypto';import{compileStagedItem,compileItem}from'../server/preview-service.mjs';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
test('isolated source compilation produces an actual bundle without modifying the live indexes',async()=>{
 const paths=['public/data/catalog.json','public/data/catalog-live.json','public/data/catalog-connected.json'];const before=await Promise.all(paths.map(async file=>digest(await fs.readFile(file))));
 const item={id:'staged-synthetic-source-check',name:'Source fixture',framework:'react',sourceId:'21st',category:'Components',kind:'component'};
 const payload={framework:'react',files:[{path:'fixture.tsx',content:'export default function Fixture(){return <button>Actual staged fixture</button>}'}]};
 const result=await compileStagedItem(item,payload);assert.ok(result.bytes>1000);assert.match(result.js,/Actual staged fixture/);assert.equal(result.id,item.id);
 assert.deepEqual(await Promise.all(paths.map(async file=>digest(await fs.readFile(file)))),before);
 await assert.rejects(compileItem(item.id),error=>error.status===404);
 await assert.rejects(compileStagedItem({...item,id:'existing-live-id'},payload),/Invalid isolated/);
});
