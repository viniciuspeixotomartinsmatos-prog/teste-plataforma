import json,re,urllib.request
for n in ['magic','reactbits']:
 d=json.load(open('research/catalog-a/'+n+'-registry.json',encoding='utf8'))
 print(n,len(d['items']),str(d['items'][0])[:1400])
h=open('research/catalog-a/aceternity-components.html',encoding='utf8').read()
slugs=sorted(set(re.findall(r'/components/([a-z0-9-]+)',h)))
print('Aceternity',len(slugs),slugs[:12])
open('research/catalog-a/aceternity-slugs.json','w').write(json.dumps(slugs))
for u in ['https://ui.aceternity.com/registry/3d-card.json','https://ui.aceternity.com/registry/3d-card-effect.json']:
 try:
  r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20);b=r.read();print(u,len(b),b[:70])
  open('research/catalog-a/aceternity-'+u.rsplit('/',1)[1],'wb').write(b)
 except Exception as e:print(e)
