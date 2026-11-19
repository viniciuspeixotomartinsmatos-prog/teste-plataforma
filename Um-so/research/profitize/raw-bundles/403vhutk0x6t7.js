;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="afdd98a2-f83f-4814-d6a0-a1c60a531ec4")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,229389,e=>{e.v({compact:"DashboardSidebar-module__XUDEcW__compact",stage:"DashboardSidebar-module__XUDEcW__stage",tile:"DashboardSidebar-module__XUDEcW__tile"})},598162,e=>{"use strict";var a=e.i(843476),t=e.i(271645);let r=Number(t.version.split(".")[0])>=19;function s(){return r?(0,a.jsx)("style",{href:"dashboard-sidebar",precedence:"default",children:u}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:u}})}function d({name:e,size:t=16,strokeWidth:r=1.5,className:s}){return(0,a.jsx)("svg",{className:s,width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:r,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",dangerouslySetInnerHTML:{__html:x[e]}})}function o({icon:e,className:t}){return e?"string"==typeof e?(0,a.jsx)(d,{name:e,className:t}):(0,a.jsx)(e,{className:t,strokeWidth:1.5,"aria-hidden":!0}):null}function i(e){if(!e)return null;let a=Array.from(e.replace(/\s+/g,"")),t=a.pop();return t&&a.includes("⌘")?{key:t.toLowerCase(),shift:a.includes("⇧")}:null}let n=(e,a)=>!!(a&&e.children?.some(e=>e.id===a||n(e,a)));function l({workspaces:e,current:r,onChange:s,onCreate:o,createLabel:i}){let[n,c]=t.useState(!1),p=t.useRef(null),m=t.useRef(null),h=t.useId();t.useEffect(()=>{if(!n)return;p.current?.querySelector('[aria-checked="true"]')?.focus({preventScroll:!0});let e=e=>{p.current?.contains(e.target)||c(!1)},a=e=>{"Escape"!==e.key||e.defaultPrevented||e.isComposing||(e.preventDefault(),c(!1),m.current?.focus({preventScroll:!0}))};return document.addEventListener("pointerdown",e),document.addEventListener("keydown",a),()=>{document.removeEventListener("pointerdown",e),document.removeEventListener("keydown",a)}},[n]);let x=e=>{e(),c(!1),m.current?.focus({preventScroll:!0})};return(0,a.jsxs)("div",{ref:p,className:"ds-ws",onBlur:e=>{let a=e.relatedTarget;a&&!e.currentTarget.contains(a)&&c(!1)},children:[(0,a.jsxs)("button",{ref:m,type:"button",className:"ds-btn ds-ws__trigger","aria-haspopup":"menu","aria-expanded":n,"aria-controls":n?h:void 0,onClick:()=>c(e=>!e),children:[(0,a.jsx)("span",{className:"ds-ws__avatar","aria-hidden":"true",children:r.name.trim().charAt(0).toUpperCase()}),(0,a.jsxs)("span",{className:"ds-ws__text",children:[(0,a.jsx)("span",{className:"ds-ws__name",children:r.name}),r.plan&&(0,a.jsx)("span",{className:"ds-ws__plan",children:r.plan})]}),(0,a.jsx)(d,{name:"chevron-down",className:"ds-ws__chevron"})]}),n&&(0,a.jsxs)("div",{className:"ds-menu",id:h,role:"menu","aria-label":"Workspaces",onKeyDown:e=>{let a,t=Array.from(e.currentTarget.querySelectorAll('[role^="menuitem"]')),r=t.indexOf(document.activeElement);if("ArrowDown"===e.key)a=(r+1)%t.length;else if("ArrowUp"===e.key)a=(r-1+t.length)%t.length;else if("Home"===e.key)a=0;else if("End"===e.key)a=t.length-1;else{"Tab"===e.key&&c(!1);return}e.preventDefault(),t[a]?.focus()},children:[e.map(e=>(0,a.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":e.name===r.name,tabIndex:-1,className:"ds-btn ds-menu__item",onClick:()=>x(()=>s(e.name)),children:e.name},e.name)),(0,a.jsx)("div",{className:"ds-menu__sep",role:"separator"}),(0,a.jsxs)("button",{type:"button",role:"menuitem",tabIndex:-1,className:"ds-btn ds-menu__item ds-menu__create",onClick:()=>x(()=>o?.()),children:[(0,a.jsx)("span",{className:"ds-menu__plus","aria-hidden":"true",children:"+"}),i]})]})]})}function c({item:e,activeId:r,onSelect:s,level:l=0}){let p=!!e.children?.length,[m,h]=t.useState(()=>n(e,r)),[x,u]=t.useState(r);x!==r&&(u(r),n(e,r)&&h(!0));let g=t.useRef(null),b=t.useId(),f=r===e.id;return t.useEffect(()=>{g.current?.toggleAttribute("inert",!m)},[m]),(0,a.jsxs)("div",{className:"ds-item",children:[(0,a.jsxs)("button",{type:"button",className:"ds-btn ds-item__row","data-active":f||void 0,"aria-current":f?"page":void 0,"aria-expanded":p?m:void 0,"aria-controls":p?b:void 0,"aria-keyshortcuts":function(e){let a=i(e);if(!a)return;let t=(a.shift?"Shift+":"")+a.key.toUpperCase();return"Meta+"+t+" Control+"+t}(e.shortcut),style:{paddingLeft:12*l+10},onClick:()=>p?h(e=>!e):s(e.id),children:[(0,a.jsxs)("span",{className:"ds-item__main",children:[(0,a.jsx)(o,{icon:e.icon,className:"ds-item__icon"}),(0,a.jsx)("span",{className:"ds-item__title",children:e.title})]}),(0,a.jsxs)("span",{className:"ds-item__side",children:[e.shortcut&&(0,a.jsx)("kbd",{className:"ds-kbd ds-item__kbd",children:e.shortcut}),void 0!==e.badge&&""!==e.badge&&(0,a.jsx)("span",{className:"ds-badge",children:e.badge}),p&&(0,a.jsx)(d,{name:"chevron-right",strokeWidth:2,className:"ds-item__chevron"})]})]}),p&&(0,a.jsx)("div",{ref:g,id:b,className:"ds-children","data-open":m||void 0,children:(0,a.jsxs)("div",{className:"ds-children__inner",children:[(0,a.jsx)("span",{className:"ds-children__line",style:{left:12*l+17.5},"aria-hidden":"true"}),e.children.map(e=>(0,a.jsx)(c,{item:e,activeId:r,onSelect:s,level:l+1},e.id))]})})]})}function p({groups:e,footer:r=[],workspaces:d=[],workspace:o,defaultWorkspace:n,onWorkspaceChange:m,onCreateWorkspace:h,createWorkspaceLabel:x="Criar workspace",activeId:u,defaultActiveId:g,onSelect:b,open:f=!0,shortcuts:_=!0,theme:v="dark",className:y,style:w,"aria-label":k="Barra lateral"}){let j=t.useRef(null),[N,M]=t.useState(g),[S,C]=t.useState(n??d[0]?.name),E=u??N,z=d.find(e=>e.name===(o??S))??d[0],A=e=>{void 0===u&&M(e),b?.(e)};t.useEffect(()=>{j.current?.toggleAttribute("inert",!f)},[f]);let D=t.useRef({items:[],select:A});return t.useEffect(()=>{D.current={items:function e(a){return a.flatMap(a=>[a,...a.children?e(a.children):[]])}([...e.flatMap(e=>e.items),...r]),select:A}}),t.useEffect(()=>{if(!_)return;let e=e=>{if(e.defaultPrevented||e.repeat||e.isComposing||e.altKey||!(e.metaKey||e.ctrlKey))return;let a=D.current.items.find(a=>{let t=i(a.shortcut);return t&&!a.children?.length&&t.key===e.key.toLowerCase()&&t.shift===e.shiftKey});a&&(e.preventDefault(),D.current.select(a.id))};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[_]),(0,a.jsxs)("aside",{ref:j,className:"ds-theme ds-sidebar"+(y?" "+y:""),"data-theme":v,"data-open":f||void 0,"aria-label":k,style:w,children:[(0,a.jsx)(s,{}),(0,a.jsxs)("div",{className:"ds-sidebar__inner",children:[z&&(0,a.jsx)(l,{workspaces:d,current:z,onChange:e=>{void 0===o&&C(e),m?.(e)},onCreate:h,createLabel:x}),(0,a.jsx)("nav",{className:"ds-groups","aria-label":"Navegação",children:e.map((e,t)=>(0,a.jsxs)("div",{className:"ds-group",children:[e.heading&&(0,a.jsx)("span",{className:"ds-group__heading",children:e.heading}),e.items.map(e=>(0,a.jsx)(c,{item:e,activeId:E,onSelect:A},e.id))]},e.heading??t))}),r.length>0&&(0,a.jsx)("div",{className:"ds-footer",children:r.map(e=>(0,a.jsx)(c,{item:e,activeId:E,onSelect:A},e.id))})]})]})}let m=e=>e.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();function h({open:e,onClose:r,items:i=[],onSelect:n,placeholder:l="Busque projetos, documentos ou ações…",emptyLabel:c="Digite um comando ou busque…",noResultsLabel:p="Nada encontrado.",theme:x="dark"}){let u=t.useRef(null),g=t.useRef(null),[b,f]=t.useState(""),[_,v]=t.useState(0),y=t.useId(),w=m(b.trim()),k=w?(function e(a,t){return a.flatMap(a=>a.children?.length?e(a.children,a.title):[{item:a,parent:t}])})(i).filter(({item:e,parent:a})=>m(e.title).includes(w)||a&&m(a).includes(w)):[],j=Math.min(_,k.length-1);if(t.useEffect(()=>{if(!e)return;let a=document.activeElement;return u.current?.focus({preventScroll:!0}),()=>{f(""),v(0),a?.isConnected&&a.focus({preventScroll:!0})}},[e]),t.useEffect(()=>{if(!e)return;let a=e=>{"Escape"!==e.key||e.defaultPrevented||e.isComposing||(e.preventDefault(),r())};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)},[e,r]),!e)return null;let N=e=>{e&&(r(),n?.(e.item.id))};return(0,a.jsxs)("div",{className:"ds-theme ds-palette","data-theme":x,children:[(0,a.jsx)(s,{}),(0,a.jsx)("div",{className:"ds-palette__scrim",onClick:r,"aria-hidden":"true"}),(0,a.jsxs)("div",{ref:g,className:"ds-palette__panel",role:"dialog","aria-modal":"true","aria-label":"Busca",onKeyDown:e=>{if("Tab"!==e.key)return;let a=Array.from(g.current?.querySelectorAll("input, button")??[]),t=a.indexOf(document.activeElement);e.preventDefault(),a[(t+(e.shiftKey?-1:1)+a.length)%a.length]?.focus()},children:[(0,a.jsxs)("div",{className:"ds-palette__field",children:[(0,a.jsx)(d,{name:"search",size:18,className:"ds-palette__icon"}),(0,a.jsx)("input",{ref:u,className:"ds-palette__input",type:"text",role:"combobox","aria-expanded":k.length>0,"aria-controls":y,"aria-autocomplete":"list","aria-activedescendant":k.length?y+"-"+j:void 0,autoComplete:"off",spellCheck:!1,placeholder:l,value:b,onChange:e=>{f(e.target.value),v(0)},onKeyDown:e=>{!e.nativeEvent.isComposing&&("ArrowDown"===e.key||"ArrowUp"===e.key?(e.preventDefault(),k.length&&v((j+("ArrowDown"===e.key?1:-1)+k.length)%k.length)):"Enter"===e.key&&(e.preventDefault(),N(k[j])))}}),(0,a.jsx)("kbd",{className:"ds-kbd ds-palette__esc",onClick:r,"aria-hidden":"true",children:"ESC"}),(0,a.jsx)("button",{type:"button",className:"ds-btn ds-palette__close",onClick:r,"aria-label":"Fechar a busca",children:(0,a.jsx)(d,{name:"x",size:18})})]}),(0,a.jsx)("div",{className:"ds-palette__list",id:y,role:"listbox","aria-label":"Resultados",hidden:!k.length,children:k.map((e,t)=>(0,a.jsxs)("div",{id:y+"-"+t,className:"ds-palette__option",role:"option","aria-selected":t===j,onMouseDown:e=>e.preventDefault(),onMouseMove:()=>t!==j&&v(t),onClick:()=>N(e),children:[(0,a.jsx)(o,{icon:e.item.icon,className:"ds-palette__option-icon"}),(0,a.jsx)("span",{className:"ds-palette__option-title",children:e.item.title}),e.parent&&(0,a.jsx)("span",{className:"ds-palette__option-meta",children:e.parent})]},e.item.id))}),!k.length&&(0,a.jsxs)("div",{className:"ds-palette__empty",children:[(0,a.jsx)(d,{name:"command",size:24,className:"ds-palette__empty-icon"}),(0,a.jsx)("p",{children:w?p:c})]})]})]})}let x={search:'<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',"layout-dashboard":'<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',"folder-kanban":'<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',settings:'<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',"log-out":'<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',hash:'<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',"chevron-down":'<path d="m6 9 6 6 6-6"/>',"chevron-right":'<path d="m9 18 6-6-6-6"/>',inbox:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',calendar:'<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',activity:'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',"credit-card":'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 14h2"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',terminal:'<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',blocks:'<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>',"panel-left-close":'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',"panel-left-open":'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',command:'<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'},u=`
/* o tema: as cores de tudo v\xeam daqui (troque \xe0 vontade). Escuro por padr\xe3o; data-theme="light" para o claro */
.ds-theme {
  --ds-bg: #0a0a0a;
  --ds-card: #171717;
  --ds-fg: #fafafa;
  --ds-muted: #a1a1a1;
  --ds-border: rgba(255, 255, 255, .1);
  --ds-primary: #e5e5e5;
  --ds-primary-fg: #171717;
  --ds-hover: rgba(255, 255, 255, .05);
  --ds-active: rgba(255, 255, 255, .1);
  --ds-line: rgba(255, 255, 255, .05);
  --ds-key: rgba(255, 255, 255, .1);
  --ds-key-hover: rgba(255, 255, 255, .2);
  --ds-ease: cubic-bezier(.4, 0, .2, 1);
  color-scheme: dark;
  /* nada de texto herdado da p\xe1gina: a barra fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 20px;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  text-rendering: auto;
  color: var(--ds-fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}
.ds-theme[data-theme="light"] {
  --ds-bg: #ffffff;
  --ds-card: #ffffff;
  --ds-fg: #0a0a0a;
  --ds-muted: #737373;
  --ds-border: #e5e5e5;
  --ds-primary: #171717;
  --ds-primary-fg: #fafafa;
  --ds-hover: rgba(0, 0, 0, .05);
  --ds-active: rgba(0, 0, 0, .05);
  --ds-line: rgba(0, 0, 0, .05);
  --ds-key: rgba(0, 0, 0, .05);
  --ds-key-hover: rgba(0, 0, 0, .1);
  color-scheme: light;
}
.ds-theme, .ds-theme *, .ds-theme *::before, .ds-theme *::after { box-sizing: border-box; }
.ds-theme * { margin: 0; }
.ds-btn {
  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: left;
  text-transform: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.ds-btn:focus { outline: none; }
.ds-btn:focus-visible { outline: 2px solid color-mix(in srgb, var(--ds-fg) 55%, transparent); outline-offset: -2px; }
.ds-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

/* a barra: 260 px, e zero quando recolhida (o miolo continua com 260 e \xe9 cortado, ent\xe3o nada se espreme) */
.ds-sidebar {
  --ds-width: 260px;
  position: relative;
  flex: none;
  width: var(--ds-width);
  height: 100%;
  overflow: hidden;
  background: color-mix(in srgb, var(--ds-card) 50%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  transition: width .3s var(--ds-ease), opacity .3s var(--ds-ease), border-right-width .3s var(--ds-ease);
}
.ds-sidebar:not([data-open]) { width: 0; opacity: 0; border-right-width: 0; }
.ds-sidebar__inner { display: flex; flex-direction: column; width: var(--ds-width); height: 100%; padding: 12px; }

/* o workspace */
.ds-ws { position: relative; flex: none; }
.ds-ws__trigger {
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  user-select: none;
  transition: background-color .15s var(--ds-ease);
}
.ds-ws__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--ds-primary);
  color: var(--ds-primary-fg);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
}
.ds-ws__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.ds-ws__name, .ds-ws__plan { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ds-ws__name { font-size: 13px; font-weight: 500; line-height: 16px; color: var(--ds-fg); }
.ds-ws__plan { font-size: 11px; line-height: 14px; color: var(--ds-muted); }
.ds-ws__chevron {
  flex: none;
  width: 16px;
  height: 16px;
  color: color-mix(in srgb, var(--ds-muted) 50%, transparent);
  transition: color .15s var(--ds-ease);
}
.ds-menu {
  position: absolute;
  top: 52px;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 4px 0;
  border: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  border-radius: 8px;
  background: var(--ds-card);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, .1), 0 8px 10px -6px rgba(0, 0, 0, .1);
  animation: ds-pop .1s ease;
}
.ds-menu__item {
  gap: 8px;
  margin: 0 4px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  color: color-mix(in srgb, var(--ds-fg) 80%, transparent);
  transition: background-color .15s var(--ds-ease), color .15s var(--ds-ease);
}
.ds-menu__item[aria-checked="true"] {
  background: color-mix(in srgb, var(--ds-primary) 10%, transparent);
  color: var(--ds-primary);
  font-weight: 500;
}
.ds-menu__sep { height: 1px; margin: 4px 8px; background: color-mix(in srgb, var(--ds-border) 50%, transparent); }
.ds-menu__item.ds-menu__create { color: var(--ds-muted); }
.ds-menu__plus { margin-bottom: 2px; font-size: 16px; line-height: 1; }

/* os grupos: rolam se passarem da altura, sem barra de rolagem */
.ds-groups {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  min-height: 0;
  margin-top: 8px;
  overflow-y: auto;
  scrollbar-width: none;
}
.ds-groups::-webkit-scrollbar { display: none; }
.ds-group { display: flex; flex-direction: column; flex: none; gap: 2px; }
.ds-group__heading {
  margin-bottom: 4px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ds-muted) 50%, transparent);
}
.ds-footer {
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 2px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
}

