import http from 'node:http';
import {createReadStream} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pipeline} from 'node:stream/promises';
import {createApplication} from './application.mjs';
import {nodeRequest,nodeResponse} from './application-plugin.mjs';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.wasm':'application/wasm','.zip':'application/zip'};
export async function createServer(options={}){
 const root=path.resolve(options.root||'dist/client'),app=await createApplication(options);
 await fs.access(path.join(root,'index.html'));
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  try{
   const pathname=decodeURIComponent(new URL(req.url,app.origin).pathname);
   if(pathname.includes('\0')||pathname.includes('\\'))throw Object.assign(Error(),{status:400});
   if(pathname.startsWith('/api/'))return await nodeResponse(await app.handle(await nodeRequest(req,app.origin)),res);
   if(!['GET','HEAD'].includes(req.method))throw Object.assign(Error(),{status:405});
   if(pathname.split('/').some(p=>p.startsWith('.'))||/\.(sqlite|toml|log|pem)(?:-|$|\.)/i.test(pathname))throw Object.assign(Error(),{status:404});
   if((pathname.startsWith('/code/')||pathname.startsWith('/tools-runtime/'))&&!await app.canReadCode(await nodeRequest(req,app.origin)))return await nodeResponse(new Response(JSON.stringify({error:'Assinatura necessária.',code:'subscription_required'}),{status:403,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}),res);
   let target=path.resolve(root,'.'+pathname);
   if(target!==root&&!target.startsWith(root+path.sep))throw Object.assign(Error(),{status:404});
   let stat;try{stat=await fs.stat(target);}catch{}
   if(!stat?.isFile()){
    if(path.extname(pathname)||!req.headers.accept?.includes('text/html'))throw Object.assign(Error(),{status:404});
    target=path.join(root,'index.html');stat=await fs.stat(target);
   }
   if(/^\/(assets|previews)\//.test(pathname))res.setHeader('Access-Control-Allow-Origin','*');
   const ext=path.extname(target).toLowerCase();res.setHeader('Content-Type',types[ext]||'application/octet-stream');
   const gated=pathname.startsWith('/code/')||pathname.startsWith('/tools-runtime/');
   res.setHeader('Cache-Control',gated?'private, no-store':ext==='.html'?'no-cache':'public, max-age=3600');
   let start=0,end=stat.size-1;
   if(req.headers.range){const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!range)throw Object.assign(Error(),{status:416});start=range[1]?Number(range[1]):Math.max(0,stat.size-Number(range[2]));end=range[1]&&range[2]?Math.min(Number(range[2]),end):end;if(start>end||start>=stat.size)throw Object.assign(Error(),{status:416});res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
   res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',stat.size?end-start+1:0);
   if(req.method==='HEAD'||!stat.size)return res.end();
   await pipeline(createReadStream(target,{start,end}),res);
  }catch(error){if(res.headersSent){res.destroy();return;}res.statusCode=error.status||500;res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({error:error.status===413?'Arquivo muito grande.':error.status===403?'Acesso restrito.':error.status===404?'Não encontrado.':'Não foi possível concluir.'}));}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;
 server.once('close',()=>app.close());return{server,app};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {server}=await createServer();const port=Number(process.env.PORT||4173);
 server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Um só. disponível na porta ${port}.`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
}
