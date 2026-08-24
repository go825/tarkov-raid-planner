import { applyTaskOverlay, normalizeTasks, translateTree, values } from "./core.mjs";

export type GameMode = "regular" | "pve" | "pvp-season";
export type NormalizedTask = { objectives:Array<{maps:Array<{id:string;name:string}>}>;[key:string]:unknown };
export type TarkovMap = {id:string;name:string;spawns:Array<{position:unknown;zoneName?:string}>;extracts:Array<{id:string;name:string;position:unknown}>};

type CacheEntry = { fetchedAt: string; expiresAt: number; payload: TarkovPayload };
export type TarkovPayload = {
  tasks: NormalizedTask[];
  maps: TarkovMap[];
  meta: { mode: GameMode; locale: string; fetchedAt: string; stale: boolean; overlayVersion: string | null };
};

const BASE_URL = process.env.TARKOV_JSON_BASE_URL ?? "https://json.tarkov.dev";
const OVERLAY_URL = process.env.TARKOV_OVERLAY_URL ??
  "https://cdn.jsdelivr.net/gh/tarkovtracker-org/tarkov-data-overlay@main/dist/overlay.json";
const FRESH_MS = 12 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function load(mode: GameMode, locale: string): Promise<TarkovPayload> {
  const prefix = `${BASE_URL}/${mode}`;
  const [tasks, localizedTasks, englishTasks, maps, localizedMaps, englishMaps, overlay] = await Promise.all([
    fetchJson(`${prefix}/tasks`), fetchJson(`${prefix}/tasks_${locale}`), fetchJson(`${prefix}/tasks_en`),
    fetchJson(`${prefix}/maps`), fetchJson(`${prefix}/maps_${locale}`), fetchJson(`${prefix}/maps_en`), fetchJson(OVERLAY_URL),
  ]);
  const translatedTasks = translateTree(tasks.data.tasks, localizedTasks.data, englishTasks.data);
  const translatedMaps = translateTree(maps.data.maps, localizedMaps.data, englishMaps.data);
  const mergedTasks = applyTaskOverlay(translatedTasks, overlay, mode, locale);
  return {
    tasks: normalizeTasks(mergedTasks, translatedMaps) as NormalizedTask[],
    maps: values(translatedMaps).map((value)=>{const map=value as TarkovMap;return{id:map.id,name:map.name,spawns:map.spawns??[],extracts:map.extracts??[]}}),
    meta: { mode, locale, fetchedAt: new Date().toISOString(), stale: false, overlayVersion: overlay?.$meta?.version ?? null },
  };
}

export async function getTarkovTasks(mode: GameMode, locale: string): Promise<TarkovPayload> {
  const key = `${mode}:${locale}`;
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) return existing.payload;
  try {
    const payload = await load(mode, locale);
    cache.set(key, { fetchedAt: payload.meta.fetchedAt, expiresAt: Date.now() + FRESH_MS, payload });
    return payload;
  } catch (error) {
    if (existing) return { ...existing.payload, meta: { ...existing.payload.meta, stale: true } };
    throw error;
  }
}
