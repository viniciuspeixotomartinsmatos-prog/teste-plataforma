import React, {useRef} from 'react';
import {ChevronDown, Layers3, LayoutGrid, List, Moon, Search, SlidersHorizontal, Star, Sun, Wrench} from 'lucide-react';
import Brand from './Brand.jsx';
import {categoryLabels, formatCount} from './catalog.js';

export function CatalogTopbar({path, collectionsOverview, navigate, theme, setTheme, user, children, openSearch}) {
 const menu = useRef(null);
 const follow = (event, path) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (menu.current) menu.current.open = false;
  navigate(path);
 };
 const nav=[
  ['/', 'Catálogo', LayoutGrid, path==='/'||path.startsWith('/component/')||path==='/icons'],
  ['/collections', 'Favoritos', Star, path==='/collections'&&!collectionsOverview],
  ['/collections?view=all', 'Coleções', Layers3, path.startsWith('/collections')&&(path!=='/collections'||collectionsOverview)],
  ['/tools', 'Ferramentas', Wrench, path.startsWith('/tools')]
 ];
 return <header className={'topbar catalog-topbar'+(path==='/tools/raio-x'?' topbar--audit':'')}>
  <div className="topbar-inner">
   <a href="/" className="brand" onClick={event=>follow(event, '/')}><Brand/></a>
   <nav className="main-nav" aria-label="Navegação principal">
    {nav.map(([href,label,Icon,active])=><a href={href} key={href} className={active?'active':undefined} aria-current={active?'page':undefined} onClick={event=>follow(event,href)}><Icon size={16} aria-hidden="true"/><span>{label}</span></a>)}
   </nav>
   <div className="catalog-header-search">{children||<button className="global-search catalog-global-search" onClick={openSearch} aria-label="Buscar em tudo"><Search size={17}/><span>Buscar no catálogo</span><kbd>Ctrl K</kbd></button>}</div>
   <div className="topbar-actions">
    <button className="icon-button" aria-label={theme==='dark'?'Ativar tema claro':'Ativar tema escuro'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
    <details className="catalog-more" ref={menu} onKeyDown={event=>{if(event.key==='Escape'){menu.current.open=false;menu.current.querySelector('summary').focus();}}}>
     <summary aria-label="Menu da conta"><span className="catalog-avatar">{user?.name?.trim().charAt(0).toUpperCase()||'N'}</span><ChevronDown size={15}/></summary>
     <div className="catalog-menu">
      {[['/account',user?'Minha conta':'Entrar ou criar conta'], ['/plans?view=acessos','Planos'], ['/builder','Montador'], ['/resources','Recursos']].map(([href,label])=><a key={href} href={href} aria-current={path===href?'page':undefined} onClick={event=>follow(event,href)}>{label}</a>)}
      <button type="button" onClick={()=>{menu.current.open=false;openSearch();}}>Busca global <kbd>Ctrl K</kbd></button>
     </div>
    </details>
   </div>
  </div>
 </header>;
}

const descriptions = {
 Heroes: 'Seções iniciais de alto impacto para landing pages, sites e produtos.',
 Backgrounds: 'Fundos, texturas e shaders para dar profundidade à interface.',
 'Text effects': 'Animações e efeitos para títulos e textos.',
 Buttons: 'Botões e estados interativos para as ações da sua interface.',
 Dashboards: 'Painéis para acompanhar dados e organizar informações.'
};

export function CatalogHeading({category, query, count, sort, view, setView, setSort, openSidebar}) {
 const title = query ? 'Resultados da busca' : categoryLabels[category] || 'Todos os recursos';
 return <header className="catalog-heading">
  <div>
   <div className="catalog-heading-title"><h1>{title}</h1><span>{formatCount(count)} {count===1?'recurso':'recursos'}</span></div>
   <p>{query ? 'Busca por “'+query+'”' : descriptions[category] || (category==='all' ? 'Explore componentes, efeitos e páginas para o seu próximo projeto.' : null)}</p>
  </div>
  <div className="catalog-view-tools">
   <button className="icon-button catalog-sidebar-trigger" aria-label="Abrir categorias" onClick={openSidebar}><SlidersHorizontal size={16}/></button>
   <div className="view-controls" aria-label="Visualização">
    <button type="button" className={view!=='list'?'active':''} aria-pressed={view!=='list'} aria-label="Exibir grade" onClick={()=>setView('comfortable')}><LayoutGrid size={17}/></button>
    <button type="button" className={view==='list'?'active':''} aria-pressed={view==='list'} aria-label="Exibir lista" onClick={()=>setView('list')}><List size={17}/></button>
   </div>
   <label className="catalog-sort"><select aria-label="Ordenar componentes" value={sort} onChange={event=>setSort(event.target.value)}><option value="featured">Destaques</option><option value="name">A–Z</option><option value="recent">Mais recentes</option></select><ChevronDown size={15}/></label>
  </div>
 </header>;
}
