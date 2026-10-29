import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeWorkspace} from '../src/account.js';
test('concurrent workspace changes retain remote additions and respect local removals and renames',()=>{
 const base={saved:['a','b'],collections:[{id:'one',name:'Antes',items:['a','b']},{id:'gone',name:'Excluir',items:[]}]};
 const local={saved:['b','c'],collections:[{id:'one',name:'Depois',items:['b','c']}]};
 const remote={saved:['a','b','d'],collections:[{id:'one',name:'Antes',items:['a','b','d']},{id:'gone',name:'Excluir',items:[]},{id:'new',name:'Outro dispositivo',items:['x']}]};
 const result=mergeWorkspace(base,local,remote);
 assert.deepEqual(new Set(result.saved),new Set(['b','c','d']));
 assert.deepEqual(result.collections.map(c=>c.id),['one','new']);
 assert.equal(result.collections[0].name,'Depois');assert.deepEqual(new Set(result.collections[0].items),new Set(['b','c','d']));
});
test('an unchanged local collection does not resurrect a remotely deleted collection',()=>{
 const initial={saved:[],collections:[{id:'one',name:'Um',items:['a']}]};
 assert.deepEqual(mergeWorkspace(initial,initial,{saved:[],collections:[]}),{saved:[],collections:[]});
});
