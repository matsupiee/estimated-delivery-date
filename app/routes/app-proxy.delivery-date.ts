import { formatJapaneseDate } from "app/lib/format-date";
import { getClientIP } from "app/servers/ip.server";
import { authenticate } from "app/servers/shopify.server";
import { getPrefectureFromIP } from "app/servers/ip-geolocation.server";
import { calculateDeliveryDate } from "app/servers/delivery-calculator.server";
import { LoaderFunctionArgs } from "react-router";

/**
 * App Proxy経由で配送予定日を取得するエンドポイント
 * Shopifyのドメイン経由でアクセスされる: https://{shop}.myshopify.com/apps/delivery-date
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log({ test: "----------10000000---------" });

  // リクエスト認証を行う(HMAC署名を含む)
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "shop パラメータが必要です" },
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // 1. リクエストからIPアドレスを取得
    const clientIP = getClientIP(request);

    // 2. IPアドレスから都道府県を推定
    const prefecture = await getPrefectureFromIP(clientIP || undefined);

    if (!prefecture) {
      return Response.json(
        {
          error: "地域を特定できませんでした",
          message:
            "IPアドレスから地域を特定できませんでした。日本国内からアクセスしているか確認してください。",
        },
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. 配送予定日を計算
    const { date: deliveryDate, error } = await calculateDeliveryDate(
      shop,
      prefecture,
    );

    if (!deliveryDate || error) {
      console.error("配送予定日計算エラー:", error);
      return Response.json(
        {
          error: error || "配送設定が未登録です",
          message: error || "このショップの配送設定が見つかりませんでした。",
        },
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    return Response.json(
      {
        deliveryDate: deliveryDate.toISOString(),
        formattedDate: formatJapaneseDate(deliveryDate),
        prefecture,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // 5分間キャッシュ
        },
      },
    );
  } catch (error) {
    console.error("配送予定日計算エラー:", error);
    return Response.json(
      {
        error: "配送予定日の計算に失敗しました",
        message:
          "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
      },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
