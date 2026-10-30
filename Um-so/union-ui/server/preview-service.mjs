import {injectPreviewEnvironment} from '../src/preview-environment.js';
import {demoAssetsFor} from './demo-assets.mjs';
import {injectDemoAssets} from '../src/demo-asset-bridge.js';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import { APP_ROOT, PUBLIC_ROOT, loadItem, createSourceContext, basename } from './preview-catalog.mjs';

const require=createRequire(import.meta.url);
const esbuild=require('esbuild');
const {parse}=require('@babel/parser');
const bundles=new Map(),jobs=new Map();
const cacheDir=path.join(APP_ROOT,'.preview-cache');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const keyFor=id=>crypto.createHash('sha256').update('union-preview-v3:'+id).digest('hex').slice(0,24);
const utils=`import {clsx} from 'clsx';import {twMerge} from 'tailwind-merge';export function cn(...a){return twMerge(clsx(a))}export {clsx,twMerge};`;
const currentIcons=require('lucide-react');
const legacyIcons=Object.keys(require('lucide-legacy')).filter(name=>!(name in currentIcons)&&/^[A-Za-z_$][\w$]*$/.test(name)&&name!=='default');
// Resolve named icons directly to their installed modules. Importing a complete
// icon registry for every independent preview otherwise reparses thousands of
// unrelated files on each compilation, especially costly on synced folders.
async function iconExports(packageName){
 const root=path.join(APP_ROOT,'node_modules',packageName);
 const manifest=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
 const entry=path.join(root,manifest.module);const code=await fs.readFile(entry,'utf8');
 const map=new Map();
 for(const declaration of code.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)){
  for(const symbol of declaration[1].split(',')){
   const match=symbol.trim().match(/^default\s+as\s+(\w+)$/);
   if(match)map.set(match[1],path.resolve(path.dirname(entry),declaration[2]));
  }
 }
 return map;
}
const [modernIcons,oldIcons,hugeIcons]=await Promise.all(['lucide-react','lucide-legacy','@hugeicons/core-free-icons'].map(iconExports));
const lucideIcons=new Map([...oldIcons,...modernIcons]);
function directIconImports(code){
 let imports;try{imports=parse(code,{sourceType:'module',plugins:['typescript','jsx']}).program.body.filter(node=>node.type==='ImportDeclaration'&&node.importKind!=='type'&&['lucide-react','@hugeicons/core-free-icons'].includes(node.source.value)&&node.specifiers.every(s=>s.type==='ImportSpecifier'));}catch{return code;}
 for(const node of imports.reverse()){
  const library=node.source.value;
  const mapping=library==='lucide-react'?lucideIcons:hugeIcons;const direct=[],remaining=[];
  for(const specifier of node.specifiers){
   if(specifier.importKind==='type')continue;
   const name=specifier.imported.name,alias=specifier.local.name,file=mapping.get(name);
   if(file)direct.push(`import ${alias} from ${JSON.stringify(file.replaceAll('\\','/'))};`);else remaining.push(name===alias?name:name+' as '+alias);
  }
  const replacement=direct.join('\n')+(remaining.length?`\nimport {${remaining.join(',')}} from '${library}';`:'');
  code=code.slice(0,node.start)+replacement+code.slice(node.end);
 }
 return code;
}
const adapters={
 'lucide-compat':`export * from 'lucide-react';export {${legacyIcons.join(',')}} from 'lucide-legacy';`,
 'next/dynamic':`import React from 'react';export default function dynamic(loader,options={}){const Component=React.lazy(()=>Promise.resolve(typeof loader==='function'?loader():loader).then(m=>({default:m.default||m})));return function DynamicComponent(props){return <React.Suspense fallback={options.loading?React.createElement(options.loading):null}><Component {...props}/></React.Suspense>}}`,
 'next/image':`import React from'react';export default function Image({fill,priority,unoptimized,placeholder,blurDataURL,quality,loader,...p}){const src=typeof p.src==='object'?p.src.src:p.src;return <img {...p} src={src} style={{...(fill?{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}:{}),...p.style}}/>}`,
 'next/link':`import React from'react';export default function Link({prefetch,replace,scroll,shallow,locale,legacyBehavior,passHref,...p}){return <a {...p} href={typeof p.href==='object'?p.href.pathname:p.href}/>} `,
 'next/navigation':`export const usePathname=()=>'/';export const useSearchParams=()=>new URLSearchParams(location.search);export const useRouter=()=>({push:u=>history.pushState({},'',u),replace:u=>history.replaceState({},'',u),back:()=>history.back(),forward:()=>history.forward(),refresh:()=>location.reload(),prefetch:()=>{}});export const notFound=()=>{throw Error('Not found')};export const redirect=u=>location.assign(u);`,
 'next/router':`export const useRouter=()=>({pathname:'/',query:{},push:()=>{},replace:()=>{},asPath:'/',isReady:true});`,
 'next/font/google':`const font=()=>({className:'',variable:'',style:{fontFamily:'Inter,system-ui,sans-serif'}});export const Inter=font,Roboto=font,Manrope=font,Geist=font,Geist_Mono=font,DM_Sans=font,Space_Grotesk=font,Instrument_Serif=font,Playfair_Display=font,Montserrat=font,Poppins=font,Outfit=font,Plus_Jakarta_Sans=font;`,
 'next/head':`export default function Head(){return null}`,
 'cn':utils,
};

