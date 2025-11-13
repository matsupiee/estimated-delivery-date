# 1. Shopify Partner アカウントでログイン（ブラウザが開きます）

```
shopify auth login
```

# 2. 新しい Shopify アプリを作成

```
mise install
node- v # -> 22.20と表示されることを確認

shopify app init
```

# プロンプトで以下を選択:

- テンプレ: Build a React Router app (recommended)
- 言語: Typescript
- アプリ名: estimated-delivery-date

# - パッケージマネージャー: npm

# 3. プロジェクトディレクトリに移動（アプリ名が異なる場合は調整）

cd shopify-estimated-delivery-date

# 4. 依存関係をインストール

npm install
