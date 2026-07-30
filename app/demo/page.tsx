'use client';

import React, { useState, useMemo } from "react";
import {
  CheckCircle2, CircleCheck, CircleAlert, XCircle, Info, ChevronDown, Eye,
  ShieldCheck, ArrowRight, Plus, X, Scale, Repeat, Wand2, Users, ClipboardCheck, GitBranch, Sparkles,
} from "lucide-react";

const TT = { blue:"#003CB4", blue700:"#002E8A", blue050:"#E8EEFB", navy:"#0A1633", ink:"#14181F", white:"#FFFFFF" };
const STATUS: Record<string, { c:string; label:string; Icon:React.ComponentType<{className?:string; "aria-hidden"?:boolean}>; hero:string }> = {
  strong:  { c:"#1E7A46", label:"Strong",  Icon:CheckCircle2, hero:"#2BD27A" },
  met:     { c:"#2E7D32", label:"Met",     Icon:CircleCheck,  hero:"#2BD27A" },
  partial: { c:"#B26A00", label:"Partial", Icon:CircleAlert,  hero:"#F5B97F" },
  gap:     { c:"#C62828", label:"Not met", Icon:XCircle,      hero:"#F58A8A" },
  info:    { c:"#5B6678", label:"N/A here", Icon:Info,        hero:"#9AA6C4" },
};
const PLABEL: Record<number, string> = { 1:"awareness", 2:"working", 3:"practitioner", 4:"expert" };
const SENRANK: Record<string, number> = { junior:1, mid:1, senior:2, lead:3 };

/* ------------------------------- SKILLS ----------------------------------- */
const SKILLS: Record<string, string> = {
  "user-research":"User research", "agile-lean":"Agile and Lean practices",
  "service-design":"Service design", "content-design":"Content design",
  "accessibility":"Inclusive design and accessibility", "welsh-language":"Welsh language service capability",
  "product-mgmt":"Product management", "stakeholder":"Stakeholder relationship management",
  "strategic-ownership":"Strategic ownership", "info-security":"Information security",
  "data-ethics":"Data ethics and privacy", "performance":"Performance analysis",
  "architecture":"Making architectural decisions", "modern-dev":"Modern development standards",
  "programming":"Programming and build", "lifecycle":"Life cycle management",
};

/* -------------------------------- ROLES ----------------------------------- */
const ROLES: Record<string, { label:string; group:string; req:[string,number][] }> = {
  "delivery-manager":   { label:"Delivery manager",       group:"Product and delivery", req:[["agile-lean",3],["stakeholder",2],["lifecycle",2]] },
  "product-manager":    { label:"Product manager",        group:"Product and delivery", req:[["product-mgmt",2],["agile-lean",2],["strategic-ownership",2]] },
  "service-owner":      { label:"Service owner",          group:"Product and delivery", req:[["strategic-ownership",2],["stakeholder",3],["lifecycle",2]] },
  "user-researcher":    { label:"User researcher",        group:"User-centred design",  req:[["user-research",3]] },
  "service-designer":   { label:"Service designer",       group:"User-centred design",  req:[["service-design",2],["content-design",2]] },
  "content-designer":   { label:"Content designer",       group:"User-centred design",  req:[["content-design",3]] },
  "accessibility-specialist":{ label:"Accessibility specialist", group:"User-centred design", req:[["accessibility",3],["user-research",2]] },
  "developer":          { label:"Software developer",     group:"Software development", req:[["programming",2],["modern-dev",2]] },
  "tech-architect":     { label:"Technical architect",    group:"Architecture",         req:[["architecture",3],["modern-dev",2]] },
  "security-architect": { label:"Security architect",     group:"Architecture",         req:[["info-security",3],["data-ethics",2]] },
  "performance-analyst":{ label:"Performance analyst",    group:"Data",                 req:[["performance",3]] },
};

/* ----------------------------- STANDARDS ---------------------------------- */
const ALL = ["discovery","alpha","beta","live"] as const;
type Phase = (typeof ALL)[number];

interface StandardPoint {
  n: number;
  title: string;
  roles: [string, number][];
  skills: [string, number, number][];
  phases: readonly string[];
  cat?: string;
  statutory?: boolean;
  comp?: boolean;
  focus?: string;
  minSen?: number;
}

