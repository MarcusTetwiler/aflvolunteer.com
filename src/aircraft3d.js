// Shared 3D aircraft for Elena's Bench, the hangar, community builds, the grid and the race.
// Every bench decision changes geometry or materials. Loaded lazily (three.js), with the SVG
// renderer as the fallback while it loads or when WebGL is unavailable.
import * as THREE from 'three';

const FINISH = {bone:'#d6c5a7',rust:'#a94f2b',field:'#59604c',repaired:'#8d7c68',charcoal:'#2c2d2e',metal:'#c4ccce','hi-vis':'#e3b13a',pro:'#d37d66'};
const ACCENT = {bone:'#9d693e',rust:'#211d19',field:'#d0aa55',repaired:'#a58ba0',charcoal:'#c37949',metal:'#5d7f9a','hi-vis':'#1f2326',pro:'#f1e6d2'};
const LIVERY = {'061':'#d58a35','063':'#cc4361','064':'#df4a2f','067':'#c49827'};
const WRAP = {sprinter:'#b6463a',endurance:'#3e6c9a',cold:'#d9dde0',experimental:'#d9b43a',torque:'#d0773a',balanced:'#5c6266',highrpm:'#c23a3a',discharge:'#e2c24a'};
const FRAME = {
 carbon:{color:'#24272a',roughness:.38,metalness:.2,clearcoat:.8},weave:{color:'#2a2e33',roughness:.32,metalness:.25,clearcoat:1},
 alloy:{color:'#9a9ea1',roughness:.35,metalness:.85},titanium:{color:'#8b8883',roughness:.3,metalness:.9},
 regrind:{color:'#b4a283',roughness:.92,metalness:0},gyroid:{color:'#c8b793',roughness:.85,metalness:0},
 sandwich:{color:'#d8d4ca',roughness:.6,metalness:.05},mixed:{color:'#7d7a72',roughness:.7,metalness:.4},
};
export const accentFor=b=>b?.accent||ACCENT[b?.finish]||'#d09a5c';

function mats(build,opacity){
 const t=opacity<1,base={transparent:t,opacity,depthWrite:!t};
 const fr=FRAME[build.material]||FRAME.carbon,shellColor=FINISH[build.finish]||FINISH.charcoal,accent=accentFor(build);
 const phys=(o)=>new THREE.MeshPhysicalMaterial({...base,...o});
 return {
  frame:phys({color:fr.color,roughness:fr.roughness,metalness:fr.metalness,clearcoat:fr.clearcoat||0,clearcoatRoughness:.3}),
  frameAlt:phys({color:'#b4a283',roughness:.9,metalness:0}),
  shell:phys({color:shellColor,roughness:build.finish==='metal'?.22:.5,metalness:build.finish==='metal'?.9:.1,clearcoat:.4}),
  accent:phys({color:accent,roughness:.45,metalness:.1}),
  metal:phys({color:'#b9bec2',roughness:.28,metalness:.95}),
  motor:phys({color:'#2a2d31',roughness:.35,metalness:.8}),
  dark:phys({color:'#111315',roughness:.6,metalness:.2}),
  glass:phys({color:'#0d1b26',roughness:.05,metalness:.1,clearcoat:1}),
  wrap:phys({color:WRAP[build.power]||WRAP.balanced,roughness:.55,metalness:.05}),
  prop:phys({color:'#cfd4d6',roughness:.35,metalness:0,transparent:true,opacity:Math.min(opacity,.78),depthWrite:false}),
  propFront:phys({color:accent,roughness:.35,metalness:0,transparent:true,opacity:Math.min(opacity,.82),depthWrite:false}),
  tape:phys({color:'#b9a77a',roughness:.95}),
  livery:phys({color:LIVERY[build.livery]||accent,roughness:.5}),
  led:new THREE.MeshBasicMaterial({color:accent,...base}),
  lensTint:phys({color:{thermal:'#c76a2a',lowlight:'#3f7a4a',depth:'#3a4a7a'}[build.sensor]||'#1c3242',roughness:.05,metalness:.3,clearcoat:1}),
 };
}

