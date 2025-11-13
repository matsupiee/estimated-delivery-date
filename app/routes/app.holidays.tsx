import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../servers/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { prisma } from "app/servers/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // 休業日を取得
  const nonShippingDays = await prisma.nonShippingDay.findMany({
    where: { shop },
    orderBy: { date: "asc" },
  });

  return {
    nonShippingDays: nonShippingDays.map((day) => ({
      id: day.id,
      date: day.date.toISOString(),
      reason: day.reason,
      dayOfWeek: day.dayOfWeek,
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "setWeeklyHolidays") {
    // 定期休業日を設定
    const saturday = formData.get("saturday") === "true";
    const sunday = formData.get("sunday") === "true";

    // 既存の定期休業日を削除
    await prisma.nonShippingDay.deleteMany({
      where: {
        shop,
        dayOfWeek: { not: null },
      },
    });

    // 新しい定期休業日を作成
    const holidays = [];
    if (saturday) {
      holidays.push({
        shop,
        date: new Date("2025-01-01"), // ダミー日付
        dayOfWeek: 6,
        reason: "定休日（土曜日）",
      });
    }
    if (sunday) {
      holidays.push({
        shop,
        date: new Date("2025-01-01"), // ダミー日付
        dayOfWeek: 0,
        reason: "定休日（日曜日）",
      });
    }

    if (holidays.length > 0) {
      await prisma.nonShippingDay.createMany({
        data: holidays,
      });
    }

    return { success: true, message: "定期休業日を保存しました" };
  }

  if (actionType === "addCustomHoliday") {
    // カスタム休業日を追加
    const date = new Date(formData.get("date") as string);
    const reason = formData.get("reason") as string;

    await prisma.nonShippingDay.create({
      data: {
        shop,
        date,
        reason,
        dayOfWeek: null,
      },
    });

    return { success: true, message: "休業日を追加しました" };
  }

  if (actionType === "deleteHoliday") {
    // 休業日を削除
    const id = formData.get("id") as string;

    await prisma.nonShippingDay.delete({
      where: { id },
    });

    return { success: true, message: "休業日を削除しました" };
  }

  if (actionType === "importJapaneseHolidays") {
    // 日本の祝日を一括登録（2025年分）
    const holidays2025 = [
      { date: new Date("2025-01-01"), name: "元日" },
      { date: new Date("2025-01-13"), name: "成人の日" },
      { date: new Date("2025-02-11"), name: "建国記念の日" },
      { date: new Date("2025-02-23"), name: "天皇誕生日" },
      { date: new Date("2025-03-20"), name: "春分の日" },
      { date: new Date("2025-04-29"), name: "昭和の日" },
      { date: new Date("2025-05-03"), name: "憲法記念日" },
      { date: new Date("2025-05-04"), name: "みどりの日" },
      { date: new Date("2025-05-05"), name: "こどもの日" },
      { date: new Date("2025-07-21"), name: "海の日" },
      { date: new Date("2025-08-11"), name: "山の日" },
      { date: new Date("2025-09-15"), name: "敬老の日" },
      { date: new Date("2025-09-23"), name: "秋分の日" },
      { date: new Date("2025-10-13"), name: "スポーツの日" },
      { date: new Date("2025-11-03"), name: "文化の日" },
      { date: new Date("2025-11-23"), name: "勤労感謝の日" },
    ];

    // Holidayテーブルに登録
    await Promise.all(
      holidays2025.map((holiday) =>
        prisma.holiday.upsert({
          where: { country_date: { country: "Japan", date: holiday.date } },
          create: {
            country: "Japan",
            date: holiday.date,
            name: holiday.name,
            year: 2025,
          },
          update: {
            name: holiday.name,
          },
        })
      )
    );

    return { success: true, message: "2025年の祝日を登録しました" };
  }

  return { success: false };
};

export default function Holidays() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [saturday, setSaturday] = useState(false);
  const [sunday, setSunday] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");

  // 定期休業日の初期値を設定
  useEffect(() => {
    const hasSaturday = loaderData.nonShippingDays.some(
      (day) => day.dayOfWeek === 6
    );
    const hasSunday = loaderData.nonShippingDays.some(
      (day) => day.dayOfWeek === 0
    );
    setSaturday(hasSaturday);
    setSunday(hasSunday);
  }, [loaderData.nonShippingDays]);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message || "保存しました");
    }
  }, [fetcher.data, shopify]);

  const handleSaveWeeklyHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "setWeeklyHolidays");
    formData.append("saturday", saturday.toString());
    formData.append("sunday", sunday.toString());
    fetcher.submit(formData, { method: "POST" });
  };

  const handleAddCustomHoliday = () => {
    if (!customDate) {
      shopify.toast.show("日付を入力してください", { isError: true });
      return;
    }

    const formData = new FormData();
    formData.append("actionType", "addCustomHoliday");
    formData.append("date", customDate);
    formData.append("reason", customReason || "臨時休業");
    fetcher.submit(formData, { method: "POST" });

    setCustomDate("");
    setCustomReason("");
  };

  const handleDeleteHoliday = (id: string) => {
    const formData = new FormData();
    formData.append("actionType", "deleteHoliday");
    formData.append("id", id);
    fetcher.submit(formData, { method: "POST" });
  };

  const handleImportJapaneseHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "importJapaneseHolidays");
    fetcher.submit(formData, { method: "POST" });
  };

  // カスタム休業日のみを抽出
  const customHolidays = loaderData.nonShippingDays.filter(
    (day) => day.dayOfWeek === null
  );

  return (
    <s-page heading="休業日設定">
      <s-section heading="定期休業日">
        <s-stack direction="block" gap="base">
          <s-paragraph>毎週の定休日を設定してください。</s-paragraph>

          <s-stack direction="block" gap="small">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={saturday}
                onChange={(e) => setSaturday(e.target.checked)}
              />
              <span>土曜日</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={sunday}
                onChange={(e) => setSunday(e.target.checked)}
              />
              <span>日曜日</span>
            </label>
          </s-stack>

          <s-button onClick={handleSaveWeeklyHolidays}>
            定期休業日を保存
          </s-button>
        </s-stack>
      </s-section>

      <s-section heading="祝日">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            日本の祝日を一括で登録できます。配送予定日の計算時に自動でスキップされます。
          </s-paragraph>

          <s-button onClick={handleImportJapaneseHolidays} variant="secondary">
            2025年の祝日を一括登録
          </s-button>
        </s-stack>
      </s-section>

      <s-section heading="カスタム休業日">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            夏季休業や臨時休業など、特定の日を休業日として追加できます。
          </s-paragraph>

          <s-stack direction="inline" gap="base">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="理由（例: 夏季休業）"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "200px",
              }}
            />
            <s-button onClick={handleAddCustomHoliday}>追加</s-button>
          </s-stack>

          {customHolidays.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #ddd",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>日付</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>理由</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customHolidays.map((holiday) => (
                    <tr key={holiday.id} style={{ borderTop: "1px solid #ddd" }}>
                      <td style={{ padding: "8px" }}>
                        {new Date(holiday.date).toLocaleDateString("ja-JP")}
                      </td>
                      <td style={{ padding: "8px" }}>{holiday.reason}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <s-button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          variant="tertiary"
                        >
                          削除
                        </s-button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
