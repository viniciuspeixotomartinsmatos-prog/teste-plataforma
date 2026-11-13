import urllib.request,json,concurrent.futures
urls=['https://api.github.com/repos/magicuidesign/magicui/git/trees/main?recursive=1','https://api.github.com/repos/DavidHDev/react-bits/git/trees/main?recursive=1','https://ui.aceternity.com/sitemap.xml','https://magicui.design/r/registry.json','https://reactbits.dev/r/registry.json','https://ui.aceternity.com/registry/3d-card.json']
def fetch(u):
 try:
  with urllib.request.urlopen(u,timeout=25) as r:b=r.read()
  fname=('magic-tree.json' if 'magicuidesign' in u else 'reactbits-tree.json' if 'DavidHDev' in u else 'aceternity-sitemap.xml' if 'sitemap' in u else u.split('/')[2]+'-registry-sample.json')
  open('research/catalog-a/'+fname,'wb').write(b)
  return u,len(b),b[:100].decode(errors='replace')
 except Exception as e:return u,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for out in ex.map(fetch,urls):print(out)
