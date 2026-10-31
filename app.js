const $=s=>document.querySelector(s),cv=$('#cv'),gl=cv.getContext('webgl',{preserveDrawingBuffer:true});
const cl=o=>JSON.parse(JSON.stringify(o));
const newG=()=>({ex:0,co:0,hl:0,sd:0,fa:0,te:0,ti:0,sa:0,sm:0,sH:210,hH:35,vg:0,gr:0,w:{lf:[0,0,0],gm:[0,0,0],gn:[0,0,0]},cu:{M:[[0,0],[1,1]],R:[[0,0],[1,1]],G:[[0,0],[1,1]],B:[[0,0],[1,1]]}});
const SL={
 Light:[['ex','Exposure',-2,2,.01],['co','Contrast',-1,1,.01],['hl','Highlights',-1,1,.01],['sd','Shadows',-1,1,.01],['fa','Fade',0,1,.01]],
 Color:[['te','Temperature',-1,1,.01],['ti','Tint',-1,1,.01],['sa','Saturation',-1,1,.01]],
 Look:[['sm','Split tone',0,1,.01],['sH','Shadow hue',0,360,1],['hH','Highlight hue',0,360,1],['vg','Vignette',0,1,.01],['gr','Film grain',0,1,.01]]};
const PR={
 'Neutral':{},
 'Teal and orange':{co:.2,sa:.1,te:.1,sm:.5,sH:190,hH:30,hl:-.1,sd:.1,w:{lf:[-.6,0,0],gm:[0,0,0],gn:[.6,.35,0]}},
 'Warm film':{co:.1,fa:.3,te:.3,sa:-.1,sm:.4,sH:25,hH:45,gr:.4,vg:.3},
 'Cold night':{ex:-.2,co:.25,te:-.4,sm:.6,sH:220,hH:200,vg:.5,sd:-.1},
 'Moody':{ex:-.3,co:.35,sa:-.3,fa:.2,sm:.5,sH:200,hH:40,vg:.6,gr:.2},
 'Noir black and white':{sa:-1,co:.4,gr:.5,vg:.5,fa:.1},
 'Vintage':{fa:.5,te:.2,sa:-.2,sm:.5,sH:170,hH:50,gr:.5,vg:.4,co:-.1},
 'Bleach bypass':{sa:-.5,co:.5,hl:.1,sd:-.2,gr:.3}};
const ASP=[['Project: first clip',0],['Cinema 2.39:1',2.39],['16:9',16/9],['1:1',1],['4:5',.8],['9:16',9/16]];
const TB={Media:['Pool'],Cut:['Trim'],Edit:['Clip','Crop','Mask'],Color:['Presets','Wheels','Curves','Light','Color','Look','Mask'],Audio:['Audio'],Deliver:['Export']};
const CC={M:'#e8e6e1',R:'#ff5a5a',G:'#5aff7a',B:'#5a9bff'},CD={i:0,sp:1,vol:1,fi:0,fo:0};

