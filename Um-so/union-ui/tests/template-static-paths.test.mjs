import test from 'node:test';
import assert from 'node:assert/strict';
import {staticReference, templateStaticPath} from '../scripts/template-static-paths.mjs';

const base = new URL('https://example.com/demo/');
test('static capture retains full Next image arguments and usable image extensions', () => {
  const first = staticReference('/_next/image?url=%2Fassets%2Fhero.jpg&amp;w=640&amp;q=75', base);
  assert.equal(first.searchParams.get('url'), '/assets/hero.jpg');
  assert.equal(first.searchParams.get('q'), '75');
  const local = templateStaticPath(first, base, '/previews/example');
  assert.match(local, /^\/previews\/example\/_next\/image\.[a-f0-9]{8}\.jpg$/);
  assert.notEqual(local, templateStaticPath(staticReference('/_next/image?url=%2Fassets%2Fhero.jpg&w=1280&q=75', base), base, '/previews/example'));
  assert.match(templateStaticPath(staticReference('/_next/image?url=https%3A%2F%2Fimages.example%2Fphoto&w=640&q=75', base), base, '/previews/example'), /\.png$/);
});
test('template fragments remain untouched; credentials and API resources are not acquired', () => {
  for (const raw of ['https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg', 'https://i.ytimg.com/vi/$%7Bthis.videoId%7D/hqdefault.jpg', '/_next/image?url=', '/_next/image?url=%2Fhero.png&w=640', '/api/private.js', 'https://user:secret@example.com/file.js', 'http://example.com/file.js']) assert.equal(staticReference(raw, base), null, raw);
  assert.equal(staticReference('https://example.js/page', base), null);
  assert.equal(staticReference('/assets/font.woff2#font', base).href, 'https://example.com/assets/font.woff2');
  assert.equal(staticReference('../assets/app.js?v=2', base).href, 'https://example.com/assets/app.js?v=2');
});
test('external origins and asset query variants never collide', () => {
  const one = new URL('https://one.example/image.png?x=1'), two = new URL('https://two.example/image.png?x=1');
  assert.notEqual(templateStaticPath(one, base, '/preview'), templateStaticPath(two, base, '/preview'));
  assert.match(templateStaticPath(one, base, '/preview'), /^\/preview\/external\/[a-f0-9]{8}\/image.png\.[a-f0-9]{8}\.png$/);
});
