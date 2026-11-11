import test from 'node:test';
import assert from 'node:assert/strict';
import {communityPath,communityTarget,renderCommunity} from '../server/community-pages.mjs';
import {protectedPath} from '../src/auth-policy.js';
import {community} from '../server/community.mjs';

const id='00000000-0000-4000-8000-000000000001';
test('public community paths are explicit, escaped and canonical without exposing private source',async()=>{
 assert.equal(communityPath('/community/component/'+id),true);
 assert.equal(protectedPath('/community/component/'+id),false);
 assert.equal(protectedPath('/community/admin'),true);
 assert.equal(protectedPath('/data/creator-runtime/react.js'),true);
 assert.throws(()=>communityTarget(new URL('https://example.test/community?offset=-1')));
 assert.throws(()=>communityTarget(new URL('https://example.test/community?kind=unknown')));
 assert.equal(communityTarget(new URL('https://example.test/community?q=counter&kind=react')).query,'counter');
 const filtered=renderCommunity({origin:'https://example.test',query:'<script>',kind:'react'});
 assert.match(filtered,/noindex,follow/);assert.match(filtered,/name="kind"/);assert.doesNotMatch(filtered,/value="<script>"/);
 const html=renderCommunity({item:{id,creator:id,name:'</script><script>alert(1)</script>',description:'<img src=x onerror=alert(1)>',display_name:'Author',version:2,reviewed_at:'2026-11-10T13:00:00Z'},origin:'https://example.test'});
 assert.match(html,/rel="canonical" href="https:\/\/example.test\/community\/component\//);
 assert.match(html,/CreativeWork/);assert.doesNotMatch(html,/<script>alert\(1\)/);assert.doesNotMatch(html,/<img src=x/);
 const denied=await community(new Request('https://example.test/community/component/'+id),{rpc:async()=>({data:null})},null,()=>{throw Error('Public projection should not require login');});
 assert.equal(denied.status,404);
});

test('publication API refuses an invalid compiled example even if a moderator marks it tested',async()=>{
 const calls=[];
 const client={rpc:async(name,input)=>{calls.push(input);return name==='creator_similarity'?{data:[]}:{data:{framework:'react',source:'export default function ('}};}};
 await assert.rejects(community(new Request('https://example.test/api/creator-command',{method:'POST'}),client,async()=>({action:'review',input:{id,decision:'approved',tested:true,licensed:true}}),async()=>({id})),/verificação automática/);
 assert.equal(calls.some(input=>input?.action==='review'),false);
});