const mk = (n: number, title: string, roles: [string, number][], skills: [string, number, number][], phases: readonly string[], extra: Partial<StandardPoint> = {}): StandardPoint =>
  ({ n, title, roles, skills, phases, ...extra });

const STANDARDS: Record<string, { name: string; points: StandardPoint[] }> = {
  gds: { name:"GDS Service Standard", points:[
    mk(1,"Understand users and their needs",[["user-researcher",1],["service-designer",.5],["product-manager",.5]],[["user-research",3,1]],ALL),
    mk(2,"Solve a whole problem for users",[["service-designer",1],["product-manager",1]],[["service-design",2,1]],["discovery","alpha","beta"]),
    mk(3,"Provide a joined up experience across all channels",[["service-designer",1],["content-designer",.5]],[["service-design",2,1]],["alpha","beta","live"]),
    mk(4,"Make the service simple to use",[["content-designer",1],["service-designer",.5],["user-researcher",.5]],[["content-design",2,1],["user-research",2,.5]],["alpha","beta","live"]),
    mk(5,"Make sure everyone can use the service",[["accessibility-specialist",1],["content-designer",.5]],[["accessibility",3,1]],["alpha","beta","live"]),
    mk(6,"Have a multidisciplinary team",[["delivery-manager",1],["product-manager",1]],[["agile-lean",2,1]],ALL,{comp:true}),
    mk(7,"Use agile ways of working",[["delivery-manager",1]],[["agile-lean",3,1],["lifecycle",2,.5]],ALL),
    mk(8,"Iterate and improve frequently",[["delivery-manager",1],["product-manager",1],["developer",.5]],[["agile-lean",2,1],["modern-dev",2,.5]],["alpha","beta","live"]),
    mk(9,"Create a secure service which protects users' privacy",[["security-architect",1],["tech-architect",.5]],[["info-security",3,1],["data-ethics",2,.5]],["alpha","beta","live"]),
    mk(10,"Define what success looks like and publish performance data",[["performance-analyst",1],["product-manager",.5]],[["performance",3,1]],["beta","live"]),
    mk(11,"Choose the right tools and technology",[["tech-architect",1],["developer",.5]],[["architecture",3,1],["modern-dev",2,.5]],["alpha","beta"]),
    mk(12,"Make new source code open",[["developer",1],["tech-architect",.5]],[["modern-dev",3,1],["programming",2,.5]],["alpha","beta","live"]),
    mk(13,"Use and contribute to open standards and common components",[["tech-architect",1],["content-designer",.5]],[["modern-dev",2,1],["architecture",2,.5]],["alpha","beta"]),
    mk(14,"Operate a reliable service",[["developer",1],["tech-architect",.5]],[["modern-dev",2,1]],["beta","live"]),
  ]},
  wales: { name:"Digital Service Standard for Wales", points:[
    mk(1,"Focus on the current and future wellbeing of people in Wales",[["service-owner",1],["service-designer",.5]],[["strategic-ownership",2,1]],ALL,{cat:"Meet user needs",statutory:true}),
    mk(2,"Design services in Welsh and English",[["content-designer",1],["service-designer",.5]],[["welsh-language",2,1],["content-design",3,1]],ALL,{cat:"Meet user needs",statutory:true}),
    mk(3,"Understand users and their needs",[["user-researcher",1],["service-designer",.5],["product-manager",.5]],[["user-research",3,1]],ALL,{cat:"Meet user needs"}),
    mk(4,"Provide a joined up experience",[["service-designer",1],["content-designer",.5]],[["service-design",2,1]],["alpha","beta","live"],{cat:"Meet user needs"}),
    mk(5,"Make sure everyone can use the service",[["accessibility-specialist",1],["content-designer",.5]],[["accessibility",3,1]],["alpha","beta","live"],{cat:"Meet user needs"}),
    mk(6,"Have an empowered service owner",[["service-owner",1]],[["strategic-ownership",2,1],["stakeholder",3,1]],ALL,{cat:"Create digital teams",statutory:true,focus:"service-owner",minSen:2}),
    mk(7,"Have a multidisciplinary team",[["delivery-manager",1],["product-manager",1]],[["agile-lean",2,1]],ALL,{cat:"Create digital teams",comp:true}),
    mk(8,"Iterate and improve frequently",[["delivery-manager",1],["product-manager",1],["developer",.5]],[["agile-lean",2,1],["modern-dev",2,.5]],["alpha","beta","live"],{cat:"Create digital teams"}),
    mk(9,"Work in the open",[["delivery-manager",1],["developer",.5]],[["agile-lean",2,1],["modern-dev",2,.5]],ALL,{cat:"Create digital teams"}),
    mk(10,"Use scalable technology",[["tech-architect",1],["developer",.5]],[["architecture",3,1],["modern-dev",2,.5]],["alpha","beta"],{cat:"Use the right technology"}),
    mk(11,"Consider ethics, privacy and security throughout",[["security-architect",1],["tech-architect",.5]],[["info-security",3,1],["data-ethics",3,1]],["alpha","beta","live"],{cat:"Use the right technology"}),
    mk(12,"Use data to make decisions",[["performance-analyst",1]],[["performance",3,1]],["beta","live"],{cat:"Use the right technology"}),
  ]},
};

