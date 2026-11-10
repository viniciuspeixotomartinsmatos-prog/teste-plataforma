import React, {useEffect, useRef} from 'react';
import {advanceParticle} from './cosmic-motion.js';

const artwork = '/assets/auth/astronaut-login.webp';

export function CosmicScene() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, image = imageRef.current;
    if (!window.matchMedia || !window.IntersectionObserver) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = false, render, previous = 0, elapsed = 0;
    let pointer = {x:-1000, y:-1000, speed:0, until:0}, pulse;
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
      render(elapsed, delta / 16.67);
      frame = requestAnimationFrame(tick);
    }
    function initialize() {
      if (!image.naturalWidth || motion.matches) return sync();
      const w = canvas.width = image.naturalWidth, h = canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      const fixed = document.createElement('canvas');
      fixed.width = w; fixed.height = h;
      const background = fixed.getContext('2d');
      background.drawImage(image,0,0);
      const pixels = background.getImageData(0,0,w,h);
      const particles = [];
      const tile = Math.max(3,Math.ceil(w / (window.innerWidth < 700 ? 85 : 145)));
      for (let y=Math.floor(h*.19); y<h*.84; y+=tile) {
        for (let x=Math.floor(w*.30); x<w*.69; x+=tile) {
          const index = 4*(Math.min(h-1,y+(tile>>1))*w+x+(tile>>1));
          const [r,g,b,a] = pixels.data.subarray(index,index+4);
          if (a<30 || (r>180 && g>155 && b<130 && (y<h*.25 || y>h*.52))) continue;
          const mass=.65+Math.random()*.7;
          particles.push({homeX:x,homeY:y,x:x+(Math.random()-.5)*85,y:y+Math.random()*65,vx:0,vy:0,release:1200*mass,mass});
          background.clearRect(x,y,tile,tile);
        }
      }
      render = (time,step) => {
        context.clearRect(0,0,w,h);
        context.drawImage(fixed,0,0);
        const float = Math.sin(time/950)*3;
        for (const p of particles) {
          advanceParticle(p,time,step,pointer,pulse);
          context.drawImage(image,p.homeX,p.homeY,tile,tile,Math.round(p.x),Math.round(p.y+float),tile,tile);
        }
      };
      sync();
    }
    function coordinates(event) {
      const bounds = canvas.getBoundingClientRect();
      return {x:(event.clientX-bounds.left)*canvas.width/bounds.width,y:(event.clientY-bounds.top)*canvas.height/bounds.height};
    }
    function move(event) {
      const at = coordinates(event);
      const speed = Math.min(38,Math.hypot(pointer.x-at.x,pointer.y-at.y));
      pointer = {...at,speed,until:elapsed+90};
    }
    function click(event) {
      if (!pulse || elapsed-pulse.start>500) pulse={...coordinates(event),start:elapsed};
    }
    function changeMotion(){if(!render && !motion.matches) initialize(); else sync();}
    function loss(event){event.preventDefault();render=null;sync();}
    const observer = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
    observer.observe(canvas.parentElement);
    image.addEventListener('load',initialize);
    canvas.addEventListener('contextlost',loss);
    canvas.addEventListener('contextrestored',initialize);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerdown',click);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',changeMotion);
    if(image.complete) initialize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener('load',initialize);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerdown',click);
      canvas.removeEventListener('contextlost',loss);
      canvas.removeEventListener('contextrestored',initialize);
      document.removeEventListener('visibilitychange',sync);
      motion.removeEventListener('change',changeMotion);
    };
  },[]);
  return <div className="cosmic-figure" aria-hidden="true"><img ref={imageRef} src={artwork} alt=""/><canvas hidden ref={canvasRef}/></div>;
}
