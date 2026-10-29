import urllib.request
u='https://ui.aceternity.com/components/3d-card-effect'
b=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read()
open('research/catalog-a/aceternity-detail.html','wb').write(b)
print(len(b))
