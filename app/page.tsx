"use client";

import { useEffect, useMemo, useState } from "react";

type ApiObjective = { id:string; description:string; type:string; count:number|null; coordinateStatus:"verify"|"unmapped"|"verified"; maps:{id:string;name:string}[] };
type ApiTask = { id:string; name:string; trader:{id:string;name:string}|null; objectives:ApiObjective[] };
type Task = { id:string; title:string; trader:string; objective:string; zone:string; x:number; y:number; status:"READY"|"UNMAPPED"|"VERIFY"; color:string; selected:boolean };
type StoredPlan = { map:string; selectedTaskIds:string[]; routeTaskIds:string[]; shareId:string };

const initialTasks: Task[] = [
  { id:"demo-1",title:"Checking",trader:"Prapor",objective:"Machinery keyを回収し、Bronze pocket watchを確保",zone:"Customs",x:42,y:37,status:"READY",color:"#d7ff45",selected:true },
  { id:"demo-2",title:"Delivery from the Past",trader:"Prapor",objective:"Customs officeでsecure caseを回収",zone:"Customs",x:17,y:55,status:"READY",color:"#ffb547",selected:true },
  { id:"demo-3",title:"The Extortionist",trader:"Skier",objective:"Unknown keyでmessengerの荷物を回収",zone:"Customs",x:63,y:65,status:"VERIFY",color:"#7dd8ff",selected:true },
];

