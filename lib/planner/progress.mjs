export function isTaskLocked(task,playerLevel,taskStates={}){
  return (task.minPlayerLevel??0)>playerLevel||(task.prerequisiteTaskIds??[]).some((id)=>taskStates[id]!=="completed");
}

export function isRaidCandidate(task,taskStates={},objectiveStates={}){
  if(!Object.keys(taskStates).length)return true;
  return taskStates[task.sourceTaskId]==="active"&&objectiveStates[task.objectiveId]!=="completed";
}