/* ---------- WebGL ---------- */
const VS='attribute vec2 p;uniform vec2 s;varying vec2 q,u;void main(){q=p*.5+.5;u=(q-.5)*s+.5;gl_Position=vec4(p,0.,1.);}';
const FS=`precision mediump float;varying vec2 q,u;uniform sampler2D t,lu;
uniform float ex,co,hl,sd,fa,te,ti,sa,sm,vg,gr,rn,fd;uniform vec3 sc,hc,lf,gm,gn;uniform float mt,mf,mi,mr,ar,mk;uniform vec4 mp;uniform vec2 pv[9];uniform float pn;
float L(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p2=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q2=mix(vec4(p2.xyw,c.r),vec4(c.r,p2.yzx),step(p2.x,c.r));float d=q2.x-min(q2.w,q2.y);return vec3(abs(q2.z+(q2.w-q2.y)/(6.*d+1e-10)),d/(q2.x+1e-10),q2.x);}
void main(){
vec3 o=texture2D(t,u).rgb;vec3 c=pow(o,vec3(2.2));
c*=exp2(ex)*vec3(1.+te*.25,1.,1.-te*.25)*vec3(1.+ti*.1,1.-ti*.15,1.+ti*.1);
c=pow(max(c,0.),vec3(.4545));
c=(c-.5)*(1.+co)+.5;
c=c*(1.+gn)+lf*(1.-c);
c=pow(clamp(c,0.,1.),1./max(1.+gm,vec3(.1)));
float l=clamp(L(c),0.,1.);
c+=sd*.25*(1.-l)*(1.-l)+hl*.25*l*l;
c=c*(1.-fa*.15)+fa*.1;
l=clamp(L(c),0.,1.);
c=mix(vec3(l),c,1.+sa);
c+=(sc-L(sc))*(1.-l)*sm*.4+(hc-L(hc))*l*sm*.4;
c=clamp(c,0.,1.)*.996+.002;
c=vec3(texture2D(lu,vec2(c.r,.5)).r,texture2D(lu,vec2(c.g,.5)).g,texture2D(lu,vec2(c.b,.5)).b);
c*=1.-vg*smoothstep(.35,.95,distance(q,vec2(.5))*1.5);
c+=(fract(sin(dot(q*vec2(1731.,977.)+rn,vec2(12.9898,78.233)))*43758.5453)-.5)*gr*.18;
float a=1.;
if(mk>.5){vec2 p=(q-mp.xy)*vec2(ar,1.);float cr=cos(mr),sr=sin(mr);p=vec2(cr*p.x+sr*p.y,-sr*p.x+cr*p.y);
float d;
if(mt<2.5){d=mt<.5?length(p/mp.zw):mt<1.5?max(abs(p.x)/mp.z,abs(p.y)/mp.w):p.y/mp.w;a=mt>1.5?1.-smoothstep(-mf,mf,d):1.-smoothstep(1.-mf,1.,d);}
else if(mt<3.5){vec2 P=q*vec2(ar,1.);float dm=9.;bool ins=false;
for(int i=0;i<8;i++){if(float(i)>=pn)break;vec2 A=pv[i],B=pv[i+1],e=B-A,w=P-A;dm=min(dm,length(w-e*clamp(dot(w,e)/dot(e,e),0.,1.)));
if((A.y>P.y)!=(B.y>P.y)&&P.x<(B.x-A.x)*(P.y-A.y)/(B.y-A.y)+A.x)ins=!ins;}
d=ins?-dm:dm;a=1.-smoothstep(-mf*.3,mf*.3,d);}
else{vec3 k=hsv(o);float dh=abs(k.x-mp.x);dh=min(dh,1.-dh);d=max(dh/mp.w,max(abs(k.y-mp.y),abs(k.z-mp.z))/mr);a=1.-smoothstep(1.-mf,1.,d);}
if(mi>.5)a=1.-a;}
gl_FragColor=vec4(mix(o,clamp(c,0.,1.),a)*fd,1.);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const prg=gl.createProgram();
gl.attachShader(prg,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prg,sh(gl.FRAGMENT_SHADER,FS));
gl.linkProgram(prg);gl.useProgram(prg);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(prg,'p');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
[0,1].forEach(u=>{gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
 [[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR]].forEach(([a,b])=>gl.texParameteri(gl.TEXTURE_2D,a,b))});
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
const UL={};['t','lu','ex','co','hl','sd','fa','te','ti','sa','sm','vg','gr','rn','fd','s','sc','hc','lf','gm','gn','mk','mt','mf','mi','mr','ar','mp','pv','pn'].forEach(n=>UL[n]=gl.getUniformLocation(prg,n));
gl.uniform1i(UL.t,0);gl.uniform1i(UL.lu,1);
const hue=h=>[0,4,2].map(k=>Math.min(1,Math.max(0,Math.abs(((h/60+k)%6)-3)-1)));
const wv=([x,y,m])=>{const r=Math.min(1,Math.hypot(x,y)),c=hue((Math.atan2(y,x)*180/Math.PI+360)%360),a=(c[0]+c[1]+c[2])/3;return c.map(v=>(v-a)*r*.5+m*.25)};
const TEX=s=>gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,s);
const cl01=v=>Math.min(1,Math.max(0,v));
const fb=[],ft=[],MD={x:.5,y:.5,w:.25,h:.25,r:0,f:.3,kw:.08,kt:.35};
function mkF(){[0,1].forEach(i=>{if(!ft[i]){ft[i]=gl.createTexture();fb[i]=gl.createFramebuffer()}
 gl.activeTexture(gl.TEXTURE2+i);gl.bindTexture(gl.TEXTURE_2D,ft[i]);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,cv.width,cv.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 [[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR]].forEach(([a,b])=>gl.texParameteri(gl.TEXTURE_2D,a,b));
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb[i]);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ft[i],0)});
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0)}

/* curves -> 256 px lookup table */
function crv(p){
 p=p.slice().sort((a,b)=>a[0]-b[0]);const n=p.length,dx=[],m=[],t=[];
 for(let i=0;i<n-1;i++){dx[i]=p[i+1][0]-p[i][0]||1e-6;m[i]=(p[i+1][1]-p[i][1])/dx[i]}
 t[0]=m[0];t[n-1]=m[n-2];for(let i=1;i<n-1;i++)t[i]=m[i-1]*m[i]<=0?0:(m[i-1]+m[i])/2;
 for(let i=0;i<n-1;i++){if(!m[i]){t[i]=t[i+1]=0}else{const a=t[i]/m[i],b=t[i+1]/m[i],s=a*a+b*b;if(s>9){const k=3/Math.sqrt(s);t[i]=k*a*m[i];t[i+1]=k*b*m[i]}}}
 return x=>{if(x<=p[0][0])return p[0][1];if(x>=p[n-1][0])return p[n-1][1];let i=0;while(x>p[i+1][0])i++;
  const h=dx[i],s=(x-p[i][0])/h,s2=s*s,s3=s2*s;
  return(2*s3-3*s2+1)*p[i][1]+(s3-2*s2+s)*h*t[i]+(3*s2-2*s3)*p[i+1][1]+(s3-s2)*h*t[i+1]}}
function lut(g){const f=['M','R','G','B'].map(k=>crv(g.cu[k])),d=new Uint8Array(1024);
 for(let i=0;i<256;i++){const y=cl01(f[0](i/255));for(let c=0;c<3;c++)d[i*4+c]=cl01(f[c+1](y))*255;d[i*4+3]=255}
 gl.activeTexture(gl.TEXTURE1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,d);gl.activeTexture(gl.TEXTURE0)}

/* ---------- audio ---------- */
let ac,dest;const A=()=>{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();dest=ac.createMediaStreamDestination()}return ac};

/* ---------- project state ---------- */
const clips=[],pj={asp:0,fl:0};
let t=0,playing=0,last=0,act=-1,sel=0,dirty=1,fd=1,lv=0,onend=null,pend=0,lastS=0,PX=40,lk='',lastTex=null,cmp=0,ly=-1,pg='Color',tab='Presets',ch='M',sm0=0,ts=0,pool=[],hist=[],hp=-1,bk=null,trk=0,pk=0,pickAt=null,FPS=30,BR=12e6;
const cd=c=>(c.o-c.i)/c.sp,total=()=>clips.reduce((a,c)=>a+cd(c),0),G=()=>{const c=clips[sel];return c.mk[ly]?c.mk[ly].g:c.g},setG=g=>{const c=clips[sel];c.mk[ly]?c.mk[ly].g=g:c.g=g};
const at=T=>{let s=0;for(let k=0;k<clips.length;k++){const d=cd(clips[k]);if(T<s+d||k==clips.length-1)return[k,s];s+=d}return[-1,0]};
const fmt=s=>{s=Math.max(0,s);return(s/60|0)+':'+(s%60).toFixed(1).padStart(4,'0')};
const dsp=m=>{const k=m.tk;if(!k||!k.length)return[0,0];let i=0;while(i<k.length-1&&ts>=k[i+1][0])i++;const a=k[i],b=k[i+1];if(!b||ts<=a[0])return[a[1],a[2]];const f=(ts-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]};
const cs=m=>{const pa=cv.width/cv.height,ca=m.w/m.h;return[(pa>ca?1:pa/ca)*(pj.fl?-1:1),pa>ca?ca/pa:1]};
function setKey(p){const m=clips[sel].mk[ly],r=p[0]/255,g=p[1]/255,b=p[2]/255,mx=Math.max(r,g,b),d=mx-Math.min(r,g,b);
 const h=!d?0:mx==r?((g-b)/d+6)%6:mx==g?(b-r)/d+2:(r-g)/d+4;m.kh=h/6;m.ks=mx?d/mx:0;m.kv=mx;pk=0;lv++;panel();dirty=1}

function fit(){
 const f=clips.find(c=>c.m.w),pa=pj.asp||(f?f.m.w/f.m.h:16/9);let w,h;
 pa>=1?(w=1920,h=1920/pa):(h=1920,w=1920*pa);
 cv.width=Math.round(w/2)*2;cv.height=Math.round(h/2)*2;gl.viewport(0,0,cv.width,cv.height);ov.width=cv.width;ov.height=cv.height;mkF();dirty=1;lastTex=null}

function draw(){
 const c=clips[act];
 if(!c||c.m.k=='a'){gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);return}
 const m=c.m;
 gl.activeTexture(gl.TEXTURE0);
 if(m.k=='v'){if(m.el.readyState>=2)TEX(m.el);lastTex=m}else if(lastTex!=m){TEX(m.el);lastTex=m}
 const pa=cv.width/cv.height,ca=m.w/m.h;let x=1,y=1;pa>ca?y=ca/pa:x=pa/ca;
 const M=cmp?[]:c.mk,n=M.length;
 for(let p=0;p<=n;p++){
  const mk=p?M[p-1]:null,g=cmp?newG():mk?mk.g:c.g,key=cmp+'|'+act+'|'+lv+'|'+p;
  if(key!=lk){lk=key;lut(g)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,p<n?fb[p%2]:null);
  gl.uniform1i(UL.t,p?2+(p-1)%2:0);
  ['ex','co','hl','sd','fa','te','ti','sa','sm','vg','gr'].forEach(k=>gl.uniform1f(UL[k],g[k]));
  gl.uniform1f(UL.rn,playing?(performance.now()%1000)/1000:0);gl.uniform1f(UL.fd,p?1:fd);
  gl.uniform2f(UL.s,p?1:x*(pj.fl?-1:1),p?1:y);
  gl.uniform3fv(UL.sc,hue(g.sH));gl.uniform3fv(UL.hc,hue(g.hH));
  gl.uniform3fv(UL.lf,wv(g.w.lf));gl.uniform3fv(UL.gm,wv(g.w.gm));gl.uniform3fv(UL.gn,wv(g.w.gn));
  gl.uniform1f(UL.mk,mk?1:0);gl.uniform1f(UL.ar,pa);
  if(mk){const d=dsp(mk),cx=mk.x+d[0],cy=mk.y+d[1];gl.uniform1f(UL.mt,mk.t);gl.uniform1f(UL.mf,mk.f);gl.uniform1f(UL.mi,mk.i);
   if(mk.t==4){gl.uniform1f(UL.mr,mk.kt);gl.uniform4f(UL.mp,mk.kh,mk.ks,mk.kv,mk.kw)}else{gl.uniform1f(UL.mr,mk.r);gl.uniform4f(UL.mp,cx,1-cy,mk.w,mk.h)}
   if(mk.t==3){const z=mk.w/MD.w,V=mk.pts.map(o=>[(cx+o[0]*z)*pa,1-(cy+o[1]*z)]),a=new Float32Array(18);V.forEach((v,i)=>{a[i*2]=v[0];a[i*2+1]=v[1]});a[V.length*2]=V[0][0];a[V.length*2+1]=V[0][1];gl.uniform1f(UL.pn,V.length);gl.uniform2fv(UL.pv,a)}}
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  if(pickAt&&p==ly){const px=new Uint8Array(4);gl.readPixels(pickAt[0],pickAt[1],1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);setKey(px);pickAt=null}}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null)}

/* ---------- playback ---------- */
function sync(){
 const[k,s]=at(t);if(k<0){act=-1;return}
 const c=clips[k],m=c.m,off=t-s,tgt=c.i+off*c.sp,old=clips[act],av=m.k!='i';ts=tgt;
 if(k!=act){
  const same=playing&&old&&old.m==m&&old.sp==c.sp&&Math.abs(m.el.currentTime-tgt)<.15;
  if(old&&old.m!=m){if(old.m.k!='i')old.m.el.pause();if(old.m.gain)old.m.gain.gain.value=0}
  act=k;dirty=1;
  if(av&&!same)m.el.currentTime=tgt;
  if(av&&playing&&m.el.paused)m.el.play().catch(()=>{});
 }else if(av&&playing&&Math.abs(m.el.currentTime-tgt)>.3)m.el.currentTime=tgt;
 if(av&&m.el.playbackRate!=c.sp)m.el.playbackRate=c.sp;
 const d=cd(c);fd=Math.min(1,c.fi?off/c.fi:1,c.fo?(d-off)/c.fo:1);
 if(m.gain)m.gain.gain.value=c.vol*fd}
function play(){if(!clips.length)return;A().resume();if(t>=total()-.05)t=0;act=-1;playing=1;last=performance.now();$('#pp').textContent='Pause'}
function pause(){playing=0;const c=clips[act];if(c&&c.m.k!='i')c.m.el.pause();$('#pp').textContent='Play'}
function frame(now){
 const dt=(now-last)/1000;last=now;
 if(playing){t+=dt;const T=total();if(t>=T){t=T;pause();onend&&onend()}}
 if(clips.length)sync();
 if(playing||dirty){dirty=0;draw();ovl();pend=1}
 if(pend&&now-lastS>120){lastS=now;pend=0;scope()}
 const p=$('#ph');if(p)p.style.left=6+t*PX+'px';
 $('#tm').textContent=fmt(t)+' / '+fmt(total());
 requestAnimationFrame(frame)}

/* ---------- scopes ---------- */
const sc=$('#sc'),sx=sc.getContext('2d'),tcv=document.createElement('canvas');tcv.width=160;tcv.height=90;
const tcx=tcv.getContext('2d',{willReadFrequently:true});
function scope(){
 if(!sm0||pg!='Color'||!clips.length)return;
 tcx.drawImage(cv,0,0,160,90);const a=tcx.getImageData(0,0,160,90).data,o=sx.createImageData(240,128),d=o.data;
 for(let i=3;i<d.length;i+=4)d[i]=255;
 for(let i=0;i<a.length;i+=4){const X=(i/4)%160;
  if(sm0==1){const v=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2],j=((127-(v*127/255|0))*240+(X*1.5|0))*4;d[j]+=40;d[j+1]+=55;d[j+2]+=40}
  else for(let c=0;c<3;c++){const j=((127-(a[i+c]*127/255|0))*240+(X/2|0)+c*80)*4;d[j+c]+=70;d[j+(c+1)%3]+=15}}
 sx.putImageData(o,0,0)}
function vis(){sc.style.display=sm0&&pg=='Color'?'block':'none';$('#scb').textContent='Scope: '+['off','waveform','parade'][sm0]}

/* ---------- timeline ---------- */
const TL=$('#tl');let dn=0;
function tl(){
 const w=TL.clientWidth-12,tot=total()||1;PX=Math.min(80,w/tot);let s=0;
 TL.innerHTML=clips.map((c,k)=>{const d=cd(c),h=`<div class="cl ${c.m.k} ${k==sel?'sel':''}" style="left:${6+s*PX}px;width:${Math.max(6,d*PX-2)}px">${c.m.name}</div>`;s+=d;return h}).join('')+'<i id="ph"></i>'}
function scrub(e){
 t=Math.max(0,Math.min(total(),(e.clientX-TL.getBoundingClientRect().left-6)/PX));
 const k=at(t)[0];if(k>=0&&k!=sel){sel=k;ly=-1;tl();panel()}act=-1;dirty=1}
TL.onpointerdown=e=>{dn=1;TL.setPointerCapture(e.pointerId);scrub(e)};
TL.onpointermove=e=>dn&&scrub(e);TL.onpointerup=()=>dn=0;
function chg(){ly=-1;
 lv++;act=-1;t=Math.min(t,total());
 $('#hint').hidden=!!clips.length;cv.style.display=clips.length?'block':'none';
 if(clips.length)fit();tl();panel();dirty=1}

/* ---------- loading ---------- */
const mid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function loadM(f,id){return new Promise((ok,no)=>{
 const k=f.type.startsWith('video')?'v':f.type.startsWith('audio')?'a':'i',u=URL.createObjectURL(f),m={k,name:f.name,id:id||mid()},fin=()=>{pool.push(m);ok(m)};
 if(k=='i'){const im=new Image();im.onerror=no;im.onload=()=>{let s=im,W=im.naturalWidth,H=im.naturalHeight;const r=Math.min(1,4096/Math.max(W,H));
   if(r<1){const c=document.createElement('canvas');c.width=W=Math.round(W*r);c.height=H=Math.round(H*r);c.getContext('2d').drawImage(im,0,0,W,H);s=c}
   m.el=s;m.w=W;m.h=H;m.dur=30;URL.revokeObjectURL(u);fin()};im.src=u}
 else{const e=document.createElement(k=='v'?'video':'audio');e.playsInline=true;e.preload='auto';e.src=u;
  e.onloadedmetadata=()=>{m.el=e;m.dur=e.duration;m.w=e.videoWidth||0;m.h=e.videoHeight||0;
   const a=A();m.gain=a.createGain();a.createMediaElementSource(e).connect(m.gain);m.gain.connect(a.destination);m.gain.connect(dest);
   e.onseeked=()=>dirty=1;fin()};
  e.onerror=no}})}
const addClip=m=>{clips.push({m,i:0,o:m.k=='i'?3:m.dur,sp:1,vol:1,fi:0,fo:0,g:newG(),mk:[]});sel=clips.length-1;chg();snap()};
async function load(f){try{const m=await loadM(f);kv('set','m:'+m.id,f);addClip(m)}catch(e){alert('This file format is not supported: '+f.name)}}

/* ---------- panels ---------- */
const rows=(L,s,o)=>L.map(([k,l,a,b,st])=>`<label class="r">${l}<input type="range" data-s="${s}" data-k="${k}" min="${a}" max="${b}" step="${st}" value="${o[k]}"><output>${(+o[k]).toFixed(st<1?2:0)}</output></label>`).join('');
function tabs(){$('#tabs').innerHTML=TB[pg].map(n=>`<button class="${n==tab?'on':''}" data-t="${n}">${n}</button>`).join('')}
function panel0(){
 const el=$('#pn'),c=clips[sel];
 if(!c&&tab!='Pool'){el.innerHTML='<p class="mu">Tap Add to load photos, videos or audio.</p>';return}
 if(tab=='Presets')el.innerHTML=Object.keys(PR).map(n=>`<button class="chip" data-p="${n}">${n}</button>`).join('')+'<button class="chip" data-e="all">Copy grade to all clips</button>';
 else if(tab=='Wheels'){el.innerHTML='<div class="wl">'+[['lf','Lift'],['gm','Gamma'],['gn','Gain']].map(([k,l])=>`<div><canvas class="wh" data-w="${k}" width="100" height="100"></canvas>${l}<input type="range" data-w="${k}" min="-1" max="1" step=".01" value="${G().w[k][2]}"></div>`).join('')+'</div><p class="mu">Drag the dot to tint. Double-tap a wheel to reset it. The slider below each wheel changes brightness.</p>';el.querySelectorAll('.wh').forEach(w=>dwl(w))}
 else if(tab=='Curves'){el.innerHTML=['M','R','G','B'].map(k=>`<button class="chip ${k==ch?'on':''}" data-c="${k}">${k=='M'?'Master':k}</button>`).join('')+'<canvas id="cc" width="240" height="240"></canvas><p class="mu">Tap to add a point. Double-tap a point to remove it.</p>';dc()}
 else if(tab=='Clip'||tab=='Trim'){
  const R=[['i','Start',0,c.m.dur,.01],['o','End',0,c.m.dur,.01],['sp','Speed',.25,4,.05],['vol','Volume',0,2,.01],['fi','Fade in',0,3,.1],['fo','Fade out',0,3,.1]];
  el.innerHTML=[['split','Split at playhead'],['del','Delete'],['left','Move left'],['right','Move right'],['dup','Duplicate'],['shot','Save frame']].map(([e,l])=>`<button class="chip" data-e="${e}">${l}</button>`).join('')+rows(R,'c',c)}
 else if(tab=='Crop')el.innerHTML=ASP.map((a,i)=>`<button class="chip ${pj.asp==a[1]?'on':''}" data-a="${i}">${a[0]}</button>`).join('')+`<button class="chip ${pj.fl?'on':''}" data-f="1">Flip horizontal</button>`;
 else if(tab=='Pool')el.innerHTML='<button class="chip" data-e="add">+ Add media</button><button class="chip" data-e="clear">Clear saved project</button>'+pool.map(m=>`<p class="mu">${({v:'Video',a:'Audio',i:'Photo'})[m.k]}: ${m.name}</p>`).join('')+'<p class="mu">Your project saves automatically on this device.</p>';
 else if(tab=='Audio')el.innerHTML=rows([['vol','Volume',0,2,.01],['fi','Fade in',0,3,.1],['fo','Fade out',0,3,.1]],'c',c);
 else if(tab=='Export')el.innerHTML=[24,30,60].map(f=>`<button class="chip ${FPS==f?'on':''}" data-fps="${f}">${f} fps</button>`).join('')+'<div>'+[['Low',4e6],['Medium',12e6],['High',25e6]].map(([l,b])=>`<button class="chip ${BR==b?'on':''}" data-br="${b}">${l} quality</button>`).join('')+'</div><button class="chip pri" data-e="exp">Export video</button><button class="chip" data-e="shot">Save frame</button><p class="mu">Export plays your timeline in real time and records it.</p>';
 else if(tab=='Mask'){const M=c.mk;if(ly<0&&M.length)ly=0;const m=M[ly],T0=['Ellipse','Rectangle','Gradient','Pen shape','Color key'];
  let h=T0.map((l,k)=>`<button class="chip" data-mk="${k}">+ ${l}</button>`).join('');
  h+=M.length?'<div>'+M.map((x,i)=>`<button class="chip ${i==ly?'on':''}" data-l="${i}">${T0[x.t]} ${i+1}</button>`).join('')+'</div>':'<p class="mu">Add a shape or a color key. Then open the Color tabs and pick that mask to grade only there.</p>';
  if(m){h+=`<button class="chip" data-e="minv">${m.i?'Grading outside':'Grading inside'}: tap to swap</button><button class="chip" data-e="mdel">Delete mask</button>`;
   if(m.t==4)h+=`<button class="chip ${pk?'on':''}" data-e="pick">${pk?'Now tap the video':'Pick color from video'}</button>`+rows([['kw','Hue range',.01,.5,.01],['kt','Sat / light range',.05,1,.01],['f','Softness',.01,1,.01]],'m',m);
   else{h+=m.t==3?'<button class="chip" data-e="padd">Add point</button><button class="chip" data-e="pdel">Remove point</button>'+rows([['w','Size',.05,1.5,.01],['f','Softness',.01,1,.01]],'m',m)
    :rows([['x','Left / right',0,1,.01],['y','Up / down',0,1,.01],['w','Width',.02,1.5,.01],['h','Height',.02,1.5,.01],['r','Rotate',-3.14,3.14,.01],['f','Softness',.01,1,.01]],'m',m);
    if(c.m.k=='v')h+=`<button class="chip pri" id="trkb" data-e="track">${trk?'Stop tracking':'Track forward'}</button>${m.tk&&m.tk.length?'<button class="chip" data-e="untrack">Clear tracking</button>':''}<p class="mu">Put the shape on the object, then tap Track. It follows the object to the end of the clip.</p>`}}
  el.innerHTML=h}
 else el.innerHTML=rows(SL[tab],'g',G())}
const lyr=c=>'<div>'+['Whole clip',...c.mk.map((_,i)=>'Mask '+(i+1))].map((n,i)=>`<button class="chip ${i-1==ly?'on':''}" data-l="${i-1}">${n}</button>`).join('')+'</div>';
function panel(){panel0();const c=clips[sel];if(c&&pg=='Color'&&tab!='Mask')$('#pn').insertAdjacentHTML('afterbegin',lyr(c))}

function dwl(c){
 const x=c.getContext('2d'),n=c.width,h=n/2,w=G().w[c.dataset.w];x.clearRect(0,0,n,n);
 if(x.createConicGradient){const g=x.createConicGradient(0,h,h);for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsl(${i*60},70%,45%)`);x.fillStyle=g}else x.fillStyle='#666';
 x.beginPath();x.arc(h,h,h-3,0,7);x.fill();
 const r=x.createRadialGradient(h,h,0,h,h,h);r.addColorStop(0,'#17191c');r.addColorStop(1,'rgba(23,25,28,0)');x.fillStyle=r;x.fill();
 x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(h+w[0]*(h-8),h+w[1]*(h-8),6,0,7);x.stroke()}
