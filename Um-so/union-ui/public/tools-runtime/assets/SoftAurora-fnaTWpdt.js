import{a as w,j as ie}from"./index-DrbxZl7q.js";const I=4,Ae=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Ce=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uFlow;
uniform float uHue;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform vec2 uShift;
uniform vec4 uCursor;
uniform vec4 uPulses[${I}];
uniform float uSpectrum;
uniform float uTilt;
uniform vec3 uIntro;
uniform float uLightMode;
uniform float uOpacity;
out vec4 fragColor;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x);
  float fy = floor(y);
  float fz = floor(pz);
  float cx = ceil(x);
  float cy = ceil(y);
  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 uv, float bend) {
  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);
}

vec2 turn(vec2 p, vec2 center) {
  float c = cos(uTilt);
  float s = sin(uTilt);
  vec2 d = p - center;
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
  vec2 cursor = turn(uCursor.xy, center);
  vec2 field = screen + uShift;
  float t = 0.4 * uFlow;

  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;
  float gap = cursor.y + uShift.y - uBandHeight;
  float near = exp(-gap * gap / 0.16);
  float bend = reach * gap * near * 0.55;

  float pulse = 0.0;
  for (int i = 0; i < ${I}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);
    pulse += wave.z * exp(-x * x);
  }
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;

  float glow1 = auroraGlow(t, field, bend) * boost;
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;
  col *= uBrightness;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float energy = max(col.r, max(col.g, col.b));
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);
    float top = max(average.r, max(average.g, average.b));
    float spread = top - min(average.r, min(average.g, average.b));
    float core = smoothstep(0.55, 1.6, energy);
    float depth = 1.25 + 0.45 * core;
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));
    density = clamp(density * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
  } else {
    float alpha = clamp(length(col), 0.0, 1.0);
    vec3 color = clamp(col, 0.0, 1.0);
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);
  }
}`,S=(t,a,i)=>Math.min(i,Math.max(a,t)),se=t=>{const a=String(t||"").trim(),i=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(a);if(i){const h=i[1].length===3?i[1].replace(/./g,m=>m+m):i[1];return[0,2,4].map(m=>parseInt(h.slice(m,m+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(a);return r?[r[1],r[2],r[3]].map(h=>S(parseFloat(h)/255,0,1)):null},le=(t,a,i)=>{const r=t.createShader(a);return r?(t.shaderSource(r,i),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)?r:(console.error(t.getShaderInfoLog(r)),t.deleteShader(r),null)):null},Re=t=>{const a=le(t,t.VERTEX_SHADER,Ae),i=le(t,t.FRAGMENT_SHADER,Ce),r=a&&i?t.createProgram():null;if(!a||!i||!r)return a&&t.deleteShader(a),i&&t.deleteShader(i),null;if(t.attachShader(r,a),t.attachShader(r,i),t.linkProgram(r),t.deleteShader(a),t.deleteShader(i),!t.getProgramParameter(r,t.LINK_STATUS))return console.error(t.getProgramInfoLog(r)),t.deleteProgram(r),null;const h={},m=t.getProgramParameter(r,t.ACTIVE_UNIFORMS);for(let L=0;L<m;L++){const A=t.getActiveUniform(r,L);A&&(h[A.name.replace(/\[0\]$/,"")]=t.getUniformLocation(r,A.name))}return{program:r,uniforms:h}},G=t=>{const a=S(t,0,1);return a*a*a*(a*(a*6-15)+10)},He=({speed:t=.6,scale:a=1.5,brightness:i=1,color1:r="#f7f7f7",color2:h="#e100ff",noiseFrequency:m=2.5,noiseAmplitude:L=1,bandHeight:A=.5,bandSpread:ue=1,octaveDecay:fe=.1,layerOffset:de=0,colorSpeed:me=1,spectrum:ve=1,tilt:pe=0,enableMouseInteraction:he=!0,mouseInfluence:xe=.25,clickPulse:ge=!0,intro:ye=!0,lightMode:we=!1,opacity:Se=1,className:k="",style:be})=>{const X=w.useRef(null),$=w.useRef(null),C=w.useRef(null),[j,ze]=w.useState(0),Y={speed:Math.max(0,t),scale:Math.max(.01,a),brightness:Math.max(0,i),color1:se(r)||[.969,.969,.969],color2:se(h)||[.882,0,1],noiseFrequency:Math.max(.01,m),noiseAmplitude:Math.max(0,L),bandHeight:A,bandSpread:Math.max(0,ue),octaveDecay:Math.max(0,fe),layerOffset:de,colorSpeed:me,spectrum:S(ve,0,1),tilt:S(pe,-90,90)*Math.PI/180,mouse:he,influence:Math.max(0,xe),clickPulse:ge,intro:ye,light:we,opacity:S(Se,0,1)},R=w.useRef(Y);return R.current=Y,w.useEffect(()=>{var x;(x=C.current)==null||x.call(C)}),w.useEffect(()=>{const x=X.current,s=$.current;if(!x||!s)return;const o=s.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),H=o?Re(o):null;if(!o||!H)return;const B=window.matchMedia("(prefers-reduced-motion: reduce)").matches,K=o.createVertexArray(),b={width:1,height:1},v={x:.5,y:.5,inside:!1},l={x:.5,y:.5,presence:0},p=[],z=new Float32Array(I*4);let W=0,J=0,M=R.current.intro&&!B&&j===0?0:1,y=0,O=0,_=!0,D=document.visibilityState!=="hidden",N=!1;const V=()=>{const n=R.current,e=x.getBoundingClientRect(),u=Math.max(1,e.width),P=Math.max(1,e.height),d=S(.35+.04*n.noiseFrequency*n.scale,.5,1),F=Math.max(1,Math.round(u*d)),E=Math.max(1,Math.round(P*d));(s.width!==F||s.height!==E)&&(s.width=F,s.height=E),b.width=u,b.height=P},Q=n=>{if(y=0,N)return;const e=R.current,u=S((n-O)/1e3||0,0,.05);O=Math.max(O,n);const P=B?.35:1;W+=u*e.speed*P,J+=u*e.speed*e.colorSpeed*P,M<1&&(M=Math.min(1,M+u/2));const d=e.mouse&&v.inside,F=1-Math.exp(-u/.325);l.x+=((d?v.x:.5)-l.x)*F,l.y+=((d?v.y:.5)-l.y)*F,l.presence+=((d?1:0)-l.presence)*(1-Math.exp(-u/(d?.45:.8)));for(let f=p.length-1;f>=0;f--)p[f].age+=u,p[f].age>=2.6&&p.splice(f,1);z.fill(0),p.forEach((f,q)=>{z[q*4]=f.x,z[q*4+1]=f.y,z[q*4+2]=G(f.age/.18)*(1-G((f.age-.18)/2.42)),z[q*4+3]=f.age});const E=1-Math.pow(1-M,3),Me=b.width/b.height,Ee=Math.min(1,e.influence*4)*l.presence;o.viewport(0,0,s.width,s.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(H.program),o.bindVertexArray(K);const c=H.uniforms;o.uniform2f(c.uResolution,s.width,s.height),o.uniform1f(c.uFlow,W),o.uniform1f(c.uHue,J),o.uniform1f(c.uScale,e.scale),o.uniform1f(c.uBrightness,e.brightness),o.uniform3f(c.uColor1,e.color1[0],e.color1[1],e.color1[2]),o.uniform3f(c.uColor2,e.color2[0],e.color2[1],e.color2[2]),o.uniform1f(c.uNoiseFreq,e.noiseFrequency),o.uniform1f(c.uNoiseAmp,e.noiseAmplitude),o.uniform1f(c.uBandHeight,e.bandHeight),o.uniform1f(c.uBandSpread,e.bandSpread),o.uniform1f(c.uOctaveDecay,e.octaveDecay),o.uniform1f(c.uLayerOffset,e.layerOffset),o.uniform2f(c.uShift,(l.x-.5)*e.influence*(e.mouse?1:0),(l.y-.5)*e.influence*(e.mouse?1:0)),o.uniform4f(c.uCursor,l.x*Me,l.y,Ee,0),o.uniform4fv(c.uPulses,z),o.uniform1f(c.uSpectrum,e.spectrum),o.uniform1f(c.uTilt,e.tilt),o.uniform3f(c.uIntro,G(M/.7),1+3*(1-E)*(1-E),.25+.75*E),o.uniform1f(c.uLightMode,e.light?1:0),o.uniform1f(c.uOpacity,e.opacity),o.drawArrays(o.TRIANGLES,0,3);const Le=Math.abs(l.x-(d?v.x:.5))>1e-4||Math.abs(l.y-(d?v.y:.5))>1e-4||Math.abs((d?1:0)-l.presence)>.001||p.length>0;(e.speed>0||M<1||Le)&&_&&D&&(y=requestAnimationFrame(Q))},g=()=>{y||N||!_||!D||(O=performance.now(),y=requestAnimationFrame(Q))};C.current=()=>{V(),g()};const Z=n=>{const e=x.getBoundingClientRect();return{x:(n.clientX-e.left)/Math.max(1,e.width),y:1-(n.clientY-e.top)/Math.max(1,e.height),inside:n.clientX>=e.left&&n.clientX<=e.right&&n.clientY>=e.top&&n.clientY<=e.bottom}},ee=n=>{const e=Z(n);v.x=e.x,v.y=e.y,v.inside=e.inside,g()},te=n=>{const e=R.current,u=Z(n);!u.inside||!e.clickPulse||B||(p.push({x:u.x*(b.width/b.height),y:u.y,age:0}),p.length>I&&p.shift(),g())},U=()=>{v.inside=!1,g()},T=n=>{n.pointerType!=="mouse"&&U()};window.addEventListener("pointermove",ee,{passive:!0}),window.addEventListener("pointerdown",te,{passive:!0}),window.addEventListener("pointerup",T,{passive:!0}),window.addEventListener("pointercancel",T,{passive:!0}),document.documentElement.addEventListener("pointerleave",U);const oe=n=>{n.preventDefault(),N=!0,cancelAnimationFrame(y),y=0},re=()=>ze(n=>n+1);s.addEventListener("webglcontextlost",oe),s.addEventListener("webglcontextrestored",re);const ne=new ResizeObserver(()=>{V(),g()});ne.observe(x);const ae=new IntersectionObserver(n=>{_=n.some(e=>e.isIntersecting),g()});ae.observe(x);const ce=()=>{D=document.visibilityState!=="hidden",g()};return document.addEventListener("visibilitychange",ce),V(),g(),()=>{cancelAnimationFrame(y),C.current=null,ne.disconnect(),ae.disconnect(),window.removeEventListener("pointermove",ee),window.removeEventListener("pointerdown",te),window.removeEventListener("pointerup",T),window.removeEventListener("pointercancel",T),document.documentElement.removeEventListener("pointerleave",U),document.removeEventListener("visibilitychange",ce),s.removeEventListener("webglcontextlost",oe),s.removeEventListener("webglcontextrestored",re),o.isContextLost()||(o.deleteVertexArray(K),o.deleteProgram(H.program))}},[j]),ie.jsx("div",{ref:X,className:`soft-aurora${k?` ${k}`:""}`,style:be,children:ie.jsx("canvas",{ref:$,className:"soft-aurora__canvas","aria-hidden":"true"})})};export{He as default};
