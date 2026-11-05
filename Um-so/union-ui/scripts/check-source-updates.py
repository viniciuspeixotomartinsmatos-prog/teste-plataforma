"""Read public source inventories without publishing unverified catalog entries.

Reports are research evidence, never a claim of executable preview coverage.
Run from any directory. No credentials, paid endpoints or browser state are used.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
import datetime
import hashlib
import html
import json
import re
import xml.etree.ElementTree as ET

APP = Path(__file__).resolve().parents[1]
RESEARCH = APP.parent / 'research'
OUT = RESEARCH / 'source-checks'
SOURCES = {
    '21st': 'https://21st.dev',
    'aceternity': 'https://ui.aceternity.com',
    'magic': 'https://magicui.design',
    'reactbits': 'https://reactbits.dev',
    'kokonut': 'https://kokonutui.com',
    'shadcnblocks': 'https://www.shadcnblocks.com',
    'motion': 'https://motion-primitives.com',
    'tailark': 'https://tailark.com',
    'animate': 'https://animate-ui.com',
    'profitize': 'https://profitize.com.br',
}
ROUTES = {
    '21st': r'^/@[^/]+/(?:components|themes|templates)/[^/]+$',
    'aceternity': r'^/(?:components|blocks|templates|interactions)/[^/]+$',
    'magic': r'^/docs/components/[^/]+$',
    'reactbits': r'^/(?:text-animations|animations|components|backgrounds|micro-interactions|tools)/[^/]+$',
    'kokonut': r'^/docs/(?!installation|introduction).+',
    'shadcnblocks': r'^/(?:block|component|template)/.+',
    'motion': r'^/docs/[^/]+$',
    'tailark': r'^/(?:blocks|components|templates)/.+',
    'animate': r'^/(?:vue/)?docs/(?:components|primitives|icons|backgrounds|effects)/.+',
    'profitize': r'^/build/(?:componentes|landing-pages|templates)/[^/]+$',
}
REGISTRIES = {
    'magic': ('https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/public/r/registry.json', 'catalog-a/magic-registry.json'),
    'reactbits': ('https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/registry.json', 'catalog-a/reactbits-registry.json'),
    'kokonut': ('https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/registry.json', 'catalog-b/kokonut-repo/registry.json'),
    'motion': ('https://raw.githubusercontent.com/ibelick/motion-primitives/main/public/c/registry.json', 'catalog-b/motion-repo/public/c/registry.json'),
}


def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0 (public source inventory check)'}), timeout=30) as response:
        data = response.read(25_000_001)
        if len(data) > 25_000_000:
            raise ValueError('Inventory exceeds 25 MB limit')
        return data


def route(url):
    return urlparse(html.unescape(url)).path.rstrip('/')


def check(pair):
    source, origin = pair
    entry = {'source': source, 'origin': origin, 'requests': [], 'limitations': [], 'routes': []}
    found = set()
    queue = [origin + ('/build/templates' if source == 'profitize' else '/sitemap.xml')]
    seen = set()
    while queue and len(seen) < 30:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            data = fetch(url)
            entry['requests'].append({'url': url, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
            text = data.decode('utf-8')
            if source == 'profitize':
                # Public HTML contains both regular links and escaped RSC links.
                text = html.unescape(text.replace('\\"', '"').replace('\\/', '/'))
                found.update(re.findall(r'/build/(?:componentes|landing-pages|templates)/[a-z0-9-]+', text))
            else:
                root = ET.fromstring(text)
                locations = [element.text for element in root.iter() if element.tag.endswith('}loc') or element.tag == 'loc']
                if root.tag.endswith('sitemapindex'):
                    for location in locations:
                        if urlparse(location).netloc == urlparse(origin).netloc:
                            queue.append(location)
                        else:
                            entry['limitations'].append('Off-origin sitemap omitted: ' + location)
                else:
                    found.update(route(location) for location in locations if location)
        except Exception as error:
            entry['limitations'].append(url + ': ' + str(error))
    if queue:
        entry['limitations'].append('Sitemap traversal capped at 30 documents')
    if not found:
        entry['limitations'].append('Sitemap exposed no matching content routes; a repository fallback does not cover private or commercial releases.')
    if source in REGISTRIES:
        url, local = REGISTRIES[source]
        try:
            data = fetch(url)
            current = json.loads(data)['items']
            retained = json.loads((RESEARCH / local).read_text(encoding='utf-8'))['items']
            old = {item['name']: item for item in retained}
            entry['registry'] = {
                'url': url, 'sha256': hashlib.sha256(data).hexdigest(),
                'observedItems': len(current), 'retainedItems': len(old),
                'addedNames': sorted(item['name'] for item in current if item['name'] not in old),
                'changedMetadataNames': sorted(item['name'] for item in current if item['name'] in old and item != old[item['name']]),
                'scope': 'Registry metadata comparison; identical metadata does not establish identical source implementations.',
            }
            if source == 'motion':
                found.update('/docs/' + item['name'] for item in current)
        except Exception as error:
            entry['limitations'].append(url + ': ' + str(error))
    if source == 'tailark':
        url = 'https://api.github.com/repos/tailark/blocks/git/trees/main?recursive=1'
        try:
            tree = json.loads(fetch(url))
            files = [item for item in tree['tree'] if item['path'].startswith('registry/bases/') and item['path'].endswith('.tsx')]
            changes = []
            added = []
            for item in files:
                local = RESEARCH / 'catalog-b/tailark-repo' / item['path']
                if not local.exists():
                    added.append(item['path'])
                else:
                    data = local.read_bytes().replace(b'\r\n', b'\n')
                    blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
                    if blob != item['sha']:
                        changes.append(item['path'])
            entry['repository'] = {'url': url, 'treeSha': tree['sha'], 'observedFiles': len(files), 'addedFiles': added, 'changedFiles': changes}
            if tree.get('truncated'):
                entry['limitations'].append('GitHub tree response is truncated')
        except Exception as error:
            entry['limitations'].append(url + ': ' + str(error))
    entry['routes'] = sorted(path for path in found if re.match(ROUTES[source], path))
    entry['scope'] = 'Public route discovery only; sitemap omissions, authenticated content, source-code changes and new functionality require separate checks.'
    entry['status'] = 'inventory-observed' if entry['routes'] or entry.get('repository') else 'incomplete'
    return entry


def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    catalog = json.loads((APP / 'public/data/catalog.json').read_text(encoding='utf-8'))
    baseline = {source: set() for source in SOURCES}
    for item in catalog:
        source = item.get('sourceId')
        if source in baseline and item.get('url'):
            baseline[source].add(route(item['url']))
    # Consolidated Profitize titles keep another source's public catalog identity.
    profitize = json.loads((RESEARCH / 'profitize/catalog.json').read_text(encoding='utf-8'))
    baseline['profitize'].update('/build/' + ('componentes' if item['type'] == 'component' else 'landing-pages') + '/' + item['slug'] for item in profitize)
    previous_file = OUT / 'latest.json'
    previous = json.loads(previous_file.read_text(encoding='utf-8')) if previous_file.exists() else {}
    previous_sources = {item['source']: item for item in previous.get('sources', [])}
    with ThreadPoolExecutor(max_workers=10) as executor:
        sources = list(executor.map(check, SOURCES.items()))
    for item in sources:
        old = previous_sources.get(item['source'])
        item['integratedRouteCount'] = len(baseline[item['source']])
        item['unmatchedRoutes'] = sorted(set(item['routes']) - baseline[item['source']])
        item['addedSincePreviousCheck'] = sorted(set(item['routes']) - set(old['routes'])) if old else None
        item['previousCheckAvailable'] = old is not None
        item['publishedByThisCheck'] = 0
        item['limitations'].append('Unmatched routes are candidates, not proof of new content or runnable demos.')
    result = {'checkedAt': now.isoformat(), 'paymentsEnabled': False, 'sources': sources}
    OUT.mkdir(exist_ok=True)
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    (OUT / (now.strftime('%Y-%m-%dT%H%M%SZ') + '.json')).write_text(encoded, encoding='utf-8', newline='\n')
    previous_file.write_text(encoded, encoding='utf-8', newline='\n')
    for item in sources:
        print(item['source'], item['status'], 'routes', len(item['routes']), 'unmatched', len(item['unmatchedRoutes']), 'issues', len(item['limitations']) - 1)


if __name__ == '__main__':
    main()
