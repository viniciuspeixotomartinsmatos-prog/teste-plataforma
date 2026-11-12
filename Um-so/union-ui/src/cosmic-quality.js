export function cosmicDimensions(sourceWidth,sourceHeight,{mobile=false,constrained=false}={}){
 const cap=constrained?480:mobile?640:970,width=Math.min(cap,Math.round(sourceWidth*.58));
 return {width,height:Math.round(sourceHeight*width/(sourceWidth*.58)),mobile:mobile||constrained};
}
export function createCosmicQuality(){let frames=0,total=0,slow=0,constrained=false;return {observe(ms){if(constrained||!Number.isFinite(ms))return false;frames++;total+=ms;if(ms>24)slow++;if(frames<45)return false;const lower=total/frames>16||slow>=9;frames=total=slow=0;if(lower){constrained=true;return true;}return false;},get constrained(){return constrained;}};}
