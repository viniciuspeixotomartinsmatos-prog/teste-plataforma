// Executes only our measurement script in an opaque, network-denied iframe.
export function sampleComputedDesign(doc= document){
 const nodes=[...doc.querySelectorAll('body *')].slice(0,600),colors=new Map(),fonts=new Map(),radii=new Map(),spacing=new Map();
 const add=(map,key)=>{if(key&&key!=='rgba(0, 0, 0, 0)'&&key!=='transparent')map.set(key,(map.get(key)||0)+1);};
 for(const node of nodes){const s=doc.defaultView.getComputedStyle(node),rect=node.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||!rect.width||!rect.height)continue;for(const key of ['color','backgroundColor','borderTopColor'])add(colors,s[key]);add(fonts,s.fontFamily);add(radii,s.borderTopLeftRadius);for(const key of ['gap','paddingTop','paddingLeft'])if(parseFloat(s[key])>0)add(spacing,s[key]);}
 const top=map=>[...map].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([value,count])=>({value,count}));return {colors:top(colors),fonts:top(fonts),radii:top(radii),spacing:top(spacing),sampledElements:nodes.length,scope:'Estilos calculados de reconstrução inerte do HTML/CSS coletado; sem scripts, imagens, fontes externas ou estados dinâmicos do site original.'};
}
export function computeDesignSnapshot(snapshot,{signal,document:doc=document}={}){
 if(!snapshot?.html||snapshot.html.length>200000||snapshot.css.length>200000)return Promise.resolve(null);
 return new Promise(resolve=>{const frame=doc.createElement('iframe'),id=crypto.randomUUID();let timer,done=false;function finish(value){if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',receive);signal?.removeEventListener('abort',abort);frame.remove();resolve(value);}function abort(){finish(null);}function receive(event){if(event.source!==frame.contentWindow||event.data?.type!=='nitido:computed-design'||event.data.id!==id)return;const data=event.data.result;if(!data||!Array.isArray(data.colors)||data.colors.length>8)return finish(null);finish(data);}
 if(signal?.aborted)return finish(null);frame.sandbox='allow-scripts';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.title='Análise isolada de estilos';frame.style.cssText='position:fixed;left:-10000px;top:0;width:1280px;height:800px;opacity:0;pointer-events:none';doc.body.append(frame);window.addEventListener('message',receive);signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(null),5000);
 const script='setTimeout(()=>parent.postMessage({type:"nitido:computed-design",id:'+JSON.stringify(id)+',result:('+sampleComputedDesign.toString()+')()},"*"),100)';
 frame.srcdoc='<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; script-src &apos;unsafe-inline&apos;; style-src &apos;unsafe-inline&apos;; img-src &apos;none&apos;; font-src &apos;none&apos;; connect-src &apos;none&apos;; form-action &apos;none&apos;; base-uri &apos;none&apos;"><style>'+snapshot.css+'</style></head>'+snapshot.html+'<script>'+script+'</script></html>';
 });
}
