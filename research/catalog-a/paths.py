import json
for n in ['reactbits','magic']:
 t=json.load(open('research/catalog-a/'+n+'-tree.json'))['tree']
 paths=[x['path'] for x in t if x['type']=='blob']
 print(n,'\n'.join(p for p in paths if any(v in p.lower() for v in ['sidebar','navigation','category','nav-config']) )[:4000])
 print('docs', '\n'.join(p for p in paths if p.endswith(('.mdx','.md')) and 'docs' in p)[:2200])