/* um item */
.ds-item { display: flex; flex-direction: column; width: 100%; }
.ds-item__row {
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ds-muted);
  user-select: none;
  transition: background-color .2s var(--ds-ease), color .2s var(--ds-ease);
}
.ds-item__row[data-active] { background: var(--ds-active); color: var(--ds-fg); font-weight: 500; }
.ds-item__main { display: flex; align-items: center; flex: 1; gap: 10px; min-width: 0; }
.ds-item__icon {
  flex: none;
  width: 16px;
  height: 16px;
  color: color-mix(in srgb, var(--ds-muted) 70%, transparent);
  transition: color .2s var(--ds-ease);
}
.ds-item__row[data-active] .ds-item__icon { color: var(--ds-fg); }
.ds-item__title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; letter-spacing: .025em; }
.ds-item__side { display: flex; align-items: center; flex: none; gap: 8px; }
.ds-item__kbd {
  display: none;
  border: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  background: color-mix(in srgb, var(--ds-bg) 50%, transparent);
  color: color-mix(in srgb, var(--ds-muted) 60%, transparent);
  box-shadow: 0 1px rgba(0, 0, 0, .05);
}
.ds-item__row:focus-visible .ds-item__kbd { display: inline-flex; }
.ds-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ds-primary) 10%, transparent);
  color: var(--ds-primary);
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}
.ds-item__chevron {
  flex: none;
  width: 14px;
  height: 14px;
  color: color-mix(in srgb, var(--ds-muted) 50%, transparent);
  transition: transform .2s var(--ds-ease);
}
.ds-item__row[aria-expanded="true"] .ds-item__chevron { transform: rotate(90deg); }

