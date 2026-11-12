import React,{useEffect,useRef} from 'react';
import './glass-layers-interaction.css';
// Separate hero illustration generated from the approved reference; the supplied logo is unchanged.
export default function GlassLayers(){
 const root=useRef(null),frame=useRef(0),motion=useRef(null);
 function reset(){if(frame.current)cancelAnimationFrame(frame.current);frame.current=0;if(root.current){root.current.style.setProperty('--glass-rx','0deg');root.current.style.setProperty('--glass-ry','0deg');root.current.style.setProperty('--glass-lift','0px');}}
 useEffect(()=>{motion.current=window.matchMedia?.('(prefers-reduced-motion: reduce)');const changed=()=>{if(motion.current.matches)reset();};motion.current?.addEventListener('change',changed);return()=>{if(frame.current)cancelAnimationFrame(frame.current);motion.current?.removeEventListener('change',changed);};},[]);
 function move(event){
  if(event.pointerType==='touch'||motion.current?.matches)return;
  const box=event.currentTarget.getBoundingClientRect();if(!box.width||!box.height)return;
  const x=Math.max(-.5,Math.min(.5,(event.clientX-box.left)/box.width-.5)),y=Math.max(-.5,Math.min(.5,(event.clientY-box.top)/box.height-.5));
  cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{if(!root.current)return;root.current.style.setProperty('--glass-rx',(-y*16)+'deg');root.current.style.setProperty('--glass-ry',(x*20)+'deg');root.current.style.setProperty('--glass-lift','-8px');});
 }
 return <div ref={root} className="glass-layers glass-layers-interactive" aria-hidden="true" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}><div className="glass-layers-tilt"><img src="/assets/branding/nitido-glass-layers.png" width="1448" height="1086" alt="" fetchPriority="high" decoding="async" draggable="false"/></div></div>;
}