function runtimeEntry(context){
 const {item,hasDemo}=context;
 const named=String(item.slug||item.name).split('/').pop().split(/[-_ ]/).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join('');
 const icon=item.kind==='icon';
 const isBackground=item.category==='Backgrounds';
 const isText=item.category==='Text effects';
 const staticText='Build something extraordinary.';
 // The original documented demo is the default. The minimal component wrapper
 // is used only where the library publishes no independent executable demo.
 return `import React from 'react';import{createRoot}from'react-dom/client';import{ThemeProvider,useTheme}from'next-themes';import * as Source from 'union-entry';
const id=${JSON.stringify(item.id)},hasDemo=${hasDemo};const keys=Object.keys(Source);const App=Source.default||Source[${JSON.stringify(named)}]||Source[keys.find(k=>/Demo|Example/.test(k))]||Source[keys.find(k=>/^[A-Z]/.test(k)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(k))];
let failed=false;const send=(type,message)=>{if(type==='preview-error')failed=true;if(type==='preview-ready'&&failed)return;parent.postMessage({type,id,...(message?{message:String(message)}:{})},'*')};
window.addEventListener('error',e=>send('preview-error',e.message));window.addEventListener('unhandledrejection',e=>send('preview-error',e.reason?.message||e.reason));
class Boundary extends React.Component{state={error:null};static getDerivedStateFromError(error){return{error}}componentDidCatch(error){send('preview-error',error.message)}render(){return this.state.error?<div role="alert" style={{padding:32,maxWidth:600,fontSize:13,color:'#a1a1aa'}}>The original example could not finish rendering: {this.state.error.message}</div>:this.props.children}}
function View(){const[overrides,setOverrides]=React.useState({});React.useEffect(()=>{const update=e=>{if(e.data?.type==='preview:set-props'&&(!e.data.id||e.data.id===id))setOverrides(p=>({...p,...e.data.props}))};window.addEventListener('message',update);let frame=requestAnimationFrame(()=>requestAnimationFrame(()=>send('preview-ready')));return()=>{cancelAnimationFrame(frame);window.removeEventListener('message',update)}},[]);if(!App)throw Error('No renderable component export was published.');return React.createElement(App,hasDemo?{}:{...${icon?`{size:80,animate:true,animateOnHover:true,animateOnTap:true,loop:true,strokeWidth:1.5}`:isText?`{children:${JSON.stringify(staticText)},text:${JSON.stringify(staticText)},className:'text-5xl font-semibold',trigger:true,animate:true}`:isBackground?`{style:{width:'100%',height:'100%'},className:'h-full w-full',particleColors:['#a78bfa','#60a5fa','#e9d5ff'],particleCount:200}`:`{${item.sourceId==='reactbits'?`text:${JSON.stringify(staticText)},`:''}children:${JSON.stringify(item.category==='Buttons'?'Get started':staticText)}}`},...overrides});}
function ThemeBridge(){const{resolvedTheme,setTheme}=useTheme();React.useEffect(()=>{document.documentElement.dataset.theme=resolvedTheme||'dark'},[resolvedTheme]);React.useEffect(()=>{const update=e=>{if(e.data?.type==='preview:set-theme')setTheme(e.data.theme==='light'?'light':'dark')};window.addEventListener('message',update);return()=>window.removeEventListener('message',update)},[setTheme]);return <View/>}
function Root(){return <ThemeProvider attribute="class" defaultTheme={document.documentElement.dataset.theme||'dark'} enableSystem={false}><ThemeBridge/></ThemeProvider>}
createRoot(document.getElementById('root')).render(<Boundary><Root/></Boundary>);`;
}

