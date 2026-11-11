import {concepts,queryTerms,matchIntent,semanticIntent} from './search-language.js';
export const categoryLabels = {'Heroes':'Hero sections','Backgrounds':'Backgrounds & shaders','Text effects':'Efeitos de texto','Buttons':'Botões','Navigation':'Navegação','Cards':'Cards & bento','AI & inputs':'IA, inputs & forms','Galleries':'Galerias & carrosséis','Pricing':'Preços','Testimonials':'Depoimentos','Footers':'Rodapés','Dashboards':'Dashboards','Authentication':'Autenticação','Interactions':'Motion & interações','Icons':'Ícones animados','Utilities':'Utilitários','Components':'Outros componentes'};
export const kindLabels={all:'Tudo',component:'Componentes',block:'Blocos',template:'Templates',theme:'Temas',shader:'Shaders',icon:'Ícones',app:'Apps',page:'Páginas',hook:'Hooks',motion:'Motion design'};
export const formatCount=n=>new Intl.NumberFormat('pt-BR').format(n||0);
export const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const synonyms={botao:'button',botoes:'button',texto:'text',fundo:'background',fundos:'background',animacao:'animation',animacoes:'animation',animado:'animated',cartao:'card',cartoes:'card',navegacao:'navigation',galeria:'gallery',depoimentos:'testimonial',precos:'pricing',carrossel:'carousel',icone:'icon',icones:'icon',formulario:'form'};
const sourceNames={'21st':'21st dev',aceternity:'aceternity ui',magic:'magic ui',reactbits:'react bits',kokonut:'kokonut ui',shadcnblocks:'shadcn blocks',motion:'motion primitives',tailark:'tailark',animate:'animate ui'};
const featuredNames=['Aurora','Shader Animation','3D Card Hover Tilt Effect','Magic Bento','Scroll media expansion hero','Bento Grid Component','Liquid Glass Button','Orb','Background Beams Animation','Split Text','Spotlight Card','Animated hero','3D Gallery Photography','Dusk Hero Section 8','Card Swap','Text Rotate','Star Border'];
export function prepareCatalog(rows){return rows.map((r,i)=>({...r,_order:i,_featuredRank:r.image&&featuredNames.includes(r.name)?featuredNames.indexOf(r.name):-1,_concepts:concepts([r.name,r.description,r.slug,r.category,...r.tags||[]].join(' ')),_search:normalize([r.name,r.description,r.slug,r.sourceId,sourceNames[r.sourceId],r.author,r.category,...r.tags||[]].join(' '))}));}
export function searchCatalog(rows,{q='',source='all',category='all',kind='all',codeOnly=false,savedOnly=false,saved=[],sort='featured'}={}){
 const words=queryTerms(q),ranks=new Map();
 const related=words.length ? rows.semanticSearch?.(words) : null;
 const savedSet=new Set(saved);
 const list=rows.filter(r=>(source==='all'||r.sourceId===source)&&(category==='all'||r.category===category)&&(kind==='all'||r.kind===kind)&&(!codeOnly||r.availability==='code')&&(!savedOnly||savedSet.has(r.id))&&(()=>{const rank=matchIntent(r._search,r._concepts||concepts(r._search),words,q) || (semanticIntent(r,words)?related?.get(r.id):0) || 0;ranks.set(r.id,rank);return rank>0;})());
 if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='source')list.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)||a.name.localeCompare(b.name));
 else if(sort==='recent')list.sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
 else if(words.length)list.sort((a,b)=>(ranks.get(b.id)||0)-(ranks.get(a.id)||0)||Number(normalize(b.name)===normalize(q))-Number(normalize(a.name)===normalize(q))||Number(Boolean(b.image))-Number(Boolean(a.image)));
 else list.sort((a,b)=>Number(b._featuredRank>=0)-Number(a._featuredRank>=0)||(a._featuredRank>=0&&b._featuredRank>=0?a._featuredRank-b._featuredRank:0)||Number(Boolean(b.featured))-Number(Boolean(a.featured))||Number(Boolean(b.image))-Number(Boolean(a.image))||a._order-b._order);
 return list;
}
export function safeStored(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}}
export async function copyText(text){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}const field=document.createElement('textarea');field.value=text;document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('Não foi possível acessar a área de transferência.');}
export function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});downloadBlob(blob,name);}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function sourceOf(sources,id){return sources.find(s=>s.id===id)||{id,name:id,color:'#8b8b98'};}

// Explicitly reviewed families; a matching generic title alone never merges arbitrary records.
const variantNames=new Set(['aurora','orb','split text','spotlight card','dusk hero section 8']);
const pairedVariants = new Map();
for (const slug of ['backgrounds-bubble','backgrounds-fireworks','backgrounds-glyph','backgrounds-gradient','backgrounds-gravity-stars','backgrounds-hexagon','backgrounds-stars','backgrounds-topography','buttons-flip','buttons-github-stars','buttons-liquid','buttons-theme-toggler','components-code-block']) {
  pairedVariants.set('animate-'+slug,slug);
  pairedVariants.set('animate-vue-'+slug,slug);
}
export function catalogVariants(item,rows){if(item && pairedVariants.has(item.id))return rows.filter(row=>pairedVariants.get(row.id)===pairedVariants.get(item.id));if(!item||!variantNames.has(normalize(item.name)))return item?[item]:[];return rows.filter(row=>normalize(row.name)===normalize(item.name)&&row.kind===item.kind&&row.category===item.category);}
export function groupCatalogResults(rows){const seen=new Map(),result=[];for(const row of rows){const key=pairedVariants.get(row.id) || (variantNames.has(normalize(row.name))?[normalize(row.name),row.kind,row.category].join(':'):row.id);const existing=seen.get(key);if(existing){existing._variants.push(row);continue;}const entry={...row,_variants:[row]};seen.set(key,entry);result.push(entry);}return result;}
