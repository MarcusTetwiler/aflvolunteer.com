// Nations Series World Final, 3D sprint course and flight model.
// Pure module: no DOM, no three.js. Rendered by components/FPVRace.jsx, tested in tests/race3d.test.mjs.
import {clamp,spec,canonical,MODEL} from './engineering.js';
import {RIVALS} from './sporting.js';
import {FINISH} from './raceModel.js';

export const COURSE3D_VERSION='world-final-v24-3d-1';
export const GATE_COUNT=24;
export const SECTORS=['ARTIFICIAL CANYON','RIVER CROSSING','THE LAST LINE'];
export const CORRIDOR=24;            // metres either side of the racing line before the walls bite
export const CEILING=42;
export const SCALE=0.98;           // tuned so strong runs finish near 18 s and average runs near 21-23 s

// Racing line (x east, y up, z south). Start faces -z out of the stadium.
const RAW=[[0,6,40],[0,6,0],[0,7,-45],[18,5,-85],[-12,6,-125],[16,9,-165],[-10,5,-205],[8,4,-240],[40,3,-270],[85,2.5,-280],[128,3,-262],[160,2.5,-228],[172,5,-185],[165,4,-140],[150,8,-100],[118,6,-70],[85,10,-55],[55,6,-35],[40,8,0],[50,6,35],[80,7,55]];
const CTRL=RAW.map(([x,y,z])=>[x*SCALE,y,z*SCALE]);

function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return [0,1,2].map(i=>.5*(2*p1[i]+(-p0[i]+p2[i])*t+(2*p0[i]-5*p1[i]+4*p2[i]-p3[i])*t2+(-p0[i]+3*p1[i]-3*p2[i]+p3[i])*t3));}
const STEPS=40,SAMPLES=[],ARC=[0],CTRL_ARC=[0];
for(let i=0;i<CTRL.length-1;i++){const p0=CTRL[Math.max(0,i-1)],p1=CTRL[i],p2=CTRL[i+1],p3=CTRL[Math.min(CTRL.length-1,i+2)];for(let j=i?1:0;j<=STEPS;j++){const p=catmull(p0,p1,p2,p3,j/STEPS);if(SAMPLES.length){const q=SAMPLES.at(-1);ARC.push(ARC.at(-1)+Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]));}SAMPLES.push(p);}CTRL_ARC.push(ARC.at(-1));}
export const PATH_LENGTH=ARC.at(-1);
export const PATH_SAMPLES=SAMPLES;

function indexAt(s){let lo=0,hi=ARC.length-1;s=clamp(s,0,PATH_LENGTH);while(hi-lo>1){const m=(lo+hi)>>1;if(ARC[m]<=s)lo=m;else hi=m;}return lo;}
export function pointAt(s){const i=indexAt(s),j=Math.min(i+1,SAMPLES.length-1),span=ARC[j]-ARC[i]||1,f=clamp((s-ARC[i])/span,0,1),a=SAMPLES[i],b=SAMPLES[j];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}
// Horizontal frame at arc length s: fwd and right are unit vectors in the ground plane.
export function frameAt(s){const a=pointAt(s-1.5),b=pointAt(s+1.5);let fx=b[0]-a[0],fz=b[2]-a[2];const m=Math.hypot(fx,fz)||1;fx/=m;fz/=m;return {pos:pointAt(s),fwd:[fx,0,fz],right:[-fz,0,fx]};}

export const START_S=CTRL_ARC[1];
export const FINISH_S=CTRL_ARC[19];
const sectorOf=i=>i<8?0:i<16?1:2;
export const GATES=Array.from({length:GATE_COUNT},(_,i)=>{const s=START_S+(i+1)/GATE_COUNT*(FINISH_S-START_S),f=frameAt(s),sector=sectorOf(i);return {index:i,s,pos:f.pos,fwd:f.fwd,right:f.right,half:[4.1,3.7,3.3][sector],sector,sectorName:SECTORS[sector],finish:i===GATE_COUNT-1};});

