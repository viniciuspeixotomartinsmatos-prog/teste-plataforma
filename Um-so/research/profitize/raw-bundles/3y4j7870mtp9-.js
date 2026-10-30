;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="7e5a3e44-a83d-837b-35c5-e75a5c0efa9c")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,800884,e=>{"use strict";let o;var a=e.i(843476),t=e.i(770703),s=e.i(271645),i=e.i(926726),r=e.i(193344);let l=`#version 300 es
precision lowp float;

uniform mediump float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[7];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;
uniform float u_shape;

uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

in vec2 v_objectUV;
in vec2 v_patternUV;
in vec2 v_objectBoxSize;
in vec2 v_patternBoxSize;

out vec4 fragColor;

${r.declarePI}
${r.simplexNoise}
${r.rotation2}
${r.textureRandomizerR}

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
vec4 fbmR(vec2 n0, vec2 n1, vec2 n2, vec2 n3) {
  float amplitude = 0.2;
  vec4 total = vec4(0.);
  for (int i = 0; i < 3; i++) {
    n0 = rotate(n0, 0.3);
    n1 = rotate(n1, 0.3);
    n2 = rotate(n2, 0.3);
    n3 = rotate(n3, 0.3);
    total.x += valueNoiseR(n0) * amplitude;
    total.y += valueNoiseR(n1) * amplitude;
    total.z += valueNoiseR(n2) * amplitude;
    total.z += valueNoiseR(n3) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    n2 *= 1.99;
    n3 *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

${r.proceduralHash11}

vec2 truchet(vec2 uv, float idx){
  idx = fract(((idx - .5) * 2.));
  if (idx > 0.75) {
    uv = vec2(1.0) - uv;
  } else if (idx > 0.5) {
    uv = vec2(1.0 - uv.x, uv.y);
  } else if (idx > 0.25) {
    uv = 1.0 - vec2(1.0 - uv.x, uv.y);
  }
  return uv;
}

void main() {

  const float firstFrameOffset = 7.;
  float t = .1 * (u_time + firstFrameOffset);

  vec2 shape_uv = vec2(0.);
  vec2 grain_uv = vec2(0.);

  float r = u_rotation * PI / 180.;
  float cr = cos(r);
  float sr = sin(r);
  mat2 graphicRotation = mat2(cr, sr, -sr, cr);
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  if (u_shape > 3.5) {
    shape_uv = v_objectUV;
    grain_uv = shape_uv;

    // apply inverse transform to grain_uv so it respects the originXY
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u_scale;
    grain_uv -= graphicOffset;
    grain_uv *= v_objectBoxSize;
    grain_uv *= .7;
  } else {
    shape_uv = .5 * v_patternUV;
    grain_uv = 100. * v_patternUV;

    // apply inverse transform to grain_uv so it respects the originXY
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u_scale;
    if (u_fit > 0.) {
      vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
      givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
      float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
      vec2 patternBoxGivenSize = vec2(
      (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
      (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
      );
      patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
      float patternBoxNoFitBoxWidth = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
      grain_uv /= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
    }
    vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
    grain_uv -= graphicOffset / patternBoxScale;
    grain_uv *= 1.6;
  }


  float shape = 0.;

  if (u_shape < 1.5) {
    // Sine wave

    float wave = cos(.5 * shape_uv.x - 4. * t) * sin(1.5 * shape_uv.x + 2. * t) * (.75 + .25 * cos(6. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 2.5) {
    // Grid (dots)

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx * 100.);
    rand = sign(rand - .5) * pow(4. * abs(rand), .3);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(abs(shape), 4.);

  } else if (u_shape < 3.5) {
    // Truchet pattern

    float n2 = valueNoiseR(shape_uv * .4 - 3.75 * t);
    shape_uv.x += 10.;
    shape_uv *= .6;

    vec2 tile = truchet(fract(shape_uv), randomR(floor(shape_uv)));

    float distance1 = length(tile);
    float distance2 = length(tile - vec2(1.));

    n2 -= .5;
    n2 *= .1;
    shape = smoothstep(.2, .55, distance1 + n2) * (1. - smoothstep(.45, .8, distance1 - n2));
    shape += smoothstep(.2, .55, distance2 + n2) * (1. - smoothstep(.45, .8, distance2 - n2));

    shape = pow(shape, 1.5);

  } else if (u_shape < 4.5) {
    // Corners

    shape_uv *= .6;
    vec2 outer = vec2(.5);

    vec2 bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * sin(5.25 * t)));
    vec2 tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape = 1. - bl.x * bl.y * tr.x * tr.y;

    shape_uv = -shape_uv;
    bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * cos(5.25 * t)));
    tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape -= bl.x * bl.y * tr.x * tr.y;

    shape = 1. - smoothstep(0., 1., shape);

  } else if (u_shape < 5.5) {
    // Ripple

    shape_uv *= 2.;
    float dist = length(.4 * shape_uv);
    float waves = sin(pow(dist, 1.2) * 5. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Blob

    t *= 2.;

    vec2 f1_traj = .25 * vec2(1.3 * sin(t), .2 + 1.3 * cos(.6 * t + 4.));
    vec2 f2_traj = .2 * vec2(1.2 * sin(-t), 1.3 * sin(1.6 * t));
    vec2 f3_traj = .25 * vec2(1.7 * cos(-.6 * t), cos(-1.6 * t));
    vec2 f4_traj = .3 * vec2(1.4 * cos(.8 * t), 1.2 * sin(-.6 * t - 3.));

    shape = .5 * pow(1. - clamp(0., 1., length(shape_uv + f1_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f2_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f3_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f4_traj)), 5.);

    shape = smoothstep(.0, .9, shape);
    float edge = smoothstep(.25, .3, shape);
    shape = mix(.0, shape, edge);

  } else {
    // Sphere

    shape_uv *= 2.;
    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(max(d, 0.)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }

  float baseNoise = snoise(grain_uv * .5);
  vec4 fbmVals = fbmR(
  .002 * grain_uv + 10.,
  .003 * grain_uv,
  .001 * grain_uv,
  rotate(.4 * grain_uv, 2.)
  );
  float grainDist = baseNoise * snoise(grain_uv * .2) - fbmVals.x - fbmVals.y;
  float rawNoise = .75 * baseNoise - fbmVals.w - fbmVals.z;
  float noise = clamp(rawNoise, 0., 1.);

  shape += u_intensity * 2. / u_colorsCount * (grainDist + .5);
  shape += u_noise * 10. / u_colorsCount * noise;

  float aa = fwidth(shape);

  shape = clamp(shape - .5 / u_colorsCount, 0., 1.);
  float totalShape = smoothstep(0., u_softness + 2. * aa, clamp(shape * u_colorsCount, 0., 1.));
  float mixer = shape * (u_colorsCount - 1.);

  int cntStop = int(u_colorsCount) - 1;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < 7; i++) {
    if (i > cntStop) break;

    float localT = clamp(mixer - float(i - 1), 0., 1.);
    localT = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, localT);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  fragColor = vec4(color, opacity);
}
`,c={wave:1,dots:2,truchet:3,corners:4,ripple:5,blob:6,sphere:7};var n=e.i(221449),m=e.i(131967),p=e.i(210270);let d=e=>({u_fit:m.ShaderFitOptions[e.fit??"contain"],u_scale:e.scale??1,u_rotation:e.rotation??0,u_offsetX:e.offsetX??0,u_offsetY:e.offsetY??0}),u=["float baseNoise = snoise(grain_uv * .5);","fragColor = vec4(color, opacity);","uniform float u_noise;"],f=u.every(e=>l.includes(e))?l.replace(u[2],`${u[2]}
uniform float u_grainSpread;`).replace(u[0],`float shape0 = shape;
  ${u[0]}`).replace(u[1],`color = mix(bgColor, color, mix(smoothstep(0., 0.3, shape0), 1., u_grainSpread));
  ${u[1]}`):(console.warn("grain-gradient: o shader da Paper mudou, grainSpread não se aplica"),l);function A({options:e,className:t,children:r,id:l}){let m=(0,s.useRef)(null);return(0,s.useEffect)(()=>{var a;let t,s,r,l,u,A,h,x,v,g;return a=m.current,l=!0,u=!1,A=!1,h=()=>{let o=a.getBoundingClientRect(),s=o.height>o.width;t&&s!==r&&(r=s,t.setUniforms(d(r&&e.portrait?{...e,...e.portrait}:e)))},x=()=>{l&&s&&u&&!t&&!A&&(r=void 0,A=!(t=function(e,o,a){try{return new i.ShaderMount(e,f,{u_colorBack:(0,n.getShaderColorFromString)(o.colorBack??"#000000"),u_colors:o.colors.slice(0,7).map(e=>(0,n.getShaderColorFromString)(e)),u_colorsCount:Math.min(o.colors.length,7),u_softness:o.softness??.5,u_intensity:o.intensity??.5,u_noise:o.noise??.25,u_grainSpread:o.grainSpread??1,u_shape:c[o.shape??"corners"],u_noiseTexture:a,...d(o),u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0},void 0,matchMedia("(prefers-reduced-motion: reduce)").matches?0:o.speed??1,o.frame??0)}catch{e.classList.add("no-gl")}}(a,e,s)),h(),t&&(0,p.onContextLost)(t.canvasElement,()=>{if(!l||!t)return;let e=t;t=void 0,(0,p.disposeMount)(e),x()}))},(v=new IntersectionObserver(([e])=>{u=e.isIntersecting,x()},{rootMargin:"400px"})).observe(a),g=new ResizeObserver(h),(o??=(async()=>{let e=function(){if("u"<typeof window)return;let e=new Image;return e.src="data:image/png;base64,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",e}();return await e.decode(),e})()).then(e=>{l&&(s=e,x(),g.observe(a))}).catch(console.error),()=>{l=!1,g.disconnect(),v.disconnect();let e=t;t=void 0,e&&(0,p.disposeMount)(e),a.classList.remove("no-gl")}},[e]),(0,a.jsx)("div",{ref:m,className:t,id:l,children:r})}var h=e.i(456709);let x={flue:(0,t.default)(()=>e.A(858653).then(e=>e.Flue),{loadableGenerated:{modules:[515005]},ssr:!1}),cromo:(0,t.default)(()=>e.A(623571).then(e=>e.CromoStage),{loadableGenerated:{modules:[229740]},ssr:!1})};e.s(["LiveShader",0,function({spec:e,className:o,children:t}){if("grain"in e)return(0,a.jsx)(A,{options:e.grain,className:o,children:t});if("custom"in e){let s=x[e.custom];return(0,a.jsx)(s,{className:o,children:t})}return(0,a.jsx)(h.ShaderStage,{kind:e.canvas,dpr:e.dpr,fps:e.fps,lights:e.lights,className:o,children:t})}],800884)},456709,e=>{"use strict";var o=e.i(843476),a=e.i(271645),t=e.i(22707);let s=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,i=`#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform float u_dpr;
uniform vec2 u_center;
out vec4 o;

// paleta de luz: quente, clara, fria, funda (trocada pelo painel)
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
#define CORAL u_c1
#define GELO u_c2
#define ANIL u_c3
#define ABISMO u_c4
#define CORAL2 mix(u_c1, u_c4, 0.16)

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
// gr\xe3o fixo na tela, um valor por pixel (hash inteiro: o de cima repete padr\xf5es em coordenadas grandes)
float grain(vec2 p) {
  uvec2 q = uvec2(ivec2(p) + 4096);
  uint h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = (h ^ (h >> 16u)) * 0x45d9f3bu;
  h ^= h >> 16u;
  return float(h) / 4294967295.0;
}
`,r=i+`
vec3 aurora(vec2 p, vec2 m, float t) {
  // s\xf3 ondas de baixa frequ\xeancia: a curva fica lisa, sem as cristas do fbm
  float dip = exp(-p.x * p.x * 0.9);
  float curve = 0.1 - 0.95 * dip
    + 0.09 * sin(p.x * 0.8 + t * 3.0)
    + 0.05 * sin(p.x * 1.5 - t * 2.2 + 1.3)
    + 0.03 * sin(p.x * 2.3 + t * 1.6 + 4.1);
  float md = exp(-pow(length(vec2(p.x - m.x, (p.y - m.y) * 0.5)), 2.0) * 2.2);
  curve -= 0.32 * md * u_hover;

  float d = p.y - curve;
  d += 0.04 * sin(p.x * 1.1 + p.y * 0.7 + t * 2.4);
  float s = -d;

  vec3 col = CORAL * smoothstep(0.55, 0.0, max(d, 0.0)) * 0.32;
  float b = max(s, 0.0);
  vec3 band = mix(CORAL, GELO, smoothstep(0.0, 0.34, b));
  band = mix(band, ANIL, smoothstep(0.26, 0.66, b));
  band = mix(band, ABISMO, smoothstep(0.62, 1.15, b));
  band = mix(band, vec3(0.0), smoothstep(1.05, 1.75, b));
  return mix(col, band, smoothstep(-0.04, 0.16, s));
}

void main() {
  float asp = u_res.x / u_res.y;
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5) * 2.0;
  vec2 m = vec2((u_mouse.x - 0.5) * asp, u_mouse.y - 0.5) * 2.0;
  float t = u_time * 0.05;

  vec3 col = aurora(p, m, t);
  // a c\xf3pia de cima s\xf3 aparece quando a tela fica mais alta que larga; no desktop o peso \xe9 zero
  float top = smoothstep(1.05, 0.6, asp) * 0.6;
  if (top > 0.0) {
    vec3 up = aurora(vec2(-p.x, -p.y), vec2(-m.x, -m.y), t + 7.0) * top;
    col = 1.0 - (1.0 - col) * (1.0 - up); // soma como luz (screen)
  }

  col *= smoothstep(2.3, 0.5, length(p * vec2(0.5, 0.85)));
  col *= 0.92;
  o = vec4(col, 1.0);
}`,l=i+`
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.07;

  float ang = 1.05 + m.x * 0.35 * u_hover + 0.04 * sin(t * 3.0);
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 nrm = vec2(-dir.y, dir.x);
  vec2 q = p - vec2(0.12 + m.x * 0.2 * u_hover, 0.0);
  float across = dot(q, nrm);
  float along = dot(q, dir);

  float width = 0.09 + 0.07 * fbm(vec2(along * 1.4 - t * 2.0, t));
  float w = across > 0.0 ? width * 1.7 : width * 0.45;
  float beam = exp(-pow(across / w, 2.0));
  beam *= smoothstep(-0.95, 0.35, along);
  float mist = fbm(p * 2.2 + vec2(t * 2.0, -t));
  beam *= 0.55 + 0.7 * mist;

  vec3 col = mix(vec3(0.012, 0.013, 0.02), GELO, clamp(beam, 0.0, 1.0));
  col += ANIL * 0.18 * beam * smoothstep(0.0, 0.25, -across);
  col += CORAL * 0.08 * beam * smoothstep(0.0, 0.25, across);
  col *= smoothstep(1.4, 0.3, length(p * vec2(0.6, 1.0)));
  o = vec4(col, 1.0);
}`,c=i+`
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  p -= u_center;
  float R = 0.33;
  float N = 15.0;
  float band = floor((p.y + 0.5) * N);
  float fy = fract((p.y + 0.5) * N) - 0.5;
  float yc = (band + 0.5) / N - 0.5;
  float hw = sqrt(max(R * R - yc * yc, 0.0));
  float push = (u_mouse.x - 0.5) * 0.3 * u_hover * sin(band * 1.7 + 0.5);
  float offs = 0.05 * sin(u_time * 0.5 + band * 0.8) + push;
  float x = p.x - offs;

  float k = clamp(abs(x) / max(hw, 0.001), 0.0, 1.0);
  float thick = 0.46 * (1.0 - k * k);
  float inside = smoothstep(0.14, -0.12, abs(fy) - thick) * smoothstep(0.02, -0.07, abs(x) - hw);

  float g = clamp(yc / R * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(CORAL2 * 0.85, mix(vec3(1.0), CORAL, 0.14), pow(g, 1.4));
  col = mix(col, GELO, smoothstep(0.75, 1.0, g) * 0.3);
  col *= 0.5 + 0.55 * smoothstep(hw, -hw * 0.4, x);
  col *= inside;
  col += CORAL2 * 0.06 * exp(-dot(p, p) * 6.0);
  o = vec4(col, 1.0);
}`,n=i+`
const float THICK = 0.36;  // at\xe9 onde a luz avan\xe7a no trecho mais forte, em fra\xe7\xf5es do lado menor
const float BAND = 0.4;    // largura da rampa de cor: luz rasa fica s\xf3 no anil, funda chega ao gelo
const float SOFT = 0.5;    // transi\xe7\xe3o entre as cores (0 = degrau, 1 = gradiente)
const float GRAIN = 0.32;  // quanto o gr\xe3o espalha os pixels entre as faixas

float noise3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v / 0.875;
}

void main() {
  float m = min(u_res.x, u_res.y);
  vec2 size = u_res / m;
  vec2 p = gl_FragCoord.xy / m;
  float t = u_time * 0.06;

  // dist\xe2ncia at\xe9 a borda mais pr\xf3xima, com os cantos arredondados por um m\xednimo suave
  // a luz avan\xe7a menos nas bordas que encostam no texto: em cima e embaixo no desktop (largo),
  // nas laterais no celular (alto)
  float asp = size.x / size.y;
  vec2 d2 = min(p, size - p) * vec2(mix(1.0, 1.7, smoothstep(0.95, 0.6, asp)), mix(1.0, 1.6, smoothstep(1.1, 1.9, asp)));
  float k = 0.08;
  float h = clamp(0.5 + 0.5 * (d2.y - d2.x) / k, 0.0, 1.0);
  float edge = mix(d2.y, d2.x, h) - k * h * (1.0 - h);

  // espessura fluida: trechos da borda apagam de vez, em outros a luz avan\xe7a
  vec2 q = p * 1.3;
  vec2 w = vec2(noise3(q + vec2(0.0, t)), noise3(q + vec2(5.2, -t * 0.8)));
  float n = noise3(q + 1.8 * w + vec2(t * 0.7, -t * 0.4));
  float thick = THICK * smoothstep(0.3, 0.85, n);

  // ponteiro perto da borda: a luz estica at\xe9 ele
  vec2 md = p - u_mouse * size;
  thick += 0.3 * u_hover * exp(-dot(md, md) * 6.0);

  float shape0 = clamp((thick - edge) / BAND, 0.0, 1.0);
  float shape = shape0 + GRAIN * (grain(gl_FragCoord.xy) - 0.5);

  // rampa de 4 cores sobre o fundo, como no GrainGradient
  float s = clamp(shape - 0.125, 0.0, 1.0);
  float alpha = smoothstep(0.0, SOFT, clamp(s * 4.0, 0.0, 1.0));
  float x = s * 3.0;
  float lo = 0.5 - 0.5 * SOFT, hi = 0.5 + 0.5 * SOFT;
  vec3 col = ANIL;
  col = mix(col, CORAL, smoothstep(lo, hi, clamp(x, 0.0, 1.0)));
  col = mix(col, GELO, smoothstep(lo, hi, clamp(x - 1.0, 0.0, 1.0)));
  col = mix(col, ANIL, smoothstep(lo, hi, clamp(x - 2.0, 0.0, 1.0)));
  // o escuro fica escuro: o gr\xe3o n\xe3o leva pontos claros para longe da luz
  col *= alpha * smoothstep(0.0, 0.3, shape0);
  o = vec4(col, 1.0);
}`,m=i+`
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;

  float R = max(asp, 1.0) * 1.15;
  float top = asp > 1.0 ? -0.33 : -0.36;
  float d = length(p - vec2(0.0, top - R)) - R;   // > 0 no c\xe9u

  float lx = 0.22 * asp * sin(t * 2.0) + (m.x - 0.22 * asp * sin(t * 2.0)) * 0.6 * u_hover;
  float along = exp(-pow((p.x - lx) / (0.35 * max(asp, 1.0) + 0.25), 2.0));

  float a = max(d, 0.0), b = max(-d, 0.0);
  float sky = smoothstep(-0.003, 0.003, d);
  vec3 atm = mix(GELO, CORAL, smoothstep(0.0, 0.06, a));
  atm = mix(atm, ANIL, smoothstep(0.05, 0.22, a));
  vec3 col = atm * exp(-a * 7.0) * (0.18 + 0.95 * along) * sky;
  col += ANIL * 0.12 * exp(-a * 2.2) * (0.4 + 0.6 * along) * sky;          // brilho largo
  vec3 ground = mix(CORAL * 0.5, ABISMO * 0.55, smoothstep(0.0, 0.05, b));
  ground = mix(ground, vec3(0.0), smoothstep(0.04, 0.3, b));
  col += ground * (0.25 + 0.9 * along) * (1.0 - sky);
  col += mix(GELO, vec3(1.0), 0.5) * exp(-abs(d) * 160.0) * (0.25 + 1.0 * along); // a linha da borda

  // estrelas fracas, s\xf3 no c\xe9u e longe do brilho
  vec2 cell = floor(gl_FragCoord.xy / (2.0 * u_dpr));
  float st = step(0.9965, hash(cell)) * (0.5 + 0.5 * sin(u_time * 1.5 + hash(cell + 7.0) * 30.0));
  col += vec3(0.75, 0.75, 0.9) * st * 0.55 * sky * smoothstep(0.1, 0.45, a);
  o = vec4(col, 1.0);
}`,p=e=>i+`
const float TILT = ${e.toFixed(3)};
float hf(vec2 q, float t, vec2 m, float hv) {
  // dobras quase paralelas e diagonais, como um tecido caindo, com uma tor\xe7\xe3o lenta
  float u = q.x * 0.9 + q.y * 0.55;
  float h = sin(u * 2.6 + sin(q.y * 1.2 + q.x * 0.4 + t * 2.0) * 1.8 + t * 2.2) * 0.6
    + sin(u * 5.1 - t * 1.7 + q.y * 0.8) * 0.18
    + sin(q.x * 0.7 - q.y * 1.9 + t * 1.3) * 0.22;
  vec2 dm = q - m;
  h += 0.35 * hv * exp(-dot(dm, dm) * 1.5) * sin(length(dm) * 9.0 - t * 40.0);
  return h;
}
void main() {
  float asp = u_res.x / u_res.y;
  mat2 tilt = mat2(cos(TILT), -sin(TILT), sin(TILT), cos(TILT));
  vec2 p = tilt * (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = tilt * ((u_mouse - 0.5) * vec2(asp, 1.0));
  float t = u_time * 0.05;
  vec2 sc = vec2(1.6, 2.6);
  vec2 q = p * sc, qm = m * sc;
  float e = 0.004;
  float h = hf(q, t, qm, u_hover);
  float hx = hf(q + vec2(e, 0.0), t, qm, u_hover) - h;
  float hy = hf(q + vec2(0.0, e), t, qm, u_hover) - h;
  vec3 n = normalize(vec3(-hx / e, -hy / e, 1.3));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float nh = clamp(dot(n, H), 0.0, 1.0);
  float spec = pow(nh, 40.0);                     // o fio de brilho em cada dobra
  float sheen = pow(nh, 9.0);                     // o lustro largo em volta
  vec3 base = mix(ANIL, CORAL, 0.5 + 0.5 * sin(h * 1.6 + p.x * 0.9 + t * 1.5));
  vec3 col = base * (0.08 + 0.9 * dif * dif) + mix(CORAL, GELO, 0.5) * sheen * 0.7 + GELO * spec * 1.4;

  // o tecido s\xf3 ocupa a parte de baixo, com a borda de cima ondulando
  float edge = -0.22 + 0.07 * sin(p.x * 1.7 + t * 2.5) + 0.04 * sin(p.x * 3.9 - t * 1.8);
  if (asp < 1.0) edge -= 0.05;
  float mask = smoothstep(edge + 0.03, edge - 0.14, p.y);
  col *= mask;
  col += ANIL * 0.07 * smoothstep(edge + 0.25, edge - 0.1, p.y) * (1.0 - mask);
  o = vec4(col, 1.0);
}`,d=p(0),u=p(.42),f=e=>i+`
const float GRAIN = ${e.toFixed(3)};  // largura do gr\xe3o no campo (0 = tinta lisa); as faixas de cor medem ~0,02 a 0,18
float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; }
  return v / 0.875;
}
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.07;

  // a tinta escorre na diagonal: gira e estica o espa\xe7o
  vec2 s = mat2(0.8, -0.6, 0.6, 0.8) * p * (asp > 1.0 ? 0.85 : 1.15);
  s.y *= 1.8;

  vec2 q = vec2(fbm3(s + vec2(0.0, t)), fbm3(s + vec2(5.2, -t * 0.8)));
  vec2 dm = p - m;
  q += 0.9 * u_hover * exp(-dot(dm, dm) * 7.0) * vec2(-dm.y, dm.x);   // redemoinho no ponteiro
  vec2 r = vec2(fbm3(s + 4.2 * q + vec2(1.7, 9.2) + t * 1.3), fbm3(s + 4.2 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm3(s + 3.6 * r + t * 0.5);

  // atr\xe1s do texto a tinta puxa para as fitas escuras; o plano claro fica para as bordas
  float asp2 = max(asp, 1.0);
  vec2 tb = p / vec2(0.36 * asp2, asp > 1.0 ? 0.3 : 0.42);
  float behind = exp(-dot(tb, tb));
  f -= (asp > 1.0 ? 0.2 : 0.12) * behind;
  // estrias: linhas finas que seguem o fluxo e se juntam onde a tinta estica
  float streak = sin(length(r) * 150.0 + f * 40.0);
  f += 0.014 * streak * smoothstep(0.32, 0.52, f) * smoothstep(0.64, 0.54, f);
  f += GRAIN * (grain(gl_FragCoord.xy) - 0.5);

  // rampa: fundo → fitas → borda acesa → plano claro
  vec3 deep = ABISMO * 0.75;
  vec3 blue = ANIL;
  vec3 rimc = CORAL;
  vec3 light = GELO;
  float band = smoothstep(0.34, 0.52, f);
  float lit = smoothstep(0.588, 0.605, f);
  // o gr\xe3o espalha a borda coral, que \xe9 fina: ela alarga junto para n\xe3o se desfazer em pontos soltos
  float rim = exp(-pow((f - 0.576) / (0.022 + 0.4 * GRAIN), 2.0));
  vec3 col = mix(deep, blue, band * (0.45 + 0.55 * smoothstep(0.42, 0.55, f)));
  col += mix(ANIL, GELO, 0.45) * 0.45 * pow(clamp(length(r - 0.5) * 2.2 - 0.4, 0.0, 1.0), 3.0) * band;  // brilho nas fitas
  col = mix(col, rimc, clamp(rim, 0.0, 1.0) * 0.95);
  col = mix(col, light, lit);
  // se o plano claro chegar ao texto, vira meio-tom ali: o branco do t\xedtulo n\xe3o some
  col *= 1.0 - 0.5 * behind * max(lit, rim * 0.6);
  o = vec4(col, 1.0);
}`,A={aurora:r,beam:l,slices:c,edges:n,horizon:m,silk:d,"silk-sweep":u,fluted:i+`
vec3 lights(vec2 p, float asp, float t, vec2 m) {
  vec2 a, b;
  if (asp > 1.0) {
    a = vec2(-0.5 * asp + 0.02 + 0.04 * sin(t * 3.0), -0.05 + 0.2 * sin(t * 2.1));
    b = vec2(0.5 * asp - 0.02 + 0.04 * cos(t * 2.6), 0.08 + 0.2 * cos(t * 1.7));
  } else {
    a = vec2(-0.12 + 0.1 * sin(t * 2.4), 0.53 + 0.03 * sin(t * 3.0));
    b = vec2(0.12 + 0.1 * cos(t * 2.0), -0.53 + 0.03 * cos(t * 2.7));
  }
  float f = asp > 1.0 ? 11.0 : 30.0;  // no celular as luzes encolhem para n\xe3o chegar ao texto
  float ga = exp(-dot(p - a, p - a) * f), gb = exp(-dot(p - b, p - b) * f);
  float gm = exp(-dot(p - m, p - m) * 18.0) * u_hover;
  vec3 c = CORAL * ga * 1.1 + ANIL * gb * 1.2 + GELO * gm * 0.9;
  c += GELO * (pow(ga, 4.0) + pow(gb, 4.0)) * 0.6;
  return c;
}
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;
  float w = 34.0 * u_dpr;                       // largura da canelura em pixels de tela
  float fx = fract(gl_FragCoord.x / w);
  float k = fx - 0.5;
  // cada canelura \xe9 uma lente: desloca e estica a luz de tr\xe1s
  vec2 sp = vec2(p.x + k * 0.16 + k * k * k * 0.5, p.y);
  vec3 col = lights(sp, asp, t, m);
  // chromatic: o rosa e o lil\xe1s se separam um pouco na borda da canelura
  col.r = lights(sp + vec2(k * 0.02, 0.0), asp, t, m).r;
  float shade = 0.78 + 0.32 * sin(fx * 3.14159);
  col *= shade;
  col += vec3(1.0) * 0.05 * smoothstep(0.08, 0.0, fx) * (0.3 + length(col));  // fio de luz na quina
  col *= 0.95;
  o = vec4(col, 1.0);
}`,threads:i+`
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;
  float base = asp > 1.0 ? -0.36 : -0.38;
  vec3 col = vec3(0.0);
  float px = 1.0 / u_res.y;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float k = fi / 13.0;
    float y = base + (k - 0.5) * 0.22
      + 0.09 * sin(p.x * (1.1 + 0.25 * k) + t * (2.5 + k) + fi * 0.7)
      + 0.05 * sin(p.x * (2.7 - k) - t * 1.9 + fi * 1.9);
    vec2 dm = vec2(p.x, y) - m;
    y += 0.08 * u_hover * exp(-dot(dm, dm) * 10.0) * sign(y - m.y);
    float d = abs(p.y - y);
    float glow = 0.0016 / (d + 0.0016) * exp(-d * 30.0);
    vec3 c = mix(ANIL, CORAL, k);
    c = mix(c, GELO, 0.1 + 0.12 * sin(fi + t * 3.0)); // um pouco de branco que pulsa fio a fio
    float fade = smoothstep(0.62 * asp, 0.1 * asp, abs(p.x - 0.2 * sin(t + fi)));
    col += c * glow * (0.35 + 0.65 * fade);
  }
  col += ANIL * 0.08 * exp(-pow((p.y - base) * 4.0, 2.0));
  o = vec4(col, 1.0);
}`,liquid:f(0),"liquid-grain":f(.1),helix:i+`
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;

  // eixo: sobe da esquerda embaixo para a direita em cima
  const float A = 0.66;
  vec2 q = mat2(cos(A), -sin(A), sin(A), cos(A)) * p;
  q.y += 0.11 * sin(q.x * 1.15 + t * 2.4) + 0.045 * sin(q.x * 2.6 - t * 1.7);

  // a tor\xe7\xe3o: fase ao longo do eixo, empurrada pelo ru\xeddo do m\xe1rmore
  float wn = fbm(q * vec2(0.9, 1.6) + vec2(t * 1.5, -t));
  float ph = q.x * 4.4 - t * 6.0 + (wn - 0.5) * 1.6;
  // o ponteiro abre a h\xe9lice em volta dele, devagar: o raio cresce perto do ponteiro, sem cortar a imagem no eixo
  vec2 dm = p - m;
  float R = (0.15 + 0.03 * sin(q.x * 0.7 + t)) * (1.0 + 0.45 * u_hover * exp(-dot(dm, dm) * 5.0));
  float z = cos(ph);                         // 1: a fita 1 na frente; -1: a fita 2 na frente
  float c1 = R * sin(ph), c2 = -c1;
  float w1 = 0.042 + 0.03 * z, w2 = 0.042 - 0.03 * z;
  float d1 = (q.y - c1) / w1, d2 = (q.y - c2) / w2;
  float s1 = exp(-d1 * d1), s2 = exp(-d2 * d2);
  float h1 = exp(-d1 * d1 * 0.08), h2 = exp(-d2 * d2 * 0.08);   // halos largos em volta de cada fita
  float f1 = 0.55 + 0.45 * z, f2 = 0.55 - 0.45 * z;              // a da frente acende mais

  // n\xe9voa larga de um lado da h\xe9lice, como a nuvem de gr\xe3o da refer\xeancia
  float fog = exp(-pow((q.y - 0.32 - 0.1 * sin(q.x * 0.8 - t)) / 0.34, 2.0)) * smoothstep(-1.4, 0.4, q.x);

  float e1 = f1 * (s1 + 0.32 * h1), e2 = f2 * (s2 + 0.32 * h2);
  float I = max(e1, e2) + 0.25 * min(e1, e2) + 0.12 * fog;
  // o brilho vira densidade de pontos (perto das bordas os pixels caem ora na luz, ora no escuro), misturado a uma
  // parte lisa: o gr\xe3o fica de textura, n\xe3o de chuvisco no fundo
  float g = grain(gl_FragCoord.xy);
  float v = pow(I, 1.35);
  float lit = mix(smoothstep(0.0, 0.9, v), smoothstep(g - 0.2, g + 0.2, v), 0.4);

  // cor de cada fita: na frente, miolo gelo e bordas quentes; atr\xe1s, fria. As duas se misturam pelo peso de cada
  // uma, ent\xe3o a fita esfria aos poucos quando passa para tr\xe1s da outra, sem linha de troca
  vec3 k1 = mix(ANIL, mix(CORAL, GELO, smoothstep(0.35, 0.95, s1)), smoothstep(0.3, 0.85, f1));
  vec3 k2 = mix(ANIL, mix(CORAL, GELO, smoothstep(0.35, 0.95, s2)), smoothstep(0.3, 0.85, f2));
  vec3 light = (k1 * e1 + k2 * e2) / max(e1 + e2, 1e-4);
  light = mix(light, mix(ANIL, GELO, 0.25), clamp(0.22 * fog / (0.22 * fog + e1 + e2 + 1e-4), 0.0, 1.0));
  vec3 deep = ABISMO * 0.55;
  vec3 col = mix(deep, light, lit);
  col += ANIL * 0.08 * (h1 + h2);           // um fundo de luz fria, sem gr\xe3o, que tira o preto chapado
  o = vec4(col, 1.0);
}`,contour:i+`
const float N = 28.0;      // curvas no intervalo de altura 0..1

// ru\xeddo de valor com interpola\xe7\xe3o qu\xedntica: a curvatura n\xe3o tem quebra na borda das c\xe9lulas, ent\xe3o as curvas de
// n\xedvel saem lisas de ponta a ponta (com a c\xfabica do common aparecem cotovelos leves)
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// terreno de poucas formas grandes: tr\xeas camadas largas e nenhuma oitava fina. Morros largos e vales longos d\xe3o
// curvas que correm em paralelo; as oitavas finas \xe9 que faziam ilhotas, la\xe7inhos e dentes
float terrain(vec2 q) {
  float h = 0.64 * vnoise(q);
  h += 0.28 * vnoise(mat2(0.8, 0.6, -0.6, 0.8) * q * 1.85 + vec2(3.1, 7.7));
  h += 0.08 * vnoise(mat2(0.6, -0.8, 0.8, 0.6) * q * 3.3 + vec2(9.4, 1.3));
  return h;
}

float relief(vec2 p, float t, vec2 m) {
  vec2 q = p * 0.9;
  // tor\xe7\xe3o de baixa frequ\xeancia e amplitude pequena: os morros escorregam sem tremer as linhas
  vec2 w = vec2(vnoise(q * 0.45 + vec2(t, 3.1)), vnoise(q * 0.45 + vec2(7.4, -t))) - 0.5;
  float h = terrain(q + 0.22 * w + vec2(t * 0.5, -t * 0.3));
  // respira\xe7\xe3o: uma camada bem larga sobe e desce, ent\xe3o os cumes crescem e afundam no lugar
  h += 0.12 * (vnoise(q * 0.6 + vec2(11.0, 5.0)) - 0.5) * sin(t * 6.0 + vnoise(q * 0.35) * 6.28);
  // plan\xedcie para o texto: no largo, a esquerda; no alto, o topo
  float asp = u_res.x / u_res.y;
  float side = asp > 1.0 ? smoothstep(-0.75, 0.4, p.x) : smoothstep(0.55, -0.15, p.y);
  h = mix(0.42 + 0.3 * (h - 0.42), h, 0.15 + 0.85 * side);
  // o morro do ponteiro: estreito no pico, para as curvas se apertarem em an\xe9is
  vec2 d = p - m;
  h += 0.34 * u_hover * exp(-dot(d, d) * 12.0);
  return h;
}

void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;
  // no celular em p\xe9 o mapa amplia um pouco: menos curvas espremidas na largura curta
  p *= asp < 1.0 ? 1.25 : 1.0;
  m *= asp < 1.0 ? 1.25 : 1.0;

  float h = relief(p, t, m);
  // sombreado de relevo por diferen\xe7a finita (o dFdx num buffer de meia resolu\xe7\xe3o fica em blocos)
  float e = 0.004;
  vec2 g = vec2(relief(p + vec2(e, 0.0), t, m) - h, relief(p + vec2(0.0, e), t, m) - h) / e;
  vec3 nrm = normalize(vec3(-g * 0.12, 1.0));
  float shade = dot(nrm, normalize(vec3(-0.6, 0.7, 0.55)));

  // dist\xe2ncia \xe0 curva mais pr\xf3xima em px do buffer: o fwidth faz a linha ter a mesma espessura no plano e no
  // morro \xedngreme
  float f = h * N;
  float fw = max(fwidth(f), 1e-4);
  float k = floor(f + 0.5);
  float dpx = abs(f - k) / fw;
  bool master = mod(k, 5.0) == 0.0;
  float px = max(u_dpr, 0.5);
  float hw = (master ? 1.25 : 0.55) * px;                    // meia espessura: 2,5 px a mestra, ~1 px as outras
  float core = 1.0 - smoothstep(hw - 0.5, hw + 0.7, dpx);
  float glow = exp(-dpx / ((master ? 7.0 : 3.5) * px));       // o brilho em volta, tamb\xe9m em px
  // perto de um topo ou fundo de vale o declive some e a curva vira um la\xe7inho min\xfasculo: apaga
  float slope = smoothstep(0.1, 0.32, length(g));
  core *= slope;
  glow *= slope;

  // cor pela altitude
  float a = clamp((h - 0.25) / 0.6, 0.0, 1.0);
  vec3 lc = mix(ANIL, GELO, smoothstep(0.1, 0.55, a));
  lc = mix(lc, CORAL, smoothstep(0.5, 0.82, a));

  // a plan\xedcie acende menos
  float side = asp > 1.0 ? smoothstep(-0.75, 0.4, p.x) : smoothstep(0.7, -0.1, p.y);
  float lit = 0.25 + 0.75 * side;
  float strength = (master ? 1.0 : 0.62) * lit;

  vec3 bg = ABISMO * (0.55 + 0.35 * a);
  bg *= 0.6 + 0.8 * clamp(shade, 0.0, 1.0);                 // relevo entre as curvas
  bg += mix(ANIL, CORAL, a) * 0.035 * side;
  vec3 col = bg;
  col += lc * glow * (master ? 0.32 : 0.2) * lit;
  col = mix(col, mix(lc, vec3(1.0), master ? 0.25 : 0.1), core * strength);

  col *= smoothstep(2.0, 0.4, length(p * vec2(0.55, 0.9)));  // vinheta leve
  col += (grain(gl_FragCoord.xy) - 0.5) * 0.025;
  o = vec4(col, 1.0);
}
`,dither:i+`
// limiar de Bayer 8\xd78: entrela\xe7a os bits de (x xor y) e y, ao contr\xe1rio
float bayer8(vec2 c) {
  ivec2 i = ivec2(mod(c, 8.0));
  int a = i.x ^ i.y, b = i.y;
  int v = ((a & 1) << 5) | ((b & 1) << 4) | ((a & 2) << 2) | ((b & 2) << 1) | ((a & 4) >> 1) | ((b & 4) >> 2);
  return (float(v) + 0.5) / 64.0;
}

// onde est\xe1 a bola: \xe0 direita no desktop (o texto mora \xe0 esquerda) e embaixo no celular em p\xe9
vec3 orb(float asp, float t) {
  bool tall = asp < 1.0;
  vec2 c = tall ? vec2(0.0, -0.06) : vec2(0.36 * asp - 0.18, 0.08);
  c += vec2(0.035 * sin(t * 2.3), 0.03 * sin(t * 3.1 + 1.0));
  return vec3(c, tall ? 0.4 * asp : 0.25);
}

// a cena em luz cont\xednua (0 = fundo, 1 = o brilho mais forte)
float scene(vec2 p, float asp, float t) {
  vec3 ob = orb(asp, t);
  vec2 c = ob.xy;
  float R0 = ob.z;

  // a forma: um c\xedrculo que respira e se deforma devagar, sem nunca virar estrela
  vec2 d = p - c;
  float th = atan(d.y, d.x);
  float R = R0 * (1.0 + 0.045 * sin(2.0 * th + t * 4.0) + 0.03 * sin(3.0 * th - t * 3.0 + 1.3)
                + 0.015 * sin(5.0 * th + t * 5.0));
  vec2 q = d / R;
  float r2 = dot(q, q);

  // ch\xe3o: um plano que acende embaixo da bola e some no horizonte e nas laterais, com a sombra dela logo abaixo,
  // puxada para o lado oposto \xe0 luz
  float floorY = c.y - R0 * 0.85;
  float below = floorY - p.y;
  vec2 L2 = vec2(-0.55, 0.75);
  vec2 sc = vec2(c.x + 0.25 * R0, c.y - R0 * 1.32);
  vec2 sd = (p - sc) / vec2(R0 * 1.1, R0 * 0.26);
  float shadow = smoothstep(1.0, 0.35, length(sd));
  // o ch\xe3o \xe9 uma mancha em volta da bola, n\xe3o uma faixa: o horizonte aparece aos poucos e as laterais apagam (a
  // esquerda mais cedo, porque \xe9 onde fica o texto)
  float gx = (p.x - c.x) / (R0 * (p.x < c.x ? 1.7 : 1.9));
  float gy = (below - 0.26) / 0.24;
  float ground = smoothstep(-0.02, 0.3, below) * exp(-gx * gx - gy * gy * (gy < 0.0 ? 1.0 : 0.3));
  // a bola acende o ch\xe3o em volta dela: uma po\xe7a de luz mais forte, e a sombra recorta essa po\xe7a
  vec2 pd = (p - vec2(c.x - 0.2 * R0, sc.y)) / vec2(R0 * 2.0, R0 * 0.6);
  float pool = exp(-dot(pd, pd));
  float I = max(ground * (0.18 + 0.36 * pool) - 0.03, 0.0) * (1.0 - 0.97 * shadow);  // sem pontinho solto no fim

  // halo largo em volta da bola, mais forte do lado da luz
  float rr = sqrt(r2);
  float halo = exp(-max(rr - 1.0, 0.0) * 6.0) * (0.55 + 0.45 * dot(normalize(d + 1e-5), normalize(L2)));
  I += max(0.26 * halo - 0.025, 0.0);

  // o corpo: uma esfera falsa (normal a partir do raio deformado), luz de cima \xe0 esquerda girando um pouco
  if (r2 < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r2));
    vec3 L = normalize(vec3(-0.55 + 0.25 * sin(t * 2.0), 0.7, 0.75));
    float dif = max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 14.0);
    float rim = pow(1.0 - n.z, 3.0) * smoothstep(-0.3, 0.6, dot(n.xy, -L.xy)) * 0.35;  // luz rebatida do ch\xe3o
    float body = 0.12 + 0.62 * dif + 0.22 * spec + rim;
    I = mix(I, body, smoothstep(1.0, 0.97, rr));
  }
  return clamp(I, 0.0, 1.0);
}

// os quatro tons, do fundo ao brilho
vec3 tone(float k) {
  return k < 0.5 ? ABISMO : k < 1.5 ? ANIL : k < 2.5 ? CORAL : GELO;
}
vec3 ramp(float I) {
  float x = I * 3.0;
  return mix(tone(floor(x)), tone(min(floor(x) + 1.0, 3.0)), fract(x));
}

void main() {
  float asp = u_res.x / u_res.y;
  float t = u_time * 0.05;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float S = max(floor(8.0 * u_dpr + 0.5), 1.0);       // a c\xe9lula grande: 8 px de CSS

  // a zona da lupa \xe9 medida no centro da c\xe9lula grande, por isso a borda anda em degraus de c\xe9lula
  vec2 big = floor(gl_FragCoord.xy / S);
  vec2 pb = ((big + 0.5) * S - 0.5 * u_res) / u_res.y;
  // sem ponteiro a lupa passeia sozinha, devagar, num la\xe7o que cruza a bola e a po\xe7a de luz do ch\xe3o; com o
  // ponteiro ela vai at\xe9 ele com a mesma suaviza\xe7\xe3o do hover
  vec3 ob = orb(asp, t);
  float a = u_time * 0.11;
  vec2 roam = ob.xy + ob.z * vec2(0.75 * sin(a + 1.13), -0.45 + 0.75 * sin(a * 1.7 + 4.26));
  vec2 lc = mix(roam, m, smoothstep(0.0, 1.0, u_hover));
  float lr = asp < 1.0 ? 0.24 * asp + 0.08 : 0.3;
  float dz = length(pb - lc) / lr;
  float lvl = dz < 0.42 ? 3.0 : dz < 0.7 ? 2.0 : dz < 1.0 ? 1.0 : 0.0;  // 0: 8 px, 1: 4, 2: 2, 3: liso

  float s = max(floor(S / exp2(lvl) + 0.5), 1.0);
  vec2 cell = floor(gl_FragCoord.xy / s);
  vec2 frag = lvl > 2.5 ? gl_FragCoord.xy : (cell + 0.5) * s;   // no miolo, cada pixel l\xea a cena
  vec2 p = (frag - 0.5 * u_res) / u_res.y;

  // dentro da lupa a imagem tamb\xe9m aumenta um pouco, como atrav\xe9s de uma lente
  vec2 dm = p - lc;
  p = lc + dm * (1.0 - 0.18 * exp(-dot(dm, dm) / (lr * lr)));

  float I = scene(p, asp, t);
  vec3 col;
  if (lvl > 2.5) {
    col = ramp(I);
  } else {
    float x = I * 2.999;
    float k = floor(x) + step(bayer8(cell), fract(x));
    col = tone(k);
  }
  o = vec4(col, 1.0);
}
`,filings:i+`
const float PAPER = 1.0;     // 1: grafite sobre papel (GELO \xe9 o papel); 0: metal claro sobre o escuro (ABISMO)
const float CELL = 0.0068;   // lado da c\xe9lula, em alturas de tela: ~38 mil c\xe9lulas no desktop
const float NL = 20.0;       // correntes por unidade de carga. Cargas \xb11 e \xb10,75 (o ponteiro \xe9 -0,5) vezes NL d\xe3o
                             // inteiros: o salto do atan2 \xe9 m\xfaltiplo de 2π e n\xe3o aparece

vec2 poleN, poleS, poleC, poleD;
float qM;
vec2 mpos;

void setup(float asp, float t, vec2 m) {
  float wide = smoothstep(0.8, 1.3, asp);
  float hx = 0.5 * asp;
  // dipolo \xe0 direita no desktop, deitado; no celular, embaixo e em p\xe9. Gira e respira devagar
  vec2 cen = mix(vec2(0.0, -0.2), vec2(0.5 * hx, -0.02), wide) + vec2(0.03 * sin(t * 1.1), 0.03 * cos(t * 0.9));
  float ang = mix(1.35, 0.35, wide) + 0.25 * sin(t * 0.8);
  float sep = mix(0.15, 0.21, wide) * (1.0 + 0.08 * sin(t * 1.4 + 1.0));
  vec2 ax = vec2(cos(ang), sin(ang)) * sep;
  poleN = cen - ax;
  poleS = cen + ax;
  // o dipolo menor, fora do eixo e virado ao contr\xe1rio: troca linhas com o grande
  vec2 c2 = cen + mix(vec2(0.12, -0.3), vec2(0.2 * hx, -0.3), wide) + vec2(0.04 * cos(t * 1.3), 0.03 * sin(t * 1.7));
  float a2 = mix(0.3, -0.5, wide) + 0.3 * sin(t * 1.2 + 2.0);
  vec2 ax2 = vec2(cos(a2), sin(a2)) * 0.075;
  poleC = c2 + ax2;
  poleD = c2 - ax2;
  mpos = m;
  qM = -0.5 * u_hover;
}

vec2 pole(vec2 x, vec2 c, float q) {
  vec2 r = x - c;
  return q * r / (dot(r, r) + 0.0003);
}
vec2 field(vec2 x) {
  return pole(x, poleN, 1.0) + pole(x, poleS, -1.0) + pole(x, poleC, 0.75) + pole(x, poleD, -0.75) + pole(x, mpos, qM);
}
float stream(vec2 x) {
  vec2 a = x - poleN, b = x - poleS, c = x - poleC, e = x - poleD, d = x - mpos;
  return atan(a.y, a.x) - atan(b.y, b.x) + 0.75 * (atan(c.y, c.x) - atan(e.y, e.x)) + qM * atan(d.y, d.x);
}

void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05;
  float px = 1.0 / u_res.y;
  setup(asp, t, m);

  // a luz gira devagar em volta da mesa: mesmo parados, os tra\xe7os trocam de brilho
  float la = 0.7 + 0.8 * sin(t * 1.7);
  vec3 L = normalize(vec3(cos(la), sin(la), 1.0));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vec2 sh = -L.xy * 1.6 * px - vec2(0.0, 0.6 * px);   // a sombra cai do lado oposto \xe0 luz

  vec2 gi = floor(p / CELL);
  float hw = max(0.075 * CELL, 0.5 * px);    // meia largura do tra\xe7o
  float cov = 0.0, shad = 0.0;
  vec3 lit = vec3(0.0);

  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++) {
    vec2 id = gi + vec2(i, j);
    float h1 = hash(id), h2 = hash(id + 17.3), h3 = hash(id + 41.7);
    // jitter de \xb10,3 c\xe9lula: com meio comprimento at\xe9 1 c\xe9lula, a vizinhan\xe7a 3\xd73 basta
    vec2 fp = (id + 0.5 + 0.6 * (vec2(h1, h2) - 0.5)) * CELL;
    vec2 B = field(fp);
    float s = length(B);
    float ls = log(s);
    // o \xedm\xe3 alcan\xe7a at\xe9 onde o campo cai a ~1: al\xe9m disso, papel limpo
    float reach = smoothstep(0.45, 1.4, ls);
    // as correntes: os tra\xe7os caem nas linhas de n\xedvel da fun\xe7\xe3o de corrente, com espessura que varia ao longo
    // delas; perto dos polos as linhas ficam mais juntas que a grade e a modula\xe7\xe3o some (vira o tapete do polo)
    float spacing = 6.2832 / (NL * s);
    float wl = smoothstep(1.6 * CELL, 4.0 * CELL, spacing);
    float ch = cos(stream(fp) * NL + 1.6 * noise(fp * 9.0));
    float chain = smoothstep(0.1 - 0.5 * noise(fp * 4.0 + 3.0), 0.95, ch);
    float dens = reach * mix(0.95, 0.28 + 0.72 * chain, wl);
    if (dens < 0.02 || h3 > dens) continue;

    float ang = atan(B.y, B.x) + (h1 - 0.5) * 0.12;
    vec2 dir = vec2(cos(ang), sin(ang));
    float len = CELL * mix(0.6, 1.0, smoothstep(0.3, 2.5, ls)) * (0.85 + 0.15 * h2);

    vec2 r = p - fp;
    float u = dot(r, dir), v = dot(r, vec2(-dir.y, dir.x));
    float tu = clamp(u / len, -1.0, 1.0);
    float wv = hw * (1.0 - 0.6 * tu * tu);       // afina nas pontas
    float d = length(vec2(max(abs(u) - len, 0.0), v));
    float a = smoothstep(wv + px, wv - px * 0.5, d);
    vec2 rs = r - sh;
    float ds = length(vec2(max(abs(dot(rs, dir)) - len, 0.0), dot(rs, vec2(-dir.y, dir.x))));
    shad = max(shad, smoothstep(wv + 2.5 * px, wv - px, ds));
    if (a <= 0.0) continue;

    // brilho de fio: cada tra\xe7o inclina um pouco para fora da mesa, para n\xe3o brilharem todos juntos
    vec3 T = normalize(vec3(dir, (h2 - 0.5) * 0.6));
    float th = dot(T, H);
    float sp = pow(sqrt(max(1.0 - th * th, 0.0)), 60.0);
    float tl = dot(T, L);
    float df = sqrt(max(1.0 - tl * tl, 0.0));
    float rim = clamp(v / max(wv, 1e-5) * 0.5 + 0.5, 0.0, 1.0);   // um lado do fio mais claro
    vec3 c;
    if (PAPER > 0.5) {
      // grafite: corpo escuro, lado frio de a\xe7o, um tra\xe7o ou outro de ferrugem, reflexo claro
      c = ABISMO * (0.55 + 0.6 * df * rim) + ANIL * 0.22 * df * rim;
      c = mix(c, CORAL * 0.55, 0.35 * step(0.9, hash(id + 9.1)));
      c += mix(ANIL, GELO, 0.5) * sp * 0.75;
    } else {
      c = CORAL * (0.2 + 0.6 * df * (0.6 + 0.4 * rim)) + ANIL * 0.18 * (1.0 - df) * (1.0 - rim);
      c += GELO * sp * 1.6;
    }
    lit = mix(lit, c, a);
    cov = max(cov, a);
  }

  // o fundo: papel com fibra e gr\xe3o, ou o escuro com um calor nos polos
  vec2 rn = p - poleN, rs2 = p - poleS;
  float glow = exp(-dot(rn, rn) * 7.0) + exp(-dot(rs2, rs2) * 7.0);
  float fib = fbm(p * vec2(9.0, 2.5) + 3.0) - 0.5;
  vec3 bg;
  if (PAPER > 0.5) {
    bg = GELO * (0.93 + 0.05 * fib - 0.035 * glow);
    bg *= 1.0 - 0.1 * smoothstep(0.6, 1.6, length(p * vec2(0.6, 1.0)));   // a borda do papel escurece de leve
    bg *= 1.0 - 0.28 * shad * (1.0 - cov);
  } else {
    bg = ABISMO * (0.85 + 0.3 * fib) + CORAL * 0.07 * glow;
    bg *= 1.0 - 0.5 * shad * (1.0 - cov);
  }
  bg += (grain(gl_FragCoord.xy) - 0.5) * 0.03;
  vec3 col = mix(bg, lit, cov);
  if (PAPER < 0.5) col *= smoothstep(1.6, 0.4, length(p * vec2(0.55, 0.9)));
  o = vec4(col, 1.0);
}
`,glyphs:i+`
// rampa 0–9 por densidade, acentos 10–16, letras e n\xfameros do letreiro 17–23:  .:-+=%*#@ \xe7\xe3\xe9\xf5\xe1\xea\xfa ARS037\xc7
const uint GLO[24] = uint[](0u, 0u, 4096u, 458752u, 1020032u, 31744u, 70003u, 1030816u, 359754u, 718382u, 34752u, 539062u, 571528u, 571830u, 538760u, 571716u, 574600u, 1033774u, 509487u, 459838u, 710446u, 475663u, 139807u, 34350u);
const uint GHI[24] = uint[](0u, 128u, 128u, 0u, 132u, 31u, 429u, 686u, 10591u, 30781u, 6302u, 31294u, 14399u, 14897u, 31294u, 14399u, 23345u, 17969u, 17701u, 15888u, 14965u, 15888u, 2114u, 12753u);

// um bit do glifo g na coluna x (0–4, da esquerda) e linha y (0–6, de cima)
float bit(int g, int x, int y) {
  if (x < 0 || x > 4 || y < 0 || y > 6) return 0.0;
  int i = y * 5 + x;
  uint w = i < 20 ? GLO[g] : GHI[g];
  return float((w >> uint(i < 20 ? i : i - 20)) & 1u);
}

// a fuma\xe7a: fbm empurrado por outros dois fbm, subindo devagar em diagonal. Devolve o corpo (x) e os fios (y):
// o vinco 1 - |2f - 1| \xe9 alto onde o fbm cruza o meio, o que desenha filetes finos dentro do corpo
vec2 smoke(vec2 p, vec2 m, float t) {
  vec2 dm = p - m;
  p += dm * 0.35 * u_hover * exp(-dot(dm, dm) * 6.0);     // o ponteiro abre a fuma\xe7a em volta dele
  vec2 q = p * vec2(2.6, 2.0) + vec2(-t * 1.2, -t * 2.6);
  vec2 w = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - t * 0.7));
  float f = fbm(q * 1.1 + 2.8 * w - vec2(0.0, t));
  float ridge = 1.0 - abs(2.0 * f - 1.0);
  return vec2(f, pow(ridge, 5.0));
}

void main() {
  float asp = u_res.x / u_res.y;
  float t = u_time * 0.05;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);

  // grade: bit inteiro em pixels do canvas (n\xedtido em qualquer dpr), c\xe9lula de 6\xd78 bits (glifo 5\xd77 + respiro),
  // perto de 12\xd716 px de CSS
  float s = max(1.0, floor(u_dpr * 1.75 + 0.5));
  vec2 cellPx = vec2(6.0, 8.0) * s;
  vec2 cell = floor(gl_FragCoord.xy / cellPx);
  vec2 lb = floor(mod(gl_FragCoord.xy, cellPx) / s);      // bit dentro da c\xe9lula, de baixo para cima
  int bx = int(lb.x), by = 6 - int(lb.y - 1.0);           // linha de baixo da c\xe9lula fica vazia
  vec2 c = (cell + 0.5) * cellPx;
  vec2 p = (c - 0.5 * u_res) / u_res.y;

  float h1 = hash(cell + 3.1), h2 = hash(cell * 1.7 + 11.4), h3 = hash(cell * 0.73 + 27.9);

  // cada c\xe9lula l\xea a fuma\xe7a no seu pr\xf3prio tique (4 por segundo, defasados): a troca escorre, n\xe3o pisca em bloco
  float tq = (floor(u_time * 4.0 + h1) - h1) / 4.0;
  vec2 sm = smoke(p, m, tq * 0.05);

  // regi\xe3o calma para o texto: no paisagem a fuma\xe7a mora \xe0 direita, subindo em diagonal; no retrato, sobe do p\xe9
  // da tela. A m\xe1scara garante a composi\xe7\xe3o em qualquer instante; o fbm s\xf3 esculpe por dentro dela
  float land = smoothstep(-0.55, 0.75, p.x / asp * 1.7 - p.y * 0.45 + 0.14 * sin(p.y * 3.0 + t * 4.0));
  float port = smoothstep(0.55, -0.5, p.y + 0.1 * sin(p.x * 5.0 + t * 4.0));
  float mask = mix(port, land, smoothstep(0.75, 1.1, asp));
  // a m\xe1scara entra como vi\xe9s no fbm, n\xe3o como multiplica\xe7\xe3o: a borda da fuma\xe7a fica org\xe2nica, n\xe3o uma reta
  float v = sm.x + 0.36 * (mask - 0.5);
  float body = smoothstep(0.34, 0.95, v);
  float I = body * (0.55 + 0.45 * body) + sm.y * 0.4 * smoothstep(0.3, 0.6, v);
  I = clamp(I, 0.0, 1.0);

  int lvl = int(clamp(I * 10.0, 0.0, 9.0));
  int g = lvl;
  // acentos nas faixas do meio, poucos, trocando de lugar de tempos em tempos
  if (lvl >= 5 && lvl <= 8 && hash(cell + floor(tq * 0.2 + h2) * 7.3) < 0.13) g = 10 + int(h3 * 6.99);

  // letreiro: perto do ponteiro a c\xe9lula embaralha; o limiar por c\xe9lula faz a borda se desfazer aos poucos
  vec2 dp = p - m;
  float S = u_hover * smoothstep(0.34, 0.06, length(dp * vec2(1.0, 1.15)));
  float scr = step(h2 * 0.92 + 0.04, S);
  float rate = 9.0 + 9.0 * h3;
  float ft = u_time * rate + h1 * 17.0;
  float k = floor(ft);
  int gNew = int(hash(cell + k * 0.137) * 23.99);
  int gOld = int(hash(cell + (k - 1.0) * 0.137) * 23.99);
  int gs = (by <= 3 || fract(ft) > 0.5) ? gNew : gOld;    // a aba de cima cai primeiro
  if (scr > 0.5) g = gs;

  float on = bit(g, bx, by);

  // cor: o glifo esquenta e clareia com a densidade; embaralhado, acende
  vec3 ink = mix(ANIL, CORAL, smoothstep(0.1, 0.55, I));
  ink = mix(ink, GELO, smoothstep(0.65, 1.0, I) * 0.8);
  float lum = 0.35 + 0.9 * I;
  ink = mix(ink * lum, mix(CORAL, GELO, 0.55) * 1.05, scr);
  // f\xf3sforo: a \xfaltima linha de pixels de cada bit um pouco mais escura (linha de varredura), s\xf3 quando d\xe1
  float scan = s >= 3.0 && mod(gl_FragCoord.y, s) < 1.0 ? 0.72 : 1.0;

  // fundo: n\xe3o \xe9 preto chapado; um brilho liso e baixo segue a fuma\xe7a por baixo dos glifos
  vec2 pp = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec3 col = ABISMO * 0.75 + CORAL * 0.05 * I + GELO * 0.04 * S;
  col = mix(col, ink * scan, on);
  col *= smoothstep(1.6, 0.35, length(pp * vec2(0.62, 0.9)));
  col += (grain(gl_FragCoord.xy) - 0.5) * 0.015;
  o = vec4(col, 1.0);
}
`},h=["u_res","u_time","u_mouse","u_hover","u_dpr","u_center","u_c1","u_c2","u_c3","u_c4"];class x{host;canvas=null;gl=null;ready=!1;disposed=!1;u={};scale;still;frameMs;steps;last=0;mouse=[.5,.5];target=[.5,.5];hover=0;hoverTarget=0;t0=performance.now();visible=!1;raf=0;reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;cleanups=[];frag;center;lights;lost=!1;constructor(e,o,{dpr:a=.5,center:t=[0,0],still:s=18,fps:i=60,lights:r}={}){this.host=e,this.frag=o,this.center=t,this.lights=r,this.scale=a,this.still=s,this.frameMs=1e3/i-2,this.steps=60/i;const l=o=>{let a=e.getBoundingClientRect();this.target=[(o.clientX-a.left)/a.width,1-(o.clientY-a.top)/a.height],this.hoverTarget=1,this.reduced&&this.frame()},c=()=>{this.hoverTarget=0};e.addEventListener("pointermove",l),e.addEventListener("pointerleave",c);const n=new ResizeObserver(()=>this.resize());n.observe(e);const m=new IntersectionObserver(([e])=>{this.visible=e.isIntersecting,this.visible&&this.lost&&this.rebuild(),this.visible&&!this.reduced&&this.loop()},{rootMargin:"100px"});m.observe(e);const p=new IntersectionObserver(([e])=>{e.isIntersecting&&(p.disconnect(),this.setup())},{rootMargin:"400px"});p.observe(e),this.cleanups.push(()=>e.removeEventListener("pointermove",l),()=>e.removeEventListener("pointerleave",c),()=>n.disconnect(),()=>m.disconnect(),()=>p.disconnect())}setup(){let e=document.createElement("canvas");e.setAttribute("aria-hidden","true"),this.host.prepend(e),this.canvas=e;let o=e.getContext("webgl2",{antialias:!1,alpha:!1,powerPreference:"high-performance"});if(!o)return void this.host.classList.add("no-gl");this.gl=o,e.addEventListener("webglcontextlost",e=>{e.preventDefault(),this.gl=null,this.ready=!1,this.lost=!0,cancelAnimationFrame(this.raf),this.raf=0,this.visible&&setTimeout(()=>this.visible&&this.lost&&this.rebuild(),100)},{once:!0});let a=o.createProgram(),t=[[o.VERTEX_SHADER,s],[o.FRAGMENT_SHADER,this.frag]].map(([e,t])=>{let s=o.createShader(e);return o.shaderSource(s,t),o.compileShader(s),o.attachShader(a,s),s});o.linkProgram(a);let i=o.getExtension("KHR_parallel_shader_compile"),r=()=>{this.gl!==o||this.disposed||(i&&!o.getProgramParameter(a,i.COMPLETION_STATUS_KHR)?requestAnimationFrame(r):this.link(o,a,t))};i?requestAnimationFrame(r):r()}link(e,o,a){if(!e.getProgramParameter(o,e.LINK_STATUS)){for(let o of a)e.getShaderParameter(o,e.COMPILE_STATUS)||console.error(e.getShaderInfoLog(o));console.error(e.getProgramInfoLog(o));return}for(let a of(e.useProgram(o),e.bindVertexArray(e.createVertexArray()),h))this.u[a]=e.getUniformLocation(o,a);e.uniform2f(this.u.u_center,this.center[0],this.center[1]);let s={...t.PALETTE,...this.lights},[i,r,l,c]=[s.coral,s.gelo,s.anil,s.abismo].map(t.hexToRgb);e.uniform3f(this.u.u_c1,...i),e.uniform3f(this.u.u_c2,...r),e.uniform3f(this.u.u_c3,...l),e.uniform3f(this.u.u_c4,...c),this.ready=!0,this.resize(),this.visible&&!this.reduced&&this.loop()}rebuild(){this.lost=!1,this.canvas?.remove(),this.setup()}resize(){let e=this.gl;if(!e||!this.ready||!this.canvas)return;let o=Math.min(devicePixelRatio||1,2)*this.scale;this.canvas.width=Math.max(1,Math.round(this.host.clientWidth*o)),this.canvas.height=Math.max(1,Math.round(this.host.clientHeight*o)),e.viewport(0,0,this.canvas.width,this.canvas.height),e.uniform2f(this.u.u_res,this.canvas.width,this.canvas.height),e.uniform1f(this.u.u_dpr,o),this.frame()}frame(){let e=this.gl;if(!e||!this.ready)return;let o=1-Math.pow(.94,this.steps),a=1-Math.pow(.96,this.steps);this.mouse[0]+=(this.target[0]-this.mouse[0])*o,this.mouse[1]+=(this.target[1]-this.mouse[1])*o,this.hover+=(this.hoverTarget-this.hover)*a;let t=this.reduced?this.still:(performance.now()-this.t0)/1e3+this.still;e.uniform1f(this.u.u_time,t),e.uniform2f(this.u.u_mouse,this.mouse[0],this.mouse[1]),e.uniform1f(this.u.u_hover,this.hover),e.drawArrays(e.TRIANGLES,0,3)}loop(){if(this.raf||!this.ready)return;let e=o=>{this.raf=0,this.visible&&(o-this.last>=this.frameMs&&(this.last=o,this.frame()),this.raf=requestAnimationFrame(e))};this.raf=requestAnimationFrame(e)}dispose(){for(let e of(this.disposed=!0,cancelAnimationFrame(this.raf),this.raf=0,this.visible=!1,this.cleanups))e();this.gl?.getExtension("WEBGL_lose_context")?.loseContext(),this.canvas?.remove()}}e.s(["ShaderStage",0,function({kind:e,className:t,dpr:s=.5,center:i,fps:r,lights:l,children:c,id:n}){let m=(0,a.useRef)(null);return(0,a.useEffect)(()=>{let o=new x(m.current,A[e],{dpr:s,center:i,fps:r,lights:l});return()=>o.dispose()},[e,s,i,r,l]),(0,o.jsx)("div",{ref:m,className:t,id:n,children:c})}],456709)}]);

//# debugId=7e5a3e44-a83d-837b-35c5-e75a5c0efa9c