function buildPlugin(context){
 const namespace='union-source';
 return {name:'union-original-source',setup(build){
  build.onResolve({filter:/^union-entry$/},()=>({path:context.main,namespace}));
  build.onResolve({filter:/^next\/(?:image|link|navigation|router|head|dynamic|font\/google)$/},args=>({path:args.path,namespace:'union-adapter'}));
  build.onResolve({filter:/.*/,namespace},async args=>{
   const source=context.files.get(args.importer);
   const imported=args.path;
   if(imported==='lucide-react')return{path:'lucide-compat',namespace:'union-adapter'};
   if(/(?:^|\/)cn$/.test(imported))return{path:'cn',namespace:'union-adapter'};
   if(/(?:^|\/)(?:lib\/)?utils$/.test(imported)){
    const original=await context.resolveSource(imported,args.importer);
    if(original)return{path:original.path,namespace};
    return{path:'cn',namespace:'union-adapter'};
   }
   if(adapters[imported])return{path:imported,namespace:'union-adapter'};
   if(imported.startsWith('.')||imported.startsWith('@/')||imported.startsWith('~/')||imported.startsWith('@animate-ui/')||imported.startsWith('@magicui/')||imported.startsWith('@aceternity/')){
    const found=await context.resolveSource(imported,args.importer);
    if(found)return{path:found.path,namespace};
    if(/\.(?:png|jpe?g|gif|webp|svg)$/.test(imported))return{path:imported,namespace:'union-asset'};
    throw new Error(`Original local dependency not included: ${imported}`);
   }
   return build.resolve(imported,{resolveDir:APP_ROOT,kind:args.kind});
  });
  build.onLoad({filter:/.*/,namespace},args=>{
   const file=context.files.get(args.path);
   if(!file)throw Error('Original source file unavailable: '+args.path);
   const ext=path.extname(file.path).slice(1);
   return{contents:/^[jt]sx?$/.test(ext)?directIconImports(file.content):file.content,loader:ext==='tsx'?'tsx':ext==='ts'?'ts':ext==='css'?'css':ext==='json'?'json':'jsx',resolveDir:APP_ROOT};
  });
  build.onLoad({filter:/.*/,namespace:'union-adapter'},args=>({contents:adapters[args.path],loader:'jsx',resolveDir:APP_ROOT}));
  // Some source bundles reference local images not included in registry files.
  // A missing image is an explicit compile failure, never a fabricated image.
  build.onLoad({filter:/.*/,namespace:'union-asset'},args=>{throw Error('Original image asset unavailable: '+args.path)});
 }};
}

