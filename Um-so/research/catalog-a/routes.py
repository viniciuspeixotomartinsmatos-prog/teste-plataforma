import urllib.request
for name in ['Categories.js','Components.js']:
 b=urllib.request.urlopen('https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/constants/'+name,timeout=25).read();open('research/catalog-a/'+name,'wb').write(b)
print(open('research/catalog-a/Categories.js',encoding='utf8').read()[:2200])
print(open('research/catalog-a/Components.js',encoding='utf8').read()[:800])
