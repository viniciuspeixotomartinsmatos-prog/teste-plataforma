import {normalizeFraming} from '../src/preview-framing.js';

const fail = (status, message) => Object.assign(new Error(message), {status});

export async function catalogFraming(request, client, user, readBody) {
 if (request.method === 'GET') {
  const entries = [];
  let cursor = '';
  while (true) {
   const {data,error} = await client.from('catalog_preview_framing')
    .select('resource_id,settings').gt('resource_id',cursor).order('resource_id').limit(500);
   if (error) throw fail(503,'Os ajustes de enquadramento estão indisponíveis.');
   entries.push(...data.map(row=>[row.resource_id,row.settings]));
   if (data.length < 500) break;
   cursor = data.at(-1).resource_id;
  }
  return {overrides:Object.fromEntries(entries)};
 }
 if (request.method !== 'PUT') throw fail(405,'Método não permitido.');
 if (user.app_metadata?.nitido_moderator !== true) throw fail(403,'A edição é restrita à moderação.');
 const {id, settings:input} = await readBody();
 if (typeof id !== 'string' || !id.trim() || id.length>200 || /[\u0000-\u001f]/u.test(id) || !input || Array.isArray(input) || typeof input !== 'object') throw fail(400,'Recurso ou enquadramento inválido.');
 const {mode,point,customFit,zoom,safeArea,background,color,region} = normalizeFraming(input);
 const settings = {fit:mode,x:point[0],y:point[1],customFit,zoom,safeArea,background,color,region};
 const {error} = await client.rpc('save_catalog_preview_framing',{p_resource_id:id,p_settings:settings});
 if (error?.code === '42501') throw fail(403,'A edição é restrita à moderação.');
 if (error) throw fail(503,'Não foi possível salvar o enquadramento.');
 return {id,settings};
}
