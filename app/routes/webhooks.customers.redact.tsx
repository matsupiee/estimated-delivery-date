import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../servers/shopify.server";

/**
 * GDPR: 顧客データ削除リクエスト
 * 顧客がデータの削除を要求した際に呼ばれる
 * このアプリは顧客の個人データを保存していないため、空レスポンスを返す
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Received customers/redact webhook");
  
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("Customer redact payload:", JSON.stringify(payload));

  // このアプリは顧客の個人データを保存していないため、
  // 特別な処理は不要
  // 顧客データを保存している場合は、ここで該当顧客のデータを削除する

  return new Response();
};
