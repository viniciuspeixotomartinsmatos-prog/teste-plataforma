import path from 'node:path';
import crypto from 'node:crypto';

export const staticExtension = /\.(?:m?js|css|html|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|mp4|webm|glb|gltf|wasm)$/i;

// Runtime URL fragments and template expressions are not downloadable resources.
// Leave their source text intact instead of replacing them with broken local URLs.
export function staticReference(raw, parent) {
  try {
    if (/\$\{|%7[bBdD]|[{}]/i.test(raw)) return null;
    const url = new URL(raw.replaceAll('&amp;', '&'), parent);
    if (url.protocol !== 'https:' || url.username || url.password || /^\/api(?:\/|$)/.test(url.pathname)) return null;
    if (url.pathname === '/_next/image') {
      if (!url.searchParams.get('url') || !/^\d+$/.test(url.searchParams.get('w') || '') || !/^\d+$/.test(url.searchParams.get('q') || '')) return null;
    } else if (!staticExtension.test(url.pathname)) return null;
    url.hash = '';
    return url;
  } catch { return null; }
}

export function templateStaticPath(url, base, prefix) {
  const external = url.origin === base.origin ? '' : '/external/' + crypto.createHash('sha1').update(url.origin).digest('hex').slice(0, 8);
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  let extension = path.posix.extname(pathname);
  if (url.pathname === '/_next/image') {
    try {
      const source = new URL(url.searchParams.get('url'), base);
      const candidate = path.posix.extname(source.pathname);
      extension = /^\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i.test(candidate) ? candidate : '.png';
    } catch { extension = '.png'; }
  }
  const suffix = url.search ? '.' + crypto.createHash('sha1').update(url.search).digest('hex').slice(0, 8) + extension : '';
  return prefix + external + pathname + suffix;
}
