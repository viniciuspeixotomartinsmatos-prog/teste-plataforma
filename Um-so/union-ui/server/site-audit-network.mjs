import http from 'node:http';
import https from 'node:https';
import {lookup} from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
export const auditError=(code,message,status=400)=>Object.assign(Error(message),{code,status});
export function publicAddress(value){try{const parsed=ipaddr.parse(value);return parsed.range()==='unicast'&&!(parsed.kind()==='ipv6'&&parsed.isIPv4MappedAddress());}catch{return false;}}
export function publicSiteURL(value){
 if(typeof value!=='string'||!value.trim()||value.length>2048||/[\s\\\u0000-\u001f]/.test(value))throw auditError('invalid','Informe o endereço público do site.');
 let url;try{url=new URL(/^[a-z][a-z\d+.-]*:/i.test(value)?value:'https://'+value);}catch{throw auditError('invalid','Esse endereço não parece um site.');}
 const host=url.hostname.toLowerCase().replace(/\.$/,'');
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port||ipaddr.isValid(host.replace(/^\[|\]$/g,''))||!host.includes('.')||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.localhost')||host.endsWith('.test')||host.endsWith('.invalid')||host==='localhost'||!host.split('.').every(part=>/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(part)))throw auditError('blocked','Só analisamos sites públicos com domínio, sem credenciais ou portas personalizadas.');
 if([...url.searchParams.keys()].some(key=>/token|secret|password|session|auth|api.?key|signature|code/i.test(key)))throw auditError('sensitive_url','Remova tokens, senhas ou códigos do endereço antes de analisar.');
 url.hostname=host;url.hash='';return url;
}
export async function resolvePublic(host,{signal,resolver=lookup,timeoutMs=5000}={}){
 let timer,abort;try{return await Promise.race([resolver(host,{all:true,verbatim:true}),new Promise((_,reject)=>{abort=()=>reject(new DOMException('Análise cancelada.','AbortError'));if(signal?.aborted)return abort();signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>reject(auditError('dns','Não conseguimos localizar esse domínio a tempo.',504)),timeoutMs);})]);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
async function pinnedRequest(url,{signal,maxBytes=2000000,resolver=lookup,timeoutMs=12000,requestImpl}={}){
 let addresses;try{addresses=await resolvePublic(url.hostname,{signal,resolver,timeoutMs:Math.min(timeoutMs,5000)});}catch(error){if(error.name==='AbortError'||error.status)throw error;throw auditError('dns','Não conseguimos localizar esse domínio.');}
 if(!addresses.length||addresses.some(row=>!publicAddress(row.address)))throw auditError('blocked','O endereço aponta para uma rede privada ou reservada.');
 const selected=addresses.find(row=>row.family===4)||addresses[0];
 return new Promise((resolve,reject)=>{
  const request=(requestImpl||(url.protocol==='https:'?https:http).request)(url,{method:'GET',agent:false,signal,headers:{'User-Agent':'nitido-SiteAudit/1.0 (+public-site-inspection)','Accept':'text/html,application/xhtml+xml,text/plain,application/xml,application/javascript,*/*;q=0.2','Accept-Encoding':'identity'},lookup:(_host,options,callback)=>callback(null,...(options?.all?[[selected]]:[selected.address,selected.family]))},response=>{
   if([301,302,303,307,308].includes(response.statusCode)){resolve({status:response.statusCode,headers:response.headers,body:Buffer.alloc(0),bytes:0});response.destroy();return;}
   const chunks=[];let size=0;
   response.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){request.destroy(auditError('too_large','A página excede o limite de leitura desta análise.'));return;}chunks.push(chunk);});
   response.once('end',()=>{if(!response.complete)return reject(auditError('refused','A resposta do site foi interrompida.'));resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks),bytes:size});});response.once('error',reject);
  });
  const timer=setTimeout(()=>request.destroy(auditError('timeout','O site demorou para responder.',504)),timeoutMs);
  request.once('close',()=>clearTimeout(timer));request.once('error',error=>reject(error.code?.startsWith('CERT_')||/CERT|TLS|SSL/.test(error.code||'')?auditError('tls','O certificado HTTPS não pôde ser validado.'):error.name==='AbortError'?error:error.status?error:auditError('refused','Não foi possível abrir o site.')));request.end();
 });
}
export async function fetchPublicSite(value,{signal,transport=pinnedRequest,maxRedirects=5,...options}={}){
 let url=publicSiteURL(String(value));const redirects=[];
 for(let count=0;count<=maxRedirects;count++){
  if(signal?.aborted)throw new DOMException('Análise cancelada.','AbortError');
  const response=await transport(url,{signal,...options});
  if([301,302,303,307,308].includes(response.status)){
   if(count===maxRedirects||!response.headers.location)throw auditError('redirects','O site redireciona muitas vezes ou informa um destino inválido.');
   const next=publicSiteURL(new URL(response.headers.location,url).href);redirects.push({from:url.href,to:next.href,status:response.status});url=next;continue;
  }
  if(response.status<200||response.status>=400)throw auditError('http_error','O site respondeu com erro HTTP '+response.status+'.');
  if(response.headers['content-encoding']&&!/identity/i.test(response.headers['content-encoding']))throw auditError('encoding','O servidor enviou uma codificação não suportada para esta inspeção.');
  return{...response,url:url.href,redirects};
 }
}