/* os subitens: a altura anima de 0 at\xe9 a do conte\xfado (a linha do grid vai de 0fr a 1fr) */
.ds-children {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows .3s var(--ds-ease), opacity .3s var(--ds-ease);
}
.ds-children[data-open] { grid-template-rows: 1fr; opacity: 1; }
.ds-children__inner { position: relative; display: flex; flex-direction: column; gap: 2px; min-height: 0; overflow: hidden; }
.ds-children__inner > .ds-item:first-of-type { margin-top: 2px; }
.ds-children__line { position: absolute; top: 0; bottom: 0; border-left: 1px solid var(--ds-line); pointer-events: none; }

/* o hover s\xf3 com mouse: no toque ele ficaria preso depois do toque */
@media (hover: hover) {
  .ds-ws__trigger:hover { background: var(--ds-hover); }
  .ds-ws__trigger:hover .ds-ws__chevron { color: color-mix(in srgb, var(--ds-fg) 70%, transparent); }
  .ds-menu__item:not([aria-checked="true"]):hover { background: var(--ds-hover); }
  .ds-item__row:not([data-active]):hover { background: var(--ds-hover); color: color-mix(in srgb, var(--ds-fg) 90%, transparent); }
  .ds-item__row:not([data-active]):hover .ds-item__icon { color: color-mix(in srgb, var(--ds-fg) 70%, transparent); }
  .ds-item__row:hover .ds-item__kbd { display: inline-flex; }
}

