import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NAV_LINKS} from '../src/site.config.js';
import {COMMUNITY} from '../src/sporting.js';
const src=f=>readFileSync(new URL('../src/'+f,import.meta.url),'utf8');

test('no visitor-facing navigation or orientation depends on knowing Elena',()=>{
 assert.deepEqual(NAV_LINKS.map(l=>l.label),['Buy Book','Book Map','Real World']);
 assert.ok(!/ELENA|Elena&rsquo;s Bench/.test(src('components/ElenasBench.jsx').replace(/function ElenasBench|ElenasBench/g,'')));
 const map=src('components/FrontMap.jsx');assert.ok(!/>\s*Elena\s*</.test(map));assert.ok(map.includes('The Front'));assert.ok(!map.includes('>Layers<'));
});

test('race setup: four-beat agenda, no email capture, no custom accent, no engineering details',()=>{
 const ns=src('components/NationsSeries.jsx'),b=src('components/ElenasBench.jsx');
 for(const beat of ['BUILD YOUR DRONE','BECOME A PILOT','REPRESENT YOUR COUNTRY','RACE THE WORLD’S BEST'])assert.ok(ns.includes(beat),beat);
 assert.ok(!/type="email"|consent/.test(ns));assert.ok(!b.includes('Custom accent'));assert.ok(!b.includes('Engineering details'));
 assert.ok(ns.includes('<Helmet build={aircraft.build}'),'helmet inherits the aircraft paint');
});

test('post-race: Talon is introduced before the book, and the bridge has one action',()=>{
 const ns=src('components/NationsSeries.jsx');
 for(const t of ['YOUR TIME','NOBODY HAS BEATEN TALON.','MEET TALON','THE WORLD’S BEST','SHARE YOUR RACE','Now enter his world','READ THE BEGINNING'])assert.ok(ns.includes(t),t);
 const at=ns.indexOf('className="ns-bridge"'),bridge=ns.slice(at,ns.indexOf('</section>',at));
 assert.equal((bridge.match(/<button/g)||[]).length,1);assert.ok(!bridge.includes('LAUNCH LIST'));
});

test('book side ends at Author, then Buy/Share, then collapsed Explore More',()=>{
 const app=src('App.jsx'),order=['<ReadSection','<BuySection','<Hero','<IntroContext','<Community','<AuthorSection','<BookEnding','<ExploreMore','<Footer'].map(t=>app.indexOf(t));
 assert.ok(order.every((v,i)=>v>0&&(!i||v>order[i-1])),'section order');
 for(const t of ['<Glossary','<ContributeSection','<FieldSupply','<LaunchSignup'])assert.ok(!app.includes(t),`${t} is not in the linear page`);
 const e=src('components/BookEnding.jsx');for(const l of ['Fact + Future','Real World','Field Supply','Contributors + Credits','Contact'])assert.ok(e.includes(`label: '${l}'`),l);
 assert.ok(e.includes('{open.has(row.id) && <div'),'rows render their content only when opened');
});

test('reader starts with prose under the Book 1 header',()=>{
 const r=src('components/ReadSection.jsx');assert.ok(r.includes('The American Foreign Legion &mdash; Book 1'));assert.ok(!r.includes('read__tabs'));assert.ok(!r.includes('read__gate'));
});

test('community board is inhabited: sixteen racers, sixteen nations, every one with a time',()=>{
 assert.equal(COMMUNITY.length,16);assert.equal(new Set(COMMUNITY.map(p=>p.country)).size,16);assert.ok(COMMUNITY.every(p=>p.time>19&&p.time<30));
});

test('share links round-trip and reject junk',async()=>{
 globalThis.location={origin:'https://aflvolunteer.com',pathname:'/',search:''};
 const {challengeUrl,readChallenge,shareText}=await import('../src/raceShare.js');
 const url=challengeUrl({callsign:'NOMAD',country:'Côte d’Ivoire',time:19.83,position:3});
 const back=readChallenge(new URL(url).search);assert.deepEqual(back,{callsign:'NOMAD',country:'Côte d’Ivoire',time:19.83,position:3});
 assert.equal(readChallenge('?race=garbage'),null);assert.match(shareText(back),/Nobody has beaten Talon/);
});
