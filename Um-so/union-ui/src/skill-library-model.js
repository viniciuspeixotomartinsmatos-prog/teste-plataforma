export const packageType=row=>row.kind||(row.guide==='DESIGN.md'?'design':row.group==='MCP'?'mcp':'skill');
export function libraryPackages(rows,section='skills'){
 const unique=[...new Map(rows.map(row=>[row.id,row])).values()];
 const caveman=unique.filter(row=>row.group==='caveman');
 const core=caveman.find(row=>row.id==='caveman-caveman');
 return unique.filter(row=>section==='design-systems'?packageType(row)==='design':packageType(row)!=='design')
  .filter(row=>!core||row.group!=='caveman'||row.id===core.id)
  .map(row=>row===core?{...row,name:'Caveman',description:'Guia principal para respostas diretas. Comandos e módulos opcionais ficam reunidos nesta entrada.',modules:[core,...caveman.filter(module=>module!==core)]}:row);
}
