;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="6749c111-155e-096b-6d9f-8d8a6dc81872")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,221449,e=>{"use strict";let t=(e,t,r)=>Math.min(Math.max(e,t),r),r=[.5,.5,.5,1];e.s(["f",0,function(e){if(Array.isArray(e))return 4===e.length?e:3===e.length?[...e,1]:r;if("string"!=typeof e)return r;let i,o,n,s=1;if(e.startsWith("#")){var a;(3===(a=(a=e).replace(/^#/,"")).length||4===a.length)&&(a=a.split("").map(e=>e+e).join("")),6===a.length&&(a+="ff"),[i,o,n,s]=/^[0-9a-f]{8}$/i.test(a)?[parseInt(a.slice(0,2),16)/255,parseInt(a.slice(2,4),16)/255,parseInt(a.slice(4,6),16)/255,parseInt(a.slice(6,8),16)/255]:(console.warn("Invalid hex color"),r)}else if(e.startsWith("rgb")){let t,a=(t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(t[1]??"0")/255,parseInt(t[2]??"0")/255,parseInt(t[3]??"0")/255,void 0===t[4]?1:parseFloat(t[4])]:null;if(null===a)return r;[i,o,n,s]=a}else{let t;if(!e.startsWith("hsl"))return console.error("Unsupported color format",e),r;let a=(t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(t[1]??"0"),parseInt(t[2]??"0"),parseInt(t[3]??"0"),void 0===t[4]?1:parseFloat(t[4])]:null;if(null===a)return r;[i,o,n,s]=function(e){let t,r,i,[o,n,s,a]=e,l=o/360,u=n/100,c=s/100;if(0===n)t=r=i=c;else{let e=(e,t,r)=>(r<0&&(r+=1),r>1&&(r-=1),r<1/6)?e+(t-e)*6*r:r<.5?t:r<2/3?e+(t-e)*(2/3-r)*6:e,o=c<.5?c*(1+u):c+u-c*u,n=2*c-o;t=e(n,o,l+1/3),r=e(n,o,l),i=e(n,o,l-1/3)}return[t,r,i,a]}(a)}return[t(i,0,1),t(o,0,1),t(n,0,1),t(s,0,1)]}])},926726,e=>{"use strict";let t=`#version 300 es
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
}`,r=8294400;function i(e,t,r){let i=e.createShader(t);return i?(e.shaderSource(i,r),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS))?i:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(i)),e.deleteShader(i),null):null}let o=`@layer paper-shaders {
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
}`;e.s(["f",0,class{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")})();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(e,t,i,n,s=0,a=0,l=2,u=r,c=[]){if(e?.nodeType===1)this.parentElement=e;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=e.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){let e=this.ownerDocument.createElement("style");e.innerHTML=o,e.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(e)}let h=this.ownerDocument.createElement("canvas");this.canvasElement=h,this.parentElement.prepend(h),this.fragmentShader=t,this.providedUniforms=i,this.mipmaps=c,this.currentFrame=a,this.minPixelRatio=l,this.maxPixelCount=u;let d=h.getContext("webgl2",n);if(!d)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=d,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(s),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let e=function(e,t,r){let o=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),n=o?o.precision:null;n&&n<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),r=r.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let s=i(e,e.VERTEX_SHADER,t),a=i(e,e.FRAGMENT_SHADER,r);if(!s||!a)return null;let l=e.createProgram();return l?(e.attachShader(l,s),e.attachShader(l,a),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS))?(e.detachShader(l,s),e.detachShader(l,a),e.deleteShader(s),e.deleteShader(a),l):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(l)),e.deleteProgram(l),e.deleteShader(s),e.deleteShader(a),null):null}(this.gl,t,this.fragmentShader);e&&(this.program=e)};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,"a_position"),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([t,r])=>{if(e[t]=this.gl.getUniformLocation(this.program,t),r instanceof HTMLImageElement){let r=`${t}AspectRatio`;e[r]=this.gl.getUniformLocation(this.program,r)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;intersectionObserver=null;isInViewport=!0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let t=e.devicePixelContentBoxSize?.[0];void 0!==t&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=t.inlineSize,this.parentDevicePixelHeight=t.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};setupIntersectionObserver=()=>{let e=this.ownerDocument.defaultView;e?.IntersectionObserver&&(this.intersectionObserver=new e.IntersectionObserver(([e])=>{this.isInViewport=e?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,t=0,r=Math.max(1,window.devicePixelRatio),i=visualViewport?.scale??1;if(this.devicePixelsSupported){let o=Math.max(1,this.minPixelRatio/r);e=this.parentDevicePixelWidth*o*i,t=this.parentDevicePixelHeight*o*i}else{var o;let n,s,a=Math.max(r,this.minPixelRatio)*i;this.isSafari&&(a*=Math.max(1,(o=this.ownerDocument,(s=Math.round(100*(n=outerWidth/((visualViewport?.scale??1)*(visualViewport?.width??window.innerWidth)+(window.innerWidth-o.documentElement.clientWidth)))))%5==0?s/100:33===s?1/3:67===s?2/3:133===s?4/3:n))),e=Math.round(this.parentWidth)*a,t=Math.round(this.parentHeight)*a}let n=Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(e*t)),s=Math.round(e*n),a=Math.round(t*n),l=s/Math.round(this.parentWidth);(this.canvasElement.width!==s||this.canvasElement.height!==a||this.renderScale!==l)&&(this.renderScale=l,this.canvasElement.width=s,this.canvasElement.height=a,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(null===this.program)return void console.warn("Tried to render before program or gl was initialized");let t=e-this.lastRenderTime;this.lastRenderTime=e,0!==this.currentSpeed&&(this.currentFrame+=t*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.currentSpeed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,t)=>{if(!t.complete||0===t.naturalWidth)throw Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let r=this.textures.get(e);r&&this.gl.deleteTexture(r),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let i=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+i);let o=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t),this.mipmaps.includes(e)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let n=this.gl.getError();if(n!==this.gl.NO_ERROR||null===o)return void console.error("Paper Shaders: WebGL error when uploading texture:",n);this.textures.set(e,o);let s=this.uniformLocations[e];if(s){this.gl.uniform1i(s,i);let r=`${e}AspectRatio`,o=this.uniformLocations[r];if(o){let e=t.naturalWidth/t.naturalHeight;this.gl.uniform1f(o,e)}}};areUniformValuesEqual=(e,t)=>e===t||!!(Array.isArray(e)&&Array.isArray(t))&&e.length===t.length&&e.every((e,r)=>this.areUniformValuesEqual(e,t[r]));setUniformValues=e=>{this.gl.useProgram(this.program),Object.entries(e).forEach(([e,t])=>{let r=t;if(t instanceof HTMLImageElement&&(r=`${t.src.slice(0,200)}|${t.naturalWidth}x${t.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[e],r))return;this.uniformCache[e]=r;let i=this.uniformLocations[e];if(!i)return void console.warn(`Uniform location for ${e} not found`);if(t instanceof HTMLImageElement)this.setTextureUniform(e,t);else if(Array.isArray(t)){let r=null,o=null;if(void 0!==t[0]&&Array.isArray(t[0])){let i=t[0].length;if(!t.every(e=>e.length===i))return void console.warn(`All child arrays must be the same length for ${e}`);r=t.flat(),o=i}else o=(r=t).length;switch(o){case 2:this.gl.uniform2fv(i,r);break;case 3:this.gl.uniform3fv(i,r);break;case 4:this.gl.uniform4fv(i,r);break;case 9:this.gl.uniformMatrix3fv(i,!1,r);break;case 16:this.gl.uniformMatrix4fv(i,!1,r);break;default:console.warn(`Unsupported uniform array length: ${o}`)}}else"number"==typeof t?this.gl.uniform1f(i,t):"boolean"==typeof t?this.gl.uniform1i(i,+!!t):console.warn(`Unsupported uniform type for ${e}: ${typeof t}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(e=1)=>{this.speed=e,this.updateCurrentSpeed()};updateCurrentSpeed=()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)};setCurrentSpeed=e=>{this.currentSpeed=e,null===this.rafId&&0!==e&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===e&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=r)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.updateCurrentSpeed()};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}],926726)},131967,e=>{"use strict";e.s(["f",0,{none:0,contain:1,cover:2}])},193344,e=>{"use strict";let t=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,r=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,i=`
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
`,n=`
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
`;e.s(["G",0,n,"s",0,t,"t",0,i,"A",0,r,"B",0,s,"H",0,o])},522016,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var i={default:function(){return g},useLinkStatus:function(){return k}};for(var o in i)Object.defineProperty(r,o,{enumerable:!0,get:i[o]});let n=e.r(190809),s=e.r(843476),a=n._(e.r(271645)),l=e.r(195057),u=e.r(8372),c=e.r(818581),h=e.r(718967),d=e.r(405550),p=e.r(388540),f=e.r(91949),x=e.r(573668),m=e.r(509396);function g(t){var r;let i,o,n,[g,k]=(0,a.useOptimistic)(f.IDLE_LINK_STATUS),_=(0,a.useRef)(null),{href:j,as:b,children:y,prefetch:S=null,passHref:M,replace:C,shallow:L,scroll:R,onClick:E,onMouseEnter:w,onTouchStart:U,legacyBehavior:W=!1,onNavigate:B,transitionTypes:T,ref:A,unstable_dynamicOnHover:z,...P}=t;i=y,W&&("string"==typeof i||"number"==typeof i)&&(i=(0,s.jsx)("a",{children:i}));let V=a.default.useContext(u.AppRouterContext),F=!1!==S,I=!1===S?"none":!0===S?"full":"auto",O="none"!==I?"auto"===I?m.FetchStrategy.PPR:m.FetchStrategy.Full:m.FetchStrategy.PPR,D="string"==typeof(r=b||j)?r:(0,l.formatUrl)(r);if(W){if(i?.$$typeof===Symbol.for("react.lazy"))throw Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag.");o=a.default.Children.only(i)}let $=W?o&&"object"==typeof o&&o.ref:A,N,H=a.default.useCallback(e=>(null!==V&&(_.current=(0,f.mountLinkInstance)(e,D,V,O,F,k,N)),()=>{_.current&&((0,f.unmountLinkForCurrentNavigation)(_.current),_.current=null),(0,f.unmountPrefetchableInstance)(e)}),[F,D,V,O,k,N]),G={ref:(0,c.useMergedRef)(H,$),onClick(t){W||"function"!=typeof E||E(t),W&&o.props&&"function"==typeof o.props.onClick&&o.props.onClick(t),!V||t.defaultPrevented||function(t,r,i,o,n,s,a,l="none"){if("u">typeof window){let u,{nodeName:c}=t.currentTarget;if("A"===c.toUpperCase()&&((u=t.currentTarget.getAttribute("target"))&&"_self"!==u||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,x.isLocalURL)(r)){o&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),s){let e=!1;if(s({preventDefault:()=>{e=!0}}),e)return}let{navigate:h}=e.r(132916);h(r,o?"replace":"push",!1===n?p.ScrollBehavior.NoScroll:p.ScrollBehavior.Default,i.current,a,l)}}(t,D,_,C,R,B,T,I)},onMouseEnter(e){W||"function"!=typeof w||w(e),W&&o.props&&"function"==typeof o.props.onMouseEnter&&o.props.onMouseEnter(e),V&&F&&(0,f.onNavigationIntent)(e.currentTarget,!0===z)},onTouchStart:function(e){W||"function"!=typeof U||U(e),W&&o.props&&"function"==typeof o.props.onTouchStart&&o.props.onTouchStart(e),V&&F&&(0,f.onNavigationIntent)(e.currentTarget,!0===z)}};return(0,h.isAbsoluteUrl)(D)?G.href=D:W&&!M&&("a"!==o.type||"href"in o.props)||(G.href=(0,d.addBasePath)(D)),n=W?a.default.cloneElement(o,G):(0,s.jsx)("a",{...P,...G,children:i}),(0,s.jsx)(v.Provider,{value:g,children:n})}let v=(0,a.createContext)(f.IDLE_LINK_STATUS),k=()=>(0,a.useContext)(v);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},818581,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return o}});let i=e.r(271645);function o(e,t){let r=(0,i.useRef)(null),o=(0,i.useRef)(null);return(0,i.useCallback)(i=>{if(null===i){let e=r.current;e&&(r.current=null,e());let t=o.current;t&&(o.current=null,t())}else e&&(r.current=n(e,i)),t&&(o.current=n(t,i))},[e,t])}function n(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},195057,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var i={formatUrl:function(){return a},formatWithValidation:function(){return u},urlObjectKeys:function(){return l}};for(var o in i)Object.defineProperty(r,o,{enumerable:!0,get:i[o]});let n=e.r(190809)._(e.r(998183)),s=/https?|ftp|gopher|file/;function a(e){let{auth:t,hostname:r}=e,i=e.protocol||"",o=e.pathname||"",a=e.hash||"",l=e.query||"",u=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?u=t+e.host:r&&(u=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(u+=":"+e.port)),l&&"object"==typeof l&&(l=String(n.urlQueryToSearchParams(l)));let c=e.search||l&&`?${l}`||"";return i&&!i.endsWith(":")&&(i+=":"),e.slashes||(!i||s.test(i))&&!1!==u?(u="//"+(u||""),o&&"/"!==o[0]&&(o="/"+o)):u||(u=""),a&&"#"!==a[0]&&(a="#"+a),c&&"?"!==c[0]&&(c="?"+c),o=o.replace(/[?#]/g,encodeURIComponent),c=c.replace("#","%23"),`${i}${u}${o}${c}${a}`}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function u(e){return a(e)}},573668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return n}});let i=e.r(718967),o=e.r(652817);function n(e){if(!(0,i.isAbsoluteUrl)(e))return!0;try{let t=(0,i.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,o.hasBasePath)(r.pathname)}catch(e){return!1}}},718967,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var i={DecodeError:function(){return g},MiddlewareNotFoundError:function(){return j},MissingStaticPage:function(){return _},NormalizeError:function(){return v},PageNotFoundError:function(){return k},SP:function(){return x},ST:function(){return m},WEB_VITALS:function(){return n},execOnce:function(){return s},getDisplayName:function(){return h},getLocationOrigin:function(){return u},getURL:function(){return c},isAbsoluteUrl:function(){return l},isResSent:function(){return d},loadGetInitialProps:function(){return f},normalizeRepeatedSlashes:function(){return p},stringifyError:function(){return b}};for(var o in i)Object.defineProperty(r,o,{enumerable:!0,get:i[o]});let n=["CLS","FCP","INP","LCP","TTFB"];function s(e){let t,r=!1;return(...i)=>(r||(r=!0,t=e(...i)),t)}let a=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=e=>{let t=e.charCodeAt(0);return!!(t>=65&&t<=90||t>=97&&t<=122)&&a.test(e)};function u(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function c(){let{href:e}=window.location,t=u();return e.substring(t.length)}function h(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function d(e){return e.finished||e.headersSent}function p(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function f(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await f(t.Component,t.ctx)}:{};let i=await e.getInitialProps(t);if(r&&d(r))return i;if(!i)throw Error(`"${h(e)}.getInitialProps()" should resolve to an object. But found "${i}" instead.`);return i}let x="u">typeof performance,m=x&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class g extends Error{}class v extends Error{}class k extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class _ extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class j extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function b(e){return JSON.stringify({message:e.message,stack:e.stack})}},951514,e=>{"use strict";var t=e.i(843476);let r={arrow:(0,t.jsx)("path",{d:"M3 8h10M9 4l4 4-4 4",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"}),spark:(0,t.jsx)("path",{d:"M8 1.5c.4 3.3 1.9 5.6 6.5 6.5-4.6.9-6.1 3.2-6.5 6.5-.4-3.3-1.9-5.6-6.5-6.5 4.6-.9 6.1-3.2 6.5-6.5Z",fill:"currentColor"}),search:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"7",cy:"7",r:"4.6",fill:"none",stroke:"currentColor",strokeWidth:"1.5"}),(0,t.jsx)("path",{d:"m10.6 10.6 3 3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),copy:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"5",y:"5",width:"8.5",height:"8.5",rx:"2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M10.5 3.2A1.7 1.7 0 0 0 9 2.5H4.2A1.7 1.7 0 0 0 2.5 4.2V9c0 .6.3 1.2.8 1.5",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),check:(0,t.jsx)("path",{d:"m3.5 8.5 3 3 6-7",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round"}),user:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"8",cy:"5.5",r:"2.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M2.8 14c.7-2.6 2.8-4 5.2-4s4.5 1.4 5.2 4",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),crown:(0,t.jsx)("path",{d:"M2.2 5.2 5.3 7.6 8 3.2l2.7 4.4 3.1-2.4-1.1 6.6H3.3L2.2 5.2Zm1.3 7.5h9v1.3h-9z",fill:"currentColor"}),infinity:(0,t.jsx)("path",{d:"M8 8c1.3-1.6 2.3-2.6 3.6-2.6a2.6 2.6 0 0 1 0 5.2C10.3 10.6 9.3 9.6 8 8 6.7 6.4 5.7 5.4 4.4 5.4a2.6 2.6 0 0 0 0 5.2C5.7 10.6 6.7 9.6 8 8Z",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"}),close:(0,t.jsx)("path",{d:"m4 4 8 8M12 4l-8 8",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),lock:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"3.2",y:"7",width:"9.6",height:"7",rx:"2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),pix:(0,t.jsx)("path",{transform:"scale(0.6667)",fill:"currentColor",d:"M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"}),mail:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"2",y:"3.5",width:"12",height:"9",rx:"2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"m2.8 4.8 5.2 4 5.2-4",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"})]}),download:(0,t.jsx)("path",{d:"M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),file:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M4 1.8h5l3.2 3.2v8.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V2.8c0-.6.4-1 1-1Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),(0,t.jsx)("path",{d:"M9 1.8V5h3.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"})]}),list:(0,t.jsx)("path",{d:"M6 4.5h7.5M6 8h7.5M6 11.5h7.5M2.8 4.5h.4M2.8 8h.4M2.8 11.5h.4",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),external:(0,t.jsx)("path",{d:"M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),play:(0,t.jsx)("path",{d:"M5 3.2v9.6c0 .5.5.8.9.5l7.3-4.8c.4-.3.4-.8 0-1L5.9 2.7c-.4-.3-.9 0-.9.5Z",fill:"currentColor"}),chevron:(0,t.jsx)("path",{d:"m4.5 6.25 3.5 3.5 3.5-3.5",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),updown:(0,t.jsx)("path",{d:"m5.2 6 2.8-2.8L10.8 6M5.2 10 8 12.8l2.8-2.8",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),plus:(0,t.jsx)("path",{d:"M8 3.2v9.6M3.2 8h9.6",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),grid:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"2.3",y:"2.3",width:"4.8",height:"4.8",rx:"1.3",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("rect",{x:"8.9",y:"2.3",width:"4.8",height:"4.8",rx:"1.3",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("rect",{x:"2.3",y:"8.9",width:"4.8",height:"4.8",rx:"1.3",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("rect",{x:"8.9",y:"8.9",width:"4.8",height:"4.8",rx:"1.3",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),lessons:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"1.8",y:"3",width:"12.4",height:"10",rx:"2.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M6.7 6.2v3.6c0 .4.4.6.7.4l2.9-1.8c.3-.2.3-.6 0-.8L7.4 5.8c-.3-.2-.7 0-.7.4Z",fill:"currentColor"})]}),layers:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M8 2.3 14 5.5 8 8.7 2 5.5 8 2.3Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),(0,t.jsx)("path",{d:"m2 8.4 6 3.2 6-3.2M2 11.1l6 3.2 6-3.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),settings:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M2.5 5h5.6M11.9 5h1.6M2.5 11h1.6M7.9 11h5.6",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"}),(0,t.jsx)("circle",{cx:"10",cy:"5",r:"1.7",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("circle",{cx:"6",cy:"11",r:"1.7",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),logout:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M6.5 2.5H4.3c-1 0-1.8.8-1.8 1.8v7.4c0 1 .8 1.8 1.8 1.8h2.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"}),(0,t.jsx)("path",{d:"M10.2 5.2 13 8l-2.8 2.8M13 8H6.5",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),clock:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"8",cy:"8",r:"5.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M8 4.8V8l2.2 1.5",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),terminal:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"1.8",y:"2.8",width:"12.4",height:"10.4",rx:"2.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"m4.8 6.3 2 1.7-2 1.7M8.6 10.2h2.6",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),shield:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M8 1.9 13 3.8v3.9c0 3-2.1 5.4-5 6.4-2.9-1-5-3.4-5-6.4V3.8l5-1.9Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),(0,t.jsx)("path",{d:"m5.8 8 1.6 1.6 2.9-3.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),refund:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M3.2 6.4A5 5 0 1 1 3 9.6",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"}),(0,t.jsx)("path",{d:"M2.6 3.4v3.2h3.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),bolt:(0,t.jsx)("path",{d:"M9 1.8 3.6 9h4l-.6 5.2L12.4 7h-4L9 1.8Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),chart:(0,t.jsx)("path",{d:"M3 13.2V9.4M6.3 13.2V6.2M9.7 13.2V7.8M13 13.2V3.2",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),phone:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"4.2",y:"1.6",width:"7.6",height:"12.8",rx:"2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M7 12.1h2",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),globe:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"8",cy:"8",r:"6",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M2.2 8h11.6M8 2c1.7 1.7 2.5 3.7 2.5 6S9.7 12.3 8 14C6.3 12.3 5.5 10.3 5.5 8S6.3 3.7 8 2Z",fill:"none",stroke:"currentColor",strokeWidth:"1.3",strokeLinejoin:"round"})]}),history:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M2.6 8a5.4 5.4 0 1 0 1.6-3.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"}),(0,t.jsx)("path",{d:"M2.4 2.6v2.6H5M8 5.2V8l2 1.4",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})]}),window:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"1.8",y:"2.6",width:"12.4",height:"10.8",rx:"2.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M1.8 5.9h12.4M4.4 4.25h.3M6.2 4.25h.3",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),shapes:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"2",y:"2",width:"5.4",height:"5.4",rx:"1.4",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("circle",{cx:"11.3",cy:"4.7",r:"2.7",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M4.7 9.2 7.6 14H1.8l2.9-4.8Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),(0,t.jsx)("rect",{x:"8.6",y:"8.6",width:"5.4",height:"5.4",rx:"2.7",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),wave:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"8",cy:"8",r:"6.1",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M2.3 9.4c1.9-2.6 3.8-2.6 5.7 0s3.8 2.6 5.7 0M3.4 5.6c1.6-1.6 3.1-1.4 4.6.4 1.5 1.8 3 2 4.6.4",fill:"none",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),film:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"1.8",y:"2.6",width:"12.4",height:"10.8",rx:"2.2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M4.8 2.6v10.8M11.2 2.6v10.8M1.8 8h3M11.2 8h3",fill:"none",stroke:"currentColor",strokeWidth:"1.4"})]}),edit:(0,t.jsx)("path",{d:"m10.2 3.3 2.5 2.5M3 13l.6-3 7-7a1.4 1.4 0 0 1 2 0l.4.4a1.4 1.4 0 0 1 0 2l-7 7-3 .6Z",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),gift:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"2.3",y:"5.6",width:"11.4",height:"3",rx:"0.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M3.4 8.6v4.2c0 .5.4.9.9.9h7.4c.5 0 .9-.4.9-.9V8.6M8 5.6v8.1",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinejoin:"round"}),(0,t.jsx)("path",{d:"M8 5.6C7.2 3.4 5.2 2.4 4.4 3.4c-.8 1 .8 2.2 3.6 2.2Zm0 0c.8-2.2 2.8-3.2 3.6-2.2.8 1-.8 2.2-3.6 2.2Z",fill:"none",stroke:"currentColor",strokeWidth:"1.3",strokeLinejoin:"round"})]}),trash:(0,t.jsx)("path",{d:"M2.5 4.3h11M6.2 4.3V3a.8.8 0 0 1 .8-.8h2a.8.8 0 0 1 .8.8v1.3M4 4.3l.6 8.5a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.5M6.7 7v3.8M9.3 7v3.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),megaphone:(0,t.jsx)("path",{d:"M2.4 6.6v2.8c0 .5.4.9.9.9h1.6l5.5 3.1V2.6L4.9 5.7H3.3a.9.9 0 0 0-.9.9ZM5 10.3l.8 3.1M12.6 5.9c.6.6.9 1.3.9 2.1s-.3 1.5-.9 2.1",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),code:(0,t.jsx)("path",{d:"M5.3 4.6 1.9 8l3.4 3.4M10.7 4.6 14.1 8l-3.4 3.4M9.1 2.9 6.9 13.1",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),diamond:(0,t.jsx)("path",{d:"M4.6 2.8h6.8l2.8 3.7L8 13.4 1.8 6.5l2.8-3.7ZM1.8 6.5h12.4M6.3 2.8l-1 3.7L8 13.4l2.7-6.9-1-3.7",fill:"none",stroke:"currentColor",strokeWidth:"1.3",strokeLinejoin:"round"}),verified:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"8",cy:"8",r:"6",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"m5.4 8.1 1.8 1.8 3.5-3.8",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),reel:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"4",y:"1.8",width:"8",height:"12.4",rx:"2",fill:"none",stroke:"currentColor",strokeWidth:"1.4"}),(0,t.jsx)("path",{d:"M7 6.2v3.6L10 8 7 6.2Z",fill:"currentColor",stroke:"currentColor",strokeWidth:"0.8",strokeLinejoin:"round"})]}),link:(0,t.jsx)("path",{d:"M7 9a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9 7a2.6 2.6 0 0 0-3.7 0l-2 2A2.6 2.6 0 0 0 7 12.7l.8-.8",fill:"none",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),dots:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:"3.5",cy:"8",r:"1.3",fill:"currentColor"}),(0,t.jsx)("circle",{cx:"8",cy:"8",r:"1.3",fill:"currentColor"}),(0,t.jsx)("circle",{cx:"12.5",cy:"8",r:"1.3",fill:"currentColor"})]})};e.s(["f",0,function({name:e,size:i=16,...o}){return(0,t.jsx)("svg",{width:i,height:i,viewBox:"0 0 16 16","aria-hidden":"true",...o,children:r[e]})}])},347782,e=>{"use strict";var t=e.i(843476),r=e.i(522016),i=e.i(271645);e.s(["default",0,function({prefetch:e,onMouseEnter:o,onTouchStart:n,onFocus:s,...a}){let[l,u]=(0,i.useState)(!1);return(0,t.jsx)(r.default,{...a,prefetch:void 0!==e?e:!!l&&null,onMouseEnter:e=>{u(!0),o?.(e)},onTouchStart:e=>{u(!0),n?.(e)},onFocus:e=>{u(!0),s?.(e)}})}])},93209,e=>{"use strict";let t="/build";e.s(["z",0,t,"I",0,e=>/^https?:\/\//.test(e)?e:`https://profitize.com.br${e}`,"x",0,function(e){return/^https?:\/\//.test(e)?e:"/"===e?t:e.startsWith("/#")||e.startsWith("/?")?`${t}${e.slice(1)}`:`${t}${e}`}])},22707,e=>{"use strict";e.s(["l",0,{coral:"#e39a55",coralT:"#f6dcb2",anil:"#d8b05c",anilT:"#f2e2b4",abismo:"#22150a"},"d",0,{coral:"#b4ff39",coralT:"#e8ffc4",anil:"#39ff14",anilT:"#c8ffb8",abismo:"#06280c"},"t",0,{coral:"#e7a0be",coralT:"#f4d5e3",gelo:"#eee6f6",anil:"#9a8cf2",anilT:"#cbc3f8",abismo:"#16112f"},"Y",0,e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255)])},210270,e=>{"use strict";e.s(["Z",0,function(e){let t=e.canvasElement.getContext("webgl2");e.dispose(),t?.getExtension("WEBGL_lose_context")?.loseContext()},"S",0,function(e,t){e.addEventListener("webglcontextlost",e=>{e.preventDefault(),t()},{once:!0})}])},927639,e=>{"use strict";let t=["admin","afiliados","api","ascii","ascii-art","assinar","auth","aulas","comprar","conta","entrar","planos","todos","novos","brand","email","fx","icons","trilhas","termos","privacidade","presente","shaders","templates","pesquisa","sobre","sugestoes","tools","thumbs","design-systems","raio-x"],r="/skills";new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1});let i=new Intl.NumberFormat("pt-BR",{maximumFractionDigits:1});e.s(["h",0,"/templates?acesso=gratis","B",0,{used:0,limit:1,plan:"free",paid:!1,week:null},"C",0,{skill:"Skill do Claude Code",claude_md:"CLAUDE.md"},"z",0,["iniciante","intermediario","avancado"],"e",0,{iniciante:"Iniciante",intermediario:"Intermediário",avancado:"Avançado"},"m",0,"/templates?acesso=pro","Z",0,t,"R",0,r,"T",0,"skill","o",0,function(e){let t=Math.max(0,Math.round(e)),[r,i,o]=[Math.floor(t/3600),Math.floor(t%3600/60),t%60],n=r?String(i).padStart(2,"0"):String(i);return`${r?`${r}:`:""}${n}:${String(o).padStart(2,"0")}`},"v",0,function(e){let t=Math.max(1,Math.round(e/60));return t<60?`${t} min`:`${Math.floor(t/60)}h ${String(t%60).padStart(2,"0")}`},"n",0,e=>"/templates"===e||/^\/[^/]+$/.test(e)&&!t.includes(e.slice(1))&&e!==r,"q",0,e=>`/${e.kind.segment}/${e.slug}`,"p",0,e=>`/aulas/${e.slug}`,"r",0,e=>e&&"todos"!==e?`/${e}`:"/templates","w",0,function(e){return e<1024?`${e} B`:e<1048576?`${i.format(e/1024)} KB`:`${i.format(e/1048576)} MB`},"_",0,e=>`/aulas?trilha=${e.slug}#cursos`])}]);

//# debugId=6749c111-155e-096b-6d9f-8d8a6dc81872