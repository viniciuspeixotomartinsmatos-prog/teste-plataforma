import {preparePreviewAssets} from './preview-assets.js';

// One deadline covers HTML, protected resources and module preparation. Racing
// also bounds workers/fetch implementations that ignore AbortSignal.
export async function loadPreviewDocument(src,base,{signal,timeoutMs=20000,fetcher=fetch,prepare=preparePreviewAssets}={}){
 const controller=new AbortController();let timer,abort;
 const cancellation=new Promise((_,reject)=>{
  abort=()=>{controller.abort();reject(new DOMException('Carregamento cancelado.','AbortError'));};
  if(signal?.aborted){abort();return;}
  signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>{controller.abort();reject(Error('A prévia demorou para carregar. Tente novamente.'));},timeoutMs);
 });
 const work=(async()=>{
  if(controller.signal.aborted)throw new DOMException('Carregamento cancelado.','AbortError');
  const response=await fetcher(src,{credentials:'same-origin',signal:controller.signal});
  if(!response.ok)throw Error('Não foi possível carregar a demonstração.');
  const html=await response.text();
  return prepare(html,base,{signal:controller.signal,fetcher});
 })();
 try{return await Promise.race([work,cancellation]);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
