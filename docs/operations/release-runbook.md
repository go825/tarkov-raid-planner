# Release runbook

1. `npm ci`、`npm run lint`、`npm test`、`npm run data:audit`を実行する。
2. D1 migrationと必要なSecretsが対象環境にあることを確認する。
3. worklog、README、バージョンを更新してmainへpushする。
4. Sitesへ非公開デプロイし、主要画面、認証、共有、データ削除を確認する。
5. 一般公開は所有者の明示承認後だけ実施する。
6. 公開後はURL、デプロイ版、検証結果をworklogへ記録する。

異常時は新規公開を止め、直前の正常デプロイを維持し、incident-response.mdに従う。
