import urllib.request,json,concurrent.futures
urls={
'aceternity-repos.json':'https://api.github.com/orgs/aceternity/repos?per_page=100',
'magic-registry.json':'https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/public/r/registry.json',
'reactbits-registry.json':'https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/registry.json',
'magic-license.md':'https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md',
'reactbits-license.md':'https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md',
'aceternity-components.html':'https://ui.aceternity.com/components'}
def fetch(kv):
 name,u=kv
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=30) as r:b=r.read()
  open('research/catalog-a/'+name,'wb').write(b)
  if name.endswith('repos.json'):return [(x['full_name'],x['default_branch']) for x in json.loads(b)]
  return name,len(b),b[:70].decode(errors='replace')
 except Exception as e:return name,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for r in ex.map(fetch,urls.items()):print(r)