/* ----------------------- BASE TEAM (NRW discovery) ------------------------ */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  sen: string;
  skills: Record<string, number>;
  custom?: boolean;
}

const BASE_TEAM: TeamMember[] = [
  { id:"p1", name:"Priya N.",  role:"delivery-manager", sen:"senior", skills:{ "agile-lean":4,"stakeholder":3,"lifecycle":2 } },
  { id:"p2", name:"Tom R.",    role:"product-manager",  sen:"mid",    skills:{ "product-mgmt":2,"agile-lean":2,"strategic-ownership":1 } },
  { id:"p3", name:"Sara L.",   role:"service-owner",    sen:"mid",    skills:{ "strategic-ownership":1,"stakeholder":2,"lifecycle":1 } },
  { id:"p4", name:"Alex M.",   role:"user-researcher",  sen:"mid",    skills:{ "user-research":2 } },
  { id:"p5", name:"Jo K.",     role:"service-designer", sen:"mid",    skills:{ "service-design":2,"content-design":2 } },
];

interface Move {
  label: string;
  note: string;
  add?: TeamMember;
  mod?: (t: TeamMember[]) => TeamMember[];
}

const MOVES: Record<string, Move> = {
  m_welsh: { label:"Add bilingual content capability", note:"Contract a Welsh and English content designer.",
    add:{ id:"mW", name:"Bilingual content designer", role:"content-designer", sen:"mid", skills:{ "content-design":3,"welsh-language":2,"accessibility":2 } } },
  m_so: { label:"Empower and uplift the service owner", note:"Confirm senior mandate and decision rights.",
    mod:(t)=>t.map(m=>m.role==="service-owner"?{...m,sen:"senior",skills:{...m.skills,"strategic-ownership":2,"stakeholder":3}}:m) },
  m_research: { label:"Deepen user research", note:"Bring research to practitioner level for discovery.",
    mod:(t)=>t.map(m=>m.role==="user-researcher"?{...m,skills:{...m.skills,"user-research":3}}:m) },
};

const ADD_PALETTE = ["content-designer","accessibility-specialist","developer","tech-architect","security-architect","performance-analyst"];
const templateMember = (role: string): TeamMember => {
  const skills: Record<string, number> = {}; ROLES[role].req.forEach(([s,l])=>skills[s]=l);
  return { id:"c"+role+Math.random().toString(36).slice(2,6), name:ROLES[role].label, role, sen:"mid", skills, custom:true };
};

/* ================================ ENGINE ================================== */
function skillLevel(team: TeamMember[], skillId: string){ return team.reduce((m,p)=>Math.max(m, p.skills[skillId]||0), 0); }
function skillLevelFor(team: TeamMember[], roleId: string, skillId: string){ const p=team.find(x=>x.role===roleId); return p ? (p.skills[skillId]||0) : 0; }
function match(level: number, req: number){ return level>=req ? 1 : level===req-1 ? 0.5 : 0; }

interface Line { kind: string; label: string; held: string; m: number }
interface PointResultData { status: string; na: boolean; coverage: number | null; lines: Line[] }

