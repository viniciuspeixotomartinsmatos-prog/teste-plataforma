let sdkPromise;
const initialized=new WeakMap();
export function portalDestination(value){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||!['customer-portal.paddle.com','sandbox-customer-portal.paddle.com'].includes(url.hostname))throw Error('Portal indisponível. Tente novamente.');
 return url.href;
}
async function loadSDK(){
 if(window.Paddle)return window.Paddle;
 if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.paddle.com/paddle/v2/paddle.js';script.async=true;
  const timer=setTimeout(()=>{script.remove();sdkPromise=undefined;reject(Error('Não foi possível abrir o pagamento. Confira sua conexão.'));},15000);
  script.onload=()=>{clearTimeout(timer);if(window.Paddle)resolve(window.Paddle);else{sdkPromise=undefined;reject(Error('Pagamento indisponível.'));}};
  script.onerror=()=>{clearTimeout(timer);script.remove();sdkPromise=undefined;reject(Error('Não foi possível carregar o pagamento.'));};document.head.append(script);
 });
 return sdkPromise;
}
export async function openPaddleCheckout({config,transactionId,locale='pt-BR',onComplete=()=>{},paddle}){
 if(!config?.enabled||!['sandbox','live'].includes(config.mode)||!config.clientToken?.startsWith(config.mode==='sandbox'?'test_':'live_')||!/^txn_[a-z0-9]{26}$/.test(transactionId))throw Error('Pagamento indisponível.');
 const sdk=paddle||await loadSDK();
 let state=initialized.get(sdk);
 if(state&&(state.token!==config.clientToken||state.mode!==config.mode))throw Error('A configuração do pagamento mudou. Recarregue a página.');
 if(!state){
  state={token:config.clientToken,mode:config.mode,onComplete};
  if(config.mode==='sandbox')sdk.Environment.set('sandbox');
  sdk.Initialize({token:config.clientToken,eventCallback:event=>{if(event.name==='checkout.completed')state.onComplete();}});
  initialized.set(sdk,state);
 }else state.onComplete=onComplete;
 sdk.Checkout.open({transactionId,settings:{displayMode:'overlay',theme:'dark',locale:locale==='en'?'en':'pt-BR',allowLogout:false}});
}
