const hlsPath='/previews/expanded/21st-8712cd5ba9a6.html';
const nativeProbe='return u.canPlayType("application/vnd.apple.mpegurl")!==""||u.canPlayType("audio/mpegurl")!==""';
const retainedVideos=new Map([
 ['21st-84b5c4cf7d2f','c721f302e4673e41bbd2b395'],
 ['21st-000947d76d8c','a173a27bb35f6ab1e3f1fa8f'],
]);
export function retainedVideoVariant(url){
 const id=/^\/previews\/expanded\/(21st-[a-f0-9]+)\.html$/.exec(new URL(url,'https://nitido.invalid').pathname)?.[1];
 const asset=retainedVideos.get(id);if(!asset)return null;
 const stem='/assets/demo-cache/'+asset;
 return {original:stem+'.mp4',compatible:stem+'.compat.webm'};
}

// The retained player ships both its native and HLS.js paths. A native
// “maybe” is not evidence of HLS support; keep the original fallback when
// MSE cannot decode the stream's AVC/AAC codecs.
export function adaptRetainedPreview(html,url){
 const video=retainedVideoVariant(url);
 if(video){
  // Only change the recovered media binding. Keep the original MP4 and
  // poster, and use the frame-verified VP9 derivative when supported.
  const original=JSON.stringify(video.original),compatible=JSON.stringify(video.compatible);
  return html.replace(':'+original,`:(${`document.createElement("video").canPlayType('video/webm; codecs="vp9"')`}?${compatible}:${original})`);
 }
 if(new URL(url,'https://nitido.invalid').pathname!==hlsPath)return html;
 return html.replace(nativeProbe,`const native=u.canPlayType("application/vnd.apple.mpegurl")||u.canPlayType("audio/mpegurl");return native==="probably"||Boolean(native)&&!(globalThis.MediaSource?.isTypeSupported('video/mp4; codecs="avc1.42E01E"')&&globalThis.MediaSource?.isTypeSupported('audio/mp4; codecs="mp4a.40.2"'))`);
}
