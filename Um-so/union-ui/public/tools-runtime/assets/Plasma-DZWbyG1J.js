import{a as w,j as ne}from"./index-DrbxZl7q.js";const Me=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ae=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec2 uScale;
uniform float uZoom;
uniform float uTime;
uniform float uTwist;
uniform float uWave;
uniform float uSharpness;
uniform vec2 uOrbit;
uniform float uDither;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;
  vec3 rd = normalize(vec3(c, uView.y));
  vec3 ro = vec3(0.0, 0.0, -4.0);
  float cy = cos(uOrbit.x);
  float sy = sin(uOrbit.x);
  float cx = cos(uOrbit.y);
  float sx = sin(uOrbit.y);
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);
  ro = orbit * ro;
  rd = orbit * rd;
  float z = 0.0;
  float density = 0.0;
  float band = 0.0;
  for (int i = 0; i < 60; i++) {
    vec3 p = ro + rd * z;
    vec3 s = p;
    float d = p.y - uTime;
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;
    float stepLength = shell + 0.0008;
    z += stepLength;
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;
    density += weight;
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));
  }
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;
  outColor = vec4(encoded, 0.0, 1.0);
}`,_e=`#version 300 es
precision highp float;
uniform sampler2D uVolume;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform vec3 uInk;
uniform float uGain;
uniform float uShine;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec3 uHeat;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);
  encoded *= encoded;
  vec2 volume = encoded / (1.0 - encoded);
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);
  vec3 tint = mix(uColor, uHighlight, band * 0.35);
  vec3 hdr = tint * density + uHighlight * density * density * uShine;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  float level = 1.0 - exp(-peak);
  float hot = smoothstep(1.0, 3.0, peak);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  if (uLightMode > 0.5) {
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;
    outColor = vec4(color * alpha, alpha);
  } else {
    vec3 hue = hdr / max(peak, 0.0001);
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);
    color = pow(color, vec3(1.0 / 2.2));
    color = clamp(color + grain * level, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,Fe=1.6,ae=16e5,V=(i,y,d)=>Math.min(d,Math.max(y,i)),se=(i,y,d)=>{const m=i.createShader(y);return m?(i.shaderSource(m,d),i.compileShader(m),i.getShaderParameter(m,i.COMPILE_STATUS)?m:(i.deleteShader(m),null)):null},ce=(i,y)=>{const d=se(i,i.VERTEX_SHADER,Me),m=se(i,i.FRAGMENT_SHADER,y),l=i.createProgram();if(!d||!m||!l)return null;if(i.attachShader(l,d),i.attachShader(l,m),i.bindAttribLocation(l,0,"aPosition"),i.linkProgram(l),i.deleteShader(d),i.deleteShader(m),!i.getProgramParameter(l,i.LINK_STATUS))return i.deleteProgram(l),null;const F={},D=i.getProgramParameter(l,i.ACTIVE_UNIFORMS);for(let M=0;M<D;M++){const A=i.getActiveUniform(l,M);A&&(F[A.name]=i.getUniformLocation(l,A.name))}return{program:l,uniforms:F}},Se=({color:i="#a6a3b8",speed:y=1,direction:d="forward",scale:m=1,twist:l=1,wave:F=1,softness:D=.5,shine:M=1,brightness:A=1,grain:ue=.04,quality:le=.75,mouseInteractive:fe=!0,intro:me=!0,fade:he=0,opacity:de=1,lightMode:pe=!1,paused:ve=!1,dpr:ge,className:H="",...xe})=>{const q=w.useRef(null),N=w.useRef(null),_=w.useRef(null),z={color:String(i),speed:y,direction:d,scale:Math.max(.1,m),twist:l,wave:Math.max(0,F),softness:V(D,0,1),shine:Math.max(0,M),brightness:Math.max(0,A),grain:Math.max(0,ue),quality:V(le,.25,1),mouseInteractive:fe,intro:me,fade:V(he,0,1),opacity:V(de,0,1),lightMode:pe,paused:ve,dpr:ge},g=w.useRef(z);return g.current=z,w.useEffect(()=>{var ie;const p=q.current,h=N.current,e=h==null?void 0:h.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!p||!h||!e)return;const W=!!e.getExtension("EXT_color_buffer_float"),Y=ce(e,Ae),j=ce(e,_e);if(!Y||!j)return;const P={volume:Y,composite:j},Z=e.createBuffer(),O=e.createVertexArray();e.bindVertexArray(O),e.bindBuffer(e.ARRAY_BUFFER,Z),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const S=e.createTexture(),I=e.createFramebuffer(),x={width:0,height:0},ye=(t,r)=>{x.width===t&&x.height===r||(x.width=t,x.height=r,e.bindTexture(e.TEXTURE_2D,S),W?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t,r,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,I),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,S,0))},T=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),L=((ie=window.matchMedia)==null?void 0:ie.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,X=new Map,Ee=t=>{if(X.has(t))return X.get(t);let r=[1,1,1];if(T){T.clearRect(0,0,1,1),T.fillStyle="#ffffff",T.fillStyle=t,T.fillRect(0,0,1,1);const[n,a,s]=T.getImageData(0,0,1,1).data;r=[n,a,s].map(c=>Math.pow(c/255,2.2))}return X.set(t,r),r},u={width:1,height:1,volumeWidth:1,volumeHeight:1},f={x:0,y:0,inside:!1},o={clock:0,intro:g.current.intro&&!L?0:1,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,heat:0,heatX:0,heatY:0};let E=0,R=0,U=!0;const Te=t=>{const r=o.clock*.4;if(t.direction==="reverse")return-r;if(t.direction!=="pingpong")return r;const n=10,a=o.clock%n/n,s=a*a*(3-2*a);return(Math.floor(o.clock/n)%2===0?s:1-s)*n*.4},k=()=>{const t=g.current,r=o.intro*o.intro*(3-2*o.intro);e.bindVertexArray(O),ye(u.volumeWidth,u.volumeHeight);const n=P.volume,a=n.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,I),e.viewport(0,0,x.width,x.height),e.useProgram(n.program),e.uniform2f(a.uView,u.width,u.height),e.uniform2f(a.uScale,u.width/x.width,u.height/x.height),e.uniform1f(a.uZoom,t.scale),e.uniform1f(a.uTime,Te(t)+(1-r)*1.4),e.uniform1f(a.uTwist,t.twist),e.uniform1f(a.uWave,.4*t.wave),e.uniform1f(a.uSharpness,100-t.softness*90),e.uniform2f(a.uOrbit,o.yaw,o.pitch),e.uniform1f(a.uDither,W?0:1/255),e.drawArrays(e.TRIANGLES,0,3);const s=P.composite,c=s.uniforms,v=Ee(t.color),B=v.map(C=>C+(1-C)*.85),Re=.2126*v[0]+.7152*v[1]+.0722*v[2],be=Math.min(1,.16/Math.max(Re,.001)),we=v.map(C=>Math.pow(Math.min(1,C*be),1/2.2));e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,h.width,h.height),e.useProgram(s.program),e.uniform2f(c.uResolution,h.width,h.height),e.uniform3fv(c.uColor,v),e.uniform3fv(c.uHighlight,B),e.uniform3fv(c.uInk,we),e.uniform1f(c.uGain,4.8*t.brightness),e.uniform1f(c.uShine,.025*t.shine),e.uniform1f(c.uPresence,r),e.uniform1f(c.uGrain,t.grain),e.uniform1f(c.uFade,t.fade),e.uniform1f(c.uOpacity,t.opacity),e.uniform1f(c.uTime,o.clock%1e3),e.uniform1f(c.uLightMode,t.lightMode?1:0),e.uniform3f(c.uHeat,o.heatX*h.width/u.width,(u.height-o.heatY)*h.height/u.height,o.heat),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,S),e.uniform1i(c.uVolume,0),e.drawArrays(e.TRIANGLES,0,3)},Q=t=>{if(E=0,!U||document.hidden)return;const r=g.current,n=R?Math.min(.05,(t-R)/1e3):1/60;R=t;const a=!r.paused&&!L;a&&(o.clock+=n*r.speed),!r.intro||L?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Fe));const s=r.mouseInteractive&&f.inside&&!L,c=s?(f.x/u.width-.5)*.9:0,v=s?(f.y/u.height-.5)*.18:0;o.yawVelocity+=(40*(c-o.yaw)-11*o.yawVelocity)*n,o.pitchVelocity+=(40*(v-o.pitch)-11*o.pitchVelocity)*n,o.yaw+=o.yawVelocity*n,o.pitch+=o.pitchVelocity*n,o.heat+=((s?1:0)-o.heat)*(1-Math.exp(-n*(s?4:2))),o.heatX+=(f.x-o.heatX)*(1-Math.exp(-n*8)),o.heatY+=(f.y-o.heatY)*(1-Math.exp(-n*8)),k();const B=o.intro<1||Math.abs(c-o.yaw)>5e-4||Math.abs(o.yawVelocity)>5e-4||Math.abs(v-o.pitch)>5e-4||Math.abs(o.pitchVelocity)>5e-4||Math.abs((s?1:0)-o.heat)>.002;a||B?E=requestAnimationFrame(Q):R=0},b=()=>{!E&&U&&!document.hidden&&(E=requestAnimationFrame(Q))},G=()=>{const t=g.current,r=Math.max(1,p.clientWidth),n=Math.max(1,p.clientHeight),a=Math.min(t.dpr||window.devicePixelRatio||1,2);u.width=r,u.height=n,h.width=Math.max(1,Math.round(r*a)),h.height=Math.max(1,Math.round(n*a));let s=t.quality;r*n*s*s>ae&&(s=Math.sqrt(ae/(r*n))),u.volumeWidth=Math.max(1,Math.round(r*s)),u.volumeHeight=Math.max(1,Math.round(n*s)),E||k(),b()},$=t=>{const r=p.getBoundingClientRect();f.x=t.clientX-r.left,f.y=t.clientY-r.top,f.inside=f.x>=0&&f.y>=0&&f.x<=r.width&&f.y<=r.height,b()},K=()=>{f.inside=!1,b()},J=()=>{R=0,b()},ee=new ResizeObserver(G);ee.observe(p);const te=new IntersectionObserver(t=>{U=t.some(r=>r.isIntersecting),U&&(R=0,b())});te.observe(p),window.addEventListener("pointermove",$,{passive:!0}),document.documentElement.addEventListener("pointerleave",K),document.addEventListener("visibilitychange",J),G();let oe=g.current.quality,re=g.current.dpr;return _.current=()=>{const t=g.current;if(t.quality!==oe||t.dpr!==re){oe=t.quality,re=t.dpr,G();return}E||k(),b()},()=>{var t;cancelAnimationFrame(E),_.current=null,ee.disconnect(),te.disconnect(),window.removeEventListener("pointermove",$),document.documentElement.removeEventListener("pointerleave",K),document.removeEventListener("visibilitychange",J),e.deleteTexture(S),e.deleteFramebuffer(I),e.deleteProgram(P.volume.program),e.deleteProgram(P.composite.program),e.deleteBuffer(Z),e.deleteVertexArray(O),(t=e.getExtension("WEBGL_lose_context"))==null||t.loseContext()}},[]),w.useEffect(()=>{var p;(p=_.current)==null||p.call(_)}),ne.jsx("div",{ref:q,className:`plasma-container${H?` ${H}`:""}`,...xe,children:ne.jsx("canvas",{ref:N,className:"plasma-canvas","aria-hidden":"true"})})};export{Se as Plasma,Se as default};
