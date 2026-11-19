const colorToken = /#[0-9a-f]{3,8}\b/gi;
const recommendations = [
  ['nav','magic--dock','Dock','Navegação identificada no HTML'],
  ['button','magic--shimmer-button','Shimmer Button','Botão identificado no HTML'],
  ['select','reactbits--glide-select','Glide Select','Seletor identificado no formulário'],
  ['footer','tailark-base-dusk-footer-1','Dusk Footer 1','Rodapé identificado no HTML'],
];

export function designEvidence(nodes,stylesheets=[]) {
  const colors = new Map(), fonts = new Map(), tags = new Set();
  let remaining = 200000;
  const count=(map,key)=>map.set(key,(map.get(key)||0)+1);
  const styleNodes=stylesheets.map(value=>({tagName:'style',childNodes:[{value}]}));
  const variables=new Map();
  for (const node of [...nodes,...styleNodes]) {
    tags.add(node.tagName);
    if (!remaining) continue;
    const raw=node.tagName==='style' ? node.childNodes.map(child=>child.value||'').join('') : node.attrs?.find(attr=>attr.name==='style')?.value;
    if(!raw)continue;
    const css=raw.slice(0,remaining).replace(/\/\*[\s\S]*?\*\//g,'');
    remaining-=Math.min(remaining,raw.length);
    for(const match of css.matchAll(/(--[a-z0-9_-]+)\s*:\s*([^;{}]+)/gi))variables.set(match[1],match[2].trim());
    for (const declaration of css.matchAll(/(?:^|[;{])\s*(color|background(?:-color)?|border-color|font-family)\s*:\s*([^;{}]+)/gi)) {
      const value=declaration[2].replace(/var\((--[a-z0-9_-]+)(?:,[^)]*)?\)/gi,(whole,key)=>variables.get(key)||whole);
      if(declaration[1].toLowerCase()==='font-family') {
        const font=value.split(',')[0].trim().replace(/^['"]|['"]$/g,'');
        if(/^[\p{L}\p{N} -]{1,60}$/u.test(font))count(fonts,font);
      } else {
        for(const [hex] of value.matchAll(colorToken))if([4,5,7,9].includes(hex.length))count(colors,hex.toUpperCase());
      }
    }
  }
  const frequent=map=>[...map].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([value,count])=>({value,count}));
  return {colors:frequent(colors),fonts:frequent(fonts),recommendations:recommendations.filter(([tag])=>tags.has(tag)).map(([,id,name,reason])=>({id,name,reason}))};
}
