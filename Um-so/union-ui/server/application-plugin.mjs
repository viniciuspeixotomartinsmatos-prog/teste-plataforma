import {createApplication} from './application.mjs';
import {protectedPath,signInResponse} from './access-policy.mjs';
function subscriptionResponse(req){return req.headers.accept?.includes('text/html')?new Response(null,{status:303,headers:{Location:'/plans','Cache-Control':'no-store'}}):Response.json({error:'Assinatura necessária.',code:'subscription_required'},{status:402,headers:{'Cache-Control':'no-store'}});}
export async function nodeRequest(req,origin,{headersOnly=false}={}){
 const headers=new Headers();for(const [name,value]of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(', '):value);
 // The public client cannot choose the address used by the authentication limiter.
 headers.set('x-umso-client-ip',req.socket.remoteAddress||'127.0.0.1');
 let body;
 if(!headersOnly&&!['GET','HEAD'].includes(req.method)){
  const limit=1500000,tooLarge=()=>Object.assign(new Error('Arquivo muito grande.'),{status:413});
  if(Number(headers.get('content-length'))>limit){req.resume();throw tooLarge();}
  body=await new Promise((resolve,reject)=>{const chunks=[];let size=0,overflow=false;req.on('data',chunk=>{size+=chunk.length;if(size>limit){if(!overflow){overflow=true;reject(tooLarge());}return;}if(!overflow)chunks.push(chunk);});req.once('end',()=>{if(!overflow)resolve(Buffer.concat(chunks));});req.once('error',reject);});
 }
 return new Request(new URL(req.url,origin),{method:headersOnly?'GET':req.method,headers,...(body?{body}:{})});
}
export async function nodeResponse(response,res){res.statusCode=response.status;for(const [name,value]of response.headers)if(name!=='set-cookie')res.setHeader(name,value);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}
export function createApplicationPlugin(options={}){return{name:'umso-application',async configureServer(server){
 const app=await createApplication(options);
 server.httpServer?.once('close',()=>app.close());
 server.middlewares.use(async(req,res,next)=>{try{
  const path=decodeURIComponent(new URL(req.url,app.origin).pathname);
  if(path.startsWith('/api/')&&!path.startsWith('/api/preview'))return nodeResponse(await app.handle(await nodeRequest(req,app.origin)),res);
  const development=path.startsWith('/src/')||path.startsWith('/node_modules/')||path.startsWith('/@')||path.startsWith('/__');
  if(!development&&protectedPath(path)){
   const request=await nodeRequest(req,app.origin,{headersOnly:true});
   if(!await app.isSignedIn(request))return nodeResponse(signInResponse(request),res);
   if(app.canAccessPlatform&&!await app.canAccessPlatform(request))return nodeResponse(subscriptionResponse(req),res);
  }
  if((path.startsWith('/code/')||path.startsWith('/tools-runtime/'))&&!await app.canReadCode(await nodeRequest(req,app.origin,{headersOnly:true})))return nodeResponse(new Response(JSON.stringify({error:'Assinatura necessária.',code:'subscription_required'}),{status:403,headers:{'Content-Type':'application/json'}}),res);
  next();
 }catch(error){res.statusCode=error.status||400;res.end(JSON.stringify({error:error.status===413?'Arquivo muito grande.':'Requisição inválida.'}));}});
}};}
