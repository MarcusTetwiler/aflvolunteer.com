import {Component,Suspense,lazy,useCallback,useEffect,useReducer,useRef,useState} from 'react';
import ChampionshipMedia from './ChampionshipMedia';
import {MEDIA} from '../media.config';
import {RIVALS,SPONSORS,TALON_BUILD,pilotEntry} from '../sporting';
import {countryFlag,countryColors,COUNTRIES} from '../countries';
import DroneRender from './DroneRender';
import Helmet from './Helmet';
import {EXAMPLES,validBuild,spec,personality} from '../engineering';
import {localId,readHangar,saveAircraft,recordResult,readLocal,writeLocal,HANGAR_KEY} from '../localGarage';
import {initialNarrative,narrativeReducer,validNarrative,NARRATIVE_KEY} from '../narrativeState';
import {BOOK} from '../site.config';
import {trackJourney} from '../analytics';
import {rememberRace,shareRace,readChallenge} from '../raceShare';
import './NationsSeries.css';
const FrontMap=lazy(()=>import('./FrontMap'));
const FPVRace=lazy(()=>import('./FPVRace'));
class MapBoundary extends Component{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<p role="status">Map unavailable. Continue to the novel.</p>:this.props.children;}}
function storedStory(){const s=readLocal(NARRATIVE_KEY,null);return validNarrative(s)?s:initialNarrative();}
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const AGENDA=['BUILD YOUR DRONE','BECOME A PILOT','REPRESENT YOUR COUNTRY','RACE THE WORLD’S BEST'];
const pad=n=>String(n).padStart(2,'0');
const ordinal=n=>n===1?'1st':n===2?'2nd':n===3?'3rd':`${n}th`;

// Four-beat agenda between the hero and the garage: one cinematic beat, then build.
function Agenda({onGo}){
 const[shown,setShown]=useState(()=>reduced()?AGENDA.length:0);
 useEffect(()=>{if(shown>=AGENDA.length)return;const t=setTimeout(()=>setShown(v=>v+1),shown?520:220);return()=>clearTimeout(t);},[shown]);
 return <section className="ns-agenda" aria-label="What happens next">
  <ol>{AGENDA.map((line,i)=><li key={line} className={i<shown?'is-on':''}><span>{pad(i+1)}</span>{line}</li>)}</ol>
  <button className="ns-primary" autoFocus onClick={onGo}>START BUILDING →</button>
 </section>;
}

// Talon reveal: the champion, in his colours, before any mention of a book.
function MeetTalon({onContinue}){
 return <section className="ns-talon-reveal" aria-label="Meet Talon">
  <p className="ns-kicker">NATIONS SERIES / CHAMPION</p>
  <h2>MEET TALON<span>THE WORLD’S BEST</span></h2>
  <div className="ns-talon-visual">
   {MEDIA.talon.desktop||MEDIA.talon.mobile?<ChampionshipMedia media={MEDIA.talon}/>:<>
    <Helmet build={{accent:'#1a1c1f',livery:''}} country="United States" callsign="TALON" size={200} title="Talon's black racing helmet in United States colours"/>
    <div className="ns-talon-craft"><DroneRender live build={TALON_BUILD} label={false}/></div>
   </>}
  </div>
  <p className="ns-talon-id"><span role="img" aria-label="United States">{countryFlag('United States')}</span> UNITED STATES · UNBEATEN</p>
  <p className="ns-talon-bio">Found as a teenager in a corporate pilot assessment. Black and silver, first through the gate. When the field goes wide, he drops below it and takes the line no one else will.</p>
  <button className="ns-primary" autoFocus onClick={onContinue}>CONTINUE →</button>
 </section>;
}

