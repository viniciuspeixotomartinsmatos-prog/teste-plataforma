export const planNames={free:'Gratuito',pro:'Pro',max:'Max'};
const rank={free:0,pro:1,max:2};

export const planQuotas={
 free:{prompt:5,studio:3,audit:0},
 pro:{prompt:100,studio:40,audit:15},
 max:{prompt:null,studio:null,audit:null}
};

export const freePromptIds=['reactbits--aurora','reactbits--orb','reactbits--magic-bento','aceternity--background-beams','kokonut-background-paths'];

export const toolPlans={
 skills:'free','background-studio':'free',
 'raio-x':'pro','sound-lab':'pro','texture-lab':'pro','shape-magic':'pro',
 'design-systems':'max','center-stage':'max'
};

export const creativeTools=['background-studio','sound-lab','texture-lab','shape-magic','center-stage'];
export function includesPlan(plan,minimum){return Object.hasOwn(rank,plan)&&Object.hasOwn(rank,minimum)&&rank[plan]>=rank[minimum];}

export function planPermission(plan,action,resource){
 if(action==='prompt')return {allowed:includesPlan(plan,'pro')||freePromptIds.includes(resource),limit:planQuotas[plan]?.prompt};
 if(action==='audit')return {allowed:includesPlan(plan,'pro'),limit:planQuotas[plan]?.audit};
 if(action==='studio')return {allowed:creativeTools.includes(resource)&&includesPlan(plan,toolPlans[resource]),limit:planQuotas[plan]?.studio};
 return {allowed:false,limit:0};
}
