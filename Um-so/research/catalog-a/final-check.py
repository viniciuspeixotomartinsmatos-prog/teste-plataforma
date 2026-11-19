import json,collections,os
from pathlib import Path
r=Path('research/catalog-a');c=json.load(open(r/'catalog.json',encoding='utf8'));note=json.load(open(r/'coverage.json',encoding='utf8'));note['counts']['thumbnails']=sum('thumbnailLocal'in x for x in c);note['sources'][2]['publicCodeComponents']=sum(x['sourceId']=='aceternity' and bool(x.get('files')) for x in c);note['sources'][2]['renderedExampleFiles']=182;note['sources'][2]['withoutPublicCode']=[x['slug'] for x in c if x['sourceId']=='aceternity' and not x.get('files')];note['sources'][2]['coverage']+=' Also extracted public code blocks and 182 examples from docs without executing page scripts.';(r/'coverage.json').write_text(json.dumps(note,indent=2),encoding='utf8')
print('Aceternity without public code',note['sources'][2]['withoutPublicCode'])
print('Missing pointers',[(x['id'],x.get('codeFile')) for x in c if x.get('codeFile') and not (r/x['codeFile']).exists()][:10])
print('Registry bytes',sum(p.stat().st_size for p in (r/'code').rglob('*.json')))
