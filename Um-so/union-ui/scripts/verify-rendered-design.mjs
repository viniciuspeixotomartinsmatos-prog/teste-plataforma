// Opt-in service integration check. Executes only the synthetic public-page
// fixture through the production renderer; never opens a user's browser/profile.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {renderDesign} from '../server/rendered-design.mjs';
const calls=[];
const html='<!doctype html><html><head><title>Fixture</title><script src="/app.js" defer></script></head><body><h1>Fixture</h1><form><input value="DO_NOT_CAPTURE_VALUE"><button>Enviar</button></form></body></html>';
const js='setTimeout(()=>{document.body.style.backgroundColor="rgb(17, 34, 51)";document.querySelector("h1").style.color="rgb(123, 45, 210)";document.querySelector("button").style.borderRadius="19px";fetch("http://127.0.0.1/private").catch(()=>{});fetch("https://fixture.example/write",{method:"POST",body:"blocked"}).catch(()=>{});},150)';
const result=await renderDesign('https://fixture.example/',{fetcher:async(url)=>{calls.push(url);if(!['https://fixture.example/','https://fixture.example/app.js'].includes(url))throw Error('Unexpected relay URL');return {url,status:200,headers:{'content-type':url.endsWith('.js')?'application/javascript':'text/html'},body:Buffer.from(url.endsWith('.js')?js:html)};}});
assert.ok(result.computed.colors.some(row=>row.value==='rgb(123, 45, 210)'));
assert.ok(result.computed.radii.some(row=>row.value==='19px'));
assert.equal(result.computed.structure.forms,1);
assert.ok(!JSON.stringify(result).includes('DO_NOT_CAPTURE_VALUE'));
assert.ok(calls.every(url=>url.startsWith('https://fixture.example/')));
assert.ok(!calls.some(url=>url.includes('write')));
await fs.mkdir('var/audits',{recursive:true});await fs.writeFile('var/audits/rendered-design-service.json',JSON.stringify({result,calls},null,2));
console.log(JSON.stringify({passed:true,colors:result.computed.colors.length,forms:result.computed.structure.forms,requests:calls.length,privateRequestBlocked:true,postBlocked:true}));
