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
export async function standalonePreview(item,theme='dark',config){
 const local=item.runtimePreviewPath||item.previewPath;
 if(!local)throw Error('Demonstração indisponível.');
 const url=theme==='light'&&local.startsWith('/previews/runtime/')?local.replace(/\.html$/,'.light.html'):local;
 let html=await fetchText(url);
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
 return html;
}
export async function componentArchive(item,payload,{name,theme='dark',config}={}){
 const {zipSync,strToU8}=await import('fflate');
 const framework=(payload?.framework||item.framework)==='vue'?'Vue':'React';
 const entries={};
 for(const f of payload?.files||[]){
  if(item.availability!=='code'&&f.path==='preview.html')continue;
  const parts=(f.path||f.name||'component.tsx').replace(/\\/g,'/').split('/').filter(p=>p&&p!=='.'&&p!=='..'&&!p.includes(':'));
  entries['src/'+parts.join('/')]=strToU8(f.content||'');
 }
 if(payload?.demoCode)entries[framework==='Vue'?'example.vue':'example.tsx']=strToU8(payload.demoCode);
 entries['preview.html']=strToU8(await standalonePreview(item,theme,config));
 if(config)entries['preview-settings.json']=strToU8(JSON.stringify(config,null,2));
 entries['README.md']=strToU8(`# ${name||item.name}\n\nAbra preview.html no navegador para experimentar a demonstração. JavaScript e CSS locais estão incorporados no HTML; imagens, vídeos ou fontes externos usados pelo exemplo podem precisar de internet.\n\n${item.availability==='code'?'Os arquivos em src/ contêm o código disponível para integração ao seu projeto '+framework+'. Preserve os caminhos de importação ou adapte os aliases.':'Este pacote contém a demonstração HTML compilada. Os arquivos editáveis ainda não foram recuperados para este item.'}\n\nDependências: ${(payload?.dependencies||item.dependencies||[]).join(', ')}\n`);
 const notices=await fetchText('/licenses/ATTRIBUTIONS.md');
 entries['LICENSE-NOTICES.md']=strToU8(notices+'\n\n'+(typeof payload?.license==='string'?payload.license:JSON.stringify(payload?.license||item.license||{})));
 const licenses=await (await fetch('/licenses/manifest.json')).json();
 await Promise.all(licenses.map(async file=>{entries['licenses/'+file]=strToU8(await fetchText('/licenses/'+file));}));
 return zipSync(entries,{level:6});
}

export async function componentPrompt(item,payload,{name=item.name,description='',theme='dark',config}={}){
 const framework=(payload?.framework||item.framework)==='vue'?'VUE':'REACT';
 const sourceFiles=payload?.files||[];
 const hasSource=item.availability==='code'&&sourceFiles.length>0;
 const implementation=hasSource?sourceFiles.map(f=>'// '+f.path+'\n'+f.content).join('\n\n'):(sourceFiles.find(f=>f.path==='preview.html')?.content||await standalonePreview(item,theme,config));
 return `Adicione o componente ${name} ao meu projeto.\n${description}\n\nMantenha a composição, as animações e a resposta às interações. Adapte as cores à identidade do projeto, preserve a acessibilidade e instale as dependências necessárias.\n\n${hasSource?'IMPLEMENTAÇÃO '+framework+' E ARQUIVOS AUXILIARES':'DEMONSTRAÇÃO HTML COMPLETA\nO HTML abaixo contém o componente compilado. Use-o como referência executável para reconstruir a implementação editável; não presuma que um import de pacote contém seu código.'}\n${implementation}\n\nDEPENDÊNCIAS\n${(payload?.dependencies||item.dependencies||[]).join(', ')}\n\nEXEMPLO DE USO\n${payload?.demoCode||''}${config?'\nPROPRIEDADES DO PREVIEW\n'+JSON.stringify(config,null,2):''}`;
}
