import React from 'react';
import {priorityCorrections} from './resource-experience.js';
import {buildAuditReport} from './site-audit-report.js';
export default function AuditNextSteps({report,result,records=[],onCopy,copied}){
 const priorities=priorityCorrections(report);
 const previous=!result.example&&records.find(row=>row.site.url===result.site.url&&row.at<result.at&&row.lab);
 const old=previous?buildAuditReport(previous.site,previous.lab):null;
 return <section className="rx-priorities" aria-label="Próximas correções">
  <h3>{priorities.length?'Comece por estas correções':'Nenhuma correção confirmada para priorizar'}</h3>
  <p>Ordem pela gravidade e pelo peso no diagnóstico. Esforço indicativo, sem estimativa de horas ou garantia de resultado.</p>
  <ol>{priorities.map(f=><li key={f.id}><strong>{f.title}</strong><p>{f.impact}</p><small>{f.effort}</small><div><button className="rx-action" onClick={()=>onCopy(f)}>{copied===f.id?'Copiado':'Copiar prompt desta correção'}</button></div></li>)}</ol>
  <div><h4>Compare depois de corrigir</h4><p>Publique o ajuste e use “Analisar de novo” para obter uma nova leitura da mesma URL. O histórico preserva as análises desta conta neste navegador.</p>
  {old?.score!=null&&report.score!=null?<p>Nota anterior: {old.score}. Nota atual: {report.score}. Variação: {report.score-old.score>0?'+':''}{report.score-old.score} pontos. Anterior em {new Date(previous.at).toLocaleString('pt-BR')}. As duas notas usam os critérios atuais; mudanças nas medições não comprovam efeito causal da correção.</p>:<p>A comparação aparece quando houver duas análises completas da mesma URL no histórico.</p>}</div>
 </section>;
}
