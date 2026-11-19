"""Retain only original public media referenced by acquired examples and covers."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
import json, re, hashlib
root = Path(__file__).resolve().parents[1]
release = root.parent / 'research/source-checks/releases/2026-11-09'
staged = json.loads((release / '21st-stage.json').read_text(encoding='utf-8'))
mapping_path = root / 'public/data/demo-local-assets.json'
mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
mapping.setdefault('items', {})
jobs = {}
for item in staged:
    payload = json.loads((root / ('public' + item['codePath'])).read_text(encoding='utf-8'))
    text = '\n'.join(file['content'] for file in payload['files']) + '\n' + payload['demoCode']
    urls = set(re.findall(r'https://[^\s\x22\x27`<>\\)]+', text))
    cover = item['metadata'].get('previewUrl')
    if cover:
        urls.add(cover)
    for url in urls:
        parsed = urlparse(url)
        if '${' in url or parsed.username or parsed.password or parsed.hostname in ['localhost','127.0.0.1']:
            continue
        if not (re.search(r'\.(png|jpe?g|webp|gif|avif|svg|mp4|webm|woff2?|glb|gltf)(?:\?|$)', url, re.I) or parsed.hostname == 'images.unsplash.com'):
            continue
        jobs.setdefault(url, []).append((item['id'], url == cover))

def download(pair):
    url, uses = pair
    suffix = Path(urlparse(url).path).suffix.lower()
    if not re.fullmatch(r'\.[a-z0-9]{2,5}', suffix):
        suffix = '.jpg'
    local = '/assets/releases/21st/' + hashlib.sha256(url.encode()).hexdigest()[:24] + suffix
    target = root / ('public' + local)
    try:
        if not target.exists():
            with urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=18) as response:
                kind = response.headers.get_content_type()
                if not kind.startswith(('image/','video/','font/','model/','application/octet-stream')):
                    raise ValueError('Unexpected media content type: ' + kind)
                data = response.read(30_000_001)
                if len(data) > 30_000_000 or len(data) < 20:
                    raise ValueError('Invalid media size')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        data = target.read_bytes()
        return {'url':url,'local':local,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'uses':uses}
    except Exception as error:
        return {'url':url,'error':str(error),'uses':uses}

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(download, jobs.items()))
for record in results:
    if 'local' in record:
        for item_id, _ in record['uses']:
            mapping['items'].setdefault(item_id, {})[record['url']] = record['local']
mapping_path.write_text(json.dumps(mapping, separators=(',',':')), encoding='utf-8', newline='\n')
(release / '21st-media.json').write_text(json.dumps(results, indent=2), encoding='utf-8', newline='\n')
print(json.dumps({'urls':len(results),'retained':sum('local' in r for r in results),'failed':sum('error' in r for r in results)}))
