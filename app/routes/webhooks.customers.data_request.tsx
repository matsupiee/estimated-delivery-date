import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../servers/shopify.server";

/**
 * GDPR: 顧客データ開示リクエスト
 * 顧客が自分のデータの開示を要求した際に呼ばれる
 * このアプリは顧客の個人データを保存していないため、空レスポンスを返す
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("Customer data request payload:", JSON.stringify(payload));

  // このアプリは顧客の個人データを保存していないため、
  // 特別な処理は不要
  // 顧客データを保存している場合は、ここでデータを収集してストアオーナーに送信する

  return new Response();
};
