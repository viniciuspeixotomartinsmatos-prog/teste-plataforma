const decode = value => Int8Array.from(atob(value), character => character.charCodeAt(0));

export function semanticIndex(model) {
  const words = new Map(model.words.map((word,index)=>[word,index]));
  const basis = decode(model.queries), documents = decode(model.documents);
  return function nearest(terms) {
    const query = new Float32Array(model.size);
    for (const term of terms) {
      const index = words.get(term);
      if (index === undefined) continue;
      for (let k=0;k<query.length;k++) query[k]+=basis[index*query.length+k];
    }
    const norm = Math.hypot(...query);
    if (!norm) return new Map();
    const hits = [];
    for (let i=0;i<model.ids.length;i++) {
      let dot=0;
      for(let k=0;k<query.length;k++) dot+=query[k]*documents[i*query.length+k];
      const similarity=dot/(127*norm);
      if(similarity>=0.72) hits.push([model.ids[i],similarity]);
    }
    return new Map(hits.sort((a,b)=>b[1]-a[1]).slice(0,30));
  };
}
