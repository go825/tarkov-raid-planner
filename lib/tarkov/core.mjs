const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function values(record) {
  return isObject(record) ? Object.values(record) : [];
}

export function translateTree(value, primary = {}, fallback = {}) {
  if (typeof value === "string") {
    if (Object.hasOwn(primary, value)) return primary[value];
    if (Object.hasOwn(fallback, value)) return fallback[value];
    return value;
  }
  if (Array.isArray(value)) return value.map((entry) => translateTree(entry, primary, fallback));
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, translateTree(entry, primary, fallback)]),
  );
}

export function mergePatch(base, patch) {
  if (patch === undefined) return structuredClone(base);
  if (Array.isArray(base) && isObject(patch)) {
    const additions = Array.isArray(patch.$add) ? patch.$add : [];
    return [
      ...base.map((entry) => {
        const id = isObject(entry) ? entry.id : undefined;
        return id && Object.hasOwn(patch, id) ? mergePatch(entry, patch[id]) : structuredClone(entry);
      }),
      ...structuredClone(additions),
    ];
  }
  if (!isObject(base) || !isObject(patch)) return structuredClone(patch);
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(patch)) {
    if (key === "$add") continue;
    result[key] = Object.hasOwn(result, key) ? mergePatch(result[key], value) : structuredClone(value);
  }
  return result;
}

function applyTaskLayer(tasks, layer = {}) {
  const patches = isObject(layer.tasks) ? layer.tasks : {};
  const additions = isObject(layer.tasksAdd) ? layer.tasksAdd : {};
  const result = { ...tasks };
  for (const [id, patch] of Object.entries(patches)) {
    if (result[id]) result[id] = mergePatch(result[id], patch);
  }
  for (const [id, task] of Object.entries(additions)) result[id] = structuredClone(task);
  return result;
}

export function applyTaskOverlay(tasks, overlay, mode, locale) {
  let result = structuredClone(tasks);
  result = applyTaskLayer(result, overlay);
  result = applyTaskLayer(result, overlay?.modes?.[mode]);
  result = applyTaskLayer(result, overlay?.locales?.[locale]);
  return result;
}

export function hasCoordinates(objective) {
  const locations = Array.isArray(objective?.possibleLocations) ? objective.possibleLocations : [];
  if (locations.some((location) => Array.isArray(location?.positions) && location.positions.length > 0)) return true;
  const zones = Array.isArray(objective?.zones) ? objective.zones : [];
  return zones.some((zone) => zone?.position || (Array.isArray(zone?.outline) && zone.outline.length > 0));
}

const RAID_WIDE_TYPES = new Set(["shoot", "kill", "extract", "experience", "skill"]);
export function objectiveMapScope(objective) {
  const maps = Array.isArray(objective?.maps) ? objective.maps : [];
  if (maps.length > 1) return "multiple";
  if (maps.length === 1) return "specific";
  return RAID_WIDE_TYPES.has(objective?.type) ? "any" : "none";
}

export function objectiveMatchesMap(objective, mapFilter) {
  const scope = objectiveMapScope(objective);
  if (scope === "any") return true;
  if (scope === "none") return false;
  const requested = String(mapFilter).toLowerCase();
  return objective.maps.some((map) => (typeof map === "string" ? map : map.id)?.toLowerCase() === requested || (typeof map === "object" ? map.name : "")?.toLowerCase() === requested);
}

export function normalizeTasks(taskRecord, mapRecord) {
  const mapNames = new Map(values(mapRecord).map((map) => [map.id, map.name]));
  return values(taskRecord).map((task) => ({
    id: task.id,
    name: task.name,
    minPlayerLevel: task.minPlayerLevel ?? 0,
    prerequisiteTaskIds: (Array.isArray(task.taskRequirements ?? task.requirements) ? (task.taskRequirements ?? task.requirements) : []).map((requirement) => typeof requirement === "string" ? requirement : requirement?.task?.id ?? requirement?.task ?? requirement?.id).filter(Boolean),
    trader: task.trader ? { id: task.trader.id, name: task.trader.name } : null,
    wikiLink: task.wikiLink ?? null,
    objectives: (Array.isArray(task.objectives) ? task.objectives : []).map((objective) => ({
      id: objective.id,
      type: objective.type,
      description: objective.description,
      count: objective.count ?? null,
      optional: Boolean(objective.optional),
      maps: (Array.isArray(objective.maps) ? objective.maps : []).map((map) => ({
        id: typeof map === "string" ? map : map.id,
        name: typeof map === "string" ? (mapNames.get(map) ?? map) : map.name,
      })),
      mapScope: objectiveMapScope(objective),
      possibleLocations: objective.possibleLocations ?? [],
      zones: objective.zones ?? [],
      items: objective.items ?? [],
      requiredKeys: objective.requiredKeys ?? [],
      markerItem: objective.markerItem ?? null,
      usingWeapon: objective.usingWeapon ?? [],
      wearing: objective.wearing ?? [],
      foundInRaid: Boolean(objective.foundInRaid),
      coordinateStatus: hasCoordinates(objective) ? "verify" : "unmapped",
    })),
  }));
}
