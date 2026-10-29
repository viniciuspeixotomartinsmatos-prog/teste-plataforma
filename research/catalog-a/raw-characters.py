import re
h=open('research/catalog-a/aceternity-detail.html',encoding='utf8').read();i=h.find('__rawString__')
s=h[i:i+45];print(list(s));print(repr(s))
pat=r'__rawString__:"((?:\\.|[^"\\])*)"'
r=re.findall(pat,h);print('raw matches',len(r));print(repr(r[0][:100]) if r else 'none')
if r:
 p=h.find('__src__',h.find('__rawString__'));print(repr(h[p-50:p+100]))
