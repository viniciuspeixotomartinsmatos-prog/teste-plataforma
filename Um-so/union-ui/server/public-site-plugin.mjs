import {renderLibrary,librarySitemap,libraryRoutes} from './public-library.mjs';
import {publicRoutes,renderPublicPage,publicSitemap} from './public-site.mjs';
import {legalRoutes,renderLegalPage} from './legal-pages.mjs';
export function publicSitePlugin(){
 return{name:'nitido-public-site',configureServer(server){server.middlewares.use((req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method))return next();
  const pathname=new URL(req.url,'http://localhost').pathname;
  const content=pathname==='/sitemap.xml'?publicSitemap():pathname==='/library-sitemap.xml'?librarySitemap():renderLibrary(pathname)??renderLegalPage(pathname)??renderPublicPage(pathname);
  if(content===null)return next();
  res.setHeader('Content-Type',pathname.endsWith('sitemap.xml')?'application/xml; charset=utf-8':'text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?'':content);
 });},generateBundle(){
  for(const route of libraryRoutes())this.emitFile({type:'asset',fileName:route.slice(1)+'index.html',source:renderLibrary(route)});
  this.emitFile({type:'asset',fileName:'library-sitemap.xml',source:librarySitemap()});
  for(const route of publicRoutes)this.emitFile({type:'asset',fileName:route.slice(1)+'index.html',source:renderPublicPage(route)});
  for(const route of legalRoutes)this.emitFile({type:'asset',fileName:route.slice(1)+'/index.html',source:renderLegalPage(route)});
  this.emitFile({type:'asset',fileName:'sitemap.xml',source:publicSitemap()});
 }};
}