const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
const cyl=(rt,rb,h,m,seg=16)=>new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);
function beam(a,b,w,h,m){const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),o=box(w,h,len,m);o.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o.rotation.y=Math.atan2(dx,dz);return o;}

// Motor positions per chassis (x right, z forward is negative).
function layout(c){
 switch(c){
  case 'carrier':return Array.from({length:8},(_,i)=>{const a=(i+.5)/8*Math.PI*2;return [Math.sin(a)*1.25,Math.cos(a)*1.25];});
  case 'ducted':return [[.78,-.78],[-.78,-.78],[.78,.78],[-.78,.78]];
  case 'speed':return [[.62,-1.05],[-.62,-1.05],[.72,.95],[-.72,.95]];
  case 'skeletal':return [[.82,-.82],[-.82,-.82],[.82,.82],[-.82,.82]];
  case 'offset':return [[1.0,-.72],[-1.0,-.72],[.68,.86],[-.68,.86]];
  case 'hybrid':return [[.78,-.95],[-.78,-.95],[.78,.95],[-.78,.95]];
  case 'wing':return [[.55,.62],[-.55,.62]];
  default:return [[.85,-.85],[-.85,-.85],[.85,.85],[-.85,.85]];
 }
}

function propeller(m,{blades=3,radius=.5,width=.13},group){
 const p=new THREE.Group();
 const g=new THREE.BoxGeometry(radius,.01,width);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),k=1-.55*Math.max(0,x/(radius/2));pos.setZ(i,pos.getZ(i)*k);}g.computeVertexNormals();
 for(let i=0;i<blades;i++){const b=new THREE.Mesh(g,m);b.position.x=radius/2;const holder=new THREE.Group();holder.rotation.y=i/blades*Math.PI*2;b.rotation.x=.32;holder.add(b);p.add(holder);}
 group.add(p);return p;
}

