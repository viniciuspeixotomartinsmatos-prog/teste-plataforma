export function safeNext(value,fallback='/'){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return fallback;
 try{const url=new URL(value,'https://umso.invalid');return url.origin==='https://umso.invalid'&&!url.pathname.startsWith('/api/')?url.pathname+url.search+url.hash:fallback;}catch{return fallback;}
}
export const accountRoute=path=>path==='/account'||path==='/account/reset';

// Boot bundles and the sign-in screen remain public; platform content does not.
export function protectedPath(path){
 let decoded;try{decoded=decodeURIComponent(path);}catch{return true;}
 if(decoded.includes('\\')||decoded.includes('\0'))return true;
 if(accountRoute(decoded)||decoded.startsWith('/api/auth/')||decoded==='/api/health'||decoded==='/api/access')return false;
 if(decoded.startsWith('/assets/')&&!/^\/assets\/(demo|thumbnails)/.test(decoded))return false;
 if(decoded.startsWith('/_vercel/')||decoded==='/favicon.ico'||decoded==='/robots.txt')return false;
 return true;
}
