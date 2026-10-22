const NS='http://www.w3.org/2000/svg';
const lerp=(t,x)=>{if(x<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(x<=t[i][0]){const[a,b]=t[i-1],[c,d]=t[i];return b+(d-b)*(x-a)/(c-a)}return t[t.length-1][1]};
const HY=[[110,74],[124,98],[218,134],[226,144],[250,158],[360,150]];
const HX=[[104,38],[112,68],[140,120],[200,150],[260,158],[740,158],[820,146],[864,120],[878,64]];
const XN=[[230,130],[238,122],[252,116],[270,110],[294,108],[318,110],[334,124],[350,132]];
const XT=[[114,752],[132,756],[196,836],[232,864],[268,872],[322,866],[340,850]];
const hw=(x,y)=>Math.min(lerp(HY,y),lerp(HX,x));
const cx=490, cy=236, D=2000;

const ANG={fl:0,fr:0,rl:0,rr:0,tail:0}, TGT={fl:0,fr:0,rl:0,rr:0,tail:0};
const MAX={fl:.95,fr:.95,rl:.85,rr:.85,tail:1.0};

// --- amostragem das artes 2D em polilinhas ---
const tmp=document.createElementNS(NS,'svg');document.body.appendChild(tmp);tmp.setAttribute('width',0);tmp.setAttribute('height',0);
function polys(d){const out=[];for(const sub of d.split(/(?=M)/)){if(!sub.trim())continue;const p=document.createElementNS(NS,'path');p.setAttribute('d',sub);tmp.appendChild(p);
 const L=p.getTotalLength(),n=Math.max(2,Math.ceil(L/4)),a=[];for(let i=0;i<=n;i++){const q=p.getPointAtLength(L*i/n);a.push([q.x,q.y])}p.remove();out.push(a)}return out}
function dOf(el){const T=el.tagName;
 if(T==='path')return el.getAttribute('d');
 if(T==='rect'){const x=+el.getAttribute('x'),y=+el.getAttribute('y'),w=+el.getAttribute('width'),h=+el.getAttribute('height');return `M${x} ${y} H${x+w} V${y+h} H${x} Z`}
 if(T==='ellipse'){const x=+el.getAttribute('cx'),y=+el.getAttribute('cy'),a=+el.getAttribute('rx'),b=+el.getAttribute('ry');return `M${x-a} ${y} A${a} ${b} 0 1 0 ${x+a} ${y} A${a} ${b} 0 1 0 ${x-a} ${y}`}
 if(T==='circle'){const x=+el.getAttribute('cx')||0,y=+el.getAttribute('cy')||0,r=+el.getAttribute('r');return `M${x-r} ${y} A${r} ${r} 0 1 0 ${x+r} ${y} A${r} ${r} 0 1 0 ${x-r} ${y}`}}

const model=[];// {cls, pts:[[X,Y,Z]...]}
const src=document.querySelector('#src > g');
let bodyPts=null;
for(const el of src.children){
 if(el.tagName==='use')continue;
 const cls=el.getAttribute('class')||'t';
 for(const poly of polys(dOf(el))){

  if(el===src.children[0]&&!bodyPts){bodyPts=poly;
   for(const sgn of [1,-1])model.push({cls,face:sgn,pts:poly.map(([x,y])=>[x,y,sgn*hw(x,y)])});
   continue;}
  // divide a linha nos trechos de cada porta, para o traço sumir junto com ela
  const reg=([x,y])=> (y<334 && x>352 && x<584)?'f' : (y<334 && x>=584 && x<748)?'r' : '';
  let run=[poly[0]],cur=reg(poly[0]);const runs=[];
  for(let i=1;i<poly.length;i++){const r=reg(poly[i]);
   if(r===cur){run.push(poly[i])}else{run.push(poly[i]);runs.push([cur,run]);run=[poly[i]];cur=r}}
  runs.push([cur,run]);
  for(const [r,pts] of runs){if(pts.length<2)continue;
   for(const sgn of [1,-1]){const keys=r==='f'?[sgn>0?'fl':'fr']:r==='r'?[sgn>0?'rl':'rr']:null;
    model.push({cls,face:sgn,hide:keys,pts:pts.map(([x,y])=>[x,y,sgn*hw(x,y)])});}}
 }
}
// faces dianteira e traseira
const FACE_F='M-154 232 H154 L148 336 Q148 342 138 342 L-138 342 Q-148 342 -148 336 Z|s;M-150 236 L-64 244 L-56 258 L-140 266 Q-152 256 -150 236 Z|s;M150 236 L64 244 L56 258 L140 266 Q152 256 150 236 Z|s;M-142 252 L-66 254|o;M142 252 L66 254|o;M-58 244 H58 L52 258 H-52 Z|s;M-54 251 H54|o;M-102 284 H102 L90 322 H-90 Z|s;M-96 294 H96 M-93 304 H93 M-90 314 H90 M-60 284 L-54 322 M-20 284 L-18 322 M20 284 L18 322 M60 284 L54 322|h;M-148 298 L-116 300 L-120 322 L-146 320 Z|s;M148 298 L116 300 L120 322 L146 320 Z|s;M-150 340 H150 L144 350 H-144 Z|s;M-140 345 H140|o';
const FACE_R='M-118 198 H118 L110 278 H-110 Z|t|T;M-84 128 H84 L112 192 H-112 Z|s|T;M-70 136 H70 M-76 148 H76 M-82 160 H82 M-88 172 H88|h|T;M-36 234 H36 V256 H-36 Z|t|T;M-150 206 L-70 200 L-66 216 L-146 224 Z|s;M150 206 L70 200 L66 216 L146 224 Z|s;M-142 213 L-72 208|o;M142 213 L72 208|o;M-66 209 H66|o;M-104 312 H104 L94 338 H-94 Z|s;M-60 312 V338 M-30 312 V338 M0 312 V338 M30 312 V338 M60 312 V338|h';
function face(list,front){
 for(const item of list.split(';')){const [d,cls,tag]=item.split('|');
  for(const poly of polys(d)) model.push({cls,face:front?2:-2,door:(!front&&tag==='T')?'tail':null,pts:poly.map(([u,y])=>{
   const X=front? lerp(XN,y)+30*(u/158)**2 : lerp(XT,y)-22*(u/158)**2;
   const tp=Math.min(1,lerp(HX,X)/158);
   return [X,y,(front?-u:u)*tp];})});
 }
}
face(FACE_F,true);face(FACE_R,false);
// contorno do vão do porta-malas (aparece quando a tampa sobe)
for(const poly of polys('M-110 136 H110 L122 198 L114 286 H-114 L-122 198 Z'))
 model.push({cls:'t',show:'tail',pts:poly.map(([u,y])=>{
  const X=lerp(XT,y)-22*(u/158)**2, tp=Math.min(1,lerp(HX,X)/158);
  return [X,y,u*tp];})});
for(const poly of polys('M-104 292 H104'))
 model.push({cls:'oh',show:'tail',pts:poly.map(([u,y])=>{
  const X=lerp(XT,y)-22*(u/158)**2, tp=Math.min(1,lerp(HX,X)/158);
  return [X,y,u*tp];})});

// perfis superior/inferior e seções transversais
const TOP={},BOT={};
for(const [x,y] of bodyPts){const k=Math.round(x/4)*4;TOP[k]=Math.min(TOP[k]??1e9,y);BOT[k]=Math.max(BOT[k]??-1e9,y)}
const keys=Object.keys(TOP).map(Number).sort((a,b)=>a-b);
model.push({cls:'ring',pts:keys.map(x=>[x,TOP[x],0])});
model.push({cls:'ring',pts:keys.map(x=>[x,(TOP[x]+BOT[x])/2,0])});
for(const x of [150,240,330,420,510,600,690,780,850]){
 const k=keys.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
 const yt=TOP[k],yb=BOT[k],ry=(yb-yt)/2,cyy=(yt+yb)/2,a=[];
 for(let i=0;i<=40;i++){const th=i/40*Math.PI*2,y=cyy+ry*Math.sin(th),z=hw(k,y)*Math.cos(th);a.push([k,y,z])}
 model.push({cls:'ring',pts:a});
}

// --- face superior: capô, para-brisa, teto, vidro traseiro ---
const TOPF='M150 -104 Q210 -132 340 -134 L340 134 Q210 132 150 104|t;M340 -134 Q322 0 340 134|s;M340 -134 L452 -112 Q442 0 452 112 L340 134|s;M452 -112 L700 -108 L700 108 L452 112|s;M700 -108 L784 -92 Q796 0 784 92 L700 108|s;M170 -46 Q260 -60 336 -62 M170 46 Q260 60 336 62|h;M576 -110 V110|t;M470 -118 V-108 M470 118 V108|h;M356 -120 Q340 0 356 120|h;M744 -100 Q754 0 744 100|h';
function topFace(){const crown=24;
 for(const item of TOPF.split(';')){const [d,cls]=item.split('|');
  for(const poly of polys(d)) model.push({cls,pts:poly.map(([x,z])=>{
   const k=keys.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
   const w=Math.max(20,lerp(HX,k)), f=Math.min(1,Math.abs(z)/w);
   return [x, TOP[k]+ (1-Math.sqrt(Math.max(0,1-f*f)))*crown, z];})});
 }}
topFace();


// ================= PORTAS E TAMPA TRASEIRA (3D, com dobradiça) =================
const DOORS={fl:{h:356,z:1},fr:{h:356,z:-1},rl:{h:590,z:1},rr:{h:590,z:-1}};
const PLATE_F='M358 212 L446 142 Q458 134 474 134 L576 130 L576 336 L356 336 Z;M368 212 L452 148 Q462 142 476 142 L568 138 L568 200 L368 206 Z;M508 230 h36 v6 h-36 Z;M368 300 L568 286';
const PLATE_R='M590 130 L706 131 Q722 133 736 148 L756 196 L744 242 L700 268 L604 336 L590 336 Z;M598 140 L704 141 Q716 142 726 152 L744 194 L598 200 Z;M672 224 h32 v6 h-32 Z;M604 300 L730 280';
function plate(d,key){const {h,z}=DOORS[key];
 for(const item of d.split(';')) for(const poly of polys(item)){
  model.push({cls:'s',door:key,face:z,pts:poly.map(([x,y])=>[x,y,z*hw(x,y)])});
  model.push({cls:'h',door:key,face:z,pts:poly.map(([x,y])=>[x,y,z*(hw(x,y)-14)])}); // espessura
 }}
plate(PLATE_F,'fl');plate(PLATE_F,'fr');plate(PLATE_R,'rl');plate(PLATE_R,'rr');

// ================= PROJETO 1.0 · SISTEMA DE SOM EM 3D =================
let DOOR_KEY=null;
const L=(a,b,c)=>[a,b,c];
function box(x0,x1,y0,y1,z0,z1,cls,layer){
 const c=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],d=[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
 model.push({cls,layer,door:DOOR_KEY,pts:[...c,c[0]]});model.push({cls,layer,door:DOOR_KEY,pts:[...d,d[0]]});
 for(let i=0;i<4;i++)model.push({cls,layer,door:DOOR_KEY,pts:[c[i],d[i]]});
}
// disco em plano: pl 'xz' (virado pra cima), 'yz' (virado pra frente), 'xy' (virado pro lado)
function disc(cxx,cyy,czz,r,pl,cls,layer,n=40){
 const a=[];for(let i=0;i<=n;i++){const t=i/n*Math.PI*2,u=r*Math.cos(t),v=r*Math.sin(t);
  a.push(pl==='xz'?[cxx+u,cyy,czz+v]:pl==='xy'?[cxx+u,cyy+v,czz]:[cxx,cyy+v,czz+u]);}
 model.push({cls,layer,door:DOOR_KEY,pts:a});
}
function speaker(cxx,cyy,czz,r,pl,layer,depth){ // cone com profundidade
 const off=(p,k)=>pl==='xz'?[cxx,cyy+k,czz]:pl==='xy'?[cxx,cyy,czz+k]:[cxx+k,cyy,czz];
 disc(cxx,cyy,czz,r,pl,'o',layer); disc(cxx,cyy,czz,r*.78,pl,'oh',layer);
 const c2=off(0,depth); disc(c2[0],c2[1],c2[2],r*.30,pl,'o',layer);
 const c3=off(0,depth*1.5); disc(c3[0],c3[1],c3[2],r*.12,pl,'oh',layer);
 for(let i=0;i<8;i++){const t=i/8*Math.PI*2,u=Math.cos(t),v=Math.sin(t);
  const p1=pl==='xz'?[cxx+u*r*.78,cyy,czz+v*r*.78]:pl==='xy'?[cxx+u*r*.78,cyy+v*r*.78,czz]:[cxx,cyy+v*r*.78,czz+u*r*.78];
  const p2=pl==='xz'?[cxx+u*r*.3,cyy+depth,czz+v*r*.3]:pl==='xy'?[cxx+u*r*.3,cyy+v*r*.3,czz+depth]:[cxx+depth,cyy+v*r*.3,czz+u*r*.3];
  model.push({cls:'oh',layer,door:DOOR_KEY,pts:[p1,p2]});}
}
function wire(pts,cls,layer){model.push({cls,layer,pts,door:DOOR_KEY})}

/* --- GRAVE · 6 subs virados para cima, tampo logo abaixo da janela --- */
box(646,850,222,330,-116,116,'o','grave');            // caixa em MDF
box(650,846,226,230,-112,112,'oh','grave');           // tampo
[[706,-76],[706,0],[706,76],[792,-76],[792,0],[792,76]].forEach(([x,z])=>{
 disc(x,226,z,40,'xz','o','grave');                   // recorte no tampo
 disc(x,227,z,35,'xz','oh','grave');
 speaker(x,230,z,32,'xz','grave',26);                 // sub
 disc(x,256,z,12,'xz','oh','grave');                  // ímã
 disc(x,268,z,10,'xz','oh','grave');
});
box(690,806,300,326,-24,24,'oh','grave');             // duto
wire([[646,296,0],[618,296,0],[618,330,0]],'oh','grave');   // saída atrás do banco
wire([[646,234,-116],[646,330,-116]],'oh','grave');
wire([[850,234,116],[850,330,116]],'oh','grave');

// tweeter quadrado, com relevo
function tweetSq(x,y,z,a,sg,lift){
 const sq=k=>[[x-k,y-k,z],[x+k,y-k,z],[x+k,y+k,z],[x-k,y+k,z],[x-k,y-k,z]];
 model.push({cls:'o',layer:'portas',door:DOOR_KEY,pts:sq(a)});
 disc(x,y,z-sg*5,a*.45,'xy','oh','portas');
}
// madeiramento com o falante detalhado
function baffle(x,y,z,r,sg,lift){
 disc(x,y,z,r,'xy','o','portas');                      // aro do falante
 disc(x,y,z-sg*9,r*.3,'xy','oh','portas');             // calota
 for(let i=0;i<6;i++){const t=i/6*Math.PI*2,u=Math.cos(t),v=Math.sin(t);
  model.push({cls:'oh',layer:'portas',door:DOOR_KEY,pts:[[x+u*r*.94,y+v*r*.94,z],[x+u*r*.3,y+v*r*.3,z-sg*9]]});}
}
[150,-150].forEach(z=>{const sg=Math.sign(z),F=sg>0?'fl':'fr',R=sg>0?'rl':'rr';
 /* --- porta dianteira: 4 tweeters quadrados + 1 falante por porta --- */
 DOOR_KEY=F;
 // contorno do madeiramento (forro recortado)
 const forro=(pts,cls,zz)=>model.push({cls,layer:'portas',door:DOOR_KEY,pts:pts.map(([x,y])=>[x,y,zz])});
 // forro tirado do próprio molde da porta (borda dianteira curva + coluna + soleira)
 const shapeF=[[380,216],[450,213],[520,211],[566,210],[566,240],[558,252],[558,282],[566,294],[566,324],[520,328],[450,329],[400,329],[373.9,319.6],[372.5,303.4],[371.9,287.3],[372.0,271.5],[372.9,255.8],[374.5,240.4],[376.9,225.1],[380,216]];
 forro(shapeF,'o',sg*149);
 forro([[388,223],[458,220],[512,218],[558,217],[558,247],[550,259],[550,275],[558,287],[558,317],[512,321],[458,322],[408,322],[381.9,312.6],[380.5,296.4],[379.9,280.3],[380.0,264.5],[380.9,262.8],[382.5,247.4],[384.9,232.1],[388,223]],'oh',sg*149);
 [400,448,496,544].forEach(x=>{ tweetSq(x,238,sg*148,8,sg,5); });   // régua de tweeters
 [400,448,496,544].forEach(x=>{ baffle(x,296,sg*148,21,sg,10); });  // fileira de falantes   // tweeter na coluna
 /* --- portas traseiras: sem som --- */
 DOOR_KEY=null;});

/* --- MÓDULOS · painel vertical à frente da caixa de grave --- */
// helpers de módulo (caixa com aletas, frente com bornes e leds)
function fins(x,y0,y1,z0,z1,n){for(let i=1;i<n;i++){const z=z0+(z1-z0)*i/n;
 wire([[x,y0+3,z],[x,y1-3,z]],'oh','modulos');}}
function modulo(xf,xb,y0,y1,z0,z1,tipo){
 box(xf,xb,y0,y1,z0,z1,'o','modulos');
 fins(xb,y0,y1,z0,z1,8);                                    // aletas no topo do corpo
 wire([[xf,y0+4,z0+4],[xf,y0+4,z1-4],[xf,y1-4,z1-4],[xf,y1-4,z0+4],[xf,y0+4,z0+4]],'oh','modulos'); // painel frontal
 if(tipo==='amp'){
  [0.18,0.34,0.5,0.66,0.82].forEach(f=>{const z=z0+(z1-z0)*f;
   disc(xf-1,(y0+y1)/2-6,z,3.2,'yz','oh','modulos');});     // potenciômetros
  [0.12,0.28].forEach(f=>{const z=z0+(z1-z0)*f;
   wire([[xf-1,y1-9,z],[xf-1,y1-9,z+7]],'oh','modulos');});  // bornes de alimentação
  disc(xf-1,y0+8,z1-8,2,'yz','o','modulos');                 // led
 }
 if(tipo==='fonte'){
  for(let i=0;i<4;i++){const z=z0+(z1-z0)*(0.2+i*0.2);
   wire([[xf-1,y0+8,z],[xf-1,y1-8,z]],'oh','modulos');}      // régua de saída
  disc(xf-1,y0+8,z0+8,2.4,'o','modulos');
 }
 if(tipo==='dsp'){
  wire([[xf-1,y0+5,z0+8],[xf-1,y0+5,z1-8],[xf-1,y1-5,z1-8],[xf-1,y1-5,z0+8],[xf-1,y0+5,z0+8]],'oh','modulos'); // visor
  [0.3,0.5,0.7].forEach(f=>disc(xf-1,y1-6,z0+(z1-z0)*f,2.4,'yz','oh','modulos'));
 }
}
// prancha de fixação (paralela à caixa de grave)
box(626,634,226,334,-112,112,'o','modulos');
wire([[625,232,-106],[625,232,106],[625,328,106],[625,328,-106],[625,232,-106]],'oh','modulos');  // moldura
[[236,-102],[236,102],[324,102],[324,-102]].forEach(([y,z])=>disc(624,y,z,3.5,'yz','oh','modulos')); // parafusos
[-112,112].forEach(z=>wire([[626,226,z],[626,334,z]],'oh','modulos'));
[ -68,-8,64 ].forEach(z=>wire([[625,232,z],[625,328,z]],'oh','modulos'));   // montantes
// dois amplificadores + fonte, lado a lado na vertical
modulo(596,624,238,296,-104,-46,'amp');
modulo(596,624,238,296,-30,28,'amp');
modulo(596,624,238,296,44,102,'fonte');
// gerenciador de áudio e barramento na faixa de baixo
modulo(600,624,302,328,-104,-10,'dsp');
box(600,624,302,328,4,102,'o','modulos');                    // barramento
[20,42,64,86].forEach(z=>{ box(600,610,306,324,z-8,z+8,'oh','modulos');
 wire([[600,315,z],[586,315,z]],'oh','modulos'); });          // porta-fusíveis e saídas
wire([[596,268,-104],[560,268,-104]],'oh','modulos');
wire([[596,268,28],[560,268,28]],'oh','modulos');
wire([[632,290,0],[646,290,0]],'oh','modulos');               // ligação com a caixa

/* --- MULTIMÍDIA · central no painel --- */
box(352,372,214,268,-46,46,'o','midia');
for(let i=0;i<4;i++)wire([[352,222+i*12,-40],[352,222+i*12,40]],'oh','midia');
wire([[344,206,-120],[344,206,120],[372,276,120],[372,276,-120],[344,206,-120]],'oh','midia');
disc(352,282,-70,10,'yz','oh','midia'); disc(352,282,70,10,'yz','oh','midia');

/* --- BATERIA e cabeamento · trajeto retangular pelo assoalho --- */
box(168,226,248,300,44,126,'o','bateria');                       // bateria
box(172,222,244,248,48,122,'oh','bateria');                      // tampa
wire([[182,248,58],[182,240,58],[196,240,58],[196,248,58]],'o','bateria');     // polo +
wire([[206,248,112],[206,240,112],[218,240,112],[218,248,112]],'o','bateria'); // polo -
box(240,262,250,274,44,68,'o','bateria');                        // porta-fusível principal
// positivo: bateria -> fusível -> assoalho -> centro -> barramento
wire([[196,240,58],[196,232,58],[251,232,58],[251,250,58]],'cab','bateria');
wire([[251,274,58],[251,332,58],[251,332,0],[600,332,0],[600,316,0]],'cab','bateria');
// negativo: bateria -> parafuso de terra no assoalho
wire([[218,240,112],[218,332,112],[286,332,112]],'cab','bateria');
wire([[286,332,112],[286,338,112]],'cab','bateria');
// barramento -> módulos (na prancha, em ângulo reto)
wire([[604,316,-70],[604,300,-70],[600,292,-70]],'cab','bateria');
wire([[604,316,-8],[604,296,-8],[600,290,-8]],'cab','bateria');
wire([[604,316,66],[604,296,66],[600,290,66]],'cab','bateria');
// gerenciador -> amplificadores (sinal)
wire([[604,306,-40],[604,286,-40],[600,282,-70]],'cabs','bateria');
wire([[604,306,-20],[604,284,-20],[600,282,-8]],'cabs','bateria');
// amplificadores -> portas, descendo ao assoalho e correndo reto
wire([[596,276,-80],[596,332,-80],[470,332,-80],[470,332,-140],[470,300,-140],[424,300,-140],[424,300,-148]],'cab','bateria');
wire([[596,276,-60],[596,332,-60],[500,332,-60],[500,332,-140],[500,304,-140],[496,304,-148]],'cabs','bateria');
wire([[596,276,80],[596,332,80],[470,332,80],[470,332,140],[470,300,140],[424,300,140],[424,300,148]],'cab','bateria');
wire([[596,276,60],[596,332,60],[500,332,60],[500,332,140],[500,304,140],[496,304,148]],'cabs','bateria');
// módulos -> caixa de grave
wire([[634,290,40],[660,290,40],[660,268,40]],'cab','bateria');
wire([[634,290,-40],[660,290,-40],[660,268,-40]],'cab','bateria');
// multimídia -> gerenciador (sinal pelo assoalho, no centro)
wire([[366,274,-20],[366,332,-20],[366,332,-30],[604,332,-30],[604,312,-30]],'cabs','bateria');

// tweeter quadrado, com relevo
// madeiramento com o falante detalhado


/* --- MÓDULOS · painel vertical à frente da caixa de grave --- */
// helpers de módulo (caixa com aletas, frente com bornes e leds)
function fins(x,y0,y1,z0,z1,n){for(let i=1;i<n;i++){const z=z0+(z1-z0)*i/n;
 wire([[x,y0+3,z],[x,y1-3,z]],'oh','modulos');}}
function modulo(xf,xb,y0,y1,z0,z1,tipo){
 box(xf,xb,y0,y1,z0,z1,'o','modulos');
 fins(xb,y0,y1,z0,z1,8);                                    // aletas no topo do corpo
 wire([[xf,y0+4,z0+4],[xf,y0+4,z1-4],[xf,y1-4,z1-4],[xf,y1-4,z0+4],[xf,y0+4,z0+4]],'oh','modulos'); // painel frontal
 if(tipo==='amp'){
  [0.18,0.34,0.5,0.66,0.82].forEach(f=>{const z=z0+(z1-z0)*f;
   disc(xf-1,(y0+y1)/2-6,z,3.2,'yz','oh','modulos');});     // potenciômetros
  [0.12,0.28].forEach(f=>{const z=z0+(z1-z0)*f;
   wire([[xf-1,y1-9,z],[xf-1,y1-9,z+7]],'oh','modulos');});  // bornes de alimentação
  disc(xf-1,y0+8,z1-8,2,'yz','o','modulos');                 // led
 }
 if(tipo==='fonte'){
  for(let i=0;i<4;i++){const z=z0+(z1-z0)*(0.2+i*0.2);
   wire([[xf-1,y0+8,z],[xf-1,y1-8,z]],'oh','modulos');}      // régua de saída
  disc(xf-1,y0+8,z0+8,2.4,'o','modulos');
 }
 if(tipo==='dsp'){
  wire([[xf-1,y0+5,z0+8],[xf-1,y0+5,z1-8],[xf-1,y1-5,z1-8],[xf-1,y1-5,z0+8],[xf-1,y0+5,z0+8]],'oh','modulos'); // visor
  [0.3,0.5,0.7].forEach(f=>disc(xf-1,y1-6,z0+(z1-z0)*f,2.4,'yz','oh','modulos'));
 }
}
// prancha de fixação (paralela à caixa de grave)
box(626,634,226,334,-112,112,'o','modulos');
wire([[625,232,-106],[625,232,106],[625,328,106],[625,328,-106],[625,232,-106]],'oh','modulos');  // moldura
[[236,-102],[236,102],[324,102],[324,-102]].forEach(([y,z])=>disc(624,y,z,3.5,'yz','oh','modulos')); // parafusos
[-112,112].forEach(z=>wire([[626,226,z],[626,334,z]],'oh','modulos'));
[ -68,-8,64 ].forEach(z=>wire([[625,232,z],[625,328,z]],'oh','modulos'));   // montantes
// dois amplificadores + fonte, lado a lado na vertical
modulo(596,624,238,296,-104,-46,'amp');
modulo(596,624,238,296,-30,28,'amp');
modulo(596,624,238,296,44,102,'fonte');
// gerenciador de áudio e barramento na faixa de baixo
modulo(600,624,302,328,-104,-10,'dsp');
box(600,624,302,328,4,102,'o','modulos');                    // barramento
[20,42,64,86].forEach(z=>{ box(600,610,306,324,z-8,z+8,'oh','modulos');
 wire([[600,315,z],[586,315,z]],'oh','modulos'); });          // porta-fusíveis e saídas
wire([[596,268,-104],[560,268,-104]],'oh','modulos');
wire([[596,268,28],[560,268,28]],'oh','modulos');
wire([[632,290,0],[646,290,0]],'oh','modulos');               // ligação com a caixa

/* --- MULTIMÍDIA · central no painel --- */
box(352,372,214,268,-46,46,'o','midia');
for(let i=0;i<4;i++)wire([[352,222+i*12,-40],[352,222+i*12,40]],'oh','midia');
wire([[344,206,-120],[344,206,120],[372,276,120],[372,276,-120],[344,206,-120]],'oh','midia');
disc(352,282,-70,10,'yz','oh','midia'); disc(352,282,70,10,'yz','oh','midia');

/* --- BATERIA e cabeamento · bateria > fusível > barramento > módulos > falantes --- */
box(168,226,248,300,44,126,'o','bateria');                       // bateria
box(172,222,244,248,48,122,'oh','bateria');                      // tampa
wire([[182,248,58],[182,240,58],[196,240,58],[196,248,58]],'o','bateria');    // polo +
wire([[208,248,112],[208,242,112],[218,242,112],[218,248,112]],'oh','bateria');// polo -
box(236,258,252,276,92,116,'o','bateria');                       // porta-fusível principal
wire([[196,242,58],[214,250,92],[236,262,104]],'o','bateria');   // bateria -> fusível
// tronco positivo até o painel de módulos
wire([[258,264,104],[300,300,118],[360,326,122],[520,330,122],[576,326,112],[600,316,96]],'o','bateria');
// negativo / aterramento no assoalho
wire([[218,246,112],[250,300,126],[300,330,130],[520,332,130],[590,326,118]],'oh','bateria');
wire([[300,330,130],[300,336,130]],'oh','bateria');              // parafuso de terra
// barramento -> cada módulo
wire([[600,312,60],[598,300,44],[596,292,70]],'oh','bateria');   // fonte
wire([[600,312,20],[598,296,-6],[596,290,-8]],'oh','bateria');   // amp 2
wire([[600,312,8],[598,300,-60],[596,290,-76]],'oh','bateria');  // amp 1
// gerenciador -> amplificadores (sinal)
wire([[600,306,-60],[598,298,-50],[596,282,-76]],'oh','bateria');
wire([[600,306,-30],[598,296,-16],[596,282,-8]],'oh','bateria');
// amplificadores -> alto-falantes das portas
wire([[596,274,-92],[560,320,-124],[470,330,-140],[430,312,-146],[420,300,-148]],'o','bateria');
wire([[596,274,-60],[560,318,-128],[470,330,-142],[500,312,-146]],'oh','bateria');
wire([[596,274,12],[560,320,124],[470,330,140],[430,312,146],[420,300,148]],'o','bateria');
wire([[596,274,40],[560,318,128],[470,330,142],[500,312,146]],'oh','bateria');
// fonte/amplificador -> caixa de grave
wire([[624,286,80],[646,280,70],[660,268,70]],'o','bateria');
wire([[624,292,50],[646,286,30],[660,272,20]],'oh','bateria');
// multimídia -> gerenciador (sinal, pelo assoalho)
wire([[366,270,-20],[420,330,-60],[560,332,-40],[598,310,-40]],'oh','bateria');

// tweeter quadrado, com relevo
// madeiramento com o falante detalhado


/* --- MÓDULOS · painel vertical à frente da caixa de grave --- */
// helpers de módulo (caixa com aletas, frente com bornes e leds)
function fins(x,y0,y1,z0,z1,n){for(let i=1;i<n;i++){const z=z0+(z1-z0)*i/n;
 wire([[x,y0+3,z],[x,y1-3,z]],'oh','modulos');}}
function modulo(xf,xb,y0,y1,z0,z1,tipo){
 box(xf,xb,y0,y1,z0,z1,'o','modulos');
 fins(xb,y0,y1,z0,z1,8);                                    // aletas no topo do corpo
 wire([[xf,y0+4,z0+4],[xf,y0+4,z1-4],[xf,y1-4,z1-4],[xf,y1-4,z0+4],[xf,y0+4,z0+4]],'oh','modulos'); // painel frontal
 if(tipo==='amp'){
  [0.18,0.34,0.5,0.66,0.82].forEach(f=>{const z=z0+(z1-z0)*f;
   disc(xf-1,(y0+y1)/2-6,z,3.2,'yz','oh','modulos');});     // potenciômetros
  [0.12,0.28].forEach(f=>{const z=z0+(z1-z0)*f;
   wire([[xf-1,y1-9,z],[xf-1,y1-9,z+7]],'oh','modulos');});  // bornes de alimentação
  disc(xf-1,y0+8,z1-8,2,'yz','o','modulos');                 // led
 }
 if(tipo==='fonte'){
  for(let i=0;i<4;i++){const z=z0+(z1-z0)*(0.2+i*0.2);
   wire([[xf-1,y0+8,z],[xf-1,y1-8,z]],'oh','modulos');}      // régua de saída
  disc(xf-1,y0+8,z0+8,2.4,'o','modulos');
 }
 if(tipo==='dsp'){
  wire([[xf-1,y0+5,z0+8],[xf-1,y0+5,z1-8],[xf-1,y1-5,z1-8],[xf-1,y1-5,z0+8],[xf-1,y0+5,z0+8]],'oh','modulos'); // visor
  [0.3,0.5,0.7].forEach(f=>disc(xf-1,y1-6,z0+(z1-z0)*f,2.4,'yz','oh','modulos'));
 }
}
// prancha de fixação (paralela à caixa de grave)
box(626,634,226,334,-112,112,'o','modulos');
wire([[625,232,-106],[625,232,106],[625,328,106],[625,328,-106],[625,232,-106]],'oh','modulos');  // moldura
[[236,-102],[236,102],[324,102],[324,-102]].forEach(([y,z])=>disc(624,y,z,3.5,'yz','oh','modulos')); // parafusos
[-112,112].forEach(z=>wire([[626,226,z],[626,334,z]],'oh','modulos'));
[ -68,-8,64 ].forEach(z=>wire([[625,232,z],[625,328,z]],'oh','modulos'));   // montantes
// dois amplificadores + fonte, lado a lado na vertical
modulo(596,624,238,296,-104,-46,'amp');
modulo(596,624,238,296,-30,28,'amp');
modulo(596,624,238,296,44,102,'fonte');
// gerenciador de áudio e barramento na faixa de baixo
modulo(600,624,302,328,-104,-10,'dsp');
box(600,624,302,328,4,102,'o','modulos');                    // barramento
[20,42,64,86].forEach(z=>{ box(600,610,306,324,z-8,z+8,'oh','modulos');
 wire([[600,315,z],[586,315,z]],'oh','modulos'); });          // porta-fusíveis e saídas
wire([[596,268,-104],[560,268,-104]],'oh','modulos');
wire([[596,268,28],[560,268,28]],'oh','modulos');
wire([[632,290,0],[646,290,0]],'oh','modulos');               // ligação com a caixa

/* --- MULTIMÍDIA · central no painel --- */
box(352,372,214,268,-46,46,'o','midia');
for(let i=0;i<4;i++)wire([[352,222+i*12,-40],[352,222+i*12,40]],'oh','midia');
wire([[344,206,-120],[344,206,120],[372,276,120],[372,276,-120],[344,206,-120]],'oh','midia');
disc(352,282,-70,10,'yz','oh','midia'); disc(352,282,70,10,'yz','oh','midia');

/* --- BATERIA e cabos --- */
box(168,226,248,300,44,126,'o','bateria');
wire([[176,248,58],[176,240,58],[192,240,58],[192,248,58]],'o','bateria');
wire([[210,248,112],[210,240,112],[220,240,112],[220,248,112]],'oh','bateria');
wire([[226,268,86],[300,268,86],[320,322,120],[560,330,120],[600,318,110]],'o','bateria');
wire([[226,280,60],[300,290,40],[330,330,0],[600,330,0]],'oh','bateria');
wire([[684,316,-90],[660,316,-100],[660,300,-100]],'oh','grave');
wire([[684,312,0],[700,300,0]],'oh','modulos');

// rodas
for(const wx of [260,760]) for(const sgn of [1,-1]) for(const r of [60,47,12]){
 const a=[];for(let i=0;i<=48;i++){const th=i/48*Math.PI*2;a.push([wx+r*Math.cos(th),298+r*Math.sin(th),sgn*150])}
 model.push({cls:r===47?'s':'t',face:sgn,pts:a});
 for(const sg2 of [sgn]) if(r===47){for(let k=0;k<5;k++){const b=[];const off=k*72*Math.PI/180;
  for(const [px,py] of [[-3,-12],[-9,-43],[-2,-45],[0,-21],[2,-45],[9,-43],[3,-12],[-3,-12]]){
   const q=px*Math.cos(off)-py*Math.sin(off), w=px*Math.sin(off)+py*Math.cos(off);b.push([wx+q,298+w,sg2*150])}
  model.push({cls:'t',face:sg2,pts:b})}}
}
// chão
{const g=[];for(let x=80;x<=920;x+=40)g.push({cls:'h',pts:[[x,362,-210],[x,362,210]]});
 for(let z=-200;z<=200;z+=40)g.push({cls:'h',pts:[[80,362,z],[920,362,z]]});model.push(...g)}



const V=document.getElementById('view');
const cxv=490,cyv=236,Dv=2000;
let yaw=35*Math.PI/180, pit=14*Math.PI/180;
let vbox=[-380,-200,760,440];
const items=[];
for(const m of model){ if(m.cls==='ring')continue;
 const el=document.createElementNS(NS,'path');el.setAttribute('class',m.cls+(m.layer?' kit':''));V.appendChild(el);
 items.push({m,el});}
function swing(P,door){let [X,Y,Z]=P;const A=door?ANG[door]:0;if(!A)return P;
 if(door==='tail'){const hx=754,hy=132,dx=X-hx,dy=Y-hy,ca=Math.cos(A),sa=Math.sin(A);return [hx+dx*ca+dy*sa,hy-dx*sa+dy*ca,Z];}
 const {h,z}=DOORS[door],dx=X-h;return [h+dx*Math.cos(A),Y,Z+z*dx*Math.sin(A)];}
function proj(X,Y,Z){const sy=Math.sin(yaw),cyw=Math.cos(yaw),sp=Math.sin(pit),cp=Math.cos(pit);
 const dx=X-cxv,dy=Y-cyv,xc=dx*cyw+Z*sy,zc=-dx*sy+Z*cyw,yc=dy*cp+zc*sp,dp=zc*cp-dy*sp,s=Dv/(Dv-dp);
 return [xc*s,yc*s];}
let LAYER=null, LFADE={};
function draw(){
 const sy=Math.sin(yaw),cyw=Math.cos(yaw);
 for(const {m,el} of items){
  let fade=1;
  if(m.hide)for(const k of m.hide)fade=Math.min(fade,1-ANG[k]/MAX[k]);
  if(m.show)fade=Math.min(fade,ANG[m.show]/MAX[m.show]);
  if(m.layer)fade=Math.min(fade,LFADE[m.layer]||0);
  if(!m.layer&&LAYER)fade*=(m.cls==='h'?0.12:0.24);
  const face=m.face||0;
  if(face){const n=(Math.abs(face)===1)?face*cyw:(face/2)*sy;const q=Math.max(0,Math.min(1,(n+0.32)/0.64));fade*=0.3+0.7*(q*q*(3-2*q));}
  if(fade<0.02){el.style.display='none';continue}
  el.style.display='';el.style.opacity=fade.toFixed(3);
  let d='';for(let i=0;i<m.pts.length;i++){const [x,y]=proj(...swing(m.pts[i],m.door));d+=(i?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);}
  el.setAttribute('d',d);}
 V.setAttribute('viewBox',vbox.map(v=>v.toFixed(0)).join(' '));
}
// alvos por seção
function boxFor(layer,open){
 const save={...ANG},sy=yaw,sp=pit;
 let fx0=1e9,fy0=1e9,fx1=-1e9,fy1=-1e9,ax0=1e9,ay0=1e9,ax1=-1e9,ay1=-1e9;
 for(const {m} of items){ if(m.layer&&m.layer!==layer)continue;
  for(const P of m.pts){const [x,y]=proj(...swing(P,m.door));
   ax0=Math.min(ax0,x);ay0=Math.min(ay0,y);ax1=Math.max(ax1,x);ay1=Math.max(ay1,y);
   if(layer&&m.layer===layer){fx0=Math.min(fx0,x);fy0=Math.min(fy0,y);fx1=Math.max(fx1,x);fy1=Math.max(fy1,y);}}}
 let b=[ax0-20,ay0-20,ax1+20,ay1+20];
 if(layer&&fx1>fx0){const g=110;b=[fx0-g,fy0-g,fx1+g,fy1+g];}
 let w=b[2]-b[0],h=b[3]-b[1];const ar=1.5;
 if(w/h<ar){const nw=h*ar;b[0]-=(nw-w)/2;w=nw}else{const nh=w/ar;b[1]-=(nh-h)/2;h=nh}
 return [b[0],b[1],w,h];}
const STATES={
 hero:{yaw:35,pit:14,layer:null,open:[]},
 portas:{yaw:70,pit:8,layer:'portas',open:['fl','fr']},
 grave:{yaw:-46,pit:32,layer:'grave',open:['tail']},
 modulos:{yaw:-26,pit:28,layer:'modulos',open:['tail']},
 midia:{yaw:74,pit:6,layer:'midia',open:['fl']},
 bateria:{yaw:42,pit:22,layer:'bateria',open:[]},
 rta:{yaw:86,pit:8,layer:null,open:[]},
 final:{yaw:-52,pit:16,layer:null,open:['fl','fr','rl','rr','tail']},
};
let T={yaw:35*Math.PI/180,pit:14*Math.PI/180,open:{fl:0,fr:0,rl:0,rr:0,tail:0},layer:null,box:null};
function setState(key){const s=STATES[key];if(!s)return;
 T.yaw=s.yaw*Math.PI/180;T.pit=s.pit*Math.PI/180;T.layer=s.layer;
 for(const k in T.open)T.open[k]=0;(s.open||[]).forEach(k=>T.open[k]=MAX[k]);
 // calcula o enquadramento no estado final
 const sy=yaw,sp=pit,save={...ANG};
 yaw=T.yaw;pit=T.pit;for(const k in ANG)ANG[k]=T.open[k];
 T.box=boxFor(s.layer,s.open);
 yaw=sy;pit=sp;for(const k in ANG)ANG[k]=save[k];
 LAYER=s.layer;
 if(!running){running=true;requestAnimationFrame(loop)}}
let running=false;
function loopOld(){
 const e=0.07;let moving=false;
 const ap=(a,b)=>{const d=b-a;if(Math.abs(d)>1e-4){moving=true;return a+d*e}return b};
 yaw=ap(yaw,T.yaw);pit=ap(pit,T.pit);
 for(const k in ANG)ANG[k]=ap(ANG[k],T.open[k]);
 for(const k of ['portas','grave','modulos','midia','bateria']){
  const tgt=(T.layer===k)?1:0;LFADE[k]=ap(LFADE[k]||0,tgt);}
 if(T.box)for(let i=0;i<4;i++)vbox[i]=ap(vbox[i],T.box[i]);
 draw();
 if(moving)requestAnimationFrame(loop);else running=false;}

const SECS=[
 ['hero','01','projeto sob medida','Cada grave começa no papel.','Antes de instalar, a Vibex desenha o som do seu carro: o que cabe, onde fica cada peça e como a energia chega até ela. Role a página e acompanhe o projeto sendo montado, etapa por etapa.',''],
 ['portas','02','alto-falantes','Portas que tocam de verdade.','Forro recortado no molde da porta, com quatro tweeters quadrados na régua de cima e quatro falantes alinhados embaixo. A porta é tratada para não vibrar e cada falante fica no ângulo certo, para o som chegar limpo ao motorista em vez de se perder no vidro.',''],
 ['grave','03','dimensionamento do grave','Subwoofer calculado, não chutado.','Seis subs virados para cima, numa caixa que vai do encosto dos bancos até a tampa. O volume interno e o duto são calculados para o modelo do seu sub e para o espaço do carro, que é o que separa grave forte de grave sujo. O tampo para logo abaixo da linha da janela, no padrão do trio goiano.',''],
 ['modulos','04','amplificação','Módulos dimensionados e organizados.','Dois amplificadores, a fonte, o gerenciador de áudio e o barramento, montados numa prancha vertical à frente da caixa. Cada módulo é escolhido pela potência que os falantes pedem, com espaço para respirar e acesso fácil na hora da manutenção.',''],
 ['midia','05','multimídia','Central instalada e configurada.','Multimídia com moldura sob medida, fiação organizada e saídas ajustadas para o gerenciador. A configuração é feita na loja: níveis de saída, entradas de câmera e volante e atualização do aparelho. Fonte limpa é o começo de todo sistema que toca bem.',''],
 ['rta','06','regulagem RTA','Afinado com medição, não no ouvido.','Com o microfone dentro do carro, o RTA mostra onde o som está sobrando e onde está faltando. A partir daí ajustamos crossover, ganho, fase e equalização até a curva ficar equilibrada. É por isso que dois carros com as mesmas peças podem tocar completamente diferente.',''],
 ['bateria','07','elétrica','Instalação elétrica segura e especializada.','Positivo protegido por fusível a poucos centímetros da bateria, cabo na bitola correta correndo pelo assoalho, aterramento reforçado e barramento distribuindo para cada módulo. É a parte que ninguém vê e que evita queda de tensão, cabo esquentando e risco de incêndio.',''],
 ['final','08','pronto pra rodar','Bora montar o seu?','Av. Diamante, 13, Vila Oliveira, Aparecida de Goiânia. Aberto de segunda a sábado, das 8h às 19h.','<a class="btn" href="https://wa.me/556296166397" target="_blank" rel="noopener">Pedir orçamento no WhatsApp</a>'],
];

const cap=document.getElementById('cap'), ticks=document.getElementById('ticks'), scroller=document.getElementById('scroller');
const caps=[];
SECS.forEach(([k,n,tag,h,p,extra],i)=>{
 const d=document.createElement('div');d.className='cap-item';d.dataset.k=k;
 d.innerHTML=`<p class="tag"><span class="no">${n}</span> — ${tag}</p><h2>${h}</h2><p>${p}</p>${extra}`;
 cap.appendChild(d);caps.push(d);
 const t=document.createElement('i');ticks.appendChild(t);
 const sp=document.createElement('div');sp.dataset.state=k;scroller.appendChild(sp);
});
const bars=document.querySelector('#rta .bars');
for(let i=0;i<26;i++){const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
 const x=52+i*24, h=30+Math.abs(Math.sin(i*0.9))*120;
 r.setAttribute('x',x);r.setAttribute('width',14);r.setAttribute('y',250-h);r.setAttribute('height',h);
 r.style.transformOrigin=`${x+7}px 250px`;r.style.animationDelay=(i*0.06)+'s';bars.appendChild(r);}
const scene=document.querySelector('.scene'), rtaEl=document.getElementById('rta');

// ---- estados numéricos por etapa
function stateOf(key){const s=STATES[key];
 const open={fl:0,fr:0,rl:0,rr:0,tail:0};(s.open||[]).forEach(k=>open[k]=MAX[k]);
 return {yaw:s.yaw*Math.PI/180,pit:s.pit*Math.PI/180,layer:s.layer,open};}
const ST=SECS.map(x=>stateOf(x[0]));
// enquadramento de cada etapa, calculado uma vez
const BOX=ST.map(st=>{const sy=yaw,sp=pit,save={...ANG};
 yaw=st.yaw;pit=st.pit;for(const k in ANG)ANG[k]=st.open[k];
 const b=boxFor(st.layer,Object.keys(st.open).filter(k=>st.open[k]>0));
 yaw=sy;pit=sp;for(const k in ANG)ANG[k]=save[k];return b;});

const ease=t=>t*t*(3-2*t);
let target=0, shown=0;   // posição contínua entre as etapas
function progress(){
 const r=scroller.getBoundingClientRect(), vh=innerHeight;
 const total=r.height-vh;
 const p=Math.max(0,Math.min(1,(-r.top)/(total||1)));
 return p*(SECS.length-1);
}
function apply(pos){
 const i=Math.max(0,Math.min(SECS.length-2,Math.floor(pos)));
 const f=ease(Math.max(0,Math.min(1,pos-i)));
 const A=ST[i],B=ST[i+1];
 yaw=A.yaw+(B.yaw-A.yaw)*f; pit=A.pit+(B.pit-A.pit)*f;
 for(const k in ANG)ANG[k]=A.open[k]+(B.open[k]-A.open[k])*f;
 for(const k of ['portas','grave','modulos','midia','bateria']){
  const a=(A.layer===k)?1:0, b=(B.layer===k)?1:0;LFADE[k]=a+(b-a)*f;}
 LAYER=(f<.5?A.layer:B.layer);
 for(let j=0;j<4;j++)vbox[j]=BOX[i][j]+(BOX[i+1][j]-BOX[i][j])*f;
 // legendas: aparece a mais próxima, saindo e entrando de forma contínua
 caps.forEach((el,j)=>{const d=Math.abs(pos-j);
  const o=Math.max(0,1-d*1.9);
  el.style.opacity=o.toFixed(3);
  el.style.transform=`translateY(${((pos-j)*34).toFixed(1)}px)`;
  el.classList.toggle('on',d<.5);});
 [...ticks.children].forEach((el,j)=>el.classList.toggle('on',Math.round(pos)===j));
 const irta=SECS.findIndex(x=>x[0]==='rta');
 const ro=Math.max(0,1-Math.abs(pos-irta)*1.6);
 rtaEl.style.opacity=ro.toFixed(3);
 document.getElementById('view').style.opacity=(1-ro*0.85).toFixed(3);
 scene.classList.toggle('on-rta',ro>.5);
 draw();
}
// encaixa na etapa mais próxima quando o dedo solta
let snapT=null, userScrolling=false;
function yFor(i){const r=scroller.getBoundingClientRect(), top=r.top+scrollY, total=r.height-innerHeight;
 return top+(total*i/(SECS.length-1));}
function snap(){
 const r=scroller.getBoundingClientRect();
 if(r.top>0||r.bottom<innerHeight)return;          // só dentro da animação
 const pos=progress(), i=Math.round(pos);
 if(Math.abs(pos-i)<0.02)return;
 scrollTo({top:yFor(i),behavior:'smooth'});
}
// o encaixe vale só para toque; no mouse/trackpad a rolagem fica livre
const coarse=matchMedia('(pointer: coarse)').matches;
if(coarse){
 addEventListener('scroll',()=>{clearTimeout(snapT);snapT=setTimeout(snap,140)},{passive:true});
 addEventListener('touchend',()=>{clearTimeout(snapT);snapT=setTimeout(snap,110)},{passive:true});
}

function tick(){
 target=progress();
 shown+=(target-shown)*(coarse?0.18:0.12);                 // suaviza a rolagem
 if(Math.abs(target-shown)<0.0008)shown=target;
 apply(shown);
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const thumbs=document.getElementById('thumbs'), bigcap=document.getElementById('bigcap');
let gi=0;const ths=[...thumbs.querySelectorAll('.th')];
function pick(i){gi=(i+ths.length)%ths.length;ths.forEach((t,j)=>t.classList.toggle('on',j===gi));
 bigcap.textContent=ths[gi].dataset.cap;document.getElementById('bigimg').src=ths[gi].dataset.src;ths[gi].scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});}
ths.forEach((t,i)=>t.addEventListener('click',()=>pick(i)));
setInterval(()=>{const g=document.getElementById('galeria').getBoundingClientRect();
 if(g.top<innerHeight&&g.bottom>0)pick(gi+1);},4500);