/* a busca: cobre o pai posicionado mais pr\xf3ximo, com o painel a 15% do topo */
.ds-palette { position: absolute; inset: 0; z-index: 50; padding: 0 16px; }
.ds-palette__scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--ds-bg) 40%, transparent);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.ds-palette__panel {
  position: relative;
  top: 15%;
  width: 100%;
  max-width: 576px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  border-radius: 12px;
  background: var(--ds-card);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
  animation: ds-pop .2s ease;
}
.ds-palette__field { display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent); }
.ds-palette__icon { flex: none; width: 18px; height: 18px; margin-right: 12px; color: color-mix(in srgb, var(--ds-muted) 70%, transparent); }
.ds-palette__input {
  flex: 1;
  min-width: 0;
  height: auto;
  padding: 16px 0;
  border: 0;
  border-radius: 0;
  outline: none;
  background: transparent;
  box-shadow: none;
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  color: var(--ds-fg);
  -webkit-appearance: none;
  appearance: none;
}
.ds-palette__input::placeholder { color: color-mix(in srgb, var(--ds-muted) 50%, transparent); opacity: 1; }
.ds-palette__esc {
  flex: none;
  margin-left: 8px;
  border: 1px solid var(--ds-key);
  background: var(--ds-key);
  color: color-mix(in srgb, var(--ds-muted) 70%, transparent);
  cursor: pointer;
  user-select: none;
  transition: color .15s var(--ds-ease), background-color .15s var(--ds-ease);
}
.ds-palette__close {
  flex: none;
  margin-left: 12px;
  padding: 4px;
  border-radius: 6px;
  color: color-mix(in srgb, var(--ds-muted) 70%, transparent);
  transition: color .15s var(--ds-ease), background-color .15s var(--ds-ease);
}
.ds-palette__close svg { display: block; }
.ds-palette__list { display: flex; flex-direction: column; gap: 2px; max-height: 296px; padding: 8px; overflow-y: auto; }
.ds-palette__list[hidden] { display: none; }
.ds-palette__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ds-muted);
  cursor: pointer;
  user-select: none;
}
.ds-palette__option[aria-selected="true"] { background: var(--ds-active); color: var(--ds-fg); }
.ds-palette__option-icon { flex: none; width: 16px; height: 16px; color: color-mix(in srgb, var(--ds-muted) 70%, transparent); }
.ds-palette__option[aria-selected="true"] .ds-palette__option-icon { color: var(--ds-fg); }
.ds-palette__option-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; letter-spacing: .025em; }
.ds-palette__option-meta { flex: none; margin-left: auto; font-size: 12px; color: color-mix(in srgb, var(--ds-muted) 60%, transparent); }
.ds-palette__empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 8px; }
.ds-palette__empty-icon { width: 24px; height: 24px; margin-bottom: 8px; color: color-mix(in srgb, var(--ds-muted) 30%, transparent); }
.ds-palette__empty p { font-size: 13px; font-weight: 500; line-height: 20px; color: var(--ds-muted); }
@media (hover: hover) {
  .ds-palette__esc:hover { background: var(--ds-key-hover); color: var(--ds-fg); }
  .ds-palette__close:hover { background: var(--ds-key); color: var(--ds-fg); }
}
@media (max-width: 639px) {
  .ds-palette__esc { display: none; }
}

