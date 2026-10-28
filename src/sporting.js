import {EXAMPLES} from './engineering.js';
// Pilot partners. Fictional marks for now: real brands (aerospace / performance / life
// sciences) need trademark and licensing clearance before public use. Swap them here; every
// screen and the trackside boards read from this list.
export const SPONSORS=[
 {id:'industry',label:'Aerospace partner',sector:'Aerospace',brands:[{id:'helix',name:'HELIX AEROSYSTEMS',mark:'HX'},{id:'vectorworks',name:'VECTORWORKS',mark:'VW'},{id:'meridian',name:'MERIDIAN DYNAMICS',mark:'MD'}]},
 {id:'performance',label:'Performance partner',sector:'Performance',brands:[{id:'vanta',name:'VANTA ATHLETIC',mark:'VA'},{id:'kinetik',name:'KINETIK',mark:'K/'},{id:'overstride',name:'OVERSTRIDE',mark:'OS'}]},
 {id:'pharma',label:'Life sciences partner',sector:'Life sciences',brands:[{id:'aeon',name:'AEON BIO',mark:'Æ'},{id:'novara',name:'NOVARA LABS',mark:'N+'},{id:'luma',name:'LUMA SCIENCES',mark:'LS'}]}
];
export const defaultSponsors=()=>Object.fromEntries(SPONSORS.map(s=>[s.id,s.brands[0].id]));
export function validSponsors(s){return Boolean(s&&SPONSORS.every(c=>c.brands.some(b=>b.id===s[c.id])));}
export function pilotEntry(p={}){return {callsign:typeof p.callsign==='string'?p.callsign.slice(0,24):'',country:typeof p.country==='string'?p.country:'United States',sponsors:validSponsors(p.sponsors)?p.sponsors:defaultSponsors()};}
// Talon flies a black-and-silver streamliner: the reveal and the race both render it.
export const TALON_BUILD={chassis:'speed',material:'carbon',power:'highrpm',sensor:'minimal',system:'aggressive',finish:'charcoal',accent:'#c3c8cc',motor:'sprint',propeller:'low-drag',illumination:'edge'};
export const RIVALS=[{name:'TALON',country:'United States',time:11.0},{name:'VECTOR',country:'Japan',time:19.2},{name:'KESTREL',country:'United Kingdom',time:20.8},{name:'ROOK',country:'Germany',time:22.6},{name:'WREN',country:'Brazil',time:24.8}];
const names=['KITE','SABLE','APEX','MONSOON','ORBIT','CIRRUS','EMBER','VOLT','DRIFT','NOVA','ECHO','SOL','FLINT','GHOST','RIFT','TIDAL'];
const countries=['Japan','France','United States','India','Brazil','United Kingdom','Canada','Germany','Australia','South Korea','Italy','Spain','South Africa','Poland','Mexico','New Zealand'];
const accents=['#d14757','#d8c49b','#719fba','#e6ac3d','#66a47f','#a68fbb','#dd7843','#e0c950'];
const times=[19.64,20.12,20.47,20.93,21.38,21.71,22.05,22.46,22.9,23.31,23.86,24.4,25.02,25.71,26.48,27.9];
export const COMMUNITY=names.map((callsign,i)=>({id:'showcase-'+i,fictional:true,time:times[(i*7)%16],callsign,country:countries[i],sponsors:defaultSponsors(),aircraft:EXAMPLES[i%8].name+'-'+String(i+1).padStart(2,'0'),build:{...EXAMPLES[i%8].build,engineeringVersion:'2.3',finish:i<8?'charcoal':'metal',accent:accents[i%8],livery:['061','063','064','067'][i%4],sensor:i<8?'wide':'dual',markings:i%2?'band':'stencil'}}));
