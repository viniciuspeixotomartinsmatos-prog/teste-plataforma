(()=>{var o1=Object.create;var zd=Object.defineProperty;var l1=Object.getOwnPropertyDescriptor;var c1=Object.getOwnPropertyNames;var u1=Object.getPrototypeOf,h1=Object.prototype.hasOwnProperty;var $i=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),f1=(e,t)=>{for(var n in t)zd(e,n,{get:t[n],enumerable:!0})},d1=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of c1(t))!h1.call(e,s)&&s!==n&&zd(e,s,{get:()=>t[s],enumerable:!(i=l1(t,s))||i.enumerable});return e};var ts=(e,t,n)=>(n=e!=null?o1(u1(e)):{},d1(t||!e||!e.__esModule?zd(n,"default",{value:e,enumerable:!0}):n,e));var A_=$i(Yt=>{"use strict";var Gd=Symbol.for("react.transitional.element"),p1=Symbol.for("react.portal"),m1=Symbol.for("react.fragment"),g1=Symbol.for("react.strict_mode"),_1=Symbol.for("react.profiler"),v1=Symbol.for("react.consumer"),y1=Symbol.for("react.context"),x1=Symbol.for("react.forward_ref"),S1=Symbol.for("react.suspense"),M1=Symbol.for("react.memo"),x_=Symbol.for("react.lazy"),b1=Symbol.for("react.activity"),g_=Symbol.iterator;function E1(e){return e===null||typeof e!="object"?null:(e=g_&&e[g_]||e["@@iterator"],typeof e=="function"?e:null)}var S_={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M_=Object.assign,b_={};function Pr(e,t,n){this.props=e,this.context=t,this.refs=b_,this.updater=n||S_}Pr.prototype.isReactComponent={};Pr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Pr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function E_(){}E_.prototype=Pr.prototype;function kd(e,t,n){this.props=e,this.context=t,this.refs=b_,this.updater=n||S_}var Wd=kd.prototype=new E_;Wd.constructor=kd;M_(Wd,Pr.prototype);Wd.isPureReactComponent=!0;var __=Array.isArray;function Vd(){}var Oe={H:null,A:null,T:null,S:null},T_=Object.prototype.hasOwnProperty;function Xd(e,t,n){var i=n.ref;return{$$typeof:Gd,type:e,key:t,ref:i!==void 0?i:null,props:n}}function T1(e,t){return Xd(e.type,t,e.props)}function qd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Gd}function A1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var v_=/\/+/g;function Hd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?A1(""+e.key):t.toString(36)}function w1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Vd,Vd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Or(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Gd:case p1:r=!0;break;case x_:return r=e._init,Or(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+Hd(e,0):i,__(s)?(n="",r!=null&&(n=r.replace(v_,"$&/")+"/"),Or(s,t,n,"",function(c){return c})):s!=null&&(qd(s)&&(s=T1(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(v_,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(__(e))for(var l=0;l<e.length;l++)i=e[l],a=o+Hd(i,l),r+=Or(i,t,n,a,s);else if(l=E1(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+Hd(i,l++),r+=Or(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return Or(w1(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function hu(e,t,n){if(e==null)return e;var i=[],s=0;return Or(e,i,"","",function(a){return t.call(n,a,s++)}),i}function C1(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var y_=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},R1={map:hu,forEach:function(e,t,n){hu(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return hu(e,function(){t++}),t},toArray:function(e){return hu(e,function(t){return t})||[]},only:function(e){if(!qd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Yt.Activity=b1;Yt.Children=R1;Yt.Component=Pr;Yt.Fragment=m1;Yt.Profiler=_1;Yt.PureComponent=kd;Yt.StrictMode=g1;Yt.Suspense=S1;Yt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Oe;Yt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Oe.H.useMemoCache(e)}};Yt.cache=function(e){return function(){return e.apply(null,arguments)}};Yt.cacheSignal=function(){return null};Yt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=M_({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!T_.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Xd(e.type,s,i)};Yt.createContext=function(e){return e={$$typeof:y1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:v1,_context:e},e};Yt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)T_.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Xd(e,a,s)};Yt.createRef=function(){return{current:null}};Yt.forwardRef=function(e){return{$$typeof:x1,render:e}};Yt.isValidElement=qd;Yt.lazy=function(e){return{$$typeof:x_,_payload:{_status:-1,_result:e},_init:C1}};Yt.memo=function(e,t){return{$$typeof:M1,type:e,compare:t===void 0?null:t}};Yt.startTransition=function(e){var t=Oe.T,n={};Oe.T=n;try{var i=e(),s=Oe.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Vd,y_)}catch(a){y_(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),Oe.T=t}};Yt.unstable_useCacheRefresh=function(){return Oe.H.useCacheRefresh()};Yt.use=function(e){return Oe.H.use(e)};Yt.useActionState=function(e,t,n){return Oe.H.useActionState(e,t,n)};Yt.useCallback=function(e,t){return Oe.H.useCallback(e,t)};Yt.useContext=function(e){return Oe.H.useContext(e)};Yt.useDebugValue=function(){};Yt.useDeferredValue=function(e,t){return Oe.H.useDeferredValue(e,t)};Yt.useEffect=function(e,t){return Oe.H.useEffect(e,t)};Yt.useEffectEvent=function(e){return Oe.H.useEffectEvent(e)};Yt.useId=function(){return Oe.H.useId()};Yt.useImperativeHandle=function(e,t,n){return Oe.H.useImperativeHandle(e,t,n)};Yt.useInsertionEffect=function(e,t){return Oe.H.useInsertionEffect(e,t)};Yt.useLayoutEffect=function(e,t){return Oe.H.useLayoutEffect(e,t)};Yt.useMemo=function(e,t){return Oe.H.useMemo(e,t)};Yt.useOptimistic=function(e,t){return Oe.H.useOptimistic(e,t)};Yt.useReducer=function(e,t,n){return Oe.H.useReducer(e,t,n)};Yt.useRef=function(e){return Oe.H.useRef(e)};Yt.useState=function(e){return Oe.H.useState(e)};Yt.useSyncExternalStore=function(e,t,n){return Oe.H.useSyncExternalStore(e,t,n)};Yt.useTransition=function(){return Oe.H.useTransition()};Yt.version="19.2.0"});var Br=$i((uD,w_)=>{"use strict";w_.exports=A_()});var B_=$i(ke=>{"use strict";function Kd(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<fu(s,t))e[i]=t,e[n]=s,n=i;else break t}}function es(e){return e.length===0?null:e[0]}function pu(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>fu(o,n))l<s&&0>fu(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>fu(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function fu(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}ke.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(C_=performance,ke.unstable_now=function(){return C_.now()}):(Yd=Date,R_=Yd.now(),ke.unstable_now=function(){return Yd.now()-R_});var C_,Yd,R_,Ms=[],ea=[],D1=1,Ei=null,Rn=3,Qd=!1,Ml=!1,bl=!1,jd=!1,L_=typeof setTimeout=="function"?setTimeout:null,N_=typeof clearTimeout=="function"?clearTimeout:null,D_=typeof setImmediate<"u"?setImmediate:null;function du(e){for(var t=es(ea);t!==null;){if(t.callback===null)pu(ea);else if(t.startTime<=e)pu(ea),t.sortIndex=t.expirationTime,Kd(Ms,t);else break;t=es(ea)}}function $d(e){if(bl=!1,du(e),!Ml)if(es(Ms)!==null)Ml=!0,zr||(zr=!0,Fr());else{var t=es(ea);t!==null&&tp($d,t.startTime-e)}}var zr=!1,El=-1,I_=5,O_=-1;function P_(){return jd?!0:!(ke.unstable_now()-O_<I_)}function Zd(){if(jd=!1,zr){var e=ke.unstable_now();O_=e;var t=!0;try{t:{Ml=!1,bl&&(bl=!1,N_(El),El=-1),Qd=!0;var n=Rn;try{e:{for(du(e),Ei=es(Ms);Ei!==null&&!(Ei.expirationTime>e&&P_());){var i=Ei.callback;if(typeof i=="function"){Ei.callback=null,Rn=Ei.priorityLevel;var s=i(Ei.expirationTime<=e);if(e=ke.unstable_now(),typeof s=="function"){Ei.callback=s,du(e),t=!0;break e}Ei===es(Ms)&&pu(Ms),du(e)}else pu(Ms);Ei=es(Ms)}if(Ei!==null)t=!0;else{var a=es(ea);a!==null&&tp($d,a.startTime-e),t=!1}}break t}finally{Ei=null,Rn=n,Qd=!1}t=void 0}}finally{t?Fr():zr=!1}}}var Fr;typeof D_=="function"?Fr=function(){D_(Zd)}:typeof MessageChannel<"u"?(Jd=new MessageChannel,U_=Jd.port2,Jd.port1.onmessage=Zd,Fr=function(){U_.postMessage(null)}):Fr=function(){L_(Zd,0)};var Jd,U_;function tp(e,t){El=L_(function(){e(ke.unstable_now())},t)}ke.unstable_IdlePriority=5;ke.unstable_ImmediatePriority=1;ke.unstable_LowPriority=4;ke.unstable_NormalPriority=3;ke.unstable_Profiling=null;ke.unstable_UserBlockingPriority=2;ke.unstable_cancelCallback=function(e){e.callback=null};ke.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):I_=0<e?Math.floor(1e3/e):5};ke.unstable_getCurrentPriorityLevel=function(){return Rn};ke.unstable_next=function(e){switch(Rn){case 1:case 2:case 3:var t=3;break;default:t=Rn}var n=Rn;Rn=t;try{return e()}finally{Rn=n}};ke.unstable_requestPaint=function(){jd=!0};ke.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=Rn;Rn=e;try{return t()}finally{Rn=n}};ke.unstable_scheduleCallback=function(e,t,n){var i=ke.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:D1++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,Kd(ea,e),es(Ms)===null&&e===es(ea)&&(bl?(N_(El),El=-1):bl=!0,tp($d,n-i))):(e.sortIndex=s,Kd(Ms,e),Ml||Qd||(Ml=!0,zr||(zr=!0,Fr()))),e};ke.unstable_shouldYield=P_;ke.unstable_wrapCallback=function(e){var t=Rn;return function(){var n=Rn;Rn=t;try{return e.apply(this,arguments)}finally{Rn=n}}}});var z_=$i((fD,F_)=>{"use strict";F_.exports=B_()});var V_=$i(Vn=>{"use strict";var U1=Br();function H_(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function na(){}var Hn={d:{f:na,r:function(){throw Error(H_(522))},D:na,C:na,L:na,m:na,X:na,S:na,M:na},p:0,findDOMNode:null},L1=Symbol.for("react.portal");function N1(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:L1,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var Tl=U1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function mu(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Vn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Hn;Vn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(H_(299));return N1(e,t,null,n)};Vn.flushSync=function(e){var t=Tl.T,n=Hn.p;try{if(Tl.T=null,Hn.p=2,e)return e()}finally{Tl.T=t,Hn.p=n,Hn.d.f()}};Vn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Hn.d.C(e,t))};Vn.prefetchDNS=function(e){typeof e=="string"&&Hn.d.D(e)};Vn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=mu(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?Hn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&Hn.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Vn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=mu(t.as,t.crossOrigin);Hn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&Hn.d.M(e)};Vn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=mu(n,t.crossOrigin);Hn.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Vn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=mu(t.as,t.crossOrigin);Hn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else Hn.d.m(e)};Vn.requestFormReset=function(e){Hn.d.r(e)};Vn.unstable_batchedUpdates=function(e,t){return e(t)};Vn.useFormState=function(e,t,n){return Tl.H.useFormState(e,t,n)};Vn.useFormStatus=function(){return Tl.H.useHostTransitionStatus()};Vn.version="19.2.0"});var W_=$i((pD,k_)=>{"use strict";function G_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(G_)}catch(e){console.error(e)}}G_(),k_.exports=V_()});var nM=$i(Hh=>{"use strict";var fn=z_(),gy=Br(),I1=W_();function nt(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function _y(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function hc(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function vy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function yy(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function X_(e){if(hc(e)!==e)throw Error(nt(188))}function O1(e){var t=e.alternate;if(!t){if(t=hc(e),t===null)throw Error(nt(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return X_(s),e;if(a===i)return X_(s),t;a=a.sibling}throw Error(nt(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error(nt(189))}}if(n.alternate!==i)throw Error(nt(190))}if(n.tag!==3)throw Error(nt(188));return n.stateNode.current===n?e:t}function xy(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=xy(e),t!==null)return t;e=e.sibling}return null}var Fe=Object.assign,P1=Symbol.for("react.element"),gu=Symbol.for("react.transitional.element"),Nl=Symbol.for("react.portal"),Xr=Symbol.for("react.fragment"),Sy=Symbol.for("react.strict_mode"),Ip=Symbol.for("react.profiler"),My=Symbol.for("react.consumer"),Ds=Symbol.for("react.context"),Rm=Symbol.for("react.forward_ref"),Op=Symbol.for("react.suspense"),Pp=Symbol.for("react.suspense_list"),Dm=Symbol.for("react.memo"),ia=Symbol.for("react.lazy");Symbol.for("react.scope");var Bp=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var B1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var q_=Symbol.iterator;function Al(e){return e===null||typeof e!="object"?null:(e=q_&&e[q_]||e["@@iterator"],typeof e=="function"?e:null)}var F1=Symbol.for("react.client.reference");function Fp(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===F1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Xr:return"Fragment";case Ip:return"Profiler";case Sy:return"StrictMode";case Op:return"Suspense";case Pp:return"SuspenseList";case Bp:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case Nl:return"Portal";case Ds:return e.displayName||"Context";case My:return(e._context.displayName||"Context")+".Consumer";case Rm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Dm:return t=e.displayName||null,t!==null?t:Fp(e.type)||"Memo";case ia:t=e._payload,e=e._init;try{return Fp(e(t))}catch{}}return null}var Il=Array.isArray,Vt=gy.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ye=I1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ja={pending:!1,data:null,method:null,action:null},zp=[],qr=-1;function rs(e){return{current:e}}function vn(e){0>qr||(e.current=zp[qr],zp[qr]=null,qr--)}function Ne(e,t){qr++,zp[qr]=e.current,e.current=t}var as=rs(null),Ql=rs(null),pa=rs(null),Ju=rs(null);function Ku(e,t){switch(Ne(pa,t),Ne(Ql,e),Ne(as,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?$v(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=$v(t),e=GS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}vn(as),Ne(as,e)}function uo(){vn(as),vn(Ql),vn(pa)}function Hp(e){e.memoizedState!==null&&Ne(Ju,e);var t=as.current,n=GS(t,e.type);t!==n&&(Ne(Ql,e),Ne(as,n))}function Qu(e){Ql.current===e&&(vn(as),vn(Ql)),Ju.current===e&&(vn(Ju),lc._currentValue=ja)}var ep,Y_;function Za(e){if(ep===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);ep=t&&t[1]||"",Y_=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ep+e+Y_}var np=!1;function ip(e,t){if(!e||np)return"";np=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(d){var u=d}Reflect.construct(e,[],p)}else{try{p.call()}catch(d){u=d}e.call(p.prototype)}}else{try{throw Error()}catch(d){u=d}(p=e())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(d){if(d&&u&&typeof d.stack=="string")return[d.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var f=`
`+l[i].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=i&&0<=s);break}}}finally{np=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?Za(n):""}function z1(e,t){switch(e.tag){case 26:case 27:case 5:return Za(e.type);case 16:return Za("Lazy");case 13:return e.child!==t&&t!==null?Za("Suspense Fallback"):Za("Suspense");case 19:return Za("SuspenseList");case 0:case 15:return ip(e.type,!1);case 11:return ip(e.type.render,!1);case 1:return ip(e.type,!0);case 31:return Za("Activity");default:return""}}function Z_(e){try{var t="",n=null;do t+=z1(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Vp=Object.prototype.hasOwnProperty,Um=fn.unstable_scheduleCallback,sp=fn.unstable_cancelCallback,H1=fn.unstable_shouldYield,V1=fn.unstable_requestPaint,ui=fn.unstable_now,G1=fn.unstable_getCurrentPriorityLevel,by=fn.unstable_ImmediatePriority,Ey=fn.unstable_UserBlockingPriority,ju=fn.unstable_NormalPriority,k1=fn.unstable_LowPriority,Ty=fn.unstable_IdlePriority,W1=fn.log,X1=fn.unstable_setDisableYieldValue,fc=null,hi=null;function ca(e){if(typeof W1=="function"&&X1(e),hi&&typeof hi.setStrictMode=="function")try{hi.setStrictMode(fc,e)}catch{}}var fi=Math.clz32?Math.clz32:Z1,q1=Math.log,Y1=Math.LN2;function Z1(e){return e>>>=0,e===0?32:31-(q1(e)/Y1|0)|0}var _u=256,vu=262144,yu=4194304;function Ja(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Eh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=Ja(i):(r&=o,r!==0?s=Ja(r):n||(n=o&~e,n!==0&&(s=Ja(n))))):(o=i&~a,o!==0?s=Ja(o):r!==0?s=Ja(r):n||(n=i&~e,n!==0&&(s=Ja(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function dc(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function J1(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ay(){var e=yu;return yu<<=1,(yu&62914560)===0&&(yu=4194304),e}function ap(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function pc(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function K1(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var f=31-fi(n),p=1<<f;o[f]=0,l[f]=-1;var u=c[f];if(u!==null)for(c[f]=null,f=0;f<u.length;f++){var d=u[f];d!==null&&(d.lane&=-536870913)}n&=~p}i!==0&&wy(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function wy(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-fi(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function Cy(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-fi(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function Ry(e,t){var n=t&-t;return n=(n&42)!==0?1:Lm(n),(n&(e.suspendedLanes|t))!==0?0:n}function Lm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Nm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Dy(){var e=ye.p;return e!==0?e:(e=window.event,e===void 0?32:$S(e.type))}function J_(e,t){var n=ye.p;try{return ye.p=e,t()}finally{ye.p=n}}var wa=Math.random().toString(36).slice(2),bn="__reactFiber$"+wa,jn="__reactProps$"+wa,Mo="__reactContainer$"+wa,Gp="__reactEvents$"+wa,Q1="__reactListeners$"+wa,j1="__reactHandles$"+wa,K_="__reactResources$"+wa,mc="__reactMarker$"+wa;function Im(e){delete e[bn],delete e[jn],delete e[Gp],delete e[Q1],delete e[j1]}function Yr(e){var t=e[bn];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Mo]||n[bn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=sy(e);e!==null;){if(n=e[bn])return n;e=sy(e)}return t}e=n,n=e.parentNode}return null}function bo(e){if(e=e[bn]||e[Mo]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ol(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(nt(33))}function io(e){var t=e[K_];return t||(t=e[K_]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function _n(e){e[mc]=!0}var Uy=new Set,Ly={};function lr(e,t){ho(e,t),ho(e+"Capture",t)}function ho(e,t){for(Ly[e]=t,e=0;e<t.length;e++)Uy.add(t[e])}var $1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Q_={},j_={};function tE(e){return Vp.call(j_,e)?!0:Vp.call(Q_,e)?!1:$1.test(e)?j_[e]=!0:(Q_[e]=!0,!1)}function Iu(e,t,n){if(tE(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function xu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function bs(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function Ai(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Ny(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function eE(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function kp(e){if(!e._valueTracker){var t=Ny(e)?"checked":"value";e._valueTracker=eE(e,t,""+e[t])}}function Iy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=Ny(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function $u(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var nE=/[\n"\\]/g;function Ri(e){return e.replace(nE,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Wp(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Ai(t)):e.value!==""+Ai(t)&&(e.value=""+Ai(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Xp(e,r,Ai(t)):n!=null?Xp(e,r,Ai(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+Ai(o):e.removeAttribute("name")}function Oy(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){kp(e);return}n=n!=null?""+Ai(n):"",t=t!=null?""+Ai(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i??s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),kp(e)}function Xp(e,t,n){t==="number"&&$u(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function so(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+Ai(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function Py(e,t,n){if(t!=null&&(t=""+Ai(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+Ai(n):""}function By(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(nt(92));if(Il(i)){if(1<i.length)throw Error(nt(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=Ai(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),kp(e)}function fo(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var iE=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $_(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||iE.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function Fy(e,t,n){if(t!=null&&typeof t!="object")throw Error(nt(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&$_(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&$_(e,a,t[a])}function Om(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var sE=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),aE=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Ou(e){return aE.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Us(){}var qp=null;function Pm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Zr=null,ao=null;function tv(e){var t=bo(e);if(t&&(e=t.stateNode)){var n=e[jn]||null;t:switch(e=t.stateNode,t.type){case"input":if(Wp(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+Ri(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[jn]||null;if(!s)throw Error(nt(90));Wp(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&Iy(i)}break t;case"textarea":Py(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&so(e,!!n.multiple,t,!1)}}}var rp=!1;function zy(e,t,n){if(rp)return e(t,n);rp=!0;try{var i=e(t);return i}finally{if(rp=!1,(Zr!==null||ao!==null)&&(Ph(),Zr&&(t=Zr,e=ao,ao=Zr=null,tv(t),e)))for(t=0;t<e.length;t++)tv(e[t])}}function jl(e,t){var n=e.stateNode;if(n===null)return null;var i=n[jn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(nt(231,t,typeof n));return n}var Ps=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Yp=!1;if(Ps)try{Hr={},Object.defineProperty(Hr,"passive",{get:function(){Yp=!0}}),window.addEventListener("test",Hr,Hr),window.removeEventListener("test",Hr,Hr)}catch{Yp=!1}var Hr,ua=null,Bm=null,Pu=null;function Hy(){if(Pu)return Pu;var e,t=Bm,n=t.length,i,s="value"in ua?ua.value:ua.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return Pu=s.slice(e,1<i?1-i:void 0)}function Bu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Su(){return!0}function ev(){return!1}function $n(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?Su:ev,this.isPropagationStopped=ev,this}return Fe(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Su)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Su)},persist:function(){},isPersistent:Su}),t}var cr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Th=$n(cr),gc=Fe({},cr,{view:0,detail:0}),rE=$n(gc),op,lp,wl,Ah=Fe({},gc,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Fm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==wl&&(wl&&e.type==="mousemove"?(op=e.screenX-wl.screenX,lp=e.screenY-wl.screenY):lp=op=0,wl=e),op)},movementY:function(e){return"movementY"in e?e.movementY:lp}}),nv=$n(Ah),oE=Fe({},Ah,{dataTransfer:0}),lE=$n(oE),cE=Fe({},gc,{relatedTarget:0}),cp=$n(cE),uE=Fe({},cr,{animationName:0,elapsedTime:0,pseudoElement:0}),hE=$n(uE),fE=Fe({},cr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),dE=$n(fE),pE=Fe({},cr,{data:0}),iv=$n(pE),mE={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},gE={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},_E={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vE(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=_E[e])?!!t[e]:!1}function Fm(){return vE}var yE=Fe({},gc,{key:function(e){if(e.key){var t=mE[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Bu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?gE[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Fm,charCode:function(e){return e.type==="keypress"?Bu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Bu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),xE=$n(yE),SE=Fe({},Ah,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),sv=$n(SE),ME=Fe({},gc,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Fm}),bE=$n(ME),EE=Fe({},cr,{propertyName:0,elapsedTime:0,pseudoElement:0}),TE=$n(EE),AE=Fe({},Ah,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),wE=$n(AE),CE=Fe({},cr,{newState:0,oldState:0}),RE=$n(CE),DE=[9,13,27,32],zm=Ps&&"CompositionEvent"in window,Fl=null;Ps&&"documentMode"in document&&(Fl=document.documentMode);var UE=Ps&&"TextEvent"in window&&!Fl,Vy=Ps&&(!zm||Fl&&8<Fl&&11>=Fl),av=" ",rv=!1;function Gy(e,t){switch(e){case"keyup":return DE.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function ky(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Jr=!1;function LE(e,t){switch(e){case"compositionend":return ky(t);case"keypress":return t.which!==32?null:(rv=!0,av);case"textInput":return e=t.data,e===av&&rv?null:e;default:return null}}function NE(e,t){if(Jr)return e==="compositionend"||!zm&&Gy(e,t)?(e=Hy(),Pu=Bm=ua=null,Jr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Vy&&t.locale!=="ko"?null:t.data;default:return null}}var IE={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ov(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!IE[e.type]:t==="textarea"}function Wy(e,t,n,i){Zr?ao?ao.push(i):ao=[i]:Zr=i,t=_h(t,"onChange"),0<t.length&&(n=new Th("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var zl=null,$l=null;function OE(e){zS(e,0)}function wh(e){var t=Ol(e);if(Iy(t))return e}function lv(e,t){if(e==="change")return t}var Xy=!1;Ps&&(Ps?(bu="oninput"in document,bu||(up=document.createElement("div"),up.setAttribute("oninput","return;"),bu=typeof up.oninput=="function"),Mu=bu):Mu=!1,Xy=Mu&&(!document.documentMode||9<document.documentMode));var Mu,bu,up;function cv(){zl&&(zl.detachEvent("onpropertychange",qy),$l=zl=null)}function qy(e){if(e.propertyName==="value"&&wh($l)){var t=[];Wy(t,$l,e,Pm(e)),zy(OE,t)}}function PE(e,t,n){e==="focusin"?(cv(),zl=t,$l=n,zl.attachEvent("onpropertychange",qy)):e==="focusout"&&cv()}function BE(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return wh($l)}function FE(e,t){if(e==="click")return wh(t)}function zE(e,t){if(e==="input"||e==="change")return wh(t)}function HE(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var pi=typeof Object.is=="function"?Object.is:HE;function tc(e,t){if(pi(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!Vp.call(t,s)||!pi(e[s],t[s]))return!1}return!0}function uv(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function hv(e,t){var n=uv(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=uv(n)}}function Yy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Yy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Zy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=$u(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=$u(e.document)}return t}function Hm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var VE=Ps&&"documentMode"in document&&11>=document.documentMode,Kr=null,Zp=null,Hl=null,Jp=!1;function fv(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Jp||Kr==null||Kr!==$u(i)||(i=Kr,"selectionStart"in i&&Hm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Hl&&tc(Hl,i)||(Hl=i,i=_h(Zp,"onSelect"),0<i.length&&(t=new Th("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=Kr)))}function Ya(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Qr={animationend:Ya("Animation","AnimationEnd"),animationiteration:Ya("Animation","AnimationIteration"),animationstart:Ya("Animation","AnimationStart"),transitionrun:Ya("Transition","TransitionRun"),transitionstart:Ya("Transition","TransitionStart"),transitioncancel:Ya("Transition","TransitionCancel"),transitionend:Ya("Transition","TransitionEnd")},hp={},Jy={};Ps&&(Jy=document.createElement("div").style,"AnimationEvent"in window||(delete Qr.animationend.animation,delete Qr.animationiteration.animation,delete Qr.animationstart.animation),"TransitionEvent"in window||delete Qr.transitionend.transition);function ur(e){if(hp[e])return hp[e];if(!Qr[e])return e;var t=Qr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Jy)return hp[e]=t[n];return e}var Ky=ur("animationend"),Qy=ur("animationiteration"),jy=ur("animationstart"),GE=ur("transitionrun"),kE=ur("transitionstart"),WE=ur("transitioncancel"),$y=ur("transitionend"),tx=new Map,Kp="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Kp.push("scrollEnd");function ki(e,t){tx.set(e,t),lr(t,[e])}var th=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Ti=[],jr=0,Vm=0;function Ch(){for(var e=jr,t=Vm=jr=0;t<e;){var n=Ti[t];Ti[t++]=null;var i=Ti[t];Ti[t++]=null;var s=Ti[t];Ti[t++]=null;var a=Ti[t];if(Ti[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&ex(n,s,a)}}function Rh(e,t,n,i){Ti[jr++]=e,Ti[jr++]=t,Ti[jr++]=n,Ti[jr++]=i,Vm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Gm(e,t,n,i){return Rh(e,t,n,i),eh(e)}function hr(e,t){return Rh(e,null,null,t),eh(e)}function ex(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-fi(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function eh(e){if(50<Jl)throw Jl=0,_m=null,Error(nt(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var $r={};function XE(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function li(e,t,n,i){return new XE(e,t,n,i)}function km(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ns(e,t){var n=e.alternate;return n===null?(n=li(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function nx(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Fu(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")km(e)&&(r=1);else if(typeof e=="string")r=ZT(e,n,as.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case Bp:return e=li(31,n,t,s),e.elementType=Bp,e.lanes=a,e;case Xr:return $a(n.children,s,a,t);case Sy:r=8,s|=24;break;case Ip:return e=li(12,n,t,s|2),e.elementType=Ip,e.lanes=a,e;case Op:return e=li(13,n,t,s),e.elementType=Op,e.lanes=a,e;case Pp:return e=li(19,n,t,s),e.elementType=Pp,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ds:r=10;break t;case My:r=9;break t;case Rm:r=11;break t;case Dm:r=14;break t;case ia:r=16,i=null;break t}r=29,n=Error(nt(130,e===null?"null":typeof e,"")),i=null}return t=li(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function $a(e,t,n,i){return e=li(7,e,i,t),e.lanes=n,e}function fp(e,t,n){return e=li(6,e,null,t),e.lanes=n,e}function ix(e){var t=li(18,null,null,0);return t.stateNode=e,t}function dp(e,t,n){return t=li(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var dv=new WeakMap;function Di(e,t){if(typeof e=="object"&&e!==null){var n=dv.get(e);return n!==void 0?n:(t={value:e,source:t,stack:Z_(t)},dv.set(e,t),t)}return{value:e,source:t,stack:Z_(t)}}var to=[],eo=0,nh=null,ec=0,wi=[],Ci=0,ba=null,ns=1,is="";function Cs(e,t){to[eo++]=ec,to[eo++]=nh,nh=e,ec=t}function sx(e,t,n){wi[Ci++]=ns,wi[Ci++]=is,wi[Ci++]=ba,ba=e;var i=ns;e=is;var s=32-fi(i)-1;i&=~(1<<s),n+=1;var a=32-fi(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,ns=1<<32-fi(t)+s|n<<s|i,is=a+e}else ns=1<<a|n<<s|i,is=e}function Wm(e){e.return!==null&&(Cs(e,1),sx(e,1,0))}function Xm(e){for(;e===nh;)nh=to[--eo],to[eo]=null,ec=to[--eo],to[eo]=null;for(;e===ba;)ba=wi[--Ci],wi[Ci]=null,is=wi[--Ci],wi[Ci]=null,ns=wi[--Ci],wi[Ci]=null}function ax(e,t){wi[Ci++]=ns,wi[Ci++]=is,wi[Ci++]=ba,ns=t.id,is=t.overflow,ba=e}var En=null,Be=null,he=!1,ma=null,Ui=!1,Qp=Error(nt(519));function Ea(e){var t=Error(nt(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw nc(Di(t,e)),Qp}function pv(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[bn]=e,t[jn]=i,n){case"dialog":se("cancel",t),se("close",t);break;case"iframe":case"object":case"embed":se("load",t);break;case"video":case"audio":for(n=0;n<rc.length;n++)se(rc[n],t);break;case"source":se("error",t);break;case"img":case"image":case"link":se("error",t),se("load",t);break;case"details":se("toggle",t);break;case"input":se("invalid",t),Oy(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":se("invalid",t);break;case"textarea":se("invalid",t),By(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||VS(t.textContent,n)?(i.popover!=null&&(se("beforetoggle",t),se("toggle",t)),i.onScroll!=null&&se("scroll",t),i.onScrollEnd!=null&&se("scrollend",t),i.onClick!=null&&(t.onclick=Us),t=!0):t=!1,t||Ea(e,!0)}function mv(e){for(En=e.return;En;)switch(En.tag){case 5:case 31:case 13:Ui=!1;return;case 27:case 3:Ui=!0;return;default:En=En.return}}function Vr(e){if(e!==En)return!1;if(!he)return mv(e),he=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||Mm(e.type,e.memoizedProps)),n=!n),n&&Be&&Ea(e),mv(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(317));Be=iy(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(317));Be=iy(e)}else t===27?(t=Be,Ca(e.type)?(e=Am,Am=null,Be=e):Be=t):Be=En?Ni(e.stateNode.nextSibling):null;return!0}function ir(){Be=En=null,he=!1}function pp(){var e=ma;return e!==null&&(Kn===null?Kn=e:Kn.push.apply(Kn,e),ma=null),e}function nc(e){ma===null?ma=[e]:ma.push(e)}var jp=rs(null),fr=null,Ls=null;function aa(e,t,n){Ne(jp,t._currentValue),t._currentValue=n}function Is(e){e._currentValue=jp.current,vn(jp)}function $p(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function tm(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),$p(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error(nt(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),$p(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function Eo(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error(nt(387));if(r=r.memoizedProps,r!==null){var o=s.type;pi(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Ju.current){if(r=s.alternate,r===null)throw Error(nt(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push(lc):e=[lc])}s=s.return}e!==null&&tm(t,e,n,i),t.flags|=262144}function ih(e){for(e=e.firstContext;e!==null;){if(!pi(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function sr(e){fr=e,Ls=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Tn(e){return rx(fr,e)}function Eu(e,t){return fr===null&&sr(e),rx(e,t)}function rx(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Ls===null){if(e===null)throw Error(nt(308));Ls=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Ls=Ls.next=t;return n}var qE=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},YE=fn.unstable_scheduleCallback,ZE=fn.unstable_NormalPriority,on={$$typeof:Ds,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function qm(){return{controller:new qE,data:new Map,refCount:0}}function _c(e){e.refCount--,e.refCount===0&&YE(ZE,function(){e.controller.abort()})}var Vl=null,em=0,po=0,ro=null;function JE(e,t){if(Vl===null){var n=Vl=[];em=0,po=_g(),ro={status:"pending",value:void 0,then:function(i){n.push(i)}}}return em++,t.then(gv,gv),t}function gv(){if(--em===0&&Vl!==null){ro!==null&&(ro.status="fulfilled");var e=Vl;Vl=null,po=0,ro=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function KE(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var _v=Vt.S;Vt.S=function(e,t){xS=ui(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&JE(e,t),_v!==null&&_v(e,t)};var tr=rs(null);function Ym(){var e=tr.current;return e!==null?e:Le.pooledCache}function zu(e,t){t===null?Ne(tr,tr.current):Ne(tr,t.pool)}function ox(){var e=Ym();return e===null?null:{parent:on._currentValue,pool:e}}var To=Error(nt(460)),Zm=Error(nt(474)),Dh=Error(nt(542)),sh={then:function(){}};function vv(e){return e=e.status,e==="fulfilled"||e==="rejected"}function lx(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(Us,Us),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,xv(e),e;default:if(typeof t.status=="string")t.then(Us,Us);else{if(e=Le,e!==null&&100<e.shellSuspendCounter)throw Error(nt(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,xv(e),e}throw er=t,To}}function Ka(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(er=n,To):n}}var er=null;function yv(){if(er===null)throw Error(nt(459));var e=er;return er=null,e}function xv(e){if(e===To||e===Dh)throw Error(nt(483))}var oo=null,ic=0;function Tu(e){var t=ic;return ic+=1,oo===null&&(oo=[]),lx(oo,e,t)}function Cl(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Au(e,t){throw t.$$typeof===P1?Error(nt(525)):(e=Object.prototype.toString.call(t),Error(nt(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function cx(e){function t(h,g){if(e){var M=h.deletions;M===null?(h.deletions=[g],h.flags|=16):M.push(g)}}function n(h,g){if(!e)return null;for(;g!==null;)t(h,g),g=g.sibling;return null}function i(h){for(var g=new Map;h!==null;)h.key!==null?g.set(h.key,h):g.set(h.index,h),h=h.sibling;return g}function s(h,g){return h=Ns(h,g),h.index=0,h.sibling=null,h}function a(h,g,M){return h.index=M,e?(M=h.alternate,M!==null?(M=M.index,M<g?(h.flags|=67108866,g):M):(h.flags|=67108866,g)):(h.flags|=1048576,g)}function r(h){return e&&h.alternate===null&&(h.flags|=67108866),h}function o(h,g,M,y){return g===null||g.tag!==6?(g=fp(M,h.mode,y),g.return=h,g):(g=s(g,M),g.return=h,g)}function l(h,g,M,y){var b=M.type;return b===Xr?f(h,g,M.props.children,y,M.key):g!==null&&(g.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===ia&&Ka(b)===g.type)?(g=s(g,M.props),Cl(g,M),g.return=h,g):(g=Fu(M.type,M.key,M.props,null,h.mode,y),Cl(g,M),g.return=h,g)}function c(h,g,M,y){return g===null||g.tag!==4||g.stateNode.containerInfo!==M.containerInfo||g.stateNode.implementation!==M.implementation?(g=dp(M,h.mode,y),g.return=h,g):(g=s(g,M.children||[]),g.return=h,g)}function f(h,g,M,y,b){return g===null||g.tag!==7?(g=$a(M,h.mode,y,b),g.return=h,g):(g=s(g,M),g.return=h,g)}function p(h,g,M){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return g=fp(""+g,h.mode,M),g.return=h,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case gu:return M=Fu(g.type,g.key,g.props,null,h.mode,M),Cl(M,g),M.return=h,M;case Nl:return g=dp(g,h.mode,M),g.return=h,g;case ia:return g=Ka(g),p(h,g,M)}if(Il(g)||Al(g))return g=$a(g,h.mode,M,null),g.return=h,g;if(typeof g.then=="function")return p(h,Tu(g),M);if(g.$$typeof===Ds)return p(h,Eu(h,g),M);Au(h,g)}return null}function u(h,g,M,y){var b=g!==null?g.key:null;if(typeof M=="string"&&M!==""||typeof M=="number"||typeof M=="bigint")return b!==null?null:o(h,g,""+M,y);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case gu:return M.key===b?l(h,g,M,y):null;case Nl:return M.key===b?c(h,g,M,y):null;case ia:return M=Ka(M),u(h,g,M,y)}if(Il(M)||Al(M))return b!==null?null:f(h,g,M,y,null);if(typeof M.then=="function")return u(h,g,Tu(M),y);if(M.$$typeof===Ds)return u(h,g,Eu(h,M),y);Au(h,M)}return null}function d(h,g,M,y,b){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return h=h.get(M)||null,o(g,h,""+y,b);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case gu:return h=h.get(y.key===null?M:y.key)||null,l(g,h,y,b);case Nl:return h=h.get(y.key===null?M:y.key)||null,c(g,h,y,b);case ia:return y=Ka(y),d(h,g,M,y,b)}if(Il(y)||Al(y))return h=h.get(M)||null,f(g,h,y,b,null);if(typeof y.then=="function")return d(h,g,M,Tu(y),b);if(y.$$typeof===Ds)return d(h,g,M,Eu(g,y),b);Au(g,y)}return null}function v(h,g,M,y){for(var b=null,T=null,w=g,x=g=0,A=null;w!==null&&x<M.length;x++){w.index>x?(A=w,w=null):A=w.sibling;var D=u(h,w,M[x],y);if(D===null){w===null&&(w=A);break}e&&w&&D.alternate===null&&t(h,w),g=a(D,g,x),T===null?b=D:T.sibling=D,T=D,w=A}if(x===M.length)return n(h,w),he&&Cs(h,x),b;if(w===null){for(;x<M.length;x++)w=p(h,M[x],y),w!==null&&(g=a(w,g,x),T===null?b=w:T.sibling=w,T=w);return he&&Cs(h,x),b}for(w=i(w);x<M.length;x++)A=d(w,h,x,M[x],y),A!==null&&(e&&A.alternate!==null&&w.delete(A.key===null?x:A.key),g=a(A,g,x),T===null?b=A:T.sibling=A,T=A);return e&&w.forEach(function(R){return t(h,R)}),he&&Cs(h,x),b}function E(h,g,M,y){if(M==null)throw Error(nt(151));for(var b=null,T=null,w=g,x=g=0,A=null,D=M.next();w!==null&&!D.done;x++,D=M.next()){w.index>x?(A=w,w=null):A=w.sibling;var R=u(h,w,D.value,y);if(R===null){w===null&&(w=A);break}e&&w&&R.alternate===null&&t(h,w),g=a(R,g,x),T===null?b=R:T.sibling=R,T=R,w=A}if(D.done)return n(h,w),he&&Cs(h,x),b;if(w===null){for(;!D.done;x++,D=M.next())D=p(h,D.value,y),D!==null&&(g=a(D,g,x),T===null?b=D:T.sibling=D,T=D);return he&&Cs(h,x),b}for(w=i(w);!D.done;x++,D=M.next())D=d(w,h,x,D.value,y),D!==null&&(e&&D.alternate!==null&&w.delete(D.key===null?x:D.key),g=a(D,g,x),T===null?b=D:T.sibling=D,T=D);return e&&w.forEach(function(P){return t(h,P)}),he&&Cs(h,x),b}function m(h,g,M,y){if(typeof M=="object"&&M!==null&&M.type===Xr&&M.key===null&&(M=M.props.children),typeof M=="object"&&M!==null){switch(M.$$typeof){case gu:t:{for(var b=M.key;g!==null;){if(g.key===b){if(b=M.type,b===Xr){if(g.tag===7){n(h,g.sibling),y=s(g,M.props.children),y.return=h,h=y;break t}}else if(g.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===ia&&Ka(b)===g.type){n(h,g.sibling),y=s(g,M.props),Cl(y,M),y.return=h,h=y;break t}n(h,g);break}else t(h,g);g=g.sibling}M.type===Xr?(y=$a(M.props.children,h.mode,y,M.key),y.return=h,h=y):(y=Fu(M.type,M.key,M.props,null,h.mode,y),Cl(y,M),y.return=h,h=y)}return r(h);case Nl:t:{for(b=M.key;g!==null;){if(g.key===b)if(g.tag===4&&g.stateNode.containerInfo===M.containerInfo&&g.stateNode.implementation===M.implementation){n(h,g.sibling),y=s(g,M.children||[]),y.return=h,h=y;break t}else{n(h,g);break}else t(h,g);g=g.sibling}y=dp(M,h.mode,y),y.return=h,h=y}return r(h);case ia:return M=Ka(M),m(h,g,M,y)}if(Il(M))return v(h,g,M,y);if(Al(M)){if(b=Al(M),typeof b!="function")throw Error(nt(150));return M=b.call(M),E(h,g,M,y)}if(typeof M.then=="function")return m(h,g,Tu(M),y);if(M.$$typeof===Ds)return m(h,g,Eu(h,M),y);Au(h,M)}return typeof M=="string"&&M!==""||typeof M=="number"||typeof M=="bigint"?(M=""+M,g!==null&&g.tag===6?(n(h,g.sibling),y=s(g,M),y.return=h,h=y):(n(h,g),y=fp(M,h.mode,y),y.return=h,h=y),r(h)):n(h,g)}return function(h,g,M,y){try{ic=0;var b=m(h,g,M,y);return oo=null,b}catch(w){if(w===To||w===Dh)throw w;var T=li(29,w,null,h.mode);return T.lanes=y,T.return=h,T}finally{}}}var ar=cx(!0),ux=cx(!1),sa=!1;function Jm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function nm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ga(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function _a(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(ve&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=eh(e),ex(e,null,n),t}return Rh(e,i,t,n),eh(e)}function Gl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,Cy(e,n)}}function mp(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var im=!1;function kl(){if(im){var e=ro;if(e!==null)throw e}}function Wl(e,t,n,i){im=!1;var s=e.updateQueue;sa=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var f=e.alternate;f!==null&&(f=f.updateQueue,o=f.lastBaseUpdate,o!==r&&(o===null?f.firstBaseUpdate=c:o.next=c,f.lastBaseUpdate=l))}if(a!==null){var p=s.baseState;r=0,f=c=l=null,o=a;do{var u=o.lane&-536870913,d=u!==o.lane;if(d?(le&u)===u:(i&u)===u){u!==0&&u===po&&(im=!0),f!==null&&(f=f.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var v=e,E=o;u=t;var m=n;switch(E.tag){case 1:if(v=E.payload,typeof v=="function"){p=v.call(m,p,u);break t}p=v;break t;case 3:v.flags=v.flags&-65537|128;case 0:if(v=E.payload,u=typeof v=="function"?v.call(m,p,u):v,u==null)break t;p=Fe({},p,u);break t;case 2:sa=!0}}u=o.callback,u!==null&&(e.flags|=64,d&&(e.flags|=8192),d=s.callbacks,d===null?s.callbacks=[u]:d.push(u))}else d={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},f===null?(c=f=d,l=p):f=f.next=d,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;d=o,o=d.next,d.next=null,s.lastBaseUpdate=d,s.shared.pending=null}}while(!0);f===null&&(l=p),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=f,a===null&&(s.shared.lanes=0),Aa|=r,e.lanes=r,e.memoizedState=p}}function hx(e,t){if(typeof e!="function")throw Error(nt(191,e));e.call(t)}function fx(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)hx(n[e],t)}var mo=rs(null),ah=rs(0);function Sv(e,t){e=Hs,Ne(ah,e),Ne(mo,t),Hs=e|t.baseLanes}function sm(){Ne(ah,Hs),Ne(mo,mo.current)}function Km(){Hs=ah.current,vn(mo),vn(ah)}var mi=rs(null),Li=null;function ra(e){var t=e.alternate;Ne(tn,tn.current&1),Ne(mi,e),Li===null&&(t===null||mo.current!==null||t.memoizedState!==null)&&(Li=e)}function am(e){Ne(tn,tn.current),Ne(mi,e),Li===null&&(Li=e)}function dx(e){e.tag===22?(Ne(tn,tn.current),Ne(mi,e),Li===null&&(Li=e)):oa(e)}function oa(){Ne(tn,tn.current),Ne(mi,mi.current)}function oi(e){vn(mi),Li===e&&(Li=null),vn(tn)}var tn=rs(0);function rh(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Em(n)||Tm(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Bs=0,Jt=null,Re=null,an=null,oh=!1,lo=!1,rr=!1,lh=0,sc=0,co=null,QE=0;function Je(){throw Error(nt(321))}function Qm(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!pi(e[n],t[n]))return!1;return!0}function jm(e,t,n,i,s,a){return Bs=a,Jt=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Vt.H=e===null||e.memoizedState===null?Wx:cg,rr=!1,a=n(i,s),rr=!1,lo&&(a=mx(t,n,i,s)),px(e),a}function px(e){Vt.H=ac;var t=Re!==null&&Re.next!==null;if(Bs=0,an=Re=Jt=null,oh=!1,sc=0,co=null,t)throw Error(nt(300));e===null||ln||(e=e.dependencies,e!==null&&ih(e)&&(ln=!0))}function mx(e,t,n,i){Jt=e;var s=0;do{if(lo&&(co=null),sc=0,lo=!1,25<=s)throw Error(nt(301));if(s+=1,an=Re=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}Vt.H=Xx,a=t(n,i)}while(lo);return a}function jE(){var e=Vt.H,t=e.useState()[0];return t=typeof t.then=="function"?vc(t):t,e=e.useState()[0],(Re!==null?Re.memoizedState:null)!==e&&(Jt.flags|=1024),t}function $m(){var e=lh!==0;return lh=0,e}function tg(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function eg(e){if(oh){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}oh=!1}Bs=0,an=Re=Jt=null,lo=!1,sc=lh=0,co=null}function Gn(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return an===null?Jt.memoizedState=an=e:an=an.next=e,an}function en(){if(Re===null){var e=Jt.alternate;e=e!==null?e.memoizedState:null}else e=Re.next;var t=an===null?Jt.memoizedState:an.next;if(t!==null)an=t,Re=e;else{if(e===null)throw Jt.alternate===null?Error(nt(467)):Error(nt(310));Re=e,e={memoizedState:Re.memoizedState,baseState:Re.baseState,baseQueue:Re.baseQueue,queue:Re.queue,next:null},an===null?Jt.memoizedState=an=e:an=an.next=e}return an}function Uh(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function vc(e){var t=sc;return sc+=1,co===null&&(co=[]),e=lx(co,e,t),t=Jt,(an===null?t.memoizedState:an.next)===null&&(t=t.alternate,Vt.H=t===null||t.memoizedState===null?Wx:cg),e}function Lh(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return vc(e);if(e.$$typeof===Ds)return Tn(e)}throw Error(nt(438,String(e)))}function ng(e){var t=null,n=Jt.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=Jt.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=Uh(),Jt.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=B1;return t.index++,n}function Fs(e,t){return typeof t=="function"?t(e):t}function Hu(e){var t=en();return ig(t,Re,e)}function ig(e,t,n){var i=e.queue;if(i===null)throw Error(nt(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(le&p)===p:(Bs&p)===p){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===po&&(f=!0);else if((Bs&u)===u){c=c.next,u===po&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,r=a):l=l.next=p,Jt.lanes|=u,Aa|=u;p=c.action,rr&&n(a,p),a=c.hasEagerState?c.eagerState:n(a,p)}else u={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,Jt.lanes|=p,Aa|=p;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!pi(a,e.memoizedState)&&(ln=!0,f&&(n=ro,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function gp(e){var t=en(),n=t.queue;if(n===null)throw Error(nt(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);pi(a,t.memoizedState)||(ln=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function gx(e,t,n){var i=Jt,s=en(),a=he;if(a){if(n===void 0)throw Error(nt(407));n=n()}else n=t();var r=!pi((Re||s).memoizedState,n);if(r&&(s.memoizedState=n,ln=!0),s=s.queue,sg(yx.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||an!==null&&an.memoizedState.tag&1){if(i.flags|=2048,go(9,{destroy:void 0},vx.bind(null,i,s,n,t),null),Le===null)throw Error(nt(349));a||(Bs&127)!==0||_x(i,t,n)}return n}function _x(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Jt.updateQueue,t===null?(t=Uh(),Jt.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function vx(e,t,n,i){t.value=n,t.getSnapshot=i,xx(t)&&Sx(e)}function yx(e,t,n){return n(function(){xx(t)&&Sx(e)})}function xx(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!pi(e,n)}catch{return!0}}function Sx(e){var t=hr(e,2);t!==null&&Qn(t,e,2)}function rm(e){var t=Gn();if(typeof e=="function"){var n=e;if(e=n(),rr){ca(!0);try{n()}finally{ca(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fs,lastRenderedState:e},t}function Mx(e,t,n,i){return e.baseState=n,ig(e,Re,typeof i=="function"?i:Fs)}function $E(e,t,n,i,s){if(Ih(e))throw Error(nt(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};Vt.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,bx(t,a)):(a.next=n.next,t.pending=n.next=a)}}function bx(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=Vt.T,r={};Vt.T=r;try{var o=n(s,i),l=Vt.S;l!==null&&l(r,o),Mv(e,t,o)}catch(c){om(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),Vt.T=a}}else try{a=n(s,i),Mv(e,t,a)}catch(c){om(e,t,c)}}function Mv(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){bv(e,t,i)},function(i){return om(e,t,i)}):bv(e,t,n)}function bv(e,t,n){t.status="fulfilled",t.value=n,Ex(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,bx(e,n)))}function om(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,Ex(t),t=t.next;while(t!==i)}e.action=null}function Ex(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Tx(e,t){return t}function Ev(e,t){if(he){var n=Le.formState;if(n!==null){t:{var i=Jt;if(he){if(Be){e:{for(var s=Be,a=Ui;s.nodeType!==8;){if(!a){s=null;break e}if(s=Ni(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Be=Ni(s.nextSibling),i=s.data==="F!";break t}}Ea(i)}i=!1}i&&(t=n[0])}}return n=Gn(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Tx,lastRenderedState:t},n.queue=i,n=Vx.bind(null,Jt,i),i.dispatch=n,i=rm(!1),a=lg.bind(null,Jt,!1,i.queue),i=Gn(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=$E.bind(null,Jt,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function Tv(e){var t=en();return Ax(t,Re,e)}function Ax(e,t,n){if(t=ig(e,t,Tx)[0],e=Hu(Fs)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=vc(t)}catch(r){throw r===To?Dh:r}else i=t;t=en();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&(Jt.flags|=2048,go(9,{destroy:void 0},tT.bind(null,s,n),null)),[i,a,e]}function tT(e,t){e.action=t}function Av(e){var t=en(),n=Re;if(n!==null)return Ax(t,n,e);en(),t=t.memoizedState,n=en();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function go(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=Jt.updateQueue,t===null&&(t=Uh(),Jt.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function wx(){return en().memoizedState}function Vu(e,t,n,i){var s=Gn();Jt.flags|=e,s.memoizedState=go(1|t,{destroy:void 0},n,i===void 0?null:i)}function Nh(e,t,n,i){var s=en();i=i===void 0?null:i;var a=s.memoizedState.inst;Re!==null&&i!==null&&Qm(i,Re.memoizedState.deps)?s.memoizedState=go(t,a,n,i):(Jt.flags|=e,s.memoizedState=go(1|t,a,n,i))}function wv(e,t){Vu(8390656,8,e,t)}function sg(e,t){Nh(2048,8,e,t)}function eT(e){Jt.flags|=4;var t=Jt.updateQueue;if(t===null)t=Uh(),Jt.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Cx(e){var t=en().memoizedState;return eT({ref:t,nextImpl:e}),function(){if((ve&2)!==0)throw Error(nt(440));return t.impl.apply(void 0,arguments)}}function Rx(e,t){return Nh(4,2,e,t)}function Dx(e,t){return Nh(4,4,e,t)}function Ux(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Lx(e,t,n){n=n!=null?n.concat([e]):null,Nh(4,4,Ux.bind(null,t,e),n)}function ag(){}function Nx(e,t){var n=en();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Qm(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function Ix(e,t){var n=en();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Qm(t,i[1]))return i[0];if(i=e(),rr){ca(!0);try{e()}finally{ca(!1)}}return n.memoizedState=[i,t],i}function rg(e,t,n){return n===void 0||(Bs&1073741824)!==0&&(le&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=MS(),Jt.lanes|=e,Aa|=e,n)}function Ox(e,t,n,i){return pi(n,t)?n:mo.current!==null?(e=rg(e,n,i),pi(e,t)||(ln=!0),e):(Bs&42)===0||(Bs&1073741824)!==0&&(le&261930)===0?(ln=!0,e.memoizedState=n):(e=MS(),Jt.lanes|=e,Aa|=e,t)}function Px(e,t,n,i,s){var a=ye.p;ye.p=a!==0&&8>a?a:8;var r=Vt.T,o={};Vt.T=o,lg(e,!1,t,n);try{var l=s(),c=Vt.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=KE(l,i);Xl(e,t,f,di(e))}else Xl(e,t,i,di(e))}catch(p){Xl(e,t,{then:function(){},status:"rejected",reason:p},di())}finally{ye.p=a,r!==null&&o.types!==null&&(r.types=o.types),Vt.T=r}}function nT(){}function lm(e,t,n,i){if(e.tag!==5)throw Error(nt(476));var s=Bx(e).queue;Px(e,s,t,ja,n===null?nT:function(){return Fx(e),n(i)})}function Bx(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:ja,baseState:ja,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fs,lastRenderedState:ja},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fs,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Fx(e){var t=Bx(e);t.next===null&&(t=e.alternate.memoizedState),Xl(e,t.next.queue,{},di())}function og(){return Tn(lc)}function zx(){return en().memoizedState}function Hx(){return en().memoizedState}function iT(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=di();e=ga(n);var i=_a(t,e,n);i!==null&&(Qn(i,t,n),Gl(i,t,n)),t={cache:qm()},e.payload=t;return}t=t.return}}function sT(e,t,n){var i=di();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Ih(e)?Gx(t,n):(n=Gm(e,t,n,i),n!==null&&(Qn(n,e,i),kx(n,t,i)))}function Vx(e,t,n){var i=di();Xl(e,t,n,i)}function Xl(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ih(e))Gx(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,pi(o,r))return Rh(e,t,s,0),Le===null&&Ch(),!1}catch{}finally{}if(n=Gm(e,t,s,i),n!==null)return Qn(n,e,i),kx(n,t,i),!0}return!1}function lg(e,t,n,i){if(i={lane:2,revertLane:_g(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Ih(e)){if(t)throw Error(nt(479))}else t=Gm(e,n,i,2),t!==null&&Qn(t,e,2)}function Ih(e){var t=e.alternate;return e===Jt||t!==null&&t===Jt}function Gx(e,t){lo=oh=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function kx(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,Cy(e,n)}}var ac={readContext:Tn,use:Lh,useCallback:Je,useContext:Je,useEffect:Je,useImperativeHandle:Je,useLayoutEffect:Je,useInsertionEffect:Je,useMemo:Je,useReducer:Je,useRef:Je,useState:Je,useDebugValue:Je,useDeferredValue:Je,useTransition:Je,useSyncExternalStore:Je,useId:Je,useHostTransitionStatus:Je,useFormState:Je,useActionState:Je,useOptimistic:Je,useMemoCache:Je,useCacheRefresh:Je};ac.useEffectEvent=Je;var Wx={readContext:Tn,use:Lh,useCallback:function(e,t){return Gn().memoizedState=[e,t===void 0?null:t],e},useContext:Tn,useEffect:wv,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Vu(4194308,4,Ux.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Vu(4194308,4,e,t)},useInsertionEffect:function(e,t){Vu(4,2,e,t)},useMemo:function(e,t){var n=Gn();t=t===void 0?null:t;var i=e();if(rr){ca(!0);try{e()}finally{ca(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=Gn();if(n!==void 0){var s=n(t);if(rr){ca(!0);try{n(t)}finally{ca(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=sT.bind(null,Jt,e),[i.memoizedState,e]},useRef:function(e){var t=Gn();return e={current:e},t.memoizedState=e},useState:function(e){e=rm(e);var t=e.queue,n=Vx.bind(null,Jt,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:ag,useDeferredValue:function(e,t){var n=Gn();return rg(n,e,t)},useTransition:function(){var e=rm(!1);return e=Px.bind(null,Jt,e.queue,!0,!1),Gn().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=Jt,s=Gn();if(he){if(n===void 0)throw Error(nt(407));n=n()}else{if(n=t(),Le===null)throw Error(nt(349));(le&127)!==0||_x(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,wv(yx.bind(null,i,a,e),[e]),i.flags|=2048,go(9,{destroy:void 0},vx.bind(null,i,a,n,t),null),n},useId:function(){var e=Gn(),t=Le.identifierPrefix;if(he){var n=is,i=ns;n=(i&~(1<<32-fi(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=lh++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=QE++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:og,useFormState:Ev,useActionState:Ev,useOptimistic:function(e){var t=Gn();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=lg.bind(null,Jt,!0,n),n.dispatch=t,[e,t]},useMemoCache:ng,useCacheRefresh:function(){return Gn().memoizedState=iT.bind(null,Jt)},useEffectEvent:function(e){var t=Gn(),n={impl:e};return t.memoizedState=n,function(){if((ve&2)!==0)throw Error(nt(440));return n.impl.apply(void 0,arguments)}}},cg={readContext:Tn,use:Lh,useCallback:Nx,useContext:Tn,useEffect:sg,useImperativeHandle:Lx,useInsertionEffect:Rx,useLayoutEffect:Dx,useMemo:Ix,useReducer:Hu,useRef:wx,useState:function(){return Hu(Fs)},useDebugValue:ag,useDeferredValue:function(e,t){var n=en();return Ox(n,Re.memoizedState,e,t)},useTransition:function(){var e=Hu(Fs)[0],t=en().memoizedState;return[typeof e=="boolean"?e:vc(e),t]},useSyncExternalStore:gx,useId:zx,useHostTransitionStatus:og,useFormState:Tv,useActionState:Tv,useOptimistic:function(e,t){var n=en();return Mx(n,Re,e,t)},useMemoCache:ng,useCacheRefresh:Hx};cg.useEffectEvent=Cx;var Xx={readContext:Tn,use:Lh,useCallback:Nx,useContext:Tn,useEffect:sg,useImperativeHandle:Lx,useInsertionEffect:Rx,useLayoutEffect:Dx,useMemo:Ix,useReducer:gp,useRef:wx,useState:function(){return gp(Fs)},useDebugValue:ag,useDeferredValue:function(e,t){var n=en();return Re===null?rg(n,e,t):Ox(n,Re.memoizedState,e,t)},useTransition:function(){var e=gp(Fs)[0],t=en().memoizedState;return[typeof e=="boolean"?e:vc(e),t]},useSyncExternalStore:gx,useId:zx,useHostTransitionStatus:og,useFormState:Av,useActionState:Av,useOptimistic:function(e,t){var n=en();return Re!==null?Mx(n,Re,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:ng,useCacheRefresh:Hx};Xx.useEffectEvent=Cx;function _p(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:Fe({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var cm={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=di(),s=ga(i);s.payload=t,n!=null&&(s.callback=n),t=_a(e,s,i),t!==null&&(Qn(t,e,i),Gl(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=di(),s=ga(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=_a(e,s,i),t!==null&&(Qn(t,e,i),Gl(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=di(),i=ga(n);i.tag=2,t!=null&&(i.callback=t),t=_a(e,i,n),t!==null&&(Qn(t,e,n),Gl(t,e,n))}};function Cv(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!tc(n,i)||!tc(s,a):!0}function Rv(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&cm.enqueueReplaceState(t,t.state,null)}function or(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=Fe({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function qx(e){th(e)}function Yx(e){console.error(e)}function Zx(e){th(e)}function ch(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function Dv(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function um(e,t,n){return n=ga(n),n.tag=3,n.payload={element:null},n.callback=function(){ch(e,t)},n}function Jx(e){return e=ga(e),e.tag=3,e}function Kx(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){Dv(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){Dv(t,n,i),typeof s!="function"&&(va===null?va=new Set([this]):va.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function aT(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&Eo(t,n,s,!0),n=mi.current,n!==null){switch(n.tag){case 31:case 13:return Li===null?ph():n.alternate===null&&Ke===0&&(Ke=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===sh?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),Cp(e,i,s)),!1;case 22:return n.flags|=65536,i===sh?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),Cp(e,i,s)),!1}throw Error(nt(435,n.tag))}return Cp(e,i,s),ph(),!1}if(he)return t=mi.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==Qp&&(e=Error(nt(422),{cause:i}),nc(Di(e,n)))):(i!==Qp&&(t=Error(nt(423),{cause:i}),nc(Di(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=Di(i,n),s=um(e.stateNode,i,s),mp(e,s),Ke!==4&&(Ke=2)),!1;var a=Error(nt(520),{cause:i});if(a=Di(a,n),Zl===null?Zl=[a]:Zl.push(a),Ke!==4&&(Ke=2),t===null)return!0;i=Di(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=um(n.stateNode,i,e),mp(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(va===null||!va.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=Jx(s),Kx(s,e,n,i),mp(n,s),!1}n=n.return}while(n!==null);return!1}var ug=Error(nt(461)),ln=!1;function Mn(e,t,n,i){t.child=e===null?ux(t,null,n,i):ar(t,e.child,n,i)}function Uv(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return sr(t),i=jm(e,t,n,r,a,s),o=$m(),e!==null&&!ln?(tg(e,t,s),zs(e,t,s)):(he&&o&&Wm(t),t.flags|=1,Mn(e,t,i,s),t.child)}function Lv(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!km(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Qx(e,t,a,i,s)):(e=Fu(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!hg(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:tc,n(r,i)&&e.ref===t.ref)return zs(e,t,s)}return t.flags|=1,e=Ns(a,i),e.ref=t.ref,e.return=t,t.child=e}function Qx(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(tc(a,i)&&e.ref===t.ref)if(ln=!1,t.pendingProps=i=a,hg(e,s))(e.flags&131072)!==0&&(ln=!0);else return t.lanes=e.lanes,zs(e,t,s)}return hm(e,t,n,i,s)}function jx(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return Nv(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&zu(t,a!==null?a.cachePool:null),a!==null?Sv(t,a):sm(),dx(t);else return i=t.lanes=536870912,Nv(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(zu(t,a.cachePool),Sv(t,a),oa(t),t.memoizedState=null):(e!==null&&zu(t,null),sm(),oa(t));return Mn(e,t,s,n),t.child}function Pl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Nv(e,t,n,i,s){var a=Ym();return a=a===null?null:{parent:on._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&zu(t,null),sm(),dx(t),e!==null&&Eo(e,t,i,!0),t.childLanes=s,null}function Gu(e,t){return t=uh({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Iv(e,t,n){return ar(t,e.child,null,n),e=Gu(t,t.pendingProps),e.flags|=2,oi(t),t.memoizedState=null,e}function rT(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(he){if(i.mode==="hidden")return e=Gu(t,i),t.lanes=536870912,Pl(null,e);if(am(t),(e=Be)?(e=WS(e,Ui),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ba!==null?{id:ns,overflow:is}:null,retryLane:536870912,hydrationErrors:null},n=ix(e),n.return=t,t.child=n,En=t,Be=null)):e=null,e===null)throw Ea(t);return t.lanes=536870912,null}return Gu(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(am(t),s)if(t.flags&256)t.flags&=-257,t=Iv(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(nt(558));else if(ln||Eo(e,t,n,!1),s=(n&e.childLanes)!==0,ln||s){if(i=Le,i!==null&&(r=Ry(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,hr(e,r),Qn(i,e,r),ug;ph(),t=Iv(e,t,n)}else e=a.treeContext,Be=Ni(r.nextSibling),En=t,he=!0,ma=null,Ui=!1,e!==null&&ax(t,e),t=Gu(t,i),t.flags|=4096;return t}return e=Ns(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function ku(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(nt(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function hm(e,t,n,i,s){return sr(t),n=jm(e,t,n,i,void 0,s),i=$m(),e!==null&&!ln?(tg(e,t,s),zs(e,t,s)):(he&&i&&Wm(t),t.flags|=1,Mn(e,t,n,s),t.child)}function Ov(e,t,n,i,s,a){return sr(t),t.updateQueue=null,n=mx(t,i,n,s),px(e),i=$m(),e!==null&&!ln?(tg(e,t,a),zs(e,t,a)):(he&&i&&Wm(t),t.flags|=1,Mn(e,t,n,a),t.child)}function Pv(e,t,n,i,s){if(sr(t),t.stateNode===null){var a=$r,r=n.contextType;typeof r=="object"&&r!==null&&(a=Tn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=cm,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},Jm(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?Tn(r):$r,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&(_p(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&cm.enqueueReplaceState(a,a.state,null),Wl(t,i,a,s),kl(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=or(n,o);a.props=l;var c=a.context,f=n.contextType;r=$r,typeof f=="object"&&f!==null&&(r=Tn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&Rv(t,a,i,r),sa=!1;var u=t.memoizedState;a.state=u,Wl(t,i,a,s),kl(),c=t.memoizedState,o||u!==c||sa?(typeof p=="function"&&(_p(t,n,p,i),c=t.memoizedState),(l=sa||Cv(t,n,l,i,u,c,r))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,nm(e,t),r=t.memoizedProps,f=or(n,r),a.props=f,p=t.pendingProps,u=a.context,c=n.contextType,l=$r,typeof c=="object"&&c!==null&&(l=Tn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==p||u!==l)&&Rv(t,a,i,l),sa=!1,u=t.memoizedState,a.state=u,Wl(t,i,a,s),kl();var d=t.memoizedState;r!==p||u!==d||sa||e!==null&&e.dependencies!==null&&ih(e.dependencies)?(typeof o=="function"&&(_p(t,n,o,i),d=t.memoizedState),(f=sa||Cv(t,n,f,i,u,d,l)||e!==null&&e.dependencies!==null&&ih(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,d,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,d,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=d),a.props=i,a.state=d,a.context=l,i=f):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,ku(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=ar(t,e.child,null,s),t.child=ar(t,null,n,s)):Mn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=zs(e,t,s),e}function Bv(e,t,n,i){return ir(),t.flags|=256,Mn(e,t,n,i),t.child}var vp={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function yp(e){return{baseLanes:e,cachePool:ox()}}function xp(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=ci),e}function $x(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(tn.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(he){if(s?ra(t):oa(t),(e=Be)?(e=WS(e,Ui),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ba!==null?{id:ns,overflow:is}:null,retryLane:536870912,hydrationErrors:null},n=ix(e),n.return=t,t.child=n,En=t,Be=null)):e=null,e===null)throw Ea(t);return Tm(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(oa(t),s=t.mode,o=uh({mode:"hidden",children:o},s),i=$a(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=yp(n),i.childLanes=xp(e,r,n),t.memoizedState=vp,Pl(null,i)):(ra(t),fm(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(ra(t),t.flags&=-257,t=Sp(e,t,n)):t.memoizedState!==null?(oa(t),t.child=e.child,t.flags|=128,t=null):(oa(t),o=i.fallback,s=t.mode,i=uh({mode:"visible",children:i.children},s),o=$a(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,ar(t,e.child,null,n),i=t.child,i.memoizedState=yp(n),i.childLanes=xp(e,r,n),t.memoizedState=vp,t=Pl(null,i));else if(ra(t),Tm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error(nt(419)),i.stack="",i.digest=r,nc({value:i,source:null,stack:null}),t=Sp(e,t,n)}else if(ln||Eo(e,t,n,!1),r=(n&e.childLanes)!==0,ln||r){if(r=Le,r!==null&&(i=Ry(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,hr(e,i),Qn(r,e,i),ug;Em(o)||ph(),t=Sp(e,t,n)}else Em(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Be=Ni(o.nextSibling),En=t,he=!0,ma=null,Ui=!1,e!==null&&ax(t,e),t=fm(t,i.children),t.flags|=4096);return t}return s?(oa(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=Ns(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=Ns(c,o):(o=$a(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,Pl(null,i),i=t.child,o=e.child.memoizedState,o===null?o=yp(n):(s=o.cachePool,s!==null?(l=on._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=ox(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=xp(e,r,n),t.memoizedState=vp,Pl(e.child,i)):(ra(t),n=e.child,e=n.sibling,n=Ns(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function fm(e,t){return t=uh({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function uh(e,t){return e=li(22,e,null,t),e.lanes=0,e}function Sp(e,t,n){return ar(t,e.child,null,n),e=fm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Fv(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),$p(e.return,t,n)}function Mp(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function tS(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=tn.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,Ne(tn,r),Mn(e,t,i,n),i=he?ec:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Fv(e,n,t);else if(e.tag===19)Fv(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&rh(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),Mp(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&rh(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}Mp(t,!0,n,null,a,i);break;case"together":Mp(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function zs(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Aa|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Eo(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(nt(153));if(t.child!==null){for(e=t.child,n=Ns(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Ns(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function hg(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&ih(e)))}function oT(e,t,n){switch(t.tag){case 3:Ku(t,t.stateNode.containerInfo),aa(t,on,e.memoizedState.cache),ir();break;case 27:case 5:Hp(t);break;case 4:Ku(t,t.stateNode.containerInfo);break;case 10:aa(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,am(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(ra(t),t.flags|=128,null):(n&t.child.childLanes)!==0?$x(e,t,n):(ra(t),e=zs(e,t,n),e!==null?e.sibling:null);ra(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(Eo(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return tS(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),Ne(tn,tn.current),i)break;return null;case 22:return t.lanes=0,jx(e,t,n,t.pendingProps);case 24:aa(t,on,e.memoizedState.cache)}return zs(e,t,n)}function eS(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)ln=!0;else{if(!hg(e,n)&&(t.flags&128)===0)return ln=!1,oT(e,t,n);ln=(e.flags&131072)!==0}else ln=!1,he&&(t.flags&1048576)!==0&&sx(t,ec,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=Ka(t.elementType),t.type=e,typeof e=="function")km(e)?(i=or(e,i),t.tag=1,t=Pv(null,t,e,i,n)):(t.tag=0,t=hm(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===Rm){t.tag=11,t=Uv(null,t,e,i,n);break t}else if(s===Dm){t.tag=14,t=Lv(null,t,e,i,n);break t}}throw t=Fp(e)||e,Error(nt(306,t,""))}}return t;case 0:return hm(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=or(i,t.pendingProps),Pv(e,t,i,s,n);case 3:t:{if(Ku(t,t.stateNode.containerInfo),e===null)throw Error(nt(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,nm(e,t),Wl(t,i,null,n);var r=t.memoizedState;if(i=r.cache,aa(t,on,i),i!==a.cache&&tm(t,[on],n,!0),kl(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Bv(e,t,i,n);break t}else if(i!==s){s=Di(Error(nt(424)),t),nc(s),t=Bv(e,t,i,n);break t}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Be=Ni(e.firstChild),En=t,he=!0,ma=null,Ui=!0,n=ux(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ir(),i===s){t=zs(e,t,n);break t}Mn(e,t,i,n)}t=t.child}return t;case 26:return ku(e,t),e===null?(n=ry(t.type,null,t.pendingProps,null))?t.memoizedState=n:he||(n=t.type,e=t.pendingProps,i=vh(pa.current).createElement(n),i[bn]=t,i[jn]=e,An(i,n,e),_n(i),t.stateNode=i):t.memoizedState=ry(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Hp(t),e===null&&he&&(i=t.stateNode=XS(t.type,t.pendingProps,pa.current),En=t,Ui=!0,s=Be,Ca(t.type)?(Am=s,Be=Ni(i.firstChild)):Be=s),Mn(e,t,t.pendingProps.children,n),ku(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&he&&((s=i=Be)&&(i=OT(i,t.type,t.pendingProps,Ui),i!==null?(t.stateNode=i,En=t,Be=Ni(i.firstChild),Ui=!1,s=!0):s=!1),s||Ea(t)),Hp(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,Mm(s,a)?i=null:r!==null&&Mm(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=jm(e,t,jE,null,null,n),lc._currentValue=s),ku(e,t),Mn(e,t,i,n),t.child;case 6:return e===null&&he&&((e=n=Be)&&(n=PT(n,t.pendingProps,Ui),n!==null?(t.stateNode=n,En=t,Be=null,e=!0):e=!1),e||Ea(t)),null;case 13:return $x(e,t,n);case 4:return Ku(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=ar(t,null,i,n):Mn(e,t,i,n),t.child;case 11:return Uv(e,t,t.type,t.pendingProps,n);case 7:return Mn(e,t,t.pendingProps,n),t.child;case 8:return Mn(e,t,t.pendingProps.children,n),t.child;case 12:return Mn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,aa(t,t.type,i.value),Mn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,sr(t),s=Tn(s),i=i(s),t.flags|=1,Mn(e,t,i,n),t.child;case 14:return Lv(e,t,t.type,t.pendingProps,n);case 15:return Qx(e,t,t.type,t.pendingProps,n);case 19:return tS(e,t,n);case 31:return rT(e,t,n);case 22:return jx(e,t,n,t.pendingProps);case 24:return sr(t),i=Tn(on),e===null?(s=Ym(),s===null&&(s=Le,a=qm(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},Jm(t),aa(t,on,s)):((e.lanes&n)!==0&&(nm(e,t),Wl(t,null,null,n),kl()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),aa(t,on,i)):(i=a.cache,aa(t,on,i),i!==s.cache&&tm(t,[on],n,!0))),Mn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(nt(156,t.tag))}function Es(e){e.flags|=4}function bp(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(TS())e.flags|=8192;else throw er=sh,Zm}else e.flags&=-16777217}function zv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!ZS(t))if(TS())e.flags|=8192;else throw er=sh,Zm}function wu(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Ay():536870912,e.lanes|=t,_o|=t)}function Rl(e,t){if(!he)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function Pe(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function lT(e,t,n){var i=t.pendingProps;switch(Xm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Pe(t),null;case 1:return Pe(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Is(on),uo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Vr(t)?Es(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,pp())),Pe(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(Es(t),a!==null?(Pe(t),zv(t,a)):(Pe(t),bp(t,s,null,i,n))):a?a!==e.memoizedState?(Es(t),Pe(t),zv(t,a)):(Pe(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Es(t),Pe(t),bp(t,s,e,i,n)),null;case 27:if(Qu(t),n=pa.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Es(t);else{if(!i){if(t.stateNode===null)throw Error(nt(166));return Pe(t),null}e=as.current,Vr(t)?pv(t,e):(e=XS(s,i,n),t.stateNode=e,Es(t))}return Pe(t),null;case 5:if(Qu(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Es(t);else{if(!i){if(t.stateNode===null)throw Error(nt(166));return Pe(t),null}if(a=as.current,Vr(t))pv(t,a);else{var r=vh(pa.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[bn]=t,a[jn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(An(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&Es(t)}}return Pe(t),bp(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Es(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(nt(166));if(e=pa.current,Vr(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=En,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[bn]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||VS(e.nodeValue,n)),e||Ea(t,!0)}else e=vh(e).createTextNode(i),e[bn]=t,t.stateNode=e}return Pe(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Vr(t),n!==null){if(e===null){if(!i)throw Error(nt(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(nt(557));e[bn]=t}else ir(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Pe(t),e=!1}else n=pp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(oi(t),t):(oi(t),null);if((t.flags&128)!==0)throw Error(nt(558))}return Pe(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Vr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error(nt(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(nt(317));s[bn]=t}else ir(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Pe(t),s=!1}else s=pp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(oi(t),t):(oi(t),null)}return oi(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),wu(t,t.updateQueue),Pe(t),null);case 4:return uo(),e===null&&vg(t.stateNode.containerInfo),Pe(t),null;case 10:return Is(t.type),Pe(t),null;case 19:if(vn(tn),i=t.memoizedState,i===null)return Pe(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)Rl(i,!1);else{if(Ke!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=rh(e),a!==null){for(t.flags|=128,Rl(i,!1),e=a.updateQueue,t.updateQueue=e,wu(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)nx(n,e),n=n.sibling;return Ne(tn,tn.current&1|2),he&&Cs(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&ui()>fh&&(t.flags|=128,s=!0,Rl(i,!1),t.lanes=4194304)}else{if(!s)if(e=rh(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,wu(t,e),Rl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!he)return Pe(t),null}else 2*ui()-i.renderingStartTime>fh&&n!==536870912&&(t.flags|=128,s=!0,Rl(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=ui(),e.sibling=null,n=tn.current,Ne(tn,s?n&1|2:n&1),he&&Cs(t,i.treeForkCount),e):(Pe(t),null);case 22:case 23:return oi(t),Km(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(Pe(t),t.subtreeFlags&6&&(t.flags|=8192)):Pe(t),n=t.updateQueue,n!==null&&wu(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&vn(tr),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Is(on),Pe(t),null;case 25:return null;case 30:return null}throw Error(nt(156,t.tag))}function cT(e,t){switch(Xm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Is(on),uo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Qu(t),null;case 31:if(t.memoizedState!==null){if(oi(t),t.alternate===null)throw Error(nt(340));ir()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(oi(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(nt(340));ir()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return vn(tn),null;case 4:return uo(),null;case 10:return Is(t.type),null;case 22:case 23:return oi(t),Km(),e!==null&&vn(tr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Is(on),null;case 25:return null;default:return null}}function nS(e,t){switch(Xm(t),t.tag){case 3:Is(on),uo();break;case 26:case 27:case 5:Qu(t);break;case 4:uo();break;case 31:t.memoizedState!==null&&oi(t);break;case 13:oi(t);break;case 19:vn(tn);break;case 10:Is(t.type);break;case 22:case 23:oi(t),Km(),e!==null&&vn(tr);break;case 24:Is(on)}}function yc(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){Te(t,t.return,o)}}function Ta(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(f){Te(s,l,f)}}}i=i.next}while(i!==a)}}catch(f){Te(t,t.return,f)}}function iS(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{fx(t,n)}catch(i){Te(e,e.return,i)}}}function sS(e,t,n){n.props=or(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){Te(e,t,i)}}function ql(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){Te(e,t,s)}}function ss(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){Te(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){Te(e,t,s)}else n.current=null}function aS(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){Te(e,e.return,s)}}function Ep(e,t,n){try{var i=e.stateNode;RT(i,e.type,n,t),i[jn]=t}catch(s){Te(e,e.return,s)}}function rS(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Ca(e.type)||e.tag===4}function Tp(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||rS(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Ca(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function dm(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Us));else if(i!==4&&(i===27&&Ca(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(dm(e,t,n),e=e.sibling;e!==null;)dm(e,t,n),e=e.sibling}function hh(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&Ca(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(hh(e,t,n),e=e.sibling;e!==null;)hh(e,t,n),e=e.sibling}function oS(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);An(t,i,n),t[bn]=e,t[jn]=n}catch(a){Te(e,e.return,a)}}var Rs=!1,rn=!1,Ap=!1,Hv=typeof WeakSet=="function"?WeakSet:Set,gn=null;function uT(e,t){if(e=e.containerInfo,xm=Mh,e=Zy(e),Hm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,f=0,p=e,u=null;e:for(;;){for(var d;p!==n||s!==0&&p.nodeType!==3||(o=r+s),p!==a||i!==0&&p.nodeType!==3||(l=r+i),p.nodeType===3&&(r+=p.nodeValue.length),(d=p.firstChild)!==null;)u=p,p=d;for(;;){if(p===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++f===i&&(l=r),(d=p.nextSibling)!==null)break;p=u,u=p.parentNode}p=d}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Sm={focusedElem:e,selectionRange:n},Mh=!1,gn=t;gn!==null;)if(t=gn,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,gn=e;else for(;gn!==null;){switch(t=gn,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var v=or(n.type,s);e=i.getSnapshotBeforeUpdate(v,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(E){Te(n,n.return,E)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)bm(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":bm(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(nt(163))}if(e=t.sibling,e!==null){e.return=t.return,gn=e;break}gn=t.return}}function lS(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:As(e,n),i&4&&yc(5,n);break;case 1:if(As(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){Te(n,n.return,r)}else{var s=or(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){Te(n,n.return,r)}}i&64&&iS(n),i&512&&ql(n,n.return);break;case 3:if(As(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{fx(e,t)}catch(r){Te(n,n.return,r)}}break;case 27:t===null&&i&4&&oS(n);case 26:case 5:As(e,n),t===null&&i&4&&aS(n),i&512&&ql(n,n.return);break;case 12:As(e,n);break;case 31:As(e,n),i&4&&hS(e,n);break;case 13:As(e,n),i&4&&fS(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=yT.bind(null,n),BT(e,n))));break;case 22:if(i=n.memoizedState!==null||Rs,!i){t=t!==null&&t.memoizedState!==null||rn,s=Rs;var a=rn;Rs=i,(rn=t)&&!a?ws(e,n,(n.subtreeFlags&8772)!==0):As(e,n),Rs=s,rn=a}break;case 30:break;default:As(e,n)}}function cS(e){var t=e.alternate;t!==null&&(e.alternate=null,cS(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Im(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var We=null,Jn=!1;function Ts(e,t,n){for(n=n.child;n!==null;)uS(e,t,n),n=n.sibling}function uS(e,t,n){if(hi&&typeof hi.onCommitFiberUnmount=="function")try{hi.onCommitFiberUnmount(fc,n)}catch{}switch(n.tag){case 26:rn||ss(n,t),Ts(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:rn||ss(n,t);var i=We,s=Jn;Ca(n.type)&&(We=n.stateNode,Jn=!1),Ts(e,t,n),Kl(n.stateNode),We=i,Jn=s;break;case 5:rn||ss(n,t);case 6:if(i=We,s=Jn,We=null,Ts(e,t,n),We=i,Jn=s,We!==null)if(Jn)try{(We.nodeType===9?We.body:We.nodeName==="HTML"?We.ownerDocument.body:We).removeChild(n.stateNode)}catch(a){Te(n,t,a)}else try{We.removeChild(n.stateNode)}catch(a){Te(n,t,a)}break;case 18:We!==null&&(Jn?(e=We,ey(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),So(e)):ey(We,n.stateNode));break;case 4:i=We,s=Jn,We=n.stateNode.containerInfo,Jn=!0,Ts(e,t,n),We=i,Jn=s;break;case 0:case 11:case 14:case 15:Ta(2,n,t),rn||Ta(4,n,t),Ts(e,t,n);break;case 1:rn||(ss(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&sS(n,t,i)),Ts(e,t,n);break;case 21:Ts(e,t,n);break;case 22:rn=(i=rn)||n.memoizedState!==null,Ts(e,t,n),rn=i;break;default:Ts(e,t,n)}}function hS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{So(e)}catch(n){Te(t,t.return,n)}}}function fS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{So(e)}catch(n){Te(t,t.return,n)}}function hT(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Hv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Hv),t;default:throw Error(nt(435,e.tag))}}function Cu(e,t){var n=hT(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=xT.bind(null,e,i);i.then(s,s)}})}function Yn(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(Ca(o.type)){We=o.stateNode,Jn=!1;break t}break;case 5:We=o.stateNode,Jn=!1;break t;case 3:case 4:We=o.stateNode.containerInfo,Jn=!0;break t}o=o.return}if(We===null)throw Error(nt(160));uS(a,r,s),We=null,Jn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)dS(t,e),t=t.sibling}var Gi=null;function dS(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Yn(t,e),Zn(e),i&4&&(Ta(3,e,e.return),yc(3,e),Ta(5,e,e.return));break;case 1:Yn(t,e),Zn(e),i&512&&(rn||n===null||ss(n,n.return)),i&64&&Rs&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Gi;if(Yn(t,e),Zn(e),i&512&&(rn||n===null||ss(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[mc]||a[bn]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),An(a,i,n),a[bn]=e,_n(a),i=a;break t;case"link":var r=ly("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),An(a,i,n),s.head.appendChild(a);break;case"meta":if(r=ly("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),An(a,i,n),s.head.appendChild(a);break;default:throw Error(nt(468,i))}a[bn]=e,_n(a),i=a}e.stateNode=i}else cy(s,e.type,e.stateNode);else e.stateNode=oy(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?cy(s,e.type,e.stateNode):oy(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&Ep(e,e.memoizedProps,n.memoizedProps)}break;case 27:Yn(t,e),Zn(e),i&512&&(rn||n===null||ss(n,n.return)),n!==null&&i&4&&Ep(e,e.memoizedProps,n.memoizedProps);break;case 5:if(Yn(t,e),Zn(e),i&512&&(rn||n===null||ss(n,n.return)),e.flags&32){s=e.stateNode;try{fo(s,"")}catch(v){Te(e,e.return,v)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,Ep(e,s,n!==null?n.memoizedProps:s)),i&1024&&(Ap=!0);break;case 6:if(Yn(t,e),Zn(e),i&4){if(e.stateNode===null)throw Error(nt(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(v){Te(e,e.return,v)}}break;case 3:if(qu=null,s=Gi,Gi=yh(t.containerInfo),Yn(t,e),Gi=s,Zn(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{So(t.containerInfo)}catch(v){Te(e,e.return,v)}Ap&&(Ap=!1,pS(e));break;case 4:i=Gi,Gi=yh(e.stateNode.containerInfo),Yn(t,e),Zn(e),Gi=i;break;case 12:Yn(t,e),Zn(e);break;case 31:Yn(t,e),Zn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Cu(e,i)));break;case 13:Yn(t,e),Zn(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Oh=ui()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Cu(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=Rs,f=rn;if(Rs=c||s,rn=f||l,Yn(t,e),rn=f,Rs=c,Zn(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||Rs||rn||Qa(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var p=l.memoizedProps.style,u=p!=null&&p.hasOwnProperty("display")?p.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(v){Te(l,l.return,v)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(v){Te(l,l.return,v)}}}else if(t.tag===18){if(n===null){l=t;try{var d=l.stateNode;s?ny(d,!0):ny(l.stateNode,!1)}catch(v){Te(l,l.return,v)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Cu(e,n))));break;case 19:Yn(t,e),Zn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Cu(e,i)));break;case 30:break;case 21:break;default:Yn(t,e),Zn(e)}}function Zn(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(rS(i)){n=i;break}i=i.return}if(n==null)throw Error(nt(160));switch(n.tag){case 27:var s=n.stateNode,a=Tp(e);hh(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&(fo(r,""),n.flags&=-33);var o=Tp(e);hh(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Tp(e);dm(e,c,l);break;default:throw Error(nt(161))}}catch(f){Te(e,e.return,f)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function pS(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;pS(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function As(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)lS(e,t.alternate,t),t=t.sibling}function Qa(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Ta(4,t,t.return),Qa(t);break;case 1:ss(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&sS(t,t.return,n),Qa(t);break;case 27:Kl(t.stateNode);case 26:case 5:ss(t,t.return),Qa(t);break;case 22:t.memoizedState===null&&Qa(t);break;case 30:Qa(t);break;default:Qa(t)}e=e.sibling}}function ws(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:ws(s,a,n),yc(4,a);break;case 1:if(ws(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){Te(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)hx(l[s],o)}catch(c){Te(i,i.return,c)}}n&&r&64&&iS(a),ql(a,a.return);break;case 27:oS(a);case 26:case 5:ws(s,a,n),n&&i===null&&r&4&&aS(a),ql(a,a.return);break;case 12:ws(s,a,n);break;case 31:ws(s,a,n),n&&r&4&&hS(s,a);break;case 13:ws(s,a,n),n&&r&4&&fS(s,a);break;case 22:a.memoizedState===null&&ws(s,a,n),ql(a,a.return);break;case 30:break;default:ws(s,a,n)}t=t.sibling}}function fg(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&_c(n))}function dg(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&_c(e))}function Vi(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)mS(e,t,n,i),t=t.sibling}function mS(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:Vi(e,t,n,i),s&2048&&yc(9,t);break;case 1:Vi(e,t,n,i);break;case 3:Vi(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&_c(e)));break;case 12:if(s&2048){Vi(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){Te(t,t.return,l)}}else Vi(e,t,n,i);break;case 31:Vi(e,t,n,i);break;case 13:Vi(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?Vi(e,t,n,i):Yl(e,t):a._visibility&2?Vi(e,t,n,i):(a._visibility|=2,kr(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&fg(r,t);break;case 24:Vi(e,t,n,i),s&2048&&dg(t.alternate,t);break;default:Vi(e,t,n,i)}}function kr(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:kr(a,r,o,l,s),yc(8,r);break;case 23:break;case 22:var f=r.stateNode;r.memoizedState!==null?f._visibility&2?kr(a,r,o,l,s):Yl(a,r):(f._visibility|=2,kr(a,r,o,l,s)),s&&c&2048&&fg(r.alternate,r);break;case 24:kr(a,r,o,l,s),s&&c&2048&&dg(r.alternate,r);break;default:kr(a,r,o,l,s)}t=t.sibling}}function Yl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:Yl(n,i),s&2048&&fg(i.alternate,i);break;case 24:Yl(n,i),s&2048&&dg(i.alternate,i);break;default:Yl(n,i)}t=t.sibling}}var Bl=8192;function Gr(e,t,n){if(e.subtreeFlags&Bl)for(e=e.child;e!==null;)gS(e,t,n),e=e.sibling}function gS(e,t,n){switch(e.tag){case 26:Gr(e,t,n),e.flags&Bl&&e.memoizedState!==null&&JT(n,Gi,e.memoizedState,e.memoizedProps);break;case 5:Gr(e,t,n);break;case 3:case 4:var i=Gi;Gi=yh(e.stateNode.containerInfo),Gr(e,t,n),Gi=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Bl,Bl=16777216,Gr(e,t,n),Bl=i):Gr(e,t,n));break;default:Gr(e,t,n)}}function _S(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Dl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];gn=i,yS(i,e)}_S(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)vS(e),e=e.sibling}function vS(e){switch(e.tag){case 0:case 11:case 15:Dl(e),e.flags&2048&&Ta(9,e,e.return);break;case 3:Dl(e);break;case 12:Dl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Wu(e)):Dl(e);break;default:Dl(e)}}function Wu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];gn=i,yS(i,e)}_S(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ta(8,t,t.return),Wu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Wu(t));break;default:Wu(t)}e=e.sibling}}function yS(e,t){for(;gn!==null;){var n=gn;switch(n.tag){case 0:case 11:case 15:Ta(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:_c(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,gn=i;else t:for(n=e;gn!==null;){i=gn;var s=i.sibling,a=i.return;if(cS(i),i===n){gn=null;break t}if(s!==null){s.return=a,gn=s;break t}gn=a}}}var fT={getCacheForType:function(e){var t=Tn(on),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Tn(on).controller.signal}},dT=typeof WeakMap=="function"?WeakMap:Map,ve=0,Le=null,ae=null,le=0,Ee=0,ri=null,ha=!1,Ao=!1,pg=!1,Hs=0,Ke=0,Aa=0,nr=0,mg=0,ci=0,_o=0,Zl=null,Kn=null,pm=!1,Oh=0,xS=0,fh=1/0,dh=null,va=null,hn=0,ya=null,vo=null,Os=0,mm=0,gm=null,SS=null,Jl=0,_m=null;function di(){return(ve&2)!==0&&le!==0?le&-le:Vt.T!==null?_g():Dy()}function MS(){if(ci===0)if((le&536870912)===0||he){var e=vu;vu<<=1,(vu&3932160)===0&&(vu=262144),ci=e}else ci=536870912;return e=mi.current,e!==null&&(e.flags|=32),ci}function Qn(e,t,n){(e===Le&&(Ee===2||Ee===9)||e.cancelPendingCommit!==null)&&(yo(e,0),fa(e,le,ci,!1)),pc(e,n),((ve&2)===0||e!==Le)&&(e===Le&&((ve&2)===0&&(nr|=n),Ke===4&&fa(e,le,ci,!1)),os(e))}function bS(e,t,n){if((ve&6)!==0)throw Error(nt(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||dc(e,t),s=i?gT(e,t):wp(e,t,!0),a=i;do{if(s===0){Ao&&!i&&fa(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!pT(n)){s=wp(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=Zl;var l=o.current.memoizedState.isDehydrated;if(l&&(yo(o,r).flags|=256),r=wp(o,r,!1),r!==2){if(pg&&!l){o.errorRecoveryDisabledLanes|=a,nr|=a,s=4;break t}a=Kn,Kn=s,a!==null&&(Kn===null?Kn=a:Kn.push.apply(Kn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){yo(e,0),fa(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error(nt(345));case 4:if((t&4194048)!==t)break;case 6:fa(i,t,ci,!ha);break t;case 2:Kn=null;break;case 3:case 5:break;default:throw Error(nt(329))}if((t&62914560)===t&&(s=Oh+300-ui(),10<s)){if(fa(i,t,ci,!ha),Eh(i,0,!0)!==0)break t;Os=t,i.timeoutHandle=kS(Vv.bind(null,i,n,Kn,dh,pm,t,ci,nr,_o,ha,a,"Throttled",-0,0),s);break t}Vv(i,n,Kn,dh,pm,t,ci,nr,_o,ha,a,null,-0,0)}}break}while(!0);os(e)}function Vv(e,t,n,i,s,a,r,o,l,c,f,p,u,d){if(e.timeoutHandle=-1,p=t.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Us},gS(t,a,p);var v=(a&62914560)===a?Oh-ui():(a&4194048)===a?xS-ui():0;if(v=KT(p,v),v!==null){Os=a,e.cancelPendingCommit=v(kv.bind(null,e,t,a,n,i,s,r,o,l,f,p,null,u,d)),fa(e,a,r,!c);return}}kv(e,t,a,n,i,s,r,o,l)}function pT(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!pi(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function fa(e,t,n,i){t&=~mg,t&=~nr,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-fi(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&wy(e,n,t)}function Ph(){return(ve&6)===0?(xc(0,!1),!1):!0}function gg(){if(ae!==null){if(Ee===0)var e=ae.return;else e=ae,Ls=fr=null,eg(e),oo=null,ic=0,e=ae;for(;e!==null;)nS(e.alternate,e),e=e.return;ae=null}}function yo(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,LT(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),Os=0,gg(),Le=e,ae=n=Ns(e.current,null),le=t,Ee=0,ri=null,ha=!1,Ao=dc(e,t),pg=!1,_o=ci=mg=nr=Aa=Ke=0,Kn=Zl=null,pm=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-fi(i),a=1<<s;t|=e[s],i&=~a}return Hs=t,Ch(),n}function ES(e,t){Jt=null,Vt.H=ac,t===To||t===Dh?(t=yv(),Ee=3):t===Zm?(t=yv(),Ee=4):Ee=t===ug?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ri=t,ae===null&&(Ke=1,ch(e,Di(t,e.current)))}function TS(){var e=mi.current;return e===null?!0:(le&4194048)===le?Li===null:(le&62914560)===le||(le&536870912)!==0?e===Li:!1}function AS(){var e=Vt.H;return Vt.H=ac,e===null?ac:e}function wS(){var e=Vt.A;return Vt.A=fT,e}function ph(){Ke=4,ha||(le&4194048)!==le&&mi.current!==null||(Ao=!0),(Aa&134217727)===0&&(nr&134217727)===0||Le===null||fa(Le,le,ci,!1)}function wp(e,t,n){var i=ve;ve|=2;var s=AS(),a=wS();(Le!==e||le!==t)&&(dh=null,yo(e,t)),t=!1;var r=Ke;t:do try{if(Ee!==0&&ae!==null){var o=ae,l=ri;switch(Ee){case 8:gg(),r=6;break t;case 3:case 2:case 9:case 6:mi.current===null&&(t=!0);var c=Ee;if(Ee=0,ri=null,no(e,o,l,c),n&&Ao){r=0;break t}break;default:c=Ee,Ee=0,ri=null,no(e,o,l,c)}}mT(),r=Ke;break}catch(f){ES(e,f)}while(!0);return t&&e.shellSuspendCounter++,Ls=fr=null,ve=i,Vt.H=s,Vt.A=a,ae===null&&(Le=null,le=0,Ch()),r}function mT(){for(;ae!==null;)CS(ae)}function gT(e,t){var n=ve;ve|=2;var i=AS(),s=wS();Le!==e||le!==t?(dh=null,fh=ui()+500,yo(e,t)):Ao=dc(e,t);t:do try{if(Ee!==0&&ae!==null){t=ae;var a=ri;e:switch(Ee){case 1:Ee=0,ri=null,no(e,t,a,1);break;case 2:case 9:if(vv(a)){Ee=0,ri=null,Gv(t);break}t=function(){Ee!==2&&Ee!==9||Le!==e||(Ee=7),os(e)},a.then(t,t);break t;case 3:Ee=7;break t;case 4:Ee=5;break t;case 7:vv(a)?(Ee=0,ri=null,Gv(t)):(Ee=0,ri=null,no(e,t,a,7));break;case 5:var r=null;switch(ae.tag){case 26:r=ae.memoizedState;case 5:case 27:var o=ae;if(r?ZS(r):o.stateNode.complete){Ee=0,ri=null;var l=o.sibling;if(l!==null)ae=l;else{var c=o.return;c!==null?(ae=c,Bh(c)):ae=null}break e}}Ee=0,ri=null,no(e,t,a,5);break;case 6:Ee=0,ri=null,no(e,t,a,6);break;case 8:gg(),Ke=6;break t;default:throw Error(nt(462))}}_T();break}catch(f){ES(e,f)}while(!0);return Ls=fr=null,Vt.H=i,Vt.A=s,ve=n,ae!==null?0:(Le=null,le=0,Ch(),Ke)}function _T(){for(;ae!==null&&!H1();)CS(ae)}function CS(e){var t=eS(e.alternate,e,Hs);e.memoizedProps=e.pendingProps,t===null?Bh(e):ae=t}function Gv(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Ov(n,t,t.pendingProps,t.type,void 0,le);break;case 11:t=Ov(n,t,t.pendingProps,t.type.render,t.ref,le);break;case 5:eg(t);default:nS(n,t),t=ae=nx(t,Hs),t=eS(n,t,Hs)}e.memoizedProps=e.pendingProps,t===null?Bh(e):ae=t}function no(e,t,n,i){Ls=fr=null,eg(t),oo=null,ic=0;var s=t.return;try{if(aT(e,s,t,n,le)){Ke=1,ch(e,Di(n,e.current)),ae=null;return}}catch(a){if(s!==null)throw ae=s,a;Ke=1,ch(e,Di(n,e.current)),ae=null;return}t.flags&32768?(he||i===1?e=!0:Ao||(le&536870912)!==0?e=!1:(ha=e=!0,(i===2||i===9||i===3||i===6)&&(i=mi.current,i!==null&&i.tag===13&&(i.flags|=16384))),RS(t,e)):Bh(t)}function Bh(e){var t=e;do{if((t.flags&32768)!==0){RS(t,ha);return}e=t.return;var n=lT(t.alternate,t,Hs);if(n!==null){ae=n;return}if(t=t.sibling,t!==null){ae=t;return}ae=t=e}while(t!==null);Ke===0&&(Ke=5)}function RS(e,t){do{var n=cT(e.alternate,e);if(n!==null){n.flags&=32767,ae=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){ae=e;return}ae=e=n}while(e!==null);Ke=6,ae=null}function kv(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do Fh();while(hn!==0);if((ve&6)!==0)throw Error(nt(327));if(t!==null){if(t===e.current)throw Error(nt(177));if(a=t.lanes|t.childLanes,a|=Vm,K1(e,n,a,r,o,l),e===Le&&(ae=Le=null,le=0),vo=t,ya=e,Os=n,mm=a,gm=s,SS=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,ST(ju,function(){return IS(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=Vt.T,Vt.T=null,s=ye.p,ye.p=2,r=ve,ve|=4;try{uT(e,t,n)}finally{ve=r,ye.p=s,Vt.T=i}}hn=1,DS(),US(),LS()}}function DS(){if(hn===1){hn=0;var e=ya,t=vo,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=Vt.T,Vt.T=null;var i=ye.p;ye.p=2;var s=ve;ve|=4;try{dS(t,e);var a=Sm,r=Zy(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&Yy(o.ownerDocument.documentElement,o)){if(l!==null&&Hm(o)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(f,o.value.length);else{var p=o.ownerDocument||document,u=p&&p.defaultView||window;if(u.getSelection){var d=u.getSelection(),v=o.textContent.length,E=Math.min(l.start,v),m=l.end===void 0?E:Math.min(l.end,v);!d.extend&&E>m&&(r=m,m=E,E=r);var h=hv(o,E),g=hv(o,m);if(h&&g&&(d.rangeCount!==1||d.anchorNode!==h.node||d.anchorOffset!==h.offset||d.focusNode!==g.node||d.focusOffset!==g.offset)){var M=p.createRange();M.setStart(h.node,h.offset),d.removeAllRanges(),E>m?(d.addRange(M),d.extend(g.node,g.offset)):(M.setEnd(g.node,g.offset),d.addRange(M))}}}}for(p=[],d=o;d=d.parentNode;)d.nodeType===1&&p.push({element:d,left:d.scrollLeft,top:d.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<p.length;o++){var y=p[o];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}Mh=!!xm,Sm=xm=null}finally{ve=s,ye.p=i,Vt.T=n}}e.current=t,hn=2}}function US(){if(hn===2){hn=0;var e=ya,t=vo,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=Vt.T,Vt.T=null;var i=ye.p;ye.p=2;var s=ve;ve|=4;try{lS(e,t.alternate,t)}finally{ve=s,ye.p=i,Vt.T=n}}hn=3}}function LS(){if(hn===4||hn===3){hn=0,V1();var e=ya,t=vo,n=Os,i=SS;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?hn=5:(hn=0,vo=ya=null,NS(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(va=null),Nm(n),t=t.stateNode,hi&&typeof hi.onCommitFiberRoot=="function")try{hi.onCommitFiberRoot(fc,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=Vt.T,s=ye.p,ye.p=2,Vt.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{Vt.T=t,ye.p=s}}(Os&3)!==0&&Fh(),os(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===_m?Jl++:(Jl=0,_m=e):Jl=0,xc(0,!1)}}function NS(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,_c(t)))}function Fh(){return DS(),US(),LS(),IS()}function IS(){if(hn!==5)return!1;var e=ya,t=mm;mm=0;var n=Nm(Os),i=Vt.T,s=ye.p;try{ye.p=32>n?32:n,Vt.T=null,n=gm,gm=null;var a=ya,r=Os;if(hn=0,vo=ya=null,Os=0,(ve&6)!==0)throw Error(nt(331));var o=ve;if(ve|=4,vS(a.current),mS(a,a.current,r,n),ve=o,xc(0,!1),hi&&typeof hi.onPostCommitFiberRoot=="function")try{hi.onPostCommitFiberRoot(fc,a)}catch{}return!0}finally{ye.p=s,Vt.T=i,NS(e,t)}}function Wv(e,t,n){t=Di(n,t),t=um(e.stateNode,t,2),e=_a(e,t,2),e!==null&&(pc(e,2),os(e))}function Te(e,t,n){if(e.tag===3)Wv(e,e,n);else for(;t!==null;){if(t.tag===3){Wv(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(va===null||!va.has(i))){e=Di(n,e),n=Jx(2),i=_a(t,n,2),i!==null&&(Kx(n,i,t,e),pc(i,2),os(i));break}}t=t.return}}function Cp(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new dT;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(pg=!0,s.add(n),e=vT.bind(null,e,t,n),t.then(e,e))}function vT(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Le===e&&(le&n)===n&&(Ke===4||Ke===3&&(le&62914560)===le&&300>ui()-Oh?(ve&2)===0&&yo(e,0):mg|=n,_o===le&&(_o=0)),os(e)}function OS(e,t){t===0&&(t=Ay()),e=hr(e,t),e!==null&&(pc(e,t),os(e))}function yT(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),OS(e,n)}function xT(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(nt(314))}i!==null&&i.delete(t),OS(e,n)}function ST(e,t){return Um(e,t)}var mh=null,Wr=null,vm=!1,gh=!1,Rp=!1,da=0;function os(e){e!==Wr&&e.next===null&&(Wr===null?mh=Wr=e:Wr=Wr.next=e),gh=!0,vm||(vm=!0,bT())}function xc(e,t){if(!Rp&&gh){Rp=!0;do for(var n=!1,i=mh;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-fi(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Xv(i,a))}else a=le,a=Eh(i,i===Le?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||dc(i,a)||(n=!0,Xv(i,a));i=i.next}while(n);Rp=!1}}function MT(){PS()}function PS(){gh=vm=!1;var e=0;da!==0&&UT()&&(e=da);for(var t=ui(),n=null,i=mh;i!==null;){var s=i.next,a=BS(i,t);a===0?(i.next=null,n===null?mh=s:n.next=s,s===null&&(Wr=n)):(n=i,(e!==0||(a&3)!==0)&&(gh=!0)),i=s}hn!==0&&hn!==5||xc(e,!1),da!==0&&(da=0)}function BS(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-fi(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=J1(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=Le,n=le,n=Eh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(Ee===2||Ee===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&sp(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||dc(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&sp(i),Nm(n)){case 2:case 8:n=Ey;break;case 32:n=ju;break;case 268435456:n=Ty;break;default:n=ju}return i=FS.bind(null,e),n=Um(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&sp(i),e.callbackPriority=2,e.callbackNode=null,2}function FS(e,t){if(hn!==0&&hn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Fh()&&e.callbackNode!==n)return null;var i=le;return i=Eh(e,e===Le?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(bS(e,i,t),BS(e,ui()),e.callbackNode!=null&&e.callbackNode===n?FS.bind(null,e):null)}function Xv(e,t){if(Fh())return null;bS(e,t,!0)}function bT(){NT(function(){(ve&6)!==0?Um(by,MT):PS()})}function _g(){if(da===0){var e=po;e===0&&(e=_u,_u<<=1,(_u&261888)===0&&(_u=256)),da=e}return da}function qv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Ou(""+e)}function Yv(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function ET(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=qv((s[jn]||null).action),r=i.submitter;r&&(t=(t=r[jn]||null)?qv(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new Th("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(da!==0){var l=r?Yv(s,r):new FormData(s);lm(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?Yv(s,r):new FormData(s),lm(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(Ru=0;Ru<Kp.length;Ru++)Du=Kp[Ru],Zv=Du.toLowerCase(),Jv=Du[0].toUpperCase()+Du.slice(1),ki(Zv,"on"+Jv);var Du,Zv,Jv,Ru;ki(Ky,"onAnimationEnd");ki(Qy,"onAnimationIteration");ki(jy,"onAnimationStart");ki("dblclick","onDoubleClick");ki("focusin","onFocus");ki("focusout","onBlur");ki(GE,"onTransitionRun");ki(kE,"onTransitionStart");ki(WE,"onTransitionCancel");ki($y,"onTransitionEnd");ho("onMouseEnter",["mouseout","mouseover"]);ho("onMouseLeave",["mouseout","mouseover"]);ho("onPointerEnter",["pointerout","pointerover"]);ho("onPointerLeave",["pointerout","pointerover"]);lr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));lr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));lr("onBeforeInput",["compositionend","keypress","textInput","paste"]);lr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));lr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));lr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var rc="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),TT=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(rc));function zS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){th(f)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){th(f)}s.currentTarget=null,a=l}}}}function se(e,t){var n=t[Gp];n===void 0&&(n=t[Gp]=new Set);var i=e+"__bubble";n.has(i)||(HS(t,e,2,!1),n.add(i))}function Dp(e,t,n){var i=0;t&&(i|=4),HS(n,e,i,t)}var Uu="_reactListening"+Math.random().toString(36).slice(2);function vg(e){if(!e[Uu]){e[Uu]=!0,Uy.forEach(function(n){n!=="selectionchange"&&(TT.has(n)||Dp(n,!1,e),Dp(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Uu]||(t[Uu]=!0,Dp("selectionchange",!1,t))}}function HS(e,t,n,i){switch($S(t)){case 2:var s=$T;break;case 8:s=tA;break;default:s=Mg}n=s.bind(null,t,n,e),s=void 0,!Yp||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function Up(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Yr(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}zy(function(){var c=a,f=Pm(n),p=[];t:{var u=tx.get(e);if(u!==void 0){var d=Th,v=e;switch(e){case"keypress":if(Bu(n)===0)break t;case"keydown":case"keyup":d=xE;break;case"focusin":v="focus",d=cp;break;case"focusout":v="blur",d=cp;break;case"beforeblur":case"afterblur":d=cp;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":d=nv;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":d=lE;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":d=bE;break;case Ky:case Qy:case jy:d=hE;break;case $y:d=TE;break;case"scroll":case"scrollend":d=rE;break;case"wheel":d=wE;break;case"copy":case"cut":case"paste":d=dE;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":d=sv;break;case"toggle":case"beforetoggle":d=RE}var E=(t&4)!==0,m=!E&&(e==="scroll"||e==="scrollend"),h=E?u!==null?u+"Capture":null:u;E=[];for(var g=c,M;g!==null;){var y=g;if(M=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||M===null||h===null||(y=jl(g,h),y!=null&&E.push(oc(g,y,M))),m)break;g=g.return}0<E.length&&(u=new d(u,v,null,n,f),p.push({event:u,listeners:E}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",d=e==="mouseout"||e==="pointerout",u&&n!==qp&&(v=n.relatedTarget||n.fromElement)&&(Yr(v)||v[Mo]))break t;if((d||u)&&(u=f.window===f?f:(u=f.ownerDocument)?u.defaultView||u.parentWindow:window,d?(v=n.relatedTarget||n.toElement,d=c,v=v?Yr(v):null,v!==null&&(m=hc(v),E=v.tag,v!==m||E!==5&&E!==27&&E!==6)&&(v=null)):(d=null,v=c),d!==v)){if(E=nv,y="onMouseLeave",h="onMouseEnter",g="mouse",(e==="pointerout"||e==="pointerover")&&(E=sv,y="onPointerLeave",h="onPointerEnter",g="pointer"),m=d==null?u:Ol(d),M=v==null?u:Ol(v),u=new E(y,g+"leave",d,n,f),u.target=m,u.relatedTarget=M,y=null,Yr(f)===c&&(E=new E(h,g+"enter",v,n,f),E.target=M,E.relatedTarget=m,y=E),m=y,d&&v)e:{for(E=AT,h=d,g=v,M=0,y=h;y;y=E(y))M++;y=0;for(var b=g;b;b=E(b))y++;for(;0<M-y;)h=E(h),M--;for(;0<y-M;)g=E(g),y--;for(;M--;){if(h===g||g!==null&&h===g.alternate){E=h;break e}h=E(h),g=E(g)}E=null}else E=null;d!==null&&Kv(p,u,d,E,!1),v!==null&&m!==null&&Kv(p,m,v,E,!0)}}t:{if(u=c?Ol(c):window,d=u.nodeName&&u.nodeName.toLowerCase(),d==="select"||d==="input"&&u.type==="file")var T=lv;else if(ov(u))if(Xy)T=zE;else{T=BE;var w=PE}else d=u.nodeName,!d||d.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&Om(c.elementType)&&(T=lv):T=FE;if(T&&(T=T(e,c))){Wy(p,T,n,f);break t}w&&w(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Xp(u,"number",u.value)}switch(w=c?Ol(c):window,e){case"focusin":(ov(w)||w.contentEditable==="true")&&(Kr=w,Zp=c,Hl=null);break;case"focusout":Hl=Zp=Kr=null;break;case"mousedown":Jp=!0;break;case"contextmenu":case"mouseup":case"dragend":Jp=!1,fv(p,n,f);break;case"selectionchange":if(VE)break;case"keydown":case"keyup":fv(p,n,f)}var x;if(zm)t:{switch(e){case"compositionstart":var A="onCompositionStart";break t;case"compositionend":A="onCompositionEnd";break t;case"compositionupdate":A="onCompositionUpdate";break t}A=void 0}else Jr?Gy(e,n)&&(A="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(Vy&&n.locale!=="ko"&&(Jr||A!=="onCompositionStart"?A==="onCompositionEnd"&&Jr&&(x=Hy()):(ua=f,Bm="value"in ua?ua.value:ua.textContent,Jr=!0)),w=_h(c,A),0<w.length&&(A=new iv(A,e,null,n,f),p.push({event:A,listeners:w}),x?A.data=x:(x=ky(n),x!==null&&(A.data=x)))),(x=UE?LE(e,n):NE(e,n))&&(A=_h(c,"onBeforeInput"),0<A.length&&(w=new iv("onBeforeInput","beforeinput",null,n,f),p.push({event:w,listeners:A}),w.data=x)),ET(p,e,c,n,f)}zS(p,t)})}function oc(e,t,n){return{instance:e,listener:t,currentTarget:n}}function _h(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=jl(e,n),s!=null&&i.unshift(oc(e,s,a)),s=jl(e,t),s!=null&&i.push(oc(e,s,a))),e.tag===3)return i;e=e.return}return[]}function AT(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Kv(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=jl(n,a),c!=null&&r.unshift(oc(n,c,l))):s||(c=jl(n,a),c!=null&&r.push(oc(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var wT=/\r\n?/g,CT=/\u0000|\uFFFD/g;function Qv(e){return(typeof e=="string"?e:""+e).replace(wT,`
`).replace(CT,"")}function VS(e,t){return t=Qv(t),Qv(e)===t}function Ce(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||fo(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&fo(e,""+i);break;case"className":xu(e,"class",i);break;case"tabIndex":xu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":xu(e,n,i);break;case"style":Fy(e,i,a);break;case"data":if(t!=="object"){xu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Ou(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&Ce(e,t,"name",s.name,s,null),Ce(e,t,"formEncType",s.formEncType,s,null),Ce(e,t,"formMethod",s.formMethod,s,null),Ce(e,t,"formTarget",s.formTarget,s,null)):(Ce(e,t,"encType",s.encType,s,null),Ce(e,t,"method",s.method,s,null),Ce(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Ou(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=Us);break;case"onScroll":i!=null&&se("scroll",e);break;case"onScrollEnd":i!=null&&se("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(nt(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(nt(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=Ou(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":se("beforetoggle",e),se("toggle",e),Iu(e,"popover",i);break;case"xlinkActuate":bs(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":bs(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":bs(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":bs(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":bs(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":bs(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":bs(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":bs(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":bs(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Iu(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=sE.get(n)||n,Iu(e,n,i))}}function ym(e,t,n,i,s,a){switch(n){case"style":Fy(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(nt(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(nt(60));e.innerHTML=n}}break;case"children":typeof i=="string"?fo(e,i):(typeof i=="number"||typeof i=="bigint")&&fo(e,""+i);break;case"onScroll":i!=null&&se("scroll",e);break;case"onScrollEnd":i!=null&&se("scrollend",e);break;case"onClick":i!=null&&(e.onclick=Us);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Ly.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[jn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):Iu(e,n,i)}}}function An(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":se("error",e),se("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(nt(137,t));default:Ce(e,t,a,r,n,null)}}s&&Ce(e,t,"srcSet",n.srcSet,n,null),i&&Ce(e,t,"src",n.src,n,null);return;case"input":se("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var f=n[i];if(f!=null)switch(i){case"name":s=f;break;case"type":r=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":a=f;break;case"defaultValue":o=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(nt(137,t));break;default:Ce(e,t,i,f,n,null)}}Oy(e,a,o,l,c,r,s,!1);return;case"select":se("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:Ce(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?so(e,!!i,t,!1):n!=null&&so(e,!!i,n,!0);return;case"textarea":se("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(nt(91));break;default:Ce(e,t,r,o,n,null)}By(e,i,s,a);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":e.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:Ce(e,t,l,i,n,null)}return;case"dialog":se("beforetoggle",e),se("toggle",e),se("cancel",e),se("close",e);break;case"iframe":case"object":se("load",e);break;case"video":case"audio":for(i=0;i<rc.length;i++)se(rc[i],e);break;case"image":se("error",e),se("load",e);break;case"details":se("toggle",e);break;case"embed":case"source":case"link":se("error",e),se("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(nt(137,t));default:Ce(e,t,c,i,n,null)}return;default:if(Om(t)){for(f in n)n.hasOwnProperty(f)&&(i=n[f],i!==void 0&&ym(e,t,f,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&Ce(e,t,o,i,n,null))}function RT(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,f=null;for(d in n){var p=n[d];if(n.hasOwnProperty(d)&&p!=null)switch(d){case"checked":break;case"value":break;case"defaultValue":l=p;default:i.hasOwnProperty(d)||Ce(e,t,d,null,i,p)}}for(var u in i){var d=i[u];if(p=n[u],i.hasOwnProperty(u)&&(d!=null||p!=null))switch(u){case"type":a=d;break;case"name":s=d;break;case"checked":c=d;break;case"defaultChecked":f=d;break;case"value":r=d;break;case"defaultValue":o=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(nt(137,t));break;default:d!==p&&Ce(e,t,u,d,i,p)}}Wp(e,r,o,l,c,f,a,s);return;case"select":d=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":d=l;default:i.hasOwnProperty(a)||Ce(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&Ce(e,t,s,a,i,l)}t=o,n=r,i=d,u!=null?so(e,!!n,u,!1):!!i!=!!n&&(t!=null?so(e,!!n,t,!0):so(e,!!n,n?[]:"",!1));return;case"textarea":d=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:Ce(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":d=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(nt(91));break;default:s!==a&&Ce(e,t,r,s,i,a)}Py(e,u,d);return;case"option":for(var v in n)if(u=n[v],n.hasOwnProperty(v)&&u!=null&&!i.hasOwnProperty(v))switch(v){case"selected":e.selected=!1;break;default:Ce(e,t,v,null,i,u)}for(l in i)if(u=i[l],d=n[l],i.hasOwnProperty(l)&&u!==d&&(u!=null||d!=null))switch(l){case"selected":e.selected=u&&typeof u!="function"&&typeof u!="symbol";break;default:Ce(e,t,l,u,i,d)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var E in n)u=n[E],n.hasOwnProperty(E)&&u!=null&&!i.hasOwnProperty(E)&&Ce(e,t,E,null,i,u);for(c in i)if(u=i[c],d=n[c],i.hasOwnProperty(c)&&u!==d&&(u!=null||d!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(nt(137,t));break;default:Ce(e,t,c,u,i,d)}return;default:if(Om(t)){for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!==void 0&&!i.hasOwnProperty(m)&&ym(e,t,m,void 0,i,u);for(f in i)u=i[f],d=n[f],!i.hasOwnProperty(f)||u===d||u===void 0&&d===void 0||ym(e,t,f,u,i,d);return}}for(var h in n)u=n[h],n.hasOwnProperty(h)&&u!=null&&!i.hasOwnProperty(h)&&Ce(e,t,h,null,i,u);for(p in i)u=i[p],d=n[p],!i.hasOwnProperty(p)||u===d||u==null&&d==null||Ce(e,t,p,u,i,d)}function jv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function DT(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&jv(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var f=l.transferSize,p=l.initiatorType;f&&jv(p)&&(l=l.responseEnd,r+=f*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var xm=null,Sm=null;function vh(e){return e.nodeType===9?e:e.ownerDocument}function $v(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function GS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Mm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Lp=null;function UT(){var e=window.event;return e&&e.type==="popstate"?e===Lp?!1:(Lp=e,!0):(Lp=null,!1)}var kS=typeof setTimeout=="function"?setTimeout:void 0,LT=typeof clearTimeout=="function"?clearTimeout:void 0,ty=typeof Promise=="function"?Promise:void 0,NT=typeof queueMicrotask=="function"?queueMicrotask:typeof ty<"u"?function(e){return ty.resolve(null).then(e).catch(IT)}:kS;function IT(e){setTimeout(function(){throw e})}function Ca(e){return e==="head"}function ey(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),So(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Kl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Kl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[mc]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&Kl(e.ownerDocument.body);n=s}while(n);So(t)}function ny(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function bm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":bm(n),Im(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function OT(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[mc])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=Ni(e.nextSibling),e===null)break}return null}function PT(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ni(e.nextSibling),e===null))return null;return e}function WS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ni(e.nextSibling),e===null))return null;return e}function Em(e){return e.data==="$?"||e.data==="$~"}function Tm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function BT(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Ni(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Am=null;function iy(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Ni(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function sy(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function XS(e,t,n){switch(t=vh(n),e){case"html":if(e=t.documentElement,!e)throw Error(nt(452));return e;case"head":if(e=t.head,!e)throw Error(nt(453));return e;case"body":if(e=t.body,!e)throw Error(nt(454));return e;default:throw Error(nt(451))}}function Kl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Im(e)}var Ii=new Map,ay=new Set;function yh(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Vs=ye.d;ye.d={f:FT,r:zT,D:HT,C:VT,L:GT,m:kT,X:XT,S:WT,M:qT};function FT(){var e=Vs.f(),t=Ph();return e||t}function zT(e){var t=bo(e);t!==null&&t.tag===5&&t.type==="form"?Fx(t):Vs.r(e)}var wo=typeof document>"u"?null:document;function qS(e,t,n){var i=wo;if(i&&typeof t=="string"&&t){var s=Ri(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),ay.has(s)||(ay.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),An(t,"link",e),_n(t),i.head.appendChild(t)))}}function HT(e){Vs.D(e),qS("dns-prefetch",e,null)}function VT(e,t){Vs.C(e,t),qS("preconnect",e,t)}function GT(e,t,n){Vs.L(e,t,n);var i=wo;if(i&&e&&t){var s='link[rel="preload"][as="'+Ri(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+Ri(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+Ri(n.imageSizes)+'"]')):s+='[href="'+Ri(e)+'"]';var a=s;switch(t){case"style":a=xo(e);break;case"script":a=Co(e)}Ii.has(a)||(e=Fe({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ii.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(Sc(a))||t==="script"&&i.querySelector(Mc(a))||(t=i.createElement("link"),An(t,"link",e),_n(t),i.head.appendChild(t)))}}function kT(e,t){Vs.m(e,t);var n=wo;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+Ri(i)+'"][href="'+Ri(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Co(e)}if(!Ii.has(a)&&(e=Fe({rel:"modulepreload",href:e},t),Ii.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Mc(a)))return}i=n.createElement("link"),An(i,"link",e),_n(i),n.head.appendChild(i)}}}function WT(e,t,n){Vs.S(e,t,n);var i=wo;if(i&&e){var s=io(i).hoistableStyles,a=xo(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(Sc(a)))o.loading=5;else{e=Fe({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ii.get(a))&&yg(e,n);var l=r=i.createElement("link");_n(l),An(l,"link",e),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,Xu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function XT(e,t){Vs.X(e,t);var n=wo;if(n&&e){var i=io(n).hoistableScripts,s=Co(e),a=i.get(s);a||(a=n.querySelector(Mc(s)),a||(e=Fe({src:e,async:!0},t),(t=Ii.get(s))&&xg(e,t),a=n.createElement("script"),_n(a),An(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function qT(e,t){Vs.M(e,t);var n=wo;if(n&&e){var i=io(n).hoistableScripts,s=Co(e),a=i.get(s);a||(a=n.querySelector(Mc(s)),a||(e=Fe({src:e,async:!0,type:"module"},t),(t=Ii.get(s))&&xg(e,t),a=n.createElement("script"),_n(a),An(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function ry(e,t,n,i){var s=(s=pa.current)?yh(s):null;if(!s)throw Error(nt(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=xo(n.href),n=io(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=xo(n.href);var a=io(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(Sc(e)))&&!a._p&&(r.instance=a,r.state.loading=5),Ii.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ii.set(e,n),a||YT(s,e,n,r.state))),t&&i===null)throw Error(nt(528,""));return r}if(t&&i!==null)throw Error(nt(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Co(n),n=io(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(nt(444,e))}}function xo(e){return'href="'+Ri(e)+'"'}function Sc(e){return'link[rel="stylesheet"]['+e+"]"}function YS(e){return Fe({},e,{"data-precedence":e.precedence,precedence:null})}function YT(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),An(t,"link",n),_n(t),e.head.appendChild(t))}function Co(e){return'[src="'+Ri(e)+'"]'}function Mc(e){return"script[async]"+e}function oy(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+Ri(n.href)+'"]');if(i)return t.instance=i,_n(i),i;var s=Fe({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),_n(i),An(i,"style",s),Xu(i,n.precedence,e),t.instance=i;case"stylesheet":s=xo(n.href);var a=e.querySelector(Sc(s));if(a)return t.state.loading|=4,t.instance=a,_n(a),a;i=YS(n),(s=Ii.get(s))&&yg(i,s),a=(e.ownerDocument||e).createElement("link"),_n(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),An(a,"link",i),t.state.loading|=4,Xu(a,n.precedence,e),t.instance=a;case"script":return a=Co(n.src),(s=e.querySelector(Mc(a)))?(t.instance=s,_n(s),s):(i=n,(s=Ii.get(a))&&(i=Fe({},n),xg(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),_n(s),An(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error(nt(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Xu(i,n.precedence,e));return t.instance}function Xu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function yg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function xg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var qu=null;function ly(e,t,n){if(qu===null){var i=new Map,s=qu=new Map;s.set(n,i)}else s=qu,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[mc]||a[bn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function cy(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function ZT(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function ZS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function JT(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=xo(i.href),a=t.querySelector(Sc(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=xh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,_n(a);return}a=t.ownerDocument||t,i=YS(i),(s=Ii.get(s))&&yg(i,s),a=a.createElement("link"),_n(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),An(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=xh.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Np=0;function KT(e,t){return e.stylesheets&&e.count===0&&Yu(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&Yu(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&Np===0&&(Np=62500*DT());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Yu(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>Np?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function xh(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Yu(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Sh=null;function Yu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Sh=new Map,t.forEach(QT,e),Sh=null,xh.call(e))}function QT(e,t){if(!(t.state.loading&4)){var n=Sh.get(e);if(n)var i=n.get(null);else{n=new Map,Sh.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=xh.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var lc={$$typeof:Ds,Provider:null,Consumer:null,_currentValue:ja,_currentValue2:ja,_threadCount:0};function jT(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ap(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ap(0),this.hiddenUpdates=ap(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function JS(e,t,n,i,s,a,r,o,l,c,f,p){return e=new jT(e,t,n,r,l,c,f,p,o),t=1,a===!0&&(t|=24),a=li(3,null,null,t),e.current=a,a.stateNode=e,t=qm(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},Jm(a),e}function KS(e){return e?(e=$r,e):$r}function QS(e,t,n,i,s,a){s=KS(s),i.context===null?i.context=s:i.pendingContext=s,i=ga(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=_a(e,i,t),n!==null&&(Qn(n,e,t),Gl(n,e,t))}function uy(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Sg(e,t){uy(e,t),(e=e.alternate)&&uy(e,t)}function jS(e){if(e.tag===13||e.tag===31){var t=hr(e,67108864);t!==null&&Qn(t,e,67108864),Sg(e,67108864)}}function hy(e){if(e.tag===13||e.tag===31){var t=di();t=Lm(t);var n=hr(e,t);n!==null&&Qn(n,e,t),Sg(e,t)}}var Mh=!0;function $T(e,t,n,i){var s=Vt.T;Vt.T=null;var a=ye.p;try{ye.p=2,Mg(e,t,n,i)}finally{ye.p=a,Vt.T=s}}function tA(e,t,n,i){var s=Vt.T;Vt.T=null;var a=ye.p;try{ye.p=8,Mg(e,t,n,i)}finally{ye.p=a,Vt.T=s}}function Mg(e,t,n,i){if(Mh){var s=wm(i);if(s===null)Up(e,t,i,bh,n),fy(e,i);else if(nA(s,e,t,n,i))i.stopPropagation();else if(fy(e,i),t&4&&-1<eA.indexOf(e)){for(;s!==null;){var a=bo(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=Ja(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-fi(r);o.entanglements[1]|=l,r&=~l}os(a),(ve&6)===0&&(fh=ui()+500,xc(0,!1))}}break;case 31:case 13:o=hr(a,2),o!==null&&Qn(o,a,2),Ph(),Sg(a,2)}if(a=wm(i),a===null&&Up(e,t,i,bh,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else Up(e,t,i,null,n)}}function wm(e){return e=Pm(e),bg(e)}var bh=null;function bg(e){if(bh=null,e=Yr(e),e!==null){var t=hc(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=vy(t),e!==null)return e;e=null}else if(n===31){if(e=yy(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return bh=e,null}function $S(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(G1()){case by:return 2;case Ey:return 8;case ju:case k1:return 32;case Ty:return 268435456;default:return 32}default:return 32}}var Cm=!1,xa=null,Sa=null,Ma=null,cc=new Map,uc=new Map,la=[],eA="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function fy(e,t){switch(e){case"focusin":case"focusout":xa=null;break;case"dragenter":case"dragleave":Sa=null;break;case"mouseover":case"mouseout":Ma=null;break;case"pointerover":case"pointerout":cc.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":uc.delete(t.pointerId)}}function Ul(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=bo(t),t!==null&&jS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function nA(e,t,n,i,s){switch(t){case"focusin":return xa=Ul(xa,e,t,n,i,s),!0;case"dragenter":return Sa=Ul(Sa,e,t,n,i,s),!0;case"mouseover":return Ma=Ul(Ma,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return cc.set(a,Ul(cc.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,uc.set(a,Ul(uc.get(a)||null,e,t,n,i,s)),!0}return!1}function tM(e){var t=Yr(e.target);if(t!==null){var n=hc(t);if(n!==null){if(t=n.tag,t===13){if(t=vy(n),t!==null){e.blockedOn=t,J_(e.priority,function(){hy(n)});return}}else if(t===31){if(t=yy(n),t!==null){e.blockedOn=t,J_(e.priority,function(){hy(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Zu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=wm(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);qp=i,n.target.dispatchEvent(i),qp=null}else return t=bo(n),t!==null&&jS(t),e.blockedOn=n,!1;t.shift()}return!0}function dy(e,t,n){Zu(e)&&n.delete(t)}function iA(){Cm=!1,xa!==null&&Zu(xa)&&(xa=null),Sa!==null&&Zu(Sa)&&(Sa=null),Ma!==null&&Zu(Ma)&&(Ma=null),cc.forEach(dy),uc.forEach(dy)}function Lu(e,t){e.blockedOn===t&&(e.blockedOn=null,Cm||(Cm=!0,fn.unstable_scheduleCallback(fn.unstable_NormalPriority,iA)))}var Nu=null;function py(e){Nu!==e&&(Nu=e,fn.unstable_scheduleCallback(fn.unstable_NormalPriority,function(){Nu===e&&(Nu=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(bg(i||n)===null)continue;break}var a=bo(n);a!==null&&(e.splice(t,3),t-=3,lm(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function So(e){function t(l){return Lu(l,e)}xa!==null&&Lu(xa,e),Sa!==null&&Lu(Sa,e),Ma!==null&&Lu(Ma,e),cc.forEach(t),uc.forEach(t);for(var n=0;n<la.length;n++){var i=la[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<la.length&&(n=la[0],n.blockedOn===null);)tM(n),n.blockedOn===null&&la.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[jn]||null;if(typeof a=="function")r||py(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[jn]||null)o=r.formAction;else if(bg(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),py(n)}}}function eM(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function Eg(e){this._internalRoot=e}zh.prototype.render=Eg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(nt(409));var n=t.current,i=di();QS(n,i,e,t,null,null)};zh.prototype.unmount=Eg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;QS(e.current,2,null,e,null,null),Ph(),t[Mo]=null}};function zh(e){this._internalRoot=e}zh.prototype.unstable_scheduleHydration=function(e){if(e){var t=Dy();e={blockedOn:null,target:e,priority:t};for(var n=0;n<la.length&&t!==0&&t<la[n].priority;n++);la.splice(n,0,e),n===0&&tM(e)}};var my=gy.version;if(my!=="19.2.0")throw Error(nt(527,my,"19.2.0"));ye.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(nt(188)):(e=Object.keys(e).join(","),Error(nt(268,e)));return e=O1(t),e=e!==null?xy(e):null,e=e===null?null:e.stateNode,e};var sA={bundleType:0,version:"19.2.0",rendererPackageName:"react-dom",currentDispatcherRef:Vt,reconcilerVersion:"19.2.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ll=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ll.isDisabled&&Ll.supportsFiber))try{fc=Ll.inject(sA),hi=Ll}catch{}var Ll;Hh.createRoot=function(e,t){if(!_y(e))throw Error(nt(299));var n=!1,i="",s=qx,a=Yx,r=Zx;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=JS(e,1,!1,null,null,n,i,null,s,a,r,eM),e[Mo]=t.current,vg(e),new Eg(t)};Hh.hydrateRoot=function(e,t,n){if(!_y(e))throw Error(nt(299));var i=!1,s="",a=qx,r=Yx,o=Zx,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=JS(e,1,!0,t,n??null,i,s,l,a,r,o,eM),t.context=KS(null),n=t.current,i=di(),i=Lm(i),s=ga(i),s.callback=null,_a(n,s,i),n=i,t.current.lanes=n,pc(t,n),os(t),e[Mo]=t.current,vg(e),new zh(t)};Hh.version="19.2.0"});var aM=$i((gD,sM)=>{"use strict";function iM(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(iM)}catch(e){console.error(e)}}iM(),sM.exports=nM()});var Qb=$i(Od=>{"use strict";var tD=Symbol.for("react.transitional.element"),eD=Symbol.for("react.fragment");function Kb(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:tD,type:e,key:i,ref:t!==void 0?t:null,props:n}}Od.Fragment=eD;Od.jsx=Kb;Od.jsxs=Kb});var br=$i((QN,jb)=>{"use strict";jb.exports=Qb()});var Tr=ts(Br()),s1=ts(aM());var De=ts(Br(),1),aA=(e,t,n,i,s,a,r,o)=>{let l=document.documentElement,c=["light","dark"];function f(d){(Array.isArray(e)?e:[e]).forEach(v=>{let E=v==="class",m=E&&a?s.map(h=>a[h]||h):s;E?(l.classList.remove(...m),l.classList.add(a&&a[d]?a[d]:d)):l.setAttribute(v,d)}),p(d)}function p(d){o&&c.includes(d)&&(l.style.colorScheme=d)}function u(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)f(i);else try{let d=localStorage.getItem(t)||n,v=r&&d==="system"?u():d;f(v)}catch{}},rM=["light","dark"],oM="(prefers-color-scheme: dark)",rA=typeof window>"u",Ag=De.createContext(void 0),oA={setTheme:e=>{},themes:[]},lM=()=>{var e;return(e=De.useContext(Ag))!=null?e:oA},cM=e=>De.useContext(Ag)?De.createElement(De.Fragment,null,e.children):De.createElement(cA,{...e}),lA=["light","dark"],cA=({forcedTheme:e,disableTransitionOnChange:t=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:s="theme",themes:a=lA,defaultTheme:r=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:f,scriptProps:p})=>{let[u,d]=De.useState(()=>hA(s,r)),[v,E]=De.useState(()=>u==="system"?Tg():u),m=l?Object.values(l):a,h=De.useCallback(b=>{let T=b;if(!T)return;b==="system"&&n&&(T=Tg());let w=l?l[T]:T,x=t?fA(f):null,A=document.documentElement,D=R=>{R==="class"?(A.classList.remove(...m),w&&A.classList.add(w)):R.startsWith("data-")&&(w?A.setAttribute(R,w):A.removeAttribute(R))};if(Array.isArray(o)?o.forEach(D):D(o),i){let R=rM.includes(r)?r:null,P=rM.includes(T)?T:R;A.style.colorScheme=P}x?.()},[f]),g=De.useCallback(b=>{let T=typeof b=="function"?b(u):b;d(T);try{localStorage.setItem(s,T)}catch{}},[u]),M=De.useCallback(b=>{let T=Tg(b);E(T),u==="system"&&n&&!e&&h("system")},[u,e]);De.useEffect(()=>{let b=window.matchMedia(oM);return b.addListener(M),M(b),()=>b.removeListener(M)},[M]),De.useEffect(()=>{let b=T=>{T.key===s&&(T.newValue?d(T.newValue):g(r))};return window.addEventListener("storage",b),()=>window.removeEventListener("storage",b)},[g]),De.useEffect(()=>{h(e??u)},[e,u]);let y=De.useMemo(()=>({theme:u,setTheme:g,forcedTheme:e,resolvedTheme:u==="system"?v:u,themes:n?[...a,"system"]:a,systemTheme:n?v:void 0}),[u,g,e,v,n,a]);return De.createElement(Ag.Provider,{value:y},De.createElement(uA,{forcedTheme:e,storageKey:s,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:r,value:l,themes:a,nonce:f,scriptProps:p}),c)},uA=De.memo(({forcedTheme:e,storageKey:t,attribute:n,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:r,themes:o,nonce:l,scriptProps:c})=>{let f=JSON.stringify([n,t,a,e,o,r,i,s]).slice(1,-1);return De.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${aA.toString()})(${f})`}})}),hA=(e,t)=>{if(rA)return;let n;try{n=localStorage.getItem(e)||void 0}catch{}return n||t},fA=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},Tg=e=>(e||(e=window.matchMedia(oM)),e.matches?"dark":"light");var Er={};f1(Er,{default:()=>Pd});var ni=ts(Br());var OM=0,n0=1,PM=2;var Zc=1,Ff=2,ll=3,ps=0,wn=1,Fi=2,ms=0,cl=1,i0=2,s0=3,a0=4,BM=5;var yr=100,FM=101,zM=102,HM=103,VM=104,GM=200,kM=201,WM=202,XM=203,r0=204,o0=205,qM=206,YM=207,ZM=208,JM=209,KM=210,QM=211,jM=212,$M=213,tb=214,uf=0,hf=1,ff=2,Xo=3,df=4,pf=5,mf=6,gf=7,l0=0,eb=1,nb=2,Zi=0,c0=1,u0=2,h0=3,f0=4,d0=5,p0=6,m0=7;var g0=300,za=301,xr=302,zf=303,Hf=304,Jc=306,qo=1e3,us=1001,_f=1002,xn=1003,ib=1004;var Kc=1005;var un=1006,Vf=1007;var Ha=1008;var ei=1009,_0=1010,v0=1011,ul=1012,Gf=1013,Ji=1014,Ki=1015,Qi=1016,kf=1017,Wf=1018,hl=1020,y0=35902,x0=35899,S0=1021,M0=1022,zi=1023,hs=1026,Va=1027,b0=1028,Xf=1029,Ga=1030,qf=1031;var Yf=1033,Qc=33776,jc=33777,$c=33778,tu=33779,Zf=35840,Jf=35841,Kf=35842,Qf=35843,jf=36196,$f=37492,td=37496,ed=37488,nd=37489,eu=37490,id=37491,sd=37808,ad=37809,rd=37810,od=37811,ld=37812,cd=37813,ud=37814,hd=37815,fd=37816,dd=37817,pd=37818,md=37819,gd=37820,_d=37821,vd=36492,yd=36494,xd=36495,Sd=36283,Md=36284,nu=36285,bd=36286;var Rc=2300,vf=2301,of=2302,Zg=2303,Jg=2400,Kg=2401,Qg=2402;var sb=3200,E0=3201;var Ed=0,ab=1,Qs="",Ln="srgb",Dc="srgb-linear",Uc="linear",be="srgb";var lf=7680;var rb=519,ob=512,lb=513,cb=514,Td=515,ub=516,hb=517,Ad=518,fb=519,db=35044,wd=35048;var T0="300 es",Yi=2e3,Yo=2001;function dA(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function pA(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Zo(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function pb(){let e=Zo("canvas");return e.style.display="block",e}var uM={},Jo=null;function A0(...e){let t="THREE."+e.shift();Jo?Jo("log",t,...e):console.log(t,...e)}function mb(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function It(...e){e=mb(e);let t="THREE."+e.shift();if(Jo)Jo("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Bt(...e){e=mb(e);let t="THREE."+e.shift();if(Jo)Jo("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function _r(...e){let t=e.join(" ");t in uM||(uM[t]=!0,It(...e))}function gb(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var _b={[uf]:hf,[ff]:mf,[df]:gf,[Xo]:pf,[hf]:uf,[mf]:ff,[gf]:df,[pf]:Xo},fs=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},Dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],hM=1234567,wc=Math.PI/180,Ko=180/Math.PI;function fl(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Dn[e&255]+Dn[e>>8&255]+Dn[e>>16&255]+Dn[e>>24&255]+"-"+Dn[t&255]+Dn[t>>8&255]+"-"+Dn[t>>16&15|64]+Dn[t>>24&255]+"-"+Dn[n&63|128]+Dn[n>>8&255]+"-"+Dn[n>>16&255]+Dn[n>>24&255]+Dn[i&255]+Dn[i>>8&255]+Dn[i>>16&255]+Dn[i>>24&255]).toLowerCase()}function ue(e,t,n){return Math.max(t,Math.min(n,e))}function w0(e,t){return(e%t+t)%t}function mA(e,t,n,i,s){return i+(e-t)*(s-i)/(n-t)}function gA(e,t,n){return e!==t?(n-e)/(t-e):0}function Cc(e,t,n){return(1-n)*e+n*t}function _A(e,t,n,i){return Cc(e,t,1-Math.exp(-n*i))}function vA(e,t=1){return t-Math.abs(w0(e,t*2)-t)}function yA(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function xA(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function SA(e,t){return e+Math.floor(Math.random()*(t-e+1))}function MA(e,t){return e+Math.random()*(t-e)}function bA(e){return e*(.5-Math.random())}function EA(e){e!==void 0&&(hM=e);let t=hM+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function TA(e){return e*wc}function AA(e){return e*Ko}function wA(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function CA(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function RA(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function DA(e,t,n,i,s){let a=Math.cos,r=Math.sin,o=a(n/2),l=r(n/2),c=a((t+i)/2),f=r((t+i)/2),p=a((t-i)/2),u=r((t-i)/2),d=a((i-t)/2),v=r((i-t)/2);switch(s){case"XYX":e.set(o*f,l*p,l*u,o*c);break;case"YZY":e.set(l*u,o*f,l*p,o*c);break;case"ZXZ":e.set(l*p,l*u,o*f,o*c);break;case"XZX":e.set(o*f,l*v,l*d,o*c);break;case"YXY":e.set(l*d,o*f,l*v,o*c);break;case"ZYZ":e.set(l*v,l*d,o*f,o*c);break;default:It("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ko(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function kn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ka={DEG2RAD:wc,RAD2DEG:Ko,generateUUID:fl,clamp:ue,euclideanModulo:w0,mapLinear:mA,inverseLerp:gA,lerp:Cc,damp:_A,pingpong:vA,smoothstep:yA,smootherstep:xA,randInt:SA,randFloat:MA,randFloatSpread:bA,seededRandom:EA,degToRad:TA,radToDeg:AA,isPowerOfTwo:wA,ceilPowerOfTwo:CA,floorPowerOfTwo:RA,setQuaternionFromProperEuler:DA,normalize:kn,denormalize:ko},re=class e{static{e.prototype.isVector2=!0}constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=ue(this.x,t.x,n.x),this.y=ue(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=ue(this.x,t,n),this.y=ue(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ue(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ue(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ds=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],f=i[s+2],p=i[s+3],u=a[r+0],d=a[r+1],v=a[r+2],E=a[r+3];if(p!==E||l!==u||c!==d||f!==v){let m=l*u+c*d+f*v+p*E;m<0&&(u=-u,d=-d,v=-v,E=-E,m=-m);let h=1-o;if(m<.9995){let g=Math.acos(m),M=Math.sin(g);h=Math.sin(h*g)/M,o=Math.sin(o*g)/M,l=l*h+u*o,c=c*h+d*o,f=f*h+v*o,p=p*h+E*o}else{l=l*h+u*o,c=c*h+d*o,f=f*h+v*o,p=p*h+E*o;let g=1/Math.sqrt(l*l+c*c+f*f+p*p);l*=g,c*=g,f*=g,p*=g}}t[n]=l,t[n+1]=c,t[n+2]=f,t[n+3]=p}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],f=i[s+3],p=a[r],u=a[r+1],d=a[r+2],v=a[r+3];return t[n]=o*v+f*p+l*d-c*u,t[n+1]=l*v+f*u+c*p-o*d,t[n+2]=c*v+f*d+o*u-l*p,t[n+3]=f*v-o*p-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),f=o(s/2),p=o(a/2),u=l(i/2),d=l(s/2),v=l(a/2);switch(r){case"XYZ":this._x=u*f*p+c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p-u*d*v;break;case"YXZ":this._x=u*f*p+c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p+u*d*v;break;case"ZXY":this._x=u*f*p-c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p-u*d*v;break;case"ZYX":this._x=u*f*p-c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p+u*d*v;break;case"YZX":this._x=u*f*p+c*d*v,this._y=c*d*p+u*f*v,this._z=c*f*v-u*d*p,this._w=c*f*p-u*d*v;break;case"XZY":this._x=u*f*p-c*d*v,this._y=c*d*p-u*f*v,this._z=c*f*v+u*d*p,this._w=c*f*p+u*d*v;break;default:It("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],f=n[6],p=n[10],u=i+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(i>o&&i>p){let d=2*Math.sqrt(1+i-o-p);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-i-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+p-i-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ue(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,f=n._w;return this._x=i*f+r*o+s*c-a*l,this._y=s*f+r*l+a*o-i*c,this._z=a*f+r*c+i*l-s*o,this._w=r*f-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,n=Math.sin(n*c)/f,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class e{static{e.prototype.isVector3=!0}constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(fM.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(fM.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),f=2*(o*n-a*s),p=2*(a*i-r*n);return this.x=n+l*c+r*p-o*f,this.y=i+l*f+o*c-a*p,this.z=s+l*p+a*f-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=ue(this.x,t.x,n.x),this.y=ue(this.y,t.y,n.y),this.z=ue(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=ue(this.x,t,n),this.y=ue(this.y,t,n),this.z=ue(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ue(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return wg.copy(this).projectOnVector(t),this.sub(wg)}reflect(t){return this.sub(wg.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ue(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},wg=new W,fM=new ds,Xt=class e{static{e.prototype.isMatrix3=!0}constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let f=this.elements;return f[0]=t,f[1]=s,f[2]=o,f[3]=n,f[4]=a,f[5]=l,f[6]=i,f[7]=r,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],f=i[4],p=i[7],u=i[2],d=i[5],v=i[8],E=s[0],m=s[3],h=s[6],g=s[1],M=s[4],y=s[7],b=s[2],T=s[5],w=s[8];return a[0]=r*E+o*g+l*b,a[3]=r*m+o*M+l*T,a[6]=r*h+o*y+l*w,a[1]=c*E+f*g+p*b,a[4]=c*m+f*M+p*T,a[7]=c*h+f*y+p*w,a[2]=u*E+d*g+v*b,a[5]=u*m+d*M+v*T,a[8]=u*h+d*y+v*w,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8];return n*r*f-n*o*c-i*a*f+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=f*r-o*c,u=o*l-f*a,d=c*a-r*l,v=n*p+i*u+s*d;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);let E=1/v;return t[0]=p*E,t[1]=(s*c-f*i)*E,t[2]=(o*i-s*r)*E,t[3]=u*E,t[4]=(f*n-s*l)*E,t[5]=(s*a-o*n)*E,t[6]=d*E,t[7]=(i*l-c*n)*E,t[8]=(r*n-i*a)*E,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return _r("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Cg.makeScale(t,n)),this}rotate(t){return _r("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Cg.makeRotation(-t)),this}translate(t,n){return _r("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Cg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Cg=new Xt,dM=new Xt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pM=new Xt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function UA(){let e={enabled:!0,workingColorSpace:Dc,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===be&&(s.r=Zs(s.r),s.g=Zs(s.g),s.b=Zs(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===be&&(s.r=Wo(s.r),s.g=Wo(s.g),s.b=Wo(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Qs?Uc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return _r("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return _r("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[Dc]:{primaries:t,whitePoint:i,transfer:Uc,toXYZ:dM,fromXYZ:pM,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Ln},outputColorSpaceConfig:{drawingBufferColorSpace:Ln}},[Ln]:{primaries:t,whitePoint:i,transfer:be,toXYZ:dM,fromXYZ:pM,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Ln}}}),e}var ce=UA();function Zs(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Wo(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Ro,yf=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Ro===void 0&&(Ro=Zo("canvas")),Ro.width=t.width,Ro.height=t.height;let s=Ro.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Ro}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let n=Zo("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Zs(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Zs(n[i]/255)*255):n[i]=Zs(n[i]);return{data:n,width:t.width,height:t.height}}else return It("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},LA=0,Qo=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:LA++}),this.uuid=fl(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(Rg(s[r].image)):a.push(Rg(s[r]))}else a=Rg(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function Rg(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?yf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(It("Texture: Unable to serialize Texture."),{})}var NA=0,Dg=new W,Wn=class e extends fs{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=us,s=us,a=un,r=Ha,o=zi,l=ei,c=e.DEFAULT_ANISOTROPY,f=Qs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:NA++}),this.uuid=fl(),this.name="",this.source=new Qo(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new re(0,0),this.repeat=new re(1,1),this.center=new re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Dg).x}get height(){return this.source.getSize(Dg).y}get depth(){return this.source.getSize(Dg).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){It(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==g0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case qo:t.x=t.x-Math.floor(t.x);break;case us:t.x=t.x<0?0:1;break;case _f:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case qo:t.y=t.y-Math.floor(t.y);break;case us:t.y=t.y<0?0:1;break;case _f:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Wn.DEFAULT_IMAGE=null;Wn.DEFAULT_MAPPING=g0;Wn.DEFAULT_ANISOTROPY=1;var qe=class e{static{e.prototype.isVector4=!0}constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],f=l[4],p=l[8],u=l[1],d=l[5],v=l[9],E=l[2],m=l[6],h=l[10];if(Math.abs(f-u)<.01&&Math.abs(p-E)<.01&&Math.abs(v-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(p+E)<.1&&Math.abs(v+m)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let M=(c+1)/2,y=(d+1)/2,b=(h+1)/2,T=(f+u)/4,w=(p+E)/4,x=(v+m)/4;return M>y&&M>b?M<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(M),s=T/i,a=w/i):y>b?y<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),i=T/s,a=x/s):b<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(b),i=w/a,s=x/a),this.set(i,s,a,n),this}let g=Math.sqrt((m-v)*(m-v)+(p-E)*(p-E)+(u-f)*(u-f));return Math.abs(g)<.001&&(g=1),this.x=(m-v)/g,this.y=(p-E)/g,this.z=(u-f)/g,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=ue(this.x,t.x,n.x),this.y=ue(this.y,t.y,n.y),this.z=ue(this.z,t.z,n.z),this.w=ue(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=ue(this.x,t,n),this.y=ue(this.y,t,n),this.z=ue(this.z,t,n),this.w=ue(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ue(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},xf=class extends fs{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new qe(0,0,t,n),this.scissorTest=!1,this.viewport=new qe(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Wn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:un,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new Qo(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let n=t.depthTexture.clone();n.renderTarget=null,this.depthTexture=n}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ti=class extends xf{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},Lc=class extends Wn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=xn,this.minFilter=xn,this.wrapR=us,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Sf=class extends Wn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=xn,this.minFilter=xn,this.wrapR=us,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Xe=class e{static{e.prototype.isMatrix4=!0}constructor(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m)}set(t,n,i,s,a,r,o,l,c,f,p,u,d,v,E,m){let h=this.elements;return h[0]=t,h[4]=n,h[8]=i,h[12]=s,h[1]=a,h[5]=r,h[9]=o,h[13]=l,h[2]=c,h[6]=f,h[10]=p,h[14]=u,h[3]=d,h[7]=v,h[11]=E,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/Do.setFromMatrixColumn(t,0).length(),a=1/Do.setFromMatrixColumn(t,1).length(),r=1/Do.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),f=Math.cos(a),p=Math.sin(a);if(t.order==="XYZ"){let u=r*f,d=r*p,v=o*f,E=o*p;n[0]=l*f,n[4]=-l*p,n[8]=c,n[1]=d+v*c,n[5]=u-E*c,n[9]=-o*l,n[2]=E-u*c,n[6]=v+d*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*f,d=l*p,v=c*f,E=c*p;n[0]=u+E*o,n[4]=v*o-d,n[8]=r*c,n[1]=r*p,n[5]=r*f,n[9]=-o,n[2]=d*o-v,n[6]=E+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*f,d=l*p,v=c*f,E=c*p;n[0]=u-E*o,n[4]=-r*p,n[8]=v+d*o,n[1]=d+v*o,n[5]=r*f,n[9]=E-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*f,d=r*p,v=o*f,E=o*p;n[0]=l*f,n[4]=v*c-d,n[8]=u*c+E,n[1]=l*p,n[5]=E*c+u,n[9]=d*c-v,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,d=r*c,v=o*l,E=o*c;n[0]=l*f,n[4]=E-u*p,n[8]=v*p+d,n[1]=p,n[5]=r*f,n[9]=-o*f,n[2]=-c*f,n[6]=d*p+v,n[10]=u-E*p}else if(t.order==="XZY"){let u=r*l,d=r*c,v=o*l,E=o*c;n[0]=l*f,n[4]=-p,n[8]=c*f,n[1]=u*p+E,n[5]=r*f,n[9]=d*p-v,n[2]=v*p-d,n[6]=o*f,n[10]=E*p+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(IA,t,OA)}lookAt(t,n,i){let s=this.elements;return gi.subVectors(t,n),gi.lengthSq()===0&&(gi.z=1),gi.normalize(),Ra.crossVectors(i,gi),Ra.lengthSq()===0&&(Math.abs(i.z)===1?gi.x+=1e-4:gi.z+=1e-4,gi.normalize(),Ra.crossVectors(i,gi)),Ra.normalize(),Vh.crossVectors(gi,Ra),s[0]=Ra.x,s[4]=Vh.x,s[8]=gi.x,s[1]=Ra.y,s[5]=Vh.y,s[9]=gi.y,s[2]=Ra.z,s[6]=Vh.z,s[10]=gi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],f=i[1],p=i[5],u=i[9],d=i[13],v=i[2],E=i[6],m=i[10],h=i[14],g=i[3],M=i[7],y=i[11],b=i[15],T=s[0],w=s[4],x=s[8],A=s[12],D=s[1],R=s[5],P=s[9],F=s[13],U=s[2],N=s[6],X=s[10],Y=s[14],j=s[3],H=s[7],J=s[11],tt=s[15];return a[0]=r*T+o*D+l*U+c*j,a[4]=r*w+o*R+l*N+c*H,a[8]=r*x+o*P+l*X+c*J,a[12]=r*A+o*F+l*Y+c*tt,a[1]=f*T+p*D+u*U+d*j,a[5]=f*w+p*R+u*N+d*H,a[9]=f*x+p*P+u*X+d*J,a[13]=f*A+p*F+u*Y+d*tt,a[2]=v*T+E*D+m*U+h*j,a[6]=v*w+E*R+m*N+h*H,a[10]=v*x+E*P+m*X+h*J,a[14]=v*A+E*F+m*Y+h*tt,a[3]=g*T+M*D+y*U+b*j,a[7]=g*w+M*R+y*N+b*H,a[11]=g*x+M*P+y*X+b*J,a[15]=g*A+M*F+y*Y+b*tt,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],f=t[2],p=t[6],u=t[10],d=t[14],v=t[3],E=t[7],m=t[11],h=t[15],g=l*d-c*u,M=o*d-c*p,y=o*u-l*p,b=r*d-c*f,T=r*u-l*f,w=r*p-o*f;return n*(E*g-m*M+h*y)-i*(v*g-m*b+h*T)+s*(v*M-E*b+h*w)-a*(v*y-E*T+m*w)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],f=t[10];return n*(r*f-o*c)-i*(a*f-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=t[9],u=t[10],d=t[11],v=t[12],E=t[13],m=t[14],h=t[15],g=n*o-i*r,M=n*l-s*r,y=n*c-a*r,b=i*l-s*o,T=i*c-a*o,w=s*c-a*l,x=f*E-p*v,A=f*m-u*v,D=f*h-d*v,R=p*m-u*E,P=p*h-d*E,F=u*h-d*m,U=g*F-M*P+y*R+b*D-T*A+w*x;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/U;return t[0]=(o*F-l*P+c*R)*N,t[1]=(s*P-i*F-a*R)*N,t[2]=(E*w-m*T+h*b)*N,t[3]=(u*T-p*w-d*b)*N,t[4]=(l*D-r*F-c*A)*N,t[5]=(n*F-s*D+a*A)*N,t[6]=(m*y-v*w-h*M)*N,t[7]=(f*w-u*y+d*M)*N,t[8]=(r*P-o*D+c*x)*N,t[9]=(i*D-n*P-a*x)*N,t[10]=(v*T-E*y+h*g)*N,t[11]=(p*y-f*T-d*g)*N,t[12]=(o*A-r*R-l*x)*N,t[13]=(n*R-i*A+s*x)*N,t[14]=(E*M-v*b-m*g)*N,t[15]=(f*b-p*M+u*g)*N,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,f=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+i,f*l-s*r,0,c*l-s*o,f*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,f=r+r,p=o+o,u=a*c,d=a*f,v=a*p,E=r*f,m=r*p,h=o*p,g=l*c,M=l*f,y=l*p,b=i.x,T=i.y,w=i.z;return s[0]=(1-(E+h))*b,s[1]=(d+y)*b,s[2]=(v-M)*b,s[3]=0,s[4]=(d-y)*T,s[5]=(1-(u+h))*T,s[6]=(m+g)*T,s[7]=0,s[8]=(v+M)*w,s[9]=(m-g)*w,s[10]=(1-(u+E))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=Do.set(s[0],s[1],s[2]).length(),o=Do.set(s[4],s[5],s[6]).length(),l=Do.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Wi.copy(this);let c=1/r,f=1/o,p=1/l;return Wi.elements[0]*=c,Wi.elements[1]*=c,Wi.elements[2]*=c,Wi.elements[4]*=f,Wi.elements[5]*=f,Wi.elements[6]*=f,Wi.elements[8]*=p,Wi.elements[9]*=p,Wi.elements[10]*=p,n.setFromRotationMatrix(Wi),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Yi,l=!1){let c=this.elements,f=2*a/(n-t),p=2*a/(i-s),u=(n+t)/(n-t),d=(i+s)/(i-s),v,E;if(l)v=a/(r-a),E=r*a/(r-a);else if(o===Yi)v=-(r+a)/(r-a),E=-2*r*a/(r-a);else if(o===Yo)v=-r/(r-a),E=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Yi,l=!1){let c=this.elements,f=2/(n-t),p=2/(i-s),u=-(n+t)/(n-t),d=-(i+s)/(i-s),v,E;if(l)v=1/(r-a),E=r/(r-a);else if(o===Yi)v=-2/(r-a),E=-(r+a)/(r-a);else if(o===Yo)v=-1/(r-a),E=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=v,c[14]=E,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},Do=new W,Wi=new Xe,IA=new W(0,0,0),OA=new W(1,1,1),Ra=new W,Vh=new W,gi=new W,mM=new Xe,gM=new ds,Js=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],f=s[9],p=s[2],u=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(ue(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ue(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(ue(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ue(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(ue(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ue(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:It("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return mM.makeRotationFromQuaternion(t),this.setFromRotationMatrix(mM,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return gM.setFromEuler(this),this.setFromQuaternion(gM,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Js.DEFAULT_ORDER="XYZ";var jo=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},PA=0,_M=new W,Uo=new ds,Gs=new Xe,Gh=new W,bc=new W,BA=new W,FA=new ds,vM=new W(1,0,0),yM=new W(0,1,0),xM=new W(0,0,1),SM={type:"added"},zA={type:"removed"},Lo={type:"childadded",child:null},Ug={type:"childremoved",child:null},On=class e extends fs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:PA++}),this.uuid=fl(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new Js,i=new ds,s=new W(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Xe},normalMatrix:{value:new Xt}}),this.matrix=new Xe,this.matrixWorld=new Xe,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new jo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return Uo.setFromAxisAngle(t,n),this.quaternion.multiply(Uo),this}rotateOnWorldAxis(t,n){return Uo.setFromAxisAngle(t,n),this.quaternion.premultiply(Uo),this}rotateX(t){return this.rotateOnAxis(vM,t)}rotateY(t){return this.rotateOnAxis(yM,t)}rotateZ(t){return this.rotateOnAxis(xM,t)}translateOnAxis(t,n){return _M.copy(t).applyQuaternion(this.quaternion),this.position.add(_M.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(vM,t)}translateY(t){return this.translateOnAxis(yM,t)}translateZ(t){return this.translateOnAxis(xM,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Gs.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Gh.copy(t):Gh.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),bc.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Gs.lookAt(bc,Gh,this.up):Gs.lookAt(Gh,bc,this.up),this.quaternion.setFromRotationMatrix(Gs),s&&(Gs.extractRotation(s.matrixWorld),Uo.setFromRotationMatrix(Gs),this.quaternion.premultiply(Uo.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Bt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(SM),Lo.child=t,this.dispatchEvent(Lo),Lo.child=null):Bt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(zA),Ug.child=t,this.dispatchEvent(Ug),Ug.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Gs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Gs.multiply(t.parent.matrixWorld)),t.applyMatrix4(Gs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(SM),Lo.child=t,this.dispatchEvent(Lo),Lo.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bc,t,BA),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bc,FA,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let p=l[c];a(t.shapes,p)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),f=r(t.images),p=r(t.shapes),u=r(t.skeletons),d=r(t.animations),v=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),p.length>0&&(i.shapes=p),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),v.length>0&&(i.nodes=v)}return i.object=s,i;function r(o){let l=[];for(let c in o){let f=o[c];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};On.DEFAULT_UP=new W(0,1,0);On.DEFAULT_MATRIX_AUTO_UPDATE=!0;On.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ys=class extends On{constructor(){super(),this.isGroup=!0,this.type="Group"}},HA={type:"move"},$o=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ys,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ys,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ys,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let E of t.hand.values()){let m=n.getJointPose(E,i),h=this._getHandJoint(c,E);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}let f=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=f.position.distanceTo(p.position),d=.02,v=.005;c.inputState.pinching&&u>d+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(HA)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new Ys;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},vb={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Da={h:0,s:0,l:0},kh={h:0,s:0,l:0};function Lg(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var ne=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=Ln){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ce.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=ce.workingColorSpace){return this.r=t,this.g=n,this.b=i,ce.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=ce.workingColorSpace){if(t=w0(t,1),n=ue(n,0,1),i=ue(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=Lg(r,a,t+1/3),this.g=Lg(r,a,t),this.b=Lg(r,a,t-1/3)}return ce.colorSpaceToWorking(this,s),this}setStyle(t,n=Ln){function i(a){a!==void 0&&parseFloat(a)<1&&It("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:It("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);It("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=Ln){let i=vb[t.toLowerCase()];return i!==void 0?this.setHex(i,n):It("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Zs(t.r),this.g=Zs(t.g),this.b=Zs(t.b),this}copyLinearToSRGB(t){return this.r=Wo(t.r),this.g=Wo(t.g),this.b=Wo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ln){return ce.workingToColorSpace(Un.copy(this),t),Math.round(ue(Un.r*255,0,255))*65536+Math.round(ue(Un.g*255,0,255))*256+Math.round(ue(Un.b*255,0,255))}getHexString(t=Ln){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=ce.workingColorSpace){ce.workingToColorSpace(Un.copy(this),n);let i=Un.r,s=Un.g,a=Un.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,f=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=f<=.5?p/(r+o):p/(2-r-o),r){case i:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-i)/p+2;break;case a:l=(i-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=f,t}getRGB(t,n=ce.workingColorSpace){return ce.workingToColorSpace(Un.copy(this),n),t.r=Un.r,t.g=Un.g,t.b=Un.b,t}getStyle(t=Ln){ce.workingToColorSpace(Un.copy(this),t);let n=Un.r,i=Un.g,s=Un.b;return t!==Ln?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(Da),this.setHSL(Da.h+t,Da.s+n,Da.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(Da),t.getHSL(kh);let i=Cc(Da.h,kh.h,n),s=Cc(Da.s,kh.s,n),a=Cc(Da.l,kh.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Un=new ne;ne.NAMES=vb;var Nc=class extends On{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Js,this.environmentIntensity=1,this.environmentRotation=new Js,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),n.object.backgroundBlurriness=this.backgroundBlurriness,n.object.backgroundIntensity=this.backgroundIntensity,n.object.backgroundRotation=this.backgroundRotation.toArray(),n.object.environmentIntensity=this.environmentIntensity,n.object.environmentRotation=this.environmentRotation.toArray(),n}},Xi=new W,ks=new W,Ng=new W,Ws=new W,No=new W,Io=new W,MM=new W,Ig=new W,Og=new W,Pg=new W,Bg=new qe,Fg=new qe,zg=new qe,cs=class e{constructor(t=new W,n=new W,i=new W){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),Xi.subVectors(t,n),s.cross(Xi);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){Xi.subVectors(s,n),ks.subVectors(i,n),Ng.subVectors(t,n);let r=Xi.dot(Xi),o=Xi.dot(ks),l=Xi.dot(Ng),c=ks.dot(ks),f=ks.dot(Ng),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*f)*u,v=(r*f-o*l)*u;return a.set(1-d-v,v,d)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Ws)===null?!1:Ws.x>=0&&Ws.y>=0&&Ws.x+Ws.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Ws)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Ws.x),l.addScaledVector(r,Ws.y),l.addScaledVector(o,Ws.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return Bg.setScalar(0),Fg.setScalar(0),zg.setScalar(0),Bg.fromBufferAttribute(t,n),Fg.fromBufferAttribute(t,i),zg.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Bg,a.x),r.addScaledVector(Fg,a.y),r.addScaledVector(zg,a.z),r}static isFrontFacing(t,n,i,s){return Xi.subVectors(i,n),ks.subVectors(t,n),Xi.cross(ks).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Xi.subVectors(this.c,this.b),ks.subVectors(this.a,this.b),Xi.cross(ks).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;No.subVectors(s,i),Io.subVectors(a,i),Ig.subVectors(t,i);let l=No.dot(Ig),c=Io.dot(Ig);if(l<=0&&c<=0)return n.copy(i);Og.subVectors(t,s);let f=No.dot(Og),p=Io.dot(Og);if(f>=0&&p<=f)return n.copy(s);let u=l*p-f*c;if(u<=0&&l>=0&&f<=0)return r=l/(l-f),n.copy(i).addScaledVector(No,r);Pg.subVectors(t,a);let d=No.dot(Pg),v=Io.dot(Pg);if(v>=0&&d<=v)return n.copy(a);let E=d*c-l*v;if(E<=0&&c>=0&&v<=0)return o=c/(c-v),n.copy(i).addScaledVector(Io,o);let m=f*v-d*p;if(m<=0&&p-f>=0&&d-v>=0)return MM.subVectors(a,s),o=(p-f)/(p-f+(d-v)),n.copy(s).addScaledVector(MM,o);let h=1/(m+E+u);return r=E*h,o=u*h,n.copy(i).addScaledVector(No,r).addScaledVector(Io,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ia=class{constructor(t=new W(1/0,1/0,1/0),n=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(qi.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(qi.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=qi.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,qi):qi.fromBufferAttribute(a,r),qi.applyMatrix4(t.matrixWorld),this.expandByPoint(qi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Wh.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wh.copy(i.boundingBox)),Wh.applyMatrix4(t.matrixWorld),this.union(Wh)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,qi),qi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ec),Xh.subVectors(this.max,Ec),Oo.subVectors(t.a,Ec),Po.subVectors(t.b,Ec),Bo.subVectors(t.c,Ec),Ua.subVectors(Po,Oo),La.subVectors(Bo,Po),dr.subVectors(Oo,Bo);let n=[0,-Ua.z,Ua.y,0,-La.z,La.y,0,-dr.z,dr.y,Ua.z,0,-Ua.x,La.z,0,-La.x,dr.z,0,-dr.x,-Ua.y,Ua.x,0,-La.y,La.x,0,-dr.y,dr.x,0];return!Hg(n,Oo,Po,Bo,Xh)||(n=[1,0,0,0,1,0,0,0,1],!Hg(n,Oo,Po,Bo,Xh))?!1:(qh.crossVectors(Ua,La),n=[qh.x,qh.y,qh.z],Hg(n,Oo,Po,Bo,Xh))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,qi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(qi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Xs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Xs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Xs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Xs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Xs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Xs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Xs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Xs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Xs),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Xs=[new W,new W,new W,new W,new W,new W,new W,new W],qi=new W,Wh=new Ia,Oo=new W,Po=new W,Bo=new W,Ua=new W,La=new W,dr=new W,Ec=new W,Xh=new W,qh=new W,pr=new W;function Hg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){pr.fromArray(e,a);let o=s.x*Math.abs(pr.x)+s.y*Math.abs(pr.y)+s.z*Math.abs(pr.z),l=t.dot(pr),c=n.dot(pr),f=i.dot(pr);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}var cn=new W,Yh=new re,VA=0,In=class extends fs{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:VA++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=db,this.updateRanges=[],this.gpuType=Ki,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Yh.fromBufferAttribute(this,n),Yh.applyMatrix3(t),this.setXY(n,Yh.x,Yh.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)cn.fromBufferAttribute(this,n),cn.applyMatrix3(t),this.setXYZ(n,cn.x,cn.y,cn.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)cn.fromBufferAttribute(this,n),cn.applyMatrix4(t),this.setXYZ(n,cn.x,cn.y,cn.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)cn.fromBufferAttribute(this,n),cn.applyNormalMatrix(t),this.setXYZ(n,cn.x,cn.y,cn.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)cn.fromBufferAttribute(this,n),cn.transformDirection(t),this.setXYZ(n,cn.x,cn.y,cn.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=ko(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=kn(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=ko(n,this.array)),n}setX(t,n){return this.normalized&&(n=kn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=ko(n,this.array)),n}setY(t,n){return this.normalized&&(n=kn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=ko(n,this.array)),n}setZ(t,n){return this.normalized&&(n=kn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=ko(n,this.array)),n}setW(t,n){return this.normalized&&(n=kn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=kn(n,this.array),i=kn(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=kn(n,this.array),i=kn(i,this.array),s=kn(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=kn(n,this.array),i=kn(i,this.array),s=kn(s,this.array),a=kn(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Ic=class extends In{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var Oc=class extends In{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var Pi=class extends In{constructor(t,n,i){super(new Float32Array(t),n,i)}},GA=new Ia,Tc=new W,Vg=new W,tl=class{constructor(t=new W,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):GA.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Tc.subVectors(t,this.center);let n=Tc.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(Tc,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Vg.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Tc.copy(t.center).add(Vg)),this.expandByPoint(Tc.copy(t.center).sub(Vg))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},kA=0,Oi=new Xe,Gg=new On,Fo=new W,_i=new Ia,Ac=new Ia,yn=new W,Bi=class e extends fs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kA++}),this.uuid=fl(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(dA(t)?Oc:Ic)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Xt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Oi.makeRotationFromQuaternion(t),this.applyMatrix4(Oi),this}rotateX(t){return Oi.makeRotationX(t),this.applyMatrix4(Oi),this}rotateY(t){return Oi.makeRotationY(t),this.applyMatrix4(Oi),this}rotateZ(t){return Oi.makeRotationZ(t),this.applyMatrix4(Oi),this}translate(t,n,i){return Oi.makeTranslation(t,n,i),this.applyMatrix4(Oi),this}scale(t,n,i){return Oi.makeScale(t,n,i),this.applyMatrix4(Oi),this}lookAt(t){return Gg.lookAt(t),Gg.updateMatrix(),this.applyMatrix4(Gg.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fo).negate(),this.translate(Fo.x,Fo.y,Fo.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new Pi(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&It("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ia);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Bt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];_i.setFromBufferAttribute(a),this.morphTargetsRelative?(yn.addVectors(this.boundingBox.min,_i.min),this.boundingBox.expandByPoint(yn),yn.addVectors(this.boundingBox.max,_i.max),this.boundingBox.expandByPoint(yn)):(this.boundingBox.expandByPoint(_i.min),this.boundingBox.expandByPoint(_i.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Bt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tl);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Bt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(t){let i=this.boundingSphere.center;if(_i.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];Ac.setFromBufferAttribute(o),this.morphTargetsRelative?(yn.addVectors(_i.min,Ac.min),_i.expandByPoint(yn),yn.addVectors(_i.max,Ac.max),_i.expandByPoint(yn)):(_i.expandByPoint(Ac.min),_i.expandByPoint(Ac.max))}_i.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)yn.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(yn));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)yn.fromBufferAttribute(o,c),l&&(Fo.fromBufferAttribute(t,c),yn.add(Fo)),s=Math.max(s,i.distanceToSquared(yn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Bt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Bt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new In(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new W,l[x]=new W;let c=new W,f=new W,p=new W,u=new re,d=new re,v=new re,E=new W,m=new W;function h(x,A,D){c.fromBufferAttribute(i,x),f.fromBufferAttribute(i,A),p.fromBufferAttribute(i,D),u.fromBufferAttribute(a,x),d.fromBufferAttribute(a,A),v.fromBufferAttribute(a,D),f.sub(c),p.sub(c),d.sub(u),v.sub(u);let R=1/(d.x*v.y-v.x*d.y);isFinite(R)&&(E.copy(f).multiplyScalar(v.y).addScaledVector(p,-d.y).multiplyScalar(R),m.copy(p).multiplyScalar(d.x).addScaledVector(f,-v.x).multiplyScalar(R),o[x].add(E),o[A].add(E),o[D].add(E),l[x].add(m),l[A].add(m),l[D].add(m))}let g=this.groups;g.length===0&&(g=[{start:0,count:t.count}]);for(let x=0,A=g.length;x<A;++x){let D=g[x],R=D.start,P=D.count;for(let F=R,U=R+P;F<U;F+=3)h(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let M=new W,y=new W,b=new W,T=new W;function w(x){b.fromBufferAttribute(s,x),T.copy(b);let A=o[x];M.copy(A),M.sub(b.multiplyScalar(b.dot(A))).normalize(),y.crossVectors(T,A);let R=y.dot(l[x])<0?-1:1;r.setXYZW(x,M.x,M.y,M.z,R)}for(let x=0,A=g.length;x<A;++x){let D=g[x],R=D.start,P=D.count;for(let F=R,U=R+P;F<U;F+=3)w(t.getX(F+0)),w(t.getX(F+1)),w(t.getX(F+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new In(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new W,a=new W,r=new W,o=new W,l=new W,c=new W,f=new W,p=new W;if(t)for(let u=0,d=t.count;u<d;u+=3){let v=t.getX(u+0),E=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(n,v),a.fromBufferAttribute(n,E),r.fromBufferAttribute(n,m),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),o.fromBufferAttribute(i,v),l.fromBufferAttribute(i,E),c.fromBufferAttribute(i,m),o.add(f),l.add(f),c.add(f),i.setXYZ(v,o.x,o.y,o.z),i.setXYZ(E,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=n.count;u<d;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),i.setXYZ(u+0,f.x,f.y,f.z),i.setXYZ(u+1,f.x,f.y,f.z),i.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)yn.fromBufferAttribute(t,n),yn.normalize(),t.setXYZ(n,yn.x,yn.y,yn.z)}toNonIndexed(){function t(o,l){let c=o.array,f=o.itemSize,p=o.normalized,u=new c.constructor(l.length*f),d=0,v=0;for(let E=0,m=l.length;E<m;E++){o.isInterleavedBufferAttribute?d=l[E]*o.data.stride+o.offset:d=l[E]*f;for(let h=0;h<f;h++)u[v++]=c[d++]}return new In(u,f,p)}if(this.index===null)return It("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let f=0,p=c.length;f<p;f++){let u=c[f],d=t(u,i);l.push(d)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];f.push(d.toJSON(t.data))}f.length>0&&(s[l]=f,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(n))}let a=t.morphAttributes;for(let c in a){let f=[],p=a[c];for(let u=0,d=p.length;u<d;u++)f.push(p[u].clone(n));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,f=r.length;c<f;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var kg=new W,WA=new W,XA=new Xt,vi=class{constructor(t=new W(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=kg.subVectors(i,n).cross(WA.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(kg),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||XA.getNormalMatrix(t),s=this.coplanarPoint(kg).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},qA=0,Ks=class extends fs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qA++}),this.uuid=fl(),this.name="",this.type="Material",this.blending=cl,this.side=ps,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=r0,this.blendDst=o0,this.blendEquation=yr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ne(0,0,0),this.blendAlpha=0,this.depthFunc=Xo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rb,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=lf,this.stencilZFail=lf,this.stencilZPass=lf,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){It(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new ne().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new vi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new re().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new re().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var qs=new W,Wg=new W,Zh=new W,Jh=new W,Pc=class{constructor(t=new W,n=new W(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,qs)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=qs.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(qs.copy(this.origin).addScaledVector(this.direction,n),qs.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){Wg.copy(t).add(n).multiplyScalar(.5),Zh.copy(n).sub(t).normalize(),Jh.copy(this.origin).sub(Wg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(Zh),o=Jh.dot(this.direction),l=-Jh.dot(Zh),c=Jh.lengthSq(),f=Math.abs(1-r*r),p,u,d,v;if(f>0)if(p=r*l-o,u=r*o-l,v=a*f,p>=0)if(u>=-v)if(u<=v){let E=1/f;p*=E,u*=E,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-v?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=v?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Wg).addScaledVector(Zh,u),d}intersectSphere(t,n){if(t.radius<0)return null;qs.subVectors(t.center,this.origin);let i=qs.dot(this.direction),s=qs.dot(qs)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),f>=0?(a=(t.min.y-u.y)*f,r=(t.max.y-u.y)*f):(a=(t.max.y-u.y)*f,r=(t.min.y-u.y)*f),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(t.min.z-u.z)*p,l=(t.max.z-u.z)*p):(o=(t.max.z-u.z)*p,l=(t.min.z-u.z)*p),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,qs)!==null}intersectTriangle(t,n,i,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,f=o.z,p=t.x-r.x,u=t.y-r.y,d=t.z-r.z,v=n.x-r.x,E=n.y-r.y,m=n.z-r.z,h=i.x-r.x,g=i.y-r.y,M=i.z-r.z,y=Math.abs(l),b=Math.abs(c),T=Math.abs(f),w,x,A,D,R,P,F,U,N,X,Y,j;if(y>=b&&y>=T?(A=l,P=p,N=v,j=h,l>=0?(w=c,x=f,D=u,R=d,F=E,U=m,X=g,Y=M):(w=f,x=c,D=d,R=u,F=m,U=E,X=M,Y=g)):b>=T?(A=c,P=u,N=E,j=g,c>=0?(w=f,x=l,D=d,R=p,F=m,U=v,X=M,Y=h):(w=l,x=f,D=p,R=d,F=v,U=m,X=h,Y=M)):(A=f,P=d,N=m,j=M,f>=0?(w=l,x=c,D=p,R=u,F=v,U=E,X=h,Y=g):(w=c,x=l,D=u,R=p,F=E,U=v,X=g,Y=h)),A===0)return null;let H=w/A,J=x/A,tt=1/A,Mt=D-H*P,vt=R-J*P,Ot=F-H*N,Nt=U-J*N,Gt=X-H*j,Z=Y-J*j,et=Gt*Nt-Z*Ot,dt=Mt*Z-vt*Gt,Lt=Ot*vt-Nt*Mt;if(s){if(et<0||dt<0||Lt<0)return null}else if((et<0||dt<0||Lt<0)&&(et>0||dt>0||Lt>0))return null;let at=et+dt+Lt;if(at===0)return null;let qt=tt*(et*P+dt*N+Lt*j);return(at>0?qt<0:qt>0)?null:this.at(qt/at,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Bc=class extends Ks{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Js,this.combine=l0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},bM=new Xe,mr=new Pc,Kh=new tl,EM=new W,Qh=new W,jh=new W,$h=new W,Xg=new W,tf=new W,TM=new W,ef=new W,Pn=class extends On{constructor(t=new Bi,n=new Bc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){tf.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let f=o[l],p=a[l];f!==0&&(Xg.fromBufferAttribute(p,t),r?tf.addScaledVector(Xg,f):tf.addScaledVector(Xg.sub(n),f))}n.add(tf)}return n}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Kh.copy(i.boundingSphere),Kh.applyMatrix4(a),mr.copy(t.ray).recast(t.near),!(Kh.containsPoint(mr.origin)===!1&&(mr.intersectSphere(Kh,EM)===null||mr.origin.distanceToSquared(EM)>(t.far-t.near)**2))&&(bM.copy(a).invert(),mr.copy(t.ray).applyMatrix4(bM),!(i.boundingBox!==null&&mr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,mr)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,f=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let v=0,E=u.length;v<E;v++){let m=u[v],h=r[m.materialIndex],g=Math.max(m.start,d.start),M=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=g,b=M;y<b;y+=3){let T=o.getX(y),w=o.getX(y+1),x=o.getX(y+2);s=nf(this,h,t,i,c,f,p,T,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let v=Math.max(0,d.start),E=Math.min(o.count,d.start+d.count);for(let m=v,h=E;m<h;m+=3){let g=o.getX(m),M=o.getX(m+1),y=o.getX(m+2);s=nf(this,r,t,i,c,f,p,g,M,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let v=0,E=u.length;v<E;v++){let m=u[v],h=r[m.materialIndex],g=Math.max(m.start,d.start),M=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=g,b=M;y<b;y+=3){let T=y,w=y+1,x=y+2;s=nf(this,h,t,i,c,f,p,T,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let v=Math.max(0,d.start),E=Math.min(l.count,d.start+d.count);for(let m=v,h=E;m<h;m+=3){let g=m,M=m+1,y=m+2;s=nf(this,r,t,i,c,f,p,g,M,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function YA(e,t,n,i,s,a,r,o){let l;if(t.side===wn?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===ps,o),l===null)return null;ef.copy(o),ef.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(ef);return c<n.near||c>n.far?null:{distance:c,point:ef.clone(),object:e}}function nf(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,Qh),e.getVertexPosition(l,jh),e.getVertexPosition(c,$h);let f=YA(e,t,n,i,Qh,jh,$h,TM);if(f){let p=new W;cs.getBarycoord(TM,Qh,jh,$h,p),s&&(f.uv=cs.getInterpolatedAttribute(s,o,l,c,p,new re)),a&&(f.uv1=cs.getInterpolatedAttribute(a,o,l,c,p,new re)),r&&(f.normal=cs.getInterpolatedAttribute(r,o,l,c,p,new W),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new W,materialIndex:0};cs.getNormal(Qh,jh,$h,u.normal),f.face=u,f.barycoord=p}return f}var el=class extends Wn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=xn,f=xn,p,u){super(null,r,o,l,c,f,s,a,p,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gr=new tl,ZA=new re(.5,.5),sf=new W,nl=class{constructor(t=new vi,n=new vi,i=new vi,s=new vi,a=new vi,r=new vi){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Yi,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],f=a[4],p=a[5],u=a[6],d=a[7],v=a[8],E=a[9],m=a[10],h=a[11],g=a[12],M=a[13],y=a[14],b=a[15];if(s[0].setComponents(c-r,d-f,h-v,b-g).normalize(),s[1].setComponents(c+r,d+f,h+v,b+g).normalize(),s[2].setComponents(c+o,d+p,h+E,b+M).normalize(),s[3].setComponents(c-o,d-p,h-E,b-M).normalize(),i)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,d-u,h-m,b-y).normalize();else if(s[4].setComponents(c-l,d-u,h-m,b-y).normalize(),n===Yi)s[5].setComponents(c+l,d+u,h+m,b+y).normalize();else if(n===Yo)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),gr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),gr.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(gr)}intersectsSprite(t){gr.center.set(0,0,0);let n=ZA.distanceTo(t.center);return gr.radius=.7071067811865476+n,gr.applyMatrix4(t.matrixWorld),this.intersectsSphere(gr)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(sf.x=s.normal.x>0?t.max.x:t.min.x,sf.y=s.normal.y>0?t.max.y:t.min.y,sf.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(sf)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Fc=class extends Wn{constructor(t=[],n=za,i,s,a,r,o,l,c,f){super(t,n,i,s,a,r,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var Oa=class extends Wn{constructor(t,n,i=Ji,s,a,r,o=xn,l=xn,c,f=hs,p=1){if(f!==hs&&f!==Va)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:p};super(u,s,a,r,o,l,f,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Qo(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return n.compareFunction=this.compareFunction,n}},Mf=class extends Oa{constructor(t,n=Ji,i=za,s,a,r=xn,o=xn,l,c=hs){let f={width:t,height:t,depth:1},p=[f,f,f,f,f,f];super(t,t,n,i,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},zc=class extends Wn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},il=class e extends Bi{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],f=[],p=[],u=0,d=0;v("z","y","x",-1,-1,i,n,t,r,a,0),v("z","y","x",1,-1,i,n,-t,r,a,1),v("x","z","y",1,1,t,i,n,s,r,2),v("x","z","y",1,-1,t,i,-n,s,r,3),v("x","y","z",1,-1,t,n,i,s,a,4),v("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new Pi(c,3)),this.setAttribute("normal",new Pi(f,3)),this.setAttribute("uv",new Pi(p,2));function v(E,m,h,g,M,y,b,T,w,x,A){let D=y/w,R=b/x,P=y/2,F=b/2,U=T/2,N=w+1,X=x+1,Y=0,j=0,H=new W;for(let J=0;J<X;J++){let tt=J*R-F;for(let Mt=0;Mt<N;Mt++){let vt=Mt*D-P;H[E]=vt*g,H[m]=tt*M,H[h]=U,c.push(H.x,H.y,H.z),H[E]=0,H[m]=0,H[h]=T>0?1:-1,f.push(H.x,H.y,H.z),p.push(Mt/w),p.push(1-J/x),Y+=1}}for(let J=0;J<x;J++)for(let tt=0;tt<w;tt++){let Mt=u+tt+N*J,vt=u+tt+N*(J+1),Ot=u+(tt+1)+N*(J+1),Nt=u+(tt+1)+N*J;l.push(Mt,vt,Nt),l.push(vt,Ot,Nt),j+=6}o.addGroup(d,j,A),d+=j,u+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var vr=class e extends Bi{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,f=l+1,p=t/o,u=n/l,d=[],v=[],E=[],m=[];for(let h=0;h<f;h++){let g=h*u-r;for(let M=0;M<c;M++){let y=M*p-a;v.push(y,-g,0),E.push(0,0,1),m.push(M/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let g=0;g<o;g++){let M=g+c*h,y=g+c*(h+1),b=g+1+c*(h+1),T=g+1+c*h;d.push(M,y,T),d.push(y,b,T)}this.setIndex(d),this.setAttribute("position",new Pi(v,3)),this.setAttribute("normal",new Pi(E,3)),this.setAttribute("uv",new Pi(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var Hc=class extends Ks{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new ne(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}};function Sr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(AM(s))s.isRenderTargetTexture?(It("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(AM(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function Bn(e){let t={};for(let n=0;n<e.length;n++){let i=Sr(e[n]);for(let s in i)t[s]=i[s]}return t}function AM(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function JA(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function C0(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ce.workingColorSpace}var yb={clone:Sr,merge:Bn},KA=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,QA=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,yi=class extends Ks{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=KA,this.fragmentShader=QA,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Sr(t.uniforms),this.uniformsGroups=JA(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new ne().setHex(s.value);break;case"v2":this.uniforms[i].value=new re().fromArray(s.value);break;case"v3":this.uniforms[i].value=new W().fromArray(s.value);break;case"v4":this.uniforms[i].value=new qe().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Xt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Xe().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},bf=class extends yi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},sl=class extends Ks{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ed,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Js,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var al=class extends Ks{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=sb,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ef=class extends Ks{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function zo(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function qg(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Pa=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Tf=class extends Pa{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Jg,endingEnd:Jg}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Kg:a=t,o=2*n-i;break;case Qg:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Kg:r=t,l=2*i-n;break;case Qg:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,f=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*f,this._offsetNext=r*f}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,v=(i-n)/(s-n),E=v*v,m=E*v,h=-u*m+2*u*E-u*v,g=(1+u)*m+(-1.5-2*u)*E+(-.5+u)*v+1,M=(-1-d)*m+(1.5+d)*E+.5*v,y=d*m-d*E;for(let b=0;b!==o;++b)a[b]=h*r[f+b]+g*r[c+b]+M*r[l+b]+y*r[p+b];return a}},Af=class extends Pa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=(i-n)/(s-n),p=1-f;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*f;return a}},wf=class extends Pa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Cf=class extends Pa{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this.inTangents,p=this.outTangents;if(!f||!p){let v=(i-n)/(s-n),E=1-v;for(let m=0;m!==o;++m)a[m]=r[c+m]*E+r[l+m]*v;return a}let u=o*2,d=t-1;for(let v=0;v!==o;++v){let E=r[c+v],m=r[l+v],h=d*u+v*2,g=p[h],M=p[h+1],y=t*u+v*2,b=f[y],T=f[y+1],w=$A(i,n,g,b,s);a[v]=xb(w,E,M,T,m)}return a}};function xb(e,t,n,i,s){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*i+e*e*e*s}function jA(e,t,n,i,s){let a=1-e;return 3*a*a*(n-t)+6*a*e*(i-n)+3*e*e*(s-i)}function $A(e,t,n,i,s){let a=(e-t)/(s-t);for(let r=0;r<8;r++){let o=xb(a,t,n,i,s)-e;if(Math.abs(o)<1e-10)break;let l=jA(a,t,n,i,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var xi=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=zo(n,this.TimeBufferType),this.values=zo(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:zo(t.times,Array),values:zo(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),qg(t.settings)&&(i.settings={inTangents:zo(t.settings.inTangents,Array),outTangents:zo(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new wf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Af(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Tf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new Cf(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case Rc:n=this.InterpolantFactoryMethodDiscrete;break;case vf:n=this.InterpolantFactoryMethodLinear;break;case of:n=this.InterpolantFactoryMethodSmooth;break;case Zg:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return It("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Rc;case this.InterpolantFactoryMethodLinear:return vf;case this.InterpolantFactoryMethodSmooth:return of;case this.InterpolantFactoryMethodBezier:return Zg}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t;qg(this.settings)&&(wM(this.settings.inTangents,t),wM(this.settings.outTangents,t))}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(Bt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Bt("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Bt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Bt("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&pA(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Bt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===of,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],f=t[o+1];if(c!==f&&(o!==1||c!==t[0]))if(s)l=!0;else{let p=o*i,u=p-i,d=p+i;for(let v=0;v!==i;++v){let E=n[p+v];if(E!==n[u+v]||E!==n[d+v]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let p=o*i,u=r*i;for(let d=0;d!==i;++d)n[u+d]=n[p+d]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,qg(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function wM(e,t){for(let n=0,i=e.length;n!==i;n+=2)e[n]*=t}xi.prototype.ValueTypeName="";xi.prototype.TimeBufferType=Float32Array;xi.prototype.ValueBufferType=Float32Array;xi.prototype.DefaultInterpolation=vf;var Ba=class extends xi{constructor(t,n,i){super(t,n,i)}};Ba.prototype.ValueTypeName="bool";Ba.prototype.ValueBufferType=Array;Ba.prototype.DefaultInterpolation=Rc;Ba.prototype.InterpolantFactoryMethodLinear=void 0;Ba.prototype.InterpolantFactoryMethodSmooth=void 0;var Rf=class extends xi{constructor(t,n,i,s){super(t,n,i,s)}};Rf.prototype.ValueTypeName="color";var Df=class extends xi{constructor(t,n,i,s){super(t,n,i,s)}};Df.prototype.ValueTypeName="number";var Uf=class extends Pa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let f=c+o;c!==f;c+=4)ds.slerpFlat(a,0,r,c-o,r,c,l);return a}},Vc=class extends xi{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new Uf(this.times,this.values,this.getValueSize(),t)}};Vc.prototype.ValueTypeName="quaternion";Vc.prototype.InterpolantFactoryMethodSmooth=void 0;var Fa=class extends xi{constructor(t,n,i){super(t,n,i)}};Fa.prototype.ValueTypeName="string";Fa.prototype.ValueBufferType=Array;Fa.prototype.DefaultInterpolation=Rc;Fa.prototype.InterpolantFactoryMethodLinear=void 0;Fa.prototype.InterpolantFactoryMethodSmooth=void 0;var Lf=class extends xi{constructor(t,n,i,s){super(t,n,i,s)}};Lf.prototype.ValueTypeName="vector";var cf={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(CM(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!CM(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function CM(e){try{let t=e.slice(e.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var Nf=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(f){o++,a===!1&&s.onStart!==void 0&&s.onStart(f,r,o),a=!0},this.itemEnd=function(f){r++,s.onProgress!==void 0&&s.onProgress(f,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,p){return c.push(f,p),this},this.removeHandler=function(f){let p=c.indexOf(f);return p!==-1&&c.splice(p,2),this},this.getHandler=function(f){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],v=c[p+1];if(d.global&&(d.lastIndex=0),d.test(f))return v}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Sb=new Nf,rl=class{constructor(t){this.manager=t!==void 0?t:Sb,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};rl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ho=new WeakMap,If=class extends rl{constructor(t){super(t)}load(t,n,i,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let a=this,r=cf.get(`image:${t}`);if(r!==void 0){if(r.complete===!0)a.manager.itemStart(t),setTimeout(function(){n&&n(r),a.manager.itemEnd(t)},0);else{let p=Ho.get(r);p===void 0&&(p=[],Ho.set(r,p)),p.push({onLoad:n,onError:s})}return r}let o=Zo("img");function l(){f(),n&&n(this);let p=Ho.get(this)||[];for(let u=0;u<p.length;u++){let d=p[u];d.onLoad&&d.onLoad(this)}Ho.delete(this),a.manager.itemEnd(t)}function c(p){f(),s&&s(p),cf.remove(`image:${t}`);let u=Ho.get(this)||[];for(let d=0;d<u.length;d++){let v=u[d];v.onError&&v.onError(p)}Ho.delete(this),a.manager.itemError(t),a.manager.itemEnd(t)}function f(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),cf.add(`image:${t}`,o),a.manager.itemStart(t),o.src=t,o}};var Gc=class extends rl{constructor(t){super(t)}load(t,n,i,s){let a=new Wn,r=new If(this.manager);return r.setCrossOrigin(this.crossOrigin),r.setPath(this.path),r.load(t,function(o){a.image=o,a.needsUpdate=!0,n!==void 0&&n(a)},i,s),a}},kc=class extends On{constructor(t,n=1){super(),this.isLight=!0,this.type="Light",this.color=new ne(t),this.intensity=n}copy(t,n){return super.copy(t,n),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let n=super.toJSON(t);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}},Wc=class extends kc{constructor(t,n,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ne(n)}copy(t,n){return super.copy(t,n),this.groundColor.copy(t.groundColor),this}toJSON(t){let n=super.toJSON(t);return n.object.groundColor=this.groundColor.getHex(),n}},Yg=new Xe,RM=new W,DM=new W,Of=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new re(512,512),this.mapType=ei,this.map=null,this.mapPass=null,this.matrix=new Xe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nl,this._frameExtents=new re(1,1),this._viewportCount=1,this._viewports=[new qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let n=this.camera;RM.setFromMatrixPosition(t.matrixWorld),n.position.copy(RM),DM.setFromMatrixPosition(t.target.matrixWorld),n.lookAt(DM),n.updateMatrixWorld(),this._updateMatrix(n,this.matrix,this._frustum)}_updateMatrix(t,n,i,s){Yg.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Yg,t.coordinateSystem,t.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;t.coordinateSystem===Yo||t.reversedDepth?n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):n.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),n.multiply(Yg)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},af=new W,rf=new ds,ls=new W,Xc=class extends On{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xe,this.projectionMatrix=new Xe,this.projectionMatrixInverse=new Xe,this.coordinateSystem=Yi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(af,rf,ls),ls.x===1&&ls.y===1&&ls.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(af,rf,ls.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(af,rf,ls),ls.x===1&&ls.y===1&&ls.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(af,rf,ls.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Na=new W,UM=new re,LM=new re,Nn=class extends Xc{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=Ko*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(wc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ko*2*Math.atan(Math.tan(wc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){Na.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Na.x,Na.y).multiplyScalar(-t/Na.z),Na.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Na.x,Na.y).multiplyScalar(-t/Na.z)}getViewSize(t,n){return this.getViewBounds(t,UM,LM),n.subVectors(LM,UM)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(wc*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var ol=class extends Xc{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},jg=class extends Of{constructor(){super(new ol(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},qc=class extends kc{constructor(t,n){super(t,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.target=new On,this.shadow=new jg}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}};var Vo=-90,Go=1,Pf=class extends On{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Nn(Vo,Go,t,n);s.layers=this.layers,this.add(s);let a=new Nn(Vo,Go,t,n);a.layers=this.layers,this.add(a);let r=new Nn(Vo,Go,t,n);r.layers=this.layers,this.add(r);let o=new Nn(Vo,Go,t,n);o.layers=this.layers,this.add(o);let l=new Nn(Vo,Go,t,n);l.layers=this.layers,this.add(l);let c=new Nn(Vo,Go,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Yi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Yo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,f]=this.children,p=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),v=t.xr.enabled;t.xr.enabled=!1;let E=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=E,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,f),t.setRenderTarget(p,u,d),t.xr.enabled=v,i.texture.needsPMREMUpdate=!0}},Bf=class extends Nn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var R0="\\[\\]\\.:\\/",tw=new RegExp("["+R0+"]","g"),D0="[^"+R0+"]",ew="[^"+R0.replace("\\.","")+"]",nw=/((?:WC+[\/:])*)/.source.replace("WC",D0),iw=/(WCOD+)?/.source.replace("WCOD",ew),sw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",D0),aw=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",D0),rw=new RegExp("^"+nw+iw+sw+aw+"$"),ow=["material","materials","bones","map"],$g=class{constructor(t,n,i){let s=i||ze.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},ze=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(tw,"")}static parseTrackName(t){let n=rw.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);ow.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){It("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){Bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Bt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Bt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Bt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Bt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Bt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;Bt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ze.Composite=$g;ze.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ze.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ze.prototype.GetterByBindingType=[ze.prototype._getValue_direct,ze.prototype._getValue_array,ze.prototype._getValue_arrayElement,ze.prototype._getValue_toArray];ze.prototype.SetterByBindingTypeAndVersioning=[[ze.prototype._setValue_direct,ze.prototype._setValue_direct_setNeedsUpdate,ze.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_array,ze.prototype._setValue_array_setNeedsUpdate,ze.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_arrayElement,ze.prototype._setValue_arrayElement_setNeedsUpdate,ze.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ze.prototype._setValue_fromArray,ze.prototype._setValue_fromArray_setNeedsUpdate,ze.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var vD=new Float32Array(1);var NM=new Xe,Yc=class{constructor(t,n,i=0,s=1/0){this.ray=new Pc(t,n),this.near=i,this.far=s,this.camera=null,this.layers=new jo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,n){this.ray.set(t,n)}setFromCamera(t,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,n.projectionMatrix.elements[14]).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):Bt("Raycaster: Unsupported camera type: "+n.type)}setFromXRController(t){return NM.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(NM),this}intersectObject(t,n=!0,i=[]){return t0(t,this,i,n),i.sort(IM),i}intersectObjects(t,n=!0,i=[]){for(let s=0,a=t.length;s<a;s++)t0(t[s],this,i,n);return i.sort(IM),i}};function IM(e,t){return e.distance-t.distance}function t0(e,t,n,i){let s=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(s=!1),s===!0&&i===!0){let a=e.children;for(let r=0,o=a.length;r<o;r++)t0(a[r],t,n,!0)}}var e0=class e{static{e.prototype.isMatrix2=!0}constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};function U0(e,t,n,i){let s=lw(i);switch(n){case S0:return e*t;case b0:return e*t/s.components*s.byteLength;case Xf:return e*t/s.components*s.byteLength;case Ga:return e*t*2/s.components*s.byteLength;case qf:return e*t*2/s.components*s.byteLength;case M0:return e*t*3/s.components*s.byteLength;case zi:return e*t*4/s.components*s.byteLength;case Yf:return e*t*4/s.components*s.byteLength;case Qc:case jc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case $c:case tu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Jf:case Qf:return Math.max(e,16)*Math.max(t,8)/4;case Zf:case Kf:return Math.max(e,8)*Math.max(t,8)/2;case jf:case $f:case ed:case nd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case td:case eu:case id:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case sd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ad:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case rd:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case od:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ld:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case cd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ud:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case hd:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case fd:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case dd:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case pd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case md:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case gd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case _d:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case vd:case yd:case xd:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Sd:case Md:return Math.ceil(e/4)*Math.ceil(t/4)*8;case nu:case bd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function lw(e){switch(e){case ei:case _0:return{byteLength:1,components:1};case ul:case v0:case Qi:return{byteLength:2,components:1};case kf:case Wf:return{byteLength:2,components:4};case Ji:case Gf:case Ki:return{byteLength:4,components:1};case y0:case x0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?It("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function kb(){let e=null,t=!1,n=null,i=null;function s(a,r){i=e.requestAnimationFrame(s),n(a,r)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function uw(e){let t=new WeakMap;function n(o,l){let c=o.array,f=o.usage,p=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=e.HALF_FLOAT:d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){let f=l.array,p=l.updateRanges;if(e.bindBuffer(c,o),p.length===0)e.bufferSubData(c,0,f);else{p.sort((d,v)=>d.start-v.start);let u=0;for(let d=1;d<p.length;d++){let v=p[u],E=p[d];E.start<=v.start+v.count+1?v.count=Math.max(v.count,E.start+E.count-v.start):(++u,p[u]=E)}p.length=u+1;for(let d=0,v=p.length;d<v;d++){let E=p[d];e.bufferSubData(c,E.start*f.BYTES_PER_ELEMENT,f,E.start,E.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var hw=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,fw=`#ifdef USE_ALPHAHASH
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
#endif`,dw=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,pw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,mw=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,gw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_w=`#ifdef USE_AOMAP
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
#endif`,vw=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yw=`#ifdef USE_BATCHING
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
#endif`,xw=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Sw=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Mw=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bw=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ew=`#ifdef USE_IRIDESCENCE
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
#endif`,Tw=`#ifdef USE_BUMPMAP
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
#endif`,Aw=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ww=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Rw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Uw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Lw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Nw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Iw=`#define PI 3.141592653589793
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
} // validated`,Ow=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Pw=`vec3 transformedNormal = objectNormal;
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
#endif`,Bw=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fw=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,zw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vw="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gw=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,kw=`#ifdef USE_ENVMAP
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
#endif`,Ww=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Xw=`#ifdef USE_ENVMAP
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
#endif`,qw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Yw=`#ifdef USE_ENVMAP
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
#endif`,Zw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Jw=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Kw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jw=`#ifdef USE_GRADIENTMAP
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
}`,$w=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,tC=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,eC=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,nC=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,iC=`#ifdef USE_ENVMAP
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
#endif`,sC=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,aC=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rC=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,oC=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lC=`PhysicalMaterial material;
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
#endif`,cC=`uniform sampler2D dfgLUT;
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
}`,uC=`
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
#endif`,hC=`#if defined( RE_IndirectDiffuse )
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
#endif`,fC=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,dC=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,pC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,mC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gC=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_C=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,vC=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,yC=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xC=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,SC=`#if defined( USE_POINTS_UV )
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
#endif`,MC=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bC=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,EC=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,TC=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,AC=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wC=`#ifdef USE_MORPHTARGETS
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
#endif`,CC=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,RC=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,DC=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,UC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,LC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,NC=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,IC=`#ifdef USE_NORMALMAP
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
#endif`,OC=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,PC=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,BC=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,FC=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,zC=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,HC=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,VC=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,GC=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kC=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,WC=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,XC=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qC=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,YC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ZC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,JC=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,KC=`float getShadowMask() {
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
}`,QC=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jC=`#ifdef USE_SKINNING
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
#endif`,$C=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tR=`#ifdef USE_SKINNING
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
#endif`,eR=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,nR=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,iR=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sR=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,aR=`#ifdef USE_TRANSMISSION
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
#endif`,rR=`#ifdef USE_TRANSMISSION
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
#endif`,oR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,lR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uR=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,hR=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fR=`uniform sampler2D t2D;
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
}`,dR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pR=`#ifdef ENVMAP_TYPE_CUBE
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
}`,mR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gR=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_R=`#include <common>
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
}`,vR=`#if DEPTH_PACKING == 3200
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
}`,yR=`#define DISTANCE
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
}`,xR=`#define DISTANCE
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
}`,SR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,MR=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bR=`uniform float scale;
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
}`,ER=`uniform vec3 diffuse;
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
}`,TR=`#include <common>
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
}`,AR=`uniform vec3 diffuse;
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
}`,wR=`#define LAMBERT
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
}`,CR=`#define LAMBERT
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
}`,RR=`#define MATCAP
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
}`,DR=`#define MATCAP
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
}`,UR=`#define NORMAL
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
}`,LR=`#define NORMAL
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
}`,NR=`#define PHONG
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
}`,IR=`#define PHONG
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
}`,OR=`#define STANDARD
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
}`,PR=`#define STANDARD
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
}`,BR=`#define TOON
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
}`,FR=`#define TOON
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
}`,zR=`uniform float size;
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
}`,HR=`uniform vec3 diffuse;
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
}`,VR=`#include <common>
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
}`,GR=`uniform vec3 color;
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
}`,kR=`uniform float rotation;
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
}`,WR=`uniform vec3 diffuse;
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
}`,$t={alphahash_fragment:hw,alphahash_pars_fragment:fw,alphamap_fragment:dw,alphamap_pars_fragment:pw,alphatest_fragment:mw,alphatest_pars_fragment:gw,aomap_fragment:_w,aomap_pars_fragment:vw,batching_pars_vertex:yw,batching_vertex:xw,begin_vertex:Sw,beginnormal_vertex:Mw,bsdfs:bw,iridescence_fragment:Ew,bumpmap_pars_fragment:Tw,clipping_planes_fragment:Aw,clipping_planes_pars_fragment:ww,clipping_planes_pars_vertex:Cw,clipping_planes_vertex:Rw,color_fragment:Dw,color_pars_fragment:Uw,color_pars_vertex:Lw,color_vertex:Nw,common:Iw,cube_uv_reflection_fragment:Ow,defaultnormal_vertex:Pw,displacementmap_pars_vertex:Bw,displacementmap_vertex:Fw,emissivemap_fragment:zw,emissivemap_pars_fragment:Hw,colorspace_fragment:Vw,colorspace_pars_fragment:Gw,envmap_fragment:kw,envmap_common_pars_fragment:Ww,envmap_pars_fragment:Xw,envmap_pars_vertex:qw,envmap_physical_pars_fragment:iC,envmap_vertex:Yw,fog_vertex:Zw,fog_pars_vertex:Jw,fog_fragment:Kw,fog_pars_fragment:Qw,gradientmap_pars_fragment:jw,lightmap_pars_fragment:$w,lights_lambert_fragment:tC,lights_lambert_pars_fragment:eC,lights_pars_begin:nC,lights_toon_fragment:sC,lights_toon_pars_fragment:aC,lights_phong_fragment:rC,lights_phong_pars_fragment:oC,lights_physical_fragment:lC,lights_physical_pars_fragment:cC,lights_fragment_begin:uC,lights_fragment_maps:hC,lights_fragment_end:fC,lightprobes_pars_fragment:dC,logdepthbuf_fragment:pC,logdepthbuf_pars_fragment:mC,logdepthbuf_pars_vertex:gC,logdepthbuf_vertex:_C,map_fragment:vC,map_pars_fragment:yC,map_particle_fragment:xC,map_particle_pars_fragment:SC,metalnessmap_fragment:MC,metalnessmap_pars_fragment:bC,morphinstance_vertex:EC,morphcolor_vertex:TC,morphnormal_vertex:AC,morphtarget_pars_vertex:wC,morphtarget_vertex:CC,normal_fragment_begin:RC,normal_fragment_maps:DC,normal_pars_fragment:UC,normal_pars_vertex:LC,normal_vertex:NC,normalmap_pars_fragment:IC,clearcoat_normal_fragment_begin:OC,clearcoat_normal_fragment_maps:PC,clearcoat_pars_fragment:BC,iridescence_pars_fragment:FC,opaque_fragment:zC,packing:HC,premultiplied_alpha_fragment:VC,project_vertex:GC,dithering_fragment:kC,dithering_pars_fragment:WC,roughnessmap_fragment:XC,roughnessmap_pars_fragment:qC,shadowmap_pars_fragment:YC,shadowmap_pars_vertex:ZC,shadowmap_vertex:JC,shadowmask_pars_fragment:KC,skinbase_vertex:QC,skinning_pars_vertex:jC,skinning_vertex:$C,skinnormal_vertex:tR,specularmap_fragment:eR,specularmap_pars_fragment:nR,tonemapping_fragment:iR,tonemapping_pars_fragment:sR,transmission_fragment:aR,transmission_pars_fragment:rR,uv_pars_fragment:oR,uv_pars_vertex:lR,uv_vertex:cR,worldpos_vertex:uR,background_vert:hR,background_frag:fR,backgroundCube_vert:dR,backgroundCube_frag:pR,cube_vert:mR,cube_frag:gR,depth_vert:_R,depth_frag:vR,distance_vert:yR,distance_frag:xR,equirect_vert:SR,equirect_frag:MR,linedashed_vert:bR,linedashed_frag:ER,meshbasic_vert:TR,meshbasic_frag:AR,meshlambert_vert:wR,meshlambert_frag:CR,meshmatcap_vert:RR,meshmatcap_frag:DR,meshnormal_vert:UR,meshnormal_frag:LR,meshphong_vert:NR,meshphong_frag:IR,meshphysical_vert:OR,meshphysical_frag:PR,meshtoon_vert:BR,meshtoon_frag:FR,points_vert:zR,points_frag:HR,shadow_vert:VR,shadow_frag:GR,sprite_vert:kR,sprite_frag:WR},gt={common:{diffuse:{value:new ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xt},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xt}},envmap:{envMap:{value:null},envMapRotation:{value:new Xt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xt},normalScale:{value:new re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0},uvTransform:{value:new Xt}},sprite:{diffuse:{value:new ne(16777215)},opacity:{value:1},center:{value:new re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xt},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0}}},_s={basic:{uniforms:Bn([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.fog]),vertexShader:$t.meshbasic_vert,fragmentShader:$t.meshbasic_frag},lambert:{uniforms:Bn([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,gt.lights,{emissive:{value:new ne(0)},envMapIntensity:{value:1}}]),vertexShader:$t.meshlambert_vert,fragmentShader:$t.meshlambert_frag},phong:{uniforms:Bn([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,gt.lights,{emissive:{value:new ne(0)},specular:{value:new ne(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$t.meshphong_vert,fragmentShader:$t.meshphong_frag},standard:{uniforms:Bn([gt.common,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.roughnessmap,gt.metalnessmap,gt.fog,gt.lights,{emissive:{value:new ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$t.meshphysical_vert,fragmentShader:$t.meshphysical_frag},toon:{uniforms:Bn([gt.common,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.gradientmap,gt.fog,gt.lights,{emissive:{value:new ne(0)}}]),vertexShader:$t.meshtoon_vert,fragmentShader:$t.meshtoon_frag},matcap:{uniforms:Bn([gt.common,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,{matcap:{value:null}}]),vertexShader:$t.meshmatcap_vert,fragmentShader:$t.meshmatcap_frag},points:{uniforms:Bn([gt.points,gt.fog]),vertexShader:$t.points_vert,fragmentShader:$t.points_frag},dashed:{uniforms:Bn([gt.common,gt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$t.linedashed_vert,fragmentShader:$t.linedashed_frag},depth:{uniforms:Bn([gt.common,gt.displacementmap]),vertexShader:$t.depth_vert,fragmentShader:$t.depth_frag},normal:{uniforms:Bn([gt.common,gt.bumpmap,gt.normalmap,gt.displacementmap,{opacity:{value:1}}]),vertexShader:$t.meshnormal_vert,fragmentShader:$t.meshnormal_frag},sprite:{uniforms:Bn([gt.sprite,gt.fog]),vertexShader:$t.sprite_vert,fragmentShader:$t.sprite_frag},background:{uniforms:{uvTransform:{value:new Xt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$t.background_vert,fragmentShader:$t.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xt}},vertexShader:$t.backgroundCube_vert,fragmentShader:$t.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$t.cube_vert,fragmentShader:$t.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$t.equirect_vert,fragmentShader:$t.equirect_frag},distance:{uniforms:Bn([gt.common,gt.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$t.distance_vert,fragmentShader:$t.distance_frag},shadow:{uniforms:Bn([gt.lights,gt.fog,{color:{value:new ne(0)},opacity:{value:1}}]),vertexShader:$t.shadow_vert,fragmentShader:$t.shadow_frag}};_s.physical={uniforms:Bn([_s.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xt},clearcoatNormalScale:{value:new re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xt},sheen:{value:0},sheenColor:{value:new ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xt},transmissionSamplerSize:{value:new re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xt},attenuationDistance:{value:0},attenuationColor:{value:new ne(0)},specularColor:{value:new ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xt},anisotropyVector:{value:new re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xt}}]),vertexShader:$t.meshphysical_vert,fragmentShader:$t.meshphysical_frag};var Cd={r:0,b:0,g:0},XR=new Xe,Wb=new Xt;Wb.set(-1,0,0,0,1,0,0,0,1);function qR(e,t,n,i,s,a){let r=new ne(0),o=s===!0?0:1,l,c,f=null,p=0,u=null;function d(g){let M=g.isScene===!0?g.background:null;if(M&&M.isTexture){let y=g.backgroundBlurriness>0;M=t.get(M,y)}return M}function v(g){let M=!1,y=d(g);y===null?m(r,o):y&&y.isColor&&(m(y,1),M=!0);let b=e.xr.getEnvironmentBlendMode();b==="additive"?n.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function E(g,M){let y=d(M);y&&(y.isCubeTexture||y.mapping===Jc)?(c===void 0&&(c=new Pn(new il(1,1,1),new yi({name:"BackgroundCubeMaterial",uniforms:Sr(_s.backgroundCube.uniforms),vertexShader:_s.backgroundCube.vertexShader,fragmentShader:_s.backgroundCube.fragmentShader,side:wn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,T,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(XR.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Wb),c.material.toneMapped=ce.getTransfer(y.colorSpace)!==be,(f!==y||p!==y.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),c.layers.enableAll(),g.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Pn(new vr(2,2),new yi({name:"BackgroundMaterial",uniforms:Sr(_s.background.uniforms),vertexShader:_s.background.vertexShader,fragmentShader:_s.background.fragmentShader,side:ps,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=ce.getTransfer(y.colorSpace)!==be,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||p!==y.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),l.layers.enableAll(),g.unshift(l,l.geometry,l.material,0,0,null))}function m(g,M){g.getRGB(Cd,C0(e)),n.buffers.color.setClear(Cd.r,Cd.g,Cd.b,M,a)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(g,M=1){r.set(g),o=M,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(g){o=g,m(r,o)},render:v,addToRenderList:E,dispose:h}}function YR(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(R,P,F,U,N){let X=!1,Y=p(R,U,F,P);a!==Y&&(a=Y,c(a.object)),X=d(R,U,F,N),X&&v(R,U,F,N),N!==null&&t.update(N,e.ELEMENT_ARRAY_BUFFER),(X||r)&&(r=!1,y(R,P,F,U),N!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(N).buffer))}function l(){return e.createVertexArray()}function c(R){return e.bindVertexArray(R)}function f(R){return e.deleteVertexArray(R)}function p(R,P,F,U){let N=U.wireframe===!0,X=i[P.id];X===void 0&&(X={},i[P.id]=X);let Y=R.isInstancedMesh===!0?R.id:0,j=X[Y];j===void 0&&(j={},X[Y]=j);let H=j[F.id];H===void 0&&(H={},j[F.id]=H);let J=H[N];return J===void 0&&(J=u(l()),H[N]=J),J}function u(R){let P=[],F=[],U=[];for(let N=0;N<n;N++)P[N]=0,F[N]=0,U[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:F,attributeDivisors:U,object:R,attributes:{},index:null}}function d(R,P,F,U){let N=a.attributes,X=P.attributes,Y=0,j=F.getAttributes();for(let H in j)if(j[H].location>=0){let tt=N[H],Mt=X[H];if(Mt===void 0&&(H==="instanceMatrix"&&R.instanceMatrix&&(Mt=R.instanceMatrix),H==="instanceColor"&&R.instanceColor&&(Mt=R.instanceColor)),tt===void 0||tt.attribute!==Mt||Mt&&tt.data!==Mt.data)return!0;Y++}return a.attributesNum!==Y||a.index!==U}function v(R,P,F,U){let N={},X=P.attributes,Y=0,j=F.getAttributes();for(let H in j)if(j[H].location>=0){let tt=X[H];tt===void 0&&(H==="instanceMatrix"&&R.instanceMatrix&&(tt=R.instanceMatrix),H==="instanceColor"&&R.instanceColor&&(tt=R.instanceColor));let Mt={};Mt.attribute=tt,tt&&tt.data&&(Mt.data=tt.data),N[H]=Mt,Y++}a.attributes=N,a.attributesNum=Y,a.index=U}function E(){let R=a.newAttributes;for(let P=0,F=R.length;P<F;P++)R[P]=0}function m(R){h(R,0)}function h(R,P){let F=a.newAttributes,U=a.enabledAttributes,N=a.attributeDivisors;F[R]=1,U[R]===0&&(e.enableVertexAttribArray(R),U[R]=1),N[R]!==P&&(e.vertexAttribDivisor(R,P),N[R]=P)}function g(){let R=a.newAttributes,P=a.enabledAttributes;for(let F=0,U=P.length;F<U;F++)P[F]!==R[F]&&(e.disableVertexAttribArray(F),P[F]=0)}function M(R,P,F,U,N,X,Y){Y===!0?e.vertexAttribIPointer(R,P,F,N,X):e.vertexAttribPointer(R,P,F,U,N,X)}function y(R,P,F,U){E();let N=U.attributes,X=F.getAttributes(),Y=P.defaultAttributeValues;for(let j in X){let H=X[j];if(H.location>=0){let J=N[j];if(J===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(J=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(J=R.instanceColor)),J!==void 0){let tt=J.normalized,Mt=J.itemSize,vt=t.get(J);if(vt===void 0)continue;let Ot=vt.buffer,Nt=vt.type,Gt=vt.bytesPerElement,Z=Nt===e.INT||Nt===e.UNSIGNED_INT||J.gpuType===Gf;if(J.isInterleavedBufferAttribute){let et=J.data,dt=et.stride,Lt=J.offset;if(et.isInstancedInterleavedBuffer){for(let at=0;at<H.locationSize;at++)h(H.location+at,et.meshPerAttribute);R.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let at=0;at<H.locationSize;at++)m(H.location+at);e.bindBuffer(e.ARRAY_BUFFER,Ot);for(let at=0;at<H.locationSize;at++)M(H.location+at,Mt/H.locationSize,Nt,tt,dt*Gt,(Lt+Mt/H.locationSize*at)*Gt,Z)}else{if(J.isInstancedBufferAttribute){for(let et=0;et<H.locationSize;et++)h(H.location+et,J.meshPerAttribute);R.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let et=0;et<H.locationSize;et++)m(H.location+et);e.bindBuffer(e.ARRAY_BUFFER,Ot);for(let et=0;et<H.locationSize;et++)M(H.location+et,Mt/H.locationSize,Nt,tt,Mt*Gt,Mt/H.locationSize*et*Gt,Z)}}else if(Y!==void 0){let tt=Y[j];if(tt!==void 0)switch(tt.length){case 2:e.vertexAttrib2fv(H.location,tt);break;case 3:e.vertexAttrib3fv(H.location,tt);break;case 4:e.vertexAttrib4fv(H.location,tt);break;default:e.vertexAttrib1fv(H.location,tt)}}}}g()}function b(){A();for(let R in i){let P=i[R];for(let F in P){let U=P[F];for(let N in U){let X=U[N];for(let Y in X)f(X[Y].object),delete X[Y];delete U[N]}}delete i[R]}}function T(R){if(i[R.id]===void 0)return;let P=i[R.id];for(let F in P){let U=P[F];for(let N in U){let X=U[N];for(let Y in X)f(X[Y].object),delete X[Y];delete U[N]}}delete i[R.id]}function w(R){for(let P in i){let F=i[P];for(let U in F){let N=F[U];if(N[R.id]===void 0)continue;let X=N[R.id];for(let Y in X)f(X[Y].object),delete X[Y];delete N[R.id]}}}function x(R){for(let P in i){let F=i[P],U=R.isInstancedMesh===!0?R.id:0,N=F[U];if(N!==void 0){for(let X in N){let Y=N[X];for(let j in Y)f(Y[j].object),delete Y[j];delete N[X]}delete F[U],Object.keys(F).length===0&&delete i[P]}}}function A(){D(),r=!0,a!==s&&(a=s,c(a.object))}function D(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:D,dispose:b,releaseStatesOfGeometry:T,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:E,enableAttribute:m,disableUnusedAttributes:g}}function ZR(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,f){f!==0&&(e.drawArraysInstanced(i,l,c,f),n.update(c,i,f))}function o(l,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,f);let u=0;for(let d=0;d<f;d++)u+=c[d];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function JR(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(w){return!(w!==zi&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let x=w===Qi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==ei&&w!==Ki&&!x&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",f=l(c);f!==c&&(It("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let p=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&It("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),v=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),h=e.getParameter(e.MAX_VERTEX_ATTRIBS),g=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),M=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),b=e.getParameter(e.MAX_SAMPLES),T=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:v,maxTextureSize:E,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:g,maxVaryings:M,maxFragmentUniforms:y,maxSamples:b,samples:T}}function KR(e){let t=this,n=null,i=0,s=!1,a=!1,r=new vi,o=new Xt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||i!==0||s;return s=u,i=p.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){n=f(p,u,0)},this.setState=function(p,u,d){let v=p.clippingPlanes,E=p.clipIntersection,m=p.clipShadows,h=e.get(p);if(!s||v===null||v.length===0||a&&!m)a?f(null):c();else{let g=a?0:i,M=g*4,y=h.clippingState||null;l.value=y,y=f(v,u,M,d);for(let b=0;b!==M;++b)y[b]=n[b];h.clippingState=y,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=g}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function f(p,u,d,v){let E=p!==null?p.length:0,m=null;if(E!==0){if(m=l.value,v!==!0||m===null){let h=d+E*4,g=u.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<h)&&(m=new Float32Array(h));for(let M=0,y=d;M!==E;++M,y+=4)r.copy(p[M]).applyMatrix4(g,o),r.normal.toArray(m,y),m[y+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=E,t.numIntersection=0,m}}var pl=4,QR=6,jR=20,$R=256,iu=new ol,Mb=new ne,L0=null,N0=0,I0=0,O0=!1,t3=new W,Mr=new W,Dd=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=t3}=a;L0=this._renderer.getRenderTarget(),N0=this._renderer.getActiveCubeFace(),I0=this._renderer.getActiveMipmapLevel(),O0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Tb(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Eb(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(L0,N0,I0),this._renderer.xr.enabled=O0,t.scissorTest=!1,dl(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===za||t.mapping===xr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),L0=this._renderer.getRenderTarget(),N0=this._renderer.getActiveCubeFace(),I0=this._renderer.getActiveMipmapLevel(),O0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:un,minFilter:un,generateMipmaps:!1,type:Qi,format:zi,colorSpace:Dc,depthBuffer:!1},s=bb(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=bb(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=e3(a)),this._blurMaterial=i3(a,t,n),this._ggxMaterial=n3(a,t,n)}return s}_compileMaterial(t){let n=new Pn(new Bi,t);this._renderer.compile(n,iu)}_sceneToCubeUV(t,n,i,s,a){let l=new Nn(90,1,n,i),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(Mb),p.toneMapping=Zi,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Pn(new il,new Bc({name:"PMREM.Background",side:wn,depthWrite:!1,depthTest:!1})));let E=this._backgroundBox,m=E.material,h=!1,g=t.background;g?g.isColor&&(m.color.copy(g),t.background=null,h=!0):(m.color.copy(Mb),h=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[M],a.y,a.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[M],a.z)):(l.up.set(0,c[M],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[M]));let b=this._cubeSize;dl(s,y*b,M>2?b:0,b,b),p.setRenderTarget(s),h&&p.render(E,l),p.render(t,l)}p.toneMapping=d,p.autoClear=u,t.background=g}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===za||t.mapping===xr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Tb()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Eb());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;dl(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,iu)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),f=n/(this._lodMeshes.length-1),p=Math.sqrt(c*c-f*f),u=c*1.25,d=p*u,{_lodMax:v}=this,E=this._sizeLods[i],m=3*E*(i>v-pl?i-v+pl:0),h=4*(this._cubeSize-E);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=v-n,dl(a,m,h,3*E,2*E),s.setRenderTarget(a),s.render(o,iu),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=v-i,dl(t,m,h,3*E,2*E),s.setRenderTarget(t),s.render(o,iu)}_blur(t,n,i,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,a,n,i,r),this._blurPass(a,t,i,i,r)}_blurPass(t,n,i,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-i;let f=this._sizeLods[s],p=3*f*(s>this._lodMax-pl?s-this._lodMax+pl:0),u=4*(this._cubeSize-f);dl(n,p,u,3*f,2*f),r.setRenderTarget(n),r.render(l,iu)}};function e3(e){let t=[],n=[],i=e,s=e-pl+1+QR;for(let a=0;a<s;a++){let r=Math.pow(2,i);t.push(r);let o=1/(r-2),l=-o,c=1+o,f=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,u=6,d=3,v=new Float32Array(d*u*p),E=new Float32Array(d*u*p);for(let h=0;h<p;h++){let g=h%3*2/3-1,M=h>2?0:-1,y=[g,M,0,g+2/3,M,0,g+2/3,M+1,0,g,M,0,g+2/3,M+1,0,g,M+1,0];v.set(y,d*u*h);for(let b=0;b<u;b++){let T=f[b*2]*2-1,w=f[b*2+1]*2-1;h===0?Mr.set(1,w,T):h===1?Mr.set(-T,1,-w):h===2?Mr.set(-T,w,1):h===3?Mr.set(-1,w,-T):h===4?Mr.set(-T,-1,w):Mr.set(T,w,-1),Mr.toArray(E,(h*u+b)*d)}}let m=new Bi;m.setAttribute("position",new In(v,d)),m.setAttribute("outputDirection",new In(E,d)),n.push(new Pn(m,null)),i>pl&&i--}return{lodMeshes:n,sizeLods:t}}function bb(e,t,n){let i=new ti(e,t,n);return i.texture.mapping=Jc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function dl(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function n3(e,t,n){return new yi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:$R,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Nd(),fragmentShader:`

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
		`,blending:ms,depthTest:!1,depthWrite:!1})}function i3(e,t,n){return new yi({name:"SphericalGaussianBlur",defines:{SAMPLES:jR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Nd(),fragmentShader:`

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
		`,blending:ms,depthTest:!1,depthWrite:!1})}function Eb(){return new yi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Nd(),fragmentShader:`

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
		`,blending:ms,depthTest:!1,depthWrite:!1})}function Tb(){return new yi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Nd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ms,depthTest:!1,depthWrite:!1})}function Nd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ud=class extends ti{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Fc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new il(5,5,5),a=new yi({name:"CubemapFromEquirect",uniforms:Sr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:wn,blending:ms});a.uniforms.tEquirect.value=n;let r=new Pn(s,a),o=n.minFilter;return n.minFilter===Ha&&(n.minFilter=un),new Pf(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function s3(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===zf||d===Hf)if(t.has(u)){let v=t.get(u).texture;return o(v,u.mapping)}else{let v=u.image;if(v&&v.height>0){let E=new Ud(v.height);return E.fromEquirectangularTexture(e,u),t.set(u,E),u.addEventListener("dispose",c),o(E.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,v=d===zf||d===Hf,E=d===za||d===xr;if(v||E){let m=n.get(u),h=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new Dd(e)),m=v?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),m.texture;if(m!==void 0)return m.texture;{let g=u.image;return v&&g&&g.height>0||E&&g&&l(g)?(i===null&&(i=new Dd(e)),m=v?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),u.addEventListener("dispose",f),m.texture):null}}}return u}function o(u,d){return d===zf?u.mapping=za:d===Hf&&(u.mapping=xr),u}function l(u){let d=0,v=6;for(let E=0;E<v;E++)u[E]!==void 0&&d++;return d===v}function c(u){let d=u.target;d.removeEventListener("dispose",c);let v=t.get(d);v!==void 0&&(t.delete(d),v.dispose())}function f(u){let d=u.target;d.removeEventListener("dispose",f);let v=n.get(d);v!==void 0&&(n.delete(d),v.dispose())}function p(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:p}}function a3(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&_r("WebGLRenderer: "+i+" extension not supported."),s}}}function r3(e,t,n,i){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&t.remove(u.index);for(let v in u.attributes)t.remove(u.attributes[v]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)t.update(u[d],e.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,v=p.attributes.position,E=0;if(v===void 0)return;if(d!==null){let g=d.array;E=d.version;for(let M=0,y=g.length;M<y;M+=3){let b=g[M+0],T=g[M+1],w=g[M+2];u.push(b,T,T,w,w,b)}}else{let g=v.array;E=v.version;for(let M=0,y=g.length/3-1;M<y;M+=3){let b=M+0,T=M+1,w=M+2;u.push(b,T,T,w,w,b)}}let m=new(v.count>=65535?Oc:Ic)(u,1);m.version=E;let h=a.get(p);h&&t.remove(h),a.set(p,m)}function f(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:f}}function o3(e,t,n){let i;function s(p){i=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){e.drawElements(i,u,a,p*r),n.update(u,i,1)}function c(p,u,d){d!==0&&(e.drawElementsInstanced(i,u,a,p*r,d),n.update(u,i,d))}function f(p,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,p,0,d);let E=0;for(let m=0;m<d;m++)E+=u[m];n.update(E,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function l3(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:Bt("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function c3(e,t,n){let i=new WeakMap,s=new qe;function a(r,o,l){let c=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0,u=i.get(o);if(u===void 0||u.count!==p){let A=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,E=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],h=o.morphAttributes.normal||[],g=o.morphAttributes.color||[],M=0;d===!0&&(M=1),v===!0&&(M=2),E===!0&&(M=3);let y=o.attributes.position.count*M,b=1;y>t.maxTextureSize&&(b=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let T=new Float32Array(y*b*4*p),w=new Lc(T,y,b,p);w.type=Ki,w.needsUpdate=!0;let x=M*4;for(let D=0;D<p;D++){let R=m[D],P=h[D],F=g[D],U=y*b*4*D;for(let N=0;N<R.count;N++){let X=N*x;d===!0&&(s.fromBufferAttribute(R,N),T[U+X+0]=s.x,T[U+X+1]=s.y,T[U+X+2]=s.z,T[U+X+3]=0),v===!0&&(s.fromBufferAttribute(P,N),T[U+X+4]=s.x,T[U+X+5]=s.y,T[U+X+6]=s.z,T[U+X+7]=0),E===!0&&(s.fromBufferAttribute(F,N),T[U+X+8]=s.x,T[U+X+9]=s.y,T[U+X+10]=s.z,T[U+X+11]=F.itemSize===4?s.w:1)}}u={count:p,texture:w,size:new re(y,b)},i.set(o,u),o.addEventListener("dispose",A)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let d=0;for(let E=0;E<c.length;E++)d+=c[E];let v=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",v),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function u3(e,t,n,i,s){let a=new WeakMap;function r(c){let f=s.render.frame,p=c.geometry,u=t.get(c,p);if(a.get(u)!==f&&(t.update(u),a.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==f&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,f))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return u}function o(){a=new WeakMap}function l(c){let f=c.target;f.removeEventListener("dispose",l),i.releaseStatesOfObject(f),n.remove(f.instanceMatrix),f.instanceColor!==null&&n.remove(f.instanceColor)}return{update:r,dispose:o}}var h3={[c0]:"LINEAR_TONE_MAPPING",[u0]:"REINHARD_TONE_MAPPING",[h0]:"CINEON_TONE_MAPPING",[f0]:"ACES_FILMIC_TONE_MAPPING",[p0]:"AGX_TONE_MAPPING",[m0]:"NEUTRAL_TONE_MAPPING",[d0]:"CUSTOM_TONE_MAPPING"};function f3(e,t,n,i,s,a){let r=new ti(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Bi;c.setAttribute("position",new Pi([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Pi([0,2,0,0,2,0],2));let f=new bf({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),p=new Pn(c,f),u=new ol(-1,1,1,-1,0,1),d=null,v=null,E=!1,m,h=null,g=[],M=!1;this.setSize=function(y,b){r.setSize(y,b),o!==null&&o.setSize(y,b),l!==null&&l.setSize(y,b);for(let T=0;T<g.length;T++){let w=g[T];w.setSize&&w.setSize(y,b)}},this.setEffects=function(y){g=y,M=g.length>0&&g[0].isRenderPass===!0;let b=r.width,T=r.height;g.length>0&&o===null&&(o=new ti(b,T,{type:Qi,depthBuffer:!1,stencilBuffer:!1}),l=new ti(b,T,{type:Qi,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<g.length;w++){let x=g[w];x.setSize&&x.setSize(b,T)}},this.begin=function(y,b){if(E||y.toneMapping===Zi&&g.length===0)return!1;if(h=b,b!==null){let T=b.width,w=b.height;(r.width!==T||r.height!==w)&&this.setSize(T,w)}return M===!1&&y.setRenderTarget(r),m=y.toneMapping,y.toneMapping=Zi,!0},this.hasRenderPass=function(){return M},this.end=function(y,b){y.toneMapping=m,E=!0;let T=r,w=o;for(let x=0;x<g.length;x++){let A=g[x];A.enabled!==!1&&(A.render(y,w,T,b),A.needsSwap!==!1&&(T=w,w=w===o?l:o))}if(d!==y.outputColorSpace||v!==y.toneMapping){d=y.outputColorSpace,v=y.toneMapping,f.defines={},ce.getTransfer(d)===be&&(f.defines.SRGB_TRANSFER="");let x=h3[v];x&&(f.defines[x]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=T.texture,y.setRenderTarget(h),y.render(p,u),h=null,E=!1},this.isCompositing=function(){return E},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),f.dispose()}}var Xb=new Wn,F0=new Oa(1,1),qb=new Lc,Yb=new Sf,Zb=new Fc,Ab=[],wb=[],Cb=new Float32Array(16),Rb=new Float32Array(9),Db=new Float32Array(4);function gl(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=Ab[s];if(a===void 0&&(a=new Float32Array(s),Ab[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function dn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function pn(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function Id(e,t){let n=wb[t];n===void 0&&(n=new Int32Array(t),wb[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function d3(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function p3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(dn(n,t))return;e.uniform2fv(this.addr,t),pn(n,t)}}function m3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(dn(n,t))return;e.uniform3fv(this.addr,t),pn(n,t)}}function g3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(dn(n,t))return;e.uniform4fv(this.addr,t),pn(n,t)}}function _3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(dn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),pn(n,t)}else{if(dn(n,i))return;Db.set(i),e.uniformMatrix2fv(this.addr,!1,Db),pn(n,i)}}function v3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(dn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),pn(n,t)}else{if(dn(n,i))return;Rb.set(i),e.uniformMatrix3fv(this.addr,!1,Rb),pn(n,i)}}function y3(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(dn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),pn(n,t)}else{if(dn(n,i))return;Cb.set(i),e.uniformMatrix4fv(this.addr,!1,Cb),pn(n,i)}}function x3(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function S3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(dn(n,t))return;e.uniform2iv(this.addr,t),pn(n,t)}}function M3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(dn(n,t))return;e.uniform3iv(this.addr,t),pn(n,t)}}function b3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(dn(n,t))return;e.uniform4iv(this.addr,t),pn(n,t)}}function E3(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function T3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(dn(n,t))return;e.uniform2uiv(this.addr,t),pn(n,t)}}function A3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(dn(n,t))return;e.uniform3uiv(this.addr,t),pn(n,t)}}function w3(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(dn(n,t))return;e.uniform4uiv(this.addr,t),pn(n,t)}}function C3(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(F0.compareFunction=n.isReversedDepthBuffer()?Ad:Td,a=F0):a=Xb,n.setTexture2D(t||a,s)}function R3(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||Yb,s)}function D3(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||Zb,s)}function U3(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||qb,s)}function L3(e){switch(e){case 5126:return d3;case 35664:return p3;case 35665:return m3;case 35666:return g3;case 35674:return _3;case 35675:return v3;case 35676:return y3;case 5124:case 35670:return x3;case 35667:case 35671:return S3;case 35668:case 35672:return M3;case 35669:case 35673:return b3;case 5125:return E3;case 36294:return T3;case 36295:return A3;case 36296:return w3;case 35678:case 36198:case 36298:case 36306:case 35682:return C3;case 35679:case 36299:case 36307:return R3;case 35680:case 36300:case 36308:case 36293:return D3;case 36289:case 36303:case 36311:case 36292:return U3}}function N3(e,t){e.uniform1fv(this.addr,t)}function I3(e,t){let n=gl(t,this.size,2);e.uniform2fv(this.addr,n)}function O3(e,t){let n=gl(t,this.size,3);e.uniform3fv(this.addr,n)}function P3(e,t){let n=gl(t,this.size,4);e.uniform4fv(this.addr,n)}function B3(e,t){let n=gl(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function F3(e,t){let n=gl(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function z3(e,t){let n=gl(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function H3(e,t){e.uniform1iv(this.addr,t)}function V3(e,t){e.uniform2iv(this.addr,t)}function G3(e,t){e.uniform3iv(this.addr,t)}function k3(e,t){e.uniform4iv(this.addr,t)}function W3(e,t){e.uniform1uiv(this.addr,t)}function X3(e,t){e.uniform2uiv(this.addr,t)}function q3(e,t){e.uniform3uiv(this.addr,t)}function Y3(e,t){e.uniform4uiv(this.addr,t)}function Z3(e,t,n){let i=this.cache,s=t.length,a=Id(n,s);dn(i,a)||(e.uniform1iv(this.addr,a),pn(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=F0:r=Xb;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function J3(e,t,n){let i=this.cache,s=t.length,a=Id(n,s);dn(i,a)||(e.uniform1iv(this.addr,a),pn(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||Yb,a[r])}function K3(e,t,n){let i=this.cache,s=t.length,a=Id(n,s);dn(i,a)||(e.uniform1iv(this.addr,a),pn(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||Zb,a[r])}function Q3(e,t,n){let i=this.cache,s=t.length,a=Id(n,s);dn(i,a)||(e.uniform1iv(this.addr,a),pn(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||qb,a[r])}function j3(e){switch(e){case 5126:return N3;case 35664:return I3;case 35665:return O3;case 35666:return P3;case 35674:return B3;case 35675:return F3;case 35676:return z3;case 5124:case 35670:return H3;case 35667:case 35671:return V3;case 35668:case 35672:return G3;case 35669:case 35673:return k3;case 5125:return W3;case 36294:return X3;case 36295:return q3;case 36296:return Y3;case 35678:case 36198:case 36298:case 36306:case 35682:return Z3;case 35679:case 36299:case 36307:return J3;case 35680:case 36300:case 36308:case 36293:return K3;case 36289:case 36303:case 36311:case 36292:return Q3}}var z0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=L3(n.type)}},H0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=j3(n.type)}},V0=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},P0=/(\w+)(\])?(\[|\.)?/g;function Ub(e,t){e.seq.push(t),e.map[t.id]=t}function $3(e,t,n){let i=e.name,s=i.length;for(P0.lastIndex=0;;){let a=P0.exec(i),r=P0.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){Ub(n,c===void 0?new z0(o,e,t):new H0(o,e,t));break}else{let p=n.map[o];p===void 0&&(p=new V0(o),Ub(n,p)),n=p}}}var ml=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);$3(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function Lb(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var t2=37297,e2=0;function n2(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var Nb=new Xt;function i2(e){ce._getMatrix(Nb,ce.workingColorSpace,e);let t=`mat3( ${Nb.elements.map(n=>n.toFixed(4))} )`;switch(ce.getTransfer(e)){case Uc:return[t,"LinearTransferOETF"];case be:return[t,"sRGBTransferOETF"];default:return It("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Ib(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+n2(e.getShaderSource(t),o)}else return a}function s2(e,t){let n=i2(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var a2={[c0]:"Linear",[u0]:"Reinhard",[h0]:"Cineon",[f0]:"ACESFilmic",[p0]:"AgX",[m0]:"Neutral",[d0]:"Custom"};function r2(e,t){let n=a2[t];return n===void 0?(It("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Rd=new W;function o2(){ce.getLuminanceCoefficients(Rd);let e=Rd.x.toFixed(4),t=Rd.y.toFixed(4),n=Rd.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function l2(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(au).join(`
`)}function c2(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function u2(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function au(e){return e!==""}function Ob(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Pb(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var h2=/^[ \t]*#include +<([\w\d./]+)>/gm;function G0(e){return e.replace(h2,d2)}var f2=new Map;function d2(e,t){let n=$t[t];if(n===void 0){let i=f2.get(t);if(i!==void 0)n=$t[i],It('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return G0(n)}var p2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bb(e){return e.replace(p2,m2)}function m2(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function Fb(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var g2={[Zc]:"SHADOWMAP_TYPE_PCF",[ll]:"SHADOWMAP_TYPE_VSM"};function _2(e){return g2[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var v2={[za]:"ENVMAP_TYPE_CUBE",[xr]:"ENVMAP_TYPE_CUBE",[Jc]:"ENVMAP_TYPE_CUBE_UV"};function y2(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":v2[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var x2={[xr]:"ENVMAP_MODE_REFRACTION"};function S2(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":x2[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var M2={[l0]:"ENVMAP_BLENDING_MULTIPLY",[eb]:"ENVMAP_BLENDING_MIX",[nb]:"ENVMAP_BLENDING_ADD"};function b2(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":M2[e.combine]||"ENVMAP_BLENDING_NONE"}function E2(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function T2(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=_2(n),c=y2(n),f=S2(n),p=b2(n),u=E2(n),d=l2(n),v=c2(a),E=s.createProgram(),m,h,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(au).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(au).join(`
`),h.length>0&&(h+=`
`)):(m=[Fb(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(au).join(`
`),h=[Fb(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",n.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Zi?"#define TONE_MAPPING":"",n.toneMapping!==Zi?$t.tonemapping_pars_fragment:"",n.toneMapping!==Zi?r2("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",$t.colorspace_pars_fragment,s2("linearToOutputTexel",n.outputColorSpace),o2(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(au).join(`
`)),r=G0(r),r=Ob(r,n),r=Pb(r,n),o=G0(o),o=Ob(o,n),o=Pb(o,n),r=Bb(r),o=Bb(o),n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",n.glslVersion===T0?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===T0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);let M=g+m+r,y=g+h+o,b=Lb(s,s.VERTEX_SHADER,M),T=Lb(s,s.FRAGMENT_SHADER,y);s.attachShader(E,b),s.attachShader(E,T),n.index0AttributeName!==void 0?s.bindAttribLocation(E,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(E,0,"position"),s.linkProgram(E);function w(R){if(e.debug.checkShaderErrors){let P=s.getProgramInfoLog(E)||"",F=s.getShaderInfoLog(b)||"",U=s.getShaderInfoLog(T)||"",N=P.trim(),X=F.trim(),Y=U.trim(),j=!0,H=!0;if(s.getProgramParameter(E,s.LINK_STATUS)===!1)if(j=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,E,b,T);else{let J=Ib(s,b,"vertex"),tt=Ib(s,T,"fragment");Bt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(E,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+N+`
`+J+`
`+tt)}else N!==""?It("WebGLProgram: Program Info Log:",N):(X===""||Y==="")&&(H=!1);H&&(R.diagnostics={runnable:j,programLog:N,vertexShader:{log:X,prefix:m},fragmentShader:{log:Y,prefix:h}})}s.deleteShader(b),s.deleteShader(T),x=new ml(s,E),A=u2(s,E)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let A;this.getAttributes=function(){return A===void 0&&w(this),A};let D=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(E,t2)),D},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(E),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=e2++,this.cacheKey=t,this.usedTimes=1,this.program=E,this.vertexShader=b,this.fragmentShader=T,this}var A2=0,k0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new W0(t),n.set(t,i)),i}},W0=class{constructor(t){this.id=A2++,this.code=t,this.usedTimes=0}};function w2(e){return e===Ga||e===eu||e===nu}function C2(e,t,n,i,s,a){let r=new jo,o=new k0,l=new Set,c=[],f=new Map,p=i.logarithmicDepthBuffer,u=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(x){return l.add(x),x===0?"uv":`uv${x}`}function E(x,A,D,R,P,F){let U=R.fog,N=P.geometry,X=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,Y=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,j=t.get(x.envMap||X,Y),H=j&&j.mapping===Jc?j.image.height:null,J=d[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&It("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let tt=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,Mt=tt!==void 0?tt.length:0,vt=0;N.morphAttributes.position!==void 0&&(vt=1),N.morphAttributes.normal!==void 0&&(vt=2),N.morphAttributes.color!==void 0&&(vt=3);let Ot,Nt,Gt,Z;if(J){let Se=_s[J];Ot=Se.vertexShader,Nt=Se.fragmentShader}else{Ot=x.vertexShader,Nt=x.fragmentShader;let Se=o.getVertexShaderStage(x),oe=o.getFragmentShaderStage(x);o.update(x,Se,oe),Gt=Se.id,Z=oe.id}let et=e.getRenderTarget(),dt=e.state.buffers.depth.getReversed(),Lt=P.isInstancedMesh===!0,at=P.isBatchedMesh===!0,qt=!!x.map,Ve=!!x.matcap,Zt=!!j,ee=!!x.aoMap,Qt=!!x.lightMap,Ft=!!x.bumpMap&&x.wireframe===!1,de=!!x.normalMap,zt=!!x.displacementMap,Qe=!!x.emissiveMap,xe=!!x.metalnessMap,pe=!!x.roughnessMap,O=x.anisotropy>0,Ie=x.clearcoat>0,ie=x.dispersion>0,C=x.retroreflectivity>0,_=x.iridescence>0,B=x.sheen>0,G=x.transmission>0,q=O&&!!x.anisotropyMap,ot=Ie&&!!x.clearcoatMap,rt=Ie&&!!x.clearcoatNormalMap,K=Ie&&!!x.clearcoatRoughnessMap,Q=_&&!!x.iridescenceMap,ut=_&&!!x.iridescenceThicknessMap,Et=B&&!!x.sheenColorMap,ft=B&&!!x.sheenRoughnessMap,lt=!!x.specularMap,Dt=!!x.specularColorMap,Tt=!!x.specularIntensityMap,Pt=G&&!!x.transmissionMap,I=G&&!!x.thicknessMap,ht=!!x.gradientMap,$=!!x.alphaMap,ct=x.alphaTest>0,_t=!!x.alphaHash,st=!!x.extensions,bt=Zi;x.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(bt=e.toneMapping);let Ct={shaderID:J,shaderType:x.type,shaderName:x.name,vertexShader:Ot,fragmentShader:Nt,defines:x.defines,customVertexShaderID:Gt,customFragmentShaderID:Z,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:at,batchingColor:at&&P._colorsTexture!==null,instancing:Lt,instancingColor:Lt&&P.instanceColor!==null,instancingMorph:Lt&&P.morphTexture!==null,outputColorSpace:et===null?e.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:ce.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:qt,matcap:Ve,envMap:Zt,envMapMode:Zt&&j.mapping,envMapCubeUVHeight:H,aoMap:ee,lightMap:Qt,bumpMap:Ft,normalMap:de,displacementMap:zt,emissiveMap:Qe,normalMapObjectSpace:de&&x.normalMapType===ab,normalMapTangentSpace:de&&x.normalMapType===Ed,packedNormalMap:de&&x.normalMapType===Ed&&w2(x.normalMap.format),metalnessMap:xe,roughnessMap:pe,anisotropy:O,anisotropyMap:q,clearcoat:Ie,clearcoatMap:ot,clearcoatNormalMap:rt,clearcoatRoughnessMap:K,dispersion:ie,retroreflection:C,iridescence:_,iridescenceMap:Q,iridescenceThicknessMap:ut,sheen:B,sheenColorMap:Et,sheenRoughnessMap:ft,specularMap:lt,specularColorMap:Dt,specularIntensityMap:Tt,transmission:G,transmissionMap:Pt,thicknessMap:I,gradientMap:ht,opaque:x.transparent===!1&&x.blending===cl&&x.alphaToCoverage===!1,alphaMap:$,alphaTest:ct,alphaHash:_t,combine:x.combine,mapUv:qt&&v(x.map.channel),aoMapUv:ee&&v(x.aoMap.channel),lightMapUv:Qt&&v(x.lightMap.channel),bumpMapUv:Ft&&v(x.bumpMap.channel),normalMapUv:de&&v(x.normalMap.channel),displacementMapUv:zt&&v(x.displacementMap.channel),emissiveMapUv:Qe&&v(x.emissiveMap.channel),metalnessMapUv:xe&&v(x.metalnessMap.channel),roughnessMapUv:pe&&v(x.roughnessMap.channel),anisotropyMapUv:q&&v(x.anisotropyMap.channel),clearcoatMapUv:ot&&v(x.clearcoatMap.channel),clearcoatNormalMapUv:rt&&v(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&v(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&v(x.iridescenceMap.channel),iridescenceThicknessMapUv:ut&&v(x.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&v(x.sheenColorMap.channel),sheenRoughnessMapUv:ft&&v(x.sheenRoughnessMap.channel),specularMapUv:lt&&v(x.specularMap.channel),specularColorMapUv:Dt&&v(x.specularColorMap.channel),specularIntensityMapUv:Tt&&v(x.specularIntensityMap.channel),transmissionMapUv:Pt&&v(x.transmissionMap.channel),thicknessMapUv:I&&v(x.thicknessMap.channel),alphaMapUv:$&&v(x.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(de||O),vertexNormals:!!N.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!N.attributes.uv&&(qt||$),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||N.attributes.normal===void 0&&de===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:dt,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:Mt,morphTextureStride:vt,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:F.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:e.shadowMap.enabled&&D.length>0,shadowMapType:e.shadowMap.type,toneMapping:bt,decodeVideoTexture:qt&&x.map.isVideoTexture===!0&&ce.getTransfer(x.map.colorSpace)===be,decodeVideoTextureEmissive:Qe&&x.emissiveMap.isVideoTexture===!0&&ce.getTransfer(x.emissiveMap.colorSpace)===be,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Fi,flipSided:x.side===wn,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:st&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&x.extensions.multiDraw===!0||at)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ct.vertexUv1s=l.has(1),Ct.vertexUv2s=l.has(2),Ct.vertexUv3s=l.has(3),l.clear(),Ct}function m(x){let A=[];if(x.shaderID?A.push(x.shaderID):(A.push(x.customVertexShaderID),A.push(x.customFragmentShaderID)),x.defines!==void 0)for(let D in x.defines)A.push(D),A.push(x.defines[D]);return x.isRawShaderMaterial===!1&&(h(A,x),g(A,x),A.push(e.outputColorSpace)),A.push(x.customProgramCacheKey),A.join()}function h(x,A){x.push(A.precision),x.push(A.outputColorSpace),x.push(A.envMapMode),x.push(A.envMapCubeUVHeight),x.push(A.mapUv),x.push(A.alphaMapUv),x.push(A.lightMapUv),x.push(A.aoMapUv),x.push(A.bumpMapUv),x.push(A.normalMapUv),x.push(A.displacementMapUv),x.push(A.emissiveMapUv),x.push(A.metalnessMapUv),x.push(A.roughnessMapUv),x.push(A.anisotropyMapUv),x.push(A.clearcoatMapUv),x.push(A.clearcoatNormalMapUv),x.push(A.clearcoatRoughnessMapUv),x.push(A.iridescenceMapUv),x.push(A.iridescenceThicknessMapUv),x.push(A.sheenColorMapUv),x.push(A.sheenRoughnessMapUv),x.push(A.specularMapUv),x.push(A.specularColorMapUv),x.push(A.specularIntensityMapUv),x.push(A.transmissionMapUv),x.push(A.thicknessMapUv),x.push(A.combine),x.push(A.fogExp2),x.push(A.sizeAttenuation),x.push(A.morphTargetsCount),x.push(A.morphAttributeCount),x.push(A.numSunLights),x.push(A.numDirLights),x.push(A.numPointLights),x.push(A.numSpotLights),x.push(A.numSpotLightMaps),x.push(A.numHemiLights),x.push(A.numRectAreaLights),x.push(A.numSunLightShadows),x.push(A.numDirLightShadows),x.push(A.numPointLightShadows),x.push(A.numSpotLightShadows),x.push(A.numSpotLightShadowsWithMaps),x.push(A.numLightProbes),x.push(A.shadowMapType),x.push(A.toneMapping),x.push(A.numClippingPlanes),x.push(A.numClipIntersection),x.push(A.depthPacking)}function g(x,A){r.disableAll(),A.instancing&&r.enable(0),A.instancingColor&&r.enable(1),A.instancingMorph&&r.enable(2),A.matcap&&r.enable(3),A.envMap&&r.enable(4),A.normalMapObjectSpace&&r.enable(5),A.normalMapTangentSpace&&r.enable(6),A.clearcoat&&r.enable(7),A.iridescence&&r.enable(8),A.alphaTest&&r.enable(9),A.vertexColors&&r.enable(10),A.vertexAlphas&&r.enable(11),A.vertexUv1s&&r.enable(12),A.vertexUv2s&&r.enable(13),A.vertexUv3s&&r.enable(14),A.vertexTangents&&r.enable(15),A.anisotropy&&r.enable(16),A.alphaHash&&r.enable(17),A.batching&&r.enable(18),A.dispersion&&r.enable(19),A.retroreflection&&r.enable(24),A.batchingColor&&r.enable(20),A.gradientMap&&r.enable(21),A.packedNormalMap&&r.enable(22),A.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),A.fog&&r.enable(0),A.useFog&&r.enable(1),A.flatShading&&r.enable(2),A.logarithmicDepthBuffer&&r.enable(3),A.reversedDepthBuffer&&r.enable(4),A.skinning&&r.enable(5),A.morphTargets&&r.enable(6),A.morphNormals&&r.enable(7),A.morphColors&&r.enable(8),A.premultipliedAlpha&&r.enable(9),A.shadowMapEnabled&&r.enable(10),A.doubleSided&&r.enable(11),A.flipSided&&r.enable(12),A.useDepthPacking&&r.enable(13),A.dithering&&r.enable(14),A.transmission&&r.enable(15),A.sheen&&r.enable(16),A.opaque&&r.enable(17),A.pointsUvs&&r.enable(18),A.decodeVideoTexture&&r.enable(19),A.decodeVideoTextureEmissive&&r.enable(20),A.alphaToCoverage&&r.enable(21),A.numLightProbeGrids>0&&r.enable(22),A.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function M(x){let A=d[x.type],D;if(A){let R=_s[A];D=yb.clone(R.uniforms)}else D=x.uniforms;return D}function y(x,A){let D=f.get(A);return D!==void 0?++D.usedTimes:(D=new T2(e,A,x,s),c.push(D),f.set(A,D)),D}function b(x){if(--x.usedTimes===0){let A=c.indexOf(x);c[A]=c[c.length-1],c.pop(),f.delete(x.cacheKey),x.destroy()}}function T(x){o.remove(x)}function w(){o.dispose()}return{getParameters:E,getProgramCacheKey:m,getUniforms:M,acquireProgram:y,releaseProgram:b,releaseShaderCache:T,programs:c,dispose:w}}function R2(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function D2(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function zb(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Hb(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,v,E,m,h){let g=e[t];return g===void 0?(g={id:u.id,object:u,geometry:d,material:v,materialVariant:r(u),groupOrder:E,renderOrder:u.renderOrder,z:m,group:h},e[t]=g):(g.id=u.id,g.object=u,g.geometry=d,g.material=v,g.materialVariant=r(u),g.groupOrder=E,g.renderOrder=u.renderOrder,g.z=m,g.group=h),t++,g}function l(u,d,v,E,m,h,g){g.reversedDepth===!0&&(m=-m);let M=o(u,d,v,E,m,h);v.transmission>0?i.push(M):v.transparent===!0?s.push(M):n.push(M)}function c(u,d,v,E,m,h){let g=o(u,d,v,E,m,h);v.transmission>0?i.unshift(g):v.transparent===!0?s.unshift(g):n.unshift(g)}function f(u,d){n.length>1&&n.sort(u||D2),i.length>1&&i.sort(d||zb),s.length>1&&s.sort(d||zb)}function p(){for(let u=t,d=e.length;u<d;u++){let v=e[u];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:p,sort:f}}function U2(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new Hb,e.set(i,[r])):s>=a.length?(r=new Hb,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function L2(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={direction:new W,color:new ne};break;case"SpotLight":n={position:new W,direction:new W,color:new ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new W,color:new ne,distance:0,decay:0};break;case"HemisphereLight":n={direction:new W,skyColor:new ne,groundColor:new ne};break;case"RectAreaLight":n={color:new ne,position:new W,halfWidth:new W,halfHeight:new W};break}return e[t.id]=n,n}}}function N2(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var I2=0;function O2(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function P2(e){let t=new L2,n=N2(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new W);let s=new W,a=new Xe,r=new Xe;function o(c){let f=0,p=0,u=0;for(let P=0;P<9;P++)i.probe[P].set(0,0,0);let d=0,v=0,E=0,m=0,h=0,g=0,M=0,y=0,b=0,T=0,w=0,x=0,A=0,D=0;c.sort(O2);for(let P=0,F=c.length;P<F;P++){let U=c[P],N=U.color,X=U.intensity,Y=U.distance,j=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Ga?j=U.shadow.map.texture:j=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)f+=N.r*X,p+=N.g*X,u+=N.b*X;else if(U.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(U.sh.coefficients[H],X);D++}else if(U.isSunLight){let H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let J=U.shadow,tt=n.get(U);tt.shadowIntensity=J.intensity,tt.shadowBias=J.bias,tt.shadowNormalBias=J.normalBias,tt.shadowRadius=J.radius,tt.shadowMapSize.copy(J.mapSize).multiply(J.getFrameExtents()),i.sunShadow[v]=tt,i.sunShadowMap[v]=j;let Mt=J.getViewportCount();for(let vt=0;vt<Mt;vt++)i.sunShadowMatrix[E+vt]=J.getMatrix(vt),i.sunShadowCascade[E+vt]=J._cascadeData[vt];E+=Mt,v++}i.sun[d]=H,d++}else if(U.isDirectionalLight){let H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let J=U.shadow,tt=n.get(U);tt.shadowIntensity=J.intensity,tt.shadowBias=J.bias,tt.shadowNormalBias=J.normalBias,tt.shadowRadius=J.radius,tt.shadowMapSize=J.mapSize,i.directionalShadow[m]=tt,i.directionalShadowMap[m]=j,i.directionalShadowMatrix[m]=U.shadow.matrix,b++}i.directional[m]=H,m++}else if(U.isSpotLight){let H=t.get(U);H.position.setFromMatrixPosition(U.matrixWorld),H.color.copy(N).multiplyScalar(X),H.distance=Y,H.coneCos=Math.cos(U.angle),H.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),H.decay=U.decay,i.spot[g]=H;let J=U.shadow;if(U.map&&(i.spotLightMap[x]=U.map,x++,J.updateMatrices(U),U.castShadow&&A++),i.spotLightMatrix[g]=J.matrix,U.castShadow){let tt=n.get(U);tt.shadowIntensity=J.intensity,tt.shadowBias=J.bias,tt.shadowNormalBias=J.normalBias,tt.shadowRadius=J.radius,tt.shadowMapSize=J.mapSize,i.spotShadow[g]=tt,i.spotShadowMap[g]=j,w++}g++}else if(U.isRectAreaLight){let H=t.get(U);H.color.copy(N).multiplyScalar(X),H.halfWidth.set(U.width*.5,0,0),H.halfHeight.set(0,U.height*.5,0),i.rectArea[M]=H,M++}else if(U.isPointLight){let H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),H.distance=U.distance,H.decay=U.decay,U.castShadow){let J=U.shadow,tt=n.get(U);tt.shadowIntensity=J.intensity,tt.shadowBias=J.bias,tt.shadowNormalBias=J.normalBias,tt.shadowRadius=J.radius,tt.shadowMapSize=J.mapSize,tt.shadowCameraNear=J.camera.near,tt.shadowCameraFar=J.camera.far,i.pointShadow[h]=tt,i.pointShadowMap[h]=j,i.pointShadowMatrix[h]=U.shadow.matrix,T++}i.point[h]=H,h++}else if(U.isHemisphereLight){let H=t.get(U);H.skyColor.copy(U.color).multiplyScalar(X),H.groundColor.copy(U.groundColor).multiplyScalar(X),i.hemi[y]=H,y++}}M>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=gt.LTC_FLOAT_1,i.rectAreaLTC2=gt.LTC_FLOAT_2):(i.rectAreaLTC1=gt.LTC_HALF_1,i.rectAreaLTC2=gt.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=p,i.ambient[2]=u;let R=i.hash;(R.sunLength!==d||R.directionalLength!==m||R.pointLength!==h||R.spotLength!==g||R.rectAreaLength!==M||R.hemiLength!==y||R.numSunShadows!==v||R.numDirectionalShadows!==b||R.numPointShadows!==T||R.numSpotShadows!==w||R.numSpotMaps!==x||R.numLightProbes!==D)&&(i.sun.length=d,i.directional.length=m,i.spot.length=g,i.rectArea.length=M,i.point.length=h,i.hemi.length=y,i.sunShadow.length=v,i.sunShadowMap.length=v,i.sunShadowMatrix.length=E,i.sunShadowCascade.length=E,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+x-A,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=D,R.sunLength=d,R.directionalLength=m,R.pointLength=h,R.spotLength=g,R.rectAreaLength=M,R.hemiLength=y,R.numSunShadows=v,R.numDirectionalShadows=b,R.numPointShadows=T,R.numSpotShadows=w,R.numSpotMaps=x,R.numLightProbes=D,i.version=I2++)}function l(c,f){let p=0,u=0,d=0,v=0,E=0,m=0,h=f.matrixWorldInverse;for(let g=0,M=c.length;g<M;g++){let y=c[g];if(y.isSunLight){let b=i.sun[p];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(h),p++}else if(y.isDirectionalLight){let b=i.directional[u];b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(h),u++}else if(y.isSpotLight){let b=i.spot[v];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(h),v++}else if(y.isRectAreaLight){let b=i.rectArea[E];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),r.identity(),a.copy(y.matrixWorld),a.premultiply(h),r.extractRotation(a),b.halfWidth.set(y.width*.5,0,0),b.halfHeight.set(0,y.height*.5,0),b.halfWidth.applyMatrix4(r),b.halfHeight.applyMatrix4(r),E++}else if(y.isPointLight){let b=i.point[d];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(h),d++}else if(y.isHemisphereLight){let b=i.hemi[m];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(h),m++}}}return{setup:o,setupView:l,state:i}}function Vb(e){let t=new P2(e),n=[],i=[],s=[];function a(u){p.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function f(u){t.setupView(n,u)}let p={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function B2(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new Vb(e),t.set(s,[o])):a>=r.length?(o=new Vb(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var F2=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,z2=`uniform sampler2D shadow_pass;
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
}`,H2=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],V2=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],Gb=new Xe,su=new W,B0=new W;function G2(e,t,n){let i=new nl,s=new re,a=new re,r=new qe,o=new al,l=new Ef,c={},f=n.maxTextureSize,p={[ps]:wn,[wn]:ps,[Fi]:Fi},u=new yi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new re},radius:{value:4}},vertexShader:F2,fragmentShader:z2}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let v=new Bi;v.setAttribute("position",new In(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let E=new Pn(v,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zc;let h=this.type;this.render=function(T,w,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Ff&&(It("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Zc);let A=e.getRenderTarget(),D=e.getActiveCubeFace(),R=e.getActiveMipmapLevel(),P=e.state;P.setBlending(ms),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let F=h!==this.type;F&&w.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(N=>N.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,N=T.length;U<N;U++){let X=T[U],Y=X.shadow;if(Y===void 0){It("WebGLShadowMap:",X,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let j=Y.getFrameExtents();s.multiply(j),a.copy(Y.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/j.x),s.x=a.x*j.x,Y.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/j.y),s.y=a.y*j.y,Y.mapSize.y=a.y));let H=e.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=H,Y.map===null||F===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===ll){if(X.isPointLight){It("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new ti(s.x,s.y,{format:Ga,type:Qi,minFilter:un,magFilter:un,generateMipmaps:!1}),Y.map.texture.name=X.name+".shadowMap",Y.map.depthTexture=new Oa(s.x,s.y,Ki),Y.map.depthTexture.name=X.name+".shadowMapDepth",Y.map.depthTexture.format=hs,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=xn,Y.map.depthTexture.magFilter=xn}else X.isPointLight?(Y.map=new Ud(s.x),Y.map.depthTexture=new Mf(s.x,Ji)):(Y.map=new ti(s.x,s.y),Y.map.depthTexture=new Oa(s.x,s.y,Ji)),Y.map.depthTexture.name=X.name+".shadowMap",Y.map.depthTexture.format=hs,this.type===Zc?(Y.map.depthTexture.compareFunction=H?Ad:Td,Y.map.depthTexture.minFilter=un,Y.map.depthTexture.magFilter=un):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=xn,Y.map.depthTexture.magFilter=xn);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==s.x||Y.map.height!==s.y)&&Y.map.setSize(s.x,s.y);let J=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();X.isPointLight!==!0&&Y.updateMatrices(X,x);for(let tt=0;tt<J;tt++){let Mt=Y.getCamera(tt);if(X.isPointLight){let vt=Y.camera,Ot=Y.matrix,Nt=X.distance||vt.far;Nt!==vt.far&&(vt.far=Nt,vt.updateProjectionMatrix()),su.setFromMatrixPosition(X.matrixWorld),vt.position.copy(su),B0.copy(vt.position),B0.add(H2[tt]),vt.up.copy(V2[tt]),vt.lookAt(B0),vt.updateMatrixWorld(),Ot.makeTranslation(-su.x,-su.y,-su.z),Gb.multiplyMatrices(vt.projectionMatrix,vt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Gb,vt.coordinateSystem,vt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)e.setRenderTarget(Y.map,tt),e.clear();else{tt===0&&(e.setRenderTarget(Y.map),e.clear());let vt=Y.getViewport(tt);r.set(a.x*vt.x,a.y*vt.y,a.x*vt.z,a.y*vt.w),P.viewport(r)}i=Y.getFrustum(tt),y(w,x,Mt,X,this.type)}Y.isPointLightShadow!==!0&&this.type===ll&&g(Y,x),Y.needsUpdate=!1}h=this.type,m.needsUpdate=!1,e.setRenderTarget(A,D,R)};function g(T,w){let x=t.update(E);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new ti(s.x,s.y,{format:Ga,type:Qi}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,e.setRenderTarget(T.mapPass),e.clear(),e.renderBufferDirect(w,null,x,u,E,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,e.setRenderTarget(T.map),e.clear(),e.renderBufferDirect(w,null,x,d,E,null)}function M(T,w,x,A){let D=null,R=x.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(R!==void 0)D=R;else if(D=x.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let P=D.uuid,F=w.uuid,U=c[P];U===void 0&&(U={},c[P]=U);let N=U[F];N===void 0&&(N=D.clone(),U[F]=N,w.addEventListener("dispose",b)),D=N}if(D.visible=w.visible,D.wireframe=w.wireframe,A===ll?D.side=w.shadowSide!==null?w.shadowSide:w.side:D.side=w.shadowSide!==null?w.shadowSide:p[w.side],D.alphaMap=w.alphaMap,D.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,D.map=w.map,D.clipShadows=w.clipShadows,D.clippingPlanes=w.clippingPlanes,D.clipIntersection=w.clipIntersection,D.displacementMap=w.displacementMap,D.displacementScale=w.displacementScale,D.displacementBias=w.displacementBias,D.wireframeLinewidth=w.wireframeLinewidth,D.linewidth=w.linewidth,x.isPointLight===!0&&D.isMeshDistanceMaterial===!0){let P=e.properties.get(D);P.light=x}return D}function y(T,w,x,A,D){if(T.visible===!1)return;if(T.layers.test(w.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&D===ll)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,T.matrixWorld);let F=t.update(T),U=T.material;if(Array.isArray(U)){let N=F.groups;for(let X=0,Y=N.length;X<Y;X++){let j=N[X],H=U[j.materialIndex];if(H&&H.visible){let J=M(T,H,A,D);T.onBeforeShadow(e,T,w,x,F,J,j),e.renderBufferDirect(x,null,F,J,T,j),T.onAfterShadow(e,T,w,x,F,J,j)}}}else if(U.visible){let N=M(T,U,A,D);T.onBeforeShadow(e,T,w,x,F,N,null),e.renderBufferDirect(x,null,F,N,T,null),T.onAfterShadow(e,T,w,x,F,N,null)}}let P=T.children;for(let F=0,U=P.length;F<U;F++)y(P[F],w,x,A,D)}function b(T){T.target.removeEventListener("dispose",b);for(let x in c){let A=c[x],D=T.target.uuid;D in A&&(A[D].dispose(),delete A[D])}}}function k2(e,t){function n(){let I=!1,ht=new qe,$=null,ct=new qe(0,0,0,0);return{setMask:function(_t){$!==_t&&!I&&(e.colorMask(_t,_t,_t,_t),$=_t)},setLocked:function(_t){I=_t},setClear:function(_t,st,bt,Ct,Se){Se===!0&&(_t*=Ct,st*=Ct,bt*=Ct),ht.set(_t,st,bt,Ct),ct.equals(ht)===!1&&(e.clearColor(_t,st,bt,Ct),ct.copy(ht))},reset:function(){I=!1,$=null,ct.set(-1,0,0,0)}}}function i(){let I=!1,ht=!1,$=null,ct=null,_t=null;return{setReversed:function(st){if(ht!==st){let bt=t.get("EXT_clip_control");st?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),ht=st;let Ct=_t;_t=null,this.setClear(Ct)}},getReversed:function(){return ht},setTest:function(st){st?et(e.DEPTH_TEST):dt(e.DEPTH_TEST)},setMask:function(st){$!==st&&!I&&(e.depthMask(st),$=st)},setFunc:function(st){if(ht&&(st=_b[st]),ct!==st){switch(st){case uf:e.depthFunc(e.NEVER);break;case hf:e.depthFunc(e.ALWAYS);break;case ff:e.depthFunc(e.LESS);break;case Xo:e.depthFunc(e.LEQUAL);break;case df:e.depthFunc(e.EQUAL);break;case pf:e.depthFunc(e.GEQUAL);break;case mf:e.depthFunc(e.GREATER);break;case gf:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ct=st}},setLocked:function(st){I=st},setClear:function(st){_t!==st&&(_t=st,ht&&(st=1-st),e.clearDepth(st))},reset:function(){I=!1,$=null,ct=null,_t=null,ht=!1}}}function s(){let I=!1,ht=null,$=null,ct=null,_t=null,st=null,bt=null,Ct=null,Se=null;return{setTest:function(oe){I||(oe?et(e.STENCIL_TEST):dt(e.STENCIL_TEST))},setMask:function(oe){ht!==oe&&!I&&(e.stencilMask(oe),ht=oe)},setFunc:function(oe,nn,Si){($!==oe||ct!==nn||_t!==Si)&&(e.stencilFunc(oe,nn,Si),$=oe,ct=nn,_t=Si)},setOp:function(oe,nn,Si){(st!==oe||bt!==nn||Ct!==Si)&&(e.stencilOp(oe,nn,Si),st=oe,bt=nn,Ct=Si)},setLocked:function(oe){I=oe},setClear:function(oe){Se!==oe&&(e.clearStencil(oe),Se=oe)},reset:function(){I=!1,ht=null,$=null,ct=null,_t=null,st=null,bt=null,Ct=null,Se=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,f={},p={},u={},d=new WeakMap,v=[],E=null,m=!1,h=null,g=null,M=null,y=null,b=null,T=null,w=null,x=new ne(0,0,0),A=0,D=!1,R=null,P=null,F=null,U=null,N=null,X=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,j=0,H=e.getParameter(e.VERSION);H.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(H)[1]),Y=j>=1):H.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),Y=j>=2);let J=null,tt={},Mt=e.getParameter(e.SCISSOR_BOX),vt=e.getParameter(e.VIEWPORT),Ot=new qe().fromArray(Mt),Nt=new qe().fromArray(vt);function Gt(I,ht,$,ct){let _t=new Uint8Array(4),st=e.createTexture();e.bindTexture(I,st),e.texParameteri(I,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(I,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let bt=0;bt<$;bt++)I===e.TEXTURE_3D||I===e.TEXTURE_2D_ARRAY?e.texImage3D(ht,0,e.RGBA,1,1,ct,0,e.RGBA,e.UNSIGNED_BYTE,_t):e.texImage2D(ht+bt,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,_t);return st}let Z={};Z[e.TEXTURE_2D]=Gt(e.TEXTURE_2D,e.TEXTURE_2D,1),Z[e.TEXTURE_CUBE_MAP]=Gt(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[e.TEXTURE_2D_ARRAY]=Gt(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Z[e.TEXTURE_3D]=Gt(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),et(e.DEPTH_TEST),r.setFunc(Xo),Ft(!1),de(n0),et(e.CULL_FACE),ee(ms);function et(I){f[I]!==!0&&(e.enable(I),f[I]=!0)}function dt(I){f[I]!==!1&&(e.disable(I),f[I]=!1)}function Lt(I,ht){return u[I]!==ht?(e.bindFramebuffer(I,ht),u[I]=ht,I===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=ht),I===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=ht),!0):!1}function at(I,ht){let $=v,ct=!1;if(I){$=d.get(ht),$===void 0&&($=[],d.set(ht,$));let _t=I.textures;if($.length!==_t.length||$[0]!==e.COLOR_ATTACHMENT0){for(let st=0,bt=_t.length;st<bt;st++)$[st]=e.COLOR_ATTACHMENT0+st;$.length=_t.length,ct=!0}}else $[0]!==e.BACK&&($[0]=e.BACK,ct=!0);ct&&e.drawBuffers($)}function qt(I){return E!==I?(e.useProgram(I),E=I,!0):!1}let Ve={[yr]:e.FUNC_ADD,[FM]:e.FUNC_SUBTRACT,[zM]:e.FUNC_REVERSE_SUBTRACT};Ve[HM]=e.MIN,Ve[VM]=e.MAX;let Zt={[GM]:e.ZERO,[kM]:e.ONE,[WM]:e.SRC_COLOR,[r0]:e.SRC_ALPHA,[KM]:e.SRC_ALPHA_SATURATE,[ZM]:e.DST_COLOR,[qM]:e.DST_ALPHA,[XM]:e.ONE_MINUS_SRC_COLOR,[o0]:e.ONE_MINUS_SRC_ALPHA,[JM]:e.ONE_MINUS_DST_COLOR,[YM]:e.ONE_MINUS_DST_ALPHA,[QM]:e.CONSTANT_COLOR,[jM]:e.ONE_MINUS_CONSTANT_COLOR,[$M]:e.CONSTANT_ALPHA,[tb]:e.ONE_MINUS_CONSTANT_ALPHA};function ee(I,ht,$,ct,_t,st,bt,Ct,Se,oe){if(I===ms){m===!0&&(dt(e.BLEND),m=!1);return}if(m===!1&&(et(e.BLEND),m=!0),I!==BM){if(I!==h||oe!==D){if((g!==yr||b!==yr)&&(e.blendEquation(e.FUNC_ADD),g=yr,b=yr),oe)switch(I){case cl:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case i0:e.blendFunc(e.ONE,e.ONE);break;case s0:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case a0:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Bt("WebGLState: Invalid blending: ",I);break}else switch(I){case cl:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case i0:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case s0:Bt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case a0:Bt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Bt("WebGLState: Invalid blending: ",I);break}M=null,y=null,T=null,w=null,x.set(0,0,0),A=0,h=I,D=oe}return}_t=_t||ht,st=st||$,bt=bt||ct,(ht!==g||_t!==b)&&(e.blendEquationSeparate(Ve[ht],Ve[_t]),g=ht,b=_t),($!==M||ct!==y||st!==T||bt!==w)&&(e.blendFuncSeparate(Zt[$],Zt[ct],Zt[st],Zt[bt]),M=$,y=ct,T=st,w=bt),(Ct.equals(x)===!1||Se!==A)&&(e.blendColor(Ct.r,Ct.g,Ct.b,Se),x.copy(Ct),A=Se),h=I,D=!1}function Qt(I,ht){I.side===Fi?dt(e.CULL_FACE):et(e.CULL_FACE);let $=I.side===wn;ht&&($=!$),Ft($),I.blending===cl&&I.transparent===!1?ee(ms):ee(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),a.setMask(I.colorWrite);let ct=I.stencilWrite;o.setTest(ct),ct&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Qe(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?et(e.SAMPLE_ALPHA_TO_COVERAGE):dt(e.SAMPLE_ALPHA_TO_COVERAGE)}function Ft(I){R!==I&&(I?e.frontFace(e.CW):e.frontFace(e.CCW),R=I)}function de(I){I!==OM?(et(e.CULL_FACE),I!==P&&(I===n0?e.cullFace(e.BACK):I===PM?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):dt(e.CULL_FACE),P=I}function zt(I){I!==F&&(Y&&e.lineWidth(I),F=I)}function Qe(I,ht,$){I?(et(e.POLYGON_OFFSET_FILL),(U!==ht||N!==$)&&(U=ht,N=$,r.getReversed()&&(ht=-ht),e.polygonOffset(ht,$))):dt(e.POLYGON_OFFSET_FILL)}function xe(I){I?et(e.SCISSOR_TEST):dt(e.SCISSOR_TEST)}function pe(I){I===void 0&&(I=e.TEXTURE0+X-1),J!==I&&(e.activeTexture(I),J=I)}function O(I,ht,$){$===void 0&&(J===null?$=e.TEXTURE0+X-1:$=J);let ct=tt[$];ct===void 0&&(ct={type:void 0,texture:void 0},tt[$]=ct),(ct.type!==I||ct.texture!==ht)&&(J!==$&&(e.activeTexture($),J=$),e.bindTexture(I,ht||Z[I]),ct.type=I,ct.texture=ht)}function Ie(){let I=tt[J];I!==void 0&&I.type!==void 0&&(e.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function ie(){try{e.compressedTexImage2D(...arguments)}catch(I){Bt("WebGLState:",I)}}function C(){try{e.compressedTexImage3D(...arguments)}catch(I){Bt("WebGLState:",I)}}function _(){try{e.texSubImage2D(...arguments)}catch(I){Bt("WebGLState:",I)}}function B(){try{e.texSubImage3D(...arguments)}catch(I){Bt("WebGLState:",I)}}function G(){try{e.compressedTexSubImage2D(...arguments)}catch(I){Bt("WebGLState:",I)}}function q(){try{e.compressedTexSubImage3D(...arguments)}catch(I){Bt("WebGLState:",I)}}function ot(){try{e.texStorage2D(...arguments)}catch(I){Bt("WebGLState:",I)}}function rt(){try{e.texStorage3D(...arguments)}catch(I){Bt("WebGLState:",I)}}function K(){try{e.texImage2D(...arguments)}catch(I){Bt("WebGLState:",I)}}function Q(){try{e.texImage3D(...arguments)}catch(I){Bt("WebGLState:",I)}}function ut(I){return p[I]!==void 0?p[I]:e.getParameter(I)}function Et(I,ht){p[I]!==ht&&(e.pixelStorei(I,ht),p[I]=ht)}function ft(I){Ot.equals(I)===!1&&(e.scissor(I.x,I.y,I.z,I.w),Ot.copy(I))}function lt(I){Nt.equals(I)===!1&&(e.viewport(I.x,I.y,I.z,I.w),Nt.copy(I))}function Dt(I,ht){let $=c.get(ht);$===void 0&&($=new WeakMap,c.set(ht,$));let ct=$.get(I);ct===void 0&&(ct=e.getUniformBlockIndex(ht,I.name),$.set(I,ct))}function Tt(I,ht){let ct=c.get(ht).get(I);l.get(ht)!==ct&&(e.uniformBlockBinding(ht,ct,I.__bindingPointIndex),l.set(ht,ct))}function Pt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),f={},p={},J=null,tt={},u={},d=new WeakMap,v=[],E=null,m=!1,h=null,g=null,M=null,y=null,b=null,T=null,w=null,x=new ne(0,0,0),A=0,D=!1,R=null,P=null,F=null,U=null,N=null,Ot.set(0,0,e.canvas.width,e.canvas.height),Nt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:et,disable:dt,bindFramebuffer:Lt,drawBuffers:at,useProgram:qt,setBlending:ee,setMaterial:Qt,setFlipSided:Ft,setCullFace:de,setLineWidth:zt,setPolygonOffset:Qe,setScissorTest:xe,activeTexture:pe,bindTexture:O,unbindTexture:Ie,compressedTexImage2D:ie,compressedTexImage3D:C,texImage2D:K,texImage3D:Q,pixelStorei:Et,getParameter:ut,updateUBOMapping:Dt,uniformBlockBinding:Tt,texStorage2D:ot,texStorage3D:rt,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:G,compressedTexSubImage3D:q,scissor:ft,viewport:lt,reset:Pt}}function W2(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new re,f=new WeakMap,p=new Set,u,d=new WeakMap,v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function E(C,_){return v?new OffscreenCanvas(C,_):Zo("canvas")}function m(C,_,B){let G=1,q=ie(C);if((q.width>B||q.height>B)&&(G=B/Math.max(q.width,q.height)),G<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ot=Math.floor(G*q.width),rt=Math.floor(G*q.height);u===void 0&&(u=E(ot,rt));let K=_?E(ot,rt):u;return K.width=ot,K.height=rt,K.getContext("2d").drawImage(C,0,0,ot,rt),It("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+ot+"x"+rt+")."),K}else return"data"in C&&It("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),C;return C}function h(C){return C.generateMipmaps}function g(C){e.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?e.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(C,_,B,G,q,ot=!1){if(C!==null){if(e[C]!==void 0)return e[C];It("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let rt;G&&(rt=t.get("EXT_texture_norm16"),rt||It("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=_;if(_===e.RED&&(B===e.FLOAT&&(K=e.R32F),B===e.HALF_FLOAT&&(K=e.R16F),B===e.UNSIGNED_BYTE&&(K=e.R8),B===e.UNSIGNED_SHORT&&rt&&(K=rt.R16_EXT),B===e.SHORT&&rt&&(K=rt.R16_SNORM_EXT)),_===e.RED_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.R8UI),B===e.UNSIGNED_SHORT&&(K=e.R16UI),B===e.UNSIGNED_INT&&(K=e.R32UI),B===e.BYTE&&(K=e.R8I),B===e.SHORT&&(K=e.R16I),B===e.INT&&(K=e.R32I)),_===e.RG&&(B===e.FLOAT&&(K=e.RG32F),B===e.HALF_FLOAT&&(K=e.RG16F),B===e.UNSIGNED_BYTE&&(K=e.RG8),B===e.UNSIGNED_SHORT&&rt&&(K=rt.RG16_EXT),B===e.SHORT&&rt&&(K=rt.RG16_SNORM_EXT)),_===e.RG_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RG8UI),B===e.UNSIGNED_SHORT&&(K=e.RG16UI),B===e.UNSIGNED_INT&&(K=e.RG32UI),B===e.BYTE&&(K=e.RG8I),B===e.SHORT&&(K=e.RG16I),B===e.INT&&(K=e.RG32I)),_===e.RGB_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RGB8UI),B===e.UNSIGNED_SHORT&&(K=e.RGB16UI),B===e.UNSIGNED_INT&&(K=e.RGB32UI),B===e.BYTE&&(K=e.RGB8I),B===e.SHORT&&(K=e.RGB16I),B===e.INT&&(K=e.RGB32I)),_===e.RGBA_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RGBA8UI),B===e.UNSIGNED_SHORT&&(K=e.RGBA16UI),B===e.UNSIGNED_INT&&(K=e.RGBA32UI),B===e.BYTE&&(K=e.RGBA8I),B===e.SHORT&&(K=e.RGBA16I),B===e.INT&&(K=e.RGBA32I)),_===e.RGB&&(B===e.UNSIGNED_SHORT&&rt&&(K=rt.RGB16_EXT),B===e.SHORT&&rt&&(K=rt.RGB16_SNORM_EXT),B===e.UNSIGNED_INT_5_9_9_9_REV&&(K=e.RGB9_E5),B===e.UNSIGNED_INT_10F_11F_11F_REV&&(K=e.R11F_G11F_B10F)),_===e.RGBA){let Q=ot?Uc:ce.getTransfer(q);B===e.FLOAT&&(K=e.RGBA32F),B===e.HALF_FLOAT&&(K=e.RGBA16F),B===e.UNSIGNED_BYTE&&(K=Q===be?e.SRGB8_ALPHA8:e.RGBA8),B===e.UNSIGNED_SHORT&&rt&&(K=rt.RGBA16_EXT),B===e.SHORT&&rt&&(K=rt.RGBA16_SNORM_EXT),B===e.UNSIGNED_SHORT_4_4_4_4&&(K=e.RGBA4),B===e.UNSIGNED_SHORT_5_5_5_1&&(K=e.RGB5_A1)}return(K===e.R16F||K===e.R32F||K===e.RG16F||K===e.RG32F||K===e.RGBA16F||K===e.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function b(C,_){let B;return C?_===null||_===Ji||_===hl?B=e.DEPTH24_STENCIL8:_===Ki?B=e.DEPTH32F_STENCIL8:_===ul&&(B=e.DEPTH24_STENCIL8,It("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ji||_===hl?B=e.DEPTH_COMPONENT24:_===Ki?B=e.DEPTH_COMPONENT32F:_===ul&&(B=e.DEPTH_COMPONENT16),B}function T(C,_){return h(C)===!0||C.isFramebufferTexture&&C.minFilter!==xn&&C.minFilter!==un?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function w(C){let _=C.target;_.removeEventListener("dispose",w),A(_),_.isVideoTexture&&f.delete(_),_.isHTMLTexture&&p.delete(_)}function x(C){let _=C.target;_.removeEventListener("dispose",x),R(_)}function A(C){let _=i.get(C);if(_.__webglInit===void 0)return;let B=C.source,G=d.get(B);if(G){let q=G[_.__cacheKey];q.usedTimes--,q.usedTimes===0&&D(C),Object.keys(G).length===0&&d.delete(B)}i.remove(C)}function D(C){let _=i.get(C);e.deleteTexture(_.__webglTexture);let B=C.source,G=d.get(B);delete G[_.__cacheKey],r.memory.textures--}function R(C){let _=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(_.__webglFramebuffer[G]))for(let q=0;q<_.__webglFramebuffer[G].length;q++)e.deleteFramebuffer(_.__webglFramebuffer[G][q]);else e.deleteFramebuffer(_.__webglFramebuffer[G]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[G])}else{if(Array.isArray(_.__webglFramebuffer))for(let G=0;G<_.__webglFramebuffer.length;G++)e.deleteFramebuffer(_.__webglFramebuffer[G]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let G=0;G<_.__webglColorRenderbuffer.length;G++)_.__webglColorRenderbuffer[G]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[G]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=C.textures;for(let G=0,q=B.length;G<q;G++){let ot=i.get(B[G]);ot.__webglTexture&&(e.deleteTexture(ot.__webglTexture),r.memory.textures--),i.remove(B[G])}i.remove(C)}let P=0;function F(){P=0}function U(){return P}function N(C){P=C}function X(){let C=P;return C>=s.maxTextures&&It("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function Y(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function j(C,_){let B=i.get(C);if(C.isVideoTexture&&O(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let G=C.image;if(G===null)It("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)It("WebGLRenderer: Texture marked for update but image is incomplete");else{dt(B,C,_);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,B.__webglTexture,e.TEXTURE0+_)}function H(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){dt(B,C,_);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,B.__webglTexture,e.TEXTURE0+_)}function J(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){dt(B,C,_);return}n.bindTexture(e.TEXTURE_3D,B.__webglTexture,e.TEXTURE0+_)}function tt(C,_){let B=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Lt(B,C,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,B.__webglTexture,e.TEXTURE0+_)}let Mt={[qo]:e.REPEAT,[us]:e.CLAMP_TO_EDGE,[_f]:e.MIRRORED_REPEAT},vt={[xn]:e.NEAREST,[ib]:e.NEAREST_MIPMAP_NEAREST,[Kc]:e.NEAREST_MIPMAP_LINEAR,[un]:e.LINEAR,[Vf]:e.LINEAR_MIPMAP_NEAREST,[Ha]:e.LINEAR_MIPMAP_LINEAR},Ot={[ob]:e.NEVER,[fb]:e.ALWAYS,[lb]:e.LESS,[Td]:e.LEQUAL,[cb]:e.EQUAL,[Ad]:e.GEQUAL,[ub]:e.GREATER,[hb]:e.NOTEQUAL};function Nt(C,_){if(_.type===Ki&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===un||_.magFilter===Vf||_.magFilter===Kc||_.magFilter===Ha||_.minFilter===un||_.minFilter===Vf||_.minFilter===Kc||_.minFilter===Ha)&&It("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(C,e.TEXTURE_WRAP_S,Mt[_.wrapS]),e.texParameteri(C,e.TEXTURE_WRAP_T,Mt[_.wrapT]),(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)&&e.texParameteri(C,e.TEXTURE_WRAP_R,Mt[_.wrapR]),e.texParameteri(C,e.TEXTURE_MAG_FILTER,vt[_.magFilter]),e.texParameteri(C,e.TEXTURE_MIN_FILTER,vt[_.minFilter]),_.compareFunction&&(e.texParameteri(C,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(C,e.TEXTURE_COMPARE_FUNC,Ot[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===xn||_.minFilter!==Kc&&_.minFilter!==Ha||_.type===Ki&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");e.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function Gt(C,_){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",w));let G=_.source,q=d.get(G);q===void 0&&(q={},d.set(G,q));let ot=Y(_);if(ot!==C.__cacheKey){q[ot]===void 0&&(q[ot]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,B=!0),q[ot].usedTimes++;let rt=q[C.__cacheKey];rt!==void 0&&(q[C.__cacheKey].usedTimes--,rt.usedTimes===0&&D(_)),C.__cacheKey=ot,C.__webglTexture=q[ot].texture}return B}function Z(C,_,B){return Math.floor(Math.floor(C/B)/_)}function et(C,_,B,G){let ot=C.updateRanges;if(ot.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,_.width,_.height,B,G,_.data);else{ot.sort((Et,ft)=>Et.start-ft.start);let rt=0;for(let Et=1;Et<ot.length;Et++){let ft=ot[rt],lt=ot[Et],Dt=ft.start+ft.count,Tt=Z(lt.start,_.width,4),Pt=Z(ft.start,_.width,4);lt.start<=Dt+1&&Tt===Pt&&Z(lt.start+lt.count-1,_.width,4)===Tt?ft.count=Math.max(ft.count,lt.start+lt.count-ft.start):(++rt,ot[rt]=lt)}ot.length=rt+1;let K=n.getParameter(e.UNPACK_ROW_LENGTH),Q=n.getParameter(e.UNPACK_SKIP_PIXELS),ut=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,_.width);for(let Et=0,ft=ot.length;Et<ft;Et++){let lt=ot[Et],Dt=Math.floor(lt.start/4),Tt=Math.ceil(lt.count/4),Pt=Dt%_.width,I=Math.floor(Dt/_.width),ht=Tt,$=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,Pt),n.pixelStorei(e.UNPACK_SKIP_ROWS,I),n.texSubImage2D(e.TEXTURE_2D,0,Pt,I,ht,$,B,G,_.data)}C.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,K),n.pixelStorei(e.UNPACK_SKIP_PIXELS,Q),n.pixelStorei(e.UNPACK_SKIP_ROWS,ut)}}function dt(C,_,B){let G=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(G=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(G=e.TEXTURE_3D);let q=Gt(C,_),ot=_.source;n.bindTexture(G,C.__webglTexture,e.TEXTURE0+B);let rt=i.get(ot);if(ot.version!==rt.__version||q===!0){if(n.activeTexture(e.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let $=ce.getPrimaries(ce.workingColorSpace),ct=_.colorSpace===Qs?null:ce.getPrimaries(_.colorSpace),_t=_.colorSpace===Qs||$===ct?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t)}n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment);let Q=m(_.image,!1,s.maxTextureSize);Q=Ie(_,Q);let ut=a.convert(_.format,_.colorSpace),Et=a.convert(_.type),ft=y(_.internalFormat,ut,Et,_.normalized,_.colorSpace,_.isVideoTexture);Nt(G,_);let lt,Dt=_.mipmaps,Tt=_.isVideoTexture!==!0,Pt=rt.__version===void 0||q===!0,I=ot.dataReady,ht=T(_,Q);if(_.isDepthTexture)ft=b(_.format===Va,_.type),Pt&&(Tt?n.texStorage2D(e.TEXTURE_2D,1,ft,Q.width,Q.height):n.texImage2D(e.TEXTURE_2D,0,ft,Q.width,Q.height,0,ut,Et,null));else if(_.isDataTexture)if(Dt.length>0){Tt&&Pt&&n.texStorage2D(e.TEXTURE_2D,ht,ft,Dt[0].width,Dt[0].height);for(let $=0,ct=Dt.length;$<ct;$++)lt=Dt[$],Tt?I&&n.texSubImage2D(e.TEXTURE_2D,$,0,0,lt.width,lt.height,ut,Et,lt.data):n.texImage2D(e.TEXTURE_2D,$,ft,lt.width,lt.height,0,ut,Et,lt.data);_.generateMipmaps=!1}else Tt?(Pt&&n.texStorage2D(e.TEXTURE_2D,ht,ft,Q.width,Q.height),I&&et(_,Q,ut,Et)):n.texImage2D(e.TEXTURE_2D,0,ft,Q.width,Q.height,0,ut,Et,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Tt&&Pt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ht,ft,Dt[0].width,Dt[0].height,Q.depth);for(let $=0,ct=Dt.length;$<ct;$++)if(lt=Dt[$],_.format!==zi)if(ut!==null)if(Tt){if(I)if(_.layerUpdates.size>0){let _t=U0(lt.width,lt.height,_.format,_.type);for(let st of _.layerUpdates){let bt=lt.data.subarray(st*_t/lt.data.BYTES_PER_ELEMENT,(st+1)*_t/lt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,$,0,0,st,lt.width,lt.height,1,ut,bt)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,$,0,0,0,lt.width,lt.height,Q.depth,ut,lt.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,$,ft,lt.width,lt.height,Q.depth,0,lt.data,0,0);else It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Tt?I&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,$,0,0,0,lt.width,lt.height,Q.depth,ut,Et,lt.data):n.texImage3D(e.TEXTURE_2D_ARRAY,$,ft,lt.width,lt.height,Q.depth,0,ut,Et,lt.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Tt&&Pt&&n.texStorage2D(e.TEXTURE_2D,ht,ft,Dt[0].width,Dt[0].height);for(let $=0,ct=Dt.length;$<ct;$++)lt=Dt[$],_.format!==zi?ut!==null?Tt?I&&n.compressedTexSubImage2D(e.TEXTURE_2D,$,0,0,lt.width,lt.height,ut,lt.data):n.compressedTexImage2D(e.TEXTURE_2D,$,ft,lt.width,lt.height,0,lt.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Tt?I&&n.texSubImage2D(e.TEXTURE_2D,$,0,0,lt.width,lt.height,ut,Et,lt.data):n.texImage2D(e.TEXTURE_2D,$,ft,lt.width,lt.height,0,ut,Et,lt.data)}else if(_.isDataArrayTexture)if(Tt){if(Pt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ht,ft,Q.width,Q.height,Q.depth),I)if(_.layerUpdates.size>0){let $=U0(Q.width,Q.height,_.format,_.type);for(let ct of _.layerUpdates){let _t=Q.data.subarray(ct*$/Q.data.BYTES_PER_ELEMENT,(ct+1)*$/Q.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ct,Q.width,Q.height,1,ut,Et,_t)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ut,Et,Q.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ft,Q.width,Q.height,Q.depth,0,ut,Et,Q.data);else if(_.isData3DTexture)Tt?(Pt&&n.texStorage3D(e.TEXTURE_3D,ht,ft,Q.width,Q.height,Q.depth),I&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ut,Et,Q.data)):n.texImage3D(e.TEXTURE_3D,0,ft,Q.width,Q.height,Q.depth,0,ut,Et,Q.data);else if(_.isFramebufferTexture){if(Pt)if(Tt)n.texStorage2D(e.TEXTURE_2D,ht,ft,Q.width,Q.height);else{let $=Q.width,ct=Q.height;for(let _t=0;_t<ht;_t++)n.texImage2D(e.TEXTURE_2D,_t,ft,$,ct,0,ut,Et,null),$>>=1,ct>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in e){let $=e.canvas;if($.hasAttribute("layoutsubtree")||$.setAttribute("layoutsubtree","true"),Q.parentNode!==$){$.appendChild(Q),p.add(_),$.onpaint=ct=>{let _t=ct.changedElements;for(let st of p)_t.includes(st.image)&&(st.needsUpdate=!0)},$.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,Q);else{let _t=e.RGBA,st=e.RGBA,bt=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,_t,st,bt,Q)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Dt.length>0){if(Tt&&Pt){let $=ie(Dt[0]);n.texStorage2D(e.TEXTURE_2D,ht,ft,$.width,$.height)}for(let $=0,ct=Dt.length;$<ct;$++)lt=Dt[$],Tt?I&&n.texSubImage2D(e.TEXTURE_2D,$,0,0,ut,Et,lt):n.texImage2D(e.TEXTURE_2D,$,ft,ut,Et,lt);_.generateMipmaps=!1}else if(Tt){if(Pt){let $=ie(Q);n.texStorage2D(e.TEXTURE_2D,ht,ft,$.width,$.height)}I&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,ut,Et,Q)}else n.texImage2D(e.TEXTURE_2D,0,ft,ut,Et,Q);h(_)&&g(G),rt.__version=ot.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Lt(C,_,B){if(_.image.length!==6)return;let G=Gt(C,_),q=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+B);let ot=i.get(q);if(q.version!==ot.__version||G===!0){n.activeTexture(e.TEXTURE0+B);let rt=ce.getPrimaries(ce.workingColorSpace),K=_.colorSpace===Qs?null:ce.getPrimaries(_.colorSpace),Q=_.colorSpace===Qs||rt===K?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ut=_.isCompressedTexture||_.image[0].isCompressedTexture,Et=_.image[0]&&_.image[0].isDataTexture,ft=[];for(let st=0;st<6;st++)!ut&&!Et?ft[st]=m(_.image[st],!0,s.maxCubemapSize):ft[st]=Et?_.image[st].image:_.image[st],ft[st]=Ie(_,ft[st]);let lt=ft[0],Dt=a.convert(_.format,_.colorSpace),Tt=a.convert(_.type),Pt=y(_.internalFormat,Dt,Tt,_.normalized,_.colorSpace),I=_.isVideoTexture!==!0,ht=ot.__version===void 0||G===!0,$=q.dataReady,ct=T(_,lt);Nt(e.TEXTURE_CUBE_MAP,_);let _t;if(ut){I&&ht&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ct,Pt,lt.width,lt.height);for(let st=0;st<6;st++){_t=ft[st].mipmaps;for(let bt=0;bt<_t.length;bt++){let Ct=_t[bt];_.format!==zi?Dt!==null?I?$&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt,0,0,Ct.width,Ct.height,Dt,Ct.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt,Pt,Ct.width,Ct.height,0,Ct.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?$&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt,0,0,Ct.width,Ct.height,Dt,Tt,Ct.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt,Pt,Ct.width,Ct.height,0,Dt,Tt,Ct.data)}}}else{if(_t=_.mipmaps,I&&ht){_t.length>0&&ct++;let st=ie(ft[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ct,Pt,st.width,st.height)}for(let st=0;st<6;st++)if(Et){I?$&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,ft[st].width,ft[st].height,Dt,Tt,ft[st].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Pt,ft[st].width,ft[st].height,0,Dt,Tt,ft[st].data);for(let bt=0;bt<_t.length;bt++){let Se=_t[bt].image[st].image;I?$&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt+1,0,0,Se.width,Se.height,Dt,Tt,Se.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt+1,Pt,Se.width,Se.height,0,Dt,Tt,Se.data)}}else{I?$&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Dt,Tt,ft[st]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Pt,Dt,Tt,ft[st]);for(let bt=0;bt<_t.length;bt++){let Ct=_t[bt];I?$&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt+1,0,0,Dt,Tt,Ct.image[st]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+st,bt+1,Pt,Dt,Tt,Ct.image[st])}}}h(_)&&g(e.TEXTURE_CUBE_MAP),ot.__version=q.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function at(C,_,B,G,q,ot){let rt=a.convert(B.format,B.colorSpace),K=a.convert(B.type),Q=y(B.internalFormat,rt,K,B.normalized,B.colorSpace),ut=i.get(_),Et=i.get(B);if(Et.__renderTarget=_,!ut.__hasExternalTextures){let ft=Math.max(1,_.width>>ot),lt=Math.max(1,_.height>>ot);q===e.TEXTURE_3D||q===e.TEXTURE_2D_ARRAY?n.texImage3D(q,ot,Q,ft,lt,_.depth,0,rt,K,null):n.texImage2D(q,ot,Q,ft,lt,0,rt,K,null)}n.bindFramebuffer(e.FRAMEBUFFER,C),pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,G,q,Et.__webglTexture,0,xe(_)):(q===e.TEXTURE_2D||q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,G,q,Et.__webglTexture,ot),n.bindFramebuffer(e.FRAMEBUFFER,null)}function qt(C,_,B){if(e.bindRenderbuffer(e.RENDERBUFFER,C),_.depthBuffer){let G=_.depthTexture,q=G&&G.isDepthTexture?G.type:null,ot=b(_.stencilBuffer,q),rt=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;pe(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,xe(_),ot,_.width,_.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,xe(_),ot,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,ot,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,rt,e.RENDERBUFFER,C)}else{let G=_.textures;for(let q=0;q<G.length;q++){let ot=G[q],rt=a.convert(ot.format,ot.colorSpace),K=a.convert(ot.type),Q=y(ot.internalFormat,rt,K,ot.normalized,ot.colorSpace);pe(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,xe(_),Q,_.width,_.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,xe(_),Q,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,Q,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ve(C,_,B){let G=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let q=i.get(_.depthTexture);if(q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),G){if(q.__webglInit===void 0&&(q.__webglInit=!0,_.depthTexture.addEventListener("dispose",w)),q.__webglTexture===void 0){q.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Nt(e.TEXTURE_CUBE_MAP,_.depthTexture);let ut=a.convert(_.depthTexture.format),Et=a.convert(_.depthTexture.type),ft;_.depthTexture.format===hs?ft=e.DEPTH_COMPONENT24:_.depthTexture.format===Va&&(ft=e.DEPTH24_STENCIL8);for(let lt=0;lt<6;lt++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,ft,_.width,_.height,0,ut,Et,null)}}else j(_.depthTexture,0);let ot=q.__webglTexture,rt=xe(_),K=G?e.TEXTURE_CUBE_MAP_POSITIVE_X+B:e.TEXTURE_2D,Q=_.depthTexture.format===Va?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(_.depthTexture.format===hs)pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Q,K,ot,0,rt):e.framebufferTexture2D(e.FRAMEBUFFER,Q,K,ot,0);else if(_.depthTexture.format===Va)pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Q,K,ot,0,rt):e.framebufferTexture2D(e.FRAMEBUFFER,Q,K,ot,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Zt(C){let _=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let G=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),G){let q=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,G.removeEventListener("dispose",q)};G.addEventListener("dispose",q),_.__depthDisposeCallback=q}_.__boundDepthTexture=G}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let G=0;G<6;G++)Ve(_.__webglFramebuffer[G],C,G);else{let G=C.texture.mipmaps;G&&G.length>0?Ve(_.__webglFramebuffer[0],C,0):Ve(_.__webglFramebuffer,C,0)}else if(B){_.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[G]),_.__webglDepthbuffer[G]===void 0)_.__webglDepthbuffer[G]=e.createRenderbuffer(),qt(_.__webglDepthbuffer[G],C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ot=_.__webglDepthbuffer[G];e.bindRenderbuffer(e.RENDERBUFFER,ot),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,ot)}}else{let G=C.texture.mipmaps;if(G&&G.length>0?n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),qt(_.__webglDepthbuffer,C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ot=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,ot),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,ot)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ee(C,_,B){let G=i.get(C);_!==void 0&&at(G.__webglFramebuffer,C,C.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),B!==void 0&&Zt(C)}function Qt(C){let _=C.texture,B=i.get(C),G=i.get(_);C.addEventListener("dispose",x);let q=C.textures,ot=C.isWebGLCubeRenderTarget===!0,rt=q.length>1;if(rt||(G.__webglTexture===void 0&&(G.__webglTexture=e.createTexture()),G.__version=_.version,r.memory.textures++),ot){B.__webglFramebuffer=[];for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[K]=[];for(let Q=0;Q<_.mipmaps.length;Q++)B.__webglFramebuffer[K][Q]=e.createFramebuffer()}else B.__webglFramebuffer[K]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let K=0;K<_.mipmaps.length;K++)B.__webglFramebuffer[K]=e.createFramebuffer()}else B.__webglFramebuffer=e.createFramebuffer();if(rt)for(let K=0,Q=q.length;K<Q;K++){let ut=i.get(q[K]);ut.__webglTexture===void 0&&(ut.__webglTexture=e.createTexture(),r.memory.textures++)}if(C.samples>0&&pe(C)===!1){B.__webglMultisampledFramebuffer=e.createFramebuffer(),B.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let K=0;K<q.length;K++){let Q=q[K];B.__webglColorRenderbuffer[K]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,B.__webglColorRenderbuffer[K]);let ut=a.convert(Q.format,Q.colorSpace),Et=a.convert(Q.type),ft=y(Q.internalFormat,ut,Et,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),lt=xe(C);e.renderbufferStorageMultisample(e.RENDERBUFFER,lt,ft,C.width,C.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+K,e.RENDERBUFFER,B.__webglColorRenderbuffer[K])}e.bindRenderbuffer(e.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=e.createRenderbuffer(),qt(B.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(ot){n.bindTexture(e.TEXTURE_CUBE_MAP,G.__webglTexture),Nt(e.TEXTURE_CUBE_MAP,_);for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)at(B.__webglFramebuffer[K][Q],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+K,Q);else at(B.__webglFramebuffer[K],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);h(_)&&g(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(rt){for(let K=0,Q=q.length;K<Q;K++){let ut=q[K],Et=i.get(ut),ft=e.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ft=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(ft,Et.__webglTexture),Nt(ft,ut),at(B.__webglFramebuffer,C,ut,e.COLOR_ATTACHMENT0+K,ft,0),h(ut)&&g(ft)}n.unbindTexture()}else{let K=e.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(K,G.__webglTexture),Nt(K,_),_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)at(B.__webglFramebuffer[Q],C,_,e.COLOR_ATTACHMENT0,K,Q);else at(B.__webglFramebuffer,C,_,e.COLOR_ATTACHMENT0,K,0);h(_)&&g(K),n.unbindTexture()}C.depthBuffer&&Zt(C)}function Ft(C){let _=C.textures;for(let B=0,G=_.length;B<G;B++){let q=_[B];if(h(q)){let ot=M(C),rt=i.get(q).__webglTexture;n.bindTexture(ot,rt),g(ot),n.unbindTexture()}}}let de=[],zt=[];function Qe(C){if(C.samples>0){if(pe(C)===!1){let _=C.textures,B=C.width,G=C.height,q=e.COLOR_BUFFER_BIT,ot=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=i.get(C),K=_.length>1;if(K)for(let ut=0;ut<_.length;ut++)n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,rt.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglFramebuffer);for(let ut=0;ut<_.length;ut++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(q|=e.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(q|=e.STENCIL_BUFFER_BIT)),K){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,rt.__webglColorRenderbuffer[ut]);let Et=i.get(_[ut]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Et,0)}e.blitFramebuffer(0,0,B,G,0,0,B,G,q,e.NEAREST),l===!0&&(de.length=0,zt.length=0,de.push(e.COLOR_ATTACHMENT0+ut),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(de.push(ot),zt.push(ot),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,zt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,de))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),K)for(let ut=0;ut<_.length;ut++){n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,rt.__webglColorRenderbuffer[ut]);let Et=i.get(_[ut]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,Et,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let _=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function xe(C){return Math.min(s.maxSamples,C.samples)}function pe(C){let _=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function O(C){let _=r.render.frame;f.get(C)!==_&&(f.set(C,_),C.update())}function Ie(C,_){let B=C.colorSpace,G=C.format,q=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==Dc&&B!==Qs&&(ce.getTransfer(B)===be?(G!==zi||q!==ei)&&It("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Bt("WebGLTextures: Unsupported texture color space:",B)),_}function ie(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=F,this.getTextureUnits=U,this.setTextureUnits=N,this.setTexture2D=j,this.setTexture2DArray=H,this.setTexture3D=J,this.setTextureCube=tt,this.rebindTextures=ee,this.setupRenderTarget=Qt,this.updateRenderTargetMipmap=Ft,this.updateMultisampleRenderTarget=Qe,this.setupDepthRenderbuffer=Zt,this.setupFrameBufferTexture=at,this.useMultisampledRTT=pe,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function X2(e,t){function n(i,s=Qs){let a,r=ce.getTransfer(s);if(i===ei)return e.UNSIGNED_BYTE;if(i===kf)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Wf)return e.UNSIGNED_SHORT_5_5_5_1;if(i===y0)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===x0)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===_0)return e.BYTE;if(i===v0)return e.SHORT;if(i===ul)return e.UNSIGNED_SHORT;if(i===Gf)return e.INT;if(i===Ji)return e.UNSIGNED_INT;if(i===Ki)return e.FLOAT;if(i===Qi)return e.HALF_FLOAT;if(i===S0)return e.ALPHA;if(i===M0)return e.RGB;if(i===zi)return e.RGBA;if(i===hs)return e.DEPTH_COMPONENT;if(i===Va)return e.DEPTH_STENCIL;if(i===b0)return e.RED;if(i===Xf)return e.RED_INTEGER;if(i===Ga)return e.RG;if(i===qf)return e.RG_INTEGER;if(i===Yf)return e.RGBA_INTEGER;if(i===Qc||i===jc||i===$c||i===tu)if(r===be)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Qc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===jc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===$c)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===tu)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Qc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===jc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===$c)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===tu)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Zf||i===Jf||i===Kf||i===Qf)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Zf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Jf)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Kf)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Qf)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===jf||i===$f||i===td||i===ed||i===nd||i===eu||i===id)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===jf||i===$f)return r===be?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===td)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===ed)return a.COMPRESSED_R11_EAC;if(i===nd)return a.COMPRESSED_SIGNED_R11_EAC;if(i===eu)return a.COMPRESSED_RG11_EAC;if(i===id)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===sd||i===ad||i===rd||i===od||i===ld||i===cd||i===ud||i===hd||i===fd||i===dd||i===pd||i===md||i===gd||i===_d)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===sd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ad)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===rd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===od)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ld)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===cd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ud)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===hd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===fd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===dd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===pd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===md)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===gd)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===_d)return r===be?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===vd||i===yd||i===xd)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===vd)return r===be?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===yd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===xd)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Sd||i===Md||i===nu||i===bd)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===Sd)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Md)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===nu)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===bd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===hl?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var q2=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Y2=`
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

}`,X0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new zc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new yi({vertexShader:q2,fragmentShader:Y2,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Pn(new vr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},q0=class extends fs{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,f=null,p=null,u=null,d=null,v=null,E=typeof XRWebGLBinding<"u",m=new X0,h={},g=n.getContextAttributes(),M=null,y=null,b=[],T=[],w=new re,x=null,A=null,D=new Nn;D.viewport=new qe;let R=new Nn;R.viewport=new qe;let P=[D,R],F=new Bf,U=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let et=b[Z];return et===void 0&&(et=new $o,b[Z]=et),et.getTargetRaySpace()},this.getControllerGrip=function(Z){let et=b[Z];return et===void 0&&(et=new $o,b[Z]=et),et.getGripSpace()},this.getHand=function(Z){let et=b[Z];return et===void 0&&(et=new $o,b[Z]=et),et.getHandSpace()};function X(Z){let et=T.indexOf(Z.inputSource);if(et===-1)return;let dt=b[et];dt!==void 0&&(dt.update(Z.inputSource,Z.frame,c||r),dt.dispatchEvent({type:Z.type,data:Z.inputSource}))}function Y(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",j);for(let Z=0;Z<b.length;Z++){let et=T[Z];et!==null&&(T[Z]=null,b[Z].disconnect(et))}U=null,N=null,m.reset();for(let Z in h)delete h[Z];if(t.setRenderTarget(M),d=null,u=null,p=null,s=null,y=null,Gt.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),A!==null){let Z=A.camera;Z.fov=A.fov,Z.zoom=A.zoom,Z.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){a=Z,i.isPresenting===!0&&It("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&It("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&E&&(p=new XRWebGLBinding(s,n)),p},this.getFrame=function(){return v},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(M=t.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",j),g.xrCompatible!==!0&&await n.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),E&&"createProjectionLayer"in XRWebGLBinding.prototype){let dt=null,Lt=null,at=null;g.depth&&(at=g.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,dt=g.stencil?Va:hs,Lt=g.stencil?hl:Ji);let qt={colorFormat:n.RGBA8,depthFormat:at,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(qt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new ti(u.textureWidth,u.textureHeight,{format:zi,type:ei,depthTexture:new Oa(u.textureWidth,u.textureHeight,Lt,void 0,void 0,void 0,void 0,void 0,void 0,dt),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let dt={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,n,dt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new ti(d.framebufferWidth,d.framebufferHeight,{format:zi,type:ei,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),Gt.setContext(s),Gt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function j(Z){for(let et=0;et<Z.removed.length;et++){let dt=Z.removed[et],Lt=T.indexOf(dt);Lt>=0&&(T[Lt]=null,b[Lt].disconnect(dt))}for(let et=0;et<Z.added.length;et++){let dt=Z.added[et],Lt=T.indexOf(dt);if(Lt===-1){for(let qt=0;qt<b.length;qt++)if(qt>=T.length){T.push(dt),Lt=qt;break}else if(T[qt]===null){T[qt]=dt,Lt=qt;break}if(Lt===-1)break}let at=b[Lt];at&&at.connect(dt)}}let H=new W,J=new W;function tt(Z,et,dt){H.setFromMatrixPosition(et.matrixWorld),J.setFromMatrixPosition(dt.matrixWorld);let Lt=H.distanceTo(J),at=et.projectionMatrix.elements,qt=dt.projectionMatrix.elements,Ve=at[14]/(at[10]-1),Zt=at[14]/(at[10]+1),ee=(at[9]+1)/at[5],Qt=(at[9]-1)/at[5],Ft=(at[8]-1)/at[0],de=(qt[8]+1)/qt[0],zt=Ve*Ft,Qe=Ve*de,xe=Lt/(-Ft+de),pe=xe*-Ft;if(et.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(pe),Z.translateZ(xe),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),at[10]===-1)Z.projectionMatrix.copy(et.projectionMatrix),Z.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{let O=Ve+xe,Ie=Zt+xe,ie=zt-pe,C=Qe+(Lt-pe),_=ee*Zt/Ie*O,B=Qt*Zt/Ie*O;Z.projectionMatrix.makePerspective(ie,C,_,B,O,Ie),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Mt(Z,et){et===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(et.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let et=Z.near,dt=Z.far;m.texture!==null&&(m.depthNear>0&&(et=m.depthNear),m.depthFar>0&&(dt=m.depthFar)),F.near=R.near=D.near=et,F.far=R.far=D.far=dt,(U!==F.near||N!==F.far)&&(s.updateRenderState({depthNear:F.near,depthFar:F.far}),U=F.near,N=F.far),F.layers.mask=Z.layers.mask|6,D.layers.mask=F.layers.mask&-5,R.layers.mask=F.layers.mask&-3;let Lt=Z.parent,at=F.cameras;Mt(F,Lt);for(let qt=0;qt<at.length;qt++)Mt(at[qt],Lt);at.length===2?tt(F,D,R):F.projectionMatrix.copy(D.projectionMatrix),A===null&&Z.isPerspectiveCamera&&(A={camera:Z,fov:Z.fov,zoom:Z.zoom}),vt(Z,F,Lt)};function vt(Z,et,dt){dt===null?Z.matrix.copy(et.matrixWorld):(Z.matrix.copy(dt.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(et.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(et.projectionMatrix),Z.projectionMatrixInverse.copy(et.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Ko*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(Z){l=Z,u!==null&&(u.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(F)},this.getCameraTexture=function(Z){return h[Z]};let Ot=null;function Nt(Z,et){if(f=et.getViewerPose(c||r),v=et,f!==null){let dt=f.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let Lt=!1;dt.length!==F.cameras.length&&(F.cameras.length=0,Lt=!0);for(let Zt=0;Zt<dt.length;Zt++){let ee=dt[Zt],Qt=null;if(d!==null)Qt=d.getViewport(ee);else{let de=p.getViewSubImage(u,ee);Qt=de.viewport,Zt===0&&(t.setRenderTargetTextures(y,de.colorTexture,de.depthStencilTexture),t.setRenderTarget(y))}let Ft=P[Zt];Ft===void 0&&(Ft=new Nn,Ft.layers.enable(Zt),Ft.viewport=new qe,P[Zt]=Ft),Ft.matrix.fromArray(ee.transform.matrix),Ft.matrix.decompose(Ft.position,Ft.quaternion,Ft.scale),Ft.projectionMatrix.fromArray(ee.projectionMatrix),Ft.projectionMatrixInverse.copy(Ft.projectionMatrix).invert(),Ft.viewport.set(Qt.x,Qt.y,Qt.width,Qt.height),Zt===0&&(F.matrix.copy(Ft.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Lt===!0&&F.cameras.push(Ft)}let at=s.enabledFeatures;if(at&&at.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&E){p=i.getBinding();let Zt=p.getDepthInformation(dt[0]);Zt&&Zt.isValid&&Zt.texture&&m.init(Zt,s.renderState)}if(at&&at.includes("camera-access")&&E){t.state.unbindTexture(),p=i.getBinding();for(let Zt=0;Zt<dt.length;Zt++){let ee=dt[Zt].camera;if(ee){let Qt=h[ee];Qt||(Qt=new zc,h[ee]=Qt);let Ft=p.getCameraImage(ee);Qt.sourceTexture=Ft}}}}for(let dt=0;dt<b.length;dt++){let Lt=T[dt],at=b[dt];Lt!==null&&at!==void 0&&at.update(Lt,et,c||r)}Ot&&Ot(Z,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),v=null}let Gt=new kb;Gt.setAnimationLoop(Nt),this.setAnimationLoop=function(Z){Ot=Z},this.dispose=function(){}}},Z2=new Xe,Jb=new Xt;Jb.set(-1,0,0,0,1,0,0,0,1);function J2(e,t){function n(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function i(m,h){h.color.getRGB(m.fogColor.value,C0(e)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function s(m,h,g,M,y){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?a(m,h):h.isMeshLambertMaterial?(a(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(a(m,h),p(m,h)):h.isMeshPhongMaterial?(a(m,h),f(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(a(m,h),u(m,h),h.isMeshPhysicalMaterial&&d(m,h,y)):h.isMeshMatcapMaterial?(a(m,h),v(m,h)):h.isMeshDepthMaterial?a(m,h):h.isMeshDistanceMaterial?(a(m,h),E(m,h)):h.isMeshNormalMaterial?a(m,h):h.isLineBasicMaterial?(r(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,g,M):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function a(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,n(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===wn&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,n(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===wn&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,n(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,n(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,n(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);let g=t.get(h),M=g.envMap,y=g.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(Z2.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Jb),m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,n(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,n(h.aoMap,m.aoMapTransform))}function r(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,g,M){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*g,m.scale.value=M*.5,h.map&&(m.map.value=h.map,n(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function f(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function p(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function u(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,n(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,n(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function d(m,h,g){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,n(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,n(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,n(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,n(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,n(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===wn&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.retroreflectivity>0&&(m.retroreflectivity.value=h.retroreflectivity),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,n(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,n(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,n(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,n(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,n(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,n(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,n(h.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,h){h.matcap&&(m.matcap.value=h.matcap)}function E(m,h){let g=t.get(h).light;m.referencePosition.value.setFromMatrixPosition(g.matrixWorld),m.nearDistance.value=g.shadow.camera.near,m.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function K2(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){let T=b.program;i.uniformBlockBinding(y,T)}function c(y,b){let T=s[y.id];T===void 0&&(m(y),T=f(y),s[y.id]=T,y.addEventListener("dispose",g));let w=b.program;i.updateUBOMapping(y,w);let x=t.render.frame;a[y.id]!==x&&(u(y),a[y.id]=x)}function f(y){let b=p();y.__bindingPointIndex=b;let T=e.createBuffer(),w=y.__size,x=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,T),e.bufferData(e.UNIFORM_BUFFER,w,x),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,b,T),T}function p(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return Bt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let b=s[y.id],T=y.uniforms,w=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,b);for(let x=0,A=T.length;x<A;x++){let D=T[x];if(Array.isArray(D))for(let R=0,P=D.length;R<P;R++)d(D[R],x,R,w);else d(D,x,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(y,b,T,w){if(E(y,b,T,w)===!0){let x=y.__offset,A=y.value;if(Array.isArray(A)){let D=0;for(let R=0;R<A.length;R++){let P=A[R],F=h(P);v(P,y.__data,D),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(D+=F.storage/Float32Array.BYTES_PER_ELEMENT)}}else v(A,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,x,y.__data)}}function v(y,b,T){typeof y=="number"||typeof y=="boolean"?b[0]=y:y.isMatrix3?(b[0]=y.elements[0],b[1]=y.elements[1],b[2]=y.elements[2],b[3]=0,b[4]=y.elements[3],b[5]=y.elements[4],b[6]=y.elements[5],b[7]=0,b[8]=y.elements[6],b[9]=y.elements[7],b[10]=y.elements[8],b[11]=0):ArrayBuffer.isView(y)?b.set(new y.constructor(y.buffer,y.byteOffset,b.length)):y.toArray(b,T)}function E(y,b,T,w){let x=y.value,A=b+"_"+T;if(w[A]===void 0)return typeof x=="number"||typeof x=="boolean"?w[A]=x:ArrayBuffer.isView(x)?w[A]=x.slice():w[A]=x.clone(),!0;{let D=w[A];if(typeof x=="number"||typeof x=="boolean"){if(D!==x)return w[A]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(D.equals(x)===!1)return D.copy(x),!0}}return!1}function m(y){let b=y.uniforms,T=0,w=16;for(let A=0,D=b.length;A<D;A++){let R=Array.isArray(b[A])?b[A]:[b[A]];for(let P=0,F=R.length;P<F;P++){let U=R[P],N=Array.isArray(U.value)?U.value:[U.value];for(let X=0,Y=N.length;X<Y;X++){let j=N[X],H=h(j),J=T%w,tt=J%H.boundary,Mt=J+tt;T+=tt,Mt!==0&&w-Mt<H.storage&&(T+=w-Mt),U.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=T,T+=H.storage}}}let x=T%w;return x>0&&(T+=w-x),y.__size=T,y.__cache={},this}function h(y){let b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?It("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(b.boundary=16,b.storage=y.byteLength):It("WebGLRenderer: Unsupported uniform value type.",y),b}function g(y){let b=y.target;b.removeEventListener("dispose",g);let T=r.indexOf(b.__bindingPointIndex);r.splice(T,1),e.deleteBuffer(s[b.id]),delete s[b.id],delete a[b.id]}function M(){for(let y in s)e.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:M}}var Q2=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),gs=null;function j2(){return gs===null&&(gs=new el(Q2,16,16,Ga,Qi),gs.name="DFG_LUT",gs.minFilter=un,gs.magFilter=un,gs.wrapS=us,gs.wrapT=us,gs.generateMipmaps=!1,gs.needsUpdate=!0),gs}var Ld=class{constructor(t={}){let{canvas:n=pb(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=ei}=t;this.isWebGLRenderer=!0;let v;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=i.getContextAttributes().alpha}else v=r;let E=d,m=new Set([Yf,qf,Xf]),h=new Set([ei,Ji,ul,hl,kf,Wf]),g=new Uint32Array(4),M=new Int32Array(4),y=new W,b=null,T=null,w=[],x=[],A=null;this.domElement=n,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Zi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let D=this,R=!1,P=null,F=null,U=null,N=null;this._outputColorSpace=Ln;let X=0,Y=0,j=null,H=-1,J=null,tt=new qe,Mt=new qe,vt=null,Ot=new ne(0),Nt=0,Gt=n.width,Z=n.height,et=1,dt=null,Lt=null,at=new qe(0,0,Gt,Z),qt=new qe(0,0,Gt,Z),Ve=!1,Zt=new nl,ee=!1,Qt=!1,Ft=new Xe,de=new W,zt=new qe,Qe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},xe=!1;function pe(){return j===null?et:1}let O=i;function Ie(S,L){return n.getContext(S,L)}let ie,C,_,B,G,q,ot,rt,K,Q,ut,Et,ft,lt,Dt,Tt,Pt,I,ht,$,ct,_t,st;try{let S={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"186"}`),n.addEventListener("webglcontextlost",Se,!1),n.addEventListener("webglcontextrestored",oe,!1),n.addEventListener("webglcontextcreationerror",nn,!1),O===null){let L="webgl2";if(O=Ie(L,S),O===null)throw Ie(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}bt()}catch(S){throw n.removeEventListener("webglcontextlost",Se,!1),n.removeEventListener("webglcontextrestored",oe,!1),n.removeEventListener("webglcontextcreationerror",nn,!1),Bt("WebGLRenderer: "+S.message),S}function bt(){ie=new a3(O),ie.init(),ct=new X2(O,ie),C=new JR(O,ie,t,ct),_=new k2(O,ie),C.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),F=O.createFramebuffer(),U=O.createFramebuffer(),N=O.createFramebuffer(),B=new l3(O),G=new R2,q=new W2(O,ie,_,G,C,ct,B),ot=new s3(D),rt=new uw(O),_t=new YR(O,rt),K=new r3(O,rt,B,_t),Q=new u3(O,K,rt,_t,B),I=new c3(O,C,q),Dt=new KR(G),ut=new C2(D,ot,ie,C,_t,Dt),Et=new J2(D,G),ft=new U2,lt=new B2(ie),Pt=new qR(D,ot,_,Q,v,l),Tt=new G2(D,Q,C),st=new K2(O,B,C,_),ht=new ZR(O,ie,B),$=new o3(O,ie,B),B.programs=ut.programs,D.capabilities=C,D.extensions=ie,D.properties=G,D.renderLists=ft,D.shadowMap=Tt,D.state=_,D.info=B}E!==ei&&(A=new f3(E,n.width,n.height,o,s,a));let Ct=new q0(D,O);this.xr=Ct,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let S=ie.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=ie.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(S){S!==void 0&&(et=S,this.setSize(Gt,Z,!1))},this.getSize=function(S){return S.set(Gt,Z)},this.setSize=function(S,L,k=!0){if(Ct.isPresenting){It("WebGLRenderer: Can't change size while VR device is presenting.");return}Gt=S,Z=L,n.width=Math.floor(S*et),n.height=Math.floor(L*et),k===!0&&(n.style.width=S+"px",n.style.height=L+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,S,L)},this.getDrawingBufferSize=function(S){return S.set(Gt*et,Z*et).floor()},this.setDrawingBufferSize=function(S,L,k){Gt=S,Z=L,et=k,n.width=Math.floor(S*k),n.height=Math.floor(L*k),this.setViewport(0,0,S,L)},this.setEffects=function(S){if(E===ei){Bt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let L=0;L<S.length;L++)if(S[L].isOutputPass===!0){It("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(tt)},this.getViewport=function(S){return S.copy(at)},this.setViewport=function(S,L,k,z){S.isVector4?at.set(S.x,S.y,S.z,S.w):at.set(S,L,k,z),_.viewport(tt.copy(at).multiplyScalar(et).round())},this.getScissor=function(S){return S.copy(qt)},this.setScissor=function(S,L,k,z){S.isVector4?qt.set(S.x,S.y,S.z,S.w):qt.set(S,L,k,z),_.scissor(Mt.copy(qt).multiplyScalar(et).round())},this.getScissorTest=function(){return Ve},this.setScissorTest=function(S){_.setScissorTest(Ve=S)},this.setOpaqueSort=function(S){dt=S},this.setTransparentSort=function(S){Lt=S},this.getClearColor=function(S){return S.copy(Pt.getClearColor())},this.setClearColor=function(){Pt.setClearColor(...arguments)},this.getClearAlpha=function(){return Pt.getClearAlpha()},this.setClearAlpha=function(){Pt.setClearAlpha(...arguments)},this.clear=function(S=!0,L=!0,k=!0){let z=0;if(S){let V=!1;if(j!==null){let pt=j.texture.format;V=m.has(pt)}if(V){let pt=j.texture.type,St=h.has(pt),mt=Pt.getClearColor(),At=Pt.getClearAlpha(),Rt=mt.r,kt=mt.g,Ht=mt.b;St?(g[0]=Rt,g[1]=kt,g[2]=Ht,g[3]=At,O.clearBufferuiv(O.COLOR,0,g)):(M[0]=Rt,M[1]=kt,M[2]=Ht,M[3]=At,O.clearBufferiv(O.COLOR,0,M))}else z|=O.COLOR_BUFFER_BIT}L&&(z|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),k&&(z|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&O.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),P=S},this.dispose=function(){n.removeEventListener("webglcontextlost",Se,!1),n.removeEventListener("webglcontextrestored",oe,!1),n.removeEventListener("webglcontextcreationerror",nn,!1),Pt.dispose(),ft.dispose(),lt.dispose(),G.dispose(),ot.dispose(),Q.dispose(),_t.dispose(),st.dispose(),ut.dispose(),Ct.dispose(),Ct.removeEventListener("sessionstart",Mi),Ct.removeEventListener("sessionend",Cn),je.stop()};function Se(S){S.preventDefault(),A0("WebGLRenderer: Context Lost."),R=!0}function oe(){A0("WebGLRenderer: Context Restored."),R=!1;let S=B.autoReset,L=Tt.enabled,k=Tt.autoUpdate,z=Tt.needsUpdate,V=Tt.type;bt(),B.autoReset=S,Tt.enabled=L,Tt.autoUpdate=k,Tt.needsUpdate=z,Tt.type=V}function nn(S){Bt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Si(S){let L=S.target;L.removeEventListener("dispose",Si),mn(L)}function mn(S){ru(S),G.remove(S)}function ru(S){let L=G.get(S).programs;L!==void 0&&(L.forEach(function(k){ut.releaseProgram(k)}),S.isShaderMaterial&&ut.releaseShaderCache(S))}this.renderBufferDirect=function(S,L,k,z,V,pt){L===null&&(L=Qe);let St=V.isMesh&&V.matrixWorld.determinantAffine()<0,mt=Cr(S,L,k,z,V);_.setMaterial(z,St);let At=k.index,Rt=1;if(z.wireframe===!0){if(At=K.getWireframeAttribute(k),At===void 0)return;Rt=2}let kt=k.drawRange,Ht=k.attributes.position,yt=kt.start*Rt,jt=(kt.start+kt.count)*Rt;pt!==null&&(yt=Math.max(yt,pt.start*Rt),jt=Math.min(jt,(pt.start+pt.count)*Rt)),At!==null?(yt=Math.max(yt,0),jt=Math.min(jt,At.count)):Ht!=null&&(yt=Math.max(yt,0),jt=Math.min(jt,Ht.count));let Ae=jt-yt;if(Ae<0||Ae===1/0)return;_t.setup(V,z,mt,k,At);let me,fe=ht;if(At!==null&&(me=rt.get(At),fe=$,fe.setIndex(me)),V.isMesh)z.wireframe===!0?(_.setLineWidth(z.wireframeLinewidth*pe()),fe.setMode(O.LINES)):fe.setMode(O.TRIANGLES);else if(V.isLine){let $e=z.linewidth;$e===void 0&&($e=1),_.setLineWidth($e*pe()),V.isLineSegments?fe.setMode(O.LINES):V.isLineLoop?fe.setMode(O.LINE_LOOP):fe.setMode(O.LINE_STRIP)}else V.isPoints?fe.setMode(O.POINTS):V.isSprite&&fe.setMode(O.TRIANGLES);if(V.isBatchedMesh)if(ie.get("WEBGL_multi_draw"))fe.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let $e=V._multiDrawStarts,xt=V._multiDrawCounts,sn=V._multiDrawCount,te=At?rt.get(At).bytesPerElement:1,Fn=G.get(z).currentProgram.getUniforms();for(let ii=0;ii<sn;ii++)Fn.setValue(O,"_gl_DrawID",ii),fe.render($e[ii]/te,xt[ii])}else if(V.isInstancedMesh)fe.renderInstances(yt,Ae,V.count);else if(k.isInstancedBufferGeometry){let $e=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,xt=Math.min(k.instanceCount,$e);fe.renderInstances(yt,Ae,xt)}else fe.render(yt,Ae)};function vl(S,L,k,z){P!==null&&S.isNodeMaterial&&P.setObject(z,S),ee===!0&&Dt.setState(S,k,!1),S.transparent===!0&&S.side===Fi&&S.forceSinglePass===!1?(S.side=wn,S.needsUpdate=!0,qa(S,L,z),S.side=ps,S.needsUpdate=!0,qa(S,L,z),S.side=Fi):qa(S,L,z)}this.compile=function(S,L,k=null){k===null&&(k=S),P!==null&&P.renderStart(S,L,k),T=lt.get(k),T.init(L),x.push(T),k.traverseVisible(function(V){V.isLight&&V.layers.test(L.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),S!==k&&S.traverseVisible(function(V){V.isLight&&V.layers.test(L.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),T.setupLights(),P!==null&&P.updateLights(T.state.lightsArray),Qt=this.localClippingEnabled,ee=Dt.init(this.clippingPlanes,Qt),ee===!0&&Dt.setGlobalState(this.clippingPlanes,L),P!==null&&Tt.render(T.state.shadowsArray,k,L);let z=new Set;return S.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let pt=V.material;if(pt)if(Array.isArray(pt))for(let St=0;St<pt.length;St++){let mt=pt[St];vl(mt,k,L,V),z.add(mt)}else vl(pt,k,L,V),z.add(pt)}),T=x.pop(),P!==null&&P.renderEnd(),z},this.compileAsync=function(S,L,k=null){let z=this.compile(S,L,k);return new Promise(V=>{function pt(){if(z.forEach(function(St){let At=G.get(St).currentProgram;(At===void 0||At.isReady())&&z.delete(St)}),z.size===0){V(S);return}setTimeout(pt,10)}ie.get("KHR_parallel_shader_compile")!==null?pt():setTimeout(pt,10)})};let ji=null;function Sn(S){ji&&ji(S)}function Mi(){je.stop()}function Cn(){je.start()}let je=new kb;je.setAnimationLoop(Sn),typeof self<"u"&&je.setContext(self),this.setAnimationLoop=function(S){ji=S,Ct.setAnimationLoop(S),S===null?je.stop():je.start()},Ct.addEventListener("sessionstart",Mi),Ct.addEventListener("sessionend",Cn),this.render=function(S,L){if(L!==void 0&&L.isCamera!==!0){Bt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;P!==null&&P.renderStart(S,L);let k=Ct.enabled===!0&&Ct.isPresenting===!0,z=A!==null&&(j===null||k)&&A.begin(D,j);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),Ct.enabled===!0&&Ct.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Ct.cameraAutoUpdate===!0&&Ct.updateCamera(L),L=Ct.getCamera()),S.isScene===!0&&S.onBeforeRender(D,S,L,j),T=lt.get(S,x.length),T.init(L),T.state.textureUnits=q.getTextureUnits(),x.push(T),Ft.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Zt.setFromProjectionMatrix(Ft,Yi,L.reversedDepth),Qt=this.localClippingEnabled,ee=Dt.init(this.clippingPlanes,Qt),b=ft.get(S,w.length),b.init(),w.push(b),Ct.enabled===!0&&Ct.isPresenting===!0){let St=D.xr.getDepthSensingMesh();St!==null&&vs(St,L,-1/0,D.sortObjects)}vs(S,L,0,D.sortObjects),b.finish(),P!==null&&P.updateLights(T.state.lightsArray),D.sortObjects===!0&&b.sort(dt,Lt),xe=Ct.enabled===!1||Ct.isPresenting===!1||Ct.hasDepthSensing()===!1,xe&&Pt.addToRenderList(b,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ee===!0&&Dt.beginShadows();let V=T.state.shadowsArray;if(Tt.render(V,S,L),ee===!0&&Dt.endShadows(),(z&&A.hasRenderPass())===!1){let St=b.opaque,mt=b.transmissive;if(T.setupLights(),L.isArrayCamera){let At=L.cameras;if(mt.length>0)for(let Rt=0,kt=At.length;Rt<kt;Rt++){let Ht=At[Rt];Ar(St,mt,S,Ht)}xe&&Pt.render(S);for(let Rt=0,kt=At.length;Rt<kt;Rt++){let Ht=At[Rt];js(b,S,Ht,Ht.viewport)}}else mt.length>0&&Ar(St,mt,S,L),xe&&Pt.render(S),js(b,S,L)}j!==null&&Y===0&&(q.updateMultisampleRenderTarget(j),q.updateRenderTargetMipmap(j)),z&&A.end(D),S.isScene===!0&&S.onAfterRender(D,S,L),_t.resetDefaultState(),H=-1,J=null,x.pop(),x.length>0?(T=x[x.length-1],q.setTextureUnits(T.state.textureUnits),ee===!0&&Dt.setGlobalState(D.clippingPlanes,T.state.camera)):T=null,w.pop(),w.length>0?b=w[w.length-1]:b=null,P!==null&&P.renderEnd()};function vs(S,L,k,z){if(S.visible===!1)return;if(S.layers.test(L.layers)){if(S.isGroup)k=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(L);else if(S.isLightProbeGrid)T.pushLightProbeGrid(S);else if(S.isLight)T.pushLight(S),S.castShadow&&T.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(Zt)){z&&zt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Ft);let St=Q.update(S),mt=S.material;mt.visible&&b.push(S,St,mt,k,zt.z,null,L)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(Zt))){let St=Q.update(S),mt=S.material;if(z&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),zt.copy(S.boundingSphere.center)):(St.boundingSphere===null&&St.computeBoundingSphere(),zt.copy(St.boundingSphere.center)),zt.applyMatrix4(S.matrixWorld).applyMatrix4(Ft)),Array.isArray(mt)){let At=St.groups;for(let Rt=0,kt=At.length;Rt<kt;Rt++){let Ht=At[Rt],yt=mt[Ht.materialIndex];yt&&yt.visible&&b.push(S,St,yt,k,zt.z,Ht,L)}}else mt.visible&&b.push(S,St,mt,k,zt.z,null,L)}}let pt=S.children;for(let St=0,mt=pt.length;St<mt;St++)vs(pt[St],L,k,z)}function js(S,L,k,z){let{opaque:V,transmissive:pt,transparent:St}=S;T.setupLightsView(k),ee===!0&&Dt.setGlobalState(D.clippingPlanes,k),z&&_.viewport(tt.copy(z)),V.length>0&&$s(V,L,k),pt.length>0&&$s(pt,L,k),St.length>0&&$s(St,L,k),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Ar(S,L,k,z){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[z.id]===void 0){let yt=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[z.id]=new ti(1,1,{generateMipmaps:!0,type:yt?Qi:ei,minFilter:Ha,samples:Math.max(4,C.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ce.workingColorSpace})}let pt=T.state.transmissionRenderTarget[z.id],St=z.viewport||tt;pt.setSize(St.z*D.transmissionResolutionScale,St.w*D.transmissionResolutionScale);let mt=D.getRenderTarget(),At=D.getActiveCubeFace(),Rt=D.getActiveMipmapLevel();D.setRenderTarget(pt),D.getClearColor(Ot),Nt=D.getClearAlpha(),Nt<1&&D.setClearColor(16777215,.5),D.clear(),xe&&Pt.render(k);let kt=D.toneMapping;D.toneMapping=Zi;let Ht=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),T.setupLightsView(z),ee===!0&&Dt.setGlobalState(D.clippingPlanes,z),$s(S,k,z),q.updateMultisampleRenderTarget(pt),q.updateRenderTargetMipmap(pt),ie.has("WEBGL_multisampled_render_to_texture")===!1){let yt=!1;for(let jt=0,Ae=L.length;jt<Ae;jt++){let me=L[jt],{object:fe,geometry:$e,material:xt,group:sn}=me;if(xt.side===Fi&&fe.layers.test(z.layers)){let te=xt.side;xt.side=wn,xt.needsUpdate=!0,yl(fe,k,z,$e,xt,sn),xt.side=te,xt.needsUpdate=!0,yt=!0}}yt===!0&&(q.updateMultisampleRenderTarget(pt),q.updateRenderTargetMipmap(pt))}D.setRenderTarget(mt,At,Rt),D.setClearColor(Ot,Nt),Ht!==void 0&&(z.viewport=Ht),D.toneMapping=kt}function $s(S,L,k){let z=L.isScene===!0?L.overrideMaterial:null;for(let V=0,pt=S.length;V<pt;V++){let St=S[V],{object:mt,geometry:At,group:Rt}=St,kt=St.material;kt.allowOverride===!0&&z!==null&&(kt=z),mt.layers.test(k.layers)&&yl(mt,L,k,At,kt,Rt)}}function yl(S,L,k,z,V,pt){P!==null&&V.isNodeMaterial&&P.setObject(S,V),S.onBeforeRender(D,L,k,z,V,pt),S.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),V.onBeforeRender(D,L,k,z,S,pt),V.transparent===!0&&V.side===Fi&&V.forceSinglePass===!1?(V.side=wn,V.needsUpdate=!0,D.renderBufferDirect(k,L,z,V,S,pt),V.side=ps,V.needsUpdate=!0,D.renderBufferDirect(k,L,z,V,S,pt),V.side=Fi):D.renderBufferDirect(k,L,z,V,S,pt),S.onAfterRender(D,L,k,z,V,pt)}function qa(S,L,k){L.isScene!==!0&&(L=Qe);let z=G.get(S),V=T.state.lights,pt=T.state.shadowsArray,St=V.state.version,mt=ut.getParameters(S,V.state,pt,L,k,T.state.lightProbeGridArray),At=ut.getProgramCacheKey(mt),Rt=z.programs;z.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?L.environment:null,z.fog=L.fog;let kt=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;z.envMap=ot.get(S.envMap||z.environment,kt),z.envMapRotation=z.environment!==null&&S.envMap===null?L.environmentRotation:S.envMapRotation,Rt===void 0&&(S.addEventListener("dispose",Si),Rt=new Map,z.programs=Rt);let Ht=Rt.get(At);if(Ht!==void 0){if(z.currentProgram===Ht&&z.lightsStateVersion===St)return wr(S,mt),Ht}else mt.uniforms=ut.getUniforms(S),P!==null&&S.isNodeMaterial&&P.build(S,k,mt),S.onBeforeCompile(mt,D),Ht=ut.acquireProgram(mt,At),Rt.set(At,Ht),z.uniforms=mt.uniforms;let yt=z.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(yt.clippingPlanes=Dt.uniform),wr(S,mt),z.needsLights=lu(S),z.lightsStateVersion=St,z.needsLights&&(yt.ambientLightColor.value=V.state.ambient,yt.lightProbe.value=V.state.probe,yt.sunLights.value=V.state.sun,yt.sunLightShadows.value=V.state.sunShadow,yt.directionalLights.value=V.state.directional,yt.directionalLightShadows.value=V.state.directionalShadow,yt.spotLights.value=V.state.spot,yt.spotLightShadows.value=V.state.spotShadow,yt.rectAreaLights.value=V.state.rectArea,yt.ltc_1.value=V.state.rectAreaLTC1,yt.ltc_2.value=V.state.rectAreaLTC2,yt.pointLights.value=V.state.point,yt.pointLightShadows.value=V.state.pointShadow,yt.hemisphereLights.value=V.state.hemi,yt.sunShadowMatrix.value=V.state.sunShadowMatrix,yt.sunShadowCascade.value=V.state.sunShadowCascade,yt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,yt.spotLightMatrix.value=V.state.spotLightMatrix,yt.spotLightMap.value=V.state.spotLightMap,yt.pointShadowMatrix.value=V.state.pointShadowMatrix),z.lightProbeGrid=T.state.lightProbeGridArray.length>0,z.currentProgram=Ht,z.uniformsList=null,Ht}function ys(S){if(S.uniformsList===null){let L=S.currentProgram.getUniforms();S.uniformsList=ml.seqWithValue(L.seq,S.uniforms)}return S.uniformsList}function wr(S,L){let k=G.get(S);k.outputColorSpace=L.outputColorSpace,k.batching=L.batching,k.batchingColor=L.batchingColor,k.instancing=L.instancing,k.instancingColor=L.instancingColor,k.instancingMorph=L.instancingMorph,k.skinning=L.skinning,k.morphTargets=L.morphTargets,k.morphNormals=L.morphNormals,k.morphColors=L.morphColors,k.morphTargetsCount=L.morphTargetsCount,k.numClippingPlanes=L.numClippingPlanes,k.numIntersection=L.numClipIntersection,k.vertexAlphas=L.vertexAlphas,k.vertexTangents=L.vertexTangents,k.toneMapping=L.toneMapping}function xs(S,L){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;y.setFromMatrixPosition(L.matrixWorld);for(let k=0,z=S.length;k<z;k++){let V=S[k];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Cr(S,L,k,z,V){L.isScene!==!0&&(L=Qe),q.resetTextureUnits();let pt=L.fog,St=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?L.environment:null,mt=j===null?D.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:ce.workingColorSpace,At=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Rt=ot.get(z.envMap||St,At),kt=z.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ht=!!k.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),yt=!!k.morphAttributes.position,jt=!!k.morphAttributes.normal,Ae=!!k.morphAttributes.color,me=Zi;z.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(me=D.toneMapping);let fe=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,$e=fe!==void 0?fe.length:0,xt=G.get(z),sn=T.state.lights;if(ee===!0&&(Qt===!0||S!==J)){let Me=S===J&&z.id===H;Dt.setState(z,S,Me)}let te=!1;z.version===xt.__version?(xt.needsLights&&xt.lightsStateVersion!==sn.state.version||xt.outputColorSpace!==mt||V.isBatchedMesh&&xt.batching===!1||!V.isBatchedMesh&&xt.batching===!0||V.isBatchedMesh&&xt.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&xt.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&xt.instancing===!1||!V.isInstancedMesh&&xt.instancing===!0||V.isSkinnedMesh&&xt.skinning===!1||!V.isSkinnedMesh&&xt.skinning===!0||V.isInstancedMesh&&xt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&xt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&xt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&xt.instancingMorph===!1&&V.morphTexture!==null||xt.envMap!==Rt||z.fog===!0&&xt.fog!==pt||xt.numClippingPlanes!==void 0&&(xt.numClippingPlanes!==Dt.numPlanes||xt.numIntersection!==Dt.numIntersection)||xt.vertexAlphas!==kt||xt.vertexTangents!==Ht||xt.morphTargets!==yt||xt.morphNormals!==jt||xt.morphColors!==Ae||xt.toneMapping!==me||xt.morphTargetsCount!==$e||!!xt.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(te=!0):(te=!0,xt.__version=z.version);let Fn=xt.currentProgram;te===!0&&(Fn=qa(z,L,V),P&&z.isNodeMaterial&&P.onUpdateProgram(z,Fn,xt));let ii=!1,si=!1,ai=!1,ge=Fn.getUniforms(),Ge=xt.uniforms;if(_.useProgram(Fn.program)&&(ii=!0,si=!0,ai=!0),z.id!==H&&(H=z.id,si=!0),xt.needsLights){let Me=xs(T.state.lightProbeGridArray,V);xt.lightProbeGrid!==Me&&(xt.lightProbeGrid=Me,si=!0)}if(ii||J!==S){_.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ge.setValue(O,"projectionMatrix",S.projectionMatrix),ge.setValue(O,"viewMatrix",S.matrixWorldInverse);let Hi=ge.map.cameraPosition;Hi!==void 0&&Hi.setValue(O,de.setFromMatrixPosition(S.matrixWorld)),C.logarithmicDepthBuffer&&ge.setValue(O,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ge.setValue(O,"isOrthographic",S.isOrthographicCamera===!0),J!==S&&(J=S,si=!0,ai=!0)}if(xt.needsLights&&(sn.state.sunShadowMap.length>0&&ge.setValue(O,"sunShadowMap",sn.state.sunShadowMap,q),sn.state.directionalShadowMap.length>0&&ge.setValue(O,"directionalShadowMap",sn.state.directionalShadowMap,q),sn.state.spotShadowMap.length>0&&ge.setValue(O,"spotShadowMap",sn.state.spotShadowMap,q),sn.state.pointShadowMap.length>0&&ge.setValue(O,"pointShadowMap",sn.state.pointShadowMap,q)),V.isSkinnedMesh){ge.setOptional(O,V,"bindMatrix"),ge.setOptional(O,V,"bindMatrixInverse");let Me=V.skeleton;Me&&(Me.boneTexture===null&&Me.computeBoneTexture(),ge.setValue(O,"boneTexture",Me.boneTexture,q))}V.isBatchedMesh&&(ge.setOptional(O,V,"batchingTexture"),ge.setValue(O,"batchingTexture",V._matricesTexture,q),ge.setOptional(O,V,"batchingIdTexture"),ge.setValue(O,"batchingIdTexture",V._indirectTexture,q),ge.setOptional(O,V,"batchingColorTexture"),V._colorsTexture!==null&&ge.setValue(O,"batchingColorTexture",V._colorsTexture,q));let Xn=k.morphAttributes;if((Xn.position!==void 0||Xn.normal!==void 0||Xn.color!==void 0)&&I.update(V,k,Fn),(si||xt.receiveShadow!==V.receiveShadow)&&(xt.receiveShadow=V.receiveShadow,ge.setValue(O,"receiveShadow",V.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&L.environment!==null&&(Ge.envMapIntensity.value=L.environmentIntensity),Ge.dfgLUT!==void 0&&(Ge.dfgLUT.value=j2()),si){if(ge.setValue(O,"toneMappingExposure",D.toneMappingExposure),xt.needsLights&&ou(Ge,ai),pt&&z.fog===!0&&Et.refreshFogUniforms(Ge,pt),Et.refreshMaterialUniforms(Ge,z,et,Z,T.state.transmissionRenderTarget[S.id]),xt.needsLights&&xt.lightProbeGrid){let Me=xt.lightProbeGrid;Ge.probesSH.value=Me.texture,Ge.probesMin.value.copy(Me.boundingBox.min),Ge.probesMax.value.copy(Me.boundingBox.max),Ge.probesResolution.value.copy(Me.resolution)}ml.upload(O,ys(xt),Ge,q)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(ml.upload(O,ys(xt),Ge,q),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ge.setValue(O,"center",V.center),ge.setValue(O,"modelViewMatrix",V.modelViewMatrix),ge.setValue(O,"normalMatrix",V.normalMatrix),ge.setValue(O,"modelMatrix",V.matrixWorld),z.uniformsGroups!==void 0){let Me=z.uniformsGroups;for(let Hi=0,ta=Me.length;Hi<ta;Hi++){let Sl=Me[Hi];st.update(Sl,Fn),st.bind(Sl,Fn)}}return Fn}function ou(S,L){S.ambientLightColor.needsUpdate=L,S.lightProbe.needsUpdate=L,S.sunLights.needsUpdate=L,S.sunLightShadows.needsUpdate=L,S.directionalLights.needsUpdate=L,S.directionalLightShadows.needsUpdate=L,S.pointLights.needsUpdate=L,S.pointLightShadows.needsUpdate=L,S.spotLights.needsUpdate=L,S.spotLightShadows.needsUpdate=L,S.rectAreaLights.needsUpdate=L,S.hemisphereLights.needsUpdate=L}function lu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(S,L,k){let z=G.get(S);z.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),G.get(S.texture).__webglTexture=L,G.get(S.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:k,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,L){let k=G.get(S);k.__webglFramebuffer=L,k.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(S,L=0,k=0){j=S,X=L,Y=k;let z=null,V=!1,pt=!1;if(S){let mt=G.get(S);if(mt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(O.FRAMEBUFFER,mt.__webglFramebuffer),tt.copy(S.viewport),Mt.copy(S.scissor),vt=S.scissorTest,_.viewport(tt),_.scissor(Mt),_.setScissorTest(vt),H=-1;return}else if(mt.__webglFramebuffer===void 0)q.setupRenderTarget(S);else if(mt.__hasExternalTextures)q.rebindTextures(S,G.get(S.texture).__webglTexture,G.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let kt=S.depthTexture;if(mt.__boundDepthTexture!==kt){if(kt!==null&&G.has(kt)&&(S.width!==kt.image.width||S.height!==kt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");q.setupDepthRenderbuffer(S)}}let At=S.texture;(At.isData3DTexture||At.isDataArrayTexture||At.isCompressedArrayTexture)&&(pt=!0);let Rt=G.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Rt[L])?z=Rt[L][k]:z=Rt[L],V=!0):S.samples>0&&q.useMultisampledRTT(S)===!1?z=G.get(S).__webglMultisampledFramebuffer:Array.isArray(Rt)?z=Rt[k]:z=Rt,tt.copy(S.viewport),Mt.copy(S.scissor),vt=S.scissorTest}else tt.copy(at).multiplyScalar(et).floor(),Mt.copy(qt).multiplyScalar(et).floor(),vt=Ve;if(k!==0&&(z=F),_.bindFramebuffer(O.FRAMEBUFFER,z)&&_.drawBuffers(S,z),_.viewport(tt),_.scissor(Mt),_.setScissorTest(vt),V){let mt=G.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+L,mt.__webglTexture,k)}else if(pt){let mt=L;for(let At=0;At<S.textures.length;At++){let Rt=G.get(S.textures[At]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+At,Rt.__webglTexture,k,mt)}}else if(S!==null&&k!==0){let mt=G.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,mt.__webglTexture,k)}H=-1};function xl(S){let L=G.get(S);return(L.__readFormat!==S.format||L.__readType!==S.type)&&(L.__readFormat=S.format,L.__readType=S.type,L.__formatReadable=C.textureFormatReadable(S.format),L.__typeReadable=C.textureTypeReadable(S.type)),L}this.readRenderTargetPixels=function(S,L,k,z,V,pt,St,mt=0){if(!(S&&S.isWebGLRenderTarget)){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let At=G.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&St!==void 0&&(At=At[St]),At){_.bindFramebuffer(O.FRAMEBUFFER,At);try{let Rt=S.textures[mt],kt=Rt.format,Ht=Rt.type;S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+mt);let yt=xl(Rt);if(yt.__formatReadable===!1){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(yt.__typeReadable===!1){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=S.width-z&&k>=0&&k<=S.height-V&&O.readPixels(L,k,z,V,ct.convert(kt),ct.convert(Ht),pt)}finally{let Rt=j!==null?G.get(j).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,Rt)}}},this.readRenderTargetPixelsAsync=async function(S,L,k,z,V,pt,St,mt=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let At=G.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&St!==void 0&&(At=At[St]),At)if(L>=0&&L<=S.width-z&&k>=0&&k<=S.height-V){_.bindFramebuffer(O.FRAMEBUFFER,At);let Rt=S.textures[mt],kt=Rt.format,Ht=Rt.type;S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+mt);let yt=xl(Rt);if(yt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(yt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let jt=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,jt),O.bufferData(O.PIXEL_PACK_BUFFER,pt.byteLength,O.STREAM_READ),O.readPixels(L,k,z,V,ct.convert(kt),ct.convert(Ht),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let Ae=j!==null?G.get(j).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,Ae);let me=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await gb(O,me,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,jt),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,pt),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(jt),O.deleteSync(me),pt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,L=null,k=0){let z=Math.pow(2,-k),V=Math.floor(S.image.width*z),pt=Math.floor(S.image.height*z),St=L!==null?L.x:0,mt=L!==null?L.y:0;q.setTexture2D(S,0),O.copyTexSubImage2D(O.TEXTURE_2D,k,0,0,St,mt,V,pt),_.unbindTexture()},this.copyTextureToTexture=function(S,L,k=null,z=null,V=0,pt=0){let St,mt,At,Rt,kt,Ht,yt,jt,Ae,me=S.isCompressedTexture?S.mipmaps[pt]:S.image;if(k!==null)St=k.max.x-k.min.x,mt=k.max.y-k.min.y,At=k.isBox3?k.max.z-k.min.z:1,Rt=k.min.x,kt=k.min.y,Ht=k.isBox3?k.min.z:0;else{let Ge=Math.pow(2,-V);St=Math.floor(me.width*Ge),mt=Math.floor(me.height*Ge),S.isDataArrayTexture?At=me.depth:S.isData3DTexture?At=Math.floor(me.depth*Ge):At=1,Rt=0,kt=0,Ht=0}z!==null?(yt=z.x,jt=z.y,Ae=z.z):(yt=0,jt=0,Ae=0);let fe=ct.convert(L.format),$e=ct.convert(L.type),xt;L.isData3DTexture?(q.setTexture3D(L,0),xt=O.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(q.setTexture2DArray(L,0),xt=O.TEXTURE_2D_ARRAY):(q.setTexture2D(L,0),xt=O.TEXTURE_2D),_.activeTexture(O.TEXTURE0),_.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,L.flipY),_.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),_.pixelStorei(O.UNPACK_ALIGNMENT,L.unpackAlignment);let sn=_.getParameter(O.UNPACK_ROW_LENGTH),te=_.getParameter(O.UNPACK_IMAGE_HEIGHT),Fn=_.getParameter(O.UNPACK_SKIP_PIXELS),ii=_.getParameter(O.UNPACK_SKIP_ROWS),si=_.getParameter(O.UNPACK_SKIP_IMAGES);_.pixelStorei(O.UNPACK_ROW_LENGTH,me.width),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,me.height),_.pixelStorei(O.UNPACK_SKIP_PIXELS,Rt),_.pixelStorei(O.UNPACK_SKIP_ROWS,kt),_.pixelStorei(O.UNPACK_SKIP_IMAGES,Ht);let ai=S.isDataArrayTexture||S.isData3DTexture,ge=L.isDataArrayTexture||L.isData3DTexture;if(S.isDepthTexture){let Ge=G.get(S),Xn=G.get(L),Me=G.get(Ge.__renderTarget),Hi=G.get(Xn.__renderTarget);_.bindFramebuffer(O.READ_FRAMEBUFFER,Me.__webglFramebuffer),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,Hi.__webglFramebuffer);for(let ta=0;ta<At;ta++)ai&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,G.get(S).__webglTexture,V,Ht+ta),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,G.get(L).__webglTexture,pt,Ae+ta)),O.blitFramebuffer(Rt,kt,St,mt,yt,jt,St,mt,O.DEPTH_BUFFER_BIT,O.NEAREST);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(V!==0||S.isRenderTargetTexture||G.has(S)){let Ge=G.get(S),Xn=G.get(L);_.bindFramebuffer(O.READ_FRAMEBUFFER,U),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,N);for(let Me=0;Me<At;Me++)ai?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ge.__webglTexture,V,Ht+Me):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ge.__webglTexture,V),ge?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Xn.__webglTexture,pt,Ae+Me):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Xn.__webglTexture,pt),V!==0?O.blitFramebuffer(Rt,kt,St,mt,yt,jt,St,mt,O.COLOR_BUFFER_BIT,O.NEAREST):ge?O.copyTexSubImage3D(xt,pt,yt,jt,Ae+Me,Rt,kt,St,mt):O.copyTexSubImage2D(xt,pt,yt,jt,Rt,kt,St,mt);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else ge?S.isDataTexture||S.isData3DTexture?O.texSubImage3D(xt,pt,yt,jt,Ae,St,mt,At,fe,$e,me.data):L.isCompressedArrayTexture?O.compressedTexSubImage3D(xt,pt,yt,jt,Ae,St,mt,At,fe,me.data):O.texSubImage3D(xt,pt,yt,jt,Ae,St,mt,At,fe,$e,me):S.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,pt,yt,jt,St,mt,fe,$e,me.data):S.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,pt,yt,jt,me.width,me.height,fe,me.data):O.texSubImage2D(O.TEXTURE_2D,pt,yt,jt,St,mt,fe,$e,me);_.pixelStorei(O.UNPACK_ROW_LENGTH,sn),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,te),_.pixelStorei(O.UNPACK_SKIP_PIXELS,Fn),_.pixelStorei(O.UNPACK_SKIP_ROWS,ii),_.pixelStorei(O.UNPACK_SKIP_IMAGES,si),pt===0&&L.generateMipmaps&&O.generateMipmap(xt),_.unbindTexture()},this.initRenderTarget=function(S){G.get(S).__webglFramebuffer===void 0&&q.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?q.setTextureCube(S,0):S.isData3DTexture?q.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?q.setTexture2DArray(S,0):q.setTexture2D(S,0),_.unbindTexture()},this.resetState=function(){X=0,Y=0,j=null,_.reset(),_t.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=ce._getDrawingBufferColorSpace(t),n.unpackColorSpace=ce._getUnpackColorSpace()}};var Wa=ts(br()),_l=(e=0)=>({value:e,target:e,velocity:0}),Ye=(e,t,n)=>Math.min(n,Math.max(t,e)),He=(e,t)=>Number.isFinite(e)?e:t;function Y0(e,t,n,i){if(i||n<=0)return e.value=e.target,e.velocity=0,!1;let s=8/Math.max(.06,n),a=e.value-e.target,r=e.velocity+s*a,o=Math.exp(-s*t);return e.value=e.target+(a+r*t)*o,e.velocity=(e.velocity-s*r*t)*o,Math.abs(e.value-e.target)<1e-4&&Math.abs(e.velocity)<.001?(e.value=e.target,e.velocity=0,!1):!0}function $b(e){let t=e|0;return()=>{t|=0,t=t+1831565813|0;let n=Math.imul(t^t>>>15,1|t);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}function nD(e,t,n,i,s,a,r){let o=e.length/3,l=Float64Array.from(e),c=Float64Array.from(e),f=Float64Array.from(e),p=[],u=[],d=new Map,v=$b(r),E=Array.from({length:i},()=>{let R=v()*Math.PI*2;return{x:Math.cos(R),y:Math.sin(R),phase:v()*Math.PI*2,weight:v()*.6+.4}});for(let R=0;R<t.length;R+=3)for(let P=0;P<3;P++){let F=t[R+P],U=t[R+(P+1)%3],N=t[R+(P+2)%3],X=Math.min(F,U)*o+Math.max(F,U),Y=d.get(X);if(Y){let j=Y.opposite*3,H=N*3,J=Math.hypot(e[j]-e[H],e[j+1]-e[H+1]),tt=(e[j]+e[H])*.5,Mt=(e[j+1]+e[H+1])*.5,vt=0;for(let Ot of E){let Nt=Math.abs(Math.sin((tt*Ot.x+Mt*Ot.y)/n*4+Ot.phase));vt=Math.max(vt,Math.exp(-Nt*Nt*80)*Ot.weight)}u.push(j,H,J,.12+(1-vt)*.75)}else{d.set(X,{a:F,b:U,opposite:N});let j=Math.hypot(e[F*3]-e[U*3],e[F*3+1]-e[U*3+1]);p.push(F*3,U*3,j)}}let m=Math.sqrt(n*n/o),h=n*.008,g=[e.slice()],M=64,y=3,b=M*y,T=0;for(let R=0;R<e.length;R+=3)T=Math.max(T,Math.hypot(e[R]/.94,e[R+1]/1.02));T*=1.02;function w(R,P,F,U){for(let N=0;N<R.length;N+=P){let X=U?R.length-P-N:N,Y=R[X],j=R[X+1],H=l[j]-l[Y],J=l[j+1]-l[Y+1],tt=l[j+2]-l[Y+2],Mt=Math.sqrt(H*H+J*J+tt*tt);if(Mt<1e-6)continue;let vt=P===4?R[X+3]:1,Ot=(1-R[X+2]/Mt)*.5*F*vt;l[Y]+=H*Ot,l[j]-=H*Ot,l[Y+1]+=J*Ot,l[j+1]-=J*Ot,l[Y+2]+=tt*Ot,l[j+2]-=tt*Ot}}function x(){let R=h*2;for(let P=0;P<t.length;P+=3){let F=t[P]*3,U=t[P+1]*3,N=t[P+2]*3,X=l[F],Y=l[F+1],j=l[F+2],H=l[U]-X,J=l[U+1]-Y,tt=l[U+2]-j,Mt=l[N]-X,vt=l[N+1]-Y,Ot=l[N+2]-j,Nt=J*Ot-tt*vt,Gt=tt*Mt-H*Ot,Z=H*vt-J*Mt,et=Math.hypot(Nt,Gt,Z);if(et<1e-7)continue;Nt/=et,Gt/=et,Z/=et;let dt=Math.min(X,l[U],l[N])-R,Lt=Math.max(X,l[U],l[N])+R,at=Math.min(Y,l[U+1],l[N+1])-R,qt=Math.max(Y,l[U+1],l[N+1])+R,Ve=Math.min(j,l[U+2],l[N+2])-R,Zt=Math.max(j,l[U+2],l[N+2])+R,ee=H*H+J*J+tt*tt,Qt=Mt*Mt+vt*vt+Ot*Ot,Ft=H*Mt+J*vt+tt*Ot,de=ee*Qt-Ft*Ft;if(!(de<1e-10))for(let zt=0;zt<l.length;zt+=3){if(zt===F||zt===U||zt===N||l[zt]<dt||l[zt]>Lt||l[zt+1]<at||l[zt+1]>qt||l[zt+2]<Ve||l[zt+2]>Zt)continue;let Qe=e[zt]-(e[F]+e[U]+e[N])/3,xe=e[zt+1]-(e[F+1]+e[U+1]+e[N+1])/3;if(Qe*Qe+xe*xe<m*m*6)continue;let pe=l[zt]-X,O=l[zt+1]-Y,Ie=l[zt+2]-j,ie=pe*Nt+O*Gt+Ie*Z,_=(f[zt]-f[F])*Nt+(f[zt+1]-f[F+1])*Gt+(f[zt+2]-f[F+2])*Z>=0?1:-1;if(ie*_>=h||Math.abs(ie)>R)continue;let B=pe*H+O*J+Ie*tt,G=pe*Mt+O*vt+Ie*Ot,q=(Qt*B-Ft*G)/de,ot=(ee*G-Ft*B)/de;if(q<0||ot<0||q+ot>1)continue;let rt=1-q-ot,K=(h*_-ie)/(1+rt*rt+q*q+ot*ot);for(let Q=0;Q<3;Q++){let Et=(Q===0?Nt:Q===1?Gt:Z)*K;l[zt+Q]+=Et,l[F+Q]-=Et*rt,l[U+Q]-=Et*q,l[N+Q]-=Et*ot}}}}for(let R=1;R<=b;R++){let P=R/b,F=P*P*(3-2*P),U=T*(1-F)+n*(.19-a*.025)*F;f.set(l);for(let N=0;N<l.length;N+=3){let X=e[N]/n,Y=e[N+1]/n,j=0;for(let H of E)j+=Math.sin((X*H.x+Y*H.y)*5+H.phase)*H.weight;for(let H=0;H<3;H++){let J=(l[N+H]-c[N+H])*.55;c[N+H]=l[N+H],l[N+H]+=Ye(J,-m*.15,m*.15)}l[N+2]+=j/i*n*7e-4*Math.sin(P*Math.PI)}for(let N=0;N<18;N++){w(u,4,.45*(1-s*.4),N%2===0);for(let X=0;X<l.length;X+=3){let Y=l[X]/.94,j=l[X+1]/1.02,H=l[X+2]/.86,J=Math.hypot(Y,j,H);if(J>U){let tt=(1-U/J)*.55;l[X]-=l[X]*tt,l[X+1]-=l[X+1]*tt,l[X+2]-=l[X+2]*tt}}w(p,3,1,N%2!==0),(N===8||N===17)&&x()}for(let N=0;N<u.length;N+=4){let X=u[N],Y=u[N+1],j=Math.hypot(l[X]-l[Y],l[X+1]-l[Y+1],l[X+2]-l[Y+2]);j<u[N+2]*.86&&(u[N+2]+=(j-u[N+2])*.12)}R%y===0&&g.push(Float32Array.from(l))}let A=Float64Array.from(l);for(let R=1;R<=80;R++){let P=R/80,F=P*P*(3-2*P);for(let U=0;U<12;U++){for(let N=0;N<l.length;N++){let X=A[N]+(e[N]-A[N])*F;l[N]+=(X-l[N])*(N%3===2?.04:.22)}w(u,4,.7,U%2===0),w(p,3,1,U%2!==0)}}let D=Float32Array.from(l);return{samples:g,creased:D}}var iD=({src:e,alt:t="Crumplable image",backSrc:n="",width:i=320,height:s=400,sceneHeight:a=560,imageFit:r="cover",releaseBehavior:o="restore",crumpleAmount:l=.85,crumpleDuration:c=.55,releaseDuration:f=.4,foldCount:p=6,foldSharpness:u=.6,wrinkleDepth:d=.65,creaseStrength:v=.18,paperColor:E="#f4f0e8",roughness:m=.92,paperTexture:h=.08,lightIntensity:g=1.8,lightAngle:M=-35,shadow:y=!0,shadowOpacity:b=.08,draggable:T=!0,dragRotation:w=10,dragRadius:x=180,returnToOrigin:A=!0,rotation:D=0,seed:R=7,detail:P=64,disabled:F=!1,resetKey:U=0,onStateChange:N,onError:X,className:Y="",style:j})=>{let H=(0,ni.useRef)(null),J=(0,ni.useRef)(null),tt=(0,ni.useRef)(null),Mt=(0,ni.useRef)(null),vt=(0,ni.useRef)(null),Ot=(0,ni.useRef)(null),[Nt,Gt]=(0,ni.useState)("loading"),Z=(0,ni.useRef)({releaseBehavior:o,crumpleAmount:l,crumpleDuration:c,releaseDuration:f,creaseStrength:v,draggable:T,dragRotation:w,dragRadius:x,returnToOrigin:A,disabled:F,onStateChange:N,onError:X});Z.current={releaseBehavior:o,crumpleAmount:l,crumpleDuration:c,releaseDuration:f,creaseStrength:v,draggable:T,dragRotation:w,dragRadius:x,returnToOrigin:A,disabled:F,onStateChange:N,onError:X},(0,ni.useEffect)(()=>{let dt=J.current,Lt=tt.current,at=Mt.current;if(!dt||!Lt||!at)return;Gt("loading"),at.disabled=!0,at.dataset.held="false",at.setAttribute("aria-pressed","false");let qt=dt.getBoundingClientRect(),Ve=Math.max(1,He(i,320)),Zt=Math.max(1,He(s,400)),ee=Math.min(1,Math.max(1,qt.width-48)/Ve,Math.max(1,qt.height-48)/Zt);dt.style.setProperty("--pc-image-width",`${Ve*ee}px`),dt.style.setProperty("--pc-image-height",`${Zt*ee}px`);let Qt;try{Qt=new Ld({canvas:Lt,alpha:!0,antialias:!0,powerPreference:"low-power"})}catch(it){Gt("error"),Z.current.onError?.(it instanceof Error?it:new Error("WebGL is unavailable."));return}let Ft=Math.max(1,He(i,320)),de=Math.max(1,He(s,400)),zt=de/Ft,Qe=Math.min(1,zt),xe=Math.round(Ye(He(P,64)/4,8,24)),pe=Math.max(8,Math.round(xe/Math.max(1,zt))),O=Math.max(8,Math.round(xe*Math.min(1,zt))),Ie=$b(He(R,7)),ie=Ye(He(u,.6),0,1),C=Math.round(Ye(He(p,6),3,16)),_=Ye(He(d,.65),0,2),B=(pe+1)*(O+1),G=new Float32Array(B*3),q=new Float32Array(B*3),ot=new Float32Array(B*2),rt=[];for(let it=0;it<=O;it++)for(let wt=0;wt<=pe;wt++){let Kt=it*(pe+1)+wt,Wt=(wt+(wt>0&&wt<pe?(Ie()-.5)*.5:0))/pe,Ue=(it+(it>0&&it<O?(Ie()-.5)*.5:0))/O,_e=Wt-.5,we=(Ue-.5)*zt;if(G[Kt*3]=_e,G[Kt*3+1]=we,ot[Kt*2]=Wt,ot[Kt*2+1]=Ue,wt<pe&&it<O){let Ut=Kt,Ze=Kt+1,zn=Kt+pe+1,qn=zn+1;Ie()>.5?rt.push(Ut,Ze,qn,Ut,qn,zn):rt.push(Ut,Ze,zn,Ze,qn,zn)}}let K=JSON.stringify([Ft,de,xe,C,ie,_,R]);H.current?.key!==K&&(H.current={key:K,value:nD(G,rt,Qe,C,ie,_,He(R,7))});let Q=H.current.value,ut=new Float32Array(rt.length*3),Et=new Float32Array(rt.length*3),ft=new Float32Array(rt.length*2),lt=new Float32Array(rt.length),Dt=Array.from({length:B},()=>[]);for(let it=0;it<rt.length;it++)ft[it*2]=ot[rt[it]*2],ft[it*2+1]=ot[rt[it]*2+1],Dt[rt[it]].push(Math.floor(it/3)*3);let Tt=new Bi;Tt.setAttribute("position",new In(ut,3).setUsage(wd)),Tt.setAttribute("normal",new In(Et,3).setUsage(wd)),Tt.setAttribute("uv",new In(ft,2));let Pt=new Uint8Array(16384*4);for(let it=0;it<Pt.length;it+=4){let wt=100+Math.floor(Ie()*155);Pt[it]=Pt[it+1]=Pt[it+2]=wt,Pt[it+3]=255}let I=new el(Pt,128,128);I.wrapS=I.wrapT=qo,I.repeat.set(5,5*zt),I.magFilter=un,I.minFilter=un,I.needsUpdate=!0;let ht={roughness:Ye(He(m,.92),0,1),metalness:0,bumpMap:I,bumpScale:Ye(He(h,.08),0,1)*.32,alphaTest:.04,alphaToCoverage:!0,flatShading:!1},$=new sl({...ht,side:ps}),ct=new sl({...ht,side:wn,color:n?"#ffffff":E}),_t={value:0};for(let it of[$,ct])it.onBeforeCompile=wt=>{wt.uniforms.paperLighting=_t,wt.fragmentShader=`uniform float paperLighting;
`+wt.fragmentShader,wt.fragmentShader=wt.fragmentShader.replace("#include <map_fragment>",`
          #include <map_fragment>
          #ifdef USE_MAP
            if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) discard;
            ${it===ct&&!n?"diffuseColor.rgb = diffuse;":""}
          #endif
        `),wt.fragmentShader=wt.fragmentShader.replace("#include <opaque_fragment>",`
          outgoingLight = mix(diffuseColor.rgb, outgoingLight, paperLighting);
          #include <opaque_fragment>
        `)},it.customProgramCacheKey=()=>`paper-${it===ct&&!n?"stock":"print"}`;let st=new al({depthPacking:E0,alphaTest:.04,side:Fi});st.onBeforeCompile=it=>{it.fragmentShader=it.fragmentShader.replace("#include <map_fragment>",`
        #include <map_fragment>
        #ifdef USE_MAP
          if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) discard;
        #endif
      `)};let bt=new Ys,Ct=new Pn(Tt,$),Se=new Pn(Tt,ct);Ct.castShadow=y,Ct.receiveShadow=y,Se.receiveShadow=y,Ct.customDepthMaterial=st,bt.add(Ct,Se);let oe=new Nc;oe.add(bt);let nn=new Nn(35,1,.1,1e4),Si=new Wc(16777215,10789040,1.35);oe.add(Si);let mn=new qc(16775920,Math.max(0,He(g,1.8)));mn.castShadow=y,mn.shadow.mapSize.set(1024,1024),mn.shadow.bias=-2e-4,mn.shadow.normalBias=.6,mn.shadow.radius=3,oe.add(mn,mn.target);let ru=new vr(1,1),vl=new Hc({opacity:Ye(He(b,.08),0,1),depthWrite:!1}),ji=new Pn(ru,vl);ji.receiveShadow=!0,ji.visible=y,oe.add(ji),Qt.setClearColor(0,0),Qt.outputColorSpace=Ln,Qt.shadowMap.enabled=y,Qt.shadowMap.type=Ff;let Sn=_l(),Mi=_l(),Cn=_l(),je=_l(),vs=_l(),js=_l(),Ar=[Sn,Mi,Cn,je,vs,js],$s=new Yc,yl=new re,qa=new vi(new W(0,0,1),0),ys=new W,wr=new W,xs=new W,Cr=new W,ou=new W,lu=new W,xl=new W(1,0,0),S=[Math.floor(B/2),0,0],L=1,k=1,z=Ft,V=0,pt=0,St=0,mt=0,At=0,Rt=0,kt=0,Ht=!1,yt=!1,jt=null,Ae=0,me=!1,fe=!1,$e=!0,xt=!1,sn=0,te=0,Fn="flat",ii=new Set,si=window.matchMedia("(prefers-reduced-motion: reduce)"),ai=si.matches,ge=-1,Ge=-1,Xn=ka.degToRad(He(D,0));function Me(it){it!==Fn&&(Fn=it,Z.current.onStateChange?.(it))}function Hi(){if(Sn.value===ge&&Mi.value===Ge)return;ge=Sn.value,Ge=Mi.value;let it=Ye(Sn.value,0,1),wt=it*(Q.samples.length-1),Kt=Math.floor(wt),Wt=Math.min(Kt+1,Q.samples.length-1),Ue=wt-Kt,_e=Q.samples[Kt],we=Q.samples[Wt];for(let Ut=0;Ut<q.length;Ut++)q[Ut]=_e[Ut]+(we[Ut]-_e[Ut])*Ue,q[Ut]+=(Q.creased[Ut]-G[Ut])*Mi.value*(1-it);for(let Ut=0;Ut<rt.length;Ut+=3){let Ze=rt[Ut]*3,zn=rt[Ut+1]*3,qn=rt[Ut+2]*3,Ur=q[zn]-q[Ze],Lr=q[zn+1]-q[Ze+1],Nr=q[zn+2]-q[Ze+2],Ss=q[qn]-q[Ze],uu=q[qn+1]-q[Ze+1],Ir=q[qn+2]-q[Ze+2],d_=Lr*Ir-Nr*uu,p_=Nr*Ss-Ur*Ir,m_=Ur*uu-Lr*Ss,Fd=Math.hypot(d_,p_,m_)||1;lt[Ut]=d_/Fd,lt[Ut+1]=p_/Fd,lt[Ut+2]=m_/Fd}for(let Ut=0;Ut<rt.length;Ut++){let Ze=rt[Ut]*3,zn=Math.floor(Ut/3)*3,qn=0,Ur=0,Lr=0;for(let Ss of Dt[rt[Ut]]){let uu=lt[zn]*lt[Ss]+lt[zn+1]*lt[Ss+1]+lt[zn+2]*lt[Ss+2],Ir=ka.smoothstep(uu,.88-(1-ie)*.18,.98);qn+=lt[Ss]*Ir,Ur+=lt[Ss+1]*Ir,Lr+=lt[Ss+2]*Ir}let Nr=Math.hypot(qn,Ur,Lr)||1;ut[Ut*3]=q[Ze],ut[Ut*3+1]=q[Ze+1],ut[Ut*3+2]=q[Ze+2],Et[Ut*3]=qn/Nr,Et[Ut*3+1]=Ur/Nr,Et[Ut*3+2]=Lr/Nr}Tt.attributes.position.needsUpdate=!0,Tt.attributes.normal.needsUpdate=!0,Tt.computeBoundingSphere(),Tt.computeBoundingBox(),_t.value=ka.smoothstep(it+Mi.value,0,.4)}function ta(){let it=Tt.boundingBox;if(!it)return;let wt=1/0,Kt=1/0,Wt=-1/0,Ue=-1/0;for(let _e=0;_e<8;_e++){xs.set(_e&1?it.max.x:it.min.x,_e&2?it.max.y:it.min.y,_e&4?it.max.z:it.min.z),xs.applyMatrix4(bt.matrixWorld).project(nn);let we=(xs.x+1)*L/2,Ut=(1-xs.y)*k/2;wt=Math.min(wt,we),Wt=Math.max(Wt,we),Kt=Math.min(Kt,Ut),Ue=Math.max(Ue,Ut)}at.style.transform=`translate3d(${wt}px, ${Kt}px, 0)`,at.style.width=`${Math.max(24,Wt-wt)}px`,at.style.height=`${Math.max(24,Ue-Kt)}px`}function Sl(it,wt){yl.set(it/L*2-1,1-wt/k*2),$s.setFromCamera(yl,nn)}function r1(it){if(sn=0,me||!fe||xt||!$e||document.hidden)return;let wt=te?Math.min(.04,(it-te)/1e3):1/60;te=it;let Kt=Z.current,Wt=!1,Ue=Ht?He(Kt.crumpleDuration,.55):He(Kt.releaseDuration,.4);for(let we of Ar)Wt=Y0(we,wt,we===Sn||we===Mi?Ue:.42,ai||yt)||Wt;if(Ae=Math.max(Ae,Sn.value),Hi(),bt.rotation.set(vs.value,js.value,Xn),Ht&&!yt&&Kt.draggable){let we=Tt.attributes.position;ys.set(0,0,0);for(let Ut=0;Ut<3;Ut++)Cr.fromBufferAttribute(we,S[Ut]),ys.addScaledVector(Cr,xl.getComponent(Ut));ys.multiplyScalar(z).applyEuler(bt.rotation),qa.constant=-ys.z,Sl(V,pt),$s.ray.intersectPlane(qa,wr)&&(Cn.value=Cn.target=wr.x-ys.x,je.value=je.target=wr.y-ys.y,Cn.velocity=je.velocity=0)}bt.position.set(Cn.value,je.value,0),bt.updateMatrixWorld(!0);let _e=Tt.boundingBox;if(_e){let we=1/0;for(let Ut=0;Ut<8;Ut++)xs.set(Ut&1?_e.max.x:_e.min.x,Ut&2?_e.max.y:_e.min.y,Ut&4?_e.max.z:_e.min.z),xs.applyMatrix4(bt.matrixWorld),we=Math.min(we,xs.z);ji.position.z=we-z*Qe*.08}Qt.render(oe,nn),ta(),Wt&&bi()}function bi(){!sn&&!me&&fe&&$e&&!document.hidden&&!xt&&(sn=requestAnimationFrame(r1))}function K0(){let it=dt.getBoundingClientRect();L=Math.max(1,it.width),k=Math.max(1,it.height),z=Ft*Math.min(1,Math.max(1,L-48)/Ft,Math.max(1,k-48)/de),bt.scale.setScalar(z),nn.aspect=L/k,nn.position.z=k/(2*Math.tan(ka.degToRad(nn.fov/2))),nn.updateProjectionMatrix(),nn.updateMatrixWorld(),Qt.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),Qt.setSize(L,k,!1);let wt=Math.max(L,k),Kt=ka.degToRad(He(M,-35));if(mn.position.set(Math.sin(Kt)*wt,Math.cos(Kt)*wt,wt*4),mn.shadow.camera.left=mn.shadow.camera.bottom=-wt,mn.shadow.camera.right=mn.shadow.camera.top=wt,mn.shadow.camera.near=1,mn.shadow.camera.far=wt*6,mn.shadow.camera.updateProjectionMatrix(),ji.position.z=-z*Qe*.12,ji.scale.set(L*4,k*4,1),dt.style.setProperty("--pc-image-width",`${z}px`),dt.style.setProperty("--pc-image-height",`${z*zt}px`),!Ht){let Wt=Math.max(0,(L-z)/2-16),Ue=Math.max(0,(k-z*zt)/2-16);Cn.value=Cn.target=Ye(Cn.value,-Wt,Wt),je.value=je.target=Ye(je.value,-Ue,Ue)}bi()}function Rr(it=!1){if(!Ht)return;let wt=Z.current;Ht=!1,at.setAttribute("aria-pressed","false"),at.dataset.held="false";let Kt=jt;if(jt=null,Kt!==null&&at.hasPointerCapture(Kt)&&at.releasePointerCapture(Kt),wt.releaseBehavior==="stay"?(Sn.target=Sn.value,Sn.velocity=0):(Sn.target=0,Mi.target=wt.releaseBehavior==="creased"?Math.max(Mi.value,Ae*Ye(He(wt.creaseStrength,.18),0,1)):0),vs.target=js.target=0,wt.returnToOrigin&&wt.releaseBehavior!=="stay")Cn.target=je.target=0;else{let Wt=Tt.boundingBox,Ue=wt.releaseBehavior==="stay"&&Wt?Wt.max.x-Wt.min.x:1,_e=wt.releaseBehavior==="stay"&&Wt?Wt.max.y-Wt.min.y:zt,we=(Math.abs(Math.cos(Xn))*Ue+Math.abs(Math.sin(Xn))*_e)*z/2,Ut=(Math.abs(Math.sin(Xn))*Ue+Math.abs(Math.cos(Xn))*_e)*z/2,Ze=Math.min(Math.max(0,He(wt.dragRadius,180)),Math.max(0,L/2-we-16)),zn=Math.min(Math.max(0,He(wt.dragRadius,180)),Math.max(0,k/2-Ut-16)),qn=!ai&&!yt&&performance.now()-At<90?.06:0;Cn.target=Ye(Cn.value+Rt*qn,-Ze,Ze),je.target=Ye(je.value-kt*qn,-zn,zn)}if(it||yt||ai)for(let Wt of Ar)Y0(Wt,0,0,!0);yt=!1,Me(wt.releaseBehavior==="stay"&&Sn.target>.001?"crumpled":Mi.target>.001?"creased":"flat"),bi()}function Q0(){Rr(!0);for(let it of Ar)it.target=it.value=it.velocity=0;Ae=0,Me("flat"),bi()}vt.current=Q0,Ot.current=()=>Rr(!0);function j0(){Ht=!0,Ae=Sn.value,Sn.target=Ye(He(Z.current.crumpleAmount,.85),0,1),at.setAttribute("aria-pressed","true"),at.dataset.held="true",Me("holding"),bi()}function $0(it){if(!fe||Z.current.disabled||Ht||it.button!==0||!it.isPrimary)return;let wt=dt.getBoundingClientRect();V=St=it.clientX-wt.left,pt=mt=it.clientY-wt.top,Sl(V,pt),bt.updateMatrixWorld(!0);let Kt=$s.intersectObjects([Ct,Se],!1)[0];if(!Kt?.face)return;it.preventDefault(),at.dataset.pointer="true",at.focus({preventScroll:!0});let{face:Wt}=Kt;S=[Wt.a,Wt.b,Wt.c];let Ue=Tt.attributes.position;Cr.fromBufferAttribute(Ue,Wt.a),ou.fromBufferAttribute(Ue,Wt.b),lu.fromBufferAttribute(Ue,Wt.c),cs.getBarycoord(bt.worldToLocal(Kt.point.clone()),Cr,ou,lu,xl),yt=!1,jt=it.pointerId,Rt=kt=0,At=performance.now(),at.setPointerCapture(it.pointerId),j0()}function t_(it){if(!Ht||it.pointerId!==jt||!Z.current.draggable)return;let wt=dt.getBoundingClientRect(),Kt=performance.now(),Wt=it.clientX-wt.left,Ue=it.clientY-wt.top,_e=Math.max(.008,(Kt-At)/1e3);Rt=(Wt-St)/_e,kt=(Ue-mt)/_e,St=Wt,mt=Ue,At=Kt,V=Ye(Wt,12,L-12),pt=Ye(Ue,12,k-12);let we=ai?0:ka.degToRad(Ye(He(Z.current.dragRotation,10),0,60));vs.target=Ye(kt/1800,-1,1)*we,js.target=Ye(Rt/1800,-1,1)*we,bi()}function cu(it){it.pointerId===jt&&Rr()}function e_(it){it.pointerId===jt&&Rr(!0)}function Dr(){Rr(!0)}function n_(){at.dataset.pointer="false",Dr()}function i_(it){if(!(Z.current.disabled||!fe)){if(at.dataset.pointer="false",it.key==="Escape"){it.preventDefault(),Q0();return}if(it.key===" "||it.key==="Enter"){if(it.preventDefault(),it.repeat||Ht)return;yt=!0,j0(),Y0(Sn,0,0,!0),Ae=Math.max(Ae,Sn.value)}else if(Ht&&yt&&Z.current.draggable&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(it.key)){it.preventDefault();let wt=it.shiftKey?30:12,Kt=Math.max(0,He(Z.current.dragRadius,180));Cn.target=Ye(Cn.target+(it.key==="ArrowRight"?wt:it.key==="ArrowLeft"?-wt:0),-Math.min(Kt,L/3),Math.min(Kt,L/3)),je.target=Ye(je.target+(it.key==="ArrowUp"?wt:it.key==="ArrowDown"?-wt:0),-Math.min(Kt,k/3),Math.min(Kt,k/3)),bi()}}}function s_(it){yt&&(it.key===" "||it.key==="Enter")&&(it.preventDefault(),Rr(!0))}function a_(){te=0,document.hidden?Dr():bi()}function r_(){ai=si.matches,ai&&(vs.target=js.target=0),bi()}function o_(it){it.preventDefault(),xt=!0,Dr(),at.disabled=!0,Gt("error"),Z.current.onError?.(new Error("The WebGL context was lost."))}function l_(){xt=!1,fe&&(Gt("ready"),at.disabled=Z.current.disabled,bi())}at.addEventListener("pointerdown",$0),at.addEventListener("pointermove",t_),at.addEventListener("pointerup",cu),at.addEventListener("pointercancel",e_),at.addEventListener("lostpointercapture",cu),at.addEventListener("keydown",i_),at.addEventListener("keyup",s_),at.addEventListener("blur",n_),window.addEventListener("blur",Dr),document.addEventListener("visibilitychange",a_),si.addEventListener("change",r_),Lt.addEventListener("webglcontextlost",o_),Lt.addEventListener("webglcontextrestored",l_);let c_=new ResizeObserver(K0);c_.observe(dt);let u_=new IntersectionObserver(it=>{$e=it[0].isIntersecting,te=0,$e?bi():Dr()});u_.observe(dt),Hi(),K0();let h_=new Gc;h_.setCrossOrigin("anonymous");function f_(it){return new Promise((wt,Kt)=>{h_.load(it,Wt=>{if(me){Wt.dispose(),wt(Wt);return}ii.add(Wt),Wt.colorSpace=Ln,Wt.anisotropy=Math.min(8,Qt.capabilities.getMaxAnisotropy());let Ue=Wt.image,_e=Ue.width/Ue.height,we=Ft/de,Ut=1,Ze=1;r==="cover"?_e>we?Ut=we/_e:Ze=_e/we:_e>we?Ze=_e/we:Ut=we/_e,Wt.repeat.set(Ut,Ze),Wt.offset.set((1-Ut)/2,(1-Ze)/2),wt(Wt)},void 0,()=>Kt(new Error(`Unable to load paper image: ${it}. Remote images must allow CORS.`)))})}return e?Promise.all([f_(e),n?f_(n):Promise.resolve(null)]).then(([it,wt])=>{me||(wt&&(wt.repeat.x*=-1,wt.offset.x=1-wt.offset.x),$.map=it,ct.map=wt||it,st.map=it,$.needsUpdate=ct.needsUpdate=st.needsUpdate=!0,fe=!0,Gt("ready"),at.disabled=Z.current.disabled,bi())}).catch(it=>{me||(Gt("error"),Z.current.onError?.(it))}):(Gt("error"),Z.current.onError?.(new Error("PaperCrumple requires an image src."))),()=>{me=!0,cancelAnimationFrame(sn),jt!==null&&at.hasPointerCapture(jt)&&at.releasePointerCapture(jt),vt.current=Ot.current=null,c_.disconnect(),u_.disconnect(),at.removeEventListener("pointerdown",$0),at.removeEventListener("pointermove",t_),at.removeEventListener("pointerup",cu),at.removeEventListener("pointercancel",e_),at.removeEventListener("lostpointercapture",cu),at.removeEventListener("keydown",i_),at.removeEventListener("keyup",s_),at.removeEventListener("blur",n_),window.removeEventListener("blur",Dr),document.removeEventListener("visibilitychange",a_),si.removeEventListener("change",r_),Lt.removeEventListener("webglcontextlost",o_),Lt.removeEventListener("webglcontextrestored",l_),Tt.dispose(),ru.dispose(),$.dispose(),ct.dispose(),st.dispose(),vl.dispose(),I.dispose(),ii.forEach(it=>it.dispose()),mn.shadow.dispose(),Qt.dispose()}},[e,n,i,s,r,p,u,d,E,m,h,g,M,y,b,D,R,P]),(0,ni.useEffect)(()=>{vt.current?.()},[U]),(0,ni.useEffect)(()=>{F&&Ot.current?.()},[F]);let et=y?`drop-shadow(0 6px 10px rgb(0 0 0 / ${Ye(He(b,.08),0,1)}))`:void 0;return(0,Wa.jsxs)("div",{ref:J,className:`relative isolate w-full overflow-hidden ${Y}`,style:{height:a,...j},"data-status":Nt,children:[(0,Wa.jsx)("canvas",{ref:tt,className:"pointer-events-none absolute inset-0 block h-full w-full","aria-hidden":"true",style:{visibility:Nt==="ready"?"visible":"hidden",filter:et}}),Nt!=="ready"&&(0,Wa.jsx)("img",{className:"pointer-events-none absolute left-1/2 top-1/2 h-[var(--pc-image-height,72%)] w-[var(--pc-image-width,60%)] select-none",src:e||void 0,alt:t,draggable:!1,style:{objectFit:r,transform:`translate(-50%, -50%) rotate(${D}deg)`,filter:et}}),(0,Wa.jsx)("button",{ref:Mt,type:"button",className:"peer absolute left-0 top-0 m-0 cursor-grab touch-none appearance-none select-none rounded-[2px] border-0 bg-transparent p-0 !shadow-none !outline-none [-webkit-tap-highlight-color:transparent] data-[held=true]:cursor-grabbing focus:!outline-none focus-visible:!outline-none disabled:cursor-default",disabled:F||Nt!=="ready","aria-label":`${t}. Hold to crumple and drag. Keyboard: hold Space or Enter, arrow keys to move, Escape to reset.`,"aria-pressed":"false",style:{visibility:Nt==="ready"?"visible":"hidden"}}),(0,Wa.jsx)("span",{className:"pointer-events-none absolute bottom-6 left-[calc(50%-2px)] h-1 w-1 rounded-full bg-current opacity-0 peer-focus-visible:opacity-55 peer-data-[pointer=true]:!opacity-0","aria-hidden":"true"}),(0,Wa.jsx)("span",{className:"sr-only",role:"status",children:Nt==="loading"?"Loading interactive paper.":Nt==="error"?"Interactive paper unavailable. Showing the original image.":""})]})},t1=iD;var Z0=ts(br());function Pd(){return(0,Z0.jsx)("div",{style:{width:"100%",minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:24},children:(0,Z0.jsx)(t1,{src:"/assets/images/paper-crumple.jpg",alt:"A print to crumple",width:320,height:400,sceneHeight:560,releaseBehavior:"restore",crumpleAmount:.85,crumpleDuration:.55,releaseDuration:.4,foldCount:6,foldSharpness:.6,wrinkleDepth:.65,creaseStrength:.18,paperColor:"#f4f0e8",paperTexture:.08,draggable:!0,returnToOrigin:!0})})}var Xa=ts(br()),a1="reactbits--paper-crumple",sD=!0,e1=Object.keys(Er),n1=Pd||void 0||Er[e1.find(e=>/Demo|Example/.test(e))]||Er[e1.find(e=>/^[A-Z]/.test(e)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(e))],i1=!1,Bd=(e,t)=>{e==="preview-error"&&(i1=!0),!(e==="preview-ready"&&i1)&&parent.postMessage({type:e,id:a1,...t?{message:String(t)}:{}},"*")};window.addEventListener("error",e=>Bd("preview-error",e.message));window.addEventListener("unhandledrejection",e=>Bd("preview-error",e.reason?.message||e.reason));var J0=class extends Tr.default.Component{state={error:null};static getDerivedStateFromError(t){return{error:t}}componentDidCatch(t){Bd("preview-error",t.message)}render(){return this.state.error?(0,Xa.jsxs)("div",{role:"alert",style:{padding:32,maxWidth:600,fontSize:13,color:"#a1a1aa"},children:["The original example could not finish rendering: ",this.state.error.message]}):this.props.children}};function aD(){let[e,t]=Tr.default.useState({});if(Tr.default.useEffect(()=>{let n=s=>{s.data?.type==="preview:set-props"&&(!s.data.id||s.data.id===a1)&&t(a=>({...a,...s.data.props}))};window.addEventListener("message",n);let i=requestAnimationFrame(()=>requestAnimationFrame(()=>Bd("preview-ready")));return()=>{cancelAnimationFrame(i),window.removeEventListener("message",n)}},[]),!n1)throw Error("No renderable component export was published.");return Tr.default.createElement(n1,sD?{}:{text:"Build something extraordinary.",children:"Build something extraordinary.",...e})}function rD(){let{resolvedTheme:e,setTheme:t}=lM();return Tr.default.useEffect(()=>{document.documentElement.dataset.theme=e||"dark"},[e]),Tr.default.useEffect(()=>{let n=i=>{i.data?.type==="preview:set-theme"&&t(i.data.theme==="light"?"light":"dark")};return window.addEventListener("message",n),()=>window.removeEventListener("message",n)},[t]),(0,Xa.jsx)(aD,{})}function oD(){return(0,Xa.jsx)(cM,{attribute:"class",defaultTheme:document.documentElement.dataset.theme||"dark",enableSystem:!1,children:(0,Xa.jsx)(rD,{})})}(0,s1.createRoot)(document.getElementById("root")).render((0,Xa.jsx)(J0,{children:(0,Xa.jsx)(oD,{})}));})();
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
