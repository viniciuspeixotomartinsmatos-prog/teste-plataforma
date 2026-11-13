// Creates only sandbox catalog resources. Never accepts or prints private credentials.
const plans=[{id:'monthly',name:'Mensal',amount:8500,months:1,currency:'BRL'},{id:'quarterly',name:'Trimestral',amount:16500,months:3,currency:'BRL'},{id:'yearly',name:'Anual',amount:55000,months:12,currency:'BRL'}];
const apply=process.argv.includes('--apply'),env=process.env;
if(env.PADDLE_ENV&&env.PADDLE_ENV!=='sandbox')throw Error('Setup accepts sandbox only. Live provisioning requires separate review.');
if(!apply){console.log(JSON.stringify({environment:'sandbox',applied:false,product:'nitido',plans},null,2));process.exit(0);}
if(!env.PADDLE_API_KEY?.startsWith('pdl_sdbx_apikey_'))throw Error('A sandbox Paddle API key is required in the environment.');
const base='https://sandbox-api.paddle.com';
async function api(path,{method='GET',body}={}){
 const url=new URL(path,base);if(url.origin!==base)throw Error('Invalid Paddle API origin.');
 const response=await fetch(url,{method,headers:{Authorization:'Bearer '+env.PADDLE_API_KEY,'Content-Type':'application/json','Paddle-Version':'1'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Paddle sandbox request failed (HTTP '+response.status+'). Review it in your dashboard before retrying.');
 return response.json();
}
async function all(path){const items=[];let next=path;for(let page=0;next;page++){if(page>=100)throw Error('Catalog too large to reconcile safely.');const result=await api(next);items.push(...result.data);next=result.meta?.pagination?.has_more?result.meta.pagination.next:null;}return items;}
const products=await all('/products?status=active&per_page=100');
const matching=products.filter(product=>product.custom_data?.nitido_catalog==='sandbox-v1');
if(matching.length>1)throw Error('Multiple nitido sandbox products found; reconcile manually before retrying.');
const product=matching[0]||(await api('/products',{method:'POST',body:{name:'nitido',description:'Creative workspace subscription — sandbox only.',tax_category:'standard',custom_data:{nitido_catalog:'sandbox-v1'}}})).data;
const existing=await all('/prices?product_id='+encodeURIComponent(product.id)+'&status=active&per_page=100');
const configured={PADDLE_PRODUCT_ID:product.id};
for(const plan of plans){
 const candidates=existing.filter(price=>price.custom_data?.nitido_plan===plan.id);
 if(candidates.length>1)throw Error('Multiple sandbox prices found for '+plan.id+'. Reconcile manually.');
 let price=candidates[0];
 if(price&&(price.unit_price?.currency_code!==plan.currency||String(price.unit_price?.amount)!==String(plan.amount)||price.billing_cycle?.interval!=='month'||price.billing_cycle?.frequency!==plan.months||price.trial_period||price.unit_price_overrides?.length||price.quantity?.minimum!==1||price.quantity?.maximum!==1))throw Error('Existing sandbox price differs from approved plan '+plan.id+'. No price was overwritten.');
 price||=(await api('/prices',{method:'POST',body:{product_id:product.id,description:plan.name+' — sandbox',name:plan.name,unit_price:{amount:String(plan.amount),currency_code:plan.currency},billing_cycle:{interval:'month',frequency:plan.months},quantity:{minimum:1,maximum:1},custom_data:{nitido_plan:plan.id}}})).data;
 configured['PADDLE_PRICE_'+plan.id.toUpperCase()]=price.id;
}
console.log(JSON.stringify({environment:'sandbox',applied:true,configured,note:'Configure webhook, client token and server credentials separately; billing remains disabled.'},null,2));
