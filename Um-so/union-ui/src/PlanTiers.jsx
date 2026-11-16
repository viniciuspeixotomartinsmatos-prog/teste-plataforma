import React,{useEffect,useState} from 'react';
import {ArrowUpRight,Check} from 'lucide-react';
import {freePromptIds,planNames,planQuotas} from './plan-access.js';
import {api} from './account.js';

export default function PlanTiers({account,navigate,english}){
 const [usage,setUsage]=useState(null);
 const enabled=account.access.planAccess;
 useEffect(()=>{
  setUsage(null);
  if(!enabled||!account.user)return;
  const controller=new AbortController();
  api('/api/plan-usage',{signal:controller.signal}).then(setUsage).catch(()=>{});
  return ()=>controller.abort();
 },[enabled,account.user?.id]);
 const text=english?{
  title:'Plans',description:'Start with a free account. Upgrade as you need more tools and exports.',
  prepared:'Paid plans are in preparation.',account:'Your plan',open:'Try an example',
  starter:'Catalog, favorites, collections and Skills browsing',studio:'creative studio launches per month',starterStudio:'Background Studio launches per month',
  trial:'starter prompts per month',prompts:'catalog prompts per month',audit:'site audit runs per month',
  limited:'Audio, textures, shapes, backgrounds and site audit',export:'Source code and package exports',
  all:'Every tool, including Design Systems and Presentation Studio',
  unlimited:'No monthly caps on prompts, studio launches or site audit',
  left:['Prompts left','Studio launches left','Audit runs left']
 }:{
  title:'Planos',description:'Comece com uma conta gratuita. Suba de plano quando precisar de mais ferramentas e exportações.',
  prepared:'Os planos pagos estão em preparação.',account:'Seu plano',open:'Experimentar um exemplo',
  starter:'Catálogo, favoritos, coleções e consulta às Skills',studio:'aberturas de estúdio por mês',starterStudio:'aberturas do Estúdio de fundos por mês',
  trial:'prompts de demonstração por mês',prompts:'prompts do catálogo por mês',audit:'execuções do Raio-X por mês',
  limited:'Áudio, texturas, formas, fundos e Raio-X',export:'Código e exportação de pacotes',
  all:'Todas as ferramentas, incluindo Design Systems e Estúdio de apresentação',
  unlimited:'Sem cotas mensais de prompts, abertura de estúdios ou Raio-X',
  left:['Prompts restantes','Aberturas de estúdio restantes','Execuções do Raio-X restantes']
 };
 const details={
  free:[text.starter,planQuotas.free.prompt+' '+text.trial,planQuotas.free.studio+' '+text.starterStudio],
  pro:[text.limited,text.export,planQuotas.pro.prompt+' '+text.prompts,planQuotas.pro.studio+' '+text.studio,planQuotas.pro.audit+' '+text.audit],
  max:[text.all,text.export,text.unlimited]
 };
 const demo='/component/'+freePromptIds[0];
 return <main id="main" className="billing-page">
  <h1>{text.title}</h1><p className="page-lead">{text.description}</p>
  <p className="billing-notice">{text.prepared}</p>
  {enabled&&account.user&&<section className="account-panel" aria-label={text.account}>
   <h2>{text.account} · {english&&account.access.plan==='free'?'Free':planNames[account.access.plan]}</h2>
   {usage&&Object.entries(usage.quotas).map(([key,{remaining}],index)=>remaining===null?null:<p key={key}>{text.left[index]} · {remaining}</p>)}
  </section>}
  <div className="billing-grid">{Object.entries(details).map(([plan,features])=><section key={plan} className="account-panel">
   <h2>{english&&plan==='free'?'Free':planNames[plan]}</h2>
   <ul className="plan-perks">{features.map(feature=><li key={feature}><Check size={15} aria-hidden="true"/>{feature}</li>)}</ul>
   {plan==='free'&&<button className="button button-primary" onClick={()=>navigate(account.user?demo:'/account?next='+encodeURIComponent(demo))}>{text.open}<ArrowUpRight size={16}/></button>}
  </section>)}</div>
 </main>;
}
