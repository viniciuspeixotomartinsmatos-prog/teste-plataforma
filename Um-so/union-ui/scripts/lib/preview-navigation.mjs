/** Ephemeral navigation for an isolated srcdoc demonstration; never changes parent history. */
export function createPreviewNavigation(){
 const entries=[{pathname:'/',search:'',hash:'',state:null,key:'initial'}],listeners=new Set();let index=0,action='POP';
 const href=to=>typeof to==='string'?to:(to.pathname||entries[index].pathname)+(to.search||'')+(to.hash||'');
 const location=(to,state)=>{const url=new URL(href(to),'https://preview.invalid');return {pathname:url.pathname,search:url.search,hash:url.hash,state:state??to?.state??null,key:String(Date.now())+'-'+Math.random()};};
 const publish=()=>{for(const listener of listeners)listener({action,location:entries[index],delta:0});};
 return {get action(){return action},get location(){return entries[index]},createHref:href,createURL:to=>new URL(href(to),'https://preview.invalid'),encodeLocation:to=>{const {pathname,search,hash}=location(to);return {pathname,search,hash}},listen(listener){listeners.add(listener);return()=>listeners.delete(listener);},push(to,state){action='PUSH';entries.splice(index+1);entries.push(location(to,state));index++;publish();},replace(to,state){action='REPLACE';entries[index]=location(to,state);publish();},go(delta){index=Math.max(0,Math.min(entries.length-1,index+delta));action='POP';publish();}};
}
