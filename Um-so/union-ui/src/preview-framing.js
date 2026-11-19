const defaultRatio = 16 / 9;
const modes = ['smart', 'cover', 'contain', 'custom'];
const backgrounds = ['neutral', 'dark', 'light', 'sampled'];
const unit = (value, fallback) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

export function normalizeFraming(value = {}) {
 const region = value.region;
 const hasRegion = region && ['left', 'right', 'top', 'bottom'].every(key => Number.isFinite(region[key]) && region[key] >= 0 && region[key] <= 1)
  && region.left < region.right && region.top < region.bottom;
 return {
  mode: modes.includes(value.fit) ? value.fit : 'smart',
  point: [unit(value.x ?? value.focalPoint?.x, .5), unit(value.y ?? value.focalPoint?.y, .5)],
  customFit: value.customFit === 'cover' ? 'cover' : 'contain',
  zoom: Number.isFinite(value.zoom) ? Math.min(1.15, Math.max(.8, value.zoom)) : 1,
  safeArea: typeof value.safeArea === 'boolean' ? value.safeArea : undefined,
  background: backgrounds.includes(value.background) ? value.background : 'neutral',
  color: /^#[a-f0-9]{6}$/i.test(value.color || '') ? value.color : undefined,
  region: hasRegion ? region : undefined
 };
}

export function framePreview(item, dimensions, targetRatio = defaultRatio) {
 const framing = normalizeFraming(item.previewFraming ?? {});
 const ratio = dimensions?.width > 0 && dimensions.height > 0 ? dimensions.width / dimensions.height : 0;
 const isInterface = ['Heroes', 'Dashboards', 'Authentication', 'Navigation', 'Pricing', 'Footers'].includes(item.category)
  || ['template', 'page', 'block', 'app'].includes(item.kind);
 const ratioMatch = ratio ? Math.min(ratio / targetRatio, targetRatio / ratio) : 0;
 const point = [...framing.point], region = framing.region;
 if(region&&framing.mode==='smart'&&ratioMatch>0&&ratioMatch<1){
  const axis=ratio>targetRatio?0:1;
  const [start,end]=axis===0?[region.left,region.right]:[region.top,region.bottom];
  const min=unit((end-ratioMatch)/(1-ratioMatch),0),max=unit(start/(1-ratioMatch),1);
  if(min<=max)point[axis]=Math.max(min,Math.min(max,point[axis]));
 }
 const left = ratio > targetRatio ? (1 - ratioMatch) * point[0] : 0;
 const top = ratio && ratio < targetRatio ? (1 - ratioMatch) * point[1] : 0;
 const right = ratio > targetRatio ? left + ratioMatch : 1;
 const bottom = ratio && ratio < targetRatio ? top + ratioMatch : 1;
 const clipsRegion = region && (region.left < left-1e-6 || region.right > right+1e-6 || region.top < top-1e-6 || region.bottom > bottom+1e-6);
 const safeArea = framing.safeArea ?? Boolean(isInterface || region || ratioMatch < .92);
 const threshold = region ? .74 : safeArea ? .94 : .84;
 const smartFit = ratioMatch >= threshold && !clipsRegion ? 'cover' : 'contain';
 const fit = framing.mode === 'custom' ? framing.customFit : framing.mode === 'smart' ? smartFit : framing.mode;
 return {
  fit, safeArea,
  extend: framing.mode==='smart'&&fit==='contain'&&ratio>0&&ratioMatch<.98&&['neutral','sampled'].includes(framing.background),
  point,
  zoom: framing.mode==='custom' ? (safeArea?Math.min(1,framing.zoom):framing.zoom) : 1,
  review: framing.mode === 'smart' && (!ratio || ratioMatch < threshold || Boolean(clipsRegion)),
  background: framing.background,
  color: framing.background==='sampled'?framing.color:undefined
 };
}

export function previewLabel(item) {
 if (item.recoveryMode === 'recorded-video') return item.video || item.previewPath ? 'Vídeo' : 'Referência visual';
 if (item.recoveryMode?.includes('reference')) return 'Referência visual';
 if (item.video) return 'Vídeo';
 if (item.runtimePreviewPath || item.previewPath) return 'Interativo';
 if (item.image) return 'Imagem';
 return 'Referência visual';
}

export function applyCatalogFraming(item,overrides,mediaById) {
 const asset=Object.hasOwn(mediaById,item.id)?mediaById[item.id]:null;
 const previewMedia=asset?.source===(item.image||null)?asset:undefined;
 const override=overrides&&Object.hasOwn(overrides,item.id)?overrides[item.id]:null;
 if(!previewMedia&&!override)return item;
 return {...item,previewMedia,previewFraming:{...item.previewFraming,...previewMedia?.previewFraming,...override}};
}
