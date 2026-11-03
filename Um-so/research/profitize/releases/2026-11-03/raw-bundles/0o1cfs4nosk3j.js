;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="1e4f67ea-876e-7781-96a8-6861c7229a76")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,776882,e=>{"use strict";var t=e.i(193344);let a=`#version 300 es
precision mediump float;

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

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${t.s}
${t.A}
${t.B}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  // u_contour is applied in 2 separate ranges:
  // - 0 to .4 sets the edge hardness, saturated above .4 (both branches below)
  // - .5 to 1 warps the stripes direction along the edges, inactive below .5 (see u_contour range 2)
  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  // u_contour range 2
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${t.G}

  fragColor = vec4(color, opacity);
}
`;e.s(["M",0,{none:0,circle:1,daisy:2,diamond:3,metaballs:4},"A",0,a,"e",0,function(e){let t=document.createElement("canvas"),a=t.getContext("2d"),o="string"==typeof e&&e.startsWith("blob:");return new Promise((r,i)=>{if(!e||!a)return void i(Error("Invalid file or canvas context"));let n=o&&fetch(e).then(e=>e.headers.get("Content-Type")),s=new Image;s.crossOrigin="anonymous";let l=performance.now();s.onload=async()=>{let o,l=await n;o=l?"image/svg+xml"===l:"string"==typeof e?e.endsWith(".svg")||e.startsWith("data:image/svg+xml"):"image/svg+xml"===e.type;let u=s.width||s.naturalWidth,c=s.height||s.naturalHeight;if(o){let e=u/c;u>c?(u=4096,c=4096/e):(c=4096,u=4096*e),s.width=u,s.height=c}let d=512/Math.min(u,c),f=Math.round(u*d),p=Math.round(c*d);t.width=u,t.height=c;let m=document.createElement("canvas");m.width=f,m.height=p;let g=m.getContext("2d");g.drawImage(s,0,0,f,p);let h=performance.now(),_=g.getImageData(0,0,f,p).data,v=new Uint8Array(f*p),w=new Uint8Array(f*p),y=0;for(let e=0,t=0;e<_.length;e+=4,t++){let a=+(0!==_[e+3]);v[t]=a,y+=a}let x=[],b=[];for(let e=0;e<p;e++)for(let t=0;t<f;t++){let a=e*f+t;if(v[a])0!==t&&t!==f-1&&0!==e&&e!==p-1&&v[a-1]&&v[a+1]&&v[a-f]&&v[a+f]&&v[a-f-1]&&v[a-f+1]&&v[a+f-1]&&v[a+f+1]?b.push(a):(w[a]=1,x.push(a))}let k=function(e,t,a,o,r){let i=t.length,n=new Int32Array(4*i);for(let a=0;a<i;a++){let i=t[a],s=i%o,l=Math.floor(i/o);n[4*a+0]=s<o-1&&e[i+1]?i+1:-1,n[4*a+1]=s>0&&e[i-1]?i-1:-1,n[4*a+2]=l>0&&e[i-o]?i-o:-1,n[4*a+3]=l<r-1&&e[i+o]?i+o:-1}return{interiorPixels:t,boundaryPixels:a,pixelCount:i,neighborIndices:n}}(v,new Uint32Array(b),new Uint32Array(x),f,p),U=performance.now(),S=function(e,t,a){let o=new Float32Array(t*a),{interiorPixels:r,neighborIndices:i,pixelCount:n}=e,s=performance.now(),l=[],u=[];for(let e=0;e<n;e++){let a=r[e];(a%t+Math.floor(a/t))%2==0?l.push(e):u.push(e)}for(let e=0;e<40;e++){for(let e of l){let t=r[e],a=i[4*e+0],n=i[4*e+1],s=i[4*e+2],l=i[4*e+3],u=0;a>=0&&(u+=o[a]),n>=0&&(u+=o[n]),s>=0&&(u+=o[s]),l>=0&&(u+=o[l]);let c=(.01+u)/4;o[t]=1.9*c+(1-1.9)*o[t]}for(let e of u){let t=r[e],a=i[4*e+0],n=i[4*e+1],s=i[4*e+2],l=i[4*e+3],u=0;a>=0&&(u+=o[a]),n>=0&&(u+=o[n]),s>=0&&(u+=o[s]),l>=0&&(u+=o[l]);let c=(.01+u)/4;o[t]=1.9*c+(1-1.9)*o[t]}}0;return o}(k,f,p);let B=0;for(let e=0;e<b.length;e++){let t=b[e];S[t]>B&&(B=S[t])}let I=document.createElement("canvas");I.width=f,I.height=p;let C=I.getContext("2d"),D=C.createImageData(f,p);for(let e=0;e<p;e++)for(let t=0;t<f;t++){let a=e*f+t,o=4*a;if(v[a]){let e=255*(1-S[a]/B);D.data[o]=e,D.data[o+1]=e,D.data[o+2]=e,D.data[o+3]=255}else D.data[o]=255,D.data[o+1]=255,D.data[o+2]=255,D.data[o+3]=0}C.putImageData(D,0,0),a.imageSmoothingEnabled=!0,a.imageSmoothingQuality="high",a.drawImage(I,0,0,f,p,0,0,u,c);let R=a.getImageData(0,0,u,c),T=document.createElement("canvas");T.width=u,T.height=c;let V=T.getContext("2d");V.drawImage(s,0,0,u,c);let M=V.getImageData(0,0,u,c);for(let e=0;e<R.data.length;e+=4){let t=M.data[e+3],a=R.data[e+3];0===t?(R.data[e]=255,R.data[e+1]=0):(R.data[e]=0===a?0:R.data[e],R.data[e+1]=t),R.data[e+2]=255,R.data[e+3]=255}a.putImageData(R,0,0),t.toBlob(e=>{if(!e)return void i(Error("Failed to create PNG blob"));0;r({imageData:R,pngBlob:e})},"image/png")},s.onerror=()=>i(Error("Failed to load image")),s.src="string"==typeof e?e:URL.createObjectURL(e)})}])},972109,494108,e=>{"use strict";let t;var a=e.i(843476),o=e.i(271645),r=e.i(926726),i=e.i(776882),n=e.i(221449),s=e.i(131967),l=e.i(165298);function u(){let e=async e=>{let t=await createImageBitmap(e),a=t.width,o=t.height,r=512/Math.min(a,o),i=Math.round(a*r),n=Math.round(o*r),s=new OffscreenCanvas(a,o),l=s.getContext("2d"),u=new OffscreenCanvas(i,n).getContext("2d");u.drawImage(t,0,0,i,n);let c=u.getImageData(0,0,i,n).data,d=new Uint8Array(i*n);for(let e=0,t=0;e<c.length;e+=4,t++)d[t]=+(0!==c[e+3]);let f=[];for(let e=0;e<n;e++)for(let t=0;t<i;t++){let a=e*i+t;d[a]&&0!==t&&t!==i-1&&0!==e&&e!==n-1&&d[a-1]&&d[a+1]&&d[a-i]&&d[a+i]&&d[a-i-1]&&d[a-i+1]&&d[a+i-1]&&d[a+i+1]&&f.push(a)}let p=((e,t,a,o)=>{let r=new Float32Array(a*o),i=e.length,n=new Int32Array(4*i),s=[],l=[];for(let r=0;r<i;r++){let i=e[r],u=i%a,c=Math.floor(i/a);n[4*r]=u<a-1&&t[i+1]?i+1:-1,n[4*r+1]=u>0&&t[i-1]?i-1:-1,n[4*r+2]=c>0&&t[i-a]?i-a:-1,n[4*r+3]=c<o-1&&t[i+a]?i+a:-1,((u+c)%2==0?s:l).push(r)}let u=t=>{for(let a of t){let t=e[a],o=0;for(let e=0;e<4;e++){let t=n[4*a+e];t>=0&&(o+=r[t])}r[t]=(.01+o)/4*1.9+(1-1.9)*r[t]}};for(let e=0;e<40;e++)u(s),u(l);return r})(new Uint32Array(f),d,i,n),m=0;for(let e=0;e<f.length;e++)p[f[e]]>m&&(m=p[f[e]]);let g=new OffscreenCanvas(i,n),h=g.getContext("2d"),_=h.createImageData(i,n);for(let e=0;e<i*n;e++){let t=4*e;if(d[e]){let a=255*(1-p[e]/m);_.data[t]=_.data[t+1]=_.data[t+2]=a,_.data[t+3]=255}else _.data[t]=_.data[t+1]=_.data[t+2]=255,_.data[t+3]=0}h.putImageData(_,0,0),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality="high",l.drawImage(g,0,0,i,n,0,0,a,o);let v=l.getImageData(0,0,a,o),w=new OffscreenCanvas(a,o).getContext("2d");w.drawImage(t,0,0,a,o);let y=w.getImageData(0,0,a,o).data;t.close();for(let e=0;e<v.data.length;e+=4){let t=y[e+3];0===t?(v.data[e]=255,v.data[e+1]=0):(v.data[e]=0===v.data[e+3]?0:v.data[e],v.data[e+1]=t),v.data[e+2]=255,v.data[e+3]=255}return l.putImageData(v,0,0),s.convertToBlob({type:"image/png"})};self.onmessage=async t=>{let{id:a,png:o}=t.data;try{self.postMessage({id:a,png:await e(o)})}catch(e){self.postMessage({id:a,error:String(e)})}}}var c=e.i(210270),d=e.i(22707);function f(e){if("p"===e.type){let e=512/1201,t=new OffscreenCanvas(Math.round(512/1201*1206),512),a=t.getContext("2d");return a.fillStyle="#fff",a.scale(e,e),(0,l.K)(a),t}if("word"===e.type){let t="900 400px Satoshi",a=new OffscreenCanvas(1,1).getContext("2d");a.font=t,a.letterSpacing="-8px";let o=new OffscreenCanvas(Math.ceil(a.measureText(e.text).width)+160,560),r=o.getContext("2d");return r.font=t,r.fillStyle="#fff",r.textBaseline="middle",r.letterSpacing="-8px",r.fillText(e.text,80,o.height/2+14),o}let t=Math.round((e.width??200)*4),a=Math.round((e.height??56)*4),o=new OffscreenCanvas(t,a),r=o.getContext("2d");r.fillStyle="#fff",r.beginPath(),r.roundRect(0,0,t,a,a/2),r.fill();let i=4*e.ring;return r.globalCompositeOperation="destination-out",r.beginPath(),r.roundRect(i,i,t-2*i,a-2*i,a/2-i),r.fill(),o}async function p(e){await document.fonts.load("900 400px Satoshi");let t=f({type:"word",text:e}),a=await t.convertToBlob({type:"image/png"});return{url:URL.createObjectURL(a),width:t.width,height:t.height}}let m=0,g=new Map;async function h(e){let a=function(){if(void 0!==t)return t;if(t=null,"u"<typeof Worker||"u"<typeof OffscreenCanvas||"u"<typeof createImageBitmap)return null;try{let e=URL.createObjectURL(new Blob([`(${u})()`],{type:"text/javascript"}));(t=new Worker(e)).onmessage=e=>{let t=g.get(e.data.id);g.delete(e.data.id),e.data.png?t?.resolve(e.data.png):t?.reject(Error(e.data.error))},t.onerror=()=>{for(let e of(t=null,g.values()))e.reject(Error("liquid-metal worker"));g.clear()}}catch{t=null}return t}();if(a)try{return await new Promise((t,o)=>{let r=m++;g.set(r,{resolve:t,reject:o}),a.postMessage({id:r,png:e})})}catch{}let{pngBlob:o}=await (0,i.e)(new File([e],"mask.png",{type:"image/png"}));return o}let _=new Map,v=Promise.resolve();async function w(e,t,a={}){var o;let l,u,p;"ring"!==t.type||t.width||(t={...t,width:e.offsetWidth,height:e.offsetHeight});let m=await (u="p"===(l=o=t).type?"p":"word"===l.type?`word:${l.text}`:`ring:${l.width}x${l.height}:${l.ring}`,!(p=_.get(u))&&(v=(p=v.then(async()=>{"word"===o.type&&await document.fonts.load("900 400px Satoshi");let e=await f(o).convertToBlob({type:"image/png"}),t=await h(e),a=new Image;return a.src=URL.createObjectURL(t),await a.decode(),await new Promise(e=>setTimeout(e,0)),a})).catch(()=>{}),_.set(u,p)),p);if(!e.isConnected)return()=>{};let g=new r.f(e,i.A,{u_colorBack:(0,n.f)("rgba(0,0,0,0)"),u_colorTint:(0,n.f)(d.t.gelo),u_image:m,u_isImage:!0,u_shape:i.M.none,u_repetition:a.repetition??2,u_softness:a.softness??.1,u_shiftRed:a.shiftRed??.3,u_shiftBlue:a.shiftBlue??.3,u_distortion:a.distortion??.07,u_contour:a.contour??.4,u_angle:a.angle??70,u_fit:s.f.contain,u_scale:a.scale??1,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0},void 0,matchMedia("(prefers-reduced-motion: reduce)").matches?0:a.speed??1,0,2,void 0,["u_image"]);return e.classList.add("is-ready"),()=>{(0,c.Z)(g),e.classList.remove("is-ready")}}e.s(["a",0,w,"b",0,p],494108),e.s(["Metal",0,function({shape:e,className:t,lazy:r,...i}){let n=(0,o.useRef)(null);return(0,o.useEffect)(()=>{let t,a=n.current,o=!0,s=!1,l=!1,u=!1,d=!1,f=()=>{l||t||(s=!0,l=!0,u=!1,w(a,e,i).then(e=>{if(l=!1,!o)return e();t=e;let r=a.querySelector("canvas");r&&(0,c.S)(r,()=>{if(!o||!t)return;let e=t;t=void 0,e(),u=!0,d&&f()})}).catch(e=>{l=!1,console.error(e)}))},p=r?void 0:setTimeout(f,250),m=new IntersectionObserver(([e])=>{(d=e.isIntersecting)&&(u||r&&!s)&&f()},{rootMargin:r?"400px":"0px"});return m.observe(a),()=>{o=!1,clearTimeout(p),m.disconnect();let e=t;t=void 0,e?.()}},[]),(0,a.jsx)("span",{ref:n,className:["metal",t].filter(Boolean).join(" "),"aria-hidden":"true"})}],972109)},995008,164032,e=>{"use strict";let t;var a=e.i(271645);let o=e=>"user"===e.status&&(e.admin||"max"===e.quota.plan||"lifetime"===e.quota.plan),r=(e,t)=>"user"===t.status&&("free"===e.access||("pro"===e.access?t.quota.paid:o(t))),i=e=>"user"===e.status?e.done:new Set;e.s(["V",0,r,"O",0,e=>"user"===e.status&&e.quota.paid&&!e.quota.week&&!e.admin,"K",0,i,"F",0,o,"e",0,e=>"user"===e.status&&e.quota.paid,"N",0,function(e,t){let a=i(t);return e.flatMap(e=>e.lessons).filter(e=>"free"===e.access||r(e,t)).find(e=>!a.has(e.id))??null},"m",0,function(e,t){let a=i(t),o=e.filter(e=>a.has(e.id)).length;return{done:o,total:e.length,ratio:e.length?o/e.length:0}}],164032);var n=e.i(93209),s=e.i(36289),l=e.i(306552),u=e.i(921638),c=e.i(927639);let d=()=>t??=e.A(126210).then(e=>e.browserClient()),f={account:{status:"loading"},gate:null},p=new Set,m=e=>{f={...f,...e},p.forEach(e=>e())},g=new Map,h=!1;async function _(){var t;let a,o,r,i,n,s={status:"off"};if("user"===s.status)return m({account:s});let l=await d();if(!l)return m({account:s});let{data:u}=await l.auth.getSession(),f=u.session;if(!f)return m({account:{status:"anon"}});let{user:p}=f,[h,_,v,w]=await Promise.all([(t=f.access_token,!(a=g.get(t))&&(a=Promise.all([l.auth.getUser(t),e.A(731002)]).then(([{error:e},{isAuthSessionMissingError:t}])=>!t(e),()=>!0),g.set(t,a),a.then(e=>e&&g.delete(t))),a),l.rpc("copy_quota"),l.from("copies").select("item_id").eq("user_id",p.id),l.from("lesson_progress").select("lesson_id")]);if(!h)return m({account:{status:"anon"}});let{name:y,avatar_url:x}=(o=p.user_metadata??{},r=p.email??"",i=e=>"string"==typeof e?e.trim():"",n=[o.avatar_url,o.picture].map(i).find(e=>e.startsWith("https://")),{name:i(o.full_name)||i(o.name)||r.split("@")[0],avatar_url:n??null});m({account:{status:"user",id:p.id,email:p.email??"",name:y,avatar:x,quota:_.data??c.B,copied:new Set((v.data??[]).map(e=>e.item_id).filter(Boolean)),done:new Set((w.data??[]).map(e=>e.lesson_id)),admin:_.data?.admin===!0}})}let v=(e,t,a=0)=>({used:0,limit:1,plan:e,paid:!0,week:{used:a,limit:t,next_at:a>=t?new Date(Date.now()+1728e5).toISOString():null}});async function w(){if(h)return;h=!0,_();let e=await d();e&&(e.auth.onAuthStateChange(e=>{("SIGNED_IN"===e||"SIGNED_OUT"===e||"USER_UPDATED"===e)&&_()}),document.addEventListener("visibilitychange",async()=>{if("visible"!==document.visibilityState||"user"!==f.account.status)return;let{data:t}=await e.auth.getSession();t.session||m({account:{status:"anon"}})}))}c.B,v("pro",u.h.pro),v("pro",u.h.pro,u.h.pro),v("pro",0),v("max",u.h.max),v("lifetime",u.h.lifetime),c.B;let y={account:{status:"loading"},gate:null};function x(){return(0,a.useSyncExternalStore)(e=>(w(),p.add(e),()=>p.delete(e)),()=>f,()=>y)}let b=e=>m({gate:e}),k="assinar";async function U(e,t,a,o){let r=f.account,i=a||!t?t:`${t}?${k}=1`;if("anon"===r.status||"off"===r.status)return b({reason:"login",next:i,free:a}),{ok:!1,reason:"auth"};let l=fetch((0,n.x)("/api/copy"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({itemId:e})}).then(e=>e.json()).catch(()=>({ok:!1,reason:"error"})),u=l.then(e=>e.ok?e.bundle.prompt:Promise.reject(e)),c=!1;try{"u">typeof ClipboardItem&&navigator.clipboard?.write?await navigator.clipboard.write([new ClipboardItem({"text/plain":u.then(e=>new Blob([e],{type:"text/plain"}))})]):await navigator.clipboard.writeText(await u),c=!0}catch{}let d=await l;return d.ok?(c||(c=await navigator.clipboard.writeText(d.bundle.prompt).then(()=>!0,()=>!1)),d.clipboard=c,"user"!==r.status||r.copied.has(e)||(0,s.f)({name:"Cópia",data:{item:t?.split("/").pop()??e,conta:d.quota.paid?"pro":"gratis"}},o),"user"===r.status&&m({account:{...r,quota:d.quota,copied:new Set(r.copied).add(e)}})):"limit"===d.reason||"pro"===d.reason||"week"===d.reason?("user"===r.status&&d.quota&&m({account:{...r,quota:d.quota}}),b({reason:d.reason,slug:"limit"===d.reason?void 0:t?.split("/").pop()})):"auth"===d.reason&&b({reason:"login",next:i,free:a}),d}async function S(e,t){let a=f.account;if("user"!==a.status)return;let o=new Set(a.done);t?o.add(e):o.delete(e),m({account:{...a,done:o}});let r=await d();if(!r){try{sessionStorage.setItem("como-feitas",JSON.stringify([...o]))}catch{}return}let{error:i}=t?await r.from("lesson_progress").upsert({lesson_id:e},{onConflict:"user_id,lesson_id",ignoreDuplicates:!0}):await r.from("lesson_progress").delete().eq("lesson_id",e),n=f.account;i&&"user"===n.status&&m({account:{...n,done:a.done}})}async function B(e,t){let a=await d();if(!a){let e=f.account;return"user"!==e.status?{ok:!1,reason:"auth"}:"max"!==t||e.admin||"max"===e.quota.plan||"lifetime"===e.quota.plan?"pro"!==t||e.quota.paid?{ok:!0,url:""}:{ok:!1,reason:"pro"}:{ok:!1,reason:"max"}}let{data:o,error:r}=await a.rpc("lesson_video",{p_lesson:e});return r||!o?{ok:!1,reason:"error"}:o}let I=e=>`aula:${e}`;async function C(e,t=21600){let a=Object.fromEntries(e.map(e=>[e,null])),o=Date.now(),r=[];for(let t of e){try{let e=JSON.parse(sessionStorage.getItem(I(t))??"null");if(e&&e.exp-o>.2*e.ttl){a[t]=e.url;continue}}catch{}r.push(t)}if(0===r.length)return a;let i=await d();if(!i)return a;let{data:n,error:s}=await i.storage.from("aulas").createSignedUrls(r,t);if(s||!n)return a;for(let e of n)if(e.path&&!e.error&&e.signedUrl){a[e.path]=e.signedUrl;try{sessionStorage.setItem(I(e.path),JSON.stringify({url:e.signedUrl,exp:o+1e3*t,ttl:1e3*t}))}catch{}}return a}async function D(e,t){let a=f.account,r=()=>b({reason:"max",next:t,slug:e.slug});if("anon"===a.status||"off"===a.status||"user"===a.status&&!o(a))return r(),{ok:!1,reason:"user"===a.status?"max":"auth"};let i=await d();if(!i)return{ok:!1,reason:"error"};let{data:n,error:s}=await i.rpc("skill_download",{p_item:e.id});if(s?.code==="42501")return r(),{ok:!1,reason:"auth"};if(s||!n)return{ok:!1,reason:"error"};if(!n.ok)return"not_found"!==n.reason&&r(),n;let u=await i.storage.from("bundles").createSignedUrl(n.path,60,{download:n.name});return u.error||!u.data?{ok:!1,reason:"error"}:((0,l.y)("Skill baixada",{item:e.slug,area:e.niche??""}),location.assign(u.data.signedUrl),{ok:!0})}function R(){return"loading"!==f.account.status?Promise.resolve(f.account):(w(),new Promise(e=>{let t=()=>{"loading"!==f.account.status&&(p.delete(t),e(f.account))};p.add(t)}))}let T=e=>"user"===e.status&&(e.quota.paid||e.admin);async function V(){if("user"!==(await R()).status)return{ok:!1,reason:"auth"};let e=await d();if(!e)return{ok:!1,reason:"error"};let{data:t,error:a}=await e.rpc("raio_x_quota");return a?{ok:!1,reason:"42501"===a.code?"auth":"error"}:t}async function M(e,t,a){if("user"!==f.account.status)return!1;let o=await d();if(!o)return!1;let{data:r,error:i}=await o.rpc("raio_x_save",{p_id:e,p_score:t,p_result:a});return!i&&!0===r}async function O(){if("user"!==(await R()).status)return[];let e=await d();if(!e)return[];let{data:t}=await e.from("site_scans").select("id, url, host, score, created_at").not("saved_at","is",null).order("created_at",{ascending:!1}).limit(30);return t??[]}async function A(e){let t=await d();if(!t)return null;let{data:a}=await t.from("site_scans").select("result").eq("id",e).maybeSingle();return a?.result??null}e.s(["B",0,k,"w",0,()=>m({gate:null}),"y",0,U,"m",0,D,"g",0,B,"z",0,(e=location.pathname.slice(n.z.length)||"/")=>(0,n.x)(`/entrar?next=${encodeURIComponent(e)}`),"O",0,b,"s",0,T,"l",0,O,"p",0,V,"H",0,M,"x",0,A,"f",0,function(){"user"===f.account.status&&_()},"e",0,S,"L",0,C,"h",0,function(e,t,a){let r=r=>"user"===r.status&&o(r)?((0,l.y)("Design system",{item:e,modo:a}),!0):(b({reason:"max",next:t,slug:e,tool:"design-system"}),!1);return"loading"===f.account.status?R().then(r):r(f.account)},"r",0,function(e,t){let a=a=>"user"!==a.status?(b({reason:"login",next:"/raio-x",slug:"raio-x",tool:"raio-x"}),!1):T(a)?((0,l.y)("Raio-X correção",{ponto:e,modo:t}),!0):(b({reason:"pro",next:"/raio-x",slug:"raio-x",tool:"raio-x"}),!1);return"loading"===f.account.status?R().then(a):a(f.account)},"Z",0,()=>x().account,"i",0,x],995008)},36289,e=>{"use strict";function t(){return"u">typeof window}function a(){return(t()?window.vam:"production")||"production"}function o(){return"production"===a()}var r=e.i(306552);e.s(["f",0,function(e,i){try{!function(e,r){var i,n;if(!t()){let e="[Vercel Web Analytics] Please import `track` from `@vercel/analytics/server` when using this function in a server environment";if(o())console.warn(e);else throw Error(e);return}if(!r){null==(i=window.va)||i.call(window,"event",{name:e,options:void 0});return}try{let t=function(e,t){if(!e)return;let a=e,o=[];for(let[r,i]of Object.entries(e))"object"==typeof i&&null!==i&&(t.strip?a=function(e,{[e]:t,...a}){return a}(r,a):o.push(r));if(o.length>0&&!t.strip)throw Error(`The following properties are not valid: ${o.join(", ")}. Only strings, numbers, booleans, and null are allowed.`);return a}(r,{strip:o()});null==(n=window.va)||n.call(window,"event",{name:e,data:t,options:void 0})}catch(e){e instanceof Error&&"development"===a()&&console.error(e)}}(e.name,e.data)}catch{}(0,r.y)(e.name,{...e.data,...i})}],36289)},165298,e=>{"use strict";let t=["m29.77 989.87l145.24-375.47h748.11l0.14 33.03c0 83.98-61.01 156.21-140.91 156.21h-374.18l-76.28 186.23h-302.03z","m253.29 372.87h99.29l1.37-170.87h0.23 595.83c131.91 0 237.31 102.43 237.31 243.6 0 37.45-8.63 78.4-28.37 107.97-33.34 49.13-84.6 61-118.77 61h-116.91v-142.99c0-27.57-21.51-37.44-41.43-37.44h-700.9c-0.01 0-1.8-59.63 72.35-61.27z"];e.s(["v",0,t,"K",0,function(e){for(let a of(e.save(),e.translate(120,120),e.scale(.8,.8),t))e.fill(new Path2D(a));e.restore()}])},921638,e=>{"use strict";let t={proMonthly:49.9,maxMonthly:69.9,lifetime:247,item:37},a={proMonthly:70.9,maxMonthly:99.9,lifetime:497},o=new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});encodeURIComponent("Oi! Vim pelo site da ProfitizeBuild.");let r=new Intl.NumberFormat("pt-BR"),i=new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});e.s(["H",0,{proMonthly:39.9,maxMonthly:59.9},"p",0,{proMonthly:"https://pay.kirvano.com/eea270c0-ccb1-48f9-8c1a-6957bbce4051",maxMonthly:"https://pay.kirvano.com/b4dbf0ee-4013-4464-b71a-ae76b989260d",lifetime:"https://pay.kirvano.com/ffaf76ba-2023-4ffe-b04d-dc26fdf2eaae",item:"https://pay.kirvano.com/2055fd5d-1199-4e0b-8ffd-0af61571f739",proCaro:"https://pay.kirvano.com/f6b6c712-27a5-4ead-b175-0a9b17f4e618",maxCaro:"https://pay.kirvano.com/3be9ca38-daa8-4a73-a0ac-642b93af2f5b"},"h",0,{pro:5,max:15,lifetime:30},"o",0,a,"x",0,"2026-11-30T23:59:59-03:00","r",0,t,"O",0,"Black November","i",0,{free:1,pro:5,max:null,lifetime:null},"d",0,"ola@profitize.com.br","k",0,()=>Date.now()<=Date.parse("2026-11-25T23:59:59-03:00"),"l",0,(e,t=!1)=>(t?i:r).format(e),"Z",0,e=>new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"2-digit"}).format(new Date(e)),"Y",0,e=>Math.round((1-t[e]/a[e])*100),"R",0,function(e){let t=new Date(6e4*Math.ceil(Date.parse(e)/6e4)),a=Object.fromEntries(o.formatToParts(t).map(e=>[e.type,e.value]));return`${a.weekday.replace("-feira","")}, ${a.day}/${a.month}, \xe0s ${a.hour}h${"00"===a.minute?"":a.minute}`},"F",0,()=>Date.now()<=Date.parse("2026-11-27T23:59:59-03:00")])},306552,749708,e=>{"use strict";function t(){let e=document.documentElement;if(e.hasAttribute("data-previa-meta"))return!0;let t="";try{t=new URL(document.referrer).hostname}catch{}let a=/(^|\.)facebook\.com$/.test(t)&&"America/Los_Angeles"===Intl.DateTimeFormat().resolvedOptions().timeZone&&!/^pt/i.test(navigator.language);return a&&(e.dataset.previaMeta=""),a}let a=/(^|\.)facebook\.com$/;function o(e){if(!e)return!1;let{$referring_domain:t,$timezone:o,$browser_language:r}=e,i="string"==typeof t&&a.test(t)&&"America/Los_Angeles"===o&&"string"==typeof r&&!/^pt/i.test(r);return i&&(document.documentElement.dataset.previaMeta=""),i}e.s(["U",0,t,"d",0,o],749708);let r="phc_uYMAGLP3Uz89x4n6vLUAsDrFAnvqGKGmnk9FAr5vaKM4",i=null,n=!1,s=[];function l(e){i?e(i):s.push(e)}let u=["ultimo_toque_origem","ultimo_toque_midia","ultimo_toque_campanha","ultimo_toque_conteudo","ultimo_toque_em"];e.s(["y",0,function(e,t,a){l(o=>o.capture(e,t,a))},"n",0,function(){if(i)return i.get_distinct_id();try{let e=JSON.parse(localStorage.getItem(`ph_${r}_posthog`)??"null");return"string"==typeof e?.distinct_id?e.distinct_id:null}catch{return null}},"W",0,function(e){l(t=>{t.get_distinct_id()!==e&&t.identify(e)})},"f",0,function(e){let t=new URLSearchParams(e),a=t.get("utm_source")??(t.get("fbclid")?"meta":null);l(e=>{if(a)return void e.register({ultimo_toque_origem:a,ultimo_toque_midia:t.get("utm_medium")??(t.get("fbclid")?"paid":null),ultimo_toque_campanha:t.get("utm_campaign"),ultimo_toque_conteudo:t.get("utm_content"),ultimo_toque_em:new Date().toISOString()});let o=e.get_property("ultimo_toque_em");if(o&&Date.now()-Date.parse(o)>2592e6)for(let t of u)e.unregister(t)})},"M",0,function(){l(e=>e.reset())},"x",0,function(){if(n)return;n=!0;let a=()=>e.A(604435).then(({default:e})=>{if(!t())for(let a of(e.init(r,{api_host:"https://profitize-build.vercel.app/ingest",ui_host:"https://us.posthog.com",persistence:"localStorage",person_profiles:"identified_only",autocapture:!1,capture_pageview:!1,capture_pageleave:!1,rageclick:!1,capture_dead_clicks:!1,capture_heatmaps:!1,capture_performance:!1,capture_exceptions:!1,disable_session_recording:!0,disable_surveys:!0,disable_product_tours:!0,disable_conversations:!0,disable_web_experiments:!0,disable_external_dependency_loading:!0,advanced_disable_feature_flags:!0,before_send:e=>t()||o(e?.properties)?null:e}),i=e,s.splice(0)))a(e)});"complete"===document.readyState?a():window.addEventListener("load",()=>void a(),{once:!0})}],306552)}]);

//# debugId=1e4f67ea-876e-7781-96a8-6861c7229a76