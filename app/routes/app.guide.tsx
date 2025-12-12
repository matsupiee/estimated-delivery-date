import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "app/servers/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  return {
    shop
  };
};

export default function Guide() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <s-page heading="初期設定ガイド">
      <div
        style={{
          maxWidth: "1080px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          marginTop: "20px",
        }}
      >
        {/* イントロダクション */}
        <div
          style={{
            background: "linear-gradient(120deg, #0c3c60, #1f6f7e 55%, #35b0a6)",
            color: "#f6f9fb",
            borderRadius: "16px",
            padding: "28px 32px",
            boxShadow: "0 12px 30px rgba(8, 40, 64, 0.18)",
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            ガイド
          </div>
          <div style={{ fontSize: "15px", opacity: 0.95, lineHeight: 1.6 }}>
            このアプリを使用するには、配送設定を行い、テーマにアプリブロックを追加する必要があります。
            以下の手順に従って設定を完了してください。
          </div>
        </div>

        {/* 1. 配送設定 */}
        <s-section heading="1. 配送設定">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <s-paragraph>
              配送予定日を正確に計算するために、まず配送設定を行います。
            </s-paragraph>

            <div
              style={{
                background: "#f6f9fb",
                border: "1px solid #dfe3e8",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                設定が必要な項目
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                <li>
                  <strong>発送準備日数</strong>: 注文を受けてから発送までにかかる日数（同日発送の場合は締め時間も設定可能）
                </li>
                <li>
                  <strong>地域別配送日数</strong>: 都道府県ごとの配送にかかる日数を設定（例：東京都は1日、北海道は3日など）
                </li>
                <li>
                  <strong>休業日設定</strong>: 定期休業日（曜日）とカスタム休業日（祝日・臨時休業）を設定
                </li>
              </ul>

              <div style={{ marginTop: "20px" }}>
                <Link
                  to="/app/settings"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "#008060",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  配送設定を開く
                </Link>
              </div>
            </div>
          </div>
        </s-section>

        {/* 2. テーマエディタからアプリブロックを追加 */}
        <s-section heading="2. テーマエディタからアプリブロックを追加する">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <s-paragraph>
              テーマエディタからアプリブロックを追加することで、ストアフロントに配送予定日を表示できます。
              コードを編集する必要がなく、最も簡単な方法です。
            </s-paragraph>

            <div
              style={{
                background: "#f6f9fb",
                border: "1px solid #dfe3e8",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                ステップ1: テーマエディタを開く
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
                以下のボタンをクリックして、テーマエディタを開いてください。
              </div>
              <div>
                <a
                  href={`https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}/themes/current/editor`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "#008060",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  テーマエディタを開く
                </a>
              </div>

              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                  ステップ2: アプリブロックを追加
                </div>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  <li>テーマエディタで、配送予定日を表示したいセクションを選択（例：商品ページ、ホームページ）</li>
                  <li>左サイドバーの「アプリとセールスチャネル」セクションを開く</li>
                  <li>「Estimated Delivery Date」アプリを選択</li>
                  <li>使用したいブロックを選択：
                    <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                      <li>配送予定バッジ</li>
                      <li>配送予定 - シンプルテキスト</li>
                      <li>配送予定 - アイコン付き</li>
                      <li>配送予定 - ミニマル</li>
                    </ul>
                  </li>
                  <li>ドラッグ&ドロップでブロックを希望の位置に配置</li>
                  <li>「保存」をクリックして変更を適用</li>
                </ol>
              </div>
            </div>
          </div>
        </s-section>

        {/* 3. トラブルシューティング */}
        <s-section heading="3. トラブルシューティング">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                background: "#f6f9fb",
                border: "1px solid #dfe3e8",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                配送予定日が表示されない場合
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                <li>アプリの設定を確認してください（<Link to="/app/settings" style={{ color: "#008060" }}>設定ページ</Link>）</li>
                <li>発送準備日数が設定されているか確認</li>
                <li>地域別配送日数が設定されているか確認</li>
                <li>ブラウザの開発者ツール（F12）でエラーメッセージを確認</li>
              </ul>
            </div>

            <div
              style={{
                background: "#f6f9fb",
                border: "1px solid #dfe3e8",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
                アプリブロックが表示されない場合
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                <li>アプリがインストールされているか確認（Shopify管理画面の「アプリとセールスチャネル」）</li>
                <li>Shopify 2.0テーマ（Dawn、Craftなど）を使用しているか確認</li>
                <li>古いテーマ（1.0）の場合は、テーマをアップグレードするか、Shopifyサポートにお問い合わせください</li>
              </ul>
            </div>
          </div>
        </s-section>

        {/* ナビゲーション */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            paddingTop: "24px",
            borderTop: "1px solid #dfe3e8",
          }}
        >
          <Link
            to="/app"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "#008060",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            ホームに戻る
          </Link>
          <Link
            to="/app/settings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "#ffffff",
              color: "#008060",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "14px",
              border: "1px solid #008060",
            }}
          >
            設定を開く
          </Link>
        </div>
      </div>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
