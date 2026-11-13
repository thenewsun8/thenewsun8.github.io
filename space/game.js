import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

/* ================= 기본 ================= */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const FONT='"Jua","Apple SD Gothic Neo","Malgun Gothic",sans-serif';
const SAVE="space.save";let save={best:0,wave:1,gyro:false,auto:true,snd:true};
try{Object.assign(save,JSON.parse(localStorage.getItem(SAVE)||"{}"))}catch(e){}
const store=()=>{try{localStorage.setItem(SAVE,JSON.stringify(save))}catch(e){}};

const glc=$("gl"),hud=$("hud"),hx=hud.getContext("2d");
const MOBILE=matchMedia("(pointer:coarse)").matches||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:!MOBILE,powerPreference:"high-performance"});
let DPR=Math.min(window.devicePixelRatio||1,MOBILE?1.6:2);
renderer.setPixelRatio(DPR);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(70,1,.1,4000);scene.add(camera);
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.7,.45,.84);composer.addPass(bloom);
composer.addPass(new OutputPass());
let useBloom=true;
let W=1,H=1;
function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);composer.setPixelRatio(DPR);composer.setSize(W,H);
 camera.aspect=W/H;camera.fov=W<H?74:60;camera.updateProjectionMatrix();
 hud.width=Math.round(W*DPR);hud.height=Math.round(H*DPR);hx.setTransform(DPR,0,0,DPR,0,0);layout()}
addEventListener("resize",resize);

/* ================= 소리 ================= */
let AC=null,master=null,nbuf=null,musicG=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=save.snd?.9:0;master.connect(AC.destination);
 const n=AC.sampleRate*2;nbuf=AC.createBuffer(1,n,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;startMusic()}catch(e){AC=null}}
 if(AC&&AC.state==="suspended")AC.resume();return AC}
function out(pan){if(pan==null||!AC.createStereoPanner)return master;const p=AC.createStereoPanner();p.pan.value=clamp(pan,-1,1);p.connect(master);return p}
function env(g,t,a,d,pk){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function osc(type,f,f2,d,pk,pan,at=0){if(!AC)return;const t=AC.currentTime+at,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,.004,d,pk);o.connect(g).connect(out(pan));o.start(t);o.stop(t+d+.05)}
function nz(d,pk,type,f,f2,pan,at=0){if(!AC)return;const t=AC.currentTime+at,s=AC.createBufferSource();s.buffer=nbuf;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);const g=AC.createGain();env(g,t,.005,d,pk);s.connect(fl).connect(g).connect(out(pan));s.start(t,Math.random());s.stop(t+d+.05)}
const SND={
 laser(p){osc("sawtooth",1500+Math.random()*200,260,.11,.07,p);nz(.05,.05,"highpass",4000,0,p)},
 eshot(p,v){osc("sine",380,900,.18,.05*v,p)},
 boom(p,v,big){nz(big?1.6:.9,(big?.9:.6)*v,"lowpass",big?2400:1800,90,p);osc("sine",big?70:95,30,big?1.2:.6,.7*v,p)},
 pop(p){osc("triangle",900,1600,.08,.08,p)},
 hit(){nz(.4,.5,"lowpass",1200,200);osc("square",120,50,.3,.18)},
 shield(){osc("sine",900,300,.25,.12);nz(.2,.12,"bandpass",3000)},
 lock(){osc("square",1760,0,.05,.06);osc("square",1760,0,.05,.06,null,.08)},
 missile(){nz(.9,.35,"bandpass",600,3000);osc("sawtooth",200,700,.5,.05)},
 orb(){[880,1175,1568].forEach((f,i)=>osc("triangle",f,0,.12,.12,null,i*.06))},
 alarm(){osc("square",880,0,.12,.08);osc("square",660,0,.12,.08,null,.15)},
 warp(){osc("sawtooth",80,1600,1.6,.12);nz(1.6,.25,"bandpass",300,6000)},
 wave(){[523,659,784].forEach((f,i)=>osc("triangle",f,0,.25,.14,null,i*.1))},
 win(){[523,659,784,1047,784,1047,1318,1568].forEach((f,i)=>osc("triangle",f,0,.35,.16,null,i*.13))},
 boss(){osc("sawtooth",55,45,2,.25);osc("sawtooth",82,66,2,.18);nz(2,.2,"lowpass",400,100)}
};
function snd(k,...a){if(AC&&save.snd)try{SND[k](...a)}catch(e){}}
function startMusic(){if(!AC||musicG)return;musicG=AC.createGain();musicG.gain.value=.0;musicG.connect(master);
 const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=900;lp.connect(musicG);
 for(const f of [55,82.4,110.2,164.8]){const o=AC.createOscillator();o.type="sawtooth";o.frequency.value=f;o.detune.value=rand(-8,8);const g=AC.createGain();g.gain.value=.05;o.connect(g).connect(lp);o.start()}
 const lfo=AC.createOscillator();lfo.frequency.value=.07;const lg=AC.createGain();lg.gain.value=500;lfo.connect(lg).connect(lp.frequency);lfo.start()}
function music(on){if(musicG&&AC)musicG.gain.setTargetAtTime(on&&save.snd?.35:0,AC.currentTime,.8)}
let pulseT=0;function musicPulse(dt){if(!AC||!save.snd||G.state!=="play")return;pulseT-=dt;if(pulseT<=0){pulseT=60/104;const t=AC.currentTime;osc("sine",55,40,.25,.12);if(Math.random()<.5)osc("triangle",pick([220,262,330,392]),0,.18,.025,null,.29)}}

/* ================= 텍스처 ================= */
function ctex(w,h,draw,srgb=true){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t}
const TEX={
 glow:ctex(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.2,"rgba(255,255,255,.75)");r.addColorStop(.5,"rgba(255,255,255,.18)");r.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=r;g.fillRect(0,0,128,128)}),
 fire:ctex(128,128,(g)=>{for(let i=0;i<14;i++){const x=64+rand(-22,22),y=64+rand(-22,22),R=rand(18,40),r=g.createRadialGradient(x,y,0,x,y,R);r.addColorStop(0,"rgba(255,255,255,.55)");r.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=r;g.fillRect(0,0,128,128)}}),
 smoke:ctex(128,128,(g)=>{for(let i=0;i<18;i++){const x=64+rand(-26,26),y=64+rand(-26,26),R=rand(16,38),r=g.createRadialGradient(x,y,0,x,y,R);r.addColorStop(0,"rgba(255,255,255,.28)");r.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=r;g.fillRect(0,0,128,128)}}),
 panel:ctex(512,512,(g)=>{g.fillStyle="#9aa0a8";g.fillRect(0,0,512,512);const id=g.getImageData(0,0,512,512),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*18;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0);
  for(let i=0;i<70;i++){const x=rand(0,512),y=rand(0,512),w=rand(30,140),h=rand(20,110);g.fillStyle="rgba("+(Math.random()<.5?"255,255,255,.06":"0,0,0,.1")+")";g.fillRect(x,y,w,h);g.strokeStyle="rgba(20,22,28,.55)";g.lineWidth=2;g.strokeRect(x,y,w,h)}
  for(let i=0;i<400;i++){g.fillStyle="rgba(30,30,36,.5)";g.fillRect(rand(0,512),rand(0,512),2,2)}
  for(let i=0;i<10;i++){g.fillStyle="rgba(255,200,40,.5)";g.fillRect(rand(0,512),rand(0,512),rand(20,60),4)}})
};
TEX.panel.wrapS=TEX.panel.wrapT=THREE.RepeatWrapping;TEX.panel.anisotropy=4;

/* ================= 우주 배경 (셰이더로 한 번 굽기) ================= */
const NOISE_GLSL=`
float h3(vec3 p){p=fract(p*.3183099+vec3(.71,.113,.419));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}`;
const skyScene=new THREE.Scene();
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
 uniforms:{cA:{value:new THREE.Color()},cB:{value:new THREE.Color()},cC:{value:new THREE.Color()},seed:{value:0},band:{value:V(0,1,0)},sunDir:{value:V(1,0,0)},sunCol:{value:new THREE.Color()}},
 vertexShader:`varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:NOISE_GLSL+`uniform vec3 cA,cB,cC,band,sunDir,sunCol;uniform float seed;varying vec3 vD;
 void main(){vec3 d=normalize(vD);vec3 p=d*2.2+seed;
  float q=fbm(p+fbm(p*1.7)*1.6);float neb=smoothstep(.42,.86,q);float neb2=smoothstep(.5,.92,fbm(p*2.7+4.));
  float b=exp(-pow(dot(d,band)*4.,2.));float dust=fbm(d*9.+seed);
  vec3 col=vec3(.0025,.004,.009);
  col+=cA*neb*.5+cB*neb2*.32+cC*b*(.06+dust*.28);
  col*=.75+.5*fbm(d*26.+seed);
  col*=1.-smoothstep(.52,.8,fbm(d*5.+9.+seed))*b*.7;
  float sd=max(dot(d,sunDir),0.);col+=sunCol*(pow(sd,1400.)*25.+pow(sd,90.)*.12+pow(sd,10.)*.015);
  gl_FragColor=vec4(col,1.);}`});
skyScene.add(new THREE.Mesh(new THREE.SphereGeometry(500,64,32),skyMat));
const cubeRT=new THREE.WebGLCubeRenderTarget(MOBILE?768:1024,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
const cubeCam=new THREE.CubeCamera(1,1000,cubeRT);
const pmrem=new THREE.PMREMGenerator(renderer);let envRT=null;

/* 별 */
function makeStars(n,r){const g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3);
 for(let i=0;i<n;i++){const d=new THREE.Vector3().randomDirection().multiplyScalar(r);pos.set([d.x,d.y,d.z],i*3);const t=Math.random(),b=Math.random()<.04?2.2:rand(.4,1.1);const c=t<.15?[.7,.8,1]:t<.25?[1,.85,.65]:[1,1,1];col.set(c.map(v=>v*b),i*3)}
 g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
 return new THREE.Points(g,new THREE.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,toneMapped:false,depthWrite:false}))}
const stars=makeStars(3500,3000);scene.add(stars);
/* 우주 먼지 (속도감) */
const dustN=500,dustG=new THREE.BufferGeometry(),dustP=new Float32Array(dustN*3);for(let i=0;i<dustN*3;i++)dustP[i]=rand(-90,90);
dustG.setAttribute("position",new THREE.BufferAttribute(dustP,3));
const dust=new THREE.Points(dustG,new THREE.PointsMaterial({size:.35,color:0x8899aa,transparent:true,opacity:.7,depthWrite:false}));scene.add(dust);

/* ================= 행성들 (절차 텍스처) ================= */
function vnoise(){const P=new Uint8Array(512);for(let i=0;i<256;i++)P[i]=i;for(let i=255;i>0;i--){const j=Math.floor(Math.random()*(i+1));[P[i],P[j]]=[P[j],P[i]]}for(let i=0;i<256;i++)P[i+256]=P[i];
 const hs=(x,y,z)=>P[P[P[x&255]+(y&255)]+(z&255)]/255;
 const n=(x,y,z)=>{const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);let fx=x-X,fy=y-Y,fz=z-Z;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
  const l=(a,b,t)=>a+(b-a)*t;return l(l(l(hs(X,Y,Z),hs(X+1,Y,Z),fx),l(hs(X,Y+1,Z),hs(X+1,Y+1,Z),fx),fy),l(l(hs(X,Y,Z+1),hs(X+1,Y,Z+1),fx),l(hs(X,Y+1,Z+1),hs(X+1,Y+1,Z+1),fx),fy),fz)};
 return(x,y,z,o=5)=>{let v=0,a=.5,f=1;for(let i=0;i<o;i++){v+=a*n(x*f,y*f,z*f);f*=2.02;a*=.5}return v}}
function sphereTex(w,h,fn,srgb=true){return ctex(w,h,(g)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++){const lat=(y/h-.5)*Math.PI,cl=Math.cos(lat),sl=Math.sin(lat);for(let x=0;x<w;x++){const lon=x/w*TAU,c=fn(cl*Math.cos(lon),-sl,cl*Math.sin(lon),lat),i=(y*w+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=c[3]==null?255:c[3]}}g.putImageData(id,0,0)},srgb)}
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function atmo(r,color,power=3.2,k=.75){return new THREE.Mesh(new THREE.SphereGeometry(r*1.06,64,32),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 uniforms:{c:{value:new THREE.Color(color)},p:{value:power},k:{value:k}},vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform vec3 c;uniform float p,k;varying vec3 vN;varying vec3 vV;void main(){float i=pow(clamp(k-dot(vN,vV),0.,1.),p)*3.;gl_FragColor=vec4(c*i,i);}`}))}
const world=new THREE.Group();scene.add(world);
const sun=new THREE.DirectionalLight(0xffffff,3);scene.add(sun);scene.add(sun.target);
const hemi=new THREE.HemisphereLight(0x8aa0d0,0x221a30,1.1);scene.add(hemi);const fill=new THREE.DirectionalLight(0x8fa8ff,1.3);fill.position.set(-.5,-.3,-.6);scene.add(fill);
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glow,color:new THREE.Color(8,7,6),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));scene.add(sunSprite);
const SECTORS=[
 {name:"지구 궤도",cA:"#1a3a8a",cB:"#5a2a8a",cC:"#9aa0c0",sun:[.55,.32,.77],sunC:[1,.95,.85],seed:3.1},
 {name:"고리 행성",cA:"#9a6a2a",cB:"#2a4a8a",cC:"#b0a080",sun:[-.7,.25,.65],sunC:[1,.9,.75],seed:7.7},
 {name:"붉은 성운",cA:"#b01a3a",cB:"#ff6a2a",cC:"#b07070",sun:[.2,.45,.87],sunC:[1,.55,.3],seed:12.3},
 {name:"블랙홀",cA:"#5a1a9a",cB:"#1a6ab0",cC:"#9a8ac0",sun:[-.4,.6,.7],sunC:[.75,.85,1],seed:21.9}];
