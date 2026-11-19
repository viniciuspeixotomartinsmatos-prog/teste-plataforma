import React,{useState} from 'react';
import {ArrowUp,ArrowDown,X} from 'lucide-react';
import {Modal} from './UI.jsx';

export default function CollectionEditor({collection,rows,onSave,onDelete,onClose}){
 const [name,setName]=useState(collection.name),[description,setDescription]=useState(collection.description||''),[items,setItems]=useState([...collection.items]),[confirmDelete,setConfirmDelete]=useState(false);
 const names=new Map(rows.map(row=>[row.id,row.name]));
 function move(index,delta){setItems(previous=>{const next=[...previous],target=index+delta;if(target<0||target>=next.length)return previous;[next[index],next[target]]=[next[target],next[index]];return next;});}
 return <Modal title="Editar coleção" onClose={onClose}><div className="modal-header"><h2>Editar coleção</h2><button className="icon-button" aria-label="Fechar editor" onClick={onClose}><X size={18}/></button></div><form className="collection-form" onSubmit={event=>{event.preventDefault();if(name.trim())onSave({...collection,name:name.trim(),description:description.trim(),items});}}>
 <label htmlFor="edit-collection-name">Nome</label><input id="edit-collection-name" value={name} onChange={event=>setName(event.target.value)} maxLength={80} required/>
 <label htmlFor="edit-collection-description">Descrição</label><textarea id="edit-collection-description" value={description} onChange={event=>setDescription(event.target.value)} maxLength={1000} rows={3}/>
 <p>A ordem abaixo será usada na coleção. Remover daqui mantém o componente na biblioteca.</p>
 <ol className="collection-edit-items">{items.map((id,index)=><li key={id}><span>{names.get(id)||'Recurso indisponível'}</span><div><button className="icon-button" type="button" disabled={index===0} aria-label={'Subir '+(index+1)} onClick={()=>move(index,-1)}><ArrowUp size={16}/></button><button className="icon-button" type="button" disabled={index===items.length-1} aria-label={'Descer '+(index+1)} onClick={()=>move(index,1)}><ArrowDown size={16}/></button><button className="icon-button" type="button" aria-label={'Remover item '+(index+1)} onClick={()=>setItems(previous=>previous.filter(item=>item!==id))}><X size={16}/></button></div></li>)}</ol>
 {!items.length&&<p>Sua coleção está vazia. Adicione componentes pelas páginas da biblioteca.</p>}
 <button className="button button-primary" type="submit" disabled={!name.trim()}>Salvar coleção</button><button className="text-button" type="button" onClick={()=>setConfirmDelete(value=>!value)}>Excluir coleção</button>
 {confirmDelete&&<div role="alert"><p>Excluir esta coleção da sua conta? Os componentes e favoritos serão mantidos.</p><button className="button" type="button" onClick={()=>onDelete(collection.id)}>Confirmar exclusão da coleção</button><button className="text-button" type="button" onClick={()=>setConfirmDelete(false)}>Manter coleção</button></div>}
 </form></Modal>;
}
