# Internal data model

外部データをDBへ全複製せず、取得時に次の読み取りモデルへ正規化する。

```text
Task
 ├─ id, name, trader, minPlayerLevel
 ├─ prerequisiteTaskIds[]
 └─ Objective[]
     ├─ id, type, description, optional, count
     ├─ mapScope: specific | multiple | any | none
     ├─ maps[]
     ├─ possibleLocations[], zones[]
     ├─ requiredKeys[], markerItem, usingWeapon[], wearing[]
     └─ coordinateStatus: verified | verify | unmapped
```

位置は`possibleLocations.positions`または`zones.position/outline`から取得し、表示時に`WorldPoint → projected percent → floor`へ変換する。複数位置・polygonは元データを保持し、現在のUIは代表点を使用する。

永続化するユーザーデータ:

- `raid_plans`: Map、選択Objective ID、順序、チェック状態、担当者、revision
- `plan_members`: 参加者、役割、Ready
- `player_profiles`: faction、level、所持鍵、電源・条件設定

外部Task本文は共有URLやD1へ固定保存せず、IDから最新データを復元する。
