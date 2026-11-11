// Runs only inside the same opaque sandbox as the original demo. It observes
// first paint, decoding and bounded tab/canvas interactions, not business APIs.
export function runtimeAuditProbe(id){
 const errors=[],started=performance.now();let finished=false,interaction=null;
 addEventListener('error',event=>{if(event.target===window&&!/^ResizeObserver loop/.test(event.message))errors.push(event.message);},true);
 addEventListener('unhandledrejection',event=>errors.push(String(event.reason?.message||event.reason)));
 const scopes=()=>{const result=[document.body];for(let i=0;i<result.length;i++)for(const node of result[i]?.querySelectorAll('*')||[])if(node.shadowRoot)result.push(node.shadowRoot);return result.filter(Boolean);};
 const all=selector=>scopes().flatMap(scope=>[...scope.querySelectorAll(selector)]);
 function pixels(canvas){try{const context=canvas.getContext('2d');if(!context)return {gpu:true};const w=canvas.width,h=canvas.height;if(!w||!h)return {empty:true};let signature=0,lit=0;for(let y=0;y<8;y++)for(let x=0;x<8;x++){const rgba=context.getImageData(Math.floor(x*w/8),Math.floor(y*h/8),1,1).data;signature=(signature*31+rgba[0]*3+rgba[1]*5+rgba[2]*7+rgba[3])>>>0;if(rgba[3]&&(rgba[0]+rgba[1]+rgba[2]>15))lit++;}return {signature,lit};}catch{return {unreadable:true};}}
 function interact(){
  const canvas=all('canvas').find(node=>node.getBoundingClientRect().width>2);
  // Synthetic pointerdown/up cannot create a browser pointer-capture session.
  // Restrict the batch probe to motion/click; test real drag through browser UI.
  if(canvas){const rect=canvas.getBoundingClientRect(),before=pixels(canvas);const options={bubbles:true,clientX:rect.left+rect.width*.5,clientY:rect.top+rect.height*.5};canvas.dispatchEvent(new PointerEvent('pointermove',{...options,pointerId:1,pointerType:'mouse',isPrimary:true}));for(const type of ['mousemove','click'])canvas.dispatchEvent(new MouseEvent(type,options));interaction={kind:'canvas',before,node:canvas};return;}
  const tab=all('[role=tab]').find(node=>node.getAttribute('aria-selected')==='false');
  if(tab){interaction={kind:'tab',before:tab.getAttribute('aria-selected'),node:tab};tab.click();}
 }
 function inspect(){
  if(finished)return;
  if(document.readyState==='loading'||all('[data-preview-pending="true"]').length){if(performance.now()-started<12000)return setTimeout(inspect,150);}
  if(!interaction){interact();interaction||={kind:'none'};return setTimeout(inspect,650);}
  const images=all('img').filter(node=>node.getAttribute('src')||node.getAttribute('srcset'));
  for(const image of images)image.loading='eager';
  const videos=all('video');
  if((images.some(image=>!image.complete)||videos.some(video=>video.readyState<2&&!video.error))&&performance.now()-started<12000)return setTimeout(inspect,150);
  finished=true;
  const after=interaction.kind==='canvas'?pixels(interaction.node):interaction.kind==='tab'?interaction.node.getAttribute('aria-selected'):null;
  parent.postMessage({type:'nitido:runtime-audit',id,errors:[...new Set(errors)],images:images.map(image=>({src:(image.currentSrc||image.src).replace(/^(data:|blob:).*/,'$1[embedded]'),loaded:image.complete&&image.naturalWidth>0})),videos:videos.map(video=>({loaded:video.readyState>=2,width:video.videoWidth,height:video.videoHeight,error:Boolean(video.error),errorCode:video.error?.code,errorMessage:video.error?.message,src:(video.currentSrc||video.src).replace(/^(data:|blob:).*/,'$1[embedded]')})),canvases:all('canvas').map(canvas=>({width:canvas.width,height:canvas.height,...pixels(canvas)})),svg:all('svg').filter(node=>node.getBoundingClientRect().width>0).length,text:(document.body?.innerText||'').trim().slice(0,160),interaction:{kind:interaction.kind,before:interaction.before,after,changed:interaction.kind==='tab'?after!==interaction.before:interaction.kind==='canvas'&&interaction.before.signature!==undefined&&after.signature!==undefined?after.signature!==interaction.before.signature:null}},'*');
 }
 addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='nitido:audit-inspect'&&event.data.id===id)setTimeout(inspect,300);});
 setTimeout(inspect,28000);
}