@keyframes ds-pop { from { opacity: 0; transform: scale(.95); } }

@media (prefers-reduced-motion: reduce) {
  .ds-sidebar, .ds-theme * { transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
`,g=[{name:"Vértice",plan:"Plano Pro"},{name:"Pessoal",plan:"Plano grátis"},{name:"Sandbox do cliente",plan:"Plano Pro"}],b=[{items:[{id:"buscar",title:"Buscar",icon:"search",shortcut:"⌘K"},{id:"inicio",title:"Início",icon:"layout-dashboard"},{id:"entrada",title:"Caixa de entrada",icon:"inbox",badge:12},{id:"analises",title:"Análises",icon:"activity"}]},{heading:"Workspace",items:[{id:"projetos",title:"Projetos",icon:"folder-kanban",children:[{id:"projetos-ativos",title:"Ativos",icon:"hash"},{id:"projetos-arquivados",title:"Arquivados",icon:"hash"}]},{id:"agenda",title:"Agenda",icon:"calendar"},{id:"equipe",title:"Equipe",icon:"users",children:[{id:"equipe-design",title:"Design",icon:"hash"},{id:"equipe-engenharia",title:"Engenharia",icon:"hash"},{id:"equipe-produto",title:"Produto",icon:"hash"}]},{id:"clientes",title:"Clientes",icon:"globe",children:[{id:"clientes-enterprise",title:"Enterprise",icon:"hash"},{id:"clientes-pme",title:"PME",icon:"hash"}]},{id:"financeiro",title:"Financeiro",icon:"credit-card"}]},{heading:"Desenvolvedores",items:[{id:"chaves",title:"Chaves de API",icon:"terminal"},{id:"webhooks",title:"Webhooks",icon:"blocks"}]}],f=[{id:"configuracoes",title:"Configurações",icon:"settings",shortcut:"⌘,"},{id:"sair",title:"Sair",icon:"log-out"}],_=e=>e.flatMap(e=>[e,...e.children?_(e.children):[]]),v=_([...b.flatMap(e=>e.items),...f]),y=[...b.flatMap(e=>e.items),...f].filter(e=>"buscar"!==e.id);function w({theme:e="dark",shortcuts:r=!0}){let s=t.useRef(null),[o,i]=t.useState(!0),[n,l]=t.useState(!1),[c,m]=t.useState("inicio"),[x,u]=t.useState(g[0].name),[_,j]=t.useState(!1);t.useEffect(()=>{let e=s.current;if(!e)return;let a=new ResizeObserver(()=>l(e.clientWidth<480));return a.observe(e),()=>a.disconnect()},[]);let N=e=>{if("buscar"===e)return j(e=>!e);m(e),n&&i(!1)},M=t.useCallback(()=>j(!1),[]),S=v.find(e=>e.id===c)?.title??"Painel";return(0,a.jsxs)("div",{className:"ds-demo","data-theme":e,children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:k}}),(0,a.jsxs)("div",{ref:s,className:"ds-theme ds-demo__frame","data-theme":e,"data-narrow":n||void 0,children:[(0,a.jsx)(p,{className:"ds-demo__sidebar",theme:e,open:o,groups:b,footer:f,workspaces:g,workspace:x,onWorkspaceChange:u,activeId:c,onSelect:N,shortcuts:r}),n&&o&&(0,a.jsx)("div",{className:"ds-demo__scrim",onClick:()=>i(!1),"aria-hidden":"true"}),(0,a.jsxs)("div",{className:"ds-demo__main",children:[(0,a.jsxs)("header",{className:"ds-demo__bar",children:[(0,a.jsxs)("div",{className:"ds-demo__bar-start",children:[(0,a.jsx)("button",{type:"button",className:"ds-btn ds-demo__toggle","aria-label":o?"Recolher a barra lateral":"Abrir a barra lateral","aria-expanded":o,onClick:()=>i(e=>!e),children:(0,a.jsx)(d,{name:o?"panel-left-close":"panel-left-open",size:18})}),(0,a.jsxs)("nav",{className:"ds-demo__crumbs","aria-label":"Você está em",children:[(0,a.jsx)("span",{className:"ds-demo__crumb",children:x}),(0,a.jsx)("span",{"aria-hidden":"true",children:"/"}),(0,a.jsx)("span",{className:"ds-demo__crumb ds-demo__crumb--current","aria-current":"page",children:S})]})]}),(0,a.jsxs)("div",{className:"ds-demo__bar-end","aria-hidden":"true",children:[(0,a.jsx)("span",{className:"ds-demo__search"}),(0,a.jsx)("span",{className:"ds-demo__avatar"})]})]}),(0,a.jsxs)("div",{className:"ds-demo__body","aria-hidden":"true",children:[(0,a.jsx)("span",{className:"ds-demo__title"}),(0,a.jsxs)("div",{className:"ds-demo__cards",children:[(0,a.jsx)("span",{className:"ds-demo__card"}),(0,a.jsx)("span",{className:"ds-demo__card"})]}),(0,a.jsxs)("div",{className:"ds-demo__card ds-demo__table",children:[(0,a.jsx)("span",{className:"ds-demo__table-title"}),(0,a.jsx)("span",{className:"ds-demo__table-rule"}),(0,a.jsxs)("div",{className:"ds-demo__rows",children:[(0,a.jsx)("span",{}),(0,a.jsx)("span",{}),(0,a.jsx)("span",{}),(0,a.jsx)("span",{})]})]})]})]}),(0,a.jsx)(h,{theme:e,open:_,onClose:M,items:y,onSelect:N})]})]})}let k=`
.ds-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  padding: 16px;
  background: #0a0a0a;
}
.ds-demo[data-theme="light"] { background: #fafafa; }
@media (min-width: 768px) { .ds-demo { padding: 32px; } }

/* o painel: 896 \xd7 700, com a barra \xe0 esquerda e o conte\xfado \xe0 direita */
.ds-demo .ds-demo__frame {
  --ds-demo-wash: rgba(255, 255, 255, .02);
  --ds-demo-skeleton: rgba(255, 255, 255, .05);
  position: relative;
  display: flex;
  width: 100%;
  max-width: 896px;
  height: 700px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  border-radius: 12px;
  background: var(--ds-card);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .05), 0 1px 3px rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
}
.ds-demo .ds-demo__frame[data-theme="light"] {
  --ds-demo-wash: rgba(0, 0, 0, .02);
  --ds-demo-skeleton: rgba(0, 0, 0, .05);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .05), 0 1px 3px rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
}
/* estreito: a barra passa por cima do conte\xfado, com um v\xe9u atr\xe1s */
.ds-demo .ds-demo__frame[data-narrow] .ds-demo__sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  background: var(--ds-card);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .5);
}
.ds-demo .ds-demo__scrim {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--ds-bg) 60%, transparent);
  animation: ds-demo-fade .3s ease;
}
@keyframes ds-demo-fade { from { opacity: 0; } }

