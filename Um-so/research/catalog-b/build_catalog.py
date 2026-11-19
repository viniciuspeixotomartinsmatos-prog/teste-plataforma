from pathlib import Path
import json, re, shutil, collections

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'code'
OUT.mkdir(exist_ok=True)
CAT = []

def title(value):
    return re.sub(r'[-_]+', ' ', value).title().replace('Ai ', 'AI ').replace('Ui ', 'UI ')

def category(name, fallback='Components'):
    n=name.lower()
    for words, cat in [(['hero'], 'Heroes'),(['background','shader','caustic'], 'Backgrounds'),(['text','type','scrambl','shimmer','number'], 'Text effects'),(['button'], 'Buttons'),(['input','textarea','form','search'], 'Inputs'),(['card','bento'], 'Cards'),(['nav','menu','toolbar','dock','tab','sidebar'], 'Navigation'),(['dialog','modal','popover','drawer'], 'Overlays'),(['accordion','faq'], 'Accordions'),(['chat','ai-','agent','token','model'], 'AI components'),(['gallery','carousel','slider','image'], 'Media'),(['pricing'], 'Pricing'),(['testimonial'], 'Testimonials'),(['footer'], 'Footers'),(['feature','content','integrat','logo-cloud'], 'Sections')]:
        if any(w in n for w in words): return cat
    return fallback

def read(p):
    return p.read_text(encoding='utf-8') if p.is_file() else ''

def json_save(path, data):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

def write_record(record, files, demo=None):
    record['codePath'] = f'research/catalog-b/code/{record["id"]}.json'
    record['license'] = 'MIT'
    record['hasCode'] = bool(files)
    record['hasDemo'] = bool(demo)
    record['files'] = [{'path': f['path'], 'type': f.get('type','registry:component')} for f in files]
    record['dependencies'] = record.get('dependencies',[])
    record['registryDependencies'] = record.get('registryDependencies',[])
    json_save(OUT / f'{record["id"]}.json',{'name':record['name'],'sourceId':record['sourceId'],'files':files,'demoCode':demo,'dependencies':record['dependencies'],'registryDependencies':record['registryDependencies'],'license':'MIT','sourceUrl':record['url']})
    CAT.append(record)

# Kokonut: canonical published registry, with docs for categorization/demo markup.
repo = ROOT/'kokonut-repo'
docs = {p.stem:p for p in (repo/'content/docs').rglob('*.mdx')}
registry=json.loads(read(repo/'registry.json'))
for item in registry['items']:
    name=item['name']; doc=docs.get(name); doc_text=read(doc) if doc else ''
    section=doc.relative_to(repo/'content/docs').parts[0] if doc else 'components'
    files=[dict(f,content=read(repo/f['path'])) for f in item.get('files',[]) if (repo/f['path']).is_file()]
    demo=None
    preview=re.search(r'<Preview\b[^>]*>(.*?)</Preview>',doc_text,re.S)
    if preview:
        imports='\n'.join(re.findall(r'^import\s.+?(?:;|$)',doc_text,re.M))
        demo='"use client";\n'+imports+'\nexport default function Demo(){return (<>\n'+preview.group(1).strip()+'\n</>)}\n'
    kw=re.search(r'^keywords:\s*(\[.*\])',doc_text,re.M)
    try: keywords=json.loads(kw.group(1)) if kw else []
    except: keywords=[]
    doc_path=doc.relative_to(repo/'content/docs').with_suffix('').as_posix() if doc else name
    rec={'id':f'kokonut-{name}','sourceId':'kokonut','name':item.get('title',title(name)),'slug':name,'description':item.get('description',''),'category':category(name,title(section)),'url':f'https://kokonutui.com/docs/{doc_path}','codeUrl':f'https://kokonutui.com/r/{name}.json','install':f'npx shadcn@latest add https://kokonutui.com/r/{name}.json','tags':['React','TypeScript','Tailwind CSS','Kokonut UI',title(section),*keywords],'dependencies':item.get('dependencies',[]),'registryDependencies':item.get('registryDependencies',[]),'type':item.get('type','registry:component'),'repo':'https://github.com/kokonut-labs/kokonutui','previewUrl':f'https://kokonutui.com/docs/{doc_path}'}
    write_record(rec,files,demo)

# Motion Primitives: exact core registry items, all original examples are retained.
repo=ROOT/'motion-repo'
registry=json.loads(read(repo/'public/c/registry.json'))
for item in registry['items']:
    name=item['name']; doc=repo/f'app/docs/{name}/page.mdx';doc_text=read(doc)
    files=[dict(f,content=read(repo/f['path'])) for f in item.get('files',[]) if (repo/f['path']).is_file()]
    examples=[]
    for match in re.findall(r"filePath=['\"]([^'\"]+)['\"]",doc_text):
        p=repo/match
        if p.is_file(): examples.append({'path':match,'content':read(p),'type':'example'})
    files += examples
    rec={'id':f'motion-{name}','sourceId':'motion','name':item.get('title',title(name)),'slug':name,'description':item.get('description',''),'category':category(name,'Motion'),'url':f'https://motion-primitives.com/docs/{name}','codeUrl':f'https://motion-primitives.com/c/{name}.json','install':f'npx shadcn@latest add https://motion-primitives.com/c/{name}.json','tags':['React','TypeScript','Motion','Tailwind CSS','Motion Primitives'],'dependencies':item.get('dependencies',[]),'registryDependencies':item.get('registryDependencies',[]),'type':item.get('type','registry:ui'),'repo':'https://github.com/ibelick/motion-primitives','previewUrl':f'https://motion-primitives.com/docs/{name}','exampleCount':len(examples)}
    write_record(rec,files,examples[0]['content'] if examples else None)

