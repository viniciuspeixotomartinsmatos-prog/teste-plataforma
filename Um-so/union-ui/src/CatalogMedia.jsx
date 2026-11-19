import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {preparePreviewAssets,addPreviewAssetClient,createPreviewAssetResponder} from './preview-assets.js';
import './catalog-media.css';
import {framePreview} from './preview-framing.js';

// Cards without a recovered cover show their own executable demo, never a
// category illustration or a thumbnail borrowed from a different component.
export function CatalogMedia({item,name,framed=false}){
 const container=useRef(null),[near,setNear]=useState(false),[scale,setScale]=useState(.35),[failed,setFailed]=useState(false),[playing,setPlaying]=useState(false);
 const [imageSize,setImageSize]=useState(null),[videoSize,setVideoSize]=useState(null);
 const [failedVariant,setFailedVariant]=useState(null);
 const media=framed?item.previewMedia:undefined;
 const optimized=media?.variants?.at(-1)?.src;
 const variants=optimized&&failedVariant!==optimized?media.variants:[];
 const cover=variants.at(-1)?.src||item.image;
 const imageFrame=framePreview(item,imageSize||media?.size||item.previewSize);
 const videoFrame=framePreview(item,videoSize||item.videoSize);
 const frameStyle=frame=>({'--preview-fit':frame.fit,'--preview-position':frame.point.map(value=>100*value+'%').join(' '),'--preview-zoom':frame.zoom});
 useEffect(()=>{setFailed(false);setPlaying(false);setImageSize(null);setVideoSize(null);},[item.id,cover,item.video]);
 const live=(!cover||failed)&&Boolean(item.previewPath),video=useRef(null);
 const [engaged,setEngaged]=useState(false),[reduceMotion,setReduceMotion]=useState(()=>Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
 const intent=useRef(false),attempt=useRef(0);
 useEffect(()=>{const query=window.matchMedia?.('(prefers-reduced-motion: reduce)');if(!query)return;const update=()=>setReduceMotion(query.matches);update();query.addEventListener?.('change',update);return()=>query.removeEventListener?.('change',update);},[]);
 useEffect(()=>{
  const node=container.current,surface=node?.closest('.card-link')||node;if(!surface)return;
  let hovered=false,focused=false;
  const update=()=>{intent.current=hovered||focused;setEngaged(intent.current);};
  const enter=event=>{if(event.pointerType==='touch')return;hovered=true;update();};
  const leave=()=>{hovered=false;update();};
  const focus=()=>{focused=true;update();};
  const blur=event=>{if(surface.contains(event.relatedTarget))return;focused=false;update();};
  surface.addEventListener('pointerenter',enter);surface.addEventListener('pointerleave',leave);surface.addEventListener('focusin',focus);surface.addEventListener('focusout',blur);
  return()=>{intent.current=false;surface.removeEventListener('pointerenter',enter);surface.removeEventListener('pointerleave',leave);surface.removeEventListener('focusin',focus);surface.removeEventListener('focusout',blur);};
 },[item.id]);
 useEffect(()=>{
  const node=container.current;if(!node)return;
  if(!globalThis.IntersectionObserver){setNear(true);return;}
  const observer=new IntersectionObserver(entries=>setNear(entries[0].isIntersecting),{rootMargin:'0px'});observer.observe(node);return()=>observer.disconnect();
 },[item.id]);
 useEffect(()=>{
  if(!live)return;const node=container.current;if(!node)return;
  const measure=()=>{const {width,height}=node.getBoundingClientRect();setScale(framed?Math.min(width/1000,height/563):width/1000);};measure();
  if(!globalThis.ResizeObserver)return;
  const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[live,framed]);
 const [pageVisible,setPageVisible]=useState(()=>document.visibilityState!=='hidden');
 useEffect(()=>{const update=()=>setPageVisible(document.visibilityState!=='hidden');document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const active=engaged&&near&&!reduceMotion&&pageVisible&&!live;
 useEffect(()=>{
  const player=video.current,ticket=++attempt.current;setPlaying(false);
  if(!player||!active)return;
  // A brief dwell avoids fetching every video crossed while moving the mouse.
  const timer=setTimeout(()=>{
   if(ticket!==attempt.current||!intent.current)return;
   player.muted=true;
   if(!player.getAttribute('src'))player.src=item.video;
   Promise.resolve(player.play()).then(()=>{if(ticket!==attempt.current||!intent.current)player.pause();}).catch(()=>{if(ticket===attempt.current)setPlaying(false);});
  },120);
  return()=>{clearTimeout(timer);attempt.current++;player.pause();try{player.currentTime=0;}catch{}};
 },[active,item.id,item.video]);
 const src=item.runtimePreviewPath||item.previewPath;
 const frame=useRef(null),[previewHTML,setPreviewHTML]=useState('');
 useEffect(()=>{setPreviewHTML('');if(!live||!near)return;const controller=new AbortController(),base=new URL(src,window.location.href).href;fetch(src,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('Prévia indisponível.');return response.text();}).then(html=>preparePreviewAssets(html,base,{signal:controller.signal})).then(html=>{if(!controller.signal.aborted)setPreviewHTML(addPreviewAssetClient(html,item.id,base));}).catch(()=>{});return()=>controller.abort();},[item.id,src,live,near]);
 useLayoutEffect(()=>{if(!live||!near)return;const responder=createPreviewAssetResponder(frame.current?.contentWindow,item.id,window.location.href);window.addEventListener('message',responder);return()=>window.removeEventListener('message',responder);},[item.id,live,near,previewHTML]);
 const pause=()=>{video.current?.pause();setPlaying(false);};
 const backdrop=framed&&!failed&&imageFrame.extend&&imageSize?.src?imageSize.src:null;
 return <div ref={container} className={'catalog-media '+(live?'catalog-media-live':'')+(framed?' framed-media':'')} data-preview-playing={active&&playing?'true':undefined} data-safe-area={framed&&imageFrame.safeArea?'true':undefined} data-framing-review={framed&&imageFrame.review?'true':undefined} data-frame-background={framed?imageFrame.background:undefined} style={framed?{'--preview-background':imageFrame.color,'--preview-backdrop':backdrop?'url('+JSON.stringify(backdrop)+')':undefined}:undefined}>
  {cover&&!failed&&<img src={cover} srcSet={variants.length?variants.map(({src,width})=>src+' '+width+'w').join(', '):undefined} sizes={variants.length?'(max-width: 640px) calc(100vw - 24px), (max-width: 850px) 48vw, (max-width: 1200px) calc((100vw - 290px) / 2), min(460px, calc((100vw - 380px) / 3))':undefined} alt={name} loading="lazy" decoding="async" style={framed?frameStyle(imageFrame):undefined} onLoad={event=>{if(framed){const {naturalWidth:width,naturalHeight:height,currentSrc:src}=event.currentTarget;setImageSize({width,height,src});}}} onError={()=>{if(variants.length&&item.image&&item.image!==cover)setFailedVariant(optimized);else setFailed(true);}}/>}
  {item.video&&near&&!live&&!reduceMotion&&<video ref={video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} style={framed?frameStyle(videoFrame):undefined} onLoadedMetadata={event=>{if(framed)setVideoSize({width:event.currentTarget.videoWidth,height:event.currentTarget.videoHeight});}} className={active&&playing?'playing':''} onPlaying={()=>{if(intent.current&&active)setPlaying(true);else pause();}} onError={pause}/>}
  {live&&near&&<iframe ref={frame} title={'Prévia de '+name} src={src} srcDoc={previewHTML||undefined} loading="lazy" sandbox="allow-scripts" tabIndex={-1} aria-hidden="true" style={{transform:framed?`translate(-50%,-50%) scale(${scale})`:`scale(${scale})`}}/>}
 </div>;
}
