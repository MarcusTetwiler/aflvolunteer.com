import {RIVALS} from './sporting.js';
import {clamp,spec,canonical,MODEL,COURSE_VERSION} from './engineering.js';
export const COURSE=Array.from({length:24},(_,i)=>({z:40+i*32,x:Math.sin(i*.68)*.55,y:Math.cos(i*.52)*.38,r:i<8?.68:i<16?.62:.56,sector:i<8?'ARTIFICIAL CANYON':i<16?'RIVER CROSSING':'THE LAST LINE'}));
export const FINISH=820;
export const freshFlight=()=>({time:0,z:0,x:0,y:0,vx:0,vy:0,speed:0,battery:100,hull:100,heat:0,gate:0,cleared:0,penalty:0,splits:[],trace:[],done:false,recovery:0});
export function stepFlight(s,input,build,dt=1/120){
 if(s.done)return s;const p=spec(build);dt=clamp(dt,0,1/30);const boost=Boolean(input.boost)&&s.battery>2&&s.heat<90;const brake=Boolean(input.brake);
 const speed=s.speed+(p.speed*(boost?p.boost:brake?.55:1)-s.speed)*Math.min(1,p.accel/30*dt*3);
 const wind=(s.z>290&&s.z<550?Math.sin(s.time*2)*.1:Math.sin(s.time)*.025)*p.wind;
 const vx=s.vx+((clamp(input.x||0,-1,1)-s.x)*p.response-s.vx*p.damping+wind)*dt*6;
 const vy=s.vy+((clamp(input.y||0,-1,1)-s.y)*p.response-s.vy*p.damping)*dt*6;
 const n={...s,time:s.time+dt,speed,z:s.z+speed*dt,x:clamp(s.x+vx*dt,-1.3,1.3),y:clamp(s.y+vy*dt,-1.3,1.3),vx,vy,battery:Math.max(0,s.battery-dt*p.drain*(boost?2:1)),heat:clamp(s.heat+dt*(boost?12:-8*p.cooling),0,100),recovery:Math.max(0,s.recovery-dt)};
 if(Math.abs(n.x)>1.1&&n.recovery===0)n.hull-=dt*8/p.durability;
 const g=COURSE[s.gate];if(g&&n.z>=g.z){const d=Math.hypot(n.x-g.x,n.y-g.y);n.gate++;n.cleared+=d<=g.r?1:0;n.penalty+=d>g.r?2.5:0;n.hull=Math.max(0,n.hull-(d>g.r?17/p.durability:0));n.recovery=d>g.r?.5:0;n.splits=[...s.splits,{gate:n.gate,time:n.time+n.penalty,clear:d<=g.r}];}
 n.done=n.z>=FINISH||n.hull<=0||n.battery<=0;return n;
}
export function classify(s,assisted=false){const dnf=!s.done||s.z<FINISH;const elapsed=s.time+s.penalty;const position=dnf||assisted?null:Math.max(2,2+RIVALS.slice(1).filter(r=>r.time<=elapsed).length);return {dnf,assisted,elapsed,position,flagged:!dnf&&!assisted&&position===2};}
export const traceKey=b=>`${COURSE_VERSION}/${MODEL}/${canonical(b)}`;
export function trajectory(s,input,b){let n=s;const pts=[];for(let i=0;i<30&&!n.done;i++){n=stepFlight(n,input,b,1/30);if(i%5===0)pts.push({x:n.x,y:n.y,z:n.z});}return pts;}
export function ghostAt(trace,time){if(!Array.isArray(trace))return null;return trace.find(p=>p.time>=time)||null;}
