import {useState,useEffect,useRef,useCallback} from 'react';
import {safeStored} from './catalog.js';
export async function api(path,{method='GET',body}={}){
 const response=await fetch(path,{method,credentials:'same-origin',...(body!==undefined?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(new Error(data.error?.message||data.error||data.message||'Não foi possível concluir.'),{status:response.status,code:data.code});
 return data;
}
const empty={saved:[],collections:[]};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function mergeList(base,local,remote){const old=new Set(base),now=new Set(local),removed=new Set(base.filter(x=>!now.has(x)));return [...new Set([...remote.filter(x=>!removed.has(x)),...local.filter(x=>!old.has(x))])];}
export function mergeWorkspace(base,local,remote){
 const before=new Map(base.collections.map(c=>[c.id,c])),current=new Map(local.collections.map(c=>[c.id,c])),merged=new Map(remote.collections.map(c=>[c.id,c]));
 for(const id of before.keys())if(!current.has(id))merged.delete(id);
 for(const [id,collection]of current){const initial=before.get(id),other=merged.get(id);if(!initial){merged.set(id,collection);continue;}if(!other){if(!equal(initial,collection))merged.set(id,collection);continue;}merged.set(id,{...other,name:initial.name===collection.name?other.name:collection.name,items:mergeList(initial.items,collection.items,other.items)});}
 return{saved:mergeList(base.saved,local.saved,remote.saved),collections:[...merged.values()]};
}
export function useAccountWorkspace(){
 const [user,setUser]=useState(null),[sessionLoading,setSessionLoading]=useState(true),[sync,setSync]=useState('local'),[error,setError]=useState('');
 const [access,setAccess]=useState({canExport:true,requiresSubscription:false,billingMode:'unconfigured',subscription:null});
 const guest=useRef({saved:safeStored('union:saved:v1',[]),collections:safeStored('union:collections:v1',[])});
 const [workspace,setWorkspace]=useState(guest.current),[workspaceOwner,setWorkspaceOwner]=useState(null);const current=useRef(workspace);current.current=workspace;
 const owner=useRef(null),base=useRef(empty),revision=useRef(0),ready=useRef(false),queue=useRef(Promise.resolve());
 const refreshAccess=useCallback(async()=>{try{const data=await api('/api/access');setAccess(data);return data;}catch{return null;}},[]);
 const refreshSession=useCallback(async()=>{try{const session=await api('/api/auth/get-session');setUser(session?.user||null);return session?.user||null;}catch{setUser(null);return null;}finally{setSessionLoading(false);}},[]);
 useEffect(()=>{refreshSession();refreshAccess();},[refreshSession,refreshAccess]);
 useEffect(()=>{
  let active=true;ready.current=false;owner.current=user?.id||null;setError('');
  if(!user){setWorkspace(guest.current);setWorkspaceOwner(null);base.current=empty;revision.current=0;setSync('local');return;}
  setWorkspace(empty);setWorkspaceOwner(null);setSync('loading');
  api('/api/workspace').then(result=>{if(!active)return;const cached=safeStored('union:account:'+user.id+':v1',null);base.current=result.data;revision.current=result.revision;const restored=cached?.pending&&cached.base?mergeWorkspace(cached.base,cached.data,result.data):result.revision===0?mergeWorkspace(empty,guest.current,result.data):result.data;setWorkspace(restored);setWorkspaceOwner(user.id);ready.current=true;setSync('saved');}).catch(()=>{if(active){const cached=safeStored('union:account:'+user.id+':v1',null);if(cached?.data){setWorkspace(cached.data);setWorkspaceOwner(user.id);base.current=cached.base||empty;}setSync('error');setError('Não foi possível carregar suas coleções. Recarregue para tentar novamente.');}});
  refreshAccess();return()=>{active=false;};
 },[user?.id,refreshAccess]);
 useEffect(()=>{
  if((user?.id||null)!==workspaceOwner)return;
  if(!user){guest.current=workspace;try{localStorage.setItem('union:saved:v1',JSON.stringify(workspace.saved));localStorage.setItem('union:collections:v1',JSON.stringify(workspace.collections));}catch{}return;}
  try{localStorage.setItem('union:account:'+user.id+':v1',JSON.stringify({data:workspace,base:base.current,revision:revision.current,pending:!equal(workspace,base.current)}));}catch{}
  if(!ready.current||equal(workspace,base.current))return;
  const userId=user.id;setSync('saving');
  const timer=setTimeout(()=>{queue.current=queue.current.catch(()=>{}).then(async()=>{
   if(owner.current!==userId)return;
   const local=current.current;if(equal(local,base.current)){setSync('saved');return;}
   let candidate=local;
   for(let attempt=0;attempt<3;attempt++)try{
    const result=await api('/api/workspace',{method:'PUT',body:{revision:revision.current,data:candidate}});
    if(owner.current!==userId)return;
    const updated=mergeWorkspace(local,current.current,result.data);base.current=result.data;revision.current=result.revision;current.current=updated;setWorkspace(updated);setSync('saved');setError('');return;
   }catch(failure){
    if(failure.status===409&&attempt<2){const remote=await api('/api/workspace');candidate=mergeWorkspace(base.current,candidate,remote.data);base.current=remote.data;revision.current=remote.revision;continue;}
    if(owner.current===userId){setSync('error');setError('Suas alterações ainda não foram sincronizadas. Tente novamente.');}return;
   }
  });},450);
  return()=>clearTimeout(timer);
 },[workspace,user?.id,workspaceOwner]);
 const setSaved=useCallback(update=>setWorkspace(previous=>({...previous,saved:typeof update==='function'?update(previous.saved):update})),[]);
 const setCollections=useCallback(update=>setWorkspace(previous=>({...previous,collections:typeof update==='function'?update(previous.collections):update})),[]);
 const authenticate=useCallback(async(mode,fields)=>{await api(mode==='signup'?'/api/auth/sign-up/email':'/api/auth/sign-in/email',{method:'POST',body:fields});await refreshSession();await refreshAccess();},[refreshSession,refreshAccess]);
 const signOut=useCallback(async()=>{await api('/api/auth/sign-out',{method:'POST',body:{}});owner.current=null;ready.current=false;setUser(null);setWorkspace(guest.current);await refreshAccess();},[refreshAccess]);
 return{user,sessionLoading,saved:workspace.saved,collections:workspace.collections,setSaved,setCollections,authenticate,signOut,refreshSession,refreshAccess,access,sync,error};
}
