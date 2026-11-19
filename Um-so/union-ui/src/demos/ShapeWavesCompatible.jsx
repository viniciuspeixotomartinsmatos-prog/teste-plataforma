import React,{useEffect,useRef,useState} from 'react';
import ShapeWavesGPU from './ShapeWavesGPU';
import {createShapeWavesCanvas} from './shape-waves-canvas';

function CompatibleCanvas({onReady,...props}){
 const canvas=useRef(null),engine=useRef(null),options=useRef(props);options.current=props;
 useEffect(()=>{engine.current?.update(props);},[props]);
 useEffect(()=>{
  const element=canvas.current;let animation=0,disposed=false,presented=false;
  try{
   const renderer=createShapeWavesCanvas(element);engine.current=renderer;renderer.update(options.current);
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
   const render=now=>{if(disposed)return;const result=renderer.draw(now,{reducedMotion:reduce.matches});if(!presented&&result.drawn>0){presented=true;element.dataset.ready='true';onReady();}animation=requestAnimationFrame(render);};
   const resize=()=>{const rect=element.parentElement.getBoundingClientRect();renderer.resize(rect.width,rect.height,window.devicePixelRatio||1);renderer.draw(performance.now(),{reducedMotion:reduce.matches});};
   const move=event=>{const rect=element.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;if(x>=0&&y>=0&&x<=rect.width&&y<=rect.height)renderer.splash(x,y);};
   const observer=new ResizeObserver(resize);observer.observe(element.parentElement);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',move,{passive:true});resize();animation=requestAnimationFrame(render);
   document.fonts?.ready.then(()=>{if(!disposed){renderer.update({...options.current,text:''});renderer.update(options.current);}});
   return()=>{disposed=true;cancelAnimationFrame(animation);observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);engine.current=null;};
  }catch(error){window.dispatchEvent(new ErrorEvent('error',{message:error.message,error}));}
 },[]);
 return <canvas ref={canvas} data-renderer="canvas2d" data-ready="false" style={{display:'block',width:'100%',height:'100%'}}/>;
}

// Keep the upstream GPU renderer when it can present a frame. The compatible
// canvas stays visible during startup, timeout, device loss or unsupported GPU.
export default function ShapeWaves(props){
 const root=useRef(null),[tryGPU,setTryGPU]=useState(()=>!!navigator.gpu),[gpuReady,setGpuReady]=useState(false),[canvasReady,setCanvasReady]=useState(false);
 const failGPU=error=>{if(gpuReady)setCanvasReady(false);setGpuReady(false);setTryGPU(false);props.onError?.(error);};
 useEffect(()=>{
  if(!tryGPU)return;
  const observer=new MutationObserver(()=>{if(root.current?.querySelector('[data-gpu-layer] [data-ready="true"]'))setGpuReady(true);});observer.observe(root.current,{subtree:true,attributes:true,attributeFilter:['data-ready']});
  const timeout=setTimeout(()=>{if(!root.current?.querySelector('[data-gpu-layer] [data-ready="true"]'))setTryGPU(false);},8000);
  return()=>{observer.disconnect();clearTimeout(timeout);};
 },[tryGPU]);
 return <div ref={root} className={props.className} data-preview-pending={!gpuReady&&!canvasReady?'true':'false'} data-renderer={gpuReady?'webgpu':'canvas2d'} style={{width:'100%',height:'100%',position:'relative',overflow:'hidden',background:props.backgroundColor||'#000'}}>
  {!gpuReady&&<CompatibleCanvas {...props} onReady={()=>setCanvasReady(true)}/>}
  {tryGPU&&<div data-gpu-layer style={{position:'absolute',inset:0,visibility:gpuReady?'visible':'hidden'}}><ShapeWavesGPU {...props} onError={failGPU}/></div>}
 </div>;
}
