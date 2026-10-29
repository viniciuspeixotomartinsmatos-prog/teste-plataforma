import React,{useEffect,useRef,useState} from 'react';
import './catalog-media.css';

// Cards without a recovered cover show their own executable demo, never a
// category illustration or a thumbnail borrowed from a different component.
export function CatalogMedia({item,name}){
 const container=useRef(null),[near,setNear]=useState(false),[scale,setScale]=useState(.35),[failed,setFailed]=useState(false),[playing,setPlaying]=useState(false);
 useEffect(()=>{setFailed(false);setPlaying(false);},[item.id,item.image]);
 const live=(!item.image||failed)&&Boolean(item.previewPath),video=useRef(null);
 useEffect(()=>{
  const node=container.current;if(!node)return;
  if(!globalThis.IntersectionObserver){setNear(true);return;}
  const observer=new IntersectionObserver(entries=>setNear(entries[0].isIntersecting),{rootMargin:'180px'});observer.observe(node);return()=>observer.disconnect();
 },[item.id]);
 useEffect(()=>{
  if(!live)return;const node=container.current;if(!node)return;
  const measure=()=>setScale(node.getBoundingClientRect().width/1000);measure();
  if(!globalThis.ResizeObserver)return;
  const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[live]);
 useEffect(()=>{const player=video.current;if(!near)setPlaying(false);return()=>player?.pause();},[near,item.video]);
 const src=item.runtimePreviewPath||item.previewPath;
 const play=()=>{const player=video.current;if(player&&near)player.play().then(()=>{if(video.current===player)setPlaying(true);}).catch(()=>setPlaying(false));};
 const pause=()=>{video.current?.pause();setPlaying(false);};
 return <div ref={container} className={'catalog-media '+(live?'catalog-media-live':'')} onPointerEnter={play} onPointerLeave={pause}>
  {item.image&&!failed&&<img src={item.image} alt={name} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}
  {item.video&&near&&!live&&<video ref={video} src={item.video} poster={item.image} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} className={playing?'playing':''} onError={pause}/>}
  {live&&near&&<iframe title={'Prévia de '+name} src={src} loading="lazy" sandbox="allow-scripts" tabIndex={-1} aria-hidden="true" style={{transform:`scale(${scale})`}}/>}
 </div>;
}
