import {inspectSite} from './site-audit-inspect.mjs';
import {measureSite} from './site-audit-lab.mjs';
import {auditError} from './site-audit-network.mjs';
export function createSiteAuditService({inspect=inspectSite,measure=measureSite,now=Date.now,maxConcurrent=3}={}){
 const users=new Map();let running=0;
 return{async run(kind,user,input,{signal}={}){
  if(!user?.id)throw auditError('sign_in_required','Entre na sua conta para analisar um site.',401);
  if(!input||typeof input.url!=='string'||Object.keys(input).some(key=>key!=='url'))throw auditError('invalid','Informe apenas o endereço público do site.');
  for(const [id,entry]of users)if(entry.until<=now())users.delete(id);
  let entry=users.get(user.id);if(!entry){if(users.size>=10000)throw auditError('busy','Tente novamente em alguns minutos.',429);users.set(user.id,entry={until:now()+3600000,site:0,lab:0});}
  const stage=kind==='site'?'site':'lab',limit=stage==='site'?12:8;
  if(entry[stage]>=limit)throw auditError('audit_quota','Limite de análises desta hora atingido. Tente mais tarde.',429);
  if(running>=maxConcurrent)throw auditError('busy','Há outras análises em andamento. Tente novamente em instantes.',429);
  entry[stage]++;running++;
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  let timer;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(auditError('timeout','A análise demorou para concluir. Tente novamente.',504));},stage==='site'?25000:75000);});
  try{return await Promise.race([(stage==='site'?inspect:measure)(input.url,{signal:controller.signal}),timeout]);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);running--;}
 }};
}
export const siteAuditService=createSiteAuditService();
