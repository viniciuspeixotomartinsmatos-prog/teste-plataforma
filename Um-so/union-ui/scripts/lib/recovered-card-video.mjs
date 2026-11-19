import fs from 'node:fs/promises';
import path from 'node:path';

// Preserve retained source paths; never infer a video from a title or a cover.
export function recoveredCardVideo(item) {
 const value=item.preview?.video;
 return typeof value==='string'&&/^\/build\/media\/[a-zA-Z0-9/_-]+\.(mp4|webm)$/.test(value)
  ? '/previews/recovered'+value : undefined;
}

export async function connectRecoveredCardVideos(rows, originals, publicRoot) {
 const bySlug=new Map(originals.map(item=>[item.slug,item]));
 const changed=[];
 for(const row of rows){
  if(row.sourceId!=='recovered'||row.recoveryMode!=='recorded-video'||row.video)continue;
  const video=recoveredCardVideo(bySlug.get(row.slug)||{});
  if(!video)throw Error('Missing retained video: '+row.id);
  const file=path.join(publicRoot,video);
  const handle=await fs.open(file,'r');
  try{const header=Buffer.alloc(64);const {bytesRead}=await handle.read(header,0,64,0);
   if(bytesRead<12||!header.subarray(0,bytesRead).includes(Buffer.from(video.endsWith('.mp4')?'ftyp':'webm')))throw Error('Invalid retained video: '+row.id);
  }finally{await handle.close();}
  row.video=video;changed.push(row.id);
 }
 return changed;
}
