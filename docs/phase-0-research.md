# Phase 0 — データ・マップ・ライセンス調査

調査日: 2026-08-24

## 結論

1. ゲームデータの主取得先は、旧GraphQLではなく `json.tarkov.dev` の静的JSON APIを使う。
2. `tarkov-data-overlay` を後段で適用し、API更新待ちの修正・追加タスクを補完する。
3. Objective座標は静的APIから取得できるが、全Objectiveを完全には覆わない。座標なしを正常系として扱う。
4. `tarkov-dev-svg-maps` の地図は CC BY-NC-SA 4.0。将来の広告・寄付などが「NonCommercial」に抵触する可能性があるため、現時点では本番アセットへ組み込まない。
5. Phase 1では、CSS製の概略図を維持しつつ、データ取得・キャッシュ・更新差分検知を先に実装する。

## APIの現状

### 採用: 静的JSON API

- エンドポイント一覧: `https://json.tarkov.dev/endpoints`
- タスク: `https://json.tarkov.dev/regular/tasks`
- 日本語辞書: `https://json.tarkov.dev/regular/tasks_ja`
- マップ: `https://json.tarkov.dev/regular/maps`
- 対応モード: `regular` / `pve` / `pvp-season`

各レスポンスは `{ data, translations }` 形式。ベースデータ内の文字列は翻訳キーであり、`translations` が示すJSONPathを同一モードの `_<language>` 辞書で置換する。

旧 `https://api.tarkov.dev/graphql` は2026-08-24の実測で `GraphQL server unavailable` を返した。TarkovTrackerの現行ドキュメントでも静的JSONへ移行済みで、GraphQLは非推奨・不安定と明記されている。

参考:

- https://github.com/tarkovtracker-org/TarkovTracker/blob/main/docs/API.md
- https://github.com/tarkovtracker-org/TarkovTracker/blob/main/docs/SYSTEMS.md
- https://github.com/the-hideout/tarkov-api/blob/main/schema-static.mjs

## 実データ監査

`regular/tasks` を2026-08-24に集計した結果:

| 指標 | 件数 |
| --- | ---: |
| タスク | 517 |
| Objective | 1,458 |
| マップ指定あり | 791 |
| 座標または範囲あり | 534 |
| 全Objectiveに対する座標収録率 | 36.6% |
| マップ指定Objectiveに対する座標収録率 | 67.5% |

座標が多い型:

| Objective型 | 総数 | 座標あり |
| --- | ---: | ---: |
| visit | 221 | 196 |
| plantItem | 129 | 116 |
| findQuestItem | 110 | 109 |
| mark | 83 | 79 |
| shoot | 197 | 15 |

`giveItem`、`giveQuestItem`、`buildWeapon`など、レイド地点を持たないObjectiveは座標なしで正しい。`extract`はObjective自体に地点がなく、マップ側のextract情報と名前で結合する必要がある。

代表例の `Background Check`（旧名 Checking、ID `5936da9e86f7742d65037edf`）は、`findQuestItem.possibleLocations[].positions[]` にCustomsのワールド座標を持つ。

## 座標モデル

静的APIが返すObjective座標はゲーム内ワールド座標 `(x, y, z)`。画面上へ置くには、マップごとの投影情報が必要になる。

```text
world position
  → map rotation
  → map boundsで正規化
  → SVG/CSS canvasのxPercent・yPercent
  → floor / altitudeで表示レイヤーを選択
```

APIの `maps` にはspawns・extracts・locks・hazardsなどのワールド座標があるが、SVG画像や投影boundsは含まれない。投影メタデータは別管理が必要。

旧 `TarkovTracker/tarkovdata` には `maps.json` のbounds/rotationと、`objective_gps.json` の表示座標が存在する。ただしリポジトリ直下に明示ライセンスを確認できないため、そのまま複製せず、ライセンス確認または独自投影定義の作成を行う。

参考:

- https://github.com/TarkovTracker/tarkovdata/blob/master/maps/README.md
- https://github.com/TarkovTracker/tarkovdata/blob/master/maps.json
- https://github.com/TarkovTracker/tarkovdata/blob/master/objective_gps.json

## 補完データ

`tarkov-data-overlay` はtarkov.devとの差分修正・未収録タスク追加用。MITライセンスで、jsDelivrから取得できる。

- データ: `https://cdn.jsdelivr.net/gh/tarkovtracker-org/tarkov-data-overlay@main/dist/overlay.json`
- 適用順: base → shared overlay → mode overlay → locale overlay
- 新規タスク: `tasksAdd`
- Objective追加: `objectivesAdd`
- 更新日時・ハッシュ: `$meta`

参考:

- https://github.com/tarkovtracker-org/tarkov-data-overlay
- https://github.com/tarkovtracker-org/tarkov-data-overlay/blob/main/docs/INTEGRATION.md

## マップアセットとライセンス

`the-hideout/tarkov-dev-svg-maps` は地図用途として技術的に最適だが、ライセンスは CC BY-NC-SA 4.0。

- クレジット表示が必要
- 改変物は同じライセンスで共有が必要
- 商用利用不可
- チート・不正優位用途は禁止

運用費回収目的でも、広告・スポンサー・寄付導線がNonCommercialの解釈に触れる可能性がある。利用する場合は権利者の書面許可を取る。それまでは独自の抽象マップを使う。

参考:

- https://github.com/the-hideout/tarkov-dev-svg-maps
- https://creativecommons.org/licenses/by-nc-sa/4.0/

Battlestate Gamesの公開サイトからは、一般的なファンサイト向け利用条件を今回確認できなかった。名称・ゲームデータ・公式画像の扱いは、公開拡大や収益化の前に最新規約確認と必要に応じた問い合わせを行う。

## Phase 1への確定事項

- クライアントから外部APIへ直接アクセスしない。
- サーバー側で静的JSONを取得し、12時間程度キャッシュする。
- stale-while-revalidateと前回正常データを持ち、上流障害時もサイトを表示する。
- `tarkov-data-overlay` をマージする。
- `source`、`fetchedAt`、`overlayVersion`、`coordinateStatus`を保存する。
- 座標なしは `unmapped`、確認待ちは `verify`、確認済みは `verified` とする。
- 差分検知対象はタスクID、Objective ID/型/説明/必要数/マップ/座標/前提条件。

## Phase 0完了条件

- [x] 現行データ取得先を確定
- [x] PVP/PVE/Seasonalの分離を確認
- [x] 日本語ローカライズ方法を確認
- [x] Objective座標の実収録率を計測
- [x] 代表タスクで座標構造を確認
- [x] 補完データの取得先とマージ順を確定
- [x] 地図アセットの利用条件を確認
- [ ] BSGの明示的なファンコンテンツ許諾範囲を確認
- [ ] 採用する地図アセットについて必要なら書面許可を取得

未完2点は公開拡大・収益化前のゲートとし、Phase 1のデータ基盤開発は開始できる。
