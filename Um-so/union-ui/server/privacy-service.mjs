import {securityEvent} from './security-controls.mjs';
const fail=(status,message,code)=>Object.assign(Error(message),{status,code});
export const POLICY_VERSION='2026-11-09';
export async function exportPersonalData(user,client,{requiresBillingLedger=false}={}){
 const workspace=await client.from('workspaces').select('revision,data,updated_at').eq('user_id',user.id).maybeSingle();
 if(workspace.error)throw fail(503,'Não foi possível exportar suas coleções.','privacy_export_unavailable');
 const subscriptions=await client.from('paddle_subscriptions').select('environment,status,plan_id,paid_through,cancel_at_period_end').eq('user_id',user.id);
 const ledgerAbsent=['42P01','PGRST205'].includes(subscriptions.error?.code);
 if(subscriptions.error&&(requiresBillingLedger||!ledgerAbsent))throw fail(503,'Não foi possível exportar sua assinatura.','privacy_export_unavailable');
 const shares=await client.from('collection_shares').select('collection_id,created_at').eq('user_id',user.id);
 if(shares.error&&!['42P01','PGRST205'].includes(shares.error.code))throw fail(503,'Não foi possível exportar os compartilhamentos.','privacy_export_unavailable');
 const sharedCollections=(shares.data||[]).filter(row=>typeof row.collection_id==='string').map(row=>({collectionId:row.collection_id,createdAt:row.created_at}));
 const creator=await client.from('creator_workspaces').select('revision,data,updated_at').eq('user_id',user.id).maybeSingle();
 if(creator.error&&!['42P01','PGRST205'].includes(creator.error.code))throw fail(503,'Não foi possível exportar seus rascunhos.','privacy_export_unavailable');
 const community=await client.rpc('creator_command',{action:'export',input:{}});
 if(community.error&&!['42883','PGRST202','42P01'].includes(community.error.code))throw fail(503,'Não foi possível exportar os envios à comunidade.','privacy_export_unavailable');
 return{community:community.data||null,creatorWorkspace:creator.data||null,sharedCollections,version:1,exportedAt:new Date().toISOString(),account:{id:user.id,email:user.email,name:user.user_metadata?.name||'',createdAt:user.created_at,emailConfirmedAt:user.email_confirmed_at},workspace:workspace.data||{revision:0,data:{saved:[],collections:[]}},subscriptions:subscriptions.data||[],scope:'Dados de conta, coleções, compartilhamentos, perfil de criador, rascunhos e assinaturas armazenados por esta aplicação. Projetos locais deste navegador e registros mantidos por operadores possuem canais próprios de acesso.'};
}
export async function deletePersonalAccount(user,client,input,{env=process.env,fetchImpl=fetch,logger=console.info}={}){
 if(input.confirmation!=='EXCLUIR'||typeof input.password!=='string'||!input.password||input.password.length>1024)throw fail(400,'Digite EXCLUIR e confirme sua senha atual.','deletion_confirmation_required');
 // Never partially erase an account before the operator has verified cascading
 // ownership, billing records, session revocation and backup retention remotely.
 if(env.ACCOUNT_DELETION_READY!=='true'||!env.SUPABASE_SERVICE_ROLE_KEY||!env.SUPABASE_URL?.startsWith('https://'))throw fail(503,'A exclusão automática ainda não foi habilitada. Use o canal de privacidade.','deletion_setup_required');
 // Sandbox entries and superseded ledger rows are not current live obligations.
 // Remote provider/ledger consistency still needs verification before activation.
 const subscription=await client.from('paddle_subscriptions').select('status').eq('user_id',user.id).eq('environment','live').eq('is_current',true).in('status',['active','trialing','past_due','paused']).limit(1);
 if(subscription.error)throw fail(503,'Não foi possível verificar suas assinaturas.','deletion_billing_unavailable');
 if(subscription.data?.length)throw fail(409,'Cancele a renovação e conclua as pendências da assinatura antes de excluir a conta.','active_subscription');
 const verified=await client.auth.signInWithPassword({email:user.email,password:input.password});
 if(verified.error||verified.data?.user?.id!==user.id)throw fail(401,'Senha atual incorreta.','reauthentication_required');
 const revoked=await client.auth.signOut({scope:'global'});if(revoked.error)throw fail(503,'Não foi possível revogar suas sessões.','session_revocation_failed');
 const result=await fetchImpl(env.SUPABASE_URL.replace(/\/$/,'')+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(15000)});
 if(!result.ok)throw fail(503,'Suas sessões foram encerradas, mas a exclusão não foi concluída. Contate o canal de privacidade.','deletion_failed');
 securityEvent('privacy_deleted',200,{logger});
 return{ok:true,deleted:true,backups:'Cópias de segurança e registros legalmente necessários seguem os prazos informados na política de retenção.'};
}
