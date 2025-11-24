import { useState } from "react";

type NonShippingDay = {
  id: string;
  date: string;
  reason: string | null;
  dayOfWeek: number | null;
};

type Shopify = {
  toast: {
    show: (message: string, options?: { isError?: boolean }) => void;
  };
};

type HolidaySettingsSectionProps = {
  nonShippingDays: NonShippingDay[];
  shopify: Shopify;
  onSubmit: (formData: FormData) => void;
};

export function HolidaySettingsSection({
  nonShippingDays,
  shopify,
  onSubmit,
}: HolidaySettingsSectionProps) {
  const [saturday, setSaturday] = useState(() =>
    nonShippingDays.some((day) => day.dayOfWeek === 6)
  );
  const [sunday, setSunday] = useState(() =>
    nonShippingDays.some((day) => day.dayOfWeek === 0)
  );
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleSaveWeeklyHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "setWeeklyHolidays");
    formData.append("saturday", saturday.toString());
    formData.append("sunday", sunday.toString());
    onSubmit(formData);
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
    onSubmit(formData);
    setCustomDate("");
    setCustomReason("");
  };

  const handleDeleteHoliday = (id: string) => {
    const formData = new FormData();
    formData.append("actionType", "deleteHoliday");
    formData.append("id", id);
    onSubmit(formData);
  };

  const handleImportJapaneseHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "importJapaneseHolidays");
    onSubmit(formData);
  };

  const customHolidays = nonShippingDays.filter(
    (day) => day.dayOfWeek === null
  );

  return (
    <s-stack direction="block" gap="large">
      {/* 定期休業日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>定期休業日</h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>毎週の定休日を設定してください。</s-paragraph>

          <s-stack direction="block" gap="small">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={saturday}
                onChange={(e) => setSaturday(e.target.checked)}
              />
              <span>土曜日</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
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
      </div>

      {/* 祝日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>祝日</h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            日本の祝日を一括で登録できます。配送予定日の計算時に自動でスキップされます。
          </s-paragraph>

          <s-button onClick={handleImportJapaneseHolidays} variant="secondary">
            2025年の祝日を一括登録
          </s-button>
        </s-stack>
      </div>

      {/* カスタム休業日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
          カスタム休業日
        </h3>
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
                    <th style={{ padding: "8px", textAlign: "center" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {customHolidays.map((holiday) => (
                    <tr
                      key={holiday.id}
                      style={{ borderTop: "1px solid #ddd" }}
                    >
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
      </div>
    </s-stack>
  );
}
