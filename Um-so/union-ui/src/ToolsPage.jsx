import React,{useEffect,useState,lazy,Suspense} from 'react';
import {Music2,Waves,Shapes,Layers3,Camera,ScanLine,ArrowUpRight,ArrowLeft,Maximize2,Loader2} from 'lucide-react';
import './tools.css';
import './tools-directory.css';
const SiteAuditPage=lazy(()=>import('./SiteAuditPage.jsx'));
const SkillLibrary=lazy(()=>import('./SkillLibrary.jsx'));
const tools=[
 {id:'skills',title:'Skills',description:'Encontre cada skill, consulte seus comandos e baixe os arquivos.',icon:Layers3},
 {id:'design-systems',title:'Design Systems',description:'Explore paletas, tipografia e sistemas visuais completos para seu projeto.',icon:Shapes},
 {id:'raio-x',title:'Raio-X do site',description:'Analise velocidade, celular, SEO, integrações e privacidade. Copie prompts para corrigir cada ponto.',icon:ScanLine},
 {id:'sound-lab',title:'Laboratório de áudio',description:'Crie sons, ajuste o timbre e exporte áudio ou código para o seu projeto.',icon:Music2},
 {id:'background-studio',title:'Estúdio de fundos',description:'Personalize fundos animados e exporte o resultado em código, imagem ou vídeo.',icon:Waves},
 {id:'texture-lab',title:'Laboratório de texturas',description:'Combine efeitos e camadas para transformar imagens em novas composições.',icon:Layers3},
 {id:'shape-magic',title:'Estúdio de formas',description:'Crie formas, materiais e composições com controles de luz e movimento.',icon:Shapes},
 {id:'center-stage',title:'Estúdio de apresentação',description:'Monte cenas e apresentações para imagens, produtos e interfaces.',icon:Camera},
];
export default function ToolsPage({path,search='',hash='',theme,navigate,canExport=true,onUpgrade,owner,notify}){
 const id=path.split('/')[2],tool=tools.find(t=>t.id===id);
 const [state,setState]=useState('loading'),[attempt,setAttempt]=useState(0),[message,setMessage]=useState('');
 useEffect(()=>{setState('loading');setMessage('');if(!id)return;const timer=setTimeout(()=>{setState(previous=>previous==='loading'?'error':previous);setMessage(previous=>previous||'A ferramenta demorou para responder. Tente novamente.');},45000);return()=>clearTimeout(timer);},[id,theme,attempt]);
 useEffect(()=>{const receive=event=>{const frame=document.querySelector('.tool-frame');if(event.source!==frame?.contentWindow||event.data?.tool!==id)return;if(event.data.type==='tool:catalog'&&typeof event.data.name==='string')navigate('/?q='+encodeURIComponent(event.data.name));if(event.data.type==='tool:navigate'&&tools.some(t=>t.id===event.data.id))navigate('/tools/'+event.data.id);if(event.data.type==='tool-ready')setState('ready');if(event.data.type==='tool-error'){setMessage(event.data.message);setState('error');}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[id,navigate]);
 if(id==='skills'||id==='design-systems')return <Suspense fallback={<main>Carregando biblioteca…</main>}><SkillLibrary key={id} section={id} canExport={canExport} onUpgrade={onUpgrade} notify={notify}/></Suspense>;
 if(id==='raio-x')return <Suspense fallback={<main className="loading-page"><Loader2 className="spin"/></main>}><SiteAuditPage owner={owner} navigate={navigate} notify={notify}/></Suspense>;
 if(!id)return <main id="main" className="tools-page tools-directory">
  <header className="tools-directory-heading">
   <h1>Ferramentas</h1>
   <p>Crie fundos, sons e apresentações, consulte guias de design ou analise seu site.</p>
  </header>
  <div className="tools-grid">{tools.map(({id,title,description})=>{
   const href='/tools/'+id;
   return <a className="tool-card directory-card" key={id} href={href} onClick={event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();navigate(href);
   }}>
    <div className="directory-art"><img src={'/assets/tools-gallery/'+id+'.webp'} alt="" width="768" height="432" loading="lazy" decoding="async"/></div>
    <div className="directory-copy"><div><h2>{title}</h2><p>{description}</p></div><span className="directory-open" aria-hidden="true"><ArrowUpRight size={18}/></span></div>
   </a>;
  })}</div>
 </main>;
 if(!tool)return <main id="main" className="empty"><h1>Ferramenta não encontrada</h1><button className="button" onClick={()=>navigate('/tools')}>Ver ferramentas</button></main>;
 const query=new URLSearchParams(search);query.set('tool',id);query.set('theme',theme);
 return <main id="main" className="tool-page"><div className="tool-heading"><button className="text-button" onClick={()=>navigate('/tools')}><ArrowLeft size={14}/>Ferramentas</button><div><h1>{tool.title}</h1><p>{tool.description}</p></div><button className="icon-button" aria-label="Ferramenta em tela cheia" onClick={()=>document.querySelector('.tool-surface')?.requestFullscreen?.()}><Maximize2 size={17}/></button></div>{canExport?<div className="tool-surface"><iframe key={id+theme+attempt} className="tool-frame" title={tool.title} src={'/tools-runtime/umso.html?'+query.toString()+hash} sandbox="allow-scripts allow-same-origin allow-downloads" allow="autoplay; clipboard-write; display-capture; camera"/>{state==='loading'&&<div className="tool-loading"><Loader2 className="spin"/><p>Abrindo seu estúdio…</p></div>}{state==='error'&&<div className="tool-loading"><p>Não foi possível iniciar a ferramenta.</p><button className="button" onClick={()=>setAttempt(v=>v+1)}>Tentar novamente</button><details><summary>Detalhes</summary>{message}</details></div>}</div>:<section className="tool-access"><tool.icon size={38}/><h2>Um estúdio inteiro para suas ideias.</h2><p>Entre na sua conta e escolha um plano para usar as ferramentas e exportar seus projetos.</p><button className="button button-primary" onClick={onUpgrade}>Desbloquear ferramentas <ArrowUpRight size={15}/></button></section>}</main>;
}
