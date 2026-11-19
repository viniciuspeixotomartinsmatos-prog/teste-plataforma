// Restore editable source; publishing always creates a new reviewed snapshot.
export function restoreCreatorVersion(drafts,source,newId){
 const current=drafts.find(draft=>draft.id===source.id),own=Boolean(current);
 const editable=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!['analysis','publication','nitidoVersion','status','exportedAt'].includes(key)).sort(([a],[b])=>a<b?-1:a>b?1:0));
 const needsBackup=own&&JSON.stringify(editable(current))!==JSON.stringify(editable(source));
 if((!own||needsBackup)&&drafts.length>=20)throw Error('Limite de 20 rascunhos. Exporte ou remova um antes de criar outra variante.');
 const {analysis,publication,nitidoVersion,...original}=source;
 const draft={...structuredClone(original),id:own?source.id:newId,status:'draft',rightsConfirmed:own&&source.rightsConfirmed===true};
 if(!own)draft.name=(draft.name+' · variante').slice(0,100);
 const next=own?drafts.map(value=>value.id===draft.id?draft:value):[...drafts,draft];
 if(needsBackup)next.push({...structuredClone(current),id:newId,name:(current.name+' · antes da restauração').slice(0,100),status:'draft'});
 return {drafts:next,id:draft.id,restored:own};
}
