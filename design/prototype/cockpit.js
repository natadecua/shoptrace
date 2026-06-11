const M=require("./components.js");
const {fs,path,icon,I,INK,SOFT,FAINT,CTAINK,ORANGE,MONO,C,RED,sc,surf,btnOrange,btnGhost,btnTone,bays,insp,lift,emptyLift,plate,phaseChip,sevPill,av,svcIc,pulse}=M;

function rail(ic,active){return active?`<div style="display:grid;width:42px;height:42px;place-items:center;border-radius:11px;background:rgba(255,255,255,0.1);color:${INK};border:1px solid rgba(255,255,255,0.12)">${icon(ic,"h-5 w-5")}</div>`:`<div style="display:grid;width:42px;height:42px;place-items:center;border-radius:11px;color:${SOFT}">${icon(ic,"h-5 w-5")}</div>`;}
function abtn(label,kind){ // pills; neutral so the lone orange CTA stays the brightest object
  if(kind==="primary")return `<button style="flex:1;display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;height:36px;font-size:13px;font-weight:500;color:${INK};background:#2A2E37;border:1px solid rgba(255,255,255,0.07)">${label}</button>`;
  if(kind==="green")return `<button style="display:inline-flex;align-items:center;gap:5px;border-radius:9999px;padding:0 15px;height:34px;font-size:12px;font-weight:500;color:${C.ready};background:transparent;border:1px solid ${C.ready}66">${icon(I.check,"h-4 w-4")}${label}</button>`;
  return `<button style="flex:1;display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;height:36px;font-size:13px;font-weight:500;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.16)">${label}</button>`;}

function needCard(n){return `<div style="${surf(11)};padding:11px 12px">
  <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px"><span style="display:inline-flex;align-items:center;border-radius:4px;padding:2px 6px 2px 5px;font-size:9.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:${n.sev};background:${n.sev}14;border:1px solid ${n.sev}2c;border-left:3px solid ${n.sev}">${n.reason}</span><span style="margin-left:auto;font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:700;color:${n.sev};font-variant-numeric:tabular-nums">${n.risk}</span></div>
  <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;overflow:hidden">${plate(n.plate)}<span style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${n.vehicle}</span><span style="color:${FAINT};flex-shrink:0">${icon(I.chevright,"h-4 w-4")}</span></div>
  <div style="display:flex;gap:6px">${abtn(n.pri,"primary")}${n.sec?abtn(n.sec,"ghost"):""}</div>
</div>`;}
function pRow(o){return `<div style="display:flex;align-items:center;gap:10px;padding:8px 6px"><span style="display:grid;width:30px;height:30px;flex-shrink:0;place-items:center;border-radius:8px;background:${o.tint}16;border:1px solid ${o.tint}2a;color:${o.tint}">${icon(o.icon,"h-4 w-4")}</span><div style="min-width:0;flex:1"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.vehicle}</div><p style="font-size:11px;color:${SOFT};margin:1px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.sub}</p></div><span style="font-family:${MONO};font-size:11px;font-weight:500;color:${o.mC||SOFT};flex-shrink:0;font-variant-numeric:tabular-nums">${o.metric}</span></div>`;}
function grp(title,count,inner,note){return `<div style="margin-bottom:2px"><div style="display:flex;align-items:center;gap:7px;padding:9px 8px 6px"><span style="font-size:10px;font-weight:700;letter-spacing:0.13em;color:${FAINT};text-transform:uppercase">${title}</span><span style="display:grid;min-width:17px;height:17px;place-items:center;border-radius:5px;padding:0 5px;font-size:10.5px;font-weight:700;color:${SOFT};background:rgba(255,255,255,0.05);font-variant-numeric:tabular-nums">${count}</span>${note?`<span style="margin-left:auto;font-size:10.5px;color:${FAINT}">${note}</span>`:""}</div>${inner}</div>`;}

