import catalog from '../public/data/catalog-live.json' with {type:'json'};
import {promptTools} from '../src/prompt-tools.js';

const byId=new Map(catalog.map(item=>[item.id,item]));
const directions={
 claude:'Resuma a estrutura, os estados e as decisões de interação. Depois desenvolva uma implementação independente e explique como integrá-la. Em um projeto existente, preserve os padrões que já foram adotados.',
 codex:'Inspecione o repositório, as dependências e a estrutura de componentes antes de editar. Implemente nos arquivos adequados, mantenha as convenções locais e execute os testes ou verificações disponíveis.',
 gemini:'Transforme a descrição em um componente visual responsivo. Detalhe os estados de desktop e celular, a navegação por teclado e a redução de movimento. Entregue uma implementação compatível com a stack do projeto.',
 cursor:'Use os arquivos relevantes do workspace como contexto. Reaproveite os componentes e tokens do projeto, faça alterações pontuais e indique quais arquivos foram modificados e como verificar o resultado.',
 lovable:'Implemente o componente diretamente na interface do projeto. Reaproveite o tema existente, preserve a navegação e adicione conteúdo de exemplo só quando necessário para demonstrar os estados.'
};
const clean=value=>String(value??'').replace(/```[\s\S]*?```/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const fail=(status,message)=>Object.assign(new Error(message),{status});

export function catalogPrompt(input,origin){
 const {resource,tool,operation}=input??{};
 const target=promptTools.find(candidate=>candidate.id===tool);
 if(typeof resource!=='string'||!target||typeof operation!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(operation))throw fail(400,'Selecione uma ferramenta válida para copiar o prompt.');
 const item=byId.get(resource);
 if(!item)throw fail(404,'Componente não encontrado.');
 const description=clean(item.description);
 const tags=(item.tags??[]).map(clean).filter(Boolean).slice(0,8);
 const reference=new URL('/component/'+encodeURIComponent(item.publicSlug||item.id),origin).href;
 const prompt=[
  'Implemente uma versão original do componente '+clean(item.name)+'.',
  'Categoria: '+(clean(item.category)||'Interface')+'.'+(item.framework?' Tecnologia da prévia: '+clean(item.framework)+'.':''),
  ...(description?['Descrição do componente: '+description]:[]),
  ...(tags.length?['Características do catálogo: '+tags.join(', ')+'.']:[]),
  'Referência visual no Nítido: '+reference+'. Se o link exigir login, peça uma captura ou gravação da prévia quando precisar de detalhes de composição ou movimento.',
  'Adapte a solução à tecnologia e aos estilos do projeto. Trate os estados de foco e mantenha o componente utilizável em telas menores.',
  directions[tool],
  'Se algum detalhe visual não estiver descrito, declare a suposição antes de implementar.'
 ].join('\n\n');
 return {resource,operation,prompt};
}
