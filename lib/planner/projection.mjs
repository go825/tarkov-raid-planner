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

const MAP_BOUNDS={
  Factory:{x1:-67,z1:69,x2:76.6,z2:-65.5},
  Customs:{x1:698,z1:-307,x2:-371,z2:237},
  Woods:{x1:650,z1:-945,x2:-695,z2:470},
  Shoreline:{x1:506,z1:-405,x2:-1060,z2:618},
  Interchange:{x1:530,z1:-439,x2:-364,z2:452},
  "The Lab":{x1:-91,z1:-477,x2:-287,z2:-193},
  Reserve:{x1:289,z1:-338,x2:-303,z2:336},
  Lighthouse:{x1:515,z1:-1000,x2:-545,z2:725},
  "Streets of Tarkov":{x1:323,z1:-317,x2:-280,z2:549},
  "Ground Zero":{x1:249,z1:-124,x2:-99,z2:364},
};

export function mapBoundsFor(mapName,points=[]) { return MAP_BOUNDS[mapName]??boundsFor(points); }
export function projectPoint(point,bounds) {
  if("x1" in bounds){const x=100*(point.x-bounds.x1)/(bounds.x2-bounds.x1),y=100*(point.z-bounds.z1)/(bounds.z2-bounds.z1);return {x:Object.is(x,-0)?0:x,y:Object.is(y,-0)?0:y}}
  return { x:100*(point.x-bounds.minX)/Math.max(1,bounds.maxX-bounds.minX), y:100*(bounds.maxZ-point.z)/Math.max(1,bounds.maxZ-bounds.minZ) };
}
export function isOnMap(point,margin=2) { return point.x>=-margin&&point.x<=100+margin&&point.y>=-margin&&point.y<=100+margin; }
export function floorFor(point) { return point.y < -2 ? "B1" : point.y > 6 ? "UPPER" : "GROUND"; }
export function distance3d(a,b) { return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z); }
export function hazardWeightedDistance(a,b,hazards=[],radius=55) { const base=distance3d(a,b),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2};const nearby=hazards.filter((hazard)=>distance3d(mid,hazard)<radius).length;return base*(1+nearby*.45); }
