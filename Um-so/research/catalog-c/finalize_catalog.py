from pathlib import Path
import collections
import concurrent.futures as cf
import json,re
from urllib.request import Request,urlopen

ROOT=Path(__file__).resolve().parent
WORKSPACE=ROOT.parent.parent
data=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
animate=[x for x in data if x['sourceId']=='animate']
docs=ROOT/'animate-repo/apps/v2/content/docs'
docmap={}
titlemap={}
for mdx in docs.rglob('*.mdx'):
    content=mdx.read_text(encoding='utf-8')
    url='https://animate-ui.com/docs/'+mdx.relative_to(docs).with_suffix('').as_posix()
    title=re.search(r'^title:\s*(.+)$',content,re.M)
    if title:titlemap[(mdx.relative_to(docs).parts[0]=='vue',title.group(1).strip("'\""))]=url
    for name in re.findall(r'(?:Vue)?RegistryInstallation\s+name="([^"]+)"',content):
        docmap[(mdx.relative_to(docs).parts[0]=='vue',name)]=url
for entry in animate:
    parts=entry['slug'].split('/')
    vue=entry.get('framework')=='vue'
    base=parts[1:] if vue else parts
    registry_name='-'.join(base)
    if entry['category'] in ['icons','hugeicons']:
        entry['kind']='icon'
        entry['url']='https://animate-ui.com/docs/'+('vue/' if vue else '')+'icons/'+('hugeicons' if entry['category']=='hugeicons' else 'lucide-icons')
        entry['tags']=list(dict.fromkeys(entry['tags']+['icon']))
    elif entry['category']!='primitives':
        entry['url']=docmap.get((vue,registry_name)) or titlemap.get((vue,entry['name'])) or 'https://animate-ui.com/docs'
    if entry['category']!='primitives':
        entry['codeUrl']='https://animate-ui.com/r/'+('vue/' if vue else '')+registry_name+'.json'
        entry['install']=('npx shadcn-vue@latest add ' if vue else 'npx shadcn@latest add ')+entry['codeUrl']

shadcn_raw=[x for x in data if x['sourceId']=='shadcnblocks']
canonical={}
for entry in shadcn_raw:
    if entry['kind']=='component' and entry.get('metadataCoverage')=='sitemap-only':continue
    if entry['kind']=='example':
        entry['kind']='component'
        category=entry['category'];slug=entry['slug']
        if '/' in slug:
            category,leaf=slug.split('/',1)
        else:leaf=slug
        entry['id']='shadcnblocks-component-'+slug.replace('/','-')
        entry['url']='https://www.shadcnblocks.com/component/'+category+'/'+leaf
        entry['image']='https://cdn.shadcnblocks.com/shadcnblocks/screenshots/component/'+category+'/'+leaf+'-4x3.webp'
        entry['tags']=[x if x!='example' else 'component' for x in entry['tags']]
    canonical[(entry['kind'],entry['slug'])]=entry
shadcn=list(canonical.values())
free=[x for x in shadcn if 'codePath' in x]
def download_preview(entry):
    target=ROOT/'assets'/(entry['id']+'.webp')
    try:
        with urlopen(Request(entry['image'],headers={'User-Agent':'Mozilla/5.0'}),timeout=18) as response:
            content=response.read()
        if content[:4] not in [b'RIFF',b'\xff\xd8\xff\xe0',b'\x89PNG'] and len(content)<200: return False
        target.write_bytes(content)
        entry['localImagePath']=target.relative_to(WORKSPACE).as_posix()
        return True
    except Exception:return False
with cf.ThreadPoolExecutor(max_workers=8) as pool:
    results=list(pool.map(download_preview,free))
result=animate+shadcn
(ROOT/'catalog.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
(ROOT/'animate-catalog.json').write_text(json.dumps(animate,ensure_ascii=False),encoding='utf-8')
summary={source:{'items':len(items),'localSource':sum('codePath' in x for x in items),'localImages':sum('localImagePath' in x for x in items),'kinds':dict(collections.Counter(x.get('kind') for x in items))} for source,items in [('animate',animate),('shadcnblocks',shadcn)]}
(ROOT/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
print(json.dumps(summary))
