// Public technical evidence only. Google's actual index state is private to
// Search Console and must never be inferred from an HTTP 200 or a sitemap.
export function googleNoindex(site) {
 const directives=site.robotsDirectives||[{name:'robots',content:site.robots||''}];
 const sources=directives.filter(row=>['robots','googlebot'].includes(row.name?.toLowerCase())&&/(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(row.content)).map(row=>'meta '+row.name+': '+row.content);
 let agent='*';
 for(const raw of String(site.reference?.xRobots||'').split(',')){
  const part=raw.trim(),scope=part.match(/^([\w-]+):\s*(.*)$/);
  if(scope){agent=scope[1].toLowerCase();if(['*','googlebot'].includes(agent)&&/^(?:noindex|none)(?:$|\s)/i.test(scope[2]))sources.push('X-Robots-Tag: '+part);}
  else if(['*','googlebot'].includes(agent)&&/^(?:noindex|none)(?:$|\s)/i.test(part))sources.push('X-Robots-Tag: '+part);
 }
 return sources;
}

export function googleRobotsAccess(content,value){
 const groups=[];let agents=[],rules=[];
 const flush=()=>{if(agents.length)groups.push({agents,rules});agents=[];rules=[];};
 for(const line of String(content).split(/\r?\n/).slice(0,10000)){
  const match=line.replace(/#.*/,'').trim().match(/^([^:]+):\s*(.*)$/);if(!match)continue;
  const key=match[1].trim().toLowerCase(),value=match[2].trim();
  if(key==='user-agent'){if(rules.length)flush();agents.push(value.toLowerCase());}
  else if(['allow','disallow'].includes(key)&&agents.length)rules.push({key,value});
 }flush();
 const specific=groups.filter(g=>g.agents.includes('googlebot'));
 const chosen=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
 const url=new URL(value),target=url.pathname+url.search,matches=[];
 for(const rule of chosen.flatMap(g=>g.rules)){
  if(!rule.value||rule.value.length>2048)continue;
  const anchored=rule.value.endsWith('$'),body=anchored?rule.value.slice(0,-1):rule.value;
  const parts=body.split('*');if(!target.startsWith(parts[0]))continue;
  let cursor=parts[0].length,matched=true;
  for(let i=1;i<parts.length;i++){
   const part=parts[i];
   const at=anchored&&i===parts.length-1&&part?target.length-part.length:target.indexOf(part,cursor);
   if(at<cursor||!target.startsWith(part,at)){matched=false;break;}cursor=at+part.length;
  }
  if(matched&&(!anchored||body.endsWith('*')||cursor===target.length))matches.push({...rule,length:body.replaceAll('*','').length});
 }
 matches.sort((a,b)=>b.length-a.length||(a.key==='allow'?-1:1));
 const winner=matches[0];
 return {allowed:!winner||winner.key==='allow',agent:specific.length?'Googlebot':'*',rule:winner?winner.key+': '+winner.value:null,path:target};
}

export function indexabilityFindings(site,lab){
 const make=(id,weight,severity,title,detail,steps,evidence=[])=>({id,category:'seo',weight,severity,title,detail,steps,evidence,status:severity==='ok'?'pass':severity==='info'?'info':'fail'});
 const sources=googleNoindex(site),crawlable=lab?.reference?.seo?.crawlable;
 const findings=[make('indexavel',30,sources.length||crawlable===false?'alta':'ok',sources.length?'Diretiva noindex impede a indexação':crawlable===false?'O Lighthouse detectou bloqueio de indexação':'Nenhum noindex encontrado na leitura',sources.length?'A diretiva foi encontrada no HTML ou no cabeçalho recebido. Pode ser intencional em páginas privadas.':crawlable===false?'Confirme o diagnóstico de rastreabilidade do Lighthouse antes de alterar.':'A ausência de noindex não confirma que esta página esteja no índice do Google.',[
  'Confirme quais páginas devem ser públicas e indexáveis. Preserve login, áreas privadas e ambientes de teste.',
  'Somente nas URLs que devem aparecer na busca, remova noindex/none de meta robots, meta googlebot e X-Robots-Tag; confira servidor, CDN e plugins.',
  'Confira o HTML e os cabeçalhos publicados. Depois use Inspeção de URL no Search Console e teste a URL ativa. Não prometa indexação.'
 ],sources)];
 const access=site.reference?.robotsTxt?.googlebot;
 const legacyBlocked=!access&&site.reference?.robotsTxt?.blocksAll===true;
 const known=access||legacyBlocked;
 findings.push(make('robots',known?30:0,access?.allowed===false||legacyBlocked?'alta':access?'ok':'info',access?.allowed===false||legacyBlocked?'robots.txt bloqueia o rastreamento desta URL':access?'Rastreamento permitido pelas regras lidas':'robots.txt não confirmado',access?.allowed===false?'Uma regra aplicável ao Googlebot bloqueia o caminho analisado. Bloquear rastreamento não garante remover uma URL do índice.':legacyBlocked?'Há um bloqueio geral. Confirme a regra específica desta URL.':access?'Foi avaliado o caminho desta página, incluindo regras Googlebot, Allow e Disallow. Isso não confirma indexação.':'A leitura não confirmou regras de rastreamento; nenhuma penalidade foi aplicada.',[
  'Leia o robots.txt publicado e identifique o grupo Googlebot ou, na ausência dele, o grupo geral.',
  'Ajuste somente os caminhos públicos que precisam ser rastreados. Preserve restrições intencionais e não use robots.txt como controle de acesso.',
  'Permita o rastreamento quando o Google precisar ler uma diretiva noindex. Valide a URL ativa no Search Console.'
 ],access?[access.agent,access.path,access.rule||'Nenhuma regra bloqueadora correspondente']:[]));
 const redirects=site.redirects||[];
 findings.push(make('redirecionamentos',redirects.length>=3?8:0,redirects.length>=3?'media':redirects.length?'info':'ok',redirects.length>=3?'Cadeia longa de redirecionamentos':redirects.length?'URL com redirecionamento':'Sem redirecionamento na leitura',redirects.length?`${redirects.length} salto(s) observados. Um redirecionamento correto é normal; não é uma falha de indexação por si só.`:'A URL respondeu sem saltos nesta inspeção.',[
  'Confira se cada redirecionamento é intencional, sem ciclos e sem apontar todas as páginas para a home.',
  'Quando possível, redirecione diretamente ao destino canônico equivalente e atualize links internos e sitemap.',
  'Confira o status do destino. Redirecionamentos, URLs removidas e páginas alternativas podem ficar fora do índice por decisão correta.'
 ],redirects.slice(0,5).map(row=>row.status+' '+row.from+' → '+row.to)));
 findings.push(make('google-index-status',0,'info','Situação real no Google não verificada','“Rastreada, mas não indexada” e “Detectada, mas não indexada” exigem dados da propriedade no Search Console. O Raio-X não tem acesso a essa conta.',[
  'Na propriedade correta do Search Console, inspecione a URL completa e confira o resultado indexado e o teste ativo separadamente.',
  'Para “Rastreada, mas não indexada”, confira qualidade e originalidade do conteúdo, duplicações, canonical selecionado pelo Google e links internos. Não remova noindex de páginas privadas.',
  'Para “Detectada, mas não indexada”, confira disponibilidade do servidor, descoberta por links e sitemap e eventuais bloqueios; evite criar URLs duplicadas em massa.',
  'Para erro de redirecionamento ou 404, confirme cada URL afetada. Corrija destinos incorretos; mantenha 404/410 quando a remoção for intencional.',
  'Publique apenas correções comprovadas e depois valide no Search Console. Não invente contagens de páginas, status de validação ou garantia de indexação.'
 ]));
 return findings;
}
