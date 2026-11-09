import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Vercel routes nested auth and workspace requests through a concrete API entrypoint',async()=>{
 const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
 const rule=config.rewrites.find(r=>r.source==='/api/:path*');
 assert.equal(rule?.destination,'/api');
 assert.equal(config.rewrites.find(r=>r.source==='/billing')?.destination,'/index.html');
 const entry=await import('../api/index.js');
 const response=await entry.default.fetch(new Request('https://platform.example/api/auth/get-session'));
 assert.equal(response.status,503);
 assert.equal((await response.json()).code,'auth_setup_required');
});
