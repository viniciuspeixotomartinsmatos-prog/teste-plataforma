import {protectedPath} from '../src/auth-policy.js';

export function signInResponse(request){
 const url=new URL(request.url);
 const html=request.headers.get('accept')?.includes('text/html')&&!/^\/(data|code|previews|tools-runtime|api|assets)\//.test(url.pathname);
 return html?new Response(null,{status:303,headers:{Location:'/account?next='+encodeURIComponent(url.pathname+url.search),'Cache-Control':'private, no-store'}}):Response.json({error:'Entre na sua conta para continuar.',code:'sign_in_required'},{status:401,headers:{'Cache-Control':'private, no-store'}});
}
export {protectedPath};
