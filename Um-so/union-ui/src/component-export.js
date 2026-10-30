import {addPlaygroundBridge} from './playground-bridge.js';
import {injectDemoAssets} from './demo-asset-bridge.js';
let localAssets;
async function assetMapping(id){localAssets??=fetch('/data/demo-local-assets.json').then(r=>r.ok?r.json():{items:{}}).catch(()=>({items:{}}));return(await localAssets).items?.[id]||{};}
async function embedMedia(html,ancestors=new Set()){
 const paths=new Set([...html.matchAll(/(?:["'(])(\/(?!\/)[^\s"'()<>`\\]+\.(?:png|jpe?g|webp|avif|svg|gif|mp4|webm|mp3|wav|ogg|glb|gltf|hdr|exr|json|js|woff2?)(?:\?[^\s"'()<>`\\]*)?)/gi)].map(m=>m[1]));
 for(const path of paths){if(path.includes('${')||ancestors.has(path))continue;const response=await fetch(path);if(!response.ok)continue;const extension=path.split('?')[0].split('.').pop().toLowerCase();const nested=extension==='json'?await embedMedia(await response.text(),new Set([...ancestors,path])):null;const bytes=nested===null?new Uint8Array(await response.arrayBuffer()):new TextEncoder().encode(nested);let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));const ext=path.split('?')[0].split('.').pop().toLowerCase(),type=response.headers?.get?.('content-type')||({svg:'image/svg+xml',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',wav:'audio/wav',mp3:'audio/mpeg',ogg:'audio/ogg',glb:'model/gltf-binary',js:'text/javascript',json:'application/json',woff2:'font/woff2',woff:'font/woff'}[ext]||'application/octet-stream');html=html.replaceAll(path,'data:'+type+';base64,'+btoa(binary));}
 return html;
}
async function fetchText(url){
 const response=await fetch(url);
 if(!response.ok)throw Error('Não foi possível obter '+url);
 return response.text();
}
async function embeddedFont(url){
 const response=await fetch(url);
 if(!response.ok)throw Error('Não foi possível obter a fonte da demonstração.');
 const bytes=new Uint8Array(await response.arrayBuffer());
 let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
 return 'data:font/woff2;base64,'+btoa(binary);
}
async function inlineRecoveredPreview(html){
 const cache=new Map();
 const assetPattern=/\/previews\/recovered\/(?:[A-Za-z0-9_@.,~%+-]+\/)*[A-Za-z0-9_@.,~%+-]+\.(?:m?js|css|png|jpe?g|webp|avif|svg|gif|ico|woff2?|ttf|otf|mp4|webm|glb|gltf|json|wasm|txt)(?:\?[^"'`\s)<>]*)?/gi;
 async function embedAssets(text,ancestors=new Set()){
  for(const url of new Set([...text.matchAll(assetPattern)].map(m=>m[0]))){
   if(ancestors.has(url))throw Error('Dependência circular no pacote recuperado: '+url);
   if(!cache.has(url))cache.set(url,(async()=>{const response=await fetch(url);if(!response.ok)throw Error('Recurso indisponível no pacote: '+url);let data;let mime=response.headers.get('content-type')||'application/octet-stream';if(/\.(?:m?js|css|json|txt)(?:\?|$)/.test(url)){mime=/\.m?js(?:\?|$)/.test(url)?'text/javascript':/\.css(?:\?|$)/.test(url)?'text/css':mime;data=new TextEncoder().encode(await embedAssets(await response.text(),new Set([...ancestors,url])));}else data=new Uint8Array(await response.arrayBuffer());let binary='';for(let offset=0;offset<data.length;offset+=8192)binary+=String.fromCharCode(...data.subarray(offset,offset+8192));return 'data:'+mime+';base64,'+btoa(binary);})());
   text=text.split(url).join(await cache.get(url));
  }return text;
 }
 for(const match of [...html.matchAll(/<script\b([^>]*?)src=["'](\/previews\/recovered\/[^"']+\.js)["']([^>]*)><\/script>/g)]){
  const code=await embedAssets(await fetchText(match[2]));html=html.replace(match[0],()=>'<script'+match[1]+match[3]+'>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
 }
 return (await embedAssets(html)).replaceAll('/previews/recovered/build','https://profitize.com.br/build');
}
export async function standalonePreview(item,theme='dark',config,settings){
 const local=item.runtimePreviewPath||item.previewPath;
 if(!local)throw Error('Demonstração indisponível.');
 const url=theme==='light'&&local.startsWith('/previews/runtime/')?local.replace(/\.html$/,'.light.html'):local;
 let html=await fetchText(url);const mapping=await assetMapping(item.id);html=injectDemoAssets(html,mapping);
 if(local.startsWith('/previews/recovered/')){
  // Retain stylesheet contents before embedding their media and font references.
  for(const match of [...html.matchAll(/<link\b[^>]*href=["'](\/previews\/recovered\/[^"']+\.css)["'][^>]*>/g)]){const css=await fetchText(match[1]);html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}
  html=await inlineRecoveredPreview(html);
 }

 // Inline the locally compiled JS and stylesheet so the downloaded demo can
 // run outside this server. Original third-party media URLs remain intact.
 for(const match of [...html.matchAll(/<script\b[^>]*src=["'](\/previews\/runtime\/[^"']+\.js)["'][^>]*><\/script>/g)]){
  const js=await fetchText(match[1]);
  html=html.replace(match[0],()=>'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
 }
 for(const match of [...html.matchAll(/<link\b[^>]*href=["'](\/assets\/preview\.css)["'][^>]*>/g)]){
  let css=await fetchText(match[1]);
  for(const url of new Set([...css.matchAll(/url\(["']?(\/assets\/fonts\/[^)'"\s]+)["']?\)/g)].map(m=>m[1])))css=css.replaceAll(url,await embeddedFont(url));
  html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');
 }
 if(config){
  const data=JSON.stringify(config).replace(/</g,'\\u003c');
  html=html.replace('</body>',()=>`<script>window.addEventListener('message',function(e){if(e.data?.type==='preview-ready')window.postMessage({type:'preview:set-props',props:${data}},'*')});setTimeout(()=>window.postMessage({type:'preview:set-props',props:${data}},'*'),100);</script></body>`);
 }
 for(const [from,to]of Object.entries(mapping))if(from.startsWith('/')||from.startsWith('http'))html=html.replaceAll(from,to);
 html=await embedMedia(html);
 html=html.replace(/new URL\(window.location.href\)\.searchParams\.get\((["'])theme\1\)/g,JSON.stringify(theme));
 return settings?addPlaygroundBridge(html,item.id,settings):html;
}
export async function componentArchive(item,payload,{name,theme='dark',config,settings}={}){
 const {zipSync,strToU8}=await import('fflate');
 const format=payload?.framework||item.framework;
 const framework=format==='vue'?'Vue':format==='html'?'HTML':'React';
 const entries={};
 for(const f of payload?.files||[]){
  if(item.availability!=='code'&&f.path==='preview.html')continue;
  const parts=(f.path||f.name||'component.tsx').replace(/\\/g,'/').split('/').filter(p=>p&&p!=='.'&&p!=='..'&&!p.includes(':'));
  entries['src/'+parts.join('/')]=strToU8(f.content||'');
 }
 if(payload?.demoCode)entries[framework==='Vue'?'example.vue':'example.tsx']=strToU8(payload.demoCode);
 const recoveredDemo=item.previewPath?.match(/^\/previews\/recovered\/demos\/([^/]+)\/index\.html$/);
 if(recoveredDemo){
  const base='/previews/recovered/demos/'+recoveredDemo[1],manifest=await (await fetch('/data/recovered-demo-assets.json')).json();
  const localize=text=>text.replaceAll(base+'/','/').replaceAll('/previews/recovered/compat.js','/compat.js');
  for(const file of manifest[recoveredDemo[1]]||[]){if(!file||file.split('/').some(part=>part==='..'||part==='.')||file.startsWith('/'))throw Error('Caminho inválido no pacote recuperado.');const response=await fetch(base+'/'+file);if(!response.ok)throw Error('Arquivo indisponível: '+file);entries[file]=/\.(?:m?js|css|html|json|svg|txt)$/i.test(file)?strToU8(localize(await response.text())):new Uint8Array(await response.arrayBuffer());}
  entries['preview.html']=entries['index.html'];entries['compat.js']=strToU8(await fetchText('/previews/recovered/compat.js'));
  entries['serve.mjs']=strToU8(`import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';const root=path.dirname(fileURLToPath(import.meta.url));const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'};http.createServer((req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name==='/'?'/preview.html':name));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Access-Control-Allow-Origin','*');const stream=fs.createReadStream(file);stream.on('error',()=>{res.statusCode=404;res.end('Not found')});stream.pipe(res);}catch{res.statusCode=404;res.end('Not found')}}).listen(Number(process.env.PORT)||4175,'127.0.0.1',()=>console.log('Abra http://127.0.0.1:'+(process.env.PORT||4175)));`);
 }else entries['preview.html']=strToU8(await standalonePreview(item,theme,config,settings));
 const mapping=await assetMapping(item.id),media=new Set(Object.values(mapping));
 const sourceText=[...(payload?.files||[]).map(file=>file.content||''),payload?.demoCode||''].join('\n');
 for(const match of sourceText.matchAll(/["'(](\/(?!\/)[^\s"'()<>`\\]+\.(?:png|jpe?g|webp|avif|svg|gif|mp4|webm|mp3|wav|ogg|glb|gltf|hdr|exr))/gi))media.add(mapping[match[1]]||match[1]);
 for(const url of media){if(typeof url!=='string'||!url.startsWith('/')||url.split('/').includes('..'))continue;const response=await fetch(url);if(response.ok)entries['public'+url.split('?')[0]]=new Uint8Array(await response.arrayBuffer());}
 if(Object.keys(mapping).length)entries['demo-assets.json']=strToU8(JSON.stringify(mapping,null,2));
 if(settings)entries['visual-settings.json']=strToU8(JSON.stringify(settings,null,2));
 if(config)entries['preview-settings.json']=strToU8(JSON.stringify(config,null,2));
 entries['README.md']=strToU8(`# ${name||item.name}\n\n${recoveredDemo?'Execute node serve.mjs nesta pasta e abra http://127.0.0.1:4175. O servidor local é necessário para os módulos JavaScript e seus imports circulares.':'Abra preview.html no navegador para experimentar a demonstração. JavaScript e CSS locais estão incorporados no HTML.'} Imagens, vídeos ou fontes externos usados pelo exemplo podem precisar de internet.\n\n${item.availability==='code'?'Os arquivos em src/ contêm o código disponível para integração ao seu projeto '+framework+'. Preserve os caminhos de importação ou adapte os aliases.':'Este pacote contém a demonstração HTML compilada. Os arquivos editáveis ainda não foram recuperados para este item.'}\n\nDependências: ${(payload?.dependencies||item.dependencies||[]).join(', ')}\n`);
 const notices=await fetchText('/licenses/ATTRIBUTIONS.md');
 entries['LICENSE-NOTICES.md']=strToU8(notices+'\n\n'+(typeof payload?.license==='string'?payload.license:JSON.stringify(payload?.license||item.license||{})));
 const licenses=await (await fetch('/licenses/manifest.json')).json();
 await Promise.all(licenses.map(async file=>{entries['licenses/'+file]=strToU8(await fetchText('/licenses/'+file));}));
 return zipSync(entries,{level:6});
}

export async function componentPrompt(item,payload,{name=item.name,description='',theme='dark',config,settings}={}){
 const format=payload?.framework||item.framework;
 const framework=format==='vue'?'VUE':format==='html'?'HTML':'REACT';
 if(payload?.reconstructionPrompt)return payload.reconstructionPrompt+'\n\nREFERÊNCIA VISUAL ORIGINAL\n'+(item.sourceUrl||'Consulte a prévia da biblioteca.')+'\n\nA demonstração HTML compilada e seus recursos estão no pacote para download. Use essa referência para reconstruir a implementação editável. Este prompt não contém o projeto original do servidor.'+(settings?'\n\nPERSONALIZAÇÃO VISUAL\n'+JSON.stringify(settings,null,2):'')+(config?'\n\nPROPRIEDADES DA PRÉVIA\n'+JSON.stringify(config,null,2):'');
 const sourceFiles=payload?.files||[];
 const hasSource=item.availability==='code'&&sourceFiles.length>0;
 const implementation=hasSource?sourceFiles.map(f=>'// '+f.path+'\n'+f.content).join('\n\n'):(settings?await standalonePreview(item,theme,config,settings):(sourceFiles.find(f=>f.path==='preview.html')?.content||await standalonePreview(item,theme,config,settings)));
 return `${payload?.reconstructionPrompt?payload.reconstructionPrompt+'\n\n':''}Adicione o componente ${name} ao meu projeto.\n${description}\n\nMantenha a composição, as animações e a resposta às interações. Adapte as cores à identidade do projeto, preserve a acessibilidade e instale as dependências necessárias.\n\n${hasSource?'IMPLEMENTAÇÃO '+framework+' E ARQUIVOS AUXILIARES':'DEMONSTRAÇÃO HTML COMPLETA\nO HTML abaixo contém o componente compilado. Use-o como referência executável para reconstruir a implementação editável; não presuma que um import de pacote contém seu código.'}\n${implementation}\n\nDEPENDÊNCIAS\n${(payload?.dependencies||item.dependencies||[]).join(', ')}\n\nEXEMPLO DE USO\n${payload?.demoCode||''}${settings?'\nPERSONALIZAÇÃO VISUAL\n'+JSON.stringify(settings,null,2):''}${config?'\nPROPRIEDADES DO PREVIEW\n'+JSON.stringify(config,null,2):''}`;
}
