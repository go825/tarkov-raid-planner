"use client";

import { useMemo, useState } from "react";

type Task = { id:number; title:string; trader:string; objective:string; zone:string; x:number; y:number; status:"READY"|"BLOCKED"|"VERIFY"; color:string; selected:boolean };

const initialTasks: Task[] = [
  { id:1,title:"Checking",trader:"Prapor",objective:"Machinery keyを回収し、Bronze pocket watchを確保",zone:"Dorms → Construction",x:42,y:37,status:"READY",color:"#d7ff45",selected:true },
  { id:2,title:"Delivery from the Past",trader:"Prapor",objective:"Customs officeでsecure caseを回収",zone:"Big Red",x:17,y:55,status:"READY",color:"#ffb547",selected:true },
  { id:3,title:"The Extortionist",trader:"Skier",objective:"Unknown keyでmessengerの荷物を回収",zone:"RUAF Roadblock",x:63,y:65,status:"VERIFY",color:"#7dd8ff",selected:true },
  { id:4,title:"Bad Rep Evidence",trader:"Prapor",objective:"Portable bunkhouse keyが必要",zone:"Factory Shacks",x:71,y:41,status:"BLOCKED",color:"#f47458",selected:false },
];

const squad = [
  { name:"GO825",role:"LEADER",tasks:3,ready:true,initials:"G8" },
  { name:"KUMA",role:"ASSAULT",tasks:2,ready:true,initials:"KM" },
  { name:"NOVA",role:"SUPPORT",tasks:1,ready:false,initials:"NV" },
];

