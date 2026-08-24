# Data sources

調査日: 2026-08-24

| 名前 | URL | 用途 | 更新状況 | 区分 | ライセンス・問題点 |
| --- | --- | --- | --- | --- | --- |
| json.tarkov.dev | https://json.tarkov.dev/endpoints | Task、Objective、Map、座標、翻訳 | 現行。regular/PVE/seasonalを配信 | Primary | APIデータの利用条件は公開拡大時に再確認 |
| tarkov-data-overlay | https://github.com/tarkovtracker-org/tarkov-data-overlay | 未収録・更新遅延の補正 | 現行 | Secondary / Local Override | MIT。base→mode→locale順に適用 |
| TarkovTracker/tarkovdata | https://github.com/TarkovTracker/tarkovdata | bounds、rotation、GPS構造の調査 | 旧データ | Research only | 直下の明示ライセンスを確認できず再配布しない |
| tarkov-dev-svg-maps | https://github.com/the-hideout/tarkov-dev-svg-maps | 正確な地図SVG候補 | 利用可能 | Candidate | CC BY-NC-SA 4.0。広告・支援を含む運用には不適合の可能性 |

旧GraphQL APIは2026-08-24の実測で利用不能だったためPrimaryにしない。TarkovLab/TarkovDataなどアーカイブ済みソースもPrimaryにしない。

アプリの取得経路は `external data → normalize → overlay → application` とし、ブラウザから外部APIへ直接依存しない。
