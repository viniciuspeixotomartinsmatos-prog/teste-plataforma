import fs from 'node:fs/promises';
import {compileItem} from '../server/preview-service.mjs';
const id='reactbits--splash-cursor',file='public/data/runtime-overrides.json';
const overrides=JSON.parse(await fs.readFile(file,'utf8')),demos=JSON.parse(await fs.readFile('public/data/reactbits-demos.json','utf8'));
const original=JSON.parse(await fs.readFile('public/code/a/reactbits/SplashCursor-TS-TW.json','utf8')).files[0];
// Add startup callbacks only to the compiled adapter copy; retain original separately.
let gpu=original.content.replace('function SplashCursor({','function SplashCursor({\n  onPresented, onUnavailable,').replace('}: SplashCursorProps)', '}: SplashCursorProps & {onPresented?:()=>void;onUnavailable?:()=>void})');
for(const condition of ['!gl','!renderable(rgba.internal, rgba.format)','broken'])gpu=gpu.replace('if ('+condition+') return undefined;', 'if ('+condition+') { onUnavailable?.(); return undefined; }');
gpu=gpu.replace('      render();','      render();\n      if (introStart < 0 || now > introStart + 200) onPresented?.();');
gpu=gpu.replace('      lost = true;','      lost = true;\n      onUnavailable?.();');
gpu=gpu.replace('    if (broken) {','    if (broken) {\n      onUnavailable?.();');
gpu=gpu.replace('  useEffect(() => {\n    const canvas = canvasRef.current;', '  useEffect(() => {\n    try {\n    const canvas = canvasRef.current;').replace('  }, [generation]);', '    } catch { onUnavailable?.(); return undefined; }\n  }, [generation]);');
if(!gpu.includes('onPresented?.();'))throw Error('Original renderer startup location changed.');
overrides[id]={...demos[id],kind:'original-webgl-with-compatible-canvas',files:[
 {path:original.path,content:await fs.readFile('src/demos/SplashCursorCompatible.jsx','utf8')},
 {path:'SplashCursor/SplashCursorGPU.tsx',content:gpu},
 {path:'SplashCursor/splash-cursor-canvas.js',content:await fs.readFile('src/demos/splash-cursor-canvas.js','utf8')},
 {path:'original/SplashCursor.original.tsx',content:original.content},
 {path:'RENDERER-NOTES.md',content:'Original WebGL fluid simulation with startup callbacks and context-loss handling. Canvas 2D fallback uses swirling ink particles; it is not pixel-identical to the original shaders. Original source retained under original/.'}
]};
await fs.writeFile(file,JSON.stringify(overrides));
const result=await compileItem(id,{cache:false,persist:true});console.log(JSON.stringify({preview:result.previewPath,bytes:result.bytes}));
