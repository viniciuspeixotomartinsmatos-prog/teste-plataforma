// Pointer velocity is measured in artwork pixels per nominal frame, rather
// than per browser event. The first event never produces an artificial kick.
export function cosmicPointer(previous,at,now,elapsed){
 const delta=previous&&Number.isFinite(previous.at)?Math.max(8,Math.min(100,now-previous.at)):0;
 return {...at,at:now,speed:delta?Math.min(38,Math.hypot(previous.x-at.x,previous.y-at.y)*16.67/delta):0,until:elapsed+90};
}
export const idleCosmicPointer=()=>({x:-1000,y:-1000,speed:0,until:0});
