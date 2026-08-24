"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { boundsFor, distance3d, floorFor, hazardWeightedDistance, objectivePoint, projectPoint, worldPoint, type WorldPoint } from "@/lib/planner/projection.mjs";

type ApiObjective = { id:string; description:string; type:string; count:number|null; coordinateStatus:"verify"|"unmapped"|"verified"; maps:{id:string;name:string}[];possibleLocations?:unknown[];zones?:unknown[] };
type ApiTask = { id:string; name:string; trader:{id:string;name:string}|null; objectives:ApiObjective[] };
type ApiMap={spawns:Array<{position:unknown;zoneName?:string}>;extracts:Array<{id:string;name:string;position:unknown;faction?:string;switches?:string[]}>;locks:Array<{id:string;lockType:string;key?:string;needsPower?:boolean;position:unknown}>;hazards:Array<{id:string;hazardType:string;name?:string;position:unknown}>};
type ApiPayload={data:ApiTask[];map:ApiMap|null;meta:{fetchedAt?:string}};
type MarkerMeta={keyId?:string;needsPower?:boolean;faction?:string;conditional?:boolean};
type SourceMarker={id:string;name:string;point:WorldPoint;meta?:MarkerMeta};
type Task = { id:string; title:string; trader:string; objective:string; zone:string; x:number; y:number; world:WorldPoint|null;floor:"B1"|"GROUND"|"UPPER";status:"READY"|"UNMAPPED"|"VERIFY"; color:string; selected:boolean };
type TacticalMarker={id:string;name:string;x:number;y:number;floor:"B1"|"GROUND"|"UPPER";world:WorldPoint;meta?:MarkerMeta};
type PlayerProfile={faction:"pmc"|"scav";keyIds:string[];allowPowered:boolean;allowConditionalExtracts:boolean};
type SquadMember = {userId?:string;displayName:string;role:string;ready:boolean;lastSeenAt?:string};
type StoredPlan = { map:string; selectedTaskIds:string[]; routeTaskIds:string[]; shareId:string;revision:number;members:SquadMember[];ownerUserId:string;currentUserId:string|null };

const initialTasks: Task[] = [
  { id:"demo-1",title:"Checking",trader:"Prapor",objective:"Machinery keyを回収し、Bronze pocket watchを確保",zone:"Customs",x:42,y:37,world:null,floor:"GROUND",status:"READY",color:"#d7ff45",selected:true },
  { id:"demo-2",title:"Delivery from the Past",trader:"Prapor",objective:"Customs officeでsecure caseを回収",zone:"Customs",x:17,y:55,world:null,floor:"GROUND",status:"READY",color:"#ffb547",selected:true },
  { id:"demo-3",title:"The Extortionist",trader:"Skier",objective:"Unknown keyでmessengerの荷物を回収",zone:"Customs",x:63,y:65,world:null,floor:"GROUND",status:"VERIFY",color:"#7dd8ff",selected:true },
];

