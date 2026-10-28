import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GATES,GATE_COUNT,SECTORS,START_S,FINISH_S,COURSE3D_VERSION,freshFlight3d,stepFlight3d,autopilot,rivalAt,ghostKey3d} from '../src/raceCourse3d.js';
import {classify,FINISH} from '../src/raceModel.js';
import {EXAMPLES,spec} from '../src/engineering.js';
import {RIVALS} from '../src/sporting.js';

function fly(build,{boost=true,controller=autopilot}={}){let s=freshFlight3d(),i=0;while(!s.done&&i++<120*120)s=stepFlight3d(s,controller(s,{boost}),build);return {...classify(s),state:s};}

test('3D sprint keeps 24 ordered gates across three named sectors',()=>{
 assert.equal(GATES.length,GATE_COUNT);assert.equal(GATE_COUNT,24);
 assert.ok(GATES.every((g,i)=>!i||g.s>GATES[i-1].s));
 assert.deepEqual([...new Set(GATES.map(g=>g.sectorName))],SECTORS);
 assert.ok(GATES.at(-1).finish);assert.ok(COURSE3D_VERSION.includes('3d'));
});

test('every example aircraft finishes under the guided controller, and builds produce different times',()=>{
 const runs=EXAMPLES.map(a=>fly(a.build));
 for(const r of runs){assert.equal(r.dnf,false);assert.equal(r.state.gate,24);}
 assert.ok(new Set(runs.map(r=>r.elapsed.toFixed(1))).size>=6);
 assert.deepEqual(fly(EXAMPLES[0].build).elapsed,runs[0].elapsed);
});

test('Talon cannot be beaten, even at the physical maximum, and second place is reachable',()=>{
 assert.ok(RIVALS[0].time<(FINISH_S-START_S)/(50*1.34));
 const best=Math.min(...EXAMPLES.map(a=>fly(a.build).elapsed));
 assert.ok(best>RIVALS[0].time);assert.ok(best<RIVALS[1].time,'a strong build should be able to reach the private offer');
});

test('missed gates add 2.5 s and damage; idle flight never soft-locks the course',()=>{
 const r=fly(EXAMPLES[0].build,{controller:()=>({x:0,y:0})});
 assert.ok(r.state.gate>0);assert.ok(r.state.penalty>=2.5*(r.state.gate-r.state.cleared));
 assert.ok(r.state.done);
});

test('terminal state is frozen and controls are bounded',()=>{
 const s={...freshFlight3d(),done:true};assert.equal(stepFlight3d(s,{x:9},EXAMPLES[0].build),s);
 const n=stepFlight3d(freshFlight3d(),{x:99,y:-99},EXAMPLES[0].build,999);assert.ok(n.time<=1/30+1e-9);
});

test('finished runs classify against the shared World Final roster',()=>{
 const r=fly(EXAMPLES[0].build);assert.equal(r.state.z,FINISH);assert.equal(r.position,1+RIVALS.filter(x=>x.time<=r.elapsed).length);
 assert.equal(classify(r.state,true).flagged,false);
});

test('rival field and ghost keys are deterministic and cosmetic-independent',()=>{
 assert.deepEqual(rivalAt(RIVALS[1],5,1),rivalAt(RIVALS[1],5,1));assert.ok(rivalAt(RIVALS[0],RIVALS[0].time,0).done);
 const b=EXAMPLES[0].build;assert.equal(ghostKey3d(b),ghostKey3d({...b,accent:'#123456',finish:'metal'}));
 assert.deepEqual(spec(b),spec({...b,accent:'#123456'}));
});

test('3D race lazy-loads three.js and keeps the classic course as a WebGL fallback',()=>{
 const ns=readFileSync(new URL('../src/components/NationsSeries.jsx',import.meta.url),'utf8');
 assert.ok(ns.includes("lazy(()=>import('./FPVRace'))"));
 const fpv=readFileSync(new URL('../src/components/FPVRace.jsx',import.meta.url),'utf8');
 assert.ok(fpv.includes('FPVRaceClassic')&&fpv.includes('webglAvailable'));
});
