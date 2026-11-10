import Brand from './Brand.jsx';
import StarBorder from './StarBorder.jsx';
import React,{useState,useEffect,useRef} from 'react';
import {ArrowRight,Check,Loader2,LogOut,Cloud,Mail,UserRound,Eye,EyeOff,LockKeyhole,KeyRound} from 'lucide-react';
import AuthIllustration from './AuthIllustration.jsx';
import PrivacyPanel from './PrivacyPanel.jsx';
import {api} from './account.js';
import {safeNext} from './auth-policy.js';
import {PASSWORD_MIN_LENGTH,PASSWORD_REQUIREMENTS,validNewPassword} from './password-policy.js';
import {accountLocale,accountText,accountError} from './account-locale.js';
import './account.css';
export function PlansPage({navigate}){return <main className="account-page" id="main"><span className="section-eyebrow">nitido</span><h1>Um espaço inteiro<br/><span>para criar.</span></h1><p className="page-lead">O acesso a esta versão está liberado. Explore as ferramentas e guarde suas ideias nas coleções.</p><button className="button button-primary" onClick={()=>navigate('/tools')}><ArrowRight size={15}/>Explorar ferramentas</button></main>;}
const callbackMessages={confirmation_browser:'Não foi possível concluir a entrada automática neste navegador. Seu e-mail pode já estar confirmado: entre com sua senha. Se ainda precisar confirmar, solicite um novo e-mail.',confirmation_link:'Esse link não pôde ser validado. Entre com sua senha ou solicite um novo e-mail de confirmação.',recovery_link:'Não foi possível validar a recuperação neste navegador. Solicite novas instruções abaixo.'};
export default function AccountPage({account,navigate,notify,path='/account',search=''}){
 const [locale,setLocale]=useState(()=>{try{return accountLocale(search,window.localStorage);}catch{return accountLocale(search);}});
 const formRef=useRef(null);
 const [termsAccepted,setTermsAccepted]=useState(false);
 useEffect(()=>{for(const input of formRef.current?.elements||[])input.setCustomValidity?.('');},[locale]);
 const t=text=>accountText(locale,text),displayError=text=>accountError(locale,text);
 useEffect(()=>{const requested=new URLSearchParams(search).get('lang');if(['en','pt','pt-BR'].includes(requested))setLocale(requested==='en'?'en':'pt-BR');},[search]);
 useEffect(()=>{try{localStorage.setItem('nitido:locale',locale);}catch{}},[locale]);
 const params=new URLSearchParams(search);const reset=path==='/account/reset',confirmation=Boolean(params.get('token_hash'))&&['email','recovery'].includes(params.get('type')),callbackError=params.get('auth_error');
 const initialMode=reset?'reset':confirmation?'confirm':callbackError==='recovery_link'?'forgot':'login';
 const [mode,setMode]=useState(initialMode),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(callbackMessages[callbackError]||''),[message,setMessage]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const languageSwitch=<div className="auth-links" role="group" aria-label={locale==='en'?'Language':'Idioma'}><button type="button" aria-label="Português" aria-pressed={locale==='pt-BR'} onClick={()=>{setLocale('pt-BR');setError('');setMessage('');}} disabled={busy}>PT</button><span aria-hidden="true"> / </span><button type="button" aria-label="English" aria-pressed={locale==='en'} onClick={()=>{setLocale('en');setError('');setMessage('');}} disabled={busy}>EN</button></div>;
 useEffect(()=>{setMode(initialMode);setError(callbackMessages[callbackError]||'');setMessage('');},[initialMode,callbackError]);
 useEffect(()=>{setShowPassword(false);},[mode]);
 const changeMode=next=>{setMode(next);setError('');setMessage('');setPassword('');};

 async function submit(event){event.preventDefault();setError('');setMessage('');
 const submittedPassword=event.currentTarget.elements.namedItem('password')?.value??'';
 if((mode==='signup'||mode==='reset')&&!validNewPassword(submittedPassword)){setError(PASSWORD_REQUIREMENTS);return;}
 setBusy(true);try{
  if(mode==='confirm'){const result=await api('/api/auth/verify-email',{method:'POST',body:{tokenHash:params.get('token_hash'),type:params.get('type')}});const user=await account.refreshSession();if(!user)throw Error(t("Não foi possível concluir sua entrada. Entre com sua senha."));await account.refreshAccess();notify(t("Link confirmado."));navigate(safeNext(result.next));}
  else if(mode==='resend'){await api('/api/auth/resend-confirmation',{method:'POST',body:{email}});setMessage(t("Se a conta ainda precisar de confirmação, você receberá um novo e-mail. Se já confirmou, entre com sua senha."));}
  else if(mode==='forgot'){await api('/api/auth/request-password-reset',{method:'POST',body:{email,redirectTo:window.location.origin+'/account/reset'}});setMessage(t("Se houver uma conta com esse e-mail, você receberá as instruções para redefinir a senha."));}
  else if(mode==='reset'){await api('/api/auth/reset-password',{method:'POST',body:{token:params.get('token'),newPassword:submittedPassword}});await account.refreshSession();setPassword('');setMode('login');setMessage(t("Senha alterada. Entre com a nova senha."));}
  else{const result=await account.authenticate(mode,{email,password:submittedPassword,...(mode==='signup'?{name,termsAccepted,policyVersion:'2026-11-09'}:{})});if(result.verificationRequired){setPassword('');setMode('login');setMessage(t("Confira seu e-mail para confirmar a conta antes de entrar."));}else{notify(mode==='signup'?t("Conta criada."):t("Você entrou na sua conta."));navigate(safeNext(params.get('next')));}}
 }catch(failure){setError(failure.message||t("Confira seus dados e tente novamente."));}finally{setBusy(false);}}

 if(account.sessionLoading)return <main className="loading-page" id="main"><Loader2 className="spin"/></main>;
 if(account.user&&!reset&&!confirmation)return <main className="account-page" id="main" lang={locale}>{languageSwitch}<div className="section-eyebrow"><Cloud size={14}/>{t(" SEU ESPAÇO, EM QUALQUER LUGAR")}</div><h1>{t("Bom ter você aqui,")}<br/><span>{account.user.name.split(' ')[0]}.</span></h1><p className="page-lead">{t("Suas ideias e coleções acompanham a sua conta.")}</p><p><a className="button" href={'/plans?lang='+locale}>{locale==='en'?'Plans and subscription':'Planos e assinatura'}<ArrowRight size={15}/></a></p><div className="account-panels"><section className="account-panel"><UserRound size={24}/><h2>{t("Sua conta")}</h2><p>{account.user.name}</p><p>{account.user.email}</p><div className="sync-state"><Cloud size={15}/>{account.sync==='saving'?t("Sincronizando…"):account.sync==='saved'?t("Coleções sincronizadas"):account.sync==='loading'?t("Carregando coleções…"):t("Confira sua conexão")}</div><button className="button" onClick={async()=>{try{await account.signOut();notify(t("Você saiu da conta."));}catch{setError(t("Não foi possível sair. Tente novamente."));}}}><LogOut size={15}/>{t("Sair da conta")}</button></section><section className="account-panel"><Cloud size={24}/><h2>{t("Suas ideias, organizadas")}</h2><p>{account.saved.length}{t(" favoritos salvos")}</p><p>{account.collections.length}{t(" coleções na sua conta")}</p><button className="button button-primary" onClick={()=>navigate('/collections')}><ArrowRight size={15}/>{t("Abrir minhas coleções")}</button></section></div><PrivacyPanel account={account}/>{(error||account.error)&&<p className="form-error" role="alert">{displayError(error||account.error)}</p>}{message&&<p className="form-success" role="status">{message}</p>}</main>;
 const title=mode==='confirm'?t("Confirme seu acesso"):mode==='resend'?t("Reenviar confirmação"):mode==='signup'?t("Crie sua conta"):mode==='forgot'?t("Recuperar acesso"):mode==='reset'?t("Defina sua nova senha"):t("Entre na sua conta");
 const subtitle=mode==='signup'?t("Suas melhores ideias começam aqui."):mode==='login'?t("Seu universo de criação está esperando."):mode==='confirm'?t("Só mais um passo para continuar."):mode==='reset'?t("Escolha uma senha para o seu novo começo."):t("Vamos ajudar você a voltar.");
 return <main className="account-page auth-layout auth-fuse" id="main" lang={locale}>
  <section className="auth-form-side" aria-labelledby="auth-title">
   <div className="auth-card" key={mode}>
    <header className="auth-form-heading"><div className="auth-emblem" aria-hidden="true"><Brand iconOnly/></div><h1 id="auth-title">{title}</h1><p>{subtitle}</p></header>
    <form ref={formRef} onSubmit={submit} aria-busy={busy} onInvalid={event=>{if(locale!=='en')return;const input=event.target;input.setCustomValidity(input.validity.valueMissing?'Please fill out this field.':input.validity.typeMismatch?'Please enter a valid email address.':input.validity.tooShort?t(PASSWORD_REQUIREMENTS):'Please check this field.');}} onInput={event=>event.target.setCustomValidity?.('')}>
     {mode==='confirm'&&<p className="auth-confirm-copy">{t("Confirme para continuar no nitido. Este link será usado uma única vez.")}</p>}
     {mode==='signup'&&<label htmlFor="auth-name">{t("Nome completo")}<input id="auth-name" value={name} onChange={e=>setName(e.target.value)} placeholder={t("Como podemos chamar você?")} autoComplete="name" required maxLength={100} disabled={busy}/></label>}
     {!['reset','confirm'].includes(mode)&&<label htmlFor="auth-email">{t("E-mail")}<span className="auth-email-input"><Mail aria-hidden="true"/><input id="auth-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("voce@exemplo.com")} autoComplete="email" required disabled={busy}/></span></label>}
     {!['forgot','resend','confirm'].includes(mode)&&<div className="auth-password-field">
      <label htmlFor="auth-password">{t("Senha")}</label>
      <div className="auth-password-input"><LockKeyhole className="auth-field-icon" aria-hidden="true"/><input id="auth-password" name="password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='login'?t("Sua senha"):t("Crie uma senha segura")} autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?undefined:PASSWORD_MIN_LENGTH} aria-describedby={mode==='login'?undefined:'auth-password-hint'} required disabled={busy}/><button type="button" className="auth-password-toggle" aria-label={showPassword?t("Ocultar senha"):t("Mostrar senha")} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)} disabled={busy}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
      {mode!=='login'&&<small id="auth-password-hint">{t(PASSWORD_REQUIREMENTS)}</small>}
     </div>}
     {mode==='signup'&&<label className="auth-policy-ack"><input type="checkbox" required checked={termsAccepted} onChange={event=>setTermsAccepted(event.target.checked)} disabled={busy}/>{locale==='en'?'I accept the ':'Li e aceito os '}<a href="/legal/terms" target="_blank" rel="noopener noreferrer">{locale==='en'?'Terms':'Termos'}</a>{locale==='en'?' and have read the ':' e li a '}<a href="/legal/privacy" target="_blank" rel="noopener noreferrer">{locale==='en'?'Privacy Notice':'Política de Privacidade'}</a>.</label>}
     {(error||account.sessionError)&&<p className="form-error" role="alert">{displayError(error||account.sessionError)}</p>}
     {message&&<p className="form-success" role="status"><Mail size={16}/>{message}</p>}
     <StarBorder type="submit" className="button auth-submit" theme="light" color="#fff" trailColor="#a5d3ff" backgroundColor="#7137dc" textColor="#fff" radius={28} glow={.15} disabled={busy}>{busy&&<Loader2 className="spin" size={15}/>} {mode==='confirm'?t("Confirmar e continuar"):mode==='resend'?t("Reenviar e-mail"):mode==='signup'?t("Criar conta"):mode==='forgot'?t("Enviar instruções"):mode==='reset'?t("Salvar nova senha"):t("Entrar")}{!busy&&<ArrowRight aria-hidden="true"/>}</StarBorder>
    </form>
    <div className="auth-links">
     {mode==='login'?<><p>{t("Ainda não tem uma conta? ")}<button type="button" onClick={()=>changeMode('signup')} disabled={busy}>{t("Criar uma conta")}</button></p><div className="auth-support-links"><button type="button" onClick={()=>changeMode('forgot')} disabled={busy}><KeyRound aria-hidden="true"/>{t("Esqueci minha senha")}</button><span aria-hidden="true" className="auth-support-divider"/><button type="button" onClick={()=>changeMode('resend')} disabled={busy}><Mail aria-hidden="true"/>{t("Reenviar confirmação")}</button></div></>:<p>{mode==='signup'?t("Já tem uma conta? "):''}<button type="button" onClick={()=>changeMode('login')} disabled={busy}>{mode==='signup'?t("Entrar"):t("Voltar para entrar")}</button></p>}
    </div>
    <p className="auth-policy-links"><a href="/legal/privacy">Privacidade</a> · <a href="/legal/terms">Termos</a> · <a href="/legal/cookies">Cookies</a></p>
    {languageSwitch}
   </div>
  </section>
  <AuthIllustration locale={locale}/>
 </main>;
}
