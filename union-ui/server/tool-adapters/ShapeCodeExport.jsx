import React,{useEffect,useState} from 'react';
import CodeExample from '@/components/code/CodeExample';
import {loadCode} from '@/tools/background-studio/utils/catalog';
export default function ShapeCodeExport({material,code,svg,name}){
 const component=material.kind==='metal'?'MetallicPaint':material.kind==='background'?material.entry.name||material.entry.label.replace(/[^a-zA-Z0-9]/g,''):null;
 const [source,setSource]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let alive=true;setError('');setSource(null);if(!component)return;loadCode({name:component}).then(value=>{if(!alive)return;if(!value)throw Error('O código do material não foi encontrado.');setSource(value);}).catch(failure=>{if(alive)setError(failure.message);});return()=>{alive=false;};},[component]);
 if(error)return <p role="alert">{error}</p>;
 if(component&&!source)return <p>Preparando os arquivos do material…</p>;
 if(component&&!svg?.svg&&!svg?.mask)return <p>Preparando a forma para exportação…</p>;
 const extras=svg?.mask||svg?.svg?{[name+'.svg']:svg.mask||svg.svg}:{};
 const ownName=/export default function ([A-Za-z_$][\w$]*)/.exec(code.code)?.[1]||name;
 const payload=component?{...source,usage:code.code,...extras}:{code:code.code,...extras};
 return <CodeExample codeObject={payload} componentName={component||ownName}/>;
}
