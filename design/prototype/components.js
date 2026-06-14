const fs=require("fs"), path=require("path");
const ICONROOT=path.join(__dirname,"node_modules/@phosphor-icons/core/assets");
function icon(name,cls){const m=cls.match(/h-(\d+)/);const px=m?parseInt(m[1],10)*4:16;const bold=px<=13;const file=path.join(ICONROOT,bold?"bold":"regular",name+(bold?"-bold":"")+".svg");let s=fs.readFileSync(file,"utf8");return s.replace("<svg ",`<svg class="${cls}" width="${px}" height="${px}" `).trim();}
function phInner(name,weight="regular"){let s=fs.readFileSync(path.join(ICONROOT,weight,name+(weight==="regular"?"":"-"+weight)+".svg"),"utf8");return s.replace(/<svg[^>]*>/,"").replace("</svg>","");}
const I={gauge:"gauge",orders:"clipboard-text",floor:"garage",customers:"users",calendar:"calendar-blank",calendar2:"calendar-blank",analytics:"chart-bar",settings:"gear",bell:"bell",search:"magnifying-glass",plus:"plus",wrench:"wrench",droplet:"drop",disc:"disc",check:"check-circle",scan:"pulse",alert:"warning",arrow:"arrow-right",sun:"sun",phone:"phone",money:"money",armchair:"armchair",msg:"chat-text",link:"link",clock:"clock",userplus:"user-plus",x:"x",camera:"camera",eye:"eye",chevup:"caret-up",chevright:"caret-right",grip:"dots-six-vertical"};
const BG="#0D0E12",INK="#F4F5F7",SOFT="#9A9EA7",FAINT="#686B73",PLATEINK="#15161A",CTAINK="#14151A";
// Cursor traits ported to dark: one scarce orange + AI-timeline pastels for stages
const ORANGE="#F54E00",ORANGEA="#D04200";
const TL={thinking:"#DFA88F",grep:"#9FC9A2",read:"#9FBBE0",edit:"#C0A8DD",done:"#C08532"};
const C={prog:TL.grep,diag:TL.read,wait:TL.thinking,ready:TL.done,sched:"#8A8E97"};
const RED="#E23E66"; // cursor semantic-error, lifted for dark legibility
const MONO='ui-monospace,"JetBrains Mono",SFMono-Regular,Menlo,monospace';
const sc=s=>({"In Progress":C.prog,"Diagnostic":C.diag,"Waiting":C.wait,"Ready":C.ready,"Scheduled":C.sched}[s]||C.sched);
// hairline-only depth, no UI drop shadows (Apple: shadow is reserved for the "product")
function surf(r=14,extra=""){return `border-radius:${r}px;background:#171A20;border:1px solid rgba(255,255,255,0.08);${extra}`;}
// the single scarce brand CTA, pill (Uber/Apple action signature)
function btnOrange(label,ic,full){return `<button style="display:inline-flex;${full?"width:100%;":""}align-items:center;justify-content:center;gap:7px;border-radius:9999px;padding:0 20px;height:40px;font-size:14px;font-weight:500;color:#fff;background:${ORANGE};border:1px solid ${ORANGE}">${ic?icon(ic,"h-4 w-4"):""}${label}</button>`;}
function btnGhost(label,ic){return `<button style="display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:8px;padding:0 14px;height:38px;font-size:13px;font-weight:500;color:${INK};background:transparent;border:1px solid rgba(255,255,255,0.16)">${ic?icon(ic,"h-4 w-4"):""}${label}</button>`;}
function btnTone(label,ic,c,full){return `<button style="display:inline-flex;${full?"width:100%;":""}align-items:center;justify-content:center;gap:6px;border-radius:8px;padding:0 14px;height:38px;font-size:13px;font-weight:500;color:${c};background:transparent;border:1px solid ${c}55">${ic?icon(ic,"h-4 w-4"):""}${label}</button>`;}
function btnSolid(label,ic,c,full){return `<button style="display:inline-flex;${full?"width:100%;":""}align-items:center;justify-content:center;gap:6px;border-radius:8px;padding:0 14px;height:38px;font-size:13px;font-weight:600;color:#15140F;background:${c};border:1px solid ${c}">${ic?icon(ic,"h-4 w-4"):""}${label}</button>`;}
const bays=[
 {id:"01",type:"sedan",plate:"NBC 4521",vehicle:"Toyota Vios",state:"Oil & filter",svc:"oil",status:"In Progress",mech:"Mike R.",elapsed:"22m",booked:"48m",eta:"on time",progress:46},
 {id:"02",type:"pickup",plate:"CAA 8830",vehicle:"Ford F-150",state:"Brake pads",svc:"brake",status:"In Progress",mech:"Alex P.",elapsed:"41m",booked:"1h30",eta:"on time",progress:46},
 {id:"03",type:"compact",plate:"DAB 1190",vehicle:"Honda Civic",state:"Diagnostics",svc:"scan",status:"Diagnostic",mech:"Sarah L.",elapsed:"1h15",booked:"1h00",eta:"+15 late",over:true,waiting:true,progress:100,sel:true},
 {id:"04",type:"suv",plate:"ABX 7742",vehicle:"BMW X5",state:"Final QC",svc:"check",status:"Ready",mech:"Jenny T.",elapsed:"1h05",booked:"done",eta:"ready",waiting:true,progress:100},
 {id:"05",type:"sedan",plate:"TES 0003",vehicle:"Tesla Model 3",state:"Tire rotation",svc:"wrench",status:"In Progress",mech:"Carlo M.",elapsed:"12m",booked:"40m",eta:"on time",progress:30},
 {id:"06",type:"empty"},
];
const insp={bay:"03",plate:"DAB 1190",vehicle:"Honda Civic",phase:"Diagnostic",mech:"Sarah L.",promised:"11:00a",eta:"11:15a",etaDelta:"+15 late",onsite:"3h05",onsiteSub:"since 8:10a",parts:"on hand",cust:"Waiting in lobby",custView:"Viewed 9:42a · no reply",nba:"Update customer",nbaPreview:"Civic is running 15 min behind. New ETA 11:15a.",
  stages:["Check-in","Diagnose","Estimate","Approval","Repair","QC","Pickup"],stageIdx:1,
  job:"Engine diagnostics",photos:"2/3",
  steps:[{t:"Visual + fluids check",done:true},{t:"Battery & charging test",done:true},{t:"OBD scan · pull codes",done:true},{t:"Road test",done:false},{t:"Findings + estimate",done:false}],
  more:[["Approval",I.link],["Reassign",I.userplus],["Collect",I.money]]};

