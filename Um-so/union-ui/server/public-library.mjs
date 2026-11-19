import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../public/data/catalog-live.json',import.meta.url),'utf8'));
const items=new Map(catalog.filter(row=>row.previewPath && row.availability==='code' && /^[a-z0-9_-]+$/.test(row.id)).map(row=>[row.id,{id:row.id,name:row.name,category:row.category,kind:row.kind}]));
const entries=[...items.values()];
const counts=new Map();
for(const item of entries)counts.set(item.category,(counts.get(item.category)||0)+1);
const pageSize=60;
const pages=Math.ceil(entries.length/pageSize);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const base=lang=>lang==='pt'?'/pt/biblioteca/':'/en/library/';
const origin=new URL(process.env.APP_ORIGIN||'https://teste-plataforma-delta.vercel.app').origin;
export function* libraryRoutes(){
 for(const lang of ['pt','en']){
   yield base(lang);
   yield base(lang)+'metrics/';
   for(let i=2;i<=pages;i++)yield base(lang)+'page-'+i+'/';
   for(const id of items.keys())yield base(lang)+id+'/';
 }
}
export function librarySitemap(){
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Array.from(libraryRoutes(),path=>'<url><loc>'+esc(origin+path)+'</loc></url>').join('')+'</urlset>';
}
export function renderLibrary(path){
 const match=/^\/(pt\/biblioteca|en\/library)(?:\/([a-z0-9_-]+))?\/?$/.exec(path);
 if(!match)return null;
 const pt=match[1][0]==='p',lang=pt?'pt':'en',prefix=base(lang),slug=match[2]||'';
 const item=items.get(slug),metrics=slug==='metrics';
 const number=slug.startsWith('page-')?Number(slug.slice(5)):1;
 if(slug&&!item&&!metrics&&!(Number.isInteger(number)&&number>=2&&number<=pages&&slug==='page-'+number))return null;
 const library=pt?'Biblioteca de interfaces':'Interface library';
 const title=item?item.name:metrics?(pt?'Métricas do catálogo':'Catalog metrics'):library+(number>1?' · '+number:'');
 const description=item?(pt?'Explore '+item.name+' e consulte a demonstração e os arquivos na sua conta.':'Explore '+item.name+' and open its demonstration and files in your account.'):(pt?'Explore componentes por página e consulte os detalhes de cada recurso.':'Browse components by page and explore individual resources.');
 const canonical=prefix+(slug?slug+'/':'');
 const tr=pt?'en':'pt';
 const alternate=base(tr)+(slug?slug+'/':'');
 const content=item?'<p>'+esc(item.category)+' · '+esc(item.kind)+'</p><p>'+esc(description)+'</p><a class="primary" href="/account?next='+encodeURIComponent('/component/'+item.id)+'">'+(pt?'Abrir componente':'Open component')+'</a>':metrics?'<p>'+entries.length+' '+(pt?'recursos com código e prévia no catálogo.':'catalog resources with code and a preview.')+'</p><dl>'+Array.from(counts,([name,count])=>'<dt>'+esc(name)+'</dt><dd>'+count+'</dd>').join('')+'</dl>':'<p>'+esc(description)+'</p><ul>'+entries.slice((number-1)*pageSize,number*pageSize).map(row=>'<li><a href="'+prefix+row.id+'/">'+esc(row.name)+'</a> · '+esc(row.category)+'</li>').join('')+'</ul><nav>'+(number>1?'<a href="'+prefix+(number>2?'page-'+(number-1)+'/':'')+'">'+(pt?'Anterior':'Previous')+'</a> ':'')+(number<pages?'<a href="'+prefix+'page-'+(number+1)+'/">'+(pt?'Próxima':'Next')+'</a>':'')+'</nav>';
 const schema=JSON.stringify({'@context':'https://schema.org','@type':item?'WebPage':'CollectionPage',name:title,url:origin+canonical,inLanguage:lang,description}).replace(/</g,'\\u003c');
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' · nitido</title><meta name="description" content="'+esc(description)+'"><link rel="canonical" href="'+origin+canonical+'"><link rel="alternate" hreflang="'+lang+'" href="'+origin+canonical+'"><link rel="alternate" hreflang="'+tr+'" href="'+origin+alternate+'"><link rel="stylesheet" href="/assets/marketing.css"><script type="application/ld+json">'+schema+'</script></head><body class="marketing"><main class="policy"><nav><a href="'+prefix+'">'+library+'</a> · <a href="'+prefix+'metrics/">'+(pt?'Métricas':'Metrics')+'</a> · <a href="'+alternate+'">'+tr.toUpperCase()+'</a></nav><h1>'+esc(title)+'</h1>'+content+'</main></body></html>';
}
