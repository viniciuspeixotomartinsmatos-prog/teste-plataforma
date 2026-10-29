import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {createRequire,isBuiltin} from 'node:module';
import {localize} from '../server/tool-adapters/localize.mjs';
const require=createRequire(import.meta.url),app=process.cwd(),root=path.resolve('../research/reactbits-tools');
const normalize=s=>s.replaceAll('\\','/');
const entries={'sound-lab':'SoundLab','background-studio':'BackgroundStudio','texture-lab':'TextureLab','shape-magic':'ShapeMagic','center-stage':'CenterStage'};
const labels={'sound-lab':'Laboratório de áudio','background-studio':'Estúdio de fundos','texture-lab':'Laboratório de texturas','shape-magic':'Estúdio de formas','center-stage':'Estúdio de apresentação'};
const fonts=[['geist-sans/Geist-Variable.woff2','Geist-Sans.woff2'],['geist-sans/Geist-Italic[wght].woff2','Geist-Sans-Italic.woff2'],['geist-mono/GeistMono-Variable.woff2','Geist-Mono.woff2'],['geist-mono/GeistMono-Italic[wght].woff2','Geist-Mono-Italic.woff2']];
await fs.mkdir('public/assets/fonts',{recursive:true});
for(const [remote,name]of fonts){const local='public/assets/fonts/'+name;try{await fs.access(local);}catch{const response=await fetch('https://cdn.jsdelivr.net/npm/geist@1.8.2/dist/fonts/'+remote.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Original tool font unavailable: '+name);await fs.writeFile(local,Buffer.from(await response.arrayBuffer()));}}
let fontCSS='';for(const [index,[,name]]of fonts.entries())fontCSS+=`@font-face{font-family:'${index<2?'Geist':'Geist Mono'}';src:url('/assets/fonts/${name}') format('woff2');font-weight:100 900;font-style:${index%2?'italic':'normal'};font-display:swap}`;
const imports=Object.entries(entries).map(([id,name])=>`'${id}':()=>import('./tools/${id}/${name}.jsx')`).join(',');
const main=`import React,{Suspense,useEffect,lazy} from 'react';import{createRoot}from'react-dom/client';import{ChakraProvider,defaultSystem}from'@chakra-ui/react';import{ThemeProvider,useTheme}from'next-themes';import{BrowserRouter}from'react-router-dom';import{Toaster}from'sonner';import{OptionsProvider}from'./components/context/OptionsContext/OptionsContext';import './styles.css';import './umso-frame.css';
const params=new URLSearchParams(location.search),tool=params.get('tool')||'sound-lab',theme=params.get('theme')==='light'?'light':'dark',labels=${JSON.stringify(labels)},modules={${imports}};let failed=false;const send=(type,message)=>{if(type==='tool-error')failed=true;if(type==='tool-ready'&&failed)return;parent.postMessage({type,tool,message},location.origin)};window.addEventListener('error',event=>{if(event.target===window)send('tool-error',event.message)});window.addEventListener('unhandledrejection',event=>send('tool-error',String(event.reason?.message||event.reason)));
class Boundary extends React.Component{state={error:null};static getDerivedStateFromError(error){return{error}}componentDidCatch(error){send('tool-error',error.message)}render(){return this.state.error?<div role="alert">Não foi possível abrir a ferramenta. Recarregue para tentar novamente.</div>:this.props.children}}
const Tool=lazy(modules[tool]||modules['sound-lab']);function Ready(){useEffect(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>send('tool-ready')))},[]);return null}function FrameTheme({children}){const{resolvedTheme,setTheme}=useTheme();useEffect(()=>setTheme(theme),[]);useEffect(()=>{document.documentElement.dataset.theme=resolvedTheme||theme},[resolvedTheme]);return children}
const selector=<select aria-label="Escolher ferramenta" value={tool} onChange={event=>parent.postMessage({type:'tool:navigate',tool,id:event.target.value},location.origin)}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>;
createRoot(document.getElementById('root')).render(<Boundary><ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}><FrameTheme><ChakraProvider value={defaultSystem}><BrowserRouter><OptionsProvider><Suspense fallback={<div className="frame-starting">Abrindo seu estúdio…</div>}><Tool toolSelector={selector}/><Ready/></Suspense><Toaster theme={theme} position="bottom-right"/></OptionsProvider></BrowserRouter></ChakraProvider></FrameTheme></ThemeProvider></Boundary>);`;
await fs.writeFile(path.join(root,'src/umso-frame.jsx'),main);
const originalStyles=await fs.readFile(path.join(root,'src/styles.css'),'utf8');
await fs.writeFile(path.join(root,'src/umso-global.css'),originalStyles.replace("@import './css/fonts.css';",'').replace("@import 'tailwindcss';","@import '"+normalize(path.join(app,'node_modules/tailwindcss/index.css'))+"' source(none); @source './';")+'\n'+fontCSS);
await fs.writeFile(path.join(root,'src/umso-frame.jsx'),main.replace("'./styles.css'","'./umso-global.css'"));
await fs.writeFile(path.join(root,'src/umso-shape-code.jsx'),await fs.readFile('server/tool-adapters/ShapeCodeExport.jsx','utf8'));
await fs.writeFile(path.join(root,'src/umso-frame.css'),`:root{--color-primary:#b9eaa4;--color-accent:#b9eaa4;--bg-card:#141517;--bg-hover:#24252a;--border-primary:#292a30;--border-secondary:#292a30;--bg-body:#0a0a0b;--bg-primary:#0a0a0b;--bg-secondary:#111214;--bg-surface:#141517;--bg-elevated:#191a1e;--text-primary:#f5f5f6;--text-secondary:#a0a1aa;--text-dimmed:#70717b;--border-color:#292a30;--border-subtle:#23242a;--accent:#b9eaa4;--font-geist-sans:Geist,Inter,sans-serif;--font-geist-mono:'Geist Mono',monospace}html[data-theme='light']{--bg-body:#fafafa;--bg-primary:#fff;--bg-secondary:#f1f2f4;--bg-surface:#f4f4f5;--bg-elevated:#fff;--text-primary:#16171b;--text-secondary:#656772;--text-dimmed:#858691;--border-color:#dfe0e5;--border-subtle:#e9e9ed}html,body,#root{margin:0;width:100%;height:100%;min-height:0;background:var(--bg-body);color:var(--text-primary);font-family:var(--font-geist-sans)}body{padding:14px;box-sizing:border-box}#root>div{max-width:100%}button,input,select{font:inherit}select[aria-label='Escolher ferramenta']{background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;padding:9px;font-size:12px;width:100%}.frame-starting{display:grid;place-items:center;height:100%}@media(max-width:600px){body{padding:8px}}`);
await fs.appendFile(path.join(root,'src/umso-frame.css'),'\n'+await fs.readFile('server/tool-adapters/code.css','utf8'));
await fs.writeFile(path.join(root,'umso.html'),'<!doctype html><html lang="pt-BR" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Um só. — Ferramentas</title></head><body><div id="root"></div><script type="module" src="/src/umso-frame.jsx"></script></body></html>');
const sourceAliases=['content','tailwind','ts-default','ts-tailwind'].map(name=>({find:'@'+name,replacement:normalize(path.join(root,'src',name))}));
sourceAliases.push({find:'@',replacement:normalize(path.join(root,'src'))});
const rewrite={name:'unified-tool-paths',enforce:'pre',async load(id){
 if(normalize(id)===normalize(path.join(root,'src/css/fonts.css')))return fontCSS;
 if(normalize(id)===normalize(path.join(root,'src/components/code/CodeExample.jsx'))){
  const original=await fs.readFile(id,'utf8'),helper=original.slice(original.indexOf('export function injectPropsIntoCode'),original.indexOf('const CodeExample ='));
  return (await fs.readFile('server/tool-adapters/CodeExample.jsx','utf8'))+'\n'+helper;
 }
 if(normalize(id)===normalize(path.join(root,'src/hooks/useAIExportActions.js')))return fs.readFile('server/tool-adapters/useAIExportActions.js','utf8');
 if(normalize(id.split('?')[0]).startsWith(normalize(root))&&/\.(jsx?|tsx?)$/.test(id)){
  let source=await fs.readFile(id,'utf8');
  if(normalize(id).includes('/src/tools/'))source=localize(source);
  source=source.replaceAll("'/studio-frame.html'","'/tools-runtime/studio-frame.html'").replaceAll("'/shape-frame.html'","'/tools-runtime/shape-frame.html'");
  if(normalize(id).endsWith('/CaptureDialog.jsx'))source=source.replace("'https://reactbits.dev/center-stage.js'","window.location.origin+'/center-stage.js'").replace('Only answers Center Stage on reactbits.dev or your localhost.','Responde somente ao seu estúdio e ao localhost.').replace('src="${HELPER_SRC}" async','src="${HELPER_SRC}" data-allow="${window.location.origin}" async');
  if(/\/(controls|chrome|devices|CenterStage)\.[jt]sx?$/.test(id))source=source.replaceAll('reactbits.dev','seu-projeto.com');
  if(normalize(id).endsWith('/presets/legacy.js'))source=source.replace('Built with React Bits in an afternoon','Criado no Um só.');
  if(normalize(id).endsWith('/utils/aiPrompt.js'))source=source.replace('component from React Bits','component from Um só.');
  if(normalize(id).endsWith('/shape-magic/components/ExportDialog.jsx'))source="import UnifiedShapeCode from '@/umso-shape-code.jsx';\n"+source.replace(/<div className="smg-code smg-full">[\s\S]*?<\/div>/,'<UnifiedShapeCode material={material} code={code} svg={svg} name={name}/>');
  if(normalize(id).endsWith('/center-stage/share.js'))source=source.replace('const url = new URL(window.location.href);',"const url = new URL('/tools/center-stage',window.location.origin);");
  if(normalize(id).endsWith('/tools/background-studio/components/Panel.jsx'))source=source.replace('<a className="bs-docs-link" href={docsHref} target="_blank" rel="noreferrer">','<button type="button" className="bs-docs-link" onClick={()=>parent.postMessage({type:"tool:catalog",tool:"background-studio",name:entry.label},location.origin)}>').replace('Open in docs','Ver no catálogo').replace('</a>','</button>');
  if(normalize(id).endsWith('/tools/background-studio/BackgroundStudio.jsx'))source=source.replace('${window.location.pathname}?${query}', '/tools/background-studio?${query}');
  if(normalize(id).endsWith('/tools/texture-lab/share.js'))source=source.replace('${window.location.pathname}#style=', '/tools/texture-lab#style=');
  if(normalize(id).endsWith('/tools/center-stage/media.js'))source=source.replaceAll('/assets/center-stage/desktop.webp','/assets/center-stage/desktop.svg').replaceAll('/assets/center-stage/desktop-light.webp','/assets/center-stage/desktop-light.svg').replaceAll('/assets/center-stage/mobile.webp','/assets/center-stage/mobile.svg');
  if(/\/(sounds\/share|texture-lab\/share)\.js$/.test(normalize(id)))source=source.replace('const url = new URL(window.location.href);',`const url = new URL('/tools/${normalize(id).includes('/sounds/')?'sound-lab':'texture-lab'}',window.location.origin);`);
  return source;
 }
}};
const dependencies={name:'tool-dependencies',enforce:'pre',async resolveId(source,importer){if(source==='fflate')return path.join(app,'node_modules/fflate/esm/browser.js');if(source==='mediabunny')return path.join(app,'node_modules/mediabunny/dist/modules/src/index.js');if(importer&&!isBuiltin(source)&&!source.startsWith('.')&&!source.startsWith('/')&&!source.startsWith('\0')&&!/^[A-Za-z]:/.test(source)){try{return require.resolve(source);}catch{return null;}}}};
try{await build({configFile:false,logLevel:'warn',root,publicDir:false,base:'/tools-runtime/',worker:{plugins:()=>[dependencies]},plugins:[rewrite,dependencies,tailwindcss(),react()],resolve:{alias:sourceAliases},build:{outDir:path.join(app,'public/tools-runtime'),emptyOutDir:true,sourcemap:false,chunkSizeWarningLimit:2000,rollupOptions:{input:{umso:path.join(root,'umso.html'),studio:path.join(root,'studio-frame.html'),shape:path.join(root,'shape-frame.html')}}}});}catch(error){console.error(error.message);process.exit(1);}
const assets=path.join(root,'public/assets');
try{await fs.cp(assets,path.join(app,'public/assets'),{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}
let notices=await fs.readFile('public/licenses/ATTRIBUTIONS.md','utf8');
for(const tool of ['texture-lab','shape-magic'])notices+='\n\n'+await fs.readFile(path.join(root,'src/tools',tool,'THIRD_PARTY_NOTICES.md'),'utf8');
notices+='\n\n'+await fs.readFile('public/licenses/catalog-a-reactbits-license.md','utf8');
await fs.writeFile('public/licenses/THIRD_PARTY_NOTICES.md',notices);
let helper=await fs.readFile(path.join(root,'public/center-stage.js'),'utf8');
helper=helper.replace("if (hostname === 'reactbits.dev' || hostname === 'www.reactbits.dev') return protocol === 'https:';",'');
await fs.writeFile('public/center-stage.js',helper);
await import('./prepare-tool-assets.mjs');
console.log('Five tools and their isolated render frames built successfully.');
