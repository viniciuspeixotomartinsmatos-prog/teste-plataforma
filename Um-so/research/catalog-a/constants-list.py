import json
p=[x['path'] for x in json.load(open('research/catalog-a/reactbits-tree.json'))['tree'] if x['type']=='blob']
print('\n'.join(x for x in p if x.startswith('src/constants/') and '/' not in x[len('src/constants/'):]))