function dc(){
 const c=$('#cc'),x=c.getContext('2d'),n=c.width,p=G().cu[ch],f=crv(p);x.clearRect(0,0,n,n);
 x.strokeStyle='#2a2d32';x.lineWidth=1;x.beginPath();for(let i=1;i<4;i++){x.moveTo(i*n/4,0);x.lineTo(i*n/4,n);x.moveTo(0,i*n/4);x.lineTo(n,i*n/4)}x.stroke();
 x.strokeStyle=x.fillStyle=CC[ch];x.lineWidth=2;x.beginPath();
 for(let i=0;i<=n;i++){const y=(1-cl01(f(i/n)))*n;i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke();
 p.forEach(([a,b])=>{x.beginPath();x.arc(a*n,(1-b)*n,6,0,7);x.fill()})}
const pt=e=>{const r=e.target.getBoundingClientRect();return[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]};
let dr=-1,wd=null;
function cm(e){
 if(dr<0)return;const p=G().cu[ch],last=p.length-1;let[x,y]=pt(e);y=cl01(y);
 x=dr==0?0:dr==last?1:Math.min(Math.max(x,p[dr-1][0]+.02),p[dr+1][0]-.02);
 p[dr]=[x,y];lv++;dirty=1;dc()}
function we(e){
 const r=e.target.getBoundingClientRect();let x=(e.clientX-r.left)/r.width*2-1,y=(e.clientY-r.top)/r.height*2-1;const l=Math.hypot(x,y);
 if(l>1){x/=l;y/=l}const w=G().w[e.target.dataset.w];w[0]=x;w[1]=y;dwl(e.target);dirty=1}
const P=$('#pn');
P.onpointerdown=e=>{
 if(e.target.id=='cc'){const[x,y]=pt(e),p=G().cu[ch];dr=p.findIndex(q=>Math.hypot(q[0]-x,q[1]-y)<.06);
  if(dr<0){p.push([x,cl01(y)]);p.sort((a,b)=>a[0]-b[0]);dr=p.findIndex(q=>q[0]==x)}e.target.setPointerCapture(e.pointerId);cm(e)}
 else if(e.target.classList.contains('wh')){wd=1;e.target.setPointerCapture(e.pointerId);we(e)}};
P.onpointermove=e=>{if(dr>=0)cm(e);else if(wd)we(e)};
P.onpointerup=()=>{dr=-1;wd=null};
P.ondblclick=e=>{
 const d=e.target.dataset,c=clips[sel];
 if(e.target.id=='cc'){const[x,y]=pt(e),p=G().cu[ch],i=p.findIndex(q=>Math.hypot(q[0]-x,q[1]-y)<.06);if(i>0&&i<p.length-1){p.splice(i,1);lv++;dirty=1;dc()}}
 else if(e.target.classList.contains('wh')){G().w[d.w]=[0,0,0];dwl(e.target);dirty=1}
 else if(d.k&&c){if(d.s=='c'){c[d.k]=d.k=='o'?(c.m.k=='i'?3:c.m.dur):CD[d.k];act=-1;tl()}else if(d.s=='m')c.mk[ly][d.k]=MD[d.k];else G()[d.k]=newG()[d.k];panel();dirty=1}};
P.oninput=e=>{
 const d=e.target.dataset,c=clips[sel];if(!c)return;
 if(d.w){G().w[d.w][2]=+e.target.value;dirty=1;return}
 const o=d.s=='c'?c:d.s=='m'?c.mk[ly]:G();o[d.k]=+e.target.value;
 if(d.s=='c'){if(d.k=='i')c.i=Math.min(c.i,c.o-.1);if(d.k=='o')c.o=Math.max(c.o,c.i+.1);e.target.value=c[d.k];act=-1;t=Math.min(t,total());tl()}
 e.target.nextElementSibling.textContent=(+o[d.k]).toFixed(e.target.step<1?2:0);dirty=1};
P.onclick=e=>{
 const d=e.target.dataset,c=clips[sel];
 if(d.p){setG(Object.assign(newG(),cl(PR[d.p])));lv++}
 else if(d.c){ch=d.c;panel();return}
 else if(d.fps){FPS=+d.fps;panel();return}
 else if(d.br){BR=+d.br;panel();return}
 else if(d.l!==undefined){ly=+d.l;panel();dirty=1;return}
 else if(d.mk!==undefined){if(c.mk.length<3){c.mk.push({t:+d.mk,...cl(MD),i:0,g:newG(),tk:[],kh:0,ks:.5,kv:.5,pts:[0,1,2,3,4].map(k=>[Math.sin(k*1.2566)*.15,-Math.cos(k*1.2566)*.15])});ly=c.mk.length-1;lv++;panel();dirty=1}return}
 else if(d.a!==undefined){pj.asp=ASP[d.a][1];panel();fit();return}
 else if(d.f){pj.fl^=1;panel()}
 else if(d.e){edit(d.e);return}
 else return;
 dirty=1};
function edit(a){
 const c=clips[sel],cp=x=>({...x,g:cl(x.g),mk:cl(x.mk)});
 if(a=='all'){clips.forEach(x=>x.g=cl(c.g));lv++;dirty=1;return}
 if(a=='shot'){shot();return}
 if(a=='exp'){doExport();return}
 if(a=='add'){$('#file').click();return}
 if(a=='clear'){if(confirm('Delete the saved project and media from this device?'))kv('clear').then(()=>location.reload());return}
 if(a=='track'){track();return}
 if(a=='untrack'){c.mk[ly].tk=[];dirty=1;panel();return}
 if(a=='padd'){const p=c.mk[ly].pts;if(p.length<8){const u=p[p.length-1],v=p[0];p.push([(u[0]+v[0])/2,(u[1]+v[1])/2])}dirty=1;return}
 if(a=='pdel'){const p=c.mk[ly].pts;if(p.length>3)p.pop();dirty=1;return}
 if(a=='pick'){pk=1;panel();return}
 if(a=='minv'){c.mk[ly].i^=1;panel();dirty=1;return}
 if(a=='mdel'){c.mk.splice(ly,1);ly=-1;lv++;panel();dirty=1;return}
 if(a=='split'){const[k,s]=at(t),x=clips[k],off=t-s;if(off<.1||cd(x)-off<.1)return;
  const n=cp(x);n.i=x.i+off*x.sp;x.o=n.i;n.fi=0;n.fo=x.fo;x.fo=0;clips.splice(k+1,0,n);sel=k}
 else if(a=='del'){clips.splice(sel,1);sel=Math.max(0,Math.min(sel,clips.length-1))}
 else if(a=='dup'){clips.splice(sel+1,0,cp(c));sel++}
 else{const j=a=='left'?sel-1:sel+1;if(j<0||j>=clips.length)return;[clips[sel],clips[j]]=[clips[j],clips[sel]];sel=j}
 chg()}

/* ---------- top bar ---------- */
$('#tabs').onclick=e=>{const n=e.target.dataset.t;if(n){tab=n;tabs();panel();dirty=1}};
$('#pg').onclick=e=>{const g=e.target.dataset.g;if(!g)return;pg=g;tab=TB[g][0];
 $('#pg').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.g==g));$('#rst').style.display=g=='Color'?'':'none';tabs();panel();vis();dirty=1;pend=1};
