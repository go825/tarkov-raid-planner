# Task data analysis

`regular/tasks`の2026-08-24監査結果は517 Task、1,458 Objective。Map指定791件、座標・範囲あり534件で、全Objectiveの36.6%、Map指定Objectiveの67.5%に位置情報がある。

| 種類 | 実データ上の表現 | Map | Location | アプリでの扱い |
| --- | --- | --- | --- | --- |
| Pickup | `findQuestItem`、`possibleLocations.positions` | specific/multiple | world座標 | ピン＋IN RAID |
| Plant/Mark | `plantItem` / `mark`、zones/positions | specific/multiple | world座標または範囲 | ピン＋必要装備 |
| Visit | `visit`、zones/positions | specific/multiple | 多くはworld座標 | ピン＋IN RAID |
| Kill | `shoot` | specific/multiple/空 | 座標なしが多い | Anyなら一覧、マーカーなし |
| Extract | `extract` | specific/空 | Objective自体に座標なし | Map側Extractと併記 |
| Handover | `giveItem` / `giveQuestItem` | none | 不要 | 一覧・チェックリスト、マーカーなし |

代表例 `Background Check`（`5936da9e86f7742d65037edf`）は`findQuestItem.possibleLocations[].positions[]`にCustomsのworld座標を持つ。

Map scopeはObjective単位で以下に正規化する。

- maps 1件: `specific`
- maps 2件以上: `multiple`
- mapsなしでraid-wide型: `any`
- mapsなしで納品等: `none`

この分類は推論を含むため、上流が明示scopeを提供した場合は置き換える。