function Icon({ name }: { name:"grid"|"target"|"map"|"users"|"settings"|"plus"|"route"|"share" }) {
  const paths = {
    grid:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    target:"M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 10a2 2 0 1 0 2 2M12 2v4M22 12h-4",
    map:"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15",
    users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    settings:"M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.37.35.71.6 1 .28.29.64.42 1 .4h.09v4H21a1.7 1.7 0 0 0-1.6.6Z",
    plus:"M12 5v14M5 12h14",route:"M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 14.5c2-4.5 4.2-5.1 6.7-5.7M18 13v7m0 0-3-3m3 3 3-3",
    share:"M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 10.5l6.8-4M8.6 13.5l6.8 4",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function Home() {
  const [tasks,setTasks] = useState(initialTasks);
  const [activeNav,setActiveNav] = useState("Raid plan");
  const [copied,setCopied] = useState(false);
  const [mode,setMode] = useState<"PLAN"|"LIVE">("PLAN");
  const selected = useMemo(() => tasks.filter((task) => task.selected),[tasks]);
  const toggleTask = (id:number) => setTasks((items) => items.map((item) => item.id === id ? {...item,selected:!item.selected} : item));
  const share = async () => { await navigator.clipboard?.writeText("TRP-CUSTOMS-042"); setCopied(true); window.setTimeout(() => setCopied(false),1800); };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand" aria-label="Tarkov Raid Planner"><span className="brand-mark">TRP</span><span className="brand-copy">TARKOV<br/><b>RAID PLANNER</b></span></div>
      <nav aria-label="Main navigation">{[
        {label:"Overview",icon:"grid"},{label:"My tasks",icon:"target"},{label:"Raid plan",icon:"map"},{label:"Party",icon:"users"}
      ].map((item) => <button key={item.label} className={activeNav===item.label?"nav-item active":"nav-item"} onClick={() => setActiveNav(item.label)}><Icon name={item.icon as "grid"}/><span>{item.label}</span>{item.label==="Raid plan"&&<i>3</i>}</button>)}</nav>
      <div className="sidebar-foot"><button className="nav-item"><Icon name="settings"/><span>Settings</span></button><div className="profile"><span>G8</span><div><b>GO825</b><small>Level 24 · USEC</small></div><em>•••</em></div></div>
    </aside>

    <section className="workspace">
      <header className="topbar"><div><p className="eyebrow">OPERATION / CUSTOMS</p><h1>Raid plan <span>01</span></h1></div><div className="top-actions">
        <div className="mode-switch"><button className={mode==="PLAN"?"on":""} onClick={() => setMode("PLAN")}>PLAN</button><button className={mode==="LIVE"?"live on":"live"} onClick={() => setMode("LIVE")}>LIVE</button></div>
        <button className="button secondary" onClick={share}><Icon name="share"/>{copied?"COPIED":"SHARE PLAN"}</button><button className="button primary"><Icon name="plus"/>NEW PLAN</button>
      </div></header>

      <section className="raid-summary"><div className="map-title"><span className="map-code">CU</span><div><p>CUSTOMS</p><small>13:28 — 15:28 · Cloudy · 18°C</small></div></div>
        <div className="summary-stat"><small>SELECTED TASKS</small><strong>{selected.length}<span> / 4</span></strong></div><div className="summary-stat"><small>EST. ROUTE</small><strong>2.4<span> km</span></strong></div><div className="summary-stat"><small>SQUAD</small><strong>3<span> / 5</span></strong></div>
        <button className="deploy"><span></span>{mode==="LIVE"?"RAID IN PROGRESS":"READY TO DEPLOY"}</button>
      </section>

      <div className="planner-grid"><section className="map-panel panel"><div className="panel-head"><div><p className="eyebrow">TACTICAL OVERVIEW</p><h2>Customs route</h2></div><div className="map-tools"><button>−</button><b>72%</b><button>＋</button></div></div>
        <div className="map-canvas" aria-label="Customs tactical map"><div className="terrain terrain-a"/><div className="terrain terrain-b"/><div className="terrain terrain-c"/><div className="road road-main"/><div className="road road-cross"/>
          <span className="zone-label z1">BIG RED</span><span className="zone-label z2">DORMS</span><span className="zone-label z3">CONSTRUCTION</span><span className="zone-label z4">RUAF</span><div className="route-line"/><div className="spawn"><i/><span>SPAWN</span></div>
          {selected.map((task,index) => <button key={task.id} className="map-pin" style={{left:`${task.x}%`,top:`${task.y}%`,"--pin":task.color} as React.CSSProperties} title={task.title}><span>{index+1}</span><label>{task.title}</label></button>)}
          <div className="extract"><i/><span>EXTRACT<br/><b>Crossroads</b></span></div><div className="map-legend"><span><i className="dot task-dot"/>OBJECTIVE</span><span><i className="dot extract-dot"/>EXTRACT</span><span><i className="line-dot"/>ROUTE</span></div>
        </div></section>
        <aside className="task-panel panel"><div className="panel-head"><div><p className="eyebrow">OBJECTIVES</p><h2>Task stack</h2></div><button className="icon-button"><Icon name="plus"/></button></div><div className="task-list">{tasks.map((task) => <button key={task.id} className={task.selected?"task-card selected":"task-card"} onClick={() => toggleTask(task.id)}>
          <span className="task-index" style={{borderColor:task.color,color:task.color}}>{task.selected?selected.findIndex((t) => t.id===task.id)+1:"—"}</span><span className="task-copy"><small>{task.trader} · {task.zone}</small><b>{task.title}</b><em>{task.objective}</em></span><span className={`status ${task.status.toLowerCase()}`}>{task.status}</span><span className={task.selected?"check checked":"check"}>✓</span>
        </button>)}</div><button className="optimize"><Icon name="route"/>OPTIMIZE ROUTE<span>↗</span></button></aside>
      </div>

      <section className="squad-strip panel"><div className="squad-label"><p className="eyebrow">FIRETEAM</p><h2>Squad status</h2></div>{squad.map((member) => <div className="member" key={member.name}><span className={member.ready?"avatar ready":"avatar"}>{member.initials}</span><div><b>{member.name}</b><small>{member.role} · {member.tasks} TASK{member.tasks>1?"S":""}</small></div><i className={member.ready?"signal online":"signal"}>{member.ready?"READY":"PREP"}</i></div>)}<button className="invite"><Icon name="plus"/>INVITE</button></section>
      <footer><span>DATA SOURCE: TARKOV.DEV · UPDATED 12 MIN AGO</span><span>UNOFFICIAL ESCAPE FROM TARKOV PLANNING TOOL</span></footer>
    </section>
  </main>;
}
