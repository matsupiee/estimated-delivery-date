import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../servers/shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heading}>
            配送予定日を自動表示して
            <br />
            <span className={styles.highlight}>購買率を向上</span>
          </h1>
          <p className={styles.text}>
            お客様の地域に合わせた正確な配送予定日を商品ページに表示。
            <br />
            「いつ届くの?」という不安を解消し、購入の決断をサポートします。
          </p>
        </div>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>ショップドメイン</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-shop.myshopify.com"
              />
            </label>
            <button className={styles.button} type="submit">
              無料で始める
            </button>
          </Form>
        )}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.icon}>📍</div>
            <h3 className={styles.featureTitle}>地域別の配送日数設定</h3>
            <p className={styles.featureText}>
              都道府県ごとに異なる配送日数を設定可能。お客様のIPアドレスから地域を自動判定し、最適な配送予定日を表示します。
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>📅</div>
            <h3 className={styles.featureTitle}>休業日・祝日の自動考慮</h3>
            <p className={styles.featureText}>
              土日祝日や店舗の休業日を登録することで、実際の営業日ベースで正確な配送予定日を計算します。
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>⚡</div>
            <h3 className={styles.featureTitle}>簡単セットアップ</h3>
            <p className={styles.featureText}>
              Theme App Extensionで商品ページに自動追加。コーディング不要で、すぐに配送予定日の表示を開始できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
