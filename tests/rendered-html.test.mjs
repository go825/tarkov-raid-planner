import assert from "node:assert/strict";
import test from "node:test";

async function render(path="/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers:{ accept:"text/html" } }), { ASSETS:{ fetch:async () => new Response("Not found",{status:404}) } }, { waitUntil(){},passThroughOnException(){} });
}

test("server-renders Tarkov Raid Planner", async () => {
  const response = await render();
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type") ?? "",/^text\/html\b/i);
  const html = await response.text();
  assert.match(html,/<title>Tarkov Raid Planner<\/title>/i);
  assert.match(html,/レイド計画/i);
  assert.match(html,/操作可能な戦術マップ/i);
  assert.match(html,/\/maps\/Customs\.svg/i);
  assert.match(html,/ドラッグで移動 · ホイールで拡大縮小/i);
  assert.match(html,/<object[^>]+type="image\/svg\+xml"/i);
  assert.match(html,/タスク一覧/i);
  assert.match(html,/タスク・Trader・目標を検索/i);
  assert.match(html,/ルートを最適化/i);
  assert.match(html,/ログインして同期/i);
  assert.match(html,/分隊 · 更新/i);
  assert.match(html,/分隊ステータス/i);
  assert.match(html,/レイド前チェックリスト/i);
  assert.match(html,/分隊の準備状況/i);
  assert.match(html,/100/);
  assert.match(html,/操作可能なマップ/i);
  assert.match(html,/危険地点/i);
  assert.match(html,/プレイヤー進行・手動管理/i);
  assert.match(html,/aria-label="全体ナビゲーション"/i);
  assert.match(html,/マイタスク[^]*レイド計画[^]*パーティー[^]*設定/i);
  assert.doesNotMatch(html,/>概要</i);
  assert.match(html,/aria-current="page"[^>]*>[^]*マイタスク/i);
  assert.doesNotMatch(html,/codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("server-renders release policy pages", async () => {
  for(const [path,title] of [["/privacy","プライバシーポリシー"],["/terms","利用条件"],["/credits","Credits"]]){
    const response=await render(path);
    assert.equal(response.status,200);
    assert.match(await response.text(),new RegExp(title,"i"));
  }
});
