import json,re,urllib.request,concurrent.futures
from pathlib import Path
r=Path('research/catalog-a');c=json.load(open(r/'catalog.json',encoding='utf8'));paths=[x['path'] for x in json.load(open(r/'reactbits-tree.json'))['tree'] if x['type']=='blob' and x['path'].startswith('src/demo/') and x['path'].endswith(('.jsx','.tsx'))];bybase={re.sub('[^a-z0-9]','',p.rsplit('/',1)[1].split('.')[0].removesuffix('Demo').lower()):p for p in paths};jobs=[]
for item in c:
 if item['sourceId']=='reactbits':
  key=re.sub('[^a-z0-9]','',item['name'].lower())
  if key in bybase:jobs.append((item,bybase[key]))
def dl(j):
 item,p=j;rel='code/reactbits/'+item['slug']+'-demo-source.json';f=r/rel
 try:
  if f.exists():d=json.loads(f.read_text(encoding='utf8'))
  else:
   with urllib.request.urlopen('https://raw.githubusercontent.com/DavidHDev/react-bits/main/'+p,timeout=25) as resp:content=resp.read().decode('utf8')
   d={'name':item['slug']+'-demo','type':'registry:example','files':[{'path':p,'type':'registry:example','content':content}]};f.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
  item['examples']=[{'name':item['slug']+'-demo','codeFile':rel}];return True
 except Exception:return False
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:results=list(ex.map(dl,jobs))
(r/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf8');(r/'catalog-light.json').write_text(json.dumps([{k:v for k,v in x.items() if k!='files'} for x in c],ensure_ascii=False,indent=2),encoding='utf8');coverage=json.load(open(r/'coverage.json',encoding='utf8'));coverage['sources'][1]['exampleFiles']=sum(results);(r/'coverage.json').write_text(json.dumps(coverage,indent=2),encoding='utf8');print('React Bits demo source files',sum(results),len(jobs))
