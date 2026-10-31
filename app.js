const $=s=>document.querySelector(s),cv=$('#cv');
const gl=cv.getContext('webgl',{preserveDrawingBuffer:true});
if(!gl)$('#hint').textContent='WebGL is not supported in this browser. Try Chrome or Safari.';

/* ---------- settings ---------- */
const D={ex:0,co:0,hl:0,sd:0,fa:0,te:0,ti:0,sa:0,sm:0,sH:210,hH:35,vg:0,gr:0,asp:0,fl:0};
let P={...D};
const G={
  Light:[['ex','Exposure',-2,2,.01],['co','Contrast',-1,1,.01],['hl','Highlights',-1,1,.01],['sd','Shadows',-1,1,.01],['fa','Fade',0,1,.01]],
  Color:[['te','Temperature',-1,1,.01],['ti','Tint',-1,1,.01],['sa','Saturation',-1,1,.01]],
  Look:[['sm','Split tone',0,1,.01],['sH','Shadow hue',0,360,1],['hH','Highlight hue',0,360,1],['vg','Vignette',0,1,.01],['gr','Film grain',0,1,.01]]
};
const PR={
  'Neutral':{},
  'Teal and orange':{co:.2,sa:.1,te:.15,sm:.7,sH:190,hH:30,hl:-.1,sd:.1},
  'Warm film':{co:.1,fa:.3,te:.3,sa:-.1,sm:.4,sH:25,hH:45,gr:.4,vg:.3},
  'Cold night':{ex:-.2,co:.25,te:-.4,sm:.6,sH:220,hH:200,vg:.5,sd:-.1},
  'Moody':{ex:-.3,co:.35,sa:-.3,fa:.2,sm:.5,sH:200,hH:40,vg:.6,gr:.2},
  'Noir black and white':{sa:-1,co:.4,gr:.5,vg:.5,fa:.1},
  'Vintage':{fa:.5,te:.2,sa:-.2,sm:.5,sH:170,hH:50,gr:.5,vg:.4,co:-.1},
  'Bleach bypass':{sa:-.5,co:.5,hl:.1,sd:-.2,gr:.3}
};
const ASP=[['Original',0],['Cinema 2.39:1',2.39],['16:9',16/9],['1:1',1],['4:5',.8],['9:16',9/16]];

