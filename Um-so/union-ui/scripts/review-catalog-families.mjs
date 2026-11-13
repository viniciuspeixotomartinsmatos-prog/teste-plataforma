// Whole-inventory source comparison, not a preview sweep. No source is executed,
// no item is deleted and near matches are never automatically consolidated.
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
import{packageEvidence}from'./lib/catalog-package-evidence.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),codeRoot=path.join(root,'public/code')+path.sep;
const catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/catalog-live.json'),'utf8'));
const exact=new Map(),near=new Map(),reviewed=[],skipped=[];
for(const row of catalog){
 const pointer=row.originalCodePath||row.codePath;if(!pointer?.startsWith('/code/')){skipped.push({id:row.id,reason:'no_original_package'});continue;}
 const file=path.resolve(root,'public','.'+pointer);if(!file.startsWith(codeRoot)){skipped.push({id:row.id,reason:'invalid_package_path'});continue;}
 try{
  if((await fs.stat(file)).size>2500000){skipped.push({id:row.id,reason:'large_package_requires_review'});continue;}
  const evidence=packageEvidence(row,JSON.parse(await fs.readFile(file,'utf8')));if(!evidence){skipped.push({id:row.id,reason:'no_standalone_primary_source'});continue;}
  const record={id:row.id,name:row.name,sourceId:row.sourceId,...evidence};reviewed.push(record);
  for(const [index,key]of [[exact,evidence.packageHash],[near,evidence.primaryHash]])if(key){if(!index.has(key))index.set(key,[]);index.get(key).push(record);}
 }catch(error){skipped.push({id:row.id,reason:error.code==='ENOENT'?'source_missing':'package_requires_review'});}
}
const groups=[...exact].filter(([,rows])=>rows.length>1).map(([fingerprint,rows])=>({id:'source-package:'+fingerprint.slice(0,16),fingerprint,ids:rows.map(row=>row.id).sort(),evidence:'same-complete-text-package-and-dependency-license-framework-scope',scope:rows[0].scope}));
const candidates=[...near].filter(([,rows])=>rows.length>1&&new Set(rows.map(row=>row.packageHash)).size>1).map(([fingerprint,rows])=>({fingerprint,ids:rows.map(row=>row.id),reason:'Primary source tokens match; package, demo, dependencies or license differ. Preserve separately pending human review.'}));
const report={checkedAt:new Date().toISOString(),scope:'Source/package comparison only; no runtime-equivalence, authorship or license-clearance certification.',total:catalog.length,reviewed:reviewed.length,exactGroups:groups.length,nearGroups:candidates.length,groups,candidates,skipped};
await fs.mkdir(path.join(root,'reports'),{recursive:true});
await fs.writeFile(path.join(root,'reports/catalog-source-families.json'),JSON.stringify({...report,skipped:undefined,skipCounts:skipped.reduce((counts,row)=>(counts[row.reason]=(counts[row.reason]||0)+1,counts),{})},null,2)+'\n');
await fs.mkdir(path.join(root,'var/audits'),{recursive:true});await fs.writeFile(path.join(root,'var/audits/catalog-package-families.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({total:catalog.length,reviewed:reviewed.length,exactGroups:groups.length,nearGroups:candidates.length,skipped:skipped.length,deleted:0}));
