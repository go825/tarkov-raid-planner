import { getTarkovTasks, type GameMode } from "@/lib/tarkov/service";

const MODES = new Set<GameMode>(["regular", "pve", "pvp-season"]);
const LOCALE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedMode = url.searchParams.get("mode") ?? "regular";
  const locale = url.searchParams.get("lang") ?? "ja";
  if (!MODES.has(requestedMode as GameMode) || !LOCALE_PATTERN.test(locale)) {
    return Response.json({ error: "Invalid mode or language" }, { status: 400 });
  }

  const requestedLimit = Number(url.searchParams.get("limit") ?? 100);
  const limit = Number.isFinite(requestedLimit) ? Math.min(500, Math.max(1, Math.trunc(requestedLimit))) : 100;
  const mapFilter = url.searchParams.get("map")?.toLowerCase();
  try {
    const payload = await getTarkovTasks(requestedMode as GameMode, locale);
    const tasks = mapFilter
      ? payload.tasks.filter((task) => task.objectives.some((objective: any) =>
          objective.maps.some((map: any) => map.id?.toLowerCase() === mapFilter || map.name?.toLowerCase() === mapFilter),
        ))
      : payload.tasks;
    return Response.json(
      { data: tasks.slice(0, limit), meta: { ...payload.meta, total: tasks.length, limit } },
      { headers: { "cache-control": "public, max-age=300, s-maxage=43200, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("Tarkov data request failed", error);
    return Response.json({ error: "Tarkov data is temporarily unavailable" }, { status: 503 });
  }
}
