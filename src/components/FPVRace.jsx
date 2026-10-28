// Nations Series World Final: 3D sprint (v24). Drop-in replacement for the v23 canvas race.
// Same props and onFinish contract; falls back to FPVRaceClassic when WebGL is unavailable.
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import FPVRaceClassic from './FPVRaceClassic';
import {GATES,GATE_COUNT,OBSTACLES,PATH_SAMPLES,CORRIDOR,SECTORS,FIELD,START_S,FINISH_S,COURSE3D_VERSION,freshFlight3d,stepFlight3d,autopilot,rivalAt,frameAt,heading,ghostKey3d} from '../raceCourse3d';
import {classify} from '../raceModel';
import {countryFlag,countryColors} from '../countries';
import {SPONSORS} from '../sporting';
import {spec,EXAMPLES} from '../engineering';
import {buildAircraft} from '../aircraft3d';
import {readLocal,writeLocal} from '../localGarage';

const TRAINING_GATES=3;
const STEP=1/120;
const TALON_BUILD={chassis:'speed',material:'carbon',power:'highrpm',sensor:'minimal',system:'aggressive',finish:'charcoal',accent:'#c3c8cc',motor:'sprint',propeller:'low-drag',illumination:'edge'};
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function webglAvailable(){try{const c=document.createElement('canvas');return Boolean(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch{return false;}}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ───────── scene construction ─────────
function textSprite(lines,{color='#ded4b9',bg='rgba(8,14,22,.8)',bar,w=256,h=96,scale=3.4}={}){
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);
 if(bar){bar.forEach((col,i)=>{x.fillStyle=col;x.fillRect(i*w/bar.length,0,w/bar.length,7);});}
 x.textAlign='center';x.textBaseline='middle';x.fillStyle=color;
 lines.forEach((t,i)=>{x.font=`${i?'500 22px':'700 40px'} ui-monospace, Menlo, monospace`;x.fillText(t,w/2,lines.length===1?h/2+3:h*(i?.75:.4));});
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(scale,scale*h/w,1);return s;
}
function boardTexture(name,mark){const c=document.createElement('canvas');c.width=512;c.height=80;const x=c.getContext('2d');x.fillStyle='#0d161d';x.fillRect(0,0,512,80);x.fillStyle='#d09a5c';x.fillRect(0,74,512,6);x.fillStyle='#ded4b9';x.font='700 38px ui-monospace, Menlo, monospace';x.textBaseline='middle';x.fillText(mark,22,40);x.font='600 26px ui-monospace, Menlo, monospace';x.fillText(name,140,42);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

function buildWorld(scene,{build,pilot,training}){
 const rnd=mulberry(24),dummy=new THREE.Object3D(),col=new THREE.Color();
 scene.background=new THREE.Color('#0d1823');scene.fog=new THREE.Fog('#0d1823',70,380);
 scene.add(new THREE.HemisphereLight('#a9bccf','#1b2622',.85));
 const moon=new THREE.DirectionalLight('#d8e0ec',1.1);moon.position.set(-120,180,60);scene.add(moon);
 const flood=new THREE.DirectionalLight('#ffe2b4',.55);flood.position.set(150,90,-60);scene.add(flood);

 const ground=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshStandardMaterial({color:'#141e1b',roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground);
 {const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,e=.15+rnd()*1.3,r=700;p.set([Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r],i*3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:'#cfd9e6',size:1.6,sizeAttenuation:false,fog:false})));}

 const sCanyon=[START_S+26,GATES[7].s+22],sRiver=[GATES[7].s+22,GATES[15].s+14],last=training?GATES[TRAINING_GATES].s+30:FINISH_S+60;
 const along=(a,b,step,fn)=>{for(let s=a;s<b;s+=step)fn(s,frameAt(s));};
 const place=(f,s,lat,y,sx,sy,sz)=>{dummy.position.set(f.pos[0]+f.right[0]*lat,y,f.pos[2]+f.right[2]*lat);dummy.rotation.set(0,-heading(f.fwd),0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();return dummy.matrix;};

 // Sector 1: the artificial canyon. Poured concrete faces with amber work lights.
 {const walls=[],strips=[];along(sCanyon[0],Math.min(sCanyon[1],last),8.6,(s,f)=>{for(const side of [-1,1]){const lat=side*(CORRIDOR+3.6+rnd()*2.4),h=13+rnd()*22;walls.push([s,f,lat,h]);if(rnd()<.55)strips.push([s,f,lat-side*2.62,3+rnd()*h*.5]);}});
  const wm=new THREE.InstancedMesh(new THREE.BoxGeometry(5,1,9),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.95,flatShading:true}),walls.length);
  walls.forEach(([s,f,lat,h],i)=>{wm.setMatrixAt(i,place(f,s,lat,h/2,1,h,1));wm.setColorAt(i,col.set(['#3a434a','#343c42','#40484c','#2f373d'][i%4]));});
  const sm=new THREE.InstancedMesh(new THREE.BoxGeometry(.2,.22,7),new THREE.MeshBasicMaterial({color:'#e5a656'}),strips.length);strips.forEach(([s,f,lat,y],i)=>sm.setMatrixAt(i,place(f,s,lat,y,1,1,1)));scene.add(wm,sm);}

 // Sector 2: the river crossing. Water ribbon, low banks, and the bridge.
 if(!training){
  const pts=[],idx=[],w=CORRIDOR+22;let k=0;along(sRiver[0]-14,sRiver[1]+10,4,(s,f)=>{for(const side of [-1,1])pts.push(f.pos[0]+f.right[0]*w*side,.12,f.pos[2]+f.right[2]*w*side);if(k)idx.push(2*k-2,2*k-1,2*k,2*k-1,2*k+1,2*k);k++;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();
  scene.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:'#17394a',emissive:'#0a1f2b',roughness:.18,metalness:.55,side:THREE.DoubleSide})));
  const banks=[];along(sRiver[0],sRiver[1],7.5,(s,f)=>{for(const side of [-1,1])banks.push([s,f,side*(w+3+rnd()*4),1.5+rnd()*4.5]);});
  const bm=new THREE.InstancedMesh(new THREE.BoxGeometry(9,1,8),new THREE.MeshStandardMaterial({color:'#28332c',roughness:1,flatShading:true}),banks.length);banks.forEach(([s,f,lat,h],i)=>bm.setMatrixAt(i,place(f,s,lat,h/2,1,h,1)));scene.add(bm);
  const concrete=new THREE.MeshStandardMaterial({color:'#4a5358',roughness:.9});
  for(const o of OBSTACLES){const m=new THREE.Mesh(new THREE.BoxGeometry(o.half[0]*2,o.half[1]*2,o.half[2]*2),concrete);m.position.set(...o.center);m.rotation.y=-heading(o.fwd);scene.add(m);
   if(o.kind==='deck'){for(const z of [-o.half[2],o.half[2]]){const rail=new THREE.Mesh(new THREE.BoxGeometry(o.half[0]*2,.12,.12),new THREE.MeshBasicMaterial({color:'#e5a656'}));rail.position.set(0,o.half[1]+.5,z);m.add(rail);}}}
 }

 // Sector 3 and the start: the stadium bowl. Tiered stands, crowd, floodlights, partner boards.
 {const ranges=[[START_S-70,sCanyon[0]-4]];if(!training)ranges.push([sRiver[1]+6,last]);
  const tiers=[],towers=[],crowd=[],boards=[];const crowdCols=['#d6b371','#94b9cb','#eee1bf','#b6464b','#cdcfbf','#526f9f'].map(c=>new THREE.Color(c));
  for(const [a,b] of ranges)along(a,b,9,(s,f)=>{for(const side of [-1,1]){for(let t=0;t<3;t++){const lat=side*(CORRIDOR+6+t*3.4),h=1.6+t*2.3;tiers.push([s,f,lat,h]);for(let c=0;c<6;c++){const cl=lat+side*(rnd()-.5)*2.6,ca=s+(rnd()-.5)*8,cf=frameAt(ca);crowd.push(cf.pos[0]+cf.right[0]*cl,h+.35,cf.pos[2]+cf.right[2]*cl);}}
   if(Math.round(s/9)%7===0)towers.push([s,f,side*(CORRIDOR+16)]);if(Math.round(s/9)%2===0)boards.push([s,f,side]);}});
  const tm=new THREE.InstancedMesh(new THREE.BoxGeometry(3.4,1,9),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9}),tiers.length);tiers.forEach(([s,f,lat,h],i)=>{tm.setMatrixAt(i,place(f,s,lat,h/2,1,h,1));tm.setColorAt(i,col.set(['#1f2b33','#25323b','#2b3943'][i%3]));});scene.add(tm);
  const cg=new THREE.BufferGeometry(),cc=[];for(let i=0;i<crowd.length/3;i++){const c=crowdCols[Math.floor(rnd()*crowdCols.length)];cc.push(c.r,c.g,c.b);}cg.setAttribute('position',new THREE.Float32BufferAttribute(crowd,3));cg.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));scene.add(new THREE.Points(cg,new THREE.PointsMaterial({size:.5,vertexColors:true})));
  const pole=new THREE.CylinderGeometry(.35,.5,28,8),head=new THREE.BoxGeometry(3.2,1.6,.6),poleMat=new THREE.MeshStandardMaterial({color:'#3a4248'}),headMat=new THREE.MeshBasicMaterial({color:'#fff1d0'});
  for(const [,f,lat] of towers){const p=new THREE.Mesh(pole,poleMat);p.position.set(f.pos[0]+f.right[0]*lat,14,f.pos[2]+f.right[2]*lat);const h=new THREE.Mesh(head,headMat);h.position.set(p.position.x,28.4,p.position.z);h.lookAt(f.pos[0],8,f.pos[2]);scene.add(p,h);}
  const partners=SPONSORS.map(c=>c.brands.find(b=>b.id===pilot?.sponsors?.[c.id])||c.brands[0]);
  const boardMats=partners.map(b=>new THREE.MeshBasicMaterial({map:boardTexture(b.name,b.mark)}));const boardGeo=new THREE.PlaneGeometry(8.6,1.35);
  boards.forEach(([,f,side],i)=>{const m=new THREE.Mesh(boardGeo,boardMats[i%boardMats.length]);m.position.set(f.pos[0]+f.right[0]*side*(CORRIDOR+1.2),.75,f.pos[2]+f.right[2]*side*(CORRIDOR+1.2));m.lookAt(f.pos[0],.75,f.pos[2]);scene.add(m);});
 }

 // Racing line and gates.
 {const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(PATH_SAMPLES.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),new THREE.LineDashedMaterial({color:'#d2dfbc',dashSize:1.2,gapSize:3,transparent:true,opacity:.22}));line.computeLineDistances();scene.add(line);}
 const frameMat=new THREE.MeshStandardMaterial({color:'#111a28',roughness:.6,metalness:.3}),postMat=new THREE.MeshStandardMaterial({color:'#37424b',roughness:.9});
 const railMats={next:new THREE.MeshBasicMaterial({color:'#ffd18a'}),ahead:new THREE.MeshBasicMaterial({color:'#84afcf'}),idle:new THREE.MeshBasicMaterial({color:'#3c4c58'}),done:new THREE.MeshBasicMaterial({color:'#1f2a33'}),missed:new THREE.MeshBasicMaterial({color:'#8a3b33'})};
 const gates=GATES.slice(0,training?TRAINING_GATES:GATE_COUNT).map(g=>{
  const grp=new THREE.Group();grp.position.set(...g.pos);grp.rotation.y=-heading(g.fwd);const H=g.half,T=.55,rails=[];
  for(const [w,h,x,y] of [[2*H+2*T,T,0,H+T/2],[2*H+2*T,T,0,-H-T/2],[T,2*H,H+T/2,0],[T,2*H,-H-T/2,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,T),frameMat);m.position.set(x,y,0);grp.add(m);}
  for(const [w,h,x,y] of [[2*H,.16,0,H+.07],[2*H,.16,0,-H-.07],[.16,2*H,H+.07,0],[.16,2*H,-H-.07,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,T+.08),railMats.idle);m.position.set(x,y,0);grp.add(m);rails.push(m);}
  const len=g.pos[1]-H-T;if(len>.4)for(const x of [-H-T/2,H+T/2]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,len,.5),postMat);p.position.set(x,-H-T-len/2,0);grp.add(p);}
  const label=textSprite([g.finish?'FINISH':String(g.index+1).padStart(2,'0')],{color:g.finish?'#ffd18a':'#d6e1dc',w:g.finish?256:128,h:64,scale:g.finish?5:1.9});label.position.set(0,H+T+1.3,0);grp.add(label);
  scene.add(grp);return {rails,state:'idle'};
 });
 {const f=frameAt(START_S-2),gantry=textSprite(['NATIONS SERIES','WORLD FINAL / GRID'],{bar:countryColors(pilot?.country),w:512,h:120,scale:12});gantry.position.set(f.pos[0],f.pos[1]+9,f.pos[2]);scene.add(gantry);}

 // Aircraft: yours from the bench, the rival field, and your personal-best ghost.
 const you=buildAircraft(build);scene.add(you.group);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.25,20),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.35,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 const rivals=training?[]:FIELD.map((r,i)=>{const talon=r.name==='TALON',c=countryColors(r.country),d=buildAircraft(talon?TALON_BUILD:{...EXAMPLES[(i*3)%EXAMPLES.length].build,accent:c[0],livery:['061','063','064','067'][i%4]});const tag=textSprite([r.name],{bar:c,w:192,h:64,scale:1.8});tag.position.y=1.4;d.group.add(tag);scene.add(d.group);return {...d,tag,rival:r,slot:i};});
 const ghost=buildAircraft(build,{opacity:.3});ghost.group.visible=false;scene.add(ghost.group);
 return {you,shadow,rivals,ghost,gates,railMats};
}

