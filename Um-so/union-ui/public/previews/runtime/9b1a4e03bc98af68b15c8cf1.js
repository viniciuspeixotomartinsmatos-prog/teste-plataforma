(()=>{var R1=Object.create;var Xd=Object.defineProperty;var C1=Object.getOwnPropertyDescriptor;var D1=Object.getOwnPropertyNames;var L1=Object.getPrototypeOf,U1=Object.prototype.hasOwnProperty;var Vi=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),N1=(e,t)=>{for(var n in t)Xd(e,n,{get:t[n],enumerable:!0})},I1=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of D1(t))!U1.call(e,s)&&s!==n&&Xd(e,s,{get:()=>t[s],enumerable:!(i=C1(t,s))||i.enumerable});return e};var Gi=(e,t,n)=>(n=e!=null?R1(L1(e)):{},I1(t||!e||!e.__esModule?Xd(n,"default",{value:e,enumerable:!0}):n,e));var T_=Vi(Qt=>{"use strict";var Zd=Symbol.for("react.transitional.element"),O1=Symbol.for("react.portal"),P1=Symbol.for("react.fragment"),B1=Symbol.for("react.strict_mode"),z1=Symbol.for("react.profiler"),F1=Symbol.for("react.consumer"),H1=Symbol.for("react.context"),V1=Symbol.for("react.forward_ref"),G1=Symbol.for("react.suspense"),k1=Symbol.for("react.memo"),y_=Symbol.for("react.lazy"),W1=Symbol.for("react.activity"),m_=Symbol.iterator;function X1(e){return e===null||typeof e!="object"?null:(e=m_&&e[m_]||e["@@iterator"],typeof e=="function"?e:null)}var x_={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},S_=Object.assign,M_={};function br(e,t,n){this.props=e,this.context=t,this.refs=M_,this.updater=n||x_}br.prototype.isReactComponent={};br.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};br.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function b_(){}b_.prototype=br.prototype;function Jd(e,t,n){this.props=e,this.context=t,this.refs=M_,this.updater=n||x_}var Kd=Jd.prototype=new b_;Kd.constructor=Jd;S_(Kd,br.prototype);Kd.isPureReactComponent=!0;var g_=Array.isArray;function Yd(){}var Ie={H:null,A:null,T:null,S:null},E_=Object.prototype.hasOwnProperty;function Qd(e,t,n){var i=n.ref;return{$$typeof:Zd,type:e,key:t,ref:i!==void 0?i:null,props:n}}function q1(e,t){return Qd(e.type,t,e.props)}function jd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Zd}function Y1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var __=/\/+/g;function qd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Y1(""+e.key):t.toString(36)}function Z1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Yd,Yd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Mr(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Zd:case O1:r=!0;break;case y_:return r=e._init,Mr(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+qd(e,0):i,g_(s)?(n="",r!=null&&(n=r.replace(__,"$&/")+"/"),Mr(s,t,n,"",function(c){return c})):s!=null&&(jd(s)&&(s=q1(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(__,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(g_(e))for(var l=0;l<e.length;l++)i=e[l],a=o+qd(i,l),r+=Mr(i,t,n,a,s);else if(l=X1(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+qd(i,l++),r+=Mr(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return Mr(Z1(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function ou(e,t,n){if(e==null)return e;var i=[],s=0;return Mr(e,i,"","",function(a){return t.call(n,a,s++)}),i}function J1(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var v_=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},K1={map:ou,forEach:function(e,t,n){ou(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return ou(e,function(){t++}),t},toArray:function(e){return ou(e,function(t){return t})||[]},only:function(e){if(!jd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Qt.Activity=W1;Qt.Children=K1;Qt.Component=br;Qt.Fragment=P1;Qt.Profiler=z1;Qt.PureComponent=Jd;Qt.StrictMode=B1;Qt.Suspense=G1;Qt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ie;Qt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ie.H.useMemoCache(e)}};Qt.cache=function(e){return function(){return e.apply(null,arguments)}};Qt.cacheSignal=function(){return null};Qt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=S_({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!E_.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Qd(e.type,s,i)};Qt.createContext=function(e){return e={$$typeof:H1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:F1,_context:e},e};Qt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)E_.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Qd(e,a,s)};Qt.createRef=function(){return{current:null}};Qt.forwardRef=function(e){return{$$typeof:V1,render:e}};Qt.isValidElement=jd;Qt.lazy=function(e){return{$$typeof:y_,_payload:{_status:-1,_result:e},_init:J1}};Qt.memo=function(e,t){return{$$typeof:k1,type:e,compare:t===void 0?null:t}};Qt.startTransition=function(e){var t=Ie.T,n={};Ie.T=n;try{var i=e(),s=Ie.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Yd,v_)}catch(a){v_(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),Ie.T=t}};Qt.unstable_useCacheRefresh=function(){return Ie.H.useCacheRefresh()};Qt.use=function(e){return Ie.H.use(e)};Qt.useActionState=function(e,t,n){return Ie.H.useActionState(e,t,n)};Qt.useCallback=function(e,t){return Ie.H.useCallback(e,t)};Qt.useContext=function(e){return Ie.H.useContext(e)};Qt.useDebugValue=function(){};Qt.useDeferredValue=function(e,t){return Ie.H.useDeferredValue(e,t)};Qt.useEffect=function(e,t){return Ie.H.useEffect(e,t)};Qt.useEffectEvent=function(e){return Ie.H.useEffectEvent(e)};Qt.useId=function(){return Ie.H.useId()};Qt.useImperativeHandle=function(e,t,n){return Ie.H.useImperativeHandle(e,t,n)};Qt.useInsertionEffect=function(e,t){return Ie.H.useInsertionEffect(e,t)};Qt.useLayoutEffect=function(e,t){return Ie.H.useLayoutEffect(e,t)};Qt.useMemo=function(e,t){return Ie.H.useMemo(e,t)};Qt.useOptimistic=function(e,t){return Ie.H.useOptimistic(e,t)};Qt.useReducer=function(e,t,n){return Ie.H.useReducer(e,t,n)};Qt.useRef=function(e){return Ie.H.useRef(e)};Qt.useState=function(e){return Ie.H.useState(e)};Qt.useSyncExternalStore=function(e,t,n){return Ie.H.useSyncExternalStore(e,t,n)};Qt.useTransition=function(){return Ie.H.useTransition()};Qt.version="19.2.0"});var Er=Vi((hL,A_)=>{"use strict";A_.exports=T_()});var P_=Vi(Fe=>{"use strict";function np(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<lu(s,t))e[i]=t,e[n]=s,n=i;else break t}}function ki(e){return e.length===0?null:e[0]}function uu(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>lu(o,n))l<s&&0>lu(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>lu(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function lu(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}Fe.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(w_=performance,Fe.unstable_now=function(){return w_.now()}):($d=Date,R_=$d.now(),Fe.unstable_now=function(){return $d.now()-R_});var w_,$d,R_,os=[],zs=[],Q1=1,pi=null,bn=3,ip=!1,hl=!1,fl=!1,sp=!1,L_=typeof setTimeout=="function"?setTimeout:null,U_=typeof clearTimeout=="function"?clearTimeout:null,C_=typeof setImmediate<"u"?setImmediate:null;function cu(e){for(var t=ki(zs);t!==null;){if(t.callback===null)uu(zs);else if(t.startTime<=e)uu(zs),t.sortIndex=t.expirationTime,np(os,t);else break;t=ki(zs)}}function ap(e){if(fl=!1,cu(e),!hl)if(ki(os)!==null)hl=!0,Ar||(Ar=!0,Tr());else{var t=ki(zs);t!==null&&rp(ap,t.startTime-e)}}var Ar=!1,dl=-1,N_=5,I_=-1;function O_(){return sp?!0:!(Fe.unstable_now()-I_<N_)}function tp(){if(sp=!1,Ar){var e=Fe.unstable_now();I_=e;var t=!0;try{t:{hl=!1,fl&&(fl=!1,U_(dl),dl=-1),ip=!0;var n=bn;try{e:{for(cu(e),pi=ki(os);pi!==null&&!(pi.expirationTime>e&&O_());){var i=pi.callback;if(typeof i=="function"){pi.callback=null,bn=pi.priorityLevel;var s=i(pi.expirationTime<=e);if(e=Fe.unstable_now(),typeof s=="function"){pi.callback=s,cu(e),t=!0;break e}pi===ki(os)&&uu(os),cu(e)}else uu(os);pi=ki(os)}if(pi!==null)t=!0;else{var a=ki(zs);a!==null&&rp(ap,a.startTime-e),t=!1}}break t}finally{pi=null,bn=n,ip=!1}t=void 0}}finally{t?Tr():Ar=!1}}}var Tr;typeof C_=="function"?Tr=function(){C_(tp)}:typeof MessageChannel<"u"?(ep=new MessageChannel,D_=ep.port2,ep.port1.onmessage=tp,Tr=function(){D_.postMessage(null)}):Tr=function(){L_(tp,0)};var ep,D_;function rp(e,t){dl=L_(function(){e(Fe.unstable_now())},t)}Fe.unstable_IdlePriority=5;Fe.unstable_ImmediatePriority=1;Fe.unstable_LowPriority=4;Fe.unstable_NormalPriority=3;Fe.unstable_Profiling=null;Fe.unstable_UserBlockingPriority=2;Fe.unstable_cancelCallback=function(e){e.callback=null};Fe.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):N_=0<e?Math.floor(1e3/e):5};Fe.unstable_getCurrentPriorityLevel=function(){return bn};Fe.unstable_next=function(e){switch(bn){case 1:case 2:case 3:var t=3;break;default:t=bn}var n=bn;bn=t;try{return e()}finally{bn=n}};Fe.unstable_requestPaint=function(){sp=!0};Fe.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=bn;bn=e;try{return t()}finally{bn=n}};Fe.unstable_scheduleCallback=function(e,t,n){var i=Fe.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:Q1++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,np(zs,e),ki(os)===null&&e===ki(zs)&&(fl?(U_(dl),dl=-1):fl=!0,rp(ap,n-i))):(e.sortIndex=s,np(os,e),hl||ip||(hl=!0,Ar||(Ar=!0,Tr()))),e};Fe.unstable_shouldYield=O_;Fe.unstable_wrapCallback=function(e){var t=bn;return function(){var n=bn;bn=t;try{return e.apply(this,arguments)}finally{bn=n}}}});var z_=Vi((dL,B_)=>{"use strict";B_.exports=P_()});var H_=Vi(Dn=>{"use strict";var j1=Er();function F_(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Fs(){}var Cn={d:{f:Fs,r:function(){throw Error(F_(522))},D:Fs,C:Fs,L:Fs,m:Fs,X:Fs,S:Fs,M:Fs},p:0,findDOMNode:null},$1=Symbol.for("react.portal");function tE(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:$1,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var pl=j1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function hu(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Dn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Cn;Dn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(F_(299));return tE(e,t,null,n)};Dn.flushSync=function(e){var t=pl.T,n=Cn.p;try{if(pl.T=null,Cn.p=2,e)return e()}finally{pl.T=t,Cn.p=n,Cn.d.f()}};Dn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Cn.d.C(e,t))};Dn.prefetchDNS=function(e){typeof e=="string"&&Cn.d.D(e)};Dn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=hu(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?Cn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&Cn.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Dn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=hu(t.as,t.crossOrigin);Cn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&Cn.d.M(e)};Dn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=hu(n,t.crossOrigin);Cn.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Dn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=hu(t.as,t.crossOrigin);Cn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else Cn.d.m(e)};Dn.requestFormReset=function(e){Cn.d.r(e)};Dn.unstable_batchedUpdates=function(e,t){return e(t)};Dn.useFormState=function(e,t,n){return pl.H.useFormState(e,t,n)};Dn.useFormStatus=function(){return pl.H.useHostTransitionStatus()};Dn.version="19.2.0"});var k_=Vi((mL,G_)=>{"use strict";function V_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(V_)}catch(e){console.error(e)}}V_(),G_.exports=H_()});var eM=Vi(Ph=>{"use strict";var on=z_(),my=Er(),eE=k_();function nt(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function gy(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function tc(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function _y(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function vy(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function W_(e){if(tc(e)!==e)throw Error(nt(188))}function nE(e){var t=e.alternate;if(!t){if(t=tc(e),t===null)throw Error(nt(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return W_(s),e;if(a===i)return W_(s),t;a=a.sibling}throw Error(nt(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error(nt(189))}}if(n.alternate!==i)throw Error(nt(190))}if(n.tag!==3)throw Error(nt(188));return n.stateNode.current===n?e:t}function yy(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=yy(e),t!==null)return t;e=e.sibling}return null}var Be=Object.assign,iE=Symbol.for("react.element"),fu=Symbol.for("react.transitional.element"),Ml=Symbol.for("react.portal"),Ur=Symbol.for("react.fragment"),xy=Symbol.for("react.strict_mode"),Hp=Symbol.for("react.profiler"),Sy=Symbol.for("react.consumer"),ms=Symbol.for("react.context"),Om=Symbol.for("react.forward_ref"),Vp=Symbol.for("react.suspense"),Gp=Symbol.for("react.suspense_list"),Pm=Symbol.for("react.memo"),Hs=Symbol.for("react.lazy");Symbol.for("react.scope");var kp=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var sE=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var X_=Symbol.iterator;function ml(e){return e===null||typeof e!="object"?null:(e=X_&&e[X_]||e["@@iterator"],typeof e=="function"?e:null)}var aE=Symbol.for("react.client.reference");function Wp(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===aE?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Ur:return"Fragment";case Hp:return"Profiler";case xy:return"StrictMode";case Vp:return"Suspense";case Gp:return"SuspenseList";case kp:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case Ml:return"Portal";case ms:return e.displayName||"Context";case Sy:return(e._context.displayName||"Context")+".Consumer";case Om:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Pm:return t=e.displayName||null,t!==null?t:Wp(e.type)||"Memo";case Hs:t=e._payload,e=e._init;try{return Wp(e(t))}catch{}}return null}var bl=Array.isArray,qt=my.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ye=eE.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ha={pending:!1,data:null,method:null,action:null},Xp=[],Nr=-1;function Zi(e){return{current:e}}function dn(e){0>Nr||(e.current=Xp[Nr],Xp[Nr]=null,Nr--)}function Ne(e,t){Nr++,Xp[Nr]=e.current,e.current=t}var Yi=Zi(null),Hl=Zi(null),Qs=Zi(null),Xu=Zi(null);function qu(e,t){switch(Ne(Qs,t),Ne(Hl,e),Ne(Yi,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?jv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=jv(t),e=VS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}dn(Yi),Ne(Yi,e)}function Qr(){dn(Yi),dn(Hl),dn(Qs)}function qp(e){e.memoizedState!==null&&Ne(Xu,e);var t=Yi.current,n=VS(t,e.type);t!==n&&(Ne(Hl,e),Ne(Yi,n))}function Yu(e){Hl.current===e&&(dn(Yi),dn(Hl)),Xu.current===e&&(dn(Xu),Ql._currentValue=Ha)}var op,q_;function Pa(e){if(op===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);op=t&&t[1]||"",q_=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+op+e+q_}var lp=!1;function cp(e,t){if(!e||lp)return"";lp=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(d){var u=d}Reflect.construct(e,[],p)}else{try{p.call()}catch(d){u=d}e.call(p.prototype)}}else{try{throw Error()}catch(d){u=d}(p=e())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(d){if(d&&u&&typeof d.stack=="string")return[d.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var h=`
`+l[i].replace(" at new "," at ");return e.displayName&&h.includes("<anonymous>")&&(h=h.replace("<anonymous>",e.displayName)),h}while(1<=i&&0<=s);break}}}finally{lp=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?Pa(n):""}function rE(e,t){switch(e.tag){case 26:case 27:case 5:return Pa(e.type);case 16:return Pa("Lazy");case 13:return e.child!==t&&t!==null?Pa("Suspense Fallback"):Pa("Suspense");case 19:return Pa("SuspenseList");case 0:case 15:return cp(e.type,!1);case 11:return cp(e.type.render,!1);case 1:return cp(e.type,!0);case 31:return Pa("Activity");default:return""}}function Y_(e){try{var t="",n=null;do t+=rE(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Yp=Object.prototype.hasOwnProperty,Bm=on.unstable_scheduleCallback,up=on.unstable_cancelCallback,oE=on.unstable_shouldYield,lE=on.unstable_requestPaint,$n=on.unstable_now,cE=on.unstable_getCurrentPriorityLevel,My=on.unstable_ImmediatePriority,by=on.unstable_UserBlockingPriority,Zu=on.unstable_NormalPriority,uE=on.unstable_LowPriority,Ey=on.unstable_IdlePriority,hE=on.log,fE=on.unstable_setDisableYieldValue,ec=null,ti=null;function qs(e){if(typeof hE=="function"&&fE(e),ti&&typeof ti.setStrictMode=="function")try{ti.setStrictMode(ec,e)}catch{}}var ei=Math.clz32?Math.clz32:mE,dE=Math.log,pE=Math.LN2;function mE(e){return e>>>=0,e===0?32:31-(dE(e)/pE|0)|0}var du=256,pu=262144,mu=4194304;function Ba(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function xh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=Ba(i):(r&=o,r!==0?s=Ba(r):n||(n=o&~e,n!==0&&(s=Ba(n))))):(o=i&~a,o!==0?s=Ba(o):r!==0?s=Ba(r):n||(n=i&~e,n!==0&&(s=Ba(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function nc(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function gE(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ty(){var e=mu;return mu<<=1,(mu&62914560)===0&&(mu=4194304),e}function hp(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ic(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function _E(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var h=31-ei(n),p=1<<h;o[h]=0,l[h]=-1;var u=c[h];if(u!==null)for(c[h]=null,h=0;h<u.length;h++){var d=u[h];d!==null&&(d.lane&=-536870913)}n&=~p}i!==0&&Ay(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function Ay(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-ei(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function wy(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-ei(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function Ry(e,t){var n=t&-t;return n=(n&42)!==0?1:zm(n),(n&(e.suspendedLanes|t))!==0?0:n}function zm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Fm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Cy(){var e=ye.p;return e!==0?e:(e=window.event,e===void 0?32:jS(e.type))}function Z_(e,t){var n=ye.p;try{return ye.p=e,t()}finally{ye.p=n}}var ua=Math.random().toString(36).slice(2),_n="__reactFiber$"+ua,Wn="__reactProps$"+ua,lo="__reactContainer$"+ua,Zp="__reactEvents$"+ua,vE="__reactListeners$"+ua,yE="__reactHandles$"+ua,J_="__reactResources$"+ua,sc="__reactMarker$"+ua;function Hm(e){delete e[_n],delete e[Wn],delete e[Zp],delete e[vE],delete e[yE]}function Ir(e){var t=e[_n];if(t)return t;for(var n=e.parentNode;n;){if(t=n[lo]||n[_n]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=iy(e);e!==null;){if(n=e[_n])return n;e=iy(e)}return t}e=n,n=e.parentNode}return null}function co(e){if(e=e[_n]||e[lo]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function El(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(nt(33))}function Wr(e){var t=e[J_];return t||(t=e[J_]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function fn(e){e[sc]=!0}var Dy=new Set,Ly={};function Ka(e,t){jr(e,t),jr(e+"Capture",t)}function jr(e,t){for(Ly[e]=t,e=0;e<t.length;e++)Dy.add(t[e])}var xE=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),K_={},Q_={};function SE(e){return Yp.call(Q_,e)?!0:Yp.call(K_,e)?!1:xE.test(e)?Q_[e]=!0:(K_[e]=!0,!1)}function Du(e,t,n){if(SE(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function gu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function ls(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function gi(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Uy(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ME(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Jp(e){if(!e._valueTracker){var t=Uy(e)?"checked":"value";e._valueTracker=ME(e,t,""+e[t])}}function Ny(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=Uy(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Ju(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var bE=/[\n"\\]/g;function yi(e){return e.replace(bE,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Kp(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+gi(t)):e.value!==""+gi(t)&&(e.value=""+gi(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Qp(e,r,gi(t)):n!=null?Qp(e,r,gi(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+gi(o):e.removeAttribute("name")}function Iy(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){Jp(e);return}n=n!=null?""+gi(n):"",t=t!=null?""+gi(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i??s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),Jp(e)}function Qp(e,t,n){t==="number"&&Ju(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function Xr(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+gi(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function Oy(e,t,n){if(t!=null&&(t=""+gi(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+gi(n):""}function Py(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(nt(92));if(bl(i)){if(1<i.length)throw Error(nt(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=gi(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Jp(e)}function $r(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var EE=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function j_(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||EE.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function By(e,t,n){if(t!=null&&typeof t!="object")throw Error(nt(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&j_(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&j_(e,a,t[a])}function Vm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var TE=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),AE=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Lu(e){return AE.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function gs(){}var jp=null;function Gm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Or=null,qr=null;function $_(e){var t=co(e);if(t&&(e=t.stateNode)){var n=e[Wn]||null;t:switch(e=t.stateNode,t.type){case"input":if(Kp(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+yi(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[Wn]||null;if(!s)throw Error(nt(90));Kp(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&Ny(i)}break t;case"textarea":Oy(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&Xr(e,!!n.multiple,t,!1)}}}var fp=!1;function zy(e,t,n){if(fp)return e(t,n);fp=!0;try{var i=e(t);return i}finally{if(fp=!1,(Or!==null||qr!==null)&&(Uh(),Or&&(t=Or,e=qr,qr=Or=null,$_(t),e)))for(t=0;t<e.length;t++)$_(e[t])}}function Vl(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Wn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(nt(231,t,typeof n));return n}var Ss=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),$p=!1;if(Ss)try{wr={},Object.defineProperty(wr,"passive",{get:function(){$p=!0}}),window.addEventListener("test",wr,wr),window.removeEventListener("test",wr,wr)}catch{$p=!1}var wr,Ys=null,km=null,Uu=null;function Fy(){if(Uu)return Uu;var e,t=km,n=t.length,i,s="value"in Ys?Ys.value:Ys.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return Uu=s.slice(e,1<i?1-i:void 0)}function Nu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function _u(){return!0}function tv(){return!1}function Xn(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?_u:tv,this.isPropagationStopped=tv,this}return Be(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=_u)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=_u)},persist:function(){},isPersistent:_u}),t}var Qa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Sh=Xn(Qa),ac=Be({},Qa,{view:0,detail:0}),wE=Xn(ac),dp,pp,gl,Mh=Be({},ac,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Wm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==gl&&(gl&&e.type==="mousemove"?(dp=e.screenX-gl.screenX,pp=e.screenY-gl.screenY):pp=dp=0,gl=e),dp)},movementY:function(e){return"movementY"in e?e.movementY:pp}}),ev=Xn(Mh),RE=Be({},Mh,{dataTransfer:0}),CE=Xn(RE),DE=Be({},ac,{relatedTarget:0}),mp=Xn(DE),LE=Be({},Qa,{animationName:0,elapsedTime:0,pseudoElement:0}),UE=Xn(LE),NE=Be({},Qa,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),IE=Xn(NE),OE=Be({},Qa,{data:0}),nv=Xn(OE),PE={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},BE={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},zE={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function FE(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=zE[e])?!!t[e]:!1}function Wm(){return FE}var HE=Be({},ac,{key:function(e){if(e.key){var t=PE[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Nu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?BE[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Wm,charCode:function(e){return e.type==="keypress"?Nu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Nu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),VE=Xn(HE),GE=Be({},Mh,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),iv=Xn(GE),kE=Be({},ac,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Wm}),WE=Xn(kE),XE=Be({},Qa,{propertyName:0,elapsedTime:0,pseudoElement:0}),qE=Xn(XE),YE=Be({},Mh,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),ZE=Xn(YE),JE=Be({},Qa,{newState:0,oldState:0}),KE=Xn(JE),QE=[9,13,27,32],Xm=Ss&&"CompositionEvent"in window,wl=null;Ss&&"documentMode"in document&&(wl=document.documentMode);var jE=Ss&&"TextEvent"in window&&!wl,Hy=Ss&&(!Xm||wl&&8<wl&&11>=wl),sv=" ",av=!1;function Vy(e,t){switch(e){case"keyup":return QE.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Gy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Pr=!1;function $E(e,t){switch(e){case"compositionend":return Gy(t);case"keypress":return t.which!==32?null:(av=!0,sv);case"textInput":return e=t.data,e===sv&&av?null:e;default:return null}}function tT(e,t){if(Pr)return e==="compositionend"||!Xm&&Vy(e,t)?(e=Fy(),Uu=km=Ys=null,Pr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Hy&&t.locale!=="ko"?null:t.data;default:return null}}var eT={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function rv(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!eT[e.type]:t==="textarea"}function ky(e,t,n,i){Or?qr?qr.push(i):qr=[i]:Or=i,t=dh(t,"onChange"),0<t.length&&(n=new Sh("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var Rl=null,Gl=null;function nT(e){zS(e,0)}function bh(e){var t=El(e);if(Ny(t))return e}function ov(e,t){if(e==="change")return t}var Wy=!1;Ss&&(Ss?(yu="oninput"in document,yu||(gp=document.createElement("div"),gp.setAttribute("oninput","return;"),yu=typeof gp.oninput=="function"),vu=yu):vu=!1,Wy=vu&&(!document.documentMode||9<document.documentMode));var vu,yu,gp;function lv(){Rl&&(Rl.detachEvent("onpropertychange",Xy),Gl=Rl=null)}function Xy(e){if(e.propertyName==="value"&&bh(Gl)){var t=[];ky(t,Gl,e,Gm(e)),zy(nT,t)}}function iT(e,t,n){e==="focusin"?(lv(),Rl=t,Gl=n,Rl.attachEvent("onpropertychange",Xy)):e==="focusout"&&lv()}function sT(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return bh(Gl)}function aT(e,t){if(e==="click")return bh(t)}function rT(e,t){if(e==="input"||e==="change")return bh(t)}function oT(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ii=typeof Object.is=="function"?Object.is:oT;function kl(e,t){if(ii(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!Yp.call(t,s)||!ii(e[s],t[s]))return!1}return!0}function cv(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function uv(e,t){var n=cv(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=cv(n)}}function qy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?qy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Yy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ju(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Ju(e.document)}return t}function qm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var lT=Ss&&"documentMode"in document&&11>=document.documentMode,Br=null,tm=null,Cl=null,em=!1;function hv(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;em||Br==null||Br!==Ju(i)||(i=Br,"selectionStart"in i&&qm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Cl&&kl(Cl,i)||(Cl=i,i=dh(tm,"onSelect"),0<i.length&&(t=new Sh("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=Br)))}function Oa(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var zr={animationend:Oa("Animation","AnimationEnd"),animationiteration:Oa("Animation","AnimationIteration"),animationstart:Oa("Animation","AnimationStart"),transitionrun:Oa("Transition","TransitionRun"),transitionstart:Oa("Transition","TransitionStart"),transitioncancel:Oa("Transition","TransitionCancel"),transitionend:Oa("Transition","TransitionEnd")},_p={},Zy={};Ss&&(Zy=document.createElement("div").style,"AnimationEvent"in window||(delete zr.animationend.animation,delete zr.animationiteration.animation,delete zr.animationstart.animation),"TransitionEvent"in window||delete zr.transitionend.transition);function ja(e){if(_p[e])return _p[e];if(!zr[e])return e;var t=zr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Zy)return _p[e]=t[n];return e}var Jy=ja("animationend"),Ky=ja("animationiteration"),Qy=ja("animationstart"),cT=ja("transitionrun"),uT=ja("transitionstart"),hT=ja("transitioncancel"),jy=ja("transitionend"),$y=new Map,nm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");nm.push("scrollEnd");function Li(e,t){$y.set(e,t),Ka(t,[e])}var Ku=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},mi=[],Fr=0,Ym=0;function Eh(){for(var e=Fr,t=Ym=Fr=0;t<e;){var n=mi[t];mi[t++]=null;var i=mi[t];mi[t++]=null;var s=mi[t];mi[t++]=null;var a=mi[t];if(mi[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&tx(n,s,a)}}function Th(e,t,n,i){mi[Fr++]=e,mi[Fr++]=t,mi[Fr++]=n,mi[Fr++]=i,Ym|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Zm(e,t,n,i){return Th(e,t,n,i),Qu(e)}function $a(e,t){return Th(e,null,null,t),Qu(e)}function tx(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-ei(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function Qu(e){if(50<zl)throw zl=0,bm=null,Error(nt(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Hr={};function fT(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Qn(e,t,n,i){return new fT(e,t,n,i)}function Jm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function vs(e,t){var n=e.alternate;return n===null?(n=Qn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function ex(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Iu(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")Jm(e)&&(r=1);else if(typeof e=="string")r=mA(e,n,Yi.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case kp:return e=Qn(31,n,t,s),e.elementType=kp,e.lanes=a,e;case Ur:return Va(n.children,s,a,t);case xy:r=8,s|=24;break;case Hp:return e=Qn(12,n,t,s|2),e.elementType=Hp,e.lanes=a,e;case Vp:return e=Qn(13,n,t,s),e.elementType=Vp,e.lanes=a,e;case Gp:return e=Qn(19,n,t,s),e.elementType=Gp,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case ms:r=10;break t;case Sy:r=9;break t;case Om:r=11;break t;case Pm:r=14;break t;case Hs:r=16,i=null;break t}r=29,n=Error(nt(130,e===null?"null":typeof e,"")),i=null}return t=Qn(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function Va(e,t,n,i){return e=Qn(7,e,i,t),e.lanes=n,e}function vp(e,t,n){return e=Qn(6,e,null,t),e.lanes=n,e}function nx(e){var t=Qn(18,null,null,0);return t.stateNode=e,t}function yp(e,t,n){return t=Qn(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var fv=new WeakMap;function xi(e,t){if(typeof e=="object"&&e!==null){var n=fv.get(e);return n!==void 0?n:(t={value:e,source:t,stack:Y_(t)},fv.set(e,t),t)}return{value:e,source:t,stack:Y_(t)}}var Vr=[],Gr=0,ju=null,Wl=0,_i=[],vi=0,ra=null,Wi=1,Xi="";function ds(e,t){Vr[Gr++]=Wl,Vr[Gr++]=ju,ju=e,Wl=t}function ix(e,t,n){_i[vi++]=Wi,_i[vi++]=Xi,_i[vi++]=ra,ra=e;var i=Wi;e=Xi;var s=32-ei(i)-1;i&=~(1<<s),n+=1;var a=32-ei(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,Wi=1<<32-ei(t)+s|n<<s|i,Xi=a+e}else Wi=1<<a|n<<s|i,Xi=e}function Km(e){e.return!==null&&(ds(e,1),ix(e,1,0))}function Qm(e){for(;e===ju;)ju=Vr[--Gr],Vr[Gr]=null,Wl=Vr[--Gr],Vr[Gr]=null;for(;e===ra;)ra=_i[--vi],_i[vi]=null,Xi=_i[--vi],_i[vi]=null,Wi=_i[--vi],_i[vi]=null}function sx(e,t){_i[vi++]=Wi,_i[vi++]=Xi,_i[vi++]=ra,Wi=t.id,Xi=t.overflow,ra=e}var vn=null,Pe=null,de=!1,js=null,Si=!1,im=Error(nt(519));function oa(e){var t=Error(nt(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Xl(xi(t,e)),im}function dv(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[_n]=e,t[Wn]=i,n){case"dialog":oe("cancel",t),oe("close",t);break;case"iframe":case"object":case"embed":oe("load",t);break;case"video":case"audio":for(n=0;n<Jl.length;n++)oe(Jl[n],t);break;case"source":oe("error",t);break;case"img":case"image":case"link":oe("error",t),oe("load",t);break;case"details":oe("toggle",t);break;case"input":oe("invalid",t),Iy(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":oe("invalid",t);break;case"textarea":oe("invalid",t),Py(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||HS(t.textContent,n)?(i.popover!=null&&(oe("beforetoggle",t),oe("toggle",t)),i.onScroll!=null&&oe("scroll",t),i.onScrollEnd!=null&&oe("scrollend",t),i.onClick!=null&&(t.onclick=gs),t=!0):t=!1,t||oa(e,!0)}function pv(e){for(vn=e.return;vn;)switch(vn.tag){case 5:case 31:case 13:Si=!1;return;case 27:case 3:Si=!0;return;default:vn=vn.return}}function Rr(e){if(e!==vn)return!1;if(!de)return pv(e),de=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||Rm(e.type,e.memoizedProps)),n=!n),n&&Pe&&oa(e),pv(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(317));Pe=ny(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(317));Pe=ny(e)}else t===27?(t=Pe,ha(e.type)?(e=Um,Um=null,Pe=e):Pe=t):Pe=vn?bi(e.stateNode.nextSibling):null;return!0}function Xa(){Pe=vn=null,de=!1}function xp(){var e=js;return e!==null&&(Gn===null?Gn=e:Gn.push.apply(Gn,e),js=null),e}function Xl(e){js===null?js=[e]:js.push(e)}var sm=Zi(null),tr=null,_s=null;function Gs(e,t,n){Ne(sm,t._currentValue),t._currentValue=n}function ys(e){e._currentValue=sm.current,dn(sm)}function am(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function rm(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),am(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error(nt(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),am(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function uo(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error(nt(387));if(r=r.memoizedProps,r!==null){var o=s.type;ii(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Xu.current){if(r=s.alternate,r===null)throw Error(nt(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push(Ql):e=[Ql])}s=s.return}e!==null&&rm(t,e,n,i),t.flags|=262144}function $u(e){for(e=e.firstContext;e!==null;){if(!ii(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function qa(e){tr=e,_s=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function yn(e){return ax(tr,e)}function xu(e,t){return tr===null&&qa(e),ax(e,t)}function ax(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},_s===null){if(e===null)throw Error(nt(308));_s=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else _s=_s.next=t;return n}var dT=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},pT=on.unstable_scheduleCallback,mT=on.unstable_NormalPriority,$e={$$typeof:ms,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function jm(){return{controller:new dT,data:new Map,refCount:0}}function rc(e){e.refCount--,e.refCount===0&&pT(mT,function(){e.controller.abort()})}var Dl=null,om=0,to=0,Yr=null;function gT(e,t){if(Dl===null){var n=Dl=[];om=0,to=bg(),Yr={status:"pending",value:void 0,then:function(i){n.push(i)}}}return om++,t.then(mv,mv),t}function mv(){if(--om===0&&Dl!==null){Yr!==null&&(Yr.status="fulfilled");var e=Dl;Dl=null,to=0,Yr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function _T(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var gv=qt.S;qt.S=function(e,t){yS=$n(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&gT(e,t),gv!==null&&gv(e,t)};var Ga=Zi(null);function $m(){var e=Ga.current;return e!==null?e:De.pooledCache}function Ou(e,t){t===null?Ne(Ga,Ga.current):Ne(Ga,t.pool)}function rx(){var e=$m();return e===null?null:{parent:$e._currentValue,pool:e}}var ho=Error(nt(460)),tg=Error(nt(474)),Ah=Error(nt(542)),th={then:function(){}};function _v(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ox(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(gs,gs),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,yv(e),e;default:if(typeof t.status=="string")t.then(gs,gs);else{if(e=De,e!==null&&100<e.shellSuspendCounter)throw Error(nt(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,yv(e),e}throw ka=t,ho}}function za(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(ka=n,ho):n}}var ka=null;function vv(){if(ka===null)throw Error(nt(459));var e=ka;return ka=null,e}function yv(e){if(e===ho||e===Ah)throw Error(nt(483))}var Zr=null,ql=0;function Su(e){var t=ql;return ql+=1,Zr===null&&(Zr=[]),ox(Zr,e,t)}function _l(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Mu(e,t){throw t.$$typeof===iE?Error(nt(525)):(e=Object.prototype.toString.call(t),Error(nt(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function lx(e){function t(f,_){if(e){var S=f.deletions;S===null?(f.deletions=[_],f.flags|=16):S.push(_)}}function n(f,_){if(!e)return null;for(;_!==null;)t(f,_),_=_.sibling;return null}function i(f){for(var _=new Map;f!==null;)f.key!==null?_.set(f.key,f):_.set(f.index,f),f=f.sibling;return _}function s(f,_){return f=vs(f,_),f.index=0,f.sibling=null,f}function a(f,_,S){return f.index=S,e?(S=f.alternate,S!==null?(S=S.index,S<_?(f.flags|=67108866,_):S):(f.flags|=67108866,_)):(f.flags|=1048576,_)}function r(f){return e&&f.alternate===null&&(f.flags|=67108866),f}function o(f,_,S,v){return _===null||_.tag!==6?(_=vp(S,f.mode,v),_.return=f,_):(_=s(_,S),_.return=f,_)}function l(f,_,S,v){var E=S.type;return E===Ur?h(f,_,S.props.children,v,S.key):_!==null&&(_.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===Hs&&za(E)===_.type)?(_=s(_,S.props),_l(_,S),_.return=f,_):(_=Iu(S.type,S.key,S.props,null,f.mode,v),_l(_,S),_.return=f,_)}function c(f,_,S,v){return _===null||_.tag!==4||_.stateNode.containerInfo!==S.containerInfo||_.stateNode.implementation!==S.implementation?(_=yp(S,f.mode,v),_.return=f,_):(_=s(_,S.children||[]),_.return=f,_)}function h(f,_,S,v,E){return _===null||_.tag!==7?(_=Va(S,f.mode,v,E),_.return=f,_):(_=s(_,S),_.return=f,_)}function p(f,_,S){if(typeof _=="string"&&_!==""||typeof _=="number"||typeof _=="bigint")return _=vp(""+_,f.mode,S),_.return=f,_;if(typeof _=="object"&&_!==null){switch(_.$$typeof){case fu:return S=Iu(_.type,_.key,_.props,null,f.mode,S),_l(S,_),S.return=f,S;case Ml:return _=yp(_,f.mode,S),_.return=f,_;case Hs:return _=za(_),p(f,_,S)}if(bl(_)||ml(_))return _=Va(_,f.mode,S,null),_.return=f,_;if(typeof _.then=="function")return p(f,Su(_),S);if(_.$$typeof===ms)return p(f,xu(f,_),S);Mu(f,_)}return null}function u(f,_,S,v){var E=_!==null?_.key:null;if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return E!==null?null:o(f,_,""+S,v);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case fu:return S.key===E?l(f,_,S,v):null;case Ml:return S.key===E?c(f,_,S,v):null;case Hs:return S=za(S),u(f,_,S,v)}if(bl(S)||ml(S))return E!==null?null:h(f,_,S,v,null);if(typeof S.then=="function")return u(f,_,Su(S),v);if(S.$$typeof===ms)return u(f,_,xu(f,S),v);Mu(f,S)}return null}function d(f,_,S,v,E){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return f=f.get(S)||null,o(_,f,""+v,E);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case fu:return f=f.get(v.key===null?S:v.key)||null,l(_,f,v,E);case Ml:return f=f.get(v.key===null?S:v.key)||null,c(_,f,v,E);case Hs:return v=za(v),d(f,_,S,v,E)}if(bl(v)||ml(v))return f=f.get(S)||null,h(_,f,v,E,null);if(typeof v.then=="function")return d(f,_,S,Su(v),E);if(v.$$typeof===ms)return d(f,_,S,xu(_,v),E);Mu(_,v)}return null}function g(f,_,S,v){for(var E=null,T=null,w=_,x=_=0,A=null;w!==null&&x<S.length;x++){w.index>x?(A=w,w=null):A=w.sibling;var C=u(f,w,S[x],v);if(C===null){w===null&&(w=A);break}e&&w&&C.alternate===null&&t(f,w),_=a(C,_,x),T===null?E=C:T.sibling=C,T=C,w=A}if(x===S.length)return n(f,w),de&&ds(f,x),E;if(w===null){for(;x<S.length;x++)w=p(f,S[x],v),w!==null&&(_=a(w,_,x),T===null?E=w:T.sibling=w,T=w);return de&&ds(f,x),E}for(w=i(w);x<S.length;x++)A=d(w,f,x,S[x],v),A!==null&&(e&&A.alternate!==null&&w.delete(A.key===null?x:A.key),_=a(A,_,x),T===null?E=A:T.sibling=A,T=A);return e&&w.forEach(function(D){return t(f,D)}),de&&ds(f,x),E}function b(f,_,S,v){if(S==null)throw Error(nt(151));for(var E=null,T=null,w=_,x=_=0,A=null,C=S.next();w!==null&&!C.done;x++,C=S.next()){w.index>x?(A=w,w=null):A=w.sibling;var D=u(f,w,C.value,v);if(D===null){w===null&&(w=A);break}e&&w&&D.alternate===null&&t(f,w),_=a(D,_,x),T===null?E=D:T.sibling=D,T=D,w=A}if(C.done)return n(f,w),de&&ds(f,x),E;if(w===null){for(;!C.done;x++,C=S.next())C=p(f,C.value,v),C!==null&&(_=a(C,_,x),T===null?E=C:T.sibling=C,T=C);return de&&ds(f,x),E}for(w=i(w);!C.done;x++,C=S.next())C=d(w,f,x,C.value,v),C!==null&&(e&&C.alternate!==null&&w.delete(C.key===null?x:C.key),_=a(C,_,x),T===null?E=C:T.sibling=C,T=C);return e&&w.forEach(function(H){return t(f,H)}),de&&ds(f,x),E}function m(f,_,S,v){if(typeof S=="object"&&S!==null&&S.type===Ur&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case fu:t:{for(var E=S.key;_!==null;){if(_.key===E){if(E=S.type,E===Ur){if(_.tag===7){n(f,_.sibling),v=s(_,S.props.children),v.return=f,f=v;break t}}else if(_.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===Hs&&za(E)===_.type){n(f,_.sibling),v=s(_,S.props),_l(v,S),v.return=f,f=v;break t}n(f,_);break}else t(f,_);_=_.sibling}S.type===Ur?(v=Va(S.props.children,f.mode,v,S.key),v.return=f,f=v):(v=Iu(S.type,S.key,S.props,null,f.mode,v),_l(v,S),v.return=f,f=v)}return r(f);case Ml:t:{for(E=S.key;_!==null;){if(_.key===E)if(_.tag===4&&_.stateNode.containerInfo===S.containerInfo&&_.stateNode.implementation===S.implementation){n(f,_.sibling),v=s(_,S.children||[]),v.return=f,f=v;break t}else{n(f,_);break}else t(f,_);_=_.sibling}v=yp(S,f.mode,v),v.return=f,f=v}return r(f);case Hs:return S=za(S),m(f,_,S,v)}if(bl(S))return g(f,_,S,v);if(ml(S)){if(E=ml(S),typeof E!="function")throw Error(nt(150));return S=E.call(S),b(f,_,S,v)}if(typeof S.then=="function")return m(f,_,Su(S),v);if(S.$$typeof===ms)return m(f,_,xu(f,S),v);Mu(f,S)}return typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint"?(S=""+S,_!==null&&_.tag===6?(n(f,_.sibling),v=s(_,S),v.return=f,f=v):(n(f,_),v=vp(S,f.mode,v),v.return=f,f=v),r(f)):n(f,_)}return function(f,_,S,v){try{ql=0;var E=m(f,_,S,v);return Zr=null,E}catch(w){if(w===ho||w===Ah)throw w;var T=Qn(29,w,null,f.mode);return T.lanes=v,T.return=f,T}finally{}}}var Ya=lx(!0),cx=lx(!1),Vs=!1;function eg(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function lm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function $s(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ta(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(ve&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=Qu(e),tx(e,null,n),t}return Th(e,i,t,n),Qu(e)}function Ll(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,wy(e,n)}}function Sp(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var cm=!1;function Ul(){if(cm){var e=Yr;if(e!==null)throw e}}function Nl(e,t,n,i){cm=!1;var s=e.updateQueue;Vs=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var h=e.alternate;h!==null&&(h=h.updateQueue,o=h.lastBaseUpdate,o!==r&&(o===null?h.firstBaseUpdate=c:o.next=c,h.lastBaseUpdate=l))}if(a!==null){var p=s.baseState;r=0,h=c=l=null,o=a;do{var u=o.lane&-536870913,d=u!==o.lane;if(d?(he&u)===u:(i&u)===u){u!==0&&u===to&&(cm=!0),h!==null&&(h=h.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var g=e,b=o;u=t;var m=n;switch(b.tag){case 1:if(g=b.payload,typeof g=="function"){p=g.call(m,p,u);break t}p=g;break t;case 3:g.flags=g.flags&-65537|128;case 0:if(g=b.payload,u=typeof g=="function"?g.call(m,p,u):g,u==null)break t;p=Be({},p,u);break t;case 2:Vs=!0}}u=o.callback,u!==null&&(e.flags|=64,d&&(e.flags|=8192),d=s.callbacks,d===null?s.callbacks=[u]:d.push(u))}else d={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},h===null?(c=h=d,l=p):h=h.next=d,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;d=o,o=d.next,d.next=null,s.lastBaseUpdate=d,s.shared.pending=null}}while(!0);h===null&&(l=p),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=h,a===null&&(s.shared.lanes=0),ca|=r,e.lanes=r,e.memoizedState=p}}function ux(e,t){if(typeof e!="function")throw Error(nt(191,e));e.call(t)}function hx(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)ux(n[e],t)}var eo=Zi(null),eh=Zi(0);function xv(e,t){e=Ts,Ne(eh,e),Ne(eo,t),Ts=e|t.baseLanes}function um(){Ne(eh,Ts),Ne(eo,eo.current)}function ng(){Ts=eh.current,dn(eo),dn(eh)}var si=Zi(null),Mi=null;function ks(e){var t=e.alternate;Ne(Ye,Ye.current&1),Ne(si,e),Mi===null&&(t===null||eo.current!==null||t.memoizedState!==null)&&(Mi=e)}function hm(e){Ne(Ye,Ye.current),Ne(si,e),Mi===null&&(Mi=e)}function fx(e){e.tag===22?(Ne(Ye,Ye.current),Ne(si,e),Mi===null&&(Mi=e)):Ws(e)}function Ws(){Ne(Ye,Ye.current),Ne(si,si.current)}function Kn(e){dn(si),Mi===e&&(Mi=null),dn(Ye)}var Ye=Zi(0);function nh(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Dm(n)||Lm(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Ms=0,$t=null,Re=null,Qe=null,ih=!1,Jr=!1,Za=!1,sh=0,Yl=0,Kr=null,vT=0;function We(){throw Error(nt(321))}function ig(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!ii(e[n],t[n]))return!1;return!0}function sg(e,t,n,i,s,a){return Ms=a,$t=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,qt.H=e===null||e.memoizedState===null?kx:mg,Za=!1,a=n(i,s),Za=!1,Jr&&(a=px(t,n,i,s)),dx(e),a}function dx(e){qt.H=Zl;var t=Re!==null&&Re.next!==null;if(Ms=0,Qe=Re=$t=null,ih=!1,Yl=0,Kr=null,t)throw Error(nt(300));e===null||tn||(e=e.dependencies,e!==null&&$u(e)&&(tn=!0))}function px(e,t,n,i){$t=e;var s=0;do{if(Jr&&(Kr=null),Yl=0,Jr=!1,25<=s)throw Error(nt(301));if(s+=1,Qe=Re=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}qt.H=Wx,a=t(n,i)}while(Jr);return a}function yT(){var e=qt.H,t=e.useState()[0];return t=typeof t.then=="function"?oc(t):t,e=e.useState()[0],(Re!==null?Re.memoizedState:null)!==e&&($t.flags|=1024),t}function ag(){var e=sh!==0;return sh=0,e}function rg(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function og(e){if(ih){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}ih=!1}Ms=0,Qe=Re=$t=null,Jr=!1,Yl=sh=0,Kr=null}function Ln(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Qe===null?$t.memoizedState=Qe=e:Qe=Qe.next=e,Qe}function Ze(){if(Re===null){var e=$t.alternate;e=e!==null?e.memoizedState:null}else e=Re.next;var t=Qe===null?$t.memoizedState:Qe.next;if(t!==null)Qe=t,Re=e;else{if(e===null)throw $t.alternate===null?Error(nt(467)):Error(nt(310));Re=e,e={memoizedState:Re.memoizedState,baseState:Re.baseState,baseQueue:Re.baseQueue,queue:Re.queue,next:null},Qe===null?$t.memoizedState=Qe=e:Qe=Qe.next=e}return Qe}function wh(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function oc(e){var t=Yl;return Yl+=1,Kr===null&&(Kr=[]),e=ox(Kr,e,t),t=$t,(Qe===null?t.memoizedState:Qe.next)===null&&(t=t.alternate,qt.H=t===null||t.memoizedState===null?kx:mg),e}function Rh(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return oc(e);if(e.$$typeof===ms)return yn(e)}throw Error(nt(438,String(e)))}function lg(e){var t=null,n=$t.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=$t.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=wh(),$t.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=sE;return t.index++,n}function bs(e,t){return typeof t=="function"?t(e):t}function Pu(e){var t=Ze();return cg(t,Re,e)}function cg(e,t,n){var i=e.queue;if(i===null)throw Error(nt(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,h=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(he&p)===p:(Ms&p)===p){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===to&&(h=!0);else if((Ms&u)===u){c=c.next,u===to&&(h=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,r=a):l=l.next=p,$t.lanes|=u,ca|=u;p=c.action,Za&&n(a,p),a=c.hasEagerState?c.eagerState:n(a,p)}else u={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,$t.lanes|=p,ca|=p;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!ii(a,e.memoizedState)&&(tn=!0,h&&(n=Yr,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Mp(e){var t=Ze(),n=t.queue;if(n===null)throw Error(nt(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);ii(a,t.memoizedState)||(tn=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function mx(e,t,n){var i=$t,s=Ze(),a=de;if(a){if(n===void 0)throw Error(nt(407));n=n()}else n=t();var r=!ii((Re||s).memoizedState,n);if(r&&(s.memoizedState=n,tn=!0),s=s.queue,ug(vx.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||Qe!==null&&Qe.memoizedState.tag&1){if(i.flags|=2048,no(9,{destroy:void 0},_x.bind(null,i,s,n,t),null),De===null)throw Error(nt(349));a||(Ms&127)!==0||gx(i,t,n)}return n}function gx(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=$t.updateQueue,t===null?(t=wh(),$t.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function _x(e,t,n,i){t.value=n,t.getSnapshot=i,yx(t)&&xx(e)}function vx(e,t,n){return n(function(){yx(t)&&xx(e)})}function yx(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!ii(e,n)}catch{return!0}}function xx(e){var t=$a(e,2);t!==null&&kn(t,e,2)}function fm(e){var t=Ln();if(typeof e=="function"){var n=e;if(e=n(),Za){qs(!0);try{n()}finally{qs(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:bs,lastRenderedState:e},t}function Sx(e,t,n,i){return e.baseState=n,cg(e,Re,typeof i=="function"?i:bs)}function xT(e,t,n,i,s){if(Dh(e))throw Error(nt(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};qt.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,Mx(t,a)):(a.next=n.next,t.pending=n.next=a)}}function Mx(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=qt.T,r={};qt.T=r;try{var o=n(s,i),l=qt.S;l!==null&&l(r,o),Sv(e,t,o)}catch(c){dm(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),qt.T=a}}else try{a=n(s,i),Sv(e,t,a)}catch(c){dm(e,t,c)}}function Sv(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){Mv(e,t,i)},function(i){return dm(e,t,i)}):Mv(e,t,n)}function Mv(e,t,n){t.status="fulfilled",t.value=n,bx(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Mx(e,n)))}function dm(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,bx(t),t=t.next;while(t!==i)}e.action=null}function bx(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Ex(e,t){return t}function bv(e,t){if(de){var n=De.formState;if(n!==null){t:{var i=$t;if(de){if(Pe){e:{for(var s=Pe,a=Si;s.nodeType!==8;){if(!a){s=null;break e}if(s=bi(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Pe=bi(s.nextSibling),i=s.data==="F!";break t}}oa(i)}i=!1}i&&(t=n[0])}}return n=Ln(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ex,lastRenderedState:t},n.queue=i,n=Hx.bind(null,$t,i),i.dispatch=n,i=fm(!1),a=pg.bind(null,$t,!1,i.queue),i=Ln(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=xT.bind(null,$t,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function Ev(e){var t=Ze();return Tx(t,Re,e)}function Tx(e,t,n){if(t=cg(e,t,Ex)[0],e=Pu(bs)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=oc(t)}catch(r){throw r===ho?Ah:r}else i=t;t=Ze();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&($t.flags|=2048,no(9,{destroy:void 0},ST.bind(null,s,n),null)),[i,a,e]}function ST(e,t){e.action=t}function Tv(e){var t=Ze(),n=Re;if(n!==null)return Tx(t,n,e);Ze(),t=t.memoizedState,n=Ze();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function no(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=$t.updateQueue,t===null&&(t=wh(),$t.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function Ax(){return Ze().memoizedState}function Bu(e,t,n,i){var s=Ln();$t.flags|=e,s.memoizedState=no(1|t,{destroy:void 0},n,i===void 0?null:i)}function Ch(e,t,n,i){var s=Ze();i=i===void 0?null:i;var a=s.memoizedState.inst;Re!==null&&i!==null&&ig(i,Re.memoizedState.deps)?s.memoizedState=no(t,a,n,i):($t.flags|=e,s.memoizedState=no(1|t,a,n,i))}function Av(e,t){Bu(8390656,8,e,t)}function ug(e,t){Ch(2048,8,e,t)}function MT(e){$t.flags|=4;var t=$t.updateQueue;if(t===null)t=wh(),$t.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function wx(e){var t=Ze().memoizedState;return MT({ref:t,nextImpl:e}),function(){if((ve&2)!==0)throw Error(nt(440));return t.impl.apply(void 0,arguments)}}function Rx(e,t){return Ch(4,2,e,t)}function Cx(e,t){return Ch(4,4,e,t)}function Dx(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Lx(e,t,n){n=n!=null?n.concat([e]):null,Ch(4,4,Dx.bind(null,t,e),n)}function hg(){}function Ux(e,t){var n=Ze();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&ig(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function Nx(e,t){var n=Ze();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&ig(t,i[1]))return i[0];if(i=e(),Za){qs(!0);try{e()}finally{qs(!1)}}return n.memoizedState=[i,t],i}function fg(e,t,n){return n===void 0||(Ms&1073741824)!==0&&(he&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=SS(),$t.lanes|=e,ca|=e,n)}function Ix(e,t,n,i){return ii(n,t)?n:eo.current!==null?(e=fg(e,n,i),ii(e,t)||(tn=!0),e):(Ms&42)===0||(Ms&1073741824)!==0&&(he&261930)===0?(tn=!0,e.memoizedState=n):(e=SS(),$t.lanes|=e,ca|=e,t)}function Ox(e,t,n,i,s){var a=ye.p;ye.p=a!==0&&8>a?a:8;var r=qt.T,o={};qt.T=o,pg(e,!1,t,n);try{var l=s(),c=qt.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var h=_T(l,i);Il(e,t,h,ni(e))}else Il(e,t,i,ni(e))}catch(p){Il(e,t,{then:function(){},status:"rejected",reason:p},ni())}finally{ye.p=a,r!==null&&o.types!==null&&(r.types=o.types),qt.T=r}}function bT(){}function pm(e,t,n,i){if(e.tag!==5)throw Error(nt(476));var s=Px(e).queue;Ox(e,s,t,Ha,n===null?bT:function(){return Bx(e),n(i)})}function Px(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ha,baseState:Ha,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bs,lastRenderedState:Ha},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bs,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Bx(e){var t=Px(e);t.next===null&&(t=e.alternate.memoizedState),Il(e,t.next.queue,{},ni())}function dg(){return yn(Ql)}function zx(){return Ze().memoizedState}function Fx(){return Ze().memoizedState}function ET(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=ni();e=$s(n);var i=ta(t,e,n);i!==null&&(kn(i,t,n),Ll(i,t,n)),t={cache:jm()},e.payload=t;return}t=t.return}}function TT(e,t,n){var i=ni();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Dh(e)?Vx(t,n):(n=Zm(e,t,n,i),n!==null&&(kn(n,e,i),Gx(n,t,i)))}function Hx(e,t,n){var i=ni();Il(e,t,n,i)}function Il(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Dh(e))Vx(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,ii(o,r))return Th(e,t,s,0),De===null&&Eh(),!1}catch{}finally{}if(n=Zm(e,t,s,i),n!==null)return kn(n,e,i),Gx(n,t,i),!0}return!1}function pg(e,t,n,i){if(i={lane:2,revertLane:bg(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Dh(e)){if(t)throw Error(nt(479))}else t=Zm(e,n,i,2),t!==null&&kn(t,e,2)}function Dh(e){var t=e.alternate;return e===$t||t!==null&&t===$t}function Vx(e,t){Jr=ih=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Gx(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,wy(e,n)}}var Zl={readContext:yn,use:Rh,useCallback:We,useContext:We,useEffect:We,useImperativeHandle:We,useLayoutEffect:We,useInsertionEffect:We,useMemo:We,useReducer:We,useRef:We,useState:We,useDebugValue:We,useDeferredValue:We,useTransition:We,useSyncExternalStore:We,useId:We,useHostTransitionStatus:We,useFormState:We,useActionState:We,useOptimistic:We,useMemoCache:We,useCacheRefresh:We};Zl.useEffectEvent=We;var kx={readContext:yn,use:Rh,useCallback:function(e,t){return Ln().memoizedState=[e,t===void 0?null:t],e},useContext:yn,useEffect:Av,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Bu(4194308,4,Dx.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Bu(4194308,4,e,t)},useInsertionEffect:function(e,t){Bu(4,2,e,t)},useMemo:function(e,t){var n=Ln();t=t===void 0?null:t;var i=e();if(Za){qs(!0);try{e()}finally{qs(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=Ln();if(n!==void 0){var s=n(t);if(Za){qs(!0);try{n(t)}finally{qs(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=TT.bind(null,$t,e),[i.memoizedState,e]},useRef:function(e){var t=Ln();return e={current:e},t.memoizedState=e},useState:function(e){e=fm(e);var t=e.queue,n=Hx.bind(null,$t,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:hg,useDeferredValue:function(e,t){var n=Ln();return fg(n,e,t)},useTransition:function(){var e=fm(!1);return e=Ox.bind(null,$t,e.queue,!0,!1),Ln().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=$t,s=Ln();if(de){if(n===void 0)throw Error(nt(407));n=n()}else{if(n=t(),De===null)throw Error(nt(349));(he&127)!==0||gx(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,Av(vx.bind(null,i,a,e),[e]),i.flags|=2048,no(9,{destroy:void 0},_x.bind(null,i,a,n,t),null),n},useId:function(){var e=Ln(),t=De.identifierPrefix;if(de){var n=Xi,i=Wi;n=(i&~(1<<32-ei(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=sh++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=vT++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:dg,useFormState:bv,useActionState:bv,useOptimistic:function(e){var t=Ln();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=pg.bind(null,$t,!0,n),n.dispatch=t,[e,t]},useMemoCache:lg,useCacheRefresh:function(){return Ln().memoizedState=ET.bind(null,$t)},useEffectEvent:function(e){var t=Ln(),n={impl:e};return t.memoizedState=n,function(){if((ve&2)!==0)throw Error(nt(440));return n.impl.apply(void 0,arguments)}}},mg={readContext:yn,use:Rh,useCallback:Ux,useContext:yn,useEffect:ug,useImperativeHandle:Lx,useInsertionEffect:Rx,useLayoutEffect:Cx,useMemo:Nx,useReducer:Pu,useRef:Ax,useState:function(){return Pu(bs)},useDebugValue:hg,useDeferredValue:function(e,t){var n=Ze();return Ix(n,Re.memoizedState,e,t)},useTransition:function(){var e=Pu(bs)[0],t=Ze().memoizedState;return[typeof e=="boolean"?e:oc(e),t]},useSyncExternalStore:mx,useId:zx,useHostTransitionStatus:dg,useFormState:Ev,useActionState:Ev,useOptimistic:function(e,t){var n=Ze();return Sx(n,Re,e,t)},useMemoCache:lg,useCacheRefresh:Fx};mg.useEffectEvent=wx;var Wx={readContext:yn,use:Rh,useCallback:Ux,useContext:yn,useEffect:ug,useImperativeHandle:Lx,useInsertionEffect:Rx,useLayoutEffect:Cx,useMemo:Nx,useReducer:Mp,useRef:Ax,useState:function(){return Mp(bs)},useDebugValue:hg,useDeferredValue:function(e,t){var n=Ze();return Re===null?fg(n,e,t):Ix(n,Re.memoizedState,e,t)},useTransition:function(){var e=Mp(bs)[0],t=Ze().memoizedState;return[typeof e=="boolean"?e:oc(e),t]},useSyncExternalStore:mx,useId:zx,useHostTransitionStatus:dg,useFormState:Tv,useActionState:Tv,useOptimistic:function(e,t){var n=Ze();return Re!==null?Sx(n,Re,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:lg,useCacheRefresh:Fx};Wx.useEffectEvent=wx;function bp(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:Be({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var mm={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=ni(),s=$s(i);s.payload=t,n!=null&&(s.callback=n),t=ta(e,s,i),t!==null&&(kn(t,e,i),Ll(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=ni(),s=$s(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=ta(e,s,i),t!==null&&(kn(t,e,i),Ll(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=ni(),i=$s(n);i.tag=2,t!=null&&(i.callback=t),t=ta(e,i,n),t!==null&&(kn(t,e,n),Ll(t,e,n))}};function wv(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!kl(n,i)||!kl(s,a):!0}function Rv(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&mm.enqueueReplaceState(t,t.state,null)}function Ja(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=Be({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function Xx(e){Ku(e)}function qx(e){console.error(e)}function Yx(e){Ku(e)}function ah(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function Cv(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function gm(e,t,n){return n=$s(n),n.tag=3,n.payload={element:null},n.callback=function(){ah(e,t)},n}function Zx(e){return e=$s(e),e.tag=3,e}function Jx(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){Cv(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){Cv(t,n,i),typeof s!="function"&&(ea===null?ea=new Set([this]):ea.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function AT(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&uo(t,n,s,!0),n=si.current,n!==null){switch(n.tag){case 31:case 13:return Mi===null?uh():n.alternate===null&&Xe===0&&(Xe=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===th?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),Ip(e,i,s)),!1;case 22:return n.flags|=65536,i===th?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),Ip(e,i,s)),!1}throw Error(nt(435,n.tag))}return Ip(e,i,s),uh(),!1}if(de)return t=si.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==im&&(e=Error(nt(422),{cause:i}),Xl(xi(e,n)))):(i!==im&&(t=Error(nt(423),{cause:i}),Xl(xi(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=xi(i,n),s=gm(e.stateNode,i,s),Sp(e,s),Xe!==4&&(Xe=2)),!1;var a=Error(nt(520),{cause:i});if(a=xi(a,n),Bl===null?Bl=[a]:Bl.push(a),Xe!==4&&(Xe=2),t===null)return!0;i=xi(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=gm(n.stateNode,i,e),Sp(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(ea===null||!ea.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=Zx(s),Jx(s,e,n,i),Sp(n,s),!1}n=n.return}while(n!==null);return!1}var gg=Error(nt(461)),tn=!1;function gn(e,t,n,i){t.child=e===null?cx(t,null,n,i):Ya(t,e.child,n,i)}function Dv(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return qa(t),i=sg(e,t,n,r,a,s),o=ag(),e!==null&&!tn?(rg(e,t,s),Es(e,t,s)):(de&&o&&Km(t),t.flags|=1,gn(e,t,i,s),t.child)}function Lv(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!Jm(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Kx(e,t,a,i,s)):(e=Iu(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!_g(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:kl,n(r,i)&&e.ref===t.ref)return Es(e,t,s)}return t.flags|=1,e=vs(a,i),e.ref=t.ref,e.return=t,t.child=e}function Kx(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(kl(a,i)&&e.ref===t.ref)if(tn=!1,t.pendingProps=i=a,_g(e,s))(e.flags&131072)!==0&&(tn=!0);else return t.lanes=e.lanes,Es(e,t,s)}return _m(e,t,n,i,s)}function Qx(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return Uv(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ou(t,a!==null?a.cachePool:null),a!==null?xv(t,a):um(),fx(t);else return i=t.lanes=536870912,Uv(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(Ou(t,a.cachePool),xv(t,a),Ws(t),t.memoizedState=null):(e!==null&&Ou(t,null),um(),Ws(t));return gn(e,t,s,n),t.child}function Tl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Uv(e,t,n,i,s){var a=$m();return a=a===null?null:{parent:$e._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Ou(t,null),um(),fx(t),e!==null&&uo(e,t,i,!0),t.childLanes=s,null}function zu(e,t){return t=rh({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Nv(e,t,n){return Ya(t,e.child,null,n),e=zu(t,t.pendingProps),e.flags|=2,Kn(t),t.memoizedState=null,e}function wT(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(de){if(i.mode==="hidden")return e=zu(t,i),t.lanes=536870912,Tl(null,e);if(hm(t),(e=Pe)?(e=kS(e,Si),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ra!==null?{id:Wi,overflow:Xi}:null,retryLane:536870912,hydrationErrors:null},n=nx(e),n.return=t,t.child=n,vn=t,Pe=null)):e=null,e===null)throw oa(t);return t.lanes=536870912,null}return zu(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(hm(t),s)if(t.flags&256)t.flags&=-257,t=Nv(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(nt(558));else if(tn||uo(e,t,n,!1),s=(n&e.childLanes)!==0,tn||s){if(i=De,i!==null&&(r=Ry(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,$a(e,r),kn(i,e,r),gg;uh(),t=Nv(e,t,n)}else e=a.treeContext,Pe=bi(r.nextSibling),vn=t,de=!0,js=null,Si=!1,e!==null&&sx(t,e),t=zu(t,i),t.flags|=4096;return t}return e=vs(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Fu(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(nt(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function _m(e,t,n,i,s){return qa(t),n=sg(e,t,n,i,void 0,s),i=ag(),e!==null&&!tn?(rg(e,t,s),Es(e,t,s)):(de&&i&&Km(t),t.flags|=1,gn(e,t,n,s),t.child)}function Iv(e,t,n,i,s,a){return qa(t),t.updateQueue=null,n=px(t,i,n,s),dx(e),i=ag(),e!==null&&!tn?(rg(e,t,a),Es(e,t,a)):(de&&i&&Km(t),t.flags|=1,gn(e,t,n,a),t.child)}function Ov(e,t,n,i,s){if(qa(t),t.stateNode===null){var a=Hr,r=n.contextType;typeof r=="object"&&r!==null&&(a=yn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=mm,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},eg(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?yn(r):Hr,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&(bp(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&mm.enqueueReplaceState(a,a.state,null),Nl(t,i,a,s),Ul(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=Ja(n,o);a.props=l;var c=a.context,h=n.contextType;r=Hr,typeof h=="object"&&h!==null&&(r=yn(h));var p=n.getDerivedStateFromProps;h=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,h||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&Rv(t,a,i,r),Vs=!1;var u=t.memoizedState;a.state=u,Nl(t,i,a,s),Ul(),c=t.memoizedState,o||u!==c||Vs?(typeof p=="function"&&(bp(t,n,p,i),c=t.memoizedState),(l=Vs||wv(t,n,l,i,u,c,r))?(h||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,lm(e,t),r=t.memoizedProps,h=Ja(n,r),a.props=h,p=t.pendingProps,u=a.context,c=n.contextType,l=Hr,typeof c=="object"&&c!==null&&(l=yn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==p||u!==l)&&Rv(t,a,i,l),Vs=!1,u=t.memoizedState,a.state=u,Nl(t,i,a,s),Ul();var d=t.memoizedState;r!==p||u!==d||Vs||e!==null&&e.dependencies!==null&&$u(e.dependencies)?(typeof o=="function"&&(bp(t,n,o,i),d=t.memoizedState),(h=Vs||wv(t,n,h,i,u,d,l)||e!==null&&e.dependencies!==null&&$u(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,d,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,d,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=d),a.props=i,a.state=d,a.context=l,i=h):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,Fu(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=Ya(t,e.child,null,s),t.child=Ya(t,null,n,s)):gn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=Es(e,t,s),e}function Pv(e,t,n,i){return Xa(),t.flags|=256,gn(e,t,n,i),t.child}var Ep={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Tp(e){return{baseLanes:e,cachePool:rx()}}function Ap(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=jn),e}function jx(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(Ye.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(de){if(s?ks(t):Ws(t),(e=Pe)?(e=kS(e,Si),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ra!==null?{id:Wi,overflow:Xi}:null,retryLane:536870912,hydrationErrors:null},n=nx(e),n.return=t,t.child=n,vn=t,Pe=null)):e=null,e===null)throw oa(t);return Lm(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(Ws(t),s=t.mode,o=rh({mode:"hidden",children:o},s),i=Va(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=Tp(n),i.childLanes=Ap(e,r,n),t.memoizedState=Ep,Tl(null,i)):(ks(t),vm(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(ks(t),t.flags&=-257,t=wp(e,t,n)):t.memoizedState!==null?(Ws(t),t.child=e.child,t.flags|=128,t=null):(Ws(t),o=i.fallback,s=t.mode,i=rh({mode:"visible",children:i.children},s),o=Va(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,Ya(t,e.child,null,n),i=t.child,i.memoizedState=Tp(n),i.childLanes=Ap(e,r,n),t.memoizedState=Ep,t=Tl(null,i));else if(ks(t),Lm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error(nt(419)),i.stack="",i.digest=r,Xl({value:i,source:null,stack:null}),t=wp(e,t,n)}else if(tn||uo(e,t,n,!1),r=(n&e.childLanes)!==0,tn||r){if(r=De,r!==null&&(i=Ry(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,$a(e,i),kn(r,e,i),gg;Dm(o)||uh(),t=wp(e,t,n)}else Dm(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Pe=bi(o.nextSibling),vn=t,de=!0,js=null,Si=!1,e!==null&&sx(t,e),t=vm(t,i.children),t.flags|=4096);return t}return s?(Ws(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=vs(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=vs(c,o):(o=Va(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,Tl(null,i),i=t.child,o=e.child.memoizedState,o===null?o=Tp(n):(s=o.cachePool,s!==null?(l=$e._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=rx(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=Ap(e,r,n),t.memoizedState=Ep,Tl(e.child,i)):(ks(t),n=e.child,e=n.sibling,n=vs(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function vm(e,t){return t=rh({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function rh(e,t){return e=Qn(22,e,null,t),e.lanes=0,e}function wp(e,t,n){return Ya(t,e.child,null,n),e=vm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Bv(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),am(e.return,t,n)}function Rp(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function $x(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=Ye.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,Ne(Ye,r),gn(e,t,i,n),i=de?Wl:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Bv(e,n,t);else if(e.tag===19)Bv(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&nh(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),Rp(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&nh(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}Rp(t,!0,n,null,a,i);break;case"together":Rp(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function Es(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),ca|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(uo(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(nt(153));if(t.child!==null){for(e=t.child,n=vs(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=vs(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function _g(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&$u(e)))}function RT(e,t,n){switch(t.tag){case 3:qu(t,t.stateNode.containerInfo),Gs(t,$e,e.memoizedState.cache),Xa();break;case 27:case 5:qp(t);break;case 4:qu(t,t.stateNode.containerInfo);break;case 10:Gs(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,hm(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(ks(t),t.flags|=128,null):(n&t.child.childLanes)!==0?jx(e,t,n):(ks(t),e=Es(e,t,n),e!==null?e.sibling:null);ks(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(uo(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return $x(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),Ne(Ye,Ye.current),i)break;return null;case 22:return t.lanes=0,Qx(e,t,n,t.pendingProps);case 24:Gs(t,$e,e.memoizedState.cache)}return Es(e,t,n)}function tS(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)tn=!0;else{if(!_g(e,n)&&(t.flags&128)===0)return tn=!1,RT(e,t,n);tn=(e.flags&131072)!==0}else tn=!1,de&&(t.flags&1048576)!==0&&ix(t,Wl,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=za(t.elementType),t.type=e,typeof e=="function")Jm(e)?(i=Ja(e,i),t.tag=1,t=Ov(null,t,e,i,n)):(t.tag=0,t=_m(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===Om){t.tag=11,t=Dv(null,t,e,i,n);break t}else if(s===Pm){t.tag=14,t=Lv(null,t,e,i,n);break t}}throw t=Wp(e)||e,Error(nt(306,t,""))}}return t;case 0:return _m(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=Ja(i,t.pendingProps),Ov(e,t,i,s,n);case 3:t:{if(qu(t,t.stateNode.containerInfo),e===null)throw Error(nt(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,lm(e,t),Nl(t,i,null,n);var r=t.memoizedState;if(i=r.cache,Gs(t,$e,i),i!==a.cache&&rm(t,[$e],n,!0),Ul(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Pv(e,t,i,n);break t}else if(i!==s){s=xi(Error(nt(424)),t),Xl(s),t=Pv(e,t,i,n);break t}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Pe=bi(e.firstChild),vn=t,de=!0,js=null,Si=!0,n=cx(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Xa(),i===s){t=Es(e,t,n);break t}gn(e,t,i,n)}t=t.child}return t;case 26:return Fu(e,t),e===null?(n=ay(t.type,null,t.pendingProps,null))?t.memoizedState=n:de||(n=t.type,e=t.pendingProps,i=ph(Qs.current).createElement(n),i[_n]=t,i[Wn]=e,xn(i,n,e),fn(i),t.stateNode=i):t.memoizedState=ay(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return qp(t),e===null&&de&&(i=t.stateNode=WS(t.type,t.pendingProps,Qs.current),vn=t,Si=!0,s=Pe,ha(t.type)?(Um=s,Pe=bi(i.firstChild)):Pe=s),gn(e,t,t.pendingProps.children,n),Fu(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&de&&((s=i=Pe)&&(i=nA(i,t.type,t.pendingProps,Si),i!==null?(t.stateNode=i,vn=t,Pe=bi(i.firstChild),Si=!1,s=!0):s=!1),s||oa(t)),qp(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,Rm(s,a)?i=null:r!==null&&Rm(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=sg(e,t,yT,null,null,n),Ql._currentValue=s),Fu(e,t),gn(e,t,i,n),t.child;case 6:return e===null&&de&&((e=n=Pe)&&(n=iA(n,t.pendingProps,Si),n!==null?(t.stateNode=n,vn=t,Pe=null,e=!0):e=!1),e||oa(t)),null;case 13:return jx(e,t,n);case 4:return qu(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Ya(t,null,i,n):gn(e,t,i,n),t.child;case 11:return Dv(e,t,t.type,t.pendingProps,n);case 7:return gn(e,t,t.pendingProps,n),t.child;case 8:return gn(e,t,t.pendingProps.children,n),t.child;case 12:return gn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,Gs(t,t.type,i.value),gn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,qa(t),s=yn(s),i=i(s),t.flags|=1,gn(e,t,i,n),t.child;case 14:return Lv(e,t,t.type,t.pendingProps,n);case 15:return Kx(e,t,t.type,t.pendingProps,n);case 19:return $x(e,t,n);case 31:return wT(e,t,n);case 22:return Qx(e,t,n,t.pendingProps);case 24:return qa(t),i=yn($e),e===null?(s=$m(),s===null&&(s=De,a=jm(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},eg(t),Gs(t,$e,s)):((e.lanes&n)!==0&&(lm(e,t),Nl(t,null,null,n),Ul()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),Gs(t,$e,i)):(i=a.cache,Gs(t,$e,i),i!==s.cache&&rm(t,[$e],n,!0))),gn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(nt(156,t.tag))}function cs(e){e.flags|=4}function Cp(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(ES())e.flags|=8192;else throw ka=th,tg}else e.flags&=-16777217}function zv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!YS(t))if(ES())e.flags|=8192;else throw ka=th,tg}function bu(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Ty():536870912,e.lanes|=t,io|=t)}function vl(e,t){if(!de)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function Oe(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function CT(e,t,n){var i=t.pendingProps;switch(Qm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Oe(t),null;case 1:return Oe(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),ys($e),Qr(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Rr(t)?cs(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,xp())),Oe(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(cs(t),a!==null?(Oe(t),zv(t,a)):(Oe(t),Cp(t,s,null,i,n))):a?a!==e.memoizedState?(cs(t),Oe(t),zv(t,a)):(Oe(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&cs(t),Oe(t),Cp(t,s,e,i,n)),null;case 27:if(Yu(t),n=Qs.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&cs(t);else{if(!i){if(t.stateNode===null)throw Error(nt(166));return Oe(t),null}e=Yi.current,Rr(t)?dv(t,e):(e=WS(s,i,n),t.stateNode=e,cs(t))}return Oe(t),null;case 5:if(Yu(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&cs(t);else{if(!i){if(t.stateNode===null)throw Error(nt(166));return Oe(t),null}if(a=Yi.current,Rr(t))dv(t,a);else{var r=ph(Qs.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[_n]=t,a[Wn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(xn(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&cs(t)}}return Oe(t),Cp(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&cs(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(nt(166));if(e=Qs.current,Rr(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=vn,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[_n]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||HS(e.nodeValue,n)),e||oa(t,!0)}else e=ph(e).createTextNode(i),e[_n]=t,t.stateNode=e}return Oe(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Rr(t),n!==null){if(e===null){if(!i)throw Error(nt(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(557));e[_n]=t}else Xa(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Oe(t),e=!1}else n=xp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(Kn(t),t):(Kn(t),null);if((t.flags&128)!==0)throw Error(nt(558))}return Oe(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Rr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error(nt(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(nt(317));s[_n]=t}else Xa(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Oe(t),s=!1}else s=xp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(Kn(t),t):(Kn(t),null)}return Kn(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),bu(t,t.updateQueue),Oe(t),null);case 4:return Qr(),e===null&&Eg(t.stateNode.containerInfo),Oe(t),null;case 10:return ys(t.type),Oe(t),null;case 19:if(dn(Ye),i=t.memoizedState,i===null)return Oe(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)vl(i,!1);else{if(Xe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=nh(e),a!==null){for(t.flags|=128,vl(i,!1),e=a.updateQueue,t.updateQueue=e,bu(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)ex(n,e),n=n.sibling;return Ne(Ye,Ye.current&1|2),de&&ds(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&$n()>lh&&(t.flags|=128,s=!0,vl(i,!1),t.lanes=4194304)}else{if(!s)if(e=nh(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,bu(t,e),vl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!de)return Oe(t),null}else 2*$n()-i.renderingStartTime>lh&&n!==536870912&&(t.flags|=128,s=!0,vl(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=$n(),e.sibling=null,n=Ye.current,Ne(Ye,s?n&1|2:n&1),de&&ds(t,i.treeForkCount),e):(Oe(t),null);case 22:case 23:return Kn(t),ng(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(Oe(t),t.subtreeFlags&6&&(t.flags|=8192)):Oe(t),n=t.updateQueue,n!==null&&bu(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&dn(Ga),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ys($e),Oe(t),null;case 25:return null;case 30:return null}throw Error(nt(156,t.tag))}function DT(e,t){switch(Qm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ys($e),Qr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Yu(t),null;case 31:if(t.memoizedState!==null){if(Kn(t),t.alternate===null)throw Error(nt(340));Xa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Kn(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(nt(340));Xa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return dn(Ye),null;case 4:return Qr(),null;case 10:return ys(t.type),null;case 22:case 23:return Kn(t),ng(),e!==null&&dn(Ga),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ys($e),null;case 25:return null;default:return null}}function eS(e,t){switch(Qm(t),t.tag){case 3:ys($e),Qr();break;case 26:case 27:case 5:Yu(t);break;case 4:Qr();break;case 31:t.memoizedState!==null&&Kn(t);break;case 13:Kn(t);break;case 19:dn(Ye);break;case 10:ys(t.type);break;case 22:case 23:Kn(t),ng(),e!==null&&dn(Ga);break;case 24:ys($e)}}function lc(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){Ee(t,t.return,o)}}function la(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(h){Ee(s,l,h)}}}i=i.next}while(i!==a)}}catch(h){Ee(t,t.return,h)}}function nS(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{hx(t,n)}catch(i){Ee(e,e.return,i)}}}function iS(e,t,n){n.props=Ja(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){Ee(e,t,i)}}function Ol(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){Ee(e,t,s)}}function qi(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){Ee(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){Ee(e,t,s)}else n.current=null}function sS(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){Ee(e,e.return,s)}}function Dp(e,t,n){try{var i=e.stateNode;KT(i,e.type,n,t),i[Wn]=t}catch(s){Ee(e,e.return,s)}}function aS(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&ha(e.type)||e.tag===4}function Lp(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||aS(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&ha(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function ym(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=gs));else if(i!==4&&(i===27&&ha(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(ym(e,t,n),e=e.sibling;e!==null;)ym(e,t,n),e=e.sibling}function oh(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&ha(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(oh(e,t,n),e=e.sibling;e!==null;)oh(e,t,n),e=e.sibling}function rS(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);xn(t,i,n),t[_n]=e,t[Wn]=n}catch(a){Ee(e,e.return,a)}}var ps=!1,je=!1,Up=!1,Fv=typeof WeakSet=="function"?WeakSet:Set,hn=null;function LT(e,t){if(e=e.containerInfo,Am=vh,e=Yy(e),qm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,h=0,p=e,u=null;e:for(;;){for(var d;p!==n||s!==0&&p.nodeType!==3||(o=r+s),p!==a||i!==0&&p.nodeType!==3||(l=r+i),p.nodeType===3&&(r+=p.nodeValue.length),(d=p.firstChild)!==null;)u=p,p=d;for(;;){if(p===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++h===i&&(l=r),(d=p.nextSibling)!==null)break;p=u,u=p.parentNode}p=d}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(wm={focusedElem:e,selectionRange:n},vh=!1,hn=t;hn!==null;)if(t=hn,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,hn=e;else for(;hn!==null;){switch(t=hn,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var g=Ja(n.type,s);e=i.getSnapshotBeforeUpdate(g,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(b){Ee(n,n.return,b)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)Cm(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Cm(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(nt(163))}if(e=t.sibling,e!==null){e.return=t.return,hn=e;break}hn=t.return}}function oS(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:hs(e,n),i&4&&lc(5,n);break;case 1:if(hs(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){Ee(n,n.return,r)}else{var s=Ja(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){Ee(n,n.return,r)}}i&64&&nS(n),i&512&&Ol(n,n.return);break;case 3:if(hs(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{hx(e,t)}catch(r){Ee(n,n.return,r)}}break;case 27:t===null&&i&4&&rS(n);case 26:case 5:hs(e,n),t===null&&i&4&&sS(n),i&512&&Ol(n,n.return);break;case 12:hs(e,n);break;case 31:hs(e,n),i&4&&uS(e,n);break;case 13:hs(e,n),i&4&&hS(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=HT.bind(null,n),sA(e,n))));break;case 22:if(i=n.memoizedState!==null||ps,!i){t=t!==null&&t.memoizedState!==null||je,s=ps;var a=je;ps=i,(je=t)&&!a?fs(e,n,(n.subtreeFlags&8772)!==0):hs(e,n),ps=s,je=a}break;case 30:break;default:hs(e,n)}}function lS(e){var t=e.alternate;t!==null&&(e.alternate=null,lS(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Hm(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var He=null,Vn=!1;function us(e,t,n){for(n=n.child;n!==null;)cS(e,t,n),n=n.sibling}function cS(e,t,n){if(ti&&typeof ti.onCommitFiberUnmount=="function")try{ti.onCommitFiberUnmount(ec,n)}catch{}switch(n.tag){case 26:je||qi(n,t),us(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:je||qi(n,t);var i=He,s=Vn;ha(n.type)&&(He=n.stateNode,Vn=!1),us(e,t,n),Fl(n.stateNode),He=i,Vn=s;break;case 5:je||qi(n,t);case 6:if(i=He,s=Vn,He=null,us(e,t,n),He=i,Vn=s,He!==null)if(Vn)try{(He.nodeType===9?He.body:He.nodeName==="HTML"?He.ownerDocument.body:He).removeChild(n.stateNode)}catch(a){Ee(n,t,a)}else try{He.removeChild(n.stateNode)}catch(a){Ee(n,t,a)}break;case 18:He!==null&&(Vn?(e=He,ty(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),oo(e)):ty(He,n.stateNode));break;case 4:i=He,s=Vn,He=n.stateNode.containerInfo,Vn=!0,us(e,t,n),He=i,Vn=s;break;case 0:case 11:case 14:case 15:la(2,n,t),je||la(4,n,t),us(e,t,n);break;case 1:je||(qi(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&iS(n,t,i)),us(e,t,n);break;case 21:us(e,t,n);break;case 22:je=(i=je)||n.memoizedState!==null,us(e,t,n),je=i;break;default:us(e,t,n)}}function uS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{oo(e)}catch(n){Ee(t,t.return,n)}}}function hS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{oo(e)}catch(n){Ee(t,t.return,n)}}function UT(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Fv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Fv),t;default:throw Error(nt(435,e.tag))}}function Eu(e,t){var n=UT(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=VT.bind(null,e,i);i.then(s,s)}})}function Fn(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(ha(o.type)){He=o.stateNode,Vn=!1;break t}break;case 5:He=o.stateNode,Vn=!1;break t;case 3:case 4:He=o.stateNode.containerInfo,Vn=!0;break t}o=o.return}if(He===null)throw Error(nt(160));cS(a,r,s),He=null,Vn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)fS(t,e),t=t.sibling}var Di=null;function fS(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Fn(t,e),Hn(e),i&4&&(la(3,e,e.return),lc(3,e),la(5,e,e.return));break;case 1:Fn(t,e),Hn(e),i&512&&(je||n===null||qi(n,n.return)),i&64&&ps&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Di;if(Fn(t,e),Hn(e),i&512&&(je||n===null||qi(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[sc]||a[_n]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),xn(a,i,n),a[_n]=e,fn(a),i=a;break t;case"link":var r=oy("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),xn(a,i,n),s.head.appendChild(a);break;case"meta":if(r=oy("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),xn(a,i,n),s.head.appendChild(a);break;default:throw Error(nt(468,i))}a[_n]=e,fn(a),i=a}e.stateNode=i}else ly(s,e.type,e.stateNode);else e.stateNode=ry(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?ly(s,e.type,e.stateNode):ry(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&Dp(e,e.memoizedProps,n.memoizedProps)}break;case 27:Fn(t,e),Hn(e),i&512&&(je||n===null||qi(n,n.return)),n!==null&&i&4&&Dp(e,e.memoizedProps,n.memoizedProps);break;case 5:if(Fn(t,e),Hn(e),i&512&&(je||n===null||qi(n,n.return)),e.flags&32){s=e.stateNode;try{$r(s,"")}catch(g){Ee(e,e.return,g)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,Dp(e,s,n!==null?n.memoizedProps:s)),i&1024&&(Up=!0);break;case 6:if(Fn(t,e),Hn(e),i&4){if(e.stateNode===null)throw Error(nt(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(g){Ee(e,e.return,g)}}break;case 3:if(Gu=null,s=Di,Di=mh(t.containerInfo),Fn(t,e),Di=s,Hn(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{oo(t.containerInfo)}catch(g){Ee(e,e.return,g)}Up&&(Up=!1,dS(e));break;case 4:i=Di,Di=mh(e.stateNode.containerInfo),Fn(t,e),Hn(e),Di=i;break;case 12:Fn(t,e),Hn(e);break;case 31:Fn(t,e),Hn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Eu(e,i)));break;case 13:Fn(t,e),Hn(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Lh=$n()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Eu(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=ps,h=je;if(ps=c||s,je=h||l,Fn(t,e),je=h,ps=c,Hn(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||ps||je||Fa(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var p=l.memoizedProps.style,u=p!=null&&p.hasOwnProperty("display")?p.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(g){Ee(l,l.return,g)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(g){Ee(l,l.return,g)}}}else if(t.tag===18){if(n===null){l=t;try{var d=l.stateNode;s?ey(d,!0):ey(l.stateNode,!1)}catch(g){Ee(l,l.return,g)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Eu(e,n))));break;case 19:Fn(t,e),Hn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Eu(e,i)));break;case 30:break;case 21:break;default:Fn(t,e),Hn(e)}}function Hn(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(aS(i)){n=i;break}i=i.return}if(n==null)throw Error(nt(160));switch(n.tag){case 27:var s=n.stateNode,a=Lp(e);oh(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&($r(r,""),n.flags&=-33);var o=Lp(e);oh(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Lp(e);ym(e,c,l);break;default:throw Error(nt(161))}}catch(h){Ee(e,e.return,h)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function dS(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;dS(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function hs(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)oS(e,t.alternate,t),t=t.sibling}function Fa(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:la(4,t,t.return),Fa(t);break;case 1:qi(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&iS(t,t.return,n),Fa(t);break;case 27:Fl(t.stateNode);case 26:case 5:qi(t,t.return),Fa(t);break;case 22:t.memoizedState===null&&Fa(t);break;case 30:Fa(t);break;default:Fa(t)}e=e.sibling}}function fs(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:fs(s,a,n),lc(4,a);break;case 1:if(fs(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){Ee(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)ux(l[s],o)}catch(c){Ee(i,i.return,c)}}n&&r&64&&nS(a),Ol(a,a.return);break;case 27:rS(a);case 26:case 5:fs(s,a,n),n&&i===null&&r&4&&sS(a),Ol(a,a.return);break;case 12:fs(s,a,n);break;case 31:fs(s,a,n),n&&r&4&&uS(s,a);break;case 13:fs(s,a,n),n&&r&4&&hS(s,a);break;case 22:a.memoizedState===null&&fs(s,a,n),Ol(a,a.return);break;case 30:break;default:fs(s,a,n)}t=t.sibling}}function vg(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&rc(n))}function yg(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&rc(e))}function Ci(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)pS(e,t,n,i),t=t.sibling}function pS(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:Ci(e,t,n,i),s&2048&&lc(9,t);break;case 1:Ci(e,t,n,i);break;case 3:Ci(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&rc(e)));break;case 12:if(s&2048){Ci(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){Ee(t,t.return,l)}}else Ci(e,t,n,i);break;case 31:Ci(e,t,n,i);break;case 13:Ci(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?Ci(e,t,n,i):Pl(e,t):a._visibility&2?Ci(e,t,n,i):(a._visibility|=2,Dr(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&vg(r,t);break;case 24:Ci(e,t,n,i),s&2048&&yg(t.alternate,t);break;default:Ci(e,t,n,i)}}function Dr(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:Dr(a,r,o,l,s),lc(8,r);break;case 23:break;case 22:var h=r.stateNode;r.memoizedState!==null?h._visibility&2?Dr(a,r,o,l,s):Pl(a,r):(h._visibility|=2,Dr(a,r,o,l,s)),s&&c&2048&&vg(r.alternate,r);break;case 24:Dr(a,r,o,l,s),s&&c&2048&&yg(r.alternate,r);break;default:Dr(a,r,o,l,s)}t=t.sibling}}function Pl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:Pl(n,i),s&2048&&vg(i.alternate,i);break;case 24:Pl(n,i),s&2048&&yg(i.alternate,i);break;default:Pl(n,i)}t=t.sibling}}var Al=8192;function Cr(e,t,n){if(e.subtreeFlags&Al)for(e=e.child;e!==null;)mS(e,t,n),e=e.sibling}function mS(e,t,n){switch(e.tag){case 26:Cr(e,t,n),e.flags&Al&&e.memoizedState!==null&&gA(n,Di,e.memoizedState,e.memoizedProps);break;case 5:Cr(e,t,n);break;case 3:case 4:var i=Di;Di=mh(e.stateNode.containerInfo),Cr(e,t,n),Di=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Al,Al=16777216,Cr(e,t,n),Al=i):Cr(e,t,n));break;default:Cr(e,t,n)}}function gS(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function yl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];hn=i,vS(i,e)}gS(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)_S(e),e=e.sibling}function _S(e){switch(e.tag){case 0:case 11:case 15:yl(e),e.flags&2048&&la(9,e,e.return);break;case 3:yl(e);break;case 12:yl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Hu(e)):yl(e);break;default:yl(e)}}function Hu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];hn=i,vS(i,e)}gS(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:la(8,t,t.return),Hu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Hu(t));break;default:Hu(t)}e=e.sibling}}function vS(e,t){for(;hn!==null;){var n=hn;switch(n.tag){case 0:case 11:case 15:la(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:rc(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,hn=i;else t:for(n=e;hn!==null;){i=hn;var s=i.sibling,a=i.return;if(lS(i),i===n){hn=null;break t}if(s!==null){s.return=a,hn=s;break t}hn=a}}}var NT={getCacheForType:function(e){var t=yn($e),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return yn($e).controller.signal}},IT=typeof WeakMap=="function"?WeakMap:Map,ve=0,De=null,le=null,he=0,be=0,Jn=null,Zs=!1,fo=!1,xg=!1,Ts=0,Xe=0,ca=0,Wa=0,Sg=0,jn=0,io=0,Bl=null,Gn=null,xm=!1,Lh=0,yS=0,lh=1/0,ch=null,ea=null,rn=0,na=null,so=null,xs=0,Sm=0,Mm=null,xS=null,zl=0,bm=null;function ni(){return(ve&2)!==0&&he!==0?he&-he:qt.T!==null?bg():Cy()}function SS(){if(jn===0)if((he&536870912)===0||de){var e=pu;pu<<=1,(pu&3932160)===0&&(pu=262144),jn=e}else jn=536870912;return e=si.current,e!==null&&(e.flags|=32),jn}function kn(e,t,n){(e===De&&(be===2||be===9)||e.cancelPendingCommit!==null)&&(ao(e,0),Js(e,he,jn,!1)),ic(e,n),((ve&2)===0||e!==De)&&(e===De&&((ve&2)===0&&(Wa|=n),Xe===4&&Js(e,he,jn,!1)),Ji(e))}function MS(e,t,n){if((ve&6)!==0)throw Error(nt(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||nc(e,t),s=i?BT(e,t):Np(e,t,!0),a=i;do{if(s===0){fo&&!i&&Js(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!OT(n)){s=Np(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=Bl;var l=o.current.memoizedState.isDehydrated;if(l&&(ao(o,r).flags|=256),r=Np(o,r,!1),r!==2){if(xg&&!l){o.errorRecoveryDisabledLanes|=a,Wa|=a,s=4;break t}a=Gn,Gn=s,a!==null&&(Gn===null?Gn=a:Gn.push.apply(Gn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){ao(e,0),Js(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error(nt(345));case 4:if((t&4194048)!==t)break;case 6:Js(i,t,jn,!Zs);break t;case 2:Gn=null;break;case 3:case 5:break;default:throw Error(nt(329))}if((t&62914560)===t&&(s=Lh+300-$n(),10<s)){if(Js(i,t,jn,!Zs),xh(i,0,!0)!==0)break t;xs=t,i.timeoutHandle=GS(Hv.bind(null,i,n,Gn,ch,xm,t,jn,Wa,io,Zs,a,"Throttled",-0,0),s);break t}Hv(i,n,Gn,ch,xm,t,jn,Wa,io,Zs,a,null,-0,0)}}break}while(!0);Ji(e)}function Hv(e,t,n,i,s,a,r,o,l,c,h,p,u,d){if(e.timeoutHandle=-1,p=t.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:gs},mS(t,a,p);var g=(a&62914560)===a?Lh-$n():(a&4194048)===a?yS-$n():0;if(g=_A(p,g),g!==null){xs=a,e.cancelPendingCommit=g(Gv.bind(null,e,t,a,n,i,s,r,o,l,h,p,null,u,d)),Js(e,a,r,!c);return}}Gv(e,t,a,n,i,s,r,o,l)}function OT(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!ii(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Js(e,t,n,i){t&=~Sg,t&=~Wa,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-ei(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&Ay(e,n,t)}function Uh(){return(ve&6)===0?(cc(0,!1),!1):!0}function Mg(){if(le!==null){if(be===0)var e=le.return;else e=le,_s=tr=null,og(e),Zr=null,ql=0,e=le;for(;e!==null;)eS(e.alternate,e),e=e.return;le=null}}function ao(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,$T(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),xs=0,Mg(),De=e,le=n=vs(e.current,null),he=t,be=0,Jn=null,Zs=!1,fo=nc(e,t),xg=!1,io=jn=Sg=Wa=ca=Xe=0,Gn=Bl=null,xm=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-ei(i),a=1<<s;t|=e[s],i&=~a}return Ts=t,Eh(),n}function bS(e,t){$t=null,qt.H=Zl,t===ho||t===Ah?(t=vv(),be=3):t===tg?(t=vv(),be=4):be=t===gg?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Jn=t,le===null&&(Xe=1,ah(e,xi(t,e.current)))}function ES(){var e=si.current;return e===null?!0:(he&4194048)===he?Mi===null:(he&62914560)===he||(he&536870912)!==0?e===Mi:!1}function TS(){var e=qt.H;return qt.H=Zl,e===null?Zl:e}function AS(){var e=qt.A;return qt.A=NT,e}function uh(){Xe=4,Zs||(he&4194048)!==he&&si.current!==null||(fo=!0),(ca&134217727)===0&&(Wa&134217727)===0||De===null||Js(De,he,jn,!1)}function Np(e,t,n){var i=ve;ve|=2;var s=TS(),a=AS();(De!==e||he!==t)&&(ch=null,ao(e,t)),t=!1;var r=Xe;t:do try{if(be!==0&&le!==null){var o=le,l=Jn;switch(be){case 8:Mg(),r=6;break t;case 3:case 2:case 9:case 6:si.current===null&&(t=!0);var c=be;if(be=0,Jn=null,kr(e,o,l,c),n&&fo){r=0;break t}break;default:c=be,be=0,Jn=null,kr(e,o,l,c)}}PT(),r=Xe;break}catch(h){bS(e,h)}while(!0);return t&&e.shellSuspendCounter++,_s=tr=null,ve=i,qt.H=s,qt.A=a,le===null&&(De=null,he=0,Eh()),r}function PT(){for(;le!==null;)wS(le)}function BT(e,t){var n=ve;ve|=2;var i=TS(),s=AS();De!==e||he!==t?(ch=null,lh=$n()+500,ao(e,t)):fo=nc(e,t);t:do try{if(be!==0&&le!==null){t=le;var a=Jn;e:switch(be){case 1:be=0,Jn=null,kr(e,t,a,1);break;case 2:case 9:if(_v(a)){be=0,Jn=null,Vv(t);break}t=function(){be!==2&&be!==9||De!==e||(be=7),Ji(e)},a.then(t,t);break t;case 3:be=7;break t;case 4:be=5;break t;case 7:_v(a)?(be=0,Jn=null,Vv(t)):(be=0,Jn=null,kr(e,t,a,7));break;case 5:var r=null;switch(le.tag){case 26:r=le.memoizedState;case 5:case 27:var o=le;if(r?YS(r):o.stateNode.complete){be=0,Jn=null;var l=o.sibling;if(l!==null)le=l;else{var c=o.return;c!==null?(le=c,Nh(c)):le=null}break e}}be=0,Jn=null,kr(e,t,a,5);break;case 6:be=0,Jn=null,kr(e,t,a,6);break;case 8:Mg(),Xe=6;break t;default:throw Error(nt(462))}}zT();break}catch(h){bS(e,h)}while(!0);return _s=tr=null,qt.H=i,qt.A=s,ve=n,le!==null?0:(De=null,he=0,Eh(),Xe)}function zT(){for(;le!==null&&!oE();)wS(le)}function wS(e){var t=tS(e.alternate,e,Ts);e.memoizedProps=e.pendingProps,t===null?Nh(e):le=t}function Vv(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Iv(n,t,t.pendingProps,t.type,void 0,he);break;case 11:t=Iv(n,t,t.pendingProps,t.type.render,t.ref,he);break;case 5:og(t);default:eS(n,t),t=le=ex(t,Ts),t=tS(n,t,Ts)}e.memoizedProps=e.pendingProps,t===null?Nh(e):le=t}function kr(e,t,n,i){_s=tr=null,og(t),Zr=null,ql=0;var s=t.return;try{if(AT(e,s,t,n,he)){Xe=1,ah(e,xi(n,e.current)),le=null;return}}catch(a){if(s!==null)throw le=s,a;Xe=1,ah(e,xi(n,e.current)),le=null;return}t.flags&32768?(de||i===1?e=!0:fo||(he&536870912)!==0?e=!1:(Zs=e=!0,(i===2||i===9||i===3||i===6)&&(i=si.current,i!==null&&i.tag===13&&(i.flags|=16384))),RS(t,e)):Nh(t)}function Nh(e){var t=e;do{if((t.flags&32768)!==0){RS(t,Zs);return}e=t.return;var n=CT(t.alternate,t,Ts);if(n!==null){le=n;return}if(t=t.sibling,t!==null){le=t;return}le=t=e}while(t!==null);Xe===0&&(Xe=5)}function RS(e,t){do{var n=DT(e.alternate,e);if(n!==null){n.flags&=32767,le=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){le=e;return}le=e=n}while(e!==null);Xe=6,le=null}function Gv(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do Ih();while(rn!==0);if((ve&6)!==0)throw Error(nt(327));if(t!==null){if(t===e.current)throw Error(nt(177));if(a=t.lanes|t.childLanes,a|=Ym,_E(e,n,a,r,o,l),e===De&&(le=De=null,he=0),so=t,na=e,xs=n,Sm=a,Mm=s,xS=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,GT(Zu,function(){return NS(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=qt.T,qt.T=null,s=ye.p,ye.p=2,r=ve,ve|=4;try{LT(e,t,n)}finally{ve=r,ye.p=s,qt.T=i}}rn=1,CS(),DS(),LS()}}function CS(){if(rn===1){rn=0;var e=na,t=so,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=qt.T,qt.T=null;var i=ye.p;ye.p=2;var s=ve;ve|=4;try{fS(t,e);var a=wm,r=Yy(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&qy(o.ownerDocument.documentElement,o)){if(l!==null&&qm(o)){var c=l.start,h=l.end;if(h===void 0&&(h=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(h,o.value.length);else{var p=o.ownerDocument||document,u=p&&p.defaultView||window;if(u.getSelection){var d=u.getSelection(),g=o.textContent.length,b=Math.min(l.start,g),m=l.end===void 0?b:Math.min(l.end,g);!d.extend&&b>m&&(r=m,m=b,b=r);var f=uv(o,b),_=uv(o,m);if(f&&_&&(d.rangeCount!==1||d.anchorNode!==f.node||d.anchorOffset!==f.offset||d.focusNode!==_.node||d.focusOffset!==_.offset)){var S=p.createRange();S.setStart(f.node,f.offset),d.removeAllRanges(),b>m?(d.addRange(S),d.extend(_.node,_.offset)):(S.setEnd(_.node,_.offset),d.addRange(S))}}}}for(p=[],d=o;d=d.parentNode;)d.nodeType===1&&p.push({element:d,left:d.scrollLeft,top:d.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<p.length;o++){var v=p[o];v.element.scrollLeft=v.left,v.element.scrollTop=v.top}}vh=!!Am,wm=Am=null}finally{ve=s,ye.p=i,qt.T=n}}e.current=t,rn=2}}function DS(){if(rn===2){rn=0;var e=na,t=so,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=qt.T,qt.T=null;var i=ye.p;ye.p=2;var s=ve;ve|=4;try{oS(e,t.alternate,t)}finally{ve=s,ye.p=i,qt.T=n}}rn=3}}function LS(){if(rn===4||rn===3){rn=0,lE();var e=na,t=so,n=xs,i=xS;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?rn=5:(rn=0,so=na=null,US(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(ea=null),Fm(n),t=t.stateNode,ti&&typeof ti.onCommitFiberRoot=="function")try{ti.onCommitFiberRoot(ec,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=qt.T,s=ye.p,ye.p=2,qt.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{qt.T=t,ye.p=s}}(xs&3)!==0&&Ih(),Ji(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===bm?zl++:(zl=0,bm=e):zl=0,cc(0,!1)}}function US(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,rc(t)))}function Ih(){return CS(),DS(),LS(),NS()}function NS(){if(rn!==5)return!1;var e=na,t=Sm;Sm=0;var n=Fm(xs),i=qt.T,s=ye.p;try{ye.p=32>n?32:n,qt.T=null,n=Mm,Mm=null;var a=na,r=xs;if(rn=0,so=na=null,xs=0,(ve&6)!==0)throw Error(nt(331));var o=ve;if(ve|=4,_S(a.current),pS(a,a.current,r,n),ve=o,cc(0,!1),ti&&typeof ti.onPostCommitFiberRoot=="function")try{ti.onPostCommitFiberRoot(ec,a)}catch{}return!0}finally{ye.p=s,qt.T=i,US(e,t)}}function kv(e,t,n){t=xi(n,t),t=gm(e.stateNode,t,2),e=ta(e,t,2),e!==null&&(ic(e,2),Ji(e))}function Ee(e,t,n){if(e.tag===3)kv(e,e,n);else for(;t!==null;){if(t.tag===3){kv(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(ea===null||!ea.has(i))){e=xi(n,e),n=Zx(2),i=ta(t,n,2),i!==null&&(Jx(n,i,t,e),ic(i,2),Ji(i));break}}t=t.return}}function Ip(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new IT;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(xg=!0,s.add(n),e=FT.bind(null,e,t,n),t.then(e,e))}function FT(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,De===e&&(he&n)===n&&(Xe===4||Xe===3&&(he&62914560)===he&&300>$n()-Lh?(ve&2)===0&&ao(e,0):Sg|=n,io===he&&(io=0)),Ji(e)}function IS(e,t){t===0&&(t=Ty()),e=$a(e,t),e!==null&&(ic(e,t),Ji(e))}function HT(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),IS(e,n)}function VT(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(nt(314))}i!==null&&i.delete(t),IS(e,n)}function GT(e,t){return Bm(e,t)}var hh=null,Lr=null,Em=!1,fh=!1,Op=!1,Ks=0;function Ji(e){e!==Lr&&e.next===null&&(Lr===null?hh=Lr=e:Lr=Lr.next=e),fh=!0,Em||(Em=!0,WT())}function cc(e,t){if(!Op&&fh){Op=!0;do for(var n=!1,i=hh;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-ei(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Wv(i,a))}else a=he,a=xh(i,i===De?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||nc(i,a)||(n=!0,Wv(i,a));i=i.next}while(n);Op=!1}}function kT(){OS()}function OS(){fh=Em=!1;var e=0;Ks!==0&&jT()&&(e=Ks);for(var t=$n(),n=null,i=hh;i!==null;){var s=i.next,a=PS(i,t);a===0?(i.next=null,n===null?hh=s:n.next=s,s===null&&(Lr=n)):(n=i,(e!==0||(a&3)!==0)&&(fh=!0)),i=s}rn!==0&&rn!==5||cc(e,!1),Ks!==0&&(Ks=0)}function PS(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-ei(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=gE(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=De,n=he,n=xh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(be===2||be===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&up(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||nc(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&up(i),Fm(n)){case 2:case 8:n=by;break;case 32:n=Zu;break;case 268435456:n=Ey;break;default:n=Zu}return i=BS.bind(null,e),n=Bm(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&up(i),e.callbackPriority=2,e.callbackNode=null,2}function BS(e,t){if(rn!==0&&rn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Ih()&&e.callbackNode!==n)return null;var i=he;return i=xh(e,e===De?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(MS(e,i,t),PS(e,$n()),e.callbackNode!=null&&e.callbackNode===n?BS.bind(null,e):null)}function Wv(e,t){if(Ih())return null;MS(e,t,!0)}function WT(){tA(function(){(ve&6)!==0?Bm(My,kT):OS()})}function bg(){if(Ks===0){var e=to;e===0&&(e=du,du<<=1,(du&261888)===0&&(du=256)),Ks=e}return Ks}function Xv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Lu(""+e)}function qv(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function XT(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=Xv((s[Wn]||null).action),r=i.submitter;r&&(t=(t=r[Wn]||null)?Xv(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new Sh("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(Ks!==0){var l=r?qv(s,r):new FormData(s);pm(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?qv(s,r):new FormData(s),pm(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(Tu=0;Tu<nm.length;Tu++)Au=nm[Tu],Yv=Au.toLowerCase(),Zv=Au[0].toUpperCase()+Au.slice(1),Li(Yv,"on"+Zv);var Au,Yv,Zv,Tu;Li(Jy,"onAnimationEnd");Li(Ky,"onAnimationIteration");Li(Qy,"onAnimationStart");Li("dblclick","onDoubleClick");Li("focusin","onFocus");Li("focusout","onBlur");Li(cT,"onTransitionRun");Li(uT,"onTransitionStart");Li(hT,"onTransitionCancel");Li(jy,"onTransitionEnd");jr("onMouseEnter",["mouseout","mouseover"]);jr("onMouseLeave",["mouseout","mouseover"]);jr("onPointerEnter",["pointerout","pointerover"]);jr("onPointerLeave",["pointerout","pointerover"]);Ka("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ka("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ka("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ka("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ka("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ka("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Jl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),qT=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Jl));function zS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(h){Ku(h)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(h){Ku(h)}s.currentTarget=null,a=l}}}}function oe(e,t){var n=t[Zp];n===void 0&&(n=t[Zp]=new Set);var i=e+"__bubble";n.has(i)||(FS(t,e,2,!1),n.add(i))}function Pp(e,t,n){var i=0;t&&(i|=4),FS(n,e,i,t)}var wu="_reactListening"+Math.random().toString(36).slice(2);function Eg(e){if(!e[wu]){e[wu]=!0,Dy.forEach(function(n){n!=="selectionchange"&&(qT.has(n)||Pp(n,!1,e),Pp(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[wu]||(t[wu]=!0,Pp("selectionchange",!1,t))}}function FS(e,t,n,i){switch(jS(t)){case 2:var s=xA;break;case 8:s=SA;break;default:s=Rg}n=s.bind(null,t,n,e),s=void 0,!$p||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function Bp(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Ir(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}zy(function(){var c=a,h=Gm(n),p=[];t:{var u=$y.get(e);if(u!==void 0){var d=Sh,g=e;switch(e){case"keypress":if(Nu(n)===0)break t;case"keydown":case"keyup":d=VE;break;case"focusin":g="focus",d=mp;break;case"focusout":g="blur",d=mp;break;case"beforeblur":case"afterblur":d=mp;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":d=ev;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":d=CE;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":d=WE;break;case Jy:case Ky:case Qy:d=UE;break;case jy:d=qE;break;case"scroll":case"scrollend":d=wE;break;case"wheel":d=ZE;break;case"copy":case"cut":case"paste":d=IE;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":d=iv;break;case"toggle":case"beforetoggle":d=KE}var b=(t&4)!==0,m=!b&&(e==="scroll"||e==="scrollend"),f=b?u!==null?u+"Capture":null:u;b=[];for(var _=c,S;_!==null;){var v=_;if(S=v.stateNode,v=v.tag,v!==5&&v!==26&&v!==27||S===null||f===null||(v=Vl(_,f),v!=null&&b.push(Kl(_,v,S))),m)break;_=_.return}0<b.length&&(u=new d(u,g,null,n,h),p.push({event:u,listeners:b}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",d=e==="mouseout"||e==="pointerout",u&&n!==jp&&(g=n.relatedTarget||n.fromElement)&&(Ir(g)||g[lo]))break t;if((d||u)&&(u=h.window===h?h:(u=h.ownerDocument)?u.defaultView||u.parentWindow:window,d?(g=n.relatedTarget||n.toElement,d=c,g=g?Ir(g):null,g!==null&&(m=tc(g),b=g.tag,g!==m||b!==5&&b!==27&&b!==6)&&(g=null)):(d=null,g=c),d!==g)){if(b=ev,v="onMouseLeave",f="onMouseEnter",_="mouse",(e==="pointerout"||e==="pointerover")&&(b=iv,v="onPointerLeave",f="onPointerEnter",_="pointer"),m=d==null?u:El(d),S=g==null?u:El(g),u=new b(v,_+"leave",d,n,h),u.target=m,u.relatedTarget=S,v=null,Ir(h)===c&&(b=new b(f,_+"enter",g,n,h),b.target=S,b.relatedTarget=m,v=b),m=v,d&&g)e:{for(b=YT,f=d,_=g,S=0,v=f;v;v=b(v))S++;v=0;for(var E=_;E;E=b(E))v++;for(;0<S-v;)f=b(f),S--;for(;0<v-S;)_=b(_),v--;for(;S--;){if(f===_||_!==null&&f===_.alternate){b=f;break e}f=b(f),_=b(_)}b=null}else b=null;d!==null&&Jv(p,u,d,b,!1),g!==null&&m!==null&&Jv(p,m,g,b,!0)}}t:{if(u=c?El(c):window,d=u.nodeName&&u.nodeName.toLowerCase(),d==="select"||d==="input"&&u.type==="file")var T=ov;else if(rv(u))if(Wy)T=rT;else{T=sT;var w=iT}else d=u.nodeName,!d||d.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&Vm(c.elementType)&&(T=ov):T=aT;if(T&&(T=T(e,c))){ky(p,T,n,h);break t}w&&w(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Qp(u,"number",u.value)}switch(w=c?El(c):window,e){case"focusin":(rv(w)||w.contentEditable==="true")&&(Br=w,tm=c,Cl=null);break;case"focusout":Cl=tm=Br=null;break;case"mousedown":em=!0;break;case"contextmenu":case"mouseup":case"dragend":em=!1,hv(p,n,h);break;case"selectionchange":if(lT)break;case"keydown":case"keyup":hv(p,n,h)}var x;if(Xm)t:{switch(e){case"compositionstart":var A="onCompositionStart";break t;case"compositionend":A="onCompositionEnd";break t;case"compositionupdate":A="onCompositionUpdate";break t}A=void 0}else Pr?Vy(e,n)&&(A="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(Hy&&n.locale!=="ko"&&(Pr||A!=="onCompositionStart"?A==="onCompositionEnd"&&Pr&&(x=Fy()):(Ys=h,km="value"in Ys?Ys.value:Ys.textContent,Pr=!0)),w=dh(c,A),0<w.length&&(A=new nv(A,e,null,n,h),p.push({event:A,listeners:w}),x?A.data=x:(x=Gy(n),x!==null&&(A.data=x)))),(x=jE?$E(e,n):tT(e,n))&&(A=dh(c,"onBeforeInput"),0<A.length&&(w=new nv("onBeforeInput","beforeinput",null,n,h),p.push({event:w,listeners:A}),w.data=x)),XT(p,e,c,n,h)}zS(p,t)})}function Kl(e,t,n){return{instance:e,listener:t,currentTarget:n}}function dh(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=Vl(e,n),s!=null&&i.unshift(Kl(e,s,a)),s=Vl(e,t),s!=null&&i.push(Kl(e,s,a))),e.tag===3)return i;e=e.return}return[]}function YT(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Jv(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=Vl(n,a),c!=null&&r.unshift(Kl(n,c,l))):s||(c=Vl(n,a),c!=null&&r.push(Kl(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var ZT=/\r\n?/g,JT=/\u0000|\uFFFD/g;function Kv(e){return(typeof e=="string"?e:""+e).replace(ZT,`
`).replace(JT,"")}function HS(e,t){return t=Kv(t),Kv(e)===t}function we(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||$r(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&$r(e,""+i);break;case"className":gu(e,"class",i);break;case"tabIndex":gu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":gu(e,n,i);break;case"style":By(e,i,a);break;case"data":if(t!=="object"){gu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Lu(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&we(e,t,"name",s.name,s,null),we(e,t,"formEncType",s.formEncType,s,null),we(e,t,"formMethod",s.formMethod,s,null),we(e,t,"formTarget",s.formTarget,s,null)):(we(e,t,"encType",s.encType,s,null),we(e,t,"method",s.method,s,null),we(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Lu(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=gs);break;case"onScroll":i!=null&&oe("scroll",e);break;case"onScrollEnd":i!=null&&oe("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(nt(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(nt(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=Lu(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":oe("beforetoggle",e),oe("toggle",e),Du(e,"popover",i);break;case"xlinkActuate":ls(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":ls(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":ls(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":ls(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":ls(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":ls(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":ls(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":ls(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":ls(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Du(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=TE.get(n)||n,Du(e,n,i))}}function Tm(e,t,n,i,s,a){switch(n){case"style":By(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(nt(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(nt(60));e.innerHTML=n}}break;case"children":typeof i=="string"?$r(e,i):(typeof i=="number"||typeof i=="bigint")&&$r(e,""+i);break;case"onScroll":i!=null&&oe("scroll",e);break;case"onScrollEnd":i!=null&&oe("scrollend",e);break;case"onClick":i!=null&&(e.onclick=gs);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Ly.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[Wn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):Du(e,n,i)}}}function xn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":oe("error",e),oe("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(nt(137,t));default:we(e,t,a,r,n,null)}}s&&we(e,t,"srcSet",n.srcSet,n,null),i&&we(e,t,"src",n.src,n,null);return;case"input":oe("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var h=n[i];if(h!=null)switch(i){case"name":s=h;break;case"type":r=h;break;case"checked":l=h;break;case"defaultChecked":c=h;break;case"value":a=h;break;case"defaultValue":o=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(nt(137,t));break;default:we(e,t,i,h,n,null)}}Iy(e,a,o,l,c,r,s,!1);return;case"select":oe("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:we(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?Xr(e,!!i,t,!1):n!=null&&Xr(e,!!i,n,!0);return;case"textarea":oe("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(nt(91));break;default:we(e,t,r,o,n,null)}Py(e,i,s,a);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":e.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:we(e,t,l,i,n,null)}return;case"dialog":oe("beforetoggle",e),oe("toggle",e),oe("cancel",e),oe("close",e);break;case"iframe":case"object":oe("load",e);break;case"video":case"audio":for(i=0;i<Jl.length;i++)oe(Jl[i],e);break;case"image":oe("error",e),oe("load",e);break;case"details":oe("toggle",e);break;case"embed":case"source":case"link":oe("error",e),oe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(nt(137,t));default:we(e,t,c,i,n,null)}return;default:if(Vm(t)){for(h in n)n.hasOwnProperty(h)&&(i=n[h],i!==void 0&&Tm(e,t,h,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&we(e,t,o,i,n,null))}function KT(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,h=null;for(d in n){var p=n[d];if(n.hasOwnProperty(d)&&p!=null)switch(d){case"checked":break;case"value":break;case"defaultValue":l=p;default:i.hasOwnProperty(d)||we(e,t,d,null,i,p)}}for(var u in i){var d=i[u];if(p=n[u],i.hasOwnProperty(u)&&(d!=null||p!=null))switch(u){case"type":a=d;break;case"name":s=d;break;case"checked":c=d;break;case"defaultChecked":h=d;break;case"value":r=d;break;case"defaultValue":o=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(nt(137,t));break;default:d!==p&&we(e,t,u,d,i,p)}}Kp(e,r,o,l,c,h,a,s);return;case"select":d=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":d=l;default:i.hasOwnProperty(a)||we(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&we(e,t,s,a,i,l)}t=o,n=r,i=d,u!=null?Xr(e,!!n,u,!1):!!i!=!!n&&(t!=null?Xr(e,!!n,t,!0):Xr(e,!!n,n?[]:"",!1));return;case"textarea":d=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:we(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":d=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(nt(91));break;default:s!==a&&we(e,t,r,s,i,a)}Oy(e,u,d);return;case"option":for(var g in n)if(u=n[g],n.hasOwnProperty(g)&&u!=null&&!i.hasOwnProperty(g))switch(g){case"selected":e.selected=!1;break;default:we(e,t,g,null,i,u)}for(l in i)if(u=i[l],d=n[l],i.hasOwnProperty(l)&&u!==d&&(u!=null||d!=null))switch(l){case"selected":e.selected=u&&typeof u!="function"&&typeof u!="symbol";break;default:we(e,t,l,u,i,d)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var b in n)u=n[b],n.hasOwnProperty(b)&&u!=null&&!i.hasOwnProperty(b)&&we(e,t,b,null,i,u);for(c in i)if(u=i[c],d=n[c],i.hasOwnProperty(c)&&u!==d&&(u!=null||d!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(nt(137,t));break;default:we(e,t,c,u,i,d)}return;default:if(Vm(t)){for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!==void 0&&!i.hasOwnProperty(m)&&Tm(e,t,m,void 0,i,u);for(h in i)u=i[h],d=n[h],!i.hasOwnProperty(h)||u===d||u===void 0&&d===void 0||Tm(e,t,h,u,i,d);return}}for(var f in n)u=n[f],n.hasOwnProperty(f)&&u!=null&&!i.hasOwnProperty(f)&&we(e,t,f,null,i,u);for(p in i)u=i[p],d=n[p],!i.hasOwnProperty(p)||u===d||u==null&&d==null||we(e,t,p,u,i,d)}function Qv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function QT(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&Qv(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var h=l.transferSize,p=l.initiatorType;h&&Qv(p)&&(l=l.responseEnd,r+=h*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Am=null,wm=null;function ph(e){return e.nodeType===9?e:e.ownerDocument}function jv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function VS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Rm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var zp=null;function jT(){var e=window.event;return e&&e.type==="popstate"?e===zp?!1:(zp=e,!0):(zp=null,!1)}var GS=typeof setTimeout=="function"?setTimeout:void 0,$T=typeof clearTimeout=="function"?clearTimeout:void 0,$v=typeof Promise=="function"?Promise:void 0,tA=typeof queueMicrotask=="function"?queueMicrotask:typeof $v<"u"?function(e){return $v.resolve(null).then(e).catch(eA)}:GS;function eA(e){setTimeout(function(){throw e})}function ha(e){return e==="head"}function ty(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),oo(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Fl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Fl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[sc]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&Fl(e.ownerDocument.body);n=s}while(n);oo(t)}function ey(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function Cm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Cm(n),Hm(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function nA(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[sc])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=bi(e.nextSibling),e===null)break}return null}function iA(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=bi(e.nextSibling),e===null))return null;return e}function kS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=bi(e.nextSibling),e===null))return null;return e}function Dm(e){return e.data==="$?"||e.data==="$~"}function Lm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function sA(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function bi(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Um=null;function ny(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return bi(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function iy(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function WS(e,t,n){switch(t=ph(n),e){case"html":if(e=t.documentElement,!e)throw Error(nt(452));return e;case"head":if(e=t.head,!e)throw Error(nt(453));return e;case"body":if(e=t.body,!e)throw Error(nt(454));return e;default:throw Error(nt(451))}}function Fl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Hm(e)}var Ei=new Map,sy=new Set;function mh(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var As=ye.d;ye.d={f:aA,r:rA,D:oA,C:lA,L:cA,m:uA,X:fA,S:hA,M:dA};function aA(){var e=As.f(),t=Uh();return e||t}function rA(e){var t=co(e);t!==null&&t.tag===5&&t.type==="form"?Bx(t):As.r(e)}var po=typeof document>"u"?null:document;function XS(e,t,n){var i=po;if(i&&typeof t=="string"&&t){var s=yi(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),sy.has(s)||(sy.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),xn(t,"link",e),fn(t),i.head.appendChild(t)))}}function oA(e){As.D(e),XS("dns-prefetch",e,null)}function lA(e,t){As.C(e,t),XS("preconnect",e,t)}function cA(e,t,n){As.L(e,t,n);var i=po;if(i&&e&&t){var s='link[rel="preload"][as="'+yi(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+yi(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+yi(n.imageSizes)+'"]')):s+='[href="'+yi(e)+'"]';var a=s;switch(t){case"style":a=ro(e);break;case"script":a=mo(e)}Ei.has(a)||(e=Be({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ei.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(uc(a))||t==="script"&&i.querySelector(hc(a))||(t=i.createElement("link"),xn(t,"link",e),fn(t),i.head.appendChild(t)))}}function uA(e,t){As.m(e,t);var n=po;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+yi(i)+'"][href="'+yi(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=mo(e)}if(!Ei.has(a)&&(e=Be({rel:"modulepreload",href:e},t),Ei.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(hc(a)))return}i=n.createElement("link"),xn(i,"link",e),fn(i),n.head.appendChild(i)}}}function hA(e,t,n){As.S(e,t,n);var i=po;if(i&&e){var s=Wr(i).hoistableStyles,a=ro(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(uc(a)))o.loading=5;else{e=Be({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ei.get(a))&&Tg(e,n);var l=r=i.createElement("link");fn(l),xn(l,"link",e),l._p=new Promise(function(c,h){l.onload=c,l.onerror=h}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,Vu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function fA(e,t){As.X(e,t);var n=po;if(n&&e){var i=Wr(n).hoistableScripts,s=mo(e),a=i.get(s);a||(a=n.querySelector(hc(s)),a||(e=Be({src:e,async:!0},t),(t=Ei.get(s))&&Ag(e,t),a=n.createElement("script"),fn(a),xn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function dA(e,t){As.M(e,t);var n=po;if(n&&e){var i=Wr(n).hoistableScripts,s=mo(e),a=i.get(s);a||(a=n.querySelector(hc(s)),a||(e=Be({src:e,async:!0,type:"module"},t),(t=Ei.get(s))&&Ag(e,t),a=n.createElement("script"),fn(a),xn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function ay(e,t,n,i){var s=(s=Qs.current)?mh(s):null;if(!s)throw Error(nt(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=ro(n.href),n=Wr(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=ro(n.href);var a=Wr(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(uc(e)))&&!a._p&&(r.instance=a,r.state.loading=5),Ei.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ei.set(e,n),a||pA(s,e,n,r.state))),t&&i===null)throw Error(nt(528,""));return r}if(t&&i!==null)throw Error(nt(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=mo(n),n=Wr(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(nt(444,e))}}function ro(e){return'href="'+yi(e)+'"'}function uc(e){return'link[rel="stylesheet"]['+e+"]"}function qS(e){return Be({},e,{"data-precedence":e.precedence,precedence:null})}function pA(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),xn(t,"link",n),fn(t),e.head.appendChild(t))}function mo(e){return'[src="'+yi(e)+'"]'}function hc(e){return"script[async]"+e}function ry(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+yi(n.href)+'"]');if(i)return t.instance=i,fn(i),i;var s=Be({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),fn(i),xn(i,"style",s),Vu(i,n.precedence,e),t.instance=i;case"stylesheet":s=ro(n.href);var a=e.querySelector(uc(s));if(a)return t.state.loading|=4,t.instance=a,fn(a),a;i=qS(n),(s=Ei.get(s))&&Tg(i,s),a=(e.ownerDocument||e).createElement("link"),fn(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),xn(a,"link",i),t.state.loading|=4,Vu(a,n.precedence,e),t.instance=a;case"script":return a=mo(n.src),(s=e.querySelector(hc(a)))?(t.instance=s,fn(s),s):(i=n,(s=Ei.get(a))&&(i=Be({},n),Ag(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),fn(s),xn(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error(nt(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Vu(i,n.precedence,e));return t.instance}function Vu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Tg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Ag(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Gu=null;function oy(e,t,n){if(Gu===null){var i=new Map,s=Gu=new Map;s.set(n,i)}else s=Gu,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[sc]||a[_n]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function ly(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function mA(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function YS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function gA(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=ro(i.href),a=t.querySelector(uc(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=gh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,fn(a);return}a=t.ownerDocument||t,i=qS(i),(s=Ei.get(s))&&Tg(i,s),a=a.createElement("link"),fn(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),xn(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=gh.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Fp=0;function _A(e,t){return e.stylesheets&&e.count===0&&ku(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&ku(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&Fp===0&&(Fp=62500*QT());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&ku(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>Fp?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function gh(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)ku(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var _h=null;function ku(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,_h=new Map,t.forEach(vA,e),_h=null,gh.call(e))}function vA(e,t){if(!(t.state.loading&4)){var n=_h.get(e);if(n)var i=n.get(null);else{n=new Map,_h.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=gh.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var Ql={$$typeof:ms,Provider:null,Consumer:null,_currentValue:Ha,_currentValue2:Ha,_threadCount:0};function yA(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=hp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=hp(0),this.hiddenUpdates=hp(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function ZS(e,t,n,i,s,a,r,o,l,c,h,p){return e=new yA(e,t,n,r,l,c,h,p,o),t=1,a===!0&&(t|=24),a=Qn(3,null,null,t),e.current=a,a.stateNode=e,t=jm(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},eg(a),e}function JS(e){return e?(e=Hr,e):Hr}function KS(e,t,n,i,s,a){s=JS(s),i.context===null?i.context=s:i.pendingContext=s,i=$s(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=ta(e,i,t),n!==null&&(kn(n,e,t),Ll(n,e,t))}function cy(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function wg(e,t){cy(e,t),(e=e.alternate)&&cy(e,t)}function QS(e){if(e.tag===13||e.tag===31){var t=$a(e,67108864);t!==null&&kn(t,e,67108864),wg(e,67108864)}}function uy(e){if(e.tag===13||e.tag===31){var t=ni();t=zm(t);var n=$a(e,t);n!==null&&kn(n,e,t),wg(e,t)}}var vh=!0;function xA(e,t,n,i){var s=qt.T;qt.T=null;var a=ye.p;try{ye.p=2,Rg(e,t,n,i)}finally{ye.p=a,qt.T=s}}function SA(e,t,n,i){var s=qt.T;qt.T=null;var a=ye.p;try{ye.p=8,Rg(e,t,n,i)}finally{ye.p=a,qt.T=s}}function Rg(e,t,n,i){if(vh){var s=Nm(i);if(s===null)Bp(e,t,i,yh,n),hy(e,i);else if(bA(s,e,t,n,i))i.stopPropagation();else if(hy(e,i),t&4&&-1<MA.indexOf(e)){for(;s!==null;){var a=co(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=Ba(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-ei(r);o.entanglements[1]|=l,r&=~l}Ji(a),(ve&6)===0&&(lh=$n()+500,cc(0,!1))}}break;case 31:case 13:o=$a(a,2),o!==null&&kn(o,a,2),Uh(),wg(a,2)}if(a=Nm(i),a===null&&Bp(e,t,i,yh,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else Bp(e,t,i,null,n)}}function Nm(e){return e=Gm(e),Cg(e)}var yh=null;function Cg(e){if(yh=null,e=Ir(e),e!==null){var t=tc(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=_y(t),e!==null)return e;e=null}else if(n===31){if(e=vy(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return yh=e,null}function jS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(cE()){case My:return 2;case by:return 8;case Zu:case uE:return 32;case Ey:return 268435456;default:return 32}default:return 32}}var Im=!1,ia=null,sa=null,aa=null,jl=new Map,$l=new Map,Xs=[],MA="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function hy(e,t){switch(e){case"focusin":case"focusout":ia=null;break;case"dragenter":case"dragleave":sa=null;break;case"mouseover":case"mouseout":aa=null;break;case"pointerover":case"pointerout":jl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":$l.delete(t.pointerId)}}function xl(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=co(t),t!==null&&QS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function bA(e,t,n,i,s){switch(t){case"focusin":return ia=xl(ia,e,t,n,i,s),!0;case"dragenter":return sa=xl(sa,e,t,n,i,s),!0;case"mouseover":return aa=xl(aa,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return jl.set(a,xl(jl.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,$l.set(a,xl($l.get(a)||null,e,t,n,i,s)),!0}return!1}function $S(e){var t=Ir(e.target);if(t!==null){var n=tc(t);if(n!==null){if(t=n.tag,t===13){if(t=_y(n),t!==null){e.blockedOn=t,Z_(e.priority,function(){uy(n)});return}}else if(t===31){if(t=vy(n),t!==null){e.blockedOn=t,Z_(e.priority,function(){uy(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Wu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Nm(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);jp=i,n.target.dispatchEvent(i),jp=null}else return t=co(n),t!==null&&QS(t),e.blockedOn=n,!1;t.shift()}return!0}function fy(e,t,n){Wu(e)&&n.delete(t)}function EA(){Im=!1,ia!==null&&Wu(ia)&&(ia=null),sa!==null&&Wu(sa)&&(sa=null),aa!==null&&Wu(aa)&&(aa=null),jl.forEach(fy),$l.forEach(fy)}function Ru(e,t){e.blockedOn===t&&(e.blockedOn=null,Im||(Im=!0,on.unstable_scheduleCallback(on.unstable_NormalPriority,EA)))}var Cu=null;function dy(e){Cu!==e&&(Cu=e,on.unstable_scheduleCallback(on.unstable_NormalPriority,function(){Cu===e&&(Cu=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(Cg(i||n)===null)continue;break}var a=co(n);a!==null&&(e.splice(t,3),t-=3,pm(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function oo(e){function t(l){return Ru(l,e)}ia!==null&&Ru(ia,e),sa!==null&&Ru(sa,e),aa!==null&&Ru(aa,e),jl.forEach(t),$l.forEach(t);for(var n=0;n<Xs.length;n++){var i=Xs[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Xs.length&&(n=Xs[0],n.blockedOn===null);)$S(n),n.blockedOn===null&&Xs.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[Wn]||null;if(typeof a=="function")r||dy(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[Wn]||null)o=r.formAction;else if(Cg(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),dy(n)}}}function tM(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function Dg(e){this._internalRoot=e}Oh.prototype.render=Dg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(nt(409));var n=t.current,i=ni();KS(n,i,e,t,null,null)};Oh.prototype.unmount=Dg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;KS(e.current,2,null,e,null,null),Uh(),t[lo]=null}};function Oh(e){this._internalRoot=e}Oh.prototype.unstable_scheduleHydration=function(e){if(e){var t=Cy();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Xs.length&&t!==0&&t<Xs[n].priority;n++);Xs.splice(n,0,e),n===0&&$S(e)}};var py=my.version;if(py!=="19.2.0")throw Error(nt(527,py,"19.2.0"));ye.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(nt(188)):(e=Object.keys(e).join(","),Error(nt(268,e)));return e=nE(t),e=e!==null?yy(e):null,e=e===null?null:e.stateNode,e};var TA={bundleType:0,version:"19.2.0",rendererPackageName:"react-dom",currentDispatcherRef:qt,reconcilerVersion:"19.2.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Sl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Sl.isDisabled&&Sl.supportsFiber))try{ec=Sl.inject(TA),ti=Sl}catch{}var Sl;Ph.createRoot=function(e,t){if(!gy(e))throw Error(nt(299));var n=!1,i="",s=Xx,a=qx,r=Yx;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=ZS(e,1,!1,null,null,n,i,null,s,a,r,tM),e[lo]=t.current,Eg(e),new Dg(t)};Ph.hydrateRoot=function(e,t,n){if(!gy(e))throw Error(nt(299));var i=!1,s="",a=Xx,r=qx,o=Yx,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=ZS(e,1,!0,t,n??null,i,s,l,a,r,o,tM),t.context=JS(null),n=t.current,i=ni(),i=zm(i),s=$s(i),s.callback=null,ta(n,s,i),n=i,t.current.lanes=n,ic(t,n),Ji(t),e[lo]=t.current,Eg(e),new Oh(t)};Ph.version="19.2.0"});var sM=Vi((_L,iM)=>{"use strict";function nM(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(nM)}catch(e){console.error(e)}}nM(),iM.exports=eM()});var a1=Vi(Bd=>{"use strict";var ND=Symbol.for("react.transitional.element"),ID=Symbol.for("react.fragment");function s1(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:ND,type:e,key:i,ref:t!==void 0?t:null,props:n}}Bd.Fragment=ID;Bd.jsx=s1;Bd.jsxs=s1});var mr=Vi((HI,r1)=>{"use strict";r1.exports=a1()});var vr=Gi(Er()),A1=Gi(sM());var Ce=Gi(Er(),1),AA=(e,t,n,i,s,a,r,o)=>{let l=document.documentElement,c=["light","dark"];function h(d){(Array.isArray(e)?e:[e]).forEach(g=>{let b=g==="class",m=b&&a?s.map(f=>a[f]||f):s;b?(l.classList.remove(...m),l.classList.add(a&&a[d]?a[d]:d)):l.setAttribute(g,d)}),p(d)}function p(d){o&&c.includes(d)&&(l.style.colorScheme=d)}function u(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)h(i);else try{let d=localStorage.getItem(t)||n,g=r&&d==="system"?u():d;h(g)}catch{}},aM=["light","dark"],rM="(prefers-color-scheme: dark)",wA=typeof window>"u",Ug=Ce.createContext(void 0),RA={setTheme:e=>{},themes:[]},oM=()=>{var e;return(e=Ce.useContext(Ug))!=null?e:RA},lM=e=>Ce.useContext(Ug)?Ce.createElement(Ce.Fragment,null,e.children):Ce.createElement(DA,{...e}),CA=["light","dark"],DA=({forcedTheme:e,disableTransitionOnChange:t=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:s="theme",themes:a=CA,defaultTheme:r=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:h,scriptProps:p})=>{let[u,d]=Ce.useState(()=>UA(s,r)),[g,b]=Ce.useState(()=>u==="system"?Lg():u),m=l?Object.values(l):a,f=Ce.useCallback(E=>{let T=E;if(!T)return;E==="system"&&n&&(T=Lg());let w=l?l[T]:T,x=t?NA(h):null,A=document.documentElement,C=D=>{D==="class"?(A.classList.remove(...m),w&&A.classList.add(w)):D.startsWith("data-")&&(w?A.setAttribute(D,w):A.removeAttribute(D))};if(Array.isArray(o)?o.forEach(C):C(o),i){let D=aM.includes(r)?r:null,H=aM.includes(T)?T:D;A.style.colorScheme=H}x?.()},[h]),_=Ce.useCallback(E=>{let T=typeof E=="function"?E(u):E;d(T);try{localStorage.setItem(s,T)}catch{}},[u]),S=Ce.useCallback(E=>{let T=Lg(E);b(T),u==="system"&&n&&!e&&f("system")},[u,e]);Ce.useEffect(()=>{let E=window.matchMedia(rM);return E.addListener(S),S(E),()=>E.removeListener(S)},[S]),Ce.useEffect(()=>{let E=T=>{T.key===s&&(T.newValue?d(T.newValue):_(r))};return window.addEventListener("storage",E),()=>window.removeEventListener("storage",E)},[_]),Ce.useEffect(()=>{f(e??u)},[e,u]);let v=Ce.useMemo(()=>({theme:u,setTheme:_,forcedTheme:e,resolvedTheme:u==="system"?g:u,themes:n?[...a,"system"]:a,systemTheme:n?g:void 0}),[u,_,e,g,n,a]);return Ce.createElement(Ug.Provider,{value:v},Ce.createElement(LA,{forcedTheme:e,storageKey:s,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:r,value:l,themes:a,nonce:h,scriptProps:p}),c)},LA=Ce.memo(({forcedTheme:e,storageKey:t,attribute:n,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:r,themes:o,nonce:l,scriptProps:c})=>{let h=JSON.stringify([n,t,a,e,o,r,i,s]).slice(1,-1);return Ce.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${AA.toString()})(${h})`}})}),UA=(e,t)=>{if(wA)return;let n;try{n=localStorage.getItem(e)||void 0}catch{}return n||t},NA=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},Lg=e=>(e||(e=window.matchMedia(rM)),e.matches?"dark":"light");var _r={};N1(_r,{default:()=>Gd});var gr=Gi(Er());var zM=0,_0=1,FM=2;var Vc=1,HM=2,Jo=3,Aa=0,Pn=1,ui=2,ns=0,Ko=1,v0=2,y0=3,x0=4,VM=5;var hr=100,GM=101,kM=102,WM=103,XM=104,qM=200,YM=201,ZM=202,JM=203,S0=204,M0=205,KM=206,QM=207,jM=208,$M=209,tb=210,eb=211,nb=212,ib=213,sb=214,of=0,lf=1,cf=2,Do=3,uf=4,hf=5,ff=6,df=7,b0=0,ab=1,rb=2,Bi=0,E0=1,T0=2,A0=3,w0=4,R0=5,C0=6,Gc=7;var D0=300,wa=301,fr=302,kf=303,Wf=304,kc=306,$i=1e3,Ai=1001,pf=1002,mn=1003,ob=1004;var Wc=1005;var ln=1006,Xf=1007;var is=1008;var Zn=1009,L0=1010,U0=1011,Qo=1012,qf=1013,zi=1014,Fi=1015,Hi=1016,Yf=1017,Zf=1018,jo=1020,N0=35902,I0=35899,O0=1021,P0=1022,wi=1023,ts=1026,Ra=1027,B0=1028,Jf=1029,Ca=1030,Kf=1031;var Qf=1033,Xc=33776,qc=33777,Yc=33778,Zc=33779,jf=35840,$f=35841,td=35842,ed=35843,nd=36196,id=37492,sd=37496,ad=37488,rd=37489,Jc=37490,od=37491,ld=37808,cd=37809,ud=37810,hd=37811,fd=37812,dd=37813,pd=37814,md=37815,gd=37816,_d=37817,vd=37818,yd=37819,xd=37820,Sd=37821,Md=36492,bd=36494,Ed=36495,Td=36283,Ad=36284,Kc=36285,wd=36286;var xc=2300,mf=2301,af=2302,a0=2303,r0=2400,o0=2401,l0=2402;var lb=3200;var Rd=0,cb=1,Is="",Sn="srgb",Sc="srgb-linear",Mc="linear",Me="srgb";var rf=7680;var ub=519,hb=512,fb=513,db=514,Cd=515,pb=516,mb=517,Dd=518,gb=519,_b=35044;var z0="300 es",Pi=2e3,Lo=2001;function IA(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function OA(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function bc(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function vb(){let e=bc("canvas");return e.style.display="block",e}var cM={},Uo=null;function F0(...e){let t="THREE."+e.shift();Uo?Uo("log",t,...e):console.log(t,...e)}function yb(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function kt(...e){e=yb(e);let t="THREE."+e.shift();if(Uo)Uo("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Gt(...e){e=yb(e);let t="THREE."+e.shift();if(Uo)Uo("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function ar(...e){let t=e.join(" ");t in cM||(cM[t]=!0,kt(...e))}function xb(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var Sb={[of]:lf,[cf]:ff,[uf]:df,[Do]:hf,[lf]:of,[ff]:cf,[df]:uf,[hf]:Do},es=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},En=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ng=Math.PI/180,gf=180/Math.PI;function $o(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(En[e&255]+En[e>>8&255]+En[e>>16&255]+En[e>>24&255]+"-"+En[t&255]+En[t>>8&255]+"-"+En[t>>16&15|64]+En[t>>24&255]+"-"+En[n&63|128]+En[n>>8&255]+"-"+En[n>>16&255]+En[n>>24&255]+En[i&255]+En[i>>8&255]+En[i>>16&255]+En[i>>24&255]).toLowerCase()}function se(e,t,n){return Math.max(t,Math.min(n,e))}function PA(e,t){return(e%t+t)%t}function Ig(e,t,n){return(1-n)*e+n*t}function fc(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function qn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var dt=class e{static{e.prototype.isVector2=!0}constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=se(this.x,t.x,n.x),this.y=se(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=se(this.x,t,n),this.y=se(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(se(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(se(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Un=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],h=i[s+2],p=i[s+3],u=a[r+0],d=a[r+1],g=a[r+2],b=a[r+3];if(p!==b||l!==u||c!==d||h!==g){let m=l*u+c*d+h*g+p*b;m<0&&(u=-u,d=-d,g=-g,b=-b,m=-m);let f=1-o;if(m<.9995){let _=Math.acos(m),S=Math.sin(_);f=Math.sin(f*_)/S,o=Math.sin(o*_)/S,l=l*f+u*o,c=c*f+d*o,h=h*f+g*o,p=p*f+b*o}else{l=l*f+u*o,c=c*f+d*o,h=h*f+g*o,p=p*f+b*o;let _=1/Math.sqrt(l*l+c*c+h*h+p*p);l*=_,c*=_,h*=_,p*=_}}t[n]=l,t[n+1]=c,t[n+2]=h,t[n+3]=p}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],p=a[r],u=a[r+1],d=a[r+2],g=a[r+3];return t[n]=o*g+h*p+l*d-c*u,t[n+1]=l*g+h*u+c*p-o*d,t[n+2]=c*g+h*d+o*u-l*p,t[n+3]=h*g-o*p-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),p=o(a/2),u=l(i/2),d=l(s/2),g=l(a/2);switch(r){case"XYZ":this._x=u*h*p+c*d*g,this._y=c*d*p-u*h*g,this._z=c*h*g+u*d*p,this._w=c*h*p-u*d*g;break;case"YXZ":this._x=u*h*p+c*d*g,this._y=c*d*p-u*h*g,this._z=c*h*g-u*d*p,this._w=c*h*p+u*d*g;break;case"ZXY":this._x=u*h*p-c*d*g,this._y=c*d*p+u*h*g,this._z=c*h*g+u*d*p,this._w=c*h*p-u*d*g;break;case"ZYX":this._x=u*h*p-c*d*g,this._y=c*d*p+u*h*g,this._z=c*h*g-u*d*p,this._w=c*h*p+u*d*g;break;case"YZX":this._x=u*h*p+c*d*g,this._y=c*d*p+u*h*g,this._z=c*h*g-u*d*p,this._w=c*h*p-u*d*g;break;case"XZY":this._x=u*h*p-c*d*g,this._y=c*d*p-u*h*g,this._z=c*h*g+u*d*p,this._w=c*h*p+u*d*g;break;default:kt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],h=n[6],p=n[10],u=i+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(i>o&&i>p){let d=2*Math.sqrt(1+i-o-p);this._w=(h-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-i-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+p-i-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(se(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,h=n._w;return this._x=i*h+r*o+s*c-a*l,this._y=s*h+r*l+a*o-i*c,this._z=a*h+r*c+i*l-s*o,this._w=r*h-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,n=Math.sin(n*c)/h,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class e{static{e.prototype.isVector3=!0}constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(uM.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(uM.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),h=2*(o*n-a*s),p=2*(a*i-r*n);return this.x=n+l*c+r*p-o*h,this.y=i+l*h+o*c-a*p,this.z=s+l*p+a*h-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=se(this.x,t.x,n.x),this.y=se(this.y,t.y,n.y),this.z=se(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=se(this.x,t,n),this.y=se(this.y,t,n),this.z=se(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(se(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Og.copy(this).projectOnVector(t),this.sub(Og)}reflect(t){return this.sub(Og.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(se(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Og=new N,uM=new Un,Zt=class e{static{e.prototype.isMatrix3=!0}constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=n,h[4]=a,h[5]=l,h[6]=i,h[7]=r,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],h=i[4],p=i[7],u=i[2],d=i[5],g=i[8],b=s[0],m=s[3],f=s[6],_=s[1],S=s[4],v=s[7],E=s[2],T=s[5],w=s[8];return a[0]=r*b+o*_+l*E,a[3]=r*m+o*S+l*T,a[6]=r*f+o*v+l*w,a[1]=c*b+h*_+p*E,a[4]=c*m+h*S+p*T,a[7]=c*f+h*v+p*w,a[2]=u*b+d*_+g*E,a[5]=u*m+d*S+g*T,a[8]=u*f+d*v+g*w,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return n*r*h-n*o*c-i*a*h+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],p=h*r-o*c,u=o*l-h*a,d=c*a-r*l,g=n*p+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/g;return t[0]=p*b,t[1]=(s*c-h*i)*b,t[2]=(o*i-s*r)*b,t[3]=u*b,t[4]=(h*n-s*l)*b,t[5]=(s*a-o*n)*b,t[6]=d*b,t[7]=(i*l-c*n)*b,t[8]=(r*n-i*a)*b,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return ar("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Pg.makeScale(t,n)),this}rotate(t){return ar("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Pg.makeRotation(-t)),this}translate(t,n){return ar("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Pg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Pg=new Zt,hM=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fM=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function BA(){let e={enabled:!0,workingColorSpace:Sc,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===Me&&(s.r=Us(s.r),s.g=Us(s.g),s.b=Us(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===Me&&(s.r=Co(s.r),s.g=Co(s.g),s.b=Co(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Is?Mc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return ar("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return ar("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[Sc]:{primaries:t,whitePoint:i,transfer:Mc,toXYZ:hM,fromXYZ:fM,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Sn},outputColorSpaceConfig:{drawingBufferColorSpace:Sn}},[Sn]:{primaries:t,whitePoint:i,transfer:Me,toXYZ:hM,fromXYZ:fM,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Sn}}}),e}var fe=BA();function Us(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Co(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var go,_f=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{go===void 0&&(go=bc("canvas")),go.width=t.width,go.height=t.height;let s=go.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=go}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let n=bc("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Us(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Us(n[i]/255)*255):n[i]=Us(n[i]);return{data:n,width:t.width,height:t.height}}else return kt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},zA=0,No=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:zA++}),this.uuid=$o(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(Bg(s[r].image)):a.push(Bg(s[r]))}else a=Bg(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function Bg(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?_f.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(kt("Texture: Unable to serialize Texture."),{})}var FA=0,zg=new N,Nn=class e extends es{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=Ai,s=Ai,a=ln,r=is,o=wi,l=Zn,c=e.DEFAULT_ANISOTROPY,h=Is){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:FA++}),this.uuid=$o(),this.name="",this.source=new No(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(zg).x}get height(){return this.source.getSize(zg).y}get depth(){return this.source.getSize(zg).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){kt(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){kt(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==D0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case $i:t.x=t.x-Math.floor(t.x);break;case Ai:t.x=t.x<0?0:1;break;case pf:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case $i:t.y=t.y-Math.floor(t.y);break;case Ai:t.y=t.y<0?0:1;break;case pf:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=D0;Nn.DEFAULT_ANISOTROPY=1;var Ve=class e{static{e.prototype.isVector4=!0}constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],h=l[4],p=l[8],u=l[1],d=l[5],g=l[9],b=l[2],m=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(p-b)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(p+b)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+f-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let S=(c+1)/2,v=(d+1)/2,E=(f+1)/2,T=(h+u)/4,w=(p+b)/4,x=(g+m)/4;return S>v&&S>E?S<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(S),s=T/i,a=w/i):v>E?v<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(v),i=T/s,a=x/s):E<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(E),i=w/a,s=x/a),this.set(i,s,a,n),this}let _=Math.sqrt((m-g)*(m-g)+(p-b)*(p-b)+(u-h)*(u-h));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(p-b)/_,this.z=(u-h)/_,this.w=Math.acos((c+d+f-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=se(this.x,t.x,n.x),this.y=se(this.y,t.y,n.y),this.z=se(this.z,t.z,n.z),this.w=se(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=se(this.x,t,n),this.y=se(this.y,t,n),this.z=se(this.z,t,n),this.w=se(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(se(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},vf=class extends es{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ln,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new Ve(0,0,t,n),this.scissorTest=!1,this.viewport=new Ve(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Nn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:ln,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new No(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let n=t.depthTexture.clone();n.renderTarget=null,this.depthTexture=n}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yn=class extends vf{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},Ec=class extends Nn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=mn,this.minFilter=mn,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var yf=class extends Nn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=mn,this.minFilter=mn,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Le=class e{static{e.prototype.isMatrix4=!0}constructor(t,n,i,s,a,r,o,l,c,h,p,u,d,g,b,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,h,p,u,d,g,b,m)}set(t,n,i,s,a,r,o,l,c,h,p,u,d,g,b,m){let f=this.elements;return f[0]=t,f[4]=n,f[8]=i,f[12]=s,f[1]=a,f[5]=r,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=p,f[14]=u,f[3]=d,f[7]=g,f[11]=b,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/_o.setFromMatrixColumn(t,0).length(),a=1/_o.setFromMatrixColumn(t,1).length(),r=1/_o.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(a),p=Math.sin(a);if(t.order==="XYZ"){let u=r*h,d=r*p,g=o*h,b=o*p;n[0]=l*h,n[4]=-l*p,n[8]=c,n[1]=d+g*c,n[5]=u-b*c,n[9]=-o*l,n[2]=b-u*c,n[6]=g+d*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*h,d=l*p,g=c*h,b=c*p;n[0]=u+b*o,n[4]=g*o-d,n[8]=r*c,n[1]=r*p,n[5]=r*h,n[9]=-o,n[2]=d*o-g,n[6]=b+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*h,d=l*p,g=c*h,b=c*p;n[0]=u-b*o,n[4]=-r*p,n[8]=g+d*o,n[1]=d+g*o,n[5]=r*h,n[9]=b-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*h,d=r*p,g=o*h,b=o*p;n[0]=l*h,n[4]=g*c-d,n[8]=u*c+b,n[1]=l*p,n[5]=b*c+u,n[9]=d*c-g,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,d=r*c,g=o*l,b=o*c;n[0]=l*h,n[4]=b-u*p,n[8]=g*p+d,n[1]=p,n[5]=r*h,n[9]=-o*h,n[2]=-c*h,n[6]=d*p+g,n[10]=u-b*p}else if(t.order==="XZY"){let u=r*l,d=r*c,g=o*l,b=o*c;n[0]=l*h,n[4]=-p,n[8]=c*h,n[1]=u*p+b,n[5]=r*h,n[9]=d*p-g,n[2]=g*p-d,n[6]=o*h,n[10]=b*p+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(HA,t,VA)}lookAt(t,n,i){let s=this.elements;return ai.subVectors(t,n),ai.lengthSq()===0&&(ai.z=1),ai.normalize(),fa.crossVectors(i,ai),fa.lengthSq()===0&&(Math.abs(i.z)===1?ai.x+=1e-4:ai.z+=1e-4,ai.normalize(),fa.crossVectors(i,ai)),fa.normalize(),Bh.crossVectors(ai,fa),s[0]=fa.x,s[4]=Bh.x,s[8]=ai.x,s[1]=fa.y,s[5]=Bh.y,s[9]=ai.y,s[2]=fa.z,s[6]=Bh.z,s[10]=ai.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],h=i[1],p=i[5],u=i[9],d=i[13],g=i[2],b=i[6],m=i[10],f=i[14],_=i[3],S=i[7],v=i[11],E=i[15],T=s[0],w=s[4],x=s[8],A=s[12],C=s[1],D=s[5],H=s[9],k=s[13],O=s[2],B=s[6],J=s[10],q=s[14],st=s[3],W=s[7],Q=s[11],tt=s[15];return a[0]=r*T+o*C+l*O+c*st,a[4]=r*w+o*D+l*B+c*W,a[8]=r*x+o*H+l*J+c*Q,a[12]=r*A+o*k+l*q+c*tt,a[1]=h*T+p*C+u*O+d*st,a[5]=h*w+p*D+u*B+d*W,a[9]=h*x+p*H+u*J+d*Q,a[13]=h*A+p*k+u*q+d*tt,a[2]=g*T+b*C+m*O+f*st,a[6]=g*w+b*D+m*B+f*W,a[10]=g*x+b*H+m*J+f*Q,a[14]=g*A+b*k+m*q+f*tt,a[3]=_*T+S*C+v*O+E*st,a[7]=_*w+S*D+v*B+E*W,a[11]=_*x+S*H+v*J+E*Q,a[15]=_*A+S*k+v*q+E*tt,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],h=t[2],p=t[6],u=t[10],d=t[14],g=t[3],b=t[7],m=t[11],f=t[15],_=l*d-c*u,S=o*d-c*p,v=o*u-l*p,E=r*d-c*h,T=r*u-l*h,w=r*p-o*h;return n*(b*_-m*S+f*v)-i*(g*_-m*E+f*T)+s*(g*S-b*E+f*w)-a*(g*v-b*T+m*w)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return n*(r*h-o*c)-i*(a*h-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],p=t[9],u=t[10],d=t[11],g=t[12],b=t[13],m=t[14],f=t[15],_=n*o-i*r,S=n*l-s*r,v=n*c-a*r,E=i*l-s*o,T=i*c-a*o,w=s*c-a*l,x=h*b-p*g,A=h*m-u*g,C=h*f-d*g,D=p*m-u*b,H=p*f-d*b,k=u*f-d*m,O=_*k-S*H+v*D+E*C-T*A+w*x;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/O;return t[0]=(o*k-l*H+c*D)*B,t[1]=(s*H-i*k-a*D)*B,t[2]=(b*w-m*T+f*E)*B,t[3]=(u*T-p*w-d*E)*B,t[4]=(l*C-r*k-c*A)*B,t[5]=(n*k-s*C+a*A)*B,t[6]=(m*v-g*w-f*S)*B,t[7]=(h*w-u*v+d*S)*B,t[8]=(r*H-o*C+c*x)*B,t[9]=(i*C-n*H-a*x)*B,t[10]=(g*T-b*v+f*_)*B,t[11]=(p*v-h*T-d*_)*B,t[12]=(o*A-r*D-l*x)*B,t[13]=(n*D-i*A+s*x)*B,t[14]=(b*S-g*E-m*_)*B,t[15]=(h*E-p*S+u*_)*B,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,h=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*r,0,c*l-s*o,h*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,h=r+r,p=o+o,u=a*c,d=a*h,g=a*p,b=r*h,m=r*p,f=o*p,_=l*c,S=l*h,v=l*p,E=i.x,T=i.y,w=i.z;return s[0]=(1-(b+f))*E,s[1]=(d+v)*E,s[2]=(g-S)*E,s[3]=0,s[4]=(d-v)*T,s[5]=(1-(u+f))*T,s[6]=(m+_)*T,s[7]=0,s[8]=(g+S)*w,s[9]=(m-_)*w,s[10]=(1-(u+b))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=_o.set(s[0],s[1],s[2]).length(),o=_o.set(s[4],s[5],s[6]).length(),l=_o.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Ui.copy(this);let c=1/r,h=1/o,p=1/l;return Ui.elements[0]*=c,Ui.elements[1]*=c,Ui.elements[2]*=c,Ui.elements[4]*=h,Ui.elements[5]*=h,Ui.elements[6]*=h,Ui.elements[8]*=p,Ui.elements[9]*=p,Ui.elements[10]*=p,n.setFromRotationMatrix(Ui),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Pi,l=!1){let c=this.elements,h=2*a/(n-t),p=2*a/(i-s),u=(n+t)/(n-t),d=(i+s)/(i-s),g,b;if(l)g=a/(r-a),b=r*a/(r-a);else if(o===Pi)g=-(r+a)/(r-a),b=-2*r*a/(r-a);else if(o===Lo)g=-r/(r-a),b=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Pi,l=!1){let c=this.elements,h=2/(n-t),p=2/(i-s),u=-(n+t)/(n-t),d=-(i+s)/(i-s),g,b;if(l)g=1/(r-a),b=r/(r-a);else if(o===Pi)g=-2/(r-a),b=-(r+a)/(r-a);else if(o===Lo)g=-1/(r-a),b=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},_o=new N,Ui=new Le,HA=new N(0,0,0),VA=new N(1,1,1),fa=new N,Bh=new N,ai=new N,dM=new Le,pM=new Un,Ns=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],h=s[9],p=s[2],u=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(se(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-se(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(se(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-se(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(se(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-se(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-h,d),this._y=0);break;default:kt("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return dM.makeRotationFromQuaternion(t),this.setFromRotationMatrix(dM,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return pM.setFromEuler(this),this.setFromQuaternion(pM,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ns.DEFAULT_ORDER="XYZ";var Io=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},GA=0,mM=new N,vo=new Un,ws=new Le,zh=new N,dc=new N,kA=new N,WA=new Un,gM=new N(1,0,0),_M=new N(0,1,0),vM=new N(0,0,1),yM={type:"added"},XA={type:"removed"},yo={type:"childadded",child:null},Fg={type:"childremoved",child:null},In=class e extends es{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:GA++}),this.uuid=$o(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new N,n=new Ns,i=new Un,s=new N(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Le},normalMatrix:{value:new Zt}}),this.matrix=new Le,this.matrixWorld=new Le,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Io,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return vo.setFromAxisAngle(t,n),this.quaternion.multiply(vo),this}rotateOnWorldAxis(t,n){return vo.setFromAxisAngle(t,n),this.quaternion.premultiply(vo),this}rotateX(t){return this.rotateOnAxis(gM,t)}rotateY(t){return this.rotateOnAxis(_M,t)}rotateZ(t){return this.rotateOnAxis(vM,t)}translateOnAxis(t,n){return mM.copy(t).applyQuaternion(this.quaternion),this.position.add(mM.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(gM,t)}translateY(t){return this.translateOnAxis(_M,t)}translateZ(t){return this.translateOnAxis(vM,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ws.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?zh.copy(t):zh.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),dc.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ws.lookAt(dc,zh,this.up):ws.lookAt(zh,dc,this.up),this.quaternion.setFromRotationMatrix(ws),s&&(ws.extractRotation(s.matrixWorld),vo.setFromRotationMatrix(ws),this.quaternion.premultiply(vo.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Gt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(yM),yo.child=t,this.dispatchEvent(yo),yo.child=null):Gt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(XA),Fg.child=t,this.dispatchEvent(Fg),Fg.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ws.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ws.multiply(t.parent.matrixWorld)),t.applyMatrix4(ws),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(yM),yo.child=t,this.dispatchEvent(yo),yo.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dc,t,kA),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dc,WA,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let p=l[c];a(t.shapes,p)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),h=r(t.images),p=r(t.shapes),u=r(t.skeletons),d=r(t.animations),g=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),p.length>0&&(i.shapes=p),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function r(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};In.DEFAULT_UP=new N(0,1,0);In.DEFAULT_MATRIX_AUTO_UPDATE=!0;In.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qi=class extends In{constructor(){super(),this.isGroup=!0,this.type="Group"}},qA={type:"move"},Oo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let b of t.hand.values()){let m=n.getJointPose(b,i),f=this._getHandJoint(c,b);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=h.position.distanceTo(p.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(qA)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new Qi;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},Mb={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},da={h:0,s:0,l:0},Fh={h:0,s:0,l:0};function Hg(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var jt=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=Sn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,fe.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=fe.workingColorSpace){return this.r=t,this.g=n,this.b=i,fe.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=fe.workingColorSpace){if(t=PA(t,1),n=se(n,0,1),i=se(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=Hg(r,a,t+1/3),this.g=Hg(r,a,t),this.b=Hg(r,a,t-1/3)}return fe.colorSpaceToWorking(this,s),this}setStyle(t,n=Sn){function i(a){a!==void 0&&parseFloat(a)<1&&kt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:kt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);kt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=Sn){let i=Mb[t.toLowerCase()];return i!==void 0?this.setHex(i,n):kt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Us(t.r),this.g=Us(t.g),this.b=Us(t.b),this}copyLinearToSRGB(t){return this.r=Co(t.r),this.g=Co(t.g),this.b=Co(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Sn){return fe.workingToColorSpace(Tn.copy(this),t),Math.round(se(Tn.r*255,0,255))*65536+Math.round(se(Tn.g*255,0,255))*256+Math.round(se(Tn.b*255,0,255))}getHexString(t=Sn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=fe.workingColorSpace){fe.workingToColorSpace(Tn.copy(this),n);let i=Tn.r,s=Tn.g,a=Tn.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,h=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=h<=.5?p/(r+o):p/(2-r-o),r){case i:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-i)/p+2;break;case a:l=(i-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,n=fe.workingColorSpace){return fe.workingToColorSpace(Tn.copy(this),n),t.r=Tn.r,t.g=Tn.g,t.b=Tn.b,t}getStyle(t=Sn){fe.workingToColorSpace(Tn.copy(this),t);let n=Tn.r,i=Tn.g,s=Tn.b;return t!==Sn?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(da),this.setHSL(da.h+t,da.s+n,da.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(da),t.getHSL(Fh);let i=Ig(da.h,Fh.h,n),s=Ig(da.s,Fh.s,n),a=Ig(da.l,Fh.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Tn=new jt;jt.NAMES=Mb;var Po=class extends In{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ns,this.environmentIntensity=1,this.environmentRotation=new Ns,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),n.object.backgroundBlurriness=this.backgroundBlurriness,n.object.backgroundIntensity=this.backgroundIntensity,n.object.backgroundRotation=this.backgroundRotation.toArray(),n.object.environmentIntensity=this.environmentIntensity,n.object.environmentRotation=this.environmentRotation.toArray(),n}},Ni=new N,Rs=new N,Vg=new N,Cs=new N,xo=new N,So=new N,xM=new N,Gg=new N,kg=new N,Wg=new N,Xg=new Ve,qg=new Ve,Yg=new Ve,_a=class e{constructor(t=new N,n=new N,i=new N){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),Ni.subVectors(t,n),s.cross(Ni);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){Ni.subVectors(s,n),Rs.subVectors(i,n),Vg.subVectors(t,n);let r=Ni.dot(Ni),o=Ni.dot(Rs),l=Ni.dot(Vg),c=Rs.dot(Rs),h=Rs.dot(Vg),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*h)*u,g=(r*h-o*l)*u;return a.set(1-d-g,g,d)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Cs)===null?!1:Cs.x>=0&&Cs.y>=0&&Cs.x+Cs.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Cs)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Cs.x),l.addScaledVector(r,Cs.y),l.addScaledVector(o,Cs.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return Xg.setScalar(0),qg.setScalar(0),Yg.setScalar(0),Xg.fromBufferAttribute(t,n),qg.fromBufferAttribute(t,i),Yg.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Xg,a.x),r.addScaledVector(qg,a.y),r.addScaledVector(Yg,a.z),r}static isFrontFacing(t,n,i,s){return Ni.subVectors(i,n),Rs.subVectors(t,n),Ni.cross(Rs).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ni.subVectors(this.c,this.b),Rs.subVectors(this.a,this.b),Ni.cross(Rs).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;xo.subVectors(s,i),So.subVectors(a,i),Gg.subVectors(t,i);let l=xo.dot(Gg),c=So.dot(Gg);if(l<=0&&c<=0)return n.copy(i);kg.subVectors(t,s);let h=xo.dot(kg),p=So.dot(kg);if(h>=0&&p<=h)return n.copy(s);let u=l*p-h*c;if(u<=0&&l>=0&&h<=0)return r=l/(l-h),n.copy(i).addScaledVector(xo,r);Wg.subVectors(t,a);let d=xo.dot(Wg),g=So.dot(Wg);if(g>=0&&d<=g)return n.copy(a);let b=d*c-l*g;if(b<=0&&c>=0&&g<=0)return o=c/(c-g),n.copy(i).addScaledVector(So,o);let m=h*g-d*p;if(m<=0&&p-h>=0&&d-g>=0)return xM.subVectors(a,s),o=(p-h)/(p-h+(d-g)),n.copy(s).addScaledVector(xM,o);let f=1/(m+b+u);return r=b*f,o=u*f,n.copy(i).addScaledVector(xo,r).addScaledVector(So,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},va=class{constructor(t=new N(1/0,1/0,1/0),n=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Ii.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Ii.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=Ii.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Ii):Ii.fromBufferAttribute(a,r),Ii.applyMatrix4(t.matrixWorld),this.expandByPoint(Ii);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Hh.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Hh.copy(i.boundingBox)),Hh.applyMatrix4(t.matrixWorld),this.union(Hh)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ii),Ii.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(pc),Vh.subVectors(this.max,pc),Mo.subVectors(t.a,pc),bo.subVectors(t.b,pc),Eo.subVectors(t.c,pc),pa.subVectors(bo,Mo),ma.subVectors(Eo,bo),er.subVectors(Mo,Eo);let n=[0,-pa.z,pa.y,0,-ma.z,ma.y,0,-er.z,er.y,pa.z,0,-pa.x,ma.z,0,-ma.x,er.z,0,-er.x,-pa.y,pa.x,0,-ma.y,ma.x,0,-er.y,er.x,0];return!Zg(n,Mo,bo,Eo,Vh)||(n=[1,0,0,0,1,0,0,0,1],!Zg(n,Mo,bo,Eo,Vh))?!1:(Gh.crossVectors(pa,ma),n=[Gh.x,Gh.y,Gh.z],Zg(n,Mo,bo,Eo,Vh))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ii).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ii).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ds[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ds[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ds[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ds[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ds[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ds[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ds[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ds[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ds),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ds=[new N,new N,new N,new N,new N,new N,new N,new N],Ii=new N,Hh=new va,Mo=new N,bo=new N,Eo=new N,pa=new N,ma=new N,er=new N,pc=new N,Vh=new N,Gh=new N,nr=new N;function Zg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){nr.fromArray(e,a);let o=s.x*Math.abs(nr.x)+s.y*Math.abs(nr.y)+s.z*Math.abs(nr.z),l=t.dot(nr),c=n.dot(nr),h=i.dot(nr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var en=new N,kh=new dt,YA=0,wn=class extends es{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:YA++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=_b,this.updateRanges=[],this.gpuType=Fi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)kh.fromBufferAttribute(this,n),kh.applyMatrix3(t),this.setXY(n,kh.x,kh.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)en.fromBufferAttribute(this,n),en.applyMatrix3(t),this.setXYZ(n,en.x,en.y,en.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)en.fromBufferAttribute(this,n),en.applyMatrix4(t),this.setXYZ(n,en.x,en.y,en.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)en.fromBufferAttribute(this,n),en.applyNormalMatrix(t),this.setXYZ(n,en.x,en.y,en.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)en.fromBufferAttribute(this,n),en.transformDirection(t),this.setXYZ(n,en.x,en.y,en.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=fc(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=qn(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=fc(n,this.array)),n}setX(t,n){return this.normalized&&(n=qn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=fc(n,this.array)),n}setY(t,n){return this.normalized&&(n=qn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=fc(n,this.array)),n}setZ(t,n){return this.normalized&&(n=qn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=fc(n,this.array)),n}setW(t,n){return this.normalized&&(n=qn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=qn(n,this.array),i=qn(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=qn(n,this.array),i=qn(i,this.array),s=qn(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=qn(n,this.array),i=qn(i,this.array),s=qn(s,this.array),a=qn(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Tc=class extends wn{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var Ac=class extends wn{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var nn=class extends wn{constructor(t,n,i){super(new Float32Array(t),n,i)}},ZA=new va,mc=new N,Jg=new N,Bo=class{constructor(t=new N,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):ZA.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;mc.subVectors(t,this.center);let n=mc.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(mc,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Jg.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(mc.copy(t.center).add(Jg)),this.expandByPoint(mc.copy(t.center).sub(Jg))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},JA=0,Ti=new Le,Kg=new In,To=new N,ri=new va,gc=new va,pn=new N,On=class e extends es{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:JA++}),this.uuid=$o(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(IA(t)?Ac:Tc)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Zt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ti.makeRotationFromQuaternion(t),this.applyMatrix4(Ti),this}rotateX(t){return Ti.makeRotationX(t),this.applyMatrix4(Ti),this}rotateY(t){return Ti.makeRotationY(t),this.applyMatrix4(Ti),this}rotateZ(t){return Ti.makeRotationZ(t),this.applyMatrix4(Ti),this}translate(t,n,i){return Ti.makeTranslation(t,n,i),this.applyMatrix4(Ti),this}scale(t,n,i){return Ti.makeScale(t,n,i),this.applyMatrix4(Ti),this}lookAt(t){return Kg.lookAt(t),Kg.updateMatrix(),this.applyMatrix4(Kg.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(To).negate(),this.translate(To.x,To.y,To.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new nn(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&kt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new va);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Gt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];ri.setFromBufferAttribute(a),this.morphTargetsRelative?(pn.addVectors(this.boundingBox.min,ri.min),this.boundingBox.expandByPoint(pn),pn.addVectors(this.boundingBox.max,ri.max),this.boundingBox.expandByPoint(pn)):(this.boundingBox.expandByPoint(ri.min),this.boundingBox.expandByPoint(ri.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Gt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Bo);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Gt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let i=this.boundingSphere.center;if(ri.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];gc.setFromBufferAttribute(o),this.morphTargetsRelative?(pn.addVectors(ri.min,gc.min),ri.expandByPoint(pn),pn.addVectors(ri.max,gc.max),ri.expandByPoint(pn)):(ri.expandByPoint(gc.min),ri.expandByPoint(gc.max))}ri.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)pn.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(pn));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)pn.fromBufferAttribute(o,c),l&&(To.fromBufferAttribute(t,c),pn.add(To)),s=Math.max(s,i.distanceToSquared(pn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Gt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Gt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new wn(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new N,l[x]=new N;let c=new N,h=new N,p=new N,u=new dt,d=new dt,g=new dt,b=new N,m=new N;function f(x,A,C){c.fromBufferAttribute(i,x),h.fromBufferAttribute(i,A),p.fromBufferAttribute(i,C),u.fromBufferAttribute(a,x),d.fromBufferAttribute(a,A),g.fromBufferAttribute(a,C),h.sub(c),p.sub(c),d.sub(u),g.sub(u);let D=1/(d.x*g.y-g.x*d.y);isFinite(D)&&(b.copy(h).multiplyScalar(g.y).addScaledVector(p,-d.y).multiplyScalar(D),m.copy(p).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(D),o[x].add(b),o[A].add(b),o[C].add(b),l[x].add(m),l[A].add(m),l[C].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let x=0,A=_.length;x<A;++x){let C=_[x],D=C.start,H=C.count;for(let k=D,O=D+H;k<O;k+=3)f(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let S=new N,v=new N,E=new N,T=new N;function w(x){E.fromBufferAttribute(s,x),T.copy(E);let A=o[x];S.copy(A),S.sub(E.multiplyScalar(E.dot(A))).normalize(),v.crossVectors(T,A);let D=v.dot(l[x])<0?-1:1;r.setXYZW(x,S.x,S.y,S.z,D)}for(let x=0,A=_.length;x<A;++x){let C=_[x],D=C.start,H=C.count;for(let k=D,O=D+H;k<O;k+=3)w(t.getX(k+0)),w(t.getX(k+1)),w(t.getX(k+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new wn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new N,a=new N,r=new N,o=new N,l=new N,c=new N,h=new N,p=new N;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),b=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(n,g),a.fromBufferAttribute(n,b),r.fromBufferAttribute(n,m),h.subVectors(r,a),p.subVectors(s,a),h.cross(p),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(b,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=n.count;u<d;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),h.subVectors(r,a),p.subVectors(s,a),h.cross(p),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)pn.fromBufferAttribute(t,n),pn.normalize(),t.setXYZ(n,pn.x,pn.y,pn.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,p=o.normalized,u=new c.constructor(l.length*h),d=0,g=0;for(let b=0,m=l.length;b<m;b++){o.isInterleavedBufferAttribute?d=l[b]*o.data.stride+o.offset:d=l[b]*h;for(let f=0;f<h;f++)u[g++]=c[d++]}return new wn(u,h,p)}if(this.index===null)return kt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let h=0,p=c.length;h<p;h++){let u=c[h],d=t(u,i);l.push(d)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(n))}let a=t.morphAttributes;for(let c in a){let h=[],p=a[c];for(let u=0,d=p.length;u<d;u++)h.push(p[u].clone(n));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,h=r.length;c<h;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Qg=new N,KA=new N,QA=new Zt,Oi=class{constructor(t=new N(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=Qg.subVectors(i,n).cross(KA.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(Qg),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||QA.getNormalMatrix(t),s=this.coplanarPoint(Qg).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},jA=0,ya=class extends es{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:jA++}),this.uuid=$o(),this.name="",this.type="Material",this.blending=Ko,this.side=Aa,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=S0,this.blendDst=M0,this.blendEquation=hr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=Do,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ub,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=rf,this.stencilZFail=rf,this.stencilZPass=rf,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){kt(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){kt(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Oi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new dt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new dt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Ls=new N,jg=new N,Wh=new N,Xh=new N,wc=class{constructor(t=new N,n=new N(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ls)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=Ls.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(Ls.copy(this.origin).addScaledVector(this.direction,n),Ls.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){jg.copy(t).add(n).multiplyScalar(.5),Wh.copy(n).sub(t).normalize(),Xh.copy(this.origin).sub(jg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(Wh),o=Xh.dot(this.direction),l=-Xh.dot(Wh),c=Xh.lengthSq(),h=Math.abs(1-r*r),p,u,d,g;if(h>0)if(p=r*l-o,u=r*o-l,g=a*h,p>=0)if(u>=-g)if(u<=g){let b=1/h;p*=b,u*=b,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-g?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=g?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(jg).addScaledVector(Wh,u),d}intersectSphere(t,n){if(t.radius<0)return null;Ls.subVectors(t.center,this.origin);let i=Ls.dot(this.direction),s=Ls.dot(Ls)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(a=(t.min.y-u.y)*h,r=(t.max.y-u.y)*h):(a=(t.max.y-u.y)*h,r=(t.min.y-u.y)*h),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(t.min.z-u.z)*p,l=(t.max.z-u.z)*p):(o=(t.max.z-u.z)*p,l=(t.min.z-u.z)*p),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,Ls)!==null}intersectTriangle(t,n,i,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,p=t.x-r.x,u=t.y-r.y,d=t.z-r.z,g=n.x-r.x,b=n.y-r.y,m=n.z-r.z,f=i.x-r.x,_=i.y-r.y,S=i.z-r.z,v=Math.abs(l),E=Math.abs(c),T=Math.abs(h),w,x,A,C,D,H,k,O,B,J,q,st;if(v>=E&&v>=T?(A=l,H=p,B=g,st=f,l>=0?(w=c,x=h,C=u,D=d,k=b,O=m,J=_,q=S):(w=h,x=c,C=d,D=u,k=m,O=b,J=S,q=_)):E>=T?(A=c,H=u,B=b,st=_,c>=0?(w=h,x=l,C=d,D=p,k=m,O=g,J=S,q=f):(w=l,x=h,C=p,D=d,k=g,O=m,J=f,q=S)):(A=h,H=d,B=m,st=S,h>=0?(w=l,x=c,C=p,D=u,k=g,O=b,J=f,q=_):(w=c,x=l,C=u,D=p,k=b,O=g,J=_,q=f)),A===0)return null;let W=w/A,Q=x/A,tt=1/A,Ut=C-W*H,wt=D-Q*H,ce=k-W*B,Jt=O-Q*B,ae=J-W*st,Z=q-Q*st,j=ae*Jt-Z*ce,xt=Ut*Z-wt*ae,Ft=ce*wt-Jt*Ut;if(s){if(j<0||xt<0||Ft<0)return null}else if((j<0||xt<0||Ft<0)&&(j>0||xt>0||Ft>0))return null;let Tt=j+xt+Ft;if(Tt===0)return null;let Bt=tt*(j*H+xt*B+Ft*st);return(Tt>0?Bt<0:Bt>0)?null:this.at(Bt/Tt,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rr=class extends ya{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ns,this.combine=b0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},SM=new Le,ir=new wc,qh=new Bo,MM=new N,Yh=new N,Zh=new N,Jh=new N,$g=new N,Kh=new N,bM=new N,Qh=new N,Je=class extends In{constructor(t=new On,n=new rr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){Kh.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let h=o[l],p=a[l];h!==0&&($g.fromBufferAttribute(p,t),r?Kh.addScaledVector($g,h):Kh.addScaledVector($g.sub(n),h))}n.add(Kh)}return n}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),qh.copy(i.boundingSphere),qh.applyMatrix4(a),ir.copy(t.ray).recast(t.near),!(qh.containsPoint(ir.origin)===!1&&(ir.intersectSphere(qh,MM)===null||ir.origin.distanceToSquared(MM)>(t.far-t.near)**2))&&(SM.copy(a).invert(),ir.copy(t.ray).applyMatrix4(SM),!(i.boundingBox!==null&&ir.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,ir)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,h=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,b=u.length;g<b;g++){let m=u[g],f=r[m.materialIndex],_=Math.max(m.start,d.start),S=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let v=_,E=S;v<E;v+=3){let T=o.getX(v),w=o.getX(v+1),x=o.getX(v+2);s=jh(this,f,t,i,c,h,p,T,w,x),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),b=Math.min(o.count,d.start+d.count);for(let m=g,f=b;m<f;m+=3){let _=o.getX(m),S=o.getX(m+1),v=o.getX(m+2);s=jh(this,r,t,i,c,h,p,_,S,v),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,b=u.length;g<b;g++){let m=u[g],f=r[m.materialIndex],_=Math.max(m.start,d.start),S=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let v=_,E=S;v<E;v+=3){let T=v,w=v+1,x=v+2;s=jh(this,f,t,i,c,h,p,T,w,x),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),b=Math.min(l.count,d.start+d.count);for(let m=g,f=b;m<f;m+=3){let _=m,S=m+1,v=m+2;s=jh(this,r,t,i,c,h,p,_,S,v),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function $A(e,t,n,i,s,a,r,o){let l;if(t.side===Pn?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===Aa,o),l===null)return null;Qh.copy(o),Qh.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(Qh);return c<n.near||c>n.far?null:{distance:c,point:Qh.clone(),object:e}}function jh(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,Yh),e.getVertexPosition(l,Zh),e.getVertexPosition(c,Jh);let h=$A(e,t,n,i,Yh,Zh,Jh,bM);if(h){let p=new N;_a.getBarycoord(bM,Yh,Zh,Jh,p),s&&(h.uv=_a.getInterpolatedAttribute(s,o,l,c,p,new dt)),a&&(h.uv1=_a.getInterpolatedAttribute(a,o,l,c,p,new dt)),r&&(h.normal=_a.getInterpolatedAttribute(r,o,l,c,p,new N),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new N,materialIndex:0};_a.getNormal(Yh,Zh,Jh,u.normal),h.face=u,h.barycoord=p}return h}var zo=class extends Nn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=mn,h=mn,p,u){super(null,r,o,l,c,h,s,a,p,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var sr=new Bo,tw=new dt(.5,.5),$h=new N,Fo=class{constructor(t=new Oi,n=new Oi,i=new Oi,s=new Oi,a=new Oi,r=new Oi){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Pi,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],h=a[4],p=a[5],u=a[6],d=a[7],g=a[8],b=a[9],m=a[10],f=a[11],_=a[12],S=a[13],v=a[14],E=a[15];if(s[0].setComponents(c-r,d-h,f-g,E-_).normalize(),s[1].setComponents(c+r,d+h,f+g,E+_).normalize(),s[2].setComponents(c+o,d+p,f+b,E+S).normalize(),s[3].setComponents(c-o,d-p,f-b,E-S).normalize(),i)s[4].setComponents(l,u,m,v).normalize(),s[5].setComponents(c-l,d-u,f-m,E-v).normalize();else if(s[4].setComponents(c-l,d-u,f-m,E-v).normalize(),n===Pi)s[5].setComponents(c+l,d+u,f+m,E+v).normalize();else if(n===Lo)s[5].setComponents(l,u,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),sr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),sr.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(sr)}intersectsSprite(t){sr.center.set(0,0,0);let n=tw.distanceTo(t.center);return sr.radius=.7071067811865476+n,sr.applyMatrix4(t.matrixWorld),this.intersectsSphere(sr)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if($h.x=s.normal.x>0?t.max.x:t.min.x,$h.y=s.normal.y>0?t.max.y:t.min.y,$h.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint($h)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Rc=class extends Nn{constructor(t=[],n=wa,i,s,a,r,o,l,c,h){super(t,n,i,s,a,r,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},or=class extends Nn{constructor(t,n,i,s,a,r,o,l,c){super(t,n,i,s,a,r,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var xa=class extends Nn{constructor(t,n,i=zi,s,a,r,o=mn,l=mn,c,h=ts,p=1){if(h!==ts&&h!==Ra)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:p};super(u,s,a,r,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new No(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return n.compareFunction=this.compareFunction,n}},xf=class extends xa{constructor(t,n=zi,i=wa,s,a,r=mn,o=mn,l,c=ts){let h={width:t,height:t,depth:1},p=[h,h,h,h,h,h];super(t,t,n,i,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Cc=class extends Nn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Ho=class e extends On{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],h=[],p=[],u=0,d=0;g("z","y","x",-1,-1,i,n,t,r,a,0),g("z","y","x",1,-1,i,n,-t,r,a,1),g("x","z","y",1,1,t,i,n,s,r,2),g("x","z","y",1,-1,t,i,-n,s,r,3),g("x","y","z",1,-1,t,n,i,s,a,4),g("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new nn(c,3)),this.setAttribute("normal",new nn(h,3)),this.setAttribute("uv",new nn(p,2));function g(b,m,f,_,S,v,E,T,w,x,A){let C=v/w,D=E/x,H=v/2,k=E/2,O=T/2,B=w+1,J=x+1,q=0,st=0,W=new N;for(let Q=0;Q<J;Q++){let tt=Q*D-k;for(let Ut=0;Ut<B;Ut++){let wt=Ut*C-H;W[b]=wt*_,W[m]=tt*S,W[f]=O,c.push(W.x,W.y,W.z),W[b]=0,W[m]=0,W[f]=T>0?1:-1,h.push(W.x,W.y,W.z),p.push(Ut/w),p.push(1-Q/x),q+=1}}for(let Q=0;Q<x;Q++)for(let tt=0;tt<w;tt++){let Ut=u+tt+B*Q,wt=u+tt+B*(Q+1),ce=u+(tt+1)+B*(Q+1),Jt=u+(tt+1)+B*Q;l.push(Ut,wt,Jt),l.push(wt,ce,Jt),st+=6}o.addGroup(d,st,A),d+=st,u+=q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var oi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){kt("Curve: .getPoint() not implemented.")}getPointAt(t,n){let i=this.getUtoTmapping(t);return this.getPoint(i,n)}getPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPoint(i/t));return n}getSpacedPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPointAt(i/t));return n}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let n=[],i,s=this.getPoint(0),a=0;n.push(0);for(let r=1;r<=t;r++)i=this.getPoint(r/t),a+=i.distanceTo(s),n.push(a),s=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,n=null){let i=this.getLengths(),s=0,a=i.length,r;n?r=n:r=t*i[a-1];let o=0,l=a-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-r,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===r)return s/(a-1);let h=i[s],u=i[s+1]-h,d=(r-h)/u;return(s+d)/(a-1)}getTangent(t,n){let s=t-1e-4,a=t+1e-4;s<0&&(s=0),a>1&&(a=1);let r=this.getPoint(s),o=this.getPoint(a),l=n||(r.isVector2?new dt:new N);return l.copy(o).sub(r).normalize(),l}getTangentAt(t,n){let i=this.getUtoTmapping(t);return this.getTangent(i,n)}computeFrenetFrames(t,n=!1){let i=new N,s=[],a=[],r=[],o=new N,l=new Le;for(let d=0;d<=t;d++){let g=d/t;s[d]=this.getTangentAt(g,new N)}a[0]=new N,r[0]=new N;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),p=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),p<=c&&(c=p,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),a[0].crossVectors(s[0],o),r[0].crossVectors(s[0],a[0]);for(let d=1;d<=t;d++){if(a[d]=a[d-1].clone(),r[d]=r[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(se(s[d-1].dot(s[d]),-1,1));a[d].applyMatrix4(l.makeRotationAxis(o,g))}r[d].crossVectors(s[d],a[d])}if(n===!0){let d=Math.acos(se(a[0].dot(a[t]),-1,1));d/=t,s[0].dot(o.crossVectors(a[0],a[t]))>0&&(d=-d);for(let g=1;g<=t;g++)a[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),r[g].crossVectors(s[g],a[g])}return{tangents:s,normals:a,binormals:r}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Vo=class extends oi{constructor(t=0,n=0,i=1,s=1,a=0,r=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=n,this.xRadius=i,this.yRadius=s,this.aStartAngle=a,this.aEndAngle=r,this.aClockwise=o,this.aRotation=l}getPoint(t,n=new dt){let i=n,s=Math.PI*2,a=this.aEndAngle-this.aStartAngle,r=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=s;for(;a>s;)a-=s;a<Number.EPSILON&&(r?a=0:a=s),this.aClockwise===!0&&!r&&(a===s?a=-s:a=a-s);let o=this.aStartAngle+t*a,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),p=Math.sin(this.aRotation),u=l-this.aX,d=c-this.aY;l=u*h-d*p+this.aX,c=u*p+d*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Sf=class extends Vo{constructor(t,n,i,s,a,r){super(t,n,i,i,s,a,r),this.isArcCurve=!0,this.type="ArcCurve"}};function H0(){let e=0,t=0,n=0,i=0;function s(a,r,o,l){e=a,t=o,n=-3*a+3*r-2*o-l,i=2*a-2*r+o+l}return{initCatmullRom:function(a,r,o,l,c){s(r,o,c*(o-a),c*(l-r))},initNonuniformCatmullRom:function(a,r,o,l,c,h,p){let u=(r-a)/c-(o-a)/(c+h)+(o-r)/h,d=(o-r)/h-(l-r)/(h+p)+(l-o)/p;u*=h,d*=h,s(r,o,u,d)},calc:function(a){let r=a*a,o=r*a;return e+t*a+n*r+i*o}}}var EM=new N,TM=new N,t0=new H0,e0=new H0,n0=new H0,Go=class extends oi{constructor(t=[],n=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=n,this.curveType=i,this.tension=s}getPoint(t,n=new N){let i=n,s=this.points,a=s.length,r=(a-(this.closed?0:1))*t,o=Math.floor(r),l=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/a)+1)*a:l===0&&o===a-1&&(o=a-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%a]:(TM.subVectors(s[0],s[1]).add(s[0]),c=TM);let p=s[o%a],u=s[(o+1)%a];if(this.closed||o+2<a?h=s[(o+2)%a]:(EM.subVectors(s[a-1],s[a-2]).add(s[a-1]),h=EM),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(p),d),b=Math.pow(p.distanceToSquared(u),d),m=Math.pow(u.distanceToSquared(h),d);b<1e-4&&(b=1),g<1e-4&&(g=b),m<1e-4&&(m=b),t0.initNonuniformCatmullRom(c.x,p.x,u.x,h.x,g,b,m),e0.initNonuniformCatmullRom(c.y,p.y,u.y,h.y,g,b,m),n0.initNonuniformCatmullRom(c.z,p.z,u.z,h.z,g,b,m)}else this.curveType==="catmullrom"&&(t0.initCatmullRom(c.x,p.x,u.x,h.x,this.tension),e0.initCatmullRom(c.y,p.y,u.y,h.y,this.tension),n0.initCatmullRom(c.z,p.z,u.z,h.z,this.tension));return i.set(t0.calc(l),e0.calc(l),n0.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function AM(e,t,n,i,s){let a=(i-t)*.5,r=(s-n)*.5,o=e*e,l=e*o;return(2*n-2*i+a+r)*l+(-3*n+3*i-2*a-r)*o+a*e+n}function ew(e,t){let n=1-e;return n*n*t}function nw(e,t){return 2*(1-e)*e*t}function iw(e,t){return e*e*t}function vc(e,t,n,i){return ew(e,t)+nw(e,n)+iw(e,i)}function sw(e,t){let n=1-e;return n*n*n*t}function aw(e,t){let n=1-e;return 3*n*n*e*t}function rw(e,t){return 3*(1-e)*e*e*t}function ow(e,t){return e*e*e*t}function yc(e,t,n,i,s){return sw(e,t)+aw(e,n)+rw(e,i)+ow(e,s)}var Dc=class extends oi{constructor(t=new dt,n=new dt,i=new dt,s=new dt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new dt){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(yc(t,s.x,a.x,r.x,o.x),yc(t,s.y,a.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Mf=class extends oi{constructor(t=new N,n=new N,i=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new N){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(yc(t,s.x,a.x,r.x,o.x),yc(t,s.y,a.y,r.y,o.y),yc(t,s.z,a.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Lc=class extends oi{constructor(t=new dt,n=new dt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=n}getPoint(t,n=new dt){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new dt){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},bf=class extends oi{constructor(t=new N,n=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=n}getPoint(t,n=new N){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new N){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Uc=class extends oi{constructor(t=new dt,n=new dt,i=new dt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new dt){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(vc(t,s.x,a.x,r.x),vc(t,s.y,a.y,r.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ef=class extends oi{constructor(t=new N,n=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new N){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(vc(t,s.x,a.x,r.x),vc(t,s.y,a.y,r.y),vc(t,s.z,a.z,r.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Nc=class extends oi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,n=new dt){let i=n,s=this.points,a=(s.length-1)*t,r=Math.floor(a),o=a-r,l=s[r===0?r:r-1],c=s[r],h=s[r>s.length-2?s.length-1:r+1],p=s[r>s.length-3?s.length-1:r+2];return i.set(AM(o,l.x,c.x,h.x,p.x),AM(o,l.y,c.y,h.y,p.y)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new dt().fromArray(s))}return this}},c0=Object.freeze({__proto__:null,ArcCurve:Sf,CatmullRomCurve3:Go,CubicBezierCurve:Dc,CubicBezierCurve3:Mf,EllipseCurve:Vo,LineCurve:Lc,LineCurve3:bf,QuadraticBezierCurve:Uc,QuadraticBezierCurve3:Ef,SplineCurve:Nc}),Tf=class extends oi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),n=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(n)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new c0[i](n,t))}return this}getPoint(t,n){let i=t*this.getLength(),s=this.getCurveLengths(),a=0;for(;a<s.length;){if(s[a]>=i){let r=s[a]-i,o=this.curves[a],l=o.getLength(),c=l===0?0:1-r/l;return o.getPointAt(c,n)}a++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],n=0;for(let i=0,s=this.curves.length;i<s;i++)n+=this.curves[i].getLength(),t.push(n);return this.cacheLengths=t,t}getSpacedPoints(t=40){let n=[];for(let i=0;i<=t;i++)n.push(this.getPoint(i/t));return this.autoClose&&n.push(n[0]),n}getPoints(t=12){let n=[],i;for(let s=0,a=this.curves;s<a.length;s++){let r=a[s],o=r.isEllipseCurve?t*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?t*r.points.length:t,l=r.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(n.push(h),i=h)}}return this.autoClose&&n.length>1&&!n[n.length-1].equals(n[0])&&n.push(n[0]),n}copy(t){super.copy(t),this.curves=[];for(let n=0,i=t.curves.length;n<i;n++){let s=t.curves[n];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let n=0,i=this.curves.length;n<i;n++){let s=this.curves[n];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let n=0,i=t.curves.length;n<i;n++){let s=t.curves[n];this.curves.push(new c0[s.type]().fromJSON(s))}return this}},lr=class extends Tf{constructor(t){super(),this.type="Path",this.currentPoint=new dt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let n=1,i=t.length;n<i;n++)this.lineTo(t[n].x,t[n].y);return this}moveTo(t,n){return this.currentPoint.set(t,n),this}lineTo(t,n){let i=new Lc(this.currentPoint.clone(),new dt(t,n));return this.curves.push(i),this.currentPoint.set(t,n),this}quadraticCurveTo(t,n,i,s){let a=new Uc(this.currentPoint.clone(),new dt(t,n),new dt(i,s));return this.curves.push(a),this.currentPoint.set(i,s),this}bezierCurveTo(t,n,i,s,a,r){let o=new Dc(this.currentPoint.clone(),new dt(t,n),new dt(i,s),new dt(a,r));return this.curves.push(o),this.currentPoint.set(a,r),this}splineThru(t){let n=[this.currentPoint.clone()].concat(t),i=new Nc(n);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,n,i,s,a,r){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,n+l,i,s,a,r),this}absarc(t,n,i,s,a,r){return this.absellipse(t,n,i,i,s,a,r),this}ellipse(t,n,i,s,a,r,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,n+h,i,s,a,r,o,l),this}absellipse(t,n,i,s,a,r,o,l){let c=new Vo(t,n,i,s,a,r,o,l);if(this.curves.length>0){let p=c.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Sa=class extends lr{constructor(t){super(t),this.uuid=$o(),this.type="Shape",this.holes=[]}getPointsHoles(t){let n=[];for(let i=0,s=this.holes.length;i<s;i++)n[i]=this.holes[i].getPoints(t);return n}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let n=0,i=t.holes.length;n<i;n++){let s=t.holes[n];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let n=0,i=this.holes.length;n<i;n++){let s=this.holes[n];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let n=0,i=t.holes.length;n<i;n++){let s=t.holes[n];this.holes.push(new lr().fromJSON(s))}return this}};function lw(e,t,n=2){let i=t&&t.length,s=i?t[0]*n:e.length,a=bb(e,0,s,n,!0),r=[];if(!a||a.next===a.prev)return r;let o,l,c;if(i&&(a=dw(e,t,a,n)),e.length>80*n){o=e[0],l=e[1];let h=o,p=l;for(let u=n;u<s;u+=n){let d=e[u],g=e[u+1];d<o&&(o=d),g<l&&(l=g),d>h&&(h=d),g>p&&(p=g)}c=Math.max(h-o,p-l),c=c!==0?32767/c:0}return Ic(a,r,n,o,l,c,0),r}function bb(e,t,n,i,s){let a;if(s===Ew(e,t,n,i)>0)for(let r=t;r<n;r+=i)a=wM(r/i|0,e[r],e[r+1],a);else for(let r=n-i;r>=t;r-=i)a=wM(r/i|0,e[r],e[r+1],a);return a&&ko(a,a.next)&&(Pc(a),a=a.next),a}function cr(e,t){if(!e)return e;t||(t=e);let n=e,i;do if(i=!1,!n.steiner&&(ko(n,n.next)||Ge(n.prev,n,n.next)===0)){if(Pc(n),n=t=n.prev,n===n.next)break;i=!0}else n=n.next;while(i||n!==t);return t}function Ic(e,t,n,i,s,a,r){if(!e)return;!r&&a&&vw(e,i,s,a);let o=e;for(;e.prev!==e.next;){let l=e.prev,c=e.next;if(a?uw(e,i,s,a):cw(e)){t.push(l.i,e.i,c.i),Pc(e),e=c.next,o=c.next;continue}if(e=c,e===o){r?r===1?(e=hw(cr(e),t),Ic(e,t,n,i,s,a,2)):r===2&&fw(e,t,n,i,s,a):Ic(cr(e),t,n,i,s,a,1);break}}}function cw(e){let t=e.prev,n=e,i=e.next;if(Ge(t,n,i)>=0)return!1;let s=t.x,a=n.x,r=i.x,o=t.y,l=n.y,c=i.y,h=Math.min(s,a,r),p=Math.min(o,l,c),u=Math.max(s,a,r),d=Math.max(o,l,c),g=i.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=p&&g.y<=d&&_c(s,o,a,l,r,c,g.x,g.y)&&Ge(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function uw(e,t,n,i){let s=e.prev,a=e,r=e.next;if(Ge(s,a,r)>=0)return!1;let o=s.x,l=a.x,c=r.x,h=s.y,p=a.y,u=r.y,d=Math.min(o,l,c),g=Math.min(h,p,u),b=Math.max(o,l,c),m=Math.max(h,p,u),f=u0(d,g,t,n,i),_=u0(b,m,t,n,i),S=e.prevZ,v=e.nextZ;for(;S&&S.z>=f&&v&&v.z<=_;){if(S.x>=d&&S.x<=b&&S.y>=g&&S.y<=m&&S!==s&&S!==r&&_c(o,h,l,p,c,u,S.x,S.y)&&Ge(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=d&&v.x<=b&&v.y>=g&&v.y<=m&&v!==s&&v!==r&&_c(o,h,l,p,c,u,v.x,v.y)&&Ge(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=f;){if(S.x>=d&&S.x<=b&&S.y>=g&&S.y<=m&&S!==s&&S!==r&&_c(o,h,l,p,c,u,S.x,S.y)&&Ge(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=_;){if(v.x>=d&&v.x<=b&&v.y>=g&&v.y<=m&&v!==s&&v!==r&&_c(o,h,l,p,c,u,v.x,v.y)&&Ge(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function hw(e,t){let n=e;do{let i=n.prev,s=n.next.next;!ko(i,s)&&Tb(i,n,n.next,s)&&Oc(i,s)&&Oc(s,i)&&(t.push(i.i,n.i,s.i),Pc(n),Pc(n.next),n=e=s),n=n.next}while(n!==e);return cr(n)}function fw(e,t,n,i,s,a){let r=e;do{let o=r.next.next;for(;o!==r.prev;){if(r.i!==o.i&&Sw(r,o)){let l=Ab(r,o);r=cr(r,r.next),l=cr(l,l.next),Ic(r,t,n,i,s,a,0),Ic(l,t,n,i,s,a,0);return}o=o.next}r=r.next}while(r!==e)}function dw(e,t,n,i){let s=[];for(let a=0,r=t.length;a<r;a++){let o=t[a]*i,l=a<r-1?t[a+1]*i:e.length,c=bb(e,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(xw(c))}s.sort(pw);for(let a=0;a<s.length;a++)n=mw(s[a],n);return n}function pw(e,t){let n=e.x-t.x;if(n===0&&(n=e.y-t.y,n===0)){let i=(e.next.y-e.y)/(e.next.x-e.x),s=(t.next.y-t.y)/(t.next.x-t.x);n=i-s}return n}function mw(e,t){let n=gw(e,t);if(!n)return t;let i=Ab(n,e);return cr(i,i.next),cr(n,n.next)}function gw(e,t){let n=t,i=e.x,s=e.y,a=-1/0,r;if(ko(e,n))return n;do{if(ko(e,n.next))return n.next;if(s<=n.y&&s>=n.next.y&&n.next.y!==n.y){let p=n.x+(s-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(p<=i&&p>a&&(a=p,r=n.x<n.next.x?n:n.next,p===i))return r}n=n.next}while(n!==t);if(!r)return null;let o=r,l=r.x,c=r.y,h=1/0;n=r;do{if(i>=n.x&&n.x>=l&&i!==n.x&&Eb(s<c?i:a,s,l,c,s<c?a:i,s,n.x,n.y)){let p=Math.abs(s-n.y)/(i-n.x);Oc(n,e)&&(p<h||p===h&&(n.x>r.x||n.x===r.x&&_w(r,n)))&&(r=n,h=p)}n=n.next}while(n!==o);return r}function _w(e,t){return Ge(e.prev,e,t.prev)<0&&Ge(t.next,e,e.next)<0}function vw(e,t,n,i){let s=e;do s.z===0&&(s.z=u0(s.x,s.y,t,n,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==e);s.prevZ.nextZ=null,s.prevZ=null,yw(s)}function yw(e){let t,n=1;do{let i=e,s;e=null;let a=null;for(t=0;i;){t++;let r=i,o=0;for(let c=0;c<n&&(o++,r=r.nextZ,!!r);c++);let l=n;for(;o>0||l>0&&r;)o!==0&&(l===0||!r||i.z<=r.z)?(s=i,i=i.nextZ,o--):(s=r,r=r.nextZ,l--),a?a.nextZ=s:e=s,s.prevZ=a,a=s;i=r}a.nextZ=null,n*=2}while(t>1);return e}function u0(e,t,n,i,s){return e=(e-n)*s|0,t=(t-i)*s|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function xw(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Eb(e,t,n,i,s,a,r,o){return(s-r)*(t-o)>=(e-r)*(a-o)&&(e-r)*(i-o)>=(n-r)*(t-o)&&(n-r)*(a-o)>=(s-r)*(i-o)}function _c(e,t,n,i,s,a,r,o){return!(e===r&&t===o)&&Eb(e,t,n,i,s,a,r,o)}function Sw(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Mw(e,t)&&(Oc(e,t)&&Oc(t,e)&&bw(e,t)&&(Ge(e.prev,e,t.prev)||Ge(e,t.prev,t))||ko(e,t)&&Ge(e.prev,e,e.next)>0&&Ge(t.prev,t,t.next)>0)}function Ge(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function ko(e,t){return e.x===t.x&&e.y===t.y}function Tb(e,t,n,i){let s=ef(Ge(e,t,n)),a=ef(Ge(e,t,i)),r=ef(Ge(n,i,e)),o=ef(Ge(n,i,t));return!!(s!==a&&r!==o||s===0&&tf(e,n,t)||a===0&&tf(e,i,t)||r===0&&tf(n,e,i)||o===0&&tf(n,t,i))}function tf(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function ef(e){return e>0?1:e<0?-1:0}function Mw(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Tb(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Oc(e,t){return Ge(e.prev,e,e.next)<0?Ge(e,t,e.next)>=0&&Ge(e,e.prev,t)>=0:Ge(e,t,e.prev)<0||Ge(e,e.next,t)<0}function bw(e,t){let n=e,i=!1,s=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&s<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(i=!i),n=n.next;while(n!==e);return i}function Ab(e,t){let n=h0(e.i,e.x,e.y),i=h0(t.i,t.x,t.y),s=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=s,s.prev=n,i.next=n,n.prev=i,a.next=i,i.prev=a,i}function wM(e,t,n,i){let s=h0(e,t,n);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Pc(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function h0(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ew(e,t,n,i){let s=0;for(let a=t,r=n-i;a<n;a+=i)s+=(e[r]-e[a])*(e[a+1]+e[r+1]),r=a;return s}var f0=class{static triangulate(t,n,i=2){return lw(t,n,i)}},ji=class e{static area(t){let n=t.length,i=0;for(let s=n-1,a=0;a<n;s=a++)i+=t[s].x*t[a].y-t[a].x*t[s].y;return i*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(t,n){let i=[],s=[],a=[];RM(t),CM(i,t);let r=t.length;n.forEach(RM);for(let l=0;l<n.length;l++)s.push(r),r+=n[l].length,CM(i,n[l]);let o=f0.triangulate(i,s);for(let l=0;l<o.length;l+=3)a.push(o.slice(l,l+3));return a}};function RM(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function CM(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Wo=class e extends On{constructor(t=new Sa([new dt(.5,.5),new dt(-.5,.5),new dt(-.5,-.5),new dt(.5,-.5)]),n={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:n},t=Array.isArray(t)?t:[t];let i=this,s=[],a=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];r(c)}this.setAttribute("position",new nn(s,3)),this.setAttribute("uv",new nn(a,2)),this.computeVertexNormals();function r(o){let l=[],c=n.curveSegments!==void 0?n.curveSegments:12,h=n.steps!==void 0?n.steps:1,p=n.depth!==void 0?n.depth:1,u=n.bevelEnabled!==void 0?n.bevelEnabled:!0,d=n.bevelThickness!==void 0?n.bevelThickness:.2,g=n.bevelSize!==void 0?n.bevelSize:d-.1,b=n.bevelOffset!==void 0?n.bevelOffset:0,m=n.bevelSegments!==void 0?n.bevelSegments:3,f=n.extrudePath,_=n.UVGenerator!==void 0?n.UVGenerator:Tw,S,v=!1,E,T,w,x;if(f){S=f.getSpacedPoints(h),v=!0,u=!1;let et=f.isCatmullRomCurve3?f.closed:!1;E=f.computeFrenetFrames(h,et),T=new N,w=new N,x=new N}u||(m=0,d=0,g=0,b=0);let A=o.extractPoints(c),C=A.shape,D=A.holes;if(!ji.isClockWise(C)){C=C.reverse();for(let et=0,at=D.length;et<at;et++){let ot=D[et];ji.isClockWise(ot)&&(D[et]=ot.reverse())}}function k(et){let ot=10000000000000001e-36,lt=et[0];for(let ft=1;ft<=et.length;ft++){let zt=ft%et.length,Ot=et[zt],Vt=Ot.x-lt.x,Wt=Ot.y-lt.y,L=Vt*Vt+Wt*Wt,me=Math.max(Math.abs(Ot.x),Math.abs(Ot.y),Math.abs(lt.x),Math.abs(lt.y)),St=ot*me*me;if(L<=St){et.splice(zt,1),ft--;continue}lt=Ot}}k(C),D.forEach(k);let O=D.length,B=C;for(let et=0;et<O;et++){let at=D[et];C=C.concat(at)}function J(et,at,ot){return at||Gt("ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(at,ot)}let q=C.length;function st(et,at,ot){let lt,ft,zt,Ot=et.x-at.x,Vt=et.y-at.y,Wt=ot.x-et.x,L=ot.y-et.y,me=Ot*Ot+Vt*Vt,St=Ot*L-Vt*Wt;if(Math.abs(St)>Number.EPSILON){let R=Math.sqrt(me),y=Math.sqrt(Wt*Wt+L*L),P=at.x-Vt/R,V=at.y+Ot/R,X=ot.x-L/y,rt=ot.y+Wt/y,ut=((X-P)*L-(rt-V)*Wt)/(Ot*L-Vt*Wt);lt=P+Ot*ut-et.x,ft=V+Vt*ut-et.y;let Y=lt*lt+ft*ft;if(Y<=2)return new dt(lt,ft);zt=Math.sqrt(Y/2)}else{let R=!1;Ot>Number.EPSILON?Wt>Number.EPSILON&&(R=!0):Ot<-Number.EPSILON?Wt<-Number.EPSILON&&(R=!0):Math.sign(Vt)===Math.sign(L)&&(R=!0),R?(lt=-Vt,ft=Ot,zt=Math.sqrt(me)):(lt=Ot,ft=Vt,zt=Math.sqrt(me/2))}return new dt(lt/zt,ft/zt)}let W=[];for(let et=0,at=B.length,ot=at-1,lt=et+1;et<at;et++,ot++,lt++)ot===at&&(ot=0),lt===at&&(lt=0),W[et]=st(B[et],B[ot],B[lt]);let Q=[],tt,Ut=W.concat();for(let et=0,at=O;et<at;et++){let ot=D[et];tt=[];for(let lt=0,ft=ot.length,zt=ft-1,Ot=lt+1;lt<ft;lt++,zt++,Ot++)zt===ft&&(zt=0),Ot===ft&&(Ot=0),tt[lt]=st(ot[lt],ot[zt],ot[Ot]);Q.push(tt),Ut=Ut.concat(tt)}let wt;if(m===0)wt=ji.triangulateShape(B,D);else{let et=[],at=[];for(let ot=0;ot<m;ot++){let lt=ot/m,ft=d*Math.cos(lt*Math.PI/2),zt=g*Math.sin(lt*Math.PI/2)+b;for(let Ot=0,Vt=B.length;Ot<Vt;Ot++){let Wt=J(B[Ot],W[Ot],zt);xt(Wt.x,Wt.y,-ft),lt===0&&et.push(Wt)}for(let Ot=0,Vt=O;Ot<Vt;Ot++){let Wt=D[Ot];tt=Q[Ot];let L=[];for(let me=0,St=Wt.length;me<St;me++){let R=J(Wt[me],tt[me],zt);xt(R.x,R.y,-ft),lt===0&&L.push(R)}lt===0&&at.push(L)}}wt=ji.triangulateShape(et,at)}let ce=wt.length,Jt=g+b;for(let et=0;et<q;et++){let at=u?J(C[et],Ut[et],Jt):C[et];v?(w.copy(E.normals[0]).multiplyScalar(at.x),T.copy(E.binormals[0]).multiplyScalar(at.y),x.copy(S[0]).add(w).add(T),xt(x.x,x.y,x.z)):xt(at.x,at.y,0)}for(let et=1;et<=h;et++)for(let at=0;at<q;at++){let ot=u?J(C[at],Ut[at],Jt):C[at];v?(w.copy(E.normals[et]).multiplyScalar(ot.x),T.copy(E.binormals[et]).multiplyScalar(ot.y),x.copy(S[et]).add(w).add(T),xt(x.x,x.y,x.z)):xt(ot.x,ot.y,p/h*et)}for(let et=m-1;et>=0;et--){let at=et/m,ot=d*Math.cos(at*Math.PI/2),lt=g*Math.sin(at*Math.PI/2)+b;for(let ft=0,zt=B.length;ft<zt;ft++){let Ot=J(B[ft],W[ft],lt);xt(Ot.x,Ot.y,p+ot)}for(let ft=0,zt=D.length;ft<zt;ft++){let Ot=D[ft];tt=Q[ft];for(let Vt=0,Wt=Ot.length;Vt<Wt;Vt++){let L=J(Ot[Vt],tt[Vt],lt);v?xt(L.x,L.y+S[h-1].y,S[h-1].x+ot):xt(L.x,L.y,p+ot)}}}ae(),Z();function ae(){let et=s.length/3;if(u){let at=0,ot=q*at;for(let lt=0;lt<ce;lt++){let ft=wt[lt];Ft(ft[2]+ot,ft[1]+ot,ft[0]+ot)}at=h+m*2,ot=q*at;for(let lt=0;lt<ce;lt++){let ft=wt[lt];Ft(ft[0]+ot,ft[1]+ot,ft[2]+ot)}}else{for(let at=0;at<ce;at++){let ot=wt[at];Ft(ot[2],ot[1],ot[0])}for(let at=0;at<ce;at++){let ot=wt[at];Ft(ot[0]+q*h,ot[1]+q*h,ot[2]+q*h)}}i.addGroup(et,s.length/3-et,0)}function Z(){let et=s.length/3,at=0;j(B,at),at+=B.length;for(let ot=0,lt=D.length;ot<lt;ot++){let ft=D[ot];j(ft,at),at+=ft.length}i.addGroup(et,s.length/3-et,1)}function j(et,at){let ot=et.length;for(;--ot>=0;){let lt=ot,ft=ot-1;ft<0&&(ft=et.length-1);for(let zt=0,Ot=h+m*2;zt<Ot;zt++){let Vt=q*zt,Wt=q*(zt+1),L=at+lt+Vt,me=at+ft+Vt,St=at+ft+Wt,R=at+lt+Wt;Tt(L,me,St,R)}}}function xt(et,at,ot){l.push(et),l.push(at),l.push(ot)}function Ft(et,at,ot){Bt(et),Bt(at),Bt(ot);let lt=s.length/3,ft=_.generateTopUV(i,s,lt-3,lt-2,lt-1);ue(ft[0]),ue(ft[1]),ue(ft[2])}function Tt(et,at,ot,lt){Bt(et),Bt(at),Bt(lt),Bt(at),Bt(ot),Bt(lt);let ft=s.length/3,zt=_.generateSideWallUV(i,s,ft-6,ft-3,ft-2,ft-1);ue(zt[0]),ue(zt[1]),ue(zt[3]),ue(zt[1]),ue(zt[2]),ue(zt[3])}function Bt(et){s.push(l[et*3+0]),s.push(l[et*3+1]),s.push(l[et*3+2])}function ue(et){a.push(et.x),a.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),n=this.parameters.shapes,i=this.parameters.options;return Aw(n,i,t)}static fromJSON(t,n){let i=[];for(let a=0,r=t.shapes.length;a<r;a++){let o=n[t.shapes[a]];i.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new c0[s.type]().fromJSON(s)),new e(i,t.options)}},Tw={generateTopUV:function(e,t,n,i,s){let a=t[n*3],r=t[n*3+1],o=t[i*3],l=t[i*3+1],c=t[s*3],h=t[s*3+1];return[new dt(a,r),new dt(o,l),new dt(c,h)]},generateSideWallUV:function(e,t,n,i,s,a){let r=t[n*3],o=t[n*3+1],l=t[n*3+2],c=t[i*3],h=t[i*3+1],p=t[i*3+2],u=t[s*3],d=t[s*3+1],g=t[s*3+2],b=t[a*3],m=t[a*3+1],f=t[a*3+2];return Math.abs(o-h)<Math.abs(r-c)?[new dt(r,1-l),new dt(c,1-p),new dt(u,1-g),new dt(b,1-f)]:[new dt(o,1-l),new dt(h,1-p),new dt(d,1-g),new dt(m,1-f)]}};function Aw(e,t,n){if(n.shapes=[],Array.isArray(e))for(let i=0,s=e.length;i<s;i++){let a=e[i];n.shapes.push(a.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var ur=class e extends On{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,p=t/o,u=n/l,d=[],g=[],b=[],m=[];for(let f=0;f<h;f++){let _=f*u-r;for(let S=0;S<c;S++){let v=S*p-a;g.push(v,-_,0),b.push(0,0,1),m.push(S/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let _=0;_<o;_++){let S=_+c*f,v=_+c*(f+1),E=_+1+c*(f+1),T=_+1+c*f;d.push(S,v,T),d.push(v,E,T)}this.setIndex(d),this.setAttribute("position",new nn(g,3)),this.setAttribute("normal",new nn(b,3)),this.setAttribute("uv",new nn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var Bc=class e extends On{constructor(t=new Sa([new dt(0,.5),new dt(-.5,-.5),new dt(.5,-.5)]),n=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:n};let i=[],s=[],a=[],r=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new nn(s,3)),this.setAttribute("normal",new nn(a,3)),this.setAttribute("uv",new nn(r,2));function c(h){let p=s.length/3,u=h.extractPoints(n),d=u.shape,g=u.holes;ji.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,f=g.length;m<f;m++){let _=g[m];ji.isClockWise(_)===!0&&(g[m]=_.reverse())}let b=ji.triangulateShape(d,g);for(let m=0,f=g.length;m<f;m++){let _=g[m];d=d.concat(_)}for(let m=0,f=d.length;m<f;m++){let _=d[m];s.push(_.x,_.y,0),a.push(0,0,1),r.push(_.x,_.y)}for(let m=0,f=b.length;m<f;m++){let _=b[m],S=_[0]+p,v=_[1]+p,E=_[2]+p;i.push(S,v,E),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),n=this.parameters.shapes;return ww(n,t)}static fromJSON(t,n){let i=[];for(let s=0,a=t.shapes.length;s<a;s++){let r=n[t.shapes[s]];i.push(r)}return new e(i,t.curveSegments)}};function ww(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,i=e.length;n<i;n++){let s=e[n];t.shapes.push(s.uuid)}else t.shapes.push(e.uuid);return t}var Xo=class e extends On{constructor(t=1,n=.4,i=12,s=48,a=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:n,radialSegments:i,tubularSegments:s,arc:a,thetaStart:r,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],h=[],p=[],u=new N,d=new N,g=new N;for(let b=0;b<=i;b++){let m=r+b/i*o;for(let f=0;f<=s;f++){let _=f/s*a;d.x=(t+n*Math.cos(m))*Math.cos(_),d.y=(t+n*Math.cos(m))*Math.sin(_),d.z=n*Math.sin(m),c.push(d.x,d.y,d.z),u.x=t*Math.cos(_),u.y=t*Math.sin(_),g.subVectors(d,u).normalize(),h.push(g.x,g.y,g.z),p.push(f/s),p.push(b/i)}}for(let b=1;b<=i;b++)for(let m=1;m<=s;m++){let f=(s+1)*b+m-1,_=(s+1)*(b-1)+m-1,S=(s+1)*(b-1)+m,v=(s+1)*b+m;l.push(f,_,v),l.push(_,S,v)}this.setIndex(l),this.setAttribute("position",new nn(c,3)),this.setAttribute("normal",new nn(h,3)),this.setAttribute("uv",new nn(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function dr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(DM(s))s.isRenderTargetTexture?(kt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(DM(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function Rn(e){let t={};for(let n=0;n<e.length;n++){let i=dr(e[n]);for(let s in i)t[s]=i[s]}return t}function DM(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Rw(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function V0(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:fe.workingColorSpace}var wb={clone:dr,merge:Rn},Cw=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dw=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,li=class extends ya{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Cw,this.fragmentShader=Dw,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=dr(t.uniforms),this.uniformsGroups=Rw(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new jt().setHex(s.value);break;case"v2":this.uniforms[i].value=new dt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new N().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Ve().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Zt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Le().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Af=class extends li{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},qo=class extends ya{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new jt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rd,this.normalScale=new dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ns,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ma=class extends qo{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new dt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return se(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(n){this.ior=(1+.4*n)/(1-.4*n)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new jt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new jt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new jt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var wf=class extends ya{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=lb,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Rf=class extends ya{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Ao(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function i0(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var ba=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Cf=class extends ba{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:r0,endingEnd:r0}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case o0:a=t,o=2*n-i;break;case l0:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case o0:r=t,l=2*i-n;break;case l0:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,h=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*h,this._offsetNext=r*h}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(i-n)/(s-n),b=g*g,m=b*g,f=-u*m+2*u*b-u*g,_=(1+u)*m+(-1.5-2*u)*b+(-.5+u)*g+1,S=(-1-d)*m+(1.5+d)*b+.5*g,v=d*m-d*b;for(let E=0;E!==o;++E)a[E]=f*r[h+E]+_*r[c+E]+S*r[l+E]+v*r[p+E];return a}},Df=class extends ba{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-n)/(s-n),p=1-h;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*h;return a}},Lf=class extends ba{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Uf=class extends ba{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,p=this.outTangents;if(!h||!p){let g=(i-n)/(s-n),b=1-g;for(let m=0;m!==o;++m)a[m]=r[c+m]*b+r[l+m]*g;return a}let u=o*2,d=t-1;for(let g=0;g!==o;++g){let b=r[c+g],m=r[l+g],f=d*u+g*2,_=p[f],S=p[f+1],v=t*u+g*2,E=h[v],T=h[v+1],w=Uw(i,n,_,E,s);a[g]=Rb(w,b,S,T,m)}return a}};function Rb(e,t,n,i,s){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*i+e*e*e*s}function Lw(e,t,n,i,s){let a=1-e;return 3*a*a*(n-t)+6*a*e*(i-n)+3*e*e*(s-i)}function Uw(e,t,n,i,s){let a=(e-t)/(s-t);for(let r=0;r<8;r++){let o=Rb(a,t,n,i,s)-e;if(Math.abs(o)<1e-10)break;let l=Lw(a,t,n,i,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var ci=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ao(n,this.TimeBufferType),this.values=Ao(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:Ao(t.times,Array),values:Ao(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),i0(t.settings)&&(i.settings={inTangents:Ao(t.settings.inTangents,Array),outTangents:Ao(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Lf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Df(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Cf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new Uf(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case xc:n=this.InterpolantFactoryMethodDiscrete;break;case mf:n=this.InterpolantFactoryMethodLinear;break;case af:n=this.InterpolantFactoryMethodSmooth;break;case a0:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return kt("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xc;case this.InterpolantFactoryMethodLinear:return mf;case this.InterpolantFactoryMethodSmooth:return af;case this.InterpolantFactoryMethodBezier:return a0}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t;i0(this.settings)&&(LM(this.settings.inTangents,t),LM(this.settings.outTangents,t))}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(Gt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Gt("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Gt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Gt("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&OA(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Gt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===af,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let p=o*i,u=p-i,d=p+i;for(let g=0;g!==i;++g){let b=n[p+g];if(b!==n[u+g]||b!==n[d+g]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let p=o*i,u=r*i;for(let d=0;d!==i;++d)n[u+d]=n[p+d]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,i0(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function LM(e,t){for(let n=0,i=e.length;n!==i;n+=2)e[n]*=t}ci.prototype.ValueTypeName="";ci.prototype.TimeBufferType=Float32Array;ci.prototype.ValueBufferType=Float32Array;ci.prototype.DefaultInterpolation=mf;var Ea=class extends ci{constructor(t,n,i){super(t,n,i)}};Ea.prototype.ValueTypeName="bool";Ea.prototype.ValueBufferType=Array;Ea.prototype.DefaultInterpolation=xc;Ea.prototype.InterpolantFactoryMethodLinear=void 0;Ea.prototype.InterpolantFactoryMethodSmooth=void 0;var Nf=class extends ci{constructor(t,n,i,s){super(t,n,i,s)}};Nf.prototype.ValueTypeName="color";var If=class extends ci{constructor(t,n,i,s){super(t,n,i,s)}};If.prototype.ValueTypeName="number";var Of=class extends ba{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let h=c+o;c!==h;c+=4)Un.slerpFlat(a,0,r,c-o,r,c,l);return a}},zc=class extends ci{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new Of(this.times,this.values,this.getValueSize(),t)}};zc.prototype.ValueTypeName="quaternion";zc.prototype.InterpolantFactoryMethodSmooth=void 0;var Ta=class extends ci{constructor(t,n,i){super(t,n,i)}};Ta.prototype.ValueTypeName="string";Ta.prototype.ValueBufferType=Array;Ta.prototype.DefaultInterpolation=xc;Ta.prototype.InterpolantFactoryMethodLinear=void 0;Ta.prototype.InterpolantFactoryMethodSmooth=void 0;var Pf=class extends ci{constructor(t,n,i,s){super(t,n,i,s)}};Pf.prototype.ValueTypeName="vector";var Bf=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,a===!1&&s.onStart!==void 0&&s.onStart(h,r,o),a=!0},this.itemEnd=function(h){r++,s.onProgress!==void 0&&s.onProgress(h,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,p){return c.push(h,p),this},this.removeHandler=function(h){let p=c.indexOf(h);return p!==-1&&c.splice(p,2),this},this.getHandler=function(h){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],g=c[p+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Cb=new Bf,zf=class{constructor(t){this.manager=t!==void 0?t:Cb,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};zf.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ff=class extends In{constructor(t,n=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=n}copy(t,n){return super.copy(t,n),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let n=super.toJSON(t);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}};var s0=new Le,UM=new N,NM=new N,Hf=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new dt(512,512),this.mapType=Zn,this.map=null,this.mapPass=null,this.matrix=new Le,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fo,this._frameExtents=new dt(1,1),this._viewportCount=1,this._viewports=[new Ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let n=this.camera;UM.setFromMatrixPosition(t.matrixWorld),n.position.copy(UM),NM.setFromMatrixPosition(t.target.matrixWorld),n.lookAt(NM),n.updateMatrixWorld(),this._updateMatrix(n,this.matrix,this._frustum)}_updateMatrix(t,n,i,s){s0.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(s0,t.coordinateSystem,t.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;t.coordinateSystem===Lo||t.reversedDepth?n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),n.multiply(s0)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},nf=new N,sf=new Un,Ki=new N,Fc=class extends In{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Le,this.projectionMatrix=new Le,this.projectionMatrixInverse=new Le,this.coordinateSystem=Pi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(nf,sf,Ki),Ki.x===1&&Ki.y===1&&Ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(nf,sf,Ki.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(nf,sf,Ki),Ki.x===1&&Ki.y===1&&Ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(nf,sf,Ki.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ga=new N,IM=new dt,OM=new dt,An=class extends Fc{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=gf*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ng*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return gf*2*Math.atan(Math.tan(Ng*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){ga.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ga.x,ga.y).multiplyScalar(-t/ga.z),ga.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ga.x,ga.y).multiplyScalar(-t/ga.z)}getViewSize(t,n){return this.getViewBounds(t,IM,OM),n.subVectors(OM,IM)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(Ng*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var Yo=class extends Fc{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},d0=class extends Hf{constructor(){super(new Yo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zo=class extends Ff{constructor(t,n){super(t,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(In.DEFAULT_UP),this.updateMatrix(),this.target=new In,this.shadow=new d0}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}};var wo=-90,Ro=1,Vf=class extends In{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new An(wo,Ro,t,n);s.layers=this.layers,this.add(s);let a=new An(wo,Ro,t,n);a.layers=this.layers,this.add(a);let r=new An(wo,Ro,t,n);r.layers=this.layers,this.add(r);let o=new An(wo,Ro,t,n);o.layers=this.layers,this.add(o);let l=new An(wo,Ro,t,n);l.layers=this.layers,this.add(l);let c=new An(wo,Ro,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Pi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Lo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,h]=this.children,p=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let b=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=b,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,h),t.setRenderTarget(p,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Gf=class extends An{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var G0="\\[\\]\\.:\\/",Nw=new RegExp("["+G0+"]","g"),k0="[^"+G0+"]",Iw="[^"+G0.replace("\\.","")+"]",Ow=/((?:WC+[\/:])*)/.source.replace("WC",k0),Pw=/(WCOD+)?/.source.replace("WCOD",Iw),Bw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",k0),zw=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",k0),Fw=new RegExp("^"+Ow+Pw+Bw+zw+"$"),Hw=["material","materials","bones","map"],p0=class{constructor(t,n,i){let s=i||ze.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},ze=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Nw,"")}static parseTrackName(t){let n=Fw.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);Hw.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){kt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){Gt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Gt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Gt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Gt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Gt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Gt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Gt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;Gt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Gt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Gt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ze.Composite=p0;ze.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ze.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ze.prototype.GetterByBindingType=[ze.prototype._getValue_direct,ze.prototype._getValue_array,ze.prototype._getValue_arrayElement,ze.prototype._getValue_toArray];ze.prototype.SetterByBindingTypeAndVersioning=[[ze.prototype._setValue_direct,ze.prototype._setValue_direct_setNeedsUpdate,ze.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_array,ze.prototype._setValue_array_setNeedsUpdate,ze.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_arrayElement,ze.prototype._setValue_arrayElement_setNeedsUpdate,ze.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_fromArray,ze.prototype._setValue_fromArray_setNeedsUpdate,ze.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var yL=new Float32Array(1);var PM=new Le,Hc=class{constructor(t,n,i=0,s=1/0){this.ray=new wc(t,n),this.near=i,this.far=s,this.camera=null,this.layers=new Io,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,n){this.ray.set(t,n)}setFromCamera(t,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,n.projectionMatrix.elements[14]).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):Gt("Raycaster: Unsupported camera type: "+n.type)}setFromXRController(t){return PM.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(PM),this}intersectObject(t,n=!0,i=[]){return m0(t,this,i,n),i.sort(BM),i}intersectObjects(t,n=!0,i=[]){for(let s=0,a=t.length;s<a;s++)m0(t[s],this,i,n);return i.sort(BM),i}};function BM(e,t){return e.distance-t.distance}function m0(e,t,n,i){let s=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(s=!1),s===!0&&i===!0){let a=e.children;for(let r=0,o=a.length;r<o;r++)m0(a[r],t,n,!0)}}var g0=class e{static{e.prototype.isMatrix2=!0}constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};function W0(e,t,n,i){let s=Vw(i);switch(n){case O0:return e*t;case B0:return e*t/s.components*s.byteLength;case Jf:return e*t/s.components*s.byteLength;case Ca:return e*t*2/s.components*s.byteLength;case Kf:return e*t*2/s.components*s.byteLength;case P0:return e*t*3/s.components*s.byteLength;case wi:return e*t*4/s.components*s.byteLength;case Qf:return e*t*4/s.components*s.byteLength;case Xc:case qc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Yc:case Zc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case $f:case ed:return Math.max(e,16)*Math.max(t,8)/4;case jf:case td:return Math.max(e,8)*Math.max(t,8)/2;case nd:case id:case ad:case rd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case sd:case Jc:case od:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ld:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case cd:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ud:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case hd:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case fd:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case dd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case pd:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case md:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case gd:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case _d:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case vd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case yd:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case xd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Sd:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Md:case bd:case Ed:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Td:case Ad:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Kc:case wd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function Vw(e){switch(e){case Zn:case L0:return{byteLength:1,components:1};case Qo:case U0:case Hi:return{byteLength:2,components:1};case Yf:case Zf:return{byteLength:2,components:4};case zi:case qf:case Fi:return{byteLength:4,components:1};case N0:case I0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?kt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Qb(){let e=null,t=!1,n=null,i=null;function s(a,r){i=e.requestAnimationFrame(s),n(a,r)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function kw(e){let t=new WeakMap;function n(o,l){let c=o.array,h=o.usage,p=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=e.HALF_FLOAT:d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){let h=l.array,p=l.updateRanges;if(e.bindBuffer(c,o),p.length===0)e.bufferSubData(c,0,h);else{p.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<p.length;d++){let g=p[u],b=p[d];b.start<=g.start+g.count+1?g.count=Math.max(g.count,b.start+b.count-g.start):(++u,p[u]=b)}p.length=u+1;for(let d=0,g=p.length;d<g;d++){let b=p[d];e.bufferSubData(c,b.start*h.BYTES_PER_ELEMENT,h,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var Ww=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xw=`#ifdef USE_ALPHAHASH
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
#endif`,qw=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zw=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Kw=`#ifdef USE_AOMAP
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
#endif`,Qw=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,jw=`#ifdef USE_BATCHING
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
#endif`,$w=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tR=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,eR=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,nR=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,iR=`#ifdef USE_IRIDESCENCE
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
#endif`,sR=`#ifdef USE_BUMPMAP
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
#endif`,aR=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,rR=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,oR=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,lR=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,cR=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,uR=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,hR=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,fR=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,dR=`#define PI 3.141592653589793
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
} // validated`,pR=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,mR=`vec3 transformedNormal = objectNormal;
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
#endif`,gR=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,_R=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,vR=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,yR=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xR="gl_FragColor = linearToOutputTexel( gl_FragColor );",SR=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,MR=`#ifdef USE_ENVMAP
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
#endif`,bR=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ER=`#ifdef USE_ENVMAP
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
#endif`,TR=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,AR=`#ifdef USE_ENVMAP
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
#endif`,wR=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,RR=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,CR=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,DR=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,LR=`#ifdef USE_GRADIENTMAP
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
}`,UR=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,NR=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,IR=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,OR=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,PR=`#ifdef USE_ENVMAP
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
#endif`,BR=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,zR=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,FR=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,HR=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,VR=`PhysicalMaterial material;
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
#endif`,GR=`uniform sampler2D dfgLUT;
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
}`,kR=`
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
#endif`,WR=`#if defined( RE_IndirectDiffuse )
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
#endif`,XR=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qR=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,YR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ZR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,JR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,KR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,QR=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jR=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,$R=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,tC=`#if defined( USE_POINTS_UV )
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
#endif`,eC=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,nC=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,iC=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,sC=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,aC=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rC=`#ifdef USE_MORPHTARGETS
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
#endif`,oC=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lC=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,cC=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,uC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fC=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,dC=`#ifdef USE_NORMALMAP
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
#endif`,pC=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,mC=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gC=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_C=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vC=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,yC=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,xC=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,SC=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,MC=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,bC=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,EC=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,TC=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,AC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,wC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,RC=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,CC=`float getShadowMask() {
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
}`,DC=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,LC=`#ifdef USE_SKINNING
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
#endif`,UC=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,NC=`#ifdef USE_SKINNING
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
#endif`,IC=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,OC=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,PC=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,BC=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,zC=`#ifdef USE_TRANSMISSION
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
#endif`,FC=`#ifdef USE_TRANSMISSION
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
#endif`,HC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,VC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,GC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,kC=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,WC=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,XC=`uniform sampler2D t2D;
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
}`,qC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,YC=`#ifdef ENVMAP_TYPE_CUBE
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
}`,ZC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,JC=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,KC=`#include <common>
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
}`,QC=`#if DEPTH_PACKING == 3200
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
}`,jC=`#define DISTANCE
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
}`,$C=`#define DISTANCE
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
}`,t3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,e3=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,n3=`uniform float scale;
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
}`,i3=`uniform vec3 diffuse;
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
}`,s3=`#include <common>
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
}`,a3=`uniform vec3 diffuse;
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
}`,r3=`#define LAMBERT
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
}`,o3=`#define LAMBERT
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
}`,l3=`#define MATCAP
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
}`,c3=`#define MATCAP
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
}`,u3=`#define NORMAL
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
}`,h3=`#define NORMAL
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
}`,f3=`#define PHONG
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
}`,d3=`#define PHONG
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
}`,p3=`#define STANDARD
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
}`,m3=`#define STANDARD
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
}`,g3=`#define TOON
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
}`,_3=`#define TOON
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
}`,v3=`uniform float size;
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
}`,y3=`uniform vec3 diffuse;
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
}`,x3=`#include <common>
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
}`,S3=`uniform vec3 color;
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
}`,M3=`uniform float rotation;
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
}`,b3=`uniform vec3 diffuse;
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
}`,ne={alphahash_fragment:Ww,alphahash_pars_fragment:Xw,alphamap_fragment:qw,alphamap_pars_fragment:Yw,alphatest_fragment:Zw,alphatest_pars_fragment:Jw,aomap_fragment:Kw,aomap_pars_fragment:Qw,batching_pars_vertex:jw,batching_vertex:$w,begin_vertex:tR,beginnormal_vertex:eR,bsdfs:nR,iridescence_fragment:iR,bumpmap_pars_fragment:sR,clipping_planes_fragment:aR,clipping_planes_pars_fragment:rR,clipping_planes_pars_vertex:oR,clipping_planes_vertex:lR,color_fragment:cR,color_pars_fragment:uR,color_pars_vertex:hR,color_vertex:fR,common:dR,cube_uv_reflection_fragment:pR,defaultnormal_vertex:mR,displacementmap_pars_vertex:gR,displacementmap_vertex:_R,emissivemap_fragment:vR,emissivemap_pars_fragment:yR,colorspace_fragment:xR,colorspace_pars_fragment:SR,envmap_fragment:MR,envmap_common_pars_fragment:bR,envmap_pars_fragment:ER,envmap_pars_vertex:TR,envmap_physical_pars_fragment:PR,envmap_vertex:AR,fog_vertex:wR,fog_pars_vertex:RR,fog_fragment:CR,fog_pars_fragment:DR,gradientmap_pars_fragment:LR,lightmap_pars_fragment:UR,lights_lambert_fragment:NR,lights_lambert_pars_fragment:IR,lights_pars_begin:OR,lights_toon_fragment:BR,lights_toon_pars_fragment:zR,lights_phong_fragment:FR,lights_phong_pars_fragment:HR,lights_physical_fragment:VR,lights_physical_pars_fragment:GR,lights_fragment_begin:kR,lights_fragment_maps:WR,lights_fragment_end:XR,lightprobes_pars_fragment:qR,logdepthbuf_fragment:YR,logdepthbuf_pars_fragment:ZR,logdepthbuf_pars_vertex:JR,logdepthbuf_vertex:KR,map_fragment:QR,map_pars_fragment:jR,map_particle_fragment:$R,map_particle_pars_fragment:tC,metalnessmap_fragment:eC,metalnessmap_pars_fragment:nC,morphinstance_vertex:iC,morphcolor_vertex:sC,morphnormal_vertex:aC,morphtarget_pars_vertex:rC,morphtarget_vertex:oC,normal_fragment_begin:lC,normal_fragment_maps:cC,normal_pars_fragment:uC,normal_pars_vertex:hC,normal_vertex:fC,normalmap_pars_fragment:dC,clearcoat_normal_fragment_begin:pC,clearcoat_normal_fragment_maps:mC,clearcoat_pars_fragment:gC,iridescence_pars_fragment:_C,opaque_fragment:vC,packing:yC,premultiplied_alpha_fragment:xC,project_vertex:SC,dithering_fragment:MC,dithering_pars_fragment:bC,roughnessmap_fragment:EC,roughnessmap_pars_fragment:TC,shadowmap_pars_fragment:AC,shadowmap_pars_vertex:wC,shadowmap_vertex:RC,shadowmask_pars_fragment:CC,skinbase_vertex:DC,skinning_pars_vertex:LC,skinning_vertex:UC,skinnormal_vertex:NC,specularmap_fragment:IC,specularmap_pars_fragment:OC,tonemapping_fragment:PC,tonemapping_pars_fragment:BC,transmission_fragment:zC,transmission_pars_fragment:FC,uv_pars_fragment:HC,uv_pars_vertex:VC,uv_vertex:GC,worldpos_vertex:kC,background_vert:WC,background_frag:XC,backgroundCube_vert:qC,backgroundCube_frag:YC,cube_vert:ZC,cube_frag:JC,depth_vert:KC,depth_frag:QC,distance_vert:jC,distance_frag:$C,equirect_vert:t3,equirect_frag:e3,linedashed_vert:n3,linedashed_frag:i3,meshbasic_vert:s3,meshbasic_frag:a3,meshlambert_vert:r3,meshlambert_frag:o3,meshmatcap_vert:l3,meshmatcap_frag:c3,meshnormal_vert:u3,meshnormal_frag:h3,meshphong_vert:f3,meshphong_frag:d3,meshphysical_vert:p3,meshphysical_frag:m3,meshtoon_vert:g3,meshtoon_frag:_3,points_vert:v3,points_frag:y3,shadow_vert:x3,shadow_frag:S3,sprite_vert:M3,sprite_frag:b3},bt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},as={basic:{uniforms:Rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.fog]),vertexShader:ne.meshbasic_vert,fragmentShader:ne.meshbasic_frag},lambert:{uniforms:Rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:ne.meshlambert_vert,fragmentShader:ne.meshlambert_frag},phong:{uniforms:Rn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ne.meshphong_vert,fragmentShader:ne.meshphong_frag},standard:{uniforms:Rn([bt.common,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.roughnessmap,bt.metalnessmap,bt.fog,bt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag},toon:{uniforms:Rn([bt.common,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.gradientmap,bt.fog,bt.lights,{emissive:{value:new jt(0)}}]),vertexShader:ne.meshtoon_vert,fragmentShader:ne.meshtoon_frag},matcap:{uniforms:Rn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,{matcap:{value:null}}]),vertexShader:ne.meshmatcap_vert,fragmentShader:ne.meshmatcap_frag},points:{uniforms:Rn([bt.points,bt.fog]),vertexShader:ne.points_vert,fragmentShader:ne.points_frag},dashed:{uniforms:Rn([bt.common,bt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ne.linedashed_vert,fragmentShader:ne.linedashed_frag},depth:{uniforms:Rn([bt.common,bt.displacementmap]),vertexShader:ne.depth_vert,fragmentShader:ne.depth_frag},normal:{uniforms:Rn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,{opacity:{value:1}}]),vertexShader:ne.meshnormal_vert,fragmentShader:ne.meshnormal_frag},sprite:{uniforms:Rn([bt.sprite,bt.fog]),vertexShader:ne.sprite_vert,fragmentShader:ne.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ne.background_vert,fragmentShader:ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:ne.backgroundCube_vert,fragmentShader:ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ne.cube_vert,fragmentShader:ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ne.equirect_vert,fragmentShader:ne.equirect_frag},distance:{uniforms:Rn([bt.common,bt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ne.distance_vert,fragmentShader:ne.distance_frag},shadow:{uniforms:Rn([bt.lights,bt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:ne.shadow_vert,fragmentShader:ne.shadow_frag}};as.physical={uniforms:Rn([as.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag};var Ld={r:0,b:0,g:0},E3=new Le,jb=new Zt;jb.set(-1,0,0,0,1,0,0,0,1);function T3(e,t,n,i,s,a){let r=new jt(0),o=s===!0?0:1,l,c,h=null,p=0,u=null;function d(_){let S=_.isScene===!0?_.background:null;if(S&&S.isTexture){let v=_.backgroundBlurriness>0;S=t.get(S,v)}return S}function g(_){let S=!1,v=d(_);v===null?m(r,o):v&&v.isColor&&(m(v,1),S=!0);let E=e.xr.getEnvironmentBlendMode();E==="additive"?n.buffers.color.setClear(0,0,0,1,a):E==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function b(_,S){let v=d(S);v&&(v.isCubeTexture||v.mapping===kc)?(c===void 0&&(c=new Je(new Ho(1,1,1),new li({name:"BackgroundCubeMaterial",uniforms:dr(as.backgroundCube.uniforms),vertexShader:as.backgroundCube.vertexShader,fragmentShader:as.backgroundCube.fragmentShader,side:Pn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,T,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(E3.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(jb),c.material.toneMapped=fe.getTransfer(v.colorSpace)!==Me,(h!==v||p!==v.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,h=v,p=v.version,u=e.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Je(new ur(2,2),new li({name:"BackgroundMaterial",uniforms:dr(as.background.uniforms),vertexShader:as.background.vertexShader,fragmentShader:as.background.fragmentShader,side:Aa,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=fe.getTransfer(v.colorSpace)!==Me,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||p!==v.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,h=v,p=v.version,u=e.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function m(_,S){_.getRGB(Ld,V0(e)),n.buffers.color.setClear(Ld.r,Ld.g,Ld.b,S,a)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(_,S=1){r.set(_),o=S,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(_){o=_,m(r,o)},render:g,addToRenderList:b,dispose:f}}function A3(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(D,H,k,O,B){let J=!1,q=p(D,O,k,H);a!==q&&(a=q,c(a.object)),J=d(D,O,k,B),J&&g(D,O,k,B),B!==null&&t.update(B,e.ELEMENT_ARRAY_BUFFER),(J||r)&&(r=!1,v(D,H,k,O),B!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return e.createVertexArray()}function c(D){return e.bindVertexArray(D)}function h(D){return e.deleteVertexArray(D)}function p(D,H,k,O){let B=O.wireframe===!0,J=i[H.id];J===void 0&&(J={},i[H.id]=J);let q=D.isInstancedMesh===!0?D.id:0,st=J[q];st===void 0&&(st={},J[q]=st);let W=st[k.id];W===void 0&&(W={},st[k.id]=W);let Q=W[B];return Q===void 0&&(Q=u(l()),W[B]=Q),Q}function u(D){let H=[],k=[],O=[];for(let B=0;B<n;B++)H[B]=0,k[B]=0,O[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:k,attributeDivisors:O,object:D,attributes:{},index:null}}function d(D,H,k,O){let B=a.attributes,J=H.attributes,q=0,st=k.getAttributes();for(let W in st)if(st[W].location>=0){let tt=B[W],Ut=J[W];if(Ut===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(Ut=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(Ut=D.instanceColor)),tt===void 0||tt.attribute!==Ut||Ut&&tt.data!==Ut.data)return!0;q++}return a.attributesNum!==q||a.index!==O}function g(D,H,k,O){let B={},J=H.attributes,q=0,st=k.getAttributes();for(let W in st)if(st[W].location>=0){let tt=J[W];tt===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(tt=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(tt=D.instanceColor));let Ut={};Ut.attribute=tt,tt&&tt.data&&(Ut.data=tt.data),B[W]=Ut,q++}a.attributes=B,a.attributesNum=q,a.index=O}function b(){let D=a.newAttributes;for(let H=0,k=D.length;H<k;H++)D[H]=0}function m(D){f(D,0)}function f(D,H){let k=a.newAttributes,O=a.enabledAttributes,B=a.attributeDivisors;k[D]=1,O[D]===0&&(e.enableVertexAttribArray(D),O[D]=1),B[D]!==H&&(e.vertexAttribDivisor(D,H),B[D]=H)}function _(){let D=a.newAttributes,H=a.enabledAttributes;for(let k=0,O=H.length;k<O;k++)H[k]!==D[k]&&(e.disableVertexAttribArray(k),H[k]=0)}function S(D,H,k,O,B,J,q){q===!0?e.vertexAttribIPointer(D,H,k,B,J):e.vertexAttribPointer(D,H,k,O,B,J)}function v(D,H,k,O){b();let B=O.attributes,J=k.getAttributes(),q=H.defaultAttributeValues;for(let st in J){let W=J[st];if(W.location>=0){let Q=B[st];if(Q===void 0&&(st==="instanceMatrix"&&D.instanceMatrix&&(Q=D.instanceMatrix),st==="instanceColor"&&D.instanceColor&&(Q=D.instanceColor)),Q!==void 0){let tt=Q.normalized,Ut=Q.itemSize,wt=t.get(Q);if(wt===void 0)continue;let ce=wt.buffer,Jt=wt.type,ae=wt.bytesPerElement,Z=Jt===e.INT||Jt===e.UNSIGNED_INT||Q.gpuType===qf;if(Q.isInterleavedBufferAttribute){let j=Q.data,xt=j.stride,Ft=Q.offset;if(j.isInstancedInterleavedBuffer){for(let Tt=0;Tt<W.locationSize;Tt++)f(W.location+Tt,j.meshPerAttribute);D.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Tt=0;Tt<W.locationSize;Tt++)m(W.location+Tt);e.bindBuffer(e.ARRAY_BUFFER,ce);for(let Tt=0;Tt<W.locationSize;Tt++)S(W.location+Tt,Ut/W.locationSize,Jt,tt,xt*ae,(Ft+Ut/W.locationSize*Tt)*ae,Z)}else{if(Q.isInstancedBufferAttribute){for(let j=0;j<W.locationSize;j++)f(W.location+j,Q.meshPerAttribute);D.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let j=0;j<W.locationSize;j++)m(W.location+j);e.bindBuffer(e.ARRAY_BUFFER,ce);for(let j=0;j<W.locationSize;j++)S(W.location+j,Ut/W.locationSize,Jt,tt,Ut*ae,Ut/W.locationSize*j*ae,Z)}}else if(q!==void 0){let tt=q[st];if(tt!==void 0)switch(tt.length){case 2:e.vertexAttrib2fv(W.location,tt);break;case 3:e.vertexAttrib3fv(W.location,tt);break;case 4:e.vertexAttrib4fv(W.location,tt);break;default:e.vertexAttrib1fv(W.location,tt)}}}}_()}function E(){A();for(let D in i){let H=i[D];for(let k in H){let O=H[k];for(let B in O){let J=O[B];for(let q in J)h(J[q].object),delete J[q];delete O[B]}}delete i[D]}}function T(D){if(i[D.id]===void 0)return;let H=i[D.id];for(let k in H){let O=H[k];for(let B in O){let J=O[B];for(let q in J)h(J[q].object),delete J[q];delete O[B]}}delete i[D.id]}function w(D){for(let H in i){let k=i[H];for(let O in k){let B=k[O];if(B[D.id]===void 0)continue;let J=B[D.id];for(let q in J)h(J[q].object),delete J[q];delete B[D.id]}}}function x(D){for(let H in i){let k=i[H],O=D.isInstancedMesh===!0?D.id:0,B=k[O];if(B!==void 0){for(let J in B){let q=B[J];for(let st in q)h(q[st].object),delete q[st];delete B[J]}delete k[O],Object.keys(k).length===0&&delete i[H]}}}function A(){C(),r=!0,a!==s&&(a=s,c(a.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:C,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:b,enableAttribute:m,disableUnusedAttributes:_}}function w3(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,h){h!==0&&(e.drawArraysInstanced(i,l,c,h),n.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let d=0;d<h;d++)u+=c[d];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function R3(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(w){return!(w!==wi&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let x=w===Hi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==Zn&&w!==Fi&&!x&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=l(c);h!==c&&(kt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let p=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&kt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),f=e.getParameter(e.MAX_VERTEX_ATTRIBS),_=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),S=e.getParameter(e.MAX_VARYING_VECTORS),v=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),E=e.getParameter(e.MAX_SAMPLES),T=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:b,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:_,maxVaryings:S,maxFragmentUniforms:v,maxSamples:E,samples:T}}function C3(e){let t=this,n=null,i=0,s=!1,a=!1,r=new Oi,o=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||i!==0||s;return s=u,i=p.length,d},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){n=h(p,u,0)},this.setState=function(p,u,d){let g=p.clippingPlanes,b=p.clipIntersection,m=p.clipShadows,f=e.get(p);if(!s||g===null||g.length===0||a&&!m)a?h(null):c();else{let _=a?0:i,S=_*4,v=f.clippingState||null;l.value=v,v=h(g,u,S,d);for(let E=0;E!==S;++E)v[E]=n[E];f.clippingState=v,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(p,u,d,g){let b=p!==null?p.length:0,m=null;if(b!==0){if(m=l.value,g!==!0||m===null){let f=d+b*4,_=u.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<f)&&(m=new Float32Array(f));for(let S=0,v=d;S!==b;++S,v+=4)r.copy(p[S]).applyMatrix4(_,o),r.normal.toArray(m,v),m[v+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=b,t.numIntersection=0,m}}var el=4,D3=6,L3=20,U3=256,Qc=new Yo,Db=new jt,X0=null,q0=0,Y0=0,Z0=!1,N3=new N,pr=new N,il=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=N3}=a;X0=this._renderer.getRenderTarget(),q0=this._renderer.getActiveCubeFace(),Y0=this._renderer.getActiveMipmapLevel(),Z0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Nb(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ub(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(X0,q0,Y0),this._renderer.xr.enabled=Z0,t.scissorTest=!1,tl(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===wa||t.mapping===fr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),X0=this._renderer.getRenderTarget(),q0=this._renderer.getActiveCubeFace(),Y0=this._renderer.getActiveMipmapLevel(),Z0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:ln,minFilter:ln,generateMipmaps:!1,type:Hi,format:wi,colorSpace:Sc,depthBuffer:!1},s=Lb(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Lb(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=I3(a)),this._blurMaterial=P3(a,t,n),this._ggxMaterial=O3(a,t,n)}return s}_compileMaterial(t){let n=new Je(new On,t);this._renderer.compile(n,Qc)}_sceneToCubeUV(t,n,i,s,a){let l=new An(90,1,n,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(Db),p.toneMapping=Bi,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Je(new Ho,new rr({name:"PMREM.Background",side:Pn,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,m=b.material,f=!1,_=t.background;_?_.isColor&&(m.color.copy(_),t.background=null,f=!0):(m.color.copy(Db),f=!0);for(let S=0;S<6;S++){let v=S%3;v===0?(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+h[S],a.y,a.z)):v===1?(l.up.set(0,0,c[S]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+h[S],a.z)):(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+h[S]));let E=this._cubeSize;tl(s,v*E,S>2?E:0,E,E),p.setRenderTarget(s),f&&p.render(b,l),p.render(t,l)}p.toneMapping=d,p.autoClear=u,t.background=_}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===wa||t.mapping===fr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Nb()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ub());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;tl(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,Qc)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),h=n/(this._lodMeshes.length-1),p=Math.sqrt(c*c-h*h),u=c*1.25,d=p*u,{_lodMax:g}=this,b=this._sizeLods[i],m=3*b*(i>g-el?i-g+el:0),f=4*(this._cubeSize-b);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=g-n,tl(a,m,f,3*b,2*b),s.setRenderTarget(a),s.render(o,Qc),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=g-i,tl(t,m,f,3*b,2*b),s.setRenderTarget(t),s.render(o,Qc)}_blur(t,n,i,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,a,n,i,r),this._blurPass(a,t,i,i,r)}_blurPass(t,n,i,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],p=3*h*(s>this._lodMax-el?s-this._lodMax+el:0),u=4*(this._cubeSize-h);tl(n,p,u,3*h,2*h),r.setRenderTarget(n),r.render(l,Qc)}};function I3(e){let t=[],n=[],i=e,s=e-el+1+D3;for(let a=0;a<s;a++){let r=Math.pow(2,i);t.push(r);let o=1/(r-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,u=6,d=3,g=new Float32Array(d*u*p),b=new Float32Array(d*u*p);for(let f=0;f<p;f++){let _=f%3*2/3-1,S=f>2?0:-1,v=[_,S,0,_+2/3,S,0,_+2/3,S+1,0,_,S,0,_+2/3,S+1,0,_,S+1,0];g.set(v,d*u*f);for(let E=0;E<u;E++){let T=h[E*2]*2-1,w=h[E*2+1]*2-1;f===0?pr.set(1,w,T):f===1?pr.set(-T,1,-w):f===2?pr.set(-T,w,1):f===3?pr.set(-1,w,-T):f===4?pr.set(-T,-1,w):pr.set(T,w,-1),pr.toArray(b,(f*u+E)*d)}}let m=new On;m.setAttribute("position",new wn(g,d)),m.setAttribute("outputDirection",new wn(b,d)),n.push(new Je(m,null)),i>el&&i--}return{lodMeshes:n,sizeLods:t}}function Lb(e,t,n){let i=new Yn(e,t,n);return i.texture.mapping=kc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function tl(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function O3(e,t,n){return new li({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:U3,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Od(),fragmentShader:`

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
		`,blending:ns,depthTest:!1,depthWrite:!1})}function P3(e,t,n){return new li({name:"SphericalGaussianBlur",defines:{SAMPLES:L3,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Od(),fragmentShader:`

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
		`,blending:ns,depthTest:!1,depthWrite:!1})}function Ub(){return new li({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Od(),fragmentShader:`

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
		`,blending:ns,depthTest:!1,depthWrite:!1})}function Nb(){return new li({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Od(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ns,depthTest:!1,depthWrite:!1})}function Od(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Nd=class extends Yn{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Rc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ho(5,5,5),a=new li({name:"CubemapFromEquirect",uniforms:dr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Pn,blending:ns});a.uniforms.tEquirect.value=n;let r=new Je(s,a),o=n.minFilter;return n.minFilter===is&&(n.minFilter=ln),new Vf(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function B3(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===kf||d===Wf)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let b=new Nd(g.height);return b.fromEquirectangularTexture(e,u),t.set(u,b),u.addEventListener("dispose",c),o(b.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,g=d===kf||d===Wf,b=d===wa||d===fr;if(g||b){let m=n.get(u),f=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return i===null&&(i=new il(e)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),m.texture;if(m!==void 0)return m.texture;{let _=u.image;return g&&_&&_.height>0||b&&_&&l(_)?(i===null&&(i=new il(e)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,d){return d===kf?u.mapping=wa:d===Wf&&(u.mapping=fr),u}function l(u){let d=0,g=6;for(let b=0;b<g;b++)u[b]!==void 0&&d++;return d===g}function c(u){let d=u.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function h(u){let d=u.target;d.removeEventListener("dispose",h);let g=n.get(d);g!==void 0&&(n.delete(d),g.dispose())}function p(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:p}}function z3(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&ar("WebGLRenderer: "+i+" extension not supported."),s}}}function F3(e,t,n,i){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)t.update(u[d],e.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,g=p.attributes.position,b=0;if(g===void 0)return;if(d!==null){let _=d.array;b=d.version;for(let S=0,v=_.length;S<v;S+=3){let E=_[S+0],T=_[S+1],w=_[S+2];u.push(E,T,T,w,w,E)}}else{let _=g.array;b=g.version;for(let S=0,v=_.length/3-1;S<v;S+=3){let E=S+0,T=S+1,w=S+2;u.push(E,T,T,w,w,E)}}let m=new(g.count>=65535?Ac:Tc)(u,1);m.version=b;let f=a.get(p);f&&t.remove(f),a.set(p,m)}function h(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:h}}function H3(e,t,n){let i;function s(p){i=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){e.drawElements(i,u,a,p*r),n.update(u,i,1)}function c(p,u,d){d!==0&&(e.drawElementsInstanced(i,u,a,p*r,d),n.update(u,i,d))}function h(p,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,p,0,d);let b=0;for(let m=0;m<d;m++)b+=u[m];n.update(b,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function V3(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:Gt("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function G3(e,t,n){let i=new WeakMap,s=new Ve;function a(r,o,l){let c=r.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==p){let A=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],_=o.morphAttributes.color||[],S=0;d===!0&&(S=1),g===!0&&(S=2),b===!0&&(S=3);let v=o.attributes.position.count*S,E=1;v>t.maxTextureSize&&(E=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let T=new Float32Array(v*E*4*p),w=new Ec(T,v,E,p);w.type=Fi,w.needsUpdate=!0;let x=S*4;for(let C=0;C<p;C++){let D=m[C],H=f[C],k=_[C],O=v*E*4*C;for(let B=0;B<D.count;B++){let J=B*x;d===!0&&(s.fromBufferAttribute(D,B),T[O+J+0]=s.x,T[O+J+1]=s.y,T[O+J+2]=s.z,T[O+J+3]=0),g===!0&&(s.fromBufferAttribute(H,B),T[O+J+4]=s.x,T[O+J+5]=s.y,T[O+J+6]=s.z,T[O+J+7]=0),b===!0&&(s.fromBufferAttribute(k,B),T[O+J+8]=s.x,T[O+J+9]=s.y,T[O+J+10]=s.z,T[O+J+11]=k.itemSize===4?s.w:1)}}u={count:p,texture:w,size:new dt(v,E)},i.set(o,u),o.addEventListener("dispose",A)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let d=0;for(let b=0;b<c.length;b++)d+=c[b];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",g),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function k3(e,t,n,i,s){let a=new WeakMap;function r(c){let h=s.render.frame,p=c.geometry,u=t.get(c,p);if(a.get(u)!==h&&(t.update(u),a.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==h&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==h&&(d.update(),a.set(d,h))}return u}function o(){a=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),n.remove(h.instanceMatrix),h.instanceColor!==null&&n.remove(h.instanceColor)}return{update:r,dispose:o}}var W3={[E0]:"LINEAR_TONE_MAPPING",[T0]:"REINHARD_TONE_MAPPING",[A0]:"CINEON_TONE_MAPPING",[w0]:"ACES_FILMIC_TONE_MAPPING",[C0]:"AGX_TONE_MAPPING",[Gc]:"NEUTRAL_TONE_MAPPING",[R0]:"CUSTOM_TONE_MAPPING"};function X3(e,t,n,i,s,a){let r=new Yn(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new On;c.setAttribute("position",new nn([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new nn([0,2,0,0,2,0],2));let h=new Af({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),p=new Je(c,h),u=new Yo(-1,1,1,-1,0,1),d=null,g=null,b=!1,m,f=null,_=[],S=!1;this.setSize=function(v,E){r.setSize(v,E),o!==null&&o.setSize(v,E),l!==null&&l.setSize(v,E);for(let T=0;T<_.length;T++){let w=_[T];w.setSize&&w.setSize(v,E)}},this.setEffects=function(v){_=v,S=_.length>0&&_[0].isRenderPass===!0;let E=r.width,T=r.height;_.length>0&&o===null&&(o=new Yn(E,T,{type:Hi,depthBuffer:!1,stencilBuffer:!1}),l=new Yn(E,T,{type:Hi,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<_.length;w++){let x=_[w];x.setSize&&x.setSize(E,T)}},this.begin=function(v,E){if(b||v.toneMapping===Bi&&_.length===0)return!1;if(f=E,E!==null){let T=E.width,w=E.height;(r.width!==T||r.height!==w)&&this.setSize(T,w)}return S===!1&&v.setRenderTarget(r),m=v.toneMapping,v.toneMapping=Bi,!0},this.hasRenderPass=function(){return S},this.end=function(v,E){v.toneMapping=m,b=!0;let T=r,w=o;for(let x=0;x<_.length;x++){let A=_[x];A.enabled!==!1&&(A.render(v,w,T,E),A.needsSwap!==!1&&(T=w,w=w===o?l:o))}if(d!==v.outputColorSpace||g!==v.toneMapping){d=v.outputColorSpace,g=v.toneMapping,h.defines={},fe.getTransfer(d)===Me&&(h.defines.SRGB_TRANSFER="");let x=W3[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=T.texture,v.setRenderTarget(f),v.render(p,u),f=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var $b=new Nn,Q0=new xa(1,1),t1=new Ec,e1=new yf,n1=new Rc,Ib=[],Ob=[],Pb=new Float32Array(16),Bb=new Float32Array(9),zb=new Float32Array(4);function sl(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=Ib[s];if(a===void 0&&(a=new Float32Array(s),Ib[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function cn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function un(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function Pd(e,t){let n=Ob[t];n===void 0&&(n=new Int32Array(t),Ob[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function q3(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Y3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(cn(n,t))return;e.uniform2fv(this.addr,t),un(n,t)}}function Z3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(cn(n,t))return;e.uniform3fv(this.addr,t),un(n,t)}}function J3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(cn(n,t))return;e.uniform4fv(this.addr,t),un(n,t)}}function K3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(cn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),un(n,t)}else{if(cn(n,i))return;zb.set(i),e.uniformMatrix2fv(this.addr,!1,zb),un(n,i)}}function Q3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(cn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),un(n,t)}else{if(cn(n,i))return;Bb.set(i),e.uniformMatrix3fv(this.addr,!1,Bb),un(n,i)}}function j3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(cn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),un(n,t)}else{if(cn(n,i))return;Pb.set(i),e.uniformMatrix4fv(this.addr,!1,Pb),un(n,i)}}function $3(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function t2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(cn(n,t))return;e.uniform2iv(this.addr,t),un(n,t)}}function e2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(cn(n,t))return;e.uniform3iv(this.addr,t),un(n,t)}}function n2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(cn(n,t))return;e.uniform4iv(this.addr,t),un(n,t)}}function i2(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function s2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(cn(n,t))return;e.uniform2uiv(this.addr,t),un(n,t)}}function a2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(cn(n,t))return;e.uniform3uiv(this.addr,t),un(n,t)}}function r2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(cn(n,t))return;e.uniform4uiv(this.addr,t),un(n,t)}}function o2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(Q0.compareFunction=n.isReversedDepthBuffer()?Dd:Cd,a=Q0):a=$b,n.setTexture2D(t||a,s)}function l2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||e1,s)}function c2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||n1,s)}function u2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||t1,s)}function h2(e){switch(e){case 5126:return q3;case 35664:return Y3;case 35665:return Z3;case 35666:return J3;case 35674:return K3;case 35675:return Q3;case 35676:return j3;case 5124:case 35670:return $3;case 35667:case 35671:return t2;case 35668:case 35672:return e2;case 35669:case 35673:return n2;case 5125:return i2;case 36294:return s2;case 36295:return a2;case 36296:return r2;case 35678:case 36198:case 36298:case 36306:case 35682:return o2;case 35679:case 36299:case 36307:return l2;case 35680:case 36300:case 36308:case 36293:return c2;case 36289:case 36303:case 36311:case 36292:return u2}}function f2(e,t){e.uniform1fv(this.addr,t)}function d2(e,t){let n=sl(t,this.size,2);e.uniform2fv(this.addr,n)}function p2(e,t){let n=sl(t,this.size,3);e.uniform3fv(this.addr,n)}function m2(e,t){let n=sl(t,this.size,4);e.uniform4fv(this.addr,n)}function g2(e,t){let n=sl(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function _2(e,t){let n=sl(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function v2(e,t){let n=sl(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function y2(e,t){e.uniform1iv(this.addr,t)}function x2(e,t){e.uniform2iv(this.addr,t)}function S2(e,t){e.uniform3iv(this.addr,t)}function M2(e,t){e.uniform4iv(this.addr,t)}function b2(e,t){e.uniform1uiv(this.addr,t)}function E2(e,t){e.uniform2uiv(this.addr,t)}function T2(e,t){e.uniform3uiv(this.addr,t)}function A2(e,t){e.uniform4uiv(this.addr,t)}function w2(e,t,n){let i=this.cache,s=t.length,a=Pd(n,s);cn(i,a)||(e.uniform1iv(this.addr,a),un(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=Q0:r=$b;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function R2(e,t,n){let i=this.cache,s=t.length,a=Pd(n,s);cn(i,a)||(e.uniform1iv(this.addr,a),un(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||e1,a[r])}function C2(e,t,n){let i=this.cache,s=t.length,a=Pd(n,s);cn(i,a)||(e.uniform1iv(this.addr,a),un(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||n1,a[r])}function D2(e,t,n){let i=this.cache,s=t.length,a=Pd(n,s);cn(i,a)||(e.uniform1iv(this.addr,a),un(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||t1,a[r])}function L2(e){switch(e){case 5126:return f2;case 35664:return d2;case 35665:return p2;case 35666:return m2;case 35674:return g2;case 35675:return _2;case 35676:return v2;case 5124:case 35670:return y2;case 35667:case 35671:return x2;case 35668:case 35672:return S2;case 35669:case 35673:return M2;case 5125:return b2;case 36294:return E2;case 36295:return T2;case 36296:return A2;case 35678:case 36198:case 36298:case 36306:case 35682:return w2;case 35679:case 36299:case 36307:return R2;case 35680:case 36300:case 36308:case 36293:return C2;case 36289:case 36303:case 36311:case 36292:return D2}}var j0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=h2(n.type)}},$0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=L2(n.type)}},t_=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},J0=/(\w+)(\])?(\[|\.)?/g;function Fb(e,t){e.seq.push(t),e.map[t.id]=t}function U2(e,t,n){let i=e.name,s=i.length;for(J0.lastIndex=0;;){let a=J0.exec(i),r=J0.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){Fb(n,c===void 0?new j0(o,e,t):new $0(o,e,t));break}else{let p=n.map[o];p===void 0&&(p=new t_(o),Fb(n,p)),n=p}}}var nl=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);U2(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function Hb(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var N2=37297,I2=0;function O2(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var Vb=new Zt;function P2(e){fe._getMatrix(Vb,fe.workingColorSpace,e);let t=`mat3( ${Vb.elements.map(n=>n.toFixed(4))} )`;switch(fe.getTransfer(e)){case Mc:return[t,"LinearTransferOETF"];case Me:return[t,"sRGBTransferOETF"];default:return kt("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Gb(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+O2(e.getShaderSource(t),o)}else return a}function B2(e,t){let n=P2(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var z2={[E0]:"Linear",[T0]:"Reinhard",[A0]:"Cineon",[w0]:"ACESFilmic",[C0]:"AgX",[Gc]:"Neutral",[R0]:"Custom"};function F2(e,t){let n=z2[t];return n===void 0?(kt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Ud=new N;function H2(){fe.getLuminanceCoefficients(Ud);let e=Ud.x.toFixed(4),t=Ud.y.toFixed(4),n=Ud.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function V2(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($c).join(`
`)}function G2(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function k2(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function $c(e){return e!==""}function kb(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Wb(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var W2=/^[ \t]*#include +<([\w\d./]+)>/gm;function e_(e){return e.replace(W2,q2)}var X2=new Map;function q2(e,t){let n=ne[t];if(n===void 0){let i=X2.get(t);if(i!==void 0)n=ne[i],kt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return e_(n)}var Y2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xb(e){return e.replace(Y2,Z2)}function Z2(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function qb(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var J2={[Vc]:"SHADOWMAP_TYPE_PCF",[Jo]:"SHADOWMAP_TYPE_VSM"};function K2(e){return J2[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Q2={[wa]:"ENVMAP_TYPE_CUBE",[fr]:"ENVMAP_TYPE_CUBE",[kc]:"ENVMAP_TYPE_CUBE_UV"};function j2(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Q2[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var $2={[fr]:"ENVMAP_MODE_REFRACTION"};function tD(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":$2[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var eD={[b0]:"ENVMAP_BLENDING_MULTIPLY",[ab]:"ENVMAP_BLENDING_MIX",[rb]:"ENVMAP_BLENDING_ADD"};function nD(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":eD[e.combine]||"ENVMAP_BLENDING_NONE"}function iD(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function sD(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=K2(n),c=j2(n),h=tD(n),p=nD(n),u=iD(n),d=V2(n),g=G2(a),b=s.createProgram(),m,f,_=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter($c).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter($c).join(`
`),f.length>0&&(f+=`
`)):(m=[qb(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($c).join(`
`),f=[qb(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Bi?"#define TONE_MAPPING":"",n.toneMapping!==Bi?ne.tonemapping_pars_fragment:"",n.toneMapping!==Bi?F2("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ne.colorspace_pars_fragment,B2("linearToOutputTexel",n.outputColorSpace),H2(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter($c).join(`
`)),r=e_(r),r=kb(r,n),r=Wb(r,n),o=e_(o),o=kb(o,n),o=Wb(o,n),r=Xb(r),o=Xb(o),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",n.glslVersion===z0?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===z0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let S=_+m+r,v=_+f+o,E=Hb(s,s.VERTEX_SHADER,S),T=Hb(s,s.FRAGMENT_SHADER,v);s.attachShader(b,E),s.attachShader(b,T),n.index0AttributeName!==void 0?s.bindAttribLocation(b,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function w(D){if(e.debug.checkShaderErrors){let H=s.getProgramInfoLog(b)||"",k=s.getShaderInfoLog(E)||"",O=s.getShaderInfoLog(T)||"",B=H.trim(),J=k.trim(),q=O.trim(),st=!0,W=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(st=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,b,E,T);else{let Q=Gb(s,E,"vertex"),tt=Gb(s,T,"fragment");Gt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+B+`
`+Q+`
`+tt)}else B!==""?kt("WebGLProgram: Program Info Log:",B):(J===""||q==="")&&(W=!1);W&&(D.diagnostics={runnable:st,programLog:B,vertexShader:{log:J,prefix:m},fragmentShader:{log:q,prefix:f}})}s.deleteShader(E),s.deleteShader(T),x=new nl(s,b),A=k2(s,b)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let A;this.getAttributes=function(){return A===void 0&&w(this),A};let C=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(b,N2)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=I2++,this.cacheKey=t,this.usedTimes=1,this.program=b,this.vertexShader=E,this.fragmentShader=T,this}var aD=0,n_=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new i_(t),n.set(t,i)),i}},i_=class{constructor(t){this.id=aD++,this.code=t,this.usedTimes=0}};function rD(e){return e===Ca||e===Jc||e===Kc}function oD(e,t,n,i,s,a){let r=new Io,o=new n_,l=new Set,c=[],h=new Map,p=i.logarithmicDepthBuffer,u=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function b(x,A,C,D,H,k){let O=D.fog,B=H.geometry,J=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?D.environment:null,q=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,st=t.get(x.envMap||J,q),W=st&&st.mapping===kc?st.image.height:null,Q=d[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&kt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let tt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Ut=tt!==void 0?tt.length:0,wt=0;B.morphAttributes.position!==void 0&&(wt=1),B.morphAttributes.normal!==void 0&&(wt=2),B.morphAttributes.color!==void 0&&(wt=3);let ce,Jt,ae,Z;if(Q){let xe=as[Q];ce=xe.vertexShader,Jt=xe.fragmentShader}else{ce=x.vertexShader,Jt=x.fragmentShader;let xe=o.getVertexShaderStage(x),_e=o.getFragmentShaderStage(x);o.update(x,xe,_e),ae=xe.id,Z=_e.id}let j=e.getRenderTarget(),xt=e.state.buffers.depth.getReversed(),Ft=H.isInstancedMesh===!0,Tt=H.isBatchedMesh===!0,Bt=!!x.map,ue=!!x.matcap,et=!!st,at=!!x.aoMap,ot=!!x.lightMap,lt=!!x.bumpMap&&x.wireframe===!1,ft=!!x.normalMap,zt=!!x.displacementMap,Ot=!!x.emissiveMap,Vt=!!x.metalnessMap,Wt=!!x.roughnessMap,L=x.anisotropy>0,me=x.clearcoat>0,St=x.dispersion>0,R=x.retroreflectivity>0,y=x.iridescence>0,P=x.sheen>0,V=x.transmission>0,X=L&&!!x.anisotropyMap,rt=me&&!!x.clearcoatMap,ut=me&&!!x.clearcoatNormalMap,Y=me&&!!x.clearcoatRoughnessMap,$=y&&!!x.iridescenceMap,pt=y&&!!x.iridescenceThicknessMap,Nt=P&&!!x.sheenColorMap,yt=P&&!!x.sheenRoughnessMap,mt=!!x.specularMap,Lt=!!x.specularColorMap,Ht=!!x.specularIntensityMap,Yt=V&&!!x.transmissionMap,I=V&&!!x.thicknessMap,gt=!!x.gradientMap,K=!!x.alphaMap,_t=x.alphaTest>0,Et=!!x.alphaHash,it=!!x.extensions,Pt=Bi;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Pt=e.toneMapping);let Ct={shaderID:Q,shaderType:x.type,shaderName:x.name,vertexShader:ce,fragmentShader:Jt,defines:x.defines,customVertexShaderID:ae,customFragmentShaderID:Z,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Tt,batchingColor:Tt&&H._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&H.instanceColor!==null,instancingMorph:Ft&&H.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:fe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Bt,matcap:ue,envMap:et,envMapMode:et&&st.mapping,envMapCubeUVHeight:W,aoMap:at,lightMap:ot,bumpMap:lt,normalMap:ft,displacementMap:zt,emissiveMap:Ot,normalMapObjectSpace:ft&&x.normalMapType===cb,normalMapTangentSpace:ft&&x.normalMapType===Rd,packedNormalMap:ft&&x.normalMapType===Rd&&rD(x.normalMap.format),metalnessMap:Vt,roughnessMap:Wt,anisotropy:L,anisotropyMap:X,clearcoat:me,clearcoatMap:rt,clearcoatNormalMap:ut,clearcoatRoughnessMap:Y,dispersion:St,retroreflection:R,iridescence:y,iridescenceMap:$,iridescenceThicknessMap:pt,sheen:P,sheenColorMap:Nt,sheenRoughnessMap:yt,specularMap:mt,specularColorMap:Lt,specularIntensityMap:Ht,transmission:V,transmissionMap:Yt,thicknessMap:I,gradientMap:gt,opaque:x.transparent===!1&&x.blending===Ko&&x.alphaToCoverage===!1,alphaMap:K,alphaTest:_t,alphaHash:Et,combine:x.combine,mapUv:Bt&&g(x.map.channel),aoMapUv:at&&g(x.aoMap.channel),lightMapUv:ot&&g(x.lightMap.channel),bumpMapUv:lt&&g(x.bumpMap.channel),normalMapUv:ft&&g(x.normalMap.channel),displacementMapUv:zt&&g(x.displacementMap.channel),emissiveMapUv:Ot&&g(x.emissiveMap.channel),metalnessMapUv:Vt&&g(x.metalnessMap.channel),roughnessMapUv:Wt&&g(x.roughnessMap.channel),anisotropyMapUv:X&&g(x.anisotropyMap.channel),clearcoatMapUv:rt&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ut&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Y&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Nt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:yt&&g(x.sheenRoughnessMap.channel),specularMapUv:mt&&g(x.specularMap.channel),specularColorMapUv:Lt&&g(x.specularColorMap.channel),specularIntensityMapUv:Ht&&g(x.specularIntensityMap.channel),transmissionMapUv:Yt&&g(x.transmissionMap.channel),thicknessMapUv:I&&g(x.thicknessMap.channel),alphaMapUv:K&&g(x.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ft||L),vertexNormals:!!B.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!B.attributes.uv&&(Bt||K),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||B.attributes.normal===void 0&&ft===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:xt,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Ut,morphTextureStride:wt,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:e.shadowMap.enabled&&C.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pt,decodeVideoTexture:Bt&&x.map.isVideoTexture===!0&&fe.getTransfer(x.map.colorSpace)===Me,decodeVideoTextureEmissive:Ot&&x.emissiveMap.isVideoTexture===!0&&fe.getTransfer(x.emissiveMap.colorSpace)===Me,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ui,flipSided:x.side===Pn,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:it&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(it&&x.extensions.multiDraw===!0||Tt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ct.vertexUv1s=l.has(1),Ct.vertexUv2s=l.has(2),Ct.vertexUv3s=l.has(3),l.clear(),Ct}function m(x){let A=[];if(x.shaderID?A.push(x.shaderID):(A.push(x.customVertexShaderID),A.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)A.push(C),A.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(f(A,x),_(A,x),A.push(e.outputColorSpace)),A.push(x.customProgramCacheKey),A.join()}function f(x,A){x.push(A.precision),x.push(A.outputColorSpace),x.push(A.envMapMode),x.push(A.envMapCubeUVHeight),x.push(A.mapUv),x.push(A.alphaMapUv),x.push(A.lightMapUv),x.push(A.aoMapUv),x.push(A.bumpMapUv),x.push(A.normalMapUv),x.push(A.displacementMapUv),x.push(A.emissiveMapUv),x.push(A.metalnessMapUv),x.push(A.roughnessMapUv),x.push(A.anisotropyMapUv),x.push(A.clearcoatMapUv),x.push(A.clearcoatNormalMapUv),x.push(A.clearcoatRoughnessMapUv),x.push(A.iridescenceMapUv),x.push(A.iridescenceThicknessMapUv),x.push(A.sheenColorMapUv),x.push(A.sheenRoughnessMapUv),x.push(A.specularMapUv),x.push(A.specularColorMapUv),x.push(A.specularIntensityMapUv),x.push(A.transmissionMapUv),x.push(A.thicknessMapUv),x.push(A.combine),x.push(A.fogExp2),x.push(A.sizeAttenuation),x.push(A.morphTargetsCount),x.push(A.morphAttributeCount),x.push(A.numSunLights),x.push(A.numDirLights),x.push(A.numPointLights),x.push(A.numSpotLights),x.push(A.numSpotLightMaps),x.push(A.numHemiLights),x.push(A.numRectAreaLights),x.push(A.numSunLightShadows),x.push(A.numDirLightShadows),x.push(A.numPointLightShadows),x.push(A.numSpotLightShadows),x.push(A.numSpotLightShadowsWithMaps),x.push(A.numLightProbes),x.push(A.shadowMapType),x.push(A.toneMapping),x.push(A.numClippingPlanes),x.push(A.numClipIntersection),x.push(A.depthPacking)}function _(x,A){r.disableAll(),A.instancing&&r.enable(0),A.instancingColor&&r.enable(1),A.instancingMorph&&r.enable(2),A.matcap&&r.enable(3),A.envMap&&r.enable(4),A.normalMapObjectSpace&&r.enable(5),A.normalMapTangentSpace&&r.enable(6),A.clearcoat&&r.enable(7),A.iridescence&&r.enable(8),A.alphaTest&&r.enable(9),A.vertexColors&&r.enable(10),A.vertexAlphas&&r.enable(11),A.vertexUv1s&&r.enable(12),A.vertexUv2s&&r.enable(13),A.vertexUv3s&&r.enable(14),A.vertexTangents&&r.enable(15),A.anisotropy&&r.enable(16),A.alphaHash&&r.enable(17),A.batching&&r.enable(18),A.dispersion&&r.enable(19),A.retroreflection&&r.enable(24),A.batchingColor&&r.enable(20),A.gradientMap&&r.enable(21),A.packedNormalMap&&r.enable(22),A.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),A.fog&&r.enable(0),A.useFog&&r.enable(1),A.flatShading&&r.enable(2),A.logarithmicDepthBuffer&&r.enable(3),A.reversedDepthBuffer&&r.enable(4),A.skinning&&r.enable(5),A.morphTargets&&r.enable(6),A.morphNormals&&r.enable(7),A.morphColors&&r.enable(8),A.premultipliedAlpha&&r.enable(9),A.shadowMapEnabled&&r.enable(10),A.doubleSided&&r.enable(11),A.flipSided&&r.enable(12),A.useDepthPacking&&r.enable(13),A.dithering&&r.enable(14),A.transmission&&r.enable(15),A.sheen&&r.enable(16),A.opaque&&r.enable(17),A.pointsUvs&&r.enable(18),A.decodeVideoTexture&&r.enable(19),A.decodeVideoTextureEmissive&&r.enable(20),A.alphaToCoverage&&r.enable(21),A.numLightProbeGrids>0&&r.enable(22),A.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function S(x){let A=d[x.type],C;if(A){let D=as[A];C=wb.clone(D.uniforms)}else C=x.uniforms;return C}function v(x,A){let C=h.get(A);return C!==void 0?++C.usedTimes:(C=new sD(e,A,x,s),c.push(C),h.set(A,C)),C}function E(x){if(--x.usedTimes===0){let A=c.indexOf(x);c[A]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function T(x){o.remove(x)}function w(){o.dispose()}return{getParameters:b,getProgramCacheKey:m,getUniforms:S,acquireProgram:v,releaseProgram:E,releaseShaderCache:T,programs:c,dispose:w}}function lD(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function cD(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function Yb(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Zb(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,g,b,m,f){let _=e[t];return _===void 0?(_={id:u.id,object:u,geometry:d,material:g,materialVariant:r(u),groupOrder:b,renderOrder:u.renderOrder,z:m,group:f},e[t]=_):(_.id=u.id,_.object=u,_.geometry=d,_.material=g,_.materialVariant=r(u),_.groupOrder=b,_.renderOrder=u.renderOrder,_.z=m,_.group=f),t++,_}function l(u,d,g,b,m,f,_){_.reversedDepth===!0&&(m=-m);let S=o(u,d,g,b,m,f);g.transmission>0?i.push(S):g.transparent===!0?s.push(S):n.push(S)}function c(u,d,g,b,m,f){let _=o(u,d,g,b,m,f);g.transmission>0?i.unshift(_):g.transparent===!0?s.unshift(_):n.unshift(_)}function h(u,d){n.length>1&&n.sort(u||cD),i.length>1&&i.sort(d||Yb),s.length>1&&s.sort(d||Yb)}function p(){for(let u=t,d=e.length;u<d;u++){let g=e[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:p,sort:h}}function uD(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new Zb,e.set(i,[r])):s>=a.length?(r=new Zb,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function hD(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={direction:new N,color:new jt};break;case"SpotLight":n={position:new N,direction:new N,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new N,color:new jt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new N,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":n={color:new jt,position:new N,halfWidth:new N,halfHeight:new N};break}return e[t.id]=n,n}}}function fD(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var dD=0;function pD(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function mD(e){let t=new hD,n=fD(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);let s=new N,a=new Le,r=new Le;function o(c){let h=0,p=0,u=0;for(let H=0;H<9;H++)i.probe[H].set(0,0,0);let d=0,g=0,b=0,m=0,f=0,_=0,S=0,v=0,E=0,T=0,w=0,x=0,A=0,C=0;c.sort(pD);for(let H=0,k=c.length;H<k;H++){let O=c[H],B=O.color,J=O.intensity,q=O.distance,st=null;if(O.shadow&&O.shadow.map&&(O.shadow.map.texture.format===Ca?st=O.shadow.map.texture:st=O.shadow.map.depthTexture||O.shadow.map.texture),O.isAmbientLight)h+=B.r*J,p+=B.g*J,u+=B.b*J;else if(O.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(O.sh.coefficients[W],J);C++}else if(O.isSunLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let Q=O.shadow,tt=n.get(O);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[g]=tt,i.sunShadowMap[g]=st;let Ut=Q.getViewportCount();for(let wt=0;wt<Ut;wt++)i.sunShadowMatrix[b+wt]=Q.getMatrix(wt),i.sunShadowCascade[b+wt]=Q._cascadeData[wt];b+=Ut,g++}i.sun[d]=W,d++}else if(O.isDirectionalLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let Q=O.shadow,tt=n.get(O);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,i.directionalShadow[m]=tt,i.directionalShadowMap[m]=st,i.directionalShadowMatrix[m]=O.shadow.matrix,E++}i.directional[m]=W,m++}else if(O.isSpotLight){let W=t.get(O);W.position.setFromMatrixPosition(O.matrixWorld),W.color.copy(B).multiplyScalar(J),W.distance=q,W.coneCos=Math.cos(O.angle),W.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),W.decay=O.decay,i.spot[_]=W;let Q=O.shadow;if(O.map&&(i.spotLightMap[x]=O.map,x++,Q.updateMatrices(O),O.castShadow&&A++),i.spotLightMatrix[_]=Q.matrix,O.castShadow){let tt=n.get(O);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,i.spotShadow[_]=tt,i.spotShadowMap[_]=st,w++}_++}else if(O.isRectAreaLight){let W=t.get(O);W.color.copy(B).multiplyScalar(J),W.halfWidth.set(O.width*.5,0,0),W.halfHeight.set(0,O.height*.5,0),i.rectArea[S]=W,S++}else if(O.isPointLight){let W=t.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),W.distance=O.distance,W.decay=O.decay,O.castShadow){let Q=O.shadow,tt=n.get(O);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,tt.shadowCameraNear=Q.camera.near,tt.shadowCameraFar=Q.camera.far,i.pointShadow[f]=tt,i.pointShadowMap[f]=st,i.pointShadowMatrix[f]=O.shadow.matrix,T++}i.point[f]=W,f++}else if(O.isHemisphereLight){let W=t.get(O);W.skyColor.copy(O.color).multiplyScalar(J),W.groundColor.copy(O.groundColor).multiplyScalar(J),i.hemi[v]=W,v++}}S>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=bt.LTC_FLOAT_1,i.rectAreaLTC2=bt.LTC_FLOAT_2):(i.rectAreaLTC1=bt.LTC_HALF_1,i.rectAreaLTC2=bt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=p,i.ambient[2]=u;let D=i.hash;(D.sunLength!==d||D.directionalLength!==m||D.pointLength!==f||D.spotLength!==_||D.rectAreaLength!==S||D.hemiLength!==v||D.numSunShadows!==g||D.numDirectionalShadows!==E||D.numPointShadows!==T||D.numSpotShadows!==w||D.numSpotMaps!==x||D.numLightProbes!==C)&&(i.sun.length=d,i.directional.length=m,i.spot.length=_,i.rectArea.length=S,i.point.length=f,i.hemi.length=v,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=b,i.sunShadowCascade.length=b,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+x-A,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=C,D.sunLength=d,D.directionalLength=m,D.pointLength=f,D.spotLength=_,D.rectAreaLength=S,D.hemiLength=v,D.numSunShadows=g,D.numDirectionalShadows=E,D.numPointShadows=T,D.numSpotShadows=w,D.numSpotMaps=x,D.numLightProbes=C,i.version=dD++)}function l(c,h){let p=0,u=0,d=0,g=0,b=0,m=0,f=h.matrixWorldInverse;for(let _=0,S=c.length;_<S;_++){let v=c[_];if(v.isSunLight){let E=i.sun[p];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(f),p++}else if(v.isDirectionalLight){let E=i.directional[u];E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(f),u++}else if(v.isSpotLight){let E=i.spot[g];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(f),E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(f),g++}else if(v.isRectAreaLight){let E=i.rectArea[b];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(f),r.identity(),a.copy(v.matrixWorld),a.premultiply(f),r.extractRotation(a),E.halfWidth.set(v.width*.5,0,0),E.halfHeight.set(0,v.height*.5,0),E.halfWidth.applyMatrix4(r),E.halfHeight.applyMatrix4(r),b++}else if(v.isPointLight){let E=i.point[d];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(f),d++}else if(v.isHemisphereLight){let E=i.hemi[m];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(f),m++}}}return{setup:o,setupView:l,state:i}}function Jb(e){let t=new mD(e),n=[],i=[],s=[];function a(u){p.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function h(u){t.setupView(n,u)}let p={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:h,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function gD(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new Jb(e),t.set(s,[o])):a>=r.length?(o=new Jb(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var _D=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vD=`uniform sampler2D shadow_pass;
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
}`,yD=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],xD=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Kb=new Le,jc=new N,K0=new N;function SD(e,t,n){let i=new Fo,s=new dt,a=new dt,r=new Ve,o=new wf,l=new Rf,c={},h=n.maxTextureSize,p={[Aa]:Pn,[Pn]:Aa,[ui]:ui},u=new li({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:_D,fragmentShader:vD}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new On;g.setAttribute("position",new wn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new Je(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Vc;let f=this.type;this.render=function(T,w,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===HM&&(kt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Vc);let A=e.getRenderTarget(),C=e.getActiveCubeFace(),D=e.getActiveMipmapLevel(),H=e.state;H.setBlending(ns),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let k=f!==this.type;k&&w.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(B=>B.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,B=T.length;O<B;O++){let J=T[O],q=J.shadow;if(q===void 0){kt("WebGLShadowMap:",J,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;s.copy(q.mapSize);let st=q.getFrameExtents();s.multiply(st),a.copy(q.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(a.x=Math.floor(h/st.x),s.x=a.x*st.x,q.mapSize.x=a.x),s.y>h&&(a.y=Math.floor(h/st.y),s.y=a.y*st.y,q.mapSize.y=a.y));let W=e.state.buffers.depth.getReversed();if(q.camera._reversedDepth=W,q.map===null||k===!0){if(q.map!==null&&(q.map.depthTexture!==null&&(q.map.depthTexture.dispose(),q.map.depthTexture=null),q.map.dispose()),this.type===Jo){if(J.isPointLight){kt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}q.map=new Yn(s.x,s.y,{format:Ca,type:Hi,minFilter:ln,magFilter:ln,generateMipmaps:!1}),q.map.texture.name=J.name+".shadowMap",q.map.depthTexture=new xa(s.x,s.y,Fi),q.map.depthTexture.name=J.name+".shadowMapDepth",q.map.depthTexture.format=ts,q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=mn,q.map.depthTexture.magFilter=mn}else J.isPointLight?(q.map=new Nd(s.x),q.map.depthTexture=new xf(s.x,zi)):(q.map=new Yn(s.x,s.y),q.map.depthTexture=new xa(s.x,s.y,zi)),q.map.depthTexture.name=J.name+".shadowMap",q.map.depthTexture.format=ts,this.type===Vc?(q.map.depthTexture.compareFunction=W?Dd:Cd,q.map.depthTexture.minFilter=ln,q.map.depthTexture.magFilter=ln):(q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=mn,q.map.depthTexture.magFilter=mn);q.camera.updateProjectionMatrix()}q.map.isWebGLCubeRenderTarget!==!0&&(q.map.width!==s.x||q.map.height!==s.y)&&q.map.setSize(s.x,s.y);let Q=q.map.isWebGLCubeRenderTarget?6:q.getViewportCount();J.isPointLight!==!0&&q.updateMatrices(J,x);for(let tt=0;tt<Q;tt++){let Ut=q.getCamera(tt);if(J.isPointLight){let wt=q.camera,ce=q.matrix,Jt=J.distance||wt.far;Jt!==wt.far&&(wt.far=Jt,wt.updateProjectionMatrix()),jc.setFromMatrixPosition(J.matrixWorld),wt.position.copy(jc),K0.copy(wt.position),K0.add(yD[tt]),wt.up.copy(xD[tt]),wt.lookAt(K0),wt.updateMatrixWorld(),ce.makeTranslation(-jc.x,-jc.y,-jc.z),Kb.multiplyMatrices(wt.projectionMatrix,wt.matrixWorldInverse),q._frustum.setFromProjectionMatrix(Kb,wt.coordinateSystem,wt.reversedDepth)}if(q.map.isWebGLCubeRenderTarget)e.setRenderTarget(q.map,tt),e.clear();else{tt===0&&(e.setRenderTarget(q.map),e.clear());let wt=q.getViewport(tt);r.set(a.x*wt.x,a.y*wt.y,a.x*wt.z,a.y*wt.w),H.viewport(r)}i=q.getFrustum(tt),v(w,x,Ut,J,this.type)}q.isPointLightShadow!==!0&&this.type===Jo&&_(q,x),q.needsUpdate=!1}f=this.type,m.needsUpdate=!1,e.setRenderTarget(A,C,D)};function _(T,w){let x=t.update(b);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new Yn(s.x,s.y,{format:Ca,type:Hi}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,e.setRenderTarget(T.mapPass),e.clear(),e.renderBufferDirect(w,null,x,u,b,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,e.setRenderTarget(T.map),e.clear(),e.renderBufferDirect(w,null,x,d,b,null)}function S(T,w,x,A){let C=null,D=x.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(D!==void 0)C=D;else if(C=x.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let H=C.uuid,k=w.uuid,O=c[H];O===void 0&&(O={},c[H]=O);let B=O[k];B===void 0&&(B=C.clone(),O[k]=B,w.addEventListener("dispose",E)),C=B}if(C.visible=w.visible,C.wireframe=w.wireframe,A===Jo?C.side=w.shadowSide!==null?w.shadowSide:w.side:C.side=w.shadowSide!==null?w.shadowSide:p[w.side],C.alphaMap=w.alphaMap,C.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,C.map=w.map,C.clipShadows=w.clipShadows,C.clippingPlanes=w.clippingPlanes,C.clipIntersection=w.clipIntersection,C.displacementMap=w.displacementMap,C.displacementScale=w.displacementScale,C.displacementBias=w.displacementBias,C.wireframeLinewidth=w.wireframeLinewidth,C.linewidth=w.linewidth,x.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let H=e.properties.get(C);H.light=x}return C}function v(T,w,x,A,C){if(T.visible===!1)return;if(T.layers.test(w.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&C===Jo)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,T.matrixWorld);let k=t.update(T),O=T.material;if(Array.isArray(O)){let B=k.groups;for(let J=0,q=B.length;J<q;J++){let st=B[J],W=O[st.materialIndex];if(W&&W.visible){let Q=S(T,W,A,C);T.onBeforeShadow(e,T,w,x,k,Q,st),e.renderBufferDirect(x,null,k,Q,T,st),T.onAfterShadow(e,T,w,x,k,Q,st)}}}else if(O.visible){let B=S(T,O,A,C);T.onBeforeShadow(e,T,w,x,k,B,null),e.renderBufferDirect(x,null,k,B,T,null),T.onAfterShadow(e,T,w,x,k,B,null)}}let H=T.children;for(let k=0,O=H.length;k<O;k++)v(H[k],w,x,A,C)}function E(T){T.target.removeEventListener("dispose",E);for(let x in c){let A=c[x],C=T.target.uuid;C in A&&(A[C].dispose(),delete A[C])}}}function MD(e,t){function n(){let I=!1,gt=new Ve,K=null,_t=new Ve(0,0,0,0);return{setMask:function(Et){K!==Et&&!I&&(e.colorMask(Et,Et,Et,Et),K=Et)},setLocked:function(Et){I=Et},setClear:function(Et,it,Pt,Ct,xe){xe===!0&&(Et*=Ct,it*=Ct,Pt*=Ct),gt.set(Et,it,Pt,Ct),_t.equals(gt)===!1&&(e.clearColor(Et,it,Pt,Ct),_t.copy(gt))},reset:function(){I=!1,K=null,_t.set(-1,0,0,0)}}}function i(){let I=!1,gt=!1,K=null,_t=null,Et=null;return{setReversed:function(it){if(gt!==it){let Pt=t.get("EXT_clip_control");it?Pt.clipControlEXT(Pt.LOWER_LEFT_EXT,Pt.ZERO_TO_ONE_EXT):Pt.clipControlEXT(Pt.LOWER_LEFT_EXT,Pt.NEGATIVE_ONE_TO_ONE_EXT),gt=it;let Ct=Et;Et=null,this.setClear(Ct)}},getReversed:function(){return gt},setTest:function(it){it?j(e.DEPTH_TEST):xt(e.DEPTH_TEST)},setMask:function(it){K!==it&&!I&&(e.depthMask(it),K=it)},setFunc:function(it){if(gt&&(it=Sb[it]),_t!==it){switch(it){case of:e.depthFunc(e.NEVER);break;case lf:e.depthFunc(e.ALWAYS);break;case cf:e.depthFunc(e.LESS);break;case Do:e.depthFunc(e.LEQUAL);break;case uf:e.depthFunc(e.EQUAL);break;case hf:e.depthFunc(e.GEQUAL);break;case ff:e.depthFunc(e.GREATER);break;case df:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}_t=it}},setLocked:function(it){I=it},setClear:function(it){Et!==it&&(Et=it,gt&&(it=1-it),e.clearDepth(it))},reset:function(){I=!1,K=null,_t=null,Et=null,gt=!1}}}function s(){let I=!1,gt=null,K=null,_t=null,Et=null,it=null,Pt=null,Ct=null,xe=null;return{setTest:function(_e){I||(_e?j(e.STENCIL_TEST):xt(e.STENCIL_TEST))},setMask:function(_e){gt!==_e&&!I&&(e.stencilMask(_e),gt=_e)},setFunc:function(_e,an,hi){(K!==_e||_t!==an||Et!==hi)&&(e.stencilFunc(_e,an,hi),K=_e,_t=an,Et=hi)},setOp:function(_e,an,hi){(it!==_e||Pt!==an||Ct!==hi)&&(e.stencilOp(_e,an,hi),it=_e,Pt=an,Ct=hi)},setLocked:function(_e){I=_e},setClear:function(_e){xe!==_e&&(e.clearStencil(_e),xe=_e)},reset:function(){I=!1,gt=null,K=null,_t=null,Et=null,it=null,Pt=null,Ct=null,xe=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},p={},u={},d=new WeakMap,g=[],b=null,m=!1,f=null,_=null,S=null,v=null,E=null,T=null,w=null,x=new jt(0,0,0),A=0,C=!1,D=null,H=null,k=null,O=null,B=null,J=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,st=0,W=e.getParameter(e.VERSION);W.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec(W)[1]),q=st>=1):W.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),q=st>=2);let Q=null,tt={},Ut=e.getParameter(e.SCISSOR_BOX),wt=e.getParameter(e.VIEWPORT),ce=new Ve().fromArray(Ut),Jt=new Ve().fromArray(wt);function ae(I,gt,K,_t){let Et=new Uint8Array(4),it=e.createTexture();e.bindTexture(I,it),e.texParameteri(I,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(I,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Pt=0;Pt<K;Pt++)I===e.TEXTURE_3D||I===e.TEXTURE_2D_ARRAY?e.texImage3D(gt,0,e.RGBA,1,1,_t,0,e.RGBA,e.UNSIGNED_BYTE,Et):e.texImage2D(gt+Pt,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Et);return it}let Z={};Z[e.TEXTURE_2D]=ae(e.TEXTURE_2D,e.TEXTURE_2D,1),Z[e.TEXTURE_CUBE_MAP]=ae(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[e.TEXTURE_2D_ARRAY]=ae(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Z[e.TEXTURE_3D]=ae(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),j(e.DEPTH_TEST),r.setFunc(Do),lt(!1),ft(_0),j(e.CULL_FACE),at(ns);function j(I){h[I]!==!0&&(e.enable(I),h[I]=!0)}function xt(I){h[I]!==!1&&(e.disable(I),h[I]=!1)}function Ft(I,gt){return u[I]!==gt?(e.bindFramebuffer(I,gt),u[I]=gt,I===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=gt),I===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=gt),!0):!1}function Tt(I,gt){let K=g,_t=!1;if(I){K=d.get(gt),K===void 0&&(K=[],d.set(gt,K));let Et=I.textures;if(K.length!==Et.length||K[0]!==e.COLOR_ATTACHMENT0){for(let it=0,Pt=Et.length;it<Pt;it++)K[it]=e.COLOR_ATTACHMENT0+it;K.length=Et.length,_t=!0}}else K[0]!==e.BACK&&(K[0]=e.BACK,_t=!0);_t&&e.drawBuffers(K)}function Bt(I){return b!==I?(e.useProgram(I),b=I,!0):!1}let ue={[hr]:e.FUNC_ADD,[GM]:e.FUNC_SUBTRACT,[kM]:e.FUNC_REVERSE_SUBTRACT};ue[WM]=e.MIN,ue[XM]=e.MAX;let et={[qM]:e.ZERO,[YM]:e.ONE,[ZM]:e.SRC_COLOR,[S0]:e.SRC_ALPHA,[tb]:e.SRC_ALPHA_SATURATE,[jM]:e.DST_COLOR,[KM]:e.DST_ALPHA,[JM]:e.ONE_MINUS_SRC_COLOR,[M0]:e.ONE_MINUS_SRC_ALPHA,[$M]:e.ONE_MINUS_DST_COLOR,[QM]:e.ONE_MINUS_DST_ALPHA,[eb]:e.CONSTANT_COLOR,[nb]:e.ONE_MINUS_CONSTANT_COLOR,[ib]:e.CONSTANT_ALPHA,[sb]:e.ONE_MINUS_CONSTANT_ALPHA};function at(I,gt,K,_t,Et,it,Pt,Ct,xe,_e){if(I===ns){m===!0&&(xt(e.BLEND),m=!1);return}if(m===!1&&(j(e.BLEND),m=!0),I!==VM){if(I!==f||_e!==C){if((_!==hr||E!==hr)&&(e.blendEquation(e.FUNC_ADD),_=hr,E=hr),_e)switch(I){case Ko:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case v0:e.blendFunc(e.ONE,e.ONE);break;case y0:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case x0:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Gt("WebGLState: Invalid blending: ",I);break}else switch(I){case Ko:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case v0:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case y0:Gt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case x0:Gt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Gt("WebGLState: Invalid blending: ",I);break}S=null,v=null,T=null,w=null,x.set(0,0,0),A=0,f=I,C=_e}return}Et=Et||gt,it=it||K,Pt=Pt||_t,(gt!==_||Et!==E)&&(e.blendEquationSeparate(ue[gt],ue[Et]),_=gt,E=Et),(K!==S||_t!==v||it!==T||Pt!==w)&&(e.blendFuncSeparate(et[K],et[_t],et[it],et[Pt]),S=K,v=_t,T=it,w=Pt),(Ct.equals(x)===!1||xe!==A)&&(e.blendColor(Ct.r,Ct.g,Ct.b,xe),x.copy(Ct),A=xe),f=I,C=!1}function ot(I,gt){I.side===ui?xt(e.CULL_FACE):j(e.CULL_FACE);let K=I.side===Pn;gt&&(K=!K),lt(K),I.blending===Ko&&I.transparent===!1?at(ns):at(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),a.setMask(I.colorWrite);let _t=I.stencilWrite;o.setTest(_t),_t&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ot(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?j(e.SAMPLE_ALPHA_TO_COVERAGE):xt(e.SAMPLE_ALPHA_TO_COVERAGE)}function lt(I){D!==I&&(I?e.frontFace(e.CW):e.frontFace(e.CCW),D=I)}function ft(I){I!==zM?(j(e.CULL_FACE),I!==H&&(I===_0?e.cullFace(e.BACK):I===FM?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):xt(e.CULL_FACE),H=I}function zt(I){I!==k&&(q&&e.lineWidth(I),k=I)}function Ot(I,gt,K){I?(j(e.POLYGON_OFFSET_FILL),(O!==gt||B!==K)&&(O=gt,B=K,r.getReversed()&&(gt=-gt),e.polygonOffset(gt,K))):xt(e.POLYGON_OFFSET_FILL)}function Vt(I){I?j(e.SCISSOR_TEST):xt(e.SCISSOR_TEST)}function Wt(I){I===void 0&&(I=e.TEXTURE0+J-1),Q!==I&&(e.activeTexture(I),Q=I)}function L(I,gt,K){K===void 0&&(Q===null?K=e.TEXTURE0+J-1:K=Q);let _t=tt[K];_t===void 0&&(_t={type:void 0,texture:void 0},tt[K]=_t),(_t.type!==I||_t.texture!==gt)&&(Q!==K&&(e.activeTexture(K),Q=K),e.bindTexture(I,gt||Z[I]),_t.type=I,_t.texture=gt)}function me(){let I=tt[Q];I!==void 0&&I.type!==void 0&&(e.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function St(){try{e.compressedTexImage2D(...arguments)}catch(I){Gt("WebGLState:",I)}}function R(){try{e.compressedTexImage3D(...arguments)}catch(I){Gt("WebGLState:",I)}}function y(){try{e.texSubImage2D(...arguments)}catch(I){Gt("WebGLState:",I)}}function P(){try{e.texSubImage3D(...arguments)}catch(I){Gt("WebGLState:",I)}}function V(){try{e.compressedTexSubImage2D(...arguments)}catch(I){Gt("WebGLState:",I)}}function X(){try{e.compressedTexSubImage3D(...arguments)}catch(I){Gt("WebGLState:",I)}}function rt(){try{e.texStorage2D(...arguments)}catch(I){Gt("WebGLState:",I)}}function ut(){try{e.texStorage3D(...arguments)}catch(I){Gt("WebGLState:",I)}}function Y(){try{e.texImage2D(...arguments)}catch(I){Gt("WebGLState:",I)}}function $(){try{e.texImage3D(...arguments)}catch(I){Gt("WebGLState:",I)}}function pt(I){return p[I]!==void 0?p[I]:e.getParameter(I)}function Nt(I,gt){p[I]!==gt&&(e.pixelStorei(I,gt),p[I]=gt)}function yt(I){ce.equals(I)===!1&&(e.scissor(I.x,I.y,I.z,I.w),ce.copy(I))}function mt(I){Jt.equals(I)===!1&&(e.viewport(I.x,I.y,I.z,I.w),Jt.copy(I))}function Lt(I,gt){let K=c.get(gt);K===void 0&&(K=new WeakMap,c.set(gt,K));let _t=K.get(I);_t===void 0&&(_t=e.getUniformBlockIndex(gt,I.name),K.set(I,_t))}function Ht(I,gt){let _t=c.get(gt).get(I);l.get(gt)!==_t&&(e.uniformBlockBinding(gt,_t,I.__bindingPointIndex),l.set(gt,_t))}function Yt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),h={},p={},Q=null,tt={},u={},d=new WeakMap,g=[],b=null,m=!1,f=null,_=null,S=null,v=null,E=null,T=null,w=null,x=new jt(0,0,0),A=0,C=!1,D=null,H=null,k=null,O=null,B=null,ce.set(0,0,e.canvas.width,e.canvas.height),Jt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:j,disable:xt,bindFramebuffer:Ft,drawBuffers:Tt,useProgram:Bt,setBlending:at,setMaterial:ot,setFlipSided:lt,setCullFace:ft,setLineWidth:zt,setPolygonOffset:Ot,setScissorTest:Vt,activeTexture:Wt,bindTexture:L,unbindTexture:me,compressedTexImage2D:St,compressedTexImage3D:R,texImage2D:Y,texImage3D:$,pixelStorei:Nt,getParameter:pt,updateUBOMapping:Lt,uniformBlockBinding:Ht,texStorage2D:rt,texStorage3D:ut,texSubImage2D:y,texSubImage3D:P,compressedTexSubImage2D:V,compressedTexSubImage3D:X,scissor:yt,viewport:mt,reset:Yt}}function bD(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new dt,h=new WeakMap,p=new Set,u,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(R,y){return g?new OffscreenCanvas(R,y):bc("canvas")}function m(R,y,P){let V=1,X=St(R);if((X.width>P||X.height>P)&&(V=P/Math.max(X.width,X.height)),V<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let rt=Math.floor(V*X.width),ut=Math.floor(V*X.height);u===void 0&&(u=b(rt,ut));let Y=y?b(rt,ut):u;return Y.width=rt,Y.height=ut,Y.getContext("2d").drawImage(R,0,0,rt,ut),kt("WebGLRenderer: Texture has been resized from ("+X.width+"x"+X.height+") to ("+rt+"x"+ut+")."),Y}else return"data"in R&&kt("WebGLRenderer: Image in DataTexture is too big ("+X.width+"x"+X.height+")."),R;return R}function f(R){return R.generateMipmaps}function _(R){e.generateMipmap(R)}function S(R){return R.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?e.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function v(R,y,P,V,X,rt=!1){if(R!==null){if(e[R]!==void 0)return e[R];kt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ut;V&&(ut=t.get("EXT_texture_norm16"),ut||kt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=y;if(y===e.RED&&(P===e.FLOAT&&(Y=e.R32F),P===e.HALF_FLOAT&&(Y=e.R16F),P===e.UNSIGNED_BYTE&&(Y=e.R8),P===e.UNSIGNED_SHORT&&ut&&(Y=ut.R16_EXT),P===e.SHORT&&ut&&(Y=ut.R16_SNORM_EXT)),y===e.RED_INTEGER&&(P===e.UNSIGNED_BYTE&&(Y=e.R8UI),P===e.UNSIGNED_SHORT&&(Y=e.R16UI),P===e.UNSIGNED_INT&&(Y=e.R32UI),P===e.BYTE&&(Y=e.R8I),P===e.SHORT&&(Y=e.R16I),P===e.INT&&(Y=e.R32I)),y===e.RG&&(P===e.FLOAT&&(Y=e.RG32F),P===e.HALF_FLOAT&&(Y=e.RG16F),P===e.UNSIGNED_BYTE&&(Y=e.RG8),P===e.UNSIGNED_SHORT&&ut&&(Y=ut.RG16_EXT),P===e.SHORT&&ut&&(Y=ut.RG16_SNORM_EXT)),y===e.RG_INTEGER&&(P===e.UNSIGNED_BYTE&&(Y=e.RG8UI),P===e.UNSIGNED_SHORT&&(Y=e.RG16UI),P===e.UNSIGNED_INT&&(Y=e.RG32UI),P===e.BYTE&&(Y=e.RG8I),P===e.SHORT&&(Y=e.RG16I),P===e.INT&&(Y=e.RG32I)),y===e.RGB_INTEGER&&(P===e.UNSIGNED_BYTE&&(Y=e.RGB8UI),P===e.UNSIGNED_SHORT&&(Y=e.RGB16UI),P===e.UNSIGNED_INT&&(Y=e.RGB32UI),P===e.BYTE&&(Y=e.RGB8I),P===e.SHORT&&(Y=e.RGB16I),P===e.INT&&(Y=e.RGB32I)),y===e.RGBA_INTEGER&&(P===e.UNSIGNED_BYTE&&(Y=e.RGBA8UI),P===e.UNSIGNED_SHORT&&(Y=e.RGBA16UI),P===e.UNSIGNED_INT&&(Y=e.RGBA32UI),P===e.BYTE&&(Y=e.RGBA8I),P===e.SHORT&&(Y=e.RGBA16I),P===e.INT&&(Y=e.RGBA32I)),y===e.RGB&&(P===e.UNSIGNED_SHORT&&ut&&(Y=ut.RGB16_EXT),P===e.SHORT&&ut&&(Y=ut.RGB16_SNORM_EXT),P===e.UNSIGNED_INT_5_9_9_9_REV&&(Y=e.RGB9_E5),P===e.UNSIGNED_INT_10F_11F_11F_REV&&(Y=e.R11F_G11F_B10F)),y===e.RGBA){let $=rt?Mc:fe.getTransfer(X);P===e.FLOAT&&(Y=e.RGBA32F),P===e.HALF_FLOAT&&(Y=e.RGBA16F),P===e.UNSIGNED_BYTE&&(Y=$===Me?e.SRGB8_ALPHA8:e.RGBA8),P===e.UNSIGNED_SHORT&&ut&&(Y=ut.RGBA16_EXT),P===e.SHORT&&ut&&(Y=ut.RGBA16_SNORM_EXT),P===e.UNSIGNED_SHORT_4_4_4_4&&(Y=e.RGBA4),P===e.UNSIGNED_SHORT_5_5_5_1&&(Y=e.RGB5_A1)}return(Y===e.R16F||Y===e.R32F||Y===e.RG16F||Y===e.RG32F||Y===e.RGBA16F||Y===e.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function E(R,y){let P;return R?y===null||y===zi||y===jo?P=e.DEPTH24_STENCIL8:y===Fi?P=e.DEPTH32F_STENCIL8:y===Qo&&(P=e.DEPTH24_STENCIL8,kt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===zi||y===jo?P=e.DEPTH_COMPONENT24:y===Fi?P=e.DEPTH_COMPONENT32F:y===Qo&&(P=e.DEPTH_COMPONENT16),P}function T(R,y){return f(R)===!0||R.isFramebufferTexture&&R.minFilter!==mn&&R.minFilter!==ln?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function w(R){let y=R.target;y.removeEventListener("dispose",w),A(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&p.delete(y)}function x(R){let y=R.target;y.removeEventListener("dispose",x),D(y)}function A(R){let y=i.get(R);if(y.__webglInit===void 0)return;let P=R.source,V=d.get(P);if(V){let X=V[y.__cacheKey];X.usedTimes--,X.usedTimes===0&&C(R),Object.keys(V).length===0&&d.delete(P)}i.remove(R)}function C(R){let y=i.get(R);e.deleteTexture(y.__webglTexture);let P=R.source,V=d.get(P);delete V[y.__cacheKey],r.memory.textures--}function D(R){let y=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(y.__webglFramebuffer[V]))for(let X=0;X<y.__webglFramebuffer[V].length;X++)e.deleteFramebuffer(y.__webglFramebuffer[V][X]);else e.deleteFramebuffer(y.__webglFramebuffer[V]);y.__webglDepthbuffer&&e.deleteRenderbuffer(y.__webglDepthbuffer[V])}else{if(Array.isArray(y.__webglFramebuffer))for(let V=0;V<y.__webglFramebuffer.length;V++)e.deleteFramebuffer(y.__webglFramebuffer[V]);else e.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&e.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&e.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let V=0;V<y.__webglColorRenderbuffer.length;V++)y.__webglColorRenderbuffer[V]&&e.deleteRenderbuffer(y.__webglColorRenderbuffer[V]);y.__webglDepthRenderbuffer&&e.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let P=R.textures;for(let V=0,X=P.length;V<X;V++){let rt=i.get(P[V]);rt.__webglTexture&&(e.deleteTexture(rt.__webglTexture),r.memory.textures--),i.remove(P[V])}i.remove(R)}let H=0;function k(){H=0}function O(){return H}function B(R){H=R}function J(){let R=H;return R>=s.maxTextures&&kt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),H+=1,R}function q(R){let y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function st(R,y){let P=i.get(R);if(R.isVideoTexture&&L(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&P.__version!==R.version){let V=R.image;if(V===null)kt("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)kt("WebGLRenderer: Texture marked for update but image is incomplete");else{xt(P,R,y);return}}else R.isExternalTexture&&(P.__webglTexture=R.sourceTexture?R.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,P.__webglTexture,e.TEXTURE0+y)}function W(R,y){let P=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&P.__version!==R.version){xt(P,R,y);return}else R.isExternalTexture&&(P.__webglTexture=R.sourceTexture?R.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,P.__webglTexture,e.TEXTURE0+y)}function Q(R,y){let P=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&P.__version!==R.version){xt(P,R,y);return}n.bindTexture(e.TEXTURE_3D,P.__webglTexture,e.TEXTURE0+y)}function tt(R,y){let P=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&P.__version!==R.version){Ft(P,R,y);return}n.bindTexture(e.TEXTURE_CUBE_MAP,P.__webglTexture,e.TEXTURE0+y)}let Ut={[$i]:e.REPEAT,[Ai]:e.CLAMP_TO_EDGE,[pf]:e.MIRRORED_REPEAT},wt={[mn]:e.NEAREST,[ob]:e.NEAREST_MIPMAP_NEAREST,[Wc]:e.NEAREST_MIPMAP_LINEAR,[ln]:e.LINEAR,[Xf]:e.LINEAR_MIPMAP_NEAREST,[is]:e.LINEAR_MIPMAP_LINEAR},ce={[hb]:e.NEVER,[gb]:e.ALWAYS,[fb]:e.LESS,[Cd]:e.LEQUAL,[db]:e.EQUAL,[Dd]:e.GEQUAL,[pb]:e.GREATER,[mb]:e.NOTEQUAL};function Jt(R,y){if(y.type===Fi&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===ln||y.magFilter===Xf||y.magFilter===Wc||y.magFilter===is||y.minFilter===ln||y.minFilter===Xf||y.minFilter===Wc||y.minFilter===is)&&kt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(R,e.TEXTURE_WRAP_S,Ut[y.wrapS]),e.texParameteri(R,e.TEXTURE_WRAP_T,Ut[y.wrapT]),(R===e.TEXTURE_3D||R===e.TEXTURE_2D_ARRAY)&&e.texParameteri(R,e.TEXTURE_WRAP_R,Ut[y.wrapR]),e.texParameteri(R,e.TEXTURE_MAG_FILTER,wt[y.magFilter]),e.texParameteri(R,e.TEXTURE_MIN_FILTER,wt[y.minFilter]),y.compareFunction&&(e.texParameteri(R,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(R,e.TEXTURE_COMPARE_FUNC,ce[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===mn||y.minFilter!==Wc&&y.minFilter!==is||y.type===Fi&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){let P=t.get("EXT_texture_filter_anisotropic");e.texParameterf(R,P.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function ae(R,y){let P=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",w));let V=y.source,X=d.get(V);X===void 0&&(X={},d.set(V,X));let rt=q(y);if(rt!==R.__cacheKey){X[rt]===void 0&&(X[rt]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,P=!0),X[rt].usedTimes++;let ut=X[R.__cacheKey];ut!==void 0&&(X[R.__cacheKey].usedTimes--,ut.usedTimes===0&&C(y)),R.__cacheKey=rt,R.__webglTexture=X[rt].texture}return P}function Z(R,y,P){return Math.floor(Math.floor(R/P)/y)}function j(R,y,P,V){let rt=R.updateRanges;if(rt.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,y.width,y.height,P,V,y.data);else{rt.sort((Nt,yt)=>Nt.start-yt.start);let ut=0;for(let Nt=1;Nt<rt.length;Nt++){let yt=rt[ut],mt=rt[Nt],Lt=yt.start+yt.count,Ht=Z(mt.start,y.width,4),Yt=Z(yt.start,y.width,4);mt.start<=Lt+1&&Ht===Yt&&Z(mt.start+mt.count-1,y.width,4)===Ht?yt.count=Math.max(yt.count,mt.start+mt.count-yt.start):(++ut,rt[ut]=mt)}rt.length=ut+1;let Y=n.getParameter(e.UNPACK_ROW_LENGTH),$=n.getParameter(e.UNPACK_SKIP_PIXELS),pt=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,y.width);for(let Nt=0,yt=rt.length;Nt<yt;Nt++){let mt=rt[Nt],Lt=Math.floor(mt.start/4),Ht=Math.ceil(mt.count/4),Yt=Lt%y.width,I=Math.floor(Lt/y.width),gt=Ht,K=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,Yt),n.pixelStorei(e.UNPACK_SKIP_ROWS,I),n.texSubImage2D(e.TEXTURE_2D,0,Yt,I,gt,K,P,V,y.data)}R.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,Y),n.pixelStorei(e.UNPACK_SKIP_PIXELS,$),n.pixelStorei(e.UNPACK_SKIP_ROWS,pt)}}function xt(R,y,P){let V=e.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(V=e.TEXTURE_2D_ARRAY),y.isData3DTexture&&(V=e.TEXTURE_3D);let X=ae(R,y),rt=y.source;n.bindTexture(V,R.__webglTexture,e.TEXTURE0+P);let ut=i.get(rt);if(rt.version!==ut.__version||X===!0){if(n.activeTexture(e.TEXTURE0+P),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let K=fe.getPrimaries(fe.workingColorSpace),_t=y.colorSpace===Is?null:fe.getPrimaries(y.colorSpace),Et=y.colorSpace===Is||K===_t?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}n.pixelStorei(e.UNPACK_ALIGNMENT,y.unpackAlignment);let $=m(y.image,!1,s.maxTextureSize);$=me(y,$);let pt=a.convert(y.format,y.colorSpace),Nt=a.convert(y.type),yt=v(y.internalFormat,pt,Nt,y.normalized,y.colorSpace,y.isVideoTexture);Jt(V,y);let mt,Lt=y.mipmaps,Ht=y.isVideoTexture!==!0,Yt=ut.__version===void 0||X===!0,I=rt.dataReady,gt=T(y,$);if(y.isDepthTexture)yt=E(y.format===Ra,y.type),Yt&&(Ht?n.texStorage2D(e.TEXTURE_2D,1,yt,$.width,$.height):n.texImage2D(e.TEXTURE_2D,0,yt,$.width,$.height,0,pt,Nt,null));else if(y.isDataTexture)if(Lt.length>0){Ht&&Yt&&n.texStorage2D(e.TEXTURE_2D,gt,yt,Lt[0].width,Lt[0].height);for(let K=0,_t=Lt.length;K<_t;K++)mt=Lt[K],Ht?I&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,mt.width,mt.height,pt,Nt,mt.data):n.texImage2D(e.TEXTURE_2D,K,yt,mt.width,mt.height,0,pt,Nt,mt.data);y.generateMipmaps=!1}else Ht?(Yt&&n.texStorage2D(e.TEXTURE_2D,gt,yt,$.width,$.height),I&&j(y,$,pt,Nt)):n.texImage2D(e.TEXTURE_2D,0,yt,$.width,$.height,0,pt,Nt,$.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ht&&Yt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,gt,yt,Lt[0].width,Lt[0].height,$.depth);for(let K=0,_t=Lt.length;K<_t;K++)if(mt=Lt[K],y.format!==wi)if(pt!==null)if(Ht){if(I)if(y.layerUpdates.size>0){let Et=W0(mt.width,mt.height,y.format,y.type);for(let it of y.layerUpdates){let Pt=mt.data.subarray(it*Et/mt.data.BYTES_PER_ELEMENT,(it+1)*Et/mt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,it,mt.width,mt.height,1,pt,Pt)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,0,mt.width,mt.height,$.depth,pt,mt.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,K,yt,mt.width,mt.height,$.depth,0,mt.data,0,0);else kt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?I&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,0,mt.width,mt.height,$.depth,pt,Nt,mt.data):n.texImage3D(e.TEXTURE_2D_ARRAY,K,yt,mt.width,mt.height,$.depth,0,pt,Nt,mt.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Ht&&Yt&&n.texStorage2D(e.TEXTURE_2D,gt,yt,Lt[0].width,Lt[0].height);for(let K=0,_t=Lt.length;K<_t;K++)mt=Lt[K],y.format!==wi?pt!==null?Ht?I&&n.compressedTexSubImage2D(e.TEXTURE_2D,K,0,0,mt.width,mt.height,pt,mt.data):n.compressedTexImage2D(e.TEXTURE_2D,K,yt,mt.width,mt.height,0,mt.data):kt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?I&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,mt.width,mt.height,pt,Nt,mt.data):n.texImage2D(e.TEXTURE_2D,K,yt,mt.width,mt.height,0,pt,Nt,mt.data)}else if(y.isDataArrayTexture)if(Ht){if(Yt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,gt,yt,$.width,$.height,$.depth),I)if(y.layerUpdates.size>0){let K=W0($.width,$.height,y.format,y.type);for(let _t of y.layerUpdates){let Et=$.data.subarray(_t*K/$.data.BYTES_PER_ELEMENT,(_t+1)*K/$.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,_t,$.width,$.height,1,pt,Nt,Et)}y.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,$.width,$.height,$.depth,pt,Nt,$.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,yt,$.width,$.height,$.depth,0,pt,Nt,$.data);else if(y.isData3DTexture)Ht?(Yt&&n.texStorage3D(e.TEXTURE_3D,gt,yt,$.width,$.height,$.depth),I&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,$.width,$.height,$.depth,pt,Nt,$.data)):n.texImage3D(e.TEXTURE_3D,0,yt,$.width,$.height,$.depth,0,pt,Nt,$.data);else if(y.isFramebufferTexture){if(Yt)if(Ht)n.texStorage2D(e.TEXTURE_2D,gt,yt,$.width,$.height);else{let K=$.width,_t=$.height;for(let Et=0;Et<gt;Et++)n.texImage2D(e.TEXTURE_2D,Et,yt,K,_t,0,pt,Nt,null),K>>=1,_t>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in e){let K=e.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),$.parentNode!==K){K.appendChild($),p.add(y),K.onpaint=_t=>{let Et=_t.changedElements;for(let it of p)Et.includes(it.image)&&(it.needsUpdate=!0)},K.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,$);else{let Et=e.RGBA,it=e.RGBA,Pt=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,Et,it,Pt,$)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Lt.length>0){if(Ht&&Yt){let K=St(Lt[0]);n.texStorage2D(e.TEXTURE_2D,gt,yt,K.width,K.height)}for(let K=0,_t=Lt.length;K<_t;K++)mt=Lt[K],Ht?I&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,pt,Nt,mt):n.texImage2D(e.TEXTURE_2D,K,yt,pt,Nt,mt);y.generateMipmaps=!1}else if(Ht){if(Yt){let K=St($);n.texStorage2D(e.TEXTURE_2D,gt,yt,K.width,K.height)}I&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,pt,Nt,$)}else n.texImage2D(e.TEXTURE_2D,0,yt,pt,Nt,$);f(y)&&_(V),ut.__version=rt.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function Ft(R,y,P){if(y.image.length!==6)return;let V=ae(R,y),X=y.source;n.bindTexture(e.TEXTURE_CUBE_MAP,R.__webglTexture,e.TEXTURE0+P);let rt=i.get(X);if(X.version!==rt.__version||V===!0){n.activeTexture(e.TEXTURE0+P);let ut=fe.getPrimaries(fe.workingColorSpace),Y=y.colorSpace===Is?null:fe.getPrimaries(y.colorSpace),$=y.colorSpace===Is||ut===Y?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,y.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,$);let pt=y.isCompressedTexture||y.image[0].isCompressedTexture,Nt=y.image[0]&&y.image[0].isDataTexture,yt=[];for(let it=0;it<6;it++)!pt&&!Nt?yt[it]=m(y.image[it],!0,s.maxCubemapSize):yt[it]=Nt?y.image[it].image:y.image[it],yt[it]=me(y,yt[it]);let mt=yt[0],Lt=a.convert(y.format,y.colorSpace),Ht=a.convert(y.type),Yt=v(y.internalFormat,Lt,Ht,y.normalized,y.colorSpace),I=y.isVideoTexture!==!0,gt=rt.__version===void 0||V===!0,K=X.dataReady,_t=T(y,mt);Jt(e.TEXTURE_CUBE_MAP,y);let Et;if(pt){I&&gt&&n.texStorage2D(e.TEXTURE_CUBE_MAP,_t,Yt,mt.width,mt.height);for(let it=0;it<6;it++){Et=yt[it].mipmaps;for(let Pt=0;Pt<Et.length;Pt++){let Ct=Et[Pt];y.format!==wi?Lt!==null?I?K&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt,0,0,Ct.width,Ct.height,Lt,Ct.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt,Yt,Ct.width,Ct.height,0,Ct.data):kt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?K&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt,0,0,Ct.width,Ct.height,Lt,Ht,Ct.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt,Yt,Ct.width,Ct.height,0,Lt,Ht,Ct.data)}}}else{if(Et=y.mipmaps,I&&gt){Et.length>0&&_t++;let it=St(yt[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,_t,Yt,it.width,it.height)}for(let it=0;it<6;it++)if(Nt){I?K&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,yt[it].width,yt[it].height,Lt,Ht,yt[it].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,Yt,yt[it].width,yt[it].height,0,Lt,Ht,yt[it].data);for(let Pt=0;Pt<Et.length;Pt++){let xe=Et[Pt].image[it].image;I?K&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt+1,0,0,xe.width,xe.height,Lt,Ht,xe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt+1,Yt,xe.width,xe.height,0,Lt,Ht,xe.data)}}else{I?K&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,Lt,Ht,yt[it]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,Yt,Lt,Ht,yt[it]);for(let Pt=0;Pt<Et.length;Pt++){let Ct=Et[Pt];I?K&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt+1,0,0,Lt,Ht,Ct.image[it]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+it,Pt+1,Yt,Lt,Ht,Ct.image[it])}}}f(y)&&_(e.TEXTURE_CUBE_MAP),rt.__version=X.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function Tt(R,y,P,V,X,rt){let ut=a.convert(P.format,P.colorSpace),Y=a.convert(P.type),$=v(P.internalFormat,ut,Y,P.normalized,P.colorSpace),pt=i.get(y),Nt=i.get(P);if(Nt.__renderTarget=y,!pt.__hasExternalTextures){let yt=Math.max(1,y.width>>rt),mt=Math.max(1,y.height>>rt);X===e.TEXTURE_3D||X===e.TEXTURE_2D_ARRAY?n.texImage3D(X,rt,$,yt,mt,y.depth,0,ut,Y,null):n.texImage2D(X,rt,$,yt,mt,0,ut,Y,null)}n.bindFramebuffer(e.FRAMEBUFFER,R),Wt(y)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,V,X,Nt.__webglTexture,0,Vt(y)):(X===e.TEXTURE_2D||X>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&X<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,V,X,Nt.__webglTexture,rt),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Bt(R,y,P){if(e.bindRenderbuffer(e.RENDERBUFFER,R),y.depthBuffer){let V=y.depthTexture,X=V&&V.isDepthTexture?V.type:null,rt=E(y.stencilBuffer,X),ut=y.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Wt(y)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Vt(y),rt,y.width,y.height):P?e.renderbufferStorageMultisample(e.RENDERBUFFER,Vt(y),rt,y.width,y.height):e.renderbufferStorage(e.RENDERBUFFER,rt,y.width,y.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ut,e.RENDERBUFFER,R)}else{let V=y.textures;for(let X=0;X<V.length;X++){let rt=V[X],ut=a.convert(rt.format,rt.colorSpace),Y=a.convert(rt.type),$=v(rt.internalFormat,ut,Y,rt.normalized,rt.colorSpace);Wt(y)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Vt(y),$,y.width,y.height):P?e.renderbufferStorageMultisample(e.RENDERBUFFER,Vt(y),$,y.width,y.height):e.renderbufferStorage(e.RENDERBUFFER,$,y.width,y.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ue(R,y,P){let V=y.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let X=i.get(y.depthTexture);if(X.__renderTarget=y,(!X.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),V){if(X.__webglInit===void 0&&(X.__webglInit=!0,y.depthTexture.addEventListener("dispose",w)),X.__webglTexture===void 0){X.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,X.__webglTexture),Jt(e.TEXTURE_CUBE_MAP,y.depthTexture);let pt=a.convert(y.depthTexture.format),Nt=a.convert(y.depthTexture.type),yt;y.depthTexture.format===ts?yt=e.DEPTH_COMPONENT24:y.depthTexture.format===Ra&&(yt=e.DEPTH24_STENCIL8);for(let mt=0;mt<6;mt++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,yt,y.width,y.height,0,pt,Nt,null)}}else st(y.depthTexture,0);let rt=X.__webglTexture,ut=Vt(y),Y=V?e.TEXTURE_CUBE_MAP_POSITIVE_X+P:e.TEXTURE_2D,$=y.depthTexture.format===Ra?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(y.depthTexture.format===ts)Wt(y)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,Y,rt,0,ut):e.framebufferTexture2D(e.FRAMEBUFFER,$,Y,rt,0);else if(y.depthTexture.format===Ra)Wt(y)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,Y,rt,0,ut):e.framebufferTexture2D(e.FRAMEBUFFER,$,Y,rt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function et(R){let y=i.get(R),P=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){let V=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),V){let X=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,V.removeEventListener("dispose",X)};V.addEventListener("dispose",X),y.__depthDisposeCallback=X}y.__boundDepthTexture=V}if(R.depthTexture&&!y.__autoAllocateDepthBuffer)if(P)for(let V=0;V<6;V++)ue(y.__webglFramebuffer[V],R,V);else{let V=R.texture.mipmaps;V&&V.length>0?ue(y.__webglFramebuffer[0],R,0):ue(y.__webglFramebuffer,R,0)}else if(P){y.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(n.bindFramebuffer(e.FRAMEBUFFER,y.__webglFramebuffer[V]),y.__webglDepthbuffer[V]===void 0)y.__webglDepthbuffer[V]=e.createRenderbuffer(),Bt(y.__webglDepthbuffer[V],R,!1);else{let X=R.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=y.__webglDepthbuffer[V];e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,X,e.RENDERBUFFER,rt)}}else{let V=R.texture.mipmaps;if(V&&V.length>0?n.bindFramebuffer(e.FRAMEBUFFER,y.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=e.createRenderbuffer(),Bt(y.__webglDepthbuffer,R,!1);else{let X=R.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=y.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,X,e.RENDERBUFFER,rt)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function at(R,y,P){let V=i.get(R);y!==void 0&&Tt(V.__webglFramebuffer,R,R.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),P!==void 0&&et(R)}function ot(R){let y=R.texture,P=i.get(R),V=i.get(y);R.addEventListener("dispose",x);let X=R.textures,rt=R.isWebGLCubeRenderTarget===!0,ut=X.length>1;if(ut||(V.__webglTexture===void 0&&(V.__webglTexture=e.createTexture()),V.__version=y.version,r.memory.textures++),rt){P.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(y.mipmaps&&y.mipmaps.length>0){P.__webglFramebuffer[Y]=[];for(let $=0;$<y.mipmaps.length;$++)P.__webglFramebuffer[Y][$]=e.createFramebuffer()}else P.__webglFramebuffer[Y]=e.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){P.__webglFramebuffer=[];for(let Y=0;Y<y.mipmaps.length;Y++)P.__webglFramebuffer[Y]=e.createFramebuffer()}else P.__webglFramebuffer=e.createFramebuffer();if(ut)for(let Y=0,$=X.length;Y<$;Y++){let pt=i.get(X[Y]);pt.__webglTexture===void 0&&(pt.__webglTexture=e.createTexture(),r.memory.textures++)}if(R.samples>0&&Wt(R)===!1){P.__webglMultisampledFramebuffer=e.createFramebuffer(),P.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,P.__webglMultisampledFramebuffer);for(let Y=0;Y<X.length;Y++){let $=X[Y];P.__webglColorRenderbuffer[Y]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,P.__webglColorRenderbuffer[Y]);let pt=a.convert($.format,$.colorSpace),Nt=a.convert($.type),yt=v($.internalFormat,pt,Nt,$.normalized,$.colorSpace,R.isXRRenderTarget===!0),mt=Vt(R);e.renderbufferStorageMultisample(e.RENDERBUFFER,mt,yt,R.width,R.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Y,e.RENDERBUFFER,P.__webglColorRenderbuffer[Y])}e.bindRenderbuffer(e.RENDERBUFFER,null),R.depthBuffer&&(P.__webglDepthRenderbuffer=e.createRenderbuffer(),Bt(P.__webglDepthRenderbuffer,R,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(rt){n.bindTexture(e.TEXTURE_CUBE_MAP,V.__webglTexture),Jt(e.TEXTURE_CUBE_MAP,y);for(let Y=0;Y<6;Y++)if(y.mipmaps&&y.mipmaps.length>0)for(let $=0;$<y.mipmaps.length;$++)Tt(P.__webglFramebuffer[Y][$],R,y,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,$);else Tt(P.__webglFramebuffer[Y],R,y,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);f(y)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ut){for(let Y=0,$=X.length;Y<$;Y++){let pt=X[Y],Nt=i.get(pt),yt=e.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(yt=R.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(yt,Nt.__webglTexture),Jt(yt,pt),Tt(P.__webglFramebuffer,R,pt,e.COLOR_ATTACHMENT0+Y,yt,0),f(pt)&&_(yt)}n.unbindTexture()}else{let Y=e.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Y=R.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(Y,V.__webglTexture),Jt(Y,y),y.mipmaps&&y.mipmaps.length>0)for(let $=0;$<y.mipmaps.length;$++)Tt(P.__webglFramebuffer[$],R,y,e.COLOR_ATTACHMENT0,Y,$);else Tt(P.__webglFramebuffer,R,y,e.COLOR_ATTACHMENT0,Y,0);f(y)&&_(Y),n.unbindTexture()}R.depthBuffer&&et(R)}function lt(R){let y=R.textures;for(let P=0,V=y.length;P<V;P++){let X=y[P];if(f(X)){let rt=S(R),ut=i.get(X).__webglTexture;n.bindTexture(rt,ut),_(rt),n.unbindTexture()}}}let ft=[],zt=[];function Ot(R){if(R.samples>0){if(Wt(R)===!1){let y=R.textures,P=R.width,V=R.height,X=e.COLOR_BUFFER_BIT,rt=R.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ut=i.get(R),Y=y.length>1;if(Y)for(let pt=0;pt<y.length;pt++)n.bindFramebuffer(e.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+pt,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ut.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+pt,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer);let $=R.texture.mipmaps;$&&$.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let pt=0;pt<y.length;pt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(X|=e.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(X|=e.STENCIL_BUFFER_BIT)),Y){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ut.__webglColorRenderbuffer[pt]);let Nt=i.get(y[pt]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Nt,0)}e.blitFramebuffer(0,0,P,V,0,0,P,V,X,e.NEAREST),l===!0&&(ft.length=0,zt.length=0,ft.push(e.COLOR_ATTACHMENT0+pt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(ft.push(rt),zt.push(rt),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,zt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ft))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),Y)for(let pt=0;pt<y.length;pt++){n.bindFramebuffer(e.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+pt,e.RENDERBUFFER,ut.__webglColorRenderbuffer[pt]);let Nt=i.get(y[pt]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ut.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+pt,e.TEXTURE_2D,Nt,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let y=R.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[y])}}}function Vt(R){return Math.min(s.maxSamples,R.samples)}function Wt(R){let y=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function L(R){let y=r.render.frame;h.get(R)!==y&&(h.set(R,y),R.update())}function me(R,y){let P=R.colorSpace,V=R.format,X=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||P!==Sc&&P!==Is&&(fe.getTransfer(P)===Me?(V!==wi||X!==Zn)&&kt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Gt("WebGLTextures: Unsupported texture color space:",P)),y}function St(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=k,this.getTextureUnits=O,this.setTextureUnits=B,this.setTexture2D=st,this.setTexture2DArray=W,this.setTexture3D=Q,this.setTextureCube=tt,this.rebindTextures=at,this.setupRenderTarget=ot,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=et,this.setupFrameBufferTexture=Tt,this.useMultisampledRTT=Wt,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function ED(e,t){function n(i,s=Is){let a,r=fe.getTransfer(s);if(i===Zn)return e.UNSIGNED_BYTE;if(i===Yf)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Zf)return e.UNSIGNED_SHORT_5_5_5_1;if(i===N0)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===I0)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===L0)return e.BYTE;if(i===U0)return e.SHORT;if(i===Qo)return e.UNSIGNED_SHORT;if(i===qf)return e.INT;if(i===zi)return e.UNSIGNED_INT;if(i===Fi)return e.FLOAT;if(i===Hi)return e.HALF_FLOAT;if(i===O0)return e.ALPHA;if(i===P0)return e.RGB;if(i===wi)return e.RGBA;if(i===ts)return e.DEPTH_COMPONENT;if(i===Ra)return e.DEPTH_STENCIL;if(i===B0)return e.RED;if(i===Jf)return e.RED_INTEGER;if(i===Ca)return e.RG;if(i===Kf)return e.RG_INTEGER;if(i===Qf)return e.RGBA_INTEGER;if(i===Xc||i===qc||i===Yc||i===Zc)if(r===Me)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Xc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===qc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Yc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Zc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Xc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===qc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Yc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Zc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===jf||i===$f||i===td||i===ed)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===jf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===$f)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===td)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ed)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===nd||i===id||i===sd||i===ad||i===rd||i===Jc||i===od)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===nd||i===id)return r===Me?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===sd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===ad)return a.COMPRESSED_R11_EAC;if(i===rd)return a.COMPRESSED_SIGNED_R11_EAC;if(i===Jc)return a.COMPRESSED_RG11_EAC;if(i===od)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===ld||i===cd||i===ud||i===hd||i===fd||i===dd||i===pd||i===md||i===gd||i===_d||i===vd||i===yd||i===xd||i===Sd)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===ld)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===cd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ud)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===hd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===fd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===dd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===pd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===md)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===gd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===_d)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===vd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===yd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===xd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Sd)return r===Me?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Md||i===bd||i===Ed)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===Md)return r===Me?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===bd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ed)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Td||i===Ad||i===Kc||i===wd)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===Td)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Ad)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Kc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===wd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===jo?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var TD=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,AD=`
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

}`,s_=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new Cc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new li({vertexShader:TD,fragmentShader:AD,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Je(new ur(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},a_=class extends es{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,h=null,p=null,u=null,d=null,g=null,b=typeof XRWebGLBinding<"u",m=new s_,f={},_=n.getContextAttributes(),S=null,v=null,E=[],T=[],w=new dt,x=null,A=null,C=new An;C.viewport=new Ve;let D=new An;D.viewport=new Ve;let H=[C,D],k=new Gf,O=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let j=E[Z];return j===void 0&&(j=new Oo,E[Z]=j),j.getTargetRaySpace()},this.getControllerGrip=function(Z){let j=E[Z];return j===void 0&&(j=new Oo,E[Z]=j),j.getGripSpace()},this.getHand=function(Z){let j=E[Z];return j===void 0&&(j=new Oo,E[Z]=j),j.getHandSpace()};function J(Z){let j=T.indexOf(Z.inputSource);if(j===-1)return;let xt=E[j];xt!==void 0&&(xt.update(Z.inputSource,Z.frame,c||r),xt.dispatchEvent({type:Z.type,data:Z.inputSource}))}function q(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",st);for(let Z=0;Z<E.length;Z++){let j=T[Z];j!==null&&(T[Z]=null,E[Z].disconnect(j))}O=null,B=null,m.reset();for(let Z in f)delete f[Z];if(t.setRenderTarget(S),d=null,u=null,p=null,s=null,v=null,ae.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),A!==null){let Z=A.camera;Z.fov=A.fov,Z.zoom=A.zoom,Z.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){a=Z,i.isPresenting===!0&&kt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&kt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&b&&(p=new XRWebGLBinding(s,n)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",q),s.addEventListener("inputsourceschange",st),_.xrCompatible!==!0&&await n.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Ft=null,Tt=null;_.depth&&(Tt=_.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,xt=_.stencil?Ra:ts,Ft=_.stencil?jo:zi);let Bt={colorFormat:n.RGBA8,depthFormat:Tt,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(Bt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),v=new Yn(u.textureWidth,u.textureHeight,{format:wi,type:Zn,depthTexture:new xa(u.textureWidth,u.textureHeight,Ft,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xt={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,n,xt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new Yn(d.framebufferWidth,d.framebufferHeight,{format:wi,type:Zn,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),ae.setContext(s),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function st(Z){for(let j=0;j<Z.removed.length;j++){let xt=Z.removed[j],Ft=T.indexOf(xt);Ft>=0&&(T[Ft]=null,E[Ft].disconnect(xt))}for(let j=0;j<Z.added.length;j++){let xt=Z.added[j],Ft=T.indexOf(xt);if(Ft===-1){for(let Bt=0;Bt<E.length;Bt++)if(Bt>=T.length){T.push(xt),Ft=Bt;break}else if(T[Bt]===null){T[Bt]=xt,Ft=Bt;break}if(Ft===-1)break}let Tt=E[Ft];Tt&&Tt.connect(xt)}}let W=new N,Q=new N;function tt(Z,j,xt){W.setFromMatrixPosition(j.matrixWorld),Q.setFromMatrixPosition(xt.matrixWorld);let Ft=W.distanceTo(Q),Tt=j.projectionMatrix.elements,Bt=xt.projectionMatrix.elements,ue=Tt[14]/(Tt[10]-1),et=Tt[14]/(Tt[10]+1),at=(Tt[9]+1)/Tt[5],ot=(Tt[9]-1)/Tt[5],lt=(Tt[8]-1)/Tt[0],ft=(Bt[8]+1)/Bt[0],zt=ue*lt,Ot=ue*ft,Vt=Ft/(-lt+ft),Wt=Vt*-lt;if(j.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(Wt),Z.translateZ(Vt),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Tt[10]===-1)Z.projectionMatrix.copy(j.projectionMatrix),Z.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let L=ue+Vt,me=et+Vt,St=zt-Wt,R=Ot+(Ft-Wt),y=at*et/me*L,P=ot*et/me*L;Z.projectionMatrix.makePerspective(St,R,y,P,L,me),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Ut(Z,j){j===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(j.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let j=Z.near,xt=Z.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(xt=m.depthFar)),k.near=D.near=C.near=j,k.far=D.far=C.far=xt,(O!==k.near||B!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),O=k.near,B=k.far),k.layers.mask=Z.layers.mask|6,C.layers.mask=k.layers.mask&-5,D.layers.mask=k.layers.mask&-3;let Ft=Z.parent,Tt=k.cameras;Ut(k,Ft);for(let Bt=0;Bt<Tt.length;Bt++)Ut(Tt[Bt],Ft);Tt.length===2?tt(k,C,D):k.projectionMatrix.copy(C.projectionMatrix),A===null&&Z.isPerspectiveCamera&&(A={camera:Z,fov:Z.fov,zoom:Z.zoom}),wt(Z,k,Ft)};function wt(Z,j,xt){xt===null?Z.matrix.copy(j.matrixWorld):(Z.matrix.copy(xt.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(j.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(j.projectionMatrix),Z.projectionMatrixInverse.copy(j.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=gf*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(Z){l=Z,u!==null&&(u.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(Z){return f[Z]};let ce=null;function Jt(Z,j){if(h=j.getViewerPose(c||r),g=j,h!==null){let xt=h.views;d!==null&&(t.setRenderTargetFramebuffer(v,d.framebuffer),t.setRenderTarget(v));let Ft=!1;xt.length!==k.cameras.length&&(k.cameras.length=0,Ft=!0);for(let et=0;et<xt.length;et++){let at=xt[et],ot=null;if(d!==null)ot=d.getViewport(at);else{let ft=p.getViewSubImage(u,at);ot=ft.viewport,et===0&&(t.setRenderTargetTextures(v,ft.colorTexture,ft.depthStencilTexture),t.setRenderTarget(v))}let lt=H[et];lt===void 0&&(lt=new An,lt.layers.enable(et),lt.viewport=new Ve,H[et]=lt),lt.matrix.fromArray(at.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(at.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(ot.x,ot.y,ot.width,ot.height),et===0&&(k.matrix.copy(lt.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Ft===!0&&k.cameras.push(lt)}let Tt=s.enabledFeatures;if(Tt&&Tt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){p=i.getBinding();let et=p.getDepthInformation(xt[0]);et&&et.isValid&&et.texture&&m.init(et,s.renderState)}if(Tt&&Tt.includes("camera-access")&&b){t.state.unbindTexture(),p=i.getBinding();for(let et=0;et<xt.length;et++){let at=xt[et].camera;if(at){let ot=f[at];ot||(ot=new Cc,f[at]=ot);let lt=p.getCameraImage(at);ot.sourceTexture=lt}}}}for(let xt=0;xt<E.length;xt++){let Ft=T[xt],Tt=E[xt];Ft!==null&&Tt!==void 0&&Tt.update(Ft,j,c||r)}ce&&ce(Z,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),g=null}let ae=new Qb;ae.setAnimationLoop(Jt),this.setAnimationLoop=function(Z){ce=Z},this.dispose=function(){}}},wD=new Le,i1=new Zt;i1.set(-1,0,0,0,1,0,0,0,1);function RD(e,t){function n(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,V0(e)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,_,S,v){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?a(m,f):f.isMeshLambertMaterial?(a(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(a(m,f),p(m,f)):f.isMeshPhongMaterial?(a(m,f),h(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(a(m,f),u(m,f),f.isMeshPhysicalMaterial&&d(m,f,v)):f.isMeshMatcapMaterial?(a(m,f),g(m,f)):f.isMeshDepthMaterial?a(m,f):f.isMeshDistanceMaterial?(a(m,f),b(m,f)):f.isMeshNormalMaterial?a(m,f):f.isLineBasicMaterial?(r(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,_,S):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function a(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,n(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,n(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,n(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Pn&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,n(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Pn&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,n(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,n(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,n(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let _=t.get(f),S=_.envMap,v=_.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(wD.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(i1),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,n(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,n(f.aoMap,m.aoMapTransform))}function r(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,n(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,_,S){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*_,m.scale.value=S*.5,f.map&&(m.map.value=f.map,n(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,n(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,n(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,n(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function p(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,n(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,n(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function d(m,f,_){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,n(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,n(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,n(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,n(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,n(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Pn&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,n(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,n(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,n(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,n(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,n(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,n(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,n(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function b(m,f){let _=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function CD(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,E){let T=E.program;i.uniformBlockBinding(v,T)}function c(v,E){let T=s[v.id];T===void 0&&(m(v),T=h(v),s[v.id]=T,v.addEventListener("dispose",_));let w=E.program;i.updateUBOMapping(v,w);let x=t.render.frame;a[v.id]!==x&&(u(v),a[v.id]=x)}function h(v){let E=p();v.__bindingPointIndex=E;let T=e.createBuffer(),w=v.__size,x=v.usage;return e.bindBuffer(e.UNIFORM_BUFFER,T),e.bufferData(e.UNIFORM_BUFFER,w,x),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,E,T),T}function p(){for(let v=0;v<o;v++)if(r.indexOf(v)===-1)return r.push(v),v;return Gt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(v){let E=s[v.id],T=v.uniforms,w=v.__cache;e.bindBuffer(e.UNIFORM_BUFFER,E);for(let x=0,A=T.length;x<A;x++){let C=T[x];if(Array.isArray(C))for(let D=0,H=C.length;D<H;D++)d(C[D],x,D,w);else d(C,x,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(v,E,T,w){if(b(v,E,T,w)===!0){let x=v.__offset,A=v.value;if(Array.isArray(A)){let C=0;for(let D=0;D<A.length;D++){let H=A[D],k=f(H);g(H,v.__data,C),typeof H!="number"&&typeof H!="boolean"&&!H.isMatrix3&&!ArrayBuffer.isView(H)&&(C+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(A,v.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,x,v.__data)}}function g(v,E,T){typeof v=="number"||typeof v=="boolean"?E[0]=v:v.isMatrix3?(E[0]=v.elements[0],E[1]=v.elements[1],E[2]=v.elements[2],E[3]=0,E[4]=v.elements[3],E[5]=v.elements[4],E[6]=v.elements[5],E[7]=0,E[8]=v.elements[6],E[9]=v.elements[7],E[10]=v.elements[8],E[11]=0):ArrayBuffer.isView(v)?E.set(new v.constructor(v.buffer,v.byteOffset,E.length)):v.toArray(E,T)}function b(v,E,T,w){let x=v.value,A=E+"_"+T;if(w[A]===void 0)return typeof x=="number"||typeof x=="boolean"?w[A]=x:ArrayBuffer.isView(x)?w[A]=x.slice():w[A]=x.clone(),!0;{let C=w[A];if(typeof x=="number"||typeof x=="boolean"){if(C!==x)return w[A]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(C.equals(x)===!1)return C.copy(x),!0}}return!1}function m(v){let E=v.uniforms,T=0,w=16;for(let A=0,C=E.length;A<C;A++){let D=Array.isArray(E[A])?E[A]:[E[A]];for(let H=0,k=D.length;H<k;H++){let O=D[H],B=Array.isArray(O.value)?O.value:[O.value];for(let J=0,q=B.length;J<q;J++){let st=B[J],W=f(st),Q=T%w,tt=Q%W.boundary,Ut=Q+tt;T+=tt,Ut!==0&&w-Ut<W.storage&&(T+=w-Ut),O.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=T,T+=W.storage}}}let x=T%w;return x>0&&(T+=w-x),v.__size=T,v.__cache={},this}function f(v){let E={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(E.boundary=4,E.storage=4):v.isVector2?(E.boundary=8,E.storage=8):v.isVector3||v.isColor?(E.boundary=16,E.storage=12):v.isVector4?(E.boundary=16,E.storage=16):v.isMatrix3?(E.boundary=48,E.storage=48):v.isMatrix4?(E.boundary=64,E.storage=64):v.isTexture?kt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(E.boundary=16,E.storage=v.byteLength):kt("WebGLRenderer: Unsupported uniform value type.",v),E}function _(v){let E=v.target;E.removeEventListener("dispose",_);let T=r.indexOf(E.__bindingPointIndex);r.splice(T,1),e.deleteBuffer(s[E.id]),delete s[E.id],delete a[E.id]}function S(){for(let v in s)e.deleteBuffer(s[v]);r=[],s={},a={}}return{bind:l,update:c,dispose:S}}var DD=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ss=null;function LD(){return ss===null&&(ss=new zo(DD,16,16,Ca,Hi),ss.name="DFG_LUT",ss.minFilter=ln,ss.magFilter=ln,ss.wrapS=Ai,ss.wrapT=Ai,ss.generateMipmaps=!1,ss.needsUpdate=!0),ss}var Id=class{constructor(t={}){let{canvas:n=vb(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=Zn}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=r;let b=d,m=new Set([Qf,Kf,Jf]),f=new Set([Zn,zi,Qo,jo,Yf,Zf]),_=new Uint32Array(4),S=new Int32Array(4),v=new N,E=null,T=null,w=[],x=[],A=null;this.domElement=n,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Bi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,D=!1,H=null,k=null,O=null,B=null;this._outputColorSpace=Sn;let J=0,q=0,st=null,W=-1,Q=null,tt=new Ve,Ut=new Ve,wt=null,ce=new jt(0),Jt=0,ae=n.width,Z=n.height,j=1,xt=null,Ft=null,Tt=new Ve(0,0,ae,Z),Bt=new Ve(0,0,ae,Z),ue=!1,et=new Fo,at=!1,ot=!1,lt=new Le,ft=new N,zt=new Ve,Ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Vt=!1;function Wt(){return st===null?j:1}let L=i;function me(M,U){return n.getContext(M,U)}let St,R,y,P,V,X,rt,ut,Y,$,pt,Nt,yt,mt,Lt,Ht,Yt,I,gt,K,_t,Et,it;try{let M={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"186"}`),n.addEventListener("webglcontextlost",xe,!1),n.addEventListener("webglcontextrestored",_e,!1),n.addEventListener("webglcontextcreationerror",an,!1),L===null){let U="webgl2";if(L=me(U,M),L===null)throw me(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Pt()}catch(M){throw n.removeEventListener("webglcontextlost",xe,!1),n.removeEventListener("webglcontextrestored",_e,!1),n.removeEventListener("webglcontextcreationerror",an,!1),Gt("WebGLRenderer: "+M.message),M}function Pt(){St=new z3(L),St.init(),_t=new ED(L,St),R=new R3(L,St,t,_t),y=new MD(L,St),R.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),k=L.createFramebuffer(),O=L.createFramebuffer(),B=L.createFramebuffer(),P=new V3(L),V=new lD,X=new bD(L,St,y,V,R,_t,P),rt=new B3(C),ut=new kw(L),Et=new A3(L,ut),Y=new F3(L,ut,P,Et),$=new k3(L,Y,ut,Et,P),I=new G3(L,R,X),Lt=new C3(V),pt=new oD(C,rt,St,R,Et,Lt),Nt=new RD(C,V),yt=new uD,mt=new gD(St),Yt=new T3(C,rt,y,$,g,l),Ht=new SD(C,$,R),it=new CD(L,P,R,y),gt=new w3(L,St,P),K=new H3(L,St,P),P.programs=pt.programs,C.capabilities=R,C.extensions=St,C.properties=V,C.renderLists=yt,C.shadowMap=Ht,C.state=y,C.info=P}b!==Zn&&(A=new X3(b,n.width,n.height,o,s,a));let Ct=new a_(C,L);this.xr=Ct,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let M=St.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=St.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(M){M!==void 0&&(j=M,this.setSize(ae,Z,!1))},this.getSize=function(M){return M.set(ae,Z)},this.setSize=function(M,U,G=!0){if(Ct.isPresenting){kt("WebGLRenderer: Can't change size while VR device is presenting.");return}ae=M,Z=U,n.width=Math.floor(M*j),n.height=Math.floor(U*j),G===!0&&(n.style.width=M+"px",n.style.height=U+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,M,U)},this.getDrawingBufferSize=function(M){return M.set(ae*j,Z*j).floor()},this.setDrawingBufferSize=function(M,U,G){ae=M,Z=U,j=G,n.width=Math.floor(M*G),n.height=Math.floor(U*G),this.setViewport(0,0,M,U)},this.setEffects=function(M){if(b===Zn){Gt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let U=0;U<M.length;U++)if(M[U].isOutputPass===!0){kt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(tt)},this.getViewport=function(M){return M.copy(Tt)},this.setViewport=function(M,U,G,z){M.isVector4?Tt.set(M.x,M.y,M.z,M.w):Tt.set(M,U,G,z),y.viewport(tt.copy(Tt).multiplyScalar(j).round())},this.getScissor=function(M){return M.copy(Bt)},this.setScissor=function(M,U,G,z){M.isVector4?Bt.set(M.x,M.y,M.z,M.w):Bt.set(M,U,G,z),y.scissor(Ut.copy(Bt).multiplyScalar(j).round())},this.getScissorTest=function(){return ue},this.setScissorTest=function(M){y.setScissorTest(ue=M)},this.setOpaqueSort=function(M){xt=M},this.setTransparentSort=function(M){Ft=M},this.getClearColor=function(M){return M.copy(Yt.getClearColor())},this.setClearColor=function(){Yt.setClearColor(...arguments)},this.getClearAlpha=function(){return Yt.getClearAlpha()},this.setClearAlpha=function(){Yt.setClearAlpha(...arguments)},this.clear=function(M=!0,U=!0,G=!0){let z=0;if(M){let F=!1;if(st!==null){let ht=st.texture.format;F=m.has(ht)}if(F){let ht=st.texture.type,At=f.has(ht),vt=Yt.getClearColor(),Dt=Yt.getClearAlpha(),It=vt.r,Xt=vt.g,ee=vt.b;At?(_[0]=It,_[1]=Xt,_[2]=ee,_[3]=Dt,L.clearBufferuiv(L.COLOR,0,_)):(S[0]=It,S[1]=Xt,S[2]=ee,S[3]=Dt,L.clearBufferiv(L.COLOR,0,S))}else z|=L.COLOR_BUFFER_BIT}U&&(z|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),G&&(z|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&L.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),H=M},this.dispose=function(){n.removeEventListener("webglcontextlost",xe,!1),n.removeEventListener("webglcontextrestored",_e,!1),n.removeEventListener("webglcontextcreationerror",an,!1),Yt.dispose(),yt.dispose(),mt.dispose(),V.dispose(),rt.dispose(),$.dispose(),Et.dispose(),it.dispose(),pt.dispose(),Ct.dispose(),Ct.removeEventListener("sessionstart",ol),Ct.removeEventListener("sessionend",yr),Ri.stop()};function xe(M){M.preventDefault(),F0("WebGLRenderer: Context Lost."),D=!0}function _e(){F0("WebGLRenderer: Context Restored."),D=!1;let M=P.autoReset,U=Ht.enabled,G=Ht.autoUpdate,z=Ht.needsUpdate,F=Ht.type;Pt(),P.autoReset=M,Ht.enabled=U,Ht.autoUpdate=G,Ht.needsUpdate=z,Ht.type=F}function an(M){Gt("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function hi(M){let U=M.target;U.removeEventListener("dispose",hi),iu(U)}function iu(M){Wd(M),V.remove(M)}function Wd(M){let U=V.get(M).programs;U!==void 0&&(U.forEach(function(G){pt.releaseProgram(G)}),M.isShaderMaterial&&pt.releaseShaderCache(M))}this.renderBufferDirect=function(M,U,G,z,F,ht){U===null&&(U=Ot);let At=F.isMesh&&F.matrixWorld.determinantAffine()<0,vt=ru(M,U,G,z,F);y.setMaterial(z,At);let Dt=G.index,It=1;if(z.wireframe===!0){if(Dt=Y.getWireframeAttribute(G),Dt===void 0)return;It=2}let Xt=G.drawRange,ee=G.attributes.position,Mt=Xt.start*It,ie=(Xt.start+Xt.count)*It;ht!==null&&(Mt=Math.max(Mt,ht.start*It),ie=Math.min(ie,(ht.start+ht.count)*It)),Dt!==null?(Mt=Math.max(Mt,0),ie=Math.min(ie,Dt.count)):ee!=null&&(Mt=Math.max(Mt,0),ie=Math.min(ie,ee.count));let Kt=ie-Mt;if(Kt<0||Kt===1/0)return;Et.setup(F,z,vt,G,Dt);let ge,Se=gt;if(Dt!==null&&(ge=ut.get(Dt),Se=K,Se.setIndex(ge)),F.isMesh)z.wireframe===!0?(y.setLineWidth(z.wireframeLinewidth*Wt()),Se.setMode(L.LINES)):Se.setMode(L.TRIANGLES);else if(F.isLine){let Ke=z.linewidth;Ke===void 0&&(Ke=1),y.setLineWidth(Ke*Wt()),F.isLineSegments?Se.setMode(L.LINES):F.isLineLoop?Se.setMode(L.LINE_LOOP):Se.setMode(L.LINE_STRIP)}else F.isPoints?Se.setMode(L.POINTS):F.isSprite&&Se.setMode(L.TRIANGLES);if(F.isBatchedMesh)if(St.get("WEBGL_multi_draw"))Se.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Ke=F._multiDrawStarts,Rt=F._multiDrawCounts,ke=F._multiDrawCount,re=Dt?ut.get(Dt).bytesPerElement:1,Mn=V.get(z).currentProgram.getUniforms();for(let zn=0;zn<ke;zn++)Mn.setValue(L,"_gl_DrawID",zn),Se.render(Ke[zn]/re,Rt[zn])}else if(F.isInstancedMesh)Se.renderInstances(Mt,Kt,F.count);else if(G.isInstancedBufferGeometry){let Ke=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,Rt=Math.min(G.instanceCount,Ke);Se.renderInstances(Mt,Kt,Rt)}else Se.render(Mt,Kt)};function al(M,U,G,z){H!==null&&M.isNodeMaterial&&H.setObject(z,M),at===!0&&Lt.setState(M,G,!1),M.transparent===!0&&M.side===ui&&M.forceSinglePass===!1?(M.side=Pn,M.needsUpdate=!0,Ia(M,U,z),M.side=Aa,M.needsUpdate=!0,Ia(M,U,z),M.side=ui):Ia(M,U,z)}this.compile=function(M,U,G=null){G===null&&(G=M),H!==null&&H.renderStart(M,U,G),T=mt.get(G),T.init(U),x.push(T),G.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(T.pushLight(F),F.castShadow&&T.pushShadow(F))}),M!==G&&M.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(T.pushLight(F),F.castShadow&&T.pushShadow(F))}),T.setupLights(),H!==null&&H.updateLights(T.state.lightsArray),ot=this.localClippingEnabled,at=Lt.init(this.clippingPlanes,ot),at===!0&&Lt.setGlobalState(this.clippingPlanes,U),H!==null&&Ht.render(T.state.shadowsArray,G,U);let z=new Set;return M.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let ht=F.material;if(ht)if(Array.isArray(ht))for(let At=0;At<ht.length;At++){let vt=ht[At];al(vt,G,U,F),z.add(vt)}else al(ht,G,U,F),z.add(ht)}),T=x.pop(),H!==null&&H.renderEnd(),z},this.compileAsync=function(M,U,G=null){let z=this.compile(M,U,G);return new Promise(F=>{function ht(){if(z.forEach(function(At){let Dt=V.get(At).currentProgram;(Dt===void 0||Dt.isReady())&&z.delete(At)}),z.size===0){F(M);return}setTimeout(ht,10)}St.get("KHR_parallel_shader_compile")!==null?ht():setTimeout(ht,10)})};let fi=null;function rl(M){fi&&fi(M)}function ol(){Ri.stop()}function yr(){Ri.start()}let Ri=new Qb;Ri.setAnimationLoop(rl),typeof self<"u"&&Ri.setContext(self),this.setAnimationLoop=function(M){fi=M,Ct.setAnimationLoop(M),M===null?Ri.stop():Ri.start()},Ct.addEventListener("sessionstart",ol),Ct.addEventListener("sessionend",yr),this.render=function(M,U){if(U!==void 0&&U.isCamera!==!0){Gt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;H!==null&&H.renderStart(M,U);let G=Ct.enabled===!0&&Ct.isPresenting===!0,z=A!==null&&(st===null||G)&&A.begin(C,st);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ct.enabled===!0&&Ct.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Ct.cameraAutoUpdate===!0&&Ct.updateCamera(U),U=Ct.getCamera()),M.isScene===!0&&M.onBeforeRender(C,M,U,st),T=mt.get(M,x.length),T.init(U),T.state.textureUnits=X.getTextureUnits(),x.push(T),lt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),et.setFromProjectionMatrix(lt,Pi,U.reversedDepth),ot=this.localClippingEnabled,at=Lt.init(this.clippingPlanes,ot),E=yt.get(M,w.length),E.init(),w.push(E),Ct.enabled===!0&&Ct.isPresenting===!0){let At=C.xr.getDepthSensingMesh();At!==null&&Ua(At,U,-1/0,C.sortObjects)}Ua(M,U,0,C.sortObjects),E.finish(),H!==null&&H.updateLights(T.state.lightsArray),C.sortObjects===!0&&E.sort(xt,Ft),Vt=Ct.enabled===!1||Ct.isPresenting===!1||Ct.hasDepthSensing()===!1,Vt&&Yt.addToRenderList(E,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),at===!0&&Lt.beginShadows();let F=T.state.shadowsArray;if(Ht.render(F,M,U),at===!0&&Lt.endShadows(),(z&&A.hasRenderPass())===!1){let At=E.opaque,vt=E.transmissive;if(T.setupLights(),U.isArrayCamera){let Dt=U.cameras;if(vt.length>0)for(let It=0,Xt=Dt.length;It<Xt;It++){let ee=Dt[It];ll(At,vt,M,ee)}Vt&&Yt.render(M);for(let It=0,Xt=Dt.length;It<Xt;It++){let ee=Dt[It];su(E,M,ee,ee.viewport)}}else vt.length>0&&ll(At,vt,M,U),Vt&&Yt.render(M),su(E,M,U)}st!==null&&q===0&&(X.updateMultisampleRenderTarget(st),X.updateRenderTargetMipmap(st)),z&&A.end(C),M.isScene===!0&&M.onAfterRender(C,M,U),Et.resetDefaultState(),W=-1,Q=null,x.pop(),x.length>0?(T=x[x.length-1],X.setTextureUnits(T.state.textureUnits),at===!0&&Lt.setGlobalState(C.clippingPlanes,T.state.camera)):T=null,w.pop(),w.length>0?E=w[w.length-1]:E=null,H!==null&&H.renderEnd()};function Ua(M,U,G,z){if(M.visible===!1)return;if(M.layers.test(U.layers)){if(M.isGroup)G=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(U);else if(M.isLightProbeGrid)T.pushLightProbeGrid(M);else if(M.isLight)T.pushLight(M),M.castShadow&&T.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(et)){z&&zt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(lt);let At=$.update(M),vt=M.material;vt.visible&&E.push(M,At,vt,G,zt.z,null,U)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(et))){let At=$.update(M),vt=M.material;if(z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),zt.copy(M.boundingSphere.center)):(At.boundingSphere===null&&At.computeBoundingSphere(),zt.copy(At.boundingSphere.center)),zt.applyMatrix4(M.matrixWorld).applyMatrix4(lt)),Array.isArray(vt)){let Dt=At.groups;for(let It=0,Xt=Dt.length;It<Xt;It++){let ee=Dt[It],Mt=vt[ee.materialIndex];Mt&&Mt.visible&&E.push(M,At,Mt,G,zt.z,ee,U)}}else vt.visible&&E.push(M,At,vt,G,zt.z,null,U)}}let ht=M.children;for(let At=0,vt=ht.length;At<vt;At++)Ua(ht[At],U,G,z)}function su(M,U,G,z){let{opaque:F,transmissive:ht,transparent:At}=M;T.setupLightsView(G),at===!0&&Lt.setGlobalState(C.clippingPlanes,G),z&&y.viewport(tt.copy(z)),F.length>0&&Na(F,U,G),ht.length>0&&Na(ht,U,G),At.length>0&&Na(At,U,G),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function ll(M,U,G,z){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[z.id]===void 0){let Mt=St.has("EXT_color_buffer_half_float")||St.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[z.id]=new Yn(1,1,{generateMipmaps:!0,type:Mt?Hi:Zn,minFilter:is,samples:Math.max(4,R.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:fe.workingColorSpace})}let ht=T.state.transmissionRenderTarget[z.id],At=z.viewport||tt;ht.setSize(At.z*C.transmissionResolutionScale,At.w*C.transmissionResolutionScale);let vt=C.getRenderTarget(),Dt=C.getActiveCubeFace(),It=C.getActiveMipmapLevel();C.setRenderTarget(ht),C.getClearColor(ce),Jt=C.getClearAlpha(),Jt<1&&C.setClearColor(16777215,.5),C.clear(),Vt&&Yt.render(G);let Xt=C.toneMapping;C.toneMapping=Bi;let ee=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),T.setupLightsView(z),at===!0&&Lt.setGlobalState(C.clippingPlanes,z),Na(M,G,z),X.updateMultisampleRenderTarget(ht),X.updateRenderTargetMipmap(ht),St.has("WEBGL_multisampled_render_to_texture")===!1){let Mt=!1;for(let ie=0,Kt=U.length;ie<Kt;ie++){let ge=U[ie],{object:Se,geometry:Ke,material:Rt,group:ke}=ge;if(Rt.side===ui&&Se.layers.test(z.layers)){let re=Rt.side;Rt.side=Pn,Rt.needsUpdate=!0,rs(Se,G,z,Ke,Rt,ke),Rt.side=re,Rt.needsUpdate=!0,Mt=!0}}Mt===!0&&(X.updateMultisampleRenderTarget(ht),X.updateRenderTargetMipmap(ht))}C.setRenderTarget(vt,Dt,It),C.setClearColor(ce,Jt),ee!==void 0&&(z.viewport=ee),C.toneMapping=Xt}function Na(M,U,G){let z=U.isScene===!0?U.overrideMaterial:null;for(let F=0,ht=M.length;F<ht;F++){let At=M[F],{object:vt,geometry:Dt,group:It}=At,Xt=At.material;Xt.allowOverride===!0&&z!==null&&(Xt=z),vt.layers.test(G.layers)&&rs(vt,U,G,Dt,Xt,It)}}function rs(M,U,G,z,F,ht){H!==null&&F.isNodeMaterial&&H.setObject(M,F),M.onBeforeRender(C,U,G,z,F,ht),M.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),F.onBeforeRender(C,U,G,z,M,ht),F.transparent===!0&&F.side===ui&&F.forceSinglePass===!1?(F.side=Pn,F.needsUpdate=!0,C.renderBufferDirect(G,U,z,F,M,ht),F.side=Aa,F.needsUpdate=!0,C.renderBufferDirect(G,U,z,F,M,ht),F.side=ui):C.renderBufferDirect(G,U,z,F,M,ht),M.onAfterRender(C,U,G,z,F,ht)}function Ia(M,U,G){U.isScene!==!0&&(U=Ot);let z=V.get(M),F=T.state.lights,ht=T.state.shadowsArray,At=F.state.version,vt=pt.getParameters(M,F.state,ht,U,G,T.state.lightProbeGridArray),Dt=pt.getProgramCacheKey(vt),It=z.programs;z.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?U.environment:null,z.fog=U.fog;let Xt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;z.envMap=rt.get(M.envMap||z.environment,Xt),z.envMapRotation=z.environment!==null&&M.envMap===null?U.environmentRotation:M.envMapRotation,It===void 0&&(M.addEventListener("dispose",hi),It=new Map,z.programs=It);let ee=It.get(Dt);if(ee!==void 0){if(z.currentProgram===ee&&z.lightsStateVersion===At)return ul(M,vt),ee}else vt.uniforms=pt.getUniforms(M),H!==null&&M.isNodeMaterial&&H.build(M,G,vt),M.onBeforeCompile(vt,C),ee=pt.acquireProgram(vt,Dt),It.set(Dt,ee),z.uniforms=vt.uniforms;let Mt=z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Mt.clippingPlanes=Lt.uniform),ul(M,vt),z.needsLights=te(M),z.lightsStateVersion=At,z.needsLights&&(Mt.ambientLightColor.value=F.state.ambient,Mt.lightProbe.value=F.state.probe,Mt.sunLights.value=F.state.sun,Mt.sunLightShadows.value=F.state.sunShadow,Mt.directionalLights.value=F.state.directional,Mt.directionalLightShadows.value=F.state.directionalShadow,Mt.spotLights.value=F.state.spot,Mt.spotLightShadows.value=F.state.spotShadow,Mt.rectAreaLights.value=F.state.rectArea,Mt.ltc_1.value=F.state.rectAreaLTC1,Mt.ltc_2.value=F.state.rectAreaLTC2,Mt.pointLights.value=F.state.point,Mt.pointLightShadows.value=F.state.pointShadow,Mt.hemisphereLights.value=F.state.hemi,Mt.sunShadowMatrix.value=F.state.sunShadowMatrix,Mt.sunShadowCascade.value=F.state.sunShadowCascade,Mt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Mt.spotLightMatrix.value=F.state.spotLightMatrix,Mt.spotLightMap.value=F.state.spotLightMap,Mt.pointShadowMatrix.value=F.state.pointShadowMatrix),z.lightProbeGrid=T.state.lightProbeGridArray.length>0,z.currentProgram=ee,z.uniformsList=null,ee}function cl(M){if(M.uniformsList===null){let U=M.currentProgram.getUniforms();M.uniformsList=nl.seqWithValue(U.seq,M.uniforms)}return M.uniformsList}function ul(M,U){let G=V.get(M);G.outputColorSpace=U.outputColorSpace,G.batching=U.batching,G.batchingColor=U.batchingColor,G.instancing=U.instancing,G.instancingColor=U.instancingColor,G.instancingMorph=U.instancingMorph,G.skinning=U.skinning,G.morphTargets=U.morphTargets,G.morphNormals=U.morphNormals,G.morphColors=U.morphColors,G.morphTargetsCount=U.morphTargetsCount,G.numClippingPlanes=U.numClippingPlanes,G.numIntersection=U.numClipIntersection,G.vertexAlphas=U.vertexAlphas,G.vertexTangents=U.vertexTangents,G.toneMapping=U.toneMapping}function au(M,U){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;v.setFromMatrixPosition(U.matrixWorld);for(let G=0,z=M.length;G<z;G++){let F=M[G];if(F.texture!==null&&F.boundingBox.containsPoint(v))return F}return null}function ru(M,U,G,z,F){U.isScene!==!0&&(U=Ot),X.resetTextureUnits();let ht=U.fog,At=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?U.environment:null,vt=st===null?C.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:fe.workingColorSpace,Dt=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,It=rt.get(z.envMap||At,Dt),Xt=z.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,ee=!!G.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Mt=!!G.morphAttributes.position,ie=!!G.morphAttributes.normal,Kt=!!G.morphAttributes.color,ge=Bi;z.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(ge=C.toneMapping);let Se=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Ke=Se!==void 0?Se.length:0,Rt=V.get(z),ke=T.state.lights;if(at===!0&&(ot===!0||M!==Q)){let Ue=M===Q&&z.id===W;Lt.setState(z,M,Ue)}let re=!1;z.version===Rt.__version?(Rt.needsLights&&Rt.lightsStateVersion!==ke.state.version||Rt.outputColorSpace!==vt||F.isBatchedMesh&&Rt.batching===!1||!F.isBatchedMesh&&Rt.batching===!0||F.isBatchedMesh&&Rt.batchingColor===!0&&F._colorsTexture===null||F.isBatchedMesh&&Rt.batchingColor===!1&&F._colorsTexture!==null||F.isInstancedMesh&&Rt.instancing===!1||!F.isInstancedMesh&&Rt.instancing===!0||F.isSkinnedMesh&&Rt.skinning===!1||!F.isSkinnedMesh&&Rt.skinning===!0||F.isInstancedMesh&&Rt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Rt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Rt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Rt.instancingMorph===!1&&F.morphTexture!==null||Rt.envMap!==It||z.fog===!0&&Rt.fog!==ht||Rt.numClippingPlanes!==void 0&&(Rt.numClippingPlanes!==Lt.numPlanes||Rt.numIntersection!==Lt.numIntersection)||Rt.vertexAlphas!==Xt||Rt.vertexTangents!==ee||Rt.morphTargets!==Mt||Rt.morphNormals!==ie||Rt.morphColors!==Kt||Rt.toneMapping!==ge||Rt.morphTargetsCount!==Ke||!!Rt.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(re=!0):(re=!0,Rt.__version=z.version);let Mn=Rt.currentProgram;re===!0&&(Mn=Ia(z,U,F),H&&z.isNodeMaterial&&H.onUpdateProgram(z,Mn,Rt));let zn=!1,di=!1,xr=!1,Ae=Mn.getUniforms(),qe=Rt.uniforms;if(y.useProgram(Mn.program)&&(zn=!0,di=!0,xr=!0),z.id!==W&&(W=z.id,di=!0),Rt.needsLights){let Ue=au(T.state.lightProbeGridArray,F);Rt.lightProbeGrid!==Ue&&(Rt.lightProbeGrid=Ue,di=!0)}if(zn||Q!==M){y.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Ae.setValue(L,"projectionMatrix",M.projectionMatrix),Ae.setValue(L,"viewMatrix",M.matrixWorldInverse);let Bs=Ae.map.cameraPosition;Bs!==void 0&&Bs.setValue(L,ft.setFromMatrixPosition(M.matrixWorld)),R.logarithmicDepthBuffer&&Ae.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&Ae.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),Q!==M&&(Q=M,di=!0,xr=!0)}if(Rt.needsLights&&(ke.state.sunShadowMap.length>0&&Ae.setValue(L,"sunShadowMap",ke.state.sunShadowMap,X),ke.state.directionalShadowMap.length>0&&Ae.setValue(L,"directionalShadowMap",ke.state.directionalShadowMap,X),ke.state.spotShadowMap.length>0&&Ae.setValue(L,"spotShadowMap",ke.state.spotShadowMap,X),ke.state.pointShadowMap.length>0&&Ae.setValue(L,"pointShadowMap",ke.state.pointShadowMap,X)),F.isSkinnedMesh){Ae.setOptional(L,F,"bindMatrix"),Ae.setOptional(L,F,"bindMatrixInverse");let Ue=F.skeleton;Ue&&(Ue.boneTexture===null&&Ue.computeBoneTexture(),Ae.setValue(L,"boneTexture",Ue.boneTexture,X))}F.isBatchedMesh&&(Ae.setOptional(L,F,"batchingTexture"),Ae.setValue(L,"batchingTexture",F._matricesTexture,X),Ae.setOptional(L,F,"batchingIdTexture"),Ae.setValue(L,"batchingIdTexture",F._indirectTexture,X),Ae.setOptional(L,F,"batchingColorTexture"),F._colorsTexture!==null&&Ae.setValue(L,"batchingColorTexture",F._colorsTexture,X));let Ps=G.morphAttributes;if((Ps.position!==void 0||Ps.normal!==void 0||Ps.color!==void 0)&&I.update(F,G,Mn),(di||Rt.receiveShadow!==F.receiveShadow)&&(Rt.receiveShadow=F.receiveShadow,Ae.setValue(L,"receiveShadow",F.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&U.environment!==null&&(qe.envMapIntensity.value=U.environmentIntensity),qe.dfgLUT!==void 0&&(qe.dfgLUT.value=LD()),di){if(Ae.setValue(L,"toneMappingExposure",C.toneMappingExposure),Rt.needsLights&&ct(qe,xr),ht&&z.fog===!0&&Nt.refreshFogUniforms(qe,ht),Nt.refreshMaterialUniforms(qe,z,j,Z,T.state.transmissionRenderTarget[M.id]),Rt.needsLights&&Rt.lightProbeGrid){let Ue=Rt.lightProbeGrid;qe.probesSH.value=Ue.texture,qe.probesMin.value.copy(Ue.boundingBox.min),qe.probesMax.value.copy(Ue.boundingBox.max),qe.probesResolution.value.copy(Ue.resolution)}nl.upload(L,cl(Rt),qe,X)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(nl.upload(L,cl(Rt),qe,X),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&Ae.setValue(L,"center",F.center),Ae.setValue(L,"modelViewMatrix",F.modelViewMatrix),Ae.setValue(L,"normalMatrix",F.normalMatrix),Ae.setValue(L,"modelMatrix",F.matrixWorld),z.uniformsGroups!==void 0){let Ue=z.uniformsGroups;for(let Bs=0,Sr=Ue.length;Bs<Sr;Bs++){let p_=Ue[Bs];it.update(p_,Mn),it.bind(p_,Mn)}}return Mn}function ct(M,U){M.ambientLightColor.needsUpdate=U,M.lightProbe.needsUpdate=U,M.sunLights.needsUpdate=U,M.sunLightShadows.needsUpdate=U,M.directionalLights.needsUpdate=U,M.directionalLightShadows.needsUpdate=U,M.pointLights.needsUpdate=U,M.pointLightShadows.needsUpdate=U,M.spotLights.needsUpdate=U,M.spotLightShadows.needsUpdate=U,M.rectAreaLights.needsUpdate=U,M.hemisphereLights.needsUpdate=U}function te(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return st},this.setRenderTargetTextures=function(M,U,G){let z=V.get(M);z.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),V.get(M.texture).__webglTexture=U,V.get(M.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:G,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,U){let G=V.get(M);G.__webglFramebuffer=U,G.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(M,U=0,G=0){st=M,J=U,q=G;let z=null,F=!1,ht=!1;if(M){let vt=V.get(M);if(vt.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(L.FRAMEBUFFER,vt.__webglFramebuffer),tt.copy(M.viewport),Ut.copy(M.scissor),wt=M.scissorTest,y.viewport(tt),y.scissor(Ut),y.setScissorTest(wt),W=-1;return}else if(vt.__webglFramebuffer===void 0)X.setupRenderTarget(M);else if(vt.__hasExternalTextures)X.rebindTextures(M,V.get(M.texture).__webglTexture,V.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Xt=M.depthTexture;if(vt.__boundDepthTexture!==Xt){if(Xt!==null&&V.has(Xt)&&(M.width!==Xt.image.width||M.height!==Xt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");X.setupDepthRenderbuffer(M)}}let Dt=M.texture;(Dt.isData3DTexture||Dt.isDataArrayTexture||Dt.isCompressedArrayTexture)&&(ht=!0);let It=V.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(It[U])?z=It[U][G]:z=It[U],F=!0):M.samples>0&&X.useMultisampledRTT(M)===!1?z=V.get(M).__webglMultisampledFramebuffer:Array.isArray(It)?z=It[G]:z=It,tt.copy(M.viewport),Ut.copy(M.scissor),wt=M.scissorTest}else tt.copy(Tt).multiplyScalar(j).floor(),Ut.copy(Bt).multiplyScalar(j).floor(),wt=ue;if(G!==0&&(z=k),y.bindFramebuffer(L.FRAMEBUFFER,z)&&y.drawBuffers(M,z),y.viewport(tt),y.scissor(Ut),y.setScissorTest(wt),F){let vt=V.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+U,vt.__webglTexture,G)}else if(ht){let vt=U;for(let Dt=0;Dt<M.textures.length;Dt++){let It=V.get(M.textures[Dt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Dt,It.__webglTexture,G,vt)}}else if(M!==null&&G!==0){let vt=V.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,vt.__webglTexture,G)}W=-1};function pe(M){let U=V.get(M);return(U.__readFormat!==M.format||U.__readType!==M.type)&&(U.__readFormat=M.format,U.__readType=M.type,U.__formatReadable=R.textureFormatReadable(M.format),U.__typeReadable=R.textureTypeReadable(M.type)),U}this.readRenderTargetPixels=function(M,U,G,z,F,ht,At,vt=0){if(!(M&&M.isWebGLRenderTarget)){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Dt=V.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&At!==void 0&&(Dt=Dt[At]),Dt){y.bindFramebuffer(L.FRAMEBUFFER,Dt);try{let It=M.textures[vt],Xt=It.format,ee=It.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+vt);let Mt=pe(It);if(Mt.__formatReadable===!1){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Mt.__typeReadable===!1){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=M.width-z&&G>=0&&G<=M.height-F&&L.readPixels(U,G,z,F,_t.convert(Xt),_t.convert(ee),ht)}finally{let It=st!==null?V.get(st).__webglFramebuffer:null;y.bindFramebuffer(L.FRAMEBUFFER,It)}}},this.readRenderTargetPixelsAsync=async function(M,U,G,z,F,ht,At,vt=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Dt=V.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&At!==void 0&&(Dt=Dt[At]),Dt)if(U>=0&&U<=M.width-z&&G>=0&&G<=M.height-F){y.bindFramebuffer(L.FRAMEBUFFER,Dt);let It=M.textures[vt],Xt=It.format,ee=It.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+vt);let Mt=pe(It);if(Mt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Mt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ie=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ie),L.bufferData(L.PIXEL_PACK_BUFFER,ht.byteLength,L.STREAM_READ),L.readPixels(U,G,z,F,_t.convert(Xt),_t.convert(ee),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Kt=st!==null?V.get(st).__webglFramebuffer:null;y.bindFramebuffer(L.FRAMEBUFFER,Kt);let ge=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await xb(L,ge,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ie),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ht),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(ie),L.deleteSync(ge),ht}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,U=null,G=0){let z=Math.pow(2,-G),F=Math.floor(M.image.width*z),ht=Math.floor(M.image.height*z),At=U!==null?U.x:0,vt=U!==null?U.y:0;X.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,G,0,0,At,vt,F,ht),y.unbindTexture()},this.copyTextureToTexture=function(M,U,G=null,z=null,F=0,ht=0){let At,vt,Dt,It,Xt,ee,Mt,ie,Kt,ge=M.isCompressedTexture?M.mipmaps[ht]:M.image;if(G!==null)At=G.max.x-G.min.x,vt=G.max.y-G.min.y,Dt=G.isBox3?G.max.z-G.min.z:1,It=G.min.x,Xt=G.min.y,ee=G.isBox3?G.min.z:0;else{let qe=Math.pow(2,-F);At=Math.floor(ge.width*qe),vt=Math.floor(ge.height*qe),M.isDataArrayTexture?Dt=ge.depth:M.isData3DTexture?Dt=Math.floor(ge.depth*qe):Dt=1,It=0,Xt=0,ee=0}z!==null?(Mt=z.x,ie=z.y,Kt=z.z):(Mt=0,ie=0,Kt=0);let Se=_t.convert(U.format),Ke=_t.convert(U.type),Rt;U.isData3DTexture?(X.setTexture3D(U,0),Rt=L.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(X.setTexture2DArray(U,0),Rt=L.TEXTURE_2D_ARRAY):(X.setTexture2D(U,0),Rt=L.TEXTURE_2D),y.activeTexture(L.TEXTURE0),y.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,U.flipY),y.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),y.pixelStorei(L.UNPACK_ALIGNMENT,U.unpackAlignment);let ke=y.getParameter(L.UNPACK_ROW_LENGTH),re=y.getParameter(L.UNPACK_IMAGE_HEIGHT),Mn=y.getParameter(L.UNPACK_SKIP_PIXELS),zn=y.getParameter(L.UNPACK_SKIP_ROWS),di=y.getParameter(L.UNPACK_SKIP_IMAGES);y.pixelStorei(L.UNPACK_ROW_LENGTH,ge.width),y.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ge.height),y.pixelStorei(L.UNPACK_SKIP_PIXELS,It),y.pixelStorei(L.UNPACK_SKIP_ROWS,Xt),y.pixelStorei(L.UNPACK_SKIP_IMAGES,ee);let xr=M.isDataArrayTexture||M.isData3DTexture,Ae=U.isDataArrayTexture||U.isData3DTexture;if(M.isDepthTexture){let qe=V.get(M),Ps=V.get(U),Ue=V.get(qe.__renderTarget),Bs=V.get(Ps.__renderTarget);y.bindFramebuffer(L.READ_FRAMEBUFFER,Ue.__webglFramebuffer),y.bindFramebuffer(L.DRAW_FRAMEBUFFER,Bs.__webglFramebuffer);for(let Sr=0;Sr<Dt;Sr++)xr&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,V.get(M).__webglTexture,F,ee+Sr),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,V.get(U).__webglTexture,ht,Kt+Sr)),L.blitFramebuffer(It,Xt,At,vt,Mt,ie,At,vt,L.DEPTH_BUFFER_BIT,L.NEAREST);y.bindFramebuffer(L.READ_FRAMEBUFFER,null),y.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(F!==0||M.isRenderTargetTexture||V.has(M)){let qe=V.get(M),Ps=V.get(U);y.bindFramebuffer(L.READ_FRAMEBUFFER,O),y.bindFramebuffer(L.DRAW_FRAMEBUFFER,B);for(let Ue=0;Ue<Dt;Ue++)xr?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,qe.__webglTexture,F,ee+Ue):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,qe.__webglTexture,F),Ae?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ps.__webglTexture,ht,Kt+Ue):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ps.__webglTexture,ht),F!==0?L.blitFramebuffer(It,Xt,At,vt,Mt,ie,At,vt,L.COLOR_BUFFER_BIT,L.NEAREST):Ae?L.copyTexSubImage3D(Rt,ht,Mt,ie,Kt+Ue,It,Xt,At,vt):L.copyTexSubImage2D(Rt,ht,Mt,ie,It,Xt,At,vt);y.bindFramebuffer(L.READ_FRAMEBUFFER,null),y.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Ae?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(Rt,ht,Mt,ie,Kt,At,vt,Dt,Se,Ke,ge.data):U.isCompressedArrayTexture?L.compressedTexSubImage3D(Rt,ht,Mt,ie,Kt,At,vt,Dt,Se,ge.data):L.texSubImage3D(Rt,ht,Mt,ie,Kt,At,vt,Dt,Se,Ke,ge):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ht,Mt,ie,At,vt,Se,Ke,ge.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ht,Mt,ie,ge.width,ge.height,Se,ge.data):L.texSubImage2D(L.TEXTURE_2D,ht,Mt,ie,At,vt,Se,Ke,ge);y.pixelStorei(L.UNPACK_ROW_LENGTH,ke),y.pixelStorei(L.UNPACK_IMAGE_HEIGHT,re),y.pixelStorei(L.UNPACK_SKIP_PIXELS,Mn),y.pixelStorei(L.UNPACK_SKIP_ROWS,zn),y.pixelStorei(L.UNPACK_SKIP_IMAGES,di),ht===0&&U.generateMipmaps&&L.generateMipmap(Rt),y.unbindTexture()},this.initRenderTarget=function(M){V.get(M).__webglFramebuffer===void 0&&X.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?X.setTextureCube(M,0):M.isData3DTexture?X.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?X.setTexture2DArray(M,0):X.setTexture2D(M,0),y.unbindTexture()},this.resetState=function(){J=0,q=0,st=null,y.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=fe._getDrawingBufferColorSpace(t),n.unpackColorSpace=fe._getUnpackColorSpace()}};var M1=Gi(mr()),o1={portrait:[1.6,2.25],landscape:[2.25,1.6]},OD={left:.27,center:.5,right:.73},nu=.018,Bn=.007,sn=4,l1=1/.05,PD=1/960,BD=2,Os=72,c1=24,r_=.36,g1=.095,zD=.0135,zd=.036,eu=.15,u1=1024,h1={glossy:{roughness:.42,metalness:0,clearcoat:1,clearcoatRoughness:.06,foil:0,anisotropy:0},matte:{roughness:.85,metalness:0,clearcoat:0,clearcoatRoughness:.6,foil:0,anisotropy:0},holographic:{roughness:.3,metalness:0,clearcoat:1,clearcoatRoughness:.04,foil:1,anisotropy:0},metallic:{roughness:.36,metalness:.75,clearcoat:.5,clearcoatRoughness:.18,foil:0,anisotropy:.7}},Fd=[0,.07,.93,1],FD=[-.95,-.28,.28,.95],HD=9,VD=`
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`,GD=`
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
`,kD=`
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;

float foilHash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float foilBump(float t, float center, float width) {
  float x = (t - center) / width;
  return max(0.0, 1.0 - x * x);
}

vec3 foilSpectrum(float t) {
  return vec3(
    foilBump(t, 0.82, 0.32) + 0.4 * foilBump(t, 0.02, 0.12),
    foilBump(t, 0.5, 0.26),
    foilBump(t, 0.18, 0.24)
  );
}

vec3 foilGrating(float u, float spacing) {
  vec3 color = vec3(0.0);
  for (int m = 1; m <= 2; m++) {
    float order = float(m);
    float t = (spacing * abs(u) / order - 0.38) / 0.32;
    color += foilSpectrum(t) / order;
  }
  return color;
}

vec3 foilShard(vec2 p) {
  vec2 base = floor(p);
  float best = 9.0;
  float edge = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 site = cell + vec2(foilHash(cell), foilHash(cell + 7.31)) * 0.9 + 0.05;
      float d = length(site - p);
      if (d < best) {
        edge = best;
        best = d;
        id = cell;
      } else if (d < edge) {
        edge = d;
      }
    }
  }
  return vec3(foilHash(id + 3.17), foilHash(id + 11.73), edge - best);
}
`,WD=`
if (foilStrength > 0.0) {
  vec3 foilView = normalize(vViewPosition);
  vec3 foilNormal = normalize(normal);
  vec2 foilP = vec2(vFoilUv.x, vFoilUv.y * foilAspect);
  vec3 shard = foilShard(foilP * 26.0);
  vec2 ray = foilP - vec2(-1.6, 2.6 * foilAspect);
  float angle = atan(ray.y, ray.x) + (shard.x - 0.5) * 0.16;
  vec3 grating = normalize(vFoilX * cos(angle) + vFoilY * sin(angle));
  float spacing = 1.7 * (0.95 + shard.y * 0.1);
  vec3 rainbow = foilGrating(dot(foilKey + foilView, grating), spacing);
  rainbow += 0.6 * foilGrating(dot(foilTop + foilView, grating), spacing);
  rainbow *= 0.8 + 0.2 * smoothstep(0.0, 0.04, shard.z);
  rainbow = max(rainbow - 0.35 * min(rainbow.r, min(rainbow.g, rainbow.b)), 0.0);
  vec2 grid = foilP * 64.0;
  vec2 cell = floor(grid);
  vec2 jitter = vec2(foilHash(cell + 1.7), foilHash(cell + 9.2));
  float flake = smoothstep(0.32, 0.06, length(fract(grid) - jitter * 0.6 - 0.2)) * step(0.45, foilHash(cell + 4.4));
  vec3 facet = normalize(foilNormal + (vFoilX * (jitter.x - 0.5) + vFoilY * (jitter.y - 0.5)) * 0.8);
  float glint = pow(max(dot(reflect(-foilKey, facet), foilView), 0.0), 28.0);
  glint += 0.7 * pow(max(dot(reflect(-foilTop, facet), foilView), 0.0), 28.0);
  float fine = 1.0 - smoothstep(0.35, 0.9, max(fwidth(grid.x), fwidth(grid.y)));
  vec3 sparkle = flake * glint * fine * (vec3(0.7) + foilGrating(dot(foilKey + foilView, grating) + jitter.x * 0.4, spacing));
  float ink = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float foil = foilStrength * (0.08 + 0.92 * smoothstep(0.04, 0.7, ink));
  float facing = clamp(dot(foilNormal, foilView), 0.0, 1.0);
  float tint = clamp(dot(rainbow, vec3(0.4)), 0.0, 1.0);
  outgoingLight = outgoingLight * (1.0 - foil * (0.3 + 0.32 * tint)) + (rainbow * 0.62 * (0.4 + 0.6 * facing) + sparkle * 1.6) * foil;
}
`,f1={silver:{color:"#d9dce2",roughness:.16},gold:{color:"#e4b965",roughness:.2},graphite:{color:"#4d4f55",roughness:.28}},Da=(e,t,n)=>Math.min(n,Math.max(t,e)),tu=(e,t,n)=>e+(t-e)*n,o_=(e,t)=>{try{let n=document.createElement("canvas").getContext("2d");if(!n)return t;n.fillStyle="#000000",n.fillStyle=e;let i=n.fillStyle;if(i.startsWith("#")){let a=parseInt(i.slice(1),16);return[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]}let s=i.match(/[\d.]+/g);return!s||s.length<3?t:[Number(s[0])/255,Number(s[1])/255,Number(s[2])/255]}catch{return t}},XD=e=>.2126*e[0]+.7152*e[1]+.0722*e[2],Hd=(e,t=1)=>`rgba(${Math.round(e[0]*255)}, ${Math.round(e[1]*255)}, ${Math.round(e[2]*255)}, ${t})`,_1=e=>{let t=e>>>0;return()=>{t=t+1831565813>>>0;let n=t;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}},h_=(e,t,n,i,s,a)=>{let r=Math.max(0,Math.min(a,i/2,s/2)),o=r*.4477;e.moveTo(t+r,n),e.lineTo(t+i-r,n),e.bezierCurveTo(t+i-o,n,t+i,n+o,t+i,n+r),e.lineTo(t+i,n+s-r),e.bezierCurveTo(t+i,n+s-o,t+i-o,n+s,t+i-r,n+s),e.lineTo(t+r,n+s),e.bezierCurveTo(t+o,n+s,t,n+s-o,t,n+s-r),e.lineTo(t,n+r),e.bezierCurveTo(t,n+o,t+o,n,t+r,n)},l_=(e,t)=>{if(!t)return Promise.resolve(null);let n=e.get(t);if(n)return n;let i=new Promise(s=>{let a=new Image;a.crossOrigin="anonymous",a.decoding="async",a.onload=()=>s(a),a.onerror=()=>s(null),a.src=t});return e.set(t,i),i},d1=(e,t)=>{let[n,i]=o1[e]||o1.portrait,s=tu(.03,Math.min(n,i)*.2,Da(t,0,1)),a={width:.34,height:.07,y:i/2-.13},r=i/2-.055;return{width:n,height:i,radius:s,slot:a,ringY:r,hangY:r+g1}},qD=e=>{let{width:t,height:n,radius:i,slot:s}=e,a=new Sa;h_(a,-t/2+Bn,-n/2+Bn,t-Bn*2,n-Bn*2,Math.max(i-Bn,.005));let r=new lr;h_(r,-s.width/2-Bn,s.y-s.height/2-Bn,s.width+Bn*2,s.height+Bn*2,s.height/2+Bn),a.holes.push(r);let o=new Wo(a,{depth:nu,bevelEnabled:!0,bevelThickness:Bn,bevelSize:Bn,bevelSegments:5,curveSegments:24});o.translate(0,0,-nu/2);let l=new Bc(a,24),c=l.getAttribute("position"),h=l.getAttribute("uv");for(let p=0;p<c.count;p++)h.setXY(p,(c.getX(p)+t/2)/t,(c.getY(p)+n/2)/n);return h.needsUpdate=!0,{body:o,face:l}},p1=e=>{let t=new Sa,n=e*1.16;h_(t,-n/2+.014,-eu/2+.014,n-.028,eu-.028,.024);let i=new Wo(t,{depth:.02,bevelEnabled:!0,bevelThickness:.014,bevelSize:.014,bevelSegments:6,curveSegments:10});return i.translate(0,0,-.01),i},YD=e=>{let t=Fd.length,n=new On;n.setAttribute("position",new wn(new Float32Array(e*t*3),3)),n.setAttribute("normal",new wn(new Float32Array(e*t*3),3)),n.setAttribute("uv",new wn(new Float32Array(e*t*2),2));let i=[];for(let s=0;s<e-1;s++)for(let a=0;a<t-1;a++){let r=s*t+a;i.push(r,r+t,r+1,r+1,r+t,r+t+1)}return n.setIndex(i),n},ZD=e=>{let t=new Po;t.background=new jt(.035,.035,.04);let n=new ur(1,1),i=[],s=(o,l,c,h=0)=>{let p=new rr({color:new jt(o,o,o),side:ui});i.push(p);let u=new Je(n,p);u.position.set(...l),u.scale.set(c[0],c[1],1),u.lookAt(0,0,0),u.rotateZ(h),t.add(u)};s(2.6,[0,4.5,8],[9,4]),s(6,[-5.5,.5,7],[.9,14]),s(4,[5,-.5,8],[.6,14]),s(3.5,[0,-1,9],[24,.35],Math.PI/3),s(2.5,[1,2.5,9],[24,.2],Math.PI/3),s(1.4,[0,6,-6],[12,4]),s(.5,[0,-7,1],[16,6]),s(.9,[8,0,-2],[4,10]);let a=new il(e),r=a.fromScene(t,.035);return a.dispose(),n.dispose(),i.forEach(o=>o.dispose()),r},c_=(e,t)=>{let n=new or(e);return n.colorSpace=Sn,n.anisotropy=t,n},JD=()=>{let t=document.createElement("canvas");t.width=128,t.height=128;let n=t.getContext("2d");if(!n)return new or(t);let i=_1(7),s=Float32Array.from({length:16384},()=>i()),a=(l,c)=>{let h=0;for(let p=-1;p<=1;p++)for(let u=-1;u<=1;u++)h+=s[(c+p+128)%128*128+(l+u+128)%128];return h/9*1.6},r=n.createImageData(128,128);for(let l=0;l<128;l++)for(let c=0;c<128;c++){let h=a((c-1+128)%128,l)-a((c+1)%128,l),p=a(c,(l-1+128)%128)-a(c,(l+1)%128),u=Math.hypot(h,p,1),d=(l*128+c)*4;r.data[d]=(h/u*.5+.5)*255,r.data[d+1]=(p/u*.5+.5)*255,r.data[d+2]=(1/u*.5+.5)*255,r.data[d+3]=255}n.putImageData(r,0,0);let o=new or(t);return o.wrapS=$i,o.wrapT=$i,o.repeat.set(5,7),o},KD=()=>{let n=_1(19),i=Float32Array.from({length:16384},()=>n()),s=l=>Math.sqrt(Math.max(0,1-4*l*l)),a=(l,c)=>{let h=(l%128+128)%128,p=(c%128+128)%128,u=h/128*8,d=p/128*8,g=Math.floor(u),b=Math.floor(d),m=u-g-.5,f=d-b-.5,_=(g+b)%2===0,S=s(m)*(.55+.45*Math.cos(f*Math.PI*(_?1:.6))),v=s(f)*(.55+.45*Math.cos(m*Math.PI*(_?.6:1)));return(_?Math.max(S,v*.7):Math.max(v,S*.7))+i[p*128+h]*.08},r=new Uint8Array(16384*4);for(let l=0;l<128;l++)for(let c=0;c<128;c++){let h=(a(c-1,l)-a(c+1,l))*1.6,p=(a(c,l-1)-a(c,l+1))*1.6,u=Math.hypot(h,p,1),d=(l*128+c)*4;r[d]=(h/u*.5+.5)*255,r[d+1]=(p/u*.5+.5)*255,r[d+2]=(1/u*.5+.5)*255,r[d+3]=255}let o=new zo(r,128,128);return o.wrapS=$i,o.wrapT=$i,o.magFilter=ln,o.minFilter=is,o.generateMipmaps=!0,o.needsUpdate=!0,o},QD=(e,t,n,i,s)=>{let a=(s==="contain"?Math.min:Math.max)(n/t.width,i/t.height),r=t.width*a,o=t.height*a;e.drawImage(t,(n-r)/2,(i-o)/2,r,o)},m1=(e,t,n,i)=>{let s=e.getContext("2d");s&&(s.fillStyle=Hd(n),s.fillRect(0,0,e.width,e.height),t&&QD(s,t,e.width,e.height,i))},jD=(e,t,n)=>{let s=t?Math.max(64,Math.round(t.width/t.height*192)):384;e.width=192,e.height=s;let a=e.getContext("2d");if(!a)return s/192;if(a.fillStyle=Hd(n),a.fillRect(0,0,192,s),t)return a.save(),a.translate(192,0),a.rotate(Math.PI/2),a.drawImage(t,0,0,s,192),a.restore(),s/192;let r=XD(n)>.5?[0,0,0]:[1,1,1];a.fillStyle=Hd(r,.05);for(let o=0;o<s;o+=4)a.fillRect(0,o,192,1);a.fillStyle=Hd(r,.2);for(let o=0;o<s;o+=14)a.fillRect(192*.075,o,2,8),a.fillRect(192*.925-2,o,2,8);return s/192},$D=()=>{let e=()=>Array.from({length:sn+1},()=>new N);return{nodes:e(),previous:e(),velocities:e(),lengths:new Float64Array(sn),impulses:new Float64Array(sn),rest:1,anchor:new N,body:{position:new N,previous:new N,velocity:new N,quaternion:new Un,previousQuaternion:new Un,angular:new N,mass:1,inverseInertia:new N(1,1,1),hang:new N},grab:null,turn:0,twist:0,twistRaw:0,calm:0}},Te={a:new N,b:new N,c:new N,d:new N,e:new N,f:new N,g:new N,pin:new N,q:new Un,r:new Un},f_=(e,t,n)=>(Te.r.copy(e.quaternion).invert(),n.copy(t).applyQuaternion(Te.r),n.set(n.x*e.inverseInertia.x,n.y*e.inverseInertia.y,n.z*e.inverseInertia.z),n.applyQuaternion(e.quaternion)),v1=(e,t)=>{let{x:n,y:i,z:s,w:a}=e;e.x+=.5*(t.x*a+t.y*s-t.z*i),e.y+=.5*(t.y*a+t.z*n-t.x*s),e.z+=.5*(t.z*a+t.x*i-t.y*n),e.w+=.5*(-t.x*n-t.y*i-t.z*s),e.normalize()},y1=(e,t,n)=>{let i=Te.c.crossVectors(t,n);return 1/e.mass+i.dot(f_(e,i,Te.d))},x1=(e,t,n)=>{e.position.addScaledVector(n,1/e.mass),v1(e.quaternion,f_(e,Te.e.crossVectors(t,n),Te.f))},tL=(e,t,n,i)=>{let{nodes:s,body:a}=e,r=s[t],o=t===0?0:l1,l=t===sn-1,c=Te.g,h=s[t+1];l&&(c.copy(a.hang).applyQuaternion(a.quaternion),h=Te.b.copy(a.position).add(c));let p=Te.a.subVectors(h,r),u=p.length(),d=u-e.rest;if(d<=0||u<1e-9)return;let g=p.divideScalar(u),b=l?y1(a,c,g):l1,m=(u-e.lengths[t])/n,_=(i.hold*Math.tanh(i.stiffness*d/i.hold)+i.spring*d+i.bandDamping*Math.max(0,m))*n*n-e.impulses[t];if(_<=0)return;let S=Math.min(d/(o+b),_);e.impulses[t]+=S,o&&r.addScaledVector(g,S*o),l?x1(a,c,g.multiplyScalar(-S)):h.addScaledVector(g,-S*b)},eL=(e,t,n)=>{let i=Te.g.copy(t.local).applyQuaternion(e.quaternion),s=Te.a.copy(n).sub(e.position).sub(i),a=s.length();if(a<1e-9)return;let r=s.divideScalar(a),o=a/y1(e,i,r);x1(e,i,r.multiplyScalar(o))},u_=(e,t,n)=>{let{nodes:i,previous:s,velocities:a,body:r,anchor:o}=e;i[0].copy(o);for(let c=1;c<=sn;c++)i[c].copy(i[c-1]),n?i[c].x+=e.rest:i[c].y-=e.rest;r.quaternion.identity(),n&&r.quaternion.setFromAxisAngle(new N(0,0,1),Math.PI/2),r.hang.set(0,t.hangY,0);let l=Te.a.copy(r.hang).applyQuaternion(r.quaternion);r.position.copy(i[sn]).sub(l),r.previous.copy(r.position),r.previousQuaternion.copy(r.quaternion),r.velocity.set(0,0,0),r.angular.set(0,0,0);for(let c=0;c<=sn;c++)s[c].copy(i[c]),a[c].set(0,0,0);e.lengths.fill(e.rest),e.turn=0,e.twist=0,e.twistRaw=0,e.calm=0},nL=(e,t,n)=>{e.rest=n/sn;let{width:i,height:s}=t,a=e.body,r=nu+Bn*2;a.mass=1,a.inverseInertia.set(12/(s*s+r*r),12/(i*i+r*r),12/(i*i+s*s)),a.hang.set(0,t.hangY,0)},iL=(e,t,n,i)=>{let s=Math.max(1,Math.ceil(t/PD-1e-6)),a=t/s,{nodes:r,previous:o,velocities:l,body:c}=e,h=n.breeze*(Math.sin(i*.53)*.7+Math.sin(i*1.31+1.7)*.3)*3,p=n.breeze*Math.sin(i*.37+.6)*2,u=e.grab,d=Te.pin,g=Math.exp(-n.nodeDrag*a),b=Math.exp(-n.linearDrag*a),m=Math.exp(-n.angularDrag*a);for(let _=0;_<s;_++){for(let C=1;C<sn;C++){let D=l[C];D.y-=n.gravity*a,D.x+=h*a,D.z+=p*a,o[C].copy(r[C]),r[C].addScaledVector(D,a)}c.previous.copy(c.position),c.previousQuaternion.copy(c.quaternion);let S=c.quaternion;if(u){let C=Te.q.copy(u.rotation).multiply(Te.r.copy(S).invert());C.w<0&&C.set(-C.x,-C.y,-C.z,-C.w);let D=Te.a.set(C.x,C.y,C.z).multiplyScalar(2*n.grip);D.addScaledVector(c.angular,-n.gripDamping),c.angular.addScaledVector(f_(c,D,Te.b),a)}let v=Te.a.set(0,1,0).applyQuaternion(S),E=Te.b.set(-v.x*v.z,-v.y*v.z,1-v.z*v.z);if(E.lengthSq()>.001){let C=Te.d.set(0,0,1).applyQuaternion(S),D=Math.atan2(Te.e.crossVectors(E,C).dot(v),E.dot(C)),H=D-e.twistRaw;H>Math.PI?H-=Math.PI*2:H<-Math.PI&&(H+=Math.PI*2),e.twist+=H,e.twistRaw=D}if(!u){let C=c.angular.dot(v);c.angular.addScaledVector(v,(n.twist*(e.turn-e.twist)-n.twistDamping*C)*a)}c.velocity.y-=n.gravity*a,c.velocity.x+=h*.35*a,c.velocity.z+=p*.35*a,c.position.addScaledVector(c.velocity,a),v1(c.quaternion,Te.f.copy(c.angular).multiplyScalar(a)),e.impulses.fill(0),u&&d.lerpVectors(u.from,u.target,(_+1)/s);for(let C=0;C<BD;C++){for(let D=0;D<sn;D++)tL(e,D,a,n);u&&eL(c,u,d)}for(let C=1;C<sn;C++){let D=l[C].subVectors(r[C],o[C]).divideScalar(a).multiplyScalar(g);D.multiplyScalar(1/(1+n.nodeAir*D.length()*a))}c.velocity.subVectors(c.position,c.previous).divideScalar(a);let T=Te.q.copy(c.previousQuaternion).invert().premultiply(c.quaternion);c.angular.set(T.x,T.y,T.z).multiplyScalar(2/a*(T.w<0?-1:1));let w=Te.a.set(0,0,1).applyQuaternion(c.quaternion),x=c.velocity.dot(w),A=Te.b.copy(c.velocity).addScaledVector(w,-x);A.multiplyScalar(1/(1+n.air*A.length()*a)),c.velocity.copy(A).addScaledVector(w,x/(1+n.broadside*Math.abs(x)*a)).multiplyScalar(b),c.angular.multiplyScalar(m/(1+n.spinAir*c.angular.length()*a)),c.velocity.lengthSq()>3600&&c.velocity.setLength(60),c.angular.lengthSq()>1600&&c.angular.setLength(40),r[sn].copy(c.hang).applyQuaternion(c.quaternion).add(c.position);for(let C=0;C<sn;C++)e.lengths[C]=r[C].distanceTo(r[C+1])}u&&u.from.copy(u.target);let f=c.velocity.lengthSq()+c.angular.lengthSq()*.3;for(let _=1;_<sn;_++)f+=l[_].lengthSq()*.05;e.calm=f<2e-4?e.calm+t:0},sL=({frontImage:e,backImage:t,imageFit:n="cover",cardColor:i="#ffffff",orientation:s="portrait",finish:a="glossy",cornerRadius:r=.3,size:o=.6,anchor:l="center",strapLength:c=.5,strapImage:h,strapColor:p="#111111",strapWidth:u=.65,metal:d="silver",gravity:g=1,damping:b=.5,elasticity:m=.5,breeze:f=.5,interactive:_=!0,intro:S=!0,className:v="",style:E})=>{let T=(0,gr.useRef)(null),w=(0,gr.useRef)(null),x=(0,gr.useRef)(null);return w.current={frontImage:e,backImage:t,imageFit:n==="contain"?"contain":"cover",cardColor:i,orientation:s==="landscape"?"landscape":"portrait",finish:a,cornerRadius:r,size:o,anchor:l,strapLength:c,strapImage:h,strapColor:p,strapWidth:u,metal:d,gravity:g,damping:b,elasticity:m,breeze:f,interactive:_,intro:S},(0,gr.useEffect)(()=>{x.current?.()}),(0,gr.useEffect)(()=>{let A=T.current;if(!A)return;let C;try{C=new Id({antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch{return}C.setClearColor(0,0),C.outputColorSpace=Sn,C.toneMapping=Gc,C.toneMappingExposure=1;let D=C.domElement;D.className="block w-full h-full",D.setAttribute("aria-hidden","true"),A.appendChild(D);let H=Math.min(8,C.capabilities.getMaxAnisotropy()),k=new Po,O=ZD(C);k.environment=O.texture;let B=new An(c1,1,.1,200),J=new Zo(16777215,1.6);J.position.set(-2.5,4,6);let q=new Zo(16777215,.35);q.position.set(3,-1,4),k.add(J,q);let st=new Map,W={front:null,back:null,strap:null},Q=document.createElement("canvas"),tt=document.createElement("canvas"),Ut=document.createElement("canvas"),wt=c_(Q,H),ce=c_(tt,H),Jt=c_(Ut,H);Jt.wrapS=Ai,Jt.wrapT=$i;let ae=JD(),Z=KD(),j={foilStrength:{value:0},foilAspect:{value:1.4},foilKey:{value:new N},foilFill:{value:new N},foilTop:{value:new N}},xt=ct=>{Object.assign(ct.uniforms,j),ct.vertexShader=ct.vertexShader.replace("#include <common>",`#include <common>
${VD}`).replace("#include <project_vertex>",`#include <project_vertex>
${GD}`),ct.fragmentShader=ct.fragmentShader.replace("#include <common>",`#include <common>
${kD}`).replace("#include <opaque_fragment>",`${WD}
#include <opaque_fragment>`)},Ft=new Ma({map:wt,normalMap:ae,normalScale:new dt(.06,.06)}),Tt=new Ma({map:ce,normalMap:ae,normalScale:new dt(.06,.06)});Ft.onBeforeCompile=xt,Tt.onBeforeCompile=xt;let Bt=new Ma,ue=new qo({metalness:1}),et=new Ma({map:Jt,normalMap:Z,normalScale:new dt(.7,.7),roughness:.68,sheen:1,sheenRoughness:.42,sheenColor:new jt(.32,.32,.34),side:ui}),at=new Qi,ot=new Je(void 0,Bt),lt=new Je(void 0,Ft),ft=new Je(void 0,Tt),zt=new Je(new Xo(g1,zD,18,72),ue);zt.rotation.y=Math.PI/2-.7,at.add(ot,lt,ft,zt),k.add(at);let Ot=YD(Os),Vt=new Je(Ot,et);Vt.frustumCulled=!1,k.add(Vt);let Wt=new Qi,L=new Je(p1(r_),ue);L.position.y=zd+eu/2-.004;let me=new Je(new Xo(zd,.0105,14,40),ue);Wt.add(L,me),k.add(Wt);let St=$D(),R=[],y=new N,P=new N,V=new Go(R,!1,"centripetal"),X={width:1,height:1},rt=d1("portrait",.3),ut={},Y=r_,$=2,pt=0,Nt=performance.now(),yt=0,mt=!0,Lt=!0,Ht=!1,Yt=!1,I=null,gt=0,K=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,_t=()=>{let ct=w.current,te=o_(ct.cardColor,[1,1,1]),pe=u1,M=Math.round(u1*rt.height/rt.width);(Q.width!==pe||Q.height!==M)&&(Q.width=pe,Q.height=M,tt.width=pe,tt.height=M,wt.dispose(),ce.dispose()),m1(Q,W.front,te,ct.imageFit),m1(tt,W.back||W.front,te,ct.imageFit),wt.needsUpdate=!0,ce.needsUpdate=!0,fi()},Et=()=>{let ct=w.current;$=jD(Ut,W.strap,o_(ct.strapColor,[.07,.07,.07])),Z.repeat.set(2,2*$),Jt.dispose(),Jt.needsUpdate=!0,fi()},it=()=>{let ct=w.current,te=X.width/X.height,pe=rt.height/Da(ct.size,.15,.9),M=rt.width/.72;pe*te<M&&(pe=M/te);let U=pe*te;B.aspect=te,B.position.set(0,0,pe/2/Math.tan(c1*Math.PI/360)),B.lookAt(0,0,0),B.updateProjectionMatrix(),B.updateMatrixWorld(),j.foilKey.value.set(-2.5,4,6).normalize().transformDirection(B.matrixWorldInverse),j.foilFill.value.set(3,-1,4).normalize().transformDirection(B.matrixWorldInverse),j.foilTop.value.set(.5,4.5,8).normalize().transformDirection(B.matrixWorldInverse);let G=((OD[ct.anchor]??.5)-.5)*U,z=pe/2+.2,ht=pe/2-pe*tu(.12,.42,Da(ct.strapLength,0,1))+(rt.hangY-rt.height/2);St.anchor.set(G,z,0),nL(St,rt,z-ht),St.nodes[0].copy(St.anchor),St.previous[0].copy(St.anchor)},Pt=()=>{let ct=w.current,te=`${ct.orientation}|${ct.cornerRadius}`;if(te!==ut.layoutKey){rt=d1(ct.orientation,ct.cornerRadius);let ht=qD(rt);ot.geometry.dispose(),lt.geometry.dispose(),ft.geometry.dispose(),ot.geometry=ht.body,lt.geometry=ht.face,ft.geometry=ht.face.clone(),lt.position.z=nu/2+Bn+6e-4,ft.rotation.y=Math.PI,ft.position.z=-(nu/2+Bn+6e-4),zt.position.set(0,rt.ringY,0),ut.framingKey=""}let pe=`${te}|${ct.size}|${ct.anchor}|${ct.strapLength}|${X.width}|${X.height}`;pe!==ut.framingKey&&(it(),Ht?te!==ut.layoutKey&&u_(St,rt,!1):(u_(St,rt,ct.intro&&!K),Ht=!0));let M=`${ct.frontImage}|${ct.backImage}|${ct.strapImage}`;if(M!==ut.imageKey){let ht=++gt;Promise.all([l_(st,ct.frontImage),l_(st,ct.backImage),l_(st,ct.strapImage)]).then(([At,vt,Dt])=>{!Lt||ht!==gt||(W.front=At,W.back=vt,W.strap=Dt,_t(),Et())})}let U=`${te}|${ct.cardColor}|${ct.imageFit}`;U!==ut.faceKey&&_t(),ct.strapColor!==ut.strapColor&&Et();let G=h1[ct.finish]||h1.glossy,z=o_(ct.cardColor,[1,1,1]);[Ft,Tt].forEach(ht=>{ht.roughness=G.roughness,ht.metalness=G.metalness,ht.clearcoat=G.clearcoat,ht.clearcoatRoughness=G.clearcoatRoughness,ht.anisotropy=G.anisotropy}),j.foilStrength.value=G.foil,j.foilAspect.value=rt.height/rt.width,Bt.color.setRGB(z[0]*.92,z[1]*.92,z[2]*.92,Sn),Bt.roughness=Math.min(G.roughness,.35),Bt.metalness=G.metalness,Bt.clearcoat=1,Bt.clearcoatRoughness=.08;let F=f1[ct.metal]||f1.silver;ue.color.set(F.color),ue.roughness=F.roughness,Y=r_*Da(ct.strapWidth,.4,2),Y!==ut.strapScale&&(L.geometry.dispose(),L.geometry=p1(Y)),D.style.touchAction=ct.interactive?"pan-y":"auto",ut={layoutKey:te,framingKey:pe,imageKey:M,faceKey:U,strapColor:ct.strapColor,strapScale:Y},fi()},Ct=Array.from({length:Os},()=>new N),xe=Array.from({length:Os},()=>new N),_e=FD.map(ct=>[Math.cos(ct),Math.sin(ct)]),an={tangent:new N,toCamera:new N,basis:new Le,up:new N,across:new N,facing:new N,end:new N},hi=()=>{let ct=St.nodes[sn],te=zd+eu+.05,pe=sn-1;for(;pe>0&&St.nodes[pe].distanceTo(ct)<te*1.1;)pe--;let M=an.up.subVectors(St.nodes[pe],ct);M.lengthSq()<1e-8&&M.set(0,1,0).applyQuaternion(St.body.quaternion),M.normalize(),y.copy(ct).addScaledVector(M,te),P.copy(ct).addScaledVector(M,zd+eu*.35),R.length=0;for(let Kt=0;Kt<=pe;Kt++)R.push(St.nodes[Kt]);R.push(y,P),V.updateArcLengths();for(let Kt=0;Kt<Os;Kt++)V.getPointAt(Kt/(Os-1),Ct[Kt]);let U=V.getLength(),G=1-y.distanceTo(P)/Math.max(U,.001),z=Ot.getAttribute("position"),F=Ot.getAttribute("normal"),ht=Ot.getAttribute("uv"),At=Fd.length,vt=St.rest*sn,Dt=vt/(Y*$),It=Y/Math.pow(Math.max(1,U/Math.max(vt,.001)),.35),{tangent:Xt,toCamera:ee,across:Mt,facing:ie}=an;for(let Kt=0;Kt<Os;Kt++){Xt.subVectors(Ct[Math.min(Os-1,Kt+1)],Ct[Math.max(0,Kt-1)]),Xt.lengthSq()<1e-12&&Xt.set(0,-1,0),Xt.normalize(),ee.subVectors(B.position,Ct[Kt]).normalize();let ge=xe[Kt].crossVectors(ee,Xt);ge.lengthSq()<1e-10&&ge.copy(Kt>0?xe[Kt-1]:Te.a.set(1,0,0)),ge.normalize(),Kt>0&&ge.dot(xe[Kt-1])<0&&ge.negate();let Se=-St.twist*Math.pow(Math.min(1,Kt/(Os-1)/G),1.3);ie.crossVectors(Xt,ge),Mt.copy(ge).multiplyScalar(Math.cos(Se)).addScaledVector(ie,Math.sin(Se)),ie.crossVectors(Xt,Mt);let Ke=Ct[Kt],Rt=(1-Kt/(Os-1))*Dt;for(let ke=0;ke<At;ke++){let re=Kt*At+ke,Mn=(Fd[ke]-.5)*It,[zn,di]=_e[ke];z.setXYZ(re,Ke.x+Mt.x*Mn,Ke.y+Mt.y*Mn,Ke.z+Mt.z*Mn),F.setXYZ(re,ie.x*zn+Mt.x*di,ie.y*zn+Mt.y*di,ie.z*zn+Mt.z*di),ht.setXY(re,Fd[ke],Rt)}}an.end.copy(Mt),z.needsUpdate=!0,F.needsUpdate=!0,ht.needsUpdate=!0,Mt.copy(an.end).addScaledVector(M,-an.end.dot(M)).normalize(),ie.crossVectors(Mt,M).normalize(),an.basis.makeBasis(Mt,M,ie),Wt.quaternion.setFromRotationMatrix(an.basis),Wt.position.copy(ct)},iu=()=>{at.position.copy(St.body.position),at.quaternion.copy(St.body.quaternion),hi(),C.render(k,B)},Wd=()=>{let ct=w.current,te=40*Da(ct.gravity,0,3),pe=Math.max(te,20),M=Da(ct.elasticity,0,1),U=Da(ct.damping,0,1);return{gravity:te,hold:pe*tu(2.2,5.5,M),stiffness:pe*10*sn,spring:pe*tu(.1,.4,M)*sn,bandDamping:pe*tu(.3,.08,M)*sn,linearDrag:.25*Math.pow(16,U),angularDrag:.5*Math.pow(12,U),air:.15,broadside:.5,spinAir:.03,nodeDrag:2,nodeAir:.2,twist:30,twistDamping:3,grip:40,gripDamping:6,breeze:K?0:Da(ct.breeze,0,1)}},al=ct=>{if(pt=0,!Lt)return;let te=Math.min(1/30,Math.max(1/240,(ct-Nt)/1e3));Nt=ct,yt+=te;let pe=Wd();iL(St,te,pe,yt);let M=St.body;Number.isFinite(M.position.x+M.position.y+M.position.z+M.quaternion.w)||(St.grab=null,u_(St,rt,!1)),iu();let U=St.calm>1.2&&!St.grab&&pe.breeze===0;mt&&!U&&(pt=requestAnimationFrame(al))},fi=()=>{pt||!mt||!Lt||(St.calm=0,Nt=performance.now(),pt=requestAnimationFrame(al))},rl=new Hc,ol=new dt,yr=ct=>{let te=D.getBoundingClientRect();ol.set((ct.clientX-te.left)/te.width*2-1,-((ct.clientY-te.top)/te.height)*2+1),rl.setFromCamera(ol,B)},Ri=()=>(at.updateMatrixWorld(),rl.intersectObjects([ot,lt,ft],!1)[0]||null),Ua=ct=>{D.style.cursor!==ct&&(D.style.cursor=ct)},su=ct=>{let te=St.body,pe=Te.a.set(0,1,0).applyQuaternion(te.quaternion),M=St.turn>0?-1:1;if(St.turn===0){let U=Te.c.subVectors(ct,B.position).normalize();M=Te.b.subVectors(ct,te.position).cross(U).dot(pe)<0?-1:1}St.turn=St.turn===0?Math.PI*M:0,te.angular.addScaledVector(pe,HD*M)},ll=ct=>{if(!w.current.interactive||ct.button>0)return;yr(ct);let te=Ri();te&&(St.grab={local:te.point.clone().sub(St.body.position).applyQuaternion(St.body.quaternion.clone().invert()),rotation:St.body.quaternion.clone(),reach:te.distance,from:te.point.clone(),target:te.point.clone()},I={x:ct.clientX,y:ct.clientY,time:performance.now(),point:te.point.clone()},D.setPointerCapture?.(ct.pointerId),Ua("grabbing"),ct.preventDefault(),fi())},Na=ct=>{if(w.current.interactive){if(yr(ct),St.grab){I&&Math.hypot(ct.clientX-I.x,ct.clientY-I.y)>6&&(I=null),rl.ray.at(St.grab.reach,St.grab.target),fi();return}ct.pointerType!=="touch"&&(Yt=!!Ri(),Ua(Yt?"grab":""))}},rs=ct=>{St.grab&&(St.grab=null,I&&ct.type==="pointerup"&&performance.now()-I.time<450&&su(I.point),I=null,D.releasePointerCapture?.(ct.pointerId),Ua(Yt&&ct.pointerType!=="touch"?"grab":""),fi())},Ia=ct=>{!w.current.interactive||ct.touches.length!==1||(yr(ct.touches[0]),Ri()&&ct.preventDefault())};D.addEventListener("pointerdown",ll),D.addEventListener("pointermove",Na),D.addEventListener("pointerup",rs),D.addEventListener("pointercancel",rs),D.addEventListener("lostpointercapture",rs),D.addEventListener("touchstart",Ia,{passive:!1});let cl=()=>{X.width=Math.max(1,A.clientWidth),X.height=Math.max(1,A.clientHeight),C.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),C.setSize(X.width,X.height,!1),Pt(),iu()},ul=new ResizeObserver(cl);ul.observe(A);let au=new IntersectionObserver(([ct])=>{mt=ct.isIntersecting,mt&&fi()});au.observe(A);let ru=()=>{document.hidden||fi()};return document.addEventListener("visibilitychange",ru),x.current=Pt,cl(),()=>{Lt=!1,cancelAnimationFrame(pt),x.current=null,ul.disconnect(),au.disconnect(),document.removeEventListener("visibilitychange",ru),D.removeEventListener("pointerdown",ll),D.removeEventListener("pointermove",Na),D.removeEventListener("pointerup",rs),D.removeEventListener("pointercancel",rs),D.removeEventListener("lostpointercapture",rs),D.removeEventListener("touchstart",Ia),[ot,lt,ft,zt,L,me,Vt].forEach(ct=>ct.geometry?.dispose()),[Ft,Tt,Bt,ue,et].forEach(ct=>ct.dispose()),[wt,ce,Jt,ae,Z].forEach(ct=>ct.dispose()),O.dispose(),C.dispose(),D.parentNode&&D.parentNode.removeChild(D)}},[]),(0,M1.jsx)("div",{ref:T,className:`relative w-full h-full overflow-hidden ${v}`.trim(),style:E})},S1=sL;var Vd=Gi(mr());function Gd(){return(0,Vd.jsx)("div",{style:{width:"100%",minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:24},children:(0,Vd.jsx)("div",{style:{width:"100%",height:"600px"},children:(0,Vd.jsx)(S1,{frontImage:"/card-front.png",backImage:"/card-back.png",strapImage:"/band.png"})})})}var La=Gi(mr()),w1="reactbits--lanyard",aL=!0,b1=Object.keys(_r),E1=Gd||void 0||_r[b1.find(e=>/Demo|Example/.test(e))]||_r[b1.find(e=>/^[A-Z]/.test(e)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(e))],T1=!1,kd=(e,t)=>{e==="preview-error"&&(T1=!0),!(e==="preview-ready"&&T1)&&parent.postMessage({type:e,id:w1,...t?{message:String(t)}:{}},"*")};window.addEventListener("error",e=>kd("preview-error",e.message));window.addEventListener("unhandledrejection",e=>kd("preview-error",e.reason?.message||e.reason));var d_=class extends vr.default.Component{state={error:null};static getDerivedStateFromError(t){return{error:t}}componentDidCatch(t){kd("preview-error",t.message)}render(){return this.state.error?(0,La.jsxs)("div",{role:"alert",style:{padding:32,maxWidth:600,fontSize:13,color:"#a1a1aa"},children:["The original example could not finish rendering: ",this.state.error.message]}):this.props.children}};function rL(){let[e,t]=vr.default.useState({});if(vr.default.useEffect(()=>{let n=s=>{s.data?.type==="preview:set-props"&&(!s.data.id||s.data.id===w1)&&t(a=>({...a,...s.data.props}))};window.addEventListener("message",n);let i=requestAnimationFrame(()=>requestAnimationFrame(()=>kd("preview-ready")));return()=>{cancelAnimationFrame(i),window.removeEventListener("message",n)}},[]),!E1)throw Error("No renderable component export was published.");return vr.default.createElement(E1,aL?{}:{text:"Build something extraordinary.",children:"Build something extraordinary.",...e})}function oL(){let{resolvedTheme:e,setTheme:t}=oM();return vr.default.useEffect(()=>{document.documentElement.dataset.theme=e||"dark"},[e]),vr.default.useEffect(()=>{let n=i=>{i.data?.type==="preview:set-theme"&&t(i.data.theme==="light"?"light":"dark")};return window.addEventListener("message",n),()=>window.removeEventListener("message",n)},[t]),(0,La.jsx)(rL,{})}function lL(){return(0,La.jsx)(lM,{attribute:"class",defaultTheme:document.documentElement.dataset.theme||"dark",enableSystem:!1,children:(0,La.jsx)(oL,{})})}(0,A1.createRoot)(document.getElementById("root")).render((0,La.jsx)(d_,{children:(0,La.jsx)(lL,{})}));})();
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