function bay(b){
  if(b.type==="empty")return `<div style="position:relative;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:124px;font-weight:800;color:#fff;opacity:0.05;line-height:1;z-index:0">06</div>
    <div style="position:absolute;top:7px;left:7px;right:7px;z-index:3;display:flex;align-items:center;justify-content:space-between;border-radius:11px;padding:7px 9px;background:rgba(11,13,18,0.5);border:1px solid rgba(255,255,255,0.06)"><span style="font-size:10px;font-weight:700;color:${FAINT};letter-spacing:0.14em">BAY 06 · OPEN</span><span style="font-family:${MONO};font-size:9.5px;font-weight:600;color:${C.wait}">IDLE 25m</span></div>
    <div style="width:90%;position:relative;z-index:1;opacity:0.85">${emptyLift()}</div>
    <button style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:3;display:inline-flex;align-items:center;gap:5px;border-radius:9999px;padding:0 16px;height:36px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.82);background:rgba(11,13,18,0.6);border:1px solid rgba(255,255,255,0.18)">${icon(I.plus,"h-4 w-4")}Assign Mazda 3</button></div>`;
  const c=sc(b.status),isOver=!!b.over,isReady=b.status==="Ready",etaC=isOver?RED:isReady?C.ready:SOFT;
  const glass="background:rgba(11,13,18,0.58);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(8px)";
  const spot=b.sel?`<div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:92%;height:60%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,0.11),transparent 70%);z-index:0"></div>`:isOver?`<div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:92%;height:60%;border-radius:50%;background:radial-gradient(closest-side,${RED}24,transparent 70%);z-index:0"></div>`:"";
  const selB=b.sel?"box-shadow:0 0 0 1.5px rgba(255,255,255,0.5);":"";
  return `<div style="position:relative;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:124px;font-weight:800;color:#fff;opacity:0.05;line-height:1;z-index:0">${b.id}</div>
    ${spot}
    <div style="position:absolute;top:7px;left:7px;right:7px;z-index:3;border-radius:11px;padding:7px 9px;${glass};${selB}">
      <div style="display:flex;align-items:center;gap:5px">${phaseChip(b.status)}${sevPill(b)}<span style="margin-left:auto;font-size:10px;font-weight:700;color:${FAINT};letter-spacing:0.12em">BAY ${b.id}</span></div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:6px;overflow:hidden">${plate(b.plate)}<span style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.vehicle}</span></div>
    </div>
    <div style="width:100%;position:relative;z-index:1;transform:scale(1.07);transform-origin:50% 55%">${lift(b)}</div>
    <div style="position:absolute;bottom:7px;left:7px;right:7px;z-index:3;border-radius:11px;padding:7px 9px;${glass}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:5px">
        <div style="display:flex;align-items:center;gap:5px;min-width:0">${av(b.mech[0],c,18)}<span style="font-size:11px;color:${SOFT};white-space:nowrap">${b.mech.split(" ")[0]}</span>${b.waiting?`<span style="display:inline-flex;align-items:center;gap:2px;font-size:9.5px;font-weight:600;color:${C.wait};border-radius:5px;padding:1px 5px;border:1px solid ${C.wait}3a">${icon(I.armchair,"h-3 w-3")}Lobby</span>`:""}</div>
        <span style="font-family:${MONO};font-size:11px;font-weight:${isOver?700:600};color:${etaC}">${b.eta}</span>
      </div>
      <div style="display:flex;align-items:center;gap:7px;margin-top:6px"><div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden"><div style="height:100%;width:${b.progress}%;border-radius:2px;background:${isOver?RED:c}"></div></div><span style="font-family:${MONO};font-size:9.5px;color:${FAINT}">${b.progress}%</span></div>
    </div>
  </div>`;
}

