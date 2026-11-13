import test from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs/promises';
import {createLayeredCosmicRenderer} from '../src/cosmic-layer-renderer.js';import {cosmicDimensions,createCosmicQuality} from '../src/cosmic-quality.js';
test('planet has independent counter-parallax while scene rays remain in the stationary background',async()=>{
 const [body,plate,space]=await Promise.all(['cosmic-body-layer.png','cosmic-clean-plate.png','cosmic-space-depth.png'].map(async name=>loadImage(await fs.readFile('public/assets/auth/'+name))));
 const canvas=createCanvas(1,1),renderer=createLayeredCosmicRenderer(canvas,{body,plate,space,width:600,height:580,createCanvas:()=>createCanvas(1,1)});
 const left=renderer.draw(9000,1,{x:0,y:200,until:0,speed:0});assert.equal(left.independentPlanet,true);assert.ok(left.planetOffset.x>0);assert.ok(left.bodyOffset.x<0);
 const pixel=()=>[...canvas.getContext('2d').getImageData(430,430,1,1).data];const before=pixel();
 const right=renderer.draw(9000,1,{x:600,y:200,until:0,speed:0});assert.ok(right.planetOffset.x<0);assert.ok(right.bodyOffset.x>0);assert.deepEqual(pixel(),before);
 await fs.mkdir('var/audits',{recursive:true});await fs.writeFile('var/audits/cosmic-independent-depth.png',canvas.toBuffer('image/png'));
});
test('mobile and constrained resolution stay bounded and adaptive quality degrades only once after sustained cost',()=>{
 const mobile=cosmicDimensions(1672,941,{mobile:true}),low=cosmicDimensions(1672,941,{constrained:true});assert.equal(mobile.width,640);assert.equal(low.width,480);assert.ok(Math.abs(mobile.width/mobile.height-(1672*.58)/941)<.01);
 const quality=createCosmicQuality();for(let i=0;i<44;i++)assert.equal(quality.observe(30),false);assert.equal(quality.observe(30),true);assert.equal(quality.constrained,true);assert.equal(quality.observe(80),false);
 const fast=createCosmicQuality();for(let i=0;i<200;i++)assert.equal(fast.observe(5),false);assert.equal(fast.constrained,false);
});