let sector=-1;
function buildSector(i){
 sector=i;const S=SECTORS[i];
 skyMat.uniforms.cA.value.set(S.cA);skyMat.uniforms.cB.value.set(S.cB);skyMat.uniforms.cC.value.set(S.cC);skyMat.uniforms.seed.value=S.seed;
 skyMat.uniforms.band.value=V(rand(-.4,.4),1,rand(-.4,.4)).normalize();const sd=V(...S.sun).normalize();skyMat.uniforms.sunDir.value.copy(sd);skyMat.uniforms.sunCol.value.setRGB(...S.sunC);
 cubeCam.update(renderer,skyScene);scene.background=cubeRT.texture;
 if(envRT)envRT.dispose();envRT=pmrem.fromCubemap(cubeRT.texture);scene.environment=envRT.texture;
 sun.position.copy(sd).multiplyScalar(100);sun.color.setRGB(...S.sunC);sunSprite.position.copy(sd).multiplyScalar(1500);sunSprite.scale.setScalar(i===2?200:95);fill.position.copy(sd).multiplyScalar(-1).add(V(0,-.4,0));sunSprite.material.color.setRGB(S.sunC[0]*1.6,S.sunC[1]*1.5,S.sunC[2]*1.4);
 hemi.color.set(S.cA);
 world.clear();const nz=vnoise();
 if(i===0){const R=520,p=new THREE.Mesh(new THREE.SphereGeometry(R,96,64),new THREE.MeshStandardMaterial({roughness:.85,metalness:0,map:sphereTex(1024,512,(x,y,z,lat)=>{const n=nz(x*2.2,y*2.2,z*2.2,6),ice=Math.abs(lat)>1.25;if(ice)return[235,240,250];if(n<.52){const k=n/.52;return mixc([6,22,60],[24,80,150],k).map(Math.round)}const m=(n-.52)/.48;return mixc([60,110,50],[150,130,90],Math.min(1,m*2)).map(Math.round)})}));
  const cl=new THREE.Mesh(new THREE.SphereGeometry(R*1.01,96,64),new THREE.MeshStandardMaterial({transparent:true,depthWrite:false,roughness:1,map:sphereTex(1024,512,(x,y,z)=>{const n=nz(x*3+9,y*3,z*3,6);const a=clamp((n-.48)*4,0,1)*255;return[255,255,255,a]})}));
  const g=new THREE.Group();g.add(p,cl,atmo(R,"#4a9aff"));g.position.set(.25,-.62,-.75).normalize().multiplyScalar(1250);g.rotation.z=.3;g.userData.spin=cl;world.add(g);
  const mo=new THREE.Mesh(new THREE.SphereGeometry(55,48,32),new THREE.MeshStandardMaterial({roughness:.95,map:sphereTex(512,256,(x,y,z)=>{const n=nz(x*4+3,y*4,z*4,5);const c=Math.round(90+n*120);return[c,c,c-6]})}));mo.position.set(-.75,.3,.55).normalize().multiplyScalar(1400);world.add(mo)}
 else if(i===1){const R=300,band=[[206,170,120],[170,120,70],[230,210,170],[140,95,60]];
  const p=new THREE.Mesh(new THREE.SphereGeometry(R,96,64),new THREE.MeshStandardMaterial({roughness:.9,map:sphereTex(1024,512,(x,y,z,lat)=>{const n=nz(x*1.5,y*1.5,z*1.5,4),t=(Math.sin(lat*14+n*5)+1)/2,b=Math.floor((lat+2)*3)%4;return mixc(band[b],band[(b+1)%4],t).map(Math.round)})}));
  const rg=new THREE.RingGeometry(R*1.35,R*2.3,180,1),pos=rg.attributes.position,uv=rg.attributes.uv;for(let k=0;k<pos.count;k++){const r=Math.hypot(pos.getX(k),pos.getY(k));uv.setXY(k,(r-R*1.35)/(R*.95),.5)}
  const ring=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,roughness:1,map:ctex(512,4,(g)=>{for(let x=0;x<512;x++){const a=(.35+.5*Math.abs(Math.sin(x*.09)*Math.sin(x*.023)))*(x>300&&x<318?.1:1);g.fillStyle="rgba("+(200+Math.sin(x*.05)*30|0)+","+(180+Math.sin(x*.07)*25|0)+",140,"+a.toFixed(2)+")";g.fillRect(x,0,1,4)}})}));
  ring.rotation.x=-1.25;const g=new THREE.Group();g.add(p,ring,atmo(R,"#b08050",3,.62));g.position.set(-.55,.12,-.83).normalize().multiplyScalar(1300);g.rotation.z=-.35;world.add(g)}
 else if(i===2){const R=270,tex=sphereTex(1024,512,(x,y,z)=>{const n=nz(x*3,y*3,z*3,6),r=1-Math.abs(nz(x*6+5,y*6,z*6,4)-.5)*2;const c=mixc([30,18,16],[70,40,30],n);return c.map(Math.round)}),em=sphereTex(1024,512,(x,y,z)=>{const r=1-Math.abs(nz(x*6+5,y*6,z*6,4)-.5)*2,v=Math.pow(clamp((r-.82)*6,0,1),2);return[255*v,110*v,20*v]});
  const p=new THREE.Mesh(new THREE.SphereGeometry(R,96,64),new THREE.MeshStandardMaterial({roughness:.8,map:tex,emissiveMap:em,emissive:new THREE.Color(1,1,1),emissiveIntensity:2.2}));
  const g=new THREE.Group();g.add(p,atmo(R,"#ff5a2a",3,.8));g.position.set(.7,-.32,-.62).normalize().multiplyScalar(1150);world.add(g)}
 else{const R=110,g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(R,64,32),new THREE.MeshBasicMaterial({color:0x000000})));
  const dg=new THREE.RingGeometry(R*1.5,R*5,256,1),pos=dg.attributes.position,uv=dg.attributes.uv;for(let k=0;k<pos.count;k++){const r=Math.hypot(pos.getX(k),pos.getY(k)),a=Math.atan2(pos.getY(k),pos.getX(k));uv.setXY(k,(r-R*1.5)/(R*3.5),(a/TAU+1)%1)}
  const dt=ctex(512,512,(c)=>{const id=c.createImageData(512,512),d=id.data;for(let y=0;y<512;y++)for(let x=0;x<512;x++){const r=x/512,n=nz(r*8,y/512*20,1,4),hot=Math.pow(1-r,2.2);const a=clamp(hot*(.55+n*.9)*1.4,0,1),i=(y*512+x)*4;d[i]=255;d[i+1]=150+105*hot|0;d[i+2]=60+195*Math.pow(hot,3)|0;d[i+3]=a*255}c.putImageData(id,0,0)});
  const disk=new THREE.Mesh(dg,new THREE.MeshBasicMaterial({map:dt,side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:new THREE.Color(2.2,1.6,1.2),toneMapped:false}));disk.rotation.x=-1.38;g.add(disk);g.userData.spin=disk;
  const photon=new THREE.Mesh(new THREE.TorusGeometry(R*1.12,R*.07,16,128),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2,1.2),transparent:true,opacity:.9,blending:THREE.AdditiveBlending,toneMapped:false}));g.add(photon);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glow,color:new THREE.Color(1.6,.9,.6),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.scale.setScalar(R*9);halo.renderOrder=-1;g.add(halo);
  g.position.set(0,.12,-1).normalize().multiplyScalar(1500);g.lookAt(0,0,0);world.add(g)}
}

