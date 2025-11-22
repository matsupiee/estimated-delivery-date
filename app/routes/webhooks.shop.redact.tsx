import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../servers/shopify.server";
import { prisma } from "../servers/db.server";

/**
 * GDPR: ショップデータ削除リクエスト
 * ストアがアプリをアンインストールしてから48時間後に呼ばれる
 * 該当ストアに関連する全データを削除する
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("Shop redact payload:", JSON.stringify(payload));

  // 該当ストアの全データを削除
  await Promise.all([
    // セッション情報
    prisma.session.deleteMany({ where: { shop } }),
    // 発送設定
    prisma.shippingConfig.deleteMany({ where: { shop } }),
    // 地域別配送日数
    prisma.regionalShippingTime.deleteMany({ where: { shop } }),
    // 発送休業日
    prisma.nonShippingDay.deleteMany({ where: { shop } }),
  ]);

  console.log(`Deleted all data for shop: ${shop}`);

  return new Response();
};
