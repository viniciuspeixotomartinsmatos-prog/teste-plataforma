import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreCreatorVersion} from '../src/creator-versions.js';

test('restoration preserves immutable snapshots and unrelated drafts while forks need fresh rights confirmation',()=>{
 const saved=[{id:'own',source:'latest',name:'Own'}, {id:'other',source:'keep'}];
 const snapshot={id:'own',source:'previous',name:'Own',license:'MIT',rightsConfirmed:true,analysis:{score:100}};
 const restored=restoreCreatorVersion(saved,snapshot,'new');
 assert.equal(saved[0].source,'latest');assert.equal(restored.drafts[0].source,'previous');
 assert.equal(restored.drafts[1].source,'keep');assert.equal(restored.restored,true);assert.equal(restored.drafts[0].analysis,undefined);
 assert.equal(restored.drafts[2].source,'latest');assert.equal(restored.drafts[2].id,'new');
 restored.drafts[0].source='edited';assert.equal(snapshot.source,'previous');
 const fork=restoreCreatorVersion([],snapshot,'fork');
 assert.equal(fork.id,'fork');assert.equal(fork.drafts[0].rightsConfirmed,false);assert.equal(fork.drafts[0].license,'MIT');
 assert.throws(()=>restoreCreatorVersion(Array.from({length:20},(_,i)=>({id:String(i)})),snapshot,'new'),/Limite/);
});
