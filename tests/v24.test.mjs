import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAircraft} from '../src/aircraft3d.js';
import {Box3,Vector3} from 'three';
import {BENCH_STEPS} from '../src/data/benchCatalog.js';
import {defaults,EXAMPLES} from '../src/engineering.js';
import {RIVALS} from '../src/sporting.js';

const src=f=>readFileSync(new URL('../src/'+f,import.meta.url),'utf8');
function fingerprint(build){const {group}=buildAircraft(build);let meshes=0,verts=0;const colors=new Set();group.traverse(o=>{if(o.isMesh){meshes++;verts+=o.geometry.attributes.position.count;colors.add(o.material.color?.getHexString());}});const size=new Box3().setFromObject(group).getSize(new Vector3()).toArray().map(v=>v.toFixed(2)).join('x');return `${meshes}/${verts}/${size}/${[...colors].sort().join(',')}`;}

test('every bench option builds a 3D aircraft and visibly changes it',()=>{
 const base=defaults(),baseFp=fingerprint(base);
 for(const step of BENCH_STEPS)for(const option of step.options){
  const b={...base,[step.id]:option.id};const fp=fingerprint(b);
  assert.ok(fp.split('/')[0]>10,`${step.id}:${option.id} builds`);
  if(option.id!==base[step.id])assert.notEqual(fp,baseFp,`${step.id}:${option.id} should look different from the default`);
 }
});

test('the eight example machines are eight distinct silhouettes',()=>{
 assert.equal(new Set(EXAMPLES.map(a=>fingerprint(a.build))).size,EXAMPLES.length);
});

test('rival field is ordered and Talon leads',()=>{
 assert.equal(RIVALS[0].name,'TALON');assert.ok(RIVALS.every((r,i)=>!i||r.time>RIVALS[i-1].time));
});

test('book side opens on the skippable sample, then buy; mid-page hub removed',()=>{
 const app=src('App.jsx');
 assert.ok(app.indexOf('<ReadSection')<app.indexOf('<BuySection'));
 assert.ok(!app.includes('<ExperienceHub'));
 assert.ok(src('components/ReadSection.jsx').includes('Skip to the book'));
});

test('naming is consolidated and Field Supply is a working waitlist',()=>{
 const cfg=src('site.config.js'),fs=src('components/FieldSupply.jsx');
 assert.ok(cfg.includes("label: 'Elena’s Bench'")&&cfg.includes("label: 'Fact + Future'"));
 assert.ok(!/label: 'Builds'|label: 'Glossary'/.test(cfg));
 assert.ok(fs.includes('list="field-supply"'));assert.ok(!fs.includes('<strong>0</strong>'));
 assert.ok(fs.includes("data.persisted === false"),'waitlist must not claim success on a failed save');
});
