# ディレクトリ構造

このドキュメントでは、プロジェクトのディレクトリ構造と各ディレクトリ・ファイルの役割を説明します。

## ルートディレクトリ

```
estimated-delivery-date/
├── app/                    # アプリケーションのメインコード
├── docs/                   # ドキュメント
├── extensions/             # Shopify App Extensions
├── prisma/                 # Prismaスキーマとマイグレーション
├── public/                 # 静的ファイル
├── .gitignore             # Git除外設定
├── CHANGELOG.md           # 変更履歴
├── Dockerfile             # Docker設定
├── env.d.ts               # 環境変数の型定義
├── package.json           # プロジェクトの依存関係とスクリプト
├── README.md              # プロジェクトの概要
├── shopify.app.toml       # Shopify App設定
├── shopify.web.toml       # Shopify Web設定
├── tsconfig.json          # TypeScript設定
└── vite.config.ts         # Vite設定
```

## app/ - アプリケーションコード

React Router v7を使用したShopifyアプリのメインコードが格納されています。

### app/routes/

React Routerのファイルベースルーティング。各ファイルがルートに対応します。

#### 管理画面ルート

- **app.tsx**: 管理画面のレイアウトコンポーネント
- **app.\_index.tsx**: 管理画面のホームページ
- **app.settings.tsx**: 発送設定画面（発送準備日数の設定）
- **app.regions.tsx**: 地域別配送日数設定画面
- **app.holidays.tsx**: 祝日管理画面
- **app.additional.tsx**: 追加休業日設定画面

#### 認証ルート

ShopifyアプリのOAuth認証フローを処理するルート。`shopify.server.ts`で`authPathPrefix: "/auth"`が設定されているため、認証関連のリクエストは`/auth/*`パスで処理されます。

**OAuth認証フローの流れ：**

1. **auth.login/route.tsx**（`/auth/login`）: ログインページ
   - ショップのドメイン（例: `example.myshopify.com`）を入力するフォームを表示
   - フォーム送信時に`login()`関数を呼び出してShopifyのOAuth認証ページにリダイレクト（`/auth/begin`など）

2. **ユーザーがShopifyで認証を承認**（Shopify側のページ）

3. **auth.$.tsx**（`/auth/*`のキャッチオールルート）: OAuthコールバック処理
   - ShopifyがコールバックURL（`/auth/callback`など）にリダイレクト
   - `authenticate.admin(request)`を呼び出して以下を処理：
     - 認可コードを受け取り、アクセストークンを取得
     - セッション情報をPrismaの`Session`テーブルに保存
     - 認証が完了すると管理画面（`/app`）にリダイレクト

**なぜキャッチオールルートが必要か：**
`auth.login/route.tsx`は認証の**開始**だけを担当します。実際のOAuthフロー（コールバック、トークン取得、セッション保存）はShopifyからのリダイレクト後に`auth.$.tsx`が処理します。`auth.$.tsx`は`/auth/login`以外のすべての`/auth/*`パス（`/auth/begin`、`/auth/callback`など）をキャッチして処理するため、OAuthフローの各ステップに対応できます。

#### APIルート

- **api.calculate-delivery.tsx**: 配送予定日計算APIエンドポイント
  - HTTPリクエストを受け取り、JSONレスポンスを返すAPIエンドポイント
  - 認証処理（`authenticate.admin`）を実行
  - リクエストパラメータ（都道府県）の取得とバリデーション
  - エラーハンドリングとHTTPステータスコードの返却
  - `delivery-calculator.server.ts`の関数を呼び出して計算を実行

#### Webhookルート

Shopifyから自動的に呼び出されるWebhookエンドポイント。特定のイベント（アプリのアンインストール、スコープ更新など）が発生したときに、ShopifyがHTTPリクエストを送信します。`shopify.app.toml`でWebhookの購読を設定します。

- **webhooks.app.uninstalled.tsx** (`/webhooks/app/uninstalled`): アプリアンインストール時のWebhookハンドラ
  - ショップがアプリをアンインストールしたときに呼び出される
  - データベースから該当ショップのセッション情報を削除してクリーンアップ
  - セキュリティのため、`authenticate.webhook(request)`でWebhookの正当性を検証

