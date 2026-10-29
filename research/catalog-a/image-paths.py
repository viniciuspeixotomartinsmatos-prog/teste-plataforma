import json
p=[x['path'] for x in json.load(open('research/catalog-a/magic-tree.json'))['tree'] if x['type']=='blob']
print('\n'.join(x for x in p if any(y in x.lower() for y in ['preview','thumbnail','og-image','screenshot']) and x.endswith(('.jpg','.png','.webp','.jpeg'))))
