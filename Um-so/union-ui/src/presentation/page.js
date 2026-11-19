gsap.registerPlugin(ScrollTrigger);
const slides=[
 {src:'assets/fundos.png',alt:'Catálogo de backgrounds e shaders',caption:'Explore o catálogo.'},
 {src:'assets/playground.png',alt:'Playground com controles reais de personalização',caption:'Experimente no playground.'},
 {src:'assets/ferramentas.png',alt:'Diretório de ferramentas criativas do app',caption:'Continue criando com as ferramentas.'}
];
let slide=0;
const image=document.getElementById('demo-image');
function showSlide(index){slide=(index+slides.length)%slides.length;const selected=slides[slide];image.src=selected.src;image.alt=selected.alt;document.getElementById('demo-caption').textContent=selected.caption;document.getElementById('slide-counter').textContent=`${slide+1} / ${slides.length}`;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(image,{opacity:.4,scale:1.035},{opacity:1,scale:1,duration:.45,overwrite:true});}
document.getElementById('previous').addEventListener('click',()=>showSlide(slide-1));
document.getElementById('next').addEventListener('click',()=>showSlide(slide+1));
document.querySelectorAll('[data-slide]').forEach(link=>link.addEventListener('click',()=>showSlide(Number(link.dataset.slide))));
document.getElementById('watch').addEventListener('click',()=>{const video=document.getElementById('video');document.getElementById('filme').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});video.muted=false;video.play().catch(()=>{video.focus();});});
const paragraph=document.querySelector('.reveal-text');
paragraph.replaceChildren(...paragraph.textContent.trim().split(/\s+/).flatMap((word,index)=>{const span=document.createElement('span');span.className='reveal-word';span.textContent=word;return index?[document.createTextNode(' '),span]:[span];}));
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 gsap.from('.hero-copy>*',{y:32,opacity:0,stagger:.12,duration:1,ease:'power3.out'});
 gsap.from('.art-screen',{x:100,y:30,opacity:0,rotationY:-30,duration:1.3,ease:'power3.out'});
 gsap.from('.art-crop',{y:65,opacity:0,duration:1.2,delay:.35,ease:'power3.out'});
 gsap.to('.art-crop',{y:-13,rotation:3,duration:3.4,yoyo:true,repeat:-1,ease:'sine.inOut'});
 gsap.to('.marquee>div',{xPercent:-50,duration:30,repeat:-1,ease:'none'});
 gsap.utils.toArray('.feature').forEach((item,index)=>gsap.from(item,{scrollTrigger:{trigger:item,start:'top 90%',once:true},y:55,opacity:0,duration:.8,delay:index*.09,ease:'power3.out'}));
 gsap.to('.reveal-word',{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:'.demo',start:'top 65%',end:'bottom 70%',scrub:true}});
 gsap.from('.video-shell',{scale:.92,opacity:.45,scrollTrigger:{trigger:'.film-section',start:'top 75%',end:'top 15%',scrub:true},ease:'none'});
 gsap.from('.closing h2',{y:70,opacity:0,scrollTrigger:{trigger:'.closing',start:'top 70%',once:true},duration:1,ease:'power3.out'});
});
mm.add('(min-width: 1051px) and (prefers-reduced-motion: no-preference)',()=>{
 ScrollTrigger.create({trigger:'.demo',start:'top 110px',end:'+=240',pin:'.demo-copy',pinSpacing:false});
 gsap.to('.demo-media img',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.demo',start:'top bottom',end:'bottom top',scrub:true}});
});
