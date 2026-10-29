import{a as K,j as ot}from"./index-DrbxZl7q.js";const rt="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",at="ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace",Dt=["#ffffff","#61dca3"],It=["#18181b","#0f9f6e"],Se=8,Ut=1.4,Xt=.2,kt=.1,Bt=48,Ot=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Gt=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
uniform sampler2D uState;
uniform ivec2 uCell;
uniform ivec2 uGrid;
uniform int uAtlasColumns;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform vec3 uBase;
uniform float uBaseOpacity;
uniform vec3 uColors[8];
uniform float uEdge;
uniform float uCenter;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uPresence;
uniform float uReveal;
uniform float uTime;
uniform float uFlow;
uniform float uFlowScale;
uniform vec4 uBackground;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;
  ivec2 q = ivec2(floor(frag));
  ivec2 cell = q / uCell;
  vec4 color = vec4(0.0);
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {
    vec4 state = texelFetch(uState, cell, 0);
    int glyph = int(state.r * 255.0 + 0.5);
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);
    float coverage = texelFetch(uAtlas, texel, 0).a;
    if (coverage > 0.0) {
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;
      float mask = 1.0;
      if (uEdge > 0.0) {
        vec2 edge = min(center, uResolution - center) / uEdge;
        mask = smoother(edge.x) * smoother(edge.y);
      }
      if (uCenter > 0.0) {
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);
        float soft = min(uResolution.x, uResolution.y) * 0.24;
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));
      }
      float seed = hash(vec2(cell) + 17.0);
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));
      if (uFlow > 0.0) {
        vec2 p = center / uFlowScale;
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);
      }
      if (uPresence > 0.0) {
        float d = length(center - uPointer) / uRadius;
        float f = clamp(1.0 - d * d, 0.0, 1.0);
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);
      }
      float heat = state.b;
      rest = min(rest, 1.0) * (1.0 - heat);
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];
      float weight = coverage * mask;
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);
    }
  }
  outColor = color + uBackground * (1.0 - color.a);
}`,S=(f,y,P)=>Math.min(P,Math.max(y,f)),Wt=f=>{const y=S(f,0,1);return y*y*y*(y*(y*6-15)+10)},st=(f,y,P)=>{const M=f.createShader(y);return M?(f.shaderSource(M,P),f.compileShader(M),f.getShaderParameter(M,f.COMPILE_STATUS)?M:(f.deleteShader(M),null)):null},Ht=f=>{const y=st(f,f.VERTEX_SHADER,Ot),P=st(f,f.FRAGMENT_SHADER,Gt),M=f.createProgram();if(!y||!P||!M)return null;if(f.attachShader(M,y),f.attachShader(M,P),f.linkProgram(M),f.deleteShader(y),f.deleteShader(P),!f.getProgramParameter(M,f.LINK_STATUS))return f.deleteProgram(M),null;const re={},xe=f.getProgramParameter(M,f.ACTIVE_UNIFORMS);for(let J=0;J<xe;J++){const ae=f.getActiveUniform(M,J);if(!ae)continue;const se=ae.name.replace(/\[0\]$/,"");re[se]=f.getUniformLocation(M,se)}return{program:M,uniforms:re}},Yt=({glitchColors:f,baseColor:y,characters:P=rt,fontFamily:M=at,fontSize:re=14,spacing:xe=.6,density:J=.9,baseOpacity:ae=.16,glitchAmount:se=.5,speed:ct=1,smooth:it=!0,interactive:lt=!0,cursorRadius:ut=140,clickEffect:ft="tear",flow:ht=.5,edgeFade:mt=0,centerFade:dt=0,intro:gt=!0,lightMode:_e=!1,backgroundColor:pt,dpr:Mt,className:Pe="",style:xt,...vt})=>{const Le=K.useRef(null),De=K.useRef(null),Z=K.useRef(null),Ie={colors:((Array.isArray(f)&&f.length?f:null)||(_e?It:Dt)).slice(0,Se),baseColor:y||(_e?"#18181b":"#ffffff"),characters:P||rt,fontFamily:M||at,fontSize:S(re,6,96),spacing:S(xe,0,2),density:S(J,0,1),baseOpacity:S(ae,0,1),glitchAmount:S(se,0,1),speed:Math.max(0,ct),smooth:it,interactive:lt,cursorRadius:Math.max(0,ut),clickEffect:ft,flow:S(ht,0,1),edgeFade:S(mt,0,.5),centerFade:S(dt,0,1),intro:gt,backgroundColor:pt,dpr:Mt},E=K.useRef(Ie);return E.current=Ie,K.useEffect(()=>{var tt,Me,nt;const L=Le.current,v=De.current,o=v==null?void 0:v.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!L||!v||!o)return;const ce=Ht(o);if(!ce)return;const d=ce.uniforms,Ue=o.createVertexArray(),Xe=()=>{const t=o.createTexture();return o.bindTexture(o.TEXTURE_2D,t),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),t},ve=Xe(),we=Xe(),wt=o.getParameter(o.MAX_TEXTURE_SIZE),ie=document.createElement("canvas"),D=ie.getContext("2d"),G=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});if(!D)return;const ke=new Map,ye=t=>{const n=String(t),e=ke.get(n);if(e)return e;let a=[1,1,1];if(G){G.clearRect(0,0,1,1),G.fillStyle="#ffffff",G.fillStyle=n,G.fillRect(0,0,1,1);const[i,s,l]=G.getImageData(0,0,1,1).data;a=[i/255,s/255,l/255]}return ke.set(n,a),a},X=((tt=window.matchMedia)==null?void 0:tt.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,x={width:1,height:1,ratio:1},r={cols:0,rows:0,cellW:0,cellH:0,originX:0,originY:0,atlasColumns:1},c={x:0,y:0,sx:0,sy:0,inside:!1,presence:0,stir:0,fresh:!0},k=[],le=new Float32Array(Se*3),Be=new Set;let Q=[0],ue="",Oe="",fe=1,A=0,w=new Uint8Array(0),W=new Float32Array(0),H=new Float32Array(0),U=new Float32Array(0),ee=new Float32Array(0),te=new Float32Array(0),N=new Float32Array(0),he=new Float32Array(0),Ee=new Float32Array(0),q=new Float32Array(0),B=new Int32Array(0),Y=new Int32Array(0),z=0,me=E.current.intro&&!X,Ge=0,We=0,Te=-1,Ae=0,Re=0,Ce=0,b=!0,ne=0,V=0,de=!0,He=!0;const oe=()=>Q[Math.random()*Q.length|0],O=()=>Math.random()*fe|0,be=(t,n=1)=>he[t]<E.current.density?Math.round(Ee[t]*255*n):0,ge=(t,n)=>{const e=Math.floor((t-r.originX)/r.cellW),a=Math.floor((n-r.originY)/r.cellH);return e<0||a<0||e>=r.cols||a>=r.rows?-1:a*r.cols+e},$=(t,n,e,a,i,s=0)=>{if(B[t]<0){B[t]=z,Y[z++]=t,W[t]=0,U[t]=e,H[t]=n,ee[t]=a,te[t]=0,N[t]=s,w[t*4+3]=i;return}W[t]<.15&&(w[t*4+3]=i),H[t]=U[t]>0?Math.max(H[t],n):n,U[t]=Math.max(U[t],e),ee[t]=Math.max(ee[t],a),N[t]=Math.min(N[t],s)},yt=t=>{const n=Y[t],e=Y[--z];Y[t]=e,B[e]=t,B[n]=-1,W[n]=0,w[n*4+2]=0},Et=()=>{var _;const t=E.current,n=t.fontSize*x.ratio,e=`${n}px ${t.fontFamily}`,a=Array.from(t.characters),i=Array.from(new Set(a)).slice(0,256);D.font=e;let s=1;i.forEach(F=>{s=Math.max(s,D.measureText(F).width)});const l=D.measureText("M"),g=Math.max(2,Math.ceil(s+n*t.spacing)),T=Math.max(2,Math.ceil(n*(.95+t.spacing))),u=Math.max(1,Math.min(i.length,Math.floor(wt/g)));ie.width=u*g,ie.height=Math.ceil(i.length/u)*T,D.font=e,D.textAlign="center",D.textBaseline="alphabetic",D.fillStyle="#ffffff";const m=T/2+(l.actualBoundingBoxAscent-l.actualBoundingBoxDescent)/2;i.forEach((F,j)=>{D.fillText(F,j%u*g+g/2,Math.floor(j/u)*T+m)}),o.bindTexture(o.TEXTURE_2D,ve),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,ie);const h=new Map(i.map((F,j)=>[F,j])),p=a.map(F=>h.get(F)).filter(F=>F!==void 0),R=p.length!==Q.length||p.some((F,j)=>F!==Q[j]);Q=p.length?p:[0];const C=g!==r.cellW||T!==r.cellH;return r.cellW=g,r.cellH=T,r.atlasColumns=u,!Be.has(e)&&((_=document.fonts)!=null&&_.load)&&(Be.add(e),document.fonts.load(e,t.characters).then(()=>{He&&(ue="",I())}).catch(()=>{})),{resized:C,charsChanged:R}},Tt=(t,n,e,a)=>{const i=(t+.5)/e-.5,s=(n+.5)/a-.5,l=Math.min(1,Math.hypot(i,s*.8)*1.6);return Ut*(.3*l+.7*Math.random()**1.3)},Ne=()=>{const t=Math.ceil(v.width/r.cellW)+1,n=Math.ceil(v.height/r.cellH)+1;if(r.originX=Math.floor((v.width-t*r.cellW)/2),r.originY=Math.floor((v.height-n*r.cellH)/2),t===r.cols&&n===r.rows)return;const e=t*n,a=new Uint8Array(e*4),i=new Float32Array(e),s=new Float32Array(e),l=new Float32Array(e),g=Math.floor((r.cols-t)/2),T=Math.floor((r.rows-n)/2);for(let u=0;u<n;u++)for(let m=0;m<t;m++){const h=u*t+m,p=m+g,R=u+T;if(p>=0&&R>=0&&p<r.cols&&R<r.rows){const C=R*r.cols+p;a[h*4]=w[C*4],a[h*4+1]=w[C*4+1],i[h]=he[C],s[h]=Ee[C],l[h]=q[C]}else a[h*4]=oe(),i[h]=Math.random(),s[h]=.55+.45*Math.random(),l[h]=me?Tt(m,u,t,n):-1}r.cols=t,r.rows=n,A=e,w=a,he=i,Ee=s,q=l,W=new Float32Array(e),H=new Float32Array(e),U=new Float32Array(e),ee=new Float32Array(e),te=new Float32Array(e),N=new Float32Array(e),B=new Int32Array(e).fill(-1),Y=new Int32Array(e),z=0,k.length=0;for(let u=0;u<e;u++)w[u*4+1]=q[u]>=0?0:be(u);Te=E.current.density,o.bindTexture(o.TEXTURE_2D,we),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,t,n,0,o.RGBA,o.UNSIGNED_BYTE,w),b=!1},qe=()=>{const t=E.current,n=`${t.fontSize*x.ratio}|${t.fontFamily}|${t.spacing}|${t.characters}`;if(n===ue)return;ue=n;const{resized:e,charsChanged:a}=Et();if((e||!r.cols)&&Ne(),a){for(let i=0;i<A;i++)w[i*4]=oe();b=!0}},At=()=>{const t=E.current,n=t.colors.join(",");if(n!==Oe){Oe=n,fe=Math.max(1,t.colors.length);for(let e=0;e<Se;e++){const a=ye(t.colors[Math.min(e,fe-1)]??"#ffffff");le[e*3]=a[0],le[e*3+1]=a[1],le[e*3+2]=a[2]}for(let e=0;e<A;e++)w[e*4+3]>=fe&&(w[e*4+3]=O());b=!0}},Fe=t=>{k.length<Bt&&k.push({carry:0,after:0,wiggle:0,branch:0,...t})},Rt=(t,n)=>{const e=ge(t,n);if(e<0)return;const a=Math.floor(e/r.cols),i=r.cols*r.cellW;for(let s=-2;s<=2;s++){const l=a+s;if(l<0||l>=r.rows)continue;const g=1-Math.abs(s)/3;if(s!==0&&Math.random()>.3+.6*g)continue;const T=O(),u=r.originY+(l+.5)*r.cellH,m=(Math.random()-.5)*6*r.cellW*(1-g);[0,Math.PI].forEach(h=>{const p=i*(.12+.5*g*(.4+.6*Math.random()));Fe({x:t+m,y:u,angle:h,life:p,span:p,speed:(2200+Math.random()*1200)*x.ratio,after:Math.abs(s)*.035+Math.random()*.03,color:T})})}},Ct=(t,n)=>{const e=Math.min(x.width,x.height)*x.ratio,a=5+(Math.random()*3|0),i=Math.random()*Math.PI*2;for(let s=0;s<a;s++){const l=e*(.25+Math.random()*.3);Fe({x:t,y:n,angle:i+s/a*Math.PI*2+(Math.random()-.5)*.4,life:l,span:l,speed:(700+Math.random()*400)*x.ratio,wiggle:.2,branch:.03,color:O()})}},bt=(t,n)=>{const e=ge(t,n);e<0||($(e,1,.08,.8,O()),E.current.clickEffect==="burst"?Ct(t,n):Rt(t,n))},Ft=t=>{for(let n=k.length-1;n>=0;n--){const e=k[n];if(e.after>0){e.after-=t;continue}const a=Math.max(1,Math.abs(Math.cos(e.angle))*r.cellW+Math.abs(Math.sin(e.angle))*r.cellH*.6);for(e.carry+=e.speed*t;e.carry>=a&&e.life>0;){e.carry-=a,e.life-=a,e.angle+=(Math.random()-.5)*e.wiggle,e.x+=Math.cos(e.angle)*a,e.y+=Math.sin(e.angle)*a;const i=ge(e.x,e.y);if(i<0){e.life=0;break}const s=e.life/e.span;if($(i,.5+.5*s,.03+Math.random()*.05,.5+.5*s,e.color),e.branch&&Math.random()<e.branch){const l=Math.random()<.5?-1:1,g=e.life*(.45+Math.random()*.3);Fe({x:e.x,y:e.y,angle:e.angle+l*(.5+Math.random()*.5),life:g,span:e.span,speed:e.speed,wiggle:e.wiggle,color:e.color})}}e.life<=0&&k.splice(n,1)}},St=t=>{const n=E.current;if(X||n.speed<=0||!A)return;Ae+=A*Xt*n.speed*t;let e=Math.min(A,Ae|0);for(Ae-=e;e-- >0;){const s=Math.random()*A|0;B[s]<0&&(w[s*4]=oe(),b=!0)}const a=Math.max(n.speed,.2);Re+=A*n.glitchAmount**1.6*kt*n.speed*t;let i=Math.min(A,Re|0);for(Re-=i;i-- >0;){const s=Math.random()*A|0,l=O(),g=.45+.55*Math.random(),T=(.04+Math.random()*.26)/a,u=(.45+Math.random()*.6)/a,m=Math.random();if(m<.24){const h=s%r.cols,p=m<.015,R=Math.min(r.cols-h,p?10+(Math.random()*24|0):2+(Math.random()*7|0)),C=(p?.012:.028)/a;for(let _=0;_<R;_++)$(s+_,g,T,u,l,_*C)}else $(s,g,T,u,l)}},_t=t=>{const n=E.current;if(c.presence<.02||X||!A)return;const e=n.cursorRadius*x.ratio;if(e<1)return;const a=Math.max(0,Math.floor((c.sx-e-r.originX)/r.cellW)),i=Math.min(r.cols-1,Math.floor((c.sx+e-r.originX)/r.cellW)),s=Math.max(0,Math.floor((c.sy-e-r.originY)/r.cellH)),l=Math.min(r.rows-1,Math.floor((c.sy+e-r.originY)/r.cellH)),g=c.presence*(3+9*c.stir)*t;for(let m=s;m<=l;m++){const h=(r.originY+(m+.5)*r.cellH-c.sy)/e;for(let p=a;p<=i;p++){const R=(r.originX+(p+.5)*r.cellW-c.sx)/e,C=R*R+h*h;if(C>=1)continue;const _=m*r.cols+p;B[_]<0&&Math.random()<(1-C)*(1-C)*g&&(w[_*4]=oe(),b=!0)}}const T=Math.PI*e*e/(r.cellW*r.cellH);Ce+=T*c.presence*(.15+4*c.stir)*t;let u=Math.min(512,Ce|0);for(Ce-=u;u-- >0;){const m=Math.random()*Math.PI*2,h=Math.sqrt(Math.random()),p=(1-h*h)**2;if(Math.random()>p)continue;const R=ge(c.sx+Math.cos(m)*h*e,c.sy+Math.sin(m)*h*e);R<0||$(R,(.3+.7*Math.random())*(.45+.55*c.stir),.02+Math.random()*.08,.35+Math.random()*.4,O())}},Pt=t=>{const n=E.current,e=Math.max(n.speed,.5),a=1-Math.exp(-t/.05);for(let i=0;i<z;){const s=Y[i];if(N[s]>0){N[s]-=t,i++;continue}let l=W[s];if(U[s]>0?(U[s]-=t,l=n.smooth?l+(H[s]-l)*a:H[s]):l=n.smooth?l*Math.exp(-t*4/Math.max(ee[s],.05)):0,l<.012&&U[s]<=0){yt(i),b=!0;continue}W[s]=l,te[s]-=t,te[s]<=0&&(w[s*4]=oe(),te[s]=(.045+.45*(1-l)*(1-l))*(.6+.8*Math.random())/e),w[s*4+2]=Math.round(l*255),b=!0,i++}},Lt=t=>{if(!me)return;const n=E.current;let e=!1;for(let a=0;a<A;a++){const i=q[a];if(i<0)continue;const s=Ge-i;if(s<0){e=!0;continue}s<t&&Math.random()<(he[a]<n.density?.45:.12)&&$(a,.4+.5*Math.random(),.02,.35+Math.random()*.35,O());const l=n.smooth?Wt(s/.35):1;w[a*4+1]=be(a,l),l>=1?q[a]=-1:e=!0}b=!0,e||(me=!1)},Ye=t=>{if(ne=0,!de||document.hidden)return;const n=E.current,e=V?S((t-V)/1e3,5e-4,.05):1/60;if(V=t,Ge+=e,X||(We+=e*n.speed),qe(),At(),n.density!==Te){Te=n.density;for(let u=0;u<A;u++)q[u]<0&&(w[u*4+1]=be(u));b=!0}const a=n.interactive&&c.inside&&!X?1:0;c.presence+=(a-c.presence)*(1-Math.exp(-e/.25)),Math.abs(a-c.presence)<.002&&(c.presence=a);const i=c.sx,s=c.sy,l=1-Math.exp(-e/.07);c.sx+=(c.x-c.sx)*l,c.sy+=(c.y-c.sy)*l;const g=Math.hypot(c.sx-i,c.sy-s)/x.ratio/e;if(c.stir+=(S(g/1400,0,1)-c.stir)*(1-Math.exp(-e/.12)),c.stir<.001&&(c.stir=0),Lt(e),St(e),_t(e),Ft(e),Pt(e),o.viewport(0,0,v.width,v.height),o.disable(o.BLEND),o.useProgram(ce.program),o.bindVertexArray(Ue),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,we),b&&(o.texSubImage2D(o.TEXTURE_2D,0,0,0,r.cols,r.rows,o.RGBA,o.UNSIGNED_BYTE,w),b=!1),o.uniform1i(d.uState,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,ve),o.uniform1i(d.uAtlas,0),o.uniform2i(d.uCell,r.cellW,r.cellH),o.uniform2i(d.uGrid,r.cols,r.rows),o.uniform1i(d.uAtlasColumns,r.atlasColumns),o.uniform2f(d.uResolution,v.width,v.height),o.uniform2f(d.uOrigin,r.originX,r.originY),o.uniform3fv(d.uBase,ye(n.baseColor)),o.uniform1f(d.uBaseOpacity,n.baseOpacity),o.uniform3fv(d.uColors,le),o.uniform1f(d.uEdge,n.edgeFade*Math.min(v.width,v.height)),o.uniform1f(d.uCenter,n.centerFade),o.uniform2f(d.uPointer,c.sx,c.sy),o.uniform1f(d.uRadius,Math.max(1,n.cursorRadius*x.ratio)),o.uniform1f(d.uPresence,c.presence),o.uniform1f(d.uReveal,Math.min(1,n.baseOpacity*3.5)),o.uniform1f(d.uTime,We),o.uniform1f(d.uFlow,n.flow),o.uniform1f(d.uFlowScale,Math.max(v.width,v.height)*.32),n.backgroundColor){const[u,m,h]=ye(n.backgroundColor);o.uniform4f(d.uBackground,u,m,h,1)}else o.uniform4f(d.uBackground,0,0,0,0);o.drawArrays(o.TRIANGLES,0,3),!X&&n.speed>0||z>0||k.length>0||me||c.presence!==0&&c.presence!==1||c.stir>0?ne=requestAnimationFrame(Ye):V=0};function I(){!ne&&de&&!document.hidden&&(ne=requestAnimationFrame(Ye))}const ze=()=>{const t=E.current;x.width=Math.max(1,L.clientWidth),x.height=Math.max(1,L.clientHeight),x.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),v.width=Math.max(1,Math.round(x.width*x.ratio)),v.height=Math.max(1,Math.round(x.height*x.ratio)),qe(),r.cols&&Ne(),I()},Ve=t=>{const n=L.getBoundingClientRect(),e=t.clientX-n.left,a=t.clientY-n.top;c.inside=e>=0&&a>=0&&e<=n.width&&a<=n.height,c.x=e*x.ratio,c.y=a*x.ratio,(c.fresh||c.presence<.02)&&(c.sx=c.x,c.sy=c.y,c.fresh=!1)},$e=t=>{Ve(t),I()},je=t=>{Ve(t);const n=E.current;!c.inside||n.clickEffect==="none"||X||!A||(bt(c.x,c.y),I())},pe=t=>{t.pointerType!=="mouse"&&(c.inside=!1)},Ke=()=>{c.inside=!1,I()},Je=()=>{V=0,I()},Ze=()=>{ue="",I()},Qe=new ResizeObserver(ze);Qe.observe(L);const et=new IntersectionObserver(t=>{de=t.some(n=>n.isIntersecting),de&&(V=0,I())});return et.observe(L),window.addEventListener("pointermove",$e,{passive:!0}),window.addEventListener("pointerdown",je,{passive:!0}),window.addEventListener("pointerup",pe,{passive:!0}),window.addEventListener("pointercancel",pe,{passive:!0}),document.documentElement.addEventListener("pointerleave",Ke),document.addEventListener("visibilitychange",Je),(nt=(Me=document.fonts)==null?void 0:Me.addEventListener)==null||nt.call(Me,"loadingdone",Ze),ze(),Z.current=I,()=>{var t,n,e;He=!1,cancelAnimationFrame(ne),Z.current=null,Qe.disconnect(),et.disconnect(),window.removeEventListener("pointermove",$e),window.removeEventListener("pointerdown",je),window.removeEventListener("pointerup",pe),window.removeEventListener("pointercancel",pe),document.documentElement.removeEventListener("pointerleave",Ke),document.removeEventListener("visibilitychange",Je),(n=(t=document.fonts)==null?void 0:t.removeEventListener)==null||n.call(t,"loadingdone",Ze),o.deleteTexture(ve),o.deleteTexture(we),o.deleteVertexArray(Ue),o.deleteProgram(ce.program),(e=o.getExtension("WEBGL_lose_context"))==null||e.loseContext()}},[]),K.useEffect(()=>{var L;(L=Z.current)==null||L.call(Z)}),ot.jsx("div",{ref:Le,className:`letter-glitch${Pe?` ${Pe}`:""}`,style:xt,...vt,children:ot.jsx("canvas",{ref:De,className:"letter-glitch-canvas","aria-hidden":"true"})})};export{Yt as default};