$('#open').onclick=()=>$('#file').click();
$('#file').onchange=e=>{[...e.target.files].forEach(load);e.target.value=''};
$('#pp').onclick=()=>playing?pause():play();
$('#scb').onclick=()=>{sm0=(sm0+1)%3;vis();dirty=1;pend=1};
$('#rst').onclick=()=>{if(!clips.length)return;const b=$('#rst');
 if(bk){const c=clips[bk.s];if(c){bk.l>=0&&c.mk[bk.l]?c.mk[bk.l].g=bk.g:c.g=bk.g}bk=null;b.textContent='Reset grade'}
 else{bk={g:cl(G()),s:sel,l:ly};setG(newG());b.textContent='Restore grade'}
 lv++;panel();dirty=1};
const cb=$('#cmp');
cb.onpointerdown=e=>{e.preventDefault();cmp=1;dirty=1};
['pointerup','pointerleave','pointercancel'].forEach(n=>cb.addEventListener(n,()=>{if(cmp){cmp=0;dirty=1}}));
cb.oncontextmenu=e=>e.preventDefault();

/* ---------- export ---------- */
const save=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
function shot(){if(!clips.length)return;cmp=0;draw();cv.toBlob(b=>save(b,'frame.jpg'),'image/jpeg',.95)}
function doExport(){
 if(!clips.length)return;cmp=0;
 if(clips.length==1&&clips[0].m.k=='i'){act=0;shot();return}
 if(!window.MediaRecorder){alert('Video export is not supported in this browser. Try Chrome.');return}
 A();const st=cv.captureStream(FPS);dest.stream.getAudioTracks().forEach(x=>st.addTrack(x));
 const mt=['video/mp4','video/webm;codecs=vp9','video/webm'].find(x=>MediaRecorder.isTypeSupported(x)),
  rc=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:BR}),ch2=[],b={};
 rc.ondataavailable=e=>ch2.push(e.data);
 rc.onstop=()=>{save(new Blob(ch2,{type:mt}),'graded.'+(mt.includes('mp4')?'mp4':'webm'));b.textContent='Export'};
 b.textContent='Recording…';t=0;play();rc.start();onend=()=>{rc.stop();onend=null}}

