import {parse} from 'parse5';
import {fetchPublicSite,auditError} from './site-audit-network.mjs';
const text=node=>{const pending=[node],chunks=[];let count=0;while(pending.length){const item=pending.pop();if(++count>30000)throw auditError('complex_page','A página excede o limite de complexidade desta leitura.');if(item.nodeName==='#text')chunks.push(item.value);else{const children=(item.childNodes||[]).filter(n=>!['script','style','noscript'].includes(n.tagName));for(let i=children.length-1;i>=0;i--)pending.push(children[i]);}}return chunks.join(' ').replace(/\s+/g,' ').trim();};
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value||'';
const clean=value=>String(value||'').replace(/[\u0000-\u001f]/g,' ').slice(0,300);
export function secretCandidates(source,where){
 const patterns=[['Chave secreta Stripe',/\bsk_(?:live|test)_[A-Za-z\d]{20,}/g],['Chave secreta Supabase',/\bsb_secret_[A-Za-z\d_-]{20,}/g],['Token GitHub',/\bgh[pousr]_[A-Za-z\d]{30,}/g],['Chave privada',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],['Chave AWS',/\bAKIA[A-Z\d]{16}\b/g]];
 return patterns.flatMap(([label,pattern])=>[...source.matchAll(pattern)].slice(0,5).map(match=>({label,masked:match[0].slice(0,5)+'…[oculto]',where:clean(where)})));
}
export function inspectHTML(html,url){
 const tree=parse(html),nodes=[],pending=[tree];let count=0;while(pending.length){const node=pending.pop();if(++count>30000)throw auditError('complex_page','A página excede o limite de complexidade desta leitura.');if(node.tagName)nodes.push(node);const children=node.childNodes||[];for(let i=children.length-1;i>=0;i--)pending.push(children[i]);}
 const all=name=>nodes.filter(n=>n.tagName===name),meta=name=>attr(all('meta').find(n=>attr(n,'name').toLowerCase()===name||attr(n,'property').toLowerCase()===name)||{},'content');
 const absolute=value=>{if(!value||value.length>4096)return null;try{const u=new URL(value,url);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
 const scripts=all('script').map(n=>({src:absolute(attr(n,'src')),inline:attr(n,'src')?'':text(n)}));
 const rawScripts=all('script').map(n=>(n.childNodes||[]).map(c=>c.value||'').join('\n')).join('\n');
 const links=all('a').map(n=>({href:attr(n,'href'),text:text(n).slice(0,100)})),body=text(all('body')[0]||tree),full=html;
 const scriptURLs=scripts.map(n=>n.src).filter(Boolean),trackerText=scriptURLs.join(' ')+' '+rawScripts;
 const trackers=[['meta','Meta Pixel',/connect\.facebook\.net|fbq\s*\(/i],['ga','Google Analytics',/google-analytics\.com|G-[A-Z\d]{6,}|gtag\s*\(\s*['"]config/i],['gtm','Google Tag Manager',/googletagmanager\.com\/gtm|GTM-[A-Z\d]+/i],['tiktok','TikTok Pixel',/analytics\.tiktok\.com|ttq\.load/i],['clarity','Microsoft Clarity',/clarity\.ms\/tag/i]].filter(([, ,rx])=>rx.test(trackerText)).map(([id,label])=>({id,label}));
 const images=all('img').slice(0,300).map(n=>({src:absolute(attr(n,'src')),alt:clean(attr(n,'alt')),hasAlt:n.attrs?.some(a=>a.name==='alt'),loading:attr(n,'loading'),width:clean(attr(n,'width')),height:clean(attr(n,'height'))}));
 const jsonld=all('script').filter(n=>attr(n,'type')==='application/ld+json');let schemaValid=0;for(const node of jsonld)try{JSON.parse((node.childNodes||[]).map(n=>n.value||'').join(''));schemaValid++;}catch{}
 return{url,host:new URL(url).host,https:url.startsWith('https:'),title:clean(text(all('title')[0]||{})),description:clean(meta('description')),viewport:clean(meta('viewport')),robots:clean(meta('robots')),lang:clean(attr(all('html')[0]||{},'lang')),canonical:absolute(attr(all('link').find(n=>attr(n,'rel').split(' ').includes('canonical'))||{},'href')),og:{title:clean(meta('og:title')),description:clean(meta('og:description')),image:absolute(meta('og:image'))},h1:all('h1').map(n=>clean(text(n))).slice(0,10),headings:all('h2').length,images,scripts:{urls:scriptURLs.slice(0,30),total:scriptURLs.length,scanned:0},trackers,thirdPartyHosts:[...new Set(scriptURLs.map(v=>new URL(v).host).filter(host=>host!==new URL(url).host))].slice(0,20),schema:{count:jsonld.length,valid:schemaValid},found:{privacy:links.some(n=>/privacidade|privacy/i.test(n.href+' '+n.text)),terms:links.some(n=>/termos|terms/i.test(n.href+' '+n.text)),cookieNotice:/cookie|consentimento|consent/i.test(body),forms:all('form').length,cnpj:/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/.test(body),contact:links.some(n=>/^mailto:|wa\.me|whatsapp/i.test(n.href))},insecure:[...new Set(nodes.flatMap(n=>['src','href'].map(a=>attr(n,a))).filter(v=>v.startsWith('http://')))].slice(0,10).map(clean),secrets:secretCandidates(full,'HTML'),bodyChars:body.length,clientRendered:body.length<150&&scriptURLs.length>0,htmlBytes:Buffer.byteLength(html),coverage:{mode:'static-html',scriptLimit:3,imageLimit:300,externalScriptExecution:false,legalCertification:false}};
}
export async function inspectSite(value,{signal,fetcher=fetchPublicSite}={}){
 const started=Date.now(),response=await fetcher(value,{signal,maxBytes:2000000});
 if(!/text\/html|application\/xhtml\+xml/i.test(response.headers['content-type']||''))throw auditError('not_html','O endereço não retornou uma página HTML.');
 const site=inspectHTML(response.body.toString('utf8'),response.url);site.responseMs=Date.now()-started;site.redirects=response.redirects;
 const base=new URL(response.url),tasks=[['robots',new URL('/robots.txt',base).href],['sitemap',new URL('/sitemap.xml',base).href]];
 site.resources={};
 await Promise.all(tasks.map(async([kind,url])=>{try{const r=await fetcher(url,{signal,maxBytes:250000,timeoutMs:5000});const content=r.body.toString('utf8');site.resources[kind]={found:kind==='robots'?/user-agent\s*:/i.test(content):/<(?:urlset|sitemapindex)[\s>]/i.test(content),status:r.status};}catch(error){site.resources[kind]={found:null,error:error.code||'unavailable'};}}));
 const candidates=site.scripts.urls.filter(url=>new URL(url).origin===base.origin).slice(0,3);
 await Promise.all(candidates.map(async(url)=>{try{const r=await fetcher(url,{signal,maxBytes:500000,timeoutMs:5000});if(!/javascript|text\/plain/i.test(r.headers['content-type']||''))return;site.scripts.scanned++;site.secrets.push(...secretCandidates(r.body.toString('utf8'),new URL(url).pathname));}catch{}}));
 if(base.protocol==='https:'){try{const r=await fetcher(new URL(base.href.replace(/^https:/,'http:')).href,{signal,maxBytes:100000,timeoutMs:5000});site.httpToHttps=new URL(r.url).protocol==='https:';}catch{site.httpToHttps=null;}}
 site.secrets=site.secrets.slice(0,10);return redactAuditData(site);
}

export function redactAuditData(data){
 const clean=value=>String(value).replace(/\b(?:sk_(?:live|test)_|sb_secret_|gh[pousr]_)[A-Za-z\d_-]{12,}/g,'[SEGREDO OCULTO]').replace(/\bAKIA[A-Z\d]{16}\b/g,'[SEGREDO OCULTO]').replace(/https?:\/\/[^\s<>"']+/g,raw=>{try{const url=new URL(raw);for(const key of url.searchParams.keys())if(/token|secret|password|session|auth|api.?key|signature|code/i.test(key))url.searchParams.set(key,'[OCULTO]');return url.href;}catch{return raw;}});
 const visit=value=>typeof value==='string'?clean(value):Array.isArray(value)?value.map(visit):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,visit(item)])):value;
 return visit(data);
}
