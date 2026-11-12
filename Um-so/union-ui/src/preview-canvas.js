// This observer is serialized into the opaque demo document. It never modifies
// the authenticated parent, source geometry or rendering arguments.
export function observePreviewCanvas(onPresented,win=window){
 const presented=new WeakSet(),wrapped=new WeakSet(),sampleAfter=new WeakMap(),scheduled=new WeakSet(),queued=new WeakSet();
 const proto=win.HTMLCanvasElement?.prototype;if(!proto)return presented;
 const original=proto.getContext;
 function sample(context,canvas){
  if(presented.has(canvas)||scheduled.has(canvas)||!canvas.width||!canvas.height)return;
  const now=win.performance.now();if(now<(sampleAfter.get(canvas)||0))return;sampleAfter.set(canvas,now+150);
  try{
   const gpu=typeof context.readPixels==='function';
   if(gpu&&(context.isContextLost()||context.getParameter(context.FRAMEBUFFER_BINDING)!==null))return;
   let lit=false,transparent=false,ink=false;const pixel=new Uint8Array(4);
   for(const [x,y]of [[.5,.5],[.25,.25],[.75,.75],[.25,.75],[.75,.25]]){
    const px=Math.min(canvas.width-1,Math.floor(canvas.width*x)),py=Math.min(canvas.height-1,Math.floor(canvas.height*y));
    const rgba=gpu?(context.readPixels(px,py,1,1,context.RGBA,context.UNSIGNED_BYTE,pixel),pixel):context.getImageData(px,py,1,1).data;
    transparent ||= rgba[3]===0;ink ||= rgba[3]>0;
    if(rgba[3]>0&&rgba[0]+rgba[1]+rgba[2]>15){lit=true;break;}
   }
   // Black lettering on a transparent canvas is real paint. A uniformly black
   // opaque framebuffer remains unproven. Sample a bounded grid for small ink.
   if(!lit&&!gpu){for(let y=1;y<8;y++)for(let x=1;x<8;x++){
    const rgba=context.getImageData(Math.floor(canvas.width*x/8),Math.floor(canvas.height*y/8),1,1).data;
    transparent ||= rgba[3]===0;ink ||= rgba[3]>0;
    if(rgba[3]>0&&rgba[0]+rgba[1]+rgba[2]>15)lit=true;
   }lit ||= transparent&&ink;}
   if(lit){scheduled.add(canvas);win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>{scheduled.delete(canvas);presented.add(canvas);onPresented();}));}
  }catch{ /* A tainted/unreadable surface is not evidence of a presented frame. */ }
 }
 proto.getContext=function(...args){
  const context=original.apply(this,args);if(!context||wrapped.has(context))return context;
  wrapped.add(context);const canvas=this;
  for(const method of ['drawImage','putImageData','fill','stroke','fillRect','strokeRect','fillText','strokeText','drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
   const draw=context[method];if(typeof draw!=='function')continue;
   try{Object.defineProperty(context,method,{configurable:true,writable:true,value:function(...values){const result=draw.apply(this,values);if(typeof context.readPixels==='function')sample(context,canvas);else if(!queued.has(canvas)&&!presented.has(canvas)){queued.add(canvas);win.requestAnimationFrame(()=>{queued.delete(canvas);sample(context,canvas);});}return result;}});}catch{}
  }
  return context;
 };
 return presented;
}
