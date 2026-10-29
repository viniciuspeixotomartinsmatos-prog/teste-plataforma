import re,json
h=open('research/catalog-a/aceternity-detail.html',encoding='utf8').read()
scripts=re.findall(r'<script[^>]*>(.*?)</script>',h,re.S)
for s in scripts:
 if '__rawString' in s:
  print(s[:140]);print(s[-100:]);
  print('raw repr',repr(s[s.find('__rawString'):s.find('__rawString')+80]));break
