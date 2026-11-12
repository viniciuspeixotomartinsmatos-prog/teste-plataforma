// Export observed design evidence only; do not infer semantic token roles.
export function designEvidence(site){
 const design=site?.design||{},computed=design.computed;
 const rows=(values,limit=12)=>Array.isArray(values)?values.slice(0,limit).filter(item=>typeof item?.value==='string'&&item.value.length<=300).map(({value,count})=>({value,count:Number.isSafeInteger(count)&&count>=0?count:null})):[];
 return{version:1,url:site?.url||'',scope:computed?.scope||design.coverage?.scope||'HTML/CSS coletado, sem executar scripts do site original.',originalScriptsExecuted:false,colors:rows(computed?.colors?.length?computed.colors:design.colors),fonts:rows(computed?.fonts?.length?computed.fonts:design.fonts),radii:rows(computed?.radii),spacing:rows(computed?.spacing)};
}
export function displayDesignValue(value,type){
 const text=String(value);if(type!=='radii')return text;
 // Browser resolves a full pill radius to a large implementation limit.
 // Keep raw evidence in the export; use an honest readable label in the UI.
 return /^\d+(?:\.\d+)?px$/.test(text)&&Number.parseFloat(text)>=9999?'Pílula ('+text+')':text;
}
export function designEvidenceMarkdown(site){
 const evidence=designEvidence(site),escape=value=>String(value).replace(/[\\`*_{}\[\]<>|]/g,c=>'\\'+c).replace(/[\r\n]+/g,' ');
 const sections=[['Cores','colors'],['Fontes','fonts'],['Arredondamentos','radii'],['Espaçamentos','spacing']].map(([label,key])=>'## '+label+'\n\n'+(evidence[key].length?evidence[key].map(row=>'- '+escape(displayDesignValue(row.value,key))+(row.count===null?'':' · '+row.count+' ocorrências')).join('\n'):'Nenhuma evidência coletada.'));
 return '# Design observado pelo Raio-X\n\nURL: '+escape(evidence.url)+'\n\n'+escape(evidence.scope)+'\n\nAs medidas são evidências observadas, sem atribuição automática de papéis de marca. Não reproduzem estados dinâmicos, assets ou backend do site original.\n\n'+sections.join('\n\n')+'\n';
}
