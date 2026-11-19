import React from 'react';
import {resourceDelivery} from './resource-experience.js';
export default function IntegrationGuide({item,onPrompt,onDownload,onCode,busy,error,onRetry}){
 const info=resourceDelivery(item);
 return <section className="integration-guide" aria-label="Como usar este recurso"><h2>Leve para o seu projeto</h2>
  <dl><div><dt>Formato</dt><dd>{info.framework}</dd></div><div><dt>Você recebe</dt><dd>{info.delivery}</dd></div><div><dt>Licença declarada</dt><dd>{info.license}</dd></div></dl>
  <p>{info.notice} A licença declarada não é uma confirmação de liberação comercial.</p>
  <ol><li>Confira a prévia e o formato do seu projeto. {item.dependencies?.length?`Dependências declaradas: ${item.dependencies.join(', ')}.`:'O catálogo não informa dependências adicionais; confira o pacote.'}</li>
  <li>{info.source?'Abra os arquivos e preserve os avisos técnicos.':'Confira os limites da demonstração e quais arquivos realmente estão incluídos.'}</li>
  <li>Use o prompt para orientar a integração ou baixe o pacote. Teste no seu projeto antes de publicar.</li></ol>
  {error&&<div className="experience-error" role="alert"><p>{error}</p><button className="button" onClick={onRetry}>Tentar carregar arquivos novamente</button></div>}
  <div className="experience-actions"><button className="button button-primary" onClick={onPrompt} disabled={busy}>Copiar prompt de integração</button><button className="button" onClick={onDownload} disabled={busy}>Baixar pacote</button><button className="button" onClick={onCode}>Ver arquivos</button></div>
 </section>;
}
