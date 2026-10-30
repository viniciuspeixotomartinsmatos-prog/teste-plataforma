export const PROJECT_VERSION=1;
export const MAX_SECTIONS=30;
export const DEFAULT_SETTINGS={background:'',foreground:'',accent:'',font:'original',fontSize:16,radius:null,scale:1,paused:false,speed:1,texts:{}};
const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
const color=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value:'';
export function cleanSettings(value={}){
 value=value&&typeof value==='object'?value:{};
 const texts={};if(value.texts&&typeof value.texts==='object')for(const [key,text]of Object.entries(value.texts).slice(0,80))if(/^text-\d+$/.test(key)&&typeof text==='string')texts[key]=text.slice(0,2000);
 return{background:color(value.background),foreground:color(value.foreground),accent:color(value.accent),font:['original','system','serif','mono'].includes(value.font)?value.font:'original',fontSize:bounded(value.fontSize??16,12,28,16),radius:value.radius==null?null:bounded(value.radius,0,40,12),scale:bounded(value.scale??1,.5,1.5,1),paused:value.paused===true,speed:bounded(value.speed??1,.25,2,1),texts};
}
export function cleanComponentConfig(id,value={}){
 if(id!=='magic--particles')return undefined;
 value=value&&typeof value==='object'?value:{};
 return{quantity:Math.round(bounded(value.quantity??180,20,600,180)),ease:bounded(value.ease??60,10,120,60),size:bounded(value.size??.8,.2,3,.8),color:color(value.color)||'#b9f9ab',vx:bounded(value.vx??0,-1,1,0),vy:bounded(value.vy??0,-1,1,0)};
}
export const newId=()=>crypto.randomUUID();
export function newProject(title='Página sem título'){return{version:PROJECT_VERSION,id:newId(),title,theme:'dark',sections:[],updatedAt:new Date().toISOString()};}
export function newSection(componentId){return{id:newId(),componentId,height:560,mobileHeight:560,enabled:true,settings:cleanSettings(),config:cleanComponentConfig(componentId)};}
export function parseProject(value,knownIds){
 if(!value||value.version!==PROJECT_VERSION||!Array.isArray(value.sections)||value.sections.length>MAX_SECTIONS)throw Error('Use um projeto exportado pelo montador, com até 30 seções.');
 const ids=new Set();
 const sections=value.sections.map(section=>{
  if(!section||typeof section.componentId!=='string'||!knownIds.has(section.componentId))throw Error('Este projeto contém um componente indisponível no catálogo.');
  let id=typeof section.id==='string'&&/^[\w-]{1,80}$/.test(section.id)?section.id:newId();if(ids.has(id))id=newId();ids.add(id);
  return{id,componentId:section.componentId,height:bounded(section.height??560,180,1600,560),mobileHeight:bounded(section.mobileHeight??section.height??560,180,1600,560),enabled:section.enabled!==false,settings:cleanSettings(section.settings),config:cleanComponentConfig(section.componentId,section.config)};
 });
 return{version:PROJECT_VERSION,id:typeof value.id==='string'&&/^[\w-]{1,80}$/.test(value.id)?value.id:newId(),title:String(value.title||'Página importada').slice(0,100),theme:value.theme==='light'?'light':'dark',sections,updatedAt:new Date().toISOString()};
}
export function editProject(project,action){
 let next;
 if(action.type==='add'){if(project.sections.length>=MAX_SECTIONS)throw Error('Este projeto já tem 30 seções.');next={...project,sections:[...project.sections,newSection(action.componentId)]};}
 else if(action.type==='remove')next={...project,sections:project.sections.filter(s=>s.id!==action.id)};
 else if(action.type==='duplicate'){if(project.sections.length>=MAX_SECTIONS)throw Error('Este projeto já tem 30 seções.');const index=project.sections.findIndex(s=>s.id===action.id);if(index<0)return project;const sections=[...project.sections];sections.splice(index+1,0,{...structuredClone(sections[index]),id:newId()});next={...project,sections};}
 else if(action.type==='move'){const sections=[...project.sections],from=sections.findIndex(s=>s.id===action.id);if(from<0)return project;const to=Math.max(0,Math.min(sections.length-1,action.to));if(from===to)return project;const [section]=sections.splice(from,1);sections.splice(to,0,section);next={...project,sections};}
 else if(action.type==='section')next={...project,sections:project.sections.map(s=>s.id===action.id?{...s,...action.patch,settings:action.patch.settings?cleanSettings(action.patch.settings):s.settings}:s)};
 else if(action.type==='title')next={...project,title:action.title.slice(0,100)};
 else if(action.type==='theme')next={...project,theme:action.theme==='light'?'light':'dark'};
 else return project;
 return{...next,updatedAt:new Date().toISOString()};
}
export function historyReducer(history,action){
 if(action.type==='reset')return{past:[],present:action.project,future:[]};
 if(action.type==='undo'){if(!history.past.length)return history;return{past:history.past.slice(0,-1),present:history.past.at(-1),future:[history.present,...history.future].slice(0,40)};}
 if(action.type==='redo'){if(!history.future.length)return history;return{past:[...history.past,history.present].slice(-40),present:history.future[0],future:history.future.slice(1)};}
 const next=action.project;if(!next||next===history.present)return history;
 const merged=action.group&&history.group===action.group&&Date.now()-history.at<600;
 return{past:merged?history.past:[...history.past,history.present].slice(-40),present:next,future:[],group:action.group,at:Date.now()};
}
