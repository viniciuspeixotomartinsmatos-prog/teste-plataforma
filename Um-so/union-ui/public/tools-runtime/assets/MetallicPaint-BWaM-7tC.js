import{a as C,j as ie}from"./index-DrbxZl7q.js";const me=512,z=2048,ne=2560*1600*2,fe=`#version 300 es
layout(location = 0) in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_scale;
uniform float u_rotation;
out vec2 v_imageUV;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 uv = a_position * 0.5;
  float r = u_rotation * 3.14159265358979323846 / 180.0;
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 imageBox;
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;
  imageBox.y = imageBox.x / u_imageAspect;
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;
  v_imageUV.x *= u_imageAspect;
  v_imageUV = turn * v_imageUV;
  v_imageUV.x /= u_imageAspect;
  v_imageUV += 0.5;
  v_imageUV.y = 1.0 - v_imageUV.y;
}`,ge=`#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_colorBack;
uniform vec4 u_colorTint;
uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;
uniform vec2 u_tilt;
uniform float u_reveal;
uniform float u_light;

in vec2 v_imageUV;

out vec4 fragColor;

#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));
  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  bump = smoothstep(0.2, 0.8, bump);
  border = w[0] + 0.4 * (1.0 - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + 0.5 * (1.0 - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  float gradientT = (stripe - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.0;
  frame *= smoothstep(0.0, th, uv.y);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);
  frame *= smoothstep(0.0, th, uv.x);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;
  float sum = 4.0 * centerSample;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;
  return sum / 16.0;
}

void main() {
  const float firstFrameOffset = 2.8;
  float t = 0.3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  float cycleWidth = u_repetition;

  vec2 rotatedUV = uv - vec2(0.5);
  float angle = (-u_angle + 70.0) * PI / 180.0;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);

  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);
  edge = pow(edge, 1.6);
  edge *= smoothstep(0.0, 0.4, u_contour);

  float opacity = img.g * getImgFrame(v_imageUV, 0.0);
  float depth = img.r;

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));

  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);
  float direction = gradUV.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1.0 - bump;
  bump *= pow(uv.y, 0.3);

  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;

  float noise = snoise(uv - t);
  edge += (1.0 - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));

  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);
  direction *= 0.1 + (1.1 - edge) * bump;
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);
  direction *= cycleWidth;
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));

  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);
  float dispersionRed = colorDispersion;
  dispersionRed += 0.03 * bump * noise;
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion * 1.3;
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));
  dispersionBlue -= 0.2 * edge;

  dispersionRed *= u_shiftRed / 20.0;
  dispersionBlue *= u_shiftBlue / 20.0;

  float softness = 0.05 * u_softness;
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));

  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);
  float stripeR = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);
  float stripeG = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);
  float stripeB = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);

  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);
  r *= sheen.r;
  g *= sheen.g;
  b *= sheen.b;

  float rim = smoothstep(0.78, 1.0, depth) * u_light;
  r *= 1.0 - rim * 0.62;
  g *= 1.0 - rim * 0.62;
  b *= 1.0 - rim * 0.58;

  float pour = u_reveal * 1.25 - 0.1;
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);

  vec3 color = vec3(r, g, b) * opacity;
  vec3 back = u_colorBack.rgb * u_colorBack.a;
  color += back * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);
  fragColor = vec4(color, opacity);
}`,E=(o,a,u)=>Math.min(u,Math.max(a,o)),se=(()=>{let o=null;return(a,u)=>{if(typeof document>"u"||(o??(o=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),!o))return u;o.clearRect(0,0,1,1),o.fillStyle="rgba(0, 0, 0, 0)",o.fillStyle=String(a),o.fillRect(0,0,1,1);const[s,c,f,g]=o.getImageData(0,0,1,1).data;return[s/255,c/255,f/255,g/255]}})(),he=o=>new Promise((a,u)=>{const s=new Image;s.crossOrigin="anonymous",s.onload=()=>a(s),s.onerror=()=>u(new Error("MetallicPaint: failed to load the image")),s.src=o}),ve=async o=>{if(/\.svg($|[?#])/i.test(o)||o.startsWith("data:image/svg+xml"))return!0;if(!o.startsWith("blob:"))return!1;try{return(await(await fetch(o)).blob()).type==="image/svg+xml"}catch{return!1}},pe=async o=>{const[a,u]=await Promise.all([he(o),ve(o)]);let s=a.naturalWidth||a.width||z,c=a.naturalHeight||a.height||z;const f=Math.max(s,c),g=u?z/f:E(1024/f,1,z/f);s=Math.max(1,Math.round(s*g)),c=Math.max(1,Math.round(c*g));const v=document.createElement("canvas");v.width=s,v.height=c;const _=v.getContext("2d",{willReadFrequently:!0});_.drawImage(a,0,0,s,c);const i=_.getImageData(0,0,s,c);let h=!0;for(let n=3;n<i.data.length;n+=4)if(i.data[n]<250){h=!1;break}if(h){for(let n=0;n<i.data.length;n+=4){const p=Math.min(i.data[n],i.data[n+1],i.data[n+2]);i.data[n+3]=Math.round(E((250-p)/30,0,1)*255)}_.putImageData(i,0,0)}return v},xe=async(o,a,u)=>{var T;const c=`${u} 320px ${a}`;try{await((T=document.fonts)==null?void 0:T.load(c,o))}catch{return null}const f=document.createElement("canvas").getContext("2d");f.font=c;const g=f.measureText(o),v=g.actualBoundingBoxAscent||320*.8,_=g.actualBoundingBoxDescent||320*.2,i=g.actualBoundingBoxLeft||0,h=g.actualBoundingBoxRight||g.width,n=320*.12,p=document.createElement("canvas");p.width=Math.ceil(i+h+n*2),p.height=Math.ceil(v+_+n*2);const R=p.getContext("2d");return R.font=c,R.fillStyle="#000",R.textBaseline="alphabetic",R.fillText(o,n+i,n+v),p},_e=(o,a,u)=>{const s=[];for(let i=0;i<u;i++)for(let h=0;h<a;h++){const n=i*a+h;if(!o[n])continue;h===0||i===0||h===a-1||i===u-1||!o[n-1]||!o[n+1]||!o[n-a]||!o[n+a]||!o[n-a-1]||!o[n-a+1]||!o[n+a-1]||!o[n+a+1]||s.push(n)}const c=new Float32Array(a*u),f=[],g=[];s.forEach(i=>(i%a+Math.floor(i/a))%2===0?f.push(i):g.push(i));const v=i=>{for(let h=0;h<i.length;h++){const n=i[h],p=c[n+1]+c[n-1]+c[n-a]+c[n+a];c[n]=1.9*((.01+p)/4)-.9*c[n]}};for(let i=0;i<40;i++)v(f),v(g);let _=0;return s.forEach(i=>{c[i]>_&&(_=c[i])}),{field:c,peak:_||1}},be=o=>{const a=o.width,u=o.height,s=me/Math.min(a,u),c=Math.max(2,Math.round(a*s)),f=Math.max(2,Math.round(u*s)),g=document.createElement("canvas");g.width=c,g.height=f;const v=g.getContext("2d",{willReadFrequently:!0});v.drawImage(o,0,0,c,f);const _=v.getImageData(0,0,c,f).data,i=new Uint8Array(c*f);for(let l=0;l<i.length;l++)i[l]=_[l*4+3]>0?1:0;const{field:h,peak:n}=_e(i,c,f),p=v.createImageData(c,f);for(let l=0;l<i.length;l++){const w=l*4,F=i[l]?255*(1-h[l]/n):255;p.data[w]=F,p.data[w+1]=F,p.data[w+2]=F,p.data[w+3]=i[l]?255:0}v.putImageData(p,0,0);const R=document.createElement("canvas");R.width=a,R.height=u;const T=R.getContext("2d",{willReadFrequently:!0});T.imageSmoothingEnabled=!0,T.imageSmoothingQuality="high",T.drawImage(g,0,0,c,f,0,0,a,u);const y=T.getImageData(0,0,a,u),O=o.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,a,u).data;for(let l=0;l<y.data.length;l+=4){const w=O[l+3];w===0?(y.data[l]=255,y.data[l+1]=0):(y.data[l]=y.data[l+3]===0?0:y.data[l],y.data[l+1]=w),y.data[l+2]=255,y.data[l+3]=255}return y},ce=(o,a,u)=>{const s=o.createShader(a);return s?(o.shaderSource(s,u),o.compileShader(s),o.getShaderParameter(s,o.COMPILE_STATUS)?s:(o.deleteShader(s),null)):null};function Ee({imageSrc:o,text:a,fontFamily:u="system-ui, sans-serif",fontWeight:s=800,color:c="#ffffff",backgroundColor:f="transparent",density:g=2,softness:v=.1,dispersion:_=.3,distortion:i=.07,edgeBend:h=.6,angle:n=70,speed:p=1,scale:R=.6,rotation:T=0,mouseTilt:y=.5,lightMode:O=!1,intro:l=!0,paused:w=!1,dpr:F,className:ue="",style:le}){const $=C.useRef(null),j=C.useRef(null),I=C.useRef(null),G=C.useRef(null);return G.current={tint:se(c,[1,1,1,1]),back:se(f,[0,0,0,0]),density:E(g,.5,12),softness:E(v,0,1),dispersion:E(_,-1,1),distortion:E(i,0,1),edgeBend:E(h,0,1),angle:n,speed:p,scale:Math.max(.05,R),rotation:T,mouseTilt:E(y,0,1.5),lightMode:O,intro:l,paused:w,dpr:F},C.useEffect(()=>{var re;const x=$.current,A=j.current;if(!x||!A)return;const e=A.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e)return;const X=ce(e,e.VERTEX_SHADER,fe),B=ce(e,e.FRAGMENT_SHADER,ge),b=e.createProgram();if(!X||!B||!b||(e.attachShader(b,X),e.attachShader(b,B),e.linkProgram(b),e.deleteShader(X),e.deleteShader(B),!e.getProgramParameter(b,e.LINK_STATUS)))return;e.useProgram(b);const m={},de=e.getProgramParameter(b,e.ACTIVE_UNIFORMS);for(let r=0;r<de;r++){const d=e.getActiveUniform(b,r);d&&(m[d.name]=e.getUniformLocation(b,d.name))}const k=e.createVertexArray(),H=e.createBuffer();e.bindVertexArray(k),e.bindBuffer(e.ARRAY_BUFFER,H),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const W=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,W),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([255,0,255,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.uniform1i(m.u_image,0);const K=((re=window.matchMedia)==null?void 0:re.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,t={raf:0,last:0,time:0,visible:!0,pending:!1,hasImage:!1,imageAspect:1,width:0,height:0,revealStart:-1,reveal:G.current.intro&&!K?0:1,tiltX:0,tiltY:0,velocityX:0,velocityY:0,targetX:0,targetY:0,alive:!0},q=()=>{const r=G.current,d=x.getBoundingClientRect(),V=r.dpr??Math.min(window.devicePixelRatio||1,2);let U=Math.max(V,2);const L=d.width*d.height*U*U;L>ne&&(U*=Math.sqrt(ne/L));const S=Math.max(1,Math.round(d.width*U)),D=Math.max(1,Math.round(d.height*U));S===t.width&&D===t.height||(t.width=S,t.height=D,A.width=S,A.height=D,e.viewport(0,0,S,D))},P=()=>{const r=G.current;if(t.pending||!t.hasImage){e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);return}e.useProgram(b),e.uniform2f(m.u_resolution,t.width,t.height),e.uniform1f(m.u_time,t.time),e.uniform1f(m.u_imageAspect,t.imageAspect),e.uniform1f(m.u_scale,r.scale),e.uniform1f(m.u_rotation,r.rotation),e.uniform4f(m.u_colorBack,r.back[0],r.back[1],r.back[2],r.back[3]),e.uniform4f(m.u_colorTint,r.tint[0],r.tint[1],r.tint[2],r.tint[3]),e.uniform1f(m.u_softness,r.softness),e.uniform1f(m.u_repetition,r.density),e.uniform1f(m.u_shiftRed,r.dispersion),e.uniform1f(m.u_shiftBlue,r.dispersion),e.uniform1f(m.u_distortion,r.distortion),e.uniform1f(m.u_contour,r.edgeBend),e.uniform1f(m.u_angle,r.angle),e.uniform2f(m.u_tilt,t.tiltX,t.tiltY),e.uniform1f(m.u_reveal,t.reveal),e.uniform1f(m.u_light,r.lightMode?1:0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.bindVertexArray(k),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Q=r=>{if(t.raf=0,!t.alive)return;const d=G.current,V=t.last?Math.min(.05,(r-t.last)/1e3):1/60;t.last=r;const U=!d.paused&&!K&&d.speed!==0;U&&(t.time+=V*d.speed);let L=U;if(t.reveal<1&&!t.pending){t.revealStart<0&&(t.revealStart=r);const N=E((r-t.revealStart)/1600,0,1);t.reveal=1-(1-N)**3,U&&(t.time+=V*2.4*(1-N)**2),L=!0}const S=60,D=14,ae=Math.max(1,Math.ceil(V/(1/240))),Y=V/ae;for(let N=0;N<ae;N++)t.velocityX+=(S*(t.targetX*d.mouseTilt-t.tiltX)-D*t.velocityX)*Y,t.velocityY+=(S*(t.targetY*d.mouseTilt-t.tiltY)-D*t.velocityY)*Y,t.tiltX+=t.velocityX*Y,t.tiltY+=t.velocityY*Y;(Math.abs(t.targetX*d.mouseTilt-t.tiltX)>5e-4||Math.abs(t.targetY*d.mouseTilt-t.tiltY)>5e-4||Math.abs(t.velocityX)+Math.abs(t.velocityY)>5e-4)&&(L=!0),P(),L&&t.visible?t.raf=requestAnimationFrame(Q):t.last=0},M=()=>{!t.raf&&t.alive&&t.visible&&(t.raf=requestAnimationFrame(Q))},Z=r=>{const d=x.getBoundingClientRect();t.targetX=E((r.clientX-d.left)/d.width*2-1,-1.2,1.2),t.targetY=E((r.clientY-d.top)/d.height*2-1,-1.2,1.2),M()},J=()=>{t.targetX=0,t.targetY=0,M()},ee=new ResizeObserver(()=>{q(),P()});ee.observe(x);const te=new IntersectionObserver(r=>{t.visible=r.some(d=>d.isIntersecting),t.visible&&M()});te.observe(x);const oe=r=>{r.preventDefault(),t.alive=!1,cancelAnimationFrame(t.raf)};return A.addEventListener("webglcontextlost",oe),x.addEventListener("pointermove",Z),x.addEventListener("pointerleave",J),I.current={setPending:r=>{t.pending=r,P()},setImage:r=>{t.pending=!1,e.bindTexture(e.TEXTURE_2D,W),r?(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),t.imageAspect=r.width/r.height,t.hasImage=!0):(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([255,0,255,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),t.imageAspect=1,t.hasImage=!1),P(),M()},wake:M,redraw:()=>{q(),P(),M()}},q(),P(),M(),()=>{t.alive=!1,cancelAnimationFrame(t.raf),ee.disconnect(),te.disconnect(),A.removeEventListener("webglcontextlost",oe),x.removeEventListener("pointermove",Z),x.removeEventListener("pointerleave",J),I.current=null,e.deleteTexture(W),e.deleteBuffer(H),e.deleteVertexArray(k),e.deleteProgram(b)}},[]),C.useEffect(()=>{var e,X;let x=!0;const A=a?xe(a,u,s):o?pe(o):null;if(!A){(e=I.current)==null||e.setImage(null);return}return(X=I.current)==null||X.setPending(!0),A.then(B=>{var m;if(!x||!B)return;const b=be(B);x&&((m=I.current)==null||m.setImage(b))}).catch(()=>{var B;x&&((B=I.current)==null||B.setImage(null))}),()=>{x=!1}},[o,a,u,s]),C.useEffect(()=>{var x;(x=I.current)==null||x.redraw()}),ie.jsx("div",{ref:$,className:`metallic-paint ${ue}`.trim(),style:le,children:ie.jsx("canvas",{ref:j,className:"metallic-paint-canvas"})})}export{Ee as default};