export function buildAircraft(build={},{opacity=1}={}){
 const M=mats(build,opacity),root=new THREE.Group(),parts={};const add=(name,o)=>{(parts[name]||(parts[name]=new THREE.Group(),root.add(parts[name]),parts[name])).add(o);return o;};
 const chassis=build.chassis||'scout',L=layout(chassis),props=[];
 const motorScale=build.motor==='torque'?1.18:build.motor==='efficient'?.9:1;
 const propSpec={blades:build.propeller==='low-drag'?2:chassis==='ducted'?5:3,radius:(chassis==='carrier'?.4:chassis==='ducted'?.36:chassis==='speed'?.42:.47),width:build.propeller==='grip'?.11:build.propeller==='low-drag'?.06:.085};

 // Frame.
 if(chassis==='wing'){
  const s=new THREE.Shape();s.moveTo(0,-1.15);s.lineTo(1.7,.55);s.lineTo(1.55,.72);s.lineTo(.35,.5);s.lineTo(0,.62);s.lineTo(-.35,.5);s.lineTo(-1.55,.72);s.lineTo(-1.7,.55);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.07,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2});g.rotateX(Math.PI/2);
  add('chassis',new THREE.Mesh(g,M.frame)).position.y=.06;
  for(const x of [-1.62,1.62]){const f=box(.04,.32,.32,M.accent);f.position.set(x,.2,.62);add('chassis',f);}
  const pod=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.9,6,12),M.shell);pod.rotation.x=Math.PI/2;pod.scale.set(1.2,1,.75);pod.position.set(0,.2,-.15);add('finish',pod);
 }else{
  const plate=box(chassis==='skeletal'?.34:.5,.04,chassis==='speed'?1.25:chassis==='hybrid'?1.9:.95,M.frame);add('chassis',plate);
  const top=box(.42,.035,chassis==='speed'?1.0:.78,M.frame);top.position.y=.32;add('chassis',top);
  for(const [x,z] of [[.17,-.3],[-.17,-.3],[.17,.3],[-.17,.3]]){const s=cyl(.022,.022,.3,M.metal,8);s.position.set(x,.16,z);add('chassis',s);}
  if(chassis==='hybrid'){for(const x of [-.78,.78])add('chassis',beam([x,0,-1],[x,0,1],.14,.05,M.frame));add('chassis',beam([-.78,0,-.55],[.78,0,-.55],.12,.04,M.frame));add('chassis',beam([-.78,0,.55],[.78,0,.55],.12,.04,M.frame));}
  else for(const [x,z] of L){
   const from=[x*.12,0,z*.12],to=[x,0,z];
   if(chassis==='skeletal'){for(const o of [-.045,.045]){const a=beam([from[0]+o,0,from[2]],[to[0]+o,0,to[2]],.025,.025,M.frame);add('chassis',a);}}
   else add('chassis',beam(from,to,chassis==='carrier'?.12:.16,.045,build.material==='mixed'&&x<0?M.frameAlt:M.frame));
  }
  if(chassis==='carrier'){const pay=box(.55,.22,.7,M.dark);pay.position.y=-.2;add('power',pay);}
  // Canopy shell over the stack.
  const cap=new THREE.Mesh(new THREE.CapsuleGeometry(.2,chassis==='speed'?1.0:.5,6,14),M.shell);cap.rotation.x=Math.PI/2;cap.scale.set(1.15,1,.62);cap.position.set(0,.2,chassis==='speed'?-.05:-.1);add('finish',cap);
  if(build.livery){const st=box(.08,.02,chassis==='speed'?1.15:.72,M.livery);st.position.set(0,.33,-.08);add('finish',st);}
 }

 // Motors, props, ducts.
 for(const [x,z] of L){
  const y=chassis==='wing'?.12:.04,mg=new THREE.Group();mg.position.set(x,y,z);mg.scale.setScalar(motorScale);
  const stator=cyl(.1,.11,.06,M.dark);stator.position.y=.03;const bell=cyl(.11,.11,.1,M.motor,20);bell.position.y=.11;const nut=cyl(.02,.035,.05,M.metal,8);nut.position.y=.2;
  mg.add(stator,bell,nut);add('power',mg);
  const pg=new THREE.Group();pg.position.set(x,y+.19*motorScale,z);add('power',pg);
  props.push(propeller(z<0||chassis==='wing'?M.propFront:M.prop,propSpec,pg));
  if(chassis==='ducted'){const d=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.16,32,1,true),M.shell);d.material.side=THREE.DoubleSide;d.position.set(x,y+.17,z);add('finish',d);const rim=new THREE.Mesh(new THREE.TorusGeometry(.47,.025,6,32),M.accent);rim.rotation.x=Math.PI/2;rim.position.set(x,y+.25,z);add('finish',rim);}
  if(build.illumination==='edge'&&chassis!=='wing'){const led=beam([x*.25,-.04,z*.25],[x*.9,-.04,z*.9],.04,.02,M.led);add('finish',led);}
 }

 // Battery (power + pack choice).
 {const pack=build.battery||(build.power==='endurance'?'long':'standard'),dims={light:[.3,.16,.5],standard:[.34,.2,.66],long:[.36,.22,.9],discharge:[.38,.26,.7]}[pack];
  const bat=box(...dims,M.wrap);const by=chassis==='wing'?.36:.48;bat.position.set(0,by,.05);add('power',bat);
  const strap=box(dims[0]+.03,dims[1]+.02,.06,M.dark);strap.position.set(0,by,.05);add('power',strap);
  const lead=cyl(.018,.018,.25,M.dark,6);lead.rotation.x=Math.PI/2;lead.position.set(.12,by-.05,dims[2]/2+.12);add('power',lead);}

 // Camera / sensor head at the nose, tilted up like a racing uptilt.
 {const s=build.sensor||'daylight',cam=new THREE.Group();cam.position.set(0,chassis==='wing'?.2:.17,chassis==='speed'?-.68:chassis==='wing'?-.72:-.52);cam.rotation.x=chassis==='wing'?0:-.42;
  const body=box(s==='dual'?.24:s==='minimal'?.13:.19,s==='dual'?.3:.17,.17,M.dark);cam.add(body);
  const lens=(x,y,r,m)=>{const l=cyl(r,r*1.05,.08,m,18);l.rotation.x=Math.PI/2;l.position.set(x,y,-.11);cam.add(l);};
  if(s==='dual'){lens(0,.07,.05,M.lensTint);lens(0,-.07,.05,M.lensTint);}
  else if(s==='depth'){lens(-.055,0,.035,M.lensTint);lens(.055,0,.035,M.lensTint);const e=box(.04,.04,.02,M.led);e.position.set(0,.065,-.09);cam.add(e);}
  else if(s==='thermal'){const w=box(.12,.1,.03,M.lensTint);w.position.z=-.095;cam.add(w);}
  else if(s==='wide'){lens(0,0,.075,M.glass);const hood=new THREE.Mesh(new THREE.CylinderGeometry(.1,.085,.07,20,1,true),M.dark);hood.material.side=THREE.DoubleSide;hood.rotation.x=Math.PI/2;hood.position.z=-.16;cam.add(hood);}
  else lens(0,0,s==='minimal'?.035:.05,s==='lowlight'?M.lensTint:M.glass);
  if(chassis!=='wing'&&s!=='minimal')for(const x of [-.14,.14]){const cage=box(.025,.22,.24,M.frame);cage.position.set(x,0,0);cam.add(cage);}
  add('sensor',cam);
  if(s==='flow'){const f=cyl(.05,.05,.04,M.glass,12);f.position.set(0,-.05,.15);add('sensor',f);}}

 // Control system: antennas, GPS, compute.
 {const sys=build.system||'direct',rear=chassis==='speed'?.62:chassis==='wing'?.55:.44,y=chassis==='wing'?.2:.34;
  const whip=(x,tilt,h)=>{const a=cyl(.012,.012,h,M.dark,6);a.position.set(x,y+h/2*Math.cos(tilt),rear+h/2*Math.sin(tilt));a.rotation.x=tilt;add('system',a);const tip=cyl(.03,.03,.06,M.accent,8);tip.position.set(x,y+h*Math.cos(tilt),rear+h*Math.sin(tilt));tip.rotation.x=tilt;add('system',tip);};
  if(sys==='relay'){whip(-.1,.45,.6);whip(.1,.45,.6);}
  else if(sys==='aggressive'){whip(-.12,.9,.25);whip(.12,.9,.25);}
  else whip(0,.6,sys==='direct'?.22:.32);
  if(['inertial','precision','wind'].includes(sys)){const g=cyl(.09,.09,.04,M.dark,16);g.position.set(0,y+.08,rear-.12);add('system',g);}
  if(['edge','energy'].includes(sys)){const c=box(.24,.06,.2,M.metal);c.position.set(0,y+.03,rear-.2);add('system',c);for(let i=0;i<5;i++){const f=box(.012,.05,.2,M.metal);f.position.set(-.1+i*.05,y+.09,rear-.2);add('system',f);}}
  if(sys==='wind'){for(const x of [-.25,.25]){const fin=box(.02,.16,.22,M.accent);fin.position.set(x,y-.02,rear+.05);add('system',fin);}}}

 if(build.condition==='repaired'||build.finish==='repaired')for(const [x,z] of L.slice(0,3)){const t=box(.18,.05,.1,M.tape);t.position.set(x*.55,.03,z*.55);t.rotation.y=Math.atan2(x,z);add('finish',t);}

 root.traverse(o=>{if(o.isMesh){o.castShadow=true;}});
 root.userData.radius=chassis==='carrier'?1.75:chassis==='wing'?1.8:chassis==='hybrid'||chassis==='speed'?1.6:1.45;
 const dispose=()=>root.traverse(o=>{o.geometry?.dispose?.();});
 return {group:root,props,parts,dispose,materials:M};
}

