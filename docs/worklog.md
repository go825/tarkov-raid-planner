# Tarkov Raid Planner 作業ログ

このファイルは、実装内容・検証結果・次の作業をGitHub上で追跡するための記録です。

## 2026-08-24

### Phase 20 — タスク中心の画面構成（進行中）

- [x] 概要ナビゲーションと概要画面を削除。
- [x] 初期表示をマイタスクへ変更。
- [x] マップ概要・統計・ルート条件の横長エリアを削除。
- [x] レイド計画を左タスク一覧・右マップの配置へ変更。
- [x] ESLintエラー0件、本番ビルド成功、自動テスト16件成功。
- [x] Sites v18を所有者限定でデプロイし、一般公開設定を変更していないことを確認。

### Phase 19 — マイタスク可読性調整（完了）

- [x] マイタスク一覧の最大幅を980pxへ抑え、中央配置。
- [x] タスク名、説明、状態、目標、フィルターの文字を拡大。
- [x] モバイルでは画面幅を維持するレスポンシブ表示に調整。
- [x] ESLintエラー0件、本番ビルド成功、自動テスト16件成功。
- [x] Sites v17を所有者限定でデプロイし、一般公開設定を変更していないことを確認。

### Phase 18 — 日本語UI・上部ナビゲーション（完了）

- [x] 主要ナビゲーションと操作ラベルを日本語化。
- [x] 左サイドバーを廃止し、上部の横一列ナビゲーションへ変更。
- [x] タブレット／モバイルでは横スクロール可能な上部ナビゲーションへ変更。
- [x] ESLintエラー0件、本番ビルド成功、自動テスト16件成功。
- [x] Sites v16を所有者限定でデプロイし、アクセスが`custom`のままであることを確認。

### Phase 17 — 公開前リリース候補（進行中・一般公開保留）

- [x] バージョンを`1.0.0-rc.1`へ更新。
- [x] 公開チェックリストとリリース手順を作成。
- [x] Lint・16件のテスト・本番ビルド・データ監査を最終確認。
- [x] Sites v15を所有者限定でデプロイし、稼働を確認。
- [ ] 一般公開（ユーザー指示により保留。アクセス設定は変更しない）。

### Phase 16 — セキュリティ・法務・運用準備（完了）

- [x] アカウントデータのJSONエクスポートと完全削除APIを追加。
- [x] Privacy、Terms、Credits、Security Policyを追加。
- [x] CSP等のセキュリティヘッダーと更新系APIのレート制限を追加。
- [x] リリース、障害対応、データ保持の運用文書を追加。

### Phase 15 — 初回体験・Overview・Settings（完了）

- [x] Overviewと主要フローへの導線を追加。
- [x] 初回オンボーディングを追加。
- [x] プレイ設定、データ管理、ポリシー導線を持つSettingsを追加。
- [x] スキップリンクと現在ページ通知を追加。

### Phase 14 — 品質・安全性強化（完了）

- [x] Error、Loading、Not Found画面を追加。
- [x] モバイル向けOverview／Settings／オンボーディング表示を追加。
- [x] セキュリティレスポンスヘッダーとAPI過負荷対策を追加。
- [x] 公開前の回帰検証項目を定義。

#### Phase 14–17 検証メモ

- ESLintエラー0件、本番ビルド成功、自動テスト16件成功。
- tarkov.dev監査: Task 517件、Objective 1,458件、Map対象Objective座標カバー率67.5%。
- 公開アクセスへの切替は実施せず、所有者の明示指示まで保留する。
- Sites v15のデプロイ成功後もアクセスは`custom`（所有者1名のみ）のまま。一般公開設定は未変更。
- 非公開確認URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 13 — Party Dashboard・分隊タスク統合（完了）

- [x] Party専用画面とメンバー別進行状況を追加。
- [x] 同一Objectiveの複数所有者を統合。
- [x] Map別の分隊Objective効率ランキングを追加。
- [x] Party DashboardからRaid Planを生成。
- [x] メンバーカラーと実準備率を表示。
- [x] Party参加者だけが進行情報を取得できるAPIを追加。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] GitHubと公開サイトを更新。

#### Phase 13 メモ

- Party APIは共有IDだけでは取得できず、所有者または参加済みメンバーのChatGPT認証を必須とする。
- 同一Objective IDを所有者配列へ統合し、メンバーカラーで重複所有を表示する。
- Map効率スコアは`Objective数 + 対象メンバー数 × 2`。Any Map Objectiveは各具体Mapの候補へ加算する。
- CREATE PLANは推薦Mapへ切り替え、Party対象Objectiveを初期選択して既存ルート・チェックリストへ接続する。
- ESLintエラー0件、本番ビルド成功、自動テスト15件成功。
- Sites v14を本番へデプロイ。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 12 — My Tasks・タスク進行管理（完了）

- [x] My Tasks画面とPvP／PvE切替を追加。
- [x] Task／Objective進行状態をD1とlocalStorageへ保存。
- [x] 前提Task・必要LevelによるLOCKED判定を追加。
- [x] 受注中・未完了ObjectiveだけをRaid Plan候補へ反映。
- [x] Squad共有プラン上でTask所有者と担当者を区別。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] GitHubと公開サイトを更新。

#### Phase 12 メモ

