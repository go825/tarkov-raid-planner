import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers:{ accept:"text/html" } }), { ASSETS:{ fetch:async () => new Response("Not found",{status:404}) } }, { waitUntil(){},passThroughOnException(){} });
}

test("server-renders Tarkov Raid Planner", async () => {
  const response = await render();
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type") ?? "",/^text\/html\b/i);
  const html = await response.text();
  assert.match(html,/<title>Tarkov Raid Planner<\/title>/i);
  assert.match(html,/Raid plan/i);
  assert.match(html,/TACTICAL OVERVIEW/i);
  assert.match(html,/<select>[\s\S]*Customs[\s\S]*Factory[\s\S]*<\/select>/i);
  assert.match(html,/Task stack/i);
  assert.match(html,/タスク・Trader・目標を検索/i);
  assert.match(html,/SHARE PLAN/i);
  assert.match(html,/OPTIMIZE ROUTE/i);
  assert.match(html,/SIGN IN TO SYNC/i);
  assert.match(html,/FIRETEAM · REV/i);
  assert.match(html,/Squad status/i);
  assert.match(html,/WORLD COORDS/i);
  assert.doesNotMatch(html,/codex-preview|SkeletonPreview|Your site is taking shape/i);
});
