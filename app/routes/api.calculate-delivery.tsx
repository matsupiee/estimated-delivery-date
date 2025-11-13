import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { calculateDeliveryDate } from "../lib/delivery-calculator";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const prefecture = url.searchParams.get("prefecture");

  if (!prefecture) {
    return Response.json(
      { error: "都道府県が指定されていません" },
      { status: 400 }
    );
  }

  try {
    const deliveryDate = await calculateDeliveryDate(shop, prefecture);

    if (!deliveryDate) {
      return Response.json(
        { error: "配送設定が未登録です" },
        { status: 404 }
      );
    }

    return Response.json({
      deliveryDate: deliveryDate.toISOString(),
      formattedDate: formatJapaneseDate(deliveryDate),
    });
  } catch (error) {
    console.error("配送予定日計算エラー:", error);
    return Response.json(
      { error: "配送予定日の計算に失敗しました" },
      { status: 500 }
    );
  }
};

/**
 * 日付を日本語形式にフォーマット
 * 例: 2025-11-20 → "11月20日（木）"
 */
function formatJapaneseDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  return `${month}月${day}日（${dayOfWeek}）`;
}
