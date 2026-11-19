import {communityPath,communityTarget,renderCommunity} from './community-pages.mjs';
export async function community(request,client,readBody,requireUser){
 const url=new URL(request.url);
 if((url.pathname==='/api/community'||communityPath(url.pathname))&&['GET','HEAD'].includes(request.method)){
   const {profile,version,offset,query,kind}=communityTarget(url);
   const result=version?await client.rpc('creator_public_item',{version_id:version}):await client.rpc('creator_browse',{creator:profile,page_offset:offset,query,kind});
   if(result.error)return new Response('A comunidade ainda não está disponível.',{status:503});
   if(version&&!result.data||profile&&!query&&!kind&&!result.data?.length)return new Response('Publicação indisponível.',{status:404});
   if(version&&request.method==='GET'){
     let event=client.rpc('creator_event',{version_id:version,event_kind:'open'});
     if(event.abortSignal)event=event.abortSignal(AbortSignal.timeout(2000));
     try{await event;}catch{} // Statistics must never prevent opening a publication.
   }
   const html=renderCommunity({rows:version?[]:result.data,item:version?result.data:null,profile,offset,query,kind,origin:new URL(process.env.APP_ORIGIN||request.url).origin});
   return new Response(request.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});
 }
 await requireUser();
 if(request.method!=='POST')return new Response(null,{status:405});
 const {action,input={}}=await readBody();
 if(action==='source'||action==='review'&&input.decision==='approved'){
   const original=await client.rpc('creator_command',{action:'source',input:{id:input.id}});
   if(original.error)throw Object.assign(Error('Versão indisponível.'),{status:400});
   const {analyzeCreator}=await import('./creator-analysis.mjs');
   const analysis=analyzeCreator(original.data);
   const matches=await client.rpc('creator_similarity',{version_id:input.id});
   if(matches.error)throw Object.assign(Error('Não foi possível conferir correspondências. Tente novamente.'),{status:503});
   analysis.exactMatches=matches.data;
   if(action==='source')return Response.json({...original.data,analysis},{headers:{'Cache-Control':'private, no-store'}});
   if(!analysis.passed)throw Object.assign(Error('Corrija os erros da verificação automática antes de publicar.'),{status:400});
 }
 const result=action==='metrics'?await client.rpc('creator_metrics'):action==='event'?await client.rpc('creator_event',{version_id:input.id,event_kind:input.kind}):action==='reports'?await client.rpc('creator_reports',{page_offset:Number.isInteger(input.offset)&&input.offset>=0?Math.min(input.offset,100000):0}):action==='resolve-report'?await client.rpc('creator_resolve_report',{report_id:input.id,decision:input.reason,expected_at:input.createdAt}):await client.rpc('creator_command',{action,input});
 if(result.error){
   const setup=['42883','PGRST202','42P01'].includes(result.error.code);
   throw Object.assign(Error(setup?'A comunidade aguarda configuração.':result.error.code==='P0001'?result.error.message:'Não foi possível concluir a operação.'),{status:setup?503:400});
 }
 return Response.json(result.data,{headers:{'Cache-Control':'private, no-store'}});
}
