import {validBuild,canonical,MODEL,COURSE_VERSION} from './engineering.js';
export const localId=()=>globalThis.crypto?.randomUUID?.() || `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
export const HANGAR_KEY='afl:hangar:v22-reconstruction';
export function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function readHangar(){const data=readLocal(HANGAR_KEY,[]);return Array.isArray(data)?data.filter(a=>a&&typeof a.name==='string'&&validBuild(a.build)&&Array.isArray(a.history)&&Array.isArray(a.results)).slice(0,12):[];}
export function saveAircraft(items,build,name,id){if(!validBuild(build))throw Error('Invalid or incompatible aircraft.');const old=items.find(a=>a.id===id);if(!old&&items.length>=12)throw Error('Hangar full: twelve aircraft.');const revised=old&&canonical(old.build,true)!==canonical(build,true);const a={id:old?.id||localId(),name:String(name||old?.name||'MY AIRCRAFT').slice(0,32),build:{...build},revision:old?old.revision+(revised?1:0):1,history:revised?[{build:old.build,revision:old.revision},...old.history].slice(0,12):old?.history||[],results:old?.results||[],model:MODEL};return [a,...items.filter(x=>x.id!==a.id)];}
export function recordResult(items,id,result){return items.map(a=>a.id!==id?a:{...a,results:[{...result,build:{...a.build},revision:a.revision,model:MODEL,courseVersion:COURSE_VERSION},...a.results].slice(0,20)});}
