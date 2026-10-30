import fs from 'node:fs/promises';
const file='public/data/catalog-media.json',media=JSON.parse(await fs.readFile(file,'utf8'));
await fs.mkdir('public/assets/thumbnails/videos',{recursive:true});
const pending=Object.entries(media).filter(([,r])=>r.videoSource&&!r.video);let cursor=0,downloaded=0;const failed=[];
await Promise.all(Array.from({length:6},async()=>{while(cursor<pending.length){const [id,row]=pending[cursor++];try{
 const url=new URL(row.videoSource);if(url.protocol!=='https:'||url.hostname!=='cdn.21st.dev')throw Error('Invalid media host');
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('video/')){await response.body?.cancel();throw Error('Video unavailable');}
 if(Number(response.headers.get('content-length'))>25000000){await response.body?.cancel();throw Error('Video exceeds card budget');}
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>25000000||bytes.length<100||bytes.toString('ascii',4,8)!=='ftyp')throw Error('Invalid MP4');
 const target='/assets/thumbnails/videos/'+id+'.mp4';await fs.writeFile('public'+target,bytes);row.video=target;downloaded++;
 }catch(error){failed.push({id,error:error.message});}
 if((downloaded+failed.length)%50===0)console.log(JSON.stringify({checked:downloaded+failed.length,total:pending.length,downloaded}));
}}));
await fs.writeFile(file,JSON.stringify(media));await fs.writeFile('var/media/video-report.json',JSON.stringify({downloaded,failed},null,2));console.log(JSON.stringify({downloaded,failed:failed.length}));