const maps = ["Customs","Factory","Woods","Shoreline","Interchange","Reserve","Lighthouse","Streets of Tarkov","Ground Zero","The Lab"];
const colors = ["#d7ff45","#ffb547","#7dd8ff","#f47458","#c6a7ff","#7fffc1"];
function position(id:string,index:number) { let hash=0; for (const char of id) hash=(hash*31+char.charCodeAt(0))>>>0; return {x:12+(hash%73),y:18+((hash>>>8)%65),color:colors[index%colors.length]}; }
function savedIds(key:string) { try { const value=JSON.parse(localStorage.getItem(key)??"[]"); return new Set<string>(Array.isArray(value)?value:[]); } catch { return new Set<string>(); } }
function sharedIds() { try { return new Set(decodeURIComponent(window.location.hash.replace(/^#tasks=/,"" )).split(",").filter(Boolean)); } catch { return new Set<string>(); } }

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
  const [map,setMap] = useState("Customs");
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [updatedAt,setUpdatedAt] = useState("");
  const [saved,setSaved] = useState(false);
  const [shareId,setShareId] = useState("");
  const [syncMode,setSyncMode] = useState<"LOCAL"|"CLOUD"|"SHARED">("LOCAL");
  const [syncReady,setSyncReady] = useState(false);
  const [activeNav,setActiveNav] = useState("Raid plan");
  const [copied,setCopied] = useState(false);
  const [mode,setMode] = useState<"PLAN"|"LIVE">("PLAN");
  const selected = useMemo(() => tasks.filter((task) => task.selected),[tasks]);
  const visibleTasks = useMemo(() => { const term=query.trim().toLowerCase(); return term ? tasks.filter((task) => `${task.title} ${task.trader} ${task.objective}`.toLowerCase().includes(term)) : tasks; },[tasks,query]);
  const toggleTask = (id:string) => setTasks((items) => items.map((item) => item.id === id ? {...item,selected:!item.selected} : item));
  const share = async () => {
    const url=new URL(window.location.href); url.hash="";
    if(shareId){url.search="";url.searchParams.set("share",shareId)}else{url.searchParams.set("map",map);url.hash=`tasks=${encodeURIComponent(selected.map((task)=>task.id).join(","))}`}
    window.history.replaceState(null,"",url); await navigator.clipboard?.writeText(url.toString()); setCopied(true); window.setTimeout(() => setCopied(false),1800);
  };
  const newPlan = () => { setTasks((items)=>items.map((task)=>({...task,selected:false}))); setQuery(""); window.history.replaceState(null,"",window.location.pathname); };
  const moveTask = (id:string,direction:-1|1) => setTasks((items) => {
    const route=items.filter((task)=>task.selected); const from=route.findIndex((task)=>task.id===id); const to=from+direction; if (from<0||to<0||to>=route.length) return items;
    [route[from],route[to]]=[route[to],route[from]]; const positions=items.map((task,index)=>task.selected?index:-1).filter((index)=>index>=0); const next=[...items]; positions.forEach((position,index)=>{next[position]=route[index]}); return next;
  });
  const optimizeRoute = () => setTasks((items) => {
    const pending=[...items.filter((task)=>task.selected)]; if (pending.length<2) return items; const route=[pending.shift()!];
    while (pending.length) { const last=route.at(-1)!; let best=0; for(let index=1;index<pending.length;index++){ const distance=(task:Task)=>(task.x-last.x)**2+(task.y-last.y)**2; if(distance(pending[index])<distance(pending[best])) best=index; } route.push(pending.splice(best,1)[0]); }
    const positions=items.map((task,index)=>task.selected?index:-1).filter((index)=>index>=0); const next=[...items]; positions.forEach((position,index)=>{next[position]=route[index]}); return next;
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/tarkov/tasks?lang=ja&map=${encodeURIComponent(map)}&limit=120`,{signal:controller.signal})
      .then(async (response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then(async (payload) => {
        const shared=sharedIds(); const stored=savedIds(`trp-plan:${map}`);
        const share=new URLSearchParams(window.location.search).get("share");
        let cloudPlan:StoredPlan|null=null;
        try { const response=await fetch(share?`/api/plans?share=${encodeURIComponent(share)}`:`/api/plans?map=${encodeURIComponent(map)}`,{signal:controller.signal}); if(response.ok) cloudPlan=(await response.json()).plan; } catch { cloudPlan=null; }
        if(cloudPlan?.map&&cloudPlan.map!==map){setSyncReady(false);setLoading(true);setMap(cloudPlan.map);return}
        const restoredIds=cloudPlan?new Set(cloudPlan.selectedTaskIds):shared.size?shared:stored;
        let next:Task[] = (payload.data as ApiTask[]).flatMap((task,index) => {
          const objective=task.objectives.find((item) => item.maps.some((entry) => entry.name.toLowerCase()===map.toLowerCase())) ?? task.objectives[0];
          if (!objective) return [];
          const visual=position(objective.id,index);
          const id=`${task.id}:${objective.id}`;
          return [{id,title:task.name,trader:task.trader?.name ?? "Unknown",objective:objective.description,zone:map,...visual,status:objective.coordinateStatus==="unmapped"?"UNMAPPED":objective.coordinateStatus==="verified"?"READY":"VERIFY",selected:restoredIds.size?restoredIds.has(id):index<3}];
        });
        if(cloudPlan?.routeTaskIds.length){const order=new Map(cloudPlan.routeTaskIds.map((id,index)=>[id,index]));next=[...next].sort((a,b)=>(order.get(a.id)??9999)-(order.get(b.id)??9999))}
        setTasks(next); setShareId(cloudPlan?.shareId??""); setSyncMode(share?"SHARED":cloudPlan?"CLOUD":"LOCAL"); setSyncReady(true); setUpdatedAt(payload.meta?.fetchedAt ?? ""); setLoading(false);
      })
      .catch((reason) => { if (reason.name!=="AbortError") { setError("データを取得できませんでした。デモデータを表示しています。"); setTasks(initialTasks); setLoading(false); } });
    return () => controller.abort();
  },[map]);

  useEffect(() => { const requested=new URLSearchParams(window.location.search).get("map"); if(!requested||!maps.includes(requested)) return; const timer=window.setTimeout(()=>{setSyncReady(false);setLoading(true);setMap(requested)},0); return ()=>window.clearTimeout(timer); },[]);
  useEffect(() => { if(loading) return; localStorage.setItem(`trp-plan:${map}`,JSON.stringify(tasks.filter((task)=>task.selected).map((task)=>task.id))); const show=window.setTimeout(()=>setSaved(true),0); const hide=window.setTimeout(()=>setSaved(false),900); return ()=>{window.clearTimeout(show);window.clearTimeout(hide)}; },[tasks,loading,map]);
  useEffect(() => { if(!syncReady||syncMode==="SHARED") return; const timer=window.setTimeout(async()=>{const route=tasks.filter((task)=>task.selected).map((task)=>task.id);try{const response=await fetch("/api/plans",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({map,selectedTaskIds:route,routeTaskIds:route})});if(response.ok){const payload=await response.json();setShareId(payload.plan.shareId);setSyncMode("CLOUD")}}catch{setSyncMode("LOCAL")}},700);return()=>window.clearTimeout(timer)},[tasks,map,syncReady,syncMode]);

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand" aria-label="Tarkov Raid Planner"><span className="brand-mark">TRP</span><span className="brand-copy">TARKOV<br/><b>RAID PLANNER</b></span></div>
      <nav aria-label="Main navigation">{[
        {label:"Overview",icon:"grid"},{label:"My tasks",icon:"target"},{label:"Raid plan",icon:"map"},{label:"Party",icon:"users"}
      ].map((item) => <button key={item.label} className={activeNav===item.label?"nav-item active":"nav-item"} onClick={() => setActiveNav(item.label)}><Icon name={item.icon as "grid"}/><span>{item.label}</span>{item.label==="Raid plan"&&<i>3</i>}</button>)}</nav>
      <div className="sidebar-foot"><a className="sync-auth" href={syncMode==="LOCAL"?"/signin-with-chatgpt?return_to=%2F":"/signout-with-chatgpt?return_to=%2F"}>{syncMode==="LOCAL"?"SIGN IN TO SYNC":"CLOUD SYNC ACTIVE"}</a><button className="nav-item"><Icon name="settings"/><span>Settings</span></button><div className="profile"><span>G8</span><div><b>GO825</b><small>{syncMode} PLAN · USEC</small></div><em>•••</em></div></div>
    </aside>

    <section className="workspace">
      <header className="topbar"><div><p className="eyebrow">OPERATION / {map.toUpperCase()}</p><h1>Raid plan <span>01</span></h1></div><div className="top-actions">
        <label className="map-select"><span>MAP</span><select value={map} onChange={(event) => {setSyncReady(false);setLoading(true);setError("");setMap(event.target.value)}}>{maps.map((name) => <option key={name}>{name}</option>)}</select></label>
        <div className="mode-switch"><button className={mode==="PLAN"?"on":""} onClick={() => setMode("PLAN")}>PLAN</button><button className={mode==="LIVE"?"live on":"live"} onClick={() => setMode("LIVE")}>LIVE</button></div>
        <button className="button secondary" onClick={share}><Icon name="share"/>{copied?"COPIED":"SHARE PLAN"}</button><button className="button primary" onClick={newPlan}><Icon name="plus"/>NEW PLAN</button>
      </div></header>

      <section className="raid-summary"><div className="map-title"><span className="map-code">{map.slice(0,2).toUpperCase()}</span><div><p>{map.toUpperCase()}</p><small>{loading?"SYNCING TARKOV DATA…":`${tasks.length} AVAILABLE OBJECTIVES`}</small></div></div>
        <div className="summary-stat"><small>SELECTED TASKS</small><strong>{selected.length}<span> / {tasks.length}</span></strong></div><div className="summary-stat"><small>MAPPED</small><strong>{tasks.filter((task)=>task.status!=="UNMAPPED").length}<span> points</span></strong></div><div className="summary-stat"><small>SQUAD</small><strong>3<span> / 5</span></strong></div>
        <button className="deploy"><span></span>{mode==="LIVE"?"RAID IN PROGRESS":"READY TO DEPLOY"}</button>
      </section>

      {error&&<div className="data-alert" role="status">{error}</div>}
      <div className="planner-grid"><section className="map-panel panel"><div className="panel-head"><div><p className="eyebrow">TACTICAL OVERVIEW</p><h2>{map} route</h2></div><div className="map-tools"><button>−</button><b>72%</b><button>＋</button></div></div>
        <div className="map-canvas" aria-label="Customs tactical map"><div className="terrain terrain-a"/><div className="terrain terrain-b"/><div className="terrain terrain-c"/><div className="road road-main"/><div className="road road-cross"/>
          <span className="zone-label z1">BIG RED</span><span className="zone-label z2">DORMS</span><span className="zone-label z3">CONSTRUCTION</span><span className="zone-label z4">RUAF</span><div className="route-line"/><div className="spawn"><i/><span>SPAWN</span></div>
          {selected.map((task,index) => <button key={task.id} className="map-pin" style={{left:`${task.x}%`,top:`${task.y}%`,"--pin":task.color} as React.CSSProperties} title={task.title}><span>{index+1}</span><label>{task.title}</label></button>)}
          <div className="extract"><i/><span>EXTRACT<br/><b>Crossroads</b></span></div><div className="map-legend"><span><i className="dot task-dot"/>OBJECTIVE</span><span><i className="dot extract-dot"/>EXTRACT</span><span><i className="line-dot"/>ROUTE</span></div>
        </div></section>
        <aside className="task-panel panel"><div className="panel-head"><div><p className="eyebrow">OBJECTIVES · {syncMode} {saved&&"· SAVED"}</p><h2>Task stack</h2></div><span className="task-count">{visibleTasks.length}</span></div><div className="task-search"><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="タスク・Trader・目標を検索" aria-label="タスク検索"/><span>⌕</span></div><div className="task-list">{visibleTasks.map((task) => <div key={task.id} className={task.selected?"task-card selected":"task-card"}><button className="task-main" onClick={() => toggleTask(task.id)}>
          <span className="task-index" style={{borderColor:task.color,color:task.color}}>{task.selected?selected.findIndex((t) => t.id===task.id)+1:"—"}</span><span className="task-copy"><small>{task.trader} · {task.zone}</small><b>{task.title}</b><em>{task.objective}</em></span><span className={`status ${task.status.toLowerCase()}`}>{task.status}</span><span className={task.selected?"check checked":"check"}>✓</span>
        </button>{task.selected&&<span className="route-order"><button onClick={()=>moveTask(task.id,-1)} aria-label={`${task.title}を前へ`}>↑</button><button onClick={()=>moveTask(task.id,1)} aria-label={`${task.title}を後へ`}>↓</button></span>}</div>)}{!loading&&visibleTasks.length===0&&<div className="empty-state">条件に一致するタスクはありません</div>}</div><button className="optimize" disabled={selected.length<2} onClick={optimizeRoute}><Icon name="route"/>OPTIMIZE ROUTE<span>↗</span></button></aside>
      </div>

      <section className="squad-strip panel"><div className="squad-label"><p className="eyebrow">FIRETEAM</p><h2>Squad status</h2></div>{squad.map((member) => <div className="member" key={member.name}><span className={member.ready?"avatar ready":"avatar"}>{member.initials}</span><div><b>{member.name}</b><small>{member.role} · {member.tasks} TASK{member.tasks>1?"S":""}</small></div><i className={member.ready?"signal online":"signal"}>{member.ready?"READY":"PREP"}</i></div>)}<button className="invite"><Icon name="plus"/>INVITE</button></section>
      <footer><span>DATA SOURCE: TARKOV.DEV · {updatedAt?`UPDATED ${new Date(updatedAt).toLocaleString("ja-JP")}`:"LOCAL FALLBACK"}</span><span>UNOFFICIAL ESCAPE FROM TARKOV PLANNING TOOL</span></footer>
    </section>
  </main>;
}