// The bridge over the river: a deck the racing line passes under and two pillars that guard the gap.
const BRIDGE_S=CTRL_ARC[11]+4;
export const OBSTACLES=(()=>{const f=frameAt(BRIDGE_S),[px,,pz]=f.pos,box=(lat,y,hx,hy,hz,kind)=>({kind,center:[px+f.right[0]*lat,y,pz+f.right[2]*lat],fwd:f.fwd,right:f.right,half:[hx,hy,hz]});return [box(0,10.2,40,.75,5,'deck'),box(-13,4.7,1.3,4.7,1.3,'pillar'),box(13,4.7,1.3,4.7,1.3,'pillar')];})();
export const BRIDGE_FRAME=frameAt(BRIDGE_S);
function insideBox(p,o,pad=.45){const dx=p[0]-o.center[0],dy=p[1]-o.center[1],dz=p[2]-o.center[2];return Math.abs(dx*o.right[0]+dz*o.right[2])<o.half[0]+pad&&Math.abs(dy)<o.half[1]+pad&&Math.abs(dx*o.fwd[0]+dz*o.fwd[2])<o.half[2]+pad;}

// Nearest arc length to p, searching a window around a hint so it stays O(window).
export function nearestS(p,hint=0,window=90){let best=hint,bd=Infinity;const lo=indexAt(hint-window),hi=indexAt(hint+window);for(let i=lo;i<=hi;i++){const q=SAMPLES[i],d=(q[0]-p[0])**2+(q[2]-p[2])**2;if(d<bd){bd=d;best=ARC[i];}}return best;}

export const heading=f=>Math.atan2(f[0],-f[2]);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function handling(build){const p=spec(build);return {...p,turn:1.05+p.response*.24,climb:9+p.response*1.6};}

export function freshFlight3d(){const f=frameAt(START_S-8);return {time:0,pos:[...f.pos],yaw:heading(f.fwd),yawRate:0,vy:0,slip:0,speed:0,s:START_S-8,z:0,battery:100,hull:100,heat:0,gate:0,cleared:0,penalty:0,splits:[],done:false,recovery:0,boosting:false};}

// Flight assist (v25). The race UI defaults to 1 (angle mode); 0 = pro handling (acro mode).
// The model itself defaults to 0 so physics tests describe unassisted flight.
// Steering moves you around a preferred line instead of anywhere at once: a dead zone and
// softened response on input, a pull back toward the racing line that grows the further you
// drift ("bumper rails", not walls), altitude hold toward the next gate, approach alignment,
// a scoring volume larger than the visible gate, and an angle-mode speed cap that boost
// still exceeds, so pace comes from boost timing rather than frame choice alone.
export const ASSIST={deadZone:.1,gain:.55,lineFree:2.5,lineSoft:3,steerYield:.2,railStart:6,railHard:4,scrub:3,alignYaw:2.2,turnScrub:.1,holdAlt:.9,approach:28,approachPull:1.8,capture:1.5,missDamage:.3,angleCap:40,cruiseCut:0,boostBonus:0,cornerLook:28,cornerGrip:1.15,cornerFloor:16};
const shape=(v,a)=>{if(!a)return v;const m=Math.abs(v);if(m<ASSIST.deadZone*a)return 0;const k=(m-ASSIST.deadZone*a)/(1-ASSIST.deadZone*a);return Math.sign(v)*k*(1-a*(1-ASSIST.gain))*(.55+.45*k);};

