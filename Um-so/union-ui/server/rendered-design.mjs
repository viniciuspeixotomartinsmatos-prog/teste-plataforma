import {fetchPublicSite,publicSiteURL,auditError} from './site-audit-network.mjs';
import {sampleRenderedDesign} from './rendered-design-sample.mjs';
import {redactAuditData} from './site-audit-inspect.mjs';

export const renderLimits=Object.freeze({requests:64,bytes:24000000,perResource:2500000,timeoutMs:30000,nodes:1800});
export function designBrowserEnvironment(source=process.env){
 return Object.fromEntries(['PATH','SystemRoot','SYSTEMROOT','TEMP','TMP','HOME','LANG','LD_LIBRARY_PATH','FONTCONFIG_PATH'].filter(key=>source[key]).map(key=>[key,source[key]]));
}
const tracking=/^(?:[^.]+\.)*(?:google-analytics\.com|googletagmanager\.com|facebook\.com|facebook\.net|doubleclick\.net|clarity\.ms|tiktok\.com)$/i;
export function allowedRenderRequest(request,mainURL){
 if(request.method()!=='GET')return false;
 const url=publicSiteURL(request.url());
 if(tracking.test(url.hostname))return false;
 if(['media','websocket','eventsource'].includes(request.resourceType()))return false;
 if(request.isNavigationRequest()&&request.frame()?.parentFrame())return false;
 // No navigation beyond the requested public page (including popups).
 if(request.isNavigationRequest()&&url.href!==mainURL.href)return false;
 return url;
}
export async function launchDesignBrowser(){
 try{
 const {chromium}=await import('playwright-core');
 let args=[],executablePath=process.env.NITIDO_CHROMIUM_EXECUTABLE;
 if(process.platform==='linux'){
  const {default:runtime}=await import('@sparticuz/chromium');runtime.setGraphicsMode=false;
  executablePath=await runtime.executablePath();args=runtime.args;
 }
 if(!executablePath)throw auditError('render_unavailable','A captura renderizada não está configurada neste ambiente.',503);
 // Do not pass the server's Supabase, mail, Google or billing credentials to
 // the browser subprocess. Every website gets a fresh ephemeral context.
 const env=designBrowserEnvironment();
 return await chromium.launch({executablePath,headless:true,env,timeout:15000,args:[...args,'--disable-background-networking','--disable-extensions','--disable-component-update','--disable-sync','--no-first-run','--force-webrtc-ip-handling-policy=disable_non_proxied_udp','--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=<-loopback>']});}
 catch(error){
  if(error.status)throw error;
  const message=String(error.message),reason=/shared libraries|\.so:/.test(message)?'native_library':/ENOENT|does not exist/.test(message)?'missing_binary':/Cannot find package|MODULE_NOT_FOUND/.test(message)?'runtime_dependency':'browser_start';
  console.error(JSON.stringify({event:'render_browser_start_failed',reason}));
  throw auditError('render_'+reason,'A captura renderizada está indisponível neste ambiente. Sua análise anterior foi preservada.',503);
 }
}
export async function renderDesign(value,{signal,fetcher=fetchPublicSite,launch=launchDesignBrowser,limits=renderLimits}={}){
 const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,limits.timeoutMs);if(signal?.aborted)abort();
 let browser,context,requests=0,bytes=0,reservedBytes=0,blocked=0;const failures=[],errors=[];
 const stop=()=>{void context?.close().catch(()=>{});};controller.signal.addEventListener('abort',stop,{once:true});
 try{
  const initial=await fetcher(publicSiteURL(value).href,{signal:controller.signal,maxBytes:limits.perResource,timeoutMs:8000});
  if(!/text\/html|application\/xhtml\+xml/i.test(initial.headers['content-type']||''))throw auditError('not_html','O endereço não retornou HTML.');
  const main=publicSiteURL(initial.url);browser=await launch();
  if(controller.signal.aborted)throw new DOMException('Captura cancelada.','AbortError');
  context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,serviceWorkers:'block',acceptDownloads:false,permissions:[],ignoreHTTPSErrors:false,javaScriptEnabled:true});
  // Browser networking is offline and has a dead proxy. Only this bounded,
  // DNS-pinned GET relay can fulfill resources. No app cookies/headers relay.
  await context.setOffline(true);
  await context.routeWebSocket('**/*',socket=>socket.close());
  await context.route('**/*',async route=>{
   let reservation=0;
   try{
    const target=allowedRenderRequest(route.request(),main);if(!target||controller.signal.aborted||requests>=limits.requests){blocked++;return await route.abort();}
    reservation=Math.min(limits.perResource,limits.bytes-bytes-reservedBytes);
    if(reservation<=0){blocked++;return await route.abort();}
    reservedBytes+=reservation;
    requests++;
    const response=target.href===main.href?initial:await fetcher(target.href,{signal:controller.signal,maxBytes:reservation,timeoutMs:6000});
    if(response.body.length>reservation)throw Error('Limite de recursos da captura atingido.');
    bytes+=response.body.length;
    const headers=Object.fromEntries(Object.entries(response.headers).filter(([key])=>['content-type','content-security-policy','x-content-type-options','access-control-allow-origin','access-control-allow-methods','cross-origin-resource-policy'].includes(key)).map(([key,value])=>[key,String(value)]));
    await route.fulfill({status:response.status,headers,body:response.body});
   }catch(error){failures.push(String(error.code||error.message).slice(0,100));await route.abort().catch(()=>{});}
   finally{reservedBytes-=reservation;}
  });
  const page=await context.newPage();page.on('pageerror',error=>{if(errors.length<8)errors.push(String(error.message).slice(0,200));});
  await page.goto(main.href,{waitUntil:'domcontentloaded',timeout:18000});
  await page.waitForLoadState('networkidle',{timeout:4000}).catch(()=>{});
  await page.evaluate(()=>Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,1500))]));
  const computed=await page.evaluate(sampleRenderedDesign);
  if(!computed.sampledElements)throw auditError('render_empty','A página não apresentou conteúdo para medir.',502);
  return redactAuditData({url:main.href,at:new Date().toISOString(),computed,coverage:{...limits,requests,bytes,blocked,resourceFailures:failures.length,errors,credentials:false,pages:1,originalScriptsExecuted:true,partial:failures.length>0||errors.length>0||blocked>0,scope:computed.scope}});
 }catch(error){if(controller.signal.aborted)throw auditError('render_timeout','A captura renderizada foi cancelada ou atingiu o prazo. A análise anterior permanece disponível.',504);throw error;}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);controller.signal.removeEventListener('abort',stop);await context?.close().catch(()=>{});await browser?.close().catch(()=>{});}
}
