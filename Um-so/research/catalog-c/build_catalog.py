from __future__ import annotations
import concurrent.futures as cf
import collections
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import time
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parent.parent
CODE = ROOT / 'code'
ASSETS = ROOT / 'assets'
CODE.mkdir(exist_ok=True)
ASSETS.mkdir(exist_ok=True)
USER_AGENT = 'Mozilla/5.0 (compatible; catalog-reconstruction/1.0)'

def request(url, binary=False):
    with urlopen(Request(url, headers={'User-Agent': USER_AGENT}), timeout=25) as response:
        data = response.read()
        return data if binary else data.decode('utf-8-sig')

def decode(value):
    if isinstance(value, list) and value and isinstance(value[0], int):
        if value[0] == 0:
            return decode(value[1]) if len(value) > 1 else None
        if value[0] == 1:
            return [decode(x) for x in value[1]] if len(value)>1 else []
    if isinstance(value, dict):
        return {key:decode(v) for key,v in value.items()}
    return value

class Islands(HTMLParser):
    def __init__(self):
        super().__init__()
        self.islands=[]
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag=='astro-island' and attrs.get('props'):
            try:
                self.islands.append((attrs.get('component-export'),decode(json.loads(attrs['props']))))
            except (json.JSONDecodeError, TypeError):
                pass

def islands(text):
    parser=Islands();parser.feed(text);return parser.islands

def human(slug):
    return re.sub(r'(?<=[a-zA-Z])(?=\d)', ' ', slug.replace('-',' ').replace('_',' ')).title()

def relative(path):
    return path.relative_to(WORKSPACE).as_posix()

def save_code(entry, files):
    bundle=[]
    for i,f in enumerate(files):
        content=f.get('content','')
        if not isinstance(content,str):continue
        path=f.get('path') or f.get('name') or 'component.tsx'
        bundle.append({'path':path,'content':content})
    if not bundle:return
    output=CODE/(entry['id']+'.json')
    output.write_text(json.dumps({'files':bundle},ensure_ascii=False),encoding='utf-8')
    entry['codePath']=relative(output)
    entry['availability']='local'
    entry['fileCount']=len(bundle)

