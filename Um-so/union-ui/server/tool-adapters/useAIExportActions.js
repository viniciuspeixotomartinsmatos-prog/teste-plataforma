import {useState} from 'react';
import {CodeSquareIcon,FileScriptIcon,SparklesIcon} from '@hugeicons/core-free-icons';
import {toast} from 'sonner';
export function useAIExportActions({fullPrompt,configuredUsage,componentSource,componentCss}){
 const [done,setDone]=useState(null);
 const complete=fullPrompt||[configuredUsage,componentSource,componentCss].filter(Boolean).join('\n\n');
 const run=async(key,text)=>{try{await navigator.clipboard.writeText(text||'');setDone(key);toast.success('Copiado.');}catch{toast.error('Não foi possível copiar.');}};
 return{done,copyItems:[{key:'prompt',label:'Copiar prompt completo',icon:SparklesIcon,run:()=>run('prompt',complete)},{key:'usage',label:'Copiar exemplo configurado',icon:CodeSquareIcon,run:()=>run('usage',configuredUsage)},{key:'source',label:'Copiar código do componente',icon:FileScriptIcon,run:()=>run('source',[componentSource,componentCss].filter(Boolean).join('\n\n'))}],openItems:[]};
}