export default function NationsSeries({onBuild,onBook}){
 const[stage,setStage]=useState(()=>{const s=storedStory();return ['talon','broadcast-ended','offer','map','glimpse','book'].includes(s.stage)?s.stage:'hero';});
 const[story,storyDispatch]=useReducer(narrativeReducer,undefined,storedStory);const storyRef=useRef(story);const[aircraft,setAircraft]=useState(()=>{const a=readLocal('afl:entry:v22',null);return validBuild(a?.build)?a:null;});
 const[pilot,setPilot]=useState(()=>{const p=readLocal('afl:pilot:v22',{});return pilotEntry(p);});
 const[hangar,setHangar]=useState(readHangar),[status,setStatus]=useState(''),[result,setResult]=useState(null),[run,setRun]=useState(0),[count,setCount]=useState(3),[shareState,setShareState]=useState('');
 const[challenge]=useState(()=>readChallenge());
 const ref=useRef(null),seq=useRef(null);
 const send=useCallback(a=>{const old=storyRef.current,next=narrativeReducer(old,a);if(next===old)return;storyRef.current=next;writeLocal(NARRATIVE_KEY,next);storyDispatch(a);setStage(next.stage);if(a.type==='choose')trackJourney('private_offer_decided',{choice:next.decision});if(a.type==='profile-exit')trackJourney(a.skipped?'talon_profile_skipped':'talon_profile_completed');if(next.stage==='offer')trackJourney('private_offer_viewed');if(next.stage==='book')trackJourney('book_revealed');},[]);
 function updateHangar(items){setHangar(items);if(!writeLocal(HANGAR_KEY,items))setStatus('Storage unavailable. Changes last for this session only.');}
 useEffect(()=>{const ready=e=>{try{const a0=e.detail,items=saveAircraft(readHangar(),a0.build,a0.name,a0.hangarId),a=items[0];setAircraft(a);setHangar(items);if(!writeLocal(HANGAR_KEY,items)||!writeLocal('afl:entry:v22',a))setStatus('Storage unavailable. Aircraft remains in this session.');setStage('pilot');trackJourney('builder_completed');}catch(error){setStatus(error.message);}};window.addEventListener('afl-aircraft-ready',ready);return()=>window.removeEventListener('afl-aircraft-ready',ready);},[]);
 useEffect(()=>{if(stage!=='grid')return;let n=3;const timer=setInterval(()=>{if(document.hidden)return;n--;setCount(n);if(n===0){setRun(v=>v+1);setStage('race');trackJourney('race_started');}},1000);return()=>clearInterval(timer);},[stage]);
 useEffect(()=>{if(stage!=='broadcast-ended'||reduced())return;let timer;const start=()=>{clearTimeout(timer);if(!document.hidden)timer=setTimeout(()=>send({type:'closure'}),1100);};start();document.addEventListener('visibilitychange',start);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',start);};},[stage,send]);
 useEffect(()=>{const immersive=!['hero','garage'].includes(stage);document.body.classList.toggle('ns-immersive',immersive);ref.current?.focus({preventScroll:true});if(ref.current)ref.current.scrollTop=0;return()=>document.body.classList.remove('ns-immersive');},[stage]);
 useEffect(()=>{if(['hero','garage'].includes(stage))return;const key=e=>{if(e.key==='Escape'){setStage('hero');return;}if(e.key!=='Tab')return;const list=[...ref.current.querySelectorAll('button:not(:disabled),a[href],input,select,summary')].filter(n=>n.getClientRects().length);if(!list.length)return;const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||!ref.current.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[stage]);
 const finish=useCallback(r=>{setResult(r);setShareState('');setStage(r.practice?'practice-result':'result');if(!r.practice)trackJourney('race_finished',{position:r.position||'dnf',assisted:r.assisted});},[]);
 function build(a){setStage('garage');onBuild({id:localId(),build:a?.build,hangarId:a?.id});trackJourney('grid_entered');}
 function enter(){trackJourney('nations_entered');if(aircraft&&pilot.callsign){setStage(['complete','idle'].includes(story.stage)?'inspection':story.stage);return;}setStage('agenda');}
 function startRace(training=false){setCount(3);seq.current=null;setRun(v=>v+1);setStage(training?'training':'grid');}
 function revealBook(){send({type:'book'});}
 function openBook(id){send({type:'leave'});setStage('hero');onBook(id);}
 const callsignOk=()=>pilot.callsign.trim()&&!/^talon$/i.test(pilot.callsign.trim());
 function pilotSubmit(e){e.preventDefault();if(!callsignOk()){setStatus('Choose your own callsign. Talon is taken.');return;}setStatus(writeLocal('afl:pilot:v22',pilot)?'':'Storage unavailable. Your pilot lasts for this session.');setStage('inspection');trackJourney('pilot_registration_completed');}
 function saveRun(){if(seq.current===result)return;seq.current=result;rememberRace(result,pilot);if(aircraft){const items=recordResult(readHangar(),aircraft.id,result);updateHangar(items);}}
 async function share(){saveRun();const r={callsign:pilot.callsign,country:pilot.country,time:+result.elapsed.toFixed(2),position:result.position};const out=await shareRace(r);setShareState(out==='copied'?'Challenge link copied.':out==='shared'?'Shared.':out==='failed'?'Could not share from this browser.':'');trackJourney('race_shared',{via:out});}
 const ranked=result&&!result.dnf&&!result.assisted;

 if(stage==='hero'||stage==='garage')return <section className="ns-hero" aria-label="Nations Series"><ChampionshipMedia media={MEDIA.hero} hero/><div className="ns-hero__shade"/><div className="ns-hero__copy">
  {challenge&&<p className="ns-challenge"><span role="img" aria-label={challenge.country}>{countryFlag(challenge.country)}</span> {challenge.callsign} ran <b>{challenge.time.toFixed(2)} s</b>. Can you beat it?</p>}
  <p>NATIONS SERIES</p><h1>THE WORLD<br/>IS WATCHING.</h1><button className="ns-primary" onClick={enter}>ENTER THE NATIONS SERIES →</button>
  <div className="ns-links">{hangar.length>0&&<button onClick={()=>setStage('hangar')}>Your hangar</button>}<button onClick={()=>openBook('read')}>Read the book</button></div></div></section>;

 return <div className="ns-root" role="dialog" aria-modal="true" aria-label="Nations Series experience" tabIndex={-1} ref={ref}><header><span>{['offer','map','glimpse','broadcast-ended'].includes(stage)?'CHANNEL':'NATIONS SERIES'}</span><button onClick={()=>setStage('hero')}>Save &amp; return</button></header><main>
 {stage==='agenda'&&<Agenda onGo={()=>build()}/>}
 {stage==='hangar'&&<section className="ns-panel"><p className="ns-kicker">YOUR HANGAR / THIS DEVICE</p><h2>Your machines.</h2><button onClick={()=>build()}>Build new aircraft</button><details><summary>Eight example machines</summary><div className="ns-hangar">{EXAMPLES.map(a=><article key={a.id}><DroneRender build={{...a.build,engineeringVersion:'2.2-reconstructed'}}/><h3>{a.name}</h3><button onClick={()=>{try{updateHangar(saveAircraft(hangar,{...a.build,engineeringVersion:'2.2-reconstructed'},a.name));}catch(e){setStatus(e.message);}}}>Add to hangar</button></article>)}</div></details><div className="ns-hangar">{hangar.map(a=><article key={a.id}><DroneRender build={a.build}/><input aria-label="Aircraft name" maxLength={32} defaultValue={a.name} onBlur={e=>updateHangar(saveAircraft(hangar,a.build,e.target.value,a.id))}/><p>{personality(a.build)} · {Math.round(spec(a.build).mass)} g · {spec(a.build).speed.toFixed(1)} m/s · revision {a.revision}</p><div className="ns-links"><button onClick={()=>{setAircraft(a);writeLocal('afl:entry:v22',a);setStage(pilot.callsign?'inspection':'pilot');}}>Race</button><button onClick={()=>build(a)}>Tune</button><button onClick={()=>{try{updateHangar(saveAircraft(hangar,a.build,a.name+' COPY'));}catch(e){setStatus(e.message);}}}>Duplicate</button><button onClick={()=>updateHangar(hangar.filter(x=>x.id!==a.id))}>Remove</button></div><details><summary>History &amp; results</summary>{a.history.map((h,i)=><button key={i} onClick={()=>updateHangar(saveAircraft(hangar,h.build,a.name,a.id))}>Restore revision {h.revision} as new revision</button>)}{a.results.map((r,i)=><p key={i}>Revision {r.revision} · {r.dnf?'DNF':r.elapsed.toFixed(2)+' s'} · {r.model}</p>)}</details></article>)}</div><p>Results are saved on this device.</p></section>}

 {stage==='pilot'&&aircraft&&<form className="ns-pilot" onSubmit={pilotSubmit} noValidate>
  <p className="ns-kicker">STEP 2 / BECOME A PILOT</p><h2>CREATE YOUR PILOT</h2>
  <div className="ns-pilot__identity" style={nation(pilot.country)}>
   <Helmet build={aircraft.build} country={pilot.country} callsign={pilot.callsign} size={170}/>
   <div className="ns-pilot__fields">
    <label>Callsign<input maxLength={24} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="e.g. NOMAD" value={pilot.callsign} onChange={e=>setPilot({...pilot,callsign:e.target.value.toUpperCase()})}/></label>
    <label>Country<select value={pilot.country} onChange={e=>setPilot({...pilot,country:e.target.value})}>{COUNTRIES.map(x=><option key={x}>{x}</option>)}</select></label>
    <p className="ns-pilot__colors"><span role="img" aria-label={pilot.country}>{countryFlag(pilot.country)}</span> Your helmet carries your country’s colours and your aircraft’s paint.</p>
   </div>
  </div>
  <SponsorChoices pilot={pilot} setPilot={setPilot}/>
  <button className="ns-primary" type="submit" disabled={!callsignOk()}>GET RACE READY →</button>
  <p className="ns-status" role="status">{status}</p>
 </form>}

 {stage==='inspection'&&aircraft&&<section className="ns-ready" style={nation(pilot.country)} aria-label="Race ready">
  <p className="ns-ready__name"><span role="img" aria-label={pilot.country}>{countryFlag(pilot.country)}</span> {pilot.callsign||'PILOT'} <i>•</i> {pilot.country.toUpperCase()}</p>
  <div className="ns-ready__hero"><Helmet build={aircraft.build} country={pilot.country} callsign={pilot.callsign} size={150}/><div className="ns-ready__craft"><DroneRender live build={aircraft.build} label={false}/></div></div>
  <p className="ns-ready__label">YOUR AIRCRAFT · {personality(aircraft.build).toUpperCase()} · {Math.round(spec(aircraft.build).mass)} g</p>
  <div className="ns-ready__partners">{SPONSORS.map(c=>{const b=c.brands.find(b=>b.id===pilot.sponsors[c.id])||c.brands[0];return <span key={c.id}><b>{b.mark}</b><small>{b.name}</small></span>;})}</div>
  <button className="ns-primary ns-ready__go" autoFocus onClick={()=>startRace(false)}>READY TO RACE →</button>
  <div className="ns-ready__quiet"><button type="button" onClick={()=>startRace(true)}>Practice lap first</button><button type="button" onClick={()=>build(aircraft)}>Change aircraft</button><button type="button" onClick={()=>setStage('pilot')}>Edit pilot</button></div>
 </section>}

 {stage==='grid'&&aircraft&&<section className="ns-panel ns-countdown"><p>{countryFlag(pilot.country)} {pilot.country} / GRID 06</p><h2>{pilot.callsign}</h2><DroneRender live build={aircraft.build} label={false}/><strong role="status">{count||'GO'}</strong></section>}
 {['race','training'].includes(stage)&&aircraft&&<Suspense fallback={<p className="ns-panel" role="status">Loading the course…</p>}><FPVRace key={run} pilot={pilot} build={aircraft.build} onFinish={finish} training={stage==='training'}/></Suspense>}
 {stage==='practice-result'&&<section className="ns-panel ns-quiet"><h2>Practice complete.</h2><button className="ns-primary" onClick={()=>startRace(false)}>RACE THE FINAL →</button><button onClick={()=>startRace(true)}>Practice again</button></section>}

 {stage==='result'&&result&&<section className="ns-result" aria-label="Race result">
  <p className="ns-kicker">NATIONS SERIES / WORLD FINAL</p>
  {ranked?<><p className="ns-result__label">YOUR TIME</p><p className="ns-result__time">{result.elapsed.toFixed(2)}<small> s</small></p><p className="ns-result__place">{ordinal(result.position)} of {RIVALS.length+1} · {result.state.cleared}/24 gates{result.state.penalty>0?` · +${result.state.penalty.toFixed(2)} s penalties`:''}</p></>
   :<><h2 className="ns-result__time">{result.dnf?'Flight retired.':'Guided run.'}</h2><p className="ns-result__place">{result.dnf?'Your aircraft didn’t make the finish. Race again; flight assist keeps you near the line.':'Guided runs aren’t ranked. Race it yourself to post a time.'}</p></>}
  <ol className="ns-standings">{[...RIVALS,...(ranked?[{name:pilot.callsign,country:pilot.country,time:result.elapsed,you:true}]:[])].sort((a,b)=>a.time-b.time).map((a,i)=><li key={a.name+'-'+i} className={a.you?'is-you':a.name==='TALON'?'is-talon':''}><span>{pad(i+1)}</span><b><span role="img" aria-label={a.country}>{countryFlag(a.country)}</span> {a.name}{a.you?' / YOU':''}{a.name==='TALON'&&<em>UNBEATEN</em>}</b><span>{a.time.toFixed(2)} s</span></li>)}</ol>
  <p className="ns-result__talon">NOBODY HAS BEATEN TALON.</p>
  <button className="ns-primary" autoFocus onClick={()=>{saveRun();if(story.bookSeen){send({type:'leave'});send({type:'book'});}else send({type:'begin',result});}}>{story.bookSeen?'CONTINUE →':'MEET TALON →'}</button>
  <div className="ns-result__secondary">{ranked&&<button type="button" onClick={share}>SHARE YOUR RACE → <small>Can a friend beat you?</small></button>}<button type="button" onClick={()=>{saveRun();startRace(false);}}>Race again</button>{story.bookSeen&&<button type="button" onClick={()=>send({type:'begin',result})}>Meet Talon again</button>}</div>
  <p className="ns-status" role="status">{shareState}</p>
  <details><summary>Gate by gate</summary>{result.state.splits.map(s=><p key={s.gate}>Gate {pad(s.gate)}: {s.clear?'CLEAR':`MISSED (${{left:'too far left',right:'too far right',high:'too high',low:'too low'}[s.miss]||'off line'}) +2.50`} · {s.time.toFixed(2)} s</p>)}<p>Boost on the straights for pace; it overheats if you hold it through the corners.</p></details>
 </section>}

 {stage==='talon'&&<MeetTalon onContinue={()=>send({type:'profile-exit',skipped:false})}/>}
 {stage==='broadcast-ended'&&<section className="ns-panel ns-quiet"><h2>BROADCAST ENDED</h2><button onClick={()=>send({type:'closure'})}>Continue →</button></section>}
 {stage==='offer'&&<section className="ns-panel ns-offer"><p className="ns-kicker">PRIVATE CHANNEL</p><h2>YOU CAN FLY.<br/>WE CAN PAY.</h2><p>PRIVATE CONTRACT</p><strong>$25,000</strong><p>Would you accept?</p><div className="ns-offer__actions"><button onClick={()=>send({type:'choose',choice:'accept'})}>ACCEPT</button><button onClick={()=>send({type:'choose',choice:'decline'})}>DECLINE</button></div></section>}
 {['map','glimpse'].includes(stage)&&<section className={'ns-map '+(stage==='glimpse'?'ns-map--glimpse':'')}><div className="ns-map-top"><h2>{stage==='glimpse'?'CHANNEL CLOSED':['EUROPE','CONTESTED TERRITORY','PRIVATE RECORDS','THE WIDER WORLD'][story.mapStep]}</h2></div><MapBoundary><Suspense fallback={<p role="status">Opening map…</p>}><FrontMap key={stage+'-'+story.mapStep} journey revealStep={stage==='glimpse'?0:story.mapStep}/></Suspense></MapBoundary>{stage==='map'&&story.mapStep===0&&<p>CONTRACT ACCEPTED / CHANNEL TRANSFERRED</p>}{stage==='map'&&<div className="ns-links"><button disabled={story.mapStep===0} onClick={()=>send({type:'step',step:story.mapStep-1})}>Back</button><span>{story.mapStep+1} / 4</span>{story.mapStep<3&&<button onClick={()=>send({type:'step',step:story.mapStep+1})}>Next →</button>}</div>}<button className="ns-primary" onClick={revealBook}>CONTINUE →</button></section>}

 {stage==='book'&&<section className="ns-bridge" aria-label="Enter Talon's world">
  <p className="ns-kicker">THE AMERICAN FOREIGN LEGION · BOOK 1</p>
  <h2>You’ve met Talon.<br/>Now enter his world.</h2>
  <img src={BOOK.coverImage} alt="The American Foreign Legion book cover" width="600" height="900"/>
  <p>Talon is a character in <em>The American Foreign Legion</em>. The book opens on the broadcasts that start the war, then goes back to his childhood.</p>
  <button className="ns-primary" autoFocus onClick={()=>openBook('read')}>READ THE BEGINNING →</button>
 </section>}
 <p className="ns-status" role="status">{['pilot','result'].includes(stage)?'':status}</p></main></div>;
}
function nation(country){const c=countryColors(country);return {'--nation-a':c[0],'--nation-b':c[1],'--nation-c':c[2]};}
function SponsorChoices({pilot,setPilot}){return <div className="ns-sponsors ns-sponsors--compact"><p className="ns-kicker">YOUR THREE PARTNERS</p>{SPONSORS.map(c=><fieldset key={c.id}><legend>{c.label}</legend><div>{c.brands.map(b=><button key={b.id} type="button" aria-pressed={pilot.sponsors[c.id]===b.id} onClick={()=>setPilot({...pilot,sponsors:{...pilot.sponsors,[c.id]:b.id}})}><b>{b.mark}</b><span>{b.name}</span></button>)}</div></fieldset>)}</div>;}
