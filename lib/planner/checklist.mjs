export function buildChecklist(tasks,profile={keyIds:[],playerLevel:1}) {
  const result=[];
  for(const task of tasks){
    if((task.minPlayerLevel??0)>profile.playerLevel)result.push({id:`${task.id}:level`,taskId:task.id,label:`Level ${task.minPlayerLevel} required`,kind:"level",status:"MISSING",optional:false});
    for(const objective of task.objectives??[]){
      const prefix=`${task.id}:${objective.id}`;
      for(const [groupIndex,group] of (objective.requiredKeys??[]).entries()){const keys=Array.isArray(group)?group:[group];const owned=keys.some((key)=>profile.keyIds.includes(typeof key==="string"?key:key?.id));result.push({id:`${prefix}:key:${groupIndex}`,taskId:task.id,label:`Required key · ${objective.description}`,kind:"key",status:owned?"READY":"MISSING",optional:Boolean(objective.optional),keyIds:keys});}
      if(objective.markerItem)result.push({id:`${prefix}:marker`,taskId:task.id,label:`Marker required · ${objective.description}`,kind:"equipment",status:"MISSING",optional:Boolean(objective.optional)});
      if((objective.usingWeapon??[]).length||(objective.wearing??[]).length)result.push({id:`${prefix}:loadout`,taskId:task.id,label:`Required loadout · ${objective.description}`,kind:"equipment",status:"MISSING",optional:Boolean(objective.optional)});
      if(["findItem","findQuestItem","visit","extract"].includes(objective.type))result.push({id:`${prefix}:raid`,taskId:task.id,label:objective.description,kind:"raid",status:"IN RAID",optional:Boolean(objective.optional)});
      if(["giveItem","giveQuestItem"].includes(objective.type))result.push({id:`${prefix}:items`,taskId:task.id,label:`${objective.description}${objective.count?` ×${objective.count}`:""}`,kind:"item",status:"MISSING",optional:Boolean(objective.optional),foundInRaid:Boolean(objective.foundInRaid)});
    }
  }
  return result;
}
