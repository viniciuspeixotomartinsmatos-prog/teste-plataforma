import json,collections
for n in ['magic','reactbits']:
 d=json.load(open('research/catalog-a/'+n+'-registry.json',encoding='utf8'))
 print(n,collections.Counter(x['type'] for x in d['items']))
 print('entries',[(x['name'],x.get('title')) for x in d['items'][-8:]])
 if n=='reactbits':print('titles',len(set(x.get('title',x['name']) for x in d['items'])))
