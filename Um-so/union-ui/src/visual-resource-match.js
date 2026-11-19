// Deterministic visual descriptors; no external model, upload or AI claim.
export function visualDescriptor(rgba,width,height){
 const sums=[0,0,0],squares=[0,0,0],hist=Array(8).fill(0);let count=0,dx=0,dy=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=4*(y*width+x);if(rgba[i+3]<32)continue;const rgb=[rgba[i]/255,rgba[i+1]/255,rgba[i+2]/255],lum=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];count++;for(let c=0;c<3;c++){sums[c]+=rgb[c];squares[c]+=rgb[c]**2;}hist[Math.min(7,Math.floor(lum*8))]++;if(x)dx+=Math.abs(rgba[i]-rgba[i-4])/255;if(y)dy+=Math.abs(rgba[i]-rgba[i-width*4])/255;}
 if(!count)return null;return [...sums.map(v=>v/count),...squares.map((v,c)=>Math.sqrt(Math.max(0,v/count-(sums[c]/count)**2))),...hist.map(v=>v/count),dx/count,dy/count].map(v=>Math.round(v*10000)/10000);
}
export function rankVisualResources(vector,rows,{limit=6}={}){
 if(!Array.isArray(vector)||vector.length!==16||vector.some(v=>!Number.isFinite(v)))return [];
 return rows.filter(r=>Array.isArray(r.vector)&&r.vector.length===16&&r.vector.every(Number.isFinite)).map(row=>({...row,distance:row.vector.reduce((n,v,i)=>n+(v-vector[i])**2*(i<3?2:1),0)})).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id)).slice(0,Math.max(0,Math.min(12,limit))).map(({vector,...row})=>row);
}
