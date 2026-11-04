import {createServerClient,parseCookieHeader,serializeCookieHeader} from '@supabase/ssr';

export function supabaseConfig(env=process.env){
 return{url:env.SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL,key:env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||env.NEXT_PUBLIC_SUPABASE_ANON_KEY};
}
export function requestClient(request,{env=process.env}={}){
 const {url,key}=supabaseConfig(env);
 if(!url||!key)throw Object.assign(Error('O acesso está em configuração. Tente novamente mais tarde.'),{status:503,code:'auth_setup_required'});
 const changed=[];
 const client=createServerClient(url,key,{
  cookieOptions:{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'lax',path:'/'},
  cookies:{getAll:()=>parseCookieHeader(request.headers.get('cookie')||''),setAll:cookies=>changed.push(...cookies)},
 });
 function finish(response){
  response.headers.set('Cache-Control','private, no-store');
  for(const {name,value,options}of changed)response.headers.append('Set-Cookie',serializeCookieHeader(name,value,options));
  return response;
 }
 return{client,finish};
}
