// Runs inside an isolated preview, before the original component starts.
// Only explicitly recovered asset URLs change; application requests retain
// their methods, bodies and destinations.
function remapAssets(mapping){
 const filled=new WeakSet();
 const resolve=value=>{if(typeof value!=='string')return value;if(mapping[value])return mapping[value];try{const url=new URL(value,document.baseURI);return mapping[url.href]||mapping[url.origin+url.pathname]||mapping[url.pathname+url.search]||mapping[url.pathname]||value;}catch{return value;}};
 const rewrite=value=>typeof value==='string'?value.replace(/url\((['"]?)(.*?)\1\)/g,(_,quote,url)=>'url('+quote+resolve(url)+quote+')'):value;
 const srcset=value=>String(value).replace(/(?:https?:\/\/|\/)[^\s,]+/g,resolve);
 for(const [proto,key]of [[HTMLImageElement.prototype,'src'],[HTMLImageElement.prototype,'srcset'],[HTMLMediaElement.prototype,'src'],[HTMLVideoElement.prototype,'poster'],[HTMLSourceElement.prototype,'src'],[HTMLSourceElement.prototype,'srcset']]){const descriptor=Object.getOwnPropertyDescriptor(proto,key);if(!descriptor?.set)continue;Object.defineProperty(proto,key,{...descriptor,set(value){descriptor.set.call(this,key==='srcset'?srcset(value):resolve(value));}});}
 const setAttribute=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){if(/^(src|poster)$/i.test(name)||name==='href'&&['IMAGE','LINK'].includes(this.tagName.toUpperCase()))value=resolve(value);else if(name==='srcset')value=srcset(value);else if(name==='style')value=rewrite(value);return setAttribute.call(this,name,value);};
 const originalFetch=window.fetch;window.fetch=function(input,options){if(typeof input==='string'||input instanceof URL)return originalFetch.call(this,resolve(String(input)),options);if(input instanceof Request){const url=resolve(input.url);if(url!==input.url)return originalFetch.call(this,new Request(url,input),options);}return originalFetch.call(this,input,options);};
 const scan=()=>{for(const node of document.querySelectorAll('img,video,source,image,style,[style]')){if(node.tagName==='IMG'&&!node.getAttribute('src')&&!node.getAttribute('srcset')&&mapping.__emptyImage&&!filled.has(node)){filled.add(node);setAttribute.call(node,'src',mapping.__emptyImage);}if(node.tagName==='STYLE'){const next=rewrite(node.textContent);if(next!==node.textContent)node.textContent=next;}else{for(const key of ['src','srcset','poster','href','style']){const current=node.getAttribute(key);if(!current)continue;const next=key==='style'?rewrite(current):key==='srcset'?srcset(current):resolve(current);if(next!==current)setAttribute.call(node,key,next);}}}};
 let pending=false;new MutationObserver(records=>{if(!records.some(r=>r.type==='childList'||r.attributeName!=='style'||r.target.getAttribute('style')?.includes('url(')))return;if(!pending){pending=true;setTimeout(()=>{pending=false;scan();},16);}}).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset','poster','href','style']});
 scan();
}
export function demoAssetScript(mapping){return '('+remapAssets.toString()+')('+JSON.stringify(mapping).replace(/</g,'\\u003c')+');';}
export function injectDemoAssets(html,mapping){
 if(!mapping||!Object.keys(mapping).length)return html;
 html=html.replace(/<script data-umso-assets>[\s\S]*?<\/script>/g,'');
 const script='<script data-umso-assets>'+demoAssetScript(mapping)+'</script>';
 return /<head(?:\s[^>]*)?>/i.test(html)?html.replace(/<head(?:\s[^>]*)?>/i,m=>m+script):script+html;
}
