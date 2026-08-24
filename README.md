# Tarkov Raid Planner

Tarkov Raid Planner（TRP）は、レイド前にタスクとObjectiveを地図へ重ね、分隊で行動計画を共有するための非公式ツールです。

## 現在の機能

- tarkov.dev実データによるMap別Objective表示
- Zoom／Pan／Floor切替とObjective詳細
- CC BY-NC-SA 4.0コミュニティSVG地図とSpawn・Extract・Lock・Hazardを含むルート計画
- タスク選択、ルート最適化、レイド前チェックリスト
- ChatGPT認証、クラウド保存、共有Squad共同編集
- Ready・担当割り当て・競合解決
- Overview、初回ガイド、プレイ／データ設定
- データエクスポート・アカウントデータ削除
- デスクトップ・タブレット・モバイル対応

## リリース状態

`v1.0.0-rc.1`（公開前リリース候補）です。一般公開は保留中で、現在のSitesアクセス設定は変更していません。公開時は [公開チェックリスト](docs/operations/public-launch-checklist.md) に従います。

## ポリシー

- [プライバシー](app/privacy/page.tsx)
- [利用規約](app/terms/page.tsx)
- [クレジット・免責](app/credits/page.tsx)
- [セキュリティ報告](SECURITY.md)

## 開発

Node.js 22.13以降を使用します。

```bash
npm install
npm run dev
```

デプロイ用ビルドは `npm run build` です。実データはjson.tarkov.devをサーバー側で取得し、更新差分用overlayを適用します。調査結果は`docs/research/`、運用手順は`docs/operations/`にあります。

## 注意

This is an unofficial Escape from Tarkov planning tool and is not affiliated with Battlestate Games.

地図画像は`the-hideout/tarkov-dev-svg-maps`をCC BY-NC-SA 4.0で使用しています。この地図を含む状態では非商用運用に限定されます。詳細は`public/maps/ATTRIBUTION.md`を参照してください。
