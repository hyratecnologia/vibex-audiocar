/* Vibex AudioCar · Raio-X do carro
   Modelo 3D em wireframe (SVG) com as camadas do sistema de som.
   A geometria vem do projeto 1.0; o motor é montado só quando a seção aparece na tela. */
(function () {
'use strict';

function build(V) {
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
const tmp=document.createElementNS(NS,'svg');tmp.setAttribute('aria-hidden','true');tmp.style.position='absolute';document.body.appendChild(tmp);tmp.setAttribute('width',0);tmp.setAttribute('height',0);
function polys(d){const out=[];for(const sub of d.split(/(?=M)/)){if(!sub.trim())continue;const p=document.createElementNS(NS,'path');p.setAttribute('d',sub);tmp.appendChild(p);
 const L=p.getTotalLength(),n=Math.max(2,Math.ceil(L/4)),a=[];for(let i=0;i<=n;i++){const q=p.getPointAtLength(L*i/n);a.push([q.x,q.y])}p.remove();out.push(a)}return out}
function dOf(el){const T=el.tagName;
 if(T==='path')return el.getAttribute('d');
 if(T==='rect'){const x=+el.getAttribute('x'),y=+el.getAttribute('y'),w=+el.getAttribute('width'),h=+el.getAttribute('height');return `M${x} ${y} H${x+w} V${y+h} H${x} Z`}
 if(T==='ellipse'){const x=+el.getAttribute('cx'),y=+el.getAttribute('cy'),a=+el.getAttribute('rx'),b=+el.getAttribute('ry');return `M${x-a} ${y} A${a} ${b} 0 1 0 ${x+a} ${y} A${a} ${b} 0 1 0 ${x-a} ${y}`}
 if(T==='circle'){const x=+el.getAttribute('cx')||0,y=+el.getAttribute('cy')||0,r=+el.getAttribute('r');return `M${x-r} ${y} A${r} ${r} 0 1 0 ${x+r} ${y} A${r} ${r} 0 1 0 ${x-r} ${y}`}}

// perfil lateral do hatch (o primeiro item é a carroceria)
const SRC = [
 ['s','M120 336 L108 320 Q100 296 108 276 L120 250 Q132 234 158 228 L296 210 Q318 206 336 198 L440 132 Q454 122 476 120 L690 114 Q730 116 754 132 L836 196 Q858 210 864 232 L872 268 Q876 302 866 322 L850 338 L813 338 A66 66 0 1 0 707 338 L313 338 A66 66 0 1 0 207 338 Z'],
 ['s','M356 210 L448 142 Q458 134 474 134 L682 130 Q712 130 728 142 L790 190 Q796 198 784 200 Z'],
 ['h','M410 186 l44 -34 M440 188 l52 -40 M640 158 l34 -28 M672 162 l32 -26'],
 ['s','M578 132 H592 V206 H578 Z M706 131 L720 133 L756 192 L742 194 Z'],
 ['t','M358 214 Q346 272 356 336 M585 208 V336 M742 196 Q742 236 700 260'],
 ['t','M160 240 C330 230 600 224 868 226 M170 262 C340 254 600 246 866 246'],
 ['t','M348 318 C430 302 570 276 650 266 Q690 262 700 288'],
 ['t','M508 230 H544 V236 H508 Z'],
 ['t','M672 224 H704 V230 H672 Z'],
 ['s','M368 208 Q360 184 388 180 L410 184 Q416 198 402 208 Z'],
 ['s','M114 254 L206 238 L232 240 L216 252 L124 268 Z'],['o','M126 261 L216 246'],
 ['s','M110 292 L168 286 L176 316 L120 322 Q112 310 110 292 Z'],
 ['h','M116 298 L170 293 M117 306 L172 301 M119 314 L174 309'],
 ['s','M118 336 L212 340 L208 350 L126 346 Z'],['o','M128 344 H206'],
 ['s','M150 322 L196 326 L192 338 L148 334 Z'],
 ['s','M313 338 L707 338 L704 350 L318 350 Z'],['o','M330 344 H692'],
 ['s','M776 200 L866 212 L868 228 L786 218 Z'],['o','M786 209 L864 219'],
 ['s','M714 114 L788 122 Q794 126 786 132 L744 130 Z'],
 ['s','M806 322 L872 316 L864 338 L814 340 Z'],
 ['t','M833 330 A11 6 0 1 0 855 330 A11 6 0 1 0 833 330'],
 ['t','M774 248 A10 10 0 1 0 794 248 A10 10 0 1 0 774 248']
];

const model = []; // {cls, pts:[[X,Y,Z]...]}
let bodyPts = null;
SRC.forEach(([cls, d], idx) => {
 for (const poly of polys(d)) {
  if (idx === 0 && !bodyPts) { bodyPts = poly;
   for (const sgn of [1, -1]) model.push({cls, face: sgn, pts: poly.map(([x, y]) => [x, y, sgn * hw(x, y)])});
   continue; }
  // divide a linha nos trechos de cada porta, para o traço sumir junto com ela
  const reg = ([x, y]) => (y < 334 && x > 352 && x < 584) ? 'f' : (y < 334 && x >= 584 && x < 748) ? 'r' : '';
  let run = [poly[0]], cur = reg(poly[0]); const runs = [];
  for (let i = 1; i < poly.length; i++) { const r = reg(poly[i]);
   if (r === cur) { run.push(poly[i]); } else { run.push(poly[i]); runs.push([cur, run]); run = [poly[i]]; cur = r; } }
  runs.push([cur, run]);
  for (const [r, pts] of runs) { if (pts.length < 2) continue;
   for (const sgn of [1, -1]) { const keys = r === 'f' ? [sgn > 0 ? 'fl' : 'fr'] : r === 'r' ? [sgn > 0 ? 'rl' : 'rr'] : null;
    model.push({cls, face: sgn, hide: keys, pts: pts.map(([x, y]) => [x, y, sgn * hw(x, y)])}); } }
 }
});
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
tmp.remove();

// ================= MOTOR DE DESENHO =================
const LAYERS = ['portas', 'grave', 'modulos', 'midia', 'bateria'];
const items = [];
for (const m of model) {
 if (m.cls === 'ring') continue;
 const el = document.createElementNS(NS, 'path');
 el.setAttribute('class', m.cls + (m.layer ? ' kit' : ''));
 V.appendChild(el);
 items.push({m, el});
}
let yaw = 35 * Math.PI / 180, pit = 14 * Math.PI / 180;
let vbox = [-380, -200, 760, 440];
let FOCUS = null;
const OVERVIEW = 0.7; // força das camadas na visão geral
const LFADE = {portas: OVERVIEW, grave: OVERVIEW, modulos: OVERVIEW, midia: OVERVIEW, bateria: OVERVIEW};

function swing(P, door) { const [X, Y, Z] = P; const A = door ? ANG[door] : 0; if (!A) return P;
 if (door === 'tail') { const hx = 754, hy = 132, dx = X - hx, dy = Y - hy, ca = Math.cos(A), sa = Math.sin(A); return [hx + dx * ca + dy * sa, hy - dx * sa + dy * ca, Z]; }
 const {h, z} = DOORS[door], dx = X - h; return [h + dx * Math.cos(A), Y, Z + z * dx * Math.sin(A)]; }
function proj(X, Y, Z) { const sy = Math.sin(yaw), cyw = Math.cos(yaw), sp = Math.sin(pit), cp = Math.cos(pit);
 const dx = X - cx, dy = Y - cy, xc = dx * cyw + Z * sy, zc = -dx * sy + Z * cyw, yc = dy * cp + zc * sp, dp = zc * cp - dy * sp, s = D / (D - dp);
 return [xc * s, yc * s]; }

function draw() {
 const sy = Math.sin(yaw), cyw = Math.cos(yaw);
 for (const {m, el} of items) {
  let fade = 1;
  if (m.hide) for (const k of m.hide) fade = Math.min(fade, 1 - ANG[k] / MAX[k]);
  if (m.show) fade = Math.min(fade, ANG[m.show] / MAX[m.show]);
  if (m.layer) fade = Math.min(fade, LFADE[m.layer]);
  if (!m.layer && FOCUS) fade *= (m.cls === 'h' ? 0.12 : 0.24);
  const face = m.face || 0;
  if (face) { const n = (Math.abs(face) === 1) ? face * cyw : (face / 2) * sy; const q = Math.max(0, Math.min(1, (n + 0.32) / 0.64)); fade *= 0.3 + 0.7 * (q * q * (3 - 2 * q)); }
  if (fade < 0.02) { el.style.display = 'none'; continue; }
  el.style.display = ''; el.style.opacity = fade.toFixed(3);
  let d = ''; for (let i = 0; i < m.pts.length; i++) { const [x, y] = proj(...swing(m.pts[i], m.door)); d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
  el.setAttribute('d', d);
 }
 V.setAttribute('viewBox', vbox.map(v => v.toFixed(0)).join(' '));
}

// enquadramento: carro inteiro, ou a camada em foco com uma folga em volta
function boxFor(layer) {
 let fx0 = 1e9, fy0 = 1e9, fx1 = -1e9, fy1 = -1e9, ax0 = 1e9, ay0 = 1e9, ax1 = -1e9, ay1 = -1e9;
 for (const {m} of items) { if (m.layer && layer && m.layer !== layer) continue;
  for (const P of m.pts) { const [x, y] = proj(...swing(P, m.door));
   ax0 = Math.min(ax0, x); ay0 = Math.min(ay0, y); ax1 = Math.max(ax1, x); ay1 = Math.max(ay1, y);
   if (layer && m.layer === layer) { fx0 = Math.min(fx0, x); fy0 = Math.min(fy0, y); fx1 = Math.max(fx1, x); fy1 = Math.max(fy1, y); } } }
 let b = [ax0 - 20, ay0 - 20, ax1 + 20, ay1 + 20];
 if (layer && fx1 > fx0) { const g = 110; b = [fx0 - g, fy0 - g, fx1 + g, fy1 + g]; }
 let w = b[2] - b[0], h = b[3] - b[1]; const ar = 1.5;
 if (w / h < ar) { const nw = h * ar; b[0] -= (nw - w) / 2; w = nw; } else { const nh = w / ar; b[1] -= (nh - h) / 2; h = nh; }
 return [b[0], b[1], w, h];
}

const STATES = {
 geral:   {yaw: 35,  pit: 14, focus: null,      open: []},
 portas:  {yaw: 70,  pit: 8,  focus: 'portas',  open: ['fl', 'fr']},
 grave:   {yaw: -46, pit: 32, focus: 'grave',   open: ['tail']},
 modulos: {yaw: -26, pit: 28, focus: 'modulos', open: ['tail']},
 midia:   {yaw: 74,  pit: 6,  focus: 'midia',   open: ['fl']},
 bateria: {yaw: 42,  pit: 22, focus: 'bateria', open: []}
};
function snapshot() { return {yaw, pit, ang: {...ANG}, lf: {...LFADE}, box: vbox.slice()}; }
function apply(s) { yaw = s.yaw; pit = s.pit; Object.assign(ANG, s.ang); Object.assign(LFADE, s.lf); vbox = s.box.slice(); }
function target(key) {
 const st = STATES[key], save = snapshot();
 const t = {yaw: st.yaw * Math.PI / 180, pit: st.pit * Math.PI / 180, ang: {fl: 0, fr: 0, rl: 0, rr: 0, tail: 0}, lf: {}};
 st.open.forEach(k => { t.ang[k] = MAX[k]; });
 LAYERS.forEach(k => { t.lf[k] = !st.focus ? OVERVIEW : st.focus === k ? 1 : 0; });
 yaw = t.yaw; pit = t.pit; Object.assign(ANG, t.ang);
 t.box = boxFor(st.focus);
 apply(save);
 return t;
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let raf = 0;
function go(key) {
 const st = STATES[key]; if (!st) return;
 const A = snapshot(), B = target(key);
 // gira pelo caminho mais curto
 while (B.yaw - A.yaw > Math.PI) B.yaw -= 2 * Math.PI;
 while (A.yaw - B.yaw > Math.PI) B.yaw += 2 * Math.PI;
 FOCUS = st.focus;
 cancelAnimationFrame(raf);
 const dur = reduce.matches ? 0 : 950, t0 = performance.now();
 const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
 const mix = (a, b, f) => a + (b - a) * f;
 (function step(now) {
  const k = dur ? Math.min(1, (now - t0) / dur) : 1, f = ease(k);
  yaw = mix(A.yaw, B.yaw, f); pit = mix(A.pit, B.pit, f);
  for (const d in ANG) ANG[d] = mix(A.ang[d], B.ang[d], f);
  for (const l of LAYERS) LFADE[l] = mix(A.lf[l], B.lf[l], f);
  for (let i = 0; i < 4; i++) vbox[i] = mix(A.box[i], B.box[i], f);
  draw();
  if (k < 1) raf = requestAnimationFrame(step);
 })(t0);
}

// arrastar para girar (na horizontal; a rolagem vertical da página continua livre no celular)
let drag = null;
V.addEventListener('pointerdown', e => { drag = {x: e.clientX, y: e.clientY, id: e.pointerId}; cancelAnimationFrame(raf); });
V.addEventListener('pointermove', e => {
 if (!drag || drag.id !== e.pointerId) return;
 const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
 if (!drag.on && Math.abs(dx) < 4) return;
 if (!drag.on) { drag.on = true; V.setPointerCapture(e.pointerId); V.classList.add('is-dragging'); }
 yaw += dx * 0.008;
 if (e.pointerType === 'mouse') pit = Math.max(-0.5, Math.min(1.45, pit + dy * 0.006));
 drag.x = e.clientX; drag.y = e.clientY; draw();
});
const end = () => { drag = null; V.classList.remove('is-dragging'); };
V.addEventListener('pointerup', end); V.addEventListener('pointercancel', end);

vbox = target('geral').box;
draw();
return {go};
}

// ================= SEÇÃO RAIO-X =================
const section = document.getElementById('raio-x');
if (!section) return;
const svg = section.querySelector('.raiox-view');
const buttons = [...section.querySelectorAll('[data-layer]')];
const panels = [...section.querySelectorAll('[data-panel]')];
let api = null;

function select(key) {
 buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layer === key)));
 panels.forEach(p => { p.hidden = p.dataset.panel !== key; });
 if (api) api.go(key);
}
buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.layer)));

function start() {
 if (api) return;
 section.classList.add('is-ready');
 api = build(svg);
 const on = buttons.find(b => b.getAttribute('aria-pressed') === 'true');
 if (on && on.dataset.layer !== 'geral') api.go(on.dataset.layer);
}
if ('IntersectionObserver' in window) {
 const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, {rootMargin: '300px 0px'});
 io.observe(section);
} else start();
})();
