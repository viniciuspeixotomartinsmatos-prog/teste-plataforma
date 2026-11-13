import test from 'node:test';
import assert from 'node:assert/strict';
import {googleNoindex,googleRobotsAccess} from '../src/site-indexability.js';
import {inspectHTML,inspectSite} from '../server/site-audit-inspect.mjs';
import {buildAuditReport,correctionPrompt,allCorrectionsPrompt} from '../src/site-audit-report.js';

const html='<html lang="pt-BR"><head><title>Uma página pública e original</title><meta name="description" content="Uma descrição específica do conteúdo da página pública."><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Página pública</h1></body></html>';
const lab={scores:{performance:95},metrics:{lcp:1800,tbt:80,cls:0},reference:{}};
test('generic and Googlebot noindex/none directives are detected without penalizing another bot',()=>{
 const site=inspectHTML(html.replace('</head>','<meta name="Googlebot" content="noindex, follow"></head>'),'https://example.com/page');
 assert.equal(googleNoindex(site).length,1);assert.match(googleNoindex(site)[0],/googlebot/);
 assert.equal(googleNoindex({robots:'none'}).length,1);
 assert.equal(googleNoindex({reference:{xRobots:'otherbot: noindex, nofollow, googlebot: index'}}).length,0);
 assert.equal(googleNoindex({reference:{xRobots:'googlebot: noindex, nofollow'}}).length,1);
 assert.equal(googleNoindex({reference:{xRobots:'noindex, nofollow'}}).length,1);
});
test('robots checks use Googlebot precedence and longest-path Allow ties, not only Disallow root',()=>{
 const txt='User-agent: *\nDisallow: /\nUser-agent: Googlebot\nDisallow: /private/\nAllow: /private/public/\n';
 assert.equal(googleRobotsAccess(txt,'https://example.com/page').allowed,true);
 assert.equal(googleRobotsAccess(txt,'https://example.com/private/secret').allowed,false);
 assert.equal(googleRobotsAccess(txt,'https://example.com/private/public/info').allowed,true);
 assert.equal(googleRobotsAccess('User-agent: *\nDisallow: /same\nAllow: /same','https://example.com/same').allowed,true);
 assert.equal(googleRobotsAccess('User-agent: BadBot\nDisallow: /','https://example.com/').allowed,true);
 assert.equal(googleRobotsAccess('User-agent: *\nDisallow: /*?*preview=*$','https://example.com/page?preview=1').allowed,false);
 assert.equal(googleRobotsAccess('User-agent: *\nDisallow: /old$','https://example.com/older').allowed,true);
});
test('inspection retains actual URL-specific robots evidence without executing or crawling the domain',async()=>{
 const calls=[];const site=await inspectSite('https://example.com/private/page',{fetcher:async url=>{calls.push(url);return {url,status:200,redirects:[],headers:{'content-type':'text/html'},body:Buffer.from(url.endsWith('robots.txt')?'User-agent: Googlebot\nDisallow: /private/':html)};}});
 assert.equal(site.reference.robotsTxt.googlebot.allowed,false);
 assert.ok(calls.every(url=>['/private/page','/robots.txt','/sitemap.xml'].includes(new URL(url).pathname)));
 const report=buildAuditReport(site,lab),finding=report.findings.find(f=>f.id==='robots');
 assert.equal(finding.severity,'alta');assert.match(correctionPrompt(site,finding),/disallow: \/private\//i);
 assert.match(allCorrectionsPrompt(site,report),/rastreamento desta URL/);
});
test('pixel penalties are light and bounded while noindex has larger SEO impact',()=>{
 const base=inspectHTML(html,'https://example.com/page'),missing=buildAuditReport(base,lab);
 const withPixel=inspectHTML(html.replace('</body>',`<script>fbq('init','123456');fbq('track','PageView');fbq('track','Lead');</script></body>`),'https://example.com/page');
 const present=buildAuditReport(withPixel,lab);
 assert.ok(missing.findings.filter(f=>f.category==='pixel').every(f=>['baixa','ok'].includes(f.severity)));
 assert.equal(missing.categories.find(c=>c.id==='pixel').weight,5);
 assert.equal(missing.categories.find(c=>c.id==='seo').weight,30);
 assert.ok(present.score>=missing.score);assert.ok(present.score-missing.score<=2);
 const blocked=buildAuditReport({...base,robots:'noindex',robotsDirectives:[{name:'robots',content:'noindex'}]},lab);
 assert.ok(missing.score-blocked.score>present.score-missing.score);
 assert.equal(blocked.findings.find(f=>f.id==='indexavel').severity,'alta');
});
test('Google index state stays unknown and normal redirects have no score penalty',()=>{
 const site=inspectHTML(html,'https://example.com/page'),report=buildAuditReport(site,lab);
 const normal=buildAuditReport({...site,redirects:[{status:301,from:'https://example.com/old',to:site.url}]},lab);
 assert.equal(normal.score,report.score);
 const unknown=report.findings.find(f=>f.id==='google-index-status');
 assert.equal(unknown.status,'info');assert.equal(unknown.weight,0);assert.equal(report.indexation.googleStatus,'not-verified');
 assert.match(correctionPrompt(site,unknown),/Rastreada, mas não indexada/);
 assert.equal(report.findings.find(f=>f.id==='robots').status,'info');
 assert.equal(buildAuditReport(site).score,null);
});