/* ================= 외계 우주선 모델 ================= */
const metal=(c,r=.35,m=.85)=>{const t=TEX.panel.clone();t.needsUpdate=true;t.repeat.set(2,2);return new THREE.MeshStandardMaterial({color:c,map:t,metalness:m*.85,roughness:r+.08,envMapIntensity:2.4})};
const glowMat=(r,g,b)=>new THREE.MeshBasicMaterial({color:new THREE.Color(r,g,b),toneMapped:false});
const glass=new THREE.MeshPhysicalMaterial({color:0x66ffd0,metalness:0,roughness:.05,transmission:0,transparent:true,opacity:.75,emissive:new THREE.Color(.1,.9,.6),emissiveIntensity:.8,clearcoat:1});
function engineGlow(col,s){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glow,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));sp.scale.setScalar(s);return sp}
function makeSaucer(){const g=new THREE.Group(),prof=[[0,-.9],[1.2,-.85],[2.8,-.45],[3.6,-.05],[3.7,.1],[2.9,.45],[1.6,.7],[0,.76]].map(p=>new THREE.Vector2(p[0],p[1]));
 g.add(new THREE.Mesh(new THREE.LatheGeometry(prof,40),metal(0x8a909c)));
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1.3,28,14,0,TAU,0,Math.PI/2),glass);dome.position.y=.62;g.add(dome);
 const lights=[];for(let i=0;i<10;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),glowMat(.3,2.5,1.6));const a=i/10*TAU;l.position.set(Math.cos(a)*3.62,.08,Math.sin(a)*3.62);g.add(l);lights.push(l)}
 const under=engineGlow(new THREE.Color(.4,2.4,1.6),3.2);under.position.y=-1;g.add(under);
 g.userData={lights,spin:true};return g}
function makeFighter(){const g=new THREE.Group(),m=metal(0x5a4a6a,.3),dark=metal(0x2a2430,.45);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.55,1.05,6,10),m);body.rotation.x=Math.PI/2;g.add(body);
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.55,2,10),m);nose.rotation.x=Math.PI/2;nose.position.z=4;g.add(nose);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.42,14,10),glowMat(3,.25,.2));eye.position.set(0,.5,2.4);eye.scale.set(1,.6,1.4);g.add(eye);
 const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(4.6,-1.6);sh.lineTo(5,-2.6);sh.lineTo(1.2,-2.2);sh.lineTo(0,-1.8);
 const wg=new THREE.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:1});
 for(const s of [1,-1]){const w=new THREE.Mesh(wg,dark);w.rotation.x=Math.PI/2;w.scale.x=s;w.position.set(s*.5,0,1.2);g.add(w);
  const st=new THREE.Mesh(new THREE.BoxGeometry(3.6,.06,.12),glowMat(2.6,.3,1.8));st.position.set(s*2.6,.13,-.2);st.rotation.y=s*.34;g.add(st);
  const man=new THREE.Mesh(new THREE.ConeGeometry(.18,2.4,6),dark);man.rotation.x=Math.PI/2;man.position.set(s*.75,-.2,4.2);g.add(man);
  const eng=new THREE.Mesh(new THREE.CylinderGeometry(.35,.42,1.4,10),dark);eng.rotation.x=Math.PI/2;eng.position.set(s*.75,0,-3);g.add(eng);
  const gl=engineGlow(new THREE.Color(2.8,1.1,.3),1.8);gl.position.set(s*.75,0,-3.9);g.add(gl)}
 g.userData={};return g}
function makeOrb(){const g=new THREE.Group(),m=metal(0x3a3a44,.4);const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,1),m);g.add(core);
 const ico=new THREE.IcosahedronGeometry(1.5,0),p=ico.attributes.position,seen=new Set();
 for(let i=0;i<p.count;i++){const v=V(p.getX(i),p.getY(i),p.getZ(i)),k=v.toArray().map(n=>n.toFixed(2)).join();if(seen.has(k))continue;seen.add(k);const sp=new THREE.Mesh(new THREE.ConeGeometry(.28,1.5,6),m);sp.position.copy(v.clone().multiplyScalar(1.25));sp.quaternion.setFromUnitVectors(V(0,1,0),v.clone().normalize());g.add(sp)}
 const heart=new THREE.Mesh(new THREE.SphereGeometry(.9,16,12),glowMat(3,.3,2.4));g.add(heart);const hl=engineGlow(new THREE.Color(2.5,.3,2),6);g.add(hl);
 g.userData={pulse:[heart,hl]};return g}
function makeBomber(){const g=new THREE.Group(),m=metal(0x6a7068,.35),dark=metal(0x30343a,.5);
 const hull=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.8,2.2,6),m);hull.scale.z=1.5;g.add(hull);
 const deck=new THREE.Mesh(new THREE.BoxGeometry(3,1.4,6),dark);deck.position.y=1.5;g.add(deck);
 const win=new THREE.Mesh(new THREE.BoxGeometry(2.4,.3,.2),glowMat(3,.5,.2));win.position.set(0,1.8,3);g.add(win);
 for(const s of [1,-1]){const pod=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,7,12),dark);pod.rotation.x=Math.PI/2;pod.position.set(s*5.6,0,0);g.add(pod);
  const gl=engineGlow(new THREE.Color(.5,1.6,3),3.2);gl.position.set(s*5.6,0,-4);g.add(gl);
  for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.16,6,4),glowMat(3,2,.4));l.position.set(s*4.2,1.15,-3+i*2);g.add(l)}}
 g.userData={};return g}
function makeBoss(final){const g=new THREE.Group(),S=final?1.3:1,m=metal(final?0x4a3a5a:0x5a6070,.32),dark=metal(0x24262c,.5);
 const prof=[[0,-6],[8,-5.6],[18,-3.4],[26,-1],[28,0],[26,1.4],[20,3],[12,5],[6,7.5],[0,8]].map(p=>new THREE.Vector2(p[0]*S,p[1]*S));
 g.add(new THREE.Mesh(new THREE.LatheGeometry(prof,64),m));
 const ring=new THREE.Mesh(new THREE.TorusGeometry(29*S,1.2*S,12,96),dark);ring.rotation.x=Math.PI/2;g.add(ring);
 const lights=[];for(let i=0;i<32;i++){const a=i/32*TAU,l=new THREE.Mesh(new THREE.SphereGeometry(.45*S,8,6),glowMat(3,.6,.3));l.position.set(Math.cos(a)*29*S,0,Math.sin(a)*29*S);g.add(l);lights.push(l)}
 const turrets=[];const nt=final?6:4;
 for(let i=0;i<nt;i++){const a=i/nt*TAU+.3,t=new THREE.Group();t.position.set(Math.cos(a)*17*S,3.4*S,Math.sin(a)*17*S);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.6*S,3.2*S,1.6*S,12),dark);t.add(base);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(2.2*S,16,10,0,TAU,0,Math.PI/2),m);dome.position.y=.6*S;t.add(dome);
  const core=new THREE.Mesh(new THREE.SphereGeometry(1.2*S,14,10),glowMat(3,.3,.15));core.position.y=1.6*S;t.add(core);
  const gl=engineGlow(new THREE.Color(3,.5,.2),6*S);gl.position.y=1.6*S;t.add(gl);
  g.add(t);turrets.push({g:t,core,gl,hp:final?14:10,max:final?14:10,alive:true,fireT:rand(2,4)})}
 const core=new THREE.Mesh(new THREE.SphereGeometry(5*S,24,16),glowMat(3.2,1.2,.3));core.position.y=-6.5*S;g.add(core);
 const cg=engineGlow(new THREE.Color(3,1.4,.5),24*S);cg.position.y=-6.5*S;g.add(cg);
 const shieldM=new THREE.MeshBasicMaterial({color:new THREE.Color(.4,1.2,2.6),transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const shield=new THREE.Mesh(new THREE.SphereGeometry(7.5*S,24,16),shieldM);shield.position.y=-6.5*S;g.add(shield);
 g.userData={lights,turrets,core,cg,shield,S};return g}

/* ================= 효과 (불꽃·연기·파편) ================= */
const FX=[],fxGroup=new THREE.Group();scene.add(fxGroup);
function fx(o){let p=FX.find(f=>!f.alive);if(!p){if(FX.length>=420)return null;const m=new THREE.SpriteMaterial({map:TEX.glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});const s=new THREE.Sprite(m);fxGroup.add(s);p={s,m,vel:V(),c0:new THREE.Color(),c1:new THREE.Color(),alive:false};FX.push(p)}
 p.alive=true;p.s.visible=true;p.s.position.copy(o.pos);p.vel.copy(o.vel||V());p.life=p.max=o.life||1;p.s0=o.s0||1;p.s1=o.s1??p.s0;p.c0.copy(o.c0);p.c1.copy(o.c1||o.c0);p.a0=o.a??1;p.drag=o.drag??.98;
 const tex=o.tex||TEX.glow,bl=o.add===false?THREE.NormalBlending:THREE.AdditiveBlending;if(p.m.map!==tex||p.m.blending!==bl){p.m.map=tex;p.m.blending=bl;p.m.needsUpdate=true}p.m.rotation=rand(0,TAU);p.spin=o.spin??rand(-1,1);return p}
function updFX(dt){for(const p of FX){if(!p.alive)continue;p.life-=dt;if(p.life<=0){p.alive=false;p.s.visible=false;continue}const t=1-p.life/p.max;p.s.position.addScaledVector(p.vel,dt);p.vel.multiplyScalar(Math.pow(p.drag,dt*60));
 p.s.scale.setScalar(lerp(p.s0,p.s1,t));p.m.color.copy(p.c0).lerp(p.c1,t);p.m.opacity=p.a0*Math.pow(1-t,1.3);p.m.rotation+=p.spin*dt}}
const DEB=[];const debGeo=[new THREE.TetrahedronGeometry(1),new THREE.BoxGeometry(1.4,.4,.9),new THREE.IcosahedronGeometry(.8,0)];
for(let i=0;i<50;i++){const m=new THREE.MeshStandardMaterial({color:0x6a6e78,metalness:.8,roughness:.4,emissive:new THREE.Color(3,1.1,.3),emissiveIntensity:1});const d=new THREE.Mesh(pick(debGeo),m);d.visible=false;scene.add(d);DEB.push({m:d,mat:m,vel:V(),rv:V(),life:0,alive:false})}
const RINGS=[];for(let i=0;i<8;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.85,1,64),new THREE.MeshBasicMaterial({color:new THREE.Color(1.1,.85,.6),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false}));r.visible=false;scene.add(r);RINGS.push({r,life:0,max:1,size:1})}
const FL=[new THREE.PointLight(0xffaa55,0,200,1.6),new THREE.PointLight(0xffaa55,0,200,1.6)];FL.forEach(l=>scene.add(l));let flI=0;
function panOf(pos){const v=pos.clone().applyMatrix4(camera.matrixWorldInverse);return clamp(v.x/Math.max(20,-v.z+Math.abs(v.x)),-1,1)}
function explode(pos,size=1,col){const c=col||new THREE.Color(3,1.8,.6),d=pos.length(),near=clamp(d/45,.2,1);
 fx({pos,life:.28,s0:size*5*near,s1:size*11*near,c0:new THREE.Color(4*near,3.6*near,2.8*near),c1:c});
 for(let i=0;i<16;i++)fx({pos,vel:new THREE.Vector3().randomDirection().multiplyScalar(rand(2,9)*size),life:rand(.6,1.2),s0:size*rand(1.5,2.6),s1:size*rand(4,7),c0:new THREE.Color(3,1.7,.55),c1:new THREE.Color(.5,.08,.02),tex:TEX.fire,drag:.95});
 for(let i=0;i<9;i++)fx({pos,vel:new THREE.Vector3().randomDirection().multiplyScalar(rand(1,4)*size),life:rand(1.4,2.4),s0:size*2.5,s1:size*rand(7,10),c0:new THREE.Color(.18,.16,.15),c1:new THREE.Color(.05,.05,.06),tex:TEX.smoke,add:false,a:.7,drag:.97});
 for(let i=0;i<22;i++)fx({pos,vel:new THREE.Vector3().randomDirection().multiplyScalar(rand(20,45)*size),life:rand(.4,.8),s0:size*.7,s1:size*.2,c0:new THREE.Color(4,3,1.6),c1:new THREE.Color(1.5,.4,0),drag:.93});
 for(let i=0;i<Math.round(4+size*3);i++){const b=DEB.find(x=>!x.alive);if(!b)break;b.alive=true;b.life=rand(1.5,2.5);b.m.visible=true;b.m.position.copy(pos);b.m.scale.setScalar(size*rand(.3,.8));b.vel.randomDirection().multiplyScalar(rand(8,22)*size);b.rv.set(rand(-6,6),rand(-6,6),rand(-6,6));b.mat.emissiveIntensity=1.5}
 const r=RINGS.find(x=>x.life<=0);if(r){r.life=r.max=.6;r.size=size*14*near;r.r.position.copy(pos);r.r.lookAt(0,0,0);r.r.visible=true}
 const L=FL[flI++%2];L.position.copy(pos);L.intensity=700*size*near;L.userData.t=.35;
 snd("boom",panOf(pos),clamp(160/(d+40),.15,1),size>2);if(d<90)shake(clamp((90-d)/90,0,1)*.6*size)}
