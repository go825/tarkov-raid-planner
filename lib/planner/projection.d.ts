export type WorldPoint={x:number;y:number;z:number};
export function worldPoint(value:unknown):WorldPoint|null;
export function objectivePoint(objective:any):WorldPoint|null;
export function boundsFor(points:(WorldPoint|null)[],padding?:number):{minX:number;maxX:number;minZ:number;maxZ:number};
export function projectPoint(point:WorldPoint,bounds:{minX:number;maxX:number;minZ:number;maxZ:number}):{x:number;y:number};
export function floorFor(point:WorldPoint):"B1"|"GROUND"|"UPPER";
export function distance3d(a:WorldPoint,b:WorldPoint):number;
export function hazardWeightedDistance(a:WorldPoint,b:WorldPoint,hazards?:WorldPoint[],radius?:number):number;
