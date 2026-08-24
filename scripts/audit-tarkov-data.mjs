const BASE_URL = process.env.TARKOV_JSON_BASE_URL ?? "https://json.tarkov.dev";
const GAME_MODE = process.argv[2] ?? "regular";
const MODES = new Set(["regular", "pve", "pvp-season"]);

if (!MODES.has(GAME_MODE)) {
  throw new Error(`Unsupported game mode: ${GAME_MODE}`);
}

async function get(path) {
  const response = await fetch(`${BASE_URL}/${GAME_MODE}/${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload?.data || typeof payload.data !== "object") {
    throw new Error(`${path}: missing data envelope`);
  }
  return payload;
}

function values(record) {
  return record && typeof record === "object" ? Object.values(record) : [];
}

function hasCoordinates(objective) {
  const locations = Array.isArray(objective.possibleLocations)
    ? objective.possibleLocations
    : [];
  if (locations.some((location) => Array.isArray(location.positions) && location.positions.length > 0)) {
    return true;
  }
  const zones = Array.isArray(objective.zones) ? objective.zones : [];
  return zones.some((zone) => zone?.position || (Array.isArray(zone?.outline) && zone.outline.length > 0));
}

const [tasksEnvelope, mapsEnvelope] = await Promise.all([get("tasks"), get("maps")]);
const tasks = values(tasksEnvelope.data.tasks);
const maps = values(mapsEnvelope.data.maps);
const objectives = tasks.flatMap((task) => Array.isArray(task.objectives) ? task.objectives : []);
const mappable = objectives.filter((objective) => Array.isArray(objective.maps) && objective.maps.length > 0);
const positioned = objectives.filter(hasCoordinates);

const types = new Map();
for (const objective of objectives) {
  const current = types.get(objective.type) ?? { total: 0, withCoordinates: 0 };
  current.total += 1;
  if (hasCoordinates(objective)) current.withCoordinates += 1;
  types.set(objective.type, current);
}

const report = {
  source: BASE_URL,
  gameMode: GAME_MODE,
  fetchedAt: new Date().toISOString(),
  tasks: tasks.length,
  maps: maps.length,
  objectives: objectives.length,
  mappableByMap: mappable.length,
  withCoordinates: positioned.length,
  allCoveragePercent: Number((100 * positioned.length / Math.max(1, objectives.length)).toFixed(1)),
  mappableCoveragePercent: Number((100 * positioned.length / Math.max(1, mappable.length)).toFixed(1)),
  byType: Object.fromEntries([...types.entries()].sort((a, b) => b[1].total - a[1].total)),
};

console.log(JSON.stringify(report, null, 2));
