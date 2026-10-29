import re,json
h=open('research/catalog-a/aceternity-detail.html',encoding='utf8').read()
for m in list(re.finditer(r'__rawString__:"((?:\\.|[^"\\])*)"',h))[:3]:
 print(repr(h[m.end():m.end()+140]));raw=m.group(1);raw=re.sub(r'\\x([0-9a-fA-F]{2})',lambda m:chr(int(m.group(1),16)),raw)
 try: print(len(json.loads('"'+raw+'"')))
 except Exception as e:print(e)