# Tailark: enumerate actual registry files. Preserve Base UI and Radix variants.
# Each TSX file is a real source item; helpers remain identified as components.
repo=ROOT/'tailark-repo'
words={'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','ten':'10','eleven':'11','twelve':'12','thirteen':'13','fourteen':'14','fifteen':'15','sixteen':'16','seventeen':'17','eighteen':'18','nineteen':'19','twenty':'20'}
for p in sorted((repo/'registry/bases').rglob('*.tsx')):
    relative=p.relative_to(repo).as_posix(); parts=p.relative_to(repo/'registry/bases').parts
    base=parts[0];kit=parts[1] if len(parts)>2 else 'core';typ=parts[2] if len(parts)>3 else 'ui';tail=list(parts[3:]);cat=tail[0] if tail else p.stem
    tail[-1:]=[p.stem] if tail else []
    normalized=[words.get(x,x) for x in tail]
    slug='-'.join([kit,*normalized]);slug=re.sub(r'[^a-zA-Z0-9-]','-',slug)
    rid=f'tailark-{base}-{slug}'
    # Stable filename suffix avoids helper collision with folder entry files.
    code=read(p)
    files=[{'path':relative,'content':code,'type':'registry:block' if typ=='blocks' else 'registry:component'}]
    # Retain the complete direct source import graph so a bundler can use real code.
    seen={relative}; queue=[p]
    while queue:
        current=queue.pop(); current_code=read(current)
        for imp in re.findall(r'(?:from\s+|import\s*)[\'\"]([^\'\"]+)[\'\"]',current_code):
            if imp.startswith('@/'): q=repo/imp[2:]
            elif imp.startswith('.'):q=current.parent/imp
            else:continue
            candidates=[q,q.with_suffix('.tsx'),q.with_suffix('.ts'),q/'index.tsx',q/'index.ts']
            q=next((c.resolve() for c in candidates if c.is_file()),None)
            if not q or not q.is_relative_to(repo.resolve()):continue
            qr=q.relative_to(repo.resolve()).as_posix()
            if qr in seen:continue
            seen.add(qr); queue.append(q)
            files.append({'path':qr,'content':read(q),'type':'dependency'})
    suffix=' '.join(title(x) for x in normalized)
    display=f'{title(kit)} {suffix}' if suffix else f'{title(kit)} {title(p.stem)}'
    package_imports=sorted(set(re.findall(r'from\s+[\'\"]([^@./][^\'\"]*|@[^/]+/[^\'\"]+)[\'\"]',code)))
    registry_name=f'{kit}-{cat}-{words.get(tail[1],tail[1])}' if len(tail)>1 and typ in ['blocks','pages'] else f'{kit}-{p.stem}'
    code_url=f'https://github.com/tailark/blocks/blob/main/{relative}'
    thumbnail=None
    candidate=repo/f'public/{kit}/{cat}-dark.png'
    if candidate.is_file():thumbnail=f'https://raw.githubusercontent.com/tailark/blocks/main/public/{kit}/{cat}-dark.png'
    rec={'id':rid,'sourceId':'tailark','name':display,'slug':slug,'description':f'Tailark {title(kit)} {title(cat)}. Original {"Base UI" if base=="base" else "Radix UI"} source, {typ}.','category':category(cat,title(cat)),'url':code_url,'codeUrl':code_url,'install':f'npx shadcn@latest add https://oss-tailark.com/r/{"radix/" if base=="radix" else ""}{registry_name}','tags':['React','TypeScript','Tailwind CSS','Tailark',title(kit),'Base UI' if base=='base' else 'Radix UI',title(typ)],'dependencies':package_imports,'type':'registry:block' if typ in ['blocks','pages'] else 'registry:ui','repo':'https://github.com/tailark/blocks','previewUrl':'https://tailark.com','base':base,'kit':kit,'thumbnail':thumbnail,'installAvailability':'Published registry hostname was unavailable at capture; original source is retained locally.'}
    write_record(rec,files,code if re.search(r'export default (?:function|class|\w)',code) else None)

json_save(ROOT/'catalog.json',CAT)
counts=dict(collections.Counter(r['sourceId'] for r in CAT))
stats={'counts':counts,'total':len(CAT),'withCode':sum(bool(r['hasCode']) for r in CAT),'withDemo':sum(bool(r['hasDemo']) for r in CAT),'thumbnailCount':sum(bool(r.get('thumbnail')) for r in CAT)}
json_save(ROOT/'stats.json',stats)
print(json.dumps(stats,indent=2))

# Preserve exact copyright notices beside imported source.
licenses=ROOT/'licenses'; licenses.mkdir(exist_ok=True)
for source,rep,fn in [('kokonut','kokonut-repo','LICENSE'),('motion','motion-repo','LICENSE'),('tailark','tailark-repo','LICENCE.md')]:
    source_file=ROOT/rep/fn
    if source_file.is_file():shutil.copy2(source_file,licenses/f'{source}-LICENSE.txt')
