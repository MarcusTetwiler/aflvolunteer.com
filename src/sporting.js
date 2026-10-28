import {EXAMPLES} from './engineering.js';
export const SPONSORS=[
 {id:'industry',label:'Engineering partner',sector:'Defense industry',brands:[{id:'helix',name:'HELIX AEROSYSTEMS',mark:'HX'},{id:'vectorworks',name:'VECTORWORKS',mark:'VW'},{id:'meridian',name:'MERIDIAN DYNAMICS',mark:'MD'}]},
 {id:'pharma',label:'Life sciences partner',sector:'Pharmaceutical industry',brands:[{id:'aeon',name:'AEON BIO',mark:'Æ'},{id:'novara',name:'NOVARA LABS',mark:'N+'},{id:'luma',name:'LUMA SCIENCES',mark:'LS'}]},
 {id:'fashion',label:'Style partner',sector:'High fashion',brands:[{id:'atelier',name:'ATELIER NOIR',mark:'AN'},{id:'forma',name:'FORMA / 09',mark:'F/09'},{id:'voss',name:'MAISON VOSS',mark:'MV'}]}
];
export const defaultSponsors=()=>Object.fromEntries(SPONSORS.map(s=>[s.id,s.brands[0].id]));
export function validSponsors(s){return Boolean(s&&SPONSORS.every(c=>c.brands.some(b=>b.id===s[c.id])));}
export function pilotEntry(p={}){return {callsign:typeof p.callsign==='string'?p.callsign.slice(0,24):'',country:typeof p.country==='string'?p.country:'United States',sponsors:validSponsors(p.sponsors)?p.sponsors:defaultSponsors()};}
export const RIVALS=[{name:'TALON',country:'United States',time:11.0},{name:'VECTOR',country:'Japan',time:18.8},{name:'KESTREL',country:'United Kingdom',time:20.6},{name:'ROOK',country:'Germany',time:22.4},{name:'WREN',country:'Brazil',time:24.5}];
const names=['KITE','SABLE','APEX','MONSOON','ORBIT','CIRRUS','EMBER','VOLT','DRIFT','NOVA','ECHO','SOL','FLINT','GHOST','RIFT','TIDAL'];
const countries=['Japan','France','United States','India','Brazil','United Kingdom','Canada','Germany','Australia','South Korea','Italy','Spain','South Africa','Poland','Mexico','New Zealand'];
const accents=['#d14757','#d8c49b','#719fba','#e6ac3d','#66a47f','#a68fbb','#dd7843','#e0c950'];
export const COMMUNITY=names.map((callsign,i)=>({id:'showcase-'+i,fictional:true,callsign,country:countries[i],sponsors:defaultSponsors(),aircraft:EXAMPLES[i%8].name+'-'+String(i+1).padStart(2,'0'),build:{...EXAMPLES[i%8].build,engineeringVersion:'2.3',finish:i<8?'charcoal':'metal',accent:accents[i%8],livery:['061','063','064','067'][i%4],sensor:i<8?'wide':'dual',markings:i%2?'band':'stencil'}}));
