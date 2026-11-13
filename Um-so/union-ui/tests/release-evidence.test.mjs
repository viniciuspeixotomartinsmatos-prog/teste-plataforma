import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import os from'node:os';import path from'node:path';import{releaseArtifacts,verifyReleaseEvidence,approvedReleaseRows,releaseChecks}from'../scripts/lib/release-evidence.mjs';
test('published release manifests retain actual artifact bytes and existing canonical catalog IDs',async()=>{
 const rows=await approvedReleaseRows('public'),catalog=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));assert.ok(rows.length>=6);assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);
 for(const row of rows){const live=catalog.find(item=>item.id===row.id);assert.ok(live,row.id);assert.equal(live.codePath,row.codePath);assert.equal(live.previewPath,row.previewPath);assert.equal(live.publicSlug,row.publicSlug);}
});
test('release approval binds actual source, preview, media and original archives; changed or missing evidence fails closed',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'nitido-release-'));try{
  for(const dir of ['code','previews','data'])await fs.mkdir(path.join(root,dir));
  const item={id:'staged-fixture',slug:'fixture',codePath:'/code/original.json',previewPath:'/previews/recorded.html',image:'/previews/poster.webp'};
  await fs.writeFile(path.join(root,'code/original.json'),JSON.stringify({originalPrompt:'Original prompt',downloadFiles:[{url:'/code/original.zip'}]}));
  await fs.writeFile(path.join(root,'previews/recorded.html'),'<video src="/previews/movie.mp4" poster="/previews/poster.webp"></video>');
  for(const file of ['code/original.zip','previews/movie.mp4','previews/poster.webp'])await fs.writeFile(path.join(root,file),file);
  const proof={id:item.id,checkedAt:new Date().toISOString(),notes:'Synthetic guard fixture; not production browser approval.',...Object.fromEntries(releaseChecks.map(key=>[key,true])),artifacts:await releaseArtifacts(root,item)};
  assert.equal(Object.keys(proof.artifacts).length,5);await verifyReleaseEvidence(root,item,proof);
  await assert.rejects(verifyReleaseEvidence(root,item,{...proof,visualConfirmed:false}),/Incomplete authorized browser evidence/);
  await assert.rejects(verifyReleaseEvidence(root,item,{...proof,artifacts:{}}),/Incomplete release artifact evidence/);
  await fs.writeFile(path.join(root,'data/catalog-approved-releases.json'),JSON.stringify({version:1,entries:[{item:{...item,id:'recovered--fixture'},stagedId:item.id,releaseDate:'2026-11-13',evidence:proof}]}));
  assert.equal((await approvedReleaseRows(root))[0].id,'recovered--fixture');
  for(const file of ['code/original.json','code/original.zip','previews/movie.mp4','previews/poster.webp']){const original=await fs.readFile(path.join(root,file));await fs.appendFile(path.join(root,file),' ');await assert.rejects(approvedReleaseRows(root),/Artifact changed after browser validation/);await fs.writeFile(path.join(root,file),original);}
  await assert.rejects(releaseArtifacts(root,{...item,codePath:'/api/private.json'}),/Invalid release artifact path/);
  await fs.writeFile(path.join(root,'previews/native.html'),'<canvas></canvas>');await fs.writeFile(path.join(root,'previews/native.light.html'),'<canvas></canvas>');
  // The real runtime namespace has an alternate document used by the theme control.
  await fs.mkdir(path.join(root,'previews/runtime'));await fs.rename(path.join(root,'previews/native.html'),path.join(root,'previews/runtime/native.html'));await fs.rename(path.join(root,'previews/native.light.html'),path.join(root,'previews/runtime/native.light.html'));
  const native={...item,previewPath:'/previews/runtime/native.html'},nativeProof={...proof,artifacts:await releaseArtifacts(root,native)};assert.ok(nativeProof.artifacts['/previews/runtime/native.light.html']);await verifyReleaseEvidence(root,native,nativeProof);await fs.appendFile(path.join(root,'previews/runtime/native.light.html'),'changed');await assert.rejects(verifyReleaseEvidence(root,native,nativeProof),/Artifact changed after browser validation/);
 }finally{if(!path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+'nitido-release-'))throw Error('Unsafe fixture cleanup path.');await fs.rm(root,{recursive:true,force:true});}
});
