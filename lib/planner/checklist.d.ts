export type ChecklistItem={id:string;taskId:string;label:string;kind:"level"|"key"|"equipment"|"raid"|"item";status:"READY"|"MISSING"|"IN RAID";optional:boolean;foundInRaid?:boolean;keyIds?:unknown[]};
export function buildChecklist(tasks:any[],profile?:{keyIds:string[];playerLevel:number}):ChecklistItem[];
