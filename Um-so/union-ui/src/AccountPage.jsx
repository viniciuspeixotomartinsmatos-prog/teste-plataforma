import React,{useState,useEffect} from 'react';
import {ArrowRight,Check,Loader2,LogOut,Cloud,Mail,UserRound,Eye,EyeOff,Layers3,LockKeyhole,KeyRound} from 'lucide-react';
import AuthIllustration from './AuthIllustration.jsx';
import {api} from './account.js';
import {safeNext} from './auth-policy.js';
import './account.css';
export function PlansPage({navigate}){return <main className="account-page" id="main"><span className="section-eyebrow">nitido</span><h1>Um espaço inteiro<br/><span>para criar.</span></h1><p className="page-lead">O acesso a esta versão está liberado. Explore as ferramentas e guarde suas ideias nas coleções.</p><button className="button button-primary" onClick={()=>navigate('/tools')}><ArrowRight size={15}/>Explorar ferramentas</button></main>;}
const callbackMessages={confirmation_browser:'Não foi possível concluir a entrada automática neste navegador. Seu e-mail pode já estar confirmado: entre com sua senha. Se ainda precisar confirmar, solicite um novo e-mail.',confirmation_link:'Esse link não pôde ser validado. Entre com sua senha ou solicite um novo e-mail de confirmação.',recovery_link:'Não foi possível validar a recuperação neste navegador. Solicite novas instruções abaixo.'};
export default function AccountPage({account,navigate,notify,path='/account',search=''}){
 const params=new URLSearchParams(search);const reset=path==='/account/reset',confirmation=Boolean(params.get('token_hash'))&&['email','recovery'].includes(params.get('type')),callbackError=params.get('auth_error');
 const initialMode=reset?'reset':confirmation?'confirm':callbackError==='recovery_link'?'forgot':'login';
 const [mode,setMode]=useState(initialMode),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(callbackMessages[callbackError]||''),[message,setMessage]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 useEffect(()=>{setMode(initialMode);setError(callbackMessages[callbackError]||'');setMessage('');},[initialMode,callbackError]);
 useEffect(()=>{setShowPassword(false);},[mode]);
 const changeMode=next=>{setMode(next);setError('');setMessage('');setPassword('');};

 async function submit(event){event.preventDefault();setBusy(true);setError('');setMessage('');try{
  if(mode==='confirm'){const result=await api('/api/auth/verify-email',{method:'POST',body:{tokenHash:params.get('token_hash'),type:params.get('type')}});const user=await account.refreshSession();if(!user)throw Error('Não foi possível concluir sua entrada. Entre com sua senha.');await account.refreshAccess();notify('Link confirmado.');navigate(safeNext(result.next));}
  else if(mode==='resend'){await api('/api/auth/resend-confirmation',{method:'POST',body:{email}});setMessage('Se a conta ainda precisar de confirmação, você receberá um novo e-mail. Se já confirmou, entre com sua senha.');}
  else if(mode==='forgot'){await api('/api/auth/request-password-reset',{method:'POST',body:{email,redirectTo:window.location.origin+'/account/reset'}});setMessage('Se houver uma conta com esse e-mail, você receberá as instruções para redefinir a senha.');}
  else if(mode==='reset'){await api('/api/auth/reset-password',{method:'POST',body:{token:params.get('token'),newPassword:password}});await account.refreshSession();setPassword('');setMode('login');setMessage('Senha alterada. Entre com a nova senha.');}
  else{const result=await account.authenticate(mode,{email,password,...(mode==='signup'?{name}:{})});if(result.verificationRequired){setPassword('');setMode('login');setMessage('Confira seu e-mail para confirmar a conta antes de entrar.');}else{notify(mode==='signup'?'Conta criada.':'Você entrou na sua conta.');navigate(safeNext(params.get('next')));}}
 }catch(failure){setError(failure.message||'Confira seus dados e tente novamente.');}finally{setBusy(false);}}

 if(account.sessionLoading)return <main className="loading-page" id="main"><Loader2 className="spin"/></main>;
 if(account.user&&!reset&&!confirmation)return <main className="account-page" id="main"><div className="section-eyebrow"><Cloud size={14}/> SEU ESPAÇO, EM QUALQUER LUGAR</div><h1>Bom ter você aqui,<br/><span>{account.user.name.split(' ')[0]}.</span></h1><p className="page-lead">Suas ideias e coleções acompanham a sua conta.</p><div className="account-panels"><section className="account-panel"><UserRound size={24}/><h2>Sua conta</h2><p>{account.user.name}</p><p>{account.user.email}</p><div className="sync-state"><Cloud size={15}/>{account.sync==='saving'?'Sincronizando…':account.sync==='saved'?'Coleções sincronizadas':account.sync==='loading'?'Carregando coleções…':'Confira sua conexão'}</div><button className="button" onClick={async()=>{try{await account.signOut();notify('Você saiu da conta.');}catch{setError('Não foi possível sair. Tente novamente.');}}}><LogOut size={15}/>Sair da conta</button></section><section className="account-panel"><Cloud size={24}/><h2>Suas ideias, organizadas</h2><p>{account.saved.length} favoritos salvos</p><p>{account.collections.length} coleções na sua conta</p><button className="button button-primary" onClick={()=>navigate('/collections')}><ArrowRight size={15}/>Abrir minhas coleções</button></section></div>{(error||account.error)&&<p className="form-error" role="alert">{error||account.error}</p>}{message&&<p className="form-success" role="status">{message}</p>}</main>;
 const title=mode==='confirm'?'Confirme seu acesso':mode==='resend'?'Reenviar confirmação':mode==='signup'?'Crie sua conta':mode==='forgot'?'Recuperar acesso':mode==='reset'?'Defina sua nova senha':'Entre na sua conta';
 const subtitle=mode==='signup'?'Suas melhores ideias começam aqui.':mode==='login'?'Seu universo de criação está esperando.':mode==='confirm'?'Só mais um passo para continuar.':mode==='reset'?'Escolha uma senha para o seu novo começo.':'Vamos ajudar você a voltar.';
 return <main className="account-page auth-layout auth-fuse" id="main">
  <section className="auth-form-side" aria-labelledby="auth-title">
   <div className="auth-card" key={mode}>
    <header className="auth-form-heading"><div className="auth-emblem" aria-hidden="true"><Layers3/></div><h1 id="auth-title">{title}</h1><p>{subtitle}</p></header>
    <form onSubmit={submit} aria-busy={busy}>
     {mode==='confirm'&&<p className="auth-confirm-copy">Confirme para continuar no nitido. Este link será usado uma única vez.</p>}
     {mode==='signup'&&<label htmlFor="auth-name">Nome completo<input id="auth-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" required maxLength={100} disabled={busy}/></label>}
     {!['reset','confirm'].includes(mode)&&<label htmlFor="auth-email">E-mail<span className="auth-email-input"><Mail aria-hidden="true"/><input id="auth-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" required disabled={busy}/></span></label>}
     {!['forgot','resend','confirm'].includes(mode)&&<div className="auth-password-field">
      <label htmlFor="auth-password">Senha</label>
      <div className="auth-password-input"><LockKeyhole className="auth-field-icon" aria-hidden="true"/><input id="auth-password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='login'?'Sua senha':'Crie uma senha segura'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?undefined:12} aria-describedby={mode==='login'?undefined:'auth-password-hint'} required disabled={busy}/><button type="button" className="auth-password-toggle" aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)} disabled={busy}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
      {mode!=='login'&&<small id="auth-password-hint">Use pelo menos 12 caracteres.</small>}
     </div>}
     {(error||account.sessionError)&&<p className="form-error" role="alert">{error||account.sessionError}</p>}
     {message&&<p className="form-success" role="status"><Mail size={16}/>{message}</p>}
     <button className="button auth-submit" disabled={busy}>{busy&&<Loader2 className="spin" size={15}/>} {mode==='confirm'?'Confirmar e continuar':mode==='resend'?'Reenviar e-mail':mode==='signup'?'Criar conta':mode==='forgot'?'Enviar instruções':mode==='reset'?'Salvar nova senha':'Entrar'}{!busy&&<ArrowRight aria-hidden="true"/>}</button>
    </form>
    <div className="auth-links">
     {mode==='login'?<><p>Ainda não tem uma conta? <button type="button" onClick={()=>changeMode('signup')} disabled={busy}>Criar uma conta</button></p><div className="auth-support-links"><button type="button" onClick={()=>changeMode('forgot')} disabled={busy}><KeyRound aria-hidden="true"/>Esqueci minha senha</button><span aria-hidden="true" className="auth-support-divider"/><button type="button" onClick={()=>changeMode('resend')} disabled={busy}><Mail aria-hidden="true"/>Reenviar confirmação</button></div></>:<p>{mode==='signup'?'Já tem uma conta? ':''}<button type="button" onClick={()=>changeMode('login')} disabled={busy}>{mode==='signup'?'Entrar':'Voltar para entrar'}</button></p>}
    </div>
   </div>
  </section>
  <AuthIllustration mode={mode}/>
 </main>;
}
