import React,{useEffect,useRef,useState} from 'react';

export default function CreatorPreview({draft}){
 const [html,setHTML]=useState(''),[message,setMessage]=useState('');
 const pending=useRef(null),frame=useRef(null);
 useEffect(()=>{pending.current?.abort();setHTML('');setMessage('');return ()=>pending.current?.abort();},[draft]);
 useEffect(()=>{
  if(!html)return;
  const timer=setTimeout(()=>{setHTML('');setMessage('A prévia não confirmou a renderização. Revise o código e tente novamente.');},15000);
  function status(event){
   if(event.source!==frame.current?.contentWindow||event.data?.type!=='nitido-creator-preview')return;
   if(!['ready','error'].includes(event.data.status))return;
   clearTimeout(timer);
   if(event.data.status==='error'){setHTML('');setMessage(String(event.data.message||'Falha na prévia.').slice(0,300));}
   else setMessage('Prévia renderizada. Teste as interações abaixo.');
  }
  window.addEventListener('message',status);
  return()=>{clearTimeout(timer);window.removeEventListener('message',status);};
 },[html]);
 async function open(){
   pending.current?.abort();
   const abort=new AbortController();
   pending.current=abort;
   setMessage('Preparando prévia…');setHTML('');
   const timer=setTimeout(()=>{abort.abort();setMessage('A prévia demorou para iniciar. Tente novamente.');},20000);
   try{
     const {creatorPreview}=await import('./creator-preview.js');
     const content=await creatorPreview(draft,abort.signal);
     if(!abort.signal.aborted){setHTML(content);setMessage('Confirmando a renderização…');}
   }catch(error){if(!abort.signal.aborted)setMessage(error.message);}
   finally{clearTimeout(timer);}
 }
 return <section><button type="button" className="button" onClick={open}>Testar prévia isolada</button>
   {message&&<p role="status">{message}</p>}
   {html&&<><button type="button" className="text-button" onClick={()=>setHTML('')}>Fechar prévia</button>
   <iframe ref={frame} title="Prévia privada do rascunho" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={html} style={{width:'100%',height:420,background:'white',border:0}}/></>}</section>;
}
