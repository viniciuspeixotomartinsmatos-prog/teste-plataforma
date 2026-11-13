export const discoveryGoals=[
 {id:'landing',label:'Criar uma landing page',kind:'template'},
 {id:'hero',label:'Escolher um hero',category:'Heroes'},
 {id:'forms',label:'Criar um formulário',category:'AI & inputs'},
 {id:'text',label:'Animar um título',category:'Text effects'},
 {id:'navigation',label:'Montar a navegação',category:'Navigation'},
 {id:'background',label:'Encontrar um fundo',category:'Backgrounds'}
];
export function resourceDelivery(item){
 const recorded=item.recoveryMode==='recorded-video';
 const compiled=!recorded&&(/compiled|retained|reference/.test(item.recoveryMode||'')||item.framework==='html'&&item.availability!=='code');
 const hasCode=Boolean(item.codePath)&&item.availability==='code'&&!compiled&&!recorded;
 return {preview:recorded?'Vídeo demonstrativo':item.previewPath||item.runtimePreviewPath?'Prévia interativa':'Prévia sob demanda',
  delivery:hasCode?'Código-fonte disponível':item.availability==='usage'?'Exemplo de uso':compiled?'Demonstração compilada':recorded?'Referência em vídeo':'Consultar arquivos',
  framework:({react:'React',vue:'Vue',html:'HTML / JavaScript',svelte:'Svelte'})[item.framework]||item.framework||'Consultar formato',
  source:hasCode,compiled,recorded,
  notice:recorded?'O vídeo mostra o resultado visual; ele não é uma implementação interativa. Confira os arquivos incluídos antes de integrar.':compiled?'A demonstração compilada não equivale ao projeto-fonte editável nem inclui o backend original.':'Confira os arquivos e as dependências do pacote antes de integrar.',
  license:item.license||'Licença não informada. Confirme os termos antes do uso comercial.'};
}
const boundedNumber=(value,fallback,max)=>Number.isFinite(Number(value))?Math.max(0,Math.min(max,Number(value))):fallback;
export function librarySnapshot(value){
 if(!value||typeof value.url!=='string'||value.url.length>4096)return null;
 try{const url=new URL(value.url,'https://nitido.invalid');if(url.origin!=='https://nitido.invalid'||!/^\/(?:collections(?:\/[^/]+)?)?$/.test(url.pathname))return null;
 return {url:url.pathname+url.search,y:boundedNumber(value.y,0,1000000),visible:Math.max(36,boundedNumber(value.visible,36,100000)),view:['comfortable','compact','list'].includes(value.view)?value.view:'comfortable',anchor:typeof value.anchor==='string'?value.anchor.slice(0,200):null,offset:Number.isFinite(Number(value.offset))?Math.max(-10000,Math.min(10000,Number(value.offset))):0};}catch{return null;}
}
export function captureLibrarySnapshot({visible,view},doc=document,win=window){
 const cards=[...doc.querySelectorAll('[data-resource-id]')],anchor=cards.find(node=>node.getBoundingClientRect().bottom>120);
 return librarySnapshot({url:win.location.pathname+win.location.search,y:win.scrollY,visible,view,anchor:anchor?.dataset.resourceId,offset:anchor?-anchor.getBoundingClientRect().top:0});
}
export function journeyKey(owner){return 'nitido:journey:v1:'+encodeURIComponent(owner||'');}
export function readJourney(owner,storage){try{const target=storage||window.sessionStorage;const data=JSON.parse(target.getItem(journeyKey(owner))||'{}');return {returnTo:librarySnapshot(data.returnTo),recent:Array.isArray(data.recent)?data.recent.filter(id=>typeof id==='string'&&id.length<=200).slice(0,12):[]};}catch{return {returnTo:null,recent:[]};}}
export function writeJourney(owner,data,storage){if(!owner)return;try{const target=storage||window.sessionStorage;target.setItem(journeyKey(owner),JSON.stringify({returnTo:librarySnapshot(data.returnTo),recent:[...new Set(data.recent||[])].filter(id=>typeof id==='string'&&id.length<=200).slice(0,12)}));}catch{}}
export function priorityCorrections(report){
 const order={alta:0,media:1,baixa:2};
 return report.findings.filter(f=>f.status==='fail'&&f.steps?.length).sort((a,b)=>(order[a.severity]??3)-(order[b.severity]??3)||b.weight-a.weight).slice(0,3).map(f=>({...f,
  impact:f.category==='seo'?'Ajuda a remover barreiras de descoberta e indexação.':f.category==='velocidade'?'Atua no carregamento observado nesta análise.':f.category==='celular'?'Melhora leitura e interação no celular.':f.category==='privacidade'?'Reduz o problema técnico ou de transparência observado.':'Melhora a medição, se necessária ao negócio.',
  effort:['indexavel','titulo','descricao','viewport','lang'].includes(f.id)?'Ajuste localizado; confirmar no projeto':'Exige investigação no projeto'
 }));
}
