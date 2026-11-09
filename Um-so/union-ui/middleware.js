import {next} from '@vercel/functions';
import {requestClient} from './server/supabase-client.mjs';
import {protectedPath,signInResponse} from './server/access-policy.mjs';
import {paddleConfig,readPaddleSubscription} from './server/paddle-access.mjs';

export default async function middleware(request){
 const url=new URL(request.url);
 if(!protectedPath(url.pathname))return next();
 let finish=response=>response;
 try{
  const context=requestClient(request);finish=context.finish;
  // Validate against Supabase Auth. Cookie presence alone never grants access.
  const {data,error}=await context.client.auth.getUser();
  if(!error&&data?.user){
   const billing=paddleConfig();
   if(!billing.requiresSubscription||(billing.enabled&&(await readPaddleSubscription(context.client,data.user.id,billing.environment))?.hasAccess))return finish(next());
   const html=request.headers.get('accept')?.includes('text/html')&&!/^\/(data|code|previews|tools-runtime|api|assets)\//.test(url.pathname);
   return finish(html?new Response(null,{status:303,headers:{Location:'/plans','Cache-Control':'private, no-store'}}):Response.json({error:'Escolha um plano para continuar.',code:'subscription_required'},{status:402,headers:{'Cache-Control':'private, no-store'}}));
  }
 }catch{}
 return finish(signInResponse(request));
}
