import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {createServer} from '../../server/start.mjs';
import {nodeRequest, nodeResponse} from '../../server/application-plugin.mjs';

const [root, output, port = '4411'] = process.argv.slice(2);
const password = process.env.NITIDO_AUDIT_PASSWORD;
if (!root || !output || !password) throw Error('Informe raiz, pasta de evidências e NITIDO_AUDIT_PASSWORD.');
const origin = `http://127.0.0.1:${Number(port)}`;
const batch = JSON.parse(await fs.readFile(path.join(root, 'tools/runtime-audit/batch.json'), 'utf8'));
if (!batch.sweep) throw Error('Gere a fila com --sweep antes de iniciar.');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog-live.json'), 'utf8'));
const ids = new Set(catalog.map(row => row.id));
await fs.mkdir(output, {recursive: true});
process.env.BILLING_ENABLED = 'false';
const {server, app} = await createServer({root, directory: output, database: ':memory:', production: false, billing: {}, origin, secret: randomBytes(32).toString('hex')});
const original = server.listeners('request')[0];
server.removeListener('request', original);

const states = new Map();
for (const viewport of ['desktop', 'mobile']) {
 const file = path.join(output, `${batch.commit}-${batch.catalogSha256.slice(0, 12)}-${viewport}.jsonl`);
 const text = await fs.readFile(file, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
 const rows = new Map(text.split('\n').filter(Boolean).map(line => {
  const row = JSON.parse(line);
  return [row.id, row];
 }));
 states.set(viewport, {file, rows, writing: Promise.resolve()});
}

server.on('request', async (req, res) => {
 const url = new URL(req.url, origin);
 if (url.pathname !== '/tools/runtime-audit/checkpoint') return original(req, res);
 const send = (body, status = 200) => nodeResponse(Response.json(body, {status, headers: {'Cache-Control': 'private, no-store'}}), res);
 try {
  const request = await nodeRequest(req, origin);
  if (!await app.isSignedIn(request)) return send({error: 'Sessão necessária.'}, 401);
  const state = states.get(url.searchParams.get('viewport') ?? 'desktop');
  if (!state) return send({error: 'Viewport inválido.'}, 400);
  if (req.method === 'GET') return send([...state.rows.values()]);
  if (req.method !== 'POST') return send({error: 'Método inválido.'}, 405);
  if (req.headers.origin !== origin) return send({error: 'Origem inválida.'}, 403);
  const rows = await request.json();
  if (!Array.isArray(rows) || rows.length > 20 || rows.some(row => !ids.has(row?.id) || typeof row.passed !== 'boolean')) {
   return send({error: 'Checkpoint inválido.'}, 400);
  }
  const persist = state.writing.then(async () => {
   await fs.appendFile(state.file, rows.map(row => JSON.stringify(row) + '\n').join(''));
   for (const row of rows) state.rows.set(row.id, row);
  });
  state.writing = persist.catch(() => {});
  await persist;
  return send({saved: state.rows.size});
 } catch (error) {
  return send({error: 'Falha ao processar checkpoint.'}, error.status || 500);
 }
});

await new Promise(resolve => server.listen(Number(port), '127.0.0.1', resolve));
const signup = await fetch(origin + '/api/auth/sign-up/email', {
 method: 'POST', headers: {origin, 'Content-Type': 'application/json'},
 body: JSON.stringify({name: 'Auditoria local', email: 'runtime-audit@example.test', password})
});
if (!signup.ok) { server.close(); throw Error('Não foi possível preparar a conta sintética.'); }
console.log(`Auditoria protegida em ${origin}/tools/runtime-audit/index.html`);
