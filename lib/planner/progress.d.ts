export function isTaskLocked(task:{minPlayerLevel?:number;prerequisiteTaskIds?:string[]},playerLevel:number,taskStates?:Record<string,string>):boolean;
export function isRaidCandidate(task:{sourceTaskId:string;objectiveId:string},taskStates?:Record<string,string>,objectiveStates?:Record<string,string>):boolean;
