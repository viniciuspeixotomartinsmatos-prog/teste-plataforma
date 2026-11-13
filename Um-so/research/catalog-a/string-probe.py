import re
h=open('research/catalog-a/aceternity-detail.html',encoding='utf8').read()
i=h.find('__rawString')
print(h[i:i+500])
print('raw count',h.count('__rawString'))
print(re.findall(r'<meta[^>]+>',h)[:12])
