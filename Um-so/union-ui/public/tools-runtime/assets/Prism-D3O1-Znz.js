import{a as I,j as ie}from"./index-DrbxZl7q.js";const ye=1.4,D=64,_e=[.299,.587,.114,.299,.587,.114,.299,.587,.114],Pe=[.701,-.587,-.114,-.299,.413,-.114,-.3,-.588,.886],be=[.168,-.331,.5,.328,.035,-.5,-.497,.296,.201],Ae=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ue=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform mat3 uRay;
uniform float uGlow;
uniform vec2 uOffset;
uniform float uColorFreq;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform sampler2D uPalette;
uniform int uUsePalette;
uniform float uTime;
uniform float uNoise;
uniform float uSaturation;
uniform mat3 uHue;
uniform int uUseHue;
uniform float uLight;
uniform float uNeutral;
out vec4 outColor;

const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float pyramid(vec3 p) {
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);
}

vec3 grade(vec3 col, vec2 seed) {
  col += (rand(seed) - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);
  return col;
}

void main() {
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;
  vec3 origin = uRay * vec3(f, 0.0);
  vec3 axis = uRay[2];
  float z = 5.0;
  vec4 o = vec4(0.0);
  for (int i = 0; i < 100; i++) {
    vec3 p = origin + axis * z;
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));
    z -= d;
    float phase = (p.y + z) * uColorFreq;
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;
    o += band / d;
  }
  vec4 raw = o * o * uGlow / 1e5;
  vec4 e = exp(2.0 * raw);
  vec4 mapped = (e - 1.0) / (e + 1.0);
  vec2 seed = gl_FragCoord.xy + vec2(uTime);
  if (uLight > 0.5) {
    float peak = max(raw.r, max(raw.g, raw.b));
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);
    outColor = vec4(ink * cover, cover);
  } else {
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);
  }
}`,X=(n,l,m)=>Math.min(m,Math.max(l,n)),se=(n,l,m)=>{const o=n.createShader(l);return o?(n.shaderSource(o,m),n.compileShader(o),n.getShaderParameter(o,n.COMPILE_STATUS)?o:(n.deleteShader(o),null)):null},Ie=n=>{const l=se(n,n.VERTEX_SHADER,Ae),m=se(n,n.FRAGMENT_SHADER,Ue),o=n.createProgram();if(!l||!m||!o)return null;if(n.attachShader(o,l),n.attachShader(o,m),n.linkProgram(o),n.deleteShader(l),n.deleteShader(m),!n.getProgramParameter(o,n.LINK_STATUS))return n.deleteProgram(o),null;const i={},M=n.getProgramParameter(o,n.ACTIVE_UNIFORMS);for(let p=0;p<M;p++){const x=n.getActiveUniform(o,p);x&&(i[x.name]=n.getUniformLocation(o,x.name))}return{program:o,uniforms:i}},ce=(n,l,m)=>{const o=Math.cos(n),i=Math.sin(n),M=Math.cos(l),p=Math.sin(l),x=Math.cos(m),S=Math.sin(m);return[o*x+i*p*S,M*S,-i*x+o*p*S,-o*S+i*p*x,M*x,i*S+o*p*x,i*M,-p,o*M]},ue=(n,l)=>{const m=new Array(9);for(let o=0;o<3;o++)for(let i=0;i<3;i++)m[o*3+i]=n[i]*l[o*3]+n[3+i]*l[o*3+1]+n[6+i]*l[o*3+2];return m},He=({height:n=3.5,baseWidth:l=5.5,animationType:m="rotate",glow:o=1,offset:i,noise:M=0,scale:p=3.6,hueShift:x=0,colorFrequency:S=1,colors:k,saturation:le=1.5,timeScale:me=.5,interactive:he=!0,hoverStrength:fe=2,inertia:de=.05,intro:ve=!0,resolution:pe=.5,lightMode:xe=!1,dpr:Ee,className:W="",style:ge,...Me})=>{const j=I.useRef(null),Y=I.useRef(null),N=I.useRef(null),Te=Array.isArray(k)?k.filter(Boolean).slice(0,8):[],K={height:Math.max(.1,n),baseWidth:Math.max(.1,l),animationType:m==="rotate3d"?"3drotate":m,glow:Math.max(0,o),offsetX:(i==null?void 0:i.x)??0,offsetY:(i==null?void 0:i.y)??0,noise:Math.max(0,M),scale:Math.max(.1,p),hueShift:(x||0)*Math.PI/180,colorFrequency:Math.max(0,S),colors:Te,saturation:Math.max(0,le),timeScale:Math.max(0,me),interactive:he,hoverStrength:Math.max(0,fe),inertia:X(de,.001,1),intro:ve,resolution:X(pe,.25,1),lightMode:xe,dpr:Ee},P=I.useRef(K);return P.current=K,I.useEffect(()=>{var re;const g=j.current,h=Y.current,e=h==null?void 0:h.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!g||!h||!e)return;const F=Ie(e);if(!F)return;const s=F.uniforms,$=e.createVertexArray(),G=e.createTexture();e.bindTexture(e.TEXTURE_2D,G),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,D,1,0,e.RGBA,e.UNSIGNED_BYTE,null);const b=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),Re=t=>{if(!b)return[255,255,255];b.clearRect(0,0,1,1),b.fillStyle="#000000",b.fillStyle=String(t),b.fillRect(0,0,1,1);const[r,a,c]=b.getImageData(0,0,1,1).data;return[r,a,c]};let Z="",z=0;const Se=t=>{const r=t.join(",");if(r===Z||(Z=r,z=0,!t.length))return;const a=t.map(Re);z=1-a.reduce((u,[d,v,T])=>{const R=Math.max(d,v,T);return u+(R>0?(R-Math.min(d,v,T))/R:0)},0)/a.length;const c=new Uint8Array(D*4);for(let u=0;u<D;u++){const d=u/D*a.length,v=Math.floor(d),T=a[v%a.length],R=a[(v+1)%a.length],C=d-v,ae=C*C*(3-2*C);for(let _=0;_<3;_++)c[u*4+_]=Math.round(T[_]+(R[_]-T[_])*ae);c[u*4+3]=255}e.bindTexture(e.TEXTURE_2D,G),e.texSubImage2D(e.TEXTURE_2D,0,0,0,D,1,e.RGBA,e.UNSIGNED_BYTE,c)},H=((re=window.matchMedia)==null?void 0:re.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,E={width:1,height:1,scale:1},f={yaw:0,pitch:0,roll:0},w={x:0,y:0,inside:!1};let O=0,y=P.current.intro&&!H?0:1,L=0,A=0,q=!0;const we=t=>{const r=ce(f.yaw,f.pitch,f.roll);if(t.animationType==="rotate"){const a=O*t.timeScale,c=Math.cos(a),u=Math.cos(a+33),d=Math.cos(a+11);return ue(r,[c,0,d,0,1,0,u,0,c])}if(t.animationType==="3drotate"){const a=O*t.timeScale;return ue(r,ce(a*.55,Math.sin(a*.6+.6)*.6,Math.sin(a*.35+1.9)*.5))}return r},J=()=>{const t=P.current;Se(t.colors);const r=t.baseWidth*.5,a=y*y*(3-2*y),c=Math.cos(t.hueShift),u=Math.sin(t.hueShift);e.bindVertexArray($),e.viewport(0,0,h.width,h.height),e.useProgram(F.program),e.uniform2f(s.uResolution,h.width,h.height),e.uniformMatrix3fv(s.uRay,!1,we(t)),e.uniform1f(s.uGlow,t.glow*a*a),e.uniform2f(s.uOffset,t.offsetX*E.scale,-t.offsetY*E.scale),e.uniform1f(s.uColorFreq,t.colorFrequency),e.uniform1f(s.uCenterShift,t.height*.25),e.uniform1f(s.uInvBaseHalf,1/r),e.uniform1f(s.uInvHeight,1/t.height),e.uniform1f(s.uMinAxis,Math.min(r,t.height)),e.uniform1f(s.uPxScale,1/(h.height*.1*t.scale)),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,G),e.uniform1i(s.uPalette,0),e.uniform1i(s.uUsePalette,t.colors.length?1:0),e.uniform1f(s.uTime,O),e.uniform1f(s.uNoise,t.noise),e.uniform1f(s.uSaturation,t.saturation),e.uniformMatrix3fv(s.uHue,!1,_e.map((d,v)=>d+Pe[v]*c+be[v]*u)),e.uniform1i(s.uUseHue,Math.abs(t.hueShift)>1e-4?1:0),e.uniform1f(s.uLight,t.lightMode?1:0),e.uniform1f(s.uNeutral,z),e.drawArrays(e.TRIANGLES,0,3)},V=()=>{const t=P.current;E.width=Math.max(1,g.clientWidth),E.height=Math.max(1,g.clientHeight),E.scale=Math.min(t.dpr||window.devicePixelRatio||1,2)*t.resolution,h.width=Math.max(1,Math.round(E.width*E.scale)),h.height=Math.max(1,Math.round(E.height*E.scale)),J(),U()},Q=t=>{if(L=0,!q||document.hidden)return;const r=P.current;if(Math.round(E.width*Math.min(r.dpr||window.devicePixelRatio||1,2)*r.resolution)!==h.width){V();return}const a=A?X((t-A)/1e3,.001,.05):1/60;A=t,H||(O+=a),y<1&&(y=Math.min(1,y+a/ye));const c=r.animationType==="hover",u=w.inside&&!H&&(c||r.interactive),d=(c?.6:.09)*r.hoverStrength,v=u?-w.x*d:0,T=u?w.y*d:0,R=1-Math.pow(1-r.inertia,a*60);f.yaw+=(v-f.yaw)*R,f.pitch+=(T-f.pitch)*R,f.roll+=(0-f.roll)*(1-Math.pow(.9,a*60)),J();const C=Math.abs(v-f.yaw)+Math.abs(T-f.pitch)+Math.abs(f.roll)>1e-4;!H&&!c&&r.animationType!=="static"&&r.timeScale>0||C||y<1||!H&&r.noise>0?L=requestAnimationFrame(Q):A=0};function U(){!L&&q&&!document.hidden&&(L=requestAnimationFrame(Q))}const ee=t=>{const r=g.getBoundingClientRect(),a=(t.clientX-r.left)/Math.max(1,r.width)*2-1,c=(t.clientY-r.top)/Math.max(1,r.height)*2-1;w.inside=Math.abs(a)<=1&&Math.abs(c)<=1,w.x=X(a,-1,1),w.y=X(c,-1,1);const u=P.current;(u.interactive||u.animationType==="hover")&&U()},B=()=>{w.inside=!1,U()},te=()=>{A=0,U()},ne=new ResizeObserver(V);ne.observe(g);const oe=new IntersectionObserver(t=>{q=t.some(r=>r.isIntersecting),q&&(A=0,U())});return oe.observe(g),window.addEventListener("pointermove",ee,{passive:!0}),window.addEventListener("blur",B),document.documentElement.addEventListener("pointerleave",B),document.addEventListener("visibilitychange",te),V(),N.current=U,()=>{var t;cancelAnimationFrame(L),N.current=null,ne.disconnect(),oe.disconnect(),window.removeEventListener("pointermove",ee),window.removeEventListener("blur",B),document.documentElement.removeEventListener("pointerleave",B),document.removeEventListener("visibilitychange",te),e.deleteTexture(G),e.deleteVertexArray($),e.deleteProgram(F.program),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),I.useEffect(()=>{var g;(g=N.current)==null||g.call(N)}),ie.jsx("div",{ref:j,className:`prism${W?` ${W}`:""}`,style:ge,...Me,children:ie.jsx("canvas",{ref:Y,className:"prism-canvas","aria-hidden":"true"})})};export{He as default};
