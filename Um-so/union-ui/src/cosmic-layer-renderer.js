import{advanceParticle}from'./cosmic-motion.js';
// The body and clean plate are Image Gen edits of the supplied reference, not
// recovered original layers. The supplied reference stays the static fallback.
export function createLayeredCosmicRenderer(canvas,{plate,body,space,createCanvas=()=>document.createElement('canvas'),width=970,height=941,mobile=false}={}){
 canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const background=createCanvas();background.width=width;background.height=height;const bg=background.getContext('2d');const crop=Math.round(plate.width*.42),back=space||plate,backCrop=Math.round(back.width*.42);bg.drawImage(back,backCrop,0,back.width-backCrop,back.height,0,0,width,height);
 let planet;
 if(space){
  planet=createCanvas();planet.width=width;planet.height=height;const pc=planet.getContext('2d');
  const cx=(plate.width*.617-crop)/(plate.width-crop)*width,cy=height*.292,r=height*.207;
  pc.drawImage(plate,crop,0,plate.width-crop,plate.height,0,0,width,height);
  // Retain the original planet pixels and atmosphere in a soft independent
  // layer. The generated clean plate removes its former baked duplicate.
  pc.globalCompositeOperation='destination-in';const mask=pc.createRadialGradient(cx,cy,r*.91,cx,cy,r);mask.addColorStop(0,'#fff');mask.addColorStop(1,'#fff0');pc.fillStyle=mask;pc.fillRect(0,0,width,height);pc.globalCompositeOperation='source-over';
 }
 const sprite=createCanvas();sprite.width=width;sprite.height=height;const sc=sprite.getContext('2d');const h=height*.60,w=h*body.width/body.height;sc.drawImage(body,width*.52-w/2,height*.20,w,h);const pixels=sc.getImageData(0,0,width,height).data;
 const tile=mobile?9:7,particles=[];for(let y=0;y<height;y+=tile)for(let x=0;x<width;x+=tile){const i=4*(Math.min(height-1,y+(tile>>1))*width+Math.min(width-1,x+(tile>>1)));if(pixels[i+3]<40)continue;const seed=((x*73+y*37)%997)/997;particles.push({homeX:x,homeY:y,x:x+(seed-.5)*70,y:y+seed*65,vx:0,vy:0,release:800+seed*500,mass:.65+seed*.7,seed});}
 function draw(time,step,pointer={x:-1000,y:-1000,until:0,speed:0},pulse){
  ctx.clearRect(0,0,width,height);ctx.drawImage(background,0,0);
  const active=pointer.until>time||pulse&&time-pulse.start<2500,parallax=pointer.x>=0?Math.max(-1,Math.min(1,(pointer.x/width-.5)*2)):0,offsetX=parallax*6,offsetY=Math.sin(time/1000*Math.PI/3)*4*(active ? .25 : 1);
  const planetOffset={x:-parallax*5,y:Math.sin(time/5200)*2};if(planet)ctx.drawImage(planet,planetOffset.x,planetOffset.y);
  // Separate ambient field: fixed yellow-ray pixels never rotate or drift.
  for(let n=0;n<44;n++){const x=((n*173+41)%997)/997*width,y=((n*239+71)%991)/991*height;const near=Math.max(0,1-Math.hypot(pointer.x-x,pointer.y-y)/120);ctx.fillStyle='rgba(201,175,255,'+(.10+.12*(1+Math.sin(time/1800+n))+.2*near)+')';ctx.beginPath();ctx.arc(x+parallax*2,y,.6+(n%3)*.25,0,Math.PI*2);ctx.fill();}
  const settled=time>3000&&time>pointer.until+2800&&(!pulse||time>pulse.start+3000);
  if(settled)ctx.drawImage(sprite,offsetX,offsetY);
  else for(const p of particles){advanceParticle(p,time,step,pointer,pulse);const dx=Math.round(p.x+offsetX),dy=Math.round(p.y+offsetY),speed=Math.abs(p.vx)+Math.abs(p.vy);if(pointer.speed>12&&pointer.until>time&&speed>3){ctx.globalAlpha=.18;ctx.drawImage(sprite,p.homeX,p.homeY,tile,tile,dx-p.vx*2,dy-p.vy*2,tile,tile);if(p.seed>.92){ctx.fillStyle=p.seed>.96?'#bb47ff':'#55cfff';ctx.fillRect(dx+3,dy,Math.max(1,tile*.4),1);}}ctx.globalAlpha=1;ctx.drawImage(sprite,p.homeX,p.homeY,tile,tile,dx,dy,tile,tile);}
  if(pulse){const age=time-pulse.start;if(age>=0&&age<700){ctx.strokeStyle='rgba(210,180,255,'+(.20*(1-age/700))+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pulse.x,pulse.y,age*.14,0,Math.PI*2);ctx.stroke();}}
  return {particles:particles.length,settled,bodyOffset:{x:offsetX,y:offsetY},planetOffset:planet?planetOffset:null,independentPlanet:Boolean(planet)};
 }
 return{draw,particles:particles.length};
}