/* ---------- mask overlay ---------- */
const ov=$('#ov'),ox=ov.getContext('2d');let od=0,vi=-1;
const eff=m=>{const d=dsp(m);return[m.x+d[0],m.y+d[1]]};
function ovl(){
 ox.clearRect(0,0,ov.width,ov.height);const c=clips[sel],m=c&&tab=='Mask'&&c.mk[ly];
 ov.style.pointerEvents=m?'auto':'none';if(!m||m.t==4)return;
 const W=ov.width,H=ov.height,[cx,cy]=eff(m),z=m.w/MD.w;ox.save();ox.strokeStyle=ox.fillStyle='#e0a458';ox.lineWidth=Math.max(2,H/300);ox.beginPath();
 if(m.t==3){m.pts.forEach(([a,b],i)=>{const X=(cx+a*z)*W,Y=(cy+b*z)*H;i?ox.lineTo(X,Y):ox.moveTo(X,Y)});ox.closePath();ox.stroke();m.pts.forEach(([a,b])=>{ox.beginPath();ox.arc((cx+a*z)*W,(cy+b*z)*H,H/60,0,7);ox.fill()})}
 else{ox.translate(cx*W,cy*H);ox.rotate(-m.r);
  if(m.t==0)ox.ellipse(0,0,m.w*H,m.h*H,0,0,7);else if(m.t==1)ox.rect(-m.w*H,-m.h*H,2*m.w*H,2*m.h*H);else{ox.moveTo(-W,0);ox.lineTo(W,0)}
  ox.stroke();ox.beginPath();ox.arc(m.w*H,0,H/45,0,7);ox.fill()}
 ox.restore()}
