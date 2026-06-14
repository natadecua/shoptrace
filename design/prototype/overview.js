const M=require("./components.js");
const {fs,path,icon,I,lift,insp}=M;

// ---- Rivian card skin + Reload editorial premium ----
const BG="#141416",CARD="#222226",CARD2="#2A2A2F",RAISE="#34343A",INK="#F4F3F0",SOFT="#9B9B9F",FAINT="#67676B",HAIR="rgba(255,255,255,0.055)";
const GOLD="#E7B24A",ORANGE="#F54E00",GREEN="#86C58C",BLUE="#86B7D8",LAV="#B2B4E0",RED="#E96A66";
const card=(r=24,x="")=>`border-radius:${r}px;background:${CARD};${x}`;
const MONO="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums";
const sc=s=>({"In Progress":LAV,"Diagnostic":BLUE,"Ready":GREEN,"Waiting":GOLD}[s]||SOFT);

const bays=[
 {id:"01",type:"sedan",plate:"NBC 4521",vehicle:"Toyota Vios",svc:"oil",state:"Oil & filter",status:"In Progress",mech:"Mike R.",eta:"on time",pct:46},
 {id:"02",type:"pickup",plate:"CAA 8830",vehicle:"Ford F-150",svc:"brake",state:"Brake pads",status:"In Progress",mech:"Alex P.",eta:"on time",pct:46},
 {id:"03",type:"compact",plate:"DAB 1190",vehicle:"Honda Civic",svc:"scan",state:"Diagnostics",status:"Diagnostic",mech:"Sarah L.",eta:"+15 late",over:true,waiting:true,pct:100,sel:true},
 {id:"04",type:"suv",plate:"ABX 7742",vehicle:"BMW X5",svc:"check",state:"Final QC",status:"Ready",mech:"Jenny T.",eta:"ready",waiting:true,pct:100},
 {id:"05",type:"sedan",plate:"TES 0003",vehicle:"Tesla 3",svc:"wrench",state:"Tire rotation",status:"In Progress",mech:"Carlo M.",eta:"on time",pct:30},
 {id:"06",type:"empty"},
];
const needs=[
 {sev:RED,reason:"Approval blocked",plate:"UVW 1123",vehicle:"Chevrolet Silverado",risk:"₱18,500",pri:"Nudge"},
 {sev:RED,reason:"Over promise",plate:"DAB 1190",vehicle:"Honda Civic",risk:"+1h15",pri:"Update"},
];
const queue=[
 {pos:1,plate:"NCD 2218",vehicle:"Mazda 3",svc:"PMS · Change Oil",wait:"25m",next:true},
 {pos:2,plate:"FRT 8821",vehicle:"Honda CR-V",svc:"Brake inspection",wait:"12m"},
 {pos:3,plate:"JKL 2093",vehicle:"Toyota Vios",svc:"Aircon service",wait:"6m"},
];
const ready=[{plate:"ABX 7742",vehicle:"BMW X5",sub:"QC done · lobby"}];

function plate(p,big){return `<span style="display:inline-block;border-radius:5px;padding:${big?"2px 8px":"1px 6px"};${MONO};font-size:${big?13:11.5}px;font-weight:600;letter-spacing:0.02em;background:#E9E9EC;color:#1A1A1C;white-space:nowrap;flex-shrink:0">${p}</span>`;}
function rivPill(status){const c=sc(status);return `<span style="display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 11px;font-size:11px;font-weight:600;color:${c};background:${c}1c"><span style="width:6px;height:6px;border-radius:50%;background:${c}"></span>${status}</span>`;}
function label(t){return `<span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${FAINT}">${t}</span>`;}

// ---- LEFT spine ----
function needCard(n){return `<div style="${card(16)};padding:16px;background:${CARD2}">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px"><span style="font-size:11px;font-weight:600;color:${n.sev}">${n.reason}</span><span style="${MONO};font-size:14px;font-weight:600;color:${n.sev}">${n.risk}</span></div>
  <div style="display:flex;align-items:center;gap:7px;margin-bottom:14px">${plate(n.plate)}<span style="font-size:14px;font-weight:600">${n.vehicle}</span></div>
  <div style="display:flex;gap:8px"><button style="flex:1;border-radius:12px;height:42px;font-size:13px;font-weight:600;color:#fff;background:${ORANGE};border:none">${n.pri}</button><button style="flex:1;border-radius:12px;height:42px;font-size:13px;font-weight:500;color:${INK};background:${RAISE};border:none">Call</button></div></div>`;}
