# Map analysis

静的APIのObjective・Spawn・Extract・Lock・Hazardはゲーム内world座標 `(x,y,z)` を持つ。現行実装は対象地点からboundsを動的算出し、x/zを0–100%へ正規化する。

```text
world coordinate → dynamic bounds → x/y percentage → abstract canvas
```

実装済み:

- Map切替
- Zoom、Pan、リセット
- Objective、Spawn、Extract、Lock、Hazardマーカー
- Objectiveクリック詳細
- Floorフィルター
- world座標ベースの距離・ルート

制約:

- CSS抽象マップであり、実際の建物・道路とは正確に一致しない。
- map固有rotationは未適用。
- Floorは高度閾値による暫定分類。
- polygon/areaは検出できるが、画面では代表点のみ表示。
- 正確なSVGはライセンス解決まで導入しない。

したがって操作可能なInteractive MapはYES、正確なSVG重畳はPARTIALとする。
