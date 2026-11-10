import {zipSync,strToU8} from 'fflate';

const allowed=/\.(jsx?|tsx?|vue|html|css)$/i;
export async function readCreatorFile(file){
 if(!file||!allowed.test(file.name))throw Error('Escolha um arquivo JS, JSX, TS, TSX, Vue, HTML ou CSS.');
 if(file.size>256000)throw Error('O arquivo excede 256 KB.');
 const bytes=await file.arrayBuffer();
 if(bytes.byteLength>256000)throw Error('O arquivo excede 256 KB.');
 let source;try{source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('Salve o arquivo como texto UTF-8.');}
 if(source.length>64000||source.includes('\0'))throw Error('Use texto sem bytes nulos, com até 64 mil caracteres.');
 return{source,filename:file.name.slice(0,100),...(/\.vue$/i.test(file.name)?{framework:'vue'}:/\.(html|css)$/i.test(file.name)?{framework:'html'}:{})};
}

export function creatorDraftZip(draft){
 const filename=(draft.filename||'component.jsx').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/^\.+/,'').slice(0,100)||'component.jsx';
 const metadata={...draft,filename,status:'draft',exportedAt:new Date().toISOString()};
 const readme=`# ${draft.name||'Rascunho privado'}\n\n${draft.description||''}\n\nEste pacote é um rascunho do autor. Não foi executado, moderado, publicado ou verificado pelo nitido.\n\nFramework: ${draft.framework||'react'}\nVersões: ${draft.versions||'Não informadas'}\nAutor declarado: ${draft.author||'Não informado'}\n\n## Instalação informada pelo autor\n${draft.installation||'Não informada. Revise dependências e licença antes de usar.'}\n\n## Dependências declaradas\n${(draft.dependencies||[]).join('\n')||'Não informadas'}\n\n## Requisitos\n${draft.requirements||'Não informados'}\n\n## Origem declarada\n${draft.repository||'Não informada'}\n\nConsulte LICENSE-NOTES.txt para as condições declaradas. Este pacote não concede direitos adicionais.\n`;
 return zipSync({['source/'+filename]:strToU8(draft.source||''),'draft.json':strToU8(JSON.stringify(metadata,null,2)),'README.md':strToU8(readme),'LICENSE-NOTES.txt':strToU8(draft.license||'Licença não informada. Não presuma autorização para uso ou redistribuição.')});
}