function qRow(q){const long=parseInt(q.wait)>=20;return `<div style="display:flex;align-items:center;gap:13px;padding:11px 2px"><span style="display:grid;width:30px;height:30px;flex-shrink:0;place-items:center;border-radius:9px;${MONO};font-size:12px;font-weight:600;color:${long?GOLD:SOFT};background:${(long?GOLD:SOFT)}18">${q.pos}</span><div style="min-width:0;flex:1"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.vehicle}</div><div style="font-size:11.5px;color:${SOFT};margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.svc}</div></div><div style="text-align:right;flex-shrink:0"><div style="${MONO};font-size:12px;font-weight:600;color:${long?GOLD:SOFT}">${q.wait}</div>${q.next?`<div style="font-size:10px;font-weight:600;color:${GREEN};margin-top:2px">→ Bay 06</div>`:""}</div></div>`;}
function pillRow(ic,t,v,c){return `<div style="display:flex;align-items:center;gap:11px;padding:11px 2px"><span style="display:grid;width:30px;height:30px;flex-shrink:0;place-items:center;border-radius:9px;background:${c}18;color:${c}">${icon(ic,"h-4 w-4")}</span><span style="flex:1;font-size:13.5px;font-weight:500">${t}</span><span style="font-size:12px;color:${SOFT};${MONO}">${v}</span></div>`;}

// ---- open-floor bay (borderless, floating soft HUDs over a seamless floor) ----
function bay(b){
  const glass="background:rgba(16,16,19,0.62);border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(10px)";
  if(b.type==="empty")return `<div style="position:relative;height:100%;min-height:208px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:120px;font-weight:600;color:#fff;opacity:0.04">06</div>
    <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;align-items:center;justify-content:space-between;z-index:3;border-radius:13px;padding:8px 11px;${glass}">${label("Bay 06")}<span style="font-size:11px;font-weight:600;color:${GOLD}">Open · idle 25m</span></div>
    <div style="width:88%;opacity:0.5">${lift({type:"sedan",svc:"",over:false})}</div>
    <button style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:3;display:inline-flex;align-items:center;gap:6px;border-radius:13px;padding:0 18px;height:42px;font-size:13px;font-weight:600;color:${INK};${glass}">${icon(I.plus,"h-4 w-4")}Assign Mazda 3</button></div>`;
  const c=sc(b.status),eC=b.over?RED:b.status==="Ready"?GREEN:SOFT;
  const selRing=b.sel?`box-shadow:0 0 0 1.5px rgba(255,255,255,0.45)`:"";
  return `<div style="position:relative;height:100%;min-height:208px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:120px;font-weight:600;color:#fff;opacity:0.04">${b.id}</div>
    ${b.over?`<div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:90%;height:58%;border-radius:50%;background:radial-gradient(closest-side,${RED}22,transparent 70%)"></div>`:""}
    <div style="position:absolute;top:10px;left:10px;right:10px;z-index:3;border-radius:13px;padding:9px 11px;${glass};${selRing}">
      <div style="display:flex;align-items:center;justify-content:space-between">${rivPill(b.status)}${label("Bay "+b.id)}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:8px">${plate(b.plate)}<span style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.vehicle}</span></div>
    </div>
    <div style="width:100%;transform:scale(1.05)">${lift({type:b.type,svc:b.svc,over:b.over})}</div>
    <div style="position:absolute;bottom:10px;left:10px;right:10px;z-index:3;border-radius:13px;padding:9px 11px;${glass}">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:6px"><span style="display:grid;width:21px;height:21px;place-items:center;border-radius:50%;font-size:10px;font-weight:700;background:${c}28;color:${INK}">${b.mech[0]}</span><span style="font-size:11.5px;color:${SOFT}">${b.mech.split(" ")[0]}</span>${b.waiting?`<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;color:${GOLD}">${icon(I.armchair,"h-3 w-3")}Lobby</span>`:""}</div>
        <span style="${MONO};font-size:11.5px;font-weight:600;color:${eC}">${b.eta}</span>
      </div>
      <div style="margin-top:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden"><div style="height:100%;width:${b.pct}%;border-radius:2px;background:${b.over?RED:c}"></div></div>
    </div>
  </div>`;
}