function inspectorCol(){const i=insp;
  const done=i.steps.filter(s=>s.done).length,tot=i.steps.length,remaining=i.steps.filter(s=>!s.done);
  const div=`<div style="height:1px;background:rgba(255,255,255,0.06)"></div>`;
  const sent=`<div style="font-size:13px;color:${INK};line-height:1.5">`;
  return `<aside style="${surf(12)};width:312px;flex-shrink:0;align-self:flex-start;display:flex;flex-direction:column;overflow:hidden">
    <!-- ZONE 1 · identity -->
    <div style="padding:15px 15px 13px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><span style="font-size:10px;font-weight:600;color:${FAINT};letter-spacing:0.1em">BAY ${i.bay}</span><span style="display:grid;width:24px;height:24px;place-items:center;border-radius:7px;color:${SOFT};background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">${icon(I.x,"h-4 w-4")}</span></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${plate(i.plate,true)}<span style="font-size:21px;font-weight:700;letter-spacing:-0.02em">${i.vehicle}</span></div>
      <div style="font-size:12.5px;color:${SOFT};margin-bottom:13px">${i.mech} · Bay ${i.bay}</div>
      <div style="display:flex;gap:3px;margin-bottom:8px">${i.stages.map((st,ix)=>`<div style="flex:1;height:4px;border-radius:2px;background:${ix<i.stageIdx?C.prog:ix===i.stageIdx?C.diag:"rgba(255,255,255,0.1)"}"></div>`).join("")}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px"><span style="font-size:12.5px;font-weight:600;color:${INK}">${i.stages[i.stageIdx]}<span style="color:${FAINT};font-weight:400"> → ${i.stages[i.stageIdx+1]}</span></span><span style="display:inline-flex;align-items:center;border-radius:9999px;padding:2px 8px;font-size:9.5px;font-weight:700;letter-spacing:0.06em;color:#fff;background:${RED}">OVERDUE +15</span></div>
    </div>${div}
    <!-- ZONE 2 · operational truth (label-less, app-like) -->
    <div style="padding:13px 15px;display:flex;flex-direction:column;gap:7px">
      ${sent}${i.onsite} on site <span style="color:${FAINT}">· ${i.onsiteSub}</span></div>
      ${sent}Promised <span style="font-family:${MONO}">${i.promised}</span> · ETA <span style="font-family:${MONO}">${i.eta}</span> <span style="color:${C.wait};font-weight:600">· ${i.etaDelta}</span></div>
      ${sent}Parts <span style="color:${C.prog};font-weight:600">${i.parts}</span></div>
      <div style="font-size:13px;color:${C.wait};font-weight:600">Customer waiting in lobby</div>
    </div>${div}
    <!-- customer-link trust object -->
    <div style="padding:12px 15px">
      <div style="display:flex;align-items:center;gap:9px;border-radius:10px;padding:9px 11px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
        <span style="color:${C.read}">${icon(I.link,"h-4 w-4")}</span>
        <div style="min-width:0;flex:1"><div style="font-size:11.5px;font-weight:600;color:${INK}">Customer link</div><div style="font-size:10.5px;color:${SOFT};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.custView}</div></div>
        <button style="flex-shrink:0;display:inline-flex;align-items:center;gap:4px;border-radius:8px;padding:0 10px;height:30px;font-size:11.5px;font-weight:500;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.14)">${icon(I.eye,"h-3 w-3")}Preview</button>
      </div>
    </div>${div}
    <!-- checklist summary (remaining shown, completed collapsed) -->
    <div style="padding:12px 15px">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px"><span style="font-size:10px;font-weight:600;color:${FAINT};letter-spacing:0.088em;text-transform:uppercase">${i.job}</span><span style="margin-left:auto;font-family:${MONO};font-size:11px;font-weight:600;color:${INK}">${done}/${tot}</span><span style="display:inline-flex;align-items:center;gap:3px;font-family:${MONO};font-size:10.5px;color:${SOFT}">${icon(I.camera,"h-3 w-3")}${i.photos}</span></div>
      <div style="font-size:9.5px;font-weight:600;color:${C.wait};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:5px">${remaining.length} remaining</div>
      <div style="display:flex;flex-direction:column;gap:1px;margin-bottom:8px">${remaining.map(s=>`<div style="display:flex;align-items:center;gap:9px;padding:3px 0"><span style="width:15px;height:15px;flex-shrink:0;border-radius:50%;border:1.5px solid rgba(255,255,255,0.22)"></span><span style="font-size:12.5px;color:${INK}">${s.t}</span></div>`).join("")}</div>
      <div style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:${SOFT}"><span style="color:${C.prog}">${icon(I.check,"h-4 w-4")}</span>${done} completed<span style="margin-left:auto;color:${FAINT}">${icon(I.chevright,"h-4 w-4")}</span></div>
    </div>
    <!-- ZONE 3 · next best action -->
    <div style="padding:13px 15px;background:rgba(255,255,255,0.022);border-top:1px solid rgba(255,255,255,0.07)">
      <p style="font-size:10px;color:${FAINT};margin:0 0 7px;text-transform:uppercase;letter-spacing:0.1em">Next best action</p>
      <div style="font-size:12.5px;color:${SOFT};line-height:1.45;margin-bottom:10px">"${i.nbaPreview}"</div>
      <button style="display:flex;width:100%;align-items:center;justify-content:center;gap:7px;border-radius:9999px;height:46px;font-size:14px;font-weight:600;color:#fff;background:${ORANGE};border:1px solid ${ORANGE}">${icon(I.msg,"h-5 w-5")}${i.nba}</button>
      <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
        <button style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;border-radius:9999px;height:38px;font-size:12.5px;font-weight:500;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.14)">${icon(I.phone,"h-4 w-4")}Call</button>
        <button style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;border-radius:9999px;height:38px;font-size:12.5px;font-weight:500;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.14)">${icon(I.clock,"h-4 w-4")}Move ETA</button>
        <button style="flex-shrink:0;display:grid;width:38px;height:38px;place-items:center;border-radius:9999px;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.14)">${icon(I.grip,"h-4 w-4")}</button>
      </div>
    </div>
  </aside>`;}