function updDebris(dt){for(const b of DEB){if(!b.alive)continue;b.life-=dt;if(b.life<=0){b.alive=false;b.m.visible=false;continue}b.m.position.addScaledVector(b.vel,dt);b.m.rotation.x+=b.rv.x*dt;b.m.rotation.y+=b.rv.y*dt;b.mat.emissiveIntensity=Math.max(0,b.mat.emissiveIntensity-dt*1.2);if(b.life<.4)b.m.scale.multiplyScalar(.9)}
 for(const r of RINGS){if(r.life<=0)continue;r.life-=dt;const t=1-r.life/r.max;r.r.scale.setScalar(r.size*(.2+t*1.4));r.r.material.opacity=(1-t)*.5;if(r.life<=0)r.r.visible=false}
 for(const L of FL){if(L.userData.t>0){L.userData.t-=dt;L.intensity*=Math.pow(.02,dt)}else L.intensity=0}}

/* ================= 게임 상태 ================= */
const ETYPES={
 drone:{hp:2,r:4.2,speed:24,orbit:[70,120],fire:[3.8,6.5],score:100,make:makeSaucer},
 fighter:{hp:3,r:4.6,speed:36,orbit:[50,100],fire:[2.8,4.8],score:150,make:makeFighter},
 kamikaze:{hp:1,r:3.2,speed:24,kamikaze:true,score:120,make:makeOrb},
 bomber:{hp:8,r:8,speed:14,orbit:[110,160],fire:[2.4,3.6],burst:3,score:400,make:makeBomber}};
const WAVES=[{drone:5},{drone:5,fighter:3},{drone:4,fighter:4,kamikaze:3},{fighter:6,kamikaze:4,bomber:1},{boss:1,fighter:4},
 {fighter:6,bomber:2,kamikaze:4},{drone:6,fighter:6,kamikaze:6},{fighter:8,bomber:3,kamikaze:5},{drone:6,fighter:8,bomber:3,kamikaze:6},{boss:2,fighter:6,kamikaze:4}];
const sectorOf=w=>w<=3?0:w<=5?1:w<=7?2:3;
const G={state:"title",wave:1,queue:[],spawnT:0,msg:"",msgT:0,sub:"",clearT:0,warpT:0,shake:0,shakeV:V(),deadT:0,waveScore:0,hitDir:[],titleT:0,boss:null,fps:60,fpsN:0,fpsT:0,perfChecked:false};
const P={hull:100,shield:100,sinceHit:9,fireT:0,gun:0,missiles:6,rapid:0,triple:0,lockT:0,lock:null,lockCand:null,score:0,combo:0,comboT:0,shots:0,hits:0,kills:0,firing:false,mBtn:false,missileT:0,crack:0,alarmT:0};
let enemies=[],pbolts=[],ebolts=[],missiles=[],orbs=[];
let yaw=0,pitch=0,gyroOn=false,gyroQ=new THREE.Quaternion(),gyroYaw=0,gyroOK=false,screenOri=0;

/* ================= 플레이어 무기 ================= */
const boltGeo=new THREE.CylinderGeometry(.09,.09,1,6);boltGeo.rotateX(Math.PI/2);
const boltMat=new THREE.MeshBasicMaterial({color:new THREE.Color(.6,2.4,4),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
const eboltMatR=new THREE.SpriteMaterial({map:TEX.glow,color:new THREE.Color(4,.7,.35),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
const eboltMatG=new THREE.SpriteMaterial({map:TEX.glow,color:new THREE.Color(.6,4,1),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
const fwd=()=>V(0,0,-1).applyQuaternion(camera.quaternion);
function camLocal(x,y,z){return V(x,y,z).applyQuaternion(camera.quaternion)}
function angleTo(pos){const d=pos.clone().normalize();return fwd().angleTo(d)}
function aimTarget(maxA){let best=null,ba=maxA;for(const e of enemies){if(e.dead)continue;const a=angleTo(e.pos)-Math.atan(e.r/Math.max(1,e.pos.length()));if(a<ba){ba=a;best=e}}
 if(G.boss)for(const t of bossTargets()){const a=angleTo(t.pos)-Math.atan(t.r/t.pos.length());if(a<ba){ba=a;best=t}}return best}
function firePlayer(){
 const t=aimTarget(.16),sp=760;P.shots++;
 const gun=P.gun++%2?1:-1,org=camLocal(gun*1.1,-.85,-1.4);
 let aim;if(t){const d=t.pos.length(),lead=t.vel?t.vel.clone().multiplyScalar(d/sp):V();aim=t.pos.clone().add(lead)}else aim=fwd().multiplyScalar(240);
 const dirs=[aim.clone().sub(org).normalize()];if(P.triple>0){const r=camLocal(1,0,0);for(const s of [-1,1])dirs.push(dirs[0].clone().addScaledVector(r,s*.045).normalize())}
 for(const d of dirs){const m=new THREE.Mesh(boltGeo,boltMat);m.scale.z=9;m.position.copy(org).addScaledVector(d,4);m.quaternion.setFromUnitVectors(V(0,0,1),d);scene.add(m);pbolts.push({m,vel:d.multiplyScalar(sp),life:.9})}
 fx({pos:org.clone().addScaledVector(fwd(),.6),life:.06,s0:.9,s1:1.4,c0:new THREE.Color(1.5,3.5,5)});
 snd("laser",gun*.35);P.fireT=P.rapid>0?.065:.12;
}
function fireMissile(){if(!P.lock||P.missiles<=0||P.missileT>0)return;P.missiles--;P.missileT=.6;
 const org=camLocal(rand(-.6,.6),-1.4,-1),g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.8,8),metal(0xdddddd,.3));b.rotation.x=Math.PI/2;g.add(b);
 const gl=engineGlow(new THREE.Color(3,1.6,.6),1.6);gl.position.z=-1;g.add(gl);g.position.copy(org);scene.add(g);
 missiles.push({g,pos:g.position,vel:fwd().multiplyScalar(40).add(camLocal(0,-6,0)),target:P.lock,life:5,smokeT:0});snd("missile")}
function hitTarget(t,dmg,pos){
 if(t.turret){const tu=t.turret;if(!tu.alive)return;tu.hp-=dmg;fx({pos,life:.2,s0:2,s1:4,c0:new THREE.Color(4,2.5,1)});if(tu.hp<=0){tu.alive=false;tu.g.visible=false;explode(t.pos,2.2);addScore(500,t.pos);G.boss.e.say="포탑 파괴!"}return}
 if(t.bossCore){const b=G.boss;if(b.turretsLeft>0){fx({pos,life:.25,s0:3,s1:6,c0:new THREE.Color(.6,1.6,3.5)});return}b.coreHp-=dmg;fx({pos,life:.2,s0:3,s1:6,c0:new THREE.Color(4,2.5,1)});if(b.coreHp<=0&&!b.dying){b.dying=2.6;snd("boss")}return}
 const e=t;e.hp-=dmg;e.flash=.08;fx({pos,life:.18,s0:1.6,s1:3.4,c0:new THREE.Color(4,2.6,1.2)});snd("pop",panOf(pos));
 if(e.hp<=0&&!e.dead)killEnemy(e)}
function killEnemy(e){e.dead=true;explode(e.pos,e.type==="bomber"?2.2:1.3);scene.remove(e.g);P.kills++;addScore(e.def.score,e.pos);
 if(Math.random()<(e.type==="bomber"?.9:.16))spawnOrb(e.pos);if(e.type==="bomber")P.missiles=Math.min(9,P.missiles+1)}
function addScore(v,pos){if(P.comboT>0)P.combo++;else P.combo=1;P.comboT=3;const mul=Math.min(3,1+Math.floor(P.combo/4)*.5);const s=Math.round(v*mul);P.score+=s;if(pos)pops.push({pos:pos.clone(),t:1,txt:"+"+s})}
const pops=[];
const ORBT={shield:{c:[.5,1.6,4],txt:"보호막 회복!"},rapid:{c:[4,.8,.6],txt:"연사 속도 업!"},triple:{c:[4,3,.6],txt:"세 갈래 레이저!"},missile:{c:[2.6,.8,4],txt:"미사일 +2"}};
function spawnOrb(pos){const k=pick(Object.keys(ORBT)),c=new THREE.Color(...ORBT[k].c),g=new THREE.Group();g.add(engineGlow(c,5));const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.12,8,32),glowMat(c.r,c.g,c.b));g.add(ring);g.position.copy(pos);scene.add(g);orbs.push({g,k,ring,vel:V(),t:0})}

/* ================= 적 ================= */
function spawnEnemy(type){const def=ETYPES[type],g=def.make();const dir=randDir(.55),pos=dir.multiplyScalar(rand(380,460));g.position.copy(pos);scene.add(g);
 const e={type,def,g,pos:g.position,vel:pos.clone().normalize().multiplyScalar(-def.speed*1.6),hp:def.hp+Math.floor(G.wave/4)*(type==="bomber"?2:0),r:def.r,orbit:rand(...(def.orbit||[0,0])),axis:V(rand(-.3,.3),1,rand(-.3,.3)).normalize(),dirS:Math.random()<.5?-1:1,fireT:def.fire?rand(...def.fire)+1.5:0,t:rand(0,9),dead:false,flash:0};
 enemies.push(e);G.incoming=1.2}
function randDir(el){const y=rand(0,TAU),e=rand(-el,el);return V(Math.cos(e)*Math.sin(y),Math.sin(e),Math.cos(e)*Math.cos(y))}
function enemyFire(e,from,col){const d=V().sub(from).normalize(),sp=48+G.wave*3.5;const s=new THREE.Sprite(col==="g"?eboltMatG:eboltMatR);s.scale.setScalar(3.2);s.position.copy(from).addScaledVector(d,e.r||3);scene.add(s);
 ebolts.push({s,pos:s.position,vel:d.multiplyScalar(sp),life:9,r:2.6});snd("eshot",panOf(from),clamp(120/from.length(),.2,1))}
function updEnemies(dt){
 for(const e of enemies){if(e.dead)continue;e.t+=dt;const d=e.pos.length(),toP=e.pos.clone().multiplyScalar(-1/d);
  if(e.def.kamikaze){const sp=e.def.speed+G.wave*1.2+Math.max(0,(200-d)*.05);e.vel.lerp(toP.clone().multiplyScalar(sp).add(V(Math.sin(e.t*2),Math.cos(e.t*1.7),0).multiplyScalar(4)),dt*1.5);
   if(d<4.5){e.dead=true;scene.remove(e.g);explode(e.pos.clone().normalize().multiplyScalar(14),.7);damage(18,e.pos)}}
  else{let desired;if(d>e.orbit+15)desired=toP.clone().multiplyScalar(e.def.speed*1.4);
   else{const tan=V().crossVectors(e.axis,toP).normalize().multiplyScalar(e.dirS*e.def.speed);desired=tan.addScaledVector(toP,(d-e.orbit)*.25);desired.y+=Math.sin(e.t*.8)*3}
   e.vel.lerp(desired,dt*1.2);
   if(e.def.fire){e.fireT-=dt;if(e.fireT<=0&&d<300){e.fireT=rand(...e.def.fire)*Math.max(.55,1-G.wave*.04);const n=e.def.burst||1;for(let i=0;i<n;i++)setTimeout(()=>{if(!e.dead&&G.state==="play")enemyFire(e,e.pos.clone(),e.type==="drone"?"g":"r")},i*220)}}}
  e.pos.addScaledVector(e.vel,dt);
  if(e.g.userData.spin){e.g.rotation.y+=dt*1.6;e.g.rotation.z=clamp(e.vel.x*.01,-.3,.3);e.g.userData.lights.forEach((l,i)=>l.scale.setScalar(.6+.6*Math.abs(Math.sin(e.t*4+i))))}
  else{const q=new THREE.Quaternion(),m=new THREE.Matrix4().lookAt(e.pos,e.pos.clone().add(e.vel.lengthSq()>.01?e.vel:toP),V(0,1,0));q.setFromRotationMatrix(m);
   const fl=new THREE.Quaternion().setFromAxisAngle(V(0,0,1),Math.PI);q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0,1,0),Math.PI));e.g.quaternion.slerp(q,dt*3);
   if(e.g.userData.pulse){const k=1+.25*Math.sin(e.t*10);e.g.userData.pulse[0].scale.setScalar(k);e.g.userData.pulse[1].scale.setScalar(6*k);e.g.rotation.z+=dt*3}}
  if(e.flash>0)e.flash-=dt}
 enemies=enemies.filter(e=>!e.dead)}

