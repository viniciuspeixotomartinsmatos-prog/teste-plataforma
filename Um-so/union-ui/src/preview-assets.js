let compilerReady;
const groups=/^\/(?:assets|previews|demos|tools-runtime|avatars|mist)\//;
export function previewAssetURL(value,base){
 try{const url=new URL(String(value),base),origin=new URL(base).origin,pathname=decodeURIComponent(url.pathname);if(url.origin!==origin||!groups.test(pathname)||pathname.includes('\\')||/%(?:2e|2f|5c)/i.test(pathname)||pathname.split('/').some(part=>part.startsWith('.')))return null;return url;}catch{return null;}
}
const escapeScript=text=>text.replace(/<\/script/gi,'<\\/script');
const mimeFor=url=>({woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',svg:'image/svg+xml',png:'image/png',webp:'image/webp',avif:'image/avif',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',mp4:'video/mp4',webm:'video/webm'}[new URL(url).pathname.split('.').pop()]||'application/octet-stream');

// Read protected resources in the authenticated parent. The iframe keeps its
// opaque origin and receives executable HTML without anonymous script imports.
export async function preparePreviewAssets(html,base,{fetcher=fetch,compiler,signal}={}){
 const cache=new Map();
 const read=url=>{if(!cache.has(url))cache.set(url,(async()=>{const response=await fetcher(url,{credentials:'same-origin',signal});if(!response.ok)throw Error('Não foi possível carregar um recurso da prévia.');return {bytes:new Uint8Array(await response.arrayBuffer()),mime:response.headers.get('content-type')};})());return cache.get(url);};
 const text=async url=>new TextDecoder().decode((await read(url)).bytes);
 async function dataURL(url){const resource=await read(url);let binary='';for(let i=0;i<resource.bytes.length;i+=8192)binary+=String.fromCharCode(...resource.bytes.subarray(i,i+8192));return 'data:'+(resource.mime&&resource.mime!=='text/plain'&&resource.mime!=='application/octet-stream'?resource.mime:mimeFor(url))+';base64,'+btoa(binary);}
 async function stylesheet(css,url){for(const match of [...css.matchAll(/url\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^)]*))\s*\)/g)]){const value=(match[1]??match[2]??match[3]).trim();if(/^(?:data:|#|%23)/i.test(value))continue;const local=previewAssetURL(value,url);if(local)css=css.split(match[0]).join('url("'+await dataURL(local.href)+'")');}return css;}
 html=html.replace(/<link\b[^>]*rel=["'](?:modulepreload|preload)["'][^>]*>/gi,'');
 for(const match of [...html.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]){const url=previewAssetURL(match[1],base);if(!url)continue;if(/rel=["']stylesheet["']/i.test(match[0])){const css=await stylesheet(await text(url.href),url.href);html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}else if(/rel=["'](?:shortcut |apple-touch-)?icon["']/i.test(match[0])){const data=await dataURL(url.href);html=html.replace(match[0],()=>match[0].replace(match[1],data));}}
 async function bundle(url){
  const engine=compiler||await import('esbuild-wasm');if(!compiler){compilerReady||=engine.initialize({wasmURL:new URL('/assets/esbuild.wasm',base).href,worker:true});await compilerReady;}
  const options={entryPoints:[url],bundle:true,write:false,outfile:'preview.js',target:'es2022',logLevel:'silent',plugins:[{name:'authenticated-preview',setup(build){
   build.onResolve({filter:/.*/},args=>{const local=previewAssetURL(args.path,args.importer||base);if(local)return {path:local.href,namespace:'preview-static'};if(/^(?:https?:|data:)/.test(args.path))return {path:args.path,external:true};throw Error('Dependência da prévia não encontrada.');});
   build.onLoad({filter:/.*/,namespace:'preview-static'},async args=>{const contents=await text(args.path);return /\.css(?:\?|$)/.test(args.path)?{contents:await stylesheet(contents,args.path),loader:'css'}:{contents:contents.replaceAll('import.meta.url',JSON.stringify(args.path)),loader:'js'};});
  }}]};
  let result,module=false;try{result=await engine.build({...options,format:'iife'});}catch(error){if(!String(error.message).includes('Top-level await'))throw error;module=true;result=await engine.build({...options,format:'esm'});}
  return {code:result.outputFiles.find(file=>file.path.endsWith('.js'))?.text||'',css:result.outputFiles.find(file=>file.path.endsWith('.css'))?.text||'',module};
 }
 for(const match of [...html.matchAll(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi)]){
  const url=previewAssetURL(match[2],base);if(!url)continue;const module=/type\s*=\s*["']module["']/i.test(match[1]+match[3]);const compiled=module?await bundle(url.href):{code:await text(url.href)};
  const deferred=(module||/\bdefer\b/i.test(match[1]+match[3]))&&!compiled.module;
  const code=deferred?`(()=>{const run=()=>{${compiled.code}\n};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();`:compiled.code;
  html=html.replace(match[0],()=> (compiled.css?'<style>'+compiled.css.replace(/<\/style/gi,'<\\/style')+'</style>':'')+'<script'+(compiled.module?' type="module"':'')+'>'+escapeScript(code)+'</script>');
 }
 return html;
}

// Only public static paths can cross this channel. Never relay application APIs,
// cookies, request headers or arbitrary origins on behalf of embedded code.
export function createPreviewAssetResponder(frame,id,base,fetcher=fetch){
 return async event=>{
  const data=event.data;if(event.source!==frame||data?.type!=='preview:asset'||data.id!==id||typeof data.requestId!=='string'||data.requestId.length>100)return;
  const url=previewAssetURL(data.url,base);if(!url)return;
  try{const response=await fetcher(url.href,{credentials:'same-origin'});const bytes=await response.arrayBuffer();frame.postMessage({type:'preview:asset-result',id,requestId:data.requestId,status:response.status,mime:response.headers.get('content-type')||mimeFor(url.href),bytes},'*',[bytes]);}catch{frame.postMessage({type:'preview:asset-result',id,requestId:data.requestId,error:'Recurso da prévia indisponível.'},'*');}
 };
}

export function installPreviewAssetClient(id,base){
 const pending=new Map();let counter=0;const origin=new URL(base).origin;
 const local=value=>{try{const url=new URL(String(value),base);return url.origin===origin&&/^\/(?:assets|previews|demos|tools-runtime|avatars|mist)\//.test(url.pathname)?url.href:null;}catch{return null;}};
 const request=url=>new Promise((resolve,reject)=>{const requestId=String(++counter),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('Tempo limite ao carregar recurso da prévia.'));},30000);pending.set(requestId,{resolve,reject,timer});parent.postMessage({type:'preview:asset',id,requestId,url},'*');});
 addEventListener('message',event=>{const data=event.data;if(event.source!==parent||data?.type!=='preview:asset-result'||data.id!==id)return;const entry=pending.get(data.requestId);if(!entry)return;pending.delete(data.requestId);clearTimeout(entry.timer);if(data.error)entry.reject(Error(data.error));else entry.resolve(data);});
 const nativeFetch=window.fetch?.bind(window);if(nativeFetch)window.fetch=async(input,options)=>{const url=local(input?.url||input),method=options?.method||input?.method||'GET';if(!url||!['GET','HEAD'].includes(method.toUpperCase()))return nativeFetch(input,options);const resource=await request(url);return new Response(resource.bytes,{status:resource.status,headers:{'content-type':resource.mime}});};
 const nativeSet=Element.prototype.setAttribute,nativeRemove=Element.prototype.removeAttribute,assigned=new WeakMap(),blobs=new WeakMap(),loading=new WeakMap();
 function assign(node,name,value){const url=local(value);if(!url)return nativeSet.call(node,name,value);let attributes=assigned.get(node);if(!attributes)assigned.set(node,attributes={});if(attributes[name]===url)return;attributes[name]=url;const work=request(url).then(resource=>{if(attributes[name]!==url)return;if(resource.status<200||resource.status>=300)throw Error('Mídia da prévia indisponível.');const previous=blobs.get(node);if(previous)URL.revokeObjectURL(previous);const blob=URL.createObjectURL(new Blob([resource.bytes],{type:resource.mime}));blobs.set(node,blob);if(node.tagName==='IMG'&&name==='src'){nativeRemove.call(node,'srcset');for(const source of node.closest('picture')?.querySelectorAll('source')||[])nativeRemove.call(source,'srcset');}nativeSet.call(node,name,blob);}).catch(()=>{nativeSet.call(node,name,value);});loading.set(node,work);}
 Element.prototype.setAttribute=function(name,value){if(name==='srcset'&&this.tagName==='IMG'&&assigned.has(this)){nativeRemove.call(this,name);return;}if((name==='src'||name==='poster')&&/^(IMG|VIDEO|AUDIO|SOURCE)$/.test(this.tagName)&&local(value)){assign(this,name,value);return;}return nativeSet.call(this,name,value);};
 for(const Type of [HTMLImageElement,HTMLMediaElement,HTMLSourceElement]){const descriptor=Object.getOwnPropertyDescriptor(Type.prototype,'src');if(descriptor?.set)Object.defineProperty(Type.prototype,'src',{...descriptor,set(value){if(local(value))assign(this,'src',value);else descriptor.set.call(this,value);}});}
 const decode=HTMLImageElement.prototype.decode;if(decode)HTMLImageElement.prototype.decode=function(...args){return Promise.resolve(loading.get(this)).then(()=>decode.apply(this,args));};
 function inspect(root){const nodes=[...(root.querySelectorAll?.('img[src],video[src],video[poster],audio[src],source[src]')||[])];if(root.matches?.('img[src],video[src],video[poster],audio[src],source[src]'))nodes.push(root);for(const node of nodes)for(const name of ['src','poster']){const value=node.getAttribute(name);if(value&&local(value))assign(node,name,value);}}
 new MutationObserver(records=>{for(const record of records)if(record.type==='attributes')inspect(record.target);else for(const node of record.addedNodes)if(node.nodeType===1)inspect(node);}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','poster']});
}

export function addPreviewAssetClient(html,id,base){const script='<script data-preview-assets>('+installPreviewAssetClient.toString()+')('+JSON.stringify(id).replace(/</g,'\\u003c')+','+JSON.stringify(base).replace(/</g,'\\u003c')+');</script>';return html.replace(/<head(?:\s[^>]*)?>/i,match=>match+script);}
