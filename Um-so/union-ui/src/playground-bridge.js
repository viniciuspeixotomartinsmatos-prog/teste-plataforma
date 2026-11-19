import {cleanSettings} from './project-model.js';

// Serialized into the demo's isolated document. It never runs source supplied
// by an editor; text overrides use text nodes, and style values are validated.
function bridge(id,initial){
 const pausedAnimations=new WeakSet(),animationRates=new WeakMap(),appliedKeys=new Set();let settings=initial,serial=0,scheduled=false,ready=false;const edited=new WeakMap(),elements=new Map(),originalValues=new Map(),originalText=new WeakMap();
 const notify=(type,data={})=>parent.postMessage({type,id,...data},'*');
 const color=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value:'';
 const clamp=(v,a,b,f)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):f;
 const style=document.createElement('style');style.id='umso-customization';document.head.append(style);
 const nativeRAF=window.requestAnimationFrame.bind(window),nativeCancel=window.cancelAnimationFrame.bind(window),frames=new Map();let frameId=0;
 window.requestAnimationFrame=callback=>{const key=++frameId;const tick=time=>{if(!frames.has(key))return;if(settings.paused&&ready){frames.set(key,nativeRAF(tick));return;}frames.delete(key);callback(time);};frames.set(key,nativeRAF(tick));return key;};
 window.cancelAnimationFrame=key=>{const native=frames.get(key);if(native!==undefined){nativeCancel(native);frames.delete(key);}else nativeCancel(key);};
 const hsl=hex=>{const [r,g,b]=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;let h=0,s=0;if(delta){s=delta/(1-Math.abs(2*l-1));h=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;h=(h*60+360)%360;}return h+' '+s*100+'% '+l*100+'%';};
 function apply(){
  const bg=color(settings.background),fg=color(settings.foreground),accent=color(settings.accent),fonts={system:'system-ui, sans-serif',serif:'Georgia, serif',mono:'ui-monospace, monospace'};let css='';
  if(bg)css+='html,body{background:'+bg+'!important;--background:'+hsl(bg)+';--bg:'+bg+';--bg-body:'+bg+';}';
  if(fg)css+='body,h1,h2,h3,h4,h5,h6,p,label,span{color:'+fg+'!important;--foreground:'+hsl(fg)+';--text-primary:'+fg+';}';
  if(accent)css+=':root{--primary:'+hsl(accent)+';--accent-color:'+accent+';--color-primary:'+accent+';--ring:'+hsl(accent)+';}button[type=submit],a[data-primary]{background:'+accent+'!important;}';
  if(fonts[settings.font])css+='body,body *{font-family:'+fonts[settings.font]+'!important;}';
  if(settings.fontSize!==16)css+='html{font-size:'+clamp(settings.fontSize,12,28,16)+'px!important;}';
  if(settings.radius!=null)css+='button,input,textarea,select,[class*=rounded]{border-radius:'+clamp(settings.radius,0,40,12)+'px!important;}';
  if(settings.scale!==1)css+='body{zoom:'+clamp(settings.scale,.5,1.5,1)+';}';
  if(settings.paused)css+='*,*::before,*::after{animation-play-state:paused!important;}';
  if(style.textContent!==css)style.textContent=css;
  for(const animation of document.getAnimations?.()||[]){try{if(settings.speed!==1&&!animationRates.has(animation))animationRates.set(animation,animation.playbackRate);if(animationRates.has(animation))animation.playbackRate=animationRates.get(animation)*clamp(settings.speed,.25,2,1);if(settings.paused&&animation.playState==='running'){pausedAnimations.add(animation);animation.pause();}else if(!settings.paused&&pausedAnimations.has(animation)){pausedAnimations.delete(animation);animation.play();}}catch{}}
  for(const [key,node]of elements){const override=settings.texts?.[key];if(typeof override!=='string'&&!appliedKeys.has(key))continue;const value=override??originalValues.get(key);if(typeof override==='string')appliedKeys.add(key);else appliedKeys.delete(key);if(typeof value!=='string'||!node.isConnected)continue;const texts=[];const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode())if(text.parentElement?.tagName!=='SCRIPT'&&text.parentElement?.tagName!=='STYLE')texts.push(text);if(texts.map(t=>t.nodeValue).join('')===value)continue;let offset=0;for(let i=0;i<texts.length;i++){const length=originalText.get(texts[i])??texts[i].nodeValue.length;originalText.set(texts[i],length);const next=i===texts.length-1?value.slice(offset):value.slice(offset,offset+length);if(texts[i].nodeValue!==next)texts[i].nodeValue=next;offset+=length;}}
 }
 let last='';
 function scan(){
  scheduled=false;const root=document.getElementById('root')||document.getElementById('__next')||document.body;const fields=[];if(!root)return;
  for(const node of root.querySelectorAll('h1,h2,h3,h4,p,button,a,label,[data-slot=card-title],[data-slot=card-description]')){
   if(fields.length>=50)break;if(node.querySelector('h1,h2,h3,h4,p,button,a,label'))continue;
   const value=node.textContent?.trim();if(!value||value.length>1200||node.getAttribute('aria-hidden')==='true')continue;
   let key=edited.get(node);if(!key){key='text-'+(++serial);edited.set(node,key);elements.set(key,node);originalValues.set(key,node.textContent);}
   fields.push({key,tag:node.tagName.toLowerCase(),value:typeof settings.texts?.[key]==='string'?settings.texts[key]:value});
  }
  apply();const payload=JSON.stringify([fields,Boolean(document.getAnimations?.().length)]);if(payload!==last){last=payload;notify('playground:inspect',{fields,canChangeSpeed:Boolean(document.getAnimations?.().length)});}
 }
 const queue=()=>{if(!scheduled){scheduled=true;setTimeout(scan,16);}};
 window.addEventListener('message',event=>{if(event.source!==parent&&event.source!==window)return;if(event.data?.type==='playground:inspect-request'){last='';queue();}if(event.data?.type==='playground:settings'&&(!event.data.id||event.data.id===id)){settings={...initial,...event.data.settings,texts:event.data.settings?.texts||{}};apply();queue();}});
 const observer=new MutationObserver(queue);observer.observe(document.body||document.documentElement,{subtree:true,childList:true,characterData:true});
 window.addEventListener('load',()=>{ready=true;queue();});
 if(document.readyState==='complete'){ready=true;queue();}
 window.addEventListener('pagehide',()=>{observer.disconnect();for(const native of frames.values())nativeCancel(native);frames.clear();},{once:true});
}
export function playgroundScript(id,settings={}){return '('+bridge.toString()+')('+JSON.stringify(id).replace(/</g,'\\u003c')+','+JSON.stringify(cleanSettings(settings)).replace(/</g,'\\u003c')+');';}
export function addPlaygroundBridge(html,id,settings){
 const script='<script>'+playgroundScript(id,settings).replace(/<\/script/gi,'<\\/script')+'</script>';
 return /<\/head>/i.test(html)?html.replace(/<\/head>/i,()=>script+'</head>'):script+html;
}
