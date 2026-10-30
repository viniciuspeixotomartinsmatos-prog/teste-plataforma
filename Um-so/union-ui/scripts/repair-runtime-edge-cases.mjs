import fs from 'node:fs/promises';
import esbuild from 'esbuild';
import {compileItem} from '../server/preview-service.mjs';
const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));
const getHTML=async id=>{const row=rows.find(r=>r.id===id);const file='public'+(row.runtimePreviewPath||row.previewPath);return{row,file,html:await fs.readFile(file,'utf8')}};
// Bundle the recovered Markdown source locally: its external module imports
// failed in opaque preview frames, despite the original JSX being complete.
{
 const {file,html}=await getHTML('21st-fa6fb3a3c735');const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].sort((a,b)=>b[1].length-a[1].length);const original=scripts[0];
 if(/from "react-markdown"/.test(original[1])){const built=await esbuild.build({stdin:{contents:original[1],resolveDir:process.cwd(),sourcefile:'recovered-markdown.jsx',loader:'jsx'},bundle:true,write:false,format:'iife',minify:true});let next=html.replace(original[0],()=>'<script>'+built.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');next=next.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace(/<script src=['"]https:\/\/cdn.tailwindcss.com['"]><\/script>/,'');next=next.replace('</head>','<style>body{margin:0;font:16px system-ui;background:#09090b;color:#fafafa}#root>div{min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}.an-markdown{max-width:42rem}pre{padding:16px;background:#18181b;border-radius:10px}h1{font-size:2rem}h2{font-size:1.4rem}</style></head>');await fs.writeFile(file,next);console.log('Locally bundled Markdown');}
}
// The upstream ASCII renderer starts its frame loop before its first size
// effect. Initialize from the canvas, then skip zero-size resize frames.
{
 const {file,html}=await getHTML('21st-d0e4067d93f1');let next=html.replace('function se(ce){D.clearRect(0,0,R,C)','function se(ce){if(!Number.isFinite(R)||!Number.isFinite(C)||R<1||C<1){x=O.clientWidth||O.width;_=O.clientHeight||O.height;if(!x||!_)return;I()}D.clearRect(0,0,R,C)');await fs.writeFile(file,next);console.log('ASCII first-frame sizing fixed');
 const manifest=JSON.parse(await fs.readFile('public/data/demo-local-assets.json','utf8'));const url='https://danielcodepen.s3.us-east-1.amazonaws.com/figma.fbx.glb';manifest.urls[url]='/assets/demo-examples/figma-original.glb';manifest.items['21st-d0e4067d93f1'][url]=manifest.urls[url];await fs.writeFile('public/data/demo-local-assets.json',JSON.stringify(manifest));
}
// Restore the same particle effect with the compatible installed tsParticles
// implementation, keeping the captured example's density/color/size settings.
{
 const id='21st-f133768758ce',codePath='/code/reconstructed/'+id+'.json';const payload=JSON.parse(await fs.readFile('public/code/runtime/aceternity--sparkles.json','utf8'));
 payload.demoCode=`import React from 'react';import {SparklesCore} from './components/ui/sparkles';export default function Demo(){return <div style={{height:'100vh',width:'100%',background:'#000'}}><SparklesCore background="transparent" minSize={0.48} maxSize={1.2} particleDensity={800} className="w-full h-full" particleColor="#FFFFFF" speed={1}/></div>}`;
 payload.demoPath='demo.jsx';payload.restoration={reason:'Captured tsParticles bundle used an incompatible engine; restored SparklesCore with installed compatible packages.'};await fs.mkdir('public/code/reconstructed',{recursive:true});await fs.writeFile('public'+codePath,JSON.stringify(payload));const patches=JSON.parse(await fs.readFile('public/data/catalog-connected.json','utf8'));patches[id]={...patches[id],availability:'code',codePath};await fs.writeFile('public/data/catalog-connected.json',JSON.stringify(patches));const built=await compileItem(id,{cache:false,persist:true});const ready=JSON.parse(await fs.readFile('public/data/preview-readiness.json','utf8'));ready.items=ready.items.filter(r=>r.id!==id);ready.items.push({id,status:'ready',hasDemo:true,framework:'react',sourceId:'21st',previewPath:built.previewPath,kind:'restored-compatible-engine'});ready.ready=ready.items.filter(r=>r.status==='ready').length;ready.checked=ready.items.length;await fs.writeFile('public/data/preview-readiness.json',JSON.stringify(ready));console.log('Restored compatible Sparkles engine');
}

// The captured Warp Gradient references a missing .app-container rule.
// Its absolute canvas needs a sized, positioned parent to draw any pixels.
{
 const {file,html}=await getHTML('21st-96d1b7e8f0f7');
 if(!html.includes('data-umso-warp-layout'))await fs.writeFile(file,html.replace('</head>','<style data-umso-warp-layout>.app-container{position:relative;width:100vw;min-height:100vh;overflow:hidden}.content-container{position:relative;z-index:1}</style></head>'));
}
