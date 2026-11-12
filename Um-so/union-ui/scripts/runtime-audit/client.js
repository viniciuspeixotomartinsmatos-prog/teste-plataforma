import {loadPreviewDocument} from '../../src/preview-loading.js';
import {instrumentPreviewHTML} from '../../src/preview-document.js';
import {addPreviewAssetClient,createPreviewAssetResponder} from '../../src/preview-assets.js';
import {runtimeAuditProbe} from './probe.js';

const queue=JSON.parse(document.getElementById('queue').textContent),records=[],active=new Map();
const metadata=fetch('/tools/runtime-audit/batch.json',{credentials:'same-origin'}).then(response=>response.ok?response.json():null).catch(()=>null);
const status=document.getElementById('status'),frames=document.getElementById('frames'),log=document.getElementById('log');
const details=document.createElement('details'),summary=document.createElement('summary'),reportView=document.createElement('pre');
summary.textContent='Ver evidência da triagem';reportView.style.whiteSpace='pre-wrap';details.append(summary,reportView);frames.before(details);
details.addEventListener('toggle',()=>{if(details.open)reportView.textContent=JSON.stringify(records,null,2);});
let running=false,stopped=false,cursor=0;
const params=new URLSearchParams(location.search);
const mobile=params.get('viewport')==='mobile',retry=params.get('retry')==='1';
const checkpointURL='/tools/runtime-audit/checkpoint'+(mobile?'?viewport=mobile':'');
let pending=[],writing=Promise.resolve(),checkpointError,sweep=false;
function save(){
 if(!pending.length)return writing;
 const rows=pending.splice(0);
 writing=writing.then(async()=>{
  const response=await fetch(checkpointURL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rows)});
  if(!response.ok)throw Error('Checkpoint HTTP '+response.status);
 }).catch(error=>{checkpointError=error;stopped=true;});
 return writing;
}
function update(){status.textContent=records.length+'/'+queue.length+' verificadas · '+records.filter(row=>!row.passed).length+' com pendência · '+active.size+' ativas';}
async function run(item){
 const slot=document.createElement('section'),label=document.createElement('h2'),frame=document.createElement('iframe');
 label.textContent=item.name;slot.append(label,frame);frames.append(slot);
 frame.title=item.name;frame.sandbox='allow-scripts allow-downloads';frame.allow='autoplay';
 if(mobile){frame.style.width='390px';frame.style.height='844px';}
 const abort=new AbortController(),base=new URL(item.runtimePreviewPath||item.previewPath,location.origin).href;
 let release,ready=false,observation=null,timer,done=false,hash,preparedHash,requestedLayout=false,mobileLayout;
 const errors=[];const complete=new Promise(resolve=>{release=resolve;});
 const responder=createPreviewAssetResponder(frame.contentWindow,item.id,location.href);
 function finish(reason){if(done)return;done=true;clearTimeout(timer);abort.abort();window.removeEventListener('message',responder);active.delete(frame.contentWindow);
  const failedMedia=observation?.images?.filter(image=>!image.loaded)||[];
  const passed=ready&&Boolean(observation)&&!reason&&!errors.length&&!failedMedia.length&&!observation.videos?.some(video=>video.error||!video.loaded||!video.advanced);
  const result={...observation,id:item.id,name:item.name,kind:item.kind,recoveryMode:item.recoveryMode,checkedAt:new Date().toISOString(),sourceDocumentSha256:hash,preparedDocumentSha256:preparedHash,ready,passed,reason,mobileLayout,errors:[...new Set([...errors,...observation?.errors||[]])]};
  delete result.type;result.passed=passed&&!result.errors.length;records.push(result);slot.remove();log.textContent=item.id+' · '+(result.passed?'inicialização e mídia verificadas':reason||result.errors[0]||'mídia/inspeção pendente');update();
  if(!reason?.startsWith('interrompida'))metadata.then(batch=>{if(batch?.sweep){pending.push(result);if(pending.length>=5)save();}});
  release();
 }
 active.set(frame.contentWindow,{id:item.id,receive(data){
  if(data.type==='preview-ready'&&data.checked){ready=true;frame.contentWindow.postMessage({type:'nitido:audit-inspect',id:item.id},'*');}
  if(data.type==='preview-error'&&!/^ResizeObserver loop/.test(data.message||''))errors.push(data.message);
  if(data.type==='nitido:runtime-audit')observation=data;
  if(data.type==='nitido:audit-layout-result'&&requestedLayout)mobileLayout=data.layout;
  if(!observation||(!ready&&!errors.length))return;
  if(sweep&&!mobile&&!errors.length&&!observation.errors?.length&&!mobileLayout){
   if(!requestedLayout){
    requestedLayout=true;
    frame.style.width='390px';frame.style.height='844px';
    frame.contentWindow.postMessage({type:'nitido:audit-layout',id:item.id},'*');
   }
   return;
  }
  finish();
 },finish});
 window.addEventListener('message',responder);timer=setTimeout(()=>finish('deadline'),37000);
 const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');
 const fetcher=async(url,options)=>{const response=await fetch(url,options);if(url===(item.runtimePreviewPath||item.previewPath)&&response.ok)hash=await digest(await response.clone().arrayBuffer());return response;};
 try{const html=await loadPreviewDocument(item.runtimePreviewPath||item.previewPath,base,{signal:abort.signal,fetcher});preparedHash=await digest(new TextEncoder().encode(html));const prepared=addPreviewAssetClient(instrumentPreviewHTML(html,item.id,base),item.id,base);const probe='<script>('+runtimeAuditProbe.toString()+')('+JSON.stringify(item.id)+');</script>';if(!done)frame.srcdoc=prepared.replace(/<head(?:\s[^>]*)?>/i,match=>match+probe);}catch(error){finish(error.message);}
 await complete;
}
addEventListener('message',event=>{const entry=active.get(event.source);if(entry&&event.data?.id===entry.id)entry.receive(event.data);});
document.getElementById('start').onclick=async()=>{
 if(running)return;
 running=true;stopped=false;checkpointError=undefined;const startButton=document.getElementById('start');startButton.disabled=true;
 const batch=await metadata;
 sweep=Boolean(batch?.sweep);
 try{
  let remaining=queue.slice(cursor);
  if(batch?.sweep){
   const response=await fetch(checkpointURL);
   if(!response.ok)throw Error('Checkpoint HTTP '+response.status);
   const saved=(await response.json()).filter(row=>(!retry||row.passed)&&(mobile||!row.passed||row.mobileLayout));
   records.splice(0,records.length,...saved);
   const ids=new Set(saved.map(row=>row.id));remaining=queue.filter(row=>!ids.has(row.id));update();
  }
  let index=0;
  const concurrency=retry?1:batch?.sweep?6:3;
  await Promise.all(Array.from({length:concurrency},async()=>{while(!stopped&&index<remaining.length)await run(remaining[index++]);}));
  cursor+=index;
  if(batch?.sweep)await save();
  if(checkpointError)throw checkpointError;
  status.textContent+=' · '+(stopped?'INTERROMPIDA':'CONCLUÍDA');
 }catch(error){status.textContent+=' · '+error.message;}
 finally{running=false;startButton.disabled=false;document.getElementById('download').disabled=false;}
};
document.getElementById('stop').onclick=()=>{stopped=true;for(const entry of [...active.values()])entry.finish('interrompida pelo operador');};
document.getElementById('download').onclick=async()=>{const batch=await metadata;const blob=new Blob([JSON.stringify({checkedAt:new Date().toISOString(),environment:location.origin,batch,scope:'First paint, video time advancing and bounded synthetic tab/canvas events; not complete manual interaction acceptance.',records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='nitido-runtime-audit-'+(batch?.start??0)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
update();