const oc=e=>{const r=ov.getBoundingClientRect(),s=Math.min(r.width/ov.width,r.height/ov.height),dw=ov.width*s,dh=ov.height*s;return[(e.clientX-r.left-(r.width-dw)/2)/dw,(e.clientY-r.top-(r.height-dh)/2)/dh]};
const lx=(m,x,y)=>{const[cx,cy]=eff(m),th=-m.r,dx=(x-cx)*ov.width,dy=(y-cy)*ov.height;return[dx*Math.cos(th)+dy*Math.sin(th),-dx*Math.sin(th)+dy*Math.cos(th)]};
ov.onpointerdown=e=>{const m=clips[sel].mk[ly],[x,y]=oc(e);
 if(m.t==4){if(pk){pickAt=[Math.round(x*cv.width),Math.round((1-y)*cv.height)];dirty=1}return}
 ov.setPointerCapture(e.pointerId);
 if(m.t==3){const[cx,cy]=eff(m),z=m.w/MD.w;vi=m.pts.findIndex(([a,b])=>Math.hypot((cx+a*z-x)*ov.width,(cy+b*z-y)*ov.height)<ov.height/15);od=vi>=0?3:1;return}
 const[a,b]=lx(m,x,y);od=Math.hypot(a-m.w*ov.height,b)<ov.height/12?2:1};
