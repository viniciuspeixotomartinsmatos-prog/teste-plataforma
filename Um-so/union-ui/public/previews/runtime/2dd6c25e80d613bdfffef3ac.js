(()=>{var P1=Object.create;var Ff=Object.defineProperty;var O1=Object.getOwnPropertyDescriptor;var B1=Object.getOwnPropertyNames;var F1=Object.getPrototypeOf,z1=Object.prototype.hasOwnProperty;var In=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),V1=(t,e)=>{for(var n in e)Ff(t,n,{get:e[n],enumerable:!0})},G1=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of B1(e))!z1.call(t,r)&&r!==n&&Ff(t,r,{get:()=>e[r],enumerable:!(i=O1(e,r))||i.enumerable});return t};var Ht=(t,e,n)=>(n=t!=null?P1(F1(t)):{},G1(e||!t||!t.__esModule?Ff(n,"default",{value:t,enumerable:!0}):n,t));var y0=In(z=>{"use strict";var Gf=Symbol.for("react.transitional.element"),k1=Symbol.for("react.portal"),H1=Symbol.for("react.fragment"),$1=Symbol.for("react.strict_mode"),W1=Symbol.for("react.profiler"),X1=Symbol.for("react.consumer"),q1=Symbol.for("react.context"),Y1=Symbol.for("react.forward_ref"),Z1=Symbol.for("react.suspense"),K1=Symbol.for("react.memo"),f0=Symbol.for("react.lazy"),J1=Symbol.for("react.activity"),o0=Symbol.iterator;function Q1(t){return t===null||typeof t!="object"?null:(t=o0&&t[o0]||t["@@iterator"],typeof t=="function"?t:null)}var d0={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},h0=Object.assign,p0={};function ms(t,e,n){this.props=t,this.context=e,this.refs=p0,this.updater=n||d0}ms.prototype.isReactComponent={};ms.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ms.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function m0(){}m0.prototype=ms.prototype;function kf(t,e,n){this.props=t,this.context=e,this.refs=p0,this.updater=n||d0}var Hf=kf.prototype=new m0;Hf.constructor=kf;h0(Hf,ms.prototype);Hf.isPureReactComponent=!0;var l0=Array.isArray;function Vf(){}var he={H:null,A:null,T:null,S:null},g0=Object.prototype.hasOwnProperty;function $f(t,e,n){var i=n.ref;return{$$typeof:Gf,type:t,key:e,ref:i!==void 0?i:null,props:n}}function j1(t,e){return $f(t.type,e,t.props)}function Wf(t){return typeof t=="object"&&t!==null&&t.$$typeof===Gf}function ew(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var c0=/\/+/g;function zf(t,e){return typeof t=="object"&&t!==null&&t.key!=null?ew(""+t.key):e.toString(36)}function tw(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(Vf,Vf):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function ps(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"bigint":case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case Gf:case k1:a=!0;break;case f0:return a=t._init,ps(a(t._payload),e,n,i,r)}}if(a)return r=r(t),a=i===""?"."+zf(t,0):i,l0(r)?(n="",a!=null&&(n=a.replace(c0,"$&/")+"/"),ps(r,e,n,"",function(c){return c})):r!=null&&(Wf(r)&&(r=j1(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(c0,"$&/")+"/")+a)),e.push(r)),1;a=0;var o=i===""?".":i+":";if(l0(t))for(var l=0;l<t.length;l++)i=t[l],s=o+zf(i,l),a+=ps(i,e,n,s,r);else if(l=Q1(t),typeof l=="function")for(t=l.call(t),l=0;!(i=t.next()).done;)i=i.value,s=o+zf(i,l++),a+=ps(i,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return ps(tw(t),e,n,i,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return a}function wl(t,e,n){if(t==null)return t;var i=[],r=0;return ps(t,i,"","",function(s){return e.call(n,s,r++)}),i}function nw(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var u0=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},iw={map:wl,forEach:function(t,e,n){wl(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return wl(t,function(){e++}),e},toArray:function(t){return wl(t,function(e){return e})||[]},only:function(t){if(!Wf(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};z.Activity=J1;z.Children=iw;z.Component=ms;z.Fragment=H1;z.Profiler=W1;z.PureComponent=kf;z.StrictMode=$1;z.Suspense=Z1;z.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=he;z.__COMPILER_RUNTIME={__proto__:null,c:function(t){return he.H.useMemoCache(t)}};z.cache=function(t){return function(){return t.apply(null,arguments)}};z.cacheSignal=function(){return null};z.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var i=h0({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!g0.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(i[s]=e[s]);var s=arguments.length-2;if(s===1)i.children=n;else if(1<s){for(var a=Array(s),o=0;o<s;o++)a[o]=arguments[o+2];i.children=a}return $f(t.type,r,i)};z.createContext=function(t){return t={$$typeof:q1,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:X1,_context:t},t};z.createElement=function(t,e,n){var i,r={},s=null;if(e!=null)for(i in e.key!==void 0&&(s=""+e.key),e)g0.call(e,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),l=0;l<a;l++)o[l]=arguments[l+2];r.children=o}if(t&&t.defaultProps)for(i in a=t.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return $f(t,s,r)};z.createRef=function(){return{current:null}};z.forwardRef=function(t){return{$$typeof:Y1,render:t}};z.isValidElement=Wf;z.lazy=function(t){return{$$typeof:f0,_payload:{_status:-1,_result:t},_init:nw}};z.memo=function(t,e){return{$$typeof:K1,type:t,compare:e===void 0?null:e}};z.startTransition=function(t){var e=he.T,n={};he.T=n;try{var i=t(),r=he.S;r!==null&&r(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Vf,u0)}catch(s){u0(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),he.T=e}};z.unstable_useCacheRefresh=function(){return he.H.useCacheRefresh()};z.use=function(t){return he.H.use(t)};z.useActionState=function(t,e,n){return he.H.useActionState(t,e,n)};z.useCallback=function(t,e){return he.H.useCallback(t,e)};z.useContext=function(t){return he.H.useContext(t)};z.useDebugValue=function(){};z.useDeferredValue=function(t,e){return he.H.useDeferredValue(t,e)};z.useEffect=function(t,e){return he.H.useEffect(t,e)};z.useEffectEvent=function(t){return he.H.useEffectEvent(t)};z.useId=function(){return he.H.useId()};z.useImperativeHandle=function(t,e,n){return he.H.useImperativeHandle(t,e,n)};z.useInsertionEffect=function(t,e){return he.H.useInsertionEffect(t,e)};z.useLayoutEffect=function(t,e){return he.H.useLayoutEffect(t,e)};z.useMemo=function(t,e){return he.H.useMemo(t,e)};z.useOptimistic=function(t,e){return he.H.useOptimistic(t,e)};z.useReducer=function(t,e,n){return he.H.useReducer(t,e,n)};z.useRef=function(t){return he.H.useRef(t)};z.useState=function(t){return he.H.useState(t)};z.useSyncExternalStore=function(t,e,n){return he.H.useSyncExternalStore(t,e,n)};z.useTransition=function(){return he.H.useTransition()};z.version="19.2.0"});var Dr=In((fL,x0)=>{"use strict";x0.exports=y0()});var C0=In(Me=>{"use strict";function Zf(t,e){var n=t.length;t.push(e);e:for(;0<n;){var i=n-1>>>1,r=t[i];if(0<El(r,e))t[i]=e,t[n]=r,n=i;else break e}}function Nn(t){return t.length===0?null:t[0]}function Al(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var i=0,r=t.length,s=r>>>1;i<s;){var a=2*(i+1)-1,o=t[a],l=a+1,c=t[l];if(0>El(o,n))l<r&&0>El(c,o)?(t[i]=c,t[l]=n,i=l):(t[i]=o,t[a]=n,i=a);else if(l<r&&0>El(c,n))t[i]=c,t[l]=n,i=l;else break e}}return e}function El(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Me.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(v0=performance,Me.unstable_now=function(){return v0.now()}):(Xf=Date,_0=Xf.now(),Me.unstable_now=function(){return Xf.now()-_0});var v0,Xf,_0,Qn=[],Di=[],rw=1,on=null,gt=3,Kf=!1,La=!1,Ia=!1,Jf=!1,M0=typeof setTimeout=="function"?setTimeout:null,w0=typeof clearTimeout=="function"?clearTimeout:null,S0=typeof setImmediate<"u"?setImmediate:null;function Tl(t){for(var e=Nn(Di);e!==null;){if(e.callback===null)Al(Di);else if(e.startTime<=t)Al(Di),e.sortIndex=e.expirationTime,Zf(Qn,e);else break;e=Nn(Di)}}function Qf(t){if(Ia=!1,Tl(t),!La)if(Nn(Qn)!==null)La=!0,ys||(ys=!0,gs());else{var e=Nn(Di);e!==null&&jf(Qf,e.startTime-t)}}var ys=!1,Na=-1,E0=5,T0=-1;function A0(){return Jf?!0:!(Me.unstable_now()-T0<E0)}function qf(){if(Jf=!1,ys){var t=Me.unstable_now();T0=t;var e=!0;try{e:{La=!1,Ia&&(Ia=!1,w0(Na),Na=-1),Kf=!0;var n=gt;try{t:{for(Tl(t),on=Nn(Qn);on!==null&&!(on.expirationTime>t&&A0());){var i=on.callback;if(typeof i=="function"){on.callback=null,gt=on.priorityLevel;var r=i(on.expirationTime<=t);if(t=Me.unstable_now(),typeof r=="function"){on.callback=r,Tl(t),e=!0;break t}on===Nn(Qn)&&Al(Qn),Tl(t)}else Al(Qn);on=Nn(Qn)}if(on!==null)e=!0;else{var s=Nn(Di);s!==null&&jf(Qf,s.startTime-t),e=!1}}break e}finally{on=null,gt=n,Kf=!1}e=void 0}}finally{e?gs():ys=!1}}}var gs;typeof S0=="function"?gs=function(){S0(qf)}:typeof MessageChannel<"u"?(Yf=new MessageChannel,b0=Yf.port2,Yf.port1.onmessage=qf,gs=function(){b0.postMessage(null)}):gs=function(){M0(qf,0)};var Yf,b0;function jf(t,e){Na=M0(function(){t(Me.unstable_now())},e)}Me.unstable_IdlePriority=5;Me.unstable_ImmediatePriority=1;Me.unstable_LowPriority=4;Me.unstable_NormalPriority=3;Me.unstable_Profiling=null;Me.unstable_UserBlockingPriority=2;Me.unstable_cancelCallback=function(t){t.callback=null};Me.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):E0=0<t?Math.floor(1e3/t):5};Me.unstable_getCurrentPriorityLevel=function(){return gt};Me.unstable_next=function(t){switch(gt){case 1:case 2:case 3:var e=3;break;default:e=gt}var n=gt;gt=e;try{return t()}finally{gt=n}};Me.unstable_requestPaint=function(){Jf=!0};Me.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=gt;gt=t;try{return e()}finally{gt=n}};Me.unstable_scheduleCallback=function(t,e,n){var i=Me.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:rw++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>i?(t.sortIndex=n,Zf(Di,t),Nn(Qn)===null&&t===Nn(Di)&&(Ia?(w0(Na),Na=-1):Ia=!0,jf(Qf,n-i))):(t.sortIndex=r,Zf(Qn,t),La||Kf||(La=!0,ys||(ys=!0,gs()))),t};Me.unstable_shouldYield=A0;Me.unstable_wrapCallback=function(t){var e=gt;return function(){var n=gt;gt=e;try{return t.apply(this,arguments)}finally{gt=n}}}});var D0=In((hL,R0)=>{"use strict";R0.exports=C0()});var L0=In(Et=>{"use strict";var sw=Dr();function U0(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Ui(){}var wt={d:{f:Ui,r:function(){throw Error(U0(522))},D:Ui,C:Ui,L:Ui,m:Ui,X:Ui,S:Ui,M:Ui},p:0,findDOMNode:null},aw=Symbol.for("react.portal");function ow(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:aw,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}var Pa=sw.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Cl(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Et.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=wt;Et.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(U0(299));return ow(t,e,null,n)};Et.flushSync=function(t){var e=Pa.T,n=wt.p;try{if(Pa.T=null,wt.p=2,t)return t()}finally{Pa.T=e,wt.p=n,wt.d.f()}};Et.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,wt.d.C(t,e))};Et.prefetchDNS=function(t){typeof t=="string"&&wt.d.D(t)};Et.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,i=Cl(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?wt.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):n==="script"&&wt.d.X(t,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Et.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Cl(e.as,e.crossOrigin);wt.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&wt.d.M(t)};Et.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,i=Cl(n,e.crossOrigin);wt.d.L(t,n,{crossOrigin:i,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Et.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Cl(e.as,e.crossOrigin);wt.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else wt.d.m(t)};Et.requestFormReset=function(t){wt.d.r(t)};Et.unstable_batchedUpdates=function(t,e){return t(e)};Et.useFormState=function(t,e,n){return Pa.H.useFormState(t,e,n)};Et.useFormStatus=function(){return Pa.H.useHostTransitionStatus()};Et.version="19.2.0"});var P0=In((mL,N0)=>{"use strict";function I0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(I0)}catch(t){console.error(t)}}I0(),N0.exports=L0()});var q_=In(jc=>{"use strict";var Ye=D0(),ox=Dr(),lw=P0();function w(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function lx(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function bo(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function cx(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function ux(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function O0(t){if(bo(t)!==t)throw Error(w(188))}function cw(t){var e=t.alternate;if(!e){if(e=bo(t),e===null)throw Error(w(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return O0(r),t;if(s===i)return O0(r),e;s=s.sibling}throw Error(w(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(w(189))}}if(n.alternate!==i)throw Error(w(190))}if(n.tag!==3)throw Error(w(188));return n.stateNode.current===n?t:e}function fx(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=fx(t),e!==null)return e;t=t.sibling}return null}var ge=Object.assign,uw=Symbol.for("react.element"),Rl=Symbol.for("react.transitional.element"),Ha=Symbol.for("react.portal"),Ms=Symbol.for("react.fragment"),dx=Symbol.for("react.strict_mode"),Id=Symbol.for("react.profiler"),hx=Symbol.for("react.consumer"),ai=Symbol.for("react.context"),Ch=Symbol.for("react.forward_ref"),Nd=Symbol.for("react.suspense"),Pd=Symbol.for("react.suspense_list"),Rh=Symbol.for("react.memo"),Li=Symbol.for("react.lazy");Symbol.for("react.scope");var Od=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var fw=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var B0=Symbol.iterator;function Oa(t){return t===null||typeof t!="object"?null:(t=B0&&t[B0]||t["@@iterator"],typeof t=="function"?t:null)}var dw=Symbol.for("react.client.reference");function Bd(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===dw?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Ms:return"Fragment";case Id:return"Profiler";case dx:return"StrictMode";case Nd:return"Suspense";case Pd:return"SuspenseList";case Od:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Ha:return"Portal";case ai:return t.displayName||"Context";case hx:return(t._context.displayName||"Context")+".Consumer";case Ch:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Rh:return e=t.displayName||null,e!==null?e:Bd(t.type)||"Memo";case Li:e=t._payload,t=t._init;try{return Bd(t(e))}catch{}}return null}var $a=Array.isArray,O=ox.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,te=lw.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Or={pending:!1,data:null,method:null,action:null},Fd=[],ws=-1;function zn(t){return{current:t}}function tt(t){0>ws||(t.current=Fd[ws],Fd[ws]=null,ws--)}function fe(t,e){ws++,Fd[ws]=t.current,t.current=e}var Fn=zn(null),oo=zn(null),Hi=zn(null),lc=zn(null);function cc(t,e){switch(fe(Hi,e),fe(oo,t),fe(Fn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?$y(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=$y(e),t=I_(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}tt(Fn),fe(Fn,t)}function ks(){tt(Fn),tt(oo),tt(Hi)}function zd(t){t.memoizedState!==null&&fe(lc,t);var e=Fn.current,n=I_(e,t.type);e!==n&&(fe(oo,t),fe(Fn,n))}function uc(t){oo.current===t&&(tt(Fn),tt(oo)),lc.current===t&&(tt(lc),vo._currentValue=Or)}var ed,F0;function Lr(t){if(ed===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);ed=e&&e[1]||"",F0=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ed+t+F0}var td=!1;function nd(t,e){if(!t||td)return"";td=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(e){var f=function(){throw Error()};if(Object.defineProperty(f.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(f,[])}catch(h){var d=h}Reflect.construct(t,[],f)}else{try{f.call()}catch(h){d=h}t.call(f.prototype)}}else{try{throw Error()}catch(h){d=h}(f=t())&&typeof f.catch=="function"&&f.catch(function(){})}}catch(h){if(h&&d&&typeof h.stack=="string")return[h.stack,d.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),a=s[0],o=s[1];if(a&&o){var l=a.split(`
`),c=o.split(`
`);for(r=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(i===l.length||r===c.length)for(i=l.length-1,r=c.length-1;1<=i&&0<=r&&l[i]!==c[r];)r--;for(;1<=i&&0<=r;i--,r--)if(l[i]!==c[r]){if(i!==1||r!==1)do if(i--,r--,0>r||l[i]!==c[r]){var u=`
`+l[i].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=i&&0<=r);break}}}finally{td=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?Lr(n):""}function hw(t,e){switch(t.tag){case 26:case 27:case 5:return Lr(t.type);case 16:return Lr("Lazy");case 13:return t.child!==e&&e!==null?Lr("Suspense Fallback"):Lr("Suspense");case 19:return Lr("SuspenseList");case 0:case 15:return nd(t.type,!1);case 11:return nd(t.type.render,!1);case 1:return nd(t.type,!0);case 31:return Lr("Activity");default:return""}}function z0(t){try{var e="",n=null;do e+=hw(t,n),n=t,t=t.return;while(t);return e}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Vd=Object.prototype.hasOwnProperty,Dh=Ye.unstable_scheduleCallback,id=Ye.unstable_cancelCallback,pw=Ye.unstable_shouldYield,mw=Ye.unstable_requestPaint,Yt=Ye.unstable_now,gw=Ye.unstable_getCurrentPriorityLevel,px=Ye.unstable_ImmediatePriority,mx=Ye.unstable_UserBlockingPriority,fc=Ye.unstable_NormalPriority,yw=Ye.unstable_LowPriority,gx=Ye.unstable_IdlePriority,xw=Ye.log,vw=Ye.unstable_setDisableYieldValue,Mo=null,Zt=null;function Fi(t){if(typeof xw=="function"&&vw(t),Zt&&typeof Zt.setStrictMode=="function")try{Zt.setStrictMode(Mo,t)}catch{}}var Kt=Math.clz32?Math.clz32:bw,_w=Math.log,Sw=Math.LN2;function bw(t){return t>>>=0,t===0?32:31-(_w(t)/Sw|0)|0}var Dl=256,Ul=262144,Ll=4194304;function Ir(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Bc(t,e,n){var i=t.pendingLanes;if(i===0)return 0;var r=0,s=t.suspendedLanes,a=t.pingedLanes;t=t.warmLanes;var o=i&134217727;return o!==0?(i=o&~s,i!==0?r=Ir(i):(a&=o,a!==0?r=Ir(a):n||(n=o&~t,n!==0&&(r=Ir(n))))):(o=i&~s,o!==0?r=Ir(o):a!==0?r=Ir(a):n||(n=i&~t,n!==0&&(r=Ir(n)))),r===0?0:e!==0&&e!==r&&(e&s)===0&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function wo(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function Mw(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yx(){var t=Ll;return Ll<<=1,(Ll&62914560)===0&&(Ll=4194304),t}function rd(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Eo(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function ww(t,e,n,i,r,s){var a=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var o=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=a&~n;0<n;){var u=31-Kt(n),f=1<<u;o[u]=0,l[u]=-1;var d=c[u];if(d!==null)for(c[u]=null,u=0;u<d.length;u++){var h=d[u];h!==null&&(h.lane&=-536870913)}n&=~f}i!==0&&xx(t,i,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(a&~e))}function xx(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var i=31-Kt(e);t.entangledLanes|=e,t.entanglements[i]=t.entanglements[i]|1073741824|n&261930}function vx(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-Kt(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}function _x(t,e){var n=e&-e;return n=(n&42)!==0?1:Uh(n),(n&(t.suspendedLanes|e))!==0?0:n}function Uh(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Lh(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Sx(){var t=te.p;return t!==0?t:(t=window.event,t===void 0?32:$_(t.type))}function V0(t,e){var n=te.p;try{return te.p=t,e()}finally{te.p=n}}var nr=Math.random().toString(36).slice(2),lt="__reactFiber$"+nr,Ot="__reactProps$"+nr,js="__reactContainer$"+nr,Gd="__reactEvents$"+nr,Ew="__reactListeners$"+nr,Tw="__reactHandles$"+nr,G0="__reactResources$"+nr,To="__reactMarker$"+nr;function Ih(t){delete t[lt],delete t[Ot],delete t[Gd],delete t[Ew],delete t[Tw]}function Es(t){var e=t[lt];if(e)return e;for(var n=t.parentNode;n;){if(e=n[js]||n[lt]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Zy(t);t!==null;){if(n=t[lt])return n;t=Zy(t)}return e}t=n,n=t.parentNode}return null}function ea(t){if(t=t[lt]||t[js]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function Wa(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(w(33))}function Ps(t){var e=t[G0];return e||(e=t[G0]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function et(t){t[To]=!0}var bx=new Set,Mx={};function Xr(t,e){Hs(t,e),Hs(t+"Capture",e)}function Hs(t,e){for(Mx[t]=e,t=0;t<e.length;t++)bx.add(e[t])}var Aw=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),k0={},H0={};function Cw(t){return Vd.call(H0,t)?!0:Vd.call(k0,t)?!1:Aw.test(t)?H0[t]=!0:(k0[t]=!0,!1)}function ql(t,e,n){if(Cw(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var i=e.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Il(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function jn(t,e,n,i){if(i===null)t.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+i)}}function cn(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function wx(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function Rw(t,e,n){var i=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){n=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(a){n=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function kd(t){if(!t._valueTracker){var e=wx(t)?"checked":"value";t._valueTracker=Rw(t,e,""+t[e])}}function Ex(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=wx(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function dc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Dw=/[\n"\\]/g;function dn(t){return t.replace(Dw,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Hd(t,e,n,i,r,s,a,o){t.name="",a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"?t.type=a:t.removeAttribute("type"),e!=null?a==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+cn(e)):t.value!==""+cn(e)&&(t.value=""+cn(e)):a!=="submit"&&a!=="reset"||t.removeAttribute("value"),e!=null?$d(t,a,cn(e)):n!=null?$d(t,a,cn(n)):i!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?t.name=""+cn(o):t.removeAttribute("name")}function Tx(t,e,n,i,r,s,a,o){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){kd(t);return}n=n!=null?""+cn(n):"",e=e!=null?""+cn(e):n,o||e===t.value||(t.value=e),t.defaultValue=e}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,t.checked=o?t.checked:!!i,t.defaultChecked=!!i,a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(t.name=a),kd(t)}function $d(t,e,n){e==="number"&&dc(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Os(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+cn(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Ax(t,e,n){if(e!=null&&(e=""+cn(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+cn(n):""}function Cx(t,e,n,i){if(e==null){if(i!=null){if(n!=null)throw Error(w(92));if($a(i)){if(1<i.length)throw Error(w(93));i=i[0]}n=i}n==null&&(n=""),e=n}n=cn(e),t.defaultValue=n,i=t.textContent,i===n&&i!==""&&i!==null&&(t.value=i),kd(t)}function $s(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Uw=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $0(t,e,n){var i=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":i?t.setProperty(e,n):typeof n!="number"||n===0||Uw.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Rx(t,e,n){if(e!=null&&typeof e!="object")throw Error(w(62));if(t=t.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||e!=null&&e.hasOwnProperty(i)||(i.indexOf("--")===0?t.setProperty(i,""):i==="float"?t.cssFloat="":t[i]="");for(var r in e)i=e[r],e.hasOwnProperty(r)&&n[r]!==i&&$0(t,r,i)}else for(var s in e)e.hasOwnProperty(s)&&$0(t,s,e[s])}function Nh(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Lw=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Iw=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Yl(t){return Iw.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function oi(){}var Wd=null;function Ph(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ts=null,Bs=null;function W0(t){var e=ea(t);if(e&&(t=e.stateNode)){var n=t[Ot]||null;e:switch(t=e.stateNode,e.type){case"input":if(Hd(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+dn(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=i[Ot]||null;if(!r)throw Error(w(90));Hd(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)i=n[e],i.form===t.form&&Ex(i)}break e;case"textarea":Ax(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&Os(t,!!n.multiple,e,!1)}}}var sd=!1;function Dx(t,e,n){if(sd)return t(e,n);sd=!0;try{var i=t(e);return i}finally{if(sd=!1,(Ts!==null||Bs!==null)&&(Zc(),Ts&&(e=Ts,t=Bs,Bs=Ts=null,W0(e),t)))for(e=0;e<t.length;e++)W0(t[e])}}function lo(t,e){var n=t.stateNode;if(n===null)return null;var i=n[Ot]||null;if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(w(231,e,typeof n));return n}var di=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Xd=!1;if(di)try{xs={},Object.defineProperty(xs,"passive",{get:function(){Xd=!0}}),window.addEventListener("test",xs,xs),window.removeEventListener("test",xs,xs)}catch{Xd=!1}var xs,zi=null,Oh=null,Zl=null;function Ux(){if(Zl)return Zl;var t,e=Oh,n=e.length,i,r="value"in zi?zi.value:zi.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return Zl=r.slice(t,1<i?1-i:void 0)}function Kl(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Nl(){return!0}function X0(){return!1}function Bt(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Nl:X0,this.isPropagationStopped=X0,this}return ge(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Nl)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Nl)},persist:function(){},isPersistent:Nl}),e}var qr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fc=Bt(qr),Ao=ge({},qr,{view:0,detail:0}),Nw=Bt(Ao),ad,od,Ba,zc=ge({},Ao,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Bh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Ba&&(Ba&&t.type==="mousemove"?(ad=t.screenX-Ba.screenX,od=t.screenY-Ba.screenY):od=ad=0,Ba=t),ad)},movementY:function(t){return"movementY"in t?t.movementY:od}}),q0=Bt(zc),Pw=ge({},zc,{dataTransfer:0}),Ow=Bt(Pw),Bw=ge({},Ao,{relatedTarget:0}),ld=Bt(Bw),Fw=ge({},qr,{animationName:0,elapsedTime:0,pseudoElement:0}),zw=Bt(Fw),Vw=ge({},qr,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Gw=Bt(Vw),kw=ge({},qr,{data:0}),Y0=Bt(kw),Hw={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},$w={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ww={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Xw(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Ww[t])?!!e[t]:!1}function Bh(){return Xw}var qw=ge({},Ao,{key:function(t){if(t.key){var e=Hw[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Kl(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?$w[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Bh,charCode:function(t){return t.type==="keypress"?Kl(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Kl(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Yw=Bt(qw),Zw=ge({},zc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Z0=Bt(Zw),Kw=ge({},Ao,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Bh}),Jw=Bt(Kw),Qw=ge({},qr,{propertyName:0,elapsedTime:0,pseudoElement:0}),jw=Bt(Qw),eE=ge({},zc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),tE=Bt(eE),nE=ge({},qr,{newState:0,oldState:0}),iE=Bt(nE),rE=[9,13,27,32],Fh=di&&"CompositionEvent"in window,Ya=null;di&&"documentMode"in document&&(Ya=document.documentMode);var sE=di&&"TextEvent"in window&&!Ya,Lx=di&&(!Fh||Ya&&8<Ya&&11>=Ya),K0=" ",J0=!1;function Ix(t,e){switch(t){case"keyup":return rE.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Nx(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var As=!1;function aE(t,e){switch(t){case"compositionend":return Nx(e);case"keypress":return e.which!==32?null:(J0=!0,K0);case"textInput":return t=e.data,t===K0&&J0?null:t;default:return null}}function oE(t,e){if(As)return t==="compositionend"||!Fh&&Ix(t,e)?(t=Ux(),Zl=Oh=zi=null,As=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Lx&&e.locale!=="ko"?null:e.data;default:return null}}var lE={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Q0(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!lE[t.type]:e==="textarea"}function Px(t,e,n,i){Ts?Bs?Bs.push(i):Bs=[i]:Ts=i,e=Dc(e,"onChange"),0<e.length&&(n=new Fc("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var Za=null,co=null;function cE(t){D_(t,0)}function Vc(t){var e=Wa(t);if(Ex(e))return t}function j0(t,e){if(t==="change")return e}var Ox=!1;di&&(di?(Ol="oninput"in document,Ol||(cd=document.createElement("div"),cd.setAttribute("oninput","return;"),Ol=typeof cd.oninput=="function"),Pl=Ol):Pl=!1,Ox=Pl&&(!document.documentMode||9<document.documentMode));var Pl,Ol,cd;function ey(){Za&&(Za.detachEvent("onpropertychange",Bx),co=Za=null)}function Bx(t){if(t.propertyName==="value"&&Vc(co)){var e=[];Px(e,co,t,Ph(t)),Dx(cE,e)}}function uE(t,e,n){t==="focusin"?(ey(),Za=e,co=n,Za.attachEvent("onpropertychange",Bx)):t==="focusout"&&ey()}function fE(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Vc(co)}function dE(t,e){if(t==="click")return Vc(e)}function hE(t,e){if(t==="input"||t==="change")return Vc(e)}function pE(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Qt=typeof Object.is=="function"?Object.is:pE;function uo(t,e){if(Qt(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!Vd.call(e,r)||!Qt(t[r],e[r]))return!1}return!0}function ty(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function ny(t,e){var n=ty(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=ty(n)}}function Fx(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Fx(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function zx(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=dc(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=dc(t.document)}return e}function zh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var mE=di&&"documentMode"in document&&11>=document.documentMode,Cs=null,qd=null,Ka=null,Yd=!1;function iy(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Yd||Cs==null||Cs!==dc(i)||(i=Cs,"selectionStart"in i&&zh(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Ka&&uo(Ka,i)||(Ka=i,i=Dc(qd,"onSelect"),0<i.length&&(e=new Fc("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Cs)))}function Ur(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Rs={animationend:Ur("Animation","AnimationEnd"),animationiteration:Ur("Animation","AnimationIteration"),animationstart:Ur("Animation","AnimationStart"),transitionrun:Ur("Transition","TransitionRun"),transitionstart:Ur("Transition","TransitionStart"),transitioncancel:Ur("Transition","TransitionCancel"),transitionend:Ur("Transition","TransitionEnd")},ud={},Vx={};di&&(Vx=document.createElement("div").style,"AnimationEvent"in window||(delete Rs.animationend.animation,delete Rs.animationiteration.animation,delete Rs.animationstart.animation),"TransitionEvent"in window||delete Rs.transitionend.transition);function Yr(t){if(ud[t])return ud[t];if(!Rs[t])return t;var e=Rs[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Vx)return ud[t]=e[n];return t}var Gx=Yr("animationend"),kx=Yr("animationiteration"),Hx=Yr("animationstart"),gE=Yr("transitionrun"),yE=Yr("transitionstart"),xE=Yr("transitioncancel"),$x=Yr("transitionend"),Wx=new Map,Zd="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Zd.push("scrollEnd");function An(t,e){Wx.set(t,e),Xr(e,[t])}var hc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ln=[],Ds=0,Vh=0;function Gc(){for(var t=Ds,e=Vh=Ds=0;e<t;){var n=ln[e];ln[e++]=null;var i=ln[e];ln[e++]=null;var r=ln[e];ln[e++]=null;var s=ln[e];if(ln[e++]=null,i!==null&&r!==null){var a=i.pending;a===null?r.next=r:(r.next=a.next,a.next=r),i.pending=r}s!==0&&Xx(n,r,s)}}function kc(t,e,n,i){ln[Ds++]=t,ln[Ds++]=e,ln[Ds++]=n,ln[Ds++]=i,Vh|=i,t.lanes|=i,t=t.alternate,t!==null&&(t.lanes|=i)}function Gh(t,e,n,i){return kc(t,e,n,i),pc(t)}function Zr(t,e){return kc(t,null,null,e),pc(t)}function Xx(t,e,n){t.lanes|=n;var i=t.alternate;i!==null&&(i.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,i=s.alternate,i!==null&&(i.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-Kt(n),t=s.hiddenUpdates,i=t[r],i===null?t[r]=[e]:i.push(e),e.lane=n|536870912),s):null}function pc(t){if(50<so)throw so=0,gh=null,Error(w(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Us={};function vE(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Xt(t,e,n,i){return new vE(t,e,n,i)}function kh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function ci(t,e){var n=t.alternate;return n===null?(n=Xt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function qx(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Jl(t,e,n,i,r,s){var a=0;if(i=t,typeof t=="function")kh(t)&&(a=1);else if(typeof t=="string")a=bT(t,n,Fn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Od:return t=Xt(31,n,e,r),t.elementType=Od,t.lanes=s,t;case Ms:return Br(n.children,r,s,e);case dx:a=8,r|=24;break;case Id:return t=Xt(12,n,e,r|2),t.elementType=Id,t.lanes=s,t;case Nd:return t=Xt(13,n,e,r),t.elementType=Nd,t.lanes=s,t;case Pd:return t=Xt(19,n,e,r),t.elementType=Pd,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case ai:a=10;break e;case hx:a=9;break e;case Ch:a=11;break e;case Rh:a=14;break e;case Li:a=16,i=null;break e}a=29,n=Error(w(130,t===null?"null":typeof t,"")),i=null}return e=Xt(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function Br(t,e,n,i){return t=Xt(7,t,i,e),t.lanes=n,t}function fd(t,e,n){return t=Xt(6,t,null,e),t.lanes=n,t}function Yx(t){var e=Xt(18,null,null,0);return e.stateNode=t,e}function dd(t,e,n){return e=Xt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var ry=new WeakMap;function hn(t,e){if(typeof t=="object"&&t!==null){var n=ry.get(t);return n!==void 0?n:(e={value:t,source:e,stack:z0(e)},ry.set(t,e),e)}return{value:t,source:e,stack:z0(e)}}var Ls=[],Is=0,mc=null,fo=0,un=[],fn=0,Qi=null,Pn=1,On="";function ri(t,e){Ls[Is++]=fo,Ls[Is++]=mc,mc=t,fo=e}function Zx(t,e,n){un[fn++]=Pn,un[fn++]=On,un[fn++]=Qi,Qi=t;var i=Pn;t=On;var r=32-Kt(i)-1;i&=~(1<<r),n+=1;var s=32-Kt(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,Pn=1<<32-Kt(e)+r|n<<r|i,On=s+t}else Pn=1<<s|n<<r|i,On=t}function Hh(t){t.return!==null&&(ri(t,1),Zx(t,1,0))}function $h(t){for(;t===mc;)mc=Ls[--Is],Ls[Is]=null,fo=Ls[--Is],Ls[Is]=null;for(;t===Qi;)Qi=un[--fn],un[fn]=null,On=un[--fn],un[fn]=null,Pn=un[--fn],un[fn]=null}function Kx(t,e){un[fn++]=Pn,un[fn++]=On,un[fn++]=Qi,Pn=e.id,On=e.overflow,Qi=t}var ct=null,me=null,K=!1,$i=null,pn=!1,Kd=Error(w(519));function ji(t){var e=Error(w(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw ho(hn(e,t)),Kd}function sy(t){var e=t.stateNode,n=t.type,i=t.memoizedProps;switch(e[lt]=t,e[Ot]=i,n){case"dialog":k("cancel",e),k("close",e);break;case"iframe":case"object":case"embed":k("load",e);break;case"video":case"audio":for(n=0;n<yo.length;n++)k(yo[n],e);break;case"source":k("error",e);break;case"img":case"image":case"link":k("error",e),k("load",e);break;case"details":k("toggle",e);break;case"input":k("invalid",e),Tx(e,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":k("invalid",e);break;case"textarea":k("invalid",e),Cx(e,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||i.suppressHydrationWarning===!0||L_(e.textContent,n)?(i.popover!=null&&(k("beforetoggle",e),k("toggle",e)),i.onScroll!=null&&k("scroll",e),i.onScrollEnd!=null&&k("scrollend",e),i.onClick!=null&&(e.onclick=oi),e=!0):e=!1,e||ji(t,!0)}function ay(t){for(ct=t.return;ct;)switch(ct.tag){case 5:case 31:case 13:pn=!1;return;case 27:case 3:pn=!0;return;default:ct=ct.return}}function vs(t){if(t!==ct)return!1;if(!K)return ay(t),K=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Sh(t.type,t.memoizedProps)),n=!n),n&&me&&ji(t),ay(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(w(317));me=Yy(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(w(317));me=Yy(t)}else e===27?(e=me,ir(t.type)?(t=Eh,Eh=null,me=t):me=e):me=ct?gn(t.stateNode.nextSibling):null;return!0}function Gr(){me=ct=null,K=!1}function hd(){var t=$i;return t!==null&&(Nt===null?Nt=t:Nt.push.apply(Nt,t),$i=null),t}function ho(t){$i===null?$i=[t]:$i.push(t)}var Jd=zn(null),Kr=null,li=null;function Ni(t,e,n){fe(Jd,e._currentValue),e._currentValue=n}function ui(t){t._currentValue=Jd.current,tt(Jd)}function Qd(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function jd(t,e,n,i){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var a=r.child;s=s.firstContext;e:for(;s!==null;){var o=s;s=r;for(var l=0;l<e.length;l++)if(o.context===e[l]){s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Qd(s.return,n,t),i||(a=null);break e}s=o.next}}else if(r.tag===18){if(a=r.return,a===null)throw Error(w(341));a.lanes|=n,s=a.alternate,s!==null&&(s.lanes|=n),Qd(a,n,t),a=null}else a=r.child;if(a!==null)a.return=r;else for(a=r;a!==null;){if(a===t){a=null;break}if(r=a.sibling,r!==null){r.return=a.return,a=r;break}a=a.return}r=a}}function ta(t,e,n,i){t=null;for(var r=e,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var a=r.alternate;if(a===null)throw Error(w(387));if(a=a.memoizedProps,a!==null){var o=r.type;Qt(r.pendingProps.value,a.value)||(t!==null?t.push(o):t=[o])}}else if(r===lc.current){if(a=r.alternate,a===null)throw Error(w(387));a.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(vo):t=[vo])}r=r.return}t!==null&&jd(e,t,n,i),e.flags|=262144}function gc(t){for(t=t.firstContext;t!==null;){if(!Qt(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function kr(t){Kr=t,li=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function ut(t){return Jx(Kr,t)}function Bl(t,e){return Kr===null&&kr(t),Jx(t,e)}function Jx(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},li===null){if(t===null)throw Error(w(308));li=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else li=li.next=e;return n}var _E=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,i){t.push(i)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},SE=Ye.unstable_scheduleCallback,bE=Ye.unstable_NormalPriority,He={$$typeof:ai,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Wh(){return{controller:new _E,data:new Map,refCount:0}}function Co(t){t.refCount--,t.refCount===0&&SE(bE,function(){t.controller.abort()})}var Ja=null,eh=0,Ws=0,Fs=null;function ME(t,e){if(Ja===null){var n=Ja=[];eh=0,Ws=gp(),Fs={status:"pending",value:void 0,then:function(i){n.push(i)}}}return eh++,e.then(oy,oy),e}function oy(){if(--eh===0&&Ja!==null){Fs!==null&&(Fs.status="fulfilled");var t=Ja;Ja=null,Ws=0,Fs=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function wE(t,e){var n=[],i={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){i.status="fulfilled",i.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(i.status="rejected",i.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),i}var ly=O.S;O.S=function(t,e){f_=Yt(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&ME(t,e),ly!==null&&ly(t,e)};var Fr=zn(null);function Xh(){var t=Fr.current;return t!==null?t:ue.pooledCache}function Ql(t,e){e===null?fe(Fr,Fr.current):fe(Fr,e.pool)}function Qx(){var t=Xh();return t===null?null:{parent:He._currentValue,pool:t}}var na=Error(w(460)),qh=Error(w(474)),Hc=Error(w(542)),yc={then:function(){}};function cy(t){return t=t.status,t==="fulfilled"||t==="rejected"}function jx(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(oi,oi),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,fy(t),t;default:if(typeof e.status=="string")e.then(oi,oi);else{if(t=ue,t!==null&&100<t.shellSuspendCounter)throw Error(w(482));t=e,t.status="pending",t.then(function(i){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=i}},function(i){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=i}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,fy(t),t}throw zr=e,na}}function Nr(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(zr=n,na):n}}var zr=null;function uy(){if(zr===null)throw Error(w(459));var t=zr;return zr=null,t}function fy(t){if(t===na||t===Hc)throw Error(w(483))}var zs=null,po=0;function Fl(t){var e=po;return po+=1,zs===null&&(zs=[]),jx(zs,t,e)}function Fa(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function zl(t,e){throw e.$$typeof===uw?Error(w(525)):(t=Object.prototype.toString.call(e),Error(w(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function ev(t){function e(g,m){if(t){var y=g.deletions;y===null?(g.deletions=[m],g.flags|=16):y.push(m)}}function n(g,m){if(!t)return null;for(;m!==null;)e(g,m),m=m.sibling;return null}function i(g){for(var m=new Map;g!==null;)g.key!==null?m.set(g.key,g):m.set(g.index,g),g=g.sibling;return m}function r(g,m){return g=ci(g,m),g.index=0,g.sibling=null,g}function s(g,m,y){return g.index=y,t?(y=g.alternate,y!==null?(y=y.index,y<m?(g.flags|=67108866,m):y):(g.flags|=67108866,m)):(g.flags|=1048576,m)}function a(g){return t&&g.alternate===null&&(g.flags|=67108866),g}function o(g,m,y,_){return m===null||m.tag!==6?(m=fd(y,g.mode,_),m.return=g,m):(m=r(m,y),m.return=g,m)}function l(g,m,y,_){var S=y.type;return S===Ms?u(g,m,y.props.children,_,y.key):m!==null&&(m.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Li&&Nr(S)===m.type)?(m=r(m,y.props),Fa(m,y),m.return=g,m):(m=Jl(y.type,y.key,y.props,null,g.mode,_),Fa(m,y),m.return=g,m)}function c(g,m,y,_){return m===null||m.tag!==4||m.stateNode.containerInfo!==y.containerInfo||m.stateNode.implementation!==y.implementation?(m=dd(y,g.mode,_),m.return=g,m):(m=r(m,y.children||[]),m.return=g,m)}function u(g,m,y,_,S){return m===null||m.tag!==7?(m=Br(y,g.mode,_,S),m.return=g,m):(m=r(m,y),m.return=g,m)}function f(g,m,y){if(typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint")return m=fd(""+m,g.mode,y),m.return=g,m;if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Rl:return y=Jl(m.type,m.key,m.props,null,g.mode,y),Fa(y,m),y.return=g,y;case Ha:return m=dd(m,g.mode,y),m.return=g,m;case Li:return m=Nr(m),f(g,m,y)}if($a(m)||Oa(m))return m=Br(m,g.mode,y,null),m.return=g,m;if(typeof m.then=="function")return f(g,Fl(m),y);if(m.$$typeof===ai)return f(g,Bl(g,m),y);zl(g,m)}return null}function d(g,m,y,_){var S=m!==null?m.key:null;if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return S!==null?null:o(g,m,""+y,_);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Rl:return y.key===S?l(g,m,y,_):null;case Ha:return y.key===S?c(g,m,y,_):null;case Li:return y=Nr(y),d(g,m,y,_)}if($a(y)||Oa(y))return S!==null?null:u(g,m,y,_,null);if(typeof y.then=="function")return d(g,m,Fl(y),_);if(y.$$typeof===ai)return d(g,m,Bl(g,y),_);zl(g,y)}return null}function h(g,m,y,_,S){if(typeof _=="string"&&_!==""||typeof _=="number"||typeof _=="bigint")return g=g.get(y)||null,o(m,g,""+_,S);if(typeof _=="object"&&_!==null){switch(_.$$typeof){case Rl:return g=g.get(_.key===null?y:_.key)||null,l(m,g,_,S);case Ha:return g=g.get(_.key===null?y:_.key)||null,c(m,g,_,S);case Li:return _=Nr(_),h(g,m,y,_,S)}if($a(_)||Oa(_))return g=g.get(y)||null,u(m,g,_,S,null);if(typeof _.then=="function")return h(g,m,y,Fl(_),S);if(_.$$typeof===ai)return h(g,m,y,Bl(m,_),S);zl(m,_)}return null}function p(g,m,y,_){for(var S=null,A=null,E=m,U=m=0,L=null;E!==null&&U<y.length;U++){E.index>U?(L=E,E=null):L=E.sibling;var P=d(g,E,y[U],_);if(P===null){E===null&&(E=L);break}t&&E&&P.alternate===null&&e(g,E),m=s(P,m,U),A===null?S=P:A.sibling=P,A=P,E=L}if(U===y.length)return n(g,E),K&&ri(g,U),S;if(E===null){for(;U<y.length;U++)E=f(g,y[U],_),E!==null&&(m=s(E,m,U),A===null?S=E:A.sibling=E,A=E);return K&&ri(g,U),S}for(E=i(E);U<y.length;U++)L=h(E,g,U,y[U],_),L!==null&&(t&&L.alternate!==null&&E.delete(L.key===null?U:L.key),m=s(L,m,U),A===null?S=L:A.sibling=L,A=L);return t&&E.forEach(function($){return e(g,$)}),K&&ri(g,U),S}function x(g,m,y,_){if(y==null)throw Error(w(151));for(var S=null,A=null,E=m,U=m=0,L=null,P=y.next();E!==null&&!P.done;U++,P=y.next()){E.index>U?(L=E,E=null):L=E.sibling;var $=d(g,E,P.value,_);if($===null){E===null&&(E=L);break}t&&E&&$.alternate===null&&e(g,E),m=s($,m,U),A===null?S=$:A.sibling=$,A=$,E=L}if(P.done)return n(g,E),K&&ri(g,U),S;if(E===null){for(;!P.done;U++,P=y.next())P=f(g,P.value,_),P!==null&&(m=s(P,m,U),A===null?S=P:A.sibling=P,A=P);return K&&ri(g,U),S}for(E=i(E);!P.done;U++,P=y.next())P=h(E,g,U,P.value,_),P!==null&&(t&&P.alternate!==null&&E.delete(P.key===null?U:P.key),m=s(P,m,U),A===null?S=P:A.sibling=P,A=P);return t&&E.forEach(function(_e){return e(g,_e)}),K&&ri(g,U),S}function b(g,m,y,_){if(typeof y=="object"&&y!==null&&y.type===Ms&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Rl:e:{for(var S=y.key;m!==null;){if(m.key===S){if(S=y.type,S===Ms){if(m.tag===7){n(g,m.sibling),_=r(m,y.props.children),_.return=g,g=_;break e}}else if(m.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Li&&Nr(S)===m.type){n(g,m.sibling),_=r(m,y.props),Fa(_,y),_.return=g,g=_;break e}n(g,m);break}else e(g,m);m=m.sibling}y.type===Ms?(_=Br(y.props.children,g.mode,_,y.key),_.return=g,g=_):(_=Jl(y.type,y.key,y.props,null,g.mode,_),Fa(_,y),_.return=g,g=_)}return a(g);case Ha:e:{for(S=y.key;m!==null;){if(m.key===S)if(m.tag===4&&m.stateNode.containerInfo===y.containerInfo&&m.stateNode.implementation===y.implementation){n(g,m.sibling),_=r(m,y.children||[]),_.return=g,g=_;break e}else{n(g,m);break}else e(g,m);m=m.sibling}_=dd(y,g.mode,_),_.return=g,g=_}return a(g);case Li:return y=Nr(y),b(g,m,y,_)}if($a(y))return p(g,m,y,_);if(Oa(y)){if(S=Oa(y),typeof S!="function")throw Error(w(150));return y=S.call(y),x(g,m,y,_)}if(typeof y.then=="function")return b(g,m,Fl(y),_);if(y.$$typeof===ai)return b(g,m,Bl(g,y),_);zl(g,y)}return typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint"?(y=""+y,m!==null&&m.tag===6?(n(g,m.sibling),_=r(m,y),_.return=g,g=_):(n(g,m),_=fd(y,g.mode,_),_.return=g,g=_),a(g)):n(g,m)}return function(g,m,y,_){try{po=0;var S=b(g,m,y,_);return zs=null,S}catch(E){if(E===na||E===Hc)throw E;var A=Xt(29,E,null,g.mode);return A.lanes=_,A.return=g,A}finally{}}}var Hr=ev(!0),tv=ev(!1),Ii=!1;function Yh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function th(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Wi(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Xi(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,(ee&2)!==0){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,e=pc(t),Xx(t,null,n),e}return kc(t,i,e,n),pc(t)}function Qa(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,vx(t,n)}}function pd(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var nh=!1;function ja(){if(nh){var t=Fs;if(t!==null)throw t}}function eo(t,e,n,i){nh=!1;var r=t.updateQueue;Ii=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,c=l.next;l.next=null,a===null?s=c:a.next=c,a=l;var u=t.alternate;u!==null&&(u=u.updateQueue,o=u.lastBaseUpdate,o!==a&&(o===null?u.firstBaseUpdate=c:o.next=c,u.lastBaseUpdate=l))}if(s!==null){var f=r.baseState;a=0,u=c=l=null,o=s;do{var d=o.lane&-536870913,h=d!==o.lane;if(h?(X&d)===d:(i&d)===d){d!==0&&d===Ws&&(nh=!0),u!==null&&(u=u.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});e:{var p=t,x=o;d=e;var b=n;switch(x.tag){case 1:if(p=x.payload,typeof p=="function"){f=p.call(b,f,d);break e}f=p;break e;case 3:p.flags=p.flags&-65537|128;case 0:if(p=x.payload,d=typeof p=="function"?p.call(b,f,d):p,d==null)break e;f=ge({},f,d);break e;case 2:Ii=!0}}d=o.callback,d!==null&&(t.flags|=64,h&&(t.flags|=8192),h=r.callbacks,h===null?r.callbacks=[d]:h.push(d))}else h={lane:d,tag:o.tag,payload:o.payload,callback:o.callback,next:null},u===null?(c=u=h,l=f):u=u.next=h,a|=d;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;h=o,o=h.next,h.next=null,r.lastBaseUpdate=h,r.shared.pending=null}}while(!0);u===null&&(l=f),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,s===null&&(r.shared.lanes=0),tr|=a,t.lanes=a,t.memoizedState=f}}function nv(t,e){if(typeof t!="function")throw Error(w(191,t));t.call(e)}function iv(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)nv(n[t],e)}var Xs=zn(null),xc=zn(0);function dy(t,e){t=gi,fe(xc,t),fe(Xs,e),gi=t|e.baseLanes}function ih(){fe(xc,gi),fe(Xs,Xs.current)}function Zh(){gi=xc.current,tt(Xs),tt(xc)}var jt=zn(null),mn=null;function Pi(t){var e=t.alternate;fe(Pe,Pe.current&1),fe(jt,t),mn===null&&(e===null||Xs.current!==null||e.memoizedState!==null)&&(mn=t)}function rh(t){fe(Pe,Pe.current),fe(jt,t),mn===null&&(mn=t)}function rv(t){t.tag===22?(fe(Pe,Pe.current),fe(jt,t),mn===null&&(mn=t)):Oi(t)}function Oi(){fe(Pe,Pe.current),fe(jt,jt.current)}function Wt(t){tt(jt),mn===t&&(mn=null),tt(Pe)}var Pe=zn(0);function vc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Mh(n)||wh(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var hi=0,V=null,oe=null,Ge=null,_c=!1,Vs=!1,$r=!1,Sc=0,mo=0,Gs=null,EE=0;function De(){throw Error(w(321))}function Kh(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Qt(t[n],e[n]))return!1;return!0}function Jh(t,e,n,i,r,s){return hi=s,V=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,O.H=t===null||t.memoizedState===null?Pv:lp,$r=!1,s=n(i,r),$r=!1,Vs&&(s=av(e,n,i,r)),sv(t),s}function sv(t){O.H=go;var e=oe!==null&&oe.next!==null;if(hi=0,Ge=oe=V=null,_c=!1,mo=0,Gs=null,e)throw Error(w(300));t===null||$e||(t=t.dependencies,t!==null&&gc(t)&&($e=!0))}function av(t,e,n,i){V=t;var r=0;do{if(Vs&&(Gs=null),mo=0,Vs=!1,25<=r)throw Error(w(301));if(r+=1,Ge=oe=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}O.H=Ov,s=e(n,i)}while(Vs);return s}function TE(){var t=O.H,e=t.useState()[0];return e=typeof e.then=="function"?Ro(e):e,t=t.useState()[0],(oe!==null?oe.memoizedState:null)!==t&&(V.flags|=1024),e}function Qh(){var t=Sc!==0;return Sc=0,t}function jh(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function ep(t){if(_c){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}_c=!1}hi=0,Ge=oe=V=null,Vs=!1,mo=Sc=0,Gs=null}function Tt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ge===null?V.memoizedState=Ge=t:Ge=Ge.next=t,Ge}function Oe(){if(oe===null){var t=V.alternate;t=t!==null?t.memoizedState:null}else t=oe.next;var e=Ge===null?V.memoizedState:Ge.next;if(e!==null)Ge=e,oe=t;else{if(t===null)throw V.alternate===null?Error(w(467)):Error(w(310));oe=t,t={memoizedState:oe.memoizedState,baseState:oe.baseState,baseQueue:oe.baseQueue,queue:oe.queue,next:null},Ge===null?V.memoizedState=Ge=t:Ge=Ge.next=t}return Ge}function $c(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ro(t){var e=mo;return mo+=1,Gs===null&&(Gs=[]),t=jx(Gs,t,e),e=V,(Ge===null?e.memoizedState:Ge.next)===null&&(e=e.alternate,O.H=e===null||e.memoizedState===null?Pv:lp),t}function Wc(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Ro(t);if(t.$$typeof===ai)return ut(t)}throw Error(w(438,String(t)))}function tp(t){var e=null,n=V.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var i=V.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(e={data:i.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=$c(),V.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),i=0;i<t;i++)n[i]=fw;return e.index++,n}function pi(t,e){return typeof e=="function"?e(t):e}function jl(t){var e=Oe();return np(e,oe,t)}function np(t,e,n){var i=t.queue;if(i===null)throw Error(w(311));i.lastRenderedReducer=n;var r=t.baseQueue,s=i.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}e.baseQueue=r=s,i.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var o=a=null,l=null,c=e,u=!1;do{var f=c.lane&-536870913;if(f!==c.lane?(X&f)===f:(hi&f)===f){var d=c.revertLane;if(d===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),f===Ws&&(u=!0);else if((hi&d)===d){c=c.next,d===Ws&&(u=!0);continue}else f={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=f,a=s):l=l.next=f,V.lanes|=d,tr|=d;f=c.action,$r&&n(s,f),s=c.hasEagerState?c.eagerState:n(s,f)}else d={lane:f,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=d,a=s):l=l.next=d,V.lanes|=f,tr|=f;c=c.next}while(c!==null&&c!==e);if(l===null?a=s:l.next=o,!Qt(s,t.memoizedState)&&($e=!0,u&&(n=Fs,n!==null)))throw n;t.memoizedState=s,t.baseState=a,t.baseQueue=l,i.lastRenderedState=s}return r===null&&(i.lanes=0),[t.memoizedState,i.dispatch]}function md(t){var e=Oe(),n=e.queue;if(n===null)throw Error(w(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);Qt(s,e.memoizedState)||($e=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function ov(t,e,n){var i=V,r=Oe(),s=K;if(s){if(n===void 0)throw Error(w(407));n=n()}else n=e();var a=!Qt((oe||r).memoizedState,n);if(a&&(r.memoizedState=n,$e=!0),r=r.queue,ip(uv.bind(null,i,r,t),[t]),r.getSnapshot!==e||a||Ge!==null&&Ge.memoizedState.tag&1){if(i.flags|=2048,qs(9,{destroy:void 0},cv.bind(null,i,r,n,e),null),ue===null)throw Error(w(349));s||(hi&127)!==0||lv(i,e,n)}return n}function lv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=V.updateQueue,e===null?(e=$c(),V.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function cv(t,e,n,i){e.value=n,e.getSnapshot=i,fv(e)&&dv(t)}function uv(t,e,n){return n(function(){fv(e)&&dv(t)})}function fv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Qt(t,n)}catch{return!0}}function dv(t){var e=Zr(t,2);e!==null&&Pt(e,t,2)}function sh(t){var e=Tt();if(typeof t=="function"){var n=t;if(t=n(),$r){Fi(!0);try{n()}finally{Fi(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:pi,lastRenderedState:t},e}function hv(t,e,n,i){return t.baseState=n,np(t,oe,typeof i=="function"?i:pi)}function AE(t,e,n,i,r){if(qc(t))throw Error(w(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(a){s.listeners.push(a)}};O.T!==null?n(!0):s.isTransition=!1,i(s),n=e.pending,n===null?(s.next=e.pending=s,pv(e,s)):(s.next=n.next,e.pending=n.next=s)}}function pv(t,e){var n=e.action,i=e.payload,r=t.state;if(e.isTransition){var s=O.T,a={};O.T=a;try{var o=n(r,i),l=O.S;l!==null&&l(a,o),hy(t,e,o)}catch(c){ah(t,e,c)}finally{s!==null&&a.types!==null&&(s.types=a.types),O.T=s}}else try{s=n(r,i),hy(t,e,s)}catch(c){ah(t,e,c)}}function hy(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){py(t,e,i)},function(i){return ah(t,e,i)}):py(t,e,n)}function py(t,e,n){e.status="fulfilled",e.value=n,mv(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,pv(t,n)))}function ah(t,e,n){var i=t.pending;if(t.pending=null,i!==null){i=i.next;do e.status="rejected",e.reason=n,mv(e),e=e.next;while(e!==i)}t.action=null}function mv(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function gv(t,e){return e}function my(t,e){if(K){var n=ue.formState;if(n!==null){e:{var i=V;if(K){if(me){t:{for(var r=me,s=pn;r.nodeType!==8;){if(!s){r=null;break t}if(r=gn(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){me=gn(r.nextSibling),i=r.data==="F!";break e}}ji(i)}i=!1}i&&(e=n[0])}}return n=Tt(),n.memoizedState=n.baseState=e,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:gv,lastRenderedState:e},n.queue=i,n=Lv.bind(null,V,i),i.dispatch=n,i=sh(!1),s=op.bind(null,V,!1,i.queue),i=Tt(),r={state:e,dispatch:null,action:t,pending:null},i.queue=r,n=AE.bind(null,V,r,s,n),r.dispatch=n,i.memoizedState=t,[e,n,!1]}function gy(t){var e=Oe();return yv(e,oe,t)}function yv(t,e,n){if(e=np(t,e,gv)[0],t=jl(pi)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var i=Ro(e)}catch(a){throw a===na?Hc:a}else i=e;e=Oe();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(V.flags|=2048,qs(9,{destroy:void 0},CE.bind(null,r,n),null)),[i,s,t]}function CE(t,e){t.action=e}function yy(t){var e=Oe(),n=oe;if(n!==null)return yv(e,n,t);Oe(),e=e.memoizedState,n=Oe();var i=n.queue.dispatch;return n.memoizedState=t,[e,i,!1]}function qs(t,e,n,i){return t={tag:t,create:n,deps:i,inst:e,next:null},e=V.updateQueue,e===null&&(e=$c(),V.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t),t}function xv(){return Oe().memoizedState}function ec(t,e,n,i){var r=Tt();V.flags|=t,r.memoizedState=qs(1|e,{destroy:void 0},n,i===void 0?null:i)}function Xc(t,e,n,i){var r=Oe();i=i===void 0?null:i;var s=r.memoizedState.inst;oe!==null&&i!==null&&Kh(i,oe.memoizedState.deps)?r.memoizedState=qs(e,s,n,i):(V.flags|=t,r.memoizedState=qs(1|e,s,n,i))}function xy(t,e){ec(8390656,8,t,e)}function ip(t,e){Xc(2048,8,t,e)}function RE(t){V.flags|=4;var e=V.updateQueue;if(e===null)e=$c(),V.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function vv(t){var e=Oe().memoizedState;return RE({ref:e,nextImpl:t}),function(){if((ee&2)!==0)throw Error(w(440));return e.impl.apply(void 0,arguments)}}function _v(t,e){return Xc(4,2,t,e)}function Sv(t,e){return Xc(4,4,t,e)}function bv(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Mv(t,e,n){n=n!=null?n.concat([t]):null,Xc(4,4,bv.bind(null,e,t),n)}function rp(){}function wv(t,e){var n=Oe();e=e===void 0?null:e;var i=n.memoizedState;return e!==null&&Kh(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function Ev(t,e){var n=Oe();e=e===void 0?null:e;var i=n.memoizedState;if(e!==null&&Kh(e,i[1]))return i[0];if(i=t(),$r){Fi(!0);try{t()}finally{Fi(!1)}}return n.memoizedState=[i,e],i}function sp(t,e,n){return n===void 0||(hi&1073741824)!==0&&(X&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=h_(),V.lanes|=t,tr|=t,n)}function Tv(t,e,n,i){return Qt(n,e)?n:Xs.current!==null?(t=sp(t,n,i),Qt(t,e)||($e=!0),t):(hi&42)===0||(hi&1073741824)!==0&&(X&261930)===0?($e=!0,t.memoizedState=n):(t=h_(),V.lanes|=t,tr|=t,e)}function Av(t,e,n,i,r){var s=te.p;te.p=s!==0&&8>s?s:8;var a=O.T,o={};O.T=o,op(t,!1,e,n);try{var l=r(),c=O.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var u=wE(l,i);to(t,e,u,Jt(t))}else to(t,e,i,Jt(t))}catch(f){to(t,e,{then:function(){},status:"rejected",reason:f},Jt())}finally{te.p=s,a!==null&&o.types!==null&&(a.types=o.types),O.T=a}}function DE(){}function oh(t,e,n,i){if(t.tag!==5)throw Error(w(476));var r=Cv(t).queue;Av(t,r,e,Or,n===null?DE:function(){return Rv(t),n(i)})}function Cv(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Or,baseState:Or,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:pi,lastRenderedState:Or},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:pi,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Rv(t){var e=Cv(t);e.next===null&&(e=t.alternate.memoizedState),to(t,e.next.queue,{},Jt())}function ap(){return ut(vo)}function Dv(){return Oe().memoizedState}function Uv(){return Oe().memoizedState}function UE(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Jt();t=Wi(n);var i=Xi(e,t,n);i!==null&&(Pt(i,e,n),Qa(i,e,n)),e={cache:Wh()},t.payload=e;return}e=e.return}}function LE(t,e,n){var i=Jt();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},qc(t)?Iv(e,n):(n=Gh(t,e,n,i),n!==null&&(Pt(n,t,i),Nv(n,e,i)))}function Lv(t,e,n){var i=Jt();to(t,e,n,i)}function to(t,e,n,i){var r={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(qc(t))Iv(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,Qt(o,a))return kc(t,e,r,0),ue===null&&Gc(),!1}catch{}finally{}if(n=Gh(t,e,r,i),n!==null)return Pt(n,t,i),Nv(n,e,i),!0}return!1}function op(t,e,n,i){if(i={lane:2,revertLane:gp(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},qc(t)){if(e)throw Error(w(479))}else e=Gh(t,n,i,2),e!==null&&Pt(e,t,2)}function qc(t){var e=t.alternate;return t===V||e!==null&&e===V}function Iv(t,e){Vs=_c=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Nv(t,e,n){if((n&4194048)!==0){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,vx(t,n)}}var go={readContext:ut,use:Wc,useCallback:De,useContext:De,useEffect:De,useImperativeHandle:De,useLayoutEffect:De,useInsertionEffect:De,useMemo:De,useReducer:De,useRef:De,useState:De,useDebugValue:De,useDeferredValue:De,useTransition:De,useSyncExternalStore:De,useId:De,useHostTransitionStatus:De,useFormState:De,useActionState:De,useOptimistic:De,useMemoCache:De,useCacheRefresh:De};go.useEffectEvent=De;var Pv={readContext:ut,use:Wc,useCallback:function(t,e){return Tt().memoizedState=[t,e===void 0?null:e],t},useContext:ut,useEffect:xy,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,ec(4194308,4,bv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return ec(4194308,4,t,e)},useInsertionEffect:function(t,e){ec(4,2,t,e)},useMemo:function(t,e){var n=Tt();e=e===void 0?null:e;var i=t();if($r){Fi(!0);try{t()}finally{Fi(!1)}}return n.memoizedState=[i,e],i},useReducer:function(t,e,n){var i=Tt();if(n!==void 0){var r=n(e);if($r){Fi(!0);try{n(e)}finally{Fi(!1)}}}else r=e;return i.memoizedState=i.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},i.queue=t,t=t.dispatch=LE.bind(null,V,t),[i.memoizedState,t]},useRef:function(t){var e=Tt();return t={current:t},e.memoizedState=t},useState:function(t){t=sh(t);var e=t.queue,n=Lv.bind(null,V,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:rp,useDeferredValue:function(t,e){var n=Tt();return sp(n,t,e)},useTransition:function(){var t=sh(!1);return t=Av.bind(null,V,t.queue,!0,!1),Tt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var i=V,r=Tt();if(K){if(n===void 0)throw Error(w(407));n=n()}else{if(n=e(),ue===null)throw Error(w(349));(X&127)!==0||lv(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,xy(uv.bind(null,i,s,t),[t]),i.flags|=2048,qs(9,{destroy:void 0},cv.bind(null,i,s,n,e),null),n},useId:function(){var t=Tt(),e=ue.identifierPrefix;if(K){var n=On,i=Pn;n=(i&~(1<<32-Kt(i)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Sc++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=EE++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:ap,useFormState:my,useActionState:my,useOptimistic:function(t){var e=Tt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=op.bind(null,V,!0,n),n.dispatch=e,[t,e]},useMemoCache:tp,useCacheRefresh:function(){return Tt().memoizedState=UE.bind(null,V)},useEffectEvent:function(t){var e=Tt(),n={impl:t};return e.memoizedState=n,function(){if((ee&2)!==0)throw Error(w(440));return n.impl.apply(void 0,arguments)}}},lp={readContext:ut,use:Wc,useCallback:wv,useContext:ut,useEffect:ip,useImperativeHandle:Mv,useInsertionEffect:_v,useLayoutEffect:Sv,useMemo:Ev,useReducer:jl,useRef:xv,useState:function(){return jl(pi)},useDebugValue:rp,useDeferredValue:function(t,e){var n=Oe();return Tv(n,oe.memoizedState,t,e)},useTransition:function(){var t=jl(pi)[0],e=Oe().memoizedState;return[typeof t=="boolean"?t:Ro(t),e]},useSyncExternalStore:ov,useId:Dv,useHostTransitionStatus:ap,useFormState:gy,useActionState:gy,useOptimistic:function(t,e){var n=Oe();return hv(n,oe,t,e)},useMemoCache:tp,useCacheRefresh:Uv};lp.useEffectEvent=vv;var Ov={readContext:ut,use:Wc,useCallback:wv,useContext:ut,useEffect:ip,useImperativeHandle:Mv,useInsertionEffect:_v,useLayoutEffect:Sv,useMemo:Ev,useReducer:md,useRef:xv,useState:function(){return md(pi)},useDebugValue:rp,useDeferredValue:function(t,e){var n=Oe();return oe===null?sp(n,t,e):Tv(n,oe.memoizedState,t,e)},useTransition:function(){var t=md(pi)[0],e=Oe().memoizedState;return[typeof t=="boolean"?t:Ro(t),e]},useSyncExternalStore:ov,useId:Dv,useHostTransitionStatus:ap,useFormState:yy,useActionState:yy,useOptimistic:function(t,e){var n=Oe();return oe!==null?hv(n,oe,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:tp,useCacheRefresh:Uv};Ov.useEffectEvent=vv;function gd(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:ge({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var lh={enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Jt(),r=Wi(i);r.payload=e,n!=null&&(r.callback=n),e=Xi(t,r,i),e!==null&&(Pt(e,t,i),Qa(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Jt(),r=Wi(i);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=Xi(t,r,i),e!==null&&(Pt(e,t,i),Qa(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Jt(),i=Wi(n);i.tag=2,e!=null&&(i.callback=e),e=Xi(t,i,n),e!==null&&(Pt(e,t,n),Qa(e,t,n))}};function vy(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!uo(n,i)||!uo(r,s):!0}function _y(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&lh.enqueueReplaceState(e,e.state,null)}function Wr(t,e){var n=e;if("ref"in e){n={};for(var i in e)i!=="ref"&&(n[i]=e[i])}if(t=t.defaultProps){n===e&&(n=ge({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Bv(t){hc(t)}function Fv(t){console.error(t)}function zv(t){hc(t)}function bc(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(i){setTimeout(function(){throw i})}}function Sy(t,e,n){try{var i=t.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function ch(t,e,n){return n=Wi(n),n.tag=3,n.payload={element:null},n.callback=function(){bc(t,e)},n}function Vv(t){return t=Wi(t),t.tag=3,t}function Gv(t,e,n,i){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;t.payload=function(){return r(s)},t.callback=function(){Sy(e,n,i)}}var a=n.stateNode;a!==null&&typeof a.componentDidCatch=="function"&&(t.callback=function(){Sy(e,n,i),typeof r!="function"&&(qi===null?qi=new Set([this]):qi.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function IE(t,e,n,i,r){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(e=n.alternate,e!==null&&ta(e,n,r,!0),n=jt.current,n!==null){switch(n.tag){case 31:case 13:return mn===null?Ac():n.alternate===null&&Ue===0&&(Ue=3),n.flags&=-257,n.flags|=65536,n.lanes=r,i===yc?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([i]):e.add(i),Ad(t,i,r)),!1;case 22:return n.flags|=65536,i===yc?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([i]):n.add(i)),Ad(t,i,r)),!1}throw Error(w(435,n.tag))}return Ad(t,i,r),Ac(),!1}if(K)return e=jt.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=r,i!==Kd&&(t=Error(w(422),{cause:i}),ho(hn(t,n)))):(i!==Kd&&(e=Error(w(423),{cause:i}),ho(hn(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,i=hn(i,n),r=ch(t.stateNode,i,r),pd(t,r),Ue!==4&&(Ue=2)),!1;var s=Error(w(520),{cause:i});if(s=hn(s,n),ro===null?ro=[s]:ro.push(s),Ue!==4&&(Ue=2),e===null)return!0;i=hn(i,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=ch(n.stateNode,i,t),pd(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(qi===null||!qi.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Vv(r),Gv(r,t,n,i),pd(n,r),!1}n=n.return}while(n!==null);return!1}var cp=Error(w(461)),$e=!1;function ot(t,e,n,i){e.child=t===null?tv(e,null,n,i):Hr(e,t.child,n,i)}function by(t,e,n,i,r){n=n.render;var s=e.ref;if("ref"in i){var a={};for(var o in i)o!=="ref"&&(a[o]=i[o])}else a=i;return kr(e),i=Jh(t,e,n,a,s,r),o=Qh(),t!==null&&!$e?(jh(t,e,r),mi(t,e,r)):(K&&o&&Hh(e),e.flags|=1,ot(t,e,i,r),e.child)}function My(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!kh(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,kv(t,e,s,i,r)):(t=Jl(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!up(t,r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:uo,n(a,i)&&t.ref===e.ref)return mi(t,e,r)}return e.flags|=1,t=ci(s,i),t.ref=e.ref,t.return=e,e.child=t}function kv(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(uo(s,i)&&t.ref===e.ref)if($e=!1,e.pendingProps=i=s,up(t,r))(t.flags&131072)!==0&&($e=!0);else return e.lanes=t.lanes,mi(t,e,r)}return uh(t,e,n,i,r)}function Hv(t,e,n,i){var r=i.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((e.flags&128)!==0){if(s=s!==null?s.baseLanes|n:n,t!==null){for(i=e.child=t.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,e.child=null;return wy(t,e,s,n,i)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&Ql(e,s!==null?s.cachePool:null),s!==null?dy(e,s):ih(),rv(e);else return i=e.lanes=536870912,wy(t,e,s!==null?s.baseLanes|n:n,n,i)}else s!==null?(Ql(e,s.cachePool),dy(e,s),Oi(e),e.memoizedState=null):(t!==null&&Ql(e,null),ih(),Oi(e));return ot(t,e,r,n),e.child}function Xa(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function wy(t,e,n,i,r){var s=Xh();return s=s===null?null:{parent:He._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&Ql(e,null),ih(),rv(e),t!==null&&ta(t,e,i,!0),e.childLanes=r,null}function tc(t,e){return e=Mc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function Ey(t,e,n){return Hr(e,t.child,null,n),t=tc(e,e.pendingProps),t.flags|=2,Wt(e),e.memoizedState=null,t}function NE(t,e,n){var i=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(K){if(i.mode==="hidden")return t=tc(e,i),e.lanes=536870912,Xa(null,t);if(rh(e),(t=me)?(t=P_(t,pn),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Qi!==null?{id:Pn,overflow:On}:null,retryLane:536870912,hydrationErrors:null},n=Yx(t),n.return=e,e.child=n,ct=e,me=null)):t=null,t===null)throw ji(e);return e.lanes=536870912,null}return tc(e,i)}var s=t.memoizedState;if(s!==null){var a=s.dehydrated;if(rh(e),r)if(e.flags&256)e.flags&=-257,e=Ey(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(w(558));else if($e||ta(t,e,n,!1),r=(n&t.childLanes)!==0,$e||r){if(i=ue,i!==null&&(a=_x(i,n),a!==0&&a!==s.retryLane))throw s.retryLane=a,Zr(t,a),Pt(i,t,a),cp;Ac(),e=Ey(t,e,n)}else t=s.treeContext,me=gn(a.nextSibling),ct=e,K=!0,$i=null,pn=!1,t!==null&&Kx(e,t),e=tc(e,i),e.flags|=4096;return e}return t=ci(t.child,{mode:i.mode,children:i.children}),t.ref=e.ref,e.child=t,t.return=e,t}function nc(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(w(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function uh(t,e,n,i,r){return kr(e),n=Jh(t,e,n,i,void 0,r),i=Qh(),t!==null&&!$e?(jh(t,e,r),mi(t,e,r)):(K&&i&&Hh(e),e.flags|=1,ot(t,e,n,r),e.child)}function Ty(t,e,n,i,r,s){return kr(e),e.updateQueue=null,n=av(e,i,n,r),sv(t),i=Qh(),t!==null&&!$e?(jh(t,e,s),mi(t,e,s)):(K&&i&&Hh(e),e.flags|=1,ot(t,e,n,s),e.child)}function Ay(t,e,n,i,r){if(kr(e),e.stateNode===null){var s=Us,a=n.contextType;typeof a=="object"&&a!==null&&(s=ut(a)),s=new n(i,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=lh,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=i,s.state=e.memoizedState,s.refs={},Yh(e),a=n.contextType,s.context=typeof a=="object"&&a!==null?ut(a):Us,s.state=e.memoizedState,a=n.getDerivedStateFromProps,typeof a=="function"&&(gd(e,n,a,i),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(a=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),a!==s.state&&lh.enqueueReplaceState(s,s.state,null),eo(e,i,s,r),ja(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),i=!0}else if(t===null){s=e.stateNode;var o=e.memoizedProps,l=Wr(n,o);s.props=l;var c=s.context,u=n.contextType;a=Us,typeof u=="object"&&u!==null&&(a=ut(u));var f=n.getDerivedStateFromProps;u=typeof f=="function"||typeof s.getSnapshotBeforeUpdate=="function",o=e.pendingProps!==o,u||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(o||c!==a)&&_y(e,s,i,a),Ii=!1;var d=e.memoizedState;s.state=d,eo(e,i,s,r),ja(),c=e.memoizedState,o||d!==c||Ii?(typeof f=="function"&&(gd(e,n,f,i),c=e.memoizedState),(l=Ii||vy(e,n,l,i,d,c,a))?(u||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=c),s.props=i,s.state=c,s.context=a,i=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{s=e.stateNode,th(t,e),a=e.memoizedProps,u=Wr(n,a),s.props=u,f=e.pendingProps,d=s.context,c=n.contextType,l=Us,typeof c=="object"&&c!==null&&(l=ut(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(a!==f||d!==l)&&_y(e,s,i,l),Ii=!1,d=e.memoizedState,s.state=d,eo(e,i,s,r),ja();var h=e.memoizedState;a!==f||d!==h||Ii||t!==null&&t.dependencies!==null&&gc(t.dependencies)?(typeof o=="function"&&(gd(e,n,o,i),h=e.memoizedState),(u=Ii||vy(e,n,u,i,d,h,l)||t!==null&&t.dependencies!==null&&gc(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,h,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,h,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=h),s.props=i,s.state=h,s.context=l,i=u):(typeof s.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),i=!1)}return s=i,nc(t,e),i=(e.flags&128)!==0,s||i?(s=e.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&i?(e.child=Hr(e,t.child,null,r),e.child=Hr(e,null,n,r)):ot(t,e,n,r),e.memoizedState=s.state,t=e.child):t=mi(t,e,r),t}function Cy(t,e,n,i){return Gr(),e.flags|=256,ot(t,e,n,i),e.child}var yd={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function xd(t){return{baseLanes:t,cachePool:Qx()}}function vd(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=qt),t}function $v(t,e,n){var i=e.pendingProps,r=!1,s=(e.flags&128)!==0,a;if((a=s)||(a=t!==null&&t.memoizedState===null?!1:(Pe.current&2)!==0),a&&(r=!0,e.flags&=-129),a=(e.flags&32)!==0,e.flags&=-33,t===null){if(K){if(r?Pi(e):Oi(e),(t=me)?(t=P_(t,pn),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Qi!==null?{id:Pn,overflow:On}:null,retryLane:536870912,hydrationErrors:null},n=Yx(t),n.return=e,e.child=n,ct=e,me=null)):t=null,t===null)throw ji(e);return wh(t)?e.lanes=32:e.lanes=536870912,null}var o=i.children;return i=i.fallback,r?(Oi(e),r=e.mode,o=Mc({mode:"hidden",children:o},r),i=Br(i,r,n,null),o.return=e,i.return=e,o.sibling=i,e.child=o,i=e.child,i.memoizedState=xd(n),i.childLanes=vd(t,a,n),e.memoizedState=yd,Xa(null,i)):(Pi(e),fh(e,o))}var l=t.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(s)e.flags&256?(Pi(e),e.flags&=-257,e=_d(t,e,n)):e.memoizedState!==null?(Oi(e),e.child=t.child,e.flags|=128,e=null):(Oi(e),o=i.fallback,r=e.mode,i=Mc({mode:"visible",children:i.children},r),o=Br(o,r,n,null),o.flags|=2,i.return=e,o.return=e,i.sibling=o,e.child=i,Hr(e,t.child,null,n),i=e.child,i.memoizedState=xd(n),i.childLanes=vd(t,a,n),e.memoizedState=yd,e=Xa(null,i));else if(Pi(e),wh(o)){if(a=o.nextSibling&&o.nextSibling.dataset,a)var c=a.dgst;a=c,i=Error(w(419)),i.stack="",i.digest=a,ho({value:i,source:null,stack:null}),e=_d(t,e,n)}else if($e||ta(t,e,n,!1),a=(n&t.childLanes)!==0,$e||a){if(a=ue,a!==null&&(i=_x(a,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,Zr(t,i),Pt(a,t,i),cp;Mh(o)||Ac(),e=_d(t,e,n)}else Mh(o)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,me=gn(o.nextSibling),ct=e,K=!0,$i=null,pn=!1,t!==null&&Kx(e,t),e=fh(e,i.children),e.flags|=4096);return e}return r?(Oi(e),o=i.fallback,r=e.mode,l=t.child,c=l.sibling,i=ci(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=ci(c,o):(o=Br(o,r,n,null),o.flags|=2),o.return=e,i.return=e,i.sibling=o,e.child=i,Xa(null,i),i=e.child,o=t.child.memoizedState,o===null?o=xd(n):(r=o.cachePool,r!==null?(l=He._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=Qx(),o={baseLanes:o.baseLanes|n,cachePool:r}),i.memoizedState=o,i.childLanes=vd(t,a,n),e.memoizedState=yd,Xa(t.child,i)):(Pi(e),n=t.child,t=n.sibling,n=ci(n,{mode:"visible",children:i.children}),n.return=e,n.sibling=null,t!==null&&(a=e.deletions,a===null?(e.deletions=[t],e.flags|=16):a.push(t)),e.child=n,e.memoizedState=null,n)}function fh(t,e){return e=Mc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Mc(t,e){return t=Xt(22,t,null,e),t.lanes=0,t}function _d(t,e,n){return Hr(e,t.child,null,n),t=fh(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Ry(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Qd(t.return,e,n)}function Sd(t,e,n,i,r,s){var a=t.memoizedState;a===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r,treeForkCount:s}:(a.isBackwards=e,a.rendering=null,a.renderingStartTime=0,a.last=i,a.tail=n,a.tailMode=r,a.treeForkCount=s)}function Wv(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var a=Pe.current,o=(a&2)!==0;if(o?(a=a&1|2,e.flags|=128):a&=1,fe(Pe,a),ot(t,e,i,n),i=K?fo:0,!o&&t!==null&&(t.flags&128)!==0)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Ry(t,n,e);else if(t.tag===19)Ry(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&vc(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Sd(e,!1,r,n,s,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&vc(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Sd(e,!0,n,null,s,i);break;case"together":Sd(e,!1,null,null,void 0,i);break;default:e.memoizedState=null}return e.child}function mi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),tr|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(ta(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(w(153));if(e.child!==null){for(t=e.child,n=ci(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=ci(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function up(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&gc(t)))}function PE(t,e,n){switch(e.tag){case 3:cc(e,e.stateNode.containerInfo),Ni(e,He,t.memoizedState.cache),Gr();break;case 27:case 5:zd(e);break;case 4:cc(e,e.stateNode.containerInfo);break;case 10:Ni(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,rh(e),null;break;case 13:var i=e.memoizedState;if(i!==null)return i.dehydrated!==null?(Pi(e),e.flags|=128,null):(n&e.child.childLanes)!==0?$v(t,e,n):(Pi(e),t=mi(t,e,n),t!==null?t.sibling:null);Pi(e);break;case 19:var r=(t.flags&128)!==0;if(i=(n&e.childLanes)!==0,i||(ta(t,e,n,!1),i=(n&e.childLanes)!==0),r){if(i)return Wv(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),fe(Pe,Pe.current),i)break;return null;case 22:return e.lanes=0,Hv(t,e,n,e.pendingProps);case 24:Ni(e,He,t.memoizedState.cache)}return mi(t,e,n)}function Xv(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)$e=!0;else{if(!up(t,n)&&(e.flags&128)===0)return $e=!1,PE(t,e,n);$e=(t.flags&131072)!==0}else $e=!1,K&&(e.flags&1048576)!==0&&Zx(e,fo,e.index);switch(e.lanes=0,e.tag){case 16:e:{var i=e.pendingProps;if(t=Nr(e.elementType),e.type=t,typeof t=="function")kh(t)?(i=Wr(t,i),e.tag=1,e=Ay(null,e,t,i,n)):(e.tag=0,e=uh(null,e,t,i,n));else{if(t!=null){var r=t.$$typeof;if(r===Ch){e.tag=11,e=by(null,e,t,i,n);break e}else if(r===Rh){e.tag=14,e=My(null,e,t,i,n);break e}}throw e=Bd(t)||t,Error(w(306,e,""))}}return e;case 0:return uh(t,e,e.type,e.pendingProps,n);case 1:return i=e.type,r=Wr(i,e.pendingProps),Ay(t,e,i,r,n);case 3:e:{if(cc(e,e.stateNode.containerInfo),t===null)throw Error(w(387));i=e.pendingProps;var s=e.memoizedState;r=s.element,th(t,e),eo(e,i,null,n);var a=e.memoizedState;if(i=a.cache,Ni(e,He,i),i!==s.cache&&jd(e,[He],n,!0),ja(),i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=Cy(t,e,i,n);break e}else if(i!==r){r=hn(Error(w(424)),e),ho(r),e=Cy(t,e,i,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(me=gn(t.firstChild),ct=e,K=!0,$i=null,pn=!0,n=tv(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Gr(),i===r){e=mi(t,e,n);break e}ot(t,e,i,n)}e=e.child}return e;case 26:return nc(t,e),t===null?(n=Jy(e.type,null,e.pendingProps,null))?e.memoizedState=n:K||(n=e.type,t=e.pendingProps,i=Uc(Hi.current).createElement(n),i[lt]=e,i[Ot]=t,ft(i,n,t),et(i),e.stateNode=i):e.memoizedState=Jy(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return zd(e),t===null&&K&&(i=e.stateNode=O_(e.type,e.pendingProps,Hi.current),ct=e,pn=!0,r=me,ir(e.type)?(Eh=r,me=gn(i.firstChild)):me=r),ot(t,e,e.pendingProps.children,n),nc(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&K&&((r=i=me)&&(i=cT(i,e.type,e.pendingProps,pn),i!==null?(e.stateNode=i,ct=e,me=gn(i.firstChild),pn=!1,r=!0):r=!1),r||ji(e)),zd(e),r=e.type,s=e.pendingProps,a=t!==null?t.memoizedProps:null,i=s.children,Sh(r,s)?i=null:a!==null&&Sh(r,a)&&(e.flags|=32),e.memoizedState!==null&&(r=Jh(t,e,TE,null,null,n),vo._currentValue=r),nc(t,e),ot(t,e,i,n),e.child;case 6:return t===null&&K&&((t=n=me)&&(n=uT(n,e.pendingProps,pn),n!==null?(e.stateNode=n,ct=e,me=null,t=!0):t=!1),t||ji(e)),null;case 13:return $v(t,e,n);case 4:return cc(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=Hr(e,null,i,n):ot(t,e,i,n),e.child;case 11:return by(t,e,e.type,e.pendingProps,n);case 7:return ot(t,e,e.pendingProps,n),e.child;case 8:return ot(t,e,e.pendingProps.children,n),e.child;case 12:return ot(t,e,e.pendingProps.children,n),e.child;case 10:return i=e.pendingProps,Ni(e,e.type,i.value),ot(t,e,i.children,n),e.child;case 9:return r=e.type._context,i=e.pendingProps.children,kr(e),r=ut(r),i=i(r),e.flags|=1,ot(t,e,i,n),e.child;case 14:return My(t,e,e.type,e.pendingProps,n);case 15:return kv(t,e,e.type,e.pendingProps,n);case 19:return Wv(t,e,n);case 31:return NE(t,e,n);case 22:return Hv(t,e,n,e.pendingProps);case 24:return kr(e),i=ut(He),t===null?(r=Xh(),r===null&&(r=ue,s=Wh(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:i,cache:r},Yh(e),Ni(e,He,r)):((t.lanes&n)!==0&&(th(t,e),eo(e,null,null,n),ja()),r=t.memoizedState,s=e.memoizedState,r.parent!==i?(r={parent:i,cache:i},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),Ni(e,He,i)):(i=s.cache,Ni(e,He,i),i!==r.cache&&jd(e,[He],n,!0))),ot(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(w(156,e.tag))}function ei(t){t.flags|=4}function bd(t,e,n,i,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(g_())t.flags|=8192;else throw zr=yc,qh}else t.flags&=-16777217}function Dy(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!z_(e))if(g_())t.flags|=8192;else throw zr=yc,qh}function Vl(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?yx():536870912,t.lanes|=e,Ys|=e)}function za(t,e){if(!K)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function pe(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&65011712,i|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function OE(t,e,n){var i=e.pendingProps;switch($h(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return pe(e),null;case 1:return pe(e),null;case 3:return n=e.stateNode,i=null,t!==null&&(i=t.memoizedState.cache),e.memoizedState.cache!==i&&(e.flags|=2048),ui(He),ks(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(vs(e)?ei(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,hd())),pe(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(ei(e),s!==null?(pe(e),Dy(e,s)):(pe(e),bd(e,r,null,i,n))):s?s!==t.memoizedState?(ei(e),pe(e),Dy(e,s)):(pe(e),e.flags&=-16777217):(t=t.memoizedProps,t!==i&&ei(e),pe(e),bd(e,r,t,i,n)),null;case 27:if(uc(e),n=Hi.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==i&&ei(e);else{if(!i){if(e.stateNode===null)throw Error(w(166));return pe(e),null}t=Fn.current,vs(e)?sy(e,t):(t=O_(r,i,n),e.stateNode=t,ei(e))}return pe(e),null;case 5:if(uc(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==i&&ei(e);else{if(!i){if(e.stateNode===null)throw Error(w(166));return pe(e),null}if(s=Fn.current,vs(e))sy(e,s);else{var a=Uc(Hi.current);switch(s){case 1:s=a.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=a.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=a.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=a.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=a.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?a.createElement("select",{is:i.is}):a.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?a.createElement(r,{is:i.is}):a.createElement(r)}}s[lt]=e,s[Ot]=i;e:for(a=e.child;a!==null;){if(a.tag===5||a.tag===6)s.appendChild(a.stateNode);else if(a.tag!==4&&a.tag!==27&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===e)break e;for(;a.sibling===null;){if(a.return===null||a.return===e)break e;a=a.return}a.sibling.return=a.return,a=a.sibling}e.stateNode=s;e:switch(ft(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&ei(e)}}return pe(e),bd(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==i&&ei(e);else{if(typeof i!="string"&&e.stateNode===null)throw Error(w(166));if(t=Hi.current,vs(e)){if(t=e.stateNode,n=e.memoizedProps,i=null,r=ct,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}t[lt]=e,t=!!(t.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||L_(t.nodeValue,n)),t||ji(e,!0)}else t=Uc(t).createTextNode(i),t[lt]=e,e.stateNode=t}return pe(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(i=vs(e),n!==null){if(t===null){if(!i)throw Error(w(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(w(557));t[lt]=e}else Gr(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;pe(e),t=!1}else n=hd(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Wt(e),e):(Wt(e),null);if((e.flags&128)!==0)throw Error(w(558))}return pe(e),null;case 13:if(i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=vs(e),i!==null&&i.dehydrated!==null){if(t===null){if(!r)throw Error(w(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(w(317));r[lt]=e}else Gr(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;pe(e),r=!1}else r=hd(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Wt(e),e):(Wt(e),null)}return Wt(e),(e.flags&128)!==0?(e.lanes=n,e):(n=i!==null,t=t!==null&&t.memoizedState!==null,n&&(i=e.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Vl(e,e.updateQueue),pe(e),null);case 4:return ks(),t===null&&yp(e.stateNode.containerInfo),pe(e),null;case 10:return ui(e.type),pe(e),null;case 19:if(tt(Pe),i=e.memoizedState,i===null)return pe(e),null;if(r=(e.flags&128)!==0,s=i.rendering,s===null)if(r)za(i,!1);else{if(Ue!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(s=vc(t),s!==null){for(e.flags|=128,za(i,!1),t=s.updateQueue,e.updateQueue=t,Vl(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)qx(n,t),n=n.sibling;return fe(Pe,Pe.current&1|2),K&&ri(e,i.treeForkCount),e.child}t=t.sibling}i.tail!==null&&Yt()>Ec&&(e.flags|=128,r=!0,za(i,!1),e.lanes=4194304)}else{if(!r)if(t=vc(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Vl(e,t),za(i,!0),i.tail===null&&i.tailMode==="hidden"&&!s.alternate&&!K)return pe(e),null}else 2*Yt()-i.renderingStartTime>Ec&&n!==536870912&&(e.flags|=128,r=!0,za(i,!1),e.lanes=4194304);i.isBackwards?(s.sibling=e.child,e.child=s):(t=i.last,t!==null?t.sibling=s:e.child=s,i.last=s)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=Yt(),t.sibling=null,n=Pe.current,fe(Pe,r?n&1|2:n&1),K&&ri(e,i.treeForkCount),t):(pe(e),null);case 22:case 23:return Wt(e),Zh(),i=e.memoizedState!==null,t!==null?t.memoizedState!==null!==i&&(e.flags|=8192):i&&(e.flags|=8192),i?(n&536870912)!==0&&(e.flags&128)===0&&(pe(e),e.subtreeFlags&6&&(e.flags|=8192)):pe(e),n=e.updateQueue,n!==null&&Vl(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),i=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(i=e.memoizedState.cachePool.pool),i!==n&&(e.flags|=2048),t!==null&&tt(Fr),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),ui(He),pe(e),null;case 25:return null;case 30:return null}throw Error(w(156,e.tag))}function BE(t,e){switch($h(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ui(He),ks(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return uc(e),null;case 31:if(e.memoizedState!==null){if(Wt(e),e.alternate===null)throw Error(w(340));Gr()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Wt(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(w(340));Gr()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return tt(Pe),null;case 4:return ks(),null;case 10:return ui(e.type),null;case 22:case 23:return Wt(e),Zh(),t!==null&&tt(Fr),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return ui(He),null;case 25:return null;default:return null}}function qv(t,e){switch($h(e),e.tag){case 3:ui(He),ks();break;case 26:case 27:case 5:uc(e);break;case 4:ks();break;case 31:e.memoizedState!==null&&Wt(e);break;case 13:Wt(e);break;case 19:tt(Pe);break;case 10:ui(e.type);break;case 22:case 23:Wt(e),Zh(),t!==null&&tt(Fr);break;case 24:ui(He)}}function Do(t,e){try{var n=e.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var r=i.next;n=r;do{if((n.tag&t)===t){i=void 0;var s=n.create,a=n.inst;i=s(),a.destroy=i}n=n.next}while(n!==r)}}catch(o){ie(e,e.return,o)}}function er(t,e,n){try{var i=e.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&t)===t){var a=i.inst,o=a.destroy;if(o!==void 0){a.destroy=void 0,r=e;var l=n,c=o;try{c()}catch(u){ie(r,l,u)}}}i=i.next}while(i!==s)}}catch(u){ie(e,e.return,u)}}function Yv(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{iv(e,n)}catch(i){ie(t,t.return,i)}}}function Zv(t,e,n){n.props=Wr(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(i){ie(t,e,i)}}function no(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var i=t.stateNode;break;case 30:i=t.stateNode;break;default:i=t.stateNode}typeof n=="function"?t.refCleanup=n(i):n.current=i}}catch(r){ie(t,e,r)}}function Bn(t,e){var n=t.ref,i=t.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(r){ie(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){ie(t,e,r)}else n.current=null}function Kv(t){var e=t.type,n=t.memoizedProps,i=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break e;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(r){ie(t,t.return,r)}}function Md(t,e,n){try{var i=t.stateNode;iT(i,t.type,n,e),i[Ot]=e}catch(r){ie(t,t.return,r)}}function Jv(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&ir(t.type)||t.tag===4}function wd(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Jv(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&ir(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function dh(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=oi));else if(i!==4&&(i===27&&ir(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(dh(t,e,n),t=t.sibling;t!==null;)dh(t,e,n),t=t.sibling}function wc(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(i===27&&ir(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(wc(t,e,n),t=t.sibling;t!==null;)wc(t,e,n),t=t.sibling}function Qv(t){var e=t.stateNode,n=t.memoizedProps;try{for(var i=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);ft(e,i,n),e[lt]=t,e[Ot]=n}catch(s){ie(t,t.return,s)}}var si=!1,ke=!1,Ed=!1,Uy=typeof WeakSet=="function"?WeakSet:Set,je=null;function FE(t,e){if(t=t.containerInfo,vh=Pc,t=zx(t),zh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,c=0,u=0,f=t,d=null;t:for(;;){for(var h;f!==n||r!==0&&f.nodeType!==3||(o=a+r),f!==s||i!==0&&f.nodeType!==3||(l=a+i),f.nodeType===3&&(a+=f.nodeValue.length),(h=f.firstChild)!==null;)d=f,f=h;for(;;){if(f===t)break t;if(d===n&&++c===r&&(o=a),d===s&&++u===i&&(l=a),(h=f.nextSibling)!==null)break;f=d,d=f.parentNode}f=h}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(_h={focusedElem:t,selectionRange:n},Pc=!1,je=e;je!==null;)if(e=je,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,je=t;else for(;je!==null;){switch(e=je,s=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,i=n.stateNode;try{var p=Wr(n.type,r);t=i.getSnapshotBeforeUpdate(p,s),i.__reactInternalSnapshotBeforeUpdate=t}catch(x){ie(n,n.return,x)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)bh(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":bh(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(w(163))}if(t=e.sibling,t!==null){t.return=e.return,je=t;break}je=e.return}}function jv(t,e,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:ni(t,n),i&4&&Do(5,n);break;case 1:if(ni(t,n),i&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(a){ie(n,n.return,a)}else{var r=Wr(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(a){ie(n,n.return,a)}}i&64&&Yv(n),i&512&&no(n,n.return);break;case 3:if(ni(t,n),i&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{iv(t,e)}catch(a){ie(n,n.return,a)}}break;case 27:e===null&&i&4&&Qv(n);case 26:case 5:ni(t,n),e===null&&i&4&&Kv(n),i&512&&no(n,n.return);break;case 12:ni(t,n);break;case 31:ni(t,n),i&4&&n_(t,n);break;case 13:ni(t,n),i&4&&i_(t,n),i&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=qE.bind(null,n),fT(t,n))));break;case 22:if(i=n.memoizedState!==null||si,!i){e=e!==null&&e.memoizedState!==null||ke,r=si;var s=ke;si=i,(ke=e)&&!s?ii(t,n,(n.subtreeFlags&8772)!==0):ni(t,n),si=r,ke=s}break;case 30:break;default:ni(t,n)}}function e_(t){var e=t.alternate;e!==null&&(t.alternate=null,e_(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&Ih(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var we=null,It=!1;function ti(t,e,n){for(n=n.child;n!==null;)t_(t,e,n),n=n.sibling}function t_(t,e,n){if(Zt&&typeof Zt.onCommitFiberUnmount=="function")try{Zt.onCommitFiberUnmount(Mo,n)}catch{}switch(n.tag){case 26:ke||Bn(n,e),ti(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:ke||Bn(n,e);var i=we,r=It;ir(n.type)&&(we=n.stateNode,It=!1),ti(t,e,n),ao(n.stateNode),we=i,It=r;break;case 5:ke||Bn(n,e);case 6:if(i=we,r=It,we=null,ti(t,e,n),we=i,It=r,we!==null)if(It)try{(we.nodeType===9?we.body:we.nodeName==="HTML"?we.ownerDocument.body:we).removeChild(n.stateNode)}catch(s){ie(n,e,s)}else try{we.removeChild(n.stateNode)}catch(s){ie(n,e,s)}break;case 18:we!==null&&(It?(t=we,Xy(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),Qs(t)):Xy(we,n.stateNode));break;case 4:i=we,r=It,we=n.stateNode.containerInfo,It=!0,ti(t,e,n),we=i,It=r;break;case 0:case 11:case 14:case 15:er(2,n,e),ke||er(4,n,e),ti(t,e,n);break;case 1:ke||(Bn(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"&&Zv(n,e,i)),ti(t,e,n);break;case 21:ti(t,e,n);break;case 22:ke=(i=ke)||n.memoizedState!==null,ti(t,e,n),ke=i;break;default:ti(t,e,n)}}function n_(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Qs(t)}catch(n){ie(e,e.return,n)}}}function i_(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Qs(t)}catch(n){ie(e,e.return,n)}}function zE(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new Uy),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new Uy),e;default:throw Error(w(435,t.tag))}}function Gl(t,e){var n=zE(t);e.forEach(function(i){if(!n.has(i)){n.add(i);var r=YE.bind(null,t,i);i.then(r,r)}})}function Ut(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i],s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 27:if(ir(o.type)){we=o.stateNode,It=!1;break e}break;case 5:we=o.stateNode,It=!1;break e;case 3:case 4:we=o.stateNode.containerInfo,It=!0;break e}o=o.return}if(we===null)throw Error(w(160));t_(s,a,r),we=null,It=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)r_(e,t),e=e.sibling}var Tn=null;function r_(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Ut(e,t),Lt(t),i&4&&(er(3,t,t.return),Do(3,t),er(5,t,t.return));break;case 1:Ut(e,t),Lt(t),i&512&&(ke||n===null||Bn(n,n.return)),i&64&&si&&(t=t.updateQueue,t!==null&&(i=t.callbacks,i!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var r=Tn;if(Ut(e,t),Lt(t),i&512&&(ke||n===null||Bn(n,n.return)),i&4){var s=n!==null?n.memoizedState:null;if(i=t.memoizedState,n===null)if(i===null)if(t.stateNode===null){e:{i=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(i){case"title":s=r.getElementsByTagName("title")[0],(!s||s[To]||s[lt]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(i),r.head.insertBefore(s,r.querySelector("head > title"))),ft(s,i,n),s[lt]=t,et(s),i=s;break e;case"link":var a=jy("link","href",r).get(i+(n.href||""));if(a){for(var o=0;o<a.length;o++)if(s=a[o],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){a.splice(o,1);break t}}s=r.createElement(i),ft(s,i,n),r.head.appendChild(s);break;case"meta":if(a=jy("meta","content",r).get(i+(n.content||""))){for(o=0;o<a.length;o++)if(s=a[o],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){a.splice(o,1);break t}}s=r.createElement(i),ft(s,i,n),r.head.appendChild(s);break;default:throw Error(w(468,i))}s[lt]=t,et(s),i=s}t.stateNode=i}else ex(r,t.type,t.stateNode);else t.stateNode=Qy(r,i,t.memoizedProps);else s!==i?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,i===null?ex(r,t.type,t.stateNode):Qy(r,i,t.memoizedProps)):i===null&&t.stateNode!==null&&Md(t,t.memoizedProps,n.memoizedProps)}break;case 27:Ut(e,t),Lt(t),i&512&&(ke||n===null||Bn(n,n.return)),n!==null&&i&4&&Md(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Ut(e,t),Lt(t),i&512&&(ke||n===null||Bn(n,n.return)),t.flags&32){r=t.stateNode;try{$s(r,"")}catch(p){ie(t,t.return,p)}}i&4&&t.stateNode!=null&&(r=t.memoizedProps,Md(t,r,n!==null?n.memoizedProps:r)),i&1024&&(Ed=!0);break;case 6:if(Ut(e,t),Lt(t),i&4){if(t.stateNode===null)throw Error(w(162));i=t.memoizedProps,n=t.stateNode;try{n.nodeValue=i}catch(p){ie(t,t.return,p)}}break;case 3:if(sc=null,r=Tn,Tn=Lc(e.containerInfo),Ut(e,t),Tn=r,Lt(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{Qs(e.containerInfo)}catch(p){ie(t,t.return,p)}Ed&&(Ed=!1,s_(t));break;case 4:i=Tn,Tn=Lc(t.stateNode.containerInfo),Ut(e,t),Lt(t),Tn=i;break;case 12:Ut(e,t),Lt(t);break;case 31:Ut(e,t),Lt(t),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,Gl(t,i)));break;case 13:Ut(e,t),Lt(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Yc=Yt()),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,Gl(t,i)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=si,u=ke;if(si=c||r,ke=u||l,Ut(e,t),ke=u,si=c,Lt(t),i&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||si||ke||Pr(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(s=l.stateNode,r)a=s.style,typeof a.setProperty=="function"?a.setProperty("display","none","important"):a.display="none";else{o=l.stateNode;var f=l.memoizedProps.style,d=f!=null&&f.hasOwnProperty("display")?f.display:null;o.style.display=d==null||typeof d=="boolean"?"":(""+d).trim()}}catch(p){ie(l,l.return,p)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(p){ie(l,l.return,p)}}}else if(e.tag===18){if(n===null){l=e;try{var h=l.stateNode;r?qy(h,!0):qy(l.stateNode,!1)}catch(p){ie(l,l.return,p)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}i&4&&(i=t.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Gl(t,n))));break;case 19:Ut(e,t),Lt(t),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,Gl(t,i)));break;case 30:break;case 21:break;default:Ut(e,t),Lt(t)}}function Lt(t){var e=t.flags;if(e&2){try{for(var n,i=t.return;i!==null;){if(Jv(i)){n=i;break}i=i.return}if(n==null)throw Error(w(160));switch(n.tag){case 27:var r=n.stateNode,s=wd(t);wc(t,s,r);break;case 5:var a=n.stateNode;n.flags&32&&($s(a,""),n.flags&=-33);var o=wd(t);wc(t,o,a);break;case 3:case 4:var l=n.stateNode.containerInfo,c=wd(t);dh(t,c,l);break;default:throw Error(w(161))}}catch(u){ie(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function s_(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;s_(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function ni(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)jv(t,e.alternate,e),e=e.sibling}function Pr(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:er(4,e,e.return),Pr(e);break;case 1:Bn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Zv(e,e.return,n),Pr(e);break;case 27:ao(e.stateNode);case 26:case 5:Bn(e,e.return),Pr(e);break;case 22:e.memoizedState===null&&Pr(e);break;case 30:Pr(e);break;default:Pr(e)}t=t.sibling}}function ii(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var i=e.alternate,r=t,s=e,a=s.flags;switch(s.tag){case 0:case 11:case 15:ii(r,s,n),Do(4,s);break;case 1:if(ii(r,s,n),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){ie(i,i.return,c)}if(i=s,r=i.updateQueue,r!==null){var o=i.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)nv(l[r],o)}catch(c){ie(i,i.return,c)}}n&&a&64&&Yv(s),no(s,s.return);break;case 27:Qv(s);case 26:case 5:ii(r,s,n),n&&i===null&&a&4&&Kv(s),no(s,s.return);break;case 12:ii(r,s,n);break;case 31:ii(r,s,n),n&&a&4&&n_(r,s);break;case 13:ii(r,s,n),n&&a&4&&i_(r,s);break;case 22:s.memoizedState===null&&ii(r,s,n),no(s,s.return);break;case 30:break;default:ii(r,s,n)}e=e.sibling}}function fp(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Co(n))}function dp(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Co(t))}function En(t,e,n,i){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)a_(t,e,n,i),e=e.sibling}function a_(t,e,n,i){var r=e.flags;switch(e.tag){case 0:case 11:case 15:En(t,e,n,i),r&2048&&Do(9,e);break;case 1:En(t,e,n,i);break;case 3:En(t,e,n,i),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Co(t)));break;case 12:if(r&2048){En(t,e,n,i),t=e.stateNode;try{var s=e.memoizedProps,a=s.id,o=s.onPostCommit;typeof o=="function"&&o(a,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){ie(e,e.return,l)}}else En(t,e,n,i);break;case 31:En(t,e,n,i);break;case 13:En(t,e,n,i);break;case 23:break;case 22:s=e.stateNode,a=e.alternate,e.memoizedState!==null?s._visibility&2?En(t,e,n,i):io(t,e):s._visibility&2?En(t,e,n,i):(s._visibility|=2,Ss(t,e,n,i,(e.subtreeFlags&10256)!==0||!1)),r&2048&&fp(a,e);break;case 24:En(t,e,n,i),r&2048&&dp(e.alternate,e);break;default:En(t,e,n,i)}}function Ss(t,e,n,i,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,a=e,o=n,l=i,c=a.flags;switch(a.tag){case 0:case 11:case 15:Ss(s,a,o,l,r),Do(8,a);break;case 23:break;case 22:var u=a.stateNode;a.memoizedState!==null?u._visibility&2?Ss(s,a,o,l,r):io(s,a):(u._visibility|=2,Ss(s,a,o,l,r)),r&&c&2048&&fp(a.alternate,a);break;case 24:Ss(s,a,o,l,r),r&&c&2048&&dp(a.alternate,a);break;default:Ss(s,a,o,l,r)}e=e.sibling}}function io(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,i=e,r=i.flags;switch(i.tag){case 22:io(n,i),r&2048&&fp(i.alternate,i);break;case 24:io(n,i),r&2048&&dp(i.alternate,i);break;default:io(n,i)}e=e.sibling}}var qa=8192;function _s(t,e,n){if(t.subtreeFlags&qa)for(t=t.child;t!==null;)o_(t,e,n),t=t.sibling}function o_(t,e,n){switch(t.tag){case 26:_s(t,e,n),t.flags&qa&&t.memoizedState!==null&&MT(n,Tn,t.memoizedState,t.memoizedProps);break;case 5:_s(t,e,n);break;case 3:case 4:var i=Tn;Tn=Lc(t.stateNode.containerInfo),_s(t,e,n),Tn=i;break;case 22:t.memoizedState===null&&(i=t.alternate,i!==null&&i.memoizedState!==null?(i=qa,qa=16777216,_s(t,e,n),qa=i):_s(t,e,n));break;default:_s(t,e,n)}}function l_(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Va(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var i=e[n];je=i,u_(i,t)}l_(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)c_(t),t=t.sibling}function c_(t){switch(t.tag){case 0:case 11:case 15:Va(t),t.flags&2048&&er(9,t,t.return);break;case 3:Va(t);break;case 12:Va(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,ic(t)):Va(t);break;default:Va(t)}}function ic(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var i=e[n];je=i,u_(i,t)}l_(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:er(8,e,e.return),ic(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,ic(e));break;default:ic(e)}t=t.sibling}}function u_(t,e){for(;je!==null;){var n=je;switch(n.tag){case 0:case 11:case 15:er(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Co(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,je=i;else e:for(n=t;je!==null;){i=je;var r=i.sibling,s=i.return;if(e_(i),i===n){je=null;break e}if(r!==null){r.return=s,je=r;break e}je=s}}}var VE={getCacheForType:function(t){var e=ut(He),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return ut(He).controller.signal}},GE=typeof WeakMap=="function"?WeakMap:Map,ee=0,ue=null,H=null,X=0,ne=0,$t=null,Vi=!1,ia=!1,hp=!1,gi=0,Ue=0,tr=0,Vr=0,pp=0,qt=0,Ys=0,ro=null,Nt=null,hh=!1,Yc=0,f_=0,Ec=1/0,Tc=null,qi=null,qe=0,Yi=null,Zs=null,fi=0,ph=0,mh=null,d_=null,so=0,gh=null;function Jt(){return(ee&2)!==0&&X!==0?X&-X:O.T!==null?gp():Sx()}function h_(){if(qt===0)if((X&536870912)===0||K){var t=Ul;Ul<<=1,(Ul&3932160)===0&&(Ul=262144),qt=t}else qt=536870912;return t=jt.current,t!==null&&(t.flags|=32),qt}function Pt(t,e,n){(t===ue&&(ne===2||ne===9)||t.cancelPendingCommit!==null)&&(Ks(t,0),Gi(t,X,qt,!1)),Eo(t,n),((ee&2)===0||t!==ue)&&(t===ue&&((ee&2)===0&&(Vr|=n),Ue===4&&Gi(t,X,qt,!1)),Vn(t))}function p_(t,e,n){if((ee&6)!==0)throw Error(w(327));var i=!n&&(e&127)===0&&(e&t.expiredLanes)===0||wo(t,e),r=i?$E(t,e):Td(t,e,!0),s=i;do{if(r===0){ia&&!i&&Gi(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!kE(n)){r=Td(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var a=0;else a=t.pendingLanes&-536870913,a=a!==0?a:a&536870912?536870912:0;if(a!==0){e=a;e:{var o=t;r=ro;var l=o.current.memoizedState.isDehydrated;if(l&&(Ks(o,a).flags|=256),a=Td(o,a,!1),a!==2){if(hp&&!l){o.errorRecoveryDisabledLanes|=s,Vr|=s,r=4;break e}s=Nt,Nt=r,s!==null&&(Nt===null?Nt=s:Nt.push.apply(Nt,s))}r=a}if(s=!1,r!==2)continue}}if(r===1){Ks(t,0),Gi(t,e,0,!0);break}e:{switch(i=t,s=r,s){case 0:case 1:throw Error(w(345));case 4:if((e&4194048)!==e)break;case 6:Gi(i,e,qt,!Vi);break e;case 2:Nt=null;break;case 3:case 5:break;default:throw Error(w(329))}if((e&62914560)===e&&(r=Yc+300-Yt(),10<r)){if(Gi(i,e,qt,!Vi),Bc(i,0,!0)!==0)break e;fi=e,i.timeoutHandle=N_(Ly.bind(null,i,n,Nt,Tc,hh,e,qt,Vr,Ys,Vi,s,"Throttled",-0,0),r);break e}Ly(i,n,Nt,Tc,hh,e,qt,Vr,Ys,Vi,s,null,-0,0)}}break}while(!0);Vn(t)}function Ly(t,e,n,i,r,s,a,o,l,c,u,f,d,h){if(t.timeoutHandle=-1,f=e.subtreeFlags,f&8192||(f&16785408)===16785408){f={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:oi},o_(e,s,f);var p=(s&62914560)===s?Yc-Yt():(s&4194048)===s?f_-Yt():0;if(p=wT(f,p),p!==null){fi=s,t.cancelPendingCommit=p(Ny.bind(null,t,e,s,n,i,r,a,o,l,u,f,null,d,h)),Gi(t,s,a,!c);return}}Ny(t,e,s,n,i,r,a,o,l)}function kE(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Qt(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Gi(t,e,n,i){e&=~pp,e&=~Vr,t.suspendedLanes|=e,t.pingedLanes&=~e,i&&(t.warmLanes|=e),i=t.expirationTimes;for(var r=e;0<r;){var s=31-Kt(r),a=1<<s;i[s]=-1,r&=~a}n!==0&&xx(t,n,e)}function Zc(){return(ee&6)===0?(Uo(0,!1),!1):!0}function mp(){if(H!==null){if(ne===0)var t=H.return;else t=H,li=Kr=null,ep(t),zs=null,po=0,t=H;for(;t!==null;)qv(t.alternate,t),t=t.return;H=null}}function Ks(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,aT(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),fi=0,mp(),ue=t,H=n=ci(t.current,null),X=e,ne=0,$t=null,Vi=!1,ia=wo(t,e),hp=!1,Ys=qt=pp=Vr=tr=Ue=0,Nt=ro=null,hh=!1,(e&8)!==0&&(e|=e&32);var i=t.entangledLanes;if(i!==0)for(t=t.entanglements,i&=e;0<i;){var r=31-Kt(i),s=1<<r;e|=t[r],i&=~s}return gi=e,Gc(),n}function m_(t,e){V=null,O.H=go,e===na||e===Hc?(e=uy(),ne=3):e===qh?(e=uy(),ne=4):ne=e===cp?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,$t=e,H===null&&(Ue=1,bc(t,hn(e,t.current)))}function g_(){var t=jt.current;return t===null?!0:(X&4194048)===X?mn===null:(X&62914560)===X||(X&536870912)!==0?t===mn:!1}function y_(){var t=O.H;return O.H=go,t===null?go:t}function x_(){var t=O.A;return O.A=VE,t}function Ac(){Ue=4,Vi||(X&4194048)!==X&&jt.current!==null||(ia=!0),(tr&134217727)===0&&(Vr&134217727)===0||ue===null||Gi(ue,X,qt,!1)}function Td(t,e,n){var i=ee;ee|=2;var r=y_(),s=x_();(ue!==t||X!==e)&&(Tc=null,Ks(t,e)),e=!1;var a=Ue;e:do try{if(ne!==0&&H!==null){var o=H,l=$t;switch(ne){case 8:mp(),a=6;break e;case 3:case 2:case 9:case 6:jt.current===null&&(e=!0);var c=ne;if(ne=0,$t=null,Ns(t,o,l,c),n&&ia){a=0;break e}break;default:c=ne,ne=0,$t=null,Ns(t,o,l,c)}}HE(),a=Ue;break}catch(u){m_(t,u)}while(!0);return e&&t.shellSuspendCounter++,li=Kr=null,ee=i,O.H=r,O.A=s,H===null&&(ue=null,X=0,Gc()),a}function HE(){for(;H!==null;)v_(H)}function $E(t,e){var n=ee;ee|=2;var i=y_(),r=x_();ue!==t||X!==e?(Tc=null,Ec=Yt()+500,Ks(t,e)):ia=wo(t,e);e:do try{if(ne!==0&&H!==null){e=H;var s=$t;t:switch(ne){case 1:ne=0,$t=null,Ns(t,e,s,1);break;case 2:case 9:if(cy(s)){ne=0,$t=null,Iy(e);break}e=function(){ne!==2&&ne!==9||ue!==t||(ne=7),Vn(t)},s.then(e,e);break e;case 3:ne=7;break e;case 4:ne=5;break e;case 7:cy(s)?(ne=0,$t=null,Iy(e)):(ne=0,$t=null,Ns(t,e,s,7));break;case 5:var a=null;switch(H.tag){case 26:a=H.memoizedState;case 5:case 27:var o=H;if(a?z_(a):o.stateNode.complete){ne=0,$t=null;var l=o.sibling;if(l!==null)H=l;else{var c=o.return;c!==null?(H=c,Kc(c)):H=null}break t}}ne=0,$t=null,Ns(t,e,s,5);break;case 6:ne=0,$t=null,Ns(t,e,s,6);break;case 8:mp(),Ue=6;break e;default:throw Error(w(462))}}WE();break}catch(u){m_(t,u)}while(!0);return li=Kr=null,O.H=i,O.A=r,ee=n,H!==null?0:(ue=null,X=0,Gc(),Ue)}function WE(){for(;H!==null&&!pw();)v_(H)}function v_(t){var e=Xv(t.alternate,t,gi);t.memoizedProps=t.pendingProps,e===null?Kc(t):H=e}function Iy(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=Ty(n,e,e.pendingProps,e.type,void 0,X);break;case 11:e=Ty(n,e,e.pendingProps,e.type.render,e.ref,X);break;case 5:ep(e);default:qv(n,e),e=H=qx(e,gi),e=Xv(n,e,gi)}t.memoizedProps=t.pendingProps,e===null?Kc(t):H=e}function Ns(t,e,n,i){li=Kr=null,ep(e),zs=null,po=0;var r=e.return;try{if(IE(t,r,e,n,X)){Ue=1,bc(t,hn(n,t.current)),H=null;return}}catch(s){if(r!==null)throw H=r,s;Ue=1,bc(t,hn(n,t.current)),H=null;return}e.flags&32768?(K||i===1?t=!0:ia||(X&536870912)!==0?t=!1:(Vi=t=!0,(i===2||i===9||i===3||i===6)&&(i=jt.current,i!==null&&i.tag===13&&(i.flags|=16384))),__(e,t)):Kc(e)}function Kc(t){var e=t;do{if((e.flags&32768)!==0){__(e,Vi);return}t=e.return;var n=OE(e.alternate,e,gi);if(n!==null){H=n;return}if(e=e.sibling,e!==null){H=e;return}H=e=t}while(e!==null);Ue===0&&(Ue=5)}function __(t,e){do{var n=BE(t.alternate,t);if(n!==null){n.flags&=32767,H=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){H=t;return}H=t=n}while(t!==null);Ue=6,H=null}function Ny(t,e,n,i,r,s,a,o,l){t.cancelPendingCommit=null;do Jc();while(qe!==0);if((ee&6)!==0)throw Error(w(327));if(e!==null){if(e===t.current)throw Error(w(177));if(s=e.lanes|e.childLanes,s|=Vh,ww(t,n,s,a,o,l),t===ue&&(H=ue=null,X=0),Zs=e,Yi=t,fi=n,ph=s,mh=r,d_=i,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,ZE(fc,function(){return E_(),null})):(t.callbackNode=null,t.callbackPriority=0),i=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||i){i=O.T,O.T=null,r=te.p,te.p=2,a=ee,ee|=4;try{FE(t,e,n)}finally{ee=a,te.p=r,O.T=i}}qe=1,S_(),b_(),M_()}}function S_(){if(qe===1){qe=0;var t=Yi,e=Zs,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=O.T,O.T=null;var i=te.p;te.p=2;var r=ee;ee|=4;try{r_(e,t);var s=_h,a=zx(t.containerInfo),o=s.focusedElem,l=s.selectionRange;if(a!==o&&o&&o.ownerDocument&&Fx(o.ownerDocument.documentElement,o)){if(l!==null&&zh(o)){var c=l.start,u=l.end;if(u===void 0&&(u=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(u,o.value.length);else{var f=o.ownerDocument||document,d=f&&f.defaultView||window;if(d.getSelection){var h=d.getSelection(),p=o.textContent.length,x=Math.min(l.start,p),b=l.end===void 0?x:Math.min(l.end,p);!h.extend&&x>b&&(a=b,b=x,x=a);var g=ny(o,x),m=ny(o,b);if(g&&m&&(h.rangeCount!==1||h.anchorNode!==g.node||h.anchorOffset!==g.offset||h.focusNode!==m.node||h.focusOffset!==m.offset)){var y=f.createRange();y.setStart(g.node,g.offset),h.removeAllRanges(),x>b?(h.addRange(y),h.extend(m.node,m.offset)):(y.setEnd(m.node,m.offset),h.addRange(y))}}}}for(f=[],h=o;h=h.parentNode;)h.nodeType===1&&f.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<f.length;o++){var _=f[o];_.element.scrollLeft=_.left,_.element.scrollTop=_.top}}Pc=!!vh,_h=vh=null}finally{ee=r,te.p=i,O.T=n}}t.current=e,qe=2}}function b_(){if(qe===2){qe=0;var t=Yi,e=Zs,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=O.T,O.T=null;var i=te.p;te.p=2;var r=ee;ee|=4;try{jv(t,e.alternate,e)}finally{ee=r,te.p=i,O.T=n}}qe=3}}function M_(){if(qe===4||qe===3){qe=0,mw();var t=Yi,e=Zs,n=fi,i=d_;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?qe=5:(qe=0,Zs=Yi=null,w_(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(qi=null),Lh(n),e=e.stateNode,Zt&&typeof Zt.onCommitFiberRoot=="function")try{Zt.onCommitFiberRoot(Mo,e,void 0,(e.current.flags&128)===128)}catch{}if(i!==null){e=O.T,r=te.p,te.p=2,O.T=null;try{for(var s=t.onRecoverableError,a=0;a<i.length;a++){var o=i[a];s(o.value,{componentStack:o.stack})}}finally{O.T=e,te.p=r}}(fi&3)!==0&&Jc(),Vn(t),r=t.pendingLanes,(n&261930)!==0&&(r&42)!==0?t===gh?so++:(so=0,gh=t):so=0,Uo(0,!1)}}function w_(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Co(e)))}function Jc(){return S_(),b_(),M_(),E_()}function E_(){if(qe!==5)return!1;var t=Yi,e=ph;ph=0;var n=Lh(fi),i=O.T,r=te.p;try{te.p=32>n?32:n,O.T=null,n=mh,mh=null;var s=Yi,a=fi;if(qe=0,Zs=Yi=null,fi=0,(ee&6)!==0)throw Error(w(331));var o=ee;if(ee|=4,c_(s.current),a_(s,s.current,a,n),ee=o,Uo(0,!1),Zt&&typeof Zt.onPostCommitFiberRoot=="function")try{Zt.onPostCommitFiberRoot(Mo,s)}catch{}return!0}finally{te.p=r,O.T=i,w_(t,e)}}function Py(t,e,n){e=hn(n,e),e=ch(t.stateNode,e,2),t=Xi(t,e,2),t!==null&&(Eo(t,2),Vn(t))}function ie(t,e,n){if(t.tag===3)Py(t,t,n);else for(;e!==null;){if(e.tag===3){Py(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(qi===null||!qi.has(i))){t=hn(n,t),n=Vv(2),i=Xi(e,n,2),i!==null&&(Gv(n,i,e,t),Eo(i,2),Vn(i));break}}e=e.return}}function Ad(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new GE;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(hp=!0,r.add(n),t=XE.bind(null,t,e,n),e.then(t,t))}function XE(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,ue===t&&(X&n)===n&&(Ue===4||Ue===3&&(X&62914560)===X&&300>Yt()-Yc?(ee&2)===0&&Ks(t,0):pp|=n,Ys===X&&(Ys=0)),Vn(t)}function T_(t,e){e===0&&(e=yx()),t=Zr(t,e),t!==null&&(Eo(t,e),Vn(t))}function qE(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),T_(t,n)}function YE(t,e){var n=0;switch(t.tag){case 31:case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;case 22:i=t.stateNode._retryCache;break;default:throw Error(w(314))}i!==null&&i.delete(e),T_(t,n)}function ZE(t,e){return Dh(t,e)}var Cc=null,bs=null,yh=!1,Rc=!1,Cd=!1,ki=0;function Vn(t){t!==bs&&t.next===null&&(bs===null?Cc=bs=t:bs=bs.next=t),Rc=!0,yh||(yh=!0,JE())}function Uo(t,e){if(!Cd&&Rc){Cd=!0;do for(var n=!1,i=Cc;i!==null;){if(!e)if(t!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var a=i.suspendedLanes,o=i.pingedLanes;s=(1<<31-Kt(42|t)+1)-1,s&=r&~(a&~o),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,Oy(i,s))}else s=X,s=Bc(i,i===ue?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||wo(i,s)||(n=!0,Oy(i,s));i=i.next}while(n);Cd=!1}}function KE(){A_()}function A_(){Rc=yh=!1;var t=0;ki!==0&&sT()&&(t=ki);for(var e=Yt(),n=null,i=Cc;i!==null;){var r=i.next,s=C_(i,e);s===0?(i.next=null,n===null?Cc=r:n.next=r,r===null&&(bs=n)):(n=i,(t!==0||(s&3)!==0)&&(Rc=!0)),i=r}qe!==0&&qe!==5||Uo(t,!1),ki!==0&&(ki=0)}function C_(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var a=31-Kt(s),o=1<<a,l=r[a];l===-1?((o&n)===0||(o&i)!==0)&&(r[a]=Mw(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}if(e=ue,n=X,n=Bc(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),i=t.callbackNode,n===0||t===e&&(ne===2||ne===9)||t.cancelPendingCommit!==null)return i!==null&&i!==null&&id(i),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||wo(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(i!==null&&id(i),Lh(n)){case 2:case 8:n=mx;break;case 32:n=fc;break;case 268435456:n=gx;break;default:n=fc}return i=R_.bind(null,t),n=Dh(n,i),t.callbackPriority=e,t.callbackNode=n,e}return i!==null&&i!==null&&id(i),t.callbackPriority=2,t.callbackNode=null,2}function R_(t,e){if(qe!==0&&qe!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(Jc()&&t.callbackNode!==n)return null;var i=X;return i=Bc(t,t===ue?i:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),i===0?null:(p_(t,i,e),C_(t,Yt()),t.callbackNode!=null&&t.callbackNode===n?R_.bind(null,t):null)}function Oy(t,e){if(Jc())return null;p_(t,e,!0)}function JE(){oT(function(){(ee&6)!==0?Dh(px,KE):A_()})}function gp(){if(ki===0){var t=Ws;t===0&&(t=Dl,Dl<<=1,(Dl&261888)===0&&(Dl=256)),ki=t}return ki}function By(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Yl(""+t)}function Fy(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function QE(t,e,n,i,r){if(e==="submit"&&n&&n.stateNode===r){var s=By((r[Ot]||null).action),a=i.submitter;a&&(e=(e=a[Ot]||null)?By(e.formAction):a.getAttribute("formAction"),e!==null&&(s=e,a=null));var o=new Fc("action","action",null,i,r);t.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(ki!==0){var l=a?Fy(r,a):new FormData(r);oh(n,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(o.preventDefault(),l=a?Fy(r,a):new FormData(r),oh(n,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(kl=0;kl<Zd.length;kl++)Hl=Zd[kl],zy=Hl.toLowerCase(),Vy=Hl[0].toUpperCase()+Hl.slice(1),An(zy,"on"+Vy);var Hl,zy,Vy,kl;An(Gx,"onAnimationEnd");An(kx,"onAnimationIteration");An(Hx,"onAnimationStart");An("dblclick","onDoubleClick");An("focusin","onFocus");An("focusout","onBlur");An(gE,"onTransitionRun");An(yE,"onTransitionStart");An(xE,"onTransitionCancel");An($x,"onTransitionEnd");Hs("onMouseEnter",["mouseout","mouseover"]);Hs("onMouseLeave",["mouseout","mouseover"]);Hs("onPointerEnter",["pointerout","pointerover"]);Hs("onPointerLeave",["pointerout","pointerover"]);Xr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Xr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Xr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Xr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Xr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Xr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var yo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),jE=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(yo));function D_(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;s=o,r.currentTarget=c;try{s(r)}catch(u){hc(u)}r.currentTarget=null,s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,c=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;s=o,r.currentTarget=c;try{s(r)}catch(u){hc(u)}r.currentTarget=null,s=l}}}}function k(t,e){var n=e[Gd];n===void 0&&(n=e[Gd]=new Set);var i=t+"__bubble";n.has(i)||(U_(e,t,2,!1),n.add(i))}function Rd(t,e,n){var i=0;e&&(i|=4),U_(n,t,i,e)}var $l="_reactListening"+Math.random().toString(36).slice(2);function yp(t){if(!t[$l]){t[$l]=!0,bx.forEach(function(n){n!=="selectionchange"&&(jE.has(n)||Rd(n,!1,t),Rd(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[$l]||(e[$l]=!0,Rd("selectionchange",!1,e))}}function U_(t,e,n,i){switch($_(e)){case 2:var r=AT;break;case 8:r=CT;break;default:r=Sp}n=r.bind(null,e,n,t),r=void 0,!Xd||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function Dd(t,e,n,i,r){var s=i;if((e&1)===0&&(e&2)===0&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&a.stateNode.containerInfo===r)return;a=a.return}for(;o!==null;){if(a=Es(o),a===null)return;if(l=a.tag,l===5||l===6||l===26||l===27){i=s=a;continue e}o=o.parentNode}}i=i.return}Dx(function(){var c=s,u=Ph(n),f=[];e:{var d=Wx.get(t);if(d!==void 0){var h=Fc,p=t;switch(t){case"keypress":if(Kl(n)===0)break e;case"keydown":case"keyup":h=Yw;break;case"focusin":p="focus",h=ld;break;case"focusout":p="blur",h=ld;break;case"beforeblur":case"afterblur":h=ld;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=q0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=Ow;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=Jw;break;case Gx:case kx:case Hx:h=zw;break;case $x:h=jw;break;case"scroll":case"scrollend":h=Nw;break;case"wheel":h=tE;break;case"copy":case"cut":case"paste":h=Gw;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=Z0;break;case"toggle":case"beforetoggle":h=iE}var x=(e&4)!==0,b=!x&&(t==="scroll"||t==="scrollend"),g=x?d!==null?d+"Capture":null:d;x=[];for(var m=c,y;m!==null;){var _=m;if(y=_.stateNode,_=_.tag,_!==5&&_!==26&&_!==27||y===null||g===null||(_=lo(m,g),_!=null&&x.push(xo(m,_,y))),b)break;m=m.return}0<x.length&&(d=new h(d,p,null,n,u),f.push({event:d,listeners:x}))}}if((e&7)===0){e:{if(d=t==="mouseover"||t==="pointerover",h=t==="mouseout"||t==="pointerout",d&&n!==Wd&&(p=n.relatedTarget||n.fromElement)&&(Es(p)||p[js]))break e;if((h||d)&&(d=u.window===u?u:(d=u.ownerDocument)?d.defaultView||d.parentWindow:window,h?(p=n.relatedTarget||n.toElement,h=c,p=p?Es(p):null,p!==null&&(b=bo(p),x=p.tag,p!==b||x!==5&&x!==27&&x!==6)&&(p=null)):(h=null,p=c),h!==p)){if(x=q0,_="onMouseLeave",g="onMouseEnter",m="mouse",(t==="pointerout"||t==="pointerover")&&(x=Z0,_="onPointerLeave",g="onPointerEnter",m="pointer"),b=h==null?d:Wa(h),y=p==null?d:Wa(p),d=new x(_,m+"leave",h,n,u),d.target=b,d.relatedTarget=y,_=null,Es(u)===c&&(x=new x(g,m+"enter",p,n,u),x.target=y,x.relatedTarget=b,_=x),b=_,h&&p)t:{for(x=eT,g=h,m=p,y=0,_=g;_;_=x(_))y++;_=0;for(var S=m;S;S=x(S))_++;for(;0<y-_;)g=x(g),y--;for(;0<_-y;)m=x(m),_--;for(;y--;){if(g===m||m!==null&&g===m.alternate){x=g;break t}g=x(g),m=x(m)}x=null}else x=null;h!==null&&Gy(f,d,h,x,!1),p!==null&&b!==null&&Gy(f,b,p,x,!0)}}e:{if(d=c?Wa(c):window,h=d.nodeName&&d.nodeName.toLowerCase(),h==="select"||h==="input"&&d.type==="file")var A=j0;else if(Q0(d))if(Ox)A=hE;else{A=fE;var E=uE}else h=d.nodeName,!h||h.toLowerCase()!=="input"||d.type!=="checkbox"&&d.type!=="radio"?c&&Nh(c.elementType)&&(A=j0):A=dE;if(A&&(A=A(t,c))){Px(f,A,n,u);break e}E&&E(t,d,c),t==="focusout"&&c&&d.type==="number"&&c.memoizedProps.value!=null&&$d(d,"number",d.value)}switch(E=c?Wa(c):window,t){case"focusin":(Q0(E)||E.contentEditable==="true")&&(Cs=E,qd=c,Ka=null);break;case"focusout":Ka=qd=Cs=null;break;case"mousedown":Yd=!0;break;case"contextmenu":case"mouseup":case"dragend":Yd=!1,iy(f,n,u);break;case"selectionchange":if(mE)break;case"keydown":case"keyup":iy(f,n,u)}var U;if(Fh)e:{switch(t){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else As?Ix(t,n)&&(L="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(L="onCompositionStart");L&&(Lx&&n.locale!=="ko"&&(As||L!=="onCompositionStart"?L==="onCompositionEnd"&&As&&(U=Ux()):(zi=u,Oh="value"in zi?zi.value:zi.textContent,As=!0)),E=Dc(c,L),0<E.length&&(L=new Y0(L,t,null,n,u),f.push({event:L,listeners:E}),U?L.data=U:(U=Nx(n),U!==null&&(L.data=U)))),(U=sE?aE(t,n):oE(t,n))&&(L=Dc(c,"onBeforeInput"),0<L.length&&(E=new Y0("onBeforeInput","beforeinput",null,n,u),f.push({event:E,listeners:L}),E.data=U)),QE(f,t,c,n,u)}D_(f,e)})}function xo(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Dc(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=lo(t,n),r!=null&&i.unshift(xo(t,r,s)),r=lo(t,e),r!=null&&i.push(xo(t,r,s))),t.tag===3)return i;t=t.return}return[]}function eT(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Gy(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,r?(c=lo(n,s),c!=null&&a.unshift(xo(n,c,l))):r||(c=lo(n,s),c!=null&&a.push(xo(n,c,l)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var tT=/\r\n?/g,nT=/\u0000|\uFFFD/g;function ky(t){return(typeof t=="string"?t:""+t).replace(tT,`
`).replace(nT,"")}function L_(t,e){return e=ky(e),ky(t)===e}function ae(t,e,n,i,r,s){switch(n){case"children":typeof i=="string"?e==="body"||e==="textarea"&&i===""||$s(t,i):(typeof i=="number"||typeof i=="bigint")&&e!=="body"&&$s(t,""+i);break;case"className":Il(t,"class",i);break;case"tabIndex":Il(t,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":Il(t,n,i);break;case"style":Rx(t,i,s);break;case"data":if(e!=="object"){Il(t,"data",i);break}case"src":case"href":if(i===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){t.removeAttribute(n);break}i=Yl(""+i),t.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&ae(t,e,"name",r.name,r,null),ae(t,e,"formEncType",r.formEncType,r,null),ae(t,e,"formMethod",r.formMethod,r,null),ae(t,e,"formTarget",r.formTarget,r,null)):(ae(t,e,"encType",r.encType,r,null),ae(t,e,"method",r.method,r,null),ae(t,e,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){t.removeAttribute(n);break}i=Yl(""+i),t.setAttribute(n,i);break;case"onClick":i!=null&&(t.onclick=oi);break;case"onScroll":i!=null&&k("scroll",t);break;case"onScrollEnd":i!=null&&k("scrollend",t);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(w(61));if(n=i.__html,n!=null){if(r.children!=null)throw Error(w(60));t.innerHTML=n}}break;case"multiple":t.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":t.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){t.removeAttribute("xlink:href");break}n=Yl(""+i),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,""+i):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":i===!0?t.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,i):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?t.setAttribute(n,i):t.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?t.removeAttribute(n):t.setAttribute(n,i);break;case"popover":k("beforetoggle",t),k("toggle",t),ql(t,"popover",i);break;case"xlinkActuate":jn(t,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":jn(t,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":jn(t,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":jn(t,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":jn(t,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":jn(t,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":jn(t,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":jn(t,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":jn(t,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":ql(t,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=Lw.get(n)||n,ql(t,n,i))}}function xh(t,e,n,i,r,s){switch(n){case"style":Rx(t,i,s);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(w(61));if(n=i.__html,n!=null){if(r.children!=null)throw Error(w(60));t.innerHTML=n}}break;case"children":typeof i=="string"?$s(t,i):(typeof i=="number"||typeof i=="bigint")&&$s(t,""+i);break;case"onScroll":i!=null&&k("scroll",t);break;case"onScrollEnd":i!=null&&k("scrollend",t);break;case"onClick":i!=null&&(t.onclick=oi);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Mx.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Ot]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof i=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,i,r);break e}n in t?t[n]=i:i===!0?t.setAttribute(n,""):ql(t,n,i)}}}function ft(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":k("error",t),k("load",t);var i=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var a=n[s];if(a!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(w(137,e));default:ae(t,e,s,a,n,null)}}r&&ae(t,e,"srcSet",n.srcSet,n,null),i&&ae(t,e,"src",n.src,n,null);return;case"input":k("invalid",t);var o=s=a=r=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var u=n[i];if(u!=null)switch(i){case"name":r=u;break;case"type":a=u;break;case"checked":l=u;break;case"defaultChecked":c=u;break;case"value":s=u;break;case"defaultValue":o=u;break;case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(w(137,e));break;default:ae(t,e,i,u,n,null)}}Tx(t,s,o,l,c,a,r,!1);return;case"select":k("invalid",t),i=a=s=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":s=o;break;case"defaultValue":a=o;break;case"multiple":i=o;default:ae(t,e,r,o,n,null)}e=s,n=a,t.multiple=!!i,e!=null?Os(t,!!i,e,!1):n!=null&&Os(t,!!i,n,!0);return;case"textarea":k("invalid",t),s=r=i=null;for(a in n)if(n.hasOwnProperty(a)&&(o=n[a],o!=null))switch(a){case"value":i=o;break;case"defaultValue":r=o;break;case"children":s=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(w(91));break;default:ae(t,e,a,o,n,null)}Cx(t,i,r,s);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":t.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:ae(t,e,l,i,n,null)}return;case"dialog":k("beforetoggle",t),k("toggle",t),k("cancel",t),k("close",t);break;case"iframe":case"object":k("load",t);break;case"video":case"audio":for(i=0;i<yo.length;i++)k(yo[i],t);break;case"image":k("error",t),k("load",t);break;case"details":k("toggle",t);break;case"embed":case"source":case"link":k("error",t),k("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(w(137,e));default:ae(t,e,c,i,n,null)}return;default:if(Nh(e)){for(u in n)n.hasOwnProperty(u)&&(i=n[u],i!==void 0&&xh(t,e,u,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&ae(t,e,o,i,n,null))}function iT(t,e,n,i){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,a=null,o=null,l=null,c=null,u=null;for(h in n){var f=n[h];if(n.hasOwnProperty(h)&&f!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":l=f;default:i.hasOwnProperty(h)||ae(t,e,h,null,i,f)}}for(var d in i){var h=i[d];if(f=n[d],i.hasOwnProperty(d)&&(h!=null||f!=null))switch(d){case"type":s=h;break;case"name":r=h;break;case"checked":c=h;break;case"defaultChecked":u=h;break;case"value":a=h;break;case"defaultValue":o=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(w(137,e));break;default:h!==f&&ae(t,e,d,h,i,f)}}Hd(t,a,o,l,c,u,s,r);return;case"select":h=a=o=d=null;for(s in n)if(l=n[s],n.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":h=l;default:i.hasOwnProperty(s)||ae(t,e,s,null,i,l)}for(r in i)if(s=i[r],l=n[r],i.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":d=s;break;case"defaultValue":o=s;break;case"multiple":a=s;default:s!==l&&ae(t,e,r,s,i,l)}e=o,n=a,i=h,d!=null?Os(t,!!n,d,!1):!!i!=!!n&&(e!=null?Os(t,!!n,e,!0):Os(t,!!n,n?[]:"",!1));return;case"textarea":h=d=null;for(o in n)if(r=n[o],n.hasOwnProperty(o)&&r!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:ae(t,e,o,null,i,r)}for(a in i)if(r=i[a],s=n[a],i.hasOwnProperty(a)&&(r!=null||s!=null))switch(a){case"value":d=r;break;case"defaultValue":h=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(w(91));break;default:r!==s&&ae(t,e,a,r,i,s)}Ax(t,d,h);return;case"option":for(var p in n)if(d=n[p],n.hasOwnProperty(p)&&d!=null&&!i.hasOwnProperty(p))switch(p){case"selected":t.selected=!1;break;default:ae(t,e,p,null,i,d)}for(l in i)if(d=i[l],h=n[l],i.hasOwnProperty(l)&&d!==h&&(d!=null||h!=null))switch(l){case"selected":t.selected=d&&typeof d!="function"&&typeof d!="symbol";break;default:ae(t,e,l,d,i,h)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)d=n[x],n.hasOwnProperty(x)&&d!=null&&!i.hasOwnProperty(x)&&ae(t,e,x,null,i,d);for(c in i)if(d=i[c],h=n[c],i.hasOwnProperty(c)&&d!==h&&(d!=null||h!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(w(137,e));break;default:ae(t,e,c,d,i,h)}return;default:if(Nh(e)){for(var b in n)d=n[b],n.hasOwnProperty(b)&&d!==void 0&&!i.hasOwnProperty(b)&&xh(t,e,b,void 0,i,d);for(u in i)d=i[u],h=n[u],!i.hasOwnProperty(u)||d===h||d===void 0&&h===void 0||xh(t,e,u,d,i,h);return}}for(var g in n)d=n[g],n.hasOwnProperty(g)&&d!=null&&!i.hasOwnProperty(g)&&ae(t,e,g,null,i,d);for(f in i)d=i[f],h=n[f],!i.hasOwnProperty(f)||d===h||d==null&&h==null||ae(t,e,f,d,i,h)}function Hy(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function rT(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var r=n[i],s=r.transferSize,a=r.initiatorType,o=r.duration;if(s&&o&&Hy(a)){for(a=0,o=r.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var u=l.transferSize,f=l.initiatorType;u&&Hy(f)&&(l=l.responseEnd,a+=u*(l<o?1:(o-c)/(l-c)))}if(--i,e+=8*(s+a)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var vh=null,_h=null;function Uc(t){return t.nodeType===9?t:t.ownerDocument}function $y(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function I_(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Sh(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Ud=null;function sT(){var t=window.event;return t&&t.type==="popstate"?t===Ud?!1:(Ud=t,!0):(Ud=null,!1)}var N_=typeof setTimeout=="function"?setTimeout:void 0,aT=typeof clearTimeout=="function"?clearTimeout:void 0,Wy=typeof Promise=="function"?Promise:void 0,oT=typeof queueMicrotask=="function"?queueMicrotask:typeof Wy<"u"?function(t){return Wy.resolve(null).then(t).catch(lT)}:N_;function lT(t){setTimeout(function(){throw t})}function ir(t){return t==="head"}function Xy(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(i===0){t.removeChild(r),Qs(e);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")ao(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,ao(n);for(var s=n.firstChild;s;){var a=s.nextSibling,o=s.nodeName;s[To]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=a}}else n==="body"&&ao(t.ownerDocument.body);n=r}while(n);Qs(e)}function qy(t,e){var n=t;t=0;do{var i=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=i}while(n)}function bh(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":bh(n),Ih(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function cT(t,e,n,i){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!i&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(i){if(!t[To])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=gn(t.nextSibling),t===null)break}return null}function uT(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=gn(t.nextSibling),t===null))return null;return t}function P_(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=gn(t.nextSibling),t===null))return null;return t}function Mh(t){return t.data==="$?"||t.data==="$~"}function wh(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function fT(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var i=function(){e(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),t._reactRetry=i}}function gn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Eh=null;function Yy(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return gn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function Zy(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function O_(t,e,n){switch(e=Uc(n),t){case"html":if(t=e.documentElement,!t)throw Error(w(452));return t;case"head":if(t=e.head,!t)throw Error(w(453));return t;case"body":if(t=e.body,!t)throw Error(w(454));return t;default:throw Error(w(451))}}function ao(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);Ih(t)}var yn=new Map,Ky=new Set;function Lc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var yi=te.d;te.d={f:dT,r:hT,D:pT,C:mT,L:gT,m:yT,X:vT,S:xT,M:_T};function dT(){var t=yi.f(),e=Zc();return t||e}function hT(t){var e=ea(t);e!==null&&e.tag===5&&e.type==="form"?Rv(e):yi.r(t)}var ra=typeof document>"u"?null:document;function B_(t,e,n){var i=ra;if(i&&typeof e=="string"&&e){var r=dn(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),Ky.has(r)||(Ky.add(r),t={rel:t,crossOrigin:n,href:e},i.querySelector(r)===null&&(e=i.createElement("link"),ft(e,"link",t),et(e),i.head.appendChild(e)))}}function pT(t){yi.D(t),B_("dns-prefetch",t,null)}function mT(t,e){yi.C(t,e),B_("preconnect",t,e)}function gT(t,e,n){yi.L(t,e,n);var i=ra;if(i&&t&&e){var r='link[rel="preload"][as="'+dn(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+dn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+dn(n.imageSizes)+'"]')):r+='[href="'+dn(t)+'"]';var s=r;switch(e){case"style":s=Js(t);break;case"script":s=sa(t)}yn.has(s)||(t=ge({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),yn.set(s,t),i.querySelector(r)!==null||e==="style"&&i.querySelector(Lo(s))||e==="script"&&i.querySelector(Io(s))||(e=i.createElement("link"),ft(e,"link",t),et(e),i.head.appendChild(e)))}}function yT(t,e){yi.m(t,e);var n=ra;if(n&&t){var i=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+dn(i)+'"][href="'+dn(t)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=sa(t)}if(!yn.has(s)&&(t=ge({rel:"modulepreload",href:t},e),yn.set(s,t),n.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Io(s)))return}i=n.createElement("link"),ft(i,"link",t),et(i),n.head.appendChild(i)}}}function xT(t,e,n){yi.S(t,e,n);var i=ra;if(i&&t){var r=Ps(i).hoistableStyles,s=Js(t);e=e||"default";var a=r.get(s);if(!a){var o={loading:0,preload:null};if(a=i.querySelector(Lo(s)))o.loading=5;else{t=ge({rel:"stylesheet",href:t,"data-precedence":e},n),(n=yn.get(s))&&xp(t,n);var l=a=i.createElement("link");et(l),ft(l,"link",t),l._p=new Promise(function(c,u){l.onload=c,l.onerror=u}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,rc(a,e,i)}a={type:"stylesheet",instance:a,count:1,state:o},r.set(s,a)}}}function vT(t,e){yi.X(t,e);var n=ra;if(n&&t){var i=Ps(n).hoistableScripts,r=sa(t),s=i.get(r);s||(s=n.querySelector(Io(r)),s||(t=ge({src:t,async:!0},e),(e=yn.get(r))&&vp(t,e),s=n.createElement("script"),et(s),ft(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function _T(t,e){yi.M(t,e);var n=ra;if(n&&t){var i=Ps(n).hoistableScripts,r=sa(t),s=i.get(r);s||(s=n.querySelector(Io(r)),s||(t=ge({src:t,async:!0,type:"module"},e),(e=yn.get(r))&&vp(t,e),s=n.createElement("script"),et(s),ft(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function Jy(t,e,n,i){var r=(r=Hi.current)?Lc(r):null;if(!r)throw Error(w(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Js(n.href),n=Ps(r).hoistableStyles,i=n.get(e),i||(i={type:"style",instance:null,count:0,state:null},n.set(e,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Js(n.href);var s=Ps(r).hoistableStyles,a=s.get(t);if(a||(r=r.ownerDocument||r,a={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,a),(s=r.querySelector(Lo(t)))&&!s._p&&(a.instance=s,a.state.loading=5),yn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},yn.set(t,n),s||ST(r,t,n,a.state))),e&&i===null)throw Error(w(528,""));return a}if(e&&i!==null)throw Error(w(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=sa(n),n=Ps(r).hoistableScripts,i=n.get(e),i||(i={type:"script",instance:null,count:0,state:null},n.set(e,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(w(444,t))}}function Js(t){return'href="'+dn(t)+'"'}function Lo(t){return'link[rel="stylesheet"]['+t+"]"}function F_(t){return ge({},t,{"data-precedence":t.precedence,precedence:null})}function ST(t,e,n,i){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?i.loading=1:(e=t.createElement("link"),i.preload=e,e.addEventListener("load",function(){return i.loading|=1}),e.addEventListener("error",function(){return i.loading|=2}),ft(e,"link",n),et(e),t.head.appendChild(e))}function sa(t){return'[src="'+dn(t)+'"]'}function Io(t){return"script[async]"+t}function Qy(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var i=t.querySelector('style[data-href~="'+dn(n.href)+'"]');if(i)return e.instance=i,et(i),i;var r=ge({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(t.ownerDocument||t).createElement("style"),et(i),ft(i,"style",r),rc(i,n.precedence,t),e.instance=i;case"stylesheet":r=Js(n.href);var s=t.querySelector(Lo(r));if(s)return e.state.loading|=4,e.instance=s,et(s),s;i=F_(n),(r=yn.get(r))&&xp(i,r),s=(t.ownerDocument||t).createElement("link"),et(s);var a=s;return a._p=new Promise(function(o,l){a.onload=o,a.onerror=l}),ft(s,"link",i),e.state.loading|=4,rc(s,n.precedence,t),e.instance=s;case"script":return s=sa(n.src),(r=t.querySelector(Io(s)))?(e.instance=r,et(r),r):(i=n,(r=yn.get(s))&&(i=ge({},n),vp(i,r)),t=t.ownerDocument||t,r=t.createElement("script"),et(r),ft(r,"link",i),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(w(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(i=e.instance,e.state.loading|=4,rc(i,n.precedence,t));return e.instance}function rc(t,e,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,a=0;a<i.length;a++){var o=i[a];if(o.dataset.precedence===e)s=o;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function xp(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function vp(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var sc=null;function jy(t,e,n){if(sc===null){var i=new Map,r=sc=new Map;r.set(n,i)}else r=sc,i=r.get(n),i||(i=new Map,r.set(n,i));if(i.has(t))return i;for(i.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[To]||s[lt]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var a=s.getAttribute(e)||"";a=t+a;var o=i.get(a);o?o.push(s):i.set(a,[s])}}return i}function ex(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function bT(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function z_(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function MT(t,e,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var r=Js(i.href),s=e.querySelector(Lo(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Ic.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,et(s);return}s=e.ownerDocument||e,i=F_(i),(r=yn.get(r))&&xp(i,r),s=s.createElement("link"),et(s);var a=s;a._p=new Promise(function(o,l){a.onload=o,a.onerror=l}),ft(s,"link",i),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=Ic.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Ld=0;function wT(t,e){return t.stylesheets&&t.count===0&&ac(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var i=setTimeout(function(){if(t.stylesheets&&ac(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&Ld===0&&(Ld=62500*rT());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&ac(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>Ld?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function Ic(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)ac(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Nc=null;function ac(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Nc=new Map,e.forEach(ET,t),Nc=null,Ic.call(t))}function ET(t,e){if(!(e.state.loading&4)){var n=Nc.get(t);if(n)var i=n.get(null);else{n=new Map,Nc.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var a=r[s];(a.nodeName==="LINK"||a.getAttribute("media")!=="not all")&&(n.set(a.dataset.precedence,a),i=a)}i&&n.set(null,i)}r=e.instance,a=r.getAttribute("data-precedence"),s=n.get(a)||i,s===i&&n.set(null,r),n.set(a,r),this.count++,i=Ic.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var vo={$$typeof:ai,Provider:null,Consumer:null,_currentValue:Or,_currentValue2:Or,_threadCount:0};function TT(t,e,n,i,r,s,a,o,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=rd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=rd(0),this.hiddenUpdates=rd(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=a,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function V_(t,e,n,i,r,s,a,o,l,c,u,f){return t=new TT(t,e,n,a,l,c,u,f,o),e=1,s===!0&&(e|=24),s=Xt(3,null,null,e),t.current=s,s.stateNode=t,e=Wh(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:i,isDehydrated:n,cache:e},Yh(s),t}function G_(t){return t?(t=Us,t):Us}function k_(t,e,n,i,r,s){r=G_(r),i.context===null?i.context=r:i.pendingContext=r,i=Wi(e),i.payload={element:n},s=s===void 0?null:s,s!==null&&(i.callback=s),n=Xi(t,i,e),n!==null&&(Pt(n,t,e),Qa(n,t,e))}function tx(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function _p(t,e){tx(t,e),(t=t.alternate)&&tx(t,e)}function H_(t){if(t.tag===13||t.tag===31){var e=Zr(t,67108864);e!==null&&Pt(e,t,67108864),_p(t,67108864)}}function nx(t){if(t.tag===13||t.tag===31){var e=Jt();e=Uh(e);var n=Zr(t,e);n!==null&&Pt(n,t,e),_p(t,e)}}var Pc=!0;function AT(t,e,n,i){var r=O.T;O.T=null;var s=te.p;try{te.p=2,Sp(t,e,n,i)}finally{te.p=s,O.T=r}}function CT(t,e,n,i){var r=O.T;O.T=null;var s=te.p;try{te.p=8,Sp(t,e,n,i)}finally{te.p=s,O.T=r}}function Sp(t,e,n,i){if(Pc){var r=Th(i);if(r===null)Dd(t,e,i,Oc,n),ix(t,i);else if(DT(r,t,e,n,i))i.stopPropagation();else if(ix(t,i),e&4&&-1<RT.indexOf(t)){for(;r!==null;){var s=ea(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var a=Ir(s.pendingLanes);if(a!==0){var o=s;for(o.pendingLanes|=2,o.entangledLanes|=2;a;){var l=1<<31-Kt(a);o.entanglements[1]|=l,a&=~l}Vn(s),(ee&6)===0&&(Ec=Yt()+500,Uo(0,!1))}}break;case 31:case 13:o=Zr(s,2),o!==null&&Pt(o,s,2),Zc(),_p(s,2)}if(s=Th(i),s===null&&Dd(t,e,i,Oc,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else Dd(t,e,i,null,n)}}function Th(t){return t=Ph(t),bp(t)}var Oc=null;function bp(t){if(Oc=null,t=Es(t),t!==null){var e=bo(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=cx(e),t!==null)return t;t=null}else if(n===31){if(t=ux(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Oc=t,null}function $_(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(gw()){case px:return 2;case mx:return 8;case fc:case yw:return 32;case gx:return 268435456;default:return 32}default:return 32}}var Ah=!1,Zi=null,Ki=null,Ji=null,_o=new Map,So=new Map,Bi=[],RT="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ix(t,e){switch(t){case"focusin":case"focusout":Zi=null;break;case"dragenter":case"dragleave":Ki=null;break;case"mouseover":case"mouseout":Ji=null;break;case"pointerover":case"pointerout":_o.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":So.delete(e.pointerId)}}function Ga(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=ea(e),e!==null&&H_(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function DT(t,e,n,i,r){switch(e){case"focusin":return Zi=Ga(Zi,t,e,n,i,r),!0;case"dragenter":return Ki=Ga(Ki,t,e,n,i,r),!0;case"mouseover":return Ji=Ga(Ji,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return _o.set(s,Ga(_o.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,So.set(s,Ga(So.get(s)||null,t,e,n,i,r)),!0}return!1}function W_(t){var e=Es(t.target);if(e!==null){var n=bo(e);if(n!==null){if(e=n.tag,e===13){if(e=cx(n),e!==null){t.blockedOn=e,V0(t.priority,function(){nx(n)});return}}else if(e===31){if(e=ux(n),e!==null){t.blockedOn=e,V0(t.priority,function(){nx(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function oc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Th(t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);Wd=i,n.target.dispatchEvent(i),Wd=null}else return e=ea(n),e!==null&&H_(e),t.blockedOn=n,!1;e.shift()}return!0}function rx(t,e,n){oc(t)&&n.delete(e)}function UT(){Ah=!1,Zi!==null&&oc(Zi)&&(Zi=null),Ki!==null&&oc(Ki)&&(Ki=null),Ji!==null&&oc(Ji)&&(Ji=null),_o.forEach(rx),So.forEach(rx)}function Wl(t,e){t.blockedOn===e&&(t.blockedOn=null,Ah||(Ah=!0,Ye.unstable_scheduleCallback(Ye.unstable_NormalPriority,UT)))}var Xl=null;function sx(t){Xl!==t&&(Xl=t,Ye.unstable_scheduleCallback(Ye.unstable_NormalPriority,function(){Xl===t&&(Xl=null);for(var e=0;e<t.length;e+=3){var n=t[e],i=t[e+1],r=t[e+2];if(typeof i!="function"){if(bp(i||n)===null)continue;break}var s=ea(n);s!==null&&(t.splice(e,3),e-=3,oh(s,{pending:!0,data:r,method:n.method,action:i},i,r))}}))}function Qs(t){function e(l){return Wl(l,t)}Zi!==null&&Wl(Zi,t),Ki!==null&&Wl(Ki,t),Ji!==null&&Wl(Ji,t),_o.forEach(e),So.forEach(e);for(var n=0;n<Bi.length;n++){var i=Bi[n];i.blockedOn===t&&(i.blockedOn=null)}for(;0<Bi.length&&(n=Bi[0],n.blockedOn===null);)W_(n),n.blockedOn===null&&Bi.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var r=n[i],s=n[i+1],a=r[Ot]||null;if(typeof s=="function")a||sx(n);else if(a){var o=null;if(s&&s.hasAttribute("formAction")){if(r=s,a=s[Ot]||null)o=a.formAction;else if(bp(r)!==null)continue}else o=a.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),sx(n)}}}function X_(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(a){return r=a})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function Mp(t){this._internalRoot=t}Qc.prototype.render=Mp.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(w(409));var n=e.current,i=Jt();k_(n,i,t,e,null,null)};Qc.prototype.unmount=Mp.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;k_(t.current,2,null,t,null,null),Zc(),e[js]=null}};function Qc(t){this._internalRoot=t}Qc.prototype.unstable_scheduleHydration=function(t){if(t){var e=Sx();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Bi.length&&e!==0&&e<Bi[n].priority;n++);Bi.splice(n,0,t),n===0&&W_(t)}};var ax=ox.version;if(ax!=="19.2.0")throw Error(w(527,ax,"19.2.0"));te.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(w(188)):(t=Object.keys(t).join(","),Error(w(268,t)));return t=cw(e),t=t!==null?fx(t):null,t=t===null?null:t.stateNode,t};var LT={bundleType:0,version:"19.2.0",rendererPackageName:"react-dom",currentDispatcherRef:O,reconcilerVersion:"19.2.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ka=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ka.isDisabled&&ka.supportsFiber))try{Mo=ka.inject(LT),Zt=ka}catch{}var ka;jc.createRoot=function(t,e){if(!lx(t))throw Error(w(299));var n=!1,i="",r=Bv,s=Fv,a=zv;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(a=e.onRecoverableError)),e=V_(t,1,!1,null,null,n,i,null,r,s,a,X_),t[js]=e.current,yp(t),new Mp(e)};jc.hydrateRoot=function(t,e,n){if(!lx(t))throw Error(w(299));var i=!1,r="",s=Bv,a=Fv,o=zv,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(a=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=V_(t,1,!0,e,n??null,i,r,l,s,a,o,X_),e.context=G_(null),n=e.current,i=Jt(),i=Uh(i),r=Wi(i),r.callback=null,Xi(n,r,i),n=i,e.current.lanes=n,Eo(e,n),Vn(e),t[js]=e.current,yp(t),new Qc(e)};jc.version="19.2.0"});var K_=In((yL,Z_)=>{"use strict";function Y_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Y_)}catch(t){console.error(t)}}Y_(),Z_.exports=q_()});var FM=In(rf=>{"use strict";var M2=Symbol.for("react.transitional.element"),w2=Symbol.for("react.fragment");function BM(t,e,n){var i=null;if(n!==void 0&&(i=""+n),e.key!==void 0&&(i=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:M2,type:t,key:i,ref:e!==void 0?e:null,props:n}}rf.Fragment=w2;rf.jsx=BM;rf.jsxs=BM});var _i=In((_O,zM)=>{"use strict";zM.exports=FM()});var fs=Ht(Dr()),C1=Ht(K_());var le=Ht(Dr(),1),IT=(t,e,n,i,r,s,a,o)=>{let l=document.documentElement,c=["light","dark"];function u(h){(Array.isArray(t)?t:[t]).forEach(p=>{let x=p==="class",b=x&&s?r.map(g=>s[g]||g):r;x?(l.classList.remove(...b),l.classList.add(s&&s[h]?s[h]:h)):l.setAttribute(p,h)}),f(h)}function f(h){o&&c.includes(h)&&(l.style.colorScheme=h)}function d(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)u(i);else try{let h=localStorage.getItem(e)||n,p=a&&h==="system"?d():h;u(p)}catch{}},J_=["light","dark"],Q_="(prefers-color-scheme: dark)",NT=typeof window>"u",Ep=le.createContext(void 0),PT={setTheme:t=>{},themes:[]},j_=()=>{var t;return(t=le.useContext(Ep))!=null?t:PT},eS=t=>le.useContext(Ep)?le.createElement(le.Fragment,null,t.children):le.createElement(BT,{...t}),OT=["light","dark"],BT=({forcedTheme:t,disableTransitionOnChange:e=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:r="theme",themes:s=OT,defaultTheme:a=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:u,scriptProps:f})=>{let[d,h]=le.useState(()=>zT(r,a)),[p,x]=le.useState(()=>d==="system"?wp():d),b=l?Object.values(l):s,g=le.useCallback(S=>{let A=S;if(!A)return;S==="system"&&n&&(A=wp());let E=l?l[A]:A,U=e?VT(u):null,L=document.documentElement,P=$=>{$==="class"?(L.classList.remove(...b),E&&L.classList.add(E)):$.startsWith("data-")&&(E?L.setAttribute($,E):L.removeAttribute($))};if(Array.isArray(o)?o.forEach(P):P(o),i){let $=J_.includes(a)?a:null,_e=J_.includes(A)?A:$;L.style.colorScheme=_e}U?.()},[u]),m=le.useCallback(S=>{let A=typeof S=="function"?S(d):S;h(A);try{localStorage.setItem(r,A)}catch{}},[d]),y=le.useCallback(S=>{let A=wp(S);x(A),d==="system"&&n&&!t&&g("system")},[d,t]);le.useEffect(()=>{let S=window.matchMedia(Q_);return S.addListener(y),y(S),()=>S.removeListener(y)},[y]),le.useEffect(()=>{let S=A=>{A.key===r&&(A.newValue?h(A.newValue):m(a))};return window.addEventListener("storage",S),()=>window.removeEventListener("storage",S)},[m]),le.useEffect(()=>{g(t??d)},[t,d]);let _=le.useMemo(()=>({theme:d,setTheme:m,forcedTheme:t,resolvedTheme:d==="system"?p:d,themes:n?[...s,"system"]:s,systemTheme:n?p:void 0}),[d,m,t,p,n,s]);return le.createElement(Ep.Provider,{value:_},le.createElement(FT,{forcedTheme:t,storageKey:r,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:a,value:l,themes:s,nonce:u,scriptProps:f}),c)},FT=le.memo(({forcedTheme:t,storageKey:e,attribute:n,enableSystem:i,enableColorScheme:r,defaultTheme:s,value:a,themes:o,nonce:l,scriptProps:c})=>{let u=JSON.stringify([n,e,s,t,o,a,i,r]).slice(1,-1);return le.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${IT.toString()})(${u})`}})}),zT=(t,e)=>{if(NT)return;let n;try{n=localStorage.getItem(t)||void 0}catch{}return n||e},VT=t=>{let e=document.createElement("style");return t&&e.setAttribute("nonce",t),e.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(e),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(e)},1)}},wp=t=>(t||(t=window.matchMedia(Q_)),t.matches?"dark":"light");var us={};V1(us,{default:()=>Cf});var sn=Ht(Dr());var Rt=Ht(Dr());var Jr=class extends Error{code;severity;fix;where;cause;detail;constructor(e){super(e.message,{cause:e.cause}),this.name="VGPUError",this.code=e.code,this.severity=e.severity??"error",this.fix=e.fix,this.where=e.where,this.cause=e.cause,this.detail=e.detail}},Ae=class extends Jr{constructor(e){super({...e,severity:"error"}),this.name="ValidationError"}};function tS(t){return new Jr({code:"VGPU-FEATURE-UNSUPPORTED",message:`Adapter does not support requested feature(s): ${t.map(e=>`"${e}"`).join(", ")}.`,fix:"Remove the unsupported name(s) from init({ requiredFeatures: [...] }) or run on an adapter that supports them; gate optional code paths on device.features after init.",where:"init"})}function Tp(t,e){if(!t)return;let n=(e??[]).filter(i=>!t.has(i));if(n.length)throw tS(n)}var GT={map_read:1,map_write:2,copy_src:4,copy_dst:8,index:16,vertex:32,uniform:64,storage:128,indirect:256,query_resolve:512};function xi(t){let e=globalThis.GPUBufferUsage;return t.reduce((n,i)=>n|kT(i,e),0)}function kT(t,e){let n=t.toUpperCase();return e?.[n]??GT[t]}function Ap(){return globalThis.GPUMapMode?.READ??1}var HT={copy_src:1,copy_dst:2,texture_binding:4,storage_binding:8,render_attachment:16};function eu(t){let e=globalThis.GPUTextureUsage;return t.reduce((n,i)=>n|$T(i,e),0)}function $T(t,e){let n=t.toUpperCase();return e?.[n]??HT[t]}function tu(t){return"__vgpuMockBytes"in t}function nu(t){return"__vgpuMockBytes"in t}var WT=1;function vi(t){return Object.freeze({kind:t,id:WT++})}var Cn=class{callbacks=new Set;destroyed=!1;onDestroy(e,n){return this.destroyed?(n(e),()=>{}):(this.callbacks.add(n),()=>{this.callbacks.delete(n)})}emit(e){if(this.destroyed)return!1;this.destroyed=!0;let n=[...this.callbacks];this.callbacks.clear();let i=[];for(let r of n)try{r(e)}catch(s){i.push(s)}if(i.length)throw i[0];return!0}};var yt=class{device;gpu;options;ownership;destroySignal=new Cn;identity=vi("buffer");destroyed=!1;constructor(e,n,i,r="owned"){this.device=e,this.gpu=n,this.options=i,this.ownership=r,Object.defineProperty(this,"assertUsable",{value:(s,a)=>this.#e(s,a)})}get resourceIdentity(){return this.identity}onDestroy(e){return this.destroySignal.onDestroy(this,e)}#e(e="Buffer",n){if(n&&n.gpu!==this.device.gpu)throw new Ae({code:"VGPU-BUFFER-DEVICE-MISMATCH",message:"Buffer belongs to a different GPU device.",where:e});if(this.destroyed)throw new Ae({code:"VGPU-BUFFER-DISPOSED",message:"Buffer is destroyed.",where:e,fix:"Wrap or create a live GPUBuffer before using it."});this.device.assertUsable(e)}write(e,n=0){this.#e("Buffer.write"),this.ownership==="external"&&this.validateExternalOperation("write",n,e.byteLength,"copy_dst");try{this.device.queue.writeBuffer(this.gpu,n,e)}catch(i){throw this.ownership!=="external"?i:iu("Buffer.write","The external GPUBuffer rejected the write operation.",i)}}async read(e,n=0){this.#e("Buffer.read"),this.ownership==="external"&&this.validateExternalOperation("read",n,e,"copy_src");try{let i=await this.device.readback.read(this.gpu,e,n);return this.#e("Buffer.read"),i}catch(i){throw i instanceof Ae||this.ownership!=="external"?i:iu("Buffer.read","The external GPUBuffer rejected the read operation.",i)}}destroy(){this.destroyed||(this.destroyed=!0,this.destroySignal.emit(this),this.ownership==="owned"&&!tu(this.gpu)&&this.gpu.destroy())}dispose(){this.destroy()}validateExternalOperation(e,n,i,r){if(!(Number.isSafeInteger(n)&&n>=0&&n%4===0&&Number.isSafeInteger(i)&&i>=0&&i%4===0&&n<=this.options.size&&i<=this.options.size-n))throw iu(`Buffer.${e}`,"External buffer offsets and lengths must be non-negative, 4-byte aligned, and within the buffer size.");if((this.gpu.usage&xi([r]))===0)throw iu(`Buffer.${e}`,`External buffer is missing ${r.toUpperCase()} usage.`)}};function iu(t,e,n){return new Ae({code:"VGPU-EXTERNAL-BUFFER-VALIDATION",message:e,where:t,cause:n,fix:"Use a buffer with the required usage flags and an aligned in-range operation."})}function Cp(t){if(JT(t))throw QT();let e={version:1,mappings:[]},n={version:1,modules:[{path:"<runtime>",text:t}],diagnostics:[],sourceMap:e,cacheKey:XT(t)};return{kind:"wgsl",wgsl:t,source:{text:t,path:"<runtime>",imports:[]},ast:n,sourceMap:e,diagnostics:[],cacheKey:n.cacheKey,entryPoints:qT(t),stats:{lines:t.split(/\r?\n/).length,bytes:new TextEncoder().encode(t).byteLength,bindGroups:0}}}function XT(t){let e=2166136261;for(let n=0;n<t.length;n++)e=Math.imul(e^t.charCodeAt(n),16777619);return{default:`vgpu-wgsl-1:${(e>>>0).toString(16).padStart(8,"0")}`}}function qT(t){let e=[],n=YT(t);for(let i=n();i!==void 0;i=n()){let r=!1;for(;i==="@";)if(/^(vertex|fragment|compute)$/.test(n())&&(r=!0),i=n(),i==="("){if(!ZT(n))return e;i=n()}if(i==="fn"){let s=n();i=n(),r&&i==="("&&s&&ru.test(s)&&e.push(s)}KT(n,i)}return e}var ru=/[_\p{XID_Start}]\p{XIDC}*/uy;function YT(t){let e=0;return()=>{for(;e<t.length;){let n=e;if(/\p{Pat_WS}/u.test(t[n])){e++;continue}if(t.startsWith("//",n)){for(;e<t.length&&!/[\n-\r\u0085\u2028\u2029]/.test(t[e]);)e++;continue}if(t.startsWith("/*",n)){e+=2;let r=1;for(;e<t.length&&r>0;)t.startsWith("/*",e)?(r++,e+=2):t.startsWith("*/",e)?(r--,e+=2):e++;continue}ru.lastIndex=n;let i=ru.exec(t);return i?(e=ru.lastIndex,i[0]):(e++,t[n])}}}function ZT(t){let e=1;for(let n=t();n!==void 0;n=t())if(n==="(")e++;else if(n===")"&&--e===0)return!0;return!1}function KT(t,e){let n=0;for(let i=e;i!==void 0;i=t())if(i==="{")n++;else{if(i==="}"&&n>0&&--n===0)return;if(i===";"&&n===0)return}}function JT(t){let e=t.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"").trimStart();return e.startsWith("import ")||e.startsWith("import{")}function QT(){let t=new Error("Runtime WGSL strings cannot contain import statements. Use a build-time loader or @vgpu/wgsl/runtime.");return t.name="VGPUWGSLRuntimeImportError",t.code="VGPU-WGSL-RUNTIME-IMPORT",t.severity="error",t.source="wgsl",t}function jT(t,e){let n=2**e;return[Math.max(1,Math.floor(t.width/n)),Math.max(1,Math.floor(t.height/n)),t.dimension==="3d"?Math.max(1,Math.floor(t.depthOrArrayLayers/n)):t.depthOrArrayLayers]}function su(t,e,n){let i=o=>{throw new Ae({code:"VGPU-CORE-TEXTURE-READ-INVALID",where:n,message:o,fix:'Select an allocated mip and an in-bounds region on a single-sample texture with usage "copy_src".'})};(!e||!Number.isSafeInteger(e.mipLevel)||e.mipLevel<0||e.mipLevel>=t.mipLevelCount)&&i("mipLevel must select an allocated mip using a nonnegative safe integer."),t.sampleCount!==1&&i("Texture readback requires sampleCount 1; resolve multisampled textures explicitly before reading."),t.usage&eu(["copy_src"])||i('Texture readback requires explicit "copy_src" usage.');let r=jT(t,e.mipLevel),s=e.region==="all"?[0,0,0]:e.region?.origin,a=e.region==="all"?r:e.region?.size;(!Array.isArray(s)||s.length!==3||!Array.isArray(a)||a.length!==3)&&i('region must be "all" or contain origin and size triples.');for(let o=0;o<3;o++){let l=s[o],c=a[o];(!Number.isSafeInteger(l)||l<0||!Number.isSafeInteger(c)||c<=0||l>r[o]||c>r[o]-l)&&i(`Read region axis ${o} is outside mip ${e.mipLevel} extent [${r}].`)}return{mipLevel:e.mipLevel,origin:[...s],size:[...a],extent:r}}function au(t,e,n){let i=Math.min(e??4294967295,4294967295);if(!Number.isSafeInteger(t)||t<=0||t>i)throw new Ae({code:"VGPU-CORE-TEXTURE-READ-INVALID",where:n,message:`Readback allocation of ${t} bytes exceeds the supported limit (${i}).`,fix:"Read a smaller region or a higher mip level."})}var nS=xi(["copy_dst","map_read"]),ou=class{device;constructor(e){this.device=e}async read(e,n,i){if(tu(e))return e.__vgpuMockBytes.slice(i,i+n).buffer;let r=this.device.createBuffer({size:n,usage:nS});try{let s=this.device.createCommandEncoder();s.copyBufferToBuffer(e,i,r,0,n),this.device.queue.submit([s.finish()]),await r.mapAsync(Ap());let a=r.getMappedRange().slice(0);return iS(r),a}finally{rS(r)}}async readTexture(e,n){let i=lu(e.format,"Readback.readTexture"),r=su(e,n,"Readback.readTexture"),[s,a,o]=r.size,l=i.bytesPerPixel,c=eA(s*l,256),u=c*a*o;if(au(u,this.device.limits?.maxBufferSize,"Readback.readTexture"),nu(e)){let h=e.__vgpuMockMips?.[r.mipLevel]??(r.mipLevel===0?e.__vgpuMockBytes:void 0);if(!h)throw new Error("Mock texture has no storage for the selected mip.");return nA(h,r,i)}let f=this.device.createBuffer({size:u,usage:nS}),d;try{let h=this.device.createCommandEncoder();h.copyTextureToBuffer({texture:e,mipLevel:r.mipLevel,origin:r.origin},{buffer:f,bytesPerRow:c,rowsPerImage:a},{width:s,height:a,depthOrArrayLayers:o}),this.device.queue.submit([h.finish()]),await f.mapAsync(Ap());let p=new Uint8Array(f.getMappedRange());d=new Uint8Array(s*a*o*l);for(let x=0;x<a*o;x++){let b=x*c,g=x*s*l;d.set(p.subarray(b,b+s*l),g)}iS(f)}finally{rS(f)}return i.swizzle==="bgra-to-rgba"&&oS(d),d}destroy(){}};function iS(t){try{t.unmap()}catch{}}function rS(t){try{t.destroy()}catch{}}function eA(t,e){return Math.ceil(t/e)*e}var sS={r8unorm:{bytesPerPixel:1,components:1,componentType:"unorm8"},rg8unorm:{bytesPerPixel:2,components:2,componentType:"unorm8"},rgba8unorm:{bytesPerPixel:4,components:4,componentType:"unorm8"},"rgba8unorm-srgb":{bytesPerPixel:4,components:4,componentType:"unorm8"},bgra8unorm:{bytesPerPixel:4,components:4,componentType:"unorm8",swizzle:"bgra-to-rgba"},"bgra8unorm-srgb":{bytesPerPixel:4,components:4,componentType:"unorm8",swizzle:"bgra-to-rgba"},r16float:{bytesPerPixel:2,components:1,componentType:"float16"},rg16float:{bytesPerPixel:4,components:2,componentType:"float16"},rgba16float:{bytesPerPixel:8,components:4,componentType:"float16"},r32float:{bytesPerPixel:4,components:1,componentType:"float32"},rg32float:{bytesPerPixel:8,components:2,componentType:"float32"},rgba32float:{bytesPerPixel:16,components:4,componentType:"float32"}};function lu(t,e){let n=sS[t];if(n)return n;throw new Ae({code:"VGPU-CORE-UNSUPPORTED-FORMAT",message:`Texture.read does not support format ${t}. Supported formats: ${Object.keys(sS).join(", ")}.`,where:e})}function aS(t,e,n="Texture.readFloats"){let i=lu(e,n),r=i.bytesPerPixel/i.components,s=Math.floor(t.byteLength/r),a=new Float32Array(s),o=new DataView(t.buffer,t.byteOffset,t.byteLength);for(let l=0;l<s;l++)i.componentType==="unorm8"?a[l]=o.getUint8(l)/255:i.componentType==="float16"?a[l]=tA(o.getUint16(l*2,!0)):a[l]=o.getFloat32(l*4,!0);return a}function tA(t){let e=t&32768?-1:1,n=t>>10&31,i=t&1023;return n===0?e*i*2**-24:n===31?i===0?e*Number.POSITIVE_INFINITY:Number.NaN:e*(i+1024)*2**(n-25)}function nA(t,e,n){let{size:[i,r,s],origin:[a,o,l],extent:c}=e,u=i*n.bytesPerPixel,f=new Uint8Array(u*r*s);for(let d=0;d<s;d++)for(let h=0;h<r;h++){let p=(((l+d)*c[1]+o+h)*c[0]+a)*n.bytesPerPixel;f.set(t.subarray(p,p+u),(d*r+h)*u)}return n.swizzle==="bgra-to-rgba"&&oS(f),f}function oS(t){for(let e=0;e<t.length;e+=4){let n=t[e];t[e]=t[e+2],t[e+2]=n}}function lS(t){return{size:t,usage:xi(["copy_src","copy_dst"])}}var cu=class{gpu;guard;constructor(e,n=()=>{}){this.gpu=e,this.guard=n}writeBuffer(e,n,i){this.guard("Queue.writeBuffer"),this.gpu.writeBuffer(e,n,i)}async flush(){this.guard("Queue.flush"),await this.gpu.onSubmittedWorkDone?.(),this.guard("Queue.flush")}};var uu=class{gpu;resolved;constructor(e,n){this.gpu=e,this.resolved=n}dispose(){}get kind(){return this.resolved.kind}get source(){return this.resolved.source}get code(){return this.resolved.wgsl}get entryPoints(){return this.resolved.entryPoints}get stats(){return this.resolved.stats}};var iA=new Set(["copy_src","copy_dst","texture_binding","storage_binding","render_attachment"]),rA=new Set(["rgba8unorm","rgba8snorm","rgba8uint","rgba8sint","rgba16float","rgba16uint","rgba16sint","rgba32float","rgba32uint","rgba32sint","r32float","r32uint","r32sint","rg32float","rg32uint","rg32sint"]),sA=new Set(["r8unorm","r8snorm","r8uint","r8sint","rg8unorm","rg8snorm","rg8uint","rg8sint","r16uint","r16sint","r16float","rg16uint","rg16sint","rg16float","rgb10a2uint","rgb10a2unorm","rg11b10ufloat","r16unorm","r16snorm","rg16unorm","rg16snorm","rgba16unorm","rgba16snorm"]);function fu(t){return Object.freeze({...t,size:Object.freeze([...t.size]),usage:Object.freeze([...t.usage]),...t.viewFormats===void 0?{}:{viewFormats:Object.freeze([...t.viewFormats])}})}function Dp(t){return[t.size[0],t.kind==="1d"?1:t.size[1],t.kind==="2d-array"?t.layers:t.kind==="3d"?t.size[2]:1]}function cS(t,e){let n=(f,d,h)=>{throw new Ae({code:f,message:d,fix:h,where:"Device.createTexture"})};(!t||!["1d","2d","3d","2d-array"].includes(t.kind))&&n("VGPU-TEXTURE-KIND-REQUIRED","Texture kind must be explicit.",'Pass kind: "1d", "2d", "3d", or "2d-array".'),"dimension"in t&&n("VGPU-TEXTURE-KIND-REQUIRED","Texture dimension has been replaced by kind.",'Use kind and, for "2d-array", a separate layers count.');let i=t.kind==="1d"?1:t.kind==="3d"?3:2;(!Array.isArray(t.size)||t.size.length!==i||!Array.from(t.size).every(Rp))&&n("VGPU-TEXTURE-SIZE-REQUIRED",`Texture ${t.kind} needs ${i} positive integer spatial dimensions.`,"Pass size with exactly the spatial dimensions of kind; put array layers in layers."),(t.kind==="2d-array"?!Rp(t.layers):t.layers!==void 0)&&n("VGPU-TEXTURE-LAYERS-INVALID","Only 2d-array textures take a positive integer layers count.",'Use kind: "2d-array", size: [width, height], layers: count.'),(!Array.isArray(t.usage)||t.usage.length===0||!Array.from(t.usage).every(f=>iA.has(f)))&&n("VGPU-TEXTURE-USAGE-REQUIRED","Texture usage must be a nonempty list of known capabilities.",'Pass explicit usage, such as ["texture_binding", "copy_dst"]. No capabilities are added automatically.'),(typeof t.format!="string"||!t.format)&&n("VGPU-TEXTURE-FORMAT-REQUIRED","Texture format is required.",'Pass an explicit GPUTextureFormat, such as "rgba16float".');let r=t.mipLevelCount??1,s=t.kind==="1d"?1:Math.floor(Math.log2(Math.max(...t.size)))+1;(!Rp(r)||r>s)&&n("VGPU-TEXTURE-MIPS-INVALID",`mipLevelCount must be between 1 and ${s}.`,"Omit mipLevelCount for the base level, or request a valid allocation count. Contents are not generated automatically.");let a=t.sampleCount??1;a!==1&&a!==4&&n("VGPU-TEXTURE-SAMPLES-INVALID","sampleCount must be 1 or 4.","Omit sampleCount for single-sample storage."),a===4&&(t.kind!=="2d"||r!==1||!t.usage.includes("render_attachment")||t.usage.includes("storage_binding"))&&n("VGPU-TEXTURE-SAMPLES-INVALID","MSAA requires a 2d render attachment with one mip and no storage_binding.","Use a single-sample texture for storage, arrays or volumes; resolve MSAA into a separate texture."),t.kind==="1d"&&(t.usage.includes("render_attachment")||/^(depth|stencil|bc|etc2|eac|astc)/.test(t.format))&&n("VGPU-TEXTURE-KIND-INVALID","1d textures cannot be render attachments or use depth/stencil/compressed formats.","Use a 2d texture or a plain color format with non-attachment usage.");let o=Dp(t),l=t.kind==="1d"?"maxTextureDimension1D":t.kind==="3d"?"maxTextureDimension3D":"maxTextureDimension2D",c=e.limits?.[l];(c!==void 0&&t.size.some(f=>f>c)||t.kind==="2d-array"&&e.limits?.maxTextureArrayLayers!==void 0&&o[2]>e.limits.maxTextureArrayLayers)&&n("VGPU-TEXTURE-LIMIT","Texture dimensions or layers exceed enabled device limits.","Reduce the allocation or request sufficient limits when initializing the device.");let u=f=>e.features?.has(f)??!1;t.usage.includes("storage_binding")&&!rA.has(t.format)&&!(t.format==="bgra8unorm"&&u("bgra8unorm-storage"))&&!(sA.has(t.format)&&u("texture-formats-tier1"))&&n("VGPU-TEXTURE-STORAGE-FORMAT",`Format ${t.format} does not support storage_binding with the enabled features.`,"Choose a supported storage format, enable the required format feature, or explicitly omit storage_binding from usage."),t.viewFormats!==void 0&&(!Array.isArray(t.viewFormats)||!Array.from(t.viewFormats).every(f=>typeof f=="string"&&f.replace(/-srgb$/,"")===t.format.replace(/-srgb$/,"")))&&n("VGPU-TEXTURE-VIEW-FORMAT","viewFormats must list formats compatible with the texture format.","Only the same format or its compatible linear/sRGB counterpart is allowed; native device restrictions also apply.")}function Rp(t){return typeof t=="number"&&Number.isSafeInteger(t)&&t>0}var aA=Symbol.for("vgpu/Texture"),Ft=class{device;ownership;[aA]=!0;destroySignal=new Cn;identity=vi("texture");currentGpu;currentOptions;defaultView=null;destroyed=!1;constructor(e,n,i,r="owned"){this.device=e,this.ownership=r,this.currentGpu=n,this.currentOptions=fu(i)}get gpu(){return this.currentGpu}get options(){return this.currentOptions}get size(){return this.options.size}get format(){return this.options.format}get usage(){return this.options.usage}get mipLevelCount(){return this.options.mipLevelCount??1}get sampleCount(){return this.options.sampleCount??1}get kind(){return this.options.kind}get layers(){return this.options.kind==="2d-array"?this.options.layers:1}get dimension(){return this.options.kind==="2d-array"?"2d":this.options.kind}get viewFormats(){return this.options.viewFormats??[]}get label(){return this.options.label}get resourceIdentity(){return this.identity}onDestroy(e){return this.destroySignal.onDestroy(this,e)}get view(){return this.assertAlive(),this.defaultView??=this.createView(),this.defaultView}createView(e){return this.assertAlive("Texture.createView"),this.gpu.createView(this.kind==="2d-array"?{...e,dimension:e?.dimension??"2d-array"}:e)}async read(e){this.assertAlive("Texture.read");let n=await this.device.readback.readTexture(this.gpu,e);return this.assertAlive("Texture.read"),n}async readFloats(e){this.assertAlive("Texture.readFloats");let n=lu(this.options.format,"Texture.readFloats"),{size:i}=su(this.gpu,e,"Texture.readFloats");return au(i[0]*i[1]*i[2]*n.components*4,this.device.gpu.limits?.maxBufferSize,"Texture.readFloats"),aS(await this.read(e),this.options.format)}destroy(){if(!this.destroyed){this.destroyed=!0,this.defaultView=null;try{this.destroySignal.emit(this)}finally{this.ownership!=="external"&&!nu(this.gpu)&&this.gpu.destroy()}}}dispose(){this.destroy()}assertAlive(e="Texture"){if(this.destroyed)throw new Ae({code:"VGPU-CORE-TEXTURE-DESTROYED",message:"Texture is destroyed",where:e});this.device.assertUsable?.(e)}};function uS(t){let[e,n,i]=Dp(t),r={label:t.label,size:{width:e,height:n,depthOrArrayLayers:i},dimension:t.kind==="2d-array"?"2d":t.kind,format:t.format,usage:eu(t.usage)};return t.mipLevelCount!==void 0&&(r.mipLevelCount=t.mipLevelCount),t.sampleCount!==void 0&&(r.sampleCount=t.sampleCount),t.viewFormats!==void 0&&(r.viewFormats=[...t.viewFormats]),t.kind==="2d-array"&&(r.textureBindingViewDimension="2d-array"),r}var No=class{gpu;adapterInfo;queue;readback;isCompatibilityMode;scopes=[];ownership;state="alive";lossInfo;observeLoss=!0;lossObservers=new Set;constructor(e,n=null,i="owned",r={}){this.gpu=e,this.adapterInfo=n,Object.defineProperty(this,"assertUsable",{value:o=>this.#e(o)}),Object.defineProperty(this,"onObservedLoss",{value:o=>this.state==="lost"&&this.lossInfo?(o(this.lossInfo),()=>{}):!this.observeLoss||this.state!=="alive"?()=>{}:(this.lossObservers.add(o),()=>{this.lossObservers.delete(o)})}),this.ownership=typeof i=="string"?i:"owned";let s=typeof i=="string"?r:i;this.isCompatibilityMode=s.isCompatibilityMode??!1,this.queue=new cu(e.queue,o=>this.#e(o)),this.readback=new ou(e);let a=e.lost;a&&typeof a.then=="function"&&Promise.resolve(a).then(o=>{if(!this.observeLoss||this.state!=="alive")return;this.lossInfo=o,this.state="lost";let l=[...this.lossObservers];this.lossObservers.clear();for(let c of l)try{c(o)}catch{}},()=>{})}get limits(){return this.#e("Device.limits"),this.gpu.limits}get features(){return this.#e("Device.features"),this.gpu.features}createShader(e){this.#e("Device.createShader");let n=typeof e=="string"?Cp(e):e;return new uu(this.gpu.createShaderModule({code:n.wgsl}),n)}createTexture(e){this.#e("Device.createTexture"),cS(e,this.gpu);let n=fu(e);return new Ft(this,this.gpu.createTexture(uS(n)),n)}createBuffer(e){this.#e("Device.createBuffer");let n=oA(e);n&&this.captureError(n);let i=n?lS(Math.max(4,e.size||4)):lA(e);return new yt(this,this.gpu.createBuffer(i),e)}wrapBuffer(e){if(this.#e("Device.wrapBuffer"),!uA(e))throw new Ae({code:"VGPU-EXTERNAL-BUFFER-INVALID",message:"Device.wrapBuffer requires a GPUBuffer with finite size and usage properties.",where:"Device.wrapBuffer",fix:"Pass a live GPUBuffer created for this GPUDevice."});let n={size:e.size,usage:dA(e.usage),...e.label?{label:e.label}:{}};return new yt(this,e,n,"external")}pushErrorScope(e){this.#e("Device.pushErrorScope"),this.scopes.push([]),this.gpu.pushErrorScope?.(e)}async popErrorScope(){this.#e("Device.popErrorScope");let e=this.scopes.pop(),n=await this.gpu.popErrorScope?.();return this.#e("Device.popErrorScope"),e?.[0]??cA(n)??null}#e(e){if(this.state==="alive")return;if(this.state==="disposed")throw new Ae({code:"VGPU-DEVICE-DISPOSED",message:"The GPU device wrapper has been disposed.",where:e,fix:"Create a new Gpu instance before performing more work."});let n=this.lossInfo?.reason,i=this.lossInfo?.message;throw new Ae({code:"VGPU-DEVICE-LOST",message:`The GPU device was lost${n?` (${n})`:""}${i?`: ${i}`:"."}`,where:e,cause:this.lossInfo,fix:"Create a new Gpu with init(), then recreate its resources and restart the loop."})}destroy(){if(this.state==="disposed")return;let e=this.state==="lost";this.state="disposed",this.observeLoss=!1,this.lossObservers.clear(),this.scopes.length=0,this.readback.destroy(),this.ownership==="owned"&&!e&&this.gpu.destroy()}dispose(){this.destroy()}captureError(e){let n=this.scopes.at(-1);if(n)n.push(e);else throw e}};function oA(t){return!Number.isFinite(t.size)||t.size<=0?fS("Buffer size must be greater than zero."):t.usage.length===0?fS("Buffer usage must not be empty."):null}function fS(t){return new Ae({code:"VGPU-CORE-INVALID-USAGE",message:t,where:"Device.createBuffer"})}function lA(t){return{label:t.label,size:t.size,usage:xi(t.usage)}}function cA(t){return t?new Ae({code:"VGPU-CORE-VALIDATION",message:t.message,where:"GPUDevice.popErrorScope",cause:t}):null}function uA(t){if(typeof t!="object"&&typeof t!="function"||t===null)return!1;let e=t;return Number.isSafeInteger(e.size)&&(e.size??-1)>=0&&Number.isSafeInteger(e.usage)&&(e.usage??-1)>=0&&typeof e.destroy=="function"}var fA=["map_read","map_write","copy_src","copy_dst","index","vertex","uniform","storage","indirect","query_resolve"];function dA(t){return fA.filter(e=>(t&xi([e]))!==0)}var dS=new WeakMap,hA=new WeakMap;function Up(t,e){return dS.set(t,pA(e)),t}function Qr(t){return dS.get(t)}function du(t){return hA.get(t)}function pA(t){return{entries:t.entries.map(e=>({...e}))}}var C=class extends Jr{};function hS(t,e){return new C({code:"VGPU-SURFACE-NOT-BINDABLE",message:`Binding '${e.name}' (@group(${e.group}) @binding(${e.binding})) in '${t}' cannot use a Surface as an input.`,where:`${t}.${e.name}`,fix:"Render to an offscreen target and bind that target or its texture. Use Surface only as a render destination.",detail:{binding:e.binding,bindingName:e.name}})}function Po(t,e,n="resource"){return new C({code:"VGPU-R1-BINDING-DESTROYED",message:`Binding '${e.name}' (@group(${e.group}) @binding(${e.binding})) in '${t}' refers to destroyed resource '${n}'.`,where:`${t}.${e.name}`,fix:`Create a live resource and call set({ ${e.name}: replacement }). Direct attachment references do not follow target.resize(); bind the Target itself to follow replacements. Re-record bundles that captured the old resource.`,detail:{binding:e.binding,bindingName:e.name,resourceName:n}})}function pS(t,e,n,i,r,s){let a=e==="vertex"?"Vertex":"Fragment",o=e==="vertex"?"VERTEX":"FRAGMENT",l=`maxStorageBuffersIn${a}Stage`;return new C({code:`VGPU-LIMIT-STORAGE-${o}`,message:`${a} entry '${n}' in '${t}' uses ${i} storage buffer(s), but device limit ${l} is ${r}.`,fix:e==="vertex"?`Request init({ requiredLimits: { ${l}: ${i} } }) if the adapter supports it, or move vertex data to geometry(gpu, ...) vertex streams.`:`Request init({ requiredLimits: { ${l}: ${i} } }) if the adapter supports it, or reduce fragment storage buffers.`,where:`${t}.pipelineLayout`,detail:{stage:e,entryPoint:n,count:i,limit:r,bindings:s.map(({name:c,group:u,binding:f})=>({name:c,group:u,binding:f}))}})}function mS(t,e,n,i,r){return new C({code:"VGPU-SET-TEXTURE-FILTERABILITY",message:`${i} (${n}) cannot satisfy filtering texture '${e.name}' @group(${e.group}) @binding(${e.binding}).`,fix:"Use a filterable format; request float32-filterable for rgba32float when supported; or use textureLoad without a sampler.",where:`${t}.set`,detail:{format:n,group:e.group,binding:e.binding,bindingName:e.name,resourceName:i,samplerName:r?.name,samplerGroup:r?.group,samplerBinding:r?.binding}})}function gS(t,e){let n=gA(t,e);return new C({code:"VGPU-R1-BINDING-NEVER-SET",message:`Unset \`${e.name}\` @group(${e.group}) @binding(${e.binding}) in '${t}'. Fix: ${n}; or ${t}.group(${e.group}, bindGroup).`,where:`${t}.draw`})}function Lp(t,e){let n=e==="lib"?"lib-owned by its first JS set()":"user-owned by its first resource set()",i=e==="lib"?`Fix: pass a resource from the start: wave.set({ ${t}: new Uniform(gpu.device, { size: 4 }) }).`:`Fix: pass JS values from the first set(): wave.set({ ${t}: jsValue }).`;return new C({code:"VGPU-R1-OWNERSHIP-FLIP",message:`\`${t}\` is ${n}; ownership cannot change. ${i}`,where:"set"})}function yS(t,e){return new C({code:"VGPU-R4-GROUP-CLAIMED",message:`group ${e} of '${t}' is claimed; set() cannot update it.`,fix:`Call set() first, or build from ${t}.layout(${e}); pass dynamic offsets to p.draw().`,where:`${t}.set`})}function xS(t,e,n,i){return new C({code:"VGPU-R4-GROUP-INCOMPATIBLE",message:`claimed group ${e} in '${t}' is incompatible: ${n}.`,fix:`Build from ${t}.layout(${e}, { dynamicOffsets? }) then call ${t}.group(${e}, bindGroup).`,where:`${t}.group`,cause:i})}function Gn(t,e,n){return new C({code:"VGPU-R4-GROUP-VALIDATION",message:`WebGPU rejected claimed group ${e} in '${t}'.`,fix:`Build from ${t}.layout(${e}); pass offsets via p.draw(draw, { offsets: { ${e}: [...] } }).`,where:`${t}.draw`,cause:n,detail:{drawLabel:t,group:e}})}function Ip(t,e){return new C({code:"VGPU-BLEND-INVALID",message:`Invalid blend '${String(e)}' in '${t}'.`,fix:'Use "alpha", "additive", "premultiplied", or { color, alpha? } components.',where:"draw"})}function Np(t,e){return new C({code:"VGPU-BLEND-CONSTANT-INVALID",message:`Invalid blendConstant in '${t}': ${e}`,fix:'Use [r, g, b, a] finite numbers with a blend whose color or alpha uses "constant"/"one-minus-constant"; omit it to keep the pass default (0, 0, 0, 0).',where:"draw"})}function Pp(t,e){return new C({code:"VGPU-DRAW-DISPOSED",message:`Draw '${t}' has been disposed.`,where:`${t}.${e}`,fix:"Create a new draw(gpu, ...) or effect(gpu, ...); disposed render units cannot be reused.",detail:{label:t}})}function Op(t,e){return new C({code:"VGPU-WRITEMASK-INVALID",message:`Invalid writeMask ${e} in '${t}'.`,fix:"Use an array of r/g/b/a; omit it for all channels.",where:"draw"})}function hu(t,e,n="draw"){return new C({code:"VGPU-COLORS-INVALID",message:`Invalid colors in '${t}': ${e}`,fix:"Use one { blend?, writeMask? } or null entry per color attachment of the target, aligned by index; omit colors to apply the top-level blend/writeMask to every attachment.",where:n})}function vS(t,e){return new C({code:"VGPU-CULL-INVALID",message:`Invalid cull '${String(e)}' in '${t}'.`,fix:'Use "none", "front", or "back"; omit it for no culling.',where:"draw"})}function _S(t,e){return new C({code:"VGPU-FRONTFACE-INVALID",message:`Invalid frontFace '${String(e)}' in '${t}'.`,fix:'Use "ccw" or "cw"; omit it for counter-clockwise.',where:"draw"})}function Bp(t,e){return new C({code:"VGPU-UNCLIPPED-DEPTH-INVALID",message:`Invalid unclippedDepth in '${t}': ${e}`,fix:'Use a boolean. unclippedDepth: true needs the "depth-clip-control" device feature \u2014 request it with init({ requiredFeatures: ["depth-clip-control"] }) on an adapter that supports it. Omit the option to keep depth clipping.',where:"draw"})}function kn(t,e){return new C({code:"VGPU-DEPTH-INVALID",message:`Invalid depth in '${t}': ${e}`,fix:'Use false or { write?, compare?, bias?, biasSlopeScale?, biasClamp? }; omit it for { write: true, compare: "less-equal" }.',where:"draw"})}function jr(t,e,n="draw"){return new C({code:"VGPU-STENCIL-INVALID",message:`Invalid stencil in '${t}': ${e}`,fix:`Use { front?, back?, readMask?, writeMask?, ref? } with GPUCompareFunction/GPUStencilOperation faces and u32 masks, against a target whose depth format has a stencil aspect (depth: "depth24plus-stencil8"); omit it for WebGPU's pass-through defaults.`,where:n})}function Oo(t,e,n="draw"){return new C({code:"VGPU-MULTISAMPLE-INVALID",message:`Invalid multisample in '${t}': ${e}`,fix:"Use { alphaToCoverage?, mask? }: alphaToCoverage needs a target created with msaa: true, and mask must be an integer in [0, 0xFFFFFFFF] (bits above the target's sampleCount are ignored). Omit multisample for full-coverage defaults.",where:n})}function Bo(t,e,n="draw"){return new C({code:"VGPU-CONSTANTS-INVALID",message:`Invalid constants in '${t}': ${e}`,fix:"Key WGSL `override` constants by name, or by the decimal string of N when the declaration has @id(N); values are finite numbers or booleans, converted to the override's WGSL type (bool/i32/u32/f32/f16). Every override without a default value must be provided. Omit constants to keep the WGSL defaults.",where:n})}function rr(t,e,n="draw"){return new C({code:"VGPU-ENTRY-INVALID",message:`Invalid entry in '${t}': ${e}`,fix:"Use a matching stage name: draw { vertex?, fragment? }, effect { fragment? }, compute string. Defaults prefer vs_main/fs_main/cs_main, otherwise first-in-stage.",where:n})}function sr(t,e,n){return new C({code:"VGPU-INDIRECT-INVALID",message:`Invalid indirect in '${t}': ${e}`,fix:"Pass a storage buffer created with storage(gpu, bytes, { indirect: true }) \u2014 bare, or as { buffer, offset? } with a 4-aligned byte offset \u2014 sized so the GPU-read arguments fit: 16 bytes for drawIndirect, 20 for drawIndexedIndirect, 12 for dispatchWorkgroupsIndirect. Omit indirect to use CPU-side counts.",where:n})}function SS(){return new C({code:"VGPU-PASS-PRESERVE-MSAA",message:"clear:false cannot preserve MSAA; use a non-MSAA target.",fix:"Use non-MSAA for accumulation.",where:"Frame.pass"})}function Fp(t,e="expected a number in [0, 1].",n='Use 1 (default), or 0 with depth: { compare: "greater" } for reversed-Z.'){return new C({code:"VGPU-PASS-CLEARDEPTH-INVALID",message:`clearDepth received ${String(t)}; ${e}`,fix:n,where:"Frame.pass"})}function Hn(t){return new C({code:"VGPU-PASS-VIEWPORT-INVALID",message:`Invalid viewport: ${t}`,fix:"Use { x?, y?, width, height, minDepth?, maxDepth? } finite numbers within device limits; omit it for the full target.",where:"Frame.pass"})}function pu(t){return new C({code:"VGPU-PASS-SCISSOR-INVALID",message:`Invalid scissor: ${t}`,fix:"Use [x, y, width, height] non-negative integers with x + width and y + height within the target's current pixel size; omit it for the full target.",where:"Frame.pass"})}function bS(){return new C({code:"VGPU-PASS-PRESERVE-CLEARDEPTH",message:"clear:false preserves depth; clearDepth cannot apply.",fix:"Remove clearDepth, or let the pass clear.",where:"Frame.pass"})}function zp(t){return new C({code:"VGPU-PASS-CLEARSTENCIL-INVALID",message:`clearStencil ${t}`,fix:`Use an integer in [0, 0xFFFFFFFF] on a target whose depth format has a stencil aspect, e.g. depth: "depth24plus-stencil8"; the value is masked to the stencil aspect's bit width.`,where:"Frame.pass"})}function MS(){return new C({code:"VGPU-PASS-PRESERVE-CLEARSTENCIL",message:"clear:false preserves stencil; clearStencil cannot apply.",fix:"Remove clearStencil, or let the pass clear.",where:"Frame.pass"})}function ar(t,e,n="Frame.pass"){return new C({code:"VGPU-PASS-DEPTH-READONLY",message:`depthReadOnly ${t}`,fix:e,where:n})}function wS(){return new C({code:"VGPU-PASS-DEPTH-READONLY-MSAA",message:`depthReadOnly cannot read an MSAA target's depth: multisampled depth is stored with storeOp "discard", so a read-only pass tests against discarded contents.`,fix:"Use a non-MSAA target for read-only depth, or drop depthReadOnly and let the pass own its depth.",where:"Frame.pass"})}function ES(t,e,n="timer"){return new C({code:"VGPU-TIMER-INVALID",message:`Invalid timer use: ${t}`,fix:e,where:n})}function TS(t,e,n="visibility"){return new C({code:"VGPU-VIS-INVALID",message:`Invalid visibility use: ${t}`,fix:e,where:n})}function AS(){return new C({code:"VGPU-QUERY-NO-VISIBILITY",message:"occlusion() needs the pass to be opened with a visibility instance; the render pass has no occlusionQuerySet to write into.",fix:"Open the pass with f.pass({ target, visibility: vis }, ...) using the visibility(gpu) instance that created the query handle.",where:"FramePass.occlusion"})}function CS(){return new C({code:"VGPU-QUERY-NESTED",message:"occlusion() cannot nest inside an active occlusion() body; WebGPU allows one active occlusion query per pass at a time.",fix:"Encode each occlusion scope sequentially: p.occlusion(a, ...); p.occlusion(b, ...).",where:"FramePass.occlusion"})}function Fo(t="Frame.pass"){return new C({code:"VGPU-TARGET-REQUIRED",message:"Target required. Fix: pass surface(gpu, canvas) or target(gpu, { size }) as { target }.",where:t})}function mA(t,e,n,i){return new C({code:t,message:`${t}: ${n}`,fix:i,where:e})}function mu(t,e){return mA("VGPU-MESH-RANGE-INVALID",t,e,"Use index ranges for indexed geometries, vertex ranges otherwise, within geometry counts.")}function RS(t){return new C({code:"VGPU-PIPELINE-LAYOUT-GAP",message:`Pipeline bind group ${t} is missing.`,fix:"Use consecutive @group() indices starting at 0.",where:"pipeline layout"})}function es(t,e,n){return new C({code:"VGPU-COMPILE-FAILED",message:"WebGPU pipeline compilation failed.",fix:"Check WGSL, pipeline bindings, device limits, and render target/vertex layouts when applicable.",where:t,cause:e,detail:n?{signature:n}:void 0})}function Vp(t){return new C({code:"VGPU-COMPILE-DISPOSED",message:"GPU disposed during pipeline compilation.",where:t})}function zo(t,e){return new C({code:"VGPU-COMPILE-SIGNATURE-INVALID",message:`Invalid TargetSignature: ${e}`,fix:"Pass { colors, depth?, sampleCount?:1|4 } or a Target.",where:t})}function DS(t){return new C({code:"VGPU-TARGET-DEPTH-STENCIL-ONLY",message:`depth received '${t}'; stencil-only depth targets are not supported yet.`,fix:'Use a format with a depth aspect such as "depth24plus" or "depth24plus-stencil8".',where:"target"})}function Gp(){return new C({code:"VGPU-TARGET-SIZE-REQUIRED",message:"Target size required. Fix: target(gpu, { size: [w,h] }); update surface-derived targets in onResize.",where:"target"})}function gu(t){return new C({code:"VGPU-SURFACE-NOT-IN-FRAME",message:"Surface targets are only available inside frame(gpu).",fix:"Encode surface draws inside frame(gpu, ...); compile(surface) and bundle(gpu, { target: surface }, ...) can prepare outside a frame.",where:t})}function US(t){return new C({code:"VGPU-SURFACE-DEPTH-INVALID",message:"Surface depth must be false, true, or a depth-aspect texture format.",fix:'Use depth: true, a depth-aspect format such as "depth24plus", or omit depth.',where:"surface",detail:{actual:typeof t=="string"||typeof t=="number"?t:void 0,type:typeof t}})}function LS(t){return new C({code:"VGPU-SURFACE-MSAA-INVALID",message:"Surface msaa must be false, true, or 4.",fix:"Use msaa: false for one sample, msaa: true or msaa: 4 for four samples, or omit msaa.",where:"surface",detail:{actual:typeof t=="string"||typeof t=="number"?t:void 0,type:typeof t}})}function IS(){return new C({code:"VGPU-SURFACE-CONTEXT",message:"Canvas WebGPU context failed. Fix: check navigator.gpu and remove any existing 2d/webgl context.",where:"surface"})}function NS(t){return new C({code:"VGPU-SURFACE-DUPLICATE",message:`Canvas already has surface${t?` '${t}'`:""}. Fix: reuse or dispose it.`,where:"surface"})}function PS(t){return new C({code:"VGPU-SURFACE-DISPOSED",message:`Surface '${t??"surface"}' is disposed. Fix: call surface(gpu, canvas).`,where:"surface"})}function OS(){return new C({code:"VGPU-SURFACE-AUTORESIZE-UNSUPPORTED",message:"autoResize needs clientWidth. Fix: call surface.resize([w,h]) for OffscreenCanvas; onResize still fires.",where:"surface"})}function BS(t){return new C({code:"VGPU-SURFACE-RESIZE-REENTRANT",message:`Cannot resize this surface${t?` '${t}'`:""} in onResize. Fix: resize derived targets only.`,where:"surface.resize"})}function FS(t){return new C({code:"VGPU-CLEAR-COLOR-INVALID",message:`Invalid ${t}: expected four finite numbers.`,fix:"Assign [r, g, b, a] or a GPUColor object ({ r, g, b, a }).",where:t})}function zS(t){return new C({code:"VGPU-ASYNC-FRAME-CALLBACK",message:`${t} callbacks must be synchronous.`,where:t,fix:"Await preparation before frame()/frameLoop(); keep the frame callback synchronous."})}function yu(){return new C({code:"VGPU-FRAME-REENTRANT",message:"Nested frame(gpu) is invalid. Fix: queue work for the next frame.",where:"frame"})}function xu(t){return new C({code:"VGPU-FRAME-CANCELED",message:"the frame was canceled; its command encoder was dropped and nothing more can be encoded or submitted on it.",fix:"Open a new frame(gpu) for further work; cancel() is the last operation on a frame.",where:t})}function aa(t){return new C({code:"VGPU-FRAME-PASS-ACTIVE",message:"the frame cannot be canceled while a pass callback is active.",fix:"Return from the frame.pass(...) callback first, then call frame.cancel(); this keeps pass descriptor resources alive until the pass is closed.",where:t})}function vu(t){return new C({code:"VGPU-FRAME-SUBMITTED",message:"the frame was already submitted; submitted GPU work cannot be canceled.",fix:"Call cancel() only on a frame you decided not to submit; the frame you did submit needs no cleanup.",where:t})}function At(t,e,n){return new C({code:"VGPU-R1-BINDING-INCOMPATIBLE-RESOURCE",message:`binding \`${t.name}\` @group(${t.group}) @binding(${t.binding}) needs ${e}.`,fix:n,where:"set"})}function re(t,e,n){return new C({code:"VGPU-RING1-UNSUPPORTED",message:e,fix:n,where:t})}function VS(t,e){return new C({code:"VGPU-SET-VALUE-INVALID",message:`Invalid WGSL value at '${t.path}': ${e}.`,fix:"Pass the exact reflected structure, vector, matrix, and array shapes; use integral in-range values for i32/u32.",where:"set",detail:t})}function kp(){return new C({code:"VGPU-SHADER-SOURCE-UNPREPARED",message:"The renderer requires a prepared ShaderSource v2, but received raw WGSL or a v1 artifact.",fix:"Use a compatible @vgpu/wgsl loader, rebuild shader assets, or call prepareShader() from @vgpu/wgsl/prepare.",where:"shader source"})}function GS(t,e){return new C({code:"VGPU-SHADER-SOURCE-VERSION",message:`ShaderSource version ${t} is unsupported; this runtime supports version 2${e?` (producer: ${e})`:""}.`,fix:"Align the shader producer and vgpu runtime versions, then regenerate the artifact.",where:"shader source",detail:{actual:t,expected:2,reason:e?`producer: ${e}`:void 0}})}function $n(t,e){return new C({code:"VGPU-SHADER-SOURCE-INVALID",message:`Invalid ShaderSource field '${t}': ${e}.`,fix:"Regenerate the shader artifact with a compatible @vgpu/wgsl producer.",where:"shader source",detail:{path:t,reason:e}})}function kS(t){return new C({code:"VGPU-R1-SHARED-UNIFORMS-LAYOUT-MISMATCH",message:`Uniform '${t.bindingName}' layout ${t.adoptedLayout} from ${t.adoptedSource} != ${t.incomingLayout} from ${t.incomingSource}. Fix: align structs or split uniforms.`,where:"uniforms"})}function gA(t,e){switch(e.kind){case"sampler":return`${t}.set({${e.name}:sampler(gpu)})`;case"texture":return`${t}.set({${e.name}:scene.color})`;case"buffer":return e.addressSpace==="uniform"?`${t}.set({${e.name}:{ /* values */ }})`:`${t}.set({${e.name}:buffer})`;default:return`${t}.set({${e.name}:resource})`}}function ye(t,e){t.assertUsable(e)}function HS(t){try{return ye(t,"Device"),!0}catch{return!1}}function or(t,e,n){t.assertUsable(e,n)}function lr(t){try{return t.gpu.queue.onSubmittedWorkDone?.()??Promise.resolve()}catch(e){return Promise.reject(e)}}var $S=["scheduler","resource","service"];function cr(t){return{name:t}}var WS=new WeakMap;function XS(t){let e=WS.get(t);if(!e)throw new C({code:"VGPU-GPU-FOREIGN",message:"This object was not created by init(); it has no vgpu kernel.",fix:"Pass the gpu returned by init() from vgpu, vgpu/node or vgpu/mock.",where:"gpu"});return e}var Hp=class{device;#e=new Map;#t=new Map($S.map(e=>[e,new Set]));#n=new Set;#i=new Set;#r=new Set;#s=new Set;#o;#c;lost;#a=!1;#l;constructor(e){this.device=e;let n;this.lost=new Promise(i=>{n=i}),this.#c=n,this.#o=xA(e,i=>{if(this.#a||this.#l)return;this.#l=i;let r=[...this.#s];this.#s.clear();for(let s of r)try{s()}catch{}this.#c(i)})}get disposed(){return this.#a}service(e,n){let i=this.#e.get(e);if(i!==void 0)return i;let r=n(this);return this.#e.set(e,r),r}peekService(e){return this.#e.get(e)}own(e,n){let i=this.#t.get(e);return i.add(n),()=>{i.delete(n)}}stopOnLoss(e){return this.#l||this.#a?(e(),()=>{}):(this.#s.add(e),()=>{this.#s.delete(e)})}addErrorListener(e){return this.#n.add(e),()=>{this.#n.delete(e)}}reportError(e){if(this.#a)return Promise.resolve();let n=Promise.resolve().then(()=>{let i=[...this.#n];if(!i.length){console.error(e);return}for(let r of i)try{r(e)}catch(s){console.error(s)}});return this.trackDelivery(n)}trackDelivery(e){let n=Promise.resolve(e).then(()=>{},i=>{console.error(i)});return this.#i.add(n),n.finally(()=>this.#i.delete(n)),n}registerSettledSource(e){return this.#r.add(e),()=>{this.#r.delete(e)}}async settled(){let e=!this.#a&&HS(this.device)?lr(this.device):void 0,n=[...this.#r],i=[...this.#i,...n.flatMap(r=>{try{return r()}catch(s){return[Promise.reject(s)]}})];e&&i.push(e),await Promise.allSettled(i)}dispose(){if(!this.#a){this.#a=!0,this.#o();for(let e of $S){let n=this.#t.get(e);for(let i of[...n])i();n.clear()}this.#e.clear(),this.#r.clear(),this.#s.clear(),this.#n.clear(),this.device.dispose()}}};function yA(t){let e=new Hp(t),n={device:t,gpu:t.gpu,lost:e.lost,get disposed(){return e.disposed},onError:i=>e.addErrorListener(i),settled:()=>e.settled(),dispose:()=>{e.dispose()}};return WS.set(n,e),n}function xA(t,e){return t.onObservedLoss(e)}async function $p(t,e={},n){return yA(await vA(t,e,n))}async function vA(t,e,n){if(e.adapter||n)return(e.adapter??n()).requestDevice(e);if(t==="browser")return _A(e);throw re("init",`init(${t}) requires adapterFactory.`)}async function _A(t){let n=await globalThis.navigator.gpu?.requestAdapter({powerPreference:t.powerPreference});if(!n)throw re("init","navigator.gpu.requestAdapter() returned null.");Tp(n.features,t.requiredFeatures);let i=await n.requestDevice({requiredFeatures:t.requiredFeatures,requiredLimits:t.requiredLimits});return new No(i,n.info??null)}var Vo=Symbol("vgpu.bindingResource");function _u(t){return typeof(typeof t=="object"&&t!==null?t[Vo]:void 0)=="function"?t:void 0}var Wp=Symbol("vgpu.surfaceTarget");function qS(t){return typeof t=="object"&&t!==null&&t[Wp]===!0}var Xp=Symbol("vgpu.targetSignature");function Su(t){let e=typeof t=="object"&&t!==null?t[Xp]:void 0;return typeof e=="function"?e.call(t):void 0}var Go=Symbol("vgpu.geometry.layoutResolver"),qp=Symbol("vgpu.geometry.liveness");function YS(t){return typeof(typeof t=="object"&&t!==null?t[qp]:void 0)=="function"?t:void 0}function zt(t,e){let n=XS(t);if(n.disposed)throw SA(e);return ye(n.device,e),n}function SA(t){return new C({code:"VGPU-GPU-DISPOSED",message:`${t}() ran after gpu.dispose(); the device and everything it owned are gone.`,fix:"Create resources before disposing the gpu, or init() a new one.",where:t})}function bu(t,e,n,i){let r=t.own("resource",()=>n(e));return i?.(r),e}var ZS=new WeakMap;function KS(){let t=new WeakMap,e={records:new Map,dependencies:new Map,markerRefs:new Map,markerFinalizer:new FinalizationRegistry(i=>e.markerRefs.delete(i)),finalizer:new FinalizationRegistry(i=>ko(e,i)),nextRecord:1,nextMarker:1,maintenanceVisits:0,targetedVisits:0,disposed:!1},n={destroyEpoch:0,marker(i,r,s){let a=t.get(i);if(a)return a;n.maintain(),a={dependency:r,destroyed:!1},t.set(i,a);let o=e.nextMarker++,l=new WeakRef(a);e.markerRefs.set(o,l),e.markerFinalizer.register(a,o,l);let c=new WeakRef(n);return a.unsubscribe=bA(s,a,o,l,c),a},register(i,r){if(e.disposed||(n.maintain(),r.length===0))return;let s=e.nextRecord++,a={id:s,target:new WeakRef(i),dependencies:[...new Set(r)],token:{}};MA(e,a);for(let o of a.dependencies){let l=e.dependencies.get(o);l||e.dependencies.set(o,l=new Set),l.add(s)}return e.finalizer.register(i,s,a.token),s},unregister(i){i!==void 0&&ko(e,i)},invalidate(i,r){n.maintain();let s=e.dependencies.get(i);if(s)for(let a of[...s]){e.targetedVisits+=1;let o=e.records.get(a);if(!o)continue;let l=o.target.deref();l&&r&&!r(l)||(l&&l.invalidateLifetime(a,i),ko(e,a))}},maintain(){if(e.disposed||e.head===void 0)return;let i=e.cursor??e.head;for(let r=0;r<16&&e.head!==void 0;r+=1){let s=e.records.get(i);if(!s){i=e.head;continue}e.maintenanceVisits+=1;let a=s.next??e.head;if(s.target.deref()||ko(e,i),e.head===void 0)break;i=e.records.has(a)?a:e.head}e.cursor=e.head===void 0?void 0:i},dispose(){if(!e.disposed){e.disposed=!0,n.destroyEpoch++;for(let i of e.markerRefs.values())e.markerFinalizer.unregister(i),i.deref()?.unsubscribe?.();e.markerRefs.clear();for(let i of[...e.records.keys()])ko(e,i);e.dependencies.clear(),e.head=void 0,e.cursor=void 0}}};return ZS.set(n,e),n}function bA(t,e,n,i,r){return t(()=>{if(e.destroyed)return;e.destroyed=!0;let s=r.deref(),a=s&&ZS.get(s);!s||!a||(a.markerFinalizer.unregister(i),a.markerRefs.delete(n),s.destroyEpoch++,s.invalidate(e.dependency))})}function MA(t,e){if(t.head===void 0)e.previous=e.id,e.next=e.id,t.head=e.id,t.cursor=e.id;else{let n=t.records.get(t.head),i=t.records.get(n.previous);e.previous=i.id,e.next=n.id,i.next=e.id,n.previous=e.id}t.records.set(e.id,e)}function ko(t,e){let n=t.records.get(e);if(n){t.finalizer.unregister(n.token);for(let i of n.dependencies){let r=t.dependencies.get(i);r?.delete(e),r?.size===0&&t.dependencies.delete(i)}if(n.next===e)t.head=void 0,t.cursor=void 0;else{let i=t.records.get(n.previous),r=t.records.get(n.next);i&&(i.next=n.next),r&&(r.previous=n.previous),t.head===e&&(t.head=n.next),t.cursor===e&&(t.cursor=n.next)}t.records.delete(e)}}var Eu="uniform-page",wA=64,EA=16,wu=class{cache;shard;group;layout;key;capture;bindGroup;record;used=++Zp;constructor(e,n,i,r,s,a,o){this.cache=e,this.shard=n,this.group=i,this.layout=r,this.key=s,this.capture=a,this.bindGroup=o}invalidateLifetime(){Mu(this.cache,this)}},TA=new WeakMap,Zp=0;function jS(){return Zp}function Tu(){let t={lifetime:KS(),shards:new WeakMap,disposed:!1},e={lifetime:t.lifetime,getOrCreate(n,i,r,s,a,o,l=Kp(s)){let c=t.shards.get(n);c||(c={groups:new Map,lru:new Map,captures:new Map},t.shards.set(n,c));let u=c.groups.get(i);u||c.groups.set(i,u=new Map);let f=u.get(r);f||u.set(r,f=new Map);let d=f.get(l);if(d)return d.used=++Zp,d.bindGroup;let h=s.some(({key:x})=>CA(x)),p=new wu(t,new WeakRef(c),i,r,l,h,o());if(f.set(l,p),c.lru.set(p,!0),p.record=t.lifetime.register(p,a.map(Yp)),h){let x=c.captures.get(i);x||c.captures.set(i,x=new Map),x.set(p,!0),x.size>EA&&Mu(t,QS(x))}return c.lru.size>wA&&Mu(t,QS(c.lru)),p.bindGroup},marker(n,i,r){return t.lifetime.marker(n,Yp(i),r)},evictIdentity(n,i){t.lifetime.invalidate(Yp(n),i===void 0?void 0:r=>!(r instanceof wu)||r.used<=i)},clearOwner(n,i){t.lifetime.maintain();let r=t.shards.get(n);if(r){for(let s of[...r.lru.keys()])(i===void 0||s.group===i)&&Mu(t,s);i===void 0&&t.shards.delete(n)}},dispose(){t.disposed||(t.disposed=!0,t.shards=new WeakMap,t.lifetime.dispose())}};return TA.set(e,t),e}var JS=new WeakMap,AA=0;function ts(t){if(typeof t=="string"||typeof t=="number")return`${typeof t}:${String(t)}`;let e=JS.get(t);return e===void 0&&(e=`${t.kind}:${t.id}`,"offset"in t&&(e+=`@${t.offset}+${t.size}`),JS.set(t,e)),e}function Yp(t){return typeof t=="string"||typeof t=="number"?`${typeof t}:${String(t)}`:`${t.kind}:${t.id}`}function QS(t){let e;for(let n of t.keys())(!e||n.used<e.used)&&(e=n);return e}function Kp(t){AA++;let e=!0;for(let r=1;r<t.length;r++)t[r-1].binding>t[r].binding&&(e=!1);let n=e?t:[...t].sort((r,s)=>r.binding-s.binding),i="";for(let{binding:r,key:s}of n){let a=ts(s);i+=`${r}:${a.length}:${a}`}return i}function CA(t){return typeof t=="object"&&t.kind===Eu}function Mu(t,e){t.lifetime.unregister(e.record),e.record=void 0;let n=e.shard.deref();if(!n)return;let i=n.groups.get(e.group),r=i?.get(e.layout);if(r?.get(e.key)!==e)return;r.delete(e.key),n.lru.delete(e);let s=e.capture?n.captures.get(e.group):void 0;s?.delete(e),s?.size===0&&n.captures.delete(e.group),r.size===0&&i.delete(e.layout),i?.size===0&&n.groups.delete(e.group)}function ns(t,e,n){let i=t[e];if(!i)throw new C({code:"VGPU-REFLECT-ENTRY-METADATA-MISSING",message:`Entry point '${t.name}' has no reflected ${e}.`,fix:"Pass the reflection from reflectSource()/resolveShader().",where:n});return i}var Au=new WeakMap;function is(t,e){if(!t.gpu.pushErrorScope||!t.gpu.popErrorScope)return;t.gpu.pushErrorScope("validation");let n=Au.get(t.gpu);n?n.push(e):Au.set(t.gpu,[e])}function Vt(t){let e=Au.get(t.gpu);if(!e?.length||!t.gpu.popErrorScope)return;let n=e.pop();return e.length||Au.delete(t.gpu),{context:n,error:t.gpu.popErrorScope()}}function Jp(t){let e=[],n=Vt(t);for(;n;)e.push(n),n=Vt(t);return e}function eb(t){let e=Vt(t);e&&Qp(e)}function Cu(t){for(let e of Jp(t))Qp(e)}function xt(t){for(let e of t)Qp(e)}function Ru(t,e=[],n={}){return DA(t,e,n.errorSink??UA)}function oa(t,e){return{context:t.context,error:RA(t.error,e.error)}}async function RA(t,e){let n=await Promise.allSettled([t,e]);for(let r of n)if(r.status==="fulfilled"&&r.value)return r.value;let i=n.find(r=>r.status==="rejected");if(i?.status==="rejected")throw i.reason;return null}async function DA(t,e,n){await lr(t);for(let i of e)try{let r=await i.error;r&&await n(Gn(i.context.label,i.context.group,r))}catch(r){await n(Gn(i.context.label,i.context.group,r))}}function Qp(t){t.error.catch(()=>{})}function UA(t){console.error(t)}function Du(t,e,n,i){try{e.end()}catch(r){let s=Jp(t);xt(n),xt(s),n.length=0;let a=s[0]?.context??i;throw a?Gn(a.label,a.group,r):r}}var em=class{views=new Map;registered=new WeakSet;destroyed=!1;invalidateLifetime(){this.destroyed=!0,this.views.clear()}},tb=new WeakMap;function Uu(t,e,n,i){let r=LA(t,e);if(r.defaultEquivalent)return{view:t.view,key:r.key};t.view,i.limits;let s=tb.get(t);if(s||(s=new em,tb.set(t,s)),!s.registered.has(n.lifetime)){let o=n.marker(t,t.resourceIdentity,l=>t.onDestroy(l));n.lifetime.register(s,[o.dependency]),s.registered.add(n.lifetime)}if(s.destroyed)return{view:t.createView(e),key:r.key};let a=s.views.get(r.key)?.deref();return a||(a=t.createView(e),s.views.set(r.key,new WeakRef(a))),{view:a,key:r.key}}function LA(t,e){let n=e?.dimension??jp(t),i=e?.baseMipLevel??0,r=e?.mipLevelCount??t.mipLevelCount-i,s=e?.baseArrayLayer??0,a=e?.arrayLayerCount??nb(t,n,s),o=e?.aspect??"all",l=e?.usage===void 0||e.usage===0?t.gpu.usage:e.usage,c=e?.swizzle??"rgba",f={format:e?.format??"@default",dimension:n,aspect:o,baseMipLevel:i,mipLevelCount:r,baseArrayLayer:s,arrayLayerCount:a,usage:l,swizzle:c},d={format:"@default",dimension:jp(t),aspect:"all",baseMipLevel:0,mipLevelCount:t.mipLevelCount,baseArrayLayer:0,arrayLayerCount:nb(t,jp(t),0),usage:t.gpu.usage,swizzle:"rgba"};return{key:JSON.stringify(f),defaultEquivalent:JSON.stringify(f)===JSON.stringify(d)}}function jp(t){return t.kind==="2d-array"?"2d-array":t.kind}function nb(t,e,n){return e==="2d-array"||e==="cube"||e==="cube-array"?t.layers-n:1}var IA=1,ib=new WeakMap;function ob(t){return t===null||typeof t!="object"||ArrayBuffer.isView(t)||t instanceof ArrayBuffer||Array.isArray(t)?!0:t instanceof yt||t instanceof Ft||_u(t)||Wo(t)||$o(t)?!1:!lb(t)}function Lu(t){return typeof t!="object"||t===null||Array.isArray(t)||ArrayBuffer.isView(t)||t instanceof ArrayBuffer||t instanceof yt||t instanceof Ft||_u(t)||Wo(t)||$o(t)?!1:!lb(t)}function nm(t,e,n){Iu(t,e,n.sourceHint);try{return NA(t,e,n)}catch(i){let r=i?.code;if(r==="VGPU-CORE-TEXTURE-DESTROYED"||r==="VGPU-BUFFER-DISPOSED"){let s=r==="VGPU-BUFFER-DISPOSED"?WA(e):e instanceof Ft?e.label:Nu(e)?.color.label;throw Po(n.sourceHint,t,s)}throw i}}function NA(t,e,n){switch(Iu(t,e,n.sourceHint),t.bindingLayout?.kind){case"buffer":return PA(t,e,n);case"texture":return FA(t,e,n);case"sampler":return kA(t,e);case"storageTexture":return zA(t,e,n);case"externalTexture":throw At(t,"external texture","Pass a compatible GPUExternalTexture.");default:throw At(t,"reflected resource","Fix shader reflection bindingLayout.")}}function Iu(t,e,n){if(qS(e))throw hS(n,t)}function PA(t,e,n){let i=_u(e);if(i)return Ho(t,i[Vo](t,n.sourceHint),n);if(e instanceof yt)return or(e,`${n.sourceHint}.set`),Ho(t,{resourceLabel:e.options.label??e.gpu.label,resource:{buffer:e.gpu},identity:e.resourceIdentity,tracked:[la(e,e.resourceIdentity)]},n);if(XA(e))return or(e.buffer,`${n.sourceHint}.set`),Ho(t,{resourceLabel:e.buffer.options.label??e.buffer.gpu.label,resource:{buffer:e.gpu,offset:0,size:e.size},identity:e.buffer.resourceIdentity,tracked:[la(e.buffer,e.buffer.resourceIdentity)]},n);if($o(e))return Ho(t,{resource:e,identity:ur(e.buffer)},n);if(Wo(e))return Ho(t,{resource:{buffer:e},identity:ur(e)},n);throw At(t,"buffer",`Pass a compatible Buffer/Uniform: ${t.name}.set({ ${t.name}: gpu.device.createBuffer(...) }).`)}function Ho(t,e,n){if(!$o(e.resource))return e;let{buffer:i}=e.resource,r=e.resource.offset===void 0?0:e.resource.offset,s=e.resource.size===void 0?i.size-r:e.resource.size;return OA(t,i,r,s,n.device.limits,e.tracked!==void 0),{...e,resource:{buffer:i,offset:r,size:s},identity:BA(i,r,s),underlyingBuffer:i}}function OA(t,e,n,i,r,s){let a=t.bindingLayout?.kind==="buffer"?t.bindingLayout.buffer:void 0,o=a?.type==="storage"||a?.type==="read-only-storage",l=o?"storage":"uniform",c=globalThis.GPUBufferUsage?.[o?"STORAGE":"UNIFORM"]??(o?128:64),u=o?r.minStorageBufferOffsetAlignment:r.minUniformBufferOffsetAlignment,f=o?r.maxStorageBufferBindingSize:r.maxUniformBufferBindingSize,d=Math.max(a?.minBindingSize??0,t.layout?.size??0),h=`Create the buffer with ${l} usage and use a safe integer offset aligned to ${u} bytes plus a positive size from ${Math.max(1,d)} to ${f} bytes within buffer.size.`,p=x=>{throw At(t,`a valid ${l} buffer range (${x})`,h)};if((e.usage&c)===0){let x=s?`Create with usage: ['${l}','copy_dst'].`:h;throw At(t,`a valid ${l} buffer range (buffer usage is missing ${l})`,x)}(!Number.isFinite(n)||!Number.isSafeInteger(n)||n<0)&&p("offset must be a non-negative safe integer"),(!Number.isFinite(i)||!Number.isSafeInteger(i)||i<=0)&&p("size must be a positive safe integer"),n>e.size&&p("offset exceeds buffer.size"),i>e.size-n&&p("offset + size exceeds buffer.size"),n%u!==0&&p(`offset must be aligned to ${u} bytes`),i<d&&p(`size is below the reflected minimum of ${d} bytes`),i>f&&p(`size exceeds the granted maximum of ${f} bytes`),o&&i%4!==0&&p("storage size must be a multiple of 4 bytes")}function BA(t,e,n){return`buffer-range:${JSON.stringify([ts(ur(t)),e,n])}`}function FA(t,e,n){let i=t.bindingLayout?.kind==="texture"&&t.bindingLayout.texture.sampleType==="depth",r=Nu(e);if(r){if(i&&!r.depth)throw At(t,"a target with a depth attachment",`Create it with target(gpu, { size, depth: true }) or bind a Texture: set({ ${t.name}: scene.depth }).`);let s=i?r.depth:r.color;sb(t,s,n);let a=Uu(s,ab(s),n.cache,n.device);return{resourceLabel:s.label,resource:a.view,identity:s.resourceIdentity,cacheIdentity:tm(s.resourceIdentity,a.key),tracked:[la(r,r.resourceIdentity),la(s,s.resourceIdentity)],followedTarget:{target:r,depth:i}}}if(e instanceof Ft){$A(t,e.usage),sb(t,e,n);let s=Uu(e,ab(e),n.cache,n.device);return{resourceLabel:e.label,resource:s.view,identity:e.resourceIdentity,cacheIdentity:tm(e.resourceIdentity,s.key),tracked:[la(e,e.resourceIdentity)]}}if(im(e))return{resource:e.createView(),identity:e.resourceIdentity??ur(e)};if(typeof e=="object"&&e!==null)return{resource:e,identity:ur(e)};throw At(t,"texture/target",`Pass a Texture or Target: ${t.name}.set({ ${t.name}: scene.color }) or set({ ${t.name}: scene }).`)}function zA(t,e,n){let i=t.bindingLayout?.kind==="storageTexture"?t.bindingLayout.storageTexture:void 0,r={format:i?.format,viewDimension:i?.viewDimension??"2d"},s=`texture(gpu, { kind: "${r.viewDimension}", size${r.viewDimension==="2d-array"?", layers":""}, format: "${r.format??"rgba8unorm"}", usage: ["storage_binding"] })`;if(Nu(e))throw At(t,"a storage texture, not a Target",`Render targets are not storage textures. Create one with ${s} and set({ ${t.name}: texture }).`);if(e instanceof Ft){VA(t,e,r,s);let a=Uu(e,rb(r.viewDimension),n.cache,n.device);return{resourceLabel:e.label,resource:a.view,identity:e.resourceIdentity,cacheIdentity:tm(e.resourceIdentity,a.key),tracked:[la(e,e.resourceIdentity)]}}if(im(e))return{resource:e.createView(rb(r.viewDimension)),identity:e.resourceIdentity??ur(e)};if(typeof e=="object"&&e!==null)return{resource:e,identity:ur(e)};throw At(t,"a storage texture",`Pass a Texture from ${s}: set({ ${t.name}: texture }).`)}function VA(t,e,n,i){let r=e.label??"texture";if(!e.usage.includes("storage_binding"))throw At(t,"a texture with storage_binding usage",`Create it with ${i}; include texture_binding too if you also sample it.`);if(n.format&&e.format!==n.format)throw At(t,`format ${n.format}`,`Texture '${r}' is ${e.format}. Create it with ${i} or declare texture_storage_${n.viewDimension.replace("-","_")}<${e.format}, ...> in WGSL.`);let s=GA(n.viewDimension);if(s&&e.dimension!==s)throw At(t,`dimension "${s}"`,`Texture '${r}' has kind "${e.kind}". Create it with ${i}.`)}function rb(t){return{dimension:t,baseMipLevel:0,mipLevelCount:1}}function GA(t){switch(t){case"1d":return"1d";case"2d":case"2d-array":return"2d";case"3d":return"3d";default:return}}function kA(t,e){if(HA(e))return{resource:e,identity:ur(e)};throw At(t,"sampler",`Use the cached sampler: set({ ${t.name}: sampler(gpu) }).`)}function HA(t){return typeof t!="object"||t===null||t instanceof yt||t instanceof Ft?!1:!Wo(t)&&!$o(t)&&!im(t)&&!Nu(t)}function $A(t,e){if(!e.includes("texture_binding")&&!e.includes("render_attachment"))throw At(t,"sampled texture","Use texture_binding usage or a sampleable Target.")}function sb(t,e,n){if(!(!n.filterableTexture||n.float32Filterable)&&(e.format==="r32float"||e.format==="rg32float"||e.format==="rgba32float"))throw mS(n.sourceHint,t,e.format,e.label??"texture",n.pairedSampler)}function ab(t){return t.format.includes("stencil")?{aspect:"depth-only"}:void 0}function la(t,e){return{resource:t,identity:e,subscribe:n=>t.onDestroy(n)}}function WA(t){try{let e=t instanceof yt?t:typeof t=="object"&&t!==null&&"buffer"in t?t.buffer:void 0;return e instanceof yt?e.options.label??e.gpu.label:void 0}catch{return}}function Nu(t){if(typeof t!="object"||t===null)return;let e=t;if(!(!e.resourceIdentity||!e.color||typeof e.onDestroy!="function"))return e}function lb(t){let e=t;return"gpu"in e||"bindGroup"in e||"createView"in e||"resourceIdentity"in e}function ur(t){if(typeof t!="object"||t===null)return`value:${String(t)}`;let e=ib.get(t);return e||(e={kind:"external",id:IA++},ib.set(t,e)),e}function tm(t,e){return`texture-view:${JSON.stringify([ts(t),e])}`}function XA(t){return typeof t=="object"&&t!==null&&"gpu"in t&&"size"in t&&"buffer"in t&&t.buffer instanceof yt}function im(t){return typeof t=="object"&&t!==null&&typeof t.createView=="function"}function $o(t){return typeof t=="object"&&t!==null&&"buffer"in t&&Wo(t.buffer)}function Wo(t){if(typeof t!="object"||t===null)return!1;let e=t;return Number.isSafeInteger(e.size)&&e.size>=0&&typeof e.usage=="number"&&typeof e.destroy=="function"&&typeof e.mapAsync=="function"&&typeof e.getMappedRange=="function"&&typeof e.unmap=="function"}function Pu(t,e){let n=t instanceof Uint8Array?t:new Uint8Array(t),i=e instanceof Uint8Array?e:new Uint8Array(e);if(n.byteLength!==i.byteLength)return!1;for(let r=0;r<n.byteLength;r++)if(n[r]!==i[r])return!1;return!0}function Xo(t,e){qA(t),sm(t,e,"$",0,t.size);let n=new ArrayBuffer(t.size);return rm(new DataView(n),t,0,e),n}function qA(t){if(t.size===void 0)throw re("set",`No se puede inferir byteLength para layout runtime-sized '${t.name}'.`)}function rm(t,e,n,i){if(e.members)return YA(t,e.members,n,i);ZA(t,e,n,i)}function YA(t,e,n,i){let r=i;for(let s of e)rm(t,s.layout,n+s.offset,r?.[s.name])}function ZA(t,e,n,i){switch(e.type.kind){case"scalar":return zu(t,n,e.type.name,i);case"atomic":return KA(t,n,e.type,i);case"vector":return JA(t,n,e.type,i);case"matrix":return QA(t,e,n,i);case"array":return jA(t,e,n,i);default:throw re("set",`No hay writer para layout ${e.type.kind}.`)}}function zu(t,e,n,i){n==="f32"?t.setFloat32(e,i,!0):n==="i32"?t.setInt32(e,i,!0):n==="u32"||n==="bool"?t.setUint32(e,n==="bool"?i?1:0:i,!0):t.setUint16(e,aC(i),!0)}function KA(t,e,n,i){zu(t,e,rs(n.element),i)}function JA(t,e,n,i){let r=i,s=qo(n.element);for(let a=0;a<n.width;a++)zu(t,e+a*s,rs(n.element),r?.[a]??0)}function QA(t,e,n,i){let r=e.type,s=i,a=qo(r.element),o=e.stride??16;for(let l=0;l<r.columns;l++)for(let c=0;c<r.rows;c++)zu(t,n+l*o+c*a,rs(r.element),s?.[l*r.rows+c]??0)}function jA(t,e,n,i){let r=i,s=e.stride??e.element?.size??0;if(!e.element)throw re("set","Array layout sin element layout.");for(let a=0;a<r.length;a++)rm(t,e.element,n+a*s,r[a])}function sm(t,e,n,i,r){if(t.members){eC(t.members,e,n,i,r);return}switch(t.type.kind){case"scalar":Ou(t.type.name,e,n),Bu(n,i,qo(t.type),r);return;case"atomic":Ou(rs(t.type.element),e,n),Bu(n,i,4,r);return;case"vector":tC(t.type,e,n,i,r);return;case"matrix":nC(t,e,n,i,r);return;case"array":iC(t,e,n,i,r);return;default:throw re("set",`No hay validator para layout ${t.type.kind}.`)}}function eC(t,e,n,i,r){sC(e)||en("type",n,"an object",Fu(e));let s=new Set(t.map(o=>o.name)),a=Object.keys(e).find(o=>!s.has(o));a!==void 0&&en("unknown-field",`${n}.${a}`,"a declared field",a);for(let o of t){let l=`${n}.${o.name}`;Object.hasOwn(e,o.name)||en("missing-field",l,"a required field","missing"),sm(o.layout,e[o.name],l,i+o.offset,r)}}function tC(t,e,n,i,r){let s=ub(e,n,t.width),a=rs(t.element),o=qo(t.element);for(let l=0;l<t.width;l++)Ou(a,s[l],`${n}[${l}]`),Bu(`${n}[${l}]`,i+l*o,o,r)}function nC(t,e,n,i,r){let s=t.type,a=s.columns*s.rows,o=ub(e,n,a),l=rs(s.element),c=qo(s.element),u=t.stride;if(u===void 0)throw re("set",`Matrix layout '${t.name}' sin stride.`);for(let f=0;f<s.columns;f++)for(let d=0;d<s.rows;d++){let h=f*s.rows+d,p=`${n}[${f}][${d}]`;Ou(l,o[h],p),Bu(p,i+f*u+d*c,c,r)}}function iC(t,e,n,i,r){let s=fb(e,n),a=t.type;a.count!==void 0&&s.length!==a.count&&en("shape",n,a.count,s.length);let o=t.stride;if(o===void 0||!t.element)throw re("set",`Array layout '${t.name}' sin stride o element layout.`);if(t.runtimeSized){let l=rC(o,s.length,n),c=t.size??r-i;c!==l&&en("extent",n,l,c)}for(let l=0;l<s.length;l++)sm(t.element,s[l],`${n}[${l}]`,i+l*o,r)}function Ou(t,e,n){if(t==="bool"){typeof e!="boolean"&&en("type",n,"bool",Fu(e),t);return}typeof e!="number"&&en("type",n,t,Fu(e),t),t==="i32"&&(!Number.isInteger(e)||e<-2147483648||e>2147483647)&&en("integer-range",n,"an integer in [-2147483648, 2147483647]",String(e),t),t==="u32"&&(!Number.isInteger(e)||e<0||e>4294967295)&&en("integer-range",n,"an integer in [0, 4294967295]",String(e),t)}function ub(t,e,n){let i=fb(t,e);return i.length!==n&&en("shape",e,n,i.length),i}function fb(t,e){if(Array.isArray(t)||ArrayBuffer.isView(t)&&!(t instanceof DataView)&&"length"in t)return t;en("type",e,"an array or typed array",Fu(t))}function Bu(t,e,n,i){(!Number.isSafeInteger(e)||!Number.isSafeInteger(n)||e<0||n<0||e>i-n)&&en("buffer-range",t,`${n} bytes inside ${i}`,e)}function rC(t,e,n){let i=t*e;return(!Number.isSafeInteger(t)||t<0||!Number.isSafeInteger(i))&&en("extent",n,"a safe byte extent",String(i)),i}function en(t,e,n,i,r){let s=t==="shape"?`expected exactly ${n} values, received ${i}`:t==="missing-field"?"required field is missing":t==="unknown-field"?`field '${i}' is not declared by the layout`:t==="integer-range"?`${i} is outside the exact ${r} range`:t==="extent"?`runtime extent requires ${n} bytes, received ${i}`:t==="buffer-range"?`write at byte ${i} exceeds ${n}`:`expected ${n}, received ${i}`;throw VS(r===void 0?{reason:t,path:e,expected:n,actual:i}:{reason:t,path:e,expected:n,actual:i,type:r},s)}function sC(t){if(typeof t!="object"||t===null||Array.isArray(t)||ArrayBuffer.isView(t))return!1;let e=Object.getPrototypeOf(t);return e===Object.prototype||e===null}function Fu(t){return t===null?"null":Array.isArray(t)?"array":ArrayBuffer.isView(t)?t.constructor.name:typeof t}function qo(t){return rs(t)==="f16"?2:4}function rs(t){if(t.kind!=="scalar")throw re("set",`Expected scalar, got ${t.kind}`);return t.name}function aC(t){let e=new Float32Array(1),n=new Uint32Array(e.buffer);e[0]=t;let i=n[0],r=i>>16&32768,s=i&8388607,a=i>>23&255;if(a===255)return r|(s?32256:31744);let o=a-127+15;if(o>=31)return r|31744;if(o<=0)return o<-10?r:r|cb(s|8388608,14-o);let l=cb(s,13);if(l===1024){let c=o+1;return c>=31?r|31744:r|c<<10}return r|o<<10|l}function cb(t,e){let n=t>>>e,i=(1<<e)-1,r=t&i,s=1<<e-1;return r>s||r===s&&(n&1)===1?n+1:n}function Yo(t,e){let n=t.gpu,i=typeof n.pushErrorScope=="function"&&typeof n.popErrorScope=="function";i&&n.pushErrorScope("validation");let r=i,s=()=>{if(!r)return Promise.resolve(null);r=!1;try{return n.popErrorScope().then(a=>a,a=>a)}catch(a){return Promise.resolve(a)}};try{return{value:e(),error:s()}}catch(a){throw s(),a}}var am=new WeakMap;function Zo(t,e,n=[]){let i;try{i=Yo(t,e)}catch(a){throw a instanceof C?a:es("pipeline.setup",a)}let{value:r,error:s}=i;return am.set(r,{error:Promise.all([Vu(n),s]).then(a=>a.find(Boolean)??null),claimed:!1}),r}function Vu(t){return Promise.all(t.map(e=>{let n=am.get(e);return n&&(n.claimed=!0),n?.error})).then(e=>e.find(Boolean)??null)}async function db(t,e,n){let i=am.get(t),r=await i?.error;r&&!i?.claimed&&await n(es(e,r))}function Ko(t,e,n,i,r){try{let{value:s,error:a}=Yo(t,i);return e.push({error:a,where:n,origin:r}),s}catch(s){throw s instanceof C?s:hb(n,s)}}function hb(t,e){return new C({code:"VGPU-COMPUTE-VALIDATION",message:"WebGPU compute operation failed validation.",where:t,cause:e,fix:"Check pipeline compilation, resource compatibility, dispatch counts, and device limits."})}async function pb(t,e){let n=await Promise.all(t.map(r=>r.origin?.())),i=!1;for(let[r,s]of t.entries()){let a=await s.error;if(n[r]){i=!0;continue}a&&(!i||s.origin)&&(await e(hb(s.where,a)),i=!0)}}var mb=new WeakMap;function gb(t,e){let n=new Map,i=new Set,r=new Set,s=new Set(t.filter(o=>o.bindingLayout?.kind==="texture"&&o.bindingLayout.texture.sampleType==="depth").map(o=>`${o.group}:${o.binding}`));for(let o of e){let l=o.stage==="vertex"?1:o.stage==="fragment"?2:4;for(let c of ns(o,"bindings","visibility")){let u=`${c.group}:${c.binding}`;n.set(u,(n.get(u)??0)|l)}for(let c of ns(o,"samplingPairs","visibility")){if(c.mode!=="filtering")continue;let u=`${c.texture.group}:${c.texture.binding}`;s.has(u)?r.add(`${c.sampler.group}:${c.sampler.binding}`):i.add(u)}}let a=o=>n.get(`${o.group}:${o.binding}`)??0;return Object.defineProperty(a,"filterable",{value:i}),Object.defineProperty(a,"nonFilteringSamplers",{value:r}),a}function om(t,e,n=cm){return t.flatMap(i=>{if(i.group!==e)return[];let r=n(i),s=`${i.group}:${i.binding}`;return r===0?[]:[{binding:i.binding,visibility:r,...lC(i,n.filterable?.has(s)??!1,n.nonFilteringSamplers?.has(s)??!1)}]})}function yb(t,e,n,i=cm){let r=new Map,s=n.bindings.filter(o=>i(o)!==0).map(o=>o.group),a=Math.max(-1,...s);for(let o=0;o<=a;o++)r.set(o,oC(t,e,n,o,i));return r}function oC(t,e,n,i,r=cm){return lm(t,`${e}.group${i}.bgl`,om(n.bindings,i,r))}function lm(t,e,n){let i=mb.get(t.gpu);i||(i=new Map,mb.set(t.gpu,i));let r=JSON.stringify(n),s=i.get(r);if(s)return s;let a=Up(Zo(t,()=>t.gpu.createBindGroupLayout({label:e,entries:n})),{entries:n});return i.set(r,a),a}function lC(t,e,n){let i=t.bindingLayout;if(!i)throw re("bindGroupLayout",`Binding '${t.name}' does not have a reflected bindingLayout.`);return e&&i.kind==="texture"&&i.texture.sampleType==="unfilterable-float"&&!i.texture.multisampled?{texture:{...i.texture,sampleType:"float"}}:n&&i.kind==="sampler"&&i.sampler.type==="filtering"?{sampler:{type:"non-filtering"}}:cC(i)}function cC(t){switch(t.kind){case"buffer":return{buffer:{...t.buffer}};case"sampler":return{sampler:{...t.sampler}};case"texture":return{texture:{...t.texture}};case"storageTexture":return{storageTexture:{...t.storageTexture}};case"externalTexture":return{externalTexture:{}}}}function cm(t){let e=globalThis.GPUShaderStage,n=e?.VERTEX??1,i=e?.FRAGMENT??2,r=e?.COMPUTE??4;return t.kind==="buffer"?n|i|r:i|r}var xb=Object.freeze([]),vb=new WeakMap,um=Symbol("no cleanup failure");function Eb(t){let e=t,n=t.label,i=t.disposedError,r=fC(t.reflection),s=[...t.bindGroupLayouts.keys()].sort((v,M)=>v-M),a=new Map,o={},l=new Map,c={fullVerifications:0,groupPlanBuilds:0},u=-1,f=[],d=new Map;g();function h(){u=-1,d.clear()}function p(v){if(!e)throw i(v);return e}function x(v){p("set");let M=[];for(let[R,F]of Object.entries(v))M.push(...m(R,F));return M}function b(v){return l.get(v.info.group)?.active.has(v.info.binding)??!1}function g(){let v=p("layout");for(let[M,R]of v.bindGroupLayouts){let F=l.get(M);if(F?.layout===R)continue;F&&(v.cache.clearOwner(o,M),h());let Se=new Set(Qr(R)?.entries.map(We=>We.binding)??[]),Q=v.reflection.bindings.filter(We=>We.group===M&&Se.has(We.binding));l.set(M,{layout:R,active:Se,bindings:Q})}}function m(v,M){let R=r.get(v);if(R)return y(R,v,M);let F=dC(v,r,n);if(!F)throw re(`${n}.set`,`Binding '${v}' does not exist in '${n}'.`);return _(F,v,M)}function y(v,M,R){Iu(v.info,R,n),Ze(v.info.group);let F=_b(v.info,R);Sb(v,M,F);let Se=Jo(v.identity);return F==="lib"?S(v,gC(v.libValue,R)):U(v,R),v.ownership??=F,b(v)?wb(v,Se):[]}function _(v,M,R){Ze(v.info.group);let F=_b(v.info,R);if(Sb(v,M,F),hC(v,M,F),F!=="lib")throw re(`${n}.set`,`Member '${M}' needs a JS value; set resource '${v.info.name}' instead.`);let Se=Jo(v.identity),Q=v.libValue??fm(ce(v));return S(v,{...yC(Q),[M]:R}),v.ownership??=F,v.memberOwnership.set(M,F),b(v)?wb(v,Se):[]}function S(v,M){let R=ce(v),F=Xo(R,M);v.libValue=M,v.buffer||ze(v,R.size),(!v.bytes||!Pu(v.bytes,F))&&(v.bytes=F,v.revision=(v.revision??0)+1,v.dirtyUniform=!0),(v.liveUniform||v.info.addressSpace!=="uniform")&&(v.dirtyUniform=!0,A(v,!1))}function A(v,M){v.prepareUniform?.(M),v.dirtyUniform&&(v.buffer.write(v.bytes,0),v.dirtyUniform=!1),M&&(v.liveUniform=!0)}function E(v){let M=p("set"),R=Qr(M.bindGroupLayouts.get(v.group))?.entries.find(Q=>Q.binding===v.binding),F=M.reflection.entryPoints.flatMap(Q=>ns(Q,"samplingPairs",n)).find(Q=>Q.mode==="filtering"&&Q.texture.group===v.group&&Q.texture.binding===v.binding),Se=F&&M.reflection.bindings.find(Q=>Q.group===F.sampler.group&&Q.binding===F.sampler.binding);return{device:M.device,cache:M.cache,sourceHint:n,filterableTexture:R?.texture?.sampleType==="float",float32Filterable:M.device.features.has("float32-filterable"),pairedSampler:Se}}function U(v,M){let R=nm(v.info,M,E(v.info));L(v,M,R)}function L(v,M,R){let F=p("set");h(),v.resource=R.resource,v.uniformValue=R.uniformValue,v.prepareUniform=R.prepareUniform,v.identity=R.identity,v.cacheIdentity=R.cacheIdentity,v.resourceLabel=R.resourceLabel,v.sourceValue=M,v.followedTarget=R.followedTarget,v.markers=R.tracked?.map(({resource:Se,identity:Q,subscribe:We})=>F.cache.marker(Se,Q,We)),v.dependencies=R.tracked?.map(({identity:Se})=>Se)??[],v.underlyingBuffer=R.underlyingBuffer}function P(v,M,R){I(v),pC(n,v,M,R);let F=a.has(v)?`claimed-group:${v}`:void 0;return a.set(v,M),h(),F}function $(v){let M=v.followedTarget;if(!M)return;if(v.markers?.[0]?.destroyed)throw Po(n,v.info,v.resourceLabel);let R=M.depth?M.target.depth:M.target.color;!R||ts(R.resourceIdentity)===Jo(v.identity)||L(v,M.target,nm(v.info,M.target,E(v.info)))}function _e(){p("bindingState");let v=[];for(let M of r.values())if(!(!b(M)||a.has(M.info.group)||!M.resource)&&($(M),M.followedTarget&&v.push(M),M.markers?.some(R=>R.destroyed)))throw Po(n,M.info,M.resourceLabel);return v}function Re(){let v=p("preflight").cache.lifetime.destroyEpoch;if(u===v){for(let M of f)$(M);if(u===v)return}c.fullVerifications++,f=_e();for(let M of r.values())b(M)&&!a.has(M.info.group)&&Ie(M.info);u=v}function Z(){let v=p("resourceSnapshots");Re();let M=[];for(let R of r.values())!b(R)||a.has(R.info.group)||(R.info.addressSpace==="uniform"&&A(R,!0),!(!R.markers?.length&&!R.followedTarget)&&M.push({lifetime:v.cache.lifetime,markers:R.markers??[],group:R.info.group,binding:R.info.binding,bindingName:R.info.name,bindingKind:R.info.kind,capturedIdentity:Jo(R.identity),resourceLabel:R.resourceLabel,followedTarget:R.followedTarget}));return M}function I(v){let R=p("layout").bindGroupLayouts.get(v);if(!R)throw re(`${n}.layout`,`@group(${v}) does not exist in '${n}'.`);return R}function W(v){return p("bindGroups"),Re(),s.map(M=>Ee(M,v))}function Ee(v,M){let R=p("bindGroups"),F=a.get(v);if(F)return{group:v,bindGroup:F,offsets:xb,claimValidation:Fe(F,v)};let Se=d.get(v);if(Se)return Se();c.groupPlanBuilds++;let Q=l.get(v)?.bindings??[],We=[],qn=[],an=[],Te=!0;for(let at of Q){let de=Ie(at),ht=de.uniformValue?.()??(de.bytes&&at.addressSpace==="uniform"?uC(de):void 0);Te&&=!ht&&!de.uniformValue&&!de.prepareUniform;let be=M&&ht?M.capture(ht,R.cache):void 0;be||A(de,!1),!be&&de.buffer&&(de.mayHaveNativeConsumers=!0),We.push(be?.resource??de.resource),qn.push({binding:at.binding,key:be?.identity??de.cacheIdentity??de.identity}),be?an.push(be.identity):de.dependencies&&an.push(...de.dependencies)}let Yn=I(v),ds=()=>R.device.gpu.createBindGroup({label:`${n}.group${v}`,layout:Yn,entries:Q.map((at,de)=>({binding:at.binding,resource:We[de]}))}),Ke=Kp(qn),Je=()=>({group:v,bindGroup:R.cache.getOrCreate(o,v,Yn,qn,an,ds,Ke),offsets:xb});return Te&&d.set(v,Je),Je()}function Fe(v,M){return du(v)?void 0:{label:n,group:M}}function Ie(v){let M=r.get(v.name);if(!M?.resource||!M.identity)throw gS(n,v);return M}function Ze(v){if(a.has(v))throw yS(n,v)}function ze(v,M){let R=p("set");h(),v.buffer=R.device.createBuffer({size:M,usage:["uniform","copy_dst"],label:`${n}.${v.info.name}`}),v.resource={buffer:v.buffer.gpu,offset:0,size:M},v.identity=v.buffer.resourceIdentity,v.markers=[R.cache.marker(v.buffer,v.buffer.resourceIdentity,F=>v.buffer.onDestroy(F))],v.dependencies=[v.buffer.resourceIdentity],v.underlyingBuffer=v.buffer.gpu}function ce(v){if(v.info.kind!=="buffer"||!v.info.layout?.size)throw re(`${n}.set`,`Binding '${v.info.name}' needs a compatible resource, not JS.`);return v.info.layout}let Ne={dispose(){let v=e;if(!v)return;e=void 0,vb.set(Ne,{disposedError:i});let M=um;try{v.cache.clearOwner(o)}catch(R){M=R}for(let R of r.values())if(!(!R.buffer||R.mayHaveNativeConsumers))try{R.buffer.destroy()}catch(F){M===um&&(M=F)}if(r.clear(),a.clear(),l.clear(),d.clear(),f=[],M!==um)throw M},assertUsable:_e,preflight:Re,refreshLayouts:g,captureResources:Z,get groups(){return p("groups"),s},set:x,claimGroup:P,layout:I,bindGroups:W,bindingState(v){p("bindingState");let M=r.get(v);if(!(!M?.ownership||!M.resource||!M.identity))return M.buffer&&(M.mayHaveNativeConsumers=!0),{info:M.info,ownership:M.ownership,resource:M.resource,identity:M.identity,underlyingBuffer:M.underlyingBuffer}}};return vb.set(Ne,{cache:t.cache,owner:o,stats:c}),Ne}function uC(t){let e=t.ownedValue;return e&&e.revision===t.revision?e:t.ownedValue={owner:t.captureToken,revision:t.revision,bytes:new Uint8Array(t.bytes)}}function fC(t){return new Map(t.bindings.map(e=>[e.name,{info:e,memberOwnership:new Map,captureToken:{}}]))}function dC(t,e,n){let i;for(let r of e.values())if(r.info.layout?.members?.some(s=>s.name===t)){if(i)throw re(`${n}.set`,`Binding member '${t}' is ambiguous in '${n}'; set the complete binding.`);i=r}return i}function _b(t,e){return t.bindingLayout?.kind==="buffer"&&ob(e)?"lib":"user"}function Sb(t,e,n){if(t.ownership&&t.ownership!==n)throw Lp(e,t.ownership)}function hC(t,e,n){let i=t.memberOwnership.get(e);if(i&&i!==n)throw Lp(e,i)}function pC(t,e,n,i){let r=du(n);if(!r)return;let s=Qr(i);if(!s)return;let a=mC(s.entries,r.layout.entries);if(a)throw xS(t,e,a)}function mC(t,e){if(t.length!==e.length)return`expected ${t.length} bindings and received ${e.length}`;let n=bb(t),i=bb(e);for(let[r,s]of n){let a=i.get(r);if(!a)return`missing @binding(${r})`;if(Mb(s)!==Mb(a))return`@binding(${r}) does not match the reflected layout`}}function bb(t){return new Map(t.map(e=>[e.binding,e]))}function Mb(t){return JSON.stringify({binding:t.binding,visibility:t.visibility,buffer:t.buffer,sampler:t.sampler,texture:t.texture,storageTexture:t.storageTexture,externalTexture:t.externalTexture?{}:void 0})}function wb(t,e){let n=Jo(t.identity);return!n||e===n?[]:[{group:t.info.group,binding:t.info.binding,bindingName:t.info.name,bindingKind:t.info.kind,previousIdentity:e,newIdentity:n}]}function Jo(t){return t===void 0?void 0:ts(t)}function gC(t,e){return Lu(t)&&Lu(e)?{...t,...e}:e}function yC(t){return Lu(t)?t:{}}function fm(t){if(t.members)return Object.fromEntries(t.members.map(e=>[e.name,fm(e.layout)]));switch(t.type.kind){case"scalar":case"atomic":return 0;case"vector":return Array.from({length:t.type.width},()=>0);case"matrix":return Array.from({length:t.type.columns*t.type.rows},()=>0);case"array":{let e=t.element;return t.type.count===void 0||!e?[]:Array.from({length:t.type.count},()=>fm(e))}default:return}}var xC="rgba8unorm",ca=Object.freeze([0,0,0,1]);function ua(t,e){let n=t,i=Array.isArray(t)?t:[n?.r,n?.g,n?.b,n?.a];if(i.length!==4||!i.every(r=>typeof r=="number"&&Number.isFinite(r)))throw FS(e);return Qo(t)}function Qo(t){let e=t;return Array.isArray(t)?[t[0],t[1],t[2],t[3]]:{r:e.r,g:e.g,b:e.b,a:e.a}}function jo(t){return t.colors??[{format:t.format??xC}]}function dm(t){return t.depth===!0?"depth24plus":t.depth||void 0}function hm(t){let e=t.msaa;if(e===!0||e===4)return 4;if(e===void 0||e===!1)return 1;let n=Gp();throw n.code="VGPU-TARGET-MSAA-INVALID",n.message=`msaa received ${e}; WebGPU 1|4; use true`,n}function pm(t,e){if(!Array.isArray(t?.size)||t.size.length!==2||!Array.from(t.size).every(i=>Number.isSafeInteger(i)&&i>0))throw Gp();let n=dm(t);if(n==="stencil8")throw DS(n);if(hm(t)===4)for(let i of jo(t))vC(i.format,e)}function vC(t,e){if(e.isCompatibilityMode&&t==="rgba16float")throw re("target","Dawn compatibility mode does not support rgba16float+msaa.","Use rgba8unorm for MSAA here, or disable msaa.")}function Gu(t,e,n,i){let r={view:(e??t).createView(),resolveTarget:e?t.createView():void 0,loadOp:i?"load":"clear",storeOp:e?"discard":"store"};return i||(r.clearValue=_C(n)),r}function ku(t,e,n,i,r){if(r){let a={view:t.createView(),depthReadOnly:!0};return ss(t.format)&&(a.stencilReadOnly=!0),a}let s={view:t.createView(),depthLoadOp:e?"load":"clear",depthStoreOp:t.sampleCount>1?"discard":"store"};return e||(s.depthClearValue=n??1),t.format&&ss(t.format)&&(s.stencilLoadOp=e?"load":"clear",s.stencilStoreOp=t.sampleCount>1?"discard":"store",e||(s.stencilClearValue=i??0)),s}function ss(t){return!!t&&t.includes("stencil")}function _C(t){return Array.isArray(t)?{r:t[0],g:t[1],b:t[2],a:t[3]}:t}function as(t,e){return t[0]===e[0]&&t[1]===e[1]}function fr(t){return typeof t=="object"&&t!==null&&typeof t.renderPassDescriptor=="function"}var Tb=1,SC=1,Ab=new WeakMap,bC=new WeakMap;function Ub(t){let e=Su(t);return e?{colors:[...e.colors],depth:e.depth,sampleCount:e.sampleCount??1}:fr(t)?{colors:t.colors.map(n=>n.format),depth:t.depth?.format,sampleCount:t.sampleCount}:typeof t!="object"||t===null?{colors:[]}:{colors:Array.isArray(t.colors)?[...t.colors]:t.colors??[],depth:t.depth,sampleCount:t.sampleCount??1}}function xm(t){return`${t.colors.join(",")}:${t.depth??"none"}:${t.sampleCount??1}`}function Lb(t,e){if(!Array.isArray(t.colors)||t.colors.length===0)throw zo(e,"colors must be a non-empty array.");let n=t.colors.find(r=>typeof r!="string"||r.length===0);if(n!==void 0)throw zo(e,`colors must contain only GPUTextureFormat strings; received ${String(n)}.`);if(t.depth!==void 0&&(typeof t.depth!="string"||t.depth.length===0))throw zo(e,"depth must be a GPUTextureFormat string.");let i=t.sampleCount??1;if(i!==1&&i!==4)throw zo(e,`sampleCount must be 1 or 4; received ${String(i)}.`)}function Ib(t){let e=`${mm(Ab,t.vertexModule,()=>Tb++)}|${mm(Ab,t.fragmentModule,()=>Tb++)}|${mm(bC,t.pipelineLayout,()=>SC++)}|${EC(t.vertexBufferLayouts??[])}|${xm(t.signature)}`;(t.topology||t.stripIndexFormat)&&(e+=`|${t.topology??"triangle-list"}|${t.stripIndexFormat??"none"}`),(t.cullMode||t.frontFace)&&(e+=`|${t.cullMode??"none"}|${t.frontFace??"ccw"}`),t.unclippedDepth&&(e+="|unclipped");for(let n of[t.depthKey,t.stencilKey,t.multisampleKey,t.constantsKey,t.entryKey,t.fragmentKey])n&&(e+=`|${n}`);return e}function vm(t,e,n,i,r){if(i===void 0){let a={vertex:"vs_main",fragment:"fs_main",compute:"cs_main"}[n],o;for(let l of e)if(l.stage===n&&(o??=l,l.name===a))return l;return o}if(typeof i!="string")throw rr(t,`${n} received ${gm(i)}; expected an entry point name string.`,r);let s=e.find(a=>a.name===i);if(!s)throw rr(t,`"${i}" matches no entry point in the shader; available entry points: ${Cb(e)}.`,r);if(s.stage!==n)throw rr(t,`"${i}" is a @${s.stage} entry point, not @${n}; available entry points: ${Cb(e)}.`,r);return s}function Cb(t){return t.length?t.map(e=>`"${e.name}" (@${e.stage})`).join(", "):"none"}function Nb(t,e,n,i){if(e!==void 0&&(typeof e!="object"||e===null||Array.isArray(e)))throw Bo(t,`received ${gm(e)}; expected { overrideNameOrId: number | boolean }.`,i);let r=new Map(n.map(a=>[Rb(a),a])),s={};for(let[a,o]of Object.entries(e??{})){if(!r.has(a))throw Bo(t,`"${a}" matches no override in the shader; available overrides: ${MC(n)}.`,i);if(typeof o=="boolean"){s[a]=o?1:0;continue}if(typeof o!="number"||!Number.isFinite(o))throw Bo(t,`"${a}" received ${gm(o)}; use a finite number or a boolean (WebGPU converts the value to the override's WGSL type, and NaN/Infinity fail that conversion).`,i);s[a]=o}for(let a of n){let o=Rb(a);if(a.defaultValue===void 0&&!(o in s))throw Bo(t,`override '${a.name}' has no default value and must be provided; add constants: { "${o}": value }.`,i)}return Object.keys(s).length===0?{}:{constants:s,constantsKey:wC(s)}}function Rb(t){return t.id!==void 0?String(t.id):t.name}function MC(t){return t.length?t.map(e=>e.id!==void 0?`"${e.id}" (@id of ${e.name})`:`"${e.name}"`).join(", "):"none"}function wC(t){return`cn~${Object.entries(t).sort(([e],[n])=>e<n?-1:e>n?1:0).map(([e,n])=>`${e}=${n}`).join("~")}`}function gm(t){if(typeof t=="string")return`"${t}"`;try{return JSON.stringify(t)??String(t)}catch{return String(t)}}function Hu(t,e){let n=new Map;return{get(i,r){let s=n.get(i);return s||(s=Zo(t,()=>t.gpu.createShaderModule({label:r,code:i})),n.set(i,s),e?.(s,r)),s},dispose(){n.clear()}}}function $u(t,e){let n=new Map;return{get(i){let r=TC(i),s=n.get(r);return s||(s=Zo(t,()=>t.gpu.createPipelineLayout({bindGroupLayouts:AC(i)}),[...i.values()]),n.set(r,s),e?.(s,"pipeline.layout")),s},dispose(){n.clear()}}}function el(t,e={}){return new ym(t,e)}var ym=class{device;#e=new Map;#t=new Set;#n;#i;#r=!1;constructor(e,n){this.device=e,this.#n=n.errorSink??(()=>{}),this.#i=n.registerSettledSource?.(()=>[...this.#t])}getReady(e){return this.#e.get(e)?.pipeline}async failure(e){let n=this.#e.get(e);return await n?.validation,n?.failure??null}getSync(e,n,i){this.#s(i.where);let r=this.#e.get(e);if(r?.failure&&!i.retry)throw r.failure;if(r?.pipeline)return r.pipeline;(!r||r.failure)&&(r={generation:0},this.#e.set(e,r));let s=r,a=++s.generation;try{let{value:o,error:l}=Yo(this.device,n);s.pipeline=o;let c=Promise.all([Vu(i.dependencies??[]),l]).then(async u=>{if(this.#r||s.generation!==a)return;let f=u.find(Boolean);if(f){let d=es(i.where,f,i.signature);s.failure=d,s.pipeline=void 0,s.pending?.reject(d),s.pending=void 0,await this.#n(d)}else s.validated=!0,s.pending?.resolve(o),s.pending=void 0});return s.validation=c,this.#o(c),o}catch(o){let l=es(i.where,o,i.signature);throw s.failure=l,s.pending?.reject(l),s.pending=void 0,l}}getAsync(e,n,i){this.#s(i.where);let r=this.#e.get(e);if(r?.pipeline)return r.validated?Promise.resolve(r.pipeline):(r.pending??=Db(),r.pending.promise);if(r?.pending)return r.pending.promise;r={generation:0,pending:Db()},this.#e.set(e,r);let s=r,a=s.pending,o=++s.generation,l,c;try{let f=Yo(this.device,n);l=f.value,c=f.error}catch(f){l=Promise.reject(f),c=Promise.resolve(null)}let u=Promise.all([l.then(f=>({value:f}),f=>({cause:f})),Vu(i.dependencies??[]),c]).then(([f,d,h])=>{if(this.#r||s.generation!==o)return;let p=d??h??("cause"in f?f.cause:void 0);p||"cause"in f?(s.failure=es(i.where,p,i.signature),a.reject(s.failure)):(s.pipeline=f.value,s.validated=!0,a.resolve(s.pipeline)),s.pending=void 0});return this.#o(u),a.promise}dispose(){if(!this.#r){this.#r=!0;for(let e of this.#e.values())e.pending?.reject(Vp("gpu.dispose"));this.#e.clear(),this.#t.clear(),this.#i?.()}}#s(e){if(this.#r)throw Vp(e)}#o(e){this.#t.add(e),e.then(()=>this.#t.delete(e),()=>this.#t.delete(e))}};function Db(){let t,e,n=new Promise((i,r)=>{t=i,e=r});return n.catch(()=>{}),{promise:n,resolve:t,reject:e}}function mm(t,e,n){let i=t.get(e);return i||(i=n(),t.set(e,i)),i}function EC(t){return JSON.stringify(t.map(e=>({arrayStride:e.arrayStride,stepMode:e.stepMode??"vertex",attributes:[...e.attributes].map(n=>({shaderLocation:n.shaderLocation,offset:n.offset,format:n.format}))})))}function TC(t){return JSON.stringify([...t.entries()].map(([e,n])=>({group:e,entries:RC(n)})))}function AC(t){let e=Math.max(-1,...t.keys()),n=[];for(let i=0;i<=e;i++)n.push(CC(t,i));return n}function CC(t,e){let n=t.get(e);if(!n)throw RS(e);return n}function RC(t){return(Qr(t)?.entries??[]).map(e=>({binding:e.binding,visibility:e.visibility,buffer:e.buffer?{...e.buffer}:void 0,sampler:e.sampler?{...e.sampler}:void 0,texture:e.texture?{...e.texture}:void 0,storageTexture:e.storageTexture?{...e.storageTexture}:void 0,externalTexture:e.externalTexture?{...e.externalTexture}:void 0}))}var DC=cr("frame-state");function Wu(t){return t.service(DC,UC)}function UC(){let t=new Set,e=Pb(),n=!1,i=!1,r={time:0,deltaTime:0,frameCount:0,advanceBy(s){r.deltaTime=s,r.time+=s,i=!0},tick(){if(n)throw yu();n=!0;try{let s=Pb();i?i=!1:(r.deltaTime=Math.max(0,(s-e)/1e3),r.time+=r.deltaTime),e=s,r.frameCount+=1;for(let a of[...t])a()}finally{n=!1}},onAdvance(s){return t.add(s),()=>{t.delete(s)}}};return r}function Pb(){return globalThis.performance?.now?.()??Date.now()}function bm(t,e,n={}){let i=zt(t,"surface"),r=IC(i),s=r.get(e);if(s&&!s.disposed)throw NS(s.label);let a=new Xu(i.device,e,n,c=>{r.get(c.canvas)===c&&r.delete(c.canvas),o(),l()}),o=Wu(i).onAdvance(()=>a.applyAutoResize()),l=i.own("resource",()=>a.dispose());return r.set(e,a),a}var LC=cr("surfaces");function IC(t){return t.service(LC,()=>new Map)}var tl=0,Mm=0;function Bb(){return tl>0}function Fb(){return Mm>0}function zb(){Mm+=1}function Vb(){Mm-=1}function nl(t){return t instanceof Xu}var Xu=class{device;canvas;options;unregister;[Wp]=!0;resourceIdentity=vi("render-target");label;context;autoResize;layoutBacked;format;#e;#t;#n;#i=new Cn;#r=new Set;#s=new Set;#o;#c;#a;#l;#d=!1;#u=!1;constructor(e,n,i,r){this.device=e,this.canvas=n,this.options=i,this.unregister=r,this.label=i.label,this.#c=i.clearColor===void 0?ca:ua(i.clearColor,"surface.clearColor");let s=n.getContext("webgpu");if(!s)throw IS();if(this.context=s,this.layoutBacked=BC(n),i.autoResize===!0&&!this.layoutBacked)throw OS();this.autoResize=i.autoResize??(i.size?!1:this.layoutBacked),this.#o=Ob(i.dpr),this.format=i.format??zC(),this.#t=PC(i.depth),this.#n=OC(i.msaa),this.#e=Object.freeze({colors:Object.freeze([this.format]),depth:this.#t,sampleCount:this.#n});let a=os(n),o=FC(n,i,this.layoutBacked,this.#o);(i.size||this.layoutBacked)&&Sm(n,o);try{s.configure({device:e.gpu,format:this.format,alphaMode:i.alphaMode??"premultiplied",colorSpace:i.colorSpace??"srgb",usage:VC()}),this.#a=this.#g(o),this.#l=Object.freeze([...o])}catch(l){try{s.unconfigure?.()}catch{}if(i.size||this.layoutBacked)try{Sm(n,a)}catch{}throw l}}get gpu(){return this.context}get size(){return this.#h(),os(this.canvas)}get texelSize(){let e=this.size;return[1/e[0],1/e[1]]}get color(){return this.#h(),new Ft(this.device,this.context.getCurrentTexture(),{kind:"2d",size:this.size,format:this.format,usage:["render_attachment","texture_binding","copy_src"],label:this.options.label?`${this.options.label}.color`:"surface.color"},"external")}get colors(){return[this.color]}get depth(){return this.#h(),this.#a.depth}get sampleCount(){return this.#h(),this.#n}get dpr(){return this.#o}get clearColor(){return Qo(this.#c)}set clearColor(e){this.#c=ua(e,"surface.clearColor")}get disposed(){return this.#d}[Xp](){return this.#h(),this.#e}resize(e){if(this.#h(),this.#u)throw BS(this.options.label);this.#f(fa(e),this.#o,!0)}applyAutoResize(){if(this.#d)return;if(this.autoResize&&this.layoutBacked){let n=Ob(this.options.dpr),i=Gb(this.canvas,n);this.#f(i,n,!0);return}let e=fa(os(this.canvas));as(this.#l,e)||this.#f(e,this.#o,!1)}onResize(e){this.#h(),this.#r.add(e);let n=this.#u;this.#u=!0,tl+=1;try{e(this.#y())}finally{tl-=1,this.#u=n}return()=>{this.#r.delete(e)}}onDestroy(e){return this.#h(),this.#i.onDestroy(this,e)}onTexturesRecreated(e){return this.#h(),this.#s.add(e),()=>{this.#s.delete(e)}}renderPassDescriptor(e={}){let{clear:n=[0,0,0,1],preserve:i,clearDepth:r,clearStencil:s,depthReadOnly:a}=e;this.#h();let o=fa(os(this.canvas));as(this.#l,o)||this.#f(o,this.#o,!1);let l=this.context.getCurrentTexture();return{colorAttachments:[Gu(l,this.#a.msaaColor,n,i)],depthStencilAttachment:this.#a.depth?ku(this.#a.depth,i,r,s,a):void 0}}dispose(){if(this.#d)return;this.#d=!0;try{this.context.unconfigure?.()}catch{}let e=[];try{this.unregister(this)}catch(n){e.push(n)}this.#r.clear(),this.#s.clear();try{this.#i.emit(this)}catch(n){e.push(n)}try{_m(this.#a.all)}catch(n){e.push(n)}if(e.length)throw e[0]}#f(e,n,i){let r=!as(this.#l,e),s=!as(os(this.canvas),e);if(!r&&!s){this.#o=n;return}let a=Object.freeze([...e]),o=r?this.#g(a):this.#a,l=this.#a,c=i&&(s||r&&l.all.length>0),u=this.#u;this.#u=!0,tl+=1;try{s&&Sm(this.canvas,a),this.#o=n,this.#l=a,this.#a=o;let f=[];try{this.#p()}catch(d){f.push(d)}if(c)try{this.#m()}catch(d){f.push(d)}if(r)try{_m(l.all)}catch(d){f.push(d)}if(f.length)throw f[0]}finally{tl-=1,this.#u=u}}#p(){let e=[];for(let n of[...this.#s])try{n()}catch(i){e.push(i)}if(e.length)throw e[0]}#m(){let e=this.#y(),n=[];for(let i of[...this.#r])try{i(e)}catch(r){n.push(r)}if(n.length)throw n[0]}#y(){let e=os(this.canvas);return{width:e[0],height:e[1],dpr:this.#o,surface:this}}#h(){if(this.#d)throw PS(this.options.label)}#g(e){let n=[],i=r=>{let s=this.device.createTexture(r);return n.push(s),s};try{let r=this.#n===4?i({kind:"2d",size:e,format:this.format,usage:["render_attachment"],sampleCount:4,label:this.options.label?`${this.options.label}.color.msaa`:"surface.color.msaa"}):void 0,s=this.#t?i({kind:"2d",size:e,format:this.#t,usage:["render_attachment","texture_binding"],sampleCount:this.#n,label:this.options.label?`${this.options.label}.depth`:"surface.depth"}):void 0;return{msaaColor:r,depth:s,all:n}}catch(r){try{_m(n)}catch{}throw r}}},NC=new Set(["depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"]);function PC(t){if(!(t===void 0||t===!1)){if(t===!0)return"depth24plus";if(NC.has(t))return t;throw US(t)}}function OC(t){if(t===void 0||t===!1)return 1;if(t===!0||t===4)return 4;throw LS(t)}function _m(t){let e=[];for(let n of t)try{n.destroy()}catch(i){e.push(i)}if(e.length)throw e[0]}function BC(t){return typeof t.clientWidth=="number"}function FC(t,e,n,i){return e.size?fa(e.size):n?Gb(t,i):fa(os(t))}function Gb(t,e){let n=t;return fa([Math.round(n.clientWidth*e),Math.round(n.clientHeight*e)])}function os(t){let e=t;return[e.width,e.height]}function Sm(t,e){let n=t;n.width=e[0],n.height=e[1]}function fa(t){return[Math.max(1,Math.floor(t[0])),Math.max(1,Math.floor(t[1]))]}function Ob(t){let e=globalThis.devicePixelRatio??1;return Array.isArray(t)?Math.min(t[1],Math.max(t[0],e)):typeof t=="number"?t:e}function zC(){return globalThis.navigator?.gpu?.getPreferredCanvasFormat?.()??"bgra8unorm"}function VC(){let t=globalThis.GPUTextureUsage;return t?t.RENDER_ATTACHMENT|t.TEXTURE_BINDING|t.COPY_SRC:void 0}var GC={drawIndirect:{bytes:16,args:"4 u32 values: vertexCount, instanceCount, firstVertex, firstInstance"},drawIndexedIndirect:{bytes:20,args:"5 32-bit values: indexCount, instanceCount, firstIndex, baseVertex (signed), firstInstance"},dispatchWorkgroupsIndirect:{bytes:12,args:"3 u32 values: workgroupCountX, workgroupCountY, workgroupCountZ"}};function $b(t,e,n,i,r){let s=typeof n=="object"&&n!==null?n.buffer:void 0,a=kb(n)?n:kb(s)?s:void 0;if(!a)throw sr(t,`received ${Hb(n)}; expected a StorageBuffer or { buffer, offset? }.`,e);or(a.buffer,e,r);let o=a===n?0:n.offset??0;if(typeof o!="number"||!Number.isInteger(o)||o<0)throw sr(t,`offset must be an integer >= 0; received ${Hb(o)}.`,e);if(o%4!==0)throw sr(t,`offset must be a multiple of 4 (WebGPU requires "indirectOffset is a multiple of 4"); received ${o}.`,e);if(!a.buffer.options.usage.includes("indirect"))throw sr(t,`the buffer lacks the "indirect" usage (WebGPU requires "indirectBuffer.usage contains INDIRECT"); create it with storage(gpu, ${a.size}, { indirect: true }).`,e);let{bytes:l,args:c}=GC[i];if(o+l>a.size)throw sr(t,`${i} reads ${l} bytes (${c}) at offset ${o}, but offset + ${l} = ${o+l} exceeds the buffer size ${a.size}.`,e);return{buffer:a.gpu,offset:o}}function kb(t){return typeof t=="object"&&t!==null&&"gpu"in t&&"size"in t&&t.buffer instanceof yt}function Hb(t){if(typeof t=="string")return`"${t}"`;try{return JSON.stringify(t)??String(t)}catch{return String(t)}}var da=Symbol("vgpu.frame.drawable");function Wb(t){return t?.[da]}var kC=Symbol("vgpu.frame.bundle");function Xb(t){return t?.[kC]}var wm=Symbol("vgpu.frame.passAttachment");function qb(t){return typeof t?.[wm]=="function"?t:void 0}var HC=Symbol("vgpu.frame.compute");function Yb(t){return t?.[HC]}function Tm(t,e){return qu(zt(t,"sampler")).sampler(e)}var Zb=1;function Kb(t){let e=new Map,n=new WeakMap;return{sampler(i={}){let r=Em(i),s=e.get(r);return s||(s=t.gpu.createSampler(i),e.set(r,s),n.set(s,{kind:"sampler",id:Zb++})),s},identity(i){let r=n.get(i);return r||(r={kind:"sampler",id:Zb++},n.set(i,r)),r}}}function Em(t){if(t===null||typeof t!="object")return JSON.stringify(t);if(Array.isArray(t))return`[${t.map(Em).join(",")}]`;let e=t;return`{${Object.keys(e).sort().map(n=>`${JSON.stringify(n)}:${Em(e[n])}`).join(",")}}`}var $C=cr("render-service");function qu(t){return t.service($C,WC)}function WC(t){let e=t.device,n=Tu(),i=el(e,{errorSink:f=>t.reportError(f),registerSettledSource:f=>t.registerSettledSource(f)}),r=el(e,{errorSink:f=>t.reportError(f),registerSettledSource:f=>t.registerSettledSource(f)}),s=new Set,a=t.registerSettledSource(()=>[...s]),o=(f,d)=>{let h=db(f,d,p=>t.reportError(p));s.add(h),h.then(()=>s.delete(h),()=>s.delete(h))},l=Hu(e,o),c=$u(e,o),u=Kb(e);return t.own("service",()=>{s.clear(),a(),i.dispose(),r.dispose(),l.dispose(),c.dispose(),n.dispose()}),{binds:n,pipelines:i,computePipelines:r,shaderModules:l,pipelineLayouts:c,sampler:f=>u.sampler(f)}}var Am=new WeakSet,il=!0;function Qb(t){let e=il;il=!0;try{return[Be(t,"shader",i=>{let r=se(i,"functionExports","functionExports"),s=XC(N(i,"reflection","reflection"),"reflection");return rR(s),{wgsl:Le(i,"wgsl","wgsl",!0),reflection:s,sourceChecksum:Le(i,"sourceChecksum","sourceChecksum"),producer:Le(i,"producer","producer"),...r.present?{functionExports:Ct(r.value,"functionExports",tR)}:{}}}),il]}finally{il=e}}function Lm(t){try{return Object.isFrozen(t)}catch{return!1}}function jb(t){Lm(t)||(il=!1)}function XC(t,e){return Be(t,e,n=>({bindings:Ct(N(n,"bindings",`${e}.bindings`),`${e}.bindings`,qC),entryPoints:Ct(N(n,"entryPoints",`${e}.entryPoints`),`${e}.entryPoints`,YC),overrides:Ct(N(n,"overrides",`${e}.overrides`),`${e}.overrides`,QC),featuresRequired:Ct(N(n,"featuresRequired",`${e}.featuresRequired`),`${e}.featuresRequired`,nM),aliases:Ct(N(n,"aliases",`${e}.aliases`),`${e}.aliases`,jC),structs:Ct(N(n,"structs",`${e}.structs`),`${e}.structs`,eM),hostShareableLayouts:Ct(N(n,"hostShareableLayouts",`${e}.hostShareableLayouts`),`${e}.hostShareableLayouts`,Ju)}))}function qC(t,e){return Be(t,e,n=>{let i=se(n,"addressSpace",`${e}.addressSpace`),r=se(n,"access",`${e}.access`),s=se(n,"struct",`${e}.struct`),a=se(n,"layout",`${e}.layout`),o=se(n,"bindingLayout",`${e}.bindingLayout`);return{group:tn(N(n,"group",`${e}.group`),`${e}.group`),binding:tn(N(n,"binding",`${e}.binding`),`${e}.binding`),name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),type:xn(N(n,"type",`${e}.type`),`${e}.type`),kind:nt(N(n,"kind",`${e}.kind`),`${e}.kind`,["buffer","texture","sampler","externalTexture","unknown"]),...i.present?{addressSpace:nt(i.value,`${e}.addressSpace`,["function","private","workgroup","uniform","storage","handle"])}:{},...r.present?{access:nt(r.value,`${e}.access`,["read","write","read_write"])}:{},...s.present?{struct:eM(s.value,`${e}.struct`)}:{},...a.present?{layout:Ju(a.value,`${e}.layout`)}:{},...o.present?{bindingLayout:iR(o.value,`${e}.bindingLayout`)}:{}}})}function YC(t,e){return Be(t,e,n=>{let i=nt(N(n,"stage",`${e}.stage`),`${e}.stage`,["vertex","fragment","compute"]),r=se(n,"workgroupSize",`${e}.workgroupSize`),s=se(n,"inputs",`${e}.inputs`);i==="vertex"&&!s.present&&T(`${e}.inputs`,"vertex entries require input metadata"),i!=="compute"&&r.present&&T(`${e}.workgroupSize`,"only compute entries may declare a workgroup size");let a=r.present?ZC(r.value,`${e}.workgroupSize`):void 0;return i==="compute"&&a===void 0&&T(`${e}.workgroupSize`,"compute entries require workgroup metadata"),{name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),stage:i,...a?{workgroupSize:a}:{},bindings:Ct(N(n,"bindings",`${e}.bindings`),`${e}.bindings`,Dm),samplingPairs:Ct(N(n,"samplingPairs",`${e}.samplingPairs`),`${e}.samplingPairs`,JC),...s.present?{inputs:Ct(s.value,`${e}.inputs`,KC)}:{}}})}function ZC(t,e){let n=Ct(t,e,(i,r)=>i==="unresolved"?Number.NaN:lR(i,r));return n.length!==3&&T(e,"expected exactly three workgroup axes"),n}function KC(t,e){return Be(t,e,n=>({name:Le(n,"name",`${e}.name`),location:tn(N(n,"location",`${e}.location`),`${e}.location`),type:xn(N(n,"type",`${e}.type`),`${e}.type`)}))}function Dm(t,e){return Be(t,e,n=>({group:tn(N(n,"group",`${e}.group`),`${e}.group`),binding:tn(N(n,"binding",`${e}.binding`),`${e}.binding`)}))}function JC(t,e){return Be(t,e,n=>({texture:Dm(N(n,"texture",`${e}.texture`),`${e}.texture`),sampler:Dm(N(n,"sampler",`${e}.sampler`),`${e}.sampler`),mode:nt(N(n,"mode",`${e}.mode`),`${e}.mode`,["filtering","comparison"])}))}function QC(t,e){return Be(t,e,n=>{let i=se(n,"id",`${e}.id`),r=se(n,"defaultValue",`${e}.defaultValue`);return{name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),...i.present?{id:tn(i.value,`${e}.id`)}:{},...r.present?{defaultValue:Rn(r.value,`${e}.defaultValue`)}:{}}})}function jC(t,e){return Be(t,e,n=>({name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),target:xn(N(n,"target",`${e}.target`),`${e}.target`)}))}function eM(t,e){return Be(t,e,n=>({name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),members:Ct(N(n,"members",`${e}.members`),`${e}.members`,eR)}))}function eR(t,e){return Be(t,e,n=>{let i=se(n,"align",`${e}.align`),r=se(n,"size",`${e}.size`);return{name:Le(n,"name",`${e}.name`),type:xn(N(n,"type",`${e}.type`),`${e}.type`),...i.present?{align:Ku(i.value,`${e}.align`)}:{},...r.present?{size:tn(r.value,`${e}.size`)}:{}}})}function tR(t,e){return Be(t,e,n=>({name:Le(n,"name",`${e}.name`),resolvedName:Le(n,"resolvedName",`${e}.resolvedName`),parameterNames:Ct(N(n,"parameterNames",`${e}.parameterNames`),`${e}.parameterNames`,nM)}))}function xn(t,e){return Be(t,e,n=>{let i=Rn(N(n,"kind",`${e}.kind`),`${e}.kind`);switch(i){case"scalar":return{kind:i,name:nt(N(n,"name",`${e}.name`),`${e}.name`,["f32","f16","i32","u32","bool"])};case"atomic":return{kind:i,element:xn(N(n,"element",`${e}.element`),`${e}.element`)};case"vector":return{kind:i,width:nt(N(n,"width",`${e}.width`),`${e}.width`,[2,3,4]),element:xn(N(n,"element",`${e}.element`),`${e}.element`)};case"matrix":return{kind:i,columns:nt(N(n,"columns",`${e}.columns`),`${e}.columns`,[2,3,4]),rows:nt(N(n,"rows",`${e}.rows`),`${e}.rows`,[2,3,4]),element:xn(N(n,"element",`${e}.element`),`${e}.element`)};case"array":{let r=se(n,"count",`${e}.count`),s=se(n,"countExpression",`${e}.countExpression`);return{kind:i,element:xn(N(n,"element",`${e}.element`),`${e}.element`),...r.present?{count:Nm(r.value,`${e}.count`)}:{},...s.present?{countExpression:Rn(s.value,`${e}.countExpression`)}:{}}}case"ptr":{let r=se(n,"access",`${e}.access`);return{kind:i,addressSpace:Rn(N(n,"addressSpace",`${e}.addressSpace`),`${e}.addressSpace`),element:xn(N(n,"element",`${e}.element`),`${e}.element`),...r.present?{access:Rn(r.value,`${e}.access`)}:{}}}case"sampler":return{kind:i,comparison:Pm(N(n,"comparison",`${e}.comparison`),`${e}.comparison`)};case"texture":{let r=se(n,"dimension",`${e}.dimension`),s=se(n,"sampleType",`${e}.sampleType`),a=se(n,"texelFormat",`${e}.texelFormat`),o=se(n,"access",`${e}.access`);return{kind:i,textureKind:Rn(N(n,"textureKind",`${e}.textureKind`),`${e}.textureKind`),...r.present?{dimension:nt(r.value,`${e}.dimension`,["1d","2d","2d_array","3d","cube","cube_array","multisampled_2d","depth_2d","depth_2d_array","depth_cube","depth_cube_array","depth_multisampled_2d"])}:{},...s.present?{sampleType:xn(s.value,`${e}.sampleType`)}:{},...a.present?{texelFormat:Rn(a.value,`${e}.texelFormat`)}:{},...o.present?{access:nt(o.value,`${e}.access`,["read","write","read_write"])}:{}}}case"identifier":{let r=se(n,"mangledName",`${e}.mangledName`);return{kind:i,name:Le(n,"name",`${e}.name`),...r.present?{mangledName:Rn(r.value,`${e}.mangledName`)}:{}}}default:return T(`${e}.kind`,`unknown WGSL type '${i}'`)}})}function Ju(t,e){return Be(t,e,n=>{let i=se(n,"size",`${e}.size`),r=se(n,"stride",`${e}.stride`),s=se(n,"members",`${e}.members`),a=se(n,"element",`${e}.element`),o=se(n,"runtimeSized",`${e}.runtimeSized`),l={name:Le(n,"name",`${e}.name`),mangledName:Le(n,"mangledName",`${e}.mangledName`),layoutMode:nt(N(n,"layoutMode",`${e}.layoutMode`),`${e}.layoutMode`,["wgsl-host-shareable-v1"]),type:xn(N(n,"type",`${e}.type`),`${e}.type`),align:Ku(N(n,"align",`${e}.align`),`${e}.align`),...i.present?{size:tn(i.value,`${e}.size`)}:{},...r.present?{stride:Nm(r.value,`${e}.stride`)}:{},...s.present?{members:Ct(s.value,`${e}.members`,nR)}:{},...a.present?{element:Ju(a.value,`${e}.element`)}:{},...o.present?{runtimeSized:Pm(o.value,`${e}.runtimeSized`)}:{}};return sR(l,e),l})}function nR(t,e){return Be(t,e,n=>{let i=se(n,"size",`${e}.size`),r=se(n,"explicitAlign",`${e}.explicitAlign`),s=se(n,"explicitSize",`${e}.explicitSize`);return{name:Le(n,"name",`${e}.name`),offset:tn(N(n,"offset",`${e}.offset`),`${e}.offset`),align:Ku(N(n,"align",`${e}.align`),`${e}.align`),...i.present?{size:tn(i.value,`${e}.size`)}:{},type:xn(N(n,"type",`${e}.type`),`${e}.type`),layout:Ju(N(n,"layout",`${e}.layout`),`${e}.layout`),...r.present?{explicitAlign:Ku(r.value,`${e}.explicitAlign`)}:{},...s.present?{explicitSize:tn(s.value,`${e}.explicitSize`)}:{}}})}function iR(t,e){return Be(t,e,n=>{let i=Rn(N(n,"kind",`${e}.kind`),`${e}.kind`);switch(i){case"buffer":return{kind:i,buffer:Be(N(n,"buffer",`${e}.buffer`),`${e}.buffer`,r=>{let s=se(r,"minBindingSize",`${e}.buffer.minBindingSize`);return N(r,"hasDynamicOffset",`${e}.buffer.hasDynamicOffset`)!==!1&&T(`${e}.buffer.hasDynamicOffset`,"prepared layouts require false"),{type:nt(N(r,"type",`${e}.buffer.type`),`${e}.buffer.type`,["uniform","storage","read-only-storage"]),hasDynamicOffset:!1,...s.present?{minBindingSize:tn(s.value,`${e}.buffer.minBindingSize`)}:{}}})};case"sampler":return{kind:i,sampler:Be(N(n,"sampler",`${e}.sampler`),`${e}.sampler`,r=>({type:nt(N(r,"type",`${e}.sampler.type`),`${e}.sampler.type`,["filtering","non-filtering","comparison"])}))};case"texture":return{kind:i,texture:Be(N(n,"texture",`${e}.texture`),`${e}.texture`,r=>({sampleType:nt(N(r,"sampleType",`${e}.texture.sampleType`),`${e}.texture.sampleType`,["float","unfilterable-float","depth","sint","uint"]),viewDimension:nt(N(r,"viewDimension",`${e}.texture.viewDimension`),`${e}.texture.viewDimension`,["1d","2d","2d-array","cube","cube-array","3d"]),multisampled:Pm(N(r,"multisampled",`${e}.texture.multisampled`),`${e}.texture.multisampled`)}))};case"storageTexture":return{kind:i,storageTexture:Be(N(n,"storageTexture",`${e}.storageTexture`),`${e}.storageTexture`,r=>({access:nt(N(r,"access",`${e}.storageTexture.access`),`${e}.storageTexture.access`,["write-only","read-only","read-write"]),format:Le(r,"format",`${e}.storageTexture.format`),viewDimension:nt(N(r,"viewDimension",`${e}.storageTexture.viewDimension`),`${e}.storageTexture.viewDimension`,["1d","2d","2d-array","cube","cube-array","3d"])}))};case"externalTexture":return{kind:i,externalTexture:Be(N(n,"externalTexture",`${e}.externalTexture`),`${e}.externalTexture`,()=>({}))};default:return T(`${e}.kind`,`unknown binding layout '${i}'`)}})}function rR(t){let e=new Map;for(let[s,a]of t.bindings.entries()){let o=Zu(a);if(e.has(o)&&T(`reflection.bindings[${s}]`,`duplicate binding coordinate ${o}`),e.set(o,a),a.kind==="buffer"){let l=`reflection.bindings[${s}]`,c=a.bindingLayout;c?.kind!=="buffer"&&T(`${l}.bindingLayout`,"does not match binding kind 'buffer'"),a.addressSpace!=="uniform"&&a.addressSpace!=="storage"&&T(`${l}.addressSpace`,"buffer bindings require a uniform or storage address space"),a.layout||T(`${l}.layout`,"buffer bindings require host-shareable packing metadata");let u=a.addressSpace==="uniform"?"uniform":a.access==="read"?"read-only-storage":"storage";c.buffer.type!==u&&T(`${l}.bindingLayout.buffer.type`,`does not match ${a.addressSpace}${a.access?`/${a.access}`:""} buffer metadata`)}else{let l=a.kind==="sampler"?"sampler":a.kind==="externalTexture"?"externalTexture":void 0;l&&a.bindingLayout?.kind!==l&&T(`reflection.bindings[${s}].bindingLayout`,`does not match binding kind '${a.kind}'`),a.kind==="texture"&&a.bindingLayout&&a.bindingLayout.kind!=="texture"&&a.bindingLayout.kind!=="storageTexture"&&T(`reflection.bindings[${s}].bindingLayout`,"does not describe a texture binding")}}Rm(t.structs,"reflection.structs"),Rm(t.aliases,"reflection.aliases"),Rm(t.overrides,"reflection.overrides"),oR(t.featuresRequired,"reflection.featuresRequired");let n=new Set;for(let[s,a]of t.entryPoints.entries()){n.has(a.name)&&T(`reflection.entryPoints[${s}].name`,`duplicate entry identity '${a.name}'`),n.add(a.name);let o=new Set;for(let[u,f]of(a.bindings??[]).entries()){let d=Zu(f);e.has(d)||T(`reflection.entryPoints[${s}].bindings[${u}]`,`dangling binding reference ${d}`),o.has(d)&&T(`reflection.entryPoints[${s}].bindings[${u}]`,`duplicate binding reference ${d}`),o.add(d)}let l=new Set;for(let[u,f]of(a.inputs??[]).entries())l.has(f.location)&&T(`reflection.entryPoints[${s}].inputs[${u}].location`,`duplicate vertex input location ${f.location}`),l.add(f.location);let c=new Set;for(let[u,f]of(a.samplingPairs??[]).entries()){let d=Zu(f.texture),h=Zu(f.sampler),p=e.get(d),x=e.get(h);(!o.has(d)||!p)&&T(`reflection.entryPoints[${s}].samplingPairs[${u}].texture`,`dangling or inactive texture reference ${d}`),(!o.has(h)||!x)&&T(`reflection.entryPoints[${s}].samplingPairs[${u}].sampler`,`dangling or inactive sampler reference ${h}`),p.bindingLayout?.kind!=="texture"&&p.bindingLayout?.kind!=="externalTexture"&&T(`reflection.entryPoints[${s}].samplingPairs[${u}].texture`,"reference is not a sampled texture"),x.bindingLayout?.kind!=="sampler"&&T(`reflection.entryPoints[${s}].samplingPairs[${u}].sampler`,"reference is not a sampler"),f.mode==="comparison"!=(x.bindingLayout.sampler.type==="comparison")&&T(`reflection.entryPoints[${s}].samplingPairs[${u}].mode`,"does not match the referenced sampler type");let b=`${d}|${h}|${f.mode}`;c.has(b)&&T(`reflection.entryPoints[${s}].samplingPairs[${u}]`,"duplicate sampling relationship"),c.add(b)}}let i=new Map;for(let s of t.structs)i.set(s.name,s),i.set(s.mangledName,s);let r=new Map;for(let s of t.aliases)r.set(s.name,s),r.set(s.mangledName,s);aR(t,(s,a)=>{s.kind==="identifier"&&!i.has(s.mangledName??s.name)&&!r.has(s.mangledName??s.name)&&T(a,`unknown type reference '${s.mangledName??s.name}'`)});for(let[s,a]of t.bindings.entries()){let o=`reflection.bindings[${s}]`,l=ha(a.type,i,r,new Set,`${o}.type`);if(a.struct){let c=i.get(a.struct.mangledName)??i.get(a.struct.name);(!c||!Wn(c,a.struct))&&T(`${o}.struct`,"does not match a canonical reflected struct");let u=l.kind==="identifier"?i.get(l.mangledName??l.name):void 0;(!u||!Wn(u,a.struct))&&T(`${o}.struct`,"does not match the alias-resolved binding type")}if(a.layout){(a.layout.name!==a.name||a.layout.mangledName!==a.mangledName)&&T(`${o}.layout`,"does not belong to the binding identity");let c=t.hostShareableLayouts.find(u=>u.name===a.layout.name&&u.mangledName===a.layout.mangledName);(!c||!Wn(c,a.layout))&&T(`${o}.layout`,"does not match a canonical host-shareable layout"),Wn(l,a.layout.type)||T(`${o}.layout.type`,"does not match the alias-resolved binding type"),a.bindingLayout?.kind==="buffer"&&a.bindingLayout.buffer.minBindingSize!==a.layout.size&&T(`${o}.bindingLayout.buffer.minBindingSize`,"does not match the host-shareable layout size")}}t.hostShareableLayouts.forEach((s,a)=>Um(s,`reflection.hostShareableLayouts[${a}]`,i,r))}function sR(t,e){let n=t.element!==void 0||t.stride!==void 0||t.members!==void 0;switch(t.stride!==void 0&&(t.element||T(`${e}.element`,"stride requires element metadata"),t.stride%t.element.align!==0&&T(`${e}.stride`,"must be aligned to the element alignment"),t.element.size!==void 0&&t.stride<t.element.size&&T(`${e}.stride`,"must not be smaller than the element size")),t.runtimeSized&&(t.type.kind!=="array"||t.type.count!==void 0||t.size!==void 0||!t.element||t.stride===void 0)&&T(`${e}.runtimeSized`,"is inconsistent with runtime-sized array metadata"),(t.type.kind==="array"||t.type.kind==="matrix")&&((!t.element||t.stride===void 0)&&T(e,`${t.type.kind} layout requires element and stride metadata`),t.type.kind==="array"&&t.type.count!==void 0&&t.size!==t.stride*t.type.count&&T(`${e}.size`,"does not match array count and stride")),t.type.kind){case"scalar":{t.type.name==="bool"&&T(`${e}.type`,"bool is not host-shareable");let s=t.type.name==="f16"?2:4;Cm(t,e,s,s,n);break}case"atomic":(t.type.element.kind!=="scalar"||t.type.element.name!=="i32"&&t.type.element.name!=="u32")&&T(`${e}.type.element`,"atomic layout requires i32 or u32 scalar storage"),Cm(t,e,4,4,n);break;case"vector":{let s=t.type.element;(s.kind!=="scalar"||s.name==="bool")&&T(`${e}.type.element`,"vector layout requires a numeric scalar");let a=s.name==="f16"?2:4;Cm(t,e,t.type.width===2?a*2:a*4,a*t.type.width,n);break}case"matrix":{let s=t.type.element;(s.kind!=="scalar"||s.name!=="f32"&&s.name!=="f16")&&T(`${e}.type.element`,"matrix layout requires an f32 or f16 scalar"),(!t.element||t.element.type.kind!=="vector"||t.element.type.width!==t.type.rows||!Wn(t.element.type.element,s))&&T(`${e}.element.type`,"does not match the matrix column vector");let a=Yu(t.element.align,Jb(t.element,`${e}.element`));t.align!==t.element.align&&T(`${e}.align`,"does not match the matrix column alignment"),t.stride!==a&&T(`${e}.stride`,"does not match the matrix column stride"),t.size!==a*t.type.columns&&T(`${e}.size`,"does not match matrix columns and stride"),t.members&&T(`${e}.members`,"matrix layouts cannot contain struct members");break}case"array":{(!t.element||!Wn(t.element.type,t.type.element))&&T(`${e}.element.type`,"does not match the array element type");let s=Yu(t.element.align,Jb(t.element,`${e}.element`));t.align!==t.element.align&&T(`${e}.align`,"does not match the array element alignment"),t.stride!==s&&T(`${e}.stride`,"does not match the array element stride"),t.runtimeSized!==(t.type.count===void 0)&&T(`${e}.runtimeSized`,"does not match the array count"),t.members&&T(`${e}.members`,"array layouts cannot contain struct members");break}case"identifier":(!t.members||t.element||t.stride!==void 0||t.runtimeSized!==void 0)&&T(e,"struct layout shape is incomplete or contains array metadata");break;default:T(`${e}.type`,`type '${t.type.kind}' cannot have a host-shareable layout`)}if(!t.members)return;let i=0,r=1;for(let[s,a]of t.members.entries()){let o=`${e}.members[${s}]`,l=Math.max(a.layout.align,a.explicitAlign??1),c=Math.max(a.layout.size??0,a.explicitSize??0);a.align!==l&&T(`${o}.align`,"does not match intrinsic/explicit alignment"),a.size!==c&&T(`${o}.size`,"does not match intrinsic/explicit size");let u=Yu(a.align,i);a.offset!==u&&T(`${o}.offset`,"does not match the aligned preceding bound"),i=a.offset+(a.size??0),a.layout.runtimeSized&&s!==t.members.length-1&&T(o,"runtime-sized arrays must be the final member"),r=Math.max(r,a.align)}t.align!==r&&T(`${e}.align`,"does not match the maximum member alignment"),t.size!==Yu(r,i)&&T(`${e}.size`,"does not match the rounded containing bound")}function Um(t,e,n,i){let r=ha(t.type,n,i,new Set,`${e}.type`);if(r.kind==="identifier"){let s=n.get(r.mangledName??r.name);s||T(`${e}.type`,`unknown struct '${r.mangledName??r.name}'`),(!t.members||t.members.length!==s.members.length)&&T(`${e}.members`,"does not match the canonical struct member count");for(let a=0;a<s.members.length;a++){let o=s.members[a],l=t.members[a];(l.name!==o.name||!Wn(l.type,o.type))&&T(`${e}.members[${a}]`,"does not match the canonical struct member"),l.explicitAlign!==o.align&&T(`${e}.members[${a}].explicitAlign`,"does not match the canonical struct member align attribute"),l.explicitSize!==o.size&&T(`${e}.members[${a}].explicitSize`,"does not match the canonical struct member size attribute");let c=ha(o.type,n,i,new Set,`${e}.members[${a}].type`);Wn(c,l.layout.type)||T(`${e}.members[${a}].layout.type`,"does not match the resolved member type")}}t.members?.forEach((s,a)=>Um(s.layout,`${e}.members[${a}].layout`,n,i)),t.element&&Um(t.element,`${e}.element`,n,i)}function ha(t,e,n,i,r){switch(t.kind){case"identifier":{let s=t.mangledName??t.name;if(e.has(s))return t;let a=n.get(s);a||T(r,`unknown type reference '${s}'`),i.has(s)&&T(r,`cyclic alias reference '${s}'`),i.add(s);try{return ha(a.target,e,n,i,r)}finally{i.delete(s)}}case"array":case"atomic":case"vector":case"matrix":case"ptr":return{...t,element:ha(t.element,e,n,i,`${r}.element`)};case"texture":return{...t,...t.sampleType?{sampleType:ha(t.sampleType,e,n,i,`${r}.sampleType`)}:{}};default:return t}}function Cm(t,e,n,i,r){t.align!==n&&T(`${e}.align`,`expected intrinsic alignment ${n}`),t.size!==i&&T(`${e}.size`,`expected intrinsic size ${i}`),(r||t.runtimeSized!==void 0)&&T(e,"leaf layout contains composite metadata")}function Jb(t,e){return t.size===void 0&&T(`${e}.size`,"element layout must have a fixed size"),t.size}function Yu(t,e){return Math.ceil(e/t)*t}function aR(t,e){let n=(r,s)=>{e(r,s),"element"in r&&n(r.element,`${s}.element`),r.kind==="texture"&&r.sampleType&&n(r.sampleType,`${s}.sampleType`)};t.bindings.forEach((r,s)=>n(r.type,`reflection.bindings[${s}].type`)),t.entryPoints.forEach((r,s)=>r.inputs?.forEach((a,o)=>n(a.type,`reflection.entryPoints[${s}].inputs[${o}].type`))),t.aliases.forEach((r,s)=>n(r.target,`reflection.aliases[${s}].target`)),t.structs.forEach((r,s)=>r.members.forEach((a,o)=>n(a.type,`reflection.structs[${s}].members[${o}].type`)));let i=(r,s)=>{n(r.type,`${s}.type`),r.members?.forEach((a,o)=>{n(a.type,`${s}.members[${o}].type`),i(a.layout,`${s}.members[${o}].layout`)}),r.element&&i(r.element,`${s}.element`)};t.hostShareableLayouts.forEach((r,s)=>i(r,`reflection.hostShareableLayouts[${s}]`))}function Rm(t,e){let n=new Set,i=new Set;for(let[r,s]of t.entries())n.has(s.name)&&T(`${e}[${r}].name`,`duplicate identity '${s.name}'`),i.has(s.mangledName)&&T(`${e}[${r}].mangledName`,`duplicate identity '${s.mangledName}'`),n.add(s.name),i.add(s.mangledName)}function oR(t,e){let n=new Set;for(let[i,r]of t.entries())n.has(r)&&T(`${e}[${i}]`,`duplicate value '${r}'`),n.add(r)}function Zu(t){return`${t.group}:${t.binding}`}function Wn(t,e){if(Object.is(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;if(Array.isArray(t)||Array.isArray(e))return Array.isArray(t)&&Array.isArray(e)&&t.length===e.length&&t.every((r,s)=>Wn(r,e[s]));let n=Object.entries(t),i=Object.entries(e);return n.length===i.length&&n.every(([r,s])=>Object.hasOwn(e,r)&&Wn(s,e[r]))}function Ct(t,e,n){return Array.isArray(t)||T(e,"expected an array"),jb(t),tM(t,e,()=>{let i=[];for(let r=0;r<t.length;r++){let s=Im(t,String(r),`${e}[${r}]`);s||T(`${e}[${r}]`,"sparse arrays are not allowed"),"value"in s||T(`${e}[${r}]`,"accessor array elements are not allowed"),i.push(n(s.value,`${e}[${r}]`))}return i})}function Be(t,e,n){(typeof t!="object"||t===null||Array.isArray(t))&&T(e,"expected a plain data object"),jb(t);let i;try{i=Object.getPrototypeOf(t)}catch{return T(e,"could not inspect object prototype")}return i!==Object.prototype&&i!==null&&T(e,"expected a plain data object"),tM(t,e,()=>n(t))}function tM(t,e,n){Am.has(t)&&T(e,"cyclic metadata is not allowed"),Am.add(t);try{return n()}finally{Am.delete(t)}}function N(t,e,n){let i=Im(t,e,n);return i||T(n,"missing required own data property"),"value"in i||T(n,"accessor properties are not allowed"),i.value===void 0&&T(n,"undefined is not JSON-compatible"),i.value}function se(t,e,n){let i=Im(t,e,n);return i?("value"in i||T(n,"accessor properties are not allowed"),i.value===void 0&&T(n,"optional undefined properties must be omitted"),{present:!0,value:i.value}):{present:!1}}function Im(t,e,n){try{return Object.getOwnPropertyDescriptor(t,e)}catch{return T(n,"could not read its own property descriptor")}}function Le(t,e,n,i=!1){let r=N(t,e,n);return i&&typeof r=="string"?r:Rn(r,n)}function nM(t,e){return Rn(t,e)}function Rn(t,e){return(typeof t!="string"||t.length===0)&&T(e,"expected a nonempty string"),t}function lR(t,e){return(typeof t!="number"||!Number.isFinite(t))&&T(e,"expected a finite number or 'unresolved'"),t}function tn(t,e){return(typeof t!="number"||!Number.isSafeInteger(t)||t<0)&&T(e,"expected a non-negative safe integer"),t}function Nm(t,e){let n=tn(t,e);return n===0&&T(e,"expected a positive integer"),n}function Ku(t,e){let n=Nm(t,e);return Number.isInteger(Math.log2(n))||T(e,"expected a positive power of two"),n}function Pm(t,e){return typeof t!="boolean"&&T(e,"expected a boolean"),t}function nt(t,e,n){return n.includes(t)||T(e,`expected one of ${n.map(String).join(", ")}`),t}function T(t,e){throw $n(t,e)}var cR=0xcbf29ce484222325n,uR=0x100000001b3n,fR=0xffffffffffffffffn;function rM(t){let e=cR;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);e=iM(e,i&255),e=iM(e,i>>>8)}return`fnv1a64-utf16le-v1:${e.toString(16).padStart(16,"0")}`}function iM(t,e){return(t^BigInt(e))*uR&fR}var sM=new WeakMap;function aM(t){if(typeof t=="string")throw kp();if(typeof t!="object"||t===null||Array.isArray(t))throw $n("shader","expected a prepared ShaderSource object");let e=sM.get(t);if(e?.snapshot)return e.snapshot;let n=Lm(t),i=dR(t,"version");if(i===1)throw kp();if(typeof i=="number"&&Number.isInteger(i)&&i!==2)throw GS(i,hR(t,"producer"));if(i!==2)throw $n("version","expected integer artifact version 2");let[r,s]=Qb(t);if(!/^fnv1a64-utf16le-v1:[0-9a-f]{16}$/.test(r.sourceChecksum))throw $n("sourceChecksum","expected fnv1a64-utf16le-v1 followed by 16 lowercase hexadecimal digits");if(e?.wgsl!==r.wgsl&&sM.set(t,e={wgsl:r.wgsl,checksum:rM(r.wgsl)}),r.sourceChecksum!==e.checksum)throw $n("sourceChecksum","checksum does not match wgsl");let a=oM({wgsl:r.wgsl,reflection:r.reflection,...r.functionExports!==void 0?{functionExports:r.functionExports}:{}});return n&&s&&(e.snapshot=a),a}function dR(t,e){let n;try{n=Object.getOwnPropertyDescriptor(t,e)}catch{throw $n(e,"could not read its own property descriptor")}if(!n)throw $n(e,"missing required own data property");if(!("value"in n))throw $n(e,"accessor properties are not allowed");return n.value}function hR(t,e){let n;try{n=Object.getOwnPropertyDescriptor(t,e)}catch{return}return n&&"value"in n&&typeof n.value=="string"&&n.value.length>0?n.value:void 0}function oM(t){if(typeof t!="object"||t===null||Object.isFrozen(t))return t;for(let e of Object.values(t))oM(e);return Object.freeze(t)}var pR=1,Bm=new WeakMap,pa=Symbol("no cleanup failure"),ef=class{label;#e=new Map;constructor(e,n,i,r=Tu(),s,a=el(e),o=Hu(e),l=$u(e),c,u,f){ye(e,"Draw.constructor"),this.label=i.label??"draw";let d=pR++,h=n.reflection,p=TR(this.label,i.entry),x=f?.entry??vm(this.label,h.entryPoints,"vertex",p.vertex,"draw"),b=vm(this.label,h.entryPoints,"fragment",p.fragment,"draw"),g=AR(x,b),m=[x,b].filter(v=>!!v),y=gb(h.bindings,m);mR(e,this.label,h.bindings,m,y);let _=i.geometry,S=x?ns(x,"inputs",this.label):[],A=_&&Go in _?_[Go](S,`${this.label}.geometry`):_?.vertexBufferLayouts,E=new Map(yb(e,this.label,h,y)),U=l.get(E),L=o.get(n.wgsl,`${this.label}.shader`),P=f?o.get(f.source,`${this.label}.fullscreen.shader`):L,$=WR(),_e={label:this.label,recordedIn:$},Re=SR(this.label,i),Z=MR(this.label,i,Re),I=CR(e,this.label,i),W=IR(e,this.label,i),Ee=BR(this.label,i),Fe=VR(this.label,i),Ie=Nb(this.label,i.constants,h.overrides,"draw"),Ze=this.label,ze=Eb({device:e,label:this.label,reflection:h,bindGroupLayouts:E,cache:r,disposedError:v=>Pp(Ze,v)}),{set:ce,...Ne}=i;Bm.set(this,{id:d,device:e,opts:Ne,vertexBufferLayouts:A,cache:r,defaultTarget:s,reflection:h,visibility:y,vertexEntry:x?.name??"vs_main",fragmentEntry:b?.name??"fs_main",entryKey:g,setCore:ze,bindGroupLayouts:E,pipelineLayout:U,vertexShaderModule:P,fragmentShaderModule:L,pipelineStore:a,pipelineLayouts:l,errorSink:c,trackSettled:u,resolvedPipelineKeys:new Set,pipelineKeys:!A||Go in _?new WeakMap:void 0,pipelineKeyDerivations:0,lifecycle:_e,...Re,...Z,...I,...W,...Ee,...Fe,...Ie}),ce&&this.set(ce);for(let v of i.targets??[])this.compileSync(v)}get gpu(){let e=it(this,"gpu");for(let n of e.resolvedPipelineKeys){let i=e.pipelineStore.getReady(n);if(i)return i}}get targets(){return it(this,"targets").opts.targets}dispose(){let e=wM(this);if("disposed"in e)return;Bm.set(this,{disposed:!0,label:this.label});let n=pa;try{e.lifecycle.recordedIn.markStale({kind:"draw-disposed",drawLabel:e.lifecycle.label})}catch(i){n=i}this.#e.clear();try{e.setCore.dispose()}catch(i){n===pa&&(n=i)}if(n!==pa)throw n}assertUsable(e){it(this,e)}get[da](){return it(this,"drawable"),this}writesDepth(){return HR(this)}stencilWritingOps(){return $R(this)}set(e){let n=it(this,"set");ye(n.device,`${this.label}.set`);for(let i of n.setCore.set(e))n.lifecycle.recordedIn.markStale({kind:"binding-identity",drawLabel:n.lifecycle.label,...i});return this}group(e,n){let i=it(this,"group");ye(i.device,`${this.label}.group`);let r=this.#e.get(e)??this.layout(e),s=i.setCore.claimGroup(e,n,r);return i.lifecycle.recordedIn.markStale({kind:"group-claim",drawLabel:i.lifecycle.label,group:e,previousIdentity:s,newIdentity:`claimed-group:${e}`}),this}layout(e,n={}){let i=it(this,"layout");return ye(i.device,`${this.label}.layout`),n.dynamicOffsets?this.#t(e):i.setCore.layout(e)}#t(e){let n=it(this);n.setCore.layout(e);let i=this.#e.get(e);if(i)return i;let r=qR(this,e),s=lm(n.device,`${this.label}.group${e}.dynamic.bgl`,r);return this.#e.set(e,s),n.bindGroupLayouts.set(e,s),n.setCore.refreshLayouts(),n.pipelineLayout=n.pipelineLayouts.get(n.bindGroupLayouts),s}draw(e={}){let n=it(this,"draw");ye(n.device,`${this.label}.draw`);let i=fr(e)?{target:e}:e,r=it(this,"draw"),s=i.target??r.defaultTarget;if(!s)throw Fo(`${this.label}.draw`);ZR(s,`${this.label}.draw`),r.setCore.preflight();let a=r.device.gpu.createCommandEncoder(),o=a.beginRenderPass(s.renderPassDescriptor()),l=[];try{this.encode(o,s,i,d=>l.push(d))}catch(d){xt(l),Cu(r.device);try{o.end()}catch{}throw d}Du(r.device,o,l,l[0]?.context);let c,u=l[0]?.context;u&&is(r.device,u);try{c=a.finish()}catch(d){let h=u?Vt(r.device):void 0;xt(l),h&&xt([h]);let p=h?.context??u;if(p){yM(r,p.label,p.group,d);return}throw d}if(u){let d=Vt(r.device);d&&(l[0]=l[0]?oa(d,l[0]):d)}let f=l[0]?.context;f&&is(r.device,f);try{r.device.gpu.queue.submit([c])}catch(d){let h=f?Vt(r.device):void 0;xt(l),h&&xt([h]);let p=h?.context??f;if(p){yM(r,p.label,p.group,d);return}throw d}if(f){let d=Vt(r.device);d&&(l[0]=l[0]?oa(d,l[0]):d)}if(l.length){let d=Ru(r.device,l,{errorSink:r.errorSink});r.trackSettled?.(d)}}encode(e,n,i={},r,s){let a=it(this,"encode");ye(a.device,`${this.label}.encode`),a.setCore.preflight();let o=this.pipelineFor(n);if(o){e.setPipeline(o),a.blendConstant&&e.setBlendConstant(a.blendConstant),a.stencilRef!==void 0&&e.setStencilReference(a.stencilRef);for(let l of a.setCore.bindGroups(s))this.#n(a,e,l,i,r);this.#a(a,e,i)}}#n(e,n,i,r,s){let a=XR(r.offsets,i.group,i.offsets);if(!i.claimValidation||!s){n.setBindGroup(i.group,i.bindGroup,a);return}is(e.device,i.claimValidation);try{n.setBindGroup(i.group,i.bindGroup,a)}catch(l){throw eb(e.device),Gn(i.claimValidation.label,i.claimValidation.group,l)}let o=Vt(e.device);o&&s(o)}compile(e){return this.#i("compile",e,()=>this)}#i(e,n,i){let r=it(this,e);ye(r.device,`${this.label}.${e}`);let{key:s,signature:a,signatureKey:o}=this.#s(r,n,e);return r.pipelineStore.getAsync(s,()=>r.device.gpu.createRenderPipelineAsync(this.#d(r,a)),{where:`${this.label}.${e}`,signature:o,dependencies:fM(r)}).then(c=>{let u=it(this,e);return ye(u.device,`${this.label}.${e}`),u.resolvedPipelineKeys.add(s),i(c)},c=>{throw it(this,e),c})}compileSync(e){return this.#r("compileSync",e,!0),this}pipelineFor(e){return this.#r("pipelineFor",e)}#r(e,n,i){let r=it(this,e);ye(r.device,`${this.label}.${e}`);let{key:s,create:a,ctx:o}=this.#s(r,n,e),l=r.pipelineStore.getSync(s,a,i?{...o,where:`${this.label}.${e}`,retry:i}:o);return l&&r.resolvedPipelineKeys.add(s),l}pipelineForAsync(e){return this.#i("pipelineForAsync",e,n=>n)}#s(e,n,i){let r=n??e.defaultTarget,s=e.opts.geometry,a=r&&e.pipelineKeys?.get(r);if(a&&a.pipelineLayout===e.pipelineLayout&&a.topology===s?.topology&&a.stripIndexFormat===ju(s)&&vR(r,a.signature))return a;e.pipelineKeyDerivations++;let o=this.#o(e,n,`${this.label}.${i}`),l=xm(o),c={signature:o,signatureKey:l,key:this.#c(e,o),pipelineLayout:e.pipelineLayout,topology:s?.topology,stripIndexFormat:ju(s),create:()=>e.device.gpu.createRenderPipeline(this.#d(e,o)),ctx:{where:`${this.label}.pipelineFor`,signature:l,dependencies:fM(e)}};return e.pipelineKeys?.set(r,c),c}#o(e,n,i){let r=n??e.defaultTarget;if(!r)throw Fo(i);let s=Ub(r);if(Lb(s,i),e.colorStates&&e.colorStates.length!==s.colors.length)throw hu(this.label,`expected one entry per color attachment; colors has ${e.colorStates.length}, but the target signature has ${s.colors.length}.`,i);if(e.multisampleState?.alphaToCoverageEnabled&&(s.sampleCount??1)<=1)throw Oo(this.label,`alphaToCoverage requires a multisampled target, but the target signature has sampleCount ${s.sampleCount??1}; create the target with msaa: true.`,i);if((e.stencilState||e.stencilRef!==void 0)&&!ss(s.depth))throw jr(this.label,`stencil requires a depth format with a stencil aspect, but the target signature has ${s.depth?`"${s.depth}"`:"no depth"}; create the target with depth: "depth24plus-stencil8".`,i);return s}#c(e,n){let i=e.opts.geometry;return Ib({vertexModule:e.vertexShaderModule,fragmentModule:e.fragmentShaderModule,pipelineLayout:e.pipelineLayout,vertexBufferLayouts:e.vertexBufferLayouts,signature:n,fragmentKey:e.fragmentKey,topology:i?.topology,stripIndexFormat:ju(i),cullMode:e.cullMode,frontFace:e.frontFace,unclippedDepth:e.unclippedDepth,depthKey:e.depthKey,stencilKey:e.stencilKey,multisampleKey:e.multisampleKey,constantsKey:e.constantsKey,entryKey:e.entryKey})}#a(e,n,i){let r=e.opts.geometry;if(YS(r)?.[qp](`${this.label}.geometry`),r?.vertexBuffers&&r.vertexBuffers.forEach((a,o)=>n.setVertexBuffer(o,a)),i.indirect!==void 0)return this.#l(n,r,i);let s=xR(this.label,r,e.opts,i);if(!r?.indexBuffer)return n.draw(s.vertexCount,s.instanceCount,s.firstVertex,s.firstInstance);n.setIndexBuffer(r.indexBuffer,r.indexFormat??"uint32"),n.drawIndexed(s.indexCount,s.instanceCount,s.firstIndex,s.baseVertex,s.firstInstance)}#l(e,n,i){let r=`${this.label}.draw`,s=gR.find(c=>i[c]!==void 0);if(s!==void 0)throw sr(this.label,`indirect cannot be combined with ${s} in the same call; the GPU reads the draw arguments from the buffer, so the CPU-side value would be ignored.`,r);let a=!!n?.indexBuffer,{buffer:o,offset:l}=$b(this.label,r,i.indirect,a?"drawIndexedIndirect":"drawIndirect");if(!a)return e.drawIndirect(o,l);e.setIndexBuffer(n.indexBuffer,n.indexFormat??"uint32"),e.drawIndexedIndirect(o,l)}#d(e,n){return{label:`${this.label}.pipeline`,layout:e.pipelineLayout,vertex:{module:e.vertexShaderModule,entryPoint:e.vertexEntry,buffers:[...e.vertexBufferLayouts??[]],...e.vertexShaderModule===e.fragmentShaderModule&&e.constants?{constants:e.constants}:{}},fragment:{module:e.fragmentShaderModule,entryPoint:e.fragmentEntry,targets:yR(n,e),...e.constants?{constants:e.constants}:{}},primitive:_R(e.opts.geometry,e.cullMode,e.frontFace,e.unclippedDepth),depthStencil:LR(n,e),multisample:zR(n,e)}}};function mR(t,e,n,i,r){let s=t.limits;for(let[a,o,l]of[["vertex",1,"maxStorageBuffersInVertexStage"],["fragment",2,"maxStorageBuffersInFragmentStage"]]){let c=i.find(d=>d.stage===a);if(!c)continue;let u=n.filter(d=>d.bindingLayout?.kind==="buffer"&&d.bindingLayout.buffer.type!=="uniform"&&r(d)&o),f=s[l]??s.maxStorageBuffersPerShaderStage;if(f!==void 0&&u.length>f)throw pS(e,a,c.name,u.length,f,u)}}var gR=["vertices","indices","instances","firstVertex","firstIndex","baseVertex","firstInstance"];function yR(t,e){return t.colors.map((n,i)=>{let r=e.colorStates?.[i],s=r?.blendState??e.blendState,a=r?.writeMask??e.writeMask,o={format:n};return s&&(o.blend=s),a!==void 0&&(o.writeMask=a),o})}function xR(t,e,n,i){hr(t,"DrawOptions.instances",n.instances),hr(t,"DrawOptions.vertices",n.vertices),hr(t,"DrawOptions.firstInstance",n.firstInstance),hr(t,"DrawCallOptions.instances",i.instances),dr(t,"DrawCallOptions.vertices",i.vertices),dr(t,"DrawCallOptions.indices",i.indices),dr(t,"DrawCallOptions.firstVertex",i.firstVertex),dr(t,"DrawCallOptions.firstIndex",i.firstIndex),dr(t,"DrawCallOptions.baseVertex",i.baseVertex),hr(t,"DrawCallOptions.firstInstance",i.firstInstance),hr(t,"GeometryLike.vertexCount",e?.vertexCount),hr(t,"GeometryLike.indexCount",e?.indexCount),hr(t,"GeometryLike.instanceCount",e?.instanceCount),dr(t,"GeometryLike.firstVertex",e?.firstVertex),dr(t,"GeometryLike.firstIndex",e?.firstIndex),dr(t,"GeometryLike.baseVertex",e?.baseVertex);let r=!!e?.indexBuffer,a=e?.geometry??(e&&Go in e?e:void 0),o=i.firstVertex??e?.firstVertex??0,l=i.vertices??e?.vertexCount??n.vertices??3,c=i.firstIndex??e?.firstIndex??0,u=i.indices??e?.indexCount??0,f=i.baseVertex??e?.baseVertex??0;if(r)lM(t,"index",c,u,a?.indexCount);else if(i.indices!==void 0||i.firstIndex!==void 0||i.baseVertex!==void 0)throw mu(`${t}.draw`,"Index range needs an indexed geometry.");return r||lM(t,"vertex",o,l,a?.vertexCount),{instanceCount:i.instances??n.instances??e?.instanceCount??1,firstInstance:i.firstInstance??n.firstInstance??0,vertexCount:l,firstVertex:o,indexCount:u,firstIndex:c,baseVertex:f}}function vR(t,e){let n=Su(t),i=n??t,r=!n&&fr(t),s=i.colors;if(!Array.isArray(s)||s.length!==e.colors.length)return!1;for(let a=0;a<s.length;a++)if((r?s[a]?.format:s[a])!==e.colors[a])return!1;return(r?i.depth?.format:i.depth)===e.depth&&(r?i.sampleCount:i.sampleCount??1)===e.sampleCount}function ju(t){let e=t?.topology??"triangle-list";return t?.stripIndexFormat??(e.endsWith("strip")?t?.indexFormat:void 0)}function _R(t,e,n,i){let r=t?.topology??"triangle-list",s=ju(t),a=s?{topology:r,stripIndexFormat:s}:{topology:r};return e!==void 0&&(a.cullMode=e),n!==void 0&&(a.frontFace=n),i&&(a.unclippedDepth=!0),a}function lM(t,e,n,i,r){if(!(r===void 0||n+i<=r))throw mu(`${t}.draw`,`${e} range [${n}, ${n+i}) exceeds parent geometry ${e} count ${r}.`)}function dr(t,e,n){if(!(n===void 0||Number.isInteger(n)&&n>=0))throw mu(`${t}.draw`,`${e} must be an integer >= 0; received ${String(n)}.`)}function hr(t,e,n){if(n!==void 0&&!(Number.isInteger(n)&&n>=0))throw new C({code:"VGPU-R1-DRAW-COUNT",message:`${e} of '${t}' must be an integer >= 0; received ${String(n)}. Use 0 only when you want to issue a valid draw with no vertices/instances.`,where:`${t}.draw`})}function SR(t,e){let n=e.blend===void 0?void 0:xM(t,e.blend),i=e.writeMask===void 0?void 0:SM(t,e.writeMask),r=e.colors===void 0?void 0:bR(t,e.colors),s=r?`${gM(n,i)}@${r.map(kR).join("@")}`:n||i!==void 0?gM(n,i):void 0;return{blendState:n,writeMask:i,colorStates:r,fragmentKey:s}}function bR(t,e){if(!Array.isArray(e))throw hu(t,`colors must be an array; received ${Ce(e)}.`);return e.map((n,i)=>{if(n==null)return null;if(typeof n!="object"||Array.isArray(n))throw hu(t,`colors[${i}] must be null or { blend?, writeMask? }; received ${Ce(n)}.`);let r=n.blend===void 0?void 0:xM(`${t}.colors[${i}]`,n.blend),s=n.writeMask===void 0?void 0:SM(`${t}.colors[${i}]`,n.writeMask);return!r&&s===void 0?null:{blendState:r,writeMask:s}})}function xM(t,e){if(e==="alpha")return Qu({src:"src-alpha",dst:"one-minus-src-alpha"},{src:"one",dst:"one-minus-src-alpha"});if(e==="premultiplied")return Qu({src:"one",dst:"one-minus-src-alpha"},{src:"one",dst:"one-minus-src-alpha"});if(e==="additive")return Qu({src:"one",dst:"one"},{src:"one",dst:"one"});if(typeof e!="object"||e===null||!cM(e.color))throw Ip(t,e);let n=e.color,i=e.alpha;if(i!==void 0&&!cM(i))throw Ip(t,e);return Qu(n,i??n)}function cM(t){return typeof t=="object"&&t!==null&&typeof t.src=="string"&&typeof t.dst=="string"}function Qu(t,e){return{color:uM(t),alpha:uM(e)}}function uM(t){return{srcFactor:t.src,dstFactor:t.dst,operation:t.op??"add"}}function MR(t,e,n){if(e.blendConstant===void 0)return{};let i=e.blendConstant;if(!Array.isArray(i)||i.length!==4||i.some(r=>typeof r!="number"||!Number.isFinite(r)))throw Np(t,`received ${Ce(i)}; expected [r, g, b, a] finite numbers.`);if(!wR(n).some(r=>r&&ER(r)))throw Np(t,`no color target's effective blend uses a "constant"/"one-minus-constant" factor (colors[i].blend replaces the top-level blend for that target), so blendConstant would have no effect.`);return{blendConstant:{r:i[0],g:i[1],b:i[2],a:i[3]}}}function wR(t){return t.colorStates?t.colorStates.map(e=>e?.blendState??t.blendState):[t.blendState]}function ER(t){return[t.color.srcFactor,t.color.dstFactor,t.alpha.srcFactor,t.alpha.dstFactor].some(e=>e==="constant"||e==="one-minus-constant")}function TR(t,e){if(e===void 0)return{};if(typeof e!="object"||e===null||Array.isArray(e))throw rr(t,`received ${Ce(e)}; expected { vertex?, fragment? } entry point names.`);return e}function AR(t,e){return`en~${t?.name??""}~${e?.name??""}`}function fM(t){return t.vertexShaderModule===t.fragmentShaderModule?[t.vertexShaderModule,t.pipelineLayout]:[t.vertexShaderModule,t.fragmentShaderModule,t.pipelineLayout]}function CR(t,e,n){let i=n.cull===void 0?void 0:DR(e,n.cull),r=n.frontFace===void 0?void 0:UR(e,n.frontFace),s=n.unclippedDepth===void 0?void 0:RR(t,e,n.unclippedDepth);return{cullMode:i,frontFace:r,unclippedDepth:s}}function RR(t,e,n){if(typeof n!="boolean")throw Bp(e,`received ${Ce(n)}; expected a boolean.`);if(n){if(!t.features.has("depth-clip-control"))throw Bp(e,'the device lacks the "depth-clip-control" feature; request it at init: init({ requiredFeatures: ["depth-clip-control"] }) on an adapter that supports it.');return!0}}function DR(t,e){if(e==="none"||e==="front"||e==="back")return e;throw vS(t,e)}function UR(t,e){if(e==="ccw"||e==="cw")return e;throw _S(t,e)}var vM={depthWriteEnabled:!0,depthCompare:"less-equal"},_M=["never","less","equal","less-equal","greater","not-equal","greater-equal","always"],dM=-2147483648,hM=2147483647;function LR(t,e){if(t.depth)return{format:t.depth,...e.depthState??vM,...e.stencilState??{}}}function IR(t,e,n){if(n.depth===void 0)return{};let i=NR(t,e,n.depth,n.geometry?.topology??"triangle-list");return{depthState:i,depthKey:PR(i)}}function NR(t,e,n,i){if(n===!1)return{depthWriteEnabled:!1,depthCompare:"always"};if(typeof n!="object"||n===null)throw kn(e,`received ${Ce(n)}.`);if(n.write!==void 0&&typeof n.write!="boolean")throw kn(e,`write must be a boolean; received ${Ce(n.write)}.`);if(n.compare!==void 0&&!_M.includes(n.compare))throw kn(e,`compare must be a GPUCompareFunction; received ${Ce(n.compare)}.`);if(n.bias!==void 0&&!Number.isInteger(n.bias))throw kn(e,`bias must be an integer (WebGPU depthBias is i32); received ${Ce(n.bias)}.`);if(n.bias!==void 0&&(n.bias<dM||n.bias>hM))throw kn(e,`bias must fit in the i32 range [${dM}, ${hM}] (WebGPU depthBias is i32); received ${Ce(n.bias)}.`);if(n.biasSlopeScale!==void 0&&!Number.isFinite(n.biasSlopeScale))throw kn(e,`biasSlopeScale must be a finite number; received ${Ce(n.biasSlopeScale)}.`);if(n.biasClamp!==void 0&&!Number.isFinite(n.biasClamp))throw kn(e,`biasClamp must be a finite number; received ${Ce(n.biasClamp)}.`);let r=n.bias??0,s=n.biasSlopeScale??0,a=n.biasClamp??0;if((r!==0||s!==0||a!==0)&&!i.startsWith("triangle"))throw kn(e,`bias, biasSlopeScale, and biasClamp must be 0 for "${i}" topology.`);if(a!==0&&t.isCompatibilityMode)throw kn(e,`biasClamp must be 0 on a compatibility-mode device; received ${Ce(n.biasClamp)}.`);return{depthWriteEnabled:n.write??!0,depthCompare:n.compare??"less-equal",...r!==0?{depthBias:r}:{},...s!==0?{depthBiasSlopeScale:s}:{},...a!==0?{depthBiasClamp:a}:{}}}function PR(t){return`${t.depthWriteEnabled?1:0}~${t.depthCompare}~${t.depthBias??0}~${t.depthBiasSlopeScale??0}~${t.depthBiasClamp??0}`}var OR=["keep","zero","replace","invert","increment-clamp","decrement-clamp","increment-wrap","decrement-wrap"];function BR(t,e){if(e.stencil===void 0)return{};let n=e.stencil;if(typeof n!="object"||n===null||Array.isArray(n))throw jr(t,`received ${Ce(n)}; expected { front?, back?, readMask?, writeMask?, ref? }.`);let i=n.front===void 0?void 0:pM(t,"front",n.front),r=n.back===void 0?void 0:pM(t,"back",n.back);Om(t,"readMask",n.readMask),Om(t,"writeMask",n.writeMask),Om(t,"ref",n.ref);let s={...i?{stencilFront:i}:{},...r??i?{stencilBack:r??{...i}}:{},...n.readMask!==void 0?{stencilReadMask:n.readMask}:{},...n.writeMask!==void 0?{stencilWriteMask:n.writeMask}:{}},a=s.stencilFront!==void 0||s.stencilBack!==void 0||s.stencilReadMask!==void 0||s.stencilWriteMask!==void 0;return!a&&n.ref===void 0?{}:{...a?{stencilState:s,stencilKey:FR(s)}:{},...n.ref!==void 0?{stencilRef:n.ref}:{}}}function pM(t,e,n){if(typeof n!="object"||n===null||Array.isArray(n))throw jr(t,`${e} must be a { compare?, fail?, depthFail?, pass? } object; received ${Ce(n)}.`);if(n.compare!==void 0&&!_M.includes(n.compare))throw jr(t,`${e}.compare must be a GPUCompareFunction; received ${Ce(n.compare)}.`);for(let[i,r]of[["fail",n.fail],["depthFail",n.depthFail],["pass",n.pass]])if(r!==void 0&&!OR.includes(r))throw jr(t,`${e}.${i} must be a GPUStencilOperation; received ${Ce(r)}.`);return{compare:n.compare??"always",failOp:n.fail??"keep",depthFailOp:n.depthFail??"keep",passOp:n.pass??"keep"}}function Om(t,e,n){if(n!==void 0&&(typeof n!="number"||!Number.isInteger(n)||n<0||n>4294967295))throw jr(t,`${e} must be an integer in [0, 0xFFFFFFFF] (WebGPU GPUStencilValue is u32); received ${Ce(n)}.`)}function FR(t){return`st~${mM(t.stencilFront)}~${mM(t.stencilBack)}~${t.stencilReadMask??4294967295}~${t.stencilWriteMask??4294967295}`}function mM(t){return t?`${t.compare},${t.failOp},${t.depthFailOp},${t.passOp}`:"default"}function zR(t,e){return{count:t.sampleCount??1,...e.multisampleState??{}}}function VR(t,e){if(e.multisample===void 0)return{};let n=e.multisample;if(typeof n!="object"||n===null||Array.isArray(n))throw Oo(t,`received ${Ce(n)}; expected { alphaToCoverage?, mask? }.`);if(n.alphaToCoverage!==void 0&&typeof n.alphaToCoverage!="boolean")throw Oo(t,`alphaToCoverage must be a boolean; received ${Ce(n.alphaToCoverage)}.`);if(n.mask!==void 0&&(typeof n.mask!="number"||!Number.isInteger(n.mask)||n.mask<0||n.mask>4294967295))throw Oo(t,`mask must be an integer in [0, 0xFFFFFFFF] (WebGPU GPUSampleMask is u32); received ${Ce(n.mask)}.`);let i={...n.alphaToCoverage!==void 0?{alphaToCoverageEnabled:n.alphaToCoverage}:{},...n.mask!==void 0?{mask:n.mask}:{}};return i.alphaToCoverageEnabled===void 0&&i.mask===void 0?{}:{multisampleState:i,multisampleKey:GR(i)}}function GR(t){return`ms~${t.alphaToCoverageEnabled?1:0}~${t.mask??4294967295}`}function SM(t,e){if(!Array.isArray(e))throw Op(t,Ce(e));let n=0;for(let i of e)if(i==="r")n|=1;else if(i==="g")n|=2;else if(i==="b")n|=4;else if(i==="a")n|=8;else throw Op(t,Ce(i));return n}function gM(t,e){return`${bM(t)};${e??15}`}function bM(t){if(!t)return"none;none";let e=t.color,n=t.alpha;return`${e.srcFactor},${e.dstFactor},${e.operation};${n.srcFactor},${n.dstFactor},${n.operation}`}function kR(t){return t?`${t.blendState?bM(t.blendState):"inherit"};${t.writeMask??"inherit"}`:"inherit"}function Ce(t){if(typeof t=="string")return`"${t}"`;try{return JSON.stringify(t)??String(t)}catch{return String(t)}}function HR(t){return(it(t,"writesDepth").depthState??vM).depthWriteEnabled}function $R(t){let e=it(t,"stencilWritingOps"),n=e.stencilState;if(!n||n.stencilWriteMask===0)return[];let i=e.cullMode??"none",r=[],s=(a,o)=>{if(o)for(let[l,c]of[["fail",o.failOp],["depthFail",o.depthFailOp],["pass",o.passOp]])c!==void 0&&c!=="keep"&&r.push(`${a}.${l}: "${c}"`)};return i!=="front"&&s("front",n.stencilFront),i!=="back"&&s("back",n.stencilBack),r}function MM(t,e,n,i={},r,s){t.encode(e,n,i,r,s)}function wM(t){let e=Bm.get(t);if(!e)throw new TypeError("Invalid Draw instance");return e}function it(t,e="access"){let n=wM(t);if("disposed"in n)throw Pp(n.label,e);return n}function yM(t,e,n,i){let r=(async()=>{await lr(t.device),ye(t.device,`${e}.validation`);let s=Gn(e,n,i);t.errorSink?await t.errorSink(s):console.error(s)})();return t.trackSettled?.(r),r}function WR(){let t=new Set,e=new WeakMap,n;function i(s=16){for(let a=0;a<s;a+=1){n??=t.values();let o=n.next();if(o.done&&(n=t.values(),o=n.next(),o.done))return;o.value.deref()||t.delete(o.value)}}function r(){let s=[];for(let a of t){let o=a.deref();o?s.push(o):t.delete(a)}return n=void 0,s}return{add(s){if(i(),e.has(s))return;let a=new WeakRef(s);e.set(s,a),t.add(a)},delete(s){let a=e.get(s);a&&t.delete(a),e.delete(s)},list:r,markStale(s){let a=pa;for(let o of r())try{o.markStale(s)}catch(l){a===pa&&(a=l)}if(a!==pa)throw a}}}function XR(t,e,n){return t?Array.isArray(t)?t:t[e]??n:n}function qR(t,e){let n=it(t);return om(n.reflection.bindings,e,n.visibility).map(YR)}function YR(t){return t.buffer?{...t,buffer:{...t.buffer,hasDynamicOffset:!0}}:t}function ZR(t,e){if(nl(t)&&!Fb())throw gu(e)}var EM=`
struct VgpuFullscreenVertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
@vertex fn vgpu_fullscreen_vs(@builtin(vertex_index) vi: u32) -> VgpuFullscreenVertexOut {
  var pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var uv = array<vec2f, 3>(vec2f(0.0, 1.0), vec2f(2.0, 1.0), vec2f(0.0, -1.0));
  var out: VgpuFullscreenVertexOut;
  out.position = vec4f(pos[vi], 0.0, 1.0);
  out.uv = uv[vi];
  return out;
}
`,TM=AM({name:"vgpu_fullscreen_vs",mangledName:"vgpu_fullscreen_vs",stage:"vertex",bindings:[],samplingPairs:[],inputs:[]});function AM(t){if(typeof t!="object"||t===null||Object.isFrozen(t))return t;for(let e of Object.values(t))AM(e);return Object.freeze(t)}function ma(t,e,n={}){if("geometry"in n)throw re("effect","effect() never accepts vertex buffers; use draw(gpu, { shader, geometry: geometry(gpu, descriptor) }).");let i=zt(t,"effect"),r=qu(i);return new Fm(i.device,aM(e),n,r.binds,void 0,r.pipelines,r.shaderModules,r.pipelineLayouts,s=>i.reportError(s),s=>{i.trackDelivery(s)})}var CM=new WeakMap,Fm=class{get gpu(){return pr(this).gpu}dispose(){pr(this).dispose()}constructor(e,n,i={},r,s,a,o,l,c,u){let f=i.entry;if(f&&typeof f=="object"&&"vertex"in f)throw rr(i.label??"effect","effect does not support vertex entry overrides.","effect");let d=n.reflection.entryPoints.some(p=>p.stage==="vertex")?void 0:{source:EM,entry:TM},h=new ef(e,n,{entry:f,set:i.set,label:i.label??"effect",blend:i.blend,writeMask:i.writeMask},r,s,a,o,l,c,u,d);CM.set(this,h)}set(e){return pr(this).set(e),this}draw(e={}){pr(this).draw(e)}compile(e){return pr(this).compile(e).then(()=>this)}compileSync(e){return pr(this).compileSync(e),this}encode(e,n,i={},r){MM(pr(this),e,n,i,r)}get[da](){return pr(this)[da]}};function pr(t){let e=CM.get(t);if(!e)throw new TypeError("Invalid Effect instance");return e}var KR=256,JR=16*1024*1024,rl=new WeakMap,zm=new WeakSet,QR=1,tf=class{device;#e=[];#t=new Map;#n=!1;constructor(e){this.device=e}capture(e,n){let i=this.#t.get(e.owner);return i?.revision!==e.revision&&(i=this.#i(e),this.#t.set(e.owner,i)),i.page.caches.add(n),i}flush(){for(let e of this.#e)this.device.gpu.queue.writeBuffer(e.buffer,0,e.bytes.buffer,0,Math.ceil(e.used/4)*4)}release(){if(this.#n)return;this.#n=!0;let e=zm.has(this.device)?void 0:rl.get(this.device);for(let n of this.#e)if(e&&e.pages.length<KR&&e.bytes+n.bytes.byteLength<=JR){for(let i of n.caches)i.evictIdentity(RM(n),n.taken);e.pages.push(n),e.bytes+=n.bytes.byteLength}else DM(n);this.#e.length=0,this.#t.clear()}#i(e){let n=this.device.limits.minUniformBufferOffsetAlignment||256,i=e.bytes.byteLength,r=this.#e.at(-1),s=Math.ceil((r?.used??0)/n)*n;(!r||s+i>r.bytes.byteLength)&&(r=this.#r(i),this.#e.push(r),s=0),r.bytes.set(e.bytes,s),r.used=s+i;let a=r.ranges.get(s);return a?.identity.size!==i&&(a={resource:{buffer:r.buffer,offset:s,size:i},identity:{kind:Eu,id:r.id,offset:s,size:i}},r.ranges.set(s,a)),{revision:e.revision,page:r,resource:a.resource,identity:a.identity}}#r(e){let n=rl.get(this.device);!n&&!zm.has(this.device)&&rl.set(this.device,n={pages:[],bytes:0});let i=n?.pages.findIndex(s=>s.bytes.byteLength>=e)??-1,r=i>=0?n.pages.splice(i,1)[0]:this.#s(e);return i>=0&&(n.bytes-=r.bytes.byteLength),r.used=0,r.taken=jS(),r}#s(e){let n=Math.min(this.device.limits.maxBufferSize,Math.max(65536,Math.ceil(e/4)*4)),i=this.device.gpu.createBuffer({label:"vgpu.frame.uniforms",size:n,usage:72});return{id:QR++,buffer:i,bytes:new Uint8Array(n),used:0,taken:0,caches:new Set,ranges:new Map}}};function RM(t){return{kind:Eu,id:t.id}}function DM(t){for(let e of t.caches)e.evictIdentity(RM(t));t.caches.clear(),t.buffer.destroy()}function UM(t){zm.add(t);for(let e of rl.get(t)?.pages??[])DM(e);rl.delete(t)}function Hm(t,e){return e2(zt(t,"frame")).frame(e)}var LM,jR=cr("frame-runner");function e2(t){return t.service(jR,e=>{let n=Wu(e);return e.own("service",()=>UM(e.device)),new km(()=>{let i=()=>{},r=new Vm(e.device,void 0,s=>e.reportError(s),s=>{e.trackDelivery(s)},()=>i());return i=e.own("scheduler",()=>r.cancel()),r},()=>n.tick(),i=>{let r=e.own("scheduler",()=>i.stop()),s=e.stopOnLoss(()=>i.stop());return()=>{r(),s()}},i=>ye(e.device,i))})}var Vm=class{device;defaultTarget;errorSink;trackSettled;releaseLifecycle;done=Promise.resolve();#e;#t=[];#n=[];#i;#r={capture:(e,n)=>(this.#i??=new tf(this.device)).capture(e,n)};#s=new Set;#o=new Set;#c=!1;#a=!1;#l=!1;static{LM=e=>!(#c in e)||!e.#c&&!e.#a}constructor(e,n,i,r,s){this.device=e,this.defaultTarget=n,this.errorSink=i,this.trackSettled=r,this.releaseLifecycle=s,ye(e,"Frame.constructor"),this.#e=e.gpu.createCommandEncoder({label:"vgpu.frame"})}computePass(e,n){this.#d("Frame.computePass");let i=typeof e=="function"?e:n;if(typeof i!="function")throw new C({code:"VGPU-COMPUTE-PASS-INVALID",message:"computePass requires a synchronous callback.",where:"Frame.computePass"});let r=typeof e=="function"?"vgpu.computePass":e.label??"vgpu.computePass",s=Ko(this.device,this.#n,`${r}.begin`,()=>this.#e.beginComputePass({label:r}));this.#l=!0;let a=!0,o={dispatch:(c,u,f,d)=>{if(!a)throw new C({code:"VGPU-COMPUTE-PASS-CLOSED",message:"The compute pass callback has ended.",where:`${r}.dispatch`});ye(this.device,`${r}.dispatch`);let h=Yb(c);if(!h||h.device.gpu!==this.device.gpu)throw new C({code:"VGPU-COMPUTE-DEVICE-MISMATCH",message:"Expected a compute pipeline created for this frame's GPU device.",where:`${r}.dispatch`});h.encode(s,u,f,d,this.#n,this.#r)}},l=!1;try{let c=i(o);if(c&&typeof c.then=="function")throw Promise.resolve(c).catch(()=>{}),new C({code:"VGPU-COMPUTE-PASS-ASYNC",message:"computePass callbacks must be synchronous; await preparation before opening the frame.",where:"Frame.computePass"})}catch(c){throw l=!0,c}finally{a=!1,this.#l=!1;try{Ko(this.device,this.#n,`${r}.end`,()=>s.end())}catch(c){if(!l)throw c}}}#d(e){if(this.#a)throw xu(e);if(this.#c)throw vu(e);if(ye(this.device,e),this.#l)throw aa(e)}pass(e,n){if(this.#a)throw xu("Frame.pass");if(ye(this.device,"Frame.pass"),this.#l)throw aa("Frame.pass");if(this.#c&&!nl(fr(e)?e:e.target))throw vu("Frame.pass");let i=fr(e),r=typeof n=="function"?n:x=>x.draw(n),s=i?e:e.target??this.defaultTarget;if(!s)throw Fo("Frame.pass");if(nl(s)&&this.#c)throw gu("Frame.pass");let a=i?void 0:e.clear,o=a===!1;if(o&&s.sampleCount===4)throw SS();let l=i?void 0:e.clearDepth;if(l!==void 0){if(typeof l!="number"||!(l>=0&&l<=1))throw Fp(l);if(o)throw bS();if(!s.depth)throw Fp(l,"but the target has no depth attachment, so clearDepth would have no effect.","Create the target with depth: true (or a depth format), or drop clearDepth.")}let c=i?void 0:e.clearStencil;if(c!==void 0){if(typeof c!="number"||!Number.isInteger(c)||c<0||c>4294967295)throw zp(`received ${String(c)}; expected an integer in [0, 0xFFFFFFFF] (WebGPU GPUStencilValue).`);if(o)throw MS();let x=s.depth?.format;if(!ss(x))throw zp(`received ${String(c)}, but the target's depth format ${x?`"${x}"`:"(none)"} has no stencil aspect, so clearStencil would have no effect.`)}let u=i?void 0:e.depthReadOnly;if(u!==void 0&&typeof u!="boolean")throw ar(`received ${mr(u)}; expected a boolean.`,"Pass depthReadOnly: true to open the pass with a read-only depth attachment, or omit it.");if(u){if(!s.depth)throw ar("is set, but the target has no depth attachment, so there is nothing to make read-only.","Create the target with depth: true (or a depth format), or drop depthReadOnly.");if(s.sampleCount===4)throw wS();if(l!==void 0)throw ar("cannot be combined with clearDepth; a read-only depth aspect omits its load/store ops and is never cleared.","Remove clearDepth, or drop depthReadOnly.");if(c!==void 0)throw ar("cannot be combined with clearStencil; a read-only stencil aspect omits its load/store ops and is never cleared.","Remove clearStencil, or drop depthReadOnly.")}let f=i?void 0:a2(e.viewport,this.device.gpu.limits,s.size),d=i?void 0:o2(e.scissor,s.size),h=[],p;try{let x=i||e.timer===void 0?void 0:this.#y(e.timer,s,h,r2),g=(i||e.visibility===void 0?void 0:this.#y(e.visibility,s,h,s2))?.occlusion,m=s.renderPassDescriptor({clear:a===void 0||a===!0||a===!1?s.clearColor??ca:a,preserve:o,clearDepth:l,clearStencil:c,depthReadOnly:u});x?.timestampWrites&&(m={...m,timestampWrites:x.timestampWrites}),g&&(m={...m,occlusionQuerySet:g.querySet}),p=this.#e.beginRenderPass(m),f&&p.setViewport(f.x,f.y,f.width,f.height,f.minDepth,f.maxDepth),d&&p.setScissorRect(d[0],d[1],d[2],d[3]),this.#l=!0;try{r(new Gm(p,s,this.#t,u===!0,g,this,y=>{if(ye(this.device,y),this.#a)throw xu(y);if(!this.#l)throw aa(y)},this.#r))}finally{this.#l=!1}}catch(x){this.#p(h),xt(this.#t),this.#t.length=0,Cu(this.device);try{p?.end()}catch{}throw x}Du(this.device,p,this.#t)}submit(){if(this.#c||this.#a)return;if(ye(this.device,"Frame.submit"),this.#l)throw aa("Frame.submit");this.#c=!0,this.releaseLifecycle?.();try{for(let r of this.#m())r.finalizeFrame(this,this.#e)}catch(r){throw this.#i?.release(),this.#u(this.#f()),r}try{this.#i?.flush()}catch(r){throw this.#i?.release(),this.#u(this.#f()),r}let e,n=this.#t[0]?.context;n&&is(this.device,n);try{e=this.#n.length?Ko(this.device,this.#n,"Frame.finish",()=>this.#e.finish()):this.#e.finish()}catch(r){this.#u(this.#f());let s=n?Vt(this.device):void 0;xt(this.#t),s&&xt([s]);let a=s?.context??n;if(!a)throw this.#i?.release(),r;this.done=this.#g(this.#h(a.label,a.group,r));return}if(n){let r=Vt(this.device);r&&(this.#t[0]=this.#t[0]?oa(r,this.#t[0]):r)}let i=this.#t[0]?.context;i&&is(this.device,i);try{this.#n.length?Ko(this.device,this.#n,"Frame.submit",()=>this.device.gpu.queue.submit([e])):this.device.gpu.queue.submit([e])}catch(r){this.#u(this.#f());let s=i?Vt(this.device):void 0;xt(this.#t),s&&xt([s]);let a=s?.context??i;if(!a)throw this.#i?.release(),r;this.done=this.#g(this.#h(a.label,a.group,r));return}if(i){let r=Vt(this.device);r&&(this.#t[0]=this.#t[0]?oa(r,this.#t[0]):r)}for(let r of this.#m())r.frameSubmitted(this);this.#u(this.#o),this.done=this.#g(Promise.all([Ru(this.device,this.#t,{errorSink:this.errorSink}),pb(this.#n,this.errorSink??(r=>console.error(r)))]).then(()=>{}))}cancel(){if(!this.#a){if(this.#c)throw vu("Frame.cancel");if(this.#l)throw aa("Frame.cancel");this.#a=!0,this.#i?.release(),this.#n.length=0,this.releaseLifecycle?.(),this.#u(this.#f()),this.#s.clear(),this.#o.clear(),xt(this.#t),this.#t.length=0}}#u(e){for(let n of[...e])n.frameAbandoned(this)}#f(){return[...this.#s,...this.#o]}#p(e){for(let n of[...e])this.#s.delete(n),this.#o.add(n)}#m(){return[...this.#s].filter(e=>!this.#o.has(e))}#y(e,n,i,r){let s=qb(e);if(!s)throw r(e);let a;try{a=s[wm]({frame:this,device:this.device,target:n})}catch(o){throw this.#p(this.#s),o}return this.#s.add(a.owner),i.push(a.owner),a}async#h(e,n,i){await lr(this.device),ye(this.device,"Frame.validation");let r=Gn(e,n,i);this.errorSink?await this.errorSink(r):console.error(r)}#g(e){let n=e.catch(i=>{let r=i instanceof C?i:new C({code:"VGPU-FRAME-COMPLETION",message:"GPU frame completion failed.",where:"Frame.done",cause:i});return this.errorSink?this.errorSink(r):console.error(r)}).finally(()=>this.#i?.release());return this.trackSettled?.(n),n}},Gm=class{encoder;target;validations;depthReadOnly;occlusionSource;frame;assertFrameOpen;capture;#e=!1;constructor(e,n,i,r=!1,s,a,o,l){this.encoder=e,this.target=n,this.validations=i,this.depthReadOnly=r,this.occlusionSource=s,this.frame=a,this.assertFrameOpen=o,this.capture=l}draw(e,n={}){this.assertFrameOpen?.("FramePass.draw");let i=n2(e);this.depthReadOnly&&t2(i,this.target),i.encode(this.encoder,this.target,n,r=>this.validations.push(r),this.capture)}occlusion(e,n){if(this.assertFrameOpen?.("FramePass.occlusion"),!this.occlusionSource)throw AS();if(this.#e)throw CS();let i=this.occlusionSource.beginQuery(e,this.frame);this.encoder.beginOcclusionQuery(i),this.#e=!0;try{typeof n=="function"?n():this.draw(n)}finally{this.#e=!1,this.encoder.endOcclusionQuery()}}bundles(...e){if(this.assertFrameOpen?.("FramePass.bundles"),this.depthReadOnly)throw ar("pass cannot replay bundles: bundle records bundles with writable depth/stencil, and WebGPU only executes read-only-recorded bundles in a read-only pass.","Encode the draws directly with pass.draw(...) inside the depthReadOnly pass.","FramePass.bundles");let n=e.map(i=>Xb(i)??i2());for(let i of n)i.assertReplayable(this.target);this.encoder.executeBundles(n.map(i=>i.gpu))}};function t2(t,e){if(t.writesDepth())throw ar(`pass cannot encode draw '${t.label}': its depth state writes depth (the default is write: true). Give the draw depth: { write: false } (or depth: false to disable depth testing).`,"Use depth: { write: false } on the draw, or open the pass without depthReadOnly.","FramePass.draw");if(ss(e.depth?.format)){let n=t.stencilWritingOps();if(n.length)throw ar(`pass cannot encode draw '${t.label}': its stencil ops can write (${n.join(", ")}), and the pass's stencil aspect is read-only too.`,'Use "keep" for those ops or stencil writeMask: 0, or open the pass without depthReadOnly.',"FramePass.draw")}}function n2(t){let e=Wb(t);if(!e)throw new TypeError("Invalid Effect instance: pass.draw() expects a Draw or an Effect created by this library.");return e}function i2(){throw new C({code:"VGPU-R3-BUNDLE-INVALID",message:"p.bundles() expected bundles created by bundle(gpu, { target }, cb).",where:"FramePass.bundles"})}function r2(t){return ES(`FramePassOptions.timer received ${mr(t)}; expected a TimerSpan from timer.span(name).`,'Create const passTimer = timer(gpu) once, then pass passTimer.span("name") per pass.',"Frame.pass")}function s2(t){return TS(`FramePassOptions.visibility received ${mr(t)}; expected a Visibility from visibility(gpu).`,"Create const vis = visibility(gpu) once, then pass { target, visibility: vis } per pass.","Frame.pass")}function a2(t,e,n){if(t===void 0)return;if(typeof t!="object"||t===null||Array.isArray(t))throw Hn(`received ${mr(t)}; expected { x?, y?, width, height, minDepth?, maxDepth? }.`);let{x:i=0,y:r=0,width:s,height:a,minDepth:o=0,maxDepth:l=1}=t;for(let[d,h]of[["x",i],["y",r],["width",s],["height",a],["minDepth",o],["maxDepth",l]])if(typeof h!="number"||!Number.isFinite(h))throw Hn(`${d} received ${mr(h)}; expected a finite number.`);let c=e.maxTextureDimension2D,u=c*2,f=`target is ${n[0]}x${n[1]}px, device maxTextureDimension2D is ${c}`;if(!(s>=0&&s<=c))throw Hn(`width ${s} is outside [0, ${c}] (${f}).`);if(!(a>=0&&a<=c))throw Hn(`height ${a} is outside [0, ${c}] (${f}).`);if(!(i>=-u&&i+s<=u-1))throw Hn(`x ${i} with width ${s} is outside [${-u}, ${u-1}] (${f}).`);if(!(r>=-u&&r+a<=u-1))throw Hn(`y ${r} with height ${a} is outside [${-u}, ${u-1}] (${f}).`);if(!(o>=0&&o<=1))throw Hn(`minDepth ${o} is outside [0, 1].`);if(!(l>=0&&l<=1))throw Hn(`maxDepth ${l} is outside [0, 1].`);if(!(o<=l))throw Hn(`minDepth ${o} exceeds maxDepth ${l}.`);return{x:i,y:r,width:s,height:a,minDepth:o,maxDepth:l}}function o2(t,e){if(t===void 0)return;if(!Array.isArray(t)||t.length!==4)throw pu(`received ${mr(t)}; expected [x, y, width, height].`);let[n,i,r,s]=t;for(let[l,c]of[["x",n],["y",i],["width",r],["height",s]])if(typeof c!="number"||!Number.isInteger(c)||c<0)throw pu(`${l} received ${mr(c)}; expected a non-negative integer.`);let[a,o]=e;if(n+r>a||i+s>o)throw pu(`[${n}, ${i}, ${r}, ${s}] exceeds the target's current size ${a}x${o}px (x + width <= ${a}, y + height <= ${o}).`);return[n,i,r,s]}function mr(t){return typeof t=="string"?`'${t}'`:Array.isArray(t)?`[${t.map(e=>mr(e)).join(", ")}]`:typeof t=="object"&&t!==null?"an object":String(t)}function l2(t){return t!==null&&(typeof t=="object"||typeof t=="function")&&typeof t.then=="function"}var km=class{createFrame;advance;trackLoop;assertActive;#e=!1;constructor(e,n,i,r){this.createFrame=e,this.advance=n,this.trackLoop=i,this.assertActive=r}frame(e){return this.#t(e,"frame")}#t(e,n){if(this.#e||Bb())throw yu();this.assertActive?.(n),this.#e=!0,zb();try{this.advance();let i=this.createFrame();if(e){try{let r=e(i);if(l2(r))throw Promise.resolve(r).catch(()=>{}),zS(n)}catch(r){if(LM(i))try{i.cancel()}catch{}throw r}i.submit()}return i}finally{Vb(),this.#e=!1}}loop(e,n={}){let i=!1,r=globalThis.requestAnimationFrame??(h=>setTimeout(()=>h(performance.now()),16)),s=globalThis.cancelAnimationFrame??(h=>clearTimeout(h)),a=n.fps&&n.fps>0?1e3/n.fps:0,o,l=0,c,u=()=>{i=!0,s(l),c?.(),c=void 0},f=h=>{if(!i){if(u2(h,o,a)){o=h;try{this.#t(e,"frameLoop")}catch(p){throw u(),p}}i||(l=r(f))}};l=r(f);let d={stop:u};return c=this.trackLoop?.(d),d}},c2=1;function u2(t,e,n){return e===void 0||n<=0?!0:t-e>=n-c2}function $m(t){let e=[];for(let n of t)try{n.destroy()}catch(i){e.push(i)}if(e.length)throw e[0]}function sl(t,e){return new Wm(zt(t,"target").device,e)}var Wm=class{device;resourceIdentity=vi("render-target");#e=new Cn;#t=new Set;#n;#i;#r;#s=!1;#o=!1;options;constructor(e,n){this.device=e,pm(n,e),this.options=Object.freeze({...n,size:Object.freeze([...n.size]),...n.colors?{colors:Object.freeze(n.colors.map(i=>Object.freeze({...i})))}:{}}),this.#r=n.clearColor===void 0?ca:ua(n.clearColor,"target.clearColor"),this.#n=this.options.size,this.#i=this.#l(this.#n)}get gpu(){return this.color.gpu}get size(){return this.#n}get texelSize(){return[1/this.#n[0],1/this.#n[1]]}get color(){return this.#i.colors[0]}get colors(){return this.#i.colors}get depth(){return this.#i.depth}get format(){return jo(this.options)[0]?.format??"rgba8unorm"}get clearColor(){return Qo(this.#r)}set clearColor(e){this.#r=ua(e,"target.clearColor")}get sampleCount(){return hm(this.options)}resize(e){if(this.#c("Target.resize"),this.#o)throw new C({code:"VGPU-TARGET-RESIZE-REENTRANT",message:"Cannot resize a target from its replacement callbacks.",where:"Target.resize"});if(pm({...this.options,size:e},this.device),!as(this.#n,e)){this.#o=!0;try{let n=Object.freeze([...e]),i=this.#l(n),r=this.#i;this.#n=n,this.#i=i;try{this.#a()}finally{$m(r.all)}}finally{this.#o=!1}}}onDestroy(e){return this.#e.onDestroy(this,e)}onTexturesRecreated(e){return this.#c("Target.onTexturesRecreated"),this.#t.add(e),()=>{this.#t.delete(e)}}destroy(){if(!this.#s){this.#s=!0;try{this.#e.emit(this)}finally{this.#t.clear(),$m(this.#i.all)}}}renderPassDescriptor(e={}){this.#c("Target.renderPassDescriptor");let{clear:n=[0,0,0,1],preserve:i,clearDepth:r,clearStencil:s,depthReadOnly:a}=e;return{colorAttachments:this.colors.map((o,l)=>Gu(o,this.#i.msaaColors?.[l],n,i)),depthStencilAttachment:this.depth?ku(this.depth,i,r,s,a):void 0}}#c(e){if(this.#s)throw new C({code:"VGPU-TARGET-DESTROYED",message:`Target '${this.options.label??"target"}' is destroyed.`,where:e,fix:"Create a new target; destroyed targets cannot be resized or rendered."});ye(this.device,e)}#a(){let e=[];for(let n of[...this.#t])try{n()}catch(i){e.push(i)}if(e.length)throw e[0]}#l(e){let n=[],i=r=>{let s=this.device.createTexture(r);return n.push(s),s};try{let r=this.#d(e,i),s=this.sampleCount===4?this.#u(e,i):void 0,a=this.#f(e,i);return{colors:Object.freeze(r),msaaColors:s&&Object.freeze(s),depth:a,all:n}}catch(r){try{$m(n)}catch{}throw r}}#d(e,n){return jo(this.options).map((i,r)=>n({kind:"2d",size:e,format:i.format,usage:["render_attachment","texture_binding","copy_src"],sampleCount:1,label:this.options.label?`${this.options.label}.color${r}.resolve`:void 0}))}#u(e,n){return jo(this.options).map((i,r)=>n({kind:"2d",size:e,format:i.format,usage:["render_attachment"],sampleCount:4,label:this.options.label?`${this.options.label}.color${r}`:void 0}))}#f(e,n){let i=dm(this.options);return i?n({kind:"2d",size:e,format:i,usage:["render_attachment","texture_binding"],sampleCount:this.sampleCount,label:this.options.label?`${this.options.label}.depth`:void 0}):void 0}};function nf(t,e,n="read-write"){let i=zt(t,"storage"),r=typeof n=="string"?{access:n}:n,s=f2(i.device,e,r.access??"read-write",void 0,r.indirect??!1);return bu(i,s,a=>a.destroy(),a=>{s.onDestroy(a)})}var Xm=class t{size;access;buffer;constructor(e,n){this.buffer=e,this.access=n,this.size=e.options.size}static create(e,n,i,r,s=!1){let a=s?["storage","copy_dst","copy_src","indirect"]:["storage","copy_dst","copy_src"],o=e.createBuffer({size:n,usage:a,label:r});return new t(o,i)}read(){return this.buffer.read(this.size)}write(e,n=0){this.buffer.write(d2(e),n)}get gpu(){return this.buffer.gpu}get resourceIdentity(){return this.buffer.resourceIdentity}onDestroy(e){return this.buffer.onDestroy(e)}destroy(){this.buffer.destroy()}};function f2(t,e,n,i,r=!1){return Xm.create(t,e,n,i,r)}function d2(t){if(t instanceof ArrayBuffer||ArrayBuffer.isView(t))return t;throw new TypeError("StorageBuffer.write() requires ArrayBuffer or ArrayBufferView.")}function qm(t){return JSON.stringify(Ym(t))}function al(t,e={}){return t.members?.length?p2(t.members,e.abbreviated===!0):t.element?m2(t):Zm(t.type)}function Ym(t){return{type:ga(t.type),align:t.align,size:t.size,stride:t.stride,members:t.members?.map(h2),element:t.element?Ym(t.element):void 0}}function h2(t){return{name:t.name,offset:t.offset,align:t.align,size:t.size,explicitAlign:t.explicitAlign,explicitSize:t.explicitSize,type:ga(t.type),layout:Ym(t.layout)}}function ga(t){switch(t.kind){case"scalar":return{scalar:t.name};case"vector":return{vector:t.width,element:ga(t.element)};case"matrix":return{matrix:[t.columns,t.rows],element:ga(t.element)};case"array":return{array:ga(t.element),count:t.count??t.countExpression};case"atomic":return{atomic:ga(t.element)};default:return t.kind}}function p2(t,e){let n=e?t.slice(0,1):t,i=e&&t.length>1?", ...":"";return`{ ${n.map(g2).join(", ")}${i} }`}function m2(t){let e=x2(t.type),n=e===void 0?"":`, ${e}`;return`array<${al(t.element)}${n}>`}function g2(t){return`${t.name}: ${al(t.layout)}`}function Zm(t){switch(t.kind){case"scalar":return t.name;case"vector":return`vec${t.width}${IM(t.element)}`;case"matrix":return`mat${t.columns}x${t.rows}${IM(t.element)}`;case"array":return y2(t);case"identifier":return t.name;case"atomic":return`atomic<${Zm(t.element)}>`;default:return t.kind}}function y2(t){let e=t.count??t.countExpression,n=e===void 0?"":`, ${e}`;return`array<${Zm(t.element)}${n}>`}function IM(t){return t.kind!=="scalar"?"":t.name==="bool"?"b":t.name.slice(0,1)}function x2(t){return t.kind==="array"?t.count??t.countExpression:void 0}var Km=class{device;#e;#t=0;#n;#i;#r;#s=!1;#o=!1;#c={};#a;constructor(e,n){this.device=e,this.#e=Jm(n)}get buffer(){return this.#f(!0),this.#r}get gpu(){return this.#f(!0),this.#r?.gpu}get size(){return this.#i?.layout.size}set(e){let n=Jm(this.#e);if(NM(n,e),this.#i&&this.#r){or(this.#r,"uniforms.set");let i=Xo(this.#i.layout,n),r=this.#o||this.#i.addressSpace==="storage";r&&this.#r.write(i,0),!this.#n||!Pu(this.#n,i)?(this.#n=new Uint8Array(i),this.#t+=1,this.#s=!r):r&&(this.#s=!1)}else this.#t+=1;this.#e=n}[Vo](e,n){v2(e);let i=this.#d(e,n),r=this.#m();return or(r,`${n}.set`),{resourceLabel:r.options.label??r.gpu.label,resource:{buffer:r.gpu,offset:0,size:i.layout.size},...i.addressSpace==="uniform"?{uniformValue:()=>this.#l(),prepareUniform:s=>this.#f(s)}:{},identity:r.resourceIdentity,tracked:[{resource:r,identity:r.resourceIdentity,subscribe:s=>r.onDestroy(s)}]}}#l(){let e=this.#a;return e?.revision===this.#t&&e.bytes===this.#n?e:this.#a={owner:this.#c,revision:this.#t,bytes:this.#n}}#d(e,n){let i=_2(e),r=b2(e.addressSpace);return this.#i?(this.#p(e,i,r,n),this.#i):this.#u(e,i,r,n)}#u(e,n,i,r){let s=Xo(n,this.#e),a={layout:n,layoutSignature:qm(n),layoutText:al(n),sourceHint:r,bindingName:e.name,addressSpace:i},o=this.device.createBuffer({size:n.size,usage:i==="storage"?["storage","copy_dst"]:["uniform","copy_dst"],label:`${e.name}.sharedUniform`});try{i==="storage"&&o.write(s,0)}catch(l){throw o.destroy(),l}return this.#n=new Uint8Array(s),this.#i=a,this.#r=o,this.#s=i==="uniform",a}#f(e){this.#r&&(this.#s&&(this.#r.write(this.#n,0),this.#s=!1),e&&(this.#o=!0))}#p(e,n,i,r){let s=this.#i;if(s.addressSpace!==i)throw re("uniforms",`shared uniforms '${s.bindingName}' already adopted address space ${s.addressSpace}; '${e.name}' uses ${i}.`);if(qm(n)!==s.layoutSignature)throw kS({bindingName:s.bindingName,adoptedLayout:s.layoutText,adoptedSource:s.sourceHint,incomingLayout:al(n,{abbreviated:!0}),incomingSource:r})}#m(){if(!this.#r)throw re("uniforms","shared uniforms have not adopted a layout yet.");return this.#r}destroy(){this.#r?.destroy()}};function ya(t,e){let n=zt(t,"uniforms");return bu(n,new Km(n.device,e),i=>i.destroy())}function v2(t){if(t.bindingLayout?.kind!=="buffer")throw re("uniforms",`Binding '${t.name}' does not accept shared uniforms; the shader reflected ${t.bindingLayout?.kind??"none"}.`)}function _2(t){if(!t.layout)throw re("uniforms",`Binding '${t.name}' does not expose a host-shareable layout.`);if(t.layout.size===void 0)throw re("uniforms",`Binding '${t.name}' has a runtime-sized layout; it cannot be shared.`);return t.layout}function NM(t,e){for(let[n,i]of Object.entries(e))PM(n)||(Qm(i)&&Qm(t[n])?NM(t[n],i):t[n]=jm(i))}function Jm(t){let e={};for(let[n,i]of Object.entries(t))PM(n)||(e[n]=jm(i));return e}function PM(t){return t==="__proto__"||t==="constructor"||t==="prototype"}function jm(t){return Array.isArray(t)?t.map(jm):ArrayBuffer.isView(t)?S2(t):Qm(t)?Jm(t):t}function S2(t){return t instanceof Float32Array||t instanceof Uint32Array||t instanceof Int32Array?t.slice():t}function Qm(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)&&!ArrayBuffer.isView(t)}function b2(t){return t==="storage"?"storage":"uniform"}function OM(t){return $p("browser",t)}var ig=Ht(_i()),E2={mixed:0,squares:1,circles:2,triangles:3},T2=2,A2=1024,C2=32,R2=.1,eg=1/60,D2=.42,U2=.94,L2=.972,I2=.01,GM=.2,ng=.3,kM=.16,ol=1+ng+kM+GM,N2=`
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn cnoise(P: vec3f) -> f32 {
  var Pi0 = floor(P);
  var Pi1 = Pi0 + vec3f(1.0);
  Pi0 = mod289v3(Pi0);
  Pi1 = mod289v3(Pi1);
  let Pf0 = fract(P);
  let Pf1 = Pf0 - vec3f(1.0);
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  let iy = vec4f(Pi0.yy, Pi1.yy);
  let iz0 = Pi0.zzzz;
  let iz1 = Pi1.zzzz;

  let ixy = permute(permute(ix) + iy);
  let ixy0 = permute(ixy + iz0);
  let ixy1 = permute(ixy + iz1);

  var gx0 = ixy0 * (1.0 / 7.0);
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);
  let sz0 = step(gz0, vec4f(0.0));
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);

  var gx1 = ixy1 * (1.0 / 7.0);
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);
  let sz1 = step(gz1, vec4f(0.0));
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);

  var g000 = vec3f(gx0.x, gy0.x, gz0.x);
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);

  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  let n000 = dot(g000, Pf0);
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
  let n111 = dot(g111, Pf1);

  let f = fadeCurve(Pf0);
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);
  let ny = mix(nz.xy, nz.zw, f.y);
  return 2.2 * mix(ny.x, ny.y, f.x);
}

fn fbm(p: vec3f) -> f32 {
  var total = 0.0;
  var amplitude = 1.0;
  var weight = 0.0;
  var frequency = 1.0;
  for (var i = 0; i < 2; i++) {
    total += amplitude * cnoise(p * frequency);
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total / weight;
}
`,P2=`
struct Params {
  resolution: vec4f,
  placement: vec4f,
  grid: vec4f,
  field: vec4f,
  motion: vec4f,
  color: vec4f,
  hover: vec4f,
  background: vec4f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var maskTexture: texture_2d<f32>;
@group(0) @binding(2) var maskSampler: sampler;
@group(0) @binding(3) var<storage, read> charges: array<f32>;

const SEED = vec2f(12.9898, 78.233);
const GLOW_THRESHOLD = 0.6;
${N2}

fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {
  let p = vec2f(abs(point.x), point.y);
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  let s = -sign(q.y);
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }
  if (shape == 1) { return length(p) - c; }
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = params.resolution.xy;
  let cellPx = params.grid.x;
  let dotSize = params.grid.y;
  let mode = i32(params.grid.z + 0.5);
  let cols = i32(params.grid.w + 0.5);
  let background = params.background.rgb;
  let toSurface = params.hover.w < 0.5;

  let pixel = uv * resolution;
  let origin = params.placement.xy;
  let rows = i32(params.placement.z + 0.5);
  let cell = floor((pixel - origin) / cellPx);
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }
  let center = origin + (cell + 0.5) * cellPx;
  let local = (pixel - center) / (cellPx * 0.5);
  let cellUv = center / resolution;

  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }

  var level = 1.0;
  let fade = params.motion.w;
  if (fade > 0.0) {
    let q = abs(uv * 2.0 - 1.0);
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);
  }
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);
  let band = i32(min(tone, 0.999999) * 3.0);

  var charge = 0.0;
  let index = i32(cell.y) * cols + i32(cell.x);
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;

  var shape = 2 - stepped;
  var size = dotSize;
  if (mode != 0) {
    shape = mode - 1;
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);
  }
  let introProgress = params.placement.w;
  var front = 0.0;
  if (introProgress < ${ol.toFixed(2)}) {
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * ${ng.toFixed(2)};
    let jitter = hash21(cell) * ${kM.toFixed(2)};
    let spread = radial + warp + jitter + ${ng.toFixed(2)};
    let band = ${GM.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);
    if (t <= 0.0) {
      return vec4f(background, select(0.0, 1.0, toSurface));
    }
    let back = t - 1.0;
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);
  }
  let aa = 2.0 / cellPx;
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));

  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));

  let rgb = mix(background, tint, coverage * level);
  if (toSurface) { return vec4f(rgb, 1.0); }
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;
  return vec4f(rgb, glow);
}
`,VM=`
struct Blur { direction: vec4f }
@group(0) @binding(0) var<uniform> blur: Blur;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;
@group(0) @binding(2) var sourceSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = blur.direction.z;
  let radius = i32(ceil(3.0 * sigma));
  var sum = vec3f(0.0);
  var weight = 0.0;
  for (var i = -radius; i <= radius; i++) {
    let offset = f32(i);
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;
    weight += w;
  }
  return vec4f(sum / weight, 1.0);
}
`,O2=`
struct Composite { strength: vec4f }
@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var glowTexture: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;
  return vec4f(scene + glow * composite.strength.x, 1.0);
}
`,tg=(t,e)=>{let n=typeof t=="string"?t.trim():"",r=(/^#?([\da-f]{3}|[\da-f]{6})$/i.exec(n)||/^#?([\da-f]{6})$/i.exec(e))[1];return r.length===3&&(r=r.replace(/./g,s=>s+s)),[0,2,4].map(s=>parseInt(r.slice(s,s+2),16)/255)};function rg({text:t="",fontFamily:e='Geist, "Geist Sans", system-ui, sans-serif',fontWeight:n=500,textSize:i=.6,shapes:r="mixed",cellSize:s=10,dotSize:a=.75,color:o="#929292",hoverColor:l="#ffffff",backgroundColor:c="#000000",speed:u=1,scale:f=1,contrast:d=1,brightness:h=.4,flow:p=0,direction:x=0,fade:b=.25,interactive:g=!0,splashRadius:m=40,splashStrength:y=.4,glow:_=.35,intro:S=!0,introDuration:A=1.6,introKey:E=0,paused:U=!1,onError:L,className:P=""}){let $=(0,Rt.useRef)(null),_e=(0,Rt.useRef)(null),[Re,Z]=(0,Rt.useState)(!1),I=(0,Rt.useRef)(null),W=(0,Rt.useRef)(()=>{}),Ee=(0,Rt.useRef)(()=>{}),Fe=(0,Rt.useRef)(L);I.current={text:String(t??""),fontFamily:e,fontWeight:n,textSize:i,shapes:r,cellSize:Math.max(2,s),dotSize:a,color:o,hoverColor:l,backgroundColor:c,speed:u,scale:Math.max(.05,f),contrast:d,brightness:h,flow:p,direction:x,fade:b,interactive:g,splashRadius:m,splashStrength:y,glow:_,intro:S,introDuration:Math.max(.1,A),introKey:E,paused:U},Fe.current=L;let Ie=[r,s,a,o,l,c,u,f,d,h,p,x,b,g,m,y,_,S,A,U].join("|"),Ze=[t,e,n,i].join("|"),ze=(0,Rt.useRef)(()=>{});return(0,Rt.useEffect)(()=>{W.current()},[Ie]),(0,Rt.useEffect)(()=>{Ee.current()},[Ze]),(0,Rt.useEffect)(()=>{E&&ze.current()},[E]),(0,Rt.useEffect)(()=>{let ce=$.current,Ne=_e.current;if(!ce||!Ne)return;let v=!1,M=!1,R,F,Se,Q=0,We=0,qn=0,an=[0,0],Te=1,Yn=!0,ds=!1,Ke=1,Je=1,at=10,de=[0,0],ht=new Float32Array(1),be=new Float32Array(1),Sn=new Float32Array(1),hs=0,gl=0,Ei=ol,Mr=!1,wr=!1,Er=null,Df,yl,xl,Ti=()=>{},Zn={x:0,y:0,at:0,inside:!1},Aa=window.matchMedia("(prefers-reduced-motion: reduce)"),vl=document.createElement("canvas"),Ln=vl.getContext("2d"),_l=()=>Ti(),Uf=()=>{Er=null},D1=(J,bt,bn)=>{let pt=I.current,Gt=Math.max(.5,pt.splashRadius*Te/at*.5),Mn=Math.ceil(Gt*2.5),Tr=(J*Te-de[0])/at-.5,Ai=(bt*Te-de[1])/at-.5,Ca=Math.max(0,Math.floor(Ai-Mn)),Ci=Math.min(Je-1,Math.ceil(Ai+Mn)),Ar=Math.max(0,Math.floor(Tr-Mn)),Ra=Math.min(Ke-1,Math.ceil(Tr+Mn));for(let Kn=Ca;Kn<=Ci;Kn++){let Cr=Kn-Ai;for(let Rr=Ar;Rr<=Ra;Rr++){let Da=Rr-Tr,Sl=bn*Math.exp(-(Da*Da+Cr*Cr)/(2*Gt*Gt)),Ua=Kn*Ke+Rr;be[Ua]=Math.min(1.2,be[Ua]+Sl)}}wr=!0},Jg=J=>{if(!I.current.interactive)return;Er||(Er=ce.getBoundingClientRect());let bt=performance.now(),bn=J.clientX-Er.left,pt=J.clientY-Er.top,Gt=bn>=0&&pt>=0&&bn<=Er.width&&pt<=Er.height;if(Gt){let Mn=Zn.inside?Math.max(8,bt-Zn.at):16,Ai=(Zn.inside?Math.hypot(bn-Zn.x,pt-Zn.y):0)/Mn*1e3;D1(bn,pt,Math.min(1,.22+Ai*6e-4)*I.current.splashStrength),Ti()}Zn.x=bn,Zn.y=pt,Zn.at=bt,Zn.inside=Gt},Lf=J=>{if(v||M)return;M=!0,Q&&cancelAnimationFrame(Q),Q=0,yl?.disconnect(),xl?.disconnect(),Df?.(),W.current=()=>{},Ee.current=()=>{};let bt=R;R=void 0,bt?.dispose(),Z(!1),Fe.current?.(J instanceof Error?J:new Error(String(J)))},Qg=()=>(Te=Math.min(window.devicePixelRatio||1,T2),[Math.max(1,Math.round(Ne.clientWidth*Te)),Math.max(1,Math.round(Ne.clientHeight*Te))]);return(async()=>{try{let J=await OM({powerPreference:"low-power"});if(R=J,v)return J.dispose();Df=J.onError(Lf);let bt=Qg(),bn=navigator.gpu.getPreferredCanvasFormat(),pt=bm(J,Ne,{dpr:Te,size:bt,autoResize:!1,format:bn}),Gt=ya(J,{resolution:[bt[0],bt[1],1/bt[0],1/bt[1]],placement:[0,0,1,0],grid:[10,.75,0,1],field:[320,.5,2.8,0],motion:[0,0,0,.25],color:[.573,.573,.573,1],hover:[1,1,1,0],background:[0,0,0,1]}),Mn=Tm(J,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),Tr=(B,j)=>J.device.createTexture({size:[B,j],format:"rgba8unorm",usage:["texture_binding","copy_dst","render_attachment"],label:"shape-waves-mask"}),Ai=Tr(1,1);F=Ai;let Ca=nf(J,4,"read");Ca.write(ht),Se=Ca;let Ci=ma(J,P2,{label:"shape-waves-scene",set:{params:Gt,maskTexture:Ai,maskSampler:Mn,charges:Ca}}),Ar=sl(J,{size:bt,format:"rgba8unorm",label:"shape-waves-scene"}),Ra=B=>[Math.max(1,Math.ceil(B[0]/2)),Math.max(1,Math.ceil(B[1]/2))],Kn=sl(J,{size:Ra(bt),format:"rgba8unorm",label:"shape-waves-glow-a"}),Cr=sl(J,{size:Ra(bt),format:"rgba8unorm",label:"shape-waves-glow-b"}),Rr=ya(J,{direction:[0,0,4,1]}),Da=ya(J,{direction:[0,0,4,0]}),Sl=ma(J,VM,{label:"shape-waves-glow-x",set:{blur:Rr,sourceTexture:Ar,sourceSampler:Mn}}),Ua=ma(J,VM,{label:"shape-waves-glow-y",set:{blur:Da,sourceTexture:Kn,sourceSampler:Mn}}),jg=ya(J,{strength:[2,0,0,0]}),e0=ma(J,O2,{label:"shape-waves-composite",set:{composite:jg,sceneTexture:Ar,glowTexture:Cr,linearSampler:Mn}});if(await Promise.all([Ci.compile({colors:[bn]}),Ci.compile(Ar),Sl.compile(Kn),Ua.compile(Cr),e0.compile({colors:[bn]})]),v)return;let t0=()=>I.current.glow>0,n0=!1,U1=()=>{let B=I.current,[j,Qe]=pt.size,mt=Math.max(1,Math.round(j/(B.cellSize*Te)));at=j/mt;let Ve=Math.max(1,Math.floor(Qe/at));if(de=[0,(Qe-Ve*at)/2],mt===Ke&&Ve===Je&&ht.length===Ke*Je)return;Ke=mt,Je=Ve,ht=new Float32Array(Ke*Je),be=new Float32Array(Ke*Je),Sn=new Float32Array(Ke*Je),wr=!1;let wn=nf(J,ht.byteLength,"read");wn.write(ht),Ci.set({charges:wn}),Se?.destroy(),Se=wn},L1=()=>{let B=Ke-1,j=Je-1,Qe=0;for(let Ve=0;Ve<Je;Ve++){let wn=(Ve===0?Ve:Ve-1)*Ke,Xe=(Ve===j?Ve:Ve+1)*Ke,kt=Ve*Ke;for(let Mt=0;Mt<Ke;Mt++){let Jn=kt+Mt,bl=kt+(Mt===0?Mt:Mt-1),Ml=kt+(Mt===B?Mt:Mt+1),Ri=be[Jn],Pf=be[bl]+be[Ml]+be[wn+Mt]+be[Xe+Mt]-4*Ri,Of=(Ri-Sn[Jn])*U2,a0=(Ri+Of+D2*Pf)*L2;Sn[Jn]=a0;let Bf=Math.min(1,Math.max(0,a0));ht[Jn]=Bf,Bf>Qe&&(Qe=Bf)}}let mt=be;return be=Sn,Sn=mt,Qe},I1=B=>{if(!wr)return!1;hs=Math.min(hs+B,eg*4);let j=1;for(;hs>=eg;)hs-=eg,j=L1();return j<I2&&(be.fill(0),Sn.fill(0),ht.fill(0),wr=!1),Se?.write(ht),wr},N1=()=>{let B=I.current;return Yn&&!document.hidden&&!B.paused&&B.speed>0&&!Aa.matches},i0=B=>{if(Q=0,v||M)return;let j=I.current,Qe=We?Math.min(.1,(B-We)/1e3):0;We=B;let mt=N1();if(mt){qn+=Qe*R2*j.speed;let Xe=j.direction*Math.PI/180,kt=j.flow*at*Qe;an=[an[0]+Math.cos(Xe)*kt,an[1]+Math.sin(Xe)*kt]}let Ve=Yn&&!document.hidden&&I1(Qe);Mr&&(Mr=!1,gl=B,Ei=0);let wn=Ei<ol;wn&&(Ei=Math.min(ol,(B-gl)/1e3/j.introDuration*ol)),Gt.set({placement:[de[0],de[1],Je,Ei]}),Gt.set({field:[C2*at*j.scale,.5-(j.brightness-.5)*.4,2.8*j.contrast,qn]}),Gt.set({motion:[an[0],an[1],j.text.trim()?1:0,j.fade]});try{Hm(J,Xe=>{if(!t0()){Xe.pass(pt,Ci);return}Xe.pass(Ar,Ci),Xe.pass(Kn,Sl),Xe.pass(Cr,Ua),Xe.pass(pt,e0)})}catch(Xe){Lf(Xe);return}ds||(ds=!0,Z(!0)),mt||Ve||wn?Q=requestAnimationFrame(i0):We=0};Ti=()=>{v||M||Q||(Q=requestAnimationFrame(i0))};let If=()=>{let B=I.current,j=B.text.trim(),[Qe,mt]=pt.size,Ve=j.length>0,wn=Ve?Math.min(1,A2/Math.max(Qe,mt)):0,Xe=Ve?Math.max(1,Math.round(Qe*wn)):1,kt=Ve?Math.max(1,Math.round(mt*wn)):1;if(vl.width=Xe,vl.height=kt,Ln.fillStyle="#000",Ln.fillRect(0,0,Xe,kt),Ve){let Jn=Math.max(1,B.textSize*kt);Ln.font=`${B.fontWeight} ${Jn}px ${B.fontFamily}`;let bl=Ln.measureText(j).width,Ml=Xe*.9;bl>Ml&&(Jn=Math.max(1,Jn*Ml/bl),Ln.font=`${B.fontWeight} ${Jn}px ${B.fontFamily}`),Ln.textAlign="center",Ln.textBaseline="alphabetic";let Ri=Ln.measureText(j),Pf=(Xe+Ri.actualBoundingBoxLeft-Ri.actualBoundingBoxRight)/2,Of=(kt+Ri.actualBoundingBoxAscent-Ri.actualBoundingBoxDescent)/2;Ln.fillStyle="#fff",Ln.fillText(j,Pf,Of)}let Mt=Tr(Xe,kt);J.gpu.queue.copyExternalImageToTexture({source:vl},{texture:Mt.gpu},[Xe,kt]),Ci.set({maskTexture:Mt}),F?.destroy(),F=Mt},Nf=()=>{if(v||M)return;let B=I.current;U1(),Gt.set({placement:[de[0],de[1],Je,Ei],grid:[at,Math.min(1,Math.max(.1,B.dotSize)),E2[B.shapes]??0,Ke],color:[...tg(B.color,"#929292"),1],hover:[...tg(B.hoverColor,"#ffffff"),t0()?1:0],background:[...tg(B.backgroundColor,"#000000"),1]}),jg.set({strength:[2*B.glow,0,0,0]}),B.intro!==n0&&(n0=B.intro,B.intro&&!Aa.matches&&(Mr=!0)),!B.interactive&&wr&&(be.fill(0),Sn.fill(0),ht.fill(0),wr=!1,Se?.write(ht)),Ti()},r0=()=>{if(v||M)return;If(),Nf();let B=I.current;!B.text.trim()||!document.fonts?.load||document.fonts.load(`${B.fontWeight} 32px ${B.fontFamily}`).then(()=>{v||M||(If(),Ti())}).catch(()=>{})},s0=()=>{if(v||M)return;Uf();let B=Qg();(B[0]!==pt.size[0]||B[1]!==pt.size[1])&&pt.resize(B);let[j,Qe]=pt.size;Ar.resize([j,Qe]);let mt=Ra([j,Qe]);Kn.resize(mt),Cr.resize(mt),Rr.set({direction:[1/mt[0],0,4,1]}),Da.set({direction:[0,1/mt[1],4,0]}),Gt.set({resolution:[j,Qe,1/j,1/Qe]}),If(),Nf()};W.current=Nf,Ee.current=r0,ze.current=()=>{v||M||!I.current.intro||Aa.matches||(Mr=!0,Ti())},yl=new ResizeObserver(s0),yl.observe(ce),xl=new IntersectionObserver(B=>{Yn=B.some(j=>j.isIntersecting),Yn&&Ti()},{threshold:0}),xl.observe(ce),document.addEventListener("visibilitychange",_l),Aa.addEventListener("change",_l),window.addEventListener("pointermove",Jg,{passive:!0}),window.addEventListener("scroll",Uf,{capture:!0,passive:!0}),s0(),r0()}catch(J){Lf(J)}})(),()=>{v=!0,Ti=()=>{},W.current=()=>{},Ee.current=()=>{},ze.current=()=>{},document.removeEventListener("visibilitychange",_l),Aa.removeEventListener("change",_l),window.removeEventListener("pointermove",Jg),window.removeEventListener("scroll",Uf,{capture:!0}),yl?.disconnect(),xl?.disconnect(),Df?.(),Q&&cancelAnimationFrame(Q),F?.destroy(),Se?.destroy(),R?.dispose()}},[]),(0,ig.jsx)("div",{ref:$,className:`pointer-events-none relative isolate h-full w-full overflow-hidden ${P}`,"data-ready":Re,style:{backgroundColor:c},"aria-hidden":"true",children:(0,ig.jsx)("canvas",{ref:_e,className:`pointer-events-none absolute inset-0 block h-full w-full transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${Re?"opacity-100":"opacity-0"}`})})}var i1=1;var r1=3;var dg=0,hg=1,pg=2,mg=3,gg=4,yg=5,xg=6,vg=7,s1=0,a1=1,o1=2;var Ig=1,Ng=2,Pg=3,Og=4,Bg=5,Fg=6,zg=7;var Vg=300,l1=301,Gg=302;var c1=306,_g=1e3,cl=1001,Sg=1002;var u1=1006;var f1=1008;var d1=1009;var h1=1023;var dl=2300,uf=2301,lf=2302,bg=2303,Mg=2400,wg=2401,Eg=2402;var kg="",_n="srgb",Tg="srgb-linear",Ag="linear",cf="srgb";var ul=2e3,Cg=2001;function B2(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Rg(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}var HM={},ff=null;function p1(t){let e=t[0];if(typeof e=="string"&&e.startsWith("TSL:")){let n=t[1];n&&n.isStackTrace?t[0]+=" "+n.getLocation():t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function dt(...t){t=p1(t);let e="THREE."+t.shift();if(ff)ff("warn",e,...t);else{let n=t[0];n&&n.isStackTrace?console.warn(n.getError(e)):console.warn(e,...t)}}function rt(...t){t=p1(t);let e="THREE."+t.shift();if(ff)ff("error",e,...t);else{let n=t[0];n&&n.isStackTrace?console.error(n.getError(e)):console.error(e,...t)}}function Ma(...t){let e=t.join(" ");e in HM||(HM[e]=!0,dt(...t))}var F2={[dg]:hg,[pg]:xg,[gg]:vg,[mg]:yg,[hg]:dg,[xg]:pg,[vg]:gg,[yg]:mg},hl=class{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let n=this._listeners;if(n===void 0)return;let i=n[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}},vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],$M=1234567,m1=Math.PI/180,Hg=180/Math.PI;function Ef(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(vt[t&255]+vt[t>>8&255]+vt[t>>16&255]+vt[t>>24&255]+"-"+vt[e&255]+vt[e>>8&255]+"-"+vt[e>>16&15|64]+vt[e>>24&255]+"-"+vt[n&63|128]+vt[n>>8&255]+"-"+vt[n>>16&255]+vt[n>>24&255]+vt[i&255]+vt[i>>8&255]+vt[i>>16&255]+vt[i>>24&255]).toLowerCase()}function q(t,e,n){return Math.max(e,Math.min(n,t))}function $g(t,e){return(t%e+e)%e}function z2(t,e,n,i,r){return i+(t-e)*(r-i)/(n-e)}function V2(t,e,n){return t!==e?(n-t)/(e-t):0}function fl(t,e,n){return(1-n)*t+n*e}function G2(t,e,n,i){return fl(t,e,1-Math.exp(-n*i))}function k2(t,e=1){return e-Math.abs($g(t,e*2)-e)}function H2(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*(3-2*t))}function $2(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*t*(t*(t*6-15)+10))}function W2(t,e){return t+Math.floor(Math.random()*(e-t+1))}function X2(t,e){return t+Math.random()*(e-t)}function q2(t){return t*(.5-Math.random())}function Y2(t){t!==void 0&&($M=t);let e=$M+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Z2(t){return t*m1}function K2(t){return t*Hg}function J2(t){return t>0&&Number.isInteger(t)&&2**Math.round(Math.log2(t))===t}function Q2(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function j2(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function e3(t,e,n,i,r){let s=Math.cos,a=Math.sin,o=s(n/2),l=a(n/2),c=s((e+i)/2),u=a((e+i)/2),f=s((e-i)/2),d=a((e-i)/2),h=s((i-e)/2),p=a((i-e)/2);switch(r){case"XYX":t.set(o*u,l*f,l*d,o*c);break;case"YZY":t.set(l*d,o*u,l*f,o*c);break;case"ZXZ":t.set(l*f,l*d,o*u,o*c);break;case"XZX":t.set(o*u,l*p,l*h,o*c);break;case"YXY":t.set(l*h,o*u,l*p,o*c);break;case"ZYZ":t.set(l*p,l*h,o*u,o*c);break;default:dt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function t3(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:case Uint8ClampedArray:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function n3(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Wg={DEG2RAD:m1,RAD2DEG:Hg,generateUUID:Ef,clamp:q,euclideanModulo:$g,mapLinear:z2,inverseLerp:V2,lerp:fl,damp:G2,pingpong:k2,smoothstep:H2,smootherstep:$2,randInt:W2,randFloat:X2,randFloatSpread:q2,seededRandom:Y2,degToRad:Z2,radToDeg:K2,isPowerOfTwo:J2,ceilPowerOfTwo:Q2,floorPowerOfTwo:j2,setQuaternionFromProperEuler:e3,normalize:n3,denormalize:t3},Un=class t{static{t.prototype.isVector2=!0}constructor(e=0,n=0){this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=q(this.x,e.x,n.x),this.y=q(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=q(this.x,e,n),this.y=q(this.y,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(q(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(q(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){let i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},wi=class{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],f=i[r+3],d=s[a+0],h=s[a+1],p=s[a+2],x=s[a+3];if(f!==x||l!==d||c!==h||u!==p){let b=l*d+c*h+u*p+f*x;b<0&&(d=-d,h=-h,p=-p,x=-x,b=-b);let g=1-o;if(b<.9995){let m=Math.acos(b),y=Math.sin(m);g=Math.sin(g*m)/y,o=Math.sin(o*m)/y,l=l*g+d*o,c=c*g+h*o,u=u*g+p*o,f=f*g+x*o}else{l=l*g+d*o,c=c*g+h*o,u=u*g+p*o,f=f*g+x*o;let m=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=m,c*=m,u*=m,f*=m}}e[n]=l,e[n+1]=c,e[n+2]=u,e[n+3]=f}static multiplyQuaternionsFlat(e,n,i,r,s,a){let o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],f=s[a],d=s[a+1],h=s[a+2],p=s[a+3];return e[n]=o*p+u*f+l*h-c*d,e[n+1]=l*p+u*d+c*f-o*h,e[n+2]=c*p+u*h+o*d-l*f,e[n+3]=u*p-o*f-l*d-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){let i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),f=o(s/2),d=l(i/2),h=l(r/2),p=l(s/2);switch(a){case"XYZ":this._x=d*u*f+c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f-d*h*p;break;case"YXZ":this._x=d*u*f+c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f+d*h*p;break;case"ZXY":this._x=d*u*f-c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f-d*h*p;break;case"ZYX":this._x=d*u*f-c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f+d*h*p;break;case"YZX":this._x=d*u*f+c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f-d*h*p;break;case"XZY":this._x=d*u*f-c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f+d*h*p;break;default:dt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){let i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],c=n[2],u=n[6],f=n[10],d=i+o+f;if(d>0){let h=.5/Math.sqrt(d+1);this._w=.25/h,this._x=(u-l)*h,this._y=(s-c)*h,this._z=(a-r)*h}else if(i>o&&i>f){let h=2*Math.sqrt(1+i-o-f);this._w=(u-l)/h,this._x=.25*h,this._y=(r+a)/h,this._z=(s+c)/h}else if(o>f){let h=2*Math.sqrt(1+o-i-f);this._w=(s-c)/h,this._x=(r+a)/h,this._y=.25*h,this._z=(l+u)/h}else{let h=2*Math.sqrt(1+f-i-o);this._w=(a-r)/h,this._x=(s+c)/h,this._y=(l+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(q(this.dot(e),-1,1)))}rotateTowards(e,n){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){let i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,c=n._z,u=n._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){let i=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,r=-r,s=-s,a=-a,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,n=Math.sin(n*c)/u,this._x=this._x*l+i*n,this._y=this._y*l+r*n,this._z=this._z*l+s*n,this._w=this._w*l+a*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+r*n,this._z=this._z*l+s*n,this._w=this._w*l+a*n,this.normalize();return this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){let e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},ve=class t{static{t.prototype.isVector3=!0}constructor(e=0,n=0,i=0){this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(WM.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(WM.setFromAxisAngle(e,n))}applyMatrix3(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){let n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*i),u=2*(o*n-s*r),f=2*(s*i-a*n);return this.x=n+l*c+a*f-o*u,this.y=i+l*u+o*c-s*f,this.z=r+l*f+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=q(this.x,e.x,n.x),this.y=q(this.y,e.y,n.y),this.z=q(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=q(this.x,e,n),this.y=q(this.y,e,n),this.z=q(this.z,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(q(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){let i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){let n=e.lengthSq();if(n===0)return this.set(0,0,0);let i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return sg.copy(this).projectOnVector(e),this.sub(sg)}reflect(e){return this.sub(sg.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(q(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){let r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){let n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},sg=new ve,WM=new wi,G=class t{static{t.prototype.isMatrix3=!0}constructor(e,n,i,r,s,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c)}set(e,n,i,r,s,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=n,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],f=i[7],d=i[2],h=i[5],p=i[8],x=r[0],b=r[3],g=r[6],m=r[1],y=r[4],_=r[7],S=r[2],A=r[5],E=r[8];return s[0]=a*x+o*m+l*S,s[3]=a*b+o*y+l*A,s[6]=a*g+o*_+l*E,s[1]=c*x+u*m+f*S,s[4]=c*b+u*y+f*A,s[7]=c*g+u*_+f*E,s[2]=d*x+h*m+p*S,s[5]=d*b+h*y+p*A,s[8]=d*g+h*_+p*E,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return n*a*u-n*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=u*a-o*c,d=o*l-u*s,h=c*s-a*l,p=n*f+i*d+r*h;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=f*x,e[1]=(r*c-u*i)*x,e[2]=(o*i-r*a)*x,e[3]=d*x,e[4]=(u*n-r*l)*x,e[5]=(r*s-o*n)*x,e[6]=h*x,e[7]=(i*l-c*n)*x,e[8]=(a*n-i*s)*x,this}transpose(){let e,n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+n,0,0,1),this}scale(e,n){return Ma("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ag.makeScale(e,n)),this}rotate(e){return Ma("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ag.makeRotation(-e)),this}translate(e,n){return Ma("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ag.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ag=new G,XM=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qM=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function i3(){let t={enabled:!0,workingColorSpace:Tg,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===cf&&(r.r=bi(r.r),r.g=bi(r.g),r.b=bi(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===cf&&(r.r=wa(r.r),r.g=wa(r.g),r.b=wa(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===kg?Ag:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Ma("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),t.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Ma("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),t.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return t.define({[Tg]:{primaries:e,whitePoint:i,transfer:Ag,toXYZ:XM,fromXYZ:qM,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:_n},outputColorSpaceConfig:{drawingBufferColorSpace:_n}},[_n]:{primaries:e,whitePoint:i,transfer:cf,toXYZ:XM,fromXYZ:qM,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:_n}}}),t}var vn=i3();function bi(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function wa(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}var xa,df=class{static getDataURL(e,n="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{xa===void 0&&(xa=Rg("canvas")),xa.width=e.width,xa.height=e.height;let r=xa.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=xa}return i.toDataURL(n)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let n=Rg("canvas");n.width=e.width,n.height=e.height;let i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=bi(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){let n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(bi(n[i]/255)*255):n[i]=bi(n[i]);return{data:n,width:e.width,height:e.height}}else return dt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},r3=0,hf=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:r3++}),this.uuid=Ef(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?e.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?e.set(n.displayWidth,n.displayHeight,0):n!==null?e.set(n.width,n.height,n.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(og(r[a].image)):s.push(og(r[a]))}else s=og(r);i.url=s}return n||(e.images[this.uuid]=i),i}};function og(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?df.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(dt("Texture: Unable to serialize Texture."),{})}var s3=0,lg=new ve,Ea=class t extends hl{constructor(e=t.DEFAULT_IMAGE,n=t.DEFAULT_MAPPING,i=cl,r=cl,s=u1,a=f1,o=h1,l=d1,c=t.DEFAULT_ANISOTROPY,u=kg){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:s3++}),this.uuid=Ef(),this.name="",this.source=new hf(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Un(0,0),this.repeat=new Un(1,1),this.center=new Un(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(lg).x}get height(){return this.source.getSize(lg).y}get depth(){return this.source.getSize(lg).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let n in e){let i=e[n];if(i===void 0){dt(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let r=this[n];if(r===void 0){dt(`Texture.setValues(): property '${n}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case _g:e.x=e.x-Math.floor(e.x);break;case cl:e.x=e.x<0?0:1;break;case Sg:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case _g:e.y=e.y-Math.floor(e.y);break;case cl:e.y=e.y<0?0:1;break;case Sg:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ea.DEFAULT_IMAGE=null;Ea.DEFAULT_MAPPING=Vg;Ea.DEFAULT_ANISOTROPY=1;var Dg=class t{static{t.prototype.isVector4=!0}constructor(e=0,n=0,i=0,r=1){this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s,l=e.elements,c=l[0],u=l[4],f=l[8],d=l[1],h=l[5],p=l[9],x=l[2],b=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(f-x)<.01&&Math.abs(p-b)<.01){if(Math.abs(u+d)<.1&&Math.abs(f+x)<.1&&Math.abs(p+b)<.1&&Math.abs(c+h+g-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let y=(c+1)/2,_=(h+1)/2,S=(g+1)/2,A=(u+d)/4,E=(f+x)/4,U=(p+b)/4;return y>_&&y>S?y<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(y),r=A/i,s=E/i):_>S?_<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(_),i=A/r,s=U/r):S<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(S),i=E/s,r=U/s),this.set(i,r,s,n),this}let m=Math.sqrt((b-p)*(b-p)+(f-x)*(f-x)+(d-u)*(d-u));return Math.abs(m)<.001&&(m=1),this.x=(b-p)/m,this.y=(f-x)/m,this.z=(d-u)/m,this.w=Math.acos((c+h+g-1)/2),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=q(this.x,e.x,n.x),this.y=q(this.y,e.y,n.y),this.z=q(this.z,e.z,n.z),this.w=q(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=q(this.x,e,n),this.y=q(this.y,e,n),this.z=q(this.z,e,n),this.w=q(this.w,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(q(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};var Mi=class t{static{t.prototype.isMatrix4=!0}constructor(e,n,i,r,s,a,o,l,c,u,f,d,h,p,x,b){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c,u,f,d,h,p,x,b)}set(e,n,i,r,s,a,o,l,c,u,f,d,h,p,x,b){let g=this.elements;return g[0]=e,g[4]=n,g[8]=i,g[12]=r,g[1]=s,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=f,g[14]=d,g[3]=h,g[7]=p,g[11]=x,g[15]=b,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new t().fromArray(this.elements)}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){let n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){let n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return this.determinantAffine()===0?(e.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let n=this.elements,i=e.elements,r=1/va.setFromMatrixColumn(e,0).length(),s=1/va.setFromMatrixColumn(e,1).length(),a=1/va.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){let n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),f=Math.sin(s);if(e.order==="XYZ"){let d=a*u,h=a*f,p=o*u,x=o*f;n[0]=l*u,n[4]=-l*f,n[8]=c,n[1]=h+p*c,n[5]=d-x*c,n[9]=-o*l,n[2]=x-d*c,n[6]=p+h*c,n[10]=a*l}else if(e.order==="YXZ"){let d=l*u,h=l*f,p=c*u,x=c*f;n[0]=d+x*o,n[4]=p*o-h,n[8]=a*c,n[1]=a*f,n[5]=a*u,n[9]=-o,n[2]=h*o-p,n[6]=x+d*o,n[10]=a*l}else if(e.order==="ZXY"){let d=l*u,h=l*f,p=c*u,x=c*f;n[0]=d-x*o,n[4]=-a*f,n[8]=p+h*o,n[1]=h+p*o,n[5]=a*u,n[9]=x-d*o,n[2]=-a*c,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){let d=a*u,h=a*f,p=o*u,x=o*f;n[0]=l*u,n[4]=p*c-h,n[8]=d*c+x,n[1]=l*f,n[5]=x*c+d,n[9]=h*c-p,n[2]=-c,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){let d=a*l,h=a*c,p=o*l,x=o*c;n[0]=l*u,n[4]=x-d*f,n[8]=p*f+h,n[1]=f,n[5]=a*u,n[9]=-o*u,n[2]=-c*u,n[6]=h*f+p,n[10]=d-x*f}else if(e.order==="XZY"){let d=a*l,h=a*c,p=o*l,x=o*c;n[0]=l*u,n[4]=-f,n[8]=c*u,n[1]=d*f+x,n[5]=a*u,n[9]=h*f-p,n[2]=p*f-h,n[6]=o*u,n[10]=x*f+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(a3,e,o3)}lookAt(e,n,i){let r=this.elements;return nn.subVectors(e,n),nn.lengthSq()===0&&(nn.z=1),nn.normalize(),gr.crossVectors(i,nn),gr.lengthSq()===0&&(Math.abs(i.z)===1?nn.x+=1e-4:nn.z+=1e-4,nn.normalize(),gr.crossVectors(i,nn)),gr.normalize(),sf.crossVectors(nn,gr),r[0]=gr.x,r[4]=sf.x,r[8]=nn.x,r[1]=gr.y,r[5]=sf.y,r[9]=nn.y,r[2]=gr.z,r[6]=sf.z,r[10]=nn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],f=i[5],d=i[9],h=i[13],p=i[2],x=i[6],b=i[10],g=i[14],m=i[3],y=i[7],_=i[11],S=i[15],A=r[0],E=r[4],U=r[8],L=r[12],P=r[1],$=r[5],_e=r[9],Re=r[13],Z=r[2],I=r[6],W=r[10],Ee=r[14],Fe=r[3],Ie=r[7],Ze=r[11],ze=r[15];return s[0]=a*A+o*P+l*Z+c*Fe,s[4]=a*E+o*$+l*I+c*Ie,s[8]=a*U+o*_e+l*W+c*Ze,s[12]=a*L+o*Re+l*Ee+c*ze,s[1]=u*A+f*P+d*Z+h*Fe,s[5]=u*E+f*$+d*I+h*Ie,s[9]=u*U+f*_e+d*W+h*Ze,s[13]=u*L+f*Re+d*Ee+h*ze,s[2]=p*A+x*P+b*Z+g*Fe,s[6]=p*E+x*$+b*I+g*Ie,s[10]=p*U+x*_e+b*W+g*Ze,s[14]=p*L+x*Re+b*Ee+g*ze,s[3]=m*A+y*P+_*Z+S*Fe,s[7]=m*E+y*$+_*I+S*Ie,s[11]=m*U+y*_e+_*W+S*Ze,s[15]=m*L+y*Re+_*Ee+S*ze,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],f=e[6],d=e[10],h=e[14],p=e[3],x=e[7],b=e[11],g=e[15],m=l*h-c*d,y=o*h-c*f,_=o*d-l*f,S=a*h-c*u,A=a*d-l*u,E=a*f-o*u;return n*(x*m-b*y+g*_)-i*(p*m-b*S+g*A)+r*(p*y-x*S+g*E)-s*(p*_-x*A+b*E)}determinantAffine(){let e=this.elements,n=e[0],i=e[4],r=e[8],s=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return n*(a*u-o*c)-i*(s*u-o*l)+r*(s*c-a*l)}transpose(){let e=this.elements,n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=e[9],d=e[10],h=e[11],p=e[12],x=e[13],b=e[14],g=e[15],m=n*o-i*a,y=n*l-r*a,_=n*c-s*a,S=i*l-r*o,A=i*c-s*o,E=r*c-s*l,U=u*x-f*p,L=u*b-d*p,P=u*g-h*p,$=f*b-d*x,_e=f*g-h*x,Re=d*g-h*b,Z=m*Re-y*_e+_*$+S*P-A*L+E*U;if(Z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/Z;return e[0]=(o*Re-l*_e+c*$)*I,e[1]=(r*_e-i*Re-s*$)*I,e[2]=(x*E-b*A+g*S)*I,e[3]=(d*A-f*E-h*S)*I,e[4]=(l*P-a*Re-c*L)*I,e[5]=(n*Re-r*P+s*L)*I,e[6]=(b*_-p*E-g*y)*I,e[7]=(u*E-d*_+h*y)*I,e[8]=(a*_e-o*P+c*U)*I,e[9]=(i*P-n*_e-s*U)*I,e[10]=(p*A-x*_+g*m)*I,e[11]=(f*_-u*A-h*m)*I,e[12]=(o*L-a*$-l*U)*I,e[13]=(n*$-i*L+r*U)*I,e[14]=(x*y-p*S-b*m)*I,e[15]=(u*S-f*y+d*m)*I,this}scale(e){let n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){let n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){let i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){let r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,c=s+s,u=a+a,f=o+o,d=s*c,h=s*u,p=s*f,x=a*u,b=a*f,g=o*f,m=l*c,y=l*u,_=l*f,S=i.x,A=i.y,E=i.z;return r[0]=(1-(x+g))*S,r[1]=(h+_)*S,r[2]=(p-y)*S,r[3]=0,r[4]=(h-_)*A,r[5]=(1-(d+g))*A,r[6]=(b+m)*A,r[7]=0,r[8]=(p+y)*E,r[9]=(b-m)*E,r[10]=(1-(d+x))*E,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),n.identity(),this;let a=va.set(r[0],r[1],r[2]).length(),o=va.set(r[4],r[5],r[6]).length(),l=va.set(r[8],r[9],r[10]).length();s<0&&(a=-a),Dn.copy(this);let c=1/a,u=1/o,f=1/l;return Dn.elements[0]*=c,Dn.elements[1]*=c,Dn.elements[2]*=c,Dn.elements[4]*=u,Dn.elements[5]*=u,Dn.elements[6]*=u,Dn.elements[8]*=f,Dn.elements[9]*=f,Dn.elements[10]*=f,n.setFromRotationMatrix(Dn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,n,i,r,s,a,o=ul,l=!1){let c=this.elements,u=2*s/(n-e),f=2*s/(i-r),d=(n+e)/(n-e),h=(i+r)/(i-r),p,x;if(l)p=s/(a-s),x=a*s/(a-s);else if(o===ul)p=-(a+s)/(a-s),x=-2*a*s/(a-s);else if(o===Cg)p=-a/(a-s),x=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=f,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=ul,l=!1){let c=this.elements,u=2/(n-e),f=2/(i-r),d=-(n+e)/(n-e),h=-(i+r)/(i-r),p,x;if(l)p=1/(a-s),x=a/(a-s);else if(o===ul)p=-2/(a-s),x=-(a+s)/(a-s);else if(o===Cg)p=-1/(a-s),x=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=f,c[9]=0,c[13]=h,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}},va=new ve,Dn=new Mi,a3=new ve(0,0,0),o3=new ve(1,1,1),gr=new ve,sf=new ve,nn=new ve,YM=new Mi,ZM=new wi,pl=class t{constructor(e=0,n=0,i=0,r=t.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){let r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],f=r[2],d=r[6],h=r[10];switch(n){case"XYZ":this._y=Math.asin(q(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-q(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,h),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(q(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,h),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-q(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,h),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(q(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,h));break;case"XZY":this._z=Math.asin(-q(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,h),this._y=0);break;default:dt("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return YM.makeRotationFromQuaternion(e),this.setFromRotationMatrix(YM,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return ZM.setFromEuler(this),this.setFromQuaternion(ZM,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pl.DEFAULT_ORDER="XYZ";var pf=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},l3=0,KM=new ve,_a=new wi,Si=new Mi,af=new ve,ll=new ve,c3=new ve,u3=new wi,JM=new ve(1,0,0),QM=new ve(0,1,0),jM=new ve(0,0,1),e1={type:"added"},f3={type:"removed"},Sa={type:"childadded",child:null},cg={type:"childremoved",child:null},Ta=class t extends hl{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:l3++}),this.uuid=Ef(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=t.DEFAULT_UP.clone();let e=new ve,n=new pl,i=new wi,r=new ve(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Mi},normalMatrix:{value:new G}}),this.matrix=new Mi,this.matrixWorld=new Mi,this.matrixAutoUpdate=t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return _a.setFromAxisAngle(e,n),this.quaternion.multiply(_a),this}rotateOnWorldAxis(e,n){return _a.setFromAxisAngle(e,n),this.quaternion.premultiply(_a),this}rotateX(e){return this.rotateOnAxis(JM,e)}rotateY(e){return this.rotateOnAxis(QM,e)}rotateZ(e){return this.rotateOnAxis(jM,e)}translateOnAxis(e,n){return KM.copy(e).applyQuaternion(this.quaternion),this.position.add(KM.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(JM,e)}translateY(e){return this.translateOnAxis(QM,e)}translateZ(e){return this.translateOnAxis(jM,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Si.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?af.copy(e):af.set(e,n,i);let r=this.parent;this.updateWorldMatrix(!0,!1),ll.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Si.lookAt(ll,af,this.up):Si.lookAt(af,ll,this.up),this.quaternion.setFromRotationMatrix(Si),r&&(Si.extractRotation(r.matrixWorld),_a.setFromRotationMatrix(Si),this.quaternion.premultiply(_a.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(rt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(e1),Sa.child=e,this.dispatchEvent(Sa),Sa.child=null):rt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(f3),cg.child=e,this.dispatchEvent(cg),cg.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Si.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Si.multiply(e.parent.matrixWorld)),e.applyMatrix4(Si),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(e1),Sa.child=e,this.dispatchEvent(Sa),Sa.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){let a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ll,e,c3),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ll,u3,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){let n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let n=e.x,i=e.y,r=e.z,s=this.matrix.elements;s[12]+=n-s[0]*n-s[4]*i-s[8]*r,s[13]+=i-s[1]*n-s[5]*i-s[9]*r,s[14]+=r-s[2]*n-s[6]*i-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n,i=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];s(e.shapes,f)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),f=a(e.shapes),d=a(e.skeletons),h=a(e.animations),p=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),d.length>0&&(i.skeletons=d),h.length>0&&(i.animations=h),p.length>0&&(i.nodes=p)}return i.object=r,i;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ta.DEFAULT_UP=new ve(0,1,0);Ta.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ta.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var g1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yr={h:0,s:0,l:0},of={h:0,s:0,l:0};function ug(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}var st=class{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=_n){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,vn.colorSpaceToWorking(this,n),this}setRGB(e,n,i,r=vn.workingColorSpace){return this.r=e,this.g=n,this.b=i,vn.colorSpaceToWorking(this,r),this}setHSL(e,n,i,r=vn.workingColorSpace){if(e=$g(e,1),n=q(n,0,1),i=q(i,0,1),n===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=ug(a,s,e+1/3),this.g=ug(a,s,e),this.b=ug(a,s,e-1/3)}return vn.colorSpaceToWorking(this,r),this}setStyle(e,n=_n){function i(s){s!==void 0&&parseFloat(s)<1&&dt("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:dt("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);dt("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=_n){let i=g1[e.toLowerCase()];return i!==void 0?this.setHex(i,n):dt("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bi(e.r),this.g=bi(e.g),this.b=bi(e.b),this}copyLinearToSRGB(e){return this.r=wa(e.r),this.g=wa(e.g),this.b=wa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=_n){return vn.workingToColorSpace(_t.copy(this),e),Math.round(q(_t.r*255,0,255))*65536+Math.round(q(_t.g*255,0,255))*256+Math.round(q(_t.b*255,0,255))}getHexString(e=_n){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=vn.workingColorSpace){vn.workingToColorSpace(_t.copy(this),n);let i=_t.r,r=_t.g,s=_t.b,a=Math.max(i,r,s),o=Math.min(i,r,s),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case i:l=(r-s)/f+(r<s?6:0);break;case r:l=(s-i)/f+2;break;case s:l=(i-r)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,n=vn.workingColorSpace){return vn.workingToColorSpace(_t.copy(this),n),e.r=_t.r,e.g=_t.g,e.b=_t.b,e}getStyle(e=_n){vn.workingToColorSpace(_t.copy(this),e);let n=_t.r,i=_t.g,r=_t.b;return e!==_n?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(yr),this.setHSL(yr.h+e,yr.s+n,yr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(yr),e.getHSL(of);let i=fl(yr.h,of.h,n),r=fl(yr.s,of.s,n),s=fl(yr.l,of.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},_t=new st;st.NAMES=g1;function y1(t){let e={};for(let n in t){e[n]={};for(let i in t[n]){let r=t[n][i];if(t1(r))r.isRenderTargetTexture?(dt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone();else if(Array.isArray(r))if(t1(r[0])){let s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();e[n][i]=s}else e[n][i]=r.slice();else e[n][i]=r}}return e}function Dt(t){let e={};for(let n=0;n<t.length;n++){let i=y1(t[n]);for(let r in i)e[r]=i[r]}return e}function t1(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function ba(t,e){return!t||t.constructor===e?t:typeof e.BYTES_PER_ELEMENT=="number"?new e(t):Array.prototype.slice.call(t)}function fg(t){return t!==void 0&&t.inTangents!==void 0&&t.outTangents!==void 0}var xr=class{constructor(e,n,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let n=this.parameterPositions,i=this._cachedIndex,r=n[i],s=n[i-1];e:{t:{let a;n:{i:if(!(e<r)){for(let o=i+2;;){if(r===void 0){if(e<s)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(s=r,r=n[++i],e<r)break t}a=n.length;break n}if(!(e>=s)){let o=n[1];e<o&&(i=2,s=o);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=n[--i-1],e>=s)break t}a=i,i=0;break n}break e}for(;i<a;){let o=i+a>>>1;e<n[o]?a=o:i=o+1}if(r=n[i],s=n[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let n=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let a=0;a!==r;++a)n[a]=i[s+a];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},mf=class extends xr{constructor(e,n,i,r){super(e,n,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Mg,endingEnd:Mg}}intervalChanged_(e,n,i){let r=this.parameterPositions,s=e-2,a=e+1,o=r[s],l=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case wg:s=e,o=2*n-i;break;case Eg:s=r.length-2,o=n+r[s]-r[s+1];break;default:s=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case wg:a=e,l=2*i-n;break;case Eg:a=1,l=i+r[1]-r[0];break;default:a=e-1,l=n}let c=(i-n)*.5,u=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=a*u}interpolate_(e,n,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,h=this._weightNext,p=(i-n)/(r-n),x=p*p,b=x*p,g=-d*b+2*d*x-d*p,m=(1+d)*b+(-1.5-2*d)*x+(-.5+d)*p+1,y=(-1-h)*b+(1.5+h)*x+.5*p,_=h*b-h*x;for(let S=0;S!==o;++S)s[S]=g*a[u+S]+m*a[c+S]+y*a[l+S]+_*a[f+S];return s}},gf=class extends xr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(i-n)/(r-n),f=1-u;for(let d=0;d!==o;++d)s[d]=a[c+d]*f+a[l+d]*u;return s}},yf=class extends xr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},xf=class extends xr{interpolate_(e,n,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let p=(i-n)/(r-n),x=1-p;for(let b=0;b!==o;++b)s[b]=a[c+b]*x+a[l+b]*p;return s}let d=o*2,h=e-1;for(let p=0;p!==o;++p){let x=a[c+p],b=a[l+p],g=h*d+p*2,m=f[g],y=f[g+1],_=e*d+p*2,S=u[_],A=u[_+1],E=h3(i,n,m,S,r);s[p]=x1(E,x,y,A,b)}return s}};function x1(t,e,n,i,r){let s=1-t;return s*s*s*e+3*s*s*t*n+3*s*t*t*i+t*t*t*r}function d3(t,e,n,i,r){let s=1-t;return 3*s*s*(n-e)+6*s*t*(i-n)+3*t*t*(r-i)}function h3(t,e,n,i,r){let s=(t-e)/(r-e);for(let a=0;a<8;a++){let o=x1(s,e,n,i,r)-t;if(Math.abs(o)<1e-10)break;let l=d3(s,e,n,i,r);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-o/l))}return s}var rn=class{constructor(e,n,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ba(n,this.TimeBufferType),this.values=ba(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let n=e.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(e);else{i={name:e.name,times:ba(e.times,Array),values:ba(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r),fg(e.settings)&&(i.settings={inTangents:ba(e.settings.inTangents,Array),outTangents:ba(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new yf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new gf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new mf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let n=new xf(this.times,this.values,this.getValueSize(),e);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(e){let n;switch(e){case dl:n=this.InterpolantFactoryMethodDiscrete;break;case uf:n=this.InterpolantFactoryMethodLinear;break;case lf:n=this.InterpolantFactoryMethodSmooth;break;case bg:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return dt("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return dl;case this.InterpolantFactoryMethodLinear:return uf;case this.InterpolantFactoryMethodSmooth:return lf;case this.InterpolantFactoryMethodBezier:return bg}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]+=e}return this}scale(e){if(e!==1){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]*=e;fg(this.settings)&&(n1(this.settings.inTangents,e),n1(this.settings.outTangents,e))}return this}trim(e,n){let i=this.times,r=i.length,s=0,a=r-1;for(;s!==r&&i[s]<e;)++s;for(;a!==-1&&i[a]>n;)--a;if(++a,s!==0||a!==r){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=i.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(rt("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(rt("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){rt("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){rt("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(r!==void 0&&B2(r))for(let o=0,l=r.length;o!==l;++o){let c=r[o];if(isNaN(c)){rt("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===lf,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(r)l=!0;else{let f=o*i,d=f-i,h=f+i;for(let p=0;p!==i;++p){let x=n[f+p];if(x!==n[d+p]||x!==n[h+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let f=o*i,d=a*i;for(let h=0;h!==i;++h)n[d+h]=n[f+h]}++a}}if(s>0){e[a]=e[s];for(let o=s*i,l=a*i,c=0;c!==i;++c)n[l+c]=n[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=n.slice(0,a*i)):(this.times=e,this.values=n),this}clone(){let e=this.times.slice(),n=this.values.slice(),i=this.constructor,r=new i(this.name,e,n);return r.createInterpolant=this.createInterpolant,fg(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function n1(t,e){for(let n=0,i=t.length;n!==i;n+=2)t[n]*=e}rn.prototype.ValueTypeName="";rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=uf;var vr=class extends rn{constructor(e,n,i){super(e,n,i)}};vr.prototype.ValueTypeName="bool";vr.prototype.ValueBufferType=Array;vr.prototype.DefaultInterpolation=dl;vr.prototype.InterpolantFactoryMethodLinear=void 0;vr.prototype.InterpolantFactoryMethodSmooth=void 0;var vf=class extends rn{constructor(e,n,i,r){super(e,n,i,r)}};vf.prototype.ValueTypeName="color";var _f=class extends rn{constructor(e,n,i,r){super(e,n,i,r)}};_f.prototype.ValueTypeName="number";var Sf=class extends xr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-n)/(r-n),c=e*o;for(let u=c+o;c!==u;c+=4)wi.slerpFlat(s,0,a,c-o,a,c,l);return s}},ml=class extends rn{constructor(e,n,i,r){super(e,n,i,r)}InterpolantFactoryMethodLinear(e){return new Sf(this.times,this.values,this.getValueSize(),e)}};ml.prototype.ValueTypeName="quaternion";ml.prototype.InterpolantFactoryMethodSmooth=void 0;var _r=class extends rn{constructor(e,n,i){super(e,n,i)}};_r.prototype.ValueTypeName="string";_r.prototype.ValueBufferType=Array;_r.prototype.DefaultInterpolation=dl;_r.prototype.InterpolantFactoryMethodLinear=void 0;_r.prototype.InterpolantFactoryMethodSmooth=void 0;var bf=class extends rn{constructor(e,n,i,r){super(e,n,i,r)}};bf.prototype.ValueTypeName="vector";var Mf=class{constructor(e,n,i){let r=this,s=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(u){o++,s===!1&&r.onStart!==void 0&&r.onStart(u,a,o),s=!0},this.itemEnd=function(u){a++,r.onProgress!==void 0&&r.onProgress(u,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,d=c.length;f<d;f+=2){let h=c[f],p=c[f+1];if(h.global&&(h.lastIndex=0),h.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},v1=new Mf,wf=class{constructor(e){this.manager=e!==void 0?e:v1,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,n){let i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};wf.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xg="\\[\\]\\.:\\/",p3=new RegExp("["+Xg+"]","g"),qg="[^"+Xg+"]",m3="[^"+Xg.replace("\\.","")+"]",g3=/((?:WC+[\/:])*)/.source.replace("WC",qg),y3=/(WCOD+)?/.source.replace("WCOD",m3),x3=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",qg),v3=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",qg),_3=new RegExp("^"+g3+y3+x3+v3+"$"),S3=["material","materials","bones","map"],Ug=class{constructor(e,n,i){let r=i||xe.parseTrackName(n);this._targetGroup=e,this._bindings=e.subscribe_(n,r)}getValue(e,n){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,n)}setValue(e,n){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,n)}bind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].bind()}unbind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].unbind()}},xe=class t{constructor(e,n,i){this.path=n,this.parsedPath=i||t.parseTrackName(n),this.node=t.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,n,i){return e&&e.isAnimationObjectGroup?new t.Composite(e,n,i):new t(e,n,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(p3,"")}static parseTrackName(e){let n=_3.exec(e);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);S3.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,n){if(n===void 0||n===""||n==="."||n===-1||n===e.name||n===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(n);if(i!==void 0)return i}if(e.children){let i=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,n){e[n]=this.targetObject[this.propertyName]}_getValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[n++]=i[r]}_getValue_arrayElement(e,n){e[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,n){this.resolvedProperty.toArray(e,n)}_setValue_direct(e,n){this.targetObject[this.propertyName]=e[n]}_setValue_direct_setNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++]}_setValue_array_setNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,n){this.resolvedProperty[this.propertyIndex]=e[n]}_setValue_arrayElement_setNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,n){this.resolvedProperty.fromArray(e,n)}_setValue_fromArray_setNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,n){this.bind(),this.getValue(e,n)}_setValue_unbound(e,n){this.bind(),this.setValue(e,n)}bind(){let e=this.node,n=this.parsedPath,i=n.objectName,r=n.propertyName,s=n.propertyIndex;if(e||(e=t.findNode(this.rootNode,n.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){dt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!e.material){rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){rt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){rt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){rt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){rt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){rt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[r];if(a===void 0){let c=n.nodeName;rt("PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xe.Composite=Ug;xe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xe.prototype.GetterByBindingType=[xe.prototype._getValue_direct,xe.prototype._getValue_array,xe.prototype._getValue_arrayElement,xe.prototype._getValue_toArray];xe.prototype.SetterByBindingTypeAndVersioning=[[xe.prototype._setValue_direct,xe.prototype._setValue_direct_setNeedsUpdate,xe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xe.prototype._setValue_array,xe.prototype._setValue_array_setNeedsUpdate,xe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xe.prototype._setValue_arrayElement,xe.prototype._setValue_arrayElement_setNeedsUpdate,xe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xe.prototype._setValue_fromArray,xe.prototype._setValue_fromArray_setNeedsUpdate,xe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var MO=new Float32Array(1);var Lg=class t{static{t.prototype.isMatrix2=!0}constructor(e,n,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,n,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,n=0){for(let i=0;i<4;i++)this.elements[i]=e[i+n];return this}set(e,n,i,r){let s=this.elements;return s[0]=e,s[2]=n,s[1]=i,s[3]=r,this}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?dt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");var b3=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,M3=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,w3=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,E3=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,T3=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,A3=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,C3=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,R3=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,D3=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,U3=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,L3=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,I3=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,N3=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,P3=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,O3=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,B3=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,F3=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,z3=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,V3=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,G3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,k3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,H3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,$3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,W3=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,X3=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,q3=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Y3=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Z3=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,K3=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,J3=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Q3="gl_FragColor = linearToOutputTexel( gl_FragColor );",j3=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,eD=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,tD=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,nD=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,iD=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rD=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,sD=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,aD=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,oD=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lD=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cD=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,uD=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,fD=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,dD=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hD=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,pD=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,mD=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gD=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,yD=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,xD=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vD=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,_D=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,SD=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,bD=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,MD=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,wD=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ED=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,TD=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,AD=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,CD=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,RD=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,DD=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,UD=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,LD=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ID=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ND=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,PD=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,OD=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,BD=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,FD=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,zD=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,VD=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,GD=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,kD=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,HD=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$D=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,WD=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,XD=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qD=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,YD=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ZD=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,KD=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,JD=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,QD=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,jD=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,eU=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tU=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,nU=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,iU=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,rU=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,sU=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,aU=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,oU=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,lU=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cU=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,uU=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fU=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,dU=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hU=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,pU=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,mU=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,gU=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,yU=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,xU=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vU=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_U=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,SU=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,bU=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,MU=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wU=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,EU=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,TU=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,AU=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,CU=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,RU=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,DU=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,UU=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,LU=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,IU=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,NU=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,PU=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,OU=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,BU=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,FU=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zU=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,VU=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,GU=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kU=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,HU=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$U=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,WU=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,XU=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,qU=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,YU=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ZU=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,KU=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,JU=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,QU=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jU=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,eL=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tL=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Y={alphahash_fragment:b3,alphahash_pars_fragment:M3,alphamap_fragment:w3,alphamap_pars_fragment:E3,alphatest_fragment:T3,alphatest_pars_fragment:A3,aomap_fragment:C3,aomap_pars_fragment:R3,batching_pars_vertex:D3,batching_vertex:U3,begin_vertex:L3,beginnormal_vertex:I3,bsdfs:N3,iridescence_fragment:P3,bumpmap_pars_fragment:O3,clipping_planes_fragment:B3,clipping_planes_pars_fragment:F3,clipping_planes_pars_vertex:z3,clipping_planes_vertex:V3,color_fragment:G3,color_pars_fragment:k3,color_pars_vertex:H3,color_vertex:$3,common:W3,cube_uv_reflection_fragment:X3,defaultnormal_vertex:q3,displacementmap_pars_vertex:Y3,displacementmap_vertex:Z3,emissivemap_fragment:K3,emissivemap_pars_fragment:J3,colorspace_fragment:Q3,colorspace_pars_fragment:j3,envmap_fragment:eD,envmap_common_pars_fragment:tD,envmap_pars_fragment:nD,envmap_pars_vertex:iD,envmap_physical_pars_fragment:pD,envmap_vertex:rD,fog_vertex:sD,fog_pars_vertex:aD,fog_fragment:oD,fog_pars_fragment:lD,gradientmap_pars_fragment:cD,lightmap_pars_fragment:uD,lights_lambert_fragment:fD,lights_lambert_pars_fragment:dD,lights_pars_begin:hD,lights_toon_fragment:mD,lights_toon_pars_fragment:gD,lights_phong_fragment:yD,lights_phong_pars_fragment:xD,lights_physical_fragment:vD,lights_physical_pars_fragment:_D,lights_fragment_begin:SD,lights_fragment_maps:bD,lights_fragment_end:MD,lightprobes_pars_fragment:wD,logdepthbuf_fragment:ED,logdepthbuf_pars_fragment:TD,logdepthbuf_pars_vertex:AD,logdepthbuf_vertex:CD,map_fragment:RD,map_pars_fragment:DD,map_particle_fragment:UD,map_particle_pars_fragment:LD,metalnessmap_fragment:ID,metalnessmap_pars_fragment:ND,morphinstance_vertex:PD,morphcolor_vertex:OD,morphnormal_vertex:BD,morphtarget_pars_vertex:FD,morphtarget_vertex:zD,normal_fragment_begin:VD,normal_fragment_maps:GD,normal_pars_fragment:kD,normal_pars_vertex:HD,normal_vertex:$D,normalmap_pars_fragment:WD,clearcoat_normal_fragment_begin:XD,clearcoat_normal_fragment_maps:qD,clearcoat_pars_fragment:YD,iridescence_pars_fragment:ZD,opaque_fragment:KD,packing:JD,premultiplied_alpha_fragment:QD,project_vertex:jD,dithering_fragment:eU,dithering_pars_fragment:tU,roughnessmap_fragment:nU,roughnessmap_pars_fragment:iU,shadowmap_pars_fragment:rU,shadowmap_pars_vertex:sU,shadowmap_vertex:aU,shadowmask_pars_fragment:oU,skinbase_vertex:lU,skinning_pars_vertex:cU,skinning_vertex:uU,skinnormal_vertex:fU,specularmap_fragment:dU,specularmap_pars_fragment:hU,tonemapping_fragment:pU,tonemapping_pars_fragment:mU,transmission_fragment:gU,transmission_pars_fragment:yU,uv_pars_fragment:xU,uv_pars_vertex:vU,uv_vertex:_U,worldpos_vertex:SU,background_vert:bU,background_frag:MU,backgroundCube_vert:wU,backgroundCube_frag:EU,cube_vert:TU,cube_frag:AU,depth_vert:CU,depth_frag:RU,distance_vert:DU,distance_frag:UU,equirect_vert:LU,equirect_frag:IU,linedashed_vert:NU,linedashed_frag:PU,meshbasic_vert:OU,meshbasic_frag:BU,meshlambert_vert:FU,meshlambert_frag:zU,meshmatcap_vert:VU,meshmatcap_frag:GU,meshnormal_vert:kU,meshnormal_frag:HU,meshphong_vert:$U,meshphong_frag:WU,meshphysical_vert:XU,meshphysical_frag:qU,meshtoon_vert:YU,meshtoon_frag:ZU,points_vert:KU,points_frag:JU,shadow_vert:QU,shadow_frag:jU,sprite_vert:eL,sprite_frag:tL},D={common:{diffuse:{value:new st(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new Un(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new st(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new ve},probesMax:{value:new ve},probesResolution:{value:new ve}},points:{diffuse:{value:new st(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new st(16777215)},opacity:{value:1},center:{value:new Un(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},_1={basic:{uniforms:Dt([D.common,D.specularmap,D.envmap,D.aomap,D.lightmap,D.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:Dt([D.common,D.specularmap,D.envmap,D.aomap,D.lightmap,D.emissivemap,D.bumpmap,D.normalmap,D.displacementmap,D.fog,D.lights,{emissive:{value:new st(0)},envMapIntensity:{value:1}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:Dt([D.common,D.specularmap,D.envmap,D.aomap,D.lightmap,D.emissivemap,D.bumpmap,D.normalmap,D.displacementmap,D.fog,D.lights,{emissive:{value:new st(0)},specular:{value:new st(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:Dt([D.common,D.envmap,D.aomap,D.lightmap,D.emissivemap,D.bumpmap,D.normalmap,D.displacementmap,D.roughnessmap,D.metalnessmap,D.fog,D.lights,{emissive:{value:new st(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:Dt([D.common,D.aomap,D.lightmap,D.emissivemap,D.bumpmap,D.normalmap,D.displacementmap,D.gradientmap,D.fog,D.lights,{emissive:{value:new st(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:Dt([D.common,D.bumpmap,D.normalmap,D.displacementmap,D.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:Dt([D.points,D.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:Dt([D.common,D.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:Dt([D.common,D.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:Dt([D.common,D.bumpmap,D.normalmap,D.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:Dt([D.sprite,D.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distance:{uniforms:Dt([D.common,D.displacementmap,{referencePosition:{value:new ve},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distance_vert,fragmentShader:Y.distance_frag},shadow:{uniforms:Dt([D.lights,D.fog,{color:{value:new st(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};_1.physical={uniforms:Dt([_1.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new Un(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new st(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new Un},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new st(0)},specularColor:{value:new st(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new Un},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var nL=new G;nL.set(-1,0,0,0,1,0,0,0,1);var ak={[Ig]:"LINEAR_TONE_MAPPING",[Ng]:"REINHARD_TONE_MAPPING",[Pg]:"CINEON_TONE_MAPPING",[Og]:"ACES_FILMIC_TONE_MAPPING",[Fg]:"AGX_TONE_MAPPING",[zg]:"NEUTRAL_TONE_MAPPING",[Bg]:"CUSTOM_TONE_MAPPING"};var ok=new Float32Array(16),lk=new Float32Array(9),ck=new Float32Array(4);var uk={[Ig]:"Linear",[Ng]:"Reinhard",[Pg]:"Cineon",[Og]:"ACESFilmic",[Fg]:"AgX",[zg]:"Neutral",[Bg]:"Custom"};var fk={[i1]:"SHADOWMAP_TYPE_PCF",[r1]:"SHADOWMAP_TYPE_VSM"};var dk={[l1]:"ENVMAP_TYPE_CUBE",[Gg]:"ENVMAP_TYPE_CUBE",[c1]:"ENVMAP_TYPE_CUBE_UV"};var hk={[Gg]:"ENVMAP_MODE_REFRACTION"};var pk={[s1]:"ENVMAP_BLENDING_MULTIPLY",[a1]:"ENVMAP_BLENDING_MIX",[o1]:"ENVMAP_BLENDING_ADD"};var iL=new G;iL.set(-1,0,0,0,1,0,0,0,1);var mk=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);var{lerp:ls}=Wg,St=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let t=0;t<256;t++)St[256+t]=St[t];function Yg(t){return t*t*t*(t*(t*6-15)+10)}function Sr(t,e,n,i){let r=t&15,s=r<8?e:n,a=r<4?n:r==12||r==14?e:i;return((r&1)==0?s:-s)+((r&2)==0?a:-a)}var Tf=class{noise(e,n,i){let r=Math.floor(e),s=Math.floor(n),a=Math.floor(i),o=r&255,l=s&255,c=a&255;e-=r,n-=s,i-=a;let u=e-1,f=n-1,d=i-1,h=Yg(e),p=Yg(n),x=Yg(i),b=St[o]+l,g=St[b]+c,m=St[b+1]+c,y=St[o+1]+l,_=St[y]+c,S=St[y+1]+c;return ls(ls(ls(Sr(St[g],e,n,i),Sr(St[_],u,n,i),h),ls(Sr(St[m],e,f,i),Sr(St[S],u,f,i),h),p),ls(ls(Sr(St[g+1],e,n,d),Sr(St[_+1],u,n,d),h),ls(Sr(St[m+1],e,f,d),Sr(St[S+1],u,f,d),h),p),x)}};var S1={text:"",fontFamily:"system-ui,sans-serif",fontWeight:500,textSize:.6,shapes:"mixed",cellSize:10,dotSize:.75,color:"#929292",hoverColor:"#ffffff",backgroundColor:"#000000",speed:1,scale:1,contrast:1,brightness:.4,flow:0,direction:0,fade:.25,interactive:!0,splashRadius:40,splashStrength:.4,glow:.35,intro:!0,introDuration:1.6,paused:!1},Xn=(t,e=0,n=1)=>Math.min(n,Math.max(e,t)),b1=(t,e)=>{let n=/^#([\da-f]{3}|[\da-f]{6})$/i.exec(t||"")?.[1]||e;return n.length===3&&(n=n.replace(/./g,i=>i+i)),[0,2,4].map(i=>parseInt(n.slice(i,i+2),16))},M1=t=>(t=Xn(t),t*t*(3-2*t));function w1(t,{createCanvas:e=()=>document.createElement("canvas")}={}){let n=t.getContext("2d");if(!n)throw Error("O navegador n\xE3o disponibilizou um contexto Canvas 2D.");let i=e(),r=i.getContext("2d");if(!r)throw Error("N\xE3o foi poss\xEDvel criar a m\xE1scara do efeito.");let s=new Tf,a={...S1},o=0,l=0,c=0,u=0,f=10,d=0,h=null,p=new Float32Array,x=new Float32Array,b=new Float32Array,g=null,m=0,y=0,_=0,S=0,A=0;function E(){if(i.width=o,i.height=l,h=null,!a.text.trim()||!o||!l)return;let Z=l*Xn(Number(a.textSize)||.6,.01,1);r.font=`${a.fontWeight} ${Z}px ${a.fontFamily}`;let I=r.measureText(a.text).width;I>o*.9&&(Z*=o*.9/I),r.font=`${a.fontWeight} ${Z}px ${a.fontFamily}`,r.textAlign="center",r.textBaseline="middle",r.fillStyle="#fff",r.fillText(a.text,o/2,l/2),h=r.getImageData(0,0,o,l).data}function U(){c=Math.max(1,Math.round(o/Math.max(4,Number(a.cellSize)||10))),f=o/c,u=Math.max(1,Math.floor(l/f)),d=(l-u*f)/2,p=new Float32Array(c*u),x=new Float32Array(c*u),b=new Float32Array(c*u)}function L(Z,I,W=1){o=Math.max(1,Math.round(Z)),l=Math.max(1,Math.round(I)),W=Xn(W,1,2),t.width=Math.round(o*W),t.height=Math.round(l*W),n.setTransform(W,0,0,W,0,0),U(),E(),g=null}function P(Z){let I=a;return a={...S1,...Z},I.cellSize!==a.cellSize&&o&&U(),["text","fontFamily","fontWeight","textSize"].some(W=>I[W]!==a[W])&&E(),(I.introKey!==a.introKey||I.intro!==a.intro)&&(S=0),a.interactive||(p.fill(0),x.fill(0),b.fill(0)),a}function $(Z,I,W=a.splashStrength){if(!a.interactive||!c)return;let Ee=Math.max(.5,Number(a.splashRadius)/f*.5),Fe=Math.ceil(Ee*2.5),Ie=Z/f-.5,Ze=(I-d)/f-.5;for(let ze=Math.max(0,Math.floor(Ze-Fe));ze<=Math.min(u-1,Math.ceil(Ze+Fe));ze++)for(let ce=Math.max(0,Math.floor(Ie-Fe));ce<=Math.min(c-1,Math.ceil(Ie+Fe));ce++){let Ne=(ce-Ie)**2+(ze-Ze)**2,v=ze*c+ce;p[v]=Math.min(1.2,p[v]+W*Math.exp(-Ne/(2*Ee*Ee)))}}function _e(){for(let Z=0;Z<u;Z++)for(let I=0;I<c;I++){let W=Z*c+I,Ee=p[W],Fe=p[Z*c+Math.max(0,I-1)]+p[Z*c+Math.min(c-1,I+1)]+p[Math.max(0,Z-1)*c+I]+p[Math.min(u-1,Z+1)*c+I]-4*Ee,Ie=(Ee+(Ee-x[W])*.94+.42*Fe)*.972;x[W]=Ie,b[W]=Xn(Ie)}[p,x]=[x,p]}function Re(Z,{reducedMotion:I=!1}={}){if(!o||!l)return{drawn:0};let W=g===null?0:Xn((Z-g)/1e3,0,.1);if(g=Z,!a.paused&&!I){m+=W*.1*Math.max(0,a.speed);let ce=a.direction*Math.PI/180;y+=Math.cos(ce)*a.flow*f*W,_+=Math.sin(ce)*a.flow*f*W}for(S+=W,A=Math.min(A+W,4/60);A>=1/60;)_e(),A-=1/60;n.globalAlpha=1,n.shadowBlur=0,n.fillStyle=a.backgroundColor,n.fillRect(0,0,o,l);let Ee=b1(a.color,"929292"),Fe=b1(a.hoverColor,"ffffff"),Ie={squares:0,circles:1,triangles:2}[a.shapes],Ze=0,ze=!a.intro||I?1.66:S/Math.max(.1,a.introDuration)*1.66;for(let ce=0;ce<u;ce++)for(let Ne=0;Ne<c;Ne++){let v=(Ne+.5)*f,M=d+(ce+.5)*f;if(h&&h[(Math.min(l-1,Math.floor(M))*o+Math.min(o-1,Math.floor(v)))*4+3]>127)continue;let R=(v+y)/(32*f*Math.max(.1,a.scale))+12.9898,F=(M+_)/(32*f*Math.max(.1,a.scale))+78.233,Se=(s.noise(R,F,m)+.5*s.noise(R*2,F*2,m*2))/1.5,Q=Xn((Se*.5+.5-(.5-(a.brightness-.5)*.4))*2.8*a.contrast+.5),We=b[ce*c+Ne],qn=(Math.floor(Math.min(Q,.999999)*3)+Math.floor(Xn(We,0,.999)*3))%3,an=Ie??2-qn,Te=f*.5*Xn(a.dotSize,.1,1)*(Ie===void 0?1:.45+.55*qn/2);if(ze<1.66){let be=Math.hypot((v-o/2)/(o/2),(M-l/2)/(l/2))*.70710678,Sn=s.noise(Ne/c*3.2+12.9898,ce/u*2.4+78.233,4.7)*.3,hs=Math.sin(Ne*127.1+ce*311.7)*43758.5453%1,gl=be+Sn+Math.abs(hs)*.16+.3,Ei=Xn((ze-gl)/.2);if(!Ei)continue;let Mr=Ei-1;Te*=Math.max(.02,1+2.70158*Mr**3+1.70158*Mr**2)}let Yn=Math.abs(v/o*2-1),ds=Math.abs(M/l*2-1),Ke=(Yn**2.5+ds**2.5)**.4/2**.4,Je=Xn(a.fade,0,1),at=Je?1-M1((Ke-Math.max(0,1-Je*2.2))/(1-Math.max(0,1-Je*2.2))):1,de=M1((We-.15)/.7),ht=Ee.map((be,Sn)=>Math.round(be+(Fe[Sn]-be)*de));n.globalAlpha=at,n.fillStyle=`rgb(${ht.join(",")})`,n.shadowColor=n.fillStyle,n.shadowBlur=a.glow>0&&We>.15?Math.min(20,a.glow*12*We):0,n.beginPath(),an===0?n.rect(v-Te,M-Te,Te*2,Te*2):an===1?n.arc(v,M,Te,0,Math.PI*2):(n.moveTo(v,M-Te),n.lineTo(v+Te,M+Te),n.lineTo(v-Te,M+Te),n.closePath()),n.fill(),Ze++}return n.globalAlpha=1,n.shadowBlur=0,{drawn:Ze,cols:c,rows:u,time:m,charge:b.reduce((ce,Ne)=>ce+Ne,0)}}return{resize:L,update:P,splash:$,draw:Re}}var cs=Ht(_i());function rL({onReady:t,...e}){let n=(0,sn.useRef)(null),i=(0,sn.useRef)(null),r=(0,sn.useRef)(e);return r.current=e,(0,sn.useEffect)(()=>{i.current?.update(e)},[e]),(0,sn.useEffect)(()=>{let s=n.current,a=0,o=!1,l=!1;try{let c=w1(s);i.current=c,c.update(r.current);let u=window.matchMedia("(prefers-reduced-motion: reduce)"),f=x=>{if(o)return;let b=c.draw(x,{reducedMotion:u.matches});!l&&b.drawn>0&&(l=!0,s.dataset.ready="true",t()),a=requestAnimationFrame(f)},d=()=>{let x=s.parentElement.getBoundingClientRect();c.resize(x.width,x.height,window.devicePixelRatio||1),c.draw(performance.now(),{reducedMotion:u.matches})},h=x=>{let b=s.getBoundingClientRect(),g=x.clientX-b.left,m=x.clientY-b.top;g>=0&&m>=0&&g<=b.width&&m<=b.height&&c.splash(g,m)},p=new ResizeObserver(d);return p.observe(s.parentElement),window.addEventListener("pointermove",h,{passive:!0}),window.addEventListener("pointerdown",h,{passive:!0}),d(),a=requestAnimationFrame(f),document.fonts?.ready.then(()=>{o||(c.update({...r.current,text:""}),c.update(r.current))}),()=>{o=!0,cancelAnimationFrame(a),p.disconnect(),window.removeEventListener("pointermove",h),window.removeEventListener("pointerdown",h),i.current=null}}catch(c){window.dispatchEvent(new ErrorEvent("error",{message:c.message,error:c}))}},[]),(0,cs.jsx)("canvas",{ref:n,"data-renderer":"canvas2d","data-ready":"false",style:{display:"block",width:"100%",height:"100%"}})}function Zg(t){let e=(0,sn.useRef)(null),[n,i]=(0,sn.useState)(()=>!!navigator.gpu),[r,s]=(0,sn.useState)(!1),[a,o]=(0,sn.useState)(!1),l=c=>{r&&o(!1),s(!1),i(!1),t.onError?.(c)};return(0,sn.useEffect)(()=>{if(!n)return;let c=new MutationObserver(()=>{e.current?.querySelector('[data-gpu-layer] [data-ready="true"]')&&s(!0)});c.observe(e.current,{subtree:!0,attributes:!0,attributeFilter:["data-ready"]});let u=setTimeout(()=>{e.current?.querySelector('[data-gpu-layer] [data-ready="true"]')||i(!1)},8e3);return()=>{c.disconnect(),clearTimeout(u)}},[n]),(0,cs.jsxs)("div",{ref:e,className:t.className,"data-preview-pending":!r&&!a?"true":"false","data-renderer":r?"webgpu":"canvas2d",style:{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:t.backgroundColor||"#000"},children:[!r&&(0,cs.jsx)(rL,{...t,onReady:()=>o(!0)}),n&&(0,cs.jsx)("div",{"data-gpu-layer":!0,style:{position:"absolute",inset:0,visibility:r?"visible":"hidden"},children:(0,cs.jsx)(rg,{...t,onError:l})})]})}var Af=Ht(_i());function Cf(){return(0,Af.jsx)("div",{style:{width:"100%",minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:0},children:(0,Af.jsx)("div",{style:{width:"100%",height:"600px",position:"relative"},children:(0,Af.jsx)(Zg,{text:"</>",fontFamily:'Geist, "Geist Sans", system-ui, sans-serif',fontWeight:500,textSize:.6,shapes:"mixed",cellSize:10,dotSize:.75,color:"#929292",hoverColor:"#ffffff",backgroundColor:"#000000",speed:1,scale:1,contrast:1,brightness:.4,flow:0,direction:0,fade:.25,interactive:!0,splashRadius:40,splashStrength:.4,glow:.35,intro:!0,introDuration:1.6,paused:!1})})})}var br=Ht(_i()),R1="reactbits--shape-waves",sL=!0,E1=Object.keys(us),T1=Cf||void 0||us[E1.find(t=>/Demo|Example/.test(t))]||us[E1.find(t=>/^[A-Z]/.test(t)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(t))],A1=!1,Rf=(t,e)=>{t==="preview-error"&&(A1=!0),!(t==="preview-ready"&&A1)&&parent.postMessage({type:t,id:R1,...e?{message:String(e)}:{}},"*")};window.addEventListener("error",t=>Rf("preview-error",t.message));window.addEventListener("unhandledrejection",t=>Rf("preview-error",t.reason?.message||t.reason));var Kg=class extends fs.default.Component{state={error:null};static getDerivedStateFromError(e){return{error:e}}componentDidCatch(e){Rf("preview-error",e.message)}render(){return this.state.error?(0,br.jsxs)("div",{role:"alert",style:{padding:32,maxWidth:600,fontSize:13,color:"#a1a1aa"},children:["The original example could not finish rendering: ",this.state.error.message]}):this.props.children}};function aL(){let[t,e]=fs.default.useState({});if(fs.default.useEffect(()=>{let n=r=>{r.data?.type==="preview:set-props"&&(!r.data.id||r.data.id===R1)&&e(s=>({...s,...r.data.props}))};window.addEventListener("message",n);let i=requestAnimationFrame(()=>requestAnimationFrame(()=>Rf("preview-ready")));return()=>{cancelAnimationFrame(i),window.removeEventListener("message",n)}},[]),!T1)throw Error("No renderable component export was published.");return fs.default.createElement(T1,sL?{}:{style:{width:"100%",height:"100%"},className:"h-full w-full",particleColors:["#a78bfa","#60a5fa","#e9d5ff"],particleCount:200,...t})}function oL(){let{resolvedTheme:t,setTheme:e}=j_();return fs.default.useEffect(()=>{document.documentElement.dataset.theme=t||"dark"},[t]),fs.default.useEffect(()=>{let n=i=>{i.data?.type==="preview:set-theme"&&e(i.data.theme==="light"?"light":"dark")};return window.addEventListener("message",n),()=>window.removeEventListener("message",n)},[e]),(0,br.jsx)(aL,{})}function lL(){return(0,br.jsx)(eS,{attribute:"class",defaultTheme:document.documentElement.dataset.theme||"dark",enableSystem:!1,children:(0,br.jsx)(oL,{})})}(0,C1.createRoot)(document.getElementById("root")).render((0,br.jsx)(Kg,{children:(0,br.jsx)(lL,{})}));})();
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
