const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; form-action 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'";
const head = '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+policy+'"><meta name="viewport" content="width=device-width,initial-scale=1">';
const script = value => '<script>'+value.replace(/<\/script/gi,'<\\/script')+'<\/script>';
async function defaultCompiler(){return (await import('./shared-compiler.js')).browserCompiler();}
export async function creatorPreview(draft,signal,loadCompiler=defaultCompiler){
  if(!draft.source?.trim())throw Error('Adicione o código antes de abrir a prévia.');
  if(draft.framework==='html'){
    if(/\.css$/i.test(draft.filename))throw Error('Inclua o HTML do exemplo junto com o CSS para visualizar.');
    return head+draft.source;
  }
  const framework=draft.framework==='vue'?'vue':'react';
  const response=await fetch('/data/creator-runtime/'+framework+'.js',{signal});
  if(!response.ok)throw Error('Não foi possível carregar o runtime da prévia.');
  const runtime=await response.text();
  let source=draft.source,css='';
  if(framework==='vue'){
    const {parse,compileScript,compileTemplate,compileStyle}=await import('@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js');
    const {descriptor,errors}=parse(source);
    if(errors.length)throw Error(String(errors[0]));
    const id='data-v-nitido';
    const options={id,genDefaultAs:'component'};
    const component=descriptor.script||descriptor.scriptSetup?compileScript(descriptor,options):null;
    source=component?.content||'const component={};';
    if(descriptor.template){
      const compiled=compileTemplate({source:descriptor.template.content,id,filename:'draft.vue',compilerOptions:{bindingMetadata:component?.bindings}});
      if(compiled.errors.length)throw Error(String(compiled.errors[0]));
      source+='\n'+compiled.code+'\ncomponent.render=render;';
    }
    if(descriptor.styles.some(style=>style.scoped))source+='\ncomponent.__scopeId="data-v-nitido";';
    for(const style of descriptor.styles){
      const result=compileStyle({source:style.content,id,filename:'draft.vue',scoped:style.scoped});
      if(result.errors.length)throw Error(String(result.errors[0]));
      css+=result.code;
    }
    source+='\nexport default component;';
  }
  const compiler=await loadCompiler();
  const compiled=await compiler.transform(source,{loader:'tsx',format:'cjs',jsx:'transform'});
  signal.throwIfAborted();
  const boot="window.addEventListener('error',event=>{const error=document.createElement('pre');error.textContent=event.message;document.body.append(error);});const module={exports:{}};const exports=module.exports;function require(name){if(name==='react')return window.React;if(name==='vue')return window.Vue;throw Error('Dependência indisponível na prévia: '+name);}";
  return head+'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style><div id="preview"></div>'+script(runtime)+script(boot)+script(compiled.code+'\nwindow.mountCreator(module.exports.default||module.exports);');
}
