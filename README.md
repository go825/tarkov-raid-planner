# Tarkov Raid Planner

Tarkov Raid Planner（TRP）は、レイド前にタスクとObjectiveを地図へ重ね、分隊で行動計画を共有するための非公式ツールです。

## 現在の機能

- Customsのタクティカルルート表示
- タスクの選択とマップObjectiveの連動
- READY / VERIFY / BLOCKEDの状態表示
- PLAN / LIVEモード切替
- 分隊ステータスと共有コード
- デスクトップ・タブレット・モバイル対応

## 開発

Node.js 22.13以降を使用します。

```bash
npm install
npm run dev
```

デプロイ用ビルドは `npm run build` です。実データ連携はtarkov.devを想定し、現在の画面では代表データを使用しています。

## 注意

This is an unofficial Escape from Tarkov planning tool and is not affiliated with Battlestate Games.
