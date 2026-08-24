export function worldPoint(value) {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 3) return { x:Number(value[0]), y:Number(value[1]), z:Number(value[2]) };
  if (typeof value === "object" && [value.x,value.y,value.z].every(Number.isFinite)) return { x:Number(value.x), y:Number(value.y), z:Number(value.z) };
  return null;
}

export function objectivePoint(objective) {
  for (const location of objective?.possibleLocations ?? []) for (const position of location?.positions ?? []) { const point=worldPoint(position); if(point) return point; }
  for (const zone of objective?.zones ?? []) { const point=worldPoint(zone?.position ?? zone?.outline?.[0]); if(point) return point; }
  return null;
}

export function boundsFor(points,padding=.08) {
  const valid=points.filter(Boolean); if(!valid.length) return {minX:-1,maxX:1,minZ:-1,maxZ:1};
  let minX=Math.min(...valid.map((p)=>p.x)),maxX=Math.max(...valid.map((p)=>p.x)),minZ=Math.min(...valid.map((p)=>p.z)),maxZ=Math.max(...valid.map((p)=>p.z));
  const padX=Math.max(1,(maxX-minX)*padding),padZ=Math.max(1,(maxZ-minZ)*padding);return {minX:minX-padX,maxX:maxX+padX,minZ:minZ-padZ,maxZ:maxZ+padZ};
}

export function projectPoint(point,bounds) { return { x:100*(point.x-bounds.minX)/Math.max(1,bounds.maxX-bounds.minX), y:100*(bounds.maxZ-point.z)/Math.max(1,bounds.maxZ-bounds.minZ) }; }
export function floorFor(point) { return point.y < -2 ? "B1" : point.y > 6 ? "UPPER" : "GROUND"; }
export function distance3d(a,b) { return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z); }
