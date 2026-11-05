import {next} from '@vercel/functions';
import {requestClient} from './server/supabase-client.mjs';
import {protectedPath,signInResponse} from './server/access-policy.mjs';

export default async function middleware(request){
 const url=new URL(request.url);
 if(!protectedPath(url.pathname))return next();
 let finish=response=>response;
 try{
  const context=requestClient(request);finish=context.finish;
  // Validate against Supabase Auth. Cookie presence alone never grants access.
  const {data,error}=await context.client.auth.getUser();
  if(!error&&data?.user)return finish(next());
 }catch{}
 return finish(signInResponse(request));
}
