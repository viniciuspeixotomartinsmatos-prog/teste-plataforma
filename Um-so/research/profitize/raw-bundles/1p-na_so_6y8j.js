;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="7c071ef8-4337-a656-d853-be109cb792d1")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,771856,e=>{e.v({stage:"Web3Bento-module__4vocJW__stage"})},543012,e=>{"use strict";var a=e.i(843476),t=e.i(271645);function i(e,a,t,i,s){let n=e,r=()=>(n=16807*n%0x7fffffff)/0x7fffffff,l=[],o=t;for(let e=0;e<a;e++)o*=1+i+(r()-.5)*s,l.push(o);return l.map((e,a)=>{let t=l.slice(Math.max(0,a-3),a+1);return t.reduce((e,a)=>e+a,0)/t.length})}let s={account:"marina.eth",network:"Ethereum",history:i(7,365,61e3,.0011,.045),benchmark:i(11,365,61e3,6e-4,.05),allocation:[{symbol:"ETH",value:58200},{symbol:"USDC",value:21400},{symbol:"ARB",value:9800},{symbol:"OP",value:6100},{symbol:"Outros",value:4300}],staking:{asset:"ETH",staked:32,apy:3.42,rewards:.41837215,usdPrice:3368.5},liquidity:{pair:"ETH / USDC",fee:"0,05%",min:3120,max:3640,price:3368.5,fees:412.8},activity:[{id:"a1",kind:"bridge",title:"Bridge para a Base",detail:"via Across",amount:"−1,20 ETH",status:"pending",time:"agora"},{id:"a2",kind:"swap",title:"Swap ETH → USDC",detail:"Uniswap v4",amount:"+4.210 USDC",status:"confirmed",time:"12 min"},{id:"a3",kind:"stake",title:"Stake",detail:"Lido",amount:"−2,00 ETH",status:"confirmed",time:"2 h"},{id:"a4",kind:"mint",title:"Mint · Genesis Pass #418",detail:"Zora",amount:"−0,01 ETH",status:"confirmed",time:"1 d"},{id:"a5",kind:"receive",title:"Recebido",detail:"de 0x8f…21c4",amount:"+500 USDC",status:"confirmed",time:"2 d"}]},n="cubic-bezier(0.22, 1, 0.36, 1)",r=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],l=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],o={confirmed:"confirmada",pending:"pendente",failed:"falhou"};function c(...e){return e.filter(Boolean).join(" ")}let d="(prefers-reduced-motion: reduce)",b=e=>{let a=window.matchMedia(d);return a.addEventListener("change",e),()=>a.removeEventListener("change",e)};function p(){let[e,a]=t.useState(!1);return t.useEffect(()=>{let e=requestAnimationFrame(()=>a(!0));return()=>cancelAnimationFrame(e)},[]),e}let w=()=>()=>{},m=()=>new Date().toDateString();function x(){let e=t.useSyncExternalStore(w,m,()=>null);return t.useMemo(()=>e?new Date(e):null,[e])}function h(e){return e.map(([a,t],i)=>{if(0===i)return`M ${a.toFixed(1)} ${t.toFixed(1)}`;let[s,n]=e[i-1],r=(s+a)/2;return`C ${r.toFixed(1)} ${n.toFixed(1)}, ${r.toFixed(1)} ${t.toFixed(1)}, ${a.toFixed(1)} ${t.toFixed(1)}`}).join(" ")}let u=e=>e>=0?"+":"−";function f({title:e,action:t,className:i,children:s}){return(0,a.jsxs)("section",{className:c("w3b-tile",i),children:[(e||t)&&(0,a.jsxs)("header",{className:"w3b-head",children:[e&&(0,a.jsx)("h3",{children:e}),t]}),s]})}function g({value:e,options:t,onChange:i,label:s}){return(0,a.jsx)("div",{role:"radiogroup","aria-label":s,className:"w3b-pills",children:t.map(t=>(0,a.jsx)("button",{type:"button",role:"radio","aria-checked":t===e,onClick:()=>i(t),children:t},t))})}function _({account:e,history:i,fmt:s,accent:l,accent2:o,reduced:c}){let d=p(),b=x(),w=i[i.length-1],m=function(e,a,i=1300){let[s,n]=t.useState(0);return t.useEffect(()=>{if(!a)return;let t=0,s=performance.now(),r=a=>{let l=Math.min(1,(a-s)/i);n(e*(1-Math.pow(1-l,4))),l<1&&(t=requestAnimationFrame(r))};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e,a,i]),a?s:e}(w,!c),h=i.slice(-31),g=h.slice(1).map((e,a)=>(e/h[a]-1)*100),v=Math.max(...g.map(Math.abs),.01),k=w-h[0],j=(w/h[0]-1)*100,[y,N]=t.useState(null),$=e=>{if(!b)return"";let a=new Date(b);return a.setDate(a.getDate()-(g.length-1-e)),`${a.getDate()} ${r[a.getMonth()]}`};return(0,a.jsxs)(f,{className:"w3b-hero",children:[(0,a.jsxs)("div",{className:"w3b-hero__top",children:[(0,a.jsxs)("div",{className:"w3b-hero__hi",children:[(0,a.jsxs)("p",{className:"w3b-hero__gm",children:["gm, ",(0,a.jsx)("span",{style:{color:l},children:e})]}),(0,a.jsx)("p",{className:"w3b-hero__sub",children:"Seu mês onchain num relance."})]}),(0,a.jsxs)("div",{className:"w3b-hero__worth",children:[(0,a.jsx)("p",{className:"w3b-label",children:"Patrimônio"}),(0,a.jsx)("p",{className:"w3b-hero__value",children:s.usd(m)}),(0,a.jsxs)("p",{className:"w3b-hero__change",children:[(0,a.jsxs)("span",{style:{color:k>=0?l:o},children:[u(k),s.usd(Math.abs(k))," (",u(j),s.num(Math.abs(j),1),"%)"]}),(0,a.jsx)("span",{className:"w3b-muted",children:" · 30d"})]})]})]}),(0,a.jsxs)("div",{className:"w3b-hero__pnl",children:[(0,a.jsx)("div",{className:"w3b-bars",onPointerLeave:()=>N(null),children:g.map((e,t)=>{let i=18+Math.abs(e)/v*82,r=e>=0;return(0,a.jsx)("button",{type:"button",onPointerEnter:()=>N(t),onFocus:()=>N(t),onBlur:()=>N(null),"aria-label":`${$(t)}: ${u(e)}${s.num(Math.abs(e),2)}%`,className:"w3b-bar",style:{height:d?`${i}%`:"6%",background:r?l:o,opacity:null===y?.35+Math.abs(e)/v*.65:y===t?1:.25,transition:`height 900ms ${n} ${18*t}ms, opacity 200ms ease`}},t)})}),(0,a.jsxs)("div",{className:"w3b-axis",children:[(0,a.jsx)("span",{children:$(0)}),(0,a.jsx)("span",{className:"w3b-axis__now","aria-live":"polite",children:null!==y?`${$(y)} \xb7 ${u(g[y])}${s.num(Math.abs(g[y]),2)}%`:"PnL diário"}),(0,a.jsx)("span",{children:"Hoje"})]})]})]})}function v(){return(0,a.jsxs)("svg",{width:"26",height:"20",viewBox:"0 0 26 20","aria-hidden":!0,children:[(0,a.jsx)("rect",{x:"0.5",y:"0.5",width:"25",height:"19",rx:"4.5",fill:"oklch(0.9 0.06 90)",stroke:"oklch(0.62 0.07 80 / 0.6)"}),(0,a.jsx)("path",{d:"M0.5 7h7.5v6H0.5M25.5 7H18v6h7.5M8 0.5v19M18 0.5v19M8 10h10",fill:"none",stroke:"oklch(0.6 0.07 80 / 0.55)",strokeWidth:"0.9"})]})}function k({c:e,glare:t}){return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{"aria-hidden":!0,className:"w3b-face",style:{backgroundImage:`linear-gradient(180deg, oklch(1 0 0 / 0.3) 0%, transparent 34%), radial-gradient(110% 90% at 100% 0%, ${e.color2} 0%, transparent 60%), linear-gradient(135deg, ${e.color} 0%, ${e.color2} 100%)`},children:(0,a.jsx)("span",{className:"w3b-holo",style:{backgroundPosition:`${t}% 0`}})}),(0,a.jsxs)("span",{className:"w3b-face__top",children:[(0,a.jsxs)("span",{className:"w3b-face__name",children:[e.logo??(0,a.jsx)(v,{}),(0,a.jsx)("span",{children:e.label})]}),(0,a.jsxs)("span",{className:"w3b-face__last4",children:["**** ",e.last4]})]}),(0,a.jsx)("span",{className:"w3b-face__nfc","aria-hidden":!0,children:(0,a.jsx)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",children:(0,a.jsx)("path",{d:"M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.5a13 13 0 0 1 0 19",stroke:"currentColor",strokeWidth:"1.9",strokeLinecap:"round"})})})]})}function j({cards:e,reduced:i}){let[s,n]=t.useState(()=>e.map(e=>e.id)),r=p(),l=s.length-1,o=a=>e.find(e=>e.id===a)??e[e.length-1],c=o(s[s.length-1]),[d,b]=t.useState(30),w=t.useRef(!1);return t.useEffect(()=>{if(i)return;let e=0,a=performance.now(),t=i=>{b(e=>w.current?e:30+30*Math.sin((i-a)/2600)),e=requestAnimationFrame(t)};return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)},[i]),(0,a.jsx)(f,{title:(0,a.jsxs)("span",{children:["Cartões ",(0,a.jsx)("sup",{children:e.length})]}),className:"w3b-cards",children:(0,a.jsxs)("div",{className:"w3b-cards__well",onPointerMove:e=>{let a=e.currentTarget.getBoundingClientRect();w.current=!0,b((e.clientX-a.left)/a.width*100)},onPointerLeave:()=>{w.current=!1},children:[(0,a.jsxs)("div",{className:"w3b-cards__stack",children:[s.map((e,t)=>{let c=o(e),b=s.length-1-t,p=0===b;return(0,a.jsx)("button",{type:"button",onClick:()=>!p&&n(a=>[...a.filter(a=>a!==e),e]),"aria-label":`Cart\xe3o ${c.label} final ${c.last4}${p?", selecionado":", trazer para a frente"}`,"aria-pressed":p,className:"w3b-card",style:{top:(l-b)*46,zIndex:t+1,transform:`translateX(-50%) scale(${1-.055*b}) translateY(${20*!r}px)`,opacity:+!!r,color:c.ink,transition:i?"none":`top 650ms cubic-bezier(0.34, 1.35, 0.64, 1), transform 650ms cubic-bezier(0.34, 1.35, 0.64, 1), opacity 500ms ease ${90*t}ms`,cursor:p?"default":"pointer"},children:(0,a.jsx)("span",{className:"w3b-card__ratio",children:(0,a.jsx)("span",{className:"w3b-card__fill",children:(0,a.jsx)(k,{c:c,glare:d+18*b})})})},e)}),(0,a.jsx)("div",{"aria-hidden":!0,className:"w3b-cards__spacer",style:{marginTop:46*l},children:(0,a.jsx)("div",{})})]}),(0,a.jsxs)("div",{className:"w3b-cards__panel","aria-live":"polite",children:[(0,a.jsxs)("div",{className:"w3b-cards__info",children:[(0,a.jsxs)("p",{className:"w3b-cards__number",children:["•••• ",c.last4]}),(0,a.jsxs)("p",{className:"w3b-cards__holder",children:[c.holder??c.label,c.expiry?` \xb7 ${c.expiry}`:""]})]}),c.balance&&(0,a.jsx)("p",{className:"w3b-cards__balance",children:c.balance})]})]})})}function y({accent:e,ethPrice:i,fmt:s,reduced:r}){let[l,o]=t.useState(14.2),[c,d]=t.useState("Normal");t.useEffect(()=>{if(r)return;let e=window.setInterval(()=>o(e=>Math.max(4,Math.min(60,e+(Math.random()-.5)*3.2))),2200);return()=>window.clearInterval(e)},[r]);let b=l*({Lento:.85,Normal:1,Rápido:1.35})[c],p=Math.min(1,b/60),w=62*Math.PI;return(0,a.jsxs)(f,{title:"Gas",className:"w3b-gas",action:(0,a.jsx)("span",{className:"w3b-tag",children:"ao vivo"}),children:[(0,a.jsxs)("div",{className:"w3b-gas__body",children:[(0,a.jsxs)("svg",{width:"150",height:"86",viewBox:"0 0 150 86","aria-hidden":!0,children:[(0,a.jsx)("path",{d:"M 13 78 A 62 62 0 0 1 137 78",fill:"none",strokeWidth:"10",strokeLinecap:"round",style:{stroke:"var(--w3b-muted)"}}),(0,a.jsx)("path",{d:"M 13 78 A 62 62 0 0 1 137 78",fill:"none",strokeWidth:"10",strokeLinecap:"round",strokeDasharray:w,style:{stroke:e,strokeDashoffset:w*(1-p),transition:`stroke-dashoffset 900ms ${n}`}}),(0,a.jsx)("g",{style:{transform:`rotate(${-90+180*p}deg)`,transformOrigin:"75px 78px",transition:`transform 900ms ${n}`},children:(0,a.jsx)("line",{x1:"75",y1:"78",x2:"75",y2:"30",strokeWidth:"2.5",strokeLinecap:"round",style:{stroke:"var(--w3b-fg)"}})}),(0,a.jsx)("circle",{cx:"75",cy:"78",r:"5",style:{fill:"var(--w3b-fg)"}})]}),(0,a.jsxs)("p",{className:"w3b-gas__value",children:[s.num(b,1)," ",(0,a.jsx)("span",{children:"gwei"})]}),(0,a.jsxs)("p",{className:"w3b-small",children:["≈ ",s.usd(21e3*b*1e-9*i,2)," por transferência"]})]}),(0,a.jsx)("div",{className:"w3b-gas__speed",children:(0,a.jsx)(g,{label:"Velocidade",value:c,options:["Lento","Normal","Rápido"],onChange:d})})]})}function N({history:e,benchmark:i,fmt:s,accent:o,reduced:c}){let d=t.useId().replace(/[^a-zA-Z0-9_-]/g,""),[b,w]=t.useState("1A"),[m,_]=t.useState(null),v=p(),k=x(),j={"1S":8,"1M":31,"1A":e.length}[b],y="1A"===b?7:1,$=e=>e.slice(-j).filter((e,a,t)=>a%y==0||a===t.length-1),M=$(e),S=$(i),z=Math.min(...M,...S),E=Math.max(...M,...S),C=e=>204-(e-z)/(E-z||1)*180,P=M.map((e,a)=>[a/(M.length-1)*640,C(e)]),L=S.map((e,a)=>[a/(S.length-1)*640,C(e)]),T=h(P),A=h(L),F=m??M.length-1,D=(M[M.length-1]/M[0]-1-(S[S.length-1]/S[0]-1))*100,B="1M"===b?["4 sem","3 sem","2 sem","1 sem","Hoje"]:k?"1A"===b?[12,10,8,6,4,2].map(e=>{let a=r[(k.getMonth()-e+24)%12];return a[0].toUpperCase()+a.slice(1)}).concat("Hoje"):[6,5,4,3,2,1].map(e=>l[(k.getDay()-e+7)%7]).concat("Hoje"):Array(7).fill(""),H=`${P[F][0]/640*100}%`;return(0,a.jsxs)(f,{title:"Carteira vs ETH",className:"w3b-chart",action:(0,a.jsx)(g,{label:"Período do gráfico",value:b,options:["1S","1M","1A"],onChange:w}),children:[(0,a.jsxs)("div",{className:"w3b-chart__legend",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("p",{className:"w3b-key",children:[(0,a.jsx)("span",{className:"w3b-key__line",style:{background:o},"aria-hidden":!0}),"Carteira"]}),(0,a.jsx)("p",{className:"w3b-figure",children:s.usd(M[F])})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("p",{className:"w3b-key",children:[(0,a.jsx)("span",{className:"w3b-key__dash","aria-hidden":!0}),"Só ETH"]}),(0,a.jsx)("p",{className:"w3b-figure w3b-muted",children:s.usd(S[F])})]}),(0,a.jsxs)("span",{className:"w3b-chart__lead",style:{background:`color-mix(in oklch, ${o} 18%, transparent)`,color:o},children:[u(D),s.num(Math.abs(D),1),"% vs ETH"]})]}),(0,a.jsxs)("div",{className:"w3b-chart__plot",onPointerMove:e=>{let a=e.currentTarget,t=a.getBoundingClientRect(),i=(e.clientX-t.left)/t.width*a.clientWidth;_(Math.max(0,Math.min(M.length-1,Math.round(i/a.clientWidth*(M.length-1)))))},onPointerLeave:()=>_(null),role:"img","aria-label":`Carteira em ${s.usd(M[M.length-1])} contra ${s.usd(S[S.length-1])} s\xf3 em ETH, em ${b}`,children:[(0,a.jsxs)("svg",{viewBox:"0 0 640 220",preserveAspectRatio:"none","aria-hidden":!0,children:[(0,a.jsx)("defs",{children:(0,a.jsxs)("linearGradient",{id:`${d}-f`,x1:"0",x2:"0",y1:"0",y2:"1",children:[(0,a.jsx)("stop",{offset:"0",style:{stopColor:o,stopOpacity:.28}}),(0,a.jsx)("stop",{offset:"1",style:{stopColor:o,stopOpacity:0}})]})}),[.25,.5,.75].map(e=>(0,a.jsx)("line",{x1:0,x2:640,y1:220*e,y2:220*e,vectorEffect:"non-scaling-stroke",strokeDasharray:"1 5",style:{stroke:"var(--w3b-border)"}},e)),(0,a.jsx)("path",{d:`${T} L 640 220 L 0 220 Z`,fill:`url(#${d}-f)`,style:{opacity:+!!v,transition:"opacity 900ms ease 400ms"}}),(0,a.jsx)("path",{d:A,fill:"none",strokeWidth:1.5,strokeDasharray:"4 5",vectorEffect:"non-scaling-stroke",style:{stroke:"var(--w3b-muted-fg)"}}),(0,a.jsx)("path",{d:T,fill:"none",strokeWidth:2.5,strokeLinecap:"round",vectorEffect:"non-scaling-stroke",pathLength:1,style:{stroke:o,strokeDasharray:1,strokeDashoffset:v||c?0:1,transition:c?"none":`stroke-dashoffset 1300ms ${n}`}},b)]}),(0,a.jsx)("span",{"aria-hidden":!0,className:"w3b-chart__cross",style:{left:H,opacity:+(null!==m)}}),(0,a.jsx)("span",{"aria-hidden":!0,className:"w3b-chart__dot",style:{left:H,top:`${P[F][1]/220*100}%`,background:o}}),(0,a.jsx)("span",{"aria-hidden":!0,className:"w3b-chart__dot2",style:{left:H,top:`${L[F][1]/220*100}%`,opacity:+(null!==m)}})]}),(0,a.jsx)("div",{className:"w3b-axis w3b-chart__axis","aria-hidden":!0,children:B.map((e,t)=>(0,a.jsx)("span",{children:e},t))})]})}function $({allocation:e,fmt:i,accent:s,accent2:r}){let l=p(),o=e.reduce((e,a)=>e+a.value,0),c=[s,r,"oklch(0.78 0.04 280)","oklch(0.6 0.03 280)","oklch(0.42 0.02 280)"],[d,b]=t.useState(null);return(0,a.jsxs)(f,{title:"Alocação",className:"w3b-alloc",children:[(0,a.jsx)("p",{className:"w3b-figure",children:i.usd(o)}),(0,a.jsx)("div",{className:"w3b-alloc__bar",onPointerLeave:()=>b(null),children:e.map((t,i)=>(0,a.jsx)("span",{onPointerEnter:()=>b(i),style:{flexBasis:l?`${t.value/o*100}%`:`${100/e.length}%`,background:c[i%c.length],opacity:null===d||d===i?1:.3,transition:`flex-basis 1000ms ${n} ${200+60*i}ms, opacity 200ms ease`},"aria-hidden":!0},t.symbol))}),(0,a.jsx)("ul",{className:"w3b-alloc__list",children:e.map((e,t)=>(0,a.jsxs)("li",{onPointerEnter:()=>b(t),onPointerLeave:()=>b(null),children:[(0,a.jsxs)("span",{className:"w3b-alloc__name",children:[(0,a.jsx)("i",{style:{background:c[t%c.length]},"aria-hidden":!0}),e.symbol]}),(0,a.jsxs)("span",{className:"w3b-alloc__pct",children:[i.num(e.value/o*100,1),"%"]})]},e.symbol))})]})}let M=[.62,.7,.58,.81,.74,.9,.86,.95,.88,1];function S({staking:e,fmt:i,accent:s,reduced:n}){let[r,l]=t.useState(e.rewards),o=e.staked*e.apy/100/31536e3;t.useEffect(()=>{if(n)return;let e=window.setInterval(()=>l(e=>e+.1*o),100);return()=>window.clearInterval(e)},[n,o]);let[c,d]=t.useState(!1),[b,p]=t.useState(211);t.useEffect(()=>{let e=window.setInterval(()=>p(e=>(e+1)%384),1e3);return()=>window.clearInterval(e)},[]);let w=384-b,m=`${Math.floor(w/60)}m ${String(Math.floor(w%60)).padStart(2,"0")}s`;return(0,a.jsxs)("section",{className:"w3b-stake",style:{background:s},children:[(0,a.jsxs)("header",{className:"w3b-stake__head",children:[(0,a.jsx)("h3",{children:"Staking"}),(0,a.jsxs)("span",{className:"w3b-stake__badge",children:[(0,a.jsx)("i",{"aria-hidden":!0}),"Rendendo"]})]}),(0,a.jsxs)("p",{className:"w3b-stake__apy",children:[i.num(e.apy,2),(0,a.jsx)("span",{children:"%"})]}),(0,a.jsxs)("p",{className:"w3b-stake__on",children:["APY sobre ",i.num(e.staked)," ",e.asset]}),(0,a.jsxs)("div",{className:"w3b-stake__payout",children:[(0,a.jsxs)("div",{className:"w3b-stake__row",children:[(0,a.jsx)("span",{className:"w3b-dim",children:"Próximo pagamento"}),(0,a.jsx)("span",{className:"w3b-mono",children:m})]}),(0,a.jsx)("div",{className:"w3b-stake__track",children:(0,a.jsx)("div",{style:{width:`${b/384*100}%`}})})]}),(0,a.jsx)("dl",{className:"w3b-stake__facts",children:[["Validador","#1.204.381"],["Eficiência","99,4%"],["Provedor","Lido"]].map(([e,t])=>(0,a.jsxs)("div",{children:[(0,a.jsx)("dt",{children:e}),(0,a.jsx)("dd",{children:t})]},e))}),(0,a.jsxs)("div",{className:"w3b-stake__foot",children:[(0,a.jsx)("p",{className:"w3b-stake__label",children:"Recompensas até agora"}),(0,a.jsxs)("p",{className:"w3b-stake__rewards","aria-live":"off",children:[i.num(r,8)," ",(0,a.jsx)("span",{children:e.asset})]}),(0,a.jsxs)("p",{className:"w3b-stake__usd",children:["≈ ",i.usd(r*e.usdPrice)]}),(0,a.jsx)("div",{className:"w3b-stake__epochs","aria-hidden":!0,children:M.map((e,t)=>(0,a.jsx)("span",{style:{height:`${100*e}%`,opacity:.12+t/M.length*.5}},t))}),(0,a.jsx)("p",{className:"w3b-stake__caption",children:"Últimas 10 épocas"}),(0,a.jsx)("button",{type:"button",onClick:()=>d(!0),disabled:c,className:"w3b-stake__claim",style:{color:s},children:c?"Resgate enviado":"Resgatar recompensas"})]})]})}function z({lp:e,fmt:i,accent:s,accent2:r,reduced:l}){let[o,c]=t.useState(e.price);t.useEffect(()=>{if(l)return;let e=window.setInterval(()=>c(e=>e*(1+(Math.random()-.5)*.006)),1800);return()=>window.clearInterval(e)},[l]);let d=e.min-(e.max-e.min)*.45,b=e.max+(e.max-e.min)*.45,p=e=>(e-d)/(b-d)*100,w=o>=e.min&&o<=e.max,m=w?s:r;return(0,a.jsxs)(f,{title:`${e.pair} \xb7 ${e.fee}`,className:"w3b-lp",action:(0,a.jsx)("span",{className:"w3b-badge",style:{background:`color-mix(in oklch, ${m} 18%, transparent)`,color:m},children:w?"Na faixa":"Fora da faixa"}),children:[(0,a.jsx)("p",{className:"w3b-figure",children:i.usd(o,2)}),(0,a.jsx)("p",{className:"w3b-small",children:"preço atual"}),(0,a.jsxs)("div",{className:"w3b-lp__range",role:"img","aria-label":`Faixa de ${i.usd(e.min)} a ${i.usd(e.max)}, pre\xe7o em ${i.usd(o,2)}`,children:[(0,a.jsx)("div",{className:"w3b-lp__line"}),(0,a.jsx)("div",{className:"w3b-lp__band",style:{left:`${p(e.min)}%`,width:`${p(e.max)-p(e.min)}%`,background:`repeating-linear-gradient(135deg, color-mix(in oklch, ${s} 26%, transparent) 0 6px, color-mix(in oklch, ${s} 12%, transparent) 6px 12px)`,boxShadow:`inset 0 0 0 1px color-mix(in oklch, ${s} 55%, transparent)`}}),(0,a.jsx)("div",{className:"w3b-lp__price",style:{left:`${Math.max(2,Math.min(98,p(o)))}%`,transition:`left 900ms ${n}`}})]}),(0,a.jsxs)("div",{className:"w3b-axis",children:[(0,a.jsx)("span",{style:{marginLeft:`${p(e.min)-6}%`},children:i.num(e.min)}),(0,a.jsx)("span",{style:{marginRight:`${100-p(e.max)-6}%`},children:i.num(e.max)})]}),(0,a.jsxs)("p",{className:"w3b-lp__fees",children:["Taxas ganhas ",(0,a.jsx)("b",{children:i.usd(e.fees,2)})]})]})}function E({accent:e,fmt:i,reduced:s}){let n=t.useMemo(()=>Array.from({length:42},(e,a)=>.35+(43758.5453*Math.sin(12.9898*a)%1+1)%1*.65),[]),[r,l]=t.useState(()=>n.map((e,a)=>({n:0x141df92+a,fill:e,txs:Math.round(80+180*e)}))),[o,c]=t.useState(0);t.useEffect(()=>{if(s)return;let e=window.setInterval(()=>{l(e=>{let a=.3+.7*Math.random();return[...e.slice(1),{n:e[e.length-1].n+1,fill:a,txs:Math.round(80+180*a)}]}),c(0)},3e3),a=window.setInterval(()=>c(e=>e+1),1e3);return()=>{window.clearInterval(e),window.clearInterval(a)}},[s]);let d=r[r.length-1];return(0,a.jsxs)(f,{title:"Blocos",className:"w3b-blocks",action:(0,a.jsxs)("span",{className:"w3b-tag",children:["há ",o,"s"]}),children:[(0,a.jsxs)("div",{className:"w3b-blocks__top",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("p",{className:"w3b-figure",children:["#",i.num(d.n)]}),(0,a.jsxs)("p",{className:"w3b-small",children:[d.txs," txs · ",i.num(100*d.fill),"% cheio"]})]}),(0,a.jsx)("p",{className:"w3b-small",children:"alvo de 12s"})]}),(0,a.jsx)("div",{className:"w3b-blocks__bars","aria-hidden":!0,children:r.map((t,i)=>{let n=i===r.length-1;return(0,a.jsx)("span",{className:n&&!s?"w3b-pop":void 0,style:{height:`${100*t.fill}%`,background:n?e:"var(--w3b-muted-fg)",opacity:n?1:.15+i/r.length*.45}},t.n)})}),(0,a.jsx)("dl",{className:"w3b-blocks__stats",children:[["Bloco médio","12,1s"],["Gas usado",`${Math.round(r.reduce((e,a)=>e+a.fill,0)/r.length*100)}%`],["Vazão",`${i.num(r.slice(-10).reduce((e,a)=>e+a.txs,0)/120,1)} tx/s`]].map(([e,t])=>(0,a.jsxs)("div",{children:[(0,a.jsx)("dt",{children:e}),(0,a.jsx)("dd",{children:t})]},e))})]})}function C({kind:e}){let t={width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0};return"swap"===e?(0,a.jsx)("svg",{...t,children:(0,a.jsx)("path",{d:"M7 7h12l-3-3M17 17H5l3 3"})}):"bridge"===e?(0,a.jsx)("svg",{...t,children:(0,a.jsx)("path",{d:"M3 17c3-6 15-6 18 0M7 13v4M17 13v4M12 11.5V17"})}):"stake"===e?(0,a.jsx)("svg",{...t,children:(0,a.jsx)("path",{d:"M12 3 4 7l8 4 8-4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4"})}):"mint"===e?(0,a.jsx)("svg",{...t,children:(0,a.jsx)("path",{d:"M12 3v18M3 12h18M6 6l12 12M18 6 6 18"})}):(0,a.jsx)("svg",{...t,children:(0,a.jsx)("path",{d:"M12 5v14m0 0-6-6m6 6 6-6"})})}function P({activity:e,accent:t,accent2:i}){let s=p();return(0,a.jsx)(f,{title:"Atividade onchain",className:"w3b-activity",children:(0,a.jsx)("ul",{className:"w3b-activity__list",children:e.slice(0,4).map((e,r)=>(0,a.jsxs)("li",{style:{opacity:+!!s,transform:s?"none":"translateY(6px)",transition:`opacity 500ms ease ${300+70*r}ms, transform 500ms ${n} ${300+70*r}ms, background-color 150ms ease`},children:[(0,a.jsx)("span",{className:"w3b-activity__icon",children:(0,a.jsx)(C,{kind:e.kind})}),(0,a.jsxs)("div",{className:"w3b-activity__text",children:[(0,a.jsx)("p",{className:"w3b-activity__title",children:e.title}),(0,a.jsxs)("p",{className:"w3b-activity__detail",children:[e.detail," · ",e.time]})]}),(0,a.jsxs)("div",{className:"w3b-activity__end",children:[(0,a.jsx)("p",{className:"w3b-activity__amount",children:e.amount}),(0,a.jsxs)("p",{className:"w3b-activity__status",style:{color:"pending"===e.status?t:"failed"===e.status?i:"var(--w3b-muted-fg)"},children:["pending"===e.status&&(0,a.jsxs)("svg",{width:"10",height:"10",viewBox:"0 0 24 24",className:"w3b-spin","aria-hidden":!0,children:[(0,a.jsx)("circle",{cx:"12",cy:"12",r:"9",fill:"none",stroke:"currentColor",strokeOpacity:"0.3",strokeWidth:"3"}),(0,a.jsx)("path",{d:"M21 12a9 9 0 0 0-9-9",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"})]}),o[e.status]]})]})]},e.id))})})}let L=Number(t.version.split(".")[0])>=19;function T(){return L?(0,a.jsx)("style",{href:"web3-bento",precedence:"default",children:B}):(0,a.jsx)("style",{hidden:!0,dangerouslySetInnerHTML:{__html:B}})}function A({account:e=s.account,network:i=s.network,history:n=s.history,benchmark:r=s.benchmark,allocation:l=s.allocation,staking:o=s.staking,liquidity:p=s.liquidity,activity:w=s.activity,cards:m,accent:x="oklch(0.89 0.2 128)",accent2:h="oklch(0.74 0.12 300)",locale:u="pt-BR",className:f}){let g=t.useSyncExternalStore(b,()=>window.matchMedia(d).matches,()=>!1),v=t.useMemo(()=>{let e={},a=(a,t)=>e[a]??=new Intl.NumberFormat(u,t);return{usd:(e,t=0)=>a(`u${t}`,{style:"currency",currency:"USD",minimumFractionDigits:t,maximumFractionDigits:t}).format(e),num:(e,t=0)=>a(`n${t}`,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}},[u]);return(0,a.jsxs)("div",{className:c("w3b",f),children:[(0,a.jsx)(T,{}),(0,a.jsxs)("nav",{className:"w3b-nav","aria-label":"Painel",children:[(0,a.jsxs)("span",{className:"w3b-nav__net",children:[(0,a.jsx)("i",{style:{background:x},"aria-hidden":!0}),i]}),(0,a.jsx)("span",{className:"w3b-nav__account",children:e})]}),(0,a.jsxs)("div",{className:"w3b-grid",children:[(0,a.jsx)(_,{account:e,history:n,fmt:v,accent:x,accent2:h,reduced:g}),(0,a.jsx)(j,{reduced:g,cards:m??[{id:"k3",label:"Reserva",last4:"3368",holder:"Marina Costa",expiry:"09/29",balance:"US$ 12.480",color:"oklch(0.82 0.11 55)",color2:"oklch(0.7 0.15 30)",ink:"oklch(0.25 0.05 40)"},{id:"k2",label:"Virtual",last4:"4352",holder:"Marina Costa",expiry:"03/28",balance:"US$ 2.910",color:"oklch(0.8 0.1 300)",color2:"oklch(0.64 0.15 285)",ink:"oklch(0.2 0.06 290)"},{id:"k1",label:"Principal",last4:"6902",holder:"Marina Costa",expiry:"07/27",balance:"US$ 84.316",color:x,color2:"oklch(0.74 0.17 165)",ink:"oklch(0.22 0.06 140)"}]},(m??[]).map(e=>e.id).join("|")),(0,a.jsx)(y,{accent:x,ethPrice:o.usdPrice,fmt:v,reduced:g}),(0,a.jsx)(N,{history:n,benchmark:r,fmt:v,accent:x,reduced:g}),(0,a.jsx)($,{allocation:l,fmt:v,accent:x,accent2:h}),(0,a.jsx)(S,{staking:o,fmt:v,accent:x,reduced:g}),(0,a.jsx)(z,{lp:p,fmt:v,accent:x,accent2:h,reduced:g}),(0,a.jsx)(E,{accent:x,fmt:v,reduced:g}),(0,a.jsx)(P,{activity:w,accent:x,accent2:h})]})]})}let F='var(--font-geist-mono, "Geist Mono"), ui-monospace, SFMono-Regular, Menlo, monospace',D="oklch(0.24 0.06 135)",B=`
/* o que o projeto pode trocar com uma classe (posi\xe7\xe3o, largura, margem): na camada base, que vem antes dos utilit\xe1rios
   (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .w3b { position: relative; width: 100%; max-width: 1120px; margin: 0; }
}
/* o tema: troque estas vari\xe1veis para outras cores (um tema claro, por exemplo) */
.w3b {
  --w3b-bg: oklch(0.145 0 0);
  --w3b-fg: oklch(0.985 0 0);
  --w3b-card: oklch(0.205 0 0);
  --w3b-muted: oklch(0.269 0 0);
  --w3b-muted-fg: oklch(0.708 0 0);
  --w3b-border: oklch(1 0 0 / 0.1);
  --w3b-ring: oklch(0.556 0 0);
}
/* o painel n\xe3o herda nada da p\xe1gina: fonte, entrelinha e espa\xe7amento s\xe3o dele */
.w3b {
  container: w3b / inline-size;
  font: 400 16px/1.5 var(--font-geist-sans, Geist), ui-sans-serif, system-ui, -apple-system, sans-serif;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  word-spacing: normal;
  color: var(--w3b-fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.w3b *, .w3b *::before, .w3b *::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
.w3b svg { display: block; flex-shrink: 0; }
.w3b p, .w3b h3, .w3b dl, .w3b dd { font-size: inherit; font-weight: inherit; line-height: inherit; letter-spacing: inherit; color: inherit; }
.w3b ul { list-style: none; }
.w3b sup { font: 10px ${F}; vertical-align: super; line-height: 0; }
.w3b button { font: inherit; color: inherit; letter-spacing: inherit; text-transform: none; background: none; cursor: pointer; appearance: none; -webkit-tap-highlight-color: transparent; }
.w3b button:disabled { cursor: default; }
.w3b :focus { outline: none; }
.w3b :focus-visible { outline: 2px solid var(--w3b-ring); outline-offset: 0; }
.w3b i { display: block; flex-shrink: 0; border-radius: 9999px; }

.w3b .w3b-mono, .w3b .w3b-figure, .w3b .w3b-small, .w3b .w3b-tag, .w3b .w3b-axis, .w3b .w3b-badge { font-family: ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-muted { color: var(--w3b-muted-fg); }
.w3b .w3b-label { font-size: 12px; color: var(--w3b-muted-fg); }
.w3b .w3b-figure { font-size: 22px; font-weight: 600; }
.w3b .w3b-small { font-size: 11px; color: var(--w3b-muted-fg); }
.w3b .w3b-tag { font-size: 11px; color: var(--w3b-muted-fg); }
.w3b .w3b-badge { border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
.w3b .w3b-axis { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--w3b-muted-fg); }

/* barra de cima */
.w3b .w3b-nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 12px; padding: 0 4px; }
.w3b .w3b-nav__net { display: flex; align-items: center; gap: 8px; border: 1px solid var(--w3b-border); border-radius: 9999px; padding: 6px 12px; font-size: 12px; font-weight: 500; }
.w3b .w3b-nav__net i { width: 8px; height: 8px; }
.w3b .w3b-nav__account { border-radius: 9999px; background: var(--w3b-fg); padding: 6px 12px; font: 600 12px/1.5 ${F}; color: var(--w3b-bg); }

/* a grade: uma coluna, duas a partir de 640 px e quatro a partir de 1024 px, pela largura do painel */
.w3b .w3b-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 12px; }
@container w3b (min-width: 640px) {
  .w3b .w3b-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .w3b .w3b-hero, .w3b .w3b-chart, .w3b .w3b-blocks, .w3b .w3b-activity { grid-column: span 2 / span 2; }
}
@container w3b (min-width: 1024px) {
  .w3b .w3b-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .w3b .w3b-hero { grid-column: 1 / span 2; grid-row: 1; }
  .w3b .w3b-cards { grid-column: 3; grid-row: 1; }
  .w3b .w3b-gas { grid-column: 4; grid-row: 1; }
  .w3b .w3b-chart { grid-column: 1 / span 2; grid-row: 2 / span 2; }
  .w3b .w3b-alloc { grid-column: 3; grid-row: 2; }
  .w3b .w3b-stake { grid-column: 4; grid-row: 2 / span 2; }
  .w3b .w3b-lp { grid-column: 3; grid-row: 3; }
  .w3b .w3b-blocks { grid-column: 1 / span 2; grid-row: 4; }
  .w3b .w3b-activity { grid-column: 3 / span 2; grid-row: 4; }
}

/* os cart\xf5es do bento */
.w3b .w3b-tile { position: relative; display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid var(--w3b-border); border-radius: 26px; background: var(--w3b-card); padding: 20px; color: var(--w3b-fg); }
.w3b .w3b-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.w3b .w3b-head h3 { font-size: 13px; font-weight: 500; color: var(--w3b-muted-fg); }
.w3b .w3b-pills { display: inline-flex; border: 1px solid var(--w3b-border); border-radius: 9999px; padding: 2px; }
.w3b .w3b-pills button { border-radius: 9999px; padding: 4px 10px; font: 500 11px/1.5 ${F}; color: var(--w3b-muted-fg); transition: color .15s, background-color .15s; }
.w3b .w3b-pills button:hover { color: var(--w3b-fg); }
.w3b .w3b-pills button[aria-checked="true"] { background: var(--w3b-fg); color: var(--w3b-bg); }

/* abertura */
.w3b .w3b-hero__top { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 24px; }
.w3b .w3b-hero__hi { min-width: 0; }
.w3b .w3b-hero__gm { font-size: 28px; font-weight: 600; line-height: 1.1; letter-spacing: -.03em; }
.w3b .w3b-hero__sub { margin-top: 4px; font-size: 14px; line-height: 20px; color: var(--w3b-muted-fg); }
.w3b .w3b-hero__worth { text-align: right; }
.w3b .w3b-hero__value { font: 600 34px/1 ${F}; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.w3b .w3b-hero__change { margin-top: 6px; font: 12px/1.5 ${F}; font-variant-numeric: tabular-nums; }
@container w3b (min-width: 640px) {
  .w3b .w3b-hero__gm { font-size: 34px; }
  .w3b .w3b-hero__value { font-size: 40px; }
}
.w3b .w3b-hero__pnl { display: flex; flex: 1; flex-direction: column; margin-top: 24px; }
.w3b .w3b-bars { display: flex; flex: 1; align-items: flex-end; gap: 3px; min-height: 64px; }
.w3b .w3b-bar { position: relative; flex: 1; border-radius: 4px; }
.w3b .w3b-axis__now { color: var(--w3b-fg); }

/* a pilha de cart\xf5es */
.w3b .w3b-cards__well { position: relative; display: flex; flex: 1; flex-direction: column; justify-content: flex-end; overflow: hidden; margin: 0 -20px -20px; padding-top: 4px; }
.w3b .w3b-cards__stack { position: relative; }
.w3b .w3b-card { position: absolute; left: 50%; display: block; width: calc(100% - 32px); max-width: 300px; border-radius: 12px; text-align: left; transform-origin: top center; box-shadow: 0 -10px 28px -14px oklch(0 0 0 / 0.75); }
.w3b .w3b-card:focus-visible { outline-offset: 2px; }
.w3b .w3b-card__ratio { position: relative; display: block; width: 100%; padding-top: 63.08%; }
.w3b .w3b-card__fill { position: absolute; inset: 0; display: block; }
.w3b .w3b-face { position: absolute; inset: 0; overflow: hidden; border-radius: 12px; box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.5), inset 0 0 0 1px oklch(1 0 0 / 0.16); }
.w3b .w3b-holo { position: absolute; inset: 0; background-image: linear-gradient(115deg, transparent 18%, oklch(0.9 0.12 350 / 0.55) 32%, oklch(0.92 0.1 220 / 0.55) 42%, oklch(0.94 0.14 130 / 0.5) 52%, oklch(0.92 0.12 60 / 0.45) 62%, transparent 78%); background-size: 260% 100%; mix-blend-mode: soft-light; transition: background-position 700ms ${n}; }
.w3b .w3b-face__top { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 16px 0; }
.w3b .w3b-face__name { display: flex; align-items: center; gap: 10px; min-width: 0; }
.w3b .w3b-face__name > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 700; letter-spacing: -.025em; }
.w3b .w3b-face__last4 { flex-shrink: 0; font: 600 12px/1.5 ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-face__nfc { position: absolute; right: 16px; bottom: 14px; opacity: .7; }
.w3b .w3b-cards__spacer { visibility: hidden; flex-shrink: 0; width: calc(100% - 32px); max-width: 300px; margin-inline: auto; }
.w3b .w3b-cards__spacer > div { padding-top: 30%; }
.w3b .w3b-cards__panel { position: relative; z-index: 10; display: flex; flex-shrink: 0; align-items: flex-end; justify-content: space-between; gap: 12px; height: 88px; padding: 0 20px 16px; background: color-mix(in oklch, var(--w3b-card) 72%, transparent); -webkit-backdrop-filter: blur(18px) saturate(1.3); backdrop-filter: blur(18px) saturate(1.3); border-top: 1px solid color-mix(in oklch, var(--w3b-fg) 10%, transparent); }
.w3b .w3b-cards__info { min-width: 0; }
.w3b .w3b-cards__number, .w3b .w3b-cards__holder { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w3b .w3b-cards__number { font: 600 15px/1.5 ${F}; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.w3b .w3b-cards__holder { margin-top: 4px; font-size: 11px; color: var(--w3b-muted-fg); }
.w3b .w3b-cards__balance { flex-shrink: 0; font: 600 15px/1.5 ${F}; font-variant-numeric: tabular-nums; }

/* gas */
.w3b .w3b-gas__body { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; }
.w3b .w3b-gas__value { margin: 8px 0 4px; font: 600 26px/1 ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-gas__value span { font-size: 14px; color: var(--w3b-muted-fg); }
.w3b .w3b-gas__speed { display: flex; justify-content: center; margin-top: 16px; }

/* a carteira contra o ETH */
.w3b .w3b-chart__legend { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px 32px; }
.w3b .w3b-key { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--w3b-muted-fg); }
.w3b .w3b-key + .w3b-figure { margin-top: 4px; }
.w3b .w3b-key__line { width: 16px; height: 3px; border-radius: 9999px; }
.w3b .w3b-key__dash { width: 16px; height: 0; border-top: 2px dashed var(--w3b-muted-fg); }
.w3b .w3b-chart__lead { margin-left: auto; border-radius: 9999px; padding: 4px 10px; font: 600 11px/1.5 ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-chart__plot { position: relative; flex: 1; min-height: 220px; margin-top: 16px; touch-action: pan-y; }
.w3b .w3b-chart__plot svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.w3b .w3b-chart__cross { pointer-events: none; position: absolute; top: 0; bottom: 0; width: 1px; transform: translateX(-50%); background: var(--w3b-border); }
.w3b .w3b-chart__dot, .w3b .w3b-chart__dot2 { pointer-events: none; position: absolute; transform: translate(-50%, -50%); border-radius: 9999px; border-style: solid; border-color: var(--w3b-card); }
.w3b .w3b-chart__dot { width: 14px; height: 14px; border-width: 3px; }
.w3b .w3b-chart__dot2 { width: 10px; height: 10px; border-width: 2px; background: var(--w3b-muted-fg); }
.w3b .w3b-chart__axis { margin-top: 12px; }

/* aloca\xe7\xe3o */
.w3b .w3b-alloc__bar { display: flex; gap: 4px; height: 36px; margin-top: 16px; }
.w3b .w3b-alloc__bar span { border-radius: 8px; }
.w3b .w3b-alloc__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; margin-top: 16px; }
.w3b .w3b-alloc__list li { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; }
.w3b .w3b-alloc__name { display: flex; align-items: center; gap: 8px; }
.w3b .w3b-alloc__name i { width: 8px; height: 8px; }
.w3b .w3b-alloc__pct { font-family: ${F}; font-variant-numeric: tabular-nums; color: var(--w3b-muted-fg); }

/* staking */
.w3b .w3b-stake { position: relative; display: flex; flex-direction: column; min-width: 0; overflow: hidden; border-radius: 26px; padding: 20px; color: ${D}; }
.w3b .w3b-stake .w3b-mono { font-variant-numeric: tabular-nums; }
.w3b .w3b-stake__head { display: flex; align-items: center; justify-content: space-between; }
.w3b .w3b-stake__head h3 { font-size: 13px; font-weight: 600; opacity: .75; }
.w3b .w3b-stake__badge { display: flex; align-items: center; gap: 6px; border-radius: 9999px; padding: 2px 8px; background: oklch(0.24 0.06 135 / 0.12); font: 600 11px/1.5 ${F}; }
.w3b .w3b-stake__badge i { width: 6px; height: 6px; background: ${D}; }
.w3b .w3b-stake__apy { margin-top: 20px; font: 600 52px/1 ${F}; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
.w3b .w3b-stake__apy span { font-size: 22px; }
.w3b .w3b-stake__on { margin-top: 4px; font-size: 12px; font-weight: 500; opacity: .7; }
.w3b .w3b-stake__payout { margin-top: 20px; border-radius: 16px; padding: 12px; background: oklch(0.24 0.06 135 / 0.1); }
.w3b .w3b-stake__row { display: flex; align-items: baseline; justify-content: space-between; font-size: 12px; font-weight: 600; }
.w3b .w3b-dim { opacity: .7; }
.w3b .w3b-stake__track { height: 6px; margin-top: 8px; overflow: hidden; border-radius: 9999px; background: oklch(0.24 0.06 135 / 0.14); }
.w3b .w3b-stake__track div { height: 100%; border-radius: 9999px; background: ${D}; transition: width 1s linear; }
.w3b .w3b-stake__facts { margin-top: 12px; font-size: 12px; }
.w3b .w3b-stake__facts div { display: flex; justify-content: space-between; }
.w3b .w3b-stake__facts div + div { margin-top: 6px; }
.w3b .w3b-stake__facts dt { opacity: .7; }
.w3b .w3b-stake__facts dd { font-family: ${F}; font-weight: 600; font-variant-numeric: tabular-nums; }
.w3b .w3b-stake__foot { margin-top: auto; padding-top: 24px; }
.w3b .w3b-stake__label { font-size: 12px; font-weight: 600; opacity: .7; }
.w3b .w3b-stake__rewards { margin-top: 4px; font: 600 20px/1.5 ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-stake__rewards span { font-size: 13px; }
.w3b .w3b-stake__usd { font: 12px/1.5 ${F}; font-variant-numeric: tabular-nums; opacity: .7; }
.w3b .w3b-stake__epochs { display: flex; align-items: flex-end; gap: 4px; height: 48px; margin-top: 20px; }
.w3b .w3b-stake__epochs span { flex: 1; border-radius: 4px; background: ${D}; }
.w3b .w3b-stake__caption { margin-top: 6px; font: 10px/1.5 ${F}; opacity: .6; }
.w3b .w3b-stake__claim { width: 100%; margin-top: 16px; border-radius: 16px; padding: 12px 0; background: ${D}; font-size: 14px; font-weight: 600; line-height: 20px; transition: transform .15s; }
.w3b .w3b-stake__claim:active:not(:disabled) { transform: scale(.98); }
.w3b .w3b-stake__claim:disabled { opacity: .6; }
.w3b .w3b-stake__claim:focus-visible { outline-color: ${D}; outline-offset: 2px; }

/* liquidez */
.w3b .w3b-lp__range { position: relative; height: 40px; margin-top: 24px; }
.w3b .w3b-lp__line { position: absolute; left: 0; right: 0; top: 50%; height: 2px; transform: translateY(-50%); border-radius: 9999px; background: var(--w3b-muted); }
.w3b .w3b-lp__band { position: absolute; top: 50%; height: 40px; transform: translateY(-50%); border-radius: 10px; }
.w3b .w3b-lp__price { position: absolute; top: 50%; width: 3px; height: 56px; transform: translate(-50%, -50%); border-radius: 9999px; background: var(--w3b-fg); }
.w3b .w3b-lp__fees { margin-top: auto; padding-top: 16px; font-size: 12px; color: var(--w3b-muted-fg); }
.w3b .w3b-lp__fees b { font-family: ${F}; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--w3b-fg); }

/* blocos */
.w3b .w3b-blocks__top { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.w3b .w3b-blocks__bars { display: flex; flex: 1; align-items: flex-end; gap: 3px; min-height: 64px; margin-top: 16px; }
.w3b .w3b-blocks__bars span { flex: 1; border-radius: 3px; transform-origin: bottom; }
.w3b .w3b-pop { animation: w3b-pop 500ms cubic-bezier(.3,1.5,.6,1); }
.w3b .w3b-blocks__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; border-top: 1px solid var(--w3b-border); padding-top: 12px; }
.w3b .w3b-blocks__stats div { min-width: 0; }
.w3b .w3b-blocks__stats dt { font-size: 11px; color: var(--w3b-muted-fg); }
.w3b .w3b-blocks__stats dd { margin-top: 2px; font: 600 13px/1.5 ${F}; font-variant-numeric: tabular-nums; }
@keyframes w3b-pop { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }

/* atividade */
.w3b .w3b-activity__list { margin: -4px -8px; }
.w3b .w3b-activity__list li { display: flex; align-items: center; gap: 12px; border-radius: 16px; padding: 8px; }
.w3b .w3b-activity__list li:hover { background: color-mix(in oklch, var(--w3b-muted) 50%, transparent); }
.w3b .w3b-activity__icon { display: grid; flex-shrink: 0; place-items: center; width: 36px; height: 36px; border-radius: 12px; background: var(--w3b-muted); color: var(--w3b-fg); }
.w3b .w3b-activity__text { flex: 1; min-width: 0; }
.w3b .w3b-activity__title, .w3b .w3b-activity__detail { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w3b .w3b-activity__title { font-size: 13px; font-weight: 500; }
.w3b .w3b-activity__detail { font-size: 11px; color: var(--w3b-muted-fg); }
.w3b .w3b-activity__end { text-align: right; }
.w3b .w3b-activity__amount { font: 500 13px/1.5 ${F}; font-variant-numeric: tabular-nums; }
.w3b .w3b-activity__status { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 2px; font: 600 10px/1.5 ${F}; }
.w3b .w3b-spin { animation: w3b-spin 1s linear infinite; }
@keyframes w3b-spin { to { transform: rotate(360deg); } }
/* sem movimento: tudo aparece pronto (as transi\xe7\xf5es das barras, da aloca\xe7\xe3o e da atividade est\xe3o no style de cada uma) */
@media (prefers-reduced-motion: reduce) {
  .w3b, .w3b * { transition: none !important; animation: none !important; }
}
`;function H(){let e=function(){let[e,a]=t.useState(!1);return t.useEffect(()=>{let e=document.getElementById("geist-fonts");e||((e=document.createElement("link")).id="geist-fonts",e.rel="stylesheet",e.href="https://fonts.googleapis.com/css2?family=Geist:wght@200;300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap",document.head.appendChild(e));let t=()=>a(!0),i=()=>Promise.all(["400 1em Geist","600 1em Geist","600 1em 'Geist Mono'"].map(e=>document.fonts.load(e))).then(t,t);e.sheet?i():(e.addEventListener("load",i,{once:!0}),e.addEventListener("error",t,{once:!0}));let s=setTimeout(t,2e3);return()=>clearTimeout(s)},[]),e}();return(0,a.jsxs)("div",{className:"w3b-demo",children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:I}}),e&&(0,a.jsx)(A,{})]})}let I=`
.w3b-demo { box-sizing: border-box; display: flex; justify-content: center; align-items: flex-start; width: 100%; min-height: 100vh; min-height: 100svh; padding: 16px; background: oklch(0.145 0 0); }
@media (min-width: 640px) {
  .w3b-demo { padding: 32px; }
}
`;var R=e.i(771856);e.s(["default",0,function({mode:e}){return"tile"===e?(0,a.jsx)("div",{className:R.default.stage,"aria-hidden":"true",inert:!0,children:(0,a.jsx)(H,{})}):(0,a.jsx)("div",{className:R.default.stage,children:(0,a.jsx)(H,{})})}],543012)},201829,function(e){e.n(e.i(543012))}]);

//# debugId=7c071ef8-4337-a656-d853-be109cb792d1