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
export async function standalonePreview(item,theme='dark',config,settings){
 const local=item.runtimePreviewPath||item.previewPath;
 if(!local)throw Error('Demonstração indisponível.');
 const url=theme==='light'&&local.startsWith('/previews/runtime/')?local.replace(/\.html$/,'.light.html'):local;
 let html=await fetchText(url);const mapping=await assetMapping(item.id);html=injectDemoAssets(html,mapping);
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
 const framework=(payload?.framework||item.framework)==='vue'?'Vue':'React';
 const entries={};
 for(const f of payload?.files||[]){
  if(item.availability!=='code'&&f.path==='preview.html')continue;
  const parts=(f.path||f.name||'component.tsx').replace(/\\/g,'/').split('/').filter(p=>p&&p!=='.'&&p!=='..'&&!p.includes(':'));
  entries['src/'+parts.join('/')]=strToU8(f.content||'');
 }
 if(payload?.demoCode)entries[framework==='Vue'?'example.vue':'example.tsx']=strToU8(payload.demoCode);
 entries['preview.html']=strToU8(await standalonePreview(item,theme,config,settings));
 const mapping=await assetMapping(item.id),media=new Set(Object.values(mapping));
 const sourceText=[...(payload?.files||[]).map(file=>file.content||''),payload?.demoCode||''].join('\n');
 for(const match of sourceText.matchAll(/["'(](\/(?!\/)[^\s"'()<>`\\]+\.(?:png|jpe?g|webp|avif|svg|gif|mp4|webm|mp3|wav|ogg|glb|gltf|hdr|exr))/gi))media.add(mapping[match[1]]||match[1]);
 for(const url of media){if(typeof url!=='string'||!url.startsWith('/')||url.split('/').includes('..'))continue;const response=await fetch(url);if(response.ok)entries['public'+url.split('?')[0]]=new Uint8Array(await response.arrayBuffer());}
 if(Object.keys(mapping).length)entries['demo-assets.json']=strToU8(JSON.stringify(mapping,null,2));
 if(settings)entries['visual-settings.json']=strToU8(JSON.stringify(settings,null,2));
 if(config)entries['preview-settings.json']=strToU8(JSON.stringify(config,null,2));
 entries['README.md']=strToU8(`# ${name||item.name}\n\nAbra preview.html no navegador para experimentar a demonstração. JavaScript e CSS locais estão incorporados no HTML; imagens, vídeos ou fontes externos usados pelo exemplo podem precisar de internet.\n\n${item.availability==='code'?'Os arquivos em src/ contêm o código disponível para integração ao seu projeto '+framework+'. Preserve os caminhos de importação ou adapte os aliases. Copie a pasta public/ para o diretório público do seu projeto. Se houver demo-assets.json, substitua as referências originais pelo mapa de mídias locais.':'Este pacote contém a demonstração HTML compilada. Os arquivos editáveis ainda não foram recuperados para este item.'}\n\nDependências: ${(payload?.dependencies||item.dependencies||[]).join(', ')}\n`);
 const notices=await fetchText('/licenses/ATTRIBUTIONS.md');
 entries['LICENSE-NOTICES.md']=strToU8(notices+'\n\n'+(typeof payload?.license==='string'?payload.license:JSON.stringify(payload?.license||item.license||{})));
 const licenses=await (await fetch('/licenses/manifest.json')).json();
 await Promise.all(licenses.map(async file=>{entries['licenses/'+file]=strToU8(await fetchText('/licenses/'+file));}));
 return zipSync(entries,{level:6});
}

export async function componentPrompt(item,payload,{name=item.name,description='',theme='dark',config,settings}={}){
 const framework=(payload?.framework||item.framework)==='vue'?'VUE':'REACT';
 const sourceFiles=payload?.files||[];
 const hasSource=item.availability==='code'&&sourceFiles.length>0;
 const implementation=hasSource?sourceFiles.map(f=>'// '+f.path+'\n'+f.content).join('\n\n'):(settings?await standalonePreview(item,theme,config,settings):(sourceFiles.find(f=>f.path==='preview.html')?.content||await standalonePreview(item,theme,config,settings)));
 return `Adicione o componente ${name} ao meu projeto.\n${description}\n\nMantenha a composição, as animações e a resposta às interações. Adapte as cores à identidade do projeto, preserve a acessibilidade e instale as dependências necessárias.\n\n${hasSource?'IMPLEMENTAÇÃO '+framework+' E ARQUIVOS AUXILIARES':'DEMONSTRAÇÃO HTML COMPLETA\nO HTML abaixo contém o componente compilado. Use-o como referência executável para reconstruir a implementação editável; não presuma que um import de pacote contém seu código.'}\n${implementation}\n\nDEPENDÊNCIAS\n${(payload?.dependencies||item.dependencies||[]).join(', ')}\n\nEXEMPLO DE USO\n${payload?.demoCode||''}${settings?'\nPERSONALIZAÇÃO VISUAL\n'+JSON.stringify(settings,null,2):''}${config?'\nPROPRIEDADES DO PREVIEW\n'+JSON.stringify(config,null,2):''}`;
}
