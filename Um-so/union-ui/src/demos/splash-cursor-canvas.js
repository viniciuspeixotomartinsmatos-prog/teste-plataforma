// Canvas compatibility renderer. Original WebGL fluid source remains in the package.
// This uses swirling ink particles, not the original pressure/advection shaders.
export function createSplashCursorCanvas(canvas,{width=800,height=500,random=Math.random}={}){
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas indisponível para o efeito de cursor.');
 let particles=[],previous=null,last=0,disposed=false;
 function resize(w,h,dpr=1){canvas.width=Math.max(1,Math.round(w*Math.min(dpr,2)));canvas.height=Math.max(1,Math.round(h*Math.min(dpr,2)));width=w;height=h;ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);}
 function splash(x,y,amount=24){for(let i=0;i<amount;i++){const angle=random()*Math.PI*2,speed=1+random()*3;particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,hue:(last*.05+i*9)%360,radius:7+random()*15});}if(particles.length>500)particles=particles.slice(-500);}
 function move(x,y){if(previous){const steps=Math.min(24,Math.max(1,Math.ceil(Math.hypot(x-previous.x,y-previous.y)/8)));for(let i=1;i<=steps;i++)splash(previous.x+(x-previous.x)*i/steps,previous.y+(y-previous.y)*i/steps,3);}else splash(x,y,8);previous={x,y};}
 function draw(time){if(disposed)return false;const dt=Math.min(2,Math.max(.2,(time-last)/16.67||1));last=time;ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';for(const p of particles){p.vx+=Math.sin(p.y*.018+time*.001)*.09*dt;p.vy+=Math.cos(p.x*.018+time*.001)*.09*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=.009*dt;const radius=p.radius*Math.max(0,p.life);if(radius<=0)continue;const gradient=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);gradient.addColorStop(0,`hsla(${p.hue},95%,65%,${p.life*.7})`);gradient.addColorStop(1,`hsla(${p.hue},95%,45%,0)`);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();}particles=particles.filter(p=>p.life>0);ctx.globalCompositeOperation='source-over';return particles.length>0;}
 resize(width,height);splash(width*.5,height*.5,60);
 return{resize,splash,move,draw,leave(){previous=null;},dispose(){disposed=true;particles=[];}};
}
