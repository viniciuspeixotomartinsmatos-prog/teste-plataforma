import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {connectRecoveredCardVideos,recoveredCardVideo} from '../scripts/lib/recovered-card-video.mjs';

test('recorded recovered cards expose their own retained video, including Kairo',async()=>{
 const originals=JSON.parse(await fs.readFile('../research/profitize/catalog.json','utf8'));
 const approved=JSON.parse(await fs.readFile('public/data/catalog-approved-releases.json','utf8')).entries;
 let count=0;
 for(const file of ['catalog','catalog-live']){
  const rows=JSON.parse(await fs.readFile('public/data/'+file+'.json','utf8'));
  for(const row of rows.filter(row=>row.sourceId==='recovered'&&row.recoveryMode==='recorded-video')){
   assert.ok(row.video,row.id);const original=originals.find(item=>item.slug===row.slug);
   assert.equal(row.video,row.approvedRelease?approved.find(entry=>entry.item.id===row.id)?.item.video:recoveredCardVideo(original),row.id);
   const html=await fs.readFile('public'+row.previewPath,'utf8');
   assert.ok(html.includes(row.video),row.id+' must match its own recorded preview');
   assert.ok((await fs.stat('public'+row.video)).size>1000,row.id);count++;
  }
  assert.ok(rows.find(row=>row.id==='recovered--kairo').video.endsWith('/previa-card-24f57a10.mp4'));
  assert.deepEqual(await connectRecoveredCardVideos(rows,originals,path.resolve('public')),[],'repeat repair is idempotent');
 }
 assert.equal(count,60);
});

test('repair preserves existing videos and rejects missing media instead of borrowing another cover',async()=>{
 assert.equal(recoveredCardVideo({preview:{video:'https://example.com/video.mp4'}}),undefined);
 assert.equal(recoveredCardVideo({preview:{video:'/build/media/../secret.mp4'}}),undefined);
 const rows=[{id:'approved',sourceId:'recovered',recoveryMode:'recorded-video',video:'/existing.mp4'},{id:'interactive',sourceId:'recovered',recoveryMode:'interactive-component'}];
 assert.deepEqual(await connectRecoveredCardVideos(rows,[],path.resolve('public')),[]);
 await assert.rejects(connectRecoveredCardVideos([{id:'missing',slug:'missing',sourceId:'recovered',recoveryMode:'recorded-video'}],[],path.resolve('public')),/Missing retained video/);
 const original={slug:'missing',preview:{video:'/build/media/not-present.mp4'}};
 await assert.rejects(connectRecoveredCardVideos([{id:'missing',slug:'missing',sourceId:'recovered',recoveryMode:'recorded-video'}],[original],path.resolve('public')),/ENOENT/);
});
