import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {compileItem} from '../server/preview-service.mjs';
const root=path.resolve('public'),dataFile=path.join(root,'data/reactbits-demos.json'),data=JSON.parse(await fs.readFile(dataFile,'utf8')),demos=data.items||data;
const folder='../research/catalog-a/original-demos';
async function original(name){for(const group of await fs.readdir(folder)){try{return await fs.readFile(path.join(folder,group,name+'Demo.jsx'),'utf8');}catch{}}throw Error('Original demo missing: '+name);}
const firstURL=code=>code.match(/https:\/\/images\.unsplash\.com\/[^'"\s`]+/)?.[0];
const overrides={
 'reactbits--glare-hover':{'/photo.jpg':'/assets/demo/night-sky.webp'},
 'reactbits--noise':{'/photo.jpg':firstURL(await original('Noise'))},
 'reactbits--chroma-grid':{'/photos/field.jpg':'/assets/demo/day-landscape.webp','/photos/pier.jpg':'/assets/demo/day-portrait.webp'},
 'reactbits--carousel':{'/fields.jpg':'/assets/demo/day-landscape.webp','/moon.jpg':'/assets/demo/night-landscape.webp','/pier.jpg':'/assets/demo/day-portrait.webp'},
 'reactbits--fluid-glass':{'/hero.jpg':'/assets/demo/night-sky.webp'},
 'reactbits--ripple-distortion':{'/hero.jpg':firstURL(JSON.parse(await fs.readFile('public/code/runtime/reactbits--ripple-distortion.json','utf8')).files[0].content)},
 'reactbits--lanyard':{'/card-front.png':'/assets/original/reactbits/lanyard/card-front.webp','/card-back.png':'/assets/original/reactbits/lanyard/card-back.webp','/band.png':'/assets/original/reactbits/lanyard/lanyard.png'},
 'reactbits--profile-card':{'/path/to/portrait.png':'/assets/demo/person.webp','/path/to/pattern.png':'/assets/demo/iconpattern.png'},
 'reactbits--option-wheel':{'/sounds/click-soft.mp3':'/assets/sounds/click-soft.mp3'},
 'reactbits--reflective-card':{'/videos/reflection.mp4':'/assets/demo/reflection-night.mp4'},
 'reactbits--flip-card':{'/landscape.jpg':firstURL(await original('FlipCard'))},
 'reactbits--tear-ticket':{'/spectrum.jpg':firstURL(await original('TearTicket'))},
 'reactbits--paper-crumple':{'/your-image.png':'/assets/images/paper-crumple.jpg'},
 'reactbits--masked-heading':{'/reel.mp4':'/assets/demo/fuji-dawn.mp4','/reel-poster.jpg':firstURL(await original('MaskedHeading'))},
 'reactbits--staggered-menu':{'/src/assets/logos/reactbits-gh-white.svg':'/assets/original/reactbits/logos/reactbits-gh-white.svg','/path-to-your-logo.svg':'/assets/original/reactbits/logos/reactbits-gh-white.svg'}
};
const circular=JSON.parse(await fs.readFile('public/code/runtime/reactbits--circular-carousel.json','utf8')).files[0].content.match(/photo-\d+-[a-z\d]+/g);
overrides['reactbits--circular-carousel']=Object.fromEntries(['/images/valley.jpg','/images/portrait.jpg','/images/towers.jpg'].map((file,i)=>[file,'https://images.unsplash.com/'+circular[i]+'?w=900&q=80&auto=format&fit=max&sat=-100']));
const spiral=[...(await original('InfiniteSpiral')).matchAll(/https:\/\/images\.unsplash\.com\/[^'"\s`]+/g)].map(m=>m[0]);overrides['reactbits--infinite-spiral']=Object.fromEntries(Array.from({length:6},(_,i)=>['/images/landscape-'+(i+1)+'.jpg',spiral[i]]));
const flex=JSON.parse(await fs.readFile('public/code/runtime/reactbits--flex-carousel.json','utf8')).files[0].content.match(/photo-\d+-[a-z\d]+/g);if(flex?.length>=3)overrides['reactbits--flex-carousel']=Object.fromEntries(['/images/one.jpg','/images/two.jpg','/images/three.jpg'].map((file,i)=>[file,'https://images.unsplash.com/'+flex[i]+'?w=1200&q=80&auto=format&fit=max']));
await fs.mkdir(path.join(root,'assets/demo-recovered'),{recursive:true});
for(const map of Object.values(overrides))for(const [from,to]of Object.entries(map)){if(!to)throw Error('Missing original media '+from);if(!to.startsWith('https:'))continue;const file='/assets/demo-recovered/'+crypto.createHash('sha256').update(to).digest('hex').slice(0,24)+'.jpg';try{await fs.access(path.join(root,file));}catch{const response=await fetch(to,{signal:AbortSignal.timeout(20000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Original media unavailable '+to);await fs.writeFile(path.join(root,file),new Uint8Array(await response.arrayBuffer()));}map[from]=file;}
const changed=[];
for(const [id,demo]of Object.entries(demos)){
 let entry=demo.entry;if(typeof entry!=='string')continue;
 for(const [from,to]of Object.entries(overrides[id]||{}))entry=entry.replaceAll(from,to);
 // A height-only wrapper inside a centered grid shrinks to zero width when its
 // child is a canvas or an absolutely positioned effect.
 entry=entry.replace(/style=\{\{\s*height:/g,"style={{ width: '100%', height:");
 if(id==='reactbits--click-spark')entry=entry.replace('{/* Your content here */}',"<div style={{width:'100%',height:420,display:'grid',placeItems:'center',border:'1px solid #333',borderRadius:20}}><h2>Clique para criar faíscas.</h2></div>");
 if(id==='reactbits--gradual-blur')entry=entry.replace('{/* Scrolling content */}',"{Array.from({length:12},(_,i)=><article key={i} style={{padding:24,borderBottom:'1px solid #333'}}><h2>Uma ideia, um novo horizonte.</h2><p>Role para experimentar o desfoque gradual sobre o conteúdo.</p></article>)}").replace("position: 'relative', height: 500","width:'100%', position: 'relative', height: 500");
 if(id==='reactbits--text-cursor')entry=entry.replace('<TextCursor',"<p style={{textAlign:'center',paddingTop:120,pointerEvents:'none'}}>Mova o cursor nesta área.</p><TextCursor");
 if(entry!==demo.entry){demo.entry=entry;changed.push(id);}
}
await fs.writeFile(dataFile,JSON.stringify(data));await fs.writeFile('var/audits/native-demo-repairs.json',JSON.stringify({changed,overrides},null,2));
for(const id of changed){try{await compileItem(id,{cache:false,persist:true});console.log('REBUILT',id);}catch(e){console.log('FAILED',id,e.message);process.exitCode=1;}}