// input: x -1..1 (left/right turn), y -1..1 (dive/climb), boost, brake. Fixed-step friendly.
export function stepFlight3d(s,input,build,dt=1/120,opts={}){
 if(s.done)return s;const p=handling(build);dt=clamp(dt,0,1/30);const A=clamp(opts.assist??0,0,1);
 const x=shape(clamp(Number(input.x)||0,-1,1),A),y=shape(clamp(Number(input.y)||0,-1,1),A);
 const boost=Boolean(input.boost)&&s.battery>2&&s.heat<90,brake=Boolean(input.brake);
 // Heading assist: with little steering input, ease the nose toward the line ahead.
 let want=x*p.turn,assistTurn=0;
 if(A){const ahead=frameAt(s.s+14+s.speed*.35),hErr=wrap(heading(ahead.fwd)-s.yaw),idle=1-Math.min(1,Math.abs(x)/.45);const help=hErr*ASSIST.alignYaw*A*idle;want+=help;want=clamp(want,-p.turn*1.25,p.turn*1.25);assistTurn=Math.abs(help);}
 const yawRate=s.yawRate+(want-s.yawRate)*Math.min(1,dt*(6+p.response));
 const yaw=wrap(s.yaw+yawRate*dt);
 const cruise=A?Math.min(p.speed,p.speed+(ASSIST.angleCap-p.speed)*A):p.speed;
 let target=cruise*(1-ASSIST.cruiseCut*A)*(boost?p.boost+ASSIST.boostBonus*A:brake?.55:1)*(1-.2*Math.abs(yawRate)/p.turn)*(1-ASSIST.turnScrub*Math.min(1,assistTurn/p.turn));
 // Corner speed: with assist, the aircraft brakes itself to the speed its frame can actually turn at.
 if(A){const h0=heading(frameAt(s.s+4).fwd),h1=heading(frameAt(s.s+4+ASSIST.cornerLook).fwd),kappa=Math.abs(wrap(h1-h0))/ASSIST.cornerLook;if(kappa>1e-4){const vC=Math.max(ASSIST.cornerFloor,p.turn*ASSIST.cornerGrip/kappa);target=Math.min(target,target+(vC-target)*A*(vC<target?1:0));}}
 const speed=s.speed+(target-s.speed)*Math.min(1,p.accel/30*dt*3);
 const gN=GATES[s.gate],holdY=A&&gN?(gN.pos[1]-s.pos[1])*ASSIST.holdAlt*A*(1-Math.min(1,Math.abs(y)/.4)):0;
 const vy=s.vy+(y*p.climb+holdY-s.vy)*Math.min(1,dt*(3+p.damping));
 const river=s.gate>=8&&s.gate<16;
 const gust=(river?Math.sin(s.time*2)*.9+Math.sin(s.time*.7)*.5:Math.sin(s.time)*.2)*p.wind;
 const slip=s.slip+(gust*6-s.slip*p.damping)*dt;
 const fwd=[Math.sin(yaw),0,-Math.cos(yaw)],right=[Math.cos(yaw),0,Math.sin(yaw)];
 const pos=[s.pos[0]+(fwd[0]*speed+right[0]*slip)*dt,s.pos[1]+vy*dt,s.pos[2]+(fwd[2]*speed+right[2]*slip)*dt];
 const n={...s,time:s.time+dt,yaw,yawRate,speed,vy,slip,pos,boosting:boost,battery:Math.max(0,s.battery-dt*p.drain*(boost?2:1)),heat:clamp(s.heat+dt*(boost?12:-8*p.cooling),0,100),recovery:Math.max(0,s.recovery-dt)};
 // Floor and ceiling.
 if(pos[1]<1.1){if(s.vy<-7&&n.recovery===0){n.hull-=6/p.durability;n.recovery=.4;}pos[1]=1.1;n.vy=Math.max(0,n.vy);}
 if(pos[1]>CEILING){pos[1]=CEILING;n.vy=Math.min(0,n.vy);}
 // Course walls: canyon faces, river banks, stadium boards.
 n.s=nearestS(pos,s.s);const c=frameAt(n.s);let lat=(pos[0]-c.pos[0])*c.right[0]+(pos[2]-c.pos[2])*c.right[2];
 if(A){// Bumper rails: free near the line, a soft pull beyond, and a firm one near the walls.
  const m=Math.abs(lat),soft=Math.max(0,m-ASSIST.lineFree)*ASSIST.lineSoft,hard=Math.max(0,m-ASSIST.railStart)*ASSIST.railHard,steer=Math.abs(x),softPull=soft*(1-ASSIST.steerYield*steer)*A*dt,hardPull=hard*A*dt;
  const k=-Math.sign(lat)*Math.min(m,softPull+hardPull);pos[0]+=c.right[0]*k;pos[2]+=c.right[2]*k;lat+=k;n.speed=Math.max(0,n.speed-Math.min(m,hardPull)*ASSIST.scrub);
  // Approach alignment: close to the next gate and roughly on line, slide toward its centre.
  const g=GATES[s.gate];if(g){const along=(g.pos[0]-pos[0])*g.fwd[0]+(g.pos[2]-pos[2])*g.fwd[2];if(along>0&&along<ASSIST.approach){const gx=(pos[0]-g.pos[0])*g.right[0]+(pos[2]-g.pos[2])*g.right[2],gy=pos[1]-g.pos[1],reach=g.half*2.4;if(Math.abs(gx)<reach&&Math.abs(gy)<reach){const w=ASSIST.approachPull*A*dt*(1-along/ASSIST.approach);pos[0]-=g.right[0]*gx*w;pos[2]-=g.right[2]*gx*w;pos[1]-=gy*w;}}}
 }
 if(Math.abs(lat)>CORRIDOR){const k=Math.sign(lat)*CORRIDOR-lat;pos[0]+=c.right[0]*k;pos[2]+=c.right[2]*k;n.slip=0;n.speed*=.7;if(n.recovery===0){n.hull-=8/p.durability;n.recovery=.5;}}
 // Bridge.
 if(OBSTACLES.some(o=>insideBox(pos,o))){n.pos=[...s.pos];n.speed*=.45;n.yawRate=0;n.vy=0;if(n.recovery===0){n.hull-=12/p.durability;n.recovery=.6;}}
 // Gates: crossing the next gate's plane in the direction of travel resolves it, clean or missed.
 const g=GATES[s.gate];
 if(g){const d0=(s.pos[0]-g.pos[0])*g.fwd[0]+(s.pos[2]-g.pos[2])*g.fwd[2],d1=(n.pos[0]-g.pos[0])*g.fwd[0]+(n.pos[2]-g.pos[2])*g.fwd[2];
  if(d0<0&&d1>=0){const f=d0/(d0-d1),ix=s.pos[0]+(n.pos[0]-s.pos[0])*f,iy=s.pos[1]+(n.pos[1]-s.pos[1])*f,iz=s.pos[2]+(n.pos[2]-s.pos[2])*f;
   const lx=(ix-g.pos[0])*g.right[0]+(iz-g.pos[2])*g.right[2],ly=iy-g.pos[1],cap=g.half*(1+(ASSIST.capture-1)*A),clear=Math.abs(lx)<=cap&&Math.abs(ly)<=cap;
   n.gate=s.gate+1;n.cleared=s.cleared+(clear?1:0);n.penalty=s.penalty+(clear?0:2.5);if(!clear){n.hull=Math.max(0,n.hull-17*(1-A*(1-ASSIST.missDamage))/p.durability);n.recovery=.5;}
   const miss=clear?null:Math.abs(lx)/cap>=Math.abs(ly)/cap?(lx>0?'right':'left'):(ly>0?'high':'low');
   n.splits=[...s.splits,{gate:n.gate,time:n.time+n.penalty,clear,miss}];}}
 const finished=n.gate>=GATE_COUNT;n.z=finished?FINISH:clamp((n.s-START_S)/(FINISH_S-START_S),0,.999)*FINISH;
 n.done=finished||n.hull<=0||n.battery<=0;return n;
}

