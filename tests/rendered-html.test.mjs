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
  assert.match(html,/Customs route/i);
  assert.match(html,/Task stack/i);
  assert.doesNotMatch(html,/codex-preview|SkeletonPreview|Your site is taking shape/i);
});
