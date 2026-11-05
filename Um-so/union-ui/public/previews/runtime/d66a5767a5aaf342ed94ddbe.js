(()=>{var Mb=Object.create;var Md=Object.defineProperty;var bb=Object.getOwnPropertyDescriptor;var Eb=Object.getOwnPropertyNames;var Tb=Object.getPrototypeOf,Ab=Object.prototype.hasOwnProperty;var qi=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),wb=(e,t)=>{for(var n in t)Md(e,n,{get:t[n],enumerable:!0})},Cb=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Eb(t))!Ab.call(e,s)&&s!==n&&Md(e,s,{get:()=>t[s],enumerable:!(i=bb(t,s))||i.enumerable});return e};var Yi=(e,t,n)=>(n=e!=null?Mb(Tb(e)):{},Cb(t||!e||!e.__esModule?Md(n,"default",{value:e,enumerable:!0}):n,e));var V0=qi(Xt=>{"use strict";var Td=Symbol.for("react.transitional.element"),Rb=Symbol.for("react.portal"),Db=Symbol.for("react.fragment"),Ub=Symbol.for("react.strict_mode"),Lb=Symbol.for("react.profiler"),Nb=Symbol.for("react.consumer"),Ib=Symbol.for("react.context"),Ob=Symbol.for("react.forward_ref"),Pb=Symbol.for("react.suspense"),Bb=Symbol.for("react.memo"),O0=Symbol.for("react.lazy"),zb=Symbol.for("react.activity"),U0=Symbol.iterator;function Fb(e){return e===null||typeof e!="object"?null:(e=U0&&e[U0]||e["@@iterator"],typeof e=="function"?e:null)}var P0={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B0=Object.assign,z0={};function Rr(e,t,n){this.props=e,this.context=t,this.refs=z0,this.updater=n||P0}Rr.prototype.isReactComponent={};Rr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Rr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function F0(){}F0.prototype=Rr.prototype;function Ad(e,t,n){this.props=e,this.context=t,this.refs=z0,this.updater=n||P0}var wd=Ad.prototype=new F0;wd.constructor=Ad;B0(wd,Rr.prototype);wd.isPureReactComponent=!0;var L0=Array.isArray;function Ed(){}var Ie={H:null,A:null,T:null,S:null},H0=Object.prototype.hasOwnProperty;function Cd(e,t,n){var i=n.ref;return{$$typeof:Td,type:e,key:t,ref:i!==void 0?i:null,props:n}}function Hb(e,t){return Cd(e.type,t,e.props)}function Rd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Td}function Vb(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var N0=/\/+/g;function bd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Vb(""+e.key):t.toString(36)}function Gb(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Ed,Ed):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Cr(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Td:case Rb:r=!0;break;case O0:return r=e._init,Cr(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+bd(e,0):i,L0(s)?(n="",r!=null&&(n=r.replace(N0,"$&/")+"/"),Cr(s,t,n,"",function(c){return c})):s!=null&&(Rd(s)&&(s=Hb(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(N0,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(L0(e))for(var l=0;l<e.length;l++)i=e[l],a=o+bd(i,l),r+=Cr(i,t,n,a,s);else if(l=Fb(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+bd(i,l++),r+=Cr(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return Cr(Gb(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function Xc(e,t,n){if(e==null)return e;var i=[],s=0;return Cr(e,i,"","",function(a){return t.call(n,a,s++)}),i}function kb(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var I0=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Wb={map:Xc,forEach:function(e,t,n){Xc(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Xc(e,function(){t++}),t},toArray:function(e){return Xc(e,function(t){return t})||[]},only:function(e){if(!Rd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Xt.Activity=zb;Xt.Children=Wb;Xt.Component=Rr;Xt.Fragment=Db;Xt.Profiler=Lb;Xt.PureComponent=Ad;Xt.StrictMode=Ub;Xt.Suspense=Pb;Xt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ie;Xt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ie.H.useMemoCache(e)}};Xt.cache=function(e){return function(){return e.apply(null,arguments)}};Xt.cacheSignal=function(){return null};Xt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=B0({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!H0.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Cd(e.type,s,i)};Xt.createContext=function(e){return e={$$typeof:Ib,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:Nb,_context:e},e};Xt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)H0.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Cd(e,a,s)};Xt.createRef=function(){return{current:null}};Xt.forwardRef=function(e){return{$$typeof:Ob,render:e}};Xt.isValidElement=Rd;Xt.lazy=function(e){return{$$typeof:O0,_payload:{_status:-1,_result:e},_init:kb}};Xt.memo=function(e,t){return{$$typeof:Bb,type:e,compare:t===void 0?null:t}};Xt.startTransition=function(e){var t=Ie.T,n={};Ie.T=n;try{var i=e(),s=Ie.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Ed,I0)}catch(a){I0(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),Ie.T=t}};Xt.unstable_useCacheRefresh=function(){return Ie.H.useCacheRefresh()};Xt.use=function(e){return Ie.H.use(e)};Xt.useActionState=function(e,t,n){return Ie.H.useActionState(e,t,n)};Xt.useCallback=function(e,t){return Ie.H.useCallback(e,t)};Xt.useContext=function(e){return Ie.H.useContext(e)};Xt.useDebugValue=function(){};Xt.useDeferredValue=function(e,t){return Ie.H.useDeferredValue(e,t)};Xt.useEffect=function(e,t){return Ie.H.useEffect(e,t)};Xt.useEffectEvent=function(e){return Ie.H.useEffectEvent(e)};Xt.useId=function(){return Ie.H.useId()};Xt.useImperativeHandle=function(e,t,n){return Ie.H.useImperativeHandle(e,t,n)};Xt.useInsertionEffect=function(e,t){return Ie.H.useInsertionEffect(e,t)};Xt.useLayoutEffect=function(e,t){return Ie.H.useLayoutEffect(e,t)};Xt.useMemo=function(e,t){return Ie.H.useMemo(e,t)};Xt.useOptimistic=function(e,t){return Ie.H.useOptimistic(e,t)};Xt.useReducer=function(e,t,n){return Ie.H.useReducer(e,t,n)};Xt.useRef=function(e){return Ie.H.useRef(e)};Xt.useState=function(e){return Ie.H.useState(e)};Xt.useSyncExternalStore=function(e,t,n){return Ie.H.useSyncExternalStore(e,t,n)};Xt.useTransition=function(){return Ie.H.useTransition()};Xt.version="19.2.0"});var Dr=qi((y2,G0)=>{"use strict";G0.exports=V0()});var j0=qi(Ge=>{"use strict";function Nd(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<qc(s,t))e[i]=t,e[n]=s,n=i;else break t}}function Zi(e){return e.length===0?null:e[0]}function Zc(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>qc(o,n))l<s&&0>qc(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>qc(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function qc(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}Ge.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(k0=performance,Ge.unstable_now=function(){return k0.now()}):(Dd=Date,W0=Dd.now(),Ge.unstable_now=function(){return Dd.now()-W0});var k0,Dd,W0,ds=[],Ws=[],Xb=1,mi=null,Cn=3,Id=!1,el=!1,nl=!1,Od=!1,Y0=typeof setTimeout=="function"?setTimeout:null,Z0=typeof clearTimeout=="function"?clearTimeout:null,X0=typeof setImmediate<"u"?setImmediate:null;function Yc(e){for(var t=Zi(Ws);t!==null;){if(t.callback===null)Zc(Ws);else if(t.startTime<=e)Zc(Ws),t.sortIndex=t.expirationTime,Nd(ds,t);else break;t=Zi(Ws)}}function Pd(e){if(nl=!1,Yc(e),!el)if(Zi(ds)!==null)el=!0,Lr||(Lr=!0,Ur());else{var t=Zi(Ws);t!==null&&Bd(Pd,t.startTime-e)}}var Lr=!1,il=-1,J0=5,K0=-1;function Q0(){return Od?!0:!(Ge.unstable_now()-K0<J0)}function Ud(){if(Od=!1,Lr){var e=Ge.unstable_now();K0=e;var t=!0;try{t:{el=!1,nl&&(nl=!1,Z0(il),il=-1),Id=!0;var n=Cn;try{e:{for(Yc(e),mi=Zi(ds);mi!==null&&!(mi.expirationTime>e&&Q0());){var i=mi.callback;if(typeof i=="function"){mi.callback=null,Cn=mi.priorityLevel;var s=i(mi.expirationTime<=e);if(e=Ge.unstable_now(),typeof s=="function"){mi.callback=s,Yc(e),t=!0;break e}mi===Zi(ds)&&Zc(ds),Yc(e)}else Zc(ds);mi=Zi(ds)}if(mi!==null)t=!0;else{var a=Zi(Ws);a!==null&&Bd(Pd,a.startTime-e),t=!1}}break t}finally{mi=null,Cn=n,Id=!1}t=void 0}}finally{t?Ur():Lr=!1}}}var Ur;typeof X0=="function"?Ur=function(){X0(Ud)}:typeof MessageChannel<"u"?(Ld=new MessageChannel,q0=Ld.port2,Ld.port1.onmessage=Ud,Ur=function(){q0.postMessage(null)}):Ur=function(){Y0(Ud,0)};var Ld,q0;function Bd(e,t){il=Y0(function(){e(Ge.unstable_now())},t)}Ge.unstable_IdlePriority=5;Ge.unstable_ImmediatePriority=1;Ge.unstable_LowPriority=4;Ge.unstable_NormalPriority=3;Ge.unstable_Profiling=null;Ge.unstable_UserBlockingPriority=2;Ge.unstable_cancelCallback=function(e){e.callback=null};Ge.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):J0=0<e?Math.floor(1e3/e):5};Ge.unstable_getCurrentPriorityLevel=function(){return Cn};Ge.unstable_next=function(e){switch(Cn){case 1:case 2:case 3:var t=3;break;default:t=Cn}var n=Cn;Cn=t;try{return e()}finally{Cn=n}};Ge.unstable_requestPaint=function(){Od=!0};Ge.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=Cn;Cn=e;try{return t()}finally{Cn=n}};Ge.unstable_scheduleCallback=function(e,t,n){var i=Ge.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:Xb++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,Nd(Ws,e),Zi(ds)===null&&e===Zi(Ws)&&(nl?(Z0(il),il=-1):nl=!0,Bd(Pd,n-i))):(e.sortIndex=s,Nd(ds,e),el||Id||(el=!0,Lr||(Lr=!0,Ur()))),e};Ge.unstable_shouldYield=Q0;Ge.unstable_wrapCallback=function(e){var t=Cn;return function(){var n=Cn;Cn=t;try{return e.apply(this,arguments)}finally{Cn=n}}}});var t_=qi((S2,$0)=>{"use strict";$0.exports=j0()});var n_=qi(In=>{"use strict";var qb=Dr();function e_(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Xs(){}var Nn={d:{f:Xs,r:function(){throw Error(e_(522))},D:Xs,C:Xs,L:Xs,m:Xs,X:Xs,S:Xs,M:Xs},p:0,findDOMNode:null},Yb=Symbol.for("react.portal");function Zb(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Yb,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var sl=qb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Jc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}In.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Nn;In.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(e_(299));return Zb(e,t,null,n)};In.flushSync=function(e){var t=sl.T,n=Nn.p;try{if(sl.T=null,Nn.p=2,e)return e()}finally{sl.T=t,Nn.p=n,Nn.d.f()}};In.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Nn.d.C(e,t))};In.prefetchDNS=function(e){typeof e=="string"&&Nn.d.D(e)};In.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=Jc(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?Nn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&Nn.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};In.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Jc(t.as,t.crossOrigin);Nn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&Nn.d.M(e)};In.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=Jc(n,t.crossOrigin);Nn.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};In.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Jc(t.as,t.crossOrigin);Nn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else Nn.d.m(e)};In.requestFormReset=function(e){Nn.d.r(e)};In.unstable_batchedUpdates=function(e,t){return e(t)};In.useFormState=function(e,t,n){return sl.H.useFormState(e,t,n)};In.useFormStatus=function(){return sl.H.useHostTransitionStatus()};In.version="19.2.0"});var a_=qi((b2,s_)=>{"use strict";function i_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i_)}catch(e){console.error(e)}}i_(),s_.exports=n_()});var _S=qi(xh=>{"use strict";var cn=t_(),Uv=Dr(),Jb=a_();function et(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Lv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Wl(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Nv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Iv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function r_(e){if(Wl(e)!==e)throw Error(et(188))}function Kb(e){var t=e.alternate;if(!t){if(t=Wl(e),t===null)throw Error(et(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return r_(s),e;if(a===i)return r_(s),t;a=a.sibling}throw Error(et(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error(et(189))}}if(n.alternate!==i)throw Error(et(190))}if(n.tag!==3)throw Error(et(188));return n.stateNode.current===n?e:t}function Ov(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Ov(e),t!==null)return t;e=e.sibling}return null}var Be=Object.assign,Qb=Symbol.for("react.element"),Kc=Symbol.for("react.transitional.element"),fl=Symbol.for("react.portal"),zr=Symbol.for("react.fragment"),Pv=Symbol.for("react.strict_mode"),_p=Symbol.for("react.profiler"),Bv=Symbol.for("react.consumer"),Ss=Symbol.for("react.context"),fm=Symbol.for("react.forward_ref"),vp=Symbol.for("react.suspense"),yp=Symbol.for("react.suspense_list"),dm=Symbol.for("react.memo"),qs=Symbol.for("react.lazy");Symbol.for("react.scope");var xp=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var jb=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var o_=Symbol.iterator;function al(e){return e===null||typeof e!="object"?null:(e=o_&&e[o_]||e["@@iterator"],typeof e=="function"?e:null)}var $b=Symbol.for("react.client.reference");function Sp(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===$b?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case zr:return"Fragment";case _p:return"Profiler";case Pv:return"StrictMode";case vp:return"Suspense";case yp:return"SuspenseList";case xp:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case fl:return"Portal";case Ss:return e.displayName||"Context";case Bv:return(e._context.displayName||"Context")+".Consumer";case fm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case dm:return t=e.displayName||null,t!==null?t:Sp(e.type)||"Memo";case qs:t=e._payload,e=e._init;try{return Sp(e(t))}catch{}}return null}var dl=Array.isArray,Ot=Uv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ve=Jb.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ya={pending:!1,data:null,method:null,action:null},Mp=[],Fr=-1;function $i(e){return{current:e}}function mn(e){0>Fr||(e.current=Mp[Fr],Mp[Fr]=null,Fr--)}function Ne(e,t){Fr++,Mp[Fr]=e.current,e.current=t}var ji=$i(null),Dl=$i(null),ia=$i(null),Ru=$i(null);function Du(e,t){switch(Ne(ia,t),Ne(Dl,e),Ne(ji,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?pv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=pv(t),e=iS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}mn(ji),Ne(ji,e)}function io(){mn(ji),mn(Dl),mn(ia)}function bp(e){e.memoizedState!==null&&Ne(Ru,e);var t=ji.current,n=iS(t,e.type);t!==n&&(Ne(Dl,e),Ne(ji,n))}function Uu(e){Dl.current===e&&(mn(ji),mn(Dl)),Ru.current===e&&(mn(Ru),Vl._currentValue=Ya)}var zd,l_;function ka(e){if(zd===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);zd=t&&t[1]||"",l_=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+zd+e+l_}var Fd=!1;function Hd(e,t){if(!e||Fd)return"";Fd=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(d){var u=d}Reflect.construct(e,[],p)}else{try{p.call()}catch(d){u=d}e.call(p.prototype)}}else{try{throw Error()}catch(d){u=d}(p=e())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(d){if(d&&u&&typeof d.stack=="string")return[d.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var f=`
`+l[i].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=i&&0<=s);break}}}finally{Fd=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?ka(n):""}function t1(e,t){switch(e.tag){case 26:case 27:case 5:return ka(e.type);case 16:return ka("Lazy");case 13:return e.child!==t&&t!==null?ka("Suspense Fallback"):ka("Suspense");case 19:return ka("SuspenseList");case 0:case 15:return Hd(e.type,!1);case 11:return Hd(e.type.render,!1);case 1:return Hd(e.type,!0);case 31:return ka("Activity");default:return""}}function c_(e){try{var t="",n=null;do t+=t1(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Ep=Object.prototype.hasOwnProperty,pm=cn.unstable_scheduleCallback,Vd=cn.unstable_cancelCallback,e1=cn.unstable_shouldYield,n1=cn.unstable_requestPaint,ii=cn.unstable_now,i1=cn.unstable_getCurrentPriorityLevel,zv=cn.unstable_ImmediatePriority,Fv=cn.unstable_UserBlockingPriority,Lu=cn.unstable_NormalPriority,s1=cn.unstable_LowPriority,Hv=cn.unstable_IdlePriority,a1=cn.log,r1=cn.unstable_setDisableYieldValue,Xl=null,si=null;function js(e){if(typeof a1=="function"&&r1(e),si&&typeof si.setStrictMode=="function")try{si.setStrictMode(Xl,e)}catch{}}var ai=Math.clz32?Math.clz32:c1,o1=Math.log,l1=Math.LN2;function c1(e){return e>>>=0,e===0?32:31-(o1(e)/l1|0)|0}var Qc=256,jc=262144,$c=4194304;function Wa(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function sh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=Wa(i):(r&=o,r!==0?s=Wa(r):n||(n=o&~e,n!==0&&(s=Wa(n))))):(o=i&~a,o!==0?s=Wa(o):r!==0?s=Wa(r):n||(n=i&~e,n!==0&&(s=Wa(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function ql(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function u1(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Vv(){var e=$c;return $c<<=1,($c&62914560)===0&&($c=4194304),e}function Gd(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Yl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function h1(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var f=31-ai(n),p=1<<f;o[f]=0,l[f]=-1;var u=c[f];if(u!==null)for(c[f]=null,f=0;f<u.length;f++){var d=u[f];d!==null&&(d.lane&=-536870913)}n&=~p}i!==0&&Gv(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function Gv(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-ai(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function kv(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-ai(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function Wv(e,t){var n=t&-t;return n=(n&42)!==0?1:mm(n),(n&(e.suspendedLanes|t))!==0?0:n}function mm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function gm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Xv(){var e=ve.p;return e!==0?e:(e=window.event,e===void 0?32:pS(e.type))}function u_(e,t){var n=ve.p;try{return ve.p=e,t()}finally{ve.p=n}}var ga=Math.random().toString(36).slice(2),yn="__reactFiber$"+ga,Xn="__reactProps$"+ga,mo="__reactContainer$"+ga,Tp="__reactEvents$"+ga,f1="__reactListeners$"+ga,d1="__reactHandles$"+ga,h_="__reactResources$"+ga,Zl="__reactMarker$"+ga;function _m(e){delete e[yn],delete e[Xn],delete e[Tp],delete e[f1],delete e[d1]}function Hr(e){var t=e[yn];if(t)return t;for(var n=e.parentNode;n;){if(t=n[mo]||n[yn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=yv(e);e!==null;){if(n=e[yn])return n;e=yv(e)}return t}e=n,n=e.parentNode}return null}function go(e){if(e=e[yn]||e[mo]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function pl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(et(33))}function Kr(e){var t=e[h_];return t||(t=e[h_]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function pn(e){e[Zl]=!0}var qv=new Set,Yv={};function ir(e,t){so(e,t),so(e+"Capture",t)}function so(e,t){for(Yv[e]=t,e=0;e<t.length;e++)qv.add(t[e])}var p1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),f_={},d_={};function m1(e){return Ep.call(d_,e)?!0:Ep.call(f_,e)?!1:p1.test(e)?d_[e]=!0:(f_[e]=!0,!1)}function pu(e,t,n){if(m1(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function tu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function ps(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function _i(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Zv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function g1(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Ap(e){if(!e._valueTracker){var t=Zv(e)?"checked":"value";e._valueTracker=g1(e,t,""+e[t])}}function Jv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=Zv(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Nu(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var _1=/[\n"\\]/g;function xi(e){return e.replace(_1,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function wp(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+_i(t)):e.value!==""+_i(t)&&(e.value=""+_i(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Cp(e,r,_i(t)):n!=null?Cp(e,r,_i(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+_i(o):e.removeAttribute("name")}function Kv(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){Ap(e);return}n=n!=null?""+_i(n):"",t=t!=null?""+_i(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i??s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),Ap(e)}function Cp(e,t,n){t==="number"&&Nu(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function Qr(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+_i(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function Qv(e,t,n){if(t!=null&&(t=""+_i(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+_i(n):""}function jv(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(et(92));if(dl(i)){if(1<i.length)throw Error(et(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=_i(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Ap(e)}function ao(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var v1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function p_(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||v1.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function $v(e,t,n){if(t!=null&&typeof t!="object")throw Error(et(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&p_(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&p_(e,a,t[a])}function vm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var y1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),x1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function mu(e){return x1.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Ms(){}var Rp=null;function ym(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Vr=null,jr=null;function m_(e){var t=go(e);if(t&&(e=t.stateNode)){var n=e[Xn]||null;t:switch(e=t.stateNode,t.type){case"input":if(wp(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+xi(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[Xn]||null;if(!s)throw Error(et(90));wp(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&Jv(i)}break t;case"textarea":Qv(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&Qr(e,!!n.multiple,t,!1)}}}var kd=!1;function ty(e,t,n){if(kd)return e(t,n);kd=!0;try{var i=e(t);return i}finally{if(kd=!1,(Vr!==null||jr!==null)&&(gh(),Vr&&(t=Vr,e=jr,jr=Vr=null,m_(t),e)))for(t=0;t<e.length;t++)m_(e[t])}}function Ul(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Xn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(et(231,t,typeof n));return n}var ws=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Dp=!1;if(ws)try{Nr={},Object.defineProperty(Nr,"passive",{get:function(){Dp=!0}}),window.addEventListener("test",Nr,Nr),window.removeEventListener("test",Nr,Nr)}catch{Dp=!1}var Nr,$s=null,xm=null,gu=null;function ey(){if(gu)return gu;var e,t=xm,n=t.length,i,s="value"in $s?$s.value:$s.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return gu=s.slice(e,1<i?1-i:void 0)}function _u(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function eu(){return!0}function g_(){return!1}function qn(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?eu:g_,this.isPropagationStopped=g_,this}return Be(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=eu)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=eu)},persist:function(){},isPersistent:eu}),t}var sr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ah=qn(sr),Jl=Be({},sr,{view:0,detail:0}),S1=qn(Jl),Wd,Xd,rl,rh=Be({},Jl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Sm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==rl&&(rl&&e.type==="mousemove"?(Wd=e.screenX-rl.screenX,Xd=e.screenY-rl.screenY):Xd=Wd=0,rl=e),Wd)},movementY:function(e){return"movementY"in e?e.movementY:Xd}}),__=qn(rh),M1=Be({},rh,{dataTransfer:0}),b1=qn(M1),E1=Be({},Jl,{relatedTarget:0}),qd=qn(E1),T1=Be({},sr,{animationName:0,elapsedTime:0,pseudoElement:0}),A1=qn(T1),w1=Be({},sr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),C1=qn(w1),R1=Be({},sr,{data:0}),v_=qn(R1),D1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},U1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},L1={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function N1(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=L1[e])?!!t[e]:!1}function Sm(){return N1}var I1=Be({},Jl,{key:function(e){if(e.key){var t=D1[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=_u(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?U1[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Sm,charCode:function(e){return e.type==="keypress"?_u(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?_u(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),O1=qn(I1),P1=Be({},rh,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),y_=qn(P1),B1=Be({},Jl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Sm}),z1=qn(B1),F1=Be({},sr,{propertyName:0,elapsedTime:0,pseudoElement:0}),H1=qn(F1),V1=Be({},rh,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),G1=qn(V1),k1=Be({},sr,{newState:0,oldState:0}),W1=qn(k1),X1=[9,13,27,32],Mm=ws&&"CompositionEvent"in window,_l=null;ws&&"documentMode"in document&&(_l=document.documentMode);var q1=ws&&"TextEvent"in window&&!_l,ny=ws&&(!Mm||_l&&8<_l&&11>=_l),x_=" ",S_=!1;function iy(e,t){switch(e){case"keyup":return X1.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function sy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Gr=!1;function Y1(e,t){switch(e){case"compositionend":return sy(t);case"keypress":return t.which!==32?null:(S_=!0,x_);case"textInput":return e=t.data,e===x_&&S_?null:e;default:return null}}function Z1(e,t){if(Gr)return e==="compositionend"||!Mm&&iy(e,t)?(e=ey(),gu=xm=$s=null,Gr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return ny&&t.locale!=="ko"?null:t.data;default:return null}}var J1={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function M_(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!J1[e.type]:t==="textarea"}function ay(e,t,n,i){Vr?jr?jr.push(i):jr=[i]:Vr=i,t=Qu(t,"onChange"),0<t.length&&(n=new ah("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var vl=null,Ll=null;function K1(e){tS(e,0)}function oh(e){var t=pl(e);if(Jv(t))return e}function b_(e,t){if(e==="change")return t}var ry=!1;ws&&(ws?(iu="oninput"in document,iu||(Yd=document.createElement("div"),Yd.setAttribute("oninput","return;"),iu=typeof Yd.oninput=="function"),nu=iu):nu=!1,ry=nu&&(!document.documentMode||9<document.documentMode));var nu,iu,Yd;function E_(){vl&&(vl.detachEvent("onpropertychange",oy),Ll=vl=null)}function oy(e){if(e.propertyName==="value"&&oh(Ll)){var t=[];ay(t,Ll,e,ym(e)),ty(K1,t)}}function Q1(e,t,n){e==="focusin"?(E_(),vl=t,Ll=n,vl.attachEvent("onpropertychange",oy)):e==="focusout"&&E_()}function j1(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return oh(Ll)}function $1(e,t){if(e==="click")return oh(t)}function tE(e,t){if(e==="input"||e==="change")return oh(t)}function eE(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var oi=typeof Object.is=="function"?Object.is:eE;function Nl(e,t){if(oi(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!Ep.call(t,s)||!oi(e[s],t[s]))return!1}return!0}function T_(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function A_(e,t){var n=T_(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=T_(n)}}function ly(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?ly(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function cy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Nu(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Nu(e.document)}return t}function bm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var nE=ws&&"documentMode"in document&&11>=document.documentMode,kr=null,Up=null,yl=null,Lp=!1;function w_(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lp||kr==null||kr!==Nu(i)||(i=kr,"selectionStart"in i&&bm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),yl&&Nl(yl,i)||(yl=i,i=Qu(Up,"onSelect"),0<i.length&&(t=new ah("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=kr)))}function Ga(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Wr={animationend:Ga("Animation","AnimationEnd"),animationiteration:Ga("Animation","AnimationIteration"),animationstart:Ga("Animation","AnimationStart"),transitionrun:Ga("Transition","TransitionRun"),transitionstart:Ga("Transition","TransitionStart"),transitioncancel:Ga("Transition","TransitionCancel"),transitionend:Ga("Transition","TransitionEnd")},Zd={},uy={};ws&&(uy=document.createElement("div").style,"AnimationEvent"in window||(delete Wr.animationend.animation,delete Wr.animationiteration.animation,delete Wr.animationstart.animation),"TransitionEvent"in window||delete Wr.transitionend.transition);function ar(e){if(Zd[e])return Zd[e];if(!Wr[e])return e;var t=Wr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in uy)return Zd[e]=t[n];return e}var hy=ar("animationend"),fy=ar("animationiteration"),dy=ar("animationstart"),iE=ar("transitionrun"),sE=ar("transitionstart"),aE=ar("transitioncancel"),py=ar("transitionend"),my=new Map,Np="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Np.push("scrollEnd");function Ii(e,t){my.set(e,t),ir(t,[e])}var Iu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},gi=[],Xr=0,Em=0;function lh(){for(var e=Xr,t=Em=Xr=0;t<e;){var n=gi[t];gi[t++]=null;var i=gi[t];gi[t++]=null;var s=gi[t];gi[t++]=null;var a=gi[t];if(gi[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&gy(n,s,a)}}function ch(e,t,n,i){gi[Xr++]=e,gi[Xr++]=t,gi[Xr++]=n,gi[Xr++]=i,Em|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Tm(e,t,n,i){return ch(e,t,n,i),Ou(e)}function rr(e,t){return ch(e,null,null,t),Ou(e)}function gy(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-ai(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function Ou(e){if(50<Cl)throw Cl=0,tm=null,Error(et(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var qr={};function rE(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ei(e,t,n,i){return new rE(e,t,n,i)}function Am(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Es(e,t){var n=e.alternate;return n===null?(n=ei(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function _y(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function vu(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")Am(e)&&(r=1);else if(typeof e=="string")r=cT(e,n,ji.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case xp:return e=ei(31,n,t,s),e.elementType=xp,e.lanes=a,e;case zr:return Za(n.children,s,a,t);case Pv:r=8,s|=24;break;case _p:return e=ei(12,n,t,s|2),e.elementType=_p,e.lanes=a,e;case vp:return e=ei(13,n,t,s),e.elementType=vp,e.lanes=a,e;case yp:return e=ei(19,n,t,s),e.elementType=yp,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ss:r=10;break t;case Bv:r=9;break t;case fm:r=11;break t;case dm:r=14;break t;case qs:r=16,i=null;break t}r=29,n=Error(et(130,e===null?"null":typeof e,"")),i=null}return t=ei(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function Za(e,t,n,i){return e=ei(7,e,i,t),e.lanes=n,e}function Jd(e,t,n){return e=ei(6,e,null,t),e.lanes=n,e}function vy(e){var t=ei(18,null,null,0);return t.stateNode=e,t}function Kd(e,t,n){return t=ei(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var C_=new WeakMap;function Si(e,t){if(typeof e=="object"&&e!==null){var n=C_.get(e);return n!==void 0?n:(t={value:e,source:t,stack:c_(t)},C_.set(e,t),t)}return{value:e,source:t,stack:c_(t)}}var Yr=[],Zr=0,Pu=null,Il=0,vi=[],yi=0,fa=null,Ji=1,Ki="";function ys(e,t){Yr[Zr++]=Il,Yr[Zr++]=Pu,Pu=e,Il=t}function yy(e,t,n){vi[yi++]=Ji,vi[yi++]=Ki,vi[yi++]=fa,fa=e;var i=Ji;e=Ki;var s=32-ai(i)-1;i&=~(1<<s),n+=1;var a=32-ai(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,Ji=1<<32-ai(t)+s|n<<s|i,Ki=a+e}else Ji=1<<a|n<<s|i,Ki=e}function wm(e){e.return!==null&&(ys(e,1),yy(e,1,0))}function Cm(e){for(;e===Pu;)Pu=Yr[--Zr],Yr[Zr]=null,Il=Yr[--Zr],Yr[Zr]=null;for(;e===fa;)fa=vi[--yi],vi[yi]=null,Ki=vi[--yi],vi[yi]=null,Ji=vi[--yi],vi[yi]=null}function xy(e,t){vi[yi++]=Ji,vi[yi++]=Ki,vi[yi++]=fa,Ji=t.id,Ki=t.overflow,fa=e}var xn=null,Pe=null,he=!1,sa=null,Mi=!1,Ip=Error(et(519));function da(e){var t=Error(et(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ol(Si(t,e)),Ip}function R_(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[yn]=e,t[Xn]=i,n){case"dialog":ee("cancel",t),ee("close",t);break;case"iframe":case"object":case"embed":ee("load",t);break;case"video":case"audio":for(n=0;n<Fl.length;n++)ee(Fl[n],t);break;case"source":ee("error",t);break;case"img":case"image":case"link":ee("error",t),ee("load",t);break;case"details":ee("toggle",t);break;case"input":ee("invalid",t),Kv(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":ee("invalid",t);break;case"textarea":ee("invalid",t),jv(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||nS(t.textContent,n)?(i.popover!=null&&(ee("beforetoggle",t),ee("toggle",t)),i.onScroll!=null&&ee("scroll",t),i.onScrollEnd!=null&&ee("scrollend",t),i.onClick!=null&&(t.onclick=Ms),t=!0):t=!1,t||da(e,!0)}function D_(e){for(xn=e.return;xn;)switch(xn.tag){case 5:case 31:case 13:Mi=!1;return;case 27:case 3:Mi=!0;return;default:xn=xn.return}}function Ir(e){if(e!==xn)return!1;if(!he)return D_(e),he=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||am(e.type,e.memoizedProps)),n=!n),n&&Pe&&da(e),D_(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(et(317));Pe=vv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(et(317));Pe=vv(e)}else t===27?(t=Pe,_a(e.type)?(e=cm,cm=null,Pe=e):Pe=t):Pe=xn?Ei(e.stateNode.nextSibling):null;return!0}function ja(){Pe=xn=null,he=!1}function Qd(){var e=sa;return e!==null&&(kn===null?kn=e:kn.push.apply(kn,e),sa=null),e}function Ol(e){sa===null?sa=[e]:sa.push(e)}var Op=$i(null),or=null,bs=null;function Zs(e,t,n){Ne(Op,t._currentValue),t._currentValue=n}function Ts(e){e._currentValue=Op.current,mn(Op)}function Pp(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function Bp(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Pp(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error(et(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),Pp(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function _o(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error(et(387));if(r=r.memoizedProps,r!==null){var o=s.type;oi(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Ru.current){if(r=s.alternate,r===null)throw Error(et(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push(Vl):e=[Vl])}s=s.return}e!==null&&Bp(t,e,n,i),t.flags|=262144}function Bu(e){for(e=e.firstContext;e!==null;){if(!oi(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function $a(e){or=e,bs=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Sn(e){return Sy(or,e)}function su(e,t){return or===null&&$a(e),Sy(e,t)}function Sy(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},bs===null){if(e===null)throw Error(et(308));bs=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else bs=bs.next=t;return n}var oE=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},lE=cn.unstable_scheduleCallback,cE=cn.unstable_NormalPriority,sn={$$typeof:Ss,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Rm(){return{controller:new oE,data:new Map,refCount:0}}function Kl(e){e.refCount--,e.refCount===0&&lE(cE,function(){e.controller.abort()})}var xl=null,zp=0,ro=0,$r=null;function uE(e,t){if(xl===null){var n=xl=[];zp=0,ro=tg(),$r={status:"pending",value:void 0,then:function(i){n.push(i)}}}return zp++,t.then(U_,U_),t}function U_(){if(--zp===0&&xl!==null){$r!==null&&($r.status="fulfilled");var e=xl;xl=null,ro=0,$r=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function hE(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var L_=Ot.S;Ot.S=function(e,t){Ox=ii(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&uE(e,t),L_!==null&&L_(e,t)};var Ja=$i(null);function Dm(){var e=Ja.current;return e!==null?e:Ue.pooledCache}function yu(e,t){t===null?Ne(Ja,Ja.current):Ne(Ja,t.pool)}function My(){var e=Dm();return e===null?null:{parent:sn._currentValue,pool:e}}var vo=Error(et(460)),Um=Error(et(474)),uh=Error(et(542)),zu={then:function(){}};function N_(e){return e=e.status,e==="fulfilled"||e==="rejected"}function by(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(Ms,Ms),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,O_(e),e;default:if(typeof t.status=="string")t.then(Ms,Ms);else{if(e=Ue,e!==null&&100<e.shellSuspendCounter)throw Error(et(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,O_(e),e}throw Ka=t,vo}}function Xa(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Ka=n,vo):n}}var Ka=null;function I_(){if(Ka===null)throw Error(et(459));var e=Ka;return Ka=null,e}function O_(e){if(e===vo||e===uh)throw Error(et(483))}var to=null,Pl=0;function au(e){var t=Pl;return Pl+=1,to===null&&(to=[]),by(to,e,t)}function ol(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function ru(e,t){throw t.$$typeof===Qb?Error(et(525)):(e=Object.prototype.toString.call(t),Error(et(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Ey(e){function t(h,g){if(e){var M=h.deletions;M===null?(h.deletions=[g],h.flags|=16):M.push(g)}}function n(h,g){if(!e)return null;for(;g!==null;)t(h,g),g=g.sibling;return null}function i(h){for(var g=new Map;h!==null;)h.key!==null?g.set(h.key,h):g.set(h.index,h),h=h.sibling;return g}function s(h,g){return h=Es(h,g),h.index=0,h.sibling=null,h}function a(h,g,M){return h.index=M,e?(M=h.alternate,M!==null?(M=M.index,M<g?(h.flags|=67108866,g):M):(h.flags|=67108866,g)):(h.flags|=1048576,g)}function r(h){return e&&h.alternate===null&&(h.flags|=67108866),h}function o(h,g,M,y){return g===null||g.tag!==6?(g=Jd(M,h.mode,y),g.return=h,g):(g=s(g,M),g.return=h,g)}function l(h,g,M,y){var b=M.type;return b===zr?f(h,g,M.props.children,y,M.key):g!==null&&(g.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===qs&&Xa(b)===g.type)?(g=s(g,M.props),ol(g,M),g.return=h,g):(g=vu(M.type,M.key,M.props,null,h.mode,y),ol(g,M),g.return=h,g)}function c(h,g,M,y){return g===null||g.tag!==4||g.stateNode.containerInfo!==M.containerInfo||g.stateNode.implementation!==M.implementation?(g=Kd(M,h.mode,y),g.return=h,g):(g=s(g,M.children||[]),g.return=h,g)}function f(h,g,M,y,b){return g===null||g.tag!==7?(g=Za(M,h.mode,y,b),g.return=h,g):(g=s(g,M),g.return=h,g)}function p(h,g,M){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return g=Jd(""+g,h.mode,M),g.return=h,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Kc:return M=vu(g.type,g.key,g.props,null,h.mode,M),ol(M,g),M.return=h,M;case fl:return g=Kd(g,h.mode,M),g.return=h,g;case qs:return g=Xa(g),p(h,g,M)}if(dl(g)||al(g))return g=Za(g,h.mode,M,null),g.return=h,g;if(typeof g.then=="function")return p(h,au(g),M);if(g.$$typeof===Ss)return p(h,su(h,g),M);ru(h,g)}return null}function u(h,g,M,y){var b=g!==null?g.key:null;if(typeof M=="string"&&M!==""||typeof M=="number"||typeof M=="bigint")return b!==null?null:o(h,g,""+M,y);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case Kc:return M.key===b?l(h,g,M,y):null;case fl:return M.key===b?c(h,g,M,y):null;case qs:return M=Xa(M),u(h,g,M,y)}if(dl(M)||al(M))return b!==null?null:f(h,g,M,y,null);if(typeof M.then=="function")return u(h,g,au(M),y);if(M.$$typeof===Ss)return u(h,g,su(h,M),y);ru(h,M)}return null}function d(h,g,M,y,b){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return h=h.get(M)||null,o(g,h,""+y,b);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Kc:return h=h.get(y.key===null?M:y.key)||null,l(g,h,y,b);case fl:return h=h.get(y.key===null?M:y.key)||null,c(g,h,y,b);case qs:return y=Xa(y),d(h,g,M,y,b)}if(dl(y)||al(y))return h=h.get(M)||null,f(g,h,y,b,null);if(typeof y.then=="function")return d(h,g,M,au(y),b);if(y.$$typeof===Ss)return d(h,g,M,su(g,y),b);ru(g,y)}return null}function v(h,g,M,y){for(var b=null,T=null,w=g,x=g=0,A=null;w!==null&&x<M.length;x++){w.index>x?(A=w,w=null):A=w.sibling;var R=u(h,w,M[x],y);if(R===null){w===null&&(w=A);break}e&&w&&R.alternate===null&&t(h,w),g=a(R,g,x),T===null?b=R:T.sibling=R,T=R,w=A}if(x===M.length)return n(h,w),he&&ys(h,x),b;if(w===null){for(;x<M.length;x++)w=p(h,M[x],y),w!==null&&(g=a(w,g,x),T===null?b=w:T.sibling=w,T=w);return he&&ys(h,x),b}for(w=i(w);x<M.length;x++)A=d(w,h,x,M[x],y),A!==null&&(e&&A.alternate!==null&&w.delete(A.key===null?x:A.key),g=a(A,g,x),T===null?b=A:T.sibling=A,T=A);return e&&w.forEach(function(I){return t(h,I)}),he&&ys(h,x),b}function E(h,g,M,y){if(M==null)throw Error(et(151));for(var b=null,T=null,w=g,x=g=0,A=null,R=M.next();w!==null&&!R.done;x++,R=M.next()){w.index>x?(A=w,w=null):A=w.sibling;var I=u(h,w,R.value,y);if(I===null){w===null&&(w=A);break}e&&w&&I.alternate===null&&t(h,w),g=a(I,g,x),T===null?b=I:T.sibling=I,T=I,w=A}if(R.done)return n(h,w),he&&ys(h,x),b;if(w===null){for(;!R.done;x++,R=M.next())R=p(h,R.value,y),R!==null&&(g=a(R,g,x),T===null?b=R:T.sibling=R,T=R);return he&&ys(h,x),b}for(w=i(w);!R.done;x++,R=M.next())R=d(w,h,x,R.value,y),R!==null&&(e&&R.alternate!==null&&w.delete(R.key===null?x:R.key),g=a(R,g,x),T===null?b=R:T.sibling=R,T=R);return e&&w.forEach(function(z){return t(h,z)}),he&&ys(h,x),b}function m(h,g,M,y){if(typeof M=="object"&&M!==null&&M.type===zr&&M.key===null&&(M=M.props.children),typeof M=="object"&&M!==null){switch(M.$$typeof){case Kc:t:{for(var b=M.key;g!==null;){if(g.key===b){if(b=M.type,b===zr){if(g.tag===7){n(h,g.sibling),y=s(g,M.props.children),y.return=h,h=y;break t}}else if(g.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===qs&&Xa(b)===g.type){n(h,g.sibling),y=s(g,M.props),ol(y,M),y.return=h,h=y;break t}n(h,g);break}else t(h,g);g=g.sibling}M.type===zr?(y=Za(M.props.children,h.mode,y,M.key),y.return=h,h=y):(y=vu(M.type,M.key,M.props,null,h.mode,y),ol(y,M),y.return=h,h=y)}return r(h);case fl:t:{for(b=M.key;g!==null;){if(g.key===b)if(g.tag===4&&g.stateNode.containerInfo===M.containerInfo&&g.stateNode.implementation===M.implementation){n(h,g.sibling),y=s(g,M.children||[]),y.return=h,h=y;break t}else{n(h,g);break}else t(h,g);g=g.sibling}y=Kd(M,h.mode,y),y.return=h,h=y}return r(h);case qs:return M=Xa(M),m(h,g,M,y)}if(dl(M))return v(h,g,M,y);if(al(M)){if(b=al(M),typeof b!="function")throw Error(et(150));return M=b.call(M),E(h,g,M,y)}if(typeof M.then=="function")return m(h,g,au(M),y);if(M.$$typeof===Ss)return m(h,g,su(h,M),y);ru(h,M)}return typeof M=="string"&&M!==""||typeof M=="number"||typeof M=="bigint"?(M=""+M,g!==null&&g.tag===6?(n(h,g.sibling),y=s(g,M),y.return=h,h=y):(n(h,g),y=Jd(M,h.mode,y),y.return=h,h=y),r(h)):n(h,g)}return function(h,g,M,y){try{Pl=0;var b=m(h,g,M,y);return to=null,b}catch(w){if(w===vo||w===uh)throw w;var T=ei(29,w,null,h.mode);return T.lanes=y,T.return=h,T}finally{}}}var tr=Ey(!0),Ty=Ey(!1),Ys=!1;function Lm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Fp(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function aa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ra(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(_e&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=Ou(e),gy(e,null,n),t}return ch(e,i,t,n),Ou(e)}function Sl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,kv(e,n)}}function jd(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Hp=!1;function Ml(){if(Hp){var e=$r;if(e!==null)throw e}}function bl(e,t,n,i){Hp=!1;var s=e.updateQueue;Ys=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var f=e.alternate;f!==null&&(f=f.updateQueue,o=f.lastBaseUpdate,o!==r&&(o===null?f.firstBaseUpdate=c:o.next=c,f.lastBaseUpdate=l))}if(a!==null){var p=s.baseState;r=0,f=c=l=null,o=a;do{var u=o.lane&-536870913,d=u!==o.lane;if(d?(ie&u)===u:(i&u)===u){u!==0&&u===ro&&(Hp=!0),f!==null&&(f=f.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var v=e,E=o;u=t;var m=n;switch(E.tag){case 1:if(v=E.payload,typeof v=="function"){p=v.call(m,p,u);break t}p=v;break t;case 3:v.flags=v.flags&-65537|128;case 0:if(v=E.payload,u=typeof v=="function"?v.call(m,p,u):v,u==null)break t;p=Be({},p,u);break t;case 2:Ys=!0}}u=o.callback,u!==null&&(e.flags|=64,d&&(e.flags|=8192),d=s.callbacks,d===null?s.callbacks=[u]:d.push(u))}else d={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},f===null?(c=f=d,l=p):f=f.next=d,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;d=o,o=d.next,d.next=null,s.lastBaseUpdate=d,s.shared.pending=null}}while(!0);f===null&&(l=p),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=f,a===null&&(s.shared.lanes=0),ma|=r,e.lanes=r,e.memoizedState=p}}function Ay(e,t){if(typeof e!="function")throw Error(et(191,e));e.call(t)}function wy(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ay(n[e],t)}var oo=$i(null),Fu=$i(0);function P_(e,t){e=Us,Ne(Fu,e),Ne(oo,t),Us=e|t.baseLanes}function Vp(){Ne(Fu,Us),Ne(oo,oo.current)}function Nm(){Us=Fu.current,mn(oo),mn(Fu)}var li=$i(null),bi=null;function Js(e){var t=e.alternate;Ne(Qe,Qe.current&1),Ne(li,e),bi===null&&(t===null||oo.current!==null||t.memoizedState!==null)&&(bi=e)}function Gp(e){Ne(Qe,Qe.current),Ne(li,e),bi===null&&(bi=e)}function Cy(e){e.tag===22?(Ne(Qe,Qe.current),Ne(li,e),bi===null&&(bi=e)):Ks(e)}function Ks(){Ne(Qe,Qe.current),Ne(li,li.current)}function ti(e){mn(li),bi===e&&(bi=null),mn(Qe)}var Qe=$i(0);function Hu(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||om(n)||lm(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Cs=0,Zt=null,we=null,en=null,Vu=!1,eo=!1,er=!1,Gu=0,Bl=0,no=null,fE=0;function Ze(){throw Error(et(321))}function Im(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!oi(e[n],t[n]))return!1;return!0}function Om(e,t,n,i,s,a){return Cs=a,Zt=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Ot.H=e===null||e.memoizedState===null?ax:qm,er=!1,a=n(i,s),er=!1,eo&&(a=Dy(t,n,i,s)),Ry(e),a}function Ry(e){Ot.H=zl;var t=we!==null&&we.next!==null;if(Cs=0,en=we=Zt=null,Vu=!1,Bl=0,no=null,t)throw Error(et(300));e===null||an||(e=e.dependencies,e!==null&&Bu(e)&&(an=!0))}function Dy(e,t,n,i){Zt=e;var s=0;do{if(eo&&(no=null),Bl=0,eo=!1,25<=s)throw Error(et(301));if(s+=1,en=we=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}Ot.H=rx,a=t(n,i)}while(eo);return a}function dE(){var e=Ot.H,t=e.useState()[0];return t=typeof t.then=="function"?Ql(t):t,e=e.useState()[0],(we!==null?we.memoizedState:null)!==e&&(Zt.flags|=1024),t}function Pm(){var e=Gu!==0;return Gu=0,e}function Bm(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function zm(e){if(Vu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Vu=!1}Cs=0,en=we=Zt=null,eo=!1,Bl=Gu=0,no=null}function On(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return en===null?Zt.memoizedState=en=e:en=en.next=e,en}function je(){if(we===null){var e=Zt.alternate;e=e!==null?e.memoizedState:null}else e=we.next;var t=en===null?Zt.memoizedState:en.next;if(t!==null)en=t,we=e;else{if(e===null)throw Zt.alternate===null?Error(et(467)):Error(et(310));we=e,e={memoizedState:we.memoizedState,baseState:we.baseState,baseQueue:we.baseQueue,queue:we.queue,next:null},en===null?Zt.memoizedState=en=e:en=en.next=e}return en}function hh(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ql(e){var t=Bl;return Bl+=1,no===null&&(no=[]),e=by(no,e,t),t=Zt,(en===null?t.memoizedState:en.next)===null&&(t=t.alternate,Ot.H=t===null||t.memoizedState===null?ax:qm),e}function fh(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ql(e);if(e.$$typeof===Ss)return Sn(e)}throw Error(et(438,String(e)))}function Fm(e){var t=null,n=Zt.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=Zt.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=hh(),Zt.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=jb;return t.index++,n}function Rs(e,t){return typeof t=="function"?t(e):t}function xu(e){var t=je();return Hm(t,we,e)}function Hm(e,t,n){var i=e.queue;if(i===null)throw Error(et(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(ie&p)===p:(Cs&p)===p){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===ro&&(f=!0);else if((Cs&u)===u){c=c.next,u===ro&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,r=a):l=l.next=p,Zt.lanes|=u,ma|=u;p=c.action,er&&n(a,p),a=c.hasEagerState?c.eagerState:n(a,p)}else u={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,Zt.lanes|=p,ma|=p;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!oi(a,e.memoizedState)&&(an=!0,f&&(n=$r,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function $d(e){var t=je(),n=t.queue;if(n===null)throw Error(et(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);oi(a,t.memoizedState)||(an=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function Uy(e,t,n){var i=Zt,s=je(),a=he;if(a){if(n===void 0)throw Error(et(407));n=n()}else n=t();var r=!oi((we||s).memoizedState,n);if(r&&(s.memoizedState=n,an=!0),s=s.queue,Vm(Iy.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||en!==null&&en.memoizedState.tag&1){if(i.flags|=2048,lo(9,{destroy:void 0},Ny.bind(null,i,s,n,t),null),Ue===null)throw Error(et(349));a||(Cs&127)!==0||Ly(i,t,n)}return n}function Ly(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Zt.updateQueue,t===null?(t=hh(),Zt.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ny(e,t,n,i){t.value=n,t.getSnapshot=i,Oy(t)&&Py(e)}function Iy(e,t,n){return n(function(){Oy(t)&&Py(e)})}function Oy(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!oi(e,n)}catch{return!0}}function Py(e){var t=rr(e,2);t!==null&&Wn(t,e,2)}function kp(e){var t=On();if(typeof e=="function"){var n=e;if(e=n(),er){js(!0);try{n()}finally{js(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rs,lastRenderedState:e},t}function By(e,t,n,i){return e.baseState=n,Hm(e,we,typeof i=="function"?i:Rs)}function pE(e,t,n,i,s){if(ph(e))throw Error(et(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};Ot.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,zy(t,a)):(a.next=n.next,t.pending=n.next=a)}}function zy(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=Ot.T,r={};Ot.T=r;try{var o=n(s,i),l=Ot.S;l!==null&&l(r,o),B_(e,t,o)}catch(c){Wp(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),Ot.T=a}}else try{a=n(s,i),B_(e,t,a)}catch(c){Wp(e,t,c)}}function B_(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){z_(e,t,i)},function(i){return Wp(e,t,i)}):z_(e,t,n)}function z_(e,t,n){t.status="fulfilled",t.value=n,Fy(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,zy(e,n)))}function Wp(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,Fy(t),t=t.next;while(t!==i)}e.action=null}function Fy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Hy(e,t){return t}function F_(e,t){if(he){var n=Ue.formState;if(n!==null){t:{var i=Zt;if(he){if(Pe){e:{for(var s=Pe,a=Mi;s.nodeType!==8;){if(!a){s=null;break e}if(s=Ei(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Pe=Ei(s.nextSibling),i=s.data==="F!";break t}}da(i)}i=!1}i&&(t=n[0])}}return n=On(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hy,lastRenderedState:t},n.queue=i,n=nx.bind(null,Zt,i),i.dispatch=n,i=kp(!1),a=Xm.bind(null,Zt,!1,i.queue),i=On(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=pE.bind(null,Zt,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function H_(e){var t=je();return Vy(t,we,e)}function Vy(e,t,n){if(t=Hm(e,t,Hy)[0],e=xu(Rs)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Ql(t)}catch(r){throw r===vo?uh:r}else i=t;t=je();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&(Zt.flags|=2048,lo(9,{destroy:void 0},mE.bind(null,s,n),null)),[i,a,e]}function mE(e,t){e.action=t}function V_(e){var t=je(),n=we;if(n!==null)return Vy(t,n,e);je(),t=t.memoizedState,n=je();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function lo(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=Zt.updateQueue,t===null&&(t=hh(),Zt.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function Gy(){return je().memoizedState}function Su(e,t,n,i){var s=On();Zt.flags|=e,s.memoizedState=lo(1|t,{destroy:void 0},n,i===void 0?null:i)}function dh(e,t,n,i){var s=je();i=i===void 0?null:i;var a=s.memoizedState.inst;we!==null&&i!==null&&Im(i,we.memoizedState.deps)?s.memoizedState=lo(t,a,n,i):(Zt.flags|=e,s.memoizedState=lo(1|t,a,n,i))}function G_(e,t){Su(8390656,8,e,t)}function Vm(e,t){dh(2048,8,e,t)}function gE(e){Zt.flags|=4;var t=Zt.updateQueue;if(t===null)t=hh(),Zt.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function ky(e){var t=je().memoizedState;return gE({ref:t,nextImpl:e}),function(){if((_e&2)!==0)throw Error(et(440));return t.impl.apply(void 0,arguments)}}function Wy(e,t){return dh(4,2,e,t)}function Xy(e,t){return dh(4,4,e,t)}function qy(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Yy(e,t,n){n=n!=null?n.concat([e]):null,dh(4,4,qy.bind(null,t,e),n)}function Gm(){}function Zy(e,t){var n=je();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Im(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function Jy(e,t){var n=je();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Im(t,i[1]))return i[0];if(i=e(),er){js(!0);try{e()}finally{js(!1)}}return n.memoizedState=[i,t],i}function km(e,t,n){return n===void 0||(Cs&1073741824)!==0&&(ie&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=Bx(),Zt.lanes|=e,ma|=e,n)}function Ky(e,t,n,i){return oi(n,t)?n:oo.current!==null?(e=km(e,n,i),oi(e,t)||(an=!0),e):(Cs&42)===0||(Cs&1073741824)!==0&&(ie&261930)===0?(an=!0,e.memoizedState=n):(e=Bx(),Zt.lanes|=e,ma|=e,t)}function Qy(e,t,n,i,s){var a=ve.p;ve.p=a!==0&&8>a?a:8;var r=Ot.T,o={};Ot.T=o,Xm(e,!1,t,n);try{var l=s(),c=Ot.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=hE(l,i);El(e,t,f,ri(e))}else El(e,t,i,ri(e))}catch(p){El(e,t,{then:function(){},status:"rejected",reason:p},ri())}finally{ve.p=a,r!==null&&o.types!==null&&(r.types=o.types),Ot.T=r}}function _E(){}function Xp(e,t,n,i){if(e.tag!==5)throw Error(et(476));var s=jy(e).queue;Qy(e,s,t,Ya,n===null?_E:function(){return $y(e),n(i)})}function jy(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ya,baseState:Ya,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rs,lastRenderedState:Ya},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rs,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function $y(e){var t=jy(e);t.next===null&&(t=e.alternate.memoizedState),El(e,t.next.queue,{},ri())}function Wm(){return Sn(Vl)}function tx(){return je().memoizedState}function ex(){return je().memoizedState}function vE(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=ri();e=aa(n);var i=ra(t,e,n);i!==null&&(Wn(i,t,n),Sl(i,t,n)),t={cache:Rm()},e.payload=t;return}t=t.return}}function yE(e,t,n){var i=ri();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},ph(e)?ix(t,n):(n=Tm(e,t,n,i),n!==null&&(Wn(n,e,i),sx(n,t,i)))}function nx(e,t,n){var i=ri();El(e,t,n,i)}function El(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(ph(e))ix(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,oi(o,r))return ch(e,t,s,0),Ue===null&&lh(),!1}catch{}finally{}if(n=Tm(e,t,s,i),n!==null)return Wn(n,e,i),sx(n,t,i),!0}return!1}function Xm(e,t,n,i){if(i={lane:2,revertLane:tg(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},ph(e)){if(t)throw Error(et(479))}else t=Tm(e,n,i,2),t!==null&&Wn(t,e,2)}function ph(e){var t=e.alternate;return e===Zt||t!==null&&t===Zt}function ix(e,t){eo=Vu=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function sx(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,kv(e,n)}}var zl={readContext:Sn,use:fh,useCallback:Ze,useContext:Ze,useEffect:Ze,useImperativeHandle:Ze,useLayoutEffect:Ze,useInsertionEffect:Ze,useMemo:Ze,useReducer:Ze,useRef:Ze,useState:Ze,useDebugValue:Ze,useDeferredValue:Ze,useTransition:Ze,useSyncExternalStore:Ze,useId:Ze,useHostTransitionStatus:Ze,useFormState:Ze,useActionState:Ze,useOptimistic:Ze,useMemoCache:Ze,useCacheRefresh:Ze};zl.useEffectEvent=Ze;var ax={readContext:Sn,use:fh,useCallback:function(e,t){return On().memoizedState=[e,t===void 0?null:t],e},useContext:Sn,useEffect:G_,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Su(4194308,4,qy.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Su(4194308,4,e,t)},useInsertionEffect:function(e,t){Su(4,2,e,t)},useMemo:function(e,t){var n=On();t=t===void 0?null:t;var i=e();if(er){js(!0);try{e()}finally{js(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=On();if(n!==void 0){var s=n(t);if(er){js(!0);try{n(t)}finally{js(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=yE.bind(null,Zt,e),[i.memoizedState,e]},useRef:function(e){var t=On();return e={current:e},t.memoizedState=e},useState:function(e){e=kp(e);var t=e.queue,n=nx.bind(null,Zt,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Gm,useDeferredValue:function(e,t){var n=On();return km(n,e,t)},useTransition:function(){var e=kp(!1);return e=Qy.bind(null,Zt,e.queue,!0,!1),On().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=Zt,s=On();if(he){if(n===void 0)throw Error(et(407));n=n()}else{if(n=t(),Ue===null)throw Error(et(349));(ie&127)!==0||Ly(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,G_(Iy.bind(null,i,a,e),[e]),i.flags|=2048,lo(9,{destroy:void 0},Ny.bind(null,i,a,n,t),null),n},useId:function(){var e=On(),t=Ue.identifierPrefix;if(he){var n=Ki,i=Ji;n=(i&~(1<<32-ai(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Gu++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=fE++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Wm,useFormState:F_,useActionState:F_,useOptimistic:function(e){var t=On();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Xm.bind(null,Zt,!0,n),n.dispatch=t,[e,t]},useMemoCache:Fm,useCacheRefresh:function(){return On().memoizedState=vE.bind(null,Zt)},useEffectEvent:function(e){var t=On(),n={impl:e};return t.memoizedState=n,function(){if((_e&2)!==0)throw Error(et(440));return n.impl.apply(void 0,arguments)}}},qm={readContext:Sn,use:fh,useCallback:Zy,useContext:Sn,useEffect:Vm,useImperativeHandle:Yy,useInsertionEffect:Wy,useLayoutEffect:Xy,useMemo:Jy,useReducer:xu,useRef:Gy,useState:function(){return xu(Rs)},useDebugValue:Gm,useDeferredValue:function(e,t){var n=je();return Ky(n,we.memoizedState,e,t)},useTransition:function(){var e=xu(Rs)[0],t=je().memoizedState;return[typeof e=="boolean"?e:Ql(e),t]},useSyncExternalStore:Uy,useId:tx,useHostTransitionStatus:Wm,useFormState:H_,useActionState:H_,useOptimistic:function(e,t){var n=je();return By(n,we,e,t)},useMemoCache:Fm,useCacheRefresh:ex};qm.useEffectEvent=ky;var rx={readContext:Sn,use:fh,useCallback:Zy,useContext:Sn,useEffect:Vm,useImperativeHandle:Yy,useInsertionEffect:Wy,useLayoutEffect:Xy,useMemo:Jy,useReducer:$d,useRef:Gy,useState:function(){return $d(Rs)},useDebugValue:Gm,useDeferredValue:function(e,t){var n=je();return we===null?km(n,e,t):Ky(n,we.memoizedState,e,t)},useTransition:function(){var e=$d(Rs)[0],t=je().memoizedState;return[typeof e=="boolean"?e:Ql(e),t]},useSyncExternalStore:Uy,useId:tx,useHostTransitionStatus:Wm,useFormState:V_,useActionState:V_,useOptimistic:function(e,t){var n=je();return we!==null?By(n,we,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:Fm,useCacheRefresh:ex};rx.useEffectEvent=ky;function tp(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:Be({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var qp={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=ri(),s=aa(i);s.payload=t,n!=null&&(s.callback=n),t=ra(e,s,i),t!==null&&(Wn(t,e,i),Sl(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=ri(),s=aa(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=ra(e,s,i),t!==null&&(Wn(t,e,i),Sl(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=ri(),i=aa(n);i.tag=2,t!=null&&(i.callback=t),t=ra(e,i,n),t!==null&&(Wn(t,e,n),Sl(t,e,n))}};function k_(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!Nl(n,i)||!Nl(s,a):!0}function W_(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&qp.enqueueReplaceState(t,t.state,null)}function nr(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=Be({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function ox(e){Iu(e)}function lx(e){console.error(e)}function cx(e){Iu(e)}function ku(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function X_(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function Yp(e,t,n){return n=aa(n),n.tag=3,n.payload={element:null},n.callback=function(){ku(e,t)},n}function ux(e){return e=aa(e),e.tag=3,e}function hx(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){X_(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){X_(t,n,i),typeof s!="function"&&(oa===null?oa=new Set([this]):oa.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function xE(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&_o(t,n,s,!0),n=li.current,n!==null){switch(n.tag){case 31:case 13:return bi===null?Zu():n.alternate===null&&Je===0&&(Je=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===zu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),hp(e,i,s)),!1;case 22:return n.flags|=65536,i===zu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),hp(e,i,s)),!1}throw Error(et(435,n.tag))}return hp(e,i,s),Zu(),!1}if(he)return t=li.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==Ip&&(e=Error(et(422),{cause:i}),Ol(Si(e,n)))):(i!==Ip&&(t=Error(et(423),{cause:i}),Ol(Si(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=Si(i,n),s=Yp(e.stateNode,i,s),jd(e,s),Je!==4&&(Je=2)),!1;var a=Error(et(520),{cause:i});if(a=Si(a,n),wl===null?wl=[a]:wl.push(a),Je!==4&&(Je=2),t===null)return!0;i=Si(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=Yp(n.stateNode,i,e),jd(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(oa===null||!oa.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=ux(s),hx(s,e,n,i),jd(n,s),!1}n=n.return}while(n!==null);return!1}var Ym=Error(et(461)),an=!1;function vn(e,t,n,i){t.child=e===null?Ty(t,null,n,i):tr(t,e.child,n,i)}function q_(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return $a(t),i=Om(e,t,n,r,a,s),o=Pm(),e!==null&&!an?(Bm(e,t,s),Ds(e,t,s)):(he&&o&&wm(t),t.flags|=1,vn(e,t,i,s),t.child)}function Y_(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!Am(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,fx(e,t,a,i,s)):(e=vu(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Zm(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:Nl,n(r,i)&&e.ref===t.ref)return Ds(e,t,s)}return t.flags|=1,e=Es(a,i),e.ref=t.ref,e.return=t,t.child=e}function fx(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(Nl(a,i)&&e.ref===t.ref)if(an=!1,t.pendingProps=i=a,Zm(e,s))(e.flags&131072)!==0&&(an=!0);else return t.lanes=e.lanes,Ds(e,t,s)}return Zp(e,t,n,i,s)}function dx(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return Z_(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&yu(t,a!==null?a.cachePool:null),a!==null?P_(t,a):Vp(),Cy(t);else return i=t.lanes=536870912,Z_(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(yu(t,a.cachePool),P_(t,a),Ks(t),t.memoizedState=null):(e!==null&&yu(t,null),Vp(),Ks(t));return vn(e,t,s,n),t.child}function ml(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Z_(e,t,n,i,s){var a=Dm();return a=a===null?null:{parent:sn._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&yu(t,null),Vp(),Cy(t),e!==null&&_o(e,t,i,!0),t.childLanes=s,null}function Mu(e,t){return t=Wu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function J_(e,t,n){return tr(t,e.child,null,n),e=Mu(t,t.pendingProps),e.flags|=2,ti(t),t.memoizedState=null,e}function SE(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(he){if(i.mode==="hidden")return e=Mu(t,i),t.lanes=536870912,ml(null,e);if(Gp(t),(e=Pe)?(e=aS(e,Mi),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:fa!==null?{id:Ji,overflow:Ki}:null,retryLane:536870912,hydrationErrors:null},n=vy(e),n.return=t,t.child=n,xn=t,Pe=null)):e=null,e===null)throw da(t);return t.lanes=536870912,null}return Mu(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(Gp(t),s)if(t.flags&256)t.flags&=-257,t=J_(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(et(558));else if(an||_o(e,t,n,!1),s=(n&e.childLanes)!==0,an||s){if(i=Ue,i!==null&&(r=Wv(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,rr(e,r),Wn(i,e,r),Ym;Zu(),t=J_(e,t,n)}else e=a.treeContext,Pe=Ei(r.nextSibling),xn=t,he=!0,sa=null,Mi=!1,e!==null&&xy(t,e),t=Mu(t,i),t.flags|=4096;return t}return e=Es(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function bu(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(et(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Zp(e,t,n,i,s){return $a(t),n=Om(e,t,n,i,void 0,s),i=Pm(),e!==null&&!an?(Bm(e,t,s),Ds(e,t,s)):(he&&i&&wm(t),t.flags|=1,vn(e,t,n,s),t.child)}function K_(e,t,n,i,s,a){return $a(t),t.updateQueue=null,n=Dy(t,i,n,s),Ry(e),i=Pm(),e!==null&&!an?(Bm(e,t,a),Ds(e,t,a)):(he&&i&&wm(t),t.flags|=1,vn(e,t,n,a),t.child)}function Q_(e,t,n,i,s){if($a(t),t.stateNode===null){var a=qr,r=n.contextType;typeof r=="object"&&r!==null&&(a=Sn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=qp,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},Lm(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?Sn(r):qr,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&(tp(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&qp.enqueueReplaceState(a,a.state,null),bl(t,i,a,s),Ml(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=nr(n,o);a.props=l;var c=a.context,f=n.contextType;r=qr,typeof f=="object"&&f!==null&&(r=Sn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&W_(t,a,i,r),Ys=!1;var u=t.memoizedState;a.state=u,bl(t,i,a,s),Ml(),c=t.memoizedState,o||u!==c||Ys?(typeof p=="function"&&(tp(t,n,p,i),c=t.memoizedState),(l=Ys||k_(t,n,l,i,u,c,r))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,Fp(e,t),r=t.memoizedProps,f=nr(n,r),a.props=f,p=t.pendingProps,u=a.context,c=n.contextType,l=qr,typeof c=="object"&&c!==null&&(l=Sn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==p||u!==l)&&W_(t,a,i,l),Ys=!1,u=t.memoizedState,a.state=u,bl(t,i,a,s),Ml();var d=t.memoizedState;r!==p||u!==d||Ys||e!==null&&e.dependencies!==null&&Bu(e.dependencies)?(typeof o=="function"&&(tp(t,n,o,i),d=t.memoizedState),(f=Ys||k_(t,n,f,i,u,d,l)||e!==null&&e.dependencies!==null&&Bu(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,d,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,d,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=d),a.props=i,a.state=d,a.context=l,i=f):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,bu(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=tr(t,e.child,null,s),t.child=tr(t,null,n,s)):vn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=Ds(e,t,s),e}function j_(e,t,n,i){return ja(),t.flags|=256,vn(e,t,n,i),t.child}var ep={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function np(e){return{baseLanes:e,cachePool:My()}}function ip(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=ni),e}function px(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(Qe.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(he){if(s?Js(t):Ks(t),(e=Pe)?(e=aS(e,Mi),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:fa!==null?{id:Ji,overflow:Ki}:null,retryLane:536870912,hydrationErrors:null},n=vy(e),n.return=t,t.child=n,xn=t,Pe=null)):e=null,e===null)throw da(t);return lm(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(Ks(t),s=t.mode,o=Wu({mode:"hidden",children:o},s),i=Za(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=np(n),i.childLanes=ip(e,r,n),t.memoizedState=ep,ml(null,i)):(Js(t),Jp(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(Js(t),t.flags&=-257,t=sp(e,t,n)):t.memoizedState!==null?(Ks(t),t.child=e.child,t.flags|=128,t=null):(Ks(t),o=i.fallback,s=t.mode,i=Wu({mode:"visible",children:i.children},s),o=Za(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,tr(t,e.child,null,n),i=t.child,i.memoizedState=np(n),i.childLanes=ip(e,r,n),t.memoizedState=ep,t=ml(null,i));else if(Js(t),lm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error(et(419)),i.stack="",i.digest=r,Ol({value:i,source:null,stack:null}),t=sp(e,t,n)}else if(an||_o(e,t,n,!1),r=(n&e.childLanes)!==0,an||r){if(r=Ue,r!==null&&(i=Wv(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,rr(e,i),Wn(r,e,i),Ym;om(o)||Zu(),t=sp(e,t,n)}else om(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Pe=Ei(o.nextSibling),xn=t,he=!0,sa=null,Mi=!1,e!==null&&xy(t,e),t=Jp(t,i.children),t.flags|=4096);return t}return s?(Ks(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=Es(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=Es(c,o):(o=Za(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,ml(null,i),i=t.child,o=e.child.memoizedState,o===null?o=np(n):(s=o.cachePool,s!==null?(l=sn._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=My(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=ip(e,r,n),t.memoizedState=ep,ml(e.child,i)):(Js(t),n=e.child,e=n.sibling,n=Es(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function Jp(e,t){return t=Wu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Wu(e,t){return e=ei(22,e,null,t),e.lanes=0,e}function sp(e,t,n){return tr(t,e.child,null,n),e=Jp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function $_(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Pp(e.return,t,n)}function ap(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function mx(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=Qe.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,Ne(Qe,r),vn(e,t,i,n),i=he?Il:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&$_(e,n,t);else if(e.tag===19)$_(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&Hu(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),ap(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&Hu(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}ap(t,!0,n,null,a,i);break;case"together":ap(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function Ds(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),ma|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(_o(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(et(153));if(t.child!==null){for(e=t.child,n=Es(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Es(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Zm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Bu(e)))}function ME(e,t,n){switch(t.tag){case 3:Du(t,t.stateNode.containerInfo),Zs(t,sn,e.memoizedState.cache),ja();break;case 27:case 5:bp(t);break;case 4:Du(t,t.stateNode.containerInfo);break;case 10:Zs(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Gp(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(Js(t),t.flags|=128,null):(n&t.child.childLanes)!==0?px(e,t,n):(Js(t),e=Ds(e,t,n),e!==null?e.sibling:null);Js(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(_o(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return mx(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),Ne(Qe,Qe.current),i)break;return null;case 22:return t.lanes=0,dx(e,t,n,t.pendingProps);case 24:Zs(t,sn,e.memoizedState.cache)}return Ds(e,t,n)}function gx(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)an=!0;else{if(!Zm(e,n)&&(t.flags&128)===0)return an=!1,ME(e,t,n);an=(e.flags&131072)!==0}else an=!1,he&&(t.flags&1048576)!==0&&yy(t,Il,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=Xa(t.elementType),t.type=e,typeof e=="function")Am(e)?(i=nr(e,i),t.tag=1,t=Q_(null,t,e,i,n)):(t.tag=0,t=Zp(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===fm){t.tag=11,t=q_(null,t,e,i,n);break t}else if(s===dm){t.tag=14,t=Y_(null,t,e,i,n);break t}}throw t=Sp(e)||e,Error(et(306,t,""))}}return t;case 0:return Zp(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=nr(i,t.pendingProps),Q_(e,t,i,s,n);case 3:t:{if(Du(t,t.stateNode.containerInfo),e===null)throw Error(et(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,Fp(e,t),bl(t,i,null,n);var r=t.memoizedState;if(i=r.cache,Zs(t,sn,i),i!==a.cache&&Bp(t,[sn],n,!0),Ml(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=j_(e,t,i,n);break t}else if(i!==s){s=Si(Error(et(424)),t),Ol(s),t=j_(e,t,i,n);break t}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Pe=Ei(e.firstChild),xn=t,he=!0,sa=null,Mi=!0,n=Ty(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ja(),i===s){t=Ds(e,t,n);break t}vn(e,t,i,n)}t=t.child}return t;case 26:return bu(e,t),e===null?(n=Sv(t.type,null,t.pendingProps,null))?t.memoizedState=n:he||(n=t.type,e=t.pendingProps,i=ju(ia.current).createElement(n),i[yn]=t,i[Xn]=e,Mn(i,n,e),pn(i),t.stateNode=i):t.memoizedState=Sv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return bp(t),e===null&&he&&(i=t.stateNode=rS(t.type,t.pendingProps,ia.current),xn=t,Mi=!0,s=Pe,_a(t.type)?(cm=s,Pe=Ei(i.firstChild)):Pe=s),vn(e,t,t.pendingProps.children,n),bu(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&he&&((s=i=Pe)&&(i=KE(i,t.type,t.pendingProps,Mi),i!==null?(t.stateNode=i,xn=t,Pe=Ei(i.firstChild),Mi=!1,s=!0):s=!1),s||da(t)),bp(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,am(s,a)?i=null:r!==null&&am(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=Om(e,t,dE,null,null,n),Vl._currentValue=s),bu(e,t),vn(e,t,i,n),t.child;case 6:return e===null&&he&&((e=n=Pe)&&(n=QE(n,t.pendingProps,Mi),n!==null?(t.stateNode=n,xn=t,Pe=null,e=!0):e=!1),e||da(t)),null;case 13:return px(e,t,n);case 4:return Du(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=tr(t,null,i,n):vn(e,t,i,n),t.child;case 11:return q_(e,t,t.type,t.pendingProps,n);case 7:return vn(e,t,t.pendingProps,n),t.child;case 8:return vn(e,t,t.pendingProps.children,n),t.child;case 12:return vn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,Zs(t,t.type,i.value),vn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,$a(t),s=Sn(s),i=i(s),t.flags|=1,vn(e,t,i,n),t.child;case 14:return Y_(e,t,t.type,t.pendingProps,n);case 15:return fx(e,t,t.type,t.pendingProps,n);case 19:return mx(e,t,n);case 31:return SE(e,t,n);case 22:return dx(e,t,n,t.pendingProps);case 24:return $a(t),i=Sn(sn),e===null?(s=Dm(),s===null&&(s=Ue,a=Rm(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},Lm(t),Zs(t,sn,s)):((e.lanes&n)!==0&&(Fp(e,t),bl(t,null,null,n),Ml()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),Zs(t,sn,i)):(i=a.cache,Zs(t,sn,i),i!==s.cache&&Bp(t,[sn],n,!0))),vn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(et(156,t.tag))}function ms(e){e.flags|=4}function rp(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(Hx())e.flags|=8192;else throw Ka=zu,Um}else e.flags&=-16777217}function tv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!cS(t))if(Hx())e.flags|=8192;else throw Ka=zu,Um}function ou(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Vv():536870912,e.lanes|=t,co|=t)}function ll(e,t){if(!he)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function Oe(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function bE(e,t,n){var i=t.pendingProps;switch(Cm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Oe(t),null;case 1:return Oe(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Ts(sn),io(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Ir(t)?ms(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Qd())),Oe(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(ms(t),a!==null?(Oe(t),tv(t,a)):(Oe(t),rp(t,s,null,i,n))):a?a!==e.memoizedState?(ms(t),Oe(t),tv(t,a)):(Oe(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&ms(t),Oe(t),rp(t,s,e,i,n)),null;case 27:if(Uu(t),n=ia.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ms(t);else{if(!i){if(t.stateNode===null)throw Error(et(166));return Oe(t),null}e=ji.current,Ir(t)?R_(t,e):(e=rS(s,i,n),t.stateNode=e,ms(t))}return Oe(t),null;case 5:if(Uu(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ms(t);else{if(!i){if(t.stateNode===null)throw Error(et(166));return Oe(t),null}if(a=ji.current,Ir(t))R_(t,a);else{var r=ju(ia.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[yn]=t,a[Xn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(Mn(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&ms(t)}}return Oe(t),rp(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&ms(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(et(166));if(e=ia.current,Ir(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=xn,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[yn]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||nS(e.nodeValue,n)),e||da(t,!0)}else e=ju(e).createTextNode(i),e[yn]=t,t.stateNode=e}return Oe(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Ir(t),n!==null){if(e===null){if(!i)throw Error(et(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(et(557));e[yn]=t}else ja(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Oe(t),e=!1}else n=Qd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(ti(t),t):(ti(t),null);if((t.flags&128)!==0)throw Error(et(558))}return Oe(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Ir(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error(et(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(et(317));s[yn]=t}else ja(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Oe(t),s=!1}else s=Qd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(ti(t),t):(ti(t),null)}return ti(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),ou(t,t.updateQueue),Oe(t),null);case 4:return io(),e===null&&eg(t.stateNode.containerInfo),Oe(t),null;case 10:return Ts(t.type),Oe(t),null;case 19:if(mn(Qe),i=t.memoizedState,i===null)return Oe(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)ll(i,!1);else{if(Je!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=Hu(e),a!==null){for(t.flags|=128,ll(i,!1),e=a.updateQueue,t.updateQueue=e,ou(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)_y(n,e),n=n.sibling;return Ne(Qe,Qe.current&1|2),he&&ys(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&ii()>qu&&(t.flags|=128,s=!0,ll(i,!1),t.lanes=4194304)}else{if(!s)if(e=Hu(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,ou(t,e),ll(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!he)return Oe(t),null}else 2*ii()-i.renderingStartTime>qu&&n!==536870912&&(t.flags|=128,s=!0,ll(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=ii(),e.sibling=null,n=Qe.current,Ne(Qe,s?n&1|2:n&1),he&&ys(t,i.treeForkCount),e):(Oe(t),null);case 22:case 23:return ti(t),Nm(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(Oe(t),t.subtreeFlags&6&&(t.flags|=8192)):Oe(t),n=t.updateQueue,n!==null&&ou(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&mn(Ja),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Ts(sn),Oe(t),null;case 25:return null;case 30:return null}throw Error(et(156,t.tag))}function EE(e,t){switch(Cm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Ts(sn),io(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Uu(t),null;case 31:if(t.memoizedState!==null){if(ti(t),t.alternate===null)throw Error(et(340));ja()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ti(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(et(340));ja()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return mn(Qe),null;case 4:return io(),null;case 10:return Ts(t.type),null;case 22:case 23:return ti(t),Nm(),e!==null&&mn(Ja),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Ts(sn),null;case 25:return null;default:return null}}function _x(e,t){switch(Cm(t),t.tag){case 3:Ts(sn),io();break;case 26:case 27:case 5:Uu(t);break;case 4:io();break;case 31:t.memoizedState!==null&&ti(t);break;case 13:ti(t);break;case 19:mn(Qe);break;case 10:Ts(t.type);break;case 22:case 23:ti(t),Nm(),e!==null&&mn(Ja);break;case 24:Ts(sn)}}function jl(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){Ee(t,t.return,o)}}function pa(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(f){Ee(s,l,f)}}}i=i.next}while(i!==a)}}catch(f){Ee(t,t.return,f)}}function vx(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{wy(t,n)}catch(i){Ee(e,e.return,i)}}}function yx(e,t,n){n.props=nr(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){Ee(e,t,i)}}function Tl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){Ee(e,t,s)}}function Qi(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){Ee(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){Ee(e,t,s)}else n.current=null}function xx(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){Ee(e,e.return,s)}}function op(e,t,n){try{var i=e.stateNode;WE(i,e.type,n,t),i[Xn]=t}catch(s){Ee(e,e.return,s)}}function Sx(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&_a(e.type)||e.tag===4}function lp(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Sx(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&_a(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Kp(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Ms));else if(i!==4&&(i===27&&_a(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Kp(e,t,n),e=e.sibling;e!==null;)Kp(e,t,n),e=e.sibling}function Xu(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&_a(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Xu(e,t,n),e=e.sibling;e!==null;)Xu(e,t,n),e=e.sibling}function Mx(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);Mn(t,i,n),t[yn]=e,t[Xn]=n}catch(a){Ee(e,e.return,a)}}var xs=!1,nn=!1,cp=!1,ev=typeof WeakSet=="function"?WeakSet:Set,dn=null;function TE(e,t){if(e=e.containerInfo,im=nh,e=cy(e),bm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,f=0,p=e,u=null;e:for(;;){for(var d;p!==n||s!==0&&p.nodeType!==3||(o=r+s),p!==a||i!==0&&p.nodeType!==3||(l=r+i),p.nodeType===3&&(r+=p.nodeValue.length),(d=p.firstChild)!==null;)u=p,p=d;for(;;){if(p===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++f===i&&(l=r),(d=p.nextSibling)!==null)break;p=u,u=p.parentNode}p=d}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(sm={focusedElem:e,selectionRange:n},nh=!1,dn=t;dn!==null;)if(t=dn,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,dn=e;else for(;dn!==null;){switch(t=dn,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var v=nr(n.type,s);e=i.getSnapshotBeforeUpdate(v,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(E){Ee(n,n.return,E)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)rm(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":rm(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(et(163))}if(e=t.sibling,e!==null){e.return=t.return,dn=e;break}dn=t.return}}function bx(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:_s(e,n),i&4&&jl(5,n);break;case 1:if(_s(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){Ee(n,n.return,r)}else{var s=nr(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){Ee(n,n.return,r)}}i&64&&vx(n),i&512&&Tl(n,n.return);break;case 3:if(_s(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{wy(e,t)}catch(r){Ee(n,n.return,r)}}break;case 27:t===null&&i&4&&Mx(n);case 26:case 5:_s(e,n),t===null&&i&4&&xx(n),i&512&&Tl(n,n.return);break;case 12:_s(e,n);break;case 31:_s(e,n),i&4&&Ax(e,n);break;case 13:_s(e,n),i&4&&wx(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=IE.bind(null,n),jE(e,n))));break;case 22:if(i=n.memoizedState!==null||xs,!i){t=t!==null&&t.memoizedState!==null||nn,s=xs;var a=nn;xs=i,(nn=t)&&!a?vs(e,n,(n.subtreeFlags&8772)!==0):_s(e,n),xs=s,nn=a}break;case 30:break;default:_s(e,n)}}function Ex(e){var t=e.alternate;t!==null&&(e.alternate=null,Ex(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&_m(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var ke=null,Gn=!1;function gs(e,t,n){for(n=n.child;n!==null;)Tx(e,t,n),n=n.sibling}function Tx(e,t,n){if(si&&typeof si.onCommitFiberUnmount=="function")try{si.onCommitFiberUnmount(Xl,n)}catch{}switch(n.tag){case 26:nn||Qi(n,t),gs(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:nn||Qi(n,t);var i=ke,s=Gn;_a(n.type)&&(ke=n.stateNode,Gn=!1),gs(e,t,n),Rl(n.stateNode),ke=i,Gn=s;break;case 5:nn||Qi(n,t);case 6:if(i=ke,s=Gn,ke=null,gs(e,t,n),ke=i,Gn=s,ke!==null)if(Gn)try{(ke.nodeType===9?ke.body:ke.nodeName==="HTML"?ke.ownerDocument.body:ke).removeChild(n.stateNode)}catch(a){Ee(n,t,a)}else try{ke.removeChild(n.stateNode)}catch(a){Ee(n,t,a)}break;case 18:ke!==null&&(Gn?(e=ke,gv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),po(e)):gv(ke,n.stateNode));break;case 4:i=ke,s=Gn,ke=n.stateNode.containerInfo,Gn=!0,gs(e,t,n),ke=i,Gn=s;break;case 0:case 11:case 14:case 15:pa(2,n,t),nn||pa(4,n,t),gs(e,t,n);break;case 1:nn||(Qi(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&yx(n,t,i)),gs(e,t,n);break;case 21:gs(e,t,n);break;case 22:nn=(i=nn)||n.memoizedState!==null,gs(e,t,n),nn=i;break;default:gs(e,t,n)}}function Ax(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{po(e)}catch(n){Ee(t,t.return,n)}}}function wx(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{po(e)}catch(n){Ee(t,t.return,n)}}function AE(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new ev),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new ev),t;default:throw Error(et(435,e.tag))}}function lu(e,t){var n=AE(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=OE.bind(null,e,i);i.then(s,s)}})}function Hn(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(_a(o.type)){ke=o.stateNode,Gn=!1;break t}break;case 5:ke=o.stateNode,Gn=!1;break t;case 3:case 4:ke=o.stateNode.containerInfo,Gn=!0;break t}o=o.return}if(ke===null)throw Error(et(160));Tx(a,r,s),ke=null,Gn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Cx(t,e),t=t.sibling}var Ni=null;function Cx(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Hn(t,e),Vn(e),i&4&&(pa(3,e,e.return),jl(3,e),pa(5,e,e.return));break;case 1:Hn(t,e),Vn(e),i&512&&(nn||n===null||Qi(n,n.return)),i&64&&xs&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Ni;if(Hn(t,e),Vn(e),i&512&&(nn||n===null||Qi(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[Zl]||a[yn]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),Mn(a,i,n),a[yn]=e,pn(a),i=a;break t;case"link":var r=bv("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),Mn(a,i,n),s.head.appendChild(a);break;case"meta":if(r=bv("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),Mn(a,i,n),s.head.appendChild(a);break;default:throw Error(et(468,i))}a[yn]=e,pn(a),i=a}e.stateNode=i}else Ev(s,e.type,e.stateNode);else e.stateNode=Mv(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?Ev(s,e.type,e.stateNode):Mv(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&op(e,e.memoizedProps,n.memoizedProps)}break;case 27:Hn(t,e),Vn(e),i&512&&(nn||n===null||Qi(n,n.return)),n!==null&&i&4&&op(e,e.memoizedProps,n.memoizedProps);break;case 5:if(Hn(t,e),Vn(e),i&512&&(nn||n===null||Qi(n,n.return)),e.flags&32){s=e.stateNode;try{ao(s,"")}catch(v){Ee(e,e.return,v)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,op(e,s,n!==null?n.memoizedProps:s)),i&1024&&(cp=!0);break;case 6:if(Hn(t,e),Vn(e),i&4){if(e.stateNode===null)throw Error(et(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(v){Ee(e,e.return,v)}}break;case 3:if(Au=null,s=Ni,Ni=$u(t.containerInfo),Hn(t,e),Ni=s,Vn(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{po(t.containerInfo)}catch(v){Ee(e,e.return,v)}cp&&(cp=!1,Rx(e));break;case 4:i=Ni,Ni=$u(e.stateNode.containerInfo),Hn(t,e),Vn(e),Ni=i;break;case 12:Hn(t,e),Vn(e);break;case 31:Hn(t,e),Vn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,lu(e,i)));break;case 13:Hn(t,e),Vn(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(mh=ii()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,lu(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=xs,f=nn;if(xs=c||s,nn=f||l,Hn(t,e),nn=f,xs=c,Vn(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||xs||nn||qa(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var p=l.memoizedProps.style,u=p!=null&&p.hasOwnProperty("display")?p.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(v){Ee(l,l.return,v)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(v){Ee(l,l.return,v)}}}else if(t.tag===18){if(n===null){l=t;try{var d=l.stateNode;s?_v(d,!0):_v(l.stateNode,!1)}catch(v){Ee(l,l.return,v)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,lu(e,n))));break;case 19:Hn(t,e),Vn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,lu(e,i)));break;case 30:break;case 21:break;default:Hn(t,e),Vn(e)}}function Vn(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Sx(i)){n=i;break}i=i.return}if(n==null)throw Error(et(160));switch(n.tag){case 27:var s=n.stateNode,a=lp(e);Xu(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&(ao(r,""),n.flags&=-33);var o=lp(e);Xu(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=lp(e);Kp(e,c,l);break;default:throw Error(et(161))}}catch(f){Ee(e,e.return,f)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Rx(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Rx(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function _s(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)bx(e,t.alternate,t),t=t.sibling}function qa(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:pa(4,t,t.return),qa(t);break;case 1:Qi(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&yx(t,t.return,n),qa(t);break;case 27:Rl(t.stateNode);case 26:case 5:Qi(t,t.return),qa(t);break;case 22:t.memoizedState===null&&qa(t);break;case 30:qa(t);break;default:qa(t)}e=e.sibling}}function vs(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:vs(s,a,n),jl(4,a);break;case 1:if(vs(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){Ee(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)Ay(l[s],o)}catch(c){Ee(i,i.return,c)}}n&&r&64&&vx(a),Tl(a,a.return);break;case 27:Mx(a);case 26:case 5:vs(s,a,n),n&&i===null&&r&4&&xx(a),Tl(a,a.return);break;case 12:vs(s,a,n);break;case 31:vs(s,a,n),n&&r&4&&Ax(s,a);break;case 13:vs(s,a,n),n&&r&4&&wx(s,a);break;case 22:a.memoizedState===null&&vs(s,a,n),Tl(a,a.return);break;case 30:break;default:vs(s,a,n)}t=t.sibling}}function Jm(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Kl(n))}function Km(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Kl(e))}function Li(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Dx(e,t,n,i),t=t.sibling}function Dx(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:Li(e,t,n,i),s&2048&&jl(9,t);break;case 1:Li(e,t,n,i);break;case 3:Li(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Kl(e)));break;case 12:if(s&2048){Li(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){Ee(t,t.return,l)}}else Li(e,t,n,i);break;case 31:Li(e,t,n,i);break;case 13:Li(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?Li(e,t,n,i):Al(e,t):a._visibility&2?Li(e,t,n,i):(a._visibility|=2,Pr(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&Jm(r,t);break;case 24:Li(e,t,n,i),s&2048&&Km(t.alternate,t);break;default:Li(e,t,n,i)}}function Pr(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:Pr(a,r,o,l,s),jl(8,r);break;case 23:break;case 22:var f=r.stateNode;r.memoizedState!==null?f._visibility&2?Pr(a,r,o,l,s):Al(a,r):(f._visibility|=2,Pr(a,r,o,l,s)),s&&c&2048&&Jm(r.alternate,r);break;case 24:Pr(a,r,o,l,s),s&&c&2048&&Km(r.alternate,r);break;default:Pr(a,r,o,l,s)}t=t.sibling}}function Al(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:Al(n,i),s&2048&&Jm(i.alternate,i);break;case 24:Al(n,i),s&2048&&Km(i.alternate,i);break;default:Al(n,i)}t=t.sibling}}var gl=8192;function Or(e,t,n){if(e.subtreeFlags&gl)for(e=e.child;e!==null;)Ux(e,t,n),e=e.sibling}function Ux(e,t,n){switch(e.tag){case 26:Or(e,t,n),e.flags&gl&&e.memoizedState!==null&&uT(n,Ni,e.memoizedState,e.memoizedProps);break;case 5:Or(e,t,n);break;case 3:case 4:var i=Ni;Ni=$u(e.stateNode.containerInfo),Or(e,t,n),Ni=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=gl,gl=16777216,Or(e,t,n),gl=i):Or(e,t,n));break;default:Or(e,t,n)}}function Lx(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function cl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];dn=i,Ix(i,e)}Lx(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Nx(e),e=e.sibling}function Nx(e){switch(e.tag){case 0:case 11:case 15:cl(e),e.flags&2048&&pa(9,e,e.return);break;case 3:cl(e);break;case 12:cl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Eu(e)):cl(e);break;default:cl(e)}}function Eu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];dn=i,Ix(i,e)}Lx(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:pa(8,t,t.return),Eu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Eu(t));break;default:Eu(t)}e=e.sibling}}function Ix(e,t){for(;dn!==null;){var n=dn;switch(n.tag){case 0:case 11:case 15:pa(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Kl(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,dn=i;else t:for(n=e;dn!==null;){i=dn;var s=i.sibling,a=i.return;if(Ex(i),i===n){dn=null;break t}if(s!==null){s.return=a,dn=s;break t}dn=a}}}var wE={getCacheForType:function(e){var t=Sn(sn),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Sn(sn).controller.signal}},CE=typeof WeakMap=="function"?WeakMap:Map,_e=0,Ue=null,ne=null,ie=0,be=0,$n=null,ta=!1,yo=!1,Qm=!1,Us=0,Je=0,ma=0,Qa=0,jm=0,ni=0,co=0,wl=null,kn=null,Qp=!1,mh=0,Ox=0,qu=1/0,Yu=null,oa=null,ln=0,la=null,uo=null,As=0,jp=0,$p=null,Px=null,Cl=0,tm=null;function ri(){return(_e&2)!==0&&ie!==0?ie&-ie:Ot.T!==null?tg():Xv()}function Bx(){if(ni===0)if((ie&536870912)===0||he){var e=jc;jc<<=1,(jc&3932160)===0&&(jc=262144),ni=e}else ni=536870912;return e=li.current,e!==null&&(e.flags|=32),ni}function Wn(e,t,n){(e===Ue&&(be===2||be===9)||e.cancelPendingCommit!==null)&&(ho(e,0),ea(e,ie,ni,!1)),Yl(e,n),((_e&2)===0||e!==Ue)&&(e===Ue&&((_e&2)===0&&(Qa|=n),Je===4&&ea(e,ie,ni,!1)),ts(e))}function zx(e,t,n){if((_e&6)!==0)throw Error(et(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||ql(e,t),s=i?UE(e,t):up(e,t,!0),a=i;do{if(s===0){yo&&!i&&ea(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!RE(n)){s=up(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=wl;var l=o.current.memoizedState.isDehydrated;if(l&&(ho(o,r).flags|=256),r=up(o,r,!1),r!==2){if(Qm&&!l){o.errorRecoveryDisabledLanes|=a,Qa|=a,s=4;break t}a=kn,kn=s,a!==null&&(kn===null?kn=a:kn.push.apply(kn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){ho(e,0),ea(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error(et(345));case 4:if((t&4194048)!==t)break;case 6:ea(i,t,ni,!ta);break t;case 2:kn=null;break;case 3:case 5:break;default:throw Error(et(329))}if((t&62914560)===t&&(s=mh+300-ii(),10<s)){if(ea(i,t,ni,!ta),sh(i,0,!0)!==0)break t;As=t,i.timeoutHandle=sS(nv.bind(null,i,n,kn,Yu,Qp,t,ni,Qa,co,ta,a,"Throttled",-0,0),s);break t}nv(i,n,kn,Yu,Qp,t,ni,Qa,co,ta,a,null,-0,0)}}break}while(!0);ts(e)}function nv(e,t,n,i,s,a,r,o,l,c,f,p,u,d){if(e.timeoutHandle=-1,p=t.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Ms},Ux(t,a,p);var v=(a&62914560)===a?mh-ii():(a&4194048)===a?Ox-ii():0;if(v=hT(p,v),v!==null){As=a,e.cancelPendingCommit=v(sv.bind(null,e,t,a,n,i,s,r,o,l,f,p,null,u,d)),ea(e,a,r,!c);return}}sv(e,t,a,n,i,s,r,o,l)}function RE(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!oi(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ea(e,t,n,i){t&=~jm,t&=~Qa,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-ai(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&Gv(e,n,t)}function gh(){return(_e&6)===0?($l(0,!1),!1):!0}function $m(){if(ne!==null){if(be===0)var e=ne.return;else e=ne,bs=or=null,zm(e),to=null,Pl=0,e=ne;for(;e!==null;)_x(e.alternate,e),e=e.return;ne=null}}function ho(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,YE(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),As=0,$m(),Ue=e,ne=n=Es(e.current,null),ie=t,be=0,$n=null,ta=!1,yo=ql(e,t),Qm=!1,co=ni=jm=Qa=ma=Je=0,kn=wl=null,Qp=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-ai(i),a=1<<s;t|=e[s],i&=~a}return Us=t,lh(),n}function Fx(e,t){Zt=null,Ot.H=zl,t===vo||t===uh?(t=I_(),be=3):t===Um?(t=I_(),be=4):be=t===Ym?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,$n=t,ne===null&&(Je=1,ku(e,Si(t,e.current)))}function Hx(){var e=li.current;return e===null?!0:(ie&4194048)===ie?bi===null:(ie&62914560)===ie||(ie&536870912)!==0?e===bi:!1}function Vx(){var e=Ot.H;return Ot.H=zl,e===null?zl:e}function Gx(){var e=Ot.A;return Ot.A=wE,e}function Zu(){Je=4,ta||(ie&4194048)!==ie&&li.current!==null||(yo=!0),(ma&134217727)===0&&(Qa&134217727)===0||Ue===null||ea(Ue,ie,ni,!1)}function up(e,t,n){var i=_e;_e|=2;var s=Vx(),a=Gx();(Ue!==e||ie!==t)&&(Yu=null,ho(e,t)),t=!1;var r=Je;t:do try{if(be!==0&&ne!==null){var o=ne,l=$n;switch(be){case 8:$m(),r=6;break t;case 3:case 2:case 9:case 6:li.current===null&&(t=!0);var c=be;if(be=0,$n=null,Jr(e,o,l,c),n&&yo){r=0;break t}break;default:c=be,be=0,$n=null,Jr(e,o,l,c)}}DE(),r=Je;break}catch(f){Fx(e,f)}while(!0);return t&&e.shellSuspendCounter++,bs=or=null,_e=i,Ot.H=s,Ot.A=a,ne===null&&(Ue=null,ie=0,lh()),r}function DE(){for(;ne!==null;)kx(ne)}function UE(e,t){var n=_e;_e|=2;var i=Vx(),s=Gx();Ue!==e||ie!==t?(Yu=null,qu=ii()+500,ho(e,t)):yo=ql(e,t);t:do try{if(be!==0&&ne!==null){t=ne;var a=$n;e:switch(be){case 1:be=0,$n=null,Jr(e,t,a,1);break;case 2:case 9:if(N_(a)){be=0,$n=null,iv(t);break}t=function(){be!==2&&be!==9||Ue!==e||(be=7),ts(e)},a.then(t,t);break t;case 3:be=7;break t;case 4:be=5;break t;case 7:N_(a)?(be=0,$n=null,iv(t)):(be=0,$n=null,Jr(e,t,a,7));break;case 5:var r=null;switch(ne.tag){case 26:r=ne.memoizedState;case 5:case 27:var o=ne;if(r?cS(r):o.stateNode.complete){be=0,$n=null;var l=o.sibling;if(l!==null)ne=l;else{var c=o.return;c!==null?(ne=c,_h(c)):ne=null}break e}}be=0,$n=null,Jr(e,t,a,5);break;case 6:be=0,$n=null,Jr(e,t,a,6);break;case 8:$m(),Je=6;break t;default:throw Error(et(462))}}LE();break}catch(f){Fx(e,f)}while(!0);return bs=or=null,Ot.H=i,Ot.A=s,_e=n,ne!==null?0:(Ue=null,ie=0,lh(),Je)}function LE(){for(;ne!==null&&!e1();)kx(ne)}function kx(e){var t=gx(e.alternate,e,Us);e.memoizedProps=e.pendingProps,t===null?_h(e):ne=t}function iv(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=K_(n,t,t.pendingProps,t.type,void 0,ie);break;case 11:t=K_(n,t,t.pendingProps,t.type.render,t.ref,ie);break;case 5:zm(t);default:_x(n,t),t=ne=_y(t,Us),t=gx(n,t,Us)}e.memoizedProps=e.pendingProps,t===null?_h(e):ne=t}function Jr(e,t,n,i){bs=or=null,zm(t),to=null,Pl=0;var s=t.return;try{if(xE(e,s,t,n,ie)){Je=1,ku(e,Si(n,e.current)),ne=null;return}}catch(a){if(s!==null)throw ne=s,a;Je=1,ku(e,Si(n,e.current)),ne=null;return}t.flags&32768?(he||i===1?e=!0:yo||(ie&536870912)!==0?e=!1:(ta=e=!0,(i===2||i===9||i===3||i===6)&&(i=li.current,i!==null&&i.tag===13&&(i.flags|=16384))),Wx(t,e)):_h(t)}function _h(e){var t=e;do{if((t.flags&32768)!==0){Wx(t,ta);return}e=t.return;var n=bE(t.alternate,t,Us);if(n!==null){ne=n;return}if(t=t.sibling,t!==null){ne=t;return}ne=t=e}while(t!==null);Je===0&&(Je=5)}function Wx(e,t){do{var n=EE(e.alternate,e);if(n!==null){n.flags&=32767,ne=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){ne=e;return}ne=e=n}while(e!==null);Je=6,ne=null}function sv(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do vh();while(ln!==0);if((_e&6)!==0)throw Error(et(327));if(t!==null){if(t===e.current)throw Error(et(177));if(a=t.lanes|t.childLanes,a|=Em,h1(e,n,a,r,o,l),e===Ue&&(ne=Ue=null,ie=0),uo=t,la=e,As=n,jp=a,$p=s,Px=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,PE(Lu,function(){return Jx(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=Ot.T,Ot.T=null,s=ve.p,ve.p=2,r=_e,_e|=4;try{TE(e,t,n)}finally{_e=r,ve.p=s,Ot.T=i}}ln=1,Xx(),qx(),Yx()}}function Xx(){if(ln===1){ln=0;var e=la,t=uo,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=Ot.T,Ot.T=null;var i=ve.p;ve.p=2;var s=_e;_e|=4;try{Cx(t,e);var a=sm,r=cy(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&ly(o.ownerDocument.documentElement,o)){if(l!==null&&bm(o)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(f,o.value.length);else{var p=o.ownerDocument||document,u=p&&p.defaultView||window;if(u.getSelection){var d=u.getSelection(),v=o.textContent.length,E=Math.min(l.start,v),m=l.end===void 0?E:Math.min(l.end,v);!d.extend&&E>m&&(r=m,m=E,E=r);var h=A_(o,E),g=A_(o,m);if(h&&g&&(d.rangeCount!==1||d.anchorNode!==h.node||d.anchorOffset!==h.offset||d.focusNode!==g.node||d.focusOffset!==g.offset)){var M=p.createRange();M.setStart(h.node,h.offset),d.removeAllRanges(),E>m?(d.addRange(M),d.extend(g.node,g.offset)):(M.setEnd(g.node,g.offset),d.addRange(M))}}}}for(p=[],d=o;d=d.parentNode;)d.nodeType===1&&p.push({element:d,left:d.scrollLeft,top:d.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<p.length;o++){var y=p[o];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}nh=!!im,sm=im=null}finally{_e=s,ve.p=i,Ot.T=n}}e.current=t,ln=2}}function qx(){if(ln===2){ln=0;var e=la,t=uo,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=Ot.T,Ot.T=null;var i=ve.p;ve.p=2;var s=_e;_e|=4;try{bx(e,t.alternate,t)}finally{_e=s,ve.p=i,Ot.T=n}}ln=3}}function Yx(){if(ln===4||ln===3){ln=0,n1();var e=la,t=uo,n=As,i=Px;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?ln=5:(ln=0,uo=la=null,Zx(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(oa=null),gm(n),t=t.stateNode,si&&typeof si.onCommitFiberRoot=="function")try{si.onCommitFiberRoot(Xl,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=Ot.T,s=ve.p,ve.p=2,Ot.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{Ot.T=t,ve.p=s}}(As&3)!==0&&vh(),ts(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===tm?Cl++:(Cl=0,tm=e):Cl=0,$l(0,!1)}}function Zx(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Kl(t)))}function vh(){return Xx(),qx(),Yx(),Jx()}function Jx(){if(ln!==5)return!1;var e=la,t=jp;jp=0;var n=gm(As),i=Ot.T,s=ve.p;try{ve.p=32>n?32:n,Ot.T=null,n=$p,$p=null;var a=la,r=As;if(ln=0,uo=la=null,As=0,(_e&6)!==0)throw Error(et(331));var o=_e;if(_e|=4,Nx(a.current),Dx(a,a.current,r,n),_e=o,$l(0,!1),si&&typeof si.onPostCommitFiberRoot=="function")try{si.onPostCommitFiberRoot(Xl,a)}catch{}return!0}finally{ve.p=s,Ot.T=i,Zx(e,t)}}function av(e,t,n){t=Si(n,t),t=Yp(e.stateNode,t,2),e=ra(e,t,2),e!==null&&(Yl(e,2),ts(e))}function Ee(e,t,n){if(e.tag===3)av(e,e,n);else for(;t!==null;){if(t.tag===3){av(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(oa===null||!oa.has(i))){e=Si(n,e),n=ux(2),i=ra(t,n,2),i!==null&&(hx(n,i,t,e),Yl(i,2),ts(i));break}}t=t.return}}function hp(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new CE;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(Qm=!0,s.add(n),e=NE.bind(null,e,t,n),t.then(e,e))}function NE(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Ue===e&&(ie&n)===n&&(Je===4||Je===3&&(ie&62914560)===ie&&300>ii()-mh?(_e&2)===0&&ho(e,0):jm|=n,co===ie&&(co=0)),ts(e)}function Kx(e,t){t===0&&(t=Vv()),e=rr(e,t),e!==null&&(Yl(e,t),ts(e))}function IE(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Kx(e,n)}function OE(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(et(314))}i!==null&&i.delete(t),Kx(e,n)}function PE(e,t){return pm(e,t)}var Ju=null,Br=null,em=!1,Ku=!1,fp=!1,na=0;function ts(e){e!==Br&&e.next===null&&(Br===null?Ju=Br=e:Br=Br.next=e),Ku=!0,em||(em=!0,zE())}function $l(e,t){if(!fp&&Ku){fp=!0;do for(var n=!1,i=Ju;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-ai(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,rv(i,a))}else a=ie,a=sh(i,i===Ue?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||ql(i,a)||(n=!0,rv(i,a));i=i.next}while(n);fp=!1}}function BE(){Qx()}function Qx(){Ku=em=!1;var e=0;na!==0&&qE()&&(e=na);for(var t=ii(),n=null,i=Ju;i!==null;){var s=i.next,a=jx(i,t);a===0?(i.next=null,n===null?Ju=s:n.next=s,s===null&&(Br=n)):(n=i,(e!==0||(a&3)!==0)&&(Ku=!0)),i=s}ln!==0&&ln!==5||$l(e,!1),na!==0&&(na=0)}function jx(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-ai(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=u1(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=Ue,n=ie,n=sh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(be===2||be===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Vd(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||ql(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&Vd(i),gm(n)){case 2:case 8:n=Fv;break;case 32:n=Lu;break;case 268435456:n=Hv;break;default:n=Lu}return i=$x.bind(null,e),n=pm(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&Vd(i),e.callbackPriority=2,e.callbackNode=null,2}function $x(e,t){if(ln!==0&&ln!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(vh()&&e.callbackNode!==n)return null;var i=ie;return i=sh(e,e===Ue?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(zx(e,i,t),jx(e,ii()),e.callbackNode!=null&&e.callbackNode===n?$x.bind(null,e):null)}function rv(e,t){if(vh())return null;zx(e,t,!0)}function zE(){ZE(function(){(_e&6)!==0?pm(zv,BE):Qx()})}function tg(){if(na===0){var e=ro;e===0&&(e=Qc,Qc<<=1,(Qc&261888)===0&&(Qc=256)),na=e}return na}function ov(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:mu(""+e)}function lv(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function FE(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=ov((s[Xn]||null).action),r=i.submitter;r&&(t=(t=r[Xn]||null)?ov(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new ah("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(na!==0){var l=r?lv(s,r):new FormData(s);Xp(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?lv(s,r):new FormData(s),Xp(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(cu=0;cu<Np.length;cu++)uu=Np[cu],cv=uu.toLowerCase(),uv=uu[0].toUpperCase()+uu.slice(1),Ii(cv,"on"+uv);var uu,cv,uv,cu;Ii(hy,"onAnimationEnd");Ii(fy,"onAnimationIteration");Ii(dy,"onAnimationStart");Ii("dblclick","onDoubleClick");Ii("focusin","onFocus");Ii("focusout","onBlur");Ii(iE,"onTransitionRun");Ii(sE,"onTransitionStart");Ii(aE,"onTransitionCancel");Ii(py,"onTransitionEnd");so("onMouseEnter",["mouseout","mouseover"]);so("onMouseLeave",["mouseout","mouseover"]);so("onPointerEnter",["pointerout","pointerover"]);so("onPointerLeave",["pointerout","pointerover"]);ir("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ir("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ir("onBeforeInput",["compositionend","keypress","textInput","paste"]);ir("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ir("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ir("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Fl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),HE=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Fl));function tS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Iu(f)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Iu(f)}s.currentTarget=null,a=l}}}}function ee(e,t){var n=t[Tp];n===void 0&&(n=t[Tp]=new Set);var i=e+"__bubble";n.has(i)||(eS(t,e,2,!1),n.add(i))}function dp(e,t,n){var i=0;t&&(i|=4),eS(n,e,i,t)}var hu="_reactListening"+Math.random().toString(36).slice(2);function eg(e){if(!e[hu]){e[hu]=!0,qv.forEach(function(n){n!=="selectionchange"&&(HE.has(n)||dp(n,!1,e),dp(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[hu]||(t[hu]=!0,dp("selectionchange",!1,t))}}function eS(e,t,n,i){switch(pS(t)){case 2:var s=pT;break;case 8:s=mT;break;default:s=ag}n=s.bind(null,t,n,e),s=void 0,!Dp||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function pp(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Hr(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}ty(function(){var c=a,f=ym(n),p=[];t:{var u=my.get(e);if(u!==void 0){var d=ah,v=e;switch(e){case"keypress":if(_u(n)===0)break t;case"keydown":case"keyup":d=O1;break;case"focusin":v="focus",d=qd;break;case"focusout":v="blur",d=qd;break;case"beforeblur":case"afterblur":d=qd;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":d=__;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":d=b1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":d=z1;break;case hy:case fy:case dy:d=A1;break;case py:d=H1;break;case"scroll":case"scrollend":d=S1;break;case"wheel":d=G1;break;case"copy":case"cut":case"paste":d=C1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":d=y_;break;case"toggle":case"beforetoggle":d=W1}var E=(t&4)!==0,m=!E&&(e==="scroll"||e==="scrollend"),h=E?u!==null?u+"Capture":null:u;E=[];for(var g=c,M;g!==null;){var y=g;if(M=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||M===null||h===null||(y=Ul(g,h),y!=null&&E.push(Hl(g,y,M))),m)break;g=g.return}0<E.length&&(u=new d(u,v,null,n,f),p.push({event:u,listeners:E}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",d=e==="mouseout"||e==="pointerout",u&&n!==Rp&&(v=n.relatedTarget||n.fromElement)&&(Hr(v)||v[mo]))break t;if((d||u)&&(u=f.window===f?f:(u=f.ownerDocument)?u.defaultView||u.parentWindow:window,d?(v=n.relatedTarget||n.toElement,d=c,v=v?Hr(v):null,v!==null&&(m=Wl(v),E=v.tag,v!==m||E!==5&&E!==27&&E!==6)&&(v=null)):(d=null,v=c),d!==v)){if(E=__,y="onMouseLeave",h="onMouseEnter",g="mouse",(e==="pointerout"||e==="pointerover")&&(E=y_,y="onPointerLeave",h="onPointerEnter",g="pointer"),m=d==null?u:pl(d),M=v==null?u:pl(v),u=new E(y,g+"leave",d,n,f),u.target=m,u.relatedTarget=M,y=null,Hr(f)===c&&(E=new E(h,g+"enter",v,n,f),E.target=M,E.relatedTarget=m,y=E),m=y,d&&v)e:{for(E=VE,h=d,g=v,M=0,y=h;y;y=E(y))M++;y=0;for(var b=g;b;b=E(b))y++;for(;0<M-y;)h=E(h),M--;for(;0<y-M;)g=E(g),y--;for(;M--;){if(h===g||g!==null&&h===g.alternate){E=h;break e}h=E(h),g=E(g)}E=null}else E=null;d!==null&&hv(p,u,d,E,!1),v!==null&&m!==null&&hv(p,m,v,E,!0)}}t:{if(u=c?pl(c):window,d=u.nodeName&&u.nodeName.toLowerCase(),d==="select"||d==="input"&&u.type==="file")var T=b_;else if(M_(u))if(ry)T=tE;else{T=j1;var w=Q1}else d=u.nodeName,!d||d.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&vm(c.elementType)&&(T=b_):T=$1;if(T&&(T=T(e,c))){ay(p,T,n,f);break t}w&&w(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Cp(u,"number",u.value)}switch(w=c?pl(c):window,e){case"focusin":(M_(w)||w.contentEditable==="true")&&(kr=w,Up=c,yl=null);break;case"focusout":yl=Up=kr=null;break;case"mousedown":Lp=!0;break;case"contextmenu":case"mouseup":case"dragend":Lp=!1,w_(p,n,f);break;case"selectionchange":if(nE)break;case"keydown":case"keyup":w_(p,n,f)}var x;if(Mm)t:{switch(e){case"compositionstart":var A="onCompositionStart";break t;case"compositionend":A="onCompositionEnd";break t;case"compositionupdate":A="onCompositionUpdate";break t}A=void 0}else Gr?iy(e,n)&&(A="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(ny&&n.locale!=="ko"&&(Gr||A!=="onCompositionStart"?A==="onCompositionEnd"&&Gr&&(x=ey()):($s=f,xm="value"in $s?$s.value:$s.textContent,Gr=!0)),w=Qu(c,A),0<w.length&&(A=new v_(A,e,null,n,f),p.push({event:A,listeners:w}),x?A.data=x:(x=sy(n),x!==null&&(A.data=x)))),(x=q1?Y1(e,n):Z1(e,n))&&(A=Qu(c,"onBeforeInput"),0<A.length&&(w=new v_("onBeforeInput","beforeinput",null,n,f),p.push({event:w,listeners:A}),w.data=x)),FE(p,e,c,n,f)}tS(p,t)})}function Hl(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Qu(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=Ul(e,n),s!=null&&i.unshift(Hl(e,s,a)),s=Ul(e,t),s!=null&&i.push(Hl(e,s,a))),e.tag===3)return i;e=e.return}return[]}function VE(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function hv(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=Ul(n,a),c!=null&&r.unshift(Hl(n,c,l))):s||(c=Ul(n,a),c!=null&&r.push(Hl(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var GE=/\r\n?/g,kE=/\u0000|\uFFFD/g;function fv(e){return(typeof e=="string"?e:""+e).replace(GE,`
`).replace(kE,"")}function nS(e,t){return t=fv(t),fv(e)===t}function Ae(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||ao(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&ao(e,""+i);break;case"className":tu(e,"class",i);break;case"tabIndex":tu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":tu(e,n,i);break;case"style":$v(e,i,a);break;case"data":if(t!=="object"){tu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=mu(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&Ae(e,t,"name",s.name,s,null),Ae(e,t,"formEncType",s.formEncType,s,null),Ae(e,t,"formMethod",s.formMethod,s,null),Ae(e,t,"formTarget",s.formTarget,s,null)):(Ae(e,t,"encType",s.encType,s,null),Ae(e,t,"method",s.method,s,null),Ae(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=mu(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=Ms);break;case"onScroll":i!=null&&ee("scroll",e);break;case"onScrollEnd":i!=null&&ee("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(et(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(et(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=mu(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":ee("beforetoggle",e),ee("toggle",e),pu(e,"popover",i);break;case"xlinkActuate":ps(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":ps(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":ps(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":ps(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":ps(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":ps(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":ps(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":ps(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":ps(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":pu(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=y1.get(n)||n,pu(e,n,i))}}function nm(e,t,n,i,s,a){switch(n){case"style":$v(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(et(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(et(60));e.innerHTML=n}}break;case"children":typeof i=="string"?ao(e,i):(typeof i=="number"||typeof i=="bigint")&&ao(e,""+i);break;case"onScroll":i!=null&&ee("scroll",e);break;case"onScrollEnd":i!=null&&ee("scrollend",e);break;case"onClick":i!=null&&(e.onclick=Ms);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Yv.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[Xn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):pu(e,n,i)}}}function Mn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ee("error",e),ee("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(et(137,t));default:Ae(e,t,a,r,n,null)}}s&&Ae(e,t,"srcSet",n.srcSet,n,null),i&&Ae(e,t,"src",n.src,n,null);return;case"input":ee("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var f=n[i];if(f!=null)switch(i){case"name":s=f;break;case"type":r=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":a=f;break;case"defaultValue":o=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(et(137,t));break;default:Ae(e,t,i,f,n,null)}}Kv(e,a,o,l,c,r,s,!1);return;case"select":ee("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:Ae(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?Qr(e,!!i,t,!1):n!=null&&Qr(e,!!i,n,!0);return;case"textarea":ee("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(et(91));break;default:Ae(e,t,r,o,n,null)}jv(e,i,s,a);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":e.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:Ae(e,t,l,i,n,null)}return;case"dialog":ee("beforetoggle",e),ee("toggle",e),ee("cancel",e),ee("close",e);break;case"iframe":case"object":ee("load",e);break;case"video":case"audio":for(i=0;i<Fl.length;i++)ee(Fl[i],e);break;case"image":ee("error",e),ee("load",e);break;case"details":ee("toggle",e);break;case"embed":case"source":case"link":ee("error",e),ee("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(et(137,t));default:Ae(e,t,c,i,n,null)}return;default:if(vm(t)){for(f in n)n.hasOwnProperty(f)&&(i=n[f],i!==void 0&&nm(e,t,f,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&Ae(e,t,o,i,n,null))}function WE(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,f=null;for(d in n){var p=n[d];if(n.hasOwnProperty(d)&&p!=null)switch(d){case"checked":break;case"value":break;case"defaultValue":l=p;default:i.hasOwnProperty(d)||Ae(e,t,d,null,i,p)}}for(var u in i){var d=i[u];if(p=n[u],i.hasOwnProperty(u)&&(d!=null||p!=null))switch(u){case"type":a=d;break;case"name":s=d;break;case"checked":c=d;break;case"defaultChecked":f=d;break;case"value":r=d;break;case"defaultValue":o=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(et(137,t));break;default:d!==p&&Ae(e,t,u,d,i,p)}}wp(e,r,o,l,c,f,a,s);return;case"select":d=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":d=l;default:i.hasOwnProperty(a)||Ae(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&Ae(e,t,s,a,i,l)}t=o,n=r,i=d,u!=null?Qr(e,!!n,u,!1):!!i!=!!n&&(t!=null?Qr(e,!!n,t,!0):Qr(e,!!n,n?[]:"",!1));return;case"textarea":d=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:Ae(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":d=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(et(91));break;default:s!==a&&Ae(e,t,r,s,i,a)}Qv(e,u,d);return;case"option":for(var v in n)if(u=n[v],n.hasOwnProperty(v)&&u!=null&&!i.hasOwnProperty(v))switch(v){case"selected":e.selected=!1;break;default:Ae(e,t,v,null,i,u)}for(l in i)if(u=i[l],d=n[l],i.hasOwnProperty(l)&&u!==d&&(u!=null||d!=null))switch(l){case"selected":e.selected=u&&typeof u!="function"&&typeof u!="symbol";break;default:Ae(e,t,l,u,i,d)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var E in n)u=n[E],n.hasOwnProperty(E)&&u!=null&&!i.hasOwnProperty(E)&&Ae(e,t,E,null,i,u);for(c in i)if(u=i[c],d=n[c],i.hasOwnProperty(c)&&u!==d&&(u!=null||d!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(et(137,t));break;default:Ae(e,t,c,u,i,d)}return;default:if(vm(t)){for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!==void 0&&!i.hasOwnProperty(m)&&nm(e,t,m,void 0,i,u);for(f in i)u=i[f],d=n[f],!i.hasOwnProperty(f)||u===d||u===void 0&&d===void 0||nm(e,t,f,u,i,d);return}}for(var h in n)u=n[h],n.hasOwnProperty(h)&&u!=null&&!i.hasOwnProperty(h)&&Ae(e,t,h,null,i,u);for(p in i)u=i[p],d=n[p],!i.hasOwnProperty(p)||u===d||u==null&&d==null||Ae(e,t,p,u,i,d)}function dv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function XE(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&dv(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var f=l.transferSize,p=l.initiatorType;f&&dv(p)&&(l=l.responseEnd,r+=f*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var im=null,sm=null;function ju(e){return e.nodeType===9?e:e.ownerDocument}function pv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function iS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function am(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var mp=null;function qE(){var e=window.event;return e&&e.type==="popstate"?e===mp?!1:(mp=e,!0):(mp=null,!1)}var sS=typeof setTimeout=="function"?setTimeout:void 0,YE=typeof clearTimeout=="function"?clearTimeout:void 0,mv=typeof Promise=="function"?Promise:void 0,ZE=typeof queueMicrotask=="function"?queueMicrotask:typeof mv<"u"?function(e){return mv.resolve(null).then(e).catch(JE)}:sS;function JE(e){setTimeout(function(){throw e})}function _a(e){return e==="head"}function gv(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),po(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Rl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Rl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[Zl]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&Rl(e.ownerDocument.body);n=s}while(n);po(t)}function _v(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function rm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":rm(n),_m(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function KE(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Zl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=Ei(e.nextSibling),e===null)break}return null}function QE(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ei(e.nextSibling),e===null))return null;return e}function aS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ei(e.nextSibling),e===null))return null;return e}function om(e){return e.data==="$?"||e.data==="$~"}function lm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function jE(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Ei(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var cm=null;function vv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Ei(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function yv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function rS(e,t,n){switch(t=ju(n),e){case"html":if(e=t.documentElement,!e)throw Error(et(452));return e;case"head":if(e=t.head,!e)throw Error(et(453));return e;case"body":if(e=t.body,!e)throw Error(et(454));return e;default:throw Error(et(451))}}function Rl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);_m(e)}var Ti=new Map,xv=new Set;function $u(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ls=ve.d;ve.d={f:$E,r:tT,D:eT,C:nT,L:iT,m:sT,X:rT,S:aT,M:oT};function $E(){var e=Ls.f(),t=gh();return e||t}function tT(e){var t=go(e);t!==null&&t.tag===5&&t.type==="form"?$y(t):Ls.r(e)}var xo=typeof document>"u"?null:document;function oS(e,t,n){var i=xo;if(i&&typeof t=="string"&&t){var s=xi(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),xv.has(s)||(xv.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),Mn(t,"link",e),pn(t),i.head.appendChild(t)))}}function eT(e){Ls.D(e),oS("dns-prefetch",e,null)}function nT(e,t){Ls.C(e,t),oS("preconnect",e,t)}function iT(e,t,n){Ls.L(e,t,n);var i=xo;if(i&&e&&t){var s='link[rel="preload"][as="'+xi(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+xi(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+xi(n.imageSizes)+'"]')):s+='[href="'+xi(e)+'"]';var a=s;switch(t){case"style":a=fo(e);break;case"script":a=So(e)}Ti.has(a)||(e=Be({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ti.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(tc(a))||t==="script"&&i.querySelector(ec(a))||(t=i.createElement("link"),Mn(t,"link",e),pn(t),i.head.appendChild(t)))}}function sT(e,t){Ls.m(e,t);var n=xo;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+xi(i)+'"][href="'+xi(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=So(e)}if(!Ti.has(a)&&(e=Be({rel:"modulepreload",href:e},t),Ti.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(ec(a)))return}i=n.createElement("link"),Mn(i,"link",e),pn(i),n.head.appendChild(i)}}}function aT(e,t,n){Ls.S(e,t,n);var i=xo;if(i&&e){var s=Kr(i).hoistableStyles,a=fo(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(tc(a)))o.loading=5;else{e=Be({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ti.get(a))&&ng(e,n);var l=r=i.createElement("link");pn(l),Mn(l,"link",e),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,Tu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function rT(e,t){Ls.X(e,t);var n=xo;if(n&&e){var i=Kr(n).hoistableScripts,s=So(e),a=i.get(s);a||(a=n.querySelector(ec(s)),a||(e=Be({src:e,async:!0},t),(t=Ti.get(s))&&ig(e,t),a=n.createElement("script"),pn(a),Mn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function oT(e,t){Ls.M(e,t);var n=xo;if(n&&e){var i=Kr(n).hoistableScripts,s=So(e),a=i.get(s);a||(a=n.querySelector(ec(s)),a||(e=Be({src:e,async:!0,type:"module"},t),(t=Ti.get(s))&&ig(e,t),a=n.createElement("script"),pn(a),Mn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function Sv(e,t,n,i){var s=(s=ia.current)?$u(s):null;if(!s)throw Error(et(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=fo(n.href),n=Kr(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=fo(n.href);var a=Kr(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(tc(e)))&&!a._p&&(r.instance=a,r.state.loading=5),Ti.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ti.set(e,n),a||lT(s,e,n,r.state))),t&&i===null)throw Error(et(528,""));return r}if(t&&i!==null)throw Error(et(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=So(n),n=Kr(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(et(444,e))}}function fo(e){return'href="'+xi(e)+'"'}function tc(e){return'link[rel="stylesheet"]['+e+"]"}function lS(e){return Be({},e,{"data-precedence":e.precedence,precedence:null})}function lT(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),Mn(t,"link",n),pn(t),e.head.appendChild(t))}function So(e){return'[src="'+xi(e)+'"]'}function ec(e){return"script[async]"+e}function Mv(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+xi(n.href)+'"]');if(i)return t.instance=i,pn(i),i;var s=Be({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),pn(i),Mn(i,"style",s),Tu(i,n.precedence,e),t.instance=i;case"stylesheet":s=fo(n.href);var a=e.querySelector(tc(s));if(a)return t.state.loading|=4,t.instance=a,pn(a),a;i=lS(n),(s=Ti.get(s))&&ng(i,s),a=(e.ownerDocument||e).createElement("link"),pn(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),Mn(a,"link",i),t.state.loading|=4,Tu(a,n.precedence,e),t.instance=a;case"script":return a=So(n.src),(s=e.querySelector(ec(a)))?(t.instance=s,pn(s),s):(i=n,(s=Ti.get(a))&&(i=Be({},n),ig(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),pn(s),Mn(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error(et(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Tu(i,n.precedence,e));return t.instance}function Tu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function ng(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function ig(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Au=null;function bv(e,t,n){if(Au===null){var i=new Map,s=Au=new Map;s.set(n,i)}else s=Au,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[Zl]||a[yn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function Ev(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function cT(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function cS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function uT(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=fo(i.href),a=t.querySelector(tc(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=th.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,pn(a);return}a=t.ownerDocument||t,i=lS(i),(s=Ti.get(s))&&ng(i,s),a=a.createElement("link"),pn(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),Mn(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=th.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var gp=0;function hT(e,t){return e.stylesheets&&e.count===0&&wu(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&wu(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&gp===0&&(gp=62500*XE());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&wu(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>gp?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function th(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)wu(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var eh=null;function wu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,eh=new Map,t.forEach(fT,e),eh=null,th.call(e))}function fT(e,t){if(!(t.state.loading&4)){var n=eh.get(e);if(n)var i=n.get(null);else{n=new Map,eh.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=th.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var Vl={$$typeof:Ss,Provider:null,Consumer:null,_currentValue:Ya,_currentValue2:Ya,_threadCount:0};function dT(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Gd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Gd(0),this.hiddenUpdates=Gd(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function uS(e,t,n,i,s,a,r,o,l,c,f,p){return e=new dT(e,t,n,r,l,c,f,p,o),t=1,a===!0&&(t|=24),a=ei(3,null,null,t),e.current=a,a.stateNode=e,t=Rm(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},Lm(a),e}function hS(e){return e?(e=qr,e):qr}function fS(e,t,n,i,s,a){s=hS(s),i.context===null?i.context=s:i.pendingContext=s,i=aa(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=ra(e,i,t),n!==null&&(Wn(n,e,t),Sl(n,e,t))}function Tv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function sg(e,t){Tv(e,t),(e=e.alternate)&&Tv(e,t)}function dS(e){if(e.tag===13||e.tag===31){var t=rr(e,67108864);t!==null&&Wn(t,e,67108864),sg(e,67108864)}}function Av(e){if(e.tag===13||e.tag===31){var t=ri();t=mm(t);var n=rr(e,t);n!==null&&Wn(n,e,t),sg(e,t)}}var nh=!0;function pT(e,t,n,i){var s=Ot.T;Ot.T=null;var a=ve.p;try{ve.p=2,ag(e,t,n,i)}finally{ve.p=a,Ot.T=s}}function mT(e,t,n,i){var s=Ot.T;Ot.T=null;var a=ve.p;try{ve.p=8,ag(e,t,n,i)}finally{ve.p=a,Ot.T=s}}function ag(e,t,n,i){if(nh){var s=um(i);if(s===null)pp(e,t,i,ih,n),wv(e,i);else if(_T(s,e,t,n,i))i.stopPropagation();else if(wv(e,i),t&4&&-1<gT.indexOf(e)){for(;s!==null;){var a=go(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=Wa(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-ai(r);o.entanglements[1]|=l,r&=~l}ts(a),(_e&6)===0&&(qu=ii()+500,$l(0,!1))}}break;case 31:case 13:o=rr(a,2),o!==null&&Wn(o,a,2),gh(),sg(a,2)}if(a=um(i),a===null&&pp(e,t,i,ih,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else pp(e,t,i,null,n)}}function um(e){return e=ym(e),rg(e)}var ih=null;function rg(e){if(ih=null,e=Hr(e),e!==null){var t=Wl(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=Nv(t),e!==null)return e;e=null}else if(n===31){if(e=Iv(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return ih=e,null}function pS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(i1()){case zv:return 2;case Fv:return 8;case Lu:case s1:return 32;case Hv:return 268435456;default:return 32}default:return 32}}var hm=!1,ca=null,ua=null,ha=null,Gl=new Map,kl=new Map,Qs=[],gT="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function wv(e,t){switch(e){case"focusin":case"focusout":ca=null;break;case"dragenter":case"dragleave":ua=null;break;case"mouseover":case"mouseout":ha=null;break;case"pointerover":case"pointerout":Gl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":kl.delete(t.pointerId)}}function ul(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=go(t),t!==null&&dS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function _T(e,t,n,i,s){switch(t){case"focusin":return ca=ul(ca,e,t,n,i,s),!0;case"dragenter":return ua=ul(ua,e,t,n,i,s),!0;case"mouseover":return ha=ul(ha,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return Gl.set(a,ul(Gl.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,kl.set(a,ul(kl.get(a)||null,e,t,n,i,s)),!0}return!1}function mS(e){var t=Hr(e.target);if(t!==null){var n=Wl(t);if(n!==null){if(t=n.tag,t===13){if(t=Nv(n),t!==null){e.blockedOn=t,u_(e.priority,function(){Av(n)});return}}else if(t===31){if(t=Iv(n),t!==null){e.blockedOn=t,u_(e.priority,function(){Av(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Cu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=um(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);Rp=i,n.target.dispatchEvent(i),Rp=null}else return t=go(n),t!==null&&dS(t),e.blockedOn=n,!1;t.shift()}return!0}function Cv(e,t,n){Cu(e)&&n.delete(t)}function vT(){hm=!1,ca!==null&&Cu(ca)&&(ca=null),ua!==null&&Cu(ua)&&(ua=null),ha!==null&&Cu(ha)&&(ha=null),Gl.forEach(Cv),kl.forEach(Cv)}function fu(e,t){e.blockedOn===t&&(e.blockedOn=null,hm||(hm=!0,cn.unstable_scheduleCallback(cn.unstable_NormalPriority,vT)))}var du=null;function Rv(e){du!==e&&(du=e,cn.unstable_scheduleCallback(cn.unstable_NormalPriority,function(){du===e&&(du=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(rg(i||n)===null)continue;break}var a=go(n);a!==null&&(e.splice(t,3),t-=3,Xp(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function po(e){function t(l){return fu(l,e)}ca!==null&&fu(ca,e),ua!==null&&fu(ua,e),ha!==null&&fu(ha,e),Gl.forEach(t),kl.forEach(t);for(var n=0;n<Qs.length;n++){var i=Qs[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Qs.length&&(n=Qs[0],n.blockedOn===null);)mS(n),n.blockedOn===null&&Qs.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[Xn]||null;if(typeof a=="function")r||Rv(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[Xn]||null)o=r.formAction;else if(rg(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),Rv(n)}}}function gS(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function og(e){this._internalRoot=e}yh.prototype.render=og.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(et(409));var n=t.current,i=ri();fS(n,i,e,t,null,null)};yh.prototype.unmount=og.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;fS(e.current,2,null,e,null,null),gh(),t[mo]=null}};function yh(e){this._internalRoot=e}yh.prototype.unstable_scheduleHydration=function(e){if(e){var t=Xv();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Qs.length&&t!==0&&t<Qs[n].priority;n++);Qs.splice(n,0,e),n===0&&mS(e)}};var Dv=Uv.version;if(Dv!=="19.2.0")throw Error(et(527,Dv,"19.2.0"));ve.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(et(188)):(e=Object.keys(e).join(","),Error(et(268,e)));return e=Kb(t),e=e!==null?Ov(e):null,e=e===null?null:e.stateNode,e};var yT={bundleType:0,version:"19.2.0",rendererPackageName:"react-dom",currentDispatcherRef:Ot,reconcilerVersion:"19.2.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(hl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!hl.isDisabled&&hl.supportsFiber))try{Xl=hl.inject(yT),si=hl}catch{}var hl;xh.createRoot=function(e,t){if(!Lv(e))throw Error(et(299));var n=!1,i="",s=ox,a=lx,r=cx;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=uS(e,1,!1,null,null,n,i,null,s,a,r,gS),e[mo]=t.current,eg(e),new og(t)};xh.hydrateRoot=function(e,t,n){if(!Lv(e))throw Error(et(299));var i=!1,s="",a=ox,r=lx,o=cx,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=uS(e,1,!0,t,n??null,i,s,l,a,r,o,gS),t.context=hS(null),n=t.current,i=ri(),i=mm(i),s=aa(i),s.callback=null,ra(n,s,i),n=i,t.current.lanes=n,Yl(t,n),ts(t),e[mo]=t.current,eg(e),new yh(t)};xh.version="19.2.0"});var xS=qi((T2,yS)=>{"use strict";function vS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(vS)}catch(e){console.error(e)}}vS(),yS.exports=_S()});var hb=qi(gd=>{"use strict";var e2=Symbol.for("react.transitional.element"),n2=Symbol.for("react.fragment");function ub(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:e2,type:e,key:i,ref:t!==void 0?t:null,props:n}}gd.Fragment=n2;gd.jsx=ub;gd.jsxs=ub});var Sr=qi((cN,fb)=>{"use strict";fb.exports=hb()});var Er=Yi(Dr()),xb=Yi(xS());var Ce=Yi(Dr(),1),xT=(e,t,n,i,s,a,r,o)=>{let l=document.documentElement,c=["light","dark"];function f(d){(Array.isArray(e)?e:[e]).forEach(v=>{let E=v==="class",m=E&&a?s.map(h=>a[h]||h):s;E?(l.classList.remove(...m),l.classList.add(a&&a[d]?a[d]:d)):l.setAttribute(v,d)}),p(d)}function p(d){o&&c.includes(d)&&(l.style.colorScheme=d)}function u(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)f(i);else try{let d=localStorage.getItem(t)||n,v=r&&d==="system"?u():d;f(v)}catch{}},SS=["light","dark"],MS="(prefers-color-scheme: dark)",ST=typeof window>"u",cg=Ce.createContext(void 0),MT={setTheme:e=>{},themes:[]},bS=()=>{var e;return(e=Ce.useContext(cg))!=null?e:MT},ES=e=>Ce.useContext(cg)?Ce.createElement(Ce.Fragment,null,e.children):Ce.createElement(ET,{...e}),bT=["light","dark"],ET=({forcedTheme:e,disableTransitionOnChange:t=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:s="theme",themes:a=bT,defaultTheme:r=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:f,scriptProps:p})=>{let[u,d]=Ce.useState(()=>AT(s,r)),[v,E]=Ce.useState(()=>u==="system"?lg():u),m=l?Object.values(l):a,h=Ce.useCallback(b=>{let T=b;if(!T)return;b==="system"&&n&&(T=lg());let w=l?l[T]:T,x=t?wT(f):null,A=document.documentElement,R=I=>{I==="class"?(A.classList.remove(...m),w&&A.classList.add(w)):I.startsWith("data-")&&(w?A.setAttribute(I,w):A.removeAttribute(I))};if(Array.isArray(o)?o.forEach(R):R(o),i){let I=SS.includes(r)?r:null,z=SS.includes(T)?T:I;A.style.colorScheme=z}x?.()},[f]),g=Ce.useCallback(b=>{let T=typeof b=="function"?b(u):b;d(T);try{localStorage.setItem(s,T)}catch{}},[u]),M=Ce.useCallback(b=>{let T=lg(b);E(T),u==="system"&&n&&!e&&h("system")},[u,e]);Ce.useEffect(()=>{let b=window.matchMedia(MS);return b.addListener(M),M(b),()=>b.removeListener(M)},[M]),Ce.useEffect(()=>{let b=T=>{T.key===s&&(T.newValue?d(T.newValue):g(r))};return window.addEventListener("storage",b),()=>window.removeEventListener("storage",b)},[g]),Ce.useEffect(()=>{h(e??u)},[e,u]);let y=Ce.useMemo(()=>({theme:u,setTheme:g,forcedTheme:e,resolvedTheme:u==="system"?v:u,themes:n?[...a,"system"]:a,systemTheme:n?v:void 0}),[u,g,e,v,n,a]);return Ce.createElement(cg.Provider,{value:y},Ce.createElement(TT,{forcedTheme:e,storageKey:s,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:r,value:l,themes:a,nonce:f,scriptProps:p}),c)},TT=Ce.memo(({forcedTheme:e,storageKey:t,attribute:n,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:r,themes:o,nonce:l,scriptProps:c})=>{let f=JSON.stringify([n,t,a,e,o,r,i,s]).slice(1,-1);return Ce.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${xT.toString()})(${f})`}})}),AT=(e,t)=>{if(ST)return;let n;try{n=localStorage.getItem(e)||void 0}catch{}return n||t},wT=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},lg=e=>(e||(e=window.matchMedia(MS)),e.matches?"dark":"light");var br={};wb(br,{default:()=>xd});var Mr=Yi(Dr());var ZS=0,Vg=1,JS=2;var Dc=1,KS=2,Na=3,Ia=0,Tn=1,ls=2,cs=0,Xo=1,Gg=2,kg=3,Wg=4,QS=5;var _r=100,jS=101,$S=102,tM=103,eM=104,nM=200,iM=201,sM=202,aM=203,Xg=204,qg=205,rM=206,oM=207,lM=208,cM=209,uM=210,hM=211,fM=212,dM=213,pM=214,kh=0,Wh=1,Xh=2,Bo=3,qh=4,Yh=5,Zh=6,Jh=7,xf=0,mM=1,gM=2,Vi=0,Yg=1,Zg=2,Jg=3,Uc=4,Kg=5,Qg=6,jg=7;var $g=300,Oa=301,vr=302,Sf=303,Mf=304,Lc=306,Kh=1e3,ns=1001,Qh=1002,_n=1003,_M=1004;var Nc=1005;var bn=1006,bf=1007;var Pa=1008;var Kn=1009,t0=1010,e0=1011,qo=1012,Ef=1013,Gi=1014,Ci=1015,ki=1016,Tf=1017,Af=1018,Yo=1020,n0=35902,i0=35899,s0=1021,a0=1022,Ri=1023,is=1026,Ba=1027,wf=1028,Cf=1029,za=1030,Rf=1031;var Df=1033,Ic=33776,Oc=33777,Pc=33778,Bc=33779,Uf=35840,Lf=35841,Nf=35842,If=35843,Of=36196,Pf=37492,Bf=37496,zf=37488,Ff=37489,zc=37490,Hf=37491,Vf=37808,Gf=37809,kf=37810,Wf=37811,Xf=37812,qf=37813,Yf=37814,Zf=37815,Jf=37816,Kf=37817,Qf=37818,jf=37819,$f=37820,td=37821,ed=36492,nd=36494,id=36495,sd=36283,ad=36284,Fc=36285,rd=36286;var cc=2300,jh=2301,Vh=2302,Ng=2303,Ig=2400,Og=2401,Pg=2402;var vM=3200,r0=3201;var Hc=0,yM=1,Fs="",Pn="srgb",uc="srgb-linear",hc="linear",Se="srgb";var Gh=7680;var xM=519,SM=512,MM=513,bM=514,od=515,EM=516,TM=517,ld=518,AM=519,wM=35044;var o0="300 es",Fi=2e3,zo=2001;function CT(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function RT(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function fc(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function CM(){let e=fc("canvas");return e.style.display="block",e}var TS={},Fo=null;function l0(...e){let t="THREE."+e.shift();Fo?Fo("log",t,...e):console.log(t,...e)}function RM(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function It(...e){e=RM(e);let t="THREE."+e.shift();if(Fo)Fo("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Pt(...e){e=RM(e);let t="THREE."+e.shift();if(Fo)Fo("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function dr(...e){let t=e.join(" ");t in TS||(TS[t]=!0,It(...e))}function DM(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var UM={[kh]:Wh,[Xh]:Zh,[qh]:Jh,[Bo]:Yh,[Wh]:kh,[Zh]:Xh,[Jh]:qh,[Yh]:Bo},ss=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},Rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ug=Math.PI/180,$h=180/Math.PI;function Vc(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Rn[e&255]+Rn[e>>8&255]+Rn[e>>16&255]+Rn[e>>24&255]+"-"+Rn[t&255]+Rn[t>>8&255]+"-"+Rn[t>>16&15|64]+Rn[t>>24&255]+"-"+Rn[n&63|128]+Rn[n>>8&255]+"-"+Rn[n>>16&255]+Rn[n>>24&255]+Rn[i&255]+Rn[i>>8&255]+Rn[i>>16&255]+Rn[i>>24&255]).toLowerCase()}function ae(e,t,n){return Math.max(t,Math.min(n,e))}function DT(e,t){return(e%t+t)%t}function hg(e,t,n){return(1-n)*e+n*t}function nc(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Yn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var $t=class e{static{e.prototype.isVector2=!0}constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=ae(this.x,t.x,n.x),this.y=ae(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=ae(this.x,t,n),this.y=ae(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ae(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ae(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},wi=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],f=i[s+2],p=i[s+3],u=a[r+0],d=a[r+1],v=a[r+2],E=a[r+3];if(p!==E||l!==u||c!==d||f!==v){let m=l*u+c*d+f*v+p*E;m<0&&(u=-u,d=-d,v=-v,E=-E,m=-m);let h=1-o;if(m<.9995){let g=Math.acos(m),M=Math.sin(g);h=Math.sin(h*g)/M,o=Math.sin(o*g)/M,l=l*h+u*o,c=c*h+d*o,f=f*h+v*o,p=p*h+E*o}else{l=l*h+u*o,c=c*h+d*o,f=f*h+v*o,p=p*h+E*o;let g=1/Math.sqrt(l*l+c*c+f*f+p*p);l*=g,c*=g,f*=g,p*=g}}t[n]=l,t[n+1]=c,t[n+2]=f,t[n+3]=p}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],f=i[s+3],p=a[r],u=a[r+1],d=a[r+2],v=a[r+3];return t[n]=o*v+f*p+l*d-c*u,t[n+1]=l*v+f*u+c*p-o*d,t[n+2]=c*v+f*d+o*u-l*p,t[n+3]=f*v-o*p-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),f=o(s/2),p=o(a/2),u=l(i/2),d=l(s/2),v=l(a/2);switch(r){case"XYZ":this._x=u*f*p+c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p-u*d*v;break;case"YXZ":this._x=u*f*p+c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p+u*d*v;break;case"ZXY":this._x=u*f*p-c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p-u*d*v;break;case"ZYX":this._x=u*f*p-c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p+u*d*v;break;case"YZX":this._x=u*f*p+c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p-u*d*v;break;case"XZY":this._x=u*f*p-c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p+u*d*v;break;default:It("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],f=n[6],p=n[10],u=i+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(i>o&&i>p){let d=2*Math.sqrt(1+i-o-p);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-i-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+p-i-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ae(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,f=n._w;return this._x=i*f+r*o+s*c-a*l,this._y=s*f+r*l+a*o-i*c,this._z=a*f+r*c+i*l-s*o,this._w=r*f-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,n=Math.sin(n*c)/f,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},H=class e{static{e.prototype.isVector3=!0}constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(AS.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(AS.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),f=2*(o*n-a*s),p=2*(a*i-r*n);return this.x=n+l*c+r*p-o*f,this.y=i+l*f+o*c-a*p,this.z=s+l*p+a*f-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=ae(this.x,t.x,n.x),this.y=ae(this.y,t.y,n.y),this.z=ae(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=ae(this.x,t,n),this.y=ae(this.y,t,n),this.z=ae(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ae(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return fg.copy(this).projectOnVector(t),this.sub(fg)}reflect(t){return this.sub(fg.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ae(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},fg=new H,AS=new wi,kt=class e{static{e.prototype.isMatrix3=!0}constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let f=this.elements;return f[0]=t,f[1]=s,f[2]=o,f[3]=n,f[4]=a,f[5]=l,f[6]=i,f[7]=r,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],f=i[4],p=i[7],u=i[2],d=i[5],v=i[8],E=s[0],m=s[3],h=s[6],g=s[1],M=s[4],y=s[7],b=s[2],T=s[5],w=s[8];return a[0]=r*E+o*g+l*b,a[3]=r*m+o*M+l*T,a[6]=r*h+o*y+l*w,a[1]=c*E+f*g+p*b,a[4]=c*m+f*M+p*T,a[7]=c*h+f*y+p*w,a[2]=u*E+d*g+v*b,a[5]=u*m+d*M+v*T,a[8]=u*h+d*y+v*w,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8];return n*r*f-n*o*c-i*a*f+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=f*r-o*c,u=o*l-f*a,d=c*a-r*l,v=n*p+i*u+s*d;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);let E=1/v;return t[0]=p*E,t[1]=(s*c-f*i)*E,t[2]=(o*i-s*r)*E,t[3]=u*E,t[4]=(f*n-s*l)*E,t[5]=(s*a-o*n)*E,t[6]=d*E,t[7]=(i*l-c*n)*E,t[8]=(r*n-i*a)*E,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return dr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(dg.makeScale(t,n)),this}rotate(t){return dr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(dg.makeRotation(-t)),this}translate(t,n){return dr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(dg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},dg=new kt,wS=new kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),CS=new kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function UT(){let e={enabled:!0,workingColorSpace:uc,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===Se&&(s.r=zs(s.r),s.g=zs(s.g),s.b=zs(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===Se&&(s.r=Po(s.r),s.g=Po(s.g),s.b=Po(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Fs?hc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return dr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return dr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[uc]:{primaries:t,whitePoint:i,transfer:hc,toXYZ:wS,fromXYZ:CS,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Pn},outputColorSpaceConfig:{drawingBufferColorSpace:Pn}},[Pn]:{primaries:t,whitePoint:i,transfer:Se,toXYZ:wS,fromXYZ:CS,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Pn}}}),e}var se=UT();function zs(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Po(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Mo,tf=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Mo===void 0&&(Mo=fc("canvas")),Mo.width=t.width,Mo.height=t.height;let s=Mo.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Mo}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let n=fc("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=zs(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(zs(n[i]/255)*255):n[i]=zs(n[i]);return{data:n,width:t.width,height:t.height}}else return It("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},LT=0,Ho=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:LT++}),this.uuid=Vc(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(pg(s[r].image)):a.push(pg(s[r]))}else a=pg(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function pg(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?tf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(It("Texture: Unable to serialize Texture."),{})}var NT=0,mg=new H,Zn=class e extends ss{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=ns,s=ns,a=bn,r=Pa,o=Ri,l=Kn,c=e.DEFAULT_ANISOTROPY,f=Fs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:NT++}),this.uuid=Vc(),this.name="",this.source=new Ho(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new $t(0,0),this.repeat=new $t(1,1),this.center=new $t(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(mg).x}get height(){return this.source.getSize(mg).y}get depth(){return this.source.getSize(mg).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){It(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==$g)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Kh:t.x=t.x-Math.floor(t.x);break;case ns:t.x=t.x<0?0:1;break;case Qh:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Kh:t.y=t.y-Math.floor(t.y);break;case ns:t.y=t.y<0?0:1;break;case Qh:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Zn.DEFAULT_IMAGE=null;Zn.DEFAULT_MAPPING=$g;Zn.DEFAULT_ANISOTROPY=1;var We=class e{static{e.prototype.isVector4=!0}constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],f=l[4],p=l[8],u=l[1],d=l[5],v=l[9],E=l[2],m=l[6],h=l[10];if(Math.abs(f-u)<.01&&Math.abs(p-E)<.01&&Math.abs(v-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(p+E)<.1&&Math.abs(v+m)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let M=(c+1)/2,y=(d+1)/2,b=(h+1)/2,T=(f+u)/4,w=(p+E)/4,x=(v+m)/4;return M>y&&M>b?M<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(M),s=T/i,a=w/i):y>b?y<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),i=T/s,a=x/s):b<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(b),i=w/a,s=x/a),this.set(i,s,a,n),this}let g=Math.sqrt((m-v)*(m-v)+(p-E)*(p-E)+(u-f)*(u-f));return Math.abs(g)<.001&&(g=1),this.x=(m-v)/g,this.y=(p-E)/g,this.z=(u-f)/g,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=ae(this.x,t.x,n.x),this.y=ae(this.y,t.y,n.y),this.z=ae(this.z,t.z,n.z),this.w=ae(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=ae(this.x,t,n),this.y=ae(this.y,t,n),this.z=ae(this.z,t,n),this.w=ae(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ae(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ef=class extends ss{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new We(0,0,t,n),this.scissorTest=!1,this.viewport=new We(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Zn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:bn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new Ho(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let n=t.depthTexture.clone();n.renderTarget=null,this.depthTexture=n}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jn=class extends ef{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},dc=class extends Zn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var nf=class extends Zn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Re=class e{static{e.prototype.isMatrix4=!0}constructor(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m)}set(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m){let h=this.elements;return h[0]=t,h[4]=n,h[8]=i,h[12]=s,h[1]=a,h[5]=r,h[9]=o,h[13]=l,h[2]=c,h[6]=f,h[10]=p,h[14]=u,h[3]=d,h[7]=v,h[11]=E,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/bo.setFromMatrixColumn(t,0).length(),a=1/bo.setFromMatrixColumn(t,1).length(),r=1/bo.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),f=Math.cos(a),p=Math.sin(a);if(t.order==="XYZ"){let u=r*f,d=r*p,v=o*f,E=o*p;n[0]=l*f,n[4]=-l*p,n[8]=c,n[1]=d+v*c,n[5]=u-E*c,n[9]=-o*l,n[2]=E-u*c,n[6]=v+d*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*f,d=l*p,v=c*f,E=c*p;n[0]=u+E*o,n[4]=v*o-d,n[8]=r*c,n[1]=r*p,n[5]=r*f,n[9]=-o,n[2]=d*o-v,n[6]=E+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*f,d=l*p,v=c*f,E=c*p;n[0]=u-E*o,n[4]=-r*p,n[8]=v+d*o,n[1]=d+v*o,n[5]=r*f,n[9]=E-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*f,d=r*p,v=o*f,E=o*p;n[0]=l*f,n[4]=v*c-d,n[8]=u*c+E,n[1]=l*p,n[5]=E*c+u,n[9]=d*c-v,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,d=r*c,v=o*l,E=o*c;n[0]=l*f,n[4]=E-u*p,n[8]=v*p+d,n[1]=p,n[5]=r*f,n[9]=-o*f,n[2]=-c*f,n[6]=d*p+v,n[10]=u-E*p}else if(t.order==="XZY"){let u=r*l,d=r*c,v=o*l,E=o*c;n[0]=l*f,n[4]=-p,n[8]=c*f,n[1]=u*p+E,n[5]=r*f,n[9]=d*p-v,n[2]=v*p-d,n[6]=o*f,n[10]=E*p+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(IT,t,OT)}lookAt(t,n,i){let s=this.elements;return ci.subVectors(t,n),ci.lengthSq()===0&&(ci.z=1),ci.normalize(),va.crossVectors(i,ci),va.lengthSq()===0&&(Math.abs(i.z)===1?ci.x+=1e-4:ci.z+=1e-4,ci.normalize(),va.crossVectors(i,ci)),va.normalize(),Sh.crossVectors(ci,va),s[0]=va.x,s[4]=Sh.x,s[8]=ci.x,s[1]=va.y,s[5]=Sh.y,s[9]=ci.y,s[2]=va.z,s[6]=Sh.z,s[10]=ci.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],f=i[1],p=i[5],u=i[9],d=i[13],v=i[2],E=i[6],m=i[10],h=i[14],g=i[3],M=i[7],y=i[11],b=i[15],T=s[0],w=s[4],x=s[8],A=s[12],R=s[1],I=s[5],z=s[9],G=s[13],O=s[2],k=s[6],Q=s[10],Z=s[14],nt=s[3],W=s[7],K=s[11],st=s[15];return a[0]=r*T+o*R+l*O+c*nt,a[4]=r*w+o*I+l*k+c*W,a[8]=r*x+o*z+l*Q+c*K,a[12]=r*A+o*G+l*Z+c*st,a[1]=f*T+p*R+u*O+d*nt,a[5]=f*w+p*I+u*k+d*W,a[9]=f*x+p*z+u*Q+d*K,a[13]=f*A+p*G+u*Z+d*st,a[2]=v*T+E*R+m*O+h*nt,a[6]=v*w+E*I+m*k+h*W,a[10]=v*x+E*z+m*Q+h*K,a[14]=v*A+E*G+m*Z+h*st,a[3]=g*T+M*R+y*O+b*nt,a[7]=g*w+M*I+y*k+b*W,a[11]=g*x+M*z+y*Q+b*K,a[15]=g*A+M*G+y*Z+b*st,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],f=t[2],p=t[6],u=t[10],d=t[14],v=t[3],E=t[7],m=t[11],h=t[15],g=l*d-c*u,M=o*d-c*p,y=o*u-l*p,b=r*d-c*f,T=r*u-l*f,w=r*p-o*f;return n*(E*g-m*M+h*y)-i*(v*g-m*b+h*T)+s*(v*M-E*b+h*w)-a*(v*y-E*T+m*w)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],f=t[10];return n*(r*f-o*c)-i*(a*f-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=t[9],u=t[10],d=t[11],v=t[12],E=t[13],m=t[14],h=t[15],g=n*o-i*r,M=n*l-s*r,y=n*c-a*r,b=i*l-s*o,T=i*c-a*o,w=s*c-a*l,x=f*E-p*v,A=f*m-u*v,R=f*h-d*v,I=p*m-u*E,z=p*h-d*E,G=u*h-d*m,O=g*G-M*z+y*I+b*R-T*A+w*x;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/O;return t[0]=(o*G-l*z+c*I)*k,t[1]=(s*z-i*G-a*I)*k,t[2]=(E*w-m*T+h*b)*k,t[3]=(u*T-p*w-d*b)*k,t[4]=(l*R-r*G-c*A)*k,t[5]=(n*G-s*R+a*A)*k,t[6]=(m*y-v*w-h*M)*k,t[7]=(f*w-u*y+d*M)*k,t[8]=(r*z-o*R+c*x)*k,t[9]=(i*R-n*z-a*x)*k,t[10]=(v*T-E*y+h*g)*k,t[11]=(p*y-f*T-d*g)*k,t[12]=(o*A-r*I-l*x)*k,t[13]=(n*I-i*A+s*x)*k,t[14]=(E*M-v*b-m*g)*k,t[15]=(f*b-p*M+u*g)*k,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,f=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+i,f*l-s*r,0,c*l-s*o,f*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,f=r+r,p=o+o,u=a*c,d=a*f,v=a*p,E=r*f,m=r*p,h=o*p,g=l*c,M=l*f,y=l*p,b=i.x,T=i.y,w=i.z;return s[0]=(1-(E+h))*b,s[1]=(d+y)*b,s[2]=(v-M)*b,s[3]=0,s[4]=(d-y)*T,s[5]=(1-(u+h))*T,s[6]=(m+g)*T,s[7]=0,s[8]=(v+M)*w,s[9]=(m-g)*w,s[10]=(1-(u+E))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=bo.set(s[0],s[1],s[2]).length(),o=bo.set(s[4],s[5],s[6]).length(),l=bo.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Oi.copy(this);let c=1/r,f=1/o,p=1/l;return Oi.elements[0]*=c,Oi.elements[1]*=c,Oi.elements[2]*=c,Oi.elements[4]*=f,Oi.elements[5]*=f,Oi.elements[6]*=f,Oi.elements[8]*=p,Oi.elements[9]*=p,Oi.elements[10]*=p,n.setFromRotationMatrix(Oi),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Fi,l=!1){let c=this.elements,f=2*a/(n-t),p=2*a/(i-s),u=(n+t)/(n-t),d=(i+s)/(i-s),v,E;if(l)v=a/(r-a),E=r*a/(r-a);else if(o===Fi)v=-(r+a)/(r-a),E=-2*r*a/(r-a);else if(o===zo)v=-r/(r-a),E=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Fi,l=!1){let c=this.elements,f=2/(n-t),p=2/(i-s),u=-(n+t)/(n-t),d=-(i+s)/(i-s),v,E;if(l)v=1/(r-a),E=r/(r-a);else if(o===Fi)v=-2/(r-a),E=-(r+a)/(r-a);else if(o===zo)v=-1/(r-a),E=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},bo=new H,Oi=new Re,IT=new H(0,0,0),OT=new H(1,1,1),va=new H,Sh=new H,ci=new H,RS=new Re,DS=new wi,as=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],f=s[9],p=s[2],u=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(ae(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ae(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(ae(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ae(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(ae(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ae(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:It("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return RS.makeRotationFromQuaternion(t),this.setFromRotationMatrix(RS,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return DS.setFromEuler(this),this.setFromQuaternion(DS,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};as.DEFAULT_ORDER="XYZ";var pc=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},PT=0,US=new H,Eo=new wi,Ns=new Re,Mh=new H,ic=new H,BT=new H,zT=new wi,LS=new H(1,0,0),NS=new H(0,1,0),IS=new H(0,0,1),OS={type:"added"},FT={type:"removed"},To={type:"childadded",child:null},gg={type:"childremoved",child:null},En=class e extends ss{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:PT++}),this.uuid=Vc(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new H,n=new as,i=new wi,s=new H(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Re},normalMatrix:{value:new kt}}),this.matrix=new Re,this.matrixWorld=new Re,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return Eo.setFromAxisAngle(t,n),this.quaternion.multiply(Eo),this}rotateOnWorldAxis(t,n){return Eo.setFromAxisAngle(t,n),this.quaternion.premultiply(Eo),this}rotateX(t){return this.rotateOnAxis(LS,t)}rotateY(t){return this.rotateOnAxis(NS,t)}rotateZ(t){return this.rotateOnAxis(IS,t)}translateOnAxis(t,n){return US.copy(t).applyQuaternion(this.quaternion),this.position.add(US.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(LS,t)}translateY(t){return this.translateOnAxis(NS,t)}translateZ(t){return this.translateOnAxis(IS,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ns.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Mh.copy(t):Mh.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),ic.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ns.lookAt(ic,Mh,this.up):Ns.lookAt(Mh,ic,this.up),this.quaternion.setFromRotationMatrix(Ns),s&&(Ns.extractRotation(s.matrixWorld),Eo.setFromRotationMatrix(Ns),this.quaternion.premultiply(Eo.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Pt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(OS),To.child=t,this.dispatchEvent(To),To.child=null):Pt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(FT),gg.child=t,this.dispatchEvent(gg),gg.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ns.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ns.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ns),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(OS),To.child=t,this.dispatchEvent(To),To.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ic,t,BT),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ic,zT,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let p=l[c];a(t.shapes,p)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),f=r(t.images),p=r(t.shapes),u=r(t.skeletons),d=r(t.animations),v=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),p.length>0&&(i.shapes=p),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),v.length>0&&(i.nodes=v)}return i.object=s,i;function r(o){let l=[];for(let c in o){let f=o[c];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};En.DEFAULT_UP=new H(0,1,0);En.DEFAULT_MATRIX_AUTO_UPDATE=!0;En.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var fr=class extends En{constructor(){super(),this.isGroup=!0,this.type="Group"}},HT={type:"move"},Vo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let E of t.hand.values()){let m=n.getJointPose(E,i),h=this._getHandJoint(c,E);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}let f=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=f.position.distanceTo(p.position),d=.02,v=.005;c.inputState.pinching&&u>d+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(HT)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new fr;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},LM={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ya={h:0,s:0,l:0},bh={h:0,s:0,l:0};function _g(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Wt=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=Pn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,se.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=se.workingColorSpace){return this.r=t,this.g=n,this.b=i,se.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=se.workingColorSpace){if(t=DT(t,1),n=ae(n,0,1),i=ae(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=_g(r,a,t+1/3),this.g=_g(r,a,t),this.b=_g(r,a,t-1/3)}return se.colorSpaceToWorking(this,s),this}setStyle(t,n=Pn){function i(a){a!==void 0&&parseFloat(a)<1&&It("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:It("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);It("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=Pn){let i=LM[t.toLowerCase()];return i!==void 0?this.setHex(i,n):It("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=zs(t.r),this.g=zs(t.g),this.b=zs(t.b),this}copyLinearToSRGB(t){return this.r=Po(t.r),this.g=Po(t.g),this.b=Po(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Pn){return se.workingToColorSpace(Dn.copy(this),t),Math.round(ae(Dn.r*255,0,255))*65536+Math.round(ae(Dn.g*255,0,255))*256+Math.round(ae(Dn.b*255,0,255))}getHexString(t=Pn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=se.workingColorSpace){se.workingToColorSpace(Dn.copy(this),n);let i=Dn.r,s=Dn.g,a=Dn.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,f=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=f<=.5?p/(r+o):p/(2-r-o),r){case i:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-i)/p+2;break;case a:l=(i-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=f,t}getRGB(t,n=se.workingColorSpace){return se.workingToColorSpace(Dn.copy(this),n),t.r=Dn.r,t.g=Dn.g,t.b=Dn.b,t}getStyle(t=Pn){se.workingToColorSpace(Dn.copy(this),t);let n=Dn.r,i=Dn.g,s=Dn.b;return t!==Pn?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(ya),this.setHSL(ya.h+t,ya.s+n,ya.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(ya),t.getHSL(bh);let i=hg(ya.h,bh.h,n),s=hg(ya.s,bh.s,n),a=hg(ya.l,bh.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dn=new Wt;Wt.NAMES=LM;var pr=class extends En{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new as,this.environmentIntensity=1,this.environmentRotation=new as,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),n.object.backgroundBlurriness=this.backgroundBlurriness,n.object.backgroundIntensity=this.backgroundIntensity,n.object.backgroundRotation=this.backgroundRotation.toArray(),n.object.environmentIntensity=this.environmentIntensity,n.object.environmentRotation=this.environmentRotation.toArray(),n}},Pi=new H,Is=new H,vg=new H,Os=new H,Ao=new H,wo=new H,PS=new H,yg=new H,xg=new H,Sg=new H,Mg=new We,bg=new We,Eg=new We,ba=class e{constructor(t=new H,n=new H,i=new H){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),Pi.subVectors(t,n),s.cross(Pi);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){Pi.subVectors(s,n),Is.subVectors(i,n),vg.subVectors(t,n);let r=Pi.dot(Pi),o=Pi.dot(Is),l=Pi.dot(vg),c=Is.dot(Is),f=Is.dot(vg),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*f)*u,v=(r*f-o*l)*u;return a.set(1-d-v,v,d)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Os)===null?!1:Os.x>=0&&Os.y>=0&&Os.x+Os.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Os)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Os.x),l.addScaledVector(r,Os.y),l.addScaledVector(o,Os.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return Mg.setScalar(0),bg.setScalar(0),Eg.setScalar(0),Mg.fromBufferAttribute(t,n),bg.fromBufferAttribute(t,i),Eg.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Mg,a.x),r.addScaledVector(bg,a.y),r.addScaledVector(Eg,a.z),r}static isFrontFacing(t,n,i,s){return Pi.subVectors(i,n),Is.subVectors(t,n),Pi.cross(Is).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Pi.subVectors(this.c,this.b),Is.subVectors(this.a,this.b),Pi.cross(Is).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;Ao.subVectors(s,i),wo.subVectors(a,i),yg.subVectors(t,i);let l=Ao.dot(yg),c=wo.dot(yg);if(l<=0&&c<=0)return n.copy(i);xg.subVectors(t,s);let f=Ao.dot(xg),p=wo.dot(xg);if(f>=0&&p<=f)return n.copy(s);let u=l*p-f*c;if(u<=0&&l>=0&&f<=0)return r=l/(l-f),n.copy(i).addScaledVector(Ao,r);Sg.subVectors(t,a);let d=Ao.dot(Sg),v=wo.dot(Sg);if(v>=0&&d<=v)return n.copy(a);let E=d*c-l*v;if(E<=0&&c>=0&&v<=0)return o=c/(c-v),n.copy(i).addScaledVector(wo,o);let m=f*v-d*p;if(m<=0&&p-f>=0&&d-v>=0)return PS.subVectors(a,s),o=(p-f)/(p-f+(d-v)),n.copy(s).addScaledVector(PS,o);let h=1/(m+E+u);return r=E*h,o=u*h,n.copy(i).addScaledVector(Ao,r).addScaledVector(wo,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},rs=class{constructor(t=new H(1/0,1/0,1/0),n=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Bi.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Bi.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=Bi.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Bi):Bi.fromBufferAttribute(a,r),Bi.applyMatrix4(t.matrixWorld),this.expandByPoint(Bi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Eh.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Eh.copy(i.boundingBox)),Eh.applyMatrix4(t.matrixWorld),this.union(Eh)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Bi),Bi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(sc),Th.subVectors(this.max,sc),Co.subVectors(t.a,sc),Ro.subVectors(t.b,sc),Do.subVectors(t.c,sc),xa.subVectors(Ro,Co),Sa.subVectors(Do,Ro),lr.subVectors(Co,Do);let n=[0,-xa.z,xa.y,0,-Sa.z,Sa.y,0,-lr.z,lr.y,xa.z,0,-xa.x,Sa.z,0,-Sa.x,lr.z,0,-lr.x,-xa.y,xa.x,0,-Sa.y,Sa.x,0,-lr.y,lr.x,0];return!Tg(n,Co,Ro,Do,Th)||(n=[1,0,0,0,1,0,0,0,1],!Tg(n,Co,Ro,Do,Th))?!1:(Ah.crossVectors(xa,Sa),n=[Ah.x,Ah.y,Ah.z],Tg(n,Co,Ro,Do,Th))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Bi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Bi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ps[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ps[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ps[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ps[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ps[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ps[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ps[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ps[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ps),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ps=[new H,new H,new H,new H,new H,new H,new H,new H],Bi=new H,Eh=new rs,Co=new H,Ro=new H,Do=new H,xa=new H,Sa=new H,lr=new H,sc=new H,Th=new H,Ah=new H,cr=new H;function Tg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){cr.fromArray(e,a);let o=s.x*Math.abs(cr.x)+s.y*Math.abs(cr.y)+s.z*Math.abs(cr.z),l=t.dot(cr),c=n.dot(cr),f=i.dot(cr);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}var rn=new H,wh=new $t,VT=0,hi=class extends ss{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:VT++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=wM,this.updateRanges=[],this.gpuType=Ci,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)wh.fromBufferAttribute(this,n),wh.applyMatrix3(t),this.setXY(n,wh.x,wh.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyMatrix3(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyMatrix4(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyNormalMatrix(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.transformDirection(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=nc(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=Yn(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=nc(n,this.array)),n}setX(t,n){return this.normalized&&(n=Yn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=nc(n,this.array)),n}setY(t,n){return this.normalized&&(n=Yn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=nc(n,this.array)),n}setZ(t,n){return this.normalized&&(n=Yn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=nc(n,this.array)),n}setW(t,n){return this.normalized&&(n=Yn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=Yn(n,this.array),i=Yn(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=Yn(n,this.array),i=Yn(i,this.array),s=Yn(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=Yn(n,this.array),i=Yn(i,this.array),s=Yn(s,this.array),a=Yn(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var mc=class extends hi{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var gc=class extends hi{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var zn=class extends hi{constructor(t,n,i){super(new Float32Array(t),n,i)}},GT=new rs,ac=new H,Ag=new H,Ea=class{constructor(t=new H,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):GT.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ac.subVectors(t,this.center);let n=ac.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(ac,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ag.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ac.copy(t.center).add(Ag)),this.expandByPoint(ac.copy(t.center).sub(Ag))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},kT=0,Ai=new Re,wg=new En,Uo=new H,ui=new rs,rc=new rs,gn=new H,Hi=class e extends ss{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kT++}),this.uuid=Vc(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(CT(t)?gc:mc)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new kt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ai.makeRotationFromQuaternion(t),this.applyMatrix4(Ai),this}rotateX(t){return Ai.makeRotationX(t),this.applyMatrix4(Ai),this}rotateY(t){return Ai.makeRotationY(t),this.applyMatrix4(Ai),this}rotateZ(t){return Ai.makeRotationZ(t),this.applyMatrix4(Ai),this}translate(t,n,i){return Ai.makeTranslation(t,n,i),this.applyMatrix4(Ai),this}scale(t,n,i){return Ai.makeScale(t,n,i),this.applyMatrix4(Ai),this}lookAt(t){return wg.lookAt(t),wg.updateMatrix(),this.applyMatrix4(wg.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Uo).negate(),this.translate(Uo.x,Uo.y,Uo.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new zn(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&It("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rs);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Pt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];ui.setFromBufferAttribute(a),this.morphTargetsRelative?(gn.addVectors(this.boundingBox.min,ui.min),this.boundingBox.expandByPoint(gn),gn.addVectors(this.boundingBox.max,ui.max),this.boundingBox.expandByPoint(gn)):(this.boundingBox.expandByPoint(ui.min),this.boundingBox.expandByPoint(ui.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Pt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ea);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Pt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new H,1/0);return}if(t){let i=this.boundingSphere.center;if(ui.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];rc.setFromBufferAttribute(o),this.morphTargetsRelative?(gn.addVectors(ui.min,rc.min),ui.expandByPoint(gn),gn.addVectors(ui.max,rc.max),ui.expandByPoint(gn)):(ui.expandByPoint(rc.min),ui.expandByPoint(rc.max))}ui.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)gn.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(gn));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)gn.fromBufferAttribute(o,c),l&&(Uo.fromBufferAttribute(t,c),gn.add(Uo)),s=Math.max(s,i.distanceToSquared(gn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Pt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Pt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new hi(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new H,l[x]=new H;let c=new H,f=new H,p=new H,u=new $t,d=new $t,v=new $t,E=new H,m=new H;function h(x,A,R){c.fromBufferAttribute(i,x),f.fromBufferAttribute(i,A),p.fromBufferAttribute(i,R),u.fromBufferAttribute(a,x),d.fromBufferAttribute(a,A),v.fromBufferAttribute(a,R),f.sub(c),p.sub(c),d.sub(u),v.sub(u);let I=1/(d.x*v.y-v.x*d.y);isFinite(I)&&(E.copy(f).multiplyScalar(v.y).addScaledVector(p,-d.y).multiplyScalar(I),m.copy(p).multiplyScalar(d.x).addScaledVector(f,-v.x).multiplyScalar(I),o[x].add(E),o[A].add(E),o[R].add(E),l[x].add(m),l[A].add(m),l[R].add(m))}let g=this.groups;g.length===0&&(g=[{start:0,count:t.count}]);for(let x=0,A=g.length;x<A;++x){let R=g[x],I=R.start,z=R.count;for(let G=I,O=I+z;G<O;G+=3)h(t.getX(G+0),t.getX(G+1),t.getX(G+2))}let M=new H,y=new H,b=new H,T=new H;function w(x){b.fromBufferAttribute(s,x),T.copy(b);let A=o[x];M.copy(A),M.sub(b.multiplyScalar(b.dot(A))).normalize(),y.crossVectors(T,A);let I=y.dot(l[x])<0?-1:1;r.setXYZW(x,M.x,M.y,M.z,I)}for(let x=0,A=g.length;x<A;++x){let R=g[x],I=R.start,z=R.count;for(let G=I,O=I+z;G<O;G+=3)w(t.getX(G+0)),w(t.getX(G+1)),w(t.getX(G+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new hi(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new H,a=new H,r=new H,o=new H,l=new H,c=new H,f=new H,p=new H;if(t)for(let u=0,d=t.count;u<d;u+=3){let v=t.getX(u+0),E=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(n,v),a.fromBufferAttribute(n,E),r.fromBufferAttribute(n,m),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),o.fromBufferAttribute(i,v),l.fromBufferAttribute(i,E),c.fromBufferAttribute(i,m),o.add(f),l.add(f),c.add(f),i.setXYZ(v,o.x,o.y,o.z),i.setXYZ(E,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=n.count;u<d;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),i.setXYZ(u+0,f.x,f.y,f.z),i.setXYZ(u+1,f.x,f.y,f.z),i.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)gn.fromBufferAttribute(t,n),gn.normalize(),t.setXYZ(n,gn.x,gn.y,gn.z)}toNonIndexed(){function t(o,l){let c=o.array,f=o.itemSize,p=o.normalized,u=new c.constructor(l.length*f),d=0,v=0;for(let E=0,m=l.length;E<m;E++){o.isInterleavedBufferAttribute?d=l[E]*o.data.stride+o.offset:d=l[E]*f;for(let h=0;h<f;h++)u[v++]=c[d++]}return new hi(u,f,p)}if(this.index===null)return It("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let f=0,p=c.length;f<p;f++){let u=c[f],d=t(u,i);l.push(d)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];f.push(d.toJSON(t.data))}f.length>0&&(s[l]=f,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(n))}let a=t.morphAttributes;for(let c in a){let f=[],p=a[c];for(let u=0,d=p.length;u<d;u++)f.push(p[u].clone(n));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,f=r.length;c<f;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Cg=new H,WT=new H,XT=new kt,zi=class{constructor(t=new H(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=Cg.subVectors(i,n).cross(WT.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(Cg),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||XT.getNormalMatrix(t),s=this.coplanarPoint(Cg).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},qT=0,os=class extends ss{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qT++}),this.uuid=Vc(),this.name="",this.type="Material",this.blending=Xo,this.side=Ia,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xg,this.blendDst=qg,this.blendEquation=_r,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Wt(0,0,0),this.blendAlpha=0,this.depthFunc=Bo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xM,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Gh,this.stencilZFail=Gh,this.stencilZPass=Gh,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){It(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Wt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new zi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new $t().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new $t().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Bs=new H,Rg=new H,Ch=new H,Rh=new H,sf=class{constructor(t=new H,n=new H(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Bs)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=Bs.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(Bs.copy(this.origin).addScaledVector(this.direction,n),Bs.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){Rg.copy(t).add(n).multiplyScalar(.5),Ch.copy(n).sub(t).normalize(),Rh.copy(this.origin).sub(Rg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(Ch),o=Rh.dot(this.direction),l=-Rh.dot(Ch),c=Rh.lengthSq(),f=Math.abs(1-r*r),p,u,d,v;if(f>0)if(p=r*l-o,u=r*o-l,v=a*f,p>=0)if(u>=-v)if(u<=v){let E=1/f;p*=E,u*=E,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-v?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=v?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Rg).addScaledVector(Ch,u),d}intersectSphere(t,n){if(t.radius<0)return null;Bs.subVectors(t.center,this.origin);let i=Bs.dot(this.direction),s=Bs.dot(Bs)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),f>=0?(a=(t.min.y-u.y)*f,r=(t.max.y-u.y)*f):(a=(t.max.y-u.y)*f,r=(t.min.y-u.y)*f),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(t.min.z-u.z)*p,l=(t.max.z-u.z)*p):(o=(t.max.z-u.z)*p,l=(t.min.z-u.z)*p),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,Bs)!==null}intersectTriangle(t,n,i,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,f=o.z,p=t.x-r.x,u=t.y-r.y,d=t.z-r.z,v=n.x-r.x,E=n.y-r.y,m=n.z-r.z,h=i.x-r.x,g=i.y-r.y,M=i.z-r.z,y=Math.abs(l),b=Math.abs(c),T=Math.abs(f),w,x,A,R,I,z,G,O,k,Q,Z,nt;if(y>=b&&y>=T?(A=l,z=p,k=v,nt=h,l>=0?(w=c,x=f,R=u,I=d,G=E,O=m,Q=g,Z=M):(w=f,x=c,R=d,I=u,G=m,O=E,Q=M,Z=g)):b>=T?(A=c,z=u,k=E,nt=g,c>=0?(w=f,x=l,R=d,I=p,G=m,O=v,Q=M,Z=h):(w=l,x=f,R=p,I=d,G=v,O=m,Q=h,Z=M)):(A=f,z=d,k=m,nt=M,f>=0?(w=l,x=c,R=p,I=u,G=v,O=E,Q=h,Z=g):(w=c,x=l,R=u,I=p,G=E,O=v,Q=g,Z=h)),A===0)return null;let W=w/A,K=x/A,st=1/A,Rt=R-W*z,At=I-K*z,xe=G-W*k,Qt=O-K*k,re=Q-W*nt,X=Z-K*nt,j=re*Qt-X*xe,xt=Rt*X-At*re,wt=xe*At-Qt*Rt;if(s){if(j<0||xt<0||wt<0)return null}else if((j<0||xt<0||wt<0)&&(j>0||xt>0||wt>0))return null;let vt=j+xt+wt;if(vt===0)return null;let qt=st*(j*z+xt*k+wt*nt);return(vt>0?qt<0:qt>0)?null:this.at(qt/vt,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ta=class extends os{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Wt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new as,this.combine=xf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},BS=new Re,ur=new sf,Dh=new Ea,zS=new H,Uh=new H,Lh=new H,Nh=new H,Dg=new H,Ih=new H,FS=new H,Oh=new H,Fe=class extends En{constructor(t=new Hi,n=new Ta){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){Ih.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let f=o[l],p=a[l];f!==0&&(Dg.fromBufferAttribute(p,t),r?Ih.addScaledVector(Dg,f):Ih.addScaledVector(Dg.sub(n),f))}n.add(Ih)}return n}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Dh.copy(i.boundingSphere),Dh.applyMatrix4(a),ur.copy(t.ray).recast(t.near),!(Dh.containsPoint(ur.origin)===!1&&(ur.intersectSphere(Dh,zS)===null||ur.origin.distanceToSquared(zS)>(t.far-t.near)**2))&&(BS.copy(a).invert(),ur.copy(t.ray).applyMatrix4(BS),!(i.boundingBox!==null&&ur.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,ur)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,f=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let v=0,E=u.length;v<E;v++){let m=u[v],h=r[m.materialIndex],g=Math.max(m.start,d.start),M=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=g,b=M;y<b;y+=3){let T=o.getX(y),w=o.getX(y+1),x=o.getX(y+2);s=Ph(this,h,t,i,c,f,p,T,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let v=Math.max(0,d.start),E=Math.min(o.count,d.start+d.count);for(let m=v,h=E;m<h;m+=3){let g=o.getX(m),M=o.getX(m+1),y=o.getX(m+2);s=Ph(this,r,t,i,c,f,p,g,M,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let v=0,E=u.length;v<E;v++){let m=u[v],h=r[m.materialIndex],g=Math.max(m.start,d.start),M=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=g,b=M;y<b;y+=3){let T=y,w=y+1,x=y+2;s=Ph(this,h,t,i,c,f,p,T,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let v=Math.max(0,d.start),E=Math.min(l.count,d.start+d.count);for(let m=v,h=E;m<h;m+=3){let g=m,M=m+1,y=m+2;s=Ph(this,r,t,i,c,f,p,g,M,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function YT(e,t,n,i,s,a,r,o){let l;if(t.side===Tn?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===Ia,o),l===null)return null;Oh.copy(o),Oh.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(Oh);return c<n.near||c>n.far?null:{distance:c,point:Oh.clone(),object:e}}function Ph(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,Uh),e.getVertexPosition(l,Lh),e.getVertexPosition(c,Nh);let f=YT(e,t,n,i,Uh,Lh,Nh,FS);if(f){let p=new H;ba.getBarycoord(FS,Uh,Lh,Nh,p),s&&(f.uv=ba.getInterpolatedAttribute(s,o,l,c,p,new $t)),a&&(f.uv1=ba.getInterpolatedAttribute(a,o,l,c,p,new $t)),r&&(f.normal=ba.getInterpolatedAttribute(r,o,l,c,p,new H),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new H,materialIndex:0};ba.getNormal(Uh,Lh,Nh,u.normal),f.face=u,f.barycoord=p}return f}var _c=class extends Zn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=_n,f=_n,p,u){super(null,r,o,l,c,f,s,a,p,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vc=class extends hi{constructor(t,n,i,s=1){super(t,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Lo=new Re,HS=new Re,Bh=[],VS=new rs,ZT=new Re,oc=new Fe,lc=new Ea,mr=class extends Fe{constructor(t,n,i){super(t,n),this.isInstancedMesh=!0,this.instanceMatrix=new vc(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,ZT)}computeBoundingBox(){let t=this.geometry,n=this.count;this.boundingBox===null&&(this.boundingBox=new rs),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,Lo),VS.copy(t.boundingBox).applyMatrix4(Lo),this.boundingBox.union(VS)}computeBoundingSphere(){let t=this.geometry,n=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ea),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,Lo),lc.copy(t.boundingSphere).applyMatrix4(Lo),this.boundingSphere.union(lc)}copy(t,n){return super.copy(t,n),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,n){return this.instanceColor===null?n.setRGB(1,1,1):n.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,n){return n.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,n){let i=n.morphTargetInfluences,s=this.morphTexture.source.data.data,a=i.length+1,r=t*a+1;for(let o=0;o<i.length;o++)i[o]=s[r+o]}raycast(t,n){let i=this.matrixWorld,s=this.count;if(oc.geometry=this.geometry,oc.material=this.material,oc.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),lc.copy(this.boundingSphere),lc.applyMatrix4(i),t.ray.intersectsSphere(lc)!==!1))for(let a=0;a<s;a++){this.getMatrixAt(a,Lo),HS.multiplyMatrices(i,Lo),oc.matrixWorld=HS,oc.raycast(t,Bh);for(let r=0,o=Bh.length;r<o;r++){let l=Bh[r];l.instanceId=a,l.object=this,n.push(l)}Bh.length=0}}setColorAt(t,n){return this.instanceColor===null&&(this.instanceColor=new vc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),n.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,n){return n.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,n){let i=n.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new _c(new Float32Array(s*this.count),s,this.count,wf,Ci));let a=this.morphTexture.source.data.data,r=0;for(let c=0;c<i.length;c++)r+=i[c];let o=this.geometry.morphTargetsRelative?1:1-r,l=s*t;return a[l]=o,a.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},hr=new Ea,JT=new $t(.5,.5),zh=new H,Go=class{constructor(t=new zi,n=new zi,i=new zi,s=new zi,a=new zi,r=new zi){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Fi,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],f=a[4],p=a[5],u=a[6],d=a[7],v=a[8],E=a[9],m=a[10],h=a[11],g=a[12],M=a[13],y=a[14],b=a[15];if(s[0].setComponents(c-r,d-f,h-v,b-g).normalize(),s[1].setComponents(c+r,d+f,h+v,b+g).normalize(),s[2].setComponents(c+o,d+p,h+E,b+M).normalize(),s[3].setComponents(c-o,d-p,h-E,b-M).normalize(),i)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,d-u,h-m,b-y).normalize();else if(s[4].setComponents(c-l,d-u,h-m,b-y).normalize(),n===Fi)s[5].setComponents(c+l,d+u,h+m,b+y).normalize();else if(n===zo)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),hr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),hr.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(hr)}intersectsSprite(t){hr.center.set(0,0,0);let n=JT.distanceTo(t.center);return hr.radius=.7071067811865476+n,hr.applyMatrix4(t.matrixWorld),this.intersectsSphere(hr)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(zh.x=s.normal.x>0?t.max.x:t.min.x,zh.y=s.normal.y>0?t.max.y:t.min.y,zh.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(zh)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var yc=class extends Zn{constructor(t=[],n=Oa,i,s,a,r,o,l,c,f){super(t,n,i,s,a,r,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var Aa=class extends Zn{constructor(t,n,i=Gi,s,a,r,o=_n,l=_n,c,f=is,p=1){if(f!==is&&f!==Ba)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:p};super(u,s,a,r,o,l,f,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ho(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return n.compareFunction=this.compareFunction,n}},af=class extends Aa{constructor(t,n=Gi,i=Oa,s,a,r=_n,o=_n,l,c=is){let f={width:t,height:t,depth:1},p=[f,f,f,f,f,f];super(t,t,n,i,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},xc=class extends Zn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},wa=class e extends Hi{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],f=[],p=[],u=0,d=0;v("z","y","x",-1,-1,i,n,t,r,a,0),v("z","y","x",1,-1,i,n,-t,r,a,1),v("x","z","y",1,1,t,i,n,s,r,2),v("x","z","y",1,-1,t,i,-n,s,r,3),v("x","y","z",1,-1,t,n,i,s,a,4),v("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new zn(c,3)),this.setAttribute("normal",new zn(f,3)),this.setAttribute("uv",new zn(p,2));function v(E,m,h,g,M,y,b,T,w,x,A){let R=y/w,I=b/x,z=y/2,G=b/2,O=T/2,k=w+1,Q=x+1,Z=0,nt=0,W=new H;for(let K=0;K<Q;K++){let st=K*I-G;for(let Rt=0;Rt<k;Rt++){let At=Rt*R-z;W[E]=At*g,W[m]=st*M,W[h]=O,c.push(W.x,W.y,W.z),W[E]=0,W[m]=0,W[h]=T>0?1:-1,f.push(W.x,W.y,W.z),p.push(Rt/w),p.push(1-K/x),Z+=1}}for(let K=0;K<x;K++)for(let st=0;st<w;st++){let Rt=u+st+k*K,At=u+st+k*(K+1),xe=u+(st+1)+k*(K+1),Qt=u+(st+1)+k*K;l.push(Rt,At,Qt),l.push(At,xe,Qt),nt+=6}o.addGroup(d,nt,A),d+=nt,u+=Z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Ca=class e extends Hi{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,f=l+1,p=t/o,u=n/l,d=[],v=[],E=[],m=[];for(let h=0;h<f;h++){let g=h*u-r;for(let M=0;M<c;M++){let y=M*p-a;v.push(y,-g,0),E.push(0,0,1),m.push(M/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let g=0;g<o;g++){let M=g+c*h,y=g+c*(h+1),b=g+1+c*(h+1),T=g+1+c*h;d.push(M,y,T),d.push(y,b,T)}this.setIndex(d),this.setAttribute("position",new zn(v,3)),this.setAttribute("normal",new zn(E,3)),this.setAttribute("uv",new zn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var Sc=class e extends Hi{constructor(t=1,n=32,i=16,s=0,a=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:n,heightSegments:i,phiStart:s,phiLength:a,thetaStart:r,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));let l=Math.min(r+o,Math.PI),c=0,f=[],p=new H,u=new H,d=[],v=[],E=[],m=[];for(let h=0;h<=i;h++){let g=[],M=h/i,y=r+M*o,b=t*Math.cos(y),T=Math.sqrt(t*t-b*b),w=0;h===0&&r===0?w=.5/n:h===i&&l===Math.PI&&(w=-.5/n);for(let x=0;x<=n;x++){let A=x/n,R=s+A*a;p.x=-T*Math.cos(R),p.y=b,p.z=T*Math.sin(R),v.push(p.x,p.y,p.z),u.copy(p).normalize(),E.push(u.x,u.y,u.z),m.push(A+w,1-M),g.push(c++)}f.push(g)}for(let h=0;h<i;h++)for(let g=0;g<n;g++){let M=f[h][g+1],y=f[h][g],b=f[h+1][g],T=f[h+1][g+1];(h!==0||r>0)&&d.push(M,y,T),(h!==i-1||l<Math.PI)&&d.push(y,b,T)}this.setIndex(d),this.setAttribute("position",new zn(v,3)),this.setAttribute("normal",new zn(E,3)),this.setAttribute("uv",new zn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Mc=class extends os{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new Wt(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}};function yr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(GS(s))s.isRenderTargetTexture?(It("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(GS(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function Un(e){let t={};for(let n=0;n<e.length;n++){let i=yr(e[n]);for(let s in i)t[s]=i[s]}return t}function GS(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function KT(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function c0(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:se.workingColorSpace}var NM={clone:yr,merge:Un},QT=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jT=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fi=class extends os{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=QT,this.fragmentShader=jT,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=yr(t.uniforms),this.uniformsGroups=KT(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new Wt().setHex(s.value);break;case"v2":this.uniforms[i].value=new $t().fromArray(s.value);break;case"v3":this.uniforms[i].value=new H().fromArray(s.value);break;case"v4":this.uniforms[i].value=new We().fromArray(s.value);break;case"m3":this.uniforms[i].value=new kt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Re().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},rf=class extends fi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},gr=class extends os{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Wt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Wt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Hc,this.normalScale=new $t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new as,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ko=class extends gr{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new $t(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ae(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(n){this.ior=(1+.4*n)/(1-.4*n)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Wt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Wt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Wt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var bc=class extends os{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Wt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Wt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Hc,this.normalScale=new $t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new as,this.combine=xf,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Wo=class extends os{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vM,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},of=class extends os{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function No(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function Ug(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Ra=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},lf=class extends Ra{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ig,endingEnd:Ig}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Og:a=t,o=2*n-i;break;case Pg:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Og:r=t,l=2*i-n;break;case Pg:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,f=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*f,this._offsetNext=r*f}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,v=(i-n)/(s-n),E=v*v,m=E*v,h=-u*m+2*u*E-u*v,g=(1+u)*m+(-1.5-2*u)*E+(-.5+u)*v+1,M=(-1-d)*m+(1.5+d)*E+.5*v,y=d*m-d*E;for(let b=0;b!==o;++b)a[b]=h*r[f+b]+g*r[c+b]+M*r[l+b]+y*r[p+b];return a}},cf=class extends Ra{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=(i-n)/(s-n),p=1-f;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*f;return a}},uf=class extends Ra{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},hf=class extends Ra{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this.inTangents,p=this.outTangents;if(!f||!p){let v=(i-n)/(s-n),E=1-v;for(let m=0;m!==o;++m)a[m]=r[c+m]*E+r[l+m]*v;return a}let u=o*2,d=t-1;for(let v=0;v!==o;++v){let E=r[c+v],m=r[l+v],h=d*u+v*2,g=p[h],M=p[h+1],y=t*u+v*2,b=f[y],T=f[y+1],w=tA(i,n,g,b,s);a[v]=IM(w,E,M,T,m)}return a}};function IM(e,t,n,i,s){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*i+e*e*e*s}function $T(e,t,n,i,s){let a=1-e;return 3*a*a*(n-t)+6*a*e*(i-n)+3*e*e*(s-i)}function tA(e,t,n,i,s){let a=(e-t)/(s-t);for(let r=0;r<8;r++){let o=IM(a,t,n,i,s)-e;if(Math.abs(o)<1e-10)break;let l=$T(a,t,n,i,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var di=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=No(n,this.TimeBufferType),this.values=No(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:No(t.times,Array),values:No(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),Ug(t.settings)&&(i.settings={inTangents:No(t.settings.inTangents,Array),outTangents:No(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new uf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new cf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new lf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new hf(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case cc:n=this.InterpolantFactoryMethodDiscrete;break;case jh:n=this.InterpolantFactoryMethodLinear;break;case Vh:n=this.InterpolantFactoryMethodSmooth;break;case Ng:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return It("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return cc;case this.InterpolantFactoryMethodLinear:return jh;case this.InterpolantFactoryMethodSmooth:return Vh;case this.InterpolantFactoryMethodBezier:return Ng}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t;Ug(this.settings)&&(kS(this.settings.inTangents,t),kS(this.settings.outTangents,t))}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(Pt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Pt("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Pt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Pt("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&RT(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Pt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Vh,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],f=t[o+1];if(c!==f&&(o!==1||c!==t[0]))if(s)l=!0;else{let p=o*i,u=p-i,d=p+i;for(let v=0;v!==i;++v){let E=n[p+v];if(E!==n[u+v]||E!==n[d+v]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let p=o*i,u=r*i;for(let d=0;d!==i;++d)n[u+d]=n[p+d]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,Ug(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function kS(e,t){for(let n=0,i=e.length;n!==i;n+=2)e[n]*=t}di.prototype.ValueTypeName="";di.prototype.TimeBufferType=Float32Array;di.prototype.ValueBufferType=Float32Array;di.prototype.DefaultInterpolation=jh;var Da=class extends di{constructor(t,n,i){super(t,n,i)}};Da.prototype.ValueTypeName="bool";Da.prototype.ValueBufferType=Array;Da.prototype.DefaultInterpolation=cc;Da.prototype.InterpolantFactoryMethodLinear=void 0;Da.prototype.InterpolantFactoryMethodSmooth=void 0;var ff=class extends di{constructor(t,n,i,s){super(t,n,i,s)}};ff.prototype.ValueTypeName="color";var df=class extends di{constructor(t,n,i,s){super(t,n,i,s)}};df.prototype.ValueTypeName="number";var pf=class extends Ra{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let f=c+o;c!==f;c+=4)wi.slerpFlat(a,0,r,c-o,r,c,l);return a}},Ec=class extends di{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new pf(this.times,this.values,this.getValueSize(),t)}};Ec.prototype.ValueTypeName="quaternion";Ec.prototype.InterpolantFactoryMethodSmooth=void 0;var Ua=class extends di{constructor(t,n,i){super(t,n,i)}};Ua.prototype.ValueTypeName="string";Ua.prototype.ValueBufferType=Array;Ua.prototype.DefaultInterpolation=cc;Ua.prototype.InterpolantFactoryMethodLinear=void 0;Ua.prototype.InterpolantFactoryMethodSmooth=void 0;var mf=class extends di{constructor(t,n,i,s){super(t,n,i,s)}};mf.prototype.ValueTypeName="vector";var gf=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(f){o++,a===!1&&s.onStart!==void 0&&s.onStart(f,r,o),a=!0},this.itemEnd=function(f){r++,s.onProgress!==void 0&&s.onProgress(f,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,p){return c.push(f,p),this},this.removeHandler=function(f){let p=c.indexOf(f);return p!==-1&&c.splice(p,2),this},this.getHandler=function(f){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],v=c[p+1];if(d.global&&(d.lastIndex=0),d.test(f))return v}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},OM=new gf,_f=class{constructor(t){this.manager=t!==void 0?t:OM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};_f.DEFAULT_MATERIAL_NAME="__DEFAULT";var Tc=class extends En{constructor(t,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Wt(t),this.intensity=n}copy(t,n){return super.copy(t,n),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let n=super.toJSON(t);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}};var Lg=new Re,WS=new H,XS=new H,Ac=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $t(512,512),this.mapType=Kn,this.map=null,this.mapPass=null,this.matrix=new Re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Go,this._frameExtents=new $t(1,1),this._viewportCount=1,this._viewports=[new We(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let n=this.camera;WS.setFromMatrixPosition(t.matrixWorld),n.position.copy(WS),XS.setFromMatrixPosition(t.target.matrixWorld),n.lookAt(XS),n.updateMatrixWorld(),this._updateMatrix(n,this.matrix,this._frustum)}_updateMatrix(t,n,i,s){Lg.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Lg,t.coordinateSystem,t.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;t.coordinateSystem===zo||t.reversedDepth?n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),n.multiply(Lg)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Fh=new H,Hh=new wi,es=new H,wc=class extends En{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Re,this.projectionMatrix=new Re,this.projectionMatrixInverse=new Re,this.coordinateSystem=Fi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Fh,Hh,es),es.x===1&&es.y===1&&es.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Fh,Hh,es.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(Fh,Hh,es),es.x===1&&es.y===1&&es.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Fh,Hh,es.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ma=new H,qS=new $t,YS=new $t,Bn=class extends wc{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=$h*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ug*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return $h*2*Math.atan(Math.tan(ug*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){Ma.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ma.x,Ma.y).multiplyScalar(-t/Ma.z),Ma.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ma.x,Ma.y).multiplyScalar(-t/Ma.z)}getViewSize(t,n){return this.getViewBounds(t,qS,YS),n.subVectors(YS,qS)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(ug*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var Bg=class extends Ac{constructor(){super(new Bn(90,1,.5,500)),this.isPointLightShadow=!0}},Cc=class extends Tc{constructor(t,n,i=0,s=2){super(t,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Bg}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,n){return super.copy(t,n),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.distance=this.distance,n.object.decay=this.decay,n.object.shadow=this.shadow.toJSON(),n}},La=class extends wc{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},zg=class extends Ac{constructor(){super(new La(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Rc=class extends Tc{constructor(t,n){super(t,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(En.DEFAULT_UP),this.updateMatrix(),this.target=new En,this.shadow=new zg}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}};var Io=-90,Oo=1,vf=class extends En{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Bn(Io,Oo,t,n);s.layers=this.layers,this.add(s);let a=new Bn(Io,Oo,t,n);a.layers=this.layers,this.add(a);let r=new Bn(Io,Oo,t,n);r.layers=this.layers,this.add(r);let o=new Bn(Io,Oo,t,n);o.layers=this.layers,this.add(o);let l=new Bn(Io,Oo,t,n);l.layers=this.layers,this.add(l);let c=new Bn(Io,Oo,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Fi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===zo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,f]=this.children,p=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),v=t.xr.enabled;t.xr.enabled=!1;let E=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=E,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,f),t.setRenderTarget(p,u,d),t.xr.enabled=v,i.texture.needsPMREMUpdate=!0}},yf=class extends Bn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var u0="\\[\\]\\.:\\/",eA=new RegExp("["+u0+"]","g"),h0="[^"+u0+"]",nA="[^"+u0.replace("\\.","")+"]",iA=/((?:WC+[\/:])*)/.source.replace("WC",h0),sA=/(WCOD+)?/.source.replace("WCOD",nA),aA=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",h0),rA=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",h0),oA=new RegExp("^"+iA+sA+aA+rA+"$"),lA=["material","materials","bones","map"],Fg=class{constructor(t,n,i){let s=i||ze.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},ze=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(eA,"")}static parseTrackName(t){let n=oA.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);lA.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){It("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){Pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Pt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Pt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Pt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Pt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Pt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;Pt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ze.Composite=Fg;ze.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ze.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ze.prototype.GetterByBindingType=[ze.prototype._getValue_direct,ze.prototype._getValue_array,ze.prototype._getValue_arrayElement,ze.prototype._getValue_toArray];ze.prototype.SetterByBindingTypeAndVersioning=[[ze.prototype._setValue_direct,ze.prototype._setValue_direct_setNeedsUpdate,ze.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_array,ze.prototype._setValue_array_setNeedsUpdate,ze.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_arrayElement,ze.prototype._setValue_arrayElement_setNeedsUpdate,ze.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_fromArray,ze.prototype._setValue_fromArray_setNeedsUpdate,ze.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var w2=new Float32Array(1);var Hg=class e{static{e.prototype.isMatrix2=!0}constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};function f0(e,t,n,i){let s=cA(i);switch(n){case s0:return e*t;case wf:return e*t/s.components*s.byteLength;case Cf:return e*t/s.components*s.byteLength;case za:return e*t*2/s.components*s.byteLength;case Rf:return e*t*2/s.components*s.byteLength;case a0:return e*t*3/s.components*s.byteLength;case Ri:return e*t*4/s.components*s.byteLength;case Df:return e*t*4/s.components*s.byteLength;case Ic:case Oc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Pc:case Bc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Lf:case If:return Math.max(e,16)*Math.max(t,8)/4;case Uf:case Nf:return Math.max(e,8)*Math.max(t,8)/2;case Of:case Pf:case zf:case Ff:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Bf:case zc:case Hf:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Vf:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Gf:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case kf:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Wf:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Xf:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case qf:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Yf:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Zf:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Jf:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Kf:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Qf:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case jf:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case $f:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case td:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case ed:case nd:case id:return Math.ceil(e/4)*Math.ceil(t/4)*16;case sd:case ad:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Fc:case rd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function cA(e){switch(e){case Kn:case t0:return{byteLength:1,components:1};case qo:case e0:case ki:return{byteLength:2,components:1};case Tf:case Af:return{byteLength:2,components:4};case Gi:case Ef:case Ci:return{byteLength:4,components:1};case n0:case i0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?It("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function ib(){let e=null,t=!1,n=null,i=null;function s(a,r){i=e.requestAnimationFrame(s),n(a,r)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function hA(e){let t=new WeakMap;function n(o,l){let c=o.array,f=o.usage,p=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=e.HALF_FLOAT:d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){let f=l.array,p=l.updateRanges;if(e.bindBuffer(c,o),p.length===0)e.bufferSubData(c,0,f);else{p.sort((d,v)=>d.start-v.start);let u=0;for(let d=1;d<p.length;d++){let v=p[u],E=p[d];E.start<=v.start+v.count+1?v.count=Math.max(v.count,E.start+E.count-v.start):(++u,p[u]=E)}p.length=u+1;for(let d=0,v=p.length;d<v;d++){let E=p[d];e.bufferSubData(c,E.start*f.BYTES_PER_ELEMENT,f,E.start,E.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var fA=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,dA=`#ifdef USE_ALPHAHASH
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
#endif`,pA=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mA=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gA=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_A=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vA=`#ifdef USE_AOMAP
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
#endif`,yA=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xA=`#ifdef USE_BATCHING
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
#endif`,SA=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,MA=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bA=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,EA=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,TA=`#ifdef USE_IRIDESCENCE
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
#endif`,AA=`#ifdef USE_BUMPMAP
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
#endif`,wA=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,CA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,RA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,DA=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,UA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,LA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,NA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,IA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,OA=`#define PI 3.141592653589793
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
} // validated`,PA=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,BA=`vec3 transformedNormal = objectNormal;
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
#endif`,zA=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,FA=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,HA=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,VA=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,GA="gl_FragColor = linearToOutputTexel( gl_FragColor );",kA=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,WA=`#ifdef USE_ENVMAP
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
#endif`,XA=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,qA=`#ifdef USE_ENVMAP
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
#endif`,YA=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ZA=`#ifdef USE_ENVMAP
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
#endif`,JA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,KA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,QA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,jA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$A=`#ifdef USE_GRADIENTMAP
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
}`,tw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ew=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,iw=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,sw=`#ifdef USE_ENVMAP
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
#endif`,aw=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,rw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ow=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cw=`PhysicalMaterial material;
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
#endif`,uw=`uniform sampler2D dfgLUT;
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
}`,hw=`
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
#endif`,fw=`#if defined( RE_IndirectDiffuse )
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
#endif`,dw=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pw=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,mw=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gw=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_w=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vw=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yw=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xw=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Sw=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Mw=`#if defined( USE_POINTS_UV )
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
#endif`,bw=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ew=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tw=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Aw=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ww=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cw=`#ifdef USE_MORPHTARGETS
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
#endif`,Rw=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Uw=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Lw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Nw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Iw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Ow=`#ifdef USE_NORMALMAP
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
#endif`,Pw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bw=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zw=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Fw=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Hw=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Vw=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Gw=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,kw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ww=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Yw=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Kw=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Qw=`float getShadowMask() {
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
}`,jw=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,$w=`#ifdef USE_SKINNING
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
#endif`,tC=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,eC=`#ifdef USE_SKINNING
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
#endif`,nC=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iC=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,sC=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,aC=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,rC=`#ifdef USE_TRANSMISSION
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
#endif`,oC=`#ifdef USE_TRANSMISSION
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
#endif`,lC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hC=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,fC=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,dC=`uniform sampler2D t2D;
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
}`,pC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mC=`#ifdef ENVMAP_TYPE_CUBE
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
}`,gC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_C=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vC=`#include <common>
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
}`,yC=`#if DEPTH_PACKING == 3200
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
}`,xC=`#define DISTANCE
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
}`,SC=`#define DISTANCE
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
}`,MC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,bC=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,EC=`uniform float scale;
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
}`,TC=`uniform vec3 diffuse;
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
}`,AC=`#include <common>
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
}`,wC=`uniform vec3 diffuse;
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
}`,CC=`#define LAMBERT
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
}`,RC=`#define LAMBERT
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
}`,DC=`#define MATCAP
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
}`,UC=`#define MATCAP
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
}`,LC=`#define NORMAL
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
}`,NC=`#define NORMAL
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
}`,IC=`#define PHONG
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
}`,OC=`#define PHONG
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
}`,PC=`#define STANDARD
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
}`,BC=`#define STANDARD
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
}`,zC=`#define TOON
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
}`,FC=`#define TOON
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
}`,HC=`uniform float size;
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
}`,VC=`uniform vec3 diffuse;
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
}`,GC=`#include <common>
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
}`,kC=`uniform vec3 color;
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
}`,WC=`uniform float rotation;
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
}`,XC=`uniform vec3 diffuse;
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
}`,Kt={alphahash_fragment:fA,alphahash_pars_fragment:dA,alphamap_fragment:pA,alphamap_pars_fragment:mA,alphatest_fragment:gA,alphatest_pars_fragment:_A,aomap_fragment:vA,aomap_pars_fragment:yA,batching_pars_vertex:xA,batching_vertex:SA,begin_vertex:MA,beginnormal_vertex:bA,bsdfs:EA,iridescence_fragment:TA,bumpmap_pars_fragment:AA,clipping_planes_fragment:wA,clipping_planes_pars_fragment:CA,clipping_planes_pars_vertex:RA,clipping_planes_vertex:DA,color_fragment:UA,color_pars_fragment:LA,color_pars_vertex:NA,color_vertex:IA,common:OA,cube_uv_reflection_fragment:PA,defaultnormal_vertex:BA,displacementmap_pars_vertex:zA,displacementmap_vertex:FA,emissivemap_fragment:HA,emissivemap_pars_fragment:VA,colorspace_fragment:GA,colorspace_pars_fragment:kA,envmap_fragment:WA,envmap_common_pars_fragment:XA,envmap_pars_fragment:qA,envmap_pars_vertex:YA,envmap_physical_pars_fragment:sw,envmap_vertex:ZA,fog_vertex:JA,fog_pars_vertex:KA,fog_fragment:QA,fog_pars_fragment:jA,gradientmap_pars_fragment:$A,lightmap_pars_fragment:tw,lights_lambert_fragment:ew,lights_lambert_pars_fragment:nw,lights_pars_begin:iw,lights_toon_fragment:aw,lights_toon_pars_fragment:rw,lights_phong_fragment:ow,lights_phong_pars_fragment:lw,lights_physical_fragment:cw,lights_physical_pars_fragment:uw,lights_fragment_begin:hw,lights_fragment_maps:fw,lights_fragment_end:dw,lightprobes_pars_fragment:pw,logdepthbuf_fragment:mw,logdepthbuf_pars_fragment:gw,logdepthbuf_pars_vertex:_w,logdepthbuf_vertex:vw,map_fragment:yw,map_pars_fragment:xw,map_particle_fragment:Sw,map_particle_pars_fragment:Mw,metalnessmap_fragment:bw,metalnessmap_pars_fragment:Ew,morphinstance_vertex:Tw,morphcolor_vertex:Aw,morphnormal_vertex:ww,morphtarget_pars_vertex:Cw,morphtarget_vertex:Rw,normal_fragment_begin:Dw,normal_fragment_maps:Uw,normal_pars_fragment:Lw,normal_pars_vertex:Nw,normal_vertex:Iw,normalmap_pars_fragment:Ow,clearcoat_normal_fragment_begin:Pw,clearcoat_normal_fragment_maps:Bw,clearcoat_pars_fragment:zw,iridescence_pars_fragment:Fw,opaque_fragment:Hw,packing:Vw,premultiplied_alpha_fragment:Gw,project_vertex:kw,dithering_fragment:Ww,dithering_pars_fragment:Xw,roughnessmap_fragment:qw,roughnessmap_pars_fragment:Yw,shadowmap_pars_fragment:Zw,shadowmap_pars_vertex:Jw,shadowmap_vertex:Kw,shadowmask_pars_fragment:Qw,skinbase_vertex:jw,skinning_pars_vertex:$w,skinning_vertex:tC,skinnormal_vertex:eC,specularmap_fragment:nC,specularmap_pars_fragment:iC,tonemapping_fragment:sC,tonemapping_pars_fragment:aC,transmission_fragment:rC,transmission_pars_fragment:oC,uv_pars_fragment:lC,uv_pars_vertex:cC,uv_vertex:uC,worldpos_vertex:hC,background_vert:fC,background_frag:dC,backgroundCube_vert:pC,backgroundCube_frag:mC,cube_vert:gC,cube_frag:_C,depth_vert:vC,depth_frag:yC,distance_vert:xC,distance_frag:SC,equirect_vert:MC,equirect_frag:bC,linedashed_vert:EC,linedashed_frag:TC,meshbasic_vert:AC,meshbasic_frag:wC,meshlambert_vert:CC,meshlambert_frag:RC,meshmatcap_vert:DC,meshmatcap_frag:UC,meshnormal_vert:LC,meshnormal_frag:NC,meshphong_vert:IC,meshphong_frag:OC,meshphysical_vert:PC,meshphysical_frag:BC,meshtoon_vert:zC,meshtoon_frag:FC,points_vert:HC,points_frag:VC,shadow_vert:GC,shadow_frag:kC,sprite_vert:WC,sprite_frag:XC},mt={common:{diffuse:{value:new Wt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new kt}},envmap:{envMap:{value:null},envMapRotation:{value:new kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new kt},normalScale:{value:new $t(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Wt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new H},probesMax:{value:new H},probesResolution:{value:new H}},points:{diffuse:{value:new Wt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0},uvTransform:{value:new kt}},sprite:{diffuse:{value:new Wt(16777215)},opacity:{value:1},center:{value:new $t(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}}},hs={basic:{uniforms:Un([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.fog]),vertexShader:Kt.meshbasic_vert,fragmentShader:Kt.meshbasic_frag},lambert:{uniforms:Un([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new Wt(0)},envMapIntensity:{value:1}}]),vertexShader:Kt.meshlambert_vert,fragmentShader:Kt.meshlambert_frag},phong:{uniforms:Un([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new Wt(0)},specular:{value:new Wt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphong_vert,fragmentShader:Kt.meshphong_frag},standard:{uniforms:Un([mt.common,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.roughnessmap,mt.metalnessmap,mt.fog,mt.lights,{emissive:{value:new Wt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag},toon:{uniforms:Un([mt.common,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.gradientmap,mt.fog,mt.lights,{emissive:{value:new Wt(0)}}]),vertexShader:Kt.meshtoon_vert,fragmentShader:Kt.meshtoon_frag},matcap:{uniforms:Un([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,{matcap:{value:null}}]),vertexShader:Kt.meshmatcap_vert,fragmentShader:Kt.meshmatcap_frag},points:{uniforms:Un([mt.points,mt.fog]),vertexShader:Kt.points_vert,fragmentShader:Kt.points_frag},dashed:{uniforms:Un([mt.common,mt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Kt.linedashed_vert,fragmentShader:Kt.linedashed_frag},depth:{uniforms:Un([mt.common,mt.displacementmap]),vertexShader:Kt.depth_vert,fragmentShader:Kt.depth_frag},normal:{uniforms:Un([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,{opacity:{value:1}}]),vertexShader:Kt.meshnormal_vert,fragmentShader:Kt.meshnormal_frag},sprite:{uniforms:Un([mt.sprite,mt.fog]),vertexShader:Kt.sprite_vert,fragmentShader:Kt.sprite_frag},background:{uniforms:{uvTransform:{value:new kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Kt.background_vert,fragmentShader:Kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new kt}},vertexShader:Kt.backgroundCube_vert,fragmentShader:Kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Kt.cube_vert,fragmentShader:Kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Kt.equirect_vert,fragmentShader:Kt.equirect_frag},distance:{uniforms:Un([mt.common,mt.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Kt.distance_vert,fragmentShader:Kt.distance_frag},shadow:{uniforms:Un([mt.lights,mt.fog,{color:{value:new Wt(0)},opacity:{value:1}}]),vertexShader:Kt.shadow_vert,fragmentShader:Kt.shadow_frag}};hs.physical={uniforms:Un([hs.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new kt},clearcoatNormalScale:{value:new $t(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new kt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new kt},sheen:{value:0},sheenColor:{value:new Wt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new kt},transmissionSamplerSize:{value:new $t},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new kt},attenuationDistance:{value:0},attenuationColor:{value:new Wt(0)},specularColor:{value:new Wt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new kt},anisotropyVector:{value:new $t},anisotropyMap:{value:null},anisotropyMapTransform:{value:new kt}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag};var cd={r:0,b:0,g:0},qC=new Re,sb=new kt;sb.set(-1,0,0,0,1,0,0,0,1);function YC(e,t,n,i,s,a){let r=new Wt(0),o=s===!0?0:1,l,c,f=null,p=0,u=null;function d(g){let M=g.isScene===!0?g.background:null;if(M&&M.isTexture){let y=g.backgroundBlurriness>0;M=t.get(M,y)}return M}function v(g){let M=!1,y=d(g);y===null?m(r,o):y&&y.isColor&&(m(y,1),M=!0);let b=e.xr.getEnvironmentBlendMode();b==="additive"?n.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function E(g,M){let y=d(M);y&&(y.isCubeTexture||y.mapping===Lc)?(c===void 0&&(c=new Fe(new wa(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:yr(hs.backgroundCube.uniforms),vertexShader:hs.backgroundCube.vertexShader,fragmentShader:hs.backgroundCube.fragmentShader,side:Tn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,T,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(qC.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(sb),c.material.toneMapped=se.getTransfer(y.colorSpace)!==Se,(f!==y||p!==y.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),c.layers.enableAll(),g.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Fe(new Ca(2,2),new fi({name:"BackgroundMaterial",uniforms:yr(hs.background.uniforms),vertexShader:hs.background.vertexShader,fragmentShader:hs.background.fragmentShader,side:Ia,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=se.getTransfer(y.colorSpace)!==Se,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||p!==y.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),l.layers.enableAll(),g.unshift(l,l.geometry,l.material,0,0,null))}function m(g,M){g.getRGB(cd,c0(e)),n.buffers.color.setClear(cd.r,cd.g,cd.b,M,a)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(g,M=1){r.set(g),o=M,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(g){o=g,m(r,o)},render:v,addToRenderList:E,dispose:h}}function ZC(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(I,z,G,O,k){let Q=!1,Z=p(I,O,G,z);a!==Z&&(a=Z,c(a.object)),Q=d(I,O,G,k),Q&&v(I,O,G,k),k!==null&&t.update(k,e.ELEMENT_ARRAY_BUFFER),(Q||r)&&(r=!1,y(I,z,G,O),k!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return e.createVertexArray()}function c(I){return e.bindVertexArray(I)}function f(I){return e.deleteVertexArray(I)}function p(I,z,G,O){let k=O.wireframe===!0,Q=i[z.id];Q===void 0&&(Q={},i[z.id]=Q);let Z=I.isInstancedMesh===!0?I.id:0,nt=Q[Z];nt===void 0&&(nt={},Q[Z]=nt);let W=nt[G.id];W===void 0&&(W={},nt[G.id]=W);let K=W[k];return K===void 0&&(K=u(l()),W[k]=K),K}function u(I){let z=[],G=[],O=[];for(let k=0;k<n;k++)z[k]=0,G[k]=0,O[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:G,attributeDivisors:O,object:I,attributes:{},index:null}}function d(I,z,G,O){let k=a.attributes,Q=z.attributes,Z=0,nt=G.getAttributes();for(let W in nt)if(nt[W].location>=0){let st=k[W],Rt=Q[W];if(Rt===void 0&&(W==="instanceMatrix"&&I.instanceMatrix&&(Rt=I.instanceMatrix),W==="instanceColor"&&I.instanceColor&&(Rt=I.instanceColor)),st===void 0||st.attribute!==Rt||Rt&&st.data!==Rt.data)return!0;Z++}return a.attributesNum!==Z||a.index!==O}function v(I,z,G,O){let k={},Q=z.attributes,Z=0,nt=G.getAttributes();for(let W in nt)if(nt[W].location>=0){let st=Q[W];st===void 0&&(W==="instanceMatrix"&&I.instanceMatrix&&(st=I.instanceMatrix),W==="instanceColor"&&I.instanceColor&&(st=I.instanceColor));let Rt={};Rt.attribute=st,st&&st.data&&(Rt.data=st.data),k[W]=Rt,Z++}a.attributes=k,a.attributesNum=Z,a.index=O}function E(){let I=a.newAttributes;for(let z=0,G=I.length;z<G;z++)I[z]=0}function m(I){h(I,0)}function h(I,z){let G=a.newAttributes,O=a.enabledAttributes,k=a.attributeDivisors;G[I]=1,O[I]===0&&(e.enableVertexAttribArray(I),O[I]=1),k[I]!==z&&(e.vertexAttribDivisor(I,z),k[I]=z)}function g(){let I=a.newAttributes,z=a.enabledAttributes;for(let G=0,O=z.length;G<O;G++)z[G]!==I[G]&&(e.disableVertexAttribArray(G),z[G]=0)}function M(I,z,G,O,k,Q,Z){Z===!0?e.vertexAttribIPointer(I,z,G,k,Q):e.vertexAttribPointer(I,z,G,O,k,Q)}function y(I,z,G,O){E();let k=O.attributes,Q=G.getAttributes(),Z=z.defaultAttributeValues;for(let nt in Q){let W=Q[nt];if(W.location>=0){let K=k[nt];if(K===void 0&&(nt==="instanceMatrix"&&I.instanceMatrix&&(K=I.instanceMatrix),nt==="instanceColor"&&I.instanceColor&&(K=I.instanceColor)),K!==void 0){let st=K.normalized,Rt=K.itemSize,At=t.get(K);if(At===void 0)continue;let xe=At.buffer,Qt=At.type,re=At.bytesPerElement,X=Qt===e.INT||Qt===e.UNSIGNED_INT||K.gpuType===Ef;if(K.isInterleavedBufferAttribute){let j=K.data,xt=j.stride,wt=K.offset;if(j.isInstancedInterleavedBuffer){for(let vt=0;vt<W.locationSize;vt++)h(W.location+vt,j.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let vt=0;vt<W.locationSize;vt++)m(W.location+vt);e.bindBuffer(e.ARRAY_BUFFER,xe);for(let vt=0;vt<W.locationSize;vt++)M(W.location+vt,Rt/W.locationSize,Qt,st,xt*re,(wt+Rt/W.locationSize*vt)*re,X)}else{if(K.isInstancedBufferAttribute){for(let j=0;j<W.locationSize;j++)h(W.location+j,K.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let j=0;j<W.locationSize;j++)m(W.location+j);e.bindBuffer(e.ARRAY_BUFFER,xe);for(let j=0;j<W.locationSize;j++)M(W.location+j,Rt/W.locationSize,Qt,st,Rt*re,Rt/W.locationSize*j*re,X)}}else if(Z!==void 0){let st=Z[nt];if(st!==void 0)switch(st.length){case 2:e.vertexAttrib2fv(W.location,st);break;case 3:e.vertexAttrib3fv(W.location,st);break;case 4:e.vertexAttrib4fv(W.location,st);break;default:e.vertexAttrib1fv(W.location,st)}}}}g()}function b(){A();for(let I in i){let z=i[I];for(let G in z){let O=z[G];for(let k in O){let Q=O[k];for(let Z in Q)f(Q[Z].object),delete Q[Z];delete O[k]}}delete i[I]}}function T(I){if(i[I.id]===void 0)return;let z=i[I.id];for(let G in z){let O=z[G];for(let k in O){let Q=O[k];for(let Z in Q)f(Q[Z].object),delete Q[Z];delete O[k]}}delete i[I.id]}function w(I){for(let z in i){let G=i[z];for(let O in G){let k=G[O];if(k[I.id]===void 0)continue;let Q=k[I.id];for(let Z in Q)f(Q[Z].object),delete Q[Z];delete k[I.id]}}}function x(I){for(let z in i){let G=i[z],O=I.isInstancedMesh===!0?I.id:0,k=G[O];if(k!==void 0){for(let Q in k){let Z=k[Q];for(let nt in Z)f(Z[nt].object),delete Z[nt];delete k[Q]}delete G[O],Object.keys(G).length===0&&delete i[z]}}}function A(){R(),r=!0,a!==s&&(a=s,c(a.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:R,dispose:b,releaseStatesOfGeometry:T,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:E,enableAttribute:m,disableUnusedAttributes:g}}function JC(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,f){f!==0&&(e.drawArraysInstanced(i,l,c,f),n.update(c,i,f))}function o(l,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,f);let u=0;for(let d=0;d<f;d++)u+=c[d];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function KC(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(w){return!(w!==Ri&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let x=w===ki&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==Kn&&w!==Ci&&!x&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",f=l(c);f!==c&&(It("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let p=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&It("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),v=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),h=e.getParameter(e.MAX_VERTEX_ATTRIBS),g=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),M=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),b=e.getParameter(e.MAX_SAMPLES),T=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:v,maxTextureSize:E,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:g,maxVaryings:M,maxFragmentUniforms:y,maxSamples:b,samples:T}}function QC(e){let t=this,n=null,i=0,s=!1,a=!1,r=new zi,o=new kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||i!==0||s;return s=u,i=p.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){n=f(p,u,0)},this.setState=function(p,u,d){let v=p.clippingPlanes,E=p.clipIntersection,m=p.clipShadows,h=e.get(p);if(!s||v===null||v.length===0||a&&!m)a?f(null):c();else{let g=a?0:i,M=g*4,y=h.clippingState||null;l.value=y,y=f(v,u,M,d);for(let b=0;b!==M;++b)y[b]=n[b];h.clippingState=y,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=g}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function f(p,u,d,v){let E=p!==null?p.length:0,m=null;if(E!==0){if(m=l.value,v!==!0||m===null){let h=d+E*4,g=u.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<h)&&(m=new Float32Array(h));for(let M=0,y=d;M!==E;++M,y+=4)r.copy(p[M]).applyMatrix4(g,o),r.normal.toArray(m,y),m[y+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=E,t.numIntersection=0,m}}var Jo=4,jC=6,$C=20,tR=256,Gc=new La,PM=new Wt,d0=null,p0=0,m0=0,g0=!1,eR=new H,xr=new H,Qo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=eR}=a;d0=this._renderer.getRenderTarget(),p0=this._renderer.getActiveCubeFace(),m0=this._renderer.getActiveMipmapLevel(),g0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=FM(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zM(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(d0,p0,m0),this._renderer.xr.enabled=g0,t.scissorTest=!1,Zo(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===Oa||t.mapping===vr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),d0=this._renderer.getRenderTarget(),p0=this._renderer.getActiveCubeFace(),m0=this._renderer.getActiveMipmapLevel(),g0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:bn,minFilter:bn,generateMipmaps:!1,type:ki,format:Ri,colorSpace:uc,depthBuffer:!1},s=BM(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=BM(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=nR(a)),this._blurMaterial=sR(a,t,n),this._ggxMaterial=iR(a,t,n)}return s}_compileMaterial(t){let n=new Fe(new Hi,t);this._renderer.compile(n,Gc)}_sceneToCubeUV(t,n,i,s,a){let l=new Bn(90,1,n,i),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(PM),p.toneMapping=Vi,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Fe(new wa,new Ta({name:"PMREM.Background",side:Tn,depthWrite:!1,depthTest:!1})));let E=this._backgroundBox,m=E.material,h=!1,g=t.background;g?g.isColor&&(m.color.copy(g),t.background=null,h=!0):(m.color.copy(PM),h=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[M],a.y,a.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[M],a.z)):(l.up.set(0,c[M],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[M]));let b=this._cubeSize;Zo(s,y*b,M>2?b:0,b,b),p.setRenderTarget(s),h&&p.render(E,l),p.render(t,l)}p.toneMapping=d,p.autoClear=u,t.background=g}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===Oa||t.mapping===vr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=FM()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zM());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;Zo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,Gc)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),f=n/(this._lodMeshes.length-1),p=Math.sqrt(c*c-f*f),u=c*1.25,d=p*u,{_lodMax:v}=this,E=this._sizeLods[i],m=3*E*(i>v-Jo?i-v+Jo:0),h=4*(this._cubeSize-E);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=v-n,Zo(a,m,h,3*E,2*E),s.setRenderTarget(a),s.render(o,Gc),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=v-i,Zo(t,m,h,3*E,2*E),s.setRenderTarget(t),s.render(o,Gc)}_blur(t,n,i,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,a,n,i,r),this._blurPass(a,t,i,i,r)}_blurPass(t,n,i,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-i;let f=this._sizeLods[s],p=3*f*(s>this._lodMax-Jo?s-this._lodMax+Jo:0),u=4*(this._cubeSize-f);Zo(n,p,u,3*f,2*f),r.setRenderTarget(n),r.render(l,Gc)}};function nR(e){let t=[],n=[],i=e,s=e-Jo+1+jC;for(let a=0;a<s;a++){let r=Math.pow(2,i);t.push(r);let o=1/(r-2),l=-o,c=1+o,f=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,u=6,d=3,v=new Float32Array(d*u*p),E=new Float32Array(d*u*p);for(let h=0;h<p;h++){let g=h%3*2/3-1,M=h>2?0:-1,y=[g,M,0,g+2/3,M,0,g+2/3,M+1,0,g,M,0,g+2/3,M+1,0,g,M+1,0];v.set(y,d*u*h);for(let b=0;b<u;b++){let T=f[b*2]*2-1,w=f[b*2+1]*2-1;h===0?xr.set(1,w,T):h===1?xr.set(-T,1,-w):h===2?xr.set(-T,w,1):h===3?xr.set(-1,w,-T):h===4?xr.set(-T,-1,w):xr.set(T,w,-1),xr.toArray(E,(h*u+b)*d)}}let m=new Hi;m.setAttribute("position",new hi(v,d)),m.setAttribute("outputDirection",new hi(E,d)),n.push(new Fe(m,null)),i>Jo&&i--}return{lodMeshes:n,sizeLods:t}}function BM(e,t,n){let i=new Jn(e,t,n);return i.texture.mapping=Lc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Zo(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function iR(e,t,n){return new fi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:tR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:dd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:cs,depthTest:!1,depthWrite:!1})}function sR(e,t,n){return new fi({name:"SphericalGaussianBlur",defines:{SAMPLES:$C,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:dd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:cs,depthTest:!1,depthWrite:!1})}function zM(){return new fi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:cs,depthTest:!1,depthWrite:!1})}function FM(){return new fi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:cs,depthTest:!1,depthWrite:!1})}function dd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var hd=class extends Jn{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new yc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new wa(5,5,5),a=new fi({name:"CubemapFromEquirect",uniforms:yr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Tn,blending:cs});a.uniforms.tEquirect.value=n;let r=new Fe(s,a),o=n.minFilter;return n.minFilter===Pa&&(n.minFilter=bn),new vf(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function aR(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===Sf||d===Mf)if(t.has(u)){let v=t.get(u).texture;return o(v,u.mapping)}else{let v=u.image;if(v&&v.height>0){let E=new hd(v.height);return E.fromEquirectangularTexture(e,u),t.set(u,E),u.addEventListener("dispose",c),o(E.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,v=d===Sf||d===Mf,E=d===Oa||d===vr;if(v||E){let m=n.get(u),h=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new Qo(e)),m=v?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),m.texture;if(m!==void 0)return m.texture;{let g=u.image;return v&&g&&g.height>0||E&&g&&l(g)?(i===null&&(i=new Qo(e)),m=v?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),u.addEventListener("dispose",f),m.texture):null}}}return u}function o(u,d){return d===Sf?u.mapping=Oa:d===Mf&&(u.mapping=vr),u}function l(u){let d=0,v=6;for(let E=0;E<v;E++)u[E]!==void 0&&d++;return d===v}function c(u){let d=u.target;d.removeEventListener("dispose",c);let v=t.get(d);v!==void 0&&(t.delete(d),v.dispose())}function f(u){let d=u.target;d.removeEventListener("dispose",f);let v=n.get(d);v!==void 0&&(n.delete(d),v.dispose())}function p(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:p}}function rR(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&dr("WebGLRenderer: "+i+" extension not supported."),s}}}function oR(e,t,n,i){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&t.remove(u.index);for(let v in u.attributes)t.remove(u.attributes[v]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)t.update(u[d],e.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,v=p.attributes.position,E=0;if(v===void 0)return;if(d!==null){let g=d.array;E=d.version;for(let M=0,y=g.length;M<y;M+=3){let b=g[M+0],T=g[M+1],w=g[M+2];u.push(b,T,T,w,w,b)}}else{let g=v.array;E=v.version;for(let M=0,y=g.length/3-1;M<y;M+=3){let b=M+0,T=M+1,w=M+2;u.push(b,T,T,w,w,b)}}let m=new(v.count>=65535?gc:mc)(u,1);m.version=E;let h=a.get(p);h&&t.remove(h),a.set(p,m)}function f(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:f}}function lR(e,t,n){let i;function s(p){i=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){e.drawElements(i,u,a,p*r),n.update(u,i,1)}function c(p,u,d){d!==0&&(e.drawElementsInstanced(i,u,a,p*r,d),n.update(u,i,d))}function f(p,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,p,0,d);let E=0;for(let m=0;m<d;m++)E+=u[m];n.update(E,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function cR(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:Pt("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function uR(e,t,n){let i=new WeakMap,s=new We;function a(r,o,l){let c=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0,u=i.get(o);if(u===void 0||u.count!==p){let A=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,E=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],h=o.morphAttributes.normal||[],g=o.morphAttributes.color||[],M=0;d===!0&&(M=1),v===!0&&(M=2),E===!0&&(M=3);let y=o.attributes.position.count*M,b=1;y>t.maxTextureSize&&(b=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let T=new Float32Array(y*b*4*p),w=new dc(T,y,b,p);w.type=Ci,w.needsUpdate=!0;let x=M*4;for(let R=0;R<p;R++){let I=m[R],z=h[R],G=g[R],O=y*b*4*R;for(let k=0;k<I.count;k++){let Q=k*x;d===!0&&(s.fromBufferAttribute(I,k),T[O+Q+0]=s.x,T[O+Q+1]=s.y,T[O+Q+2]=s.z,T[O+Q+3]=0),v===!0&&(s.fromBufferAttribute(z,k),T[O+Q+4]=s.x,T[O+Q+5]=s.y,T[O+Q+6]=s.z,T[O+Q+7]=0),E===!0&&(s.fromBufferAttribute(G,k),T[O+Q+8]=s.x,T[O+Q+9]=s.y,T[O+Q+10]=s.z,T[O+Q+11]=G.itemSize===4?s.w:1)}}u={count:p,texture:w,size:new $t(y,b)},i.set(o,u),o.addEventListener("dispose",A)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let d=0;for(let E=0;E<c.length;E++)d+=c[E];let v=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",v),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function hR(e,t,n,i,s){let a=new WeakMap;function r(c){let f=s.render.frame,p=c.geometry,u=t.get(c,p);if(a.get(u)!==f&&(t.update(u),a.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==f&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,f))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return u}function o(){a=new WeakMap}function l(c){let f=c.target;f.removeEventListener("dispose",l),i.releaseStatesOfObject(f),n.remove(f.instanceMatrix),f.instanceColor!==null&&n.remove(f.instanceColor)}return{update:r,dispose:o}}var fR={[Yg]:"LINEAR_TONE_MAPPING",[Zg]:"REINHARD_TONE_MAPPING",[Jg]:"CINEON_TONE_MAPPING",[Uc]:"ACES_FILMIC_TONE_MAPPING",[Qg]:"AGX_TONE_MAPPING",[jg]:"NEUTRAL_TONE_MAPPING",[Kg]:"CUSTOM_TONE_MAPPING"};function dR(e,t,n,i,s,a){let r=new Jn(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Hi;c.setAttribute("position",new zn([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new zn([0,2,0,0,2,0],2));let f=new rf({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),p=new Fe(c,f),u=new La(-1,1,1,-1,0,1),d=null,v=null,E=!1,m,h=null,g=[],M=!1;this.setSize=function(y,b){r.setSize(y,b),o!==null&&o.setSize(y,b),l!==null&&l.setSize(y,b);for(let T=0;T<g.length;T++){let w=g[T];w.setSize&&w.setSize(y,b)}},this.setEffects=function(y){g=y,M=g.length>0&&g[0].isRenderPass===!0;let b=r.width,T=r.height;g.length>0&&o===null&&(o=new Jn(b,T,{type:ki,depthBuffer:!1,stencilBuffer:!1}),l=new Jn(b,T,{type:ki,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<g.length;w++){let x=g[w];x.setSize&&x.setSize(b,T)}},this.begin=function(y,b){if(E||y.toneMapping===Vi&&g.length===0)return!1;if(h=b,b!==null){let T=b.width,w=b.height;(r.width!==T||r.height!==w)&&this.setSize(T,w)}return M===!1&&y.setRenderTarget(r),m=y.toneMapping,y.toneMapping=Vi,!0},this.hasRenderPass=function(){return M},this.end=function(y,b){y.toneMapping=m,E=!0;let T=r,w=o;for(let x=0;x<g.length;x++){let A=g[x];A.enabled!==!1&&(A.render(y,w,T,b),A.needsSwap!==!1&&(T=w,w=w===o?l:o))}if(d!==y.outputColorSpace||v!==y.toneMapping){d=y.outputColorSpace,v=y.toneMapping,f.defines={},se.getTransfer(d)===Se&&(f.defines.SRGB_TRANSFER="");let x=fR[v];x&&(f.defines[x]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=T.texture,y.setRenderTarget(h),y.render(p,u),h=null,E=!1},this.isCompositing=function(){return E},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),f.dispose()}}var ab=new Zn,y0=new Aa(1,1),rb=new dc,ob=new nf,lb=new yc,HM=[],VM=[],GM=new Float32Array(16),kM=new Float32Array(9),WM=new Float32Array(4);function jo(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=HM[s];if(a===void 0&&(a=new Float32Array(s),HM[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function un(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function hn(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function pd(e,t){let n=VM[t];n===void 0&&(n=new Int32Array(t),VM[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function pR(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function mR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(un(n,t))return;e.uniform2fv(this.addr,t),hn(n,t)}}function gR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(un(n,t))return;e.uniform3fv(this.addr,t),hn(n,t)}}function _R(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(un(n,t))return;e.uniform4fv(this.addr,t),hn(n,t)}}function vR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(un(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),hn(n,t)}else{if(un(n,i))return;WM.set(i),e.uniformMatrix2fv(this.addr,!1,WM),hn(n,i)}}function yR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(un(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),hn(n,t)}else{if(un(n,i))return;kM.set(i),e.uniformMatrix3fv(this.addr,!1,kM),hn(n,i)}}function xR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(un(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),hn(n,t)}else{if(un(n,i))return;GM.set(i),e.uniformMatrix4fv(this.addr,!1,GM),hn(n,i)}}function SR(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function MR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(un(n,t))return;e.uniform2iv(this.addr,t),hn(n,t)}}function bR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(un(n,t))return;e.uniform3iv(this.addr,t),hn(n,t)}}function ER(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(un(n,t))return;e.uniform4iv(this.addr,t),hn(n,t)}}function TR(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function AR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(un(n,t))return;e.uniform2uiv(this.addr,t),hn(n,t)}}function wR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(un(n,t))return;e.uniform3uiv(this.addr,t),hn(n,t)}}function CR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(un(n,t))return;e.uniform4uiv(this.addr,t),hn(n,t)}}function RR(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(y0.compareFunction=n.isReversedDepthBuffer()?ld:od,a=y0):a=ab,n.setTexture2D(t||a,s)}function DR(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||ob,s)}function UR(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||lb,s)}function LR(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||rb,s)}function NR(e){switch(e){case 5126:return pR;case 35664:return mR;case 35665:return gR;case 35666:return _R;case 35674:return vR;case 35675:return yR;case 35676:return xR;case 5124:case 35670:return SR;case 35667:case 35671:return MR;case 35668:case 35672:return bR;case 35669:case 35673:return ER;case 5125:return TR;case 36294:return AR;case 36295:return wR;case 36296:return CR;case 35678:case 36198:case 36298:case 36306:case 35682:return RR;case 35679:case 36299:case 36307:return DR;case 35680:case 36300:case 36308:case 36293:return UR;case 36289:case 36303:case 36311:case 36292:return LR}}function IR(e,t){e.uniform1fv(this.addr,t)}function OR(e,t){let n=jo(t,this.size,2);e.uniform2fv(this.addr,n)}function PR(e,t){let n=jo(t,this.size,3);e.uniform3fv(this.addr,n)}function BR(e,t){let n=jo(t,this.size,4);e.uniform4fv(this.addr,n)}function zR(e,t){let n=jo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function FR(e,t){let n=jo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function HR(e,t){let n=jo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function VR(e,t){e.uniform1iv(this.addr,t)}function GR(e,t){e.uniform2iv(this.addr,t)}function kR(e,t){e.uniform3iv(this.addr,t)}function WR(e,t){e.uniform4iv(this.addr,t)}function XR(e,t){e.uniform1uiv(this.addr,t)}function qR(e,t){e.uniform2uiv(this.addr,t)}function YR(e,t){e.uniform3uiv(this.addr,t)}function ZR(e,t){e.uniform4uiv(this.addr,t)}function JR(e,t,n){let i=this.cache,s=t.length,a=pd(n,s);un(i,a)||(e.uniform1iv(this.addr,a),hn(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=y0:r=ab;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function KR(e,t,n){let i=this.cache,s=t.length,a=pd(n,s);un(i,a)||(e.uniform1iv(this.addr,a),hn(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||ob,a[r])}function QR(e,t,n){let i=this.cache,s=t.length,a=pd(n,s);un(i,a)||(e.uniform1iv(this.addr,a),hn(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||lb,a[r])}function jR(e,t,n){let i=this.cache,s=t.length,a=pd(n,s);un(i,a)||(e.uniform1iv(this.addr,a),hn(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||rb,a[r])}function $R(e){switch(e){case 5126:return IR;case 35664:return OR;case 35665:return PR;case 35666:return BR;case 35674:return zR;case 35675:return FR;case 35676:return HR;case 5124:case 35670:return VR;case 35667:case 35671:return GR;case 35668:case 35672:return kR;case 35669:case 35673:return WR;case 5125:return XR;case 36294:return qR;case 36295:return YR;case 36296:return ZR;case 35678:case 36198:case 36298:case 36306:case 35682:return JR;case 35679:case 36299:case 36307:return KR;case 35680:case 36300:case 36308:case 36293:return QR;case 36289:case 36303:case 36311:case 36292:return jR}}var x0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=NR(n.type)}},S0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=$R(n.type)}},M0=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},_0=/(\w+)(\])?(\[|\.)?/g;function XM(e,t){e.seq.push(t),e.map[t.id]=t}function t3(e,t,n){let i=e.name,s=i.length;for(_0.lastIndex=0;;){let a=_0.exec(i),r=_0.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){XM(n,c===void 0?new x0(o,e,t):new S0(o,e,t));break}else{let p=n.map[o];p===void 0&&(p=new M0(o),XM(n,p)),n=p}}}var Ko=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);t3(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function qM(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var e3=37297,n3=0;function i3(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var YM=new kt;function s3(e){se._getMatrix(YM,se.workingColorSpace,e);let t=`mat3( ${YM.elements.map(n=>n.toFixed(4))} )`;switch(se.getTransfer(e)){case hc:return[t,"LinearTransferOETF"];case Se:return[t,"sRGBTransferOETF"];default:return It("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function ZM(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+i3(e.getShaderSource(t),o)}else return a}function a3(e,t){let n=s3(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var r3={[Yg]:"Linear",[Zg]:"Reinhard",[Jg]:"Cineon",[Uc]:"ACESFilmic",[Qg]:"AgX",[jg]:"Neutral",[Kg]:"Custom"};function o3(e,t){let n=r3[t];return n===void 0?(It("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var ud=new H;function l3(){se.getLuminanceCoefficients(ud);let e=ud.x.toFixed(4),t=ud.y.toFixed(4),n=ud.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function c3(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wc).join(`
`)}function u3(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function h3(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function Wc(e){return e!==""}function JM(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function KM(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var f3=/^[ \t]*#include +<([\w\d./]+)>/gm;function b0(e){return e.replace(f3,p3)}var d3=new Map;function p3(e,t){let n=Kt[t];if(n===void 0){let i=d3.get(t);if(i!==void 0)n=Kt[i],It('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return b0(n)}var m3=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function QM(e){return e.replace(m3,g3)}function g3(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function jM(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var _3={[Dc]:"SHADOWMAP_TYPE_PCF",[Na]:"SHADOWMAP_TYPE_VSM"};function v3(e){return _3[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var y3={[Oa]:"ENVMAP_TYPE_CUBE",[vr]:"ENVMAP_TYPE_CUBE",[Lc]:"ENVMAP_TYPE_CUBE_UV"};function x3(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":y3[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var S3={[vr]:"ENVMAP_MODE_REFRACTION"};function M3(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":S3[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var b3={[xf]:"ENVMAP_BLENDING_MULTIPLY",[mM]:"ENVMAP_BLENDING_MIX",[gM]:"ENVMAP_BLENDING_ADD"};function E3(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":b3[e.combine]||"ENVMAP_BLENDING_NONE"}function T3(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function A3(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=v3(n),c=x3(n),f=M3(n),p=E3(n),u=T3(n),d=c3(n),v=u3(a),E=s.createProgram(),m,h,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(Wc).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(Wc).join(`
`),h.length>0&&(h+=`
`)):(m=[jM(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wc).join(`
`),h=[jM(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",n.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Vi?"#define TONE_MAPPING":"",n.toneMapping!==Vi?Kt.tonemapping_pars_fragment:"",n.toneMapping!==Vi?o3("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Kt.colorspace_pars_fragment,a3("linearToOutputTexel",n.outputColorSpace),l3(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Wc).join(`
`)),r=b0(r),r=JM(r,n),r=KM(r,n),o=b0(o),o=JM(o,n),o=KM(o,n),r=QM(r),o=QM(o),n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",n.glslVersion===o0?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===o0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);let M=g+m+r,y=g+h+o,b=qM(s,s.VERTEX_SHADER,M),T=qM(s,s.FRAGMENT_SHADER,y);s.attachShader(E,b),s.attachShader(E,T),n.index0AttributeName!==void 0?s.bindAttribLocation(E,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(E,0,"position"),s.linkProgram(E);function w(I){if(e.debug.checkShaderErrors){let z=s.getProgramInfoLog(E)||"",G=s.getShaderInfoLog(b)||"",O=s.getShaderInfoLog(T)||"",k=z.trim(),Q=G.trim(),Z=O.trim(),nt=!0,W=!0;if(s.getProgramParameter(E,s.LINK_STATUS)===!1)if(nt=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,E,b,T);else{let K=ZM(s,b,"vertex"),st=ZM(s,T,"fragment");Pt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(E,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+k+`
`+K+`
`+st)}else k!==""?It("WebGLProgram: Program Info Log:",k):(Q===""||Z==="")&&(W=!1);W&&(I.diagnostics={runnable:nt,programLog:k,vertexShader:{log:Q,prefix:m},fragmentShader:{log:Z,prefix:h}})}s.deleteShader(b),s.deleteShader(T),x=new Ko(s,E),A=h3(s,E)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let A;this.getAttributes=function(){return A===void 0&&w(this),A};let R=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(E,e3)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(E),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=n3++,this.cacheKey=t,this.usedTimes=1,this.program=E,this.vertexShader=b,this.fragmentShader=T,this}var w3=0,E0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new T0(t),n.set(t,i)),i}},T0=class{constructor(t){this.id=w3++,this.code=t,this.usedTimes=0}};function C3(e){return e===za||e===zc||e===Fc}function R3(e,t,n,i,s,a){let r=new pc,o=new E0,l=new Set,c=[],f=new Map,p=i.logarithmicDepthBuffer,u=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(x){return l.add(x),x===0?"uv":`uv${x}`}function E(x,A,R,I,z,G){let O=I.fog,k=z.geometry,Q=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,Z=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,nt=t.get(x.envMap||Q,Z),W=nt&&nt.mapping===Lc?nt.image.height:null,K=d[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&It("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let st=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Rt=st!==void 0?st.length:0,At=0;k.morphAttributes.position!==void 0&&(At=1),k.morphAttributes.normal!==void 0&&(At=2),k.morphAttributes.color!==void 0&&(At=3);let xe,Qt,re,X;if(K){let tt=hs[K];xe=tt.vertexShader,Qt=tt.fragmentShader}else{xe=x.vertexShader,Qt=x.fragmentShader;let tt=o.getVertexShaderStage(x),at=o.getFragmentShaderStage(x);o.update(x,tt,at),re=tt.id,X=at.id}let j=e.getRenderTarget(),xt=e.state.buffers.depth.getReversed(),wt=z.isInstancedMesh===!0,vt=z.isBatchedMesh===!0,qt=!!x.map,Xe=!!x.matcap,jt=!!nt,oe=!!x.aoMap,Me=!!x.lightMap,Yt=!!x.bumpMap&&x.wireframe===!1,Bt=!!x.normalMap,zt=!!x.displacementMap,Jt=!!x.emissiveMap,le=!!x.metalnessMap,ge=!!x.roughnessMap,L=x.anisotropy>0,fe=x.clearcoat>0,Vt=x.dispersion>0,C=x.retroreflectivity>0,_=x.iridescence>0,B=x.sheen>0,F=x.transmission>0,q=L&&!!x.anisotropyMap,rt=fe&&!!x.clearcoatMap,lt=fe&&!!x.clearcoatNormalMap,Y=fe&&!!x.clearcoatRoughnessMap,$=_&&!!x.iridescenceMap,ut=_&&!!x.iridescenceThicknessMap,Ct=B&&!!x.sheenColorMap,pt=B&&!!x.sheenRoughnessMap,ht=!!x.specularMap,Dt=!!x.specularColorMap,Lt=!!x.specularIntensityMap,Ft=F&&!!x.transmissionMap,N=F&&!!x.thicknessMap,ft=!!x.gradientMap,J=!!x.alphaMap,dt=x.alphaTest>0,gt=!!x.alphaHash,it=!!x.extensions,bt=Vi;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(bt=e.toneMapping);let Tt={shaderID:K,shaderType:x.type,shaderName:x.name,vertexShader:xe,fragmentShader:Qt,defines:x.defines,customVertexShaderID:re,customFragmentShaderID:X,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:vt,batchingColor:vt&&z._colorsTexture!==null,instancing:wt,instancingColor:wt&&z.instanceColor!==null,instancingMorph:wt&&z.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:se.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:qt,matcap:Xe,envMap:jt,envMapMode:jt&&nt.mapping,envMapCubeUVHeight:W,aoMap:oe,lightMap:Me,bumpMap:Yt,normalMap:Bt,displacementMap:zt,emissiveMap:Jt,normalMapObjectSpace:Bt&&x.normalMapType===yM,normalMapTangentSpace:Bt&&x.normalMapType===Hc,packedNormalMap:Bt&&x.normalMapType===Hc&&C3(x.normalMap.format),metalnessMap:le,roughnessMap:ge,anisotropy:L,anisotropyMap:q,clearcoat:fe,clearcoatMap:rt,clearcoatNormalMap:lt,clearcoatRoughnessMap:Y,dispersion:Vt,retroreflection:C,iridescence:_,iridescenceMap:$,iridescenceThicknessMap:ut,sheen:B,sheenColorMap:Ct,sheenRoughnessMap:pt,specularMap:ht,specularColorMap:Dt,specularIntensityMap:Lt,transmission:F,transmissionMap:Ft,thicknessMap:N,gradientMap:ft,opaque:x.transparent===!1&&x.blending===Xo&&x.alphaToCoverage===!1,alphaMap:J,alphaTest:dt,alphaHash:gt,combine:x.combine,mapUv:qt&&v(x.map.channel),aoMapUv:oe&&v(x.aoMap.channel),lightMapUv:Me&&v(x.lightMap.channel),bumpMapUv:Yt&&v(x.bumpMap.channel),normalMapUv:Bt&&v(x.normalMap.channel),displacementMapUv:zt&&v(x.displacementMap.channel),emissiveMapUv:Jt&&v(x.emissiveMap.channel),metalnessMapUv:le&&v(x.metalnessMap.channel),roughnessMapUv:ge&&v(x.roughnessMap.channel),anisotropyMapUv:q&&v(x.anisotropyMap.channel),clearcoatMapUv:rt&&v(x.clearcoatMap.channel),clearcoatNormalMapUv:lt&&v(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Y&&v(x.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&v(x.iridescenceMap.channel),iridescenceThicknessMapUv:ut&&v(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ct&&v(x.sheenColorMap.channel),sheenRoughnessMapUv:pt&&v(x.sheenRoughnessMap.channel),specularMapUv:ht&&v(x.specularMap.channel),specularColorMapUv:Dt&&v(x.specularColorMap.channel),specularIntensityMapUv:Lt&&v(x.specularIntensityMap.channel),transmissionMapUv:Ft&&v(x.transmissionMap.channel),thicknessMapUv:N&&v(x.thicknessMap.channel),alphaMapUv:J&&v(x.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(Bt||L),vertexNormals:!!k.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!k.attributes.uv&&(qt||J),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||k.attributes.normal===void 0&&Bt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:xt,skinning:z.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:Rt,morphTextureStride:At,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:G.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:e.shadowMap.enabled&&R.length>0,shadowMapType:e.shadowMap.type,toneMapping:bt,decodeVideoTexture:qt&&x.map.isVideoTexture===!0&&se.getTransfer(x.map.colorSpace)===Se,decodeVideoTextureEmissive:Jt&&x.emissiveMap.isVideoTexture===!0&&se.getTransfer(x.emissiveMap.colorSpace)===Se,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ls,flipSided:x.side===Tn,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:it&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(it&&x.extensions.multiDraw===!0||vt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Tt.vertexUv1s=l.has(1),Tt.vertexUv2s=l.has(2),Tt.vertexUv3s=l.has(3),l.clear(),Tt}function m(x){let A=[];if(x.shaderID?A.push(x.shaderID):(A.push(x.customVertexShaderID),A.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)A.push(R),A.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(h(A,x),g(A,x),A.push(e.outputColorSpace)),A.push(x.customProgramCacheKey),A.join()}function h(x,A){x.push(A.precision),x.push(A.outputColorSpace),x.push(A.envMapMode),x.push(A.envMapCubeUVHeight),x.push(A.mapUv),x.push(A.alphaMapUv),x.push(A.lightMapUv),x.push(A.aoMapUv),x.push(A.bumpMapUv),x.push(A.normalMapUv),x.push(A.displacementMapUv),x.push(A.emissiveMapUv),x.push(A.metalnessMapUv),x.push(A.roughnessMapUv),x.push(A.anisotropyMapUv),x.push(A.clearcoatMapUv),x.push(A.clearcoatNormalMapUv),x.push(A.clearcoatRoughnessMapUv),x.push(A.iridescenceMapUv),x.push(A.iridescenceThicknessMapUv),x.push(A.sheenColorMapUv),x.push(A.sheenRoughnessMapUv),x.push(A.specularMapUv),x.push(A.specularColorMapUv),x.push(A.specularIntensityMapUv),x.push(A.transmissionMapUv),x.push(A.thicknessMapUv),x.push(A.combine),x.push(A.fogExp2),x.push(A.sizeAttenuation),x.push(A.morphTargetsCount),x.push(A.morphAttributeCount),x.push(A.numSunLights),x.push(A.numDirLights),x.push(A.numPointLights),x.push(A.numSpotLights),x.push(A.numSpotLightMaps),x.push(A.numHemiLights),x.push(A.numRectAreaLights),x.push(A.numSunLightShadows),x.push(A.numDirLightShadows),x.push(A.numPointLightShadows),x.push(A.numSpotLightShadows),x.push(A.numSpotLightShadowsWithMaps),x.push(A.numLightProbes),x.push(A.shadowMapType),x.push(A.toneMapping),x.push(A.numClippingPlanes),x.push(A.numClipIntersection),x.push(A.depthPacking)}function g(x,A){r.disableAll(),A.instancing&&r.enable(0),A.instancingColor&&r.enable(1),A.instancingMorph&&r.enable(2),A.matcap&&r.enable(3),A.envMap&&r.enable(4),A.normalMapObjectSpace&&r.enable(5),A.normalMapTangentSpace&&r.enable(6),A.clearcoat&&r.enable(7),A.iridescence&&r.enable(8),A.alphaTest&&r.enable(9),A.vertexColors&&r.enable(10),A.vertexAlphas&&r.enable(11),A.vertexUv1s&&r.enable(12),A.vertexUv2s&&r.enable(13),A.vertexUv3s&&r.enable(14),A.vertexTangents&&r.enable(15),A.anisotropy&&r.enable(16),A.alphaHash&&r.enable(17),A.batching&&r.enable(18),A.dispersion&&r.enable(19),A.retroreflection&&r.enable(24),A.batchingColor&&r.enable(20),A.gradientMap&&r.enable(21),A.packedNormalMap&&r.enable(22),A.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),A.fog&&r.enable(0),A.useFog&&r.enable(1),A.flatShading&&r.enable(2),A.logarithmicDepthBuffer&&r.enable(3),A.reversedDepthBuffer&&r.enable(4),A.skinning&&r.enable(5),A.morphTargets&&r.enable(6),A.morphNormals&&r.enable(7),A.morphColors&&r.enable(8),A.premultipliedAlpha&&r.enable(9),A.shadowMapEnabled&&r.enable(10),A.doubleSided&&r.enable(11),A.flipSided&&r.enable(12),A.useDepthPacking&&r.enable(13),A.dithering&&r.enable(14),A.transmission&&r.enable(15),A.sheen&&r.enable(16),A.opaque&&r.enable(17),A.pointsUvs&&r.enable(18),A.decodeVideoTexture&&r.enable(19),A.decodeVideoTextureEmissive&&r.enable(20),A.alphaToCoverage&&r.enable(21),A.numLightProbeGrids>0&&r.enable(22),A.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function M(x){let A=d[x.type],R;if(A){let I=hs[A];R=NM.clone(I.uniforms)}else R=x.uniforms;return R}function y(x,A){let R=f.get(A);return R!==void 0?++R.usedTimes:(R=new A3(e,A,x,s),c.push(R),f.set(A,R)),R}function b(x){if(--x.usedTimes===0){let A=c.indexOf(x);c[A]=c[c.length-1],c.pop(),f.delete(x.cacheKey),x.destroy()}}function T(x){o.remove(x)}function w(){o.dispose()}return{getParameters:E,getProgramCacheKey:m,getUniforms:M,acquireProgram:y,releaseProgram:b,releaseShaderCache:T,programs:c,dispose:w}}function D3(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function U3(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function $M(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function tb(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,v,E,m,h){let g=e[t];return g===void 0?(g={id:u.id,object:u,geometry:d,material:v,materialVariant:r(u),groupOrder:E,renderOrder:u.renderOrder,z:m,group:h},e[t]=g):(g.id=u.id,g.object=u,g.geometry=d,g.material=v,g.materialVariant=r(u),g.groupOrder=E,g.renderOrder=u.renderOrder,g.z=m,g.group=h),t++,g}function l(u,d,v,E,m,h,g){g.reversedDepth===!0&&(m=-m);let M=o(u,d,v,E,m,h);v.transmission>0?i.push(M):v.transparent===!0?s.push(M):n.push(M)}function c(u,d,v,E,m,h){let g=o(u,d,v,E,m,h);v.transmission>0?i.unshift(g):v.transparent===!0?s.unshift(g):n.unshift(g)}function f(u,d){n.length>1&&n.sort(u||U3),i.length>1&&i.sort(d||$M),s.length>1&&s.sort(d||$M)}function p(){for(let u=t,d=e.length;u<d;u++){let v=e[u];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:p,sort:f}}function L3(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new tb,e.set(i,[r])):s>=a.length?(r=new tb,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function N3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={direction:new H,color:new Wt};break;case"SpotLight":n={position:new H,direction:new H,color:new Wt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new H,color:new Wt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new H,skyColor:new Wt,groundColor:new Wt};break;case"RectAreaLight":n={color:new Wt,position:new H,halfWidth:new H,halfHeight:new H};break}return e[t.id]=n,n}}}function I3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var O3=0;function P3(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function B3(e){let t=new N3,n=I3(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new H);let s=new H,a=new Re,r=new Re;function o(c){let f=0,p=0,u=0;for(let z=0;z<9;z++)i.probe[z].set(0,0,0);let d=0,v=0,E=0,m=0,h=0,g=0,M=0,y=0,b=0,T=0,w=0,x=0,A=0,R=0;c.sort(P3);for(let z=0,G=c.length;z<G;z++){let O=c[z],k=O.color,Q=O.intensity,Z=O.distance,nt=null;if(O.shadow&&O.shadow.map&&(O.shadow.map.texture.format===za?nt=O.shadow.map.texture:nt=O.shadow.map.depthTexture||O.shadow.map.texture),O.isAmbientLight)f+=k.r*Q,p+=k.g*Q,u+=k.b*Q;else if(O.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(O.sh.coefficients[W],Q);R++}else if(O.isSunLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let K=O.shadow,st=n.get(O);st.shadowIntensity=K.intensity,st.shadowBias=K.bias,st.shadowNormalBias=K.normalBias,st.shadowRadius=K.radius,st.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),i.sunShadow[v]=st,i.sunShadowMap[v]=nt;let Rt=K.getViewportCount();for(let At=0;At<Rt;At++)i.sunShadowMatrix[E+At]=K.getMatrix(At),i.sunShadowCascade[E+At]=K._cascadeData[At];E+=Rt,v++}i.sun[d]=W,d++}else if(O.isDirectionalLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let K=O.shadow,st=n.get(O);st.shadowIntensity=K.intensity,st.shadowBias=K.bias,st.shadowNormalBias=K.normalBias,st.shadowRadius=K.radius,st.shadowMapSize=K.mapSize,i.directionalShadow[m]=st,i.directionalShadowMap[m]=nt,i.directionalShadowMatrix[m]=O.shadow.matrix,b++}i.directional[m]=W,m++}else if(O.isSpotLight){let W=t.get(O);W.position.setFromMatrixPosition(O.matrixWorld),W.color.copy(k).multiplyScalar(Q),W.distance=Z,W.coneCos=Math.cos(O.angle),W.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),W.decay=O.decay,i.spot[g]=W;let K=O.shadow;if(O.map&&(i.spotLightMap[x]=O.map,x++,K.updateMatrices(O),O.castShadow&&A++),i.spotLightMatrix[g]=K.matrix,O.castShadow){let st=n.get(O);st.shadowIntensity=K.intensity,st.shadowBias=K.bias,st.shadowNormalBias=K.normalBias,st.shadowRadius=K.radius,st.shadowMapSize=K.mapSize,i.spotShadow[g]=st,i.spotShadowMap[g]=nt,w++}g++}else if(O.isRectAreaLight){let W=t.get(O);W.color.copy(k).multiplyScalar(Q),W.halfWidth.set(O.width*.5,0,0),W.halfHeight.set(0,O.height*.5,0),i.rectArea[M]=W,M++}else if(O.isPointLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),W.distance=O.distance,W.decay=O.decay,O.castShadow){let K=O.shadow,st=n.get(O);st.shadowIntensity=K.intensity,st.shadowBias=K.bias,st.shadowNormalBias=K.normalBias,st.shadowRadius=K.radius,st.shadowMapSize=K.mapSize,st.shadowCameraNear=K.camera.near,st.shadowCameraFar=K.camera.far,i.pointShadow[h]=st,i.pointShadowMap[h]=nt,i.pointShadowMatrix[h]=O.shadow.matrix,T++}i.point[h]=W,h++}else if(O.isHemisphereLight){let W=t.get(O);W.skyColor.copy(O.color).multiplyScalar(Q),W.groundColor.copy(O.groundColor).multiplyScalar(Q),i.hemi[y]=W,y++}}M>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=mt.LTC_FLOAT_1,i.rectAreaLTC2=mt.LTC_FLOAT_2):(i.rectAreaLTC1=mt.LTC_HALF_1,i.rectAreaLTC2=mt.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=p,i.ambient[2]=u;let I=i.hash;(I.sunLength!==d||I.directionalLength!==m||I.pointLength!==h||I.spotLength!==g||I.rectAreaLength!==M||I.hemiLength!==y||I.numSunShadows!==v||I.numDirectionalShadows!==b||I.numPointShadows!==T||I.numSpotShadows!==w||I.numSpotMaps!==x||I.numLightProbes!==R)&&(i.sun.length=d,i.directional.length=m,i.spot.length=g,i.rectArea.length=M,i.point.length=h,i.hemi.length=y,i.sunShadow.length=v,i.sunShadowMap.length=v,i.sunShadowMatrix.length=E,i.sunShadowCascade.length=E,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+x-A,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=R,I.sunLength=d,I.directionalLength=m,I.pointLength=h,I.spotLength=g,I.rectAreaLength=M,I.hemiLength=y,I.numSunShadows=v,I.numDirectionalShadows=b,I.numPointShadows=T,I.numSpotShadows=w,I.numSpotMaps=x,I.numLightProbes=R,i.version=O3++)}function l(c,f){let p=0,u=0,d=0,v=0,E=0,m=0,h=f.matrixWorldInverse;for(let g=0,M=c.length;g<M;g++){let y=c[g];if(y.isSunLight){let b=i.sun[p];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(h),p++}else if(y.isDirectionalLight){let b=i.directional[u];b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(h),u++}else if(y.isSpotLight){let b=i.spot[v];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(h),v++}else if(y.isRectAreaLight){let b=i.rectArea[E];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),r.identity(),a.copy(y.matrixWorld),a.premultiply(h),r.extractRotation(a),b.halfWidth.set(y.width*.5,0,0),b.halfHeight.set(0,y.height*.5,0),b.halfWidth.applyMatrix4(r),b.halfHeight.applyMatrix4(r),E++}else if(y.isPointLight){let b=i.point[d];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),d++}else if(y.isHemisphereLight){let b=i.hemi[m];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(h),m++}}}return{setup:o,setupView:l,state:i}}function eb(e){let t=new B3(e),n=[],i=[],s=[];function a(u){p.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function f(u){t.setupView(n,u)}let p={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function z3(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new eb(e),t.set(s,[o])):a>=r.length?(o=new eb(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var F3=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,H3=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,V3=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],G3=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],nb=new Re,kc=new H,v0=new H;function k3(e,t,n){let i=new Go,s=new $t,a=new $t,r=new We,o=new Wo,l=new of,c={},f=n.maxTextureSize,p={[Ia]:Tn,[Tn]:Ia,[ls]:ls},u=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $t},radius:{value:4}},vertexShader:F3,fragmentShader:H3}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let v=new Hi;v.setAttribute("position",new hi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let E=new Fe(v,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Dc;let h=this.type;this.render=function(T,w,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===KS&&(It("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Dc);let A=e.getRenderTarget(),R=e.getActiveCubeFace(),I=e.getActiveMipmapLevel(),z=e.state;z.setBlending(cs),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let G=h!==this.type;G&&w.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(k=>k.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,k=T.length;O<k;O++){let Q=T[O],Z=Q.shadow;if(Z===void 0){It("WebGLShadowMap:",Q,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;s.copy(Z.mapSize);let nt=Z.getFrameExtents();s.multiply(nt),a.copy(Z.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/nt.x),s.x=a.x*nt.x,Z.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/nt.y),s.y=a.y*nt.y,Z.mapSize.y=a.y));let W=e.state.buffers.depth.getReversed();if(Z.camera._reversedDepth=W,Z.map===null||G===!0){if(Z.map!==null&&(Z.map.depthTexture!==null&&(Z.map.depthTexture.dispose(),Z.map.depthTexture=null),Z.map.dispose()),this.type===Na){if(Q.isPointLight){It("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Z.map=new Jn(s.x,s.y,{format:za,type:ki,minFilter:bn,magFilter:bn,generateMipmaps:!1}),Z.map.texture.name=Q.name+".shadowMap",Z.map.depthTexture=new Aa(s.x,s.y,Ci),Z.map.depthTexture.name=Q.name+".shadowMapDepth",Z.map.depthTexture.format=is,Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=_n,Z.map.depthTexture.magFilter=_n}else Q.isPointLight?(Z.map=new hd(s.x),Z.map.depthTexture=new af(s.x,Gi)):(Z.map=new Jn(s.x,s.y),Z.map.depthTexture=new Aa(s.x,s.y,Gi)),Z.map.depthTexture.name=Q.name+".shadowMap",Z.map.depthTexture.format=is,this.type===Dc?(Z.map.depthTexture.compareFunction=W?ld:od,Z.map.depthTexture.minFilter=bn,Z.map.depthTexture.magFilter=bn):(Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=_n,Z.map.depthTexture.magFilter=_n);Z.camera.updateProjectionMatrix()}Z.map.isWebGLCubeRenderTarget!==!0&&(Z.map.width!==s.x||Z.map.height!==s.y)&&Z.map.setSize(s.x,s.y);let K=Z.map.isWebGLCubeRenderTarget?6:Z.getViewportCount();Q.isPointLight!==!0&&Z.updateMatrices(Q,x);for(let st=0;st<K;st++){let Rt=Z.getCamera(st);if(Q.isPointLight){let At=Z.camera,xe=Z.matrix,Qt=Q.distance||At.far;Qt!==At.far&&(At.far=Qt,At.updateProjectionMatrix()),kc.setFromMatrixPosition(Q.matrixWorld),At.position.copy(kc),v0.copy(At.position),v0.add(V3[st]),At.up.copy(G3[st]),At.lookAt(v0),At.updateMatrixWorld(),xe.makeTranslation(-kc.x,-kc.y,-kc.z),nb.multiplyMatrices(At.projectionMatrix,At.matrixWorldInverse),Z._frustum.setFromProjectionMatrix(nb,At.coordinateSystem,At.reversedDepth)}if(Z.map.isWebGLCubeRenderTarget)e.setRenderTarget(Z.map,st),e.clear();else{st===0&&(e.setRenderTarget(Z.map),e.clear());let At=Z.getViewport(st);r.set(a.x*At.x,a.y*At.y,a.x*At.z,a.y*At.w),z.viewport(r)}i=Z.getFrustum(st),y(w,x,Rt,Q,this.type)}Z.isPointLightShadow!==!0&&this.type===Na&&g(Z,x),Z.needsUpdate=!1}h=this.type,m.needsUpdate=!1,e.setRenderTarget(A,R,I)};function g(T,w){let x=t.update(E);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new Jn(s.x,s.y,{format:za,type:ki}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,e.setRenderTarget(T.mapPass),e.clear(),e.renderBufferDirect(w,null,x,u,E,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,e.setRenderTarget(T.map),e.clear(),e.renderBufferDirect(w,null,x,d,E,null)}function M(T,w,x,A){let R=null,I=x.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let z=R.uuid,G=w.uuid,O=c[z];O===void 0&&(O={},c[z]=O);let k=O[G];k===void 0&&(k=R.clone(),O[G]=k,w.addEventListener("dispose",b)),R=k}if(R.visible=w.visible,R.wireframe=w.wireframe,A===Na?R.side=w.shadowSide!==null?w.shadowSide:w.side:R.side=w.shadowSide!==null?w.shadowSide:p[w.side],R.alphaMap=w.alphaMap,R.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,R.map=w.map,R.clipShadows=w.clipShadows,R.clippingPlanes=w.clippingPlanes,R.clipIntersection=w.clipIntersection,R.displacementMap=w.displacementMap,R.displacementScale=w.displacementScale,R.displacementBias=w.displacementBias,R.wireframeLinewidth=w.wireframeLinewidth,R.linewidth=w.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let z=e.properties.get(R);z.light=x}return R}function y(T,w,x,A,R){if(T.visible===!1)return;if(T.layers.test(w.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&R===Na)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,T.matrixWorld);let G=t.update(T),O=T.material;if(Array.isArray(O)){let k=G.groups;for(let Q=0,Z=k.length;Q<Z;Q++){let nt=k[Q],W=O[nt.materialIndex];if(W&&W.visible){let K=M(T,W,A,R);T.onBeforeShadow(e,T,w,x,G,K,nt),e.renderBufferDirect(x,null,G,K,T,nt),T.onAfterShadow(e,T,w,x,G,K,nt)}}}else if(O.visible){let k=M(T,O,A,R);T.onBeforeShadow(e,T,w,x,G,k,null),e.renderBufferDirect(x,null,G,k,T,null),T.onAfterShadow(e,T,w,x,G,k,null)}}let z=T.children;for(let G=0,O=z.length;G<O;G++)y(z[G],w,x,A,R)}function b(T){T.target.removeEventListener("dispose",b);for(let x in c){let A=c[x],R=T.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function W3(e,t){function n(){let N=!1,ft=new We,J=null,dt=new We(0,0,0,0);return{setMask:function(gt){J!==gt&&!N&&(e.colorMask(gt,gt,gt,gt),J=gt)},setLocked:function(gt){N=gt},setClear:function(gt,it,bt,Tt,tt){tt===!0&&(gt*=Tt,it*=Tt,bt*=Tt),ft.set(gt,it,bt,Tt),dt.equals(ft)===!1&&(e.clearColor(gt,it,bt,Tt),dt.copy(ft))},reset:function(){N=!1,J=null,dt.set(-1,0,0,0)}}}function i(){let N=!1,ft=!1,J=null,dt=null,gt=null;return{setReversed:function(it){if(ft!==it){let bt=t.get("EXT_clip_control");it?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),ft=it;let Tt=gt;gt=null,this.setClear(Tt)}},getReversed:function(){return ft},setTest:function(it){it?j(e.DEPTH_TEST):xt(e.DEPTH_TEST)},setMask:function(it){J!==it&&!N&&(e.depthMask(it),J=it)},setFunc:function(it){if(ft&&(it=UM[it]),dt!==it){switch(it){case kh:e.depthFunc(e.NEVER);break;case Wh:e.depthFunc(e.ALWAYS);break;case Xh:e.depthFunc(e.LESS);break;case Bo:e.depthFunc(e.LEQUAL);break;case qh:e.depthFunc(e.EQUAL);break;case Yh:e.depthFunc(e.GEQUAL);break;case Zh:e.depthFunc(e.GREATER);break;case Jh:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}dt=it}},setLocked:function(it){N=it},setClear:function(it){gt!==it&&(gt=it,ft&&(it=1-it),e.clearDepth(it))},reset:function(){N=!1,J=null,dt=null,gt=null,ft=!1}}}function s(){let N=!1,ft=null,J=null,dt=null,gt=null,it=null,bt=null,Tt=null,tt=null;return{setTest:function(at){N||(at?j(e.STENCIL_TEST):xt(e.STENCIL_TEST))},setMask:function(at){ft!==at&&!N&&(e.stencilMask(at),ft=at)},setFunc:function(at,Ut,ce){(J!==at||dt!==Ut||gt!==ce)&&(e.stencilFunc(at,Ut,ce),J=at,dt=Ut,gt=ce)},setOp:function(at,Ut,ce){(it!==at||bt!==Ut||Tt!==ce)&&(e.stencilOp(at,Ut,ce),it=at,bt=Ut,Tt=ce)},setLocked:function(at){N=at},setClear:function(at){tt!==at&&(e.clearStencil(at),tt=at)},reset:function(){N=!1,ft=null,J=null,dt=null,gt=null,it=null,bt=null,Tt=null,tt=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,f={},p={},u={},d=new WeakMap,v=[],E=null,m=!1,h=null,g=null,M=null,y=null,b=null,T=null,w=null,x=new Wt(0,0,0),A=0,R=!1,I=null,z=null,G=null,O=null,k=null,Q=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,nt=0,W=e.getParameter(e.VERSION);W.indexOf("WebGL")!==-1?(nt=parseFloat(/^WebGL (\d)/.exec(W)[1]),Z=nt>=1):W.indexOf("OpenGL ES")!==-1&&(nt=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),Z=nt>=2);let K=null,st={},Rt=e.getParameter(e.SCISSOR_BOX),At=e.getParameter(e.VIEWPORT),xe=new We().fromArray(Rt),Qt=new We().fromArray(At);function re(N,ft,J,dt){let gt=new Uint8Array(4),it=e.createTexture();e.bindTexture(N,it),e.texParameteri(N,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(N,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let bt=0;bt<J;bt++)N===e.TEXTURE_3D||N===e.TEXTURE_2D_ARRAY?e.texImage3D(ft,0,e.RGBA,1,1,dt,0,e.RGBA,e.UNSIGNED_BYTE,gt):e.texImage2D(ft+bt,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,gt);return it}let X={};X[e.TEXTURE_2D]=re(e.TEXTURE_2D,e.TEXTURE_2D,1),X[e.TEXTURE_CUBE_MAP]=re(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[e.TEXTURE_2D_ARRAY]=re(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),X[e.TEXTURE_3D]=re(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),j(e.DEPTH_TEST),r.setFunc(Bo),Yt(!1),Bt(Vg),j(e.CULL_FACE),oe(cs);function j(N){f[N]!==!0&&(e.enable(N),f[N]=!0)}function xt(N){f[N]!==!1&&(e.disable(N),f[N]=!1)}function wt(N,ft){return u[N]!==ft?(e.bindFramebuffer(N,ft),u[N]=ft,N===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=ft),N===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=ft),!0):!1}function vt(N,ft){let J=v,dt=!1;if(N){J=d.get(ft),J===void 0&&(J=[],d.set(ft,J));let gt=N.textures;if(J.length!==gt.length||J[0]!==e.COLOR_ATTACHMENT0){for(let it=0,bt=gt.length;it<bt;it++)J[it]=e.COLOR_ATTACHMENT0+it;J.length=gt.length,dt=!0}}else J[0]!==e.BACK&&(J[0]=e.BACK,dt=!0);dt&&e.drawBuffers(J)}function qt(N){return E!==N?(e.useProgram(N),E=N,!0):!1}let Xe={[_r]:e.FUNC_ADD,[jS]:e.FUNC_SUBTRACT,[$S]:e.FUNC_REVERSE_SUBTRACT};Xe[tM]=e.MIN,Xe[eM]=e.MAX;let jt={[nM]:e.ZERO,[iM]:e.ONE,[sM]:e.SRC_COLOR,[Xg]:e.SRC_ALPHA,[uM]:e.SRC_ALPHA_SATURATE,[lM]:e.DST_COLOR,[rM]:e.DST_ALPHA,[aM]:e.ONE_MINUS_SRC_COLOR,[qg]:e.ONE_MINUS_SRC_ALPHA,[cM]:e.ONE_MINUS_DST_COLOR,[oM]:e.ONE_MINUS_DST_ALPHA,[hM]:e.CONSTANT_COLOR,[fM]:e.ONE_MINUS_CONSTANT_COLOR,[dM]:e.CONSTANT_ALPHA,[pM]:e.ONE_MINUS_CONSTANT_ALPHA};function oe(N,ft,J,dt,gt,it,bt,Tt,tt,at){if(N===cs){m===!0&&(xt(e.BLEND),m=!1);return}if(m===!1&&(j(e.BLEND),m=!0),N!==QS){if(N!==h||at!==R){if((g!==_r||b!==_r)&&(e.blendEquation(e.FUNC_ADD),g=_r,b=_r),at)switch(N){case Xo:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Gg:e.blendFunc(e.ONE,e.ONE);break;case kg:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Wg:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Pt("WebGLState: Invalid blending: ",N);break}else switch(N){case Xo:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Gg:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case kg:Pt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Wg:Pt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Pt("WebGLState: Invalid blending: ",N);break}M=null,y=null,T=null,w=null,x.set(0,0,0),A=0,h=N,R=at}return}gt=gt||ft,it=it||J,bt=bt||dt,(ft!==g||gt!==b)&&(e.blendEquationSeparate(Xe[ft],Xe[gt]),g=ft,b=gt),(J!==M||dt!==y||it!==T||bt!==w)&&(e.blendFuncSeparate(jt[J],jt[dt],jt[it],jt[bt]),M=J,y=dt,T=it,w=bt),(Tt.equals(x)===!1||tt!==A)&&(e.blendColor(Tt.r,Tt.g,Tt.b,tt),x.copy(Tt),A=tt),h=N,R=!1}function Me(N,ft){N.side===ls?xt(e.CULL_FACE):j(e.CULL_FACE);let J=N.side===Tn;ft&&(J=!J),Yt(J),N.blending===Xo&&N.transparent===!1?oe(cs):oe(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),r.setFunc(N.depthFunc),r.setTest(N.depthTest),r.setMask(N.depthWrite),a.setMask(N.colorWrite);let dt=N.stencilWrite;o.setTest(dt),dt&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Jt(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?j(e.SAMPLE_ALPHA_TO_COVERAGE):xt(e.SAMPLE_ALPHA_TO_COVERAGE)}function Yt(N){I!==N&&(N?e.frontFace(e.CW):e.frontFace(e.CCW),I=N)}function Bt(N){N!==ZS?(j(e.CULL_FACE),N!==z&&(N===Vg?e.cullFace(e.BACK):N===JS?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):xt(e.CULL_FACE),z=N}function zt(N){N!==G&&(Z&&e.lineWidth(N),G=N)}function Jt(N,ft,J){N?(j(e.POLYGON_OFFSET_FILL),(O!==ft||k!==J)&&(O=ft,k=J,r.getReversed()&&(ft=-ft),e.polygonOffset(ft,J))):xt(e.POLYGON_OFFSET_FILL)}function le(N){N?j(e.SCISSOR_TEST):xt(e.SCISSOR_TEST)}function ge(N){N===void 0&&(N=e.TEXTURE0+Q-1),K!==N&&(e.activeTexture(N),K=N)}function L(N,ft,J){J===void 0&&(K===null?J=e.TEXTURE0+Q-1:J=K);let dt=st[J];dt===void 0&&(dt={type:void 0,texture:void 0},st[J]=dt),(dt.type!==N||dt.texture!==ft)&&(K!==J&&(e.activeTexture(J),K=J),e.bindTexture(N,ft||X[N]),dt.type=N,dt.texture=ft)}function fe(){let N=st[K];N!==void 0&&N.type!==void 0&&(e.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function Vt(){try{e.compressedTexImage2D(...arguments)}catch(N){Pt("WebGLState:",N)}}function C(){try{e.compressedTexImage3D(...arguments)}catch(N){Pt("WebGLState:",N)}}function _(){try{e.texSubImage2D(...arguments)}catch(N){Pt("WebGLState:",N)}}function B(){try{e.texSubImage3D(...arguments)}catch(N){Pt("WebGLState:",N)}}function F(){try{e.compressedTexSubImage2D(...arguments)}catch(N){Pt("WebGLState:",N)}}function q(){try{e.compressedTexSubImage3D(...arguments)}catch(N){Pt("WebGLState:",N)}}function rt(){try{e.texStorage2D(...arguments)}catch(N){Pt("WebGLState:",N)}}function lt(){try{e.texStorage3D(...arguments)}catch(N){Pt("WebGLState:",N)}}function Y(){try{e.texImage2D(...arguments)}catch(N){Pt("WebGLState:",N)}}function $(){try{e.texImage3D(...arguments)}catch(N){Pt("WebGLState:",N)}}function ut(N){return p[N]!==void 0?p[N]:e.getParameter(N)}function Ct(N,ft){p[N]!==ft&&(e.pixelStorei(N,ft),p[N]=ft)}function pt(N){xe.equals(N)===!1&&(e.scissor(N.x,N.y,N.z,N.w),xe.copy(N))}function ht(N){Qt.equals(N)===!1&&(e.viewport(N.x,N.y,N.z,N.w),Qt.copy(N))}function Dt(N,ft){let J=c.get(ft);J===void 0&&(J=new WeakMap,c.set(ft,J));let dt=J.get(N);dt===void 0&&(dt=e.getUniformBlockIndex(ft,N.name),J.set(N,dt))}function Lt(N,ft){let dt=c.get(ft).get(N);l.get(ft)!==dt&&(e.uniformBlockBinding(ft,dt,N.__bindingPointIndex),l.set(ft,dt))}function Ft(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),f={},p={},K=null,st={},u={},d=new WeakMap,v=[],E=null,m=!1,h=null,g=null,M=null,y=null,b=null,T=null,w=null,x=new Wt(0,0,0),A=0,R=!1,I=null,z=null,G=null,O=null,k=null,xe.set(0,0,e.canvas.width,e.canvas.height),Qt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:j,disable:xt,bindFramebuffer:wt,drawBuffers:vt,useProgram:qt,setBlending:oe,setMaterial:Me,setFlipSided:Yt,setCullFace:Bt,setLineWidth:zt,setPolygonOffset:Jt,setScissorTest:le,activeTexture:ge,bindTexture:L,unbindTexture:fe,compressedTexImage2D:Vt,compressedTexImage3D:C,texImage2D:Y,texImage3D:$,pixelStorei:Ct,getParameter:ut,updateUBOMapping:Dt,uniformBlockBinding:Lt,texStorage2D:rt,texStorage3D:lt,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:F,compressedTexSubImage3D:q,scissor:pt,viewport:ht,reset:Ft}}function X3(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new $t,f=new WeakMap,p=new Set,u,d=new WeakMap,v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function E(C,_){return v?new OffscreenCanvas(C,_):fc("canvas")}function m(C,_,B){let F=1,q=Vt(C);if((q.width>B||q.height>B)&&(F=B/Math.max(q.width,q.height)),F<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let rt=Math.floor(F*q.width),lt=Math.floor(F*q.height);u===void 0&&(u=E(rt,lt));let Y=_?E(rt,lt):u;return Y.width=rt,Y.height=lt,Y.getContext("2d").drawImage(C,0,0,rt,lt),It("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+rt+"x"+lt+")."),Y}else return"data"in C&&It("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),C;return C}function h(C){return C.generateMipmaps}function g(C){e.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?e.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(C,_,B,F,q,rt=!1){if(C!==null){if(e[C]!==void 0)return e[C];It("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let lt;F&&(lt=t.get("EXT_texture_norm16"),lt||It("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=_;if(_===e.RED&&(B===e.FLOAT&&(Y=e.R32F),B===e.HALF_FLOAT&&(Y=e.R16F),B===e.UNSIGNED_BYTE&&(Y=e.R8),B===e.UNSIGNED_SHORT&&lt&&(Y=lt.R16_EXT),B===e.SHORT&&lt&&(Y=lt.R16_SNORM_EXT)),_===e.RED_INTEGER&&(B===e.UNSIGNED_BYTE&&(Y=e.R8UI),B===e.UNSIGNED_SHORT&&(Y=e.R16UI),B===e.UNSIGNED_INT&&(Y=e.R32UI),B===e.BYTE&&(Y=e.R8I),B===e.SHORT&&(Y=e.R16I),B===e.INT&&(Y=e.R32I)),_===e.RG&&(B===e.FLOAT&&(Y=e.RG32F),B===e.HALF_FLOAT&&(Y=e.RG16F),B===e.UNSIGNED_BYTE&&(Y=e.RG8),B===e.UNSIGNED_SHORT&&lt&&(Y=lt.RG16_EXT),B===e.SHORT&&lt&&(Y=lt.RG16_SNORM_EXT)),_===e.RG_INTEGER&&(B===e.UNSIGNED_BYTE&&(Y=e.RG8UI),B===e.UNSIGNED_SHORT&&(Y=e.RG16UI),B===e.UNSIGNED_INT&&(Y=e.RG32UI),B===e.BYTE&&(Y=e.RG8I),B===e.SHORT&&(Y=e.RG16I),B===e.INT&&(Y=e.RG32I)),_===e.RGB_INTEGER&&(B===e.UNSIGNED_BYTE&&(Y=e.RGB8UI),B===e.UNSIGNED_SHORT&&(Y=e.RGB16UI),B===e.UNSIGNED_INT&&(Y=e.RGB32UI),B===e.BYTE&&(Y=e.RGB8I),B===e.SHORT&&(Y=e.RGB16I),B===e.INT&&(Y=e.RGB32I)),_===e.RGBA_INTEGER&&(B===e.UNSIGNED_BYTE&&(Y=e.RGBA8UI),B===e.UNSIGNED_SHORT&&(Y=e.RGBA16UI),B===e.UNSIGNED_INT&&(Y=e.RGBA32UI),B===e.BYTE&&(Y=e.RGBA8I),B===e.SHORT&&(Y=e.RGBA16I),B===e.INT&&(Y=e.RGBA32I)),_===e.RGB&&(B===e.UNSIGNED_SHORT&&lt&&(Y=lt.RGB16_EXT),B===e.SHORT&&lt&&(Y=lt.RGB16_SNORM_EXT),B===e.UNSIGNED_INT_5_9_9_9_REV&&(Y=e.RGB9_E5),B===e.UNSIGNED_INT_10F_11F_11F_REV&&(Y=e.R11F_G11F_B10F)),_===e.RGBA){let $=rt?hc:se.getTransfer(q);B===e.FLOAT&&(Y=e.RGBA32F),B===e.HALF_FLOAT&&(Y=e.RGBA16F),B===e.UNSIGNED_BYTE&&(Y=$===Se?e.SRGB8_ALPHA8:e.RGBA8),B===e.UNSIGNED_SHORT&&lt&&(Y=lt.RGBA16_EXT),B===e.SHORT&&lt&&(Y=lt.RGBA16_SNORM_EXT),B===e.UNSIGNED_SHORT_4_4_4_4&&(Y=e.RGBA4),B===e.UNSIGNED_SHORT_5_5_5_1&&(Y=e.RGB5_A1)}return(Y===e.R16F||Y===e.R32F||Y===e.RG16F||Y===e.RG32F||Y===e.RGBA16F||Y===e.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function b(C,_){let B;return C?_===null||_===Gi||_===Yo?B=e.DEPTH24_STENCIL8:_===Ci?B=e.DEPTH32F_STENCIL8:_===qo&&(B=e.DEPTH24_STENCIL8,It("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Gi||_===Yo?B=e.DEPTH_COMPONENT24:_===Ci?B=e.DEPTH_COMPONENT32F:_===qo&&(B=e.DEPTH_COMPONENT16),B}function T(C,_){return h(C)===!0||C.isFramebufferTexture&&C.minFilter!==_n&&C.minFilter!==bn?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function w(C){let _=C.target;_.removeEventListener("dispose",w),A(_),_.isVideoTexture&&f.delete(_),_.isHTMLTexture&&p.delete(_)}function x(C){let _=C.target;_.removeEventListener("dispose",x),I(_)}function A(C){let _=i.get(C);if(_.__webglInit===void 0)return;let B=C.source,F=d.get(B);if(F){let q=F[_.__cacheKey];q.usedTimes--,q.usedTimes===0&&R(C),Object.keys(F).length===0&&d.delete(B)}i.remove(C)}function R(C){let _=i.get(C);e.deleteTexture(_.__webglTexture);let B=C.source,F=d.get(B);delete F[_.__cacheKey],r.memory.textures--}function I(C){let _=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let F=0;F<6;F++){if(Array.isArray(_.__webglFramebuffer[F]))for(let q=0;q<_.__webglFramebuffer[F].length;q++)e.deleteFramebuffer(_.__webglFramebuffer[F][q]);else e.deleteFramebuffer(_.__webglFramebuffer[F]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[F])}else{if(Array.isArray(_.__webglFramebuffer))for(let F=0;F<_.__webglFramebuffer.length;F++)e.deleteFramebuffer(_.__webglFramebuffer[F]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let F=0;F<_.__webglColorRenderbuffer.length;F++)_.__webglColorRenderbuffer[F]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[F]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=C.textures;for(let F=0,q=B.length;F<q;F++){let rt=i.get(B[F]);rt.__webglTexture&&(e.deleteTexture(rt.__webglTexture),r.memory.textures--),i.remove(B[F])}i.remove(C)}let z=0;function G(){z=0}function O(){return z}function k(C){z=C}function Q(){let C=z;return C>=s.maxTextures&&It("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),z+=1,C}function Z(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function nt(C,_){let B=i.get(C);if(C.isVideoTexture&&L(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let F=C.image;if(F===null)It("WebGLRenderer: Texture marked for update but no image data found.");else if(F.complete===!1)It("WebGLRenderer: Texture marked for update but image is incomplete");else{xt(B,C,_);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,B.__webglTexture,e.TEXTURE0+_)}function W(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){xt(B,C,_);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,B.__webglTexture,e.TEXTURE0+_)}function K(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){xt(B,C,_);return}n.bindTexture(e.TEXTURE_3D,B.__webglTexture,e.TEXTURE0+_)}function st(C,_){let B=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){wt(B,C,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,B.__webglTexture,e.TEXTURE0+_)}let Rt={[Kh]:e.REPEAT,[ns]:e.CLAMP_TO_EDGE,[Qh]:e.MIRRORED_REPEAT},At={[_n]:e.NEAREST,[_M]:e.NEAREST_MIPMAP_NEAREST,[Nc]:e.NEAREST_MIPMAP_LINEAR,[bn]:e.LINEAR,[bf]:e.LINEAR_MIPMAP_NEAREST,[Pa]:e.LINEAR_MIPMAP_LINEAR},xe={[SM]:e.NEVER,[AM]:e.ALWAYS,[MM]:e.LESS,[od]:e.LEQUAL,[bM]:e.EQUAL,[ld]:e.GEQUAL,[EM]:e.GREATER,[TM]:e.NOTEQUAL};function Qt(C,_){if(_.type===Ci&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===bn||_.magFilter===bf||_.magFilter===Nc||_.magFilter===Pa||_.minFilter===bn||_.minFilter===bf||_.minFilter===Nc||_.minFilter===Pa)&&It("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(C,e.TEXTURE_WRAP_S,Rt[_.wrapS]),e.texParameteri(C,e.TEXTURE_WRAP_T,Rt[_.wrapT]),(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)&&e.texParameteri(C,e.TEXTURE_WRAP_R,Rt[_.wrapR]),e.texParameteri(C,e.TEXTURE_MAG_FILTER,At[_.magFilter]),e.texParameteri(C,e.TEXTURE_MIN_FILTER,At[_.minFilter]),_.compareFunction&&(e.texParameteri(C,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(C,e.TEXTURE_COMPARE_FUNC,xe[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===_n||_.minFilter!==Nc&&_.minFilter!==Pa||_.type===Ci&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");e.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function re(C,_){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",w));let F=_.source,q=d.get(F);q===void 0&&(q={},d.set(F,q));let rt=Z(_);if(rt!==C.__cacheKey){q[rt]===void 0&&(q[rt]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,B=!0),q[rt].usedTimes++;let lt=q[C.__cacheKey];lt!==void 0&&(q[C.__cacheKey].usedTimes--,lt.usedTimes===0&&R(_)),C.__cacheKey=rt,C.__webglTexture=q[rt].texture}return B}function X(C,_,B){return Math.floor(Math.floor(C/B)/_)}function j(C,_,B,F){let rt=C.updateRanges;if(rt.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,_.width,_.height,B,F,_.data);else{rt.sort((Ct,pt)=>Ct.start-pt.start);let lt=0;for(let Ct=1;Ct<rt.length;Ct++){let pt=rt[lt],ht=rt[Ct],Dt=pt.start+pt.count,Lt=X(ht.start,_.width,4),Ft=X(pt.start,_.width,4);ht.start<=Dt+1&&Lt===Ft&&X(ht.start+ht.count-1,_.width,4)===Lt?pt.count=Math.max(pt.count,ht.start+ht.count-pt.start):(++lt,rt[lt]=ht)}rt.length=lt+1;let Y=n.getParameter(e.UNPACK_ROW_LENGTH),$=n.getParameter(e.UNPACK_SKIP_PIXELS),ut=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,_.width);for(let Ct=0,pt=rt.length;Ct<pt;Ct++){let ht=rt[Ct],Dt=Math.floor(ht.start/4),Lt=Math.ceil(ht.count/4),Ft=Dt%_.width,N=Math.floor(Dt/_.width),ft=Lt,J=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,Ft),n.pixelStorei(e.UNPACK_SKIP_ROWS,N),n.texSubImage2D(e.TEXTURE_2D,0,Ft,N,ft,J,B,F,_.data)}C.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,Y),n.pixelStorei(e.UNPACK_SKIP_PIXELS,$),n.pixelStorei(e.UNPACK_SKIP_ROWS,ut)}}function xt(C,_,B){let F=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(F=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(F=e.TEXTURE_3D);let q=re(C,_),rt=_.source;n.bindTexture(F,C.__webglTexture,e.TEXTURE0+B);let lt=i.get(rt);if(rt.version!==lt.__version||q===!0){if(n.activeTexture(e.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let J=se.getPrimaries(se.workingColorSpace),dt=_.colorSpace===Fs?null:se.getPrimaries(_.colorSpace),gt=_.colorSpace===Fs||J===dt?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt)}n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment);let $=m(_.image,!1,s.maxTextureSize);$=fe(_,$);let ut=a.convert(_.format,_.colorSpace),Ct=a.convert(_.type),pt=y(_.internalFormat,ut,Ct,_.normalized,_.colorSpace,_.isVideoTexture);Qt(F,_);let ht,Dt=_.mipmaps,Lt=_.isVideoTexture!==!0,Ft=lt.__version===void 0||q===!0,N=rt.dataReady,ft=T(_,$);if(_.isDepthTexture)pt=b(_.format===Ba,_.type),Ft&&(Lt?n.texStorage2D(e.TEXTURE_2D,1,pt,$.width,$.height):n.texImage2D(e.TEXTURE_2D,0,pt,$.width,$.height,0,ut,Ct,null));else if(_.isDataTexture)if(Dt.length>0){Lt&&Ft&&n.texStorage2D(e.TEXTURE_2D,ft,pt,Dt[0].width,Dt[0].height);for(let J=0,dt=Dt.length;J<dt;J++)ht=Dt[J],Lt?N&&n.texSubImage2D(e.TEXTURE_2D,J,0,0,ht.width,ht.height,ut,Ct,ht.data):n.texImage2D(e.TEXTURE_2D,J,pt,ht.width,ht.height,0,ut,Ct,ht.data);_.generateMipmaps=!1}else Lt?(Ft&&n.texStorage2D(e.TEXTURE_2D,ft,pt,$.width,$.height),N&&j(_,$,ut,Ct)):n.texImage2D(e.TEXTURE_2D,0,pt,$.width,$.height,0,ut,Ct,$.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Lt&&Ft&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ft,pt,Dt[0].width,Dt[0].height,$.depth);for(let J=0,dt=Dt.length;J<dt;J++)if(ht=Dt[J],_.format!==Ri)if(ut!==null)if(Lt){if(N)if(_.layerUpdates.size>0){let gt=f0(ht.width,ht.height,_.format,_.type);for(let it of _.layerUpdates){let bt=ht.data.subarray(it*gt/ht.data.BYTES_PER_ELEMENT,(it+1)*gt/ht.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,it,ht.width,ht.height,1,ut,bt)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,0,ht.width,ht.height,$.depth,ut,ht.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,J,pt,ht.width,ht.height,$.depth,0,ht.data,0,0);else It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Lt?N&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,J,0,0,0,ht.width,ht.height,$.depth,ut,Ct,ht.data):n.texImage3D(e.TEXTURE_2D_ARRAY,J,pt,ht.width,ht.height,$.depth,0,ut,Ct,ht.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Lt&&Ft&&n.texStorage2D(e.TEXTURE_2D,ft,pt,Dt[0].width,Dt[0].height);for(let J=0,dt=Dt.length;J<dt;J++)ht=Dt[J],_.format!==Ri?ut!==null?Lt?N&&n.compressedTexSubImage2D(e.TEXTURE_2D,J,0,0,ht.width,ht.height,ut,ht.data):n.compressedTexImage2D(e.TEXTURE_2D,J,pt,ht.width,ht.height,0,ht.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Lt?N&&n.texSubImage2D(e.TEXTURE_2D,J,0,0,ht.width,ht.height,ut,Ct,ht.data):n.texImage2D(e.TEXTURE_2D,J,pt,ht.width,ht.height,0,ut,Ct,ht.data)}else if(_.isDataArrayTexture)if(Lt){if(Ft&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ft,pt,$.width,$.height,$.depth),N)if(_.layerUpdates.size>0){let J=f0($.width,$.height,_.format,_.type);for(let dt of _.layerUpdates){let gt=$.data.subarray(dt*J/$.data.BYTES_PER_ELEMENT,(dt+1)*J/$.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,dt,$.width,$.height,1,ut,Ct,gt)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,$.width,$.height,$.depth,ut,Ct,$.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,pt,$.width,$.height,$.depth,0,ut,Ct,$.data);else if(_.isData3DTexture)Lt?(Ft&&n.texStorage3D(e.TEXTURE_3D,ft,pt,$.width,$.height,$.depth),N&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,$.width,$.height,$.depth,ut,Ct,$.data)):n.texImage3D(e.TEXTURE_3D,0,pt,$.width,$.height,$.depth,0,ut,Ct,$.data);else if(_.isFramebufferTexture){if(Ft)if(Lt)n.texStorage2D(e.TEXTURE_2D,ft,pt,$.width,$.height);else{let J=$.width,dt=$.height;for(let gt=0;gt<ft;gt++)n.texImage2D(e.TEXTURE_2D,gt,pt,J,dt,0,ut,Ct,null),J>>=1,dt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in e){let J=e.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),$.parentNode!==J){J.appendChild($),p.add(_),J.onpaint=dt=>{let gt=dt.changedElements;for(let it of p)gt.includes(it.image)&&(it.needsUpdate=!0)},J.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,$);else{let gt=e.RGBA,it=e.RGBA,bt=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,gt,it,bt,$)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Dt.length>0){if(Lt&&Ft){let J=Vt(Dt[0]);n.texStorage2D(e.TEXTURE_2D,ft,pt,J.width,J.height)}for(let J=0,dt=Dt.length;J<dt;J++)ht=Dt[J],Lt?N&&n.texSubImage2D(e.TEXTURE_2D,J,0,0,ut,Ct,ht):n.texImage2D(e.TEXTURE_2D,J,pt,ut,Ct,ht);_.generateMipmaps=!1}else if(Lt){if(Ft){let J=Vt($);n.texStorage2D(e.TEXTURE_2D,ft,pt,J.width,J.height)}N&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,ut,Ct,$)}else n.texImage2D(e.TEXTURE_2D,0,pt,ut,Ct,$);h(_)&&g(F),lt.__version=rt.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function wt(C,_,B){if(_.image.length!==6)return;let F=re(C,_),q=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+B);let rt=i.get(q);if(q.version!==rt.__version||F===!0){n.activeTexture(e.TEXTURE0+B);let lt=se.getPrimaries(se.workingColorSpace),Y=_.colorSpace===Fs?null:se.getPrimaries(_.colorSpace),$=_.colorSpace===Fs||lt===Y?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,$);let ut=_.isCompressedTexture||_.image[0].isCompressedTexture,Ct=_.image[0]&&_.image[0].isDataTexture,pt=[];for(let it=0;it<6;it++)!ut&&!Ct?pt[it]=m(_.image[it],!0,s.maxCubemapSize):pt[it]=Ct?_.image[it].image:_.image[it],pt[it]=fe(_,pt[it]);let ht=pt[0],Dt=a.convert(_.format,_.colorSpace),Lt=a.convert(_.type),Ft=y(_.internalFormat,Dt,Lt,_.normalized,_.colorSpace),N=_.isVideoTexture!==!0,ft=rt.__version===void 0||F===!0,J=q.dataReady,dt=T(_,ht);Qt(e.TEXTURE_CUBE_MAP,_);let gt;if(ut){N&&ft&&n.texStorage2D(e.TEXTURE_CUBE_MAP,dt,Ft,ht.width,ht.height);for(let it=0;it<6;it++){gt=pt[it].mipmaps;for(let bt=0;bt<gt.length;bt++){let Tt=gt[bt];_.format!==Ri?Dt!==null?N?J&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt,0,0,Tt.width,Tt.height,Dt,Tt.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt,Ft,Tt.width,Tt.height,0,Tt.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?J&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt,0,0,Tt.width,Tt.height,Dt,Lt,Tt.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt,Ft,Tt.width,Tt.height,0,Dt,Lt,Tt.data)}}}else{if(gt=_.mipmaps,N&&ft){gt.length>0&&dt++;let it=Vt(pt[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,dt,Ft,it.width,it.height)}for(let it=0;it<6;it++)if(Ct){N?J&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,pt[it].width,pt[it].height,Dt,Lt,pt[it].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,Ft,pt[it].width,pt[it].height,0,Dt,Lt,pt[it].data);for(let bt=0;bt<gt.length;bt++){let tt=gt[bt].image[it].image;N?J&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt+1,0,0,tt.width,tt.height,Dt,Lt,tt.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt+1,Ft,tt.width,tt.height,0,Dt,Lt,tt.data)}}else{N?J&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,Dt,Lt,pt[it]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,Ft,Dt,Lt,pt[it]);for(let bt=0;bt<gt.length;bt++){let Tt=gt[bt];N?J&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt+1,0,0,Dt,Lt,Tt.image[it]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,bt+1,Ft,Dt,Lt,Tt.image[it])}}}h(_)&&g(e.TEXTURE_CUBE_MAP),rt.__version=q.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function vt(C,_,B,F,q,rt){let lt=a.convert(B.format,B.colorSpace),Y=a.convert(B.type),$=y(B.internalFormat,lt,Y,B.normalized,B.colorSpace),ut=i.get(_),Ct=i.get(B);if(Ct.__renderTarget=_,!ut.__hasExternalTextures){let pt=Math.max(1,_.width>>rt),ht=Math.max(1,_.height>>rt);q===e.TEXTURE_3D||q===e.TEXTURE_2D_ARRAY?n.texImage3D(q,rt,$,pt,ht,_.depth,0,lt,Y,null):n.texImage2D(q,rt,$,pt,ht,0,lt,Y,null)}n.bindFramebuffer(e.FRAMEBUFFER,C),ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,F,q,Ct.__webglTexture,0,le(_)):(q===e.TEXTURE_2D||q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,F,q,Ct.__webglTexture,rt),n.bindFramebuffer(e.FRAMEBUFFER,null)}function qt(C,_,B){if(e.bindRenderbuffer(e.RENDERBUFFER,C),_.depthBuffer){let F=_.depthTexture,q=F&&F.isDepthTexture?F.type:null,rt=b(_.stencilBuffer,q),lt=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;ge(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,le(_),rt,_.width,_.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,le(_),rt,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,rt,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,lt,e.RENDERBUFFER,C)}else{let F=_.textures;for(let q=0;q<F.length;q++){let rt=F[q],lt=a.convert(rt.format,rt.colorSpace),Y=a.convert(rt.type),$=y(rt.internalFormat,lt,Y,rt.normalized,rt.colorSpace);ge(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,le(_),$,_.width,_.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,le(_),$,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,$,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Xe(C,_,B){let F=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let q=i.get(_.depthTexture);if(q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),F){if(q.__webglInit===void 0&&(q.__webglInit=!0,_.depthTexture.addEventListener("dispose",w)),q.__webglTexture===void 0){q.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Qt(e.TEXTURE_CUBE_MAP,_.depthTexture);let ut=a.convert(_.depthTexture.format),Ct=a.convert(_.depthTexture.type),pt;_.depthTexture.format===is?pt=e.DEPTH_COMPONENT24:_.depthTexture.format===Ba&&(pt=e.DEPTH24_STENCIL8);for(let ht=0;ht<6;ht++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,pt,_.width,_.height,0,ut,Ct,null)}}else nt(_.depthTexture,0);let rt=q.__webglTexture,lt=le(_),Y=F?e.TEXTURE_CUBE_MAP_POSITIVE_X+B:e.TEXTURE_2D,$=_.depthTexture.format===Ba?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(_.depthTexture.format===is)ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,Y,rt,0,lt):e.framebufferTexture2D(e.FRAMEBUFFER,$,Y,rt,0);else if(_.depthTexture.format===Ba)ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,Y,rt,0,lt):e.framebufferTexture2D(e.FRAMEBUFFER,$,Y,rt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function jt(C){let _=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let F=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),F){let q=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,F.removeEventListener("dispose",q)};F.addEventListener("dispose",q),_.__depthDisposeCallback=q}_.__boundDepthTexture=F}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let F=0;F<6;F++)Xe(_.__webglFramebuffer[F],C,F);else{let F=C.texture.mipmaps;F&&F.length>0?Xe(_.__webglFramebuffer[0],C,0):Xe(_.__webglFramebuffer,C,0)}else if(B){_.__webglDepthbuffer=[];for(let F=0;F<6;F++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[F]),_.__webglDepthbuffer[F]===void 0)_.__webglDepthbuffer[F]=e.createRenderbuffer(),qt(_.__webglDepthbuffer[F],C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=_.__webglDepthbuffer[F];e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,rt)}}else{let F=C.texture.mipmaps;if(F&&F.length>0?n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),qt(_.__webglDepthbuffer,C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,rt)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function oe(C,_,B){let F=i.get(C);_!==void 0&&vt(F.__webglFramebuffer,C,C.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),B!==void 0&&jt(C)}function Me(C){let _=C.texture,B=i.get(C),F=i.get(_);C.addEventListener("dispose",x);let q=C.textures,rt=C.isWebGLCubeRenderTarget===!0,lt=q.length>1;if(lt||(F.__webglTexture===void 0&&(F.__webglTexture=e.createTexture()),F.__version=_.version,r.memory.textures++),rt){B.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[Y]=[];for(let $=0;$<_.mipmaps.length;$++)B.__webglFramebuffer[Y][$]=e.createFramebuffer()}else B.__webglFramebuffer[Y]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let Y=0;Y<_.mipmaps.length;Y++)B.__webglFramebuffer[Y]=e.createFramebuffer()}else B.__webglFramebuffer=e.createFramebuffer();if(lt)for(let Y=0,$=q.length;Y<$;Y++){let ut=i.get(q[Y]);ut.__webglTexture===void 0&&(ut.__webglTexture=e.createTexture(),r.memory.textures++)}if(C.samples>0&&ge(C)===!1){B.__webglMultisampledFramebuffer=e.createFramebuffer(),B.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Y=0;Y<q.length;Y++){let $=q[Y];B.__webglColorRenderbuffer[Y]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,B.__webglColorRenderbuffer[Y]);let ut=a.convert($.format,$.colorSpace),Ct=a.convert($.type),pt=y($.internalFormat,ut,Ct,$.normalized,$.colorSpace,C.isXRRenderTarget===!0),ht=le(C);e.renderbufferStorageMultisample(e.RENDERBUFFER,ht,pt,C.width,C.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Y,e.RENDERBUFFER,B.__webglColorRenderbuffer[Y])}e.bindRenderbuffer(e.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=e.createRenderbuffer(),qt(B.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(rt){n.bindTexture(e.TEXTURE_CUBE_MAP,F.__webglTexture),Qt(e.TEXTURE_CUBE_MAP,_);for(let Y=0;Y<6;Y++)if(_.mipmaps&&_.mipmaps.length>0)for(let $=0;$<_.mipmaps.length;$++)vt(B.__webglFramebuffer[Y][$],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,$);else vt(B.__webglFramebuffer[Y],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);h(_)&&g(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(lt){for(let Y=0,$=q.length;Y<$;Y++){let ut=q[Y],Ct=i.get(ut),pt=e.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pt=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(pt,Ct.__webglTexture),Qt(pt,ut),vt(B.__webglFramebuffer,C,ut,e.COLOR_ATTACHMENT0+Y,pt,0),h(ut)&&g(pt)}n.unbindTexture()}else{let Y=e.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Y=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(Y,F.__webglTexture),Qt(Y,_),_.mipmaps&&_.mipmaps.length>0)for(let $=0;$<_.mipmaps.length;$++)vt(B.__webglFramebuffer[$],C,_,e.COLOR_ATTACHMENT0,Y,$);else vt(B.__webglFramebuffer,C,_,e.COLOR_ATTACHMENT0,Y,0);h(_)&&g(Y),n.unbindTexture()}C.depthBuffer&&jt(C)}function Yt(C){let _=C.textures;for(let B=0,F=_.length;B<F;B++){let q=_[B];if(h(q)){let rt=M(C),lt=i.get(q).__webglTexture;n.bindTexture(rt,lt),g(rt),n.unbindTexture()}}}let Bt=[],zt=[];function Jt(C){if(C.samples>0){if(ge(C)===!1){let _=C.textures,B=C.width,F=C.height,q=e.COLOR_BUFFER_BIT,rt=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,lt=i.get(C),Y=_.length>1;if(Y)for(let ut=0;ut<_.length;ut++)n.bindFramebuffer(e.FRAMEBUFFER,lt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,lt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,lt.__webglMultisampledFramebuffer);let $=C.texture.mipmaps;$&&$.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,lt.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,lt.__webglFramebuffer);for(let ut=0;ut<_.length;ut++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(q|=e.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(q|=e.STENCIL_BUFFER_BIT)),Y){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,lt.__webglColorRenderbuffer[ut]);let Ct=i.get(_[ut]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Ct,0)}e.blitFramebuffer(0,0,B,F,0,0,B,F,q,e.NEAREST),l===!0&&(Bt.length=0,zt.length=0,Bt.push(e.COLOR_ATTACHMENT0+ut),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(Bt.push(rt),zt.push(rt),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,zt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Bt))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),Y)for(let ut=0;ut<_.length;ut++){n.bindFramebuffer(e.FRAMEBUFFER,lt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,lt.__webglColorRenderbuffer[ut]);let Ct=i.get(_[ut]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,lt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,Ct,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,lt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let _=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function le(C){return Math.min(s.maxSamples,C.samples)}function ge(C){let _=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function L(C){let _=r.render.frame;f.get(C)!==_&&(f.set(C,_),C.update())}function fe(C,_){let B=C.colorSpace,F=C.format,q=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==uc&&B!==Fs&&(se.getTransfer(B)===Se?(F!==Ri||q!==Kn)&&It("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Pt("WebGLTextures: Unsupported texture color space:",B)),_}function Vt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=Q,this.resetTextureUnits=G,this.getTextureUnits=O,this.setTextureUnits=k,this.setTexture2D=nt,this.setTexture2DArray=W,this.setTexture3D=K,this.setTextureCube=st,this.rebindTextures=oe,this.setupRenderTarget=Me,this.updateRenderTargetMipmap=Yt,this.updateMultisampleRenderTarget=Jt,this.setupDepthRenderbuffer=jt,this.setupFrameBufferTexture=vt,this.useMultisampledRTT=ge,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function q3(e,t){function n(i,s=Fs){let a,r=se.getTransfer(s);if(i===Kn)return e.UNSIGNED_BYTE;if(i===Tf)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Af)return e.UNSIGNED_SHORT_5_5_5_1;if(i===n0)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===i0)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===t0)return e.BYTE;if(i===e0)return e.SHORT;if(i===qo)return e.UNSIGNED_SHORT;if(i===Ef)return e.INT;if(i===Gi)return e.UNSIGNED_INT;if(i===Ci)return e.FLOAT;if(i===ki)return e.HALF_FLOAT;if(i===s0)return e.ALPHA;if(i===a0)return e.RGB;if(i===Ri)return e.RGBA;if(i===is)return e.DEPTH_COMPONENT;if(i===Ba)return e.DEPTH_STENCIL;if(i===wf)return e.RED;if(i===Cf)return e.RED_INTEGER;if(i===za)return e.RG;if(i===Rf)return e.RG_INTEGER;if(i===Df)return e.RGBA_INTEGER;if(i===Ic||i===Oc||i===Pc||i===Bc)if(r===Se)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Ic)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Oc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Pc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Bc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Ic)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Oc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Pc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Bc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Uf||i===Lf||i===Nf||i===If)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Uf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Lf)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Nf)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===If)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Of||i===Pf||i===Bf||i===zf||i===Ff||i===zc||i===Hf)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Of||i===Pf)return r===Se?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Bf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===zf)return a.COMPRESSED_R11_EAC;if(i===Ff)return a.COMPRESSED_SIGNED_R11_EAC;if(i===zc)return a.COMPRESSED_RG11_EAC;if(i===Hf)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Vf||i===Gf||i===kf||i===Wf||i===Xf||i===qf||i===Yf||i===Zf||i===Jf||i===Kf||i===Qf||i===jf||i===$f||i===td)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===Vf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Gf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===kf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Wf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Xf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===qf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Yf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Zf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Jf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Kf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===jf)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===$f)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===td)return r===Se?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ed||i===nd||i===id)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===ed)return r===Se?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===nd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===id)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===sd||i===ad||i===Fc||i===rd)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===sd)return a.COMPRESSED_RED_RGTC1_EXT;if(i===ad)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Fc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===rd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Yo?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var Y3=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Z3=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,A0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new xc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new fi({vertexShader:Y3,fragmentShader:Z3,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Fe(new Ca(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},w0=class extends ss{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,f=null,p=null,u=null,d=null,v=null,E=typeof XRWebGLBinding<"u",m=new A0,h={},g=n.getContextAttributes(),M=null,y=null,b=[],T=[],w=new $t,x=null,A=null,R=new Bn;R.viewport=new We;let I=new Bn;I.viewport=new We;let z=[R,I],G=new yf,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let j=b[X];return j===void 0&&(j=new Vo,b[X]=j),j.getTargetRaySpace()},this.getControllerGrip=function(X){let j=b[X];return j===void 0&&(j=new Vo,b[X]=j),j.getGripSpace()},this.getHand=function(X){let j=b[X];return j===void 0&&(j=new Vo,b[X]=j),j.getHandSpace()};function Q(X){let j=T.indexOf(X.inputSource);if(j===-1)return;let xt=b[j];xt!==void 0&&(xt.update(X.inputSource,X.frame,c||r),xt.dispatchEvent({type:X.type,data:X.inputSource}))}function Z(){s.removeEventListener("select",Q),s.removeEventListener("selectstart",Q),s.removeEventListener("selectend",Q),s.removeEventListener("squeeze",Q),s.removeEventListener("squeezestart",Q),s.removeEventListener("squeezeend",Q),s.removeEventListener("end",Z),s.removeEventListener("inputsourceschange",nt);for(let X=0;X<b.length;X++){let j=T[X];j!==null&&(T[X]=null,b[X].disconnect(j))}O=null,k=null,m.reset();for(let X in h)delete h[X];if(t.setRenderTarget(M),d=null,u=null,p=null,s=null,y=null,re.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),A!==null){let X=A.camera;X.fov=A.fov,X.zoom=A.zoom,X.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){a=X,i.isPresenting===!0&&It("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,i.isPresenting===!0&&It("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&E&&(p=new XRWebGLBinding(s,n)),p},this.getFrame=function(){return v},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(M=t.getRenderTarget(),s.addEventListener("select",Q),s.addEventListener("selectstart",Q),s.addEventListener("selectend",Q),s.addEventListener("squeeze",Q),s.addEventListener("squeezestart",Q),s.addEventListener("squeezeend",Q),s.addEventListener("end",Z),s.addEventListener("inputsourceschange",nt),g.xrCompatible!==!0&&await n.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),E&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,wt=null,vt=null;g.depth&&(vt=g.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,xt=g.stencil?Ba:is,wt=g.stencil?Yo:Gi);let qt={colorFormat:n.RGBA8,depthFormat:vt,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(qt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new Jn(u.textureWidth,u.textureHeight,{format:Ri,type:Kn,depthTexture:new Aa(u.textureWidth,u.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xt={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,n,xt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Jn(d.framebufferWidth,d.framebufferHeight,{format:Ri,type:Kn,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),re.setContext(s),re.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function nt(X){for(let j=0;j<X.removed.length;j++){let xt=X.removed[j],wt=T.indexOf(xt);wt>=0&&(T[wt]=null,b[wt].disconnect(xt))}for(let j=0;j<X.added.length;j++){let xt=X.added[j],wt=T.indexOf(xt);if(wt===-1){for(let qt=0;qt<b.length;qt++)if(qt>=T.length){T.push(xt),wt=qt;break}else if(T[qt]===null){T[qt]=xt,wt=qt;break}if(wt===-1)break}let vt=b[wt];vt&&vt.connect(xt)}}let W=new H,K=new H;function st(X,j,xt){W.setFromMatrixPosition(j.matrixWorld),K.setFromMatrixPosition(xt.matrixWorld);let wt=W.distanceTo(K),vt=j.projectionMatrix.elements,qt=xt.projectionMatrix.elements,Xe=vt[14]/(vt[10]-1),jt=vt[14]/(vt[10]+1),oe=(vt[9]+1)/vt[5],Me=(vt[9]-1)/vt[5],Yt=(vt[8]-1)/vt[0],Bt=(qt[8]+1)/qt[0],zt=Xe*Yt,Jt=Xe*Bt,le=wt/(-Yt+Bt),ge=le*-Yt;if(j.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(ge),X.translateZ(le),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),vt[10]===-1)X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let L=Xe+le,fe=jt+le,Vt=zt-ge,C=Jt+(wt-ge),_=oe*jt/fe*L,B=Me*jt/fe*L;X.projectionMatrix.makePerspective(Vt,C,_,B,L,fe),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Rt(X,j){j===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(j.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let j=X.near,xt=X.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(xt=m.depthFar)),G.near=I.near=R.near=j,G.far=I.far=R.far=xt,(O!==G.near||k!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),O=G.near,k=G.far),G.layers.mask=X.layers.mask|6,R.layers.mask=G.layers.mask&-5,I.layers.mask=G.layers.mask&-3;let wt=X.parent,vt=G.cameras;Rt(G,wt);for(let qt=0;qt<vt.length;qt++)Rt(vt[qt],wt);vt.length===2?st(G,R,I):G.projectionMatrix.copy(R.projectionMatrix),A===null&&X.isPerspectiveCamera&&(A={camera:X,fov:X.fov,zoom:X.zoom}),At(X,G,wt)};function At(X,j,xt){xt===null?X.matrix.copy(j.matrixWorld):(X.matrix.copy(xt.matrixWorld),X.matrix.invert(),X.matrix.multiply(j.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=$h*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(X){l=X,u!==null&&(u.fixedFoveation=X),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=X)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(G)},this.getCameraTexture=function(X){return h[X]};let xe=null;function Qt(X,j){if(f=j.getViewerPose(c||r),v=j,f!==null){let xt=f.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let wt=!1;xt.length!==G.cameras.length&&(G.cameras.length=0,wt=!0);for(let jt=0;jt<xt.length;jt++){let oe=xt[jt],Me=null;if(d!==null)Me=d.getViewport(oe);else{let Bt=p.getViewSubImage(u,oe);Me=Bt.viewport,jt===0&&(t.setRenderTargetTextures(y,Bt.colorTexture,Bt.depthStencilTexture),t.setRenderTarget(y))}let Yt=z[jt];Yt===void 0&&(Yt=new Bn,Yt.layers.enable(jt),Yt.viewport=new We,z[jt]=Yt),Yt.matrix.fromArray(oe.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(oe.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(Me.x,Me.y,Me.width,Me.height),jt===0&&(G.matrix.copy(Yt.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),wt===!0&&G.cameras.push(Yt)}let vt=s.enabledFeatures;if(vt&&vt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&E){p=i.getBinding();let jt=p.getDepthInformation(xt[0]);jt&&jt.isValid&&jt.texture&&m.init(jt,s.renderState)}if(vt&&vt.includes("camera-access")&&E){t.state.unbindTexture(),p=i.getBinding();for(let jt=0;jt<xt.length;jt++){let oe=xt[jt].camera;if(oe){let Me=h[oe];Me||(Me=new xc,h[oe]=Me);let Yt=p.getCameraImage(oe);Me.sourceTexture=Yt}}}}for(let xt=0;xt<b.length;xt++){let wt=T[xt],vt=b[xt];wt!==null&&vt!==void 0&&vt.update(wt,j,c||r)}xe&&xe(X,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),v=null}let re=new ib;re.setAnimationLoop(Qt),this.setAnimationLoop=function(X){xe=X},this.dispose=function(){}}},J3=new Re,cb=new kt;cb.set(-1,0,0,0,1,0,0,0,1);function K3(e,t){function n(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function i(m,h){h.color.getRGB(m.fogColor.value,c0(e)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function s(m,h,g,M,y){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?a(m,h):h.isMeshLambertMaterial?(a(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(a(m,h),p(m,h)):h.isMeshPhongMaterial?(a(m,h),f(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(a(m,h),u(m,h),h.isMeshPhysicalMaterial&&d(m,h,y)):h.isMeshMatcapMaterial?(a(m,h),v(m,h)):h.isMeshDepthMaterial?a(m,h):h.isMeshDistanceMaterial?(a(m,h),E(m,h)):h.isMeshNormalMaterial?a(m,h):h.isLineBasicMaterial?(r(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,g,M):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function a(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,n(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===Tn&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,n(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===Tn&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,n(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,n(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,n(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);let g=t.get(h),M=g.envMap,y=g.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(J3.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(cb),m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,n(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,n(h.aoMap,m.aoMapTransform))}function r(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,g,M){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*g,m.scale.value=M*.5,h.map&&(m.map.value=h.map,n(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function f(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function p(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function u(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,n(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,n(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function d(m,h,g){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,n(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,n(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,n(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,n(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,n(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Tn&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.retroreflectivity>0&&(m.retroreflectivity.value=h.retroreflectivity),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,n(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,n(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,n(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,n(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,n(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,n(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,n(h.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,h){h.matcap&&(m.matcap.value=h.matcap)}function E(m,h){let g=t.get(h).light;m.referencePosition.value.setFromMatrixPosition(g.matrixWorld),m.nearDistance.value=g.shadow.camera.near,m.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Q3(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){let T=b.program;i.uniformBlockBinding(y,T)}function c(y,b){let T=s[y.id];T===void 0&&(m(y),T=f(y),s[y.id]=T,y.addEventListener("dispose",g));let w=b.program;i.updateUBOMapping(y,w);let x=t.render.frame;a[y.id]!==x&&(u(y),a[y.id]=x)}function f(y){let b=p();y.__bindingPointIndex=b;let T=e.createBuffer(),w=y.__size,x=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,T),e.bufferData(e.UNIFORM_BUFFER,w,x),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,b,T),T}function p(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return Pt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let b=s[y.id],T=y.uniforms,w=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,b);for(let x=0,A=T.length;x<A;x++){let R=T[x];if(Array.isArray(R))for(let I=0,z=R.length;I<z;I++)d(R[I],x,I,w);else d(R,x,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(y,b,T,w){if(E(y,b,T,w)===!0){let x=y.__offset,A=y.value;if(Array.isArray(A)){let R=0;for(let I=0;I<A.length;I++){let z=A[I],G=h(z);v(z,y.__data,R),typeof z!="number"&&typeof z!="boolean"&&!z.isMatrix3&&!ArrayBuffer.isView(z)&&(R+=G.storage/Float32Array.BYTES_PER_ELEMENT)}}else v(A,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,x,y.__data)}}function v(y,b,T){typeof y=="number"||typeof y=="boolean"?b[0]=y:y.isMatrix3?(b[0]=y.elements[0],b[1]=y.elements[1],b[2]=y.elements[2],b[3]=0,b[4]=y.elements[3],b[5]=y.elements[4],b[6]=y.elements[5],b[7]=0,b[8]=y.elements[6],b[9]=y.elements[7],b[10]=y.elements[8],b[11]=0):ArrayBuffer.isView(y)?b.set(new y.constructor(y.buffer,y.byteOffset,b.length)):y.toArray(b,T)}function E(y,b,T,w){let x=y.value,A=b+"_"+T;if(w[A]===void 0)return typeof x=="number"||typeof x=="boolean"?w[A]=x:ArrayBuffer.isView(x)?w[A]=x.slice():w[A]=x.clone(),!0;{let R=w[A];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return w[A]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(y){let b=y.uniforms,T=0,w=16;for(let A=0,R=b.length;A<R;A++){let I=Array.isArray(b[A])?b[A]:[b[A]];for(let z=0,G=I.length;z<G;z++){let O=I[z],k=Array.isArray(O.value)?O.value:[O.value];for(let Q=0,Z=k.length;Q<Z;Q++){let nt=k[Q],W=h(nt),K=T%w,st=K%W.boundary,Rt=K+st;T+=st,Rt!==0&&w-Rt<W.storage&&(T+=w-Rt),O.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=T,T+=W.storage}}}let x=T%w;return x>0&&(T+=w-x),y.__size=T,y.__cache={},this}function h(y){let b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?It("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(b.boundary=16,b.storage=y.byteLength):It("WebGLRenderer: Unsupported uniform value type.",y),b}function g(y){let b=y.target;b.removeEventListener("dispose",g);let T=r.indexOf(b.__bindingPointIndex);r.splice(T,1),e.deleteBuffer(s[b.id]),delete s[b.id],delete a[b.id]}function M(){for(let y in s)e.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:M}}var j3=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),us=null;function $3(){return us===null&&(us=new _c(j3,16,16,za,ki),us.name="DFG_LUT",us.minFilter=bn,us.magFilter=bn,us.wrapS=ns,us.wrapT=ns,us.generateMipmaps=!1,us.needsUpdate=!0),us}var fd=class{constructor(t={}){let{canvas:n=CM(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=Kn}=t;this.isWebGLRenderer=!0;let v;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=i.getContextAttributes().alpha}else v=r;let E=d,m=new Set([Df,Rf,Cf]),h=new Set([Kn,Gi,qo,Yo,Tf,Af]),g=new Uint32Array(4),M=new Int32Array(4),y=new H,b=null,T=null,w=[],x=[],A=null;this.domElement=n,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Vi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,z=null,G=null,O=null,k=null;this._outputColorSpace=Pn;let Q=0,Z=0,nt=null,W=-1,K=null,st=new We,Rt=new We,At=null,xe=new Wt(0),Qt=0,re=n.width,X=n.height,j=1,xt=null,wt=null,vt=new We(0,0,re,X),qt=new We(0,0,re,X),Xe=!1,jt=new Go,oe=!1,Me=!1,Yt=new Re,Bt=new H,zt=new We,Jt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},le=!1;function ge(){return nt===null?j:1}let L=i;function fe(S,U){return n.getContext(S,U)}let Vt,C,_,B,F,q,rt,lt,Y,$,ut,Ct,pt,ht,Dt,Lt,Ft,N,ft,J,dt,gt,it;try{let S={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"186"}`),n.addEventListener("webglcontextlost",tt,!1),n.addEventListener("webglcontextrestored",at,!1),n.addEventListener("webglcontextcreationerror",Ut,!1),L===null){let U="webgl2";if(L=fe(U,S),L===null)throw fe(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}bt()}catch(S){throw n.removeEventListener("webglcontextlost",tt,!1),n.removeEventListener("webglcontextrestored",at,!1),n.removeEventListener("webglcontextcreationerror",Ut,!1),Pt("WebGLRenderer: "+S.message),S}function bt(){Vt=new rR(L),Vt.init(),dt=new q3(L,Vt),C=new KC(L,Vt,t,dt),_=new W3(L,Vt),C.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),G=L.createFramebuffer(),O=L.createFramebuffer(),k=L.createFramebuffer(),B=new cR(L),F=new D3,q=new X3(L,Vt,_,F,C,dt,B),rt=new aR(R),lt=new hA(L),gt=new ZC(L,lt),Y=new oR(L,lt,B,gt),$=new hR(L,Y,lt,gt,B),N=new uR(L,C,q),Dt=new QC(F),ut=new R3(R,rt,Vt,C,gt,Dt),Ct=new K3(R,F),pt=new L3,ht=new z3(Vt),Ft=new YC(R,rt,_,$,v,l),Lt=new k3(R,$,C),it=new Q3(L,B,C,_),ft=new JC(L,Vt,B),J=new lR(L,Vt,B),B.programs=ut.programs,R.capabilities=C,R.extensions=Vt,R.properties=F,R.renderLists=pt,R.shadowMap=Lt,R.state=_,R.info=B}E!==Kn&&(A=new dR(E,n.width,n.height,o,s,a));let Tt=new w0(R,L);this.xr=Tt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let S=Vt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Vt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(S){S!==void 0&&(j=S,this.setSize(re,X,!1))},this.getSize=function(S){return S.set(re,X)},this.setSize=function(S,U,V=!0){if(Tt.isPresenting){It("WebGLRenderer: Can't change size while VR device is presenting.");return}re=S,X=U,n.width=Math.floor(S*j),n.height=Math.floor(U*j),V===!0&&(n.style.width=S+"px",n.style.height=U+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set(re*j,X*j).floor()},this.setDrawingBufferSize=function(S,U,V){re=S,X=U,j=V,n.width=Math.floor(S*V),n.height=Math.floor(U*V),this.setViewport(0,0,S,U)},this.setEffects=function(S){if(E===Kn){Pt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let U=0;U<S.length;U++)if(S[U].isOutputPass===!0){It("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(st)},this.getViewport=function(S){return S.copy(vt)},this.setViewport=function(S,U,V,D){S.isVector4?vt.set(S.x,S.y,S.z,S.w):vt.set(S,U,V,D),_.viewport(st.copy(vt).multiplyScalar(j).round())},this.getScissor=function(S){return S.copy(qt)},this.setScissor=function(S,U,V,D){S.isVector4?qt.set(S.x,S.y,S.z,S.w):qt.set(S,U,V,D),_.scissor(Rt.copy(qt).multiplyScalar(j).round())},this.getScissorTest=function(){return Xe},this.setScissorTest=function(S){_.setScissorTest(Xe=S)},this.setOpaqueSort=function(S){xt=S},this.setTransparentSort=function(S){wt=S},this.getClearColor=function(S){return S.copy(Ft.getClearColor())},this.setClearColor=function(){Ft.setClearColor(...arguments)},this.getClearAlpha=function(){return Ft.getClearAlpha()},this.setClearAlpha=function(){Ft.setClearAlpha(...arguments)},this.clear=function(S=!0,U=!0,V=!0){let D=0;if(S){let P=!1;if(nt!==null){let ct=nt.texture.format;P=m.has(ct)}if(P){let ct=nt.texture.type,_t=h.has(ct),ot=Ft.getClearColor(),yt=Ft.getClearAlpha(),Et=ot.r,Ht=ot.g,Gt=ot.b;_t?(g[0]=Et,g[1]=Ht,g[2]=Gt,g[3]=yt,L.clearBufferuiv(L.COLOR,0,g)):(M[0]=Et,M[1]=Ht,M[2]=Gt,M[3]=yt,L.clearBufferiv(L.COLOR,0,M))}else D|=L.COLOR_BUFFER_BIT}U&&(D|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),V&&(D|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D!==0&&L.clear(D)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),z=S},this.dispose=function(){n.removeEventListener("webglcontextlost",tt,!1),n.removeEventListener("webglcontextrestored",at,!1),n.removeEventListener("webglcontextcreationerror",Ut,!1),Ft.dispose(),pt.dispose(),ht.dispose(),F.dispose(),rt.dispose(),$.dispose(),gt.dispose(),it.dispose(),ut.dispose(),Tt.dispose(),Tt.removeEventListener("sessionstart",An),Tt.removeEventListener("sessionend",Fn),Ye.stop()};function tt(S){S.preventDefault(),l0("WebGLRenderer: Context Lost."),I=!0}function at(){l0("WebGLRenderer: Context Restored."),I=!1;let S=B.autoReset,U=Lt.enabled,V=Lt.autoUpdate,D=Lt.needsUpdate,P=Lt.type;bt(),B.autoReset=S,Lt.enabled=U,Lt.autoUpdate=V,Lt.needsUpdate=D,Lt.type=P}function Ut(S){Pt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function ce(S){let U=S.target;U.removeEventListener("dispose",ce),Nt(U)}function Nt(S){fn(S),F.remove(S)}function fn(S){let U=F.get(S).programs;U!==void 0&&(U.forEach(function(V){ut.releaseProgram(V)}),S.isShaderMaterial&&ut.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,V,D,P,ct){U===null&&(U=Jt);let _t=P.isMesh&&P.matrixWorld.determinantAffine()<0,ot=tl(S,U,V,D,P);_.setMaterial(D,_t);let yt=V.index,Et=1;if(D.wireframe===!0){if(yt=Y.getWireframeAttribute(V),yt===void 0)return;Et=2}let Ht=V.drawRange,Gt=V.attributes.position,Mt=Ht.start*Et,pe=(Ht.start+Ht.count)*Et;ct!==null&&(Mt=Math.max(Mt,ct.start*Et),pe=Math.min(pe,(ct.start+ct.count)*Et)),yt!==null?(Mt=Math.max(Mt,0),pe=Math.min(pe,yt.count)):Gt!=null&&(Mt=Math.max(Mt,0),pe=Math.min(pe,Gt.count));let Ve=pe-Mt;if(Ve<0||Ve===1/0)return;gt.setup(P,D,ot,V,yt);let ue,De=ft;if(yt!==null&&(ue=lt.get(yt),De=J,De.setIndex(ue)),P.isMesh)D.wireframe===!0?(_.setLineWidth(D.wireframeLinewidth*ge()),De.setMode(L.LINES)):De.setMode(L.TRIANGLES);else if(P.isLine){let wn=D.linewidth;wn===void 0&&(wn=1),_.setLineWidth(wn*ge()),P.isLineSegments?De.setMode(L.LINES):P.isLineLoop?De.setMode(L.LINE_LOOP):De.setMode(L.LINE_STRIP)}else P.isPoints?De.setMode(L.POINTS):P.isSprite&&De.setMode(L.TRIANGLES);if(P.isBatchedMesh)if(Vt.get("WEBGL_multi_draw"))De.renderMultiDraw(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount);else{let wn=P._multiDrawStarts,St=P._multiDrawCounts,Ln=P._multiDrawCount,me=yt?lt.get(yt).bytesPerElement:1,pi=F.get(D).currentProgram.getUniforms();for(let Xi=0;Xi<Ln;Xi++)pi.setValue(L,"_gl_DrawID",Xi),De.render(wn[Xi]/me,St[Xi])}else if(P.isInstancedMesh)De.renderInstances(Mt,Ve,P.count);else if(V.isInstancedBufferGeometry){let wn=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,St=Math.min(V.instanceCount,wn);De.renderInstances(Mt,Ve,St)}else De.render(Mt,Ve)};function qe(S,U,V,D){z!==null&&S.isNodeMaterial&&z.setObject(D,S),oe===!0&&Dt.setState(S,V,!1),S.transparent===!0&&S.side===ls&&S.forceSinglePass===!1?(S.side=Tn,S.needsUpdate=!0,Ui(S,U,D),S.side=Ia,S.needsUpdate=!0,Ui(S,U,D),S.side=ls):Ui(S,U,D)}this.compile=function(S,U,V=null){V===null&&(V=S),z!==null&&z.renderStart(S,U,V),T=ht.get(V),T.init(U),x.push(T),V.traverseVisible(function(P){P.isLight&&P.layers.test(U.layers)&&(T.pushLight(P),P.castShadow&&T.pushShadow(P))}),S!==V&&S.traverseVisible(function(P){P.isLight&&P.layers.test(U.layers)&&(T.pushLight(P),P.castShadow&&T.pushShadow(P))}),T.setupLights(),z!==null&&z.updateLights(T.state.lightsArray),Me=this.localClippingEnabled,oe=Dt.init(this.clippingPlanes,Me),oe===!0&&Dt.setGlobalState(this.clippingPlanes,U),z!==null&&Lt.render(T.state.shadowsArray,V,U);let D=new Set;return S.traverse(function(P){if(!(P.isMesh||P.isPoints||P.isLine||P.isSprite))return;let ct=P.material;if(ct)if(Array.isArray(ct))for(let _t=0;_t<ct.length;_t++){let ot=ct[_t];qe(ot,V,U,P),D.add(ot)}else qe(ct,V,U,P),D.add(ct)}),T=x.pop(),z!==null&&z.renderEnd(),D},this.compileAsync=function(S,U,V=null){let D=this.compile(S,U,V);return new Promise(P=>{function ct(){if(D.forEach(function(_t){let yt=F.get(_t).currentProgram;(yt===void 0||yt.isReady())&&D.delete(_t)}),D.size===0){P(S);return}setTimeout(ct,10)}Vt.get("KHR_parallel_shader_compile")!==null?ct():setTimeout(ct,10)})};let Qn=null;function $e(S){Qn&&Qn(S)}function An(){Ye.stop()}function Fn(){Ye.start()}let Ye=new ib;Ye.setAnimationLoop($e),typeof self<"u"&&Ye.setContext(self),this.setAnimationLoop=function(S){Qn=S,Tt.setAnimationLoop(S),S===null?Ye.stop():Ye.start()},Tt.addEventListener("sessionstart",An),Tt.addEventListener("sessionend",Fn),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){Pt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;z!==null&&z.renderStart(S,U);let V=Tt.enabled===!0&&Tt.isPresenting===!0,D=A!==null&&(nt===null||V)&&A.begin(R,nt);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Tt.enabled===!0&&Tt.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Tt.cameraAutoUpdate===!0&&Tt.updateCamera(U),U=Tt.getCamera()),S.isScene===!0&&S.onBeforeRender(R,S,U,nt),T=ht.get(S,x.length),T.init(U),T.state.textureUnits=q.getTextureUnits(),x.push(T),Yt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),jt.setFromProjectionMatrix(Yt,Fi,U.reversedDepth),Me=this.localClippingEnabled,oe=Dt.init(this.clippingPlanes,Me),b=pt.get(S,w.length),b.init(),w.push(b),Tt.enabled===!0&&Tt.isPresenting===!0){let _t=R.xr.getDepthSensingMesh();_t!==null&&on(_t,U,-1/0,R.sortObjects)}on(S,U,0,R.sortObjects),b.finish(),z!==null&&z.updateLights(T.state.lightsArray),R.sortObjects===!0&&b.sort(xt,wt),le=Tt.enabled===!1||Tt.isPresenting===!1||Tt.hasDepthSensing()===!1,le&&Ft.addToRenderList(b,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),oe===!0&&Dt.beginShadows();let P=T.state.shadowsArray;if(Lt.render(P,S,U),oe===!0&&Dt.endShadows(),(D&&A.hasRenderPass())===!1){let _t=b.opaque,ot=b.transmissive;if(T.setupLights(),U.isArrayCamera){let yt=U.cameras;if(ot.length>0)for(let Et=0,Ht=yt.length;Et<Ht;Et++){let Gt=yt[Et];Di(_t,ot,S,Gt)}le&&Ft.render(S);for(let Et=0,Ht=yt.length;Et<Ht;Et++){let Gt=yt[Et];jn(b,S,Gt,Gt.viewport)}}else ot.length>0&&Di(_t,ot,S,U),le&&Ft.render(S),jn(b,S,U)}nt!==null&&Z===0&&(q.updateMultisampleRenderTarget(nt),q.updateRenderTargetMipmap(nt)),D&&A.end(R),S.isScene===!0&&S.onAfterRender(R,S,U),gt.resetDefaultState(),W=-1,K=null,x.pop(),x.length>0?(T=x[x.length-1],q.setTextureUnits(T.state.textureUnits),oe===!0&&Dt.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,w.pop(),w.length>0?b=w[w.length-1]:b=null,z!==null&&z.renderEnd()};function on(S,U,V,D){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)V=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLightProbeGrid)T.pushLightProbeGrid(S);else if(S.isLight)T.pushLight(S),S.castShadow&&T.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(jt)){D&&zt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Yt);let _t=$.update(S),ot=S.material;ot.visible&&b.push(S,_t,ot,V,zt.z,null,U)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(jt))){let _t=$.update(S),ot=S.material;if(D&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),zt.copy(S.boundingSphere.center)):(_t.boundingSphere===null&&_t.computeBoundingSphere(),zt.copy(_t.boundingSphere.center)),zt.applyMatrix4(S.matrixWorld).applyMatrix4(Yt)),Array.isArray(ot)){let yt=_t.groups;for(let Et=0,Ht=yt.length;Et<Ht;Et++){let Gt=yt[Et],Mt=ot[Gt.materialIndex];Mt&&Mt.visible&&b.push(S,_t,Mt,V,zt.z,Gt,U)}}else ot.visible&&b.push(S,_t,ot,V,zt.z,null,U)}}let ct=S.children;for(let _t=0,ot=ct.length;_t<ot;_t++)on(ct[_t],U,V,D)}function jn(S,U,V,D){let{opaque:P,transmissive:ct,transparent:_t}=S;T.setupLightsView(V),oe===!0&&Dt.setGlobalState(R.clippingPlanes,V),D&&_.viewport(st.copy(D)),P.length>0&&Hs(P,U,V),ct.length>0&&Hs(ct,U,V),_t.length>0&&Hs(_t,U,V),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Di(S,U,V,D){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[D.id]===void 0){let Mt=Vt.has("EXT_color_buffer_half_float")||Vt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[D.id]=new Jn(1,1,{generateMipmaps:!0,type:Mt?ki:Kn,minFilter:Pa,samples:Math.max(4,C.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:se.workingColorSpace})}let ct=T.state.transmissionRenderTarget[D.id],_t=D.viewport||st;ct.setSize(_t.z*R.transmissionResolutionScale,_t.w*R.transmissionResolutionScale);let ot=R.getRenderTarget(),yt=R.getActiveCubeFace(),Et=R.getActiveMipmapLevel();R.setRenderTarget(ct),R.getClearColor(xe),Qt=R.getClearAlpha(),Qt<1&&R.setClearColor(16777215,.5),R.clear(),le&&Ft.render(V);let Ht=R.toneMapping;R.toneMapping=Vi;let Gt=D.viewport;if(D.viewport!==void 0&&(D.viewport=void 0),T.setupLightsView(D),oe===!0&&Dt.setGlobalState(R.clippingPlanes,D),Hs(S,V,D),q.updateMultisampleRenderTarget(ct),q.updateRenderTargetMipmap(ct),Vt.has("WEBGL_multisampled_render_to_texture")===!1){let Mt=!1;for(let pe=0,Ve=U.length;pe<Ve;pe++){let ue=U[pe],{object:De,geometry:wn,material:St,group:Ln}=ue;if(St.side===ls&&De.layers.test(D.layers)){let me=St.side;St.side=Tn,St.needsUpdate=!0,Va(De,V,D,wn,St,Ln),St.side=me,St.needsUpdate=!0,Mt=!0}}Mt===!0&&(q.updateMultisampleRenderTarget(ct),q.updateRenderTargetMipmap(ct))}R.setRenderTarget(ot,yt,Et),R.setClearColor(xe,Qt),Gt!==void 0&&(D.viewport=Gt),R.toneMapping=Ht}function Hs(S,U,V){let D=U.isScene===!0?U.overrideMaterial:null;for(let P=0,ct=S.length;P<ct;P++){let _t=S[P],{object:ot,geometry:yt,group:Et}=_t,Ht=_t.material;Ht.allowOverride===!0&&D!==null&&(Ht=D),ot.layers.test(V.layers)&&Va(ot,U,V,yt,Ht,Et)}}function Va(S,U,V,D,P,ct){z!==null&&P.isNodeMaterial&&z.setObject(S,P),S.onBeforeRender(R,U,V,D,P,ct),S.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),P.onBeforeRender(R,U,V,D,S,ct),P.transparent===!0&&P.side===ls&&P.forceSinglePass===!1?(P.side=Tn,P.needsUpdate=!0,R.renderBufferDirect(V,U,D,P,S,ct),P.side=Ia,P.needsUpdate=!0,R.renderBufferDirect(V,U,D,P,S,ct),P.side=ls):R.renderBufferDirect(V,U,D,P,S,ct),S.onAfterRender(R,U,V,D,P,ct)}function Ui(S,U,V){U.isScene!==!0&&(U=Jt);let D=F.get(S),P=T.state.lights,ct=T.state.shadowsArray,_t=P.state.version,ot=ut.getParameters(S,P.state,ct,U,V,T.state.lightProbeGridArray),yt=ut.getProgramCacheKey(ot),Et=D.programs;D.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?U.environment:null,D.fog=U.fog;let Ht=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;D.envMap=rt.get(S.envMap||D.environment,Ht),D.envMapRotation=D.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Et===void 0&&(S.addEventListener("dispose",ce),Et=new Map,D.programs=Et);let Gt=Et.get(yt);if(Gt!==void 0){if(D.currentProgram===Gt&&D.lightsStateVersion===_t)return fs(S,ot),Gt}else ot.uniforms=ut.getUniforms(S),z!==null&&S.isNodeMaterial&&z.build(S,V,ot),S.onBeforeCompile(ot,R),Gt=ut.acquireProgram(ot,yt),Et.set(yt,Gt),D.uniforms=ot.uniforms;let Mt=D.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Mt.clippingPlanes=Dt.uniform),fs(S,ot),D.needsLights=de(S),D.lightsStateVersion=_t,D.needsLights&&(Mt.ambientLightColor.value=P.state.ambient,Mt.lightProbe.value=P.state.probe,Mt.sunLights.value=P.state.sun,Mt.sunLightShadows.value=P.state.sunShadow,Mt.directionalLights.value=P.state.directional,Mt.directionalLightShadows.value=P.state.directionalShadow,Mt.spotLights.value=P.state.spot,Mt.spotLightShadows.value=P.state.spotShadow,Mt.rectAreaLights.value=P.state.rectArea,Mt.ltc_1.value=P.state.rectAreaLTC1,Mt.ltc_2.value=P.state.rectAreaLTC2,Mt.pointLights.value=P.state.point,Mt.pointLightShadows.value=P.state.pointShadow,Mt.hemisphereLights.value=P.state.hemi,Mt.sunShadowMatrix.value=P.state.sunShadowMatrix,Mt.sunShadowCascade.value=P.state.sunShadowCascade,Mt.directionalShadowMatrix.value=P.state.directionalShadowMatrix,Mt.spotLightMatrix.value=P.state.spotLightMatrix,Mt.spotLightMap.value=P.state.spotLightMap,Mt.pointShadowMatrix.value=P.state.pointShadowMatrix),D.lightProbeGrid=T.state.lightProbeGridArray.length>0,D.currentProgram=Gt,D.uniformsList=null,Gt}function Tr(S){if(S.uniformsList===null){let U=S.currentProgram.getUniforms();S.uniformsList=Ko.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function fs(S,U){let V=F.get(S);V.outputColorSpace=U.outputColorSpace,V.batching=U.batching,V.batchingColor=U.batchingColor,V.instancing=U.instancing,V.instancingColor=U.instancingColor,V.instancingMorph=U.instancingMorph,V.skinning=U.skinning,V.morphTargets=U.morphTargets,V.morphNormals=U.morphNormals,V.morphColors=U.morphColors,V.morphTargetsCount=U.morphTargetsCount,V.numClippingPlanes=U.numClippingPlanes,V.numIntersection=U.numClipIntersection,V.vertexAlphas=U.vertexAlphas,V.vertexTangents=U.vertexTangents,V.toneMapping=U.toneMapping}function Wi(S,U){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;y.setFromMatrixPosition(U.matrixWorld);for(let V=0,D=S.length;V<D;V++){let P=S[V];if(P.texture!==null&&P.boundingBox.containsPoint(y))return P}return null}function tl(S,U,V,D,P){U.isScene!==!0&&(U=Jt),q.resetTextureUnits();let ct=U.fog,_t=D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial?U.environment:null,ot=nt===null?R.outputColorSpace:nt.isXRRenderTarget===!0?nt.texture.colorSpace:se.workingColorSpace,yt=D.isMeshStandardMaterial||D.isMeshLambertMaterial&&!D.envMap||D.isMeshPhongMaterial&&!D.envMap,Et=rt.get(D.envMap||_t,yt),Ht=D.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Gt=!!V.attributes.tangent&&(!!D.normalMap||D.anisotropy>0),Mt=!!V.morphAttributes.position,pe=!!V.morphAttributes.normal,Ve=!!V.morphAttributes.color,ue=Vi;D.toneMapped&&(nt===null||nt.isXRRenderTarget===!0)&&(ue=R.toneMapping);let De=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,wn=De!==void 0?De.length:0,St=F.get(D),Ln=T.state.lights;if(oe===!0&&(Me===!0||S!==K)){let Le=S===K&&D.id===W;Dt.setState(D,S,Le)}let me=!1;D.version===St.__version?(St.needsLights&&St.lightsStateVersion!==Ln.state.version||St.outputColorSpace!==ot||P.isBatchedMesh&&St.batching===!1||!P.isBatchedMesh&&St.batching===!0||P.isBatchedMesh&&St.batchingColor===!0&&P._colorsTexture===null||P.isBatchedMesh&&St.batchingColor===!1&&P._colorsTexture!==null||P.isInstancedMesh&&St.instancing===!1||!P.isInstancedMesh&&St.instancing===!0||P.isSkinnedMesh&&St.skinning===!1||!P.isSkinnedMesh&&St.skinning===!0||P.isInstancedMesh&&St.instancingColor===!0&&P.instanceColor===null||P.isInstancedMesh&&St.instancingColor===!1&&P.instanceColor!==null||P.isInstancedMesh&&St.instancingMorph===!0&&P.morphTexture===null||P.isInstancedMesh&&St.instancingMorph===!1&&P.morphTexture!==null||St.envMap!==Et||D.fog===!0&&St.fog!==ct||St.numClippingPlanes!==void 0&&(St.numClippingPlanes!==Dt.numPlanes||St.numIntersection!==Dt.numIntersection)||St.vertexAlphas!==Ht||St.vertexTangents!==Gt||St.morphTargets!==Mt||St.morphNormals!==pe||St.morphColors!==Ve||St.toneMapping!==ue||St.morphTargetsCount!==wn||!!St.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(me=!0):(me=!0,St.__version=D.version);let pi=St.currentProgram;me===!0&&(pi=Ui(D,U,P),z&&D.isNodeMaterial&&z.onUpdateProgram(D,pi,St));let Xi=!1,Vs=!1,Ar=!1,Te=pi.getUniforms(),Ke=St.uniforms;if(_.useProgram(pi.program)&&(Xi=!0,Vs=!0,Ar=!0),D.id!==W&&(W=D.id,Vs=!0),St.needsLights){let Le=Wi(T.state.lightProbeGridArray,P);St.lightProbeGrid!==Le&&(St.lightProbeGrid=Le,Vs=!0)}if(Xi||K!==S){_.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),Te.setValue(L,"projectionMatrix",S.projectionMatrix),Te.setValue(L,"viewMatrix",S.matrixWorldInverse);let ks=Te.map.cameraPosition;ks!==void 0&&ks.setValue(L,Bt.setFromMatrixPosition(S.matrixWorld)),C.logarithmicDepthBuffer&&Te.setValue(L,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(D.isMeshPhongMaterial||D.isMeshToonMaterial||D.isMeshLambertMaterial||D.isMeshBasicMaterial||D.isMeshStandardMaterial||D.isShaderMaterial)&&Te.setValue(L,"isOrthographic",S.isOrthographicCamera===!0),K!==S&&(K=S,Vs=!0,Ar=!0)}if(St.needsLights&&(Ln.state.sunShadowMap.length>0&&Te.setValue(L,"sunShadowMap",Ln.state.sunShadowMap,q),Ln.state.directionalShadowMap.length>0&&Te.setValue(L,"directionalShadowMap",Ln.state.directionalShadowMap,q),Ln.state.spotShadowMap.length>0&&Te.setValue(L,"spotShadowMap",Ln.state.spotShadowMap,q),Ln.state.pointShadowMap.length>0&&Te.setValue(L,"pointShadowMap",Ln.state.pointShadowMap,q)),P.isSkinnedMesh){Te.setOptional(L,P,"bindMatrix"),Te.setOptional(L,P,"bindMatrixInverse");let Le=P.skeleton;Le&&(Le.boneTexture===null&&Le.computeBoneTexture(),Te.setValue(L,"boneTexture",Le.boneTexture,q))}P.isBatchedMesh&&(Te.setOptional(L,P,"batchingTexture"),Te.setValue(L,"batchingTexture",P._matricesTexture,q),Te.setOptional(L,P,"batchingIdTexture"),Te.setValue(L,"batchingIdTexture",P._indirectTexture,q),Te.setOptional(L,P,"batchingColorTexture"),P._colorsTexture!==null&&Te.setValue(L,"batchingColorTexture",P._colorsTexture,q));let Gs=V.morphAttributes;if((Gs.position!==void 0||Gs.normal!==void 0||Gs.color!==void 0)&&N.update(P,V,pi),(Vs||St.receiveShadow!==P.receiveShadow)&&(St.receiveShadow=P.receiveShadow,Te.setValue(L,"receiveShadow",P.receiveShadow)),(D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial)&&D.envMap===null&&U.environment!==null&&(Ke.envMapIntensity.value=U.environmentIntensity),Ke.dfgLUT!==void 0&&(Ke.dfgLUT.value=$3()),Vs){if(Te.setValue(L,"toneMappingExposure",R.toneMappingExposure),St.needsLights&&te(Ke,Ar),ct&&D.fog===!0&&Ct.refreshFogUniforms(Ke,ct),Ct.refreshMaterialUniforms(Ke,D,j,X,T.state.transmissionRenderTarget[S.id]),St.needsLights&&St.lightProbeGrid){let Le=St.lightProbeGrid;Ke.probesSH.value=Le.texture,Ke.probesMin.value.copy(Le.boundingBox.min),Ke.probesMax.value.copy(Le.boundingBox.max),Ke.probesResolution.value.copy(Le.resolution)}Ko.upload(L,Tr(St),Ke,q)}if(D.isShaderMaterial&&D.uniformsNeedUpdate===!0&&(Ko.upload(L,Tr(St),Ke,q),D.uniformsNeedUpdate=!1),D.isSpriteMaterial&&Te.setValue(L,"center",P.center),Te.setValue(L,"modelViewMatrix",P.modelViewMatrix),Te.setValue(L,"normalMatrix",P.normalMatrix),Te.setValue(L,"modelMatrix",P.matrixWorld),D.uniformsGroups!==void 0){let Le=D.uniformsGroups;for(let ks=0,wr=Le.length;ks<wr;ks++){let D0=Le[ks];it.update(D0,pi),it.bind(D0,pi)}}return pi}function te(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.sunLights.needsUpdate=U,S.sunLightShadows.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function de(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return Z},this.getRenderTarget=function(){return nt},this.setRenderTargetTextures=function(S,U,V){let D=F.get(S);D.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,D.__autoAllocateDepthBuffer===!1&&(D.__useRenderToTexture=!1),F.get(S.texture).__webglTexture=U,F.get(S.depthTexture).__webglTexture=D.__autoAllocateDepthBuffer?void 0:V,D.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,U){let V=F.get(S);V.__webglFramebuffer=U,V.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(S,U=0,V=0){nt=S,Q=U,Z=V;let D=null,P=!1,ct=!1;if(S){let ot=F.get(S);if(ot.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(L.FRAMEBUFFER,ot.__webglFramebuffer),st.copy(S.viewport),Rt.copy(S.scissor),At=S.scissorTest,_.viewport(st),_.scissor(Rt),_.setScissorTest(At),W=-1;return}else if(ot.__webglFramebuffer===void 0)q.setupRenderTarget(S);else if(ot.__hasExternalTextures)q.rebindTextures(S,F.get(S.texture).__webglTexture,F.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Ht=S.depthTexture;if(ot.__boundDepthTexture!==Ht){if(Ht!==null&&F.has(Ht)&&(S.width!==Ht.image.width||S.height!==Ht.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");q.setupDepthRenderbuffer(S)}}let yt=S.texture;(yt.isData3DTexture||yt.isDataArrayTexture||yt.isCompressedArrayTexture)&&(ct=!0);let Et=F.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Et[U])?D=Et[U][V]:D=Et[U],P=!0):S.samples>0&&q.useMultisampledRTT(S)===!1?D=F.get(S).__webglMultisampledFramebuffer:Array.isArray(Et)?D=Et[V]:D=Et,st.copy(S.viewport),Rt.copy(S.scissor),At=S.scissorTest}else st.copy(vt).multiplyScalar(j).floor(),Rt.copy(qt).multiplyScalar(j).floor(),At=Xe;if(V!==0&&(D=G),_.bindFramebuffer(L.FRAMEBUFFER,D)&&_.drawBuffers(S,D),_.viewport(st),_.scissor(Rt),_.setScissorTest(At),P){let ot=F.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+U,ot.__webglTexture,V)}else if(ct){let ot=U;for(let yt=0;yt<S.textures.length;yt++){let Et=F.get(S.textures[yt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+yt,Et.__webglTexture,V,ot)}}else if(S!==null&&V!==0){let ot=F.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ot.__webglTexture,V)}W=-1};function tn(S){let U=F.get(S);return(U.__readFormat!==S.format||U.__readType!==S.type)&&(U.__readFormat=S.format,U.__readType=S.type,U.__formatReadable=C.textureFormatReadable(S.format),U.__typeReadable=C.textureTypeReadable(S.type)),U}this.readRenderTargetPixels=function(S,U,V,D,P,ct,_t,ot=0){if(!(S&&S.isWebGLRenderTarget)){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=F.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&_t!==void 0&&(yt=yt[_t]),yt){_.bindFramebuffer(L.FRAMEBUFFER,yt);try{let Et=S.textures[ot],Ht=Et.format,Gt=Et.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ot);let Mt=tn(Et);if(Mt.__formatReadable===!1){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Mt.__typeReadable===!1){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-D&&V>=0&&V<=S.height-P&&L.readPixels(U,V,D,P,dt.convert(Ht),dt.convert(Gt),ct)}finally{let Et=nt!==null?F.get(nt).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(S,U,V,D,P,ct,_t,ot=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let yt=F.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&_t!==void 0&&(yt=yt[_t]),yt)if(U>=0&&U<=S.width-D&&V>=0&&V<=S.height-P){_.bindFramebuffer(L.FRAMEBUFFER,yt);let Et=S.textures[ot],Ht=Et.format,Gt=Et.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ot);let Mt=tn(Et);if(Mt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Mt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let pe=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,pe),L.bufferData(L.PIXEL_PACK_BUFFER,ct.byteLength,L.STREAM_READ),L.readPixels(U,V,D,P,dt.convert(Ht),dt.convert(Gt),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Ve=nt!==null?F.get(nt).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,Ve);let ue=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await DM(L,ue,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,pe),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ct),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(pe),L.deleteSync(ue),ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,U=null,V=0){let D=Math.pow(2,-V),P=Math.floor(S.image.width*D),ct=Math.floor(S.image.height*D),_t=U!==null?U.x:0,ot=U!==null?U.y:0;q.setTexture2D(S,0),L.copyTexSubImage2D(L.TEXTURE_2D,V,0,0,_t,ot,P,ct),_.unbindTexture()},this.copyTextureToTexture=function(S,U,V=null,D=null,P=0,ct=0){let _t,ot,yt,Et,Ht,Gt,Mt,pe,Ve,ue=S.isCompressedTexture?S.mipmaps[ct]:S.image;if(V!==null)_t=V.max.x-V.min.x,ot=V.max.y-V.min.y,yt=V.isBox3?V.max.z-V.min.z:1,Et=V.min.x,Ht=V.min.y,Gt=V.isBox3?V.min.z:0;else{let Ke=Math.pow(2,-P);_t=Math.floor(ue.width*Ke),ot=Math.floor(ue.height*Ke),S.isDataArrayTexture?yt=ue.depth:S.isData3DTexture?yt=Math.floor(ue.depth*Ke):yt=1,Et=0,Ht=0,Gt=0}D!==null?(Mt=D.x,pe=D.y,Ve=D.z):(Mt=0,pe=0,Ve=0);let De=dt.convert(U.format),wn=dt.convert(U.type),St;U.isData3DTexture?(q.setTexture3D(U,0),St=L.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(q.setTexture2DArray(U,0),St=L.TEXTURE_2D_ARRAY):(q.setTexture2D(U,0),St=L.TEXTURE_2D),_.activeTexture(L.TEXTURE0),_.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,U.flipY),_.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),_.pixelStorei(L.UNPACK_ALIGNMENT,U.unpackAlignment);let Ln=_.getParameter(L.UNPACK_ROW_LENGTH),me=_.getParameter(L.UNPACK_IMAGE_HEIGHT),pi=_.getParameter(L.UNPACK_SKIP_PIXELS),Xi=_.getParameter(L.UNPACK_SKIP_ROWS),Vs=_.getParameter(L.UNPACK_SKIP_IMAGES);_.pixelStorei(L.UNPACK_ROW_LENGTH,ue.width),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ue.height),_.pixelStorei(L.UNPACK_SKIP_PIXELS,Et),_.pixelStorei(L.UNPACK_SKIP_ROWS,Ht),_.pixelStorei(L.UNPACK_SKIP_IMAGES,Gt);let Ar=S.isDataArrayTexture||S.isData3DTexture,Te=U.isDataArrayTexture||U.isData3DTexture;if(S.isDepthTexture){let Ke=F.get(S),Gs=F.get(U),Le=F.get(Ke.__renderTarget),ks=F.get(Gs.__renderTarget);_.bindFramebuffer(L.READ_FRAMEBUFFER,Le.__webglFramebuffer),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,ks.__webglFramebuffer);for(let wr=0;wr<yt;wr++)Ar&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,F.get(S).__webglTexture,P,Gt+wr),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,F.get(U).__webglTexture,ct,Ve+wr)),L.blitFramebuffer(Et,Ht,_t,ot,Mt,pe,_t,ot,L.DEPTH_BUFFER_BIT,L.NEAREST);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(P!==0||S.isRenderTargetTexture||F.has(S)){let Ke=F.get(S),Gs=F.get(U);_.bindFramebuffer(L.READ_FRAMEBUFFER,O),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,k);for(let Le=0;Le<yt;Le++)Ar?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ke.__webglTexture,P,Gt+Le):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ke.__webglTexture,P),Te?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Gs.__webglTexture,ct,Ve+Le):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Gs.__webglTexture,ct),P!==0?L.blitFramebuffer(Et,Ht,_t,ot,Mt,pe,_t,ot,L.COLOR_BUFFER_BIT,L.NEAREST):Te?L.copyTexSubImage3D(St,ct,Mt,pe,Ve+Le,Et,Ht,_t,ot):L.copyTexSubImage2D(St,ct,Mt,pe,Et,Ht,_t,ot);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Te?S.isDataTexture||S.isData3DTexture?L.texSubImage3D(St,ct,Mt,pe,Ve,_t,ot,yt,De,wn,ue.data):U.isCompressedArrayTexture?L.compressedTexSubImage3D(St,ct,Mt,pe,Ve,_t,ot,yt,De,ue.data):L.texSubImage3D(St,ct,Mt,pe,Ve,_t,ot,yt,De,wn,ue):S.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ct,Mt,pe,_t,ot,De,wn,ue.data):S.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ct,Mt,pe,ue.width,ue.height,De,ue.data):L.texSubImage2D(L.TEXTURE_2D,ct,Mt,pe,_t,ot,De,wn,ue);_.pixelStorei(L.UNPACK_ROW_LENGTH,Ln),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,me),_.pixelStorei(L.UNPACK_SKIP_PIXELS,pi),_.pixelStorei(L.UNPACK_SKIP_ROWS,Xi),_.pixelStorei(L.UNPACK_SKIP_IMAGES,Vs),ct===0&&U.generateMipmaps&&L.generateMipmap(St),_.unbindTexture()},this.initRenderTarget=function(S){F.get(S).__webglFramebuffer===void 0&&q.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?q.setTextureCube(S,0):S.isData3DTexture?q.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?q.setTexture2DArray(S,0):q.setTexture2D(S,0),_.unbindTexture()},this.resetState=function(){Q=0,Z=0,nt=null,_.reset(),gt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=se._getDrawingBufferColorSpace(t),n.unpackColorSpace=se._getUnpackColorSpace()}};var md=class extends pr{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new wa;t.deleteAttribute("uv");let n=new gr({side:Tn}),i=new gr,s=new Cc(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let a=new Fe(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let r=new mr(t,i,6),o=new En;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),r.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),r.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),r.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),r.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),r.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),r.setMatrixAt(5,o.matrix),this.add(r);let l=new Fe(t,$o(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Fe(t,$o(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let f=new Fe(t,$o(17));f.position.set(14.904,12.198,-1.832),f.scale.set(.15,4.265,6.331),this.add(f);let p=new Fe(t,$o(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);let u=new Fe(t,$o(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,.1),this.add(u);let d=new Fe(t,$o(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let t=new Set;this.traverse(n=>{n.isMesh&&(t.add(n.geometry),t.add(n.material))});for(let n of t)n.dispose()}};function $o(e){return new bc({color:0,emissive:16777215,emissiveIntensity:e})}var gb=Yi(Sr()),Fa=8,i2=.7,s2=.6,db=16,_d=96,vd=48,a2=30,r2=["chrome","jelly","pearl","ink"],o2=["normal","difference","exclusion","multiply","screen","overlay"],l2='a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]',c2=`
#define BLOB_MAX ${vd}
uniform vec4 blobSeg[BLOB_MAX];
uniform vec4 blobInfo[BLOB_MAX];
uniform int blobCount;
uniform int blobHeadEnd;
uniform int blobTubeEnd;
uniform float blobJoin;
uniform float blobLift;
uniform float blobTop;
uniform float blobRef;
uniform vec2 blobDepth;
varying vec2 vBlobSpot;

vec4 blobPart(vec2 p, int i, float z) {
  vec4 seg = blobSeg[i];
  vec2 r = blobInfo[i].xy;
  vec2 axis = seg.zw - seg.xy;
  float len = length(axis);
  if (len <= abs(r.x - r.y) + 0.001) {
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);
  }
  vec2 dir = axis / len;
  vec2 rel = p - seg.xy;
  float u = dot(rel, dir);
  vec2 side = rel - dir * u;
  float w = sqrt(dot(side, side) + z * z);
  float b = (r.x - r.y) / len;
  float a = sqrt(1.0 - b * b);
  float along = a * u - b * w;
  vec3 f = vec3(a * w + b * u - r.x, a, b);
  if (along < 0.0) {
    float d = max(sqrt(w * w + u * u), 0.0001);
    f = vec3(d - r.x, w / d, u / d);
  } else if (along > a * len) {
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);
    f = vec3(d - r.y, w / d, (u - len) / d);
  }
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);
}

vec4 blobSmooth(vec4 a, vec4 b, float k) {
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));
}

vec4 blobShape(vec2 p, float z) {
  vec4 body = blobPart(p, 0, z);
  for (int i = 1; i < BLOB_MAX; i++) {
    if (i >= blobHeadEnd) break;
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);
  }
  if (blobTubeEnd > blobHeadEnd) {
    vec4 tube = blobPart(p, blobHeadEnd, z);
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {
      if (i >= blobTubeEnd) break;
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);
    }
    body = blobSmooth(body, tube, blobJoin);
  }
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {
    if (i >= blobCount) break;
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);
  }
  return body;
}
`,u2=`
  vec4 blobBase = blobShape(vBlobSpot, 0.0);
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);
  if (blobAlpha <= 0.0) discard;
  float blobLow = 0.0;
  float blobHigh = blobTop;
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);
  for (int k = 0; k < 8; k++) {
    vec4 blobTry = blobShape(vBlobSpot, blobZ);
    if (blobTry.x > 0.0) blobHigh = blobZ;
    else blobLow = blobZ;
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);
  }
  vec4 blobAt = blobShape(vBlobSpot, blobZ);
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;
`,h2=`
  float faceDirection = 1.0;
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);
  vec3 nonPerturbedNormal = normal;
`,pb=(e,t,n)=>{Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace("void main() {",`varying vec2 vBlobSpot;
void main() {`).replace("#include <project_vertex>",`#include <project_vertex>
	vBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;`),e.fragmentShader=e.fragmentShader.replace("void main() {",`${c2}
void main() {
${n}`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );").replace("#include <normal_fragment_begin>",h2)},He=(e,t,n)=>Math.min(n,Math.max(t,e)),ye=(e,t,n)=>e+(t-e)*n,C0=()=>({x:0,y:0,vx:0,vy:0,size:0}),f2=({material:e="chrome",color:t="#3B82F6",size:n=140,morph:i=0,morphSpeed:s=.4,depth:a=1,trail:r=16,lag:o=.55,goo:l=1,stretch:c=.6,wobble:f=1,drip:p=0,splash:u=!0,splashCount:d=6,splashSpeed:v=.5,splashSize:E=.5,splashGravity:m=0,regrow:h=.5,shine:g=1,shadow:M=!1,blend:y="normal",hideCursor:b=!0,className:T="",style:w})=>{let x=(0,Mr.useRef)(null),A=(0,Mr.useRef)(null),R=(0,Mr.useRef)(null);return A.current={material:r2.includes(e)?e:"chrome",color:t,size:He(n,12,400),morph:He(i,0,1),morphSpeed:He(s,0,1),depth:He(a,0,1),trail:He(Math.round(r),0,db),lag:He(o,0,1),goo:He(l,0,1),stretch:He(c,0,1),wobble:He(f,0,1),drip:He(p,0,1),splash:u,splashCount:He(Math.round(d),1,32),splashSpeed:He(v,0,1),splashSize:He(E,0,1),splashGravity:He(m,0,1),regrow:He(h,0,1),shine:He(g,0,1),shadow:M,blend:o2.includes(y)?y:"normal",hideCursor:b},(0,Mr.useEffect)(()=>{R.current?.()}),(0,Mr.useEffect)(()=>{let I=x.current;if(!I)return;let z;try{z=new fd({alpha:!0,antialias:!0,premultipliedAlpha:!0})}catch{return}z.setClearColor(0,0),z.outputColorSpace=Pn,z.toneMapping=Uc,z.toneMappingExposure=1,z.shadowMap.enabled=!0,z.shadowMap.type=Na,z.shadowMap.autoUpdate=!0;let G=z.domElement;G.className="block w-full h-full",G.setAttribute("aria-hidden","true"),I.appendChild(G);let O=new pr,k=new Qo(z),Q=new md,Z=k.fromScene(Q,.03);k.dispose(),O.environment=Z.texture,O.environmentRotation.set(-.9,.35,0);let nt=new La(-1,1,1,-1,1,6e3);nt.position.set(0,0,2e3);let W=new Rc(16777215,1.4);W.castShadow=!0,W.shadow.mapSize.set(2048,2048),W.shadow.radius=14,W.shadow.blurSamples=20,W.shadow.bias=-4e-4,O.add(W,W.target);let K={blobSeg:{value:new Float32Array(vd*4)},blobInfo:{value:new Float32Array(vd*4)},blobCount:{value:0},blobHeadEnd:{value:0},blobTubeEnd:{value:0},blobJoin:{value:0},blobLift:{value:1},blobTop:{value:1},blobRef:{value:1},blobDepth:{value:new $t((nt.position.z-nt.near)/(nt.far-nt.near),1/(nt.far-nt.near))}},st=tt=>pb(tt,K,u2),Rt=new ko({transparent:!0}),At=new Ta({transparent:!0});Rt.onBeforeCompile=st,At.onBeforeCompile=st;let xe=new Wo({depthPacking:r0});xe.onBeforeCompile=tt=>pb(tt,K,"if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;");let Qt=new ko,re=new Ta,X=new Fe(new Ca(1,1),Rt);X.castShadow=!0,X.frustumCulled=!1,X.customDepthMaterial=xe,O.add(X);let j=new Fe(new Ca(1,1),new Mc({opacity:.22}));j.receiveShadow=!0,O.add(j);let xt=new Sc(1,32,24),wt=new mr(xt,Qt,_d);wt.castShadow=!0,wt.frustumCulled=!1,wt.count=0,O.add(wt);let vt=new Re,qt=new wi,Xe=new H,jt=new H(1,0,0),oe=new H,Me=new H,Yt=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,Bt={width:1,height:1},zt={x:0,y:0,inside:!1,down:!1,hover:!1,seen:!1},Jt=C0(),le=Array.from({length:Fa},(tt,at)=>({...C0(),spread:at/(Fa-1),angle:at/Fa*Math.PI*2,shape:0,tx:0,ty:0,grow:1})),ge=Array.from({length:db},C0),L=[],fe={value:0,velocity:0},Vt={value:1,wait:0},C=Array.from({length:4},()=>Math.random()*Math.PI*2),_=Math.random()*60,B=0,F=0,q=0,rt=!0,lt=null,Y=0,$=()=>{Bt.width=Math.max(1,I.clientWidth),Bt.height=Math.max(1,I.clientHeight),z.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),z.setSize(Bt.width,Bt.height,!1),nt.left=-Bt.width/2,nt.right=Bt.width/2,nt.top=Bt.height/2,nt.bottom=-Bt.height/2,nt.updateProjectionMatrix();let tt=Math.max(Bt.width,Bt.height)*.75,at=W.shadow.camera;at.left=-tt,at.right=tt,at.top=tt,at.bottom=-tt,at.near=1,at.far=tt*6,at.updateProjectionMatrix(),j.scale.set(Bt.width*1.5,Bt.height*1.5,1),bt()},ut=()=>{let tt=A.current,at=new Wt;try{at.set(tt.color)}catch{at.set("#ffffff")}for(let Nt of[Rt,Qt])Nt.color.copy(at),Nt.metalness=0,Nt.roughness=.2,Nt.clearcoat=0,Nt.clearcoatRoughness=0,Nt.iridescence=0,Nt.envMapIntensity=1,tt.material==="chrome"?(Nt.metalness=1,Nt.roughness=ye(.3,.04,tt.shine),Nt.envMapIntensity=ye(.9,1.3,tt.shine)):tt.material==="jelly"?(Nt.roughness=ye(.5,.18,tt.shine),Nt.clearcoat=1,Nt.clearcoatRoughness=ye(.25,.02,tt.shine),Nt.envMapIntensity=ye(.5,.9,tt.shine)):tt.material==="pearl"&&(Nt.metalness=.35,Nt.roughness=ye(.4,.1,tt.shine),Nt.clearcoat=1,Nt.clearcoatRoughness=.05,Nt.iridescence=1,Nt.iridescenceIOR=1.75,Nt.iridescenceThicknessRange=[240,820],Nt.envMapIntensity=1.15),Nt.needsUpdate=!0;At.color.copy(at),re.color.copy(at);let Ut=tt.material==="ink";X.material=Ut?At:Rt,wt.material=Ut?re:Qt,j.material.opacity=.22,I.style.mixBlendMode=tt.blend;let ce=I.parentElement;if(tt.hideCursor&&ce&&!lt){let Nt=ce.style.cursor;ce.style.cursor="none",lt=()=>{ce.style.cursor=Nt}}else!tt.hideCursor&&lt&&(lt(),lt=null);bt()},Ct=(tt,at)=>{for(let Ut of[Jt,...le,...ge])Ut.x=tt,Ut.y=at,Ut.vx=0,Ut.vy=0},pt=tt=>{let at=I.getBoundingClientRect(),Ut=tt.clientX-at.left,ce=tt.clientY-at.top;return{x:Ut,y:ce,inside:Ut>=0&&ce>=0&&Ut<=at.width&&ce<=at.height}},ht=tt=>{if(tt.pointerType==="touch"&&!zt.down)return;let at=pt(tt);at.inside&&(!zt.inside||!zt.seen)&&fe.value<.05&&Ct(at.x,at.y),zt.x=at.x,zt.y=at.y,zt.inside=at.inside,zt.seen=!0;let Ut=tt.target instanceof Element?tt.target:null;zt.hover=at.inside&&!!Ut?.closest(l2),bt()},Dt=()=>{let tt=A.current,at=tt.size/2*Math.cbrt(Vt.value);for(let $e of le){let An=Math.random()*Math.PI*2,Fn=at*ye(4,9,Math.random())*ye(.6,1.2,tt.wobble);$e.vx+=Math.cos(An)*Fn,$e.vy+=Math.sin(An)*Fn}if(!tt.splash)return;let Ut=ye(.12,.42,tt.splashSize),ce=ye(320,1600,tt.splashSpeed),Nt=Math.random()*Math.PI*2,fn=[],qe=0;for(let $e=0;$e<tt.splashCount;$e++){let An=Nt+$e/tt.splashCount*Math.PI*2+(Math.random()-.5)*(Math.PI/tt.splashCount),Fn=Math.random(),Ye=ce*ye(1.3,.75,Fn)*ye(.85,1.15,Math.random()),on=tt.size/2*Ut*ye(.65,1.3,Fn),jn=Math.cos(An)*Ye+Jt.vx*.4,Di=Math.sin(An)*Ye+Jt.vy*.4;qe+=Math.pow(on/(tt.size/2),3),fn.push({x:Jt.x+Math.cos(An)*at*.35,y:Jt.y+Math.sin(An)*at*.35,vx:jn,vy:Di,cx:jn*.45,cy:Di*.45,r:on,share:0,age:0,life:a2,drag:.6,free:!1,sink:-1})}let Qn=Vt.value;Vt.value=Math.max(.2,Qn-He(qe*2.4,.25,.7)),Vt.wait=.28;for(let $e of fn)$e.share=(Qn-Vt.value)*Math.pow($e.r/(tt.size/2),3)/qe,L.length>=_d&&L.shift(),L.push($e)},Lt=tt=>{let at=pt(tt);at.inside&&(tt.pointerType==="touch"&&fe.value<.05&&Ct(at.x,at.y),zt.x=at.x,zt.y=at.y,zt.inside=!0,zt.seen=!0,zt.down=!0,fe.velocity-=2,Yt||Dt(),bt())},Ft=tt=>{zt.down&&(zt.down=!1,fe.velocity+=1.2,tt.pointerType==="touch"&&(zt.inside=!1),bt())},N=tt=>{tt.relatedTarget||(zt.inside=!1,zt.down=!1,bt())},ft=()=>{zt.inside=!1,zt.down=!1,bt()},J=(tt,at,Ut,ce,Nt,fn,qe=0,Qn=0)=>{tt.vx+=((at-tt.x)*ce-(tt.vx-qe)*Nt)*fn,tt.vy+=((Ut-tt.y)*ce-(tt.vy-Qn)*Nt)*fn,tt.x+=tt.vx*fn,tt.y+=tt.vy*fn},dt=tt=>{let at=A.current,Ut=at.size/2,ce=Math.max(1,Math.ceil(tt/(1/240))),Nt=tt/ce,fn=Yt?2400:ye(1200,160,at.lag),qe=ye(900,260,at.lag),Qn=ye(3e4,1500,at.stretch),$e=2*Math.sqrt(Qn)*ye(.95,.65,at.wobble),An=ye(.95,.4,at.wobble),Fn=zt.inside&&zt.seen,Ye=Fn?zt.down?.86:zt.hover?1.3:1:0;Yt||(_+=tt*4*Math.pow(at.morphSpeed,1.5));let on=at.morph*(.6+.4*Math.sin(_*.71+C[0])),jn=_*.23+C[1],Di=at.morph*.8*(.5+.5*Math.sin(_*.53+C[2])),Hs=C[3]-_*.17,Va=0;for(let te of le)te.shape=on*Math.cos(2*(te.angle-jn))+Di*Math.cos(3*(te.angle-Hs)),Va+=te.shape*te.shape/Fa;let Ui=1/(1+.3*Va);for(let te of le){let de=Ut*He(.14+.75*te.shape,0,.8)*Ui;te.tx=Math.cos(te.angle)*de,te.ty=Math.sin(te.angle)*de,te.grow=(1+.35*te.shape)*Ui}for(let te=0;te<ce;te++){J(Jt,zt.x,zt.y,fn,2*Math.sqrt(fn)*.9,Nt);for(let S of le){let U=qe*ye(1.3,.7,S.spread);J(S,Jt.x+S.tx,Jt.y+S.ty,U,2*Math.sqrt(U)*An,Nt,Jt.vx,Jt.vy)}for(let S=0;S<at.trail;S++){let U=S>0?ge[S-1]:Jt;J(ge[S],U.x,U.y,Qn,$e,Nt)}let de=at.splashGravity*2200,tn=1-Math.exp(-18*Nt);for(let S of L){if(S.age+=Nt,S.sink>=0){let V=Math.min(1,S.sink+Nt/.14);Vt.value=Math.min(1.35,Vt.value+S.share*(V-S.sink)),S.sink=V,S.x+=(Jt.x-S.x)*tn,S.y+=(Jt.y-S.y)*tn;continue}let U=Math.exp(-S.drag*Nt);S.vx=S.cx+(S.vx-S.cx)*U,S.vy=S.cy+(S.vy-S.cy)*U+de*Nt,S.x+=S.vx*Nt,S.y+=S.vy*Nt}fe.velocity+=((Ye-fe.value)*300-fe.velocity*2*Math.sqrt(300)*ye(.8,.38,at.wobble))*Nt,fe.value+=fe.velocity*Nt,fe.value<0&&(fe.value=0,fe.velocity=Math.max(0,fe.velocity))}let Tr=Ut*Math.max(fe.value,0)*Math.cbrt(Vt.value),fs=(te,de)=>de.some(tn=>tn.size>0&&Math.hypot(te.x-tn.x,te.y-tn.y)<tn.size+te.r*.9),Wi=at.trail>0?ge[at.trail-1]:le[Fa-1],tl=Math.hypot(Jt.vx,Jt.vy);for(Fn&&!Yt&&(B+=tt*at.drip*26*He((tl-600)/1800,0,1));B>=1;){B-=1;let te=Ut*ye(.07,.17,Math.random());if(Math.hypot(Wi.x-Jt.x,Wi.y-Jt.y)<Tr+te*2)continue;let de=Math.pow(te/Ut,3)*2.4;Vt.value=Math.max(.2,Vt.value-de),L.length>=_d&&L.shift(),L.push({x:Wi.x+(Math.random()-.5)*te,y:Wi.y+(Math.random()-.5)*te,vx:Wi.vx*.2,vy:Wi.vy*.2,cx:0,cy:0,r:te,share:de,age:0,life:ye(2.5,4,Math.random()),drag:9,free:!0,sink:-1})}for(let te=L.length-1;te>=0;te--){let de=L[te];if(de.free&&de.sink<0&&de.age>.3&&fe.value>.05&&(fs(de,le)||fs(de,ge))){de.sink=0;let U=Math.min(.5,de.share*4);for(let V of le)V.vx+=(de.vx-Jt.vx)*U,V.vy+=(de.vy-Jt.vy)*U}let tn=de.r*3;(de.x<-tn||de.y<-tn||de.x>Bt.width+tn||de.y>Bt.height+tn||de.sink>=1||de.age>de.life)&&L.splice(te,1)}Vt.wait>0?Vt.wait-=tt:Vt.value+=(1-Vt.value)*(1-Math.exp(-tt*ye(.9,6,at.regrow)))},gt=()=>{let tt=A.current,Ut=tt.size/2*Math.max(fe.value,0)*Math.cbrt(Vt.value),ce=Ut>=.5,Nt=Ut*ye(.3,.9,tt.goo),fn=Ut+Nt,qe=ye(.3,1,tt.depth),Qn=vd-Fa-tt.trail,$e=[],An=[];wt.count=0;for(let D of le)D.size=0;for(let D of ge)D.size=0;for(let D of L){let P=Math.hypot(D.x-Jt.x,D.y-Jt.y),ct=D.free||!ce?1:He((P-Ut*.55)/(Ut*.6),0,1),_t=Math.min(ct*ct*(3-2*ct),D.age/.06,(D.life-D.age)/.9),ot=D.r*_t*(D.sink<0?1:Math.cbrt(1-D.sink));if(ot<.6)continue;if(ce&&An.length<Qn&&(D.sink>=0||!D.free&&P<fn+ot)){let Gt=D.sink>=0?0:He((P-Ut*.6)/(fn+ot-Ut*.6),0,1);An.push([D.x,D.y,D.x,D.y,ot,ot,Math.min(Nt,ot*1.2)*(1-Gt*Gt*(3-2*Gt))]);continue}if(D.free=!0,wt.count>=_d)continue;let yt=Math.hypot(D.vx,D.vy),Et=ce?He((P-fn-ot)/(ot*2),0,1):1,Ht=1+Math.min(yt/2600,.6)*tt.stretch*Et;Xe.set(D.vx,-D.vy,0),yt>1?qt.setFromUnitVectors(jt,Xe.normalize()):qt.identity(),oe.set(D.x-Bt.width/2,Bt.height/2-D.y,0),Me.set(ot*Ht,ot/Math.sqrt(Ht),ot/Math.sqrt(Ht)*qe),vt.compose(oe,qt,Me),wt.setMatrixAt(wt.count,vt),wt.count++}wt.instanceMatrix.needsUpdate=!0;let Fn=-(tt.size/2)*.9*qe;if(j.position.set(0,0,Fn),W.target.position.set(0,0,Fn),W.position.set(-.42,.5,.76).multiplyScalar(Math.max(Bt.width,Bt.height)*2),!ce)return{blob:!1,spray:wt.count>0};for(let D of le){let P=Ut*i2*D.grow;D.size=P+Ut*.3,$e.push([D.x,D.y,D.x,D.y,P,P,Ut*s2])}let Ye=[Jt,...ge.slice(0,tt.trail)],on=[0];for(let D=1;D<Ye.length;D++)on.push(on[D-1]+Math.hypot(Ye[D].x-Ye[D-1].x,Ye[D].y-Ye[D-1].y));let jn=on[on.length-1],Di=He(jn/Ut,0,1),Hs=Ut*ye(.6,.95,Di*Di*(3-2*Di)),Va=ye(.75,1.6,He(jn/(Ut*6),0,1)),Ui=D=>ye(Ut*.1,Hs,Math.pow(1-D,Va)),Tr=D=>{let P=1;for(;P<on.length-1&&on[P]<D;)P++;let ct=on[P]-on[P-1],_t=ct>0?He((D-on[P-1])/ct,0,1):0;return[ye(Ye[P-1].x,Ye[P].x,_t),ye(Ye[P-1].y,Ye[P].y,_t)]};for(let D=0;D<tt.trail;D++)ge[D].size=Ui(jn>0?on[D+1]/jn:1);let fs=[Jt.x,Jt.y];for(let D=1;D<=tt.trail;D++){let P=Tr(jn*D/tt.trail);$e.push([fs[0],fs[1],P[0],P[1],Ui((D-1)/tt.trail),Ui(D/tt.trail),Ut*.06]),fs=P}$e.push(...An);let Wi=K.blobSeg.value,tl=K.blobInfo.value,te=1/0,de=1/0,tn=-1/0,S=-1/0,U=Ut*ye(.2,.6,tt.goo),V=U;return $e.forEach(([D,P,ct,_t,ot,yt,Et],Ht)=>{let Gt=D-Bt.width/2,Mt=Bt.height/2-P,pe=ct-Bt.width/2,Ve=Bt.height/2-_t,ue=Math.max(ot,yt)+Et;Wi.set([Gt,Mt,pe,Ve],Ht*4),tl.set([ot,yt,Et,0],Ht*4),te=Math.min(te,Gt-ue,pe-ue),tn=Math.max(tn,Gt+ue,pe+ue),de=Math.min(de,Mt-ue,Ve-ue),S=Math.max(S,Mt+ue,Ve+ue),V=Math.max(V,ue)}),K.blobCount.value=$e.length,K.blobHeadEnd.value=Fa,K.blobTubeEnd.value=Fa+tt.trail,K.blobJoin.value=U,K.blobTop.value=V,K.blobRef.value=Ut,K.blobLift.value=qe,X.position.set((te+tn)/2,(de+S)/2,0),X.scale.set(tn-te+4,S-de+4,1),{blob:!0,spray:wt.count>0}},it=tt=>{if(F=0,!rt)return;let at=Math.min(1/30,Math.max(1/240,(tt-q)/1e3));q=tt,dt(at);let Ut=gt(),ce=Ut.blob||Ut.spray;X.visible=Ut.blob,wt.visible=Ut.spray,j.visible=ce&&A.current.shadow,z.render(O,nt);let Nt=Math.hypot(Jt.vx,Jt.vy)+Math.abs(fe.velocity)*40+L.length*100+Math.abs(1-Vt.value)*400;for(let qe of le)Nt+=Math.hypot(qe.vx,qe.vy);for(let qe=0;qe<A.current.trail;qe++)Nt+=Math.hypot(ge[qe].vx,ge[qe].vy);let fn=zt.inside&&A.current.morph>0&&A.current.morphSpeed>0&&!Yt;Y=Nt>1.5||fn?0:Y+at,!(!ce&&!zt.inside)&&(Y>.4||(F=requestAnimationFrame(it)))};function bt(){F||!rt||(Y=0,q=performance.now(),F=requestAnimationFrame(it))}let Tt=new ResizeObserver($);return Tt.observe(I),window.addEventListener("pointermove",ht,{passive:!0}),window.addEventListener("pointerdown",Lt,{passive:!0}),window.addEventListener("pointerup",Ft,{passive:!0}),window.addEventListener("pointercancel",Ft,{passive:!0}),document.addEventListener("pointerout",N),window.addEventListener("blur",ft),R.current=ut,$(),ut(),()=>{rt=!1,cancelAnimationFrame(F),R.current=null,lt?.(),Tt.disconnect(),window.removeEventListener("pointermove",ht),window.removeEventListener("pointerdown",Lt),window.removeEventListener("pointerup",Ft),window.removeEventListener("pointercancel",Ft),document.removeEventListener("pointerout",N),window.removeEventListener("blur",ft),X.geometry.dispose(),Rt.dispose(),At.dispose(),xe.dispose(),xt.dispose(),wt.dispose(),Qt.dispose(),re.dispose(),j.geometry.dispose(),j.material.dispose(),Z.dispose(),z.dispose(),G.parentNode&&G.parentNode.removeChild(G)}},[]),(0,gb.jsx)("div",{ref:x,className:`absolute inset-0 overflow-hidden pointer-events-none ${T}`.trim(),style:w})},mb=f2;var yd=Yi(Sr());function xd(){return(0,yd.jsx)("div",{style:{width:"100%",minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:24},children:(0,yd.jsx)("div",{style:{position:"relative",height:"500px"},children:(0,yd.jsx)(mb,{material:"chrome",color:"#3B82F6",size:140})})})}var Ha=Yi(Sr()),Sb="reactbits--blob-cursor",d2=!0,_b=Object.keys(br),vb=xd||void 0||br[_b.find(e=>/Demo|Example/.test(e))]||br[_b.find(e=>/^[A-Z]/.test(e)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(e))],yb=!1,Sd=(e,t)=>{e==="preview-error"&&(yb=!0),!(e==="preview-ready"&&yb)&&parent.postMessage({type:e,id:Sb,...t?{message:String(t)}:{}},"*")};window.addEventListener("error",e=>Sd("preview-error",e.message));window.addEventListener("unhandledrejection",e=>Sd("preview-error",e.reason?.message||e.reason));var R0=class extends Er.default.Component{state={error:null};static getDerivedStateFromError(t){return{error:t}}componentDidCatch(t){Sd("preview-error",t.message)}render(){return this.state.error?(0,Ha.jsxs)("div",{role:"alert",style:{padding:32,maxWidth:600,fontSize:13,color:"#a1a1aa"},children:["The original example could not finish rendering: ",this.state.error.message]}):this.props.children}};function p2(){let[e,t]=Er.default.useState({});if(Er.default.useEffect(()=>{let n=s=>{s.data?.type==="preview:set-props"&&(!s.data.id||s.data.id===Sb)&&t(a=>({...a,...s.data.props}))};window.addEventListener("message",n);let i=requestAnimationFrame(()=>requestAnimationFrame(()=>Sd("preview-ready")));return()=>{cancelAnimationFrame(i),window.removeEventListener("message",n)}},[]),!vb)throw Error("No renderable component export was published.");return Er.default.createElement(vb,d2?{}:{text:"Build something extraordinary.",children:"Build something extraordinary.",...e})}function m2(){let{resolvedTheme:e,setTheme:t}=bS();return Er.default.useEffect(()=>{document.documentElement.dataset.theme=e||"dark"},[e]),Er.default.useEffect(()=>{let n=i=>{i.data?.type==="preview:set-theme"&&t(i.data.theme==="light"?"light":"dark")};return window.addEventListener("message",n),()=>window.removeEventListener("message",n)},[t]),(0,Ha.jsx)(p2,{})}function g2(){return(0,Ha.jsx)(ES,{attribute:"class",defaultTheme:document.documentElement.dataset.theme||"dark",enableSystem:!1,children:(0,Ha.jsx)(m2,{})})}(0,xb.createRoot)(document.getElementById("root")).render((0,Ha.jsx)(R0,{children:(0,Ha.jsx)(g2,{})}));})();
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
