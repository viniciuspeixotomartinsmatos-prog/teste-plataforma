import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {newProject,editProject,historyReducer,parseProject,cleanSettings} from '../src/project-model.js';
import {addPlaygroundBridge} from '../src/playground-bridge.js';
import {pageDocument,exportPage} from '../src/builder-export.js';
import {unzipSync,strFromU8} from 'fflate';
import fs from 'node:fs/promises';
import path from 'node:path';
test('page project preserves order, independent copies, history and validated imports',()=>{
 const original=newProject('Landing');let project=editProject(original,{type:'add',componentId:'hero'});const id=project.sections[0].id;
 project=editProject(project,{type:'section',id,patch:{settings:{background:'#abcdef',texts:{'text-1':'Hello'}}}});
 project=editProject(project,{type:'duplicate',id});const duplicate=project.sections[1];assert.notEqual(id,duplicate.id);
 project=editProject(project,{type:'section',id:duplicate.id,patch:{settings:{background:'#000000'}}});assert.equal(project.sections[0].settings.background,'#abcdef');
 project=editProject(project,{type:'move',id:duplicate.id,to:0});assert.equal(project.sections[0].id,duplicate.id);
 let history=historyReducer({past:[],present:original,future:[]},{project});history=historyReducer(history,{type:'undo'});assert.equal(history.present,original);history=historyReducer(history,{type:'redo'});assert.equal(history.present,project);
 const imported=parseProject(project,new Set(['hero']));assert.deepEqual(imported.sections,project.sections);assert.throws(()=>parseProject(project,new Set()),/indisponível/);
 assert.throws(()=>parseProject({...project,sections:Array(31).fill(project.sections[0])},new Set(['hero'])),/30/);
 assert.equal(cleanSettings({background:'red;display:none',scale:99}).background,'');assert.equal(cleanSettings({scale:99}).scale,1.5);
});
test('playground edits real text nodes safely, restores styling and rejects foreign messages',async()=>{
 const html=addPlaygroundBridge('<html><head></head><body><h1>Hello <em>world</em></h1><button>Try me</button></body></html>','demo');
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;
 try{
  await new Promise(r=>w.setTimeout(r,80));const em=w.document.querySelector('em');
  const update=(settings,source=w)=>w.dispatchEvent(new w.MessageEvent('message',{source,data:{type:'playground:settings',id:'demo',settings:cleanSettings(settings)}}));
  update({background:'#123456',texts:{'text-1':'<script>danger</script>'}});await new Promise(r=>w.setTimeout(r,50));
  assert.equal(w.document.querySelector('em'),em,'nested animation elements survive editing');assert.equal(w.document.querySelector('h1').textContent,'<script>danger</script>');assert.equal(w.document.querySelectorAll('script').length,1);
  assert.match(w.document.querySelector('#umso-customization').textContent,/#123456/);
  update({background:'#ffffff'},{});assert.match(w.document.querySelector('#umso-customization').textContent,/#123456/);
  update({});assert.equal(w.document.querySelector('h1').textContent,'Hello world');assert.equal(w.document.querySelector('#umso-customization').textContent,'');
 }finally{w.close();}
});
test('page export includes executable sections, project, responsive heights and licenses',async()=>{
 const previous=globalThis.fetch;globalThis.fetch=async url=>{try{const bytes=await fs.readFile(path.join('public',String(url)));return{ok:true,text:async()=>bytes.toString('utf8'),json:async()=>JSON.parse(bytes.toString('utf8')),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}catch{return{ok:false};}};
 try{let project=editProject(newProject('<Landing>'),{type:'add',componentId:'magic--particles'});project.sections[0].height=700;project.sections[0].mobileHeight=400;project.sections[0].settings.background='#123456';const rows=[{id:'magic--particles',name:'Particles',previewPath:'/previews/runtime/magic--particles.html'}];
 const files=unzipSync(await exportPage(project,rows));const html=strFromU8(files['sections/1.html']);assert.match(html,/createRoot/);assert.match(html,/#123456/);assert.ok(!/src="\/previews\/runtime/.test(html));const index=strFromU8(files['index.html']);assert.match(index,/height:700px/);assert.match(index,/height:400px/);assert.match(index,/&lt;Landing&gt;/);assert.ok(files['project.json']);assert.ok(files['licenses/ATTRIBUTIONS.md']);
 assert.equal((pageDocument(project,[]).match(/<iframe/g)||[]).length,0);
 }finally{globalThis.fetch=previous;}
});