const needs=[
 {reason:"Approval blocked",sev:RED,plate:"UVW 1123",vehicle:"Chevrolet Silverado",risk:"₱18,500",pri:"Nudge",sec:"Call"},
 {reason:"Over promise",sev:RED,plate:"DAB 1190",vehicle:"Honda Civic",risk:"+1h15",pri:"Update",sec:"Call"},
];
const ready=[ pRow({tint:C.ready,icon:I.check,plate:"ABX 7742",vehicle:"BMW X5",sub:"QC done · lobby",metric:"Release",mC:C.ready}) ];
// IN QUEUE = checked-in, waiting for a bay (the backlog). longest wait first.
function qRow(q){const long=parseInt(q.wait)>=20;return `<div style="display:flex;align-items:center;gap:10px;padding:8px 6px"><span style="display:grid;width:30px;height:30px;flex-shrink:0;place-items:center;border-radius:8px;font-family:${MONO};font-size:11px;font-weight:700;color:${long?C.wait:SOFT};background:${(long?C.wait:SOFT)}16;border:1px solid ${(long?C.wait:SOFT)}2a">${q.pos}</span><div style="min-width:0;flex:1"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.vehicle}</div><p style="font-size:11px;color:${SOFT};margin:1px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.svc}</p></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0"><span style="font-family:${MONO};font-size:11px;font-weight:600;color:${long?C.wait:SOFT}">${q.wait}</span>${q.next?`<button style="display:inline-flex;align-items:center;gap:3px;border-radius:9999px;padding:0 8px;height:22px;font-size:10px;font-weight:600;color:${C.ready};background:transparent;border:1px solid ${C.ready}55">${icon(I.arrow,"h-3 w-3")}Bay 06</button>`:""}</div></div>`;}
const queue=[
 qRow({pos:1,plate:"NCD 2218",vehicle:"Mazda 3",svc:"PMS · Change Oil",wait:"25m",next:true}),
 qRow({pos:2,plate:"FRT 8821",vehicle:"Honda CR-V",svc:"Brake inspection",wait:"12m"}),
 qRow({pos:3,plate:"JKL 2093",vehicle:"Toyota Vios",svc:"Aircon service",wait:"6m"}),
];
const inc=[
 pRow({tint:C.sched,icon:I.calendar,plate:"ABC 9921",vehicle:"Audi Q7",sub:"Tire Rotation · J. Cruz",metric:"1:30p"}),
 pRow({tint:C.sched,icon:I.calendar,plate:"GHJ 3340",vehicle:"Toyota Fortuner",sub:"Brake Pads · L. Reyes",metric:"3:00p"}),
];
const waiting=[ pRow({tint:C.wait,icon:I.alert,plate:"PQR 7781",vehicle:"Toyota Hilux",sub:"Brake parts · ETA tmrw",metric:"held 2h",mC:C.wait}) ];

