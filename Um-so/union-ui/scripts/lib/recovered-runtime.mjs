/** Minimal runtime for retained public Turbopack factories. No network loader. */
export function createRecoveredRuntime(factories,globalObject=globalThis){
 const cache=Object.create(null);
 const record=id=>cache[id]||(cache[id]={id,exports:{},loaded:false,loading:false});
 function context(id){const module=record(id);return {
  g:globalObject,m:module,c:cache,
  r:load,i:namespace,
  s(values,target=id){const entry=record(target);for(let i=0;i<values.length;){const name=values[i++],kind=values[i++];const descriptor=kind===0?{value:values[i++],writable:false}:{get:kind};if(!Object.hasOwn(entry.exports,name))Object.defineProperty(entry.exports,name,{...descriptor,enumerable:true,configurable:true});}Object.defineProperty(entry.exports,'__esModule',{value:true,configurable:true});entry.loaded=true;},
  v(value,target=id){const entry=record(target);entry.exports=value;entry.loaded=true;},
  j(value){Object.assign(module.exports,value);},
  l(){return Promise.resolve();},
  async A(target){const factory=load(target);return typeof factory==='function'?factory(namespace):namespace(target);},
  n(value,target=id){const entry=record(target);entry.exports=value;entry.loaded=true;},
 };
 }
 function load(id){const entry=record(id);if(entry.loaded||entry.loading)return entry.exports;const factory=factories[id];if(!factory)throw Error('Retained module not found: '+id);entry.loading=true;try{factory(context(id),entry,entry.exports);entry.loaded=true;return entry.exports;}finally{entry.loading=false;}}
 function namespace(id){const value=load(id);if(value?.__esModule)return value;if(record(id).namespace)return record(id).namespace;const result={};if(value!=null)for(const key of Object.keys(Object(value)))Object.defineProperty(result,key,{enumerable:true,get:()=>record(id).exports[key]});Object.defineProperty(result,'default',{enumerable:true,get:()=>record(id).exports});record(id).namespace=result;return result;}
 return {load,namespace,context,cache};
}
export function deduplicateRecoveredItems(existing,incoming){
 const ids=new Set(existing.map(x=>x.id)),fingerprints=new Set(existing.map(x=>x.recoveryFingerprint).filter(Boolean));const accepted=[],skipped=[];
 for(const item of incoming){const reason=ids.has(item.id)?'existing-id':item.recoveryFingerprint&&fingerprints.has(item.recoveryFingerprint)?'identical-implementation':null;if(reason){skipped.push({id:item.id,reason});continue;}ids.add(item.id);if(item.recoveryFingerprint)fingerprints.add(item.recoveryFingerprint);accepted.push(item);}
 return {accepted,skipped};
}
