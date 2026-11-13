import{visualDescriptor,rankVisualResources}from'./visual-resource-match.js';
export async function visualRecommendations(screenshot,{signal}={}){
 if(typeof screenshot!=='string'||screenshot.length>2500000||!/^data:image\/(?:jpeg|png|webp);base64,[a-z\d+/=]+$/i.test(screenshot))return [];
 const abort=signal?AbortSignal.any([signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000);
 const image=new Image();await new Promise((resolve,reject)=>{let done=false;const end=(error)=>{if(done)return;done=true;abort.removeEventListener('abort',cancel);image.onload=image.onerror=null;error?reject(error):resolve();};const cancel=()=>{image.src='';end(new DOMException('Cancelado','AbortError'));};image.onload=()=>end();image.onerror=()=>end(Error('Captura indisponível.'));abort.addEventListener('abort',cancel,{once:true});if(abort.aborted)return cancel();image.src=screenshot;});
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const context=canvas.getContext('2d');if(!context)return [];context.drawImage(image,0,0,32,32);const vector=visualDescriptor(context.getImageData(0,0,32,32).data,32,32);if(!vector)return [];
 const response=await fetch('/data/visual-resource-index.json',{credentials:'same-origin',signal:abort});if(!response.ok)return [];const index=await response.json();if(index.version!==1||!Array.isArray(index.rows)||index.rows.length>20000)return [];
 return rankVisualResources(vector,index.rows).map(({id,name,kind,image})=>({id,name,kind,image,reason:'Similaridade de cores, distribuição de luminosidade e contraste da captura real. Não comprova equivalência funcional.'}));
}
