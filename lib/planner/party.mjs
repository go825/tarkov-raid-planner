export function buildPartyDashboard(tasks,members){
  const groups=new Map(),mapStats=new Map();
  for(const member of members){
    for(const task of tasks){
      if(member.taskStates?.[task.id]!=="active")continue;
      for(const objective of task.objectives??[]){
        if(member.objectiveStates?.[objective.id]==="completed")continue;
        const key=objective.id;const existing=groups.get(key)??{id:key,taskId:task.id,taskName:task.name,description:objective.description,type:objective.type,mapScope:objective.mapScope,maps:objective.maps??[],owners:[]};
        existing.owners.push({userId:member.userId,displayName:member.displayName,color:member.color});groups.set(key,existing);
        const maps=objective.mapScope==="any"?["Any map"]:(objective.maps??[]).map((map)=>map.name);
        for(const map of maps){const stat=mapStats.get(map)??{map,objectiveIds:new Set(),ownerIds:new Set()};stat.objectiveIds.add(objective.id);stat.ownerIds.add(member.userId);mapStats.set(map,stat)}
      }
    }
  }
  const any=mapStats.get("Any map");if(any)for(const [name,entry] of mapStats)if(name!=="Any map"){for(const id of any.objectiveIds)entry.objectiveIds.add(id);for(const id of any.ownerIds)entry.ownerIds.add(id)}
  const source=[...mapStats.values()].filter((entry)=>entry.map!=="Any map"||mapStats.size===1);const recommendations=source.map((entry)=>({map:entry.map,objectiveCount:entry.objectiveIds.size,memberCount:entry.ownerIds.size,score:entry.objectiveIds.size+entry.ownerIds.size*2,objectiveIds:[...entry.objectiveIds]})).sort((a,b)=>b.score-a.score||b.objectiveCount-a.objectiveCount||a.map.localeCompare(b.map));
  return{groups:[...groups.values()].sort((a,b)=>b.owners.length-a.owners.length||a.taskName.localeCompare(b.taskName)),recommendations};
}
