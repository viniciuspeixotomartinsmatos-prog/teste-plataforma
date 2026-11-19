// A deterministic palette illustration, never a screenshot of a recovered app.
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
export function themeCover(name,css){
 const block=css.match(/:root\s*\{([^}]+)\}/)?.[1]||'';
 const color=(token,fallback)=>{const value=block.match(new RegExp('--'+token+':\\s*([^;]+)'))?.[1]?.trim();return value&&/^(?:#[a-f\d]{3,8}|(?:oklch|oklab|hsl|hsla|rgb|rgba)\([\d.\s%,/+-]+\))$/i.test(value)?value:fallback;};
 const background=color('background','#f5f5f7'),foreground=color('foreground','#1d1d1f');
 const colors=['primary','secondary','accent','destructive'].map((token,i)=>color(token,['#6d3fd1','#b79af5','#d8c5ff','#e64949'][i]));
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${escape(name)}: paleta dos tokens originais"><rect width="800" height="800" fill="${escape(background)}"/><text x="64" y="104" fill="${escape(foreground)}" font-family="sans-serif" font-size="18">TEMA CSS · PALETA ORIGINAL</text><text x="64" y="170" fill="${escape(foreground)}" font-family="sans-serif" font-size="32">${escape(name)}</text>${colors.map((fill,i)=>`<rect x="${64+i*172}" y="260" width="156" height="320" rx="24" fill="${escape(fill)}"/>`).join('')}</svg>`;
}