/* ---------- WebGL ---------- */
const VS='attribute vec2 p;uniform vec2 s;varying vec2 q,u;void main(){q=p*.5+.5;u=(q-.5)*s+.5;gl_Position=vec4(p,0.,1.);}';
const FS=`precision mediump float;varying vec2 q,u;uniform sampler2D t;
uniform float ex,co,hl,sd,fa,te,ti,sa,sm,vg,gr,rn;uniform vec3 sc,hc;
float L(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
void main(){
vec3 c=pow(texture2D(t,u).rgb,vec3(2.2));
c*=exp2(ex)*vec3(1.+te*.25,1.,1.-te*.25)*vec3(1.+ti*.1,1.-ti*.15,1.+ti*.1);
c=pow(max(c,0.),vec3(.4545));
c=(c-.5)*(1.+co)+.5;
float l=clamp(L(c),0.,1.);
c+=sd*.25*(1.-l)*(1.-l)+hl*.25*l*l;
c=c*(1.-fa*.15)+fa*.1;
l=clamp(L(c),0.,1.);
c=mix(vec3(l),c,1.+sa);
c+=(sc-L(sc))*(1.-l)*sm*.4+(hc-L(hc))*l*sm*.4;
c*=1.-vg*smoothstep(.35,.95,distance(q,vec2(.5))*1.5);
c+=(fract(sin(dot(q*vec2(1731.,977.)+rn,vec2(12.9898,78.233)))*43758.5453)-.5)*gr*.18;
gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pg=gl.createProgram();
gl.attachShader(pg,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,FS));
gl.linkProgram(pg);gl.useProgram(pg);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
[[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR]].forEach(([a,b])=>gl.texParameteri(gl.TEXTURE_2D,a,b));
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
const UL={};['ex','co','hl','sd','fa','te','ti','sa','sm','vg','gr','rn','s','sc','hc'].forEach(n=>UL[n]=gl.getUniformLocation(pg,n));
const hue=h=>[0,4,2].map(k=>Math.min(1,Math.max(0,Math.abs(((h/60+k)%6)-3)-1)));
const TEX=(s)=>gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,s);

/* ---------- media ---------- */
let src=null,vid=null,W=0,H=0,S=[1,1],cmp=0,q=0,lp=0;

function fit(){
  if(!src)return;
  const sa=W/H,ar=P.asp||sa;let x=1,y=1;
  ar>sa?y=sa/ar:x=ar/sa;
  S=[x*(P.fl?-1:1),y];
  const k=Math.min(1,2560/Math.max(x*W,y*H));
  cv.width=Math.round(x*W*k);cv.height=Math.round(y*H*k);
  gl.viewport(0,0,cv.width,cv.height);
}
function draw(){
  if(!src)return;
  if(vid&&vid.readyState>=2)TEX(vid);
  const Q=cmp?D:P;
  ['ex','co','hl','sd','fa','te','ti','sa','sm','vg','gr'].forEach(k=>gl.uniform1f(UL[k],Q[k]));
  gl.uniform1f(UL.rn,vid?(performance.now()%1000)/1000:0);
  gl.uniform2f(UL.s,S[0],S[1]);
  gl.uniform3fv(UL.sc,hue(Q.sH));gl.uniform3fv(UL.hc,hue(Q.hH));
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
const req=()=>{if(!q&&!vid)q=requestAnimationFrame(()=>{q=0;draw()})};
function tick(){draw();vid?requestAnimationFrame(tick):lp=0}

function load(f){
  if(vid){vid.pause();URL.revokeObjectURL(vid.src)}
  vid=null;src=null;
  const u=URL.createObjectURL(f);
  if(f.type.startsWith('video')){
    const v=document.createElement('video');
    v.playsInline=true;v.loop=true;v.src=u;
    v.onloadedmetadata=()=>{vid=src=v;W=v.videoWidth;H=v.videoHeight;ready()};
    v.ontimeupdate=()=>{$('#sk').value=v.currentTime/v.duration*1000||0};
    v.onplay=()=>$('#pp').textContent='Pause';
    v.onpause=()=>$('#pp').textContent='Play';
    v.onerror=()=>$('#hint').textContent='This video format is not supported. Try MP4.';
  }else{
    const im=new Image();
    im.onload=()=>{
      let s=im;W=im.naturalWidth;H=im.naturalHeight;
      const k=Math.min(1,4096/Math.max(W,H));
      if(k<1){const c=document.createElement('canvas');c.width=W=Math.round(W*k);c.height=H=Math.round(H*k);c.getContext('2d').drawImage(im,0,0,W,H);s=c}
      TEX(s);src=s;URL.revokeObjectURL(u);ready();
    };
    im.src=u;
  }
}
function ready(){
  $('#hint').hidden=true;cv.style.display='block';$('#vb').hidden=!vid;
  fit();
  if(vid){if(!lp){lp=1;tick()}}else req();
}

/* ---------- UI ---------- */
const T=['Presets','Light','Color','Look','Crop'];let tab='Presets';
function tabs(){$('#tabs').innerHTML=T.map(t=>`<button class="${t==tab?'on':''}" data-t="${t}">${t}</button>`).join('')}
function panel(){
  const el=$('#pn');
  if(tab=='Presets')el.innerHTML=Object.keys(PR).map(n=>`<button class="chip" data-p="${n}">${n}</button>`).join('');
  else if(tab=='Crop')el.innerHTML=ASP.map((a,i)=>`<button class="chip ${P.asp==a[1]?'on':''}" data-a="${i}">${a[0]}</button>`).join('')+`<button class="chip ${P.fl?'on':''}" data-f="1">Flip horizontal</button>`;
  else el.innerHTML=G[tab].map(([k,l,mn,mx,st])=>`<label class="r">${l}<input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${P[k]}"><output>${(+P[k]).toFixed(st<1?2:0)}</output></label>`).join('');
}
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(t){tab=t;tabs();panel()}};
$('#pn').oninput=e=>{const k=e.target.dataset.k;if(!k)return;P[k]=+e.target.value;e.target.nextElementSibling.textContent=(+P[k]).toFixed(e.target.step<1?2:0);req()};
$('#pn').ondblclick=e=>{const k=e.target.dataset.k;if(!k)return;P[k]=D[k];panel();req()};
$('#pn').onclick=e=>{
  const d=e.target.dataset;
  if(d.p){P={...D,...PR[d.p],asp:P.asp,fl:P.fl}}
  else if(d.a!==undefined){P.asp=ASP[d.a][1];panel()}
  else if(d.f){P.fl=P.fl?0:1;panel()}
  else return;
  fit();req();
};
$('#open').onclick=()=>$('#file').click();
$('#file').onchange=e=>{const f=e.target.files[0];if(f)load(f);e.target.value=''};
$('#rst').onclick=()=>{P={...D};panel();fit();req()};
const cm=$('#cmp');
cm.onpointerdown=e=>{e.preventDefault();cmp=1;req()};
['pointerup','pointerleave','pointercancel'].forEach(n=>cm.addEventListener(n,()=>{if(cmp){cmp=0;req()}}));
cm.oncontextmenu=e=>e.preventDefault();
$('#pp').onclick=()=>{if(vid)vid.paused?vid.play():vid.pause()};
$('#sk').oninput=e=>{if(vid)vid.currentTime=e.target.value/1000*vid.duration};

/* ---------- export ---------- */
const save=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
$('#exp').onclick=async()=>{
  if(!src)return;
  cmp=0;
  if(!vid){draw();cv.toBlob(b=>save(b,'graded.jpg'),'image/jpeg',.95);return}
  if(!window.MediaRecorder){alert('Video export is not supported in this browser. Try Chrome.');return}
  const st=cv.captureStream(30);
  try{vid.captureStream().getAudioTracks().forEach(t=>st.addTrack(t))}catch(e){}
  const mt=['video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  const rc=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:12e6}),ch=[],btn=$('#exp');
  rc.ondataavailable=e=>ch.push(e.data);
  rc.onstop=()=>{save(new Blob(ch,{type:mt}),'graded.'+(mt.includes('mp4')?'mp4':'webm'));btn.textContent='Export';vid.loop=true};
  btn.textContent='Recording…';
  vid.loop=false;vid.currentTime=0;await vid.play();rc.start();
  vid.onended=()=>{rc.stop();vid.onended=null};
};

tabs();panel();