- ゲーム状態は自動取得せず、ユーザーの手動入力のみ。認証時はD1、未ログイン時はモード別localStorageへ保存する。
- TaskはAVAILABLE／ACTIVE／COMPLETED、ObjectiveはPENDING／IN PROGRESS／HANDOVER／COMPLETEDで管理する。
- 進行管理を開始するまでは従来どおり全候補を表示し、開始後はACTIVEかつ未完了ObjectiveだけをRaid Planへ出す。
- 共有プランのTask所有者はObjective単位で保持し、チェックリストの作業担当とは別フィールドで同期する。
- ESLintエラー0件、本番ビルド成功、自動テスト14件成功。
- Sites v13を本番へデプロイし、D1の`task_progress`テーブルを確認。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 11 — Phase 0仕様差分の解消（完了・外部確認ゲートあり）

- [x] Phase 0指定成果物6ファイルを`docs/research/`へ作成。
- [x] YES／PARTIAL／NOの13項目評価とGO判定を明文化。
- [x] Any／複数Map／MapなしObjectiveの分類・絞り込み・テストを追加。
- [x] Objective詳細表示とZoom／Panを追加。
- [x] 担当Squadメンバーの色をObjectiveマーカーへ反映。
- [x] 前提タスク情報を正規化データへ保持。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] GitHubと公開サイトを更新。

#### Phase 11 外部確認ゲート

- BSGのファンコンテンツ・商標利用条件は明示的な許諾範囲を追加確認する。
- 正確な地図アセットは商用利用可能な許諾取得まで本番へ組み込まず、独自抽象マップを継続する。

#### Phase 11 メモ

- Map scopeは`specific`／`multiple`／`any`／`none`へ正規化。上流に明示scopeがないAnyはObjective typeから安全側に推定する。
- Map絞り込み後もタスク内の該当Objectiveをすべて個別表示し、Mapなし納品Objectiveはチェックリスト専用として扱う。
- Customs統合確認: 対象124 Task、Any Objective 59件、複数Map Objective 67件、前提Taskあり54件。
- ESLintエラー0件、本番ビルド成功、自動テスト12件成功。
- GitHubコミット`ca74926`をSites v12として本番デプロイ。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

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

### Phase 10 — レイド前チェックリスト（完了）

- [x] タスクObjectiveから鍵・装備・納品・レイド内行動を抽出。
- [x] プレイヤーレベルと所持鍵を考慮したREADY／MISSING／IN RAID判定を追加。
- [x] チェック項目の完了操作とSquadメンバーへの担当割り当てを追加。
- [x] メンバー別の準備進捗表示を追加。
- [x] 完了状態・担当割り当て・プレイヤーレベルのD1保存を実装。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] D1マイグレーションを含む公開サイト更新。

#### Phase 10 メモ

- Objectiveの翻訳済み説明をチェック項目名に利用し、未解決のアイテムIDを画面へ露出しない。
- 手動完了は自動判定より優先し、共有プランのrevision競合検知対象として保存する。
- ESLintエラー0件、本番ビルド成功、自動テスト10件成功。
- Sites v11を本番へデプロイし、D1の`player_profiles`・`raid_plans`マイグレーション適用を確認。
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

### Phase 8 — Spawn・Extract・危険度ルーティング（完了）

- [x] マップAPIからlocks・hazardsを取得。
- [x] Spawn地点をマップ上で選択可能に変更。
- [x] 使用Extractをマップ上で選択可能に変更。
- [x] Hazardと鍵／電源付きLockを投影表示。
- [x] Spawn → Objective → Extractのルート線を表示。
- [x] 開始・終了地点を含む推定距離を表示。
- [x] Hazard近傍を加重するルート最適化へ更新。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] 公開サイトを更新。

#### Phase 8 メモ

- Hazard区間は直線中点から55m以内の危険地点ごとにコストを45%加算する暫定モデル。
- Lockは鍵IDまたは電源条件の有無を表示し、所持品連携前はルート通行不可判定には使わない。
- Spawn候補は重複表示を抑えるため先頭16件を投影し、画面上では最大8件を表示する。
- ESLintエラー0件、本番ビルド成功、自動テスト8件成功。
- Customs実データ統合確認: 34 Lock、5 Hazard、278 Spawn、27 Extract。
- Sites v9を本番へデプロイ。URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

### Phase 9 — プレイヤープロファイル・実行可能ルート（完了）

- [x] Faction・所持鍵・電源・条件付きExtract設定のプロファイルを追加。
- [x] 認証ユーザー向けD1プロファイルAPIを実装。
- [x] 未ログイン時のlocalStorageフォールバックを実装。
- [x] Lockマーカーから所持鍵を切り替える操作を追加。
- [x] 鍵／電源条件によるLock利用可否を表示。
- [x] Faction／条件設定によるExtract利用可否を表示。
- [x] 利用不可Extractをルート終点から除外。
- [x] 自動テスト・Lint・本番ビルドで検証。
- [x] D1マイグレーションを含む公開サイト更新。

#### Phase 9 メモ

- プロファイルは認証時にD1へ保存し、未ログイン時は端末内に保存する。
- 鍵名データを追加取得せず、現段階では鍵ID単位で所持状態を管理する。
- 条件付きExtractは明示的に許可した場合だけ選択可能にする安全側の判定。
- ESLintエラー0件、本番ビルド成功、自動テスト8件成功。
- 未ログインProfile APIはHTTP 401。Customsで鍵付きLock 34件、条件付きExtract 1件を確認。
- Sites v10を本番へデプロイし、D1の`player_profiles`テーブルを確認。
- 公開URL: `https://tarkov-raid-planner.tipmilkgo5.chatgpt.site`

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
