import React,{useState,useEffect,useRef,useCallback} from 'react';
import SplashCursorGPU from './SplashCursorGPU';
import {createSplashCursorCanvas} from './splash-cursor-canvas.js';

export default function SplashCursorCompatible(props){
 const [gpu,setGPU]=useState(true),[presented,setPresented]=useState(false),[fallbackReady,setFallbackReady]=useState(false);
 const canvas=useRef(null),ready=useCallback(()=>setPresented(true),[]),unavailable=useCallback(()=>setGPU(false),[]);
 useEffect(()=>{if(presented||!gpu)return;const timer=setTimeout(()=>setGPU(false),2500);return()=>clearTimeout(timer);},[presented,gpu]);
 useEffect(()=>{
  if(gpu)return;const node=canvas.current;let frame=0,observer,announced=false;
  const engine=createSplashCursorCanvas(node);
  const resize=()=>{const box=node.getBoundingClientRect();engine.resize(box.width||800,box.height||500,window.devicePixelRatio||1);engine.splash((box.width||800)/2,(box.height||500)/2);};
  const point=e=>{const box=node.getBoundingClientRect();return{x:e.clientX-box.left,y:e.clientY-box.top};};
  const move=e=>{const p=point(e);engine.move(p.x,p.y);},press=e=>{const p=point(e);engine.splash(p.x,p.y,45);},leave=()=>engine.leave();
  const tick=t=>{if(engine.draw(t)&&!announced){announced=true;setFallbackReady(true);}frame=requestAnimationFrame(tick);};
  resize();frame=requestAnimationFrame(tick);window.addEventListener('pointermove',move);window.addEventListener('pointerdown',press);window.addEventListener('pointerleave',leave);window.addEventListener('resize',resize);
  if(typeof ResizeObserver==='function'){observer=new ResizeObserver(resize);observer.observe(node);}
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();engine.dispose();window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',press);window.removeEventListener('pointerleave',leave);window.removeEventListener('resize',resize);};
 },[gpu]);
 return <div data-preview-pending={!(gpu?presented:fallbackReady)} data-preview-presented={gpu?presented:fallbackReady} data-renderer={gpu?'webgl2':'canvas2d'} style={{width:'100%',height:'100vh',position:'relative'}}>
  {gpu?<SplashCursorGPU {...props} onPresented={ready} onUnavailable={unavailable}/>:<canvas ref={canvas} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>}
 </div>;
}
