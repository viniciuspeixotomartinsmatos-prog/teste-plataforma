(()=>{var Wb=Object.create;var zd=Object.defineProperty;var Xb=Object.getOwnPropertyDescriptor;var qb=Object.getOwnPropertyNames;var Yb=Object.getPrototypeOf,Zb=Object.prototype.hasOwnProperty;var zi=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Jb=(e,t)=>{for(var n in t)zd(e,n,{get:t[n],enumerable:!0})},Kb=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of qb(t))!Zb.call(e,s)&&s!==n&&zd(e,s,{get:()=>t[s],enumerable:!(i=Xb(t,s))||i.enumerable});return e};var Hi=(e,t,n)=>(n=e!=null?Wb(Yb(e)):{},Kb(t||!e||!e.__esModule?zd(n,"default",{value:e,enumerable:!0}):n,e));var ov=zi(Vt=>{"use strict";var Gd=Symbol.for("react.transitional.element"),Qb=Symbol.for("react.portal"),jb=Symbol.for("react.fragment"),$b=Symbol.for("react.strict_mode"),t1=Symbol.for("react.profiler"),e1=Symbol.for("react.consumer"),n1=Symbol.for("react.context"),i1=Symbol.for("react.forward_ref"),s1=Symbol.for("react.suspense"),a1=Symbol.for("react.memo"),ev=Symbol.for("react.lazy"),r1=Symbol.for("react.activity"),Q0=Symbol.iterator;function o1(e){return e===null||typeof e!="object"?null:(e=Q0&&e[Q0]||e["@@iterator"],typeof e=="function"?e:null)}var nv={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},iv=Object.assign,sv={};function yr(e,t,n){this.props=e,this.context=t,this.refs=sv,this.updater=n||nv}yr.prototype.isReactComponent={};yr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};yr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function av(){}av.prototype=yr.prototype;function kd(e,t,n){this.props=e,this.context=t,this.refs=sv,this.updater=n||nv}var Wd=kd.prototype=new av;Wd.constructor=kd;iv(Wd,yr.prototype);Wd.isPureReactComponent=!0;var j0=Array.isArray;function Vd(){}var we={H:null,A:null,T:null,S:null},rv=Object.prototype.hasOwnProperty;function Xd(e,t,n){var i=n.ref;return{$$typeof:Gd,type:e,key:t,ref:i!==void 0?i:null,props:n}}function l1(e,t){return Xd(e.type,t,e.props)}function qd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Gd}function c1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var $0=/\/+/g;function Hd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?c1(""+e.key):t.toString(36)}function u1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Vd,Vd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function _r(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Gd:case Qb:r=!0;break;case ev:return r=e._init,_r(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+Hd(e,0):i,j0(s)?(n="",r!=null&&(n=r.replace($0,"$&/")+"/"),_r(s,t,n,"",function(c){return c})):s!=null&&(qd(s)&&(s=l1(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace($0,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(j0(e))for(var l=0;l<e.length;l++)i=e[l],a=o+Hd(i,l),r+=_r(i,t,n,a,s);else if(l=o1(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+Hd(i,l++),r+=_r(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return _r(u1(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function Yc(e,t,n){if(e==null)return e;var i=[],s=0;return _r(e,i,"","",function(a){return t.call(n,a,s++)}),i}function h1(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var tv=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},f1={map:Yc,forEach:function(e,t,n){Yc(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Yc(e,function(){t++}),t},toArray:function(e){return Yc(e,function(t){return t})||[]},only:function(e){if(!qd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Vt.Activity=r1;Vt.Children=f1;Vt.Component=yr;Vt.Fragment=jb;Vt.Profiler=t1;Vt.PureComponent=kd;Vt.StrictMode=$b;Vt.Suspense=s1;Vt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=we;Vt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return we.H.useMemoCache(e)}};Vt.cache=function(e){return function(){return e.apply(null,arguments)}};Vt.cacheSignal=function(){return null};Vt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=iv({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!rv.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Xd(e.type,s,i)};Vt.createContext=function(e){return e={$$typeof:n1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:e1,_context:e},e};Vt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)rv.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Xd(e,a,s)};Vt.createRef=function(){return{current:null}};Vt.forwardRef=function(e){return{$$typeof:i1,render:e}};Vt.isValidElement=qd;Vt.lazy=function(e){return{$$typeof:ev,_payload:{_status:-1,_result:e},_init:h1}};Vt.memo=function(e,t){return{$$typeof:a1,type:e,compare:t===void 0?null:t}};Vt.startTransition=function(e){var t=we.T,n={};we.T=n;try{var i=e(),s=we.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Vd,tv)}catch(a){tv(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),we.T=t}};Vt.unstable_useCacheRefresh=function(){return we.H.useCacheRefresh()};Vt.use=function(e){return we.H.use(e)};Vt.useActionState=function(e,t,n){return we.H.useActionState(e,t,n)};Vt.useCallback=function(e,t){return we.H.useCallback(e,t)};Vt.useContext=function(e){return we.H.useContext(e)};Vt.useDebugValue=function(){};Vt.useDeferredValue=function(e,t){return we.H.useDeferredValue(e,t)};Vt.useEffect=function(e,t){return we.H.useEffect(e,t)};Vt.useEffectEvent=function(e){return we.H.useEffectEvent(e)};Vt.useId=function(){return we.H.useId()};Vt.useImperativeHandle=function(e,t,n){return we.H.useImperativeHandle(e,t,n)};Vt.useInsertionEffect=function(e,t){return we.H.useInsertionEffect(e,t)};Vt.useLayoutEffect=function(e,t){return we.H.useLayoutEffect(e,t)};Vt.useMemo=function(e,t){return we.H.useMemo(e,t)};Vt.useOptimistic=function(e,t){return we.H.useOptimistic(e,t)};Vt.useReducer=function(e,t,n){return we.H.useReducer(e,t,n)};Vt.useRef=function(e){return we.H.useRef(e)};Vt.useState=function(e){return we.H.useState(e)};Vt.useSyncExternalStore=function(e,t,n){return we.H.useSyncExternalStore(e,t,n)};Vt.useTransition=function(){return we.H.useTransition()};Vt.version="19.2.0"});var xr=zi((tD,lv)=>{"use strict";lv.exports=ov()});var _v=zi(Ie=>{"use strict";function Kd(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<Zc(s,t))e[i]=t,e[n]=s,n=i;else break t}}function Vi(e){return e.length===0?null:e[0]}function Kc(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>Zc(o,n))l<s&&0>Zc(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>Zc(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function Zc(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}Ie.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(cv=performance,Ie.unstable_now=function(){return cv.now()}):(Yd=Date,uv=Yd.now(),Ie.unstable_now=function(){return Yd.now()-uv});var cv,Yd,uv,is=[],Is=[],d1=1,li=null,xn=3,Qd=!1,Jo=!1,Ko=!1,jd=!1,dv=typeof setTimeout=="function"?setTimeout:null,pv=typeof clearTimeout=="function"?clearTimeout:null,hv=typeof setImmediate<"u"?setImmediate:null;function Jc(e){for(var t=Vi(Is);t!==null;){if(t.callback===null)Kc(Is);else if(t.startTime<=e)Kc(Is),t.sortIndex=t.expirationTime,Kd(is,t);else break;t=Vi(Is)}}function $d(e){if(Ko=!1,Jc(e),!Jo)if(Vi(is)!==null)Jo=!0,Mr||(Mr=!0,Sr());else{var t=Vi(Is);t!==null&&tp($d,t.startTime-e)}}var Mr=!1,Qo=-1,mv=5,gv=-1;function vv(){return jd?!0:!(Ie.unstable_now()-gv<mv)}function Zd(){if(jd=!1,Mr){var e=Ie.unstable_now();gv=e;var t=!0;try{t:{Jo=!1,Ko&&(Ko=!1,pv(Qo),Qo=-1),Qd=!0;var n=xn;try{e:{for(Jc(e),li=Vi(is);li!==null&&!(li.expirationTime>e&&vv());){var i=li.callback;if(typeof i=="function"){li.callback=null,xn=li.priorityLevel;var s=i(li.expirationTime<=e);if(e=Ie.unstable_now(),typeof s=="function"){li.callback=s,Jc(e),t=!0;break e}li===Vi(is)&&Kc(is),Jc(e)}else Kc(is);li=Vi(is)}if(li!==null)t=!0;else{var a=Vi(Is);a!==null&&tp($d,a.startTime-e),t=!1}}break t}finally{li=null,xn=n,Qd=!1}t=void 0}}finally{t?Sr():Mr=!1}}}var Sr;typeof hv=="function"?Sr=function(){hv(Zd)}:typeof MessageChannel<"u"?(Jd=new MessageChannel,fv=Jd.port2,Jd.port1.onmessage=Zd,Sr=function(){fv.postMessage(null)}):Sr=function(){dv(Zd,0)};var Jd,fv;function tp(e,t){Qo=dv(function(){e(Ie.unstable_now())},t)}Ie.unstable_IdlePriority=5;Ie.unstable_ImmediatePriority=1;Ie.unstable_LowPriority=4;Ie.unstable_NormalPriority=3;Ie.unstable_Profiling=null;Ie.unstable_UserBlockingPriority=2;Ie.unstable_cancelCallback=function(e){e.callback=null};Ie.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):mv=0<e?Math.floor(1e3/e):5};Ie.unstable_getCurrentPriorityLevel=function(){return xn};Ie.unstable_next=function(e){switch(xn){case 1:case 2:case 3:var t=3;break;default:t=xn}var n=xn;xn=t;try{return e()}finally{xn=n}};Ie.unstable_requestPaint=function(){jd=!0};Ie.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=xn;xn=e;try{return t()}finally{xn=n}};Ie.unstable_scheduleCallback=function(e,t,n){var i=Ie.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:d1++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,Kd(Is,e),Vi(is)===null&&e===Vi(Is)&&(Ko?(pv(Qo),Qo=-1):Ko=!0,tp($d,n-i))):(e.sortIndex=s,Kd(is,e),Jo||Qd||(Jo=!0,Mr||(Mr=!0,Sr()))),e};Ie.unstable_shouldYield=vv;Ie.unstable_wrapCallback=function(e){var t=xn;return function(){var n=xn;xn=t;try{return e.apply(this,arguments)}finally{xn=n}}}});var xv=zi((nD,yv)=>{"use strict";yv.exports=_v()});var Mv=zi(Dn=>{"use strict";var p1=xr();function Sv(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Os(){}var Rn={d:{f:Os,r:function(){throw Error(Sv(522))},D:Os,C:Os,L:Os,m:Os,X:Os,S:Os,M:Os},p:0,findDOMNode:null},m1=Symbol.for("react.portal");function g1(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:m1,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var jo=p1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Qc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Dn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Rn;Dn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Sv(299));return g1(e,t,null,n)};Dn.flushSync=function(e){var t=jo.T,n=Rn.p;try{if(jo.T=null,Rn.p=2,e)return e()}finally{jo.T=t,Rn.p=n,Rn.d.f()}};Dn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Rn.d.C(e,t))};Dn.prefetchDNS=function(e){typeof e=="string"&&Rn.d.D(e)};Dn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=Qc(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?Rn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&Rn.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Dn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Qc(t.as,t.crossOrigin);Rn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&Rn.d.M(e)};Dn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=Qc(n,t.crossOrigin);Rn.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Dn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Qc(t.as,t.crossOrigin);Rn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else Rn.d.m(e)};Dn.requestFormReset=function(e){Rn.d.r(e)};Dn.unstable_batchedUpdates=function(e,t){return e(t)};Dn.useFormState=function(e,t,n){return jo.H.useFormState(e,t,n)};Dn.useFormStatus=function(){return jo.H.useHostTransitionStatus()};Dn.version="19.2.0"});var Ev=zi((sD,Tv)=>{"use strict";function bv(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(bv)}catch(e){console.error(e)}}bv(),Tv.exports=Mv()});var BS=zi(Mh=>{"use strict";var en=xv(),Q_=xr(),v1=Ev();function it(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function j_(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Fl(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function $_(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ty(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Av(e){if(Fl(e)!==e)throw Error(it(188))}function _1(e){var t=e.alternate;if(!t){if(t=Fl(e),t===null)throw Error(it(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return Av(s),e;if(a===i)return Av(s),t;a=a.sibling}throw Error(it(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error(it(189))}}if(n.alternate!==i)throw Error(it(190))}if(n.tag!==3)throw Error(it(188));return n.stateNode.current===n?e:t}function ey(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=ey(e),t!==null)return t;e=e.sibling}return null}var De=Object.assign,y1=Symbol.for("react.element"),jc=Symbol.for("react.transitional.element"),rl=Symbol.for("react.portal"),Cr=Symbol.for("react.fragment"),ny=Symbol.for("react.strict_mode"),Ip=Symbol.for("react.profiler"),iy=Symbol.for("react.consumer"),hs=Symbol.for("react.context"),Rm=Symbol.for("react.forward_ref"),Op=Symbol.for("react.suspense"),Pp=Symbol.for("react.suspense_list"),Dm=Symbol.for("react.memo"),Ps=Symbol.for("react.lazy");Symbol.for("react.scope");var Bp=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var x1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var wv=Symbol.iterator;function $o(e){return e===null||typeof e!="object"?null:(e=wv&&e[wv]||e["@@iterator"],typeof e=="function"?e:null)}var S1=Symbol.for("react.client.reference");function Fp(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===S1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Cr:return"Fragment";case Ip:return"Profiler";case ny:return"StrictMode";case Op:return"Suspense";case Pp:return"SuspenseList";case Bp:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case rl:return"Portal";case hs:return e.displayName||"Context";case iy:return(e._context.displayName||"Context")+".Consumer";case Rm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Dm:return t=e.displayName||null,t!==null?t:Fp(e.type)||"Memo";case Ps:t=e._payload,e=e._init;try{return Fp(e(t))}catch{}}return null}var ol=Array.isArray,It=Q_.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,le=v1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ba={pending:!1,data:null,method:null,action:null},zp=[],Rr=-1;function qi(e){return{current:e}}function on(e){0>Rr||(e.current=zp[Rr],zp[Rr]=null,Rr--)}function Ee(e,t){Rr++,zp[Rr]=e.current,e.current=t}var Xi=qi(null),Tl=qi(null),Ys=qi(null),Uu=qi(null);function Lu(e,t){switch(Ee(Ys,t),Ee(Tl,e),Ee(Xi,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?I_(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=I_(t),e=bS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}on(Xi),Ee(Xi,e)}function Yr(){on(Xi),on(Tl),on(Ys)}function Hp(e){e.memoizedState!==null&&Ee(Uu,e);var t=Xi.current,n=bS(t,e.type);t!==n&&(Ee(Tl,e),Ee(Xi,n))}function Nu(e){Tl.current===e&&(on(Xi),on(Tl)),Uu.current===e&&(on(Uu),Ol._currentValue=Ba)}var ep,Cv;function Na(e){if(ep===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);ep=t&&t[1]||"",Cv=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ep+e+Cv}var np=!1;function ip(e,t){if(!e||np)return"";np=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(d){var u=d}Reflect.construct(e,[],p)}else{try{p.call()}catch(d){u=d}e.call(p.prototype)}}else{try{throw Error()}catch(d){u=d}(p=e())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(d){if(d&&u&&typeof d.stack=="string")return[d.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var f=`
`+l[i].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=i&&0<=s);break}}}finally{np=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?Na(n):""}function M1(e,t){switch(e.tag){case 26:case 27:case 5:return Na(e.type);case 16:return Na("Lazy");case 13:return e.child!==t&&t!==null?Na("Suspense Fallback"):Na("Suspense");case 19:return Na("SuspenseList");case 0:case 15:return ip(e.type,!1);case 11:return ip(e.type.render,!1);case 1:return ip(e.type,!0);case 31:return Na("Activity");default:return""}}function Rv(e){try{var t="",n=null;do t+=M1(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Vp=Object.prototype.hasOwnProperty,Um=en.unstable_scheduleCallback,sp=en.unstable_cancelCallback,b1=en.unstable_shouldYield,T1=en.unstable_requestPaint,Jn=en.unstable_now,E1=en.unstable_getCurrentPriorityLevel,sy=en.unstable_ImmediatePriority,ay=en.unstable_UserBlockingPriority,Iu=en.unstable_NormalPriority,A1=en.unstable_LowPriority,ry=en.unstable_IdlePriority,w1=en.log,C1=en.unstable_setDisableYieldValue,zl=null,Kn=null;function Gs(e){if(typeof w1=="function"&&C1(e),Kn&&typeof Kn.setStrictMode=="function")try{Kn.setStrictMode(zl,e)}catch{}}var Qn=Math.clz32?Math.clz32:U1,R1=Math.log,D1=Math.LN2;function U1(e){return e>>>=0,e===0?32:31-(R1(e)/D1|0)|0}var $c=256,tu=262144,eu=4194304;function Ia(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function rh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=Ia(i):(r&=o,r!==0?s=Ia(r):n||(n=o&~e,n!==0&&(s=Ia(n))))):(o=i&~a,o!==0?s=Ia(o):r!==0?s=Ia(r):n||(n=i&~e,n!==0&&(s=Ia(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function Hl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function L1(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function oy(){var e=eu;return eu<<=1,(eu&62914560)===0&&(eu=4194304),e}function ap(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Vl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function N1(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var f=31-Qn(n),p=1<<f;o[f]=0,l[f]=-1;var u=c[f];if(u!==null)for(c[f]=null,f=0;f<u.length;f++){var d=u[f];d!==null&&(d.lane&=-536870913)}n&=~p}i!==0&&ly(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function ly(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Qn(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function cy(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-Qn(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function uy(e,t){var n=t&-t;return n=(n&42)!==0?1:Lm(n),(n&(e.suspendedLanes|t))!==0?0:n}function Lm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Nm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function hy(){var e=le.p;return e!==0?e:(e=window.event,e===void 0?32:IS(e.type))}function Dv(e,t){var n=le.p;try{return le.p=e,t()}finally{le.p=n}}var ra=Math.random().toString(36).slice(2),fn="__reactFiber$"+ra,zn="__reactProps$"+ra,so="__reactContainer$"+ra,Gp="__reactEvents$"+ra,I1="__reactListeners$"+ra,O1="__reactHandles$"+ra,Uv="__reactResources$"+ra,Gl="__reactMarker$"+ra;function Im(e){delete e[fn],delete e[zn],delete e[Gp],delete e[I1],delete e[O1]}function Dr(e){var t=e[fn];if(t)return t;for(var n=e.parentNode;n;){if(t=n[so]||n[fn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=z_(e);e!==null;){if(n=e[fn])return n;e=z_(e)}return t}e=n,n=e.parentNode}return null}function ao(e){if(e=e[fn]||e[so]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ll(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(it(33))}function Hr(e){var t=e[Uv];return t||(t=e[Uv]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function rn(e){e[Gl]=!0}var fy=new Set,dy={};function Ya(e,t){Zr(e,t),Zr(e+"Capture",t)}function Zr(e,t){for(dy[e]=t,e=0;e<t.length;e++)fy.add(t[e])}var P1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Lv={},Nv={};function B1(e){return Vp.call(Nv,e)?!0:Vp.call(Lv,e)?!1:P1.test(e)?Nv[e]=!0:(Lv[e]=!0,!1)}function gu(e,t,n){if(B1(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function nu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function ss(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function ui(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function py(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function F1(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function kp(e){if(!e._valueTracker){var t=py(e)?"checked":"value";e._valueTracker=F1(e,t,""+e[t])}}function my(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=py(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Ou(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var z1=/[\n"\\]/g;function di(e){return e.replace(z1,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Wp(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+ui(t)):e.value!==""+ui(t)&&(e.value=""+ui(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Xp(e,r,ui(t)):n!=null?Xp(e,r,ui(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+ui(o):e.removeAttribute("name")}function gy(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){kp(e);return}n=n!=null?""+ui(n):"",t=t!=null?""+ui(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i??s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),kp(e)}function Xp(e,t,n){t==="number"&&Ou(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function Vr(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+ui(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function vy(e,t,n){if(t!=null&&(t=""+ui(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+ui(n):""}function _y(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(it(92));if(ol(i)){if(1<i.length)throw Error(it(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=ui(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),kp(e)}function Jr(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var H1=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Iv(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||H1.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function yy(e,t,n){if(t!=null&&typeof t!="object")throw Error(it(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&Iv(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&Iv(e,a,t[a])}function Om(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var V1=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),G1=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function vu(e){return G1.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function fs(){}var qp=null;function Pm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Ur=null,Gr=null;function Ov(e){var t=ao(e);if(t&&(e=t.stateNode)){var n=e[zn]||null;t:switch(e=t.stateNode,t.type){case"input":if(Wp(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+di(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[zn]||null;if(!s)throw Error(it(90));Wp(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&my(i)}break t;case"textarea":vy(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&Vr(e,!!n.multiple,t,!1)}}}var rp=!1;function xy(e,t,n){if(rp)return e(t,n);rp=!0;try{var i=e(t);return i}finally{if(rp=!1,(Ur!==null||Gr!==null)&&(_h(),Ur&&(t=Ur,e=Gr,Gr=Ur=null,Ov(t),e)))for(t=0;t<e.length;t++)Ov(e[t])}}function El(e,t){var n=e.stateNode;if(n===null)return null;var i=n[zn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(it(231,t,typeof n));return n}var vs=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Yp=!1;if(vs)try{br={},Object.defineProperty(br,"passive",{get:function(){Yp=!0}}),window.addEventListener("test",br,br),window.removeEventListener("test",br,br)}catch{Yp=!1}var br,ks=null,Bm=null,_u=null;function Sy(){if(_u)return _u;var e,t=Bm,n=t.length,i,s="value"in ks?ks.value:ks.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return _u=s.slice(e,1<i?1-i:void 0)}function yu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function iu(){return!0}function Pv(){return!1}function Hn(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?iu:Pv,this.isPropagationStopped=Pv,this}return De(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=iu)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=iu)},persist:function(){},isPersistent:iu}),t}var Za={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},oh=Hn(Za),kl=De({},Za,{view:0,detail:0}),k1=Hn(kl),op,lp,tl,lh=De({},kl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Fm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==tl&&(tl&&e.type==="mousemove"?(op=e.screenX-tl.screenX,lp=e.screenY-tl.screenY):lp=op=0,tl=e),op)},movementY:function(e){return"movementY"in e?e.movementY:lp}}),Bv=Hn(lh),W1=De({},lh,{dataTransfer:0}),X1=Hn(W1),q1=De({},kl,{relatedTarget:0}),cp=Hn(q1),Y1=De({},Za,{animationName:0,elapsedTime:0,pseudoElement:0}),Z1=Hn(Y1),J1=De({},Za,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),K1=Hn(J1),Q1=De({},Za,{data:0}),Fv=Hn(Q1),j1={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},$1={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},tT={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function eT(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=tT[e])?!!t[e]:!1}function Fm(){return eT}var nT=De({},kl,{key:function(e){if(e.key){var t=j1[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=yu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?$1[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Fm,charCode:function(e){return e.type==="keypress"?yu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?yu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),iT=Hn(nT),sT=De({},lh,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),zv=Hn(sT),aT=De({},kl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Fm}),rT=Hn(aT),oT=De({},Za,{propertyName:0,elapsedTime:0,pseudoElement:0}),lT=Hn(oT),cT=De({},lh,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),uT=Hn(cT),hT=De({},Za,{newState:0,oldState:0}),fT=Hn(hT),dT=[9,13,27,32],zm=vs&&"CompositionEvent"in window,hl=null;vs&&"documentMode"in document&&(hl=document.documentMode);var pT=vs&&"TextEvent"in window&&!hl,My=vs&&(!zm||hl&&8<hl&&11>=hl),Hv=" ",Vv=!1;function by(e,t){switch(e){case"keyup":return dT.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ty(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Lr=!1;function mT(e,t){switch(e){case"compositionend":return Ty(t);case"keypress":return t.which!==32?null:(Vv=!0,Hv);case"textInput":return e=t.data,e===Hv&&Vv?null:e;default:return null}}function gT(e,t){if(Lr)return e==="compositionend"||!zm&&by(e,t)?(e=Sy(),_u=Bm=ks=null,Lr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return My&&t.locale!=="ko"?null:t.data;default:return null}}var vT={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Gv(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!vT[e.type]:t==="textarea"}function Ey(e,t,n,i){Ur?Gr?Gr.push(i):Gr=[i]:Ur=i,t=$u(t,"onChange"),0<t.length&&(n=new oh("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var fl=null,Al=null;function _T(e){xS(e,0)}function ch(e){var t=ll(e);if(my(t))return e}function kv(e,t){if(e==="change")return t}var Ay=!1;vs&&(vs?(au="oninput"in document,au||(up=document.createElement("div"),up.setAttribute("oninput","return;"),au=typeof up.oninput=="function"),su=au):su=!1,Ay=su&&(!document.documentMode||9<document.documentMode));var su,au,up;function Wv(){fl&&(fl.detachEvent("onpropertychange",wy),Al=fl=null)}function wy(e){if(e.propertyName==="value"&&ch(Al)){var t=[];Ey(t,Al,e,Pm(e)),xy(_T,t)}}function yT(e,t,n){e==="focusin"?(Wv(),fl=t,Al=n,fl.attachEvent("onpropertychange",wy)):e==="focusout"&&Wv()}function xT(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ch(Al)}function ST(e,t){if(e==="click")return ch(t)}function MT(e,t){if(e==="input"||e==="change")return ch(t)}function bT(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var $n=typeof Object.is=="function"?Object.is:bT;function wl(e,t){if($n(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!Vp.call(t,s)||!$n(e[s],t[s]))return!1}return!0}function Xv(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function qv(e,t){var n=Xv(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=Xv(n)}}function Cy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Cy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Ry(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ou(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Ou(e.document)}return t}function Hm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var TT=vs&&"documentMode"in document&&11>=document.documentMode,Nr=null,Zp=null,dl=null,Jp=!1;function Yv(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Jp||Nr==null||Nr!==Ou(i)||(i=Nr,"selectionStart"in i&&Hm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),dl&&wl(dl,i)||(dl=i,i=$u(Zp,"onSelect"),0<i.length&&(t=new oh("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=Nr)))}function La(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Ir={animationend:La("Animation","AnimationEnd"),animationiteration:La("Animation","AnimationIteration"),animationstart:La("Animation","AnimationStart"),transitionrun:La("Transition","TransitionRun"),transitionstart:La("Transition","TransitionStart"),transitioncancel:La("Transition","TransitionCancel"),transitionend:La("Transition","TransitionEnd")},hp={},Dy={};vs&&(Dy=document.createElement("div").style,"AnimationEvent"in window||(delete Ir.animationend.animation,delete Ir.animationiteration.animation,delete Ir.animationstart.animation),"TransitionEvent"in window||delete Ir.transitionend.transition);function Ja(e){if(hp[e])return hp[e];if(!Ir[e])return e;var t=Ir[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Dy)return hp[e]=t[n];return e}var Uy=Ja("animationend"),Ly=Ja("animationiteration"),Ny=Ja("animationstart"),ET=Ja("transitionrun"),AT=Ja("transitionstart"),wT=Ja("transitioncancel"),Iy=Ja("transitionend"),Oy=new Map,Kp="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Kp.push("scrollEnd");function Ai(e,t){Oy.set(e,t),Ya(t,[e])}var Pu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ci=[],Or=0,Vm=0;function uh(){for(var e=Or,t=Vm=Or=0;t<e;){var n=ci[t];ci[t++]=null;var i=ci[t];ci[t++]=null;var s=ci[t];ci[t++]=null;var a=ci[t];if(ci[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&Py(n,s,a)}}function hh(e,t,n,i){ci[Or++]=e,ci[Or++]=t,ci[Or++]=n,ci[Or++]=i,Vm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Gm(e,t,n,i){return hh(e,t,n,i),Bu(e)}function Ka(e,t){return hh(e,null,null,t),Bu(e)}function Py(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-Qn(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function Bu(e){if(50<Ml)throw Ml=0,vm=null,Error(it(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Pr={};function CT(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Yn(e,t,n,i){return new CT(e,t,n,i)}function km(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ps(e,t){var n=e.alternate;return n===null?(n=Yn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function By(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function xu(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")km(e)&&(r=1);else if(typeof e=="string")r=UE(e,n,Xi.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case Bp:return e=Yn(31,n,t,s),e.elementType=Bp,e.lanes=a,e;case Cr:return Fa(n.children,s,a,t);case ny:r=8,s|=24;break;case Ip:return e=Yn(12,n,t,s|2),e.elementType=Ip,e.lanes=a,e;case Op:return e=Yn(13,n,t,s),e.elementType=Op,e.lanes=a,e;case Pp:return e=Yn(19,n,t,s),e.elementType=Pp,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case hs:r=10;break t;case iy:r=9;break t;case Rm:r=11;break t;case Dm:r=14;break t;case Ps:r=16,i=null;break t}r=29,n=Error(it(130,e===null?"null":typeof e,"")),i=null}return t=Yn(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function Fa(e,t,n,i){return e=Yn(7,e,i,t),e.lanes=n,e}function fp(e,t,n){return e=Yn(6,e,null,t),e.lanes=n,e}function Fy(e){var t=Yn(18,null,null,0);return t.stateNode=e,t}function dp(e,t,n){return t=Yn(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Zv=new WeakMap;function pi(e,t){if(typeof e=="object"&&e!==null){var n=Zv.get(e);return n!==void 0?n:(t={value:e,source:t,stack:Rv(t)},Zv.set(e,t),t)}return{value:e,source:t,stack:Rv(t)}}var Br=[],Fr=0,Fu=null,Cl=0,hi=[],fi=0,na=null,Gi=1,ki="";function cs(e,t){Br[Fr++]=Cl,Br[Fr++]=Fu,Fu=e,Cl=t}function zy(e,t,n){hi[fi++]=Gi,hi[fi++]=ki,hi[fi++]=na,na=e;var i=Gi;e=ki;var s=32-Qn(i)-1;i&=~(1<<s),n+=1;var a=32-Qn(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,Gi=1<<32-Qn(t)+s|n<<s|i,ki=a+e}else Gi=1<<a|n<<s|i,ki=e}function Wm(e){e.return!==null&&(cs(e,1),zy(e,1,0))}function Xm(e){for(;e===Fu;)Fu=Br[--Fr],Br[Fr]=null,Cl=Br[--Fr],Br[Fr]=null;for(;e===na;)na=hi[--fi],hi[fi]=null,ki=hi[--fi],hi[fi]=null,Gi=hi[--fi],hi[fi]=null}function Hy(e,t){hi[fi++]=Gi,hi[fi++]=ki,hi[fi++]=na,Gi=t.id,ki=t.overflow,na=e}var dn=null,Re=null,ee=!1,Zs=null,mi=!1,Qp=Error(it(519));function ia(e){var t=Error(it(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Rl(pi(t,e)),Qp}function Jv(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[fn]=e,t[zn]=i,n){case"dialog":Zt("cancel",t),Zt("close",t);break;case"iframe":case"object":case"embed":Zt("load",t);break;case"video":case"audio":for(n=0;n<Nl.length;n++)Zt(Nl[n],t);break;case"source":Zt("error",t);break;case"img":case"image":case"link":Zt("error",t),Zt("load",t);break;case"details":Zt("toggle",t);break;case"input":Zt("invalid",t),gy(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Zt("invalid",t);break;case"textarea":Zt("invalid",t),_y(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||MS(t.textContent,n)?(i.popover!=null&&(Zt("beforetoggle",t),Zt("toggle",t)),i.onScroll!=null&&Zt("scroll",t),i.onScrollEnd!=null&&Zt("scrollend",t),i.onClick!=null&&(t.onclick=fs),t=!0):t=!1,t||ia(e,!0)}function Kv(e){for(dn=e.return;dn;)switch(dn.tag){case 5:case 31:case 13:mi=!1;return;case 27:case 3:mi=!0;return;default:dn=dn.return}}function Tr(e){if(e!==dn)return!1;if(!ee)return Kv(e),ee=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||Mm(e.type,e.memoizedProps)),n=!n),n&&Re&&ia(e),Kv(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(it(317));Re=F_(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(it(317));Re=F_(e)}else t===27?(t=Re,oa(e.type)?(e=Am,Am=null,Re=e):Re=t):Re=dn?vi(e.stateNode.nextSibling):null;return!0}function Ga(){Re=dn=null,ee=!1}function pp(){var e=Zs;return e!==null&&(Bn===null?Bn=e:Bn.push.apply(Bn,e),Zs=null),e}function Rl(e){Zs===null?Zs=[e]:Zs.push(e)}var jp=qi(null),Qa=null,ds=null;function Fs(e,t,n){Ee(jp,t._currentValue),t._currentValue=n}function ms(e){e._currentValue=jp.current,on(jp)}function $p(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function tm(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),$p(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error(it(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),$p(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function ro(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error(it(387));if(r=r.memoizedProps,r!==null){var o=s.type;$n(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Uu.current){if(r=s.alternate,r===null)throw Error(it(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push(Ol):e=[Ol])}s=s.return}e!==null&&tm(t,e,n,i),t.flags|=262144}function zu(e){for(e=e.firstContext;e!==null;){if(!$n(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ka(e){Qa=e,ds=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function pn(e){return Vy(Qa,e)}function ru(e,t){return Qa===null&&ka(e),Vy(e,t)}function Vy(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},ds===null){if(e===null)throw Error(it(308));ds=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ds=ds.next=t;return n}var RT=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},DT=en.unstable_scheduleCallback,UT=en.unstable_NormalPriority,Je={$$typeof:hs,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function qm(){return{controller:new RT,data:new Map,refCount:0}}function Wl(e){e.refCount--,e.refCount===0&&DT(UT,function(){e.controller.abort()})}var pl=null,em=0,Kr=0,kr=null;function LT(e,t){if(pl===null){var n=pl=[];em=0,Kr=vg(),kr={status:"pending",value:void 0,then:function(i){n.push(i)}}}return em++,t.then(Qv,Qv),t}function Qv(){if(--em===0&&pl!==null){kr!==null&&(kr.status="fulfilled");var e=pl;pl=null,Kr=0,kr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function NT(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var jv=It.S;It.S=function(e,t){eS=Jn(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&LT(e,t),jv!==null&&jv(e,t)};var za=qi(null);function Ym(){var e=za.current;return e!==null?e:Se.pooledCache}function Su(e,t){t===null?Ee(za,za.current):Ee(za,t.pool)}function Gy(){var e=Ym();return e===null?null:{parent:Je._currentValue,pool:e}}var oo=Error(it(460)),Zm=Error(it(474)),fh=Error(it(542)),Hu={then:function(){}};function $v(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ky(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(fs,fs),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,e_(e),e;default:if(typeof t.status=="string")t.then(fs,fs);else{if(e=Se,e!==null&&100<e.shellSuspendCounter)throw Error(it(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,e_(e),e}throw Ha=t,oo}}function Oa(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Ha=n,oo):n}}var Ha=null;function t_(){if(Ha===null)throw Error(it(459));var e=Ha;return Ha=null,e}function e_(e){if(e===oo||e===fh)throw Error(it(483))}var Wr=null,Dl=0;function ou(e){var t=Dl;return Dl+=1,Wr===null&&(Wr=[]),ky(Wr,e,t)}function el(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function lu(e,t){throw t.$$typeof===y1?Error(it(525)):(e=Object.prototype.toString.call(t),Error(it(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Wy(e){function t(h,v){if(e){var S=h.deletions;S===null?(h.deletions=[v],h.flags|=16):S.push(v)}}function n(h,v){if(!e)return null;for(;v!==null;)t(h,v),v=v.sibling;return null}function i(h){for(var v=new Map;h!==null;)h.key!==null?v.set(h.key,h):v.set(h.index,h),h=h.sibling;return v}function s(h,v){return h=ps(h,v),h.index=0,h.sibling=null,h}function a(h,v,S){return h.index=S,e?(S=h.alternate,S!==null?(S=S.index,S<v?(h.flags|=67108866,v):S):(h.flags|=67108866,v)):(h.flags|=1048576,v)}function r(h){return e&&h.alternate===null&&(h.flags|=67108866),h}function o(h,v,S,y){return v===null||v.tag!==6?(v=fp(S,h.mode,y),v.return=h,v):(v=s(v,S),v.return=h,v)}function l(h,v,S,y){var T=S.type;return T===Cr?f(h,v,S.props.children,y,S.key):v!==null&&(v.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Ps&&Oa(T)===v.type)?(v=s(v,S.props),el(v,S),v.return=h,v):(v=xu(S.type,S.key,S.props,null,h.mode,y),el(v,S),v.return=h,v)}function c(h,v,S,y){return v===null||v.tag!==4||v.stateNode.containerInfo!==S.containerInfo||v.stateNode.implementation!==S.implementation?(v=dp(S,h.mode,y),v.return=h,v):(v=s(v,S.children||[]),v.return=h,v)}function f(h,v,S,y,T){return v===null||v.tag!==7?(v=Fa(S,h.mode,y,T),v.return=h,v):(v=s(v,S),v.return=h,v)}function p(h,v,S){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=fp(""+v,h.mode,S),v.return=h,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case jc:return S=xu(v.type,v.key,v.props,null,h.mode,S),el(S,v),S.return=h,S;case rl:return v=dp(v,h.mode,S),v.return=h,v;case Ps:return v=Oa(v),p(h,v,S)}if(ol(v)||$o(v))return v=Fa(v,h.mode,S,null),v.return=h,v;if(typeof v.then=="function")return p(h,ou(v),S);if(v.$$typeof===hs)return p(h,ru(h,v),S);lu(h,v)}return null}function u(h,v,S,y){var T=v!==null?v.key:null;if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return T!==null?null:o(h,v,""+S,y);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case jc:return S.key===T?l(h,v,S,y):null;case rl:return S.key===T?c(h,v,S,y):null;case Ps:return S=Oa(S),u(h,v,S,y)}if(ol(S)||$o(S))return T!==null?null:f(h,v,S,y,null);if(typeof S.then=="function")return u(h,v,ou(S),y);if(S.$$typeof===hs)return u(h,v,ru(h,S),y);lu(h,S)}return null}function d(h,v,S,y,T){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return h=h.get(S)||null,o(v,h,""+y,T);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case jc:return h=h.get(y.key===null?S:y.key)||null,l(v,h,y,T);case rl:return h=h.get(y.key===null?S:y.key)||null,c(v,h,y,T);case Ps:return y=Oa(y),d(h,v,S,y,T)}if(ol(y)||$o(y))return h=h.get(S)||null,f(v,h,y,T,null);if(typeof y.then=="function")return d(h,v,S,ou(y),T);if(y.$$typeof===hs)return d(h,v,S,ru(v,y),T);lu(v,y)}return null}function g(h,v,S,y){for(var T=null,E=null,w=v,x=v=0,A=null;w!==null&&x<S.length;x++){w.index>x?(A=w,w=null):A=w.sibling;var R=u(h,w,S[x],y);if(R===null){w===null&&(w=A);break}e&&w&&R.alternate===null&&t(h,w),v=a(R,v,x),E===null?T=R:E.sibling=R,E=R,w=A}if(x===S.length)return n(h,w),ee&&cs(h,x),T;if(w===null){for(;x<S.length;x++)w=p(h,S[x],y),w!==null&&(v=a(w,v,x),E===null?T=w:E.sibling=w,E=w);return ee&&cs(h,x),T}for(w=i(w);x<S.length;x++)A=d(w,h,x,S[x],y),A!==null&&(e&&A.alternate!==null&&w.delete(A.key===null?x:A.key),v=a(A,v,x),E===null?T=A:E.sibling=A,E=A);return e&&w.forEach(function(I){return t(h,I)}),ee&&cs(h,x),T}function b(h,v,S,y){if(S==null)throw Error(it(151));for(var T=null,E=null,w=v,x=v=0,A=null,R=S.next();w!==null&&!R.done;x++,R=S.next()){w.index>x?(A=w,w=null):A=w.sibling;var I=u(h,w,R.value,y);if(I===null){w===null&&(w=A);break}e&&w&&I.alternate===null&&t(h,w),v=a(I,v,x),E===null?T=I:E.sibling=I,E=I,w=A}if(R.done)return n(h,w),ee&&cs(h,x),T;if(w===null){for(;!R.done;x++,R=S.next())R=p(h,R.value,y),R!==null&&(v=a(R,v,x),E===null?T=R:E.sibling=R,E=R);return ee&&cs(h,x),T}for(w=i(w);!R.done;x++,R=S.next())R=d(w,h,x,R.value,y),R!==null&&(e&&R.alternate!==null&&w.delete(R.key===null?x:R.key),v=a(R,v,x),E===null?T=R:E.sibling=R,E=R);return e&&w.forEach(function(F){return t(h,F)}),ee&&cs(h,x),T}function m(h,v,S,y){if(typeof S=="object"&&S!==null&&S.type===Cr&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case jc:t:{for(var T=S.key;v!==null;){if(v.key===T){if(T=S.type,T===Cr){if(v.tag===7){n(h,v.sibling),y=s(v,S.props.children),y.return=h,h=y;break t}}else if(v.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Ps&&Oa(T)===v.type){n(h,v.sibling),y=s(v,S.props),el(y,S),y.return=h,h=y;break t}n(h,v);break}else t(h,v);v=v.sibling}S.type===Cr?(y=Fa(S.props.children,h.mode,y,S.key),y.return=h,h=y):(y=xu(S.type,S.key,S.props,null,h.mode,y),el(y,S),y.return=h,h=y)}return r(h);case rl:t:{for(T=S.key;v!==null;){if(v.key===T)if(v.tag===4&&v.stateNode.containerInfo===S.containerInfo&&v.stateNode.implementation===S.implementation){n(h,v.sibling),y=s(v,S.children||[]),y.return=h,h=y;break t}else{n(h,v);break}else t(h,v);v=v.sibling}y=dp(S,h.mode,y),y.return=h,h=y}return r(h);case Ps:return S=Oa(S),m(h,v,S,y)}if(ol(S))return g(h,v,S,y);if($o(S)){if(T=$o(S),typeof T!="function")throw Error(it(150));return S=T.call(S),b(h,v,S,y)}if(typeof S.then=="function")return m(h,v,ou(S),y);if(S.$$typeof===hs)return m(h,v,ru(h,S),y);lu(h,S)}return typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint"?(S=""+S,v!==null&&v.tag===6?(n(h,v.sibling),y=s(v,S),y.return=h,h=y):(n(h,v),y=fp(S,h.mode,y),y.return=h,h=y),r(h)):n(h,v)}return function(h,v,S,y){try{Dl=0;var T=m(h,v,S,y);return Wr=null,T}catch(w){if(w===oo||w===fh)throw w;var E=Yn(29,w,null,h.mode);return E.lanes=y,E.return=h,E}finally{}}}var Wa=Wy(!0),Xy=Wy(!1),Bs=!1;function Jm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function nm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Js(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ks(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(oe&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=Bu(e),Py(e,null,n),t}return hh(e,i,t,n),Bu(e)}function ml(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,cy(e,n)}}function mp(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var im=!1;function gl(){if(im){var e=kr;if(e!==null)throw e}}function vl(e,t,n,i){im=!1;var s=e.updateQueue;Bs=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var f=e.alternate;f!==null&&(f=f.updateQueue,o=f.lastBaseUpdate,o!==r&&(o===null?f.firstBaseUpdate=c:o.next=c,f.lastBaseUpdate=l))}if(a!==null){var p=s.baseState;r=0,f=c=l=null,o=a;do{var u=o.lane&-536870913,d=u!==o.lane;if(d?(Qt&u)===u:(i&u)===u){u!==0&&u===Kr&&(im=!0),f!==null&&(f=f.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var g=e,b=o;u=t;var m=n;switch(b.tag){case 1:if(g=b.payload,typeof g=="function"){p=g.call(m,p,u);break t}p=g;break t;case 3:g.flags=g.flags&-65537|128;case 0:if(g=b.payload,u=typeof g=="function"?g.call(m,p,u):g,u==null)break t;p=De({},p,u);break t;case 2:Bs=!0}}u=o.callback,u!==null&&(e.flags|=64,d&&(e.flags|=8192),d=s.callbacks,d===null?s.callbacks=[u]:d.push(u))}else d={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},f===null?(c=f=d,l=p):f=f.next=d,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;d=o,o=d.next,d.next=null,s.lastBaseUpdate=d,s.shared.pending=null}}while(!0);f===null&&(l=p),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=f,a===null&&(s.shared.lanes=0),aa|=r,e.lanes=r,e.memoizedState=p}}function qy(e,t){if(typeof e!="function")throw Error(it(191,e));e.call(t)}function Yy(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)qy(n[e],t)}var Qr=qi(null),Vu=qi(0);function n_(e,t){e=Ss,Ee(Vu,e),Ee(Qr,t),Ss=e|t.baseLanes}function sm(){Ee(Vu,Ss),Ee(Qr,Qr.current)}function Km(){Ss=Vu.current,on(Qr),on(Vu)}var ti=qi(null),gi=null;function zs(e){var t=e.alternate;Ee(We,We.current&1),Ee(ti,e),gi===null&&(t===null||Qr.current!==null||t.memoizedState!==null)&&(gi=e)}function am(e){Ee(We,We.current),Ee(ti,e),gi===null&&(gi=e)}function Zy(e){e.tag===22?(Ee(We,We.current),Ee(ti,e),gi===null&&(gi=e)):Hs(e)}function Hs(){Ee(We,We.current),Ee(ti,ti.current)}function qn(e){on(ti),gi===e&&(gi=null),on(We)}var We=qi(0);function Gu(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Tm(n)||Em(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var _s=0,kt=null,_e=null,Ye=null,ku=!1,Xr=!1,Xa=!1,Wu=0,Ul=0,qr=null,IT=0;function He(){throw Error(it(321))}function Qm(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!$n(e[n],t[n]))return!1;return!0}function jm(e,t,n,i,s,a){return _s=a,kt=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,It.H=e===null||e.memoizedState===null?Ex:cg,Xa=!1,a=n(i,s),Xa=!1,Xr&&(a=Ky(t,n,i,s)),Jy(e),a}function Jy(e){It.H=Ll;var t=_e!==null&&_e.next!==null;if(_s=0,Ye=_e=kt=null,ku=!1,Ul=0,qr=null,t)throw Error(it(300));e===null||Ke||(e=e.dependencies,e!==null&&zu(e)&&(Ke=!0))}function Ky(e,t,n,i){kt=e;var s=0;do{if(Xr&&(qr=null),Ul=0,Xr=!1,25<=s)throw Error(it(301));if(s+=1,Ye=_e=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}It.H=Ax,a=t(n,i)}while(Xr);return a}function OT(){var e=It.H,t=e.useState()[0];return t=typeof t.then=="function"?Xl(t):t,e=e.useState()[0],(_e!==null?_e.memoizedState:null)!==e&&(kt.flags|=1024),t}function $m(){var e=Wu!==0;return Wu=0,e}function tg(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function eg(e){if(ku){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}ku=!1}_s=0,Ye=_e=kt=null,Xr=!1,Ul=Wu=0,qr=null}function Un(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ye===null?kt.memoizedState=Ye=e:Ye=Ye.next=e,Ye}function Xe(){if(_e===null){var e=kt.alternate;e=e!==null?e.memoizedState:null}else e=_e.next;var t=Ye===null?kt.memoizedState:Ye.next;if(t!==null)Ye=t,_e=e;else{if(e===null)throw kt.alternate===null?Error(it(467)):Error(it(310));_e=e,e={memoizedState:_e.memoizedState,baseState:_e.baseState,baseQueue:_e.baseQueue,queue:_e.queue,next:null},Ye===null?kt.memoizedState=Ye=e:Ye=Ye.next=e}return Ye}function dh(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Xl(e){var t=Ul;return Ul+=1,qr===null&&(qr=[]),e=ky(qr,e,t),t=kt,(Ye===null?t.memoizedState:Ye.next)===null&&(t=t.alternate,It.H=t===null||t.memoizedState===null?Ex:cg),e}function ph(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Xl(e);if(e.$$typeof===hs)return pn(e)}throw Error(it(438,String(e)))}function ng(e){var t=null,n=kt.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=kt.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=dh(),kt.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=x1;return t.index++,n}function ys(e,t){return typeof t=="function"?t(e):t}function Mu(e){var t=Xe();return ig(t,_e,e)}function ig(e,t,n){var i=e.queue;if(i===null)throw Error(it(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(Qt&p)===p:(_s&p)===p){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===Kr&&(f=!0);else if((_s&u)===u){c=c.next,u===Kr&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,r=a):l=l.next=p,kt.lanes|=u,aa|=u;p=c.action,Xa&&n(a,p),a=c.hasEagerState?c.eagerState:n(a,p)}else u={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,kt.lanes|=p,aa|=p;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!$n(a,e.memoizedState)&&(Ke=!0,f&&(n=kr,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function gp(e){var t=Xe(),n=t.queue;if(n===null)throw Error(it(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);$n(a,t.memoizedState)||(Ke=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function Qy(e,t,n){var i=kt,s=Xe(),a=ee;if(a){if(n===void 0)throw Error(it(407));n=n()}else n=t();var r=!$n((_e||s).memoizedState,n);if(r&&(s.memoizedState=n,Ke=!0),s=s.queue,sg(tx.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||Ye!==null&&Ye.memoizedState.tag&1){if(i.flags|=2048,jr(9,{destroy:void 0},$y.bind(null,i,s,n,t),null),Se===null)throw Error(it(349));a||(_s&127)!==0||jy(i,t,n)}return n}function jy(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=kt.updateQueue,t===null?(t=dh(),kt.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function $y(e,t,n,i){t.value=n,t.getSnapshot=i,ex(t)&&nx(e)}function tx(e,t,n){return n(function(){ex(t)&&nx(e)})}function ex(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!$n(e,n)}catch{return!0}}function nx(e){var t=Ka(e,2);t!==null&&Fn(t,e,2)}function rm(e){var t=Un();if(typeof e=="function"){var n=e;if(e=n(),Xa){Gs(!0);try{n()}finally{Gs(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:e},t}function ix(e,t,n,i){return e.baseState=n,ig(e,_e,typeof i=="function"?i:ys)}function PT(e,t,n,i,s){if(gh(e))throw Error(it(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};It.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,sx(t,a)):(a.next=n.next,t.pending=n.next=a)}}function sx(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=It.T,r={};It.T=r;try{var o=n(s,i),l=It.S;l!==null&&l(r,o),i_(e,t,o)}catch(c){om(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),It.T=a}}else try{a=n(s,i),i_(e,t,a)}catch(c){om(e,t,c)}}function i_(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){s_(e,t,i)},function(i){return om(e,t,i)}):s_(e,t,n)}function s_(e,t,n){t.status="fulfilled",t.value=n,ax(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,sx(e,n)))}function om(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,ax(t),t=t.next;while(t!==i)}e.action=null}function ax(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function rx(e,t){return t}function a_(e,t){if(ee){var n=Se.formState;if(n!==null){t:{var i=kt;if(ee){if(Re){e:{for(var s=Re,a=mi;s.nodeType!==8;){if(!a){s=null;break e}if(s=vi(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Re=vi(s.nextSibling),i=s.data==="F!";break t}}ia(i)}i=!1}i&&(t=n[0])}}return n=Un(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:rx,lastRenderedState:t},n.queue=i,n=Mx.bind(null,kt,i),i.dispatch=n,i=rm(!1),a=lg.bind(null,kt,!1,i.queue),i=Un(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=PT.bind(null,kt,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function r_(e){var t=Xe();return ox(t,_e,e)}function ox(e,t,n){if(t=ig(e,t,rx)[0],e=Mu(ys)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Xl(t)}catch(r){throw r===oo?fh:r}else i=t;t=Xe();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&(kt.flags|=2048,jr(9,{destroy:void 0},BT.bind(null,s,n),null)),[i,a,e]}function BT(e,t){e.action=t}function o_(e){var t=Xe(),n=_e;if(n!==null)return ox(t,n,e);Xe(),t=t.memoizedState,n=Xe();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function jr(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=kt.updateQueue,t===null&&(t=dh(),kt.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function lx(){return Xe().memoizedState}function bu(e,t,n,i){var s=Un();kt.flags|=e,s.memoizedState=jr(1|t,{destroy:void 0},n,i===void 0?null:i)}function mh(e,t,n,i){var s=Xe();i=i===void 0?null:i;var a=s.memoizedState.inst;_e!==null&&i!==null&&Qm(i,_e.memoizedState.deps)?s.memoizedState=jr(t,a,n,i):(kt.flags|=e,s.memoizedState=jr(1|t,a,n,i))}function l_(e,t){bu(8390656,8,e,t)}function sg(e,t){mh(2048,8,e,t)}function FT(e){kt.flags|=4;var t=kt.updateQueue;if(t===null)t=dh(),kt.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function cx(e){var t=Xe().memoizedState;return FT({ref:t,nextImpl:e}),function(){if((oe&2)!==0)throw Error(it(440));return t.impl.apply(void 0,arguments)}}function ux(e,t){return mh(4,2,e,t)}function hx(e,t){return mh(4,4,e,t)}function fx(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function dx(e,t,n){n=n!=null?n.concat([e]):null,mh(4,4,fx.bind(null,t,e),n)}function ag(){}function px(e,t){var n=Xe();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Qm(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function mx(e,t){var n=Xe();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Qm(t,i[1]))return i[0];if(i=e(),Xa){Gs(!0);try{e()}finally{Gs(!1)}}return n.memoizedState=[i,t],i}function rg(e,t,n){return n===void 0||(_s&1073741824)!==0&&(Qt&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=iS(),kt.lanes|=e,aa|=e,n)}function gx(e,t,n,i){return $n(n,t)?n:Qr.current!==null?(e=rg(e,n,i),$n(e,t)||(Ke=!0),e):(_s&42)===0||(_s&1073741824)!==0&&(Qt&261930)===0?(Ke=!0,e.memoizedState=n):(e=iS(),kt.lanes|=e,aa|=e,t)}function vx(e,t,n,i,s){var a=le.p;le.p=a!==0&&8>a?a:8;var r=It.T,o={};It.T=o,lg(e,!1,t,n);try{var l=s(),c=It.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=NT(l,i);_l(e,t,f,jn(e))}else _l(e,t,i,jn(e))}catch(p){_l(e,t,{then:function(){},status:"rejected",reason:p},jn())}finally{le.p=a,r!==null&&o.types!==null&&(r.types=o.types),It.T=r}}function zT(){}function lm(e,t,n,i){if(e.tag!==5)throw Error(it(476));var s=_x(e).queue;vx(e,s,t,Ba,n===null?zT:function(){return yx(e),n(i)})}function _x(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ba,baseState:Ba,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:Ba},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function yx(e){var t=_x(e);t.next===null&&(t=e.alternate.memoizedState),_l(e,t.next.queue,{},jn())}function og(){return pn(Ol)}function xx(){return Xe().memoizedState}function Sx(){return Xe().memoizedState}function HT(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=jn();e=Js(n);var i=Ks(t,e,n);i!==null&&(Fn(i,t,n),ml(i,t,n)),t={cache:qm()},e.payload=t;return}t=t.return}}function VT(e,t,n){var i=jn();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},gh(e)?bx(t,n):(n=Gm(e,t,n,i),n!==null&&(Fn(n,e,i),Tx(n,t,i)))}function Mx(e,t,n){var i=jn();_l(e,t,n,i)}function _l(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(gh(e))bx(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,$n(o,r))return hh(e,t,s,0),Se===null&&uh(),!1}catch{}finally{}if(n=Gm(e,t,s,i),n!==null)return Fn(n,e,i),Tx(n,t,i),!0}return!1}function lg(e,t,n,i){if(i={lane:2,revertLane:vg(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},gh(e)){if(t)throw Error(it(479))}else t=Gm(e,n,i,2),t!==null&&Fn(t,e,2)}function gh(e){var t=e.alternate;return e===kt||t!==null&&t===kt}function bx(e,t){Xr=ku=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Tx(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,cy(e,n)}}var Ll={readContext:pn,use:ph,useCallback:He,useContext:He,useEffect:He,useImperativeHandle:He,useLayoutEffect:He,useInsertionEffect:He,useMemo:He,useReducer:He,useRef:He,useState:He,useDebugValue:He,useDeferredValue:He,useTransition:He,useSyncExternalStore:He,useId:He,useHostTransitionStatus:He,useFormState:He,useActionState:He,useOptimistic:He,useMemoCache:He,useCacheRefresh:He};Ll.useEffectEvent=He;var Ex={readContext:pn,use:ph,useCallback:function(e,t){return Un().memoizedState=[e,t===void 0?null:t],e},useContext:pn,useEffect:l_,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,bu(4194308,4,fx.bind(null,t,e),n)},useLayoutEffect:function(e,t){return bu(4194308,4,e,t)},useInsertionEffect:function(e,t){bu(4,2,e,t)},useMemo:function(e,t){var n=Un();t=t===void 0?null:t;var i=e();if(Xa){Gs(!0);try{e()}finally{Gs(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=Un();if(n!==void 0){var s=n(t);if(Xa){Gs(!0);try{n(t)}finally{Gs(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=VT.bind(null,kt,e),[i.memoizedState,e]},useRef:function(e){var t=Un();return e={current:e},t.memoizedState=e},useState:function(e){e=rm(e);var t=e.queue,n=Mx.bind(null,kt,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:ag,useDeferredValue:function(e,t){var n=Un();return rg(n,e,t)},useTransition:function(){var e=rm(!1);return e=vx.bind(null,kt,e.queue,!0,!1),Un().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=kt,s=Un();if(ee){if(n===void 0)throw Error(it(407));n=n()}else{if(n=t(),Se===null)throw Error(it(349));(Qt&127)!==0||jy(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,l_(tx.bind(null,i,a,e),[e]),i.flags|=2048,jr(9,{destroy:void 0},$y.bind(null,i,a,n,t),null),n},useId:function(){var e=Un(),t=Se.identifierPrefix;if(ee){var n=ki,i=Gi;n=(i&~(1<<32-Qn(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Wu++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=IT++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:og,useFormState:a_,useActionState:a_,useOptimistic:function(e){var t=Un();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=lg.bind(null,kt,!0,n),n.dispatch=t,[e,t]},useMemoCache:ng,useCacheRefresh:function(){return Un().memoizedState=HT.bind(null,kt)},useEffectEvent:function(e){var t=Un(),n={impl:e};return t.memoizedState=n,function(){if((oe&2)!==0)throw Error(it(440));return n.impl.apply(void 0,arguments)}}},cg={readContext:pn,use:ph,useCallback:px,useContext:pn,useEffect:sg,useImperativeHandle:dx,useInsertionEffect:ux,useLayoutEffect:hx,useMemo:mx,useReducer:Mu,useRef:lx,useState:function(){return Mu(ys)},useDebugValue:ag,useDeferredValue:function(e,t){var n=Xe();return gx(n,_e.memoizedState,e,t)},useTransition:function(){var e=Mu(ys)[0],t=Xe().memoizedState;return[typeof e=="boolean"?e:Xl(e),t]},useSyncExternalStore:Qy,useId:xx,useHostTransitionStatus:og,useFormState:r_,useActionState:r_,useOptimistic:function(e,t){var n=Xe();return ix(n,_e,e,t)},useMemoCache:ng,useCacheRefresh:Sx};cg.useEffectEvent=cx;var Ax={readContext:pn,use:ph,useCallback:px,useContext:pn,useEffect:sg,useImperativeHandle:dx,useInsertionEffect:ux,useLayoutEffect:hx,useMemo:mx,useReducer:gp,useRef:lx,useState:function(){return gp(ys)},useDebugValue:ag,useDeferredValue:function(e,t){var n=Xe();return _e===null?rg(n,e,t):gx(n,_e.memoizedState,e,t)},useTransition:function(){var e=gp(ys)[0],t=Xe().memoizedState;return[typeof e=="boolean"?e:Xl(e),t]},useSyncExternalStore:Qy,useId:xx,useHostTransitionStatus:og,useFormState:o_,useActionState:o_,useOptimistic:function(e,t){var n=Xe();return _e!==null?ix(n,_e,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:ng,useCacheRefresh:Sx};Ax.useEffectEvent=cx;function vp(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:De({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var cm={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=jn(),s=Js(i);s.payload=t,n!=null&&(s.callback=n),t=Ks(e,s,i),t!==null&&(Fn(t,e,i),ml(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=jn(),s=Js(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=Ks(e,s,i),t!==null&&(Fn(t,e,i),ml(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=jn(),i=Js(n);i.tag=2,t!=null&&(i.callback=t),t=Ks(e,i,n),t!==null&&(Fn(t,e,n),ml(t,e,n))}};function c_(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!wl(n,i)||!wl(s,a):!0}function u_(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&cm.enqueueReplaceState(t,t.state,null)}function qa(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=De({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function wx(e){Pu(e)}function Cx(e){console.error(e)}function Rx(e){Pu(e)}function Xu(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function h_(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function um(e,t,n){return n=Js(n),n.tag=3,n.payload={element:null},n.callback=function(){Xu(e,t)},n}function Dx(e){return e=Js(e),e.tag=3,e}function Ux(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){h_(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){h_(t,n,i),typeof s!="function"&&(Qs===null?Qs=new Set([this]):Qs.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function GT(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&ro(t,n,s,!0),n=ti.current,n!==null){switch(n.tag){case 31:case 13:return gi===null?Ku():n.alternate===null&&Ve===0&&(Ve=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===Hu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),Cp(e,i,s)),!1;case 22:return n.flags|=65536,i===Hu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),Cp(e,i,s)),!1}throw Error(it(435,n.tag))}return Cp(e,i,s),Ku(),!1}if(ee)return t=ti.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==Qp&&(e=Error(it(422),{cause:i}),Rl(pi(e,n)))):(i!==Qp&&(t=Error(it(423),{cause:i}),Rl(pi(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=pi(i,n),s=um(e.stateNode,i,s),mp(e,s),Ve!==4&&(Ve=2)),!1;var a=Error(it(520),{cause:i});if(a=pi(a,n),Sl===null?Sl=[a]:Sl.push(a),Ve!==4&&(Ve=2),t===null)return!0;i=pi(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=um(n.stateNode,i,e),mp(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(Qs===null||!Qs.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=Dx(s),Ux(s,e,n,i),mp(n,s),!1}n=n.return}while(n!==null);return!1}var ug=Error(it(461)),Ke=!1;function hn(e,t,n,i){t.child=e===null?Xy(t,null,n,i):Wa(t,e.child,n,i)}function f_(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return ka(t),i=jm(e,t,n,r,a,s),o=$m(),e!==null&&!Ke?(tg(e,t,s),xs(e,t,s)):(ee&&o&&Wm(t),t.flags|=1,hn(e,t,i,s),t.child)}function d_(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!km(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Lx(e,t,a,i,s)):(e=xu(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!hg(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:wl,n(r,i)&&e.ref===t.ref)return xs(e,t,s)}return t.flags|=1,e=ps(a,i),e.ref=t.ref,e.return=t,t.child=e}function Lx(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(wl(a,i)&&e.ref===t.ref)if(Ke=!1,t.pendingProps=i=a,hg(e,s))(e.flags&131072)!==0&&(Ke=!0);else return t.lanes=e.lanes,xs(e,t,s)}return hm(e,t,n,i,s)}function Nx(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return p_(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Su(t,a!==null?a.cachePool:null),a!==null?n_(t,a):sm(),Zy(t);else return i=t.lanes=536870912,p_(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(Su(t,a.cachePool),n_(t,a),Hs(t),t.memoizedState=null):(e!==null&&Su(t,null),sm(),Hs(t));return hn(e,t,s,n),t.child}function cl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function p_(e,t,n,i,s){var a=Ym();return a=a===null?null:{parent:Je._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Su(t,null),sm(),Zy(t),e!==null&&ro(e,t,i,!0),t.childLanes=s,null}function Tu(e,t){return t=qu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function m_(e,t,n){return Wa(t,e.child,null,n),e=Tu(t,t.pendingProps),e.flags|=2,qn(t),t.memoizedState=null,e}function kT(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ee){if(i.mode==="hidden")return e=Tu(t,i),t.lanes=536870912,cl(null,e);if(am(t),(e=Re)?(e=ES(e,mi),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:na!==null?{id:Gi,overflow:ki}:null,retryLane:536870912,hydrationErrors:null},n=Fy(e),n.return=t,t.child=n,dn=t,Re=null)):e=null,e===null)throw ia(t);return t.lanes=536870912,null}return Tu(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(am(t),s)if(t.flags&256)t.flags&=-257,t=m_(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(it(558));else if(Ke||ro(e,t,n,!1),s=(n&e.childLanes)!==0,Ke||s){if(i=Se,i!==null&&(r=uy(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,Ka(e,r),Fn(i,e,r),ug;Ku(),t=m_(e,t,n)}else e=a.treeContext,Re=vi(r.nextSibling),dn=t,ee=!0,Zs=null,mi=!1,e!==null&&Hy(t,e),t=Tu(t,i),t.flags|=4096;return t}return e=ps(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Eu(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(it(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function hm(e,t,n,i,s){return ka(t),n=jm(e,t,n,i,void 0,s),i=$m(),e!==null&&!Ke?(tg(e,t,s),xs(e,t,s)):(ee&&i&&Wm(t),t.flags|=1,hn(e,t,n,s),t.child)}function g_(e,t,n,i,s,a){return ka(t),t.updateQueue=null,n=Ky(t,i,n,s),Jy(e),i=$m(),e!==null&&!Ke?(tg(e,t,a),xs(e,t,a)):(ee&&i&&Wm(t),t.flags|=1,hn(e,t,n,a),t.child)}function v_(e,t,n,i,s){if(ka(t),t.stateNode===null){var a=Pr,r=n.contextType;typeof r=="object"&&r!==null&&(a=pn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=cm,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},Jm(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?pn(r):Pr,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&(vp(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&cm.enqueueReplaceState(a,a.state,null),vl(t,i,a,s),gl(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=qa(n,o);a.props=l;var c=a.context,f=n.contextType;r=Pr,typeof f=="object"&&f!==null&&(r=pn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&u_(t,a,i,r),Bs=!1;var u=t.memoizedState;a.state=u,vl(t,i,a,s),gl(),c=t.memoizedState,o||u!==c||Bs?(typeof p=="function"&&(vp(t,n,p,i),c=t.memoizedState),(l=Bs||c_(t,n,l,i,u,c,r))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,nm(e,t),r=t.memoizedProps,f=qa(n,r),a.props=f,p=t.pendingProps,u=a.context,c=n.contextType,l=Pr,typeof c=="object"&&c!==null&&(l=pn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==p||u!==l)&&u_(t,a,i,l),Bs=!1,u=t.memoizedState,a.state=u,vl(t,i,a,s),gl();var d=t.memoizedState;r!==p||u!==d||Bs||e!==null&&e.dependencies!==null&&zu(e.dependencies)?(typeof o=="function"&&(vp(t,n,o,i),d=t.memoizedState),(f=Bs||c_(t,n,f,i,u,d,l)||e!==null&&e.dependencies!==null&&zu(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,d,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,d,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=d),a.props=i,a.state=d,a.context=l,i=f):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,Eu(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=Wa(t,e.child,null,s),t.child=Wa(t,null,n,s)):hn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=xs(e,t,s),e}function __(e,t,n,i){return Ga(),t.flags|=256,hn(e,t,n,i),t.child}var _p={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function yp(e){return{baseLanes:e,cachePool:Gy()}}function xp(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=Zn),e}function Ix(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(We.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(ee){if(s?zs(t):Hs(t),(e=Re)?(e=ES(e,mi),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:na!==null?{id:Gi,overflow:ki}:null,retryLane:536870912,hydrationErrors:null},n=Fy(e),n.return=t,t.child=n,dn=t,Re=null)):e=null,e===null)throw ia(t);return Em(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(Hs(t),s=t.mode,o=qu({mode:"hidden",children:o},s),i=Fa(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=yp(n),i.childLanes=xp(e,r,n),t.memoizedState=_p,cl(null,i)):(zs(t),fm(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(zs(t),t.flags&=-257,t=Sp(e,t,n)):t.memoizedState!==null?(Hs(t),t.child=e.child,t.flags|=128,t=null):(Hs(t),o=i.fallback,s=t.mode,i=qu({mode:"visible",children:i.children},s),o=Fa(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,Wa(t,e.child,null,n),i=t.child,i.memoizedState=yp(n),i.childLanes=xp(e,r,n),t.memoizedState=_p,t=cl(null,i));else if(zs(t),Em(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error(it(419)),i.stack="",i.digest=r,Rl({value:i,source:null,stack:null}),t=Sp(e,t,n)}else if(Ke||ro(e,t,n,!1),r=(n&e.childLanes)!==0,Ke||r){if(r=Se,r!==null&&(i=uy(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,Ka(e,i),Fn(r,e,i),ug;Tm(o)||Ku(),t=Sp(e,t,n)}else Tm(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Re=vi(o.nextSibling),dn=t,ee=!0,Zs=null,mi=!1,e!==null&&Hy(t,e),t=fm(t,i.children),t.flags|=4096);return t}return s?(Hs(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=ps(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=ps(c,o):(o=Fa(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,cl(null,i),i=t.child,o=e.child.memoizedState,o===null?o=yp(n):(s=o.cachePool,s!==null?(l=Je._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=Gy(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=xp(e,r,n),t.memoizedState=_p,cl(e.child,i)):(zs(t),n=e.child,e=n.sibling,n=ps(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function fm(e,t){return t=qu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function qu(e,t){return e=Yn(22,e,null,t),e.lanes=0,e}function Sp(e,t,n){return Wa(t,e.child,null,n),e=fm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function y_(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),$p(e.return,t,n)}function Mp(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function Ox(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=We.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,Ee(We,r),hn(e,t,i,n),i=ee?Cl:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&y_(e,n,t);else if(e.tag===19)y_(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&Gu(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),Mp(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&Gu(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}Mp(t,!0,n,null,a,i);break;case"together":Mp(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function xs(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),aa|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(ro(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(it(153));if(t.child!==null){for(e=t.child,n=ps(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ps(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function hg(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&zu(e)))}function WT(e,t,n){switch(t.tag){case 3:Lu(t,t.stateNode.containerInfo),Fs(t,Je,e.memoizedState.cache),Ga();break;case 27:case 5:Hp(t);break;case 4:Lu(t,t.stateNode.containerInfo);break;case 10:Fs(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,am(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(zs(t),t.flags|=128,null):(n&t.child.childLanes)!==0?Ix(e,t,n):(zs(t),e=xs(e,t,n),e!==null?e.sibling:null);zs(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(ro(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return Ox(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),Ee(We,We.current),i)break;return null;case 22:return t.lanes=0,Nx(e,t,n,t.pendingProps);case 24:Fs(t,Je,e.memoizedState.cache)}return xs(e,t,n)}function Px(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)Ke=!0;else{if(!hg(e,n)&&(t.flags&128)===0)return Ke=!1,WT(e,t,n);Ke=(e.flags&131072)!==0}else Ke=!1,ee&&(t.flags&1048576)!==0&&zy(t,Cl,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=Oa(t.elementType),t.type=e,typeof e=="function")km(e)?(i=qa(e,i),t.tag=1,t=v_(null,t,e,i,n)):(t.tag=0,t=hm(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===Rm){t.tag=11,t=f_(null,t,e,i,n);break t}else if(s===Dm){t.tag=14,t=d_(null,t,e,i,n);break t}}throw t=Fp(e)||e,Error(it(306,t,""))}}return t;case 0:return hm(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=qa(i,t.pendingProps),v_(e,t,i,s,n);case 3:t:{if(Lu(t,t.stateNode.containerInfo),e===null)throw Error(it(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,nm(e,t),vl(t,i,null,n);var r=t.memoizedState;if(i=r.cache,Fs(t,Je,i),i!==a.cache&&tm(t,[Je],n,!0),gl(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=__(e,t,i,n);break t}else if(i!==s){s=pi(Error(it(424)),t),Rl(s),t=__(e,t,i,n);break t}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Re=vi(e.firstChild),dn=t,ee=!0,Zs=null,mi=!0,n=Xy(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Ga(),i===s){t=xs(e,t,n);break t}hn(e,t,i,n)}t=t.child}return t;case 26:return Eu(e,t),e===null?(n=V_(t.type,null,t.pendingProps,null))?t.memoizedState=n:ee||(n=t.type,e=t.pendingProps,i=th(Ys.current).createElement(n),i[fn]=t,i[zn]=e,mn(i,n,e),rn(i),t.stateNode=i):t.memoizedState=V_(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Hp(t),e===null&&ee&&(i=t.stateNode=AS(t.type,t.pendingProps,Ys.current),dn=t,mi=!0,s=Re,oa(t.type)?(Am=s,Re=vi(i.firstChild)):Re=s),hn(e,t,t.pendingProps.children,n),Eu(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ee&&((s=i=Re)&&(i=_E(i,t.type,t.pendingProps,mi),i!==null?(t.stateNode=i,dn=t,Re=vi(i.firstChild),mi=!1,s=!0):s=!1),s||ia(t)),Hp(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,Mm(s,a)?i=null:r!==null&&Mm(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=jm(e,t,OT,null,null,n),Ol._currentValue=s),Eu(e,t),hn(e,t,i,n),t.child;case 6:return e===null&&ee&&((e=n=Re)&&(n=yE(n,t.pendingProps,mi),n!==null?(t.stateNode=n,dn=t,Re=null,e=!0):e=!1),e||ia(t)),null;case 13:return Ix(e,t,n);case 4:return Lu(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Wa(t,null,i,n):hn(e,t,i,n),t.child;case 11:return f_(e,t,t.type,t.pendingProps,n);case 7:return hn(e,t,t.pendingProps,n),t.child;case 8:return hn(e,t,t.pendingProps.children,n),t.child;case 12:return hn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,Fs(t,t.type,i.value),hn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,ka(t),s=pn(s),i=i(s),t.flags|=1,hn(e,t,i,n),t.child;case 14:return d_(e,t,t.type,t.pendingProps,n);case 15:return Lx(e,t,t.type,t.pendingProps,n);case 19:return Ox(e,t,n);case 31:return kT(e,t,n);case 22:return Nx(e,t,n,t.pendingProps);case 24:return ka(t),i=pn(Je),e===null?(s=Ym(),s===null&&(s=Se,a=qm(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},Jm(t),Fs(t,Je,s)):((e.lanes&n)!==0&&(nm(e,t),vl(t,null,null,n),gl()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),Fs(t,Je,i)):(i=a.cache,Fs(t,Je,i),i!==s.cache&&tm(t,[Je],n,!0))),hn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(it(156,t.tag))}function as(e){e.flags|=4}function bp(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(rS())e.flags|=8192;else throw Ha=Hu,Zm}else e.flags&=-16777217}function x_(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!RS(t))if(rS())e.flags|=8192;else throw Ha=Hu,Zm}function cu(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?oy():536870912,e.lanes|=t,$r|=t)}function nl(e,t){if(!ee)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function Ce(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function XT(e,t,n){var i=t.pendingProps;switch(Xm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ce(t),null;case 1:return Ce(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),ms(Je),Yr(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Tr(t)?as(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,pp())),Ce(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(as(t),a!==null?(Ce(t),x_(t,a)):(Ce(t),bp(t,s,null,i,n))):a?a!==e.memoizedState?(as(t),Ce(t),x_(t,a)):(Ce(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&as(t),Ce(t),bp(t,s,e,i,n)),null;case 27:if(Nu(t),n=Ys.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(!i){if(t.stateNode===null)throw Error(it(166));return Ce(t),null}e=Xi.current,Tr(t)?Jv(t,e):(e=AS(s,i,n),t.stateNode=e,as(t))}return Ce(t),null;case 5:if(Nu(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(!i){if(t.stateNode===null)throw Error(it(166));return Ce(t),null}if(a=Xi.current,Tr(t))Jv(t,a);else{var r=th(Ys.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[fn]=t,a[zn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(mn(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&as(t)}}return Ce(t),bp(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(it(166));if(e=Ys.current,Tr(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=dn,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[fn]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||MS(e.nodeValue,n)),e||ia(t,!0)}else e=th(e).createTextNode(i),e[fn]=t,t.stateNode=e}return Ce(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Tr(t),n!==null){if(e===null){if(!i)throw Error(it(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(it(557));e[fn]=t}else Ga(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ce(t),e=!1}else n=pp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(qn(t),t):(qn(t),null);if((t.flags&128)!==0)throw Error(it(558))}return Ce(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Tr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error(it(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(it(317));s[fn]=t}else Ga(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ce(t),s=!1}else s=pp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(qn(t),t):(qn(t),null)}return qn(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),cu(t,t.updateQueue),Ce(t),null);case 4:return Yr(),e===null&&_g(t.stateNode.containerInfo),Ce(t),null;case 10:return ms(t.type),Ce(t),null;case 19:if(on(We),i=t.memoizedState,i===null)return Ce(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)nl(i,!1);else{if(Ve!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=Gu(e),a!==null){for(t.flags|=128,nl(i,!1),e=a.updateQueue,t.updateQueue=e,cu(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)By(n,e),n=n.sibling;return Ee(We,We.current&1|2),ee&&cs(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Jn()>Zu&&(t.flags|=128,s=!0,nl(i,!1),t.lanes=4194304)}else{if(!s)if(e=Gu(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,cu(t,e),nl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!ee)return Ce(t),null}else 2*Jn()-i.renderingStartTime>Zu&&n!==536870912&&(t.flags|=128,s=!0,nl(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Jn(),e.sibling=null,n=We.current,Ee(We,s?n&1|2:n&1),ee&&cs(t,i.treeForkCount),e):(Ce(t),null);case 22:case 23:return qn(t),Km(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(Ce(t),t.subtreeFlags&6&&(t.flags|=8192)):Ce(t),n=t.updateQueue,n!==null&&cu(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&on(za),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ms(Je),Ce(t),null;case 25:return null;case 30:return null}throw Error(it(156,t.tag))}function qT(e,t){switch(Xm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ms(Je),Yr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Nu(t),null;case 31:if(t.memoizedState!==null){if(qn(t),t.alternate===null)throw Error(it(340));Ga()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(qn(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(it(340));Ga()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return on(We),null;case 4:return Yr(),null;case 10:return ms(t.type),null;case 22:case 23:return qn(t),Km(),e!==null&&on(za),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ms(Je),null;case 25:return null;default:return null}}function Bx(e,t){switch(Xm(t),t.tag){case 3:ms(Je),Yr();break;case 26:case 27:case 5:Nu(t);break;case 4:Yr();break;case 31:t.memoizedState!==null&&qn(t);break;case 13:qn(t);break;case 19:on(We);break;case 10:ms(t.type);break;case 22:case 23:qn(t),Km(),e!==null&&on(za);break;case 24:ms(Je)}}function ql(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){pe(t,t.return,o)}}function sa(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(f){pe(s,l,f)}}}i=i.next}while(i!==a)}}catch(f){pe(t,t.return,f)}}function Fx(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Yy(t,n)}catch(i){pe(e,e.return,i)}}}function zx(e,t,n){n.props=qa(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){pe(e,t,i)}}function yl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){pe(e,t,s)}}function Wi(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){pe(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){pe(e,t,s)}else n.current=null}function Hx(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){pe(e,e.return,s)}}function Tp(e,t,n){try{var i=e.stateNode;fE(i,e.type,n,t),i[zn]=t}catch(s){pe(e,e.return,s)}}function Vx(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&oa(e.type)||e.tag===4}function Ep(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Vx(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&oa(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function dm(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=fs));else if(i!==4&&(i===27&&oa(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(dm(e,t,n),e=e.sibling;e!==null;)dm(e,t,n),e=e.sibling}function Yu(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&oa(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Yu(e,t,n),e=e.sibling;e!==null;)Yu(e,t,n),e=e.sibling}function Gx(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);mn(t,i,n),t[fn]=e,t[zn]=n}catch(a){pe(e,e.return,a)}}var us=!1,Ze=!1,Ap=!1,S_=typeof WeakSet=="function"?WeakSet:Set,an=null;function YT(e,t){if(e=e.containerInfo,xm=sh,e=Ry(e),Hm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,f=0,p=e,u=null;e:for(;;){for(var d;p!==n||s!==0&&p.nodeType!==3||(o=r+s),p!==a||i!==0&&p.nodeType!==3||(l=r+i),p.nodeType===3&&(r+=p.nodeValue.length),(d=p.firstChild)!==null;)u=p,p=d;for(;;){if(p===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++f===i&&(l=r),(d=p.nextSibling)!==null)break;p=u,u=p.parentNode}p=d}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Sm={focusedElem:e,selectionRange:n},sh=!1,an=t;an!==null;)if(t=an,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,an=e;else for(;an!==null;){switch(t=an,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var g=qa(n.type,s);e=i.getSnapshotBeforeUpdate(g,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(b){pe(n,n.return,b)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)bm(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":bm(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(it(163))}if(e=t.sibling,e!==null){e.return=t.return,an=e;break}an=t.return}}function kx(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:os(e,n),i&4&&ql(5,n);break;case 1:if(os(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){pe(n,n.return,r)}else{var s=qa(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){pe(n,n.return,r)}}i&64&&Fx(n),i&512&&yl(n,n.return);break;case 3:if(os(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Yy(e,t)}catch(r){pe(n,n.return,r)}}break;case 27:t===null&&i&4&&Gx(n);case 26:case 5:os(e,n),t===null&&i&4&&Hx(n),i&512&&yl(n,n.return);break;case 12:os(e,n);break;case 31:os(e,n),i&4&&qx(e,n);break;case 13:os(e,n),i&4&&Yx(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=nE.bind(null,n),xE(e,n))));break;case 22:if(i=n.memoizedState!==null||us,!i){t=t!==null&&t.memoizedState!==null||Ze,s=us;var a=Ze;us=i,(Ze=t)&&!a?ls(e,n,(n.subtreeFlags&8772)!==0):os(e,n),us=s,Ze=a}break;case 30:break;default:os(e,n)}}function Wx(e){var t=e.alternate;t!==null&&(e.alternate=null,Wx(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Im(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Oe=null,Pn=!1;function rs(e,t,n){for(n=n.child;n!==null;)Xx(e,t,n),n=n.sibling}function Xx(e,t,n){if(Kn&&typeof Kn.onCommitFiberUnmount=="function")try{Kn.onCommitFiberUnmount(zl,n)}catch{}switch(n.tag){case 26:Ze||Wi(n,t),rs(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Ze||Wi(n,t);var i=Oe,s=Pn;oa(n.type)&&(Oe=n.stateNode,Pn=!1),rs(e,t,n),bl(n.stateNode),Oe=i,Pn=s;break;case 5:Ze||Wi(n,t);case 6:if(i=Oe,s=Pn,Oe=null,rs(e,t,n),Oe=i,Pn=s,Oe!==null)if(Pn)try{(Oe.nodeType===9?Oe.body:Oe.nodeName==="HTML"?Oe.ownerDocument.body:Oe).removeChild(n.stateNode)}catch(a){pe(n,t,a)}else try{Oe.removeChild(n.stateNode)}catch(a){pe(n,t,a)}break;case 18:Oe!==null&&(Pn?(e=Oe,P_(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),io(e)):P_(Oe,n.stateNode));break;case 4:i=Oe,s=Pn,Oe=n.stateNode.containerInfo,Pn=!0,rs(e,t,n),Oe=i,Pn=s;break;case 0:case 11:case 14:case 15:sa(2,n,t),Ze||sa(4,n,t),rs(e,t,n);break;case 1:Ze||(Wi(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&zx(n,t,i)),rs(e,t,n);break;case 21:rs(e,t,n);break;case 22:Ze=(i=Ze)||n.memoizedState!==null,rs(e,t,n),Ze=i;break;default:rs(e,t,n)}}function qx(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{io(e)}catch(n){pe(t,t.return,n)}}}function Yx(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{io(e)}catch(n){pe(t,t.return,n)}}function ZT(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new S_),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new S_),t;default:throw Error(it(435,e.tag))}}function uu(e,t){var n=ZT(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=iE.bind(null,e,i);i.then(s,s)}})}function In(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(oa(o.type)){Oe=o.stateNode,Pn=!1;break t}break;case 5:Oe=o.stateNode,Pn=!1;break t;case 3:case 4:Oe=o.stateNode.containerInfo,Pn=!0;break t}o=o.return}if(Oe===null)throw Error(it(160));Xx(a,r,s),Oe=null,Pn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Zx(t,e),t=t.sibling}var Ei=null;function Zx(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:In(t,e),On(e),i&4&&(sa(3,e,e.return),ql(3,e),sa(5,e,e.return));break;case 1:In(t,e),On(e),i&512&&(Ze||n===null||Wi(n,n.return)),i&64&&us&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Ei;if(In(t,e),On(e),i&512&&(Ze||n===null||Wi(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[Gl]||a[fn]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),mn(a,i,n),a[fn]=e,rn(a),i=a;break t;case"link":var r=k_("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),mn(a,i,n),s.head.appendChild(a);break;case"meta":if(r=k_("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),mn(a,i,n),s.head.appendChild(a);break;default:throw Error(it(468,i))}a[fn]=e,rn(a),i=a}e.stateNode=i}else W_(s,e.type,e.stateNode);else e.stateNode=G_(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?W_(s,e.type,e.stateNode):G_(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&Tp(e,e.memoizedProps,n.memoizedProps)}break;case 27:In(t,e),On(e),i&512&&(Ze||n===null||Wi(n,n.return)),n!==null&&i&4&&Tp(e,e.memoizedProps,n.memoizedProps);break;case 5:if(In(t,e),On(e),i&512&&(Ze||n===null||Wi(n,n.return)),e.flags&32){s=e.stateNode;try{Jr(s,"")}catch(g){pe(e,e.return,g)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,Tp(e,s,n!==null?n.memoizedProps:s)),i&1024&&(Ap=!0);break;case 6:if(In(t,e),On(e),i&4){if(e.stateNode===null)throw Error(it(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(g){pe(e,e.return,g)}}break;case 3:if(Cu=null,s=Ei,Ei=eh(t.containerInfo),In(t,e),Ei=s,On(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{io(t.containerInfo)}catch(g){pe(e,e.return,g)}Ap&&(Ap=!1,Jx(e));break;case 4:i=Ei,Ei=eh(e.stateNode.containerInfo),In(t,e),On(e),Ei=i;break;case 12:In(t,e),On(e);break;case 31:In(t,e),On(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,uu(e,i)));break;case 13:In(t,e),On(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(vh=Jn()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,uu(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=us,f=Ze;if(us=c||s,Ze=f||l,In(t,e),Ze=f,us=c,On(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||us||Ze||Pa(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var p=l.memoizedProps.style,u=p!=null&&p.hasOwnProperty("display")?p.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(g){pe(l,l.return,g)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(g){pe(l,l.return,g)}}}else if(t.tag===18){if(n===null){l=t;try{var d=l.stateNode;s?B_(d,!0):B_(l.stateNode,!1)}catch(g){pe(l,l.return,g)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,uu(e,n))));break;case 19:In(t,e),On(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,uu(e,i)));break;case 30:break;case 21:break;default:In(t,e),On(e)}}function On(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Vx(i)){n=i;break}i=i.return}if(n==null)throw Error(it(160));switch(n.tag){case 27:var s=n.stateNode,a=Ep(e);Yu(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&(Jr(r,""),n.flags&=-33);var o=Ep(e);Yu(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Ep(e);dm(e,c,l);break;default:throw Error(it(161))}}catch(f){pe(e,e.return,f)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Jx(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Jx(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function os(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)kx(e,t.alternate,t),t=t.sibling}function Pa(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:sa(4,t,t.return),Pa(t);break;case 1:Wi(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&zx(t,t.return,n),Pa(t);break;case 27:bl(t.stateNode);case 26:case 5:Wi(t,t.return),Pa(t);break;case 22:t.memoizedState===null&&Pa(t);break;case 30:Pa(t);break;default:Pa(t)}e=e.sibling}}function ls(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:ls(s,a,n),ql(4,a);break;case 1:if(ls(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){pe(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)qy(l[s],o)}catch(c){pe(i,i.return,c)}}n&&r&64&&Fx(a),yl(a,a.return);break;case 27:Gx(a);case 26:case 5:ls(s,a,n),n&&i===null&&r&4&&Hx(a),yl(a,a.return);break;case 12:ls(s,a,n);break;case 31:ls(s,a,n),n&&r&4&&qx(s,a);break;case 13:ls(s,a,n),n&&r&4&&Yx(s,a);break;case 22:a.memoizedState===null&&ls(s,a,n),yl(a,a.return);break;case 30:break;default:ls(s,a,n)}t=t.sibling}}function fg(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Wl(n))}function dg(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Wl(e))}function Ti(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Kx(e,t,n,i),t=t.sibling}function Kx(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:Ti(e,t,n,i),s&2048&&ql(9,t);break;case 1:Ti(e,t,n,i);break;case 3:Ti(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Wl(e)));break;case 12:if(s&2048){Ti(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){pe(t,t.return,l)}}else Ti(e,t,n,i);break;case 31:Ti(e,t,n,i);break;case 13:Ti(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?Ti(e,t,n,i):xl(e,t):a._visibility&2?Ti(e,t,n,i):(a._visibility|=2,Ar(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&fg(r,t);break;case 24:Ti(e,t,n,i),s&2048&&dg(t.alternate,t);break;default:Ti(e,t,n,i)}}function Ar(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:Ar(a,r,o,l,s),ql(8,r);break;case 23:break;case 22:var f=r.stateNode;r.memoizedState!==null?f._visibility&2?Ar(a,r,o,l,s):xl(a,r):(f._visibility|=2,Ar(a,r,o,l,s)),s&&c&2048&&fg(r.alternate,r);break;case 24:Ar(a,r,o,l,s),s&&c&2048&&dg(r.alternate,r);break;default:Ar(a,r,o,l,s)}t=t.sibling}}function xl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:xl(n,i),s&2048&&fg(i.alternate,i);break;case 24:xl(n,i),s&2048&&dg(i.alternate,i);break;default:xl(n,i)}t=t.sibling}}var ul=8192;function Er(e,t,n){if(e.subtreeFlags&ul)for(e=e.child;e!==null;)Qx(e,t,n),e=e.sibling}function Qx(e,t,n){switch(e.tag){case 26:Er(e,t,n),e.flags&ul&&e.memoizedState!==null&&LE(n,Ei,e.memoizedState,e.memoizedProps);break;case 5:Er(e,t,n);break;case 3:case 4:var i=Ei;Ei=eh(e.stateNode.containerInfo),Er(e,t,n),Ei=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=ul,ul=16777216,Er(e,t,n),ul=i):Er(e,t,n));break;default:Er(e,t,n)}}function jx(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function il(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];an=i,tS(i,e)}jx(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)$x(e),e=e.sibling}function $x(e){switch(e.tag){case 0:case 11:case 15:il(e),e.flags&2048&&sa(9,e,e.return);break;case 3:il(e);break;case 12:il(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Au(e)):il(e);break;default:il(e)}}function Au(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];an=i,tS(i,e)}jx(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:sa(8,t,t.return),Au(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Au(t));break;default:Au(t)}e=e.sibling}}function tS(e,t){for(;an!==null;){var n=an;switch(n.tag){case 0:case 11:case 15:sa(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Wl(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,an=i;else t:for(n=e;an!==null;){i=an;var s=i.sibling,a=i.return;if(Wx(i),i===n){an=null;break t}if(s!==null){s.return=a,an=s;break t}an=a}}}var JT={getCacheForType:function(e){var t=pn(Je),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return pn(Je).controller.signal}},KT=typeof WeakMap=="function"?WeakMap:Map,oe=0,Se=null,Jt=null,Qt=0,de=0,Xn=null,Ws=!1,lo=!1,pg=!1,Ss=0,Ve=0,aa=0,Va=0,mg=0,Zn=0,$r=0,Sl=null,Bn=null,pm=!1,vh=0,eS=0,Zu=1/0,Ju=null,Qs=null,tn=0,js=null,to=null,gs=0,mm=0,gm=null,nS=null,Ml=0,vm=null;function jn(){return(oe&2)!==0&&Qt!==0?Qt&-Qt:It.T!==null?vg():hy()}function iS(){if(Zn===0)if((Qt&536870912)===0||ee){var e=tu;tu<<=1,(tu&3932160)===0&&(tu=262144),Zn=e}else Zn=536870912;return e=ti.current,e!==null&&(e.flags|=32),Zn}function Fn(e,t,n){(e===Se&&(de===2||de===9)||e.cancelPendingCommit!==null)&&(eo(e,0),Xs(e,Qt,Zn,!1)),Vl(e,n),((oe&2)===0||e!==Se)&&(e===Se&&((oe&2)===0&&(Va|=n),Ve===4&&Xs(e,Qt,Zn,!1)),Yi(e))}function sS(e,t,n){if((oe&6)!==0)throw Error(it(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||Hl(e,t),s=i?$T(e,t):wp(e,t,!0),a=i;do{if(s===0){lo&&!i&&Xs(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!QT(n)){s=wp(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=Sl;var l=o.current.memoizedState.isDehydrated;if(l&&(eo(o,r).flags|=256),r=wp(o,r,!1),r!==2){if(pg&&!l){o.errorRecoveryDisabledLanes|=a,Va|=a,s=4;break t}a=Bn,Bn=s,a!==null&&(Bn===null?Bn=a:Bn.push.apply(Bn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){eo(e,0),Xs(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error(it(345));case 4:if((t&4194048)!==t)break;case 6:Xs(i,t,Zn,!Ws);break t;case 2:Bn=null;break;case 3:case 5:break;default:throw Error(it(329))}if((t&62914560)===t&&(s=vh+300-Jn(),10<s)){if(Xs(i,t,Zn,!Ws),rh(i,0,!0)!==0)break t;gs=t,i.timeoutHandle=TS(M_.bind(null,i,n,Bn,Ju,pm,t,Zn,Va,$r,Ws,a,"Throttled",-0,0),s);break t}M_(i,n,Bn,Ju,pm,t,Zn,Va,$r,Ws,a,null,-0,0)}}break}while(!0);Yi(e)}function M_(e,t,n,i,s,a,r,o,l,c,f,p,u,d){if(e.timeoutHandle=-1,p=t.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:fs},Qx(t,a,p);var g=(a&62914560)===a?vh-Jn():(a&4194048)===a?eS-Jn():0;if(g=NE(p,g),g!==null){gs=a,e.cancelPendingCommit=g(T_.bind(null,e,t,a,n,i,s,r,o,l,f,p,null,u,d)),Xs(e,a,r,!c);return}}T_(e,t,a,n,i,s,r,o,l)}function QT(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!$n(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Xs(e,t,n,i){t&=~mg,t&=~Va,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-Qn(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&ly(e,n,t)}function _h(){return(oe&6)===0?(Yl(0,!1),!1):!0}function gg(){if(Jt!==null){if(de===0)var e=Jt.return;else e=Jt,ds=Qa=null,eg(e),Wr=null,Dl=0,e=Jt;for(;e!==null;)Bx(e.alternate,e),e=e.return;Jt=null}}function eo(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,mE(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),gs=0,gg(),Se=e,Jt=n=ps(e.current,null),Qt=t,de=0,Xn=null,Ws=!1,lo=Hl(e,t),pg=!1,$r=Zn=mg=Va=aa=Ve=0,Bn=Sl=null,pm=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-Qn(i),a=1<<s;t|=e[s],i&=~a}return Ss=t,uh(),n}function aS(e,t){kt=null,It.H=Ll,t===oo||t===fh?(t=t_(),de=3):t===Zm?(t=t_(),de=4):de=t===ug?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Xn=t,Jt===null&&(Ve=1,Xu(e,pi(t,e.current)))}function rS(){var e=ti.current;return e===null?!0:(Qt&4194048)===Qt?gi===null:(Qt&62914560)===Qt||(Qt&536870912)!==0?e===gi:!1}function oS(){var e=It.H;return It.H=Ll,e===null?Ll:e}function lS(){var e=It.A;return It.A=JT,e}function Ku(){Ve=4,Ws||(Qt&4194048)!==Qt&&ti.current!==null||(lo=!0),(aa&134217727)===0&&(Va&134217727)===0||Se===null||Xs(Se,Qt,Zn,!1)}function wp(e,t,n){var i=oe;oe|=2;var s=oS(),a=lS();(Se!==e||Qt!==t)&&(Ju=null,eo(e,t)),t=!1;var r=Ve;t:do try{if(de!==0&&Jt!==null){var o=Jt,l=Xn;switch(de){case 8:gg(),r=6;break t;case 3:case 2:case 9:case 6:ti.current===null&&(t=!0);var c=de;if(de=0,Xn=null,zr(e,o,l,c),n&&lo){r=0;break t}break;default:c=de,de=0,Xn=null,zr(e,o,l,c)}}jT(),r=Ve;break}catch(f){aS(e,f)}while(!0);return t&&e.shellSuspendCounter++,ds=Qa=null,oe=i,It.H=s,It.A=a,Jt===null&&(Se=null,Qt=0,uh()),r}function jT(){for(;Jt!==null;)cS(Jt)}function $T(e,t){var n=oe;oe|=2;var i=oS(),s=lS();Se!==e||Qt!==t?(Ju=null,Zu=Jn()+500,eo(e,t)):lo=Hl(e,t);t:do try{if(de!==0&&Jt!==null){t=Jt;var a=Xn;e:switch(de){case 1:de=0,Xn=null,zr(e,t,a,1);break;case 2:case 9:if($v(a)){de=0,Xn=null,b_(t);break}t=function(){de!==2&&de!==9||Se!==e||(de=7),Yi(e)},a.then(t,t);break t;case 3:de=7;break t;case 4:de=5;break t;case 7:$v(a)?(de=0,Xn=null,b_(t)):(de=0,Xn=null,zr(e,t,a,7));break;case 5:var r=null;switch(Jt.tag){case 26:r=Jt.memoizedState;case 5:case 27:var o=Jt;if(r?RS(r):o.stateNode.complete){de=0,Xn=null;var l=o.sibling;if(l!==null)Jt=l;else{var c=o.return;c!==null?(Jt=c,yh(c)):Jt=null}break e}}de=0,Xn=null,zr(e,t,a,5);break;case 6:de=0,Xn=null,zr(e,t,a,6);break;case 8:gg(),Ve=6;break t;default:throw Error(it(462))}}tE();break}catch(f){aS(e,f)}while(!0);return ds=Qa=null,It.H=i,It.A=s,oe=n,Jt!==null?0:(Se=null,Qt=0,uh(),Ve)}function tE(){for(;Jt!==null&&!b1();)cS(Jt)}function cS(e){var t=Px(e.alternate,e,Ss);e.memoizedProps=e.pendingProps,t===null?yh(e):Jt=t}function b_(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=g_(n,t,t.pendingProps,t.type,void 0,Qt);break;case 11:t=g_(n,t,t.pendingProps,t.type.render,t.ref,Qt);break;case 5:eg(t);default:Bx(n,t),t=Jt=By(t,Ss),t=Px(n,t,Ss)}e.memoizedProps=e.pendingProps,t===null?yh(e):Jt=t}function zr(e,t,n,i){ds=Qa=null,eg(t),Wr=null,Dl=0;var s=t.return;try{if(GT(e,s,t,n,Qt)){Ve=1,Xu(e,pi(n,e.current)),Jt=null;return}}catch(a){if(s!==null)throw Jt=s,a;Ve=1,Xu(e,pi(n,e.current)),Jt=null;return}t.flags&32768?(ee||i===1?e=!0:lo||(Qt&536870912)!==0?e=!1:(Ws=e=!0,(i===2||i===9||i===3||i===6)&&(i=ti.current,i!==null&&i.tag===13&&(i.flags|=16384))),uS(t,e)):yh(t)}function yh(e){var t=e;do{if((t.flags&32768)!==0){uS(t,Ws);return}e=t.return;var n=XT(t.alternate,t,Ss);if(n!==null){Jt=n;return}if(t=t.sibling,t!==null){Jt=t;return}Jt=t=e}while(t!==null);Ve===0&&(Ve=5)}function uS(e,t){do{var n=qT(e.alternate,e);if(n!==null){n.flags&=32767,Jt=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Jt=e;return}Jt=e=n}while(e!==null);Ve=6,Jt=null}function T_(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do xh();while(tn!==0);if((oe&6)!==0)throw Error(it(327));if(t!==null){if(t===e.current)throw Error(it(177));if(a=t.lanes|t.childLanes,a|=Vm,N1(e,n,a,r,o,l),e===Se&&(Jt=Se=null,Qt=0),to=t,js=e,gs=n,mm=a,gm=s,nS=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,sE(Iu,function(){return mS(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=It.T,It.T=null,s=le.p,le.p=2,r=oe,oe|=4;try{YT(e,t,n)}finally{oe=r,le.p=s,It.T=i}}tn=1,hS(),fS(),dS()}}function hS(){if(tn===1){tn=0;var e=js,t=to,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=It.T,It.T=null;var i=le.p;le.p=2;var s=oe;oe|=4;try{Zx(t,e);var a=Sm,r=Ry(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&Cy(o.ownerDocument.documentElement,o)){if(l!==null&&Hm(o)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(f,o.value.length);else{var p=o.ownerDocument||document,u=p&&p.defaultView||window;if(u.getSelection){var d=u.getSelection(),g=o.textContent.length,b=Math.min(l.start,g),m=l.end===void 0?b:Math.min(l.end,g);!d.extend&&b>m&&(r=m,m=b,b=r);var h=qv(o,b),v=qv(o,m);if(h&&v&&(d.rangeCount!==1||d.anchorNode!==h.node||d.anchorOffset!==h.offset||d.focusNode!==v.node||d.focusOffset!==v.offset)){var S=p.createRange();S.setStart(h.node,h.offset),d.removeAllRanges(),b>m?(d.addRange(S),d.extend(v.node,v.offset)):(S.setEnd(v.node,v.offset),d.addRange(S))}}}}for(p=[],d=o;d=d.parentNode;)d.nodeType===1&&p.push({element:d,left:d.scrollLeft,top:d.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<p.length;o++){var y=p[o];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}sh=!!xm,Sm=xm=null}finally{oe=s,le.p=i,It.T=n}}e.current=t,tn=2}}function fS(){if(tn===2){tn=0;var e=js,t=to,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=It.T,It.T=null;var i=le.p;le.p=2;var s=oe;oe|=4;try{kx(e,t.alternate,t)}finally{oe=s,le.p=i,It.T=n}}tn=3}}function dS(){if(tn===4||tn===3){tn=0,T1();var e=js,t=to,n=gs,i=nS;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?tn=5:(tn=0,to=js=null,pS(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(Qs=null),Nm(n),t=t.stateNode,Kn&&typeof Kn.onCommitFiberRoot=="function")try{Kn.onCommitFiberRoot(zl,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=It.T,s=le.p,le.p=2,It.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{It.T=t,le.p=s}}(gs&3)!==0&&xh(),Yi(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===vm?Ml++:(Ml=0,vm=e):Ml=0,Yl(0,!1)}}function pS(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Wl(t)))}function xh(){return hS(),fS(),dS(),mS()}function mS(){if(tn!==5)return!1;var e=js,t=mm;mm=0;var n=Nm(gs),i=It.T,s=le.p;try{le.p=32>n?32:n,It.T=null,n=gm,gm=null;var a=js,r=gs;if(tn=0,to=js=null,gs=0,(oe&6)!==0)throw Error(it(331));var o=oe;if(oe|=4,$x(a.current),Kx(a,a.current,r,n),oe=o,Yl(0,!1),Kn&&typeof Kn.onPostCommitFiberRoot=="function")try{Kn.onPostCommitFiberRoot(zl,a)}catch{}return!0}finally{le.p=s,It.T=i,pS(e,t)}}function E_(e,t,n){t=pi(n,t),t=um(e.stateNode,t,2),e=Ks(e,t,2),e!==null&&(Vl(e,2),Yi(e))}function pe(e,t,n){if(e.tag===3)E_(e,e,n);else for(;t!==null;){if(t.tag===3){E_(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Qs===null||!Qs.has(i))){e=pi(n,e),n=Dx(2),i=Ks(t,n,2),i!==null&&(Ux(n,i,t,e),Vl(i,2),Yi(i));break}}t=t.return}}function Cp(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new KT;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(pg=!0,s.add(n),e=eE.bind(null,e,t,n),t.then(e,e))}function eE(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Se===e&&(Qt&n)===n&&(Ve===4||Ve===3&&(Qt&62914560)===Qt&&300>Jn()-vh?(oe&2)===0&&eo(e,0):mg|=n,$r===Qt&&($r=0)),Yi(e)}function gS(e,t){t===0&&(t=oy()),e=Ka(e,t),e!==null&&(Vl(e,t),Yi(e))}function nE(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),gS(e,n)}function iE(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(it(314))}i!==null&&i.delete(t),gS(e,n)}function sE(e,t){return Um(e,t)}var Qu=null,wr=null,_m=!1,ju=!1,Rp=!1,qs=0;function Yi(e){e!==wr&&e.next===null&&(wr===null?Qu=wr=e:wr=wr.next=e),ju=!0,_m||(_m=!0,rE())}function Yl(e,t){if(!Rp&&ju){Rp=!0;do for(var n=!1,i=Qu;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-Qn(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,A_(i,a))}else a=Qt,a=rh(i,i===Se?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||Hl(i,a)||(n=!0,A_(i,a));i=i.next}while(n);Rp=!1}}function aE(){vS()}function vS(){ju=_m=!1;var e=0;qs!==0&&pE()&&(e=qs);for(var t=Jn(),n=null,i=Qu;i!==null;){var s=i.next,a=_S(i,t);a===0?(i.next=null,n===null?Qu=s:n.next=s,s===null&&(wr=n)):(n=i,(e!==0||(a&3)!==0)&&(ju=!0)),i=s}tn!==0&&tn!==5||Yl(e,!1),qs!==0&&(qs=0)}function _S(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-Qn(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=L1(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=Se,n=Qt,n=rh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(de===2||de===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&sp(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||Hl(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&sp(i),Nm(n)){case 2:case 8:n=ay;break;case 32:n=Iu;break;case 268435456:n=ry;break;default:n=Iu}return i=yS.bind(null,e),n=Um(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&sp(i),e.callbackPriority=2,e.callbackNode=null,2}function yS(e,t){if(tn!==0&&tn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(xh()&&e.callbackNode!==n)return null;var i=Qt;return i=rh(e,e===Se?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(sS(e,i,t),_S(e,Jn()),e.callbackNode!=null&&e.callbackNode===n?yS.bind(null,e):null)}function A_(e,t){if(xh())return null;sS(e,t,!0)}function rE(){gE(function(){(oe&6)!==0?Um(sy,aE):vS()})}function vg(){if(qs===0){var e=Kr;e===0&&(e=$c,$c<<=1,($c&261888)===0&&($c=256)),qs=e}return qs}function w_(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:vu(""+e)}function C_(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function oE(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=w_((s[zn]||null).action),r=i.submitter;r&&(t=(t=r[zn]||null)?w_(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new oh("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(qs!==0){var l=r?C_(s,r):new FormData(s);lm(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?C_(s,r):new FormData(s),lm(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(hu=0;hu<Kp.length;hu++)fu=Kp[hu],R_=fu.toLowerCase(),D_=fu[0].toUpperCase()+fu.slice(1),Ai(R_,"on"+D_);var fu,R_,D_,hu;Ai(Uy,"onAnimationEnd");Ai(Ly,"onAnimationIteration");Ai(Ny,"onAnimationStart");Ai("dblclick","onDoubleClick");Ai("focusin","onFocus");Ai("focusout","onBlur");Ai(ET,"onTransitionRun");Ai(AT,"onTransitionStart");Ai(wT,"onTransitionCancel");Ai(Iy,"onTransitionEnd");Zr("onMouseEnter",["mouseout","mouseover"]);Zr("onMouseLeave",["mouseout","mouseover"]);Zr("onPointerEnter",["pointerout","pointerover"]);Zr("onPointerLeave",["pointerout","pointerover"]);Ya("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ya("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ya("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ya("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ya("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ya("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Nl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),lE=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Nl));function xS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Pu(f)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Pu(f)}s.currentTarget=null,a=l}}}}function Zt(e,t){var n=t[Gp];n===void 0&&(n=t[Gp]=new Set);var i=e+"__bubble";n.has(i)||(SS(t,e,2,!1),n.add(i))}function Dp(e,t,n){var i=0;t&&(i|=4),SS(n,e,i,t)}var du="_reactListening"+Math.random().toString(36).slice(2);function _g(e){if(!e[du]){e[du]=!0,fy.forEach(function(n){n!=="selectionchange"&&(lE.has(n)||Dp(n,!1,e),Dp(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[du]||(t[du]=!0,Dp("selectionchange",!1,t))}}function SS(e,t,n,i){switch(IS(t)){case 2:var s=PE;break;case 8:s=BE;break;default:s=Mg}n=s.bind(null,t,n,e),s=void 0,!Yp||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function Up(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Dr(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}xy(function(){var c=a,f=Pm(n),p=[];t:{var u=Oy.get(e);if(u!==void 0){var d=oh,g=e;switch(e){case"keypress":if(yu(n)===0)break t;case"keydown":case"keyup":d=iT;break;case"focusin":g="focus",d=cp;break;case"focusout":g="blur",d=cp;break;case"beforeblur":case"afterblur":d=cp;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":d=Bv;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":d=X1;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":d=rT;break;case Uy:case Ly:case Ny:d=Z1;break;case Iy:d=lT;break;case"scroll":case"scrollend":d=k1;break;case"wheel":d=uT;break;case"copy":case"cut":case"paste":d=K1;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":d=zv;break;case"toggle":case"beforetoggle":d=fT}var b=(t&4)!==0,m=!b&&(e==="scroll"||e==="scrollend"),h=b?u!==null?u+"Capture":null:u;b=[];for(var v=c,S;v!==null;){var y=v;if(S=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||S===null||h===null||(y=El(v,h),y!=null&&b.push(Il(v,y,S))),m)break;v=v.return}0<b.length&&(u=new d(u,g,null,n,f),p.push({event:u,listeners:b}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",d=e==="mouseout"||e==="pointerout",u&&n!==qp&&(g=n.relatedTarget||n.fromElement)&&(Dr(g)||g[so]))break t;if((d||u)&&(u=f.window===f?f:(u=f.ownerDocument)?u.defaultView||u.parentWindow:window,d?(g=n.relatedTarget||n.toElement,d=c,g=g?Dr(g):null,g!==null&&(m=Fl(g),b=g.tag,g!==m||b!==5&&b!==27&&b!==6)&&(g=null)):(d=null,g=c),d!==g)){if(b=Bv,y="onMouseLeave",h="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(b=zv,y="onPointerLeave",h="onPointerEnter",v="pointer"),m=d==null?u:ll(d),S=g==null?u:ll(g),u=new b(y,v+"leave",d,n,f),u.target=m,u.relatedTarget=S,y=null,Dr(f)===c&&(b=new b(h,v+"enter",g,n,f),b.target=S,b.relatedTarget=m,y=b),m=y,d&&g)e:{for(b=cE,h=d,v=g,S=0,y=h;y;y=b(y))S++;y=0;for(var T=v;T;T=b(T))y++;for(;0<S-y;)h=b(h),S--;for(;0<y-S;)v=b(v),y--;for(;S--;){if(h===v||v!==null&&h===v.alternate){b=h;break e}h=b(h),v=b(v)}b=null}else b=null;d!==null&&U_(p,u,d,b,!1),g!==null&&m!==null&&U_(p,m,g,b,!0)}}t:{if(u=c?ll(c):window,d=u.nodeName&&u.nodeName.toLowerCase(),d==="select"||d==="input"&&u.type==="file")var E=kv;else if(Gv(u))if(Ay)E=MT;else{E=xT;var w=yT}else d=u.nodeName,!d||d.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&Om(c.elementType)&&(E=kv):E=ST;if(E&&(E=E(e,c))){Ey(p,E,n,f);break t}w&&w(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Xp(u,"number",u.value)}switch(w=c?ll(c):window,e){case"focusin":(Gv(w)||w.contentEditable==="true")&&(Nr=w,Zp=c,dl=null);break;case"focusout":dl=Zp=Nr=null;break;case"mousedown":Jp=!0;break;case"contextmenu":case"mouseup":case"dragend":Jp=!1,Yv(p,n,f);break;case"selectionchange":if(TT)break;case"keydown":case"keyup":Yv(p,n,f)}var x;if(zm)t:{switch(e){case"compositionstart":var A="onCompositionStart";break t;case"compositionend":A="onCompositionEnd";break t;case"compositionupdate":A="onCompositionUpdate";break t}A=void 0}else Lr?by(e,n)&&(A="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(My&&n.locale!=="ko"&&(Lr||A!=="onCompositionStart"?A==="onCompositionEnd"&&Lr&&(x=Sy()):(ks=f,Bm="value"in ks?ks.value:ks.textContent,Lr=!0)),w=$u(c,A),0<w.length&&(A=new Fv(A,e,null,n,f),p.push({event:A,listeners:w}),x?A.data=x:(x=Ty(n),x!==null&&(A.data=x)))),(x=pT?mT(e,n):gT(e,n))&&(A=$u(c,"onBeforeInput"),0<A.length&&(w=new Fv("onBeforeInput","beforeinput",null,n,f),p.push({event:w,listeners:A}),w.data=x)),oE(p,e,c,n,f)}xS(p,t)})}function Il(e,t,n){return{instance:e,listener:t,currentTarget:n}}function $u(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=El(e,n),s!=null&&i.unshift(Il(e,s,a)),s=El(e,t),s!=null&&i.push(Il(e,s,a))),e.tag===3)return i;e=e.return}return[]}function cE(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function U_(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=El(n,a),c!=null&&r.unshift(Il(n,c,l))):s||(c=El(n,a),c!=null&&r.push(Il(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var uE=/\r\n?/g,hE=/\u0000|\uFFFD/g;function L_(e){return(typeof e=="string"?e:""+e).replace(uE,`
`).replace(hE,"")}function MS(e,t){return t=L_(t),L_(e)===t}function ve(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||Jr(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&Jr(e,""+i);break;case"className":nu(e,"class",i);break;case"tabIndex":nu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":nu(e,n,i);break;case"style":yy(e,i,a);break;case"data":if(t!=="object"){nu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=vu(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&ve(e,t,"name",s.name,s,null),ve(e,t,"formEncType",s.formEncType,s,null),ve(e,t,"formMethod",s.formMethod,s,null),ve(e,t,"formTarget",s.formTarget,s,null)):(ve(e,t,"encType",s.encType,s,null),ve(e,t,"method",s.method,s,null),ve(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=vu(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=fs);break;case"onScroll":i!=null&&Zt("scroll",e);break;case"onScrollEnd":i!=null&&Zt("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(it(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(it(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=vu(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":Zt("beforetoggle",e),Zt("toggle",e),gu(e,"popover",i);break;case"xlinkActuate":ss(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":ss(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":ss(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":ss(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":ss(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":ss(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":ss(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":ss(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":ss(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":gu(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=V1.get(n)||n,gu(e,n,i))}}function ym(e,t,n,i,s,a){switch(n){case"style":yy(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(it(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error(it(60));e.innerHTML=n}}break;case"children":typeof i=="string"?Jr(e,i):(typeof i=="number"||typeof i=="bigint")&&Jr(e,""+i);break;case"onScroll":i!=null&&Zt("scroll",e);break;case"onScrollEnd":i!=null&&Zt("scrollend",e);break;case"onClick":i!=null&&(e.onclick=fs);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!dy.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[zn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):gu(e,n,i)}}}function mn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Zt("error",e),Zt("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(it(137,t));default:ve(e,t,a,r,n,null)}}s&&ve(e,t,"srcSet",n.srcSet,n,null),i&&ve(e,t,"src",n.src,n,null);return;case"input":Zt("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var f=n[i];if(f!=null)switch(i){case"name":s=f;break;case"type":r=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":a=f;break;case"defaultValue":o=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(it(137,t));break;default:ve(e,t,i,f,n,null)}}gy(e,a,o,l,c,r,s,!1);return;case"select":Zt("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:ve(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?Vr(e,!!i,t,!1):n!=null&&Vr(e,!!i,n,!0);return;case"textarea":Zt("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(it(91));break;default:ve(e,t,r,o,n,null)}_y(e,i,s,a);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":e.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:ve(e,t,l,i,n,null)}return;case"dialog":Zt("beforetoggle",e),Zt("toggle",e),Zt("cancel",e),Zt("close",e);break;case"iframe":case"object":Zt("load",e);break;case"video":case"audio":for(i=0;i<Nl.length;i++)Zt(Nl[i],e);break;case"image":Zt("error",e),Zt("load",e);break;case"details":Zt("toggle",e);break;case"embed":case"source":case"link":Zt("error",e),Zt("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(it(137,t));default:ve(e,t,c,i,n,null)}return;default:if(Om(t)){for(f in n)n.hasOwnProperty(f)&&(i=n[f],i!==void 0&&ym(e,t,f,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&ve(e,t,o,i,n,null))}function fE(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,f=null;for(d in n){var p=n[d];if(n.hasOwnProperty(d)&&p!=null)switch(d){case"checked":break;case"value":break;case"defaultValue":l=p;default:i.hasOwnProperty(d)||ve(e,t,d,null,i,p)}}for(var u in i){var d=i[u];if(p=n[u],i.hasOwnProperty(u)&&(d!=null||p!=null))switch(u){case"type":a=d;break;case"name":s=d;break;case"checked":c=d;break;case"defaultChecked":f=d;break;case"value":r=d;break;case"defaultValue":o=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(it(137,t));break;default:d!==p&&ve(e,t,u,d,i,p)}}Wp(e,r,o,l,c,f,a,s);return;case"select":d=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":d=l;default:i.hasOwnProperty(a)||ve(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&ve(e,t,s,a,i,l)}t=o,n=r,i=d,u!=null?Vr(e,!!n,u,!1):!!i!=!!n&&(t!=null?Vr(e,!!n,t,!0):Vr(e,!!n,n?[]:"",!1));return;case"textarea":d=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:ve(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":d=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(it(91));break;default:s!==a&&ve(e,t,r,s,i,a)}vy(e,u,d);return;case"option":for(var g in n)if(u=n[g],n.hasOwnProperty(g)&&u!=null&&!i.hasOwnProperty(g))switch(g){case"selected":e.selected=!1;break;default:ve(e,t,g,null,i,u)}for(l in i)if(u=i[l],d=n[l],i.hasOwnProperty(l)&&u!==d&&(u!=null||d!=null))switch(l){case"selected":e.selected=u&&typeof u!="function"&&typeof u!="symbol";break;default:ve(e,t,l,u,i,d)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var b in n)u=n[b],n.hasOwnProperty(b)&&u!=null&&!i.hasOwnProperty(b)&&ve(e,t,b,null,i,u);for(c in i)if(u=i[c],d=n[c],i.hasOwnProperty(c)&&u!==d&&(u!=null||d!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(it(137,t));break;default:ve(e,t,c,u,i,d)}return;default:if(Om(t)){for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!==void 0&&!i.hasOwnProperty(m)&&ym(e,t,m,void 0,i,u);for(f in i)u=i[f],d=n[f],!i.hasOwnProperty(f)||u===d||u===void 0&&d===void 0||ym(e,t,f,u,i,d);return}}for(var h in n)u=n[h],n.hasOwnProperty(h)&&u!=null&&!i.hasOwnProperty(h)&&ve(e,t,h,null,i,u);for(p in i)u=i[p],d=n[p],!i.hasOwnProperty(p)||u===d||u==null&&d==null||ve(e,t,p,u,i,d)}function N_(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function dE(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&N_(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var f=l.transferSize,p=l.initiatorType;f&&N_(p)&&(l=l.responseEnd,r+=f*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var xm=null,Sm=null;function th(e){return e.nodeType===9?e:e.ownerDocument}function I_(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function bS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Mm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Lp=null;function pE(){var e=window.event;return e&&e.type==="popstate"?e===Lp?!1:(Lp=e,!0):(Lp=null,!1)}var TS=typeof setTimeout=="function"?setTimeout:void 0,mE=typeof clearTimeout=="function"?clearTimeout:void 0,O_=typeof Promise=="function"?Promise:void 0,gE=typeof queueMicrotask=="function"?queueMicrotask:typeof O_<"u"?function(e){return O_.resolve(null).then(e).catch(vE)}:TS;function vE(e){setTimeout(function(){throw e})}function oa(e){return e==="head"}function P_(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),io(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")bl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,bl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[Gl]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&bl(e.ownerDocument.body);n=s}while(n);io(t)}function B_(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function bm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":bm(n),Im(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function _E(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Gl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=vi(e.nextSibling),e===null)break}return null}function yE(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=vi(e.nextSibling),e===null))return null;return e}function ES(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=vi(e.nextSibling),e===null))return null;return e}function Tm(e){return e.data==="$?"||e.data==="$~"}function Em(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function xE(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function vi(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Am=null;function F_(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return vi(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function z_(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function AS(e,t,n){switch(t=th(n),e){case"html":if(e=t.documentElement,!e)throw Error(it(452));return e;case"head":if(e=t.head,!e)throw Error(it(453));return e;case"body":if(e=t.body,!e)throw Error(it(454));return e;default:throw Error(it(451))}}function bl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Im(e)}var _i=new Map,H_=new Set;function eh(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ms=le.d;le.d={f:SE,r:ME,D:bE,C:TE,L:EE,m:AE,X:CE,S:wE,M:RE};function SE(){var e=Ms.f(),t=_h();return e||t}function ME(e){var t=ao(e);t!==null&&t.tag===5&&t.type==="form"?yx(t):Ms.r(e)}var co=typeof document>"u"?null:document;function wS(e,t,n){var i=co;if(i&&typeof t=="string"&&t){var s=di(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),H_.has(s)||(H_.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),mn(t,"link",e),rn(t),i.head.appendChild(t)))}}function bE(e){Ms.D(e),wS("dns-prefetch",e,null)}function TE(e,t){Ms.C(e,t),wS("preconnect",e,t)}function EE(e,t,n){Ms.L(e,t,n);var i=co;if(i&&e&&t){var s='link[rel="preload"][as="'+di(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+di(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+di(n.imageSizes)+'"]')):s+='[href="'+di(e)+'"]';var a=s;switch(t){case"style":a=no(e);break;case"script":a=uo(e)}_i.has(a)||(e=De({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),_i.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(Zl(a))||t==="script"&&i.querySelector(Jl(a))||(t=i.createElement("link"),mn(t,"link",e),rn(t),i.head.appendChild(t)))}}function AE(e,t){Ms.m(e,t);var n=co;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+di(i)+'"][href="'+di(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=uo(e)}if(!_i.has(a)&&(e=De({rel:"modulepreload",href:e},t),_i.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Jl(a)))return}i=n.createElement("link"),mn(i,"link",e),rn(i),n.head.appendChild(i)}}}function wE(e,t,n){Ms.S(e,t,n);var i=co;if(i&&e){var s=Hr(i).hoistableStyles,a=no(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(Zl(a)))o.loading=5;else{e=De({rel:"stylesheet",href:e,"data-precedence":t},n),(n=_i.get(a))&&yg(e,n);var l=r=i.createElement("link");rn(l),mn(l,"link",e),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,wu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function CE(e,t){Ms.X(e,t);var n=co;if(n&&e){var i=Hr(n).hoistableScripts,s=uo(e),a=i.get(s);a||(a=n.querySelector(Jl(s)),a||(e=De({src:e,async:!0},t),(t=_i.get(s))&&xg(e,t),a=n.createElement("script"),rn(a),mn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function RE(e,t){Ms.M(e,t);var n=co;if(n&&e){var i=Hr(n).hoistableScripts,s=uo(e),a=i.get(s);a||(a=n.querySelector(Jl(s)),a||(e=De({src:e,async:!0,type:"module"},t),(t=_i.get(s))&&xg(e,t),a=n.createElement("script"),rn(a),mn(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function V_(e,t,n,i){var s=(s=Ys.current)?eh(s):null;if(!s)throw Error(it(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=no(n.href),n=Hr(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=no(n.href);var a=Hr(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(Zl(e)))&&!a._p&&(r.instance=a,r.state.loading=5),_i.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},_i.set(e,n),a||DE(s,e,n,r.state))),t&&i===null)throw Error(it(528,""));return r}if(t&&i!==null)throw Error(it(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=uo(n),n=Hr(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(it(444,e))}}function no(e){return'href="'+di(e)+'"'}function Zl(e){return'link[rel="stylesheet"]['+e+"]"}function CS(e){return De({},e,{"data-precedence":e.precedence,precedence:null})}function DE(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),mn(t,"link",n),rn(t),e.head.appendChild(t))}function uo(e){return'[src="'+di(e)+'"]'}function Jl(e){return"script[async]"+e}function G_(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+di(n.href)+'"]');if(i)return t.instance=i,rn(i),i;var s=De({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),rn(i),mn(i,"style",s),wu(i,n.precedence,e),t.instance=i;case"stylesheet":s=no(n.href);var a=e.querySelector(Zl(s));if(a)return t.state.loading|=4,t.instance=a,rn(a),a;i=CS(n),(s=_i.get(s))&&yg(i,s),a=(e.ownerDocument||e).createElement("link"),rn(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),mn(a,"link",i),t.state.loading|=4,wu(a,n.precedence,e),t.instance=a;case"script":return a=uo(n.src),(s=e.querySelector(Jl(a)))?(t.instance=s,rn(s),s):(i=n,(s=_i.get(a))&&(i=De({},n),xg(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),rn(s),mn(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error(it(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,wu(i,n.precedence,e));return t.instance}function wu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function yg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function xg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Cu=null;function k_(e,t,n){if(Cu===null){var i=new Map,s=Cu=new Map;s.set(n,i)}else s=Cu,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[Gl]||a[fn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function W_(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function UE(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function RS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function LE(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=no(i.href),a=t.querySelector(Zl(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=nh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,rn(a);return}a=t.ownerDocument||t,i=CS(i),(s=_i.get(s))&&yg(i,s),a=a.createElement("link"),rn(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),mn(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=nh.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Np=0;function NE(e,t){return e.stylesheets&&e.count===0&&Ru(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&Ru(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&Np===0&&(Np=62500*dE());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Ru(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>Np?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function nh(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Ru(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var ih=null;function Ru(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ih=new Map,t.forEach(IE,e),ih=null,nh.call(e))}function IE(e,t){if(!(t.state.loading&4)){var n=ih.get(e);if(n)var i=n.get(null);else{n=new Map,ih.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=nh.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var Ol={$$typeof:hs,Provider:null,Consumer:null,_currentValue:Ba,_currentValue2:Ba,_threadCount:0};function OE(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ap(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ap(0),this.hiddenUpdates=ap(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function DS(e,t,n,i,s,a,r,o,l,c,f,p){return e=new OE(e,t,n,r,l,c,f,p,o),t=1,a===!0&&(t|=24),a=Yn(3,null,null,t),e.current=a,a.stateNode=e,t=qm(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},Jm(a),e}function US(e){return e?(e=Pr,e):Pr}function LS(e,t,n,i,s,a){s=US(s),i.context===null?i.context=s:i.pendingContext=s,i=Js(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=Ks(e,i,t),n!==null&&(Fn(n,e,t),ml(n,e,t))}function X_(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Sg(e,t){X_(e,t),(e=e.alternate)&&X_(e,t)}function NS(e){if(e.tag===13||e.tag===31){var t=Ka(e,67108864);t!==null&&Fn(t,e,67108864),Sg(e,67108864)}}function q_(e){if(e.tag===13||e.tag===31){var t=jn();t=Lm(t);var n=Ka(e,t);n!==null&&Fn(n,e,t),Sg(e,t)}}var sh=!0;function PE(e,t,n,i){var s=It.T;It.T=null;var a=le.p;try{le.p=2,Mg(e,t,n,i)}finally{le.p=a,It.T=s}}function BE(e,t,n,i){var s=It.T;It.T=null;var a=le.p;try{le.p=8,Mg(e,t,n,i)}finally{le.p=a,It.T=s}}function Mg(e,t,n,i){if(sh){var s=wm(i);if(s===null)Up(e,t,i,ah,n),Y_(e,i);else if(zE(s,e,t,n,i))i.stopPropagation();else if(Y_(e,i),t&4&&-1<FE.indexOf(e)){for(;s!==null;){var a=ao(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=Ia(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-Qn(r);o.entanglements[1]|=l,r&=~l}Yi(a),(oe&6)===0&&(Zu=Jn()+500,Yl(0,!1))}}break;case 31:case 13:o=Ka(a,2),o!==null&&Fn(o,a,2),_h(),Sg(a,2)}if(a=wm(i),a===null&&Up(e,t,i,ah,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else Up(e,t,i,null,n)}}function wm(e){return e=Pm(e),bg(e)}var ah=null;function bg(e){if(ah=null,e=Dr(e),e!==null){var t=Fl(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=$_(t),e!==null)return e;e=null}else if(n===31){if(e=ty(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return ah=e,null}function IS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(E1()){case sy:return 2;case ay:return 8;case Iu:case A1:return 32;case ry:return 268435456;default:return 32}default:return 32}}var Cm=!1,$s=null,ta=null,ea=null,Pl=new Map,Bl=new Map,Vs=[],FE="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Y_(e,t){switch(e){case"focusin":case"focusout":$s=null;break;case"dragenter":case"dragleave":ta=null;break;case"mouseover":case"mouseout":ea=null;break;case"pointerover":case"pointerout":Pl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Bl.delete(t.pointerId)}}function sl(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=ao(t),t!==null&&NS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function zE(e,t,n,i,s){switch(t){case"focusin":return $s=sl($s,e,t,n,i,s),!0;case"dragenter":return ta=sl(ta,e,t,n,i,s),!0;case"mouseover":return ea=sl(ea,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return Pl.set(a,sl(Pl.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,Bl.set(a,sl(Bl.get(a)||null,e,t,n,i,s)),!0}return!1}function OS(e){var t=Dr(e.target);if(t!==null){var n=Fl(t);if(n!==null){if(t=n.tag,t===13){if(t=$_(n),t!==null){e.blockedOn=t,Dv(e.priority,function(){q_(n)});return}}else if(t===31){if(t=ty(n),t!==null){e.blockedOn=t,Dv(e.priority,function(){q_(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Du(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=wm(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);qp=i,n.target.dispatchEvent(i),qp=null}else return t=ao(n),t!==null&&NS(t),e.blockedOn=n,!1;t.shift()}return!0}function Z_(e,t,n){Du(e)&&n.delete(t)}function HE(){Cm=!1,$s!==null&&Du($s)&&($s=null),ta!==null&&Du(ta)&&(ta=null),ea!==null&&Du(ea)&&(ea=null),Pl.forEach(Z_),Bl.forEach(Z_)}function pu(e,t){e.blockedOn===t&&(e.blockedOn=null,Cm||(Cm=!0,en.unstable_scheduleCallback(en.unstable_NormalPriority,HE)))}var mu=null;function J_(e){mu!==e&&(mu=e,en.unstable_scheduleCallback(en.unstable_NormalPriority,function(){mu===e&&(mu=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(bg(i||n)===null)continue;break}var a=ao(n);a!==null&&(e.splice(t,3),t-=3,lm(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function io(e){function t(l){return pu(l,e)}$s!==null&&pu($s,e),ta!==null&&pu(ta,e),ea!==null&&pu(ea,e),Pl.forEach(t),Bl.forEach(t);for(var n=0;n<Vs.length;n++){var i=Vs[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Vs.length&&(n=Vs[0],n.blockedOn===null);)OS(n),n.blockedOn===null&&Vs.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[zn]||null;if(typeof a=="function")r||J_(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[zn]||null)o=r.formAction;else if(bg(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),J_(n)}}}function PS(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function Tg(e){this._internalRoot=e}Sh.prototype.render=Tg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(it(409));var n=t.current,i=jn();LS(n,i,e,t,null,null)};Sh.prototype.unmount=Tg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;LS(e.current,2,null,e,null,null),_h(),t[so]=null}};function Sh(e){this._internalRoot=e}Sh.prototype.unstable_scheduleHydration=function(e){if(e){var t=hy();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Vs.length&&t!==0&&t<Vs[n].priority;n++);Vs.splice(n,0,e),n===0&&OS(e)}};var K_=Q_.version;if(K_!=="19.2.0")throw Error(it(527,K_,"19.2.0"));le.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(it(188)):(e=Object.keys(e).join(","),Error(it(268,e)));return e=_1(t),e=e!==null?ey(e):null,e=e===null?null:e.stateNode,e};var VE={bundleType:0,version:"19.2.0",rendererPackageName:"react-dom",currentDispatcherRef:It,reconcilerVersion:"19.2.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(al=__REACT_DEVTOOLS_GLOBAL_HOOK__,!al.isDisabled&&al.supportsFiber))try{zl=al.inject(VE),Kn=al}catch{}var al;Mh.createRoot=function(e,t){if(!j_(e))throw Error(it(299));var n=!1,i="",s=wx,a=Cx,r=Rx;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=DS(e,1,!1,null,null,n,i,null,s,a,r,PS),e[so]=t.current,_g(e),new Tg(t)};Mh.hydrateRoot=function(e,t,n){if(!j_(e))throw Error(it(299));var i=!1,s="",a=wx,r=Cx,o=Rx,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=DS(e,1,!0,t,n??null,i,s,l,a,r,o,PS),t.context=US(null),n=t.current,i=jn(),i=Lm(i),s=Js(i),s.callback=null,Ks(n,s,i),n=i,t.current.lanes=n,Vl(t,n),Yi(t),e[so]=t.current,_g(e),new Sh(t)};Mh.version="19.2.0"});var HS=zi((rD,zS)=>{"use strict";function FS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(FS)}catch(e){console.error(e)}}FS(),zS.exports=BS()});var Ub=zi(Dd=>{"use strict";var D3=Symbol.for("react.transitional.element"),U3=Symbol.for("react.fragment");function Db(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:D3,type:e,key:i,ref:t!==void 0?t:null,props:n}}Dd.Fragment=U3;Dd.jsx=Db;Dd.jsxs=Db});var ur=zi((PN,Lb)=>{"use strict";Lb.exports=Ub()});var fr=Hi(xr()),Gb=Hi(HS());var ye=Hi(xr(),1),GE=(e,t,n,i,s,a,r,o)=>{let l=document.documentElement,c=["light","dark"];function f(d){(Array.isArray(e)?e:[e]).forEach(g=>{let b=g==="class",m=b&&a?s.map(h=>a[h]||h):s;b?(l.classList.remove(...m),l.classList.add(a&&a[d]?a[d]:d)):l.setAttribute(g,d)}),p(d)}function p(d){o&&c.includes(d)&&(l.style.colorScheme=d)}function u(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)f(i);else try{let d=localStorage.getItem(t)||n,g=r&&d==="system"?u():d;f(g)}catch{}},VS=["light","dark"],GS="(prefers-color-scheme: dark)",kE=typeof window>"u",Ag=ye.createContext(void 0),WE={setTheme:e=>{},themes:[]},kS=()=>{var e;return(e=ye.useContext(Ag))!=null?e:WE},WS=e=>ye.useContext(Ag)?ye.createElement(ye.Fragment,null,e.children):ye.createElement(qE,{...e}),XE=["light","dark"],qE=({forcedTheme:e,disableTransitionOnChange:t=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:s="theme",themes:a=XE,defaultTheme:r=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:f,scriptProps:p})=>{let[u,d]=ye.useState(()=>ZE(s,r)),[g,b]=ye.useState(()=>u==="system"?Eg():u),m=l?Object.values(l):a,h=ye.useCallback(T=>{let E=T;if(!E)return;T==="system"&&n&&(E=Eg());let w=l?l[E]:E,x=t?JE(f):null,A=document.documentElement,R=I=>{I==="class"?(A.classList.remove(...m),w&&A.classList.add(w)):I.startsWith("data-")&&(w?A.setAttribute(I,w):A.removeAttribute(I))};if(Array.isArray(o)?o.forEach(R):R(o),i){let I=VS.includes(r)?r:null,F=VS.includes(E)?E:I;A.style.colorScheme=F}x?.()},[f]),v=ye.useCallback(T=>{let E=typeof T=="function"?T(u):T;d(E);try{localStorage.setItem(s,E)}catch{}},[u]),S=ye.useCallback(T=>{let E=Eg(T);b(E),u==="system"&&n&&!e&&h("system")},[u,e]);ye.useEffect(()=>{let T=window.matchMedia(GS);return T.addListener(S),S(T),()=>T.removeListener(S)},[S]),ye.useEffect(()=>{let T=E=>{E.key===s&&(E.newValue?d(E.newValue):v(r))};return window.addEventListener("storage",T),()=>window.removeEventListener("storage",T)},[v]),ye.useEffect(()=>{h(e??u)},[e,u]);let y=ye.useMemo(()=>({theme:u,setTheme:v,forcedTheme:e,resolvedTheme:u==="system"?g:u,themes:n?[...a,"system"]:a,systemTheme:n?g:void 0}),[u,v,e,g,n,a]);return ye.createElement(Ag.Provider,{value:y},ye.createElement(YE,{forcedTheme:e,storageKey:s,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:r,value:l,themes:a,nonce:f,scriptProps:p}),c)},YE=ye.memo(({forcedTheme:e,storageKey:t,attribute:n,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:r,themes:o,nonce:l,scriptProps:c})=>{let f=JSON.stringify([n,t,a,e,o,r,i,s]).slice(1,-1);return ye.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${GE.toString()})(${f})`}})}),ZE=(e,t)=>{if(kE)return;let n;try{n=localStorage.getItem(e)||void 0}catch{}return n||t},JE=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},Eg=e=>(e||(e=window.matchMedia(GS)),e.matches?"dark":"light");var hr={};Jb(hr,{default:()=>Bd});var Wo=Hi(xr());var vM=0,a0=1,_M=2;var Ec=1,yM=2,No=3,ba=0,Ln=1,$i=2,Si=0,Ta=1,Ac=2,r0=3,o0=4,wc=5;var rr=100,xM=101,SM=102,MM=103,bM=104,Of=200,Ni=201,TM=202,EM=203,l0=204,Io=205,AM=206,wM=207,CM=208,RM=209,DM=210,UM=211,LM=212,NM=213,IM=214,qh=0,Yh=1,Zh=2,Ao=3,Jh=4,Kh=5,Qh=6,jh=7,c0=0,OM=1,PM=2,Ii=0,u0=1,h0=2,f0=3,d0=4,p0=5,m0=6,g0=7;var v0=300,Ea=301,or=302,Pf=303,Bf=304,Cc=306,$h=1e3,Ji=1001,tf=1002,cn=1003,BM=1004;var Rc=1005;var vn=1006,Ff=1007;var Aa=1008;var Nn=1009,_0=1010,y0=1011,Oo=1012,zf=1013,Oi=1014,Pi=1015,ri=1016,Hf=1017,Vf=1018,Po=1020,x0=35902,S0=35899,M0=1021,b0=1022,Mi=1023,Ki=1026,wa=1027,T0=1028,Gf=1029,Ca=1030,kf=1031;var Wf=1033,Dc=33776,Uc=33777,Lc=33778,Nc=33779,Xf=35840,qf=35841,Yf=35842,Zf=35843,Jf=36196,Kf=37492,Qf=37496,jf=37488,$f=37489,Ic=37490,td=37491,ed=37808,nd=37809,id=37810,sd=37811,ad=37812,rd=37813,od=37814,ld=37815,cd=37816,ud=37817,hd=37818,fd=37819,dd=37820,pd=37821,md=36492,gd=36494,vd=36495,_d=36283,yd=36284,Oc=36285,xd=36286;var sc=2300,ef=2301,Wh=2302,$g=2303,t0=2400,e0=2401,n0=2402;var FM=3200;var E0=0,zM=1,Rs="",ii="srgb",pa="srgb-linear",ac="linear",he="srgb";var Xh=7680;var HM=519,VM=512,GM=513,kM=514,Sd=515,WM=516,XM=517,Md=518,qM=519,YM=35044;var A0="300 es",Ui=2e3,rc=2001;function KE(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function QE(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function oc(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function ZM(){let e=oc("canvas");return e.style.display="block",e}var XS={},wo=null;function w0(...e){let t="THREE."+e.shift();wo?wo("log",t,...e):console.log(t,...e)}function JM(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function Lt(...e){e=JM(e);let t="THREE."+e.shift();if(wo)wo("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Ot(...e){e=JM(e);let t="THREE."+e.shift();if(wo)wo("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function ir(...e){let t=e.join(" ");t in XS||(XS[t]=!0,Lt(...e))}function KM(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var QM={[qh]:Yh,[Zh]:Qh,[Jh]:jh,[Ao]:Kh,[Yh]:qh,[Qh]:Zh,[jh]:Jh,[Kh]:Ao},Qi=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},Sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var wg=Math.PI/180,nf=180/Math.PI;function Pc(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Sn[e&255]+Sn[e>>8&255]+Sn[e>>16&255]+Sn[e>>24&255]+"-"+Sn[t&255]+Sn[t>>8&255]+"-"+Sn[t>>16&15|64]+Sn[t>>24&255]+"-"+Sn[n&63|128]+Sn[n>>8&255]+"-"+Sn[n>>16&255]+Sn[n>>24&255]+Sn[i&255]+Sn[i>>8&255]+Sn[i>>16&255]+Sn[i>>24&255]).toLowerCase()}function Kt(e,t,n){return Math.max(t,Math.min(n,e))}function jE(e,t){return(e%t+t)%t}function Cg(e,t,n){return(1-n)*e+n*t}function Kl(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Vn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Dt=class e{static{e.prototype.isVector2=!0}constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=Kt(this.x,t.x,n.x),this.y=Kt(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=Kt(this.x,t,n),this.y=Kt(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(Kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ji=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],f=i[s+2],p=i[s+3],u=a[r+0],d=a[r+1],g=a[r+2],b=a[r+3];if(p!==b||l!==u||c!==d||f!==g){let m=l*u+c*d+f*g+p*b;m<0&&(u=-u,d=-d,g=-g,b=-b,m=-m);let h=1-o;if(m<.9995){let v=Math.acos(m),S=Math.sin(v);h=Math.sin(h*v)/S,o=Math.sin(o*v)/S,l=l*h+u*o,c=c*h+d*o,f=f*h+g*o,p=p*h+b*o}else{l=l*h+u*o,c=c*h+d*o,f=f*h+g*o,p=p*h+b*o;let v=1/Math.sqrt(l*l+c*c+f*f+p*p);l*=v,c*=v,f*=v,p*=v}}t[n]=l,t[n+1]=c,t[n+2]=f,t[n+3]=p}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],f=i[s+3],p=a[r],u=a[r+1],d=a[r+2],g=a[r+3];return t[n]=o*g+f*p+l*d-c*u,t[n+1]=l*g+f*u+c*p-o*d,t[n+2]=c*g+f*d+o*u-l*p,t[n+3]=f*g-o*p-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),f=o(s/2),p=o(a/2),u=l(i/2),d=l(s/2),g=l(a/2);switch(r){case"XYZ":this._x=u*f*p+c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p-u*d*g;break;case"YXZ":this._x=u*f*p+c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p+u*d*g;break;case"ZXY":this._x=u*f*p-c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p-u*d*g;break;case"ZYX":this._x=u*f*p-c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p+u*d*g;break;case"YZX":this._x=u*f*p+c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p-u*d*g;break;case"XZY":this._x=u*f*p-c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p+u*d*g;break;default:Lt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],f=n[6],p=n[10],u=i+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(i>o&&i>p){let d=2*Math.sqrt(1+i-o-p);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-i-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+p-i-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Kt(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,f=n._w;return this._x=i*f+r*o+s*c-a*l,this._y=s*f+r*l+a*o-i*c,this._z=a*f+r*c+i*l-s*o,this._w=r*f-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,n=Math.sin(n*c)/f,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class e{static{e.prototype.isVector3=!0}constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(qS.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(qS.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),f=2*(o*n-a*s),p=2*(a*i-r*n);return this.x=n+l*c+r*p-o*f,this.y=i+l*f+o*c-a*p,this.z=s+l*p+a*f-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=Kt(this.x,t.x,n.x),this.y=Kt(this.y,t.y,n.y),this.z=Kt(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=Kt(this.x,t,n),this.y=Kt(this.y,t,n),this.z=Kt(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Rg.copy(this).projectOnVector(t),this.sub(Rg)}reflect(t){return this.sub(Rg.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(Kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Rg=new N,qS=new ji,Ft=class e{static{e.prototype.isMatrix3=!0}constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let f=this.elements;return f[0]=t,f[1]=s,f[2]=o,f[3]=n,f[4]=a,f[5]=l,f[6]=i,f[7]=r,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],f=i[4],p=i[7],u=i[2],d=i[5],g=i[8],b=s[0],m=s[3],h=s[6],v=s[1],S=s[4],y=s[7],T=s[2],E=s[5],w=s[8];return a[0]=r*b+o*v+l*T,a[3]=r*m+o*S+l*E,a[6]=r*h+o*y+l*w,a[1]=c*b+f*v+p*T,a[4]=c*m+f*S+p*E,a[7]=c*h+f*y+p*w,a[2]=u*b+d*v+g*T,a[5]=u*m+d*S+g*E,a[8]=u*h+d*y+g*w,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8];return n*r*f-n*o*c-i*a*f+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=f*r-o*c,u=o*l-f*a,d=c*a-r*l,g=n*p+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/g;return t[0]=p*b,t[1]=(s*c-f*i)*b,t[2]=(o*i-s*r)*b,t[3]=u*b,t[4]=(f*n-s*l)*b,t[5]=(s*a-o*n)*b,t[6]=d*b,t[7]=(i*l-c*n)*b,t[8]=(r*n-i*a)*b,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return ir("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Dg.makeScale(t,n)),this}rotate(t){return ir("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Dg.makeRotation(-t)),this}translate(t,n){return ir("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Dg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Dg=new Ft,YS=new Ft().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ZS=new Ft().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function $E(){let e={enabled:!0,workingColorSpace:pa,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===he&&(s.r=Cs(s.r),s.g=Cs(s.g),s.b=Cs(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===he&&(s.r=Eo(s.r),s.g=Eo(s.g),s.b=Eo(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Rs?ac:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return ir("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return ir("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[pa]:{primaries:t,whitePoint:i,transfer:ac,toXYZ:YS,fromXYZ:ZS,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ii},outputColorSpaceConfig:{drawingBufferColorSpace:ii}},[ii]:{primaries:t,whitePoint:i,transfer:he,toXYZ:YS,fromXYZ:ZS,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ii}}}),e}var jt=$E();function Cs(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Eo(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var ho,sf=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{ho===void 0&&(ho=oc("canvas")),ho.width=t.width,ho.height=t.height;let s=ho.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=ho}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let n=oc("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Cs(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Cs(n[i]/255)*255):n[i]=Cs(n[i]);return{data:n,width:t.width,height:t.height}}else return Lt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},tA=0,Co=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:tA++}),this.uuid=Pc(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(Ug(s[r].image)):a.push(Ug(s[r]))}else a=Ug(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function Ug(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?sf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(Lt("Texture: Unable to serialize Texture."),{})}var eA=0,Lg=new N,Gn=class e extends Qi{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=Ji,s=Ji,a=vn,r=Aa,o=Mi,l=Nn,c=e.DEFAULT_ANISOTROPY,f=Rs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:eA++}),this.uuid=Pc(),this.name="",this.source=new Co(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Dt(0,0),this.repeat=new Dt(1,1),this.center=new Dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ft,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Lg).x}get height(){return this.source.getSize(Lg).y}get depth(){return this.source.getSize(Lg).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){Lt(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){Lt(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==v0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case $h:t.x=t.x-Math.floor(t.x);break;case Ji:t.x=t.x<0?0:1;break;case tf:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case $h:t.y=t.y-Math.floor(t.y);break;case Ji:t.y=t.y<0?0:1;break;case tf:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Gn.DEFAULT_IMAGE=null;Gn.DEFAULT_MAPPING=v0;Gn.DEFAULT_ANISOTROPY=1;var Le=class e{static{e.prototype.isVector4=!0}constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],f=l[4],p=l[8],u=l[1],d=l[5],g=l[9],b=l[2],m=l[6],h=l[10];if(Math.abs(f-u)<.01&&Math.abs(p-b)<.01&&Math.abs(g-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(p+b)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let S=(c+1)/2,y=(d+1)/2,T=(h+1)/2,E=(f+u)/4,w=(p+b)/4,x=(g+m)/4;return S>y&&S>T?S<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(S),s=E/i,a=w/i):y>T?y<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),i=E/s,a=x/s):T<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(T),i=w/a,s=x/a),this.set(i,s,a,n),this}let v=Math.sqrt((m-g)*(m-g)+(p-b)*(p-b)+(u-f)*(u-f));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(p-b)/v,this.z=(u-f)/v,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=Kt(this.x,t.x,n.x),this.y=Kt(this.y,t.y,n.y),this.z=Kt(this.z,t.z,n.z),this.w=Kt(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=Kt(this.x,t,n),this.y=Kt(this.y,t,n),this.z=Kt(this.z,t,n),this.w=Kt(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},af=class extends Qi{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new Le(0,0,t,n),this.scissorTest=!1,this.viewport=new Le(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Gn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:vn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new Co(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let n=t.depthTexture.clone();n.renderTarget=null,this.depthTexture=n}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Tn=class extends af{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},lc=class extends Gn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var rf=class extends Gn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Fe=class e{static{e.prototype.isMatrix4=!0}constructor(t,n,i,s,a,r,o,l,c,f,p,u,d,g,b,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,f,p,u,d,g,b,m)}set(t,n,i,s,a,r,o,l,c,f,p,u,d,g,b,m){let h=this.elements;return h[0]=t,h[4]=n,h[8]=i,h[12]=s,h[1]=a,h[5]=r,h[9]=o,h[13]=l,h[2]=c,h[6]=f,h[10]=p,h[14]=u,h[3]=d,h[7]=g,h[11]=b,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/fo.setFromMatrixColumn(t,0).length(),a=1/fo.setFromMatrixColumn(t,1).length(),r=1/fo.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),f=Math.cos(a),p=Math.sin(a);if(t.order==="XYZ"){let u=r*f,d=r*p,g=o*f,b=o*p;n[0]=l*f,n[4]=-l*p,n[8]=c,n[1]=d+g*c,n[5]=u-b*c,n[9]=-o*l,n[2]=b-u*c,n[6]=g+d*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*f,d=l*p,g=c*f,b=c*p;n[0]=u+b*o,n[4]=g*o-d,n[8]=r*c,n[1]=r*p,n[5]=r*f,n[9]=-o,n[2]=d*o-g,n[6]=b+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*f,d=l*p,g=c*f,b=c*p;n[0]=u-b*o,n[4]=-r*p,n[8]=g+d*o,n[1]=d+g*o,n[5]=r*f,n[9]=b-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*f,d=r*p,g=o*f,b=o*p;n[0]=l*f,n[4]=g*c-d,n[8]=u*c+b,n[1]=l*p,n[5]=b*c+u,n[9]=d*c-g,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,d=r*c,g=o*l,b=o*c;n[0]=l*f,n[4]=b-u*p,n[8]=g*p+d,n[1]=p,n[5]=r*f,n[9]=-o*f,n[2]=-c*f,n[6]=d*p+g,n[10]=u-b*p}else if(t.order==="XZY"){let u=r*l,d=r*c,g=o*l,b=o*c;n[0]=l*f,n[4]=-p,n[8]=c*f,n[1]=u*p+b,n[5]=r*f,n[9]=d*p-g,n[2]=g*p-d,n[6]=o*f,n[10]=b*p+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(nA,t,iA)}lookAt(t,n,i){let s=this.elements;return ei.subVectors(t,n),ei.lengthSq()===0&&(ei.z=1),ei.normalize(),la.crossVectors(i,ei),la.lengthSq()===0&&(Math.abs(i.z)===1?ei.x+=1e-4:ei.z+=1e-4,ei.normalize(),la.crossVectors(i,ei)),la.normalize(),bh.crossVectors(ei,la),s[0]=la.x,s[4]=bh.x,s[8]=ei.x,s[1]=la.y,s[5]=bh.y,s[9]=ei.y,s[2]=la.z,s[6]=bh.z,s[10]=ei.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],f=i[1],p=i[5],u=i[9],d=i[13],g=i[2],b=i[6],m=i[10],h=i[14],v=i[3],S=i[7],y=i[11],T=i[15],E=s[0],w=s[4],x=s[8],A=s[12],R=s[1],I=s[5],F=s[9],V=s[13],L=s[2],G=s[6],Z=s[10],Y=s[14],st=s[3],X=s[7],nt=s[11],j=s[15];return a[0]=r*E+o*R+l*L+c*st,a[4]=r*w+o*I+l*G+c*X,a[8]=r*x+o*F+l*Z+c*nt,a[12]=r*A+o*V+l*Y+c*j,a[1]=f*E+p*R+u*L+d*st,a[5]=f*w+p*I+u*G+d*X,a[9]=f*x+p*F+u*Z+d*nt,a[13]=f*A+p*V+u*Y+d*j,a[2]=g*E+b*R+m*L+h*st,a[6]=g*w+b*I+m*G+h*X,a[10]=g*x+b*F+m*Z+h*nt,a[14]=g*A+b*V+m*Y+h*j,a[3]=v*E+S*R+y*L+T*st,a[7]=v*w+S*I+y*G+T*X,a[11]=v*x+S*F+y*Z+T*nt,a[15]=v*A+S*V+y*Y+T*j,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],f=t[2],p=t[6],u=t[10],d=t[14],g=t[3],b=t[7],m=t[11],h=t[15],v=l*d-c*u,S=o*d-c*p,y=o*u-l*p,T=r*d-c*f,E=r*u-l*f,w=r*p-o*f;return n*(b*v-m*S+h*y)-i*(g*v-m*T+h*E)+s*(g*S-b*T+h*w)-a*(g*y-b*E+m*w)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],f=t[10];return n*(r*f-o*c)-i*(a*f-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=t[9],u=t[10],d=t[11],g=t[12],b=t[13],m=t[14],h=t[15],v=n*o-i*r,S=n*l-s*r,y=n*c-a*r,T=i*l-s*o,E=i*c-a*o,w=s*c-a*l,x=f*b-p*g,A=f*m-u*g,R=f*h-d*g,I=p*m-u*b,F=p*h-d*b,V=u*h-d*m,L=v*V-S*F+y*I+T*R-E*A+w*x;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let G=1/L;return t[0]=(o*V-l*F+c*I)*G,t[1]=(s*F-i*V-a*I)*G,t[2]=(b*w-m*E+h*T)*G,t[3]=(u*E-p*w-d*T)*G,t[4]=(l*R-r*V-c*A)*G,t[5]=(n*V-s*R+a*A)*G,t[6]=(m*y-g*w-h*S)*G,t[7]=(f*w-u*y+d*S)*G,t[8]=(r*F-o*R+c*x)*G,t[9]=(i*R-n*F-a*x)*G,t[10]=(g*E-b*y+h*v)*G,t[11]=(p*y-f*E-d*v)*G,t[12]=(o*A-r*I-l*x)*G,t[13]=(n*I-i*A+s*x)*G,t[14]=(b*S-g*T-m*v)*G,t[15]=(f*T-p*S+u*v)*G,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,f=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+i,f*l-s*r,0,c*l-s*o,f*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,f=r+r,p=o+o,u=a*c,d=a*f,g=a*p,b=r*f,m=r*p,h=o*p,v=l*c,S=l*f,y=l*p,T=i.x,E=i.y,w=i.z;return s[0]=(1-(b+h))*T,s[1]=(d+y)*T,s[2]=(g-S)*T,s[3]=0,s[4]=(d-y)*E,s[5]=(1-(u+h))*E,s[6]=(m+v)*E,s[7]=0,s[8]=(g+S)*w,s[9]=(m-v)*w,s[10]=(1-(u+b))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=fo.set(s[0],s[1],s[2]).length(),o=fo.set(s[4],s[5],s[6]).length(),l=fo.set(s[8],s[9],s[10]).length();a<0&&(r=-r),wi.copy(this);let c=1/r,f=1/o,p=1/l;return wi.elements[0]*=c,wi.elements[1]*=c,wi.elements[2]*=c,wi.elements[4]*=f,wi.elements[5]*=f,wi.elements[6]*=f,wi.elements[8]*=p,wi.elements[9]*=p,wi.elements[10]*=p,n.setFromRotationMatrix(wi),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Ui,l=!1){let c=this.elements,f=2*a/(n-t),p=2*a/(i-s),u=(n+t)/(n-t),d=(i+s)/(i-s),g,b;if(l)g=a/(r-a),b=r*a/(r-a);else if(o===Ui)g=-(r+a)/(r-a),b=-2*r*a/(r-a);else if(o===rc)g=-r/(r-a),b=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Ui,l=!1){let c=this.elements,f=2/(n-t),p=2/(i-s),u=-(n+t)/(n-t),d=-(i+s)/(i-s),g,b;if(l)g=1/(r-a),b=r/(r-a);else if(o===Ui)g=-2/(r-a),b=-(r+a)/(r-a);else if(o===rc)g=-1/(r-a),b=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},fo=new N,wi=new Fe,nA=new N(0,0,0),iA=new N(1,1,1),la=new N,bh=new N,ei=new N,JS=new Fe,KS=new ji,ma=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],f=s[9],p=s[2],u=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(Kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Kt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(Kt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-Kt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(Kt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Kt(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:Lt("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return JS.makeRotationFromQuaternion(t),this.setFromRotationMatrix(JS,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return KS.setFromEuler(this),this.setFromQuaternion(KS,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ma.DEFAULT_ORDER="XYZ";var cc=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},sA=0,QS=new N,po=new ji,bs=new Fe,Th=new N,Ql=new N,aA=new N,rA=new ji,jS=new N(1,0,0),$S=new N(0,1,0),tM=new N(0,0,1),eM={type:"added"},oA={type:"removed"},mo={type:"childadded",child:null},Ng={type:"childremoved",child:null},si=class e extends Qi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sA++}),this.uuid=Pc(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new N,n=new ma,i=new ji,s=new N(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Fe},normalMatrix:{value:new Ft}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return po.setFromAxisAngle(t,n),this.quaternion.multiply(po),this}rotateOnWorldAxis(t,n){return po.setFromAxisAngle(t,n),this.quaternion.premultiply(po),this}rotateX(t){return this.rotateOnAxis(jS,t)}rotateY(t){return this.rotateOnAxis($S,t)}rotateZ(t){return this.rotateOnAxis(tM,t)}translateOnAxis(t,n){return QS.copy(t).applyQuaternion(this.quaternion),this.position.add(QS.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(jS,t)}translateY(t){return this.translateOnAxis($S,t)}translateZ(t){return this.translateOnAxis(tM,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(bs.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Th.copy(t):Th.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Ql.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?bs.lookAt(Ql,Th,this.up):bs.lookAt(Th,Ql,this.up),this.quaternion.setFromRotationMatrix(bs),s&&(bs.extractRotation(s.matrixWorld),po.setFromRotationMatrix(bs),this.quaternion.premultiply(po.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Ot("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(eM),mo.child=t,this.dispatchEvent(mo),mo.child=null):Ot("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(oA),Ng.child=t,this.dispatchEvent(Ng),Ng.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),bs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),bs.multiply(t.parent.matrixWorld)),t.applyMatrix4(bs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(eM),mo.child=t,this.dispatchEvent(mo),mo.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ql,t,aA),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ql,rA,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let p=l[c];a(t.shapes,p)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),f=r(t.images),p=r(t.shapes),u=r(t.skeletons),d=r(t.animations),g=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),p.length>0&&(i.shapes=p),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function r(o){let l=[];for(let c in o){let f=o[c];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};si.DEFAULT_UP=new N(0,1,0);si.DEFAULT_MATRIX_AUTO_UPDATE=!0;si.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var nr=class extends si{constructor(){super(),this.isGroup=!0,this.type="Group"}},lA={type:"move"},Ro=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new nr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new nr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new nr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let b of t.hand.values()){let m=n.getJointPose(b,i),h=this._getHandJoint(c,b);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}let f=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=f.position.distanceTo(p.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(lA)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new nr;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},jM={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ca={h:0,s:0,l:0},Eh={h:0,s:0,l:0};function Ig(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var $t=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=ii){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,jt.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=jt.workingColorSpace){return this.r=t,this.g=n,this.b=i,jt.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=jt.workingColorSpace){if(t=jE(t,1),n=Kt(n,0,1),i=Kt(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=Ig(r,a,t+1/3),this.g=Ig(r,a,t),this.b=Ig(r,a,t-1/3)}return jt.colorSpaceToWorking(this,s),this}setStyle(t,n=ii){function i(a){a!==void 0&&parseFloat(a)<1&&Lt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:Lt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);Lt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=ii){let i=jM[t.toLowerCase()];return i!==void 0?this.setHex(i,n):Lt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Cs(t.r),this.g=Cs(t.g),this.b=Cs(t.b),this}copyLinearToSRGB(t){return this.r=Eo(t.r),this.g=Eo(t.g),this.b=Eo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ii){return jt.workingToColorSpace(Mn.copy(this),t),Math.round(Kt(Mn.r*255,0,255))*65536+Math.round(Kt(Mn.g*255,0,255))*256+Math.round(Kt(Mn.b*255,0,255))}getHexString(t=ii){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=jt.workingColorSpace){jt.workingToColorSpace(Mn.copy(this),n);let i=Mn.r,s=Mn.g,a=Mn.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,f=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=f<=.5?p/(r+o):p/(2-r-o),r){case i:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-i)/p+2;break;case a:l=(i-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=f,t}getRGB(t,n=jt.workingColorSpace){return jt.workingToColorSpace(Mn.copy(this),n),t.r=Mn.r,t.g=Mn.g,t.b=Mn.b,t}getStyle(t=ii){jt.workingToColorSpace(Mn.copy(this),t);let n=Mn.r,i=Mn.g,s=Mn.b;return t!==ii?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(ca),this.setHSL(ca.h+t,ca.s+n,ca.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(ca),t.getHSL(Eh);let i=Cg(ca.h,Eh.h,n),s=Cg(ca.s,Eh.s,n),a=Cg(ca.l,Eh.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Mn=new $t;$t.NAMES=jM;var Do=class extends si{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ma,this.environmentIntensity=1,this.environmentRotation=new ma,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),n.object.backgroundBlurriness=this.backgroundBlurriness,n.object.backgroundIntensity=this.backgroundIntensity,n.object.backgroundRotation=this.backgroundRotation.toArray(),n.object.environmentIntensity=this.environmentIntensity,n.object.environmentRotation=this.environmentRotation.toArray(),n}},Ci=new N,Ts=new N,Og=new N,Es=new N,go=new N,vo=new N,nM=new N,Pg=new N,Bg=new N,Fg=new N,zg=new Le,Hg=new Le,Vg=new Le,da=class e{constructor(t=new N,n=new N,i=new N){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),Ci.subVectors(t,n),s.cross(Ci);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){Ci.subVectors(s,n),Ts.subVectors(i,n),Og.subVectors(t,n);let r=Ci.dot(Ci),o=Ci.dot(Ts),l=Ci.dot(Og),c=Ts.dot(Ts),f=Ts.dot(Og),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*f)*u,g=(r*f-o*l)*u;return a.set(1-d-g,g,d)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Es)===null?!1:Es.x>=0&&Es.y>=0&&Es.x+Es.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Es)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Es.x),l.addScaledVector(r,Es.y),l.addScaledVector(o,Es.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return zg.setScalar(0),Hg.setScalar(0),Vg.setScalar(0),zg.fromBufferAttribute(t,n),Hg.fromBufferAttribute(t,i),Vg.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(zg,a.x),r.addScaledVector(Hg,a.y),r.addScaledVector(Vg,a.z),r}static isFrontFacing(t,n,i,s){return Ci.subVectors(i,n),Ts.subVectors(t,n),Ci.cross(Ts).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ci.subVectors(this.c,this.b),Ts.subVectors(this.a,this.b),Ci.cross(Ts).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;go.subVectors(s,i),vo.subVectors(a,i),Pg.subVectors(t,i);let l=go.dot(Pg),c=vo.dot(Pg);if(l<=0&&c<=0)return n.copy(i);Bg.subVectors(t,s);let f=go.dot(Bg),p=vo.dot(Bg);if(f>=0&&p<=f)return n.copy(s);let u=l*p-f*c;if(u<=0&&l>=0&&f<=0)return r=l/(l-f),n.copy(i).addScaledVector(go,r);Fg.subVectors(t,a);let d=go.dot(Fg),g=vo.dot(Fg);if(g>=0&&d<=g)return n.copy(a);let b=d*c-l*g;if(b<=0&&c>=0&&g<=0)return o=c/(c-g),n.copy(i).addScaledVector(vo,o);let m=f*g-d*p;if(m<=0&&p-f>=0&&d-g>=0)return nM.subVectors(a,s),o=(p-f)/(p-f+(d-g)),n.copy(s).addScaledVector(nM,o);let h=1/(m+b+u);return r=b*h,o=u*h,n.copy(i).addScaledVector(go,r).addScaledVector(vo,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},ga=class{constructor(t=new N(1/0,1/0,1/0),n=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Ri.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Ri.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=Ri.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Ri):Ri.fromBufferAttribute(a,r),Ri.applyMatrix4(t.matrixWorld),this.expandByPoint(Ri);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ah.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Ah.copy(i.boundingBox)),Ah.applyMatrix4(t.matrixWorld),this.union(Ah)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ri),Ri.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(jl),wh.subVectors(this.max,jl),_o.subVectors(t.a,jl),yo.subVectors(t.b,jl),xo.subVectors(t.c,jl),ua.subVectors(yo,_o),ha.subVectors(xo,yo),ja.subVectors(_o,xo);let n=[0,-ua.z,ua.y,0,-ha.z,ha.y,0,-ja.z,ja.y,ua.z,0,-ua.x,ha.z,0,-ha.x,ja.z,0,-ja.x,-ua.y,ua.x,0,-ha.y,ha.x,0,-ja.y,ja.x,0];return!Gg(n,_o,yo,xo,wh)||(n=[1,0,0,0,1,0,0,0,1],!Gg(n,_o,yo,xo,wh))?!1:(Ch.crossVectors(ua,ha),n=[Ch.x,Ch.y,Ch.z],Gg(n,_o,yo,xo,wh))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ri).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ri).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(As[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),As[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),As[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),As[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),As[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),As[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),As[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),As[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(As),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},As=[new N,new N,new N,new N,new N,new N,new N,new N],Ri=new N,Ah=new ga,_o=new N,yo=new N,xo=new N,ua=new N,ha=new N,ja=new N,jl=new N,wh=new N,Ch=new N,$a=new N;function Gg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){$a.fromArray(e,a);let o=s.x*Math.abs($a.x)+s.y*Math.abs($a.y)+s.z*Math.abs($a.z),l=t.dot($a),c=n.dot($a),f=i.dot($a);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}var Qe=new N,Rh=new Dt,cA=0,gn=class extends Qi{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:cA++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=YM,this.updateRanges=[],this.gpuType=Pi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Rh.fromBufferAttribute(this,n),Rh.applyMatrix3(t),this.setXY(n,Rh.x,Rh.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Qe.fromBufferAttribute(this,n),Qe.applyMatrix3(t),this.setXYZ(n,Qe.x,Qe.y,Qe.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)Qe.fromBufferAttribute(this,n),Qe.applyMatrix4(t),this.setXYZ(n,Qe.x,Qe.y,Qe.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)Qe.fromBufferAttribute(this,n),Qe.applyNormalMatrix(t),this.setXYZ(n,Qe.x,Qe.y,Qe.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)Qe.fromBufferAttribute(this,n),Qe.transformDirection(t),this.setXYZ(n,Qe.x,Qe.y,Qe.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=Kl(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=Vn(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=Kl(n,this.array)),n}setX(t,n){return this.normalized&&(n=Vn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=Kl(n,this.array)),n}setY(t,n){return this.normalized&&(n=Vn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=Kl(n,this.array)),n}setZ(t,n){return this.normalized&&(n=Vn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=Kl(n,this.array)),n}setW(t,n){return this.normalized&&(n=Vn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=Vn(n,this.array),i=Vn(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=Vn(n,this.array),i=Vn(i,this.array),s=Vn(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=Vn(n,this.array),i=Vn(i,this.array),s=Vn(s,this.array),a=Vn(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var uc=class extends gn{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var hc=class extends gn{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var je=class extends gn{constructor(t,n,i){super(new Float32Array(t),n,i)}},uA=new ga,$l=new N,kg=new N,sr=class{constructor(t=new N,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):uA.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;$l.subVectors(t,this.center);let n=$l.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector($l,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(kg.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint($l.copy(t.center).add(kg)),this.expandByPoint($l.copy(t.center).sub(kg))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},hA=0,yi=new Fe,Wg=new si,So=new N,ni=new ga,tc=new ga,ln=new N,En=class e extends Qi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hA++}),this.uuid=Pc(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(KE(t)?hc:uc)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Ft().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return yi.makeRotationFromQuaternion(t),this.applyMatrix4(yi),this}rotateX(t){return yi.makeRotationX(t),this.applyMatrix4(yi),this}rotateY(t){return yi.makeRotationY(t),this.applyMatrix4(yi),this}rotateZ(t){return yi.makeRotationZ(t),this.applyMatrix4(yi),this}translate(t,n,i){return yi.makeTranslation(t,n,i),this.applyMatrix4(yi),this}scale(t,n,i){return yi.makeScale(t,n,i),this.applyMatrix4(yi),this}lookAt(t){return Wg.lookAt(t),Wg.updateMatrix(),this.applyMatrix4(Wg.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(So).negate(),this.translate(So.x,So.y,So.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new je(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&Lt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ga);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ot("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];ni.setFromBufferAttribute(a),this.morphTargetsRelative?(ln.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(ln),ln.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(ln)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ot('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sr);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ot("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let i=this.boundingSphere.center;if(ni.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];tc.setFromBufferAttribute(o),this.morphTargetsRelative?(ln.addVectors(ni.min,tc.min),ni.expandByPoint(ln),ln.addVectors(ni.max,tc.max),ni.expandByPoint(ln)):(ni.expandByPoint(tc.min),ni.expandByPoint(tc.max))}ni.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)ln.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(ln));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)ln.fromBufferAttribute(o,c),l&&(So.fromBufferAttribute(t,c),ln.add(So)),s=Math.max(s,i.distanceToSquared(ln))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ot('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Ot("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new gn(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new N,l[x]=new N;let c=new N,f=new N,p=new N,u=new Dt,d=new Dt,g=new Dt,b=new N,m=new N;function h(x,A,R){c.fromBufferAttribute(i,x),f.fromBufferAttribute(i,A),p.fromBufferAttribute(i,R),u.fromBufferAttribute(a,x),d.fromBufferAttribute(a,A),g.fromBufferAttribute(a,R),f.sub(c),p.sub(c),d.sub(u),g.sub(u);let I=1/(d.x*g.y-g.x*d.y);isFinite(I)&&(b.copy(f).multiplyScalar(g.y).addScaledVector(p,-d.y).multiplyScalar(I),m.copy(p).multiplyScalar(d.x).addScaledVector(f,-g.x).multiplyScalar(I),o[x].add(b),o[A].add(b),o[R].add(b),l[x].add(m),l[A].add(m),l[R].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let x=0,A=v.length;x<A;++x){let R=v[x],I=R.start,F=R.count;for(let V=I,L=I+F;V<L;V+=3)h(t.getX(V+0),t.getX(V+1),t.getX(V+2))}let S=new N,y=new N,T=new N,E=new N;function w(x){T.fromBufferAttribute(s,x),E.copy(T);let A=o[x];S.copy(A),S.sub(T.multiplyScalar(T.dot(A))).normalize(),y.crossVectors(E,A);let I=y.dot(l[x])<0?-1:1;r.setXYZW(x,S.x,S.y,S.z,I)}for(let x=0,A=v.length;x<A;++x){let R=v[x],I=R.start,F=R.count;for(let V=I,L=I+F;V<L;V+=3)w(t.getX(V+0)),w(t.getX(V+1)),w(t.getX(V+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new gn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new N,a=new N,r=new N,o=new N,l=new N,c=new N,f=new N,p=new N;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),b=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(n,g),a.fromBufferAttribute(n,b),r.fromBufferAttribute(n,m),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,m),o.add(f),l.add(f),c.add(f),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(b,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=n.count;u<d;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),i.setXYZ(u+0,f.x,f.y,f.z),i.setXYZ(u+1,f.x,f.y,f.z),i.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)ln.fromBufferAttribute(t,n),ln.normalize(),t.setXYZ(n,ln.x,ln.y,ln.z)}toNonIndexed(){function t(o,l){let c=o.array,f=o.itemSize,p=o.normalized,u=new c.constructor(l.length*f),d=0,g=0;for(let b=0,m=l.length;b<m;b++){o.isInterleavedBufferAttribute?d=l[b]*o.data.stride+o.offset:d=l[b]*f;for(let h=0;h<f;h++)u[g++]=c[d++]}return new gn(u,f,p)}if(this.index===null)return Lt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let f=0,p=c.length;f<p;f++){let u=c[f],d=t(u,i);l.push(d)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];f.push(d.toJSON(t.data))}f.length>0&&(s[l]=f,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(n))}let a=t.morphAttributes;for(let c in a){let f=[],p=a[c];for(let u=0,d=p.length;u<d;u++)f.push(p[u].clone(n));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,f=r.length;c<f;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Xg=new N,fA=new N,dA=new Ft,Di=class{constructor(t=new N(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=Xg.subVectors(i,n).cross(fA.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(Xg),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||dA.getNormalMatrix(t),s=this.coplanarPoint(Xg).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},pA=0,va=class extends Qi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:pA++}),this.uuid=Pc(),this.name="",this.type="Material",this.blending=Ta,this.side=ba,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=l0,this.blendDst=Io,this.blendEquation=rr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $t(0,0,0),this.blendAlpha=0,this.depthFunc=Ao,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=HM,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xh,this.stencilZFail=Xh,this.stencilZPass=Xh,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){Lt(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){Lt(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new $t().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Di().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Dt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Dt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ws=new N,qg=new N,Dh=new N,Uh=new N,fc=class{constructor(t=new N,n=new N(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ws)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=ws.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(ws.copy(this.origin).addScaledVector(this.direction,n),ws.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){qg.copy(t).add(n).multiplyScalar(.5),Dh.copy(n).sub(t).normalize(),Uh.copy(this.origin).sub(qg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(Dh),o=Uh.dot(this.direction),l=-Uh.dot(Dh),c=Uh.lengthSq(),f=Math.abs(1-r*r),p,u,d,g;if(f>0)if(p=r*l-o,u=r*o-l,g=a*f,p>=0)if(u>=-g)if(u<=g){let b=1/f;p*=b,u*=b,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-g?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=g?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(qg).addScaledVector(Dh,u),d}intersectSphere(t,n){if(t.radius<0)return null;ws.subVectors(t.center,this.origin);let i=ws.dot(this.direction),s=ws.dot(ws)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),f>=0?(a=(t.min.y-u.y)*f,r=(t.max.y-u.y)*f):(a=(t.max.y-u.y)*f,r=(t.min.y-u.y)*f),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(t.min.z-u.z)*p,l=(t.max.z-u.z)*p):(o=(t.max.z-u.z)*p,l=(t.min.z-u.z)*p),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,ws)!==null}intersectTriangle(t,n,i,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,f=o.z,p=t.x-r.x,u=t.y-r.y,d=t.z-r.z,g=n.x-r.x,b=n.y-r.y,m=n.z-r.z,h=i.x-r.x,v=i.y-r.y,S=i.z-r.z,y=Math.abs(l),T=Math.abs(c),E=Math.abs(f),w,x,A,R,I,F,V,L,G,Z,Y,st;if(y>=T&&y>=E?(A=l,F=p,G=g,st=h,l>=0?(w=c,x=f,R=u,I=d,V=b,L=m,Z=v,Y=S):(w=f,x=c,R=d,I=u,V=m,L=b,Z=S,Y=v)):T>=E?(A=c,F=u,G=b,st=v,c>=0?(w=f,x=l,R=d,I=p,V=m,L=g,Z=S,Y=h):(w=l,x=f,R=p,I=d,V=g,L=m,Z=h,Y=S)):(A=f,F=d,G=m,st=S,f>=0?(w=l,x=c,R=p,I=u,V=g,L=b,Z=h,Y=v):(w=c,x=l,R=u,I=p,V=b,L=g,Z=v,Y=h)),A===0)return null;let X=w/A,nt=x/A,j=1/A,Rt=R-X*F,ft=I-nt*F,se=V-X*G,Pt=L-nt*G,Ht=Z-X*st,W=Y-nt*st,tt=Ht*Pt-W*se,yt=Rt*W-ft*Ht,Bt=se*ft-Pt*Rt;if(s){if(tt<0||yt<0||Bt<0)return null}else if((tt<0||yt<0||Bt<0)&&(tt>0||yt>0||Bt>0))return null;let _t=tt+yt+Bt;if(_t===0)return null;let Nt=j*(tt*F+yt*G+Bt*st);return(_t>0?Nt<0:Nt>0)?null:this.at(Nt/_t,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dc=class extends va{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ma,this.combine=c0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},iM=new Fe,tr=new fc,Lh=new sr,sM=new N,Nh=new N,Ih=new N,Oh=new N,Yg=new N,Ph=new N,aM=new N,Bh=new N,_n=class extends si{constructor(t=new En,n=new dc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){Ph.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let f=o[l],p=a[l];f!==0&&(Yg.fromBufferAttribute(p,t),r?Ph.addScaledVector(Yg,f):Ph.addScaledVector(Yg.sub(n),f))}n.add(Ph)}return n}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Lh.copy(i.boundingSphere),Lh.applyMatrix4(a),tr.copy(t.ray).recast(t.near),!(Lh.containsPoint(tr.origin)===!1&&(tr.intersectSphere(Lh,sM)===null||tr.origin.distanceToSquared(sM)>(t.far-t.near)**2))&&(iM.copy(a).invert(),tr.copy(t.ray).applyMatrix4(iM),!(i.boundingBox!==null&&tr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,tr)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,f=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,b=u.length;g<b;g++){let m=u[g],h=r[m.materialIndex],v=Math.max(m.start,d.start),S=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=v,T=S;y<T;y+=3){let E=o.getX(y),w=o.getX(y+1),x=o.getX(y+2);s=Fh(this,h,t,i,c,f,p,E,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),b=Math.min(o.count,d.start+d.count);for(let m=g,h=b;m<h;m+=3){let v=o.getX(m),S=o.getX(m+1),y=o.getX(m+2);s=Fh(this,r,t,i,c,f,p,v,S,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,b=u.length;g<b;g++){let m=u[g],h=r[m.materialIndex],v=Math.max(m.start,d.start),S=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=v,T=S;y<T;y+=3){let E=y,w=y+1,x=y+2;s=Fh(this,h,t,i,c,f,p,E,w,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),b=Math.min(l.count,d.start+d.count);for(let m=g,h=b;m<h;m+=3){let v=m,S=m+1,y=m+2;s=Fh(this,r,t,i,c,f,p,v,S,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function mA(e,t,n,i,s,a,r,o){let l;if(t.side===Ln?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===ba,o),l===null)return null;Bh.copy(o),Bh.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(Bh);return c<n.near||c>n.far?null:{distance:c,point:Bh.clone(),object:e}}function Fh(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,Nh),e.getVertexPosition(l,Ih),e.getVertexPosition(c,Oh);let f=mA(e,t,n,i,Nh,Ih,Oh,aM);if(f){let p=new N;da.getBarycoord(aM,Nh,Ih,Oh,p),s&&(f.uv=da.getInterpolatedAttribute(s,o,l,c,p,new Dt)),a&&(f.uv1=da.getInterpolatedAttribute(a,o,l,c,p,new Dt)),r&&(f.normal=da.getInterpolatedAttribute(r,o,l,c,p,new N),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new N,materialIndex:0};da.getNormal(Nh,Ih,Oh,u.normal),f.face=u,f.barycoord=p}return f}var of=class extends Gn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=cn,f=cn,p,u){super(null,r,o,l,c,f,s,a,p,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Li=class extends gn{constructor(t,n,i,s=1){super(t,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}};var er=new sr,gA=new Dt(.5,.5),zh=new N,pc=class{constructor(t=new Di,n=new Di,i=new Di,s=new Di,a=new Di,r=new Di){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Ui,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],f=a[4],p=a[5],u=a[6],d=a[7],g=a[8],b=a[9],m=a[10],h=a[11],v=a[12],S=a[13],y=a[14],T=a[15];if(s[0].setComponents(c-r,d-f,h-g,T-v).normalize(),s[1].setComponents(c+r,d+f,h+g,T+v).normalize(),s[2].setComponents(c+o,d+p,h+b,T+S).normalize(),s[3].setComponents(c-o,d-p,h-b,T-S).normalize(),i)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,d-u,h-m,T-y).normalize();else if(s[4].setComponents(c-l,d-u,h-m,T-y).normalize(),n===Ui)s[5].setComponents(c+l,d+u,h+m,T+y).normalize();else if(n===rc)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),er.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),er.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(er)}intersectsSprite(t){er.center.set(0,0,0);let n=gA.distanceTo(t.center);return er.radius=.7071067811865476+n,er.applyMatrix4(t.matrixWorld),this.intersectsSphere(er)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(zh.x=s.normal.x>0?t.max.x:t.min.x,zh.y=s.normal.y>0?t.max.y:t.min.y,zh.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(zh)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var lf=class extends va{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new $t(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},cf=new N,uf=new N,rM=new Fe,ec=new fc,Hh=new sr,Zg=new N,oM=new N,hf=class extends si{constructor(t=new En,n=new lf){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[0];for(let s=1,a=n.count;s<a;s++)cf.fromBufferAttribute(n,s-1),uf.fromBufferAttribute(n,s),i[s]=i[s-1],i[s]+=cf.distanceTo(uf);t.setAttribute("lineDistance",new je(i,1))}else Lt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,n){let i=this.geometry,s=this.matrixWorld,a=t.params.Line.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Hh.copy(i.boundingSphere),Hh.applyMatrix4(s),Hh.radius+=a,t.ray.intersectsSphere(Hh)===!1)return;rM.copy(s).invert(),ec.copy(t.ray).applyMatrix4(rM);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,f=i.index,u=i.attributes.position;if(f!==null){let d=Math.max(0,r.start),g=Math.min(f.count,r.start+r.count);for(let b=d,m=g-1;b<m;b+=c){let h=f.getX(b),v=f.getX(b+1),S=Vh(this,t,ec,l,h,v,b);S&&n.push(S)}if(this.isLineLoop){let b=f.getX(g-1),m=f.getX(d),h=Vh(this,t,ec,l,b,m,g-1);h&&n.push(h)}}else{let d=Math.max(0,r.start),g=Math.min(u.count,r.start+r.count);for(let b=d,m=g-1;b<m;b+=c){let h=Vh(this,t,ec,l,b,b+1,b);h&&n.push(h)}if(this.isLineLoop){let b=Vh(this,t,ec,l,g-1,d,g-1);b&&n.push(b)}}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}};function Vh(e,t,n,i,s,a,r){let o=e.geometry.attributes.position;if(cf.fromBufferAttribute(o,s),uf.fromBufferAttribute(o,a),n.distanceSqToSegment(cf,uf,Zg,oM)>i)return;Zg.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Zg);if(!(c<t.near||c>t.far))return{distance:c,point:oM.clone().applyMatrix4(e.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:e}}var lM=new N,cM=new N,mc=class extends hf{constructor(t,n){super(t,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[];for(let s=0,a=n.count;s<a;s+=2)lM.fromBufferAttribute(n,s),cM.fromBufferAttribute(n,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+lM.distanceTo(cM);t.setAttribute("lineDistance",new je(i,1))}else Lt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var gc=class extends Gn{constructor(t=[],n=Ea,i,s,a,r,o,l,c,f){super(t,n,i,s,a,r,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var _a=class extends Gn{constructor(t,n,i=Oi,s,a,r,o=cn,l=cn,c,f=Ki,p=1){if(f!==Ki&&f!==wa)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:p};super(u,s,a,r,o,l,f,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Co(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return n.compareFunction=this.compareFunction,n}},ff=class extends _a{constructor(t,n=Oi,i=Ea,s,a,r=cn,o=cn,l,c=Ki){let f={width:t,height:t,depth:1},p=[f,f,f,f,f,f];super(t,t,n,i,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},vc=class extends Gn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Uo=class e extends En{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],f=[],p=[],u=0,d=0;g("z","y","x",-1,-1,i,n,t,r,a,0),g("z","y","x",1,-1,i,n,-t,r,a,1),g("x","z","y",1,1,t,i,n,s,r,2),g("x","z","y",1,-1,t,i,-n,s,r,3),g("x","y","z",1,-1,t,n,i,s,a,4),g("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(f,3)),this.setAttribute("uv",new je(p,2));function g(b,m,h,v,S,y,T,E,w,x,A){let R=y/w,I=T/x,F=y/2,V=T/2,L=E/2,G=w+1,Z=x+1,Y=0,st=0,X=new N;for(let nt=0;nt<Z;nt++){let j=nt*I-V;for(let Rt=0;Rt<G;Rt++){let ft=Rt*R-F;X[b]=ft*v,X[m]=j*S,X[h]=L,c.push(X.x,X.y,X.z),X[b]=0,X[m]=0,X[h]=E>0?1:-1,f.push(X.x,X.y,X.z),p.push(Rt/w),p.push(1-nt/x),Y+=1}}for(let nt=0;nt<x;nt++)for(let j=0;j<w;j++){let Rt=u+j+G*nt,ft=u+j+G*(nt+1),se=u+(j+1)+G*(nt+1),Pt=u+(j+1)+G*nt;l.push(Rt,ft,Pt),l.push(ft,se,Pt),st+=6}o.addGroup(d,st,A),d+=st,u+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var _c=class e extends En{constructor(t=1,n=1,i=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:n,height:i,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let f=[],p=[],u=[],d=[],g=0,b=[],m=i/2,h=0;v(),r===!1&&(t>0&&S(!0),n>0&&S(!1)),this.setIndex(f),this.setAttribute("position",new je(p,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(d,2));function v(){let y=new N,T=new N,E=0,w=(n-t)/i;for(let x=0;x<=a;x++){let A=[],R=x/a,I=R*(n-t)+t;for(let F=0;F<=s;F++){let V=F/s,L=V*l+o,G=Math.sin(L),Z=Math.cos(L);T.x=I*G,T.y=-R*i+m,T.z=I*Z,p.push(T.x,T.y,T.z),y.set(G,w,Z).normalize(),u.push(y.x,y.y,y.z),d.push(V,1-R),A.push(g++)}b.push(A)}for(let x=0;x<s;x++)for(let A=0;A<a;A++){let R=b[A][x],I=b[A+1][x],F=b[A+1][x+1],V=b[A][x+1];(t>0||A!==0)&&(f.push(R,I,V),E+=3),(n>0||A!==a-1)&&(f.push(I,F,V),E+=3)}c.addGroup(h,E,0),h+=E}function S(y){let T=g,E=new Dt,w=new N,x=0,A=y===!0?t:n,R=y===!0?1:-1;for(let F=1;F<=s;F++)p.push(0,m*R,0),u.push(0,R,0),d.push(.5,.5),g++;let I=g;for(let F=0;F<=s;F++){let L=F/s*l+o,G=Math.cos(L),Z=Math.sin(L);w.x=A*Z,w.y=m*R,w.z=A*G,p.push(w.x,w.y,w.z),u.push(0,R,0),E.x=G*.5+.5,E.y=Z*.5*R+.5,d.push(E.x,E.y),g++}for(let F=0;F<s;F++){let V=T+F,L=I+F;y===!0?f.push(L,L+1,V):f.push(L+1,L,V),x+=3}c.addGroup(h,x,y===!0?1:2),h+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var xi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Lt("Curve: .getPoint() not implemented.")}getPointAt(t,n){let i=this.getUtoTmapping(t);return this.getPoint(i,n)}getPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPoint(i/t));return n}getSpacedPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPointAt(i/t));return n}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let n=[],i,s=this.getPoint(0),a=0;n.push(0);for(let r=1;r<=t;r++)i=this.getPoint(r/t),a+=i.distanceTo(s),n.push(a),s=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,n=null){let i=this.getLengths(),s=0,a=i.length,r;n?r=n:r=t*i[a-1];let o=0,l=a-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-r,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===r)return s/(a-1);let f=i[s],u=i[s+1]-f,d=(r-f)/u;return(s+d)/(a-1)}getTangent(t,n){let s=t-1e-4,a=t+1e-4;s<0&&(s=0),a>1&&(a=1);let r=this.getPoint(s),o=this.getPoint(a),l=n||(r.isVector2?new Dt:new N);return l.copy(o).sub(r).normalize(),l}getTangentAt(t,n){let i=this.getUtoTmapping(t);return this.getTangent(i,n)}computeFrenetFrames(t,n=!1){let i=new N,s=[],a=[],r=[],o=new N,l=new Fe;for(let d=0;d<=t;d++){let g=d/t;s[d]=this.getTangentAt(g,new N)}a[0]=new N,r[0]=new N;let c=Number.MAX_VALUE,f=Math.abs(s[0].x),p=Math.abs(s[0].y),u=Math.abs(s[0].z);f<=c&&(c=f,i.set(1,0,0)),p<=c&&(c=p,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),a[0].crossVectors(s[0],o),r[0].crossVectors(s[0],a[0]);for(let d=1;d<=t;d++){if(a[d]=a[d-1].clone(),r[d]=r[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Kt(s[d-1].dot(s[d]),-1,1));a[d].applyMatrix4(l.makeRotationAxis(o,g))}r[d].crossVectors(s[d],a[d])}if(n===!0){let d=Math.acos(Kt(a[0].dot(a[t]),-1,1));d/=t,s[0].dot(o.crossVectors(a[0],a[t]))>0&&(d=-d);for(let g=1;g<=t;g++)a[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),r[g].crossVectors(s[g],a[g])}return{tangents:s,normals:a,binormals:r}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},yc=class extends xi{constructor(t=0,n=0,i=1,s=1,a=0,r=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=n,this.xRadius=i,this.yRadius=s,this.aStartAngle=a,this.aEndAngle=r,this.aClockwise=o,this.aRotation=l}getPoint(t,n=new Dt){let i=n,s=Math.PI*2,a=this.aEndAngle-this.aStartAngle,r=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=s;for(;a>s;)a-=s;a<Number.EPSILON&&(r?a=0:a=s),this.aClockwise===!0&&!r&&(a===s?a=-s:a=a-s);let o=this.aStartAngle+t*a,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let f=Math.cos(this.aRotation),p=Math.sin(this.aRotation),u=l-this.aX,d=c-this.aY;l=u*f-d*p+this.aX,c=u*p+d*f+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},df=class extends yc{constructor(t,n,i,s,a,r){super(t,n,i,i,s,a,r),this.isArcCurve=!0,this.type="ArcCurve"}};function C0(){let e=0,t=0,n=0,i=0;function s(a,r,o,l){e=a,t=o,n=-3*a+3*r-2*o-l,i=2*a-2*r+o+l}return{initCatmullRom:function(a,r,o,l,c){s(r,o,c*(o-a),c*(l-r))},initNonuniformCatmullRom:function(a,r,o,l,c,f,p){let u=(r-a)/c-(o-a)/(c+f)+(o-r)/f,d=(o-r)/f-(l-r)/(f+p)+(l-o)/p;u*=f,d*=f,s(r,o,u,d)},calc:function(a){let r=a*a,o=r*a;return e+t*a+n*r+i*o}}}var uM=new N,hM=new N,Jg=new C0,Kg=new C0,Qg=new C0,pf=class extends xi{constructor(t=[],n=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=n,this.curveType=i,this.tension=s}getPoint(t,n=new N){let i=n,s=this.points,a=s.length,r=(a-(this.closed?0:1))*t,o=Math.floor(r),l=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/a)+1)*a:l===0&&o===a-1&&(o=a-2,l=1);let c,f;this.closed||o>0?c=s[(o-1)%a]:(hM.subVectors(s[0],s[1]).add(s[0]),c=hM);let p=s[o%a],u=s[(o+1)%a];if(this.closed||o+2<a?f=s[(o+2)%a]:(uM.subVectors(s[a-1],s[a-2]).add(s[a-1]),f=uM),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(p),d),b=Math.pow(p.distanceToSquared(u),d),m=Math.pow(u.distanceToSquared(f),d);b<1e-4&&(b=1),g<1e-4&&(g=b),m<1e-4&&(m=b),Jg.initNonuniformCatmullRom(c.x,p.x,u.x,f.x,g,b,m),Kg.initNonuniformCatmullRom(c.y,p.y,u.y,f.y,g,b,m),Qg.initNonuniformCatmullRom(c.z,p.z,u.z,f.z,g,b,m)}else this.curveType==="catmullrom"&&(Jg.initCatmullRom(c.x,p.x,u.x,f.x,this.tension),Kg.initCatmullRom(c.y,p.y,u.y,f.y,this.tension),Qg.initCatmullRom(c.z,p.z,u.z,f.z,this.tension));return i.set(Jg.calc(l),Kg.calc(l),Qg.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function fM(e,t,n,i,s){let a=(i-t)*.5,r=(s-n)*.5,o=e*e,l=e*o;return(2*n-2*i+a+r)*l+(-3*n+3*i-2*a-r)*o+a*e+n}function vA(e,t){let n=1-e;return n*n*t}function _A(e,t){return 2*(1-e)*e*t}function yA(e,t){return e*e*t}function nc(e,t,n,i){return vA(e,t)+_A(e,n)+yA(e,i)}function xA(e,t){let n=1-e;return n*n*n*t}function SA(e,t){let n=1-e;return 3*n*n*e*t}function MA(e,t){return 3*(1-e)*e*e*t}function bA(e,t){return e*e*e*t}function ic(e,t,n,i,s){return xA(e,t)+SA(e,n)+MA(e,i)+bA(e,s)}var mf=class extends xi{constructor(t=new Dt,n=new Dt,i=new Dt,s=new Dt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new Dt){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(ic(t,s.x,a.x,r.x,o.x),ic(t,s.y,a.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},gf=class extends xi{constructor(t=new N,n=new N,i=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new N){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(ic(t,s.x,a.x,r.x,o.x),ic(t,s.y,a.y,r.y,o.y),ic(t,s.z,a.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},vf=class extends xi{constructor(t=new Dt,n=new Dt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=n}getPoint(t,n=new Dt){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new Dt){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Lo=class extends xi{constructor(t=new N,n=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=n}getPoint(t,n=new N){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new N){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},_f=class extends xi{constructor(t=new Dt,n=new Dt,i=new Dt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new Dt){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(nc(t,s.x,a.x,r.x),nc(t,s.y,a.y,r.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},xc=class extends xi{constructor(t=new N,n=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new N){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(nc(t,s.x,a.x,r.x),nc(t,s.y,a.y,r.y),nc(t,s.z,a.z,r.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},yf=class extends xi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,n=new Dt){let i=n,s=this.points,a=(s.length-1)*t,r=Math.floor(a),o=a-r,l=s[r===0?r:r-1],c=s[r],f=s[r>s.length-2?s.length-1:r+1],p=s[r>s.length-3?s.length-1:r+2];return i.set(fM(o,l.x,c.x,f.x,p.x),fM(o,l.y,c.y,f.y,p.y)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new Dt().fromArray(s))}return this}},TA=Object.freeze({__proto__:null,ArcCurve:df,CatmullRomCurve3:pf,CubicBezierCurve:mf,CubicBezierCurve3:gf,EllipseCurve:yc,LineCurve:vf,LineCurve3:Lo,QuadraticBezierCurve:_f,QuadraticBezierCurve3:xc,SplineCurve:yf});var ya=class e extends En{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,f=l+1,p=t/o,u=n/l,d=[],g=[],b=[],m=[];for(let h=0;h<f;h++){let v=h*u-r;for(let S=0;S<c;S++){let y=S*p-a;g.push(y,-v,0),b.push(0,0,1),m.push(S/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let v=0;v<o;v++){let S=v+c*h,y=v+c*(h+1),T=v+1+c*(h+1),E=v+1+c*h;d.push(S,y,E),d.push(y,T,E)}this.setIndex(d),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(b,3)),this.setAttribute("uv",new je(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var Sc=class e extends En{constructor(t=new xc(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),n=64,i=1,s=8,a=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:n,radius:i,radialSegments:s,closed:a};let r=t.computeFrenetFrames(n,a);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let o=new N,l=new N,c=new Dt,f=new N,p=[],u=[],d=[],g=[];b(),this.setIndex(g),this.setAttribute("position",new je(p,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(d,2));function b(){for(let S=0;S<n;S++)m(S);m(a===!1?n:0),v(),h()}function m(S){f=t.getPointAt(S/n,f);let y=r.normals[S],T=r.binormals[S];for(let E=0;E<=s;E++){let w=E/s*Math.PI*2,x=Math.sin(w),A=-Math.cos(w);l.x=A*y.x+x*T.x,l.y=A*y.y+x*T.y,l.z=A*y.z+x*T.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=f.x+i*l.x,o.y=f.y+i*l.y,o.z=f.z+i*l.z,p.push(o.x,o.y,o.z)}}function h(){for(let S=1;S<=n;S++)for(let y=1;y<=s;y++){let T=(s+1)*(S-1)+(y-1),E=(s+1)*S+(y-1),w=(s+1)*S+y,x=(s+1)*(S-1)+y;g.push(T,E,x),g.push(E,w,x)}}function v(){for(let S=0;S<=n;S++)for(let y=0;y<=s;y++)c.x=S/n,c.y=y/s,d.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new e(new TA[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function lr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(dM(s))s.isRenderTargetTexture?(Lt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(dM(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function wn(e){let t={};for(let n=0;n<e.length;n++){let i=lr(e[n]);for(let s in i)t[s]=i[s]}return t}function dM(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function EA(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function R0(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:jt.workingColorSpace}var $M={clone:lr,merge:wn},AA=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,wA=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,An=class extends va{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=AA,this.fragmentShader=wA,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=lr(t.uniforms),this.uniformsGroups=EA(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new $t().setHex(s.value);break;case"v2":this.uniforms[i].value=new Dt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new N().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Le().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ft().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Fe().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},xf=class extends An{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Sf=class extends va{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=FM,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Mf=class extends va{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Mo(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function jg(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var xa=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},bf=class extends xa{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:t0,endingEnd:t0}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case e0:a=t,o=2*n-i;break;case n0:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case e0:r=t,l=2*i-n;break;case n0:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,f=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*f,this._offsetNext=r*f}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(i-n)/(s-n),b=g*g,m=b*g,h=-u*m+2*u*b-u*g,v=(1+u)*m+(-1.5-2*u)*b+(-.5+u)*g+1,S=(-1-d)*m+(1.5+d)*b+.5*g,y=d*m-d*b;for(let T=0;T!==o;++T)a[T]=h*r[f+T]+v*r[c+T]+S*r[l+T]+y*r[p+T];return a}},Tf=class extends xa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=(i-n)/(s-n),p=1-f;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*f;return a}},Ef=class extends xa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Af=class extends xa{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this.inTangents,p=this.outTangents;if(!f||!p){let g=(i-n)/(s-n),b=1-g;for(let m=0;m!==o;++m)a[m]=r[c+m]*b+r[l+m]*g;return a}let u=o*2,d=t-1;for(let g=0;g!==o;++g){let b=r[c+g],m=r[l+g],h=d*u+g*2,v=p[h],S=p[h+1],y=t*u+g*2,T=f[y],E=f[y+1],w=RA(i,n,v,T,s);a[g]=tb(w,b,S,E,m)}return a}};function tb(e,t,n,i,s){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*i+e*e*e*s}function CA(e,t,n,i,s){let a=1-e;return 3*a*a*(n-t)+6*a*e*(i-n)+3*e*e*(s-i)}function RA(e,t,n,i,s){let a=(e-t)/(s-t);for(let r=0;r<8;r++){let o=tb(a,t,n,i,s)-e;if(Math.abs(o)<1e-10)break;let l=CA(a,t,n,i,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var ai=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Mo(n,this.TimeBufferType),this.values=Mo(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:Mo(t.times,Array),values:Mo(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),jg(t.settings)&&(i.settings={inTangents:Mo(t.settings.inTangents,Array),outTangents:Mo(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Ef(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Tf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new bf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new Af(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case sc:n=this.InterpolantFactoryMethodDiscrete;break;case ef:n=this.InterpolantFactoryMethodLinear;break;case Wh:n=this.InterpolantFactoryMethodSmooth;break;case $g:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Lt("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return sc;case this.InterpolantFactoryMethodLinear:return ef;case this.InterpolantFactoryMethodSmooth:return Wh;case this.InterpolantFactoryMethodBezier:return $g}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t;jg(this.settings)&&(pM(this.settings.inTangents,t),pM(this.settings.outTangents,t))}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(Ot("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Ot("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Ot("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Ot("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&QE(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ot("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Wh,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],f=t[o+1];if(c!==f&&(o!==1||c!==t[0]))if(s)l=!0;else{let p=o*i,u=p-i,d=p+i;for(let g=0;g!==i;++g){let b=n[p+g];if(b!==n[u+g]||b!==n[d+g]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let p=o*i,u=r*i;for(let d=0;d!==i;++d)n[u+d]=n[p+d]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,jg(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function pM(e,t){for(let n=0,i=e.length;n!==i;n+=2)e[n]*=t}ai.prototype.ValueTypeName="";ai.prototype.TimeBufferType=Float32Array;ai.prototype.ValueBufferType=Float32Array;ai.prototype.DefaultInterpolation=ef;var Sa=class extends ai{constructor(t,n,i){super(t,n,i)}};Sa.prototype.ValueTypeName="bool";Sa.prototype.ValueBufferType=Array;Sa.prototype.DefaultInterpolation=sc;Sa.prototype.InterpolantFactoryMethodLinear=void 0;Sa.prototype.InterpolantFactoryMethodSmooth=void 0;var wf=class extends ai{constructor(t,n,i,s){super(t,n,i,s)}};wf.prototype.ValueTypeName="color";var Cf=class extends ai{constructor(t,n,i,s){super(t,n,i,s)}};Cf.prototype.ValueTypeName="number";var Rf=class extends xa{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let f=c+o;c!==f;c+=4)ji.slerpFlat(a,0,r,c-o,r,c,l);return a}},Mc=class extends ai{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new Rf(this.times,this.values,this.getValueSize(),t)}};Mc.prototype.ValueTypeName="quaternion";Mc.prototype.InterpolantFactoryMethodSmooth=void 0;var Ma=class extends ai{constructor(t,n,i){super(t,n,i)}};Ma.prototype.ValueTypeName="string";Ma.prototype.ValueBufferType=Array;Ma.prototype.DefaultInterpolation=sc;Ma.prototype.InterpolantFactoryMethodLinear=void 0;Ma.prototype.InterpolantFactoryMethodSmooth=void 0;var Df=class extends ai{constructor(t,n,i,s){super(t,n,i,s)}};Df.prototype.ValueTypeName="vector";var Uf=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(f){o++,a===!1&&s.onStart!==void 0&&s.onStart(f,r,o),a=!0},this.itemEnd=function(f){r++,s.onProgress!==void 0&&s.onProgress(f,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,p){return c.push(f,p),this},this.removeHandler=function(f){let p=c.indexOf(f);return p!==-1&&c.splice(p,2),this},this.getHandler=function(f){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],g=c[p+1];if(d.global&&(d.lastIndex=0),d.test(f))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},eb=new Uf,Lf=class{constructor(t){this.manager=t!==void 0?t:eb,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Lf.DEFAULT_MATERIAL_NAME="__DEFAULT";var Gh=new N,kh=new ji,Zi=new N,bc=class extends si{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=Ui,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Gh,kh,Zi),Zi.x===1&&Zi.y===1&&Zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gh,kh,Zi.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(Gh,kh,Zi),Zi.x===1&&Zi.y===1&&Zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gh,kh,Zi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},fa=new N,mM=new Dt,gM=new Dt,bn=class extends bc{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=nf*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(wg*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return nf*2*Math.atan(Math.tan(wg*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){fa.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fa.x,fa.y).multiplyScalar(-t/fa.z),fa.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(fa.x,fa.y).multiplyScalar(-t/fa.z)}getViewSize(t,n){return this.getViewBounds(t,mM,gM),n.subVectors(gM,mM)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(wg*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var ar=class extends bc{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}};var Tc=class extends En{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var bo=-90,To=1,Nf=class extends si{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new bn(bo,To,t,n);s.layers=this.layers,this.add(s);let a=new bn(bo,To,t,n);a.layers=this.layers,this.add(a);let r=new bn(bo,To,t,n);r.layers=this.layers,this.add(r);let o=new bn(bo,To,t,n);o.layers=this.layers,this.add(o);let l=new bn(bo,To,t,n);l.layers=this.layers,this.add(l);let c=new bn(bo,To,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Ui)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===rc)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,f]=this.children,p=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let b=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=b,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,f),t.setRenderTarget(p,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},If=class extends bn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var D0="\\[\\]\\.:\\/",DA=new RegExp("["+D0+"]","g"),U0="[^"+D0+"]",UA="[^"+D0.replace("\\.","")+"]",LA=/((?:WC+[\/:])*)/.source.replace("WC",U0),NA=/(WCOD+)?/.source.replace("WCOD",UA),IA=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",U0),OA=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",U0),PA=new RegExp("^"+LA+NA+IA+OA+"$"),BA=["material","materials","bones","map"],i0=class{constructor(t,n,i){let s=i||Ue.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},Ue=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(DA,"")}static parseTrackName(t){let n=PA.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);BA.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Lt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){Ot("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ot("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ot("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ot("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ot("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Ot("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Ot("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;Ot("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Ot("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ot("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ue.Composite=i0;Ue.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ue.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ue.prototype.GetterByBindingType=[Ue.prototype._getValue_direct,Ue.prototype._getValue_array,Ue.prototype._getValue_arrayElement,Ue.prototype._getValue_toArray];Ue.prototype.SetterByBindingTypeAndVersioning=[[Ue.prototype._setValue_direct,Ue.prototype._setValue_direct_setNeedsUpdate,Ue.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_array,Ue.prototype._setValue_array_setNeedsUpdate,Ue.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_arrayElement,Ue.prototype._setValue_arrayElement_setNeedsUpdate,Ue.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_fromArray,Ue.prototype._setValue_fromArray_setNeedsUpdate,Ue.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var lD=new Float32Array(1);var s0=class e{static{e.prototype.isMatrix2=!0}constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};function L0(e,t,n,i){let s=FA(i);switch(n){case M0:return e*t;case T0:return e*t/s.components*s.byteLength;case Gf:return e*t/s.components*s.byteLength;case Ca:return e*t*2/s.components*s.byteLength;case kf:return e*t*2/s.components*s.byteLength;case b0:return e*t*3/s.components*s.byteLength;case Mi:return e*t*4/s.components*s.byteLength;case Wf:return e*t*4/s.components*s.byteLength;case Dc:case Uc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Lc:case Nc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case qf:case Zf:return Math.max(e,16)*Math.max(t,8)/4;case Xf:case Yf:return Math.max(e,8)*Math.max(t,8)/2;case Jf:case Kf:case jf:case $f:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Qf:case Ic:case td:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ed:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case nd:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case id:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case sd:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ad:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case rd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case od:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ld:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case cd:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ud:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case hd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case fd:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case dd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case pd:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case md:case gd:case vd:return Math.ceil(e/4)*Math.ceil(t/4)*16;case _d:case yd:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Oc:case xd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function FA(e){switch(e){case Nn:case _0:return{byteLength:1,components:1};case Oo:case y0:case ri:return{byteLength:2,components:1};case Hf:case Vf:return{byteLength:2,components:4};case Oi:case zf:case Pi:return{byteLength:4,components:1};case x0:case S0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Lt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function bb(){let e=null,t=!1,n=null,i=null;function s(a,r){i=e.requestAnimationFrame(s),n(a,r)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function HA(e){let t=new WeakMap;function n(o,l){let c=o.array,f=o.usage,p=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=e.HALF_FLOAT:d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){let f=l.array,p=l.updateRanges;if(e.bindBuffer(c,o),p.length===0)e.bufferSubData(c,0,f);else{p.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<p.length;d++){let g=p[u],b=p[d];b.start<=g.start+g.count+1?g.count=Math.max(g.count,b.start+b.count-g.start):(++u,p[u]=b)}p.length=u+1;for(let d=0,g=p.length;d<g;d++){let b=p[d];e.bufferSubData(c,b.start*f.BYTES_PER_ELEMENT,f,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var VA=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,GA=`#ifdef USE_ALPHAHASH
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
#endif`,kA=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,WA=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,XA=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qA=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,YA=`#ifdef USE_AOMAP
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
#endif`,ZA=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,JA=`#ifdef USE_BATCHING
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
#endif`,KA=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,QA=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jA=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$A=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,tw=`#ifdef USE_IRIDESCENCE
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
#endif`,ew=`#ifdef USE_BUMPMAP
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
#endif`,nw=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,iw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,aw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,rw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ow=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,lw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,cw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,uw=`#define PI 3.141592653589793
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
} // validated`,hw=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,fw=`vec3 transformedNormal = objectNormal;
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
#endif`,dw=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pw=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,vw="gl_FragColor = linearToOutputTexel( gl_FragColor );",_w=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,yw=`#ifdef USE_ENVMAP
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
#endif`,xw=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Sw=`#ifdef USE_ENVMAP
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
#endif`,Mw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bw=`#ifdef USE_ENVMAP
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
#endif`,Tw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ew=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Aw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ww=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cw=`#ifdef USE_GRADIENTMAP
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
}`,Rw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Dw=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Uw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Lw=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Nw=`#ifdef USE_ENVMAP
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
#endif`,Iw=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ow=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Pw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Bw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fw=`PhysicalMaterial material;
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
#endif`,zw=`uniform sampler2D dfgLUT;
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
}`,Hw=`
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
#endif`,Vw=`#if defined( RE_IndirectDiffuse )
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
#endif`,Gw=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kw=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Ww=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xw=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qw=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yw=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zw=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jw=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kw=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Qw=`#if defined( USE_POINTS_UV )
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
#endif`,jw=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,$w=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,tC=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,eC=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,nC=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,iC=`#ifdef USE_MORPHTARGETS
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
#endif`,sC=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,aC=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,rC=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,oC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cC=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,uC=`#ifdef USE_NORMALMAP
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
#endif`,hC=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,fC=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dC=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pC=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,mC=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gC=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,vC=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,_C=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,yC=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xC=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,SC=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,MC=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,TC=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,EC=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,AC=`float getShadowMask() {
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
}`,wC=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,CC=`#ifdef USE_SKINNING
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
#endif`,RC=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,DC=`#ifdef USE_SKINNING
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
#endif`,UC=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,LC=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,NC=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,IC=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,OC=`#ifdef USE_TRANSMISSION
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
#endif`,PC=`#ifdef USE_TRANSMISSION
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
#endif`,BC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,FC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,HC=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,VC=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,GC=`uniform sampler2D t2D;
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
}`,kC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,WC=`#ifdef ENVMAP_TYPE_CUBE
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
}`,XC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qC=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,YC=`#include <common>
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
}`,ZC=`#if DEPTH_PACKING == 3200
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
}`,JC=`#define DISTANCE
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
}`,KC=`#define DISTANCE
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
}`,QC=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,jC=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$C=`uniform float scale;
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
}`,tR=`uniform vec3 diffuse;
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
}`,eR=`#include <common>
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
}`,nR=`uniform vec3 diffuse;
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
}`,iR=`#define LAMBERT
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
}`,sR=`#define LAMBERT
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
}`,aR=`#define MATCAP
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
}`,rR=`#define MATCAP
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
}`,oR=`#define NORMAL
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
}`,lR=`#define NORMAL
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
}`,cR=`#define PHONG
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
}`,uR=`#define PHONG
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
}`,hR=`#define STANDARD
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
}`,fR=`#define STANDARD
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
}`,dR=`#define TOON
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
}`,pR=`#define TOON
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
}`,mR=`uniform float size;
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
}`,gR=`uniform vec3 diffuse;
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
}`,vR=`#include <common>
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
}`,_R=`uniform vec3 color;
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
}`,yR=`uniform float rotation;
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
}`,xR=`uniform vec3 diffuse;
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
}`,qt={alphahash_fragment:VA,alphahash_pars_fragment:GA,alphamap_fragment:kA,alphamap_pars_fragment:WA,alphatest_fragment:XA,alphatest_pars_fragment:qA,aomap_fragment:YA,aomap_pars_fragment:ZA,batching_pars_vertex:JA,batching_vertex:KA,begin_vertex:QA,beginnormal_vertex:jA,bsdfs:$A,iridescence_fragment:tw,bumpmap_pars_fragment:ew,clipping_planes_fragment:nw,clipping_planes_pars_fragment:iw,clipping_planes_pars_vertex:sw,clipping_planes_vertex:aw,color_fragment:rw,color_pars_fragment:ow,color_pars_vertex:lw,color_vertex:cw,common:uw,cube_uv_reflection_fragment:hw,defaultnormal_vertex:fw,displacementmap_pars_vertex:dw,displacementmap_vertex:pw,emissivemap_fragment:mw,emissivemap_pars_fragment:gw,colorspace_fragment:vw,colorspace_pars_fragment:_w,envmap_fragment:yw,envmap_common_pars_fragment:xw,envmap_pars_fragment:Sw,envmap_pars_vertex:Mw,envmap_physical_pars_fragment:Nw,envmap_vertex:bw,fog_vertex:Tw,fog_pars_vertex:Ew,fog_fragment:Aw,fog_pars_fragment:ww,gradientmap_pars_fragment:Cw,lightmap_pars_fragment:Rw,lights_lambert_fragment:Dw,lights_lambert_pars_fragment:Uw,lights_pars_begin:Lw,lights_toon_fragment:Iw,lights_toon_pars_fragment:Ow,lights_phong_fragment:Pw,lights_phong_pars_fragment:Bw,lights_physical_fragment:Fw,lights_physical_pars_fragment:zw,lights_fragment_begin:Hw,lights_fragment_maps:Vw,lights_fragment_end:Gw,lightprobes_pars_fragment:kw,logdepthbuf_fragment:Ww,logdepthbuf_pars_fragment:Xw,logdepthbuf_pars_vertex:qw,logdepthbuf_vertex:Yw,map_fragment:Zw,map_pars_fragment:Jw,map_particle_fragment:Kw,map_particle_pars_fragment:Qw,metalnessmap_fragment:jw,metalnessmap_pars_fragment:$w,morphinstance_vertex:tC,morphcolor_vertex:eC,morphnormal_vertex:nC,morphtarget_pars_vertex:iC,morphtarget_vertex:sC,normal_fragment_begin:aC,normal_fragment_maps:rC,normal_pars_fragment:oC,normal_pars_vertex:lC,normal_vertex:cC,normalmap_pars_fragment:uC,clearcoat_normal_fragment_begin:hC,clearcoat_normal_fragment_maps:fC,clearcoat_pars_fragment:dC,iridescence_pars_fragment:pC,opaque_fragment:mC,packing:gC,premultiplied_alpha_fragment:vC,project_vertex:_C,dithering_fragment:yC,dithering_pars_fragment:xC,roughnessmap_fragment:SC,roughnessmap_pars_fragment:MC,shadowmap_pars_fragment:bC,shadowmap_pars_vertex:TC,shadowmap_vertex:EC,shadowmask_pars_fragment:AC,skinbase_vertex:wC,skinning_pars_vertex:CC,skinning_vertex:RC,skinnormal_vertex:DC,specularmap_fragment:UC,specularmap_pars_fragment:LC,tonemapping_fragment:NC,tonemapping_pars_fragment:IC,transmission_fragment:OC,transmission_pars_fragment:PC,uv_pars_fragment:BC,uv_pars_vertex:FC,uv_vertex:zC,worldpos_vertex:HC,background_vert:VC,background_frag:GC,backgroundCube_vert:kC,backgroundCube_frag:WC,cube_vert:XC,cube_frag:qC,depth_vert:YC,depth_frag:ZC,distance_vert:JC,distance_frag:KC,equirect_vert:QC,equirect_frag:jC,linedashed_vert:$C,linedashed_frag:tR,meshbasic_vert:eR,meshbasic_frag:nR,meshlambert_vert:iR,meshlambert_frag:sR,meshmatcap_vert:aR,meshmatcap_frag:rR,meshnormal_vert:oR,meshnormal_frag:lR,meshphong_vert:cR,meshphong_frag:uR,meshphysical_vert:hR,meshphysical_frag:fR,meshtoon_vert:dR,meshtoon_frag:pR,points_vert:mR,points_frag:gR,shadow_vert:vR,shadow_frag:_R,sprite_vert:yR,sprite_frag:xR},pt={common:{diffuse:{value:new $t(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ft}},envmap:{envMap:{value:null},envMapRotation:{value:new Ft},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ft},normalScale:{value:new Dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new $t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0},uvTransform:{value:new Ft}},sprite:{diffuse:{value:new $t(16777215)},opacity:{value:1},center:{value:new Dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}}},es={basic:{uniforms:wn([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:wn([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new $t(0)},envMapIntensity:{value:1}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:wn([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new $t(0)},specular:{value:new $t(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:wn([pt.common,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.roughnessmap,pt.metalnessmap,pt.fog,pt.lights,{emissive:{value:new $t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:wn([pt.common,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.gradientmap,pt.fog,pt.lights,{emissive:{value:new $t(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:wn([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:wn([pt.points,pt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:wn([pt.common,pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:wn([pt.common,pt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:wn([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:wn([pt.sprite,pt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ft}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:wn([pt.common,pt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:wn([pt.lights,pt.fog,{color:{value:new $t(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};es.physical={uniforms:wn([es.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ft},clearcoatNormalScale:{value:new Dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ft},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ft},sheen:{value:0},sheenColor:{value:new $t(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ft},transmissionSamplerSize:{value:new Dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ft},attenuationDistance:{value:0},attenuationColor:{value:new $t(0)},specularColor:{value:new $t(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ft},anisotropyVector:{value:new Dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ft}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var bd={r:0,b:0,g:0},SR=new Fe,Tb=new Ft;Tb.set(-1,0,0,0,1,0,0,0,1);function MR(e,t,n,i,s,a){let r=new $t(0),o=s===!0?0:1,l,c,f=null,p=0,u=null;function d(v){let S=v.isScene===!0?v.background:null;if(S&&S.isTexture){let y=v.backgroundBlurriness>0;S=t.get(S,y)}return S}function g(v){let S=!1,y=d(v);y===null?m(r,o):y&&y.isColor&&(m(y,1),S=!0);let T=e.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,a):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function b(v,S){let y=d(S);y&&(y.isCubeTexture||y.mapping===Cc)?(c===void 0&&(c=new _n(new Uo(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:lr(es.backgroundCube.uniforms),vertexShader:es.backgroundCube.vertexShader,fragmentShader:es.backgroundCube.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(SR.makeRotationFromEuler(S.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Tb),c.material.toneMapped=jt.getTransfer(y.colorSpace)!==he,(f!==y||p!==y.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new _n(new ya(2,2),new An({name:"BackgroundMaterial",uniforms:lr(es.background.uniforms),vertexShader:es.background.vertexShader,fragmentShader:es.background.fragmentShader,side:ba,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=jt.getTransfer(y.colorSpace)!==he,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||p!==y.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,S){v.getRGB(bd,R0(e)),n.buffers.color.setClear(bd.r,bd.g,bd.b,S,a)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(v,S=1){r.set(v),o=S,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(v){o=v,m(r,o)},render:g,addToRenderList:b,dispose:h}}function bR(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(I,F,V,L,G){let Z=!1,Y=p(I,L,V,F);a!==Y&&(a=Y,c(a.object)),Z=d(I,L,V,G),Z&&g(I,L,V,G),G!==null&&t.update(G,e.ELEMENT_ARRAY_BUFFER),(Z||r)&&(r=!1,y(I,F,V,L),G!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return e.createVertexArray()}function c(I){return e.bindVertexArray(I)}function f(I){return e.deleteVertexArray(I)}function p(I,F,V,L){let G=L.wireframe===!0,Z=i[F.id];Z===void 0&&(Z={},i[F.id]=Z);let Y=I.isInstancedMesh===!0?I.id:0,st=Z[Y];st===void 0&&(st={},Z[Y]=st);let X=st[V.id];X===void 0&&(X={},st[V.id]=X);let nt=X[G];return nt===void 0&&(nt=u(l()),X[G]=nt),nt}function u(I){let F=[],V=[],L=[];for(let G=0;G<n;G++)F[G]=0,V[G]=0,L[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:V,attributeDivisors:L,object:I,attributes:{},index:null}}function d(I,F,V,L){let G=a.attributes,Z=F.attributes,Y=0,st=V.getAttributes();for(let X in st)if(st[X].location>=0){let j=G[X],Rt=Z[X];if(Rt===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(Rt=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(Rt=I.instanceColor)),j===void 0||j.attribute!==Rt||Rt&&j.data!==Rt.data)return!0;Y++}return a.attributesNum!==Y||a.index!==L}function g(I,F,V,L){let G={},Z=F.attributes,Y=0,st=V.getAttributes();for(let X in st)if(st[X].location>=0){let j=Z[X];j===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(j=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(j=I.instanceColor));let Rt={};Rt.attribute=j,j&&j.data&&(Rt.data=j.data),G[X]=Rt,Y++}a.attributes=G,a.attributesNum=Y,a.index=L}function b(){let I=a.newAttributes;for(let F=0,V=I.length;F<V;F++)I[F]=0}function m(I){h(I,0)}function h(I,F){let V=a.newAttributes,L=a.enabledAttributes,G=a.attributeDivisors;V[I]=1,L[I]===0&&(e.enableVertexAttribArray(I),L[I]=1),G[I]!==F&&(e.vertexAttribDivisor(I,F),G[I]=F)}function v(){let I=a.newAttributes,F=a.enabledAttributes;for(let V=0,L=F.length;V<L;V++)F[V]!==I[V]&&(e.disableVertexAttribArray(V),F[V]=0)}function S(I,F,V,L,G,Z,Y){Y===!0?e.vertexAttribIPointer(I,F,V,G,Z):e.vertexAttribPointer(I,F,V,L,G,Z)}function y(I,F,V,L){b();let G=L.attributes,Z=V.getAttributes(),Y=F.defaultAttributeValues;for(let st in Z){let X=Z[st];if(X.location>=0){let nt=G[st];if(nt===void 0&&(st==="instanceMatrix"&&I.instanceMatrix&&(nt=I.instanceMatrix),st==="instanceColor"&&I.instanceColor&&(nt=I.instanceColor)),nt!==void 0){let j=nt.normalized,Rt=nt.itemSize,ft=t.get(nt);if(ft===void 0)continue;let se=ft.buffer,Pt=ft.type,Ht=ft.bytesPerElement,W=Pt===e.INT||Pt===e.UNSIGNED_INT||nt.gpuType===zf;if(nt.isInterleavedBufferAttribute){let tt=nt.data,yt=tt.stride,Bt=nt.offset;if(tt.isInstancedInterleavedBuffer){for(let _t=0;_t<X.locationSize;_t++)h(X.location+_t,tt.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let _t=0;_t<X.locationSize;_t++)m(X.location+_t);e.bindBuffer(e.ARRAY_BUFFER,se);for(let _t=0;_t<X.locationSize;_t++)S(X.location+_t,Rt/X.locationSize,Pt,j,yt*Ht,(Bt+Rt/X.locationSize*_t)*Ht,W)}else{if(nt.isInstancedBufferAttribute){for(let tt=0;tt<X.locationSize;tt++)h(X.location+tt,nt.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=nt.meshPerAttribute*nt.count)}else for(let tt=0;tt<X.locationSize;tt++)m(X.location+tt);e.bindBuffer(e.ARRAY_BUFFER,se);for(let tt=0;tt<X.locationSize;tt++)S(X.location+tt,Rt/X.locationSize,Pt,j,Rt*Ht,Rt/X.locationSize*tt*Ht,W)}}else if(Y!==void 0){let j=Y[st];if(j!==void 0)switch(j.length){case 2:e.vertexAttrib2fv(X.location,j);break;case 3:e.vertexAttrib3fv(X.location,j);break;case 4:e.vertexAttrib4fv(X.location,j);break;default:e.vertexAttrib1fv(X.location,j)}}}}v()}function T(){A();for(let I in i){let F=i[I];for(let V in F){let L=F[V];for(let G in L){let Z=L[G];for(let Y in Z)f(Z[Y].object),delete Z[Y];delete L[G]}}delete i[I]}}function E(I){if(i[I.id]===void 0)return;let F=i[I.id];for(let V in F){let L=F[V];for(let G in L){let Z=L[G];for(let Y in Z)f(Z[Y].object),delete Z[Y];delete L[G]}}delete i[I.id]}function w(I){for(let F in i){let V=i[F];for(let L in V){let G=V[L];if(G[I.id]===void 0)continue;let Z=G[I.id];for(let Y in Z)f(Z[Y].object),delete Z[Y];delete G[I.id]}}}function x(I){for(let F in i){let V=i[F],L=I.isInstancedMesh===!0?I.id:0,G=V[L];if(G!==void 0){for(let Z in G){let Y=G[Z];for(let st in Y)f(Y[st].object),delete Y[st];delete G[Z]}delete V[L],Object.keys(V).length===0&&delete i[F]}}}function A(){R(),r=!0,a!==s&&(a=s,c(a.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:R,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:b,enableAttribute:m,disableUnusedAttributes:v}}function TR(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,f){f!==0&&(e.drawArraysInstanced(i,l,c,f),n.update(c,i,f))}function o(l,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,f);let u=0;for(let d=0;d<f;d++)u+=c[d];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function ER(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(w){return!(w!==Mi&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let x=w===ri&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==Nn&&w!==Pi&&!x&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",f=l(c);f!==c&&(Lt("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let p=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&Lt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),h=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),S=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),T=e.getParameter(e.MAX_SAMPLES),E=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:b,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:v,maxVaryings:S,maxFragmentUniforms:y,maxSamples:T,samples:E}}function AR(e){let t=this,n=null,i=0,s=!1,a=!1,r=new Di,o=new Ft,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||i!==0||s;return s=u,i=p.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){n=f(p,u,0)},this.setState=function(p,u,d){let g=p.clippingPlanes,b=p.clipIntersection,m=p.clipShadows,h=e.get(p);if(!s||g===null||g.length===0||a&&!m)a?f(null):c();else{let v=a?0:i,S=v*4,y=h.clippingState||null;l.value=y,y=f(g,u,S,d);for(let T=0;T!==S;++T)y[T]=n[T];h.clippingState=y,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function f(p,u,d,g){let b=p!==null?p.length:0,m=null;if(b!==0){if(m=l.value,g!==!0||m===null){let h=d+b*4,v=u.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<h)&&(m=new Float32Array(h));for(let S=0,y=d;S!==b;++S,y+=4)r.copy(p[S]).applyMatrix4(v,o),r.normal.toArray(m,y),m[y+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=b,t.numIntersection=0,m}}var Fo=4,wR=6,CR=20,RR=256,Bc=new ar,nb=new $t,N0=null,I0=0,O0=0,P0=!1,DR=new N,cr=new N,Ed=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=DR}=a;N0=this._renderer.getRenderTarget(),I0=this._renderer.getActiveCubeFace(),O0=this._renderer.getActiveMipmapLevel(),P0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ab(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=sb(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(N0,I0,O0),this._renderer.xr.enabled=P0,t.scissorTest=!1,Bo(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===Ea||t.mapping===or?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),N0=this._renderer.getRenderTarget(),I0=this._renderer.getActiveCubeFace(),O0=this._renderer.getActiveMipmapLevel(),P0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:vn,minFilter:vn,generateMipmaps:!1,type:ri,format:Mi,colorSpace:pa,depthBuffer:!1},s=ib(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ib(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=UR(a)),this._blurMaterial=NR(a,t,n),this._ggxMaterial=LR(a,t,n)}return s}_compileMaterial(t){let n=new _n(new En,t);this._renderer.compile(n,Bc)}_sceneToCubeUV(t,n,i,s,a){let l=new bn(90,1,n,i),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(nb),p.toneMapping=Ii,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new _n(new Uo,new dc({name:"PMREM.Background",side:Ln,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,m=b.material,h=!1,v=t.background;v?v.isColor&&(m.color.copy(v),t.background=null,h=!0):(m.color.copy(nb),h=!0);for(let S=0;S<6;S++){let y=S%3;y===0?(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[S],a.y,a.z)):y===1?(l.up.set(0,0,c[S]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[S],a.z)):(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[S]));let T=this._cubeSize;Bo(s,y*T,S>2?T:0,T,T),p.setRenderTarget(s),h&&p.render(b,l),p.render(t,l)}p.toneMapping=d,p.autoClear=u,t.background=v}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===Ea||t.mapping===or;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ab()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=sb());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;Bo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,Bc)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),f=n/(this._lodMeshes.length-1),p=Math.sqrt(c*c-f*f),u=c*1.25,d=p*u,{_lodMax:g}=this,b=this._sizeLods[i],m=3*b*(i>g-Fo?i-g+Fo:0),h=4*(this._cubeSize-b);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=g-n,Bo(a,m,h,3*b,2*b),s.setRenderTarget(a),s.render(o,Bc),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=g-i,Bo(t,m,h,3*b,2*b),s.setRenderTarget(t),s.render(o,Bc)}_blur(t,n,i,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,a,n,i,r),this._blurPass(a,t,i,i,r)}_blurPass(t,n,i,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-i;let f=this._sizeLods[s],p=3*f*(s>this._lodMax-Fo?s-this._lodMax+Fo:0),u=4*(this._cubeSize-f);Bo(n,p,u,3*f,2*f),r.setRenderTarget(n),r.render(l,Bc)}};function UR(e){let t=[],n=[],i=e,s=e-Fo+1+wR;for(let a=0;a<s;a++){let r=Math.pow(2,i);t.push(r);let o=1/(r-2),l=-o,c=1+o,f=[l,l,c,l,c,c,l,l,c,c,l,c],p=6,u=6,d=3,g=new Float32Array(d*u*p),b=new Float32Array(d*u*p);for(let h=0;h<p;h++){let v=h%3*2/3-1,S=h>2?0:-1,y=[v,S,0,v+2/3,S,0,v+2/3,S+1,0,v,S,0,v+2/3,S+1,0,v,S+1,0];g.set(y,d*u*h);for(let T=0;T<u;T++){let E=f[T*2]*2-1,w=f[T*2+1]*2-1;h===0?cr.set(1,w,E):h===1?cr.set(-E,1,-w):h===2?cr.set(-E,w,1):h===3?cr.set(-1,w,-E):h===4?cr.set(-E,-1,w):cr.set(E,w,-1),cr.toArray(b,(h*u+T)*d)}}let m=new En;m.setAttribute("position",new gn(g,d)),m.setAttribute("outputDirection",new gn(b,d)),n.push(new _n(m,null)),i>Fo&&i--}return{lodMeshes:n,sizeLods:t}}function ib(e,t,n){let i=new Tn(e,t,n);return i.texture.mapping=Cc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Bo(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function LR(e,t,n){return new An({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:RR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Cd(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function NR(e,t,n){return new An({name:"SphericalGaussianBlur",defines:{SAMPLES:CR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Cd(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function sb(){return new An({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Cd(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function ab(){return new An({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Cd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Si,depthTest:!1,depthWrite:!1})}function Cd(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ad=class extends Tn{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new gc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Uo(5,5,5),a=new An({name:"CubemapFromEquirect",uniforms:lr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ln,blending:Si});a.uniforms.tEquirect.value=n;let r=new _n(s,a),o=n.minFilter;return n.minFilter===Aa&&(n.minFilter=vn),new Nf(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function IR(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===Pf||d===Bf)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let b=new Ad(g.height);return b.fromEquirectangularTexture(e,u),t.set(u,b),u.addEventListener("dispose",c),o(b.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,g=d===Pf||d===Bf,b=d===Ea||d===or;if(g||b){let m=n.get(u),h=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new Ed(e)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),m.texture;if(m!==void 0)return m.texture;{let v=u.image;return g&&v&&v.height>0||b&&v&&l(v)?(i===null&&(i=new Ed(e)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),u.addEventListener("dispose",f),m.texture):null}}}return u}function o(u,d){return d===Pf?u.mapping=Ea:d===Bf&&(u.mapping=or),u}function l(u){let d=0,g=6;for(let b=0;b<g;b++)u[b]!==void 0&&d++;return d===g}function c(u){let d=u.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function f(u){let d=u.target;d.removeEventListener("dispose",f);let g=n.get(d);g!==void 0&&(n.delete(d),g.dispose())}function p(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:p}}function OR(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&ir("WebGLRenderer: "+i+" extension not supported."),s}}}function PR(e,t,n,i){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)t.update(u[d],e.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,g=p.attributes.position,b=0;if(g===void 0)return;if(d!==null){let v=d.array;b=d.version;for(let S=0,y=v.length;S<y;S+=3){let T=v[S+0],E=v[S+1],w=v[S+2];u.push(T,E,E,w,w,T)}}else{let v=g.array;b=g.version;for(let S=0,y=v.length/3-1;S<y;S+=3){let T=S+0,E=S+1,w=S+2;u.push(T,E,E,w,w,T)}}let m=new(g.count>=65535?hc:uc)(u,1);m.version=b;let h=a.get(p);h&&t.remove(h),a.set(p,m)}function f(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:f}}function BR(e,t,n){let i;function s(p){i=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){e.drawElements(i,u,a,p*r),n.update(u,i,1)}function c(p,u,d){d!==0&&(e.drawElementsInstanced(i,u,a,p*r,d),n.update(u,i,d))}function f(p,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,p,0,d);let b=0;for(let m=0;m<d;m++)b+=u[m];n.update(b,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function FR(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:Ot("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function zR(e,t,n){let i=new WeakMap,s=new Le;function a(r,o,l){let c=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0,u=i.get(o);if(u===void 0||u.count!==p){let A=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],h=o.morphAttributes.normal||[],v=o.morphAttributes.color||[],S=0;d===!0&&(S=1),g===!0&&(S=2),b===!0&&(S=3);let y=o.attributes.position.count*S,T=1;y>t.maxTextureSize&&(T=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let E=new Float32Array(y*T*4*p),w=new lc(E,y,T,p);w.type=Pi,w.needsUpdate=!0;let x=S*4;for(let R=0;R<p;R++){let I=m[R],F=h[R],V=v[R],L=y*T*4*R;for(let G=0;G<I.count;G++){let Z=G*x;d===!0&&(s.fromBufferAttribute(I,G),E[L+Z+0]=s.x,E[L+Z+1]=s.y,E[L+Z+2]=s.z,E[L+Z+3]=0),g===!0&&(s.fromBufferAttribute(F,G),E[L+Z+4]=s.x,E[L+Z+5]=s.y,E[L+Z+6]=s.z,E[L+Z+7]=0),b===!0&&(s.fromBufferAttribute(V,G),E[L+Z+8]=s.x,E[L+Z+9]=s.y,E[L+Z+10]=s.z,E[L+Z+11]=V.itemSize===4?s.w:1)}}u={count:p,texture:w,size:new Dt(y,T)},i.set(o,u),o.addEventListener("dispose",A)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let d=0;for(let b=0;b<c.length;b++)d+=c[b];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",g),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function HR(e,t,n,i,s){let a=new WeakMap;function r(c){let f=s.render.frame,p=c.geometry,u=t.get(c,p);if(a.get(u)!==f&&(t.update(u),a.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==f&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,f))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return u}function o(){a=new WeakMap}function l(c){let f=c.target;f.removeEventListener("dispose",l),i.releaseStatesOfObject(f),n.remove(f.instanceMatrix),f.instanceColor!==null&&n.remove(f.instanceColor)}return{update:r,dispose:o}}var VR={[u0]:"LINEAR_TONE_MAPPING",[h0]:"REINHARD_TONE_MAPPING",[f0]:"CINEON_TONE_MAPPING",[d0]:"ACES_FILMIC_TONE_MAPPING",[m0]:"AGX_TONE_MAPPING",[g0]:"NEUTRAL_TONE_MAPPING",[p0]:"CUSTOM_TONE_MAPPING"};function GR(e,t,n,i,s,a){let r=new Tn(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new En;c.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new je([0,2,0,0,2,0],2));let f=new xf({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),p=new _n(c,f),u=new ar(-1,1,1,-1,0,1),d=null,g=null,b=!1,m,h=null,v=[],S=!1;this.setSize=function(y,T){r.setSize(y,T),o!==null&&o.setSize(y,T),l!==null&&l.setSize(y,T);for(let E=0;E<v.length;E++){let w=v[E];w.setSize&&w.setSize(y,T)}},this.setEffects=function(y){v=y,S=v.length>0&&v[0].isRenderPass===!0;let T=r.width,E=r.height;v.length>0&&o===null&&(o=new Tn(T,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}),l=new Tn(T,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<v.length;w++){let x=v[w];x.setSize&&x.setSize(T,E)}},this.begin=function(y,T){if(b||y.toneMapping===Ii&&v.length===0)return!1;if(h=T,T!==null){let E=T.width,w=T.height;(r.width!==E||r.height!==w)&&this.setSize(E,w)}return S===!1&&y.setRenderTarget(r),m=y.toneMapping,y.toneMapping=Ii,!0},this.hasRenderPass=function(){return S},this.end=function(y,T){y.toneMapping=m,b=!0;let E=r,w=o;for(let x=0;x<v.length;x++){let A=v[x];A.enabled!==!1&&(A.render(y,w,E,T),A.needsSwap!==!1&&(E=w,w=w===o?l:o))}if(d!==y.outputColorSpace||g!==y.toneMapping){d=y.outputColorSpace,g=y.toneMapping,f.defines={},jt.getTransfer(d)===he&&(f.defines.SRGB_TRANSFER="");let x=VR[g];x&&(f.defines[x]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=E.texture,y.setRenderTarget(h),y.render(p,u),h=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),f.dispose()}}var Eb=new Gn,z0=new _a(1,1),Ab=new lc,wb=new rf,Cb=new gc,rb=[],ob=[],lb=new Float32Array(16),cb=new Float32Array(9),ub=new Float32Array(4);function Ho(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=rb[s];if(a===void 0&&(a=new Float32Array(s),rb[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function nn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function sn(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function Rd(e,t){let n=ob[t];n===void 0&&(n=new Int32Array(t),ob[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function kR(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function WR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(nn(n,t))return;e.uniform2fv(this.addr,t),sn(n,t)}}function XR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(nn(n,t))return;e.uniform3fv(this.addr,t),sn(n,t)}}function qR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(nn(n,t))return;e.uniform4fv(this.addr,t),sn(n,t)}}function YR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;ub.set(i),e.uniformMatrix2fv(this.addr,!1,ub),sn(n,i)}}function ZR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;cb.set(i),e.uniformMatrix3fv(this.addr,!1,cb),sn(n,i)}}function JR(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;lb.set(i),e.uniformMatrix4fv(this.addr,!1,lb),sn(n,i)}}function KR(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function QR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(nn(n,t))return;e.uniform2iv(this.addr,t),sn(n,t)}}function jR(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(nn(n,t))return;e.uniform3iv(this.addr,t),sn(n,t)}}function $R(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(nn(n,t))return;e.uniform4iv(this.addr,t),sn(n,t)}}function t2(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function e2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(nn(n,t))return;e.uniform2uiv(this.addr,t),sn(n,t)}}function n2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(nn(n,t))return;e.uniform3uiv(this.addr,t),sn(n,t)}}function i2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(nn(n,t))return;e.uniform4uiv(this.addr,t),sn(n,t)}}function s2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(z0.compareFunction=n.isReversedDepthBuffer()?Md:Sd,a=z0):a=Eb,n.setTexture2D(t||a,s)}function a2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||wb,s)}function r2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||Cb,s)}function o2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||Ab,s)}function l2(e){switch(e){case 5126:return kR;case 35664:return WR;case 35665:return XR;case 35666:return qR;case 35674:return YR;case 35675:return ZR;case 35676:return JR;case 5124:case 35670:return KR;case 35667:case 35671:return QR;case 35668:case 35672:return jR;case 35669:case 35673:return $R;case 5125:return t2;case 36294:return e2;case 36295:return n2;case 36296:return i2;case 35678:case 36198:case 36298:case 36306:case 35682:return s2;case 35679:case 36299:case 36307:return a2;case 35680:case 36300:case 36308:case 36293:return r2;case 36289:case 36303:case 36311:case 36292:return o2}}function c2(e,t){e.uniform1fv(this.addr,t)}function u2(e,t){let n=Ho(t,this.size,2);e.uniform2fv(this.addr,n)}function h2(e,t){let n=Ho(t,this.size,3);e.uniform3fv(this.addr,n)}function f2(e,t){let n=Ho(t,this.size,4);e.uniform4fv(this.addr,n)}function d2(e,t){let n=Ho(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function p2(e,t){let n=Ho(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function m2(e,t){let n=Ho(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function g2(e,t){e.uniform1iv(this.addr,t)}function v2(e,t){e.uniform2iv(this.addr,t)}function _2(e,t){e.uniform3iv(this.addr,t)}function y2(e,t){e.uniform4iv(this.addr,t)}function x2(e,t){e.uniform1uiv(this.addr,t)}function S2(e,t){e.uniform2uiv(this.addr,t)}function M2(e,t){e.uniform3uiv(this.addr,t)}function b2(e,t){e.uniform4uiv(this.addr,t)}function T2(e,t,n){let i=this.cache,s=t.length,a=Rd(n,s);nn(i,a)||(e.uniform1iv(this.addr,a),sn(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=z0:r=Eb;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function E2(e,t,n){let i=this.cache,s=t.length,a=Rd(n,s);nn(i,a)||(e.uniform1iv(this.addr,a),sn(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||wb,a[r])}function A2(e,t,n){let i=this.cache,s=t.length,a=Rd(n,s);nn(i,a)||(e.uniform1iv(this.addr,a),sn(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||Cb,a[r])}function w2(e,t,n){let i=this.cache,s=t.length,a=Rd(n,s);nn(i,a)||(e.uniform1iv(this.addr,a),sn(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||Ab,a[r])}function C2(e){switch(e){case 5126:return c2;case 35664:return u2;case 35665:return h2;case 35666:return f2;case 35674:return d2;case 35675:return p2;case 35676:return m2;case 5124:case 35670:return g2;case 35667:case 35671:return v2;case 35668:case 35672:return _2;case 35669:case 35673:return y2;case 5125:return x2;case 36294:return S2;case 36295:return M2;case 36296:return b2;case 35678:case 36198:case 36298:case 36306:case 35682:return T2;case 35679:case 36299:case 36307:return E2;case 35680:case 36300:case 36308:case 36293:return A2;case 36289:case 36303:case 36311:case 36292:return w2}}var H0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=l2(n.type)}},V0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=C2(n.type)}},G0=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},B0=/(\w+)(\])?(\[|\.)?/g;function hb(e,t){e.seq.push(t),e.map[t.id]=t}function R2(e,t,n){let i=e.name,s=i.length;for(B0.lastIndex=0;;){let a=B0.exec(i),r=B0.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){hb(n,c===void 0?new H0(o,e,t):new V0(o,e,t));break}else{let p=n.map[o];p===void 0&&(p=new G0(o),hb(n,p)),n=p}}}var zo=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);R2(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function fb(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var D2=37297,U2=0;function L2(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var db=new Ft;function N2(e){jt._getMatrix(db,jt.workingColorSpace,e);let t=`mat3( ${db.elements.map(n=>n.toFixed(4))} )`;switch(jt.getTransfer(e)){case ac:return[t,"LinearTransferOETF"];case he:return[t,"sRGBTransferOETF"];default:return Lt("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function pb(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+L2(e.getShaderSource(t),o)}else return a}function I2(e,t){let n=N2(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var O2={[u0]:"Linear",[h0]:"Reinhard",[f0]:"Cineon",[d0]:"ACESFilmic",[m0]:"AgX",[g0]:"Neutral",[p0]:"Custom"};function P2(e,t){let n=O2[t];return n===void 0?(Lt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Td=new N;function B2(){jt.getLuminanceCoefficients(Td);let e=Td.x.toFixed(4),t=Td.y.toFixed(4),n=Td.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function F2(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zc).join(`
`)}function z2(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function H2(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function zc(e){return e!==""}function mb(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function gb(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var V2=/^[ \t]*#include +<([\w\d./]+)>/gm;function k0(e){return e.replace(V2,k2)}var G2=new Map;function k2(e,t){let n=qt[t];if(n===void 0){let i=G2.get(t);if(i!==void 0)n=qt[i],Lt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return k0(n)}var W2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vb(e){return e.replace(W2,X2)}function X2(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function _b(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var q2={[Ec]:"SHADOWMAP_TYPE_PCF",[No]:"SHADOWMAP_TYPE_VSM"};function Y2(e){return q2[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Z2={[Ea]:"ENVMAP_TYPE_CUBE",[or]:"ENVMAP_TYPE_CUBE",[Cc]:"ENVMAP_TYPE_CUBE_UV"};function J2(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Z2[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var K2={[or]:"ENVMAP_MODE_REFRACTION"};function Q2(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":K2[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var j2={[c0]:"ENVMAP_BLENDING_MULTIPLY",[OM]:"ENVMAP_BLENDING_MIX",[PM]:"ENVMAP_BLENDING_ADD"};function $2(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":j2[e.combine]||"ENVMAP_BLENDING_NONE"}function t3(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function e3(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=Y2(n),c=J2(n),f=Q2(n),p=$2(n),u=t3(n),d=F2(n),g=z2(a),b=s.createProgram(),m,h,v=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(zc).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(zc).join(`
`),h.length>0&&(h+=`
`)):(m=[_b(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zc).join(`
`),h=[_b(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",n.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ii?"#define TONE_MAPPING":"",n.toneMapping!==Ii?qt.tonemapping_pars_fragment:"",n.toneMapping!==Ii?P2("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,I2("linearToOutputTexel",n.outputColorSpace),B2(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(zc).join(`
`)),r=k0(r),r=mb(r,n),r=gb(r,n),o=k0(o),o=mb(o,n),o=gb(o,n),r=vb(r),o=vb(o),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",n.glslVersion===A0?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===A0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);let S=v+m+r,y=v+h+o,T=fb(s,s.VERTEX_SHADER,S),E=fb(s,s.FRAGMENT_SHADER,y);s.attachShader(b,T),s.attachShader(b,E),n.index0AttributeName!==void 0?s.bindAttribLocation(b,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function w(I){if(e.debug.checkShaderErrors){let F=s.getProgramInfoLog(b)||"",V=s.getShaderInfoLog(T)||"",L=s.getShaderInfoLog(E)||"",G=F.trim(),Z=V.trim(),Y=L.trim(),st=!0,X=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(st=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,b,T,E);else{let nt=pb(s,T,"vertex"),j=pb(s,E,"fragment");Ot("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+G+`
`+nt+`
`+j)}else G!==""?Lt("WebGLProgram: Program Info Log:",G):(Z===""||Y==="")&&(X=!1);X&&(I.diagnostics={runnable:st,programLog:G,vertexShader:{log:Z,prefix:m},fragmentShader:{log:Y,prefix:h}})}s.deleteShader(T),s.deleteShader(E),x=new zo(s,b),A=H2(s,b)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let A;this.getAttributes=function(){return A===void 0&&w(this),A};let R=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(b,D2)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=U2++,this.cacheKey=t,this.usedTimes=1,this.program=b,this.vertexShader=T,this.fragmentShader=E,this}var n3=0,W0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new X0(t),n.set(t,i)),i}},X0=class{constructor(t){this.id=n3++,this.code=t,this.usedTimes=0}};function i3(e){return e===Ca||e===Ic||e===Oc}function s3(e,t,n,i,s,a){let r=new cc,o=new W0,l=new Set,c=[],f=new Map,p=i.logarithmicDepthBuffer,u=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function b(x,A,R,I,F,V){let L=I.fog,G=F.geometry,Z=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,Y=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,st=t.get(x.envMap||Z,Y),X=st&&st.mapping===Cc?st.image.height:null,nt=d[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&Lt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let j=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Rt=j!==void 0?j.length:0,ft=0;G.morphAttributes.position!==void 0&&(ft=1),G.morphAttributes.normal!==void 0&&(ft=2),G.morphAttributes.color!==void 0&&(ft=3);let se,Pt,Ht,W;if(nt){let ce=es[nt];se=ce.vertexShader,Pt=ce.fragmentShader}else{se=x.vertexShader,Pt=x.fragmentShader;let ce=o.getVertexShaderStage(x),ne=o.getFragmentShaderStage(x);o.update(x,ce,ne),Ht=ce.id,W=ne.id}let tt=e.getRenderTarget(),yt=e.state.buffers.depth.getReversed(),Bt=F.isInstancedMesh===!0,_t=F.isBatchedMesh===!0,Nt=!!x.map,Ne=!!x.matcap,Gt=!!st,te=!!x.aoMap,fe=!!x.lightMap,Wt=!!x.bumpMap&&x.wireframe===!1,me=!!x.normalMap,Ge=!!x.displacementMap,ze=!!x.emissiveMap,Me=!!x.metalnessMap,Pe=!!x.roughnessMap,O=x.anisotropy>0,Be=x.clearcoat>0,re=x.dispersion>0,C=x.retroreflectivity>0,_=x.iridescence>0,z=x.sheen>0,H=x.transmission>0,q=O&&!!x.anisotropyMap,rt=Be&&!!x.clearcoatMap,ot=Be&&!!x.clearcoatNormalMap,J=Be&&!!x.clearcoatRoughnessMap,K=_&&!!x.iridescenceMap,ut=_&&!!x.iridescenceThicknessMap,wt=z&&!!x.sheenColorMap,dt=z&&!!x.sheenRoughnessMap,lt=!!x.specularMap,At=!!x.specularColorMap,Ut=!!x.specularIntensityMap,zt=H&&!!x.transmissionMap,U=H&&!!x.thicknessMap,ct=!!x.gradientMap,Q=!!x.alphaMap,ht=x.alphaTest>0,$=!!x.alphaHash,et=!!x.extensions,bt=Ii;x.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(bt=e.toneMapping);let St={shaderID:nt,shaderType:x.type,shaderName:x.name,vertexShader:se,fragmentShader:Pt,defines:x.defines,customVertexShaderID:Ht,customFragmentShaderID:W,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:_t,batchingColor:_t&&F._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&F.instanceColor!==null,instancingMorph:Bt&&F.morphTexture!==null,outputColorSpace:tt===null?e.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:jt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Nt,matcap:Ne,envMap:Gt,envMapMode:Gt&&st.mapping,envMapCubeUVHeight:X,aoMap:te,lightMap:fe,bumpMap:Wt,normalMap:me,displacementMap:Ge,emissiveMap:ze,normalMapObjectSpace:me&&x.normalMapType===zM,normalMapTangentSpace:me&&x.normalMapType===E0,packedNormalMap:me&&x.normalMapType===E0&&i3(x.normalMap.format),metalnessMap:Me,roughnessMap:Pe,anisotropy:O,anisotropyMap:q,clearcoat:Be,clearcoatMap:rt,clearcoatNormalMap:ot,clearcoatRoughnessMap:J,dispersion:re,retroreflection:C,iridescence:_,iridescenceMap:K,iridescenceThicknessMap:ut,sheen:z,sheenColorMap:wt,sheenRoughnessMap:dt,specularMap:lt,specularColorMap:At,specularIntensityMap:Ut,transmission:H,transmissionMap:zt,thicknessMap:U,gradientMap:ct,opaque:x.transparent===!1&&x.blending===Ta&&x.alphaToCoverage===!1,alphaMap:Q,alphaTest:ht,alphaHash:$,combine:x.combine,mapUv:Nt&&g(x.map.channel),aoMapUv:te&&g(x.aoMap.channel),lightMapUv:fe&&g(x.lightMap.channel),bumpMapUv:Wt&&g(x.bumpMap.channel),normalMapUv:me&&g(x.normalMap.channel),displacementMapUv:Ge&&g(x.displacementMap.channel),emissiveMapUv:ze&&g(x.emissiveMap.channel),metalnessMapUv:Me&&g(x.metalnessMap.channel),roughnessMapUv:Pe&&g(x.roughnessMap.channel),anisotropyMapUv:q&&g(x.anisotropyMap.channel),clearcoatMapUv:rt&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ot&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:ut&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:wt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:dt&&g(x.sheenRoughnessMap.channel),specularMapUv:lt&&g(x.specularMap.channel),specularColorMapUv:At&&g(x.specularColorMap.channel),specularIntensityMapUv:Ut&&g(x.specularIntensityMap.channel),transmissionMapUv:zt&&g(x.transmissionMap.channel),thicknessMapUv:U&&g(x.thicknessMap.channel),alphaMapUv:Q&&g(x.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(me||O),vertexNormals:!!G.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!G.attributes.uv&&(Nt||Q),fog:!!L,useFog:x.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||G.attributes.normal===void 0&&me===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:yt,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:G.attributes.position!==void 0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:Rt,morphTextureStride:ft,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:V.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:e.shadowMap.enabled&&R.length>0,shadowMapType:e.shadowMap.type,toneMapping:bt,decodeVideoTexture:Nt&&x.map.isVideoTexture===!0&&jt.getTransfer(x.map.colorSpace)===he,decodeVideoTextureEmissive:ze&&x.emissiveMap.isVideoTexture===!0&&jt.getTransfer(x.emissiveMap.colorSpace)===he,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===$i,flipSided:x.side===Ln,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:et&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(et&&x.extensions.multiDraw===!0||_t)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return St.vertexUv1s=l.has(1),St.vertexUv2s=l.has(2),St.vertexUv3s=l.has(3),l.clear(),St}function m(x){let A=[];if(x.shaderID?A.push(x.shaderID):(A.push(x.customVertexShaderID),A.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)A.push(R),A.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(h(A,x),v(A,x),A.push(e.outputColorSpace)),A.push(x.customProgramCacheKey),A.join()}function h(x,A){x.push(A.precision),x.push(A.outputColorSpace),x.push(A.envMapMode),x.push(A.envMapCubeUVHeight),x.push(A.mapUv),x.push(A.alphaMapUv),x.push(A.lightMapUv),x.push(A.aoMapUv),x.push(A.bumpMapUv),x.push(A.normalMapUv),x.push(A.displacementMapUv),x.push(A.emissiveMapUv),x.push(A.metalnessMapUv),x.push(A.roughnessMapUv),x.push(A.anisotropyMapUv),x.push(A.clearcoatMapUv),x.push(A.clearcoatNormalMapUv),x.push(A.clearcoatRoughnessMapUv),x.push(A.iridescenceMapUv),x.push(A.iridescenceThicknessMapUv),x.push(A.sheenColorMapUv),x.push(A.sheenRoughnessMapUv),x.push(A.specularMapUv),x.push(A.specularColorMapUv),x.push(A.specularIntensityMapUv),x.push(A.transmissionMapUv),x.push(A.thicknessMapUv),x.push(A.combine),x.push(A.fogExp2),x.push(A.sizeAttenuation),x.push(A.morphTargetsCount),x.push(A.morphAttributeCount),x.push(A.numSunLights),x.push(A.numDirLights),x.push(A.numPointLights),x.push(A.numSpotLights),x.push(A.numSpotLightMaps),x.push(A.numHemiLights),x.push(A.numRectAreaLights),x.push(A.numSunLightShadows),x.push(A.numDirLightShadows),x.push(A.numPointLightShadows),x.push(A.numSpotLightShadows),x.push(A.numSpotLightShadowsWithMaps),x.push(A.numLightProbes),x.push(A.shadowMapType),x.push(A.toneMapping),x.push(A.numClippingPlanes),x.push(A.numClipIntersection),x.push(A.depthPacking)}function v(x,A){r.disableAll(),A.instancing&&r.enable(0),A.instancingColor&&r.enable(1),A.instancingMorph&&r.enable(2),A.matcap&&r.enable(3),A.envMap&&r.enable(4),A.normalMapObjectSpace&&r.enable(5),A.normalMapTangentSpace&&r.enable(6),A.clearcoat&&r.enable(7),A.iridescence&&r.enable(8),A.alphaTest&&r.enable(9),A.vertexColors&&r.enable(10),A.vertexAlphas&&r.enable(11),A.vertexUv1s&&r.enable(12),A.vertexUv2s&&r.enable(13),A.vertexUv3s&&r.enable(14),A.vertexTangents&&r.enable(15),A.anisotropy&&r.enable(16),A.alphaHash&&r.enable(17),A.batching&&r.enable(18),A.dispersion&&r.enable(19),A.retroreflection&&r.enable(24),A.batchingColor&&r.enable(20),A.gradientMap&&r.enable(21),A.packedNormalMap&&r.enable(22),A.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),A.fog&&r.enable(0),A.useFog&&r.enable(1),A.flatShading&&r.enable(2),A.logarithmicDepthBuffer&&r.enable(3),A.reversedDepthBuffer&&r.enable(4),A.skinning&&r.enable(5),A.morphTargets&&r.enable(6),A.morphNormals&&r.enable(7),A.morphColors&&r.enable(8),A.premultipliedAlpha&&r.enable(9),A.shadowMapEnabled&&r.enable(10),A.doubleSided&&r.enable(11),A.flipSided&&r.enable(12),A.useDepthPacking&&r.enable(13),A.dithering&&r.enable(14),A.transmission&&r.enable(15),A.sheen&&r.enable(16),A.opaque&&r.enable(17),A.pointsUvs&&r.enable(18),A.decodeVideoTexture&&r.enable(19),A.decodeVideoTextureEmissive&&r.enable(20),A.alphaToCoverage&&r.enable(21),A.numLightProbeGrids>0&&r.enable(22),A.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function S(x){let A=d[x.type],R;if(A){let I=es[A];R=$M.clone(I.uniforms)}else R=x.uniforms;return R}function y(x,A){let R=f.get(A);return R!==void 0?++R.usedTimes:(R=new e3(e,A,x,s),c.push(R),f.set(A,R)),R}function T(x){if(--x.usedTimes===0){let A=c.indexOf(x);c[A]=c[c.length-1],c.pop(),f.delete(x.cacheKey),x.destroy()}}function E(x){o.remove(x)}function w(){o.dispose()}return{getParameters:b,getProgramCacheKey:m,getUniforms:S,acquireProgram:y,releaseProgram:T,releaseShaderCache:E,programs:c,dispose:w}}function a3(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function r3(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function yb(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function xb(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,g,b,m,h){let v=e[t];return v===void 0?(v={id:u.id,object:u,geometry:d,material:g,materialVariant:r(u),groupOrder:b,renderOrder:u.renderOrder,z:m,group:h},e[t]=v):(v.id=u.id,v.object=u,v.geometry=d,v.material=g,v.materialVariant=r(u),v.groupOrder=b,v.renderOrder=u.renderOrder,v.z=m,v.group=h),t++,v}function l(u,d,g,b,m,h,v){v.reversedDepth===!0&&(m=-m);let S=o(u,d,g,b,m,h);g.transmission>0?i.push(S):g.transparent===!0?s.push(S):n.push(S)}function c(u,d,g,b,m,h){let v=o(u,d,g,b,m,h);g.transmission>0?i.unshift(v):g.transparent===!0?s.unshift(v):n.unshift(v)}function f(u,d){n.length>1&&n.sort(u||r3),i.length>1&&i.sort(d||yb),s.length>1&&s.sort(d||yb)}function p(){for(let u=t,d=e.length;u<d;u++){let g=e[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:p,sort:f}}function o3(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new xb,e.set(i,[r])):s>=a.length?(r=new xb,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function l3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={direction:new N,color:new $t};break;case"SpotLight":n={position:new N,direction:new N,color:new $t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new N,color:new $t,distance:0,decay:0};break;case"HemisphereLight":n={direction:new N,skyColor:new $t,groundColor:new $t};break;case"RectAreaLight":n={color:new $t,position:new N,halfWidth:new N,halfHeight:new N};break}return e[t.id]=n,n}}}function c3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var u3=0;function h3(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function f3(e){let t=new l3,n=c3(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);let s=new N,a=new Fe,r=new Fe;function o(c){let f=0,p=0,u=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let d=0,g=0,b=0,m=0,h=0,v=0,S=0,y=0,T=0,E=0,w=0,x=0,A=0,R=0;c.sort(h3);for(let F=0,V=c.length;F<V;F++){let L=c[F],G=L.color,Z=L.intensity,Y=L.distance,st=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Ca?st=L.shadow.map.texture:st=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)f+=G.r*Z,p+=G.g*Z,u+=G.b*Z;else if(L.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(L.sh.coefficients[X],Z);R++}else if(L.isSunLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let nt=L.shadow,j=n.get(L);j.shadowIntensity=nt.intensity,j.shadowBias=nt.bias,j.shadowNormalBias=nt.normalBias,j.shadowRadius=nt.radius,j.shadowMapSize.copy(nt.mapSize).multiply(nt.getFrameExtents()),i.sunShadow[g]=j,i.sunShadowMap[g]=st;let Rt=nt.getViewportCount();for(let ft=0;ft<Rt;ft++)i.sunShadowMatrix[b+ft]=nt.getMatrix(ft),i.sunShadowCascade[b+ft]=nt._cascadeData[ft];b+=Rt,g++}i.sun[d]=X,d++}else if(L.isDirectionalLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let nt=L.shadow,j=n.get(L);j.shadowIntensity=nt.intensity,j.shadowBias=nt.bias,j.shadowNormalBias=nt.normalBias,j.shadowRadius=nt.radius,j.shadowMapSize=nt.mapSize,i.directionalShadow[m]=j,i.directionalShadowMap[m]=st,i.directionalShadowMatrix[m]=L.shadow.matrix,T++}i.directional[m]=X,m++}else if(L.isSpotLight){let X=t.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(G).multiplyScalar(Z),X.distance=Y,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,i.spot[v]=X;let nt=L.shadow;if(L.map&&(i.spotLightMap[x]=L.map,x++,nt.updateMatrices(L),L.castShadow&&A++),i.spotLightMatrix[v]=nt.matrix,L.castShadow){let j=n.get(L);j.shadowIntensity=nt.intensity,j.shadowBias=nt.bias,j.shadowNormalBias=nt.normalBias,j.shadowRadius=nt.radius,j.shadowMapSize=nt.mapSize,i.spotShadow[v]=j,i.spotShadowMap[v]=st,w++}v++}else if(L.isRectAreaLight){let X=t.get(L);X.color.copy(G).multiplyScalar(Z),X.halfWidth.set(L.width*.5,0,0),X.halfHeight.set(0,L.height*.5,0),i.rectArea[S]=X,S++}else if(L.isPointLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),X.distance=L.distance,X.decay=L.decay,L.castShadow){let nt=L.shadow,j=n.get(L);j.shadowIntensity=nt.intensity,j.shadowBias=nt.bias,j.shadowNormalBias=nt.normalBias,j.shadowRadius=nt.radius,j.shadowMapSize=nt.mapSize,j.shadowCameraNear=nt.camera.near,j.shadowCameraFar=nt.camera.far,i.pointShadow[h]=j,i.pointShadowMap[h]=st,i.pointShadowMatrix[h]=L.shadow.matrix,E++}i.point[h]=X,h++}else if(L.isHemisphereLight){let X=t.get(L);X.skyColor.copy(L.color).multiplyScalar(Z),X.groundColor.copy(L.groundColor).multiplyScalar(Z),i.hemi[y]=X,y++}}S>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pt.LTC_FLOAT_1,i.rectAreaLTC2=pt.LTC_FLOAT_2):(i.rectAreaLTC1=pt.LTC_HALF_1,i.rectAreaLTC2=pt.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=p,i.ambient[2]=u;let I=i.hash;(I.sunLength!==d||I.directionalLength!==m||I.pointLength!==h||I.spotLength!==v||I.rectAreaLength!==S||I.hemiLength!==y||I.numSunShadows!==g||I.numDirectionalShadows!==T||I.numPointShadows!==E||I.numSpotShadows!==w||I.numSpotMaps!==x||I.numLightProbes!==R)&&(i.sun.length=d,i.directional.length=m,i.spot.length=v,i.rectArea.length=S,i.point.length=h,i.hemi.length=y,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=b,i.sunShadowCascade.length=b,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.directionalShadowMatrix.length=T,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+x-A,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=R,I.sunLength=d,I.directionalLength=m,I.pointLength=h,I.spotLength=v,I.rectAreaLength=S,I.hemiLength=y,I.numSunShadows=g,I.numDirectionalShadows=T,I.numPointShadows=E,I.numSpotShadows=w,I.numSpotMaps=x,I.numLightProbes=R,i.version=u3++)}function l(c,f){let p=0,u=0,d=0,g=0,b=0,m=0,h=f.matrixWorldInverse;for(let v=0,S=c.length;v<S;v++){let y=c[v];if(y.isSunLight){let T=i.sun[p];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(h),p++}else if(y.isDirectionalLight){let T=i.directional[u];T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(h),u++}else if(y.isSpotLight){let T=i.spot[g];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(h),T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(h),g++}else if(y.isRectAreaLight){let T=i.rectArea[b];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(h),r.identity(),a.copy(y.matrixWorld),a.premultiply(h),r.extractRotation(a),T.halfWidth.set(y.width*.5,0,0),T.halfHeight.set(0,y.height*.5,0),T.halfWidth.applyMatrix4(r),T.halfHeight.applyMatrix4(r),b++}else if(y.isPointLight){let T=i.point[d];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(h),d++}else if(y.isHemisphereLight){let T=i.hemi[m];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(h),m++}}}return{setup:o,setupView:l,state:i}}function Sb(e){let t=new f3(e),n=[],i=[],s=[];function a(u){p.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function f(u){t.setupView(n,u)}let p={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function d3(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new Sb(e),t.set(s,[o])):a>=r.length?(o=new Sb(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var p3=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,m3=`uniform sampler2D shadow_pass;
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
}`,g3=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],v3=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Mb=new Fe,Fc=new N,F0=new N;function _3(e,t,n){let i=new pc,s=new Dt,a=new Dt,r=new Le,o=new Sf,l=new Mf,c={},f=n.maxTextureSize,p={[ba]:Ln,[Ln]:ba,[$i]:$i},u=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Dt},radius:{value:4}},vertexShader:p3,fragmentShader:m3}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new En;g.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new _n(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ec;let h=this.type;this.render=function(E,w,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===yM&&(Lt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ec);let A=e.getRenderTarget(),R=e.getActiveCubeFace(),I=e.getActiveMipmapLevel(),F=e.state;F.setBlending(Si),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let V=h!==this.type;V&&w.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(G=>G.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,G=E.length;L<G;L++){let Z=E[L],Y=Z.shadow;if(Y===void 0){Lt("WebGLShadowMap:",Z,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let st=Y.getFrameExtents();s.multiply(st),a.copy(Y.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/st.x),s.x=a.x*st.x,Y.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/st.y),s.y=a.y*st.y,Y.mapSize.y=a.y));let X=e.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=X,Y.map===null||V===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===No){if(Z.isPointLight){Lt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Tn(s.x,s.y,{format:Ca,type:ri,minFilter:vn,magFilter:vn,generateMipmaps:!1}),Y.map.texture.name=Z.name+".shadowMap",Y.map.depthTexture=new _a(s.x,s.y,Pi),Y.map.depthTexture.name=Z.name+".shadowMapDepth",Y.map.depthTexture.format=Ki,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=cn,Y.map.depthTexture.magFilter=cn}else Z.isPointLight?(Y.map=new Ad(s.x),Y.map.depthTexture=new ff(s.x,Oi)):(Y.map=new Tn(s.x,s.y),Y.map.depthTexture=new _a(s.x,s.y,Oi)),Y.map.depthTexture.name=Z.name+".shadowMap",Y.map.depthTexture.format=Ki,this.type===Ec?(Y.map.depthTexture.compareFunction=X?Md:Sd,Y.map.depthTexture.minFilter=vn,Y.map.depthTexture.magFilter=vn):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=cn,Y.map.depthTexture.magFilter=cn);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==s.x||Y.map.height!==s.y)&&Y.map.setSize(s.x,s.y);let nt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();Z.isPointLight!==!0&&Y.updateMatrices(Z,x);for(let j=0;j<nt;j++){let Rt=Y.getCamera(j);if(Z.isPointLight){let ft=Y.camera,se=Y.matrix,Pt=Z.distance||ft.far;Pt!==ft.far&&(ft.far=Pt,ft.updateProjectionMatrix()),Fc.setFromMatrixPosition(Z.matrixWorld),ft.position.copy(Fc),F0.copy(ft.position),F0.add(g3[j]),ft.up.copy(v3[j]),ft.lookAt(F0),ft.updateMatrixWorld(),se.makeTranslation(-Fc.x,-Fc.y,-Fc.z),Mb.multiplyMatrices(ft.projectionMatrix,ft.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Mb,ft.coordinateSystem,ft.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)e.setRenderTarget(Y.map,j),e.clear();else{j===0&&(e.setRenderTarget(Y.map),e.clear());let ft=Y.getViewport(j);r.set(a.x*ft.x,a.y*ft.y,a.x*ft.z,a.y*ft.w),F.viewport(r)}i=Y.getFrustum(j),y(w,x,Rt,Z,this.type)}Y.isPointLightShadow!==!0&&this.type===No&&v(Y,x),Y.needsUpdate=!1}h=this.type,m.needsUpdate=!1,e.setRenderTarget(A,R,I)};function v(E,w){let x=t.update(b);u.defines.VSM_SAMPLES!==E.blurSamples&&(u.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null?E.mapPass=new Tn(s.x,s.y,{format:Ca,type:ri}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),u.uniforms.shadow_pass.value=E.map.depthTexture,u.uniforms.resolution.value.set(E.map.width,E.map.height),u.uniforms.radius.value=E.radius,e.setRenderTarget(E.mapPass),e.clear(),e.renderBufferDirect(w,null,x,u,b,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,e.setRenderTarget(E.map),e.clear(),e.renderBufferDirect(w,null,x,d,b,null)}function S(E,w,x,A){let R=null,I=x.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let F=R.uuid,V=w.uuid,L=c[F];L===void 0&&(L={},c[F]=L);let G=L[V];G===void 0&&(G=R.clone(),L[V]=G,w.addEventListener("dispose",T)),R=G}if(R.visible=w.visible,R.wireframe=w.wireframe,A===No?R.side=w.shadowSide!==null?w.shadowSide:w.side:R.side=w.shadowSide!==null?w.shadowSide:p[w.side],R.alphaMap=w.alphaMap,R.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,R.map=w.map,R.clipShadows=w.clipShadows,R.clippingPlanes=w.clippingPlanes,R.clipIntersection=w.clipIntersection,R.displacementMap=w.displacementMap,R.displacementScale=w.displacementScale,R.displacementBias=w.displacementBias,R.wireframeLinewidth=w.wireframeLinewidth,R.linewidth=w.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let F=e.properties.get(R);F.light=x}return R}function y(E,w,x,A,R){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&R===No)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,E.matrixWorld);let V=t.update(E),L=E.material;if(Array.isArray(L)){let G=V.groups;for(let Z=0,Y=G.length;Z<Y;Z++){let st=G[Z],X=L[st.materialIndex];if(X&&X.visible){let nt=S(E,X,A,R);E.onBeforeShadow(e,E,w,x,V,nt,st),e.renderBufferDirect(x,null,V,nt,E,st),E.onAfterShadow(e,E,w,x,V,nt,st)}}}else if(L.visible){let G=S(E,L,A,R);E.onBeforeShadow(e,E,w,x,V,G,null),e.renderBufferDirect(x,null,V,G,E,null),E.onAfterShadow(e,E,w,x,V,G,null)}}let F=E.children;for(let V=0,L=F.length;V<L;V++)y(F[V],w,x,A,R)}function T(E){E.target.removeEventListener("dispose",T);for(let x in c){let A=c[x],R=E.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function y3(e,t){function n(){let U=!1,ct=new Le,Q=null,ht=new Le(0,0,0,0);return{setMask:function($){Q!==$&&!U&&(e.colorMask($,$,$,$),Q=$)},setLocked:function($){U=$},setClear:function($,et,bt,St,ce){ce===!0&&($*=St,et*=St,bt*=St),ct.set($,et,bt,St),ht.equals(ct)===!1&&(e.clearColor($,et,bt,St),ht.copy(ct))},reset:function(){U=!1,Q=null,ht.set(-1,0,0,0)}}}function i(){let U=!1,ct=!1,Q=null,ht=null,$=null;return{setReversed:function(et){if(ct!==et){let bt=t.get("EXT_clip_control");et?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),ct=et;let St=$;$=null,this.setClear(St)}},getReversed:function(){return ct},setTest:function(et){et?tt(e.DEPTH_TEST):yt(e.DEPTH_TEST)},setMask:function(et){Q!==et&&!U&&(e.depthMask(et),Q=et)},setFunc:function(et){if(ct&&(et=QM[et]),ht!==et){switch(et){case qh:e.depthFunc(e.NEVER);break;case Yh:e.depthFunc(e.ALWAYS);break;case Zh:e.depthFunc(e.LESS);break;case Ao:e.depthFunc(e.LEQUAL);break;case Jh:e.depthFunc(e.EQUAL);break;case Kh:e.depthFunc(e.GEQUAL);break;case Qh:e.depthFunc(e.GREATER);break;case jh:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ht=et}},setLocked:function(et){U=et},setClear:function(et){$!==et&&($=et,ct&&(et=1-et),e.clearDepth(et))},reset:function(){U=!1,Q=null,ht=null,$=null,ct=!1}}}function s(){let U=!1,ct=null,Q=null,ht=null,$=null,et=null,bt=null,St=null,ce=null;return{setTest:function(ne){U||(ne?tt(e.STENCIL_TEST):yt(e.STENCIL_TEST))},setMask:function(ne){ct!==ne&&!U&&(e.stencilMask(ne),ct=ne)},setFunc:function(ne,kn,Wn){(Q!==ne||ht!==kn||$!==Wn)&&(e.stencilFunc(ne,kn,Wn),Q=ne,ht=kn,$=Wn)},setOp:function(ne,kn,Wn){(et!==ne||bt!==kn||St!==Wn)&&(e.stencilOp(ne,kn,Wn),et=ne,bt=kn,St=Wn)},setLocked:function(ne){U=ne},setClear:function(ne){ce!==ne&&(e.clearStencil(ne),ce=ne)},reset:function(){U=!1,ct=null,Q=null,ht=null,$=null,et=null,bt=null,St=null,ce=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,f={},p={},u={},d=new WeakMap,g=[],b=null,m=!1,h=null,v=null,S=null,y=null,T=null,E=null,w=null,x=new $t(0,0,0),A=0,R=!1,I=null,F=null,V=null,L=null,G=null,Z=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,st=0,X=e.getParameter(e.VERSION);X.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec(X)[1]),Y=st>=1):X.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),Y=st>=2);let nt=null,j={},Rt=e.getParameter(e.SCISSOR_BOX),ft=e.getParameter(e.VIEWPORT),se=new Le().fromArray(Rt),Pt=new Le().fromArray(ft);function Ht(U,ct,Q,ht){let $=new Uint8Array(4),et=e.createTexture();e.bindTexture(U,et),e.texParameteri(U,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(U,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let bt=0;bt<Q;bt++)U===e.TEXTURE_3D||U===e.TEXTURE_2D_ARRAY?e.texImage3D(ct,0,e.RGBA,1,1,ht,0,e.RGBA,e.UNSIGNED_BYTE,$):e.texImage2D(ct+bt,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,$);return et}let W={};W[e.TEXTURE_2D]=Ht(e.TEXTURE_2D,e.TEXTURE_2D,1),W[e.TEXTURE_CUBE_MAP]=Ht(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),W[e.TEXTURE_2D_ARRAY]=Ht(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),W[e.TEXTURE_3D]=Ht(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),tt(e.DEPTH_TEST),r.setFunc(Ao),Wt(!1),me(a0),tt(e.CULL_FACE),te(Si);function tt(U){f[U]!==!0&&(e.enable(U),f[U]=!0)}function yt(U){f[U]!==!1&&(e.disable(U),f[U]=!1)}function Bt(U,ct){return u[U]!==ct?(e.bindFramebuffer(U,ct),u[U]=ct,U===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=ct),U===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=ct),!0):!1}function _t(U,ct){let Q=g,ht=!1;if(U){Q=d.get(ct),Q===void 0&&(Q=[],d.set(ct,Q));let $=U.textures;if(Q.length!==$.length||Q[0]!==e.COLOR_ATTACHMENT0){for(let et=0,bt=$.length;et<bt;et++)Q[et]=e.COLOR_ATTACHMENT0+et;Q.length=$.length,ht=!0}}else Q[0]!==e.BACK&&(Q[0]=e.BACK,ht=!0);ht&&e.drawBuffers(Q)}function Nt(U){return b!==U?(e.useProgram(U),b=U,!0):!1}let Ne={[rr]:e.FUNC_ADD,[xM]:e.FUNC_SUBTRACT,[SM]:e.FUNC_REVERSE_SUBTRACT};Ne[MM]=e.MIN,Ne[bM]=e.MAX;let Gt={[Of]:e.ZERO,[Ni]:e.ONE,[TM]:e.SRC_COLOR,[l0]:e.SRC_ALPHA,[DM]:e.SRC_ALPHA_SATURATE,[CM]:e.DST_COLOR,[AM]:e.DST_ALPHA,[EM]:e.ONE_MINUS_SRC_COLOR,[Io]:e.ONE_MINUS_SRC_ALPHA,[RM]:e.ONE_MINUS_DST_COLOR,[wM]:e.ONE_MINUS_DST_ALPHA,[UM]:e.CONSTANT_COLOR,[LM]:e.ONE_MINUS_CONSTANT_COLOR,[NM]:e.CONSTANT_ALPHA,[IM]:e.ONE_MINUS_CONSTANT_ALPHA};function te(U,ct,Q,ht,$,et,bt,St,ce,ne){if(U===Si){m===!0&&(yt(e.BLEND),m=!1);return}if(m===!1&&(tt(e.BLEND),m=!0),U!==wc){if(U!==h||ne!==R){if((v!==rr||T!==rr)&&(e.blendEquation(e.FUNC_ADD),v=rr,T=rr),ne)switch(U){case Ta:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Ac:e.blendFunc(e.ONE,e.ONE);break;case r0:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case o0:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ot("WebGLState: Invalid blending: ",U);break}else switch(U){case Ta:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Ac:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case r0:Ot("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case o0:Ot("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ot("WebGLState: Invalid blending: ",U);break}S=null,y=null,E=null,w=null,x.set(0,0,0),A=0,h=U,R=ne}return}$=$||ct,et=et||Q,bt=bt||ht,(ct!==v||$!==T)&&(e.blendEquationSeparate(Ne[ct],Ne[$]),v=ct,T=$),(Q!==S||ht!==y||et!==E||bt!==w)&&(e.blendFuncSeparate(Gt[Q],Gt[ht],Gt[et],Gt[bt]),S=Q,y=ht,E=et,w=bt),(St.equals(x)===!1||ce!==A)&&(e.blendColor(St.r,St.g,St.b,ce),x.copy(St),A=ce),h=U,R=!1}function fe(U,ct){U.side===$i?yt(e.CULL_FACE):tt(e.CULL_FACE);let Q=U.side===Ln;ct&&(Q=!Q),Wt(Q),U.blending===Ta&&U.transparent===!1?te(Si):te(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),r.setFunc(U.depthFunc),r.setTest(U.depthTest),r.setMask(U.depthWrite),a.setMask(U.colorWrite);let ht=U.stencilWrite;o.setTest(ht),ht&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),ze(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?tt(e.SAMPLE_ALPHA_TO_COVERAGE):yt(e.SAMPLE_ALPHA_TO_COVERAGE)}function Wt(U){I!==U&&(U?e.frontFace(e.CW):e.frontFace(e.CCW),I=U)}function me(U){U!==vM?(tt(e.CULL_FACE),U!==F&&(U===a0?e.cullFace(e.BACK):U===_M?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):yt(e.CULL_FACE),F=U}function Ge(U){U!==V&&(Y&&e.lineWidth(U),V=U)}function ze(U,ct,Q){U?(tt(e.POLYGON_OFFSET_FILL),(L!==ct||G!==Q)&&(L=ct,G=Q,r.getReversed()&&(ct=-ct),e.polygonOffset(ct,Q))):yt(e.POLYGON_OFFSET_FILL)}function Me(U){U?tt(e.SCISSOR_TEST):yt(e.SCISSOR_TEST)}function Pe(U){U===void 0&&(U=e.TEXTURE0+Z-1),nt!==U&&(e.activeTexture(U),nt=U)}function O(U,ct,Q){Q===void 0&&(nt===null?Q=e.TEXTURE0+Z-1:Q=nt);let ht=j[Q];ht===void 0&&(ht={type:void 0,texture:void 0},j[Q]=ht),(ht.type!==U||ht.texture!==ct)&&(nt!==Q&&(e.activeTexture(Q),nt=Q),e.bindTexture(U,ct||W[U]),ht.type=U,ht.texture=ct)}function Be(){let U=j[nt];U!==void 0&&U.type!==void 0&&(e.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function re(){try{e.compressedTexImage2D(...arguments)}catch(U){Ot("WebGLState:",U)}}function C(){try{e.compressedTexImage3D(...arguments)}catch(U){Ot("WebGLState:",U)}}function _(){try{e.texSubImage2D(...arguments)}catch(U){Ot("WebGLState:",U)}}function z(){try{e.texSubImage3D(...arguments)}catch(U){Ot("WebGLState:",U)}}function H(){try{e.compressedTexSubImage2D(...arguments)}catch(U){Ot("WebGLState:",U)}}function q(){try{e.compressedTexSubImage3D(...arguments)}catch(U){Ot("WebGLState:",U)}}function rt(){try{e.texStorage2D(...arguments)}catch(U){Ot("WebGLState:",U)}}function ot(){try{e.texStorage3D(...arguments)}catch(U){Ot("WebGLState:",U)}}function J(){try{e.texImage2D(...arguments)}catch(U){Ot("WebGLState:",U)}}function K(){try{e.texImage3D(...arguments)}catch(U){Ot("WebGLState:",U)}}function ut(U){return p[U]!==void 0?p[U]:e.getParameter(U)}function wt(U,ct){p[U]!==ct&&(e.pixelStorei(U,ct),p[U]=ct)}function dt(U){se.equals(U)===!1&&(e.scissor(U.x,U.y,U.z,U.w),se.copy(U))}function lt(U){Pt.equals(U)===!1&&(e.viewport(U.x,U.y,U.z,U.w),Pt.copy(U))}function At(U,ct){let Q=c.get(ct);Q===void 0&&(Q=new WeakMap,c.set(ct,Q));let ht=Q.get(U);ht===void 0&&(ht=e.getUniformBlockIndex(ct,U.name),Q.set(U,ht))}function Ut(U,ct){let ht=c.get(ct).get(U);l.get(ct)!==ht&&(e.uniformBlockBinding(ct,ht,U.__bindingPointIndex),l.set(ct,ht))}function zt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),f={},p={},nt=null,j={},u={},d=new WeakMap,g=[],b=null,m=!1,h=null,v=null,S=null,y=null,T=null,E=null,w=null,x=new $t(0,0,0),A=0,R=!1,I=null,F=null,V=null,L=null,G=null,se.set(0,0,e.canvas.width,e.canvas.height),Pt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:tt,disable:yt,bindFramebuffer:Bt,drawBuffers:_t,useProgram:Nt,setBlending:te,setMaterial:fe,setFlipSided:Wt,setCullFace:me,setLineWidth:Ge,setPolygonOffset:ze,setScissorTest:Me,activeTexture:Pe,bindTexture:O,unbindTexture:Be,compressedTexImage2D:re,compressedTexImage3D:C,texImage2D:J,texImage3D:K,pixelStorei:wt,getParameter:ut,updateUBOMapping:At,uniformBlockBinding:Ut,texStorage2D:rt,texStorage3D:ot,texSubImage2D:_,texSubImage3D:z,compressedTexSubImage2D:H,compressedTexSubImage3D:q,scissor:dt,viewport:lt,reset:zt}}function x3(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Dt,f=new WeakMap,p=new Set,u,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(C,_){return g?new OffscreenCanvas(C,_):oc("canvas")}function m(C,_,z){let H=1,q=re(C);if((q.width>z||q.height>z)&&(H=z/Math.max(q.width,q.height)),H<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let rt=Math.floor(H*q.width),ot=Math.floor(H*q.height);u===void 0&&(u=b(rt,ot));let J=_?b(rt,ot):u;return J.width=rt,J.height=ot,J.getContext("2d").drawImage(C,0,0,rt,ot),Lt("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+rt+"x"+ot+")."),J}else return"data"in C&&Lt("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),C;return C}function h(C){return C.generateMipmaps}function v(C){e.generateMipmap(C)}function S(C){return C.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?e.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(C,_,z,H,q,rt=!1){if(C!==null){if(e[C]!==void 0)return e[C];Lt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ot;H&&(ot=t.get("EXT_texture_norm16"),ot||Lt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=_;if(_===e.RED&&(z===e.FLOAT&&(J=e.R32F),z===e.HALF_FLOAT&&(J=e.R16F),z===e.UNSIGNED_BYTE&&(J=e.R8),z===e.UNSIGNED_SHORT&&ot&&(J=ot.R16_EXT),z===e.SHORT&&ot&&(J=ot.R16_SNORM_EXT)),_===e.RED_INTEGER&&(z===e.UNSIGNED_BYTE&&(J=e.R8UI),z===e.UNSIGNED_SHORT&&(J=e.R16UI),z===e.UNSIGNED_INT&&(J=e.R32UI),z===e.BYTE&&(J=e.R8I),z===e.SHORT&&(J=e.R16I),z===e.INT&&(J=e.R32I)),_===e.RG&&(z===e.FLOAT&&(J=e.RG32F),z===e.HALF_FLOAT&&(J=e.RG16F),z===e.UNSIGNED_BYTE&&(J=e.RG8),z===e.UNSIGNED_SHORT&&ot&&(J=ot.RG16_EXT),z===e.SHORT&&ot&&(J=ot.RG16_SNORM_EXT)),_===e.RG_INTEGER&&(z===e.UNSIGNED_BYTE&&(J=e.RG8UI),z===e.UNSIGNED_SHORT&&(J=e.RG16UI),z===e.UNSIGNED_INT&&(J=e.RG32UI),z===e.BYTE&&(J=e.RG8I),z===e.SHORT&&(J=e.RG16I),z===e.INT&&(J=e.RG32I)),_===e.RGB_INTEGER&&(z===e.UNSIGNED_BYTE&&(J=e.RGB8UI),z===e.UNSIGNED_SHORT&&(J=e.RGB16UI),z===e.UNSIGNED_INT&&(J=e.RGB32UI),z===e.BYTE&&(J=e.RGB8I),z===e.SHORT&&(J=e.RGB16I),z===e.INT&&(J=e.RGB32I)),_===e.RGBA_INTEGER&&(z===e.UNSIGNED_BYTE&&(J=e.RGBA8UI),z===e.UNSIGNED_SHORT&&(J=e.RGBA16UI),z===e.UNSIGNED_INT&&(J=e.RGBA32UI),z===e.BYTE&&(J=e.RGBA8I),z===e.SHORT&&(J=e.RGBA16I),z===e.INT&&(J=e.RGBA32I)),_===e.RGB&&(z===e.UNSIGNED_SHORT&&ot&&(J=ot.RGB16_EXT),z===e.SHORT&&ot&&(J=ot.RGB16_SNORM_EXT),z===e.UNSIGNED_INT_5_9_9_9_REV&&(J=e.RGB9_E5),z===e.UNSIGNED_INT_10F_11F_11F_REV&&(J=e.R11F_G11F_B10F)),_===e.RGBA){let K=rt?ac:jt.getTransfer(q);z===e.FLOAT&&(J=e.RGBA32F),z===e.HALF_FLOAT&&(J=e.RGBA16F),z===e.UNSIGNED_BYTE&&(J=K===he?e.SRGB8_ALPHA8:e.RGBA8),z===e.UNSIGNED_SHORT&&ot&&(J=ot.RGBA16_EXT),z===e.SHORT&&ot&&(J=ot.RGBA16_SNORM_EXT),z===e.UNSIGNED_SHORT_4_4_4_4&&(J=e.RGBA4),z===e.UNSIGNED_SHORT_5_5_5_1&&(J=e.RGB5_A1)}return(J===e.R16F||J===e.R32F||J===e.RG16F||J===e.RG32F||J===e.RGBA16F||J===e.RGBA32F)&&t.get("EXT_color_buffer_float"),J}function T(C,_){let z;return C?_===null||_===Oi||_===Po?z=e.DEPTH24_STENCIL8:_===Pi?z=e.DEPTH32F_STENCIL8:_===Oo&&(z=e.DEPTH24_STENCIL8,Lt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Oi||_===Po?z=e.DEPTH_COMPONENT24:_===Pi?z=e.DEPTH_COMPONENT32F:_===Oo&&(z=e.DEPTH_COMPONENT16),z}function E(C,_){return h(C)===!0||C.isFramebufferTexture&&C.minFilter!==cn&&C.minFilter!==vn?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function w(C){let _=C.target;_.removeEventListener("dispose",w),A(_),_.isVideoTexture&&f.delete(_),_.isHTMLTexture&&p.delete(_)}function x(C){let _=C.target;_.removeEventListener("dispose",x),I(_)}function A(C){let _=i.get(C);if(_.__webglInit===void 0)return;let z=C.source,H=d.get(z);if(H){let q=H[_.__cacheKey];q.usedTimes--,q.usedTimes===0&&R(C),Object.keys(H).length===0&&d.delete(z)}i.remove(C)}function R(C){let _=i.get(C);e.deleteTexture(_.__webglTexture);let z=C.source,H=d.get(z);delete H[_.__cacheKey],r.memory.textures--}function I(C){let _=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(_.__webglFramebuffer[H]))for(let q=0;q<_.__webglFramebuffer[H].length;q++)e.deleteFramebuffer(_.__webglFramebuffer[H][q]);else e.deleteFramebuffer(_.__webglFramebuffer[H]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[H])}else{if(Array.isArray(_.__webglFramebuffer))for(let H=0;H<_.__webglFramebuffer.length;H++)e.deleteFramebuffer(_.__webglFramebuffer[H]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let H=0;H<_.__webglColorRenderbuffer.length;H++)_.__webglColorRenderbuffer[H]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[H]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let z=C.textures;for(let H=0,q=z.length;H<q;H++){let rt=i.get(z[H]);rt.__webglTexture&&(e.deleteTexture(rt.__webglTexture),r.memory.textures--),i.remove(z[H])}i.remove(C)}let F=0;function V(){F=0}function L(){return F}function G(C){F=C}function Z(){let C=F;return C>=s.maxTextures&&Lt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),F+=1,C}function Y(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function st(C,_){let z=i.get(C);if(C.isVideoTexture&&O(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&z.__version!==C.version){let H=C.image;if(H===null)Lt("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)Lt("WebGLRenderer: Texture marked for update but image is incomplete");else{yt(z,C,_);return}}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,z.__webglTexture,e.TEXTURE0+_)}function X(C,_){let z=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){yt(z,C,_);return}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,z.__webglTexture,e.TEXTURE0+_)}function nt(C,_){let z=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){yt(z,C,_);return}n.bindTexture(e.TEXTURE_3D,z.__webglTexture,e.TEXTURE0+_)}function j(C,_){let z=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&z.__version!==C.version){Bt(z,C,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,z.__webglTexture,e.TEXTURE0+_)}let Rt={[$h]:e.REPEAT,[Ji]:e.CLAMP_TO_EDGE,[tf]:e.MIRRORED_REPEAT},ft={[cn]:e.NEAREST,[BM]:e.NEAREST_MIPMAP_NEAREST,[Rc]:e.NEAREST_MIPMAP_LINEAR,[vn]:e.LINEAR,[Ff]:e.LINEAR_MIPMAP_NEAREST,[Aa]:e.LINEAR_MIPMAP_LINEAR},se={[VM]:e.NEVER,[qM]:e.ALWAYS,[GM]:e.LESS,[Sd]:e.LEQUAL,[kM]:e.EQUAL,[Md]:e.GEQUAL,[WM]:e.GREATER,[XM]:e.NOTEQUAL};function Pt(C,_){if(_.type===Pi&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===vn||_.magFilter===Ff||_.magFilter===Rc||_.magFilter===Aa||_.minFilter===vn||_.minFilter===Ff||_.minFilter===Rc||_.minFilter===Aa)&&Lt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(C,e.TEXTURE_WRAP_S,Rt[_.wrapS]),e.texParameteri(C,e.TEXTURE_WRAP_T,Rt[_.wrapT]),(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)&&e.texParameteri(C,e.TEXTURE_WRAP_R,Rt[_.wrapR]),e.texParameteri(C,e.TEXTURE_MAG_FILTER,ft[_.magFilter]),e.texParameteri(C,e.TEXTURE_MIN_FILTER,ft[_.minFilter]),_.compareFunction&&(e.texParameteri(C,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(C,e.TEXTURE_COMPARE_FUNC,se[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===cn||_.minFilter!==Rc&&_.minFilter!==Aa||_.type===Pi&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");e.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function Ht(C,_){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",w));let H=_.source,q=d.get(H);q===void 0&&(q={},d.set(H,q));let rt=Y(_);if(rt!==C.__cacheKey){q[rt]===void 0&&(q[rt]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,z=!0),q[rt].usedTimes++;let ot=q[C.__cacheKey];ot!==void 0&&(q[C.__cacheKey].usedTimes--,ot.usedTimes===0&&R(_)),C.__cacheKey=rt,C.__webglTexture=q[rt].texture}return z}function W(C,_,z){return Math.floor(Math.floor(C/z)/_)}function tt(C,_,z,H){let rt=C.updateRanges;if(rt.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,_.width,_.height,z,H,_.data);else{rt.sort((wt,dt)=>wt.start-dt.start);let ot=0;for(let wt=1;wt<rt.length;wt++){let dt=rt[ot],lt=rt[wt],At=dt.start+dt.count,Ut=W(lt.start,_.width,4),zt=W(dt.start,_.width,4);lt.start<=At+1&&Ut===zt&&W(lt.start+lt.count-1,_.width,4)===Ut?dt.count=Math.max(dt.count,lt.start+lt.count-dt.start):(++ot,rt[ot]=lt)}rt.length=ot+1;let J=n.getParameter(e.UNPACK_ROW_LENGTH),K=n.getParameter(e.UNPACK_SKIP_PIXELS),ut=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,_.width);for(let wt=0,dt=rt.length;wt<dt;wt++){let lt=rt[wt],At=Math.floor(lt.start/4),Ut=Math.ceil(lt.count/4),zt=At%_.width,U=Math.floor(At/_.width),ct=Ut,Q=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,zt),n.pixelStorei(e.UNPACK_SKIP_ROWS,U),n.texSubImage2D(e.TEXTURE_2D,0,zt,U,ct,Q,z,H,_.data)}C.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,J),n.pixelStorei(e.UNPACK_SKIP_PIXELS,K),n.pixelStorei(e.UNPACK_SKIP_ROWS,ut)}}function yt(C,_,z){let H=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(H=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(H=e.TEXTURE_3D);let q=Ht(C,_),rt=_.source;n.bindTexture(H,C.__webglTexture,e.TEXTURE0+z);let ot=i.get(rt);if(rt.version!==ot.__version||q===!0){if(n.activeTexture(e.TEXTURE0+z),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Q=jt.getPrimaries(jt.workingColorSpace),ht=_.colorSpace===Rs?null:jt.getPrimaries(_.colorSpace),$=_.colorSpace===Rs||Q===ht?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,$)}n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment);let K=m(_.image,!1,s.maxTextureSize);K=Be(_,K);let ut=a.convert(_.format,_.colorSpace),wt=a.convert(_.type),dt=y(_.internalFormat,ut,wt,_.normalized,_.colorSpace,_.isVideoTexture);Pt(H,_);let lt,At=_.mipmaps,Ut=_.isVideoTexture!==!0,zt=ot.__version===void 0||q===!0,U=rt.dataReady,ct=E(_,K);if(_.isDepthTexture)dt=T(_.format===wa,_.type),zt&&(Ut?n.texStorage2D(e.TEXTURE_2D,1,dt,K.width,K.height):n.texImage2D(e.TEXTURE_2D,0,dt,K.width,K.height,0,ut,wt,null));else if(_.isDataTexture)if(At.length>0){Ut&&zt&&n.texStorage2D(e.TEXTURE_2D,ct,dt,At[0].width,At[0].height);for(let Q=0,ht=At.length;Q<ht;Q++)lt=At[Q],Ut?U&&n.texSubImage2D(e.TEXTURE_2D,Q,0,0,lt.width,lt.height,ut,wt,lt.data):n.texImage2D(e.TEXTURE_2D,Q,dt,lt.width,lt.height,0,ut,wt,lt.data);_.generateMipmaps=!1}else Ut?(zt&&n.texStorage2D(e.TEXTURE_2D,ct,dt,K.width,K.height),U&&tt(_,K,ut,wt)):n.texImage2D(e.TEXTURE_2D,0,dt,K.width,K.height,0,ut,wt,K.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ut&&zt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ct,dt,At[0].width,At[0].height,K.depth);for(let Q=0,ht=At.length;Q<ht;Q++)if(lt=At[Q],_.format!==Mi)if(ut!==null)if(Ut){if(U)if(_.layerUpdates.size>0){let $=L0(lt.width,lt.height,_.format,_.type);for(let et of _.layerUpdates){let bt=lt.data.subarray(et*$/lt.data.BYTES_PER_ELEMENT,(et+1)*$/lt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,et,lt.width,lt.height,1,ut,bt)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,lt.width,lt.height,K.depth,ut,lt.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Q,dt,lt.width,lt.height,K.depth,0,lt.data,0,0);else Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ut?U&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,lt.width,lt.height,K.depth,ut,wt,lt.data):n.texImage3D(e.TEXTURE_2D_ARRAY,Q,dt,lt.width,lt.height,K.depth,0,ut,wt,lt.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ut&&zt&&n.texStorage2D(e.TEXTURE_2D,ct,dt,At[0].width,At[0].height);for(let Q=0,ht=At.length;Q<ht;Q++)lt=At[Q],_.format!==Mi?ut!==null?Ut?U&&n.compressedTexSubImage2D(e.TEXTURE_2D,Q,0,0,lt.width,lt.height,ut,lt.data):n.compressedTexImage2D(e.TEXTURE_2D,Q,dt,lt.width,lt.height,0,lt.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ut?U&&n.texSubImage2D(e.TEXTURE_2D,Q,0,0,lt.width,lt.height,ut,wt,lt.data):n.texImage2D(e.TEXTURE_2D,Q,dt,lt.width,lt.height,0,ut,wt,lt.data)}else if(_.isDataArrayTexture)if(Ut){if(zt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ct,dt,K.width,K.height,K.depth),U)if(_.layerUpdates.size>0){let Q=L0(K.width,K.height,_.format,_.type);for(let ht of _.layerUpdates){let $=K.data.subarray(ht*Q/K.data.BYTES_PER_ELEMENT,(ht+1)*Q/K.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ht,K.width,K.height,1,ut,wt,$)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ut,wt,K.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,dt,K.width,K.height,K.depth,0,ut,wt,K.data);else if(_.isData3DTexture)Ut?(zt&&n.texStorage3D(e.TEXTURE_3D,ct,dt,K.width,K.height,K.depth),U&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ut,wt,K.data)):n.texImage3D(e.TEXTURE_3D,0,dt,K.width,K.height,K.depth,0,ut,wt,K.data);else if(_.isFramebufferTexture){if(zt)if(Ut)n.texStorage2D(e.TEXTURE_2D,ct,dt,K.width,K.height);else{let Q=K.width,ht=K.height;for(let $=0;$<ct;$++)n.texImage2D(e.TEXTURE_2D,$,dt,Q,ht,0,ut,wt,null),Q>>=1,ht>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in e){let Q=e.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),K.parentNode!==Q){Q.appendChild(K),p.add(_),Q.onpaint=ht=>{let $=ht.changedElements;for(let et of p)$.includes(et.image)&&(et.needsUpdate=!0)},Q.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,K);else{let $=e.RGBA,et=e.RGBA,bt=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,$,et,bt,K)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(At.length>0){if(Ut&&zt){let Q=re(At[0]);n.texStorage2D(e.TEXTURE_2D,ct,dt,Q.width,Q.height)}for(let Q=0,ht=At.length;Q<ht;Q++)lt=At[Q],Ut?U&&n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ut,wt,lt):n.texImage2D(e.TEXTURE_2D,Q,dt,ut,wt,lt);_.generateMipmaps=!1}else if(Ut){if(zt){let Q=re(K);n.texStorage2D(e.TEXTURE_2D,ct,dt,Q.width,Q.height)}U&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,ut,wt,K)}else n.texImage2D(e.TEXTURE_2D,0,dt,ut,wt,K);h(_)&&v(H),ot.__version=rt.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Bt(C,_,z){if(_.image.length!==6)return;let H=Ht(C,_),q=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+z);let rt=i.get(q);if(q.version!==rt.__version||H===!0){n.activeTexture(e.TEXTURE0+z);let ot=jt.getPrimaries(jt.workingColorSpace),J=_.colorSpace===Rs?null:jt.getPrimaries(_.colorSpace),K=_.colorSpace===Rs||ot===J?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let ut=_.isCompressedTexture||_.image[0].isCompressedTexture,wt=_.image[0]&&_.image[0].isDataTexture,dt=[];for(let et=0;et<6;et++)!ut&&!wt?dt[et]=m(_.image[et],!0,s.maxCubemapSize):dt[et]=wt?_.image[et].image:_.image[et],dt[et]=Be(_,dt[et]);let lt=dt[0],At=a.convert(_.format,_.colorSpace),Ut=a.convert(_.type),zt=y(_.internalFormat,At,Ut,_.normalized,_.colorSpace),U=_.isVideoTexture!==!0,ct=rt.__version===void 0||H===!0,Q=q.dataReady,ht=E(_,lt);Pt(e.TEXTURE_CUBE_MAP,_);let $;if(ut){U&&ct&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ht,zt,lt.width,lt.height);for(let et=0;et<6;et++){$=dt[et].mipmaps;for(let bt=0;bt<$.length;bt++){let St=$[bt];_.format!==Mi?At!==null?U?Q&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,0,0,St.width,St.height,At,St.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,zt,St.width,St.height,0,St.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?Q&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,0,0,St.width,St.height,At,Ut,St.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt,zt,St.width,St.height,0,At,Ut,St.data)}}}else{if($=_.mipmaps,U&&ct){$.length>0&&ht++;let et=re(dt[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ht,zt,et.width,et.height)}for(let et=0;et<6;et++)if(wt){U?Q&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,dt[et].width,dt[et].height,At,Ut,dt[et].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,zt,dt[et].width,dt[et].height,0,At,Ut,dt[et].data);for(let bt=0;bt<$.length;bt++){let ce=$[bt].image[et].image;U?Q&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,0,0,ce.width,ce.height,At,Ut,ce.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,zt,ce.width,ce.height,0,At,Ut,ce.data)}}else{U?Q&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,At,Ut,dt[et]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,zt,At,Ut,dt[et]);for(let bt=0;bt<$.length;bt++){let St=$[bt];U?Q&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,0,0,At,Ut,St.image[et]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+et,bt+1,zt,At,Ut,St.image[et])}}}h(_)&&v(e.TEXTURE_CUBE_MAP),rt.__version=q.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function _t(C,_,z,H,q,rt){let ot=a.convert(z.format,z.colorSpace),J=a.convert(z.type),K=y(z.internalFormat,ot,J,z.normalized,z.colorSpace),ut=i.get(_),wt=i.get(z);if(wt.__renderTarget=_,!ut.__hasExternalTextures){let dt=Math.max(1,_.width>>rt),lt=Math.max(1,_.height>>rt);q===e.TEXTURE_3D||q===e.TEXTURE_2D_ARRAY?n.texImage3D(q,rt,K,dt,lt,_.depth,0,ot,J,null):n.texImage2D(q,rt,K,dt,lt,0,ot,J,null)}n.bindFramebuffer(e.FRAMEBUFFER,C),Pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,H,q,wt.__webglTexture,0,Me(_)):(q===e.TEXTURE_2D||q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,H,q,wt.__webglTexture,rt),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Nt(C,_,z){if(e.bindRenderbuffer(e.RENDERBUFFER,C),_.depthBuffer){let H=_.depthTexture,q=H&&H.isDepthTexture?H.type:null,rt=T(_.stencilBuffer,q),ot=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Pe(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Me(_),rt,_.width,_.height):z?e.renderbufferStorageMultisample(e.RENDERBUFFER,Me(_),rt,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,rt,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ot,e.RENDERBUFFER,C)}else{let H=_.textures;for(let q=0;q<H.length;q++){let rt=H[q],ot=a.convert(rt.format,rt.colorSpace),J=a.convert(rt.type),K=y(rt.internalFormat,ot,J,rt.normalized,rt.colorSpace);Pe(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Me(_),K,_.width,_.height):z?e.renderbufferStorageMultisample(e.RENDERBUFFER,Me(_),K,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,K,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ne(C,_,z){let H=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let q=i.get(_.depthTexture);if(q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),H){if(q.__webglInit===void 0&&(q.__webglInit=!0,_.depthTexture.addEventListener("dispose",w)),q.__webglTexture===void 0){q.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Pt(e.TEXTURE_CUBE_MAP,_.depthTexture);let ut=a.convert(_.depthTexture.format),wt=a.convert(_.depthTexture.type),dt;_.depthTexture.format===Ki?dt=e.DEPTH_COMPONENT24:_.depthTexture.format===wa&&(dt=e.DEPTH24_STENCIL8);for(let lt=0;lt<6;lt++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,dt,_.width,_.height,0,ut,wt,null)}}else st(_.depthTexture,0);let rt=q.__webglTexture,ot=Me(_),J=H?e.TEXTURE_CUBE_MAP_POSITIVE_X+z:e.TEXTURE_2D,K=_.depthTexture.format===wa?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(_.depthTexture.format===Ki)Pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,K,J,rt,0,ot):e.framebufferTexture2D(e.FRAMEBUFFER,K,J,rt,0);else if(_.depthTexture.format===wa)Pe(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,K,J,rt,0,ot):e.framebufferTexture2D(e.FRAMEBUFFER,K,J,rt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Gt(C){let _=i.get(C),z=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let H=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),H){let q=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,H.removeEventListener("dispose",q)};H.addEventListener("dispose",q),_.__depthDisposeCallback=q}_.__boundDepthTexture=H}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(z)for(let H=0;H<6;H++)Ne(_.__webglFramebuffer[H],C,H);else{let H=C.texture.mipmaps;H&&H.length>0?Ne(_.__webglFramebuffer[0],C,0):Ne(_.__webglFramebuffer,C,0)}else if(z){_.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[H]),_.__webglDepthbuffer[H]===void 0)_.__webglDepthbuffer[H]=e.createRenderbuffer(),Nt(_.__webglDepthbuffer[H],C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=_.__webglDepthbuffer[H];e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,rt)}}else{let H=C.texture.mipmaps;if(H&&H.length>0?n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),Nt(_.__webglDepthbuffer,C,!1);else{let q=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,rt),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,rt)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function te(C,_,z){let H=i.get(C);_!==void 0&&_t(H.__webglFramebuffer,C,C.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),z!==void 0&&Gt(C)}function fe(C){let _=C.texture,z=i.get(C),H=i.get(_);C.addEventListener("dispose",x);let q=C.textures,rt=C.isWebGLCubeRenderTarget===!0,ot=q.length>1;if(ot||(H.__webglTexture===void 0&&(H.__webglTexture=e.createTexture()),H.__version=_.version,r.memory.textures++),rt){z.__webglFramebuffer=[];for(let J=0;J<6;J++)if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer[J]=[];for(let K=0;K<_.mipmaps.length;K++)z.__webglFramebuffer[J][K]=e.createFramebuffer()}else z.__webglFramebuffer[J]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer=[];for(let J=0;J<_.mipmaps.length;J++)z.__webglFramebuffer[J]=e.createFramebuffer()}else z.__webglFramebuffer=e.createFramebuffer();if(ot)for(let J=0,K=q.length;J<K;J++){let ut=i.get(q[J]);ut.__webglTexture===void 0&&(ut.__webglTexture=e.createTexture(),r.memory.textures++)}if(C.samples>0&&Pe(C)===!1){z.__webglMultisampledFramebuffer=e.createFramebuffer(),z.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let J=0;J<q.length;J++){let K=q[J];z.__webglColorRenderbuffer[J]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,z.__webglColorRenderbuffer[J]);let ut=a.convert(K.format,K.colorSpace),wt=a.convert(K.type),dt=y(K.internalFormat,ut,wt,K.normalized,K.colorSpace,C.isXRRenderTarget===!0),lt=Me(C);e.renderbufferStorageMultisample(e.RENDERBUFFER,lt,dt,C.width,C.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+J,e.RENDERBUFFER,z.__webglColorRenderbuffer[J])}e.bindRenderbuffer(e.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=e.createRenderbuffer(),Nt(z.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(rt){n.bindTexture(e.TEXTURE_CUBE_MAP,H.__webglTexture),Pt(e.TEXTURE_CUBE_MAP,_);for(let J=0;J<6;J++)if(_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)_t(z.__webglFramebuffer[J][K],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+J,K);else _t(z.__webglFramebuffer[J],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);h(_)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ot){for(let J=0,K=q.length;J<K;J++){let ut=q[J],wt=i.get(ut),dt=e.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(dt=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(dt,wt.__webglTexture),Pt(dt,ut),_t(z.__webglFramebuffer,C,ut,e.COLOR_ATTACHMENT0+J,dt,0),h(ut)&&v(dt)}n.unbindTexture()}else{let J=e.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(J=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(J,H.__webglTexture),Pt(J,_),_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)_t(z.__webglFramebuffer[K],C,_,e.COLOR_ATTACHMENT0,J,K);else _t(z.__webglFramebuffer,C,_,e.COLOR_ATTACHMENT0,J,0);h(_)&&v(J),n.unbindTexture()}C.depthBuffer&&Gt(C)}function Wt(C){let _=C.textures;for(let z=0,H=_.length;z<H;z++){let q=_[z];if(h(q)){let rt=S(C),ot=i.get(q).__webglTexture;n.bindTexture(rt,ot),v(rt),n.unbindTexture()}}}let me=[],Ge=[];function ze(C){if(C.samples>0){if(Pe(C)===!1){let _=C.textures,z=C.width,H=C.height,q=e.COLOR_BUFFER_BIT,rt=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ot=i.get(C),J=_.length>1;if(J)for(let ut=0;ut<_.length;ut++)n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ot.__webglMultisampledFramebuffer);let K=C.texture.mipmaps;K&&K.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglFramebuffer);for(let ut=0;ut<_.length;ut++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(q|=e.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(q|=e.STENCIL_BUFFER_BIT)),J){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ot.__webglColorRenderbuffer[ut]);let wt=i.get(_[ut]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,wt,0)}e.blitFramebuffer(0,0,z,H,0,0,z,H,q,e.NEAREST),l===!0&&(me.length=0,Ge.length=0,me.push(e.COLOR_ATTACHMENT0+ut),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(me.push(rt),Ge.push(rt),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ge)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,me))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),J)for(let ut=0;ut<_.length;ut++){n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.RENDERBUFFER,ot.__webglColorRenderbuffer[ut]);let wt=i.get(_[ut]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ut,e.TEXTURE_2D,wt,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let _=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function Me(C){return Math.min(s.maxSamples,C.samples)}function Pe(C){let _=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function O(C){let _=r.render.frame;f.get(C)!==_&&(f.set(C,_),C.update())}function Be(C,_){let z=C.colorSpace,H=C.format,q=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==pa&&z!==Rs&&(jt.getTransfer(z)===he?(H!==Mi||q!==Nn)&&Lt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ot("WebGLTextures: Unsupported texture color space:",z)),_}function re(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=Z,this.resetTextureUnits=V,this.getTextureUnits=L,this.setTextureUnits=G,this.setTexture2D=st,this.setTexture2DArray=X,this.setTexture3D=nt,this.setTextureCube=j,this.rebindTextures=te,this.setupRenderTarget=fe,this.updateRenderTargetMipmap=Wt,this.updateMultisampleRenderTarget=ze,this.setupDepthRenderbuffer=Gt,this.setupFrameBufferTexture=_t,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function S3(e,t){function n(i,s=Rs){let a,r=jt.getTransfer(s);if(i===Nn)return e.UNSIGNED_BYTE;if(i===Hf)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Vf)return e.UNSIGNED_SHORT_5_5_5_1;if(i===x0)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===S0)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===_0)return e.BYTE;if(i===y0)return e.SHORT;if(i===Oo)return e.UNSIGNED_SHORT;if(i===zf)return e.INT;if(i===Oi)return e.UNSIGNED_INT;if(i===Pi)return e.FLOAT;if(i===ri)return e.HALF_FLOAT;if(i===M0)return e.ALPHA;if(i===b0)return e.RGB;if(i===Mi)return e.RGBA;if(i===Ki)return e.DEPTH_COMPONENT;if(i===wa)return e.DEPTH_STENCIL;if(i===T0)return e.RED;if(i===Gf)return e.RED_INTEGER;if(i===Ca)return e.RG;if(i===kf)return e.RG_INTEGER;if(i===Wf)return e.RGBA_INTEGER;if(i===Dc||i===Uc||i===Lc||i===Nc)if(r===he)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Dc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Uc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Lc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Nc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Dc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Uc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Lc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Nc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xf||i===qf||i===Yf||i===Zf)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Xf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===qf)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Yf)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Zf)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Jf||i===Kf||i===Qf||i===jf||i===$f||i===Ic||i===td)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Jf||i===Kf)return r===he?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Qf)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===jf)return a.COMPRESSED_R11_EAC;if(i===$f)return a.COMPRESSED_SIGNED_R11_EAC;if(i===Ic)return a.COMPRESSED_RG11_EAC;if(i===td)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===ed||i===nd||i===id||i===sd||i===ad||i===rd||i===od||i===ld||i===cd||i===ud||i===hd||i===fd||i===dd||i===pd)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===ed)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===nd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===id)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===sd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ad)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===rd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===od)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ld)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===cd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ud)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===hd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===fd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===dd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===pd)return r===he?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===md||i===gd||i===vd)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===md)return r===he?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===gd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===vd)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===_d||i===yd||i===Oc||i===xd)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===_d)return a.COMPRESSED_RED_RGTC1_EXT;if(i===yd)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Oc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===xd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Po?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var M3=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,b3=`
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

}`,q0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new vc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new An({vertexShader:M3,fragmentShader:b3,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new _n(new ya(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Y0=class extends Qi{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,f=null,p=null,u=null,d=null,g=null,b=typeof XRWebGLBinding<"u",m=new q0,h={},v=n.getContextAttributes(),S=null,y=null,T=[],E=[],w=new Dt,x=null,A=null,R=new bn;R.viewport=new Le;let I=new bn;I.viewport=new Le;let F=[R,I],V=new If,L=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let tt=T[W];return tt===void 0&&(tt=new Ro,T[W]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(W){let tt=T[W];return tt===void 0&&(tt=new Ro,T[W]=tt),tt.getGripSpace()},this.getHand=function(W){let tt=T[W];return tt===void 0&&(tt=new Ro,T[W]=tt),tt.getHandSpace()};function Z(W){let tt=E.indexOf(W.inputSource);if(tt===-1)return;let yt=T[tt];yt!==void 0&&(yt.update(W.inputSource,W.frame,c||r),yt.dispatchEvent({type:W.type,data:W.inputSource}))}function Y(){s.removeEventListener("select",Z),s.removeEventListener("selectstart",Z),s.removeEventListener("selectend",Z),s.removeEventListener("squeeze",Z),s.removeEventListener("squeezestart",Z),s.removeEventListener("squeezeend",Z),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",st);for(let W=0;W<T.length;W++){let tt=E[W];tt!==null&&(E[W]=null,T[W].disconnect(tt))}L=null,G=null,m.reset();for(let W in h)delete h[W];if(t.setRenderTarget(S),d=null,u=null,p=null,s=null,y=null,Ht.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(w.width,w.height,!1),A!==null){let W=A.camera;W.fov=A.fov,W.zoom=A.zoom,W.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){a=W,i.isPresenting===!0&&Lt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,i.isPresenting===!0&&Lt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&b&&(p=new XRWebGLBinding(s,n)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(W){if(s=W,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",Z),s.addEventListener("selectstart",Z),s.addEventListener("selectend",Z),s.addEventListener("squeeze",Z),s.addEventListener("squeezestart",Z),s.addEventListener("squeezeend",Z),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",st),v.xrCompatible!==!0&&await n.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(w),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let yt=null,Bt=null,_t=null;v.depth&&(_t=v.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,yt=v.stencil?wa:Ki,Bt=v.stencil?Po:Oi);let Nt={colorFormat:n.RGBA8,depthFormat:_t,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(Nt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new Tn(u.textureWidth,u.textureHeight,{format:Mi,type:Nn,depthTexture:new _a(u.textureWidth,u.textureHeight,Bt,void 0,void 0,void 0,void 0,void 0,void 0,yt),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let yt={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,n,yt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Tn(d.framebufferWidth,d.framebufferHeight,{format:Mi,type:Nn,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),Ht.setContext(s),Ht.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function st(W){for(let tt=0;tt<W.removed.length;tt++){let yt=W.removed[tt],Bt=E.indexOf(yt);Bt>=0&&(E[Bt]=null,T[Bt].disconnect(yt))}for(let tt=0;tt<W.added.length;tt++){let yt=W.added[tt],Bt=E.indexOf(yt);if(Bt===-1){for(let Nt=0;Nt<T.length;Nt++)if(Nt>=E.length){E.push(yt),Bt=Nt;break}else if(E[Nt]===null){E[Nt]=yt,Bt=Nt;break}if(Bt===-1)break}let _t=T[Bt];_t&&_t.connect(yt)}}let X=new N,nt=new N;function j(W,tt,yt){X.setFromMatrixPosition(tt.matrixWorld),nt.setFromMatrixPosition(yt.matrixWorld);let Bt=X.distanceTo(nt),_t=tt.projectionMatrix.elements,Nt=yt.projectionMatrix.elements,Ne=_t[14]/(_t[10]-1),Gt=_t[14]/(_t[10]+1),te=(_t[9]+1)/_t[5],fe=(_t[9]-1)/_t[5],Wt=(_t[8]-1)/_t[0],me=(Nt[8]+1)/Nt[0],Ge=Ne*Wt,ze=Ne*me,Me=Bt/(-Wt+me),Pe=Me*-Wt;if(tt.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Pe),W.translateZ(Me),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),_t[10]===-1)W.projectionMatrix.copy(tt.projectionMatrix),W.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{let O=Ne+Me,Be=Gt+Me,re=Ge-Pe,C=ze+(Bt-Pe),_=te*Gt/Be*O,z=fe*Gt/Be*O;W.projectionMatrix.makePerspective(re,C,_,z,O,Be),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function Rt(W,tt){tt===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(tt.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(s===null)return;let tt=W.near,yt=W.far;m.texture!==null&&(m.depthNear>0&&(tt=m.depthNear),m.depthFar>0&&(yt=m.depthFar)),V.near=I.near=R.near=tt,V.far=I.far=R.far=yt,(L!==V.near||G!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),L=V.near,G=V.far),V.layers.mask=W.layers.mask|6,R.layers.mask=V.layers.mask&-5,I.layers.mask=V.layers.mask&-3;let Bt=W.parent,_t=V.cameras;Rt(V,Bt);for(let Nt=0;Nt<_t.length;Nt++)Rt(_t[Nt],Bt);_t.length===2?j(V,R,I):V.projectionMatrix.copy(R.projectionMatrix),A===null&&W.isPerspectiveCamera&&(A={camera:W,fov:W.fov,zoom:W.zoom}),ft(W,V,Bt)};function ft(W,tt,yt){yt===null?W.matrix.copy(tt.matrixWorld):(W.matrix.copy(yt.matrixWorld),W.matrix.invert(),W.matrix.multiply(tt.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(tt.projectionMatrix),W.projectionMatrixInverse.copy(tt.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=nf*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(W){l=W,u!==null&&(u.fixedFoveation=W),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=W)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(W){return h[W]};let se=null;function Pt(W,tt){if(f=tt.getViewerPose(c||r),g=tt,f!==null){let yt=f.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let Bt=!1;yt.length!==V.cameras.length&&(V.cameras.length=0,Bt=!0);for(let Gt=0;Gt<yt.length;Gt++){let te=yt[Gt],fe=null;if(d!==null)fe=d.getViewport(te);else{let me=p.getViewSubImage(u,te);fe=me.viewport,Gt===0&&(t.setRenderTargetTextures(y,me.colorTexture,me.depthStencilTexture),t.setRenderTarget(y))}let Wt=F[Gt];Wt===void 0&&(Wt=new bn,Wt.layers.enable(Gt),Wt.viewport=new Le,F[Gt]=Wt),Wt.matrix.fromArray(te.transform.matrix),Wt.matrix.decompose(Wt.position,Wt.quaternion,Wt.scale),Wt.projectionMatrix.fromArray(te.projectionMatrix),Wt.projectionMatrixInverse.copy(Wt.projectionMatrix).invert(),Wt.viewport.set(fe.x,fe.y,fe.width,fe.height),Gt===0&&(V.matrix.copy(Wt.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Bt===!0&&V.cameras.push(Wt)}let _t=s.enabledFeatures;if(_t&&_t.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){p=i.getBinding();let Gt=p.getDepthInformation(yt[0]);Gt&&Gt.isValid&&Gt.texture&&m.init(Gt,s.renderState)}if(_t&&_t.includes("camera-access")&&b){t.state.unbindTexture(),p=i.getBinding();for(let Gt=0;Gt<yt.length;Gt++){let te=yt[Gt].camera;if(te){let fe=h[te];fe||(fe=new vc,h[te]=fe);let Wt=p.getCameraImage(te);fe.sourceTexture=Wt}}}}for(let yt=0;yt<T.length;yt++){let Bt=E[yt],_t=T[yt];Bt!==null&&_t!==void 0&&_t.update(Bt,tt,c||r)}se&&se(W,tt),tt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:tt}),g=null}let Ht=new bb;Ht.setAnimationLoop(Pt),this.setAnimationLoop=function(W){se=W},this.dispose=function(){}}},T3=new Fe,Rb=new Ft;Rb.set(-1,0,0,0,1,0,0,0,1);function E3(e,t){function n(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function i(m,h){h.color.getRGB(m.fogColor.value,R0(e)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function s(m,h,v,S,y){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?a(m,h):h.isMeshLambertMaterial?(a(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(a(m,h),p(m,h)):h.isMeshPhongMaterial?(a(m,h),f(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(a(m,h),u(m,h),h.isMeshPhysicalMaterial&&d(m,h,y)):h.isMeshMatcapMaterial?(a(m,h),g(m,h)):h.isMeshDepthMaterial?a(m,h):h.isMeshDistanceMaterial?(a(m,h),b(m,h)):h.isMeshNormalMaterial?a(m,h):h.isLineBasicMaterial?(r(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,v,S):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function a(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,n(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===Ln&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,n(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===Ln&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,n(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,n(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,n(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);let v=t.get(h),S=v.envMap,y=v.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(T3.makeRotationFromEuler(y)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Rb),m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,n(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,n(h.aoMap,m.aoMapTransform))}function r(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,v,S){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*v,m.scale.value=S*.5,h.map&&(m.map.value=h.map,n(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function f(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function p(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function u(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,n(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,n(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function d(m,h,v){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,n(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,n(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,n(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,n(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,n(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Ln&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.retroreflectivity>0&&(m.retroreflectivity.value=h.retroreflectivity),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,n(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,n(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,n(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,n(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,n(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,n(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,n(h.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,h){h.matcap&&(m.matcap.value=h.matcap)}function b(m,h){let v=t.get(h).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function A3(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,T){let E=T.program;i.uniformBlockBinding(y,E)}function c(y,T){let E=s[y.id];E===void 0&&(m(y),E=f(y),s[y.id]=E,y.addEventListener("dispose",v));let w=T.program;i.updateUBOMapping(y,w);let x=t.render.frame;a[y.id]!==x&&(u(y),a[y.id]=x)}function f(y){let T=p();y.__bindingPointIndex=T;let E=e.createBuffer(),w=y.__size,x=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,E),e.bufferData(e.UNIFORM_BUFFER,w,x),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,T,E),E}function p(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return Ot("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let T=s[y.id],E=y.uniforms,w=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,T);for(let x=0,A=E.length;x<A;x++){let R=E[x];if(Array.isArray(R))for(let I=0,F=R.length;I<F;I++)d(R[I],x,I,w);else d(R,x,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(y,T,E,w){if(b(y,T,E,w)===!0){let x=y.__offset,A=y.value;if(Array.isArray(A)){let R=0;for(let I=0;I<A.length;I++){let F=A[I],V=h(F);g(F,y.__data,R),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(R+=V.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(A,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,x,y.__data)}}function g(y,T,E){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,E)}function b(y,T,E,w){let x=y.value,A=T+"_"+E;if(w[A]===void 0)return typeof x=="number"||typeof x=="boolean"?w[A]=x:ArrayBuffer.isView(x)?w[A]=x.slice():w[A]=x.clone(),!0;{let R=w[A];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return w[A]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(y){let T=y.uniforms,E=0,w=16;for(let A=0,R=T.length;A<R;A++){let I=Array.isArray(T[A])?T[A]:[T[A]];for(let F=0,V=I.length;F<V;F++){let L=I[F],G=Array.isArray(L.value)?L.value:[L.value];for(let Z=0,Y=G.length;Z<Y;Z++){let st=G[Z],X=h(st),nt=E%w,j=nt%X.boundary,Rt=nt+j;E+=j,Rt!==0&&w-Rt<X.storage&&(E+=w-Rt),L.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=E,E+=X.storage}}}let x=E%w;return x>0&&(E+=w-x),y.__size=E,y.__cache={},this}function h(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?Lt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):Lt("WebGLRenderer: Unsupported uniform value type.",y),T}function v(y){let T=y.target;T.removeEventListener("dispose",v);let E=r.indexOf(T.__bindingPointIndex);r.splice(E,1),e.deleteBuffer(s[T.id]),delete s[T.id],delete a[T.id]}function S(){for(let y in s)e.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:S}}var w3=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ts=null;function C3(){return ts===null&&(ts=new of(w3,16,16,Ca,ri),ts.name="DFG_LUT",ts.minFilter=vn,ts.magFilter=vn,ts.wrapS=Ji,ts.wrapT=Ji,ts.generateMipmaps=!1,ts.needsUpdate=!0),ts}var wd=class{constructor(t={}){let{canvas:n=ZM(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=Nn}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=r;let b=d,m=new Set([Wf,kf,Gf]),h=new Set([Nn,Oi,Oo,Po,Hf,Vf]),v=new Uint32Array(4),S=new Int32Array(4),y=new N,T=null,E=null,w=[],x=[],A=null;this.domElement=n,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,F=null,V=null,L=null,G=null;this._outputColorSpace=ii;let Z=0,Y=0,st=null,X=-1,nt=null,j=new Le,Rt=new Le,ft=null,se=new $t(0),Pt=0,Ht=n.width,W=n.height,tt=1,yt=null,Bt=null,_t=new Le(0,0,Ht,W),Nt=new Le(0,0,Ht,W),Ne=!1,Gt=new pc,te=!1,fe=!1,Wt=new Fe,me=new N,Ge=new Le,ze={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Me=!1;function Pe(){return st===null?tt:1}let O=i;function Be(M,D){return n.getContext(M,D)}let re,C,_,z,H,q,rt,ot,J,K,ut,wt,dt,lt,At,Ut,zt,U,ct,Q,ht,$,et;try{let M={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"186"}`),n.addEventListener("webglcontextlost",ce,!1),n.addEventListener("webglcontextrestored",ne,!1),n.addEventListener("webglcontextcreationerror",kn,!1),O===null){let D="webgl2";if(O=Be(D,M),O===null)throw Be(D)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}bt()}catch(M){throw n.removeEventListener("webglcontextlost",ce,!1),n.removeEventListener("webglcontextrestored",ne,!1),n.removeEventListener("webglcontextcreationerror",kn,!1),Ot("WebGLRenderer: "+M.message),M}function bt(){re=new OR(O),re.init(),ht=new S3(O,re),C=new ER(O,re,t,ht),_=new y3(O,re),C.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),V=O.createFramebuffer(),L=O.createFramebuffer(),G=O.createFramebuffer(),z=new FR(O),H=new a3,q=new x3(O,re,_,H,C,ht,z),rt=new IR(R),ot=new HA(O),$=new bR(O,ot),J=new PR(O,ot,z,$),K=new HR(O,J,ot,$,z),U=new zR(O,C,q),At=new AR(H),ut=new s3(R,rt,re,C,$,At),wt=new E3(R,H),dt=new o3,lt=new d3(re),zt=new MR(R,rt,_,K,g,l),Ut=new _3(R,K,C),et=new A3(O,z,C,_),ct=new TR(O,re,z),Q=new BR(O,re,z),z.programs=ut.programs,R.capabilities=C,R.extensions=re,R.properties=H,R.renderLists=dt,R.shadowMap=Ut,R.state=_,R.info=z}b!==Nn&&(A=new GR(b,n.width,n.height,o,s,a));let St=new Y0(R,O);this.xr=St,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let M=re.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=re.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(M){M!==void 0&&(tt=M,this.setSize(Ht,W,!1))},this.getSize=function(M){return M.set(Ht,W)},this.setSize=function(M,D,k=!0){if(St.isPresenting){Lt("WebGLRenderer: Can't change size while VR device is presenting.");return}Ht=M,W=D,n.width=Math.floor(M*tt),n.height=Math.floor(D*tt),k===!0&&(n.style.width=M+"px",n.style.height=D+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,M,D)},this.getDrawingBufferSize=function(M){return M.set(Ht*tt,W*tt).floor()},this.setDrawingBufferSize=function(M,D,k){Ht=M,W=D,tt=k,n.width=Math.floor(M*k),n.height=Math.floor(D*k),this.setViewport(0,0,M,D)},this.setEffects=function(M){if(b===Nn){Ot("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let D=0;D<M.length;D++)if(M[D].isOutputPass===!0){Lt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(j)},this.getViewport=function(M){return M.copy(_t)},this.setViewport=function(M,D,k,P){M.isVector4?_t.set(M.x,M.y,M.z,M.w):_t.set(M,D,k,P),_.viewport(j.copy(_t).multiplyScalar(tt).round())},this.getScissor=function(M){return M.copy(Nt)},this.setScissor=function(M,D,k,P){M.isVector4?Nt.set(M.x,M.y,M.z,M.w):Nt.set(M,D,k,P),_.scissor(Rt.copy(Nt).multiplyScalar(tt).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(M){_.setScissorTest(Ne=M)},this.setOpaqueSort=function(M){yt=M},this.setTransparentSort=function(M){Bt=M},this.getClearColor=function(M){return M.copy(zt.getClearColor())},this.setClearColor=function(){zt.setClearColor(...arguments)},this.getClearAlpha=function(){return zt.getClearAlpha()},this.setClearAlpha=function(){zt.setClearAlpha(...arguments)},this.clear=function(M=!0,D=!0,k=!0){let P=0;if(M){let B=!1;if(st!==null){let gt=st.texture.format;B=m.has(gt)}if(B){let gt=st.texture.type,Mt=h.has(gt),mt=zt.getClearColor(),Tt=zt.getClearAlpha(),Ct=mt.r,Xt=mt.g,Yt=mt.b;Mt?(v[0]=Ct,v[1]=Xt,v[2]=Yt,v[3]=Tt,O.clearBufferuiv(O.COLOR,0,v)):(S[0]=Ct,S[1]=Xt,S[2]=Yt,S[3]=Tt,O.clearBufferiv(O.COLOR,0,S))}else P|=O.COLOR_BUFFER_BIT}D&&(P|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),k&&(P|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P!==0&&O.clear(P)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),F=M},this.dispose=function(){n.removeEventListener("webglcontextlost",ce,!1),n.removeEventListener("webglcontextrestored",ne,!1),n.removeEventListener("webglcontextcreationerror",kn,!1),zt.dispose(),dt.dispose(),lt.dispose(),H.dispose(),rt.dispose(),K.dispose(),$.dispose(),et.dispose(),ut.dispose(),St.dispose(),St.removeEventListener("sessionstart",qo),St.removeEventListener("sessionend",Yo),Bi.stop()};function ce(M){M.preventDefault(),w0("WebGLRenderer: Context Lost."),I=!0}function ne(){w0("WebGLRenderer: Context Restored."),I=!1;let M=z.autoReset,D=Ut.enabled,k=Ut.autoUpdate,P=Ut.needsUpdate,B=Ut.type;bt(),z.autoReset=M,Ut.enabled=D,Ut.autoUpdate=k,Ut.needsUpdate=P,Ut.type=B}function kn(M){Ot("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Wn(M){let D=M.target;D.removeEventListener("dispose",Wn),Xc(D)}function Xc(M){qc(M),H.remove(M)}function qc(M){let D=H.get(M).programs;D!==void 0&&(D.forEach(function(k){ut.releaseProgram(k)}),M.isShaderMaterial&&ut.releaseShaderCache(M))}this.renderBufferDirect=function(M,D,k,P,B,gt){D===null&&(D=ze);let Mt=B.isMesh&&B.matrixWorld.determinantAffine()<0,mt=Da(M,D,k,P,B);_.setMaterial(P,Mt);let Tt=k.index,Ct=1;if(P.wireframe===!0){if(Tt=J.getWireframeAttribute(k),Tt===void 0)return;Ct=2}let Xt=k.drawRange,Yt=k.attributes.position,Et=Xt.start*Ct,ue=(Xt.start+Xt.count)*Ct;gt!==null&&(Et=Math.max(Et,gt.start*Ct),ue=Math.min(ue,(gt.start+gt.count)*Ct)),Tt!==null?(Et=Math.max(Et,0),ue=Math.min(ue,Tt.count)):Yt!=null&&(Et=Math.max(Et,0),ue=Math.min(ue,Yt.count));let qe=ue-Et;if(qe<0||qe===1/0)return;$.setup(B,P,mt,k,Tt);let Ae,xe=ct;if(Tt!==null&&(Ae=ot.get(Tt),xe=Q,xe.setIndex(Ae)),B.isMesh)P.wireframe===!0?(_.setLineWidth(P.wireframeLinewidth*Pe()),xe.setMode(O.LINES)):xe.setMode(O.TRIANGLES);else if(B.isLine){let yn=P.linewidth;yn===void 0&&(yn=1),_.setLineWidth(yn*Pe()),B.isLineSegments?xe.setMode(O.LINES):B.isLineLoop?xe.setMode(O.LINE_LOOP):xe.setMode(O.LINE_STRIP)}else B.isPoints?xe.setMode(O.POINTS):B.isSprite&&xe.setMode(O.TRIANGLES);if(B.isBatchedMesh)if(re.get("WEBGL_multi_draw"))xe.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let yn=B._multiDrawStarts,xt=B._multiDrawCounts,Cn=B._multiDrawCount,ae=Tt?ot.get(Tt).bytesPerElement:1,oi=H.get(P).currentProgram.getUniforms();for(let Fi=0;Fi<Cn;Fi++)oi.setValue(O,"_gl_DrawID",Fi),xe.render(yn[Fi]/ae,xt[Fi])}else if(B.isInstancedMesh)xe.renderInstances(Et,qe,B.count);else if(k.isInstancedBufferGeometry){let yn=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,xt=Math.min(k.instanceCount,yn);xe.renderInstances(Et,qe,xt)}else xe.render(Et,qe)};function Xo(M,D,k,P){F!==null&&M.isNodeMaterial&&F.setObject(P,M),te===!0&&At.setState(M,k,!1),M.transparent===!0&&M.side===$i&&M.forceSinglePass===!1?(M.side=Ln,M.needsUpdate=!0,be(M,D,P),M.side=ba,M.needsUpdate=!0,be(M,D,P),M.side=$i):be(M,D,P)}this.compile=function(M,D,k=null){k===null&&(k=M),F!==null&&F.renderStart(M,D,k),E=lt.get(k),E.init(D),x.push(E),k.traverseVisible(function(B){B.isLight&&B.layers.test(D.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),M!==k&&M.traverseVisible(function(B){B.isLight&&B.layers.test(D.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),E.setupLights(),F!==null&&F.updateLights(E.state.lightsArray),fe=this.localClippingEnabled,te=At.init(this.clippingPlanes,fe),te===!0&&At.setGlobalState(this.clippingPlanes,D),F!==null&&Ut.render(E.state.shadowsArray,k,D);let P=new Set;return M.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let gt=B.material;if(gt)if(Array.isArray(gt))for(let Mt=0;Mt<gt.length;Mt++){let mt=gt[Mt];Xo(mt,k,D,B),P.add(mt)}else Xo(gt,k,D,B),P.add(gt)}),E=x.pop(),F!==null&&F.renderEnd(),P},this.compileAsync=function(M,D,k=null){let P=this.compile(M,D,k);return new Promise(B=>{function gt(){if(P.forEach(function(Mt){let Tt=H.get(Mt).currentProgram;(Tt===void 0||Tt.isReady())&&P.delete(Mt)}),P.size===0){B(M);return}setTimeout(gt,10)}re.get("KHR_parallel_shader_compile")!==null?gt():setTimeout(gt,10)})};let dr=null;function Ds(M){dr&&dr(M)}function qo(){Bi.stop()}function Yo(){Bi.start()}let Bi=new bb;Bi.setAnimationLoop(Ds),typeof self<"u"&&Bi.setContext(self),this.setAnimationLoop=function(M){dr=M,St.setAnimationLoop(M),M===null?Bi.stop():Bi.start()},St.addEventListener("sessionstart",qo),St.addEventListener("sessionend",Yo),this.render=function(M,D){if(D!==void 0&&D.isCamera!==!0){Ot("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;F!==null&&F.renderStart(M,D);let k=St.enabled===!0&&St.isPresenting===!0,P=A!==null&&(st===null||k)&&A.begin(R,st);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),St.enabled===!0&&St.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(St.cameraAutoUpdate===!0&&St.updateCamera(D),D=St.getCamera()),M.isScene===!0&&M.onBeforeRender(R,M,D,st),E=lt.get(M,x.length),E.init(D),E.state.textureUnits=q.getTextureUnits(),x.push(E),Wt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Gt.setFromProjectionMatrix(Wt,Ui,D.reversedDepth),fe=this.localClippingEnabled,te=At.init(this.clippingPlanes,fe),T=dt.get(M,w.length),T.init(),w.push(T),St.enabled===!0&&St.isPresenting===!0){let Mt=R.xr.getDepthSensingMesh();Mt!==null&&pr(Mt,D,-1/0,R.sortObjects)}pr(M,D,0,R.sortObjects),T.finish(),F!==null&&F.updateLights(E.state.lightsArray),R.sortObjects===!0&&T.sort(yt,Bt),Me=St.enabled===!1||St.isPresenting===!1||St.hasDepthSensing()===!1,Me&&zt.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),te===!0&&At.beginShadows();let B=E.state.shadowsArray;if(Ut.render(B,M,D),te===!0&&At.endShadows(),(P&&A.hasRenderPass())===!1){let Mt=T.opaque,mt=T.transmissive;if(E.setupLights(),D.isArrayCamera){let Tt=D.cameras;if(mt.length>0)for(let Ct=0,Xt=Tt.length;Ct<Xt;Ct++){let Yt=Tt[Ct];vt(Mt,mt,M,Yt)}Me&&zt.render(M);for(let Ct=0,Xt=Tt.length;Ct<Xt;Ct++){let Yt=Tt[Ct];Zo(T,M,Yt,Yt.viewport)}}else mt.length>0&&vt(Mt,mt,M,D),Me&&zt.render(M),Zo(T,M,D)}st!==null&&Y===0&&(q.updateMultisampleRenderTarget(st),q.updateRenderTargetMipmap(st)),P&&A.end(R),M.isScene===!0&&M.onAfterRender(R,M,D),$.resetDefaultState(),X=-1,nt=null,x.pop(),x.length>0?(E=x[x.length-1],q.setTextureUnits(E.state.textureUnits),te===!0&&At.setGlobalState(R.clippingPlanes,E.state.camera)):E=null,w.pop(),w.length>0?T=w[w.length-1]:T=null,F!==null&&F.renderEnd()};function pr(M,D,k,P){if(M.visible===!1)return;if(M.layers.test(D.layers)){if(M.isGroup)k=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(D);else if(M.isLightProbeGrid)E.pushLightProbeGrid(M);else if(M.isLight)E.pushLight(M),M.castShadow&&E.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(Gt)){P&&Ge.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Wt);let Mt=K.update(M),mt=M.material;mt.visible&&T.push(M,Mt,mt,k,Ge.z,null,D)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(Gt))){let Mt=K.update(M),mt=M.material;if(P&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ge.copy(M.boundingSphere.center)):(Mt.boundingSphere===null&&Mt.computeBoundingSphere(),Ge.copy(Mt.boundingSphere.center)),Ge.applyMatrix4(M.matrixWorld).applyMatrix4(Wt)),Array.isArray(mt)){let Tt=Mt.groups;for(let Ct=0,Xt=Tt.length;Ct<Xt;Ct++){let Yt=Tt[Ct],Et=mt[Yt.materialIndex];Et&&Et.visible&&T.push(M,Mt,Et,k,Ge.z,Yt,D)}}else mt.visible&&T.push(M,Mt,mt,k,Ge.z,null,D)}}let gt=M.children;for(let Mt=0,mt=gt.length;Mt<mt;Mt++)pr(gt[Mt],D,k,P)}function Zo(M,D,k,P){let{opaque:B,transmissive:gt,transparent:Mt}=M;E.setupLightsView(k),te===!0&&At.setGlobalState(R.clippingPlanes,k),P&&_.viewport(j.copy(P)),B.length>0&&at(B,D,k),gt.length>0&&at(gt,D,k),Mt.length>0&&at(Mt,D,k),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function vt(M,D,k,P){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[P.id]===void 0){let Et=re.has("EXT_color_buffer_half_float")||re.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[P.id]=new Tn(1,1,{generateMipmaps:!0,type:Et?ri:Nn,minFilter:Aa,samples:Math.max(4,C.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:jt.workingColorSpace})}let gt=E.state.transmissionRenderTarget[P.id],Mt=P.viewport||j;gt.setSize(Mt.z*R.transmissionResolutionScale,Mt.w*R.transmissionResolutionScale);let mt=R.getRenderTarget(),Tt=R.getActiveCubeFace(),Ct=R.getActiveMipmapLevel();R.setRenderTarget(gt),R.getClearColor(se),Pt=R.getClearAlpha(),Pt<1&&R.setClearColor(16777215,.5),R.clear(),Me&&zt.render(k);let Xt=R.toneMapping;R.toneMapping=Ii;let Yt=P.viewport;if(P.viewport!==void 0&&(P.viewport=void 0),E.setupLightsView(P),te===!0&&At.setGlobalState(R.clippingPlanes,P),at(M,k,P),q.updateMultisampleRenderTarget(gt),q.updateRenderTargetMipmap(gt),re.has("WEBGL_multisampled_render_to_texture")===!1){let Et=!1;for(let ue=0,qe=D.length;ue<qe;ue++){let Ae=D[ue],{object:xe,geometry:yn,material:xt,group:Cn}=Ae;if(xt.side===$i&&xe.layers.test(P.layers)){let ae=xt.side;xt.side=Ln,xt.needsUpdate=!0,ie(xe,k,P,yn,xt,Cn),xt.side=ae,xt.needsUpdate=!0,Et=!0}}Et===!0&&(q.updateMultisampleRenderTarget(gt),q.updateRenderTargetMipmap(gt))}R.setRenderTarget(mt,Tt,Ct),R.setClearColor(se,Pt),Yt!==void 0&&(P.viewport=Yt),R.toneMapping=Xt}function at(M,D,k){let P=D.isScene===!0?D.overrideMaterial:null;for(let B=0,gt=M.length;B<gt;B++){let Mt=M[B],{object:mt,geometry:Tt,group:Ct}=Mt,Xt=Mt.material;Xt.allowOverride===!0&&P!==null&&(Xt=P),mt.layers.test(k.layers)&&ie(mt,D,k,Tt,Xt,Ct)}}function ie(M,D,k,P,B,gt){F!==null&&B.isNodeMaterial&&F.setObject(M,B),M.onBeforeRender(R,D,k,P,B,gt),M.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),B.onBeforeRender(R,D,k,P,M,gt),B.transparent===!0&&B.side===$i&&B.forceSinglePass===!1?(B.side=Ln,B.needsUpdate=!0,R.renderBufferDirect(k,D,P,B,M,gt),B.side=ba,B.needsUpdate=!0,R.renderBufferDirect(k,D,P,B,M,gt),B.side=$i):R.renderBufferDirect(k,D,P,B,M,gt),M.onAfterRender(R,D,k,P,B,gt)}function be(M,D,k){D.isScene!==!0&&(D=ze);let P=H.get(M),B=E.state.lights,gt=E.state.shadowsArray,Mt=B.state.version,mt=ut.getParameters(M,B.state,gt,D,k,E.state.lightProbeGridArray),Tt=ut.getProgramCacheKey(mt),Ct=P.programs;P.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?D.environment:null,P.fog=D.fog;let Xt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;P.envMap=rt.get(M.envMap||P.environment,Xt),P.envMapRotation=P.environment!==null&&M.envMap===null?D.environmentRotation:M.envMapRotation,Ct===void 0&&(M.addEventListener("dispose",Wn),Ct=new Map,P.programs=Ct);let Yt=Ct.get(Tt);if(Yt!==void 0){if(P.currentProgram===Yt&&P.lightsStateVersion===Mt)return $e(M,mt),Yt}else mt.uniforms=ut.getUniforms(M),F!==null&&M.isNodeMaterial&&F.build(M,k,mt),M.onBeforeCompile(mt,R),Yt=ut.acquireProgram(mt,Tt),Ct.set(Tt,Yt),P.uniforms=mt.uniforms;let Et=P.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Et.clippingPlanes=At.uniform),$e(M,mt),P.needsLights=mr(M),P.lightsStateVersion=Mt,P.needsLights&&(Et.ambientLightColor.value=B.state.ambient,Et.lightProbe.value=B.state.probe,Et.sunLights.value=B.state.sun,Et.sunLightShadows.value=B.state.sunShadow,Et.directionalLights.value=B.state.directional,Et.directionalLightShadows.value=B.state.directionalShadow,Et.spotLights.value=B.state.spot,Et.spotLightShadows.value=B.state.spotShadow,Et.rectAreaLights.value=B.state.rectArea,Et.ltc_1.value=B.state.rectAreaLTC1,Et.ltc_2.value=B.state.rectAreaLTC2,Et.pointLights.value=B.state.point,Et.pointLightShadows.value=B.state.pointShadow,Et.hemisphereLights.value=B.state.hemi,Et.sunShadowMatrix.value=B.state.sunShadowMatrix,Et.sunShadowCascade.value=B.state.sunShadowCascade,Et.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Et.spotLightMatrix.value=B.state.spotLightMatrix,Et.spotLightMap.value=B.state.spotLightMap,Et.pointShadowMatrix.value=B.state.pointShadowMatrix),P.lightProbeGrid=E.state.lightProbeGridArray.length>0,P.currentProgram=Yt,P.uniformsList=null,Yt}function un(M){if(M.uniformsList===null){let D=M.currentProgram.getUniforms();M.uniformsList=zo.seqWithValue(D.seq,M.uniforms)}return M.uniformsList}function $e(M,D){let k=H.get(M);k.outputColorSpace=D.outputColorSpace,k.batching=D.batching,k.batchingColor=D.batchingColor,k.instancing=D.instancing,k.instancingColor=D.instancingColor,k.instancingMorph=D.instancingMorph,k.skinning=D.skinning,k.morphTargets=D.morphTargets,k.morphNormals=D.morphNormals,k.morphColors=D.morphColors,k.morphTargetsCount=D.morphTargetsCount,k.numClippingPlanes=D.numClippingPlanes,k.numIntersection=D.numClipIntersection,k.vertexAlphas=D.vertexAlphas,k.vertexTangents=D.vertexTangents,k.toneMapping=D.toneMapping}function ns(M,D){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(D.matrixWorld);for(let k=0,P=M.length;k<P;k++){let B=M[k];if(B.texture!==null&&B.boundingBox.containsPoint(y))return B}return null}function Da(M,D,k,P,B){D.isScene!==!0&&(D=ze),q.resetTextureUnits();let gt=D.fog,Mt=P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial?D.environment:null,mt=st===null?R.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:jt.workingColorSpace,Tt=P.isMeshStandardMaterial||P.isMeshLambertMaterial&&!P.envMap||P.isMeshPhongMaterial&&!P.envMap,Ct=rt.get(P.envMap||Mt,Tt),Xt=P.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Yt=!!k.attributes.tangent&&(!!P.normalMap||P.anisotropy>0),Et=!!k.morphAttributes.position,ue=!!k.morphAttributes.normal,qe=!!k.morphAttributes.color,Ae=Ii;P.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(Ae=R.toneMapping);let xe=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,yn=xe!==void 0?xe.length:0,xt=H.get(P),Cn=E.state.lights;if(te===!0&&(fe===!0||M!==nt)){let Te=M===nt&&P.id===X;At.setState(P,M,Te)}let ae=!1;P.version===xt.__version?(xt.needsLights&&xt.lightsStateVersion!==Cn.state.version||xt.outputColorSpace!==mt||B.isBatchedMesh&&xt.batching===!1||!B.isBatchedMesh&&xt.batching===!0||B.isBatchedMesh&&xt.batchingColor===!0&&B._colorsTexture===null||B.isBatchedMesh&&xt.batchingColor===!1&&B._colorsTexture!==null||B.isInstancedMesh&&xt.instancing===!1||!B.isInstancedMesh&&xt.instancing===!0||B.isSkinnedMesh&&xt.skinning===!1||!B.isSkinnedMesh&&xt.skinning===!0||B.isInstancedMesh&&xt.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&xt.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&xt.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&xt.instancingMorph===!1&&B.morphTexture!==null||xt.envMap!==Ct||P.fog===!0&&xt.fog!==gt||xt.numClippingPlanes!==void 0&&(xt.numClippingPlanes!==At.numPlanes||xt.numIntersection!==At.numIntersection)||xt.vertexAlphas!==Xt||xt.vertexTangents!==Yt||xt.morphTargets!==Et||xt.morphNormals!==ue||xt.morphColors!==qe||xt.toneMapping!==Ae||xt.morphTargetsCount!==yn||!!xt.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(ae=!0):(ae=!0,xt.__version=P.version);let oi=xt.currentProgram;ae===!0&&(oi=be(P,D,B),F&&P.isNodeMaterial&&F.onUpdateProgram(P,oi,xt));let Fi=!1,Us=!1,gr=!1,ge=oi.getUniforms(),ke=xt.uniforms;if(_.useProgram(oi.program)&&(Fi=!0,Us=!0,gr=!0),P.id!==X&&(X=P.id,Us=!0),xt.needsLights){let Te=ns(E.state.lightProbeGridArray,B);xt.lightProbeGrid!==Te&&(xt.lightProbeGrid=Te,Us=!0)}if(Fi||nt!==M){_.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),ge.setValue(O,"projectionMatrix",M.projectionMatrix),ge.setValue(O,"viewMatrix",M.matrixWorldInverse);let Ns=ge.map.cameraPosition;Ns!==void 0&&Ns.setValue(O,me.setFromMatrixPosition(M.matrixWorld)),C.logarithmicDepthBuffer&&ge.setValue(O,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(P.isMeshPhongMaterial||P.isMeshToonMaterial||P.isMeshLambertMaterial||P.isMeshBasicMaterial||P.isMeshStandardMaterial||P.isShaderMaterial)&&ge.setValue(O,"isOrthographic",M.isOrthographicCamera===!0),nt!==M&&(nt=M,Us=!0,gr=!0)}if(xt.needsLights&&(Cn.state.sunShadowMap.length>0&&ge.setValue(O,"sunShadowMap",Cn.state.sunShadowMap,q),Cn.state.directionalShadowMap.length>0&&ge.setValue(O,"directionalShadowMap",Cn.state.directionalShadowMap,q),Cn.state.spotShadowMap.length>0&&ge.setValue(O,"spotShadowMap",Cn.state.spotShadowMap,q),Cn.state.pointShadowMap.length>0&&ge.setValue(O,"pointShadowMap",Cn.state.pointShadowMap,q)),B.isSkinnedMesh){ge.setOptional(O,B,"bindMatrix"),ge.setOptional(O,B,"bindMatrixInverse");let Te=B.skeleton;Te&&(Te.boneTexture===null&&Te.computeBoneTexture(),ge.setValue(O,"boneTexture",Te.boneTexture,q))}B.isBatchedMesh&&(ge.setOptional(O,B,"batchingTexture"),ge.setValue(O,"batchingTexture",B._matricesTexture,q),ge.setOptional(O,B,"batchingIdTexture"),ge.setValue(O,"batchingIdTexture",B._indirectTexture,q),ge.setOptional(O,B,"batchingColorTexture"),B._colorsTexture!==null&&ge.setValue(O,"batchingColorTexture",B._colorsTexture,q));let Ls=k.morphAttributes;if((Ls.position!==void 0||Ls.normal!==void 0||Ls.color!==void 0)&&U.update(B,k,oi),(Us||xt.receiveShadow!==B.receiveShadow)&&(xt.receiveShadow=B.receiveShadow,ge.setValue(O,"receiveShadow",B.receiveShadow)),(P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial)&&P.envMap===null&&D.environment!==null&&(ke.envMapIntensity.value=D.environmentIntensity),ke.dfgLUT!==void 0&&(ke.dfgLUT.value=C3()),Us){if(ge.setValue(O,"toneMappingExposure",R.toneMappingExposure),xt.needsLights&&Ua(ke,gr),gt&&P.fog===!0&&wt.refreshFogUniforms(ke,gt),wt.refreshMaterialUniforms(ke,P,tt,W,E.state.transmissionRenderTarget[M.id]),xt.needsLights&&xt.lightProbeGrid){let Te=xt.lightProbeGrid;ke.probesSH.value=Te.texture,ke.probesMin.value.copy(Te.boundingBox.min),ke.probesMax.value.copy(Te.boundingBox.max),ke.probesResolution.value.copy(Te.resolution)}zo.upload(O,un(xt),ke,q)}if(P.isShaderMaterial&&P.uniformsNeedUpdate===!0&&(zo.upload(O,un(xt),ke,q),P.uniformsNeedUpdate=!1),P.isSpriteMaterial&&ge.setValue(O,"center",B.center),ge.setValue(O,"modelViewMatrix",B.modelViewMatrix),ge.setValue(O,"normalMatrix",B.normalMatrix),ge.setValue(O,"modelMatrix",B.matrixWorld),P.uniformsGroups!==void 0){let Te=P.uniformsGroups;for(let Ns=0,vr=Te.length;Ns<vr;Ns++){let K0=Te[Ns];et.update(K0,oi),et.bind(K0,oi)}}return oi}function Ua(M,D){M.ambientLightColor.needsUpdate=D,M.lightProbe.needsUpdate=D,M.sunLights.needsUpdate=D,M.sunLightShadows.needsUpdate=D,M.directionalLights.needsUpdate=D,M.directionalLightShadows.needsUpdate=D,M.pointLights.needsUpdate=D,M.pointLightShadows.needsUpdate=D,M.spotLights.needsUpdate=D,M.spotLightShadows.needsUpdate=D,M.rectAreaLights.needsUpdate=D,M.hemisphereLights.needsUpdate=D}function mr(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return Z},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return st},this.setRenderTargetTextures=function(M,D,k){let P=H.get(M);P.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,P.__autoAllocateDepthBuffer===!1&&(P.__useRenderToTexture=!1),H.get(M.texture).__webglTexture=D,H.get(M.depthTexture).__webglTexture=P.__autoAllocateDepthBuffer?void 0:k,P.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,D){let k=H.get(M);k.__webglFramebuffer=D,k.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(M,D=0,k=0){st=M,Z=D,Y=k;let P=null,B=!1,gt=!1;if(M){let mt=H.get(M);if(mt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(O.FRAMEBUFFER,mt.__webglFramebuffer),j.copy(M.viewport),Rt.copy(M.scissor),ft=M.scissorTest,_.viewport(j),_.scissor(Rt),_.setScissorTest(ft),X=-1;return}else if(mt.__webglFramebuffer===void 0)q.setupRenderTarget(M);else if(mt.__hasExternalTextures)q.rebindTextures(M,H.get(M.texture).__webglTexture,H.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Xt=M.depthTexture;if(mt.__boundDepthTexture!==Xt){if(Xt!==null&&H.has(Xt)&&(M.width!==Xt.image.width||M.height!==Xt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");q.setupDepthRenderbuffer(M)}}let Tt=M.texture;(Tt.isData3DTexture||Tt.isDataArrayTexture||Tt.isCompressedArrayTexture)&&(gt=!0);let Ct=H.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ct[D])?P=Ct[D][k]:P=Ct[D],B=!0):M.samples>0&&q.useMultisampledRTT(M)===!1?P=H.get(M).__webglMultisampledFramebuffer:Array.isArray(Ct)?P=Ct[k]:P=Ct,j.copy(M.viewport),Rt.copy(M.scissor),ft=M.scissorTest}else j.copy(_t).multiplyScalar(tt).floor(),Rt.copy(Nt).multiplyScalar(tt).floor(),ft=Ne;if(k!==0&&(P=V),_.bindFramebuffer(O.FRAMEBUFFER,P)&&_.drawBuffers(M,P),_.viewport(j),_.scissor(Rt),_.setScissorTest(ft),B){let mt=H.get(M.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+D,mt.__webglTexture,k)}else if(gt){let mt=D;for(let Tt=0;Tt<M.textures.length;Tt++){let Ct=H.get(M.textures[Tt]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Tt,Ct.__webglTexture,k,mt)}}else if(M!==null&&k!==0){let mt=H.get(M.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,mt.__webglTexture,k)}X=-1};function bi(M){let D=H.get(M);return(D.__readFormat!==M.format||D.__readType!==M.type)&&(D.__readFormat=M.format,D.__readType=M.type,D.__formatReadable=C.textureFormatReadable(M.format),D.__typeReadable=C.textureTypeReadable(M.type)),D}this.readRenderTargetPixels=function(M,D,k,P,B,gt,Mt,mt=0){if(!(M&&M.isWebGLRenderTarget)){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=H.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Mt!==void 0&&(Tt=Tt[Mt]),Tt){_.bindFramebuffer(O.FRAMEBUFFER,Tt);try{let Ct=M.textures[mt],Xt=Ct.format,Yt=Ct.type;M.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+mt);let Et=bi(Ct);if(Et.__formatReadable===!1){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Et.__typeReadable===!1){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=M.width-P&&k>=0&&k<=M.height-B&&O.readPixels(D,k,P,B,ht.convert(Xt),ht.convert(Yt),gt)}finally{let Ct=st!==null?H.get(st).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(M,D,k,P,B,gt,Mt,mt=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=H.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Mt!==void 0&&(Tt=Tt[Mt]),Tt)if(D>=0&&D<=M.width-P&&k>=0&&k<=M.height-B){_.bindFramebuffer(O.FRAMEBUFFER,Tt);let Ct=M.textures[mt],Xt=Ct.format,Yt=Ct.type;M.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+mt);let Et=bi(Ct);if(Et.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Et.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ue=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,ue),O.bufferData(O.PIXEL_PACK_BUFFER,gt.byteLength,O.STREAM_READ),O.readPixels(D,k,P,B,ht.convert(Xt),ht.convert(Yt),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let qe=st!==null?H.get(st).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,qe);let Ae=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await KM(O,Ae,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,ue),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,gt),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(ue),O.deleteSync(Ae),gt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,D=null,k=0){let P=Math.pow(2,-k),B=Math.floor(M.image.width*P),gt=Math.floor(M.image.height*P),Mt=D!==null?D.x:0,mt=D!==null?D.y:0;q.setTexture2D(M,0),O.copyTexSubImage2D(O.TEXTURE_2D,k,0,0,Mt,mt,B,gt),_.unbindTexture()},this.copyTextureToTexture=function(M,D,k=null,P=null,B=0,gt=0){let Mt,mt,Tt,Ct,Xt,Yt,Et,ue,qe,Ae=M.isCompressedTexture?M.mipmaps[gt]:M.image;if(k!==null)Mt=k.max.x-k.min.x,mt=k.max.y-k.min.y,Tt=k.isBox3?k.max.z-k.min.z:1,Ct=k.min.x,Xt=k.min.y,Yt=k.isBox3?k.min.z:0;else{let ke=Math.pow(2,-B);Mt=Math.floor(Ae.width*ke),mt=Math.floor(Ae.height*ke),M.isDataArrayTexture?Tt=Ae.depth:M.isData3DTexture?Tt=Math.floor(Ae.depth*ke):Tt=1,Ct=0,Xt=0,Yt=0}P!==null?(Et=P.x,ue=P.y,qe=P.z):(Et=0,ue=0,qe=0);let xe=ht.convert(D.format),yn=ht.convert(D.type),xt;D.isData3DTexture?(q.setTexture3D(D,0),xt=O.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(q.setTexture2DArray(D,0),xt=O.TEXTURE_2D_ARRAY):(q.setTexture2D(D,0),xt=O.TEXTURE_2D),_.activeTexture(O.TEXTURE0),_.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,D.flipY),_.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),_.pixelStorei(O.UNPACK_ALIGNMENT,D.unpackAlignment);let Cn=_.getParameter(O.UNPACK_ROW_LENGTH),ae=_.getParameter(O.UNPACK_IMAGE_HEIGHT),oi=_.getParameter(O.UNPACK_SKIP_PIXELS),Fi=_.getParameter(O.UNPACK_SKIP_ROWS),Us=_.getParameter(O.UNPACK_SKIP_IMAGES);_.pixelStorei(O.UNPACK_ROW_LENGTH,Ae.width),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ae.height),_.pixelStorei(O.UNPACK_SKIP_PIXELS,Ct),_.pixelStorei(O.UNPACK_SKIP_ROWS,Xt),_.pixelStorei(O.UNPACK_SKIP_IMAGES,Yt);let gr=M.isDataArrayTexture||M.isData3DTexture,ge=D.isDataArrayTexture||D.isData3DTexture;if(M.isDepthTexture){let ke=H.get(M),Ls=H.get(D),Te=H.get(ke.__renderTarget),Ns=H.get(Ls.__renderTarget);_.bindFramebuffer(O.READ_FRAMEBUFFER,Te.__webglFramebuffer),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,Ns.__webglFramebuffer);for(let vr=0;vr<Tt;vr++)gr&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,H.get(M).__webglTexture,B,Yt+vr),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,H.get(D).__webglTexture,gt,qe+vr)),O.blitFramebuffer(Ct,Xt,Mt,mt,Et,ue,Mt,mt,O.DEPTH_BUFFER_BIT,O.NEAREST);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(B!==0||M.isRenderTargetTexture||H.has(M)){let ke=H.get(M),Ls=H.get(D);_.bindFramebuffer(O.READ_FRAMEBUFFER,L),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,G);for(let Te=0;Te<Tt;Te++)gr?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,ke.__webglTexture,B,Yt+Te):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,ke.__webglTexture,B),ge?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ls.__webglTexture,gt,qe+Te):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ls.__webglTexture,gt),B!==0?O.blitFramebuffer(Ct,Xt,Mt,mt,Et,ue,Mt,mt,O.COLOR_BUFFER_BIT,O.NEAREST):ge?O.copyTexSubImage3D(xt,gt,Et,ue,qe+Te,Ct,Xt,Mt,mt):O.copyTexSubImage2D(xt,gt,Et,ue,Ct,Xt,Mt,mt);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else ge?M.isDataTexture||M.isData3DTexture?O.texSubImage3D(xt,gt,Et,ue,qe,Mt,mt,Tt,xe,yn,Ae.data):D.isCompressedArrayTexture?O.compressedTexSubImage3D(xt,gt,Et,ue,qe,Mt,mt,Tt,xe,Ae.data):O.texSubImage3D(xt,gt,Et,ue,qe,Mt,mt,Tt,xe,yn,Ae):M.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,gt,Et,ue,Mt,mt,xe,yn,Ae.data):M.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,gt,Et,ue,Ae.width,Ae.height,xe,Ae.data):O.texSubImage2D(O.TEXTURE_2D,gt,Et,ue,Mt,mt,xe,yn,Ae);_.pixelStorei(O.UNPACK_ROW_LENGTH,Cn),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,ae),_.pixelStorei(O.UNPACK_SKIP_PIXELS,oi),_.pixelStorei(O.UNPACK_SKIP_ROWS,Fi),_.pixelStorei(O.UNPACK_SKIP_IMAGES,Us),gt===0&&D.generateMipmaps&&O.generateMipmap(xt),_.unbindTexture()},this.initRenderTarget=function(M){H.get(M).__webglFramebuffer===void 0&&q.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?q.setTextureCube(M,0):M.isData3DTexture?q.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?q.setTexture2DArray(M,0):q.setTexture2D(M,0),_.unbindTexture()},this.resetState=function(){Z=0,Y=0,st=null,_.reset(),$.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ui}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=jt._getDrawingBufferColorSpace(t),n.unpackColorSpace=jt._getUnpackColorSpace()}};var Fb=Hi(ur()),Hc=400,Vo=160,Vc=80,Gc=1500,Wc=8,Nb=["straight","gentle","winding","hills","racing","deep"],Ib={dark:{background:"transparent",road:"#08080a",lines:"#25252d",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#ffffff"},light:{background:"transparent",road:"#efeff2",lines:"#d0d0d7",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#18181b"}},Od=`
  uniform float uTime;
  uniform float uCurvature;
  uniform vec4 uCurveA;
  uniform float uCurveB;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uPixel;
  #define PI 3.14159265358979
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }
  vec3 gentle(float p) {
    return vec3(
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,
      0.0
    );
  }
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }
  vec3 hills(float p) {
    return vec3(
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0
    );
  }
  vec3 racing(float p) {
    return vec3(
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,
      0.0
    );
  }
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }
  vec3 bend(float p) {
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;
    return d * uCurvature;
  }
`,L3=`
  ${Od}
  attribute vec4 aSeedA;
  attribute vec4 aSeedB;
  attribute float aPair;
  attribute float aTone;
  uniform float uTravel;
  uniform float uRoadX;
  uniform float uRoadWidth;
  uniform float uLanes;
  uniform float uDirection;
  uniform vec2 uSpeedRange;
  uniform float uTrail;
  uniform float uStretch;
  uniform float uSize;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${Wc}];
  uniform float uColorCount;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float laneWidth = uRoadWidth / uLanes;
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;
    vec3 center = vec3(
      uRoadX + laneX + aPair * carWidth,
      aSeedB.w * 0.8 + radius * 1.3,
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.8, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = radius * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normal;
    n.y *= 1.0 - 2.0 * uMirror;
    vNormal = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,N3=`
  uniform vec2 uFade;
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,I3=`
  ${Od}
  attribute vec4 aSeed;
  attribute float aIndex;
  attribute float aSide;
  uniform float uTravel;
  uniform float uCount;
  uniform float uEdge;
  uniform float uHeight;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${Wc}];
  uniform float uColorCount;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    vHeight = position.y + 0.5;
    float width = mix(0.08, 0.22, aSeed.y);
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;
    float spacing = uTravel / max(uCount, 1.0);
    vec3 center = vec3(
      aSide * uEdge,
      vHeight * height,
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.6, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = width * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,O3=`
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,P3=`
  ${Od}
  attribute vec4 aSeed;
  attribute float aEnd;
  uniform float uTravel;
  uniform float uStretch;
  uniform float uSpread;
  varying float vAlpha;
  void main() {
    float x = (aSeed.x - 0.5) * uSpread;
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);
    float speed = mix(140.0, 260.0, aSeed.w);
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);
    vec3 p = vec3(x, y, z + aEnd * len);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));
  }
`,B3=`
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);
  }
`,F3=`
  ${Od}
  uniform float uTravel;
  uniform float uWidth;
  varying vec2 vRoad;
  varying float vFog;
  void main() {
    vec3 p = position;
    p.x *= uWidth;
    vRoad = vec2(p.x, p.z);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,z3=`
  uniform float uTime;
  uniform vec3 uRoadColor;
  uniform vec3 uLineColor;
  uniform vec3 uBackground;
  uniform float uRoadWidth;
  uniform float uMedian;
  uniform float uLanes;
  uniform float uTransparent;
  uniform float uOpacity;
  varying vec2 vRoad;
  varying float vFog;
  float stripe(float d, float w) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(w - aa, w + aa, d);
  }
  void main() {
    float rx = abs(vRoad.x) - uMedian * 0.5;
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;
    if (rx >= 0.0) {
      float laneWidth = uRoadWidth / uLanes;
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));
      float nearest = floor(rx / laneWidth + 0.5);
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);
      color = mix(color, uLineColor, marks);
    }
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);
  }
`,H3=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,V3=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tap(vec2 offset) {
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));
  }
  void main() {
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
    gl_FragColor = sum * 0.125;
  }
`,Pb=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tent() {
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;
    return sum / 12.0;
  }
`,G3=`
  ${Pb}
  void main() {
    gl_FragColor = tent();
  }
`,k3=`
  ${Pb}
  uniform float uStrength;
  uniform float uCeiling;
  uniform float uLight;
  void main() {
    vec4 color = tent() * uStrength;
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);
  }
`,Go=null,kc=e=>{if(Go=Go??document.createElement("canvas").getContext("2d"),!Go)return[1,1,1];Go.fillStyle="#000000",Go.fillStyle=e;let t=String(Go.fillStyle);if(t.startsWith("#")){let i=parseInt(t.slice(1,7),16);return[(i>>16&255)/255,(i>>8&255)/255,(i&255)/255]}let n=t.match(/[\d.]+/g)?.map(Number)??[0,0,0];return[n[0]/255,n[1]/255,n[2]/255]},Z0=(e,t,n)=>{let i=n.length?n:["#ffffff"];for(let s=0;s<Wc;s++)e.value[s].fromArray(kc(i[s%i.length]));t.value=Math.min(i.length,Wc)},Ob=e=>{let t=new Tc;return t.setIndex(e.index),Object.entries(e.attributes).forEach(([n,i])=>t.setAttribute(n,i)),t},ko=e=>Math.sin(e)*.5+.5,Ud=(e,t)=>Math.cos(Math.PI*e*4+t)*25+Math.cos(Math.PI*e*8+t*2)**2*5,Ld=(e,t)=>-ko(Math.PI*e*8+t)*10-ko(Math.PI*e+t/8)**5*10,Nd=(e,t)=>Math.sin(e*Math.PI*4+t)*10,Id=(e,t)=>Math.abs(e*10)**2+Math.sin(e*Math.PI*8+t)*20,W3=(e,t)=>{let{PI:n,cos:i,sin:s}=Math;return[[i(e*n*5+t)*25-i(.02*n*5+t)*25,s(e*n*2+n*.5+t)*15-s(.02*n*2+n*.5+t)*15,0],[Ud(e,t)-Ud(.0125,t),Ld(e,t)-Ld(.0125,t),0],[i(e*n*3+t)*30-i(.02*n*3+t)*30,ko(e*n*6+t)*30-ko(.02*n*6+t)*30,ko(e*n*10+t)*20-ko(.02*n*10+t)*20],[s(e*n*2+t)*35-s(.0125*n*2+t)*35,s(e*n*3+t)*10-s(.0125*n*3+t)*10,0],[Nd(e,t)-Nd(.02,t),Id(e,t)-Id(.02,t),0]]},X3=(e,t)=>{let[i,,s,a]=W3(.025,e);return[[i[0]*t*2,i[1]*t*.4,-3],[(Ud(.025,e)-Ud(.025+.007,e))*t*-2,(Ld(.025,e)-Ld(.025+.007,e))*t*-5,-10],[s[0]*t*2,s[1]*t*2,s[2]*t*2-5],[a[0]*t,a[1]*t,-5],[(Nd(.025,e)-Nd(.025+.01,e))*t*-2,(Id(.025,e)-Id(.025+.01,e))*t*-4,-10]]},q3="absolute inset-0 overflow-hidden touch-pan-y select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full",Y3=({curve:e="winding",curvature:t=1,speed:n=1,boost:i=3,fov:s=90,boostFov:a=130,lanes:r=3,roadWidth:o=10,medianWidth:l=2,density:c=40,trailLength:f=1,lightSize:p=1,poles:u=20,poleHeight:d=1,dust:g=100,glow:b=.6,reflections:m=.5,steer:h=.35,tailColors:v,headColors:S,poleColors:y,roadColor:T,roadOpacity:E=.1,lineColor:w,background:x,theme:A="dark",interactive:R=!0,boosting:I=!1,onBoostStart:F,onBoostEnd:V,className:L="",style:G})=>{let Z=(0,Wo.useRef)(null),Y=Ib[A]??Ib.dark,st={light:A==="light",curve:Nb.includes(e)?e:"winding",curvature:Math.max(0,t),speed:Math.max(0,n),boost:Math.max(1,i),fov:Math.min(170,Math.max(20,s)),boostFov:Math.min(170,Math.max(20,a)),lanes:Math.max(1,Math.round(r)),roadWidth:Math.max(1,o),medianWidth:Math.max(0,l),density:Math.min(Vo,Math.max(0,Math.round(c))),trailLength:Math.max(.05,f),lightSize:Math.max(.1,p),poles:Math.min(Vc,Math.max(0,Math.round(u))),poleHeight:Math.max(.1,d),dust:Math.min(Gc,Math.max(0,Math.round(g))),glow:Math.max(0,b),reflections:Math.max(0,m),steer:Math.max(0,h),tailColors:v?.length?v:Y.tail,headColors:S?.length?S:Y.head,poleColors:y?.length?y:Y.poles,roadColor:T??Y.road,roadOpacity:Math.min(1,Math.max(0,E)),lineColor:w??Y.lines,background:x??Y.background,dustColor:Y.dust,interactive:R,boosting:I},X=(0,Wo.useRef)(st);X.current=st;let nt=(0,Wo.useRef)({onBoostStart:F,onBoostEnd:V});return nt.current={onBoostStart:F,onBoostEnd:V},(0,Wo.useEffect)(()=>{let j=Z.current;if(!j)return;let Rt=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,ft=new wd({antialias:!0,alpha:!0,powerPreference:"high-performance"});ft.outputColorSpace=pa,ft.autoClear=!1,ft.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),j.appendChild(ft.domElement);let se=new Do,Pt=new bn(X.current.fov,1,.1,1e4);Pt.position.set(0,8,-5);let Ht={uTime:{value:0},uCurvature:{value:1},uCurveA:{value:new Le},uCurveB:{value:0},uFogNear:{value:Hc*.22},uFogFar:{value:Hc*.95},uTravel:{value:Hc},uStretch:{value:0},uPixel:{value:.001}},W=[],tt=[],yt=(vt,at,ie,be={})=>{let un=new An({vertexShader:vt,fragmentShader:at,uniforms:{...Ht,...ie},transparent:!0,depthWrite:!1,...be});return W.push(un),un},Bt=()=>({value:Array.from({length:Wc},()=>new N(1,1,1))}),_t=new ya(1,Hc,1,220);_t.rotateX(-Math.PI/2),_t.translate(0,0,-Hc/2),W.push(_t);let Nt={uWidth:{value:1},uRoadColor:{value:new N},uLineColor:{value:new N},uBackground:{value:new N},uRoadWidth:{value:10},uMedian:{value:2},uLanes:{value:3},uTransparent:{value:0},uOpacity:{value:1}},Ne=yt(F3,z3,Nt,{transparent:!0,depthWrite:!0}),Gt=new _n(_t,Ne);Gt.frustumCulled=!1,Gt.renderOrder=0,Gt.layers.enable(1),se.add(Gt);let te=new Sc(new Lo(new N(0,0,0),new N(0,0,-1)),24,1,7,!1);W.push(te);let fe=(vt,at,ie)=>{let be=Ob(te),un=new Float32Array(Vo*2*4),$e=new Float32Array(Vo*2*4),ns=new Float32Array(Vo*2),Da=new Float32Array(Vo*2);for(let bi=0;bi<Vo;bi++){let M=[Math.random(),Math.random(),Math.random(),Math.random()],D=[Math.random(),Math.random(),Math.random(),Math.random()*Math.random()],k=Math.random();for(let P=0;P<2;P++){let B=bi*2+P;un.set(M,B*4),$e.set(D,B*4),ns[B]=P?.5:-.5,Da[B]=k}}be.setAttribute("aSeedA",new Li(un,4)),be.setAttribute("aSeedB",new Li($e,4)),be.setAttribute("aPair",new Li(ns,1)),be.setAttribute("aTone",new Li(Da,1)),be.instanceCount=0,W.push(be);let Ua={uRoadX:{value:0},uRoadWidth:{value:10},uLanes:{value:3},uDirection:{value:vt},uSpeedRange:{value:new Dt(...ie)},uTrail:{value:1},uSize:{value:1},uColors:Bt(),uColorCount:{value:1},uFade:{value:new Dt(...at)}},mr=(bi,M,D,k)=>{let P=yt(L3,N3,{...Ua,uRadiusScale:{value:bi},uSharp:{value:M},uMirror:{value:D},uIntensity:{value:1},uCore:{value:0}},{depthTest:!D});tt.push(P);let B=new _n(be,P);return B.frustumCulled=!1,B.renderOrder=k,D||B.layers.enable(1),se.add(B),P};return{geometry:be,uniforms:Ua,reflection:mr(2.1,1.2,1,1),core:mr(1,.85,0,3)}},Wt=fe(1,[0,.6],[60,80]),me=fe(-1,[1,.4],[120,160]),Ge=new _c(1,1,1,8,1,!0);W.push(Ge);let ze=Ob(Ge),Me=new Float32Array(Vc*2*4),Pe=new Float32Array(Vc*2),O=new Float32Array(Vc*2);for(let vt=0;vt<Vc;vt++)for(let at=0;at<2;at++){let ie=vt*2+at;Me.set([Math.random(),Math.random(),Math.random(),Math.random()],ie*4),Pe[ie]=vt+(at?.5:0),O[ie]=at?1:-1}ze.setAttribute("aSeed",new Li(Me,4)),ze.setAttribute("aIndex",new Li(Pe,1)),ze.setAttribute("aSide",new Li(O,1)),ze.instanceCount=0,W.push(ze);let Be={uCount:{value:20},uEdge:{value:11},uHeight:{value:1},uColors:Bt(),uColorCount:{value:1}},re=(vt,at,ie,be)=>{let un=yt(I3,O3,{...Be,uRadiusScale:{value:vt},uSharp:{value:at},uMirror:{value:ie},uIntensity:{value:1},uCore:{value:0}},{depthTest:!ie});tt.push(un);let $e=new _n(ze,un);return $e.frustumCulled=!1,$e.renderOrder=be,ie||$e.layers.enable(1),se.add($e),un},C={reflection:re(2.4,1.2,1,1),core:re(1,.8,0,3)},_=new En,z=new Float32Array(Gc*2*4),H=new Float32Array(Gc*2);for(let vt=0;vt<Gc;vt++){let at=[Math.random(),Math.random(),Math.random(),Math.random()];z.set(at,vt*8),z.set(at,vt*8+4),H[vt*2+1]=1}_.setAttribute("position",new gn(new Float32Array(Gc*2*3),3)),_.setAttribute("aSeed",new gn(z,4)),_.setAttribute("aEnd",new gn(H,1)),_.setDrawRange(0,0),W.push(_);let q={uSpread:{value:140},uColor:{value:new N(1,1,1)},uIntensity:{value:.5}},rt=yt(P3,B3,q);tt.push(rt);let ot=new mc(_,rt);ot.frustumCulled=!1,ot.renderOrder=4,se.add(ot);let J=ft.extensions.has("EXT_color_buffer_float")||ft.extensions.has("EXT_color_buffer_half_float"),K=Array.from({length:5},(vt,at)=>{let ie=new Tn(1,1,{type:J?ri:Nn,depthBuffer:at===0});return W.push(ie),ie}),ut=new Do,wt=new ar(-1,1,1,-1,0,1),dt=new ya(2,2);W.push(dt);let lt=new _n(dt);lt.frustumCulled=!1,ut.add(lt);let At=(vt,at)=>{let ie=new An({vertexShader:H3,fragmentShader:vt,uniforms:{uTexture:{value:null},uTexel:{value:new Dt},uStrength:{value:1},uCeiling:{value:1},uLight:{value:0}},depthTest:!1,depthWrite:!1,...at});return W.push(ie),ie},Ut=At(V3,{blending:Si}),zt=At(G3,{blending:wc,blendSrc:Ni,blendDst:Ni,blendSrcAlpha:Ni,blendDstAlpha:Ni}),U=At(k3,{blending:wc,blendSrc:Ni}),ct=(vt,at,ie)=>{lt.material=vt,vt.uniforms.uTexture.value=at.texture,vt.uniforms.uTexel.value.set(1/at.width,1/at.height),ft.setRenderTarget(ie),ft.render(ut,wt)},Q=new $t,ht=0,$={boost:0,held:!1,boosted:!1,fov:X.current.fov,fovVelocity:0,steerX:0,steerY:0,pointerX:0,pointerY:0,weights:[0,0,0,0,0],visible:!0},et={tail:"",head:"",poles:"",surface:"",light:null},bt=new N,St=0,ce=performance.now(),ne=!0,kn=vt=>{let at=vt.tailColors.join();at!==et.tail&&(et.tail=at,Z0(Wt.uniforms.uColors,Wt.uniforms.uColorCount,vt.tailColors));let ie=vt.headColors.join();ie!==et.head&&(et.head=ie,Z0(me.uniforms.uColors,me.uniforms.uColorCount,vt.headColors));let be=vt.poleColors.join();be!==et.poles&&(et.poles=be,Z0(Be.uColors,Be.uColorCount,vt.poleColors));let un=[vt.roadColor,vt.lineColor,vt.background,vt.dustColor].join();if(un!==et.surface){et.surface=un,Nt.uRoadColor.value.fromArray(kc(vt.roadColor)),Nt.uLineColor.value.fromArray(kc(vt.lineColor)),q.uColor.value.fromArray(kc(vt.dustColor));let $e=vt.background==="transparent",ns=$e?[0,0,0]:kc(vt.background);Nt.uBackground.value.fromArray(ns),Nt.uTransparent.value=$e?1:0,Q.setRGB(...ns,pa),ht=$e?0:1}et.light!==vt.light&&(et.light=vt.light,tt.forEach($e=>{$e.blending=vt.light?Ta:Ac,$e.needsUpdate=!0}),U.blendDst=vt.light?Io:Ni,U.blendSrcAlpha=vt.light?Ni:Of,U.blendDstAlpha=vt.light?Io:Ni,U.uniforms.uLight.value=vt.light?1:0)},Wn=()=>{let vt=Math.max(1,j.clientWidth),at=Math.max(1,j.clientHeight);ft.setSize(vt,at,!1),K.forEach((ie,be)=>ie.setSize(Math.max(1,Math.round(vt/2**(be+1))),Math.max(1,Math.round(at/2**(be+1))))),Pt.aspect=vt/at,Pt.updateProjectionMatrix(),qc()},Xc=vt=>{if(St=0,!ne)return;let at=X.current,ie=Math.min(.05,Math.max(.001,(vt-ce)/1e3));ce=vt,kn(at);let be=$.held&&at.interactive||at.boosting?1:0;$.boost+=(be-$.boost)*(1-Math.exp(-ie/(be>$.boost?.28:.85)));let un=at.speed*(Rt?.3:1)*(1+(at.boost-1)*$.boost);Ht.uTime.value+=ie*un,Ht.uStretch.value=$.boost*1.1,Ht.uCurvature.value=at.curvature;let $e=Nb.indexOf(at.curve)-1,ns=1-Math.exp(-ie/.6);$.weights=$.weights.map((P,B)=>P+((B===$e?1:0)-P)*ns),Ht.uCurveA.value.set($.weights[0],$.weights[1],$.weights[2],$.weights[3]),Ht.uCurveB.value=$.weights[4];let Da=at.roadWidth/2+at.medianWidth/2,Ua=.45+.55*at.roadOpacity;[Wt,me].forEach((P,B)=>{P.geometry.instanceCount=at.density*2,P.uniforms.uRoadX.value=B?Da:-Da,P.uniforms.uRoadWidth.value=at.roadWidth,P.uniforms.uLanes.value=at.lanes,P.uniforms.uTrail.value=at.trailLength,P.uniforms.uSize.value=at.lightSize,P.core.uniforms.uIntensity.value=at.light?.95:1+.35*$.boost,P.core.uniforms.uCore.value=at.light?0:.75,P.reflection.uniforms.uIntensity.value=at.reflections*(at.light?.22:.42)*Ua}),ze.instanceCount=at.poles*2,Be.uCount.value=Math.max(1,at.poles),Be.uEdge.value=at.roadWidth+at.medianWidth/2+.8,Be.uHeight.value=at.poleHeight,C.core.uniforms.uIntensity.value=at.light?.9:1,C.core.uniforms.uCore.value=at.light?0:.6,C.reflection.uniforms.uIntensity.value=at.reflections*(at.light?.2:.38)*Ua,_.setDrawRange(0,at.dust*2),q.uIntensity.value=(at.light?.35:.45)*(1+$.boost),q.uSpread.value=(at.roadWidth*2+at.medianWidth)*5,Nt.uWidth.value=at.roadWidth*2+at.medianWidth+3,Nt.uRoadWidth.value=at.roadWidth,Nt.uMedian.value=at.medianWidth,Nt.uLanes.value=at.lanes,Nt.uOpacity.value=at.roadOpacity,Ne.depthWrite=at.roadOpacity>.5;let mr=Rt?at.fov:at.fov+(at.boostFov-at.fov)*$.boost;$.fovVelocity+=((mr-$.fov)*90-$.fovVelocity*13)*ie,$.fov+=$.fovVelocity*ie,Pt.fov=$.fov,Ht.uPixel.value=2*Math.tan($.fov*Math.PI/360)/Math.max(1,ft.domElement.height);let bi=1-Math.exp(-ie/.35),M=at.interactive?at.steer:0;$.steerX+=($.pointerX*M-$.steerX)*bi,$.steerY+=($.pointerY*M-$.steerY)*bi,Pt.position.set($.steerX*at.roadWidth*.45,8-$.steerY*2.5,-5);let D=X3(Ht.uTime.value,at.curvature),k=1-$.weights.reduce((P,B)=>P+B,0);if(bt.set(0,0,-10*k),D.forEach((P,B)=>{bt.x+=P[0]*$.weights[B],bt.y+=P[1]*$.weights[B],bt.z+=P[2]*$.weights[B]}),bt.x+=$.steerX*2.5,bt.add(Pt.position),Pt.lookAt(bt),Pt.updateProjectionMatrix(),ft.setRenderTarget(null),ft.setClearColor(Q,ht),ft.clear(),ft.render(se,Pt),at.glow>0){let P=Ht.uPixel.value;Ht.uPixel.value=P*(ft.domElement.height/K[0].height),Pt.layers.set(1),Ne.colorWrite=!1,ft.setRenderTarget(K[0]),ft.setClearColor(0,0),ft.clear(),ft.render(se,Pt),Ne.colorWrite=!0,Pt.layers.set(0),Ht.uPixel.value=P;for(let B=1;B<K.length;B++)ct(Ut,K[B-1],K[B]);for(let B=K.length-1;B>1;B--)ct(zt,K[B],K[B-1]);U.uniforms.uStrength.value=at.glow*(at.light?.5:1.4),U.uniforms.uCeiling.value=at.glow*(at.light?.3:.5),ct(U,K[1],null)}$.visible&&(St=requestAnimationFrame(Xc))},qc=()=>{St||!ne||!$.visible||(ce=performance.now(),St=requestAnimationFrame(Xc))},Xo=vt=>{$.held!==vt&&($.held=vt,X.current.interactive&&(vt?nt.current.onBoostStart?.():nt.current.onBoostEnd?.()))},dr=vt=>{vt.button!==0&&vt.pointerType==="mouse"||Xo(!0)},Ds=()=>Xo(!1),qo=vt=>{let at=j.getBoundingClientRect();$.pointerX=(vt.clientX-at.left)/at.width*2-1,$.pointerY=(vt.clientY-at.top)/at.height*2-1},Yo=()=>{$.pointerX=0,$.pointerY=0},Bi=vt=>{X.current.interactive&&vt.preventDefault()},pr=new ResizeObserver(Wn);pr.observe(j);let Zo=new IntersectionObserver(vt=>{$.visible=vt.some(at=>at.isIntersecting),$.visible&&qc()});return Zo.observe(j),j.addEventListener("pointerdown",dr),j.addEventListener("pointermove",qo),j.addEventListener("pointerleave",Yo),j.addEventListener("contextmenu",Bi),window.addEventListener("pointerup",Ds),window.addEventListener("pointercancel",Ds),window.addEventListener("blur",Ds),Wn(),()=>{ne=!1,cancelAnimationFrame(St),pr.disconnect(),Zo.disconnect(),j.removeEventListener("pointerdown",dr),j.removeEventListener("pointermove",qo),j.removeEventListener("pointerleave",Yo),j.removeEventListener("contextmenu",Bi),window.removeEventListener("pointerup",Ds),window.removeEventListener("pointercancel",Ds),window.removeEventListener("blur",Ds),W.forEach(vt=>vt.dispose()),ft.dispose(),ft.domElement.remove()}},[]),(0,Fb.jsx)("div",{ref:Z,className:`${q3}${L?` ${L}`:""}`,style:G})},Bb=Y3;var Pd=Hi(ur());function Bd(){return(0,Pd.jsx)("div",{style:{width:"100%",minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:0},children:(0,Pd.jsx)("div",{style:{position:"relative",width:"100%",height:600},children:(0,Pd.jsx)(Bb,{curve:"winding",curvature:1,speed:1,boost:3,fov:90,boostFov:130,lanes:3,roadWidth:10,medianWidth:2,density:40,trailLength:1,lightSize:1,poles:20,dust:100,glow:.6,reflections:.5,roadOpacity:.1,steer:.35,tailColors:["#d856bf","#6750a2","#c247ac"],headColors:["#03b3c3","#0e5ea5","#324555"],poleColors:["#03b3c3"],interactive:!0})})})}var Ra=Hi(ur()),kb="reactbits--hyperspeed",Z3=!0,zb=Object.keys(hr),Hb=Bd||void 0||hr[zb.find(e=>/Demo|Example/.test(e))]||hr[zb.find(e=>/^[A-Z]/.test(e)&&!/(Provider|Context|Props|Root|Wrapper)$/.test(e))],Vb=!1,Fd=(e,t)=>{e==="preview-error"&&(Vb=!0),!(e==="preview-ready"&&Vb)&&parent.postMessage({type:e,id:kb,...t?{message:String(t)}:{}},"*")};window.addEventListener("error",e=>Fd("preview-error",e.message));window.addEventListener("unhandledrejection",e=>Fd("preview-error",e.reason?.message||e.reason));var J0=class extends fr.default.Component{state={error:null};static getDerivedStateFromError(t){return{error:t}}componentDidCatch(t){Fd("preview-error",t.message)}render(){return this.state.error?(0,Ra.jsxs)("div",{role:"alert",style:{padding:32,maxWidth:600,fontSize:13,color:"#a1a1aa"},children:["The original example could not finish rendering: ",this.state.error.message]}):this.props.children}};function J3(){let[e,t]=fr.default.useState({});if(fr.default.useEffect(()=>{let n=s=>{s.data?.type==="preview:set-props"&&(!s.data.id||s.data.id===kb)&&t(a=>({...a,...s.data.props}))};window.addEventListener("message",n);let i=requestAnimationFrame(()=>requestAnimationFrame(()=>Fd("preview-ready")));return()=>{cancelAnimationFrame(i),window.removeEventListener("message",n)}},[]),!Hb)throw Error("No renderable component export was published.");return fr.default.createElement(Hb,Z3?{}:{style:{width:"100%",height:"100%"},className:"h-full w-full",particleColors:["#a78bfa","#60a5fa","#e9d5ff"],particleCount:200,...e})}function K3(){let{resolvedTheme:e,setTheme:t}=kS();return fr.default.useEffect(()=>{document.documentElement.dataset.theme=e||"dark"},[e]),fr.default.useEffect(()=>{let n=i=>{i.data?.type==="preview:set-theme"&&t(i.data.theme==="light"?"light":"dark")};return window.addEventListener("message",n),()=>window.removeEventListener("message",n)},[t]),(0,Ra.jsx)(J3,{})}function Q3(){return(0,Ra.jsx)(WS,{attribute:"class",defaultTheme:document.documentElement.dataset.theme||"dark",enableSystem:!1,children:(0,Ra.jsx)(K3,{})})}(0,Gb.createRoot)(document.getElementById("root")).render((0,Ra.jsx)(J0,{children:(0,Ra.jsx)(Q3,{})}));})();
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
