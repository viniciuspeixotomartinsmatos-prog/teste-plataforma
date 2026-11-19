import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewNavigation} from '../scripts/lib/preview-navigation.mjs';
test('isolated demos start at root, navigate and go back without browser history',()=>{
 const navigation=createPreviewNavigation(),events=[];navigation.listen(e=>events.push(e.action));
 assert.equal(navigation.location.pathname,'/');navigation.push('/app/prompts?view=grid',{from:'demo'});assert.equal(navigation.location.search,'?view=grid');navigation.replace('/login');assert.equal(navigation.location.pathname,'/login');navigation.go(-1);assert.equal(navigation.location.pathname,'/');assert.deepEqual(events,['PUSH','REPLACE','POP']);assert.equal(createPreviewNavigation().location.pathname,'/');
});
