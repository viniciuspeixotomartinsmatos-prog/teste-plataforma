import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {promises as fs} from 'node:fs';
import {APP_ROOT,WORKSPACE} from './preview-catalog.mjs';

const require=createRequire(import.meta.url);
const esbuild=require('esbuild');
const {parse,compileScript,compileTemplate,compileStyle,registerTS}=require('vue/compiler-sfc');
registerTS(()=>require('typescript'));
const REPO=path.join(WORKSPACE,'research/catalog-c/animate-repo');
const PACKAGE=path.join(REPO,'packages/vue/src');
const SITE=path.join(REPO,'apps/v2');
const DEMOS=path.join(REPO,'apps/vue-demos/src');
const slash=value=>value.replaceAll('\\','/');
const normalizeName=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
let docsPromise;
function vueDocs(){return docsPromise||=(async()=>{
 const docs=[];async function walk(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name.endsWith('.mdx')){const content=await fs.readFile(file,'utf8');docs.push({file,content,title:content.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]});}}}
 await walk(path.join(SITE,'content/docs/vue'));return docs;
})();}

function findFile(base){
 // Extensionless imports target a TS barrel before a same-named Vue demo.
 // In particular ./input-otp is a folder next to input-otp.vue.
 for(const file of [base,base+'.ts',base+'.js',path.join(base,'index.ts'),path.join(base,'index.vue'),base+'.vue'])if(isFile(file))return file;
 return null;
}
function isFile(file){try{return statSync(file).isFile();}catch{return false;}}
function installedTypePath(file){
 const normalized=slash(file),marker='/node_modules/';
 return normalized.includes(marker)?path.join(APP_ROOT,'node_modules',normalized.slice(normalized.lastIndexOf(marker)+marker.length)):file;
}
const typeFS={
 fileExists:file=>isFile(file)||isFile(installedTypePath(file)),
 readFile:file=>{try{return readFileSync(file,'utf8');}catch{return readFileSync(installedTypePath(file),'utf8');}},
 realpath:file=>existsSync(file)?file:installedTypePath(file),
};

export async function createVueContext(item,payload){
 const files=new Map(),styles=new Map();
 const registry=path.join(SITE,'registry',item.slug);
 const add=(filename,content)=>{const file={path:slash(path.relative(WORKSPACE,filename)),filename,content};files.set(filename,file);return file;};
 for(const source of payload.files||[]){
  const filename=findFile(path.join(WORKSPACE,source.path))||findFile(path.join(PACKAGE,source.path))||findFile(path.join(registry,source.path))||findFile(path.join(registry,path.basename(source.path)))||path.join(registry,source.path);
  add(filename,source.content);
 }
 const candidates=[...files.values()];
 const primary=candidates.find(f=>f.path.endsWith('.vue')&&normalizeName(path.basename(f.path,'.vue'))===normalizeName(item.name))||candidates.find(f=>f.path.endsWith('.vue'))||candidates.find(f=>/\.(ts|js)$/.test(f.path));
 if(!primary)throw Error('Vue source is unavailable.');
 let main=primary.filename,hasDemo=false;
 if(item.kind==='icon'){
  main=path.join(registry,'__union_demo__.vue');
  add(main,`<script setup lang="ts">import {ref} from 'vue';import OriginalIcon from 'union-vue-component';const playing=ref(true);</script><template><div class="flex min-h-80 w-full flex-col items-center justify-center gap-8 p-10"><OriginalIcon :size="88" :animate="playing" :loop="playing" animate-on-hover/><button type="button" class="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent" :data-playing="playing" @click="playing=!playing">{{playing?'Pausar animação':'Reproduzir animação'}}</button></div></template>`);
  hasDemo=true;
 }else{
  let doc='';try{doc=await fs.readFile(path.join(SITE,'content/docs',item.slug+'.mdx'),'utf8');}catch{}
  if(!doc)doc=(await vueDocs()).find(d=>normalizeName(d.title)===normalizeName(item.name))?.content||'';
  const name=doc.match(/<VueComponentPreview\b[^>]*\bname="([^"]+)"/)?.[1];
  const demo=name&&findFile(path.join(DEMOS,'demos',name+'.vue'));
  if(demo){main=demo;add(main,await fs.readFile(main,'utf8'));hasDemo=true;}
  else{
   const usage=[...doc.matchAll(/```vue\s*\n([\s\S]*?)```/g)].map(m=>m[1]).find(code=>code.includes('<template>')&&!/\.\.\.|<!--/.test(code));
   if(usage){main=path.join(registry,'__union_demo__.vue');add(main,usage);hasDemo=true;}
  }
 }
 async function resolve(imported,importer){
  let found;
  if(imported==='union-vue-component')return primary.filename;
  if(imported.startsWith('@animate-ui/vue/'))found=findFile(path.join(PACKAGE,imported.slice('@animate-ui/vue/'.length)));
  else if(imported.startsWith('@/registry/'))found=findFile(path.join(SITE,imported.slice(2)));
  else if(imported.startsWith('@/'))found=findFile(path.join(DEMOS,imported.slice(2)))||findFile(path.join(SITE,imported.slice(2)));
  else if(imported.startsWith('.'))found=findFile(path.resolve(path.dirname(importer),imported));
  if(found){
   if(/\.(vue|ts|js|css|json)$/.test(found)&&!files.has(found))add(found,await fs.readFile(found,'utf8'));
   return found;
  }
  if(imported.startsWith('.')||imported.startsWith('@/')||imported.startsWith('@animate-ui/'))throw Error('Original Vue dependency not included: '+imported);
  return null;
 }
 return{item,payload,files,styles,main,primary:primary.filename,hasDemo,resolve,dependencies:new Set(['vue',...(payload.dependencies||[])])};
}

