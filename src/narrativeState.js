export const NARRATIVE_KEY='afl:narrative:v22';
export const initialNarrative=()=>({version:2.2,stage:'idle',eligible:false,decision:null,profileExit:null,mapStep:0,bookSeen:false});
export function narrativeReducer(s,a){switch(a.type){
 case 'begin':return {...s,stage:'talon',profileExit:null,eligible:a.result?.flagged===true&&!a.result.dnf&&!a.result.assisted};
 case 'profile-exit':return s.stage==='talon'?{...s,profileExit:a.skipped?'skipped':'completed',stage:'broadcast-ended'}:s;
 case 'closure':return s.stage==='broadcast-ended'?{...s,stage:s.eligible&&!s.decision?'offer':'book',bookSeen:!(s.eligible&&!s.decision)||s.bookSeen}:s;
 case 'choose':return s.stage==='offer'&&['accept','decline'].includes(a.choice)?{...s,decision:a.choice,stage:a.choice==='accept'?'map':'glimpse'}:s;
 case 'step':return s.stage==='map'&&Number.isInteger(a.step)&&a.step>=0&&a.step<4?{...s,mapStep:a.step}:s;
 case 'book':return ['map','glimpse','idle','complete','book'].includes(s.stage)?{...s,stage:'book',bookSeen:true}:s;
 case 'leave':return {...s,stage:'complete'};
 default:return s;}}
export function validNarrative(s){return s?.version===2.2&&['idle','talon','broadcast-ended','offer','map','glimpse','book','complete'].includes(s.stage)&&[null,'accept','decline'].includes(s.decision)&&typeof s.eligible==='boolean'&&typeof s.bookSeen==='boolean'&&[null,'skipped','completed'].includes(s.profileExit)&&Number.isInteger(s.mapStep)&&s.mapStep>=0&&s.mapStep<4&&(!['offer','map','glimpse'].includes(s.stage)||(s.eligible&&s.profileExit))&&(s.stage!=='map'||s.decision==='accept')&&(s.stage!=='glimpse'||s.decision==='decline')&&(s.stage!=='offer'||!s.decision);}