def build_animate():
    repo=ROOT/'animate-repo'
    v2=repo/'apps/v2'
    registry=v2/'registry'
    result=[];known=set()
    for meta in sorted(registry.rglob('meta.json')):
        parts=meta.parent.relative_to(registry).parts
        props=json.loads(meta.read_text())
        slug='/'.join(parts)
        ident='animate-'+slug.replace('/','-')
        framework='vue' if parts[0]=='vue' else 'react'
        category=parts[1] if framework=='vue' and len(parts)>1 else parts[0]
        entry={'id':ident,'sourceId':'animate','name':props.get('title') or human(parts[-1]),'slug':slug,
               'description':props.get('description') or '', 'category':category,
               'url':'https://animate-ui.com/docs/'+slug,
               'codeUrl':'https://github.com/imskyleen/animate-ui/tree/main/apps/v2/registry/'+slug,
               'install':'npx shadcn@latest add https://animate-ui.com/r/'+slug.replace('/','-')+'.json',
               'tags':['animation',framework,category,parts[-1]],'availability':'external','framework':framework,
               'license':'MIT + Commons Clause','kind':'icon' if category=='icons' else 'component'}
        files=[]
        for file in sorted(meta.parent.rglob('*')):
            if file.is_file() and file.suffix in ['.tsx','.ts','.vue','.css']:
                files.append({'path':file.relative_to(meta.parent).as_posix(),'content':file.read_text(encoding='utf-8')})
        save_code(entry,files)
        preview=v2/'public/previews'/Path(*parts).parent/(parts[-1]+'-dark.jpg')
        if not preview.exists():preview=v2/'public/previews'/Path(*parts).parent/(parts[-1]+'-light.jpg')
        if preview.exists():
            target=ASSETS/(ident+'.jpg');shutil.copy2(preview,target);entry['localImagePath']=relative(target)
            entry['image']='https://animate-ui.com/previews/'+preview.relative_to(v2/'public/previews').as_posix()
        result.append(entry);known.add(slug)
    # Package primitives are described by MDX pages separately from standalone registry entries.
    docs=v2/'content/docs'
    for mdx in sorted(docs.rglob('*.mdx')):
        path=mdx.relative_to(docs).with_suffix('').as_posix()
        if not any(s in path for s in ['primitives/','backgrounds/']):continue
        if path in known:continue
        text=mdx.read_text(encoding='utf-8')
        title=re.search(r'^title:\s*(.+)$',text,re.M)
        desc=re.search(r'^description:\s*(.+)$',text,re.M)
        if not title:continue
        framework='vue' if path.startswith('vue/') else 'react'
        slug=path
        ident='animate-'+slug.replace('/','-')
        entry={'id':ident,'sourceId':'animate','name':title.group(1).strip("'\""),'slug':slug,
               'description':desc.group(1).strip("'\"") if desc else '',
               'category':'primitives' if '/primitives/' in '/'+path else 'backgrounds',
               'url':'https://animate-ui.com/docs/'+path,
               'codeUrl':'https://github.com/imskyleen/animate-ui/tree/main/packages/'+framework+'/src',
               'install':'npm install @animate-ui/'+framework+' motion',
               'tags':['animation',framework,path.split('/')[-1]],'availability':'external','framework':framework,
               'license':'MIT + Commons Clause','kind':'component'}
        package_imports=re.findall(r'@animate-ui/'+framework+r'/([^\s\'";]+)',text)
        files=[]
        for imp in dict.fromkeys(package_imports):
            candidate=repo/'packages'/framework/'src'/imp
            if candidate.is_dir():
                for f in candidate.rglob('*'):
                    if f.is_file() and f.suffix in ['.tsx','.ts','.vue','.css']:
                        files.append({'path':f.relative_to(repo/'packages'/framework/'src').as_posix(),'content':f.read_text(encoding='utf-8')})
            elif candidate.with_suffix('.tsx').exists():
                f=candidate.with_suffix('.tsx');files.append({'path':imp+'.tsx','content':f.read_text(encoding='utf-8')})
        save_code(entry,files)
        # A readable usage example is also retained independently of the full source.
        snippets=re.findall(r'```(?:tsx|jsx|vue)\n(.*?)```',text,re.S)
        if snippets:entry['usage']=snippets[0]
        preview=v2/'public/previews'/Path(path).parent/(Path(path).name+'-dark.jpg')
        if preview.exists():
            target=ASSETS/(ident+'.jpg');shutil.copy2(preview,target);entry['localImagePath']=relative(target)
            entry['image']='https://animate-ui.com/previews/'+preview.relative_to(v2/'public/previews').as_posix()
        result.append(entry)
    return result

def sitemap_urls():
    return [x.text for x in ET.parse(ROOT/'shadcn-sitemap.xml').getroot().iter() if x.tag.endswith('loc')]

