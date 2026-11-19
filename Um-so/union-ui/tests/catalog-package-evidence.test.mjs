import test from'node:test';import assert from'node:assert/strict';import{packageEvidence}from'../scripts/lib/catalog-package-evidence.mjs';
const source='export function Surface(){return <section className="surface"><h1>Actual component source with enough content for a standalone identity</h1><button>Continue</button></section>}',row={name:'Surface',framework:'react',license:'MIT',kind:'component',category:'Cards'},payload={files:[{path:'surface.tsx',content:source}],dependencies:['react']};
test('package equality retains entry, license, framework, dependency, demo and variant distinctions',()=>{
 const base=packageEvidence(row,payload);assert.ok(base.packageHash);assert.equal(packageEvidence({...row,id:'alias'},payload).packageHash,base.packageHash);
 for(const change of [{name:'Different entry'},{license:'MIT + Commons Clause'},{framework:'vue'},{dependencies:['motion']},{variants:[{name:'Other example'}]}])assert.notEqual(packageEvidence({...row,...change},payload).packageHash,base.packageHash);
 assert.notEqual(packageEvidence(row,{...payload,demoCode:'Different props'}).packageHash,base.packageHash);
 assert.equal(packageEvidence(row,{...payload,files:[{path:'surface.tsx',content:source+'\r\n'}]}).packageHash,base.packageHash);
});
test('similar primary tokens do not certify package/runtime equivalence and helpers do not create families',()=>{
 const base=packageEvidence(row,payload),other=packageEvidence({...row,license:'Source terms'},{...payload,demoCode:'Other demo'});assert.equal(base.primaryHash,other.primaryHash);assert.notEqual(base.packageHash,other.packageHash);
 assert.equal(packageEvidence(row,{files:[{path:'lib/utils.tsx',content:source}]}),null);
 assert.equal(packageEvidence(row,{files:[{path:'demo.tsx',content:source}]}),null);
});
