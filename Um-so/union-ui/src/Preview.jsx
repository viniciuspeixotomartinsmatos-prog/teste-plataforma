import React,{useState,useEffect,useRef} from 'react';
import {Loader2,RefreshCw,MousePointer2,RotateCcw} from 'lucide-react';
import {instrumentPreviewHTML} from './preview-document.js';
export function Preview({item,theme='dark',width='desktop',config,onStatus}){
 const [attempt,setAttempt]=useState(0),[state,setState]=useState('loading'),[message,setMessage]=useState(''),[documentHTML,setDocumentHTML]=useState('');
 const frame=useRef(null);
 const local=item.runtimePreviewPath||item.previewPath;
 const retained=Boolean(local&&!local.startsWith('/previews/runtime/'));
 const src=local?(theme==='light'&&local.startsWith('/previews/runtime/')?local.replace(/\.html$/,'.light.html'):local):'/api/preview/'+encodeURIComponent(item.id)+'?theme='+theme;
 useEffect(()=>{setState('loading');setMessage('');setDocumentHTML('');const controller=new AbortController();if(retained)fetch(src,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Não foi possível carregar a demonstração.');return r.text();}).then(html=>setDocumentHTML(instrumentPreviewHTML(html,item.id,new URL(src,window.location.href).href))).catch(error=>{if(error.name!=='AbortError'){setState('error');setMessage(error.message);}});return()=>controller.abort();},[item.id,src,attempt,retained]);
 useEffect(()=>{if(state!=='loading')return;const timeout=setTimeout(()=>{setState('error');setMessage('A prévia não confirmou a inicialização. Verifique a conexão e tente novamente.');},30000);return()=>clearTimeout(timeout);},[state,item.id,attempt]);
 useEffect(()=>{const listener=e=>{if(e.source!==frame.current?.contentWindow||e.data?.id!==item.id)return;if(e.data.type==='preview-ready'){setState('ready');onStatus?.('ready');if(config)frame.current.contentWindow.postMessage({type:'preview:set-props',props:config},'*');}if(e.data.type==='preview-error'){setState('error');setMessage(e.data.message||'Não foi possível carregar a prévia.');onStatus?.('error',e.data.message);}};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[item.id,config,onStatus]);
 useEffect(()=>{if(frame.current?.contentWindow&&config)frame.current.contentWindow.postMessage({type:'preview:set-props',props:config},'*');},[config]);

 return <div className={'preview-stage '+(theme==='light'?'preview-light':'')}><div className={'preview-device device-'+width}>
 <iframe ref={frame} key={item.id+attempt+theme} title={'Preview interativo de '+item.name} src={retained?undefined:src} srcDoc={retained?(documentHTML||undefined):undefined} sandbox="allow-scripts allow-downloads"/>
 {state==='loading'&&<div className="preview-loading"><Loader2 className="spin"/><p>Preparando sua prévia</p><small>O componente já está sendo carregado.</small></div>}
 {state==='error'&&<div className="preview-runtime-error" role="alert"><p>Não foi possível concluir o carregamento.</p><button className="button" onClick={()=>setAttempt(v=>v+1)}><RotateCcw size={14}/> Tentar novamente</button><details><summary>Detalhes técnicos</summary><code>{message.slice(0,400)}</code></details></div>}
 </div><button className="preview-refresh icon-button" title="Reiniciar preview" onClick={()=>setAttempt(v=>v+1)}><RefreshCw size={15}/></button>{state==='ready'&&<div className="preview-interaction-hint"><MousePointer2 size={11}/> Interaja com a prévia</div>}</div>;
}
