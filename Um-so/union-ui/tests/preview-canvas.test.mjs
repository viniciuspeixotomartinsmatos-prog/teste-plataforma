import test from 'node:test';
import assert from 'node:assert/strict';
import {observePreviewCanvas} from '../src/preview-canvas.js';

function fixture(gpu=false){
 let color=[0,0,0,0],time=1000,framebuffer=null,received;
 const frames=[];
 const context=gpu?{FRAMEBUFFER_BINDING:1,RGBA:2,UNSIGNED_BYTE:3,isContextLost:()=>false,getParameter:()=>framebuffer,readPixels:(x,y,w,h,format,type,out)=>out.set(color),drawElements(...args){received=args;return 17;}}:{getImageData:()=>({data:color}),fillRect(...args){received=args;return 17;}};
 class Canvas{width=100;height=80;getContext(){return context;}}
 const win={HTMLCanvasElement:Canvas,performance:{now:()=>time},requestAnimationFrame:callback=>frames.push(callback)};
 return {win,canvas:new Canvas(),context,setColor:value=>{color=value;time+=151;},setFramebuffer:value=>{framebuffer=value;time+=151;},flush:()=>{while(frames.length)frames.shift()();},received:()=>received};
}
test('decorative canvas needs real painted pixels and two frames; drawing arguments and return values are preserved',()=>{
 const f=fixture();let calls=0;const observed=observePreviewCanvas(()=>calls++,f.win),context=f.canvas.getContext('2d');
 assert.equal(observed.has(f.canvas),false);
 assert.equal(context.fillRect(2,3,4,5),17);f.flush();assert.equal(observed.has(f.canvas),false);
 f.setColor([0,0,0,255]);context.fillRect(2,3,4,5);f.flush();assert.equal(observed.has(f.canvas),false);
 f.setColor([80,20,180,255]);context.fillRect(2,3,4,5);assert.equal(calls,0);f.flush();assert.equal(calls,1);assert.equal(observed.has(f.canvas),true);assert.deepEqual(f.received(),[2,3,4,5]);
 context.fillRect(9,8,7,6);f.flush();assert.equal(calls,1);
});
test('offscreen GPU draws do not prove a presented frame; the real default framebuffer does',()=>{
 const f=fixture(true),observed=observePreviewCanvas(()=>{},f.win),gl=f.canvas.getContext('webgl2');
 f.setColor([90,30,200,255]);f.setFramebuffer({offscreen:true});gl.drawElements(4,6,5123,0);f.flush();assert.equal(observed.has(f.canvas),false);
 f.setFramebuffer(null);assert.equal(gl.drawElements(4,6,5123,0),17);f.flush();assert.equal(observed.has(f.canvas),true);assert.deepEqual(f.received(),[4,6,5123,0]);
});
