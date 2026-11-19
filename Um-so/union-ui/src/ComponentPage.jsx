import React,{useEffect,useState} from 'react';
import {ArrowLeft,Bookmark,Check,ChevronRight,Copy,FolderPlus,GitCompareArrows,Loader2,Maximize2,Monitor,Moon,RotateCcw,SlidersHorizontal,Smartphone,Sun,Tablet} from 'lucide-react';
import {Preview} from './Preview.jsx';
import {displayName,publicText} from './UI.jsx';
import {categoryLabels,catalogVariants,copyText,kindLabels} from './catalog.js';
import {planPermission} from './plan-access.js';
import {promptTools} from './prompt-tools.js';
import {api} from './account.js';
import {resourceDelivery} from './resource-experience.js';
import VisualControls from './VisualControls.jsx';
import {cleanSettings} from './project-model.js';
import './playground.css';
import './builder.css';

const particlesDefaults={quantity:180,ease:60,size:0.8,color:'#b79af5',vx:0,vy:0};

export default function ComponentPage({item,rows,saved,onSave,onBack,onOpen,notify,collections,setCollections,onNewCollection,compared,onCompare,theme,canExport=true,accessPlan=null,onUpgrade,onRequireAccount,onBuild}){
 const [width,setWidth]=useState('desktop'),[previewTheme,setPreviewTheme]=useState(theme);
 const [tool,setTool]=useState(promptTools[0].id),[prompting,setPrompting]=useState(false),[copied,setCopied]=useState(false);
 const [settings,setSettings]=useState(false),[config,setConfig]=useState(particlesDefaults);
 const [visual,setVisual]=useState(()=>cleanSettings()),[inspection,setInspection]=useState(null);
 const isParticles=item.id==='magic--particles';
 const canPrompt=accessPlan?planPermission(accessPlan,'prompt',item.id).allowed:canExport;
 const name=displayName(item.name),description=publicText(item.description),info=resourceDelivery(item);
 const variants=catalogVariants(item,rows);
 const related=rows.filter(row=>row.id!==item.id&&row.category===item.category&&row.image).slice(0,4);

 useEffect(()=>{
  setWidth('desktop');setCopied(false);setConfig(particlesDefaults);setSettings(false);setInspection(null);
  let preset=null;
  try{preset=JSON.parse(localStorage.getItem('umso:preset:'+item.id)||'null');}catch{}
  setVisual(cleanSettings(preset??undefined));
 },[item.id]);
 useEffect(()=>{
  if(!copied)return;
  const timeout=setTimeout(()=>setCopied(false),1800);
  return ()=>clearTimeout(timeout);
 },[copied]);

 async function copyPrompt(){
  if(onRequireAccount){onRequireAccount();return;}
  if(!canPrompt){onUpgrade?.();return;}
  setPrompting(true);
  setCopied(false);
  try{
   const {prompt}=await api('/api/catalog-prompt',{method:'POST',body:{resource:item.id,tool,operation:crypto.randomUUID()}});
   if(typeof prompt!=='string'||!prompt.trim())throw Error('Prompt indisponível. Tente novamente.');
   await copyText(prompt);
   setCopied(true);
   notify('Prompt copiado.');
  }catch(error){notify(error.message||'Não foi possível copiar o prompt.');}
  finally{setPrompting(false);}
 }

 function saveStyle(){
  try{localStorage.setItem('umso:preset:'+item.id,JSON.stringify(visual));notify('Estilo salvo neste navegador.');}
  catch{notify('Não foi possível salvar o estilo neste navegador.');}
 }

 function addToCollection(id){
  if(id==='new'){onNewCollection();return;}
  if(!id)return;
  setCollections(items=>items.map(collection=>collection.id===id?{...collection,items:[...new Set([...collection.items,item.id])]}:collection));
  notify('Adicionado à coleção.');
 }

 return <>
  <nav className="breadcrumbs" aria-label="Trilha de navegação"><button onClick={onBack}><ArrowLeft size={13}/> Explorar</button><ChevronRight size={12}/><span>{categoryLabels[item.category]||'Componentes'}</span><ChevronRight size={12}/><span>{name}</span></nav>
  <div className="detail-heading">
   <div><div className="detail-source">{kindLabels[item.kind]||'Componente'}</div><h1>{name}</h1><div className="detail-pills"><span>{categoryLabels[item.category]||'Interface'}</span><span>{info.framework}</span><span>{info.preview}</span></div></div>
   <div className="detail-actions">
    <button className={'button '+(saved?'button-saved':'')} onClick={onSave}><Bookmark size={15} fill={saved?'currentColor':'none'}/>{saved?'Salvo':'Salvar'}</button>
    <label className="prompt-tool-select"><span className="sr-only">Ferramenta de IA</span><select value={tool} disabled={prompting} onChange={event=>{setTool(event.target.value);setCopied(false);}}>{promptTools.map(target=><option value={target.id} key={target.id}>{target.label}</option>)}</select></label>
    <button type="button" className="button button-primary" onClick={copyPrompt} disabled={prompting}>{prompting?<Loader2 size={15} className="spin"/>:copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copiado':'Copiar prompt'}</button>
   </div>
  </div>
  {variants.length>1&&<section className="component-variants" aria-label="Versões do componente"><span>Explore as versões</span>{variants.map((variant,index)=><button key={variant.id} aria-pressed={variant.id===item.id} onClick={()=>onOpen(variant.id)}>Versão {index+1} · {variant.framework||'React'}</button>)}</section>}
  <div className="detail-workspace">
   <div className="detail-workspace-toolbar"><strong>Prévia</strong><div className="detail-view-options">
    <div className="view-controls">{[['desktop',Monitor,'Prévia desktop'],['tablet',Tablet,'Prévia tablet'],['mobile',Smartphone,'Prévia celular']].map(([value,Icon,label])=><button key={value} aria-label={label} aria-pressed={width===value} className={width===value?'active':''} onClick={()=>setWidth(value)}><Icon size={15}/></button>)}</div>
    <button className="icon-button" aria-label="Alterar tema da prévia" onClick={()=>setPreviewTheme(value=>value==='dark'?'light':'dark')}>{previewTheme==='dark'?<Sun size={15}/>:<Moon size={15}/>}</button>
    <button className={'icon-button '+(settings?'selected':'')} aria-label={isParticles?'Personalizar partículas':'Personalizar componente'} aria-pressed={settings} onClick={()=>setSettings(value=>!value)}><SlidersHorizontal size={15}/></button>
    <button className="icon-button" aria-label="Prévia em tela cheia" onClick={()=>document.querySelector('.preview-stage')?.requestFullscreen?.()}><Maximize2 size={15}/></button>
   </div></div>
   <div className={'playground-layout '+(settings?'with-inspector':'')}>
    <Preview item={item} theme={previewTheme} width={width} config={isParticles?config:undefined} settings={visual} onInspect={setInspection}/>
    {settings&&<aside className="playground-inspector">
     <VisualControls value={visual} onChange={setVisual} inspection={inspection}/>
     <button className="button" onClick={saveStyle}>Salvar estilo</button>
     {isParticles&&<section className="particle-controls">
      <div><h3>Partículas</h3><button className="icon-button" aria-label="Restaurar partículas" onClick={()=>setConfig(particlesDefaults)}><RotateCcw size={13}/></button></div>
      {[['quantity','Quantidade',20,600,10],['size','Tamanho',.2,3,.1],['ease','Suavidade',10,120,5],['vx','Velocidade horizontal',-1,1,.05],['vy','Velocidade vertical',-1,1,.05]].map(([key,label,min,max,step])=><label key={key}><span>{label}<output>{config[key]}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={config[key]} onChange={event=>setConfig(current=>({...current,[key]:Number(event.target.value)}))}/></label>)}
      <label className="particle-color"><span>Cor</span><input type="color" aria-label="Cor das partículas" value={config.color} onChange={event=>setConfig(current=>({...current,color:event.target.value}))}/><code>{config.color}</code></label>
     </section>}
    </aside>}
   </div>
  </div>
  <div className="detail-info-layout">
   <section className="detail-about"><h2>Sobre o componente</h2>{description&&<p>{description}</p>}<p>Escolha a ferramenta e cole o prompt no seu projeto para gerar uma implementação.</p></section>
   <aside className="detail-metadata"><h3>Organizar componente</h3>
    <label className="collection-select"><FolderPlus size={15}/><select aria-label="Adicionar à coleção" value="" onChange={event=>addToCollection(event.target.value)}><option value="">Adicionar à coleção</option><option value="new">+ Criar nova coleção</option>{collections.map(collection=><option key={collection.id} value={collection.id}>{collection.name}{collection.items.includes(item.id)?' ✓':''}</option>)}</select></label>
    <button className="button full-width" onClick={onCompare}><GitCompareArrows size={15}/>{compared?'Selecionado para comparar':'Adicionar à comparação'}</button>
    {onBuild&&<button className="button full-width" onClick={()=>onBuild(item.id,visual,isParticles?config:undefined)}>Usar no montador</button>}
   </aside>
  </div>
  {related.length>0&&<section className="related-section"><div><h2>Componentes relacionados</h2></div><div className="related-grid">{related.map(row=><a key={row.id} href={'/component/'+(row.publicSlug||row.id)} onClick={event=>{event.preventDefault();onOpen(row.id);}}><img src={row.image} alt={displayName(row.name)} loading="lazy"/><h3>{displayName(row.name)}</h3><small>{kindLabels[row.kind]||'Componente'}</small></a>)}</div></section>}
 </>;
}