- **webhooks.app.scopes_update.tsx** (`/webhooks/app/scopes_update`): スコープ更新時のWebhookハンドラ
  - アプリの権限（スコープ）が更新されたときに呼び出される
  - データベースのセッション情報のスコープを更新
  - 例: 管理者がアプリの権限を変更した場合など

**Webhookの仕組み：**

1. `shopify.app.toml`でWebhookの購読を設定（`app/uninstalled`、`app/scopes_update`など）
2. イベントが発生すると、Shopifyが指定されたURIにHTTPリクエストを送信
3. Webhookルートがリクエストを受信し、`authenticate.webhook()`で検証
4. 検証が成功したら、データベースの更新などの処理を実行

これにより、アプリが常にShopifyの状態と同期を保つことができます。

#### その他

- **\_index/route.tsx**: ルートパスのページ
- **apps.delivery.customer/**: 顧客向け配送情報表示（実装予定）

### app/routes.ts

React Router v7のファイルベースルーティング設定ファイル。`flatRoutes()`関数を使用して、`app/routes/`ディレクトリ内のファイルを自動的にスキャンし、ファイル名からルートを生成します。

**動作：**

- `app/routes/`ディレクトリ内のファイル構造を自動的に検出
- ファイル名をURLパスに変換（例: `app.tsx` → `/app`、`auth.login/route.tsx` → `/auth/login`）
- 各ルートファイルの`loader`、`action`、コンポーネントを自動的に登録

**例：**

- `app/routes/app.tsx` → `/app` ルート
- `app/routes/auth.login/route.tsx` → `/auth/login` ルート
- `app/routes/api.calculate-delivery.tsx` → `/api/calculate-delivery` ルート
- `app/routes/_index/route.tsx` → `/` ルート

このファイルベースルーティングにより、新しいルートを追加する際は`app/routes/`ディレクトリにファイルを追加するだけで自動的に認識されます。

**`flatRoutes()`を使わない場合：**

`flatRoutes()`を使わない場合、すべてのルートを手動で定義する必要があります。例えば：

```typescript
import { type RouteConfig } from "@react-router/dev/routes";
import App from "./routes/app";
import AppIndex from "./routes/app._index";
import AppSettings from "./routes/app.settings";
// ... すべてのルートコンポーネントをインポート

export default [
  {
    path: "/",
    Component: IndexRoute,
  },
  {
    path: "/app",
    Component: App,
    children: [
      {
        index: true,
        Component: AppIndex,
      },
      {
        path: "settings",
        Component: AppSettings,
      },
      // ... すべてのルートを手動で定義
    ],
  },
  {
    path: "/auth/login",
    Component: AuthLogin,
  },
  // ... 残りのルートもすべて手動で定義
] satisfies RouteConfig;
```

**`flatRoutes()`を使うメリット：**

- ✅ 新しいルートを追加する際、ファイルを追加するだけで自動認識される
- ✅ ルート定義の重複やミスを防げる
- ✅ ファイル構造とルートが一致し、直感的で管理しやすい
- ✅ 大規模なアプリケーションでも保守性が高い

**手動定義のデメリット：**

- ❌ 新しいルートを追加するたびに`routes.ts`を編集する必要がある
- ❌ ルートが増えると管理が煩雑になる
- ❌ ファイルとルート定義の不一致が発生しやすい
- ❌ インポート文が増えてコードが長くなる

### app/servers/

サーバーサイドでのみ行いたいロジックや処理を格納する

- **db.server.ts**: Prismaクライアントの初期化とデータベース操作ヘルパー
- **delivery-calculator.server.ts**: 配送予定日計算のビジネスロジック
  - 純粋なビジネスロジック層（HTTPリクエスト/レスポンスとは無関係）
  - `calculateDeliveryDate()`関数: ショップ、都道府県、注文日から配送予定日を計算
  - データベースから設定（発送準備日数、地域別配送日数、休業日、祝日）を取得して計算
  - 営業日ベースの日付計算（休業日・祝日をスキップ）
  - 他の場所（API、管理画面、バッチ処理など）から再利用可能
- **entry.server.tsx**: サーバーサイドエントリーポイント
- **error.server.tsx**: エラーハンドリング
- **shopify.server.ts**: Shopify APIクライアントの設定と認証処理

**`delivery-calculator.server.ts`と`api.calculate-delivery.tsx`の使い分け：**

- **`delivery-calculator.server.ts`**: ビジネスロジック層
  - 配送予定日計算のコアロジックを実装
  - HTTPリクエストやレスポンスとは無関係な純粋な関数
  - 再利用可能で、テストしやすい設計

- **`api.calculate-delivery.tsx`**: プレゼンテーション層（HTTP API）
  - HTTPリクエストを受け取り、JSONレスポンスを返す
  - 認証、パラメータバリデーション、エラーハンドリングを担当
  - `delivery-calculator.server.ts`の関数を呼び出して計算を実行

この分離により、計算ロジックは他の場所（管理画面のコンポーネント、バッチ処理、顧客向けAPIなど）からも再利用できます。

### app/root.tsx

React Router v7のルートコンポーネント。アプリケーション全体のHTML構造を定義します。すべてのページで共通のHTMLテンプレートとして機能します。

**主な役割：**

- **HTML構造の定義**: `<html>`, `<head>`, `<body>`タグを定義
- **メタデータの設定**: 文字コード、ビューポート、Shopifyのフォント読み込みなど
- **`<Meta />`**: React Routerが各ルートから設定されたメタデータ（`<title>`, `<meta>`タグなど）を挿入
- **`<Links />`**: React Routerが各ルートから設定されたCSSリンクを挿入
- **`<Outlet />`**: 現在のルートにマッチしたページコンポーネントがレンダリングされる場所
- **`<ScrollRestoration />`**: ページ遷移時のスクロール位置を復元
- **`<Scripts />`**: React Routerが必要なJavaScriptバンドルを挿入

すべてのページはこの`root.tsx`をベースにレンダリングされ、`<Outlet />`の部分に各ルートのコンポーネント（`app.tsx`、`auth.login/route.tsx`など）が表示されます。

## extensions/ - Shopify App Extensions

Shopifyストアフロントに表示する拡張機能（Theme App Extension、Checkout Extensionなど）

### extensions/delivery-date-display/

配送予定日表示拡張機能

- **assets/**: 静的アセット（画像、CSSなど）
- **blocks/**: Liquidブロックテンプレート
- **locales/**: 多言語対応ファイル
- **snippets/**: Liquidスニペット
- **shopify.extension.toml**: Shopify の拡張機能（App block / App embed / Admin 拡張 etc）のメタ情報を入れるファイル

実装方法は[公式docs](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration)を参照

## prisma/ - データベース

Prismaスキーマとマイグレーションファイル

- **schema.prisma**: データベーススキーマ定義
- **migrations/**: データベースマイグレーションファイル
- **dev.sqlite**: 開発環境用SQLiteデータベースファイル

## docs/ - ドキュメント

- **README.md**: プロジェクトの概要、要件、実装状況
- **directory-structure.md**: このファイル（ディレクトリ構造の説明）
- **init-setup.md**: 初期セットアップ手順

## public/ - 静的ファイル

- **favicon.ico**: ファビコン

## 設定ファイル

### package.json

プロジェクトの依存関係とnpmスクリプト

- `dev`: 開発サーバー起動
- `build`: プロダクションビルド
- `deploy`: Shopify Appデプロイ
- `db:migrate`: データベースマイグレーション実行
- `typecheck`: TypeScript型チェック

### shopify.app.toml

Shopify Appの設定（アプリ名、スコープ、Webhook設定など）

### shopify.web.toml

Shopify Web設定

### vite.config.ts

Viteビルドツールの設定

### tsconfig.json

TypeScriptコンパイラの設定

### Dockerfile

Dockerコンテナのビルド設定（本番環境デプロイ用）

## 技術スタック

- **フレームワーク**: React Router v7
- **UIライブラリ**: React 18
- **Shopify統合**: @shopify/shopify-app-react-router, @shopify/app-bridge-react
- **データベース**: Prisma + SQLite（開発環境）
- **ビルドツール**: Vite
- **言語**: TypeScript
