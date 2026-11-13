// Operator-recorded browser evidence is required. Compilation never creates approval.
import fs from'node:fs/promises';import path from'node:path';import{createHash}from'node:crypto';
export const releaseChecks=['startupVerified','visualConfirmed','interactionVerified','mediaVerified','promptVerified','downloadVerified'];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function target(root,pointer){if(typeof pointer!=='string'||!/^\/(?:assets|previews|code)\//.test(pointer)||pointer.includes('\\')||pointer.includes('?')||pointer.split('/').some(part=>part.startsWith('.')))throw Error('Invalid release artifact path.');const full=path.resolve(root,'.'+pointer);if(!full.startsWith(path.resolve(root)+path.sep))throw Error('Release artifact escaped public root.');return full;}
export async function releaseArtifacts(root,item){
 const pending=[item.previewPath,item.codePath,...(item.image?[item.image]:[])],artifacts={};
 if(item.previewPath?.startsWith('/previews/runtime/'))pending.push(item.previewPath.replace(/\.html$/,'.light.html'));
 const payload=JSON.parse(await fs.readFile(target(root,item.codePath),'utf8'));for(const file of payload.downloadFiles||[])pending.push(file.url);
 while(pending.length){const pointer=pending.shift();if(pointer in artifacts)continue;if(Object.keys(artifacts).length>=200)throw Error('Release artifact limit exceeded.');
  const full=target(root,pointer),real=await fs.realpath(full);if(!real.startsWith(await fs.realpath(root)+path.sep))throw Error('Release artifact symlink escaped public root.');
  const stat=await fs.stat(full);if(stat.size>95*1024*1024)throw Error('Release artifact exceeds repository file limit.');const bytes=await fs.readFile(full);artifacts[pointer]=digest(bytes);
  if(/\.(?:html|css)$/.test(pointer))for(const match of bytes.toString('utf8').matchAll(/(?:["'(])(\/(?:previews|assets)\/[^\s"'()<>`\\]+\.(?:js|css|woff2?|png|jpe?g|webp|mp4|webm))/gi))pending.push(match[1]);
 }
 return artifacts;
}
export async function verifyReleaseEvidence(root,item,proof){
 if(proof?.id!==item.id||releaseChecks.some(key=>proof[key]!==true)||!proof.checkedAt||!Number.isFinite(Date.parse(proof.checkedAt))||!proof.notes?.trim()||proof.errors?.length)throw Error('Incomplete authorized browser evidence: '+item.id);
 const actual=await releaseArtifacts(root,item),expected=proof.artifacts;
 if(!expected||JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(Object.keys(expected).sort()))throw Error('Incomplete release artifact evidence: '+item.id);
 for(const [pointer,hash]of Object.entries(actual))if(hash!==expected[pointer])throw Error('Artifact changed after browser validation: '+pointer);
 return actual;
}
export async function approvedReleaseRows(root){
 let data;try{data=JSON.parse(await fs.readFile(path.join(root,'data/catalog-approved-releases.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return[];throw error;}
 if(data.version!==1||!Array.isArray(data.entries))throw Error('Invalid approved release manifest.');
 const rows=[];for(const entry of data.entries){if(!entry.item?.id||!entry.releaseDate||!entry.stagedId)throw Error('Invalid approved release entry.');await verifyReleaseEvidence(root,{...entry.item,id:entry.stagedId},entry.evidence);rows.push({...entry.item,approvedRelease:entry.releaseDate});}return rows;
}