function pointResult(pt: StandardPoint, team: TeamMember[], phase: string): PointResultData {
  if(!pt.phases.includes(phase)) return { status:"info", na:true, coverage:null, lines:[] };
  const lines: Line[] = []; let num=0, den=0;
  pt.skills.forEach(([sk,req,w])=>{
    const lvl = pt.focus ? skillLevelFor(team, pt.focus, sk) : skillLevel(team, sk);
    const m = match(lvl, req); num+=w*m; den+=w;
    lines.push({ kind:"skill", label:`${SKILLS[sk]} \u00b7 ${PLABEL[req]}`, held: lvl?PLABEL[lvl]:"not held", m });
  });
  pt.roles.forEach(([ro,w])=>{
    const person = team.find(p=>p.role===ro);
    let m=0, held="not filled";
    if(person){
      if(pt.minSen && SENRANK[person.sen] < pt.minSen){ m=0.5; held=`${person.name} (under-levelled)`; }
      else { m=1; held=person.name; }
    }
    num+=w*m; den+=w;
    lines.push({ kind:"role", label:`${ROLES[ro].label}${pt.minSen?" (senior)":""}`, held, m });
  });
  const coverage = den? num/den : 0;
  const status = coverage>=0.85?"strong":coverage>=0.65?"met":coverage>=0.35?"partial":"gap";
  return { status, coverage, lines, na:false };
}

function assess(standardId: string, team: TeamMember[], phase: string){
  const std = STANDARDS[standardId];
  const results = std.points.map(pt=>({ pt, ...pointResult(pt, team, phase) }));
  const active = results.filter(r=>!r.na);
  const index = active.length ? Math.round(active.reduce((a,r)=>a+(r.coverage??0),0)/active.length*100) : 0;
  const statutoryAtRisk = active.filter(r=>r.pt.statutory && (r.status==="gap"||r.status==="partial")).length;
  return { results, active, index, statutoryAtRisk };
}
function personRoleFit(person: TeamMember){
  const req = ROLES[person.role].req; let num=0;
  req.forEach(([s,l])=>num+=match(person.skills[s]||0,l));
  return Math.round(num/req.length*100);
}
function neededRoles(standardId: string, phase: string){
  const set: Record<string, boolean> = {};
  STANDARDS[standardId].points.filter(p=>p.phases.includes(phase)).forEach(p=>p.roles.forEach(([r,w])=>{ if(w>=1) set[r]=true; }));
  return Object.keys(set);
}
function bandOf(v: number){ return v>=85?"Ready":v>=65?"On track":v>=40?"At risk":"Not ready"; }

/* ============================== PRIMITIVES ================================ */
function Pill({ kind, onDark }: { kind: string; onDark?: boolean }){ const s=STATUS[kind]; const I=s.Icon;
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium whitespace-nowrap"
    style={{ color: onDark?s.hero:s.c, background:`${onDark?s.hero:s.c}${onDark?"22":"14"}` }}><I className="h-3.5 w-3.5" aria-hidden/>{s.label}</span>;
}
function Working({ lines }: { lines: Line[] }){
  const [o,setO]=useState(false);
  return <div className="mt-3">
    <button onClick={()=>setO(!o)} aria-expanded={o} className="inline-flex items-center gap-1 text-[13px] font-semibold hover:underline" style={{color:TT.blue700}}>
      <Eye className="h-4 w-4" aria-hidden/>{o?"Hide working":"Show working"}<ChevronDown className={`h-4 w-4 transition-transform ${o?"rotate-180":""}`} aria-hidden/>
    </button>
    {o && <div className="mt-2 rounded-lg p-3" style={{background:"#F8FAFC",border:"1px solid #E5E9EF"}}>
      <table className="w-full text-[13px]"><thead><tr className="text-left" style={{color:"#6B7280"}}>
        <th className="pb-1 font-medium">Requirement</th><th className="pb-1 font-medium">What the team holds</th><th className="pb-1 font-medium">Match</th></tr></thead>
        <tbody>{lines.map((l,i)=>(<tr key={i} style={{borderTop:"1px solid #E5E9EF"}}>
          <td className="py-1.5 pr-3">{l.label}</td><td className="py-1.5 pr-3">{l.held}</td>
          <td className="py-1.5"><Pill kind={l.m>=1?"met":l.m>0?"partial":"gap"}/></td></tr>))}</tbody></table>
    </div>}
  </div>;
}
const Card = ({children,className="",style={}}: {children: React.ReactNode; className?: string; style?: React.CSSProperties}) =>
  <div className={`rounded-2xl bg-white ${className}`} style={{border:"1px solid #E5E9EF",boxShadow:"0 1px 2px rgba(0,0,0,.04)",...style}}>{children}</div>;

