// Run local submit handlers in opaque previews without enabling sandbox forms,
// network submission, navigation or access to the authenticated parent.
export function installPreviewForms(win=window){
 function submit(form,submitter){
  if(!form.noValidate&&!submitter?.formNoValidate&&!form.checkValidity()){form.reportValidity();return;}
  const event=typeof win.SubmitEvent==='function'?new win.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:submitter||null}):new win.Event('submit',{bubbles:true,cancelable:true});
  form.dispatchEvent(event);
 }
 win.document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0)return;
  const node=event.target?.closest?.('button,input');
  if(!node||node.disabled||!node.form||!['submit','image'].includes(node.type))return;
  event.preventDefault();submit(node.form,node);
 });
 win.document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.isComposing||event.key!=='Enter')return;
  const node=event.target;
  if(node?.tagName!=='INPUT'||!node.form||node.disabled||node.readOnly||['button','submit','reset','checkbox','radio','range','file','color','hidden','image'].includes(node.type))return;
  const submitter=[...node.form.elements].find(e=>!e.disabled&&['submit','image'].includes(e.type));
  // Respect forms without a submit action; Enter may have another meaning.
  if(!submitter)return;
  event.preventDefault();submit(node.form,submitter);
 });
}