/* ================= 보스 (외계 모선) ================= */
function spawnBoss(final){const g=makeBoss(final);const dir=randDir(.25),dist=final?190:170;g.position.copy(dir.multiplyScalar(600));scene.add(g);
 G.boss={e:{say:""},g,final,dist,angle:Math.atan2(g.position.x,g.position.z),turretsLeft:g.userData.turrets.length,coreHp:final?90:55,coreMax:final?90:55,spawnT:10,ringT:4,t:0,dying:0};
 msg(final?"최종 보스! 외계 황제의 모선":"경고! 외계 모선 출현","포탑을 먼저 부수면 가운데 심장이 열려요");snd("boss");snd("alarm")}
function bossTargets(){const b=G.boss;if(!b||b.dying)return[];const out=[];const S=b.g.userData.S;
 for(const tu of b.g.userData.turrets)if(tu.alive){const p=new THREE.Vector3();tu.core.getWorldPosition(p);out.push({pos:p,r:3.2*S,turret:tu,vel:V()})}
 const p=new THREE.Vector3();b.g.userData.core.getWorldPosition(p);out.push({pos:p,r:(b.turretsLeft>0?7.5:5.5)*S,bossCore:true,vel:V()});return out}
function updBoss(dt){const b=G.boss;if(!b)return;b.t+=dt;const g=b.g,u=g.userData;
 const target=V(Math.sin(b.angle),Math.sin(b.t*.2)*.18,Math.cos(b.angle)).normalize().multiplyScalar(b.dist);
 g.position.lerp(target,dt*(g.position.length()>b.dist+30?1.1:.25));b.angle+=dt*(b.final?.05:.035);
 g.rotation.y+=dt*.15;g.rotation.x=.25*Math.sin(b.t*.3);u.lights.forEach((l,i)=>l.scale.setScalar(.5+.8*Math.abs(Math.sin(b.t*3+i*.6))));
 b.turretsLeft=u.turrets.filter(t=>t.alive).length;u.shield.visible=b.turretsLeft>0;u.shield.material.opacity=.25+.12*Math.sin(b.t*6);
 if(b.dying){b.dying-=dt;if(Math.random()<dt*12){const p=g.position.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(rand(5,30)*u.S));explode(p,rand(1.5,3))}
  if(b.dying<=0){explode(g.position.clone(),6);explode(g.position.clone().add(V(10,0,0)),4);scene.remove(g);addScore(b.final?8000:4000,g.position);G.boss=null;msg("모선 격파!!","",2);snd("win")}return}
 for(const tu of u.turrets){if(!tu.alive)continue;tu.fireT-=dt;tu.core.scale.setScalar(1+.2*Math.sin(b.t*8));if(tu.fireT<=0){tu.fireT=rand(2.4,4)*(b.final?.75:1);const p=new THREE.Vector3();tu.core.getWorldPosition(p);enemyFire({r:3},p,"r")}}
 if(b.turretsLeft===0){b.ringT-=dt;if(b.ringT<=0){b.ringT=b.final?2.6:3.4;const p=new THREE.Vector3();u.core.getWorldPosition(p);const d=V().sub(p).normalize(),r=V().crossVectors(d,V(0,1,0)).normalize(),up=V().crossVectors(r,d);
   for(let i=0;i<(b.final?7:5);i++){const a=i/(b.final?7:5)*TAU,dir=d.clone().addScaledVector(r,Math.cos(a)*.12).addScaledVector(up,Math.sin(a)*.12).normalize();const tgt=p.clone().addScaledVector(dir,-p.length()*2);enemyFire({r:6},p.clone(),"g");ebolts[ebolts.length-1].vel.copy(dir.multiplyScalar(52+G.wave*2))}}}
 b.spawnT-=dt;if(b.spawnT<=0&&enemies.length<5){b.spawnT=b.final?9:12;for(let i=0;i<2;i++){spawnEnemy(pick(["fighter","kamikaze"]));const e=enemies[enemies.length-1];e.pos.copy(g.position).add(new THREE.Vector3().randomDirection().multiplyScalar(30))}msg("모선에서 전투기 출격!","",1.4)}
 const p=new THREE.Vector3();u.core.getWorldPosition(p);u.cg.scale.setScalar(24*u.S*(1+.15*Math.sin(b.t*5)))}

/* ================= 피해 ================= */
function damage(v,from){P.sinceHit=0;const dir=from.clone().applyMatrix4(camera.matrixWorldInverse);G.hitDir.push({a:Math.atan2(dir.x,-dir.y),t:1});
 if(P.shield>0){const s=Math.min(P.shield,v);P.shield-=s;v-=s;snd("shield")}if(v>0){P.hull-=v;P.crack=1;snd("hit");shake(.8)}else shake(.35);
 if(P.hull<=0&&G.state==="play"){P.hull=0;G.state="dying";G.deadT=2;for(let i=0;i<4;i++)setTimeout(()=>explode(fwd().multiplyScalar(14).add(new THREE.Vector3().randomDirection().multiplyScalar(5)),1.4),i*250);music(false)}}
function shake(a){G.shake=Math.max(G.shake,a)}
function msg(m,sub="",t=2.6){G.msg=m;G.sub=sub;G.msgT=t}

/* ================= 흐름 ================= */
function clearAll(){for(const e of enemies)scene.remove(e.g);for(const b of pbolts)scene.remove(b.m);for(const b of ebolts)scene.remove(b.s);for(const m of missiles)scene.remove(m.g);for(const o of orbs)scene.remove(o.g);if(G.boss)scene.remove(G.boss.g);
 enemies=[];pbolts=[];ebolts=[];missiles=[];orbs=[];G.boss=null;P.lock=null;P.lockT=0}
function startWave(n){clearAll();G.wave=n;const w=WAVES[n-1];G.queue=[];for(const k in w)if(k!=="boss")for(let i=0;i<w[k];i++)G.queue.push(k);G.queue.sort(()=>Math.random()-.5);
 if(w.boss)G.bossPending=w.boss;else G.bossPending=0;G.spawnT=2;G.state="play";P.missiles=Math.max(P.missiles,6);G.waveScore=P.score;G.startHull=P.hull;
 msg("웨이브 "+n+(w.boss?" · 보스":""),SECTORS[sectorOf(n)].name,2.6);snd("wave");save.wave=Math.max(save.wave,n);store();music(true)}
function beginGame(fromWave){ac();["title","dead","win"].forEach(i=>$(i).hidden=true);Object.assign(P,{hull:100,shield:100,score:0,combo:0,shots:0,hits:0,kills:0,missiles:6,rapid:0,triple:0,crack:0});
 const s=sectorOf(fromWave);if(s!==sector)buildSector(s);startWave(fromWave);G.hullSum=0;G.hullN=0}
function nextWave(){const n=G.wave+1;if(n>WAVES.length){win();return}if(sectorOf(n)!==sector){G.state="warp";G.warpT=0;G.warpTo=n;snd("warp");msg("하이퍼 점프!",SECTORS[sectorOf(n)].name+"(으)로",2.4)}else startWave(n)}
function win(){G.state="win";music(false);snd("win");const acc=P.shots?P.hits/P.shots:0,st=1+(P.hull>=50?1:0)+(acc>=.4?1:0);
 if(P.score>save.best)save.best=P.score;save.wave=1;store();$("wStars").textContent="★".repeat(st)+"☆".repeat(3-st);$("wScore").textContent=P.score.toLocaleString()+"점";
 $("wText").innerHTML="격추 <b>"+P.kills+"</b>대 · 명중률 <b>"+Math.round(acc*100)+"%</b><br>최고 점수 <b>"+save.best.toLocaleString()+"</b>";$("win").hidden=false}

