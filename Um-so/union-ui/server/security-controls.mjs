const failure=(status,message,code)=>Object.assign(Error(message),{status,code});
export function securityHeaders(url){
 const headers={
  'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(self), microphone=(self), geolocation=(), payment=()',
  // Inline demonstration code executes inside opaque sandboxes. A stricter
  // policy is initially report-only so it cannot silently break recovered demos.
  'Content-Security-Policy':"object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
  'Content-Security-Policy-Report-Only':"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
 };
 if(new URL(url).protocol==='https:')headers['Strict-Transport-Security']='max-age=31536000';
 return headers;
}
export function secureResponse(response,url){for(const [key,value]of Object.entries(securityHeaders(url)))response.headers.set(key,value);return response;}

export async function readJSONObject(request,{limit=1500000}={}){
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))throw failure(415,'Envie dados JSON.','json_required');
 const declared=request.headers.get('content-length');if(declared&&(!/^\d+$/.test(declared)||Number(declared)>limit))throw failure(413,'Arquivo muito grande.','body_too_large');
 const reader=request.body?.getReader();let size=0;const parts=[];
 if(reader)try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw failure(413,'Arquivo muito grande.','body_too_large');}parts.push(value);}}finally{reader.releaseLock();}
 try{const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw failure(400,'Dados inválidos.','invalid_json');}
}

// Per-process defense, not a distributed quota. Provider/WAF limits must also be
// verified for serverless production; the deployment checklist records that gap.
export function createRequestLimiter({now=Date.now,maxBuckets=10000}={}){
 const buckets=new Map();
 return function limit(request,{env=process.env}={}){
  const route=new URL(request.url).pathname;
  if(route==='/api/health'||route==='/api/billing/webhook')return;
  const group=/sign-in/.test(route)?'login':/sign-up/.test(route)?'signup':/resend-confirmation|request-password-reset/.test(route)?'email':/privacy\/delete/.test(route)?'delete':!['GET','HEAD'].includes(request.method)?'write':'read';
  // Vercel overwrites x-vercel-forwarded-for. Local Node overwrites its own
  // client-ip header. Never use arbitrary browser-provided X-Forwarded-For.
  const address=env.VERCEL==='1'||env.VERCEL==='true'?request.headers.get('x-vercel-forwarded-for'):request.headers.get('x-umso-client-ip');
  const ip=address?.split(',')[0]?.trim();const trusted=ip&&/^[a-f\d:.]{3,64}$/i.test(ip)?ip:'unknown';
  const key=group+':'+trusted,time=now(),maximum={login:8,signup:5,email:3,delete:3,write:60,read:240}[group];
  for(const [id,bucket]of buckets)if(bucket.until<=time)buckets.delete(id);
  let bucket=buckets.get(key);if(!bucket){if(buckets.size>=maxBuckets)throw failure(429,'Aguarde um pouco e tente novamente.','rate_limited');bucket={until:time+60000,count:0};buckets.set(key,bucket);}
  if(++bucket.count>maximum){const error=failure(429,'Aguarde um pouco e tente novamente.','rate_limited');error.retryAfter=Math.max(1,Math.ceil((bucket.until-time)/1000));throw error;}
 };
}
export function securityEvent(event,status,{logger=console.info}={}){
 if(!['rate_limit','request_rejected','privacy_export','privacy_deleted','auth_failure'].includes(event))return;
 logger(JSON.stringify({type:'security',event,status:Number(status),at:new Date().toISOString()}));
}
