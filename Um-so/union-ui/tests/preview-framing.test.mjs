import test from 'node:test';
import assert from 'node:assert/strict';
import {framePreview, normalizeFraming, previewLabel} from '../src/preview-framing.js';

test('wide or tall interface captures keep all content when cropped area would be material', () => {
 const item = {category:'Heroes', kind:'block'};
 assert.equal(framePreview(item, {width:1440,height:900}).fit, 'contain');
 assert.equal(framePreview(item, {width:1920,height:1080}).fit, 'cover');
 assert.equal(framePreview(item, {width:0,height:0}).review, true);
});

test('known protected regions prevent cropping and manual focus is bounded', () => {
 const result = framePreview({previewFraming:{region:{left:0,top:0,right:1,bottom:.98}}}, {width:1200,height:900});
 assert.equal(result.fit,'contain');
 assert.equal(result.safeArea,true);
 assert.deepEqual(normalizeFraming({fit:'custom', x:5, y:-5, zoom:8}).point,[1,0]);
 assert.equal(normalizeFraming({fit:'custom', zoom:8}).zoom,1.15);
});

test('recorded previews never get the interactive badge', () => {
 assert.equal(previewLabel({recoveryMode:'recorded-video',previewPath:'/demo'}),'Vídeo');
 assert.equal(previewLabel({previewPath:'/demo',image:'/image.webp'}),'Interativo');
 assert.equal(previewLabel({image:'/image.webp'}),'Imagem');
});
