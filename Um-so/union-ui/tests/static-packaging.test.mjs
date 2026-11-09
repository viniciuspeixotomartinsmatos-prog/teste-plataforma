import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {repackageRetainedStatic} from '../scripts/repackage-retained-static.mjs';

test('retained output relocates modified immutable bundles, rewrites loader/CSS URLs and preserves media and retained sources',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'nitido-static-'));
 const original=path.join(root,'retained.js'),output=path.join(root,'output'),template=path.join(output,'previews/recovered/demos/21st-template-1342'),immutable=path.join(template,'_next/static/immutable');
 const source='load("static/immutable/chunks/a.js");const escaped="static\\/immutable\\/media/font.woff2";';
 try{
  await fs.mkdir(path.join(immutable,'chunks'),{recursive:true});await fs.mkdir(path.join(immutable,'media'));
  await fs.writeFile(original,source);await fs.copyFile(original,path.join(immutable,'chunks/a.js'));
  await fs.writeFile(path.join(template,'index.html'),'<script src="./_next/static/immutable/chunks/a.js"></script>');
  await fs.writeFile(path.join(immutable,'chunks/a.css'),'@font-face{src:url(../media/font.woff2)}');
  const font=Buffer.from([0,255,127,33,0,1]);await fs.writeFile(path.join(immutable,'media/font.woff2'),font);
  const result=await repackageRetainedStatic(output);assert.equal(result.templates,1);assert.equal(result.rewritten,2);
  assert.equal(await fs.readFile(original,'utf8'),source);assert.deepEqual(await fs.readFile(path.join(template,'_next/static/recovered/media/font.woff2')),font);
  assert.match(await fs.readFile(path.join(template,'index.html'),'utf8'),/static\/recovered\/chunks\/a\.js/);
  assert.equal(await fs.readFile(path.join(template,'_next/static/recovered/chunks/a.js'),'utf8'),source.replaceAll('static/immutable/','static/recovered/').replaceAll('static\\/immutable\\/','static\\/recovered\\/'));
  assert.equal(await fs.readFile(path.join(template,'_next/static/recovered/chunks/a.css'),'utf8'),'@font-face{src:url(../media/font.woff2)}');
  assert.deepEqual(await repackageRetainedStatic(output),{templates:0,rewritten:0});
 }finally{assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('nitido-static-'));await fs.rm(root,{recursive:true,force:true});}
});
