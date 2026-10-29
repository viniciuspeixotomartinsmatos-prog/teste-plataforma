import{a as u,j as H}from"./index-DrbxZl7q.js";import{t as n}from"./three-lB2Imsr2.js";const k=8,Y=`
#define MAX_COLORS ${k}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`,J=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;function ee({className:z,style:N,rotation:M=90,speed:v=.2,colors:P=[],transparent:i=!0,autoRotate:E=0,scale:p=1,frequency:d=1,warpStrength:h=1,mouseInfluence:w=1,parallax:C=.5,noise:g=.15,iterations:y=1,intensity:R=1.5,bandWidth:x=6}){const F=u.useRef(null),T=u.useRef(null),q=u.useRef(null),B=u.useRef(null),I=u.useRef(null),W=u.useRef(M),O=u.useRef(E),A=u.useRef(new n.Vector2(0,0)),_=u.useRef(new n.Vector2(0,0)),X=u.useRef(8);return u.useEffect(()=>{const e=F.current,a=new n.Scene,f=new n.OrthographicCamera(-1,1,1,-1,0,1),s=new n.PlaneGeometry(2,2),t=Array.from({length:k},()=>new n.Vector3(0,0,0)),r=new n.ShaderMaterial({vertexShader:J,fragmentShader:Y,uniforms:{uCanvas:{value:new n.Vector2(1,1)},uTime:{value:0},uSpeed:{value:v},uRot:{value:new n.Vector2(1,0)},uColorCount:{value:0},uColors:{value:t},uTransparent:{value:i?1:0},uScale:{value:p},uFrequency:{value:d},uWarpStrength:{value:h},uPointer:{value:new n.Vector2(0,0)},uMouseInfluence:{value:w},uParallax:{value:C},uNoise:{value:g},uIterations:{value:y},uIntensity:{value:R},uBandWidth:{value:x}},premultipliedAlpha:!0,transparent:!0});B.current=r;const l=new n.Mesh(s,r);a.add(l);const o=new n.WebGLRenderer({antialias:!1,powerPreference:"high-performance",alpha:!0});T.current=o,o.outputColorSpace=n.SRGBColorSpace,o.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),o.setClearColor(0,i?0:1),o.domElement.style.width="100%",o.domElement.style.height="100%",o.domElement.style.display="block",e.appendChild(o.domElement);const L=new n.Clock,S=()=>{const c=e.clientWidth||1,m=e.clientHeight||1;o.setSize(c,m,!1),r.uniforms.uCanvas.value.set(c,m)};if(S(),"ResizeObserver"in window){const c=new ResizeObserver(S);c.observe(e),I.current=c}else window.addEventListener("resize",S);const b=()=>{const c=L.getDelta(),m=L.elapsedTime;r.uniforms.uTime.value=m;const V=(W.current%360+O.current*m)*Math.PI/180,U=Math.cos(V),G=Math.sin(V);r.uniforms.uRot.value.set(U,G);const j=_.current,D=A.current,$=Math.min(1,c*X.current);j.lerp(D,$),r.uniforms.uPointer.value.copy(j),o.render(a,f),q.current=requestAnimationFrame(b)};return q.current=requestAnimationFrame(b),()=>{q.current!==null&&cancelAnimationFrame(q.current),I.current?I.current.disconnect():window.removeEventListener("resize",S),s.dispose(),r.dispose(),o.dispose(),o.forceContextLoss(),o.domElement&&o.domElement.parentElement===e&&e.removeChild(o.domElement)}},[x,d,R,y,w,g,C,p,v,i,h]),u.useEffect(()=>{const e=B.current,a=T.current;if(!e)return;W.current=M,O.current=E,e.uniforms.uSpeed.value=v,e.uniforms.uScale.value=p,e.uniforms.uFrequency.value=d,e.uniforms.uWarpStrength.value=h,e.uniforms.uMouseInfluence.value=w,e.uniforms.uParallax.value=C,e.uniforms.uNoise.value=g,e.uniforms.uIterations.value=y,e.uniforms.uIntensity.value=R,e.uniforms.uBandWidth.value=x;const f=t=>{const r=t.replace("#","").trim(),l=r.length===3?[parseInt(r[0]+r[0],16),parseInt(r[1]+r[1],16),parseInt(r[2]+r[2],16)]:[parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)];return new n.Vector3(l[0]/255,l[1]/255,l[2]/255)},s=(P||[]).filter(Boolean).slice(0,k).map(f);for(let t=0;t<k;t++){const r=e.uniforms.uColors.value[t];t<s.length?r.copy(s[t]):r.set(0,0,0)}e.uniforms.uColorCount.value=s.length,e.uniforms.uTransparent.value=i?1:0,a&&a.setClearColor(0,i?0:1)},[M,E,v,p,d,h,w,C,g,y,R,x,P,i]),u.useEffect(()=>{const e=B.current,a=F.current;if(!e||!a)return;const f=s=>{const t=a.getBoundingClientRect(),r=(s.clientX-t.left)/(t.width||1)*2-1,l=-((s.clientY-t.top)/(t.height||1)*2-1);A.current.set(r,l)};return a.addEventListener("pointermove",f),()=>{a.removeEventListener("pointermove",f)}},[]),H.jsx("div",{ref:F,className:`color-bends-container ${z}`,style:N})}export{ee as default};
