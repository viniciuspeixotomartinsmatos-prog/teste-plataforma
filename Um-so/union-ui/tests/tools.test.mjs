import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import webAudio from 'web-audio-engine';
const root=path.resolve('../research/reactbits-tools/src');
await fs.mkdir('var',{recursive:true});
await build({stdin:{contents:`export {renderSound} from ${JSON.stringify(root+'/sounds/ts/react-bits-sound.ts')};export {SOUNDS} from ${JSON.stringify(root+'/tools/sound-lab/sounds/catalog.js')};export {encodeWav} from ${JSON.stringify(root+'/tools/sound-lab/export/wav.js')};export {analyze} from ${JSON.stringify(root+'/tools/sound-lab/engine/analysis.js')};export {soundSource,usageSource} from ${JSON.stringify(root+'/tools/sound-lab/export/code.js')};export {shaderVariant,variantKey} from ${JSON.stringify(root+'/tools/shape-magic/engine/shaderVariant.js')};export {buildFragment} from ${JSON.stringify(root+'/tools/shape-magic/engine/shader.js')};export {PRIMITIVES} from ${JSON.stringify(root+'/tools/shape-magic/engine/primitives.js')};export {fieldToPath,buildSVG} from ${JSON.stringify(root+'/tools/shape-magic/geometry/svg.js')};export {lookJson,decodeLook} from ${JSON.stringify(root+'/tools/texture-lab/share.js')};export {EFFECTS,defaultParams} from ${JSON.stringify(root+'/tools/texture-lab/effects/index.js')};`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'var/test-tool-engine.mjs',logLevel:'silent'});
const engine=await import('../var/test-tool-engine.mjs');
globalThis.OfflineAudioContext=webAudio.OfflineAudioContext;globalThis.AudioBuffer=webAudio.api.AudioBuffer;
test('audio studio renders an audible original sound, applies duration settings and exports valid WAV at all offered depths',async()=>{
 const sound=engine.SOUNDS.find(s=>s.id==='pebble');assert.ok(sound);
 const audio=await engine.renderSound(sound.recipe,{}, {sampleRate:44100,channels:2});
 assert.equal(audio.sampleRate,44100);assert.equal(audio.numberOfChannels,2);assert.ok(audio.length>1000);
 const values=audio.getChannelData(0);assert.ok(values.some(x=>Math.abs(x)>0.001));assert.ok(values.every(Number.isFinite));
 const changed=await engine.renderSound(sound.recipe,{length:1.8,pitch:4},{sampleRate:44100,channels:2});assert.ok(changed.length>audio.length);
 const analysis=engine.analyze(audio);assert.equal(analysis.wave.length,240);assert.ok(analysis.duration>0);
 for(const bitDepth of [16,24,32])for(const channels of [1,2]){
  const wav=engine.encodeWav(audio,{bitDepth,channels}),bytes=await wav.arrayBuffer(),view=new DataView(bytes);
  assert.equal(Buffer.from(bytes,0,4).toString(),'RIFF');assert.equal(Buffer.from(bytes,8,4).toString(),'WAVE');assert.equal(view.getUint16(22,true),channels);assert.equal(view.getUint16(34,true),bitDepth);assert.equal(view.getUint32(40,true),audio.length*channels*(bitDepth/8));assert.equal(view.getUint32(4,true),bytes.byteLength-8);
 }
});
test('sound export includes real recipe, tuned usage and the reusable audio engine',()=>{
 const sound=engine.SOUNDS[0],source=engine.soundSource(sound,true),usage=engine.usageSource(sound,{pitch:3,volume:-6});
 assert.match(source,/import type \{ Recipe \}/);assert.match(source,/layers:/);assert.match(usage,/pitch: 3/);assert.match(usage,/volume: -6/);assert.ok(engine.SOUNDS.length>100);
});
test('shape shader variants contain each selected primitive and invalidate when geometry changes',()=>{
 for(const primitive of engine.PRIMITIVES){
  const scene={a:{layers:[{type:primitive.id}]}},variant=engine.shaderVariant(scene),shader=engine.buildFragment(null,variant);
  assert.ok(shader.includes('sd_'+primitive.id+'('),primitive.id);assert.ok(shader.includes('#define MAXL 1'));
  assert.equal(engine.variantKey(variant),engine.variantKey(engine.shaderVariant({a:{layers:[{type:primitive.id,x:.4,rotation:45}]}})));
 }
 assert.notEqual(engine.variantKey(engine.shaderVariant({a:{layers:[{type:'box'}]}})),engine.variantKey(engine.shaderVariant({a:{layers:[{type:'circle'}]}})));
});
test('vector export traces an actual shape field into editable SVG paths',()=>{
 const width=64,height=64,data=Float32Array.from({length:width*height},(_,i)=>Math.hypot(i%width-32,Math.floor(i/width)-32)-18);
 const traced=engine.fieldToPath({width,height,data});assert.ok(traced.segments>0);assert.match(traced.d,/M/);assert.match(traced.d,/Z/);
 const svg=engine.buildSVG({...traced,fill:{kind:'solid',color1:'#b9eaa4'},fillRule:'evenodd'});
 assert.match(svg,/<svg/);assert.match(svg,/<path/);assert.match(svg,/#b9eaa4/);assert.ok(!svg.includes('NaN'));
});
test('texture styles retain effect settings and visibility through JSON export and import',()=>{
 const effect=Object.values(engine.EFFECTS).find(e=>e.params?.some(p=>p.type==='number'))||Object.values(engine.EFFECTS)[0];
 const layer={type:effect.id,params:engine.defaultParams(effect),mix:.65,visible:false};
 assert.ok(layer.type);const json=engine.lookJson([layer],'Meu estilo');
 const decoded=engine.decodeLook(json);assert.equal(decoded.length,1);assert.equal(decoded[0].type,layer.type);assert.equal(decoded[0].mix,.65);assert.equal(decoded[0].visible,false);
 assert.equal(engine.decodeLook('#style=invalid'),null);assert.deepEqual(engine.decodeLook('{"version":2,"layers":[{"type":"missing-effect"}]}'),[]);
});