.ds-demo .ds-demo__main {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  background: var(--ds-demo-wash);
}
.ds-demo .ds-demo__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  background: var(--ds-card);
}
.ds-demo .ds-demo__bar-start { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ds-demo .ds-demo__toggle {
  flex: none;
  padding: 6px;
  border-radius: 6px;
  color: var(--ds-muted);
  transition: color .15s var(--ds-ease), background-color .15s var(--ds-ease);
}
.ds-demo .ds-demo__toggle svg { display: block; }
.ds-demo .ds-demo__crumbs { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 14px; line-height: 20px; color: var(--ds-muted); }
.ds-demo .ds-demo__crumb { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ds-demo .ds-demo__crumb--current { font-weight: 500; color: var(--ds-fg); }
.ds-demo .ds-demo__bar-end { display: flex; align-items: center; flex: none; gap: 12px; }
.ds-demo .ds-demo__search { display: none; width: 256px; height: 32px; border-radius: 6px; background: var(--ds-demo-skeleton); }
.ds-demo .ds-demo__avatar {
  width: 32px;
  height: 32px;
  border: 1px solid color-mix(in srgb, var(--ds-primary) 20%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ds-primary) 10%, transparent);
}

/* o conte\xfado, em esqueleto */
.ds-demo .ds-demo__body { flex: 1; min-height: 0; padding: 24px; overflow-y: auto; scrollbar-width: none; }
.ds-demo .ds-demo__body::-webkit-scrollbar { display: none; }
.ds-demo .ds-demo__body span { display: block; }
.ds-demo .ds-demo__title { width: 192px; height: 32px; margin-bottom: 32px; border-radius: 6px; background: var(--ds-demo-skeleton); }
.ds-demo .ds-demo__cards { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 24px; }
.ds-demo .ds-demo__card {
  height: 128px;
  border: 1px solid color-mix(in srgb, var(--ds-border) 50%, transparent);
  border-radius: 12px;
  background: var(--ds-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
}
.ds-demo .ds-demo__table { height: auto; padding: 24px; }
.ds-demo .ds-demo__table-title { width: 33.333%; height: 20px; margin-bottom: 24px; border-radius: 6px; background: var(--ds-demo-skeleton); }
.ds-demo .ds-demo__table-rule { height: 1px; margin-bottom: 24px; background: color-mix(in srgb, var(--ds-border) 50%, transparent); }
.ds-demo .ds-demo__rows { display: flex; flex-direction: column; gap: 16px; }
.ds-demo .ds-demo__rows span { height: 48px; border-radius: 8px; background: var(--ds-demo-skeleton); }

@container (min-width: 560px) {
  .ds-demo .ds-demo__search { display: block; }
  .ds-demo .ds-demo__body { padding: 32px; }
  .ds-demo .ds-demo__cards { grid-template-columns: 1fr 1fr; }
}
@media (hover: hover) {
  .ds-demo .ds-demo__toggle:hover { background: var(--ds-hover); color: var(--ds-fg); }
}
`;var j=e.i(229389);e.s(["default",0,function({mode:e,compact:r}){let s=(0,t.useRef)(null);return((0,t.useEffect)(()=>{s.current?.querySelectorAll("button, a, input").forEach(e=>e.tabIndex=-1)},[]),"stage"===e)?(0,a.jsx)("div",{className:`${j.default.stage} ${r?j.default.compact:""}`,children:(0,a.jsx)(w,{})}):(0,a.jsx)("div",{ref:s,className:`${j.default.stage} ${j.default.compact} ${j.default.tile}`,"aria-hidden":"true",children:(0,a.jsx)(w,{shortcuts:!1})})}],598162)},740298,function(e){e.n(e.i(598162))}]);

//# debugId=afdd98a2-f83f-4814-d6a0-a1c60a531ec4