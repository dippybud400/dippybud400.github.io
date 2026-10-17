const T=RAW.map(([eq,pj,g,e,p,gf,gc,pts],i)=>({eq,pj,g,e,p,gf,gc,pts,dg:gf-gc,pos:i+1}));
const ME=T.find(t=>t.eq==="Millonarios");
const $=s=>document.querySelector(s);
let sortK="pos",sortD=1,filt="all",sel="Deportivo Cali";

/* Tema */
const root=document.documentElement;
try{const s=localStorage.getItem("th");if(s)root.dataset.theme=s}catch(e){}
$("#theme").onclick=()=>{const d=(root.dataset.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"))==="dark"?"light":"dark";root.dataset.theme=d;try{localStorage.setItem("th",d)}catch(e){}};

/* Tarjetas con conteo */
const cut=T[7].pts;
const cards=[["Posición",ME.pos,"º"],["Puntos",ME.pts,""],["Dif. de gol",ME.dg,""],["Sobre el corte",ME.pts-cut,""]];
$("#stats").innerHTML=cards.map(([l,v,s])=>`<div class="stat"><b data-v="${v}" data-s="${s}">0</b><span>${l}</span></div>`).join("");
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
document.querySelectorAll(".stat b").forEach(el=>{const v=+el.dataset.v,s=el.dataset.s,fmt=n=>(v>0&&el.parentNode.textContent.includes("Dif")?"+":"")+n+s;
  if(reduce){el.textContent=fmt(v);return}let t0;const step=t=>{t0=t0||t;const k=Math.min((t-t0)/700,1);el.textContent=fmt(Math.round(v*k));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});

/* Tabla */
const cols=[["pos","#"],["eq","Equipo"],["pts","Pts"],["pj","PJ"],["g","G"],["e","E"],["p","P"],["gf","GF"],["gc","GC"],["dg","DG"]];
function rows(){
  let r=T.filter(t=>t.eq.toLowerCase().includes($("#q").value.toLowerCase()));
  if(filt==="top8")r=r.filter(t=>t.pos<=8);
  if(filt==="near")r=r.filter(t=>Math.abs(t.pos-ME.pos)<=3);
  return r.sort((a,b)=>{const x=a[sortK],y=b[sortK];return (typeof x==="string"?x.localeCompare(y):x-y)*sortD});
}
function drawTable(){
  $("#tbl").innerHTML="<thead><tr>"+cols.map(([k,l])=>`<th data-k="${k}">${l}${sortK===k?(sortD>0?" ▲":" ▼"):""}</th>`).join("")+"</tr></thead><tbody>"+
  rows().map(t=>`<tr data-e="${t.eq}" class="${t===ME?"me ":""}${t.eq===sel?"sel ":""}${t.pos===8&&sortK==="pos"?"cut":""}"><td>${t.pos}</td><td>${t.eq}</td><td><b>${t.pts}</b></td><td>${t.pj}</td><td>${t.g}</td><td>${t.e}</td><td>${t.p}</td><td>${t.gf}</td><td>${t.gc}</td><td>${t.dg>0?"+":""}${t.dg}</td></tr>`).join("")+"</tbody>";
}
$("#tbl").onclick=e=>{
  const th=e.target.closest("th");
  if(th){const k=th.dataset.k;sortD=sortK===k?-sortD:(k==="eq"||k==="pos"||k==="gc"?1:-1);sortK=k;drawTable();return}
  const tr=e.target.closest("tbody tr");
  if(tr&&tr.dataset.e!=="Millonarios"){sel=tr.dataset.e;$("#cmpSel").value=sel;drawTable();drawCmp()}
};
$("#q").oninput=drawTable;
document.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{filt=b.dataset.f;document.querySelectorAll("[data-f]").forEach(x=>x.classList.toggle("on",x===b));drawTable()});

/* Comparador */
$("#cmpSel").innerHTML=T.filter(t=>t!==ME).map(t=>`<option>${t.eq}</option>`).join("");
$("#cmpSel").value=sel;
$("#cmpSel").onchange=e=>{sel=e.target.value;drawTable();drawCmp()};
function drawCmp(){
  const o=T.find(t=>t.eq===sel);
  const m=[["Puntos","pts"],["Ganados","g"],["Goles a favor","gf"],["Goles en contra","gc"],["Dif. de gol","dg"]];
  $("#cmp").innerHTML=`<div class="cmp"><span></span><b>Millonarios</b><b>${o.eq}</b></div>`+m.map(([l,k])=>{
    const a=ME[k],b=o[k],mx=Math.max(Math.abs(a),Math.abs(b),1);
    return `<div class="cmp"><span class="mut">${l}</span><div><div class="track"><div class="fill" style="width:${Math.max(Math.abs(a)/mx*100,4)}%"></div></div><small>${a}</small></div><div><div class="track"><div class="fill b" style="width:${Math.max(Math.abs(b)/mx*100,4)}%"></div></div><small>${b}</small></div></div>`}).join("");
}

/* Simulador: solo compara contra los puntos actuales del resto */
function drawSim(o){
  const pts=ME.pts+o,rank=1+T.filter(t=>t!==ME&&t.pts>pts).length;
  $("#simOut").textContent=`${pts} pts · puesto ${rank}º`;
  $("#simNote").textContent=(rank<=8?"Dentro de la zona de clasificación. ":"Fuera de la zona de clasificación. ")+"Proyección simple: usa los puntos actuales de los demás y no cuenta sus partidos pendientes ni los desempates.";
}
document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-o]").forEach(x=>x.classList.toggle("on",x===b));drawSim(+b.dataset.o)});

/* Resultados */
function drawRes(f){
  $("#res").innerHTML=RES.filter(r=>f==="all"||r.o===f).map(r=>`<div class="res"><span><b>Fecha ${r.f}</b> · vs ${r.r}<br><span class="mut">${r.v}</span></span><span><b>${r.s}</b></span><span class="badge ${r.o}">${r.o}</span></div>`).join("")||'<div class="mut">Sin resultados en este filtro.</div>';
}
document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-r]").forEach(x=>x.classList.toggle("on",x===b));drawRes(b.dataset.r)});

/* Balance */
const tot=ME.pj;
$("#bal").innerHTML=[["Ganados",ME.g,"var(--g)"],["Empatados",ME.e,"var(--e)"],["Perdidos",ME.p,"var(--p)"]].map(([l,v,c])=>`<div class="bar"><span>${l}</span><div class="track"><div class="fill" style="background:${c}" data-w="${v/tot*100}"></div></div><b>${v}</b></div>`).join("")+`<div class="mut">Goles: ${ME.gf} a favor · ${ME.gc} en contra</div>`;
requestAnimationFrame(()=>document.querySelectorAll("[data-w]").forEach(el=>el.style.width=el.dataset.w+"%"));

drawTable();drawCmp();drawSim(1);drawRes("all");
