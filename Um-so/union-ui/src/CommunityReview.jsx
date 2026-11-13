import React,{useEffect,useState} from 'react';
import {api} from './account.js';
import CreatorPreview from './CreatorPreview.jsx';
import {creatorDraftZip,creatorIntegrationPrompt} from './creator-files.js';
import {copyText,downloadBlob} from './catalog.js';

async function command(action,input={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{return await api('/api/creator-command',{method:'POST',body:{action,input},signal:controller.signal});}
 catch(error){if(error.name==='AbortError')throw Error('A operação demorou para responder. Confira a conexão e tente novamente.');throw error;}
 finally{clearTimeout(timer);}
}
const labels={pending:'Em análise',approved:'Publicado · Nítido Verified',rejected:'Rejeitado',archived:'Versão anterior',withdrawn:'Retirado'};
export default function CommunityReview({draft,dirty,onRestore}){
 const [list,setList]=useState(null),[item,setItem]=useState(null),[reports,setReports]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [metrics,setMetrics]=useState(null);
 const [reportReasons,setReportReasons]=useState({}),[reportOffset,setReportOffset]=useState(0);
 const [consent,setConsent]=useState(false),[reason,setReason]=useState(''),[tested,setTested]=useState(false),[licensed,setLicensed]=useState(false),[offset,setOffset]=useState(0);
 useEffect(()=>{setConsent(false);},[draft]);
 async function refresh(page=offset,reportPage=reportOffset){
   const [result,totals]=await Promise.all([command('list',{offset:page}),command('metrics')]);setMetrics(totals);setList(result);setOffset(page);
   if(result.moderator){setReports(await command('reports',{offset:reportPage}));setReportOffset(reportPage);}
 }
 async function run(work){
   setBusy(true);setMessage('');
   try{await work();}catch(error){setMessage(error.message);}finally{setBusy(false);}
 }
 async function inspect(row){
   const source=await command('source',{id:row.id});
   setItem({...row,...(source.nitidoVersion||{}),source});setReason('');setTested(false);setLicensed(false);
 }
 useEffect(()=>{
   const id=new URLSearchParams(window.location.search).get('version');
   if(id)run(()=>inspect({id,status:'approved'}));
 },[]);
 async function change(action,input){
   await command(action,input);setItem(null);setMessage('Alteração registrada.');await refresh();
 }
 function record(kind){if(item.status==='approved')command('event',{id:item.id,kind}).catch(()=>{});}
 return <section className="creator-panel"><h2>Comunidade Creators</h2><a href="/community">Explorar perfis e publicações</a>
 <fieldset disabled={busy} className="creator-form">
 {draft&&<div><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Autorizo publicar esta versão, meu nome de exibição e biografia após revisão.</label>
 <button className="button" disabled={dirty||!consent} onClick={()=>run(async()=>{const result=await command('submit',{draft:draft.id,consent});setConsent(false);await refresh();setMessage('Versão '+result.version+' enviada para revisão.');})}>Enviar versão salva</button></div>}
 <button className="button" onClick={()=>run(()=>refresh(0))}>Consultar envios</button>
 {metrics&&<section aria-label="Métricas de publicação"><h3>{metrics.scope==='community'?'Métricas da comunidade':'Métricas dos meus envios'}</h3><dl>{[['submitted','Versões enviadas'],['pending','Em revisão'],['published','Publicadas'],['rejected','Rejeitadas'],['archived','Arquivadas'],['withdrawn','Retiradas']].map(([key,label])=><div key={key}><dt>{label}</dt><dd>{metrics[key]}</dd></div>)}</dl></section>}
 {metrics?.activity&&<section aria-label="Uso das publicações"><h3>Uso das publicações · 90 dias</h3><dl>{[['opens','Aberturas da página'],['copies','Cópias solicitadas'],['downloads','Downloads iniciados']].map(([key,label])=><div key={key}><dt>{label}</dt><dd>{metrics.activity[key]}</dd></div>)}</dl><p>Contadores agregados, sem identificar visitantes. Incluem repetições e podem incluir robôs; não medem pessoas únicas.</p></section>}
 {list&&<><h3>{list.moderator?'Fila de moderação':'Minhas versões'}</h3>{list.rows.length===0&&<p>Nenhum envio nesta página.</p>}
 {list.rows.map(row=><p key={row.id}><button className="text-button" onClick={()=>run(()=>inspect(row))}>{row.name} · v{row.version}</button> · {labels[row.status]} {row.reason}</p>)}
 {offset>0&&<button onClick={()=>run(()=>refresh(offset-100))}>Anterior</button>}
 {list.rows.length===100&&<button onClick={()=>run(()=>refresh(offset+100))}>Próxima</button>}</>}
 {reports.length>0&&<h3>Denúncias abertas</h3>}
 {reports.map(row=><article className="creator-panel" key={row.id}><button onClick={()=>run(()=>inspect({id:row.version_id,status:row.status}))}>{row.name}</button><p>{row.reason}</p><label>Decisão da moderação<textarea maxLength={1000} value={reportReasons[row.id]||''} onChange={e=>setReportReasons(old=>({...old,[row.id]:e.target.value}))}/></label><button disabled={(reportReasons[row.id]||'').trim().length<5} onClick={()=>run(()=>change('resolve-report',{id:row.id,reason:reportReasons[row.id],createdAt:row.created_at}))}>Resolver denúncia e registrar decisão</button></article>)}
 {list?.moderator&&<nav aria-label="Paginação de denúncias">{reportOffset>0&&<button onClick={()=>run(()=>refresh(offset,reportOffset-100))}>Denúncias anteriores</button>}{reports.length===100&&<button onClick={()=>run(()=>refresh(offset,reportOffset+100))}>Próximas denúncias</button>}</nav>}
 {item&&<article><h3>{item.source.name}</h3><p>{item.source.description}</p><p>{item.source.author} · {item.source.license}</p>
 {onRestore&&<button className="button" onClick={()=>{onRestore(item.source);setItem(null);}}>Usar esta versão no editor</button>}
 {item.source.analysis&&<section aria-label="Verificação automática"><h4>Preparação técnica: {item.source.analysis.score}/100</h4><p>{item.source.analysis.scope}</p><p>Verificado em {new Date(item.source.analysis.checkedAt).toLocaleString()}.</p><ul>{item.source.analysis.findings.map((finding,i)=><li key={i}>{finding.level==='error'?'Corrigir':'Revisar'}: {finding.message}</li>)}</ul><small>Esta nota mede os critérios técnicos descritos. Não é certificação de segurança ou originalidade.</small></section>}
 {item.source.analysis?.exactMatches?.length>0&&<section><h4>Correspondências de código para revisão</h4><p>O texto normalizado coincide com versões de outros criadores. Isso não prova cópia indevida; confira autoria e licença.</p><ul>{item.source.analysis.exactMatches.map(match=><li key={match.id}><button onClick={()=>run(()=>inspect(match))}>{match.name} · v{match.version}</button></li>)}</ul></section>}
 <CreatorPreview draft={item.source}/><details><summary>Revisar código</summary><pre style={{whiteSpace:'pre-wrap'}}>{item.source.source}</pre></details>
 <button className="button" onClick={()=>run(async()=>{await copyText(item.source.source);record('copy');setMessage('Código copiado.');})}>Copiar código</button>
 <button className="button" onClick={()=>run(async()=>{await copyText(creatorIntegrationPrompt(item.source));record('copy');setMessage('Prompt de integração copiado.');})}>Copiar prompt de integração</button>
 <button className="button" onClick={()=>{downloadBlob(new Blob([creatorDraftZip(item.source,item.source.nitidoVersion)],{type:'application/zip'}),'componente.zip');record('download');}}>Baixar arquivos da versão</button>
 <label>Motivo ou observação<textarea maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
 {item.status==='approved'&&<button disabled={reason.trim().length<5} onClick={()=>run(()=>change('report',{id:item.id,reason}))}>Denunciar</button>}
 {list?.moderator&&item.status==='pending'&&<div><label><input type="checkbox" checked={tested} onChange={e=>setTested(e.target.checked)}/> Testei a renderização e as interações desta versão.</label>
 <label><input type="checkbox" checked={licensed} onChange={e=>setLicensed(e.target.checked)}/> Conferi autoria e licença.</label>
 <button disabled={!tested||!licensed||!item.source.analysis?.passed} onClick={()=>run(()=>change('review',{id:item.id,decision:'approved',tested,licensed,reason}))}>Aprovar e publicar</button>
 <button disabled={reason.trim().length<5} onClick={()=>run(()=>change('review',{id:item.id,decision:'rejected',reason}))}>Rejeitar com motivo</button></div>}
 {list?.rows.some(row=>row.id===item.id)&&<button onClick={()=>run(()=>change('withdraw',{id:item.id,reason}))}>Retirar versão</button>}
 </article>}</fieldset>{message&&<p role="status">{message}</p>}</section>;
}
