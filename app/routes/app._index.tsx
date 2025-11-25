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
      <div
        style={{
          maxWidth: "1080px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(120deg, #0c3c60, #1f6f7e 55%, #35b0a6)",
            color: "#f6f9fb",
            borderRadius: "16px",
            padding: "22px 24px",
            boxShadow: "0 12px 30px rgba(8, 40, 64, 0.18)",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            alignItems: "center",
            gap: '100px'
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", opacity: 0.82, letterSpacing: "0.02em" }}>
              ストア配送オペレーション
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "4px" }}>
              正確な「お届け予定」を自動生成
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "10px" }}>
              仕込み日数、都道府県ごとの配送日数、定期・臨時休業を一括管理し、購入時にわかりやすいお届け予定日を提示します。
            </div>
          </div>
        </div>

        <div>
          <a
            href="/app/settings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fefefe, #eaf4ff)",
              color: "#0f2336",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 10px 25px rgba(8, 40, 64, 0.22)",
              border: "1px solid rgba(255,255,255,0.45)",
            }}
          >
            <span>設定を開く</span>
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "#0c3c60",
                color: "#fefefe",
                fontSize: "14px",
              }}
            >
              →
            </span>
          </a>
        </div>

        <s-section heading="設定サマリー">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "14px",
            }}
          >
            <InfoCard
              title="準備日数"
              value={hasBasicSettings ? `${preparationDays}日` : "未設定"}
              hint="入荷・梱包にかかる日数"
              tone={hasBasicSettings ? "positive" : "critical"}
            />
            <InfoCard
              title="地域別配送日数"
              value={hasRegionalSettings ? `設定済み` : "未設定"}
              hint="都道府県ごとの配送リードタイム"
              tone={hasRegionalSettings ? "positive" : "critical"}
            />
            <InfoCard
              title="定期休業日"
              value={weeklyNonShippingDays.length > 0 ? weeklyHolidayNames : "なし"}
              hint="毎週の非出荷日"
              tone="neutral"
            />
            <InfoCard
              title="カスタム休業日"
              value={`${customNonShippingDaysCount}件`}
              hint="季節要因や臨時休業"
              tone={customNonShippingDaysCount > 0 ? "neutral" : "subdued"}
            />
          </div>

          {!isConfigured && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                background: "#fff5f3",
                border: "1px solid #f5c5bb",
                borderRadius: "10px",
                color: "#b12b09",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>⚠️</span>
              <span>配送予定日を計算するには、準備日数と地域別配送日数の設定が必要です。</span>
            </div>
          )}
        </s-section>

        <s-section heading="配送予定日プレビュー">
          <s-paragraph>
            今日（{formatDate(new Date())}）に注文した場合の配送予定日です。
          </s-paragraph>

          <div
            style={{
              marginTop: "14px",
              border: "1px solid #dfe3e8",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(17, 34, 51, 0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#4a5560" }}>
                    配送先
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#4a5560" }}>
                    配送予定日
                  </th>
                </tr>
              </thead>
              <tbody>
                {previews.map((preview, index) => (
                  <tr
                    key={preview.prefecture}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#f9fbfd",
                      borderTop: "1px solid #e5e8eb",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {preview.prefecture}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {!isConfigured ? (
                        <span style={{ color: "#8a8f98" }}>-</span>
                      ) : preview.date ? (
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#0a5f5a",
                            background: "#e6f4f2",
                            padding: "6px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          {formatDate(new Date(preview.date))}
                        </span>
                      ) : (
                        <span style={{ color: "#8a8f98" }}>
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
                marginTop: "14px",
                padding: "12px 14px",
                background: "#e7f4ec",
                borderRadius: "10px",
                color: "#0f5132",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>✓</span>
              <span>設定が完了しています。ストアで配送予定日が表示されます。</span>
            </div>
          )}
        </s-section>
      </div>
    </s-page>
  );
}

function InfoCard({
  title,
  value,
  hint,
  tone = "neutral",
}: {
  title: string;
  value: string;
  hint: string;
  tone?: "positive" | "critical" | "neutral" | "subdued";
}) {
  const tones = {
    positive: { border: "#b4e2c2", bg: "#f2fbf6" },
    critical: { border: "#f7c5bc", bg: "#fff6f3" },
    neutral: { border: "#dfe3e8", bg: "#f9fbfd" },
    subdued: { border: "#e5e8eb", bg: "#ffffff" },
  } as const;

  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "12px",
        border: `1px solid ${tones[tone].border}`,
        background: tones[tone].bg,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minHeight: "80px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#6a707a" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#8a8f98" }}>{hint}</div>
    </div>
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
