import React,{useEffect,useState} from 'react';
import {copyText} from './catalog.js';
import './skill-library.css';
const directory='/data/skill-packages/';
async function readFile(path,signal){
  const response=await fetch(directory+path,{signal});
  if(!response.ok)throw Error('Não foi possível carregar o arquivo.');
  return response;
}
export default function SkillLibrary({canExport,onUpgrade,notify}){
  const [rows,setRows]=useState([]),[query,setQuery]=useState(''),[selected,setSelected]=useState(null),[guide,setGuide]=useState(''),[error,setError]=useState(''),[kind,setKind]=useState('all');
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
  const type=row=>row.kind||(row.guide==='DESIGN.md'?'design':row.group==='MCP'?'mcp':'skill');
  const normalized=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const visible=rows.filter(row=>(kind==='all'||type(row)===kind)&&normalized(row.name+' '+row.group+' '+(row.description||'')).includes(normalized(query)));
  async function copy(value){if(!canExport)return onUpgrade();try{await copyText(value);notify('Copiado.');}catch{notify('Não foi possível copiar.');}}
  return <main className="tools-page library-page skill-library" id="main"><header><p className="eyebrow">DO PRIMEIRO PROMPT AO PROJETO</p><h1>Seu próximo passo começa aqui.</h1><p>Skills completas, sistemas de design e guias para usar na sua IA.</p></header>
    <label>Buscar por nome ou coleção <input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <nav className="skill-filters" aria-label="Tipo de recurso">{[['all','Tudo'],['skill','Skills'],['design','Design systems'],['mcp','Integrações MCP']].map(([value,label])=><button className="button" key={value} aria-pressed={kind===value} onClick={()=>setKind(value)}>{label} <span>{rows.filter(row=>value==='all'||type(row)===value).length}</span></button>)}</nav>
    <p role="status">{visible.length} recursos encontrados</p>
    {error&&<p role="alert">{error}</p>}
    {selected&&<section className="creator-panel"><h2>{selected.name}</h2><button className="text-button" onClick={()=>setSelected(null)}>Fechar guia</button>
      {selected.image&&<img className="skill-detail-image" src={selected.image} alt={'Prévia do '+selected.name}/>}
      <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:'45vh',overflow:'auto'}}>{guide||'Carregando…'}</pre>
      <button className="button" disabled={!guide} onClick={()=>copy(guide)}>Copiar guia completo</button>
      <p>Os arquivos são referência para sua IA. Baixar não instala nem executa instruções no seu computador.</p></section>}
    <div className="source-grid">{visible.map(row=><article key={row.id} className="source-card skill-card">
      {row.image&&<button className="skill-cover" aria-label={'Ver '+row.name} onClick={()=>{setGuide('');setSelected(row);setError('');}}><img src={row.image} loading="lazy" alt={'Prévia do '+row.name}/></button>}
      <small>{type(row)==='design'?'Design system':type(row)==='mcp'?'Integração MCP':row.kind?'Skill · '+row.group:'Skill'}</small><h2>{row.name}</h2><p>{row.description||'Guia e arquivos para integrar ao seu fluxo de criação.'}</p>
      {row.colors&&<div className="skill-colors" aria-label="Paleta de cores">{row.colors.map(color=><span key={color} title={color} style={{background:color}}/>)}</div>}
      <small>{row.files} {row.files===1?'arquivo':'arquivos'}</small><div className="skill-actions"><button className="text-button" onClick={()=>{if(row.id!==selected?.id){setGuide('');setSelected(row);setError('');}}}>Ver guia</button>
      {canExport?<><a className="button" href={directory+row.id+'.zip'} download>Baixar ZIP</a>{row.markdown&&<a className="text-button" href={directory+row.markdown} download>DESIGN.md</a>}</>:<button className="button" onClick={onUpgrade}>Ver planos</button>}</div></article>)}</div></main>;
}
