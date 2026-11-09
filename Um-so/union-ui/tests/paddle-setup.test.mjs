import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('sandbox setup is reviewable without credentials and never provisions by default',()=>{
 const result=spawnSync(process.execPath,['scripts/setup-paddle.mjs','--dry-run'],{encoding:'utf8',env:{...process.env,PADDLE_ENV:'sandbox',PADDLE_API_KEY:''}});
 assert.equal(result.status,0,result.stderr);const output=JSON.parse(result.stdout);assert.equal(output.environment,'sandbox');assert.equal(output.applied,false);assert.deepEqual(output.plans.map(plan=>plan.amount),[8500,16500,55000]);
});
test('setup refuses to provision live products even with an apply flag',()=>{
 const result=spawnSync(process.execPath,['scripts/setup-paddle.mjs','--apply'],{encoding:'utf8',env:{...process.env,PADDLE_ENV:'live',PADDLE_API_KEY:'DO_NOT_ECHO_SECRET'}});
 assert.notEqual(result.status,0);assert.doesNotMatch(result.stdout+result.stderr,/DO_NOT_ECHO_SECRET/);
});
