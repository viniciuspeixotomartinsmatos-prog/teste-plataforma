import urllib.request,json,re,os,concurrent.futures,time,html,collections
from pathlib import Path
ROOT=Path('research/catalog-a');(ROOT/'code').mkdir(exist_ok=True);(ROOT/'pages').mkdir(exist_ok=True);(ROOT/'assets').mkdir(exist_ok=True)
errors=[]
def fetch(url,dest,raw=False):
 dest=Path(dest)
 if dest.exists():return dest.read_bytes()
 for retry in range(2):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 Codex public catalog reconstruction'})
   with urllib.request.urlopen(req,timeout=35) as r:b=r.read()
   dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b);return b
  except Exception as e:
   if retry:errors.append({'url':url,'error':str(e)});return None
 return None
def pretty(s):return re.sub(r'(?<!^)([A-Z][a-z])',r' \1',s).replace('-',' ').title().replace('Ui','UI').replace('Ai','AI').strip()
def kebab(s):return re.sub(r'([a-z0-9])([A-Z])',r'\1-\2',re.sub(r'([A-Z]+)([A-Z][a-z])',r'\1-\2',s)).replace(' ','-').lower().replace('--','-')
def category(s):
 s=s.lower()
 for tag,words in [('backgrounds',['background','aurora','beams','ballpit','silk','orb','particles','grid-pattern','plasma','galaxy','lightning','waves','ripple','liquid','stars','gradient','grain','prism','dither','rays','fire','shader','hyperspeed','threads','squares','letter-glitch','light-pillar','dot-grid','grainient','pixel-blast','color-bends','constellation','antigravity','horizon','ether']),('text',['text','word','type','letters','shiny','blur','decrypt','count','reveal','ticker','shuffle','glitch']),('buttons',['button','switch','toggle','checkbox']),('cards',['card','bento','stack','tilt','spotlight','magnet','lanyard','ticket']),('navigation',['menu','dock','nav','sidebar','tab','stepper','breadcrumb']),('galleries',['gallery','image','carousel','marquee','slider','scroll','bounce','photography','masonry']),('inputs',['input','form','search','command','upload','textarea']),('cursors',['cursor','splash']),('data',['chart','progress','timeline','tree','calendar']),('icons',['icon','logo','avatar']),('audio',['sound'])]:
  if any(w in s for w in words):return tag
 return 'animation'
# Download all real registries, canonical components and demos with contents.
magic=json.load(open(ROOT/'magic-registry.json',encoding='utf8'))['items']
react=json.load(open(ROOT/'reactbits-registry.json',encoding='utf8'))['items']
jobs=[]
for source,items,base in [('magic',magic,'https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/public/r/'),('reactbits',react,'https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/')]:
 for item in items:
  if item['type'] in ('registry:style','registry:lib'):continue
  jobs.append((base+item['name']+'.json',ROOT/'code'/source/(item['name']+'.json')))
