import React,{useEffect,useState} from 'react';
import {api} from './account.js';
import CreatorPreview from './CreatorPreview.jsx';
import {creatorDraftZip} from './creator-files.js';
import {downloadBlob} from './catalog.js';

const command=(action,input={})=>api('/api/creator-command',{method:'POST',body:{action,input}});
const labels={pending:'Em análise',approved:'Publicado · Nítido Verified',rejected:'Rejeitado',archived:'Versão anterior',withdrawn:'Retirado'};
export default function CommunityReview({draft,dirty}){
 const [list,setList]=useState(null),[item,setItem]=useState(null),[reports,setReports]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [metrics,setMetrics]=useState(null);
 const [consent,setConsent]=useState(false),[reason,setReason]=useState(''),[tested,setTested]=useState(false),[licensed,setLicensed]=useState(false),[offset,setOffset]=useState(0);
 useEffect(()=>{setConsent(false);},[draft]);
 async function refresh(page=offset){
   const [result,totals]=await Promise.all([command('list',{offset:page}),command('metrics')]);setMetrics(totals);setList(result);setOffset(page);
   if(result.moderator)setReports(await command('reports'));
 }
 async function run(work){
   setBusy(true);setMessage('');
   try{await work();}catch(error){setMessage(error.message);}finally{setBusy(false);}
 }
 async function inspect(row){
   const source=await command('source',{id:row.id});
   setItem({...row,source});setReason('');setTested(false);setLicensed(false);
 }
 useEffect(()=>{
   const id=new URLSearchParams(window.location.search).get('version');
   if(id)run(()=>inspect({id,status:'approved'}));
 },[]);
 async function change(action,input){
   await command(action,input);setItem(null);setMessage('Alteração registrada.');await refresh();
 }
 return <section className="creator-panel"><h2>Comunidade Creators</h2><a href="/api/community">Explorar perfis e publicações</a>
 <fieldset disabled={busy} className="creator-form">
 {draft&&<div><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Autorizo publicar esta versão, meu nome de exibição e biografia após revisão.</label>
 <button className="button" disabled={dirty||!consent} onClick={()=>run(async()=>{const result=await command('submit',{draft:draft.id,consent});setConsent(false);await refresh();setMessage('Versão '+result.version+' enviada para revisão.');})}>Enviar versão salva</button></div>}
 <button className="button" onClick={()=>run(()=>refresh(0))}>Consultar envios</button>
 {metrics&&<section aria-label="Métricas de publicação"><h3>{metrics.scope==='community'?'Métricas da comunidade':'Métricas dos meus envios'}</h3><dl>{[['submitted','Versões enviadas'],['pending','Em revisão'],['published','Publicadas'],['rejected','Rejeitadas'],['archived','Arquivadas'],['withdrawn','Retiradas']].map(([key,label])=><div key={key}><dt>{label}</dt><dd>{metrics[key]}</dd></div>)}</dl></section>}
 {list&&<><h3>{list.moderator?'Fila de moderação':'Minhas versões'}</h3>{list.rows.length===0&&<p>Nenhum envio nesta página.</p>}
 {list.rows.map(row=><p key={row.id}><button className="text-button" onClick={()=>run(()=>inspect(row))}>{row.name} · v{row.version}</button> · {labels[row.status]} {row.reason}</p>)}
 {offset>0&&<button onClick={()=>run(()=>refresh(offset-100))}>Anterior</button>}
 {list.rows.length===100&&<button onClick={()=>run(()=>refresh(offset+100))}>Próxima</button>}</>}
 {reports.map((row,i)=><p key={row.version_id+i}><button onClick={()=>run(()=>inspect({id:row.version_id,status:'approved'}))}>{row.name}</button> · {row.reason}</p>)}
 {item&&<article><h3>{item.source.name}</h3><p>{item.source.description}</p><p>{item.source.author} · {item.source.license}</p>
 <CreatorPreview draft={item.source}/><details><summary>Revisar código</summary><pre style={{whiteSpace:'pre-wrap'}}>{item.source.source}</pre></details>
 <button className="button" onClick={()=>downloadBlob(new Blob([creatorDraftZip(item.source)],{type:'application/zip'}),'componente.zip')}>Baixar arquivos da versão</button>
 <label>Motivo ou observação<textarea maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
 {item.status==='approved'&&<button disabled={reason.trim().length<5} onClick={()=>run(()=>change('report',{id:item.id,reason}))}>Denunciar</button>}
 {list?.moderator&&item.status==='pending'&&<div><label><input type="checkbox" checked={tested} onChange={e=>setTested(e.target.checked)}/> Testei a renderização e as interações desta versão.</label>
 <label><input type="checkbox" checked={licensed} onChange={e=>setLicensed(e.target.checked)}/> Conferi autoria e licença.</label>
 <button disabled={!tested||!licensed} onClick={()=>run(()=>change('review',{id:item.id,decision:'approved',tested,licensed,reason}))}>Aprovar e publicar</button>
 <button disabled={reason.trim().length<5} onClick={()=>run(()=>change('review',{id:item.id,decision:'rejected',reason}))}>Rejeitar com motivo</button></div>}
 {list?.rows.some(row=>row.id===item.id)&&<button onClick={()=>run(()=>change('withdraw',{id:item.id,reason}))}>Retirar versão</button>}
 </article>}</fieldset>{message&&<p role="status">{message}</p>}</section>;
}
