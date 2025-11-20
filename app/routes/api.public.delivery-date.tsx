import type { LoaderFunctionArgs } from "react-router";
import { calculateDeliveryDate } from "../servers/delivery-calculator.server";
import { formatJapaneseDate } from "app/lib/format-date";
import {
  getPrefectureFromIP,
} from "../servers/ip-geolocation.server";
import { getClientIP } from "app/servers/ip.server";

/**
 * 顧客向け公開API: IPアドレスから配送予定日を取得
 * 認証不要で呼び出せるエンドポイント
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "shop パラメータが必要です" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Content-Type": "application/json",
        },
      },
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
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 3. 配送予定日を計算
    const { date: deliveryDate, error } = await calculateDeliveryDate(shop, prefecture);

    if (!deliveryDate || error) {
      console.error("配送予定日計算エラー:", error);
      return Response.json(
        {
          error: error || "配送設定が未登録です",
          message: error || "このショップの配送設定が見つかりませんでした。",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Content-Type": "application/json",
          },
        },
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
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        message: "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Content-Type": "application/json",
        },
      },
    );
  }
};

// CORS プリフライトリクエスト対応
export const action = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
