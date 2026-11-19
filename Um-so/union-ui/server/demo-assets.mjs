import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
let cache={mtime:0,items:{}};
const file=fileURLToPath(new URL('../public/data/demo-local-assets.json',import.meta.url));
export async function demoAssetsFor(id){try{const stat=await fs.stat(file);if(stat.mtimeMs!==cache.mtime)cache={mtime:stat.mtimeMs,items:JSON.parse(await fs.readFile(file,'utf8')).items||{}};return cache.items[id]||{};}catch{return{};}}
export function publicAssetCors(){return{name:'isolated-demo-assets',configureServer(server){
 const root=server.config.publicDir;
 server.middlewares.use(async(req,res,next)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return next();}
  const group=pathname.match(/^\/(assets|previews|code)\//)?.[1];if(!group)return next();
  if(!['GET','HEAD'].includes(req.method))return next();
  const target=path.resolve(root,'.'+pathname),scope=path.join(root,group)+path.sep;
  if(!target.startsWith(scope)||pathname.includes('\\')||pathname.split('/').some(part=>part.startsWith('.'))||/\.(sqlite|toml|log|pem)(?:-|$|\.)/i.test(pathname)){res.statusCode=403;return res.end('Forbidden');}
  // Vite caches the public directory inventory. Generated preview files are
  // intentionally ignored by its watcher; serve them from disk so a new
  // content hash never falls through to the SPA's index.html.
  let stat;try{stat=await fs.stat(target);}catch{return next();}if(!stat.isFile())return next();
  const types={'.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8','.json':'application/json','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.avif':'image/avif','.gif':'image/gif','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.glb':'model/gltf-binary'};
  if(group!=='code')res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.setHeader('X-Content-Type-Options','nosniff');
  let start=0,end=stat.size-1;if(req.headers.range){const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>end){res.statusCode=416;return res.end();}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}}
  res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',Math.max(0,end-start+1));if(req.method==='HEAD'||!stat.size)return res.end();
  try{await pipeline(createReadStream(target,{start,end}),res);}catch{if(!res.destroyed)res.destroy();}
 });
}};}