// 2.5D iso car built from the SAME iso-box system as the lift, so they share one projection.
// Three shaded faces (top/left/right) per volume; overdue tints the body red. Job rides as a badge.
function carG(type,job,over){
  const o={ox:92,oy:122};
  const T=over?"#F7DCDC":"#EEF0F4", L=over?"#E2B4B4":"#C7CCD5", R=over?"#C99393":"#A3A9B3"; // body
  const GT="#A6BCD0", GL="#859DB4", GR="#6B8298";                    // glass faces
  const WT="#34373E", WL="#222429", WR="#15171B";                    // tyre
  const z0=60;
  const P={
    sedan:  {bl:84, bh:10, cx:24, cl:38, ch:9,  rh:3},
    compact:{bl:70, bh:10, cx:18, cl:34, ch:10, rh:3},
    suv:    {bl:80, bh:11, cx:16, cl:48, ch:13, rh:3},
    pickup: {bl:86, bh:11, cx:14, cl:28, ch:11, rh:3, bed:true},
  }[type]||{bl:84,bh:10,cx:24,cl:38,ch:9,rh:3};
  const x0=-12, d=22;                       // start x, body depth (y)
  let s="";
  // wheels first (back ones), then body, then near wheels for correct overlap
  const wheel=(wx)=>bx(o, wx, 4, z0-9, 13, d-6, 9, WT,WL,WR);
  s+=wheel(x0+8)+wheel(x0+P.bl-17);                                            // tyres straddle full depth
  s+=bx(o, x0, 8, z0, P.bl, d, P.bh, T,L,R);                                   // body
  if(!P.bed){
    s+=bx(o, x0+P.cx, 10, z0+P.bh, P.cl, d-4, P.ch, GT,GL,GR);                 // greenhouse glass
    s+=bx(o, x0+P.cx+2, 11, z0+P.bh+P.ch, P.cl-4, d-6, P.rh, T,L,R);           // roof cap
  } else {
    s+=bx(o, x0+P.cx, 10, z0+P.bh, P.cl, d-4, P.ch, GT,GL,GR);                 // cab glass
    s+=bx(o, x0+P.cx+2, 11, z0+P.bh+P.ch, P.cl-4, d-6, P.rh, T,L,R);           // cab roof
    s+=bx(o, x0+P.cx+P.cl, 11, z0+P.bh, P.bl-P.cx-P.cl-4, d-4, 3, "#D9DCE2","#BCC0C8","#9DA2AC"); // bed rail
  }
  // job badge, flat disc floating over the front, screen-space
  const sj={oil:"drop",brake:"disc",scan:"pulse",wrench:"wrench",check:"check-circle"}[job];
  if(sj){const bg=over?"#2A1418":"#15171C",bd=over?"#FF7A7A":"#3A3D45",ic=over?"#FF9A9A":"#C9CDD4";
    s+=`<g transform="translate(120,40)"><circle r="11" fill="${bg}" stroke="${bd}" stroke-width="1.2"/><g transform="translate(-6.5,-6.5) scale(0.0508)" fill="${ic}">${phInner(sj)}</g></g>`;}
  return s;
}
function carBody(type,c,cls="h-6 w-9"){let body;if(type==="pickup")body="M6,49 C6,43 10,40 18,39 C22,30 34,26 52,25 C57,16 67,14 86,14 L104,14 C111,14 115,16 117,23 L119,31 L170,31 C172,31 173,32 173,34 L173,49 C173,52 171,53 168,53 L11,53 C8,53 6,51 6,49 Z";else if(type==="suv")body="M6,49 C6,42 10,39 18,38 C22,26 36,20 60,19 C66,11 76,9 96,9 L150,9 C160,9 166,12 168,20 C170,28 171,37 171,44 C171,47 172,48 172,49 C172,52 170,53 167,53 L11,53 C8,53 6,51 6,49 Z";else body="M6,49 C6,43 10,40 18,39 C24,28 40,23 66,22 C71,16 82,14 100,14 L126,14 C144,14 152,19 158,29 C162,33 166,38 169,44 C171,46 172,47 172,49 C172,52 170,53 167,53 L11,53 C8,53 6,51 6,49 Z";return `<svg viewBox="0 0 180 60" class="${cls}"><g transform="translate(0,-24) scale(0.5)"><path d="${body}" fill="${c}"/><circle cx="44" cy="51" r="11" fill="${c}"/><circle cx="132" cy="51" r="11" fill="${c}"/></g></svg>`;}
const K=0.866;
function iP(x,y,z,o){return [o.ox+(x-y)*K,o.oy+(x+y)*0.5-z];}
function fc(p,fill){return `<polygon points="${p.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ")}" fill="${fill}"/>`;}
function bx(o,x,y,z,w,d,h,t,l,r){const B=iP(x+w,y,z,o),Cc=iP(x+w,y+d,z,o),Bt=iP(x+w,y,z+h,o),Ct=iP(x+w,y+d,z+h,o),D=iP(x,y+d,z,o),Dt=iP(x,y+d,z+h,o),At=iP(x,y,z+h,o);return fc([B,Cc,Ct,Bt],r)+fc([D,Cc,Ct,Dt],l)+fc([At,Bt,Ct,Dt],t);}
function lift(bay,sx,tx,ty){const o={ox:92,oy:122},PT="#454A52",PL="#383D45",PR="#2B2F36";let s="";const sh=iP(34,16,0,o);const cx=sh[0],cy=sh[1]+14;s+=`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="100" ry="18" fill="#000" opacity="0.10"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="80" ry="13" fill="#000" opacity="0.20"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="60" ry="9" fill="#000" opacity="0.28"/>`;s+=bx(o,-12,9,0,9,9,118,PT,PL,PR);s+=bx(o,-12,11,116,92,5,6,"#3A3E45","#2D3138","#23262C");s+=bx(o,-1,14,52,16,4,5,PT,PL,PR);s+=bx(o,55,14,52,16,4,5,PT,PL,PR);s+=carG(bay.type,bay.svc,bay.over,sx,tx,ty);s+=bx(o,71,9,0,9,9,118,PT,PL,PR);return `<svg viewBox="0 0 200 172" class="w-full">${s}</svg>`;}
function emptyLift(){const o={ox:92,oy:122},P="#2E323A";let s="";s+=bx(o,-12,9,0,9,9,118,P,"#262A31","#1D2027");s+=bx(o,-12,11,116,92,5,6,"#2A2E35","#22252C","#191C22");s+=bx(o,71,9,0,9,9,118,P,"#262A31","#1D2027");return `<svg viewBox="0 0 200 172" class="w-full opacity-45">${s}</svg>`;}
function plate(p,big){return `<span style="display:inline-block;border-radius:4px;padding:${big?"2px 7px":"1px 6px"};font-family:${MONO};font-size:${big?12.5:11}px;font-weight:600;letter-spacing:0.03em;background:#E7E8EB;color:${PLATEINK};border:1px solid #B9BBC0;white-space:nowrap;flex-shrink:0">${p}</span>`;}
// status = tinted-ghost pastel pill (full-sat text reads on dark; faint fill), uppercase caption
function phaseChip(status){const c=sc(status);return `<span style="display:inline-flex;align-items:center;border-radius:9999px;padding:3px 9px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;color:${c};background:${c}1c;border:1px solid ${c}3a">${status}</span>`;}
// severity = alarm only (overdue/blocked), scarce
function sevPill(b){if(!b.over)return "";return `<span style="display:inline-flex;align-items:center;border-radius:9999px;padding:3px 9px;font-size:9.5px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;color:#fff;background:${RED}">OVERDUE</span>`;}
function av(ch,c,sz=20){return `<span style="display:grid;width:${sz}px;height:${sz}px;place-items:center;border-radius:50%;font-size:${sz*0.45}px;font-weight:700;background:${c}30;color:${INK};box-shadow:inset 0 0 0 1px ${c}55;flex-shrink:0">${ch}</span>`;}
function svcIc(svc){return {oil:I.droplet,brake:I.disc,scan:I.scan,wrench:I.wrench,check:I.check}[svc]||I.wrench;}
function nav(ic,label,active){if(active)return `<div style="display:flex;align-items:center;gap:12px;border-radius:14px;padding:11px 14px;background:linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05));color:${INK};box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 6px 16px -8px rgba(0,0,0,0.6)">${icon(ic,"h-5 w-5")}<span style="font-size:14px;font-weight:600">${label}</span></div>`;return `<div style="display:flex;align-items:center;gap:12px;border-radius:14px;padding:11px 14px;color:${SOFT}">${icon(ic,"h-5 w-5")}<span style="font-size:14px;font-weight:500">${label}</span></div>`;}
function pulse(label,value,color){return `<div style="display:flex;flex-direction:column;gap:3px"><span style="font-family:${MONO};font-size:18px;font-weight:500;color:${color||INK};line-height:1;font-variant-numeric:tabular-nums">${value}</span><span style="font-size:9.5px;font-weight:600;color:${FAINT};text-transform:uppercase;letter-spacing:0.08em">${label}</span></div>`;}
function htmlShell(body){return `<!doctype html><html><head><meta charset="utf-8"/><link rel="stylesheet" href="./out.css"/>
<style>
@font-face{font-family:'InterV';font-style:normal;font-weight:100 900;font-display:block;src:url('./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2') format('woff2');}
html,body{margin:0}*{font-family:'InterV',ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;font-feature-settings:"tnum","lnum","cv05","ss01";-webkit-font-smoothing:antialiased;letter-spacing:-0.006em}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0}h1,h2{letter-spacing:-0.018em}
body{background:${BG};color:${INK}}</style></head><body>${body}</body></html>`;}
module.exports={fs,path,icon,I,BG,INK,SOFT,FAINT,PLATEINK,CTAINK,ORANGE,ORANGEA,TL,MONO,C,RED,sc,surf,btnOrange,btnGhost,btnTone,btnSolid,bays,insp,carG,carBody,lift,emptyLift,plate,phaseChip,sevPill,av,svcIc,nav,pulse,htmlShell};