export async function compileItem(id,{cache=true,persist=false}={}){
 const key=keyFor(id);
 if(cache&&bundles.has(key))return bundles.get(key);
 if(jobs.has(id))return jobs.get(id);
 const work=(async()=>{
  const {item,payload}=await loadItem(id);
  const vue=item.framework==='vue';
  const vueRuntime=vue?await import('./vue-preview.mjs'):null;
  const context=vue?await vueRuntime.createVueContext(item,payload):await createSourceContext(item,payload);
  const start=Date.now();
  const built=vue?null:await esbuild.build({stdin:{contents:runtimeEntry(context),sourcefile:'union-entry-point.tsx',loader:'tsx',resolveDir:APP_ROOT},bundle:true,write:false,outfile:'preview.js',format:'iife',platform:'browser',target:['es2022'],jsx:'automatic',minify:true,treeShaking:true,logLevel:'silent',define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_BASE_URL':'""'},loader:{'.svg':'dataurl','.png':'dataurl','.jpg':'dataurl','.webp':'dataurl','.woff2':'dataurl','.glsl':'text'},plugins:[buildPlugin(context)]});
  const vueBuilt=vue?await vueRuntime.buildVuePreview(context):null;
  const js=vueBuilt?.js||built?.outputFiles.find(f=>f.path.endsWith('.js'))?.text;
  const css=vueBuilt?.css||built?.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>f.text).join('\n')||'';
  if(!js)throw Error('Original source did not produce a JavaScript bundle.');
  const assetMap=await demoAssetsFor(id);
  const result={id,key,js,css,assetMap,framework:item.framework,bytes:Buffer.byteLength(js),elapsedMs:Date.now()-start,hasDemo:context.hasDemo,entry:context.main,sourceFileCount:context.files.size};
  if(cache){bundles.set(key,result);while(bundles.size>64)bundles.delete(bundles.keys().next().value);}
  if(persist){
   const staticDir=path.join(PUBLIC_ROOT,'previews','runtime');await fs.mkdir(staticDir,{recursive:true});
   const bundleKey=crypto.createHash('sha256').update(js+css).digest('hex').slice(0,24);
   await fs.writeFile(path.join(staticDir,bundleKey+'.js'),js);
   const staticResult={...result,bundlePath:'/previews/runtime/'+bundleKey+'.js'};
   const safeId=id.replace(/[^a-zA-Z0-9._-]/g,'-');
   result.previewPath='/previews/runtime/'+safeId+'.html';
   await fs.writeFile(path.join(staticDir,safeId+'.html'),previewHTML(item,staticResult,'dark'));
   await fs.writeFile(path.join(staticDir,safeId+'.light.html'),previewHTML(item,staticResult,'light'));
   const sourceDir=path.join(PUBLIC_ROOT,'code','runtime');await fs.mkdir(sourceDir,{recursive:true});
   const sourcePackage={...payload,...(context.dependencies?{dependencies:[...context.dependencies]}:{}),files:[...context.files.values()].map(f=>({path:f.path,content:f.content})),demoCode:context.hasDemo?context.files.get(context.main)?.content:payload.demoCode};
   await fs.writeFile(path.join(sourceDir,safeId+'.json'),JSON.stringify(sourcePackage));
  }
  return result;
 })();
 jobs.set(id,work);try{return await work;}finally{jobs.delete(id);}
}

export function previewHTML(item,compiled,theme='dark'){
 theme=theme==='light'?'light':'dark';
 // Keep the example's own theme controls functional as well as the toolbar.
 // Shared semantic tokens follow the class updated by next-themes.
 const palettes=[['dark','#09090b','#fafafa','#27272a'],['light','#ffffff','#18181b','#f4f4f5']].map(([mode,bg,fg,secondary])=>`html.${mode}{color-scheme:${mode};--background:${bg};--foreground:${fg};--primary:${fg};--primary-foreground:${bg};--secondary:${secondary};--border:${mode==='dark'?'#27272a':'#e4e4e7'}}`).join('');
 compiled={...compiled,css:(compiled.css||'')+palettes};
 const full=item.category==='Backgrounds'||item.sourceId==='reactbits'||item.sourceId==='tailark'||item.kind==='block';
 return injectPreviewEnvironment(injectDemoAssets(`<!doctype html><html class="${theme}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(item.name)} · Preview</title><link rel="stylesheet" href="/assets/preview.css"><style>:root{color-scheme:${theme};--background:${theme==='dark'?'#09090b':'#ffffff'};--foreground:${theme==='dark'?'#fafafa':'#18181b'};--card:var(--background);--card-foreground:var(--foreground);--popover:var(--background);--popover-foreground:var(--foreground);--primary:${theme==='dark'?'#fafafa':'#18181b'};--primary-foreground:${theme==='dark'?'#18181b':'#fafafa'};--secondary:${theme==='dark'?'#27272a':'#f4f4f5'};--secondary-foreground:var(--foreground);--muted:var(--secondary);--muted-foreground:#a1a1aa;--accent:var(--secondary);--accent-foreground:var(--foreground);--border:${theme==='dark'?'#27272a':'#e4e4e7'};--input:var(--border);--ring:#71717a;--radius:.75rem}*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,system-ui,sans-serif;background:var(--background);color:var(--foreground)}#root{width:100%;min-height:100vh;${full?(item.category==='Backgrounds'?'height:100vh;position:relative;overflow:hidden':'position:relative'):'display:flex;align-items:center;justify-content:center;padding:32px'}}#root>div{max-width:100%}${item.kind==='icon'?'#root{display:grid;place-items:center}':''}${compiled.css||''}</style></head><body><div id="root"></div><script src="${compiled.bundlePath||'/api/preview-bundle/'+compiled.key+'.js'}" defer></script></body></html>`,compiled.assetMap));
}

export function createPreviewPlugin(){
 return{name:'union-native-preview',configureServer(server){
  server.middlewares.use(async(req,res,next)=>{
   let url;try{url=new URL(req.url,'http://localhost')}catch{return next()}
   const match=url.pathname.match(/^\/api\/preview\/([^/]+)$/);
   const bundle=url.pathname.match(/^\/api\/preview-bundle\/([a-f0-9]{24})\.js$/);
   if(!match&&!bundle)return next();
   try{
    if(bundle){
     const result=bundles.get(bundle[1]);let js=result?.js;
     if(!js)try{js=await fs.readFile(path.join(cacheDir,bundle[1]+'.js'),'utf8')}catch{}
     if(!js){res.statusCode=404;res.end('Preview bundle expired. Reload the preview.');return;}
     res.setHeader('Content-Type','application/javascript; charset=utf-8');res.setHeader('Cache-Control','private,max-age=3600');res.end(js);return;
    }
    const id=decodeURIComponent(match[1]);const {item}=await loadItem(id);const result=await compileItem(id);
    res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(previewHTML(item,result,url.searchParams.get('theme')));
   }catch(error){
    res.statusCode=error.status||422;
    const failure={type:'preview-error',id:decodeURIComponent(match?.[1]||''),message:error.errors?.map(e=>e.text).join('; ')||error.message};
    if(match){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><body><script>parent.postMessage('+JSON.stringify(failure).replace(/</g,'\\u003c')+',"*")</script></body></html>');}
    else{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(failure));}
   }
  });
 }};
}
