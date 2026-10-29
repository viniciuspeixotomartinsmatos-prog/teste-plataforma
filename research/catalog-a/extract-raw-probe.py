import re,json
h=open('research/catalog-a/aceternity-detail.html',encoding='utf8').read()
r=re.findall(r'__rawString__:"((?:\\.|[^"\\])*)"[^}]{0,200}?__src__:"((?:\\.|[^"\\])*)"',h)
print(len(r))
for raw,path in r[:4]:
 try:
  raw=re.sub(r'\\x([0-9a-fA-F]{2})',lambda m:chr(int(m.group(1),16)),raw)
  s=json.loads('"'+raw+'"');print(path,len(s),repr(s[:80]))
 except Exception as e:print(type(e),str(e))
