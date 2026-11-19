import re,json,urllib.request,concurrent.futures
from pathlib import Path
root=Path('research/catalog-a');catalog=json.load(open(root/'catalog.json',encoding='utf8'));paths={x['path'] for x in json.load(open(root/'reactbits-tree.json'))['tree'] if x['type']=='blob'}
def fetch(url,p):
 try:
  if p.exists():return True
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:b=r.read()
  p.parent.mkdir(exist_ok=True,parents=True);p.write_bytes(b);return True
 except Exception:return False
# Every public Aceternity source/example rendered in its docs, without evaluating page scripts.
examples_count=0
for c in catalog:
 if c['sourceId']!='aceternity':continue
 p=root/'pages'/('aceternity-'+c['slug']+'.html')
 if not p.exists():continue
 s=p.read_text(encoding='utf8');seen=set();ui=[];examples=[]
 for m in re.finditer(r'__rawString__:"((?:\\.|[^"\\])*)"',s):
  before=s[max(0,m.start()-800):m.start()];pm=list(re.finditer(r'__src__:"([^"\n]+)"',before))
  if not pm:continue
  path=pm[-1].group(1)
  if not path.endswith(('.tsx','.ts','.jsx','.js','.css')):continue
  raw=m.group(1)
  try:content=json.loads('"'+re.sub(r'\\x([0-9a-fA-F]{2})',lambda m:chr(int(m.group(1),16)),raw)+'"')
  except Exception:continue
  if len(content)<120 or (path,content) in seen:continue
  seen.add((path,content));record={'path':path,'type':'registry:example' if '/example/' in path else 'registry:ui','content':content}
  if '/example/' in path:examples.append(record)
  else:ui.append(record)
 if examples:
  rel='code/aceternity/'+c['slug']+'-examples.json';(root/rel).write_text(json.dumps({'name':c['slug']+'-examples','type':'registry:example','files':examples},ensure_ascii=False,indent=2),encoding='utf8');c['examples']=[{'name':c['slug']+'-examples','codeFile':rel}];examples_count+=len(examples)
 if not c.get('files') and ui:
  rel='code/aceternity/'+c['slug']+'-docs-source.json';(root/rel).write_text(json.dumps({'name':c['slug'],'type':'registry:ui','files':ui},ensure_ascii=False,indent=2),encoding='utf8');c['files']=ui;c['codeFile']=rel;c['availability']='code'
# Real React Bits preview WebPs, matching files proven by public repository inventory.
jobs=[]
for c in catalog:
 if c['sourceId']!='reactbits':continue
 key=re.sub(r'[^a-z0-9]','',c['name'].lower());src='public/assets/video/'+key+'.webp'
 if src in paths:jobs.append((c,src))
def dl(item):
 c,src=item;rel='assets/'+c['id']+'.webp';url='https://raw.githubusercontent.com/DavidHDev/react-bits/main/'+src
 if fetch(url,root/rel):c['thumbnailLocal']=rel;c['thumbnailUrl']=url
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:list(ex.map(dl,jobs))
(root/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf8');(root/'catalog-light.json').write_text(json.dumps([{k:v for k,v in c.items() if k!='files'} for c in catalog],ensure_ascii=False,indent=2),encoding='utf8')
print('Extracted Aceternity examples',examples_count,'all code availability',sum(c['sourceId']=='aceternity' and bool(c.get('files')) for c in catalog),'ReactBits preview files',len(jobs),'all thumbnails',sum('thumbnailLocal'in c for c in catalog))
