import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../servers/shopify.server";
import { calculateDeliveryDate } from "../servers/delivery-calculator.server";
import { formatJapaneseDate } from "app/lib/format-date";

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
