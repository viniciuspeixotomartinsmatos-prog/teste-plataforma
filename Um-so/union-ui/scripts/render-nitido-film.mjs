import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright-core';

// Screenshots and voice tracks are explicitly supplied local media, never account data.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=process.env.NITIDO_VIDEO_DIR;
if(!directory)throw Error('NITIDO_VIDEO_DIR must identify the presentation output directory.');
const out=path.resolve(directory),fps=30,duration=48;
await fs.mkdir(out,{recursive:true});
for(const file of ['index.html','page.css','page.js','film.html','film.css','film.js'])await fs.copyFile(path.join(root,'src/presentation',file),path.join(out,file));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!/^\/(?:index\.html|page\.(?:css|js)|film\.(?:html|css|js)|nitido-apresentacao\.mp4|assets\/[a-zA-Z0-9._-]+)?$/.test(pathname)){res.writeHead(404);return res.end();}
 const target=path.join(out,pathname==='/'?'index.html':pathname.slice(1));
 const data=await fs.readFile(target);res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(4188,'127.0.0.1',resolve));
console.log('Presentation http://127.0.0.1:4188');
if(process.argv.includes('--render')){
 const ffmpeg=process.env.FFMPEG_PATH;if(!ffmpeg)throw Error('FFMPEG_PATH is required for MP4 export.');
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4188/film.html?render');await page.waitForFunction(()=>window.FILM_READY);
  const output=path.join(out,'nitido-apresentacao.mp4');
  const encoder=spawn(ffmpeg,['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i',path.join(out,'assets/narracao.mp3'),'-i',path.join(out,'assets/trilha.wav'),'-filter_complex','[1:a]loudnorm=I=-16:TP=-1.5:LRA=9,apad[voice];[2:a]volume=1.4,afade=t=out:st=45:d=3[bed];[voice][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[audio]','-map','0:v','-map','[audio]','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart',output],{stdio:['pipe','ignore','pipe']});
  let stderr='';encoder.stderr.on('data',b=>{stderr=(stderr+b).slice(-8000)});
  let encoderError;encoder.on('error',e=>{encoderError=e});encoder.stdin.on('error',e=>{encoderError=e});
  const exit=once(encoder,'close');
  for(let frame=0;frame<fps*duration;frame++){
   if(encoderError||encoder.exitCode!==null)throw encoderError||Error('Encoder exited early: '+stderr);
   await page.evaluate(t=>window.setFilmTime(t),frame/fps);
   const buffer=await page.screenshot({type:'jpeg',quality:94,animations:'allow'});
   if(!encoder.stdin.write(buffer))await once(encoder.stdin,'drain');
   if(frame%150===0)console.log(`Rendering ${Math.round(frame/(fps*duration)*100)}%`);
  }
  encoder.stdin.end();const [code]=await exit;if(code!==0)throw Error('Export failed: '+stderr);
  if(errors.length)throw Error('Composition errors: '+errors.join('\n'));
  await page.evaluate(()=>window.setFilmTime(7));await page.screenshot({path:path.join(out,'assets/poster.jpg'),type:'jpeg',quality:95});
  console.log('Export complete',output);
 }finally{await browser.close();server.close();}
}
