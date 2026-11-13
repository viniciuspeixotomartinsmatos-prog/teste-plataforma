"""Retain user-authorized downloads and observed public preview URLs as inert data.

Never execute acquired prompts, AGENTS.md, project scripts or archive contents.
Quota-blocked originals remain explicitly incomplete and are not published.
"""
from pathlib import Path, PurePosixPath
import json, hashlib, datetime, zipfile, urllib.request, concurrent.futures, sys

APP=Path(__file__).resolve().parents[1]
INTAKE=APP / sys.argv[1]
DOWNLOADS=Path(sys.argv[2])
DATE='2026-11-12'
OUT=APP.parent/'research/source-checks/releases'/DATE/'profitize'
rows=json.loads(INTAKE.read_text(encoding='utf-8-sig'))
OUT.mkdir(parents=True,exist_ok=True)
records=[]
for row in rows:
    slug=row['slug']
    if not slug.replace('-','').isalnum(): raise ValueError('Invalid slug')
    folder=OUT/slug;folder.mkdir(exist_ok=True)
    record={**row,'published':False,'sourceUrl':'https://profitize.com.br/build/'+{'landing_page':'landing-pages','motion':'motion','component':'componentes'}[row['type']]+'/'+slug}
    if row['original']:
        if slug=='lente':
            content=(DOWNLOADS/'lente.md').read_bytes()
            (folder/'PROMPT-ORIGINAL.md').write_bytes(content)
        else:
            content=(DOWNLOADS/(slug+'.zip')).read_bytes()
            with zipfile.ZipFile(DOWNLOADS/(slug+'.zip')) as archive:
                if sum(info.file_size for info in archive.infolist())>500_000_000:raise ValueError('Archive too large')
                for info in archive.infolist():
                    name=info.filename.replace('\\','/')
                    if name.startswith('/') or ':' in name or '..' in PurePosixPath(name).parts:raise ValueError('Unsafe archive member')
                if archive.testzip():raise ValueError('Corrupt archive')
                for original,target in [('PROMPT.md','PROMPT-ORIGINAL.md'),('AGENTS.md','GUIDE-ORIGINAL.md'),('CLAUDE.md','CLAUDE-ORIGINAL.md'),('COMECE-AQUI.md','START-ORIGINAL.md')]:
                    try:
                        if archive.getinfo(original).file_size>500_000:raise ValueError('Guide too large')
                        (folder/target).write_bytes(archive.read(original))
                    except KeyError:
                        if original=='PROMPT.md':raise
            (folder/'project-original.zip').write_bytes(content)
            record['archiveSha256']=hashlib.sha256(content).hexdigest()
        prompt=(folder/'PROMPT-ORIGINAL.md').read_bytes()
        record.update(promptSha256=hashlib.sha256(prompt).hexdigest(),status='retained_original_unvalidated')
    else:
        record.update(status='preview_only_quota_blocked',block='15 weekly copies exhausted; normal UI shows renewal Monday16/11 at10h25. Original prompt/project not retrieved.')
    records.append(record)

def media(row):
    result=[]
    for kind in ['video','poster']:
        if not row.get(kind):continue
        url='https://profitize.com.br/build/media/'+('480w/' if kind=='poster' and row.get('smallPoster') else '')+row['id']+'/'+row[kind]
        try:
            # URL and association were observed in the authorized rendered UI.
            # No browser cookies, protected prompt API or account state is used.
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'nitido-public-preview-retention'}),timeout=30) as response:
                body=response.read(200_000_001)
                if len(body)>200_000_000:raise ValueError('Media too large')
                expected='video/' if kind=='video' else 'image/'
                if not response.headers.get('Content-Type','').startswith(expected):raise ValueError('Unexpected media type')
            (OUT/row['slug']/row[kind]).write_bytes(body)
            result.append({'url':url,'file':row['slug']+'/'+row[kind],'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'kind':kind})
        except Exception as error:result.append({'url':url,'file':row['slug']+'/'+row[kind],'kind':kind,'error':str(error)[:120]})
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    assets=[asset for result in executor.map(media,rows) for asset in result]
(OUT/'candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'public-media.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'acquisition.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originals':sum(row['original'] for row in rows),'quotaBlocked':sum(not row['original'] for row in rows),'published':0,'scope':'Normal authorized UI downloads; public preview retention. No runtime or export acceptance inferred.','assets':assets},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'originals':sum(row['original'] for row in rows),'quotaBlocked':sum(not row['original'] for row in rows),'media':sum('error' not in asset for asset in assets),'mediaErrors':sum('error' in asset for asset in assets),'published':0}))