// Steering that flies the line: used by untimed guided practice and by the tests.
export function autopilot(s,{boost=true}={}){
 const g=GATES[s.gate];if(!g)return {x:0,y:0,boost:false,brake:false};
 const dist=Math.hypot(g.pos[0]-s.pos[0],g.pos[2]-s.pos[2]),lead=Math.min(10,dist*.35);
 const aim=[g.pos[0]-g.fwd[0]*lead,g.pos[2]-g.fwd[2]*lead],want=Math.atan2(aim[0]-s.pos[0],-(aim[1]-s.pos[2])),err=wrap(want-s.yaw);
 return {x:clamp(err*2.6,-1,1),y:clamp((g.pos[1]-s.pos[1])*.35-s.vy*.08,-1,1),boost:boost&&Math.abs(err)<.18&&s.heat<70,brake:Math.abs(err)>.7};
}

// Rival field flies its benchmark times. Talon drops below the field on the inside line.
export function rivalAt(r,t,slot){const span=FINISH_S-START_S,u=clamp(t/r.time,0,1.08),eased=u<.08?u*u/.16:u-.04,s=START_S-6+eased*(span+6);const f=frameAt(s),talon=r.name==='TALON',lat=talon?Math.sin(s*.021)*2:((slot%2)?1:-1)*(2.5+slot*.6)+Math.sin(s*.05+slot)*1.2,dy=talon?-1.9:Math.sin(s*.04+slot*2)*.9;return {pos:[f.pos[0]+f.right[0]*lat,f.pos[1]+dy,f.pos[2]+f.right[2]*lat],yaw:heading(f.fwd),done:u>=1};}
export const FIELD=RIVALS;

export const ghostKey3d=b=>`afl:ghost3d:${COURSE3D_VERSION}/${MODEL}/${canonical(b)}`;
