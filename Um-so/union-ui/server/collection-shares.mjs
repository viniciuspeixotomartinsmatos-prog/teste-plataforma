import {randomBytes,createHash} from 'node:crypto';
import fs from 'node:fs/promises';
const failure=(status,message,code)=>Object.assign(Error(message),{status,code});
export const digestShare=token=>{if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))throw failure(404,'Este link não está disponível.','share_not_found');return createHash('sha256').update(token).digest('hex');};
export function shareId(value){if(typeof value!=='string'||!value||value.length>100)throw failure(400,'Coleção inválida.');return value;}
export const newShare=()=>{const token=randomBytes(32).toString('hex');return{token,hash:digestShare(token)};};
let catalog;
export async function projectSharedCollection(collection,{offset=0}={}){
 if(!Number.isSafeInteger(offset)||offset<0||offset>20000)throw failure(400,'Página inválida.');
 if(!collection||!Array.isArray(collection.items))throw failure(404,'Este link não está disponível.','share_not_found');
 catalog??=fs.readFile(new URL('../public/data/catalog-live.json',import.meta.url),'utf8').then(JSON.parse).catch(error=>{catalog=null;throw error;});
 const rows=new Map((await catalog).map(row=>[row.id,row]));
 const known=[...new Set(collection.items.filter(id=>typeof id==='string'))].slice(0,20000).map(id=>rows.get(id)).filter(Boolean);
 return{total:known.length,nextOffset:offset+96<known.length?offset+96:null,name:String(collection.name||'Coleção').slice(0,80),description:String(collection.description||'').slice(0,1000),items:known.slice(offset,offset+96).map(row=>({name:row.name,category:row.category,href:'/component/'+encodeURIComponent(row.publicSlug||row.id)}))};
}
export function sqliteShareStore(db){
 db.exec(`CREATE TABLE IF NOT EXISTS collection_share(user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,collection_id TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL,PRIMARY KEY(user_id,collection_id)); CREATE TRIGGER IF NOT EXISTS revoke_removed_local_shares AFTER UPDATE OF data ON workspace BEGIN DELETE FROM collection_share WHERE user_id=NEW.user_id AND collection_id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(NEW.data,'$.collections')); END;`);
 return{
  workspace:user=>{const row=db.prepare('SELECT data FROM workspace WHERE user_id=?').get(user);return row?JSON.parse(row.data):{collections:[]};},
  async write(user,id,hash){db.prepare('INSERT INTO collection_share VALUES(?,?,?,?) ON CONFLICT(user_id,collection_id) DO UPDATE SET token_hash=excluded.token_hash,created_at=excluded.created_at').run(user,id,hash,new Date().toISOString());},
  async revoke(user,id){db.prepare('DELETE FROM collection_share WHERE user_id=? AND collection_id=?').run(user,id);},
  async read(hash){const row=db.prepare('SELECT w.data,s.collection_id FROM collection_share s JOIN workspace w ON w.user_id=s.user_id WHERE token_hash=?').get(hash);return row?JSON.parse(row.data).collections.find(c=>c.id===row.collection_id):null;}
 };
}
export function supabaseShareStore(client){const checked=result=>{if(result.error)throw failure(503,'Compartilhamento indisponível. Tente novamente.','share_unavailable');return result.data;};return{
 async workspace(user){return checked(await client.from('workspaces').select('data').eq('user_id',user).maybeSingle())?.data||{collections:[]};},
 async write(user,id,hash){checked(await client.from('collection_shares').upsert({user_id:user,collection_id:id,token_hash:hash,created_at:new Date().toISOString()},{onConflict:'user_id,collection_id'}));},
 async revoke(user,id){checked(await client.from('collection_shares').delete().eq('user_id',user).eq('collection_id',id));},
 async read(hash){return checked(await client.rpc('read_shared_collection',{lookup_hash:hash}));}
 };}
export async function handleCollectionShare(request,{store,requireUser,origin,readBody}){
 const route=new URL(request.url).pathname;
 if(route==='/api/sharing/config'){if(request.method!=='GET')throw failure(405,'Método não permitido.');try{await store.read('0'.repeat(64));return{enabled:true};}catch{return{enabled:false};}}
 if(route==='/api/shared-collection'){
  if(request.method!=='POST')throw failure(405,'Método não permitido.');
  const input=await readBody();return projectSharedCollection(await store.read(digestShare(input.token)),{offset:input.offset??0});
 }
 if(!['POST','DELETE'].includes(request.method))throw failure(405,'Método não permitido.');
 const user=await requireUser(),input=await readBody(),id=shareId(input.collectionId);
 if(request.method==='DELETE'){await store.revoke(user.id,id);return{ok:true};}
 const workspace=await store.workspace(user.id);
 if(!workspace.collections.some(c=>c.id===id))throw failure(404,'Coleção não encontrada.');
 const {token,hash}=newShare();await store.write(user.id,id,hash);
 return{url:origin+'/shared#'+token};
}
