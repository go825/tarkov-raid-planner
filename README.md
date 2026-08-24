# Tarkov Raid Planner

Tarkov Raid Planner（TRP）は、レイド前にタスクとObjectiveを地図へ重ね、分隊で行動計画を共有するための非公式ツールです。

## 現在の機能

- tarkov.dev実データによるMap別Objective表示
- Zoom／Pan／Floor切替とObjective詳細
- Spawn・Extract・Lock・Hazardを含むルート計画
- タスク選択、ルート最適化、レイド前チェックリスト
- ChatGPT認証、クラウド保存、共有Squad共同編集
- Ready・担当割り当て・競合解決
- デスクトップ・タブレット・モバイル対応

## 開発

Node.js 22.13以降を使用します。

```bash
npm install
npm run dev
```

デプロイ用ビルドは `npm run build` です。実データはjson.tarkov.devをサーバー側で取得し、更新差分用overlayを適用します。調査結果は`docs/research/`にあります。

## 注意

This is an unofficial Escape from Tarkov planning tool and is not affiliated with Battlestate Games.
