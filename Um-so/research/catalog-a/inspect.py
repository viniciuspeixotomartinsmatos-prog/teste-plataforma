import json,re
for n in ['magic','reactbits']:
 t=json.load(open('research/catalog-a/'+n+'-tree.json'))
 paths=[x['path'] for x in t['tree'] if x['type']=='blob']
 print('\n'+n)
 print('\n'.join(p for p in paths if p.endswith(('registry.json','navigation.ts','navigation.js','sidebar.ts','sidebar.js','LICENSE','LICENSE.md'))))
 print('registry examples','\n'.join(p for p in paths if '/r/' in p and p.endswith('.json'))[:1600])
h=open('research/catalog-a/aceternity-home.html',encoding='utf-8-sig').read()
print('Aceternity components',sorted(set(re.findall(r'/components/([a-z0-9-]+)',h))))
