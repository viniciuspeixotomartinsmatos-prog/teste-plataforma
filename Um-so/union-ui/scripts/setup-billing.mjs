import fs from 'node:fs/promises';
import Stripe from 'stripe';
import {PLANS} from '../server/application.mjs';
const directory='var';
const cli=await fs.readFile(directory+'/stripe-cli-private.toml','utf8');
const secretKey=cli.match(/^test_mode_api_key\s*=\s*"([^"]+)"/m)?.[1];
if(!secretKey||!secretKey.includes('_test_'))throw Error('A private sandbox test key is required.');
let previous={};try{previous=JSON.parse(await fs.readFile(directory+'/billing.json','utf8'));}catch{}
const stripe=new Stripe(secretKey);
const product=previous.productId?await stripe.products.retrieve(previous.productId):await stripe.products.create({name:'Um só.',description:'Componentes, ferramentas e arquivos para criar interfaces.',metadata:{app:'umso'}},{idempotencyKey:'umso-test-product-v1'});
const prices={};
for(const plan of PLANS){
 const price=previous.prices?.[plan.id]?await stripe.prices.retrieve(previous.prices[plan.id]):await stripe.prices.create({product:product.id,currency:plan.currency,unit_amount:plan.amount,recurring:{interval:'month',interval_count:plan.months},nickname:plan.name,metadata:{plan:plan.id}},{idempotencyKey:'umso-test-'+plan.id+'-'+plan.amount});
 prices[plan.id]=price.id;
}
const portal=previous.portalConfiguration?{id:previous.portalConfiguration}:await stripe.billingPortal.configurations.create({business_profile:{headline:'Gerenciar sua assinatura Um só.'},features:{customer_update:{enabled:true,allowed_updates:['email','name','address']},payment_method_update:{enabled:true},subscription_cancel:{enabled:true,mode:'at_period_end'},subscription_update:{enabled:true,default_allowed_updates:['price'],products:[{product:product.id,prices:Object.values(prices)}],proration_behavior:'create_prorations'}}});
const config={...previous,secretKey,productId:product.id,prices,portalConfiguration:portal.id,mode:'test'};
await fs.writeFile(directory+'/billing.json',JSON.stringify(config),{mode:0o600});
console.log(JSON.stringify({mode:'test',plans:PLANS.map(({id,name,amount,currency,months})=>({id,name,amount,currency,months})),configured:true}));
