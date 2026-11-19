import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
const directory='public/data/creator-runtime';
await mkdir(directory,{recursive:true});
for(const [name,source] of Object.entries({
 react:"import React from 'react';import {createRoot} from 'react-dom/client';window.React=React;window.mountCreator=c=>createRoot(document.getElementById('preview')).render(React.createElement(c));",
 vue:"import * as Vue from 'vue';window.Vue=Vue;window.mountCreator=c=>Vue.createApp(c).mount('#preview');"
})){
 await build({stdin:{contents:source,resolveDir:process.cwd()},bundle:true,minify:true,format:'iife',outfile:directory+'/'+name+'.js',define:{'process.env.NODE_ENV':'"production"',__VUE_OPTIONS_API__:'true',__VUE_PROD_DEVTOOLS__:'false',__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:'false'}});
}
for(const name of ['react','react-dom','vue'])await copyFile('node_modules/'+name+'/LICENSE',directory+'/'+name+'-LICENSE.txt');
