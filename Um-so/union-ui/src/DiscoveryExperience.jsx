import React from 'react';
import {X,ArrowRight,Clock} from 'lucide-react';
import {discoveryGoals} from './resource-experience.js';
import {categoryLabels,kindLabels} from './catalog.js';
export default function DiscoveryExperience({filter,onFilter,onGoal,onClear,recent=[],collections=[],onOpen,navigate,total}){
 const chips=[filter.q&&['q','Busca: '+filter.q],filter.kind!=='all'&&['kind',kindLabels[filter.kind]||filter.kind],filter.category!=='all'&&['category',categoryLabels[filter.category]||filter.category],filter.framework&&filter.framework!=='all'&&['framework','Formato: '+filter.framework],filter.codeOnly&&['code','Com código-fonte']].filter(Boolean);
 return <div className="discovery-experience">
  <section aria-label="Buscar por objetivo" className="discovery-goals"><span>O que você quer criar?</span><div>{discoveryGoals.map(goal=><button key={goal.id} onClick={()=>onGoal(goal)}>{goal.label}<ArrowRight size={13}/></button>)}</div></section>
  <label className="discovery-format">Formato do meu projeto <select aria-label="Formato do projeto" value={filter.framework||'all'} onChange={event=>onFilter('framework',event.target.value)}><option value="all">Todos os formatos</option><option value="react">React</option><option value="vue">Vue</option><option value="html">HTML / JavaScript</option><option value="svelte">Svelte</option></select></label>
  {chips.length>0&&<div className="discovery-filters" aria-label="Filtros ativos">{chips.map(([key,label])=><button key={key} onClick={()=>onFilter(key,key==='q'||key==='code'?'':'all')} aria-label={'Remover filtro: '+label}>{label}<X size={13}/></button>)}<button onClick={onClear}>Limpar filtros</button><span role="status">{total} resultados</span></div>}
  {(recent.length>0||collections.length>0)&&<section className="discovery-resume" aria-label="Continuar seu trabalho">
   <h2><Clock size={16}/> Continue de onde parou</h2>
   {recent.length>0&&<div><span>Vistos recentemente</span>{recent.slice(0,4).map(item=><button key={item.id} onClick={()=>onOpen(item.id)}>{item.name}<ArrowRight size={13}/></button>)}</div>}
   {collections.length>0&&<div><span>Suas coleções</span>{collections.slice(0,3).map(c=><button key={c.id} onClick={()=>navigate('/collections/'+encodeURIComponent(c.id))}>{c.name} · {c.items.length} itens<ArrowRight size={13}/></button>)}</div>}
  </section>}
 </div>;
}
