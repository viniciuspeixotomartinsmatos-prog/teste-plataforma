import ts from 'typescript';
import {parse as parseHTML} from 'parse5';
import {parse,compileScript,compileTemplate,compileStyle} from '@vue/compiler-sfc';
import {createHash} from 'node:crypto';

// Parse and compile text only. Submitted code never runs in the API process.
export function analyzeCreator(draft){
 const source=typeof draft.source==='string'?draft.source:'';
 const findings=[],imports=new Set();
 const add=(level,message)=>findings.push({level,message});
 let syntax=true;
 function javascript(code){
  const tree=ts.createSourceFile('component.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  for(const error of tree.parseDiagnostics){syntax=false;add('error','Sintaxe: '+ts.flattenDiagnosticMessageText(error.messageText,' ').slice(0,240));}
  function visit(node){
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.add(node.moduleSpecifier.text);
   if(ts.isCallExpression(node)){
    if(node.expression.kind===ts.SyntaxKind.ImportKeyword){add('error','Imports dinâmicos não estão disponíveis no ambiente isolado.');}
    if(ts.isIdentifier(node.expression)&&['eval','Function','fetch','WebSocket','Worker','SharedWorker','require'].includes(node.expression.text)){
     if(node.expression.text==='require'&&ts.isStringLiteral(node.arguments[0]))imports.add(node.arguments[0].text);
     else add('error','A prévia não permite execução dinâmica, rede ou workers: '+node.expression.text+'.');
    }
   }
   if(ts.isNewExpression(node)&&ts.isIdentifier(node.expression)&&['Function','WebSocket','Worker','SharedWorker','XMLHttpRequest'].includes(node.expression.text))add('error','Recurso indisponível na prévia: '+node.expression.text+'.');
   ts.forEachChild(node,visit);
  }
  visit(tree);
  // Compilation catches unsupported TS module constructs without executing them.
  const output=ts.transpileModule(code,{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
  for(const diagnostic of output.diagnostics||[])if(diagnostic.category===ts.DiagnosticCategory.Error){syntax=false;add('error','Compilação: '+ts.flattenDiagnosticMessageText(diagnostic.messageText,' ').slice(0,240));}
 }
 if(!source.trim()||source.length>64000){syntax=false;add('error','Use código com até 64 mil caracteres.');}
 else try{
  if(draft.framework==='vue'){
   const {descriptor,errors}=parse(source);
   if(errors.length)throw Error('Estrutura Vue inválida.');
   if(!descriptor.template)throw Error('Inclua o template do exemplo Vue.');
   if(descriptor.script?.src||descriptor.template.src||descriptor.styles.some(s=>s.src))throw Error('Arquivos externos não estão disponíveis nesta prévia.');
   const component=descriptor.script||descriptor.scriptSetup?compileScript(descriptor,{id:'nitido-analysis'}):null;
   if(component)javascript(component.content);
   const template=compileTemplate({source:descriptor.template.content,id:'nitido-analysis',filename:'draft.vue',compilerOptions:{bindingMetadata:component?.bindings}});
   if(template.errors.length)throw Error('Template Vue inválido.');
   for(const style of descriptor.styles)if(compileStyle({source:style.content,id:'nitido-analysis',filename:'draft.vue',scoped:style.scoped}).errors.length)throw Error('Estilo Vue inválido.');
  }else if(draft.framework==='html'){
   if(/\.css$/i.test(draft.filename||''))throw Error('Um arquivo CSS precisa incluir o HTML do exemplo.');
   const document=parseHTML(source);let visible=false;
   const visit=node=>{
    const attrs=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
    if(['iframe','object','embed','base'].includes(node.tagName))add('error','Elemento não permitido na prévia: '+node.tagName+'.');
    if((node.tagName==='script'&&attrs.src)||(node.tagName==='link'&&attrs.rel==='stylesheet'))add('error','Scripts e folhas de estilo externos ficam bloqueados na prévia.');
    if(node.tagName==='script'&&(!attrs.type||/^(?:module|(?:text|application)\/javascript)$/i.test(attrs.type)))javascript((node.childNodes||[]).map(n=>n.value||'').join(''));
    if(node.tagName==='meta'&&(attrs['http-equiv']||'').toLowerCase()==='refresh')add('error','Redirecionamentos automáticos não são permitidos.');
    if(node.nodeName==='#text'&&node.value.trim()&&!['script','style','title'].includes(node.parentNode?.tagName)||['canvas','svg','img','input','button'].includes(node.tagName))visible=true;
    for(const child of node.childNodes||[])visit(child);
   };visit(document);
   if(!visible)add('error','O documento não contém conteúdo visual identificado.');
  }else{
   javascript(source);
   if(!/export\s+default\b|module\.exports\s*=/.test(source))add('error','Exporte o componente principal com export default.');
  }
 }catch(error){syntax=false;add('error',String(error.message).slice(0,240));}
 for(const dependency of imports)if(!['react','vue'].includes(dependency))add('error','Dependência ainda indisponível na prévia isolada: '+dependency.slice(0,100)+'.');
 if(/(?:sk-proj-|sk_live_|sb_secret_)[a-zA-Z0-9_-]{16,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(source))add('error','Possível credencial no código. Remova antes de enviar.');
 if(/\b(?:document\.cookie|localStorage|sessionStorage|dangerouslySetInnerHTML|innerHTML|location\s*=)/.test(source))add('warning','Há acesso a armazenamento, HTML dinâmico ou navegação. Revisão manual necessária.');
 const documentation=['description','installation','requirements','author','license'].map(key=>({key,present:typeof draft[key]==='string'&&draft[key].trim().length>0}));
 for(const {key,present} of documentation)if(!present)add('warning','Documentação ausente: '+key+'.');
 const unique=findings.filter((f,i,all)=>all.findIndex(x=>x.level===f.level&&x.message===f.message)===i).slice(0,40);
 const passed=syntax&&!unique.some(f=>f.level==='error');
 const score=(syntax?40:0)+(passed?30:0)+documentation.filter(d=>d.present).length*6;
 return {schema:1,checkedAt:new Date().toISOString(),sourceSha256:createHash('sha256').update(source).digest('hex'),passed,score,findings:unique,dependencies:[...imports],scope:'Sintaxe, compilação, compatibilidade da prévia e documentação. Renderização, licença, originalidade e segurança completa exigem revisão.'};
}
