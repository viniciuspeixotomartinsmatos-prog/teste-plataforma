// Runs inside the disposable target browser, never in the application parent.
// Samples computed styles and structure only; input values, cookies, DOM source
// and storage contents are not collected.
export function sampleRenderedDesign(){
 const colors=new Map(),fonts=new Map(),radii=new Map(),spacing=new Map(),sizes=new Map(),weights=new Map();
 const add=(map,value)=>{if(value&&value!=='transparent'&&value!=='rgba(0, 0, 0, 0)')map.set(value,(map.get(value)||0)+1);};
 const nodes=[];if(document.body){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT);let node=walker.currentNode;while(node&&nodes.length<1800){nodes.push(node);node=walker.nextNode();}}
 const structure={headings:[],buttons:0,forms:0,inputs:0,images:0,navigation:0,sections:0,animated:0,cards:0};
 const elements=[];let visible=0;
 for(const node of nodes){
  const style=getComputedStyle(node),rect=node.getBoundingClientRect();if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||!rect.width||!rect.height)continue;
  if(['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(node.tagName))continue;
  visible++;
  for(const key of ['color','backgroundColor','borderTopColor'])add(colors,style[key]);add(fonts,style.fontFamily);add(sizes,style.fontSize);add(weights,style.fontWeight);add(radii,style.borderTopLeftRadius);
  for(const key of ['gap','paddingTop','paddingLeft','marginTop'])if(parseFloat(style[key])>0)add(spacing,style[key]);
  if(/^H[1-3]$/.test(node.tagName)&&structure.headings.length<16)structure.headings.push({level:node.tagName,text:(node.textContent||'').replace(/\s+/g,' ').trim().slice(0,120)});
  if(node.matches('button,[role="button"]'))structure.buttons++;if(node.tagName==='FORM')structure.forms++;if(node.matches('input,textarea,select'))structure.inputs++;if(node.tagName==='IMG')structure.images++;if(node.matches('nav,[role="navigation"]'))structure.navigation++;if(node.matches('section,article'))structure.sections++;
  if(style.animationName!=='none')structure.animated++;
  if(parseFloat(style.borderTopLeftRadius)>=8&&rect.width>100&&rect.height>60&&style.backgroundColor!=='rgba(0, 0, 0, 0)')structure.cards++;
  if(elements.length<40&&node.matches('h1,h2,button,nav,form,section,article'))elements.push({tag:node.tagName.toLowerCase(),color:style.color,background:style.backgroundColor,font:style.fontFamily,fontSize:style.fontSize,fontWeight:style.fontWeight,radius:style.borderTopLeftRadius,width:Math.round(rect.width),height:Math.round(rect.height)});
 }
 const top=(map,limit=12)=>[...map].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([value,count])=>({value,count}));
 return {colors:top(colors),fonts:top(fonts),radii:top(radii),spacing:top(spacing),fontSizes:top(sizes),fontWeights:top(weights),structure,elements,sampledElements:visible,viewport:{width:innerWidth,height:innerHeight},originalScriptsExecuted:true,source:'rendered-public-browser',scope:'Estilos calculados após JavaScript em navegador descartável, sem login. Amostra limitada; não cobre todos os estados, páginas ou recursos bloqueados.'};
}
