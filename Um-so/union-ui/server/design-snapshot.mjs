// Inert reconstruction for computed design sampling. Original scripts, URLs,
// forms, images and executable attributes never enter the sandbox.
export function designSnapshot(nodes,stylesheets=[]){
 const allowed=new Set('body main section article nav header footer div span h1 h2 h3 p a button label ul li input'.split(' '));
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let count=0;function render(node,depth=0){if(depth>80||count++>1200)return '';if(node.tagName&&!allowed.has(node.tagName))return '';if(!node.tagName)return (node.childNodes||[]).map(child=>render(child,depth+1)).join('');const attrs=(node.attrs||[]).filter(a=>['class','id','style'].includes(a.name)&&a.value.length<1500).map(a=>' '+a.name+'="'+escape(a.value)+'"').join('');return '<'+node.tagName+attrs+'>'+((node.childNodes||[]).filter(n=>n.tagName).map(child=>render(child,depth+1)).join('')||'Amostra')+'</'+node.tagName+'>';}
 const inline=nodes.filter(n=>n.tagName==='style').map(n=>(n.childNodes||[]).map(c=>c.value||'').join(''));
 const css=[...inline,...stylesheets].join('\n').slice(0,200000).replace(/@import[^;]*;?/gi,'').replace(/url\([^)]*\)/gi,'none').replace(/<\/style/gi,'<\\/style');
 const body=nodes.find(n=>n.tagName==='body');return {html:body?render(body):'',css,source:'reconstructed-inert-html-css',originalScriptsExecuted:false};
}
