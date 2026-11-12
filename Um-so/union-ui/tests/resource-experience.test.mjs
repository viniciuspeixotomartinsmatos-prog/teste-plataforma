import test from 'node:test';
import assert from 'node:assert/strict';
import {resourceDelivery,librarySnapshot,readJourney,writeJourney,captureLibrarySnapshot,priorityCorrections} from '../src/resource-experience.js';
import {prepareCatalog,searchCatalog} from '../src/catalog.js';
test('resource labels distinguish editable source, compiled demos and video without inventing verification',()=>{
 assert.equal(resourceDelivery({availability:'code',codePath:'/code/x.json',framework:'react'}).source,true);
 assert.equal(resourceDelivery({availability:'code',codePath:'/code/x.json',recoveryMode:'interactive-compiled-example'}).source,false);
 const video=resourceDelivery({video:'/x.mp4',previewPath:'/x.html',recoveryMode:'recorded-video'});assert.equal(video.preview,'Vídeo demonstrativo');assert.equal(video.source,false);assert.match(video.notice,/não é uma implementação/);
 assert.match(video.license,/não informada/);
 const rows=prepareCatalog([{id:'r',name:'Card',framework:'react'},{id:'v',name:'Card',framework:'vue'}]);assert.deepEqual(searchCatalog(rows,{framework:'vue'}).map(r=>r.id),['v']);
});
test('journeys are bounded and owner isolated, restore filtered paths, reject external/account URLs',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 const snapshot={url:'/collections/project?q=hero&framework=react',y:800,visible:72,view:'list'};
 writeJourney('one',{returnTo:snapshot,recent:['r','r','v']},storage);
 assert.deepEqual(readJourney('one',storage).recent,['r','v']);assert.equal(readJourney('two',storage).returnTo,null);
 assert.equal(readJourney('one',storage).returnTo.visible,72);
 for(const url of ['https://evil.example/','//evil.example/','/account','/api/private','/component/x'])assert.equal(librarySnapshot({url}),null);
 assert.equal(librarySnapshot({url:'/?q=hero',visible:1,y:-2}).visible,36);
 assert.equal(librarySnapshot({url:'/',y:-2}).y,0);
 const captured=captureLibrarySnapshot({visible:72,view:'list'},{querySelectorAll:()=>[{dataset:{resourceId:'hero'},getBoundingClientRect:()=>({top:-90,bottom:300})}]},{location:{pathname:'/',search:'?q=hero'},scrollY:800});assert.equal(captured.anchor,'hero');assert.equal(captured.offset,90);
});
test('priority list uses only actionable findings, highest severity first, and never promises effort in hours',()=>{
 const findings=[{id:'pixel',status:'fail',severity:'baixa',weight:55,category:'pixel',steps:['Check']},{id:'indexavel',status:'fail',severity:'alta',weight:30,category:'seo',steps:['Check']},{id:'unknown',status:'info',weight:500,steps:['Check']},{id:'lcp',status:'fail',severity:'alta',weight:50,category:'velocidade',steps:['Check']}];
 const result=priorityCorrections({findings});assert.deepEqual(result.map(f=>f.id),['lcp','indexavel','pixel']);assert.match(result[1].effort,/confirmar/);assert.ok(!JSON.stringify(result).includes('horas'));
});
