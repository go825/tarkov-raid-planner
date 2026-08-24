# Tarkov Raid Planner 作業ログ

このファイルは、実装内容・検証結果・次の作業をGitHub上で追跡するための記録です。

## 2026-08-24

### Phase 0 — データ調査・ライセンス確認（完了）

- `json.tarkov.dev` の静的JSONエンドポイントと日本語翻訳データを確認。
- タスク517件、目標1,458件を監査し、座標付き目標のカバレッジを集計。
- Tarkov Tracker系オーバーレイによる座標補完方法を確認。
- マップ画像のライセンス条件を確認し、権利条件が明確になるまで本番利用を保留。
- 調査資料を `docs/phase-0-research.md`、監査処理を `scripts/audit-tarkov-data.mjs` に保存。
- GitHub反映: `f896a23 Complete Phase 0 data and licensing research`

### Phase 1 — データ基盤（完了）

- [x] Phase 1の実装範囲を決定。
- [x] Tarkov静的JSONの取得サービスを実装。
- [x] 日本語翻訳と英語フォールバックを実装。
- [x] 座標オーバーレイのマージ処理を実装。
- [x] キャッシュと障害時の古いデータへのフォールバックを実装。
- [x] アプリ内APIエンドポイントを追加。
- [x] 自動テストと本番ビルドで検証。
- [x] 公開サイトを更新。

#### Phase 1 方針

- 取得元へのアクセスはサーバー側に集約し、ブラウザから外部APIへ直接依存しない。
- 通常はキャッシュ済みデータを返し、取得元の一時障害時には直近の正常データを返す。
- UIが必要とする形式へ正規化し、取得元のデータ構造変更の影響を局所化する。

#### Phase 1 実装記録

- `GET /api/tarkov/tasks` を追加。`mode`、`lang`、`map`、`limit` を指定可能。
- 翻訳は指定言語 → 英語 → 元キーの順でフォールバック。
- オーバーレイは shared → game mode → locale の順で適用。
- 12時間のメモリキャッシュと、上流取得失敗時の直近正常データへのフォールバックを追加。
- レスポンスへ `fetchedAt`、`stale`、`overlayVersion`、各Objectiveの `coordinateStatus` を付与。
- 自動テスト4件が成功。既存トップページのサーバーレンダリングも回帰なし。
- 実データ統合確認: HTTP 200、regular 519タスク、overlay v1.69。
- Sites v2を本番へデプロイ。URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 2 — 実データUI接続（完了）

- [x] Phase 1 APIをRaid Planner画面へ接続。
- [x] マップ選択と再取得を実装。
- [x] タスク名・Trader・Objectiveの検索を実装。
- [x] タスク選択とルート候補表示を実データへ対応。
- [x] 読み込み中・取得失敗・検索結果なしの状態を追加。
- [x] 自動テストと本番ビルドで検証。
- [x] 公開サイトを更新。

#### Phase 2 メモ

- 権利確認前の地図画像は使わず、既存の抽象タクティカルマップを維持。
- ワールド座標から画面座標への正式な投影定義は未確定のため、現段階のピン配置はUI確認用の決定的な仮配置。
- `coordinateStatus` が `unmapped` のObjectiveを画面上で明示し、座標未収録を正常系として扱う。
- 自動テスト4件が成功。本番ビルド成功。
- Customs絞り込みの実データ統合確認: HTTP 200、80タスク、stale=false。
- Sites v3を本番へデプロイ。URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`
