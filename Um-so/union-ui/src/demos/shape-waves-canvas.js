import {ImprovedNoise} from 'three/addons/math/ImprovedNoise.js';

// Compatibility renderer for the Shape Waves grid. It uses the same three
// shapes, noise bands, text cutout and damped ripple equations as the GPU view.
// Canvas antialiasing/glow differ from the original WGSL postprocessing.
export const waveDefaults={text:'',fontFamily:'system-ui,sans-serif',fontWeight:500,textSize:.6,shapes:'mixed',cellSize:10,dotSize:.75,color:'#929292',hoverColor:'#ffffff',backgroundColor:'#000000',speed:1,scale:1,contrast:1,brightness:.4,flow:0,direction:0,fade:.25,interactive:true,splashRadius:40,splashStrength:.4,glow:.35,intro:true,introDuration:1.6,paused:false};
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const rgb=(value,fallback)=>{let hex=/^#([\da-f]{3}|[\da-f]{6})$/i.exec(value||'')?.[1]||fallback;if(hex.length===3)hex=hex.replace(/./g,c=>c+c);return[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));};
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};

export function createShapeWavesCanvas(canvas,{createCanvas=()=>document.createElement('canvas')}={}){
 const context=canvas.getContext('2d');if(!context)throw Error('O navegador não disponibilizou um contexto Canvas 2D.');
 const mask=createCanvas(),maskContext=mask.getContext('2d');if(!maskContext)throw Error('Não foi possível criar a máscara do efeito.');
 const noise=new ImprovedNoise();let settings={...waveDefaults},width=0,height=0,cols=0,rows=0,cell=10,origin=0,maskPixels=null;
 let heights=new Float32Array(),previous=new Float32Array(),charges=new Float32Array(),last=null,time=0,driftX=0,driftY=0,introTime=0,backlog=0;
 function drawMask(){
  mask.width=width;mask.height=height;maskPixels=null;if(!settings.text.trim()||!width||!height)return;
  let size=height*clamp(Number(settings.textSize)||.6,.01,1);maskContext.font=`${settings.fontWeight} ${size}px ${settings.fontFamily}`;
  const measured=maskContext.measureText(settings.text).width;if(measured>width*.9)size*=width*.9/measured;
  maskContext.font=`${settings.fontWeight} ${size}px ${settings.fontFamily}`;maskContext.textAlign='center';maskContext.textBaseline='middle';maskContext.fillStyle='#fff';maskContext.fillText(settings.text,width/2,height/2);maskPixels=maskContext.getImageData(0,0,width,height).data;
 }
 function grid(){cols=Math.max(1,Math.round(width/Math.max(4,Number(settings.cellSize)||10)));cell=width/cols;rows=Math.max(1,Math.floor(height/cell));origin=(height-rows*cell)/2;heights=new Float32Array(cols*rows);previous=new Float32Array(cols*rows);charges=new Float32Array(cols*rows);}
 function resize(w,h,dpr=1){width=Math.max(1,Math.round(w));height=Math.max(1,Math.round(h));dpr=clamp(dpr,1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);grid();drawMask();last=null;}
 function update(next){const before=settings;settings={...waveDefaults,...next};if(before.cellSize!==settings.cellSize&&width)grid();if(['text','fontFamily','fontWeight','textSize'].some(key=>before[key]!==settings[key]))drawMask();if(before.introKey!==settings.introKey||before.intro!==settings.intro)introTime=0;if(!settings.interactive){heights.fill(0);previous.fill(0);charges.fill(0);}return settings;}
 function splash(x,y,strength=settings.splashStrength){
  if(!settings.interactive||!cols)return;const sigma=Math.max(.5,Number(settings.splashRadius)/cell*.5),reach=Math.ceil(sigma*2.5),cx=x/cell-.5,cy=(y-origin)/cell-.5;
  for(let row=Math.max(0,Math.floor(cy-reach));row<=Math.min(rows-1,Math.ceil(cy+reach));row++)for(let col=Math.max(0,Math.floor(cx-reach));col<=Math.min(cols-1,Math.ceil(cx+reach));col++){const distance=(col-cx)**2+(row-cy)**2,index=row*cols+col;heights[index]=Math.min(1.2,heights[index]+strength*Math.exp(-distance/(2*sigma*sigma)));}
 }
 function step(){
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const i=row*cols+col,value=heights[i],laplacian=heights[row*cols+Math.max(0,col-1)]+heights[row*cols+Math.min(cols-1,col+1)]+heights[Math.max(0,row-1)*cols+col]+heights[Math.min(rows-1,row+1)*cols+col]-4*value,next=(value+(value-previous[i])*.94+.42*laplacian)*.972;previous[i]=next;charges[i]=clamp(next);}
  [heights,previous]=[previous,heights];
 }
 function draw(now,{reducedMotion=false}={}){
  if(!width||!height)return{drawn:0};const delta=last===null?0:clamp((now-last)/1000,0,.1);last=now;
  if(!settings.paused&&!reducedMotion){time+=delta*.1*Math.max(0,settings.speed);const angle=settings.direction*Math.PI/180;driftX+=Math.cos(angle)*settings.flow*cell*delta;driftY+=Math.sin(angle)*settings.flow*cell*delta;}
  introTime+=delta;backlog=Math.min(backlog+delta,4/60);while(backlog>=1/60){step();backlog-=1/60;}
  context.globalAlpha=1;context.shadowBlur=0;context.fillStyle=settings.backgroundColor;context.fillRect(0,0,width,height);
  const base=rgb(settings.color,'929292'),hover=rgb(settings.hoverColor,'ffffff'),mode={squares:0,circles:1,triangles:2}[settings.shapes];let drawn=0;
  const progress=!settings.intro||reducedMotion?1.66:introTime/Math.max(.1,settings.introDuration)*1.66;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const x=(col+.5)*cell,y=origin+(row+.5)*cell;if(maskPixels&&maskPixels[(Math.min(height-1,Math.floor(y))*width+Math.min(width-1,Math.floor(x)))*4+3]>127)continue;
   const nx=(x+driftX)/(32*cell*Math.max(.1,settings.scale))+12.9898,ny=(y+driftY)/(32*cell*Math.max(.1,settings.scale))+78.233,n=(noise.noise(nx,ny,time)+.5*noise.noise(nx*2,ny*2,time*2))/1.5;
   const tone=clamp((n*.5+.5-(.5-(settings.brightness-.5)*.4))*2.8*settings.contrast+.5),charge=charges[row*cols+col],band=(Math.floor(Math.min(tone,.999999)*3)+Math.floor(clamp(charge,0,.999)*3))%3;
   const shape=mode??2-band;let size=cell*.5*clamp(settings.dotSize,.1,1)*(mode===undefined?1:.45+.55*band/2);
   if(progress<1.66){const radial=Math.hypot((x-width/2)/(width/2),(y-height/2)/(height/2))*.70710678,warp=noise.noise(col/cols*3.2+12.9898,row/rows*2.4+78.233,4.7)*.3,jitter=(Math.sin(col*127.1+row*311.7)*43758.5453)%1,spread=radial+warp+Math.abs(jitter)*.16+.3,t=clamp((progress-spread)/.2);if(!t)continue;const back=t-1;size*=Math.max(.02,1+2.70158*back**3+1.70158*back**2);}
   const qx=Math.abs(x/width*2-1),qy=Math.abs(y/height*2-1),radius=(qx**2.5+qy**2.5)**.4/(2**.4),fade=clamp(settings.fade,0,1),level=fade?1-smooth((radius-Math.max(0,1-fade*2.2))/(1-Math.max(0,1-fade*2.2))):1;
   const mix=smooth((charge-.15)/.7),color=base.map((v,i)=>Math.round(v+(hover[i]-v)*mix));context.globalAlpha=level;context.fillStyle=`rgb(${color.join(',')})`;context.shadowColor=context.fillStyle;context.shadowBlur=settings.glow>0&&charge>.15?Math.min(20,settings.glow*12*charge):0;
   context.beginPath();if(shape===0)context.rect(x-size,y-size,size*2,size*2);else if(shape===1)context.arc(x,y,size,0,Math.PI*2);else{context.moveTo(x,y-size);context.lineTo(x+size,y+size);context.lineTo(x-size,y+size);context.closePath();}context.fill();drawn++;
  }
  context.globalAlpha=1;context.shadowBlur=0;return{drawn,cols,rows,time,charge:charges.reduce((a,b)=>a+b,0)};
 }
 return{resize,update,splash,draw};
}
