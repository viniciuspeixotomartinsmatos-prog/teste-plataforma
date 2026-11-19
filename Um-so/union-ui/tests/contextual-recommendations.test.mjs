import test from 'node:test';import assert from 'node:assert/strict';
import {designContext,rankContextualResources,contextualIntegrationPrompt} from '../src/contextual-recommendations.js';
import {designEvidence,designEvidenceMarkdown} from '../src/design-evidence.js';
const model={size:1,words:['form'],queries:btoa(String.fromCharCode(127)),documents:btoa(String.fromCharCode(127,0)),ids:['form','hero']};
const site={url:'https://example.com/',title:'Contact form',h1:['Hello'],design:{rendered:{computed:{originalScriptsExecuted:true,source:'rendered-public-browser',scope:'Real rendered fixture',structure:{headings:[{level:'H1',text:'Contact'}],forms:1,navigation:1},colors:[{value:'rgb(1, 2, 3)',count:2}],fonts:[],radii:[],spacing:[]}}}};
test('contextual recommendations combine actual structure and local semantic model without fabricating resource IDs',()=>{
 assert.equal(designContext(site).source,'rendered-public-browser');
 const catalog=[{id:'form',name:'Form',category:'AI & inputs',previewPath:'/form.html',publicSlug:'form-slug'},{id:'hero',name:'Hero',category:'Heroes',previewPath:'/hero.html'}];
 const ranked=rankContextualResources(site,catalog,model,{visual:[{id:'form'}]});assert.equal(ranked.length,2);assert.equal(ranked[0].resourceId,'form');assert.equal(ranked[0].id,'form-slug');assert.match(ranked[0].method,/local-lsa/);
 const prompt=contextualIntegrationPrompt(site,ranked[0]);assert.match(prompt,/rgb\(1, 2, 3\)/);assert.match(prompt,/Não copie nem execute/);assert.match(prompt,/não comprova equivalência/);
});
test('design export correctly identifies real script execution only when rendered evidence is present',()=>{
 assert.equal(designEvidence(site).originalScriptsExecuted,true);assert.match(designEvidenceMarkdown(site),/após JavaScript/);
 assert.equal(designEvidence({url:site.url,design:{computed:{colors:[]}}}).originalScriptsExecuted,false);
});