/* ================================= APP ==================================== */
const TABS = [
  { id:"readiness", label:"Readiness", Icon:ClipboardCheck },
  { id:"team", label:"Team and fit", Icon:Users },
  { id:"composition", label:"Composition", Icon:GitBranch },
  { id:"adaptation", label:"Adaptation", Icon:Sparkles },
];

export default function Assemble(){
  const [standardId,setStandard]=useState("wales");
  const [phase,setPhase]=useState<Phase>("discovery");
  const [applied,setApplied]=useState<Set<string>>(new Set());
  const [custom,setCustom]=useState<TeamMember[]>([]);
  const [tab,setTab]=useState("readiness");

  const team = useMemo(()=>{
    let t=[...BASE_TEAM,...custom];
    [...applied].forEach(id=>{ const mv=MOVES[id]; if(mv?.add) t=[...t,mv.add]; if(mv?.mod) t=mv.mod(t); });
    return t;
  },[applied,custom]);

  const { results, active, index, statutoryAtRisk } = useMemo(()=>assess(standardId,team,phase),[standardId,team,phase]);
  const metCount = active.filter(r=>r.status==="met"||r.status==="strong").length;
  const attention = active.length-metCount;

  const toggleMove=(id: string)=>setApplied(s=>{ const n=new Set(s); if(n.has(id)) n.delete(id); else n.add(id); return n; });
  const addMember=(role: string)=>setCustom(c=>[...c,templateMember(role)]);
  const removeMember=(id: string)=>setCustom(c=>c.filter(m=>m.id!==id));

  const needed = neededRoles(standardId,phase);

  return (
    <div style={{background:"#F8FAFC",minHeight:"100vh",color:TT.ink,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .display{font-family:'Archivo',system-ui,sans-serif;letter-spacing:-0.02em}
        body{font-feature-settings:"tnum" 1}
        *:focus-visible{outline:2px solid ${TT.blue};outline-offset:2px;border-radius:4px}
      `}</style>

      {/* ---------------------------- HERO ---------------------------- */}
      <header style={{background:TT.navy,color:TT.white}}>
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="display text-[17px] font-extrabold tracking-tight">Turner &amp; Townsend</span>
            <span className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{background:TT.blue}}>Assemble</span>
          </div>
          <span className="text-[12px]" style={{color:"#9AA6C4"}}>Service standard assurance accelerator</span>
        </div>

        <div className="mx-auto max-w-[1100px] px-6 pb-12 pt-6">
          <div className="grid items-center gap-8 md:grid-cols-[1.05fr,0.95fr]">
            <div>
              <h1 className="display text-[38px] font-extrabold leading-[1.06]">
                We show our working.<br/><span style={{color:"#7FA3F5"}}>Live, against every point of the standard.</span>
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed" style={{color:"#C7D2EC"}}>
                Change the standard, the phase or the team and the assessment recomputes in front of you. Every score
                opens to its reasoning. Gaps are named honestly, with the move that closes them.
              </p>
              <div className="mt-5 flex flex-wrap gap-4">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{color:"#9AA6C4"}}>Standard</div>
                  <div className="flex gap-1 rounded-lg p-1" style={{background:"rgba(255,255,255,0.07)"}}>
                    {(["wales","gds"] as const).map(s=>(
                      <button key={s} onClick={()=>setStandard(s)} className="rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors"
                        style={{background:standardId===s?TT.blue:"transparent",color:TT.white}}>{s==="wales"?"Wales":"GDS"}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{color:"#9AA6C4"}}>Phase</div>
                  <div className="flex gap-1 rounded-lg p-1" style={{background:"rgba(255,255,255,0.07)"}}>
                    {ALL.map(p=>(
                      <button key={p} onClick={()=>setPhase(p)} className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold capitalize transition-colors"
                        style={{background:phase===p?TT.blue:"transparent",color:TT.white}}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)"}}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{color:"#9AA6C4"}}>Preparedness Index</div>
                <span className="inline-flex items-center gap-1 text-[11px]" style={{color:"#7FA3F5"}}><ShieldCheck className="h-3.5 w-3.5"/>live</span>
              </div>
              <div className="mt-2 flex items-end gap-3">
                <div className="display text-[64px] font-extrabold leading-none transition-all">{index}</div>
                <div className="pb-2">
                  <div className="text-[15px] font-semibold" style={{color:STATUS[index>=85?"strong":index>=65?"met":index>=40?"partial":"gap"].hero}}>{bandOf(index)}</div>
                  <div className="text-[12px]" style={{color:"#9AA6C4"}}>{STANDARDS[standardId].name}</div>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full" style={{background:"rgba(255,255,255,0.12)"}}>
                <div className="h-full rounded-full transition-all duration-500" style={{width:`${index}%`,background:"linear-gradient(90deg,#7FA3F5,#2BD27A)"}}/>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {([["points met",metCount,null],["to close",attention,null],["statutory at risk",statutoryAtRisk,statutoryAtRisk?"#F5B97F":null]] as const).map(([l,v,col])=>(
                  <div key={String(l)} className="rounded-lg py-2" style={{background:"rgba(255,255,255,0.04)"}}>
                    <div className="display text-[20px] font-bold" style={{color:col||"inherit"}}>{v}</div>
                    <div className="text-[11px]" style={{color:"#9AA6C4"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------- TABS --------------------------- */}
      <div className="mx-auto max-w-[1100px] px-6">
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b" style={{borderColor:"#E5E9EF"}}>
          {TABS.map(({id,label,Icon})=>{ const a=tab===id;
            return <button key={id} role="tab" aria-selected={a} onClick={()=>setTab(id)}
              className="flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors"
              style={{color:a?TT.ink:"#6B7280",borderBottom:a?`2px solid ${TT.blue}`:"2px solid transparent",marginBottom:-1}}>
              <Icon className="h-4 w-4" aria-hidden/>{label}</button>; })}
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] px-6 py-8">
        {/* READINESS */}
        {tab==="readiness" && (()=>{
          const cats = standardId==="wales"
            ? [...new Set(STANDARDS.wales.points.map(p=>p.cat))].map(c=>({cat:c,rows:results.filter(r=>r.pt.cat===c)}))
            : [{cat:null as string|null,rows:results}];
          return <div className="space-y-7">
            {cats.map(({cat,rows})=>(
              <div key={cat||"all"}>
                {cat && <h2 className="display mb-3 text-[18px] font-bold">{cat}</h2>}
                <div className="space-y-3">{rows.map(r=>(
                  <Card key={r.pt.n} className="p-5" style={r.pt.statutory&&(r.status==="gap"||r.status==="partial")?{borderColor:STATUS.partial.c+"66"}:{}}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-semibold" style={{color:"#6B7280"}}>Point {r.pt.n}</span>
                          {r.pt.statutory && <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{background:TT.navy,color:"white"}}>Statutory</span>}
                          {r.pt.comp && <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{background:TT.blue050,color:TT.blue700}}>Team breadth</span>}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold">{r.pt.title}</div>
                        {r.na ? <p className="mt-1 text-[13px]" style={{color:"#9AA6C4"}}>Not assessed at {phase} phase. Becomes relevant later.</p>
                              : <Working lines={r.lines}/>}
                      </div>
                      <Pill kind={r.status}/>
                    </div>
                  </Card>
                ))}</div>
              </div>
            ))}
          </div>;
        })()}

        {/* TEAM AND FIT */}
        {tab==="team" && <div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {team.map(m=>{ const fit=personRoleFit(m);
              return <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[14px] font-semibold">{m.name}</div>
                    <div className="text-[12px]" style={{color:"#6B7280"}}>{ROLES[m.role].label} &middot; {m.sen}</div>
                  </div>
                  {m.custom && <button onClick={()=>removeMember(m.id)} aria-label="Remove" className="rounded p-1 hover:bg-[#F2F5F9]"><X className="h-4 w-4" style={{color:"#9AA6C4"}}/></button>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(m.skills).map(([s,l])=>(
                    <span key={s} className="rounded px-1.5 py-0.5 text-[11px]" style={{background:"#F2F5F9",color:"#3A4150"}}>{SKILLS[s]} {PLABEL[l]}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full" style={{background:"#E5E9EF"}}>
                    <div className="h-full rounded-full" style={{width:`${fit}%`,background:fit>=65?STATUS.met.c:STATUS.partial.c}}/>
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums">{fit}% fit</span>
                </div>
              </Card>;
            })}
          </div>
          <Card className="p-4">
            <div className="mb-2 text-[13px] font-semibold">Add a missing role and watch the index move</div>
            <div className="flex flex-wrap gap-2">
              {ADD_PALETTE.map(r=>(
                <button key={r} onClick={()=>addMember(r)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium" style={{border:"1px solid #E5E9EF",color:TT.blue700}}>
                  <Plus className="h-3.5 w-3.5"/>{ROLES[r].label}
                </button>
              ))}
            </div>
          </Card>
        </div>}

        {/* COMPOSITION */}
        {tab==="composition" && <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left" style={{background:"#F2F5F9",color:"#6B7280"}}>
              <th className="px-5 py-3 font-medium">Role needed at {phase}</th><th className="px-5 py-3 font-medium">Coverage</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
            <tbody>{needed.map(r=>{
              const person=team.find(p=>p.role===r); const fit=person?personRoleFit(person):0;
              const status=!person?"gap":fit>=65?"met":"partial";
              return <tr key={r} style={{borderTop:"1px solid #E5E9EF"}}>
                <td className="px-5 py-3 font-medium">{ROLES[r].label}</td>
                <td className="px-5 py-3" style={{color:"#6B7280"}}>{person?`${person.name} \u00b7 ${fit}% fit`:"Not on team"}</td>
                <td className="px-5 py-3"><Pill kind={status}/></td></tr>;
            })}</tbody>
          </table>
        </Card>}

        {/* ADAPTATION */}
        {tab==="adaptation" && <div className="space-y-4">
          <Card className="p-5" style={{background:TT.blue050,border:"none"}}>
            <div className="flex items-start gap-2">
              <Wand2 className="mt-0.5 h-5 w-5 shrink-0" style={{color:TT.blue}}/>
              <div className="text-[13px]" style={{color:TT.ink}}>
                These are the highest-impact moves for the current standard and phase. Apply one and the Preparedness Index above
                recomputes immediately. This is the edge: we know exactly what closes the gap, before an assessment tells us.
              </div>
            </div>
          </Card>
          {Object.entries(MOVES).map(([id,mv])=>{ const on=applied.has(id);
            return <Card key={id} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{mv.label}</div>
                  <p className="mt-1 text-[13px]" style={{color:"#6B7280"}}>{mv.note}</p>
                </div>
                <button onClick={()=>toggleMove(id)} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                  style={on?{background:TT.blue050,color:TT.blue700}:{background:TT.blue,color:"white"}}>
                  {on?<><CircleCheck className="h-4 w-4"/>Applied</>:<>Apply<ArrowRight className="h-4 w-4"/></>}
                </button>
              </div>
            </Card>;
          })}
        </div>}

        {/* HONEST DIFFERENCE */}
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {([[Eye,"We show our working","Every score traces to the standard and opens to its reasoning. No black box, so anyone in the room can check it."],
            [Scale,"We assess ourselves the same way","We hold our own teams to the standard we apply to anyone, gaps named openly, with the move that closes each one."],
            [Repeat,"Built to hand over","The same instrument can be run by the client, so the rigour stays after we leave. Capability, not dependency."]] as const).map(([I,t,b])=>(
            <Card key={t} className="p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg" style={{background:TT.blue050}}><I className="h-5 w-5" style={{color:TT.blue}}/></div>
              <h3 className="display mt-3 text-[15px] font-bold">{t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{color:"#6B7280"}}>{b}</p>
            </Card>
          ))}
        </section>

        <footer className="mt-8 border-t pt-5 text-[12px]" style={{borderColor:"#E5E9EF",color:"#9AA6C4"}}>
          Demonstration build with a representative subset of the DDaT roles and skills. DDaT Capability Framework and GDS Service Standard
          under the Open Government Licence v3.0; Wales standard credited to the Centre for Digital Public Services. Advisory tool, supports
          human judgement, makes no hiring decision, uses no protected characteristics. &copy; 2026 Turner &amp; Townsend.
        </footer>
      </main>
    </div>
  );
}
