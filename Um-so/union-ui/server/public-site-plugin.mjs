import {publicRoutes,renderPublicPage,publicSitemap} from './public-site.mjs';
export function publicSitePlugin(){
 return{name:'nitido-public-site',configureServer(server){server.middlewares.use((req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method))return next();
  const pathname=new URL(req.url,'http://localhost').pathname;
  const content=pathname==='/sitemap.xml'?publicSitemap():renderPublicPage(pathname);
  if(content===null)return next();
  res.setHeader('Content-Type',pathname==='/sitemap.xml'?'application/xml; charset=utf-8':'text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?'':content);
 });},generateBundle(){
  for(const route of publicRoutes)this.emitFile({type:'asset',fileName:route.slice(1)+'index.html',source:renderPublicPage(route)});
  this.emitFile({type:'asset',fileName:'sitemap.xml',source:publicSitemap()});
 }};
}