/* ================= 입력 ================= */
const ptr=new Map();let BT={};
function layout(){const m=Math.min(W,H),land=W>H;BT={fire:{x:W-(land?110:86),y:H-(land?120:150),r:land?62:58},mis:{x:W-(land?220:86),y:H-(land?92:270),r:land?40:38},gyro:{x:W-36,y:52,r:24}}}
function hitBtn(x,y){for(const k in BT){const b=BT[k];if(Math.hypot(x-b.x,y-b.y)<b.r+8)return k}return null}
hud.addEventListener("pointerdown",e=>{ac();if(G.state==="title")return;const b=hitBtn(e.clientX,e.clientY);try{hud.setPointerCapture(e.pointerId)}catch(_){}
 ptr.set(e.pointerId,{b,x:e.clientX,y:e.clientY});if(b==="mis")fireMissile();if(b==="gyro")toggleGyro(!gyroOn);syncFire()});
hud.addEventListener("pointermove",e=>{const p=ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(p.b)return;
 const hf=2*Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect),k=hf/W*1.15;if(gyroOn)gyroYaw+=dx*k;else{yaw+=dx*k;pitch=clamp(pitch+dy*k,-1.35,1.35)}});
const pend=e=>{ptr.delete(e.pointerId);syncFire()};hud.addEventListener("pointerup",pend);hud.addEventListener("pointercancel",pend);
function syncFire(){P.firing=[...ptr.values()].some(p=>p.b==="fire")}
const keys={};addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyM")fireMissile();if(e.code==="Space")e.preventDefault()});addEventListener("keyup",e=>{keys[e.code]=false});
addEventListener("blur",()=>{ptr.clear();syncFire();for(const k in keys)keys[k]=false});
/* 자이로 */
const zee=V(0,0,1),q1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5)),eu=new THREE.Euler();
addEventListener("deviceorientation",e=>{if(e.alpha==null)return;gyroOK=true;const a=THREE.MathUtils.degToRad(e.alpha),b=THREE.MathUtils.degToRad(e.beta),g=THREE.MathUtils.degToRad(e.gamma);
 eu.set(b,a,-g,"YXZ");gyroQ.setFromEuler(eu);gyroQ.multiply(q1);gyroQ.multiply(new THREE.Quaternion().setFromAxisAngle(zee,-screenOri))});
const updOri=()=>{screenOri=THREE.MathUtils.degToRad((screen.orientation&&screen.orientation.angle)||window.orientation||0)};addEventListener("orientationchange",updOri);updOri();
async function toggleGyro(on){if(on&&typeof DeviceOrientationEvent!=="undefined"&&DeviceOrientationEvent.requestPermission){try{const r=await DeviceOrientationEvent.requestPermission();if(r!=="granted")on=false}catch(e){on=false}}
 if(on){const f=fwd();const gf=V(0,0,-1).applyQuaternion(gyroQ);gyroYaw=Math.atan2(-f.x,-f.z)-Math.atan2(-gf.x,-gf.z)}
 gyroOn=on;save.gyro=on;store();$("gyroBtn").textContent="폰 돌려서 보기: "+(on?"켬":"끔");$("gyroBtn").classList.toggle("on",on)}

/* ================= 업데이트 ================= */
function update(dt){
 G.msgT-=dt;
 // 카메라 방향
 if(keys.ArrowLeft)yaw+=dt*1.6;if(keys.ArrowRight)yaw-=dt*1.6;if(keys.ArrowUp)pitch=clamp(pitch+dt*1.2,-1.35,1.35);if(keys.ArrowDown)pitch=clamp(pitch-dt*1.2,-1.35,1.35);
 if(G.state==="title"){yaw+=dt*.05;pitch=Math.sin(G.titleT+=dt*.1)*.15}
 if(gyroOn&&gyroOK&&G.state!=="title"){camera.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(V(0,1,0),gyroYaw).multiply(gyroQ))}
 else camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,"YXZ"));
 if(G.shake>0){G.shake=Math.max(0,G.shake-dt*1.8);const s=G.shake*.02;camera.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(-s,s),rand(-s,s),rand(-s,s))))}
 camera.updateMatrixWorld();
 // 먼지
 const dp=dustG.attributes.position;for(let i=0;i<dustN;i++){let z=dp.getZ(i)+dt*(G.state==="warp"?400:14);if(z>90)z-=180;dp.setZ(i,z)}dp.needsUpdate=true;
 for(const o of world.children)if(o.userData.spin)o.userData.spin.rotation.z+=dt*(sector===3?.15:.004);
 updFX(dt);updDebris(dt);
 for(const p of pops)p.t-=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t<=0)pops.splice(i,1);
 for(const h of G.hitDir)h.t-=dt;G.hitDir=G.hitDir.filter(h=>h.t>0);
 if(G.state==="warp"){G.warpT+=dt;if(G.warpT>1.2&&!G.warped){G.warped=true;buildSector(sectorOf(G.warpTo))}if(G.warpT>2.4){G.warped=false;startWave(G.warpTo)}return}
 if(G.state==="dying"){G.deadT-=dt;P.crack=1;if(G.deadT<=0){G.state="dead";const acc=P.shots?Math.round(P.hits/P.shots*100):0;$("dText").innerHTML="웨이브 <b>"+G.wave+"</b> · 점수 <b>"+P.score.toLocaleString()+"</b><br>격추 <b>"+P.kills+"</b>대 · 명중률 <b>"+acc+"%</b>";$("dead").hidden=false}return}
 if(G.state!=="play"&&G.state!=="clear")return;
 // 스폰
 if(G.state==="play"){G.spawnT-=dt;const maxA=3+Math.floor(G.wave/2);
  if(G.bossPending&&G.spawnT<=0){spawnBoss(G.bossPending===2);G.bossPending=0;G.spawnT=5}
  else if(G.queue.length&&G.spawnT<=0&&enemies.length<maxA){spawnEnemy(G.queue.pop());G.spawnT=rand(1,2.2)}
  if(!G.queue.length&&!enemies.length&&!G.boss&&!G.bossPending){G.state="clear";G.clearT=3.2;const hb=Math.round(P.hull)*10;P.score+=500*G.wave+hb;msg("웨이브 "+G.wave+" 클리어!","보너스 +"+(500*G.wave+hb),3);snd("wave");P.shield=100}}
 if(G.state==="clear"){G.clearT-=dt;if(G.clearT<=0)nextWave()}
 updEnemies(dt);updBoss(dt);
 // 플레이어
 P.sinceHit+=dt;if(P.sinceHit>3)P.shield=Math.min(100,P.shield+dt*14);P.fireT-=dt;P.missileT-=dt;P.rapid-=dt;P.triple-=dt;P.comboT-=dt;P.crack=Math.max(0,P.crack-dt*.35);
 G.hullSum+=P.hull*dt;G.hullN+=dt;
 if(P.hull<30){P.alarmT-=dt;if(P.alarmT<=0){P.alarmT=1.4;snd("alarm")}}
 const auto=save.auto&&aimTarget(.085);
 if((P.firing||keys.Space||auto)&&P.fireT<=0&&G.state==="play")firePlayer();
 // 록온
 const cand=aimTarget(.13);
 if(cand&&P.missiles>0){if(P.lockCand===cand.g||P.lockCand===cand.turret||P.lockCand===cand.bossCore&&cand.bossCore){P.lockT+=dt}else{P.lockCand=cand.g||cand.turret||cand.bossCore;P.lockT=0}
  if(P.lockT>.45&&P.lock!==cand){if(!P.lock||P.lock.dead)snd("lock");P.lock=cand}}else{P.lockT=Math.max(0,P.lockT-dt*2)}
 if(P.lock&&(P.lock.dead||angleTo(P.lock.pos)>.3||(P.lock.turret&&!P.lock.turret.alive)))P.lock=null;
 if(P.lock&&P.lock.bossCore){const bt=bossTargets().find(t=>t.bossCore);if(bt)P.lock.pos.copy(bt.pos)}
 if(P.lock&&P.lock.turret){const p=new THREE.Vector3();P.lock.turret.core.getWorldPosition(p);P.lock.pos.copy(p)}
 // 내 레이저
 const targets=()=>{const a=enemies.filter(e=>!e.dead);return G.boss?a.concat(bossTargets()):a};
 for(const b of pbolts){const prev=b.m.position.clone();b.m.position.addScaledVector(b.vel,dt);b.life-=dt;
  for(const t of targets()){if(segHit(prev,b.m.position,t.pos,t.r)){b.life=0;P.hits++;hitTarget(t,1,b.m.position.clone());break}}
  if(b.life>0)for(const eb of ebolts){if(eb.life>0&&segHit(prev,b.m.position,eb.pos,eb.r+.8)){eb.life=0;b.life=0;P.hits++;fx({pos:eb.pos.clone(),life:.3,s0:2,s1:5,c0:new THREE.Color(3,2,1)});snd("pop",panOf(eb.pos));addScore(10);break}}
  if(b.life<=0)scene.remove(b.m)}
 pbolts=pbolts.filter(b=>b.life>0);
 // 미사일
 for(const m of missiles){m.life-=dt;const t=m.target;let tp=null;if(t&&!t.dead&&!(t.turret&&!t.turret.alive))tp=t.pos;
  if(tp){const want=tp.clone().sub(m.pos).normalize().multiplyScalar(170);m.vel.lerp(want,dt*3.2)}else m.vel.multiplyScalar(1+dt*.5);
  m.pos.addScaledVector(m.vel,dt);m.g.quaternion.setFromUnitVectors(V(0,0,1),m.vel.clone().normalize());
  m.smokeT-=dt;if(m.smokeT<=0){m.smokeT=.025;fx({pos:m.pos.clone(),life:1.1,s0:.8,s1:3,c0:new THREE.Color(.5,.5,.55),c1:new THREE.Color(.1,.1,.12),tex:TEX.smoke,add:false,a:.6,drag:.96})}
  if(tp&&m.pos.distanceTo(tp)<(t.r||4)+2.5){m.life=0;explode(m.pos.clone(),1.8);hitTarget(t,6,m.pos.clone());for(const e of enemies)if(!e.dead&&e!==t&&e.pos.distanceTo(m.pos)<14)hitTarget(e,3,e.pos.clone())}
  if(m.life<=0)scene.remove(m.g)}
 missiles=missiles.filter(m=>m.life>0);
 // 적 탄
 for(const b of ebolts){b.pos.addScaledVector(b.vel,dt);b.life-=dt;b.s.scale.setScalar(3.2+Math.sin(performance.now()*.02)*.5);if(b.life>0&&b.pos.length()<3){b.life=0;damage(8,b.pos);fx({pos:b.pos.clone(),life:.3,s0:3,s1:7,c0:new THREE.Color(3,1,.5)})}if(b.life<=0)scene.remove(b.s)}
 ebolts=ebolts.filter(b=>b.life>0);
 // 아이템
 for(const o of orbs){o.t+=dt;const d=o.g.position.length();o.vel.lerp(o.g.position.clone().multiplyScalar(-Math.min(60,6+o.t*10)/d),dt*2);o.g.position.addScaledVector(o.vel,dt);o.ring.rotation.x+=dt*2;o.ring.rotation.y+=dt*3;
  if(d<5){o.dead=true;scene.remove(o.g);snd("orb");msg(ORBT[o.k].txt,"",1.4);if(o.k==="shield")P.shield=100;else if(o.k==="rapid")P.rapid=9;else if(o.k==="triple")P.triple=10;else P.missiles=Math.min(9,P.missiles+2)}}
 orbs=orbs.filter(o=>!o.dead);
 if(G.incoming>0)G.incoming-=dt;
}
function segHit(a,b,c,r){const ab=b.clone().sub(a),t=clamp(c.clone().sub(a).dot(ab)/Math.max(1e-6,ab.lengthSq()),0,1);return a.clone().addScaledVector(ab,t).distanceToSquared(c)<r*r}

