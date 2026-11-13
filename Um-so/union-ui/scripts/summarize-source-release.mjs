// Source acquisition evidence is distinct from approval to publish.
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const app=fileURLToPath(new URL('../',import.meta.url)),date=process.argv[2]||'2026-11-12';if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid date');
const root=path.resolve(app,'../research/source-checks/releases',date),read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const redact=text=>text.replace(/([?&](?:api_?key|token|secret|authorization|auth)=)[^\s"'&<>]+/gi,'$1REDACTED');
let scrubbed=0;
for(const filename of await fs.readdir(path.join(root,'21st'))){if(!filename.endsWith('.json'))continue;const file=path.join(root,'21st',filename),record=await read(file);delete record.quota;
 for(const target of [record.metadata,record.component])if(typeof target?.installCommand==='string')target.installCommand=redact(target.installCommand);
 record.credentialQueries='Removed from retrieval/install metadata; source notices preserved.';await fs.writeFile(file,JSON.stringify(record,null,2)+'\n');scrubbed++;
}
const routes=new Map();for(const filename of (await fs.readdir(path.join(root,'batches'))).sort()){const batch=await read(path.join(root,'batches',filename));for(const record of Array.isArray(batch)?batch:batch.results||batch.records||[])routes.set(record.route,record);}
const stage=await read(path.join(root,'21st-stage-report.json')),registry=await read(path.join(root,'registry-stage-report.json')),profitize=await read(path.join(root,'profitize/stage-report.json'));
// Author-scoped metadata may use /community/ aliases. Apply the exact
// author/slug recheck last rather than treating a canonical URL alias as absent.
const aliasFile=path.join(root,'batches/noncomponent-alias-recheck.json');
try{for(const record of await read(aliasFile))routes.set(record.route,record);}catch(error){if(error.code!=='ENOENT')throw error;}
const report={checkedAt:new Date().toISOString(),published:0,scope:'Retained and compiled candidates only. No new candidate has completed all authorized browser, media, interaction, prompt and portable-download acceptance gates.',sources:{'21st':{observedRoutes:routes.size,retained:[...routes.values()].filter(row=>row.status==='retained_unvalidated').length,unresolved:[...routes.values()].filter(row=>row.status!=='retained_unvalidated').length,compiled:stage.results.filter(row=>row.status==='compiled').length,compileBlocked:stage.results.filter(row=>row.status==='blocked').length},registry:{compiled:registry.results.filter(row=>row.status==='compiled').length,compileBlocked:registry.results.filter(row=>row.status==='blocked').length,unchangedMagicExamples:2},aceternity:{blocked:['burn-carousel','liquid-carousel','pixel-prompt-button'],reason:'All-Access required; user confirms unavailable. No purchase or access bypass.'},profitize:{staged:profitize.candidates,quotaBlocked:profitize.quotaBlocked,videoReferences:5,interactiveOriginalSource:1}},browser:{verified:['Skills one-column at390px, exactly one Caveman family','Design Systems separate,9 cards,24x24 palette swatches, no horizontal overflow','Vistal original video readyState4,960x600,autoplay progressing after asset-bridge correction'],remaining:'Prompt/download/full six-item acceptance incomplete: browser kernel reset on download wait and subsequent calls fail to write kernel assets.'},routes:[...routes.values()]};
report.sources['21st'].retainedThemes=[...routes.values()].filter(row=>row.status==='retained_theme_unvalidated').length;
report.sources['21st'].templateMetadataOnly=[...routes.values()].filter(row=>row.status==='template_metadata_only').length;
report.sources['21st'].unresolved=[...routes.values()].filter(row=>row.status==='metadata_unresolved').length;
await fs.writeFile(path.join(root,'release-status.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,routes:undefined,browser:undefined,scrubbed}));
