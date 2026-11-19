import React,{useMemo,useState} from 'react';
import {zipSync,strToU8} from 'fflate';
import {useOptions} from '../context/OptionsContext/useOptions';
import {useComponentPropsContext} from '../../hooks/useComponentPropsContext';
import {formatPropValue} from '../../utils/codeGeneration';

export default function CodeExample({codeObject,componentName}){
 const {languagePreset,stylePreset,setLanguagePreset,setStylePreset}=useOptions();
 const context=useComponentPropsContext();
 const [selected,setSelected]=useState(0),[feedback,setFeedback]=useState('');
 const files=useMemo(()=>{
  const ts=languagePreset==='TS',tw=stylePreset==='TW';
  const source=(ts&&tw?codeObject.tsTailwind:ts?codeObject.tsCode:tw?codeObject.tailwind:'')||codeObject.code||codeObject.tsCode||'';
  const ext=ts?'tsx':'jsx';
  const usage=injectPropsIntoCode(codeObject.usage?.replaceAll('@/components/sounds/','./'),{...context.props,...context.computedProps},{},componentName,context.demoOnlyProps);
  const soundName=/const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=/.exec(source)?.[1];
  const name=Object.keys(codeObject).some(k=>k.startsWith('react-bits-sound.'))?soundName:componentName?.replace(/[^a-zA-Z0-9_$]/g,'');
  const result=[];
  if(usage)result.push({path:'Example.'+ext,content:usage});
  if(source)result.push({path:(name||'Component')+'.'+ext,content:source});
  if(!tw&&codeObject.css)result.push({path:(name||'Component')+'.css',content:codeObject.css});
  const skip=new Set(['usage','code','tsCode','tailwind','tsTailwind','css','dependencies']);
  for(const [key,value]of Object.entries(codeObject))if(!skip.has(key)&&typeof value==='string'&&value)result.push({path:key,content:value});
  return result;
 },[codeObject,componentName,languagePreset,stylePreset,context.props,context.computedProps,context.demoOnlyProps]);
 async function copy(text){try{await navigator.clipboard.writeText(text);setFeedback('Copiado.');}catch{setFeedback('Não foi possível copiar. Selecione o código e copie manualmente.');}}
 async function download(){try{
  const archive=Object.fromEntries(files.map(f=>[f.path,strToU8(f.content)]));
  const response=await fetch('/licenses/THIRD_PARTY_NOTICES.md');if(!response.ok)throw Error('Avisos técnicos indisponíveis.');
  archive['THIRD_PARTY_NOTICES.md']=strToU8(await response.text());
  archive['README.md']=strToU8('# '+componentName+'\n\nCopie os arquivos para o seu projeto React. Example contém a composição e os valores selecionados.\n\nDependências: '+(codeObject.dependencies||'React e React DOM')+'\n\nPreserve os avisos técnicos incluídos.');
  const blob=new Blob([zipSync(archive)],{type:'application/zip'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=(componentName||'component').replace(/[^a-zA-Z0-9_-]/g,'-')+'.zip';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setFeedback('Arquivos preparados.');
 }catch(error){setFeedback(error.message||'Não foi possível preparar o arquivo.');}}
 const active=files[Math.min(selected,files.length-1)];
 return <section className="um-code-export"><div className="um-code-toolbar"><label>Linguagem<select value={languagePreset} onChange={e=>{setLanguagePreset(e.target.value);setSelected(0);}}><option value="JS">JavaScript</option><option value="TS">TypeScript</option></select></label>{(codeObject.tailwind||codeObject.tsTailwind)&&<label>Estilo<select value={stylePreset} onChange={e=>{setStylePreset(e.target.value);setSelected(0);}}><option value="CSS">CSS</option><option value="TW">Tailwind</option></select></label>}<button onClick={download}>Baixar arquivos .zip</button><button onClick={()=>copy(files.map(f=>'### '+f.path+'\n```\n'+f.content+'\n```').join('\n\n'))}>Copiar prompt completo</button></div><p className="um-code-deps">Dependências: {codeObject.dependencies||'React e React DOM'}</p><div className="um-code-tabs">{files.map((f,i)=><button key={f.path} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{f.path}</button>)}</div>{active&&<><div className="um-code-file"><span>{active.path}</span><button onClick={()=>copy(active.content)}>Copiar código</button></div><pre><code>{active.content}</code></pre></>}<div role="status">{feedback}</div></section>;
}
