export function safeNext(value,fallback='/'){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return fallback;
 try{const url=new URL(value,'https://umso.invalid');return url.origin==='https://umso.invalid'&&!url.pathname.startsWith('/api/')?url.pathname+url.search+url.hash:fallback;}catch{return fallback;}
}
export const accountRoute=path=>path==='/account'||path==='/account/reset';

// Boot bundles and the sign-in screen remain public; platform content does not.
export function protectedPath(path){
 let decoded;try{decoded=decodeURIComponent(path);}catch{return true;}
 if(decoded.includes('\\')||decoded.includes('\0'))return true;
 if(/^\/legal\/(privacy|cookies|terms|refunds|provider|rights|licenses|ai)\/?$/.test(decoded))return false;
 if(/^\/(pt|en)\/(?:contact\/|terms\/|privacy\/|refunds\/)?$/.test(decoded)||/^\/(pt|en)$/.test(decoded)||decoded==='/sitemap.xml')return false;
 if(decoded==='/plans'||decoded==='/billing'||decoded==='/api/billing/config'||decoded==='/api/billing/webhook')return false;
 if(accountRoute(decoded)||decoded.startsWith('/api/auth/')||decoded==='/api/health'||decoded==='/api/access')return false;
 // Only boot assets are public. Catalog media, studio files and recovered
 // release assets are account content even when their URLs are guessable.
 if(/^\/assets\/(?:auth\/(?:cosmic-login\.png|[^/]+\.(?:svg|webp|png))|fonts\/[^/]+\.(?:woff2?|ttf)|union-icon\.svg|marketing\.(?:css|js)|[A-Za-z][A-Za-z0-9_-]*-[A-Za-z0-9_-]{8,}\.(?:js|css))$/.test(decoded))return false;
 if(decoded.startsWith('/_vercel/')||decoded==='/favicon.ico'||decoded==='/robots.txt')return false;
 return true;
}