const maps = ["Customs","Factory","Woods","Shoreline","Interchange","Reserve","Lighthouse","Streets of Tarkov","Ground Zero","The Lab"];
const colors = ["#d7ff45","#ffb547","#7dd8ff","#f47458","#c6a7ff","#7fffc1"];
function position(id:string,index:number) { let hash=0; for (const char of id) hash=(hash*31+char.charCodeAt(0))>>>0; return {x:12+(hash%73),y:18+((hash>>>8)%65),color:colors[index%colors.length]}; }
function savedIds(key:string) { try { const value=JSON.parse(localStorage.getItem(key)??"[]"); return new Set<string>(Array.isArray(value)?value:[]); } catch { return new Set<string>(); } }
function sharedIds() { try { return new Set(decodeURIComponent(window.location.hash.replace(/^#tasks=/,"" )).split(",").filter(Boolean)); } catch { return new Set<string>(); } }

const initialSquad:SquadMember[] = [
  { displayName:"GO825",role:"LEADER",ready:true },
  { displayName:"KUMA",role:"ASSAULT",ready:true },
  { displayName:"NOVA",role:"SUPPORT",ready:false },
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
  const [revision,setRevision] = useState(0);
  const revisionRef=useRef(0);
  const applyingRemote=useRef(false);
  const [canEdit,setCanEdit] = useState(true);
  const [squad,setSquad] = useState(initialSquad);
  const [ownerUserId,setOwnerUserId] = useState("");
  const [currentUserId,setCurrentUserId] = useState("");
  const [conflict,setConflict] = useState<StoredPlan|null>(null);
  const [floor,setFloor] = useState<"ALL"|"B1"|"GROUND"|"UPPER">("ALL");
  const [markers,setMarkers] = useState<{spawns:TacticalMarker[];extracts:TacticalMarker[]}>({spawns:[],extracts:[]});
  const [hazards,setHazards] = useState<TacticalMarker[]>([]);
  const [locks,setLocks] = useState<TacticalMarker[]>([]);
  const [spawnId,setSpawnId] = useState("");
  const [extractId,setExtractId] = useState("");
  const [profile,setProfile] = useState<PlayerProfile>({faction:"pmc",keyIds:[],allowPowered:false,allowConditionalExtracts:false});
  const [profileReady,setProfileReady] = useState(false);
  const [activeNav,setActiveNav] = useState("Raid plan");
  const [copied,setCopied] = useState(false);
  const [mode,setMode] = useState<"PLAN"|"LIVE">("PLAN");
  const selected = useMemo(() => tasks.filter((task) => task.selected),[tasks]);
  const currentMember=squad.find((member)=>member.userId===currentUserId);
  const isOwner=Boolean(currentUserId&&currentUserId===ownerUserId);
  const extractAvailable=(marker:TacticalMarker)=>(!marker.meta?.faction||marker.meta.faction===profile.faction||marker.meta.faction==="both")&&(!marker.meta?.conditional||profile.allowConditionalExtracts);
  const lockAvailable=(marker:TacticalMarker)=>(!marker.meta?.keyId||profile.keyIds.includes(marker.meta.keyId))&&(!marker.meta?.needsPower||profile.allowPowered);
  const chosenSpawn=markers.spawns.find((marker)=>marker.id===spawnId)??null;
  const chosenExtract=markers.extracts.find((marker)=>marker.id===extractId&&extractAvailable(marker))??null;
  const routeMeters=useMemo(()=>{const points=[chosenSpawn?.world,...selected.map((task)=>task.world),chosenExtract?.world].filter((point):point is WorldPoint=>Boolean(point));return points.slice(1).reduce((total,point,index)=>total+distance3d(points[index],point),0)},[selected,chosenSpawn,chosenExtract]);
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
    const pending=[...items.filter((task)=>task.selected)]; if (pending.length<2) return items; const route:Task[]=[];let current=chosenSpawn?.world??pending[0].world;
    while (pending.length) { let best=0; for(let index=1;index<pending.length;index++){ const cost=(task:Task)=>current&&task.world?hazardWeightedDistance(current,task.world,hazards.map((hazard)=>hazard.world)):(task.x-(route.at(-1)?.x??0))**2+(task.y-(route.at(-1)?.y??0))**2; if(cost(pending[index])<cost(pending[best])) best=index; } const next=pending.splice(best,1)[0];route.push(next);current=next.world??current; }
    const positions=items.map((task,index)=>task.selected?index:-1).filter((index)=>index>=0); const next=[...items]; positions.forEach((position,index)=>{next[position]=route[index]}); return next;
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/tarkov/tasks?lang=ja&map=${encodeURIComponent(map)}&limit=120`,{signal:controller.signal})
      .then(async (response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return await response.json() as ApiPayload; })
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
          const visual=position(objective.id,index);const world=objectivePoint(objective);const objectiveFloor=world?floorFor(world):"GROUND";
          const id=`${task.id}:${objective.id}`;
          return [{id,title:task.name,trader:task.trader?.name ?? "Unknown",objective:objective.description,zone:map,...visual,world,floor:objectiveFloor,status:objective.coordinateStatus==="unmapped"?"UNMAPPED":objective.coordinateStatus==="verified"?"READY":"VERIFY",selected:restoredIds.size?restoredIds.has(id):index<3}];
        });
        const spawnSource=(payload.map?.spawns??[]).map((entry,index):SourceMarker|null=>{const point=worldPoint(entry.position);return point?{id:`spawn-${index}`,name:entry.zoneName??"SPAWN",point}:null}).filter((entry):entry is SourceMarker=>entry!==null).slice(0,16);
        const extractSource=(payload.map?.extracts??[]).map((entry):SourceMarker|null=>{const point=worldPoint(entry.position);return point?{id:entry.id,name:entry.name,point,meta:{faction:entry.faction,conditional:Boolean(entry.switches?.length)}}:null}).filter((entry):entry is SourceMarker=>entry!==null);
        const hazardSource=(payload.map?.hazards??[]).map((entry):SourceMarker|null=>{const point=worldPoint(entry.position);return point?{id:entry.id,name:entry.hazardType??entry.name??"HAZARD",point}:null}).filter((entry):entry is SourceMarker=>entry!==null);
        const lockSource=(payload.map?.locks??[]).map((entry):SourceMarker|null=>{const point=worldPoint(entry.position);return point?{id:entry.id,name:entry.needsPower?"POWER":entry.key?"KEY":"LOCK",point,meta:{keyId:entry.key,needsPower:entry.needsPower}}:null}).filter((entry):entry is SourceMarker=>entry!==null);
        const projectionBounds=boundsFor([...next.map((task)=>task.world),...spawnSource.map((entry)=>entry.point),...extractSource.map((entry)=>entry.point),...hazardSource.map((entry)=>entry.point),...lockSource.map((entry)=>entry.point)]);
        next=next.map((task)=>task.world?{...task,...projectPoint(task.world,projectionBounds)}:task);
        const marker=(entry:SourceMarker):TacticalMarker=>({...projectPoint(entry.point,projectionBounds),id:entry.id,name:entry.name,floor:floorFor(entry.point),world:entry.point,meta:entry.meta});
        const projectedSpawns=spawnSource.map(marker),projectedExtracts=extractSource.map(marker);
        setMarkers({spawns:projectedSpawns,extracts:projectedExtracts});setHazards(hazardSource.map(marker));setLocks(lockSource.map(marker));setSpawnId(projectedSpawns[0]?.id??"");setExtractId(projectedExtracts[0]?.id??"");
        if(cloudPlan?.routeTaskIds.length){const order=new Map(cloudPlan.routeTaskIds.map((id,index)=>[id,index]));next=[...next].sort((a,b)=>(order.get(a.id)??9999)-(order.get(b.id)??9999))}
        setTasks(next); setShareId(cloudPlan?.shareId??""); revisionRef.current=cloudPlan?.revision??0; setRevision(revisionRef.current); setSquad(cloudPlan?.members??initialSquad); setOwnerUserId(cloudPlan?.ownerUserId??""); setCurrentUserId(cloudPlan?.currentUserId??""); setCanEdit(!share); setSyncMode(share?"SHARED":cloudPlan?"CLOUD":"LOCAL"); setSyncReady(true); setUpdatedAt(payload.meta?.fetchedAt ?? ""); setLoading(false);
      })
      .catch((reason) => { if (reason.name!=="AbortError") { setError("データを取得できませんでした。デモデータを表示しています。"); setTasks(initialTasks); setLoading(false); } });
    return () => controller.abort();
  },[map]);

  useEffect(() => { const requested=new URLSearchParams(window.location.search).get("map"); if(!requested||!maps.includes(requested)) return; const timer=window.setTimeout(()=>{setSyncReady(false);setLoading(true);setMap(requested)},0); return ()=>window.clearTimeout(timer); },[]);
  useEffect(()=>{const local=localStorage.getItem("trp-profile");const timer=window.setTimeout(()=>{if(local){try{setProfile(JSON.parse(local) as PlayerProfile)}catch{/* use defaults */}}},0);fetch("/api/profile").then(async(response)=>response.ok?(await response.json()).profile:null).then((cloud)=>{if(cloud)setProfile(cloud);setProfileReady(true)}).catch(()=>setProfileReady(true));return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{if(!profileReady)return;localStorage.setItem("trp-profile",JSON.stringify(profile));const timer=window.setTimeout(()=>fetch("/api/profile",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(profile)}).catch(()=>undefined),600);return()=>window.clearTimeout(timer)},[profile,profileReady]);
  useEffect(() => { if(loading) return; localStorage.setItem(`trp-plan:${map}`,JSON.stringify(tasks.filter((task)=>task.selected).map((task)=>task.id))); const show=window.setTimeout(()=>setSaved(true),0); const hide=window.setTimeout(()=>setSaved(false),900); return ()=>{window.clearTimeout(show);window.clearTimeout(hide)}; },[tasks,loading,map]);
  useEffect(() => { if(applyingRemote.current){applyingRemote.current=false;return}if(!syncReady||(syncMode==="SHARED"&&!canEdit)) return; const timer=window.setTimeout(async()=>{const route=tasks.filter((task)=>task.selected).map((task)=>task.id);try{const response=await fetch("/api/plans",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({map,selectedTaskIds:route,routeTaskIds:route,shareId:syncMode==="SHARED"?shareId:undefined,revision:revisionRef.current})});const payload=await response.json();if(response.ok){setShareId(payload.plan.shareId);revisionRef.current=payload.plan.revision;setRevision(revisionRef.current);setSquad(payload.plan.members);if(syncMode!=="SHARED")setSyncMode("CLOUD")}else if(response.status===409){setConflict(payload.plan)}}catch{if(syncMode!=="SHARED")setSyncMode("LOCAL")}},700);return()=>window.clearTimeout(timer)},[tasks,map,syncReady,syncMode,canEdit,shareId]);
  useEffect(()=>{if(syncMode!=="SHARED"||!shareId)return;let stopped=false;let timer=0;const poll=async()=>{try{const response=await fetch(`/api/plans?share=${encodeURIComponent(shareId)}`);if(response.ok){const {plan}=await response.json() as {plan:StoredPlan};setSquad(plan.members);setOwnerUserId(plan.ownerUserId);setCurrentUserId(plan.currentUserId??"");if(plan.revision!==revisionRef.current){revisionRef.current=plan.revision;setRevision(plan.revision);const order=new Map(plan.routeTaskIds.map((id,index)=>[id,index]));applyingRemote.current=true;setTasks((items)=>[...items.map((task)=>({...task,selected:plan.selectedTaskIds.includes(task.id)}))].sort((a,b)=>(order.get(a.id)??9999)-(order.get(b.id)??9999)))}}}catch{/* retry on the next adaptive interval */}finally{if(!stopped)timer=window.setTimeout(poll,document.hidden?10000:2000)}};timer=window.setTimeout(poll,2000);return()=>{stopped=true;window.clearTimeout(timer)}},[syncMode,shareId]);
  const joinSquad=async()=>{if(!shareId)return;const response=await fetch("/api/plans/join",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({shareId})});if(response.status===401){window.location.href=`/signin-with-chatgpt?return_to=${encodeURIComponent(window.location.pathname+window.location.search)}`;return}if(response.ok)setCanEdit(true)};
  const updateMember=async(body:Record<string,unknown>,method="PATCH")=>{const response=await fetch("/api/plans/join",{method,headers:{"content-type":"application/json"},body:JSON.stringify({shareId,...body})});if(response.ok&&"ready" in body)setSquad((members)=>members.map((member)=>member.userId===currentUserId?{...member,ready:Boolean(body.ready)}:member));};
  const useRemoteConflict=()=>{if(!conflict)return;revisionRef.current=conflict.revision;setRevision(conflict.revision);setSquad(conflict.members);const order=new Map(conflict.routeTaskIds.map((id,index)=>[id,index]));applyingRemote.current=true;setTasks((items)=>[...items.map((task)=>({...task,selected:conflict.selectedTaskIds.includes(task.id)}))].sort((a,b)=>(order.get(a.id)??9999)-(order.get(b.id)??9999)));setConflict(null)};
  const keepLocalConflict=()=>{if(!conflict)return;revisionRef.current=conflict.revision;setRevision(conflict.revision);setConflict(null);setTasks((items)=>[...items])};
  const toggleKey=(keyId?:string)=>{if(!keyId)return;setProfile((current)=>({...current,keyIds:current.keyIds.includes(keyId)?current.keyIds.filter((id)=>id!==keyId):[...current.keyIds,keyId]}))};

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
        <div className="summary-stat"><small>SELECTED TASKS</small><strong>{selected.length}<span> / {tasks.length}</span></strong></div><div className="summary-stat"><small>EST. ROUTE</small><strong>{routeMeters>=1000?(routeMeters/1000).toFixed(1):Math.round(routeMeters)}<span> {routeMeters>=1000?"km":"m"}</span></strong></div><div className="summary-stat"><small>SQUAD</small><strong>{squad.length}<span> / 5</span></strong></div>
        <button className="deploy"><span></span>{mode==="LIVE"?"RAID IN PROGRESS":"READY TO DEPLOY"}</button>
      </section>
      <section className="loadout-bar"><span>ROUTE PROFILE</span><label>FACTION<select value={profile.faction} onChange={(event)=>setProfile((current)=>({...current,faction:event.target.value as "pmc"|"scav"}))}><option value="pmc">PMC</option><option value="scav">SCAV</option></select></label><label><input type="checkbox" checked={profile.allowPowered} onChange={(event)=>setProfile((current)=>({...current,allowPowered:event.target.checked}))}/>POWER AVAILABLE</label><label><input type="checkbox" checked={profile.allowConditionalExtracts} onChange={(event)=>setProfile((current)=>({...current,allowConditionalExtracts:event.target.checked}))}/>CONDITIONAL EXTRACTS</label><b>{profile.keyIds.length} KEYS</b><small>鍵マーカーをクリックして所持状態を切替</small></section>

      {error&&<div className="data-alert" role="status">{error}</div>}
      {conflict&&<div className="conflict-alert" role="alert"><div><b>PLAN UPDATED BY SQUAD</b><span>別のメンバーが先に更新しました。使用する内容を選択してください。</span></div><button onClick={useRemoteConflict}>USE SQUAD VERSION</button><button onClick={keepLocalConflict}>KEEP MY VERSION</button></div>}
      <div className="planner-grid"><section className="map-panel panel"><div className="panel-head"><div><p className="eyebrow">TACTICAL OVERVIEW · WORLD COORDS</p><h2>{map} route</h2></div><div className="floor-tools">{(["ALL","B1","GROUND","UPPER"] as const).map((level)=><button key={level} className={floor===level?"on":""} onClick={()=>setFloor(level)}>{level}</button>)}</div></div>
        <div className="map-canvas" aria-label="Customs tactical map"><div className="terrain terrain-a"/><div className="terrain terrain-b"/><div className="terrain terrain-c"/><div className="road road-main"/><div className="road road-cross"/>
          <span className="zone-label z1">WEST</span><span className="zone-label z2">NORTH</span><span className="zone-label z3">SOUTH</span><span className="zone-label z4">EAST</span><svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={[chosenSpawn,...selected,chosenExtract].filter((entry):entry is TacticalMarker|Task=>Boolean(entry)&&(floor==="ALL"||entry.floor===floor)).map((entry)=>`${entry.x},${entry.y}`).join(" ")}/></svg>
          {hazards.filter((marker)=>floor==="ALL"||marker.floor===floor).map((marker)=><span key={marker.id} className="world-marker hazard-marker" style={{left:`${marker.x}%`,top:`${marker.y}%`}} title={marker.name}>!</span>)}
          {locks.filter((marker)=>floor==="ALL"||marker.floor===floor).slice(0,24).map((marker)=><button key={marker.id} className={lockAvailable(marker)?"world-marker lock-marker available":"world-marker lock-marker unavailable"} style={{left:`${marker.x}%`,top:`${marker.y}%`}} title={`${marker.name}: ${lockAvailable(marker)?"AVAILABLE":"MISSING REQUIREMENT"}`} onClick={()=>toggleKey(marker.meta?.keyId)}>K</button>)}
          {markers.spawns.filter((marker)=>floor==="ALL"||marker.floor===floor).slice(0,8).map((marker)=><button key={marker.id} className={marker.id===spawnId?"world-marker spawn-marker chosen":"world-marker spawn-marker"} style={{left:`${marker.x}%`,top:`${marker.y}%`}} title={`Spawn: ${marker.name}`} onClick={()=>setSpawnId(marker.id)}>S</button>)}
          {markers.extracts.filter((marker)=>floor==="ALL"||marker.floor===floor).map((marker)=><button key={marker.id} disabled={!extractAvailable(marker)} className={`${marker.id===extractId?"world-marker extract-marker chosen":"world-marker extract-marker"} ${extractAvailable(marker)?"available":"unavailable"}`} style={{left:`${marker.x}%`,top:`${marker.y}%`}} title={`Extract: ${marker.name} · ${extractAvailable(marker)?"AVAILABLE":"PROFILE BLOCKED"}`} onClick={()=>setExtractId(marker.id)}>E</button>)}
          {selected.filter((task)=>floor==="ALL"||task.floor===floor).map((task) => <button key={task.id} className="map-pin" style={{left:`${task.x}%`,top:`${task.y}%`,"--pin":task.color} as React.CSSProperties} title={`${task.title} · ${task.floor}`}><span>{selected.findIndex((entry)=>entry.id===task.id)+1}</span><label>{task.title}<small>{task.floor}</small></label></button>)}
          <div className="map-legend"><span><i className="dot task-dot"/>OBJECTIVE</span><span><i className="dot spawn-dot"/>SPAWN</span><span><i className="dot extract-dot"/>EXTRACT</span><span><i className="dot hazard-dot"/>DANGER</span><span><i className="dot lock-dot"/>LOCK</span></div>
        </div></section>
        <aside className="task-panel panel"><div className="panel-head"><div><p className="eyebrow">OBJECTIVES · {syncMode} {saved&&"· SAVED"}</p><h2>Task stack</h2></div><span className="task-count">{visibleTasks.length}</span></div><div className="task-search"><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="タスク・Trader・目標を検索" aria-label="タスク検索"/><span>⌕</span></div><div className="task-list">{visibleTasks.map((task) => <div key={task.id} className={task.selected?"task-card selected":"task-card"}><button className="task-main" onClick={() => toggleTask(task.id)}>
          <span className="task-index" style={{borderColor:task.color,color:task.color}}>{task.selected?selected.findIndex((t) => t.id===task.id)+1:"—"}</span><span className="task-copy"><small>{task.trader} · {task.zone}</small><b>{task.title}</b><em>{task.objective}</em></span><span className={`status ${task.status.toLowerCase()}`}>{task.status}</span><span className={task.selected?"check checked":"check"}>✓</span>
        </button>{task.selected&&<span className="route-order"><button onClick={()=>moveTask(task.id,-1)} aria-label={`${task.title}を前へ`}>↑</button><button onClick={()=>moveTask(task.id,1)} aria-label={`${task.title}を後へ`}>↓</button></span>}</div>)}{!loading&&visibleTasks.length===0&&<div className="empty-state">条件に一致するタスクはありません</div>}</div><button className="optimize" disabled={selected.length<2} onClick={optimizeRoute}><Icon name="route"/>OPTIMIZE ROUTE<span>↗</span></button></aside>
      </div>

      <section className="squad-strip panel"><div className="squad-label"><p className="eyebrow">FIRETEAM · REV {revision}</p><h2>Squad status</h2></div>{squad.slice(0,3).map((member) => <div className="member" key={member.userId??member.displayName}><span className={member.ready?"avatar ready":"avatar"}>{member.displayName.split(/\s|@/).filter(Boolean).slice(0,2).map((part)=>part[0]).join("").toUpperCase()}</span><div><b>{member.displayName}</b>{isOwner&&member.userId!==ownerUserId?<select value={member.role} onChange={(event)=>updateMember({userId:member.userId,role:event.target.value})}><option>MEMBER</option><option>SCOUT</option><option>SUPPORT</option></select>:<small>{member.role} · {member.lastSeenAt?"SYNCED":"LOCAL"}</small>}</div>{isOwner&&member.userId!==ownerUserId?<button className="member-remove" onClick={()=>updateMember({userId:member.userId},"DELETE")}>×</button>:<i className={member.ready?"signal online":"signal"}>{member.ready?"READY":"PREP"}</i>}</div>)}<div className="squad-actions">{currentMember&&<button className={currentMember.ready?"ready-toggle on":"ready-toggle"} onClick={()=>updateMember({ready:!currentMember.ready})}>{currentMember.ready?"READY":"SET READY"}</button>}<button className="invite" onClick={syncMode==="SHARED"&&!canEdit?joinSquad:share}><Icon name="plus"/>{syncMode==="SHARED"&&!canEdit?"JOIN":"INVITE"}</button></div></section>
      <footer><span>DATA SOURCE: TARKOV.DEV · {updatedAt?`UPDATED ${new Date(updatedAt).toLocaleString("ja-JP")}`:"LOCAL FALLBACK"}</span><span>UNOFFICIAL ESCAPE FROM TARKOV PLANNING TOOL</span></footer>
    </section>
  </main>;
}
