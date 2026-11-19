/* Deterministic GSAP composition. The renderer advances the playhead per frame. */
const DURATION=48;
const captions=[
 [0.1,3.762,'Uma ideia merece sair da cabeça e ganhar vida.'],
 [3.762,9.744,'Este é o Nítido: seu espaço para encontrar inspiração e criar experiências digitais.'],
 [9.744,16.313,'Explore o catálogo, descubra componentes visuais e veja cada detalhe nas prévias interativas.'],
 [16.313,19.528,'Encontre o que combina com o seu projeto.'],
 [19.528,24.017,'Ajuste cores, tipografia e proporções no playground.'],
 [24.017,28.992,'Use prompts de integração para levar a ideia à sua ferramenta de criação.'],
 [28.992,33.992,'Reúna seções no montador e organize suas referências em coleções.'],
 [33.992,39.043,'E vá além com as ferramentas criativas, reunidas em um só lugar.'],
 [39.043,42.015,'Do primeiro olhar ao próximo projeto.'],
 [42.015,43.443,'Nítido.'],[43.443,46.4,'Dê forma ao que você imagina.']
];
const tl=gsap.timeline({paused:true,defaults:{ease:'power3.out'}});
gsap.set('.scene',{autoAlpha:0});
function scene(id,start,end){tl.set(id,{autoAlpha:1},start);tl.set(id,{autoAlpha:0},end);}
function enterText(selector,start){tl.fromTo(selector,{y:50,opacity:0,filter:'blur(12px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.75,stagger:.08},start);}
scene('#opening',0,3.78);scene('#introduction',3.78,9.75);scene('#catalog',9.75,16.32);scene('#discovery',16.32,19.54);scene('#playground',19.54,24.03);scene('#integration',24.03,29);scene('#builder',29,34);scene('#tools',34,39.05);scene('#finale',39.05,48.1);
enterText('.opening-copy .eyebrow,.opening-copy h1 span',.18);
tl.fromTo('.opening-tiles',{x:130,scale:1.03},{x:-90,scale:1.12,duration:3.78,ease:'none'},0);
tl.fromTo('.accent-line',{scaleX:0},{scaleX:1,duration:.7,transformOrigin:'left'},1.1);
enterText('.intro-copy>*',3.95);
tl.fromTo('.intro-screen',{x:350,y:50,rotationY:-28,rotationZ:7,scale:.83,opacity:0},{x:0,y:0,rotationY:-12,rotationZ:-3,scale:1,opacity:1,duration:1.15},3.78);
tl.to('.intro-screen',{y:-22,rotationY:-7,duration:4.7,ease:'sine.inOut'},4.95);
tl.fromTo('.floating-detail',{x:100,y:100,opacity:0},{x:0,y:0,opacity:1,duration:1},4.7);
tl.to('.floating-detail',{y:-20,duration:3.9,ease:'none'},5.7);
enterText('#catalog .chapter-heading',9.84);
tl.fromTo('.catalog-screen',{scale:.78,y:110,rotationX:14,opacity:0},{scale:1,y:0,rotationX:0,opacity:1,duration:1.1},9.75);
tl.fromTo('.catalog-screen img',{y:0},{y:-160,duration:4,ease:'none'},10.8);
tl.fromTo('.preview-screen',{x:250,y:90,rotationY:-15,scale:.8,opacity:0},{x:0,y:0,rotationY:0,scale:1,opacity:1,duration:.8},13.2);
tl.to('.catalog-screen',{scale:.94,opacity:.2,duration:.8},13.2);
enterText('.preview-note',13.5);
tl.to('.preview-screen',{scale:1.035,y:-8,duration:2.2,ease:'none'},14);
enterText('.discovery-heading>*',16.4);
tl.fromTo('.discovery-screen',{x:450,rotationY:-22,scale:.8,opacity:0},{x:0,rotationY:-10,scale:1,opacity:1,duration:.85},16.32);
tl.fromTo('.discovery-crop',{y:170,rotationZ:8,opacity:0},{y:0,rotationZ:-4,opacity:1,duration:.8},16.9);
tl.to('.discovery-screen img',{y:-100,duration:2.3,ease:'none'},17.2);
enterText('.side-heading>.eyebrow,.side-heading h2,.side-heading>.body-copy',19.65);
tl.fromTo('.playground-screen',{x:280,rotationY:-22,opacity:0},{x:0,rotationY:-7,opacity:1,duration:.9},19.54);
tl.fromTo('.swatches span',{scale:0,y:20},{scale:1,y:0,duration:.5,stagger:.1,ease:'back.out(1.8)'},20.45);
tl.fromTo('.control-lens',{scale:.3,x:-100,opacity:0},{scale:1,x:0,opacity:1,duration:.8,ease:'back.out(1.15)'},21.1);
tl.to('.control-lens',{y:-18,duration:2.1,ease:'sine.inOut'},21.9);
enterText('#integration .chapter-heading',24.15);
tl.fromTo('.integration-screen',{y:110,scale:.88,opacity:0},{y:0,scale:1,opacity:1,duration:.9},24.03);
tl.fromTo('.prompt-focus',{scale:.65,y:80,opacity:0},{scale:1,y:0,opacity:1,duration:.85,ease:'back.out(1.2)'},25.15);
tl.to('.integration-screen',{opacity:.35,scale:.98,duration:.8},25.15);
enterText('.integration-note',25.9);
tl.to('.prompt-focus',{y:-12,duration:2.6,ease:'none'},26);
enterText('#builder .chapter-heading',29.12);
tl.fromTo('.builder-screen',{x:-180,y:80,rotationZ:-4,opacity:0},{x:0,y:0,rotationZ:0,opacity:1,duration:1},29);
tl.fromTo('.favorites-screen',{x:220,rotationZ:8,scale:.85,opacity:0},{x:0,rotationZ:3,scale:1,opacity:1,duration:.85},31.3);
tl.to('.builder-screen',{x:-20,y:-25,duration:3.8,ease:'none'},30);
enterText('#tools .chapter-heading',34.12);
tl.fromTo('.tools-screen',{y:200,rotationX:17,scale:.88,opacity:0},{y:0,rotationX:0,scale:1,opacity:1,duration:1},34);
tl.fromTo('.tools-screen img',{y:0},{y:-260,duration:4.1,ease:'none'},34.95);
tl.fromTo('.tools-ribbon',{y:90,opacity:0},{y:0,opacity:1,duration:.75},36);
tl.fromTo('.finale-images>div',{y:150,rotationX:12,opacity:0},{y:0,rotationX:0,opacity:1,stagger:.16,duration:.7},39.05);
tl.to('.finale-images>div',{scale:.86,y:-50,opacity:0,stagger:.07,duration:.7},41.25);
tl.fromTo('.end-ring',{scale:.6,opacity:0},{scale:1,opacity:1,duration:1.5},41.6);
tl.to('.end-ring',{scale:1.16,rotation:30,duration:5,ease:'none'},43);
enterText('.end-copy>*',42.05);
tl.fromTo('.progress span',{scaleX:0},{scaleX:1,duration:DURATION,ease:'none'},0);
tl.to('.aura-a',{x:-360,y:180,duration:DURATION,ease:'none'},0);
tl.to('.aura-b',{x:500,y:-170,duration:DURATION,ease:'none'},0);
for(const at of [3.78,9.75,16.32,19.54,24.03,29,34,39.05]){
 tl.set('#wipe',{autoAlpha:1,xPercent:-120},at-.19);
 tl.to('#wipe',{xPercent:120,duration:.56,ease:'power2.inOut'},at-.19);
 tl.set('#wipe',{autoAlpha:0},at+.38);
}
const dust=document.getElementById('dust').getContext('2d');
const points=Array.from({length:105},(_,i)=>({x:((i*701+89)%1920),y:((i*397+27)%1080),r:.5+(i%4)*.4,speed:4+i%9}));
function drawDust(t){dust.clearRect(0,0,1920,1080);for(const [i,p]of points.entries()){const x=(p.x+Math.sin(t*.11+i)*24+1920)%1920,y=(p.y-t*p.speed+1080*2)%1080;dust.globalAlpha=.12+(.5+.5*Math.sin(t*.6+i))*.35;dust.fillStyle=i%3?'#bba5f4':'#90c6ff';dust.beginPath();dust.arc(x,y,p.r,0,Math.PI*2);dust.fill();}}
const subtitle=document.getElementById('subtitle');
window.setFilmTime=function(t){const time=Math.max(0,Math.min(DURATION,t));tl.time(time,false);drawDust(time);subtitle.textContent=captions.find(([a,b])=>time>=a&&time<b)?.[2]||'';};
window.FILM_DURATION=DURATION;
function fit(){const scale=Math.min(innerWidth/1920,innerHeight/1080);const film=document.getElementById('film');film.style.transform=`scale(${scale})`;film.style.left=`${(innerWidth-1920*scale)/2}px`;film.style.top=`${(innerHeight-1080*scale)/2}px`;}
addEventListener('resize',fit);fit();
window.filmReady=Promise.all([document.fonts.ready,...Array.from(document.images,image=>image.decode())]).then(()=>{window.setFilmTime(0);window.FILM_READY=true;});
if(!new URLSearchParams(location.search).has('render')){let start;function tick(now){start??=now;window.setFilmTime(((now-start)/1000)%DURATION);requestAnimationFrame(tick);}window.filmReady.then(()=>requestAnimationFrame(tick));}