/* ================= HUD ================= */
const sp=(p)=>{const v=p.clone().project(camera);return{x:(v.x+1)/2*W,y:(1-v.y)/2*H,z:v.z}};
function hudText(t,x,y,sz,col,al="center",glow){hx.font=sz+"px "+FONT;hx.textAlign=al;hx.textBaseline="middle";if(glow){hx.shadowColor=col;hx.shadowBlur=glow}hx.fillStyle=col;hx.fillText(t,x,y);hx.shadowBlur=0}
function drawHUD(){
 hx.clearRect(0,0,W,H);const m=Math.min(W,H),cx=W/2,cy=H/2,land=W>H;
 // 렌즈 플레어
 const sv=sunSprite.position.clone().applyMatrix4(camera.matrixWorldInverse);if(sv.z<0&&G.state!=="title"||sv.z<0){const s=sp(sunSprite.position);if(s.x>-200&&s.x<W+200&&s.y>-200&&s.y<H+200){const vx=cx-s.x,vy=cy-s.y,k=clamp(1-Math.hypot(vx,vy)/(m*.9),0,1)*.9+.1;
  hx.globalCompositeOperation="lighter";[[.3,30,"rgba(255,220,180,.10)"],[.55,14,"rgba(140,200,255,.12)"],[.8,46,"rgba(255,160,100,.06)"],[1.25,22,"rgba(160,255,200,.08)"],[1.6,64,"rgba(120,150,255,.05)"]].forEach(([t,r,c])=>{hx.fillStyle=c;hx.globalAlpha=k;hx.beginPath();hx.arc(s.x+vx*t*1.2,s.y+vy*t*1.2,r*m/600,0,TAU);hx.fill()});
  const g=hx.createRadialGradient(s.x,s.y,0,s.x,s.y,m*.35);g.addColorStop(0,"rgba(255,240,220,"+(.1*k)+")");g.addColorStop(1,"rgba(255,240,220,0)");hx.fillStyle=g;hx.fillRect(0,0,W,H);hx.fillStyle="rgba(255,230,200,"+(.12*k)+")";hx.fillRect(s.x-m*.6,s.y-1,m*1.2,2);hx.globalAlpha=1;hx.globalCompositeOperation="source-over"}}
 if(G.state==="title")return;
 // 워프
 if(G.state==="warp"){const t=G.warpT,a=t<1.2?t/1.2:Math.max(0,(2.4-t)/1.2);hx.strokeStyle="rgba(180,220,255,"+(.6*a)+")";for(let i=0;i<140;i++){const an=i*2.4,r0=(i*37%100)/100*m*.3+m*.05,r1=r0+m*a*1.2;hx.lineWidth=1+i%3;hx.beginPath();hx.moveTo(cx+Math.cos(an)*r0,cy+Math.sin(an)*r0);hx.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1);hx.stroke()}
  if(t>1&&t<1.5){hx.fillStyle="rgba(220,240,255,"+(1-Math.abs(t-1.25)*4)+")";hx.fillRect(0,0,W,H)}}
 // 적 표시
 const mk=(pos,r,col,label,hp,max,big)=>{const v=pos.clone().applyMatrix4(camera.matrixWorldInverse),s=sp(pos),on=v.z<0&&s.x>0&&s.x<W&&s.y>0&&s.y<H;
  if(on){const f=H/2/Math.tan(camera.fov*Math.PI/360),rs=clamp(r/-v.z*f*1.3,10,big?200:70);hx.strokeStyle=col;hx.lineWidth=2;const c=rs*.4;
   for(const[sx,sy]of [[-1,-1],[1,-1],[1,1],[-1,1]]){hx.beginPath();hx.moveTo(s.x+sx*rs,s.y+sy*(rs-c));hx.lineTo(s.x+sx*rs,s.y+sy*rs);hx.lineTo(s.x+sx*(rs-c),s.y+sy*rs);hx.stroke()}
   if(label)hudText(label,s.x,s.y+rs+12,11,col);if(max>1){hx.fillStyle="rgba(0,0,0,.5)";hx.fillRect(s.x-rs,s.y-rs-9,rs*2,4);hx.fillStyle=col;hx.fillRect(s.x-rs,s.y-rs-9,rs*2*clamp(hp/max,0,1),4)}}
  else{let ax=v.x,ay=-v.y;if(v.z>0&&Math.hypot(ax,ay)<1e-3)ay=1;const a=Math.atan2(ay,ax),ex=W*.44,ey=H*.4,x=cx+Math.cos(a)*ex,y=cy+Math.sin(a)*ey;hx.save();hx.translate(x,y);hx.rotate(a);hx.fillStyle=col;hx.globalAlpha=.85;hx.beginPath();hx.moveTo(14,0);hx.lineTo(-6,-9);hx.lineTo(-2,0);hx.lineTo(-6,9);hx.closePath();hx.fill();hx.restore();hx.globalAlpha=1}};
 for(const e of enemies)mk(e.pos,e.r,e.def.kamikaze?"#ff5ad1":e.flash>0?"#fff":"#ff6a4a",Math.round(e.pos.length())+"m",e.hp,e.def.hp>2?e.def.hp:0);
 for(const b of ebolts){const s=sp(b.pos),v=b.pos.clone().applyMatrix4(camera.matrixWorldInverse);if(v.z<0&&b.pos.length()<120){hx.strokeStyle="rgba(255,90,60,.8)";hx.lineWidth=1.5;hx.beginPath();hx.arc(s.x,s.y,8,0,TAU);hx.stroke()}}
 if(G.boss&&!G.boss.dying){if(G.boss.g.position.length()>G.boss.dist+60)mk(G.boss.g.position,30*G.boss.g.userData.S,"#ffd24d","모선 접근 중",0,0,true);else for(const t of bossTargets())mk(t.pos,t.r,t.bossCore?(G.boss.turretsLeft>0?"#5ad1ff":"#ffd24d"):"#ff6a4a",t.bossCore?(G.boss.turretsLeft>0?"":"심장을 쏴라!"):"",t.turret?t.turret.hp:G.boss.coreHp,t.turret?t.turret.max:(G.boss.turretsLeft>0?0:G.boss.coreMax),true);
  const b=G.boss,tot=b.g.userData.turrets.reduce((a,t)=>a+Math.max(0,t.hp),0)+b.coreHp,mx=b.g.userData.turrets.reduce((a,t)=>a+t.max,0)+b.coreMax,bw=Math.min(W*.6,360);
  hx.fillStyle="rgba(0,0,0,.55)";hx.fillRect(cx-bw/2,58,bw,12);hx.fillStyle=b.final?"#ff3a7a":"#ff8a3a";hx.fillRect(cx-bw/2,58,bw*tot/mx,12);hudText(b.final?"외계 황제 모선":"외계 모선",cx,82,14,"#ffd0b0")}
 for(const o of orbs){const s=sp(o.g.position);if(s.z<1)hudText("선물",s.x,s.y-22,12,"#bfe8ff")}
 // 록온
 if(P.lock){const s=sp(P.lock.pos);const v=P.lock.pos.clone().applyMatrix4(camera.matrixWorldInverse);if(v.z<0){hx.save();hx.translate(s.x,s.y);hx.rotate(performance.now()*.003);hx.strokeStyle="#ff2a2a";hx.lineWidth=3;hx.strokeRect(-22,-22,44,44);hx.restore();hudText("LOCK",s.x,s.y-36,15,"#ff4a4a","center",8)}}
 else if(P.lockT>0&&P.lockCand){const k=Math.min(1,P.lockT/.45);hx.strokeStyle="rgba(255,90,90,"+k+")";hx.lineWidth=2;hx.beginPath();hx.arc(cx,cy,40-k*14,0,TAU*k);hx.stroke()}
 // 조준점
 const at=aimTarget(.085),cc=at?"#ffd24d":"#7fe8ff";hx.strokeStyle=cc;hx.lineWidth=2;hx.shadowColor=cc;hx.shadowBlur=8;hx.beginPath();hx.arc(cx,cy,16,0,TAU);hx.stroke();
 for(const[a,b]of [[1,0],[-1,0],[0,1],[0,-1]]){hx.beginPath();hx.moveTo(cx+a*22,cy+b*22);hx.lineTo(cx+a*34,cy+b*34);hx.stroke()}hx.fillStyle=cc;hx.fillRect(cx-1.5,cy-1.5,3,3);hx.shadowBlur=0;
 // 피격 방향
 for(const h of G.hitDir){hx.strokeStyle="rgba(255,40,40,"+h.t+")";hx.lineWidth=10;hx.beginPath();hx.arc(cx,cy,m*.3,h.a-Math.PI/2-.35,h.a-Math.PI/2+.35);hx.stroke()}
 // 점수 팝업
 for(const p of pops){const s=sp(p.pos);if(s.z<1){hx.globalAlpha=clamp(p.t*1.5,0,1);hudText(p.txt,s.x,s.y-20-(1-p.t)*30,16,"#ffe28a","center",6);hx.globalAlpha=1}}
 drawCockpit();
 // 손상
 if(P.crack>0){hx.globalAlpha=P.crack*.8;const g=hx.createRadialGradient(cx,cy,m*.3,cx,cy,m*.85);g.addColorStop(0,"rgba(255,0,0,0)");g.addColorStop(1,"rgba(255,30,20,.55)");hx.fillStyle=g;hx.fillRect(0,0,W,H);
  hx.strokeStyle="rgba(230,245,255,.75)";hx.lineWidth=1.2;const seed=[.23,.71,.4,.88,.12];for(let k=0;k<3;k++){let x=W*seed[k],y=H*seed[k+1]*.6;hx.beginPath();hx.moveTo(x,y);for(let i=0;i<7;i++){x+=Math.sin(k*9+i*3.1)*40;y+=Math.cos(k*7+i*2.3)*36;hx.lineTo(x,y)}hx.stroke()}hx.globalAlpha=1}
 if(P.hull<30&&G.state==="play"&&Math.sin(performance.now()*.008)>0)hudText("경고! 기체 손상",cx,H*.24,20,"#ff5a4a","center",10);
 // 메시지
 if(G.msgT>0){hx.globalAlpha=clamp(G.msgT,0,1);hudText(G.msg,cx,H*.3,clamp(m*.08,26,46),"#bff0ff","center",16);if(G.sub)hudText(G.sub,cx,H*.3+clamp(m*.07,28,40),17,"#9cc4e8");hx.globalAlpha=1}
 if(G.incoming>0&&G.state==="play"){hx.globalAlpha=clamp(G.incoming,0,1);hudText("적 접근!",cx,H*.19,16,"#ff9a7a");hx.globalAlpha=1}
 // 위쪽 정보
 hudText(P.score.toLocaleString(),cx,30,24,"#eaf6ff","center",6);
 hudText("웨이브 "+G.wave+"/10",land?70:W*.2,28,15,"#9cc4e8");
 if(P.combo>=4&&P.comboT>0)hudText(P.combo+" 연속 격추! ×"+Math.min(3,1+Math.floor(P.combo/4)*.5),cx,H*.38,18,"#ffd24d","center",8);
 // 버튼
 const fb=BT.fire;hx.globalAlpha=.9;hx.fillStyle=P.firing?"rgba(255,120,80,.55)":"rgba(255,80,60,.28)";hx.beginPath();hx.arc(fb.x,fb.y,fb.r,0,TAU);hx.fill();hx.strokeStyle="#ff9a7a";hx.lineWidth=3;hx.stroke();hudText("발사",fb.x,fb.y,20,"#fff");
 const mb=BT.mis,mon=P.lock&&P.missiles>0;hx.fillStyle=mon?"rgba(255,60,60,.6)":"rgba(120,120,140,.3)";hx.beginPath();hx.arc(mb.x,mb.y,mb.r,0,TAU);hx.fill();hx.strokeStyle=mon?"#ffb0b0":"#8890a0";hx.lineWidth=2;hx.stroke();hudText("미사일",mb.x,mb.y-6,13,"#fff");hudText(String(P.missiles),mb.x,mb.y+11,14,"#ffd24d");
 const gb=BT.gyro;hx.fillStyle=gyroOn?"rgba(74,216,255,.5)":"rgba(20,40,70,.6)";hx.beginPath();hx.arc(gb.x,gb.y,gb.r,0,TAU);hx.fill();hudText("폰",gb.x,gb.y,13,"#fff");hx.globalAlpha=1;
 if(G.state==="play"&&G.wave===1&&P.shots<4){hudText("화면을 끌어서 둘러봐요! 적이 조준점에 들어오면 자동 발사",cx,H*.62,14,"#ffffff","center",6)}
}
function drawCockpit(){const land=W>H,dh=land?H*.2:H*.17,top=H-dh,cx=W/2;
 hx.fillStyle="rgba(10,14,22,.9)";hx.beginPath();hx.moveTo(0,H);hx.lineTo(0,top+dh*.25);hx.quadraticCurveTo(W*.18,top-dh*.08,cx-dh*1.1,top);hx.lineTo(cx+dh*1.1,top);hx.quadraticCurveTo(W*.82,top-dh*.08,W,top+dh*.25);hx.lineTo(W,H);hx.closePath();
 const g=hx.createLinearGradient(0,top,0,H);g.addColorStop(0,"#2a3240");g.addColorStop(.08,"#141a24");g.addColorStop(1,"#06080c");hx.fillStyle=g;hx.fill();hx.strokeStyle="rgba(140,170,210,.35)";hx.lineWidth=1.5;hx.stroke();
 hx.fillStyle="rgba(0,0,0,.55)";hx.beginPath();hx.moveTo(0,0);hx.lineTo(W*.05,0);hx.lineTo(W*.012,top);hx.lineTo(0,top+dh*.3);hx.fill();hx.beginPath();hx.moveTo(W,0);hx.lineTo(W*.95,0);hx.lineTo(W*.988,top);hx.lineTo(W,top+dh*.3);hx.fill();
 hx.fillStyle="rgba(255,255,255,.035)";hx.beginPath();hx.moveTo(W*.08,0);hx.lineTo(W*.2,0);hx.lineTo(W*.05,H*.5);hx.lineTo(W*.02,H*.45);hx.fill();
 // 레이더
 const R=Math.min(dh*.42,68),rx=cx,ry=top+dh*.52;const rg=hx.createRadialGradient(rx,ry,0,rx,ry,R);rg.addColorStop(0,"rgba(20,80,60,.9)");rg.addColorStop(1,"rgba(6,30,24,.95)");hx.fillStyle=rg;hx.beginPath();hx.arc(rx,ry,R,0,TAU);hx.fill();
 hx.strokeStyle="rgba(90,255,180,.45)";hx.lineWidth=1;for(const k of [.33,.66,1]){hx.beginPath();hx.arc(rx,ry,R*k,0,TAU);hx.stroke()}hx.beginPath();hx.moveTo(rx-R,ry);hx.lineTo(rx+R,ry);hx.moveTo(rx,ry-R);hx.lineTo(rx,ry+R);hx.stroke();
 const sw=(performance.now()*.002)%TAU;hx.fillStyle="rgba(90,255,180,.18)";hx.beginPath();hx.moveTo(rx,ry);hx.arc(rx,ry,R,sw,sw+.5);hx.fill();
 const f=fwd();f.y=0;f.normalize();const rt=V(-f.z,0,f.x),range=480;
 const blip=(p,col,s)=>{const x=p.dot(rt)/range*R,y=-p.dot(f)/range*R,d=Math.hypot(x,y),k=d>R-3?(R-3)/d:1;hx.fillStyle=col;hx.beginPath();hx.arc(rx+x*k,ry+y*k,s,0,TAU);hx.fill();if(Math.abs(p.y)>15){hx.fillRect(rx+x*k-.5,ry+y*k,1,p.y>0?-5:5)}};
 for(const e of enemies)blip(e.pos,e.def.kamikaze?"#ff5ad1":"#ff6a4a",3);for(const b of ebolts)if(b.pos.length()<200)blip(b.pos,"rgba(255,200,120,.8)",1.5);if(G.boss)blip(G.boss.g.position,"#ffd24d",6);for(const o of orbs)blip(o.g.position,"#5ad1ff",2.5);
 hx.fillStyle="#5affb4";hx.beginPath();hx.moveTo(rx,ry-6);hx.lineTo(rx-4,ry+4);hx.lineTo(rx+4,ry+4);hx.fill();
 // 계기판
 const bw=Math.min(W*.22,170),bx=land?W*.08:W*.04,by=top+dh*.35;
 const bar=(y,lab,v,col)=>{hudText(lab,bx,y-9,12,"#9cc4e8","left");hx.fillStyle="rgba(255,255,255,.08)";hx.fillRect(bx,y,bw,10);hx.fillStyle=col;hx.shadowColor=col;hx.shadowBlur=8;hx.fillRect(bx,y,bw*clamp(v/100,0,1),10);hx.shadowBlur=0};
 bar(by,"보호막",P.shield,"#4ad8ff");bar(by+30,"기체",P.hull,P.hull<30?"#ff4a3a":"#ffb03a");
 if(!land||true){const ix=land?W*.62:W*.62;let iy=top+dh*.4;if(P.rapid>0){hudText("연사 "+Math.ceil(P.rapid),ix,iy,12,"#ff9a7a","left");iy+=16}if(P.triple>0)hudText("세 갈래 "+Math.ceil(P.triple),ix,iy,12,"#ffd24d","left")}}