function sfcSource(file,context){
 const id=crypto.createHash('sha1').update(file.path).digest('hex').slice(0,10);
 const {descriptor,errors}=parse(file.content,{filename:file.filename});
 if(errors.length)throw errors[0];
 let code='const __sfc__={};';
 if(descriptor.script||descriptor.scriptSetup)code=compileScript(descriptor,{id,genDefaultAs:'__sfc__',inlineTemplate:true,isProd:true,sourceMap:false,fs:typeFS}).content;
 if(descriptor.template&&!descriptor.scriptSetup){
  const template=compileTemplate({source:descriptor.template.content,filename:file.filename,id,scoped:descriptor.styles.some(s=>s.scoped),isProd:true});
  if(template.errors.length)throw template.errors[0];
  code+='\n'+template.code+'\n__sfc__.render=render;';
 }
 if(descriptor.styles.some(s=>s.scoped))code+=`\n__sfc__.__scopeId='data-v-${id}';`;
 const css=descriptor.styles.map(style=>{
  if(style.lang&&style.lang!=='css')throw Error('Unsupported original Vue stylesheet language: '+style.lang);
  const result=compileStyle({source:style.content,filename:file.filename,id:'data-v-'+id,scoped:style.scoped,isProd:true});
  if(result.errors.length)throw result.errors[0];
  return result.code;
 }).join('\n');
 if(css)context.styles.set(file.filename,css);
 return code+'\nexport default __sfc__;';
}

export async function buildVuePreview(context){
 const namespace='union-vue';
 const entry=`import {createApp,h,reactive,nextTick} from 'vue';import Example from 'union-vue-entry';const id=${JSON.stringify(context.item.id)};let failed=false;const send=(type,message)=>{if(type==='preview-error')failed=true;if(type==='preview-ready'&&failed)return;parent.postMessage({type,id,message},'*')};window.addEventListener('error',e=>{if(e.target===window)send('preview-error',e.message)});window.addEventListener('unhandledrejection',e=>send('preview-error',String(e.reason?.message||e.reason)));const props=reactive({});window.addEventListener('message',e=>{if(e.data?.type==='preview:set-props'&&(!e.data.id||e.data.id===id))Object.assign(props,e.data.props);if(e.data?.type==='preview:set-theme'){const theme=e.data.theme==='light'?'light':'dark';document.documentElement.classList.toggle('light',theme==='light');document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme}});const app=createApp({setup:()=>()=>h(Example,props)});app.config.errorHandler=e=>send('preview-error',e.message);try{app.mount('#root');nextTick(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>send('preview-ready'))))}catch(e){send('preview-error',e.message)}`;
 const built=await esbuild.build({stdin:{contents:entry,sourcefile:'union-vue-entry.ts',loader:'ts',resolveDir:APP_ROOT},bundle:true,write:false,outfile:'preview.js',format:'iife',platform:'browser',target:['es2022'],minify:true,treeShaking:true,logLevel:'silent',define:{'process.env.NODE_ENV':'"production"',__VUE_OPTIONS_API__:'true',__VUE_PROD_DEVTOOLS__:'false',__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:'false'},loader:{'.svg':'dataurl','.png':'dataurl','.jpg':'dataurl','.webp':'dataurl','.woff2':'dataurl'},plugins:[{name:'original-vue-source',setup(build){
  build.onResolve({filter:/^union-vue-entry$/},()=>({path:context.main,namespace}));
  build.onResolve({filter:/.*/,namespace},async args=>{
   if(args.path==='cn'||/^@\/lib\/utils$/.test(args.path)){context.dependencies.add('cn');return{path:'cn',namespace:'union-vue-adapter'};}
   if(!args.path.startsWith('.')&&!args.path.startsWith('@/')&&!args.path.startsWith('union-vue-'))context.dependencies.add(args.path.match(/^(@[^/]+\/[^/]+|[^/]+)/)[1]);
   const found=await context.resolve(args.path,args.importer);
   if(found)return{path:found,namespace:context.files.has(found)?namespace:'file'};
   return build.resolve(args.path,{resolveDir:APP_ROOT,kind:args.kind});
  });
  build.onLoad({filter:/.*/,namespace},args=>{
   const file=context.files.get(args.path);if(!file)throw Error('Vue source missing: '+args.path);
   const ext=path.extname(file.filename).slice(1);
   return{contents:ext==='vue'?sfcSource(file,context):file.content,loader:ext==='vue'||ext==='ts'?'ts':ext==='css'?'css':ext==='json'?'json':'js',resolveDir:APP_ROOT};
  });
  build.onLoad({filter:/.*/,namespace:'union-vue-adapter'},()=>({contents:`import {clsx} from 'clsx';import {twMerge} from 'tailwind-merge';export function cn(...args){return twMerge(clsx(args))}export default cn;`,loader:'js',resolveDir:APP_ROOT}));
 }}]});
 return{js:built.outputFiles.find(f=>f.path.endsWith('.js'))?.text,css:built.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>f.text).join('\n')+'\n'+[...context.styles.values()].join('\n')};
}
