import {injectPreviewEnvironment} from './preview-environment.js';
function inspectPreview(id){
 let failed=false,sent=false,lastMedia='';
 const send=(type,message)=>parent.postMessage({type,id,message,checked:true},'*');
 addEventListener('error',event=>{
  if(event.target!==window){if(event.target?.tagName==='SCRIPT'||event.target?.tagName==='LINK'&&event.target.rel==='stylesheet'){failed=true;send('preview-error','Não foi possível carregar um recurso da demonstração.');}return;}
  if(/^ResizeObserver loop/.test(event.message))return;
  failed=true;send('preview-error',event.message);
 },true);
 addEventListener('unhandledrejection',event=>{failed=true;send('preview-error',String(event.reason?.message||event.reason));});
 function inspect(){
  if(failed)return;
  const root=document.body||document.getElementById('root');
  const roots=root?[root]:[];for(let i=0;i<roots.length;i++)for(const node of roots[i].querySelectorAll('*'))if(node.shadowRoot)roots.push(node.shadowRoot);
  const select=selector=>roots.flatMap(scope=>[...scope.querySelectorAll(selector)]);
  const content=root&&((typeof root.innerText==='string'?root.innerText:root.textContent)?.trim()||select('canvas,svg,img,video,iframe,button,input,textarea,select,[role=slider],[role=progressbar]').some(node=>{const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&!node.closest('[aria-hidden=true]');})||select('div,span').some(node=>{const r=node.getBoundingClientRect(),style=getComputedStyle(node);return r.width>1&&r.height>1&&style.visibility!=='hidden'&&Number(style.opacity)>0&&(style.backgroundImage!=='none'||style.boxShadow!=='none'||parseFloat(style.borderTopWidth)>0&&style.borderTopColor!=='rgba(0, 0, 0, 0)'||style.backgroundColor!=='rgba(0, 0, 0, 0)'&&style.backgroundColor!==getComputedStyle(root).backgroundColor);}));
  if(!content){setTimeout(inspect,150);return;}
  const images=select('img').filter(image=>image.getAttribute('src')||image.getAttribute('srcset'));
  const broken=images.filter(image=>image.complete&&!image.naturalWidth);
  const brokenVideos=select('video').filter(video=>video.error);
  const media=[...broken.map(image=>image.currentSrc||image.src),...brokenVideos.map(video=>video.currentSrc||video.src)].join('|');
  if(media&&media!==lastMedia){lastMedia=media;send('preview-media-error',(broken.length+brokenVideos.length)+' recurso(s) da demonstração não carregaram.');}
  if(!sent&&images.some(image=>!image.complete&&(image.loading!=='lazy'||image.getBoundingClientRect().top<innerHeight))){setTimeout(inspect,150);return;}
  if(!media&&(!sent||lastMedia)){sent=true;lastMedia='';send('preview-ready');}
 }
 addEventListener('DOMContentLoaded',inspect,{once:true});addEventListener('load',inspect);
 document.addEventListener('load',event=>{if(event.target?.tagName==='IMG')inspect();},true);
 document.addEventListener('loadeddata',inspect,true);
 document.addEventListener('error',event=>{if(['IMG','VIDEO'].includes(event.target?.tagName))setTimeout(inspect,100);},true);
 if(document.readyState!=='loading')setTimeout(inspect,0);
}
export function instrumentPreviewHTML(html,id,baseURL){
 html=injectPreviewEnvironment(html);
 const base=String(baseURL).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 html=html.replace(/new URL\(window.location.href\)(\.searchParams\.get\((["'])theme\2\))/g,'new URL(document.baseURI)$1');
 const script='<base href="'+base+'"><script>('+inspectPreview.toString()+')('+JSON.stringify(id).replace(/</g,'\\u003c')+');</script>';
 return /<head(?:\s[^>]*)?>/i.test(html)?html.replace(/<head(?:\s[^>]*)?>/i,match=>match+script):script+html;
}