ov.onpointermove=e=>{if(!od)return;const m=clips[sel].mk[ly],[x,y]=oc(e),d=dsp(m);
 if(od==1){m.x=cl01(x-d[0]);m.y=cl01(y-d[1])}
 else if(od==3){const z=m.w/MD.w;m.pts[vi]=[(x-m.x-d[0])/z,(y-m.y-d[1])/z]}
 else{const nw=Math.max(.02,Math.min(1.5,lx(m,x,y)[0]/ov.height));m.h=Math.max(.02,m.h*nw/m.w);m.w=nw}
 dirty=1};
ov.onpointerup=()=>{od=0;panel()};

/* ---------- object tracking (follows a shape through the video) ---------- */
async function track(){
 if(trk){trk=0;return}
 const c=clips[sel],m=c&&c.mk[ly];
 if(!m||m.t>3||c.m.k!='v'){alert('Tracking works on shape masks over a video clip.');return}
 pause();trk=1;panel();
 const v=c.m.el,cw=160,H3=Math.round(cw*c.m.h/c.m.w),cx=document.createElement('canvas');cx.width=cw;cx.height=H3;
 const x2=cx.getContext('2d',{willReadFrequently:true}),[sx,sy]=cs(c.m),t0=ts,seek=T=>new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=T});
 const gray=()=>{x2.drawImage(v,0,0,cw,H3);const d=x2.getImageData(0,0,cw,H3).data,g=new Uint8Array(cw*H3);for(let i=0;i<g.length;i++)g[i]=(d[i*4]*3+d[i*4+1]*6+d[i*4+2])/10;return g};
 const e0=eff(m);m.x=e0[0];m.y=e0[1];m.tk=[];
 const hs=m.t==3?14:Math.max(6,Math.min(26,Math.round(Math.min(m.w,m.h)*H3*sy*.8))),sr=12,p0x=(m.x-.5)*sx+.5,p0y=(m.y-.5)*sy+.5;
 let xi=Math.round(p0x*cw),yi=Math.round(p0y*H3),T=t0;
 await seek(t0);let prev=gray();const tk=[[t0,0,0]];
 while(trk&&T<c.o-.05){
  T=Math.min(c.o,T+1/15);await seek(T);const cur=gray();
  xi=Math.min(cw-hs-2,Math.max(hs+1,xi));yi=Math.min(H3-hs-2,Math.max(hs+1,yi));
  let best=1e12,bx=xi,by=yi;
  for(let dy=-sr;dy<=sr;dy++)for(let dx=-sr;dx<=sr;dx++){const X=xi+dx,Y=yi+dy;if(X<hs||Y<hs||X+hs>=cw||Y+hs>=H3)continue;let s=0;
   for(let j=-hs;j<=hs;j+=2)for(let i=-hs;i<=hs;i+=2)s+=Math.abs(prev[(yi+j)*cw+xi+i]-cur[(Y+j)*cw+X+i]);
   if(s<best){best=s;bx=X;by=Y}}
  xi=bx;yi=by;prev=cur;tk.push([T,(xi/cw-p0x)/sx,(yi/H3-p0y)/sy]);
  const b=$('#trkb');if(b)b.textContent='Stop tracking '+Math.round((T-t0)/Math.max(.1,c.o-t0)*100)+'%'}
 m.tk=tk;trk=0;await seek(t0);act=-1;lv++;dirty=1;panel()}

