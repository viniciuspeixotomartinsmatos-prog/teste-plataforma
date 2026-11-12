import {cosmicDimensions,createCosmicQuality} from './cosmic-quality.js';
import {cosmicPointer,idleCosmicPointer} from './cosmic-pointer.js';
import React, {useEffect, useRef} from 'react';
import {createLayeredCosmicRenderer} from './cosmic-layer-renderer.js';

// Preserve the supplied bitmap as the static/reduced-motion fallback. Active
// animation composes edited independent body/background assets in its art crop.
const artwork = '/assets/auth/login-neon-reference.png';


export function CosmicScene() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, image = imageRef.current;
    if (!window.matchMedia || !window.IntersectionObserver) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const quality=createCosmicQuality();let resizeTimer;
    let frame = 0, visible = false, render, previous = 0, elapsed = 0;
    let pointer = idleCosmicPointer(), pulse, disposed=false;
    const body=new Image(),plate=new Image(),space=new Image();body.decoding=plate.decoding=space.decoding='async';
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.hidden = motion.matches || !render;
      image.hidden = !canvas.hidden;
      if (!canvas.hidden && visible && !document.hidden) {
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    }
    function tick(time) {
      const delta = previous ? Math.min(32, time - previous) : 16;
      previous = time;
      elapsed += delta;
      const started=performance.now();try{render(elapsed, delta / 16.67);}catch{render=null;return sync();}
      if(quality.observe(performance.now()-started)){initialize();return;}
      frame = requestAnimationFrame(tick);
    }
    function initialize() {
      if (!image.naturalWidth || motion.matches) return sync();
      if(!body.complete||!body.naturalWidth||!plate.complete||!plate.naturalWidth||!space.complete||!space.naturalWidth)return sync();
      try{if(render)elapsed=Math.max(4000,elapsed);else elapsed=0;previous=0;const engine=createLayeredCosmicRenderer(canvas,{plate,body,space,...cosmicDimensions(image.naturalWidth,image.naturalHeight,{mobile:window.innerWidth<700,constrained:quality.constrained})});render=(time,step)=>engine.draw(time,step,pointer,pulse);}catch{render=null;}
      sync();
    }
    function coordinates(event) {
      const bounds = canvas.getBoundingClientRect();
      return {x:(event.clientX-bounds.left)*canvas.width/bounds.width,y:(event.clientY-bounds.top)*canvas.height/bounds.height};
    }
    function move(event) {
      const at = coordinates(event);
      pointer = cosmicPointer(pointer,at,performance.now(),elapsed);
    }
    function leave(){pointer=idleCosmicPointer();}
    function click(event) {
      if (!pulse || elapsed-pulse.start>500) pulse={...coordinates(event),start:elapsed};
    }
    function loadAssets(){if(motion.matches)return;if(!body.src)body.src='/assets/auth/cosmic-body-layer.png';if(!plate.src)plate.src='/assets/auth/cosmic-clean-plate.png';if(!space.src)space.src='/assets/auth/cosmic-space-depth.png';}
    function changeMotion(){loadAssets();if(!render && !motion.matches) initialize(); else sync();}
    function resize(){leave();clearTimeout(resizeTimer);resizeTimer=setTimeout(initialize,120);}
    function loss(event){event.preventDefault();render=null;sync();}
    const observer = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
    observer.observe(canvas.parentElement);
    image.addEventListener('load',initialize);
    const assetReady=()=>{if(!disposed)initialize();};body.onload=plate.onload=space.onload=assetReady;body.onerror=plate.onerror=space.onerror=()=>{render=null;sync();};loadAssets();
    window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
    canvas.addEventListener('contextlost',loss);
    canvas.addEventListener('contextrestored',initialize);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerdown',click);
    canvas.addEventListener('pointerleave',leave);
    canvas.addEventListener('pointercancel',leave);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',changeMotion);
    if(image.complete) initialize();
    return () => {
      disposed=true;clearTimeout(resizeTimer);body.onload=plate.onload=space.onload=null;body.onerror=plate.onerror=space.onerror=null;body.src=plate.src=space.src='';
      window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);
      cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener('load',initialize);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerdown',click);
      canvas.removeEventListener('pointerleave',leave);
      canvas.removeEventListener('pointercancel',leave);
      canvas.removeEventListener('contextlost',loss);
      canvas.removeEventListener('contextrestored',initialize);
      document.removeEventListener('visibilitychange',sync);
      motion.removeEventListener('change',changeMotion);
    };
  },[]);
  return <div className="cosmic-figure cosmic-figure--reference" aria-hidden="true"><img ref={imageRef} className="cosmic-reference" src={artwork} alt=""/><canvas hidden ref={canvasRef}/></div>;
}