def build_shadcn():
    urls=sitemap_urls()
    categories=[u for u in urls if len(u.split('/'))==5 and u.split('/')[3] in ['blocks','components','pages','themes','templates'] and u.split('/')[-1]!='free']
    collected={};errors=[]
    def fetch_category(url):
        try:
            data=request(url)
            all_items=[]
            for export,props in islands(data):
                if export in ['Blocks','Components','Pages','Themes','Templates']:
                    for key in ['blocks','components','pages','themes','templates']:
                        if isinstance(props.get(key),list):all_items.extend(props[key])
            return url,all_items,None
        except Exception as e:return url,[],str(e)
    with cf.ThreadPoolExecutor(max_workers=10) as pool:
        for i,(url,items,error) in enumerate(pool.map(fetch_category,categories)):
            if error:errors.append({'url':url,'error':error})
            for item in items:
                if isinstance(item,dict) and item.get('id'):
                    attrs=item.get('attrs') or {}
                    kind=attrs.get('type') or ('component' if '/components/' in url else 'block')
                    item['_kind']=kind;item['_category_url']=url
                    collected[(kind,item['id'])]=item
            if i%20==0:print('categories',i,'items',len(collected),flush=True)
    # Include every sitemap content URL, even if its listing was unavailable.
    for url in urls:
        parts=url.split('/')[3:]
        if parts and parts[0] in ['block','component','page','theme','template'] and len(parts)>=2:
            key=(parts[0],parts[-1])
            if key not in collected:
                collected[key]={'id':parts[-1],'title':human(parts[-1]),'_kind':parts[0],
                                '_category_url':url,'_url':url,'metadataCoverage':'sitemap-only',
                                'attrs':{'group':[parts[1] if len(parts)>2 else re.sub(r'\d.*$','',parts[-1])]}}
    free={}
    for export,props in islands((ROOT/'shadcn-free.html').read_text(encoding='utf-8-sig')):
        if export=='Blocks':
            for item in props.get('blocks',[]):
                if isinstance(item,dict) and item.get('id'):free[item['id']]=item
    (ROOT/'shadcn-raw-metadata.json').write_text(json.dumps(list(collected.values()),ensure_ascii=False),encoding='utf-8')
    result=[]
    for (kind,slug),props in sorted(collected.items()):
        attrs=props.get('attrs') or {}
        category=(attrs.get('group') or ['components'])[0]
        access=props.get('access') or ('free' if slug in free else 'unknown')
        # The free listing is the authority for current free availability.
        if kind=='block' and slug in free:access='free'
        ident='shadcnblocks-'+kind+'-'+slug
        if kind=='component':
            url='https://www.shadcnblocks.com/component/'+str(category)+'/'+slug
        else:url='https://www.shadcnblocks.com/'+kind+'/'+slug
        entry={'id':ident,'sourceId':'shadcnblocks','name':props.get('title') or human(slug),'slug':slug,
               'description':props.get('description') or '', 'category':category,'url':props.get('_url') or url,
               'codeUrl':'https://www.shadcnblocks.com/r/'+slug,
               'install':'npx shadcn@latest add @shadcnblocks/'+slug,
               'tags':list(dict.fromkeys([str(x) for x in [kind,category,attrs.get('subGroup'),access] if x])),
               'availability':'external' if access in ['free','unknown'] else 'pro',
               'access':access,'kind':kind,'license':'MIT + Commons Clause',
               'metadataCoverage':props.get('metadataCoverage','public-listing')}
        if kind in ['block','component']:
            entry['image']='https://cdn.shadcnblocks.com/shadcnblocks/screenshots/'+kind+'/'+slug+'-4x3.webp'
        if props.get('publishedAt'):entry['publishedAt']=props['publishedAt']
        result.append(entry)
    by_slug={entry['slug']:entry for entry in result if entry['kind']=='block'}
    # All current publicly free registry bundles are fetched without credentials.
    def fetch_free(slug):
        entry=by_slug.get(slug)
        if not entry:return slug,'not-indexed'
        try:
            response=json.loads(request('https://www.shadcnblocks.com/r/'+slug))
            if isinstance(response,dict) and isinstance(response.get('files'),list):
                save_code(entry,response['files'])
                if response.get('dependencies'):entry['dependencies']=response['dependencies']
                if response.get('registryDependencies'):entry['registryDependencies']=response['registryDependencies']
                if response.get('description'):entry['description']=response['description']
                return slug,None
            return slug,'no-files'
        except Exception as e:return slug,str(e)
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        free_results=list(pool.map(fetch_free,free))
    errors.extend({'url':'https://www.shadcnblocks.com/r/'+slug,'error':error} for slug,error in free_results if error)
    # The official free repository is a second locally retained source.
    for file in (ROOT/'shadcn-repo/src/block').glob('*.tsx'):
        entry=by_slug.get(file.stem)
        if entry and 'codePath' not in entry:
            save_code(entry,[{'path':'components/'+file.name,'content':file.read_text(encoding='utf-8')}])
    (ROOT/'errors.json').write_text(json.dumps(errors,indent=2),encoding='utf-8')
    return result

def main():
    animate=build_animate()
    (ROOT/'animate-catalog.json').write_text(json.dumps(animate,ensure_ascii=False),encoding='utf-8')
    print('animate',len(animate),flush=True)
    shadcn=build_shadcn()
    all_items=animate+shadcn
    (ROOT/'catalog.json').write_text(json.dumps(all_items,ensure_ascii=False),encoding='utf-8')
    counts={source:{'items':len(items),'localSource':sum('codePath' in x for x in items),'localImages':sum('localImagePath' in x for x in items),'kinds':dict(collections.Counter(x.get('kind') for x in items))} for source,items in [('animate',animate),('shadcnblocks',shadcn)]}
    (ROOT/'summary.json').write_text(json.dumps(counts,indent=2),encoding='utf-8')
    print(json.dumps(counts),flush=True)

if __name__=='__main__':main()
