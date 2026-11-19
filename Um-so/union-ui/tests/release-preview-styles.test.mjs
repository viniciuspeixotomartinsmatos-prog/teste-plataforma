import test from 'node:test';import assert from 'node:assert/strict';
import {standalonePreview} from '../src/component-export.js';import {themeCover} from '../scripts/lib/theme-cover.mjs';
test('portable previews embed immutable release CSS and its fonts',async()=>{
 const previous=globalThis.fetch;
 const resources={'/previews/runtime/release.html':'<head><link rel="stylesheet" data-release-styles="true" href="/assets/releases/2026-11-16/example-123.css"></head><body>Title</body>','/assets/releases/2026-11-16/example-123.css':'h1{background-image:linear-gradient(red,blue)}@font-face{src:url("/assets/fonts/test.woff2")}','/assets/fonts/test.woff2':new Uint8Array([1,2,3]),'/data/demo-local-assets.json':'{"items":{}}'};
 globalThis.fetch=async url=>new Response(resources[url]||'',{status:url in resources?200:404});
 try{const html=await standalonePreview({id:'test',previewPath:'/previews/runtime/release.html'});assert.match(html,/h1\{background-image:linear-gradient/);assert.match(html,/data:font\/woff2;base64,AQID/);assert.doesNotMatch(html,/href="\/assets\/releases\//);}finally{globalThis.fetch=previous;}
});
test('theme palette covers use source colors and escape names and unsafe values',()=>{
 const svg=themeCover('<script>&',':root {--primary: #dc2828; --secondary: oklch(0.94 0 0);--accent:url(https://bad.test); }');assert.match(svg,/fill="#dc2828"/);assert.match(svg,/fill="oklch\(0.94 0 0\)"/);assert.match(svg,/&lt;script&gt;&amp;/);assert.doesNotMatch(svg,/https:|<script>/);
});
