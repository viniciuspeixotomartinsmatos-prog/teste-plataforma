import React,{useEffect,useState} from 'react';
import {copyText} from './catalog.js';
const directory='/data/skill-packages/';
async function readFile(path,signal){
  const response=await fetch(directory+path,{signal});
  if(!response.ok)throw Error('Não foi possível carregar o arquivo.');
  return response;
}
export default function SkillLibrary({canExport,onUpgrade,notify}){
  const [rows,setRows]=useState([]),[query,setQuery]=useState(''),[selected,setSelected]=useState(null),[guide,setGuide]=useState(''),[error,setError]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    readFile('index.json',abort.signal).then(r=>r.json()).then(setRows).catch(e=>{if(!abort.signal.aborted)setError(e.message);});
    return ()=>abort.abort();
  },[]);
  useEffect(()=>{
    if(!selected)return;
    const abort=new AbortController();
    readFile(selected.id+'.txt',abort.signal).then(r=>r.text()).then(setGuide).catch(e=>{if(!abort.signal.aborted)setError(e.message);});
    return ()=>abort.abort();
  },[selected]);
  return <main className="tools-page library-page" id="main"><h1>Skills e design systems</h1>
    <label>Buscar por nome ou coleção <input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    {error&&<p role="alert">{error}</p>}
    {selected&&<section className="creator-panel"><h2>{selected.name}</h2><button className="text-button" onClick={()=>setSelected(null)}>Fechar guia</button>
      <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:'45vh',overflow:'auto'}}>{guide||'Carregando…'}</pre>
      <button className="button" disabled={!guide} onClick={async()=>{if(!canExport)return onUpgrade();try{await copyText(guide);notify('Guia copiado.');}catch{notify('Não foi possível copiar.');}}}>Copiar guia</button></section>}
    <div className="source-grid">{rows.filter(row=>(row.name+' '+row.group).toLowerCase().includes(query.toLowerCase())).map(row=><article key={row.id} className="source-card">
      <small>{row.group}</small><h2>{row.name}</h2><button className="text-button" onClick={()=>{if(row.id!==selected?.id){setGuide('');setSelected(row);setError('');}}}>Ver guia</button>{' '}
      {canExport?<a className="button" href={directory+row.id+'.zip'} download>Baixar ZIP</a>:<button className="button" onClick={onUpgrade}>Ver planos</button>}</article>)}</div></main>;
}
