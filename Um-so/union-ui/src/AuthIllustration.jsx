import React,{useEffect,useState} from 'react';

const quotes={
 signup:'Crie sua conta. Um novo capítulo começa aqui.',
 login:'Suas ideias merecem um novo universo.',
 forgot:'Toda grande jornada tem um caminho de volta.',
 resend:'Mais um passo para começar a criar.',
 reset:'Um novo começo para as suas ideias.',
 confirm:'Seu próximo capítulo está quase pronto.',
};

export default function AuthIllustration({mode}){
 const quote=quotes[mode]||quotes.login;
 const [length,setLength]=useState(0);
 useEffect(()=>{
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setLength(quote.length);return;}
  setLength(0);const timer=setInterval(()=>setLength(current=>{if(current>=quote.length){clearInterval(timer);return current;}return current+1;}),42);
  return()=>clearInterval(timer);
 },[quote]);
 return <aside className="auth-art" aria-label="Um novo universo para suas ideias">
  <div className="auth-art-image" key={mode==='signup'?'signup':'login'}>
   <img src={'/assets/auth/astronaut-'+(mode==='signup'?'signup':'login')+'.webp'} width="577" height="433" alt="" decoding="async"/>
  </div>
  <blockquote className="auth-art-quote"><p aria-label={quote}><span aria-hidden="true">“{quote.slice(0,length)}<span className="auth-typing-cursor"/>”</span></p><cite>Um universo de possibilidades. nitido.</cite></blockquote>
 </aside>;
}
