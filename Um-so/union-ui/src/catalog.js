export const categoryLabels = {'Heroes':'Hero sections','Backgrounds':'Backgrounds & shaders','Text effects':'Efeitos de texto','Buttons':'Botões','Navigation':'Navegação','Cards':'Cards & bento','AI & inputs':'IA, inputs & forms','Galleries':'Galerias & carrosséis','Pricing':'Preços','Testimonials':'Depoimentos','Footers':'Rodapés','Dashboards':'Dashboards','Authentication':'Autenticação','Interactions':'Motion & interações','Icons':'Ícones','Utilities':'Utilitários','Components':'Outros componentes'};
export const kindLabels={all:'Tudo',component:'Componentes',block:'Blocos',template:'Templates',theme:'Temas',shader:'Shaders',icon:'Ícones',app:'Apps',page:'Páginas',hook:'Hooks',motion:'Motion design'};
export const formatCount=n=>new Intl.NumberFormat('pt-BR').format(n||0);
export const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const synonyms={botao:'button',botoes:'button',texto:'text',fundo:'background',fundos:'background',animacao:'animation',animacoes:'animation',animado:'animated',cartao:'card',cartoes:'card',navegacao:'navigation',galeria:'gallery',depoimentos:'testimonial',precos:'pricing',carrossel:'carousel',icone:'icon',icones:'icon',formulario:'form'};
const sourceNames={'21st':'21st dev',aceternity:'aceternity ui',magic:'magic ui',reactbits:'react bits',kokonut:'kokonut ui',shadcnblocks:'shadcn blocks',motion:'motion primitives',tailark:'tailark',animate:'animate ui'};
const featuredNames=['Aurora','Shader Animation','3D Card Hover Tilt Effect','Magic Bento','Scroll media expansion hero','Bento Grid Component','Liquid Glass Button','Orb','Background Beams Animation','Split Text','Spotlight Card','Animated hero','3D Gallery Photography','Dusk Hero Section 8','Card Swap','Text Rotate','Star Border'];
export function prepareCatalog(rows){return rows.map((r,i)=>({...r,_order:i,_featuredRank:r.image&&featuredNames.includes(r.name)?featuredNames.indexOf(r.name):-1,_search:normalize([r.name,r.description,r.slug,r.sourceId,sourceNames[r.sourceId],r.author,r.category,...r.tags||[]].join(' '))}));}
export function searchCatalog(rows,{q='',source='all',category='all',kind='all',codeOnly=false,savedOnly=false,saved=[],sort='featured'}={}){
 const words=normalize(q).trim().split(/\s+/).filter(w=>w&&!['de','do','da','com','para','e','the','a','an','and','with'].includes(w)).map(w=>synonyms[w]||w);
 const savedSet=new Set(saved);
 const list=rows.filter(r=>(source==='all'||r.sourceId===source)&&(category==='all'||r.category===category)&&(kind==='all'||r.kind===kind)&&(!codeOnly||r.availability==='code')&&(!savedOnly||savedSet.has(r.id))&&words.every(w=>r._search.includes(w)));
 if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sort==='source')list.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)||a.name.localeCompare(b.name));
 else if(sort==='recent')list.sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
 else if(words.length)list.sort((a,b)=>Number(words.every(w=>normalize(b.name).includes(w)))-Number(words.every(w=>normalize(a.name).includes(w)))||Number(Boolean(b.image))-Number(Boolean(a.image)));
 else list.sort((a,b)=>Number(b._featuredRank>=0)-Number(a._featuredRank>=0)||(a._featuredRank>=0&&b._featuredRank>=0?a._featuredRank-b._featuredRank:0)||Number(Boolean(b.featured))-Number(Boolean(a.featured))||Number(Boolean(b.image))-Number(Boolean(a.image))||a._order-b._order);
 return list;
}
export function safeStored(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}}
export async function copyText(text){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}const field=document.createElement('textarea');field.value=text;document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('Não foi possível acessar a área de transferência.');}
export function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});downloadBlob(blob,name);}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function sourceOf(sources,id){return sources.find(s=>s.id===id)||{id,name:id,color:'#8b8b98'};}
