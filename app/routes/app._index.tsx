import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../servers/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { prisma } from "app/servers/db.server";
import { calculateDeliveryDate } from "app/servers/delivery-calculator.server";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

// プレビュー用のサンプル都道府県
const SAMPLE_PREFECTURES = ["東京都", "大阪府", "北海道", "沖縄県"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // 設定を取得
  const config = await prisma.shippingConfig.findUnique({
    where: { shop },
  });

  // 定期休業日を取得
  const weeklyNonShippingDays = await prisma.weeklyNonShippingDay.findMany({
    where: { shop },
  });

  // カスタム休業日の件数を取得
  const customNonShippingDaysCount = await prisma.customNonShippingDay.count({
    where: { shop },
  });

  // 地域別配送日数を取得
  const regionalTimes = await prisma.regionalShippingTime.findMany({
    where: { shop },
  });

  // プレビュー計算
  const previews = await Promise.all(
    SAMPLE_PREFECTURES.map(async (prefecture) => {
      const result = await calculateDeliveryDate(shop, prefecture, new Date());
      return {
        prefecture,
        date: result.date ? result.date.toISOString() : null,
        error: result.error,
      };
    })
  );

  return {
    preparationDays: config?.preparationDays ?? null,
    weeklyNonShippingDays: weeklyNonShippingDays.map((d) => d.dayOfWeek),
    customNonShippingDaysCount,
    regionalTimesCount: regionalTimes.length,
    previews,
  };
};

export default function Index() {
  const {
    preparationDays,
    weeklyNonShippingDays,
    customNonShippingDaysCount,
    regionalTimesCount,
    previews,
  } = useLoaderData<typeof loader>();

  const hasBasicSettings = preparationDays !== null;
  const hasRegionalSettings = regionalTimesCount > 0;
  const isConfigured = hasBasicSettings && hasRegionalSettings;

  // 定期休業日を曜日名に変換
  const weeklyHolidayNames = weeklyNonShippingDays
    .sort((a, b) => a - b)
    .map((day) => DAY_NAMES[day] + "曜日")
    .join("、");

  return (
    <s-page heading="配送予定日計算">
      <s-button slot="primary-action" href="/app/settings">
        設定
      </s-button>

      <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "32px", marginTop: "24px" }}>
        {/* 設定状況 */}
        <s-section heading="現在の設定">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* 準備日数 */}
            <div
              style={{
                padding: "16px",
                background: hasBasicSettings ? "#e3f1df" : "#fbeae5",
                borderRadius: "8px",
                border: `1px solid ${hasBasicSettings ? "#008060" : "#d72c0d"}`,
              }}
            >
              <div
                style={{ fontSize: "13px", color: "#6d7175", marginBottom: "4px" }}
              >
                準備日数
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>
                {hasBasicSettings ? `${preparationDays}日` : "未設定"}
              </div>
            </div>

             {/* 地域別設定 */}
             <div
              style={{
                padding: "16px",
                background: hasRegionalSettings ? "#e3f1df" : "#fbeae5",
                borderRadius: "8px",
                border: `1px solid ${hasRegionalSettings ? "#008060" : "#d72c0d"}`,
              }}
            >
              <div
                style={{ fontSize: "13px", color: "#6d7175", marginBottom: "4px" }}
              >
                地域別配送日数
              </div>
              <div style={{ fontSize: "16px", fontWeight: 500 }}>
                {hasRegionalSettings ? "設定済み ✓" : "未設定"}
              </div>
            </div>

            {/* 定期休業日 */}
            <div
              style={{
                padding: "16px",
                background: "#f6f6f7",
                borderRadius: "8px",
                border: "1px solid #e1e3e5",
              }}
            >
              <div
                style={{ fontSize: "13px", color: "#6d7175", marginBottom: "4px" }}
              >
                定期休業日
              </div>
              <div style={{ fontSize: "16px", fontWeight: 500 }}>
                {weeklyNonShippingDays.length > 0 ? weeklyHolidayNames : "なし"}
              </div>
            </div>

            {/* カスタム休業日 */}
            <div
              style={{
                padding: "16px",
                background: "#f6f6f7",
                borderRadius: "8px",
                border: "1px solid #e1e3e5",
              }}
            >
              <div
                style={{ fontSize: "13px", color: "#6d7175", marginBottom: "4px" }}
              >
                カスタム休業日
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>
                {customNonShippingDaysCount}件
              </div>
            </div>
          </div>

          {!isConfigured && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "#fbeae5",
                borderRadius: "8px",
                color: "#d72c0d",
                fontSize: "14px",
              }}
            >
              ⚠️ 配送予定日を計算するには、準備日数と地域別配送日数の設定が必要です。
            </div>
          )}
        </s-section>

        {/* プレビュー */}
        <s-section heading="配送予定日プレビュー">
          <s-paragraph>
            今日（{formatDate(new Date())}）に注文した場合の配送予定日です。
          </s-paragraph>

          <div style={{ marginTop: "16px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #e1e3e5",
              }}
            >
              <thead>
                <tr style={{ background: "#f6f6f7" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    配送先
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    配送予定日
                  </th>
                </tr>
              </thead>
              <tbody>
                {previews.map((preview) => (
                  <tr
                    key={preview.prefecture}
                    style={{ borderTop: "1px solid #e1e3e5" }}
                  >
                    <td style={{ padding: "12px 16px" }}>{preview.prefecture}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {!isConfigured ? (
                        <span style={{ color: "#6d7175" }}>-</span>
                      ) : preview.date ? (
                        <span style={{ fontWeight: 500, color: "#008060" }}>
                          {formatDate(new Date(preview.date))}
                        </span>
                      ) : (
                        <span style={{ color: "#6d7175" }}>
                          {preview.error || "計算できません"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isConfigured && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "#e3f1df",
                borderRadius: "8px",
                color: "#008060",
                fontSize: "14px",
              }}
            >
              ✓ 設定が完了しています。ストアで配送予定日が表示されます。
            </div>
          )}
        </s-section>
      </div>
    </s-page>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_NAMES[date.getDay()];
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
