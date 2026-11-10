const escape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function community(request,client,readBody,requireUser){
 const url=new URL(request.url);
 if(url.pathname==='/api/community'&&request.method==='GET'){
   const profile=url.searchParams.get('profile');
   const offset=Number(url.searchParams.get('offset')||0);
   if((profile&&!/^[\da-f-]{36}$/i.test(profile))||!Number.isInteger(offset)||offset<0||offset>100000)return new Response('Página inválida',{status:400});
   const result=await client.rpc('creator_gallery',{creator:profile,page_offset:offset});
   if(result.error)return new Response('A comunidade ainda não está disponível.',{status:503});
   const rows=result.data;
   const title=profile&&rows.length?rows[0].display_name:'Comunidade Creators';
   const content=rows.map(row=>'<article><h2>'+escape(row.name)+'</h2><p>'+escape(row.description)+'</p><a href="?profile='+row.creator+'">'+escape(row.display_name)+'</a> · v'+Number(row.version)+' · Nítido Verified<p><a href="/creators?version='+row.id+'">Abrir versão ou denunciar</a></p></article>').join('');
   const page=n=>'?'+new URLSearchParams({...profile?{profile}:{},offset:String(n)});
   const html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+' · nitido</title><link rel="stylesheet" href="/assets/marketing.css"></head><body class="marketing"><main class="policy"><nav><a href="/api/community">Comunidade</a> · <a href="/creators">Meus envios</a></nav><h1>'+escape(title)+'</h1>'+(profile&&rows.length?'<p>'+escape(rows[0].bio)+'</p>':'')+(content||'<p>Nenhuma versão publicada.</p>')+(offset?'<a href="'+escape(page(Math.max(offset-30,0)))+'">Anterior</a> ':'')+(rows.length===30?'<a href="'+escape(page(offset+30))+'">Próxima</a>':'')+'</main></body></html>';
   return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});
 }
 await requireUser();
 if(request.method!=='POST')return new Response(null,{status:405});
 const {action,input={}}=await readBody();
 const result=action==='metrics'?await client.rpc('creator_metrics'):await client.rpc('creator_command',{action,input});
 if(result.error){
   const setup=['42883','PGRST202','42P01'].includes(result.error.code);
   throw Object.assign(Error(setup?'A comunidade aguarda configuração.':result.error.code==='P0001'?result.error.message:'Não foi possível concluir a operação.'),{status:setup?503:400});
 }
 return Response.json(result.data,{headers:{'Cache-Control':'private, no-store'}});
}
