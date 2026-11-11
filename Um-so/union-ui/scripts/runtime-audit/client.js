import {loadPreviewDocument} from '../../src/preview-loading.js';
import {instrumentPreviewHTML} from '../../src/preview-document.js';
import {addPreviewAssetClient,createPreviewAssetResponder} from '../../src/preview-assets.js';
import {runtimeAuditProbe} from './probe.js';

const queue=JSON.parse(document.getElementById('queue').textContent),records=[],active=new Map();
const status=document.getElementById('status'),frames=document.getElementById('frames'),log=document.getElementById('log');
let running=false,stopped=false,cursor=0;
function update(){status.textContent=records.length+'/'+queue.length+' verificadas · '+records.filter(row=>!row.passed).length+' com pendência · '+active.size+' ativas';}
async function run(item){
 const slot=document.createElement('section'),label=document.createElement('h2'),frame=document.createElement('iframe');
 label.textContent=item.name;slot.append(label,frame);frames.append(slot);
 frame.title=item.name;frame.sandbox='allow-scripts allow-downloads';frame.allow='autoplay';
 const abort=new AbortController(),base=new URL(item.runtimePreviewPath||item.previewPath,location.origin).href;
 let release,ready=false,observation=null,timer,done=false,hash;
 const errors=[];const complete=new Promise(resolve=>{release=resolve;});
 const responder=createPreviewAssetResponder(frame.contentWindow,item.id,location.href);
 function finish(reason){if(done)return;done=true;clearTimeout(timer);abort.abort();window.removeEventListener('message',responder);active.delete(frame.contentWindow);
  const failedMedia=observation?.images?.filter(image=>!image.loaded)||[];
  const passed=ready&&Boolean(observation)&&!reason&&!errors.length&&!failedMedia.length&&!observation.videos?.some(video=>video.error||!video.loaded);
  const result={...observation,id:item.id,name:item.name,checkedAt:new Date().toISOString(),documentSha256:hash,ready,passed,reason,errors:[...new Set([...errors,...observation?.errors||[]])]};
  delete result.type;result.passed=passed&&!result.errors.length;records.push(result);slot.remove();log.textContent=item.id+' · '+(result.passed?'inicialização e mídia verificadas':reason||result.errors[0]||'mídia/inspeção pendente');update();release();
 }
 active.set(frame.contentWindow,{id:item.id,receive(data){if(data.type==='preview-ready'&&data.checked){ready=true;frame.contentWindow.postMessage({type:'nitido:audit-inspect',id:item.id},'*');}if(data.type==='preview-error'&&!/^ResizeObserver loop/.test(data.message||''))errors.push(data.message);if(data.type==='nitido:runtime-audit')observation=data;if(observation&&(ready||errors.length))finish();},finish});
 window.addEventListener('message',responder);timer=setTimeout(()=>finish('deadline'),37000);
 try{const html=await loadPreviewDocument(item.runtimePreviewPath||item.previewPath,base,{signal:abort.signal});hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(html)))].map(value=>value.toString(16).padStart(2,'0')).join('');const prepared=addPreviewAssetClient(instrumentPreviewHTML(html,item.id,base),item.id,base);const probe='<script>('+runtimeAuditProbe.toString()+')('+JSON.stringify(item.id)+');</script>';frame.srcdoc=prepared.replace(/<head(?:\s[^>]*)?>/i,match=>match+probe);}catch(error){finish(error.message);}
 await complete;
}
addEventListener('message',event=>{const entry=active.get(event.source);if(entry&&event.data?.id===entry.id)entry.receive(event.data);});
document.getElementById('start').onclick=async()=>{if(running)return;running=true;stopped=false;document.getElementById('start').disabled=true;await Promise.all(Array.from({length:3},async()=>{while(!stopped&&cursor<queue.length)await run(queue[cursor++]);}));running=false;document.getElementById('start').disabled=false;status.textContent+=' · '+(stopped?'INTERROMPIDA':'CONCLUÍDA');document.getElementById('download').disabled=false;};
document.getElementById('stop').onclick=()=>{stopped=true;for(const entry of [...active.values()])entry.finish('interrompida pelo operador');};
document.getElementById('download').onclick=()=>{const blob=new Blob([JSON.stringify({checkedAt:new Date().toISOString(),scope:'First paint, media decoding and bounded synthetic tab/canvas events; not complete manual interaction acceptance.',records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='nitido-runtime-audit.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
update();
