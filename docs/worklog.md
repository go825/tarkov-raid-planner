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

### Phase 3 — プラン保存・共有・ルート編集（完了）

- [x] マップ別の選択タスクをブラウザへ自動保存。
- [x] 保存済みプランを再訪時に復元。
- [x] マップと選択タスクを含む共有URLを生成。
- [x] 共有URLから選択タスクを復元。
- [x] 選択タスクの前後移動を実装。
- [x] ピン間距離に基づく簡易ルート最適化を実装。
- [x] NEW PLANによる選択解除を実装。
- [x] 自動テストと本番ビルドで検証。
- [x] 公開サイトを更新。

#### Phase 3 メモ

- 保存先は端末内の`localStorage`。アカウント間同期は将来のサーバー保存フェーズで対応する。
- 共有URLはタスクIDのみを保持し、タスク本文は常に最新APIデータから復元する。
- 現段階の最適化は仮配置ピンに対する最近傍法。正式な座標投影導入後に実座標ベースへ切り替える。
- ESLintエラー0件、本番ビルド成功、自動テスト4件成功。
- Sites v4を本番へデプロイ。URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 4 — 認証・クラウド同期・永続共有（完了）

- [x] ChatGPT認証ユーザーを保存APIの所有者として利用。
- [x] D1用`raid_plans`スキーマとマイグレーションを追加。
- [x] ユーザー・マップ単位のプラン取得／更新APIを実装。
- [x] ログイン済み端末間で選択順を同期。
- [x] 読み取り専用の永続共有IDを実装。
- [x] 未ログイン時のlocalStorageフォールバックを維持。
- [x] サインイン／クラウド同期状態をUIへ追加。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] D1マイグレーションを含む公開サイト更新。

#### Phase 4 メモ

- 保存APIは認証ヘッダーのユーザーIDを所有者キーとして使用し、クライアント申告のユーザーIDを信用しない。
- 共有URLはランダムな共有IDを使用し、所有者のユーザーIDを公開しない。
- 未ログインまたはクラウド保存を利用できない環境では、Phase 3の端末内保存が継続する。
- ESLintエラー0件、本番ビルド成功、自動テスト4件成功。
- 未ログイン保存APIの統合確認: HTTP 401（DB接続前に認証拒否）。
- Sites v5を本番へデプロイし、`DB`バインディングと`raid_plans`テーブルを確認。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 7 — 実座標投影・階層・ルート距離（完了）

- [x] Tarkovワールド座標の抽出処理を実装。
- [x] マップ別boundsを動的計算し、x/zを画面座標へ投影。
- [x] Objectiveピンを実ワールド座標へ接続。
- [x] Spawn／Extract座標をAPIレスポンスへ追加して表示。
- [x] B1／GROUND／UPPERの階層分類と表示フィルターを追加。
- [x] 選択Objective間の3D距離を推定ルート距離へ反映。
- [x] ルート最適化を実座標距離優先へ変更。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] 公開サイトを更新。

#### Phase 7 メモ

- 投影はAPI内のObjective・Spawn・Extract座標からboundsを動的算出するため、権利未確認の地図画像・投影データを複製しない。
- 画像地図との厳密な位置合わせではなく、実座標同士の相対位置と距離を示す抽象投影。
- 高度yが-2未満をB1、6超をUPPER、それ以外をGROUNDとして暫定分類する。
- ESLintエラー0件、本番ビルド成功、自動テスト7件成功。
- Customs実データ統合確認: 80タスク、278 Spawn、27 Extract、座標付きタスク43件。
- Sites v8を本番へデプロイ。URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 6 — Ready・権限管理・競合解決（完了）

- [x] Leaderを含むReady状態のD1保存を実装。
- [x] Squad画面からReadyを切り替える操作を追加。
- [x] Leaderによるメンバー役割変更を実装。
- [x] Leaderによるメンバー削除と本人の退出APIを実装。
- [x] HTTP 409競合時の選択UIを追加。
- [x] Squad版を採用／ローカル版を再送する解決操作を追加。
- [x] 表示中2秒・バックグラウンド10秒の適応型同期へ改善。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] D1マイグレーションを含む公開サイト更新。

#### Phase 6 メモ

- Leader権限はUI表示だけでなく、役割変更・削除APIでも所有者IDを検証する。
- 競合時は自動上書きせず、Squadの最新版か手元の編集かをユーザーが選択する。
- バックグラウンド時のポーリングを抑え、不要な通信とD1読み取りを削減する。
- ESLintエラー0件、本番ビルド成功、自動テスト4件成功。
- 未ログインのReady更新／メンバー削除APIがともにHTTP 401になることを統合確認。
- Sites v7を本番へデプロイし、Leader Ready用マイグレーションを適用。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 5 — Squad共同編集（完了）

- [x] 共有プランへの認証付き参加APIを実装。
- [x] SquadメンバーとReady状態のD1スキーマを追加。
- [x] 参加メンバーへ共有プランの編集権限を付与。
- [x] 4秒間隔のプラン・メンバー同期を実装。
- [x] リビジョン番号による更新競合検知を追加。
- [x] Squad表示をD1メンバー情報へ接続。
- [x] 共有閲覧者向けJOIN導線を追加。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] D1マイグレーションを含む公開サイト更新。

#### Phase 5 メモ

- 初期の共同編集方式はCloudflare D1と4秒ポーリング。インフラを単純に保ちつつ複数端末で更新を共有する。
- PUT時にクライアントのリビジョンを検証し、古い編集にはHTTP 409と最新プランを返す。
- 共有IDだけでは編集できず、ChatGPT認証後にSquadへ参加したユーザーのみ更新可能。
- ESLintエラー0件、本番ビルド成功、自動テスト4件成功。
- 未ログインのプラン取得／Squad参加APIがともにHTTP 401になることを統合確認。
- Sites v6を本番へデプロイし、D1の`plan_members`・`raid_plans`テーブルを確認。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`
