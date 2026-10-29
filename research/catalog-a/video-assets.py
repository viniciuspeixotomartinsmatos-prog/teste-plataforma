import json
p=[x['path'] for x in json.load(open('research/catalog-a/reactbits-tree.json'))['tree'] if x['type']=='blob']
print('\n'.join(x for x in p if x.startswith('public/assets/video/') and x.endswith('.webp'))[:4500]);c=json.load(open('research/catalog-a/catalog.json',encoding='utf8'));print('\nfiles',len(next(x for x in c if x['sourceId']=='reactbits')['files']))
