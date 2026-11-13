import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
import {componentArchive, componentPrompt} from '../../src/component-export.js';

const [url, selection, checkpoint, retry] = process.argv.slice(2);
if (!url || !selection || !checkpoint) throw Error('Informe URL local, seleção e arquivo de checkpoint.');
const origin = new URL(url).origin;
if (new URL(origin).hostname !== '127.0.0.1') throw Error('Use o servidor local da auditoria.');
const nativeFetch = globalThis.fetch;
const session = await nativeFetch(origin + '/api/auth/sign-in/email', {
 method: 'POST', headers: {origin, 'Content-Type': 'application/json'},
 body: JSON.stringify({email: 'runtime-audit@example.test', password: process.env.NITIDO_AUDIT_PASSWORD})
});
if (!session.ok) throw Error('Não foi possível entrar com a conta sintética.');
const cookie = session.headers.getSetCookie().map(line => line.split(';')[0]).join('; ');
const commonResources = new Map();
globalThis.fetch = (input, options = {}) => {
 const target = new URL(input, origin);
 if (target.origin !== origin) throw Error('Recurso externo não baixado durante a inspeção do pacote.');
 const headers = new Headers(options.headers);
 headers.set('cookie', cookie);
 const request = async () => {
  try {
   return await nativeFetch(target, {...options, headers, signal: AbortSignal.timeout(20000)});
  } catch (error) {
   if (options.signal?.aborted) throw error;
   return nativeFetch(target, {...options, headers, signal: AbortSignal.timeout(20000)});
  }
 };
 const cacheable = !options.method && (/^\/licenses\//.test(target.pathname) || /^\/assets\/fonts\//.test(target.pathname) || target.pathname === '/assets/preview.css' || target.pathname === '/data/recovered-demo-assets.json');
 if (!cacheable) return request();
 const key = target.href;
 if (!commonResources.has(key)) {
  commonResources.set(key, request().then(async response => ({status: response.status, headers: response.headers, bytes: await response.arrayBuffer()})).catch(error => {
   commonResources.delete(key);
   throw error;
  }));
 }
 return commonResources.get(key).then(({status, headers, bytes}) => new Response(bytes, {status, headers}));
};

const selected = new Set(JSON.parse(await fs.readFile(selection, 'utf8')));
const catalog = await (await fetch('/data/catalog-live.json')).json();
const previous = await fs.readFile(checkpoint, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
const prior = new Map(previous.split('\n').filter(Boolean).map(line => {
 const row = JSON.parse(line);
 return [row.id, row];
}));
const finished = new Set([...prior.values()].filter(row => retry !== '--retry-failures' || row.passed).map(row => row.id));
const rows = catalog.filter(row => selected.has(row.id) && !finished.has(row.id));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
console.log(`${rows.length} pacotes na fila.`);
let cursor = 0;
let saving = Promise.resolve();
async function audit(item) {
 const row = {id: item.id, checkedAt: new Date().toISOString()};
 try {
  const route = await fetch('/component/' + encodeURIComponent(item.publicSlug || item.slug), {method: 'HEAD', headers: {Accept: 'text/html'}});
  row.routeStatus = route.status;
  if (!route.ok || !route.headers.get('content-type')?.startsWith('text/html')) throw Error('Rota da página indisponível.');
  let payload;
  if (item.codePath) {
   const response = await fetch(item.codePath);
   if (!response.ok) throw Error('Código indisponível: HTTP ' + response.status);
   payload = await response.json();
  }
  const prompt = await componentPrompt(item, payload);
  if (!prompt.trim()) throw Error('Prompt vazio.');
  row.prompt = {bytes: Buffer.byteLength(prompt), sha256: digest(prompt)};
  const zip = await componentArchive(item, payload);
  const files = unzipSync(zip);
  if (!files['README.md']?.length || !files['LICENSE-NOTICES.md']?.length || !files['preview.html']?.length) {
   throw Error('O ZIP não contém prévia, instruções ou avisos.');
  }
  row.zip = {bytes: zip.byteLength, files: Object.keys(files).length, sha256: digest(zip)};
  row.passed = true;
 } catch (error) {
  row.passed = false;
  row.error = String(error.message).slice(0, 350);
 }
 const write = saving.then(() => fs.appendFile(checkpoint, JSON.stringify(row) + '\n'));
 saving = write.catch(() => {});
 await write;
 finished.add(item.id);
 if (finished.size % 100 === 0) console.log(`${finished.size} pacotes registrados.`);
}
await Promise.all(Array.from({length: 3}, async () => {
 while (cursor < rows.length) await audit(rows[cursor++]);
}));
