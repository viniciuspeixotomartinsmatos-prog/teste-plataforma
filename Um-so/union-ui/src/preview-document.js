export function instrumentPreviewHTML(html,id,baseURL){
 const identity=JSON.stringify(id).replace(/</g,'\\u003c');
 const base=String(baseURL).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const script=`<base href="${base}"><script>(()=>{const id=${identity};let failed=false,sent=false;const send=(type,message)=>parent.postMessage({type,id,message},'*');window.addEventListener('error',e=>{if(e.target!==window)return;failed=true;send('preview-error',e.message)});window.addEventListener('unhandledrejection',e=>{failed=true;send('preview-error',String(e.reason?.message||e.reason))});function ready(){if(failed||sent)return;const root=document.getElementById('root')||document.getElementById('__next')||document.body;const content=root&&(root.innerText?.trim()||root.querySelector('canvas,svg,img,video,button,input,[class]'));if(content){sent=true;send('preview-ready')}else setTimeout(ready,150)}window.addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(ready)));})();<\/script>`;
 return /<head(?:\s[^>]*)?>/i.test(html)?html.replace(/<head(?:\s[^>]*)?>/i,match=>match+script):script+html;
}