// ---- RIGHT inspector ----
function readout(l,v,c){return `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid ${HAIR}"><span style="font-size:13px;color:${SOFT}">${l}</span><span style="font-size:15px;font-weight:500;color:${c||INK};${MONO}">${v}</span></div>`;}
function inspector(){const i=insp,done=i.steps.filter(s=>s.done).length,tot=i.steps.length,rem=i.steps.filter(s=>!s.done);
  return `<div style="${card()};width:354px;flex-shrink:0;align-self:flex-start;padding:24px;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">${label("Bay 03")}<span style="display:grid;width:28px;height:28px;place-items:center;border-radius:9px;color:${SOFT};background:${CARD2}">${icon(I.x,"h-4 w-4")}</span></div>
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px">${plate(i.plate,true)}<span style="font-size:23px;font-weight:500;letter-spacing:-0.02em">${i.vehicle}</span></div>
    <div style="font-size:13px;color:${SOFT};margin-bottom:16px">${i.mech} · Bay ${i.bay}</div>
    <div style="display:flex;gap:4px;margin-bottom:9px">${i.stages.map((s,ix)=>`<div style="flex:1;height:4px;border-radius:2px;background:${ix<i.stageIdx?GREEN:ix===i.stageIdx?BLUE:"rgba(255,255,255,0.1)"}"></div>`).join("")}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px"><span style="font-size:13px;font-weight:500">${i.stages[i.stageIdx]}<span style="color:${FAINT}"> → ${i.stages[i.stageIdx+1]}</span></span><span style="border-radius:999px;padding:3px 10px;font-size:10px;font-weight:700;letter-spacing:0.05em;color:#fff;background:${RED}">OVERDUE +15</span></div>
    ${readout("Promised","11:00a")}${readout("ETA","11:15a · +15 late",GOLD)}${readout("Parts","On hand",GREEN)}${readout("Customer","Waiting in lobby",GOLD)}
    <div style="display:flex;align-items:center;gap:10px;margin:16px 0;border-radius:14px;padding:12px 14px;background:${CARD2}"><span style="color:${BLUE}">${icon(I.link,"h-5 w-5")}</span><div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600">Customer link</div><div style="font-size:11px;color:${SOFT}">${i.custView}</div></div><button style="border-radius:10px;padding:0 12px;height:32px;font-size:12px;font-weight:500;color:${INK};background:${RAISE};border:none">Preview</button></div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">${label(i.job)}<span style="margin-left:auto;${MONO};font-size:12px;font-weight:600">${done}/${tot}</span></div>
    <div style="font-size:10px;font-weight:600;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:7px">${rem.length} remaining</div>
    ${rem.map(s=>`<div style="display:flex;align-items:center;gap:11px;padding:5px 0"><span style="width:15px;height:15px;flex-shrink:0;border-radius:50%;border:1.5px solid rgba(255,255,255,0.22)"></span><span style="font-size:13px">${s.t}</span></div>`).join("")}
    <div style="margin-top:20px"><div style="font-size:13px;color:${SOFT};line-height:1.5;margin-bottom:12px">"${i.nbaPreview}"</div>
      <button style="display:flex;width:100%;align-items:center;justify-content:center;gap:9px;border-radius:16px;height:54px;font-size:16px;font-weight:600;color:#fff;background:${ORANGE};border:none">${icon(I.msg,"h-5 w-5")}${i.nba}</button>
      <div style="display:flex;gap:10px;margin-top:11px"><button style="flex:1;border-radius:14px;height:46px;font-size:13px;font-weight:500;color:${INK};background:${CARD2};border:none">Call</button><button style="flex:1;border-radius:14px;height:46px;font-size:13px;font-weight:500;color:${INK};background:${CARD2};border:none">Move ETA</button></div>
    </div></div>`;}

