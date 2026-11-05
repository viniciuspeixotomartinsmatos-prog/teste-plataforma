;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="fee4e786-4586-0e7a-b128-a43b152b3b75")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,221449,e=>{"use strict";let t=(e,t,i)=>Math.min(Math.max(e,t),i),i=[.5,.5,.5,1];e.s(["getShaderColorFromString",0,function(e){if(Array.isArray(e))return 4===e.length?e:3===e.length?[...e,1]:i;if("string"!=typeof e)return i;let r,o,a,s=1;if(e.startsWith("#")){var n;(3===(n=(n=e).replace(/^#/,"")).length||4===n.length)&&(n=n.split("").map(e=>e+e).join("")),6===n.length&&(n+="ff"),[r,o,a,s]=/^[0-9a-f]{8}$/i.test(n)?[parseInt(n.slice(0,2),16)/255,parseInt(n.slice(2,4),16)/255,parseInt(n.slice(4,6),16)/255,parseInt(n.slice(6,8),16)/255]:(console.warn("Invalid hex color"),i)}else if(e.startsWith("rgb")){let t,n=(t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(t[1]??"0")/255,parseInt(t[2]??"0")/255,parseInt(t[3]??"0")/255,void 0===t[4]?1:parseFloat(t[4])]:null;if(null===n)return i;[r,o,a,s]=n}else{let t;if(!e.startsWith("hsl"))return console.error("Unsupported color format",e),i;let n=(t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(t[1]??"0"),parseInt(t[2]??"0"),parseInt(t[3]??"0"),void 0===t[4]?1:parseFloat(t[4])]:null;if(null===n)return i;[r,o,a,s]=function(e){let t,i,r,[o,a,s,n]=e,l=o/360,u=a/100,h=s/100;if(0===a)t=i=r=h;else{let e=(e,t,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6)?e+(t-e)*6*i:i<.5?t:i<2/3?e+(t-e)*(2/3-i)*6:e,o=h<.5?h*(1+u):h+u-h*u,a=2*h-o;t=e(a,o,l+1/3),i=e(a,o,l),r=e(a,o,l-1/3)}return[t,i,r,n]}(n)}return[t(r,0,1),t(o,0,1),t(a,0,1),t(s,0,1)]}])},926726,e=>{"use strict";let t=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,i=8294400;class r{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")})();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(e,t,r,o,s=0,n=0,l=2,u=i,h=[]){if(e?.nodeType===1)this.parentElement=e;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=e.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){const e=this.ownerDocument.createElement("style");e.innerHTML=a,e.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(e)}const d=this.ownerDocument.createElement("canvas");this.canvasElement=d,this.parentElement.prepend(d),this.fragmentShader=t,this.providedUniforms=r,this.mipmaps=h,this.currentFrame=n,this.minPixelRatio=l,this.maxPixelCount=u;const c=d.getContext("webgl2",o);if(!c)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=c,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(s),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let e=function(e,t,i){let r=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),a=r?r.precision:null;a&&a<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),i=i.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let s=o(e,e.VERTEX_SHADER,t),n=o(e,e.FRAGMENT_SHADER,i);if(!s||!n)return null;let l=e.createProgram();return l?(e.attachShader(l,s),e.attachShader(l,n),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS))?(e.detachShader(l,s),e.detachShader(l,n),e.deleteShader(s),e.deleteShader(n),l):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(l)),e.deleteProgram(l),e.deleteShader(s),e.deleteShader(n),null):null}(this.gl,t,this.fragmentShader);e&&(this.program=e)};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,"a_position"),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([t,i])=>{if(e[t]=this.gl.getUniformLocation(this.program,t),i instanceof HTMLImageElement){let i=`${t}AspectRatio`;e[i]=this.gl.getUniformLocation(this.program,i)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;intersectionObserver=null;isInViewport=!0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let t=e.devicePixelContentBoxSize?.[0];void 0!==t&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=t.inlineSize,this.parentDevicePixelHeight=t.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};setupIntersectionObserver=()=>{let e=this.ownerDocument.defaultView;e?.IntersectionObserver&&(this.intersectionObserver=new e.IntersectionObserver(([e])=>{this.isInViewport=e?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,t=0,i=Math.max(1,window.devicePixelRatio),r=visualViewport?.scale??1;if(this.devicePixelsSupported){let o=Math.max(1,this.minPixelRatio/i);e=this.parentDevicePixelWidth*o*r,t=this.parentDevicePixelHeight*o*r}else{var o;let a,s,n=Math.max(i,this.minPixelRatio)*r;this.isSafari&&(n*=Math.max(1,(o=this.ownerDocument,(s=Math.round(100*(a=outerWidth/((visualViewport?.scale??1)*(visualViewport?.width??window.innerWidth)+(window.innerWidth-o.documentElement.clientWidth)))))%5==0?s/100:33===s?1/3:67===s?2/3:133===s?4/3:a))),e=Math.round(this.parentWidth)*n,t=Math.round(this.parentHeight)*n}let a=Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(e*t)),s=Math.round(e*a),n=Math.round(t*a),l=s/Math.round(this.parentWidth);(this.canvasElement.width!==s||this.canvasElement.height!==n||this.renderScale!==l)&&(this.renderScale=l,this.canvasElement.width=s,this.canvasElement.height=n,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(null===this.program)return void console.warn("Tried to render before program or gl was initialized");let t=e-this.lastRenderTime;this.lastRenderTime=e,0!==this.currentSpeed&&(this.currentFrame+=t*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.currentSpeed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,t)=>{if(!t.complete||0===t.naturalWidth)throw Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let i=this.textures.get(e);i&&this.gl.deleteTexture(i),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let r=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+r);let o=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t),this.mipmaps.includes(e)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let a=this.gl.getError();if(a!==this.gl.NO_ERROR||null===o)return void console.error("Paper Shaders: WebGL error when uploading texture:",a);this.textures.set(e,o);let s=this.uniformLocations[e];if(s){this.gl.uniform1i(s,r);let i=`${e}AspectRatio`,o=this.uniformLocations[i];if(o){let e=t.naturalWidth/t.naturalHeight;this.gl.uniform1f(o,e)}}};areUniformValuesEqual=(e,t)=>e===t||!!(Array.isArray(e)&&Array.isArray(t))&&e.length===t.length&&e.every((e,i)=>this.areUniformValuesEqual(e,t[i]));setUniformValues=e=>{this.gl.useProgram(this.program),Object.entries(e).forEach(([e,t])=>{let i=t;if(t instanceof HTMLImageElement&&(i=`${t.src.slice(0,200)}|${t.naturalWidth}x${t.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[e],i))return;this.uniformCache[e]=i;let r=this.uniformLocations[e];if(!r)return void console.warn(`Uniform location for ${e} not found`);if(t instanceof HTMLImageElement)this.setTextureUniform(e,t);else if(Array.isArray(t)){let i=null,o=null;if(void 0!==t[0]&&Array.isArray(t[0])){let r=t[0].length;if(!t.every(e=>e.length===r))return void console.warn(`All child arrays must be the same length for ${e}`);i=t.flat(),o=r}else o=(i=t).length;switch(o){case 2:this.gl.uniform2fv(r,i);break;case 3:this.gl.uniform3fv(r,i);break;case 4:this.gl.uniform4fv(r,i);break;case 9:this.gl.uniformMatrix3fv(r,!1,i);break;case 16:this.gl.uniformMatrix4fv(r,!1,i);break;default:console.warn(`Unsupported uniform array length: ${o}`)}}else"number"==typeof t?this.gl.uniform1f(r,t):"boolean"==typeof t?this.gl.uniform1i(r,+!!t):console.warn(`Unsupported uniform type for ${e}: ${typeof t}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(e=1)=>{this.speed=e,this.updateCurrentSpeed()};updateCurrentSpeed=()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)};setCurrentSpeed=e=>{this.currentSpeed=e,null===this.rafId&&0!==e&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===e&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=i)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.updateCurrentSpeed()};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}function o(e,t,i){let r=e.createShader(t);return r?(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(r)),e.deleteShader(r),null):null}let a=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;e.s(["ShaderMount",0,r],926726)},131967,e=>{"use strict";e.s(["ShaderFitOptions",0,{none:0,contain:1,cover:2}])},193344,e=>{"use strict";let t=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,i=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,r=`
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`,o=`
  float randomR(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).r;
  }
`,a=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,s=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
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
`;e.s(["colorBandingFix",0,a,"declarePI",0,t,"proceduralHash11",0,r,"rotation2",0,i,"simplexNoise",0,s,"textureRandomizerR",0,o])},776882,e=>{"use strict";var t=e.i(193344);let i=`#version 300 es
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

${t.declarePI}
${t.rotation2}
${t.simplexNoise}

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

  ${t.colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;e.s(["LiquidMetalShapes",0,{none:0,circle:1,daisy:2,diamond:3,metaballs:4},"liquidMetalFragmentShader",0,i,"toProcessedLiquidMetal",0,function(e){let t=document.createElement("canvas"),i=t.getContext("2d"),r="string"==typeof e&&e.startsWith("blob:");return new Promise((o,a)=>{if(!e||!i)return void a(Error("Invalid file or canvas context"));let s=r&&fetch(e).then(e=>e.headers.get("Content-Type")),n=new Image;n.crossOrigin="anonymous";let l=performance.now();n.onload=async()=>{let r,l=await s;r=l?"image/svg+xml"===l:"string"==typeof e?e.endsWith(".svg")||e.startsWith("data:image/svg+xml"):"image/svg+xml"===e.type;let u=n.width||n.naturalWidth,h=n.height||n.naturalHeight;if(r){let e=u/h;u>h?(u=4096,h=4096/e):(h=4096,u=4096*e),n.width=u,n.height=h}let d=512/Math.min(u,h),c=Math.round(u*d),p=Math.round(h*d);t.width=u,t.height=h;let m=document.createElement("canvas");m.width=c,m.height=p;let g=m.getContext("2d");g.drawImage(n,0,0,c,p);let f=performance.now(),v=g.getImageData(0,0,c,p).data,x=new Uint8Array(c*p),_=new Uint8Array(c*p),b=0;for(let e=0,t=0;e<v.length;e+=4,t++){let i=+(0!==v[e+3]);x[t]=i,b+=i}let w=[],y=[];for(let e=0;e<p;e++)for(let t=0;t<c;t++){let i=e*c+t;if(x[i])0!==t&&t!==c-1&&0!==e&&e!==p-1&&x[i-1]&&x[i+1]&&x[i-c]&&x[i+c]&&x[i-c-1]&&x[i-c+1]&&x[i+c-1]&&x[i+c+1]?y.push(i):(_[i]=1,w.push(i))}let S=function(e,t,i,r,o){let a=t.length,s=new Int32Array(4*a);for(let i=0;i<a;i++){let a=t[i],n=a%r,l=Math.floor(a/r);s[4*i+0]=n<r-1&&e[a+1]?a+1:-1,s[4*i+1]=n>0&&e[a-1]?a-1:-1,s[4*i+2]=l>0&&e[a-r]?a-r:-1,s[4*i+3]=l<o-1&&e[a+r]?a+r:-1}return{interiorPixels:t,boundaryPixels:i,pixelCount:a,neighborIndices:s}}(x,new Uint32Array(y),new Uint32Array(w),c,p),R=performance.now(),U=function(e,t,i){let r=new Float32Array(t*i),{interiorPixels:o,neighborIndices:a,pixelCount:s}=e,n=performance.now(),l=[],u=[];for(let e=0;e<s;e++){let i=o[e];(i%t+Math.floor(i/t))%2==0?l.push(e):u.push(e)}for(let e=0;e<40;e++){for(let e of l){let t=o[e],i=a[4*e+0],s=a[4*e+1],n=a[4*e+2],l=a[4*e+3],u=0;i>=0&&(u+=r[i]),s>=0&&(u+=r[s]),n>=0&&(u+=r[n]),l>=0&&(u+=r[l]);let h=(.01+u)/4;r[t]=1.9*h+-.8999999999999999*r[t]}for(let e of u){let t=o[e],i=a[4*e+0],s=a[4*e+1],n=a[4*e+2],l=a[4*e+3],u=0;i>=0&&(u+=r[i]),s>=0&&(u+=r[s]),n>=0&&(u+=r[n]),l>=0&&(u+=r[l]);let h=(.01+u)/4;r[t]=1.9*h+-.8999999999999999*r[t]}}0;return r}(S,c,p);let B=0;for(let e=0;e<y.length;e++){let t=y[e];U[t]>B&&(B=U[t])}let E=document.createElement("canvas");E.width=c,E.height=p;let T=E.getContext("2d"),V=T.createImageData(c,p);for(let e=0;e<p;e++)for(let t=0;t<c;t++){let i=e*c+t,r=4*i;if(x[i]){let e=255*(1-U[i]/B);V.data[r]=e,V.data[r+1]=e,V.data[r+2]=e,V.data[r+3]=255}else V.data[r]=255,V.data[r+1]=255,V.data[r+2]=255,V.data[r+3]=0}T.putImageData(V,0,0),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality="high",i.drawImage(E,0,0,c,p,0,0,u,h);let I=i.getImageData(0,0,u,h),A=document.createElement("canvas");A.width=u,A.height=h;let z=A.getContext("2d");z.drawImage(n,0,0,u,h);let C=z.getImageData(0,0,u,h);for(let e=0;e<I.data.length;e+=4){let t=C.data[e+3],i=I.data[e+3];0===t?(I.data[e]=255,I.data[e+1]=0):(I.data[e]=0===i?0:I.data[e],I.data[e+1]=t),I.data[e+2]=255,I.data[e+3]=255}i.putImageData(I,0,0),t.toBlob(e=>{if(!e)return void a(Error("Failed to create PNG blob"));0;o({imageData:I,pngBlob:e})},"image/png")},n.onerror=()=>a(Error("Failed to load image")),n.src="string"==typeof e?e:URL.createObjectURL(e)})}])},972109,494108,e=>{"use strict";let t;var i=e.i(843476),r=e.i(271645),o=e.i(926726),a=e.i(776882),s=e.i(221449),n=e.i(131967),l=e.i(165298);function u(){let e=async e=>{let t=await createImageBitmap(e),i=t.width,r=t.height,o=512/Math.min(i,r),a=Math.round(i*o),s=Math.round(r*o),n=new OffscreenCanvas(i,r),l=n.getContext("2d"),u=new OffscreenCanvas(a,s).getContext("2d");u.drawImage(t,0,0,a,s);let h=u.getImageData(0,0,a,s).data,d=new Uint8Array(a*s);for(let e=0,t=0;e<h.length;e+=4,t++)d[t]=+(0!==h[e+3]);let c=[];for(let e=0;e<s;e++)for(let t=0;t<a;t++){let i=e*a+t;d[i]&&0!==t&&t!==a-1&&0!==e&&e!==s-1&&d[i-1]&&d[i+1]&&d[i-a]&&d[i+a]&&d[i-a-1]&&d[i-a+1]&&d[i+a-1]&&d[i+a+1]&&c.push(i)}let p=((e,t,i,r)=>{let o=new Float32Array(i*r),a=e.length,s=new Int32Array(4*a),n=[],l=[];for(let o=0;o<a;o++){let a=e[o],u=a%i,h=Math.floor(a/i);s[4*o]=u<i-1&&t[a+1]?a+1:-1,s[4*o+1]=u>0&&t[a-1]?a-1:-1,s[4*o+2]=h>0&&t[a-i]?a-i:-1,s[4*o+3]=h<r-1&&t[a+i]?a+i:-1,((u+h)%2==0?n:l).push(o)}let u=t=>{for(let i of t){let t=e[i],r=0;for(let e=0;e<4;e++){let t=s[4*i+e];t>=0&&(r+=o[t])}o[t]=(.01+r)/4*1.9+-.8999999999999999*o[t]}};for(let e=0;e<40;e++)u(n),u(l);return o})(new Uint32Array(c),d,a,s),m=0;for(let e=0;e<c.length;e++)p[c[e]]>m&&(m=p[c[e]]);let g=new OffscreenCanvas(a,s),f=g.getContext("2d"),v=f.createImageData(a,s);for(let e=0;e<a*s;e++){let t=4*e;if(d[e]){let i=255*(1-p[e]/m);v.data[t]=v.data[t+1]=v.data[t+2]=i,v.data[t+3]=255}else v.data[t]=v.data[t+1]=v.data[t+2]=255,v.data[t+3]=0}f.putImageData(v,0,0),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality="high",l.drawImage(g,0,0,a,s,0,0,i,r);let x=l.getImageData(0,0,i,r),_=new OffscreenCanvas(i,r).getContext("2d");_.drawImage(t,0,0,i,r);let b=_.getImageData(0,0,i,r).data;t.close();for(let e=0;e<x.data.length;e+=4){let t=b[e+3];0===t?(x.data[e]=255,x.data[e+1]=0):(x.data[e]=0===x.data[e+3]?0:x.data[e],x.data[e+1]=t),x.data[e+2]=255,x.data[e+3]=255}return l.putImageData(x,0,0),n.convertToBlob({type:"image/png"})};self.onmessage=async t=>{let{id:i,png:r}=t.data;try{self.postMessage({id:i,png:await e(r)})}catch(e){self.postMessage({id:i,error:String(e)})}}}var h=e.i(210270),d=e.i(22707);function c(e){if("p"===e.type){let e=512/1201,t=new OffscreenCanvas(Math.round(512/1201*1206),512),i=t.getContext("2d");return i.fillStyle="#fff",i.scale(e,e),(0,l.drawP)(i),t}if("word"===e.type){let t="900 400px Satoshi",i=new OffscreenCanvas(1,1).getContext("2d");i.font=t,i.letterSpacing="-8px";let r=new OffscreenCanvas(Math.ceil(i.measureText(e.text).width)+160,560),o=r.getContext("2d");return o.font=t,o.fillStyle="#fff",o.textBaseline="middle",o.letterSpacing="-8px",o.fillText(e.text,80,r.height/2+14),r}let t=Math.round((e.width??200)*4),i=Math.round((e.height??56)*4),r=new OffscreenCanvas(t,i),o=r.getContext("2d");o.fillStyle="#fff",o.beginPath(),o.roundRect(0,0,t,i,i/2),o.fill();let a=4*e.ring;return o.globalCompositeOperation="destination-out",o.beginPath(),o.roundRect(a,a,t-2*a,i-2*a,i/2-a),o.fill(),r}async function p(e){await document.fonts.load("900 400px Satoshi");let t=c({type:"word",text:e}),i=await t.convertToBlob({type:"image/png"});return{url:URL.createObjectURL(i),width:t.width,height:t.height}}let m=0,g=new Map;async function f(e){let i=function(){if(void 0!==t)return t;if(t=null,"u"<typeof Worker||"u"<typeof OffscreenCanvas||"u"<typeof createImageBitmap)return null;try{let e=URL.createObjectURL(new Blob([`(${u})()`],{type:"text/javascript"}));(t=new Worker(e)).onmessage=e=>{let t=g.get(e.data.id);g.delete(e.data.id),e.data.png?t?.resolve(e.data.png):t?.reject(Error(e.data.error))},t.onerror=()=>{for(let e of(t=null,g.values()))e.reject(Error("liquid-metal worker"));g.clear()}}catch{t=null}return t}();if(i)try{return await new Promise((t,r)=>{let o=m++;g.set(o,{resolve:t,reject:r}),i.postMessage({id:o,png:e})})}catch{}let{pngBlob:r}=await (0,a.toProcessedLiquidMetal)(new File([e],"mask.png",{type:"image/png"}));return r}let v=new Map,x=Promise.resolve();async function _(e,t,i={}){var r;let l,u,p;"ring"!==t.type||t.width||(t={...t,width:e.offsetWidth,height:e.offsetHeight});let m=await (u="p"===(l=r=t).type?"p":"word"===l.type?`word:${l.text}`:`ring:${l.width}x${l.height}:${l.ring}`,!(p=v.get(u))&&(x=(p=x.then(async()=>{"word"===r.type&&await document.fonts.load("900 400px Satoshi");let e=await c(r).convertToBlob({type:"image/png"}),t=await f(e),i=new Image;return i.src=URL.createObjectURL(t),await i.decode(),await new Promise(e=>setTimeout(e,0)),i})).catch(()=>{}),v.set(u,p)),p);if(!e.isConnected)return()=>{};let g=new o.ShaderMount(e,a.liquidMetalFragmentShader,{u_colorBack:(0,s.getShaderColorFromString)("rgba(0,0,0,0)"),u_colorTint:(0,s.getShaderColorFromString)(d.PALETTE.gelo),u_image:m,u_isImage:!0,u_shape:a.LiquidMetalShapes.none,u_repetition:i.repetition??2,u_softness:i.softness??.1,u_shiftRed:i.shiftRed??.3,u_shiftBlue:i.shiftBlue??.3,u_distortion:i.distortion??.07,u_contour:i.contour??.4,u_angle:i.angle??70,u_fit:n.ShaderFitOptions.contain,u_scale:i.scale??1,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0},void 0,matchMedia("(prefers-reduced-motion: reduce)").matches?0:i.speed??1,0,2,void 0,["u_image"]);return e.classList.add("is-ready"),()=>{(0,h.disposeMount)(g),e.classList.remove("is-ready")}}e.s(["mountMetal",0,_,"wordMask",0,p],494108),e.s(["Metal",0,function({shape:e,className:t,lazy:o,...a}){let s=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let t,i=s.current,r=!0,n=!1,l=!1,u=!1,d=!1,c=()=>{l||t||(n=!0,l=!0,u=!1,_(i,e,a).then(e=>{if(l=!1,!r)return e();t=e;let o=i.querySelector("canvas");o&&(0,h.onContextLost)(o,()=>{if(!r||!t)return;let e=t;t=void 0,e(),u=!0,d&&c()})}).catch(e=>{l=!1,console.error(e)}))},p=o?void 0:setTimeout(c,250),m=new IntersectionObserver(([e])=>{(d=e.isIntersecting)&&(u||o&&!n)&&c()},{rootMargin:o?"400px":"0px"});return m.observe(i),()=>{r=!1,clearTimeout(p),m.disconnect();let e=t;t=void 0,e?.()}},[]),(0,i.jsx)("span",{ref:s,className:["metal",t].filter(Boolean).join(" "),"aria-hidden":"true"})}],972109)},165298,e=>{"use strict";let t=["m29.77 989.87l145.24-375.47h748.11l0.14 33.03c0 83.98-61.01 156.21-140.91 156.21h-374.18l-76.28 186.23h-302.03z","m253.29 372.87h99.29l1.37-170.87h0.23 595.83c131.91 0 237.31 102.43 237.31 243.6 0 37.45-8.63 78.4-28.37 107.97-33.34 49.13-84.6 61-118.77 61h-116.91v-142.99c0-27.57-21.51-37.44-41.43-37.44h-700.9c-0.01 0-1.8-59.63 72.35-61.27z"];e.s(["P_PATHS",0,t,"drawP",0,function(e){for(let i of(e.save(),e.translate(120,120),e.scale(.8,.8),t))e.fill(new Path2D(i));e.restore()}])},22707,e=>{"use strict";e.s(["GOLD",0,{coral:"#e39a55",coralT:"#f6dcb2",anil:"#d8b05c",anilT:"#f2e2b4",abismo:"#22150a"},"NEON",0,{coral:"#b4ff39",coralT:"#e8ffc4",anil:"#39ff14",anilT:"#c8ffb8",abismo:"#06280c"},"PALETTE",0,{coral:"#e7a0be",coralT:"#f4d5e3",gelo:"#eee6f6",anil:"#9a8cf2",anilT:"#cbc3f8",abismo:"#16112f"},"hexToRgb",0,e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255)])},210270,e=>{"use strict";e.s(["disposeMount",0,function(e){let t=e.canvasElement.getContext("webgl2");e.dispose(),t?.getExtension("WEBGL_lose_context")?.loseContext()},"onContextLost",0,function(e,t){e.addEventListener("webglcontextlost",e=>{e.preventDefault(),t()},{once:!0})}])}]);

//# debugId=fee4e786-4586-0e7a-b128-a43b152b3b75