// Some embedded browsers expose Clipboard API but leave its promise pending.
// Bound the wait and preserve the user's focus/selection around the fallback.
export async function copyAuditText(text,{navigatorObject=navigator,documentObject=document,timeoutMs=1500}={}){
 let timer;
 try{
  if(!navigatorObject.clipboard?.writeText)throw Error('Clipboard API unavailable');
  await Promise.race([navigatorObject.clipboard.writeText(text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Clipboard deadline')),timeoutMs);})]);
  return;
 }catch{
  const active=documentObject.activeElement,selection=documentObject.getSelection?.(),ranges=[];
  for(let i=0;i<(selection?.rangeCount||0);i++)ranges.push(selection.getRangeAt(i).cloneRange());
  const field=documentObject.createElement('textarea');field.value=text;field.readOnly=true;field.tabIndex=-1;field.setAttribute('aria-hidden','true');field.style.cssText='position:fixed;left:-9999px;top:0';documentObject.body.append(field);
  try{field.select();if(documentObject.execCommand?.('copy')!==true)throw Error('Não foi possível acessar a área de transferência.');}
  finally{field.remove();active?.focus?.({preventScroll:true});if(selection){selection.removeAllRanges();for(const range of ranges)selection.addRange(range);}}
 }finally{clearTimeout(timer);}
}
