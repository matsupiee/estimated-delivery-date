# デプロイの仕組み

このプロジェクトは [Fly.io](https://fly.io) を使ってデプロイされています。

## 概要

- **プラットフォーム**: Fly.io
- **リージョン**: nrt (東京)
- **デプロイ方法**: GitHub Actions による自動デプロイ
- **コンテナ**: Dockerを使用

## 自動デプロイの流れ

1. `main` ブランチへのpushをトリガーに GitHub Actions が起動
2. [.github/workflows/fly-deploy.yml](.github/workflows/fly-deploy.yml) ワークフローが実行される
3. `flyctl deploy --remote-only` コマンドでFly.io上でビルド＆デプロイ
4. Fly.ioがDockerイメージをビルドし、アプリを起動

## Fly.io 設定

[fly.toml](../fly.toml) を参照

## 必要な環境変数・シークレット

### GitHub Secrets

- **FLY_API_TOKEN**: Fly.ioのAPIトークン（デプロイに必要）

### Fly.io Secrets

以下のコマンドでFly.ioにシークレットを設定:

```bash
fly secrets set SHOPIFY_API_KEY=your_api_key
fly secrets set SHOPIFY_API_SECRET=your_api_secret
fly secrets set SCOPES=write_products
fly secrets set SHOPIFY_APP_URL=https://your-app.fly.dev
fly secrets set MAXMIND_LICENSE_KEY=secret

# その他必要なShopify関連の環境変数
```

## 手動デプロイ

ローカルから手動でデプロイする場合:

```bash
# Fly CLIのインストール（初回のみ）
curl -L https://fly.io/install.sh | sh

# ログイン
flyctl auth login

# デプロイ
flyctl deploy
```

## トラブルシューティング

### ログの確認

```bash
flyctl logs
```

### アプリの状態確認

```bash
flyctl status
```

### SSHでコンテナに接続

```bash
flyctl ssh console
```

### ボリュームの確認

```bash
flyctl volumes list
```

## 参考リンク

- [Fly.io Documentation](https://fly.io/docs/)
- [Continuous Deployment with GitHub Actions](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
- [Fly.io Volumes](https://fly.io/docs/volumes/)
