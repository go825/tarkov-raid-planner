# Phase 0 result

評価日: 2026-08-24（Phase 11再評価）

| # | 確認項目 | 判定 | 根拠・条件 |
| ---: | --- | --- | --- |
| 1 | 最新Taskを自動取得 | YES | json.tarkov.dev＋12時間キャッシュ |
| 2 | Objectiveを取得 | YES | 1,458件を監査 |
| 3 | Objective単位でMap判別 | YES | Objective.mapsを正規化 |
| 4 | Any Mapを識別 | PARTIAL | mapsなし＋raid-wide型から推定 |
| 5 | 複数Map Objective | YES | maps配列と`multiple` scope |
| 6 | 固定地点座標 | PARTIAL | Map指定の67.5%に座標・範囲あり |
| 7 | Floor情報 | PARTIAL | 高度による暫定分類 |
| 8 | SVG Mapへ正確に配置 | PARTIAL | 相対投影は可能、許諾済みSVG未採用 |
| 9 | Interactive Map | YES | Zoom/Pan/Marker/Click/Floor/Map切替 |
| 10 | 新規Task追加へ追従 | YES | IDベース取得＋overlay |
| 11 | Local Override | YES | overlayをbase→mode→locale順で適用 |
| 12 | 非営利公開 | PARTIAL | 独自アセット構成。BSG条件は追加確認 |
| 13 | 将来広告時の問題素材 | YES | CC BY-NC-SA地図は問題候補として不採用 |

## 判定

**GO WITH CONDITIONS**

条件:

1. 権利未確認のSVG・画像・GPSデータを本番へ複製しない。
2. 正確な地図導入前に商用利用可能な許諾または独自制作を確定する。
3. BSGのファンコンテンツ・商標条件を公開拡大・収益化前に再確認する。
4. Any Map推定は上流の明示情報が得られた時点で置換する。
5. 座標なしObjectiveをエラーにせず一覧のみ表示する。
