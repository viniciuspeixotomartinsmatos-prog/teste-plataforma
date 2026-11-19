import React,{useState,useEffect,useRef} from 'react';
import {contextualRecommendations,contextualIntegrationPrompt} from './contextual-recommendations.js';
export default function RenderedDesignPanel({result,onResult,copy,stage,copied}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const active=useRef(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;active.current?.abort();};},[]);
 const captured=result.site.design?.rendered;
 async function capture(){
  if(busy)return;setBusy(true);setError('');const controller=new AbortController();active.current=controller;const timer=setTimeout(()=>controller.abort(),40000);
  try{
   const response=await fetch('/api/site-audit/render',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:result.site.url}),signal:controller.signal});
   const data=await response.json();if(!response.ok||!data.render)throw Error(data.error||'Captura indisponível.');
   const next={...result,site:{...result.site,design:{...result.site.design,rendered:data.render}}};
   try{next.contextualRecommendations=await contextualRecommendations(next.site,{signal:controller.signal,visual:result.visualRecommendations});}catch{next.contextualRecommendations=[];}
   if(alive.current&&!controller.signal.aborted)onResult(next);
  }catch(error){if(alive.current)setError(error.name==='AbortError'?'A captura atingiu o prazo. Sua análise foi preservada.':error.message);}
  finally{clearTimeout(timer);if(alive.current)setBusy(false);}
 }
 return <section className="rx-priorities" aria-label="Design renderizado e recomendações">
  <h3>Design real após JavaScript</h3><p>Abre uma única página pública em navegador descartável, sem sua sessão. Até64 recursos e24MB; bloqueios, login e estados não visitados continuam fora do escopo.</p>
  <button className="rx-action" disabled={busy||Boolean(stage)||result.example} onClick={capture}>{busy?'Capturando o design renderizado…':captured?'Atualizar captura de design':'Capturar design renderizado'}</button>
  {busy&&<p role="status">Medindo estilos e estrutura. Nenhuma nova chamada ao PageSpeed é feita nesta etapa.</p>}
  {error&&<p role="alert">{error}</p>}
  {captured&&<><p>{captured.computed.scope}</p><p>{captured.computed.sampledElements} elementos amostrados · {captured.coverage.requests} recursos · {captured.coverage.partial?'Captura parcial; há recursos ou execuções não concluídos.':'Captura concluída dentro dos limites informados.'}</p><p>Cores: {captured.computed.colors.map(row=>row.value).join(', ')}</p><p>Fontes: {captured.computed.fonts.map(row=>row.value).join(', ')}</p></>}
  {result.contextualRecommendations?.length>0&&<><h4>Componentes sugeridos para esta estrutura</h4><p>Estrutura observada + modelo semântico local LSA; aparência complementa a seleção quando disponível. Não há envio a uma IA externa.</p>{result.contextualRecommendations.map(item=><article key={item.resourceId}><p><a href={'/component/'+encodeURIComponent(item.id)}>{item.name}</a> · {item.reason}</p><button className="rx-action" onClick={()=>copy(contextualIntegrationPrompt(result.site,item),'context-'+item.resourceId)}>{copied==='context-'+item.resourceId?'Copiado':'Copiar prompt de integração'}</button></article>)}</>}
 </section>;
}
