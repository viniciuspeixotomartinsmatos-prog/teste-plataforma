import {promises as fs} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),base=path.join(root,'public','code'),dest=path.join(root,'.preview-sources');
await fs.mkdir(dest,{recursive:true});
async function* walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())yield*walk(p);else if(e.name.endsWith('.json'))yield p;}}
let count=0;
for await(const p of walk(base)){const data=JSON.parse(await fs.readFile(p,'utf8'));let text=(data.files||[]).map(f=>f.content||'').join('\n')+'\n'+(data.demoCode||'');if(!text.trim())continue;await fs.writeFile(path.join(dest,`${count++}.tsx`),text);}
try{const demos=JSON.parse(await fs.readFile('public/data/runtime-demos.json','utf8'));for(const [id,demo] of Object.entries(demos))await fs.writeFile(path.join(dest,'demo-'+id.replace(/[^a-zA-Z0-9_-]/g,'')+'.tsx'),(demo.entry||'')+'\n'+(demo.files||[]).map(f=>f.content||'').join('\n'));}catch{}
for(const name of ['runtime-overrides','reactbits-demos']){try{const demos=JSON.parse(await fs.readFile('public/data/'+name+'.json','utf8'));for(const [id,demo] of Object.entries(demos))await fs.writeFile(path.join(dest,name+'-'+id.replace(/[^a-zA-Z0-9_-]/g,'')+'.tsx'),demo.entry||'');}catch{}}
const input=String.raw`@import "tailwindcss" source(none);
@import "tw-animate-css";
@plugin "@tailwindcss/typography";
@source "../.preview-sources";
@custom-variant dark (&:where(.dark,.dark *));
@theme inline {
--color-background:var(--background);--color-foreground:var(--foreground);--color-card:var(--card);--color-card-foreground:var(--card-foreground);--color-popover:var(--popover);--color-popover-foreground:var(--popover-foreground);--color-primary:var(--primary);--color-primary-foreground:var(--primary-foreground);--color-secondary:var(--secondary);--color-secondary-foreground:var(--secondary-foreground);--color-muted:var(--muted);--color-muted-foreground:var(--muted-foreground);--color-accent:var(--accent);--color-accent-foreground:var(--accent-foreground);--color-border:var(--border);--color-input:var(--input);--color-ring:var(--ring);--radius:0.75rem;--radius-lg:var(--radius);--radius-md:calc(var(--radius) - 2px);--radius-sm:calc(var(--radius) - 4px);
--animate-shimmer:shimmer 2s linear infinite;--animate-rainbow:rainbow 2s infinite linear;--animate-marquee:marquee var(--duration,40s) infinite linear;--animate-marquee-vertical:marquee-vertical var(--duration,40s) linear infinite;--animate-ripple:ripple var(--duration,2s) ease infinite;--animate-shiny-text:shiny-text 8s infinite;--animate-shine:shine 8s ease-in-out infinite;--animate-meteor:meteor 5s linear infinite;--animate-aurora:aurora 60s linear infinite;
@keyframes shimmer{to{transform:translateX(100%)}}@keyframes rainbow{0%{background-position:0%}100%{background-position:200%}}@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(calc(-100% - var(--gap,1rem)))}}@keyframes marquee-vertical{from{transform:translateY(0)}to{transform:translateY(calc(-100% - var(--gap,1rem)))}}@keyframes ripple{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(.9)}}@keyframes shiny-text{0%,90%,100%{background-position:calc(-100% - var(--shiny-width,100px)) 0}30%,60%{background-position:calc(100% + var(--shiny-width,100px)) 0}}@keyframes shine{0%,90%,100%{background-position:calc(-100% - var(--shiny-width,40px)) 0}30%,60%{background-position:calc(100% + var(--shiny-width,40px)) 0}}@keyframes meteor{0%{transform:rotate(215deg) translateX(0);opacity:1}70%{opacity:1}100%{transform:rotate(215deg) translateX(-500px);opacity:0}}@keyframes aurora{from{background-position:50% 50%,50% 50%}to{background-position:350% 50%,350% 50%}}
}
@font-face{font-family:Inter;src:url('/assets/fonts/Inter.woff2') format('woff2');font-display:swap;font-weight:100 900}
`;
await fs.mkdir('styles',{recursive:true});await fs.writeFile('styles/preview.css',input);
const result=spawnSync(process.execPath,[path.join(root,'node_modules','@tailwindcss','cli','dist','index.mjs'),'-i','styles/preview.css','-o','public/assets/preview.css','--minify'],{stdio:'inherit',cwd:root});
if(result.status!==0)process.exit(result.status||1);const stat=await fs.stat('public/assets/preview.css');console.log(JSON.stringify({sourceFiles:count,cssBytes:stat.size}));