// ───────── studio: interactive viewer and cached snapshots ─────────
const VIEWS={garage:[-.62,.42],top:[-.02,1.45],front:[0,.12],profile:[-Math.PI/2,.1]};
function studio(scene){
 scene.add(new THREE.HemisphereLight('#eef4f8','#4a4236',1.7));
 const key=new THREE.DirectionalLight('#fff1dc',2.2);key.position.set(-3,5,-2.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3});scene.add(key);
 const rim=new THREE.DirectionalLight('#b5d6ee',2.1);rim.position.set(3,2,4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(3.2,48),new THREE.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.position.y=-.32;floor.receiveShadow=true;scene.add(floor);
}
function aim(camera,view,radius,az=0){const [a,e]=VIEWS[view]||VIEWS.garage,d=radius*3.45;camera.position.set(Math.sin(a+az)*Math.cos(e)*-d,Math.sin(e)*d+.15,Math.cos(a+az)*Math.cos(e)*-d);camera.lookAt(0,.12,0);}

export function mountViewer(canvas,build,{view='garage',autoRotate=true}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.05,50);studio(scene);
 let craft=null,az=0,drag=null,spinning=autoRotate&&!matchMedia?.('(prefers-reduced-motion: reduce)').matches,highlightUntil=0,lit=[],printing=false,printT=0,frame=0,last=0;
 const clearLit=()=>{lit.forEach(([o,m])=>{o.material.dispose();o.material=m;});lit=[];};
 const clip=new THREE.Plane(new THREE.Vector3(0,-1,0),5);
 const set=b=>{clearLit();if(craft){scene.remove(craft.group);craft.dispose();}craft=buildAircraft(b);scene.add(craft.group);applyClip();};
 const applyClip=()=>craft?.group.traverse(o=>{if(o.isMesh)o.material.clippingPlanes=printing?[clip]:null;});
 const resize=()=>{const w=canvas.clientWidth||600,h=canvas.clientHeight||320;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(canvas);resize();set(build);
 const tick=t=>{frame=requestAnimationFrame(tick);const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  if(spinning&&!drag&&view==='garage')az+=dt*.35;
  craft.props.forEach((p,i)=>p.rotation.y+=(i%2?1:-1)*dt*(printing?0:3));
  if(printing){printT=(printT+dt*.45)%1.25;clip.constant=-.35+Math.min(1,printT)*1.3;}
  if(lit.length){if(t>highlightUntil)clearLit();else{const k=.35+.35*Math.sin(t/90);lit.forEach(([o])=>o.material.emissive?.setRGB(k*.9,k*.55,k*.18));}}
  aim(camera,view,craft.group.userData.radius,az);renderer.render(scene,camera);};
 frame=requestAnimationFrame(tick);
 const down=e=>{drag={x:e.clientX,az};canvas.setPointerCapture?.(e.pointerId);};const move=e=>{if(drag)az=drag.az+(e.clientX-drag.x)/140;};const up=()=>{drag=null;};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 return {
  setBuild:set,setView:v=>{view=v;az=0;},
  setHighlight:p=>{clearLit();const g=craft?.parts[p==='material'?'chassis':p];if(!g)return;g.traverse(o=>{if(o.isMesh){lit.push([o,o.material]);o.material=o.material.clone();}});highlightUntil=performance.now()+1400;},
  setPrinting:p=>{printing=Boolean(p);printT=0;clip.constant=5;applyClip();},
  dispose:()=>{cancelAnimationFrame(frame);ro.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);craft?.dispose();scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());o.geometry?.dispose?.();});renderer.dispose();},
 };
}

let shared=null;const cache=new Map();let queue=Promise.resolve();
export function snapshot(build,view='garage',w=600,h=340){
 const key=view+'|'+JSON.stringify(build);if(cache.has(key))return Promise.resolve(cache.get(key));
 queue=queue.then(()=>new Promise(resolve=>{requestAnimationFrame(()=>{try{
  if(!shared){const c=document.createElement('canvas');const r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true});r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.toneMapping=THREE.ACESFilmicToneMapping;const scene=new THREE.Scene();studio(scene);shared={r,scene,camera:new THREE.PerspectiveCamera(32,w/h,.05,50)};}
  const {r,scene,camera}=shared;r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const craft=buildAircraft(build);scene.add(craft.group);aim(camera,view,craft.group.userData.radius);r.render(scene,camera);
  const url=r.domElement.toDataURL('image/png');scene.remove(craft.group);craft.dispose();craft.group.traverse(o=>{if(o.material)o.material.dispose();});
  if(cache.size>80)cache.delete(cache.keys().next().value);cache.set(key,url);resolve(url);}catch{resolve(null);}});}));
 return queue;
}
