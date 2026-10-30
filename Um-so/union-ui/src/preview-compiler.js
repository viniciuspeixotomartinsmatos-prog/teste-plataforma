let initialized;
const esc=s=>s.replace(/<\/script/gi,'<\\/script');
export async function compilePreview(item,payload,theme,compiler){
 if(!payload?.files?.length)throw new Error('O código deste componente não está disponível localmente.');
 const esbuild=compiler||await import('esbuild-wasm');
 if(!compiler){initialized ||= esbuild.initialize({wasmURL:'/assets/esbuild.wasm',worker:true});await initialized;}
 const files=payload.files.filter(f=>typeof f.content==='string').map(f=>({...f,path:(f.path||f.name||'component.tsx').replace(/\\/g,'/')}));
 if(payload.demoCode)files.push({path:'union-demo.tsx',content:payload.demoCode});
 if(!payload.demoCode&&item.examples?.[0]?.codePath){try{const demo=await fetch(item.examples[0].codePath).then(r=>r.json());files.push(...(demo.files||[]).map(f=>({...f,path:'example/'+(f.path||f.name)})));}catch{}}
 const candidates=files.filter(f=>/\.[jt]sx?$/.test(f.path)&&!/(utils|hooks\/|use-)/.test(f.path));
 const main=candidates.find(f=>/union-demo|example\/|demo/.test(f.path))||candidates[0];
 if(!main)throw new Error('Este arquivo não é um componente React executável.');
 const utils='import {clsx} from "clsx";import {twMerge} from "tailwind-merge";export const cn=(...v)=>twMerge(clsx(v));';
 const noext=p=>p.replace(/\.(tsx?|jsx?)$/,'');
 const moduleName=path=>noext(path).split('/').pop();
 const entry=`import React from 'react';import{createRoot}from'react-dom/client';import * as Component from 'union-entry';const names=Object.keys(Component);const App=Component.default||Component[names.find(n=>/Demo|Example/.test(n))]||Component[names.find(n=>/^[A-Z]/.test(n))];if(!App)throw new Error('Escolha um exemplo de uso para este componente.');class Boundary extends React.Component{state={e:null};static getDerivedStateFromError(e){return{e}}render(){return this.state.e?React.createElement('div',{className:'error'},'Este componente precisa de props ou de um exemplo de uso. '+this.state.e.message):this.props.children}};createRoot(document.getElementById('root')).render(React.createElement(Boundary,null,React.createElement(App,{text:'Design without limits.',children:'Beautiful by design.',className:'union-example',items:[{title:'Design',description:'Build something beautiful.',url:'#',icon:React.createElement('span',null,'01')},{title:'Create',description:'Bring your ideas to life.',url:'#',icon:React.createElement('span',null,'02')}]})));`;
 const result=await esbuild.build({stdin:{contents:entry,loader:'tsx',resolveDir:'/'},bundle:true,write:false,outfile:'preview.js',format:'esm',jsx:'automatic',logLevel:'silent',plugins:[{name:'local-registry',setup(build){
 build.onResolve({filter:/.*/},args=>{
 if(args.path==='union-entry')return{path:main.path,namespace:'registry'};
 if(/(?:^|\/)utils$/.test(args.path))return{path:'union-utils',namespace:'registry'};
 if(args.path.startsWith('.')||args.path.startsWith('@/')||args.path.startsWith('~/')){
 const match=files.find(f=>moduleName(f.path)===moduleName(args.path));
 if(match)return{path:match.path,namespace:'registry'};
 if(/\.(css|glsl)$/.test(args.path))return{path:'empty-css',namespace:'registry'};
 throw new Error(`Dependência local não incluída: ${args.path}. O código está disponível na aba Código.`);
 }
 if(args.path==='next/image')return{path:'image-shim',namespace:'registry'};
 if(args.path==='next/link')return{path:'link-shim',namespace:'registry'};
 if(args.path==='next-themes')return{path:'theme-shim',namespace:'registry'};
 const spec=args.path.replace(/^framer-motion$/,'motion/react');
 const url=spec==='react'?'https://esm.sh/react@19.2.0':spec.startsWith('react/')?'https://esm.sh/react@19.2.0/'+spec.slice(6):spec.startsWith('react-dom')?'https://esm.sh/react-dom@19.2.0'+spec.slice(9)+'?external=react':'https://esm.sh/'+spec+'?external=react,react-dom';
 return{path:url,external:true};
 });
 build.onLoad({filter:/.*/,namespace:'registry'},args=>{if(args.path==='union-utils')return{contents:utils,loader:'js'};if(args.path==='empty-css')return{contents:'',loader:'js'};if(args.path==='image-shim')return{contents:'import React from "react";export default function Image({fill,priority,unoptimized,...p}){return <img {...p} style={{maxWidth:"100%",...p.style}}/>}',loader:'jsx'};if(args.path==='link-shim')return{contents:'import React from "react";export default function Link(p){return <a {...p}/>}',loader:'jsx'};if(args.path==='theme-shim')return{contents:`export const useTheme=()=>({theme:'${theme}',resolvedTheme:'${theme}',setTheme:()=>{}});`,loader:'js'};const file=files.find(f=>f.path===args.path);return{contents:file.content,loader:/\.tsx$/.test(file.path)?'tsx':/\.ts$/.test(file.path)?'ts':/\.css$/.test(file.path)?'css':'jsx'};});
 }}]});
 const css=files.filter(f=>f.path.endsWith('.css')).map(f=>f.content).join('\n');
 const js=result.outputFiles.find(f=>f.path.endsWith('.js'))?.text;
 if(!js)throw new Error('O exemplo não produziu uma aplicação executável.');
 return `<!doctype html><html class="${theme}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.16"></script><script type="importmap">{"imports":{"react":"https://esm.sh/react@19.2.0","react/jsx-runtime":"https://esm.sh/react@19.2.0/jsx-runtime","react-dom":"https://esm.sh/react-dom@19.2.0?external=react","react-dom/client":"https://esm.sh/react-dom@19.2.0/client?external=react"}}</script><style type="text/tailwindcss">@custom-variant dark (&:where(.dark,.dark *));@theme{--color-background:${theme==='dark'?'#09090b':'#fff'};--color-foreground:${theme==='dark'?'#fafafa':'#18181b'};--color-primary:#3b5bff;--color-muted:#27272a;--color-border:#3f3f46;--color-card:#111113;--color-accent:#27272a;--color-secondary:#27272a;--radius:0.75rem;}body{margin:0;font-family:system-ui;background:var(--color-background);color:var(--color-foreground)}#root{min-height:100vh;display:flex;justify-content:center;align-items:center;padding:32px;box-sizing:border-box;overflow:hidden}.error{font-size:13px;color:#a1a1aa;max-width:480px;line-height:1.7}${css}</style></head><body><div id="root"></div><script type="module">${esc(js)}</script></body></html>`;
}
