// Conservative source evidence for framework variants. This never deletes an
// item or treats shared names, helper files or dependencies as duplicate code.
const attributes=new Set(['d','points','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','width','height','transform']);
export function svgGeometry(source){
 const viewBox=/\bviewBox\s*=\s*["']([^"']+)["']/.exec(source)?.[1];
 if(!viewBox)return null;
 const shapes=[];
 for(const match of source.matchAll(/<(?:motion\.)?(path|circle|rect|line|polyline|polygon|ellipse|g)\b([^>]*?)\/?\s*>/g)){
  const values=[];
  for(const attr of match[2].matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)){
   const name=attr[1].replace(/^:/,'');if(!attributes.has(name))continue;
   const value=(attr[2]??attr[3]??attr[4]).trim().replace(/\s+/g,' ');
   if((attr[1].startsWith(':')||attr[4]!==undefined)&&!/^[-+]?\d*\.?\d+$/.test(value))return null;
   values.push([name,value]);
  }
  if(match[1]==='g'&&!values.length)continue;
  if(!values.length)return null;
  shapes.push([match[1],values.sort(([a],[b])=>a.localeCompare(b))]);
 }
 return shapes.length?JSON.stringify([viewBox.trim().replace(/\s+/g,' '),shapes]):null;
}
export function frameworkCounterpart(react,vue){
 return react?.framework==='react'&&vue?.framework==='vue'&&react.sourceId==='animate'&&vue.sourceId==='animate'&&
  vue.id===react.id.replace(/^animate-/,'animate-vue-')&&vue.slug==='vue/'+react.slug&&
  react.name===vue.name&&react.kind===vue.kind&&react.category===vue.category&&react.license===vue.license;
}
