import {standalonePreview} from './component-export.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pageDocument(project,sections){
 return '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(project.title)+'</title><style>body{margin:0;background:'+(project.theme==='light'?'#fff':'#111')+'}iframe{display:block;width:100%;border:0}'+sections.map((s,i)=>'#section-'+i+'{height:'+s.height+'px}@media(max-width:640px){#section-'+i+'{height:'+s.mobileHeight+'px}}').join('')+'</style></head><body>'+sections.map((s,i)=>'<iframe id="section-'+i+'" title="'+escape(s.name)+'" src="sections/'+(i+1)+'.html" sandbox="allow-scripts allow-downloads"></iframe>').join('')+'</body></html>';
}
export async function exportPage(project,rows,onProgress=()=>{}){
 const {zipSync,strToU8}=await import('fflate'),entries={},sections=project.sections.filter(s=>s.enabled);if(!sections.length)throw Error('Adicione uma seção visível para exportar.');
 const rendered=[];
 for(let i=0;i<sections.length;i++){const section=sections[i],item=rows.find(r=>r.id===section.componentId);if(!item)throw Error('Componente indisponível.');onProgress(i+1,sections.length);entries['sections/'+(i+1)+'.html']=strToU8(await standalonePreview(item,project.theme,section.config,section.settings));rendered.push({...section,name:item.name});}
 entries['index.html']=strToU8(pageDocument(project,rendered));entries['project.json']=strToU8(JSON.stringify(project,null,2));
 entries['README.md']=strToU8('# '+project.title+'\n\nAbra index.html. Cada seção mantém sua demonstração executável em um iframe isolado, preservando React/Vue e estilos próprios. Este pacote não é um projeto React unificado. Recursos externos podem exigir internet. Importe project.json no montador para continuar editando. Alturas de desktop e celular são preservadas.\n');
 const response=await fetch('/licenses/manifest.json');if(!response.ok)throw Error('Não foi possível carregar as licenças.');for(const file of ['ATTRIBUTIONS.md',...await response.json()]){const r=await fetch('/licenses/'+file);if(!r.ok)throw Error('Licença indisponível: '+file);entries['licenses/'+file]=strToU8(await r.text());}
 return zipSync(entries,{level:6});
}
