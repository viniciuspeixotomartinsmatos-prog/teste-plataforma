import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const [output, ...reports] = process.argv.slice(2);
if (!output || !reports.length) throw Error('Informe o arquivo de saída e os relatórios anteriores.');
const catalog = JSON.parse(await fs.readFile('public/data/catalog-live.json', 'utf8'));
const previous = new Map();
for (const file of reports) {
 const report = JSON.parse(await fs.readFile(file, 'utf8'));
 for (const row of report.records || report.results || []) {
  previous.set(row.id, {
   passed: row.passed ?? row.browser?.result === 'passed',
   hash: row.sourceDocumentSha256
  });
 }
}
const remaining = [];
const publicRoot = path.resolve('public');
for (const item of catalog) {
 const prior = previous.get(item.id);
 if (prior?.passed && prior.hash) {
  const preview = (item.runtimePreviewPath || item.previewPath || '').split(/[?#]/)[0];
  const filename = path.resolve(publicRoot, '.' + preview);
  if (filename.startsWith(publicRoot + path.sep)) {
   const bytes = await fs.readFile(filename).catch(error => { if (error.code !== 'ENOENT') throw error; });
   if (bytes && createHash('sha256').update(bytes).digest('hex') === prior.hash) continue;
  }
 }
 remaining.push(item.id);
}
await fs.writeFile(output, JSON.stringify(remaining) + '\n');
console.log(JSON.stringify({total: catalog.length, reused: catalog.length - remaining.length, pending: remaining.length}));
