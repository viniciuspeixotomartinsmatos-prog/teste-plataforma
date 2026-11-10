import React,{useEffect,useRef,useState} from 'react';

export default function CreatorPreview({draft}){
 const [html,setHTML]=useState(''),[message,setMessage]=useState('');
 const pending=useRef(null);
 useEffect(()=>{pending.current?.abort();setHTML('');setMessage('');return ()=>pending.current?.abort();},[draft]);
 async function open(){
   pending.current?.abort();
   const abort=new AbortController();
   pending.current=abort;
   setMessage('Preparando prévia…');setHTML('');
   const timer=setTimeout(()=>{abort.abort();setMessage('A prévia demorou para iniciar. Tente novamente.');},20000);
   try{
     const {creatorPreview}=await import('./creator-preview.js');
     const content=await creatorPreview(draft,abort.signal);
     if(!abort.signal.aborted){setHTML(content);setMessage('');}
   }catch(error){if(!abort.signal.aborted)setMessage(error.message);}
   finally{clearTimeout(timer);}
 }
 return <section><button type="button" className="button" onClick={open}>Testar prévia isolada</button>
   {message&&<p role="status">{message}</p>}
   {html&&<><button type="button" className="text-button" onClick={()=>setHTML('')}>Fechar prévia</button>
   <iframe title="Prévia privada do rascunho" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={html} style={{width:'100%',height:420,background:'white',border:0}}/></>}</section>;
}