/* ---------- auto save, undo, restore ---------- */
const DBP=new Promise(r=>{try{const q=indexedDB.open('grade',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}});
async function kv(op,k,v){const db=await DBP;if(!db)return;return new Promise(r=>{const s=db.transaction('kv',op=='get'?'readonly':'readwrite').objectStore('kv'),q=op=='get'?s.get(k):op=='set'?s.put(v,k):s.clear();q.onsuccess=()=>r(q.result);q.onerror=()=>r()})}
const ser=()=>JSON.stringify({pj,sel,pool:pool.map(m=>m.id),clips:clips.map(c=>({mid:c.m.id,i:c.i,o:c.o,sp:c.sp,vol:c.vol,fi:c.fi,fo:c.fo,g:c.g,mk:c.mk}))});
function apply(s){const d=JSON.parse(s);Object.assign(pj,d.pj);clips.length=0;d.clips.forEach(c=>{const m=pool.find(x=>x.id==c.mid);if(m)clips.push({...c,m})});sel=Math.max(0,Math.min(d.sel,clips.length-1));chg()}
function snap(){const s=ser();if(s==hist[hp])return;hist.length=hp+1;hist.push(s);if(hist.length>60)hist.shift();hp=hist.length-1;kv('set','proj',s)}
let sT=0;['pointerup','keyup','change','dblclick'].forEach(n=>addEventListener(n,()=>{clearTimeout(sT);sT=setTimeout(snap,400)},true));
$('#undo').onclick=()=>{if(hp>0){hp--;apply(hist[hp]);kv('set','proj',hist[hp])}};
$('#redo').onclick=()=>{if(hp<hist.length-1){hp++;apply(hist[hp]);kv('set','proj',hist[hp])}};
(async()=>{try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
 const s=await kv('get','proj');
 if(s){const d=JSON.parse(s);for(const id of d.pool){const f=await kv('get','m:'+id);if(f)try{await loadM(f,id)}catch(e){}}apply(s)}
}catch(e){}hist=[ser()];hp=0})();
addEventListener('resize',tl);
tabs();panel();vis();requestAnimationFrame(frame);
