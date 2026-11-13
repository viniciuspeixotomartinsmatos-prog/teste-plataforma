import {installPreviewForms} from './preview-forms.js';
import {injectPreviewEnvironment} from './preview-environment.js';
import {observePreviewCanvas} from './preview-canvas.js';
function inspectPreview(id,dependencyWarning,observeCanvas,installForms){
 installForms(window);
 let failed=false,sent=false,lastMedia='';
 const observedCanvases=observeCanvas(inspect);
 const send=(type,message)=>parent.postMessage({type,id,message,checked:true},'*');
 addEventListener('error',event=>{
  if(event.target!==window){if(event.target?.tagName==='SCRIPT'||event.target?.tagName==='LINK'&&event.target.rel==='stylesheet'){failed=true;send('preview-error','Não foi possível carregar um recurso da demonstração.');}return;}
  if(/^ResizeObserver loop/.test(event.message))return;
  failed=true;send('preview-error',event.message);
 },true);
 addEventListener('unhandledrejection',event=>{const message=String(event.reason?.message||event.reason);if(dependencyWarning&&message==='Failed to fetch'&&document.getElementById('root')?.innerText?.trim()){send('preview-warning',message);return;}failed=true;send('preview-error',message);});
 function inspect(){
  if(failed)return;
  const root=document.body||document.getElementById('root');
  const roots=root?[root]:[];for(let i=0;i<roots.length;i++)for(const node of roots[i].querySelectorAll('*'))if(node.shadowRoot)roots.push(node.shadowRoot);
  const select=selector=>roots.flatMap(scope=>[...scope.querySelectorAll(selector)]);
  // A mounted canvas or a solid background does not prove a GPU frame was
  // presented. Respect renderer startup markers before accepting readiness.
  if(select('[data-preview-pending="true"]').length){setTimeout(inspect,150);return;}
  const awaitingRenderer=node=>node.closest('[data-ready="false"]')?.querySelector('canvas');
  const opaque=color=>Boolean(color)&&color!=='transparent'&&!/^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(color);
  function hasPaint(style,background){
   return style.visibility!=='hidden'&&style.display!=='none'&&Number(style.opacity)>0&&(Boolean(style.backgroundImage)&&style.backgroundImage!=='none'||Boolean(style.boxShadow)&&style.boxShadow!=='none'||['Top','Right','Bottom','Left'].some(side=>parseFloat(style['border'+side+'Width'])>0&&opaque(style['border'+side+'Color']))||opaque(style.backgroundColor)&&style.backgroundColor!==background);
  }
  function painted(node){
   if(awaitingRenderer(node)||node.querySelector('canvas'))return false;
   const rect=node.getBoundingClientRect(),style=getComputedStyle(node),background=getComputedStyle(root).backgroundColor;
   if(rect.width<=1||rect.height<=1||style.visibility==='hidden'||style.display==='none'||Number(style.opacity)<=0)return false;
   if(hasPaint(style,background))return true;
   // CSS loaders often paint only pseudo-elements; their transparent host is
   // not itself evidence. Require generated content and positive dimensions.
   return ['::before','::after'].some(pseudo=>{const paint=getComputedStyle(node,pseudo);return paint.content&&paint.content!=='none'&&paint.content!=='normal'&&parseFloat(paint.width)>0&&parseFloat(paint.height)>0&&hasPaint(paint,background);});
  }
  // aria-hidden is an accessibility flag, not visual invisibility. Explicitly
  // presented decorative renderers must be accepted after their first frame.
  const presented=select('[data-preview-presented="true"],canvas').some(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return (observedCanvases.has(node)||node.getAttribute('data-preview-presented')==='true'||node.tagName==='CANVAS'&&node.closest('[data-preview-pending="false"]'))&&r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';});
  const content=root&&((typeof root.innerText==='string'?root.innerText:root.textContent)?.trim()||select('svg,img,video,iframe,button,input,textarea,select,progress,meter,[role=slider],[role=progressbar]').some(node=>{const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&!node.closest('[aria-hidden=true]')&&!awaitingRenderer(node);})||select('div,span,main,section').some(painted));
  // Decorative SVGs can be the entire demo. Definitions alone do not draw.
  const drawnSvg = !content && !presented && select('svg').some(svg => {
   const bounds = svg.getBoundingClientRect();
   if (bounds.width <= 1 || bounds.height <= 1 || awaitingRenderer(svg)) return false;
   const style = getComputedStyle(svg);
   if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
   return [...svg.querySelectorAll('path[d], rect, circle, ellipse, line, polygon[points], polyline[points], use, text')].some(shape => {
    if (shape.closest('defs, symbol, mask, clipPath, pattern, marker')) return false;
    const box = shape.getBoundingClientRect();
    if (!box.width && !box.height) return false;
    const paint = getComputedStyle(shape);
    if (paint.display === 'none' || paint.visibility === 'hidden' || paint.opacity === '0') return false;
    const fill = paint.fill || 'black';
    return (shape.localName !== 'line' && fill !== 'none' && opaque(fill) && paint.fillOpacity !== '0')
     || (paint.stroke !== 'none' && opaque(paint.stroke) && paint.strokeOpacity !== '0' && parseFloat(paint.strokeWidth) !== 0);
   });
  });
  if(!content&&!presented&&!drawnSvg){setTimeout(inspect,150);return;}
  const images=select('img').filter(image=>image.getAttribute('src')||image.getAttribute('srcset'));
  const videos=select('video').filter(video=>video.getAttribute('src')||video.querySelector('source[src]'));
  const broken=images.filter(image=>image.complete&&!image.naturalWidth);
  const brokenVideos=videos.filter(video=>video.error);
  const media=[...broken.map(image=>image.currentSrc||image.src),...brokenVideos.map(video=>video.currentSrc||video.src)].join('|');
  if(media&&media!==lastMedia){lastMedia=media;send('preview-media-error',(broken.length+brokenVideos.length)+' recurso(s) da demonstração não carregaram.');}
  if(!sent&&images.some(image=>!image.complete&&(image.loading!=='lazy'||image.getBoundingClientRect().top<innerHeight))){setTimeout(inspect,150);return;}
  if(!media&&!sent&&videos.some(video=>video.readyState<2)){setTimeout(inspect,150);return;}
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
 const script='<base href="'+base+'"><script>('+inspectPreview.toString()+')('+JSON.stringify(id).replace(/</g,'\\u003c')+','+html.includes('data-recovery-notice')+',('+observePreviewCanvas.toString()+'),('+installPreviewForms.toString()+'));</script>';
 return /<head(?:\s[^>]*)?>/i.test(html)?html.replace(/<head(?:\s[^>]*)?>/i,match=>match+script):script+html;
}