/* ================= 루프 ================= */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 try{update(dt)}catch(e){console.error(e)}
 if(useBloom)composer.render(dt);else renderer.render(scene,camera);
 drawHUD();
 if(G.state==="play"){G.fpsN++;G.fpsT+=dt;if(G.fpsT>3){G.fps=G.fpsN/G.fpsT;G.fpsN=0;G.fpsT=0;if(!G.perfChecked){G.perfChecked=true;if(G.fps<34){useBloom=false;DPR=1;resize()}}}}
 musicPulse(dt);requestAnimationFrame(frame)}

/* ================= 시작 ================= */
resize();buildSector(0);
$("load").hidden=true;$("title").hidden=false;
const contW=clamp(save.wave||1,1,10);if(contW>1){$("contBtn").hidden=false;$("contBtn").textContent="이어하기 · 웨이브 "+contW}
const setTog=(id,on,lab)=>{$(id).classList.toggle("on",on);$(id).textContent=lab+(on?"켬":"끔")};
setTog("autoBtn",save.auto,"자동 사격: ");setTog("sndBtn",save.snd,"소리: ");
$("autoBtn").onclick=()=>{save.auto=!save.auto;store();setTog("autoBtn",save.auto,"자동 사격: ")};
$("sndBtn").onclick=()=>{save.snd=!save.snd;store();setTog("sndBtn",save.snd,"소리: ");ac();if(master)master.gain.value=save.snd?.9:0};
$("gyroBtn").onclick=()=>toggleGyro(!gyroOn);
$("goBtn").onclick=()=>{if(save.gyro&&!gyroOn)toggleGyro(true);beginGame(1)};
$("contBtn").onclick=()=>beginGame(contW);
$("retryBtn").onclick=()=>{$("dead").hidden=true;P.hull=100;P.shield=100;P.score=G.waveScore;P.crack=0;startWave(G.wave)};
$("againBtn").onclick=()=>beginGame(1);
const toMenu=()=>{clearAll();G.state="title";music(false);["dead","win"].forEach(i=>$(i).hidden=true);$("title").hidden=false;const w=clamp(save.wave||1,1,10);$("contBtn").hidden=w<=1;$("contBtn").textContent="이어하기 · 웨이브 "+w};
$("menuBtn1").onclick=toMenu;$("menuBtn2").onclick=toMenu;
document.addEventListener("visibilitychange",()=>{if(document.hidden){ptr.clear();syncFire();if(AC)AC.suspend()}else if(AC)AC.resume()});
requestAnimationFrame(frame);
window.__space={G,P,enemies:()=>enemies,setYaw:(y,p)=>{yaw=y;pitch=p||0},beginGame,startWave,buildSector,killAll:()=>{for(const e of enemies)killEnemy(e);if(G.boss){for(const t of G.boss.g.userData.turrets)t.alive=false,t.g.visible=false;G.boss.coreHp=0;G.boss.dying=.5}},spawn:(t,d)=>{spawnEnemy(t);const e=enemies[enemies.length-1];e.pos.copy(d);e.vel.set(0,0,0);e.orbit=d.length();return e},explode:(p,s)=>explode(p,s),boss:(f)=>spawnBoss(f),
 aimAt:(pos)=>{const d=pos.clone().normalize();yaw=Math.atan2(-d.x,-d.z);pitch=Math.asin(clamp(d.y,-1,1))},fps:()=>G.fps,setBloom:b=>useBloom=b,renderer,camera,scene};
