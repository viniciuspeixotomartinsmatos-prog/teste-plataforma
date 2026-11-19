import{createHash}from'node:crypto';
import{parse}from'@babel/parser';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const text=value=>value.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').replace(/[\t ]+$/gm,'').trim();
export function packageEvidence(row,payload){
 const files=(payload.files||[]).filter(file=>typeof file.path==='string'&&typeof file.content==='string').map(file=>({path:file.path.replaceAll('\\','/'),content:text(file.content)})).sort((a,b)=>a.path.localeCompare(b.path));
 const primary=files.find(file=>/\.(?:[jt]sx|vue)$/.test(file.path)&&!/(?:^|\/)(?:utils?|index|types?|constants|hooks?)(?:[./-]|$)/i.test(file.path)&&!/demo|example|usage/i.test(file.path)&&file.content.length>=120);
 if(!primary)return null;
 const framework=row.framework||payload.framework,license=row.license||payload.license;
 // Shared toolkit files do not make Accordion and Dialog interchangeable.
 // Keep entry identity and any example/variant selection in the family scope.
 const scope={framework,license,kind:row.kind,category:row.category,entryPoint:String(row.name||'').trim().toLowerCase()};
 const packageHash=framework&&license?hash(stable({scope,files,demoCode:text(payload.demoCode||''),examples:row.examples||null,variants:row.variants||null,exportName:row.exportName||null,dependencies:[...new Set([...(row.dependencies||[]),...(payload.dependencies||[])])].sort(),registryDependencies:payload.registryDependencies||null})):null;
 let primaryHash=null;
 if(!primary.path.endsWith('.vue'))try{
  const ast=parse(primary.content,{sourceType:'unambiguous',plugins:['typescript','jsx'],tokens:true});
  const tokens=ast.tokens.filter(token=>token.type?.label&&token.type.label!=='eof').map(token=>[token.type.label,token.value??null]);
  primaryHash=hash({framework,kind:row.kind,category:row.category,tokens});
 }catch{}
 return {packageHash,primaryHash,scope,files:files.length};
}