const body=`<div style="display:flex;min-height:100vh">
  <aside style="position:sticky;top:0;height:100vh;width:68px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:5px;padding:16px 0;background:#121419;border-right:1px solid rgba(255,255,255,0.07)">
    <div style="display:grid;width:40px;height:40px;place-items:center;border-radius:11px;background:#EEEFF2;color:${CTAINK};font-size:12px;font-weight:800;margin-bottom:10px">ST</div>
    ${rail(I.gauge,true)}${rail(I.orders)}${rail(I.floor)}${rail(I.customers)}${rail(I.calendar)}${rail(I.analytics)}
    <div style="margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:6px">${rail(I.settings)}<div style="display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:${C.prog}26;color:${INK};font-size:11px;font-weight:600;border:1px solid ${C.prog}55">M</div></div>
  </aside>

  <main style="flex:1;min-width:0;padding:18px 20px">
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div><h1 style="font-size:30px;font-weight:700;letter-spacing:-0.02em;margin:0;color:${INK}">Shop Overview</h1><p style="font-size:13px;color:${SOFT};margin:4px 0 0">Southside Auto · Sun, Jun 7</p></div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="display:flex;align-items:stretch">${[["Bays","5/6",INK],["Overdue","2",RED],["At risk","₱22.7k",C.wait],["Waiting","2",C.diag]].map((k,i)=>`<div style="padding:0 18px;${i>0?"border-left:1px solid rgba(255,255,255,0.08)":""};display:flex;flex-direction:column;gap:4px;justify-content:center"><span style="font-size:9.5px;font-weight:600;letter-spacing:0.09em;text-transform:uppercase;color:${FAINT}">${k[0]}</span><span style="font-family:${MONO};font-size:23px;font-weight:600;line-height:1;color:${k[2]}">${k[1]}</span></div>`).join("")}</div>
        <div style="display:flex;align-items:center;width:210px;gap:8px;padding:0 13px;height:40px;border-radius:8px;${surf(8)};color:${SOFT}">${icon(I.search,"h-4 w-4")}<span style="font-size:13px">Search…</span></div>
        ${btnOrange("New RO",I.plus)}
      </div>
    </header>

    <div style="display:flex;gap:14px;align-items:stretch">
      <div style="${surf(13)};width:296px;flex-shrink:0;padding:7px 8px 12px;display:flex;flex-direction:column">
        <div style="padding:9px 8px 8px;display:flex;align-items:baseline;gap:8px"><h2 style="font-size:18px;font-weight:600;letter-spacing:-0.02em;margin:0">Today</h2><span style="font-size:11px;color:${FAINT}">live worklist</span></div>
        ${grp("Needs you","2",`<div style="display:flex;flex-direction:column;gap:7px;padding:0 2px">${needs.map(needCard).join("")}</div>`)}
        ${grp("In queue","3",queue.join(""),`<span style="color:${C.wait}">●</span> next bay ~15m`)}
        ${grp("Ready for pickup","1",ready.join(""))}
        ${grp("Incoming","2",inc.join(""),"later today")}
        ${grp("Waiting parts","1",waiting.join(""))}
      </div>

      <div style="flex:1;min-width:0;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 2px 12px">
          <div style="display:flex;align-items:center;gap:11px"><h2 style="font-size:19px;font-weight:600;letter-spacing:-0.02em;margin:0">Shop Floor</h2><span style="display:inline-flex;align-items:center;border-radius:9999px;padding:3px 9px;background:${C.ready};color:#1A1813;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">5 on lifts</span></div>
          <span style="font-size:11px;color:${FAINT}">job type on the car · urgency on the bay · tap to inspect →</span>
        </div>
        <div style="flex:1;border-radius:16px;background:radial-gradient(120% 80% at 50% 0%,#171B22,#0F1217 70%);border:1px solid rgba(255,255,255,0.06);padding:8px;overflow:hidden">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:6px;height:100%">${bays.map(bay).join("")}</div>
        </div>
      </div>

      ${inspectorCol()}
    </div>
  </main>
</div>`;
fs.writeFileSync(path.join(__dirname,"index.html"),M.htmlShell(body));console.log("v20 wrote");
