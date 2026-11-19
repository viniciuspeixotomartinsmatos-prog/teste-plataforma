import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveredRuntime,deduplicateRecoveredItems} from '../scripts/lib/recovered-runtime.mjs';

test('supports CommonJS, live ESM getters and exports assigned to aliased module IDs',()=>{
 const runtime=createRecoveredRuntime({1:(e,m)=>{m.exports={value:4};},2:e=>{let n=1;e.s(['next',()=>++n,'constant',0,7],2);e.s(['answer',0,e.r(1).value+e.i(2).constant],3);}});
 assert.equal(runtime.load(1).value,4);assert.equal(runtime.load(2).next,2);assert.equal(runtime.load(2).next,3);assert.equal(runtime.load(3).answer,11);
});
test('resolves dynamic module factories without fetching unrelated chunks',async()=>{
 const runtime=createRecoveredRuntime({1:e=>e.v(load=>e.l('already-retained.js').then(()=>load(2))),2:e=>e.s(['default',0,'demo'])});
 assert.equal((await runtime.context(1).A(1)).default,'demo');
 assert.throws(()=>runtime.load(999),/999/);
});
test('forwards an imported namespace through a compiled namespace bridge',()=>{
 const runtime=createRecoveredRuntime({1:e=>e.s(['default',0,'demo']),2:e=>e.n(e.i(1))});
 assert.equal(runtime.namespace(2).default,'demo');
});
test('does not discard distinct variants sharing a name; skips stable IDs and exact implementations',()=>{
 const existing=[{id:'old',name:'Aurora',recoveryFingerprint:'abc'}];
 const input=[{id:'old',name:'Other'},{id:'same-code',name:'Copy',recoveryFingerprint:'abc'},{id:'variant',name:'Aurora',recoveryFingerprint:'xyz'}];
 const result=deduplicateRecoveredItems(existing,input);
 assert.deepEqual(result.accepted.map(x=>x.id),['variant']);assert.equal(result.skipped.length,2);
});
