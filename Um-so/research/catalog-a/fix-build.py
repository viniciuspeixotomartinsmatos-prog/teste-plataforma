p='research/catalog-a/build-catalog.py'
s=open(p,encoding='utf-8-sig').read().replace('path.read_text()','path.read_text(encoding="utf8")').replace('p.read_text()','p.read_text(encoding="utf8")')
s=s.replace("def kebab(s):return re.sub(r'(?<!^)([A-Z])',r'-\\1',s).replace(' ','-').lower().replace('--','-')", "def kebab(s):return re.sub(r'([a-z0-9])([A-Z])',r'\\1-\\2',re.sub(r'([A-Z]+)([A-Z][a-z])',r'\\1-\\2',s)).replace(' ','-').lower().replace('--','-')")
open(p,'w',encoding='utf8').write(s)