function disposeScene(scene){scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;(Array.isArray(m)?m:m?[m]:[]).forEach(x=>{x.map?.dispose?.();x.dispose?.();});});}

// ───────── component ─────────
export default function FPVRace(props){const[ok]=useState(webglAvailable);return ok?<FPVRace3D {...props}/>:<FPVRaceClassic {...props}/>;}

function FPVRace3D({build,onFinish,training=false,pilot}){
 const canvas=useRef(null),host=useRef(null),state=useRef(freshFlight3d()),input=useRef({x:0,y:0,boost:false,brake:false}),keys=useRef(new Set()),pointer=useRef(null);
 const pausedRef=useRef(false),assistRef=useRef(false),assistedSeen=useRef(false),completed=useRef(false),trace=useRef([]),trainingBoost=useRef(false),camRef=useRef('chase'),finishRef=useRef(onFinish);
 const [hud,setHud]=useState(()=>({...freshFlight3d(),place:FIELD.length+1})),[help,setHelp]=useState(false),[paused,setPaused]=useState(false),[assist,setAssist]=useState(false),[cam,setCam]=useState('chase'),[message,setMessage]=useState(''),[failed,setFailed]=useState(false),[best]=useState(()=>readLocal(ghostKey3d(build),null));
 useEffect(()=>{finishRef.current=onFinish;},[onFinish]);
 useEffect(()=>{assistRef.current=assist;},[assist]);
 useEffect(()=>{camRef.current=cam;},[cam]);

 useEffect(()=>{
  let renderer;try{renderer=new THREE.WebGLRenderer({canvas:canvas.current,antialias:true,powerPreference:'high-performance'});}catch{queueMicrotask(()=>setFailed(true));return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,1400),world=buildWorld(scene,{build,pilot,training});
  const resize=()=>{const w=canvas.current.clientWidth||960,h=canvas.current.clientHeight||720;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  resize();const ro=new ResizeObserver(resize);ro.observe(host.current);
  const still=reducedMotion();let lastSector=-1,talonNoted=false,flashUntil=0,hudAt=0,last=0,acc=0,frame=0;
  const say=(t,ms=1600)=>{setMessage(t);flashUntil=performance.now()+ms;};
  const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),v=new THREE.Vector3(),w=new THREE.Vector3();
  const placeBefore=(s0,gi,keep)=>{const g=GATES[gi],f=frameAt(g.s-30),fresh=freshFlight3d();return {...fresh,...keep,pos:[...f.pos],yaw:heading(f.fwd),s:g.s-30,gate:gi,cleared:s0.cleared,penalty:s0.penalty,splits:s0.splits,time:s0.time,battery:s0.battery,hull:s0.hull,heat:s0.heat};};
  const snap=()=>{const s=state.current,f=[Math.sin(s.yaw),0,-Math.cos(s.yaw)];camPos.set(s.pos[0]-f[0]*7.5,s.pos[1]+2.8,s.pos[2]-f[2]*7.5);camLook.set(s.pos[0]+f[0]*6,s.pos[1]+.5,s.pos[2]+f[2]*6);};
  snap();
  const readKeys=()=>{const k=keys.current,on=c=>k.has(c)?1:0;if(!pointer.current){input.current.x=Math.max(-1,Math.min(1,on('ArrowRight')+on('KeyD')-on('ArrowLeft')-on('KeyA')+(input.current.sliderX||0)));input.current.y=Math.max(-1,Math.min(1,on('ArrowUp')+on('KeyW')-on('ArrowDown')-on('KeyS')+(input.current.sliderY||0)));}input.current.boost=on('Space')||input.current.boostTouch||false;input.current.brake=on('ShiftLeft')||on('ShiftRight')||input.current.brakeTouch||false;};
  const reset=()=>{if(completed.current)return;const s=state.current;state.current=placeBefore(s,Math.min(s.gate,(training?TRAINING_GATES:GATE_COUNT)-1));snap();say('RESET TO GATE '+String(state.current.gate+1).padStart(2,'0'));};
  const tick=t=>{frame=requestAnimationFrame(tick);const dt=Math.min(.05,(t-(last||t))/1000);last=t;readKeys();
   if(!pausedRef.current&&!completed.current){acc+=dt;while(acc>=STEP){acc-=STEP;const s=state.current;const control=assistRef.current?autopilot(s):input.current;if(s.gate===1&&control.boost)trainingBoost.current=true;
     let n=stepFlight3d(s,control,build,STEP);
     if(n.gate>s.gate){const sp=n.splits.at(-1);
      if(training&&(!sp.clear||(s.gate===1&&!trainingBoost.current))){n=placeBefore(s,s.gate);say(s.gate===1?'HOLD BOOST THROUGH THIS GATE.':'LINE UP AND TRY AGAIN.',2200);}
      else say(sp.clear?'GATE CLEAR':'MISSED GATE / +2.50 s',900);}
     if(training){n.hull=100;n.battery=100;if(n.gate>=TRAINING_GATES)n.done=true;}
     state.current=n;
     if(Math.floor(n.time*20)!==Math.floor(s.time*20))trace.current.push({t:n.time,p:n.pos.map(x=>+x.toFixed(2)),y:+n.yaw.toFixed(3)});
     if(n.done){completed.current=true;const result=classify(n,assistedSeen.current||training);
      if(!training&&!result.dnf&&!assistedSeen.current&&(!best||result.elapsed<best.elapsed))writeLocal(ghostKey3d(build),{elapsed:result.elapsed,trace:trace.current.slice(0,4000),splits:n.splits});
      finishRef.current({...result,practice:training,state:n,courseVersion:COURSE3D_VERSION});break;}}}
   const s=state.current,f=[Math.sin(s.yaw),0,-Math.cos(s.yaw)];
   // Narrative beats and sector calls.
   const sector=Math.min(2,Math.floor(s.gate/8));if(!training&&sector!==lastSector){lastSector=sector;say(`SECTOR ${sector+1} / ${SECTORS[sector]}`,1800);}
   if(!training&&!talonNoted&&s.time>2.2){talonNoted=true;say('TALON DROPS BELOW THE FIELD',2000);}
   if(flashUntil&&performance.now()>flashUntil){flashUntil=0;setMessage('');}
   // Your aircraft.
   const pitch=still?0:-Math.max(-.35,Math.min(.35,s.speed/120+(s.boosting?.08:0)-s.vy*.02)),roll=still?0:-s.yawRate*.32;
   world.you.group.position.set(...s.pos);world.you.group.rotation.set(pitch,-s.yaw,roll);world.you.group.visible=camRef.current==='chase';
   const spin=(28+s.speed*1.4)*dt;world.you.props.forEach((p,i)=>p.rotation.y+=i%2?spin:-spin);
   world.shadow.position.set(s.pos[0],.18,s.pos[2]);world.shadow.material.opacity=Math.max(.06,.38-s.pos[1]*.012);
   // Gates: next amber, lookahead steel, resolved dim.
   const look=Math.max(1,Math.round(handlingLook(build)));world.gates.forEach((g,i)=>{const st=i<s.gate?(s.splits[i]?.clear?'done':'missed'):i===s.gate?'next':i<=s.gate+look?'ahead':'idle';if(st!==g.state){g.state=st;g.rails.forEach(m=>m.material=world.railMats[st]);}});
   // Rival field and PB ghost.
   let ahead=0;for(const r of world.rivals){const a=rivalAt(r.rival,s.time,r.slot);r.group.position.set(...a.pos);r.group.rotation.set(-.18,-a.yaw,0);r.props.forEach((p,i)=>p.rotation.y+=i%2?spin:-spin);{const d=camera.position.distanceTo(r.group.position);r.tag.visible=s.time>1.8&&d>9&&d<90;}const rs=START_S-6+Math.min(1,s.time/r.rival.time)*(FINISH_S-START_S+6);if(rs>s.s||a.done)ahead++;}
   if(best?.trace?.length){const i=Math.min(best.trace.length-1,Math.floor(s.time*20)),gp=best.trace[i];world.ghost.group.visible=Boolean(gp)&&s.time<best.elapsed;if(gp){world.ghost.group.position.set(...gp.p);world.ghost.group.rotation.set(-.15,-gp.y,0);}}
   // Camera.
   if(camRef.current==='chase'){v.set(s.pos[0]-f[0]*7.5,s.pos[1]+2.8,s.pos[2]-f[2]*7.5);v.y=Math.max(v.y,1);w.set(s.pos[0]+f[0]*6,s.pos[1]+.5,s.pos[2]+f[2]*6);camPos.lerp(v,1-Math.exp(-7*dt));camLook.lerp(w,1-Math.exp(-10*dt));camera.position.copy(camPos);camera.lookAt(camLook);camera.fov=still?70:70+s.speed*.28;}
   else{camera.position.set(s.pos[0]+f[0]*.7,s.pos[1]+.18,s.pos[2]+f[2]*.7);camera.rotation.set(still?.04:pitch*.5+.04,-s.yaw,still?0:roll*.7,'YXZ');camera.fov=88;}
   if(!still&&s.recovery>.3){camera.position.x+=(Math.random()-.5)*.25;camera.position.y+=(Math.random()-.5)*.25;}
   camera.updateProjectionMatrix();renderer.render(scene,camera);
   if(t-hudAt>80){hudAt=t;setHud({...s,place:1+ahead});}
  };
  frame=requestAnimationFrame(tick);
  const down=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();if(e.target?.closest?.('input,select'))return;keys.current.add(e.code);if(e.repeat)return;if(e.code==='KeyC')setCam(c=>c==='chase'?'fpv':'chase');if(e.code==='KeyR')reset();};
  const up=e=>keys.current.delete(e.code);
  const visibility=()=>{if(document.hidden){pausedRef.current=true;keys.current.clear();pointer.current=null;setPaused(true);}last=0;};
  const resetEvt=()=>reset();
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);document.addEventListener('visibilitychange',visibility);window.addEventListener('afl-race-reset',resetEvt);
  return()=>{cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('afl-race-reset',resetEvt);disposeScene(scene);renderer.dispose();};
 },[build,pilot,training,best]);

 if(failed)return <FPVRaceClassic build={build} onFinish={onFinish} training={training} pilot={pilot}/>;
 const release=()=>{Object.assign(input.current,{boostTouch:false,brakeTouch:false,x:0,y:0});pointer.current=null;keys.current.clear();};
 const total=training?TRAINING_GATES:GATE_COUNT;
 const pb=best?.splits?.[hud.gate-1]&&hud.splits.at(-1)?hud.splits.at(-1).time-best.splits[hud.gate-1].time:null;
 const idle=training?hud.gate===0?'Steer through the gate':hud.gate===1?'Hold boost through the next gate':'Clear the final practice gate':'FIND YOUR LINE';
 return <section className="ns-flight ns-flight--3d" ref={host} aria-label={training?'Flight training':'Championship race'}>
  <canvas ref={canvas} aria-label="Three-dimensional Nations Series course: artificial canyon, river crossing and stadium final"/>
  <div className="ns-flight__hud"><strong>{training?'TRAINING':hud.time.toFixed(2)+' s'}</strong><span>{countryFlag(pilot?.country)} {pilot?.callsign}</span><span><span className="sr-only">Gate</span> {Math.min(hud.gate+1,total)} / {total}</span><span>RESERVE {hud.battery.toFixed(0)}%</span><span>AIRFRAME {hud.hull.toFixed(0)}%</span><span>HEAT {hud.heat.toFixed(0)}%</span>{!training&&<span>POS {String(hud.place).padStart(2,'0')} / {String(FIELD.length+1).padStart(2,'0')}</span>}{hud.splits.length>0&&<span>{pb!==null?'VS PB '+(pb>0?'+':'')+pb.toFixed(2)+' s':'SPLIT '+hud.splits.at(-1).time.toFixed(2)+' s'}</span>}<span className="ns-flight__speed">{Math.round(hud.speed*3.6)} KM/H</span><button type="button" onClick={()=>setCam(c=>c==='chase'?'fpv':'chase')}>{cam==='chase'?'FPV view':'Chase view'}</button><button type="button" onClick={()=>{pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);release();}}>{paused?'Resume':'Pause'}</button></div>
  <div className="ns-flight__controls">
   <div className="ns-stick" role="group" aria-label="Drag to steer and climb" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer.current={x:e.clientX,y:e.clientY};}} onPointerMove={e=>{if(pointer.current){input.current.x=Math.max(-1,Math.min(1,(e.clientX-pointer.current.x)/60));input.current.y=Math.max(-1,Math.min(1,-(e.clientY-pointer.current.y)/60));}}} onPointerUp={()=>{pointer.current=null;input.current.x=0;input.current.y=0;}} onPointerCancel={()=>{pointer.current=null;input.current.x=0;input.current.y=0;}} onLostPointerCapture={()=>{pointer.current=null;input.current.x=0;input.current.y=0;}}><span>STEER</span></div>
   <div>{['boost','brake'].map(k=><button key={k} type="button" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current[k+'Touch']=true;}} onPointerUp={()=>input.current[k+'Touch']=false} onPointerCancel={()=>input.current[k+'Touch']=false} onLostPointerCapture={()=>input.current[k+'Touch']=false} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current[k+'Touch']=true;}}} onKeyUp={()=>input.current[k+'Touch']=false}>{k.toUpperCase()}</button>)}</div>
  </div>
  <button className="ns-flight-help" aria-expanded={help} onClick={()=>{setHelp(!help);pausedRef.current=true;setPaused(true);release();}}>?</button>
  {help&&<div className="ns-flight__settings" role="region" aria-label="Paused flight controls"><button onClick={()=>{setHelp(false);pausedRef.current=false;setPaused(false);}}>Resume flight</button><h3>Flight controls</h3><p>Your aircraft flies forward on its own. Arrows or WASD steer and climb; ArrowLeft/ArrowRight turn, ArrowUp/ArrowDown climb and dive. Space boosts, Shift brakes for tight lines. C switches chase and FPV view; R returns you to the last gate. On touch, drag the steering zone. Missed gates add 2.5 seconds.</p><label>Horizontal<input type="range" min="-1" max="1" step=".02" defaultValue="0" onChange={e=>input.current.sliderX=+e.target.value}/></label><label>Vertical<input type="range" min="-1" max="1" step=".02" defaultValue="0" onChange={e=>input.current.sliderY=+e.target.value}/></label><label><input type="checkbox" checked={assist} onChange={e=>{if(e.target.checked)assistedSeen.current=true;setAssist(e.target.checked);}}/>Untimed guided practice (unranked)</label><button type="button" onClick={()=>window.dispatchEvent(new Event('afl-race-reset'))}>Return to last gate</button></div>}
  <p className="ns-flight__message" role="status">{message||idle}</p>
  {training&&<button type="button" className="ns-skip-training" onClick={()=>{completed.current=true;onFinish({practice:true});}}>Skip training →</button>}
  <span className="sr-only">Course length {Math.round(FINISH_S-START_S)} metres, {GATE_COUNT} gates in three sectors.</span>
 </section>;
}
function handlingLook(build){return Math.min(7,Math.max(2,spec(build).lookahead));}
