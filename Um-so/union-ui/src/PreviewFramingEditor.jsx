import React,{useState} from 'react';
import {X} from 'lucide-react';
import {CatalogMedia} from './CatalogMedia.jsx';
import {displayName,Modal} from './UI.jsx';
import {api} from './account.js';
import {normalizeFraming} from './preview-framing.js';

export default function PreviewFramingEditor({item,onClose,onSave}){
 const initial=normalizeFraming(item.previewFraming);
 const [settings,setSettings]=useState({...item.previewFraming,fit:initial.mode,x:initial.point[0],y:initial.point[1],zoom:initial.zoom,customFit:initial.customFit,background:initial.background});
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 const name=displayName(item.name);
 const change=(key,value)=>setSettings(previous=>({...previous,[key]:value}));
 const submit=async event=>{
  event.preventDefault();
  setSaving(true);
  setError('');
  try {onSave(await api('/api/catalog-framing',{method:'PUT',body:{id:item.id,settings}}));}
  catch(failure){setError(failure.message);setSaving(false);}
 };
 return <Modal title={'Editar enquadramento: '+name} onClose={onClose} className="preview-framing-editor">
  <header className="modal-header"><h2>Enquadramento da prévia</h2><button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}><X size={18}/></button></header>
  <div className="framing-comparison">
   <figure><figcaption>Original · {name}</figcaption><div className="framing-surface"><CatalogMedia item={{...item,previewMedia:undefined,previewFraming:{fit:'contain'}}} name={name} framed/></div></figure>
   <figure><figcaption>Resultado · 16:9</figcaption><div className={'framing-surface'+(settings.safeArea===true?' framing-guide':'')}><CatalogMedia item={{...item,previewFraming:settings}} name={name} framed/></div><p className="framing-review">Prévia preservada integralmente. Confira a leitura e o conteúdo principal.</p></figure>
  </div>
  <form className="framing-form" onSubmit={submit}>
   <label>Modo<select value={settings.fit} onChange={event=>change('fit',event.target.value)}><option value="smart">Inteligente</option><option value="cover">Preencher (Cover)</option><option value="contain">Preservar (Contain)</option><option value="custom">Personalizado</option></select></label>
   {settings.fit==='custom'&&<label>Ajuste personalizado<select value={settings.customFit} onChange={event=>change('customFit',event.target.value)}><option value="contain">Preservar</option><option value="cover">Preencher</option></select></label>}
   <label>Foco horizontal ({Math.round(settings.x*100)}%)<input type="range" min="0" max="1" step=".01" value={settings.x} onChange={event=>change('x',Number(event.target.value))}/></label>
   <label>Foco vertical ({Math.round(settings.y*100)}%)<input type="range" min="0" max="1" step=".01" value={settings.y} onChange={event=>change('y',Number(event.target.value))}/></label>
   <label>Zoom ({Math.round(settings.zoom*100)}%)<input type="range" min=".8" max="1.15" step=".01" value={settings.zoom} disabled={settings.fit!=='custom'} onChange={event=>change('zoom',Number(event.target.value))}/></label>
   <label>Fundo<select value={settings.background} onChange={event=>change('background',event.target.value)}><option value="neutral">Neutro</option><option value="dark">Escuro</option><option value="light">Claro</option><option value="sampled">Cor personalizada</option></select></label>
   {settings.background==='sampled'&&<label>Cor do fundo<input type="color" value={settings.color||'#101017'} onChange={event=>change('color',event.target.value)}/></label>}
   <label>Área segura<select value={settings.safeArea===undefined?'auto':String(settings.safeArea)} onChange={event=>change('safeArea',event.target.value==='auto'?undefined:event.target.value==='true')}><option value="auto">Automática</option><option value="true">Proteger e mostrar guia</option><option value="false">Desativada</option></select></label>
   {error&&<p role="alert">{error}</p>}
   <button type="submit" className="button button-primary" disabled={saving}>{saving?'Salvando…':'Salvar enquadramento'}</button>
  </form>
 </Modal>;
}