function ubtn(ic,active){return `<div style="display:grid;width:46px;height:46px;place-items:center;border-radius:14px;${active?`background:${RAISE};color:${INK}`:`color:${SOFT}`}">${icon(ic,"h-6 w-6")}</div>`;}
function sPill(a,b){return `<div style="display:flex;align-items:center;gap:10px;border-radius:16px;padding:9px 16px;background:${CARD}"><span style="font-size:17px;font-weight:600;${MONO}">${a}</span><span style="font-size:12px;color:${SOFT}">${b}</span></div>`;}

function shell(b){return `<!doctype html><html><head><meta charset="utf-8"/><link rel="stylesheet" href="./out.css"/>
<style>
@font-face{font-family:'GeistV';font-weight:100 900;font-display:block;src:url('./node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2') format('woff2');}
@font-face{font-family:'InterV';font-weight:100 900;font-display:block;src:url('./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2') format('woff2');}
html,body{margin:0}*{font-family:'GeistV','InterV',system-ui,sans-serif;box-sizing:border-box;font-feature-settings:"tnum","lnum";-webkit-font-smoothing:antialiased}
h1,h2{letter-spacing:-0.025em}
body{background:${BG};color:${INK}}</style></head><body>${b}</body></html>`;}

const body=`<div style="min-height:100vh;display:flex;flex-direction:column">
  <header style="display:flex;align-items:flex-end;justify-content:space-between;padding:30px 30px 22px">
    <div><h1 style="font-size:34px;font-weight:500;margin:0;line-height:1">Shop Overview</h1><div style="font-size:14px;color:${SOFT};margin-top:9px">Southside Auto · Sunday, June 7 · 2:30 PM</div></div>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;width:250px;gap:10px;border-radius:15px;background:${CARD};padding:0 16px;height:48px;color:${SOFT}">${icon(I.search,"h-5 w-5")}<span style="font-size:13px">Search plate, RO, customer…</span></div>
      <button style="display:inline-flex;align-items:center;gap:8px;border-radius:15px;height:48px;padding:0 20px;font-size:14px;font-weight:600;color:#fff;background:${ORANGE};border:none">${icon(I.plus,"h-4 w-4")}New RO</button>
    </div>
  </header>

  <div style="flex:1;display:flex;gap:18px;padding:0 30px 18px">
    <!-- spine -->
    <div style="${card()};width:322px;flex-shrink:0;padding:22px;display:flex;flex-direction:column;gap:6px">
      <h2 style="font-size:20px;font-weight:500;margin:0 0 6px">Today</h2>
      <div style="margin-bottom:6px">${label("Needs you · 2")}</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">${needs.map(needCard).join("")}</div>
      <div style="border-top:1px solid ${HAIR};padding-top:12px">${label("In queue · 3")}${queue.map(qRow).join("")}</div>
      <div style="border-top:1px solid ${HAIR};padding-top:8px">${label("Ready · 1")}${pillRow(I.check,"BMW X5 · lobby","Release",GREEN)}${label("Waiting parts · 1")}${pillRow(I.alert,"Toyota Hilux","held 2h",GOLD)}</div>
    </div>

    <!-- OPEN FLOOR (hero) -->
    <div style="${card()};flex:1;min-width:0;padding:22px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><h2 style="font-size:20px;font-weight:500;margin:0">Shop Floor</h2><span style="display:inline-flex;align-items:center;gap:8px;font-size:12px;color:${GREEN}"><span style="width:7px;height:7px;border-radius:50%;background:${GREEN}"></span>5 on the lifts</span></div>
      <div style="flex:1;border-radius:18px;background:radial-gradient(130% 90% at 50% 0%,#1B1B1F,#101012 70%);padding:6px;overflow:hidden"><div style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:4px;height:100%">${bays.map(bay).join("")}</div></div>
    </div>

    ${inspector()}
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 30px 22px">
    ${sPill("Open","5 bays active")}
    <div style="display:flex;align-items:center;gap:8px;border-radius:20px;background:${CARD};padding:7px 12px">${ubtn(I.gauge,true)}${ubtn(I.orders)}${ubtn(I.floor)}${ubtn(I.customers)}${ubtn(I.calendar)}${ubtn(I.msg)}${ubtn(I.analytics)}</div>
    ${sPill("₱142k","revenue today")}
  </div>
</div>`;
fs.writeFileSync(path.join(__dirname,"index.html"),shell(body));console.log("synthesis wrote");
