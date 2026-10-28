// Share a race result as a challenge link. Results are local to the device; the link carries
// only callsign, country, time and position, and opens the Nations Series with a challenge.
import {readLocal,writeLocal} from './localGarage.js';
export const LAST_RACE_KEY='afl:last-race';
export function rememberRace(result,pilot){if(!result||result.dnf||result.assisted||result.practice)return null;const r={callsign:String(pilot?.callsign||'').slice(0,24),country:pilot?.country||'',time:+result.elapsed.toFixed(2),position:result.position||null,at:Date.now()};writeLocal(LAST_RACE_KEY,r);try{window.dispatchEvent(new Event('afl-race-saved'));}catch{/* non-browser */}return r;}
export const lastRace=()=>{const r=readLocal(LAST_RACE_KEY,null);return r&&typeof r.time==='number'?r:null;};
const b64=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
export function challengeUrl(r,base=location.origin+location.pathname){return `${base}?race=${b64(JSON.stringify({c:r.callsign,n:r.country,t:r.time,p:r.position}))}`;}
export function readChallenge(search=location.search){try{const v=new URLSearchParams(search).get('race');if(!v)return null;const o=JSON.parse(unb64(v));const t=Number(o.t);if(!(t>5&&t<300))return null;return {callsign:String(o.c||'A PILOT').slice(0,24).toUpperCase(),country:String(o.n||'').slice(0,60),time:t,position:Number.isInteger(o.p)?o.p:null};}catch{return null;}}
export function shareText(r){const place=r.position?` (${['','','2nd','3rd','4th','5th','6th'][r.position]||r.position+'th'} behind Talon)`:'';return `My Nations Series time: ${r.time.toFixed(2)} s${place}. Can you beat me? Nobody has beaten Talon.`;}
export async function shareRace(r){if(!r)return 'none';const url=challengeUrl(r),text=shareText(r);try{if(navigator.share){await navigator.share({title:'Nations Series',text,url});return 'shared';}await navigator.clipboard.writeText(`${text} ${url}`);return 'copied';}catch(e){if(e?.name==='AbortError')return 'cancelled';try{await navigator.clipboard.writeText(`${text} ${url}`);return 'copied';}catch{return 'failed';}}}
