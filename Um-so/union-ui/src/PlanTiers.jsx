import React,{useEffect,useState} from 'react';
import {ArrowUpRight,Check,Loader2} from 'lucide-react';
import {freePromptIds,planNames,planQuotas,proPromptWeeklyLimit} from './plan-access.js';
import {api} from './account.js';
import {billingPeriods,subscriptionPrices} from './billing-catalog.js';
import {openPaddleCheckout} from './paddle-checkout.js';

export default function PlanTiers({account,navigate,english}){
 const [usage,setUsage]=useState(null);
 const params=new URLSearchParams(window.location.search);
 const [period,setPeriod]=useState(()=>billingPeriods.some(item=>item.id===params.get('period'))?params.get('period'):'monthly');
 const [config,setConfig]=useState(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[pending,setPending]=useState(false);
 const enabled=account.access.planAccess;
 useEffect(()=>{
  const controller=new AbortController();
  api('/api/billing/config',{signal:controller.signal}).then(setConfig).catch(()=>{});
  return()=>controller.abort();
 },[]);
 async function subscribe(tier){
  const next='/plans?'+new URLSearchParams({tier,period,...(english?{lang:'en'}:{})});
  if(!account.user){navigate('/account?next='+encodeURIComponent(next));return;}
  setError('');setPending(false);
  if(!config?.enabled){
   setError(english?'Subscriptions are awaiting Paddle approval. Your selection has been saved.':'As assinaturas aguardam aprovação do Paddle. Sua escolha foi preservada.');
   navigate(next);return;
  }
  setBusy(tier);
  try{
   const result=await api('/api/billing/checkout',{method:'POST',body:{tier,planId:period,locale:english?'en':'pt-BR',currency:'BRL'}});
   await openPaddleCheckout({config,transactionId:result.transactionId,locale:english?'en':'pt-BR',onComplete:async()=>{
    setPending(true);
    await account.refreshAccess();
   }});
  }catch(failure){setError(failure.message);}
  finally{setBusy('');}
 }
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
  trial:'starter prompts per month',weeklyPrompts:`${proPromptWeeklyLimit} different prompts per week, up to ${planQuotas.pro.prompt} per month`,audit:'site audit runs per month',
  reuse:'Copy any tool’s prompt for an unlocked component without using another slot.',
  limited:'Audio, textures, shapes, backgrounds and site audit',export:'Integration prompts and Skills downloads',
  all:'Every tool, including Design Systems and Presentation Studio',
  unlimited:'No monthly caps on prompts, studio launches or site audit',
  left:{prompt:'New prompts left this month',prompt_weekly:'New prompts left this week',studio:'Studio launches left',audit:'Audit runs left'}
 }:{
  title:'Planos',description:'Comece com uma conta gratuita. Suba de plano quando precisar de mais ferramentas e exportações.',
  prepared:'Os planos pagos estão em preparação.',account:'Seu plano',open:'Experimentar um exemplo',
  starter:'Catálogo, favoritos, coleções e consulta às Skills',studio:'aberturas de estúdio por mês',starterStudio:'aberturas do Estúdio de fundos por mês',
  trial:'prompts de demonstração por mês',weeklyPrompts:`${proPromptWeeklyLimit} prompts diferentes por semana, até ${planQuotas.pro.prompt} por mês`,audit:'execuções do Raio-X por mês',
  reuse:'Copie o prompt de qualquer ferramenta para um componente liberado sem gastar outra vaga.',
  limited:'Áudio, texturas, formas, fundos e Raio-X',export:'Prompts de integração e downloads de Skills',
  all:'Todas as ferramentas, incluindo Design Systems e Estúdio de apresentação',
  unlimited:'Sem cotas mensais de prompts, abertura de estúdios ou Raio-X',
  left:{prompt:'Novos prompts restantes no mês',prompt_weekly:'Novos prompts restantes nesta semana',studio:'Aberturas de estúdio restantes',audit:'Execuções do Raio-X restantes'}
 };
 const details={
  free:[text.starter,planQuotas.free.prompt+' '+text.trial,planQuotas.free.studio+' '+text.starterStudio],
  pro:[text.limited,text.export,text.weeklyPrompts,text.reuse,planQuotas.pro.studio+' '+text.studio,planQuotas.pro.audit+' '+text.audit],
  max:[text.all,text.export,text.unlimited]
 };
 const demo='/component/'+freePromptIds[0];
 return <main id="main" className="billing-page">
  <h1>{text.title}</h1><p className="page-lead">{text.description}</p>
  {!config?.enabled&&<p className="billing-notice">{english?'Subscriptions are awaiting Paddle approval.':'As assinaturas aguardam aprovação do Paddle.'}</p>}
  <div className="billing-periods" role="group" aria-label={english?'Billing period':'Período de cobrança'}>{billingPeriods.map(item=><button className="button" key={item.id} aria-pressed={period===item.id} onClick={()=>{setPeriod(item.id);setError('');}}>{english?item.english:item.label}</button>)}</div>
  {enabled&&account.user&&<section className="account-panel" aria-label={text.account}>
   <h2>{text.account} · {english&&account.access.plan==='free'?'Free':planNames[account.access.plan]}</h2>
   {usage&&Object.entries(usage.quotas).map(([key,{remaining}])=>remaining===null||!text.left[key]?null:<p key={key}>{text.left[key]} · {remaining}</p>)}
  </section>}
  <div className="billing-grid">{Object.entries(details).map(([plan,features])=><section key={plan} className="account-panel">
   <h2>{english&&plan==='free'?'Free':planNames[plan]}</h2>
   {plan!=='free'&&<><p className="billing-price">{new Intl.NumberFormat(english?'en':'pt-BR',{style:'currency',currency:'BRL'}).format(subscriptionPrices[plan][period]/100)}</p><p>{english?'Total charged every ':'Total cobrado a cada '}{billingPeriods.find(item=>item.id===period).months}{english?' month(s).':' mês(es).'} {english?'Automatic renewal.':'Renovação automática.'}</p></>}
   <ul className="plan-perks">{features.map(feature=><li key={feature}><Check size={15} aria-hidden="true"/>{feature}</li>)}</ul>
   {plan==='free'?<button className="button button-primary" onClick={()=>navigate(demo)}>{text.open}<ArrowUpRight size={16}/></button>:<button className="button button-primary" disabled={Boolean(busy)||Boolean(account.access.subscription?.hasAccess)} onClick={()=>subscribe(plan)}>{busy===plan?<Loader2 size={16} className="spin"/>:<ArrowUpRight size={16}/>} {english?'Subscribe to ':'Assinar '}{planNames[plan]}</button>}
  </section>)}</div>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {pending&&<p role="status">{english?'Waiting for payment confirmation. Your plan activates after server verification.':'Aguardando confirmação do pagamento. Seu plano será ativado após a verificação do servidor.'}</p>}
  <div className="billing-policy-links"><a href="/legal/terms">{english?'Terms':'Termos'}</a><a href="/legal/privacy">{english?'Privacy':'Privacidade'}</a><a href="/legal/refunds">{english?'Refunds':'Reembolso'}</a></div>
 </main>;
}
