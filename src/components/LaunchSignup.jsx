import {useState} from 'react';
import {attribution} from '../attribution';

// Book launch list. Lives at the book ending (and nowhere in race setup).
export default function LaunchSignup({inline=false}){
 const[email,setEmail]=useState(''),[status,setStatus]=useState(''),[sending,setSending]=useState(false),[done,setDone]=useState(false);
 async function submit(e){e.preventDefault();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setStatus('Enter a valid email.');return;}setSending(true);setStatus('');
  try{const r=await fetch('/api/volunteer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.trim(),list:'book-launch',...attribution()})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.persisted)throw Error();setDone(true);setStatus('You’re on the list. We’ll email you the day it’s out.');}
  catch{setStatus('That didn’t go through. Please try again in a moment.');}finally{setSending(false);}}
 const form=done?<p className="ns-launch__done" role="status">{status}</p>:<form onSubmit={submit} noValidate className="ns-launch__form"><label htmlFor="launch-email">Email me when it’s out</label><div><input id="launch-email" required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/><button className="btn btn--primary" disabled={sending}>{sending?'Saving…':'Notify me'}</button></div><p className="ns-launch__fine">One email at launch, occasional book news. Unsubscribe anytime.</p><p role="status">{status}</p></form>;
 return <div id="launch-list" className={`ns-launch${inline?' ns-launch--inline':''}`}>{inline?form:<details><summary>Get notified at launch</summary>{form}</details>}</div>;
}
