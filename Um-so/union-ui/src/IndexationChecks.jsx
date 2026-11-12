import React from 'react';
import {Check,Copy,Search} from 'lucide-react';

export default function IndexationChecks({report,onCopy,copied}){
 if(!report.indexation)return null;
 const statuses={pass:'Sem bloqueio observado',fail:'Requer revisão',info:'Não confirmado / informativo'};
 return <section className="rx-indexation" aria-label="Indexação e rastreamento">
  <h3><Search size={17}/> Indexação e rastreamento</h3>
  <p>{report.indexation.scope}</p>
  <p>A nota considera bloqueios técnicos observados. Quantidades de páginas e decisões do Google não foram consultadas.</p>
  <div className="rx-indexation-table" role="table" aria-label="Verificações de indexação">
   {report.indexation.checks.map(check=>{
    const finding=report.findings.find(row=>row.id===check.id);
    return <div className={'rx-indexation-row rx-indexation-'+check.status} role="row" key={check.id}>
     <span role="cell">{check.title}</span>
     <span role="cell" className="rx-indexation-state">{statuses[check.status]||statuses.info}</span>
     <span role="cell"><button className="rx-action" aria-label={'Copiar prompt de indexação: '+check.title} onClick={()=>onCopy(finding)}>{copied===check.id?<Check size={14}/>:<Copy size={14}/>} {copied===check.id?'Copiado':'Copiar prompt'}</button></span>
    </div>;
   })}
  </div>
 </section>;
}