print('Downloading registry files',len(jobs),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
 results=list(ex.map(lambda j:fetch(*j),jobs))
print('Registries downloaded',sum(b is not None for b in results),flush=True)
# Aceternity: retrieve all public docs, exact registry names exposed by docs.
slugs=json.load(open(ROOT/'aceternity-slugs.json'))
def acet_page(slug):
 b=fetch('https://ui.aceternity.com/components/'+slug,ROOT/'pages'/('aceternity-'+slug+'.html'))
 if b is None:return {'slug':slug,'unavailable':True}
 s=b.decode('utf8')
 def meta(name):
  m=re.search(r'<meta (?:property|name)="'+name+r'" content="([^"]*)"',s);return html.unescape(m.group(1)) if m else ''
 names=list(dict.fromkeys(re.findall(r'/src/registry/default/ui/([a-z0-9-]+)\.tsx',s)))
 if not names:names=list(dict.fromkeys(re.findall(r'ComponentSource\\?",p:[^\n]{0,50}?name:\\?"([a-z0-9-]+)',s)))
 title=meta('og:title') or pretty(slug)
 return {'slug':slug,'name':re.sub(r' (?:for React|\| Aceternity UI).*$','',title),'description':meta('description'),'thumbnailUrl':meta('og:image'),'registries':names}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:acet=list(ex.map(acet_page,slugs))
(ROOT/'aceternity-pages.json').write_text(json.dumps(acet,indent=2),encoding='utf8')
acetnames=sorted(set(name for page in acet for name in page.get('registries',[])))
print('Aceternity docs and exact registry names',len(acet),len(acetnames),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:list(ex.map(lambda name:fetch('https://ui.aceternity.com/registry/'+name+'.json',ROOT/'code'/'aceternity'/(name+'.json')),acetnames))
# Get Magic documentation descriptions and frontmatter.
mt=json.load(open(ROOT/'magic-tree.json'))['tree'];mpaths={x['path'] for x in mt if x['type']=='blob'}
mdocs=[p for p in mpaths if p.startswith('apps/www/content/docs/components/') and p.endswith('.mdx')]
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:list(ex.map(lambda p:fetch('https://raw.githubusercontent.com/magicuidesign/magicui/main/'+p,ROOT/'pages'/('magic-'+p.rsplit('/',1)[1])),mdocs))
# Assemble grouped catalogs.
catalog=[]
for item in magic:
 if item['type']!='registry:ui':continue
 slug=item['name'];p=ROOT/'code'/'magic'/(slug+'.json');data=json.loads(p.read_text(encoding="utf8")) if p.exists() else item
 md=ROOT/'pages'/('magic-'+slug+'.mdx');text=md.read_text(encoding='utf8') if md.exists() else ''
 match=re.search(r'^description:\s*["\']?(.*?)["\']?\s*$',text,re.M)
 titlematch=re.search(r'^title:\s*["\']?(.*?)["\']?\s*$',text,re.M)
 examples=[x['name'] for x in magic if x['type']=='registry:example' and (x['name'].startswith(slug+'-') or x['name']==slug+'-demo')]
 catalog.append({'id':'magic--'+slug,'sourceId':'magic','name':titlematch.group(1) if titlematch else data.get('title',pretty(slug)),'slug':slug,'description':match.group(1) if match else data.get('description',''),'category':category(slug),'url':'https://magicui.design/docs/components/'+slug,'codeUrl':'https://magicui.design/r/'+slug+'.json','install':'npx shadcn@latest add "https://magicui.design/r/'+slug+'.json"','tags':['React','TypeScript','Tailwind CSS','Motion'],'codeFile':'code/magic/'+slug+'.json','examples':[{'name':n,'codeFile':'code/magic/'+n+'.json'} for n in examples],'files':data.get('files',[]),'dependencies':data.get('dependencies',[])})
rt=json.load(open(ROOT/'reactbits-tree.json'))['tree'];rpaths={x['path'] for x in rt if x['type']=='blob'}
groups=collections.defaultdict(list)
for item in react:groups[item.get('title',item['name'])].append(item)
for title,variants in groups.items():
 variants.sort(key=lambda x:(0 if x['name'].endswith('-TS-TW') else 1 if x['name'].endswith('-TS-CSS') else 2 if x['name'].endswith('-TS') else 3))
 default=variants[0];slug=kebab(title);path=ROOT/'code'/'reactbits'/(default['name']+'.json');data=json.loads(path.read_text(encoding="utf8")) if path.exists() else default
 srcpath=next((p for p in rpaths if p.startswith('src/ts-tailwind/') and '/'+title+'/' in p),'')
 cat=srcpath.split('/')[2] if srcpath else ''
 catmap={'Backgrounds':'backgrounds','TextAnimations':'text','Animations':'animation','Components':category(title)}
 basecat=catmap.get(cat,category(title))
 docs_prefix={'backgrounds':'backgrounds','text':'text-animations','animation':'animations'}.get(basecat,'components')
 if cat:docs_prefix={'Backgrounds':'backgrounds','TextAnimations':'text-animations','Animations':'animations','Components':'components'}.get(cat,docs_prefix)
 imagepath='public/og/components/'+slug+'.jpg';thumb='https://raw.githubusercontent.com/DavidHDev/react-bits/main/'+imagepath if imagepath in rpaths else ''
 catalog.append({'id':'reactbits--'+slug,'sourceId':'reactbits','name':pretty(title),'slug':slug,'description':default.get('description',''),'category':basecat,'url':'https://reactbits.dev/'+docs_prefix+'/'+slug,'codeUrl':'https://reactbits.dev/r/'+default['name']+'.json','install':'npx shadcn@latest add "https://reactbits.dev/r/'+default['name']+'.json"','tags':['React',cat,'TypeScript','JavaScript','Tailwind CSS'],'codeFile':'code/reactbits/'+default['name']+'.json','variants':[{'name':v['name'],'codeFile':'code/reactbits/'+v['name']+'.json'} for v in variants],'files':data.get('files',[]),'dependencies':data.get('dependencies',[]),'thumbnailUrl':thumb})
for page in acet:
 slug=page['slug'];names=page.get('registries',[]);files=[];deps=[];codefiles=[]
 for name in names:
  p=ROOT/'code'/'aceternity'/(name+'.json')
  if p.exists():
   d=json.loads(p.read_text(encoding="utf8"));files+=d.get('files',[]);deps+=d.get('dependencies',[]);codefiles.append('code/aceternity/'+name+'.json')
 catalog.append({'id':'aceternity--'+slug,'sourceId':'aceternity','name':page.get('name',pretty(slug)),'slug':slug,'description':page.get('description',''),'category':category(slug),'url':'https://ui.aceternity.com/components/'+slug,'codeUrl':'https://ui.aceternity.com/registry/'+names[0]+'.json' if names else '', 'install':'npx shadcn@latest add "https://ui.aceternity.com/registry/'+names[0]+'.json"' if names else '', 'tags':['React','TypeScript','Tailwind CSS','Motion'],'codeFile':codefiles[0] if codefiles else None,'additionalCodeFiles':codefiles[1:],'files':files,'dependencies':sorted(set(deps)),'thumbnailUrl':page.get('thumbnailUrl',''),'availability':'code' if files else 'documentation'})
# Download real thumbnail files and preserve remote provenance, bounded size.
image_jobs=[]
for c in catalog:
 if c.get('thumbnailUrl'):image_jobs.append(c)
def thumb(c):
 ext='.jpg' if '.jpg' in c['thumbnailUrl'] else '.webp' if '.webp' in c['thumbnailUrl'] else '.png'
 rel='assets/'+c['id']+ext;b=fetch(c['thumbnailUrl'],ROOT/rel)
 if b:c['thumbnailLocal']=rel
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:list(ex.map(thumb,image_jobs))
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf8')
# Metadata-only lightweight catalog for app initial payload; detailed files stay per item.
light=[]
for c in catalog:
 cc={k:v for k,v in c.items() if k!='files'};light.append(cc)
(ROOT/'catalog-light.json').write_text(json.dumps(light,ensure_ascii=False,indent=2),encoding='utf8')
notes={'sources':[{'sourceId':'magic','url':'https://magicui.design','repository':'https://github.com/magicuidesign/magicui','license':'MIT','components':sum(c['sourceId']=='magic' for c in catalog),'examples':sum(i['type']=='registry:example' for i in magic),'coverage':'All registry:ui components plus all public example JSON files from official registry.'},{'sourceId':'reactbits','url':'https://reactbits.dev','repository':'https://github.com/DavidHDev/react-bits','license':'MIT + Commons Clause','components':len(groups),'variants':len(react),'coverage':'All component variants in official public/r/registry.json. Grouped by title with default TS/Tailwind when available.'},{'sourceId':'aceternity','url':'https://ui.aceternity.com','license':'Public component documentation; retain upstream terms/source attribution','components':len(acet),'coverage':'All 123 component docs linked from public /components index. Exact registry names parsed from public rendered docs; source included only for registry responses accessible without authentication.'}], 'errors':errors,'generatedAt':'2026-10-26','counts':dict(collections.Counter(c['sourceId'] for c in catalog))}
(ROOT/'coverage.json').write_text(json.dumps(notes,indent=2),encoding='utf8')
print('DONE',notes['counts'],'images',sum('thumbnailLocal' in c for c in catalog),'errors',len(errors),flush=True)
